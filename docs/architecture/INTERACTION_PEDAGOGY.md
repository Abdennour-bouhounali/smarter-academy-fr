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

Practical devices already used in this repo: an axis floor so the scale never collapses around small
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
