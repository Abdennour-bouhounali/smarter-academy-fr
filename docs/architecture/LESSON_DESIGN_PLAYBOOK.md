# Smarter Academy — Lesson Design & Implementation Playbook

> **The authoritative reference for any AI agent (or developer) designing and implementing a
> Smarter Academy lesson.** It consolidates the platform's contracts, the pedagogical directives,
> and every hard-won lesson from the built lessons (fractions, nombres-entiers, contenances,
> longueurs, masses, périmètres, aires, durées, angles) into one coherent system of rules.
>
> The sibling contracts stay normative — `ARCHITECTURE.md`, `LESSON_CONTRACT.md`,
> `EXERCISE_CONTRACT.md`, `PROGRESS_MODEL.md`, `LEARNING_ARCHITECTURE.md`,
> `AI_LESSON_CONTRACT.md`, `LESSON_INTEGRATION_GUIDE.md`, `INTERACTION_PEDAGOGY.md`, `CLAUDE.md`. This playbook is the
> operational synthesis: how to go from a curriculum JSON entry to a shipped, validated lesson
> without rediscovering any decision. On any apparent conflict, the contract documents win; then
> update this playbook. On what the student manipulates, what they must notice, how feedback is
> worded and how scaffolding disappears, `INTERACTION_PEDAGOGY.md` is authoritative.

---

## 1. What a Smarter Academy lesson IS

Smarter Academy is not a quiz platform, a digital textbook, or a gamified exercise bank. It is a
learning engine whose loop is: *interaction → observation → evidence → diagnosis → mastery
estimation → next best learning action*. A lesson is the interactive unit that makes one official
curriculum object **manipulable**, makes the student's reasoning **observable**, and converts the
final evaluation into **learning evidence**.

Structurally, a lesson is:

- **One catalogue entry** (`packages/core/curriculum/coursesData.js` `smaMetadata`, merged with
  the official ministry JSON) — the source of truth for WHAT is taught: identity, description,
  prerequisites, `pointsToLearn`, duration, difficulty, status, icon, tier.
- **One lesson directory** (`apps/web/src/lessons/college/{grade}/{domain}/{lesson}/`) with
  `lesson.config.js` (source of truth for HOW: modules, stages, LP wiring), `moduleContext.js`,
  `index.jsx`, `routes.jsx`, `components/`, `modules/Module<NN><Descriptor>.jsx`.
- **A module sequence ≤ 90 minutes** following the canonical stage journey, ending in an
  always-unlocked evaluation, usually opened by a never-blocking prerequisite diagnostic.

The governing question for every feature: *does this make the system better at helping the right
student learn the right concept at the right moment?*

---

## 2. Pedagogical philosophy

Two progressions structure every lesson; both must be visible in the module sequence:

```
CONCRET → VISUEL → NUMÉRIQUE → SYMBOLIQUE → AUTOMATISATION
Discover → Manipulate → Understand → Formulate → Practice → Diagnose → Transfer → Master
```

And every important interaction follows the chain:

```
ACTION → TRANSFORMATION → OBSERVATION → DISCOVERY → FORMALIZATION → PRACTICE
```

**Core rule: never teach the symbol before the meaning when the concept can be discovered.**
The preferred shape is: real situation → manipulation → observation → prediction → explanation →
mathematical language → symbolic representation → practice → transfer. Formal vocabulary and
notation arrive only *after* the gesture that gives them meaning. Corollary (module sequencing):
do not explain in Module 1 what Module 3 exists to let the student discover — audit every
module's copy against its stage.

Before creating any module, answer in order: What does the student already know? What experience
should they have? What should they notice? What should they predict? What concept should emerge?
What language formalizes it? What practice is needed? What evidence proves understanding? Can they
transfer it?

The audience is Generation Alpha/Z collège students, touch-first, likely on phones, who disengage
instantly from "edtech worksheet" screens (read → MCQ → «Incorrect» loops). The experience must
feel active, visual, immediate, playful and purposeful — but **gamification reinforces learning,
never substitutes for it** (reward mastery, persistence, recovery from misconceptions; never
clicks or watch-time).

---

## 3. The design question that governs everything

> **Do not ask: "Where can I add a drag-and-drop?"
> Ask: "Which mathematical idea is difficult to understand, and what manipulation would let the
> student discover it by causing the screen to change?"**

See `INTERACTION_PEDAGOGY.md` §18 (interaction economy) and §23 (decision process) for the full
reasoning an agent must complete before writing any JSX.

> **Do not add interaction because interaction looks cool. Invent the interaction because it
> makes the mathematical idea easier to understand.**

The quality bar for every interactive element: *can the student manipulate the mathematical idea
itself?* If the interaction could be replaced by a static picture plus an MCQ without losing
understanding, it is decoration — redesign it.

**For every major concept, generate at least 3 candidate interactions** before choosing, and
evaluate each on: conceptual value, engagement, clarity, discoverability, implementation
complexity, mobile usability, accessibility, misconception coverage. Record the candidates and the
verdict in the lesson's design spec (§15). Do not default to drag-and-drop. The interaction
vocabulary is wide: move, rotate, resize, construct, draw, trace, measure, align, snap, fold,
split, merge, connect, reorder, compare, predict, estimate, simulate, experiment, debug,
reconstruct, reverse-engineer, manipulate parameters, satisfy constraints, discover patterns.

**Every lesson has exactly one signature interaction** — a memorable manipulation embodying the
lesson's central idea, defined with: name, purpose, concept, student action, visual behavior,
feedback, discovery, mastery challenge, and why it is memorable. It anchors the trigger or the
core manipulation module and returns in the boss's Synthèse.

Proven signature interactions (the precedent bank — reuse the *pattern*, not blindly the
component):

| Lesson | Signature | Idea it embodies |
|---|---|---|
| longueurs | `UnitSwitcher`/`ConservedSegment` — fixed distance, tap unit, number ×10s | conversion is re-description |
| masses | `Balance` equilibrium + `ConservedMass` | comparison by balancing; conservation |
| contenances | `ConservedCapacity` « La même eau » + pour/transvasement into one shared graduated tank | number changes, quantity doesn't; the shared referent |
| périmètres | `CircleUnroller` — roll the wheel, stamp 3 diameters + un petit reste | π ≈ 3,14 as the conclusion of an experiment |
| aires | `AreaGrid` row-painting 7, 14, 21, 28 + `ShapeComposer` recomposition | A = L × l made visible; same area, different shape |
| durées | `ClockFace` — one full minute-hand turn moves the hour hand | 1 h = 60 min constaté on the mechanism |
| angles | `Protractor` double graduation with the « 50° ou 130° ? » picker bubble | the classic wrong-scale error becomes the student's own decision |
| fractions | `PartitionShape` construction — fraction appears as conclusion of taking parts | fraction = equal-parts relation, not two numbers |

---

## 4. Mathematical model first — single source of truth

**Do not implement any interaction without a coherent mathematical state model.** Before modules
are designed, define:

- **Objects** the student manipulates (e.g. a quantity of liquid, an angle, a duration).
- **State**: one canonical scalar/structure per interaction, held in the most exact unit
  (integer mL for capacity, seconds for durations, degrees for angles, exponent tables for
  lengths/areas). Sexagesimal (durées) is the one non-decimal family — its helpers do **not**
  transfer from the decimal-unit lessons; keep separate `toSeconds`/`fromSeconds`/carry-60 logic.
- **Transformations**: the only allowed actions, each mapped to what it changes and what it
  proves.
- **Invariants**: what must remain true, and must be *visible* (conservation under transvasement,
  conservation under unit change, content ≤ capacity, angle independent of ray length…).
- **Derived values**: everything else (fill percentage, displayed number, comparison verdicts).
- **Representations**: concrete ↔ visual ↔ numerical ↔ symbolic, **all derived from the same
  state**. Never maintain independent mathematical states for different visualizations
  (`SVG state ≠ number-line state ≠ answer state` is forbidden). The only permitted
  desynchronization is *pedagogical delay* (e.g. the number updates only after the liquid
  settles), never divergence.

Each lesson gets a pure utils module (`components/<topic>Utils.js`): re-export
`formatDec, parseDec, roundTo` from `@smarter-academy/core`; a single `UNITS`/factor table;
`convert`/`factorBetween`/`format<X>`/`bestUnitFor` derived **only** from that table. **Never
hardcode unit factors or string-compare unit names** — the longueurs `'×1000'/'×10'` hardcode
produced the shipped "1 m = 10 cm" bug; every ladder/readout derives from `factorBetween`.
Document sign/orientation conventions in the file header when polar math is involved (clock =
clockwise-from-12; angles = counter-clockwise from the zero side) — copy-paste sign bugs between
such components are the top foreseen defect. Verify pure logic in isolation (a scratchpad script)
before building any UI on it.

Fixed mathematical decisions already made: π is the literal 3,14 in 6e, always displayed with ≈,
never solved for D or r; durée answers are integers in separate h/min fields (never decimal
hours — « 1 h 30 = 1,30 h » is a trap to teach against, not a format to accept); angles are
integer degrees on the protractor's tappable 10° grid.

---

## 5. Stages, learning points, and the validator contract

`npm run validate:lessons` enforces the lesson-shape contract. Design to pass it, never around it:

- **Stages** (`prerequisite_check → trigger → discovery → manipulation → formalization →
  practice_lab → evaluation`) must be non-decreasing across the `modules` array. `trigger`,
  `discovery`, `formalization`, `practice_lab`, `evaluation` are REQUIRED for an `available`
  lesson; `prerequisite_check` and `manipulation` are used when the mathematics calls for them
  (in practice: always include the module 0 diagnostic, and a manipulation stage whenever the
  lesson has a signature manipulation — every built lesson does).
- **Duration**: `sum(estimatedMin) ≤ 90` (hard cap); set the catalogue's `durationMinutes` equal
  to the module sum (established precedent — it supersedes any pasted value and kills the ±10
  warning).
- **Learning points**: ids derive from `pointsToLearn` array position —
  `{gradeId}_{lessonId}_P{n}` — and are **append-only once evidence is imported**. Reordering or
  replacing entries re-binds codes to new meanings while evidence rows keep referencing them; if a
  replacement is a recorded user decision, do the swap and re-import in one pass *before* new
  evidence exists, then run `php artisan smarter:validate-curriculum` and record the title-drift
  flags as reviewed/approved. Authored lesson ids carry no grade suffix (`durees`, not
  `durees-6e`) — author the `smaMetadata` entry before evidence import, because the id change
  changes every LP code.
- **LP wiring**: every LP must appear in some non-evaluation module's `teachesLearningPointIds`
  (**literal string arrays only** — the validator parses statically); evaluation modules declare
  none. `requiresLearningPointIds` is a sparing mastery gate on demonstrated gaps only.
- **Assessment metadata**: only `evaluation`-stage module files may contain
  `assessment: { enabled: true, type: 'assessment', learningPointIds: […] }` questions; ids are
  literal, unique within the lesson, and collectively the boss must cover **all** LPs. Never
  invent an LP id; never compute metadata.
- **No `_archive_original/` under `modules/` for new lessons** — the validator recurses into it
  and flags duplicate question ids (a major share of the repo's baseline errors). For rebuilds,
  remove any existing archive after user validation; git history is the archive.
- **Baseline discipline**: the repo carries pre-existing validator errors in other lessons. The
  success criterion for any lesson task is *zero NEW errors* (and ideally a lower total); never
  "fix" the baseline as a side effect without being asked.

---

## 6. Module architecture — micro-competences, not JSON mirroring

Do **not** map one module per `pointsToLearn` entry mechanically. Group LPs into coherent
micro-competences, then design one module per micro-competence. For each module define: id/slug,
title, objective, prerequisite knowledge, mathematical concept, likely misconception, discovery
mechanism, manipulation, explanation, guided practice, independent practice, transfer task,
mastery condition, and progression role. A module that is merely *explanation → question →
correction* is a design failure.

**Module responsibility** (CLAUDE.md §27): each module answers "what is this uniquely responsible
for teaching or measuring?" If two modules teach the same concept the same way, restructure. Never
duplicate explanations, definitions, examples or feedback across modules.

The proven 8-module shape for a ~75–85 min 6e lesson (a strong default, not a law — the
mathematics decides):

| # | Role | Stage | ~min |
|---|---|---|---|
| 0 | Mission de départ (diagnostic) | prerequisite_check | 4 |
| 1 | Trigger / conflict cognitif | trigger | 7–8 |
| 2–3 | Core discoveries | discovery | 8–10 each |
| 4 | Signature manipulation | manipulation | 10–11 |
| 5 | Formalization (« À retenir » built from the gestures) | formalization | 9–10 |
| 6 | Authentic problem workshop | practice_lab | 11–12 |
| 7 | 🏆 Boss | evaluation | 15 |

**Continuity — one coherent adventure, not isolated mini-apps.** Continuity is *narrative and
conceptual*, never runtime state shared across modules (deep links and the mastery-bypass path
must always work): a carried object reappearing everywhere (fractions' pizza, contenances'
litre-témoin), a scenario thread (the kermesse), vocabulary introduced exactly once and only
*used* afterwards, tools whose familiarity accumulates (the same protractor ritual re-tested),
and difficulty that builds on earlier modules' reflexes.

---

## 7. Interaction & guidance — the student never asks "what now?"

Hard requirement. Every interactive task specifies and *shows on screen*: **Goal** (one-line
mission), **Current action** (what to do right now), **Affordance** (how they know what's
touchable), **Expected consequence**, **Success condition**, **Next step**. The interface answers
What? Where? How? Why? What happened? What's next? — continuously. No blank playgrounds, no
unexplained tools, no hidden controls.

Guidance progression per manipulation: **SHOW** (one-shot affordance cue — a soft pulse ≤ 2
cycles on the primary target, disabled after first tap and under reduced motion) → **TRY** (a
guided first task, often with a single enabled action so the gesture cannot be missed) →
**EXPLORE** (constraints relax) → **CHALLENGE** (independent) → **TRANSFER** (same concept, new
context). Guide with visual cues, ghost actions, highlighted targets, snapping and progressive
hints — never with instruction paragraphs. Step instructions are ≤ 2 short sentences.

**Micro-missions**: phrase every step as a short mission in the imperative (« Construis… »,
« Trouve… », « Fais apparaître… », « Répare… », « Prédis… »). Each has a clear objective, a
visible starting state, one obvious interaction, a success condition, feedback, progression.

**Aha moments**: every major module names its aha — "what should suddenly become obvious?" — and
the interaction is engineered to produce it (rotate until 90° appears; pour and watch the taller
container lose; roll the circle and count 3 diameters and a leftover). The experience creates
understanding *before* formalization.

**Every important interaction documents the chain** ACTION (what the student does) →
TRANSFORMATION (what changes visually) → MATHEMATICAL MEANING (what the change represents) →
FEEDBACK (how the consequence is communicated) → GENERALIZATION (the rule to extract). If an
interaction cannot fill this chain, redesign it.

**Variety and pacing**: mix discovery, manipulation, construction, prediction, comparison,
estimation, debugging, guided practice, challenge, transfer. Not every module a quiz; not every
interaction a drag; not every activity timed (the boss's single timer is the only timer). Plan
interaction-intensity peaks deliberately (heavy manipulation modules alternating with lighter
sorting/ordering ones; the boss is calm and summative). Avoid screen overload: one primary
interactive per step.

---

## 8. Feedback, mistakes, and misconceptions

**Consequence-based feedback, never bare verdicts.** The pattern is: mistake → *visible
consequence* → reflection → smallest useful hint → correction. Express a swimming pool in mL and
the absurd number itself is the feedback; pick the wrong protractor scale and the reveal explains
which graduation the zero-side selects. Never a lone « ❌ Incorrect. »

**Misconceptions are first-class design inputs.** For each lesson, catalogue them up front (with
detection, consequence, hint, recovery) and encode them as: trigger conflicts (height-illusion,
"4 morceaux ≠ 4 parts égales"), MCQ distractors (direction errors, magnitude errors,
same-number-wrong-unit), and `NumericQuestion.explainFor(n)` targeted responses to known trap
values (1,5 vs 15 vs 1 500; 4 vs 0,4 vs 400). A wrong answer is not automatically a misconception
— distractors must encode *real* ones.

**The formative policy (content modules — kit-enforced, non-negotiable):**

- The correct answer is **revealed on answer**, stating the student's answer, the correct answer,
  and the rule — and `onSolved` fires **unconditionally**. Never gate progression on correctness:
  no « Réessayer » loops, no `if (correct) onSolved()`. Batch checks reveal the correct option in
  **every** row, not just color wrong picks red.
- **One tap = one answer**: single-choice questions answer on tap (no Valider); fixed-size batch
  checks reveal on the last pick; free inputs keep one OK button but always wire Enter;
  unknown-size selections and orderings keep one commit button; manipulations auto-complete on
  goal-reach via effect (no "continuer" click).
- **Manipulations complete on the real goal, and never strand the student.** The masses
  equilibrium lockout is the canonical bug: firing `onSolved` on mere placement froze the student
  in a wrong arrangement with hints disabled. Rules: complete on the actual success condition;
  keep controls live and the wrong state visible during feedback; quantify the gap in the hint;
  provide an escape hatch after ~2–3 attempts (« Je ne trouve pas — montre-moi ») that reveals
  and completes with honest copy (« Pas grave, on te le montre »). Deduction puzzles may gate on
  success **only** up to a fixed attempt cap, then force-reveal and complete.
- **Never gate wrong-answer feedback on `!solved`** — `solved` flips true on the next render;
  use internal `checked && !isRight` instead.
- **Audit shared components' gating defaults**: `OrderingGame` and `InfoSorter` block on success
  by default (correct for boss contexts); content modules must pass their `formative` opt-in
  (`InfoSorter` also takes `onCheck={kit.react}`). A bare `onSolved={…}` wiring is not
  automatically compliant.

Let students experiment safely: preserve their attempt on screen, visualize what went wrong,
allow retry within the caps, explain after they have had a chance to reason.

---

## 9. The lesson kit — the mandatory build surface

All new modules are written on `apps/web/src/lessons/common/kit/` (exports exactly:
`ContentModule`, `useKit`, `TapQuestion`, `BatchChoiceQuestion`, `NumericQuestion`, `BossFinal`,
`PrerequisiteDiagnostic`). A kit module cannot violate the formative policy, the silent boss, the
step-locking rules, or tap-target minimums — it supplies content only.

- **`ContentModule`**: `ctx={MODULE_CTX}`, `navLinks`, `moduleNumber`, titles, `estimatedTime`,
  `brief` (mission card), optional `intro`/`footer`, and `steps[]` each with `num`, `title`,
  `done` (module-owned boolean), `content` — a ReactNode **or** `(kit) => ReactNode` where
  `kit = { react, alreadyCompleted, effectsEnabled }`. It wires `useProgress`, step locking
  (`isStepLocked(alreadyCompleted, …)` — sequential on first pass, all-open on revisit),
  `incompleteSteps` (the "what's left" popover on the disabled next button), the
  micro-celebration toolkit (`useModuleEffects`, `EffectsToggle`, `StreakChip`, `XPBurst`,
  `StepProgressBar`), and completion. **No auto-scroll, no auto-advance** — ever.
- **Question components**: `TapQuestion` (single MCQ; `above` accepts a node or
  `(revealed) => node`; `correctionLabel` when the option isn't printable), `BatchChoiceQuestion`
  (N rows, one reveal at the last pick), `NumericQuestion` (typed number; `expected` value or
  predicate; `explainFor(n)` for traps). **Whenever a non-integer answer is possible, pass
  `parse={parseDec}` and `display={formatDec(expected)}`** — the default integer `parseFr`
  silently truncates (the shipped "350 cm = 3 m" / "45 mm = 4 cm" bugs). Decimal-heavy lessons
  apply this to *every* numeric question preemptively.
- **`PrerequisiteDiagnostic`** (Module 0, `number: 0`, `stage: 'prerequisite_check'`,
  `style: 'diagnostic'`, ~4 min): 5 closed-choice questions × 2 pts testing the **declared
  prerequisites only** — never the lesson's own material. Silent until one submit, score tiers
  < 5 / 5–7 / > 7 (never pass/fail), `nextLink` unconditional, no `assessment.enabled` anywhere,
  local-only persistence (`usePrerequisiteDiagnostic`). It never gates anything.
- **`BossFinal`** (last module, `stage: 'evaluation'`, `style: 'assessment'`, ~15 min): **QCM
  only** (numeric tasks become choices whose distractors are the classic mistakes), **silent
  until one global submit**, then Boss review → Mon profil → Synthèse. Data conventions from the
  built lessons: 10 épreuves with per-lesson-prefixed literal ids (`pe-e1…`, `ct-e1…`), each with
  `skill` (mapped to the module that teaches it, powering « Revoir le module N ») and full
  `assessment` metadata covering all LPs; a `registre` of 4 context chips; per-skill zero-miss 🏅
  badges plus one 💎 perfect badge; a bespoke `Synthese` that **reuses the lesson's own
  manipulative** as a frozen visual recap; `timerSeconds: 600`, `xpPerCorrect: 10`; static
  `extra` nodes allowed per épreuve. Persistence via `useFinalTestAttempt` (saved attempt
  short-circuits to review; « Refaire le test » resets). **No phase after Synthèse** re-gating
  completion. Épreuves are authored *last*, so distractors mirror the traps actually taught.
- **Bespoke manipulations** (the lesson's own components) follow the same contract: props
  `solved`/`onSolved` (+ `react` from the slot function), unconditional completion at the goal,
  `react(isCorrect)` at the same call site, controlled state owned by the module. Prefer
  extending the shared labs (`MeasureFillMission`, `OrderingGame`, `InfoSorter`, `GroupBuilder`,
  `NumberLine`) over inventing a counter-with-buttons.

---

## 10. Manipulation component engineering rules (bug-class checklist)

Every one of these is a documented, shipped-and-fixed defect class. Violating them is a review
blocker:

1. **Tap-first, drag-optional.** Every drag has a tap and/or keyboard path (±buttons, arrows,
   Home/End). No hover-only mechanics.
2. **The NumberLine drag pattern** is the only sanctioned drag recipe: pointer handlers on the
   `<svg>` root (painted children swallow pointerdown), value from
   `getBoundingClientRect()` ratio → viewBox, `setPointerCapture` in try/catch, conditional
   `touchAction`, snap to the semantic step, keyboard alternative.
3. **`pointerEvents: 'none'` on every decorative SVG sibling of a hit area** (tick lines,
   labels, protractor body, angle rays) — decorative elements painted after hit rects intercept
   taps.
4. **ARIA layering**: interactive wrapper `role="group"`; `role="img"` only on purely visual
   SVG — never on an element containing real `<button>`s (it hides them from AT). Hit shapes get
   `role="button"`, `tabIndex`, French `aria-label`s, Enter/Space handlers.
5. **Density caps**: ≤ ~52 interactive/animated nodes per manipulation. Big grids (the 10×10
   dm²-in-cm² overlay) are static SVG lines; large magnitudes render as capped representative
   tiles plus a « ×N » badge — never 1000 nodes.
6. **Reachability**: every target value must sit on the interaction's tappable grid (65° is
   unreachable on a 10°-tick protractor — choose 60°).
6b. **Layout safety over the whole range, not the worst point you thought of.** No mathematical
   element (number, label, symbol, line, mark) may overlap another or leave its frame in ANY state
   the student can reach. Derive placement from the content — bounding boxes, anchor points,
   outward offsets from a computed centre, a viewBox fitted to the drawing *plus* its labels —
   never a fixed pixel offset that happens to work at the default value. Assert it: sweep the
   control in the e2e suite (`svgOverflow` / `textCollisions`), or, when the placement is pure
   geometry, unit-test the full grid of reachable states. `SolidTurner`'s fixed label offset was
   correct at the default angle and collided at 16 orientations out of 468 — a screenshot could
   not have caught it. See INTERACTION_PEDAGOGY §17.
7. **Controlled components, module-owned state**; factors and conversions from the utils table
   only.
8. **framer-motion + SVG**: `animate={{ x, y }}` on an SVG `<g>` maps to nonexistent attributes —
   use a CSS `transform` instead. Give pieces a full-area transparent hit rect.
9. **`AnimatePresence` children carry their key on a `motion.*` element** — a plain keyed `<div>`
   mis-reconciles on removal and silently breaks the interaction.
10. **Never call `react`/`onSolved` (or any side effect) inside a state updater** — compute the
    next state outside, then act (React setState-in-render warnings were real).
11. **Settle-then-number**: numeric readouts update only after the physical animation completes.
12. **`useReducedMotion`** shortens or disables every meaningful animation without changing the
    logic; component-scoped `<style>` blocks include the `prefers-reduced-motion` media query.

---

## 11. Mobile & touch-first UX

Phones are the primary device; 375 × 667 with `hasTouch` is the tested baseline.

- Tap targets ≥ 44 px (e2e asserts ≥ 40 px); widened invisible hit rects over small visuals.
- `touchAction: 'manipulation'` on interactive SVGs (kills double-tap zoom); `touch-none` only
  while an actual drag is armed.
- Single-column layouts; interactive SVGs on width-capped responsive viewBoxes; unit-chip rows
  wrap with `flex-1`.
- **No horizontal page scroll, ever** — wide strips scroll inside their own `overflow-x-auto`
  container.
- No mouse-hover assumptions; pointer events throughout; portrait assumed, landscape just widens.

## 12. Accessibility

Keyboard operability on all interactive elements (Enter/Space activation, arrow-key movement for
draggables); visible focus (`focus-visible:ring` house classes); French `aria-label`s that state
the *reading* (« Cuve graduée, 6 dL sur 10 »); color never the sole carrier (text + icons on all
ok/ko states, labeled chips); every visual consequence mirrored in text; reduced-motion support
everywhere; readable instruction text. Every visual-only mechanic gets an alternative
(drag → tap controls, rotation → increment buttons, animation → the same state change,
shortened).

## 13. Visual & animation language

Use the house system (LessonIndex `COLOR_MAP` colors, kit cards, `Feedback` tones) — never invent
an unrelated design system. Consistent state semantics: tappable = white card with 2 px border
tinting on hover/active; selected = filled module color; locked = dashed placeholder; target =
amber dashed outline; correct/incorrect = emerald/rose `Feedback` with text; hint = sky `info`;
completed = emerald + ✓. Standard palette assignments: teal for module 0, amber for the boss.

**Every animation must answer: "what mathematical relationship does this explain?"** Legitimate
purposes: transformation, causality, movement, comparison, construction, progression, feedback
(pour stream → rising level; odometer roll on a unit change; `pathLength` draw-on for a traced
contour or hop arc; a stamped diameter ribbon). Decorative animation is removed. Keep meaningful
animations ≤ ~600 ms, reduced-motion aware; the kit's XP burst is the only celebration effect.

---

## 14. Reference lessons: reference ≠ template

Fractions (6e) is the pedagogical reference — it proves the architecture (manipulation,
synchronized representations, misconception-driven design, kit modules, evidence, boss). The
grandeurs family (longueurs → masses → contenances → périmètres/aires/durées/angles) is the
structural reference for the 8-module shape and the component engineering rules.

**For every new lesson, produce an explicit four-way analysis before designing:**

- **REUSE** — infrastructure and patterns as-is: the kit, the formative components with their
  opt-ins, the conflict-cognitif trigger pattern, reveal-as-conclusion (the symbol appears only
  after the gesture), the `components/learningPoints.js` convention (literal LP mirror +
  `recommendedSlug` per LP for the boss profile), the e2e conventions, proven lesson-local
  components when the same mathematics applies (`LiquidContainer`, `MeasureFillMission`).
- **ADAPT** — patterns that transfer with change: the carried-object narrative, ladder/switcher
  components re-derived for a new unit table, a copied-and-extended component when the source
  lesson must stay untouched (périmètres duplicated longueurs' `PolygonPerimeter` rather than
  editing it).
- **REPLACE** — patterns mathematically wrong for this lesson: partition semantics for a
  continuous magnitude; decimal conversion helpers for sexagesimal time. *Same Smarter Academy
  experience, different mathematical learning architecture* — the engine emerges from the
  concepts.
- **DO NOT COPY** — known defects of the reference: over-cap durations, `_archive_original`
  validator noise, `totalModules` literals, hardcoded factors, any blocking loop. **Never assume
  existing code is correct because it exists** — audit before reusing, and never propagate a
  reference lesson's bugs into a new one.

Also: do not rewrite working modules just for style; preserve valuable existing behavior unless
there is a concrete reason (CLAUDE.md §61).

---

## 15. The AI agent workflow: JSON → analysis → spec → implementation → integration → testing

### 15.1 Read before designing

Non-negotiable pre-flight: read `docs/architecture/` (ARCHITECTURE, LESSON_CONTRACT,
EXERCISE_CONTRACT, PROGRESS_MODEL, LEARNING_ARCHITECTURE, AI_LESSON_CONTRACT,
LESSON_INTEGRATION_GUIDE, CLAUDE.md), the reference lessons, the kit and shared components, the
validator, `coursesData.js` and the official ministry JSON, and the **current state of the target
lesson** (it may already exist as a stub, an auto-derived `coming_soon` card, or a partially
built lesson mid-rework). Distinguish pre-existing uncommitted work from your own before touching
anything; record the validator error baseline. Check for id collisions across grades. Where a
lesson carries dormant metadata (old `EVAL_*`/assessment blocks), treat it as the source of truth
for LP tagging rather than re-inventing mappings.

### 15.2 Think in this order (never start with JSX)

What must the student understand? → What makes it difficult? → What misconception is likely? →
What can the student manipulate that makes the idea visible? → How does the interface guide
without taking the thinking away? → What should they discover? → How does the discovery become
formal mathematics? → *only then* the technical architecture.

### 15.3 Produce the design spec before code

For a from-scratch or rebuilt lesson, write the lesson's Markdown design contract first
(`docs/lessons/<GRADE>_<LESSON>_SPEC.md`; worked example: `6E_CONTENANCES_SPEC.md`), with this
structure: Lesson Identity · Curriculum Contract · Pedagogical Vision · Target Student &
Cognitive Challenges · Mathematical Model · Invariants · Representation Model · Global Journey ·
Module Architecture (per-module) · Interaction Design (candidates + verdicts) · Signature
Interaction · Aha Moments · Guidance System · Error & Misconception Strategy · Micro-Missions ·
Representation Sync · Progress & Mastery · Component Architecture · Mathematical Engine ·
Validation Rules · Accessibility · Mobile UX · Visual & Animation Language · Navigation &
Continuity · Technical Integration · File/Folder Plan · Testing Strategy · Student Walkthrough
QA · Anti-Patterns · Implementation Order · Definition of Done · Acceptance Criteria. The spec is
the contract: deviations during implementation require updating the spec first. Genuine scope
choices (an extra LP, skipping a lesson, replacing an LP list) are the **user's** decisions —
surface them as explicit options; record the answers in the spec.

### 15.4 Implementation order (dependencies matter)

1. Catalogue entry (`status: 'coming_soon'`) — everything downstream reads LP ids from it.
2. Utils module + isolated verification of the pure math.
3. `lesson.config.js` + `learningPoints.js` + `moduleContext.js` + `routes.jsx` skeleton.
4. **Signature interaction** and its module — highest risk first; validate density caps and
   reduced motion here.
5. Core discovery modules (trigger + discoveries).
6. Guided practice / formalization modules.
7. Transfer / practice_lab module.
8. Module 0 diagnostic, then the **boss last** (its distractors mirror the actually-taught
   traps).
9. Integration verification (locking, revisit, stale-attempt edge cases, archive removal).
10. Accessibility + responsive pass.
11. Testing (§16).
12. Flip `status: 'available'` → re-run the validator (LP-coverage enforcement activates at that
    moment) → curriculum export/import/`smarter:validate-curriculum` with any drift review.
13. Final audit: walkthrough QA, Definition of Done, scope check.

**Build one lesson fully — through its e2e suite and status flip — before starting the next.**

### 15.5 Integration surface (per lesson, complete)

- **Catalogue**: one `smaMetadata` entry in `packages/core/curriculum/coursesData.js` (chapter
  placement is automatic from the official JSON's domain; the route path auto-derives). Core
  tests are invariant-based (unique codes/paths) — new entries pass if ids are globally unique.
- **Lesson directory**: `lesson.config.js` (id matches the catalogue; `sequentialUnlock: true`;
  LP header comment with the literal ids; **no `totalModules`**), `moduleContext.js` (the
  canonical 20-line form — `totalModules: modules.length` and, whenever a module 0 exists,
  `lastModuleNumber`, or the final module's Terminer button breaks; `levelLabel`/`gradeLabel`
  are per-lesson literals), `index.jsx` (thin `LessonIndex` wrapper), `routes.jsx`
  (`MODULE_COMPONENTS` keyed by module `number`, including `0`).
- **`App.jsx`**: one import + one `{xRoutes()}` spread per **new** lesson (nothing for a rebuild
  of an existing one). The registry auto-discovers configs via `import.meta.glob` — no registry
  edit.
- **Locking**: module-to-module via `lessonAccess.js` (`n <= 1` always unlocked — module 0 never
  gates module 1; `evaluation` always unlocked; a completed module never re-locks). Step-to-step
  is kit-internal. Never special-case the shared threshold for one lesson.
- **Persistence** (all via `scopedStorage`, `u_{userId|anon}_` prefixed; anonymous visitors get
  full local persistence): `smarter_lesson_{id}` (completion/XP, server-synced via
  `progressQueue`), evidence (fire-and-forget queue, auth-only), `smarter_final_test_{id}`
  (boss attempt), `smarter_prereq_diagnostic_{id}` (local-only by design). The lesson `id` is the
  key everything hangs off — **preserve it on rebuilds** (progress continuity), and QA the
  stale-final-test-attempt case when the boss's question set changes. Copy the hydration-guard
  idiom for any new persisted state; never invent a new pattern.
- **Practice ≠ assessment**: evidence flows only from the boss's tagged épreuves via the
  kit-internal `useEvidenceSubmission`; content-module and diagnostic questions never touch
  mastery. Completion ≠ mastery — never conflate them lesson-side; the boss profile computes
  only per-skill miss counts for module recommendations.

---

## 16. Verification & Definition of Done

A lesson is not done because it renders, has all modules, has questions, or builds. The gate
chain, in order:

1. **Syntax/build**: `npx esbuild <file> --loader:.jsx=jsx` per new file; `npm run build`.
2. **Validator**: `npm run validate:lessons` → the lesson reports full LP coverage
   (`N/N learning points covered`) and zero errors; the repo total shows **zero new errors** vs
   the recorded baseline.
3. **Core tests**: `npm run test --workspace=packages/core` (catalogue invariants) green; plus
   unit tests for the lesson's pure utils (conversion round-trips, conservation arithmetic, a
   regression guard that displayed ladder factors equal `factorBetween` outputs).
4. **E2E Playwright smoke suite** (`apps/web/e2e/lesson-kit/<x>-<lesson>.mjs`, house
   conventions): start vite **from `apps/web/`** and curl-verify 200 before driving (repo-root
   vite serves 404s); seed `u_anon_smarter_lesson_{id}` `completedModules` to reach locked
   modules (pass explicit args to `addInitScript` — closures don't serialize); `domcontentloaded`
   + ~1200 ms settles (`networkidle` times out); **anchored regexes** for unit chips
   (`hasText: 'm'` substring-matches `km`/`mm`); transparent SVG hit areas asserted by
   `.count()` and clicked with `{ force: true }` (`isVisible()` is false for
   `fill="transparent"`); scope locators (`.last()`) when a page shows several instances of the
   same widget. The suite must cover: index + non-blocking diagnostic; each flagship
   manipulation; **wrong-on-purpose paths that still progress with the correction visible**;
   decimal reveals (1,5 — not 1); the boss silent-until-submit → score → profil → synthèse →
   Terminer, reload-shows-review, redo; a mobile pass (375×667, `hasTouch`, `.tap()`, no
   horizontal scroll, targets ≥ 40 px); **zero console/page errors** across the run (standard
   noise filter only).
5. **Visual review**: screenshot each flagship manipulation state and *look at it* (mid-roll,
   picker bubble open, capped tiles at the smallest unit…).
6. **Student walkthrough QA** (a gate, not advice): for every interactive module, as a first-time
   student — *Would I immediately know what to do? After doing it, would I understand why
   something changed? Would I know what to do next?* Any NO → redesign before shipping.
7. **Status flip + curriculum sync**: `available` → re-validate → export/import →
   `smarter:validate-curriculum` with drift review recorded.
8. **Scope check**: `git status` confined to the lesson directory, `coursesData.js`, `App.jsx`
   (new lessons only), the spec, and the e2e file — sibling lessons untouched.

**Definition of Done** (all must hold): every JSON LP taught and assessed; every important
concept has a meaningful manipulation; the student always knows what to do; rules are discovered
where pedagogically appropriate; actions produce mathematical consequences; modules form one
coherent journey; the lesson is fully integrated (routes, catalogue, registry, progress,
unlocking, evidence); the experience is attractive without distraction; important interactions
have usable alternatives; touch devices work well; no runtime errors, broken states, dead
controls or unexplained interactions remain.

---

## 16b. Scope: change the manipulation you were asked to change

A defect in the manipulation under construction is in scope. The same defect spotted in another
manipulation, lesson, or module is **not** — note it in the final report and leave it alone. Do not
refactor, redesign, or "improve" neighbouring manipulations, duplicated code, or older patterns
uninvited, however tempting.

A shared component may be modified only when the current manipulation genuinely cannot be fixed
without it. Then: keep the change minimal, add behaviour behind a default that preserves every
existing caller, verify the current manipulation, and report the shared-component edit explicitly.

---

## 17. Anti-patterns — never do these

**Pedagogy/UX (general):** fake interactivity; unnecessary drag-and-drop; decorative animation;
excessive text and giant instruction paragraphs; unexplained tools; blank playgrounds; hidden
controls; hover-only mechanics; repetitive MCQ rhythm; arbitrary gamification and excessive
timers; interaction without mathematical meaning; pixel-perfect validation where semantic
(state-based) validation exists; duplicated components and explanations; isolated mini-apps;
disconnected module states; teaching the symbol before the meaning; explaining early what a later
module exists to discover; auto-scroll and auto-advance.

**Codebase (each is a shipped, documented bug class):** blocking progression on correctness or
freezing a wrong manipulation state (masses lockout); uncapped retry loops (deduction puzzles cap
then reveal); integer `parseFr` where decimals are possible; hardcoded unit factors or
string-compared unit names; decorative SVG over hit areas without `pointerEvents:'none'`;
`role="img"` hiding real buttons; > ~52 interactive nodes / fully interactive large grids; target
values off the tappable grid; overlapping label rings; plain keyed `<div>` children of
`AnimatePresence`; side effects inside state updaters; framer-motion `animate={{x,y}}` on SVG
`<g>`; wrong-answer feedback gated on `!solved`; `totalModules` literals; `_archive_original/`
under `modules/`; invented or computed LP ids and assessment metadata; evidence-generating
questions outside evaluation modules; a diagnostic that gates or persists; a boss with free-text
input, per-question feedback before submit, or a post-Synthèse gate; new global CSS or design
systems; new dependencies without justification; forking a shared component instead of extending
it behind optional props; patching the shared unlock threshold for one lesson; rewriting working
modules for style; "fixing" the pre-existing validator baseline uninvited; and trusting that the
reference lesson's code is correct because it exists.

---

*Workflow in one line: read the contracts and the current state → analyze the mathematics,
misconceptions and manipulations → write the spec (user decides scope questions) → implement in
dependency order on the kit → verify through the full gate chain → flip to available → prove the
scope was surgical.*
