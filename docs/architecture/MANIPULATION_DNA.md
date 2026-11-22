# Manipulation DNA — when the student's hand makes the mathematics

> **Status: authoritative design philosophy (2026-09-30).** It sits *above* the
> two contracts and says **why** a manipulation is built the way it is. It is
> not a visual template, and it does not replace a contract.
>
> ```
> MANIPULATION_DNA            (this file)    why — the design philosophy
>         ↓
> INTERACTION_PEDAGOGY.md                    how a lesson uses interaction
>         ↓
> MANIPULATION_CONTRACT.md                   how a manipulation is built in code
>         ↓
> lesson-specific design                     the design sheet (§7) in the component header
>         ↓
> implementation                             logic/*.js → component → e2e
> ```
>
> The reference implementation is lesson 1 of the 4AM unit, `qasim-adad-tabii`
> module 1: `team-builder` (partition) and `divisor-explorer-books` (quotition),
> redesigned on 2026-09-30 from the forensic audit
> (`docs/reports/REFERENCE_MANIPULATIONS_FORENSIC_AUDIT.md`). Treat it as a
> **quality bar**, not as a shape to copy (§12).

## 1. The one question

Do not ask: *"How can we make this lesson interactive?"*

Ask: **"What should the student's hand be able to do that makes this mathematical
idea inevitable?"**

A manipulation succeeds when the student can say: *"I didn't just see the
mathematics. I touched it, changed it, tested it, and discovered why it works."*

## 2. The design chain — always top to bottom

```
MATHEMATICAL PHENOMENON      "sharing sometimes leaves something over"
        ↓
MATHEMATICAL RELATIONSHIP    a = b × q + r, 0 ≤ r < b
        ↓
MATHEMATICAL VARIABLES       what can vary? b (and a)
        ↓
NATURAL REPRESENTATION       groups of real objects: teams, shelves
        ↓
STUDENT ACTION               the hand controls ONE variable: carry a player / stretch a shelf
        ↓
MATHEMATICAL CONSEQUENCE     q and r change — computed by logic/, never by the view
        ↓
VISIBLE EVIDENCE             the player who fits nowhere; the books in the ghost shelf
        ↓
CONTRAST                     one case that leaves nothing, one that leaves something
        ↓
CONJECTURE                   "the floor empties when…" — chosen, with refutable distractors
        ↓
FORMALIZATION                a = b × q + r names what the hand just did
```

Never start from *"which component should we use?"*. Start from the
phenomenon, and only reach the component catalogue at the end.

## 3. The seven principles

### 3.1 The finger controls a mathematical variable

Ask what the finger actually controls. Strong: the length of a shelf *is* b;
moving a player *is* changing a team's size. Weak: a number button that makes
the application compute. The old books lab had 17 size buttons; the finger
controlled a UI selection, and the mathematics happened elsewhere. The
redesigned lab gives the finger the bookend of a shelf, so b is a length the
student holds (`useStretchInteraction`).

### 3.2 The action causes the mathematics

```
student action → mathematical state changes → representation changes      (causal)
student action → JavaScript calculates → UI displays the answer            (calculator)
```

The computation exists internally in both cases. What matters is what the
student *experiences*. In the shelf lab, all 420 books re-shelve *during* the
drag, so the consequence stays under the finger. Under the old design the
floor was usually off-screen at the moment of the tap.

### 3.3 Mathematics may resist — the refusal is the evidence

A strong manipulation sometimes says *"that cannot work"*, and the refusal
comes from the rule itself:

- **team-builder:** `canPlace` refuses a player who would break equality, so
  the 16th player can go nowhere and stays drawn on the bench.
- **bookshelf:** r books cannot fill a shelf. They sit in a **ghost shelf**
  whose b − r empty slots show what is missing: *« ينقصه 22 كتابًا »*.

The resistance is drawn and explained with the numbers on screen. It is never
a red state or a generic message.

### 3.4 Failure is information — four kinds, four responses

| Kind | Example | Response |
|---|---|---|
| Mathematical exploration | a 26-book shelf | not an error; it is a result with a remainder, shown neutrally (no « رائع! / توقّف! ») |
| Mathematical impossibility | a 6th player into a full team | the refusal is explained with the on-screen numbers (`rejectDetails`) |
| Accidental UI error | a small drag that falls back on the player's own team; a drag released in empty space | silent (`''` reason); the object returns home and is no longer held |
| Genuine misconception | "it works when the number is even" | a counter-example taken from the student's own range (`counterExamples`: 26 is even and leaves 4) |

### 3.5 Preserve and show invariants

Name what stays constant while something changes. In both labs:

- `a` never changes (15 players, 420 books; shelved + floor = 420).
- Every group is equal: a single bookend sets every shelf, and `canPlace`
  keeps the teams equal.
- r < b: the leftover never makes one more group.

The invariant is often the lesson. «r أصغر دائمًا من b» is written in the roles
line (`DivisionRoles`) every time.

### 3.6 Contrast is required

Discovery never opens on one case. Both labs require an exact case **and** an
inexact case: `discoveryReady(memory)` for the teams, and
`remainderDiscoveryReady(tried)` for the shelves, which also requires three
validated trials. A trial is a **validated** gesture (release, or a key/button
followed by a pause), not a value the finger passed over.

### 3.7 Formalization names an experience

```
experience → observation → conjecture (chosen) → mathematical language → formula
```

`a = b × q + r` appears only after the correct conjecture. «الشرح», which restates
the rule, is not offered before the discovery phase (`ManipulationControls`).
The formula should feel like *"ah — that's what just happened"*.

## 4. Interaction distance

**Definition.** The number of conceptual transformations between the student's
physical action and the mathematical consequence they see.

```
finger → mathematical object → mathematical consequence                    (short)
finger → button → UI state → event → calculation → redraw → interpretation (long)
```

Measured on the reference lesson:

| Lab | Chain | Distance |
|---|---|---|
| books, before 2026-09-30 | tap a number → state → redraw below the fold → scroll → read the floor | long; the consequence was often off-screen |
| books, now | drag the bookend (b) → every shelf follows → floor fills/empties under the finger | short |
| teams | carry a player → the team grows / the refusal shakes | short |

The goal is **minimum unnecessary distance**, not a minimum number of steps.
A worked example may legitimately be one step further away.

## 5. Causal visibility — the internal scale

| Level | Name | Meaning |
|---|---|---|
| 0 | decorative | the interaction is decoration |
| 1 | reactive | something reacts to the student |
| 2 | representational | the interaction represents mathematics |
| 3 | causal | the action causes a mathematical transformation |
| 4 | constraining | the mathematics constrains the possible actions |
| 5 | generative | the student constructs states and the phenomenon emerges from them |

The reference lesson:

| Lab | Level | Why |
|---|---|---|
| team-builder | 4 | equal-parts refusal; the leftover is physically unplaceable |
| books, before | 2 | a picture of the division, chosen from a list |
| books, now | 4–5 | the student generates every b in a continuous range; the "floor empties only at certain lengths" pattern emerges from their own sweep; the ghost shelf constrains |

Not every manipulation must reach 5. Do not build an important learning
experience at 0–2 when a causal one is naturally available.

## 6. Mathematical interaction vocabulary — starting points, not templates

| Mathematics | Natural action | | Mathematics | Natural action |
|---|---|---|---|---|
| partition | distribute | | fraction | cut / recombine |
| grouping (quotition) | gather / **size the group** | | function | input → transform |
| equality, equation | balance | | inequality | move a boundary |
| comparison | align | | geometry | construct |
| ordering | position | | transformation | move / rotate / reflect |
| measurement | measure / stretch | | probability | repeat |
| ratio, proportion | resize / scale | | statistics | classify / filter |
| factorisation | tile | | sequence | extend / predict |
| PGCD | cut | | PPCM | synchronise |
| percentage | fill / resize | | coordinates, vectors | position / move |
| slope | climb / run | | sets, systems | overlap / intersect |

Always check that the metaphor preserves the mathematics. The same division
is a *distribute* (teams: fix the number of groups) **and** a *size the group*
(shelves: fix the group size). The lesson must say which one is in use
(§8).

**Gesture engines available** (engineering, reusable):

- `useDragInteraction`: carry an object and drop it in a zone. It has a
  magnet (only zones that would accept), a visible "will refuse" state, edge
  auto-scroll on phones, tap-tap and keyboard.
- `useStretchInteraction`: stretch a magnitude. It is direct (the handle
  stays under the finger), live during the gesture, commits on release, and
  works as a slider on the keyboard and with −/+ buttons.

A new concept that needs a genuinely different gesture (rotate, cut, balance)
gets a new engine, documented in `MANIPULATION_CONTRACT.md` §4. It should not
be squeezed into one of these two.

## 7. The design sheet — write it before coding

Put it in the component header, next to the contract's five questions.
Filled examples: `divisibility/TeamBuilder.jsx`, `divisibility/DivisorExplorerBooks.jsx`.

```
CONCEPT        what idea is discovered?
OBJECT         what is the learner actually manipulating?
VARIABLE       which quantity does the learner control?
INVARIANT      what stays constant?
TRANSFORMATION what changes when the learner acts?
CONSTRAINT     which rule limits the action?
RESISTANCE     how is impossibility expressed, physically/visually?
EVIDENCE       what observable consequence proves the idea?
CONTRAST       which second case must be met?
PREDICTION     what can the learner anticipate before confirmation?
DISCOVERY      what should they be able to say afterwards?
FORMALIZATION  which notation names the experience?
TRANSFER       where is this reused later?
```

**The bookshelf, filled in.**

| Field | Content |
|---|---|
| Concept | b divides a ⇔ the Euclidean remainder is 0 (quotition reading) |
| Object | a shelf, through its bookend |
| Variable | b = books per shelf (10–60) |
| Invariant | 420 books; all shelves equal; r < b |
| Transformation | q shelves, r books on the floor, live |
| Constraint | a shelf is full or it does not count |
| Resistance | the ghost shelf with b − r dashed empty slots, «ينقصه …» |
| Evidence | the floor empty or not; counters; equation on release |
| Contrast | at least 3 trials, including one exact and one inexact (textbook: 26 vs 28) |
| Prediction | the textbook's 26 and 28 are marks on the ruler: the student places the shelf on them. The marks orient; they are not answer buttons |
| Discovery | «the floor empties exactly when the remainder is 0» |
| Formalization | `a = b × q + r`, then «q is also a divisor: 420 = 28 × 15 = 15 × 28» |
| Transfer | معارف 143 (worked example, `discovery="symmetry"`), then step 2's 120 = 6 × 20 |

## 8. Two readings of one division — never switched silently

| | Partition (teams) | Quotition (shelves) |
|---|---|---|
| The student fixes | the **number** of groups (k teams) | the **size** of a group (b per shelf) |
| What emerges | the size of each group | the number of groups |
| In `a = b × q + r` | b = number of groups | b = size of a group |
| What never changes | **b is what you chose; q is what results; r < b** | same |

Both labs render `primitives/DivisionRoles.jsx` under the equation. It names
b, q and r in the scene's own words. The module then puts the two readings
side by side before the question (`Module01AlMaktaba.jsx`,
`[data-division-bridge]`). When `r = 0`, the two readings meet: b **and** q
both divide a. The shelf lab's formal block shows it with the student's own
exact trial.

## 9. Orientation is not an answer — remove premature answers

The student must know **what** they manipulate, **what** the objects
represent and **what** the goal is. They must not be told **what they will
find**. Audit every screen for:

- The quotient shown as a target before sharing: the badges were `0/5`, and
  now they show the count only.
- The rule readable before discovery: «الشرح» and the registry `shows` line
  are now hidden until discovery.
- The verdict vocabulary («قاسم») in a tooltip or a title before
  formalization.
- A pre-pressed conjecture: `ManipulationDiscovery` now forgets its pick on
  every new scene.
- Question options that carry the evidence («… تبقى 4 كتب»). They now carry
  the choice only, and the student's own trials are listed above the
  question (`[data-activity-evidence]`).
- A knowledge-brick lead that answers the next question.
- Discovery reachable with no hand gesture: `team-builder` auto-completion is
  now `first-gesture`, so one sharing must be done fully by hand.

## 10. Touch, mobile, accessibility — the same mathematics by every path

- **Immediate, direct, stable, forgiving.** The handle stays under the
  finger. A refused or out-of-zone drag returns the object. The magnet never
  pulls toward a zone that would refuse.
- **Tablet and laptop only (owner, 2026-10-15) — phones are NOT supported.** Test at 768, 1024, 1280, 1366 and 1920 (older text about 320–430 px is superseded; ignore it).
- ~~Mobile is first-class.~~ Test at 768, 1366 and 1920
  px. Do not solve mobile by shrinking; reorganise instead. Examples: the
  shelf lab draws every shelf in columns that fit the width (no inner scroll
  box), and the carry engine scrolls the page at the screen edge, so the bench
  and team 1 can be joined by one gesture on a phone.
- **Non-drag parity.** Every gesture has a keyboard and a tap path that
  performs the **same mathematical task**: tap-tap and Enter for carrying;
  slider keys, −/+ and tapping the ruler for stretching. The accessible
  version is never a different exercise.
- **Announce the mathematics.** The representation is `aria-live="polite"`,
  so the equation is announced when a trial is validated, not at every pixel
  of the drag. Zone labels carry their counts («الفريق 1: 3 لاعبين»).

## 11. Feedback states the mathematical consequence

Prefer *"what happened mathematically"* over *"did you win"*:

- «في هذا الفريق 5 لاعبين، وفي أصغر فريق 4 لاعبين. ضع اللاعب في فريق أصغر أولًا.»
- «ما على الأرض لا يملأ رفًّا جديدًا: ينقصه 22 كتابًا.»
- «لو كان عدد اللاعبين 18 أو 15، لما بقي أحد خارج الفرق.»

Arabic counted nouns go through i18next plural keys (`_zero … _other`), so
«15 رفًّا», «4 كتب» and «لاعب واحد» agree. See `ARABIC_RTL_CONTRACT.md`,
"Counting nouns".

## 12. Reuse engineering, never the pedagogical experience

```
REUSE ENGINEERING  ≠  REUSE PEDAGOGICAL EXPERIENCE
```

**Reusable infrastructure:**

- `useManipulation`: phase, hints, levels, reset semantics.
- Both gesture engines.
- `ManipulationShell` and `ManipulationDiscovery`.
- `DivisionRoles` and the drawn-world primitives.
- Pure `logic/` modules and their tests.

**Concept-specific, always:**

- what the hand holds;
- what resists;
- what the drawing proves;
- which contrast opens the discovery.

**The platform must not converge toward a single manipulation style.** If a
new lab looks like another lesson's lab with other colours and objects, stop
and redesign. The football lab is a reference for *causal quality*, not for
"drag players into containers". Do not copy it mechanically into other
lessons. Do not turn every concept into drag-and-drop. Do not use animation
as a substitute for causality: every motion must show a mathematical change.

## 13. Engineering boundaries

- **One source of truth for each rule.** The rule that refuses the hand also
  drives the auto-completion, the refusal message (`rejectDetails`), the
  discovery condition and the tests. A view never recomputes it.
- **Test the logic the component imports.** A test named after a lab must
  exercise that lab's own logic file. Until 2026-09-30, the "420 livres"
  tests covered `logic/divisorExplorer.js`, which the books lab did not use.
- **Sweep, don't sample.** `bookshelf.test.js` draws every b of every range
  at five widths: each book once, no overlap, nothing outside the width.
- **Reset means start over** (`useManipulation.reset`). It restores the
  level's numbers, closes the free lab, clears the type's trial memory
  (`resetCount`) and closes the discovery. Changing numbers (`setNumbers`)
  resets the scene but keeps the memory, because changing 15 → 16 is how the
  contrast is produced.

## 14. The gold standard — ask before calling a manipulation done

1. If all explanatory text were removed, would touching it still teach
   something mathematical?
2. Does the action perform, constrain, transform, construct, compare, measure
   or reveal a relationship?
3. Could it be replaced by a button without losing the experience? If yes, it
   is not causal enough yet.
4. Does it feel like another lesson's lab with different colours? If yes,
   **stop and redesign**.
5. Can the student see the object AND the controls that move it in one
   screen, without scrolling, on a phone as on a laptop? If not, the hand
   moves something it cannot see — **not done** (owner rule, 2026-10-01;
   `MANIPULATION_CONTRACT.md` §8bis).
6. Would an 11–13-year-old (Gen Alpha) WANT to touch it — is it as good as the best app on their phone? If it only
   « works », it is **not done**: push it to the limit (§17, owner rule, 2026-10-14).
7. Does it carry the lab prototype layer — questions over the lab after each step, a `LabStepper`, the celebration, `playSfx` sound,
   a « إعادة » that restarts everything, full screen, `guided` shell (owner, 2026-10-28)? If not, it is **not done**
   (`reports/LAB_PROTOTYPE_ROLLOUT.md` §2, L1–L9). The prototype is the shell around the world; it never replaces the causal design.

## 15. Status

| Item | Status |
|---|---|
| Reference lesson M1 (teams + shelf), M2 (143, symmetry) | **Implemented 2026-09-30** |
| Shared shell fixes: magnet, refused drag, edge scroll, «الشرح» after discovery, stale conjecture, reset semantics, `withLevels: false` | **Implemented**; they reach every shell type |
| Lessons 2–9 redesigned against this DNA, at the owner's request (see below) | **Implemented 2026-09-30** |
| A prediction step before a lab (explicit) | **Implemented** at the متقدم level of lesson 3 only; elsewhere the textbook's own numbers serve as orientation |
| Standalone labs whose second level duplicates another lab (audit, defect k) | **Not yet implemented**, except the معارف 143 worked example (`levels={false}`) |
| Dormant class-mode code (next step, replay, solution) | Untested, never shown to students (unchanged) |
| Unit 2 « الحساب على الجذور »: three new labs designed from this DNA (see below) | **Implemented 2026-09-30** |
| Unit 3 « الحساب الحرفي »: two new labs, one world (the football pitch) for both directions of one reading (see below) | **Implemented 2026-10-01** |
| Unit 4 « معادلات ومتراجحات »: four new labs, four gestures (balance, collapse, boundary, race) on one exact module (see below) | **Implemented 2026-10-01** |
| 1AM unit 2 « الجمع والطرح »: `story-bars` — the hand holds the UNKNOWN (a child's height stretched until the story's sentence is true) or the OPERATION (the textbook's calc cards); the tape closes only when the parts make the whole, so « يزيد » with − and « ينقص » with + are refuted by the drawing (`MANIPULATION_CONTRACT.md` §2sedecies) | **Implemented 2026-10-14** |
| 1AM unit 3 « الضرب والقسمة »: `division-jumps` — b is given, the hand holds q (a ribbon tying bouquets along a row of flowers, or jumps along a line); one group too many lacks objects, one too few leaves enough for another, so the stop « r < b » is felt from both sides (`MANIPULATION_CONTRACT.md` §2septdecies) | **Implemented 2026-10-14** |
| 1AM unit 3 « الضرب والقسمة »: `digit-cards` — the divisibility rule is DISCOVERED, never stated: مبتدئ colours the multiples of 2, 5, 3 in the textbook's 0..48 table (a non-multiple refused with its remainder), متقدم arranges the cards 4, 5, 9, 3 and claims divisibility on closed lamps that a swap re-judges (÷3 never flips, ÷2 does); wrong rules refuted with the student's own cells and swap (`MANIPULATION_CONTRACT.md` §2octodecies) | **Implemented 2026-10-14** |
| 1AM unit 4 « الكتابات الكسرية »: `fraction-knife` — the share is FIXED (its edge never moves), the hand holds the KNIFE, d the number of equal pieces of the whole; the numerator is READ, and exists only when the edge falls on a cut — a straddling piece is the refusal. مبتدئ: grandmother's tray of « قلب اللوز » (3/5 for the neighbours) and Amine's « 4/6 » whose ghost pieces overflow the ribbon; متقدم: the textbook's three rectangles drawn superposed, then 27/45 PREDICTED with pins (9 and 3 divide 45 but straddle) and glued back to 3/5 (`MANIPULATION_CONTRACT.md` §2vicies) | **Implemented 2026-10-14** |
| 2AM unit 2 « الكسور والعمليات عليها »: `egg-trays` — the first lab whose hand holds the DIVIDEND a (eggs swept from a conveyor into trays of b); a tray CLOSES by itself at b, so r < b is physical at every scale, and the trays ruler under the belt is the same line read ÷ b: the marker « a ÷ b » sits at q + r/b, strictly inside a one-unit frame the student PREDICTED before the first egg (judged with the models below / above / remainder / onMark), and ON a graduation only when the last tray closes exactly (2145 then 2160 ÷ 30); the farmer's son's « 2145 = 30 × 70 + 45 » is refuted by the same closing tray (`MANIPULATION_CONTRACT.md` §2unvicies) | **Implemented 2026-10-14** |
| 3AM unit 4, lesson « نشر عبارات جبرية » (2026-10-21): `area-split` — the hand holds a CUT LINE: a knob slides along the edge of a school-garden plot (sides `m·x + n`) to where the side's writing changes term, then DECIDES what each parcel counts as (added; or taken away — the paved path, and the corner removed twice that must be given back); the second world (`arrows`) draws a red arrow from each term of the first factor to each term of the other bracket and decides each partial product's sign. The resistance is an AREA / a VALUE counted independently at x (which the hand also sets): a cut away from a term's edge is refused with the two numeric lengths it makes (« 5 و 7 »), a wrong sign with the counted area and the written sum, a wrong product sign with the two values at x; two meters (the plot's area / the parcels' sum, the expression / the products) never part. مبتدئ `3(x + 4)`, `2(x − 3)` (braces, areas shown, the reduced line writes itself); متقدم `(x + 3)(x + 2)`, `(x − 2)(x − 3)` (two cuts, four parcels, no helps, the student writes each coefficient). Differs from `pitch-expansion` / `turf-factoring` (a length stretched on a football pitch, zones carried into a sum) and `like-terms` (piles carried into trays). Contract §2tricies. | **Implemented 2026-10-21** |
| 1AM unit 4 « الكتابات الكسرية » (2026-10-15): `fair-share` — the hand holds the SHARE of ONE child (the unknown quotient itself) by cutting every cake in n slices then choosing m slices each (two discrete steppers, no slider); the lab paints b shares as coloured slices of the a ROUND cakes (the circle IS the fraction; 2026-10-15 redesign from loaves) and keeps « جرّب أعدادك » (own numbers) always open: the decimal ruler lands for 3 ÷ 4 and never for 2 ÷ 3 / 5 ÷ 6 / 7 ÷ 3, the cut ruler always (m = a) — a/b is the number that times b gives a, decimal only sometimes. Differs from `division-jumps` (holds the number of groups), `fraction-knife` (fixed share, holds the number of pieces) and `egg-trays` (holds the dividend). Contract §2duovicies. |
| 1AM unit 1 « الأعداد الطبيعية والأعداد العشرية » (2026-10-15): `decimal-comma` — the DIGITS are printed and fixed, the hand holds the COMMA (its place in the string of digits = the number of digits after it; a big round handle dragged between the tiles, a tapped gap, ← → on the keyboard); the amount N / 10^p is an OUTPUT drawn in honest blocks (`mosaic`: panel 1, strip 1/10, tile 1/100, shard 1/1000 in a magnifier) and judged against the client's table or a given decimal fraction, or read on rank names in the `machine` world (×10 … ÷1000, ×0,1 …: the same digits slide under the comma, a zero must be ADDED where the digits run out, the comma never passes the last digit). Differs from `rank-exchange` (the hand moves QUANTITIES between ranks; the written digits are an output), `digit-cards` (the digit is the object), `fraction-knife` / `fair-share` (the hand holds a number of pieces / a share). « جرّب أعدادك أنت » always open (free trials never count). Contract §2tervicies. |
| 1AM unit 1, lesson « مقارنة الأعداد العشرية وترتيبها » (2026-10-15): `ruler-compare` — the hand holds the GRADUATION of the ruler (m · dm · cm · mm, a knob on a four-cell tape-measure strip); long jumps are numbers, read at that graduation as a WHOLE number of graduations plus an exact hatched leftover; the verdict `< = >` (or the podium check in `order`) is refused while the ruler cannot separate the numbers and refuted by the readings when wrong. Differs from `decimal-comma` (digits fixed, the hand holds the comma), `rank-exchange` (quantities between ranks), `fraction-knife` (number of equal pieces of one whole). « جرّب أعدادك أنت » always open. Contract §2quatervicies. |
| 1AM unit 11, lesson « مساحة سطح مستو ومحيطه » (2026-10-15): `tile-yard` — the hand holds ONE TILE (a unit area) and carries it: the area is the number of tiles, the perimeter the number of fence sticks round them, two readings that the same gesture moves independently (fence: 12 tiles moved, area fixed; rope: a fixed roll of 12 sticks, free tiles; floor: whole, half and double tiles on a terrace, the number depends on the unit). Resistance is geometric (a corner contact, a split, a hollow, a burst rope). Differs from `square-tiling` (stretches k), `fraction-knife` (pieces of one area), `ruler-compare` (the ruler's graduation). The gardener walks the fence. Contract §2quinvicies. |
| 3AM unit 4, lesson « تبسيط عبارة جبرية وحذف الأقواس » (2026-10-20): `like-terms` — the hand holds a TERM, a pile of wooden pieces drawn to scale in the shape of its literal part (rod x, plate x² whose side IS the rod, unit cube; a negative term in the red « opposite » finish), and carries it into the tray of its shape (`collect`) or out of a « +( ) » / « −( ) » crate onto « كما هي » / « بعكس إشارتها » (`brackets`). The resistance is the VALUE at x, which the hand also sets: a tray of another shape is refused with the two pieces' values (a witness x when x = 1 hides the difference), a wrong exit is refused with the expression's value and the one the table would hold; a piece and its opposite vanish in pairs; the written and table values never part. Exits are judged only on drop (no magnet / hover leak). Differs from `pitch-expansion` / `turf-factoring` (an expression read as an AREA). Contract §2sexvicies. |
| 3AM unit 11, lesson « خاصية فيثاغورس » (2026-10-20): `pythagoras-tanks` — the hand holds the ANGLE at A (مبتدئ) or the LENGTH of the third side on a tape in tenths (متقدم, the angle hidden: the length must be predicted) of a triangle whose sides carry three thin square TANKS; pouring the two small tanks into the big one is the experiment: plain full only at 90°, an overflow (a puddle in cm²) at every acute angle, an empty corner at every obtuse one — so BC² = AB² + AC² and its contrapositive are seen in one gesture; with 2 and 3 no tenth fills and the calculator's √ KEY (only the key: 4AM `jidhr-tarbii` builds the root) sets √13. Differs from `square-root-side` / `square-fold` / `square-tiling` (they build √), `angle-compass` / `ramp-ratios` (ratios). Contract §2septvicies. |
| 2AM unit 3, lesson « مقارنة وترتيب أعداد نسبية » (2026-10-21): `zero-probe` — the hand holds the DISTANCE to zero `d` of a sensor B hanging at the end of a cable that unrolls from the sea surface; the SIDE (فوق / تحت الصفر) is a separate switch and B's relative number an OUTPUT; a sensor A is fixed. Under the zero MORE cable makes B LOWER (the inverse of the naturals' intuition), a forced side can forbid a task (the « لا يوجد طول » button, judged exactly and refused with ONE fitting length when one exists), a zone is one tenth wide. مبتدئ (step 1): −3 lower / higher, 4 lower, 2 impossible; متقدم (step 0,1): −4,5 < B < −4,3, lower than 1,2 on BOTH sides, −0,4 < B < −0,2. Differs from `ruler-compare` (graduation of positive decimals) and `solution-ray` (x on a ray). Contract §2novemvicies. | **Implemented 2026-10-21** |
| 3AM unit 5, lesson « المساويات والعمليات » (2026-10-21): `equality-lanes` — the hand holds the NUMBER c of an operation (+ − × ÷, −9 … 9) and chooses WHO receives it: two runners stand each at the value of one side of an equality with a hidden x; the operation given to both keeps them on the same graduation (the equality is rewritten), given to one only it separates them by c (gap drawn); ÷ 0 is refused, × 0 empties the equality (0 = 0). Differs from `equation-balance` (the contents of a pan). Contract §2untricies. |
| 3AM unit 5, lesson « المعادلات من الدرجة الأولى بمجهول واحد » (2026-10-21): `term-ferry` — the hand carries a term (a crate) across the « = » and CHOOSES its sign on arrival; the resistance is the CALCULATION of both sides at the hidden solution (« كما هو » breaks the equation, shown with the two values), then the hand sets the divisor; « عوّض » substitutes. Differs from `equation-balance` (contents of a pan), `solution-ray` (a probe) and `like-terms` (trays of like terms). Contract §2duotricies. |
| 2AM unit 5, lesson « حساب الرابع المتناسب » (2026-10-21): `fourth-gauges` — the hand holds the number that is MISSING in a 2×2 price board (a QUANTITY can be the unknown): a brass knob on a measuring rod (−/+, field, keyboard); three small brass balances under the board (« في الواحدة » the price of one unit in each column, « بين العمودين » how many times the quantity and the price grew, « الجداءان » the two cross products) tilt under the finger, light a lamp when balanced and are balanced TOGETHER for ONE number only (they always lean the same way). The resistance is the VEIL (متقدم: the balances are covered until the release — the number is computed BEFORE), a 4th balance « الفرق » (`c − a` vs `d − b`) that balances at the WRONG number (404 instead of 600) and, in « جرّب أعدادك », a table whose fourth proportional is not a decimal (10/3: no number of the rod balances). مبتدئ `4 kg → 520 / 6 kg → ?`, `3 kg → 840 / ? kg → 1400`, `8 → 400 / 12 → ?` with the decoy; متقدم covered `2,5 → 325 / 4 → ?`, a hole in `b`, a hole in `a` (step 0,1), `12 m² → 3 L / 18 → ?`. The notebook writes the five paths (coefficient, unit, additive, multiplicative, cross) with HIS numbers — a path whose numbers are not clean decimals is not written. Differs from `linear-machine` (the hand holds the input x), `origin-line`, `ratio-ride` (the hand holds the duration), `percent-tag`, `solution-ray`. Contract §2tertricies. | **Implemented 2026-10-21** |
| 3AM unit 6, lesson « التناسبية والتمثيل البياني » (2026-10-21): `pin-rails` — the hand SLIDES a pin along the rail of its column to its price (a table becomes points) and lays a RULER on two nodes it chooses (O or a pin); the resistance is the ruler's own touch — green nodes, orange gaps, « تقطع المحور عند 10 » when every pin is touched but O is out — and the pin released at the wrong price that falls back with the table's price. Distinct from `origin-line` (4AM: slope held, points imposed) and `ratio-ride` (input x held). |
| 3AM unit 6, lesson « النسبة المئوية » (2026-10-21): `hundred-grid` — the hand PAINTS t cells of a 10 × 10 tray whose stock is cut into 100 equal packets (one cell = x ÷ 100, the coefficient t/100 made visible); an increase ADDS t cells, a decrease REMOVES them; the resistance is the basket that does not open on a wrong written answer (the line says what the grid gave) and the chain +20 % then −20 % whose second change is taken of the NEW stock. Distinct from `percent-tag` (continuous bar, 4AM) — mechanic, representation and variable-per-cell differ. |
| 3AM unit 2, lesson « مقلوب عدد وقسمة كسرين » (2026-10-25): `gear-crank` — the hand TURNS the crank of a bicycle (drag around the axle, full turns accumulate; ‹ سنّ › one tooth): the chain advances tooth by tooth on a chainring of F teeth and a sprocket of R teeth drawn with their REAL numbers, the pedal turns teeth/F and the wheel teeth/R; the flag stands at a number of WHEEL turns to scale, so the student finds the PEDAL turns — the division by the ratio F/R made by the hand (6 wheel turns need 8 pedal turns: a quotient LARGER than the dividend). The resistance is the flag (overshoot / shortfall written in wheel turns, stamp on the flag) and, in متقدم, the locked crank until a fraction is predicted with the counters veiled; swapping chainring and sprocket gives the reciprocal. Distinct from `fair-share` (one child's share), `egg-trays` (grouping of naturals), `fourth-gauges` (a missing cell) and `code-lockers` (code wheels). Contract §2sextricies. |
| 3AM unit 1, lesson « جداء عددين نسبيين » (2026-10-26): `elevator-reel` — the hand holds the SIGNED TIME of a security-camera replay (a knob on a timeline −3 … 3, −/+, keys; in متقدم also the signed speed with a lever « يصعد / ينزل »): a freight elevator passes the ground floor at time 0 and is at floor r × t. Rewinding a DESCENDING elevator (negative time) lifts the cabin ABOVE the street — (−) × (−) = (+) becomes a fact of the world before it is a rule; stacked arrows (solid after, dashed before) show « r + r + … + r »; a wrong stop says the time, the floor and the side of the street — and, when the cabin is on the OTHER side of the street from the goal, asks « قبل مروره بالطابق 0 أم بعده؟ » — the product is written only after the discovery (council of 2026-10-27); both levels predict the floor among four cards that each carry a belief (NEGNEG, ADD, SUB) before seeing (مبتدئ p1: one minute BEFORE the passage, after a first mission); « ▶ شغّل التسجيل » replays the film −3 → 3 once every prediction is answered; the signed speed is its own card (« −2 », arrow, « ينزل طابقين في كل دقيقة »); the game screen (`immersive`) fills the laptop. Distinct from `zero-probe` (the hand holds a DISTANCE) and `power-train` (the hand holds an EXPONENT). Contract §2septentricies. |
| 3AM unit 1, lesson « جداء عددين نسبيين », module 2 معارف (2026-10-27): `sign-machine` « آلة الجداءات » — the hand holds the SECOND FACTOR b (a knob on a rail −4 … 4 under a lit board, −/+, keys; in متقدم also the sign and distance of the first factor a): every b visited lights its column a × b above or below the 0 line and lit columns stay, each step between neighbours drawn as a stair (a tread from one tip, a riser arrow « +3 » to the next tip) — the steps stay the same across 0, so (−3) × (−1) = 3 is SEEN, never stated. Resistance: the negative side is locked « ؟ » until (−3) × (−1) is PREDICTED on cards (a wrong card never shows the answer); flipping a's sign reverses the whole table. MANIPULATION_CONTRACT § 2septentricies-bis. |
| 3AM unit 1, lesson « جداء عدة أعداد نسبية » (2026-10-26): `robot-track` — the hand holds the SIGN of each card and the ORDER of the cards of a small robot's programme on a graduated floor mat (a gate at 0, a flag at the target): each card multiplies the robot's position, a negative card makes it JUMP over the gate. The side of the final stop follows the NUMBER of negative cards (one or three negative signs reach −24, never two; two negatives give +24, so « any negative ⇒ negative » and « the majority decides » are refuted by the student's own stop), never their order (متقدم a2 replays every order to 20); a card put TWICE (`square` world) never lands on the negative side, and the button « لا يمكن » opens only after a positive and a negative trial. Gesture family: carry + tap-flip + swap (not the scrub of `elevator-reel`, not the wheels of `code-lockers`); world: a robotics-club floor mat. Why not `power-train` (equal factors, the exponent in the hand) nor `rotation-dial` (an angle): see the plan §6. |
| 3AM unit 2, lesson « تساوي كسرين ومقارنتهما » (2026-10-26): `shade-match` — the hand POURS c blue shots into a bucket that has d white (press-and-hold lever, one shot per 0,45 s, « تصريف » takes one back); the bucket's colour is computed from the exact share c/(c+d) so equal ratios are IDENTICAL colours, a needle meter leans by the sign of c × b − a × d (« أفتح » / « أغمق », lamp « تطابق »), each release pins a tick labelled with its c. The resistance is the IMPOSSIBLE case (3/4 over 10 white: 7 is lighter, 8 darker, no integer fits — the cross products compare), the « +4 white so +4 blue » belief refuted by the needle, and in متقدم the VEILED meter (a commitment, or the two written neighbours). مبتدئ `3/4 on 8 → 6`, `2/3 on 9 → 6`, `3/4 on 10 → none`; متقدم `5/6 on 18`, `4/7 on 12 → none`, `9/12 on 8`, then which of 7/9 and 10/13 is darker (numerators refuted). Distinct from `fraction-knife`, `fourth-gauges`, `scoop-scale`. Contract §2octentricies. | **Implemented 2026-10-26** |
| 3AM unit 2, lesson « جمع وطرح كسرين » (2026-10-26): `seed-rake` — the hand STRETCHES a garden rake (spacing 1/N m, N = 2 … 60) over a 1 m bed painted with 1–3 crop zones (1/4 tomatoes, 1/6 peppers…, the last may be a harvest); « ازرع » plants one seedling per cell. A spacing works iff every zone holds a WHOLE number of cells (a common multiple); otherwise a cell straddles a border (wilted plant, nothing counted). The invariant is the planted length (5/12 m for 1/12 and for 1/24) and the gardener's need for room makes the smallest common multiple the widest spacing. متقدم locks the rake: write N and the length first. Distinct from `fraction-knife`, `tile-yard`, `ruler-compare`, `unit-ladder`. Contract §2undequadragies. | **Implemented 2026-10-26** |
| 3AM unit 2, lesson « العمليات على الأعداد الناطقة » (2026-10-26): `merge-board` — the hand PREDICTS the sign of each merge (pads + / − / 0, required before the merge), FLIPS the divisor of a division (its sign kept) and chooses the ORDER of the merges on a row of tiles (fraction + signed bar) of an arcade cabinet: a wrong sign is refused and the bars show why (two colours laid end to end OVERLAP and the shorter part vanishes), the magnet holds a × or ÷ to its neighbours (priority), a bubble holds parentheses, a long rail is a compound fraction. `c1`–`c4` visible bars, `a1`–`a4` hidden bars; world `signs` asks only the sign six times in a row. Distinct from `like-terms`, `term-ferry`, `equality-lanes` (a term CROSSES), `robot-track` (factors reordered FREELY), `shade-match`, `seed-rake`, `gear-crank`: the tiles never leave their row. |
| 3AM unit 2, lesson « العدد الناطق » (2026-10-26): `number-line-pegs` — the hand CARRIES a card bearing a writing a/b and HANGS it where it believes the number lives on a courtyard rope graduated at the integers (step 1/12 with a ×3 loupe in مبتدئ, 1/48 and no graduation in متقدم); « تحقّق » lets the wind slide every card to its true peg: different writings of one number STACK (« 3 بطاقات على الملقط نفسه »), (−9)/(−12) lands on the POSITIVE side, a card hung on the wrong side crosses zero, −7/3 has an exact place between −3 and −2 while its decimal « −2,333… » never ends. متقدم hangs ALL the cards then one verdict judges the order and each unit interval. `w1` 6/(−8), (−3)/4, 3/4, (−9)/(−12) · `w2` −7/3 ×3 and 7/3 · `w3` −1,5, 2, (−20)/(−8), −3; `a1` six cards, `a2` −9/4, −11/4, −10/4, `a3` 15/(−20), −6/8, −5/6. Gesture family: carry and hang a DOM card (not the scrub of `elevator-reel`, the flip of `robot-track`, the wheels of `code-lockers`, a probe distance of `zero-probe`); world: a school courtyard rope. Contract §2unquadragies. | **Implemented 2026-10-26** |
| 3AM unit 1, lesson « حاصل قسمة عددين نسبيين » (2026-10-26): `code-lockers` — the hand holds the missing CODE of a combination lock: a SIGN wheel and digit wheels (or, in fraction mode, three signs and two numbers) on a locker of the municipal library whose door carries the rule « (−6) × ? = 48 ». The screen multiplies live, so `a ÷ b = q ⇔ b × q = a` IS the mechanism and the sign of the quotient is what opens the door; a wrong code is refused with its calculation (same distance, wrong sign); متقدم makes the SIGN a prediction (« ثبّت » before the digits unlock); when no decimal code exists three writings (−a/b, a/−b, −(a/b)) open the same door, and `b = 0` in the free panel shows that no code (or every code) fits. Gesture family: ROLL wheels (not the scrub of `elevator-reel`, the carry + flip of `robot-track`, nor the stretch of `seed-rake`); world: a library entrance hall. Why not `division-jumps` (1AM, q as jumps), `egg-trays` (the dividend in the hand), `fourth-gauges` (a proportion cell) nor `term-ferry` (the divisor of an equation's last step): see the plan §6. |
| 3AM unit 4, lesson « حساب قيمة عبارة حرفية » (2026-10-26): `marble-run` — the hand holds the VALUE of the letter (a marble dropped into its reservoir, which feeds an IDENTICAL marble to every slot of the letter) and WRITES the substituted line (brackets around a slot, the hidden × before a slot) under a pegboard wall whose stations are the operations of the expression (copier of the square, press of the product, flip gate of the minus, junction of + / −): the wall computes what the expression MEANS, a strict reader what the LINE says (digits fuse 4 · 3 → 43, −2² reads −4, `4 × −2` is unreadable) and the first station where they part lights up with the student's own two calculations; متقدم adds a typed PREDICTION before the lever and two reservoirs; the world `twins` puts two walls under one reservoir to find a counter-example (a value where they differ) and shows that agreeing values prove nothing until « انشر » (MANIPULATION_CONTRACT §2tresquadragies). |
| 3AM unit 4, lesson « مقارنة عددين ناطقين » (2026-10-26): `difference-meter` — the hand PLUGS a red and a black probe on two beads of a graduated glass rail (it decides WHICH number is subtracted) and reads ONE galvanometer needle (« red minus black »), then chooses the order card; swapping the probes makes the needle CROSS without moving a bead or changing the right card, −3/2 against −1/2 sends it LEFT, 9/11 against 13/16 (0,85 px apart: the beads overlap, a lens gives each a handle) is still decided by the needle; متقدم covers the needle with a SHUTTER until the difference is WRITTEN and hides the beads behind a CURTAIN (only « a − b = −0,3 » is given); the world `race` makes the beads A(x) and B(x), the hand holds x, the needle reads A − B and crosses 0 where they meet, and the hand fills one order card per region of x (MANIPULATION_CONTRACT §2quattuorquadragies). Distinct from `zero-probe` (ONE probe, a distance), `ruler-compare` (a graduation chosen), `number-line-pegs` / `loom-threads` (numbers placed), `equality-lanes` (an operation handed to both sides). |
| 3AM unit 5, lesson « المتباينات والعمليات » (2026-10-26): `loom-threads` — the hand holds ONE KNOT of the lower beam of a weaving loom and the WHOLE number line follows (comb: x → x + c, nail: x → c·x, the knot's position IS c); a red and a blue wool thread (a < b) CROSS exactly when the factor is strictly negative, × 0 gathers them on one knot (0 = 0), and متقدم chains two operations on a third beam and transports a painted BAND (x < 3 to x > −6) — no unknown, no solving (MANIPULATION_CONTRACT §2sexaquadragies). Distinct from `equality-lanes` (WHO receives c; a wall with two runners), `origin-line` (a slope in a plane), `solution-ray` (a probe x), `robot-track` / `number-line-pegs` (numbers placed or carried) and `difference-meter` (a plugged difference). |
| 3AM unit 5, lesson « حصر عدد عشري موجب » (2026-10-26): `scoop-scale` — the hand holds the QUANTITY itself (a mass poured and pinched onto a spice-shop scale whose big seven-segment SCREEN ROUNDS it at the task's rank) and must find where the screen flips: the smallest and the largest mass that read 1,3 — 1,25 included, 1,35 EXCLUDED — so the REFUSAL (« لو أنقصتَ حفنة لصارت 1,25 والشاشة ما تزال تقرأ 1,3 ») carries the idea of the half-open interval; the screen can round to the kilo (the width depends on the rank), and متقدم adds a model sachet of 2/7 kg with a lamp that never says « balanced » (a quotient is trapped between two ticks, never reached) — no rule written (MANIPULATION_CONTRACT §2septquadragies). Distinct from `ruler-compare` (holds the graduation), `solution-ray` (a probe on an abstract line), `decimal-comma`, `zero-probe`, `hundred-grid` and the sibling `loom-threads` (maps a whole line by a knot). |
| 2AM unit 2, lesson « الكسر: نسبة وحاصل قسمة وقيم مقرّبة » (2026-10-28): `mooring-lines` — the hand holds the QUOTIENT candidate at a rank (1 / 0,1 / 0,01): a brass clip slid on a bar; « ضع القطع » lays the b pieces (or the q ropes of b m) end to end on a rope over a graduated tape at a fishermen's harbour, and the exact comparison b × q with a is physical — it suffices with a leftover written in metres, lands exactly on the end, or overflows above the water. The dial opens the next rank ONLY once the bracket of the current rank is found (the largest q that fits, the smallest that does not) and the bar zooms into that segment; 8 ÷ 3 never lands (the leftover shrinks 0,2 → 0,02 and never reaches 0) while 9 ÷ 4 lands on 2,25. متقدم: ropes of 0,7 m in 4,6 m — the clip is locked until the TAPE UNIT makes the rope natural (m → dm: both lengths ×10, the same number of ropes). No rule is written (MANIPULATION_CONTRACT §2novenquinquagies). Distinct from `egg-trays` (dividend), `scoop-scale` (rounding screen), `zero-probe`, `ruler-compare`. | **Implemented 2026-10-28** |
| 3AM unit 3, lesson « قوى العدد 10 » (2026-10-26): `ten-zoom` — the hand holds the EXPONENT n of a square frame whose side is 10ⁿ m: it turns a brass zoom ring (or pinches, wheels, presses ×10 / ÷10, keys + −) and each notch multiplies or divides the side by exactly 10 from the 1 m desk top; the plate reads the side in decimal (the 1 moves, a zero appears), the world is a drawn scale from a virus to the Moon's orbit; a prediction « كم نقرة؟ » is made before the first notch (6 / 7 / 1 000 000 and 6 / 7 / 8), 0 notch is 1 m (10⁰ = 1), a reduction never makes the side negative (10⁻³ = 0,001: the 1 at rank 3), and the metric prefixes (كيلو … نانو) are read on the same lens (world `prefixes`). Not `power-train` (no product built factor by factor), not `decimal-comma` (no digit string), not `ruler-compare` (no graduation chosen): gesture ROTATE / PINCH, variable n. |
| 3AM unit 3, lesson « قواعد الحساب على قوى العدد 10 » (2026-10-26): `unit-ladder` — the hand holds the number k of COLUMNS of a band stretched between two unit plaques on a brass ruler (between two neighbouring columns: ×10): two chained bands ADD (km → m → mm: 3 then 3, the dashed total is 6, not 9), a band across the metre measures the GAP between two ranks (km → cm is 3 − (−2) = 5, not 1), and in متقدم the hand CHOOSES the table — area re-tiles the plaques at 2 columns per unit, volume at 3 — so a power of a power multiplies (km² → m² is 3 × 2 = 6); a band to a bigger unit is blue with a negative count, a band ending inside a plaque or in the wrong table is refused with its calculation, and a prediction is made BEFORE the first band. Not `power-train` (no factor built, nothing cancels: a quotient is a distance), not `decimal-comma` (no digit string), not `ten-zoom` (that one ROTATES a ring): gesture STRETCH a band between two marks (MANIPULATION_CONTRACT § 2sexquadragies). |
| 2AM unit 1, lesson « سلسلة عمليات دون أقواس وأولوية العمليات » (2026-10-28): `tram-route` — the hand STAMPS numbered tickets ① ② ③ on the operators of a bracket-free chain: its PLAN. « انطلق » replays it: the plan calculates in its order, a tram rides stop after stop in TIME order and its lit counter is the truth (stories are told in the order the chain is written). A plan that disagrees is refused and the world draws the step with no meaning (« نزل 13 ؟ لم ينزل إلا 9 », 18 groups of 4 as ghosts, 4 tickets at 6,25 DA); a different plan with the same value (a chain of + only) is ACCEPTED. متقدم: the student first writes the chain of the told story, then predicts. Distinct from `merge-board` (tap two neighbouring tiles, a magnet imposes the priority), `story-bars` (+ or − chosen by the tape), `elevator-reel`, `vector-chain`: the student authors a whole ORDER before anything happens and the world is the referee. Contract §2duoquadragies. |
| 2AM unit 2, lesson « جمع وطرح كسرين » (2026-10-29): `trail-odometer` — the hand holds the DISTANCE walked, counted in the trail's small WHITE posts: it walks a hiker (a girl in hijab) along a winding forest path whose white posts divide the trail into n equal parts and whose tall RED posts mark a coarser unit; the leg « a quarter of the trail » is READ in white posts while walking (one red stretch = 3 whites), the two wrist counters are the truth, and the student then WRITES where the group is — « 6/16 » (numerators and denominators added) or « 6/12 » (the red stretch counted as one white post) are REFUSED and a dashed flag is planted on the path at that fraction's position, short of the hiker. متقدم: the arrival fraction and the remainder are WRITTEN before the hiker may move; a closed loop makes 1 + 5/6 count 11 white posts, not 6/6. Nothing is chosen, stretched or planted (≠ 3AM `seed-rake`) and nothing is exchanged (≠ 1AM `rank-exchange`). No rule is written (MANIPULATION_CONTRACT §2novenquinquagies bis). | **Implemented 2026-10-29** |
| 2AM unit 2, lesson « جداء كسرين » (2026-10-29): `window-blinds` — the hand holds the TWO FACTORS of a product with two PERPENDICULAR pulls on a classroom window: the side curtain's edge (width a/b, snapping to its rail's stops) and the roller blind's bar (height c/d, snapping to its cord's notches); the glass covered by BOTH is the double shade, and the two shadows cut the glass into b × d small squares per window, a × c of them dark — the product is an AREA the student counts. The student writes the fraction of a window that is doubly shaded; « 17/12 » (the sum), « 6/7 » (denominators added), « 8/9 » (cross product), the curtain's own fraction or a bare count are REFUSED and a dashed FRAME of that area is laid at the real dark corner. متقدم: the product is WRITTEN before the pulls unlock, on a glass wall of 2 × 1 or 2 × 2 windows (one window = 1), with factors > 1 and a whole-window curtain (2 × 3/5). Nothing is cut or extended (≠ 4AM `area-split`, `turf-factoring`) and no unit is carried (≠ 1AM `tile-yard`). No rule is written (MANIPULATION_CONTRACT §2novenquinquagies ter). | **Implemented 2026-10-29** |
| 2AM unit 4, lesson « حلّ مشكل باستعمال معادلة » (2026-10-29): `juice-line` — the hand holds the UNKNOWN x of an equation: the capacity of a bottle mould (مبتدئ, two test fills only) or the content of the tank (متقدم); each fill answers in the world (full bottles, a partial bottle at its level, juice left), the student writes the operation that gives x, wrong operations (×, flipped, −, +) are refused by the DRAWING of their value, the solution is confirmed by an exact fill, and equation cards demand ALL the right equations; the last task needs two steps (undo the last operation first). |
| 2AM unit 4, lesson « اختبار مساواة أو متباينة » (2026-10-29): `bridge-load` — the hand holds COUNTS of sacks (x cement, y sand) loaded onto a truck before a bridge whose sign states a rule (« < 5000 kg », « ≤ 7000 kg »); the weighbridge screen writes the textbook's substitution line and the comparison, the student answers the verdict BEFORE the barrier moves (the boundary load 5000 separates « < » from « ≤ »; two unknowns; two trucks with ONE load for an equality true for one value); at متقدم the screens stay masked until both members' masses are typed and a claim « always » falls before ONE counterexample (a counterexample that satisfies the claim is refused). |
| 2AM unit 4, lesson « إنتاج عبارة حرفية واستعمالها » (2026-10-29): `wax-cells` — the hand holds n, the NUMBER OF CELLS of a row of hexagonal wax cells (two neighbours SHARE a rod): it drags cells from a tray onto the row (8 at most), reads the rod counter (an edge count of the drawing), then WRITES the rule with the letter n, judged on every built row; the drawing refutes 6n (shared rods blink) and 5n (the first rod dashed); at متقدم the counter is hidden until the number is typed, a two-row strip (8n + 3) and two letters (n, m) follow. |
| 2AM unit 3, lesson « التعليم على مستقيم مدرّج » (2026-10-29): `corniche-ruler` — the hand holds the ORIGIN of a graduated board laid under the landmarks of a seafront (a red « 0 » flag planted on a graduation, مبتدئ) and the VALUE OF ONE GRADUATION (a brass lever with ten notches, متقدم); the abscissa of a landmark is an OUTPUT — it changes when the flag moves although the landmark never did, two landmarks at the same distance on both sides are opposite for ONE origin only, a landmark can fall between two graduations (hatched half-cell), and a too-small graduation throws a point off the board while a too-large one leaves it between two graduations. The student TYPES an abscissa (a wrong one raises a dashed ghost: the graduation count without its value, the mirrored side, the old origin) or TAPS the graduation of a point after fixing the lever. Not a distance from a fixed zero (≠ `zero-probe`), not a carried card (≠ `number-line-pegs`), not a precision dial (≠ `mooring-lines`). No rule is written (MANIPULATION_CONTRACT §2novenquinquagies quinquies). | **Implemented 2026-10-29** |
| 2AM unit 3, lesson « تعليم نقطة في المستوي » (2026-10-29): `dig-grid` — the hand holds the ORIGIN STAKE of an orthonormal frame laid over an excavation (one 2D drag, two cords follow, مبتدئ) and then a typed or tapped POINT (متقدم); the coordinates of a find are an OUTPUT that all change with the stake, the order of the two numbers becomes a necessity (a notebook with swapped numbers has no stake: « لا يوجد موضع »), a find on the green cord has abscissa 0, and the mirror place of a coin across the blue cord changes one coordinate only. Theme `digsite`; contract § 2novenquinquagies octies. |
| 2AM unit 3, lesson « المسافة بين نقطتين على مستقيم مدرّج » (2026-10-29): `gap-caliper` — the hand holds the OPENING of a brass caliper clamped on ONE bead of a giant thermometer (the weather club's board): it turns the screw until the free jaw touches the second bead; the opening (never negative) IS the distance, an OUTPUT of the two readings. A caliper that crosses zero adds two pieces (the band is split at the blue zero line), two negative beads overlap, a typed « −13 » crosses the jaws and is refused, and at متقدم the opening is typed BEFORE the screw unlocks, the caliper is clamped on the UPPER bead (AB = BA) and a fixed opening swung up and down finds TWO points. Wrong openings leave the jaw short or past the bead (dashed segment). Not `zero-probe` (a cable from zero + a side toggle, output a position), not `difference-meter` (a signed difference read by probes); contract § 2novenquinquagies decies. |
| 1AM unit 1, lesson « الأعداد العشرية ونصف المستقيم المدرّج » (2026-10-30): `jump-tape` — the hand holds the UNIT LENGTH (it stretches the « 1 » mark of a measuring tape that shows only O until then; ten ticks of 1/10 then appear), then a FLAG's position on a small tick (the abscissa `A(2,4)` is read live); at متقدم it holds a reading CURSOR (exact reading on a tick, bounds between two ticks, a tape without its origin, a tape graduated in hundredths). Refusals are drawn: an over-long unit pushes a mark out of the pit, a too-short one piles the ticks up, a wrong flag leaves the jumper's footprint at the true place. Not `ruler-compare` (graduation chosen to separate two numbers), not `number-line-pegs` (a card carried), not the next lesson's `stride-stamp` (a unit stamped both sides of O); contract § 2novenquinquagies duodecies. |
| 1AM unit 5, lesson « الأعداد النسبية وسياقات استعمالها » (2026-10-30): `frost-gauge` — the hand holds the LEVEL of a vertical gauge (a thermometer's liquid in Djelfa in January, an altitude pin, a lift cabin) and puts it on a reading given IN WORDS (« 3 درجات تحت الصفر »); the scale shows only the 0 and a sign appears only once the level is below it, so the SIGN (side of 0) and the DISTANCE (hatched bracket) are two readings of one level; a mirror on the 0 makes the hand hold a level and its shadow, the opposites; at متقدم two different levels at the same distance, the floors, who is farther from the sea. Not `stride-stamp` (lesson 2: a unit stick stamped both sides of O), not `gap-caliper` / `zero-probe` (2AM) |
| 1AM unit 5, lesson « التعليم على مستقيم مدرّج » (2026-10-30): `stride-stamp` — the hand CARRIES one unit stride (a wooden stick) from the origin O of a village road to BOTH sides: the ticks `1, 2, 3` east and `−1, −2, −3` west exist only once stamped, the road is finite (a stride too long cannot reach −3, changing the stride erases the ticks); then the twin of a house on the other side of O, three houses at `A(−3)`, `B(2,7)`, `C(−1,5)` (the abscissa is the OUTPUT, its sign appears only west of O); at متقدم the flag of the ORIGIN planted where only two graduations are written (the other ticks relabel live) and a one-stride frame slid between two consecutive ticks. Not `jump-tape` (stretches the unit on a half-line, plants flags), not `frost-gauge` (the LEVEL of a vertical gauge), not `corniche-ruler` / `zero-probe` / `gap-caliper` (2AM) |
| 1AM unit 6, lesson « البحث عن أعداد ناقصة » (2026-10-30): `rewind-belt` — the hand holds the OPERATION CARD that runs a packing-workshop belt BACKWARD, then the crate: a machine card (« + 9 », « − 14 », « × 6 », the trap « 80 − ») gave 54; the hand picks the card from a rack, drags the crate from the output tray through the machine to the input bin (the missing number □ is the crate's number as it crosses the machine), then pushes it forward through the ORIGINAL machine: what comes out must be 54 (check by substitution). A wrong card is never corrected: the check says « 72 بدل 54 »; « 80 − » is its own inverse (« + » gives 134 then −54); at متقدم decimals, « 12,5 − », and a division that does not stop (the crate carries `20/7`, the check is exact). Not `story-bars` (stretches an unknown bar), not `elevator-reel` / `zero-probe` / the 2AM equation labs (balancing), not `stride-stamp` / `frost-gauge`; contract § 2novenquinquagies quindecies |
| 1AM unit 6, lesson « تطبيق قاعدة حرفية » (2026-10-30): `letter-dial` — the hand holds the VALUE of each letter on a rotary dial: a copy-shop rule « الثمن = 5 × n + 20 » is printed with its letter in a slot; turning the dial drops the value into EVERY slot of the letter and the card computes on a tape (5 × 12 + 20 → 60 + 20 → 80, never 512); a value counts at the release of the dial; level 2: `2 × (a + b)` with two dials, then a pretended rule `a + b = a × b` that holds at (2 ; 2) and is refuted by ONE counterexample. Distinct from `wax-cells` / `juice-line` / `bridge-load` (§ 2novenquinquagies septdecies). |
| 1AM unit 5, lesson « التعليم في المستوي » (2026-10-30): `courtyard-drone` — the hand drives a DRONE over the plan of a school courtyard (the flag pole is the origin, two painted lines are the axes) ONE AXIS AT A TIME: first along the horizontal line, then, the position fixed, along the vertical, then « photograph »; the drone REFUSES a diagonal (it shakes, a crossed diagonal is drawn). The place is said by its two numbers (« النافورة عند (3 ; −2) ») or drawn and read live; driving the numbers in the opposite order lands on (−2 ; 3), another place; points of an axis have a zero number; at متقدم half tiles, then a map WITHOUT squares where the drone projects the two parallels to the axes. Not `stride-stamp` (one stride on ONE line), not `frost-gauge` (a level on a vertical gauge), not the 2AM plane labs (`dig-grid`, `corniche-ruler`); contract § 2novenquinquagies sexdecies |
| 2AM unit 3, lesson « جمع وطرح عددين نسبيين » (2026-10-29): `balloon-ballast` — the hand holds the LOAD of a hot-air balloon above a plateau edge (the zero): flame tokens (+1 m) and sandbags (−1 m) that it ties on or throws overboard (and, at متقدم, a neutral pair). The altitude is an OUTPUT; a flame and a bag together lock as a pair and change nothing; a card `a ± b` names the gesture (`+ (−4)` tie 4 bags, `− (−3)` throw 3 bags — the balloon RISES, as if three flames were tied), the judge checks the gesture log AND the typed altitude, and when there is nothing to throw the student ties neutral pairs first. A wrong altitude raises a dashed ghost balloon (distances added, sign of the added number, subtraction without flip). Not one distance and a side (≠ `zero-probe`), not a signed difference read by probes (≠ `difference-meter`), not merging neighbours (≠ `merge-board`). No rule is written until the last chain question (MANIPULATION_CONTRACT §2novenquinquagies sexies). | **Implemented 2026-10-29** |
| 2AM unit 3, lesson « حساب مجموع جبري » (2026-10-29): `tug-rope` — the hand holds the TEAM of every term of an algebraic sum on a sports ground: it TURNS the child whose term is preceded by « − » (his bib becomes the opposite) and SENDS each child to the left (orange flag, « − ») or right (green flag, « + ») side of a rope; at the whistle a red ribbon tied at the rope's middle advances by (right strength − left strength) over a graduated strip. The sum is an OUTPUT; the order of arrival never matters, opposite bibs cancel, and a bracket is a small team settled first. A ghost ribbon and blinking children show an un-turned « − » child, a turned added term, a wrong side; at متقدم the position is written before the whistle. Not `merge-board` (neighbouring fusions), not `balloon-ballast` (a load of unit objects for two numbers). |
| 2AM unit 2, lesson « مقارنة كسرين » (2026-10-29): `level-laser` — the hand holds the HEIGHT of a red laser level that crosses two (three) identical oil tanks whose glass sight tubes are graduated DIFFERENTLY (quarters on one, twelfths on the other); the same height is READ in each tube by a chip (« العلامة 9 من 12 » / « بين 4 و 5 من 8 »), so `3/4 = 9/12` is seen, not computed. The student says which tank holds more and WRITES the left level in the other tube's marks; the wrong models (numerators only, « more marks = more oil », rewriting the denominator alone, « one mark short of full, so equal ») are refuted by the WORLD (the laser jumps to the level the student claimed and the other oil sits on the wrong side of the red line). At متقدم the tubes are covered by canvas sleeves (the answer is written BEFORE seeing), then lifted and checked with the laser. Distinct from `shade-match` (3AM: the hand DISPENSES c shots into d white and a colour meter judges equality — the student builds a fraction; here the fractions are given and the hand moves a MEASURING line), `number-line-pegs`, `ruler-compare`, `scoop-scale` and the balances (deliberately not used). |
| 2AM unit 1, lesson « سلسلة عمليات تتضمّن أقواسا » (2026-10-29): `coop-calculator` — the hand holds the BRACKETS of a line typed on a scientific calculator at the school cooperative's counter: it taps a GAP between key-caps then presses « ( » / « ) » (متقدم: it types the whole line from a story or a fraction-bar card). « = » prints the line and the machine's value (the machine OBEYS the priorities); a value the story refutes is struck on the paper tape and the counter says why in its own objects (« 48,75 DA لكلّ صديق؟ ثمن الكتاب كلّه 60 DA »), an unbalanced line is refused by the machine (Syntax ERROR), a useless pair is accepted with a remark. Distinct from `merge-board` (merging tiles inside existing bubbles), `marble-run` (brackets around a substituted negative), `trig-calculator` (sin/cos/tan) and `tram-route` (an order stamped on chips): here the bracket IS the variable and the referee is a calculator plus the story. Contract §2duoquadragies bis. |
| 2AM unit 1, lesson « وصف سلسلة حسابات » (2026-10-29): `chain-cutter` — the hand holds WHERE a printed chain is cut (the ROOT = the last operation); the staples laid by the calculation rules referee, the same value found by chance does not excuse a cut (the staple, not the value, decides); then it sticks the NAME, the pockets relabel (terms / factors / dividend and divisor), the sentence grows; متقدم hides the staples until the cut and then GLUES blocks with the brackets a sentence needs. Not `marble-run` (tree = a run for substitution), `merge-board` (bottom-up merging), `fraction-knife` / `area-split` (cut a quantity) or `coop-calculator` (changes the writing). Contract §2duoquadragies ter. |
| 2AM unit 1, lesson « توزيع الضرب على الجمع والطرح » (2026-10-29): `kit-packer` — the hand holds WHAT EACH DISPENSER RELEASES (and, in k4, HOW MANY BAGS) while a belt deals every load one item per bag; the BAG is the referee (ready / short / extra / unequal, counted and drawn) and two equal counters (Fatima bag by bag, Ali kind by kind) light together only when every bag is ready; a difference adds a bin of damaged items; read backwards (dispensers locked) the common factor is the number of bags; متقدم: typed prediction of the total, 48 = 50 − 2, ribbons in metres, a classmate's order `6 × 4 + 3` to correct. Not `area-split` (3AM: a field's SIDE cut by a knob, distributivity as an area), `turf-factoring` / `pitch-expansion` (4AM), `fair-share` (1AM: ONE quantity shared) or `egg-trays` (2AM: Euclidean division). Contract §2duoquadragies quater. |
| 3AM unit 3, lesson « الكتابة العلمية ورتبة القدر » (2026-10-26): `size-ladder` — the hand holds the POSITION of a length card on a fixed ladder of decades (rung `10ⁿ → 10ⁿ⁺¹` with nine LOGARITHMIC cells): first its RUNG n (= the bracket `10ⁿ ≤ A < 10ⁿ⁺¹`), then its CELL (= the integer part of `a` in `a × 10ⁿ`), then the MAGNET that jumps to the nearest whole graduation (= the order of magnitude `a' × 10ⁿ`, climbing to the next rung when `a' = 10`); a card hung on a wrong rung or in a wrong cell falls back with the calculation (`265 ≥ 1 000 ؟ لا`), two cards compare by their RUNGS first (9,8 × 10⁻⁵ < 1,2 × 10⁻⁴), and in متقدم the student WRITES `a` and `n` before hanging (`4,8 × 10⁻¹ = 0,48 ≠ 0,000048`). Not `pin-rails` (a linear rail and a squared frame), not `ruler-compare` (a finer graduation), not `decimal-comma` (no digit string), not `ten-zoom` (one rescaled view) nor `unit-ladder` (a stretched band): gesture DRAG-AND-DOCK on a continuous multiplicative scale (MANIPULATION_CONTRACT § 2unquadragies). |

**Lessons 2–9, what the hand now does (2026-09-30).** The instrument is chosen per concept
(§6, §12). Lessons 4, 5 and 7 share the reserve **on purpose**: coprime is the PGCD = 1 case of
common divisors, so the student recognises the instrument.

| Lesson | Gesture (engine) | What resists / what the student decides | Leaks removed |
|---|---|---|---|
| 2 factor-pairs | pull the row's edge; the books re-form into a rectangle in a square frame (stretch) | the incomplete row; past the square every perfect rectangle is a **turned** earlier one (geometric, order-independent) | tiles dimmed past √n, leads printing the bound, the ² inequality that rendered false |
| 3 divisor-properties | carry wall b (carry); at متقدم **predict** before each build | a wrong prediction is refuted by the wall | bidi-scrambled wall labels (now `<bdi>`); the dead proof builder |
| 4 common-divisors | **add a group at a time** from the reserve (carry, `GroupStock`) | leftovers drawn in their colours; « greatest » needs the next k seen failing | the 1…24 numeral rail (a jump to 18); the brick lead that answered step 1 |
| 5 common-divisors | bags (مبتدئ) / **the lists** (متقدم, the lesson's method) | a chip that divides one number only is refused with the number | the advanced level that re-opened lesson 4's bags |
| 6 differences / Euclid | cut the short ribbon out of the long one / lay copies **and try the copy too many** | the PGCD box refuses by divisibility («56 لا يقسم 252»); the extra copy does not fit | the pre-labelled cut («140 \| 112»), the automatic «توقّف», a raw i18n key; the dead `d1`/`e1` gates are real now |
| 7 coprime-explorer | add bags one at a time up to 17 / confront the smaller number's divisors | «only 1» only after 2…17 all failed; lists conclude only with complete evidence, or one common > 1 | the insight after two tries, one-chip completion, the silent «تحقّق», the dead `c1` gate |
| 8 fraction-reduction | carry a number of portions (2…12, **not only the good ones**) | non-common numbers refused with the reason; the student **declares** irreducibility (judged); a non-greatest divisor in one step shows what it would give | only-valid chips, the forced second step, the gold PGCD, the announced «غير قابل للاختزال», the hard-coded «2 vs 1» conjecture |
| 9 InfoSorter | sort the data cards (carry, now `useDragInteraction`) | — | the legacy second drag engine and the `motion.button layout` that broke drags |

**Unit 2, what the hand does (2026-09-30).** Three new instruments, one per concept, all on the
stretch engine but each holding a different variable (`MANIPULATION_CONTRACT.md` §2quater):

| Lesson | Gesture (engine) | What resists / what the student decides |
|---|---|---|
| L1 `square-root-side` refine | stretch the side of a square on a graduated ruler (stretch) | for 5, every graduation gives too small or too big; the ×10 zoom opens only after the student brackets the side by hand — no decimal is ever « equal » |
| L2 `square-root-side` graduation | choose the graduation 1/g, then stretch | a card resists every graduation tried; the student classifies the roots by whether one graduation lands exactly |
| L3 `square-fold` | move x; its arrow lands on the line of squares (stretch) | the negative half is hatched and pinning there is refused; x² = 9 stays open until −3 is pinned too |
| L4 / L5 `square-tiling` | stretch k, the tiles per side of a square of area n (stretch) | k² ∤ n refuses the tiling with n ÷ k² read exactly; L5: only the largest k gives a tile that cannot be tiled again |

**Unit 3, what the hand does (2026-10-01).** One reading — a product of sums is the AREA of a rectangle
whose sides are those sums (the textbook's own figures) — and its two directions, each with its own
gesture (`MANIPULATION_CONTRACT.md` §2quinquies):

| Lesson | Gesture (engine) | What resists / what the student decides |
|---|---|---|
| L1 / L2 `pitch-expansion` | stretch **x** — the LETTER is a length (stretch); carry each zone into the sum and a term onto a like term (carry) | an incomplete sum is too small for the x on screen and the forgotten zones light up with their area; unlike terms refuse to merge; ONE verified value of x opens nothing — the identity needs two |
| L3 / synthesis `turf-factoring` | stretch **r**, the number of identical rows (rows); carry each strip to a side of $x^2$ (square) | pieces that cannot be shared fall off the pitch; the corner refuses a split whose right × bottom is not the number of unit squares; $x^2 + 25$ never closes |

The owner asked to keep, BESIDE the causal gestures, a decorative interaction (the ball, the goals):
it is confined to the drawn world, `aria-hidden`, off the keyboard path and reduced-motion-safe — an
exception recorded in the contract, not a licence to animate mathematics.

**Unit 4, what the hand does (2026-10-01).** Four concepts, four different variables — the platform does not
converge (§12), and the football pitch reappears only where the reading « product = area » carries the argument
(`MANIPULATION_CONTRACT.md` §2sexies):

| Lesson | Gesture (engine) | What resists / what the student decides |
|---|---|---|
| L1 `equation-balance` | carry pieces on and off two pans (carry); stretch k, the equal groups per pan (stretch) | one pan changed alone TIPS the beam by the true hidden x; only the mirror gesture restores it; a piece carried across is refused; bags that cannot be shared refuse the split |
| L2 `vanishing-pitch` | stretch x — the pitch's SIGNED sides are the factors (stretch); pin a solution | the pitch collapses only when a side is 0; a pin elsewhere is refused with the exact area; « no other solution » needs the sweep |
| L3 `solution-ray` | stretch a probe — every validated x leaves a red / grey trace (stretch); place the bracket; choose each new line's direction | the bracket is refused with a witness from the student's own traces; ÷(−3) kept as ≤ contradicts the red traces |
| L4 / synthesis `growth-race` | carry « + x » onto each person / price (carry), then stretch x on a timeline (stretch) | a model that forgets a child (or pays the yearly card every session) is refused in the story's words; the columns meet only at the equation's solution |

The owner asked again to keep, beside the causal gestures, a decorative interaction in each world (ball, phone,
flag, candle, ripples) — same confinement as unit 3.

**Unit 5, what the hand does (2026-10-01).** Three concepts, three different variables — a ثنائية is not weighed
on a balance (`MANIPULATION_CONTRACT.md` §2septies):

| Lesson | Gesture (engine) | What resists / what the student decides |
|---|---|---|
| L1 `pair-scoreboard` | stretch BOTH numbers of the pair, one handle each (stretch); swap the pair; claim « حل للجملة » | two gauges read each equation on the student's own pair; the claim is refused while only one lights (« تحقّق المعادلة (1) فقط »); the swapped pair is a refused trial (order matters) |
| L2 `elimination-cards` | carry an isolated expression onto the OTHER card's tiles (التعويض); stretch ×k on a card, lay one card on the other (الجمع) | the expression on its own card gives « 7 = 7 » and is refused; stacking when nothing cancels is refused with the sum written; ×0 wipes the card; done only with (x ; y) checked in both |
| L3 / synthesis `story-modeller` | carry x, y onto the story's nouns, then the story's numbers into □x + □y = □ (carry); choose the method; carry the values to the story's gates | « تحقّق » refuses a model in the story's words (a price counted as people, swapped quantities, an empty slot is not 1); the story is REPLAYED with the pair — a non-natural count is flagged |

Every one of the three also obeys the new one-screen rule (`MANIPULATION_CONTRACT.md` §8bis, §14 question 5).

**Unit 9 synthesis, a living world (2026-10-13).** `shadow-world` replaces `shadow-stick` in `wadiya-idmajiya-talis` M1 (مبتدئ).
It is the first lab built on §16 below; `shadow-stick` stays in the registry (its tests still run) but no lesson uses it.

## 16. Living worlds — the student writes the law (owner directive, 2026-10-13)

> The owner asked for « the full power » of a manipulation and set two rules: **the documentation is not a ceiling** (a lab may
> go beyond every pattern above when learning needs it — then this file is extended, not the lab shrunk), and **the student
> discovers the concept himself — it is never given**. Reference implementation: `geometry/ShadowWorld.jsx` on
> `logic/shadowWorld.js` (« ساحة الحيّ », Thales by the shadows).

The labs of §1–§15 give the hand ONE variable and ask for a conjecture among options. A living world goes further on five axes.

### 16.1 The hand holds the CAUSE, the world holds many objects

The student does not move one object's parameter: they move the **cause** (the sun), and **every** object of the world obeys the
same law at once (minaret, palm, stick, Farid, the installations). The law is then the only thing that explains everything on
screen. Data from the real world when it exists: the sun is Algiers's real sun on 13 October (12:30 → 16:00, k = 1 ÷ tan(altitude),
rounded to n ÷ 25 so every shadow is an exact number of centimetres; the textbook's 1,6 at 15:00).

### 16.2 Tools that can refuse

The tape measures horizontal distances from an object's foot; pulled up the minaret it **falls back** — the inaccessible height is
the problem, felt, not read. The stick's head enters the minaret's shadow and **its shadow disappears**: the textbook's place
(both shadows end at O) is the exact edge where it reappears — the method is discovered as a physical boundary.

### 16.3 A prediction is a diagnostic instrument

Before the municipality installs an object (3 m lamp post, then 6 m flagpole), the student plants a flag where its shadow will end.
`classify(H, hour, p)` compares the bet with the **models a student can hold** — `right` (k·H), `additive` (H + the stick's
difference), `copy` (the stick's shadow), `equal` (H), `inverse` (H ÷ k) — and the companion answers the model, not the score.
**Evidence that cannot discriminate is flagged:** at 12:30 (k = 1) adding and multiplying give the same shadow, so a right bet there
is `discriminating: false` and the companion asks for another hour instead of praising.

### 16.4 The student authors the law; the world tests it everywhere; the cause refutes it

« قاعدتي »: `الظلّ = الطول [+ | ×] [n]` — no operation is pre-selected, the number is typed. `ruleCheck` applies it **exactly** to
every known object present and the world plants violet flags at the predicted tips, with the gap drawn to each real tip. A rule fit
on the stick alone is refuted by Farid. The flags **stay** when the sun moves: the student watches their own rule come unstuck and
must repair it. The discovery gate (`discoveryReady`): three hours seen, two shadows measured at one hour, one bet, a × rule that fits
everything, **and its repair at another hour**. The conjecture prompt and the refutations are written with **the student's two
rules** (`fittingRules`) and their own numbers; the notebook's ratio column appears only after the formal step.

### 16.5 A companion that asks, never tells

`react(state)` answers the last gesture with a numbered observation then a question; `guide(state)` is the standing question of the
current goal; `help(state, level)` opens three levels of tighter questions (`h_<goal>[variant]_<1..3>`), with variants that follow the
student's situation (`rulePlus` after an additive rule, `rule2Same` before the sun has moved). Wrong final answers are **read**:
`judgeHeight` recognises the shadow taken for the height, the inverted ratio, the subtracted difference, two hours mixed, and the
distance AB. A render test asserts that **no message reachable before the student wrote their rule contains the law**
(`1,6`, `\times`, `× n`).

### 16.5bis The tutor chain — a question the student must ANSWER, not just read (owner directive, 2026-10-13)

§16.5's `react`/`guide`/`help` narrate gestures; they never required an answer. The owner asked for more: مقران must
run a real question → typed/tapped answer → judged feedback → next question loop from zero knowledge to the
formal rule — a tutor, not commentary beside a simulation.

**The checkpoint layer** (`logic/shadowWorld.js`, `judgeTrend` / `judgeFastest` / `judgeRatioSeed` /
`judgePredictReflect` / `judgeRuleReflect`, `CHECKPOINT_ORDER`, `currentCheckpoint`, `answerQuiz`): five fixed
points in the discovery, each with a real two-(or more-)option question JUDGED against the student's own just-
produced numbers — never rhetorical, never answerable by continuing to drag:

| Checkpoint | Opens when | Question | Correct answer comes from |
|---|---|---|---|
| `trend` | a sun move happened | do shadows lengthen or shorten? | the minaret's own shadow before/after (monotone, always decidable) |
| `fastest` | two distinct hours seen | which shadow changed more, in cm? | the taller object always wins in cm, though both tie in **percent** — the seed of k |
| `ratioSeed` | two KNOWN objects measured at one hour | is shadow÷height the same or different for both? | always "same"; the two ratios are computed and compared exactly |
| `predictReflect` | a bet resolved WRONG | which model did you use (additive / copy / equal / inverse)? | `classify`'s own diagnosis of the student's bet; skipped entirely on a right bet |
| `ruleReflect` | a × rule fits everything, once | does the FORM survive the sun moving, or the NUMBER? | always "form" — the number changes, which `rRuleBroken` then shows |

**It blocks, both ends.** `currentGoal` checks `currentCheckpoint` FIRST: while one is open the goal is
`quiz_<id>`, the shell shows mقران's prompt plus its two tap buttons instead of the step's normal content, and
`answerQuiz` itself refuses an id that is not `currentCheckpoint(s)` — a student (or a bug) cannot answer
"fastest" before "trend" even by calling the function directly. A wrong tap gets a rose highlight, an explanation
built from the student's OWN numbers (never a canned line), and the same two buttons stay live for a retry — it
never advances. `goals.observe` / `measure` / `predict` / `rule` are gated on their checkpoint in addition to the
old gesture count, so discovery cannot be reached by gesture volume alone.

**Why a judge, not a judge-then-forget.** Each `judge*` is a pure function of PERSISTENT state (`hoursSeen`,
`notebook`, `predictions`, `rule`), never of `s.last` — a real bug found the hard way: `judgeTrend` first read
`s.last.kind === 'sun'`, so answering it (which sets `last.kind = 'quiz'`) made the question *unjudgeable* on the
very next check, and the tutor silently skipped to the next checkpoint instead of allowing a retry.
`setHour` now also writes a dedicated `lastSunMove` field that a quiz answer does not overwrite.

**Option labels are STATIC — never put a student's own number inside one.** A second real bug: an option label
(`quizOpt_ruleReflect_number`) contained `{{numText}}`, but option buttons are rendered with `k('quizOpt_…')`
with no interpolation object (matching every `ManipulationDiscovery` option elsewhere in the codebase) — the
literal `{{numText}}` showed on the button. The number belongs in the PROMPT (which IS interpolated with the
judge's numbers), never in an option's own label. A render test (`shadowWorld.render.test.jsx`) scans every
`quizOpt_*` string for `{{` and fails if interpolation syntax survived into a static label.

**A dynamic set of options needs a dynamic distractor, from the logic layer, never guessed in the view.**
`predictReflect`'s correct answer is whichever model the student's own bet matched; showing all four possible
models every time would make it guessable by elimination rather than genuine recognition. `judgePredictReflect`
returns `options: [correct, PREDICT_DISTRACTOR[correct]]` — a fixed, deterministic pairing per model, computed in
`logic/`, so the view never invents which two options to show.

**Centimetres vs already-formatted text — one more key-name collision to avoid.** `say()`'s `CM` set lists which
message params are raw centimetres needing `tex()` (metres, LaTeX); a param already formatted by its judge
(`m()`, e.g. `ra`/`rb`/`numText`) must stay OUT of `CM`, and a param meant to display as a plain integer or
percent (`dStick`, `pctMinaret`) must stay out too, even though both look like "just a number" — the Arabic
template, not the key's type, decides the unit. The browser QA (not the unit tests, which only check judge
correctness) is what caught both directions of this mistake: "870 m" (cm shown unconverted) and "0{,}87 سم"
(a percent run through the metre converter). **A number formatting bug is invisible to `renderToString` snapshot
tests and to pure-logic tests alike — only a rendered, read screenshot catches it.**

### 16.5ter The tutor panel — one question at a time, a visible conversation, no dead ends (owner, 2026-10-13)

The first version of the chain put four things in one bubble — a reaction ending in a rhetorical question, the answer
buttons, a small « ماذا بعد؟ » line holding the REAL question, and a help button — so the student saw two questions and
could answer only one, and each gesture replaced the message. The owner asked for an interaction that is « clear, easy,
and makes progress ». `geometry/ShadowTutor.jsx` (pure view; ShadowWorld passes formatted nodes) now has three zones:

1. **Progress** — « أسئلة مقران », one dot per checkpoint from `checkpointStatus(s)`: `done`, `current`, `pending`,
   `skipped` (a right bet has nothing to reflect on, so `predictReflect` is skipped, not owed).
2. **The thread** — مقران's messages AND the student's own answers as bubbles (✓ green / ✗ rose): the tapped option, the
   rule written, the bet, the height answered. Built in ShadowWorld from each judged event (`lab.last`), the student's
   bubble first, then مقران's reaction; two consecutive sun or stick moves (or two messages carrying the same action)
   collapse into one so the thread does not drown. Last 3 messages (2 below 420 px), the rest unfolds.
3. **ONE pinned card** — either « سؤال مقران » (the only question on screen, big options, « سؤال n من N ») or
   « مهمّتك الآن » (one instruction in the world, never a question). A wrong option, once tried, is disabled and
   struck (« جرّبتَ هذا ») under the explanation that just landed in the thread: the student progresses by reading,
   not by guessing. « تلميح » opens the hint levels INSIDE the card (`hq_<quiz>_<1..3>` for a question, `h_<goal>_<1..3>`
   for a task) and they reset only when the card changes, never at each gesture.

**Rules this enforces (tested in `shadowWorld.render.test.jsx`):** a reaction (`r*`, except the challenge's `rAns_*`)
and a task (`g_*`) contain no « ؟ » — مقران asks only where a button or a field can answer; every checkpoint has its
prompt, its right/wrong feedback, its option labels and its three hints; no `quizOpt_*` contains `{{`.

**No dead end with the stick.** The stick used to start 3 m from the minaret, inside its shadow, and its handle was
hidden in measure mode — so the student's first « قِس ظلّ العصا » failed and مقران's « أبعِد العصا » could not be obeyed.
Now: the stick starts in the sun (`STICK_MAX`, measurable at every hour for both levels — tested); its handle stays
draggable in measure mode (above the tape zone, lifted above a 16 px stick on phones, pulsing while its shadow is
swallowed); and a reaction may carry an `action` — `rStickHidden` / `rMeasureHidden` carry `freeStick`, rendered as a
button under the last message that moves the stick just beyond O (`stickOutOfShadow`, never the textbook's edge, so
escaping the shadow does not hand over the method). **General rule: any instruction a companion gives must be
executable from where the student is, in one gesture or one button.**

### 16.6 Engineering rules for a world

- The companion's brain is **pure logic** (`react` / `guide` / `help` / `classify` / `judgeHeight` in `logic/`), tested like the
  mathematics; the view only formats messages (`say`: cm → `tex`, ids → names).
- Exact integers (cm) decide every verdict; floats only draw. Sweep the layout at every width (`layout`, `hourFromPoint` round trip,
  the sun collinear with (O, M) at every hour).
- Several gestures, one world: local pointer grabs (`grab(kind)`) with capture, plus a keyboard and a button path for each (sun
  slider and −/+, stick slider, flag slider, « قِس ظلّ … » buttons for the tape). Not yet extracted into a shared engine.
- Every gesture reports through `state.report` (`onTrial` evidence: measure / predict / rule / meet / answer).
- One-screen (§14 q. 5): the scene is budgeted on the lesson viewport minus what surrounds it in `[data-sw-glance]`
  (240 → 640 px; the true-scale world needs ≈ 590 px at full desktop width); the companion is beside the scene from `lg`,
  above it below `lg`, and is not subtracted from the budget.
- **Trap — a measured block inside a grid must be `self-start`.** The glance block spans two grid rows beside the
  companion; grid items stretch by default, so when مقران's thread grew the block was stretched to the companion's
  height, the « what surrounds the drawing » measure exploded and the world fell to its minimum height (owner QA,
  2026-10-13: a 230 px world on a 926 px screen). Any lab that budgets its scene from a measured wrapper next to a
  growing column must align that wrapper to its own content.
- **One action panel at a time.** Under the scene: the measure buttons only in measure mode, the bet only at its step
  (or while a flag is placed — the optional second installation waits in a chip), the rule from the bet on, the
  challenge after the formal step. Every stacked panel is height taken from the world.

| Item | Status |
|---|---|
| `shadow-world` in `wadiya-idmajiya-talis` M1 (مبتدئ); 45 logic tests + 8 render tests; Playwright journey at 1366 and 390 px | **Implemented 2026-10-13** |
| The tutor chain (§16.5bis): 5 blocking checkpoints, tapped answers, judged feedback, retry-until-correct | **Implemented 2026-10-13** |
| The tutor panel (§16.5ter): progress, conversation thread, one pinned question/task card, in-card hints, the stick never a dead end | **Implemented 2026-10-13** |
| The pattern on other units (a world + diagnostic bets + an authored rule + a questioning companion) | **Not yet implemented** |
| A shared multi-gesture engine (pivot, tape) extracted from `ShadowWorld` | **Not yet implemented** |
| Phone scale: the 22 m world is drawn at ≈ 16 px/m at 390 px (readable, small) | known limit |

## 17. The Gen Alpha quality bar — always push the UI/UX to the limit (owner rule, 2026-10-14, binding on every generation)

Owner: « always use your limit for the UI/UX of the manipulations for the Gen Alpha 11–13 years old ». Our students grew up on
polished games and apps; a lab that merely works reads as « school software » and loses them. Every NEW or REDESIGNED manipulation is
built to the highest finish the agent can produce — never the first version that passes the tests. The bar, all of it, every time:

1. **A drawn world, rich and alive.** A real scene in inline SVG (a stall, a track, a padlock, a ruler on a wall), with depth (soft
   shadows, raised edges, gradients on light surfaces), characters and objects drawn with care — never bare rectangles, circles or
   emoji. People are always `KidFigure` (girls in hijab; guide §6 « People are the platform's CHARACTERS »). Reference: the three 1AM
   labs of 2026-10-14 (`story-bars`, `division-jumps`, `digit-cards`).
2. **The shared visual language.** Compose `primitives/LabKit.jsx` + `SvgPill.jsx` (`MANIPULATION_CONTRACT.md` §8ter): question chip,
   the big sentence with its lamp, big tactile answer cards, a control card with a BIG readout and round −/+, value and name pills,
   a verdict banner that never makes the stage jump. Extend the kit (with tests) rather than writing a look-alike.
3. **The gesture feels physical.** Grab handles ≥ 44 px that lift under the finger, cards that press down, a « stamp » when right, a
   gentle shake when refused, a character that reacts (`mood`), a hop, a tie, a glow — each micro-animation SERVES the mathematics
   and stops under `prefers-reduced-motion`.
4. **Feedback is immediate, visual and in the student's own numbers** — a pill, a ghost, a remainder circled, a bulb that lights — and
   NEVER states the rule to discover (« discover, don't be told »; §16).
5. **One screen at 1366×768 — the ONE size since 2026-11-19 (owner); the sizes listed next are the rule before that date.** 1024×768, 1280×800, 1366×768, 1920×1080 (the old 390×844 / 320×640 are retired), both levels: the glance fits, no overflow, controls
   inside the stage on narrow widths, type large and bold (the sentence ≥ 18 px, numbers big), contrast high, Arabic DOM text,
   numbers in LTR islands.
6. **Honest drawing.** The picture IS the argument: sizes to scale, a child's crown on its height, counts exact — beauty never bends
   the mathematics.
7. **Say it ONCE — Gen Alpha does not read walls of text** (owner, 2026-10-14). Each thing is written in ONE place on the lab:
   the QUESTION (the `PromptCard` chip + sentence — a kit lab then passes NO shell `mission`), the GESTURE (one line: the idle
   `VerdictBanner` / `LabNote` — not again under the stepper, not as hint 1, not in the lesson's `lead`), the STORY mapping (the
   lesson's `lead`, one short line: « كل قفزة = عقد من 17 لؤلؤة. »). Hints are CLOSED by default (`useManipulation › hintsOpen =
   false`, platform-wide) and each is one short THINKING question — never the gesture again, never the strategy (« اقترب دون أن
   تتجاوز » is the rule). Before calling a lab done, read every visible string top to bottom: a number, a verb or an instruction that
   appears twice is cut. Reference: `division-jumps` (2026-10-14: 7 text blocks → 4; `divisionJumps.render.test.jsx` « says each
   thing ONCE »).
8. **Reviewed with the eyes, not only the tests.** Before calling it done, the agent takes screenshots of the initial state AND
   mid-activity states (a refusal, a success, the formal phase) at the four sizes, LOOKS at every one, and iterates until it would be
   proud to show it to the owner. Tests and e2e green are necessary, never sufficient.

9. **Context, then ONE direct question — no title** (owner, 2026-10-14, binding on every lab, retrofitted on the earlier ones). The top
   of a lab has exactly two things, in this order: (a) the CONTEXT in one or two plain sentences that give every number the student
   needs (« في الورشة 13 صندوقًا، في كل صندوق 10 علب… »), then (b) ONE direct question or instruction that names the GOAL and the END
   STATE, so the student starts moving at once and knows where to stop (« اربط الأقلام حتى تستطيع كتابة عدد الأقلام. »,
   « اقطع الحلوى حتى تقع حافة الحصّة على قطع. »). There is NO title above them — no « اسم المختبر: سؤال؟ » banner, no chip that only
   names the lab, no riddle. The question is a verb the hand can do, never « ما هو… ؟ » about a concept; it never states the rule to
   discover (§17.4) and says nothing the context already said (§17.7). Test before « done »: cover the lab with a hand, read only the top —
   can a 12-year-old start dragging and tell when she has finished? If not, rewrite it.
   **No ambiguity anywhere on the stage (same absolute rule).** Every thing the student can see or touch says what it is FOR: a
   row of cards, numbers, pills or buttons never appears bare — it sits under its own question or label that tells what to do
   with it (« توقّع قبل أن تربط: كم قلمًا في الورشة؟ » above the three prediction cards, not three naked numbers « 1 132 437 · 2 577
   · 75 »). Each control's purpose, each number's meaning (what it counts, in which unit) and each step's end are explicit; if a
   student could ask « ماذا أفعل بهذا؟ », the lab is not done. Reference: `rank-exchange`, `fraction-knife`,
   `egg-trays` after the 2026-10-14 retrofit (with `story-bars`, `division-jumps`, `digit-cards`: kit `PromptCard › context`, shell
   `titleHidden`, render tests « opens on its CONTEXT then ONE question »).

10. **Nothing above the lab** (owner, 2026-10-14). In a module, the lab IS the start: no textbook card, no list of questions, no
   workspace `title` / `lead` above it — they would be a second, competing start. The module's questions come AFTER the lab and
   ask about what the student did in it (`LESSON_DEVELOPMENT_GUIDE.md` §4quater). And the lab's situation is chosen by the
   platform, not copied from the book: the textbook fixes the الكفاءة, the lab is the best situation in which the hand makes it
   necessary (guide §4ter).

11. **Onboarding — « what do I do now? » must never be a question — MANDATORY for EVERY manipulation** (owner, 2026-10-14: « one of
   the best features »; validated on `rank-exchange`). Every lab — new, redesigned or already shipped, in every lesson of every grade —
   shows, at each moment, the button or gesture the hand needs NOW with `LabCoach` (MANIPULATION_CONTRACT §8quater): a pulsing ring
   and a ONE-sentence bubble placed on the element, never over it, shown once, hidable (« فهمت » / « إيقاف الإرشاد » / Esc) and
   re-summonable by the always-visible switch under the question. It shows the CONTROL, never the rule. Identical design details in
   every lab (same component, same strings structure, same gates): a lab without it is not done, like a lab without its screenshots.
12. **The game screen — the lab fills the laptop (owner, 2026-10-27: « the lab must cover and use exactly all the screen of the
    laptop, so the student feels in a game »).** Every lab has it since 2026-10-28 (the shell's `immersive`, on by default; MANIPULATION_CONTRACT § « Game screen »):
    a « العب بملء الشاشة » button puts it in the browser's real fullscreen, the header shrinks to one bar and the SCENE is laid out to
    the screen's height (`elevator-reel` sizes its 19 floors from the height left under the question). Never a second fullscreen, never in
    Classroom Mode. Every quantity of the rule is a FIRST-CLASS readout: the owner, on the same lab, « the speed of the elevator is very
    important — make it clear » — a factor of the product is never a small caption (a card with the signed value, its arrow and one
    plain sentence).

A generation report states, for each lab, the screenshots reviewed and what was improved after looking at them.
