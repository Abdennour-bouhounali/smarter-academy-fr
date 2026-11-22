# Manipulation Contract — tactile mathematical laboratories

> One manipulation = one mathematical idea made **physical**. The student acts; the notation follows.
> Scope: `apps/web/src/lessons/common/manipulations/`. Types are registered in
> `packages/core/curriculum/manipulationTypes.js` (closed registry, no code from content).
>
> **Why** a manipulation is built this way — causality, interaction distance, resistance,
> contrast, the design sheet, anti-template rules — is `MANIPULATION_DNA.md`, which sits
> above this contract. This file says **how** it is built in code.

## 1. The five questions

No manipulation is written before these five are answered in its file header.

| | Question |
|---|---|
| **A** | What does the student physically manipulate? |
| **B** | What mathematical idea does that action represent? |
| **C** | What changes visually when they act? |
| **D** | What mathematical representation emerges from the action? |
| **E** | What must be discovered *before* the formal rule is shown? |

If a type cannot answer all five, it is a reveal button, not a manipulation. Redesign it.

## 2. Architecture

```
manipulations/
├── Manipulation.jsx            entry point: <Manipulation type="…" … />
├── manipulationRegistry.js     closed type → lazy component map
├── ManipulationShell.jsx       mission · progress · controls · stage · representation · discovery
├── ManipulationStage.jsx       the manipulation area (centre of the page)
├── ManipulationProgress.jsx    جرّب › اكتشف › صِغ  (+ « الخطوة n من N » only when a type
│                            passes `stepCount` — none does today, so it never renders)
├── ManipulationControls.jsx    student: إعادة · تلميح · [auto-complete] · تحقّق · الشرح
├── ManipulationAutoComplete.jsx the student's « compléter automatiquement » button + useAutoComplete (§6bis)
├── autoComplete.js             PURE decisions of that button: status, animation plan (unit-tested)
├── ManipulationTeacherMode.jsx class mode: step, replay, hide answer, show solution, change numbers
├── ManipulationHint.jsx        hints (never the answer) — CLOSED by default since 2026-10-14, « تلميح » shows them all (DNA §17.7)
├── ManipulationDiscovery.jsx   conjecture → formal rule (never before the action)
├── ManipulationFreeLab.jsx     مختبر حر (constrained) — NOT a level
├── ManipulationWorkspace.jsx   ONE workspace, two levels (مبتدئ / متقدم) — §7bis-levels
├── ManipulationLevelSelector.jsx  THE level selector: two tabs مبتدئ / متقدم (role=tablist, arrow keys, RTL-aware)
├── workspaceLevels.js          PURE decisions of the workspace (unit-tested)
├── workspaceContext.js         WorkspaceLevelContext — tells a manipulation it sits in a workspace
├── useManipulation.js          numbers · phase · hints · level · mode · epoch
├── useStepSequence.js          bounded step cursor
├── useDragInteraction.js       CARRY gesture: pointer drag + magnet + reject + edge auto-scroll + keyboard/tap
├── useStretchInteraction.js    STRETCH gesture: a magnitude that follows the finger (slider semantics, −/+); zoom-safe (see « Screen pixels vs layer pixels »)
├── levels.js                   the TWO levels per type { beginner, advanced } + resolveManipulationLevels (§7)
├── logic/                      PURE interaction logic per type (unit-tested, no React)
├── themeWords.js               the Arabic words of a theme (lesson.manipulation.json) merged with a lesson's `context`
├── primitives/                 shared building blocks, never duplicated by a type
│   ├── PlayerFigure.jsx + PitchBackdrop.jsx   a drawn footballer and a real-proportioned pitch (2:3)
│   ├── BookFigure.jsx                         `BOOK_PALETTE`, the cover tints shared by the labs that draw books
│   ├── ItemFigure.jsx + itemThemes.js         the drawn objects of the other worlds (flower, ball,
│   │                                          shirt, pen, notebook, spoon, cup) and which theme draws which
│   ├── GroupingScene.jsx + groupingLayout.js  a and b objects in k identical groups, the rest apart
│   ├── BrickWall.jsx + brickLayout.js         a length built in bricks of n (walls of lesson 3)
│   ├── RibbonStrip.jsx                        a length drawn as a notched ribbon (the tailor's workshop)
│   ├── DivisionRoles.jsx                      b · q · r named in the scene's words (partition vs quotition, §2ter)
│   ├── LabFold.jsx                            « إخفاء / إظهار » for a secondary block of a large lab (§8bis)
│   ├── LabKit.jsx                              the visual kit: PromptCard, ChoiceCard, StepperCard, NamePill, VerdictBanner… (§8ter)
│   ├── SvgPill.jsx                             value pills and dimensions inside a scene (§8ter)
│   ├── KidFigure.jsx + kidFigure.js            THE character: a drawn pupil, girls in hijab, crown = height (§8ter)
│   ├── FlowerFigure.jsx                        a flower, a bouquet sleeve and its ribbon tie (division-jumps)
│   ├── HopperFigure.jsx                        a drawn rabbit that hops on a number line (division-jumps)
│   ├── BulbFigure.jsx                          a light bulb lamp, closed / yes / no (digit-cards)
│   ├── CakeFigure.jsx                          a round cake seen from above `Cake` (sector slices, knife cuts, ghost) + `sectorPath` (fair-share, §2duovicies)
│   ├── EggFigure.jsx                           an egg, an open tray / carton with exactly r eggs, a closed lid, a full slat, a pallet (egg-trays, §2unvicies)
│   ├── MovablePanel.jsx + movablePanel.js     a panel floating on the scene that the student moves aside (§8bis)
│   └── ContextScenes.jsx                      the landscape vignettes of each world, for `MissionBrief.visual`
├── divisibility/               the 10 types of unit 1 (+ teamFormation.js, pure geometry)
├── roots/                      the 3 types of unit 2 « الحساب على الجذور » (2026-09-30) — §2quater
├── algebra/                    the 2 types of unit 3 « الحساب الحرفي » (2026-10-01) — §2quinquies
├── equations/                  the 4 types of unit 4 « معادلات ومتراجحات » (2026-10-01) — §2sexies
└── systems/                    the 3 types of unit 5 « جمل معادلتين » (2026-10-01) — §2septies
```

`divisibility/DivisorExplorerBooks.jsx` (`divisor-explorer-books`; until 2026-11-04 Module 1 of
`qasim-adad-tabii`, متقدم, and the 143 worked example of معارف — the owner then REPLACED it by the football
lab `team-builder` for the whole lesson, and no lesson uses it any more; the component is kept) is **the shelf the
student stretches** (redesigned 2026-09-30, `MANIPULATION_DNA.md` §7). Until then it was a
standalone component with 17 size buttons, its own styles, no hints and no discovery;
it now goes through `ManipulationShell` like the other types. The student drags the
**bookend** of a model shelf (`useStretchInteraction`, `role="slider"`; keyboard arrows,
−/+ buttons or a tap on the ruler do the same). The shelf length **is** b, and every shelf
takes it. The `total` books re-shelve **during** the gesture into q full shelves, and the r
that remain lie in a **ghost shelf** whose b − r dashed slots show what is missing. The
arithmetic and the geometry live in `logic/bookshelf.js`: `arrange` (core `groupBy`),
`commit` (a trial is validated on release or after a keyboard pause), the discovery
predicates, `counterExamples` and `bookcaseLayout`. Every book is drawn once, one spine per
book, and shelves are laid out in columns that fit the width, with no inner scroll box.
Props: `total`, `min`/`max` (the ruler), `marks` (the textbook's numbers, orientation only),
`discovery="remainder" | "symmetry"`, `levels={false}` for a worked example (§7). Its
contract with the module is `onVerdict({ b, divides, quotient, remainder })`, fired on each
validated trial through `state.report`, and `onFinished` on the formal phase. It stays a
consumer of the platform **Classroom Mode**: it is wrapped in `ClassroomPresentation
scope="manipulation"`, the entry button sits in the shell header (`headerAction`), and the
presentation layout puts the shelf and the bookcase side by side and sizes the book unit to a
measured height budget (`CLASSROOM_MODE.md` § Manipulation). The old grid solver
(`booksClassroomLayout.js`) was removed with the buttons.

**Rule:** a type composes primitives and calls `logic/`. It never re-implements a gesture, a
tile, a drop zone, or a piece of mathematics.

**One unit, one set of objects.** Types that share a lesson's story draw the *same* objects:
`divisor-explorer-books` shelves 420 books and `factor-pairs` lays the same books out as
rectangles, both coloured from `primitives/BookFigure.jsx`'s `BOOK_PALETTE`,
so the student recognises the library from one module to the next instead of learning a
second abstraction. (The palette was duplicated in the old standalone lab and locked by a
test; the duplication and the test are gone since 2026-09-30.)

## 2quater. The square-root laboratories (unit 2, 2026-09-30)

Unit 2 « الحساب على الجذور » needed mathematics no unit-1 type touches, so three types were added by
the §7ter recipe. All three use the **stretch** gesture (`useStretchInteraction`, `direction: 'ltr'`
because a length and a number line read left to right), compare squares **in integers** through
`packages/core/arithmetic/squareRoots.js` (never a float equality: a side is an integer `v` on a
graduation `1/scale`, and `v² × den` is compared to `num × scale²`), and are **manual** (§6bis — each
position is a trial or an answer). Pure logic: `logic/squareRootSide.js`, `logic/squareFold.js`,
`logic/squareTiling.js`, tested in `logic/squareLabs.test.js` on the textbook's numbers (sweeps
included). Strings: `lesson.manipulation.json › squareRoot | squareFold | squareTiling`; every formula
in a string is a `$…$` island, and the components render hints, options, notes and explanations
through `MathText`.

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `square-root-side` (`roots/SquareRootSide.jsx`) | the end of a square's side on a graduated ruler; the square grows on a unit grid beside the dashed target square | `refine`: « دقّق » (zoom the ruler ×10) opens only once the student has bracketed the side BY HAND at the current graduation; for 5 every graduation is too small or too big. `graduation`: a card « resists » after 3 graduations bracketed without a hit | `refine`: the side falls exactly (36 → 6) **or** the bracket reached 1/1000 with no hit (5) — the formal part names √5, shows `calculator`'s exact square (2,236067978² = 5,000000002…) and, with `figure="bc-square"`, the tilted square of area 9 − 4 × 1 = 5 on BC. `graduation`: one card exact **and** one resisting → « √a is rational ⇔ a is the square of a rational » | L1 (refine), L2 (graduation) |
| `square-fold` (`roots/SquareFold.jsx`) | x on a number line; an arrow carries it to x² on the line of squares, whose negative half is hatched | pinning a solution for a < 0 is refused (« x² لا يكون سالبًا »); a wrong x is refused with its exact square; « لا حل » for a ≥ 0 is refused. For √3 the nearest graduation is accepted and **√3** (not 1,7) is pinned — in the mission player (`init({ exactOnly })`, 2026-11-10) the nearest graduation is REFUSED (« 1,7² = 2,89 ≠ 3 — لا تدريجة تعطي 3 بالضبط »), the exact mark √3 appears between the ticks and the student pins it | a solved card with a > 0 (two pins), a = 0 (one) and a < 0 (« لا حل ») → the three cases of خاصية 2. Optional `table` fills the textbook's x ↦ x² table from the student's own positions | L3 |
| `square-tiling` (`roots/SquareTiling.jsx`) | k, the number of square tiles per side of a square of area n | k² ∤ n: the tiling is dashed and refused with `n ÷ k²` read exactly (72 ÷ 25 = 2,88) | `product`: two valid tilings with k > 1 and one refusal → √(k² × b) = √(k²) × √b = k√b. `simplest`: the largest k and another valid k → the largest square dividing n gives the smallest b. In the mission player (2026-11-10) a refusal is a large « ✗ مساحة البلاطة ليست عددًا طبيعيًا » with the quotient NOT reduced (« 98 ÷ 36 »), never a number of tiles | L4 (product), L5 (simplest) |

Props: see the component headers (the design sheet of `MANIPULATION_DNA.md` §7 is filled in each).
`square-root-side` and `square-tiling` report each validated trial through `onTrial` (via
`state.report`), so a module can list the student's own trials above a question (DNA §9).
`square-tiling` `simplest` needs, besides the largest valid k, either another valid k > 1 or — for a
number with a single non-trivial tiling (18, 8, 50) — a larger k tried and refused.
`square-root-side` posed ALONE in `graduation` mode has no second level (its `levels.js` pair is a
refine pair); in a workspace the lesson declares both levels as usual.

## 2quinquies. The algebra laboratories (unit 3, 2026-10-01)

Unit 3 « الحساب الحرفي » (expansion, identities, factorisation) needed a variable that is a LETTER:
two types were added by the §7ter recipe, one per direction of the same reading — a product of two
sums is the AREA of a rectangle whose sides are those sums (the textbook's own argument: the
squares MNPQ / KLMN p. 32–33, Descartes' table p. 31). The world is the **football pitch** (`theme:
'football'`, owner's choice for the unit): a rectangle the student reads as a pitch, never a bar.
Exact arithmetic: `packages/core/arithmetic/polynomials.js` (integer-coefficient terms `{c, p}`,
`partialProducts`, `reduce`, `expand`, `commonMonomial`; `polynomials.test.js` sweeps x ∈ [−20, 20]).
Pure logic: `logic/pitchExpansion.js`, `logic/turfFactoring.js`, tested in `logic/algebraLabs.test.js`
on the textbook's numbers (geometry swept over every x of the ruler: the signed zones always cover
exactly the pitch's area); `algebra/algebraLabs.render.test.jsx` renders every kind and mode.
Strings: `lesson.manipulation.json › pitchExpansion | turfFactoring`. Both are **manual** (§6bis —
each carried zone, merge, row count or strip placement is a decision).

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `pitch-expansion` (`algebra/PitchExpansion.jsx`) | **x** (stretch: the pitch grows, every zone follows); each ZONE (carry, from the pitch or from the Descartes table under it) into « المجموع »; a term onto a LIKE term (carry) to merge | unlike terms refuse to merge (« $x^2$ مساحة مربّع و $x$ مساحة شريط »); « تحقّق » compares the pitch's area with the carried sum FOR THE x ON SCREEN — a forgotten zone lights up with its area (the two $ab$ bands of the error $(a + b)^2 = a^2 + b^2$); opposite terms cancel | every zone carried, the sum reduced, the equality verified for **two values of x** → the identity holds for every value (متطابقة). Kind from `expr`: `distributive`, `double`, `square-sum`, `square-diff`, `sum-diff` | L1 (`3\|x+5`, `3x-1\|3+x`, `2x-1\|x+4`), L2 (squares and `x+3\|x-3`), synthesis (`x+10+x`, the pool) |
| `turf-factoring` (`algebra/TurfFactoring.jsx`) | `rows`: **r**, the number of IDENTICAL rows the turf pieces ($x^2$, $x$, 1, hatched when subtracted) are shared into (stretch). `square`: each STRIP (carry) to the right of or below the $x^2$ square, then « أغلق الملعب » | `rows`: pieces that cannot be shared fall OUTSIDE the pitch (r ∤ a coefficient). `square`: the corner needs right × bottom unit squares — « الركن يحتاج 8 ولديك 9 »; $x^2 + 25$ never closes | `rows`: the largest valid r (the gcd of the coefficients — the PGCD of unit 1) tried AND a refusal → $ka + kb = k(a + b)$, the pitch's height is the common factor. `square`: a SQUARE closed (p = q) and a refused split → $a^2 + 2ab + b^2 = (a + b)^2$; a sum that never closes → « لا تقبل تحليلا » | L3, synthesis |

`expr` syntax (`pitch-expansion`): two factors `"f1|f2"`, a single factor means its square; terms of
degree ≤ 1 with integer coefficients; a side may have three segments (`x+10+x`). Negative terms are
drawn as REMOVED (hatched) strips inside the positive length and a double-removed corner as RESTORED
(cross-hatched) — the textbook's figure of $(a - b)^2$. The ruler runs from the first x that draws both
sides (`x-2` starts at 3), runs `span` steps (prop, default 5, opening two steps in; L1's beginner uses 9 so x = 9 — the textbook's 3 × (9 + 5) — is reachable) and stops at the last drawable value (`5-2x` stops at 2); a factor positive for no x
throws (content error). `turf-factoring` `square` has no level selector of its own; `showNeed={false}`
hides the corner's live need for a more autonomous level. Both report each validated trial through
`onTrial` (via `state.report`), so a module can list the student's own trials above a question.

**Decorative layer (owner request, 2026-10-01).** Besides the mathematical gestures, the pitch carries
a deliberately DECORATIVE interaction: mowing stripes, goals and a ball the student may tap; the ball
rolls to the last carried zone and into the goal when an equality is verified. It carries no
information, is `aria-hidden`, outside the keyboard path (`tabIndex=-1`), never changes a lab state,
and is frozen by `prefers-reduced-motion`. This is the one sanctioned exception to « no decorative
interaction » (§9 checklist) — keep it confined to the drawn world, never on a mathematical object.

## 2sexies. The equation and inequality laboratories (unit 4, 2026-10-01)

Unit 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » added four types by the §7ter recipe, one per
concept, each holding a DIFFERENT variable and gesture (DNA §6: equality = balance, product = area, inequality =
move a boundary, modelling = two quantities growing). All four compute through ONE exact module,
`packages/core/arithmetic/linear.js` (fractions `{n, d}`, `linear('4x-3')`, `solveEquation`, `solveInequality`
with `flipped`, `applyBoth` refusing ×0, `factors('x-2|x+5')`, `productAt`; `linear.test.js` sweeps the
textbook's equations, inequalities and products), and live in `manipulations/equations/` with their logic in
`logic/<name>.js` + `logic/<name>.test.js` (their own test files) and a render test
`equations/<name>.render.test.jsx`. Strings: `lesson.manipulation.json › equationBalance | vanishingPitch |
solutionRay | growthRace`. All four are **manual** (§6bis — every gesture is a decision or an answer), report
validated trials through `onTrial` (via `state.report`), and carry the owner's decorative layer (below).

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `equation-balance` (`EquationBalance.jsx`) | the CONTENTS of the two pans of a drawn Roberval balance: closed bags (+x, hidden), footballs (+1), helium balloons (−1, floating), flying bags (−x) — carried from the reserve onto a pan or back (carry, tap-tap: touching an object of the target pan with a reserve piece held aims at that pan), then k, the number of equal groups per pan (stretch) | the beam tilts by the TRUE hidden x as soon as one pan changes; while it tilts only the same effect (or its undo) is accepted — « الميزان مال: ما فعلته بكفّة افعله بالأخرى »; carrying a piece straight across is refused (`moveAcross`, the « transposition without sign change » error made physical); k groups refused when bags do not share evenly (leftover bag drawn) or when units would have to be cut | a tilted state seen, the balance solved (one bag alone) AND the substitution check (« افتح الأكياس ») → « نجري العملية نفسها على الطرفين »; each both-sided step writes the textbook's line (`9x + 1 - 1 = -26 - 1`, « أي 9x = −27 »); fractional values drawn as ball sectors (9/2, −1/7) | L1 (`3x+2=11`, `9x+1=-26`; معارف `4x-3=2x+6`, `levels={false}`) |
| `vanishing-pitch` (`VanishingPitch.jsx`) | **x** on a ruler (stretch); the pitch's two SIGNED sides are the factors A and B drawn from a corner (a negative side goes past the corner, dashed, « ضلع سالب »; a negative area hatched); then « ثبّت هذا الحل » (pin) and « لا حلول أخرى » | a pin where the area is not 0 is refused with the area read exactly (`(−1) × 6 = −6 ≠ 0`); « لا حلول أخرى » refused while a zero is missing or the ruler has not been swept on both sides; the graduation is the LCM of the roots' denominators so every zero IS a graduation (no rounding) | a refused pin, every zero pinned and the claim accepted → $A \times B = 0 \iff A = 0$ أو $B = 0$; at مبتدئ the constant side 3 never collapses (one solution, « لأنّ 3 ≠ 0 »); `expr` = `f1\|f2`, a single factor = its square (one zero), decimals kept as decimals | L2 (`3\|x-5`, `x-2\|x+5`; معارف `3x-4\|-2x+1`, طرائق `2x+1`) |
| `solution-ray` (`SolutionRay.jsx`) | a PROBE x on a graduated line (stretch): the two sides shown live with the verdict, each validated position leaves a trace — RED when true (the textbook's colour for solutions), grey otherwise; then the BRACKET (second stretch track, side and « موجّه / غير موجّه نحو الجزء الملوّن »); at متقدم, transformation CARDS in the textbook's order and the relation of each new line | the bracket opens after one red and one grey trace and is refused with a witness number taken first from the student's own traces (`checkBracket`; on whole graduations x ≤ 2 and x < 3 coincide, so the witness may be 2,5); a new line whose direction is wrong is refused with a red trace (« نقاطك الحمراء على يمين −5 … ») — ÷(−3) kept as ≤ contradicts the student's own evidence | مبتدئ: the bracket rule (turned toward the red part ⇔ the bound is a solution); متقدم: one step keeping the direction and one negative scaling flipping it → « نغيّر الاتجاه عند الضرب أو القسمة على عدد سالب »; the invariant « equivalent lines keep exactly the same traces » is swept over 7 inequalities | L3 (`x<3`, `-3x+5<=20`; module 1 `2,5x+100<=150` in the phone context, whole x, `levels={false}`, no bracket stage) |
| `growth-race` (`GrowthRace.jsx`) | BUILD: « + x » / « × x » tokens carried onto each story element (people, price cards) — the expression of each side assembles live; RACE (opened by the student, §7quater, with a way back): **x** whole ≥ 0 on a timeline (stretch), the two quantities drawn as growing figures / stacked columns | « تحقّق » refuses a model contradicting the story, element by element, in the story's words (a child who did not age: MISC-TARRID-MAJHUL-WAHID; a per-session price paid once; the yearly card paid every session: MISC-WADIYA-TARJAMA) | the meeting point plus one trial before and one after (a solution between graduations needs both neighbours; a negative / no solution needs three trials including x = 0) → the textbook's lines (36 + x = 3x + 18 …), التحقق, then the inequality beyond (« ابتداءً من 9 حصص ») | L4 (`30+x` vs `2(6+x)`, `36+x` vs `4+x+6+x+8+x`, theme `family`), synthesis (`75x` vs `560+5x`, `goal="greater"`, theme `pool`) |

`growth-race` props (contract written in the component header): `left`, `right` (linear in x as written in the
model; `k(…)` products of a constant and a sum allowed, the STRUCTURE — which element carries which x — is kept
for the build stage), `theme` (`ages` | `pool`; the token's operation comes from the expressions, not the
theme), `domain` (`natural`), `goal` (`equal` | `less` | `greater`), `maxX`, plus `context={{ leftTitle,
rightTitle, names, question }}` (a lesson's own words), `onModel`, and `startWith="race"` (the model already
placed, like `common-divisors`' `startWith="lists"`). A lesson that reuses it keeps the props in its
`content/textbook.js` (`LAB = { beginner, advanced }`) and mounts the same object in a render test.

**DOM contracts** (e2e `apps/web/e2e/lesson-kit/4am-muadalat-mutarajihat.mjs`, 25 lab checks by real gesture):
`[data-equation-balance][data-eq][data-tilt][data-solved]`, `[data-balance-pan=L|R]`, `[data-drag-source="p:<side>:<kind>" | "r:<kind>"]`,
`[data-balance-divide] [data-stretch-handle]`, `[data-balance-divide-go]`, `[data-balance-groups][data-ok]`, `[data-balance-step]`,
`[data-balance-notice]`; `[data-vanishing-field][data-collapsed][data-sign]`, `[data-vanishing-ruler]`, `[data-vanishing-pin-button]`,
`[data-vanishing-pin]`, `[data-vanishing-refused]`, `[data-vanishing-claim]`; `[data-solution-ray][data-mode=region|bracket|flip]`,
`[data-ray-probe]`, `[data-ray-tried] [data-tried-x][data-ok]`, `[data-ray-bracket][data-placed]`, `[data-ray-bracket-handle]`,
`[data-ray-side]`, `[data-ray-toward]`, `[data-ray-fix]`, `[data-ray-card]` (one card at a time), `[data-ray-choice=<rel>]`,
`[data-ray-step=ok|ko]`; `[data-growth-race][data-theme][data-stage=build|race]`, `[data-drop-zone="el:<id>"]`, token `[data-drag-source="tok"]`,
`[data-gr-check]`, `[data-gr-verdict=ok|ko]`, `[data-gr-open-race]`, `[data-gr-ruler]`, `[data-gr-columns][data-rel]`.

**Layering over a drawn scene** (balance): the carry zones sit UNDER a `pointer-events-none` SVG and the
transparent source overlays ON TOP of it, so the shared `DropZone`'s resting background never hides the drawing;
a covered pan is aimed at by touching one of its objects with a piece held (the unit-3 « toucher-toucher »
interception, MANIPULATION_CONTRACT §4.1).

**Decorative layer (owner request, renewed 2026-10-01).** Each lab keeps, beside its causal gestures, a
decoration of its world — a ball that bounces on the locker-room floor (balance), the pitch's ball that drops
onto the line when the pitch collapses (vanishing pitch), Younes's phone that shakes or a linesman's flag at the
bracket (ray), a birthday candle or the pool's ripples (race): `aria-hidden`, `tabIndex={-1}`, never a lab state,
frozen by reduced motion — the exception of §2quinquies, not a licence to animate mathematics.

## 2septies. The system laboratories (unit 5, 2026-10-01)

Unit 5 « جمل معادلتين من الدرجة الأولى بمجهولين » added three types by the §7ter recipe, in `manipulations/systems/`
(logic `logic/<name>.js` + tests, render test `systems/<name>.render.test.jsx`, strings `lesson.manipulation.json ›
manipulation.pairScoreboard | eliminationCards | storyModeller`). All three compute through ONE exact module,
`packages/core/arithmetic/linearSystem.js` (on `linear.js` fractions: `eq2('2(x - 5) = y - 3')`, `system`,
`classify` → unique / none / infinite, `pairHolds`, `isolate`, `substitute`, `scale` refusing ×0, `addEqs`,
`eliminated`, `eliminationFactors`, `eqLatex`, `pairLatex`; `linearSystem.test.js` sweeps every system of the
textbook). The Math Lab keeps its own engine (`features/mathlab/tools/algebra/systems.js`, another bundle). A level's
jumla is written `numbers: { system: 'eq1|eq2' }`; `levels.test.js` measures its demand (non-unit coefficients,
parentheses, decimals, a non-integer solution, size of constants). All three are **manual** (§6bis), report through
`state.report`, carry a decorative layer of their world, and were the first labs built and MEASURED under the
one-screen rule (§8bis): e2e `apps/web/e2e/lesson-kit/4am-jumal-muadalatayn.mjs` checks figure + controls within the
viewport at 1280 × 800, 1366 × 768, 390 × 844 and 320 × 640, both levels.

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `pair-scoreboard` (`PairScoreboard.jsx`) | BOTH numbers of the pair, one stretch handle each (−/+ and keyboard); « اقلب » swaps the pair | two gauges, one per equation, read the substitution live in the textbook's form (`2(13 − 5) = 16`, `19 − 3 = 16`); « هذه الثنائية حل للجملة » refused while only one lights (`onlyOne` / `none`); a swapped pair is a refused trial | an accepted pair AND a one-gauge trial → « في آن واحد »; the formal phase shows the system written, reduced, its pair and the order rule | L1 (`x+y=10\|3x+y=22` season card `football`; `x+y=32\|2(x-5)=y-3` the textbook's agents `staff`, 5 men and 3 women retiring greyed; the تحدّ `coins`) |
| `elimination-cards` (`EliminationCards.jsx`) | two equation CARDS in tiles: pull an unknown's tiles into the tray to isolate it, then CARRY the expression onto that unknown's tiles on the other card (التعويض); stretch ×k (−6…6, both sides together) and lay one card on the other (الجمع) | the expression on its own card is refused with what it would give (« 7 = 7 »); stacking when nothing cancels is refused with the sum written; ×0 wipes the card and is refused; the found value is carried back and the lab ends only with (x ; y) checked in both equations | discovery opens once BOTH methods (the textbook's student 1 and student 2) gave the same pair | L2 (`x+y=10\|x-y=2`; act-2 `2x+y=7\|3x-2y=4,2`, world `snack`) |
| `story-modeller` (`StoryModeller.jsx`) | the textbook's 5-step table as stages: carry x / y onto the story's nouns (`named` pre-places them), the story's numbers (chips, plus a reusable « 1 ») into `□x + □y = □`, choose التعويض / الجمع (lines from `linearSystem`), carry the values to the story's gates | « تحقّق » replays each fact with the student's equation and refuses in the story's words (`moneyInCount` = MISC-JUMLA-TARJAMA, `swapped`, `totalAsCoef`, `coefAsTotal`, `incomplete`…); « انتهيت » after one unknown refused (MISC-JUMLA-NISF-HALL); the REPLAY flags a non-natural count | a refused model beside the accepted one; swapped values still give 140 visitors but the money total betrays them → only the second fact orders the pair | L3 (stadium derby `x+y=20\|300x+150y=4800`; museum act-3 `x+y=140\|300x+150y=30300`), synthesis (`theme="party"`, two `money` facts 150x + 150y = 11 250 and 24x + 30y = 2 100) |

`story-modeller` props (header of the component; the synthesis keeps its own in `content/textbook.js › LAB` and mounts
them in `lab.render.test.jsx`): `system`, `theme` (`stadium` | `museum` | `party`), `unknowns=[{ id, noun }]`, `named`,
`facts=[{ quote, kind }]` (`kind` never tied to the order), `chips=[{ value, label }]`, `story`, `answer={ options,
correct }`, `startWith` (`model` | `solve`), `onModel({ system, tex, unknowns })`, `onSolved({ x, y, method })`,
`onTrial`, `onFinished`. Missing props fall back to the theme's built-in story; a target number no chip carries, or a
system without a unique solution, throws at render. On phones the chip reserve is a 3-column grid (`Reserve grid`).

**DOM contracts** (e2e above): `[data-pair-scoreboard][data-world][data-x][data-y][data-solved][data-layout]`,
`[data-pair-glance]` (the one-sight block), `[data-pair-handle=x|y]`, `[data-pair-less|more=x|y]`, `[data-gauge=1|2][data-ok]`,
`[data-pair-claim]`, `[data-pair-refused=onlyOne|none]`, `[data-pair-trial][data-ok1][data-ok2][data-swapped]`, `[data-pair-cell]`;
`[data-elimination-cards][data-method=""|sub|add][data-stage=cards|one|back|done]`, `[data-eq-card=1|2][data-scale]`,
`[data-eq-tile=x|y|c]`, `[data-scale-handle=n]`, `[data-drag-source="card:n"|"iso:n:v"|"expr:n"|"val"]`,
`[data-drop-zone="card:n"|"tile:n:v"|"tray"|"back:n"]`, `[data-ec-refused]`, `[data-ec-current]`, `[data-ec-line]`,
`[data-ec-annihilate]`, `[data-ec-result][data-x][data-y]`; `[data-story-modeller][data-theme][data-stage=name|model|solve|verify|answer]`,
`[data-sm-core]` (the measured instrument), `[data-sm-noun]`, `[data-drag-source="unk:x"|"chip:<k>"|"val:x"]`,
`[data-drop-zone="noun:<id>"|"slot:<1|2>:<a|b|c>"|"gate:<id>"]`, `[data-sm-check]`, `[data-sm-verdict]`, `[data-sm-row][data-reason]`,
`[data-sm-method]`, `[data-sm-line]`, `[data-sm-replay][data-ok]`, `[data-sm-crowd][data-cols]`, `[data-sm-answer]`; all three
`[data-deco]`, `[data-lab-fold]`, and `story-modeller`'s replay verdict in a `[data-movable-panel]`.

## 2octies. The proportionality laboratories (unit 6, 2026-10-02)

Unit 6 « الدالة الخطية والتناسبية » (ميدان d'affichage « ميدان التناسبية والدوال ») added four types by the §7ter
recipe, in `manipulations/proportion/` (logic `logic/<name>.js` + tests, render test `proportion/<name>.render.test.jsx`,
strings `lesson.manipulation.json › ratioRide | linearMachine | originLine | percentTag`). All four compute through ONE
exact module, `packages/core/arithmetic/proportional.js` (on `linear.js` fractions: `tableRatios`, `commonRatio`,
`fourthProportional`, `coefficientFrom` refusing m = 0, `image`, `antecedent`, `onLine`, `direction`,
`percentMultiplier(t, take|increase|decrease)`, `chainMultiplier`, `percentChange`, `rule('2x-1')`, `isLinear`,
`linearityWitnesses`). All four are **manual** (§6bis), report through `state.report`, carry a DECORATIVE layer of their
world (`aria-hidden`, out of the keyboard path, still under reduced motion, never carrying an answer) on top of the
GENUINE manipulation (owner request: both), and are measured one-screen (§8bis) at the four viewports, both levels, by
`apps/web/e2e/lesson-kit/4am-tanasubiya-dala-khattiya.mjs`. New worlds in `VISUAL_THEMES`: `scooter`, `souk`,
`cablecar`, `spring`, `mall`, `tank`.

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `ratio-ride` (`RatioRide.jsx`) | the ride DURATION x: drag the scooter along the promenade's minute ruler (−/+, arrows, tap); « سجّل الرحلة » records (x ; y) into the student's OWN table, ratio row y ÷ x exact | judging « جدول تناسبية » / « ليس … » refused with two different quotients or the column (0 ; 50); one column judges nothing; the ghost column filled by × a refused with its quotient; y = □ × x refused by replaying a column | مبتدئ `15x` (ratios shown): judged table + ghost column; متقدم `15x\|10x+50` (ratio row hidden until asked): both plans judged, y = 15 × x written; « y − x constant » refuted by the student's own columns | L1 tanasub-muamil (`scooter`) |
| `linear-machine` (`LinearMachine.jsx`) | the INPUT x: number cards dragged into the hopper (tap-tap, keyboard, a blank card stretched), and the dial a of a witness machine x ⟼ a·x; the table x / f(x) / a·x turns green / red live | « f(x) = a·x » refused with a column where a·x ≠ f(x), or the machine's own witness (f(0) ≠ 0, a doubled input); (0 ; 0) on the dial refused (« a × 0 = 0 for every a ») ; « no a » refused until the table holds a witness | مبتدئ `0,8x` (the Eid discount, act-1 corrected to 20 %): a from one non-zero pair, then backwards (6 → 7,5 ; 1,4 → 1,75); متقدم `x^2\|2x\|2x-1` (act-2): classify the three machines, « f(0) = 0 is enough » refuted by x² | L2 dala-khattiya (`souk`) |
| `origin-line` (`OriginLine.jsx`) | draw: a pin snapped to an exact grid (drag, tap, arrows + Enter); pivot / fit: the slope a (grab the line or the slider strip); read: the abscissa or ordinate of a probe on an axis | O shakes and refuses to move (f(0) = 0); a point off the line refused with its calculation and gap (`0,5 × 4 = 2 وليس 3`); fit counts « يمرّ بـ n من m » | draw: two accepted points with different x; read: one image and one antecedent (or the `reads` targets); pivot: one rising and one falling line (sign of a); fit: a line through all the points (or « no line through O fits ») | L3 tamthil-bayani-khatti (`cablecar`; the GeoGebra slider of p. 76 as `pivot`), L5 tarrid-khatti (`fit`, `cablecar` / `spring`), synthesis (`read` + `cap`, `budget`) |
| `percent-tag` (`PercentTag.jsx`) | the signed t % at the end of the « بعد » bar (stretch, track tap, ±1 %, arrows), زيادة / تخفيض, the article; in a chain the BET on the overall change, then each step | the additive bar « x + t » never meets the multiplied bar (MISC-NISBA-JAM, swept t = −50…50); building a chain refused before a bet; the « −15 % » bet refused by the water level (multipliers multiply); a full tank refuses to overflow | single (`1200`, `+5`, act-5): same t on a second article, y ÷ x constant → x ⟼ 1,05x; chain (`30`, `-30\|+15`, the tank of p. 71): 0,805 → −19,5 %, and −20 % / +20 % → 0,96 | L4 tatbiqat-tanasub (`mall`, `tank`) |

**`origin-line` props** (the unit's shared lab; L5 and the synthesis keep theirs in `content/textbook.js › LAB` and mount
them in `lab.render.test.jsx`): `a` (required for draw / read; exact writing, `"0,5"`, `"-3,2"`, `"9/4"`), `mode`
(`draw` | `read` | `fit` | `pivot`), `points` (`"2:0,6|3:0,9"` — fit data, or given points elsewhere), `reads`
(`"x:4|y:3,5"`), `cap` (a dashed horizontal budget line; the crossing is shown exactly, `10000/19 ≈ 526,32`),
`xMin xMax yMin yMax` (strings; O always forced into the window; graduations chosen so every required value is reachable
exactly), `theme` (`cablecar` = equal units on both axes; `spring`, `budget` = one unit per axis — `budget` is a lab
world, not a `VISUAL_THEMES` entry: a resource declares `experience.theme: 'cablecar'`), `showRule`, `title lead mission
level levels`, `onTrial` (`{ kind: 'point', ok, x, y, gap }` | `{ kind: 'read-x' | 'read-y', x, y, capHit }` |
`{ kind: 'line', a, dir, hits }`), `onFinished({ mode, a })`. A content defect throws at render (draw/read without
`a`, fit without `points`, read with a = 0). On the other workspace level only `a`, `mode` and `reads` apply.

`ratio-ride` props: `plans`, `theme`, `onTrial({ x, columns, plans, rows })`, `onJudged({ id, says, ok })`. `percent-tag`
props: `price`, `steps` (`"+5"`, `"-30|+15"`, |t| ≤ 50), `theme` (`mall` | `tank`). `linear-machine` props: `rules`
(`proportional.rule` writings), `theme`. Each component header carries its DNA design sheet and full DOM contract.

**DOM roots** (e2e): `[data-ratio-ride][data-plans][data-x][data-columns][data-layout][data-judged]` (`[data-ride-glance]`
measured block, `[data-ride-handle]`, `[data-ride-record]`, `[data-ride-claim]`, `[data-ride-verdict]`,
`[data-ride-ghost]`, `[data-ride-formula]`); `[data-linear-machine]` (cards, hopper, dial, table — see the header);
`[data-origin-line][data-mode]` (`[data-ol-glance]`, `[data-ol-handle]`, `[data-ol-line]`, `[data-ol-cap]`,
`[data-ol-hits]`, `[data-ol-formal]`); `[data-percent-tag][data-mode=single|chain][data-world][data-k][data-y]`
(`[data-percent-glance]`, `[data-percent-handle=t|bet]`, `[data-percent-additive]`, `[data-percent-refused]`,
`[data-percent-tank][data-volume]`); all four `[data-deco]` and `[data-lab-fold]`.

## 2nonies. The affine-function laboratories (unit 7, 2026-10-02)

Unit 7 « الدالة التآلفية » (same display ميدان « ميدان التناسبية والدوال ») added five types by the §7ter recipe, in
`manipulations/affine/` (logic `logic/<name>.js` + tests, render test `affine/<name>.render.test.jsx`, strings
`lesson.manipulation.json › affineMeter | affineLine | slopeStairs | lineCrossing | planCompare`). All five compute through
ONE exact module, `packages/core/arithmetic/affine.js`, built ON `linear.js` (an affine function IS unit 4's `{ a, b }`)
and `linearSystem.js` (an equation ax + by = c): `affine('3/2x+1' | '2+3x' | a, b)`, `affineLatex`, `kindOf`,
`classifyRule` (`'3x^2+1'`, `'1/x-3'` → `other`), `imageOf`, `antecedentOf` (`unique` | `none` | `all`), `onLine`,
`direction`, `yIntercept`, `xIntercept`, `rateOfChange`, `fromTwoPoints`, `interceptFrom`, `lineFromEquation`,
`intersect` (`unique` | `parallel` | `same`), `comparePlans`, `cheapestAt`, `stepFrom`. The graph labs reuse the pure grid
helpers of `logic/originLine.js` unchanged (`parseValue`, `niceStep`, `subdivide`, `ticks`, `planeGeometry`, …). All five
are **manual** (§6bis), report through `state.report`, carry a DECORATIVE layer (`aria-hidden`, out of the keyboard path,
still under reduced motion, never an answer) on top of the GENUINE manipulation, and are measured one-screen (§8bis) on
their « glance » block at the four viewports, both levels, by `apps/web/e2e/lesson-kit/4am-dala-taalufiya.mjs`. New worlds
in `VISUAL_THEMES`: `payroll`, `ride`, `ramp`, `thermo`, `gaming`, `rental`, `laser`.

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `affine-meter` (`AffineMeter.jsx`) | x (km / overtime hours): the taxi or the time card dragged along its ruler (tap, −/+, arrows); at the `classify` stage the knobs a and b | at x = 0 the meter is NOT empty (the b block is already there); a target m shows its gap (« −185 ») until met at exactly one x; « proportional », « (a + b)·x » and « m ÷ a − b » refuted with the student's own numbers | `image`: trials with x = 0 or a pair x, 2x (+ the textbook columns) → f(x) = ax + b; `antecedent`: m met → « اطرح b ثم اقسم على a »; `classify`: b = 0 (خطية) AND a = 0 (ثابتة) | L1 mafhum-taalufiya (`ride` 40x + 100; `payroll` act-1 185x + 35000, target 37775) |
| `affine-line` (`AffineLine.jsx`) | shift: the point (0 ; b′) on the y-axis strip, or the whole line grabbed (translation); identify: b′ and the step « 1 to the right, a′ up »; draw: a pin on an exact grid; read: x / y probes | b′ ≠ b refused with « f(0) = b », b′ = 0 is « (d) itself, through O »; the step will not move in shift (a fixed, (d′) ∥ (d)); a point off the line refused with its gap, O refused when b ≠ 0; each identify try names the relation of the two lines | shift: (d′) accepted, then two probe readings at different x give the SAME gap b; identify: the lines coincide; draw: two accepted points; read: the `reads` targets | L2 tamthil-bayani-taalufi (`ramp`; act-3 3/2·x lifted by 1, then a hidden descending ramp) |
| `slope-stairs` (`SlopeStairs.jsx`) | two numbers x₁, x₂: grab the plane (the nearest marker follows the line), handles under the axis, track tap, arrows, −/+ | x₁ = x₂ refused (« القسمة على 0 مستحيلة »); in `points` mode a number whose image is unknown is refused until the stair between the two given couples is built | `rule`: three stairs of at least two widths — the quotient Δf ÷ Δx never moves (INVARIANT = a), « grows with the stair » / « is the difference of the images » refuted by the student's stairs; the textbook's « … » stairs fill when covered; `points`: the stair (→ a) then a marker at 0 (→ b) | L3 tanasub-taghayyurat (`stadium` act-4 200x + 2000, marks 0\|1\|4\|6\|10\|12\|15; `thermo` the تحدّ 10:50\|30:86) |
| `line-crossing` (`LineCrossing.jsx`) | build: for each equation the card of its writing y = ax + b; probe: a point P on the integer grid (drag, tap, arrows ± Shift, Enter, pad); cases: the second line's b and a | a wrong card shakes, refuted by an exact witness (« x = 0 gives y = −43, and 0 + (−43) ≠ 43 »); each equation's LAMP lights only when P is exactly on its line, the substitution written under it; an intersection off the grid nodes is SAID (« القراءة تقريبية », the exact pair from the calculation) | probe: a one-lamp trial AND the two-lamp point (« (y ; x) » refuted); cases: parallel (lamps never together) AND coincident (every point lights both) produced by the student → the three-case table | L4 tafsir-bayani-jumla (`laser` 2x − y = 1, x + y = 5; `coins` act-5 → (36 ; 7); معارف with `startWith="cases"`) |
| `plan-compare` (`PlanCompare.jsx`) | model: plan A's two amounts carried into the bill (« يُدفع مرّة واحدة » / « عند كل وحدة × x »), then x on the strip under the plane; compare: x (bars and lines move together), a marker on an exact grid, then a brush painting the x-axis intervals | « تحقّق » refuses the fixed part paid x times (MISC-TARRID-JUZ-THABIT) with the bill's own cost (2000 × 7 + 200 = 14200 ≠ 3400); a marker off the crossing refused with every plan's cost; « لا تتساويان » refused when the cheapest plan changes; a wrong colour refused with a witness from the student's OWN trials (MISC-TARRID-AFDAL-DAIMAN) | model: model + `ask` targets → f(x) = ax + b, image / antecedent; compare: every breakpoint of the cheapest plan (lower envelope) marked + every interval painted + trials in two intervals → f(x) = g(x), the inequality, the choice sentence | L5 tarrid-taalufi (`gaming`, `stadium` act-4 200x + 2000 vs 400x), synthesis (`rental`, 3 plans incl. a constant one) |

**`plan-compare` props** (the unit's shared lab; the synthesis keeps its own in `content/textbook.js › LAB` and mounts them in
`lab.render.test.jsx`): `plans` (1–3 `affine` writings, `"200x+2000|400x"`, amounts ≥ 0, pairwise distinct — else a render
error), `mode` (`model` | `compare` | `model|compare`; one plan ⇒ model only), `ask` (`"x:7|y:4800"` on plan A, y must have a
whole antecedent in the window), `xMax yMax` (strings; defaults from the crossings, asks and costs), `theme` (`stadium` |
`gaming` | `rental`), `title lead mission level levels`, `onTrial` (`{ kind: 'model' | 'x' | 'mark' | 'noCross' | 'paint', … }`),
`onFinished({ kind: 'model' | 'cross' | 'none', x, before, after })`, optional `onModel({ tex })`. With 3 plans the crossings
to mark are the breakpoints of the cheapest plan; a crossing « above » is accepted but not required.

**Other props.** `affine-meter`: `rule` (a > 0 and b > 0), `mode` (`image` | `image|antecedent|classify`), `target` (needs a
whole antecedent ≥ 1), `marks` (the textbook columns as ruler flags), `xMax`, `theme` (`ride` | `payroll`).
`affine-line`: `a`, `b` (exact writings), `mode` (`shift` | `identify` | `draw` | `read`, chained with `|`), `find` (`"a:b"`, the
hidden line of a chained identify), `reads`, `xMin xMax yMin yMax` (O and x = 1 always in the window, equal units), `showRule`,
`theme` (`ramp`). `slope-stairs`: `rule` | `points` (exclusive), `marks`, `shown` (stairs already printed), window, `theme`
(`stadium` | `thermo`; the thermometer is graduated in °C only — a °F scale would give b). `line-crossing`: `system`
(`linearSystem.eq2` writings, each containing y), `cases`, `startWith` (`build` | `cases`), window, `theme` (`laser` | `coins`).
Each component header carries its DNA design sheet and full DOM contract.

**DOM roots and glance blocks** (e2e): `[data-affine-meter]` / `[data-am-glance]`; `[data-affine-line][data-mode][data-stage]` /
`[data-al-glance]`; `[data-slope-stairs][data-mode]` / `[data-ss-glance]`; `[data-line-crossing][data-stage]` /
`[data-lc-glance]`; `[data-plan-compare][data-stage][data-step]` / `[data-pc-glance]`; all five `[data-deco]`, and
`[data-lab-fold]` where the trials fold.

**Screen floor — lessons are generated for tablet and laptop ONLY (owner, 2026-10-27).** Phones never reach a lesson or an
exercise (`components/auth/RequireLargeScreen.jsx` replaces them with a message), so lesson code carries NO phone code:
- **No `sm:` / `md:` Tailwind variants in lesson code.** The viewport is always ≥ 768 px, so they always apply: write the
  final class directly (`grid-cols-2`, not `grid-cols-1 sm:grid-cols-2`; `text-sm`, not `text-xs sm:text-sm`). `lg:` / `xl:` stay
  legitimate (1024 / 1280 px). The three lesson files also rendered by phone-supported pages (`ClassroomToolbar`, `KnowledgeMap`,
  `LinearKnowledgeView`) keep theirs.
- **The lab-box floor is 354 px** (measured 2026-10-27 at 1024×768 with the « بطاقتي » column open — the narrowest
  supported case: the `[data-manipulation-stage]` is 402 px in a lesson's activity modules and 386 px in a « معارف » module,
  minus 16 px of stage padding on each side; a 768×1024 tablet gives a 494 px box). A lab-level width branch (`tiny`,
  `narrow`, `compact` measured on the lab box) whose threshold is ≤ 340 px is dead code: do not write it. Branches from
  360 px up are REAL (they fire on a tablet in portrait or beside the map column) and stay. A sub-component measuring its
  own panel is free.
- A new lab starts its measured-width state at a supported size (`useState(560)`), never at a phone width (`useState(320)`). Existing labs keep theirs: the layout effect measures before the first paint, and their render tests read that SSR width.
- No `@media (max-width: …)` under 768 px in lesson CSS; no element that exists only on phones (`sm:hidden`).

**Narrow layouts (320 px) — HISTORICAL, superseded by « Screen floor » below (2026-10-27).** At 320×640 a lab scene is ~160–180 px wide (unit 5's observation): each lab has a measured narrow
layout — numbered stage tabs (`affine-meter`), the ghost rule dropped (`affine-line`), a 4-button pad (`slope-stairs`), compact
lamps and −/+ instead of strips (`line-crossing`), the empty plane hidden while the bill is built (`plan-compare`). The tightest
measured margins are 8–10 px (L2 advanced, L4 advanced after both lines, the synthesis on phones).


## 2decies. The statistics laboratories (unit 8, 2026-10-02)

Unit 8 « الإحصاء » (same display ميدان « ميدان التناسبية والدوال », programme domain « ميدان تنظيم المعطيات ») added four types by
the §7ter recipe, in `manipulations/stats/` (logic `logic/<name>.js` + tests, render test `stats/<name>.render.test.jsx`, strings
`lesson.manipulation.json › cumulGate | statBalance | sheetLab | groupTanks`). All four compute through ONE exact module,
`packages/core/arithmetic/statistics.js`, on `linear.js` fractions (`tableOf`, cumulative up / down and relative, `countAtMost /
AtLeast / Where`, `range`, `mean`, `median` by ranks, classes / `center` / `medianClass`, `mode`, `combineGroups`,
`solveValueForMean`, `pieAngles`, `statText` / `approx`) — no lab carries arithmetic. All four are **manual** (§6bis: each gesture
is an announcement, a position or a prediction), report through `state.report`, carry a DECORATIVE layer (`aria-hidden`, out of
the keyboard path, still under reduced motion, never an answer), and are measured one-screen (§8bis) on their « glance » block at
the four viewports, both levels, by `apps/web/e2e/lesson-kit/4am-ihsa.mjs`. A series is written `value:count|…` (or plain values),
decimal comma. New worlds in `VISUAL_THEMES`: `funpark`, `heatwave`, `esport`, `sheet`, `beach`, `quiz`, `medals`. The full props,
DOM attributes and DNA sheet of each type are in its component header; the essentials:

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `cumul-gate` (`CumulGate.jsx`, glance `[data-cg-glance]`) | the threshold t: the bar of a ride's height gauge (drag, tap the gauge, −/+, arrows; tapping a drawn person or a table column jumps to its height), the side « على الأكثر ≤ t » / « على الأقل ≥ t », the queue's sort; then the student ANNOUNCES how many pass | the gate stays shut on a wrong count and names its witness: `strict` (the people of height exactly t forgotten), `under` (lit heights still to add), `over` (unlit people counted), `otherSide` | one value counted on BOTH sides: up(t) + down(t) = N + f(t) (12 + 13 = 20 + 5), up(max) = down(min) = N; a t that is not a value (158) gives the count of the value below; the textbook's two tables filled by the student's own accepted counts, « ÷ N » for التواتر | `takrar-mujamma` M1 (`funpark` 8 kids, 3 × 3; `school` act-1's 20 heights, 5 × 4) |
| `stat-balance` (`StatBalance.jsx`, glance `[data-sb-glance]`) | range: the two jaws of a كلّاب on the beam's columns; mean: the fulcrum p on a graduation 1/D that contains the mean (1/15 for 482/30); median: a curtain in RANK space 0…2N (inside a stack the finger's height chooses the cut); contrast: the far token; hidden: each hidden token between its table bounds | the beam ALWAYS tilts off the exact mean (minimum visible angle, the two distance sums written); the curtain refuses unequal counts (« 4 مقابل 6 »); tokens outside the jaws stay red; a hidden token leaving its bounds is refused and returns | the far token: the mean runs (ghost of the old mean), the median stays (the textbook's 3 and 43); N odd (curtain ON a token) / N even (between two); hidden: the median fixes the first value, the mean the second, « the mean alone suffices » refuted by a witness | `mada-wasit-mutawassit` M1 (`range\|mean`: `esport` 2, 3, 3, 4, 8 / `heatwave` El Oued) and M2 (`median`); synthesis `wadiya-idmajiya-ihsa` M1 (`hidden`, `medals`) |
| `sheet-lab` (`SheetLab.jsx`, glance `[data-sh-glance]`) | the CELLS (typed, then −/+), the RANGE selected on row 1 (drag; tap first then last; Shift + arrows), the FORMULA (function cards or typed), ENTER into column B after the hand result in column C; at the chart stage a selection of a 2-row table and the chart type | refused in the bar with the spreadsheet's own reason (no « = », a typed number, unknown function #NOM?, a range leaving row 1, no hand result yet); COMPUTED but contradicted by the student's own column C: a short range (A1:F1 → 31/6) or a wrong function (=MAX alone → 10) — a coincidence is named and still refused; a wrong chart type refused, an incomplete selection DRAWS a wrong chart (216° for 144°) | after every row verified, a cell changed: MOYENNE moves, MEDIANE stays (swept on every single-cell change of ex-7); the chart stage (opened by the student, §7quater) ends when bars / pie / histogram each fit their data | `majdulat-ihsaiya` M1 (`sheet`: 5\|8\|6\|9\|7 / ex-7 typed by the student, four formulas, then charts ex-15 / ex-16) |
| `group-tanks` (`GroupTanks.jsx`, glance `[data-gt-glance]`) | a BET: the 🎯 marker on the EMPTY class tank (drag, tap the track, ▲▼, keys on the slider); the valve; then a group's count n (tap its tank, −/+) | no valve without a bet; the « mean of the means » bet (9,5; 11,5) is refused by the water, which stops lower, on the side of the wider tank (MISC-IHSA-MUTAWASSIT-MUTAWASSITAYN) | a group is a tank of WIDTH n filled to LEVEL m (area n·m = its points); the class tank (width N) settles at Σ n·m ÷ N (communicating vessels = weighted mean, drawn areas equal before / after); equal counts make the mean of means right ONLY then; the two classes of the تحدّ settle at the same 384/33 although boys favour ب and girls أ | `qiraat-wadiyat-ihsaiya` M1 (`quiz` 4:12\|6:7 → 9; `school` the تحدّ, `classes: '2\|2'`) |

**`stat-balance` props** (the unit's shared lab; the synthesis keeps its own in `content/textbook.js › LAB` + `lab.render.test.jsx`):
`series` (`?` marks a hidden value, hidden mode only), `mode` (`range`, `mean`, `median` in any ordered combination — `median`
appends the `contrast` stage — or `hidden` alone), `hidden` (`"2:2-4|12:26-32"`: index in the WRITTEN order of `series` : inclusive
bounds, at most three; a hidden token starts at its lower bound so the page never holds the answer), `targetMean`, `targetMedian`
(hidden only, both required), `unit` (Latin unit → KaTeX island, Arabic word → DOM text), `axis` (`"min:max:step"`), `theme`
(`esport` | `heatwave` | `medals`), `onTrial({ stage, … })`, `onFinished({ stages, range, mean, median })`. In hidden mode the
target chips show « ≈ 6,87 », never a tall fraction, and the pads of the hidden values sit side by side — that is what keeps the
synthesis's 30 medals inside 320 × 640 (448 px for 568).

**`cumul-gate` props**: `series`, `mode` (`up|down` | `up|down|table`), `given` (the cells the textbook prints:
`"up:154|up:157|down:160|…"`), `theme` (`funpark` | `school`), `unit`. **`sheet-lab` props**: `cells` (2–12 values), `ask`
(MAX-MIN, MEDIANE/MEDIAN, MOYENNE/AVERAGE, MODE — the textbook prints the French Excel names, the English ones are accepted as the same
functions), `entry` (`type` | `given`), `chart` (`bars|pie|histogram`) with `pie` (`'البلاستيك:60|…'`) and `classes`
(`'7-8:6|8-9:1|9-10:4'`). The lab follows the spreadsheet, never an invented rule: empty cells in a range are ignored, MODE returns
the first most frequent value in cell order and #N/A when nothing repeats. **`group-tanks` props**: `groups` (`n:m|…`), `classes`
(groups per class, `'2|2'`), `theme` (`quiz` | `school`); a tank's height is budgeted from the lesson viewport minus what the
glance block MEASURES besides the tanks, so the block stays in the screen when the reading grows after the valve.

## 2sedecies. The meaning of addition and subtraction — `story-bars` (1AM unit 2, 2026-10-14)

The first lab of the cycle moyen rollout (phase 3), in a new folder `operations/` (`operations/StoryBars.jsx`, pure logic
`logic/storyBars.js`, 19 logic + 6 render tests). Lesson `mana-jam-tarh` « معنى الجمع والطرح ». The idea: the words « يزيد / ينقص /
أكثر / أقل » do not decide the operation — the STRUCTURE does. In the textbook's tape diagram (« مخطط بأقواس », drawn by the shared
`components/ArcTape.jsx`, also a statement-figure kind `tape`), if the unknown is the WHOLE we add the parts, if it is a PART we subtract.

| Story (`story` prop) | Level | What the hand holds | What resists |
|---|---|---|---|
| `checkup` (platform, theme `checkup`) | مبتدئ | the unknown child's HEIGHT on a wall gauge (stretch, vertical slider, keyboard ±1 / Page ±5, −/+), then the calc card that gives it | a commit that makes the sentence false is refused in the story's words (`equal / side / mirror / gap`; `mirror` = the trap read as its word, e.g. نزيم at 139); a wrong calc card draws its ghost head and is refused (`wrong / impossible`); only the right one writes `□ = 130 + 6 = 136` and closes the tape |
| `act1` (textbook نشاط 1 p. 25) | متقدم | the six textbook CALC CARDS, carried onto the six texts (drag, tap-tap, keyboard); no gauge, no reading | a card on the wrong text returns and that text's tape is drawn with the card's value in the unknown's role, NOT closed (gap / overflow), with a reason in the story's words (`operation / numbers`) |
| `method29` (textbook طريقة p. 29) | alone, `levels={false}` | the heights of يونس and محمد against أكرم 124 cm | same as `checkup`; no discovery, `onFinished` when both are done |

Discovery (`checkup`: items أمين +, ريم −, نزيم trap done; `act1`: all six matched): « ماذا يقرّر العملية: الكلمة أم المخطط؟ », the two wrong
options refuted with the student's own items. Props: `story`, `level`, `levels`, `title`, `lead`, `onTrial({ story, item, kind:
'stretch' | 'calc' | 'card', value, ok, calc })` (items `amine…yassine`, `younes`, `mohamed`, `t1…t6`; `calc` is written with « − »),
`onFinished({ story })`. Not eligible for « جرّب كل الإمكانيات » (§6bis). Since the Gen Alpha redesign (2026-10-14, §8ter) the children
are drawn WHOLE (`KidFigure`): the floor is 0 cm and each crown sits exactly on its height (`gaugeScale(height, GAUGE_PAD)`, 44 px above
150 cm for the value pills, 46 px under the floor for the name pills; `rulerTicks(k)` adapts ticks and labels to the scale). The layout
is the kit's: PromptCard in the §17.9 form (context « في الفحص الطبي، قامة سارة 130 cm. » + the item's sentence `[data-sb-sentence]`,
then the question « غيّر قامة أمين حتى تصدق الجملة. » with its lamp, the labelled item tabs « الجمل: », the labelled calc row
« الحساب الذي يعطي قامة أمين: » `[data-sb-calc-ask]` and its three cards; `act1`: context « تحت البطاقات 6 نصوص… », question « اسحب كل
بطاقة إلى نصّها حتى تُحلّ النصوص كلّها. », progress « حُلّ 0 / 6 »; no shell `mission`, `titleHidden`), then the stage and, at ≥ 600 px,
a side column with the StepperCard and the verdict (the result card replaces the stepper when the item is done); narrower, the round
−/+ live INSIDE the stage, in the handle lane. The difference is a neutral `SvgDimension` « 6 cm » — no sign, so the drawing never
dictates the operation. DOM: `[data-story-bars][data-story][data-mode][data-item][data-solved]`, `[data-sb-glance]`, `[data-sb-handle]`,
`[data-sb-person]`, `[data-sb-sentence][data-ok]`, `[data-sb-calc=<canonical i>]` (0 = known + d, 1 = known − d, 2 = d − known),
`[data-sb-card=<0..5>][data-placed]`, `[data-sb-slot=<1..6>][data-matched]`, `[data-sb-verdict]`, `[data-sb-refused]`,
`[data-sb-formal-line]`, the tape's `[data-arc-tape][data-tape-closed]`. Browser suite: `e2e/lesson-kit/1am-jam-tarh-ashriya.mjs`.

## 2septdecies. Euclidean division — `division-jumps` (1AM unit 3, 2026-10-14)

`operations/DivisionJumps.jsx` on `logic/divisionJumps.js` (integers through `core/arithmetic/divisibility.js › divmod`), lesson
`qisma-iqlidiya-baqi`. Here b is GIVEN (the size of a bouquet, of a jump) and the hand holds **q, the number of groups** — a different
variable and gesture from 4AM's team-builder (b = number of teams) and bookshelf (b = shelf length) (DNA §12). Two refusals bracket the
quotient: one group too many needs objects that do not exist (`over`: the missing flowers drawn as ghosts, « لهذه الباقة تنقص … »), one
group too few leaves enough for another (`short`: a ghost bouquet over the leftovers). The exact stop writes `a = b × q + r`, `r < b`.

| World (level) | What the hand holds | What resists |
|---|---|---|
| `flowers` (مبتدئ, theme `garden`, 47 flowers in bouquets of 6) | a ribbon pulled along the row of drawn flowers (stretch; ← / → keys, −/+, drag, tap) — each step ties the next 6 | `over` / `short` as above; after the exact stop a card « زهرة جديدة! » opens 48 (`then`, default the next multiple of b): one more flower closes a bouquet exactly |
| `line` (متقدم, textbook نشاط 3: 279 ÷ 14) | the number of jumps of 14 on a graduated line; the multiples are NOT labelled (only 0 and round values that are not multiples of b) | the jump past 279, the stop that leaves ≥ 14; the bracket `14 × 19 ≤ 279 < 14 × 20` is written after the exact stop |
| `line`, `levels={false}` (معارف 2: 253 ÷ 17) | the same, as the textbook's worked example | — |

`discoveryReady` = one `over` + one `short` + the exact stop on the lesson's own a (trials on 48 never count). Discovery « متى نتوقّف عن
تشكيل الباقات؟ », wrong options refuted with the student's numbers (« when nothing is left », « at 10 »). Formal: an المقسوم chip + the shared
`DivisionRoles` for b, q, r. Props `a`, `b`, `world`, `then?`, `level`, `levels`, `title`, `lead`, `onTrial({ a, b, q, r, kind: 'over' |
'short' | 'exact', ok })` (`r` null on `over`; `a` is 48 during the contrast), `onFinished({ a, b })`. Not eligible for « جرّب كل
الإمكانيات ». Default q = 0. DOM: `[data-division-jumps][data-world][data-a][data-b][data-q][data-solved]`, `[data-dj-glance]`,
`[data-dj-handle]`, `[data-dj-less]` / `[data-dj-more]`, `[data-dj-group]`, `[data-dj-left]`, `[data-dj-ghost]`, `[data-dj-verdict]`,
`[data-dj-refused]`, `[data-dj-bracket]`, `[data-dj-next]`, `[data-dj-formal]`. Browser suite: `e2e/lesson-kit/1am-darb-qisma-ashriya.mjs` — it opens the lesson's module pages, DELETED on 2026-11-18 (the lesson is v2; `docs/reports/OLD_VERSION_TRACE_2026-11-18.md` §8): no page mounts this lab today.

**Look (2026-10-14, kit §8ter).** A `PromptCard` on top in the §17.9 form — context with every number (« عند بائعة الأزهار 47 زهرةً، وفي كل باقة 6
زهرات. »; a lesson `lead` replaces it for its own numbers, e.g. 253 pearls), the question « اصنع الباقات حتى تعرف كم باقة كاملة تخرج من
هذه الأزهار. » / « اقفز بالأرنب حتى تعرف كم قفزة كاملة من 0 إلى 279. » with a lamp lit only at the exact stop, live `aside` pills that show only what the hand produced (`[data-dj-reading]`, `[data-dj-read=need|left|land]`) — above a
`StageFrame`. مبتدئ: a florist awning and `primitives/FlowerFigure.jsx` (`FlowerFigure`, `hueOf` — decorative colours that never repeat
every b flowers, so colour never fakes a group —, `BouquetSleeve`, `BouquetTie`): a paper sleeve behind each bouquet, converging stems and a
ribbon whose knot is the count pill (rose « 5 » + ghost flowers when flowers are missing); the remainder circled in amber with its pill;
geometry from `logic › bouquetShape` and `flowerLayout(…, BOUQUET_ROWS)` (tested). متقدم: `primitives/HopperFigure.jsx`, a drawn rabbit at
the landing point (`[data-dj-hopper][data-mood=idle|happy|oops]`) that hops each step (still under `prefers-reduced-motion`), its landing
pill, a flag at a and a pond after it (`[data-dj-pond]`: an overshoot lands in the water); multiples are still never printed before a jump
lands there. Controls: wide flowers = side `StepperCard` (`[data-dj-count]`), wide line = a control bar under the full-width line, narrow =
the round −/+ in a strip inside the stage; exactly one `[data-dj-less]` / `[data-dj-more]` pair. The `VerdictBanner` sits under the scene
and keeps its place (it shows the instruction before the first try): the scene never jumps; the scene height is computed from the prompt
and what follows, never from the scene itself. Added DOM: `[data-dj-prompt][data-lit]`, `[data-layout=wide|narrow]`.

## 2octodecies. Divisibility rules — `digit-cards` (1AM unit 3, 2026-10-14)

`operations/DigitCards.jsx` on `logic/digitCards.js` (every verdict by `n % d`, never by a digit rule), lesson
`qawaid-qabiliyat-qisma`. The rule is DISCOVERED from the student's own trials, never stated by the lab: the hand either colours the
multiples in a table (the textbook's نشاط 4) or arranges digit cards and claims divisibility (exercise 26). Two worlds, two variables
(DNA §12):

| World (level) | What the hand holds | What resists |
|---|---|---|
| `grid` (مبتدئ, textbook نشاط 4: 0..48 in 7 columns, colourings ÷2 then ÷5 then ÷3, order enforced) | a tap on a cell = « this is a multiple of d » (keyboard Enter, touch) | a non-multiple is refused with its remainder written (`refused=remainder`); after 5 hand-coloured cells « أكمل » may colour the rest PALE and dashed (`data-revealed`, a local shortcut, never a trial) |
| `cards` (متقدم, textbook ex. 26: cards 4, 5, 9, 3) | placing / swapping the cards (tap-tap, drag, keyboard) and claiming « يقبل / لا يقبل » on a closed lamp per divisor; « هذا هو الأكبر » and « لا يوجد » | a lamp opens on the division whether the claim was right or wrong; open lamps are re-judged on every new number (« تغيّر / بقي »); a valid but not largest « الأكبر » is refused naming the NEXT larger valid arrangement, a wrong « لا يوجد » names the smallest valid one |

`discoveryReady`: grid — the three colourings complete; cards — the three reachable targets (9534 ÷2, 9543 ÷3, 9435 ÷5) plus one swap
with lamps 2 and 3 open that kept ÷3 and flipped ÷2 (the « لا يوجد » answers for 4 and 9 are optional). Wrong options are refuted with
the student's material (« the column decides » by m and m ± 7; « the units digit decides for 3 » by m and m ± 10; « even ⇒ ÷4 » by
`9534 = 4 × 2383 + 2`; « the digit sum decides for 2 » by the student's own swap). Formal: the remainder definition (P4), then the rules
with the student's numbers (cards adds 9 and 4: `9534 = 95 × 100 + 34`, `100 = 4 × 25`). Props `mode`, `divisors`, `digits`,
`from` / `to` / `columns`, `level`, `levels`, `title`, `lead`, `onTrial` — grid `{ mode: 'grid', n, d, r, ok }` (one per new cell), cards
`{ mode: 'cards', n, d, claim: 'yes' | 'no' | 'largest' | 'none', r, ok }` (`n`, `r` null on `none`); every trial reported ONCE even when
two gestures land in one render — `onFinished({ mode })`. Not eligible for « جرّب كل الإمكانيات ». DOM: `[data-digit-cards][data-mode]
[data-solved][data-layout]`, `[data-dc-glance][data-bleed]`, `[data-dc-colouring=<d>][data-open][data-complete]`, `[data-dc-reveal]`,
`[data-dc-cell=<n>][data-colour][data-revealed]`, `[data-dc-ledger-row=<d>]`, `[data-dc-card=<digit>][data-placed]`,
`[data-dc-slot=<i>][data-digit]` (slot 0 = leftmost digit), `[data-dc-lamp=<d>][data-state][data-flip]`, `[data-dc-claim=<d>]
[data-claim]`, `[data-dc-task=<d>][data-done]`, `[data-dc-submit]`, `[data-dc-none]`, `[data-dc-verdict]`, `[data-dc-refused]`,
`[data-dc-formal]`, `[data-dc-rule=<d>]`. Browser suite: `e2e/lesson-kit/1am-qawaid-qabiliyat-qisma.mjs` — it opens the lesson's module pages, DELETED on 2026-11-18 (the lesson is v2; `docs/reports/OLD_VERSION_TRACE_2026-11-18.md` §8): no page mounts this lab today.

**Look (2026-10-14, kit §8ter).** Both worlds sit on the kit: a `PromptCard` in the §17.9 form (context « في الجدول الأعداد من 0 إلى 48. » /
« عندك أربع بطاقات: 4 ، 5 ، 9 ، 3. », question « لوّن كل مضاعفات 2 ثم 5 ثم 3. » / « رتّب البطاقات حتى تكوّن أكبر عدد يقبل القسمة على
2 — أو قل إنه لا يوجد. » with its lamp, then the colouring cards — « مضاعفات 2 » in the divisor's colour, a live « لوّنتَ 5 من 25 » — or the
target pills under « القسمة على: »; no shell `mission`, `titleHidden`)
above a lavender `StageFrame`; ≥ 600 px a side column (verdict + pill ledger for the table; for the cards a control card with the BIG
formed number, « هذا هو الأكبر » primary / « لا يوجد » secondary, the drag hint, then the verdict); narrow, the verdict sits under the stage
so nothing under the finger moves. The table is a candy board: each ≥ 40 px cell is the button with a raised tile drawn inside; an accepted
cell gets a transform-only « stamp » (Web Animations, off under reduced motion), a refused one shakes and carries a « +r » remainder pill
(`[data-dc-remainder]`). The slots are the windows of a drawn padlock (the lesson's locker code); the lamps are drawn bulbs —
`primitives/BulbFigure.jsx` (`state` closed | wait | yes | no, the divisor written on the glass, a warm halo for « يقبل », grey with × for
« لا يقبل », `data-bulb`) — with an « تغيّر / بقي » badge (`[data-dc-flip-badge]`) after a number change. Added DOM: `[data-dc-prompt]`,
`[data-dc-colourings]`, `[data-dc-board]`, `[data-dc-marks]`, `[data-dc-stage]`, `[data-dc-readout]`, `[data-dc-answer]`. Below 296 px of
lab width the glance still bleeds over the lesson frames (238 → 280 px at 320).

## 2novodecies. Place value, ten for one — `rank-exchange` (1AM unit 1, 2026-10-14)

`operations/RankExchange.jsx` on `logic/rankExchange.js`, all arithmetic through `packages/core/arithmetic/placeValue.js` (imported by
path: `digitsByRank`, `countOfRank`, `valueOfCounts`, `isWritable`, `decompose`, `classesOf`, `spaced` with U+00A0, `classWordsOf`,
`toArabicWords` — byte-identical to `words()` of `docs/sources/1am/unit1/build-extraction.py`, tested against every `words` answer of
the extraction and a 0..100 000 sweep — and `RANK_NAMES`), lesson `kitabat-adad-tabii`. The hand moves **quantities between ranks**
(DNA §12): it sweeps ten objects of a column into ONE object of the next rank and carries it one column to the LEFT, or opens one object
into ten of the rank on its right. The written digits are an OUTPUT — a column's digit box shows its count while 0..9 and OVERFLOWS (two
digits squeezed, rose, one shake, `data-overflow`) from 10 on; the written number appears only when every column is writable and no
tied object waits to be carried. The board is an LTR island, the highest rank on the LEFT (the textbook's « جدول المراتب »).

| World (level) | What the hand holds | What resists |
|---|---|---|
| `pencils` (مبتدئ, theme `packing`, platform: tasks `pack` 1 · 13 · 24 · 37, then `unpack` 2017 rank 1) | sweep a finger across objects of a column (each lifts with its number 1, 2, 3…; taps add up the same way); exactly 10 ties ONE pack / box / carton that is carried (drag, tap-tap, keyboard ←, « انقل يسارًا ») into its column; `unpack`: drag the top object one column right or the digit box's open action | `short-pack` (7 pencils fall back: « 7 أقلام لا تكفي: حزمة = 10 أقلام »), `wrong-column` (the pack slides back: « مكان الحزمة عمود الحزم »), a prediction card chosen BEFORE the first gesture and judged by the board (1 132 437 / 75 / 2 577; 1 / 20 / 201) |
| `tokens` (متقدم, textbook act-1 ③ and know-1: tasks `next` 999, `previous` 999, `borrow` 1000, `dictation` 7065 and 4 908 732) | the same sweep and carry on a 7-column board grouped by CLASS (one token colour per class); « +1 / −1 » on the units; the dictation sets any column (tap a column, then − / +, or ↑ / ↓) and « تحقّق » | `next` needs exactly three packs in cascade; `no-unit` (1000 − 1: nothing to remove, three opens first); `overflow` (a column holds 10 or more at « تحقّق »), `wrong-board` (« لوحتك: 765 — سبعمائة وخمسة وستون ») |
| `money`, `levels={false}` (textbook ex-2: `tasks={['unpack']}`, 1345 DA, rank 2) | open the 1000 DA note into ten 100 DA notes; GENERIC drawn notes and coins (a plain rectangle « 100 », a disc « 10 » — never a real banknote's design) | the prediction (1 / 3 / 13); no discovery — `onFinished` when the task is done |

`discoveryReady` = every task of the level done (`pack` + `unpack`: « ماذا يعني رقم مرتبة في كتابة عدد؟ », wrong options refuted with
the board as it arrived — 1 · 13 · 24 · 37 side by side is 1 132 437, the board wrote 2 577 — and with the packs sent, 201 against the
tens digit 1; the four advanced tasks: « لماذا نكتب 0 في 7065؟ », refuted with 765 read aloud and with the one 0 of 4 908 732). Formal:
the rank table of 2017 with رقم / عدد per rank (7 / 2017, 1 / 201, 0 / 20, 2 / 2), zero ranks greyed, and `2017 = 2 × 1000 + 1 × 10 + 7`
(zero ranks absent); advanced, the classes of 4 908 732 (spaced writing, each class read « أربعة ملايين | وتسعمائة وثمانية آلاف | … »)
and its مفكوك. Props `world`, `tasks`, `start`, `n`, `rank`, `next`, `borrow`, `dictation`, `level`, `levels`, `title`, `lead`,
`onTrial({ task, kind: 'pack' | 'unpack' | 'add' | 'remove' | 'predict' | 'answer', rank, ok, counts, value })` (every judged gesture,
reported once; a refusal carries `ok: false`), `onFinished({ tasks })`. Not eligible for « جرّب كل الإمكانيات »; « افتح الباقي » (open the
rest of a column) appears only after two hand-made opens in that column (author's call, like « أكمل » of `digit-cards`). « إعادة »
restarts the task in progress (finished tasks stay finished; everything restarts once all are done). Invariant tested: the board's value
(counts + the tied object waiting) never changes under tie, carry or open, whatever the order (property sweep).

**Look (kit §8ter).** A `PromptCard` in the §17.9 form (context = the starting quantities, « في الورشة صندوق واحد و13 علبةً و24
حزمةً و37 قلمًا. الحزمة 10 أقلام… », then the task's question naming its end state « اربط الأقلام حتى تستطيع كتابة عدد الأقلام. » with its
lamp; the three prediction cards sit under their own question « توقّعك: كم قلمًا في الورشة؟ » `[data-rx-predict-ask]`, never bare; then
an aside with the labelled task steps « المهمّة », the chosen prediction pill — green or struck at the end — and, while unpacking, the live counter of packs)
above a `StageFrame` of columns: drawn objects stacked from the bottom of a bin — honest objects (a pack shows ten pencils and its rubber
band, a box ten packs, a carton 2 × 5 boxes; tokens stamped with their rank value) —, one object size for the whole board (piles of more
than 20 shrink alone), tokens and coins STACK into a pile when the height runs out (each keeps a visible sliver), and the exact count of
each column lives ONCE, in the digit box under it — a row labelled « تحت كل عمود: كم فيه. » `[data-rx-digit-caption]` (the 2026-10-14
§17.9 sweep removed the duplicate in-column count badge, `[data-rx-badge]` no longer exists). The digit box itself becomes the keyboard / tap action when a column can be tied (≥ 10) or opened
(an icon badge, a soft pulse). Wide (≥ 600 px): a side column with the packer `KidFigure` (a girl in hijab behind the workshop table,
`mood` reacting), the big written number, the ± stepper and the verdict; narrow: written number and stepper inside the stage, the
`VerdictBanner` under it keeps its place; at 320 px the 7-column board bleeds over the lesson frames to 7 × 40 px (`data-bleed`). DOM:
`[data-rank-exchange][data-world][data-task][data-solved][data-layout]`, `[data-rx-glance][data-bleed]`, `[data-rx-col=<k>][data-count]`,
`[data-rx-item=<k>-<i>][data-lifted]`, `[data-rx-digit=<k>][data-overflow]`, `[data-rx-digit-caption]`, `[data-rx-predict-ask]`, `[data-rx-steps-label]`, `[data-rx-written]`, `[data-rx-tray]`,
`[data-rx-carry]`, `[data-rx-tie=<k>]`, `[data-rx-open=<k>]`, `[data-rx-open-all=<k>]`, `[data-rx-grab=<k>]`, `[data-rx-predict=<value>]
[data-state]`, `[data-rx-counter]`, `[data-rx-step=<task>][data-done]`, `[data-rx-plusminus=<k>]`, `[data-rx-plus]` / `[data-rx-minus]`,
`[data-rx-check]`, `[data-rx-words]`, `[data-rx-next]`, `[data-rx-verdict]`, `[data-rx-refused=short-pack|wrong-column|overflow|no-unit|
wrong-board]`, `[data-rx-result]`, `[data-rx-formal=rank|zero]`, `[data-rx-kid]`.
**Onboarding (mandatory for every lab, 2026-10-14, prop `coach`, default on):** `LabCoach` (§8quater) shows, at each moment, the
button or gesture the hand needs — the step comes from the pure `logic/rankExchange.js › coachOf(lab, { focusCol })` (predict → tie →
carry → open / ± / pick a column → check → next task), whose test follows the guide to the letter and checks that every task ends.
Strings: `rankExchange.coach.*`. DOM additions: `[data-lab-coach-toggle][data-state]`, `[data-lab-coach][data-step]`,
`[data-lab-coach-ring]`, `[data-lab-coach-ok]`, `[data-lab-coach-stop]`; e2e `e2e/lesson-kit/lab-coach.mjs`.

## 2vicies. Fractional writings and reduction — `fraction-knife` (1AM unit 4, 2026-10-14)

`operations/FractionKnife.jsx` on `logic/fractionKnife.js` (every verdict exact through `core/arithmetic/linear.js` — `frac`, `eq`,
`isInteger`, `fracText`, `fracDecimal` — and `divisibility.js › divmod`, imported by path), lesson `ikhtizal-kitaba-kasriya`. ONE whole
and ONE FIXED share p/q of it (its edge never moves: the invariant IS the number); the hand holds the KNIFE — d, the number of equal pieces
of the whole, finer or coarser. The numerator is never chosen: it is READ, and it exists only when the edge falls on a cut
(`inShare = p × d / q` integer ⇔ q / gcd(p, q) divides d). Otherwise one piece straddles the edge and no writing exists. Not the 4AM
`fraction-reduction` (there the hand CARRIES a number of portions over two separate quantities) nor `square-root-side` (a 1D length) —
DNA §12.

| World (level) | What the hand holds | What resists |
|---|---|---|
| `tray` (مبتدئ, theme `sweets-tray`: grandmother's brass tray of « قلب اللوز », the neighbours' share 3/5 marked by her red ribbon; a `KidFigure` girl in hijab holds the neighbours' box and reacts — `proud` / `wonder`) | the knife on a rail under the tray, d = 1 … 20 (stretch: drag, tap the rail, ← / → ±1 — ← finer in RTL —, Page ±5, round −/+) | an unreadable cut draws the straddling piece dashed rose, inside part in the box colour, the ribbon visibly apart from the cuts, « 4 قطع وجزء من قطعة »; then Amine's claim « 3/5 = 4/6 » (card opened by the student once 2 writings are stamped) is judged ONLY with the knife at 6: his 4 pieces are dashed ghosts, the 4th overflows the ribbon by 2/5 of a piece |
| `paper` (متقدم, textbook نشاط 4 on squared paper) | the same knife (a pencil) — task 1 the textbook's rectangles 2 (6/10, red) and 3 (12/20, green) beside rectangle 1 (3/5, yellow), drawn SUPERPOSED as hatchings that coincide; task 2 « هديّة الجدّ » 27/45 (`then`, opened by the student): BEFORE the knife moves, up to 3 pins (d < 45) on the rail, then the knife judges each pin it passes | a pin or a cut at 9 or 3 (divisors of 45) straddles (5,4 / 1,8); readable coarser cuts (15, 5) draw the glue: the 45 old cuts dotted, a bracket over each new piece, « كل 9 قطع ← قطعة واحدة »; at d = 5 rectangle 1 is laid on it (`[data-fk-coincide]`) and « لا فرق بين الهديّتين » |

Each readable commit STAMPS its writing in the « دفتر الكتابات » strip (once; a writing already there is not stamped twice); d = 10, 100,
1000 adds « كسر عشري: 0,6 » to the stamp. **Bands:** when a piece would be under 10 px (`MIN_PIECE`), the whole is drawn as B bands read
right-to-left then top-down, B the smallest divisor of `max` that fits (`bandsFor`: d = 45 at 320 px → 3 bands of 15), FIXED for a share;
a piece crossing a band end is drawn as two segments with one almond / one number (`trayLayout`, swept at five widths: each piece once,
≥ 6 px, inside the width, the edge at the exact fraction). **Honesty note:** for 27/45 every multiple of 5 below 45 is readable (10 →
6/10 is a re-cut, not a glue); among the DIVISORS of 45 only 5 and 15 are — the glue is drawn only for those (`glue` needs d′ | d).

`discoveryReady`: tray — 3 writings in the notebook (3/5 + two of the knife), one unreadable cut, Amine's claim answered right (a wrong
« صحيح » is refuted in his own pieces and can be answered again); paper — both targets stamped, 27/45 cut at 5, one refused d < 45 (a pin
or a cut). Discovery « ما الذي يجمع كل الكتابات في دفترك؟ » (wrong: add the same number — Amine's 3,6 pieces; « just enlarge the
denominator » — the student's own unreadable d) / « كيف نمرّ من 27/45 إلى 3/5 …؟ » (wrong: divide the denominator by any divisor — the
student's refused divisor of 45, else 9: 5,4 pieces; divide the denominator alone — 27/5 = 5,4 rectangles). Formal: a/b = (a × k)/(b × k)
(k ≠ 0) with the student's k's, the decimal line when 6/10 was stamped, 27/45 = (27 ÷ 9)/(45 ÷ 9) = 3/5 (and the student's chain
27/45 ÷3 9/15 ÷3 3/5), « نقول إننا اختزلنا الكسر ».

Props `world`, `share` [p, q], `start`, `max`, `claim` [a, b], `targets` [[a, d], …], `then` { share, start, max, predict }, `level`,
`levels`, `title`, `lead`, `onTrial` — `{ kind: 'cut', share: '3/5', d, inShare: '18/5', readable, writing? }`, `{ kind: 'claim', claim:
'4/6', ok, answer: 'true' | 'false' }` (`ok` = the student's judgement matches the tray), `{ kind: 'pin', share: '27/45', d, readable }`
(several trials in one gesture are each reported once) — and `onFinished({ share })` (the share last worked). Not eligible for « جرّب كل
الإمكانيات » (each cut and each pin is an answer). Layout: `PromptCard` in the §17.9 form (context « قسمت الجدّة صينية قلب اللوز إلى 5 قطع
متساوية، وحصّة الجيران 3 قطع داخل الشريط الأحمر. », question « اقطع الصينية إلى عدد آخر من القطع حتى تقع حافّة الحصّة على خطّ قصّ. »,
lamp lit on a readable last cut, the textbook targets under « في الكتاب: ») → the `StageFrame` scene (count pill `[data-fk-count]` above the share, the whole, the rail with the knife; ≥ 600 px
a side `StepperCard` « عدد القطع », narrower the round −/+ at the two ends of the rail and a d pill on the knife) → the notebook strip (one
line; older stamps in `LabFold` `fraction-knife.notebook`) → the `VerdictBanner` (it keeps its place; idle = the gesture line) → the cards
(Amine, the pins, the judged pins row, « لا فرق », the gift). Measured glance (`[data-fk-glance]`, both levels, every state): ≤ 615 / 800, ≤ 583 / 768,
≤ 553 / 844, ≤ 588 / 640 px. DOM: `[data-fraction-knife][data-world][data-share][data-d][data-stage][data-solved][data-layout]`, `[data-fk-glance]`,
`[data-fk-scene][data-bands]`, `[data-fk-knife]` (slider, `aria-valuenow` = d), `[data-fk-pin-cursor]` (the slider during the prediction;
Enter plants), `[data-fk-less]` / `[data-fk-more]`, `[data-fk-piece=<i>][data-in=full|part|out]`, `[data-fk-edge]`, `[data-fk-count]`,
`[data-fk-notebook]`, `[data-fk-stamp=<a/d>][data-figure]`, `[data-fk-decimal]`, `[data-fk-claim][data-judged]`, `[data-fk-claim-open]`,
`[data-fk-answer=true|false]`, `[data-fk-ghost]`, `[data-fk-pin=<d>][data-state=planted|readable|straddle]`, `[data-fk-pin-chip]`,
`[data-fk-plant]`, `[data-fk-start]`, `[data-fk-verdict=readable|straddle|]`, `[data-fk-glue]`, `[data-fk-target=<a/d>][data-done]`,
`[data-fk-next]`, `[data-fk-back]`, `[data-fk-same]`, `[data-fk-formal]`, `[data-fk-girl][data-mood]`.

## 2unvicies. Euclidean division for any divisor and the bracket of the quotient — `egg-trays` (2AM unit 2, 2026-10-14)

`operations/EggTrays.jsx` on `logic/eggTrays.js` (integers through `core/arithmetic/divisibility.js › divmod`, imported by path; floats
only DRAW the marker), drawings in `primitives/EggFigure.jsx` (`Egg`, `TrayBody` — b cells in `trayGrid(b)`, exactly r eggs filled column
by column —, `CartonLid`, `FullTraySlat`, `Pallet`; tested in `primitives/eggFigure.test.jsx`), lesson `qisma-iqlidiya-hasr` (theme
`farm`). The net forbids rebuilding the 1AM lab (`2am.m1.r04` EXTENDS `1am.m3.r01`), so the variable changes (DNA §12): `division-jumps`
puts q in the hand; here b is given and the hand holds **a, the eggs swept from a conveyor into trays** — the first division lab that
holds the dividend. A tray CLOSES by itself at b (a stamp), so it never holds b eggs open: r < b is physical at every scale. Under the
belt, the **trays ruler** is the SAME line read ÷ b (the belt is drawn at the ruler's scale; a dashed plumb line joins the belt handle to
the marker « a ÷ b » at q + r/b), and a **zoom** magnifies [q ; q + 1] as the open tray itself, filled to r/b. What 2AM adds — the
quotient is a NUMBER strictly between q (trays full, by default) and q + 1 (trays needed, by excess), ON a graduation iff r = 0 — is
DISCOVERED by framing it.

| World (level) | What the hand holds | What resists |
|---|---|---|
| `carton` (مبتدئ, platform, Salma in hijab `scarf="mint"`: 50 eggs, cartons of 12 = 2 × 6, ruler 0 … 7, every egg drawn on the belt — `beltLayout`, each egg above i ÷ b) | 1) a one-unit FRAME on the ruler, placed before the first egg (drag / tap the ruler / ←→ / −/+); 2) the belt handle (drag / tap the belt / ←→ ±1, Page ±b / −/+ ±1 egg, ±1 carton) | the belt is LOCKED until the frame is placed (the bet); the frame is LOCKED while eggs flow (0 < a < order) — a bet is not corrected by watching the marker; the belt stops at the last egg (the orange stop shakes, `[data-et-end]`); at the full order the frame is judged — `right` / `below` / `above` (gap in cartons) / `remainder` (the frame on [r ; r + 1]) / `onMark` |
| `tray` (متقدم, textbook نشاط 1 p. 24: 2145 eggs, trays of 30 = 5 × 6, ruler 0 … 74 labelled every 10, ticks every 1) | the same two gestures, plus ±10 trays (±300 eggs) and frame ±10 — the steppers ARE the division by hand (pallets, trays, eggs) | the same; the belt shows the COUNT left; ten closed trays tie into a pallet (`[data-et-pallet]`, the strap draws itself): 7 pallets + 1 tray = 71, the place value of q is SEEN |

Contrast (§7quater, same lab): after the right frame a card « بيض إضافي! » (`[data-et-next]`) grows the order to
`then` (default the next multiple of b: 60, 2160); the frame becomes a bet again (`placed: false`); at the full order the last tray closes
EXACTLY, the marker lands ON 5 / 72: a frame there is judged `onMark`; the student must tap « يقع على عدد طبيعي » (`[data-et-exact]`,
offered at every full order, wrong on 2145). Then (متقدم, `claim`) the farmer's son's card « 2145 = 30 × 70 + 45 »: أوافق / لا أوافق, and
either way his state is REPLAYED (70 trays in 7 pallets, 45 loose eggs poured: one more tray closes at 30, 15 remain) — `ok` = disagreed.
`discoveryReady` = the order done (right frame; or exact when b | a) + `then` done + the claim judged. Discovery « متى يقع حاصل القسمة
على عدد طبيعي بالضبط؟ » → « عندما لا تبقى علبة / صفيحة مفتوحة: الباقي معدوم »; wrong options refuted with the student's numbers
(`refutations`: « even » by a0 if even, else the last EVEN count he swept with r ≠ 0 — 2140 = 30 × 71 + 10 —, else a neighbour; « more eggs
than a tray » by a0 itself and a multiple of b he swept; the « even » option is dropped when b = 2). Formal (`[data-et-formal]`): the
equality and `r < b` with the المقسوم chip + the shared `DivisionRoles`, the bracket `q < a/b < q + 1` (a stacked fraction), then a
SECOND short question inside the formal block (`[data-et-ends]`, « ماذا يمثّل طرفا إطارك؟ », the wrong « الحاصل والباقي » refuted with
the frame and r) that unlocks the names « قيمة مقرّبة إلى الوحدة بالنقصان / بالزيادة » (`[data-et-approx]`, a « renvoi en avant » to
`kasr-hasil-qisma`), `then/b = q` ⇒ « b يقسم … » « … مضاعف لـ b » « … يقبل القسمة على b », and the son's line struck (« 45 > 30 »).

Props `a`, `b`, `then?`, `claim?` ({ q, r } or null), `world` ('carton' | 'tray'), `max?` (default ⌈max(a, then) ÷ b⌉ + 2), `level`, `levels`,
`title`, `lead`, `onTrial` — `{ kind: 'frame', a, b, q, r, n, ok, model }` | `{ kind: 'exact', a, b, q, ok }` | `{ kind: 'claim', a, b, claimQ,
claimR, agree, ok }`, every trial reported once even when two land in one render —, `onFinished({ a, b })`. Not eligible for « جرّب كل
الإمكانيات » (each frame and claim is an answer); no auto-completion. Default: frame [0 ; 1] NOT placed, 0 eggs — neither is a trial.

**Look and one screen (kit §8ter, DNA §17).** No visible title (DNA §17.9: the shell gets `titleHidden`, its `<h3>` stays for screen
readers): a `PromptCard` opens on the CONTEXT with every number (`[data-et-context]`, « جمعت سلمى 50 بيضةً، وكل علبة تتّسع لـ 12 بيضةً. »)
then ONE question naming the goal and the end state (`[data-et-question]`, « ضع إطارك حيث يقع 50 ÷ 12، ثم املأ العلب حتى يفرغ
الحزام. »; `[data-et-order]` on the pair), a lamp lit by a right verdict, then the live pills — full / open, and at متقدم pallets / trays /
open / belt, each with what it counts (« بيض في العلبة المفتوحة ») — over a `StageFrame`. No bare number or control (§17.9): the ruler
carries its caption (`[data-et-ruler-caption]`, « المسطرة: عدد العلب / الصفائح »), the frame pill its label « إطارك », the zoom its caption
(`[data-et-zoom-caption]`, « العلبة المفتوحة مكبّرة »), the belt handle « معبّأ », every −/+ pair the step it adds (« بيضة واحدة »,
« علبة كاملة », « بتدريجة »… — ABOVE the two buttons on narrow screens), the exact button its quotient (« 50 ÷ 12 يقع على عدد طبيعي »), and
the son's replay pills their meaning (« صفائحه المملوءة », « تُملأ صفيحة », « ويبقى »); the scene: a plank wall, a
belt on rollers, the closed cartons (lids) or tray slats on their ruler segments, the open one dashed with r eggs, the ruler, the frame as a
translucent column with bracket ends and its pill (a lock while eggs flow), the zoom, and the farm child at the belt's end (`KidFigure`:
Salma at مبتدئ, the son at متقدم — `mood` happy / wonder / neutral / proud). ONE action panel at a time: ≥ 600 px a side card shows the
FRAME controls before and after the fill (+ the exact button at the full order) and the EGG steppers during it, then the claim card
replaces it; narrower, the same pairs live in a strip INSIDE the stage whose height is FIXED per world (1 / 2 rows, 2 / 3 below 300 px —
full-width pairs), the contrast becomes a one-line card in that strip, and the claim card is laid over the ruler and zoom (without the
kid, who is in the scene) — the stage never changes height between phases. The `VerdictBanner` under the stage keeps its place and
says the gesture once per phase (frame / fill / full). The zoom yields height to the budget (`useLessonViewport` minus the measured
prompt and verdict: 110 → 34 px); on compact widths the belt, gaps, ruler captions and zoom foot are tighter, and on wide screens the contrast
card takes the side column (it replaces the frame card) instead of adding a row. Measured glance (`[data-et-glance]`, both levels, every
state, 2026-10-14 after the §17.9 labels): ≤ 663 / 800, ≤ 663 / 768, ≤ 676 / 844, ≤ 618 / 640 px. DOM: `[data-egg-trays][data-world][data-a][data-b]
[data-count][data-solved][data-layout]`, `[data-et-glance]`, `[data-et-order]`, `[data-et-reading]` / `[data-et-read=<key>]`,
`[data-et-handle]` (slider, `aria-valuenow` = eggs, `aria-disabled` while the belt is locked), `[data-et-step=egg|tray|pallet][data-dir=less|more]`,
`[data-et-frame-step=1|10][data-dir]`, `[data-et-panel=frame|eggs]`, `[data-et-strip][data-rows]`, `[data-et-belt-egg=<i>]` (carton) /
`[data-et-belt=<left>]` (tray), `[data-et-end]`, `[data-et-tray=<i>][data-full]`, `[data-et-pallet=<i>]`, `[data-et-open][data-eggs]`,
`[data-et-ruler=<max>]`, `[data-et-marker][data-q][data-r]` (from the first egg), `[data-et-zoom=<q>]`, `[data-et-frame][data-n][data-state=idle|right|wrong]
[data-placed][data-locked]`, `[data-et-frame-handle]` (slider), `[data-et-exact]`, `[data-et-next]` / `[data-et-next-button]`, `[data-et-claim]
[data-verdict=agree|disagree]`, `[data-et-claim-answer=agree|disagree]`, `[data-et-replay=heap|poured]`, `[data-et-verdict=<kind>][data-et-refused=<model>]`,
`[data-et-formal]`, `[data-et-bracket]`, `[data-et-ends]` / `[data-et-ends-option]`, `[data-et-approx]`, `[data-et-says]`, `[data-et-formal-claim]`,
`[data-lab-fold=egg-trays.trials]`. Tests: `logic/eggTrays.test.js` (a ∈ 0..3000 × b ∈ 1..60 state and marker sweeps, the frame judge on
every (a, b, n), the claim sweep, the flow and gate, the refutation picks, the ruler / belt / zoom geometry at five widths),
`operations/eggTrays.render.test.jsx` (both levels, says-it-once, no rule word reachable before the discovery, hints free of q, q + 1, r).

## 2duovicies. The fraction is the quotient — `fair-share` (1AM unit 4, 2026-10-15)

`operations/FairShare.jsx` on `logic/fairShare.js` (every verdict exact through `core/arithmetic/linear.js` — `frac`, `mul`, `sub`, `cmp`,
`fracText`, `fracDecimal`, imported by path), drawing `primitives/CakeFigure.jsx › Cake` (a ROUND cake: the circle IS the fraction), children `KidFigure` (girls in hijab), theme
`bakery`; lesson `hasil-qisma-kasr`. `a` round cakes lie on a festive table (bunting, المولد النبوي الشريف) for `b` children. **Two DISCRETE steps, no slider** (owner, 2026-10-15):
« قسّم كل كعكة إلى n قطع » (n = 1…12, `setN`, every cake shows its n cuts at once) and « كل واحد يأخذ m قطع » (`commitM`, each press is a judged
trial, m = 0 is none). A child's share is m / n cake. The lab PAINTS the b shares as coloured SLICES on the cakes (kid i takes the interval
[i·x, (i+1)·x] of the cake line; a share may straddle two cakes — `logic/fairShare.js › slicesOf`; each kid keeps a plate with his slice) and judges
b × x against a: `exact` (every cake fully taken), `short` (an untouched sector outlined in rose dashes stays on the table), `over` (ghost cakes in
rose dashes past the last real one: cake that does not exist). Cutting in n = b parts lands for every a and b ≠ 0 (m = a); any n lands iff b divides
a·n; **n = 10 (tenths, `DECIMAL_SPLIT`) never lands for the four lesson orders** — that is the contrast and the source of the student's own decimal
bounds (« 0,6 approchée, 0,7 approchée »). Trials carry `ruler: 'cut' | 'dec' | 'other'` (n = b, n = 10, else). Not `division-jumps` (b given, the hand
holds the number of groups), not `fraction-knife` (the share is fixed, the hand holds the number of pieces), not `egg-trays` (the hand holds the
dividend): here the hand cuts AND picks the unknown QUOTIENT itself.

| Level | Orders (a, b) | What resists |
|---|---|---|
| مبتدئ (`canteen`, platform) | 3 ÷ 4, then « طلب جديد » 2 ÷ 3 | tenths never land (3 ÷ 4: 2,8 then 3,2; 2 ÷ 3: 1,8 then 2,1); quarters / thirds do |
| متقدم (`family`) | 5 ÷ 6, then 7 ÷ 3 | never decimal; the share of 7 ÷ 3 exceeds one cake (a child may take up to ⌈a/b⌉ cakes) |

`discoveryReady`: every lesson order solved (by whichever cut the student chose). Discovery « كيف نكتب حصّة الواحد…؟ »: right « بكسر بسطه عدد
الكعكات ومقامه عدد الأطفال » (no digit), wrong « بعدد عشري… » refuted with the student's nearest decimal trial (`refutations`: x, total, gap) and
« الكسر مقلوب » refuted with b × b/a. Formal: a ÷ b = a/b, b × a/b = a, the decimal when it exists, else the student's own two decimal bounds
(« قيمة مقرّبة بالنقصان / بالزيادة », the exact value is the fraction). Props: `scene` ('canteen' | 'family'), `orders` [[a, b], …], `level`, `levels`,
`title`, `lead`, `onTrial` — `{ order: '2/3', ruler, n, m, x: 'm/n', kind, ok, free }` — and `onFinished({ orders })`. Not eligible for « جرّب كل الإمكانيات »
(each choice is an answer). LabCoach: `coachOf` = `pieces` · `again` · `split` · `next` (controls only; unit test follows it to the end).
Layout: `PromptCard` §17.9 (context with the numbers, ONE question « اختر حصّة الواحد حتى توزَّع الكعكات كلها بالضبط. », lamp, live pills ≥ 380 px),
`StageFrame` scene (cakes with coloured slices, kids with plates), control card (the two −/+ steppers: split, take), `VerdictBanner`, `LabFold`
trials. Measured glance (`[data-fs-glance]`): ≤ 705 / 800, ≤ 584 / 844, ≤ 609 / 640 px (1366 × 768 in the unit e2e). DOM: `[data-fair-share][data-scene]
[data-order][data-split][data-solved][data-layout]`, `[data-fs-glance]`, `[data-fs-prompt][data-lit]`, `[data-fs-scene]`,  `[data-fs-read=share|total]`, `[data-fs-cake=<i>]`,
`[data-fs-table]`, `[data-fs-bunting]`, `[data-fs-split][data-n]`, `[data-fs-take][data-m]`, `[data-fs-step-less|more=split|take]`, `[data-fs-step-value=split|take]`, `[data-cake-slice=<kid>]`, `[data-fs-plate-share=<kid>]`, `[data-fs-gap]` (the untouched sector), `[data-fs-over]` / `[data-fs-ghost=<i>]` (a ghost cake),
`[data-fs-free][data-active]`, `[data-fs-free-field=cakes|kids]`, `[data-fs-free-less|more=cakes|kids]`, `[data-fs-free-value]`, `[data-fs-free-back]`, `[data-fs-kid=<i>][data-mood]`, `[data-fs-verdict=exact|short|over]`, `[data-fs-next]`,
`[data-fs-next-button]`, `[data-fs-back]`, `[data-fs-formal]`, `[data-lab-fold=fair-share.trials]`. Tests: `logic/fairShare.test.js` (a ≤ 12 × b ≤ 9
sweeps: n = b lands at m = a, any n lands iff b | a·n, tenths never land for the lesson orders, the share limit never ends on the exact share; the flow, the formal bounds, the
refutations, the coach followed to the end, geometry at five widths), `operations/fairShare.render.test.jsx`; browser `e2e/lesson-kit/1am-hasil-qisma-kasr.mjs`.

**« جرّب أعدادك أنت » — always open (owner, 2026-10-15).** Under the lab, a card with two steppers (cakes 1–12, kids 2–8; `FREE_LIMITS`) lets the student
test ANY other numbers at any moment, from the numbers he is on. `setCustom(s, a, b)` opens ONE free order after the lesson orders (`s.base` = the
number of lesson orders, `isFree(s)`): it restarts (split, pieces, trials of the free order) at every change, its trials carry `free: true` (the lesson
module ignores them — `Module01Nashat.record`), and it NEVER counts for `discoveryReady`, `canNext`, `formalOf` or `finishedEvidence`. « عُد إلى مسألة الدرس » (`toGuided`) returns
to the first lesson order not solved yet. Any new lab of this family should keep this rule: the student can always try his own numbers, and what he
tries on his own never pollutes the guided evidence. Cakes layout: `cakesLayout` (N = b × railMax round cells in 1–3 rows, never overlapping, swept at
five widths); the 1AM lesson words are « كعكة / كعكات » (book independence: the lab's words are the platform's own, `LESSON_DEVELOPMENT_GUIDE.md` §4ter-bis).

**Naming a and b, and why b ≠ 0 (owner, 2026-10-15).** Formal phase: a labelled key « ماذا يقول الحرفان a و b؟ » (`[data-fs-key]`: a = the cakes on the
table, b = those who share them, same colours as the fraction written for each of the student's own orders, `[data-fs-frac]`), then « لماذا لا يمكن
أن يكون b = 0؟ » (`[data-fs-nonzero]`: nobody to give a share to; × 0 always gives 0, so no number times 0 gives a). In the free card a button
« وماذا لو لم يكن هناك أيّ طفل (0)؟ » (`[data-fs-zero-button]` → `[data-fs-zero]`) lets the student test b = 0 on his own cakes (the kids stepper stays ≥ 2: 0 is
explained, never simulated). Module 2 repeats it as a platform-worded definition + a TapQuestion on ÷ 0.

## 2tervicies. The comma under the hand — `decimal-comma` (1AM unit 1, 2026-10-15)

`operations/DecimalComma.jsx` on `logic/decimalComma.js` (every verdict exact through `packages/core/arithmetic/decimals.js`, imported BY PATH —
never the core barrel), drawing `primitives/MosaicFigure.jsx` (the pieces, the tray, the client's table, `TenMachine`, the craftswoman — a girl in
hijab, `KidFigure`), `primitives/mosaicLayout.js` (pure block layout) and `primitives/CommaSlip.jsx` (the slip of digit tiles and its comma handle);
theme `mosaic`; lesson `kusur-ashriya-kitaba` (module 1 = the `mosaic` world, module 4 = the `machine` world). **The DIGITS are printed and fixed;
the hand holds the COMMA** — its place in the string of digits, i.e. the number of digits after it (`point = len − pos`). The value is N / 10^point, an
OUTPUT: drawn in honest blocks (`mosaic`) or read on rank names (`machine`). Not `rank-exchange` (the hand moves QUANTITIES between ranks, the written
digits are an output), not `digit-cards` (the digit is the object), not `fraction-knife` / `fair-share` (the hand holds a number of pieces / a share).
What resists: the comma never leaves the string of digits; in `machine` it cannot pass the last digit (a zero must be ADDED there first).

**Arithmetic — `core/arithmetic/decimals.js`.** A value is `{ n, k }` = n / 10^k (`n` a safe integer ≥ 0; comparisons and shifts through BigInt, text made
digit by digit — no float). Public API: `make`, `fromSlip(digits, point)`, `parse('2,35' | '2.35' | '3125/1000')` (the denominator must be a power of ten, else
`null`), `cmp` / `eq`, `normalize`, `format` (keeps the k decimals) / `formatTrim` (2,50 → 2,5), `slipText(digits, point)` (the slip as written: `('05', 2)` →
`0,05`, `('235', 3)` → `0,235`), `slipValueText`, `fractionOf` / `fractionText` (`235/100`, `235/1`), `shift(v, e)` (× 10^e, exact), `opExponent('×1000' | '÷100' | '×0,01' …)` and
`OPERATORS` (the nine of the machine), `integerPart`, `countOfExp(v, e)` (« عدد الأعشار » = `countOfExp(v, −1)`: 217,48 → 2174), `rankName(e)` (الآحاد …
الأعشار، الأجزاء من مائة، من ألف …), `exponentsOf(digits, point)`, `decomposeDigits` / `rankTable` / `decomposition(v)` (`2 + 3/10 + 5/100` and `2 + 3 × 0,1 + 5 × 0,01`, empty ranks
absent), `partName(k, count)` + `readFraction` (« مائتان وخمسة وثلاثون جزءًا من مائة ») + `readTail` (« ثلاثة أعشار وخمسة أجزاء من مائة »; the noun agrees with
the last two digits from 100), `piecesOf(v)`. Tests: `arithmetic/decimals.test.js` (14 blocks: parse / format round trip over every string of ≤ 5 digits at every comma place, exact compare, shift ± 3 reversible, the
Arabic reading).

**Tasks** (the `tasks` prop; a single object is tolerated; digits are a STRING of 1–6 Latin digits, may start with 0):

| kind | fields | the job | judged by |
|---|---|---|---|
| `match` | `digits: '235'`, `target: '2,35'` | the client's table shows the target in blocks; slide the comma until the workshop tray equals it | exact value N / 10^p = target |
| `fraction` | `digits: '3125'`, `target: '3125/1000'` | no blocks on the client's side: an ORDER card with the fraction (the zeros of the denominator drawn as boxes); the tray still shows the slip's blocks | exact value = target |
| `shift` | `start: '143,75'`, `op: '×1000'` | `machine` world: input slip (comma fixed) → machine → OUTPUT slip that starts with the same digits and the same comma | exact value = start × 10^e |

Presets (`levels.js`, the lead's): مبتدئ `[match 235→2,35, match 37→0,37, match 05→0,05]`, متقدم `[fraction 3125/1000, fraction 605/100, match 250→2,5]` (each target has exactly ONE
comma place — tested, `solutions()`). The `machine` tasks come from the module (`MACHINE_PRESETS` in `logic/decimalComma.js` when it passes none): مبتدئ `3,5` ×10 · ×100 · ÷10 · ÷100,
متقدم `143,75 ×1000 · 43,7 ÷1000 · 27,5 ×0,1 · 0,6 ×0,01`. Zeros each shift task needs (`zerosNeeded`, tested): ×10 → 0, ×100 → one on the right, ÷10 → 0, ÷100 → one on the left; ×1000 of 143,75 → one on
the right, ÷1000 of 43,7 → one on the left, ×0,1 of 27,5 → 0, ×0,01 of 0,6 → one on the left (×1000 of 3,5 would need two on the right).

**The slip (both worlds).** `CommaSlip`: a LTR island of big digit tiles (≥ 40 px tall; the digit is its own, never moved), `len + 1` gaps, a round **comma handle** (48 px, a `role="slider"`
button: `aria-valuenow` = point, `aria-valuetext` = the number as written) in a lane above the tiles with a small rail and chevrons. Three paths, same result: **drag** the handle (it follows the
pointer, the nearest gap lights, it snaps on release; pulled at least HALF A STEP beyond an end it reports the out-of-string intent), **tap a gap** (every gap is a button one step wide: tapping a tile picks the nearest
gap), **keyboard** on the handle (← → one gap — the island is LTR: ArrowLeft goes left —, Home / End). A release that changes nothing is NOT a trial (§6bis.2: a default is not a trial); every other release
is judged and reported ONCE; a keyboard step is a release (so ArrowLeft ×2 from « 235 » passes « 23,5 » then judges « 2,35 »). The comma is written between the tiles (a drop with a tail); an integer shows none; before
the first digit the slip prints a ghost `0` (« 0,235 »). Under each tile the **rank pill** follows the comma (colour = the rank: units teal, tenths amber, hundredths rose, thousandths violet, above indigo / blue):
the same colours as the pieces and the pill is the only place the rank name is written. Beside the lab, the **readout**: the number as written (`[data-dc-written]`, e.g. `2,50` — trailing zeros kept) and its fraction
(`[data-dc-fraction="235/100"]`, the denominator's zeros drawn as boxes; a whole number shows `/1`).

**World `mosaic` (the zellige workshop).** One PANEL = 10 × 10 tiles = 1; a STRIP is one column of 10 tiles as tall as the panel (1/10); a TILE is one tile (1/100); a SHARD is ONE of the ten
slivers of a tile (1/1000) — too fine for the scale, so it is shown in a **magnifier** (the tile enlarged, cut in 10, as many slivers filled as the thousandths digit) and `[data-dc-block=shard]` counts the filled
slivers. Every rank ABOVE the units (tens, hundreds …) collapses into ONE symbol — a stack of panels with a « ×N » badge (`[data-dc-block=panel][data-count=N]`, N exact; not to scale: the badge IS the count). Digits finer than
the shard (a 4th decimal in the free panel) are not drawn: a pill « + أجزاء أصغر من شظية » says so without lying about their size. One panel side `s` is chosen PER TASK (the smallest that fits the client's table and the tray at every
comma place, `mosaicLayout.commonScale`), so the table and the tray are drawn to the same scale and the size of the pieces changes when the comma moves while nothing jumps. Two zones: **طاولة الزبون** (the target as blocks, or the order
card for `fraction`) and **صينيّة الورشة** (the slip's amount, re-drawn at every comma move, a short « fall » of the pieces — instant under `prefers-reduced-motion`). Verdict (a banner that never moves the stage): `exact` — the tray's
label turns into the « مطابق » stamp, the craftswoman is proud —, `more` / `less` — « في الصينيّة 23 لوحةً و5 أعمدة: أكثر ممّا طلب الزبون » (`exact` says only « الصينيّة تطابق طاولة الزبون بالضبط ») (her own pieces, never the rule, never where the comma should be). A solved task stays solved;
the comma stays movable.

**World `machine` (« آلة العشرة »).** Input slip (read-only, its ranks named) → a glass machine with the operator pill (`[data-dc-op]`, the links of every digit visible through it) → the OUTPUT slip (the student's). Two `+ 0` buttons at the
ends of the output (`[data-dc-zero=left|right]`, at most 3 each side; the outermost added zero is removed by tapping it). **An added zero never changes the value** — the comma stays attached to the digits it was between (left zero:
`pos + 1`; right zero: `pos` unchanged; `activeOf`, `addZero`, `removeZero`, tested). The output tiles stay vertically aligned with the input digits (the core digits keep their x; zeros extend outward), the rank pill of every digit that moved gets an
amber ring and a `+3` / `−2` chip (the digit's own rank change on HIS board). A release beyond the last digit (pulled half a step past an end, or a key pressed at the end) is **refused with `nodigit`** (« لا رقم هنا: أضف صفرًا »): the comma sits at
the end, the slip shakes (`dc-shake`, without remounting: the keyboard focus stays on the handle) — unless the value at the end is already right (then it is an ordinary `exact`). Judged on every release and every zero change:
`exact` · `more` · `less` (« بطاقتك تقرأ 0,35: أكبر ممّا تُخرجه الآلة »). The leading zero before the comma is automatic; an extra zero is never an error when the value is right, and the formal phase shows the writing WITHOUT unnecessary zeros.

**« جرّب أعدادك أنت » — always open.** A card under the glance with a digits field (≤ 5 digits, `inputMode` numeric in `mosaic`, decimal in `machine` where ONE comma may be typed: « 14,37 » sets the input comma) and, in `machine`, the nine operators
(`D.OPERATORS`). Typing starts a free board (`setFree`, `setFreeOp`): its trials carry `free: true` and NEVER count for `discoveryReady`, `canNext` or `onFinished`; « عُد إلى مهامك » (`toGuided`) returns. In free `mosaic` the left zone disappears (no target)
and the banner reads the tray (« على الصينيّة … »); in free `machine` the judge compares with the chosen operator.

**Discovery and formal phase.** `discoveryReady` = every task of the sequence solved. Discovery (`ManipulationDiscovery`) — mosaic: « ماذا يغيّر موضع الفاصلة؟ », right « كل خطوة نحو اليمين تجعل القطعة التي يعدّها الرقم أصغر بعشر مرّات » (no digit), wrong
« الفاصلة لا تغيّر المقدار، بل طريقة قراءته فقط » (refuted with his own boards: the digits 235 wrote `235` then `0,235`; `sameDigitsPair`) and « العدد الذي فيه أرقام أكثر بعد الفاصلة أكبر دائمًا » (« في 0,235 3 أرقام بعد الفاصلة، وفي 23,5 رقم واحد فقط،
ومع ذلك 0,235 هو الأصغر »); machine: « ماذا فعلت الآلة بأرقام عددك؟ », right « نقلت كل رقم عدد المراتب نفسه … », wrong « غيّرت الأرقام نفسها » and « أضافت أصفارًا فقط » (refuted with the task that needed the fewest zeros, `machineWitness`).
Formal, mosaic: one card per solved task (`2,35 = 235/100`, its reading, the decomposition in both forms, empty ranks absent), the rank table of the LAST task (zero ranks greyed), « عدد الأجزاء من مائة في 2,35 هو 235 » once, the zero that keeps an empty place
(0,05) and, if a task ended with a useless zero, `2,50 = 2,5`; formal, machine: the before / after rank table of the last task and « ÷100: انتقلت الفاصلة مرتبتين إلى اليسار » in HIS numbers, the writing without useless zeros, the rule.

**Props.** `world` ('mosaic' | 'machine'), `tasks`, `level`, `levels`, `title`, `lead`, `coach` (default true), `onTrial`, `onFinished`.
`onTrial({ task, kind, digits, point, shown, value, target, ok, verdict, zeros, free })` — `task`: index of the guided task (a free trial keeps the current one), `kind`: `match` | `fraction` | `shift` (a free `mosaic` trial reports `match`),
`digits`: the slip's digits INCLUDING added zeros, `point`: digits after the comma, `shown`: the slip as written (`2,50`), `value`: exact, trailing zeros dropped (`2,5`), `target`: the task's string (`2,35`, `3125/1000`) or the machine's result (`143750`) or `null` (free `mosaic`),
`ok` true ONLY when value = target, `verdict`: `exact` | `more` | `less` | `nodigit` | `null` (free `mosaic`), `zeros: { left, right }`, `free`. `onFinished({ tasks })` — ONCE, when every guided task is solved (before the discovery is answered; `tasks` = the task objects as given).
Not eligible for « جرّب كل الإمكانيات » (every release is the student's experiment). LabCoach: `coachOf` = `grab` · `move` (the handle) · `zero` (after a `nodigit` refusal, the « + 0 » of the side pushed against) · `next` — never where the comma should end; followed to the end of every task of both worlds
and levels in `logic/decimalComma.test.js`, strings `decimalComma.coach.*`.

**Layout.** `[data-dc-glance]` = the prompt (CONTEXT with every number, then ONE question, no title — « حرّك الفاصلة حتى تتطابق الصينيّة مع طاولة الزبون. »), the stage, the readout and the banner; the free card sits below the glance. Lab width ≥ 700 px: the stage on one side and a column
(the craftswoman scene, the readout, the banner) on the other; below 700 px the readout and the banner share a row and the craftswoman is the round avatar at the banner's start (she « speaks » the verdict). The stage height comes from `useLessonViewport` (the `overhead` measure is
hysteresis-guarded: without the guard two heights chased each other in `machine`). All numbers are LTR islands, Arabic is DOM text. Measured glance (`[data-dc-glance]` height / viewport; lab width): ≤ 846 / 1024 at 768 × 1024 (lab 494 px), ≤ 753 / 768 at 1024 × 768 (lab 414 px), ≤ 761 / 800 at 1280 × 800 (lab 670 px), ≤ 699 / 768 at 1366 × 768 (lab 756 px), ≤ 664 / 1080 at 1920 × 1080 (lab 1310 px), both worlds, both levels, initial and every mid-activity state of the sweep.

**DOM.** `[data-decimal-comma][data-world][data-task][data-solved][data-layout]`, `[data-dc-glance]`, `[data-dc-slip=input|output][data-dc-point]`, `[data-dc-digit=<i>][data-added=left|right]`, `[data-dc-comma][data-point][data-dragging]`, `[data-dc-gap=<j>][data-here]`,
`[data-dc-rank=<i>][data-exp][data-changed]`, `[data-dc-delta]`, `[data-dc-ghost]`, `[data-dc-written]`, `[data-dc-fraction="N/D"]`, `[data-dc-table=target|tray]`, `[data-dc-order]`, `[data-dc-block=panel|strip|tile|shard]` (`data-count` on a bundle),
`[data-dc-lens]`, `[data-dc-op]`, `[data-dc-machine]`, `[data-dc-link]`, `[data-dc-zero=left|right]`, `[data-dc-verdict=exact|more|less|nodigit]`, `[data-dc-prompt][data-lit]`, `[data-dc-context]`, `[data-dc-step=<i>][data-done]`, `[data-dc-next]`, `[data-dc-stamp]`,
`[data-dc-free][data-active]`, `[data-dc-free-digits]`, `[data-dc-free-op]`, `[data-dc-free-op-button=<op>]`, `[data-dc-free-back]`, `[data-dc-formal=mosaic|machine]`, `[data-dc-kid=<mood>]`, `[data-lab-fold=decimal-comma.trials]`, the LabCoach markers.

**Tests.** `logic/decimalComma.test.js` (every digit string ≤ 4 digits at every comma place: value N / 10^p; each preset target has one comma place; the zeros each shift task needs; judge verdicts, `nodigit`, zeros keep the value; the free panel never counts; the coach followed to the end of the 4 suites; blocks equal the digits;
the slip layout swept at five widths; the discovery witnesses), `primitives/mosaicLayout.test.js` (honest sizes, nothing overlaps, everything inside its zone at four zone sizes, the exact bundle count), `primitives/mosaicFigure.render.test.jsx` (the DOM counts = the digits at every comma place; the handle is a slider ≥ 44 px),
`operations/decimalComma.render.test.jsx` (both worlds × both levels render, no raw key, context then ONE question, says each thing once, no prompt / hint / idle line leaks the rule, counted nouns, discovery and formal from real states). Browser: `e2e/lesson-kit/1am-kusur-ashriya-kitaba.mjs`.

## 2quatervicies. The ruler graduation under the hand — `ruler-compare` (1AM unit 1, lesson `muqaranat-adad-ashriya`, 2026-10-15)

`operations/RulerCompare.jsx` on `logic/rulerCompare.js` (exact, through `packages/core/arithmetic/decimals.js` imported BY PATH), drawing `primitives/RulerTape.jsx` (the yellow tape on the sand) and `primitives/KidFigure.jsx`
(girls in hijab: `JUMPERS` alternate girl / boy); theme `sandpit`; world `jump` (the only one). **The hand holds the GRADUATION of the measuring ruler** shared by the numbers being compared (m · dm · cm · mm), and in `order`
also places the jumps on the podium. Not `decimal-comma` (the digits are fixed, the hand holds the COMMA), not `rank-exchange` (quantities between ranks), not `fraction-knife` (the number of equal pieces of ONE whole).

**Arithmetic (added to `decimals.js`).** `GRADUATIONS`, `readAt(v, g)` → `{ count: ⌊v·10^g⌋, rest: {n,k} ∈ [0;1[ exact, restIsZero }`, `decidedAt(a, b, g)` (the readings differ, or both fall on the same mark: monotone in g),
`verdictAt`, `minGraduation(a, b)` (= `firstDifferingRank` when a ≠ b; = the longer normalised length when equal), `firstDifferingRank`, `paddedText(v, k)` (4,6 → 4,60), `rowGraduation(values)`. Sweep-tested on > 100 000 pairs.

**Tasks** (the `tasks` prop; one object tolerated):

| kind | fields | the job | judged by |
|---|---|---|---|
| `compare` | `a: '4,6'`, `b: '4,35'` (comma, 1–3 decimals, whole part 0–99) | set the graduation until the ruler separates (or equals) the two jumps, then choose `<` `=` `>` for `a ? b` | exact `cmp` |
| `order` | `values: [3–6 strings]`, `dir: 'asc'\|'desc'` | ONE graduation for the row, then place the jumps in the podium slots (left = first); « تحقّق » | exact order, equal values in any order |

Presets (`levels.js`): مبتدئ 4 compares (4,6/4,35 → dm · 8,05/8,5 → dm · 12,70/12,7 equal from dm · 9,87/10,2 → m), متقدم 2 orders (asc with 7,4 / 7,405 needing the mm; desc with the tie 2,5 = 2,500 and the integer 3).

**What the student sees.** Each jump = a lane: a KidFigure, its bib (name + the written number, the thing to compare) and a tape: the LAST whole graduations of the reading (numbered cells, the last one dark = the reading), then the LEFTOVER cell,
hatched, drawn as the exact fraction of one graduation, and the flag at the exact position; a too-long reading is cut on the left (zigzag), a short one starts on the take-off board. The tape never shows the full length to scale (no verdict by eye).
Beside it the reading badge « n ديسيمتر + باقٍ / بلا باقٍ » (Latin digits). The **ruler control**: a yellow strip of four cells (the tick density grows: 2, 9, 19, 39 ticks) and a 52 px knob (`role="slider"`; drag, tap a cell, ← →); a **lamp**
« المسطرة تفصل / لا تفصل بعد ». **Resistance:** the verdict (or « تحقّق ») is REFUSED while the ruler cannot separate (rose banner with the student's own readings: « كلتاهما تُقرآن 46 ديسيمترًا » — never which finer ruler);
a wrong verdict on a deciding ruler is refuted by the readings; a right one SHOWS (the two bibs become the written numbers with the first differing rank highlighted and the completed zeros ghosted); a wrong order shows the FIRST inversion
with its readings. Placing: pointer drag (ghost follows the finger; drop on a slot or back on the sand), tap-tap (select a jump, tap a slot; a placed jump can be picked up), keyboard (Tab / Enter / ← →).
**Always-open « جرّب أعدادك أنت »** follows the kind of the current task. `compare`: two inputs (comma or dot, ≤ 3 decimals, whole part ≤ 99) put the same stage on the student's pair. `order` (the podium): SIX inputs (« القفزة 1 » … « القفزة 6 », a 3×2 grid under 768 px of card, 6 in a row above; ≥ 44 px, `dir=ltr`), 2 to 6 valid numbers (empty fields ignored, one lone number is not enough, an invalid text changes nothing) and the SAME ordering activity on them (ruler graduation, podium slots, tap-tap/drag/keyboard, « تحقّق » refused while the ruler does not separate every pair, first inversion shown), in the direction (asc/desc) of the current task; a new series resets the ruler and empties the slots. `logic/rulerCompare.js › setFree(s, texts[])` (`setFree(s, a, b)` still valid for compare), state `free: { kind, vals, g, slots?, dir? }`. `free: true` trials never count (not for the task, the discovery or `onFinished`); « عُد إلى مهامك » returns the guided board intact. Not « جرّب كل الإمكانيات ».
**Discovery** « ما الذي يحدّد أيّ العددين أكبر؟ » with two wrong options refuted by HIS pairs (`witnesses`: more decimals but smaller; the digits after the comma read as a natural number); formal phase: each solved comparison written with the
first differing rank highlighted, completed with zeros and as two natural readings, the order chain with its symbols, the rule once. LabCoach (`coachOf`: `ruler` → `verdict` → `next`; `ruler` → `place` → `check` → `next`) never points at an answer.

**Callbacks.** `onTrial({ task, kind: 'compare'|'order', event: 'ruler'|'verdict'|'place'|'check', g: 0..3, a, b, verdict: '<'|'='|'>'|null, ok: true|false|null, decided, free, … })`: `ruler` (graduation changed; `ok` null),
`verdict` (`ok` null + `refused: 'coarse'` when refused), `place` (+ `jump`, `slot` (null = back to the sand), `text`, `order`), `check` (+ `order`, `inversion`, `refused`; `a`/`b` = the first inverted pair). `onFinished({ tasks })` once.
**DOM.** `[data-ruler-compare][data-world][data-kind][data-task][data-solved][data-layout=wide|medium|narrow]`, `[data-rc-glance]` (≤ 980 px wide), `[data-rc-grad=0..3][data-active]`, `[data-rc-knob]`, `[data-rc-lamp][data-decided]`,
`[data-rc-reading=<i>][data-count][data-g]`, `[data-rc-rest=<i>][data-rest="n/10^k"][data-zero]`, `[data-rc-tape][data-count][data-shown][data-broken]` (`[data-rc-restcell][data-frac]`, `[data-rc-flag]`), `[data-rc-verdicts]`, `[data-rc-verdict=lt|eq|gt][data-state][data-locked]`,
`[data-rc-jump=<i>]`, `[data-rc-tray]`, `[data-rc-slot=<i>]`, `[data-rc-check]`, `[data-rc-next]`, `[data-rc-banner]`, `[data-rc-refused=coarse|order]`, `[data-rc-free][data-active][data-rc-free-kind=compare|order]`, `[data-rc-free-input]` (`a`/`b` or `1`…`6`), `[data-rc-free-n=<1..6>]` (order), `[data-rc-free-back]`, `[data-rc-formal]`, `[data-rc-kid=<id>]`, `[data-lab-fold=ruler-compare.trials]`.
**Layout.** The lab column is only ≈ 414 px wide at 1024×768 (menu open) and 494 px at 768×1024: below 640 px a lane has two rows (kid + bib + reading, then the tape), below 560 px the verdict and the banner stack. Tests:
`logic/rulerCompare.test.js`, `operations/rulerCompare.render.test.jsx`, `decimals.test.js`.

## 2quinvicies. The tile under the hand — `tile-yard` (1AM unit 11, lesson `masahat-muhit-sath`, 2026-10-15)

`surface/TileYard.jsx` (+ `YardBoard.jsx`, `FloorBoard.jsx`, `tileArt.jsx`, `useHand.js`) on `logic/tileYard.js` (exact, through `packages/core/arithmetic/surfaces.js` imported BY PATH); theme `courtyard`; strings `lesson.manipulation.json › tileYard`. **The hand holds ONE TILE (a unit area) and carries it.** An area is the NUMBER OF TILES, a perimeter the NUMBER OF FENCE STICKS round them: two measures that are READ (never typed), side by side, never merged, moved independently by the same gesture. Not `square-tiling` (k, the tiles per side), not `fraction-knife` (pieces of one area). « جرّب كل الإمكانيات »: NOT eligible (each placement IS an answer); no « جرّب أعدادك » (nothing to type).

**Arithmetic (`surfaces.js`, integers and halves).** cells `[r,c]`; `area`, `perimeter` (cell sides with a cell on one side only), `isValid` (4-connected, no hollow: an empty cell unreachable from outside by 4-moves), `liftCheck` (`splits` | `hole`), `dropCheck` (`occupied` | `detached` (a corner only) | `hole`), `moveCheck`, `canonical` (invariant under translation, rotation, reflection), `boundaryLoop` (the fence walked in one go, even with a pinched corner), `minPerimeter(n)`, `areaRange(p)`, floor: `formatHalves`, `floorHalves`, `halvesInTwo` (21 cells = 10,5 unit ② for ANY pairing), `validPairing`. Tested by exhaustive enumeration of all 12-tile yards (perimeter even, 14…26, 14 only for the 3 × 4) and of the rope-12 areas (exactly 5…9).

**Worlds and props** (`<Manipulation type="tile-yard" … />`; `state.report` for every callback): `world` `'yard'` | `'floor'`; `mode` `'fence'` | `'rope'` (yard); `tasks` (floor: `['terrace-halves','terrace-double']`, default both); `level`, `levels` (forced `false` for the floor), `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world, mode })`. Presets (`levels.js`): مبتدئ `{ world:'yard', mode:'fence' }` (12 tiles only MOVED: area fixed, fence varies; tasks `shortest` (kept fence 14) then `twenty` (kept fence 20)); متقدم `{ world:'yard', mode:'rope' }` (a roll of 12 sticks, a heap of 12 tiles: same fence, different areas; tasks `biggest` (kept 9 tiles) then `smallest` (kept 5); a yard may be kept only when the WHOLE rope is used). Floor: scenes `terrace-halves` (14 whole cells + 4 half cells = 16 unit ①) and `terrace-double` (21 whole cells in a staircase: 21 unit ①, then the double tile, 10,5 unit ②; any pairing, a leftover cell takes a half double). `onFinished` fires when the discovery is formalised (yard) or both scenes are read (floor).

**Gestures (three paths each).** Drag a tile; tap the tile then tap the cell; keyboard (arrows move a cursor, Enter takes / drops, Esc lets go, Delete returns a tile to the heap in `rope`, R turns the double). Cells where the carried tile may land glow; the ghost of the yard it WOULD make is drawn dashed with its fence number; a refused move returns the tile with a wobble and the reason is written (`detached`, `splits`, `hole`, `rope`; floor: `overlap`, `outside`, `unit`). The floor also lays a ROW: press on the floor with a single tile in hand and drag (one tile per cell crossed; `autoComplete` is NOT used, the count is the answer). « أمشِ حول السياج »: a girl gardener (KidFigure in hijab) walks the fence, one stick per tick, the passed sticks light up. « أحتفظ بهذا الحوش » stamps the yard (a mini drawing + its two numbers) into the notebook; never two congruent yards (a note instead).

**Events (`logic/tileYard.js`, exact).** yard: `{kind:'move'|'add'|'remove', world:'yard', mode, tiles, fence, prevFence}` · `{kind:'refused', reason}` · `{kind:'walk', tiles, fence}` · `{kind:'keep', mode, tiles, fence, shape}` (NEW yards only) · `{kind:'task', task:'shortest'|'twenty'|'biggest'|'smallest'}`. floor: `{kind:'lay', scene, unit:'one'|'half'|'two', area[, areaTwo]}` (decimal-comma strings; `areaTwo` on the double scene) · `{kind:'refused', scene, reason}` · `{kind:'read', scene, unit:'one'|'two', value}`.

**Discovery** (`ManipulationDiscovery`, never a `shows` line before it): fence « ماذا بقي ثابتًا… » / rope « هل يتعيّن عدد البلاطات؟ » with the wrong options refuted by HIS kept yards (`witnesses`); `discoveryReady` = ≥ 3 kept yards with ≥ 3 distinct fences incl. 14 (fence) / ≥ 3 distinct tile counts incl. 9 and 5 (rope). The formal block gives the area and perimeter definitions with his own kept pair and the three sentences (same area / same perimeter / both) each illustrated by two of his stamps when they exist. LabCoach: `coachOf` (fence: pick → walk → keep → again → next; rope: add → walk → more → keep → again → next; floor: pick → sweep → half → cover → confirm → next → double → halfTwo), pure and followed to the end of every task in `tileYard.test.js`.

**DOM.** `[data-tile-yard][data-world][data-mode][data-task][data-solved]`, `[data-ty-glance]`, `[data-ty-board]`, `[data-ty-yard]` / `[data-ty-floor-svg]`, `[data-ty-tile=<r>-<c>]`, `[data-ty-cell=<r>-<c>]`, `[data-ty-legal]`, `[data-ty-ghost]`, `[data-ty-area]`, `[data-ty-fence]`, `[data-ty-walk]`, `[data-ty-walker]`, `[data-ty-keep]`, `[data-ty-notebook][data-count] [data-ty-stamp=<i>][data-tiles][data-fence]`, `[data-ty-refused=<reason>]`, `[data-ty-banner]`, `[data-ty-heap][data-count]`, `[data-ty-rope][data-used][data-total]`, `[data-ty-next]`, `[data-ty-step=<i>]`; floor: `[data-ty-floor][data-scene]`, `[data-ty-box=one|half|two|halfTwo]`, `[data-ty-piece=<kind>]`, `[data-ty-reading=<value>][data-unit]`, `[data-ty-confirm]`, `[data-ty-rotate]`, `[data-ty-verdict]`, `[data-ty-formal]`, `[data-ty-def=area|perimeter]`, `[data-ty-sentence=<key>]`.

**Layout.** Measured width: ≥ 600 px the panel (two meters, rope roll, walk / keep, banner, notebook) sits beside the board; below it stacks, the meters shrink to one line and the notebook moves to a `LabFold`. The cell size is budgeted from `useLessonViewport` (26–62 px). Tests: `surfaces.test.js`, `logic/tileYard.test.js`, `surface/tileYard.render.test.jsx`.

## 2sexvicies. The term under the hand — `like-terms` (3AM unit 4, lesson `tabsit-hadhf-aqwas`, 2026-10-20)

`algebra/LikeTerms.jsx` (+ `algebra/likeTerms/`: `Workbench.jsx` the table, `SidePanel.jsx`, `PieceArt.jsx` the drawn pieces, `pieceLayout.js` their pure geometry, `format.js`) on `logic/likeTerms.js` (exact, through `packages/core/arithmetic/brackets.js` + `polynomials.js`, imported BY PATH); theme `workbench`; strings `lesson.manipulation.json › likeTerms`. **The hand holds a TERM** — a pile of identical wooden pieces drawn to scale in the shape of its literal part (x a rod of length x·u, x² a square plate whose side IS the rod, 1 a unit cube; a negative coefficient = the same pieces in the red hatched « opposite » finish) — and CARRIES it. The resistance is the VALUE at x, which the hand also sets (1…6, −/+, every piece re-sizes live). Not `pitch-expansion` / `turf-factoring` (an expression read as an AREA): no area, no rectangle, no expansion. « جرّب كل الإمكانيات »: NOT eligible (each destination, exit and coefficient IS an answer). « جرّب أعدادك »: ALWAYS OPEN.

**Worlds and props** (`<Manipulation type="like-terms" … />`; every callback through `state.report`): `world` `'collect'` | `'brackets'`; `tasks` `[{ id, expr }]` (brackets.js format: terms `{c,p}` and groups `{sign, terms}`); `level`, `levels` (forced `false` for brackets), `coach`, `lead` (replaces the default context sentence on the authored level), `onTrial(event)`, `onFinished({ world })` (on formalisation). Presets (`levels.js`): مبتدئ `collect-1` 2x + 3 + 4x + 1 + x → 7x + 4, `collect-2` 5x + 6 − 2x − 4 → 3x + 2 (running tray readouts, opposite pieces cancel at once, the reduced form writes itself); متقدم `collect-3` 4x² + 7 − x − 2x² + 5x − 9 → 2x² + 4x − 2, `collect-4` 3x² − 4x + 6 + x − 3x² − 2 → −3x + 4 (no readout, both piles stay in a tray; the student sets each tray's coefficient — default never the answer, `defaultCoef` — and « تحقّق » judges). Brackets defaults: `plus` 7 + (2x − 3), `minus` 9 − (4x − 5), `both` 3x + (x − 2) − (5 − 2x).

**Gestures (three paths each).** `useDragInteraction`: drag a pile; tap it then tap the tray / exit; keyboard (arrows move between piles, crates' piles, exits and trays — ← advances in RTL —, Enter takes / drops, Esc lets go). Tray of another shape: REFUSED (`kind`, the engine's rose « will refuse » marker, the pile shakes back), banner with the values of one piece of each shape at x — or at the `kindWitness` x when x = 1 confuses them. Exits « كما هي » / « بعكس إشارتها » ALWAYS accept for the engine (no magnet or hover may betray the right one) and are judged on drop by `isRightExit`: a wrong exit is refused (`sign`) with the written expression's value and the value the table would hold (`witness`). Trays are hidden while a crate holds terms; then collect as in `collect` (readouts visible).

**Invariant.** `tableValue(lab, x) === writtenValue(lab, x)` at every x after every gesture (tested). Two value cards side by side (`[data-lt-value=written|table]`) move together when x moves.

**Events.** `{kind:'sort', world, task, term, tray}` · `{kind:'cancel', world, task, tray}` · `{kind:'refused', world, task, reason:'kind', term, tray, x, termValue, trayValue}` · `{kind:'exit', world:'brackets', task, crateSign, term, flipped}` · `{kind:'refused', world:'brackets', task, reason:'sign', crateSign, term, flipped, x, before, after}` · `{kind:'check', world:'collect', task, tray, ok}` · `{kind:'x', x}` · `{kind:'solved', world, task, expr, opened, result}` (LaTeX, `expressionTex` / `openedTex` / `simplifiedTex`) · `{kind:'custom', world}`. The free panel's table is task `'custom'` and never ticks an authored task; « عُد إلى المهمّة » returns.

**Discovery** (`ManipulationDiscovery`, nothing before states the rule — render-tested): collect « متى تجتمع حزمتان في حدّ واحد؟ » (wrong options refuted at the student's x: 3x + 2 vs 5x, 2x vs 2x²), `discoveryReady` = both tasks solved (+ one cancellation at مبتدئ); brackets « ماذا حدث لإشارة كل حدّ أخرجتَه من قوسين مسبوقين بـ − ؟ » (« only the first » refuted by the student's own refused second term when it exists, else by a witness), ready when every task is solved. Formal: like terms, sum of coefficients, a term and its opposite, the student's own lines, the value unchanged; for brackets the + and − rules with his lines. LabCoach: `coachOf` (exit · exitMore · sort · x · sortMore · coef · check · next) points at a PILE, the x control, a coefficient setting or a button — never at a tray, an exit or a value; followed to the end of every task, level and world in `logic/likeTerms.test.js`.

**DOM.** `[data-like-terms][data-world][data-task][data-solved]`, `[data-lt-glance]`, `[data-lt-table]`, `[data-lt-line]` (the paper: the expression, the slots that fill as terms leave the crates, `[data-lt-slot]`), `[data-lt-result]`, `[data-lt-row]`, `[data-lt-bundle=<id>][data-c][data-p]`, `[data-lt-ghost=<id>]` (a sorted pile's place), `[data-lt-crate=<item>][data-sign]`, `[data-lt-exit=keep|flip]`, `[data-lt-tray=2|1|0][data-coef]`, `[data-lt-readout=<p>]` (مبتدئ), `[data-lt-coef=<p>]` + `[data-lt-check]` (متقدم), `[data-lt-xbox]` `[data-lt-x]` `[data-lt-x-less]` `[data-lt-x-more]`, `[data-lt-value=written|table][data-v]`, `[data-lt-banner]` `[data-lt-refused=kind|sign|check]`, `[data-lt-next]`, `[data-lt-free]` `[data-lt-add=<p><+|->]` `[data-lt-clear]` `[data-lt-target=row|plus|minus]` (brackets), `[data-lt-formal=collect|brackets]` `[data-lt-rule=…]`.

**Layout.** ≥ 660 px of lab width the panel (banner, the two values, x, the free panel) sits beside the table; below it goes under the table on two columns. The piece unit u (7–18 px) is budgeted from `useLessonViewport` by `fitUnit`, computed at x = 6 so that the table never jumps when the hand changes x. Tests: `packages/core/arithmetic/brackets.test.js`, `logic/likeTerms.test.js`, `algebra/likeTerms.render.test.jsx` (also sweeps `bundleLayout`: every piece once, inside its frame, for n = 1…12 and x = 1…6).

## 2septvicies. The square tanks under the hand — `pythagoras-tanks` (3AM unit 11, lesson `khassiyat-fitaghuras`, 2026-10-20)

`geometry/PythagorasTanks.jsx` on `logic/pythagorasTanks.js` (every verdict exact through `packages/core/arithmetic/pythagoras.js`, imported BY PATH, on `linear.js` fractions and `squareRoots.js › rationalSqrt`); theme `sciencefair`; strings `lesson.manipulation.json › pythagorasTanks`. A science-fair machine: three THIN square tanks of the same thickness (the water is measured in AREA) built outward on the sides of a triangle ABC hinged at A — [AB] = c lies on the table, [AC] = b is an arm turning round A. The two small tanks hold b² + c² of water; « اسكب الماء » pours it into the big tank, which holds BC². **The hand holds the handle C**: it sets the ANGLE at A (mode `angle`, whole degrees 30°…150°) or the LENGTH BC on a tape in tenths (mode `length`; the angle then follows by the law of cosines and is NOT shown — the length must be predicted). The pour is the experiment: plain full at 90° only (`exact`), an overflow at every acute angle / too short BC (`over`, a puddle on the table with its cm²), an empty corner at every obtuse angle / too long BC (`gap`, dashed, with its cm²). Water surfaces stay HORIZONTAL (`waterIn` clips the tilted square under a level found by bisection, `pourFrame(t)` animates the drain and the fill). Not `square-root-side` / `square-fold` / `square-tiling` (4AM `jidhr-tarbii`, which BUILD the square root — no-rebuild rule: here √ is ONLY the calculator key), not `angle-compass` / `ramp-ratios` (ratios). « جرّب كل الإمكانيات »: NOT eligible (each pour is a trial). « جرّب أعدادك أنت »: ALWAYS OPEN (legs 1…12, `setFree`; its trials carry `free: true` and never tick a task or the discovery; « عُد إلى مهامّ الآلة » = `toGuided`).

**Exact rule, never a float.** The verdict in `angle` mode is the sign of (deg − 90) (`angleVerdict`: cos ≠ 0 for every whole degree but 90 in ]0°, 180°[), in `length` mode `pourVerdict(cmp(BC², b² + c²))` on fractions; `capAtAngle` (law of cosines, float) only DRAWS and shows « ≈ ». `sideFrom`, `roundedSqrt` (half-up by BigInt `isqrt`), `truncatedSqrt` (the distractor), `screenSqrt` (10 significant digits: √21 → 4,582575695), `nature(a, b, c)` (longest side, square vs sum: `right` | `acute` | `obtuse`) and `isTriangle` serve the lesson, its tests and the bank's checks.

**Levels and tasks** (`levels.js`; numbers `{ mode, b, c }` = the first machine): مبتدئ `{ mode: 'angle', b: 3, c: 4 }` (platform) — `fill` (pour full at 90°) then `compare` (one pour with a smaller angle AND one with a larger angle); متقدم `{ mode: 'length', b: 5, c: 12 }` (`ex-6`) — `thirteen` (BC = 13) then `surd` (b = 2, c = 3: no tenth fills, 3,6 overflows and 3,7 leaves a gap; the « √ » key opens after TWO pours, `ROOT_AFTER`, and sets the tape on √13 exact, the screen shows 3.605551275). `discoveryReady` = every task done. Discovery « متى يملأ ماء الحوضين الصغيرين الحوض الكبير تمامًا؟ » (wrong « مهما كانت الزاوية » / « منفرجة » refuted by HIS overflow / gap angles and cm²) or « كيف نعرف طول [BC]…؟ » (« BC = AB + AC » refuted by 17 vs his 13; « always a tape mark » by his √13). Formal: BC² = AB² + AC², the hypotenuse named, his own line `5² = 16 + 9 = 25` (or `13² = 144 + 25 = 169`, `BC = √13 ≈ 3,61`), and the contrapositive with HIS failed angle (`BC² ≈ 16,79 ≠ 25` → not right in A).

**Gestures (three paths).** Drag the handle C (pointer captured, the angle follows the finger, `touch-action: none`); −/+ of the `StepperCard` (± 1° or ± 0,1 cm); keyboard on the handle (`role="slider"`, arrows ± 1, Shift ± 10, Enter pours). The scale is fixed on the WHOLE course of the machine (`sweepBox`) so nothing moves under the finger. A girl in hijab (`KidFigure`, « أمينة ») presents the machine: `wonder` → `proud` on a plain fill.

**Events** (`state.report(onTrial, e)`): `{kind:'turn', angle}` · `{kind:'stretch', bc}` · `{kind:'pour', mode, task, verdict, b, c, angle, bc, root, water, cap, capExact, diff, free}` · `{kind:'task', task}` · `{kind:'next', task}` · `{kind:'root', value:'√13', screen, rounded}` · `{kind:'free', b, c}` · `{kind:'guided', task}`. `onFinished({ mode })` on formalisation.

**LabCoach.** `coachOf` = turn · pour · again · next · turn2 · pour2 (angle) | stretch · pour · again · next · root · pourRoot (length): it points at the HANDLE, the pour button, the √ key or « next » — never at a direction (no « + » / « − » target, that would give the angle away); followed to the end of both levels in `logic/pythagorasTanks.test.js`.

**DOM.** `[data-pythagoras-tanks][data-mode][data-task][data-free][data-solved]`, `[data-pt-glance]`, `[data-pt-stage]`, `[data-pt-scene]`, `[data-pt-handle]` (role slider, `aria-valuenow` = degrees or cm), `[data-pt-tank=ab|ac|bc]`, `[data-pt-water=ab|ac|bc]`, `[data-pt-grid]`, `[data-pt-spill]`, `[data-pt-gap]`, `[data-pt-right]` (the right-angle mark: at 90° in `angle` mode, only after a plain fill in `length` mode), `[data-pt-bc]`, `[data-pt-capacity]`, `[data-pt-readout]`, `[data-pt-step-less|more]`, `[data-pt-pour]`, `[data-pt-root-locked]`, `[data-pt-calculator]` `[data-pt-screen]` `[data-pt-root]`, `[data-pt-banner]`, `[data-pt-verdict=exact|over|gap]`, `[data-pt-next]`, `[data-pt-step=<i>]`, `[data-pt-free][data-active]` `[data-pt-free-field=b|c]` `[data-pt-free-less|more]` `[data-pt-free-value]` `[data-pt-free-apply]` `[data-pt-free-back]`, `[data-pt-trials][data-count]` `[data-pt-trial=<verdict>]`, `[data-pt-formal]`, `[data-pt-kid][data-mood]`.

**Layout.** ≥ 640 px of lab width the panel (stepper, pour, √ key, verdict) sits beside the scene (196–232 px); below it a compact row (stepper + pour) goes under the scene. The scene height is budgeted from `useLessonViewport`. Measured glance (`e2e/lesson-kit/3am-fitaghuras-jayb-tamam.mjs`): 811 / 1024 (768 × 1024), 753 / 768 (1024 × 768, the lesson column is only 414 px wide there), 659 / 800, 738 / 768, 991 / 1080. Tests: `packages/core/arithmetic/pythagoras.test.js` (√n rounding swept n ≤ 2000, the textbook's triangles), `logic/pythagorasTanks.test.js` (every angle and every tenth judged, the coach followed to the end, horizontal water of the right area, the sweep box), `geometry/pythagorasTanks.render.test.jsx`.

## 2octovicies. The exponent under the hand — `power-train` (3AM unit 3, lesson `quwat-adad-nisbi`, 2026-10-21)

`operations/PowerTrain.jsx` (+ `operations/powerTrain/TrainArt.jsx`: `TrainDefs`, `Backdrop`, `Locomotive`, `Wagon`, `Knob`) on `logic/powerTrain.js` (exact, through the new `packages/core/arithmetic/powers.js` — BigInt rationals, `pow`, `powSign`, `trainLoads`, `couple`, `powTex` / `factorsTex` / `ratTex`, `exponentOf` — imported BY PATH); theme `railway`; strings `lesson.manipulation.json › powerTrain`. **The hand holds the EXPONENT n**: a train leaves the station carrying 1, every wagon coupled to the right of the locomotive is « × a », every wagon to its left « ÷ a »; n is the train's signed length, read on a graduated rail. The train carries aⁿ — the textbook's definition becomes a gesture: a negative base flips the load's sign at every wagon, no wagon carries 1 (a⁰ = 1), |n| « ÷ » wagons carry 1/aⁿ. Not `decimal-comma` (the hand holds a comma, powers of 10 only) and not a calculator key: the student BUILDS the n factors. « جرّب كل الإمكانيات »: NOT eligible (each released exponent IS a trial). « جرّب أعدادك »: ALWAYS OPEN in `build` (any integer base −9 … 9, ≠ 0; no task ticks).

**Worlds and props** (`<Manipulation type="power-train" … />`; every callback through `state.report`): `world` `'build'` | `'couple'`; `base` (text, « -2 »); `targets` (build: charges as text « 16 », « -1/27 »; each must be aⁿ for exactly one n of the rail, else `init` throws); `tasks` (couple: `[{ m, target, op: 'times' | 'divide' }]` — train A has m wagons, the hand sets B, `target` is the coupled EXPONENT); `level`, `levels` (pass `false` for `couple`), `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. Presets (`levels.js`): مبتدئ `{ base: '-2', targets: ['16', '-32', '1'] }` (the running load is written above every wagon, pairs of negative wagons are linked « + », a lone last wagon marked « − »); متقدم `{ base: '-3', targets: ['-27', '81', '1/9', '-1/27'] }` (no intermediate load, the targets need « ÷ » wagons). Couple default (`PRESETS.couple`): base 2, (3 → 7), (4 → −2: four « × » and six « ÷ » cancel in pairs), (5 ÷ 3 → 2: B's wagons are turned over before coupling). Rail: build −4 … 6, couple B −6 … 6.

**Gestures (three paths).** Drag the yellow knob (≥ 44 px) along the rail — the train follows (`preview`, no trial) and the release is the trial; tap anywhere on the ruler (the tail jumps there); −/+ (`StepperCard`, `[data-pt-less]` / `[data-pt-more]`); keyboard on the knob (role `slider`: ← → ↑ ↓, Home / End). New wagons slide in, the readout pops (`prefers-reduced-motion` stops both).

**Events.** `{ kind: 'release', world, task, base, n, exponent, load, ok, free, target }` (`load` as text « -32 », « 1/9 »; `exponent` = n in build, the coupled exponent in couple).

**Discovery** (`ManipulationDiscovery`, nothing before states the rule): build مبتدئ « الأساس سالب: متى يحمل القطار عددًا سالبًا؟ » (« always » refuted by HIS even train, « when many wagons » by his one-wagon load and his even train — `parityWitness`); build متقدم « بـ n عربة قسمة، ماذا يحمل القطار؟ » (« the opposite » and « zero » refuted by his 1/9 — `inverseWitness`); couple « ما أس القطار الموصول؟ » (m × n and « the larger » refuted by his 3 + 4 — `coupleWitness`). `discoveryReady` = every task done. Formal: aⁿ written as his n factors, the sign sentence with his even and odd trains, a⁰ = 1 (the bare locomotive), a⁻ⁿ = 1/aⁿ (متقدم); couple: aᵐ × aⁿ = aᵐ⁺ⁿ and aᵐ / aⁿ = aᵐ⁻ⁿ with his exponents. LabCoach: `coachOf` (`grab` → the knob, `try` → the stepper, `divide` → the − button once when a target needs n < 0 and the hand never went below 0, `next`; couple `grabB` / `tryB`) — never a number of wagons; followed to the end of every task, level and world in `logic/powerTrain.test.js`.

**DOM.** `[data-power-train][data-world][data-task][data-solved][data-layout]`, `[data-pt-glance]`, `[data-pt-stage]`, `[data-pt-svg]`, `[data-pt-rail=main|A|B]`, `[data-pt-loco]`, `[data-pt-wagon=<k>][data-kind=times|divide]`, `[data-pt-load=<k>]` (مبتدئ), `[data-pt-pair=<i>]`, `[data-pt-alone]`, `[data-pt-knob][data-n]`, `[data-pt-ruler]`, `[data-pt-tick=<k>]`, `[data-pt-merged][data-exponent][data-cancelled]`, `[data-pt-merged-wagon=<i>][data-cancelled]`, `[data-pt-readout][data-load][data-n]`, `[data-pt-factors]`, `[data-pt-stepper]`, `[data-pt-less]`, `[data-pt-more]`, `[data-pt-n]`, `[data-pt-verdict=right|load|free|'']`, `[data-pt-prompt][data-lit]`, `[data-pt-context]`, `[data-pt-next]`, `[data-pt-step=<i>][data-done]`, `[data-pt-free][data-active]`, `[data-pt-free-base]`, `[data-pt-free-back]`, `[data-pt-formal=sign|inverse|couple]`, `[data-pt-kid][data-mood]`.

**Layout.** ≥ 700 px of lab width a side column (236 px: the station master — `KidFigure` in hijab whose `mood` follows the verdict —, the readout, the verdict) sits beside the stage, the −/+ row under the stage; below 700 px the readout and −/+ go under the stage on two columns and the station master becomes a medallion in the verdict. The wagon height is budgeted from `useLessonViewport` (48 / 56 / 64 px caps). Measured glance (`e2e/lesson-kit/3am-quwa-nisbiya.mjs`): build ≈ 575–600 / 1024 (768 × 1024), ≈ 575–625 / 768 (1024 × 768), ≈ 570–600 / 800, ≈ 530 / 768 (1366), ≈ 530 / 1080; couple 747 / 1024, 747 / 768, 635 / 800, 636 / 768, 642 / 1080. Tests: `packages/core/arithmetic/powers.test.js` (the five rules swept over bases and exponents, signs swept, the train and the coupling), `logic/powerTrain.test.js`, `operations/powerTrain.render.test.jsx`.

## 2novemvicies. The distance to zero under the hand — `zero-probe` (2AM unit 3, lesson `muqarana-nisbiya`, 2026-10-21)

`operations/ZeroProbe.jsx` (+ `operations/zeroProbe/SeaArt.jsx` — `SeaDefs`, `Backdrop`, `Scale`, `Boat`, `Diver`, `SensorA`, `SensorB`, `Bound`, `Band` — and `operations/zeroProbe/geometry.js`, the pure layout and label boxes) on `logic/zeroProbe.js` (exact, through the new `packages/core/arithmetic/relative.js` — signed decimals as BigInt HUNDREDTHS: `parse`, `fromSideDistance`, `cmp`, `distance`, `text` / `tex`, `judge`, `solutions`, `sample`, `isImpossible`, `parseFree` — imported BY PATH); theme `researchBoat`; strings `lesson.manipulation.json › zeroProbe`. **The hand holds the DISTANCE to zero `d` ≥ 0**: the length of the cable that unrolls from the sea surface (the zero) to the sensor B; the SIDE (« فوق الصفر » / « تحت الصفر ») is a separate switch; B's relative number is an OUTPUT (side + length). A second sensor A is fixed at a given number. Not `ruler-compare` (1AM: the hand holds the graduation of a ruler of positive decimals) and not `solution-ray` (4AM: the hand holds x on a ray). « جرّب كل الإمكانيات »: NOT eligible (each release IS a trial). « جرّب أعدادك »: ALWAYS OPEN (A = any decimal, |A| ≤ 9,9, `-` or `−` or Arabic-Indic digits accepted; same cable; free trials never count for a task or for the discovery; « عُد إلى مهامّك »).

**Props** (`<Manipulation type="zero-probe" … />`; every callback through `state.report`): `world` (`'sea'`), `tasks`, `level`, `levels`, `coach` (default true), `title`, `lead`, `onTrial(event)`, `onFinished({})`. `tasks` = `{ kind: 'beat', a: '-3', side: 'below'|'above'|null, want: 'lower'|'higher', both?: true }` (make B lower / higher than A; `side` = the side imposed on B, null = the student chooses; `both` = one success on EACH side) or `{ kind: 'between', lo: '-4,5', hi: '-4,3', side: null }` (strict `lo < B < hi`). Numbers: decimal comma, ASCII `-`, 0–2 decimals; `d` runs 0…10 by 1 (مبتدئ) or 0,1 (متقدم) — the level gives the step (`numbers.step`), the lesson never passes it. Presets (`levels.js`, mirrored by `logic/zeroProbe.js › PRESETS`): مبتدئ `[ beat −3 below lower ; beat −3 below higher ; beat 4 above lower ; beat 2 below higher (impossible) ]`; متقدم (`ref: 'method-1'`) `[ between −4,5 … −4,3 ; beat 1,2 lower both ; between −0,4 … −0,2 ]`.

**Rules of the world.** `judge` is EXACT. A cable of length 0 is on neither side: a task that imposes a side (or `both`) is never solved at d = 0 — only a B that really is on that side counts. When no length fits (`isImpossible`, e.g. A = 2, B imposed below, `higher`) the task is solved by the button « لا يوجد طول يحقّق ذلك » (judged exactly); the button is in EVERY task, never gives the answer, and when a length does fit it is REFUSED and shows ONE length that does (`sample`: the shortest, `above` on a tie). The cable never crosses the zero: dragging past it stops at 0; the side is never flipped by the drag. **Resistance:** under the zero MORE cable makes B LOWER (the opposite of the naturals' intuition); a forced side can forbid a task; a zone one tenth wide.

**Gestures (three paths).** Drag the knob (a 44 px ring around the sensor) along the scale — the cable follows (`preview`, no trial), the release is the trial; tap the scale column (the knob comes there); −/+ (`StepperCard`, `[data-zp-less]` / `[data-zp-more]`, « المسافة إلى الصفر »); keyboard on the knob (role `slider`, `aria-valuenow` = d, ←/↓ shorter, →/↑ longer by one step, PageUp/PageDown ± 1, Home / End). The side: two big toggle buttons (≥ 48 px), the length stays when the side changes; a side imposed by the task is shown locked (lock icon). **One trial = one release** (end of a drag, a −/+ click, an arrow, a side change); the back-and-forth during a drag is not one. After a trial the screen writes BOTH numbers and the verdict in words (« B عند −5 وA عند −3: B أخفض من A »), never the rule.

**Events** (`onTrial(e)`, FIXED — the lesson's modules read them): `{ kind: 'release', task, tk: 'beat'|'between', a: '-3'|null, side: 'below'|'above', d: '5', value: '-5', ok, free }` (for `between` also `lo`, `hi`; `value` = B's number, comma, ASCII `-`) · `{ kind: 'none', task, ok, free: false }` · `{ kind: 'side', task, side }` (a side change reports `side` then a `release`). `onFinished({})` on formalisation.

**Discovery** (`ManipulationDiscovery`, nothing before states the rule): مبتدئ « متى يكون المسبار الأبعد عن الصفر هو الأخفض؟ » (« always » refuted by HIS above-zero trial — `aboveWitness`; « only above zero » by HIS below-zero trial — `belowWitness`); متقدم « أيّ العددين أخفض إذا كان أحدهما تحت الصفر والآخر فوقه؟ » (« the farthest » and « the nearest » refuted by his −0,3 / −4,4 against A — `mixWitness`). `discoveryReady` = every task done. Formal: `−4 < −3` and `|−4| = 4 > 3 = |−3|` with HIS numbers, the rule once; متقدم the negative is smaller than every positive.

**LabCoach.** `coachOf`: `grab` (the knob; the bubble is placed ABOVE it — `step.prefer: 'above'`, the cable unrolls below) → `side` (a free-side task, after a first trial: the two side buttons, never which one) → `decide` (≥ 3 distinct lengths tried in vain in a task where NO length fits: the « لا يوجد طول » button; never shown in a solvable task, it would be a hint that it is impossible) → `try` (−/+) → `next`. All the other bubbles sit BELOW their target (`prefer: 'below'`) — in the narrow layout the controls are the last block, so a bubble never covers the stage or the verdict. Followed to the end of every task of both levels in `logic/zeroProbe.test.js`. **`prefer`** is a new optional field of a coach step (`'above'|'below'`, default: the side with more room), passed to `placeBubble({ prefer })` — tested in `primitives/labCoach.test.js`.

**DOM.** `[data-zero-probe][data-world][data-task][data-solved][data-layout]`, `[data-zp-glance]`, `[data-zp-stage]`, `[data-zp-svg]`, `[data-zp-a][data-value]` (A's flag; the `between` bounds are `[data-zp-bound=lo|hi]`), `[data-zp-b][data-value]`, `[data-zp-cable][data-d]`, `[data-zp-knob]` (role slider), `[data-zp-ruler]` (the tap column), `[data-zp-tick=<k>]`, `[data-zp-sides]`, `[data-zp-side=above|below][aria-pressed]`, `[data-zp-stepper]`, `[data-zp-less]`, `[data-zp-more]`, `[data-zp-d]`, `[data-zp-readout][data-b][data-d]` (sr-only under 460 px), `[data-zp-none]`, `[data-zp-verdict=right|wrong|none|free|'']`, `[data-zp-prompt][data-lit]`, `[data-zp-context]`, `[data-zp-next]`, `[data-zp-step=<i>][data-done]`, `[data-zp-free][data-active]`, `[data-zp-free-a]`, `[data-zp-free-back]`, `[data-zp-formal=far|mix]`, `[data-zp-kid][data-mood]`.

**Layout.** ≥ 700 px of lab width: a side column (236 px: the two side buttons, the B / A readout, the verdict with « next », « لا يوجد طول ») beside the stage, −/+ under the stage. Below: stage → verdict (fixed minimum height, so the controls never jump) → the side buttons → −/+ (+ the readout when ≥ 460 px) → one full-width cell that is « لا يوجد طول » until the task is done, then « المهمة التالية ». Under 460 px (the 1024×768 lesson column ≈ 414 px) the task chips float over the stage's top-left corner and the stage is 262 px tall. The scene height is budgeted from `useLessonViewport`; the vertical scale is −10 … 10 m, 18 px of padding. Labels never collide (rules in `geometry.js`: A / bounds in the left column, B right of its sensor, `d` left of the cable, tick numbers behind a white panel right of the axis) — `zeroProbe.render.test.jsx` sweeps every d, both sides, every preset task, 7 stage widths (340–1100) and 4 heights. Measured glance (`e2e/lesson-kit/zero-probe-lab.mjs`, lab column 700 / 414 / 780 / 860 / 1100 px): مبتدئ 851 / 1024 (768 × 1024), 713 / 768 (1024 × 768), 771 / 800, 688 / 768, 740 / 1080; متقدم 851, 683, 771, 688, 740. Tests: `packages/core/arithmetic/relative.test.js` (exhaustive sweep of every d × side), `logic/zeroProbe.test.js`, `operations/zeroProbe.render.test.jsx` (opens on context then ONE question, says each thing once, LTR isolates with the real `−`, label geometry).

## 2tricies. The cut under the hand — `area-split` (3AM unit 4, lesson `nashr-jabri-3am`, 2026-10-21)

`algebra/AreaSplit.jsx` (+ `algebra/areaSplit/`: `PlotScene.jsx` the garden SVG and `PatchCards`, `plotLayout.js` its pure geometry, `ArrowsScene.jsx` the written line with its red arrows and `ProductCards`, `arrowsLayout.js` its pure geometry, `LineRow.jsx` the growing written line and the `ReduceBlock`, `SidePanel.jsx`, `format.js`) on `logic/areaSplit.js` (orchestration, pure) over `packages/core/arithmetic/expansion.js` (the EXACT maths, imported BY PATH: sides `m·x + n`, `cutRight` / `judgeCut`, `patchesOf`, `signJudge`, `coefJudge`, `arrowsOf`, `arrowJudge`, on `polynomials.js`); theme `schoolgarden` (the school garden seen from above: lawn, flower bed, paved path, hedge, a girl gardener « هناء » — `KidFigure`, hijab + tunic); strings `lesson.manipulation.json › areaSplit`. **The hand holds a CUT LINE** (a knob sliding along the edge of a plot) and DECIDES what each parcel counts as (added, or taken away — the paved path, the corner removed twice and given back); in the second world it DRAWS the arrows from a term to every term of the other bracket and decides each product's SIGN. The resistance is always an AREA / a VALUE counted independently at the current x, which the hand also sets (plot x 4…9, arrows x 2…9). Not `pitch-expansion` / `turf-factoring` (a length stretched on a football pitch, zones carried into a sum) nor `like-terms` (piles carried into trays). « جرّب كل الإمكانيات »: NOT eligible (each cut, sign, arrow and coefficient IS an answer). « جرّب أعدادك »: ALWAYS OPEN.

**Worlds and props** (`<Manipulation type="area-split" … />`; every callback through `state.report`): `world` `'plot'` | `'arrows'`; `tasks` — plot `[{ id, h: {m,n}, w: {m,n} }]` (`h` the vertical side, `w` the horizontal one, `m·x + n`, `m` ∈ 0…2, a constant side is never cut), arrows `[{ id, expr: { products: [{ sign: ±1, f1: [terms], f2: [terms] }] } }]` (`{c,p}` terms, a leading minus is `sign: -1`); `level`, `levels` (forced `false` for arrows), `coach`, `lead` (replaces the default context sentence on the authored level), `onTrial(event)`, `onFinished({ world })` (on formalisation). Presets (`levels.js`): مبتدئ `p1` 3(x + 4) → 3x + 12 (a lawn and a flower bed), `p2` 2(x − 3) → 2x − 6 (a paved strip taken away); scaffold = brace labels once the cut is right, the area of each parcel written in a pill, the reduced line writes itself; متقدم (`T('act-3')`) `p3` (x + 3)(x + 2) → x² + 5x + 6 (two cuts, four parcels), `p4` (x − 2)(x − 3) → x² − 5x + 6 (two paths cross: the corner is given back); NO braces, NO pills, the student sets the coefficient of each power then « تحقّق ». Arrows defaults: `a1` 5(x + 2), `a2` −3(x − 4), `a3` (2x + 1)(x − 3), `a4` 3(2 − x) − 4(x − 1) (reduced forms are written by descending powers: `10 − 7x` is `−7x + 10`).

**The plot, step by step.** (1) CUT — before the cut a side is ONE lawn; a knob on the top (`w`) / left (`h`) edge (its number = the unit it stands on) is released at a position: the right ones are `cutRight` (n > 0 → `m·x`, n < 0 → `m·x + n`) or the same split written number-first (`judgeCut`, `swapped`); a wrong release is REFUSED (`reason 'cut'`), the knob goes back, the two numeric lengths the cut makes (« 5 و 7 ») are drawn for 2 s and the banner says they do not fit the side's two terms; a right cut turns the far part into a flower bed (n > 0) or a paved path that BITES the x-term (n < 0). (2) SIGN — one card per parcel (« n° · dims `(−2) × (−3)` · تُضاف / تُطرح », neither pre-selected); the judge is the COUNTED AREA of the plot (`plotArea`, the product of the sides) against the signed sum (`signJudge`; a wrong sign is always off by twice the parcel): refused with the two areas (`reason 'sign'`, `counted`, `written`); a removed parcel is hatched, the corner given back turns back into lawn. (3) REDUCE — مبتدئ: solved at the last sign; متقدم: the cards give way to a `ReduceBlock` (one stepper per power present in the expansion; the default is never the answer; `check` is refused with both values at an x where they differ, `coefWitness`). Two meters (`[data-as-meter=whole|parts]`: the counted area / the sum of the decided parcels) are ALWAYS equal once the signs are right and move together when x moves (tested for every task at every x).

**The arrows, step by step.** The written expression is a row of chips at computed abscissas (`lineLayout`, scaled 0.55–1.32 to the width, never cut); drag from a chip of the first factor (origin `oi`) onto a chip of the other bracket (target `tj`; both numbered over the whole line) — or tap then tap, or Enter / arrow keys / Enter. A red arc is drawn and the product card appears with its magnitude and two NEUTRAL sign buttons; the judge is the VALUE at x of the partial product (with the sign of the product, so a leading minus is a sign decision): refused with `truth` and `shown`. An arrow into its own bracket (`own`), into another product (`other`) or repeated (`twice`) is refused (`reason 'arrow'`, `why`). When every arrow is drawn and signed the cards give way to the coefficient steppers and « تحقّق ».

**Gestures (three paths each).** Knob: pointer drag (released = the trial), tap the knob then tap a tick, keyboard (← → on a horizontal knob, ↑ ↓ on a vertical one MOVE it without judging; Enter / Space releases = the trial). Sign buttons, steppers: buttons ≥ 44 px. Arrows: `useDragInteraction` (drag, tap-tap, keyboard).

**Events** (FIXED — the lesson reads them): `{kind:'cut', world:'plot', task, side:'h'|'w', at, ok}` (+ `{kind:'refused', world:'plot', task, reason:'cut', side, at, a, b}` when not ok) · `{kind:'patch', world:'plot', task, patch, sign, ok, corner}` (+ `{kind:'refused', …, reason:'sign', patch, corner, x, counted, written}`) · `{kind:'arrow', world:'arrows', task, from, to, ok}` (+ `{kind:'refused', …, reason:'arrow', from, to, why}`) · `{kind:'product', world:'arrows', task, from, to, sign, ok}` (+ `{kind:'refused', …, reason:'sign', from, to, x, truth, shown, id}`) · `{kind:'coef', world, task, power, ok}` (+ `{kind:'refused', …, reason:'coef', power, x, counted, written}`) · `{kind:'x', x}` · `{kind:'solved', world, task, expr, expanded, result}` (LaTeX: `3(x + 4)`, `3x + 12`, `3x + 12`) · `{kind:'custom', world}`. The free panel's task is `'custom'` and never ticks an authored task; « عُد إلى المهمّة » returns.

**Free panel** (`[data-as-free]`, always open): two sides `m·x + n` (plot: `h` m ∈ 0…2 and `w` m ∈ 1…2, n ∈ −6…6, never degenerate — `minX`: x > |n| — x is raised if needed) or two factors `a·x + b` (arrows: a, b ∈ −6…6, never both 0), the SAME mechanics; each row shows its live writing.

**Discovery** (`ManipulationDiscovery`, nothing before states the rule — render-tested): plot « كم مرّة نُحصي مساحة الأرض، ولماذا النتيجة واحدة؟ » (« the sum is bigger, the parcels overlap » and « equal for one x only » refuted by the two meters at two x of the student's own plot — `plotWitness`); `discoveryReady` = every task solved. Arrows « ماذا يحدث لكلّ حدّ في القوس الأول؟ » (« only the first term » and « added to each term » refuted by the value at x of the wrong reading — `arrowWitness`); ready after an expression with ≥ 4 arrows is solved (or every task). Formal: the area counted twice, `k(a+b)=ka+kb`, `(a+b)(c+d)=ac+ad+bc+bd`, « كلّ حدّ يضرب كلّ حدّ », `(−a)(−b)=+ab` (plot with a corner), the student's own lines and the value check.

**LabCoach.** `coachOf` (plot: `cut` · `cutMore` · `sign` · `signMore` · `x` · `coef` · `check` · `next`; arrows: `arrow` · `arrowMore` · `productSign` · `x` · `coef` · `check` · `next`) points at the knob, a card, a chip, the x control, a stepper or a button — never at a position, a sign or a target; followed to the end of every task of both worlds in `logic/areaSplit.test.js`. The top knob asks for the bubble ABOVE it (`prefer: 'above'`: below it would cover the plot); the left knob (`cutMore`, always the second cut) has NO text, hence neither bubble nor ring (a bubble beside it would cover the plot, and the gesture is the one just learnt); the other steps sit below their target and may cover the line row / meters while shown (never the knob, a chip, a card or the plot).

**DOM.** `[data-area-split][data-world][data-task][data-solved]`, `[data-as-glance][data-as-budget]`, `[data-as-yard]`, `[data-as-plot][data-u][data-vb]`, `[data-as-side=w|h]`, `[data-as-cut=h|w][data-at]` (the knob, `role="slider"`), `[data-as-tick=<side><n>]` (while armed), `[data-as-ghost]`, `[data-as-brace=<axis><i>]`, `[data-as-strip=<axis><i>]`, `[data-as-badge=<id>][data-sign]`, `[data-as-area=<id>]`, `[data-as-removed=<id>]`, `[data-as-given-back=<id>]`, `[data-as-cards]` / `[data-as-cards-wait]`, `[data-as-patch=<id>][data-sign][data-corner]` + `[data-as-sign=plus|minus]` (`<id>` = `p<i><j>`), `[data-as-dims]`, `[data-as-expr]` (arrows line), `[data-as-origin=<oi>]`, `[data-as-target=<tj>]`, `[data-as-arrow=<oi>><tj>]`, `[data-as-product=<oi>><tj>][data-sign]` + `[data-as-sign=…]`, `[data-as-mag]`, `[data-as-line]` `[data-as-written]` `[data-as-result]`, `[data-as-reduce]` `[data-as-coef=<p>][data-v]` `[data-as-coef-less|more=<p>]`, `[data-as-check]`, `[data-as-x]` `[data-as-x-less]` `[data-as-x-more]` `[data-as-x-pill]` (the value, a `spinbutton`: ← → too), `[data-as-meter=whole|parts][data-v]`, `[data-as-banner]` `[data-as-refused=cut|sign|arrow|coef]`, `[data-as-next]`, `[data-as-free]` `[data-as-free-row=h|w|f1|f2]` `[data-as-free-step=<which>.<field>]`, `[data-as-formal=plot|arrows]` `[data-as-rule=…]`.

**Layout.** ≥ 660 px of lab width the panel (banner, meters, x, free panel) sits beside the scene (the yard: the SVG and « هناء » when 96 px are spare), below it goes under the scene and « هناء » shrinks to a bust in the banner. The plot unit `u` (12–36 px) is budgeted from the MEASURED heights of the prompt, the cards, the line and (narrow) the panel against `useLessonViewport`, with the frame computed at x = 9 so nothing jumps when the hand changes x (`fitUnit`); the margins depend on the level (advanced has no braces). At 1024 × 768 with the lesson sidebar open (column ≈ 400–520 px) the glance block is ≈ 765 px. Tests: `packages/core/arithmetic/expansion.test.js`, `logic/areaSplit.test.js`, `algebra/areaSplit.render.test.jsx`, `algebra/areaSplit/plotLayout.test.js` (the visible parcels tile the plot, no two labels / badges / pills / braces / strips / side writings overlap and all stay in the frame — every task and every free-panel plot, every x, four unit sizes; the arrows row fits 340–620 px).

## 2untricies. The number of an operation under the hand — `equality-lanes` (3AM unit 5, lesson `musawiyat-amaliyat`, 2026-10-21)

`operations/EqualityLanes.jsx` on `logic/equalityLanes.js` (exact, through the new `packages/core/arithmetic/equalities.js` — sides are `linear.js` expressions `{a, b}`, the hidden x a fraction; `applyOp`, `findOps`, `chain`, `trackFor`, imported BY PATH); theme `stadium`; strings `lesson.manipulation.json › equalityLanes`. An equality whose unknown x is HIDDEN; two runners (Salma = left side, Amine = right side, `KidFigure`, a girl in hijab) stand on a graduated wall each at the VALUE of their side — the equality is true ⇔ they stand on the same graduation (shoulder to shoulder when equal, with the green dotted drop line). **The hand holds c**, the number of an operation (a knob on a −9 … 9 rail, −/+, arrows, Home / End), chooses the operation (+ − × ÷) and WHO receives it (both / left only / right only), then presses « نفّذ ». Both: the equality stays true and is rewritten (`2 = 2x − 5`); one only: the runners separate by c (the gap is drawn and written, « تراجع » restores); ÷ 0 is refused (the button stays pressable so the refusal is seen); × 0 keeps `0 = 0` true but empty. Not `equation-balance` (4AM: the hand holds the CONTENTS of a pan). « جرّب كل الإمكانيات »: NOT eligible (each press IS the trial). « جرّب أعدادك »: ALWAYS OPEN (a number n; both runners start at n; its trials carry `free: true`, never tick a task or the discovery).

**Props and presets** (`<Manipulation type="equality-lanes" …/>`; every callback through `state.report`): `left`, `right`, `x` (text), `tasks` = for each task the operations `[[op, c], …]` that FABRICATE the target (`chain`); `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. Presets (`levels.js`): مبتدئ `10 = 4x − 2` (x = 3), four single-operation tasks (−2, +2, ×3, ÷2); متقدم `5 = −3x + 1` (x = −4/3), `×(−2)`, then `×2` and `−3`, then `−1` and `÷(−3)` (x alone). `levels.test.js` measures the pair by the number of operations (4 → 5). Discovery « ماذا لاحظتَ على موقعي المتسابقين؟ » needs every task AND one one-side trial (`oneSide`; the coach proposes it once): « always together » is refuted by HIS one-side gap, « apart after every operation » by his both-sides trial. Formal: `a = b ⟹ a ± c = b ± c`, `ac = bc`, `a/c = b/c (c ≠ 0)` with his own equalities, then ÷ 0 and × 0.

**Events.** `{kind:'apply', task, op, c, who, ok, broke, lost, reached, free, before, after, eq}` · `{kind:'refused', reason:'zero', …}` (÷ 0). `onFinished()` on the discovery. **LabCoach** `coachOf`: grab (the knob) · apply · op · undo · who (once) · next; followed to the end of both levels in `logic/equalityLanes.test.js`. **DOM.** `[data-equality-lanes][data-task][data-solved][data-layout]`, `[data-el-glance]`, `[data-el-stage]`, `[data-el-runner=left|right][data-value]`, `[data-el-guide][data-equal]`, `[data-el-gap]`, `[data-el-ops]`, `[data-el-op=…][data-selected]`, `[data-el-knob][data-c]` (role slider), `[data-el-less|more]`, `[data-el-whos]`, `[data-el-who=…]`, `[data-el-apply]`, `[data-el-undo]`, `[data-el-readout][data-equal]`, `[data-el-verdict]`, `[data-el-next]`, `[data-el-step=<i>]`, `[data-el-free][data-active]`, `[data-el-free-n]`, `[data-el-formal]`. **Layout.** One lane with the two runners (58 px apart when they are closer), values in pills above their heads, the equality as ONE line under the wall, the controls in one card; at ≥ 700 px of lab width the verdict sits in a side column. Measured glance (`e2e/lesson-kit/3am-musawiyat-mutabayinat.mjs`): 742 / 1024 (768 × 1024), 756 / 768 (1024 × 768, the column is ≈ 414 px), 708 / 800, 728 / 768, 703 / 1080. Tests: `packages/core/arithmetic/equalities.test.js`, `logic/equalityLanes.test.js`, `operations/equalityLanes.render.test.jsx`.

## 2duotricies. The sign of a term under the hand — `term-ferry` (3AM unit 5, lesson `muadalat-darajat-ula`, 2026-10-21)

`algebra/TermFerry.jsx` on `logic/termFerry.js` (exact, through the same `equalities.js`: `equation`, `crates`, `moveTerm`, `divideBoth`, `shapeOf`, `isSolved`, `withTermTex`); theme `river`; strings `lesson.manipulation.json › termFerry`. An equation `ax + b = cx + d` whose solution x* is HIDDEN; each side is a river bank, each term a CRATE (the x term, the constant). **The hand carries a crate to the other bank and CHOOSES its sign on arrival** — two docks per bank, « كما هو » / « بعكس إشارته » (drag, tap the crate then the dock, keyboard through the shared `useDragInteraction`). Crossing with the sign changed = adding the opposite to BOTH sides (the equation keeps x*, the barque writes `9x + 1 − 5x = 5x − 7 − 5x`, then the reduced `4x + 1 = −7`); keeping the sign is REFUSED by the calculation of both sides at the hidden x (« 9 و 4 » written, the crate returns, `keepTried`). When x is alone times a coefficient (`ax = n`) the hand sets the DIVISOR (−12 … 12, ÷ 0 refused) and « اقسم »; `x = …` completes the task; « عوّض » writes the substitution in the starting equation. Not `equation-balance` (contents of a pan), `solution-ray` (a probe x), `like-terms` (sorting terms into trays / brackets: no hidden solution, no division). « جرّب كل الإمكانيات »: NOT eligible. « جرّب أعدادك »: ALWAYS OPEN (the student writes HIS equation `5x-3=2x+9`, solution unique and non-zero).

**Props and presets**: `tasks` `[{ left, right }]` (solution unique and ≠ 0, else `init` throws), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. مبتدئ `3x + 2 = x + 8` (3), `4x − 3 = 2x + 7` (5); متقدم `9x + 1 = 5x − 7` (−2), `−2x + 5 = 3x − 10` (a NEGATIVE coefficient: ÷ (−5)), `7x − 190 = 6x + 110` (300). `levels.test.js` measures the pair by the number of tasks. Discovery مبتدئ « ماذا يحدث لإشارة الحدّ حين يعبر؟ » (needs every task AND one refused « كما هو »; « the sign stays » refuted by HIS refused crossing and its values, « always positive » by his crate that became negative), متقدم « ماذا نفعل بالمعامل؟ » (« subtract it » and « multiply by it » refuted with his `ax = n`). **Events**: `{kind:'move', crate, from, flip, ok, value, landed, op, solved, eq}` · `{kind:'refused', reason:'sign'|'zero', values}` · `{kind:'divide', c, solved, solution}` · `{kind:'check', x, left, right, ok}`. **LabCoach** `coachOf`: carry · tryKeep (once; the CONTRAST, never the right dock) · divide · go · check · next. **DOM**: `[data-term-ferry]…`, `[data-tf-glance]`, `[data-tf-paper][data-tf-line][data-tf-equation]`, `[data-tf-bank=L|R]`, `[data-tf-crate=<L:x|L:n|R:x|R:n>][data-kind][data-sign]`, `[data-tf-dock=keep|flip][data-bank]`, `[data-tf-divide]`, `[data-tf-stepper]`, `[data-tf-c]`, `[data-tf-less|more]`, `[data-tf-divide-go]`, `[data-tf-undo]`, `[data-tf-check]`, `[data-tf-verdict]`, `[data-tf-next]`, `[data-tf-free]…`. **Layout.** Banks are `dir="ltr"` (the left side of the written equation is the left bank); the river and the ferrywoman (`KidFigure`, hijab) only appear above 520 px of lab width. Measured glance: 644 / 1024, 669 / 768 (1024 × 768), 614 / 800, 594 / 768, 594 / 1080. Tests: `equalities.test.js` (every `ax + b = cx + d` of a grid solved by crossings + division, every crossing with the same sign refused), `logic/termFerry.test.js`, `algebra/termFerry.render.test.jsx`.

## 2tertricies. The missing number under the hand — `fourth-gauges` (2AM unit 5, lesson `rabi-mutanasib`, 2026-10-21)

`operations/FourthGauges.jsx` (+ `operations/fourthGauges/MarketArt.jsx` — `MarketDefs`, `Backdrop`, `Decor`, `Crate`, `MerchantScale`, `Board`, `PriceCard`, `Gauge`, `Ruler`, `Knob` — and `operations/fourthGauges/geometry.js`, the pure layout, label boxes and tilt) on `logic/fourthGauges.js` (exact, through the new `packages/core/arithmetic/fourthProportional.js` — fractions of `linear.js`: `solve`, `gauge` / `gauges` (states `eq | lt | gt | off`), `decoyValue`, `routes` (the five paths with a `clean` flag per route), `freeAnswer`, `parseFree`, `sideText`, `decimalText`, `showValue` — imported BY PATH, never in the core barrel); theme `souk`; strings `lesson.manipulation.json › fourthGauges`. **The hand holds the number that is MISSING** in a 2×2 price table `[[a, c], [b, d]]` (row 1 quantity, row 2 price; column 1 = (a, b), column 2 = (c, d)): one card is missing (`a`, `b`, `c` or `d` — a QUANTITY can be the unknown) and the other three are imposed. Not `linear-machine` (the hand holds the input x, a dial shows a), `origin-line`, `ratio-ride` (the hand holds the duration), `percent-tag`, `solution-ray` or `story-bars`. « جرّب كل الإمكانيات »: NOT eligible (each release IS a trial). « جرّب أعدادك »: ALWAYS OPEN (three fields a, b, c — positive decimals ≤ 9999 with ≤ 2 decimals, Arabic-Indic digits accepted; the hole is `d`; the ruler fits the answer: `max` = 3 × the fourth proportional rounded up, `step` = the smallest decimal step that reaches it; free trials never count for a task or for the discovery; « عُد إلى مهامّك »; an answer > 99 999 refuses the numbers).

**Props** (`<Manipulation type="fourth-gauges" … />`; every callback through `state.report`): `world` (`'market'`), `tasks`, `level`, `levels`, `coach` (default true), `title`, `lead`, `onTrial(event)`, `onFinished({})`. `tasks` = `{ hole: 'a'|'b'|'c'|'d', a, b, c, d (the hole field OMITTED; the others strings with a decimal comma), rows: ['التفاح (kg)', 'الثمن (DA)'], step: '1', max: '1560', covered?: true, decoy?: true }`; `init` throws when the fourth proportional is not a decimal reachable on the ruler (multiple of `step`, ≤ `max`) or when the decoy is not playable. The row labels « name (unit) » give the unit pill, the context sentence and the name of the first gauge (« في الكيلو » / « في اللتر » / « في المتر المربع » / « في الواحدة » from the unit of row 1). Presets (`levels.js`, mirrored by `logic/fourthGauges.js › PRESETS`): مبتدئ — open gauges — `4 kg → 520 DA / 6 kg → ?` (780), `3 kg → 840 / ? kg → 1400` (5, a QUANTITY), `8 kg → 400 / 12 kg → ?` with `decoy` (600; the decoy lights at 404); متقدم (`ref: 'method-1'`) — COVERED gauges, the number is computed BEFORE releasing — `2,5 → 325 / 4 → ?` (520), hole `b` (1800, step 10), hole `a` (3, step 0,1), `12 m² → 3 L / 18 → ?` (4,5).

**The four gauges** (fixed formulas, left side `L` vs right side `R`; `state` = how `L` compares with `R`): `unit` « في الواحدة » `b ÷ a` vs `d ÷ c` (the price of ONE unit in each column) · `between` « بين العمودين » `c ÷ a` vs `d ÷ b` (how many times the quantity grew / the price grew) · `cross` « الجداءان » `b × c` vs `a × d` · `diff` « الفرق » (the decoy) `c − a` vs `d − b` (only when both are > 0, else `off`). The three true gauges are equivalent (`b ÷ a < d ÷ c ⇔ c ÷ a < d ÷ b ⇔ b × c < a × d`), so they **always lean the same way, whatever the hole**, and are balanced together exactly at the fourth proportional; the sides are the FORMULA's sides, not « the hole's side » (keeping both would reverse a gauge for the holes `b` and `c`). A gauge is `off` when it divides by 0 (the hole at 0 in `a` or `c`: the beam stays flat, dimmed). Two exact numbers sit under each gauge (decimal when finite, never rounded: a non-decimal quotient is written as the fraction of its operands « 700/6 », never « ≈ »); a gauge is OPENED by a touch (its operation and operands: « 520 ÷ 4 » / « 780 ÷ 6 »; `unit` open by default; all open when a gauge is ≥ 170 px wide). A lamp lights when a gauge is balanced. The tilt (`geometry.js › tiltOf`) is 0 at the equality, 3° … 18° otherwise (never beyond one saturated tilt), toward the heavier side; the pans stay level and carry a brass disc whose size is the value's share.

**Tasks.** A task is accomplished by ONE release on the exact fourth proportional (fraction comparison; the typed value is judged as typed). A `decoy` task asks for TWO releases: first the one that lights « الفرق » alone (`b + (c − a)`, 404), then the true one — the true value released BEFORE the decoy is right but does not accomplish the task (the verdict says the decoy gauge is still dark). Covered gauges (متقدم) are veiled until a release, re-veiled as soon as the hand moves again and at the next task. **Resistance:** the veil (predict, then release), the decoy gauge that balances at the WRONG number and never together with the other three, and in « جرّب أعدادك » a fourth proportional that is not a finite decimal (10/3) — no number of the ruler balances the gauges: « الرابع المتناسب 10/3 لا يُكتب عشريًا » (a finite decimal longer than 2 digits, 0,125, gets its own message: finer than the smallest ruler step).

**Gestures (three paths).** Drag the brass knob (a 44 px ring) along the ruler — the gauges follow the finger live (`preview`, no trial; veiled levels stay veiled), the release is the trial — or tap the ruler (the knob comes there); −/+ (`[data-fg-less]` / `[data-fg-more]`, one step) with a numeric field (`[data-fg-input]`, Arabic-Indic digits accepted, Enter = a release judged exactly, Escape / blur gives it up); keyboard on the knob (role `slider`, `aria-valuenow` = the value, ←/↓ one step less, →/↑ one more, PageUp/PageDown 10 steps, Home / End). **One trial = one release** (end of a drag, a −/+ click, an arrow, Enter); the back-and-forth during a drag is not one. The ruler has ten equal unlabelled divisions and the two ends (`0`, `max`): no graduation marks the answer. After a release the screen writes the numbers of the first unbalanced gauge in a sentence (« عند 625: ميزان «في الكيلو» يعطي 130 مقابل 625/6 ») — never the rule.

**Events** (`onTrial(e)`, FIXED — the lesson's modules read them): `{ kind: 'release', task: <index>, hole: 'd', value: '780', ok: true|false, gauges: { unit, between, cross, diff }, decoyHit: false|true, free: false|true, via: 'drag'|'step'|'key'|'type', done: true|false }` — `value` the released number (comma, text); `gauges.*` ∈ `'eq' | 'lt' | 'gt' | 'off'` (`diff` is `null` outside a decoy task and in free mode); `ok` = the three true gauges are balanced; `decoyHit` = the release lit « الفرق » ALONE; `done` = the task is accomplished by this release (extra field: for a decoy task `ok` can be true with `done` false). `{ kind: 'infinite', task, free: true }` follows EACH release of a free table without a decimal solution. `onFinished({})` once every task is done.

**Discovery** (`ManipulationDiscovery`, nothing before states the rule): مبتدئ « ماذا تلاحظ على الموازين الثلاثة عند الثمن العادل؟ » — « تتوازن واحدة في كل مرّة » is refuted by HIS right release (`rightWitness`), « ميزان الفرق يتوازن معها دائمًا » by HIS release at the decoy (`decoyWitness`: « عند 404 يتوازن «الفرق» وحده (12 − 8 = 4 و 404 − 400 = 4) ، أمّا «الجداءان» فلا: … »), « تتوازن معًا عند ثمن واحد فقط » is right; متقدم « لماذا لا يكفي جمع الفرق نفسه؟ » — refuted with the numbers of his last hole-`d` task (`addWitness`: 12 → 18, + 6 on 3 gives 9, the gauges balance at 4,5). `discoveryReady` = every task done. **Formal phase** (the « دفتر », `[data-fg-formal]`): with the numbers of the LAST task, the five paths — coefficient, unit, additive, multiplicative, cross — one line each, computed by `fourthProportional.js › routes` (never retyped); a line is written only when ALL its numbers are finite decimals with ≤ 2 digits (`clean`); the others are named in one note « لا يمكن هنا بخطوة واحدة نظيفة » (`[data-fg-missing]`); then `a × d = b × c` with HIS numbers once.

**Verdicts say the CALCULATION, never a raw fraction** (owner report on `rabi-mutanasib` mission 3, 2026-10-21): a refused release names the gauge and writes both sides as calculations — « عند 551: ميزان «في الكيلو» يقارن 520 ÷ 4 = 130 بـ 551 ÷ 6 ≈ 91,8 — ليسا متساويين » (`fourthGauges.js › calcText`: `=` when the side is a finite decimal, `≈` to one decimal otherwise; each calculation is an LTR isolate with non-breaking spaces so a line break never splits it); the decoy verdict puts the two contradicting calculations side by side (« عند 404 يتوازن «الفرق» وحده (12 − 8 = 4 و 404 − 400 = 4) ، أمّا «الجداءان» فلا: 400 × 12 = 4800 بـ 8 × 404 = 3232 »), kept to ≤ 4 lines so the lab still fits one screen at 1024×768 (the question already states what to do next). The decoy task's question states the two end states (« اضبط الثمن حتى يتوازن ميزان «الفرق» ، ثم حتى تتوازن الموازين الثلاثة الأخرى ») — the word « أضئ » (light up) told a 13-year-old nothing. The stepper's number scales down with its digit count (`text-3xl` → `text-xl`) so a 3–5 digit price is never clipped in the 414 px column.

**LabCoach.** `coachOf(state, { roomy })`: `grab` (the knob; the bubble BELOW it — the ruler is at the bottom of the stage, so below is the verdict / −/+ strip, never the board nor the gauges) → `decoy` (decoy task, after the first release: the « الفرق » gauge, « هذا ميزان رابع: اضغط عليه وراقبه هو أيضًا ») → `gauge` (after 2 releases, when the numbers are not all written (`roomy` false) and « الجداءان » was never opened) → `try` (−/+) → `next`. The `grab`, `decoy` and `gauge` steps carry **`noFlip: true`** with `prefer` — a new optional field of a coach step (`placeBubble({ noFlip })`, tested in `primitives/labCoach.test.js`): the bubble keeps its side even when it leaves the visible band, so it can never flip onto the board or the gauges. Followed to the end of every task of both levels (with and without `roomy`) in `logic/fourthGauges.test.js`.

**DOM.** `[data-fourth-gauges][data-world][data-task][data-solved][data-level][data-layout]`, `[data-fg-glance]`, `[data-fg-stage]`, `[data-fg-svg]`, `[data-fg-cell=a|b|c|d][data-hole][data-value]`, `[data-fg-row=0|1]`, `[data-fg-knob]` (role slider), `[data-fg-ruler]`, `[data-fg-gauge=unit|between|cross|diff][data-state=eq|lt|gt|covered|off][data-open][data-tilt]` (+ `[data-fg-gauge-hit=<id>]`, the tap target, `[data-fg-chip=L|R]`, `[data-fg-cover]`), `[data-fg-lamp][data-lit]`, `[data-fg-less]`, `[data-fg-more]`, `[data-fg-stepper]`, `[data-fg-input]`, `[data-fg-readout][data-value]`, `[data-fg-verdict=right|wrong|decoy|none|free|'']`, `[data-fg-prompt][data-lit]`, `[data-fg-context]`, `[data-fg-steps]`, `[data-fg-step=<i>][data-done]`, `[data-fg-next]`, `[data-fg-free][data-active]`, `[data-fg-free-a|b|c]`, `[data-fg-free-back]`, `[data-fg-free-note=infinite|fine]`, `[data-fg-formal]`, `[data-fg-routes]`, `[data-fg-route=<id>][data-clean]`, `[data-fg-missing]`, `[data-fg-cross]`, `[data-fg-kid][data-mood]`.

**World and layout.** The souk: a striped awning, a linen wall, a wooden price board (the hole card amber and dashed, green when the three gauges balance), three (four with the decoy) small brass balances — the sisters of the merchant's scale drawn as décor on wide scenes — a measuring rod with a brass knob, crates (tomatoes, oranges, potatoes, dates), a garland of peppers and a young customer (`KidFigure`, girl, hijab; `mood` `neutral` → `happy` when the price is right, `wonder` otherwise). The table is read RIGHT to LEFT (the row names on the right, column 1 next to them) and the first gauge is the right-most. Under 460 px of lab width the task chips float over the awning; ≥ 700 px a side column (236 px: the verdict, −/+ with the field, « المهمة التالية ») sits beside the stage, below that they stack under it — verdict first, −/+ after, so the coach bubble under −/+ never hides the verdict. The scene height depends on the width only (≈ 330 compact, ≈ 370 wide). Labels never collide (rules in `geometry.js`, `labelBoxes`): `fourthGauges.render.test.jsx` sweeps 12 stage widths (340–1100), 3 and 4 gauges, open and closed, every preset task plus a decimal one. Measured glance (`e2e/lesson-kit/fourth-gauges-lab.mjs`, lab column 700 / 414 / 780 / 860 / 1100 px; both levels, worst state = a success with « المهمة التالية »): 719 / 1024 (768 × 1024), 709 / 768 (1024 × 768), 719 / 800 (1280 × 800), 561 / 768 (1366 × 768), 554 / 1080 (1920 × 1080); the decoy task 672 / 681 / 672 / 561 / 554. Tests: `packages/core/arithmetic/fourthProportional.test.js` (exhaustive sweeps: every hole × a grid of 2 197 tables, the gauges' tilt consistency, every clean route re-computed line by line), `logic/fourthGauges.test.js`, `operations/fourthGauges.render.test.jsx` (opens on context then ONE question, says each thing once, LTR isolates, label geometry). QA: `e2e/lesson-kit/fourth-gauges-lab.mjs` (a dev-only page written and removed by the script; screenshots at the five sizes, both levels, glance, coach bubble geometry, gestures).

## 2quattuortricies. The percent under the hand — `hundred-grid` (3AM unit 6, lesson `nisba-miawiya-3am`, 2026-10-21)

`proportion/HundredGrid.jsx` on `logic/hundredGrid.js` (exact, through `packages/core/arithmetic/percent3.js` imported BY PATH: `packet`, `partOf`, `rateOf`, `wholeOf`, `factor`, `changed`, `beforeChange`, `chain`); theme `pantry` (the stock of a charity: bags of dates, a tray of 100 equal cells, a basket, a stock-keeper `KidFigure` with hijab); strings `lesson.manipulation.json › hundredGrid`. **The hand PAINTS t cells of a 10 × 10 tray** (drag over the grid, −10 / −1 / +1 / +10, ← → ↑ ↓, PageUp/PageDown, Home/End — `role="slider"`): the stock x is cut into 100 equal packets, one cell is worth x ÷ 100 (the « 1 % », written above the tray once the basket is open), t cells are t % of x. **Distinct from `percent-tag`** (4AM `tatbiqat-tanasub`: a CONTINUOUS price bar whose end is stretched, a bet on a chain): here the whole is DISCRETE, the coefficient t/100 is made visible as the value of one cell, an increase ADDS t cells to the hundred, a decrease REMOVES t of them.

**Tasks** (`kind`): `of` (t given: paint t cells and WRITE how many bags the basket will hold BEFORE it opens), `rate` (the basket must hold exactly `part` bags: search the number of cells, the basket fills live; « too empty / too full » refusals), `change` (`dir` up / down, t %: paint t cells, write the NEW stock; `carry: true` restarts from the stock of the previous task — +20 % then −20 % does not return to 200), `whole` (`part` bags are t % of the stock: the cells are painted, write the whole stock). Every « تحقّق » is a judged trial (MANUAL, §6bis): the line writes what the grid gave (« كتبتَ 15 لكنّ السلّة حملت 36 »). **Presets** (`levels.js`): مبتدئ `15 % of 240` · `60 out of 150` (rate) · `+15 % of 200` · `−20 % of 250`; متقدم `75 → 52,5` · `32 → 8` · `84 is 60 %` (whole) · `+20 %` then `−20 %` carried. `levels.test.js` measures the pair by the number of tasks. Discovery « ما العلاقة بين عدد الخانات وما تحمله السلّة؟ » (« as many bags as cells » and « x − t » refuted with HIS trial numbers). **Free** « جرّب أعدادك »: his own stock (decimal comma accepted), paint freely, the basket reads live. **Events** (`onTrial`): `{kind:'go', task, tk, dir, ok, why:'paint'|'guess'|'short'|'over', painted, t, x, part, basket, guess, expected, packet}`. **LabCoach** `coachOf`: paint · guess · go · next. **DOM**: `[data-hundred-grid][data-task][data-solved][data-layout]`, `[data-hg-glance]`, `[data-hg-grid][data-t]`, `[data-hg-cell=1..100][data-on]`, `[data-hg-basket][data-value][data-revealed]`, `[data-hg-packet]`, `[data-hg-readout]`, `[data-hg-less10|less1|more1|more10|clear]`, `[data-hg-guess]`, `[data-hg-go]`, `[data-hg-verdict]`, `[data-hg-next]`, `[data-hg-step]`, `[data-hg-free]`, `[data-hg-free-x]`, `[data-hg-formal]`. **Layout.** Grid and basket stay side by side (`flex-nowrap`); the cell is bounded by the screen HEIGHT (`(screenH − 560) / 10`, 15–34 px) and by the column WIDTH; the glance block fits 768 × 1024, 1024 × 768 (sidebar open), 1280 × 800, 1366 × 768, 1920 × 1080 at both levels. Tests: `percent3.test.js`, `logic/hundredGrid.test.js`, `proportion/hundredGrid.render.test.jsx`, e2e `e2e/lesson-kit/3am-tanasubiya-sura-b.mjs`.

## 2quinquatricies. The pin on its rail and the ruler on two nodes — `pin-rails` (3AM unit 6, lesson `tanasub-tamthil-bayani`, 2026-10-21)

`proportion/PinRails.jsx` on `logic/pinRails.js` (exact, through `packages/core/arithmetic/graphs3.js` imported BY PATH: `pointsOf`, `offerValue`, `lineThrough`, `onLine`, `classify`, `coefficient`, `valueAt`, `abscissaAt`, `frameFor`); theme `stall` (a neighbourhood stationery stall: a squared frame on a cork board, drawing-pin boxes, a brass ruler, a shopkeeper `KidFigure` with hijab); strings `lesson.manipulation.json › pinRails`. **A price table becomes POINTS of a frame and what the ruler touches judges the situation.** The hand (1) SLIDES a pin along the rail of its column up to its price (drag, tap near a rail, ↑ ↓, PageUp/PageDown, Enter — `role="slider"`; the pin released at the wrong price falls back and the line says the table's price and the direction of the error), (2) lays a straight RULER on two nodes of its choice (O or a pin: drag a ruler end onto a node — the end snaps within 30 px, or ← → then Enter; two ends on the same node swap), (3) in `read` tasks RELEASES a reading pin on the line (along its rail at a given abscissa, or along its row at a given ordinate). **Distinct from `origin-line`** (4AM: a line PINNED at O whose slope is the variable, the points imposed on y = ax) and from `ratio-ride` / `linear-machine` (the hand holds the input x): here the points come from a TABLE (or a « photo »), O is only a node, and the verdict is read from what the ruler touches.

**Tasks** (`mode`): `plot` (the table is shown, lift every pin; the ruler opens when the four are placed), `given` (the pins are fixed: a « photo » of points, ruler only), `read` (the ruler is fixed through O and the pins; ONE pin to release ON the line at `ask.x` or `ask.y`). A rule is `{ a, b?, k?, a2? }`: `a·x` (proportional), `a·x + b` (aligned, the line misses O: « تقطع المحور عند b »), or `a` up to `k` then `a2` (bent). The verdict of a ruler trial (`kind:'rod'`): `full` (touches O and every pin), `pinsHit` without `throughO` (« O خارجها »), or a miss with the farthest node and its vertical gap. A plot / given task is DONE when the situation is judged by what the student tried: proportional ⇒ a full ruler; aligned ⇒ a ruler through O AND a ruler through all pins; bent ⇒ three distinct rulers, one through O and one not. **Presets** (`levels.js`): مبتدئ three shops at 2, 6, 12, 14 boxes — 5 DA a box (plot), 2,5 DA + 10 DA (given), 5 DA for 8 then 2 DA (given); متقدم two photos (sacks of 1,5 kg: full; an empty crate of 4 kg + 0,5 kg a sack: aligned, O out) then three readings on the 1,5 line: (1 ; ?), (7 ; ?), (? ; 15). `levels.test.js` measures the pair by the number of tasks and the readings. Discovery « ماذا لاحظتَ حين وضعتَ المسطرة؟ » (« the ruler always touches everything » refuted by HIS miss, « touching every pin is enough » by HIS offO ruler with its intercept). **Free** « جرّب أعدادك »: his price a and fee b (a 0,5 … 20, b 0 … 30), pins fixed at 2, 4, 6, 8, the ruler tries. **Events** (`onTrial`): `{kind:'pin', task, ok, col, x, y, want, why:'low'|'high'}`, `{kind:'rod', task, ends, full, throughO, pinsHit, count, total, cuts, slope, gapNode, gap, shape}`, `{kind:'read', task, axis, ok, x, y, answer, a, why:'below'|'above'|'left'|'right'}`. **LabCoach** `coachOf`: pin · rod · again · read · next (the bubble sits BELOW its target, `prefer:'below'`, `noFlip`, never over the plane). **DOM**: `[data-pin-rails][data-task][data-mode][data-kind][data-solved][data-layout]`, `[data-pr-glance]`, `[data-pr-plane]`, `[data-pr-pin=<col>][data-y][data-placed]`, `[data-pr-node=<id>][data-hit]`, `[data-pr-rod][data-full][data-through-o]`, `[data-pr-end=0|1][data-node]`, `[data-pr-read][data-axis][data-done]`, `[data-pr-table][data-layout=col|row]`, `[data-pr-readout][data-count]`, `[data-pr-verdict]`, `[data-pr-next]`, `[data-pr-reset]`, `[data-pr-step]`, `[data-pr-free][data-pr-free-a][data-pr-free-b][data-pr-free-back]`, `[data-pr-formal]`. **Layout.** The plane height comes from the lesson screen (`screenH − 500`, 200–380 px); in a column narrower than 560 px (1024 × 768 with the sidebar open: ≈ 410 px) the price table passes UNDER the plane as two rows; a press near a rail grabs the nearest free pin (crowded columns stay usable by finger); the glance block fits the five sizes at both levels. Tests: `graphs3.test.js`, `logic/pinRails.test.js`, `proportion/pinRails.render.test.jsx`, e2e `e2e/lesson-kit/3am-tanasubiya-sura.mjs`.

## 2sextricies. The division by a ratio under the hand — `gear-crank` (3AM unit 2, lesson `maqlub-qismat-kasrayn`, 2026-10-25)

`proportion/GearCrank.jsx` (+ `proportion/gearCrank/BikeScene.jsx`: the SVG world; `proportion/gearCrank/gearArt.js`: the pure geometry — `gearTeeth`, `gearPath`, `pitchRadius`, `chainGeometry`, `chainOffset`, `arcPath`) on `logic/gearCrank.js` (exact, through `packages/core/arithmetic/fractions3.js` — `gearTurns`, `teethFor`, `valueOf` — and `powers.js`, imported BY PATH); theme `bikestand` (the club bicycle in the school courtyard: a chainring and a sprocket drawn with their REAL number of teeth, a chain whose links pass tooth by tooth, a wheel with a red valve, a chalk start line and a FLAG at the target distance to scale, Lina `KidFigure` with hijab who waits at the flag); strings `lesson.manipulation.json › gearCrank`. **The hand TURNS a crank**: the chain moves forward by `teeth` (an integer), the pedal has turned `teeth / F` and the wheel `teeth / R`. The flag is at `target` wheel turns (`target × R` teeth, which must be whole): the student finds how many PEDAL turns that takes — the division `target ÷ (F / R)` made by the hand. Swapping the chainring and the sprocket swaps the ratio: that is the reciprocal (3/5 ↔ 5/3, 5/7 ↔ 7/5), seen as a physical object. Distinct from `fair-share` (one child's share), `egg-trays` (grouping of naturals, the remainder), `fourth-gauges` (the missing cell of a 2×2 board) and `code-lockers` (code wheels): here the variable is a number of turns measured in TEETH, the divisor is a RATIO of two tooth counts and the resistance is the flag (overshoot). « جرّب كل الإمكانيات »: NOT eligible (each release IS a trial).

**Props / worlds** (`<Manipulation type="gear-crank" … />`; every callback through `state.report`): `tasks` (`[{ id, F, R, target: 'p/q' | 'n', predict?: true }]` — `init` THROWS when `target × R` is not whole or a tooth count is 0), `world` `'ride'` (default) | `'reverse'` (module 2: `levels={false}`, `tasks` r1 `40/24 → 1`, r2 `24/40 → 1`: one wheel turn = 3/5 then 5/3 pedal turns, no discovery), `level`, `levels`, `coach`, `title`, `lead` (one line under the question), `onTrial(event)`, `onFinished({ world })`. Presets (`levels.js`, `LEVELS['gear-crank']`; `levels.test.js` measures the pair by the number of tasks and the prediction): مبتدئ (counters live) `m1` 48/24 → 3 (3/2 pedal turns), `m2` 24/32 → 6 (**8 pedal turns, MORE than 6**), `m3` 24/32 → 1 (4/3); متقدم (`predict: true`, ref `know-2`) `a1` 36/48 → 9/2 (6), `a2` 40/24 → 5/2 (3/2), `a3` 30/42 → 10/3 (14/3), `a4a` 42/30 → 1 (5/7) then `a4b` 30/42 → 1 (7/5, « نقلت لينا السلسلة » when a task swaps the previous F and R at the same target).

**Gestures.** Drag around the axle (a disc of radius 58 design units — ≥ 56 px — grabs the crank; the arm follows the finger, `atan2` deltas accumulate so FULL turns count, clamped at the start line and one wheel turn past the flag); « ‹ سنّ » / « سنّ › » (±1 tooth, 48 px high — in an LTR island so « › » is forward, like the bike); keyboard on the crank (`role="slider"`: ← → ↑ ↓ one tooth, Shift ×6, PageUp / PageDown one pedal turn, Home = start line). **The drag previews, the release is the trial** (§2octovicies): `release` is called on pointer-up, and 650 ms after the last tap / key press (`settleSoon`); a release with nothing moved since the last one is not a trial. Reduced motion: no transition, the bike jumps to its place.

**Resistance and evidence.** The flag: after a release off the flag a pill gives the gap in WHEEL turns (« تجاوزتَ العلم بـ 5/12 دورة » red, « ينقصك … للعجلة » amber), the bike can be rolled back; on the flag a stamp « على العلم » (the crank freezes, `data-frozen`, « المهمة التالية » appears). Two BIG counters (« دورات الدوّاسة » orange, « دورات العجلة » teal, reduced fractions stacked) read `teeth/F` and `teeth/R`; an orange ring around the axle and a teal ring around the front hub fill per turn. متقدم: the crank is LOCKED (dimmed, padlock) until the student writes the pedal turns as a fraction (numerator / denominator, ≤ 3 digits each, « انطلق »), the counters and the tooth chip show « ؟ » until the release; a wrong prediction is refuted by the ride (« توقّعتَ 27/8 دورة للدوّاسة، والعلم احتاج 6 دورات »), the ride still solves the task. A strip « ما أنجزتَه » keeps the earlier tasks' pedal turns (reverse: 3/5 beside 5/3).

**Discovery** (مبتدئ only, `discoveryReady` = every task done; متقدم and `reverse` have none): « لماذا احتاجت العجلة 6 دورات إلى 8 دورات للدوّاسة؟ » — « لأنّ 6 + 2 = 8 » refuted with HIS first task (3 wheel turns needed 3/2, not 5) and « لأنّ 6 × 3/4 = 8 » with 6 × 3/4 = 9/2; right: « لأنّ دورة العجلة الواحدة تحتاج 4/3 دورة للدوّاسة، و 6 × 4/3 = 8 ». Formal: « مقلوب 3/4 هو 4/3 لأنّ 3/4 × 4/3 = 1 » and « 6 ÷ 3/4 = 6 × 4/3 = 8 » (numbers from the m2 task). **Free** « جرّب أعدادك »: ALWAYS OPEN, prefilled with the task's numbers; F, R in 12 … 52, the flag p/q (p ≤ 40, q ≤ 12); refusals with their reason under the fields: 0 teeth « صحنٌ بلا أسنان لا يُدير السلسلة » (or the sprocket), outside 12 … 52, an unreadable flag, and « هذا العلم يقع بين سنّين: 7/5 × 32 ليس عددًا صحيحًا من الأسنان »; a free ride never ticks a task and never freezes. **LabCoach** `coachOf`: `predict` (the fraction card) · `crank` · `flag` (≥ 60 % of the way, before the first release) · `teeth` (a release within one wheel turn of the flag: the − / + button, `prefer: 'below'`) · `free` (everything done, متقدم and `reverse`); no step on « المهمة التالية » (a big green button) and none in the مبتدئ discovery; followed to the end of every level and world in `logic/gearCrank.test.js`.

**Events** (`onTrial`; strings are exact reduced fractions, `gap` signed in wheel turns, `'0'` on the flag): `{ tk: 'release', id, F, R, target, teeth, pedal, wheel, atFlag, gap, free, ok }` (`ok` = this release solved the task = `atFlag` outside the free panel), `{ tk: 'predict', id, F, R, target, value, expected, ok, free: false }`, `{ tk: 'custom', free: true, id: 'free', F, R, target, teeth, pedal, wheel, atFlag, gap, ok: false }` (a release in the free panel — never counted), `{ tk: 'solved', id }` (right after the solving release). **DOM**: `[data-gear-crank][data-task][data-world][data-solved][data-layout]`, `[data-gc-glance]`, `[data-gc-stage]`, `[data-gc-svg][data-teeth]`, `[data-gc-crank][data-locked][data-frozen]` (the grab disc, `role="slider"`), `[data-gc-teeth-less]`, `[data-gc-teeth-more]`, `[data-gc-home]`, `[data-gc-teeth]`, `[data-gc-pedal][data-value][data-veiled]`, `[data-gc-wheel][data-value][data-veiled]`, `[data-gc-flag][data-edge]` (the flag, or its edge marker when off screen), `[data-gc-gap][data-kind=over|short][data-value]`, `[data-gc-stamp]`, `[data-gc-lock]`, `[data-gc-predict][data-sent]`, `[data-gc-predict-num]`, `[data-gc-predict-den]`, `[data-gc-go]`, `[data-gc-next]`, `[data-gc-verdict=''|short|over|ok|refuted|free]`, `[data-gc-log]`, `[data-gc-step=<i>]`, `[data-gc-free][data-active]`, `[data-gc-free-f]`, `[data-gc-free-r]`, `[data-gc-free-target]`, `[data-gc-free-back]`, `[data-gc-free-refusal=noTeeth|range|target|between]`, `[data-gc-formal]`, `[data-gc-lina][data-mood]`. **Layout.** The drawing is in design units (height 244) scaled by `min(stageWidth / 440, (screenH − 470) / 244)` clamped 0.8 … 1.4; below 760 px of lab width the counters sit side by side under the stage, from 760 px they form a 176 px column beside it (`data-layout=wide`). The camera follows the bike: the road scrolls and the flag, drawn at `target × 2π × 50` units, comes into view; a mini-map above the road shows start → flag. The scene is BUDGETED so the glance block (consigne → verdict, the free panel excluded) fits one screen: scale = `min(stageWidth / 440, (innerHeight − 24 − fixed) / 244)` clamped 0.62 … 1.4, where `fixed` estimates the other blocks (≈ 330 px, + 66 stacked counters, + 56 predict row, + 30 log, + 28 lead, + extra when the column is under 560 px); counters are a 56 px row each, the fraction card is one row (num / den inputs + « انطلق »), the tooth row shows « إلى الخط » as an icon under 600 px. Measured on the real lesson page (`e2e/lesson-kit/3am-unit2-maqlub-qismat-kasrayn.mjs`, glance height / viewport height, مبتدئ · متقدم): 768×1024 645 · 731 / 1024, 1024×768 (sidebar open) 620 · 654 / 768, 1280×800 657 · 733 / 800, 1366×768 657 · 671 / 768, 1920×1080 593 · 655 / 1080 — every one ≤ innerHeight − 24. Tests: `packages/core/arithmetic/fractions3.test.js`, `logic/gearCrank.test.js`, `proportion/gearCrank/gearArt.test.js`, `proportion/gearCrank.render.test.jsx`.

## 2undequadragies. The spacing under the hand — `seed-rake` (3AM unit 2, lesson `jam-tarh-kasrayn`, 2026-10-26)

`operations/SeedRake.jsx` (+ `operations/seedRake/SeedScene.jsx`: the SVG school garden bed, rake, plants, ruler, brackets, Sara (KidFigure, hijab); `operations/seedRake/seedArt.js`: the pure geometry — `W`, `ROWS`, `BRACKET_Y`, `sceneH`, `segments`, `cellBox`, `wholeCells`, `straddled`, `borderOf`, `nFromX`, `toothX`, tested through the logic) on `logic/seedRake.js` (exact, through `packages/core/arithmetic/fractions3.js` — `sumWith`, `cellsOf`, `zoneEnds`, `smallestCommonMultiple`, `isCommonMultiple`, `widestUnit`, `multiplesUntil` — and `powers.js`, imported BY PATH); theme `seedbed`; strings `lesson.manipulation.json › seedRake`. **The hand holds the spacing `1/N` m** (`N` = 2 … 60 plants per metre) of a rake over a 1 m bed painted with 1-3 crop zones (`1/4` tomatoes, `1/6` peppers…; the last zone may be a HARVEST that is removed from the end). « ازرع » plants one seedling per cell of width `1/N`: the spacing WORKS iff every zone holds a whole number of cells (`N` a common multiple of the denominators); otherwise a cell straddles a border (wilted plant, red outline, `borderAt`) and nothing is counted. The sum is read in plants (`5 × 1/12 m`); every spacing that works gives the SAME length (the logged badges `1/12 → 5 · 1/24 → 10` share one bracket) and the widest is the smallest common multiple. Distinct from `fraction-knife` (1AM, one fixed share, never adds), `tile-yard`, `ruler-compare` and `unit-ladder` (unit 3).

**Props / worlds**: `tasks`, `world` `'bed'` (default) | `'fewest'` (module 2: `levels={false}`, `3/4 + 5/6` flagged `widest`), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. A task is `plant` `{ id, terms: [{ p: '1/4' }, { p: '1/6', sub?: true }], need?, needRefusal?, widest? }` or `predict` (rake LOCKED); `buildTask` THROWS on a negative result (« out of this lesson »), a lowest common multiple above 60 or a total above 2 m. Presets (`levels.js`, `levels.test.js` measures the pair by the number of tasks and the written PREDICTION): مبتدئ (counts visible) `g1` 1/4 + 1/6 (done after TWO different working spacings and one refusal → 5/12), `g2` 2/3 + 1/5 → 13/15 (15), `g3` 3/4 then 1/6 harvested → 7/12 (9 − 2); متقدم (`method-6`, rake locked) `a1` 5/6 + 3/8 → 29/24 (the second bed opens), `a2` 7/10 − 4/15 → 13/30, `a3` 1/2 + 1/3 + 1/4 → 13/12, `a4` 3/8 + 5/12 « أوسع مسافة » (24 and 48 work, 48 leaves the task open with « هل توجد مسافة أوسع؟ »).

**Gestures.** Drag anywhere on the rake bar (the whole bar is the grab, ≥ 56 px high): the first tooth follows the pointer, `N = round(1 / spacing)`; « أضيق » / « أوسع » (±1); keyboard on the bar (`role="slider"`): ← = narrower, → = wider, Shift ×5, Home = N 2, Enter = plant. **The drag previews, « ازرع » is the trial**. In متقدم the student writes `N` and the length (a fraction) first; a wrong `N` is refuted by the border, a wrong total by the plant counts. A finished plant-kind task stays playable (the star « أوسع مسافة؟ », visible only after TWO different working spacings, opens a hunt for a wider one and never says whether one exists).

**Resistance and evidence.** Count pills per zone and `5 شتلات × 1/12 م = 5/12 م` appear only after a spacing that works; the border banner names the two crops (« شتلة على الحدّ بين الطماطم والفلفل »); « جرّب أعدادك » (always open: up to 3 zones, denominators ≤ 12, total ≤ 2 m, last zone a harvest) draws the student's own PREDICTION (any fraction, e.g. 2/10) dashed next to the real bracket — never judged. **Discovery** (مبتدئ, every task done): « لماذا نجحت المسافتان … ولم تنجح … ؟ » with HIS numbers; « le plus grand nombre réussit » and « la somme des dénominateurs » refuted by exact witnesses. **LabCoach** `coachOf`: `rake` · `plant` · `border` · `predict` · `free`, followed to the end of every level in `logic/seedRake.test.js`.

**Events** (`onTrial`): `{ kind: 'plant', mission, N, ok: true, counts, signed, total, free: false }`, `{ kind: 'refused', mission, reason: 'border', N, zone, free: false, ok: false }`, `{ kind: 'predict', mission, N, value, ok, why?: 'border' | 'value' | 'wider' }`, `{ kind: 'hunt', mission }`, `{ kind: 'custom', free: true, mission: 'free', N, ok: false }` (never counted), `{ kind: 'solved', mission, N, total }`. **DOM**: `[data-seed-rake][data-task][data-world][data-solved]`, `[data-sr-glance]`, `[data-sr-stage]`, `[data-sr-svg][data-n]`, `[data-sr-rake][data-n][data-locked]`, `[data-sr-tooth]`, `[data-sr-bed]`, `[data-sr-zone]`, `[data-sr-sign]`, `[data-sr-plant]`, `[data-sr-wilt]`, `[data-sr-borderline]`, `[data-sr-bracket=real|real2|pred]`, `[data-sr-second]`, `[data-sr-readout][data-n]`, `[data-sr-less|more]`, `[data-sr-plant-btn]`, `[data-sr-star]`, `[data-sr-count][data-zone][data-value]`, `[data-sr-total]`, `[data-sr-log]`, `[data-sr-predict]`, `[data-sr-pred-n|num|den]`, `[data-sr-verdict=''|ok|refused|refuted|wider|hunt|free|refusal-fields]`, `[data-sr-step]`, `[data-sr-free][data-active]`, `[data-sr-free-a|b=<i>]`, `[data-sr-free-harvest]`, `[data-sr-free-pred-n|d]`, `[data-sr-formal]`, `[data-sr-next]`. **Layout.** 470 × 168 design units (232 when the second bed opens, + 22 for the free prediction) scaled `min(width / 470, budget / 168)` clamped 0,6 … 1,2. Measured glance (`e2e/lesson-kit/3am-unit2-jam-tarh-kasrayn.mjs`, beginner 501–578 px, advanced 522–593 px at 768×1024, 1024×768, 1280×800, 1366×768 and 1920×1080: the whole block fits one screen height).

## 2duoquadragies. The predicted sign, the flipped divisor and the order of the merges — `merge-board` (3AM unit 2, lesson `amaliyat-natiqa`, 2026-10-26)

`operations/MergeBoard.jsx` (+ `operations/mergeBoard/boardArt.jsx`: the signed bar under each tile `SignBar`, the horseshoe `Magnet`, the `MiniLine` of two bars laid end to end, the CSS of the animations) on `logic/mergeBoard.js` (exact, through `packages/core/arithmetic/fractions3.js` — `parseChain`, `links`, `linkStatus`, `flipStatus`, `flipTile`, `stepOf`, `mergeLink`, `nextLink`, `evaluateChain`, `chainScale`, `tileTex`, `resultSign` — imported BY PATH); theme `arcade`; strings `lesson.manipulation.json › mergeBoard`. **A chain of calculations is a row of TILES (the fraction in LTR KaTeX + a signed bar: centre = zero, blue to the right for +, red to the left for −, the sign « + » / « − » always printed) separated by operator chips; two NEIGHBOURS merge into one tile.** The hand holds three variables: (1) the PREDICTED SIGN of the merge (three pads « + / − / 0 », required BEFORE the merge: a wrong prediction is REFUSED and the verdict names the situation — « الشريط الأزرق أطول: 22/12 مقابل 15/12 » for a sum, « n من الأشرطة حمراء » for a product — never the rule); (2) the tile to FLIP for a division (only the divisor: flipping the dividend is refused, 0 has no reciprocal; the flipped tile keeps its sign, its bar stays red, and the verdict shows `(−3/4)×(−4/3)=1`); (3) the ORDER of the merges, constrained by drawn MAGNETS (a × or ÷ binds its neighbours), translucent BUBBLES (parentheses: their content first) and a long magnet RAIL (a compound fraction: top group, bottom group, then the division). Refusals are decided at the SELECTION of the pair (`magnet`, `bubble`, `order` = a + − link whose previous link is also + −) except `noflip` and `sign`, which the pad press decides.

**Why not another lab** (DNA §12): the tiles never leave their row (`like-terms` / `term-ferry` carry a term across; `robot-track` reorders factors freely; `equality-lanes` hands an operation to both sides); the new variables are the predicted sign (refuted by the overlap of the signed bars), the flip, and an ORDER that priority imposes, not one the student chooses freely.

**Chains** (syntax of `parseChain`; a « − » is a sign after a start, an operator, « ( » or « @ », a subtraction otherwise; a bracket around ONE number is not a bubble; `(top)@(bottom)` is a bar). Presets in `levels.js` (`levels.test.js` measures the pair by the number of tasks and by the HIDDEN BARS of متقدم): مبتدئ `c1` −5/4 + 11/6 → 7/12 · `c2` 7/13 × (−8/5) → −56/65 · `c3` −9/8 ÷ (−3/4) → 3/2 · `c4` 7/3 − 8/15 ÷ 11/20 → 15/11 (the magnet forces ÷ first); متقدم (bars hidden until the merge, magnets drawn faintly, three wrong predictions bring the bars back) `a1` (2/3 − 5/2) × (−6/11) → 1 · `a2` −3/4 + 5/6 × (−9/10) → −3/2 · `a3` the compound fraction → −10 · `a4` 4/5 − 3/5 ÷ (−9/10) + (−2) → −8/15. World `signs` (module 2, `levels={false}`): six single merges `{ signOnly: true }` where only the SIGN is asked (the pair is pre-selected, no flip); six right predictions in a row — a wrong one sends the student back to the first. The result is always shown in the standard form (positive denominator, reduced).

**Free panel « جرّب أعدادك »** (always open): 2 to 4 numbers (`a/b` or `a`, a may have decimals, |a| and b ≤ 20), `+ - × ÷`, one pair of parentheses, no bar; `validateFree` refuses `syntax` / `tiles` / `big`; the board is built by `parseChain`, nothing counts, the pad « 0 » exists (a sum can vanish), a division by 0 is refused at the flip (« لا مقلوب للعدد 0 »).

**Gestures.** Tap two neighbouring tiles (or the chip between them), tap the sign pad; for ÷ tap « اقلب » under the divisor first. Keyboard: tiles, chips, flip buttons and pads are all buttons (Tab, Enter); refused moves shake the tiles (reduced motion: no animation). LabCoach `coachOf`: `pair` · `flip` · `sign` · `magnet` (after a magnet refusal) · `bubble` (after a bubble refusal) · `free`; followed to the end of every chain in `logic/mergeBoard.test.js`; no text names a sign or a number. **Events** (`onTrial`): `{ kind: 'merge', taskId, chain, op, left, right, result, predicted, ok, free }`, `{ kind: 'refused', reason: 'sign' | 'magnet' | 'bubble' | 'order' | 'noflip' | 'dividend' | 'zero', predicted?, op?, free }`, `{ kind: 'flip', tile, ok, reason? }`, `{ kind: 'custom', free: true }` (never counted), `{ kind: 'solved', taskId, result }`; the modules read the student's own `solved` / `flip` events by `taskId` (« في السلسلة 1 دمجتَ … فبقيت بلاطة 7/12 »). **DOM**: `[data-merge-board][data-task][data-world][data-solved]`, `[data-mb-glance]`, `[data-mb-stage]`, `[data-mb-board][data-tiles]` (`dir="ltr"`: the chain reads left to right in the RTL page), `[data-mb-tile][data-id][data-state][data-sign][data-flipped]`, `[data-mb-bar]` (`neg` / `pos` / `zero` / `hidden`), `[data-mb-chip][data-op]`, `[data-mb-magnet]`, `[data-mb-bubble]`, `[data-mb-bar-rail]`, `[data-mb-miniline]`, `[data-mb-trail]`, `[data-mb-pads]`, `[data-mb-pad][data-sign]`, `[data-mb-flip][data-id]`, `[data-mb-score]`, `[data-mb-retry]`, `[data-mb-next]`, `[data-mb-verdict]` (`sign` / `magnet` / `bubble` / `order` / `noflip` / `dividend` / `zero` / `merged` / `solved` / `flipped`), `[data-mb-step]`, `[data-mb-free]`, `[data-mb-free-input]`, `[data-mb-free-add]`, `[data-mb-free-refusal]`, `[data-mb-kid]`, `[data-mb-formal]`.

## 2tresquadragies. The value under the hand — `marble-run` (3AM unit 4, lesson `qimat-ibara-harfiya`, 2026-10-26)

`algebra/MarbleRun.jsx` (+ `algebra/marbleRun/Parts.jsx`: `MarbleBall`, the drag hook `useMarbleDrag`, `Rack`, `Reservoir`, `StationCard`, `Basket`, `Pegboard`; `algebra/marbleRun/LineRow.jsx`: the written line; `algebra/marbleRun/Panels.jsx`: `PredictPanel`, `FreePanel`, `TwinsFree`, `TwinWall`, `chipOf`) on `logic/marbleRun.js` (exact, through the NEW `packages/core/arithmetic/substitution.js` — `parseExpression`, `evaluate`, `trace`, `slots`, `needsBrackets`, `writeLine`, `readLine`, `judgeLine`, `slotDefect`, `toTerms`, `samePolynomial`, `witness`, `pairAt`, `treeTex`, `treeText`, `tokensText`, on `powers.js` rationals — imported BY PATH); theme `marblerun` (« نادي العلوم »' pegboard wall); strings `lesson.manipulation.json › marbleRun`. **The expression is a marble run whose STATIONS are its operations (the tree made physical) and the hand writes the substituted LINE.** The hand holds: (1) the VALUE of the letter — a marble taken from the rack (−5 … 5; متقدم also −1/2, 1/2, −1/3, 2/3, −1,5) and dropped into the reservoir (drag, tap the marble then the reservoir, keyboard ← → / Enter); (2) the WRITING of each slot — tap the slot to toggle its brackets, tap the gap before it to toggle the hidden × (the gap exists only where a number or a bracket precedes the letter); (3) the lever « شغّل المسار ». **The wall computes what the expression MEANS; a strict READER computes what the LINE says** (`readLine`: adjacent digits fuse « 4 » « 3 » → 43; a power binds before a leading minus −2² = −4; two signs side by side are unreadable `4 × −2`; a bracket glued to a number is a product). Equal → a stamp and the basket; different → the first station (in the order of the calculation) where the two parts company lights up, and the banner says both calculations with the student's own numbers (`fused` « سطرك يقرأ العدد 43 … المكبس يضرب 4 في 3 » · `unbracketed` at the copier · `swallowed` · `syntax`). The value is never told: it rolls out of the basket. Distinct from `linear-machine` (4AM, a closed box x ↦ f(x)), `like-terms` / `area-split` (a value meter only CHECKS a simplification / expansion) and `term-ferry` (one automatic substituted line): the INSIDE is the lesson and the hand writes the line.

**Worlds.** `run` (modules 1; two levels; `numbers: { world: 'run', predict, tasks: [{ id, expr, target: { x: '3' } }] }`): مبتدئ `r1` 4x + 7 in 3, `r2` 4x + 7 in −2, `r3` x² − 3x in −2 (station chips visible during the run); متقدم (`predict: true`: the value is typed on a keypad and committed BEFORE the lever unlocks — diagnostic, never blocking, `ran.predictedOk` — and the chips appear only after the run) `r4` 5 − 2x² in −3 (the copier stands before the press), `r5` 6x − 1 in −1/2, `r6` 3x − 2y in (−1 ; 4) (two reservoirs; a marble in the wrong reservoir is a FREE trial: the run works, the task needs the named values). `twins` (module 3, `levels={false}`): two walls under ONE reservoir, live baskets, three buttons « وجدتُ مثالًا مضادًا » (accepted iff the current marble separates the two baskets, else refused with the two equal values), « متساويتان » (refused until « انشر » was pressed — « قيمٌ متساوية لا تكفي » — then judged on the reduced forms through `samePolynomial`), « انشر » (the reduced form of each wall in LTR under it — the published expansion skill used as a TOOL); `tw1` (x + 2)(x + 3) vs x² + 6 (equal at 0: 6/6; 12/7 at 1), `tw2` 2x² + 2 vs x² + x + 2 (equal at 0 and 1; 10/8 at 2), `tw3` (x − 2)(3x + 3) vs 3(x² − 1) − 3(x + 1) (equal on the whole rack −3 … 3). Presets in `levels.js` (`levels.test.js` measures the pair by the PREDICTION and the two letters); twins tasks in `logic/marbleRun.js › TWIN_TASKS` (the module and `content/textbook.js › LAB` copy them, `content.test.js` compares).

**Free panel « جرّب أعدادك »** (always open, `[data-mr-free]`): six expression cards (`3x − 4`, `x² + 1`, `−x²`, `(x − 1)(x + 2)`, `2x² − x`, `5 − 3x`) or a typed expression (grammar of `parseExpression`: integers and decimals, x, y, + − × ( ), `²` / `^2` / `^3`, implicit coefficient; ≤ 24 characters; Arabic-Indic digits and the real minus accepted; a refused text keeps the previous expression), and a marble set by two steppers (numerator −9 … 9, denominator 1 … 9). In `twins`: two typed expressions. Free trials carry `free: true`, never tick a task or the discovery; « عُد إلى مهامّك ». **Discovery** (run world only, after all tasks AND one negative run WITHOUT brackets — `bareTried`, the contrast trial): « لماذا احتاج سطرك إلى قوسين حول العدد السالب تحت الناسخة؟ » — « القوسان للزينة » refuted with HIS refused run (`discoveryWitness`: the two values) and « قوسان حول كل عدد موجب » refuted by `r1` accepted without brackets; formal: same number everywhere · × explicit · brackets of a negative · priority, with HIS accepted lines.

**LabCoach** `coachOf` (pure, followed to the end of every task of both levels and of `twins` in `logic/marbleRun.test.js`): `rack` · `predict` · `slots` · `times` · `run` · `bare` (once, only after every negative was bracketed) · `next` / twins `drop` · `claim` · `expand`; the guide is SILENT after a refused run (the banner speaks); every bubble is anchored `below` its target; no text names the rule or a value. **Events** (`onTrial`): `{ kind: 'drop', world, task, letter, value, free }`, `{ kind: 'write', task, slot, brackets, times }`, `{ kind: 'run', world: 'run', task, runValue, lineValue, ok, reason: 'fused' | 'unbracketed' | 'syntax' | null, station, slot, free }`, `{ kind: 'predict', task, predicted, value, ok }`, `{ kind: 'claim', world: 'twins', task, claim, ok, witness }`, `{ kind: 'expand', task, left, right }` (LaTeX), `{ kind: 'solved', world, task, line, value }`, `{ kind: 'custom', world }` (never counted); the modules read the student's own `run` / `solved` / `drop` events by `task`. **DOM**: `[data-marble-run][data-world][data-task][data-solved][data-running]`, `[data-mr-glance]`, `[data-mr-rack]` / `[data-mr-marble=<v>]` (`dir="ltr"`), `[data-mr-reservoir=x|y][data-filled]`, `[data-mr-station=<id>][data-op][data-lit][data-active]` + `[data-mr-chip]`, `[data-mr-basket][data-value]`, `[data-mr-line]`, `[data-mr-slot=<i>][data-brackets][data-guilty]`, `[data-mr-times=<i>][data-on]`, `[data-mr-run]`, `[data-mr-reader]` + `[data-mr-reader-value]`, `[data-mr-banner][data-mr-refused=<reason>]`, `[data-mr-predict]` (+ `-num`, `-den`, `-sign`, `-commit`, `-result`), `[data-mr-claims]` / `[data-mr-claim=counter|equal]`, `[data-mr-expand]`, `[data-mr-twin=a|b]` + `[data-mr-reduced]`, `[data-mr-next]`, `[data-mr-free]` (+ `-card`, `-input`, `-drop`), `[data-mr-formal]`.

**Pitfalls met.** (1) A `ManipulationWorkspace` mounts BOTH levels in the DOM (the inactive one hidden): an e2e must pick `:visible` (a `document.querySelector('[data-marble-run]')` reads the hidden level — the run-reveal wait returned too early). (2) The verdict and the basket wait for the station-by-station reveal (`shown` = the last run whose reveal is finished, so there is NO frame where the result shows before the animation starts; reduced motion: no reveal). (3) A bubble anchored `below` the written line would cover the banner: the banner is SILENT while the coach speaks and the coach is silent after a refusal. (4) `useManipulation` hides the other level's lab only through the workspace — the LabCoach storage key is `sa.labCoach.marble-run.off` = `'1'`.

## 2sexquadragies. The ruler that converts — `unit-ladder` (3AM unit 3, lesson `qawaid-quwa-ashara`, 2026-10-26)

`operations/UnitLadder.jsx` (+ `operations/unitLadder/art.jsx`: `Ruler` (the brass bar engraved with columns, a stronger line at every plaque boundary), `Plaque` (the enamel unit tags hanging above their column(s), with their value in metres in length mode — 10³ … 10⁻⁹ in superscript characters), `Band` (the red / blue measuring tape, dashed for the total), `tenSup`, `factorLabel`, the CSS) on `logic/unitLadder.js` (exact, through the shared `packages/core/arithmetic/tenPowers.js` — the lesson ADDED `productExp`, `quotientExp`, `powerExp`, `chainExp`, `UNIT_SCALE`, `unitColumns`, `mulSci`, `divSci` — imported BY PATH). Theme `tech-bench` (`VISUAL_THEMES`, kind `objects`: a technology-class bench); strings `lesson.manipulation.json › unitLadder`.

**The hand holds k** — the signed number of COLUMNS of a band stretched between two unit plaques (the exponent of the conversion factor): one band end is fixed on the FROM plaque, the other is dragged (pointer on the handle or anywhere on the ruler), tapped onto a plaque, or moved with `‹ ›` / ← → (`role="slider"`, `aria-valuenow = k`, `aria-valuetext` « 5 أعمدة »), then « ثبّت الشريط » (or Enter). The end snaps to column boundaries; the ruler scrolls INSIDE its frame (never the page) and the handle keeps itself in view. Toward a SMALLER unit the band is red and k > 0; toward a bigger unit it is blue and k < 0. The mode (1 length · 2 area · 3 volume) fixes the number of columns per unit and RE-TILES the plaques (length: km … nm on 13 columns; area: km² … mm² on 14; volume: m³ … mm³ on 12): `plaquePos(u, mode) = (scale(first) − scale(u)) × mode`, so `bandOf(from, to, mode) === unitColumns(from, to, mode)` (a test checks every pair of every mode).

**Tasks.** `{ id, path: [unit, unit] | [unit, unit, unit], mode, predict? }`. A three-unit path is TWO CHAINED bands: the first stays drawn (faint, its count and factor written), the second starts at its end, and the total (first plaque to last) appears DASHED with its own count. مبتدئ (mode length fixed, the factor « × 1000000 » written along the band, a PREDICTION chosen before the band — the handle is blocked until then): u1 km → m → mm (prediction 6 / 9 / 3) · u2 km → cm across the metre (5 / 1 / 6) · u3 mm → µm. متقدم (the mode is CHOSEN on a dial; no factor is written until « ثبّت »): u4 km² → m² (6) · u5 m³ → cm³ (6) · u6 mm² → m² (the blue band, −6, factor 0,000001) · u7 m³ → dm³ (3). **Refusals say the calculation** (`verdict`): `mode` (« اخترت جدول طول والبطاقة عن مساحة: في جدول مساحة لكل وحدة عمودان … »), `mid-plaque` (an end inside an area / volume plaque, or on an empty length column) and `wrong-unit` (the band ends on another plaque, with its count); none of them states the rule.

**Free panel « جرّب أعدادك »** (always open, `[data-ul-free]`): three selects built from `L.UNITS[mode]` (table, from, to); same unit, a unit absent from the table or |k| > 12 is refused in one line; free trials carry `free: true` and never tick a task nor open the discovery. **Discovery** (مبتدئ « gap »: 1 km = 10³ m and 1 cm = 10⁻² m, how many columns between? — `3 − (−2) = 5`, refuting `3 − 2 = 1` and `3 × (−2)`; متقدم « tables »: `3 × 2 = 6`, refuting `3 + 2` and `3²`); the SUM of two chained bands is asked in the lesson (module 1, question 1) rather than in the discovery, because the lab opens ONE discovery per level. Formal text: 10³ × 10³ = 10⁶, 10³ / 10⁻² = 10⁵, (10³)² = 10⁶.

**LabCoach** `coachOf` (pure, followed to the end of every task of both levels in `logic/unitLadder.test.js`): `predict` · `mode` (متقدم) · `handle` · `readout` (after one move) · `dock` · `next` · `free`; the guide never names a number of columns or a rule (the plan's « task card » step is merged into `handle`: the card is already the question). **Events** (`onTrial`): `{ kind: 'stretch', task, from, to, k, ok }`, `{ kind: 'hop', task, i, k }`, `{ kind: 'predict', task, choice, ok }`, `{ kind: 'mode', mode }`, `{ kind: 'refused', task, reason: 'mid-plaque' | 'mode' | 'wrong-unit', k }`, `{ kind: 'solved', task, k, mode }`, `{ kind: 'custom', from, to, mode }`. DOM: `[data-unit-ladder][data-mode][data-task][data-solved]`, `[data-ul-glance]`, `[data-ul-stage]`, `[data-ul-svg]`, `[data-ul-ruler]`, `[data-ul-plaque=<unit>]`, `[data-ul-band][data-k]`, `[data-ul-anchor]`, `[data-ul-handle]`, `[data-ul-readout][data-k]`, `[data-ul-count]`, `[data-ul-factor]`, `[data-ul-card]`, `[data-ul-predict=<i>]`, `[data-ul-predict-card]`, `[data-ul-dial]`, `[data-ul-mode=<1|2|3>]`, `[data-ul-less]` / `[data-ul-more]`, `[data-ul-dock]`, `[data-ul-next]`, `[data-ul-retry]`, `[data-ul-banner][data-ul-refused]`, `[data-ul-free]` (+ `-mode` `-from` `-to` `-add` `-back` `-refusal`), `[data-ul-formal]`, `[data-ul-kid]`.

**Why not another lab** (DNA §12): `power-train` (published sibling) COUPLES two trains of wagons — a quotient there is « a × wagon and a ÷ wagon cancel »; here no factor is built and nothing cancels: a quotient is the DISTANCE between two marks (km and cm are 5 columns apart) and a power of a power is the columns-per-unit of the area / volume tables. `decimal-comma` (1AM) moves the comma of a digit string; here there are no digits, only units. `ruler-compare` chooses a graduation; here the graduation is fixed and the mode re-tiles it. `ten-zoom` (lesson 1) turns a RING (rotate / pinch / wheel); this one STRETCHES a band between two marks (drag, tap a plaque, arrows).

**Pitfalls met.** (1) A task whose total is NEGATIVE reads « 1 mm² = ? m² », not « كم م² في 1 ملم² » — `card.pos` / `card.neg`; `u2` is km → cm (positive 5), not cm → km. (2) The kid is drawn only when the stage is ≥ 640 px wide (a `ResizeObserver`; default visible so the SSR render test sees it): at the 414 px lesson column it hid half the ruler. (3) SVG text and NBSP groups: write the factor in an SVG label WITHOUT groups (`{ group: false }`) or the NBSP renders as an apostrophe. (4) `[data-ul-glance]` ≤ viewport height at 1024 × 768 also in a refusal state: shorten the three refusal sentences, make « من البداية » an icon-only button next to « ثبّت الشريط », crop the viewBox to the content (`H = 178`). (5) A stub user in an e2e needs a REAL-looking first / last name (a one-letter name sends the app to the « عرّفنا بنفسك » form and no lab is found).

## 2quinquaquadragies. The ring that zooms by ten — `ten-zoom` (3AM unit 3, lesson `quwa-adad-ashara`, 2026-10-26)

`operations/TenZoom.jsx` (+ `operations/tenZoom/art.jsx`: `Bench`, `Ring` (24-notch brass ring, turns 30° per notch, fixed red index), `Frame` (bright square outline, 10 × 10 grid, neighbour cell tinted), `Vignette` (one small drawn scene per exponent from −7 to 9: virus, bacterium, red cell, hair section, salt grain, ladybird, eraser, the desk top, classroom, school + pitch, neighbourhood, town, wilaya, northern Algeria — coast and relief only, no borders —, Earth, Earth + part of the Moon's orbit, the whole orbit), the CSS) on `logic/tenZoom.js` (exact, through the NEW shared `packages/core/arithmetic/tenPowers.js` — `parseDec`, `decText`, `pow10`, `exponentOfPow10`, `zerosOf` / `rankOfOne` / `zerosBeforeOne`, `pow10Name`, `nameToExponent`, `PREFIXES`, `expanded`, `timesPow10`; the module is the maths of the whole unit 3 and later lessons ADD to it). Theme `science-lens` (`VISUAL_THEMES`).

**The hand holds n** — the number of notches of a square frame that starts as the 1 m desk top; a notch multiplies (frame bigger) or divides (frame smaller) its side by exactly 10. Gestures: turn the ring (drag around it: 30° = one notch, clockwise = bigger), pinch the lens (spread = smaller), wheel (up = smaller), round « ÷10 / ×10 » buttons, keyboard `+ − ← →` on the ring (`role="slider"`, `aria-valuenow = n`, `aria-valuetext` = the decimal side). The brass plate reads the side in DECIMAL (the 1 is boxed: it moves, a zero appears or disappears); the notation 10ⁿ is not shown until the formal phase of the discovery. مبتدئ also shows the student's own tally « 1 × 10 × 10 ». Every mission starts on the desk (n = 0) except z4, which starts where z3 ended and asks to come back.

**Worlds.** `zoom` (module 1, two levels): مبتدئ z1 1 000 m · z2 1 000 000 m with a PREDICTION card « كم نقرة تكبير تحتاج؟ » (6 / 7 / 1 000 000, chosen BEFORE the first notch; the ring is blocked until then; a wrong prediction is said after the stamp with the ring's own count) · z3 0,001 m · z4 back to 1 m; متقدم z5 « مليار متر » · z6 « ميكرومتر واحد: جزء من مليون من المتر » · z7 0,0000001 m with the prediction 6 / 7 / 8 · z8 « 10 كم »; no tally. `prefixes` (module 2, posed alone with `levels={false}`): the card is a unit (كيلومتر, ميليمتر, ميكرومتر, نانومتر, ميغامتر = مليون متر) and the plate writes the unit's name. **Verdicts say the calculation**: too big « إطارك 10 000 م أكبر من البطاقة بـ 10 مرّات (10 000 = 1 000 × 10) », too small « يلزمه ضرب في 10 مرّة أخرى », wrong way « والبطاقة أصغر من 1 م: صغّر ». A stamped task locks the ring until « البطاقة التالية ».

**Free panel « جرّب أعدادك »** (always open, `[data-tz-free]`): a length in metres written as a decimal power of ten (0,000000000001 … 1 000 000 000 000) or a name from the list (ألف … ألف مليار, جزء من عشرة … جزء من مليار); anything else is refused in one line. Free trials carry `free: true` and never tick a task nor open the discovery. **Discovery** (مبتدئ « count »: the number of notches equals the number of zeros after the 1, refuting « the number of digits » and « the length divided by 10 »; متقدم « rank »: after 3 notches of reduction the 1 is in the third rank after the comma, refuting « after three zeros » and « −1 000 m »); formal text: 10³ = 10 × 10 × 10 = 1 000 · 10⁰ = 1 · 10⁻³ = 1/10³ = 0,001.

**LabCoach** `coachOf` (pure, followed to the end of every task of both levels and of `prefixes` in `logic/tenZoom.test.js`): `predict` · `ring` · `plate` (after one notch) · `dock` (after two) · `next` · `free`; the guide never names a number of notches or a rule. **Events** (`onTrial`): `{ kind: 'notch', task, n, dir }`, `{ kind: 'predict', task, choice, ok }`, `{ kind: 'dock', task, n, ok }`, `{ kind: 'refused', task, n, target, reason: 'over' | 'under' | 'direction' }`, `{ kind: 'solved', world, task, n }`, `{ kind: 'custom', n }`. DOM: `[data-ten-zoom][data-world][data-n]`, `[data-tz-glance]`, `[data-tz-lens]`, `[data-tz-ring]`, `[data-tz-plate]`, `[data-tz-side][data-value]`, `[data-tz-unit]`, `[data-tz-tally]`, `[data-tz-card]`, `[data-tz-predict=<i>]`, `[data-tz-less]` / `[data-tz-more]`, `[data-tz-dock]`, `[data-tz-next]`, `[data-tz-banner][data-tz-refused]`, `[data-tz-free]`, `[data-tz-formal]`.

**Why not another lab** (DNA §12): `power-train` (3AM) lets the hand BUILD a product factor by factor — the load is the output and the coupling adds exponents; here nothing is multiplied by the hand, the hand changes a SCALE and the evidence is the decimal writing of one side and a physical size. `decimal-comma` (1AM) moves the COMMA of an arbitrary decimal; here there is no digit string to handle, only powers of ten. `ruler-compare` (1AM) chooses a graduation; here the scale spans 22 orders of magnitude and is the answer itself. Gesture family: ROTATE / PINCH (none of the three uses it).

**Pitfalls met.** (1) `setPointerCapture` throws on a synthetic or already-lifted pointer id: wrap it, or the pinch handler dies before registering the pointer. (2) A decimal in LaTeX: replace the NBSP groups by `\,` and ONLY THEN the decimal comma by `{,}` of the fractional part (replacing the first comma of `10\,000` printed raw `\displaystyle` in a banner). (3) A square lens + ring in a 600 × 400 viewBox: crop the viewBox to the content (`0 14 600 366`) or the lab loses 8 % of its height to empty bench. (4) At 1024 × 768 the lesson column is ≈ 414 px: the ×10 / ÷10 buttons are text-only (52 px) or they overflow. (5) Knowledge-graph layout test: a `common_mistake` is never a child of the root, and two mistakes in one lane under the same parent cross each other at 328–1100 px — spread the lanes.

## 2quattuorquadragies. The needle that reads a difference — `difference-meter` (3AM unit 4, lesson `muqaranat-natiqayn`, 2026-10-26)

`operations/DifferenceMeter.jsx` (+ `operations/differenceMeter/art.jsx`: `Bench`, `Meter` (the brass galvanometer: centre-zero dial, left half red, right half green, needle, digital window, shutter), `Rail` (the graduated glass rail), `Bead`, `Tag`, `ProbeArt`, `Lead`, `Curtain`, `Lens`, `needleDeg`, the CSS) on `logic/differenceMeter.js` (exact, through the NEW `packages/core/arithmetic/orderSign.js` — `difference`, `orderOf`, `verdictJudge`, `fromDifference`, `pixelGap`, `writtenJudge`, `parseNumber`, `validateNumber`, `parseExpr`, `exprDifference`, `linearForm`, `signRegions`, `sampleIn`, `regionCardsJudge`, `coefJudge` — on `powers.js` rationals and `substitution.js` (`parseExpression`, `toTerms`), imported BY PATH); theme `physicslab` (the physics-lab bench); strings `lesson.manipulation.json › differenceMeter`. **Two numbers are never PLACED by the hand: it decides WHICH one is subtracted and reads ONE needle.** A glass rail graduated like a number line carries two beads `a` (amber) and `b` (blue) at their honest abscissae; a galvanometer with a red and a black probe reads « red MINUS black ». The hand PLUGS each probe on a bead (drag; tap the probe then the bead; keyboard: Enter selects, ← → plug on the left / right bead), SWAPS them (« بدّل المجسّين »), WRITES the difference (sign, numerator, denominator — judged by VALUE) and chooses the order card `a > b` / `a < b` / `a = b`; in the world `race` it HOLDS x. **The needle is the evidence, never the rule**: its side follows the order of the beads, swapping the probes makes it CROSS without moving a bead or changing the right card, −3/2 − (−1/2) sends it LEFT (the farther from zero is not the bigger), 9/11 and 13/16 are 0,85 px apart (the two beads overlap — ONE merged tag « حبّتان متراكبتان على السكّة » and a glass lens with one stacked handle per bead, a above b, which carries no left/right information) and the needle still decides. A wrong card is refused with the TWO facts side by side (« المجسّ الأحمر على a والأسود على b ، والإبرة عند −1 ، وبطاقتك a > b ») — never the rule.

**Worlds.** `rail` (module 1; two levels; `numbers: { world: 'rail', tasks: [{ id, a: '5/4', b: '3/4', range: [-2, 2], mustSwap?, write?, curtain?: { left: 'a', value: '-0,3' } }] }`): مبتدئ (the needle and its window show as soon as both probes are plugged) `d1` 5/4 and 3/4 (+1/2) · `d2` −3/2 and −1/2 (−1; `mustSwap`: the task ends when a verdict is accepted AND the probes were swapped once — the swap is the contrast trial that feeds the discovery) · `d3` 9/11 and 13/16 (+1/176, 0,85 px at 150 px / unit); متقدم (`know-5`: « from the difference alone ») a brass SHUTTER covers the needle until the difference is WRITTEN (`d4` 17/12 and 10/7 → −1/84, `d5` −7/6 and −9/8 → −1/24; a wrong write is refused with both numbers: « كتبتَ −7/6 والإبرة عند −1/84 ») and `d6` the CURTAIN (the beads are hidden, only « a − b = −0,3 » is given, the needle stands at −3/10; the fourth card « لا نستطيع الحكم دون معرفة a و b » is refused with the needle's reading). Presets in `levels.js` (`levels.test.js` measures the pair by the SHUTTER writes and the CURTAIN) and in `logic/differenceMeter.js › PRESETS` (compared in `content.test.js`). `race` (module 3, `levels={false}`, `world="race"`): the beads follow A(x) and B(x), the probes are fixed (red on A, black on B), the needle reads A − B live; x is a slider with − / + buttons (integers 0 … 10; halves in the free panel); the coefficient steppers open only after two values of x were seen, the student writes A − B = px + q (« تحقّق », judged on the reduced terms; the refusal gives the needle's reading at the current x and the value of what was written — a sum instead of a difference is flagged `reason: 'bracket'` in the event), then fills one order card per REGION of x (`signRegions`: `x < c`, `x = c`, `x > c`, or « لكل قيم x » for a constant) — a wrong region is refused with a sample x of that region and the needle's reading. `e1` 3x + 5 and 2x + 9 (x − 4) · `e2` 2(x + 3) and 2x + 1 (5: the beads keep the same gap) · `e3` x² + 3 and x² + x (3 − x). **P3 scope** (unit-4 README, owner question 3): only differences whose sign is read directly (constant, x − c, c − x) — the lab never adds, subtracts, multiplies or divides an inequality.

**Free panel « جرّب أعدادك »** (always open, `[data-dm-free]`): two numbers (integer, comma decimal or `p/q`, |value| ≤ 9, denominator ≤ 99; Arabic-Indic digits and the real minus accepted) — the beads move there, the probes stay plugged; in `race` two expressions `ax + b` or `x² + ax + b` (|coefficients| ≤ 20). Free trials carry `free: true`, never tick a task, never end the discovery; « عُد إلى مهامّك ». **Discovery** (rail only; مبتدئ after `d1`–`d3` AND one swap — `swapTried`): « متى تميل الإبرة إلى اليمين؟ » — « حين تكون الحبّة الحمراء أبعد عن الصفر » refuted by `d2`, « حين يكون للعدد الأحمر بسط أكبر » refuted by `d3`; متقدم after `d4`–`d6`: « هل تحتاج إلى a و b لتعرف الترتيب؟ » — « لا: إشارة a − b وحدها تكفي » (refuted wrong options by the curtain). Formal: `a>b` معناه `a−b>0`, `a<b` …, `a=b` …, and the swap changes the sign of the difference, not the order.

**LabCoach** `coachOf` (pure, followed to the end of every task of both levels and of `race` in `logic/differenceMeter.test.js`): `plug` · `plug2` · `write` · `swap` (only after a verdict in a `mustSwap` task) · `verdict` · `x` · `coef` · `cards` · `next` · `free`; the guide never names a sign or a value. **Events** (`onTrial`): `{ kind: 'plug', task, taskId, red, black }`, `{ kind: 'reading', value }`, `{ kind: 'swap' }`, `{ kind: 'write', written, value, ok }`, `{ kind: 'verdict', card, ok }`, `{ kind: 'x', x }`, `{ kind: 'coef', ok }`, `{ kind: 'regions', ok }`, `{ kind: 'same' | 'write' | 'coef' | 'regions' | 'verdict', ok: false, … }` (refusals), `{ kind: 'solved', world, task, taskId }`, `{ kind: 'custom', world }` (never counted); the modules read the student's own `solved` / `swap` events by `taskId`. **DOM**: `[data-difference-meter][data-world][data-task][data-solved]`, `[data-dm-glance]`, `[data-dm-stage]`, `[data-dm-scene]` (`dir="ltr"`: the rail reads left to right in the RTL page), `[data-dm-rail]`, `[data-dm-bead=a|b][data-value]` (on the rail, or on the lens handles while the beads overlap), `[data-dm-tag=a|b|merged]`, `[data-dm-lens]`, `[data-dm-probe=red|black][data-on][data-selected]`, `[data-dm-needle][data-reading][data-side]`, `[data-dm-window]`, `[data-dm-shutter-art]`, `[data-dm-curtain]`, `[data-dm-swap]`, `[data-dm-write]` (+ `-sign`, `-check`; steppers `[data-dm-stepper=num|den|p|q]`), `[data-dm-cards]` / `[data-dm-card=gt|lt|eq|nojudge]`, `[data-dm-x]` (+ `-less` / `-more` / `-value`), `[data-dm-coef-panel]` (+ `-check`), `[data-dm-regions]` / `[data-dm-region=<i>]` / `[data-dm-rcard=gt|eq|lt]` (+ `[data-dm-regions-check]`), `[data-dm-banner][data-dm-refused=<reason>][data-code]`, `[data-dm-retry]`, `[data-dm-next]`, `[data-dm-free]` (+ `-a`, `-b`, `-add`, `-back`, `-refusal`), `[data-dm-kid]`, `[data-dm-formal]`.

**Why not another lab** (DNA §12): `zero-probe` (2AM) holds the DISTANCE to zero of ONE sensor whose sign is a switch; `ruler-compare` (1AM) decides decimals by choosing a graduation — here no graduation is chosen, the eye explicitly fails and ONE signed reading decides; `number-line-pegs` CARRIES a number to its place and `loom-threads` PLACES threads — here no number is ever placed; `robot-track` reorders factors; `equality-lanes` (unit 5) hands the SAME operation to two sides — here nothing operates on the numbers (the beads never move in `rail`, and in `race` x moves them while the needle reads A − B: no operation on an inequality). Gesture family: PLUG probes + read one needle; HOLD x.

**Pitfalls met.** (1) Two overlapping beads cannot both be tapped — the hit circle of the second covers the first (Playwright reported « <circle> intercepts pointer events »): while they overlap the rail carries no hit area and each bead gets a handle in the lens (a above b, so the layout says nothing about the order); the drag drop picks the nearest handle, or the upper / lower half of the cluster. (2) The merged tag needs its own width (224 units) or the Arabic caption is clipped. (3) A `ManipulationWorkspace` mounts BOTH levels: e2e selectors need `:visible`. (4) The LabCoach storage key is `sa.labCoach.difference-meter.off` = `'1'`.

## 2sexaquadragies. The order under the hand — `loom-threads` « خيوط النول » (3AM unit 5, lesson `mutabayinat-amaliyat`, 2026-10-26)

`algebra/LoomThreads.jsx` on `logic/loomThreads.js` (exact; `packages/core/arithmetic/linear.js` imported BY PATH, extended with `imageRay(ray, stages)` — the image of a half-line `{ rel, bound }` under `[{ op: 'add' | 'mul', k }]`, × negative flips `rel`, × 0 gives `{ collapsed: true }` — and `boundAffine(interval, P)` — the bracket of `p·x + q`, ends always ordered, strictness inherited, `p < 0` swaps the ends; both swept in `linear.test.js`); theme `loom` (a weaving workshop in غرداية: two carved wooden beams, warp threads, red and blue wool with pompoms, a half-woven carpet, مريم = `KidFigure`, girl in hijab); strings `lesson.manipulation.json › loomThreads`; render test `algebra/loomThreads.render.test.jsx`.

**The hand holds ONE knot of the lower beam, and the WHOLE number line follows.** Each number x of the upper beam is joined by a warp thread to its image on the lower beam (same scale, −10 … 10, labels every 2). A red wool thread is tied at `a` and a blue one at `b` (`a < b`). The tool decides what the knot IS: the COMB (`comb`, + c) puts it at the image of the thread of 0 (its position IS c; every x lands at x + c), the NAIL (`nail`, × c) clamps the thread of 0 at 0 and puts it at the image of the thread of 1 (every x lands at c·x). Ranges: comb −6 … 6, nail −3 … 3, step 1 (مبتدئ) or 1/2 (متقدم). Gesture: drag the knot along the lower beam (the drag previews, the release IS the trial « اربط »), tap a graduation (moves the knot there), `role="slider"` with ← → / Home / End and Enter, round −/+ and a « اربط » button. **No rule is ever written**: the world shows the red and blue threads CROSS (a glowing knot at the crossing, the pompoms change sides) exactly when the factor is strictly negative; a comb or a positive nail never crosses; × 0 gathers both pompoms on one knot and the line reads « 0 = 0 » with the strict symbol struck out. The verdict states the CONSEQUENCE in the student's numbers (« الأحمر عند −2 والأزرق عند −6: صار الأحمر على يمين الأزرق. »), never « لأنّ العدد سالب ».

**Tasks** (`numbers: { step, tasks: [{ id, kind, … }] }`): `swap` (a < b, bring the red to the RIGHT of the blue: no comb and no positive nail can), `reach` (`target: [ta, tb]`), `meet` (the two knots join: × 0), `band` (متقدم: the upper beam shows a PAINTED BAND `{ rel: '<', bound: 3 }` — a fan of threads and a hollow knot at the bound — and `goal: { rel: '>', bound: −6 }`: the bound AND the side are judged by `imageRay`), `maxStages: 2` (متقدم: « عارضة أخرى » commits the stage under the hand and opens a third beam; the target pair is judged, not the route). Presets (`levels.js`): مبتدئ `swap` 1 < 3 · `reach` −2 < −1 → 6 and 3 (nail −3) · `meet`; متقدم `reach` −3/2 < 1 → 5 and 0 (two stages: × (−2) then + 2, or + (−1) then × (−2)) · `band` x < 3 → x > −6 (× (−2); × 2 or + (−9) are refused with the consequence shown) · `reach` 2 < 3 → −1 and −3/2 (nail −1/2; the readout writes « × (−1/2) أي ÷ (−2) »). `levels.test.js` measures the pair by the number of stages allowed, the band and the finer step. Module 2 poses the lab ALONE (`levels={false}`, `step`, `tasks`: `reach` −3 < 2 → 6 and −4).

**Free panel « جرّب أعدادك »** (always open, `[data-lt-free]`): the student writes `a` and `b` (integer, comma decimal or `p/q`, halves only, |value| ≤ 5, a ≠ b; the smaller becomes the red thread) and keeps both tools; free trials carry `free: true` and never tick a task nor the discovery. The free band is NOT implemented (the band is a guided task only). **Discovery** (`discoveryReady`: every task AND one comb trial with a NEGATIVE c — the contrast trial `negTried`): « متى يتبادل الخيطان مكانيهما؟ » — « كلّما استعملنا عددًا سالبًا » refuted by HIS comb trial (« أزحتَ بـ −4 … بقي الأحمر على اليسار »), « حين نمدّد بعدد أكبر من 1 » refuted by his × 2 / × 3 trial; formal phase: `a < b ⟹ a + c < b + c`, `c > 0 ⟹ ac < bc`, `c < 0 ⟹ ac > bc` written with his own pairs, and × 0.

**LabCoach** `coachOf` (pure, followed to the end of both levels in `logic/loomThreads.test.js`): `tool` · `drag` · `tie` · `tryNeg` (once, the contrast: the comb with a negative number) · `stage` (متقدم) · `next`; storage key `sa.labCoach.loom-threads.off` = `'1'`. **Events** (`onTrial`): `{ kind: 'tie', task, taskKind, tool, c, cNum, stages, free, a, b, a2, b2, crossed, collapsed, relTo, reached }` (band tasks carry `band: true, edge, side` instead of `a … b2`); the modules read the student's own `tie` events (`tool`, `cNum`, `stages === 1`, `!free`). **DOM**: `[data-loom-threads][data-task][data-solved][data-layout]`, `[data-lt-glance]`, `[data-lt-stage]`, `[data-lt-svg]` (`dir="ltr"`), `[data-lt-beam=<i>]`, `[data-lt-thread=red|blue][data-at]`, `[data-lt-cross]`, `[data-lt-band]`, `[data-lt-knob][data-c]` (`role="slider"`), `[data-lt-beam-hit]`, `[data-lt-tools]` / `[data-lt-tool=comb|nail][data-selected]`, `[data-lt-less]`, `[data-lt-more]`, `[data-lt-op]`, `[data-lt-tie]`, `[data-lt-stage-btn]`, `[data-lt-undo]`, `[data-lt-orders]` / `[data-lt-order=top|bottom][data-rel]`, `[data-lt-verdict=right|cross|meet|kept]`, `[data-lt-next]`, `[data-lt-step=<i>]`, `[data-lt-free]` (+ `-a`, `-b`, `-back`), `[data-lt-formal]`.

**Why not another lab** (DNA §12): `equality-lanes` holds the same c but decides WHO receives it (one side breaks an equality; evidence = together / apart on a wall with two runners) — here BOTH sides always receive the operation and the question is the DIRECTION, the evidence is the threads crossing, and the whole line is mapped; `origin-line` (4AM) is a line in a plane whose slope the hand turns — here two parallel axes and a mapping diagram, no plane, no slope; `solution-ray` (4AM) holds a probe x and traces solutions — here there is no unknown and the band is only transported, never solved; `robot-track` (flip) and `number-line-pegs` (carry / hang) PLACE numbers and `difference-meter` (plug) reads a difference — here the hand PLACES A THREAD (the image of one reference thread) and the order of two images is read along a beam. Gesture family: DRAG a knot along a beam (direct mapping of a whole line).

**Pitfalls met.** (1) The order line is a LTR island: `<bdi dir="ltr">` showed the minus sign and the symbol in the wrong order — use an `inline-flex` `dir="ltr"` span with each number and the symbol as its own isolated span, and read the real order from `getBoundingClientRect().left` in the e2e (an image of a small RTL-page text is easy to misread). (2) Three beams are taller: drop the decorative carpet, shrink the gap and the figure margins to keep `[data-lt-glance]` inside the viewport. (3) A `ManipulationWorkspace` mounts BOTH levels: e2e selectors need `:visible` and `waitForSelector(..., { state: 'attached' })`.

## 2septquadragies. The quantity under the hand — `scoop-scale` « ميزان العطّار » (3AM unit 5, lesson `hasr-adad-ushri`, 2026-10-26)

`operations/ScoopScale.jsx` (+ `operations/scoopScale/art.jsx`: the SVG spice shop — shelves of jars, the cumin sack and its brass scoop, the digital scale with a SEVEN-SEGMENT LCD drawn as segments (never text), the cone of spice that grows with the mass (height = ∛ of the mass fraction), the model sachet and its lamp, the precision strip) on `logic/scoopScale.js` (exact; `packages/core/arithmetic/decimals.js` imported BY PATH and extended with `floorAt`, `ceilAt`, `roundAt` (HALF UP), `roundingInterval(r, k)` (`{ lo, hi, loIncluded: true, hiIncluded: false }`, left end clamped at 0), `quotientDigits(a, b, n)` (a calculator screen: n significant digits, the LAST digit ROUNDED, a decimal point: 247 ÷ 83 → « 2.975903614 ») and `quotientBracket(a, b, k)`, all swept in `decimals.test.js`); theme `attar` (a دكّان in a souk, الفتاة = `KidFigure`, girl in hijab); strings `lesson.manipulation.json › scoopScale`; render test `operations/scoopScale.render.test.jsx`.

**The hand holds the MASS itself** — the number `m`, an integer count of the task's resolution (0,01 kg, then 0,001 kg). A scale's big SCREEN ROUNDS the mass at the task's rank (the unit, 0,1 or 0,01 kg, half up) while a precision strip writes the exact mass under a fixed needle (the graduations scroll; the two screen marks around the needle glow faintly; the ticks are finer than the marks). Gestures (three paths, the pour is never the only one): press-and-hold on the scoop pours (one pinch every 140 ms after a 300 ms delay, 35 ms after 2 s), a tap on the scoop is ONE pinch (+1), a tap on the cone in the pan takes one back (−1); keyboard on the pan (`role="slider"`): ↑ ↓ ± 1, PageUp / PageDown ± 10, Home = the start mass, Enter / Space on the scoop = a pinch; round −/+ buttons mirror the pinch; « سلّم الكيس » is the TRIAL. **No rule is ever written**: the scale REFUSES a delivery and says why IN THE STUDENT'S NUMBERS by showing the neighbour pinch (« لو أنقصتَ حفنة لصارت الكتلة 1,25 kg والشاشة ما تزال تقرأ 1,3 »); at 1,35 the screen reads 1,4 (« الشاشة لم تعد تقرأ 1,3 »): the half-open interval is met by the hand at both ends.

**Tasks** (`numbers: { tasks: [{ id, kind, rank, res, reading | ref, start, coarse? }] }`): `least` (the smallest mass whose screen reads `reading`), `most` (the largest; the right end is EXCLUDED), `both` (the two, one after the other; `coarse: true` = the « ميزان الأكياس الكبيرة » that rounds to the kilo), `trap` (the exact mass is displayed; a model sachet weighs `ref` = a/b kg, a lamp says lighter / heavier / balanced: « the heaviest sack still lighter, then the lightest sack heavier » — the lamp NEVER says « balanced » when a/b is not decimal at that rank; the strip marks the model's true position BETWEEN two ticks). Presets (`levels.js`): مبتدئ `least` 1,3 (rank 0,1, strip 0,01, key **1,25**) · `most` 1,3 (**1,34**; 1,35 reads 1,4) · `both` « 2 » at the unit rank (**1,50** and **2,49**; 2,50 reads 3); متقدم `least` 5,68 (rank 0,01, strip 0,001, **5,675**) · `most` (**5,684**; 5,685 reads 5,69) · `trap` 2/7 kg (**0,285** then **0,286**). `levels.test.js` measures the pair by the finer rank and by the trap task (متقدم only). A later lesson reuses the lab with its own `tasks`.

**Free panel « جرّب أعدادك »** (always open, `[data-ss-free]`): (a) a screen READING R (0 < R < 100, 0–2 digits after the comma) — **the NUMBER OF DIGITS TYPED sets the rank**: « 7 » rounds to the unit, « 7,0 » to the tenth (the helper line says « 7 و 7,0 قراءتان مختلفتان »); the same `both` run is played on it; (b) a quotient a ÷ b (1 ≤ a ≤ 999, 2 ≤ b ≤ 99) and a rank 0,1 / 0,01 / 0,001 for a `trap` run (the lamp CAN balance when a/b is decimal at that rank: 5 ÷ 8 at 0,001). Free trials carry `free: true` and never tick a task nor the discovery. **Discovery** (`discoveryReady`: every task AND one REFUSED delivery — the contrast): « ما كلّ الكمّيات التي تقرأ عليها الشاشة 1,3 kg ؟ » — « من 1,3 إلى أقلّ من 1,4 » refuted by HIS 1,25 (which already read 1,3), « من 1,25 إلى 1,35 » by HIS 1,35 (it read 1,4), « 1,3 فقط » by his 1,25 and 1,34; the formal phase writes `r − ½·10⁻ᵏ ≤ m < r + ½·10⁻ᵏ` with his three tasks, then `0,285 < 2/7 < 0,286`.

**LabCoach** `coachOf` (pure, followed to the end of both levels in `logic/scoopScale.test.js`): `pour` (the scoop, hold) · `remove` (the pan, once) · `deliver` · `tryEnd` (once, the contrast: one pinch more and watch the screen) · `lamp` (trap) · `next`; storage key `sa.labCoach.scoop-scale.off` = `'1'`. **Events** (`onTrial`): `{ kind: 'deliver', task, taskKind, phase: 'least' | 'most' | 'heavyLight' | 'lightHeavy', mass: '1,25', m, reading: '1,3', ok, refused: null | 'wrongReading' | 'notLeast' | 'notMost' | 'wrongSide' | 'notHeaviest' | 'notLightest', neighbour: { m, mass, reading, lamp? }, rank, res, free, lamp? }`; the modules read the student's own accepted deliveries (`ok`, `phase`, `rank`) and their `neighbour` (« أقلّ كمّية 1,25 kg ، وبحفنة أقلّ 1,24 kg قرأت 1,2 »). **DOM**: `[data-scoop-scale][data-task][data-phase][data-solved][data-layout]`, `[data-ss-glance]`, `[data-ss-stage]`, `[data-ss-scene]` (`dir="ltr"`), `[data-ss-lcd][data-reading]` (`role="img"`), `[data-ss-scoop]`, `[data-ss-pan][role=slider][data-m]`, `[data-ss-cone][data-h]`, `[data-ss-strip][data-m]`, `[data-ss-pill]`, `[data-ss-mark]`, `[data-ss-ref]`, `[data-ss-lamp][data-lamp=<|>|=]`, `[data-ss-less]`, `[data-ss-more]`, `[data-ss-deliver]`, `[data-ss-restart]`, `[data-ss-verdict=right|refused]`, `[data-ss-next]`, `[data-ss-step=<i>]`, `[data-ss-context]`, `[data-ss-prompt]`, `[data-ss-free]` (+ `-reading`, `-a`, `-b`, `-rank=<k>`, `-back`), `[data-ss-formal]`.

**Why not another lab** (DNA §12): `ruler-compare` (1AM) holds the GRADUATION of a ruler and compares two given numbers — here the rank is fixed by the task, the hand holds the QUANTITY and the question is the SET of quantities behind one rounded reading; `solution-ray` (4AM) is a probe on an abstract line with red / grey traces and an inequation — here the hand builds a mass by pouring and the verdict comes from an INSTRUMENT (a rounding screen) that refuses; `decimal-comma` holds the comma of fixed digits; `zero-probe` a signed distance to zero; `hundred-grid` cells of a percentage; `loom-threads` (the sibling lab of the unit) maps a whole line by dragging a knot — here one quantity is built by pouring and pinching. Gesture family: HOLD to pour / TAP to pinch.

**Pitfalls met.** (1) The glance block must stay inside 768 px at 1024 × 768 with the sidebar open (column ≈ 414 px): scene 200 px, strip 86 px, one controls row; after a solved task the verdict grows (« التالي » button), so the e2e measures that state too. (2) The strip's graduations scroll under a FIXED needle: apply the `translateX` on an INNER `<g>` and the `clip-path` on an OUTER one (a clip-path on the transformed element moves with it); draw a mark's label only when it is fully inside the window. (3) Every `<defs>` id of a lab mounted in a `ManipulationWorkspace` (BOTH levels exist in the DOM) must be unique: `useId`. (4) In the `trap` task every tick is a screen mark: label every fifth tick or the labels overlap. (5) `PointerEvent` hold timers must be cleared on release, cancel and unmount; a tap (release before 300 ms) is a pinch, a hold that already poured is not.

## 2unquadragies. The position of a writing under the hand — `number-line-pegs` (3AM unit 2, lesson `adad-natiq`, 2026-10-26)

`operations/NumberLinePegs.jsx` (+ `operations/numberLinePegs/RopeScene.jsx`: the SVG courtyard rope between two painted poles, integer tags (negative side cool blue with « − », positive side warm orange with « + »), twelfth ticks in مبتدئ only; `operations/numberLinePegs/pegArt.js`: the pure geometry — `W`, `ROPE_Y`, `xOfValue`, `valueOfX`, `unitPx`, `layoutCards`, tested through the logic and the render test) on `logic/numberLinePegs.js` (exact, through `packages/core/arithmetic/fractions3.js` — `writingValue`, `normalize`, `isDecimalRational`, `twelfths`, `unitOf`, `integerAndFraction`, `sortRationals` — and `powers.js`, imported BY PATH); theme `clothesline`; strings `lesson.manipulation.json › numberLinePegs`. **The hand CARRIES a card that bears a WRITING `a/b` (a, b relative, a may have one decimal digit) and HANGS it where it believes the number lives**: a prediction (MANUEL §16.3). « تحقّق » lets the wind act: every hung card slides to its TRUE peg. Different writings of the SAME number STACK on one peg (« 3 بطاقات »), a card hung on the wrong side of zero crosses it (swing + `crossedZero`), and −7/3 shows its non-terminating decimal « −2,333… » beside the exact fraction while having an exact place. Distinct from `zero-probe`, `ruler-compare`, `pin-rails`, `robot-track`, `elevator-reel` and `loom-threads` (their hand holds a distance, a graduation, a column value, a sign/order, a time, a thread).

**Props / worlds**: `tasks`, `world` `'rope'` (default) | `'writings'` (module 2: `levels={false}`, five cards `15/-20, -6/8, 3/-4, -12/16, 3/4`), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. A task is `hang` `{ id, cards: ['6/-8', …], range: [lo, hi] }` (step 1/12, loupe ×3, « تحقّق » on the cards hung so far, done when ALL cards have landed) or `order` `{ kind: 'order', … }` (step 1/48, no tick between integers, no loupe, ALL cards first then ONE « تحقّق »: the verdict needs each card in its right unit interval and the order of DISTINCT values right; a wrong verdict lets the cards slide and offers « أعد »). `buildTask` THROWS on b = 0, a card outside the range, or more than 8 cards. Presets in `levels.js` (`levels.test.js` measures the pair by the order verdict): مبتدئ `w1` 6/(−8), (−3)/4, 3/4, (−9)/(−12) · `w2` −7/3, 7/(−3), −14/6, 14/6 · `w3` −1,5, 2, (−20)/(−8), −3; متقدم `a1` six cards, `a2` 9/(−4), −11/4, −10/4, `a3` 15/(−20), −6/8, −5/6.

**Gestures (three paths).** Drag a card from the basket onto the rope (pointer capture on the stage; the card previews on the rope while the pointer is over it, the RELEASE hangs it, outside the stage it returns to the basket); tap the card then tap the rope (a tap on the rope hangs there); keyboard: Tab to a card, Enter / Space takes it and moves focus to the rope slider (`role="slider"`, ← → = one twelfth (Shift = one unit), Enter hangs, Esc drops). A hung card that has not landed can be taken again. **The drag previews, the release is the trial.** Cards are DOM absolutely positioned over the SVG: every child of a zero-width wrapper needs an explicit `left: 0` (in an RTL page the static position is the RIGHT edge).

**LabCoach** `coachOf`: `card` · `loupe` / `hang` (a card is in hand) · `check` · `stack` · `retry` · `free`; followed to the end of both levels in `logic/numberLinePegs.test.js`; no text names the rule or a number. **Events** (`onTrial`): `{ kind: 'hang', taskId, task, card, x: 'k/snap', free }`, `{ kind: 'settle', …, moves: [{ card, from, to, crossedZero }], stacks: [[id…]] }`, `{ kind: 'order', …, ok, why?: 'unit' | 'order' }`, `{ kind: 'custom', free: true }` (never counted), `{ kind: 'solved', taskId }`; the modules read the student's own `settle` events by `taskId` and card id (« في المهمة 1 استقرّت … عند 3/4 »). **DOM**: `[data-number-line-pegs][data-task][data-world][data-solved]`, `[data-npp-glance]`, `[data-npp-stage][data-scale]`, `[data-npp-svg][data-snap]`, `[data-npp-rope][data-held][data-k]`, `[data-npp-int]`, `[data-npp-tw]`, `[data-npp-basket]`, `[data-npp-card][data-id][data-state]`, `[data-npp-hung][data-id][data-landed][data-x][data-value]`, `[data-npp-chip]`, `[data-npp-stack][data-count]`, `[data-npp-loupe]`, `[data-npp-readout]`, `[data-npp-check]`, `[data-npp-retry]`, `[data-npp-next]`, `[data-npp-verdict]`, `[data-npp-free][data-active]` (+ `-a`, `-b`, `-add`, `-refusal`), `[data-npp-kid]`, `[data-npp-formal]`. **Free** « جرّب أعدادك »: always open; a card `a/b` with |a| ≤ 48 (one decimal digit allowed), 1 ≤ |b| ≤ 12; `b = 0` is refused (« القسمة على 0 مستحيلة »), a value outside −4 … 4 is refused (« خارج الحبل »), at most 8 cards, never counted. **Discovery** (مبتدئ, w1–w3 done): « ماذا تقول البطاقات المكدّسة على ملقط واحد؟ », refuting « the wind mixed them » (−3/4 and 3/4 do not stack) and « same numerator » (6/(−8) and (−3)/4 stack with numerators 6 and −3). The loupe is built INSIDE this lab; promote it to `primitives/` only when a second lab needs it.

## 2octentricies. The numerator under the hand — `shade-match` (3AM unit 2, lesson `tasawi-muqaranat-kasrayn`, 2026-10-26)

`operations/ShadeMatch.jsx` (+ `operations/shadeMatch/PaintScene.jsx`: the SVG paint shop; `operations/shadeMatch/shadeArt.js`: the pure colour / meter / tally geometry — `shadeColor`, `needleDeg`, `meterPoint`, `liquidLevel`, `tallyRungs`) on `logic/shadeMatch.js` (exact, through `packages/core/arithmetic/fractions3.js` — `matchNumerator`, `shadeVerdict` — and `powers.js`, imported BY PATH); theme `paintshop`; strings `lesson.manipulation.json › shadeMatch`. **The hand holds the number `c` of blue shots** poured into bucket B (which has `d` white); the reference bucket A holds `a` blue for `b` white. B matches A exactly when `c × b = a × d`; otherwise a needle meter leans by the sign of `c × b − a × d` (« أفتح » / « أغمق ») and lights « تطابق » on equality. The colour is computed from the EXACT blue share `c/(c+d)` (`depth`), so equal ratios give IDENTICAL colours and 3/4 vs 7/10 look almost the same — the eye cannot decide, the needle can. **When `a·d/b` is not whole no integer fits** (3/4 over 10 white: 7 is lighter, 8 darker): the impossible case is what makes the cross products COMPARE. Distinct from `fraction-knife` (1AM: the share is fixed, the hand holds the number of pieces of one whole), `fourth-gauges` (2AM: a missing cell of a price board, three balances), `scoop-scale` (a continuous mass on a rounding scale). « جرّب كل الإمكانيات »: NOT eligible (each release IS a trial).

**Props / worlds** (`<Manipulation type="shade-match" … />`; every callback through `state.report`): `tasks`, `world` `'mix'` (default) | `'equal'` (module 2: `levels={false}`, one `pick` task: reference 6/8 and four ready buckets 9/12, 15/20, 7/9, 12/15 loaded one by one, finished when all four are loaded), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. A task is `match` `{ id, a, b, d, veil? }` (`init` THROWS on a < 1, b < 1, d < 1 or an exact goal above 40), `compare` `{ kind: 'compare', a, b, c, d, veil }` (two finished buckets: predict the darker) or `pick`. Presets (`levels.js`, `levels.test.js` measures the pair by the number of tasks and the veil): مبتدئ (meter visible) `s1` 3/4 over 8 → **6** (7, the « +4 white so +4 blue » idea, is darker), `s2` 2/3 over 9 → 6, `s3` 3/4 over 10 → NO integer (7 lighter, 8 darker); متقدم (`veil: true`, ref `method-4`) `a1` 5/6 over 18 → 15, `a2` 4/7 over 12 → none (6 and 7), `a3` 9/12 over 8 → 6 (an unreduced reference matches), `a4` compare 7/9 and 10/13 (7 × 13 = 91 > 90: numerators, 10 > 7, are refuted by the reveal).

**Gestures.** Press-and-hold the lever (a 34-unit disc, ≥ 56 px grabs it): one shot at once and one every 0,45 s while held; a click is one shot; « تصريف » removes one; keyboard on the lever (`role="button"`): Space held = pour, Enter = one shot, Backspace = remove one. **The pour previews, the release is the trial** (§2octovicies): `release` on lever up, and 650 ms after the last key; a release with nothing moved since the last one is not a trial. Reduced motion: no drop animation, no transitions.

**Resistance and evidence.** The needle and its tick: each judged release pins a small tick labelled with its `c` on the meter (the trial memory); the banner writes the student's own numbers (« 7 طلقات: أفتح من المرجع · 8 طلقات: أغمق ») and never the rule. « لا يوجد عدد صحيح » (مبتدئ): refused (`refusal: 'bracket'`) until two CONSECUTIVE integers have been tried, the lower lighter and the next darker; refused on a task that has a solution (`'exists'`, without saying which). متقدم: the meter is covered (« ؟ ») until the first commitment — « أثبّت » (the current `c`) or « لا يوجد عدد صحيح » with the two neighbours written in `[data-sm-below]` / `[data-sm-above]`; a wrong commitment reveals the meter and the task stays open; `compare` is finished by one prediction (the reveal teaches). Colour is never the only signal: the meter prints « أفتح / أغمق » and the needle position.

**Discovery** (مبتدئ only, every task done): « متى يطابق لونُ الدلو الثاني لونَ المرجع؟ » — « حين نضيف من الأزرق قدر ما أضفنا من الأبيض » refuted with HIS numbers (7 shots over 8 white: `7 × 4 = 28 > 24`) and « حين يكون عدد الأزرق أكبر من عدد الأبيض » (6 < 8 matched); right: « حين يكون عدد الأزرق × 4 = 3 × عدد الأبيض ». Formal: `3/4 = 6/8 لأنّ 3 × 8 = 4 × 6` and `7/10 < 3/4 لأنّ 7 × 4 < 3 × 10`. **Free** « جرّب أعدادك »: ALWAYS OPEN, a, b, d ∈ 1 … 20, never counted. **LabCoach** `coachOf`: `lever` · `meter` · `drain` (the cup is too dark) · `impossible` (the bracket is seen) · `commit` (veiled tasks, `compare`) · `free`; followed to the end of every level and world in `logic/shadeMatch.test.js`.

**Events** (`onTrial`): `{ kind: 'release', mission, a, b, c, d, verdict: 'lighter' | 'match' | 'darker', free, ok }`, `{ kind: 'impossible', mission, below, above, ok }` (`below`/`above` null on a refused click), `{ kind: 'commit', mission, value, ok }` (`value`: `c`, or `'A'` / `'B'` for `compare`), `{ kind: 'load', mission, c, d, verdict }` (`equal`), `{ kind: 'custom', free: true, mission: 'free', … ok: false }` (never counted), `{ kind: 'solved', mission }`. **DOM**: `[data-shade-match][data-task][data-world][data-solved][data-layout]`, `[data-sm-glance]`, `[data-sm-stage]`, `[data-sm-svg]`, `[data-sm-lever][data-pressed][data-frozen]`, `[data-sm-drain]`, `[data-sm-counter=blue|white][data-value]`, `[data-sm-swatch=ref|second][data-color]`, `[data-sm-meter][data-needle][data-veiled]`, `[data-sm-lamp][data-on]`, `[data-sm-tick][data-c][data-verdict]`, `[data-sm-cover]`, `[data-sm-commit]`, `[data-sm-impossible]`, `[data-sm-below]`, `[data-sm-above]`, `[data-sm-pick=first|second]`, `[data-sm-candidate=<i>][data-loaded][data-current]`, `[data-sm-stamp]`, `[data-sm-verdict=''|ok|refuted|bracket|lighter|darker|free|refusal-<why>]`, `[data-sm-log]`, `[data-sm-step=<i>]`, `[data-sm-free][data-active]`, `[data-sm-free-a|b|d]`, `[data-sm-free-refusal]`, `[data-sm-formal]`, `[data-sm-next]`. **Layout.** The drawing is 440 × 232 design units scaled `min(stageWidth / 440, budget / 232)` clamped 0,62 … 1,25; from 760 px of lab width the swatches + meter + counters form a 262 px column beside the stage, below it they stack above it. Measured glance (`e2e/lesson-kit/3am-unit2-tasawi-muqaranat-kasrayn.mjs`): مبتدئ 748–790 px at the four tablet / laptop sizes, متقدم 800–890 (the two neighbour fields add a row).

## 2septentricies. The signed time under the hand — `elevator-reel` (3AM unit 1, lesson `jidaa-adadayn-nisbiyayn`, 2026-10-26)

`operations/ElevatorReel.jsx` (+ `operations/elevatorReel/TowerArt.jsx`: `TowerDefs`, the cross-section of a Bab Ezzouar mall with floors +9 … −9, the cabin, the stacked arrows, `FloorPill`; `operations/elevatorReel/geometry.js`: `floorHeight`, `towerWidth`, `towerGeometry`, tested) on `logic/elevatorReel.js` (exact, through the new `packages/core/arithmetic/relativeOps.js` — `parseRel`, `relText` / `relTex`, `distance`, `productSign`, `times`, `repeatedSum`, `distributeCheck`, on the exact rationals of `powers.js` — imported BY PATH; theme `mallElevator`; strings `lesson.manipulation.json › elevatorReel`). **The hand holds the SIGNED TIME `t`**: a freight elevator passes the ground floor at `t = 0` of a security-camera film at a constant signed speed `r` (floors per minute, `r < 0` = it goes DOWN); at time `t` (minutes; `t < 0` = BEFORE it passed) it is at floor `r × t`. For `t > 0` the cabin follows the repeated addition; for `t < 0` the film is REWOUND and the cabin of a descending elevator appears ABOVE the street — (−) × (−) = (+) is a fact of the world before it is a rule. In متقدم the hand ALSO holds `r` (a two-position lever « يصعد / ينزل » + −/+ on its distance 1 … 3). Not `zero-probe` (2AM: the hand holds a DISTANCE, nothing is multiplied) nor `power-train` (the hand holds an EXPONENT, the factors are all equal). « جرّب كل الإمكانيات »: NOT eligible (each released time IS a trial). « جرّب أعدادك »: ALWAYS OPEN (speed −3 … 3, 0 allowed — the cabin never moves, `a × 0 = 0` for free —, time −3 … 3 by half-minutes; a free trial never ticks a mission).

**Props / missions** (`<Manipulation type="elevator-reel" … />`; every callback through `state.report`): `tasks`, `step` (`'1'` | `'0,5'`), `level`, `levels`, `coach`, `title`, `lead` (replaces the default context sentence on the authored level), `onTrial(event)`, `onFinished({})`. A task is `floor` `{ id, r, floor }` (r imposed by the story, one floor asked: `init` THROWS when no time of the rail gives it — `timeFor`), `both` `{ id, kind: 'both', floor }` (r free: reach the floor going UP and going DOWN, the mission closes when both are seen) or `predict` `{ id, kind: 'predict', r, t, options, key, misc? }` (choose the floor BEFORE seeing: every wrong card carries a belief — a1: `−6` `MISC-JIDAA-NEGNEG`, `−5` `MISC-JIDAA-ADD`, `1` `MISC-JIDAA-SUB` (`CARD_MISC`); a task may carry its own `misc` map). Presets (`levels.js`): مبتدئ (step 1) `m1` r = −2 → floor −6 (t = 3), `p1` predict (−2 ; −1) among `2 · −2 · −3 · −1` (`−2` NEGNEG, `−3` ADD, `−1` SUB — added 2026-10-27 so the negative-time surprise is PREDICTED before it is seen), `m2` r = −2 → 4 (t = −2, THE SURPRISE), `m3` r = 3 → 6, `m4` r = 3 → −9 (t = −3); متقدم (step 0,5, `know-1`) `a1` predict (−3 ; −2) among `6 · −6 · −5 · 1`, `a2` floor −6 both ways ((2 ; −3) and (3 ; −2) up, (−2 ; 3) and (−3 ; 2) down), `a3` r = −2 → 3 (t = −1,5), `a4` r = 2 → −5 (t = −2,5). `levels.test.js` measures the pair by the finer step, the prediction (متقدم opens on it, مبتدئ opens on a gesture) and the `both` mission.

**Gestures (three paths).** Drag the yellow knob (≥ 44 px) along the replay timeline −3 … 3 — the cabin follows (`preview`, no trial) and the RELEASE is the trial (§2octovicies); tap anywhere on the ruler; −/+ one step (`StepperCard`); keyboard on the knob (`role="slider"`: ← → ↑ ↓, Home / End). During a prediction (متقدم a1, مبتدئ p1) the timeline and −/+ are NOT mounted until the card is answered (nothing to move before the prediction); a card is not « the hand went below 0 » (`below` is unchanged by `choose`). **What the world shows, never the rule:** the cabin at `r × t`, the floor pill « الطابق −6 », `|t|` stacked arrows of `r` floors (solid when `t > 0`; DASHED when `t < 0` — the path the cabin still has to travel to reach floor 0, so it sits on the other side; a half arrow for a half minute; in متقدم NO arrows until the release), the monitor (`t = −2`; during the film one decimal, `t = −1,7`), the SPEED CARD (owner, 2026-10-27: « the speed is very important — make it clear »: the signed value « −2 » large, a rose ↓ / emerald ↑ tile, « طابق في الدقيقة » and « ينزل طابقين في كل دقيقة »; one row in the page, a large card on the game screen; the cabin also carries the SIGNED speed « −2 ▼ ») and the « سجلّ الكاميرا » (one row per solved mission: r · t · floor). **The product is never written before the discovery** (§5, council of 2026-10-27 — it printed `(−2) × (−1) = 2` on every stop and gave the sign rule away): a stop says the time and the floor (« عند الدقيقة 2 كان المصعد في الطابق −4، لا في الطابق −6 »); a stop on the OTHER side of the street from the goal (`L.wrongSide`) asks « … فوق الشارع. والطابق −6 تحت الشارع: هل يكون المصعد هناك قبل مروره بالطابق 0 أم بعده؟ »; a prediction answers with the floor and its side. Once the discovery is won (`ready`), each stop adds its calculation under the line (`[data-er-calc]`). **The film** « ▶ شغّل التسجيل » (`[data-er-play]`, under the timeline) plays t from −3 to 3 in 4,8 s (one integer step every 0,7 s under `prefers-reduced-motion`), the cabin moving continuously and the pill giving the nearest floor; any gesture stops it and gives the hand back its own time; it is offered only when EVERY prediction of the list is answered (`L.canPlay` — the film would show the answer) and never while the cards are open. **Discovery** (`ManipulationDiscovery`; asks the OTHER half of the rule — the distance — because the module asks the signs): « ما علاقة بُعد الطابق عن الشارع بمسافتَي السرعة والزمن إلى الصفر؟ » (« the sum » and « the difference » refuted with HIS row of the سجلّ, `distanceWitness`); formal `|r| × |t| = a × b` with HIS numbers and `a × 0 = 0`.

**LabCoach** `coachOf` (`grab`, `left` and `try` carry `prefer: 'above', noFlip: true` since 2026-10-27: the bubble sits on the monitor, never over the timeline or −/+ it points at): `cards` (a1, p1) · `grab` (the knob) · `left` (a mission asks a negative time and the hand never went below 0: the left half of the timeline, `[data-er-left]`, never the number) · `lever` (the `both` mission after two trials) · `try` (−/+) · `next`; followed to the end of both levels in `logic/elevatorReel.test.js`. **Events** (`onTrial`): `{ kind: 'release', task, taskId, r, t, floor, ok, free, goal, speed }` and `{ kind: 'predict', task, taskId, r, t, floor, pick, ok, misc }`. **DOM**: `[data-elevator-reel][data-task][data-solved][data-layout]`, `[data-er-glance]`, `[data-er-stage]`, `[data-er-svg]`, `[data-er-cabin][data-floor][data-sense]`, `[data-er-pill]`, `[data-er-level=<f>]`, `[data-er-arrows=<n>]`, `[data-er-arrow=<i>][data-dashed][data-half]`, `[data-er-monitor]`, `[data-er-time]`, `[data-er-speed-card][data-sense]`, `[data-er-speed-value=<r>]`, `[data-er-speed-sentence]`, `[data-er-play][data-playing]`, `[data-er-calc]`, `[data-er-knob][data-t]`, `[data-er-ruler]`, `[data-er-left]`, `[data-er-stepper]`, `[data-er-less]`, `[data-er-more]`, `[data-er-t]`, `[data-er-speed]`, `[data-er-up]`, `[data-er-down]`, `[data-er-r-less]`, `[data-er-r-more]`, `[data-er-cards]`, `[data-er-card=<v>]`, `[data-er-record]`, `[data-er-row]`, `[data-er-verdict=right|part|wrong|free|'']`, `[data-er-prompt][data-lit]`, `[data-er-context]`, `[data-er-next]`, `[data-er-step=<i>][data-done]`, `[data-er-free][data-active]`, `[data-er-free-r]`, `[data-er-free-t]`, `[data-er-free-back]`, `[data-er-formal]`, `[data-er-kid][data-mood]`. **Layout.** The tower (160 px wide below 700 px of lab width, 280 above) ALWAYS sits beside the controls column (≤ 440 px: monitor, speed card (+ the lever in `both`), cards or timeline + film, −/+, verdict, record); the floor height is budgeted from the lesson screen (`floorHeight`: `(screenH − 430) / 19`, 20 … 30 px). **Game screen** (`immersive`, § « Game screen »): the tower takes 40 % of the width (340 … 560 px, the shaft and its cabin grow to 110 px) and its floors share the height left under the question (`floorHeightFor(avail)`: `(avail − 48) / 19`, 20 … 44 px); the controls column grows to 640 px. Measured glance in the page (`e2e/lesson-kit/3am-unit1-jidaa-adadayn-nisbiyayn.mjs`, height / viewport, مبتدئ · متقدم a1, 2026-10-27 with the speed card): 768×1024 727 · 711, 1024×768 (sidebar open, lab column 414 px, monitor 64 px) 767 · 714, 1280×800 692 · 649, 1366×768 744 · 726, 1920×1080 788 · 788. Tests: `packages/core/arithmetic/relativeOps.test.js`, `logic/elevatorReel.test.js`, `operations/elevatorReel/geometry.test.js`, `operations/elevatorReel.render.test.jsx` (opens on its CONTEXT then ONE question, says each thing once, no raw key, no sentence pointing to the book).

## 2septentricies-bis. The second factor under the hand — `sign-machine` « آلة الجداءات » (3AM unit 1, lesson `jidaa-adadayn-nisbiyayn`, module 2 معارف, 2026-10-27)

Owner request (2026-10-27): « a manipulation in module 02 « لماذا جداء سالبين موجب؟ » on how the sign of the result changes ». `operations/SignMachine.jsx`
(+ `operations/signMachine/geometry.js`: `boardGeometry` — nine columns b = −4 … 4 at a constant pitch, bars TO SCALE from the 0 line, the pill
margins, the gap between bars where the stair risers live (`gapW`) and the rail; `bAt` maps a pointer x back to a column; tested over widths and scales) on `logic/signMachine.js` (integers only:
|a| ≤ 4, |b| ≤ 4; `productOf` never returns −0). Theme `mathClubMachine`; strings `lesson.manipulation.json › signMachine`.

**The hand holds the SECOND FACTOR b.** The maths-club machine carries a first factor a on its dial (a big signed card with a needle dial and the
character, `FactorCard`). The hand slides b along a rail under a lit board (knob ≥ 44 px, tap on the rail, −/+ `StepperCard`, keys ← → Home End on the
`role="slider"` knob); every b visited LIGHTS its column a × b above (emerald) or below (rose) the 0 line, and lit columns STAY: the table of products
builds itself under the hand. Between two lit neighbours a STAIR STEP is drawn (2026-10-27, owner: the floating « +4 » chips under the board did
not say what they measured): a dashed tread from the tip of bar b, then an amber riser arrow up (or down) to the tip of bar b − 1, with the signed
gap (« +4 ») written beside the riser — « from 0 to 4, from 4 to 8 » is read on the drawing, and the steps stay identical across 0. The rule is
never written: the student SEES that the step does not change sign at 0.

**Resistance.** The four negative columns are LOCKED (« ؟ », a dark veil, the rail greyed and the knob clamped at 0 — `negLocked`, `minB`) until the
prediction mission is won: (−3) × (−1) is predicted on cards BEFORE it can be seen. A wrong card is refused WITHOUT the answer (« ليس −3. انظر إلى الفرق بين
كل عمودين متجاورين… », no calc line, the column stays dark); each wrong card carries its misconception (`MISC-JIDAA-NEGNEG` / `-ADD` / `-SUB`). A wrong
column in a `reach` mission shows its own product (« (−3) × (−2) = 6 » then « ليس هذا العمود: الجداء المطلوب 12. »). Once a mission is won, moving the knob is EXPLORATION (`trial.look`, verdict `look`, indigo « أنجزت هذه المهمة… »), never a refusal — fixed 2026-10-27 after the owner saw « ليس هذا العمود … undefined » right after the correct card.

**Missions** (`tasks`, `a`): `fill` (light every column from `from` down to `to`), `predict` (`b`, `options`, `key`, `misc`), `reach` (`product`; `a` of the
task or of the lab — b is unique), `both` (`product` with a > 0 THEN a < 0: the hand also holds a — « موجب / سالب » cards `[data-sm-pos]` / `[data-sm-neg]`
and −/+ of its distance; flipping a REVERSES the whole lit table around the 0 line). مبتدئ (platform, a = −3): m1 fill 4 → 0, p1 predict (−3) × (−1),
m2 reach 12 (b = −4). متقدم (act-3, a = −4): a1 predict (−4) × (−2) before any gesture, a2 both 8, a3 reach −6 with a = 2. Every mission opens with the
knob back at b = 4 (the answer is never already under the hand); the same a keeps the lit columns, a new a relights from 4.

**Discovery and formal phase.** « في أعمدتك: ماذا فعل الجداء بعد الصفر، كلّما نقص العامل الثاني بـ 1؟ » — « بقي يزيد بـ 3 في كل مرة، فصار موجبًا » (correct)
against « عاد ينقص بـ 3 » and « بقي سالبًا », each refuted with the student's columns (`witness`: a0, the step −a0, the columns ±4 and −1). The formal
phase writes $a \times 4 + a \times (-4) = a \times 0 = 0$ (the two columns are mirror images) and « flipping the sign of a factor moves the product
to the other side of 0 ». « جرّب كل الإمكانيات »: NOT eligible (each released b IS a trial). « جرّب أعدادك »: ALWAYS OPEN (a from −4 to 4, 0 allowed —
every column on the line; all nine columns lit; a free trial never ticks a mission).

**LabCoach** `coachOf`: `cards` · `grab` (the knob, `prefer: 'above', noFlip`) · `sign` (`both` only: after two trials without touching a, or when the
remaining way needs the other sign) · `try` (−/+) · `next`. Its unit test follows it to the end of both levels.

**In the lesson.** Module 2 opens on this lab (two-level workspace, nothing above it); its step 1 asks what the student SAW, with the student's own
columns (`[data-evidence="sign-machine"]`: « في آلتك: (−3) × 1 = −3 ثم (−3) × 0 = 0 ثم (−3) × (−1) = 3 », answer = −a); the distributivity argument
and the (−4) × n table follow as transfer. One objective for both levels (`validate:lessons`). Not `elevator-reel` (one product at a time, the hand
holds a TIME) nor `robot-track` (several factors, the hand holds signs and ORDER): here the hand builds the WHOLE TABLE of a × b and reads its regularity.

DOM contract: header of `SignMachine.jsx`. Tests: `logic/signMachine.test.js`, `operations/signMachine/geometry.test.js`,
`operations/signMachine.render.test.jsx`, e2e `e2e/lesson-kit/3am-unit1-jidaa-adadayn-nisbiyayn.mjs` § 3quater.

## 2novetricies. The signs and the order of the cards under the hand — `robot-track` (3AM unit 1, lesson `jidaa-ida-nisbiya`, 2026-10-26)

`operations/RobotTrack.jsx` (+ `operations/robotTrack/MatArt.jsx`: the SVG world — the floor mat seen at a slant, graduated like a number line, negative half amber / positive half teal, the glass zero gate, the flag, the robot, the numbered jump arcs, two `KidFigure`s; `operations/robotTrack/geometry.js`: `matGeometry`, `ticksOf`, `arcHeight`, tested) on `logic/robotTrack.js` (exact, through the grown `packages/core/arithmetic/relativeOps.js` — `product`, `negativesIn`, `signByParity`, `opposite`, `square`, `factorize` — and `powers.js`, imported BY PATH); theme `roboticsClub`; strings `lesson.manipulation.json › robotTrack`. **The hand holds the SIGN of each card and the ORDER / PRESENCE of the cards of a robot's programme.** The robot starts at 1 on the mat; each card multiplies its position by the number written on it: a positive card moves it away from the zero gate on the same side, a NEGATIVE card makes it JUMP over the gate (a half-turn: `× (−1)` is the symmetric point). The final stop is the product; its SIDE depends only on how many cards are negative, never on their order. The lab never says « فردي » or « زوجي » — the module asks what the student's own record has in common.

**Props / worlds** (`<Manipulation type="robot-track" … />`; every callback through `state.report`): `tasks`, `world` (`'track'` default | `'square'`), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. Task kinds: `goal` `{ id, flag, placed[], tray[], need, flip?, lock?, minNeg?, at? }` (reach the flag with `need` cards; `lock` = the cards placed at the start cannot be moved; `flip` = the signs are in the hand; `minNeg` = at least that many negative cards; `at: 2` = the flag is checked after the first two cards while the programme must still be complete — `init` THROWS when `canReach` finds no programme), `predict` `{ cards[] }` (a FIXED programme: choose the side and the distance BEFORE « شغّل » — nothing is drawn before), `repeat` `{ card, unit, goals[], predictN }` (the card then `unit` repeated n times, n in 1…20: predict n = 15 first, then reach each goal), and in the `square` world `sqNeg` (no number puts the robot on the negative side; « لا يمكن » is the right answer, a press before one positive and one negative trial says « جرّب عددًا موجبًا وعددًا سالبًا أوّلًا ») and `sqVal` (2,25: done when BOTH 1,5 and −1,5 have been tried). Presets (`levels.js`, `LEVELS['robot-track']`; `levels.test.js` measures the pair by the PREDICTION written before « شغّل » and by the order to choose): مبتدئ (running product line and arcs visible) `m1` place −1 → −5, `m2` one card back to 5 (2 → −10 and −5 → 25 refused with their stop), `m3` the cards 2, 3, 4 to −24 (one or three negative signs, never two), `m4` 24 with ≥ 2 negative cards; متقدم (no product line, no arcs before « شغّل ») `a1` the fixed programme −2, 3, −1, −4, 0,5 (−12), `a2` order −5, 4, −0,5, 2 so that the robot is at −2 after two cards (the final stop is 20 in EVERY order), `a3` the card 3 then (−1) × n (−3 for odd n, 3 for even n). The `square` world is posed alone in معارف (`levels={false}`, declared in `lesson.config` WITHOUT a level).

**Gestures (three paths).** Carry a card (`useDragInteraction`) from the tray to a slot, from a slot to another (the cards swap) or back to the tray; take-then-place by tap / Enter (keyboard); tap the sign badge under a card (a 44 px pill, a real button OUTSIDE the draggable area — never a button inside a button) to flip + ↔ −. Every change of the programme is a TRIAL and the robot REPLAYS from 1 (≈ 380 ms per card; `prefers-reduced-motion` = instant); `data-pos` is the animated position, `data-stop` the FINAL stop (tests read this one). The programme shows `need` slots (≥ 2) — six only in the free panel — so it always fits one row; the lower part of the lab is two columns (programme + tray | verdict + record) from 620 px of lab width. **Resistance and evidence:** the flag; a refused stop is written with its calculation (« 1 × 5 × 2 = 10 ») and the stop; a placed card of a `lock` task refuses to move (« هذه البطاقة مثبّتة ») and a full programme refuses another card; the jump arcs stay as a numbered trace (first four); the running product line `1 × 2 × (−3) × 4 = −24` grows with the replay. The « سجلّ التجارب » lists every validated stop with its programme and the number of NEGATIVE cards (written by the lab, not by the student) — the module's questions read it. **Free** « جرّب أعدادك »: ALWAYS OPEN, a factor from −10 to 10 (one decimal) is added to the tray (6 cards at most); a factor 0 stops the robot on the gate for good.

**LabCoach** `coachOf`: `tray` (carry a card) · `sign` (the badge) · `swap` (order matters) · `side` / `run` (predict) · `repeat` · `square` · `impossible` (only once the button is ready) · `next`; followed to the end of the three worlds in `logic/robotTrack.test.js`; no text names the rule. **Events** (`onTrial`): `{ kind: 'run', task, taskId, free, count, negatives, stop, probe, ok, reason: 'side' | 'distance' | 'constraint' | 'incomplete' | null, moved, order }`, `{ kind: 'predict', taskId, side, dist, ok, sideOk, distOk, stop, negatives }`, `{ kind: 'square', taskId, a, stop, negative }`, `{ kind: 'claim', taskId, ok, early }`. **DOM**: `[data-robot-track][data-task][data-world][data-solved][data-layout]`, `[data-rt-glance]`, `[data-rt-stage]`, `[data-rt-svg]`, `[data-rt-robot][data-pos][data-stop]`, `[data-rt-flag][data-flag]`, `[data-rt-arc=<n>]`, `[data-rt-post]`, `[data-rt-line]`, `[data-rt-program]`, `[data-rt-slot=<i>]`, `[data-rt-card=<id>][data-v]` (a source `[data-drag-source=<id>]`), `[data-rt-sign=<id>]`, `[data-rt-tray]`, `[data-rt-sides]` / `-left` / `-right` / `-dist` / `-dist-value` / `-run` / `-retry`, `[data-rt-repeat]`, `[data-rt-a]`, `[data-rt-impossible][data-ready]`, `[data-rt-record]` / `-row`, `[data-rt-verdict=right|wrong|free|'']`, `[data-rt-prompt][data-lit]`, `[data-rt-context]`, `[data-rt-chip]`, `[data-rt-next]`, `[data-rt-free]` and its `-input`, `-add`, `-clear`, `-back`. **Bidi lesson:** a verdict island of digits and signs needs `LRI` + `LRM` (`iso()`): without a strong LTR character, `−5` between neutrals is ordered as RTL (« 5− »). **Tests:** `logic/robotTrack.test.js` (every preset task reachable, `canReach` false for the negative square, judge reasons, m3 = 1 or 3 negative signs never 2, a2 order, coach to the end), `operations/robotTrack.render.test.jsx`, `operations/robotTrack/geometry.test.js`, `e2e/lesson-kit/3am-unit1-jidaa-ida-nisbiya.mjs` (pointer, tap-tap, keyboard path via the hook; four screen sizes).

## 2quadragies. The missing code under the hand — `code-lockers` (3AM unit 1, lesson `qismat-nisbiyayn`, 2026-10-26)

**Concept.** A quotient is a MISSING FACTOR: `a ÷ b = q` means `b × q = a` (`b ≠ 0`), so it inherits the sign rule of the product; when no decimal works the quotient is a fraction and `−a/b = a/−b = −(a/b)`, `−a/−b = a/b`. **World** (theme `libraryLockers`): the entrance hall of the municipal library — shelves, a reading lamp, the poster « الكتاب صديق », a wall of small numbered lockers (closed / current / open with a book showing) and, in the foreground, the ACTIVE locker drawn in styled DOM (wood door, brass plate with the rule « (−6) × ? = 48 », a combination lock with wheels, a small green screen, a handle) with إيناس (KidFigure, hijab) at the desk. **Hand:** the CODE `q`, rolled wheel by wheel — a SIGN wheel (+ / −) and digit wheels; pulling the handle (drag down, tap, Enter) is the TRIAL. A wheel turns by vertical drag, by ▲ / ▼, or by the keyboard (↑ ↓ on the focused wheel, ← → between wheels, digits and `+` / `-` typed). Not auto-completable.

**Props / worlds** (`<Manipulation type="code-lockers" … />`; every callback through `state.report`): `tasks`, `world` (`'lockers'` default | `'fraction'`), `level`, `levels`, `coach`, `title`, `lead`, `onTrial(event)`, `onFinished({ world })`. A task is `{ id, b, a, qFirst?, layout?, live?, commit?, switch?, writings? }` — the rule is `b × ? = a` (`qFirst`: `? × b = a`); `layout` `'int'` (sign + tens + units, −99…99) · `'dec'` (sign + units + tenths + hundredths, |q| < 10) · `'frac'` (front sign, ± numerator 0…20, ± denominator 1…20) · `'free'` (five wheels, the free panel); `live` = the screen multiplies at every notch (otherwise « ؟ » until the first pull); `commit` = the SIGN must be set and « ثبّت » pressed before the digit wheels unlock (a prediction), a wrong committed sign is refused at the first pull with `committed × |a ÷ b|` (« (−8) × (−0,25) = 2 ، والقفل يريد −2 »), the sign wheel is freed, and a lock whose answer is 0 accepts either sign; `switch` = the button « وضع الكسر » appears after two pulls of the task; `writings: n` = the lock must be opened with `n` DIFFERENT wheel positions of the fraction wheels (`writingKey`: `−2/3`, `2/−3`, `−(2/3)` and `−4/6` are four keys; values are compared exactly). `init` THROWS when a task cannot be solved by its layout. Presets (`levels.js`, `LEVELS['code-lockers']`; `levels.test.js` measures the pair by the SIGN SET BEFORE THE DIGITS and by the DECIMAL code): مبتدئ (live product) `m1` `(−6) × ? = 48` → −8, `m2` `9 × ? = −54` → −6, `m3` `? × (−7) = −63` → 9 (the unknown written FIRST), `m4` `(−12) × ? = −60` → 5 (−5 refused with 60); متقدم `a1` `(−8) × ? = −2` → 0,25, `a2` `2,5 × ? = −7,5` → −3, `a3` `(−0,4) × ? = 1,2` → −3, `a4` `? × (−5) = 0` → 0. World `fraction` (posed ALONE in معارف, `levels={false}`, declared in `lesson.config` WITHOUT a level): `f1` `(−6) × ? = 4` on decimal wheels (−0,66 → 3,96, −0,67 → 4,02), then fraction mode with two writings of −2/3; `f2` `(−9) × ? = −6` directly in fraction mode (−2/−3 and 2/3 are both 2/3). **« جرّب أعدادك »** (always open): the student writes `b` (−20…20) and `a` (−99…99), one decimal at most; `b = 0` is accepted and shown honestly (`a ≠ 0` refused whatever the code, `a = 0` opened by every code).

**LabCoach** `coachOf`: `digit` (a digit wheel) · `sign` (the sign wheel) · `commit` (« ثبّت », only once the sign has moved) · `handle` · `switch` (after two pulls) · `next`; followed to the end of the three worlds in `logic/codeLockers.test.js`; steps prefer the bubble BELOW so it does not cover the plate; no text names the rule or a number. **Events** (`onTrial`): `{ kind: 'pull', task, taskId, free, layout, b, a, ok, reason: 'sign' | 'distance' | 'zero-lock' | null, code, writing, product, calc, want, committed?, answer?, fresh?, count?, need?, doneNow?, all? }` — the modules read the student's own pulls by `taskId` (« في سجلّك: فتحتَ الخزانة الأولى بالرمز −8 ») and the opened writings of `f1`. **DOM**: `[data-code-lockers][data-task][data-world][data-layout][data-solved]`, `[data-cl-glance]`, `[data-cl-hall]`, `[data-cl-small=<i>][data-state]`, `[data-cl-locker][data-open]`, `[data-cl-door][data-open]`, `[data-cl-shake=<n>]`, `[data-cl-rule]`, `[data-cl-wheels]`, `[data-cl-wheel=<s|t|u|d1|d2|ns|n|ds|d>][data-value][data-locked]` (a `role="spinbutton"` inside), `[data-cl-up=<key>]`, `[data-cl-down=<key>]`, `[data-cl-screen][data-ok]`, `[data-cl-handle][data-ready]`, `[data-cl-commit]`, `[data-cl-committed]`, `[data-cl-switch]`, `[data-cl-next]`, `[data-cl-record]` / `[data-cl-row=<i>]`, `[data-cl-verdict=right|wrong|free|'']`, `[data-lab-context]`, `[data-lab-question]`, `[data-cl-step=<i>][data-done]`, `[data-cl-free][data-active]` and its `-b`, `-a`, `-set`, `-back`. **Bidi:** every verdict island is `LRI` + `LRM` … `PDI` (`iso()`), the screen and the plate are `<bdi dir="ltr">` (measured by character positions in the e2e, not by eye). **The door** swings away with `perspective(900px) rotateY(64deg)` inside an `overflow-hidden` locker and `pointer-events: none` (a 3D rotation without the clip overlapped the verdict and swallowed its clicks). **Tests:** `logic/codeLockers.test.js` (every preset solvable by the exact quotient, `judge` reasons, the refusals with their calculations, the commit flow, the two writings of `f1`, the free panel including b = 0, coach to the end), `operations/codeLockers.render.test.jsx`, `operations/codeLockers/geometry.test.js`, `e2e/lesson-kit/3am-unit1-qismat-nisbiyayn.mjs` (clicks, keyboard, pointer drag of a wheel and of the handle; four screen sizes).

## 2duoquadragies. The order of the operations under the hand — `tram-route` « خطّ الترامواي » (2AM unit 1, lesson `silsila-bidun-aqwas`, 2026-10-28)

The hand holds the ORDER in which a bracket-free chain is calculated. The drawn world (`tramline`, `operations/tramRoute/TramScene.jsx`) is the tram of an Algerian city: the line is laid from LEFT to RIGHT (time), one stop per TERM of the chain (the first term is the departure), the tram's lit counter is the TRUTH (the conventional value, stop after stop), groups board with a flag that carries their size, and a pure × ÷ chain is a ticket kiosk. The student STAMPS numbered tickets ① ② ③ on the operators of the chain (tap = next ticket, tap on a stamped chip = take it back and the following ones shift down; Enter at the keyboard; « مسح » clears); « انطلق » replays the PLAN: it calculates the chain in the student's order (panel « حسابك »), the tram rides the stops in time order, and the two must agree. A plan that disagrees is refused and the world draws the first step that LEAVES the conventional tree (`offTreeStep`): `overflow` « نزل 13 ؟ لم ينزل إلا 9 », `groups` « 18 فوجًا من 4 ؟ » (ghost groups), `price` « 4 تذاكر بـ 6,25 DA ؟ », `merged` (two stops swallowed into one operation), `backwards` (three or more operators done right to left). A DIFFERENT plan that gives the same value (a chain of + only) is ACCEPTED and the banner says « هنا كلّ ترتيب يعطي العدد نفسه » (`conventional: false`) — the contrast that opens the discovery. The lab never states the rule; the questions over the lab end on it. `tram-route` is distinct from `merge-board` (3AM: tap two NEIGHBOURING tiles, a magnet IMPOSES the priority), `story-bars` (1AM: the tape decides + or −, one operation), `elevator-reel` (a signed time scrubbed) and `vector-chain` (a metro map): here the student AUTHORS a whole order before anything happens and the world is the referee.

**Props / worlds** (`<Manipulation type="tram-route" … />`; every callback through `state.report`): `tasks` (`[{ id, chain, kind: 'stops' | 'kiosk', unit: 'pupils' | 'km', stops: ['market', …], build?, predict? }]`; `buildTask` THROWS on a negative intermediate or a bracket), `world` `'tram'` (default) | `'mixed'` (module 2: `levels={false}`, one task `50 − 4 × 6 + 30 ÷ 5 = 32`, no checkpoint chain), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead` (« كلّ عملية تحدث في محطة. »), `onTrial(event)`, `onFinished({ world })`. Presets (`levels.js`, `LEVELS['tram-route']`; `levels.test.js` measures the pair by `build` + `predict`): مبتدئ `t1` 26 − 9 + 4 (21), `t2` 40 − 12 − 6 + 9 (31), `t3` kiosk 150 ÷ 6 × 4 (100 DA), `t4` 15 + 3 × 4 (27); متقدم (`build` + `predict`, ref `know-1`): the student first WRITES the chain of the told story (plates and chips tapped into the strip, parity-checked, judged by VALUE) then writes a non-blocking prediction (counter veiled until the departure): `a1` 32 − 4 × 5 + 6 (18), `a2` 1,5 + 4 × 0,8 (4,7 km), `a3` 60 ÷ 4 + 3 × 6 (33). Maths: `packages/core/arithmetic/chainOps.js` (L1 row: `tokenize`, `parseChain`, `evaluateChain`, `traceChain`, `operatorsOf`, `valueInOrder`, `conventionalOrder`, `offTreeStep`, `chainText`, `numText`, `isNonNegativeChain`), imported BY PATH.

**Events** (`onTrial`): `{ tk: 'plan', id, order, value, truth, ok: true, conventional, free }`, `{ tk: 'refused', id, reason: 'mismatch', order, value, truth, station, absurd, free }`, `{ tk: 'build', id, chain, ok }`, `{ tk: 'predict', id, predicted, truth, ok }`, `{ tk: 'custom', free: true, id: 'free', chain, order, value, truth, ok }` (a trip of « جرّب أعدادك », never counted: up to four stops, each « صعد n / نزل n / صعد k أفواج من m / نزل k أفواج من m », refused when the counter would go below 0), `{ tk: 'solved', id, value }`; plus `checkpoint` / `checkpoint-done` from `LabCheckpoint` (`CHAINS`: t1 `realStop` `order`; t2 `swapAdds` `swapSub` `rule1`; t3 `unitPrice` `absurdPrice` `rule2`; t4 `groupsTotal` `whenAdded` `rule3`; a1/a2 `groupsTotal` `firstOp`; a3 `carShare` `groupsTotal` — every question is built from the task's own numbers, two hints, one right option). **DOM**: `[data-tram-route][data-task][data-world][data-solved][data-layout]`, `[data-tr-glance]`, `[data-tr-stage][data-at][data-riding]`, `[data-tr-world]`, `[data-tr-station=<i>]`, `[data-tr-badge=<i>]`, `[data-tr-kiosk]`, `[data-tr-ghost]`, `[data-tr-strip]`, `[data-tr-num=<i>]`, `[data-tr-op=<i>][data-ticket]`, `[data-tr-punch]`, `[data-tr-go]`, `[data-tr-clear]`, `[data-tr-builder]`, `[data-tr-bank]`, `[data-tr-token=<id>]`, `[data-tr-slot=<i>][data-kind][data-filled]`, `[data-tr-check]`, `[data-tr-clear-slots]`, `[data-tr-predict][data-sent]`, `[data-tr-predict-input]`, `[data-tr-counter][data-value][data-veiled]`, `[data-tr-plan][data-value][data-veiled]`, `[data-tr-lines]`, `[data-tr-verdict=''|riding|ok|any|free|refused|buildWrong]`, `[data-tr-next]`, `[data-tr-step=<i>]`, `[data-tr-free][data-active]`, `[data-tr-free-start]`, `[data-tr-free-type=<i>]`, `[data-tr-free-n=<i>]`, `[data-tr-free-k=<i>]`, `[data-tr-free-m=<i>]`, `[data-tr-free-add]`, `[data-tr-free-remove]`, `[data-tr-free-back]`, `[data-tr-free-refusal=empty|range|below]`. **Prototype checklist** (§8quinquies): LabCheckpoint + teacher switch, `LabStepper` + celebration, « إعادة » restarts from `t1`, sounds `tooth` (a stamp, a stop) / `flag` (agreed) / `over` (refused), full screen, `guided` when a checkpoint chain is active, LabCoach (`build` · `predict` · `stamp` · `stampMore` · `go` · `retry` · `free`, never an order or a number). Tests: `packages/core/arithmetic/chainOps.test.js`, `logic/tramRoute.test.js`, `operations/tramRoute.render.test.jsx`; e2e `apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya-silsila-bidun-aqwas.mjs`.

## 2duoquadragies bis. The brackets under the hand — `coop-calculator` « حاسبة التعاونية » (2AM unit 1, lesson `silsila-bi-aqwas`, 2026-10-29)

The hand holds the BRACKETS of a line typed on a scientific calculator. The drawn world (`coopshop`, `operations/coopCalculator/CoopScene.jsx`) is the school cooperative's counter: shelves of notebooks and pencil boxes, a wooden counter, the story's goods (`task.world.items`: pencil boxes, a book and its cover, notebooks, a bus, bread and milk, mark sheets, ball boxes), Hiba (`KidFigure`, hijab) behind it. The calculator (DOM, not SVG: 4×5 keypad of ≥ 48 px keys, a display row, the printed paper TAPE that keeps the last 4 lines) OBEYS the priorities (`chainOps.calculatorRead`) and the STORY is the second referee. **مبتدئ (`insert`)**: the line is pre-typed WITHOUT brackets as locked key-caps (`8 × 12 − 7`); the student taps a GAP between two key-caps (the cursor, a blinking bar) then presses « ( » or « ) » (⌫ removes the bracket left of the cursor; digits and operators are disabled); « = » prints. **متقدم (`type`)**: the line is empty; the student types the whole line from a told story or from a fraction-bar card (keys only, no free text), and the numbers of the line must be exactly the story's (typing the result is refused: `reason: 'numbers'`). Keyboard: digits, `+ - * / ( ) , .`, Enter, Backspace, ← →. Brackets are coloured by depth (outer blue, inner orange, third violet); the outer pair of a nested line is shown `[ ]` on the tape (`chainOps.bracketForm`).

**What the world does.** « = » prints the line and the machine's value. An unbalanced line → « Syntax ERROR » on the display (`reason: 'syntax'`; `Math ERROR` for ÷ 0), as a real calculator does. A value that is not the story's → the tape line is struck ✗, the scene puts a struck `؟` tag with the printed value on the goods and the banner says WHY in the story's own objects (`refute.<task>.<trap>`: « 48,75 DA لكلّ صديق؟ ثمن الكتاب وغلافه معًا 60 DA », « 84 مقعدًا… الحافلتان فيهما 100 مقعد، منها 40 للأساتذة والأولياء ») — never the rule, never the right line. The card « ما تقوله الوضعية » (`[data-coop-truth]`, with the equations) and the SHARE drawn on the counter appear only when the task is done or after the SECOND story refusal (earlier it would give the answer). A USELESS pair (a pair whose removal leaves the same calculation tree: `chainOps.uselessBrackets`) is ACCEPTED with the remark « هذان القوسان لا يغيّران شيئًا: احذفهما وتحقّق ». A task with `needPair` (k3) refuses the bracket-free line (`reason: 'nopair'`, the machine prints 19 and the banner asks for brackets) so that the student LIVES « the bracket around 2 × 5 changes nothing » and « around 9 + 2 gives 55 ».

**Props / tasks** (`<Manipulation type="coop-calculator" … />`; every callback through `state.report`): `tasks` (`[{ id, kind: 'insert' | 'type', pre?, truthLine, needPair?, traps?: [{ line, key }], card?: { bar: { num, den } } | { text }, facts, world: { items, share } }]`; `buildTask` computes the truth from `truthLine` and each trap's value, and `withoutDisplay`), `world`, `level`, `levels`, `coach`, `checkpoints`, `title`, `lead` (« الآلة تحترم أولوية العمليات. »), `onTrial(event)`, `onFinished({ world })`. Presets (`levels.js`, `LEVELS['coop-calculator']`; `levels.test.js` measures the pair by the task `kind`: all `insert` with `pre` / all `type`): مبتدئ `k1` 8 × 12 − 7 → 8 × (12 − 7) = 40 (without: 89), `k2` 45 + 15 ÷ 4 → (45 + 15) ÷ 4 = 15 (48,75), `k3` 9 + 2 × 5 (19, `needPair`: (9 + 2) × 5 = 55 refused, a pair around 2 × 5 accepted with the remark), `k4` 2 × 50 − 12 + 8 → 2 × [50 − (12 + 8)] = 60 (96; 2 × (50 − 12) + 8 = 84 and 2 × (50 − 12 + 8) = 92 refused); متقدم (ref `know-2`) `a1` card (40+8)/(15−9) → (40 + 8) ÷ (15 − 9) = 8 (without 31,53333333; the numerator alone gives the calculator's honest `−5,8`, refuted by « لا يمكن أن يكون النصيب أقلّ من 0 » and never computed or taught), `a2` (14 + 17 + 12,5) ÷ 3 = 14,5, `a3` (18 + 129) ÷ 7 = 21. The `alone` world of معارف (`levels={false}`, one task `m1` 5 × 20 − 3 → 5 × (20 − 3) = 85, no checkpoint chain). Maths: `packages/core/arithmetic/chainOps.js` L2 row (`tokenizeB`, `parseB`, `evaluateB`, `bracketPairs`, `bracketDepths`, `uselessBrackets`, `bracketForm`, `barToLine`, `lineToBar`, `calcDisplay`, `calculatorRead`, `leftToRight`, `calculatorKeys`), imported BY PATH; the L1 `tokenize` still REFUSES brackets.

**Events** (`onTrial`): `{ tk: 'print', id, line, value, ok, reason, useless, free }` (every « = »), `{ tk: 'refused', id, reason: 'syntax' | 'math' | 'story' | 'numbers' | 'nopair', line, value, truth }`, `{ tk: 'solved', id, line, value }`, `{ tk: 'custom', free: true, line, value, ltr }` (a free line, never counted); plus `checkpoint` / `checkpoint-done` from `LabCheckpoint` (`CHAINS`: k2 `paid` `whyFirst` `ruleFirst`; k3 `changed` `whyUseless` `ruleUseless`; k4 `firstDone` `thenDone` `ruleNested`; a1 `whichBracketed` `ruleBar` — every question is built from the task's `facts`, two hints, one right option). **DOM**: `[data-coop-calculator][data-task][data-world][data-solved][data-layout]`, `[data-coop-glance]`, `[data-coop-stage]`, `[data-coop-scene]`, `[data-coop-item=<glyph>]`, `[data-coop-share=<n>]`, `[data-coop-refuted]`, `[data-coop-card=bar]`, `[data-coop-calc]`, `[data-coop-display]`, `[data-coop-gap=<i>][data-cursor]`, `[data-coop-tok=<i>][data-depth][data-fixed]`, `[data-coop-result][data-status]`, `[data-coop-keys]`, `[data-coop-key=<k>]`, `[data-coop-back]`, `[data-coop-clear]`, `[data-coop-equals]`, `[data-coop-tape]`, `[data-coop-tape-row=<i>][data-ok]`, `[data-coop-verdict=ok|useless|story|syntax|math|numbers|nopair|done]`, `[data-coop-truth=<task>]`, `[data-coop-next]`, `[data-coop-step=<i>]`, `[data-coop-free][data-active]`, `[data-coop-free-key=<k>]`, `[data-coop-free-read]`, `[data-coop-free-ltr][data-differs]`.

**Free panel « جرّب أعدادك »** (always open, `[data-coop-free]`): its own line and keypad (≤ 24 keys, ≤ 2 bracket levels); « = » shows the machine's value AND « من اليسار دون أولوية » (`leftToRight`) so that `45 + 15 ÷ 4` reads 48,75 against 15; nothing counts. **LabCoach** `coachOf` (pure): `gap` · `bracket` · `print` · `syntax` (after a Syntax ERROR, on ⌫) · `type` (متقدم) · `free`; storage key `sa.labCoach.coop-calculator.off`; the guide never names a position or a value. Prototype layers: L2 teacher switch (`useLabCheckpointSettings('coop-calculator')`), L3 `LabStepper`, L4 celebration, L5 « إعادة » restarts everything from `k1`, L6 `playSfx` (key = `tooth`, correct print = `bell`, Syntax / Math ERROR = `over`, story refusal = `wrong`), L7 the shell's immersive mode, L9 guided.

**Why not another lab** (DNA §12): `merge-board` (3AM) draws existing « bubbles » and the student merges tiles inside them — nobody PLACES a bracket; here the bracket IS the hand's variable and the referee is a real calculator + the story. `marble-run` (3AM) asks for brackets around a substituted negative number (a substitution line, not a calculation order). `trig-calculator` (4AM) is a calculator for sin / cos / tan in degree mode. `tram-route` (L1) stamps an order on chips; here the order is imposed by the machine and the student changes the WRITING. Gesture family: PLACE a symbol into a typed line, then press « = » to ask a machine.

**Pitfalls met.** (1) Cursor positions shift by one after each bracket inserted: place the LAST bracket first (`2 × ( 50 − ( 12 + 8 ) )` is built right to left) in tests and e2e. (2) The calculator keypad is LTR inside the RTL page (`dir="ltr"` on the key grid and the line); the scene keeps its coordinates and rescales its viewBox width by `SCENE_H / H` so a compressed scene still fills its frame. (3) Event names use `tk` (like the other labs), not the plan's `kind`. (4) A refusal must not state the final result: « ما تقوله الوضعية » stays hidden until the task is done or after the second story refusal.

## 2duoquadragies ter. The last operation under the scissors — `chain-cutter` « مقصّ السلسلة » (2AM unit 1, lesson `wasf-silsila-hisab`, 2026-10-29)

The hand holds WHERE a printed chain is cut. Drawn world `corkboard` (in `operations/ChainCutter.jsx`, DOM + CSS, no raster): a cork board in a wooden frame, a cream paper STRIP carrying the chain (numbers and operators as print, brackets printed too, an LTR island), metal STAPLES drawn over the strip by the calculation rules (one per operation, nested outward, each with its value tag), big scissors (56 px) above, two labelled pockets, a sticker row (مجموع / فرق / جداء / حاصل قسمة) and a sentence bar that grows; Yasmine (`KidFigure`, hijab) holds the phone. The staples are never moved by the student.

**What the hand does.** *Cut task* (`kind: 'cut'`): drag the scissors onto an operator and release (snaps to the nearest eligible operator), or tap an operator then « قصّ »; keyboard ← → Enter. In مبتدئ « ثبّت » must be pressed first (it shows the staples); in متقدم (`hidden: true`) the staples stay hidden until the first cut (predict then see). After a valid cut the two pieces fall into pockets that relabel by the operation (`L.POCKETS`: « الحدّ الأول / الثاني », « العامل الأول / الثاني », « المقسوم / القاسم »); the student sticks the NAME on the cut (a wrong sticker slides off), and with `depth: 'full'` taps a compound piece to cut it again until only numbers remain. *Glue task* (`kind: 'glue'`, متقدم): tap two cards in order, an operation chip, the « مشبك » toggles for the left / right block, « ألصق »; the last block must have the STRUCTURE of the target (`chainOps.sameStructure`), otherwise it is refused and named (« شريطك مجموع … هل تحتاج إلى مشبك؟ »); « تراجع » undoes a glue.

**What the world shows.** A cut at the ROOT opens the last staple (dashed) and the pockets show their values; a cut elsewhere bites a staple (red + shake) and the banner says the « recollected » value (`cutAt(...).rebuilt`: 55 ≠ 27, never a negative one — `null`), or, when it is EQUAL by chance (`same`: 20 + 5 − 3 cut at +), « القيمة نفسها، لكن الشريط مدبّس هنا » — the staple, not the value, is the referee. Every value is ≥ 0 (`nonNegative`).

**Core maths** `chainOps.js` L3 row (`analyse` positioned tree, `lastOperation`, `operands`, `chainName`, `describe` — the Arabic sentence, `cutAt`, `staplesOf`, `build` with the brackets a structure needs, `sameStructure`) and `logic/chainCutter.js` (`init`, `selectOp`, `pin`, `cut`, `stick`, `focusOn`, `sentenceOf`, `pickBlock` / `setOp` / `toggleClip` / `glue` / `undo`, `freeRead`, `coachOf`).

**Props / tasks** (`<Manipulation type="chain-cutter" … />`): `tasks` (`[{ id, kind: 'cut', text, depth: 'root' | 'full', hidden? } | { id, kind: 'glue', cards, target }]`), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial`, `onFinished`. Presets in `levels.js` (مبتدئ c1–c6, متقدم a1 cut + a2–a4 glue) and `logic/chainCutter.js › PRESETS.alone` (the module-2 lab: one strip `(20 − 8) ÷ (1 + 2)`, `levels={false}`).

**Events** (`onTrial`): `{ tk: 'cut', task, at, ok, rebuiltValue, value, free }`, `{ tk: 'refused', task, reason: 'staple' | 'name' | 'glue', at?, name?, got? }`, `{ tk: 'name', task, piece, name, ok }`, `{ tk: 'glue', task, text, name, ok }` (`ok: null` for an intermediate glue), `{ tk: 'solved', task, sentence }`, `{ tk: 'custom', free: true, line, name }`; plus `checkpoint` / `checkpoint-done` (`CHAINS`: c1 `whereOk` · `firstDone` · `ruleLast`, c4 `pocketName` · `pocketDivisor`, c5 `sentenceC5` · `ruleHalf`, c6 `whySame`, a3 `whyClip`).

**Free panel « جرّب شريطك »** (always open, `[data-cutter-free]`): a text box (≤ 20 characters, `freeRead`) shows the last operation, the name, the value and the generated sentence, and tapping an operator chip shows whether the cut there works; nothing counts. **LabCoach** `coachOf`: `pin` · `cut` · `sticker` · `again` · `glue` · `clip` (after a glue refusal) · `free`, never the root.

**DOM contract**: `[data-cutter][data-task][data-solved]`, `[data-cutter-glance]`, `[data-cutter-board]`, `[data-cutter-strip]`, `[data-cutter-op=<i>][data-eligible][data-cut]`, `[data-cutter-staple=<i>][data-bite][data-open]`, `[data-cutter-scissors]`, `[data-cutter-pin]`, `[data-cutter-cut]`, `[data-cutter-sticker=<name>]`, `[data-cutter-pockets=<cell>]`, `[data-cutter-pocket=<cell>:<l|r>]`, `[data-cutter-cell=<key>]`, `[data-cutter-sentence]`, `[data-cutter-block=<id>][data-picked]`, `[data-cutter-op-chip=<o>]`, `[data-cutter-clip=<l|r>]`, `[data-cutter-glue]`, `[data-cutter-undo]`, `[data-cutter-verdict]`, `[data-cutter-next]`, `[data-cutter-free…]`.

**Why not another lab** (DNA §12): `marble-run` (3AM) draws the tree as a physical run to SUBSTITUTE a value; here the tree is never drawn and the hand FINDS the root by cutting. `merge-board` (3AM) merges tiles bottom-up; here the strip is taken apart top-down. `fraction-knife` / `area-split` cut a QUANTITY; here the cut is through WRITING, at an operator. `coop-calculator` (L2) changes the writing to change the order; here the writing is fixed and the student reads its structure.

**Pitfalls met.** (1) Plain `<MathText>` isolates an expression correctly but a story with several operators is simpler as a plain string wrapped in `⁦…⁩` (checked by measuring the digits' x positions — never trust the eye on RTL/LTR order). (2) At 1024×768 the lab column is ~414 px wide (the sidebar takes the rest): pockets are one compact line each, the sticker row has no visible label, the sentence is said once (the banner after the last name does NOT repeat it); the worst case (a1 done, with banner) measures 760 px. (3) In e2e both level panels exist in the DOM — query `:visible`. (4) A celebration overlay lasts 2.2 s: wait it out before the next scripted click.

## 2duoquadragies quater. The product shared among the bags — `kit-packer` « ورشة الحقائب التضامنية » (2AM unit 1, lesson `tawzi-darb-jam-tarh`, 2026-10-29)

The hand holds WHAT EACH DISPENSER RELEASES (and, in k4, HOW MANY BAGS). Drawn world `solidarity` (in `operations/KitPacker.jsx`, DOM + inline SVG, no raster): the workshop of the solidarity club — k identical school bags on a belt, two dispensers with a dial and a big readout, two counters, Fatima (`KidFigure`, hijab) who fills the bags one by one and Ali (hoodie) who sets the dispensers. The belt deals every load ONE ITEM PER BAG in turn (`deal(total, k)`), so the sharing is SEEN; a bag is READY when it holds exactly a notebooks and b pens (drawn inside it, counted under it). The referee is the BAG: two equal counters are not enough (n = 20, m = 10 prints 30 = 30 and wrong bags).

**What the hand does.** Turn a dial (drag in a circle, − / + round buttons ≥ 48 px, ↑ ↓ ±1, PageUp / PageDown ±10; max 120), then « وزّع ». Task kinds: `fill` (k1 `6 × (3 + 2)`, k2 `8 × (4 + 5)`, k3 `7 × (10 − 2)` — the second dispenser is the BIN of damaged notebooks, the bags receive n − m good ones —, a2 ribbons in metres shared in equal parts, a3 starts from a classmate's order `6 × 4 + 3`), `bags` (k4: dispensers LOCKED at 60 and 36, the hand sets the number of bags — 12), `split` (a1: 48 as a round number ± a small one on two dials and a + / − chip; 9 × 50 − 9 × 2). متقدم asks for a typed PREDICTION of the total first (the dials and « وزّع » stay locked until it is locked).

**What the world shows.** Reasons (`judge`): `unequal` (k does not divide the load: some bags have one more; « 3 حقائب بلا … » when a bag is empty — the dealt counts are always adjacent integers, so « too few AND too many » cannot occur), `short` / `extra` (equal shares, too small / too big), `pack` (k3: ready bags but not « a pack minus the damaged »), `split` (p ± q ≠ n). Ready: ✓ on every bag, both counters light together (`[data-kit-counter][data-lit]`) and the banner reads the prediction against the real total. Every value is ≥ 0.

**Core maths** `chainOps.js` L4 row (`expand`, `factorOut`, `commonFactor`, `mentalSplits`, `expandLetter`) and `logic/kitPacker.js` (`deal`, `buildTask`, `init`, `setDial` / `stepDial` / `setBags` / `setSplit`, `setPredict` / `lockPredict`, `judge`, `dealNow`, `counters`, `freeRead`, `coachOf`).

**Props / tasks** (`<Manipulation type="kit-packer" … />`): `tasks` (`[{ id, kind: 'fill' | 'bags' | 'split', k, a, b, op, unit?: 'items' | 'm', predict?, start?: { n, m } }]`), `level`, `levels`, `coach`, `checkpoints`, `title`, `lead`, `onTrial`, `onFinished`. Presets in `levels.js` (مبتدئ k1–k4, متقدم a1–a3) and `logic/kitPacker.js › PRESETS.alone` (the module-2 lab: 5 bags of 6 + 4, `levels={false}`).

**Events** (`onTrial`): `{ tk: 'deal', task, n, m, k, ok, reason, total, free }`, `{ tk: 'refused', task, reason, side, n, m, k }`, `{ tk: 'predict', task, predicted, total, ok }`, `{ tk: 'split', task, p, q, op, ok }`, `{ tk: 'solved', task, total }`, `{ tk: 'custom', free: true, line }`; plus `checkpoint` / `checkpoint-done` (`CHAINS`: k1 `howMany18` · `why18` · `compare30`, k2 `ruleSum`, k3 `binCount` · `ruleDiff`, k4 `bagsCount` · `commonCount` · `ruleFactor`, a1 `whyEasier`, a3 `whyAll`).

**Free panel « جرّب أعدادك »** (always open, `[data-kit-free]`): k ≤ 12 bags, a and b ≤ 9 (− requires b < a), steppers + a + / − chip; it prints `k × (a ± b)` and `k × a ± k × b` with their common value. **LabCoach** `coachOf`: `predict` · `dial` · `dial2` · `deal` · `retry` (after a refusal) · `bags` · `split` · `free`.

**DOM contract**: `[data-kit][data-task][data-solved]`, `[data-kit-glance]`, `[data-kit-fatima]`, `[data-kit-ali]`, `[data-kit-counter=<fatima|ali>][data-lit]`, `[data-kit-dispenser=<id>]`, `[data-kit-dial=<n|m|k|p|q>][data-locked]` (role spinbutton), `[data-kit-dial-plus|minus=<id>]`, `[data-kit-deal]`, `[data-kit-belt][data-running]`, `[data-kit-bag=<i>][data-state=idle|ready|short|extra]`, `[data-kit-predict]`, `[data-kit-predict-input]`, `[data-kit-predict-lock]`, `[data-kit-split-p|q]`, `[data-kit-split-op=<+|−>]`, `[data-kit-verdict=<code>]`, `[data-kit-next]`, `[data-kit-free]`, `[data-kit-free-k|a|b|op|show|kit|split|error]`.

**Why not another lab** (DNA §12): `area-split` (3AM) is a garden seen from above whose knob cuts a SIDE — distributivity as an AREA; here there is no area, discrete items are dealt into bags and the hand sets QUANTITIES. `turf-factoring` / `pitch-expansion` (4AM) are area / gcd / identities. `fair-share` (1AM) shares ONE quantity; here two loads are dealt and the point is their SUM. `egg-trays` (2AM unit 2) packs eggs (Euclidean division), no second item.

**Pitfalls met.** (1) At 1024×768 the lab column is ~414 px (the sidebar takes the rest): one strip for Fatima / Ali and their counters, dispensers side by side, bags ≥ 34 px in at most two rows; the worst phase (a2 with 15 bags, banner + next) is measured by the e2e. (2) The belt animation is view-only (`useDealAnim`); the verdict, the counters and the step celebration wait until it is settled. (3) In e2e both level panels exist in the DOM — query `:visible`. (4) Dial keyboard steps follow the dial's `step` (a1's round-number dial steps by 10).

## 2unquadragies. The number on its rung — `size-ladder` « سلّم الأحجام » (3AM unit 3, lesson `kitaba-ilmiya-rutba`, 2026-10-26)

`operations/SizeLadder.jsx` (+ `operations/sizeLadder/art.jsx`: `Rung` — a wooden board per decade with its two labelled ends `10ⁿ` / `10ⁿ⁺¹`, nine cells between the graduations 1 … 10 placed LOGARITHMICALLY (`log10(k)` of the board length), a dashed hairline at every `log10(k + 0.5)` (the rounding boundary of the magnet, never labelled), the numbers 1 … 9 only on the active rung —, `Pow` / `Given` / `SciNode` (REAL `<sup>` exponents: the Unicode superscript digits are missing from the font and `⁴` printed as a blob), `sciTexOf`, the CSS) on `logic/sizeLadder.js` (exact; `packages/core/arithmetic/tenPowers.js` imported BY PATH — the lesson ADDED `scientific`, `isScientific`, `bracketOf`, `cellOf`, `orderOfMagnitude` (round half up, the carry `a' = 10 → 1 × 10ⁿ⁺¹`), `logPos`, `sciTex`; `compareDec` and `timesPow10` existed). Theme `fair-wall` (`VISUAL_THEMES`, kind `objects`: the science-fair corridor); strings `lesson.manipulation.json › sizeLadder`; render test `operations/sizeLadder.render.test.jsx`.

**The hand holds the POSITION of a card** on a fixed ladder of decades (10⁻⁹ … 10¹² m, 21 rungs, the window shows 5 rungs — 4 below 860 px of height — and slides so that the card's rung is always the middle row). Three gestures in order: its RUNG n (drag the card up / down — RELATIVE, one row = one rung, so the ladder scrolls under the hand —, tap a row, ↑ ↓, the round buttons), its CELL (the integer part of `a`: drag / tap on the board, ← →), then the MAGNET (a toggle button, key M: the card jumps to the nearest whole graduation, `a'`; `a' = 10` makes it climb to the start of the next rung). Releasing (or « علّق », or Enter) is the trial; the window is a `role="slider"` (`aria-valuenow` = the rung). A card is hung only on the rung and in the cell that contain its length: otherwise it FALLS BACK (to the waiting tray for a wrong rung, stays on the rung for a wrong cell) and the banner states the calculation — `265 ≥ 1 000 ؟ لا: البطاقة أصغر من 10³ م` (rung), `300 > 265` / `200 ≤ 265` (cell: the value of the graduation, never the mantissa) — and never the rule. A wrong rung does NOT glow red while hovering (the verdict comes with the release: the lab is not solved by trial colouring). On its rung and in its cell the card is rewritten `2,65 × 10²` (tag + banner chip) and its needle sits at `log10(a)`; the magnet rewrites it `≈ 3 × 10²`.

**Tasks.** `{ id, kind: 'hang' | 'compare', cards: [{ id, key, given, unit?, typed?, magnet? }] }`; `given` is the length AS WRITTEN (`265`, `1 950 000`, `0,048 × 10^-3`, `1 200` + `unit: 'km'`). `magnet: true` makes the magnet REQUIRED to finish the card (every card of the lesson: the plan said « introduced at card 3 » but question 3 of module 1 uses the magnet on the first card). `typed: true` (متقدم) puts a phase BEFORE the ladder: the student writes `a` and `n` and the answer is judged exactly — `typed-form` (`12 × 10⁵` equals the length but 12 is not from 1 to under 10), `typed-value` (`4,8 × 10⁻¹ = 0,48`, the length is `0,000048`: the comma-direction fault is refused WITH the value), `typed-invalid`. A `compare` task hangs TWO cards one after the other then asks to pick the longer one (`[data-sl-pick]` buttons, or a tap on a card): a wrong pick is refused with the reason — same rung (« الأبعد إلى اليمين ») or a higher rung (« الأعلى درجة هي الأطول مهما كان العدد الأوّل »); the right one gets the crown. Presets (`levels.js`): مبتدئ c1 the minaret ≈ 265 m (rung 2, cell 2, `2,65 × 10²`, magnet `3 × 10²`) · c2 a bus trip ≈ 1 950 000 m (6, 1, `1,95 × 10⁶`, `2 × 10⁶`) · c3 a sheet 0,0001 m (−4, 1: the card sits on the LEFT end of the rung) · c4 compare 0,0006 and 0,0001 (same rung −4, cells 6 and 1); متقدم c5 1 200 km (typed) · c6 0,048 × 10⁻³ m (typed; `4,8 × 10⁻⁵`, magnet `5 × 10⁻⁵`) · c7 12 742 km (typed; `1,2742 × 10⁷`) · c8 compare `9,8 × 10⁻⁵` and `1,2 × 10⁻⁴` (two rungs: −5 < −4 although 9,8 > 1,2). `levels.test.js` measures the pair by the typed phase (متقدم only) and by the non-decimal writings (k × 10ᵖ, km).

**Free panel « جرّب أعدادك »** (always open, `[data-sl-free]`): a text field for a positive decimal (≤ 15 significant digits) or `k × 10^p` (|p| ≤ 12, `x` accepted for `×`), result within 10⁻⁹ … 10¹²; refusals `zero`, `neg` (« السلّم للأعداد الموجبة »), `invalid`, `digits`, `range`; free trials carry `free: true` and never tick a task nor open the discovery. `35,2 × 10^4` refuses rung 4 (352 000 ≥ 10⁵: the book's « which pupil is right? » is LIVED here) and `9,7 × 10^3` makes the magnet climb to the rung above. **Discovery** (one per level, `ManipulationDiscovery` carries ONE prompt): مبتدئ `order` (« كيف نعيّن رتبة القدر؟ » — `✓` round `a` to the unit, `✗` drop what follows the comma (refuted by 2,65 → 3), `✗` the next power (refuted by the minaret's `3 × 10²`)); متقدم `sci` (« متى تكون الكتابة `a × 10ⁿ` هي العلمية؟ » — `✓` when the card is on the rung `10ⁿ` itself: `1 ≤ a < 10`, `✗` `a` natural (refuted by `35 × 10⁴`), `✗` `n` positive (refuted by the hair `4,8 × 10⁻⁵`)). Formal text: `265 = 2,65 × 10²`, `10² ≤ 265 < 10³`, order `3 × 10²`, `9,7 × 10³ → 1 × 10⁴`.

**LabCoach** `coachOf` (pure, followed to the end of both levels in `logic/sizeLadder.test.js`): `card` (first card only) · `rung` · `cell` · `magnet` · `type` (متقدم) · `pick` · `next` · `free`; storage key `sa.labCoach.size-ladder.off`; the guide never names a rung, a cell or a rule. **Events** (`onTrial`): `{ kind: 'hover', task, rung }`, `{ kind: 'refused', task, rung?, reason: 'below' | 'above' | 'cell-before' | 'cell-after' | 'typed-value' | 'typed-form' | 'compare', value }`, `{ kind: 'dock', task, n, a }`, `{ kind: 'magnet', task, a1, n1 }`, `{ kind: 'typed', task, a, n, ok }`, `{ kind: 'compare', task, winner, ok }`, `{ kind: 'solved', task, sci, order }`, `{ kind: 'custom', value }`; the modules read the student's own `dock`, `magnet` and `compare` events. DOM: `[data-size-ladder][data-task][data-solved]`, `[data-sl-glance]`, `[data-sl-stage]`, `[data-sl-window]` (`role="slider"`), `[data-sl-rung=<n>]` (+ `[data-active]`), `[data-sl-end=lo|hi]`, `[data-sl-board=<n>]`, `[data-sl-board-active]`, `[data-sl-cell=<n>:<c>]`, `[data-sl-card=<id>][data-docked][data-kind=given|sci|order]` (+ `[data-sl-on-wall]`), `[data-sl-tag]`, `[data-sl-needle]`, `[data-sl-crown]`, `[data-sl-tray]`, `[data-sl-kid]`, `[data-sl-up|down|left|right]`, `[data-sl-dock]`, `[data-sl-magnet]`, `[data-sl-typed]` / `[data-sl-input=a|n]` / `[data-sl-check]`, `[data-sl-pick=<i>]`, `[data-sl-next]`, `[data-sl-retry]`, `[data-sl-banner][data-code][data-sl-refused]` (+ `[data-sl-readout]`, `[data-sl-banner-sci]`), `[data-sl-free]` (+ `-input`, `-add`, `-back`, `-refusal`), `[data-sl-formal]`.

**Why not another lab** (DNA §12): `pin-rails` (3AM) slides a pin along a LINEAR price rail to a value read on a squared frame — here the scale is LOGARITHMIC by decades, the dock refuses a whole rung (the bracket) and the place inside a rung IS the mantissa `a`; no frame, no line through nodes. `ruler-compare` (1AM) picks a graduation to separate two decimals — here nothing is graduated finer: the card is hung on a multiplicative scale and the order of magnitude is a magnet. `decimal-comma` has no digit string, no comma handle: the normalisation emerges from where the card fits. `ten-zoom` (lesson 1) rescales ONE view (the hand holds `n` of a frame); here many numbers live on one FIXED ladder (the hand holds a card's position). `unit-ladder` (lesson 2) stretches a band between marks. Gesture family: DRAG-AND-DOCK on a continuous scale.

**Pitfalls met.** (1) Use a real `<sup>`: the Unicode superscripts `⁻` `⁴` … render as blobs in the lab font; keep the unit in its own `ms-1.5` span so it does not collide with the exponent. (2) Numbers inside a refusal sentence MUST be KaTeX (`$265 \ge 1\,000$`, with the NBSP groups turned into `\,` AFTER the decimal comma became `{,}`): plain Arabic text re-orders `265 ≥ 1 000` into `1 ≥ 265 000`. (3) A drag that moves the card up while the window re-centres on it must use a RELATIVE pointer distance from the pointer-down (`h0 − round(dy / ROW)`), never the pointer's absolute row. (4) The kid sits in the tray row (one `[data-sl-kid]`): a kid beside a 5-row ladder was hidden at the 494 px lesson column. (5) `[data-sl-glance]` is 561–708 px tall at the five sizes (4 rows below 860 px of height). (6) Reading an e2e screenshot: LTR islands inside the RTL page are easy to misread — assert the order on the DOM text (`265 م`, `≈ 3 × 10²`) as well as by eye.

## 2quindecies. The space laboratories and the 3D kit (unit 14, 2026-10-05)

The first unit IN SPACE. Its labs show REAL solids — light, transparency, an orbit under the finger — and every one of them stands on ONE
kit, `manipulations/space/stage3d/` (three.js, already a dependency of the Math Lab's 3D tool; never a second renderer):

- **`SpaceStage`** (`spaceStage.js`, no React) — the conventions of the Math Lab scene (`features/mathlab/tools/geometry3d/solidScene.js`):
  the mathematical frame has z UP and is translated to three.js (`toThree` (x, y, z) → (x, z, −y), `fromThree`), rendering is ON DEMAND (no
  permanent loop; `animate(fn)` for a short animation), labels are DOM (`CSS2DRenderer`, LTR, `aria-hidden`), everything is disposed on unmount,
  the background is TRANSPARENT (the lab's decor sits behind the canvas). The mathematical gesture in the scene is
  **`draggable(obj, { start, move({ onPlane(n, p), onLine(p, d) }), end })`**: the orbit pauses while the student holds an object; the handler
  projects the ray on a plane or a line of the mathematics (a point M on a horizontal plane, a cutting plane along an axis, a water level).
- **`solids3d.js`** — factories in mathematical coordinates: `sphere` (glass surface: the كرة), `ball` (solid: the جلّة), `box`, `cylinder`,
  `cone`, `frustum` (an open bucket), `pyramid`, `edges`, `line` / `segment` (dashed or not), `ring`, `disc`, `polygon` (a filled section),
  `plane`, `dot`, `handle`.
- **`Stage3D.jsx`** — the React bridge: `build(stage)` runs ONCE and returns `{ update(state), dispose? }`, each `state` change calls `update`
  (never a new scene); the stage is focusable (arrows orbit the VIEW — an aid, not the mathematical gesture — and ↺ resets it,
  `lesson.manipulation.json › stage3d`). **Until the WebGL scene exists the `fallback` fills the window** — a `SpaceFigure` of the same
  situation: the server render of the render tests sees it (no WebGL in Node), a browser without WebGL keeps a readable lab, and the scene is
  born in a LAYOUT effect, before the first paint (no flash). `prefersReducedMotion()` cuts the orbit damping; the labs read it for their
  animations.
- **Rules.** Every gesture of the scene ALSO exists as an HTML control (slider, stepper, buttons) with its keyboard — the canvas is never the
  only way and the render test sees every control. The stage takes the finger on a phone (`touch-action: none`): it stays ≤ ~55 % of the
  viewport height so the page can scroll around it (§8bis). A workspace mounts both levels → two scenes: never a global singleton. The unit
  e2e (`e2e/lesson-kit/4am-handasa-fada.mjs`) fails when a glance block's `[data-stage3d]` is not live (`data-stage3d-ready`): a lab left on
  its fallback is not the lab.
- Verdicts and values come from `packages/core/arithmetic/space.js` (exact π-multiples, `ballPosition` comparing OM² and R² exactly,
  `sphereSection`, `cuboidSection`, `cylinderSection`, `apexSection`, `scaleEffect`, `bucketWater`).

Five types in `manipulations/space/` (glance `data-sp|op|sl|sb|bf-glance`, measured by `e2e/lesson-kit/4am-handasa-fada.mjs`, module 1, both
levels, four viewports, scene live), each with a `logic/` module, its tests and a render test:

- **`sphere-probe`** (`SphereProbe.jsx` + `sphereProbeScene.js`, `glass-globe` / `shot-put`) — the probe M on whole grid points: dragged on its
  horizontal plane (`onPlane`), ▲/▼ for the height (`onLine`), x/y/z spinbuttons (a 3-tile row with one −/+ pair under 380 px); the scene
  controller is a plain module bridged through a ref; verdicts by `ballPosition` naming the comparison; a كرة / جلّة toggle on the stage;
  stage 2 (opened by the student): diameter [MM′] and the plane z = h with its live section.
- **`orange-peel`** (`OrangePeel.jsx`, `boufarik-orange`) — R held in tenths (exact) by a rim handle; phases `peel | pour | book` (the last two
  opened by the student, `book` advanced only); a prediction locked by the gesture; cards judged on DIMENSION before value (reusable: a length or
  a volume is refused as an area even when the number coincides); the camera frames the bounding box of every possible disc so the view does
  not jump.
- **`section-slicer`** (`SectionSlicer.jsx`, `3d-printer`) — stages `sphere | cuboid-face | cuboid-edge | cylinder-base | cylinder-axis |
  pyramid`, each variable an integer index on an exact fraction grid; predict-then-print with 3 cards, a refused card left as a dashed GHOST
  layer; `sceneFigure(lab)` is the swept Stage3D fallback with a declutter pass; camera distance fitted to the aspect by a ResizeObserver in
  `build`; per-world `Group.scale` so one camera serves every solid; a fixed-height verdict area so the stage never jumps.
- **`scale-blocks`** (`ScaleBlocks.jsx`, `voxel-blocks`) — k held by a handle on the image's far corner (snapped list) and a stepper; the image
  volume predicted then refuted by the count (InstancedMesh voxels revealed layer by layer through `stage.animate`, k³ same-colour blocks); the
  « +1 cm » contrast; the stage host exposes the handle's projected screen position (`data-sb-handle`) so an e2e can drive the 3D drag;
  narrow (< 380 px) and tiny (< 250 px) recipes.
- **`bucket-fill`** (`BucketFill.jsx`, `beach-bucket`) — three phases opened by the student (level / apex / volume) with a back button on the
  stage; the water and the apex S both dragged on the axis (`onLine`); the apex verdict from the exact reach r(a + H)/a against R; a flat
  axial-section `MovablePanel` beside the 3D (affine magnification, said in its note); the camera reframes on release, never during the drag.

## 2quaterdecies. The rotation laboratories (unit 13, 2026-10-04)

Five types in `manipulations/rotation/`, every verdict from `packages/core/arithmetic/rotation.js` (`imageCheck`, `arcAngles`, `vertexAngle`,
`sidesFromCentral`, `circleGaps`, `ringByRotation`…), each with a `logic/` module, its tests and a render test; glance blocks
`data-rd|st|ia|pf|lr-glance`, measured by `e2e/lesson-kit/4am-dawaran-mudalaat.mjs` (module 1, both levels, four viewports). A refusal of an
image always NAMES the failing condition of the textbook's definition (OM′ = OM, the angle, the sense) — `imageCheck` returns all three.

- **`rotation-dial`** (`RotationDial.jsx`, `ferris-wheel`) — two scenes, one variable (the image point): `wheel` (nodes on 2k spokes × rim /
  inner ring, exact, `tasks` in steps of `step`) and `plane` (missions point / segment / circle with a compass snapped onto OP and a protractor
  ruler whose zero lies on [OP)). Verdict kinds `ok | sense | radius | angle | both | zero | center`. Reusable pattern: an instrument MAGNET that
  attracts only toward the student's own constructions, never toward the answer.
- **`shape-turn`** (`ShapeTurn.jsx`, `zellige`) — a rotation held with the stretch engine (θ read from the pointer, unwound near the current
  value), a second stretch engine for the FAKE handle (a dilation: the counter-example), invariant gauges in a `MovablePanel` that become chips
  under 420 px; claims proved by carrying property cards (`judgeClaim` refuses on drop, nothing leaks on hover); the centre pin is a stage the
  student opens (§7quater).
- **`inscribed-angle`** (`InscribedAngle.jsx`, `football`) — a free plane pin with a polar `legal()` (±7 % magnet to the circle, pushed off the
  posts, snapped to the diameter in the مزيان stage), keyboard as a `role="slider"` validated after 700 ms or on Enter, an inside / on / outside
  toggle as the tap path; a bet gates the reading; chained stages (§7quater).
- **`polygon-forge`** (`PolygonForge.jsx`, `honeycomb` / `flag-star`) — α held by the stretch engine with the handle drawn as the NEXT image on
  the circle; each « دوّر » is a trial; the run's outcome from `sidesFromCentral` / `normalize` (closes, spirals, star); α locked during a run;
  advanced chains three stages (angle, radius from the tips' distance, branches).
- **`lamp-ring`** (`LampRing.jsx`, `flower-bed`) — one scene in three phases (by hand → by rotation → the distance), the second opened by the
  student; refusal kinds `handUnequal`, `overshoot`, `ringOpen`, `formulaKo` from `circleGaps` / `ringByRotation`; the rotation angle is held
  through the position of the SECOND post, not a dial, so the lab does not converge with `polygon-forge` (MANIPULATION_DNA §12).

## 2terdecies. The vector laboratories (units 11–12, 2026-10-04)

Every verdict comes from `packages/core/arithmetic/vectors.js` (`relation`, `simplifyNamed`, `isParallelogram`, `midpoint`, `distance`,
`crossing`, `shortestCrossing`…); each lab has a `logic/` module with its tests and a render test, files in `manipulations/vectors/`; glance
blocks `data-tg|pp|vs|vc|bp-glance` (unit 11) measured by `e2e/lesson-kit/4am-ashia-insihab.mjs`. A refusal always NAMES the element that
differs (direction, sense, length) — the textbook's definition of equal vectors turned into the lab's voice.

- **`translation-glide`** (`TranslationGlide.jsx`, `drone-show`) — grid-node placement (plane-pin pattern: pointer capture, a per-object
  button for tap and keyboard); kinds equal / direction / sense / length / senseLength / zero / outside / tooFar; a rogue drone flying −u
  appears once the images are placed and opens the discovery when repaired; the complete formation glides as one block.
- **`parallelogram-pin`** (`ParallelogramPin.jsx`, `tifo`) — the stretch engine for I on [AB], grid pins for D then E; the banner's shape and
  the merging of the two diagonals' midpoints come from `isParallelogram` / `midpoint`; the E stage is opened by the student and has a way back.
- **`vector-sum`** (`VectorSum.jsx`, `scooter` / `swim`) — a carry-to-station chain (only the head of the first vector accepts the second's
  tail) and a rotation held with the stretch engine (θ from the pointer's angle on a half-disc track); 30° is decided exactly
  (`crossing` / `crossingSide`); the speeds float in a `MovablePanel` that becomes a line under 380 px when it would cover the handle.
- **`vector-chain`** (`VectorChain.jsx`, `metro`) — one carry engine whose drop zones are the train's two ends and the map's stations;
  equalities judged on exact points PLUS a graph of givens (reversal, transitivity): a swap needs the equality AND its justification
  (« الشكل لا يبرهن »); `construct` mode builds a sum of representatives head to tail.
- **`bridge-path`** (`BridgePath.jsx`, `crosswalk` / `bridge`) — one scene in three phases (explore / translate / straight), the second opened
  by the student; the crossing's position held by the stretch engine, then B′ as a plane pin; the discovery needs the straight line AND a
  longer position tried; the length-vs-position chart in a `LabFold`.

Unit 12 (glance blocks `data-cs|cc|md|sp|rc-glance`, measured by `e2e/lesson-kit/4am-ashia-maalam.mjs`):

- **`component-steps`** (`ComponentSteps.jsx`, `delivery`) — orders `walk | walkCode | code | pin`: the rider walked node by node (drag along
  a street, tap, pad, arrows), a trip code on two signed spinbuttons judged by WHERE the scooter stops (refusals `sign`, `swap`, `coords`,
  `reverse`, `zero`, `outside`); the invariant is that the code depends only on the displacement; under 260 px the order tabs become a
  « ‹ n/5 › » stepper.
- **`component-calc`** (`ComponentCalc.jsx`, `game-map`) — chained missions `calc | place` inside one level with an explicit next-mission
  gesture (§7quater); `live: false` is how متقدم removes the component lamps until validation; the map width is fitted to the island.
- **`midpoint-distance`** (`MidpointDistance.jsx`, `gps-meet`) — two stages, the second opened by the student; verdicts from
  `relation` / `distance`; narrow-screen recipe: `smallmatrix` components, value-only claims, icon buttons, the shared-positions
  `MovablePanel` becomes a row under 380 px. The advanced reading guard lives in `logic/midpointDistance.js › meetReadingLive` (regression-tested).
- **`shape-prover`** (`ShapeProver.jsx`, `football`) — a claim plus proof cards judged by `REQUIRE` groups in a fixed order: flat →
  other vertex / apex → unbalanced card (« false ») → missing card; under 640 px the verdict floats on the scene as a transient
  `MovablePanel` cleared on the next move — a reusable pattern for §8bis.
- **`route-compare`** (`RouteCompare.jsx`, `cross` / `rally`) — one pin whose step depends on the piece (a semicircle's centre at ½, a
  checkpoint at 1); refusals `miss` (centre not the midpoint: the arc ends at 2C − P), `atEnd`, `off`, `skip`; the bet gates the build,
  the discovery needs both routes; verdicts from `vectors.routeLength` / `arcEnd` / `semicircle`.

## 2duodecies. The trigonometry laboratories (unit 10, 2026-10-04)

Four types, every verdict from `packages/core/arithmetic/trigonometry.js` (no lab computes a ratio itself), each with a `logic/` module,
its tests and a render test; glance blocks `data-rr|tc|ac|cl-glance`, measured by `e2e/lesson-kit/4am-hisab-muthallathat.mjs`.

- **`ramp-ratios`** (`geometry/RampRatios.jsx`, `skatepark`) — the first CHAINED carry inside one level: pick the acute angle → name the
  sides → compose the ratios, then a stretch (the rise at مبتدئ; board and angle plus a PREDICTION judged before reading at متقدم). Resistance:
  the right angle refused, a mislabelled side returned with its reason, the hypotenuse over a sine refused with its value > 1; the bound
  0 < sin, cos < 1 is SEEN (the board swung onto the ground lands beyond A). Invariant: at a fixed angle, the ratios do not move with the size.
- **`trig-calculator`** (`geometry/TrigCalculator.jsx`, `drone`) — the hand holds a real KEY SEQUENCE on a drawn calculator (19 keys ≥ 44 px,
  LTR) and a cut line on the screen digits (`role="slider"`). It starts in RAD on purpose: `trigonometry.ratioRad / angleRad` give the
  absurd value that the drone's triangle contradicts; forgetting 2nd, the wrong inverse, an impossible sin⁻¹ (« خطأ رياضي »), truncation and
  the wrong precision are each refused. Narrow screens: under 250 px the glance block takes back the stage padding and the keypad goes to
  4 columns; under 380 px one shared control row carries the decisions / tasks / next button.
- **`angle-compass`** (`geometry/AngleCompass.jsx`, `kite`) — construction without a protractor, for real: set square, a carried length,
  the compass opening and a pencil lowered from 90° so the arc cuts the other leg at the exact √(r² − a²) (`r·cos θ = a`); a ruler path for
  tan. Resistance: `short` / `touch` (the string never reaches), `legs` (sin built on two legs = a tangent), `vertex`, `hypTan`. Invariant on
  every triangle, refused ones included: cos² + sin² fills a bar to exactly 1, tan = sin / cos. Layout lessons worth reusing: the scene's
  scale is RATCHETED DOWN only (a control row appearing never moves a handle under the finger), handles are clamped inside the scene, the
  reading floats in a `MovablePanel` on the sky side, compacted with `\tfrac` on phones.
- **`clinometer`** (`geometry/Clinometer.jsx`, `floodlight` / `mural` / `maqam`) — ONE plan engine (`logic/clinometer.js`: `planFor` =
  `lengthPlan`, `ratioVerdict` names the missing side, `chooseOp` refuses with the value it would give) for three modes: `height` (distance and
  phone tilt held, the shutter accepts the aim to the degree, the height is the same from every distance), `ladder` (the تحدّ: a telescopic
  length bracketed by hand before sin ÷), `align` (the observer slides until the pole hides the monument: Thales then tan). Props flat or
  grouped in `numbers`, contract fixed in the unit's brief; the synthesis reuses it with its own `LAB` and `lab.render.test.jsx`. The phone is a
  `MovablePanel`, compact under 380 px.

## 2undecies. The geometry laboratories (unit 9, 2026-10-02)

Unit 9 « خاصية طالس », the first unit under the programme's « ميدان الهندسة » (`handasa`), added five types by the §7ter
recipe, in a new folder `manipulations/geometry/` (logic `logic/<name>.js` + tests, render test `geometry/<name>.render.test.jsx`,
strings `lesson.manipulation.json › thalesBeam | parallelLevel | segmentDivider | shadowStick | coneCylinder`). Every verdict comes
from ONE exact module, `packages/core/arithmetic/thales.js` on `linear.js` fractions — drawing coordinates may be floats, they decide
nothing. Its central convention: points on the two secant lines are SIGNED abscissas from A, so `converse({ b, bp, c, cp })` decides
the reciprocal on the ratios AND the order at once (`reason: 'ratios' | 'order'`). All five are **manual** (§6bis: each gesture is a
trial), report through `state.report`, carry a decorative layer (`aria-hidden`, `[data-deco]`, out of the keyboard path, still under
reduced motion) and are measured one-screen (§8bis) on their glance block at the four viewports, both levels, by
`apps/web/e2e/lesson-kit/4am-khassiyat-talis.mjs`. New worlds in `VISUAL_THEMES`: `cinema`, `camera`, `mural`, `minaret`, `cornet`,
`river`, `tifo`. Full props, DOM contract and DNA sheet are in each component header; the essentials:

| Type | The hand holds | Resistance | Discovery (contrast) | Lessons |
|---|---|---|---|---|
| `thales-beam` (`ThalesBeam.jsx`, glance `[data-tb-glance]`) | the screen's position AB′ (signed index: step 1 at مبتدئ, 0,1 at متقدم over −6…6 so it passes THROUGH A) and its tilt t, by drag on the scene, the B′/C′ sliders, −/+ and keys; « سجّل الموضع » then the student JUDGES the stop (« متساوية » / « ليست كلها متساوية ») | a tilted stop judged equal is refused naming the ratio that differs (AC′/AC = 3/5 ≠ 1/2); a stop at A is refused; a rounded متقدم stop (3,73 ; 3,25) judged unequal is refused with the exact k = 8/15; B′C′ is decided on its exact square (law of cosines, cos Â rational), « ≈ » only on display | two parallel stops + a tilted one (متقدم: also AB′ = 3,2 and a stop behind A — the camera obscura, the butterfly case); « always equal » and « constant difference » refuted with the student's own numbers | `talis-hisab-atwal` M1 (`cinema` 4/5/3 ; act-1 6/7/6,1, `camera` behind A) |
| `parallel-level` (`ParallelLevel.jsx`, glance `[data-pl-glance]`) | the positions of B′ on (d) and C′ on (d′), notch by notch in a « slot » space that skips A (drag along each bar, tap on the bar, ▲▼, keys) | a spirit level on the plank: the bubble is centred ONLY when `thales.converse` says parallel, otherwise it flees at least 0,35 towards the higher end; at متقدم a placement off the teacher's ratio 1/3 is refused (`condition`), and the textbook's figure 3 (1/3 and 1/3 on opposite sides of A) is refused by the ORDER | مبتدئ: two level planks with different k, (2 ; 3) and (4 ; 6), plus a tilted one (the start (5 ; 8) is « same distance to the feet »); متقدم: the three students' figures 1, 2, 3 made by the student's own placements | `aksiya-talis` M1 (`mural`: the graffiti painters' A-frame ladder 6/9 ; act-2 on an X-trestle 9/12) |
| `segment-divider` (`SegmentDivider.jsx`, glance `[data-sd-glance]`) | `equal`: the ray's angle, the compass opening (a stretch), each carry (one tap per mark), the mark joined to B, the set square slid along a ruler; `ratio`: the side and rank of a mark on each of the two parallel graduated lines (d₁)//(d₂) and the ruler's two ends | the angle locks at the first mark; a parallel off a mark is refused (« حافة الكوس لا تمر بأي علامة »); an opening changed mid-way cuts unequal bands measured exactly (75/23 ≈ 3,26); joining the 2nd mark gives 2 parts; 2 on A's line and 3 on B's gives MA/MB = 2/3; equal ranks on the same side put the ruler parallel to (AB) | one right construction + a failed one or a second with another angle / opening (the cut points depend on neither — swept in the tests); متقدم: the point inside [AB] AND the point outside (`thales.ratioPoint`) | `inshaat-talis` M1 (`tifo`: a stadium banner, 3 parts ; method-ratio-point 3 : 2) and M2 posed alone (`levels={false}`, دوري الآن 2 : 5) |
| `shadow-stick` (`ShadowStick.jsx`, glance `[data-sh-glance]`) | the stick's foot (step 0,2 m), then a telescopic pole carried from the stick to the minaret whose TOP rides the sun ray (its height is never set by hand) | anywhere but the right place the stick's shadow ends before or after O — the two parallel rays drawn and the gap written in metres; the pole stays shut while O is not a common point | a missed tip then the match; the pole stopped on the way and at the foot, where it IS the minaret (h = stick × OP ÷ ℓ = 7,25 m); « the stick anywhere » refuted by the student's own trial | **no lesson since 2026-10-13** (was `wadiya-idmajiya-talis` M1, مبتدئ; replaced by `shadow-world`) |
| `shadow-world` (`ShadowWorld.jsx`, glance `[data-sw-glance]`, 2026-10-13 — **a living world**, MANIPULATION_DNA §16) | the SUN (it pivots on the minaret's tip M; 12:30 → 16:00, Algiers on 13 October), a tape from any object's foot, the stick anywhere, a flag to BET on an object not yet installed, and the student's own rule `الظلّ = الطول [+ \| ×] n` | the tape pulled up the minaret falls back; the stick's shadow vanishes inside the minaret's; a rule is planted as violet flags on every known object, the gap to each real tip drawn, and it comes unstuck when the sun moves | a bet classified by model (additive, copy, equal, inverse; non-discriminating at 12:30); a × rule fitting every object, then REPAIRED at another hour; the conjecture written with the student's two rules; the height answer read by `judgeHeight`; companion مقران runs a BLOCKING tutor chain of 5 tapped questions, judged against the student's own numbers, retry-until-correct (DNA §16.5bis); panel `ShadowTutor.jsx`: progress + thread + ONE question/task card (DNA §16.5ter) | `talis-hisab-atwal` M1, BOTH levels (`SHADOW_WORLD.beginner` minaret 5 m, `.advanced` 6,5 m, 2026-10-13: the first lesson that presents the concept; the `thales-beam` pair left this lesson) and `wadiya-idmajiya-talis` M1, مبتدئ (`minaret`, `{ minaret: '7,25' }`: 11,6 m at 15:00, stick at 10 m ; pair 5 / 7,25) |
| `shadow-meet` (`ShadowMeet.jsx`, glance `[data-sm-glance]`, 2026-11-10 — **the one-lane lab of the mission player**; `shadow-world` stays the page lab) | the foot B of a 1 m stick, dragged on the ground to the centimetre (finger, track, arrows ±1, Page ±10, four nudge buttons); between two steps the hour moves (a button) | the stick is IN THE SHADE of the object (no shadow of its own: its top is under the ray), IN THE SUN (its shadow overshoots) or exactly at the MEET — one ray through both tops; the three lengths OB, BA, OA are written on the ground only at the meet; the sun's rays are drawn parallel and SAID | a height (three chips, or the template « H = [ ] m ») or the length of a shadow to come (« AO = [ ] m », then the flag is planted) — exact, in whole centimetres | `logic/shadowMeet.js` (`stepOf`, `moveStick` with a magnet, `settle`, `answer`, `judge`, `nextStep`, `heightOptions`, `predictTruth`, `coachOf`, `shownValues`, `layout`) |
| `cone-cylinder` (`ConeCylinder.jsx`, glance `[data-cc-glance]`) | the cylinder's h (a stretch on a ruler under the axis) and r (a stretch at its rim corner) in the cone's axial section; n ≤ 24 graduations chosen so every inscribed cylinder has hIdx + rIdx = n and h = r falls on a mark | a cylinder that would pierce the cone turns red while dragging and is refused on release with the permitted radius written; a rim short of the cone leaves a numbered gap | two inscribed cylinders of different lengths + a refusal or gap; « r + h constant », « r × h constant », « r = R » refuted by the student's own cylinders; goal h = r (the half-section a square), V = 91,125π ≈ 286,28 cm³ | `wadiya-idmajiya-talis` M1, متقدم (`cornet`, the situation H = 18, R = 6 ; مبتدئ pair 12/4) |

**A workspace may pair two TYPES (unit 9).** The objective — not the instrument — is what both levels share (§7bis-levels):
`wadiya-idmajiya-talis` opens on `shadow-world` at مبتدئ (the تحدّ, since 2026-10-13; `shadow-stick` before) and `cone-cylinder` at متقدم (the situation), one objective
« ترييض وضعية بمثلثين في وضعية طالس وحل معادلة لإيجاد طول غير مباشر ». Each type keeps its own pair in `levels.js`; the workspace uses
the numbers of one of them. The unit e2e maps the glance selector per LEVEL for that reason.

## 2bis. Drawn worlds — every lesson has its own, and the theme is data

The football pitch (lesson 1, مبتدئ) and the library (lesson 1, متقدم) set the standard
(2026-09-21): a real situation, real objects drawn in parameterised SVG, a direct gesture, and a
notation that follows the gesture. That standard now holds across the unit. Each lesson opens on
**one world**, chosen because it makes the concept's structure visible — never bolted on:

| Lesson | World (`theme`) | Drawn objects | The gesture | What the drawing *is* |
|---|---|---|---|---|
| 1 قاسم عدد طبيعي | `football` / `library` | players on a pitch / books on shelves | drag a player into a team (partition) / **stretch the shelf** — drag its bookend (quotition) | the remainder is a player who fits in no team / the books in a ghost shelf that cannot be completed |
| 2 قواسم عدد طبيعي | `library` | the same books, in a rectangle fitted in a square frame | **pull the row's edge** (stretch, `useStretchInteraction`): the n books re-form live | a perfect rectangle ⇔ `n = d × e`; past the square (√n) every perfect rectangle is an earlier one **turned** (`repeat` is geometric: d > q) |
| 3 خواص القواسم | `construction` | two walls in bricks of length n (`BrickWall`) | carry wall b: join it, remove it, or measure wall a with it; at متقدم, **predict** «طوب كامل / يبقى جزء من طوبة» before each build (`predict`, `outcome`) | sum, difference and remainder are still whole bricks ⇔ n divides them |
| 4 القاسم المشترك الأكبر | `football` (مبتدئ) / `garden` (متقدم) | balls & shirts / red & white flowers in identical groups (`GroupingScene`) | **add a group at a time**: drag an empty wrapper from the reserve (`GroupStock`) — or −/+ — and everything re-deals | the k that leave nothing outside are exactly the common divisors; « greatest » needs the next k seen failing |
| 5 تعيين PGCD | `school` (مبتدئ, bags 8/12) / the lists (متقدم, 42/60, `startWith="lists"`) | pens & notebooks in identical bags, then the divisor lists | add bags one at a time (مبتدئ); carry the common divisors to the middle and the greatest to PGCD (متقدم) | the lists *are* the object of this lesson (its method, حصر) — the advanced level no longer reopens lesson 4's bags (2026-09-30) |
| 6 البحث عن PGCD | `workshop` | two ribbons (`RibbonStrip`) | cut the short ribbon out of the long one (differences) / lay copies of it along (Euclid) | the greatest common length survives every cut and every remainder |
| 7 أوليان فيما بينهما | `school` (مبتدئ) / lists (متقدم) | 17 pens and 18 notebooks in identical bags | add bags one at a time up to 17 — nothing works but 1 (the same `GroupStock` as lesson 4: coprime is the PGCD = 1 case) / confront every divisor of the smaller number with the other | coprime ⇔ every k from 2 to min(a, b) fails ⇔ every divisor of the smaller one was tested and only 1 is common; « not coprime » needs ONE common > 1 (the textbook's refutation of مريم) |
| 8 اختزال كسر | `kitchen` | spoons of sugar and cups of flour, in portions | drag a number of portions (2 … 12, **not only the good ones**) onto the recipe; declare «لا يمكن الاختزال أكثر» yourself; then find the one-step number (no gold PGCD) | dividing both terms by k = k identical portions; the reduced fraction is one portion; a non-greatest common divisor in one step is refused by showing what it gives |

Rules that make this reusable rather than eight one-offs:

- **A theme is data.** A lesson passes `theme="garden"` to `<Manipulation>` and declares it in
  `resources[].experience.theme`; the closed list is `VISUAL_THEMES` in
  `packages/core/curriculum/manipulationLevels.js`, and `validate:lessons` rejects an unknown id.
  Which objects a theme draws lives in `primitives/itemThemes.js`; its Arabic words live in
  `lesson.manipulation.json` under `themes.<id>.*` (keys `lesson:manipulation.themes.<id>.*`) and are read through `themeWords()`, which a
  lesson's `context` (the textbook's own words) may override. **No scene contains Arabic.**
- **One scene, three types.** `GroupingScene` serves `common-divisors`, the groups stage of
  `coprime-explorer` (`startWith="groups"`) and `fraction-reduction`, because « k identical
  groups of two kinds of object » is one piece of mathematics (`equalGrouping.groupInto` in core,
  laid out by `groupingLayout.js`, unit-tested). Do not write a second grouping scene; pass a theme.
- **Objects are sized for the back of the classroom.** A drawn object's size is never a fixed
  pixel count. `groupingLayout.itemWidthFor()` gives the *floor* (what fits a 320 px phone), and
  `itemSizeCss()` grows it with the **scene's own width**: `GroupingScene` is a CSS size container
  (`container-type: inline-size`) and sets `--sa-item` / `--sa-item-left`, a single
  `clamp(floor, 0.75·floor + floor/10·cqi, 2·floor)` with no breakpoints: ×1 on a phone, ≈×1.3 on a
  tablet, ≈×1.7 on a laptop, ×2 on a projector and in وضع القسم. The initial piles (`k` null,
  floor 10 px for 144 flowers) use `PILE_SCALE` (steeper, up to ×3). Card widths (`perRow` objects)
  and the gaps between objects (`--sa-item / 8`) are computed from the same variable, so a
  larger object never overflows or clips its card, and the count drawn never changes.
  `ItemFigure` accepts `width` as a number (px) or a CSS length (`var(--sa-item)`). A new scene of
  countable objects reuses this rule rather than choosing its own pixel sizes. The rule is tested
  in `groupingLayout.test.js`.
- **Lengths are objects too.** `BrickWall` and `RibbonStrip` replace the abstract `QuantityBar`
  wherever the lesson talks about a length that must be *measured by* another: bricks make
  « whole multiple of n » visible, ribbons make « cut » and « lay along » physical. Geometry is
  pure and swept in `brickLayout.test.js`.
- **The vignette matches the instrument.** The activity card's `visual` (`ContextScenes.jsx`)
  shows the same objects as the lab below it, so card and laboratory tell one scene. Drawn, never
  generated (root `CLAUDE.md`).
- **Every count drawn is a count the student can read.** Nothing is truncated silently: beyond
  `maxGroups` the scene says « +n أخرى », and the leftover tray draws each object that fits
  nowhere, greyed. The e2e block « 9bis » counts them.
- **Same shell, same feedback.** The worlds change; the `ManipulationShell`, the drag engine, the
  refusal-with-a-reason, the hints, the discovery phase and the tabs do not.

DOM contract added for the e2e:

```
[data-grouping-scene][data-groups=k][data-works]  [data-group-card] × shown  [data-group-leftover][data-leftover-a][data-leftover-b]  [data-pile=a|b]
[data-brick-site] [data-site-zone=join|remove|measure][data-built]  [data-brick-wall] [data-wall-segment] [data-wall-partial]
[data-ribbons] [data-ribbon] [data-ribbon-segment] [data-ribbon-cut] [data-ribbon-ghost]
[data-coprime-groups] [data-coprime-insight]  [data-recipe] [data-recipe-portion]
```

## 3. Mathematics

All arithmetic comes from `packages/core/arithmetic/divisibility.js`. A component never computes a
GCD, a divisor list, or an algorithm trace itself. `logic/*.js` holds the *interaction* rules
(what may be dropped where, when the discovery is ready); it is pure and unit-tested in
`logic/logic.test.js` on the textbook's own numbers.

## 2ter. Partition and quotition — name the roles

The same `a = b × q + r` is met with two readings in lesson 1: the teams fix the
**number** of groups (b = teams, q = players per team), and the shelves fix the **size**
of a group (b = books per shelf, q = shelves). A lab never switches reading silently.
Under its equation, each division lab renders `primitives/DivisionRoles.jsx`, whose three
chips say in the scene's words that **b is what you chose, q is what results, r < b**.
The module places the two readings side by side before its question
(`[data-division-bridge]`). See `MANIPULATION_DNA.md` §8.

## 4. Gestures — carry and stretch

Two gesture engines, and a type never re-implements either. A concept that needs a
genuinely different gesture (rotate, cut, balance) gets a new engine documented here; it is
not forced into one of these two (`MANIPULATION_DNA.md` §6, §12).

### 4.1 Carry — `useDragInteraction`

- Pointer Events, `setPointerCapture`, `touch-action: none` — no page scroll while dragging.
- Below 6 px of movement the gesture is a **tap**: it picks up / puts down. Above, the object follows.
- **Magnet:** the nearest zone within 56 px **that would accept** the object is magnetised
  (`data-drop-active`) and receives the drop. A zone that would refuse, or a disabled zone
  (`data-drop-disabled`), is never magnetised. When the pointer is directly over a refusing
  zone, the zone is marked `data-drop-invalid` (`DropZone` tints it rose) before release, and
  the release gets the explained refusal. A **silent** refusal (`''`, a no-op such as putting
  a player back on its own team) is not marked. Until 2026-09-29 the magnet lit refusing and
  disabled zones.
- Zones belong to ONE instance: each `useDragInteraction` tags its zones with its own id
  (`data-drop-owner`, `useId`) and only looks for its own (2026-09-29). Two manipulations on one
  step share zone names (`table`, `pgcd`…) and used to receive each other's drops.
- A refused drop returns the object with a short shake and an **Arabic reason** (`accepts` returns
  the reason string). Never a silent red state.
- **A drag always returns the object.** A drag that ends accepted, refused or outside any zone
  leaves nothing "in hand". Only the **tap** path keeps the object held after a refused zone,
  because the student just chose it and simply taps another zone.
- **Edge auto-scroll:** while an object is carried, a pointer within 64 px of the top or bottom
  of the viewport scrolls the page (instant scroll, up to 16 px per frame), and the target zone
  is re-read after each step. Because of `touch-action: none` the finger cannot scroll the page
  itself; without this, on a phone the bench and team 1 (more than a screen apart) could never
  be joined by one drag (audit M1-F8; e2e block DS).
- **Every drag has a non-drag alternative**: tap the object, then tap the zone. Keyboard: Enter/Space
  to pick up, Enter/Space on the zone to drop, Escape to release. This path is never removed.
- **It is the only carry engine in the lesson tree.** `InfoSorter` (lesson 9's data sort) moved onto
  it on 2026-09-30, and the legacy `manip6e/useDragDrop` was deleted. Never animate a draggable
  source with framer-motion `layout` (it remounts the node mid-gesture; the capture is lost).

### 4.1bis The group reserve — `primitives/GroupStock.jsx`

The « distribute » gesture of `common-divisors` and `coprime-explorer`: the student drags an empty
wrapper (`group:add`) from the reserve (`stock` zone) to the type's table, or brings one back
(`group:remove` → `stock`); −/+ do the same. The type owns the logic (`addGroup` / `removeGroup` in
`logic/commonDivisors.js`) and the zones' ids; the primitive draws the reserve, the buttons and the
**trace** of tried numbers (read-only, `[data-tried-k][data-tried-mark]`). The theme words come
from `lesson.manipulation.json` `themes.<id>.{stock, add, remove}`. It replaced the 1…24 numeral
rail, on which the student could jump straight to the answer.

### 4.2 Stretch — `useStretchInteraction`

For a **magnitude** the student sets by pulling: a shelf length, and later a ribbon or a
compass opening.

- **Direct:** `toValue(clientX, clientY, trackRect)` reads the value under the pointer, so
  the handle stays under the finger. The track (`trackProps`, `touch-action: none`) is the
  whole width: touching it sets the value there.
- **Live, then committed:** `onChange` fires for each integer the finger crosses, and the
  consequence is drawn *during* the gesture. `onCommit` fires on release only: passing over a
  value is not a trial.
- **Slider semantics:** the handle is `role="slider"` with `aria-valuemin/max/now/text`.
  Arrows move ±1 (in RTL, ← grows, because the magnitude pushes leftwards), Page ±5, and
  Home/End jump to the ends. The **−/+ buttons** use `nudge(±1)`.
- **Pause before commit:** key and button changes are shown at once but committed after
  700 ms of stillness (`settleMs`) or on blur. Otherwise sweeping 10 → 26 with the arrows
  would have counted sixteen trials and opened the discovery unseen.
- DOM: `[data-stretch-track]`, `[data-stretch-handle]`, `[data-stretch-dragging]`.

## 5. Pedagogical flow

```
MISSION → OBSERVE → ACT → FEEDBACK → PATTERN → CONJECTURE → REPRESENTATION → FORMAL RULE → RETRY
```

`state.phase` is `act` → `discover` → `formal`. The type calls `state.discover()` only when the
relation is genuinely visible on screen (both verdicts seen, all three quantities built, the chain
finished…). `ManipulationDiscovery` asks for the conjecture first; the formal rule renders only
after the student has chosen it. **The final result may never appear before the discovery phase.**

## 6. Teacher mode

Two distinct things carry the name « وضع القسم »:

* the **class mode of a manipulation** (`ManipulationTeacherMode`, `state.mode = 'class'`):
  step-by-step reveal, replay, hidden conclusion, solution, number changes — described below;
* the **Classroom Mode of the platform** (`lessons/common/classroom/`, CLASSROOM_MODE.md): the
  projector presentation of any content — lesson, module, exercise or manipulation — with the
  browser fullscreen, a toolbar and a scale. Its entry button (« ⛶ عرض المناولة ») exists only
  for the roles listed in `CLASSROOM_PRESENTER_ROLES` (`canPresentClassroom`, core/auth.js) and
  does not touch the manipulation's mode or state. A manipulation inside a presented module or
  lesson shows no button of its own: there is only ever one session.

**The toggle is never shown to a student.** `allowModeSwitch` defaults to `false` in
`ManipulationShell` and in all nine shell types, so a lesson module renders وضع التلميذ only
(owner's rule, reaffirmed 2026-09-19). The mode itself stays implemented for a future
teacher surface, which will pass the flag explicitly; `manipulations.mjs` asserts that no
mounted manipulation exposes a mode button.

When it is enabled, class mode keeps every student gesture and adds: next step (the type's canonical gesture via
`controller.autoStep`), previous step when mathematically safe, replay/pause, hide the conclusion
(so the class formulates it), show the solution, and change the numbers **within the registry's
constraints plus the type's cross-constraint** (`validate`). A teacher can never enter values that
break the pedagogical sequence.

## 6ter. The result line — on TOP, one slot, updated in place (2026-10-09, every type)

The `representation` a type hands to `ManipulationShell` (« 258 = 25 × 10 + 8 » and its sentence) is **not** drawn under
the stage any more:

1. **On top.** It sits between the controls/hints and the stage, so the answer to a gesture is read where the eye
   already is — never below the fold. The type passes `representation` exactly as before; the shell places it.
2. **One slot, never mounted/unmounted per gesture.** Before any trial the slot shows a dashed placeholder of the
   same height (`manipulation.resultIdle`, `[data-representation-slot=idle]`); after, the line is **updated in place**.
   When a type withdraws its line for the length of a gesture (`settled && …`, `notice?.trial`), the shell keeps the
   last one (`[data-representation-stale=true]`) until the next; it is cleared on « إعادة », a level change or new
   numbers (`epoch · resetCount · level`), and **never held while the conclusion is hidden** (`answerHidden`, class mode).
3. **Prefer LIVE.** A type whose line can be computed from the live value should return it during the gesture
   (`factor-pairs` does: the line follows the dragged d, the pair board highlights it) — holding the last line is the
   safety net, not the design.
4. A type that passes no `representation` at all (`undefined`) gets no slot.

DOM contract (e2e): `[data-manipulation-representation]` (the line, now before `[data-manipulation-stage]`),
`[data-representation-slot=idle]`, `[data-representation-stale]`.

## 6bis. Auto-completion — manual first, then « let the lab finish it »

> The learner performs the **first example by hand** — that is where « equal parts » or « cut the
> short ribbon out of the long one » is understood. When the same gesture would then only repeat,
> they may ask the lab to finish it. **Manual stays; automatic is an extra, explicit option.**

### When a type gets it — and when it stays manual

A type may offer auto-completion only if **all five** hold:

1. the target state is **mathematically deterministic** from the configuration;
2. the learner has a **valid configuration** (the type's own `validate`, never « some input exists »);
3. the **manual gesture stays available**, before, during and after;
4. repeating the gesture is **mechanical** — the same move again — not the learning itself;
5. auto-completion reaches **the same underlying state** the hand would reach, through the same
   transitions (`canPlace` / `place`, `subtract`, `addCopy` / `carryRemainder`).

It stays **manual-only** when each gesture is an experiment, a choice or an answer: choosing a
divisor, a number of columns, a number of bouquets, which chips are common, a proof order. There,
« complete it » means « show the answer », which is what class mode's `showSolution` is for — and it
is never offered to a student.

Audit of the ten types (2026-09-24):

| Type | Decision | Why |
|---|---|---|
| `team-builder` | **AUTO** — `unlock: 'first-gesture'` — « أنشئ الفرق » | n players carried one by one into k teams; after the first sharing, carrying 20 more is repetition. The refusal rule stays the one the hand meets. `manualDone` = **one sharing carried to the end by hand** (the scene settled without the button). Until 2026-09-30 it was `'config'`, which opened the button before any gesture, so the discovery could be reached with zero players moved (audit M1-F6). The locked line is the type's own (`manipulation.teamBuilder.autoCompleteLocked`, via `auto.lockedLabel`). |
| `pgcd-differences` | **AUTO** — `unlock: 'first-gesture'` — « أكمل الفروق » | up to 30 identical « carry the small ribbon onto the big » gestures. One cut by hand first; the PGCD box stays manual (recognising the last non-zero difference *is* the discovery). |
| `euclidean-algorithm` | **AUTO** — `unlock: 'first-gesture'` — « أكمل القسمات » | q copies per division, repeated per line. The first division (copies + carry) by hand; the PGCD box stays manual. |
| `divisor-explorer`, `divisor-explorer-books` | MANUAL | one validated position/drop per trial; each trial *is* an experiment, and the arrangement is already drawn by the lab. |
| `factor-pairs` | **AUTO** — `unlock: 'config'` — « جرّب كل الإمكانيات » (owner decision, 2026-10-09; it was MANUAL) | the student can let the lab walk d = 1, 2, 3 … **one trial per step, 480 ms apart** (`auto.intervalMs`, `auto.maxTicks`), so every rectangle, every pair of the board and the result line are SEEN arriving. It reaches the same state as the hand (`L.test` on each d); the discovery question still has to be answered by the student. `finish()` tests what is left (reduced motion: final state at once). |
| `common-divisors`, `coprime-explorer` | MANUAL | choosing the number of groups and carrying the *common* divisors is the judgement being learned. |
| `divisor-properties` | MANUAL | three distinct operations (join / remove / measure), then a proof — nothing repeats. |
| `fraction-reduction` | MANUAL | each drop is a choice of divisor, and « which path is shorter » is counted in the student's own steps. |

Outside the registry, `InfoSorter` and the diagnostic `ClassificationQuestion` are judgements (each
card is an answer): manual-only.

### « جرّب كل الإمكانيات » and default parameters — owner decision, 2026-10-09 (supersedes the « manual » rows above)

**1. « جرّب كل الإمكانيات » (try all the possibilities).** Every type whose gesture is a **sweep of one discrete
value** (a ruler, a stepper, a list of candidates) gets a student button that walks the values one by one,
**480 ms apart** (`auto.intervalMs`, `auto.maxTicks: 80`), validating each exactly like the hand (same pure logic,
same recorded trial, same `onTrial` / `onVerdict`) while the result line (§6ter) updates in place. `unlock: 'config'`;
the label is the shared string `manipulation.autoComplete.tryAll`. The discovery question, claims, bets, pins and
every construction/answer gesture stay the student's. A type with several modes/stages gets it only in the sweepable
one (`autoComplete` is `undefined` elsewhere, so no dead button). Granted (30): `factor-pairs`, `divisor-explorer-books`,
`divisor-explorer`, `common-divisors` (groups), `coprime-explorer`, `square-root-side`, `square-fold`, `square-tiling`,
`pitch-expansion` (after the sum is reduced), `turf-factoring` (rows), `vanishing-pitch`, `solution-ray`, `growth-race`
(race), `linear-machine`, `origin-line` (pivot, fit), `percent-tag` (single), `affine-meter` (image, antecedent),
`affine-line` (shift, read), `slope-stairs`, `line-crossing` (cases), `plan-compare`, `stat-balance` (mean, median,
contrast), `shadow-stick`, `group-tanks`, `ramp-ratios` (مبتدئ), `clinometer` (ladder, align), `parallelogram-pin`
(midpoint), `vector-sum` (swimmer), `bridge-path` (explore, straight), `polygon-forge` (forge).
**Not possible (each trial is an answer, a choice, a carry or a construction):** `divisor-properties`,
`fraction-reduction`, `equation-balance`, `elimination-cards`, `pair-scoreboard`, `story-modeller`, `rotation-dial`,
`shape-turn`, `lamp-ring`, `inscribed-angle`, `bucket-fill`, `orange-peel`, `scale-blocks`, `section-slicer`,
`sphere-probe`, `thales-beam`, `parallel-level`, `cone-cylinder`, `segment-divider`, `angle-compass`,
`trig-calculator`, `vector-chain`, `translation-glide`, `route-compare`, `shape-prover`, `component-calc`,
`component-steps`, `midpoint-distance`, `ratio-ride`, `cumul-gate`, `sheet-lab`, `story-bars` (1AM, 2026-10-14: each stretched height and each card IS the answer), `division-jumps` (1AM: each q is the answer), `digit-cards` (1AM: each coloured cell and each claim is the answer; its « أكمل » is a local pale reveal, not a trial). The original three
(`team-builder`, `pgcd-differences`, `euclidean-algorithm`) keep their own `first-gesture` button. Tests: each granted
type's logic test checks that a sweep reaches the same trials as the hand.

**2. Default parameters — never empty, never an answer.** A lab opens on a meaningful state: a ruler's handle, a
probe, a dial, a threshold starts at a value instead of `null` / « ? » / « not set » (carry/construction types keep
the initial configuration they already draw). **The default must never be an answer to the task** — a lab asking for
the divisors of 48 does not open on 3 (it opens on the first non-divisor, 5); one asking for a solution does not open on
it. Each type computes its default with a small PURE helper next to its logic (`defaultWidth`, `defaultShelf`,
`defaultX`, `defaultK`, `defaultProbeIndex`, `defaultPair`…) and a test across the authored numbers. **A default is not
a trial**: it is never written to the trial memory / pairs board / traces / tried lists, never calls `onTrial` /
`onVerdict` / `onFinished`, never counts towards a discovery. It comes back after « إعادة », a level change and new
numbers. Consequence to know: a button that validates « what is on screen » (the pin of `square-fold`,
`vanishing-pitch`) answers « move x first » until the student has made a real gesture.

### How it is declared — the registry decides, the type supplies the mechanics

```js
// packages/core/curriculum/manipulationTypes.js — the pedagogical DECISION (data)
'team-builder': { controls: { …, autoComplete: { unlock: 'config' } } },
'pgcd-differences': { controls: { …, autoComplete: { unlock: 'first-gesture' } } },
// absent or false ⇒ the button is never rendered. AUTO_COMPLETE_UNLOCKS is the closed list.
```

```js
// the type's component — the MECHANICS, on its own pure logic
<ManipulationShell controller={{
  …,
  autoComplete: {
    label: t('manipulation.<ns>.autoComplete'),   // optional; generic « أكمل تلقائيًا » otherwise
    ready: !stale && !validateNumbers(numbers),   // SAME validate the free lab / class mode use
    manualDone: lab.done > 0,                     // read only when unlock is 'first-gesture'
    remaining: L.remainingMoves(lab),             // canonical gestures left; 0 ⇒ « done »
    step: () => setLab(L.autoStep),               // ONE gesture, functional, no-op at the end
    finish: () => setLab(L.fill),                 // the final state = step repeated
  },
}} />
```

Rules, each enforced by `autoComplete.test.js` or the e2e:

- **One definition of « correct ».** `step` goes through the same guard as the hand (`autoStep =
  place(nextMove)`, `fill = autoStep` repeated). `validate` is extracted into one
  `validateNumbers` read by the shell *and* by `ready`. Never a second algorithm.
- **The real state, never a picture.** `step`/`finish` update the type's `lab`; the verdict, the
  bench, the equation and `onVerdict` follow exactly as after a last manual gesture.
- **Only the gesture.** Auto-completion never calls `discover()` or `formalize()`. Discovery opens
  on the same conditions as by hand (team-builder: both an exact and an inexact sharing seen). A
  final identification (the PGCD box) stays manual.
- **Mixed is the normal case.** It completes from the *current* state: objects the learner placed
  stay where they are, nothing is duplicated. Afterwards the learner can still move objects if the
  type allows it, and the button re-enables if something becomes incomplete.
- **Configuration changes cancel.** `resetKey` is `state.epoch`; a change of numbers or « إعادة »
  stops the animation and no step of the old configuration lands on the new one.
- **Never automatic without the learner's click.**

### What the learner sees

`ManipulationControls` renders `ManipulationAutoComplete` in the student row (controls above the
stage, §8): an outlined `Btn` with the `Wand2` icon, the **same weight as إعادة / تلميح** — never the
filled colour of تحقّق — so the manipulation stays the visual focus. Status (`autoComplete.js`):
`hidden · locked · invalid · ready · running · done`. Locked, it says in one line « أنجز الخطوة
الأولى بيدك، ثم يمكنك الإكمال تلقائيًا. ». Strings: `manipulation.autoComplete.{button,hint,locked}`
and `manipulation.<ns>.autoComplete` for a type's own verb (« أنشئ الفرق »).

**Motion.** `autoCompletePlan`: one gesture per tick when there are few (the players are *seen*
arriving), grouped beyond 18 ticks so the whole run stays ≈ 0.9 s; under `prefers-reduced-motion`,
or without a `step`, the final state directly. Nothing depends on the animation.

DOM contract: `[data-manipulation-autocomplete=<status>]` wraps the button.

### Adding it to a type

1. Check the five conditions above; if any fails, the type stays manual — record why in its header.
2. Declare `autoComplete: { unlock }` in the registry (`'first-gesture'` when the *first* example
   must be done by hand inside the same instance; `'config'` when choosing the configuration and
   one pass by hand is the example, as with the teams).
3. In `logic/<type>.js`, add the one-gesture step, the completion and the remaining count **built
   on the existing transitions**, and test that step×remaining = completion, and a mixed start.
4. Pass `controller.autoComplete` as above, with `ready` reading the extracted `validateNumbers`.
5. Add `<ns>.autoComplete` to `lesson.manipulation.json` (key `lesson:manipulation.<ns>.autoComplete`), and extend the e2e block 12.

## 2novenquinquagies. The quotient under the hand — `mooring-lines` (2AM unit 2, lesson `kasr-hasil-qisma`, 2026-10-28)

`operations/MooringLines.jsx` (+ `operations/mooringLines/art.jsx`: the harbour SVG — `HarborBackdrop`, `Boat`, `Rope`, `Clip`, `Kids` (Yacine, and at مبتدئ his sister Lina in hijab)) on `logic/mooringLines.js` (pure; exact through `packages/core/arithmetic/fractions2.js`, imported BY PATH — E1 row: `clearDecimals`, `decimalQuotientBracket`, `fitsAtRank`, `isDecimalQuotient` — on `decimals.js`). Theme `harbor` (kind `lengths`). Registered in `manipulationTypes.js`, `manipulationRegistry.js`, `levels.js` (`LEVELS['mooring-lines']`), strings in `lesson.manipulation.json › mooringLines`. Tests: `logic/mooringLines.test.js` (sweep of a ∈ 0,1…99,9 and b ∈ 2…12 and decimals), `operations/mooringLines.render.test.jsx`, the level test branch in `levels.test.js`.

**The five questions.** (A) the hand holds the QUOTIENT candidate q at a rank (1 / 0,1 / 0,01) — a brass clip on a wooden bar (pointer drag, ← →, PageUp/PageDown, Home, −/+) ; at متقدم it also holds the TAPE UNIT (m / dm / cm). (B) b pieces of length q (`share`, مبتدئ: a m cut into b equal ropes) or q pieces of b m (`count`, متقدم: b decimal) are laid end to end on a rope of a m over a graduated tape; the leftover (green) or the overflow (red, over the water) is written as a LENGTH. The verdict is always the exact comparison b × q with a (`fitsAtRank`: `fits` | `exact` | `over`). (C) Resistance: the dial (`[data-ml-dial]`) opens the next rank ONLY after the bracket of the current rank is FOUND (largest q that fits, smallest that overflows, adjacent) and the bar ZOOMS into that segment (a window of 10 units); an exact landing closes the dial; at متقدم the clip is LOCKED until the unit makes the divisor natural (predict first), and changing the unit never changes q. (D) The formal phase writes the student's own bracket (8 = 3 × 2,66 + 0,02; 2,66 < 8/3 < 2,67; 4,6/0,7 = 46/7). (E) Wrong beliefs are refuted by the student's own trials (the remainder written after the comma — `model: 'remainderComma'`; the excess taken for the quotient; ×10 on one term).

**Props.** `tasks` (`{ id, kind: 'share'|'count', a, b, maxRank }`, decimal strings), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A task with its own id and `levels={false}` is posed alone (module 2 « معارف »: `{ id: 'k1', kind: 'share', a: '10', b: '7' }`, chain `k1`).

**Events** (`onTrial`): `{ kind: 'lay', task, rank, q, verdict, gap, product, free, model? }`, `{ kind: 'bracket', task, rank, lo, hi, ok, exact, free }`, `{ kind: 'unit', task, unit, divisorNatural, free }`, `{ kind: 'solved', task, exact, free }`, then the checkpoint events `{ tk: 'checkpoint' | 'checkpoint-done', id: <task id>, q: <question id> }`. **Lab prototype (§8quinquies):** `CHAINS` (r1 `leftA, leftB, never` · r2 `prod, whyEnd` · r3 `kind, whenStop, rule` · a1 `lineLen, sameCount` · a2 `prod, exactWhy` · a3 `bracketTex, whenStop, ruleUnit` · k1 `write, names, rule`), `LabStepper` (`data-ml-step`), `useStepCelebration`, `playSfx` (`tooth` per notch, `flag` bracket found, `bell` exact landing, `over` overflow), « إعادة » through `resetKey`, `guided` while the chains run.

**DOM.** `[data-mooring-lines][data-level][data-task][data-rank][data-q][data-solved][data-layout]`, `[data-ml-glance]`, `[data-ml-scene]`, `[data-ml-clip][role=slider][data-q][data-locked]`, `[data-ml-dial]` + `[data-ml-rank=0|1|2][aria-pressed]`, `[data-ml-unit]` + `[data-ml-unit-opt=m|dm|cm]`, `[data-ml-piece=<i>]`, `[data-ml-gap][data-verdict]`, `[data-ml-flag=lo|hi]`, `[data-ml-lay]`, `[data-ml-less]`, `[data-ml-more]`, `[data-ml-restart]`, `[data-ml-next]`, `[data-ml-verdict]`, `[data-ml-free]` (+ `-a`, `-b`, `-back`), `[data-ml-formal]`. Screen budget: `[data-ml-glance]` ≤ 768 px high at 1024×768 with the sidebar (scene 246 px; the dial and unit chips are the compact 44 px-high variant). **Distinct from** `egg-trays` (the hand holds the DIVIDEND), `scoop-scale` (a MASS read through a ROUNDING screen; nothing is rounded here), `zero-probe` (a cable unrolled), `ruler-compare`, `division-jumps`.

## 2novenquinquagies bis. The distance under the hand — `trail-odometer` (2AM unit 2, lesson `jam-tarh-kusur`, 2026-10-29)

`operations/TrailOdometer.jsx` (+ `operations/trailOdometer/art.jsx`: the cedar-forest SVG — `TrailBackdrop`, `Cedar`, `Gate`, `Spring`, `Post` (white peg / tall red post), `Hiker` (a girl in hijab and long tunic at مبتدئ, a boy in a hoodie at متقدم, both `KidFigure`)) on `logic/trailOdometer.js` (pure; `makePath(W, H, loop)` parameterises the winding path by ARC LENGTH so equal fractions are equal lengths — tested within 0,5 px; exact integers/fractions, the 2AM guard `isMultipleCase` comes from `packages/core/arithmetic/fractions2.js` — E2 row: `isMultipleCase`, `rewriteTo`, `sumMultipleCase`, `complement` — imported BY PATH). Theme `mountaintrail` (kind `lengths`).

**The five questions.** (A) the hand holds the DISTANCE walked, in WHITE posts (an integer 0 … n·laps): drag the hiker on the path (it snaps to the nearest white post, at the lap nearest the current position), −/+ one white post, « عمود أحمر » −/+ k white posts at once (only where red posts exist), ← → ±1, PageUp/PageDown ±k; « وصلنا » (Enter) judges the leg. (B) two wrist counters — white posts, and red posts + the leftover whites — and the plan board of the day's legs written as fractions (`[data-to-leg][data-state]`), footprints coloured per leg (a back leg orange and dashed). (C) the hiker must stand EXACTLY on the target post; at متقدم the path is LOCKED until the student has WRITTEN the arrival fraction and the remainder (the white counter is hidden until then). (D) the formal phase writes what the student did (`5/12 + 1/4 = 5/12 + 3/12 = 8/12 = 2/3`; `3/4 − 5/12 = 9/12 − 5/12 = 4/12 = 1/3`; `1/6 + 7/12 = 2/12 + 7/12 = 9/12 = 3/4`, `1 − 3/4 = 1/4`). (E) wrong writings are REFUTED BY THE PATH: any EQUAL writing is accepted (8/12 or 2/3, Arabic or Latin digits), while `across` ((a + c)/(b + d) = 6/16), `noScale` (the red leg counted as one white post = 6/12), `natural` ((n + a)/b = 6/6 on the loop) and `part` (the part given for the remainder) are refused with their MODEL and a DASHED FLAG is planted on the path at that fraction's position (`« هنا يقع 6/16 »`) — before the hiker's end of the morning leg.

**Pattern for later labs (« refuse by drawing »).** `judgeWriting(task, text, field) → { ok, model, flagAt }` is the shape to reuse whenever a typed answer has classic wrong forms: the lab never says « wrong », it draws where the wrong writing would be.

**Props.** `tasks` (`{ id, n, k, start?, legs: ['5/12', '1/4', '-5/12'], loop?, predict? }`: `n` white posts per lap, a red post every `k` whites, signed legs written as fractions whose denominator divides `n`; `loop` = closed circuit of 2 laps; `predict` = write first), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A task with its own id and `levels={false}` is posed alone (module 2 « معارف »: `{ id: 'k1', n: 8, k: 2, legs: ['3/8', '1/4'] }`, chain `k1`).

**Levels (`levels.js`).** مبتدئ: `g1` 5/12 then 4/12 (same denominator, only white posts), `g2` 5/12 then 1/4 (red posts), `g3` start 3/4, back 5/12. متقدم (prediction written first): `a1` 5/16 + 3/8, `a2` 13/20 − 2/5, `a3` 1/6 + 7/12, `a4` a closed circuit, one full lap then 5/6 of a second (1 + 5/6 = 11/6, the counter reads 11). The levels test measures the pair by the PREDICTION (متقدم only) and the LOOP.

**Events** (`onTrial`): `{ kind: 'leg', task, leg, posts, want, ok, free }`, `{ kind: 'predict' | 'writing', task, field, value, ok, model, free }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true, a, b, c, d, op }`, then the checkpoint events `{ tk: 'checkpoint' | 'checkpoint-done', id: <task id>, q: <question id> }`. **Lab prototype (§8quinquies):** `CHAINS` (g1 `tot · frac · rest`, g2 `redPosts · asWhite · whyNo`, g3 `rule`, a1 `whyOne`, a2 `whiteBack · diff`, a3 `rest12`, a4 `loopCount · natural · ruleMulti`, k1 `ksum · ruleMulti`) over the lab through `useLabCheckpoint`, `LabStepper` + `useStepCelebration`, sounds off by default (`tooth` per post, `flag` on a leg, `bell` on the solved task, `over` on a missed leg) with the shell's « الصوت » switch, « إعادة », the teacher switch in the header, LabCoach (`walk · arrive · red · write · predict · next`, key `sa.labCoach.trail-odometer.off`).

**« جرّب أعدادك »** is ALWAYS open: two fractions `a/b ± c/d` (b, d from 2 to 24); the form REFUSES a pair where neither denominator divides the other with « هذان المقامان سنراهما في السنة الثالثة » (a free-panel message, never a verdict on the student), a negative or over-1 result, and offers a free « توقّعي » writing drawn as a dashed flag. Free trials never count.

**Screen budget.** `[data-to-glance]` fits the viewport at 768×1024, 1024×768, 1280×800 and 1366×768 at both levels (measured 2026-10-29: at
most 762 px at 1024×768 مبتدئ). In the متقدم predict phase the two writings sit in ONE compact row, the walking buttons (`[data-to-less]`,
`[data-to-more]`, `[data-to-arrive]`) are hidden and the verdict banner appears only after the first writing — the hiker stays locked
until the arrival and the remainder are written.

**DOM.** `[data-trail-odometer][data-level][data-task][data-posts][data-solved][data-layout]`, `[data-to-glance]`, `[data-to-scene]`, `[data-to-hiker][role=slider][aria-valuenow][data-locked]`, `[data-to-post=<i>][data-red]`, `[data-to-counter=white|red]`, `[data-to-leg=<i>][data-state][data-kind]`, `[data-to-less]`, `[data-to-more]`, `[data-to-red-minus]`, `[data-to-red-plus]`, `[data-to-arrive]`, `[data-to-write][data-field][data-phase]`, `[data-to-input=pos|rest]`, `[data-to-check=pos|rest]`, `[data-to-flag][data-model]`, `[data-to-verdict=bad|good]`, `[data-to-next]`, `[data-to-step=<i>]`, `[data-to-free][data-active]`, `[data-to-free-a|b|c|d]`, `[data-to-free-op]`, `[data-to-free-guess]`, `[data-to-free-back]`, `[data-to-free-msg]`, `[data-to-formal]`. Strings: `lesson.manipulation.json › trailOdometer`. Tests: `logic/trailOdometer.test.js`, `operations/trailOdometer.render.test.jsx`, `levels.test.js`; e2e `apps/web/e2e/lesson-kit/2am-kusur-amaliyat-jam-tarh-kusur.mjs`.

## 2novenquinquagies ter. The two factors under the hand — `window-blinds` (2AM unit 2, lesson `jida-kasrayn`, 2026-10-29)

`operations/WindowBlinds.jsx` (+ `operations/windowBlinds/art.jsx`: the classroom-window SVG — `Outside` (sky, sun, yard, palm per window), `Rail`, `Grip`, `Student` (a girl in hijab and long tunic at مبتدئ, a boy in a hoodie at متقدم, both `KidFigure`)) on `logic/windowBlinds.js` (pure; exact integers; the grid comes from `packages/core/arithmetic/fractions2.js` — E3 row: `productGrid`, `timesNumber`, `fractionOf`, `ofRemainder` — imported BY PATH). Theme `classwindow` (kind `areas`).

**The five questions.** (A) the hand holds TWO factors with two PERPENDICULAR pulls: the side curtain's edge (horizontal, from the right as in an Arabic room; it snaps to the rail's stops, b per window) = the width a/b, and the roller blind's bar (vertical, snaps to the cord's notches, d per window) = the height c/d; −/+ for each, ← → (curtain) and ↑ ↓ (blind), « ماذا أُظلم؟ » (Enter) checks both pulls. (B) two translucent layers: where they overlap the glass is visibly darker (the double shade); the faint GUIDE lines (b·W columns × d·H rows) appear ONLY after both pulls are checked (`[data-wb-lines]`, never before). (C) the pulls must be exact; at متقدم both are LOCKED until the product is WRITTEN. (D) the formal phase writes what the student did (`2/3 × 3/4 = (2 × 3)/(3 × 4) = 6/12 = 1/2`, « 3/4 من 2/3 النافذة »). (E) wrong writings are REFUTED BY AREA: any EQUAL writing is accepted (6/12, 1/2, Arabic digits), while `sum` (a/b + c/d = 17/12), `sameDen` (ac/(b + d) = 6/7), `cross` (ad/(bc) = 8/9), `oneFactor` (a/b alone) and `count` (ac without the denominator) are REFUSED and a DASHED FRAME whose area is the written fraction of a window is laid at the real dark corner (`[data-wb-frame][data-model]`; clamped to the scene when huge).

**Pattern (« refuse by area »).** `judgeProduct(task, text) → { ok, model, value, bigger }` — the same shape as `trail-odometer › judgeWriting`, but the refusal is an AREA (a frame of `√value` × the window's own aspect), so « bigger than the dark corner » is seen, not told. One window = 1 is said in the opening of every متقدم task (wall of 2 × 1 or 2 × 2 windows).

**Props.** `tasks` (`{ id, curtain: 'a/b', blind: 'c/d', W, H, predict? }`, b ≤ 8 stops per window (b = 1 allowed for a whole-window factor, a4), d from 2 to 8, a ≤ b·W, c ≤ d·H, W and H ≤ 2), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A task with its own id and `levels={false}` is posed alone (module 2 « معارف »: `{ id: 'k1', curtain: '3/4', blind: '2/5' }`, chain `k1`).

**Levels (`levels.js`).** مبتدئ: `w1` 2/3 × 3/4 (→ 6/12 = 1/2), `w2` 1/2 × 3/5 (→ 3/10), `w3` 4/5 × 2/3 (→ 8/15, ends on the rule). متقدم (the product is written first): `a1` 3/2 × 2/3 = 1 window, `a2` 5/4 × 3/5 = 3/4, `a3` 7/4 × 4/3 = 7/3 on a 2 × 2 wall, `a4` 2 × 3/5 = 6/5 (a whole-window factor: `b = 1`). The levels test measures the pair by the PREDICTION (متقدم only) and by FACTORS > 1 (متقدم only).

**Events** (`onTrial`): `{ kind: 'pull', task, which: 'curtain' | 'blind', value, ok, free }` (one per pull at each « ماذا أُظلم؟ »), `{ kind: 'product' | 'predict', task, value, ok, model, bigger, free }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true, a, b, c, d }`, then the checkpoint events `{ tk: 'checkpoint' | 'checkpoint-done', id: <task id>, q: <question id> }`. **Lab prototype (§8quinquies):** `CHAINS` (w1 `panes · dark · half`, w2 `den10 · num3`, w3 `rule`, a1 `darkPanes`, a2 `red15`, a3 `whyBig`, a4 `natural`, k1 `kred · ruleK`) over the lab through `useLabCheckpoint`, `LabStepper` + `useStepCelebration`, sounds off by default (`gesture` per stop, `flag` on right pulls or a right product, `over` on a refusal, `bell` on the solved task) with the shell's « الصوت » switch, « إعادة », the teacher switch in the header, LabCoach (`curtain · blind · ask · lines · write · predict · next`, key `sa.labCoach.window-blinds.off`).

**« جرّب أعدادك »** is ALWAYS open: two fractions `a/b × c/d` (b, d from 2 to 8, a ≤ 2b, c ≤ 2d; the wall grows to 2 windows when a > b or c > d), a free « توقّعي » drawn as a dashed frame. Free trials never count.

**Screen budget.** `[data-wb-glance]` fits the viewport width at 768×1024, 1024×768, 1280×800 and 1366×768 at both levels; the scene is sized from the wall (W × H windows, window aspect 1,25, ≤ 212 px high at laptop heights) and the two −/+ groups plus « ماذا أُظلم؟ » sit in ONE row. In the متقدم predict phase the writing card comes first and the pulls are shown locked.

**DOM.** `[data-window-blinds][data-level][data-task][data-a][data-c][data-solved][data-layout]`, `[data-wb-glance]`, `[data-wb-scene]`, `[data-wb-curtain][role=slider][aria-valuenow][data-stops][data-locked]`, `[data-wb-blind][role=slider][aria-valuenow][data-stops][data-locked]`, `[data-wb-lines]`, `[data-wb-pane=<i>-<j>][data-dark]`, `[data-wb-less-c|more-c|less-b|more-b]`, `[data-wb-readout=curtain|blind]`, `[data-wb-factor=curtain|blind]`, `[data-wb-ask]`, `[data-wb-write][data-phase]`, `[data-wb-input]`, `[data-wb-check]`, `[data-wb-frame][data-model][data-clipped]`, `[data-wb-verdict=bad|good]`, `[data-wb-next]`, `[data-wb-step=<i>]`, `[data-wb-free][data-active]`, `[data-wb-free-a|b|c|d]`, `[data-wb-free-guess]`, `[data-wb-free-back]`, `[data-wb-free-msg]`, `[data-wb-formal]`, `[data-wb-screen]` (the projector screen that hangs in the dark corner once the task is solved). Strings: `lesson.manipulation.json › windowBlinds`. Tests: `logic/windowBlinds.test.js` (the grid count equals the product for every b ≤ 8, d ≤ 8, W, H ≤ 2 and every a, c), `operations/windowBlinds.render.test.jsx`, `levels.test.js`; e2e `apps/web/e2e/lesson-kit/2am-kusur-amaliyat-jida-kasrayn.mjs`.

## 2novenquinquagies quater. A height read in two graduations — `level-laser` (2AM unit 2, lesson `muqarana-kasrayn`, 2026-10-29)

`operations/LevelLaser.jsx` (+ `operations/levelLaser/art.jsx`: the stone-walled oil-press SVG — `Wall`, `TankBody` (steel tank on legs, brim line at 1), `LaserGrip`, `Student` (Anis, a boy in a hoodie, at مبتدئ; Salma, a girl in hijab and long tunic, at متقدم, both `KidFigure`)) on `logic/levelLaser.js` (pure; integers only — positions are `p / L` with `L` = lcm of the tubes' marks and the oil levels' denominators; the case of a pair comes from `packages/core/arithmetic/fractions2.js` — E4 row: `compareCase`, `compareSimple`, `orderSimple`, `vsOne` — imported BY PATH). Theme `oilpress` (kind `levels`).

**The five questions.** (A) the hand holds ONE variable, the HEIGHT of a red laser level that crosses every sight tube: drag the grip on its rail, ↑ ↓ (next mark of the UNION of the graduations and the oil levels), PageUp/PageDown (next mark of the coarser tube); the « على زيت الخزّان » snap buttons are offered only AFTER a first gesture of the hand (`snapOffered`). (B) the same height is READ in each tube by a chip (« العلامة 9 من 12 » / « بين 4 و 5 من 8 ») — `3/4 = 9/12` is SEEN, never computed. (C) the tubes are graduated differently (more marks = smaller marks); at متقدم the tubes are covered by canvas sleeves and the laser is locked until the prediction is written. (D) formal phase: `3/4 = (3×3)/(4×3) = 9/12 > 7/12`, `3/8 < 3/5`, `5/6 < 1 < 9/8`. (E) the wrong models are refuted BY THE WORLD: the laser jumps to the oil level of the tank the student claimed and the other oil is on the wrong side of the red line (`numOnly` compares numerators across different graduations, `bigDen` « more marks = more oil », `noScale` writes 3/12 for 3/4, `gap` « one mark short of full, so equal »).

**Steps per task (`task.steps`).** مبتدئ: `laser` (put the laser on the left oil) → `choose` (which tank has more oil: left / equal / right) → `rewrite` (only when one number of marks is a multiple of the other: write the left level in the other tube's marks, `9/12`) → `one` (l4 only: which tank is above the « 1 » line). متقدم: `choose` (by sign `>` `=` `<`) or `order` (tap the tanks from the lowest to the highest) → `rewrite` → `verify` (the sleeves are lifted; the laser is put on the left oil). A wrong prediction lifts the sleeves (the world answers) and the student corrects.

**Props.** `tasks` (`{ id, tanks: ['a/b', 'c/d'(, 'e/f')], kind?: 'order', predict? }`; a may be decimal (`'2,5/4'`); marks from 2 to 24; levels up to 2), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A task with its own id and `levels={false}` is posed alone (module 2: `{ id: 'k1', tanks: ['2/3', '5/6'] }`, chain `k1`).

**Levels (`levels.js`).** مبتدئ: `l1` 5/8 | 7/8, `l2` 3/4 | 7/12 (laser reads 9 of 12), `l3` 3/5 | 3/8 (« between 4 and 5 of 8 »), `l4` 9/8 | 5/6 (over the « 1 » line). متقدم (covered): `a1` 5/6 | 11/18, `a2` 2/3 | 5/9 | 7/9 (three tanks to order), `a3` 2,5/4 | 5,5/8 (decimal numerators), `a4` 7/5 | 11/10 (both over-full). The levels test measures the pair by the covered PREDICTION (متقدم only) and by the number of TANKS (three, متقدم only).

**Events** (`onTrial`): `{ kind: 'laser', task, h }`, `{ kind: 'compare' | 'predict', task, step: 'choose', choice, ok, model }`, `{ kind: 'rewrite' | 'predict', task, step: 'rewrite', value, ok, model }`, `{ kind: 'one', task, choice, ok, model }`, `{ kind: 'order' | 'predict', task, step: 'order', seq, ok, model }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true, tanks }`, then the checkpoint events `{ tk: 'checkpoint' | 'checkpoint-done', id: <task id>, q: <question id> }`. **Lab prototype (§8quinquies):** `CHAINS` (l1 `marks · higher · why`, l2 `at9 · small`, l3 `smallMarks · threeMarks`, l4 `above1 · rule`, a1 `why18`, a2 `why9`, a3 `dec`, a4 `over`, k1 `kmark · ruleK`) over the lab through `useLabCheckpoint`, `LabStepper` + `useStepCelebration`, sounds off by default (`gesture` per mark, `flag` on a right answer, `over` on a refusal and when the laser passes the « 1 » line, `bell` on the last), `LabCoach` (`sa.labCoach.level-laser.off`: laser · read · choose · one · rewrite · predict · verify · next), « إعادة » restarts everything, full screen, the end-of-module memo card.

**« جرّب أعدادك »** is ALWAYS open: two slips `a/b`, `c/d` (marks 2–24, a ≤ 2b, c ≤ 2d). The laser is honest; when the pair is NOT one of the four 2AM cases (`freeCase = 'later'`) the banner says « هذه الحالة سنكتبها بالحساب في السنة الثالثة » and gives NO verdict. Free trials never count.

**Screen budget.** `[data-ll-glance]` fits the width at 768×1024, 1024×768, 1280×800 and 1366×768 at both levels; the scene is a 460-wide viewBox (the lab column is only ~414 px beside the sidebar at 1024) and its height follows the tallest level (150 px per unit, 128 when a tank is over-full). The laser buttons and the step panel are two compact rows.

**DOM.** `[data-level-laser][data-level][data-task][data-h][data-solved]`, `[data-ll-glance]`, `[data-ll-scene]`, `[data-ll-laser][role=slider][aria-valuenow][data-locked]`, `[data-ll-tube=<i>][data-den][data-level]`, `[data-ll-oil=<i>]`, `[data-ll-chip=<i>][data-on|data-between]`, `[data-ll-sleeve=<i>][data-up]`, `[data-ll-beam]`, `[data-ll-one-line]`, `[data-ll-up|down]`, `[data-ll-snap=<i>]`, `[data-ll-choice=left|eq|right]`, `[data-ll-choice-box]`, `[data-ll-one]`, `[data-ll-one-choice]`, `[data-ll-order=<i>]`, `[data-ll-rewrite]`, `[data-ll-input]`, `[data-ll-check]`, `[data-ll-verdict=bad|good]`, `[data-ll-next]`, `[data-ll-step=<i>]`, `[data-ll-free][data-active]`, `[data-ll-free-a|b|c|d]`, `[data-ll-free-back]`, `[data-ll-formal]`.

## 2novenquinquagies quinquies. The origin and the graduation under the hand — `corniche-ruler` (2AM unit 3, lesson `talim-mustaqim-mudarraj-2`, 2026-10-29)

`operations/CornicheRuler.jsx` (+ `operations/cornicheRuler/art.jsx`: `Backdrop` (sky, sea, blue railing, paving), `Landmark` (fountain, bench, lamp, ice-cream kiosk, palm, bus stop, fishermen's kiosk), `PinFlag`, `Pennant`, `Guide` (`KidFigure`: a girl in hijab at مبتدئ, a boy in a hoodie at متقدم)) on `logic/cornicheRuler.js` (pure; BigInt hundredths; the maths are `packages/core/arithmetic/relative.js`, E1 row: `opposite`, `abscissaOf`, `positionOf`, `onGraduation`, `boardFit`, `smallestStep`, imported BY PATH — extend, never fork). Theme `corniche` (kind `lengths`).

**The five questions.** (A) مبتدئ: the hand holds the ORIGIN — a red « 0 » flag that slides along a board of 13 graduations of 10 m (drag, ‹ ›, ← →, Home/End; it snaps to graduations); the student then TYPES the abscissa of a landmark. متقدم: the hand holds the VALUE OF ONE GRADUATION — a brass lever with ten notches (0,1 · 0,5 · 1 · 2 · 5 · 10 · 20 · 25 · 50 · 100 m; range input + −/+), the origin fixed under the fountain; the board's numbers stay VEILED until « ثبّت التدريجة » (prediction), then the student TAPS the graduation of each point. (B) the abscissa is an OUTPUT: (landmark position) − (flag position); it changes when the flag moves although the landmark did not. (C) resistance: two landmarks at the same distance on both sides are opposite for ONE origin only (b3: pin at −10); a landmark can fall between two graduations (hatched half-cell, b4); a too-small graduation throws a point off the board (« ◀ خارج اللوحة »), a too-large one leaves it between two graduations. (D) the formal phase is the last question of each level (« ruleB » / « rule ») with the student's own numbers. (E) wrong answers are made VISIBLE: `judgeRead(state, landmark, text) → { ok, model, want, value }` with models `unitIgnored` (the graduation COUNT written without the value: a dashed ghost stands that many metres from the pin), `signSide` (mirrored ghost), `originFixed` (the old origin's number), `other`, `format`; `judgeStep`/`confirmStep` → `{ ok, off, between }`.

**Props.** `tasks` (`{ id, kind: 'read' | 'move' | 'opp' | 'fit', … }`: `read` { pin, ask: [landmark ids] } (origin locked), `move` { pin, target, ask }, `opp` { pin, pair: [a, b] }, `fit` { marks: [{ id: 'A', x: '-50' }] } — 1 to 4 points; landmark ids `fountain kiosk bench lamp palm bus fish bench2`), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A task with its own id and `levels={false}` is posed alone (module 2 « معارف »: `{ id: 'm1', kind: 'read', pin: '-20', ask: ['lamp','palm','bus'] }`, chain `m1`; the graduation is the level's 10 m — the plan's 5 m was not built).

**Levels (`levels.js`).** مبتدئ: `b1` read +30 and −20 under the fountain, `b2` move the « 0 » to the bench and write the kiosk again (+50), `b3` the lamp and the palm opposite (pin at −10: −30 and +30), `b4` the bus stop between two graduations (−35, ends on the rule). متقدم (method): `a1` −50 ; 75 ; 150 → 25, `a2` 0,3 ; −0,5 ; −0,1 ; 0,6 → 0,1, `a3` −300 ; 400 ; 600 → 100 (ends on the rule of choice). `relative.smallestStep(values, NOTCHES)` is the planned step of every `fit` task; the levels test measures the pair by the GESTURE (origin vs graduation) and the decimals.

**Events** (`onTrial`): `{ kind: 'pin', task, origin, ok?, a?, b?, model? }`, `{ kind: 'read', task, landmark, value, ok, model, want, origin }`, `{ kind: 'step', task, step, ok, off, between }`, `{ kind: 'tap', task, landmark, cell, ok }`, `{ kind: 'custom', free: true }`, then the checkpoint events. **Lab prototype (§8quinquies):** `CHAINS` (b1 `count · unit · whyNeg`, b2 `didMove · whyChange`, b3 `dist · name`, b4 `between · ruleB`, a1 `whyNot`, a2 `whyNot`, a3 `whyNot · rule`, m1 `count · ruleB`) over the lab through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx`, `useLabCheckpointSettings('corniche-ruler')`; the correct option is NEVER always first (`opt(texts, right, whys, at)`).

**« جرّب أعدادك »** is ALWAYS open: up to four abscissae (|x| ≤ 999,99, ≤ 2 decimals) and the free lever; the board shows « خارج اللوحة » arrows and hatched cells with the counts; free trials never count.

**Screen budget.** `[data-cr-glance]` (prompt, board, controls, verdict) is ≈ 600–650 px at the 414 px lab column of 1024×768 and fits the width at 768×1024, 1024×768, 1280×800, 1366×768 at both levels; the scene is 176 px high (13 graduations × ≈ 24–30 px, labels on every second graduation).

**DOM.** `[data-corniche-ruler][data-level][data-task][data-origin][data-step][data-solved]`, `[data-cr-glance]`, `[data-cr-stage]`, `[data-cr-svg]`, `[data-cr-pin][role=slider]`, `[data-cr-pin-less|more]`, `[data-cr-lever][type=range]`, `[data-cr-less|more]`, `[data-cr-confirm]`, `[data-cr-landmark=<id>][data-abscissa]`, `[data-cr-point=<A…D>]`, `[data-cr-cell=<-6…6>]`, `[data-cr-hatch]`, `[data-cr-off]`, `[data-cr-ghost][data-model]`, `[data-cr-answer]`, `[data-cr-check]`, `[data-cr-verdict=right|wrong|free|'']`, `[data-cr-next]`, `[data-cr-step=<i>]`, `[data-cr-free]`, `[data-cr-free-input]`, `[data-cr-free-info]`, `[data-cr-free-back]`, `[data-cr-kid][data-mood]`.

**Why not another lab.** `zero-probe` (same unit): the hand holds a DISTANCE from a fixed zero; here the zero itself moves, and the scale. `ruler-compare` (1AM): the graduation tells two positive decimals apart; here it must make a SET of signed numbers fit a fixed board. `number-line-pegs` (3AM): a card is carried and hung; here the pin is planted and the lever thrown. `mooring-lines`: no candidate value is searched. `ten-zoom`, `size-ladder`, `unit-ladder`: powers of ten and conversions, no signs, no origin.

## 2novenquinquagies sexies. The load of a balloon under the hand — `balloon-ballast` (2AM unit 3, lesson `jam-tarh-nisbiya`, 2026-10-29)

`operations/BalloonBallast.jsx` (+ `operations/balloonBallast/art.jsx`: `Backdrop` (Tassili sandstone plateau, canyon, the dashed « 0 » edge), `AltitudeScale` (−12 … +12 m), `Flame` (+1), `Sack` (−1), `Balloon` (real and ghost), `Guide` (`KidFigure`: a girl in hijab at مبتدئ, a boy in a hoodie at متقدم)) on `logic/balloonBallast.js` (pure; the maths are `packages/core/arithmetic/relative.js`, E2 row: `add`, `sub`, `ruleCase`, `ballastOf`, imported BY PATH — extend, never fork). Theme `balloonvalley` (kind `objects`).

**The five questions.** (A) the hand holds the LOAD of the basket: flames (+1 m) and sandbags (−1 m), changed by four gestures — tie a flame, tie a bag, throw a flame, throw a bag — plus, at متقدم, a NEUTRAL PAIR (one flame and one bag). Three paths: drag an object from its bin onto the scene (tie) or out of the basket (throw) — a drag longer than 28 px; the « اربط / ارمِ » buttons under each bin; the keyboard on `[data-bb-basket]` (T / S tie, Shift+T / Shift+S throw, P a pair). (B) the altitude = flames − bags is an OUTPUT on the right-hand scale. (C) resistance: a flame and a bag on the same rope row LOCK as a pair (golden rope, glow, blink); one cannot throw what the basket does not hold (a refused trial; the coach proposes the neutral pair after two refusals); an opposite gesture CANCELS its twin in the log (throwing a bag just tied). (D) the formal phase writes the student's own cards. (E) wrong answers are made VISIBLE: a dashed ghost balloon at the typed altitude (`addDist`, `signFirst`, `signLost`, `subDist`, `subNoFlip`, `flipBoth`) and a RED log line when the gestures are not the card's.

**The card and its judge.** A task is a card `a ± b`: `{ id, a, op: '+' | '-', b, predict? }` (integers; the balloon starts loaded for `a`). The second number says the gesture (`needOf`): `+ (−4)` tie 4 bags, `+ (+5)` tie 5 flames, `− (−3)` throw 3 bags, `− (+5)` throw 5 flames. The judge compares (1) the LOG against the card (`gestureJudge`: exactly `n` gestures of the right kind and object, no other non-pair gesture) and (2) the typed altitude against `a ± b` (`judgeValue`). مبتدئ: execute the card, then write the altitude (`answer`; the right number with the wrong gestures is refused as `wrongGesture`). متقدم (`predict: true`): the altitude is written BEFORE the gestures (`predict`; a right one opens them) and the task ends by itself when the log and the altitude are right.

**Props.** `tasks`, `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A lesson poses the lab alone with its own ids and `levels={false}` (module 2 « معارف »: `m1` `(−8)+(+3)` then `m2` `(+4)−(−6)` with `predict`, chains `m1`, `m2`).

**Levels (`levels.js`).** مبتدئ (platform): SUMS — `t1` `(+6)+(−4)` (4 pairs lock → +2), `t2` `(−3)+(−5)` (no pair → −8), `t3` `(−9)+(+5)` (5 pairs → −4), `t4` `(−6)+(+6)` (6 pairs → 0, ends on the rule of the sum). متقدم (method): DIFFERENCES, predicted first — `a1` `(−7)−(−3)` (throw 3 bags → −4), `a2` `(+5)−(−7)` (no bag aboard: 7 neutral pairs, then throw 7 bags → +12), `a3` `(−2)−(+5)` (→ −7), `a4` `(+6)−(+7)` (1 neutral pair, throw 7 flames → −1; ends on the rule of the difference). The levels test measures the pair by the OPERATION (sums only / differences only, predicted).

**Events** (`onTrial`): `{ kind: 'gesture', task, g, object, altitude, ok, refused? }`, `{ kind: 'answer', task, value, ok, model, gestureOk, count }`, `{ kind: 'predict', task, value, ok, model }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`, then the checkpoint events. **Lab prototype (§8quinquies):** `CHAINS` (t1 `pairs · left · whySign`, t2 `noPair · howEight`, t3 `farther · signOf`, t4 `oppZero · ruleSum`, a1 `rose · sameTie`, a2 `whyNeutral · equalsSum`, a3 `equalsSum`, a4 `ruleDiff`, m1 `pairs`, m2 `ruleDiff`) over the lab through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx` (`gesture` on tie/throw, `bell` when a pair locks, `flag` / `over`), `useLabCheckpointSettings('balloon-ballast')`; the correct option is NEVER always first. Card formulas are written `${(+6)+(-4)}$` (a braced group): KaTeX never breaks a line inside it.

**« جرّب أعدادك »** is ALWAYS open: a free card `a ± b` (two integers with |x| ≤ 12 and a sign toggle), the balloon starts loaded for `a`, the neutral pair is available; free trials never count.

**Screen budget.** `[data-bb-glance]` (prompt, scene, bins, answer row, verdict) is ≈ 710 px at the 414 px lab column of 1024×768 (scene 220 px high: 1 m = 4,2 px, up to 24 objects per kind) and fits the width at 768×1024, 1024×768, 1280×800, 1366×768 at both levels.

**DOM.** `[data-balloon-ballast][data-level][data-task][data-altitude][data-solved]`, `[data-bb-glance]`, `[data-bb-stage]`, `[data-bb-svg]`, `[data-bb-balloon][data-value]`, `[data-bb-basket]`, `[data-bb-token=<i>][data-paired]`, `[data-bb-bag=<i>][data-paired]`, `[data-bb-shelf=token|bag|pair]`, `[data-bb-tie=token|bag|pair]`, `[data-bb-throw=token|bag]`, `[data-bb-count=…]`, `[data-bb-log][data-wrong]`, `[data-bb-answer]`, `[data-bb-check]`, `[data-bb-ghost][data-model]`, `[data-bb-verdict=right|wrong|free|'']`, `[data-bb-next]`, `[data-bb-step=<i>]`, `[data-bb-free][data-active]`, `[data-bb-free-a|op|b]`, `[data-bb-free-back]`, `[data-bb-formal=sum|diff]`, `[data-bb-kid][data-mood]`. Strings: `lesson.manipulation.json › balloonBallast`. QA: `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-jam-tarh-nisbiya.mjs`.

**Why not another lab.** `zero-probe` (same unit): ONE distance and a side make one number; here two opposite kinds of objects make a load and the operation is the gesture. `difference-meter` (3AM): two probes READ a signed difference already computed by the needle; here the student builds the result. `merge-board` (3AM): neighbouring tiles merge in a chosen order, no load, no removal. `kit-packer` (2AM m1): dispensers fill identical kits, no opposite objects, no cancellation. `equality-lanes` / `term-ferry` (equations): an operation applied to both sides of an equality; here there is no equality.

## 2novenquinquagies nonies. The team of every term under the hand — `tug-rope` (2AM unit 3, lesson `majmu-jabri`, 2026-10-29)

`operations/TugRope.jsx` (+ `operations/tugRope/art.jsx`: `Backdrop` (sports ground, rope), `Flag` (green right « + », orange left « − »), `Strip` (ground strip −20 … +20, halves at متقدم), `Ribbon` (real and ghost), `Kid` (six `KidFigure` cast members, girls always hijab + long tunic)) on `logic/tugRope.js` (pure; the maths are `packages/core/arithmetic/relative.js`, E3 row: `terms`, `asSum`, `groupBySign`, `algebraicSum`, `simplifiedText`, `bracketText`, imported BY PATH — extend, never fork). Theme `tugfield` (kind `sorting`).

**The five questions.** (A) the hand holds the TEAM of each term: an algebraic sum is a queue of children with bibs (one relative number each, in the written order); the child whose term is preceded by « − » TURNS (his bib becomes the opposite — the red « − » card is the button), then every child is SENT to the left (orange flag, « − ») or right (green flag, « + ») team. Three paths: drag a child onto the field (released over the left / right half of `[data-tr-stage]`), select him then « يمين / يسار » (`[data-tr-send=left|right]`), the keyboard on a child (T turns, ← / → send, Backspace / Escape return him to the queue); tapping a placed child returns him. « صفّارة » (`[data-tr-whistle]`) pulls. (B) the ribbon position = right total − left total is an OUTPUT on the graduated strip (clamped to ±20). (C) resistance: any sending order gives the same mark; two opposite bibs cancel; a bracket is a SMALL TEAM settled first — stage 0 shows only its children, the whistle turns its result into ONE child (with its « − » card) of stage 1; one group per chain, no nesting. (D) the formal phase writes `(−8)−(+3)+(−6)−(−5)=(−8)+(−3)+(−6)+(+5)=(−17)+(+5)=(−12)` (مبتدئ) and `−15+4+8+3=(4+8+3)+(−15)=0` (متقدم). (E) wrong moves are VISIBLE: the ribbon goes to the physical mark and a dashed GHOST ribbon marks the true one, the faulty children blink (`noTurn`: a « − » child not turned; `turnAll`: an added term turned — the scoreboard writes it in red; `wrongSide`), typed values are classified (`noTurn` = sum of printed numbers, `flipSign`, `bracketDrop` = the bracket's own operator ignored).

**The judge** is per child: `turned ⇔ op = '-'` and the team is the side of the sign of the true contribution (`contribution`, +v or −v); a correct arrangement gives exactly the algebraic sum. مبتدئ: arrange, whistle (a correct whistle opens phase `read`), then WRITE where the ribbon stopped (`answer`). متقدم (`predict: true`): the position is written BEFORE (`predict`), a correct value opens the gestures, a correct whistle solves the task. Tasks: `{ id, chain, predict? }` with `chain` any text read by `R.terms` (« (−8) − (+3) + … », « −15+4+8+3 », « (+12) − [ … ] »).

**Props.** `tasks`, `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. A lesson poses it alone with its own ids and `levels={false}` (module 2 « معارف »: `m1` `(−11)−(+6)−(−9)−(+4)`, chain `m1 asAdd`).

**Levels (`levels.js`).** مبتدئ (platform): `t1` `(+7)+(−3)+(+5)+(−6)` (12 / 9 → +3), `t2` `(−8)−(+3)+(−6)−(−5)` (two turns, 5 / 17 → −12), `t3` `(+5)+(−7)+(−5)+(+7)+(−3)` (two opposite pairs → −3, ends on the rule of turning). متقدم (method-5): `a1` `(+4,5)+(−7)−(+8)+(+3,5)−(−4,5)−(−10)` (22,5 / 15 → +7,5), `a2` `(+12)−[(−6)−(−2)+(+9)]` (small team +5, then +7), `a3` `−15+4+8+3` (0, ends on the rule). The levels test measures the pair by the PREDICTION written before the whistle, the decimals and the bracket.

**Events** (`onTrial`): `{ kind: 'turn', task, i }`, `{ kind: 'send', task, i, side, ok }`, `{ kind: 'whistle', task, stage, mark, ok, model }`, `{ kind: 'answer' | 'predict', task, value, ok, model }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`, then the checkpoint events. **Lab prototype (§8quinquies):** `CHAINS` (t1 `totals · whyMark`, t2 `bibTurn1 · bibTurn2 · asAdd`, t3 `leave · ruleTurn`, m1 `asAdd`, a1 `order`, a2 `whyGroup`, a3 `ruleSum`) over the lab through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx` (`gesture` on turn / send, `bell` / `over` on the whistle, `flag` on a right value), the `LabCoach` (`turn`, `send`, `whistle`, `predict`, `group`, `type`, `next`; key `sa.labCoach.tug-rope.off`), « إعادة » (task 1) and the shell's full screen and « الصوت » switch.

**« جرّب أعدادك »** is ALWAYS open: a flat chain of 2–6 terms typed in either form (brackets or simplified), |term| ≤ 20, ≤ 2 decimals, no group; free trials never count.

**Screen budget.** `[data-tr-glance]` (prompt, field with strip, queue, scoreboard + answer + whistle row, verdict) is ≤ 700 px at the 414 px lab column of 1024×768 at both levels and in the worst phases (asserted by the lesson e2e): field 138 px (small kids, 28–32 px wide), queue 62 px. The scoreboard shows the simplified second line only at متقدم and in the free chain.

**DOM.** `[data-tug-rope][data-level][data-task][data-mark][data-solved]`, `[data-tr-glance]`, `[data-tr-stage]`, `[data-tr-svg]`, `[data-tr-queue]`, `[data-tr-child=<i>][data-bib][data-turned][data-side][data-selected]`, `[data-tr-turn]`, `[data-tr-send=left|right]`, `[data-tr-team=left|right][data-total]`, `[data-tr-total=left|right]`, `[data-tr-ribbon][data-value]`, `[data-tr-ghost][data-model]`, `[data-tr-scoreboard][data-total]` (`[data-tr-board-bracket]`, `[data-tr-board-simple]`), `[data-tr-whistle]`, `[data-tr-answer]`, `[data-tr-check]`, `[data-tr-verdict=right|wrong|free|'']`, `[data-tr-next]`, `[data-tr-step=<i>]`, `[data-tr-free][data-active]`, `[data-tr-free-chain]`, `[data-tr-free-back]`, `[data-tr-formal=turn|sum]`, `[data-tr-kid][data-mood]`.

**Why not another lab.** `merge-board` (3AM): two NEIGHBOURING tiles fuse and the order of fusions is the variable; here any child may join at any time and the variable is the side. `term-ferry` (4AM): a term crosses an equals sign; here there is no equation and « − » is the operation's sign. `tram-route` / `chain-cutter` (2AM m1): the ORDER of operations / the last operation; here the order is free (the point of the lesson). `balloon-ballast` (same unit): a load of identical unit objects for TWO numbers; here whole and decimal numbers are people of different strengths and the gesture is sorting. `stat-balance`, `group-tanks`: balances of data / volumes, no signed terms.

## 7. Levels and free lab

**A manipulation has exactly two levels: `beginner` (مبتدئ) and `advanced` (متقدم).** There is no
other level system. The four-palier ladder that existed until 2026-09-24 (اكتشاف · موجّه ·
استقلالية · تحدّ, keys `discover/guided/autonomy/challenge`) was **removed, not hidden** — no
`LEVEL_KEYS`, no `manipulation.levels.*` strings, no four-chip row. `levels.test.js` fails if a
registered type does not declare exactly `{ beginner, advanced }`, or if the old keys come back.

| Level | Purpose | How the difficulty rises |
|---|---|---|
| **مبتدئ** `beginner` | the entry: the tool is discovered, the relation is visible at a glance | small or familiar numbers, strong visual consequence, minimal load |
| **متقدم** `advanced` | the **same tool**, a heavier mathematical demand | less obvious numbers, more steps, a strategy to choose, a "no" case — **never a more complicated UI** |

### Where the levels come from

- **In a `ManipulationWorkspace`** (the opening of a module): the *lesson* declares the pair in
  `lesson.config.js` (`level`, `objective`, `autonomy`, `experience`) and the workspace carries
  the selector — §7bis-levels.
- **A manipulation posed alone** (a module's `intro`, a step): the pair of its *type* in
  `levels.js`, resolved against the lesson's numbers by `resolveManipulationLevels(type,
  authoredNumbers, requested?)`:
  - the lesson's numbers are **always one of the two levels** — the student lands on them;
  - which one: `requested` if given, else the level whose preset has exactly these numbers, else
    `beginner`. The other level is the type's preset.

  So `common-divisors` 28/42 opens on مبتدئ (28/42) with متقدم = 65/78; `coprime-explorer` 27/36
  opens on متقدم (27/36) with مبتدئ = 17/18.

Every preset cites a textbook element (`ref`); a beginner preset may instead be marked
`source: 'platform'` and is then tagged «مثال تفاعلي إضافي». The `advanced` preset always comes
from the textbook. The rationale of each pair is written next to it in `levels.js`.

### One selector, never two

`ManipulationLevelSelector` is the **only** level UI. It is posed in exactly one place:

- by `ManipulationWorkspace`, which switches panels (`controlsPanels` → `aria-controls`);
- by `ManipulationShell` (in its header), when
  the manipulation is **not** inside a workspace — there it switches numbers.

A manipulation knows it is inside a workspace through `WorkspaceLevelContext`
(`workspaceContext.js`): `useManipulation` then takes the workspace's level, returns
`levels: null`, and the shell renders no selector. « One selector » is per MANIPULATION, not per
page: a standalone `<Manipulation>` placed inside a later step (khawass M1 cases 2–3, bahth M1/M3,
awwaliyan M1, qawasim M1) shows its own selector below the workspace's. Those standalone labs are
not always declared in `resources[]` (48 and 105 in qawasim, 35/15/5 and 56/21/7 in khawass,
378/315 and 3356/1528 in bahth, 22/15 and 27/36 in awwaliyan) — a known gap, harmless at runtime
(`resources[]` feeds the registry and the teacher's مذكرة, not the page). The selector shows the label «مستوى المناولة»,
a colour per level (green مبتدئ, blue متقدم) so the active one reads without reading, ≥ 44 px
tabs, `aria-selected` on the active tab, arrow keys that change the tab AND move focus to it
(WAI-ARIA tabs pattern, 2026-09-29), and ids prefixed per instance so several selectors can share a
page.

### What `useManipulation` exposes

`level` (`'beginner' | 'advanced'`), `levels` (the pair, or `null` in a workspace), `setLevel(id)`,
`levelPreset`, `isAuthoredLevel`, `inWorkspace`, and **`report(fn, …args)`**. Switching level
calls `setNumbers()`, which resets the manipulation. Two consequences are enforced centrally:

- **Titles.** A lesson's `title`/`lead` name the lesson's numbers («مثال الكتاب: 22 و 15»). On the
  other level the shell replaces them with `manipulation.level.practiceTitle`
  («تدرّب — مستوى متقدم») and drops the lead; the mission is computed from the live numbers and
  stays.
- **Lesson callbacks.** Every type calls `onVerdict` / `onFinished` through `state.report(…)`,
  which fires **only on the lesson's level**: finishing 65/78 must not tick a step that asks about
  28/42. A new type must do the same — never call a lesson callback directly.

`TeamBuilder`'s behaviour (`isAdvanced`: no proposed sizes) reads the live `state.level`, so it
follows both the workspace and the standalone selector. The shelf lab reads `range`/`marks` from
the level preset (`LEVELS['divisor-explorer-books']`: 24 books on a 2–12 ruler / 420 on 10–60
with the textbook marks 26 and 28).

### Persistence, progress, analytics

### Reset, new numbers, worked examples

- **« إعادة » starts the activity over** (`state.reset`, 2026-09-30). It restores the numbers of
  the level on screen (the lesson's, or the other level's preset), closes the free lab, resets
  phase/hints/explanation, and increments `state.resetCount`. A type that keeps a **memory of
  trials** outside its scene (TeamBuilder's `tried`, the shelf's `tried`, the hand-sharing flag)
  clears it on `resetCount`. Before this, a free-lab 0 survived « إعادة » (factor-pairs stayed
  dead until reload), and the team-builder discovery reopened on an empty scene.
- **`setNumbers` resets the scene, not the memory** (`epoch` changes, `resetCount` does not):
  changing 15 → 16 is how the contrast is produced.
- `ManipulationDiscovery` forgets the student's pick on every new scene (`epoch`), so a
  conjecture is never pre-pressed for the next attempt.
- **A worked example has one level.** `useManipulation({ withLevels: false })` — prop
  `levels={false}` on `divisor-explorer-books` — poses no selector. Use it for a textbook
  example read in معارف (the 143 lab), whose type preset would otherwise duplicate another
  module's lab (audit M3-F1). A lab that is *explored* keeps its two levels.

Levels are **presentation state only**. Nothing about a level is persisted (no column, no
evidence field, no localStorage key), no "levels completed" figure exists, and levels feed
neither progression (`moduleGate` / `stepUnlock`), nor mastery, nor the admin analytics. This was
already true of the four paliers, so their removal required **no data migration**. If a level ever
has to be recorded, it is recorded as `beginner | advanced` and nothing else.

### Game screen (`immersive`, 2026-10-27)

Owner: « the lab must cover and use exactly all the screen of the laptop, so the student feels in a game ». **Since 2026-10-28 it is ON
BY DEFAULT for every lab** (owner: « all the manipulations must have the fullscreen button and its exit »): `immersive` defaults to
`true` in `ManipulationShell`, and all 101 registered labs use the shell; a type opts OUT with `immersive={false}`. A lab that does not
read `useManipulationImmersive()` keeps its normal layout inside the full-screen layer (it scrolls) — verified on `team-builder` and
`gear-crank` at 1366×768. The shell shows « العب بملء الشاشة » in its header
(`[data-manipulation-immersive-enter]`); the click puts the shell's `<section>` in the browser's REAL fullscreen through
`classroom/useFullscreen` and locks the page scroll through `classroom/useScrollLock` (which also hides « كرّاسي » / « بطاقتي ») —
never a second fullscreen or scroll lock (LESSON_DEVELOPMENT_GUIDE « Do not write another fullscreen »). While it is on
(`[data-immersive=on]`): the section is `fixed inset-0 h-[100dvh]`, scrolls inside itself (the discovery below the stage is scrolled into
view when it opens), the header is screen-reader only and ONE bar carries « خروج من ملء الشاشة » (`[data-manipulation-immersive-exit]`),
the coach switch, جرّب › اكتشف › صِغ and إعادة / تلميح (`[data-manipulation-immersive-bar]`). Escape (the browser) or « خروج » give the page
back; state is kept (nothing is unmounted). When the browser refuses fullscreen (no user gesture, an iframe policy, no API), the same
layout is a fixed layer on the window and the workspace sidebar is hidden for its duration (the page's stacking context would otherwise
paint it on top). Never offered in Classroom Mode (`useClassroomMode().isClassroomMode`: the presentation is already fullscreen).
A type reads `useManipulationImmersive()` (`manipulations/immersive.js`) to lay its scene out to the screen's height — `false` outside a
shell. The level selector of a `ManipulationWorkspace` stays in the page.

### Free lab

The free lab (`مختبر حر`, `ManipulationFreeLab.jsx`) is **not a level**: it lets the student type
their own numbers after the discovery, bounded by the registry's `changeNumbers` plus the type's
own `validate()`. DOM: `[data-manipulation-free-lab]`.

`ManipulationShell` option `freeLabAlwaysOpen` (+ `freeLabLead`) moves it **to the top** of the manipulation as
an always-visible bar (« جرّب عددًا آخر » field, Enter applies, `[data-free-lab-inline]`) from the first screen —
no discovery gate. `factor-pairs` uses it (any n from 2 to 999, e.g. 253); the title and lead written for the
lesson's own number give way to a generic title once another number is tested. The other types keep the bottom
toggle opened by the discovery. For such free numbers `widthRange(n)` stops at 2·√n when n > 120 and the first
divisor above √n is far (997 columns cannot be drawn), and the type offers a typed input for d plus ±5.

**Not manipulation levels** (do not merge them into this system): exercise difficulty
(`Facile / Normal / Difficile`, the practice engine), the Math Lab practice tiers
(`features/mathlab/tools/*/practice.js`) and the Math Lab algebra generator's equation forms
(`x + a = b` … `ax + b = cx + d`).

## 7bis-levels. The two-level workspace — مبتدئ / متقدم

> **The textbook tells us what the student must learn. Smarter Academy decides how they
> experience it.** Two fidelities, and only one of them is absolute.

### The rule

Where a manipulation is pedagogically appropriate, the module opens on **one workspace with two
levels**, never on two stacked manipulations and never on a second page:

```
┌──────────────────────────────────────────┐
│  مستوى المناولة   [ مبتدئ ] [ متقدم ]      │
├──────────────────────────────────────────┤
│           THE ACTIVE MANIPULATION         │
└──────────────────────────────────────────┘
```

`ManipulationWorkspace` (`manipulations/ManipulationWorkspace.jsx`) is the only implementation.
It defaults to **مبتدئ**, renders **both** levels at the same place in the React tree — the
inactive one carries `hidden`, exactly as `ContentModule` does for classroom units — and therefore
**never loses the student's state on a switch**: teams already formed, sizes already tried, the
phase already reached all survive. The one deliberate reset is `modelKey`: change it and both
panels remount, because the state would describe mathematics that is no longer on screen.

The two levels usually show the SAME type; they may show two different types when one objective is genuinely served by two
gestures (unit 9's synthesis: the minaret's shadow, then the cylinder in the cone — §2undecies). The objective, `autonomy` and
`experience` rules are unchanged.

Its decisions live in `workspaceLevels.js` (pure, unit-tested): which tabs exist, which is active,
what the mount key is. Each panel provides its level through `WorkspaceLevelContext`, so the
manipulation inside shows **no second selector** (§7). `ManipulationLevelSelector` renders the tabs as a real `role="tablist"`,
with arrow-key navigation — in RTL, **← moves to the next level**, because the next tab is drawn
to the left.

### Mathematical fidelity vs contextual fidelity

| | Comes from | May the platform change it? |
|---|---|---|
| Concept, definition, property, method, notation, vocabulary, progression, objective | the textbook | **No.** Never. |
| The situation dressing it (books on shelves, players on a pitch) | the textbook, or the platform | **Yes**, when it preserves the mathematical structure and the objective |

A replaced context is **never silent**. Each levelled manipulation declares, in
`lesson.config.js`, where its mathematics comes from and what was done to the situation:

```js
{ kind: 'manipulation', code: 'team-builder-15-3', type: 'team-builder', module: 1,
  level: 'beginner',
  objective: 'التوزيع بالتساوي: a = b × q + r، والباقي معدوم ⇔ b قاسم لـ a',
  autonomy: '',                       // required, and non-empty, on 'advanced'
  experience: { type: 'platform_context', reason: 'smaller_numbers_for_first_contact', theme: 'football' },
  learningPointIds: [...], sourceElementIds: ['act-1'] }
```

The vocabularies are closed and live in `packages/core/curriculum/manipulationLevels.js`
(`EXPERIENCE_TYPES`, `ADAPTATION_REASONS`, `VISUAL_THEMES`). `validate-lessons.mjs` **fails** when:

- a module declares one level but not the other;
- the two levels state different `objective`s — the context may change, the objective may not;
- an `advanced` level has no `autonomy` — *« beginner with bigger numbers » is not an advanced level*;
- a non-`textbook` experience carries no reason from the closed list, or an unknown theme;
- a levelled manipulation cites no textbook element.

Each failure was verified by deliberately breaking the config (2026-09-20).

### The opening card tells ONE scene

The module's opening card (`brief`: headline, drawing, text) describes the scene
of the level the module OPENS on — the three never tell two different stories.
When the beginner level replaces the textbook context, the card carries the
platform situation, sourced `addition(...)` (shown « مثال تفاعلي إضافي »), and the
textbook statement moves to the advanced level, verbatim, as a
`TextbookBox kind="situation"` with its textbook source, above the manipulation
that answers it. Fixed in `qasim-adad-tabii` Module 1 (2026-10-07): the card said
« هيا نلعب كرة القدم! » over a pitch drawing, but its text was the 420-books
statement; the football text now lives in `TEAM_EXPERIENCE.situation`.

### The default level is ALWAYS مبتدئ (owner decision, 2026-10-09 — supersedes 2026-09-21)

Every `ManipulationWorkspace` opens on **مبتدئ**, in every lesson; the student switches to متقدم with the
selector. No module passes `defaultLevel="advanced"` any more (58 modules were switched), and a module that
carries a textbook activity on متقدم says so in its `lead` (« ابدأ بالمستوى المبتدئ…، ثم انتقل إلى المتقدّم »).
The step that waits on `onFinished` stays reachable: the textbook level is one tap away. A lab's title names
its own numbers, so the student can tell which activity is open. (The old rule — open on the textbook
activity — is retired; `manipulations.mjs` assertions that a workspace opens on the module-title numbers must
click متقدم first.)

### What each level is for

- **مبتدئ** — immediate understanding: small numbers, one obvious gesture, strong visual
  consequence, minimal load. The student acts *before* any formal notation.
- **متقدم** — genuine mathematical autonomy, **not** the same screen with bigger numbers:
  scaffolding removed, suggestions withdrawn, a case where the answer is "no", numbers too large
  to verify by counting, or a comparison the student must judge. That is what `autonomy` records.

> **Do not force a context.** When the textbook's own situation is already manipulable and the
> drawing *is* the argument — the rectangle of `factor-pairs`, the divisor lists of
> `common-divisors` at the advanced level of lessons 5 and 7 — keep it and only change the
> cognitive demand. A theme bolted onto a list of divisors makes the mathematics harder to see,
> not more engaging. The worlds of §2bis pass this test the other way round: they exist where the
> abstract drawing (a bar, a chip) showed *nothing* of the structure — bricks show « whole multiple
> of n », ribbons show « cut » and « lay along », groups show « identical » and « left over ».

### DOM contract (e2e)

```
[data-manipulation-workspace] [data-level=<active>]
[data-manipulation-level-panel=<id>] [hidden] on the inactive panel
[data-manipulation-levels-selector] [role=tab][data-level=…][aria-selected]
[data-manipulation=<type>] [data-level=beginner|advanced]   (the shell, workspace or alone)
```

Because a type may serve **both** levels (the rectangle serves 24 and 60), an e2e selector must be
scoped to the visible panel — `.first()` otherwise resolves to a `hidden` element and the test
hangs. `manipulations.mjs` provides `pickLevel()` and `visibleManip()` for exactly this.

## 7quater. Chained laboratories — one lab per level, never a silent switch

Some types chain two laboratories (`common-divisors`: identical **groups**, then the **divisor
lists** + PGCD box). Found on 2026-09-24 in `qasim-mushtarak-akbar/baqat`: after three tries in
مبتدئ (2 ✓, 5 ✗, 3 ✓) the teams scene was replaced by the lists without a word — the student
reported « another manipulation of PGCD appeared ». The rules, owner-approved:

1. **مبتدئ is one laboratory.** It ends on the gesture that carries the idea, not on a count of
   tries. `common-divisors`: placing the **largest** number of groups that works **and seeing the
   next one fail** (`greatestGroupFound`: 6 then 7 for 12/18, since 2026-09-30 — one lucky drop of
   the answer no longer counts) opens the discovery (« ماذا يمثّل أكبر عدد وضعته؟ » → PGCD). No
   lists at this level. `coprime-explorer` follows the same rule: its groups level ends on the
   groups (all k from 2 to min(a, b) tried, or a k > 1 that works), never on a chained list.
2. **متقدم may chain a second laboratory, but the student opens it.** When the first lab is
   accomplished, a card says what was found and what comes next (`[data-common-next]`, «وجدت أكبر
   عدد ممكن…» + «إلى القائمتين ←»); the second lab offers a way back (`[data-common-back]`),
   and the first lab's state survives the round trip.
3. **A lesson may pin a single lab** (`startWith="lists"`) when its title/lead is about that lab
   only (the textbook's 28/42 example in معارف).
4. **The flow is derived from the level** (`state.level`), never from a lesson flag — so it holds
   in a workspace and behind the standalone selector alike.
5. **Texts follow the stage.** Mission and hints are per stage (`missionGreatestGroups`,
   `groupsHint*` vs `hint2/hint3`), themed words only (no « باقات » in the football theme), and a
   lesson `lead` must not promise a stage its level does not have.
6. **The first lab's rail always contains the answer** (`groupRail` includes the PGCD even
   beyond 24), otherwise « largest found » could be unreachable.

A new chained type follows the same pattern: a pure `…Done(state)` predicate in `logic/`, a
derived `groupsOnly`-style flag from `state.level`, the card + button + back link, and a
`logic.test.js` case proving that the old threshold no longer ends the first lab.

Unit 7 chains by this rule: `affine-meter` (`image|antecedent|classify`, a « التالي » card per stage and numbered tabs back),
`affine-line` (`shift|identify`: the card `[data-al-next-card]` once (d′) is accepted and read at two abscissas, `[data-al-back]`
keeps both labs' states), `line-crossing` (build → probe → `cases`, opened by the student's button after the two lamps lit,
with a way back) and `plan-compare` (`model|compare`, card + button + back).

## 7bis. What a manipulation does NOT do

A manipulation is a learning instrument, not an assessment. Verified in code:

- **It writes nothing.** No localStorage, no API call, no evidence. The only manipulation state
  that outlives a remount is whatever the module holds.
- **`onFinished` is not completion — but it may open a step.** Every shell type fires `onFinished`
  (through `state.report`, so only the lesson's own level ticks the lesson) from an effect when the
  phase reaches `formal`. It never marks a MODULE done, never writes progress and never produces
  evidence. What it may do, and what the unit does in exactly seven places (verified 2026-09-30 —
  qawasim M1 step 1, khawass M1 step 1, bahth M1 steps 1 and 2, bahth M3 steps 1 and 3, awwaliyan
  M1 step 1; the three added on 2026-09-30 are the `d1`/`e1`/`c1` handlers that module comments
  described as gates while they gated nothing), is make the step that
  *comments on the activity* wait until the activity's lab has been done; the other 4AM modules
  use it only to hide a hint line. This is allowed on two conditions, both true today:
  1. the formal phase is **always reachable** by the lesson's numbers — the discovery is reached by
     the gesture (with hints, and « أكمل … » auto-completion for a repetitive gesture, §6bis), and
     the conjecture that follows can be retried without limit, each wrong pick explaining itself
     (`ManipulationDiscovery`); and
  2. the manipulation is the module's **own textbook activity**, opened by default on the level
     that carries it (reachable with one tap on متقدم — the default is always مبتدئ, §7quater).
  Never make a step wait on a manipulation whose discovery the lesson's numbers cannot reach (the
  free lab now refuses such numbers: Euclid when one number divides the other, differences when
  a = b; the factor-pairs rail always includes the first divisor above √n). This is distinct from
  the non-blocking invariant of `LESSON_CONTRACT.md`, which is about *questions*: a question step is
  done when answered, never when answered correctly.
- **Mistakes cost nothing.** A refused drop keeps the object in hand and explains why in Arabic; a
  wrong conjecture is replayable. Attempt counters exist in three logic files (`teamBuilder`,
  `commonDivisors`, `coprime`) and are read by nothing.
- **« الشرح » waits for the discovery.** `ManipulationControls` renders the explanation toggle
  only in the `discover`/`formal` phases (or class mode). The panel and the registry's `shows`
  line state the rule; until 2026-09-30 they were one click away from the first screen
  (audit, defect e).
- **The result is never shown before the gesture that finds it.** The difference and Euclid chains
  print `PGCD(a ; b) = ?` on their last row until the student has placed the PGCD in its box
  (2026-09-29: « أكمل الفروق / القسمات » used to reveal it in one click).

## 7ter. Creating a new manipulation

Ten steps, in this order. Steps 1, 2 and 5 are enforced by tests that fail otherwise.

1. **Declare the type** in `packages/core/curriculum/manipulationTypes.js`:
   `'my-type': { shows: '<the idea it makes visible, in Arabic>', controls: { reset, nextStep,
   prevStep?, toggleExplanation, hideConclusion?, changeNumbers: false | { field: [min, max], … },
   autoComplete?: false | { unlock: 'config' | 'first-gesture' } } }`. Decide `autoComplete`
   with §6bis: only for a repetitive gesture, never for a choice.
2. **Add exactly two levels** to `LEVELS['my-type']` in `levels.js`: `{ beginner, advanced }`,
   each `{ numbers, ref, source }` (plus any per-level prop the type reads, e.g. `candidates`),
   with a one-line comment saying why the advanced one is harder. `advanced` cites the textbook;
   `beginner` may be `source: 'platform'`. `levels.test.js` checks the shape, the bounds and that
   advanced ≠ beginner. Call lesson callbacks through `state.report(onFinished, …)`.
3. **Write the pure logic** in `logic/myType.js`: `init()`, guards `canX() → true | <reason key>`,
   transitions `X()`, and `discoveryReady()`. Arithmetic comes from
   `packages/core/arithmetic/divisibility.js`, never from the component. Add a `describe` block to
   `logic/logic.test.js` on the textbook's numbers.
4. **Write the component** in `divisibility/MyType.jsx`: the five questions in the file header,
   `useManipulation()` for pedagogical state, a local `lab` state re-initialised on
   `[numbers…, state.epoch]`, `useDragInteraction()` for the gesture, and `ManipulationShell` +
   `ManipulationStage` + existing primitives for the rendering. Never re-implement a gesture, a
   tile or a drop zone.
5. **Register the component**: `'my-type': lazy(() => import('./divisibility/MyType'))` in
   `manipulationRegistry.js`. `manipulationRegistry.test.js` asserts the two halves agree.
6. **Add the Arabic strings** to `i18n/locales/ar/lesson.manipulation.json` under `<ns>.*` (read as `lesson:manipulation.<ns>.*` — the file is loaded WITH the lesson, never in the entry bundle: BUNDLE_BOUNDARIES §3 « lesson.manipulation »)
   (title, mission, hints, discovery prompt and options, explanation, and one key per reject
   reason). Never hardcode Arabic in the component.
7. **Declare it as lesson data**: `resources[]` in `lesson.config.js` with
   `{ kind: 'manipulation', code, type, module, title, learningPointIds, sourceElementIds }`, then
   render `<Manipulation type="my-type" … />` in the module's `intro` slot.
8. **Extend the e2e** `manipulations.mjs` with the drag, the tap alternative, the keyboard path,
   reset, and the no-mode-toggle assertion.
9. If the manipulation must **draw a real object**, extend parameterised inline SVG (see
   `primitives/PlayerFigure.jsx`, `KidFigure.jsx`) and put any exact geometry in a pure,
   unit-tested module swept over its whole range (see `logic/bookshelf.js` →
   `bookcaseLayout`, `teamFormation.js`). Never a raster image — root `CLAUDE.md`.
10. **Write the design sheet** of `MANIPULATION_DNA.md` §7 in the header, next to the five
   questions — above all VARIABLE (what the finger controls), RESISTANCE and CONTRAST.

**Reuse before you write.** The ten types of unit 1 are reused across the unit by changing props alone
(`factor-pairs` serves 24, 60, 48 and 105; `common-divisors` serves two lessons — 4 and 5 — with
two themes). Write a new type
only when the mathematical idea or the gesture genuinely differs. There is no standalone type
any more (the books lab joined the shell on 2026-09-30): a drawing that carries the argument
lives INSIDE the shell's stage, and keeps levels, hints, discovery and reset.

## 8. Arabic, RTL, mobile, motion

Interface RTL in Cairo; every numeric block (`dir="ltr"`): tiles, bars, equations, divisions,
chains. `PGCD` stays Latin, as in the textbook. Counted nouns (« 15 رفًّا », « 4 كتب »,
« لاعب واحد ») go through i18next plural keys, never `{{n}} + a fixed plural`:
`ARABIC_RTL_CONTRACT.md`, "Counting nouns". Done for `team-builder` and the shelf; the other
seven types still carry the old strings (audit, defect g). Full RTL rules:
`ARABIC_RTL_CONTRACT.md`. Touch targets ≥ 44 px for controls — the shell's buttons (`Btn` in
`ManipulationTeacherMode.jsx`: إعادة, تلميح, auto-complete, الشرح…) and the free-lab toggle were 40
and 36 px until 2026-09-29 and are 44 px now; note that
`NumberTile size="sm"` — used by most rails — is **40 px**, and the mobile e2e
asserts ≥ 40 px accordingly. Layout works from 320 px:
controls above the stage (they must not move under the finger), vertical composition on phones.
All motion is transform/opacity, and `prefers-reduced-motion` removes it without changing any final
state.

### 8bis. One screen — the whole manipulation is seen without scrolling (owner rule, 2026-10-01, binding on every manipulation)

**The student never scrolls to see or to interact with a manipulation.** The drawn object, every control
that acts on it (stretch handles, ± buttons, drag sources AND their drop targets, the check / claim button)
and the reading it produces (gauge, verdict, the equation line the gesture writes) are visible together in
ONE viewport, with the app chrome (top bar, lesson header). Found by the owner on unit 5
(`pair-scoreboard`, « نشاط 1: 32 عاملا قبل التقاعد وبعده »): with the 32 men and women on screen the x and y
sliders were below the fold, so moving a slider hid the people it moved. It is the lesson-side twin of the
Math Lab's « d'un seul regard » (`MATH_LAB.md` §3.5).

1. **Budget the stage from the viewport, not from the content.** The scene is a CSS size container whose
   height is capped by the viewport (`max-height: calc(100dvh - <chrome>)`, `dvh` so mobile toolbars count);
   countable objects are sized with the scene (`clamp` / container units, the `itemSizeCss` rule of §2bis), so
   32 or 140 figures SHRINK instead of pushing the controls down. Never a fixed pixel size per object.
2. **Controls beside the object they move.** A handle sits next to (or overlaid on the edge of) the figure
   it changes, a drop target is reachable from its source without scrolling, the reading sits beside or
   directly under the figure — never a screen apart.
3. **Secondary material yields — the student chooses what to see (owner rule, same day).** For a large
   activity, two shared tools let the student make the instrument fit and look behind what covers it:
   - **Hide / show** — `primitives/LabFold.jsx` (`<LabFold id="<type>.<block>" title>`): a « إخفاء / إظهار »
     block, open by default, remembered per browser (`sa-lab-fold:<id>`), content kept mounted (`hidden`).
     For SECONDARY material only — trial tables, written lines, legends, explanations — never the object or a
     control that acts on it. The lesson twin of the Math Lab's `LabPanel` (`MATH_LAB.md` §3.5.4).
   - **Move** — `primitives/MovablePanel.jsx` (`<MovablePanel id bounds={sceneRef} title className="absolute …">`
     inside a `relative` scene): a gauge, a counter, a legend or the current line FLOATS on the scene so
     everything fits one screen, and the student drags it elsewhere by its ⠿ handle (pointer, arrows,
     Shift + arrow = large step) when it covers what they want to see; ↺ puts it back. Always clamped entire
     inside the scene (pure geometry `primitives/movablePanel.js`, tested), position remembered per browser
     (`sa-lab-move:<id>`). Moving a panel is NOT a mathematical gesture: it changes no lab state and is never an
     answer (the mathematical gestures stay `useDragInteraction` / `useStretchInteraction`).
   Never place secondary material between an object and its controls. Strings: `lesson.manipulation.json ›
   manipulation.layout.*`. DOM: `[data-lab-fold][data-open]`, `[data-lab-fold-toggle]`,
   `[data-movable-panel]`, `[data-movable-handle]`, `[data-movable-reset]`.
4. **Many objects form a near-square block, never a long strip.** 32 agents are a 6 × 6 office, not a
   2 × 16 column (owner, unit 5): columns ≈ ⌈√n⌉, adjusted to the scene's aspect ratio, the layout computed in the
   type's pure logic and tested (|rows − cols| ≤ 1 for a square scene).
5. **Phones too.** Checked at 1280 × 800, 1366 × 768, 390 × 844 and 320 × 640: on phones the composition
   stacks, but each object keeps its controls in the same sight (side by side columns, or the handle row on
   the scene's edge).
   **Bleed when the frames eat the width (2026-10-14, `digit-cards`).** At 320 px a lesson nests the lab in
   padded frames (≈ 182 px usable): when a grid needs more (7 cells × 40 px for the finger), the glance block
   widens SYMMETRICALLY over those frames as a white card (`margin-inline: -m`, `data-bleed=<m>`), never past
   the screen gutter, computed from the measured width (`need = columns × 40`). Never shrink a cell below 40 px.
6. **Measured, not eyeballed.** The type's e2e asserts, for each viewport and both levels, that once the lab is
   scrolled into view the bounding box of the figure + its controls fits the viewport height
   (`fitsOneScreen` in the unit's e2e); the component header says how the rule is met.

### 8quater. LabCoach — the onboarding of EVERY lab (validated 2026-10-14 on `rank-exchange`; MANDATORY for all manipulations)

**Every manipulation type, at every level, in every lesson of every grade must adopt it** (owner, 2026-10-14) with the SAME design:
the shared `useLabCoach` + `placeBubble`, the same ring, bubble, buttons, switch, strings layout (`<type>.coach.{hide,show,ok,stop,<stepId>}`),
storage keys and DOM contract below — never a look-alike, never a per-lab restyle. Per lab you write only: (1) a pure
`coachOf(state)` in the lab's `logic/` returning `{ id, target, rank?, gesture }`, whose unit test FOLLOWS it to the end of every task
(the lab must be completable by the coach alone) ; (2) the Arabic sentences ; (3) the wiring (`coachText`, toggle under the question,
overlay in the positioned glance). Because a lab used in several lessons shares one storage namespace per TYPE (`sa.labCoach.<type>`), tips
are learned once per type, not per lesson. The `coach` prop is therefore ON by default for adopting labs (`coach = true`; a lab not yet
adopted simply lacks the wiring — tracked by the gate in `LAB_COACH_ROLLOUT.md`).

**In the mission player (owner, 2026-11-09)** the SAME component takes the player's look — no per-lab restyle: `CoachOverlay` reads
`useInMissionPlayer()` and renders a wider bubble (`BUBBLE_W_GAME` 336 px, `data-coach-look="game"`), larger black text, an amber gesture icon, an
amber pulsing ring and a thick « فهمت » button (bottom shadow, like the prediction cards); outside the player nothing changes. Its switch is the
pill « 💡 المرشد » (`toggleIcon`, string `manipulation.coachGuide`), on its own line under the goal line, AND in the side column's top bar
while a question / prediction fills that column (`[data-side-panel-bar]`) — so EVERY lab of a converted lesson always shows it. The three
labs that had no coach got one the same day: `pgcd-differences` (`logic/algorithms.js › differencesCoachOf`: cut → again → pgcd),
`euclidean-algorithm` (`euclidCoachOf`: copy → more → carry → pgcd), `fraction-reduction` (`logic/fraction.js › coachOf`: divide → more →
pgcd; it never says when to stop) — tested in `logic/algorithmsCoach.test.js`; and `coprime-explorer` (`logic/coprime.js › coachOf`: the wrapper → « + »
for the kits, the middle zone → « تحقّق » for the lists, never a chip; `[data-manipulation-check]` marks the check button) on the rollout of 2026-11-09; and `square-root-side` (`logic/squareRootSide.js ›
coachOf`: the handle `[data-root-handle]` → again → « دقّق » (refine) / another graduation → another card (graduation); never a value nor a direction; tested by
FOLLOWING it to the end of both modes in `roots/squareRootPlayer.test.jsx`) on unit 2's rollout; a lab hides its step while a prediction or a question is open.

**Screen pixels vs layer pixels (2026-11-09, owner bug report).** The mission player fits its content with the CSS `zoom` property
(`mission/FitToArea.jsx` — enlarged up to ×1.3 on a big screen, reduced on a small one; Classroom Mode's frame zooms too). `getBoundingClientRect`
and pointer `clientX/Y` are SCREEN pixels, while `left` / `top` / `width` set inside the zoomed content and every geometry a lab computes from
`clientWidth` are LAYER pixels. Any code that turns one into the other divides by the element's scale `rect.width / el.offsetWidth`:
`CoachOverlay` (the ring and bubble were drawn zoomed twice — too big and shifted) and `useStretchInteraction › readPointer` (the factor-pairs
ruler picked 2 for a press on tick 6 at zoom 1.23). Drop zones are found with `elementFromPoint` and the drag ghost is portalled outside the
zoom, so they need nothing. Checked in the browser: ring centred on its target (0 px) on the 11 converted labs at 1837×890, 1920×1080,
1366×768 and 1024×768; ruler ticks 6, 10, 3 land on 6, 10, 3 at zoom 1.23 / 0.87 / 0.86. A new lab that positions something from a measured
rectangle MUST follow the same rule. The ring carries `data-lab-coach-target` (its selector) so a test can compare it with its target.

Goal: the student never wonders « how does this work? » or « what am I supposed to do now? ». `primitives/LabCoach.jsx`
(`useLabCoach({ lab, step, text, labels })` → `{ toggle, overlay, visible }`) + pure `primitives/labCoach.js` (`placeBubble`, storage).
Rules (the contract for any lab that adopts it):

- **Contextual, not a tour.** The lab computes the NEXT useful action as pure data `{ id, target, gesture }` (`target` = a selector of
  the lab's DOM contract; the function is unit-tested by FOLLOWING it until the task ends). `null` ⇒ nothing shown.
- **Shows the button, never the rule** (« discover, don't be told »): one sentence of gesture (« اضغط هنا لتربط 10 أقلام في حزمة »);
  the render test refuses a coach string that states the rule.
- **One tip, once.** A step the student has done (the step changed) or dismissed (« فهمت ») is never shown again, stored in
  `localStorage` `sa.labCoach.<lab>.learned`; a returning student sees nothing.
- **Hidable, and brought back.** « فهمت » (this tip), « إيقاف الإرشاد » (all, persisted `…off`), Escape, and an ALWAYS-VISIBLE switch under
  the question (« إخفاء الإرشاد » ⇄ « أرِني ماذا أفعل »). Storage always under try/catch.
- **Never in the way.** The ring and the layer are `pointer-events: none` (the finger passes through to the real button); the bubble
  sits below or above the target, never on it, clamped inside the lab frame (checked at 1280 / 390 / 320 px); no focus stealing;
  `prefers-reduced-motion` stops the pulse; bubble targets ≥ 40 px.
- **Switchable.** The lab takes a `coach` prop (adopting labs: default true; pass `coach={false}` only for a lab that has no control to find,
  and say why in its header): nothing is rendered and no storage is read when off.

**Wiring for labs built on `ManipulationShell` (batch 1, 2026-10-15 — the divisibility labs; the pattern for the ~60 shell labs).** The lab
calls `useLabCoach` itself (it knows its next gesture) and passes `coach={coachOn ? coach : null}` to the shell, prop `coach` default TRUE:
the shell is `relative`, puts `coach.toggle` right under the mission / lead (`[data-lab-coach-slot]`, before the stage) and `coach.overlay` as its
last child — so a `target` may be ANY control of the frame (header, stage, bottom). Strings live under the lab's own i18n key
(`divisorExplorer`, `bookshelf`, `teamBuilder`, `factorPairs`, `props`, `common` → `.coach.{hide,show,ok,stop,<stepId>}`), storage under the TYPE
(`sa.labCoach.<type>`). Targets reuse the DOM contract the drag kit already writes (`[data-drag-source="<id>"]`, `[data-drop-zone="<id>"]`,
`[data-stretch-handle]`) plus the few markers added for it (`data-shelf-nudge`, `data-fp-nudge`, `data-tb-teams`, `data-group-add`, `data-group-row`;
`NumberTile` now forwards extra props on its `onClick` form).

- **Rules this batch added.** (1) A step whose answer IS the exercise never points at the answer: `common-divisors` lists point at the DROP ZONE
  (middle, then PGCD), never at a token — its unit test follows the coach with an oracle for that decision only. (2) A zone is named by its
  rank (« المنطقة الأولى »), not by the words it already shows (§17.7). (3) When the tip also names the non-drag path (« أو اضغط + »), the ring
  covers the row holding BOTH (`[data-group-row]`) so the bubble never sits on the alternative. (4) The lab's own « اسحب بإصبعك… » hint line is
  silent while the coach is visible (`divisor-explorer`). (5) The discovery question (ManipulationDiscovery) that follows a lab is a plain answer card
  that nothing hides: out of the coach; `coachOf` ends (`null`) when the lab's own goal (the discovery) is earned.
- **`placeBubble({ prefer })` (2026-10-21).** A coach step may carry `prefer: 'above'|'below'` — the side the bubble must take when it fits the visible band (`zero-probe`: above the knob, because the work area unrolls below it). Default (absent): the side with more room, exactly as before. **`noFlip: true`** (same day, `fourth-gauges`; a step field passed to `placeBubble({ noFlip })`, with `prefer`): the bubble keeps ITS side even when that side leaves the visible band — it never flips onto the other side, where the working area lies. Use it only when the other side holds the lab's board / gauges (the bubble can then be partly below the fold, never on the work).
- **`placeBubble({ view })` — always seen (extends LabCoach for ALL labs).** A lab is taller than a phone screen; when the target is off-screen the
  bubble sticks to the visible edge (`view` = the visible band of the frame: below the header, above the bottom nav and, under `lg`, above the
  floating كرّاسي / بطاقتي column), its arrow points toward the target, `data-edge="true"`, and it follows the scroll. A lab entirely off-screen pins
  nothing (several labs share a page). Tested in `primitives/labCoach.test.js`; **verified in the browser at 1280×800 only** — the owner skipped the
  mobile screens for this batch (`QA_MOBILE=1` runs 390 / 320), so the phone placement is unit-tested, not eyeballed.
- Known limit: in `common-divisors` lists the bubble above the middle zone covers part of the 60-list chips (no room below); « فهمت » clears it.

**Student « focus » view (pilot 2026-11-03, `qasim-adad-tabii`; guide §4sexies).** `ManipulationShell` is NOT changed by the
focus view: the lab keeps its title, badge, mission, lead, idle line, coach, stepper, checkpoints, sound and full screen. Only
the page around it is reduced. A lab needs no code for it.

**Mission player (2026-11-04, guide §4septies).** Inside `MissionPlayer`, which is already a full window, `ManipulationShell`
changes two things:
- it does not offer its own « العب بملء الشاشة » (`useInMissionPlayer()`);
- it provides `ManipulationImmersiveContext = true`, so a type that has a game layout uses it.

**The game layout.** When the player's area is at least 900 px wide, the shell lays out in two columns:
- header, controls, hint, result, discovery, explanation and footer in a side column (`data-manipulation-side`);
- the scene (`children`) across the rest of the width (`data-manipulation-scene`).

Outside the player the order is unchanged: the pieces are the same elements (`headerEl` / `controlsEl` / `restEl`). A lab
type that renders the shell sits ABOVE these contexts. It reads `useInMissionPlayer()` / `useMissionArea()`:
- `TeamBuilder` sizes its pitch from the area height (2:3 kept, 150–360 px wide);
- the player fits the rest by `zoom` (labs from 0.6 up to 1.3).

**The mission in big (2026-11-04; reworked 2026-11-07 after a council: no more dark shade).** In the player, ENTERING a lab
(its screen becomes visible, `IntersectionObserver`) shows the mission BIG in its own place, the side column
(`data-manipulation-mission-intro`): the lead in large type, « مهمتك: … » in 2xl, and « هيا نبدأ » (`manipulation.missionGo`). The
scene stays bright and LIVE — never blocked: a first touch on it makes the mission flash (`animate-pulse`), a second touch or
« هيا نبدأ » makes it compact. It never runs on a timer; LabCoach waits until it is compact; it replays when the level changes. The
lab can listen (`onIntroChange`): team-builder waits for it before posing its prediction (one thing to read at a time). The
mission text must describe the REAL gesture of the round: team-builder says « اضغط «أنشئ الفرق» » (`missionButton`) when
`handDone` opens the button from the start, never « اسحب كل لاعب ».

**The slim side column, in the player (council + owner, 2026-11-07).** Once the mission is compact, the lab's side column holds
only what the student needs now (`ManipulationShell`, `gameColumn = inPlayer && !immersed`):
- ONE goal line: the round's context (`lead`, which carries its goal; else the mission), large and bold; a tap reopens the big
  mission (`data-manipulation-goal`, `manipulation.missionReopen`). The title stays for screen readers only;
- « ؟ »: the LabCoach toggle as an icon (`useLabCoach › toggleIcon`), next to the goal line;
- the main action BIG and coloured (`ManipulationControls game`: « أنشئ الفرق » full width), « إعادة » small and apart;
- NOT in the column in the player: the lab's own « الصوت » (the player's top bar has it — same preference, so the « sound switch
  in every lab » rule holds through the top bar), the « مناولة » badge, and the empty « ستظهر هنا… » placeholder (the result
  appears at its place on the first try). Teacher controls (`headerAction`) stay.
- The guide's tip follows the round's real gesture: team-builder's `coachOf({ button: handDone })` points at « أنشئ الفرق »
  in a button round, never at a player to drag.
- A question or a prediction of the lab TAKES the side column (`ManipulationShell sidePanel`, wider: `min(34rem, 40%)`) while it
  is open — never an extra column in the scene: the scene keeps its whole width, the screen stays at TWO columns, the controls
  come back after. The side column is capped as a share of the width (`min(26rem, 30%)`, so a 1024 px screen keeps its pitches).
  `RolesEquation` wraps instead of overflowing.
- **The football lab's scene (council + owner, 2026-11-07, measured at 1848/1366/1024 px):** the teams on ONE row in the player
  (two beyond 7 teams: `repeat(k, minmax(0,1fr))`), each pitch narrowing rather than wrapping — otherwise the lab's height
  depended on the zoom and the screen settled small; the bench BELOW the pitches, full width, in GROUPS OF 5 side by side
  (`data-bench-layout="groups-of-5"`: 42 players = 2 short lines, the remainder read at a glance). A bench beside the pitches
  was tried and measured: it crushed the pitches (31 px at 1024). Pitch height budget: `PLAYER_SCENE_OVERHEAD_SIDE_BENCH` = 330.
- **The free pitch (« الملعب الحرّ ») offers BOUNDED chips** (owner, 2026-11-07): module 1 — players 12–30, teams 2–6; module 2 —
  players 24–48, teams 2–6. Never more than 6 teams on the player's screen (one row of readable pitches), never a bench beyond
  ~2 short lines. The trials table shows the 3 most recent trials in the player, with « (آخر 3 من n تجارب) » when there are more.
- The lab's RESULT (equality, roles, tip) is not squeezed into the column: in the player team-builder renders it IN the scene,
  in the free space beside the teams (`data-tb-result`, the row shared 3:2 with the pitch), and passes `hideRepresentation` to
  the shell. A lab whose scene leaves free width should do the same.

**Questions over the lab, in the player (2026-11-04, owner).**
- **Layout (pilot, 2026-11-07, replaces the full-screen card of 2026-11-04):** in the mission player, `LabCheckpoint`'s card
  renders IN FLOW (no portal, no shade) and the lab places it as a column beside its scene — the scene stays visible, it is the
  evidence. A lab that does this must hide its written result while the questions on it are open (`ManipulationShell`
  `hideRepresentation`). Outside the player it stays over the lab as before. New answer kinds `fill` (chips per blank) and
  `build` (tiles into named slots), see `primitives/labCheckpoint.js`; full rules: guide §4septies « Questions during the lab, v2 ».
- **NO LEAK, for every lab:** a question's confirmation (`explain`) says only ITS answer and never the answer of a LATER
  question of the same chain. Example: team-builder's « كم لاعبًا في كل فريق؟ » confirms « في كل فريق 5 لاعبين », not
  « 15 = 3 × 5 + 0 », which would give away « من بقي » and the equality question.
- **The meaning of each number:** when the full equality is finally built, it is shown with `primitives/RolesEquation`:
  a = b × q + r with the word of the scene under each number (`<type>.roles`, e.g. لاعبًا · فرق · في كل فريق · خارج الفرق).
  The colours are those of `DivisionRoles`, and a zero remainder is green.

**The second chance « لا بأس — جرّب أصغر » (council + owner, 2026-11-08, PILOT `qasim-adad-tabii`).** A round may carry
`easier: { goal, props }`. `roundsModel.needsHelp(round, log)` is true when that round is not won and the lab shows AT LEAST 2
misses (wrong predictions, questions missed on the first try or revealed — `missesOf`) or `maxTrials + 2` splits (5 by default).
One miss is noise: a 3-option question is guessed one time in three. Then `LabRounds` shows a LIGHT card at the bottom of the
pitch (no dark backdrop, nothing in the page moves, `data-round-help="offer"`): « لا بأس 💪 جرّب أوّلًا بلاعبين أقلّ، ثم عُد. » with
« جرّب أصغر » / « أواصل هنا ». The practice round is the same gesture with numbers seen at a glance (`checkpoints: false`, badge
« 🎯 جولة تدريب », `data-round-practice`), it earns NO star, is not on the track, and its events are NOT forwarded to the module
(other numbers than the real round). Won, a card « أحسنت! الآن أنت جاهز. » + « عُد إلى الجولة n » restarts the real round fresh.
A student who succeeds never sees any of it. Lesson data: `content/teams.js › practice(total, groups, choices, exact, lead)`.

**Rounds and stars — `LabRounds` (2026-11-04, owner: « the rounds system instead of the levels, with the stars »).** In
the mission player a lab is played as a PATH of rounds instead of the مبتدئ / متقدم switch the student had to choose:
`lessons/common/manipulations/rounds/LabRounds.jsx`, with its logic in `roundsModel.js` (tested).

- **Data:** `rounds: [{ id, title, props, goal, stars, optional?, free? }]`.
- **Stars (pilot, 2026-11-07):** ★ won · ★ predictions right (`{ tk: 'predict', ok }` events; `stars.predict: false` on a round
  that holds no prediction) · ★ trials ≤ `stars.maxTrials`. « Questions right on the first try » no longer earns a star.
  - `props` go to `<Manipulation>`, which is remounted for each round, so each round gets its own big mission card.
  - `goal` is a list of conditions measured from what the lab REPORTS: `{ checkpoint: 'first' | 'contrast' }` (the question
    set over the lab finished), `{ exact: k }`, `{ allExact: [k…] }`, `{ inexact: true }` (a split leaving someone out seen).
    Added 2026-11-08 for `factor-pairs` (`groups` of a verdict = the number of books per row `d`): `{ checkpoint: 'rule' }`,
    `{ anyExact: true }` (some perfect rectangle seen) and `{ allPairs: n }` (every rectangle of `n` books seen: for each pair
    (s, n ÷ s) one of the two was tried and fell exact). Added for `common-divisors`: `{ above: g }` (a number of groups larger than g tried) —
    `[{ exact: g }, { above: g }]` means « g is the greatest, and it was SEEN » (as `greatestGroupFound`).
    Added 2026-11-09 for `square-root-side` (a verdict per release, `groups` = the graduation 1/g, `exact` = the side landed): `{ bracketed: g }`
    (the side bracketed between two NEIGHBOUR ticks of graduation 1/g, seen) and `{ resists: true }` (a card bracketed at 3 graduations without
    landing) — both fed by the lab's `onTrial { tk: 'bracket', card, scale, resisting }`, logged in `log.brackets`.
    A lab that restarts its scene (« إعادة », other numbers) reports `onTrial { tk: 'reset' }`: `logEvent` empties the round's log, so verdicts,
    predictions and brackets of before never count (first: `square-root-side`, 2026-11-09; the unit-1 labs do not report it yet).
  - `easier` (PILOT, 2026-11-08): a smaller PRACTICE round `{ goal, props }` — see « The second chance » below.
  - `free` marks the free pitch: always open, no goal, never blocking (the « جرّب أعدادك » rule). `optional` marks a challenge.
- **Stars (1–3):**
  - ★ the round is won;
  - ★ its questions were answered right on the FIRST try (no error, no revealed answer);
  - ★ few trials (`stars.maxTrials` splits).
  
  Never a timer: the stars reward thinking, not speed.
- **Persistence:** the best stars per student in `scopedStorage` (`smarter_stars_<lessonId>`: `{ [labId]: { [roundId]: 1..3 } }`).
  Replaying never loses a star. A change fires `sa-stars-changed`; the mission bar and home show the lesson's total ⭐.
- **Unlocking:** a round opens when the previous REQUIRED round is won, and the student resumes at the first required round
  not won. `onRoundWon(id)` lets the module open its steps; rounds won on an earlier visit are announced on arrival.
- **The win card:** stars appear one by one, then « الجولة التالية » / « ابقَ في هذه الجولة ». It comes 2.4 s AFTER the
  success, so the lab's own celebration (`useStepCelebration`, 2.2 s) plays first and the two never overlap.
- **Where it applies:** only inside the player (`PlayerSwitch player={…} page={…}`). The teacher keeps the levels.
- **Example:** lesson `qasim-adad-tabii`, `content/teams.js` (`M1_ROUNDS`, `M2_ROUNDS`).
- **Second example (2026-11-08):** lesson `qawasim-adad-tabii`, `content/books.js` (`M1_ROUNDS`: 24 → 60 → 48 → ⭐ 36 → free; `M2_ROUNDS`:
  105 → ⭐ 84 → free), played by `LabRounds icon="📚"`. The v2 treatment of a lab other than `team-builder` is described in the
  lesson guide § « Rollout recipe » (`FactorPairs`: props `onVerdict`, `handDone`, `chains`, `predict`, `nChoices`, `levels={false}`;
  `PredictTray`; `CHAINS_PLAYER = { first: ['observe', 'build'], rule: ['turned', 'rule'] }`; rectangle cell cap `maxCell`).
- **Third example (2026-11-08):** lesson `khawass-qawasim`, `content/walls.js` (`M1_ROUNDS`: 3 | 18, 12 → cases 2 and 3 as one `sequence` round → 9 | 900, 90 → ⭐ → free),
  `LabRounds icon="🧱"`. `divisor-properties` player props: `onVerdict` (`groups` 1 = ألصق · 2 = انزع · 3 = قِس, +3 per case), `levels`, `handDone`, `chains`,
  `predict`, `choices`, `sequence`; `CHAINS_PLAYER = { sum: ['sumObserve','sumWhole'], diff: ['diffObserve','diffWhole'], rem: ['remObserve','remBuild','rule'] }`.
- **Fourth example (2026-11-08):** lesson `qasim-mushtarak-akbar`, `content/bouquets.js` (`M1_ROUNDS`: 12 and 18 by hand → 90 and 54 with predictions → the lists of
  90 and 54 → ⭐ 60 and 45 → free; `M2_ROUNDS`: the lists of 28 and 42 → ⭐ → free), `LabRounds icon="💐"`. `common-divisors` player props: `onVerdict` (each k
  tried once; in the lists the PGCD placed), `levels`, `handDone`, `chains` (`['groups', 'lists']`), `predict` (`PredictTray`, k ≥ 2, ≤ 2 per round), `choices`
  (`{ a, b }` pairs); one stage per round; `CHAINS_PLAYER = { groupsOnly: ['observe','build','beyondFill','rule'], groups: ['observe','build','beyondFill'],
  lists: ['listCommonFill','listWhy','rule'] }`; while a question is open the scene shows the distribution it speaks of (`cp.qid`).
- **Fifth example (2026-11-09):** lesson `bahth-pgcd`, `content/ribbons.js` (`M1_ROUNDS` for `pgcd-differences`, `M3_ROUNDS` for `euclidean-algorithm`: by hand →
  the activity with predictions → « the same way » → ⭐ → free). Both labs: `onVerdict` = the PGCD placed (`{ groups: v, exact }`, a refused box is a miss),
  `levels`, `handDone`, `chains`, `predict` (at the START of a step), `choices`; `CHAINS_PLAYER = { cuts | divs: ['countFill','build','invariant'], pgcd:
  ['stop','rule'] }`; the chain of steps is the journal in the lab's column.
- **Sixth example (2026-11-09):** lesson `ikhtizal-kasr`, `content/recipes.js` (`M1_ROUNDS`: 12/18 by hand → 84/48 with predictions → ⭐ → free; `M2_ROUNDS`: 84/48
  with the one-step questions → 60/36 → ⭐ 595/560 → free). `fraction-reduction` player props: `onVerdict` (path B; a refused path-B box or a premature claim is a
  miss), `levels`, `chains`, `predict` (before the first division, at the start of path B), `choices` (`{ n, d }`); `CHAINS_PLAYER = { steps:
  ['countFill','build','why'], pgcd: ['oneStep','rule'] }`.
- **Seventh example (2026-11-09):** lesson `awwaliyan-fima-baynahuma`, `content/kits.js` (`M1_ROUNDS`, the kits: 8 and 9 by hand → 17 and 18 with predictions and
  « جرّب كل الإمكانيات » → ⭐ 21 and 28 → free; `M2_ROUNDS`, the lists: 15 and 22 with questions → 35 and 48 with one prediction → ⭐ 51 and 85 → free).
  `coprime-explorer` player props: `onVerdict` (kits: each number tried `{ groups: k, exact }`; lists: each « تحقّق » — conclusive `{ groups: 1 | the common
  placed, exact: true }`, early `{ groups: 0, exact: false }`), `levels`, `handDone`, `chains`, `predict` (kits: before a NEW k ≥ 2, ≤ 2 per round; lists:
  ONCE before the first chip, « هل هما أوليان فيما بينهما؟ »), `choices` (`{ a, b }`); `CHAINS_PLAYER = { groups: ['gWorkFill','gLeftBuild','rule'], lists:
  ['lTestedFill','lCommon','rule'] }` — `gLeftBuild` builds what is LEFT (`n = k × q + r`, the first k ≥ 2 tried, naming the object that has a remainder;
  `n = k × q` with `ops ['=','×']` when a k > 1 works), and the scene shows that k while the question is open (`buildFocus`). The trials journal is
  `GroupTrials`, exported by `CommonDivisors.jsx`. A « coprime » round with no questions is won by « everything tried »: `[{ exact: 1 }, { above: min − 1 }]`
  (a kit is added one at a time, so reaching min(a ; b) passes every k).
- **Eighth example (2026-11-09, unit 2):** lesson `jidhr-tarbii`, `content/squares.js` (`M1_ROUNDS`: 16 by hand → 5 to 0,001 with two predictions → 2,25,
  required → ⭐ 20 to 0,01 → free garden; `M2_ROUNDS`: 0,04 → ⭐ 1,69 → free), `LabRounds icon="🌷"`. `square-root-side` player props (BOTH modes, so lesson 2
  `natiqa-ghayr-natiqa` is content only): `onVerdict` (each release `{ groups: scale, exact }`) and `onTrial { tk: 'bracket', … }` (goals `{ bracketed: g }`,
  `{ resists: true }`), `levels`, `handDone`, `chains` (`['exact', 'never', 'grad']`), `predict` + `predictAt` (refine: the graduations where « هل سيقع طرف
  الضلع بالضبط على تدريجة؟ » is asked before the first release, default `[1, 10]`; graduation: before a card's first release; ≤ 2 per round; the truth is
  COMPUTED — `logic/squareRootSide.js › landsAt` / `landsSomewhere` — and the result is shown when the graduation or card has decided), `choices` (areas
  `{ num, den }`, refine). `CHAINS_PLAYER` (council of 2026-11-09) = exact: `['exSideFill','exBuild']` then `['rule']` — read the side, BUILD
  « area = side × side » (decoy: half the area, or its double when the half IS the side); never: `['nBetweenFill','nSquaresBuild']` then
  `['nDecimalsFill','rule']` — the bracket in one tap, BUILD « 4 < 5 < 9 » (`ops ['<','<']`, decoy the product of the two neighbours, or their sum when the
  product is the area), then COUNT the decimals of c² (2k, last digit never 0: the « never » is SEEN, not told); grad: `['gGradFill','gBuild']` then
  `['gResist','rule']` (graduations written « 1/3 »). In the player the chain follows the TRUTH (`truthKeyOf`: will the side land on an offered graduation?),
  so an exact area bracketed first (0,04 between 0 and 1) opens its « exact » chain when the side lands. While the bracket questions are open the scene
  shows the LOWER square of the bracket; the journal « 📋 جدول تجاربك » (graduation · below · above) is the bracket table, shown in both modes in the player and
  muted during a question. The ruler and the square re-measure on every render and the square takes the height left (`useMissionArea`, overhead 290 px).
  In the player the « never » rule's explanation and the formal block are COMPACT (`discoveryParts({ compact })`: the last bracket and (√a)² = a on one line,
  then the sentence) — the full list of brackets made the question column 580 px in a 555 px area at 1024×768.
- **Ninth example (2026-11-09, unit 2):** lesson `natiqa-ghayr-natiqa`, `content/rulers.js` (`M1_ROUNDS`, GRADUATION mode: 16 and 2 by hand to 1/4 with
  the `grad` chain → 7 and 0,25 to 1/6 with two predictions (« no » then « yes ») → 16/9 and 13 to 1/6, required (« yes » then « no ») → ⭐ 25/13 and 49/36
  to 1/8 → free workshop of the activity's six areas to 1/12; goals `{ checkpoint: 'rule' }` then `{ anyExact } + { resists }`; `easier` rounds on rulers
  to 1/3), `LabRounds icon="🧶"`. What graduation mode added to the lab: in the player `init({ truthful: true })` — `cardStatus` never says « resisting »
  for a card whose side lands on an offered graduation (the ✗ and « لن يسقط على أي تدريجة » stay true; the page keeps its three-graduation rule); the
  rule's explanation is COMPACT (the rule alone — the cards above carry their ✓ / ✗); the journal writes a fraction square plainly, « (5/4)² = 25/16 »
  (`squareLine`, never raw TeX nor « 5/4² »).
- **Tenth example (2026-11-10, unit 2):** lesson `muadalat-x-murabba`, `content/folds.js` (`M1_ROUNDS`: x² = 4, 0, −4 by hand at 1/2 with the table of
  squares and the FULL chain → −9, 0,04, 1,44, 0 at 1/10 with two « كم حلًّا ؟ » predictions (0 then 2) and a tap question on the predicted cards →
  3 and 2,25, required, « هل تقع تدريجة على حلّ ؟ » (no then yes) and one build after √3 → ⭐ 1,21, 7, −0,5, 0 → free line of six cards; goal
  `{ solvedAll: n }` (+ `{ checkpoint: 'rule' }` in r1); `easier` rounds 1, 0, −1 (2, 1 for r3) on the unit line; `M2_ROUNDS`: 9, 5, −1 with the build,
  then a free line), `LabRounds icon="📐"`. What the player added to `square-fold`: **the exact-only pin** — `init({ exactOnly: true })`: a graduation
  next to √a is never accepted as a value (`pin` → verdict `nearTick` « $1{,}7^2 = 2{,}89 \neq 3$ — لا تدريجة تعطي 3 بالضبط »), the exact mark ±√a
  appears between the ticks and the student pins it (`pinExact`, button « ثبّت √3 »); the FIRST nearest-tick try on each side of zero is the intended
  discovery (`free: true`) and is not a trial; `chains` 'full' (one tap per card — the square, the relation, the number of solutions — then at the third
  sign BUILD « x² = a ⇔ x = √a أو x = −√a », its decoy the nearest tick or half of a, and the rule, chain id `'rule'`), 'predicted', 'build', 'none';
  `predict` with `predictCards` / `predictKind` ('count' 2 / 1 / 0, 'tick' yes / no); a refused arrow for a < 0 bounces off the hatched half; `radius`
  shortens the line; a one-line round `mission`. Page and teacher unchanged.
- **Eleventh example (2026-11-10, unit 2):** lesson `amaliyat-judhur`, `content/tilings.js` (`M1_ROUNDS`, mode `product`: 27 by hand with the FULL
  chain — the tile area, the side among three, BUILD « √27 = 3 × √3 » (decoy 9), the rule « √(k²×b) = k×√b » → 32 (2√8 and 4√2) with the bridge
  « √(4 × 8) = √4 × … » → 98, required, with the quotient « √2 = √(98 ÷ …) » → ⭐ 96 with the tile area → free chips 27, 32, 50, 75, 96, 98; goals
  `{ exact: k }` on single-valid cards and `{ discovered: true }` on cards with two valid k > 1; two yes/no predictions « هل يعطي k = … بلاطًا مساحته
  عدد طبيعي؟ » per round, one valid k and one refused k; practice round 8 after three refusals — `helpAfterRefusals: 3`), `LabRounds icon="🧱"`. What
  the player added to `square-tiling` (both modes, so lesson 5 is content only): the FIRST refusal of a round is a free verdict (`free: true` — it
  counts for the goals, never for the « few trials » star); the discovery is the lab's own `discoveryReady`, announced once (`{ tk: 'discovered' }`);
  `chains` 'full' / 'bridge' / 'quotient' / 'area' / 'fullS' (simplest: the largest-k tile's area → BUILD « √n = k × √m » with a smaller-k decoy
  pair → the rule) / 'none'; `predictKind` 'whole' (yes/no per k) or 'smallest' (« which k gives the smallest tile? », the k shown must include a
  refused k above the largest valid one); the tally « ✓ … · ✗ … »; a refusal crossed out in the drawing and written « ✗ » in large with the quotient
  unreduced; NO number of tiles anywhere (k, the tile area and the side only); `choices` for the free round. The content test scans
  `logic › shownValues` — everything a screen can show, built by the same functions as the questions — against the climax's numbers. Page and teacher
  unchanged.

**`team-builder` options (2026-11-04):** `levels={false}` gives a worked example with no مبتدئ / متقدم selector (as for
`divisor-explorer-books`). `handDone` opens « أنشئ الفرق » from the start: the student already shared BY HAND in an
earlier round, and nobody carries 42 or 48 players one by one again (owner, 2026-11-04). Only the first, short round stays
manual. `teamChoices` / `squadChoices` fix the offered numbers; the bounds stay `total ≤ 60` and
`groups ≤ 12`.

### 8quinquies. LabCheckpoint — questions DURING the lab, over the lab (PROTOTYPE 2026-10-28 on `gear-crank`; owner: « if it works, every lab »)

**Why.** A lab's step questions used to live in the module steps BELOW the whole workspace: after task 2 the student did not
see them. The owner's rule: the student must get the idea behind EACH step, so questions follow each step one after another
until the rule, they sit OVER the lab, they stop the student from going to the next step until answered, the student may
redo the same step to find the answer, and the answer is never given on the first attempt.

**Files.** `primitives/labCheckpoint.js` (pure: `readNumber`, `isCorrect`, `submit`, `advance`, `feedbackOf`, `MAX_TRIES = 3`;
tested in `labCheckpoint.test.js`) and `primitives/LabCheckpoint.jsx` (`useLabCheckpoint` + the card + the waiting band). `useLabCheckpoint` returns
`{ blocking, open, done, node, qid }` — `qid` is the id of the question on screen (null when closed), so a lab can draw the scene that question speaks of.
A `build` question may set `ops`, the signs between its slots (default `['=', '×', '+']`; `['=', '+']` for « grand = petit + reste »).
Since 2026-11-10 (unit 9, lesson 2) a `build` may also set `accept` (other fillings that are ALL true — the equality written the other way,
« AC′/AC = AB′/AB » for « AB′/AB = AC′/AC ») and `preset` (tiles already in their slots, e.g. a fixed left side, which the student can take back); a
`fill` field may set `render(value)` to draw its chips in their own shape (a real fraction bar) — the compared value stays the string.

**Behaviour.**
- When the lab's step is reached (`reached`, e.g. `taskDone`), a card covers the lab (backdrop over the `relative` glance
  block, card centred and scrolled into view) with « سؤال i من n », the question (`choice` or `number` — a number answer is
  checked as an EXACT rational, `8/6 = 4/3`, Arabic digits accepted).
- **Twelfth example (2026-11-10, unit 2):** lesson `tawzif-khawass-judhur`, `content/tilings.js` (`M1_ROUNDS`, mode `simplest`, content only on the
  lab of the eleventh example — council option C): 75 by hand with the FULL chain `fullS` (the largest-k tile's area → BUILD « √75 = 5 × √3 » → the
  rule « أكبر بلاط يصلح ← بلاطة لا تُقسَم من جديد ») → 32, the bridge from lesson 4 (`buildS`: BUILD only) → 80, required (`bestS`: the area only) →
  ⭐ 72 (`buildS`) → free chips 27, 32, 54, 63, 75, 80, 96; practice 27. Each round asks « أيّ عدد من البلاطات على الضلع يعطي أصغر بلاطة تصلح؟ »
  (`predictKind: 'smallest'`, three k including a refused k above the largest valid one, the right k moving) THEN a yes/no on one k
  (`predictAlso: [k]`, new — truths alternate across rounds). `avoid` (new) hands the lesson's forbidden numbers to the area decoys
  (`areaOptions(n, k, avoid)` takes the next candidates); `simplestShown(n, …)` (new, pure) lists everything a simplest screen can show WITH its
  role, for the lesson's « forbidden values by role » test (`content/forbidden.js`).
  After its review: `judgedPredictions` (a result is never lost behind the round's question — the lab holds it `PRED_HOLD_MS`); the shared
  `PredictTray` focuses its question on mount, is named by it, numbers « 1 من 2 » (`step`, `of`) and lets a choice carry a spoken name (`aria`).
- **Thirteenth example (2026-11-10, unit 9):** lesson `aksiya-talis`, `content/planks.js` (`M1_ROUNDS`: the ladder 3 / 6 by hand → the X-trestle
  9 / 12 at the teacher's 1/3 → the FREE X-trestle 8 / 12, required → ⭐ 12 / 16 → free bar pairs; practice 2 / 4, 3 / 6 at 1/3, 3 / 6), `LabRounds
  icon="⚖️"`; council of 2026-11-10, verdict L2. What the player added to `parallel-level`: **« ضع الميزان »** (`[data-pl-press]`) — the bubble is
  HIDDEN while the ends move (a « ? » in the vial, a neutral plank), a trial is ONE press of the button (never a release), the same position pressed
  again is not a trial; `onVerdict { groups, exact, free? }` (`logic › verdictOf`: ladder → the rung of B′; X-trestle → the figure 1 / 2 / 3, 0 for a
  ratio the teacher refuses), the first refusal free, `{ tk: 'discovered' }` (`playerDiscovery`: two level planks of different ratios on the ladder;
  figures 1, 2 and 3 on the X-trestle); `ratios` 'show' | 'hide' (round 1: the question asks them) | 'pick' (from round 2 the two chips AB′/AB and
  AC′/AC are picked BEFORE the press is enabled — `logic › chipOptions`: the value, its inverse and, on the ladder, AB′/BB′; on the X-trestle the other
  bar's length instead); `chains` — `ladder` (« lv »: the two ratios of the first level plank in one tap each; « rule »: BUILD « AB′/AB = AC′/AC »
  with AB′/AB pre-placed (`preset`), AC′, AC and the decoy CC′, the swapped equality accepted (`accept`), then the rule), `ladderEasy`, `side`
  (figures 1 and 2: what they share), `cross` (« beyond »: a level plank past A has POSITIVE ratios — chips r, −r, 1/r; « order »: which point lies
  between the other two on each line, then the rule), `none`; `predict` [{ key, at: [bp, cp] }] « هل تتوسّط الفقاعة؟ », the truth from `converse`,
  judged by the first trial of the same configuration (`classOf`) or all when the round's last chain is reached, held `PRED_HOLD_MS`; `choices`
  [[AB, AC]…]; the chips, the side of A, the figure chips, the verdict and the journal « 📋 جدول تجاربك » in the side column (the scene keeps the
  height of the mission area); `LabCoach` (`coachOf`: B′'s handle, C′'s handle, the chips, the button; the journal after two trials with no level
  plank — never a notch). The logic minimum is 2 (`MIN_BAR`); an X-trestle WITHOUT an imposed ratio no longer marks every trial « condition »
  (`kindOf`: figure / order / tilted). `shownValues(props)` lists, with a role, everything a round's screen can show (bars, every notch, every
  drag-reachable ratio, chips and decoys, prediction positions, free pairs) for the lesson's forbidden-values test. Page and teacher unchanged.
  Review of the same day (binding for the next labs): the verdict is announced by an ALWAYS-mounted `sr-only` live region in the stage
  (`[data-pl-verdict-live]`, keyed per trial) because the side column unmounts while a question is open; the visible box is plain text with an
  `aria-hidden` ✓ / ✗ (no glyph inside a translated string); the trial button is `aria-disabled`, never `disabled` (focus stays on it); the verdict
  shown is the trial AT the revealed position (moving away and back shows it again), not `lab.last`.
- **Fourteenth example (2026-11-10, unit 9):** lesson `inshaat-talis`, `content/banner.js` (`M1_ROUNDS`: an 8 cm banner in 3 parts by hand → 11 cm
  in 5 parts AND the contrast → the point of ratio 2/3, required → ⭐ ratio 1/3 → free; practice 6 cm in 2, 6 cm in 3, ratio 1/2 with two marks;
  `M2_ROUNDS`: the ratio 3/2 → free), `LabRounds icon="🧭"`; council of 2026-11-10, verdict L3. What the player added to `segment-divider`: a
  trial stays what it is on the page — a FINISHED construction (equal) or a posed ruler (ratio) — and is reported as `onVerdict { groups, exact,
  free? }` (`logic › verdictOf`: equal → the rank of the mark joined to B; ratio → 1 the point of [AB], 2 the point outside, 0 any other ratio),
  the first refusal free, the same construction redone exactly (`repeatedTrial`) or a ruler posed again (`commitRuler` with `player`) not a trial,
  `{ tk: 'discovered' }` at `discoveryReady`. **`sameUnitOnly`** (default true in the player; `init({ sameUnitOnly })`): a ruler posed on
  graduations of two compass openings is REFUSED as `units` BEFORE any ratio is judged, explained in words (« وحدتان مختلفتان … »), and no ratio
  is ever written for it (verdict, journal, `evidenceOf`, the rule's witness) — two openings give arbitrary ratios. **The cap**: `marks`
  (3 in the rounds) bounds the graduations per rail, so with one unit the reachable ratios are 1/3, 1/2, 2/3, 1, 3/2, 2, 3. `length` defaults to 9
  in the player (10 on the page), and every equal round passes its own. `init({ player })`: joining mark 1 is refused without counting
  (`joinOne` — it was a dead end), a wrong construction shows its bands and openings only, never computed lengths (`vp.count`, `vp.unequal`), a
  question's « أعِد التجربة » is a FULL reset. `chains` — `full` (equal, at the first right construction: « AP_n = ▢ × AP₁ » in one tap, BUILD
  « AM_k/AB = AP_k/AP_n » with AM_k/AB pre-placed, AP_k, AP_n and the decoy P_kP_n, then the rule; ratio: « ranks » at the first right point — the
  ranks of F and E in one tap, then BUILD « AF/BE = MA/MB » with the decoy AB — and « rule » at both points — AM/AB, then the rule), `build` (the
  build alone), `none`; the equality written the other way is accepted (`accept`). `predict` is a list of KEYS (≤ 2): `joinWhich`, `parallels`
  (equal), `opposite`, `same` (ratio); options and truth come from the logic (`predictOptions`, `predictTruth` — « same side » → before A when
  p < q, AFTER B when p > q, computed by `thales.ratioPoint`), judged by the field (`judgedPredictions`), held `PRED_HOLD_MS`. `contrast`: the
  round also wants a second construction (the coach keeps « إنشاء جديد » after the chain). `choices` [{ mode: 'equal', parts, length? } | { mode:
  'ratio', p, q, marks? }] (the free round switches lab through `state.setNumbers`). The figure NAMES what the questions name: marks become P₁ … Pₙ
  and cut points M₁ … once a construction is finished, the ruler ends are F and E. The verdict and the journal « 📋 جدول تجاربك » (a word for
  EVERY verdict kind — `rowWord.*`: a `units` refusal is « وحدتان مختلفتان », not « wrong ») are in the side column; the announcement is an
  always-mounted `sr-only` live region (`[data-sd-verdict-live]`, keyed per trial); the visible verdict is the trial of the CURRENT state
  (`joinAtEnds`; the finished construction), not `lab.last`; every control is frozen during a prediction or a question (`aria-disabled` + a guard
  in `act`, never `disabled`). `LabCoach` (`coachOf`: the dotted mark, the join row, the set-square, « إنشاء جديد »; in ratio mode a dotted mark
  of (d₁), then — both lines graduated — the ruler arrows for F, for E, « a second point? » — never a count, a rank or a side). **A bubble must
  never block the next gesture**: in the player « صِل B بالعلامة », the ruler arrows and « إنشاء جديد » sit in a bar ABOVE the scene
  (`[data-sd-topbar]`; their bubble opens downwards, off the dotted mark to tap and off a finished construction's bands), and a step may be
  `idle: true` — shown only after `COACH_IDLE_MS` (3,5 s) without a gesture (the lab holds it with `idleLab`); walk it WITHOUT pressing « فهمت ». `shownValues(props)` lists by role
  (`length`, `count`, `opening`, `angle`, `rank`, `pair`, `ratio`, `t`, `decoy-ratio`, `decoy-t`) everything a round can show. Page and teacher
  unchanged (`segmentDivider.render.test.jsx` green); one shared fix reaches the page too: the rule question's hints now speak of the lab's own
  mode (`cp.ruleEqual.*` — in equal mode they spoke of the two points of the ratio mode).
- **Fifteenth example (2026-11-10, unit 9):** lesson `talis-hisab-atwal`, `content/shadows.js` (`M1_ROUNDS`: a lamppost of 2,75 m at 14:00 by
  hand → the water tower of 6,5 m at 14:00 THEN 16:00 → a pole of 3,75 m to install at 14:30, required → ⭐ a palm by ratio and a tower by meet at
  15:30 → free; practice: a lamppost of 1,5 m, a pole of 2,25 m), `LabRounds icon="☀️"`; council of 2026-11-10, verdict L1 (L1.1 = C). **A NEW
  lab, not a treatment**: `shadow-meet` (`geometry/ShadowMeet.jsx`, `logic/shadowMeet.js`) is played in the player only; the world `shadow-world`
  stays the page and teacher lab, untouched (guide, « A player-only lab beside a page lab »). One lane: an object too tall to measure, the sun at
  an hour FIXED by the round, a 1 m stick dragged to the centimetre (the 5 cm snap stays in `shadow-world`). Lengths are whole centimetres from
  `shadowWorld.js`'s `K25` (OA = H × k, OB = 100 × k, the meet at BA = OA − OB); the physics is true — before the meet the stick is in the object's
  shade and has NO shadow, after it its shadow overshoots — so the scene, not a text, says where the meet is. **A meet magnet** (10 screen px,
  converted to cm by the scene's scale, the drag only — keyboard and nudges stay exact) and **a stick that never starts at the meet** (it starts
  in the sun, past the shadow's end). No length is written during the drag. Round data: **`steps`** `[{ object, objectName?, height, hour, task?,
  ask? }]` (or the one-step shorthand) — `task` `meet` (default) | `ratio` (the object's shadow is given) | `flag` (the height is known: where
  will the shadow end?), `ask` `null` | `'tap'` / `{ kind: 'tap', decoys: ['segment' | 'additive' | 'shadow'] }` (three chips: the truth, BA ÷ OB,
  the constant gap) | `'type'` (the platform's answer template « H = [ ] m », `templateFor` + `TemplateInput`); objects drawn: `lamp`, `tower`,
  `palm`, `pole`, `minaret`. **A trial is an ANSWER** (`onVerdict { groups: the step, exact }`), never a move; the same wrong answer twice is not
  a trial; the meet of a step that asks nothing is a `free` exact verdict; goals are `{ solvedAll: n }` + one checkpoint per chain. Since
  2026-11-11 (council) round 1 uses `readFigure` (read → **figure**: the scene's décor fades and [AM], [BE], (OM), (OA) are drawn on the
  objects, `Scene figure parallel`, toggle `[data-sm-morph]`; `parallelBuild` tiles + `parallelWhy` → ratio → rule) — guide, « from a scene to
  a figure ». `chains`:
  `read` (« read » at the meet: OB and OA picked among the three lengths, then BUILD « BE/AM = OB/OA » — BE/AM pre-placed, OB, OA and the decoy
  BA, the swapped equality accepted; « rule » once the height is found: ONE sentence among three — no rule text box), `readEasy`, `same` (two
  hours: what did not change — OB/OA), `flag` (« build »: the pole's ratio = the stick's; the INVERTED ratio is a tile — `LabCheckpoint`'s build
  takes `render` to draw a tile as a real fraction), `none`. `predict` is a list of keys asked AT THE HINGE between two steps (`stickSame`,
  `double`; truth computed by `predictTruth`, judged when the next step is met, held `PRED_HOLD_MS`). `choices` `{ heights, hours }` (free round).
  The height question, the prediction and the chain TAKE the side column (`sidePanel` when the game layout is on, above the scene otherwise);
  the verdict is derived from the lab's STATE (met, solved, the last answer of this step), announced by an always-mounted `sr-only` live region
  (`[data-sm-verdict-live]`); ✓ / ✗ are `aria-hidden` glyphs with a hidden word; chips, « تحقّق » and the hour button use `aria-disabled` + a
  guard. The stick's handle sits UNDER the ground line (a 44 px target, a 34 px button): at small scales the stick is shorter than the handle and
  must stay visible. `LabCoach` (`coachOf`: the stick handle → under the chips / the template box → the next-step button; never a place, never a
  number). `shownValues(props)` lists by role (`hour`, `length`, `height`, `decoy-height`, `ratio` — the ratio only when `chains: 'same'` writes
  it) what a round can show. **No person is drawn in this lab**: a child beside the stick would cast a shadow longer than the stick's and the
  picture would lie (the people are in the mission scene). To play it in another lesson: pass `steps`, `chains`, `predict?`, `lead`, `mission`
  and, for a new object, `objectName`.
- **Sixteenth example (2026-11-10, unit 9 — the FIRST synthesis):** lesson `wadiya-idmajiya-talis`, module 7 « وضعية الوحدة », `content/rounds.js`
  (`M7_ROUNDS`, `LabRounds labId="m7-wadiya"`, councils S and C of 2026-11-10). **Two labs in one `LabRounds`**: round `zill` is `shadow-meet` (the
  minaret 7,25 m at 15:00, `ask: null`, **`hideHeight`** — the meet alone; the height is the answer of module 7's step 2, so the scene, the
  journal, the verdict and `shownValues` never write it — and the chain **`why`**: one sentence among three, no number); rounds `r1`, `r2`, ⭐ and
  free are `cone-cylinder` in its **player version** `geometry/ConeCylinderPlayer.jsx` (`ConeCylinder.jsx`'s default export picks it when
  `useInMissionPlayer()`; the page and teacher lab are unchanged). The player rules: **one trial = one press** on « أدخِل الأسطوانة » (h and r are
  set freely, nothing is judged during the gesture, the cylinder stays blue); the verdict touches (green) / leaves a DRAWN gap / pierces (refused,
  hatched, ✗ + a word); **no number, no volume and no point letter** in any verdict or on the drawing (only `H = …`, `R = …`, h, r); the same
  (h ; r) pressed twice is not a trial (the verdict « جرّبتها من قبل » is shown and announced again); `freeFirstRefusal`; an **explicit `n`**
  (`initPlayer` never calls `divisionsFor`: h = r must NOT be on the grid — it stays module 7's equation and the 🏆); **`lockH`** (h fixed: find r)
  and **`lockR`** (a list: r fixed, find h — the reverse task; the next value comes at the next move, so the verdict of the press stays visible);
  `start: { h, r }`. `onVerdict { groups: the h notch, exact, free? }`, goals `{ discovered }` (two touching cylinders of different h + a refusal
  or a gap, `{ tk: 'discovered' }`), `{ exact: i }`, `{ allExact: [...] }`, `{ anyExact }`, checkpoints. `chains`: **`sec`** (at the first
  cylinder that touches: r/R and (H − h)/H picked AS NUMBERS among three unreduced chips — the decoy h/H; `fill` with `render` = a real fraction
  bar), **`r2`** (once the `build` cylinder AND another one touch: BUILD « r/R = □/□ » in numbers — r and R preset, tiles H − h, H and the decoy h —
  then the rule IN WORDS, its decoys « $r + h$ ثابت » and « r/R = h/H » refuted by the student's own cylinders), `none`. `predict`: `part` (« at
  the first notch, a fifth of H: is r a fifth of R? ») and `double` (h doubled from notch 1 to 2: r becomes less than / exactly / more than half),
  asked at the start of the round, judged when those cylinders touch. `choices: { cones: [{ H, R, n }] }`. The journal « 📋 جدول تجاربك » (#, h, r,
  the verdict word; r/R and (H − h)/H after `sec`), an always-mounted `sr-only` live region keyed per press, an `sr-only` scene description,
  `aria-disabled` frozen controls, the r slider `aria-orientation="vertical"`, `LabCoach` (`coachOfPlayer`: h handle → r handle → the press
  button; never a notch). `shownValuesPlayer(props)` lists by role (`cone-H`, `cone-R`, `h`, `r`, `OT`, `ratio`, `value`, `square`). Strings:
  `lesson.manipulation.json › coneCylinderPlayer`. Two page fixes on the way: `discoveryOptionsOf` no longer says that two EQUAL products differ
  (r × h is the same for h and H − h: `dWhyProdSame`), the r handle's pointer maths follows the track's displayed height.
- **Seventeenth example (2026-11-11, unit 3):** lesson `nashr-tabsit`, `content/pitches.js` (`M1_ROUNDS`, `LabRounds labId="m1-pitch"`: `3|x+5`
  in AREAS by hand → `3x-1|3+x` in AREAS → `x-2|2x-1` in terms, required → ⭐ `3x-2|2x-1` → free; practice `2|x+1`, `x-1|x+2`, `x-1|x-2`, each
  `releases`; `M2_ROUNDS`, `m2-pitch`: the platform's `2x-3|x-1`, then free), council of 2026-11-11, verdict L1. The lab `pitch-expansion`
  (`algebra/PitchExpansion.jsx`, `logic/pitchExpansion.js`) gets the v2 treatment in shared code; the page (lesson 2, the synthesis, the teacher,
  Classroom Mode) is unchanged — every new prop defaults to today, frozen by `logic/pitchExpansion.test.js`. **`labels: 'area'`**: the zones, the
  Descartes cells and the tray chips show the zone's AREA at the x on screen (a NUMBER; a removed zone negative, hatched and marked ✂, its name
  « مقتطعة n »), the sides keep their letter terms, merging is off — so the BUILD that writes the letter terms is not a copy. One pure function,
  `logic › zoneText(term, x, labels)`, serves the three places. **Area collisions**: `areaCollisions(expr, x)` = two zones of DIFFERENT degree with
  the same area (27, 27, −3, −3 at x = 3 for (3x − 1)(3 + x)); `playerXs({ expr, span, labels })` removes them in area mode (an edge collision
  shrinks the ruler, an inner one is skipped: the ruler snaps past it — at a tie under the finger it KEEPS the shown value, the keyboard and ±
  jump in the step's direction, the release commits the shown value), `startXOf` (an explicit `start` if reachable). A logic test sweeps every
  reachable x of every area-mode round. **A trial** is a press on « تحقّق »: `onVerdict { groups: x, exact }` (`verdictOf`), the same x with the
  same tray (`trial.sig = trayKey`) is not a trial and re-announces its verdict, the round's first refusal is `free`; a merge refusal (`notLike`) is a
  notice, never a verdict; an empty tray says « احمل منطقة… أوّلًا ». **The sweep « جرّب كل الإمكانيات » is hidden in the player** (verdict X1).
  `chains`: `dist` (at the first verified x « area » + BUILD k(a + b) = ▢ + ▢ — one slot per zone named by its two sides « 3 × x », the decoy =
  the term NOT multiplied — then at discovery the rule `rulePlayer`, whose right option gives the geometric reason « لأنّ الملعب يُقطع إلى المناطق
  نفسها مهما كان x », `player.rule.*`), `double` (BUILD the four zones, decoy = the removed zone ADDED, negative tiles drawn in parentheses; the
  rule), `restored` (`corner`: why the doubly hatched corner counts +; at discovery the page's `result`), `result`, `distEasy` / `doubleEasy` /
  `restoredEasy`, `none`. In the player the teacher's checkpoint switch does not cut the chains (they ARE the round's goals). `predict`:
  `unhatched` (« المنطقتان غير المخطّطتين وحدهما تكفيان؟ », judged by a check with exactly those zones), `otherX` (judged at the second x),
  `termsLeft` (options n − 1, n, n + 1, judged when reduced); the object is ringed (amber-700) while the prediction is open. `choices`: exprs.
  Journal « 📋 جدول تجاربك » (x · مساحة الملعب · مجموع المناطق · « صحيحة » / « ناقصة »), an always-mounted `sr-only` live region
  (`[data-pe-verdict-live]`), ✓/✗ `aria-hidden`, « تحقّق » and ± with `aria-disabled` + a guard, zone names that say « مقتطعة » / « مقتطعة
  مرّتين » / « لم تُحمل بعد », unique SVG pattern ids. `LabCoach` (`coachOf`: an unhatched zone → the next → « تحقّق » → after a refusal the
  framed zone still to carry → a chip to merge → the ruler after one verified x). `shownValues(props)` lists by role (`x`, `side`, `area`, `sum` —
  every subset sum —, `factor`, `term` — partial merges and tiles —, `expansion`, `decoy`). Lead and mission strings of a round are rendered with
  `MathText` in the player (letters in `$…$`). Strings: `lesson.manipulation.json › pitchExpansion.player`, `pred`, `coach`, `cp.build`,
  `cp.build4`, `cp.corner`, `cp.player`.
- **Seventeenth example, continued (lesson 2, 2026-11-11):** lesson `mutatabiqat-shahira`, `content/squares.js` (`M1_ROUNDS`, `LabRounds
  labId="lab-square"`: `x+4` in AREAS with merging off (x 1–6 without 4, start 3 — the two strips show TWIN numbers, allowed by `areaCollisions`
  because they are the same kind) → `x-5` in terms (x 6–11, start 9, side 4) → `2x-1` required → ⭐ `2x+5` → free; practice `x+2` (area, without
  2), `x-2` (start 6), `2x+1`; `M2_ROUNDS`, `lab-sumdiff`: `x+4|x-4` (start 7) → ⭐ `3x+4|3x-4` → free), verdict L2.1–L2.7. Added to the same lab,
  nothing of lesson 1 changed (`logic/pitchExpansionSquares.test.js`, `algebra/pitchExpansionSquaresPlayer.test.jsx`): chains `square` (at the
  first verified x `stripFill` « كم شريطًا؟ / مساحة كل شريط » ; at discovery `identityBuild` + `rulePlayer`), `squareDiff` (`cornerFill` on the
  round's numbers — 2 times, +25 — never the sentence « cut twice, added once »), `sumDiff` (`cancelFill`: +4x and −4x make 0), `coef`
  (`coefBuild` in NUMBERS, decoy 2x² — the coefficient not squared), and their practice chains. `identityBuild` is in LETTERS (`identityParts`:
  one decoy per kind — `ab`, `−b²`, `+b²`; `a²` preset; the other order of the two last terms accepted) and, while it is open, the field's
  sides and the Descartes headers RELABEL `a` / `b` / `−b`. Signs live in the tiles (the hidden `ops` are empty). Predictions `claim`
  (« مساحة الملعب x² − 25 ؟ », truth by `samePolynomial`, the whole field ringed), `twice` (the cross-hatched corner ringed, named by its value),
  `noX`. A merge that CANCELS two terms leaves a visible « 0 » chip (L2.4: the merge is the cut). The coach on a square of a sum points at the
  two SQUARES first (the round asks whether they suffice; the strips light up at the free refusal). `shownValues` also lists the questions'
  options and the predicted claim at every x. Strings: `pitchExpansion.player.zeroChip`, `player.explanationIdentity`, `player.rule.sq*`,
  `pred.claim/twice/noX`, `cp.strip/cornerFill/cancel/identity/coef`. Scene `stands-pitch` (`StandsPitchScene.jsx`, the corner never highlighted).
- **Eighteenth example (2026-11-11, unit 3):** lesson `tahlil-ibara`, `content/turf.js` (`M1_ROUNDS`, `LabRounds labId="lab-turf-m1"`: rows
  `8x+6` by hand → rows `6x^2+2x` (the book's `6x^2+4x` replaced, verdict L3) → the square `x^2+6x+9`, required → ⭐ the square `x^2+8x+16` →
  free; practice `4x+2`, `2x^2+4x`, `x^2+2x+1`; `M2_ROUNDS`, `lab-turf-m2`: `x^2+25` then free), council of 2026-11-11, verdict L3. The lab
  `turf-factoring` (`algebra/TurfFactoring.jsx`, `logic/turfFactoring.js`) gets the v2 treatment in shared code, page and teacher unchanged.
  **A trial** is a NEW r committed (rows) or a NEW split closed (square): `onVerdict { groups: r | strips on the right, exact }` (`verdictOf`),
  r = 1 is NOT a trial (one row always holds everything), the same r / split twice re-announces its verdict but is not counted (a repeated refusal
  never opens « جرّب أصغر »), the round's first refusal is `free`. **The sweep « جرّب كل الإمكانيات » and the hints are hidden in the player**
  (verdict X1). **What the round asks, the lab does not print**: the height chip says « ? », the verdict has no equality, the corner reading is
  hidden while a chain is open or to come (`hideAnswer`). `chains`: rows `build` (at the gcd: « في كل صفّ: ▢ » one tap — `rowFillParts` — then
  BUILD « ka + kb = ▢(▢ + ▢) », the decoy = the LAST TERM NOT DIVIDED, `buildFactorParts`, the swapped bracket accepted), rows `full`
  (« ارتفاع الملعب كاملًا = ▢ » with the chips g / x / gx — `heightFillParts` —, the BUILD, then the RULE whose right option gives the tiling
  reason « لأنّ القطع تُرصّ صفوفًا دون أن يبقى شيء », `player.rOpt1`), square `full` (`corner` of the student's refused split, BUILD
  « (▢ + ▢)² » with the decoy c — `buildSquareParts` —, the rule `player.sOpt1`), and for a square that never closes (`x^2 + c` without strips)
  `outside` → `why` → the rule; `none`. Builds use `LabCheckpoint`'s new **`wrap: [before, after]`**. `predict`: rows `rowHeight` (1, g, x)
  and `maxRows` (the biggest count, g, 1), square `sideStrips` (b/2, b, c) and `closes` (yes (x + √c)², no, yes if spread), the field ringed while
  a prediction is open, judged by the terrain (`judgedPredictions`). `choices`: `[{ mode: 'rows', expr } | { mode: 'square', b, c }]` (the mode
  travels with the numbers in the player). Rows mode draws and refuses NEGATIVE counts (hatched tiles; `9x^2-6x = 3x(3x - 2)`, proved by
  `logic/turfFactoring.test.js`). **No scroll**: the field is ONE `data-paging-keep` block scaled by the scene's width AND the player area's height
  (`rowsBox(lab, r)`, `squareBox(lab)`), the page's `overflow-x-auto` is gone in the player. The controls « − r = n + » sit ABOVE the ruler in the
  player (`[data-turf-topbar]`; the coach bubble « انظر ماذا أضاء » over the refused pieces must not cover them). Journal « 📋 جدول تجاربك »
  (rows: r and « يصلح » / « مرفوض: قطع خارج الملعب » — never « خطأ »; square: right, bottom, « أُغلق » / « مرفوض »), an always-mounted `sr-only`
  live region keyed per gesture (`[data-turf-verdict-live]`), ✓/✗ `aria-hidden` with a hidden « صحيح. » / « مرفوض. », − / + / « أغلق الملعب » /
  « أعد فتح الملعب » with `aria-disabled` + a guard, indigo focus rings, the close button white on emerald-700. `LabCoach` (`coachOf`: the handle →
  after a FIRST refusal a neutral « انظر ماذا أضاء » on the pieces left outside → « جرّب عددًا آخر من الصفوف » (never « أكبر »); square: the stock
  → « أغلق الملعب » → « انظر ماذا أضاء » on the corner → move a strip; closed → « أعد فتح الملعب »). `shownValues(props)` lists by role (`count`,
  `pair`, `tick`, `common`, `inner`, `perRow`, `eq`, `leftover`, `chip`, `tile`, `decoy-inner`, `decoy-eq`, `corner`, `extra`, `option`).
  Strings: `lesson.manipulation.json › turfFactoring.player`, `vp`, `coach`, `predict`, `rowWord`, `journal`, `col*`, `choicesLabel`.
- **Nineteenth example (2026-11-11, unit 4):** lesson `muadala-ula`, `content/balances.js` (`M1_ROUNDS`, `LabRounds labId="lab-balance-m1"`:
  `2x+3=11` by hand → `4x+3=-9` (balloons pull up) → `3x-2=10`, required → ⭐ → free; `M2_ROUNDS`, `lab-balance-m2`: `4x+3=6x` → `4x+1=x+8` → ⭐ →
  free; each with an `easier`), council of 2026-11-11, verdict L1. The lab `equation-balance` gets a **PLAYER VERSION**
  `equations/EquationBalancePlayer.jsx`, chosen by `EquationBalance.jsx` in the player; the page (`EquationBalancePage`, teacher, Classroom Mode)
  is byte-identical, its drawing shared through `equationBalanceParts.jsx`; `logic/equationBalance.js` is untouched, the player logic is
  `logic/equationBalancePlayer.js`. Props: `eq`, `lead`, `mission`, `onVerdict`, `chains` (`r1` · `r2` · `r3` · `m2r1` · `m2r2` · `none` —
  `CHAIN_SPECS`: observe in one tap (`lineChips` / `placedChips`), BUILD « ▢ = ▢ » with ONE decoy per round (`lineBuild`: 11, −6, 8, 10x, 9),
  read a bag (`readOptions`), the RULE), `predict` (≤ 2 keys asked before the first gesture — `bagHolds`, `parts`, `otherPanDo`, `bagsLeft`, `whole`; options and
  truth from the logic, judged by the balance), `choices` (equations for the free round), `kinds` (the reserve: ball, balloon, bag), `handDone`
  (quantity chips « 1 · 2 · 3 · 4 »: a drop applies the gesture n times on a DRAFT and is refused WHOLE if one step is; the page keeps one object
  per drop), `coach`. **A trial** is a NEW equation written (a both-pans step or a split whose result was not already written in the round) or a
  REFUSED gesture (`REFUSALS`: `tipped`, `moveAcross`, `bagsUneven`, `cutMixed`, `noBags`); the same refusal twice in the same state, « noneHere »
  and « full » are not trials; the round's first refusal is `free`. `onVerdict { groups: line n°, exact: true }` / `{ groups: 0, exact: false, free? }`;
  the discovery (a bag read AND the bags opened) once as `{ tk: 'discovered' }`. The beam states a FACT (« الكفّة اليمنى أثقل الآن »), never the
  rule; the lab title is not shown; no bubble over the tipped beam (it covered the next control at 1024 — the side-column verdict states it).
  Journal « 📋 جدول تجاربك », an always-mounted live region, controls `aria-disabled` during a prediction or a question, NO scroll (the scene is
  bounded by the lab's width AND the player area's height). `LabCoach` (`coachOf`: `grab`, `beam`, `parts`, `keep`, `open`, `reserve`, `qty`;
  anchors `[data-coach]`) — the lab's FIRST coach, player only. `shownValues(props)` lists by role for `content/forbidden.js`. Strings
  `lesson.manipulation.json › equationBalance.player / coach / predict`. Scene `locker-balance`.
- **Twentieth example (2026-11-11, unit 4):** lesson `jidaa-maadum`, `content/pitch.js` (`M1_ROUNDS`, `LabRounds labId="lab-vanish-m1"`: `2(x-3)`
  → `(x-1)(x+4)` → `2x(x+2)` on [−3 ; 1] start 1 → free; `M2_ROUNDS`, `lab-vanish-m2`: the COVERED `(2x-3)(x+1)` on a halves ruler start 2,
  required → the square `(x+1)^2`; easier rounds, 6 free choices), verdict L2. `vanishing-pitch` (`equations/VanishingPitch.jsx`) gets the v2
  treatment behind `useInMissionPlayer()`; the page is unchanged (`logic/vanishingPitch.js › init({ startX, range })` and `defaultV`/`startV`
  change nothing without them). New props: `startX`, `range` (they travel with the expression, so a free round changes pitch), `onVerdict`,
  `chains` (`build`: on a constant side « which side · how much is the other · BUILD « ▢ = 0 ⇒ x = ▢ » », otherwise BUILD « x = ▢ أو x = ▢ »;
  `rule`: which side · BUILD « ▢ = 0 ▢ ▢ = 0 » with the TEXT tile « أو » and the decoy « معًا » · the RULE; `count`: the square — which side · how
  many solutions; `none`), `predict` (≤ 2 of `count`, `atZero`, `zeroB`, judged by the pitch — `judgedPredictions`), `choices` (`[{ expr, startX }]`),
  **`covered`** (the pitch is MASKED — a tarp with « ? »; only an x already judged, pinned or refused, is shown, `isCovered`; the readouts show the
  expressions, the values « ? »), `freeRefusal` (the round's FIRST refusal is free: M1 r1 and the covered round), `coachPin`, `coach`. **A trial** =
  pinning a NEW x (`isNewPin` → `pinVerdict`) or « لا قيم أخرى » while a zero is missing (once per set of pins, `claimVerdict`); moving x, re-pinning
  a judged x (its verdict re-announced), `notSwept` and the accepted claim are not trials; no refusal is required. Discovery (every zero pinned +
  the claim accepted) once as `{ tk: 'discovered' }`. « جرّب كل الإمكانيات », hints and levels hidden; no celebration. Readouts and the two
  buttons in a column BESIDE the pitch; the rule question has 3 options (fits 1024 × 768). Journal (x · A · B · area · the verdict WORD), live
  region keyed per gesture, `aria-disabled` + guard, `LabCoach` (`coachOf`), the pitch ONE `data-paging-keep` block scaled by width and height.
  Builds from `buildConstParts` / `buildOrParts` / `buildSolParts`, `whichParts`, `restParts`. Strings `vanishingPitch.player / coach / predict`.
  Scene `pitch-planner`.
- **Twenty-first example (2026-11-11, unit 4):** lesson `mutarajiha-ula`, `content/rays.js` (`M1_ROUNDS`, `LabRounds labId="lab-ray-m1"`: pens
  `6x+20<=80` → reading `15x+25>100` → ⭐ `4x-5<11` → free, whole numbers; `M2_ROUNDS`, `lab-ray-m2`: `x<4` then `x<=4` in ONE round → `2x+7<=9`
  → `-2x+7<=5` → ⭐ `4x-3>6x+2` → free, relative numbers), verdict L3. `solution-ray` (`equations/SolutionRay.jsx`) gets a player branch behind
  `useInMissionPlayer()` (page JSX unchanged); `logic/solutionRay.js` only gains an optional `cardsFor(I, divide)` argument; the player logic is
  `logic/solutionRayPlayer.js`. New props: `onVerdict`, `chains` (`cost`: `costFill` → BUILD the inequality; `rule`: `edgeFill` → `buildIneq`
  → `ruleRegion`; `bracket`: on the last case `boundFill` → `ruleBracket`; `pos`: at the division stage `buildDiv`; `neg`: `divFill` → `buildDiv`
  → `ruleDir`; `none`), `predict` (`isSol:<n>`, `redSide`), `choices`, `start` (the probe's opening point), **`sequence`** (two cases played in one
  round, e.g. `x<4` then `x<=4`), `sides` (`{ left, right }` labels such as « الكلفة / الرصيد »), **`divide: 'coef'`** (the last step — dividing by
  the coefficient — is BUILT with tiles, the number tile given, the DIRECTION the discovery; a wrong build is refuted with the student's OWN red
  points and is a question miss, not a counted trial), `handDone`, `coach`. **The verdict is MASKED while the probe is dragged** (a render mask,
  L3.2); each round starts on an explicit press. **A trial** (`solutionRayPlayer.js`): without a bracket a NEW graduation released; with one,
  « ثبّت » on a NEW draft or a NEW line chosen for a step (probes are free — they are the student's evidence). Journal, live region once per gesture,
  hollow grey traces + ●/○ (not colour alone), labelled toggle groups, LTR-isolated numbers, indigo focus rings — player only. `LabCoach`
  (`coachOf`: `probe`, `again`, `bracket`, `side`, `toward`, `fix`, `card`, `line`; never « between a red and a grey point ») — the lab's FIRST
  coach. `shownValues(props)` by role. Strings `solutionRay.player / coach / predict`. Scene `phone-credit` (no phone inside a round before the
  climax: `context: 'phone'` is unused in the rounds).
- **Twenty-second example (2026-11-11, unit 4):** lesson `tarrid-mushkila`, `content/race.js` (`M1_ROUNDS`, `LabRounds labId="lab-race-m1"`: a
  father of 52 and children 7 · 8 · 10 · 12 → 26 and 2, × 4 → sisters 13 + 10 → 31 → ⭐ 55 against 11 · 12 → free; `M2_ROUNDS`, `lab-race-m2`:
  brothers 11 + 13 → 18, x = −3, required; easier rounds each `releases`), verdict L4. `growth-race` (`equations/GrowthRace.jsx`) gets the player
  behind `useInMissionPlayer()`; page, teacher and the synthesis's `lab.render.test.jsx` unchanged; `logic/growthRace.js` unchanged, the player
  logic is `logic/growthRacePlayer.js`. New props: `onVerdict` (one NEW x = one verdict), `chains` (`CHAINS_PLAYER`: `sum4` build `slopeTap` ·
  `buildEq`, race `whereTap`; `mult` build `buildEq`, race `whereTap` · `afterTap` · `ruleP`; `sum2`; `easy`; `past` race `trendTap` · `solveTap` ·
  `buildPast` (« منذ ▢ سنوات: ▢ + ▢ = 18 », one decoy = the younger's age |x| years LATER, `pastSpec`) · `rulePast`; `none`), `predict`
  (`cards`, `ahead`, `meets` — truth computed, judged by the gesture that settles it), `choices`, `startX`, **`cast`** (`{ adults, girls }`: people
  drawn as the shared `KidFigure` — girls in hijab, the father 1.25 × the tallest child, `tunic`, teal, « الأب »; the page keeps `PersonFigure`),
  **`decor="board"`** (a height board instead of the cake, player only), **`freeFirstModel`** (the first refused model is free), `coach`. **A model
  check is NOT a trial of x**: « تحقّق » on the cards sends `onTrial { tk: 'model', ok, key, free? }` (`modelKey` = the sorted carried cards — the
  same set checked twice is one event), the round's goal holds `{ modelOk: true }` (`rounds/roundsModel.js`, guide « A model check is not a
  trial »). The model BUILD (`buildSpec`: « ▢ = ▢ + ▢ » or « ▢ + ▢ = ▢ ») has ONE decoy — « + x » once, or the target that « ages ». Questions and
  predictions in the side column, journal, live region (« صحيح. » / « خطأ. » + the relation), sweep / stepper / celebration hidden. `LabCoach`
  (`coachOf`: `carry`, `check`, `open`, `stretch`, `again`) — the lab's FIRST coach. `shownValues` by role (ages, values, totals, screens, the meet,
  the first value, equations, the structure `three` / `factor3` that the climax owns). Strings `growthRace.player / coach / predict`. Scene
  `family-heights`.
- **Twenty-third example (2026-11-12, unit 5):** lesson `mafhum-jumla`, `content/pairs.js` (`M1_ROUNDS`, `LabRounds labId="lab-pair-m1"`:
  `x+y=7|3x+y=17` values → `x+y=9|50x+20y=300` values, three gauge-1 pairs, the swap → `x+y=13|3x+y=29` COVERED, required → ⭐ `x-y=4|x+2y=1` →
  free; `M2_ROUNDS`, `lab-pair-m2` (owner OQ1, module 2 has no other lab): `x+y=6|50x+50y=280` (never together) → `x+y=6|50x+50y=300` (always
  together); easier rounds each `releases`), verdict L1. `pair-scoreboard` gets a **PLAYER VERSION** `systems/PairScoreboardPlayer.jsx` behind a
  4-line dispatcher (`PairScoreboard.jsx` default export: `useInMissionPlayer()` → player | `PairScoreboardPage`, the page JSX untouched;
  `MatchCard`, `Coin`, `ValueBar`, `Deco` exported for the player); pure logic `logic/pairScoreboardPlayer.js`. Props: `system`, `start` (explicit,
  never a trial), `readings` (`values` | `lines`), `covered`, `free` (`gauge1x3` — the first three gauge-1 pairs —, or the first refusal / the
  pairs a goal requires), `discover` (`contrast` · `many` · `covered` · `gauge1x3`), `chains` (`CHAIN_SPECS`: `season` « which gauge » + BUILD
  « 17 = 3 × 5 + 2 » (decoy 15); `coins` BUILD « 50x + 20y = 300 » (decoy 330) + the rule, after the swap; `covered` read 29 · 13 · 24, then
  « why refused » only if a full-season claim was refused; `never` / `always` one tap; `none`), `predict` (`manyFirst` asked at the start,
  `swapSol` AT the accepted claim — `predictWhen`), `counter` (« n من 3 »), `swap`, `nouns`, `choices` + `choiceSpec`, `coach`, `onVerdict`,
  `onTrial`. **The gauges are MASKED while dragging** (and while a keyboard value is unsettled — `data-masked`, « player.masked »): a commit is
  the only way to read them (verdict L1.2, the `solution-ray` precedent). **A trial** = a NEW committed pair; a refused claim counts once per
  pair; in the covered round only claims count, the first refusal is free. The world is drawn as a STRIP (`stripGrid`: 1–4 rows, the largest
  cell that fits the width and the mission area's height). **A ruler's value is read on the track's rect at gesture time; a ruler never takes a
  fixed width from its container** (the track is `flex-1 min-w-0`, measured by `ResizeObserver`). Journal « جدول تجاربك » (العددان · (1) · (2) ·
  الحكم: تجربة / قبول / رفض / قلب; « مغطّاة » until claimed). `LabCoach` (`coachOf`: `handleX` → `handleY` → `gauge1` after the first trial →
  `claim` / `swap`, `reveal` in the covered round; bubbles above — below they covered the next ruler) — the lab's FIRST coach, player only.
  `shownValues(props)` by role. Strings `pairScoreboard.player / coach / predict` (player nouns say « دج »). Scene `civil-registry`.
- **Twenty-fourth example (2026-11-12, unit 5):** lesson `hall-jabri`, `content/cards.js` (`M1_ROUNDS`, `LabRounds labId="lab-cards-m1"`:
  `x+y=8|x-y=2` one method → `2x+y=11|3x-y=4` both methods → `2x+3y=14|x-y=2` both methods, required → ⭐ `4x+3y=5|3x-2y=8` → free; easier rounds
  one method, no question, each `releases`), verdict L2. `<Manipulation type="elimination-cards" system="2x+y=11|3x-y=4" methods={2} chains="r2"
  predict={['vanish','samePair']} levels={false} />` renders in the player `systems/EliminationCardsPlayer.jsx`, chosen by a 4-line dispatcher
  (`EliminationCards.jsx` → player | `EliminationCardsPage`, page unchanged, `Tile` exported); `logic/eliminationCards.js` untouched, the player
  logic is `logic/eliminationCardsPlayer.js`. Props: `system`, `methods` (1 | 2: the round's discovery `{ tk: 'discovered' }` when that many
  methods gave the SAME pair), `chains` (`r1` · `r2` · `r3` · `none`), `predict` (`vanish`, `multiplier` before the first gesture; `samePair` when
  the first method is done), `choices` (free round), `coach`, `onVerdict`, `onTrial`. **A trial** (`trialOf`) = a substitution, a stack or a value
  carried back that writes a NEW line (per method), or a counted refusal (`REFUSALS`: `sameCard`, `wrongUnknown`, `noCancel`, `both`); the
  first counted refusal is free; isolating, × k, « السطر التالي » and UI guards are not trials. Chains (`CHAIN_SPECS`): `build` (r1) or
  `build-sub` / `build-add` (r2, r3) at the one-unknown stage — BUILD « ▢ = ▢ » whose decoy is chosen by the student's PATH (`buildSpec`:
  `signLost`, `oneSide`, `noBracket`, `transposition`), so the error the lesson forbids before its climax (rule P, verdict X11) is never offered on
  that path; `pair` with the pair MASKED until answered; `rule` (r2) / `choose` (r3) after both methods; `see` (r1 only, `seeSpec`). Layout: the
  two cards STACKED one per row (side by side the x tiles of (1) covered the value of (2) at 1024), a drawer, the current line in a `FitLine`;
  journal « 📋 جدول تجاربك » (# · method · line · result word); an always-mounted `role="status"`; the cards grid `role="group"`; controls
  `aria-disabled` + guard while a prediction or a question is open; no stepper, no celebration, no kiosk decor. `LabCoach` (`coachOf`: `start`,
  `carry`, `scale` on the refused card, `next`, `other`; NO bubble at the value-carrying stage — it covered the chip) — the lab's FIRST coach,
  player only. `shownValues` by role. Strings `eliminationCards.player / coach / predict`. Scene `kiosk-cards`.
- **Twenty-fifth example (2026-11-12, unit 5):** lesson `mushkilat-jumla`, `content/stories.js` (`M1_ROUNDS`, `LabRounds labId="lab-story-m1"`:
  r1 `x+y=12|70x+20y=440` count + money, by hand → r2 `2x+y=230|x+2y=190` money + money with a silent useless chip → ⭐ → free; `M2_ROUNDS`,
  `lab-story-m2`: p1 `x+y=15|1100x+700y=17700` → (18 ; −3), the story REFUSES → free (a fractional story among them); easier rounds each
  `releases`), verdict L3. `story-modeller` gets a **PLAYER VERSION** `systems/StoryModellerPlayer.jsx` behind a 4-line dispatcher
  (`StoryModeller.jsx` → player | `StoryModellerPage`; the page and the synthesis's frozen render tests untouched); pure logic
  `logic/storyModellerPlayer.js`. Player-only props: `chains` (`CHAIN_SPECS`: `first` solveTyped · buildCheck (« 70 × ▢ + 20 × ▢ = ▢ », decoy the
  COUNT) · answerWhy; `second` solveTyped · verifySwap · buildAnswer (the answer sentence on the wide text slot, decoy the letter) · rule;
  `easyFirst`, `easySecond`; `impossible` naturalTap · refuseTap · ruleNatural; `impossibleEasy`; `none` — one checkpoint id per moment of
  `MOMENTS`: `typed`, `replayOk`, `answerOpen`, `answered`, `refused`), `predict` (`[{ key: 'dearer' | 'which', pos }]`), `items`
  (`{ x: { glyph, color }, y }` drawn as TRAYS of objects — pencil, notebook, pen, ruler, eraser, book, ball, … (`Glyph`); a value that does not
  count draws an empty dashed tray « ✗ لا يُعدّ »; a money + money story draws price tags), `onesPlaced`, `chips[].useless` (refusal reason
  `unused`), `countNoun`, `freeFirstModel`, `choices` (`[{ id, label, props }]` — each story a fresh lab). Events: `onTrial { tk: 'model', ok, key,
  free? }` per new translation (an incomplete one is told, not counted — the `roundsModel` model check of the Twenty-second example), `onVerdict
  { groups: 0, exact }` per new replay (exact = both facts hold, so an impossible story's refusal is exact), `{ tk: 'discovered' }` (the right
  answer sentence or the refusal), `reset`, `retry`, `predict`, checkpoint events. The story card stays on screen at EVERY stage
  (`[data-sm-story]`); verdict, « المرحلة n من 5 » and the journal in the side column; an always-mounted live region; a number inside an Arabic
  verdict is isolated with U+2066 … U+2069 (« -3 » never reads « 3- »). `LabCoach` (`coachOf`, by stage: `letter` / `toModel`, `chip` / `check` /
  `toSolve`, `method` / `half` / `next`, `gate` / `replay`; bubbles below the chips) — the lab's FIRST coach, player only. The props are general
  (any two-fact system, count or money facts, named or not) so the unit's synthesis can reuse the player. `shownValues` by role. Strings
  `storyModeller.player / coach / predict`. Scene `museum-desk`.
  **Reused by the unit's synthesis** (`wadiya-idmajiya-jumal`, 2026-11-12, `LabRounds labId="m7-wadiya"`): two additive chains, `synthTrip`
  (typed `2x = 70`, `verifySwap` — the swapped pair passes the equal-count fact and fails the other — and the answer built) and `synthParty`
  (equal counts → the NUMERICAL build `QUESTIONS.buildSum` « k × (▢ + ▢) = ▢ », helpers `equalRow` / `sumBuild`), glyphs `juice` / `cake`;
  `shownValues` lists the build tiles only for a round that asks `buildSum`. Lesson 3's rounds and the page are unchanged
  (`logic/storyModellerPlayer.synth.test.js`). The page string `formalTitle` no longer names the book (owner OQ5).
- **Blocking:** `cp.blocking` stays true until the chain is finished; the lab hides its « next task » button meanwhile.
- **Guided, never told first:** wrong try 1 → the chosen option's `why` (else hint 1); try 2 → hint 2 (sharper); try 3 →
  the answer AND its explanation (the student is never stuck forever). A wrong option stays struck and disabled.
  A right answer shows `explain`, then « السؤال التالي » / « تابع ».
- **Redo the step:** « انظر إلى المختبر » folds the card (the lab stays frozen, the counters readable); « أعِد التجربة » folds
  it AND calls `onRetry` (the lab puts the SAME task back at the start). A band « سؤال ينتظرك … » + « عُد إلى السؤال »
  replaces the card; the card comes back by itself when the step is reached again. Escape folds it.
- `LabCoach` is silenced while the card is open (`coachStep = … && !cp.open`).
- Events through the lab's `onTrial`: `{ tk: 'checkpoint', id, q, ok, tries, revealed }` per answer, then
  `{ tk: 'checkpoint-done', id, log }` — a module marks its step done on `checkpoint-done`.

**Wiring (in a lab):**
```js
const cp = useLabCheckpoint({ id: task.id, questions, reached: L.taskDone(lab), resetKey, onRetry: () => setLab(L.restartTask),
  onEvent: (ev) => state.report(onTrial, ev), onDone: (id) => { /* e.g. state.discover(); state.formalize() */ } });
// canNext && !cp.blocking ; {cp.node} first child of the `relative` block that wraps prompt → scene → controls → verdict
```
Questions are BUILT FROM THE TASK's numbers (never hard-coded), ask about what the student just DID, end the last chain with
the rule (the lab's old `ManipulationDiscovery` question moves into the card and `onDone` formalizes). Reference:
`proportion/GearCrank.jsx › CHAINS / QUESTIONS` (m1 read · compare · per pedal turn; m2 read · why more · 3/4 · which
operation; m3 read · 3/4 × 4/3 · the rule). Prop `checkpoints={false}` turns them off. The advanced level (prediction) and
the `reverse` world have no chain yet.

**Relation to « progression non bloquante ».** The gate is INSIDE the lab and always releases (3rd try reveals); the kit
questions of the module keep their non-blocking policy (`check:non-blocking` passes). DOM contract: see the header of
`LabCheckpoint.jsx`. Verified in the browser at 1366×768 (Playwright walk-through of m1 → m3, wrong answers, retry, reveal).
**Rollout to every lab: DONE (112/112 lessons, 98/98 labs, 2026-10-28) — and BINDING on every new lab** (a new manipulation is built with `useLabCheckpoint`, `useLabCheckpointSettings`, `LabStepper`, `useStepCelebration`, `playSfx` and `guided` from its first commit; definition of done L1–L9: the rollout doc §2; lesson-side summary: `LESSON_DEVELOPMENT_GUIDE.md` §6ter). Validated by the owner on 2026-10-28; plan, batches and status: [`../reports/LAB_PROTOTYPE_ROLLOUT.md`](../reports/LAB_PROTOTYPE_ROLLOUT.md).
**Card layout (2026-10-28, owner: « use more space »):** up to `max-w-4xl` over the lab, a gradient band (« سؤال i من n » + one segment
per question), the question large and centred, choice options as big cards — three across for formulas (`cols: 3`), full-width rows
for sentences — each with its number (keys 1 2 3 answer), a large number field, larger feedback, the actions in a bottom bar.

**Typed answers are never negative (2026-10-28).** `labCheckpoint.readNumber` reads a non-negative exact rational; a question whose answer is signed (`−3`)
must be a `choice` question. Allowing a typed negative is a change to this primitive, not to a lab.
**The teacher switch must be mounted (2026-10-28).** `useLabCheckpointSettings(type)` returns `control`; the lab passes it to the shell as
`headerAction={s.control}` — calling the hook alone gives the teacher no way to switch the questions off (`lab-rollout-status.mjs` checks the `switch` column).

**Only the steps (2026-10-28, owner).** A lab whose in-lab questions are active passes `guided` to `ManipulationShell`: no
« جرّب › اكتشف › صِغ القاعدة » progress and no « تلميح » button (in the page and in the full-screen bar) — the questions guide the student,
the lab shows only its own steps (`LabStepper`). Questions off (teacher, or a world without a chain) → `guided` false, both come back.

**Steps and success (2026-10-28, `primitives/LabSteps.jsx`, shared).** Owner: « the steps 1 2 3 must be clearer, and every completed step
shows a gaming success message ». `<LabStepper count current done stepAttr />` replaces a lab's small step dots: linked pills — done (green,
check), current (blue, ring), to come (outline) — and « المهمة 2 من 3 » (`[data-lab-stepper]`, `[data-lab-step-current]`; the lab keeps its own
step attribute, e.g. `data-gc-step`). `useStepCelebration()` → `celebrate({ n, total })` + `node` (in the lab's `relative` block): a card in
the centre — emoji, « المهمة n مكتملة! », a rotating cheer (`manipulation.steps.cheers`), stars, confetti — gone after 2.2 s, never catching
a click, no animation under `prefers-reduced-motion`; the last step says « أنهيت كل المهام! 🏆 » (`[data-lab-celebration][data-step][data-final]`).
A step counts as DONE when the lab's goal is reached AND its in-lab questions are answered; each step is celebrated once (again after « إعادة »).

**Sound effects (2026-10-28).** `lessons/common/utils/playEffect.js › playSfx(name)` — synthesized WebAudio (no file), silent unless the
device's « الصوت » preference is on (`smarter_effects_enabled`, read at play time; off by default, never a surprise): `pop` (question card
opens), `correct`, `wrong`, `step` (step fanfare), `win` (all done / perfect challenge), `start` and `tick` (the memo challenge), and the
LAB's own sounds (owner: « the sounds during the manipulation are very important for the gaming sense »): `tooth` (a click per tooth of
the gesture, `{ pitch }` lower backwards, at most one every 35 ms), `bell` (a full turn), `flag` (the goal reached on release), `over`
(the goal passed). « مختبر التفكير » (2026-11-01, `THINKING_LAB.md` §7.4) adds `lock` (a key opens), `spark` (an 👁 observation), `slide` (a ↩ dead end), `notyet` (two soft falling notes — « ليس بعد » is never a buzzer) and `stepTick` (a replay step). Reference: `gear-crank` (crank clicks, a bell per full WHEEL turn, chime/thud on release). Used by `LabCheckpoint`,
`LabSteps`, `MemoQuiz` and the labs; never a second audio system.
**Every lab can stop it:** `ManipulationShell` shows the « الصوت » switch (`EffectsToggle`, `[data-manipulation-sound]`) in its header and in
the full-screen bar. `useEffectsPreference` is the ONE preference: `setEffectsEnabled` writes it and broadcasts `sa:effects`, so the page's
switch, every lab's and the challenge's always agree (verified: switching off in the lab → 0 notes while cranking, all switches « off »).

**Mandatory for every student; the teacher may switch them off for HIS account only (2026-10-28).** Owner: « the questions are
always obligatory for the students, whoever their teacher or class; the teacher, in his account, can activate or deactivate them; the
option to disable them is never allowed for students ». The lab key is `<module>:<type>` read from the lesson URL
(`/courses/<level>/<grade>/<chapter>/<lesson>/<module>`, e.g. `nashat:gear-crank`) by
`primitives/labCheckpointSettings.jsx › useLabCheckpointSettings(type)` → `{ enabled, control }`:
- a student, a visitor, any page outside a lesson: `enabled` is ALWAYS true and nothing is requested;
- a teacher: `control` (in the shell's `headerAction`) is one switch « أسئلة المناولة » مفعّلة / معطّلة (`[data-lab-checkpoint-teacher]`,
  `role="switch"`), and `enabled` is HIS choice for that lab — off, his own lab behaves as before the prototype (discovery below the lab).
- Server: table `teacher_lab_settings` (`user_id`, `lesson_id`, `checkpoints_off` json of keys; unique per teacher × lesson; no row = all on),
  `GET` / `PATCH /teacher/labs/{lessonCode}` `{ lab, checkpoints }` under the teacher route group (a student gets 403). It never reaches a
  class or a student. Tested: `tests/Feature/TeacherLabSettingsTest.php`; verified in the browser with the real API (teacher off → his lab
  without card, choice kept after reload; a student still gets the card).

**« إعادة » (2026-10-28).** The shared `useManipulation › restart` still called `setHintLevel` (removed by the hints refactor): « إعادة »,
a level change and new numbers THREW in every lab and did nothing. Fixed (`setHintsOpen(false)`). In `gear-crank`, « إعادة » now
restarts the WHOLE lab — task 1, trials and in-lab questions — as `useManipulation` documents; « أعِد التجربة » in the question card
remains the way to redo only the current task.

### 8ter. The visual kit — one language for every lab (2026-10-14, owner request « the best possible for Gen Alpha 11–13 »)

Owner reference: a prompt card above a lavender stage with full-body drawn children, value pills, a dimension pill, name pills
and a control card with a big readout and round −/+. The pieces are shared, never redrawn per lab:

- **`primitives/LabKit.jsx`** (HTML): `LabCard`, `StageFrame` (lavender stage), `QuestionChip`, `PromptCard` (`chip` + `aside` on one
  row, the big `title` with a `lamp` that lights when the sentence becomes true, the `instruction`, children; **§17.9 form** (2026-10-14):
  `context` (+ `contextProps`) opens the card with the givens `[data-lab-context]`, `title` is then THE question `[data-lab-question]`,
  `aside` moves UNDER the question `[data-lab-aside]` and no `chip` is passed — the five 1AM labs use this form), `ChoiceTray` +
  `ChoiceCard` (big answer cards on a raised edge; `state` idle | selected | right | tried | locked; `size` lg | md | sm; `ltr` for a
  calculation), `RoundButton`, `StepperCard` (title, BIG readout, round − / + with + filled, an optional gesture `hint` — omit it when the verdict line already says the gesture, DNA §17.7; `layout` card | row),
  `NamePill`, `LabNote` (guides the gesture), `VerdictBanner` (the line the gesture writes, `role=status`). `ManipulationShell` takes `titleHidden` (2026-10-14, DNA §17.9): the shell title becomes `sr-only`, so a lab opens on its context and question. Every `data-*` / `aria-*`
  passes through (`titleProps`, `lessProps`, `moreProps`, `readoutProps`, `...rest`): a lab keeps its DOM contract when it adopts the kit.
  The kit writes no text of its own.
- **`primitives/SvgPill.jsx`** (inside a scene): `SvgPill` (a value pill, `pointer="down"` above an object; LTR island) and
  `SvgDimension` (a dimension between two levels with its pill at the side or above; arrows turn outside when the gap is small).
- **`primitives/KidFigure.jsx` + `kidFigure.js`**: a drawn 11–13-year-old — boys in a hoodie (hair `short | curly`), **girls always in
  Islamic dress** (owner, 2026-10-14): `hairStyle="hijab"` with a `scarf` (`SCARVES`: rose, lavender, mint, sky, sand — a draped scarf over
  the shoulders and chest, a forehead band, a pin) and a long tunic over wide trousers (`tunic`, default with the hijab); no uncovered-hair
  style exists (tested). Skins, outfits, moods `happy | neutral | wonder | proud`, the « ؟ » badge. Its geometry is the measure: the crown is exactly `top`, the soles
  touch `foot` (tested at every scale). A drawing that floats above the ruler's zero is a lie — never do it.

Rules: (1) the PromptCard never states the rule to discover — a `LabNote` guides the gesture only (« discover, don't be told »);
(2) the verdict sits beside the control or below the stage, never between the prompt and the stage (the stage must not jump when a
verdict appears); (3) on a narrow lab the controls go INSIDE the stage (a lane), not in an extra row; (4) numbers with Latin units are LTR
islands; (5) light surfaces only. Tests: `primitives/labKit.test.jsx`. Reference implementation: `operations/StoryBars.jsx`.

**Phone frames (same day).** A lesson module nested two `.sa-page` (ModuleLayout's `<main>` and ContentModule's `<div>`): under 640 px the
inner page no longer adds gutters (`index.css`), and the lab frames are thinner on phones (ManipulationWorkspace / Shell / Stage
`p-1.5`, 1 px border): a lab gets ≈ 256 px instead of ≈ 200 px at 320 px. On desktop the double gutter (2 × 60 px) remains — owner's
call (it would widen every lesson).

## 9. Checklist — every manipulation, every review

```
[ ] Student physically manipulates something meaningful
[ ] Drag/touch works (pointer events, no page scroll)
[ ] Non-drag alternative exists (tap-tap and keyboard)
[ ] Mathematical state updates immediately
[ ] Symbolic representation follows the action
[ ] Discovery precedes formalization
[ ] Wrong actions receive a useful Arabic reason
[ ] Hints are progressive and never give the answer
[ ] Reset works (and clears the type's own state via `state.epoch`)
[ ] Teacher mode works (step, replay, hide, solution, numbers)
[ ] Auto-completion decided (§6bis): AUTO with a shared rule and a mixed-start test, or MANUAL with a reason
[ ] Classroom Mode (if wrapped): enter/exit keeps the state, fits the screen, no page scroll
[ ] Student mode works
[ ] Tablet and laptop only (§8bis « Screen floor »): ≥44 px targets, no horizontal scroll, NO phone code (no `sm:`/`md:` variant, no width branch under the 354 px lab-box floor)
[ ] One screen (§8bis): object + its controls + its reading visible together, no vertical scroll, at 768×1024 / 1024×768 / 1280×800 / 1366×768 / 1920×1080, both levels
[ ] Large activity: secondary blocks in LabFold, floating readings in MovablePanel, many objects in a near-square block
[ ] RTL works
[ ] Mathematical notation is LTR where needed
[ ] Reduced motion works
[ ] No unnecessary animation
[ ] No decorative interaction
[ ] Exactly two levels in levels.js (beginner / advanced), advanced cites the extraction
[ ] Lesson callbacks go through state.report (never fire on the other level)
[ ] Uses core arithmetic functions
[ ] Mathematical result is tested (logic/logic.test.js)
```

## 10. Tests

- `packages/core/arithmetic/linear.test.js` and `logic/equationBalance.test.js`, `logic/vanishingPitch.test.js`,
  `logic/solutionRay.test.js`, `logic/growthRace.test.js` — unit 4: act-1 (−3, −1/7), معارف 1 (9/2), the
  طرائق decimals (−4), an equation without solution (ex-9); the tip / mirror / refusal rules and the k-groups
  split; 3(x − 5) and (x − 2)(x + 5) pins swept over every graduation at five widths; inequality rays swept against
  direct evaluation, the bracket witness, the invariance of the traces under legal transformations; the build
  refusals and the meeting point of both race worlds.
- `packages/core/arithmetic/polynomials.test.js` and `logic/algebraLabs.test.js` — unit 3: the
  textbook's expansions (معارف 1–2), the Descartes grid, $(3x - 1)(3 + x) → 3x^2 + 8x - 3$ by carry and
  merge, the refused merge, the cancelling $\pm 3x$, the forgotten zones of $(x + 3)^2$, the two-x
  discovery rule, the signed geometry swept for 8 expressions over every x of their ruler; rows
  $6x^2 + 4x$ (3 refused, 2 → $2x(3x + 2)$), $9x + 3$, $7x - 21$, the gcd-and-refusal rule, every r
  swept; square $x^2 + 6x + 9$ (2 | 4 refused, 3 | 3 closes), $x^2 + 25$ never closes, closing swept.
- `packages/core/arithmetic/squareRoots.test.js` — unit 2's exact arithmetic: perfect squares,
  √ of a rational (rational ⇔ numerator and denominator squares), squares compared in integers
  (no decimal up to 1/1000 squares to 5, swept), the calculator's 2,236067978² = 5,000000002237008484,
  n = a² × b with b square-free, and every k² dividing n.
- `logic/squareLabs.test.js` — the three unit-2 labs on the textbook's numbers: 36 exact / 5 bracketed
  to 1/1000 with the zoom locked until the student brackets by hand; 16/9 on the thirds while 6, 7, 13
  and 25/13 resist every graduation 1…12 (swept); x² = 9 needs −3 too, x² = 0 one pin, x² = −9 refuses
  pins and accepts « لا حل », √3 pinned exactly; 28 = 2² × 7 (k = 3 refused), 144 always gives side 12,
  288 needs k = 12; every tiling of 11 numbers swept.
- `packages/core/arithmetic/equalGrouping.test.js` — the equal-sharing model behind the library
  and the pitch: partition vs quotition, and a remainder that is always a number of objects.
- `divisibility/teamFormation.test.js` — the formation geometry, **swept over every reachable
  squad size** (no overlap, nothing outside the pitch) rather than sampled at the default.
- `autoComplete.test.js` — §6bis: which types the registry grants (exactly the three), the button
  status, the animation plan, and that auto-completion reaches the manual state — team-builder
  swept over the whole registry domain (`n = k × q + r`, no rounding), step×remaining = fill, a
  mixed manual start, manual rearrangement afterwards; the differences and Euclid chains without
  filling the PGCD box.
- `workspaceLevels.test.js` — the workspace's decisions: default level, always an active level,
  and a mount key that changes only when the mathematical model does.
- `primitives/groupingLayout.test.js` — the drawn grouping says what the division says (9 bouquets
  of 90 and 54, 17 and 18 in k bags for every k, 84/48 in 4 portions), the resume beyond
  `maxGroups`, and that every drawn theme is a registered `VISUAL_THEMES` id.
- `primitives/brickLayout.test.js` — walls in bricks of n: sum, difference and remainder are whole
  walls for every case of activity 3 and for 900/90/9; a wall that does not fall exactly keeps its
  partial brick; bricks cover the length with no gap or overlap.
- `logic/bookshelf.test.js` — the shelf lab's REAL logic (2026-09-30): `arrange` on the whole
  ruler (shelves × b + floor = a, floor < b), the exact lengths are the divisors, a trial is
  memorised once, discovery needs 3 trials with contrast, the 11/13 symmetry, counter-examples
  from the range, and `bookcaseLayout` **swept** over every b of 420 (10–60), 143 (5–30) and
  24 (2–12) at five widths: every book drawn once, full shelves = q, ghost = r books + b − r
  slots, nothing outside the width, no two shelves overlapping.
- `logic/logic.test.js` additions of 2026-09-30 (lessons 2–8): factor-pairs « turned » is
  order-independent, its ruler range and the rectangle geometry swept for 24/48/60/105;
  divisor-properties prediction (`predictFirst`, `outcome`); common-divisors `addGroup` builds the
  ✓/✗ pattern and « greatest » needs the next k; the PGCD boxes (differences, Euclid) refuse by
  divisibility (`notDividesA/B`, `notGreatest`); Euclid's overflow must be *tried* (`tryCopy`,
  `tryOneMore`); coprime lists need every divisor of the smaller number tested, and one common
  > 1 refutes; fraction path A offers non-common numbers, the irreducibility claim is judged,
  path B shows what a non-greatest divisor gives, and « equal paths » is right after a one-step
  path A.
- `logic/logic.test.js` — mathematics, allowed/refused actions, discovery conditions, final states,
  on the textbook numbers (60, 105, 18-12-3, 90/54, 42/60, 252/140, 765/135, 1938/836,
  17/18, 27/36, 84/48, 595/560). Team-builder's refusal reasons and their numbers
  (`rejectDetails`, the source of the refusal message) are asserted. The `divisor-explorer`
  block tests only that registered-but-unused type's logic; it was titled « 420 livres » and
  gave false assurance about the books lab until 2026-09-30.
- `apps/web/e2e/lesson-kit/manipulations.mjs` — real pointer drags, the tap alternative, keyboard,
  reset, hints, levels, mobile at 320 px, reduced motion, the absence of any mode toggle, the
  Classroom Mode blocks (C1–C3) on the shelf lab, the shelf itself (L1: a real drag of the
  bookend with the library following mid-gesture, keyboard, −/+, a tap on the ruler, the
  extremes 10 and 60, the refuted conjecture, the formal rule with 28 × 15 = 15 × 28, reset;
  L1m at 320 px), the **edge auto-scroll** drag from the bench to team 1 on a phone (DS), and the **two-level workspace** blocks
  (W1–W3): default level, both tabs, the inactive panel `hidden`, drag/tap/keyboard on the
  football lab, the explained refusal, `15 = 3 × 5` then `16 = 3 × 5 + 1` with one player drawn
  outside, discovery opening only after both cases, state surviving a level round trip, arrow-key
  navigation, and the pitch keeping its 2:3 proportions at 320 px.
  Block **9bis** (2026-09-21) counts the drawn worlds: 144 objects in the two piles, 9 bouquets
  of 16 drawn flowers, 4 leftover flowers drawn on the tray, the coprime insight after 1/2/3
  bags, 4 portions of 33 in the recipe, three built zones with no partial brick, the scissors
  mark and 252 − 140 = 112.
  Block **12** (2026-09-24, AC1–AC11; rewritten 2026-09-30) covers auto-completion: « أنشئ الفرق »
  **locked** on load, then unlocked by one sharing done by hand, a mixed start on 20/4 (two
  players by hand stay put), no duplicate, no discovery triggered, manual rearrangement
  afterwards, 16/3 leaving one player drawn on a bench renamed « الباقي », a configuration change
  in mid-animation, « إعادة » in mid-animation restoring 15/3 and re-locking, reduced motion,
  320 px, the locked → ready ribbons of the PGCD machines, and no button on the choice-type
  manipulations. **223/223 green on 2026-09-30** against the dev server (with `4am-aadad-tabiiya-natiqa.mjs` 29/29 and `classroom.mjs` 73/73), including the معارف 143 block (M3) and the blocks for the redesigned lessons 2–8 (L2 rectangle, chantier prediction + LTR equations, bouquets add/remove + « greatest » beyond, ribbons without pre-cut, Euclid's tried overflow, coprime proof, recipe decisions). On 2026-09-24 the suite was 176/177 against the dev
  server; the one failure, C3, was the Math Lab « المختبر » button in the Classroom toolbar (36 px
  wide under 640 px). Fixed 2026-09-29 (`MathLabEntryButton` `min-w-[44px]`); C3 now also ignores
  the pointer controls, which are `hidden` below `sm` on purpose.
  **139/139 green on 2026-09-21**, with `4am-aadad-tabiiya-natiqa.mjs` at 27/27.
  Run it against the **dev** server: `KIT_BASE=http://localhost:5173 node
  apps/web/e2e/lesson-kit/manipulations.mjs`. The helper's default is 5183,
  which is `vite preview` serving a stale build with no API — several suite
  headers still print 5183, and that is a documentation bug, not a setting.

  **Not covered, despite what the suite header says:** class mode
  (`ManipulationTeacherMode`) is never exercised, and the "result never appears
  before اكتشف" invariant is only spot-checked in the Euclid block — there is no
  general assertion on `data-phase`.

## 2novenquinquagies quater. The number of cells under the hand — `wax-cells` (2AM unit 4, lesson `ibara-harfiya-intaj`, 2026-10-29)

`operations/WaxCells.jsx` (+ `operations/waxCells/art.jsx`: the apiary SVG — `Hive`, `Flower`, `Bee`, `HexIcon`, `Student`) on `logic/waxCells.js` (pure; `rodsOf(centers)` is an EDGE COUNT of the drawn hexagons on an integer lattice — never the formula; the rule maths come from `packages/core/arithmetic/equation2.js` E1 — `valueTable`, `firstMismatch`, `sameCount`, `simplified`, `showTimes` — on `substitution.js`, whose `parseExpression(text, { letters })` now takes an optional letter list: default `['x','y']` for 3AM, `LETTERS_2AM = n x y a b c m`; `toTerms`/`samePolynomial`/`witness` take an optional `letter`). Theme `apiary`.

**The five questions.** (A) the hand holds n, the NUMBER OF CELLS of a row (drag a cell from the tray onto the row's end, drag the last one back, −/+, ← →), then WRITES the rule with the letter n (chips n m + − × ( ) and digits); (B) the rod counter slate (the drawn count), the n / rods table from the third cell; (C) the frame holds 8 cells and the tray 50 rods: the value for 40 is CALCULATED; at متقدم the counter is hidden until the student types the number; (D) formal phase 5 × n + 1 = 5n + 1, then 5 × 40 + 1 = 201; (E) wrong rules are refuted by the DRAWING: 6n (shared rods blink red), 5n (the first rod dashed), 5n + 6, a red column in the table.

**Pattern (« judge a typed rule on the drawing »).** `judgeRule(task, columns, text, pair) → { ok, model, column, rows }`: the rule is evaluated at EVERY built n (and at least 1…4; two letters: at several (n, m) pairs) against the drawn count; equal writings are accepted. Reuse it for any « write the general term » lab.

**Levels.** مبتدئ `w1` build 1, 2, 3 (6, 11, 16), `w2` the rule 5n + 1, `w3` the value for 40 (201). متقدم (counter hidden, predict first): `a1` a strip of two staggered rows (8n + 3: 11, 19, 27), `a2` two writings of one count (5n + 1 and 6 + 5(n − 1): same table, observation only, never « for every n »), `a3` two letters (5n + 1 + 8m + 3; n = 6, m = 4 gives 66). Module 2 poses `{ id: 'k1', kind: 'rule', targets: [3, 6] }` alone (`levels={false}`). `CHAINS` = w1 [second, why], w2 [repeat, alone, rule], w3 [far, tray], a1 [shared], a2 [same], a3 [letters, val], k1 [six, rule].

**Events** (`onTrial`): `{ kind: 'build', task, n, m, rods, free }`, `{ kind: 'predict', task, n, value, ok }`, `{ kind: 'rule', task, text, ok, model }`, `{ kind: 'far', task, value, ok }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true }`, then the checkpoint events. « جرّب أعدادك » is always open (free rows, a rule judged, nothing counted).

**DOM.** `[data-wax-cells][data-level][data-task][data-n][data-m][data-solved][data-layout]`, `[data-wc-glance]`, `[data-wc-scene]`, `[data-wc-tray]`, `[data-wc-counter]`/`[data-wc-counter-value]`, `[data-wc-rod][data-shared][data-blink]`, `[data-wc-table]` + `[data-wc-col][data-verdict]`, `[data-wc-less|more|less-m|more-m]`, `[data-wc-rule]`, `[data-wc-input]`, `[data-wc-judge]`, `[data-wc-predict]`, `[data-wc-far]`, `[data-wc-compare]`, `[data-wc-verdict]`, `[data-wc-next]`, `[data-wc-free]`, `[data-wc-formal]`. Strings: `lesson.manipulation.json › waxCells`. QA: `apps/web/e2e/lesson-kit/2am-mafhum-muadala-ibara-harfiya-intaj.mjs`. Deviation from the plan: the « recursive » refused model (typed Arabic sentence) is not built (the field accepts expressions only).


## 2novenquinquagies quinquies. The unknown under the hand — `juice-line` (2AM unit 4, lesson `hall-mushkil-muadala`, 2026-10-29)

`operations/JuiceLine.jsx` (+ `operations/juiceLine/art.jsx`: `Crate`, `Bottle`, `Student`) on `logic/juiceLine.js` (pure, EXACT in integer centilitres: `fill(content, size, order)` → `{ full, partial, left, short }`; the unknown maths come from `packages/core/arithmetic/equation2.js` E2 — `solveForm`, `checkForm`, `undoChain`, `formOf` — on `powers.js`). Theme `juicery` (a cooperative orange-juice workshop: steel tank with a litre-graduated window, belt, nozzle, bottles, the bottle MOULD).

**The five questions.** (A) the hand holds the UNKNOWN x: at مبتدئ the capacity of the mould (0,05 … 2 L: drag the top handle, −/+, ↑ ↓) with only TWO test fills, at متقدم the content of the TANK (a float, −/+, ↑ ↓); then it WRITES the number or the operation that gives x on a slate (« 18 ÷ 12 »); (B) the fill answers in the world — how many bottles are full, the partial bottle drawn at its level, the juice left in the tank — i.e. the equation read in the world (12 bottles of x litres make 18 litres); (C) scarcity: two tests only, so reasoning replaces blind trial; (D) formal phase 12 × x = 18 ⟹ x = 18 ÷ 12 = 1,5 (and x ÷ 24 = 0,25 ⟹ x = 24 × 0,25; (4 + x) ÷ 0,25 = 40 ⟹ 4 + x = 10 ⟹ x = 6); (E) wrong operations are refused by the DRAWING of their value (× a mould that overflows, ÷ flipped many tiny bottles, − and + out of range), and the equation cards demand ALL the right equations (12 × x = 18 AND 18 ÷ x = 12), refusing 18 × x = 12 and x ÷ 12 = 18.

**Pattern (« solve the unknown, the world checks it »).** `judgeX(state, text) → { ok, model, value }` with `modelOf(task, stage, value)` recomputing each named error from the task numbers; a refused value is DRAWN (`miss.fill`) before any sentence; the solution is confirmed by an exact control fill. Reuse for any « find the missing number » lab.

**Levels.** مبتدئ `t1` 18 L → 12 bottles (1,5), `t2` 30 L → 40 (0,75), `t3` 9 L → 36 (0,25). متقدم (the slate first, then the tank): `a1` 24 bottles of 0,25 L (6 L), `a2` 15 of 1,5 L (22,5 L), `a3` 4 L already in the tank, 40 bottles of 0,25 L (two stages: the total 10, then what to add 6; undo the LAST operation first). Module 2 poses `{ id: 'k1', kind: 'mould', total: 18, bottles: 12, tests: 2 }` alone (`levels={false}`). `CHAINS` = t1 [said, twelve], t2 [op], t3 [rule], a1 [dividend], a2 [dividend2], a3 [last], k1 [said, x].

**Events** (`onTrial`): `{ kind: 'fill', task, x, full, left, partial, test, free }`, `{ kind: 'operation', task, text, ok, model, stage }`, `{ kind: 'cards', task, picked, ok }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true }`, then the checkpoint events. « جرّب أعدادك » is always open (tank, order and capacity free; unlimited fills, nothing counted).

**Screen budget.** `[data-jl-glance]` fits the width at 768×1024, 1024×768, 1280×800, 1366×768 at both levels; the scene is a 560 × 270 viewBox (≤ 12 bottles drawn, « × n » beyond), SVG labels ≥ 11 px at the 414 px column of 1024×768.

**DOM.** `[data-juice-line][data-level][data-task][data-x][data-tests][data-solved][data-layout]`, `[data-jl-glance]`, `[data-jl-scene]`, `[data-jl-juice]`, `[data-jl-mould][role=slider]`, `[data-jl-tank][role=slider]`, `[data-jl-fill]`, `[data-jl-bottle=<i>][data-level=full|partial|empty]`, `[data-jl-left]`, `[data-jl-test=<i>][data-left]`, `[data-jl-overflow]`, `[data-jl-open-slate]`, `[data-jl-slate]`, `[data-jl-input]`, `[data-jl-judge]`, `[data-jl-cards]`, `[data-jl-card=<id>][aria-pressed]`, `[data-jl-cards-check]`, `[data-jl-verdict]`, `[data-jl-next]`, `[data-jl-free]`, `[data-jl-formal]`. Strings: `lesson.manipulation.json › juiceLine`. QA: `apps/web/e2e/lesson-kit/2am-mafhum-muadala-hall-mushkil-muadala.mjs`.

**Why not another lab.** 2AM `kit-packer` releases k × a and k × b items into k kits (a KNOWN product distributed); here the hand sets an UNKNOWN. `mooring-lines` lays a candidate QUOTIENT a ÷ b on a rope; here the quotient is given and the divisor or dividend is sought. `egg-trays`, 3AM `group-tanks`, `scoop-scale`, 4AM `bucket-fill`: no unknown capacity tested by a scarce fill. 4AM `equation-balance` / `solution-ray` / `term-ferry`: pans, a probe, terms across a river.

## 2novenquinquagies octies. The origin stake under the hand — `dig-grid` (2AM unit 3, lesson `talim-nuqta-mustawi`, 2026-10-29)

`operations/DigGrid.jsx` (+ `operations/digGrid/art.jsx`: `Pit` (an excavation seen from above, ochre earth, stone walls), `Find` (jar, oil lamp, plate shard, a PLAIN coin — no face, no symbol —, geometric mosaic tile, bead, ring, arrowhead), `StakeArt` (the red origin stake), `Digger` (`KidFigure`: a girl in hijab at مبتدئ, a boy in a hoodie at متقدم)) on `logic/digGrid.js` (pure; BigInt hundredths; the maths are `packages/core/arithmetic/relative.js`, E4 row: `point`, `pointText`, `quadrantOf`, `symX`, `symY`, `coordsOf`, `originFor`, `consistent`, `parsePoint`, imported BY PATH — extend, never fork). Theme `digsite` (kind `areas`).

**The five questions.** (A) مبتدئ: the hand holds the ORIGIN STAKE of an orthonormal frame laid over the dig — one 2D drag (it snaps to string crossings; tapping a crossing and ← → ↑ ↓ on the focused stake do the same); two cords follow it (blue = abscissa axis, green = ordinate axis, tagged at every metre). متقدم: the stake is fixed; the hand PREDICTS (types « ( x ; y ) » in two fields), TAPS a point at the half-metre, or types the mirror place of a coin across the blue cord. (B) The coordinates of a find are an OUTPUT: (its position) − (the stake), abscissa first; they all change when the stake moves although no find did. (C) Resistance: two notebook records are true together for ONE stake or for NONE (d4: numbers swapped — « لا يوجد موضع » is the right answer, pressed anywhere else it is refused and the right stake is shown as a ghost); a find on the green cord has abscissa 0. (D) The formal phase writes the student's own numbers. (E) Wrong answers are drawn: the notebook line turns red (`swap`), a dashed ghost shows where a typed point leads (`swap`, `onAxis`, `signAxis`, `signLeft`, `symMix`, `bothSigns`, a missed tap).

**Props.** `tasks` (`{ id, kind: 'stake' | 'typed' | 'tap' | 'mirror', … }`: `stake` { start: [c, r], notes: [{ find, want: 'x;y' }], none? } — `none` must agree with `relative.consistent` (the normaliser throws otherwise) —, `typed` { stake: 'x;y' (world metres), finds: [ids] }, `tap` { stake, targets: [{ name: 'ring' | 'arrow', at: 'x;y' }] }, `mirror` { stake, find }; find ids `jar lamp plate coin tile bead`, world cells in `logic/digGrid.js › FINDS`), `level`, `levels`, `coach`, `lead`, `onTrial`, `onFinished`. Module 2 poses it alone: `{ id: 'm1', kind: 'typed', stake: '4;2', finds: ['jar','lamp','plate'] }` (chain `m1`).

**Levels (`levels.js`).** مبتدئ: `d1` jar (2 ; 1) → stake (3,3), `d2` lamp (−3 ; 2) → stake (5,3), `d3` jar (2 ; 1) AND plate (−1 ; −2) → the same stake, `d4` jar (2 ; 1) and plate (1 ; 2): no stake. متقدم (method): `p1` type coin (3 ; −1), tile (1 ; 3), bead (0 ; −2), `p2` tap ring (2,5 ; −1,5) and arrowhead (−1,5 ; 0), `p3` mirror of the coin (3 ; 1). The levels test measures the pair by the GESTURE (the stake, tasks `stake` only, vs a point typed / tapped / mirrored) and by the half-metre.

**Events** (`onTrial`): `{ kind: 'stake', task, at, ok?, model }`, `{ kind: 'none', task, ok }`, `{ kind: 'typed', task, find, value, ok, model, want }`, `{ kind: 'tap', task, target, at, ok }`, `{ kind: 'custom', free: true }`, then the checkpoint events. **Lab prototype (§8quinquies):** `CHAINS` (d1 `count · first`, d2 `whyNeg`, d3 `oneStake`, d4 `mistake · ruleB`, m1 `south · ruleB`, p1 `bead`, p2 `half`, p3 `sym · rule`) over the lab through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx`, `LabCoach` (`stake`, `read`, `none`, `tap`, `type`, `mirror`, `next`), full screen and « إعادة ».

**« جرّب أعدادك »** is ALWAYS open: one point `(x ; y)` with |x|, |y| ≤ 6 (≤ 2 decimals); the lab drops a marker, names its region (four regions, on an axis, origin) and the stake may be dragged freely; free trials never count.

**Screen budget.** `[data-dg-glance]` fits the width at 768×1024, 1024×768, 1280×800, 1366×768 at both levels and is ≤ 700 px high at 1024×768 (asserted by the lesson e2e): the square size is `min(width fit, ≈ 28 % of the screen height)`; the notebook is one row of pills (`المطلوب` / `الآن`), the typing row is two small fields.

**DOM.** `[data-dig-grid][data-level][data-task][data-stake][data-solved]`, `[data-dg-glance]`, `[data-dg-stage]`, `[data-dg-svg]`, `[data-dg-stake][role=application]`, `[data-dg-cord=x|y]`, `[data-dg-find=<id>][data-coords]`, `[data-dg-note=<i>][data-ok]`, `[data-dg-none]`, `[data-dg-answer]` (`[data-dg-x]`, `[data-dg-y]`), `[data-dg-check]`, `[data-dg-ghost][data-model]`, `[data-dg-tap=<name>]`, `[data-dg-verdict=right|wrong|free|'']`, `[data-dg-next]`, `[data-dg-step=<i>]`, `[data-dg-free]`, `[data-dg-free-input]`, `[data-dg-free-info]`, `[data-dg-free-back]`, `[data-dg-kid][data-mood]`.

**Why not another lab.** `window-blinds` (2AM): two orthogonal 1D pulls make an AREA; here ONE 2D drag moves a whole frame and the coordinates of fixed objects are read. `pin-rails` (3AM): pins slide to table values in a fixed frame; here the frame moves. `corniche-ruler` (same unit): the origin of a LINE among landmarks; here a 2D frame, two cords and the ORDER of two numbers. `zero-probe`: a cable length on one vertical axis. `component-steps`, `midpoint-distance`, `shape-prover` (4AM): vectors / distances / proofs, no origin to choose.

## 2novenquinquagies decies. The opening of a caliper under the hand — `gap-caliper` (2AM unit 3, lesson `masafa-nuqtatayn`, 2026-10-29)

`operations/GapCaliper.jsx` (+ `operations/gapCaliper/art.jsx`: `Board` (the weather club's white wooden board and its tall thermometer tube), `Station` (a Stevenson screen and a wind vane), `Bead`, `Caliper` (the brass rail, the fixed jaw clipped on a bead, the free jaw with its screw knob), `Observer` (`KidFigure`: a girl in hijab at مبتدئ, a boy in a hoodie at متقدم)) on `logic/gapCaliper.js` (pure; BigInt hundredths on `packages/core/arithmetic/relative.js` E5, imported by path: `gap`, `pointsAt`, `midpointAbscissa`). Theme `meteoboard`; type registered in `manipulationTypes.js` / `manipulationRegistry.js` / `levels.js`; strings `lesson.manipulation.json › gapCaliper`; render test `operations/gapCaliper.render.test.jsx`, logic test `logic/gapCaliper.test.js`; lesson e2e `e2e/lesson-kit/2am-adad-nisbiya-2-masafa-nuqtatayn.mjs`.

**The five questions.** (A) the hand holds the OPENING of a brass caliper clamped on ONE bead of a thermometer graduated −10 … +12: it turns the screw (drag the free jaw, − / +, ↑ ↓ and PageUp / PageDown on the focused knob; step 1 at مبتدئ, 0,5 at متقدم) until the free jaw touches the second bead; at متقدم the opening is TYPED first (the screw is locked until the prediction is right) and a fixed opening is SWUNG up and down (« إلى الأعلى » / « إلى الأسفل » toggles, ≥ 44 px). (B) the distance is an OUTPUT: the free jaw lands at `a ± d`, it touches the target only for the right opening; a band between the jaws is split at the blue zero line into two coloured parts (above green, below orange) with their sizes when it crosses zero. (C) resistance: the opening can never be negative (a typed « −13 » raises crossed jaws and is refused); two beads on opposite sides of zero add two pieces, on the same side they overlap; a fixed opening gives TWO points. (D) the formal phase writes `AB=(+9)-(-4)=(+9)+(+4)=13` with the student's first readings. (E) wrong moves are made VISIBLE: the jaw stops short (`short`, `subDist`) or overshoots (`over`, `addSame`) with a dashed rose segment to the bead, the crossed jaws (`neg`), a ghost jaw at the typed value.

**Props.** `tasks` (`{ id, anchor, target, predict? }` — the caliper is clipped on `anchor`, the jaw must touch `target` (the direction is derived), `predict: true` types the opening first —, or `{ id, kind: 'swing', anchor, d }`; values are strings with ≤ 2 decimals within [−10, 12]; the normaliser throws on equal beads or a swing point off the thermometer), `level`, `levels`, `coach`, `title`, `lead`, `onTrial`, `onFinished`. Tags `lesson.manipulation.json › gapCaliper.tag.<taskId>.a|b`, a question `q.<taskId>` and a context `ctx.<taskId>` per task id (`g1 … g4`, `a1 … a3`, `m1`).

**Levels (`levels.js`).** مبتدئ: `g1` −4 / +9 (13, crosses zero), `g2` −7 / −2 (5), `g3` +3 / +11 (8), `g4` −6 / 0 (6; the rule). متقدم (textbook `deep-41`): `a1` −2,5 / +6 predicted (8,5), `a2` a fixed opening 4 around +1,5 swung both ways (+5,5 and −2,5), `a3` the caliper clamped on the UPPER bead +3, target −6,5 (9,5: AB = BA). The levels test measures the pair by the PREDICTION / swing (متقدم only), the decimals (متقدم only) and the upper-bead clip.

**Events** (`onTrial`): `{ kind: 'fix', task, d, landed, ok, model }`, `{ kind: 'predict' | 'say', task, value, ok, model, want }`, `{ kind: 'swing', task, dir }`, `{ kind: 'found', task, dir, value, ok, model, want }`, `{ kind: 'custom', free: true }`, then the checkpoint events. **Lab prototype (§8quinquies):** `CHAINS` (g1 `parts · whyAdd`, g2 `parts2 · whySub`, g3 `calc`, g4 `ruleA`, m1 `calcM · ruleA`, a1 `sub`, a2 `howMany`, a3 `same · ruleB`; every question has two hints and a refutation per wrong option); `LabStepper`, `useStepCelebration`, `playSfx` (`gesture` per notch, `flag` / `over`, `bell`), « إعادة », full screen, `LabCoach` (`screw`, `fix`, `type`, `predict`, `swing`, `next`).

**« جرّب أعدادك »** is ALWAYS open: two readings `a ; b` (|x| ≤ 10, ≤ 2 decimals); the caliper opens between them and names the distance and the two pieces around zero; free trials never count.

**Screen budget.** `[data-gc-glance]` fits the width at 768×1024, 1024×768, 1280×800, 1366×768 at both levels and is ≤ 700 px high at 1024×768 (asserted by the lesson e2e, in the worst phase too): the board is `clamp(236, 34 % of the screen height, 380)` px high; one row of controls (dial, − / +, « ثبّت » or the typing field).

**DOM.** `[data-gap-caliper][data-level][data-task][data-d][data-solved]`, `[data-gc-glance]`, `[data-gc-stage]`, `[data-gc-svg]`, `[data-gc-bead=<id>][data-value]`, `[data-gc-anchor]`, `[data-gc-jaw][data-value]`, `[data-gc-screw][role=slider]`, `[data-gc-less]`, `[data-gc-more]`, `[data-gc-dial][data-locked]`, `[data-gc-fix]`, `[data-gc-swing=up|down][aria-pressed]`, `[data-gc-band=above|below]`, `[data-gc-answer]` (`[data-gc-input]`, `[data-gc-check]`), `[data-gc-ghost][data-model]`, `[data-gc-verdict]`, `[data-gc-next]`, `[data-gc-step=<i>]`, `[data-gc-free]`, `[data-gc-free-input]`, `[data-gc-free-info]`, `[data-gc-free-back]`, `[data-gc-formal]`, `[data-gc-kid][data-mood]`.

**Why not another lab.** `zero-probe` (same unit, closest kin): there the hand holds a cable length FROM ZERO plus a side toggle and the output is a POSITION; here the anchor is ANY bead, the jaws cannot go negative and the output is a GAP between two given positions (a horizontal caliper band on a thermometer board, not a cable unrolled over the sea). `difference-meter` (3AM): two probes read a SIGNED difference; here the reading is never signed and the student predicts it. `ruler-compare` (1AM) and `level-laser` (2AM unit 2) compare / read graduations: nothing is opened. `midpoint-distance`, `route-compare` (4AM): distances in a frame by Pythagoras.

## 2novenquinquagies undecies. The load under the hand — `bridge-load` (2AM unit 4, lesson `ikhtibar-musawat-mutabayina`, 2026-10-29)

`operations/BridgeLoad.jsx` (+ `operations/bridgeLoad/art.jsx`: `Sack` (cement grey 50 kg, sand beige 40 kg), `Pile` (sacks stacked in columns of 5), `Truck` (open bed, empty mass painted on the bed side, cab silhouette, weighbridge slab), `Barrier`, `Bridge`, `Student` (`KidFigure`: Anis, a boy in a hoodie, at مبتدئ; Salma, a girl in hijab and long tunic, at متقدم; the drivers are never drawn)) on `logic/bridgeLoad.js` (pure, integers; the maths are `packages/core/arithmetic/equation2.js` E3 — `parseRelation`, `testAt` (substitution line + both members + comparison), `whichHold`, `identityVerdict` — imported BY PATH). Theme `weighbridge` (kind `quantities`, label « جسر الوادي وميزانه: شاحنة مواد البناء »).

**The five questions.** (A) the hand holds COUNTS: x cement sacks and, at two unknowns, y sand sacks (0 … 60). Three paths: drag a sack or a pallet of 5 from the depot onto the bed (a tap on a tile adds it) and drag a pile off the bed to unload; the − / + steppers (± 1, ± 5); the keyboard (↑ ↓ cement, ← → sand, Enter weighs). « اعبر إلى الميزان » weighs. The GIVEN loads of a task are CARDS the student drags onto the truck one by one (a tap ticks, ↑ on a focused card loads it). (B) The world answers: the weighbridge screen writes the textbook's substitution line (« 4000 + 50 × 15 = 4750 ») and the comparison (« 4750 < 5000 ؟ »); the barrier rises or stays down. (C) The verdict is asked BEFORE the barrier moves (« هل تعبر؟ » / « هل للشاحنتين الكتلة نفسها؟ »); the boundary load (20 sacks = 5000 exactly: « 5000 < 5000 » is false and a « 5000 = 5000 » row appears under it); two unknowns (the order of the two counts matters); at متقدم the screens stay MASKED until the student has typed both members' masses (PREDICT) and a claim « always » falls before ONE load. (D) The formal phase writes the student's numbers (`formalLines`): « 4000 + 50 × 15 = 4750 and 4750 < 5000 », « 3000 + 70 × 30 = 5100 and 3600 + 50 × 30 = 5100 », « x = 0 : 2000 ≠ 2400 ». (E) Wrong moves are DRAWN: a wrong verdict shows the real line (the screen turns red, the barrier tells the truth), a counterexample that satisfies the claim is refused with « هذه الحمولة توافق ادّعاءه », the swapped pair (x, y) writes ANOTHER line (« 50 × 35 + 40 × 25 ») and is named `swap`, a wrongly ticked card is outlined red with its comparison read out.

**Pattern (« test a value against a rule, the world reads the substitution »).** `weighAt(task, x, y)` → `{ holds, left, right, lines: { a, b, cmp } }` from `testAt`; the lab never decides by itself: the judge is the relation. Reuse for any « is this number a solution / does it satisfy » lab: tasks carry an ASCII `rule` with ONE sign; a letter in the second member makes TWO lanes (truck A = left member, truck B = right member, ONE load x feeds both).

**Tasks** (`{ id, rule, loads?, cards?, kind?: 'claim', predict?, at? }`). مبتدئ: `b1` `4000+50x<5000` (loads 15 and 22, then cards 18 19 20 21 — only 18 and 19 pass), `b2` `4500+50x+40y<7000` (loads (20,30) ✓ 6700, (30,25) ✗ 7000, (25,35) ✗ 7150), `b3` `3000+70x=3600+50x` (loads 20 ≠, 30 equal (5100), 40 ≠). متقدم (method-3): `a1` claim `3000+70x<3600+50x` (predict; x = 31 refutes), `a2` claim `2000+100x=2400+60x` (predict; equal at x = 10 only, x = 0 refutes), `a3` `4500+50x+40y<=7000` (cards (10,40) (30,25) (40,15) (25,30): 7000 passes with « ≤ »). The levels test measures the pair by PREDICT, claims and the `≤` sign (متقدم only). Module 2 poses `K1_TASK = { id: 'k1', rule: '4000+50x<5000', loads: [12] }` alone (`levels={false}`): 4000 + 50 × 12 = 4600 < 5000.

**Lab prototype (§8quinquies).** `CHAINS` (b1 `line · why20`, b2 `unknowns`, b3 `which · twenty`, a1 `howmany`, a2 `rule`, a3 `diff`, k1 `line`) over the lab through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx` (`gesture` per sack, `flag` on a right verdict / cards / counterexample / prediction, `over` on a refused one, `bell` when a task is solved), `LabCoach` (`sa.labCoach.bridge-load.off`: `load`, `weigh`, `screen`, `cards`, `twin`, `claim`, `next`, `free`), full screen and « إعادة ».

**Events** (`onTrial`): `{ kind: 'weigh', task, x, y, holds, free }`, `{ kind: 'predict', task, ok, a, b }`, `{ kind: 'verdict', task, answer, ok }`, `{ kind: 'cards', task, ticked, ok }`, `{ kind: 'counter', task, x, ok }`, `{ kind: 'solved', task, free }`, `{ kind: 'custom', free: true }`, then the checkpoint events `{ tk: 'checkpoint', id: <task id>, q, ok, revealed }`. `task` is the 0-based index in the level (−1 in « جرّب أعدادك »). A lesson counts `e.kind === 'solved' && !e.free && e.task === i`.

**« جرّب أعدادك »** is ALWAYS open: the empty mass (0 … 9000, step 500), the cement and sand sack masses (10 … 100), the sign's number (500 … 12000) and the sign itself (< ≤ =) are free, and the load is any (x, y); the screen judges at once; free trials never count.

**Screen budget.** `[data-bl-glance]` is ≤ 700 px high at 1024×768 in BOTH levels in every phase (measured 548 – 678 px at the four screen sizes; the lesson e2e asserts it): the depot, the truck and the weighbridge are one 460 × 178 viewBox (206 for two lanes); the screen and the bridge sign are DOM (LTR islands), one compact line per member; the verdict buttons replace the « weigh » button during a question; the count rows are hidden while the cards are on screen. Numbers inside Arabic sentences that contain a comparison are KaTeX (`$5100<5000$`), never a bare LTR isolate (a bare `<` was seen mirrored in a verdict sentence).

**DOM.** `[data-bridge-load][data-level][data-task][data-x][data-y][data-solved][data-layout]`, `[data-bl-glance]`, `[data-bl-scene]`, `[data-bl-dropzone]`, `[data-bl-depot=cement|sand]`, `[data-bl-sack][data-kind][data-n]`, `[data-bl-bed=A|B]`, `[data-bl-pile=x|y]`, `[data-bl-weigh]`, `[data-bl-screens]`, `[data-bl-screen=A|B][data-holds][data-judged]`, `[data-bl-cmp]`, `[data-bl-status]`, `[data-bl-boundary]`, `[data-bl-sign]`, `[data-bl-barrier][data-open]`, `[data-bl-row=x|y]`, `[data-bl-count=x|y]`, `[data-bl-load]`, `[data-bl-ask]`, `[data-bl-yes]`, `[data-bl-no]`, `[data-bl-predict]`, `[data-bl-predict-input=A|B]`, `[data-bl-counter]`, `[data-bl-cards]`, `[data-bl-card=<i>][aria-pressed][data-weighed]`, `[data-bl-cards-check]`, `[data-bl-verdict=good|bad]`, `[data-bl-next-load]`, `[data-bl-next]`, `[data-bl-step=<i>]`, `[data-bl-free][data-active]`, `[data-bl-free-start]`, `[data-bl-free-back]`, `[data-bl-formal]`, `[data-bl-context]`, `[data-bl-prompt]`. Strings: `lesson.manipulation.json › bridgeLoad`.

**Why not another lab.** 4AM `equation-balance` (two pans: the hand moves bags and balls to SOLVE), 4AM `solution-ray` (a probe x on a ray that leaves true / false traces), 3AM `equality-lanes` (an operation applied to both sides), `loom-threads`, `difference-meter`: here nothing is solved or transformed — a load is TESTED against a rule and the hand holds counts. 4AM `pair-scoreboard` (both numbers of a pair, two equations of a SYSTEM read live): here ONE rule, two unknowns as two kinds of sacks, a barrier for a verdict, no system. 3AM `marble-run` (a value travels down an expression tree): here the substitution is the weighbridge's screen line and the student's act is the load and the verdict. 2AM unit 3 `tug-rope` and `balloon-ballast`: signed sums, not a test. 2AM `juice-line` (same unit): the hand holds the UNKNOWN to be FOUND by an inverse operation; here the unknown is only tried and judged.

## 2novenquinquagies duodecies. The unit and the flag under the hand — `jump-tape` (1AM unit 1, lesson `adad-ashri-mustaqim-mudarraj`, 2026-10-30)

`operations/JumpTape.jsx` (+ `operations/jumpTape/art.jsx`: `Backdrop`, `TapeBand`, `Tick`, `Flag`, `Footprint`, `Cursor`, `Jumper` — the long-jump pit on a school sports day, the yellow measuring tape, coloured flags) on `logic/jumpTape.js` (exact, integers in THOUSANDTHS, through the new `packages/core/arithmetic/halfLine.js` — `parse` (also the sum writing `2+6/10`), `text`, `isSum`, `tickValue`, `markValue`, `onTick`, `bracket`, `marksNeeded`, `swapDigits` — imported BY PATH); theme `sportsday`; strings `lesson.manipulation.json › jumpTape`. **The hand holds, in this order, the UNIT LENGTH (it STRETCHES the « 1 » mark; the tape shows only O until it does) and then a FLAG's position**; at متقدم it holds a READING CURSOR. The abscissa is always an OUTPUT: `A(2,4)` is read live above the flag. Not `ruler-compare` (the hand holds the GRADUATION that separates two numbers), not `number-line-pegs` (3AM: a card carried to its place), not `gap-caliper` / `zero-probe` (signed numbers), not `decimal-comma` / `rank-exchange` / `fraction-knife`. The next lesson's `stride-stamp` STAMPS a unit stick both sides of O; here the unit is STRETCHED, to the right only.

**Geometry (pure).** Window `WIN = 600` drawing units, the tape starts at `X0 = 20`, the pit's end bar is at `X0 + 600`. A big mark is worth `step` (1 or 0,1), ten small ticks divide it (`step/10` each: 0,1 or 0,01). Task fields: `from` (value at the left edge), `step`, `unit` (`'free'` = the hand stretches it, or px per big mark).
Unit range of a `free` task: `ceil((longest − from)/step) · u ≤ 580` AND `u/10 ≥ 10` (b1 longest 3,1 → u ∈ [100, 145], b2 longest 3 → [100, 193]); the student is never told it. Read tasks use `u = 200` (3 big marks).

| kind | fields | the job | judged by |
|---|---|---|---|
| `plant` | `jumps: ['2,4','3,1','1,8']` (also `'3'`, `'2+6/10'`), `from`, `step`, `unit` | (`free`) stretch the « 1 » mark until the longest jump fits and the ticks stay distinct — release is the trial; then plant one flag per jump on a small tick (drag from the tray, tap-tap, or arrows + Enter); every planting is judged | `judgeUnit` / `judgePlant` exact |
| `read` | `flags: ['0,6','1,9','2,35']`, `from`, `step` | flags are already planted; move the cursor tick by tick, select a flag, say « على هذه التدريجة » (exact) or « بين هذه والتي تليها » (bounds) | `judgeRead` exact |

Presets (`levels.js`): مبتدئ b1 `2,4 · 3,1 · 1,8` (free unit), b2 `0,7 · 2,9 · 3` (free unit, another range, a whole number), b3 `0,8 · 2+6/10 · 3,3` (unit 140, the sum writing); متقدم (cites ex-16) a1 `0,6 · 1,9 · 2,35`, a2 a tape WITHOUT its origin (`from 9`: `9,4 · 10,8 · 11,25`), a3 a tape graduated in hundredths (`from 4, step 0,1`: `4,04 · 4,12 · 4,235`). The level test measures plant (مبتدئ only) against read (متقدم only), the free unit, the hidden origin and the 0,1 step.

**Resistance by DRAWING (never a verdict word, never the right tick).** Unit: too long → the mark above the longest jump leaves the pit (rose hatched band + « لا يتّسع » at the end bar, `[data-jt-refused=long]`); too short → the ticks pile up in a grey smudge (`[data-jt-refused=short]`); nothing locks. Plant: a wrong flag STAYS (dashed ring), the jumper's FOOTPRINT appears in the sand at the TRUE place with a dashed gap to the flag (`[data-jt-print]`), the line quotes the flag's own reading (« علمك عند 4,2 »). Models (`judgePlant › model`, the bank's `MISC-ABSC-*`): `swap` (2,4 planted at 4,2), `fromO` (only the decimal digit counted from O: 0,4), `wholeOnly` (the big mark, decimal part ignored), `off1` (one tick away), `other`. Read: a hatched strip between the cursor and the flag (`[data-jt-gap]`, a ring when they touch); models `exactOnBetween`, `boundsOnTick`, `wrongTick`, `swap`.

**Always-open « جرّب أعدادك أنت »**: one input (comma/dot, `0 ≤ v ≤ 4`, ≤ 3 decimals, also `2+6/10`), a fixed 0 … 4 window (u = 140); the flag is planted at the exact place and the line says « n وحدة و m تدريجات صغيرة » or the two ticks that bracket it. Free trials never count; « عُد إلى مهامّك ». Not « جرّب كل الإمكانيات ».

**Checkpoint chains (ids reported by `checkpoint-done`)**: `b1u` (after the unit is locked: `ticks`, `gap` — « كم تدريجة؟ » 10, « ماذا يمثّل التباعد؟ » 1/10 = 0,1), `b1` (`flagBlue` — « ما فاصلة العلم الأزرق؟ » 3,1 —, `steps`), `b2` (`wholeMark`, `zeroSeven`), `b3` (`sumRead`, `ruleA`), `a1` (`between`), `a2` (`hidden`), `a3` (`hundredth`, `ruleB`). A task whose id is not in `CHAINS` (a lab posed alone in معارف) asks nothing and uses the default context / question strings.
**Callbacks.** `onTrial`: `{ kind:'unit', task, u, ok, model: right|long|short }`, `{ kind:'plant', task, jump, tick, value, ok, model, want }`, `{ kind:'read', task, flag, tick, mode: exact|bounds, value, ok, model }`, `{ kind:'custom', free:true }`, plus the checkpoint events; `onFinished({})` once.
**DOM.** `[data-jump-tape][data-level][data-task][data-solved]`, `[data-jt-glance]`, `[data-jt-svg]`, `[data-jt-knob][role=slider][data-u]`, `[data-jt-unit][data-locked]`, `[data-jt-mark=<value>]`, `[data-jt-tick=<value>]`, `[data-jt-flag=<A|B|C>][data-state=right|wrong|held|idle][data-at]`, `[data-jt-tray]`, `[data-jt-card=<id>][data-planted][data-state]`, `[data-jt-print=<id>]`, `[data-jt-refused=long|short]`, `[data-jt-cursor][role=slider][data-at]`, `[data-jt-chip=<id>]`, `[data-jt-answers]`, `[data-jt-exact]`, `[data-jt-bounds]`, `[data-jt-reading=<id>]`, `[data-jt-gap]`, `[data-jt-lock]`, `[data-jt-less]`, `[data-jt-more]`, `[data-jt-verdict]`, `[data-jt-next]`, `[data-jt-step=<i>]`, `[data-jt-free]`, `[data-jt-free-input]`, `[data-jt-free-back]`, `[data-jt-formal]`. Tests: `logic/jumpTape.test.js`, `operations/jumpTape.render.test.jsx`, `packages/core/arithmetic/halfLine.test.js`.
**Layout.** The scene is ONE SVG (`viewBox 640 × 212`) that scales to the column (≈ 414 px at 1024×768 with the menu open): marks 20 units high, small ticks ≥ 10 units apart; the tray cards are ≥ 56 px high; no horizontal scroll from 768 to 1366.

## 2novenquinquagies terdecies. The level under the hand — `frost-gauge` (1AM unit 5, lesson `adad-nisbiya-siyaqat`, 2026-10-30)

`operations/FrostGauge.jsx` (+ `operations/frostGauge/art.jsx`: `Backdrop` with three worlds, `Ruler`, `KnobShape`, `Reading`, `DistanceBracket`, `Observer`, `KidChip`) on `logic/frostGauge.js` (exact, integers — graduations; through the new `packages/core/arithmetic/signedGauge.js`: `sideOf`, `distance`, `opposite`, `areOpposite`, `gauge`, `lowest`, `farthest`, `classify`, imported BY PATH); theme `winterdjelfa`; strings `lesson.manipulation.json › frostGauge`. **The hand holds the LEVEL of a vertical gauge**: the liquid of a school thermometer in Djelfa in January (its scale shows only the 0; a sign appears in front of the reading only once the liquid is BELOW 0), the pin of an altitude gauge (sea level = 0; the Chott below it, a hill above), the cabin of a building's lift (ground floor = 0, basement below). The relative number is an OUTPUT: the reading pill writes « −3 » live; its SIGN (which side of 0) and its DISTANCE to 0 (the hatched bracket) are two readings of the same level. Mode « mirror »: the hand holds one level and its SHADOW follows on the other side of 0 at the same distance (the opposites). Not `stride-stamp` (lesson 2: the unit stick stamped both sides of O on a LINE), not `zero-probe` / `gap-caliper` (2AM), not `elevator-reel` (3AM: a signed TIME); `gap-caliper`'s `meteoboard` is a thermometer too but the gesture there is a caliper opening.

**Tasks** (`levels.js › frost-gauge`): `{ id, scene: frost | altitude | floors, kind: set | mirror | pair, step, min, max, reads }`; `reads` are asked IN WORDS (« 3 درجات تحت الصفر », never the graduation) and played one by one with « سجّل القراءة »:

| kind | reads | the job | judged by |
|---|---|---|---|
| `set` | `[5, -2, -3, 0, 2]` | put the level on each reading | `judgeRead`: `right`, `swap` (right distance, wrong side), `zero`, `off` (one graduation away), `other` |
| `mirror` | `[{ self: -4 }, { mirror: 3 }, { self: 0 }]` | `self` puts the level; `mirror` asks that the SHADOW reads this value (the level is its opposite) | adds `self` (the level was set where the shadow was asked) |
| `pair` | `[{ dist: 6 }, { dist: 6 }]` | two DIFFERENT levels at the same distance from 0 | adds `dist` (wrong distance) and `same` (the first reading again) |

Presets: مبتدئ b1 `5 · −2 · −3 · 0 · 2` (the coldest is not the biggest number; −2 and 2 are opposites), b2 altitude `−40 · 30 · 0 m` (step 10), b3 the mirror `−4 · shadow of 3 · 0`; متقدم a1 pair at distance 6 (step 2), a2 floors `−2 · 5 · 0`, a3 altitude `−30 · 20 m` (who is farther from the sea). Method task (lesson module 3, `levels={false}`): `−3 · 4 · −1`.

**Resistance (never the right graduation):** a wrong reading is JUDGED with the student's numbers (« المسافة إلى الصفر صحيحة لكنّ الجهة غير صحيحة »), nothing advances; the hatched distance bracket and the shadow stay drawn. **Always-open « جرّب أعدادك أنت »**: one integer from −10 to 10 on a fixed gauge; the gauge says its side, distance and opposite; never counted.

**Checkpoint chains** (ids reported by `checkpoint-done`): `b1` `sign` · `coldest` · `dist`, `b2` `meaning` · `lower`, `b3` `opp` (« ما العدد المعاكس لـ −4؟ ») · `zeroOpp` · `ruleA`, `a1` `bothSides`, `a2` `floorsGap`, `a3` `farther` · `ruleB`. **Callbacks.** `onTrial`: `{ kind:'record', task, ri, want, grad, value, ok, model }`, then `checkpoint` / `checkpoint-done`; `onFinished({})` when every task is done.

**DOM.** `[data-frost-gauge][data-level][data-task][data-scene][data-solved]`, `[data-fg-glance]`, `[data-fg-svg]`, `[data-fg-knob][role=slider][data-grad]`, `[data-fg-tick=<i>]`, `[data-fg-zero]`, `[data-fg-reading=<text>][data-tone]`, `[data-fg-shadow=<value>]`, `[data-fg-distance=<d>]`, `[data-fg-ask]`, `[data-fg-reads]`, `[data-fg-read=<i>][data-state=done|current|todo]`, `[data-fg-less]`, `[data-fg-more]`, `[data-fg-record]`, `[data-fg-verdict]`, `[data-fg-next]`, `[data-fg-step=<i>]`, `[data-fg-free]`, `[data-fg-free-input]`, `[data-fg-free-info]`, `[data-fg-free-back]`, `[data-fg-formal]`, `[data-fg-kid][data-mood]`.

**Layout and bidi.** ONE SVG (`viewBox 640 × 300`, three worlds); the controls are a single « current reading » card (`[data-fg-ask]`: the day and the words), a row of reading chips and the three buttons, so `[data-fg-glance]` stays ≤ 700 px at 1024×768 in both levels. **A negative number in an Arabic sentence is KaTeX (`$-3$`) wrapped in `MathText`, never a plain `−3` with isolates** (the minus drifted to the right of the digits in the checkpoint options); inside SVG text the pill is wrapped in `U+2066 … U+2069`; an EMPTY i18n string (`unit.floors`) makes i18next print its KEY — never store `''`. Tests: `logic/frostGauge.test.js`, `operations/frostGauge.render.test.jsx`, `packages/core/arithmetic/signedGauge.test.js`; e2e `e2e/lesson-kit/1am-adad-nisbiya-siyaqat.mjs`.

## 2novenquinquagies quaterdecies. The stride under the hand — `stride-stamp` (1AM unit 5, lesson `talim-mustaqim-mudarraj`, 2026-10-30)

`operations/StrideStamp.jsx` (+ `operations/strideStamp/art.jsx`: `Backdrop` with the road, the mosque square west and the school east, `Tick`, `Axis`, `Stick`, `Rail`, `House`, `Reading`, `DistanceBar`, `Frame`, `Flag`, `GivenMark`, `Observer`, `KidChip`) on `logic/strideStamp.js` (exact, integers in TENTHS of a unit — through the new `packages/core/arithmetic/graduatedLine.js`: `sideOf`, `distance`, `symmetric`, `areSymmetric`, `floorUnit`, `boundsOf`, `truncUnit`, `originIndex`, `valueAt`, `marksAgree`, `fmt`, `tex`, imported BY PATH); theme `villageroad`; strings `lesson.manipulation.json › strideStamp`. **The hand CARRIES one stride from the origin O to BOTH sides** of a straight village road (the bus stop is O; the school lies east, the mosque square west; the road shows only the 0): the stick-stamp leaves a tick at every stride crossed, and the ticks `−1, −2, −3` exist only once stamped west; then the twin of a house on the other side of O, three houses placed at `A(−3)`, `B(2,7)`, `C(−1,5)`; at متقدم the flag of the ORIGIN planted on a line where only two graduations are written, and a frame ONE stride wide slid between two consecutive ticks. The abscissa is an OUTPUT of the hand (the reading pill writes `−1,5` live; a sign appears only WEST of O). Not `jump-tape` (1AM unit 1: the hand STRETCHES the unit on a half-line and plants flags), not `frost-gauge` (lesson 1: the LEVEL of a vertical gauge), not `corniche-ruler` / `zero-probe` / `gap-caliper` (2AM): here the variable is the UNIT STRIDE carried on both sides of an origin that never moves.

**Tasks** (`levels.js › stride-stamp`): `{ id, kind: stamp | twin | place | origin | bound, … }`; the lab keeps the hand's position in tenths (`pos`; grain = one tick, or one tenth for `place`) and every kind is played with « سجّل … »:

| kind | task data | the job | judged by |
|---|---|---|---|
| `stamp` | `{ stride, reads: [{ at }] }` (`at` in units) | carry the stick from O to the door asked IN WORDS (« 3 خطوات شرق المحطّة »); a stamped tick stays; the stride rail (3 notches 40 / 60 / 90) ERASES the ticks when changed; the road is finite (250 west, 450 east) so a stride too long cannot reach −3 | `judge`: `right`, `edge` (the road ends before the asked position: the stride is too long), `zero`, `side` (right distance, wrong side), `off`, `other` |
| `twin` | `{ reads: [{ of }] }` (tenths) | put the neighbour's house on the other side of O at the same distance (two hatched distance bars) | `right`, `same` (the first house again), `zero`, `off`, `other` |
| `place` | `{ reads: [{ x }] }` (tenths) | put a house at its abscissa (`A(−3)`, `B(2,7)`, `C(−1,5)`) with −/+ 1 unit and −/+ 0,1 | `right`, `side`, `unit` (the decimal part right, the whole units wrong), `tenth`, `other` |
| `origin` | `{ n, u, marks: [{ i, v }, …] }` (2 written graduations, step `u`) | plant the origin flag on the tick that makes both written numbers true; every tick is relabelled live from the flag | `right`, `label` (a written graduation taken as the origin), `off`, `other` |
| `bound` | `{ reads: [{ x }] }` (tenths, never on a tick) | slide a one-stride frame between two consecutive ticks so that it holds the house | `right`, `trunc` (the toward-zero « integer part »: −1,5 framed between −1 and 0), `near`, `other` |

Presets: مبتدئ b1 `stamp` (long stride, reads 3 then −3: the road ends at −2, the student shortens the stride), b2 `twin` (−3 then 2), b3 `place` `A(−3) · B(2,7) · C(−1,5)`; متقدم a1 `origin` (−3 and 3 on ticks 2 and 8: origin tick 5), a2 `origin` (−8 and −2 on ticks 2 and 5, one tick = 2: origin tick 6), a3 `bound` (−1,5 · 2,7 · −0,4). Method task (lesson module 3, `levels={false}`): `M(−4)` then `N(1,6)`.

**Resistance (never the right position):** a wrong record is JUDGED with the student's numbers (« المسافة صحيحة لكنّ الجهة غير صحيحة »), nothing advances; the road ends, the ticks vanish when the stride changes, the relabelled ticks under the flag disagree with the written graduations until the student plants it right. **Always-open « جرّب أعدادك أنت »**: one abscissa from −5 to 5 with at most one decimal; the road says its side, distance, symmetric and (off a tick) its two bounding ticks; never counted.

**Checkpoint chains** (ids reported by `checkpoint-done`): `b1` `sameUnit` (« لماذا نحمل الوحدة نفسها في الجهتين؟ ») · `westSign`, `b2` `symm` · `sameDist`, `b3` `green` (« ما فاصلة البيت الأخضر؟ ») · `between` · `ruleA`, `a1` `originMid`, `a2` `originTick`, `a3` `lastBound` · `ruleB`. **Callbacks.** `onTrial`: `{ kind:'record', task, ri, pos, stride, ok, model }`, then `checkpoint` / `checkpoint-done`; `onFinished({})` when every task is done.

**DOM.** `[data-stride-stamp][data-level][data-task][data-kind][data-solved]`, `[data-ss-glance]`, `[data-ss-svg]`, `[data-ss-knob][role=slider][data-pos]`, `[data-ss-tick=<text>][data-tone]`, `[data-ss-reading=<text>][data-tone]`, `[data-ss-rail]`, `[data-ss-stride=<0|1|2>][data-active]`, `[data-ss-house=<id>]`, `[data-ss-twin]`, `[data-ss-distance=<d>]`, `[data-ss-frame]`, `[data-ss-flag]`, `[data-ss-given=<text>]`, `[data-ss-ask]`, `[data-ss-reads]`, `[data-ss-read=<i>][data-state=done|current|todo]`, `[data-ss-less]`, `[data-ss-more]`, `[data-ss-less-tenth]`, `[data-ss-more-tenth]`, `[data-ss-record]`, `[data-ss-verdict]`, `[data-ss-next]`, `[data-ss-step=<i>]`, `[data-ss-free]`, `[data-ss-free-input]`, `[data-ss-free-info]`, `[data-ss-free-back]`, `[data-ss-formal]`, `[data-ss-kid][data-mood]`.

**Layout and bidi.** ONE SVG (`viewBox 760 × 300`; labels ≥ 26 units so they stay ≥ 14 px at the tablet column), the controls are one « current reading » card (`[data-ss-ask]`), a row of reading chips (hidden for `origin`) and the buttons (in an LTR row: `−` left, `+` right), so `[data-ss-glance]` stays ≤ 700 px at 1024×768 in both levels. A negative number in an Arabic sentence — including the free card's hint (`−5 … 5`) — is KaTeX inside `MathText` (a plain `−5` after Arabic text drifts to `5−`); inside SVG text the pill is wrapped in `U+2066 … U+2069`; the stride rail is placed BEFORE its visuals in its `<g>` so a click on a notch reaches the handler. Tests: `logic/strideStamp.test.js`, `operations/strideStamp.render.test.jsx`, `packages/core/arithmetic/graduatedLine.test.js`; e2e `e2e/lesson-kit/1am-talim-mustaqim-mudarraj.mjs`.

## 2novenquinquagies quindecies. The inverse card under the hand — `rewind-belt` (1AM unit 6, lesson `bahth-adad-naqisa`, 2026-10-30)

`operations/RewindBelt.jsx` (+ `operations/rewindBelt/art.jsx`: `Backdrop`, `Belt`, `CardPlate`, `Machine`, `Bin`, `Tray`, `Crate`, `Observer`, `KidChip`) on `logic/rewindBelt.js` (exact, RATIONALS — through the new `packages/core/arithmetic/missingNumber.js`: `Q`, `parse`, `text`, `latex`, `card`, `run`, `inverse`, `missing`, `judgePick`, `family`, `isTerminating`, imported BY PATH); theme `packingline`; strings `lesson.manipulation.json › rewindBelt`. **The hand holds the CARD that runs a belt BACKWARD, then the crate**: in a school-supplies packing workshop a machine with a card (« + 9 », « − 14 », « × 6 » or the trap card « 80 − ») received a number of items and gave 54; the hand PICKS from a rack the card that rewinds the belt, DRAGS the crate from the output tray through the machine to the input bin (the missing number □ appears on the crate as it crosses the machine), then PUSHES it forward through the ORIGINAL machine: what comes out is compared with 54 (the check by substitution). The missing number is an OUTPUT; the student never types one. Not `story-bars` (stretches an unknown bar), not `elevator-reel` / `zero-probe` (signed numbers), not the 2AM equation labs (the equation is solved by balancing there): here the hand holds an OPERATION CARD and the belt direction.

**Tasks** (`levels.js › rewind-belt`): `{ id, kind: add | sub | rsub | mul | div, a, out, rack }` — the machine card is « kind a » (`add` « + a », `sub` « − a », `rsub` « a − □ », `mul` « × a », `div` « ÷ a »), `out` the number it gave, `rack` 3–5 cards of which EXACTLY ONE rewinds it (`normalizeTasks` refuses otherwise; the inverse of `add` is `sub`, of `mul` is `div`, `rsub` is its own inverse). Numbers are decimal TEXTS with a comma (`'17,5'`).

| step | gesture | state (`logic/rewindBelt.js`) |
|---|---|---|
| pick a card | tap in the rack (only at the edge of the belt: phase `rewind`, `pos = 0`) | `pickCard` |
| rewind | drag the crate output → input (`setPos`; keys ←/→, « أكمل الحزام ») ; the crate shows the number the PICKED card produces on crossing the machine ; `pos` is snapped to 0 / 1 within 3 % | phase `rewind` → `check` (dock) |
| check | drag it back through the machine | phase `check` → `done` (what comes out = `out`) or `miss` |
| try again | « جرّب بطاقة أخرى » | `retryPick` |

**Resistance (never the right card).** A wrong card is not corrected: the check says what comes out with the student's numbers (« وضعتَ 63 في الآلة فخرج 72 بدل 54 »). `judgePick` models: `same` (the machine's own card), `family` (× ÷ for a + − machine and conversely), `trap` (« + » or « − » on the card « 80 − »: 134 then −54), `neg` (the result would be negative: the belt JAMS, the crate stops inside the machine), `other`. The bank reuses them as `MISC-NAQISA-*` (`SAMEOP`, `FAMILY`, `TRAPADD`, `REVSUB`, `MULAGAIN`, `DIVREV`, `APPROX`, `DECALIGN`, `WRONGEQ`, `OPERAND`, `ORDER`).

Presets: مبتدئ b1 `+ 9 → 54` (□ = 45), b2 `− 14 → 54` (□ = 68), b3 `× 6 → 54` (□ = 9), b4 `80 − → 54` (□ = 26, rack `+ − 80 −`); متقدم a1 `+ 17,5 → 46,2` (□ = 28,7), a2 `12,5 − → 4,8` (□ = 7,7), a3 `× 7 → 20` (the division does NOT stop: the crate carries `20/7`, the check `20/7 × 7 = 20` is exact — a quotient written as a fraction, as in `hasil-qisma-kasr`). Method tasks (lesson module 3, `levels={false}`): `+ 18,6 → 45,1` and `× 13 → 41,6`. **Always-open « جرّب آلتك أنت »**: kind (`+ − a − ×`), the number on the card, what came out; the lab says the missing number (a fraction when the division does not stop) and its check; negative numbers are refused; never counted.

**Checkpoint chains** (ids reported by `checkpoint-done`): `b1`–`b3` `card` (« أيّ بطاقة تعيد الآلة إلى الوراء؟ ») · `check` (« تحقّق: ماذا يخرج إذا أدخلنا العدد الذي وجدته؟ »), `b4` `trapCard` · `check` · `ruleA`, `a1` `card` · `check`, `a2` `trapCard` · `check`, `a3` `divStops` · `check` · `ruleB`. **Callbacks.** `onTrial`: `{ kind:'rewind' | 'check', id, ok, model, pick, found, fwd }`, then `checkpoint` / `checkpoint-done`; `onFinished({})` when every task is done.

**DOM.** `[data-rewind-belt][data-level][data-task][data-phase][data-solved]`, `[data-rb-glance]`, `[data-rb-svg]`, `[data-rb-crate][role=slider][data-pos][data-value]`, `[data-rb-rack]`, `[data-rb-card=<kind>][aria-pressed]`, `[data-rb-run]`, `[data-rb-retry]`, `[data-rb-next]`, `[data-rb-machine]`, `[data-rb-slot][data-pick]`, `[data-rb-bin][data-filled]`, `[data-rb-tray]`, `[data-rb-verdict]`, `[data-rb-step=<i>]`, `[data-rb-eq]`, `[data-rb-free]`, `[data-rb-free-kind=<k>]`, `[data-rb-free-a]`, `[data-rb-free-b]`, `[data-rb-free-info]`, `[data-rb-free-back]`, `[data-rb-formal]`, `[data-rb-kid][data-mood]`.

**Layout and bidi.** ONE SVG (`viewBox 640 × 330`, LTR like the book's « دخول ← خروج » diagram: input bin on the left, machine, output tray on the right); the chevrons of the belt point LEFT while it rewinds and RIGHT for the check; the output tray and the input bin carry a sign board ABOVE the crate so the known number stays visible when the crate (carrying the check result) sits on it. Controls: the rack of cards (HTML, `dir=ltr`, « + 9 » is `<span>+</span><bdi>9</bdi>`), « أكمل الحزام », then the verdict banner; `[data-rb-glance]` is 602–665 px high at 768/1024 wide. Numbers in Arabic sentences are KaTeX (`$-54$`, `$\frac{20}{7}$`) in `MathText`; inside SVG text they are wrapped in `U+2066 … U+2069`. Tests: `logic/rewindBelt.test.js`, `operations/rewindBelt.render.test.jsx`, `packages/core/arithmetic/missingNumber.test.js`; e2e `e2e/lesson-kit/1am-bahth-adad-naqisa.mjs`.

## 2novenquinquagies sexdecies. The one-axis drone under the hand — `courtyard-drone` (1AM unit 5, lesson `talim-fi-mustawi`, 2026-10-30)

`operations/CourtyardDrone.jsx` (+ `operations/courtyardDrone/art.jsx`: `Backdrop`, `Axes`, `Pole`, `Thing` (ten courtyard objects seen from above), `Guides`, `Drone`, `Refusal`, `Reading`, `Feet`, `KidChip`) on `logic/courtyardDrone.js` (exact, integers in TENTHS of a unit — through the new `packages/core/arithmetic/planeFrame.js`: `swap`, `swapIsSame`, `onAxis`, `reflectX`, `reflectY`, `reflectO`, `quadrant`, `sameQuadrant`, `matching`, `floorTick`, `ring`, `score`, `originFrom`, `coordsOfCell`, `pair`, `pairTex`, imported BY PATH; it re-exports `fmt` / `tex` of `graduatedLine.js`); theme `schoolcourt`; strings `lesson.manipulation.json › courtyardDrone`. **The hand drives a DRONE over the plan of a school courtyard, ONE AXIS AT A TIME**: the flag pole is the origin O, two yellow lines painted on the ground (numbered, never named in the lab) are the axes; the drone starts at O and first rolls ONLY along the horizontal line (phase `x`), « ثبّت الأفقي » fixes that position, then it rises or falls ONLY along the vertical through it (phase `y`), and « صوّر » takes the photo. **The drone REFUSES a diagonal**: a key of the other axis, or a drag that leaves the lane by more than 1,7 cells, does not move it — it shakes and a red crossed diagonal is drawn (`[data-cd-refused]`, verdict `refused`). The pair `(x ; y)` is an OUTPUT of the hand (the reading pill writes it live, the sign only where the number is negative); the ORDER of the two numbers is the hidden idea: driving `−2` first and `3` second lands on `(−2 ; 3)`, another place. Not `stride-stamp` (lesson 2: ONE stride carried on ONE line), not `frost-gauge` (a level on a vertical gauge), not the 2AM `dig-grid` / `corniche-ruler` (the consolidation of the plane, a different gesture), not `tile-yard` (a tile under the hand; theme `courtyard`).

**Tasks** (`levels.js › courtyard-drone`): `{ id, kind: fly | read, paper: squared | plain, reads: [{ x, y, what }] }` (x, y in tenths, a unit = one tile; `what` ∈ `fountain door bench tap gate kiosk tree board chair well`); the hand's pace is a whole tile at مبتدئ and a HALF tile when the id starts with `a`; the courtyard is `|x| ≤ 5`, `|y| ≤ 4`.

| kind | reads | the job | judged by |
|---|---|---|---|
| `fly` | the place is SAID by its two numbers (« صوّر النافورة عند (3 ; −2) »); nothing is drawn until it is photographed | apply the numbers in the right ORDER (x on the horizontal, then y on the vertical) | `judge`: `right`, `swap` (the numbers in the opposite order: another place; the swapped point must stay inside the courtyard, checked by `normalizeTasks`), `signx` / `signy` / `signs` (a right distance on the wrong side), `one` (one coordinate right), `other` |
| `read` | the object is DRAWN with a dashed ring (« المطلوب: البوابة »); no number is said | put the drone over it in two moves; the pill reads `(x ; y)`; the reading is then asked as a question | the same models |

`paper: 'plain'` draws NO grid (only the two numbered axes) and the drone projects its two PARALLELS to the axes as dashed lines and puts the abscissa under the foot of the vertical (the book's method on non-squared paper).

Presets: مبتدئ b1 `fly` the fountain `(3 ; −2)` then the library door `(−4 ; 1)` (swapped: `(−2 ; 3)`, `(1 ; −4)`), b2 `fly` the bench `(4 ; 0)` then the tap `(0 ; −3)` (two points of an axis: a number that is zero), b3 `read` the gate `(−3 ; 2)` then the kiosk `(2 ; −4)`; متقدم (`...T('self-10')`) a1 `read` squared in half tiles `(1,5 ; −3)`, `(−2,5 ; 1,5)`, a2 `read` plain `(−4 ; 3)`, `(3,5 ; −2)`, a3 `fly` plain `(2,5 ; −1,5)`, `(−1 ; 0,5)`. Method task (lesson module 3, `levels={false}`): plain paper, `A(−4 ; 3)` then `C(0 ; −4)`.

**Resistance (never the right place):** a wrong photo is JUDGED with the student's numbers (« حطّت المسيّرة عند (−2 ; 3) وهو مكان آخر: العددان نفسهما، لكنّ كلًّا منهما على الخط الذي ليس له »), nothing advances, the drone stays where it landed; the lock is undone with « عُد للأفقي » (the drone returns to the axis); the next place starts again at O. **Always-open « جرّب أعدادك أنت »**: two numbers (`|x| ≤ 5`, `|y| ≤ 4`, one decimal); the plan says its axis (or « the flag pole »), its swapped place `(y ; x)` and that swapping changes nothing when the two numbers are equal; never counted.

**Checkpoint chains** (ids reported by `checkpoint-done`): `b1` `swapped` (« هل تصل المسيّرة إلى المكان نفسه إذا بدّلنا العددين؟ ») · `firstAxis`, `b2` `axisZero` · `abscissaZero`, `b3` `gate` (« ما إحداثيا البوابة؟ ») · `ruleA`, `a1` `halfRead`, `a2` `plainGuide`, `a3` `between` · `ruleB`. **Callbacks.** `onTrial`: `{ kind:'record', id, ri, x, y, refusals, ok, model }`, then `checkpoint` / `checkpoint-done`; `onFinished({})` when every task is done.

**DOM.** `[data-courtyard-drone][data-level][data-task][data-kind][data-paper][data-phase][data-solved]`, `[data-cd-glance]`, `[data-cd-svg]`, `[data-cd-knob][role=slider][data-x][data-y]`, `[data-cd-drone]`, `[data-cd-grid]`, `[data-cd-axes]`, `[data-cd-tick=<x|y><v>]`, `[data-cd-pole]`, `[data-cd-thing=<what>][data-state=idle|target|done]`, `[data-cd-guide=<phase>]`, `[data-cd-refused]`, `[data-cd-reading=<text>]`, `[data-cd-ask]`, `[data-cd-reads]`, `[data-cd-read=<i>][data-state]`, `[data-cd-left|right|up|down]`, `[data-cd-lock]`, `[data-cd-unlock]`, `[data-cd-record]`, `[data-cd-verdict=wrong|right|refused|free]`, `[data-cd-next]`, `[data-cd-step=<i>]`, `[data-cd-free]`, `[data-cd-free-x]`, `[data-cd-free-y]`, `[data-cd-free-info]`, `[data-cd-free-back]`, `[data-cd-formal]`, `[data-cd-kid][data-mood]`.

**Layout and bidi.** ONE SVG (`viewBox 640 × 442`, a courtyard of 11 × 9 tiles so the tiles stay SQUARE — the unit is the same on both axes; labels ≥ 22 units); the controls are ONE card: the current place (`[data-cd-ask]`) with the read counters beside it, then ONE row `◀ ▶ ▼ ▲ · ثبّت الأفقي · صوّر` in an LTR row (the arrows of the axis that is not active stay pressable on purpose: pressing one is the refusal). `[data-cd-glance]` is ≈ 730–760 px high at 1024×768 (a tall plane cannot be as flat as the 760 × 300 road: the e2e checks ≤ 760, not the 700 of `stride-stamp`). A pair in an Arabic sentence is KaTeX `$(−2\,;\,3)$` in `MathText` (the thin spaces keep the minus attached to its digit); inside SVG text the pill is wrapped in `U+2066 … U+2069`. Tests: `logic/courtyardDrone.test.js`, `operations/courtyardDrone.render.test.jsx`, `packages/core/arithmetic/planeFrame.test.js`; e2e `e2e/lesson-kit/1am-talim-fi-mustawi.mjs`.

## 2novenquinquagies septdecies. The dial value under the hand — `letter-dial` (1AM unit 6, lesson `tatbiq-qaida-harfiya`, 2026-10-30)

**What the hand holds.** The VALUE of each letter of a literal rule, on a rotary DIAL (one dial per letter). A copy-shop price board prints « الثمن = 5 × n + 20 » with its letter in a dashed slot; turning the dial of n drops the value into EVERY slot of the letter and the card computes on a tape (`5 × 12 + 20` → `60 + 20` → `80`), the cash-register screen shows the result. The substituted line always shows the explicit × (never `512`).

**Tasks** (`levels.js › letter-dial`): `{ id, kind: set | find | claim, name, formula | left+right, dials: { <letter>: { max, start? } }, target | out }`. Rules are texts (`'5*n+20'`, `'2*(a+b)'`, `'a+b'`; `*` is ×, an implicit product `2x`, `ab`, `3(x+2)` is READ as a product and RENDERED with ×). `set`: put the dials on the asked values; `find`: turn until the card shows `out` (`normalizeTasks` refuses a task reachable by 0 or 2 values); `claim`: a pretended rule `left = right` that HOLDS at the dials' start ((2 ; 2): 4 = 4) — the task is done at the first release on values where the comparator shows ≠ (one counterexample; refused if none exists). مبتدئ: b1 n = 12 → 80, b2 the customer who paid 95 (n = 15), b3 « 5 × n + 20 − n » (n written TWICE, n = 10 → 60). متقدم: a1 « P = 2 × (a + b) » with 15 and 8 → 46 (two dials, brackets first), a2 the swapped values → 46, a3 « a + b = a × b ». Module 3 poses it alone (`levels={false}`): m1 « 4 × n + 15 », m2 « 2a = a + 2 ».

**Resistance.** A value counts only when the hand LETS GO of the dial (`release`): passing through 12 on the way to 20 finishes nothing; for `claim`, a pair where the rule holds says so without a verdict (« 4 و 4 »). Nothing names the rule: the board says what the card computed, never what to do. The five distractors of the questions over the lab are the lesson's named misreadings (the value glued to the number 512, only the first slot, brackets ignored, the fixed part forgotten, a single true example).

**Gesture and a11y.** The dial is `role="slider"` (`data-ld-dial=<letter>`): drag around the knob (absolute angle from −150° to +150°, the dead zone at the bottom sticks to the ends), ± buttons (48 px), arrows ±1, PageUp/PageDown ±5, Home/End. Distinct from the 2AM `wax-cells` (cells counted), `juice-line` (an unknown to FIND by inverse operations), `bridge-load` (counts of sacks tested against a rule) and from `kit-packer`'s dials (round-number packing): here a number is turned and substituted into a printed letter.

**Free panel « جرّب قاعدتك أنت »** (always open): a typed rule with one or two lowercase letters; `2x` is read `2 × x` (a 0–20 dial per letter, `letterRule.js › tokenize` reads the implicit product); an invalid text says why (`empty`, `chars`, `unreadable`, `noletter`, `toomany`). Never counted.

**Lab prototype (§8quinquies).** `CHAINS` (b1 `pay · slot`, b2 `grow · count`, b3 `twice · promoPay · ruleA`, a1 `fence · first`, a2 `swap`, a3 `oneNo · oneYes · ruleB`) through `useLabCheckpoint`, `LabStepper`, `useStepCelebration`, `playSfx` (`gesture` per notch, `flag`/`bell` when a task is done), `LabCoach` (`sa.labCoach.letter-dial.off`: `dial`, `claim`, `again`, `next`), full screen and « إعادة ». Maths: `packages/core/arithmetic/letterRule.js` (exact rationals, tokenizer, `steps`, `compare`; imported BY PATH).

**DOM.** `[data-letter-dial][data-level][data-task][data-phase][data-solved]`, `[data-ld-glance]`, `[data-ld-stage]`, `[data-ld-svg]`, `[data-ld-register][data-lit]` / `[data-ld-register-text]`, `[data-ld-compare][data-eq]`, `[data-ld-board]`, `[data-ld-slot=<letter>][data-filled]`, `[data-ld-tape]`, `[data-ld-row=<i>]`, `[data-ld-dial=<letter>][data-value]`, `[data-ld-less|more=<letter>]`, `[data-ld-verdict]`, `[data-ld-next]`, `[data-ld-step=<i>]`, `[data-ld-free]`, `[data-ld-free-input]`, `[data-ld-free-dial=<letter>]`, `[data-ld-free-info]`, `[data-ld-free-back]`, `[data-ld-formal]`, `[data-ld-kid][data-mood]`. Strings: `lesson.manipulation.json › letterDial`. Tests: `logic/letterDial.test.js`, `operations/letterDial.render.test.jsx`, `packages/core/arithmetic/letterRule.test.js`; e2e `e2e/lesson-kit/1am-tatbiq-qaida-harfiya.mjs`. Layout: HTML board + tape + a cropped shop SVG (`viewBox 640 × 128`) + one or two 104 px dials; `[data-ld-glance]` is 715 px (مبتدئ) and 739 px (متقدم) high at 1024×768 with the sidebar open (column ≈ 414 px; e2e threshold 760, the ≤ 700 target is not met because of the two-dial level and the 4-line tape of b3).
