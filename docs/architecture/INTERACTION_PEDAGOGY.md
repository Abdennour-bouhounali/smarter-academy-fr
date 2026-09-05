# Smarter Academy — Interaction & Manipulation Pedagogy

> **The contract for how a mathematical concept becomes understandable through manipulation in a
> Smarter Academy lesson.** It is written for AI coding agents and developers who design,
> generate, refactor, or audit lessons. It is not a lesson, not an article, and not a UI template.
>
> Sibling contracts stay normative on their own ground — `ARCHITECTURE.md`, `LESSON_CONTRACT.md`
> (module structure, stages, durations, learning-point wiring), `EXERCISE_CONTRACT.md`,
> `PROGRESS_MODEL.md`, `LEARNING_ARCHITECTURE.md`, `AI_LESSON_CONTRACT.md`,
> `LESSON_INTEGRATION_GUIDE.md`, `CLAUDE.md`. `LESSON_DESIGN_PLAYBOOK.md` is the operational
> synthesis. **Precedence:** on any question of *what the student manipulates, what they must
> notice, how feedback is worded, how scaffolding disappears*, this document wins. On lesson
> structure, stage vocabulary and validator rules, `LESSON_CONTRACT.md` and
> `scripts/validate-lessons.mjs` win. When the playbook disagrees with this document, update the
> playbook.

Every file path below is repo-relative. Components are cited as **examples of interaction
primitives**, never as mandatory building blocks. A new lesson may reuse them, extend them, or
build its own — the rules in this document apply either way.

---

## 1. Core pedagogical principle

> **The student should experience the mathematics before being asked to memorize or apply its
> formal language.**

The Smarter Academy progression:

```
REAL → DISCOVER → MANIPULATE → UNDERSTAND → TOUCH THE MATH → FORMALIZE → AUTOMATIZE → TRANSFER
```

| Stage | What happens | What the student does |
|---|---|---|
| **REAL** | A short concrete situation creates a mathematical need. | Looks, recognizes the problem. |
| **DISCOVER** | One question makes the need explicit and opens curiosity. | Wonders, maybe predicts. |
| **MANIPULATE** | The student receives a mathematical instrument and acts on the object. | Cuts, moves, fills, groups, resizes… |
| **UNDERSTAND** | The consequence is visible; the student notices what changed and what stayed. | Observes, compares, retries. |
| **TOUCH THE MATH** | The number / symbol appears *attached to the thing just manipulated*. | Reads the number as a description of their action. |
| **FORMALIZE** | Vocabulary, notation, rule, property — named, not derived from scratch. | Names what they already know. |
| **AUTOMATIZE** | Short exercises with the manipulation progressively removed. | Answers faster, with less support. |
| **TRANSFER** | The same idea in another representation or another real situation. | Recognizes the concept elsewhere. |

The representational ladder inside a lesson is always:

```
Concrete → Visual → Numerical → Symbolic → Automatic
```

**Do not begin with a mathematical rule when the concept can first be discovered through an
interaction.** A rule that opens a module is a rule the student has no reason to believe yet.

### 1.1 Vocabulary mapping

Three vocabularies exist in the repo. They describe the same journey; use the one the context
demands.

| This guide (design vocabulary) | `stage` in `lesson.config.js` (machine-checked) | `.agents/AGENTS.md` (French loop) |
|---|---|---|
| REAL | `trigger` | Je découvre |
| DISCOVER | `discovery` | Je découvre |
| MANIPULATE · UNDERSTAND · TOUCH THE MATH | `manipulation` (may fold into `discovery`) | Je manipule · Je comprends |
| FORMALIZE | `formalization` | Je formule la règle |
| AUTOMATIZE | `practice_lab` | Je m'entraîne · Je détecte mon erreur |
| TRANSFER | `practice_lab` → `evaluation` | Je réutilise · Je maîtrise |

`stage` values come from `packages/core/curriculum/lessonStages.js` and are enforced by
`scripts/validate-lessons.mjs`. The names in this guide are for *designing*; the `stage` field is
for *declaring*.

---

## 2. The "Touch the Math" principle

**Touching the mathematics** means the student manipulates something that has a genuine
mathematical relationship with the concept: the thing under their finger *is* the variable of the
concept, or a faithful image of it.

Canonical touches:

- divide a whole · change a numerator · change a denominator · build a fraction
- move a point on a number line · move a point and observe coordinates
- resize a rectangle · fill a container · group objects · distribute quantities
- construct an angle · transform a geometric figure · modify a coefficient and observe a graph
- balance two quantities · compose / decompose a number

### TRUE MANIPULATION

**An action changes a mathematical state.** Tapping a part of `PartitionShape`
(`apps/web/src/lessons/college/6e/nombres_calculs/fractions/components/PartitionShape.jsx`)
adds an index to `cells`; the numerator *is* `cells.length`. Dragging the cursor of `NumberLine`
(`apps/web/src/lessons/common/components/NumberLine.jsx`) in `mode="place"` sets `value`; the
position *is* the number.

### FAKE INTERACTION

**An action only changes the interface, or asks the student to click an answer.**

- decorative animations
- clicking "next"
- clicking a pre-existing answer
- opening information cards
- animations the student does not control
- drag-and-drop where the drop position has no mathematical meaning
- a button that flips a `phase` flag to reveal text the student did not produce

Reveal buttons and choice questions are legitimate *around* a manipulation (prediction, reading,
formalization). They are not the manipulation.

> **If removing the interaction would not change the mathematical reasoning, the interaction is
> probably decorative rather than pedagogical.**

---

## 3. The interaction loop

The canonical loop for one micro-competence. In kit terms (`common/kit/ContentModule.jsx`): the
situation and question live in the `MissionBrief` or the step title, the manipulation is the step
body, observation is the derived visual, and formalization is the reveal that closes the step.

### 1. REAL EXAMPLE
Start from a meaningful situation: sharing, measuring, buying, filling, travelling, building,
comparing, arranging, counting, cooking, geometry in space. **The situation must create a
mathematical need.** Reject stories that add reading load without helping the concept.

### 2. DISCOVER
One short question that creates curiosity: «Peux-tu faire exactement la moitié ?» · «Comment
décrire cette quantité ?» · «Laquelle est la plus longue ?» · «Que se passe-t-il si on partage en
plus de parts ?» · «Peux-tu rendre les deux quantités égales ?». **Do not give the rule.**

### 3. MANIPULATE
Give the student a mathematical instrument. The student acts on the mathematical object. The
instrument's controls are the concept's own variables (§4, §5).

### 4. OBSERVE
The interface visibly reflects the consequence of the student's action, immediately, with no
validation click in between.

### 5. UNDERSTAND
Help the student identify the invariant or relationship (§7). One or two sentences, no more.

### 6. TOUCH THE MATH
Expose the numerical / symbolic representation *connected to the manipulation*:
`visual quantity ↔ number ↔ fraction`, or `geometric object ↔ measurement ↔ formula`.

### 7. FORMALIZE
Only now: vocabulary, notation, rule, formula, property. The reference pattern is
*reveal-as-conclusion*: in `Module02Construire.jsx` (fractions) the phases are `split → take →
reveal`; the fraction appears last, as the name of what the student built.

### 8. AUTOMATIZE
Short exercises progressively remove the manipulation (§15).

### 9. TRANSFER
The same mathematical idea in another representation or another real situation.

---

## 4. Types of mathematical manipulation

A primitive is **appropriate when the variable the student controls is the concept's own
variable.** If the concept is "denominator", the control must change the number of equal parts —
not scroll a carousel of pre-cut pizzas.

| Primitive | Student controls | Mathematical state | Appropriate when | Existing examples (not mandatory) |
|---|---|---|---|---|
| **A. Partition** | how many equal parts; which parts are taken | denominator, numerator, ratio, area share, probability | the concept is *about* equal parts or the whole/part relation | `PartitionShape` (`weights` allows deliberately unequal parts for the "4 morceaux ≠ 4 parts égales" conflict); `ObjectGroup` (fractions of a collection — the student selects *groups*, never single objects) |
| **B. Combine / Compose** | which pieces join | sum of fractions, of lengths, of expressions; composed figure | the concept is additive or compositional | `ShapeComposer` (aires: tap piece → tap slot); `FormulaBuilder` (perimetres: chips → formula tokens) |
| **C. Move** | position of an object | abscissa, coordinate, measure read at a position | the concept is a *position* or a *value on a continuum* | `NumberLine` mode `place`; `Ruler` mode `place-object`; `ReferenceRuler` (estimate with a 1 m reference) |
| **D. Resize** | a dimension or scale | length, width, area, volume, scale factor | the concept links dimensions to a derived quantity | none shared yet — design note: two steppers (width, height) driving one rectangle whose area and perimeter mirrors update live |
| **E. Fill / Empty** | how much is in a container | capacity, fraction / percentage of a whole, volume | the concept is a *quantity relative to a capacity* | `MeasureFillMission` + `LiquidContainer` (one `fillPct` prop drives level, wave, overflow) |
| **F. Group / Ungroup** | how objects are bundled | place value, factors, equal groups, powers of ten | the concept is a *structure of a count* | `GroupBuilder`, `EqualShareBoard` (nombres-entiers); `UnitGrid` (nombres-decimaux, tenths/hundredths) |
| **G. Compare** | which of two objects is bigger / first / heavier | order, equality, ratio | the concept is a *relation* between two objects | `OrderingGame` (tap-to-order, reports first break point); `Balance` + `ItemBank` (masses) |
| **H. Construct** | the object itself, from nothing | the target fraction, angle, figure, graph | the concept is a *definition* the student must instantiate | `FractionBuilder` (stepper + denominator options); `AreaGrid` (paint cells); `PolygonPerimeter` (tap sides in contour order) |
| **I. Transform** | a transformation parameter; the unit of description | image of a figure; same magnitude in another unit | the concept is an *invariant under change* | `ConservedSegment`, `ConservedMass` (unit changes, bar never moves); geometry via `common/utils/geometry2d.js` (`reflectPoint`, `isSymmetryAxis`) |
| **J. Balance** | what goes on each side | equality of two sums, equation state | the concept is *equality maintained under the same operation on both sides* | `Balance` (tilt derived from the two mass sums) |
| **K. Adjust a parameter** | one number via stepper / slider / chip | coefficient, slope, denominator, radius, unit, time | the concept is *how one output depends on one input* | `UnitSwitcher`; `ClockFace` (drag + mandatory ±buttons); `CircleUnroller` (`step` 0..4 rolls the circle) |

Choose the **fewest** primitives that expose the concept's variable. A lesson rarely needs more
than two.

---

## 5. One action → one mathematical consequence

> **Every important interaction has a clear mathematical consequence.**

```
ACTION → MATHEMATICAL STATE → VISUAL CONSEQUENCE → SYMBOLIC CONSEQUENCE
```

Bad: the student drags a decorative object and an unrelated number changes.

Good: the student moves the cursor from 2 to 3 on the number line; `value` becomes `3`; the cursor
redraws at `toX(3)`; the label shows `3`. With a fractional formatter
(`fracLineFormat(den)` in `fractionUtils.js`) the same `value = 1` shows as `4/4` then `1`, and
the student sees that both names point at one position.

Implementation rule: the visual and the symbol are **both derived from the same state** (§28).
Never animate the visual and then set the number separately — they must be unable to disagree.

---

## 6. Manipulation before explanation

When a concept can be discovered through manipulation, **do not explain first.** Instead:

1. show the situation
2. ask a question
3. allow manipulation
4. let the student observe
5. highlight the pattern
6. name the concept
7. formalize it

Audit every module's copy against its stage: a `trigger` or `discovery` module that states the
rule in its first paragraph has failed this section.

### When explicit explanation is appropriate

Do not force discovery when it would only create frustration. Explain directly when:

- the content is a **convention**, not a relationship: the symbol `%`, the name of a unit, the
  order of operations, how a fraction is written, the name "numérateur";
- the definition has **no discoverable invariant** (a term is just a label);
- the student has **failed the same manipulation twice**: switch to a short worked explanation,
  then return to the manipulation with a smaller step;
- a **prerequisite gap** has been surfaced (by a `Module00Diagnostic` / `PrerequisiteDiagnostic`)
  and the student needs the prior fact stated before they can act;
- the module's stage is `formalization` or later — the experience has already happened.

Even then: explain in one short block, then immediately give the student something to do with it.

---

## 6bis. Every lesson opens with a signature manipulation

> **Module 1 of every lesson is a mathematical laboratory, not an introduction.** The student
> must be able to *cause* the lesson's central phenomenon to happen — and want to try again —
> before anything is named, defined or written as a formula.

The test of a Module 1 is the sentence the student says after thirty seconds: *« Qu'est-ce qui se
passe ? Je réessaie. »* If the honest sentence is *« D'accord, j'ai lu »*, the module is a page,
not a laboratory.

### 6bis.1 The arc of the opening module

```
REAL SITUATION → CURIOSITY → PREDICTION → MANIPULATION → OBSERVATION → DISCOVERY → MATHEMATICAL QUESTION
```

- **Real situation** — two sentences in the `MissionBrief`, an object on screen (§19). Only when
  the context serves the mathematics; a die, a taxi meter, a market scale and a phone battery
  earned their place, a decorative story does not.
- **Curiosity** — one question the student cannot yet answer (« Que paie-t-on pour 0 km ? »).
- **Prediction** — a `TapQuestion` or `NumericQuestion` *before* the system answers (§9). The
  wrong prediction is the most memorable moment of the module; the reveal comes from the
  manipulation, not from the feedback text.
- **Manipulation** — the student changes the concept's own variable (§4, §5) and the consequence
  appears at once, with no validation click in between.
- **Observation → discovery** — the invariant or the predictable change becomes visible (§7):
  the same input redraws the same output; the coins double with the cherries; the trace starts
  above zero; the points line up; the probe reads one altitude per hour.
- **Mathematical question** — the module ends by *asking* what later modules will name, never by
  defining it. Formal vocabulary and `f(x)` notation belong to the module whose stage is
  `discovery`/`formalization` (§6, §14).

Only after this arc may explanation begin — in the next module.

### 6bis.2 Design the manipulation from the mathematics, not from a widget list

Do not ask « quelle interaction ajouter ? ». Ask, in this order:

1. **What is the central idea of the lesson?** (one sentence, curriculum-precise — §23 step 1)
2. **What makes it hard or counter-intuitive?** — the misconception, the invisible relation,
   the invariant, the cause/effect the student usually misses.
3. **What can the student manipulate to make that idea visible?** — and only then choose the
   control (§16: tap → stepper → chip → slider → drag).

A slider, a drag-and-drop, an MCQ or an animation is never the answer to question 3 by itself.
The answer is a *phenomenon the student can make happen*: throw the die again, double the mass,
drive the taxi back to 0 km, place the fifth point, slide the probe to 400 m.

**Each lesson must have its own mathematical identity.** Reuse the *quality* of a proven
opening, never the exact interaction: a graph plus a slider used five times with different labels
is five failures, not one success. The five 3e function lessons are the precedent —

| Lesson | Opening laboratory | Phenomenon the student makes happen | What is *not* done here (later module) |
|---|---|---|---|
| Fonctions | the mystery machine (`FunctionMachine` + `RuleTester`) | any number in — including the student's own — one number out; a candidate rule is replayed on **all** recorded couples; a never-tried input is predicted then confirmed; the same input redraws the same output; the couples reappear as list, table, points | naming image / antécédent / `f(x)` (M2); placing the points oneself (M4) |
| Fonctions linéaires | the market scale (`ScalingLab`) | slide the mass: cherries and coins grow together; double the mass, the coins double; the recorded couples align through O; a 1 € tray shifts every point and the line misses O | varying the coefficient (M2); the pivot invariant when `a` changes (M3) |
| Fonctions affines | the taxi meter (`TaxiMeter`) | drive: the meter starts at the pick-up fee, climbs per km; back to 0 km, you still pay; switch company: the start moves *or* the climb changes | continuous `a` / `b` sliders, staircase, the names *coefficient directeur* / *ordonnée à l'origine* (M2–M4) |
| Représentation graphique | build the battery graph (`CoordPlane`, grid nodes only) | predict the shape, place the five rows as points, join, predict the empty time, extend the line to 0 % | placing between graduations (M3); choosing the scale (M4) |
| Lecture graphique | the probe on the balloon flight (`GraphProbe showPair`) | sweep the whole flight; bring the probe to 3 h; predict 5 h → 6 h; find *an* hour at 400 m — and learn there are four | the horizontal guide and the word antécédent (M2); extremums, variations (M4) |

The last column is as important as the middle one: an opening manipulation **prepares** the
lesson (Module 1 « I experienced it » → Module 2 « I understand it » → later « I can use it »)
and must leave each later module something to discover. Audit Module 1's copy against every
later module's responsibility (playbook §6) before shipping it.

### 6bis.3 Requirements checklist for Module 1

- **Meaningful variables only.** Expose the variables that reveal the concept (mass, distance,
  input, position) and nothing else. Fake interactivity — a control whose value changes nothing
  mathematical — is removed (§2, §18).
- **Cause → effect, immediately.** Every gesture redraws the visual, the number and the symbol
  from the *same* state (§5, §28). No « Valider » between the action and its consequence.
- **Prediction before the reveal, whenever there is something to be surprised about** (§9).
- **Representations revealed progressively** (§10, §11): the couple, then the table, then the
  points — never all at once, never before the gesture that gives them meaning.
- **One « aha » the module does not state first.** Name it in the component header (« Expected
  observation ») and engineer the interaction so that it *happens*; the feedback then puts words on
  what the student has just seen.
- **Short copy.** « Essaie. » « Observe. » « Que remarques-tu ? » « Et si tu mets 0 ? » Two
  sentences, then an action. The `À retenir` lives in the footer, after `allDone`.
- **Replayable, with reachable extremes** (§17bis): reset, another value, another configuration,
  0, negatives, the largest value the control allows. The student should be able to ask « et
  si… ? » and get an answer from the system, not from a paragraph.
- **A game feel without game mechanics**: curiosity, prediction, visible consequences, discovery
  — no points for clicks, no badges, no timer (§26).
- **Completion on the real goal**, unconditional, with an escape hatch after a few attempts
  (playbook §8) — a Module 1 that strands the student in a wrong state has failed before the
  lesson started.

### 6bis.4 Hard visual invariant — every valid state has a valid layout

The opening manipulation is the most manipulated screen of the lesson, so §17bis applies with
full force: **no number, label, symbol, line, point, arrow or control may overlap, collide, clip
or leave its frame for any reachable state**. Never assume a digit count, a short label, a
positive value or a fixed position. Derive the frame from the content (`planeFor(points)` in
`fonctions-3e` fits range, step and pixel units to whatever the student typed; `TaxiMeter` sizes
its frame for the most expensive tariff), keep readouts in the DOM rather than in SVG `<text>`,
and **sweep the control in the e2e suite** — including a mobile pass at 375 px and an aspect-ratio
guard on every `CoordPlane` (`viewBox height / width ≤ 3`, the signature of a forgotten `unitY`).

### 6bis.5 Scope rule for agents

**When an agent works on a specific manipulation, it modifies only that manipulation** — its
module, its lesson-local components and utils, its tests and its e2e section. Other modules, other
lessons and shared components stay untouched unless the current manipulation genuinely cannot be
built without a change; then the change is minimal, additive, behind defaults that preserve every
existing caller, verified on the current manipulation and reported explicitly (§17bis « Scope »,
playbook §16b). Writing a guide section is never a licence to update the lessons it describes.

### 6bis.6 Before declaring Module 1 complete

| Axis | Question — every answer must be *yes* |
|---|---|
| Mathematical | Does the manipulation reveal the core concept? Is the mathematics exact in every reachable state? Is each variable genuinely tied to its consequence? |
| Pedagogical | Is there curiosity, a prediction, an observable phenomenon and a discovery the module did not state first? Does Module 1 leave later modules their discoveries? |
| UX | Is the first tap obvious? Is feedback immediate? Can the student replay and push the extremes? Does it work at 375 px with touch? |
| Visual | No overlap, no clipping, no overflow, no unreadable label — swept over the whole range, not sampled at the default. |
| Architecture | Kit `ContentModule` + lesson-local components; shared infrastructure reused, not forked; nothing outside the current manipulation modified. |


---

## 6ter. The mathematical laboratory — rules confirmed by the 3e « données » batch

Written after building `probabilites-3e`, `proportionnalite-3e` and `modelisation-3e` (2026-09-05),
the last three lessons of the 3e « Organisation et gestion de données, fonctions » chapter. §6bis
states the principles; this section pins the operational rules those three builds proved, so the
next lesson does not rediscover them. Every rule below is normative for new lessons; none is a
licence to modify existing ones (§6bis.5).

### 6ter.1 Signature opening manipulation

> Every lesson should begin with a meaningful mathematical experience capable of creating
> curiosity before formal explanation.

The three openings, as a precedent bank (reuse the *quality*, never the widget):

| Lesson | Opening laboratory | Phenomenon the student makes happen | Left to later modules |
|---|---|---|---|
| Probabilités | the die laboratory (`DiceLab`, `FaceTracks`, `afterStreak`) | predict a face, throw 1 / 10 / 100 / 1 000 times, watch six tracks even out, run « three 6 in a row, then note the next throw » 300 times, load a face | event = set of outcomes (M2), P = favourable ÷ possible on a bag (M3), the 6 × 6 grid of two dice (M4) |
| Proportionnalité | the recipe for 7 (`RecipeLab`, `RatioTable`) | slide the guests, watch every ingredient stretch, predict 4 then 7 (no integer factor), read the constant « ÷ personnes » column, see points align through O, watch the cooking time *not* move | the coefficient named (M2), the four paths to an empty cell (M3), k² on areas (M4) |
| Modélisation | the modelling laboratory (`InfoSorter`, `QuantityPicker`, `ModelTester`, `ModelViews`) | sort the app's data, pick the two quantities, replay four candidate models on three real tickets, unfold table / graph / expression, predict 35 min, confront the real bill, meet the 8 € cap | representation choice (M2), placing points (M3), fitting parameters (M4), the cycle named (M5), limits (M6) |

### 6ter.2 Mathematical laboratory

> A manipulation must allow the student to **cause** a mathematical phenomenon, **observe** it and
> **derive meaning** from it.

- The student's control is the concept's own variable (number of throws, number of guests, the
  candidate model), never a proxy.
- The phenomenon is produced by the mathematics, not scripted: a non-proportional situation
  behaves non-proportionally everywhere because it *is* a rule object (`applyRule`), a loaded die
  is a weight vector, a capped tariff is `min(model, cap)`. Nothing that the copy claims is written
  by hand where the code could compute it.
- **Randomness is injected, never drawn in the render, and never identical on every visit.** A
  simulation takes an `rng` (`makeRng`) so it is testable, and seeds it once per session
  (`sessionSeed`) so that the first throw changes from one visit to the next — a die that
  « always gives 4 » on load destroys the experience. Tests pin the seed through
  `window.__SMARTER_RNG_SEED`.
- **An experiment the student can run beats a sentence.** « After three 6, is a 6 more likely? »
  is answered by a button that performs the experiment 300 times, not by a paragraph.

### 6ter.3 Prediction

> When meaningful, ask the student to predict before manipulating.

When the manipulation itself will answer, collect the prediction **without a verdict**
(`PredictionChips`: aria-pressed chips, no correction) and let the experiment speak; the closing
`TapQuestion` then quotes the student's own prediction (« Ta prédiction : … L'expérience te
contredit »). Use a graded `TapQuestion` for a prediction only when no manipulation follows.

### 6ter.4 Action loop

> **ACTION → CHANGE → OBSERVATION → MATHEMATICAL MEANING**

Every step of a laboratory module fills the four slots and the header comment of its component
records them (§24). A step whose « CHANGE » is only a revealed paragraph is a page, not a lab.

### 6ter.5 Visual safety

> Every valid mathematical state must have a valid visual layout.

Devices that held under sweeps in these three lessons:

- **Prefer DOM tracks to SVG text.** Horizontal bars whose length is a percentage of a track
  (`FaceTracks`, `RecipeLab`, `PercentBar`) with the numbers in their own grid column cannot
  overlap or clip, whatever the digit count — the layout audit becomes a DOM overflow check.
- **The scale contains the tallest bar AND the tallest theoretical mark** (`scaleMax`), so a
  dashed model marker can never leave the frame.
- **Grids on phones need real pixels, not a ratio.** A 6 × 6 outcome grid at 375 px measured
  35 px per cell inside the step padding; it now bleeds out of that padding (`-mx-5 sm:mx-0`) to
  keep ≥ 44 px cells. Measure with `getBoundingClientRect`, do not infer from the viewBox.
- **Fit the plane to the data** (`planeFor`: range, step, unit and unitY from the points and 0),
  and assert `viewBox height / width ≤ 3` in the suite.
- **Sweep, don't sample**: the e2e suites drive every stepper to both bounds (1 → 12 guests,
  k 0,5 → 3, 6 000 throws) and run `layoutAudit` + `domOverflow` at each step.

### 6ter.6 Scope safety

> When an AI agent modifies a manipulation, it must modify only the current manipulation unless
> explicitly instructed otherwise.

Corollaries met here: a lab needed in two lessons is **copied and adapted** (`probaUtils` from
`diceUtils`, `propUtils` from the 6e `proportionUtils`), never imported across lesson folders;
a shared component is touched only when the current manipulation cannot exist without it (none
was, in this batch); a sibling lesson's overlapping module (the die lab of `statistiques-3e`) is
left as is and the overlap is reported.

### 6ter.7 Bug classes found and fixed in this batch — grep for them

- **A `disabled` prop that freezes the whole lab.** `MarbleBag` and `SpinnerWheel` disabled
  their *action* button (« Tirer », « Tourner ») together with their steppers when the module
  froze the composition after the goal was reached. Split the props: `disabled` for the
  composition, the action stays live.
- **A start state that already satisfies the goal.** The bag opened on 1 red / 2 blue / 1 green
  — exactly the 1/4 the student was asked to build, so the step completed on mount. Test the
  initial state against the goal predicate before shipping.
- **Targeted hints hide the general explanation.** `NumericQuestion` shows `explainFor(n)`
  *instead of* `explain` when it matches; an e2e check for a word that only lives in `explain`
  fails on a wrong-on-purpose path. Assert the hint's own wording.
- **Single-line imports and scripted edits.** Appending `, x` to an import that is on one line
  needs a different edit than a multi-line list; always recompile after a scripted edit.

## 6quater. Displacement lessons — the ladder confirmed by `vecteurs-2nde`

Written after building the 2nde « Vecteurs » lesson (2026-09-05). §6bis and §6ter state the
principles; this section pins the shape that worked for a concept that IS a transformation rather
than a quantity, so the next lesson on translations, vectors, or coordinates does not rediscover it.

### 6quater.1 The displacement ladder

```
concrete displacement → manipulation → visual invariant → coordinates → notation → calculation → geometric problem
```

| Rung | What the student does | What appears on screen | What is NOT yet said |
|---|---|---|---|
| concrete displacement | moves an object on a grid (drag, D-pad, arrow keys) | the trace arrow and the « recipe » in words (« 3 vers la droite et 2 vers le haut ») | no coordinates, no notation, no word « vecteur » |
| manipulation | reproduces the recipe from another start, chains two orders, drives back | a second arrow, a direct-trip arrow, the return arrow | addition, opposite — only *experienced* |
| visual invariant | moves the origin of an arrow whose recipe is frozen | the arrow travels identical to itself; posed copies stay as ghosts | « représentant », « égaux » — named only after three copies |
| coordinates | reads the staircase, then moves A and B and watches x_B − x_A recompute | the staircase legs « +3 » / « +2 », a live table | the formula, written last |
| notation and calculation | sets v at the tip of u; slides k; reads the staircase as a right triangle | the sum arrow, k·u, the norm calculation | — |
| geometric problem | places the fourth vertex, finds a missing displacement, proves an alignment | the quadrilateral closes when AB = DC; AC = 3·AB | — |

Each rung exposes exactly one new variable (the object's position, then the origin, then a
component, then a point, then v, then k, then I) and leaves the next rung its discovery.

### 6quater.1bis The property ladder (a second rung sequence, confirmed by `colinearite-alignement-2nde`)

When the lesson's object is a *property* of vectors rather than the vector itself, the ladder is:

```
visual direction → manipulation → invariant → geometric property → coordinate criterion → algebraic proof
```

| Rung | What the student does | What appears | What is NOT yet said |
|---|---|---|---|
| visual direction | drags a vector's tip while another vector and its dashed support line stay fixed | lamps « direction / sens / longueur » | the word « colinéaires » |
| invariant | makes the vector longer, reversed, then off the line | the direction lamp stays on, then goes off | k, coordinates |
| geometric property | moves a third point C | lamps « alignés » and « AB, AC colinéaires » light together, on both sides of A | the criterion |
| coordinate criterion | slides k, reads a proportion table, decides on pairs without a drawing | v = k·u, the cross products | the name « déterminant » |
| algebraic proof | annuls a live number by flattening a parallelogram, then computes it | det = x y′ − y x′, its sign, |det| = 1 for the near miss | — |

Two rules specific to this ladder: **the near miss is the lesson** — every rung has a state the eye
gets wrong ((4 ; 3) on the rail of (2 ; 1), C at (5 ; 4), det = ±1) so the calculation has a reason
to exist; and **the number is annulled before it is named** — the student makes det reach 0 by a
gesture, then computes it. The same ladder applies to any property detectable by a coordinate
formula (orthogonality and the scalar product in Première, for instance).

### 6quater.2 Dynamic vector manipulation — rules that held

- **Freeze what the rung is not about.** Moving the origin with frozen components is what makes
  « same vector » visible; setting components with a frozen origin is what makes coordinates
  visible. One control set per mode, never both.
- **Bounds are computed, never refused after the fact.** A stepper's min/max derive from the
  frame *and* the other end of the arrow (origin ∈ [xMin − v_x ; xMax − v_x]); the button disables
  at the bound instead of letting the tip leave the plane. Drag paths clamp the same way.
- **The zero vector is drawn, not omitted.** A ring at the point, with its name, so « AA = 0 » is
  an object the student produced, not an empty screen.
- **Goals are predicates on the mathematics** (`equal`, `isZero`, `colinearFactor`,
  `isParallelogram`), the diagnosis names the failing attribute (direction / sens / longueur), and
  every goal-reach manipulation keeps an escape hatch after ~12 moves.
- **Predictions are chips without verdict inside the lab step** (§6ter.3); the closing feedback
  quotes them (« Ta prédiction : à la station. Le sol te contredit »).

### 6quater.3 Safe geometric labelling

Point names, vector names and staircase numbers move with the objects they name, so a fixed
offset cannot be correct in every reachable state (§17bis). The shipped device is a pure,
unit-tested placer (`labelLayout.placeLabels`): every label gets an ordered list of candidate
boxes (around a point: 8 directions at 3 distances; along an arrow: both sides of the midpoint,
then the thirds, then *beyond the two ends*), the first candidate that lies inside the frame and
touches no obstacle wins, and obstacles include the point discs, the arrows sampled as small
boxes, and the **axis tick bands** of the plane. Staircase labels prefer the *outside* of the
right triangle (`avoid` = the hypotenuse's midpoint). Robots and icons are SVG shapes, never
`<text>`, so they cannot collide with a graduation — and a point that the student can drop ON an
axis needs the tick bands declared as obstacles too (`axisObstacles(geo)`), or its name lands on
the graduation. The sweep test over the whole grid of
reachable pairs (2 401 point pairs, ~3 400 short vectors with staircase) is the proof; the e2e
suite repeats the audit at 1 280 px and 375 px while driving every stepper to both bounds.

## 7. The invariant principle

Every manipulation must let the student notice **something that stays true or changes
predictably**. Before designing an interaction, the agent writes one sentence:

> **What is the student supposed to notice?**

| Domain | Invariant or predictable change |
|---|---|
| Fractions | the whole stays the same; changing the denominator changes the number of equal parts; changing the numerator changes how many parts are taken |
| Units of measure | the physical quantity does not change when the unit changes; only the number does |
| Proportionality | the ratio stays constant; doubling one doubles the other |
| Functions | changing `x` produces a predictable change in `y`; the rule is the same for every `x` |
| Geometry (transformations) | lengths and angles are preserved; orientation may not be |
| Perimeter vs area | cutting and recomposing a figure changes the perimeter but not the area |
| Equations | doing the same thing to both sides preserves the equality |
| Circle | the circumference is always a little more than 3 diameters |

Reference implementations: `ConservedSegment.jsx` (longueurs) keeps the bar at a fixed pixel
width and changes only its subdivisions and label when the unit changes — the invariance *is* the
visual. `CircleUnroller.jsx` (perimetres) rolls the circle along a line and leaves three diameters
plus a small remainder, which is what π must explain.

If no sentence of the form "the student should notice that …" can be written, the interaction is
not ready.

---

## 8. One variable at a time

> **When introducing a new concept, change one mathematical variable and keep the others stable
> whenever possible.**

Fractions, in order:

```
1/4 → 2/4 → 3/4        (numerator moves, denominator fixed, same shape)
1/4 → 1/5 → 1/6        (denominator moves, numerator fixed, same shape)
bar 3/4 → circle 3/4   (representation moves, the fraction is fixed)
```

Do not change numerator, denominator, representation and context at the same time unless the
pedagogical objective is precisely to coordinate them.

Reference: the `BUILDS` ramp in `Module02Construire.jsx` uses the same `bar` shape for all three
constructions (1/2 → 3/4 → 7/10) and moves only the target; the circle appears in a later module.

**Why:** working memory holds a handful of items. Each simultaneously changing variable is one
more thing to track, and the student cannot attribute the visible effect to its cause. One moving
variable makes the causal link *unambiguous*, which is the whole point of the manipulation.

---

## 9. Prediction before manipulation

Whenever useful:

```
PREDICT → MANIPULATE → OBSERVE → EXPLAIN
```

«À ton avis, que se passe-t-il si on double le dénominateur ?» — then let the student manipulate
and let the system reveal the consequence. This beats an animation because the student has a
stake in the outcome, and a wrong prediction is the most memorable moment in the module.

Implementation: a `TapQuestion` (`common/kit/questions.jsx`) placed *before* the manipulation is
unlocked. The kit's one-tap policy makes prediction cheap: no validation button, no retry loop,
the reveal comes from the manipulation that follows. `Protractor.jsx` (angles) uses the same shape
at reading time: the student commits to "50 ou 130 ?" before the correct reading is confirmed.

Do not ask for a prediction when there is nothing to be surprised about.

---

## 10. Multiple representations

A mathematical idea is shown through several **coordinated** representations when that helps.

```
Fraction        whole → partition → selected quantity → fraction notation → number line
Decimal         quantity → unit partition (tenths, hundredths) → decimal notation → number line
Proportionality real situation → table → graph → coefficient → equation
Function        machine → table → graph → formula
Geometry        figure → manipulation → measurements → property → notation
```

> **Representations must be synchronized.**

When the student manipulates one representation, the others update whenever pedagogically
useful — and never disagree. This is only possible if all of them derive from a single state
(§28).

---

## 11. The "mirror" principle

A **mirror** is a second representation that reflects the same state at the same time.

Student changes `3/4`. At once:

- the partitioned shape shows 3 of 4 parts (`PartitionShape` with `parts={4} cells=[0,1,2]`)
- the fraction display shows `3/4` (`MathText`)
- the counter shows «3 parts sur 4»
- the number line marker sits at 0,75 (`NumberLine` `markers`)

**Mirrors must not overwhelm.** Show only the representations that help answer the *current*
question. A `manipulation` step about "how many parts?" needs the shape and the counter, not the
number line. The number line is a later mirror, introduced when position becomes the question.

Implementation note: give each mirror exactly one way to receive the state. `PartitionShape`
accepts both `shaded` (a count) and `cells` (indices) for historical reasons; pick one per call
site and never pass both.

---

## 12. Error as manipulation

The lesson should let the student **construct wrong states** when that is informative.

Instead of «Faux.», prefer:

- show the consequence
- preserve the student's construction
- identify the contradiction
- invite another manipulation

Student constructs `3/5` when `4/5` is required. Do not erase it. Say:

> «Tu as pris 3 parts. Il en faut 4.»

The error becomes information. References:

- `Module08Droite.jsx` (fractions): a wrong placement stays on the line and a `ghost` marker
  appears at the target — the distance between the two *is* the feedback.
- `Module02Construire.jsx`: a wrong denominator triggers a hint («Tu as choisi 6 parts. Observe
  bien ton unité…») *before* the target numerator is revealed, plus a «Changer la découpe» escape.
  The student cannot reverse-engineer the answer and is never stuck.

**Gated validation rule.** A `ValidateButton` that stays disabled until the state is exactly right
is acceptable only when the manipulation itself already shows the student whether they are right
(a filled container overflows, a balance tilts). Otherwise, let the wrong state be submitted and
describe it. A step that can never produce a wrong state produces no diagnostic information.

---

## 13. Feedback rules

Three levels, used in this order:

| Level | What | When |
|---|---|---|
| **Immediate visual feedback** | the mathematical object changes | on every action, with no click in between |
| **Short conceptual feedback** | one sentence stating the mathematical consequence | after a validation or a reveal |
| **Remediation** | a smaller step, a worked case, or a re-manipulation | only after a wrong answer, only when needed |

House policy, applied by construction in `common/kit/questions.jsx`:

- one tap **is** the answer; no separate validate for choice questions;
- `onAnswered(isCorrect)` always fires — a wrong answer never blocks progression;
- on a wrong answer the student sees **their answer, the correct answer, and the rule** — never a
  «Réessayer» loop;
- `Feedback` (`common/components/LessonUI.jsx`) carries meaning by icon plus an `sr-only` French
  prefix («Correct : », «À revoir : », «Indice : »), never by colour alone.

Avoid: long explanations, popups, constant celebrations, generic «Bravo !». Feedback **describes
mathematics**:

| Prefer | Over |
|---|---|
| «Tu as partagé l'unité en 5 parts égales.» | «Excellent !» |
| «Ta réponse : 3/5. Bonne réponse : 4/5 — il fallait prendre 4 parts sur 5.» | «Faux.» |
| «Une unité plus petite donne un nombre plus grand pour la même longueur : 3 m = 300 cm.» | «Attention aux conversions !» |
| «3 morceaux, mais pas 3 parts égales : ce n'est pas encore une fraction.» | «Ce n'est pas ça.» |

---

## 14. Symbolic representation must emerge from the action

> **The symbol describes something the student has just experienced.**

Student creates 3 parts out of 5. *Then* show `3/5` and read it off the drawing:

- `5` = the number of equal parts (`highlight="denominator"` on `PartitionShape` outlines all
  parts)
- `3` = the number of selected parts (`highlight="numerator"` outlines the taken parts)

Do not begin with notation and ask the student to reconstruct a meaning afterwards — unless the
module is already at the `formalization` stage or later, where symbol → drawing is a legitimate
reading exercise (`Module03Vocabulaire.jsx`, then bidirectionally in `Module04Representer.jsx`).

---

## 15. Interaction difficulty progression

| Level | Prompt shape | Fractions reference |
|---|---|---|
| **1 — Direct manipulation** | «Prends 3 parts sur 4.» (partition pre-cut, target shown) | `Module01Mission` |
| **2 — Guided manipulation** | «Partage l'unité en 4 parts égales, puis prends 3 parts.» | `Module02Construire`, builds 1 and 2 |
| **3 — Prediction** | «Que se passe-t-il si… ?» | prediction `TapQuestion` before a manipulation |
| **4 — Construction** | «Construis 7/10.» (target withheld until the cut is chosen) | `Module02Construire`, build 3 |
| **5 — Representation switching** | «Montre la même quantité sur la droite graduée.» | `Module04Representer`, `Module08Droite` |
| **6 — Symbolic reasoning** | «Quelle fraction représente ta construction ?» | `Module09Decimales` (5/10 ↔ 0,5) |
| **7 — No manipulation** | Solve with mathematics only. | `Module10BossFinal` |

**Scaffolding decays on four independent axes**, and the agent controls each deliberately:

1. across modules — `stage` and `difficulty` in `lesson.config.js`;
2. within a step — configuration flags such as `showTarget`, presence of `hint`, whether the
   target is revealed before or after the student's first decision;
3. across representations — from the partitioned unit, to a collection, to a position on a line,
   to the bare symbol;
4. across controls — from tap-a-highlighted-part, to choose-the-cut, to a stepper, to nothing.

Never remove two axes of support at once.

---

## 16. Interaction is not always drag-and-drop

Choose the control from the mathematics, then pick the **simplest control that preserves the
mathematical meaning**. House preference order:

```
tap → stepper (+ / −) → chip / select → slider → draw / connect → drag
```

Available controls: click, tap, +/− controls, sliders, stepper, direct manipulation, dragging,
drawing, selecting, constructing, sorting, connecting, splitting, combining, filling, moving
points, rotating, resizing.

Deliberate no-drag designs to imitate:

- `OrderingGame` — ordering by tap-to-add / tap-to-remove, not by dragging cards;
- `ShapeComposer` — tap a piece, then tap its destination slot;
- `PolygonPerimeter` — tap each side in contour order; the running total is the manipulation.

Drag is right when the concept *is* a continuous position (number line, ruler, clock hand) — and
even then it ships with a stepper or keyboard twin (§17, §27).

---

## 17. Mobile-first manipulation

Requirements:

- touch targets **44–48 px** (the kit uses `min-h-[44px]` / `min-h-[48px]`; the lesson-kit e2e
  mobile pass fails any enabled button under 40 px at 375×667);
- no precision-dependent dragging when avoidable; snap to the mathematically meaningful values;
- every drag interaction has an accessible alternative that reaches the same state;
- no two-finger gestures;
- no essential hover interactions;
- controls stay understandable on a phone: one manipulation per screen width, mirrors below, no
  horizontal scroll;
- `touch-none` only while a drag is armed, never on the whole page.

For mathematical construction prefer **tap + stepper** when precision dragging would be
frustrating. References: `ClockFace.jsx` pairs the draggable hand with mandatory `+1h / +5 min /
−5 min` buttons; `ItemBank.jsx` exposes explicit «Poser … sur le plateau de gauche / droite»
buttons beside the draggable items.

---

## 17bis. Layout safety — every valid state must have a valid layout

> **A manipulation is not complete if any valid student interaction can make mathematical content
> overlap, clip, or become unreadable.**

This is a hard invariant, checked at review time like the formative policy. It applies to the whole
reachable state space, not to the default state that happens to be on screen when the component is
first written.

### The rule

Numbers, symbols, labels, equations, lines, shapes, arrows and controls must never overlap, collide,
be clipped, or spill into another mathematical element — for **any** value of the variables the
student controls (coefficients, lengths, angles, coordinates, exponents, denominators…).

### What may not be assumed

Do not rely on: fixed positions that only work for the default values · hardcoded widths or text
coordinates · a fixed number of digits · values staying positive · coefficients staying small ·
labels staying short · accidental spacing · having looked at one example.

A readout that is fine at `2` must still be fine at `−125,75`; a label reading `x` must still fit
when it becomes `1234x`; a two-character fraction must survive becoming a long improper one.

### How to place things instead

Derive geometry from the content: bounding boxes, measured text, anchor points, dynamic offsets,
available space, collision-aware placement, responsive containers, and scaling the viewBox (or the
drawing unit) when the magnitude grows. When an object moves, its label moves with it or finds
another safe position. Reserve space for the **longest** reachable string, not the current one.

Practical devices already used in this repo: a collision-aware label placer fed with the drawing's
own obstacles (`vecteurs-2nde/components/labelLayout.js`, §6quater.3); an axis floor so the scale never collapses around small
values (`graphiques/components/BarChart.jsx`'s `axisFloor`); capped representative tiles plus a
« ×N » badge instead of rendering a thousand nodes; readouts placed outside the figure in a normal
DOM row rather than inside the SVG, where they cannot collide with the drawing at all.

### Priority when space runs out

1. Mathematical correctness
2. Mathematical readability
3. Interaction usability
4. Visual elegance
5. Decoration

Never trade readability for a decorative composition. Dropping a decorative flourish, moving a label
outside the figure, or scaling the drawing down are all preferable to two numbers touching.

### Test the extremes, not the default

For every manipulation, deliberately drive: minimum and maximum values, negatives where allowed,
decimals where allowed, the longest expression reachable, extreme positions and angles, both slider
ends, and repeated interactions. The question to answer is:

> **Can any valid student action make two mathematical elements overlap?**

If yes, it is not finished. The e2e mobile pass (375×667) is the cheapest place to catch this: a
horizontal-scroll assertion plus a screenshot of the extreme state, looked at.

### Make the rule executable — sweep the range, don't sample it

Looking at a screenshot proves one state. The invariant is about *every* state, so assert it in
code and drive the control across its whole range.

Two checks, both cheap, both added to the 3e geometry suites (2026-09-04):

```js
/** Every SVG element must stay inside its own viewBox. */
async function svgOverflow(page) { /* getBBox() vs viewBox, per element */ }

/** No two <text> labels in the same SVG may overlap. */
async function textCollisions(page) { /* pairwise bbox intersection */ }
```

Call them **inside a loop that sweeps the control**, not once on the default state:

```js
for (let i = 0; i < 8; i += 1) {
  await press(page, 'Tourner Rotation horizontale vers la droite', 2);
  overflows.push(...(await svgOverflow(page)));
  clashes.push(...(await textCollisions(page)));
}
check('layout: no two labels overlap at any rotation', clashes.length === 0, …);
```

Better still, when the placement is pure geometry, assert it in a **unit test** over the full grid
of reachable states — it runs in milliseconds and pins the fix forever. `representation-espace-3e`
does exactly this over 468 orientations (4 solids × 13 yaw × 9 pitch).

Worked example, and why sampling is not enough. `SolidTurner` first placed each vertex name at a
fixed offset (`x + 9`, `y − 7`). Correct at the default angle, and correct at the handful of angles
the screenshots happened to capture — but the grid sweep found **16 colliding label pairs**
(G over D, A over H, …). The fix is the one this section prescribes: push each label outward along
the centre→vertex direction so labels separate as the vertices do, then run a short
de-cluttering pass that nudges any pair still within the minimum box apart vertically. A white
`paintOrder="stroke"` halo keeps a label readable where it must cross an edge, and the viewBox is
computed from the vertices **plus their displaced labels** so pushing outward cannot push off-frame.

### Scope: fix the manipulation you are working on

A layout defect found in the manipulation under construction is in scope. The same defect noticed
in a *different* manipulation is not — record it, do not fix it uninvited. Modify another
manipulation, lesson, or shared component only when the current one genuinely cannot be fixed
without it; then keep the change minimal, preserve the existing behaviour behind defaults, verify
the current manipulation, and report the shared-component edit. A task is never a licence to
refactor the manipulation system.

---

### Verifying it mechanically, not visually

A screenshot proves one state. Drive the manipulation to its bounds instead —
minimum and maximum slider values, negative and decimal values, the four corners
for a movable point, both ends of a cursor — and assert **programmatically** that
no SVG `<text>` leaves its `viewBox` and that no two text boxes intersect:

```js
const bb = t.getBBox();                       // per <text>
bb.x < 0 || bb.x + bb.width > vb.width        // → hors cadre
a.x < c.x + c.width && c.x < a.x + a.width && // → chevauchement
  a.y < c.y + c.height && c.y < a.y + a.height
```

Worked pattern: `apps/web/e2e/lesson-kit/_fo-overflow-audit.mjs` (initial states)
and `_fo-extremes-audit.mjs` (reachable extremes, driven by the keyboard path so
the run is deterministic). Both run at 375 px **and** at desktop width — a layout
that survives one width can fail the other.

Reference fix: `CoordPlane`'s `planeGeometry(range, unit, pad)` accepts a per-side
margin, and the component measures its own tick labels to choose it; labels flip
side near an edge, stagger when they would stack, and clamp as a last resort.

---

## 18. Interaction economy

Do not create an interaction because the lesson is supposed to be "interactive". Every interaction
must answer:

1. What mathematical idea does it reveal?
2. What variable does the student control?
3. What changes mathematically?
4. What should the student notice?
5. What will be formalized afterwards?

**If any answer is missing, remove the interaction.** Fewer, deeper manipulations beat many
shallow ones. A module with one manipulation that the student repeats with a changing variable is
better than four unrelated widgets.

---

## 19. Real example design

The real-world context must **create a mathematical need**, then get out of the way.

Bad: «Une pizza a 8 parts. Apprenons les fractions.»

Better: «Trois amis veulent partager cette pizza équitablement. Comment décrire ce que chacun
reçoit ?»

Keep it **visual + concrete + short + actionable**:

- visual: the object is on screen, not described;
- concrete: a thing the student could touch in life;
- short: two sentences at most, in the `MissionBrief` (`common/components/LessonUI.jsx`);
- actionable: the first tap is available immediately below.

The context is not a story-reading exercise, and it never contains numbers the student is not
about to act on.

---

## 20. Lesson architecture

Recommended micro-lesson pattern:

| Part | Content | Kit shape |
|---|---|---|
| **01 Situation** | very short real-world visual | `MissionBrief` in `Module01Mission` (`stage: trigger`) |
| **02 Challenge** | one question | first step title / prediction `TapQuestion` |
| **03 Manipulation** | the student acts | step body with the interactive primitive (`stage: discovery` / `manipulation`) |
| **04 Discovery** | the system helps identify the pattern | short `Feedback tone="info"` after the action |
| **05 Mathematical mirror** | visual ↔ number ↔ symbol | synchronized mirrors (§11) |
| **06 Formalization** | short explanation | reveal-as-conclusion block, `stage: formalization` |
| **07 Guided practice** | manipulation with decreasing support | `stage: practice_lab`, flags reduce hints |
| **08 Independent practice** | minimal manipulation | `practice_lab`, kit questions with a static visual |
| **09 Transfer** | different context / representation | `practice_lab` or the final module's synthesis |
| **10 Retrieval / automatization** | short exercises | `BossFinal` (`stage: evaluation`), no manipulation |

**Not every lesson has ten screens or modules.** This is a pedagogical pattern, not a UI
template. The only hard constraints are structural and live in `LESSON_CONTRACT.md`:
`REQUIRED_STAGES` in order, the prerequisite check optional and never blocking, an always-open
final evaluation, and ≤ `MAX_LESSON_MINUTES` (90) in total. Merge or split parts as the
mathematics dictates.

---

## 21. Example — fractions

Reference lesson: `apps/web/src/lessons/college/6e/nombres_calculs/fractions/`.

```
Real chocolate bar → divide the whole → take pieces → observe the quantity → the fraction appears
→ numerator / denominator named → collections → quotient → number line → decimals → no manipulation
```

| Module | Stage | What the student does | Guide stage |
|---|---|---|---|
| `Module01Mission` | trigger | taps 3 of 4 cells of a pre-cut bar to take chocolate; chooses how to write it; the notation `3/4` is revealed as the name of the action | REAL → DISCOVER |
| `Module02Construire` | discovery | first chooses **how many** equal parts (2/3/4/5/8/10), then taps cells, then the fraction appears; wrong cuts get a hint before the target is shown; the third build withholds the target until the cut is chosen | MANIPULATE → TOUCH THE MATH |
| `Module03Vocabulaire` | discovery | toggles `highlight` numerator / denominator on the drawing; reads fractions from figures; defuses the «4 > 2 donc 1/4 > 1/2» trap | FORMALIZE |
| `Module04Representer` | manipulation | colours cells to match a fraction; builds a fraction from a drawing with the stepper; re-cuts halves to see `1/2 = 2/4` | mirror both ways |
| `Module05Quantite` | manipulation | selects **groups** of a collection to take 1/3 then 2/3 of 12 objects | TRANSFER (collection) |
| `Module06Quotient` | manipulation | takes one slice on each of three pizzas and discovers `3 ÷ 4 = 3/4` | TRANSFER (quotient) |
| `Module07Simples` | formalization | reads fractions in everyday contexts; matches figures to names | AUTOMATIZE |
| `Module08Droite` | practice_lab | places 1/2, 1/3, 2/3, 5/4 on a number line, value hidden until validation; wrong placements stay visible with a ghost target | representation switch |
| `Module09Decimales` | practice_lab | builds 5/10 and 25/100 to bridge 0,5 and 0,25 | symbolic reasoning |
| `Module10BossFinal` | evaluation | twelve mixed questions, no manipulation, one global submit | level 7 |

Primitives used by this lesson — **examples of interaction primitives, not mandatory
components**:

- **SVG partition scene** — `PartitionShape` (bar or circle, stateless, `parts`, `cells`,
  `weights`, `onToggle`, `highlight`);
- **cutting tool** — choosing the denominator from a set of options is the cut; the shape re-renders
  with `parts = chosenDen`;
- **selection tool** — `onToggle(i)` adds or removes an index in `cells`;
- **stepper** — `FractionBuilder` (± on the numerator, options for the denominator);
- **visual mirrors** — counter, `MathText` fraction, `NumberLine` marker;
- **collection partition** — `ObjectGroup` (select groups, legend keeps `total ÷ groups` visible);
- **sorting** — partage vs regroupement cards;
- **comparison** — the «4 > 2» trap and the improper-fraction step;
- **construction** — the three `BUILDS` with decaying support;
- **number line** — `NumberLine` in `read` and `place` modes with `fracLineFormat(den)`.

Another lesson on another concept will have another instrument. What carries over is the
*sequence* — cut, take, observe, name, transfer — and the engineering shape: one state, stateless
mirrors, reveal-as-conclusion.

---

## 22. Example patterns for other topics

Format: **real situation → manipulation → controlled variable → observation → formalization**.
Where the repo has a primitive, it is named; otherwise the row is a design note.

| Topic | Real situation | Manipulation | Controlled variable | Observation | Formalization | Existing primitive |
|---|---|---|---|---|---|---|
| **Decimal numbers** | a 1 € coin and 10 c / 1 c coins; a metre and its centimetres | tap tenths and hundredths of a unit square | number of tenths, of hundredths | 3 tenths + 5 hundredths is one position; 0,3 = 0,30 | `0,35 = 3/10 + 5/100` | `UnitGrid` (nombres-decimaux), `formatDec` |
| **Fractions** | share a bar between friends | cut, then take parts | denominator, numerator | the whole never changes; more parts → smaller parts | `a/b` | `PartitionShape`, `ObjectGroup`, `FractionBuilder` |
| **Percentages** | a sale: «−30 %» on a price | fill a 100-cell bar or a 100-object grid | number of cells out of 100 | 30 % of anything is 30 of every 100 | `30 % = 30/100 = 0,3` | none yet — reuse a 10×10 `UnitGrid`-like partition |
| **Proportionality** | buying 1, 2, 3 identical items | stepper on the quantity; table and graph mirror | quantity | price grows by the same amount each step; points align | `prix = k × quantité` | none yet — stepper + table + aligned points |
| **Equations** | two pans must stay level | add or remove the same token on both pans | what is on each side | equality survives the same operation on both sides | `x + 3 = 7 ⇒ x = 4` | `Balance` + `ItemBank` (masses) as the visual base |
| **Functions** | a machine that transforms a number | feed inputs; watch outputs, table, graph | `x` | each `x` gives one predictable `y` | `f(x) = …` | none yet — input stepper with table and plotted points |
| **Geometry (transformations)** | a mirror, a pattern on a tile | move a point; the image follows | position of the point or the axis | distances and angles are preserved | definition of symmetry | `common/utils/geometry2d.js` (`reflectPoint`, `isSymmetryAxis`) |
| **Area** | tiling a floor | paint unit squares; cut and recompose | painted cells; piece positions | recomposing keeps the count of squares | `A = L × l` | `AreaGrid`, `ShapeComposer` |
| **Perimeter** | fencing a garden; rolling a wheel | tap sides in order; roll the circle | tapped sides; roll step | the total is the sum of sides; a circle rolls three diameters and a bit | `P = …`, `P = π × d` | `PolygonPerimeter`, `CircleUnroller`, `FormulaBuilder` |
| **Volume / capacity** | filling a bottle with a beaker | pour beakers into a container | number of pours | ten 10 cL pours fill 1 L; overflow is visible | `1 L = 100 cL = 1000 mL` | `MeasureFillMission`, `LiquidContainer` |
| **Angles** | opening a door, a slice of pie | place the protractor; tap the graduation | the reading | two graduations disagree: 50 or 130? the zero side decides | measure in degrees | `Protractor`, `AngleFigure` |
| **Coordinates** | a seat in a cinema (row, seat) | move a point on a grid; read the pair | the point | swapping the two numbers moves the point | `(x ; y)` | none yet — a snapped movable point with a live pair mirror |
| **Statistics** | class survey results | sort responses into bars; drag the height | counts per category | the tallest bar is the mode; the total is the sample | frequency, mean | none yet — tap-to-add counts building a bar chart |
| **Probability** | drawing from a bag | compose the bag (colours), then draw many times | contents of the bag | the frequency approaches the share of the bag | `p = favourable / total` | none yet — a `PartitionShape`-like bag plus a repeated-draw counter |
| **Powers** | folding paper; cells doubling | group into groups of groups | number of groupings | each grouping multiplies by the same factor | `2 × 2 × 2 = 2³` | `GroupBuilder` as the base |
| **Algebraic expressions** | «un nombre, puis le double plus trois» | build the expression from tiles; test with values | the unknown's value; the tiles | the same tiles give the same value each time; different orders can be equal | `2x + 3` | `FormulaBuilder` pattern, `MathText` |

---

## 23. AI agent decision process

Answer, in writing, in this order. **No JSX before step 11 is answered.**

| Step | Question | Output |
|---|---|---|
| **1** | What is the exact mathematical concept? | one sentence, curriculum-precise, with the learning-point ids it maps to |
| **2** | What misconception should the student overcome? | the wrong belief, stated as the student would state it |
| **3** | What real situation creates the need for the concept? | two sentences, visual, actionable |
| **4** | What can the student physically manipulate? | the object and the gesture |
| **5** | What mathematical variable does that manipulation control? | one variable per manipulation |
| **6** | What invariant or relationship should become visible? | «the student should notice that …» |
| **7** | What visual representation should react? | the primary visual, derived from state |
| **8** | What numerical representation should react? | counter, measurement, table cell |
| **9** | What symbolic representation should emerge? | the notation, and how it is read off the visual |
| **10** | How will scaffolding disappear? | the four axes of §15, module by module |
| **11** | How will the student transfer the concept? | the second representation or context |

Only after this reasoning does the agent implement the UI. The answers become the lesson's design
spec (see §24) and the header comment of the component that implements the manipulation.

---

## 24. Required interaction specification

For every interactive activity in generated lesson code, the agent must be able to state:

```text
Activity:
Mathematical objective:
Student action:
Controlled variable:
Mathematical state:
Visual consequence:
Expected observation:
Misconception targeted:
Feedback:
Formalization:
Scaffolding:
Transfer:
```

Where it lives:

- in the per-lesson design spec under `docs/lessons/` (pattern:
  `docs/lessons/6E_ALGORITHMIQUE_PROGRAMMATION_SPEC.md`), one block per activity;
- as the header comment of the component or module that implements the activity, so an auditing
  agent can compare the intent with the code without leaving the file.

An activity whose block cannot be completed is either decorative (§2) or unfinished.

---

## 25. Anti-patterns

**Do not:**

- explain first when manipulation is possible
- ship decorative animation
- use drag-and-drop whose drop position has no mathematical meaning
- pile up interactions — one deep manipulation beats four shallow widgets
- change several variables at once in an introductory step
- hide the mathematical state (a value the student changes but cannot see)
- add random gamification, XP for clicks, or watch-time rewards
- use confetti, or any celebration other than the kit's `XPBurst`
- write feedback that only says «Faux» / «Incorrect»
- show the symbol before the meaning in `trigger`, `discovery` or `manipulation` modules
- offer an interaction without an observation step
- offer an interaction without a mathematical consequence
- write giant blocks of text; two sentences, then an action
- force the student to type mathematical notation when direct manipulation is better
  (`MathInput` is for expressions at the symbolic stage, not for building a fraction)
- require precise dragging on mobile
- replace mathematical reasoning with clicking a pre-existing answer
- position labels at fixed coordinates when the object they name can move or grow — a layout
  that only works for the default values is an unfinished manipulation (§17bis)

Repo-specific traps that break the rules above in code:

- `role="img"` on an SVG that contains real buttons — use `role="group"`; `role="img"` only on
  purely visual SVG
- decorative SVG elements painted after the hit area without `pointerEvents: 'none'` — they
  swallow the tap
- animations longer than ~600 ms, or effects defaulting ON — the student waits for the mathematics
- the same colour semantics (numerator / denominator, success / trap) declared in several files —
  one constant, imported
- a second copy of shared geometry (`common/utils/geometry2d.js`) inside a lesson — import it;
  polar helpers stay per lesson by design, but one copy per lesson
- a gated `ValidateButton` that makes a wrong state impossible where the wrong state was the
  lesson (§12)

---

## 26. Gamification rule

**Gamification reinforces learning; it never replaces it.**

Rewards may signal: a successful construction, persistence, mastery, improvement, recovery from a
misconception.

Never allow **XP / stars / animations to become the main source of motivation.** The mathematical
action stays the centre of the experience.

House mechanics, already in place:

- XP via `awardXP({ moduleId, exerciseId, amount })` in `common/hooks/useProgress.js` —
  idempotent per question, so a reward is earned once;
- `XPBurst` is the only celebration effect; sound and haptics via `useEffectsPreference` default
  **off**;
- the streak (`useModuleEffects`) is session-only and never persisted;
- mastery labels in `BossFinal` describe the mathematics («Très bien maîtrisé», «À retravailler»),
  not the player.

---

## 27. Accessibility

Require:

- keyboard alternatives for every manipulation
- visible focus
- screen-reader labels in French stating the *reading* («Curseur à 3 sur 4», «Carreau ligne 2,
  colonne 3»)
- accessible alternatives to dragging that reach the same mathematical state
- sufficient contrast
- touch-friendly controls (§17)
- reduced-motion support (`prefers-reduced-motion` in component CSS, `useReducedMotion` in JS)
- no information communicated by colour alone

**Accessibility must preserve the mathematical interaction, not add labels afterwards.** The
keyboard path is a manipulation too: arrow keys move the point, Enter takes a part.

References: `Ruler.jsx` (draggable object with `role="slider"`, `aria-valuenow`, Arrow / Home /
End); `PolygonPerimeter.jsx` (a 22 px transparent hit line per side, `role="button"`, Enter /
Space, label says whether the side is «déjà comptée»); `LiquidContainer.jsx` (reduced-motion CSS
stops the wave and flow); `Feedback` in `LessonUI.jsx` (icon + `sr-only` prefix).

ARIA layering: `role="group"` with an `aria-label` on interactive wrappers; `role="img"` only on
purely visual SVG.

---

## 28. Technical principles for lesson implementation

> **ONE SOURCE OF TRUTH → MULTIPLE REPRESENTATIONS**

For every interactive mathematical object:

- **maintain a clear mathematical state** in the smallest component that owns the manipulation
  (`Module02Construire.jsx`: `chosenDen` and `cells` are the only truth; `denOk`, `numOk`, the
  counter and the reveal are derived);
- **derive visuals from that state** — presentational components are stateless and prop-driven
  (`PartitionShape`, `LiquidContainer` with its single `fillPct`, `NumberLine` fully controlled
  through `value` / `onChange`);
- **never duplicate mathematical state** — no second `useState` that mirrors the first, no
  "display value" that can drift from the real value;
- **keep representations synchronized** by construction: they read the same state;
- **separate mathematical logic from rendering** — pure functions in `packages/core` (validation,
  formatting, comparison) or in the lesson's `components/<domain>Utils.js`, which re-exports the
  core primitives it builds on (pattern: `nombres-entiers/components/numberUtils.js`); line and
  point algebra from `common/utils/geometry2d.js`;
- **make interactions deterministic** — no randomness inside the mathematical state; shuffle
  presentation order only, with a stable seed when the order matters for progress;
- **keep components reusable** — a manipulative takes its mathematics as props and reports
  changes through callbacks; it knows nothing about steps, XP or modules;
- **avoid duplicated calculations** — one formatter, one comparison, one conversion table per
  concept;
- **support reset / undo** whenever the manipulation benefits from experimentation (a
  «Recommencer» that returns to the initial state, never to a different one);
- **keep lessons functional offline** — progress is localStorage-first through `useProgress`;
  nothing in a manipulation waits on the network;
- **avoid unnecessary dependencies** — framer-motion, KaTeX (`MathText`) and MathLive
  (`MathInput`) are already available; a new library needs a reason no existing one can meet.

---

## 29. Quality checklist

Run before declaring a lesson complete. Every answer must be **yes**.

### Pedagogy
- Does Module 1 open on a signature manipulation the student can replay, with a prediction and a discovery the module does not state first (§6bis)?
- Can the concept be discovered before it is explained?
- Is there a genuine mathematical manipulation (§2)?
- Does the student control a meaningful variable?
- Is the mathematical consequence visible without a validation click?
- Is there an invariant the student is meant to notice, written down (§7)?
- Does the symbol emerge from the experience (§14)?
- Does scaffolding progressively disappear (§15)?

### Interaction
- Does every interaction have a mathematical purpose (§18)?
- Can the student tell what changed after each action?
- Can the student make, see and inspect errors (§12)?
- Is the interaction usable on a phone at 375 px without horizontal scroll?
- At the EXTREMES of every control (min, max, negative, decimal, longest expression), does the
  layout still hold — nothing overlapping, clipped or spilling out (§17bis)?
- Is there an accessible alternative to every drag?

### Mathematics
- Is the mathematical state correct in every reachable configuration?
- Are all representations synchronized from one state?
- Are edge cases handled (0 parts taken, all parts taken, improper fractions, unit larger than
  the reference, overflow)?
- Are the examples mathematically meaningful, not arbitrary numbers?

### UX
- Is the student doing more than reading?
- Is the amount of text minimal — two sentences, then an action?
- Is the next action obvious?
- Are explanations short?
- Is feedback mathematical rather than generic (§13)?

### Engineering
- Is there one source of truth (§28)?
- Is state separated from rendering?
- Can the activity reset?
- Are all controls functional — no placeholder buttons, no dead props?
- Are there no placeholder interactions?
- Does `npm run validate:lessons` pass, and does the lesson-kit e2e mobile pass
  (`apps/web/e2e/lesson-kit/`) run clean for the lesson?

---

## 30. Final design mantra

> **Don't show the mathematics. Let the student act on it.**

> **Don't explain what the student can discover.**

> **Don't animate what the student should manipulate.**

> **Don't make an interaction unless it changes something mathematical.**

> **Don't introduce the symbol before the meaning.**

> **One mathematical state. Multiple synchronized representations.**

> **Concrete → Visual → Numerical → Symbolic → Automatic.**
