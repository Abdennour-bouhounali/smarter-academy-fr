# 6e — Algorithmique et programmation — Design & Implementation Spec

> Design contract for the lesson, written before code per LESSON_DESIGN_PLAYBOOK.md §15.3.
> Deviations during implementation require updating this spec first.

---

## 1. Lesson identity

| Field | Value |
|---|---|
| Catalogue key | `6e_algorithmique_programmation` |
| Lesson id | `algorithmique-programmation` (no grade suffix — authored id) |
| Official object | `algorithmique_programmation` (JSON `levels.6e.domains[algorithmique]`) |
| Domain / chapter | `algorithmique` — « Initiation à la pensée informatique » |
| Route base | `/courses/college/6e/algorithmique/algorithmique-programmation` |
| Icon | 🤖 · difficulty `Moyen` · tier `free` |
| LP codes | `6e_algorithmique-programmation_P1` … `_P12` |

**Catalogue duration**: set to the module sum (playbook §5 precedent), **86 min** — not the
pasted 80. This kills the ±10 warning and respects the 90-min cap.

### Official teaching scope (ministry JSON — binding)

- **include**: « Déplacements, séquences d'instructions », « Boucles simples (répéter) »
- **exclude**: « Variables, conditions complexes »

⇒ **No variables, no `si…alors`, no conditions, no nested loops of loops.** The instruction set is
closed at: `AVANCER`, `TOURNER_GAUCHE`, `TOURNER_DROITE`, `RAMASSER`, and one non-nested
`RÉPÉTER n` block. This is a hard boundary, not a stylistic choice.

### The 12 Learning Points (order is append-only — LP ids derive from position)

| LP | Title |
|---|---|
| P1 | Comprendre qu'un algorithme décrit une suite d'instructions permettant de résoudre un problème |
| P2 | Identifier une instruction et comprendre son effet |
| P3 | Décomposer un problème en étapes simples |
| P4 | Construire une séquence d'instructions |
| P5 | Exécuter mentalement ou visuellement un algorithme |
| P6 | Comprendre l'ordre des instructions |
| P7 | Utiliser des répétitions simples pour éviter de reproduire plusieurs fois la même instruction |
| P8 | Modifier un programme pour obtenir le résultat attendu |
| P9 | Repérer une erreur dans une séquence d'instructions |
| P10 | Corriger un programme qui ne produit pas le résultat attendu |
| P11 | Tester un programme et observer son comportement |
| P12 | Traduire une stratégie de résolution en programme simple |

Declared prerequisites (catalogue): **Nombres entiers**, **Repérage dans le plan**. The module 0
diagnostic tests *only* these — never the lesson's own material.

---

## 2. Pedagogical vision

The lesson is a **programming laboratory**, not a course about programming. The student never
reads a definition of "algorithme" before having *needed* one. The governing loop, present in
every module:

```
BUILD → RUN → OBSERVE → MODIFY → RUN AGAIN
```

Progression across the lesson:

```
GOAL → ACTION → SEQUENCE → EXECUTION → ORDER → REPETITION → ERROR → DEBUGGING → CHALLENGE
```

The student moves from « je fais bouger le robot » → « je décris une stratégie en instructions
précises » → « je construis, teste et corrige un programme ».

### The central discovery: `objectif ≠ programme`

A 6e student believes stating the goal *is* the instruction. The robot is the device that refuses
intention and accepts only instructions. Everything else in the lesson follows from this gap.

---

## 3. Target student & cognitive challenges

| Difficulty | Why it is hard at 11–12 | Where the design attacks it |
|---|---|---|
| Intention ≠ instruction | The child narrates a goal (« va au drapeau ») and expects it to work | M1 — the "intention button" visibly fails, only instruction taps move the robot |
| Egocentric vs robot frame | The student turns *their own* head, not the robot's | M3 — `TOURNER` is **relative to the robot's heading**, shown by an on-robot direction cone |
| Order is not a detail | A set of instructions ≠ a sequence | M4 — same multiset, two orders, two landing cells, side by side |
| Sequential execution | Believing everything happens at once | Step-by-step runner with the current instruction highlighted |
| Repetition as structure | Seeing `RÉPÉTER 5` as "5 written once", not "AVANCER five times" | M5 — the loop visibly *unrolls* into the 5 steps it replaces |
| Debugging = guessing | Randomly changing things until it works | M6/M7 — the trace shows *where* the run diverged; hypothesis before fix |

---

## 4. Mathematical / computational model (single source of truth)

Pure module: `components/algoUtils.js`. **No component recomputes any of this.**

### 4.1 Objects & canonical state

```
Robot state:  { col, row, heading }
  col, row : non-negative integers (grid node indices) — first quadrant only,
             matching the 6e repérage scope (no negative coordinates)
  heading  : 0 | 1 | 2 | 3   ← the canonical scalar
```

`heading` is an **index into `DIRECTIONS`**, not a string, so turning is modular arithmetic:

```
DIRECTIONS = [N, E, S, W]      (clockwise order — this order IS the convention)
TOURNER_DROITE : heading → (heading + 1) mod 4
TOURNER_GAUCHE : heading → (heading + 3) mod 4      (+3 ≡ −1 mod 4, no negatives)
AVANCER        : {col,row} → {col,row} + DELTA[heading]
```

**Orientation convention (documented once, obeyed everywhere):** `row` increases **upward** for
the student; SVG `y` increases downward. The inversion lives in exactly one function,
`gridToSvg`, mirroring the `reperage-plan` convention. `DELTA[N] = {col:0, row:+1}`.

### 4.2 The program (the second canonical structure)

A program is a **flat array of instruction nodes**, at most one level of nesting:

```
Instruction := { kind: 'AVANCER' | 'GAUCHE' | 'DROITE' | 'RAMASSER' }
             | { kind: 'REPETER', times: n, body: [Instruction] }   // body has NO REPETER
```

The no-nesting rule is enforced by `algoUtils` (`canNest === false`) — it is the curriculum's
"boucles simples" boundary made structural, not a matter of discipline.

### 4.3 Transformations (the only allowed actions)

| Action | Changes | Proves |
|---|---|---|
| add instruction | program grows | a program is *built*, instruction by instruction |
| remove instruction | program shrinks | programs are editable |
| reorder (move ↑/↓) | order changes, multiset does not | **order is meaning** (M4) |
| replace instruction | one slot changes | targeted correction, not rewriting (M6) |
| set `times` on RÉPÉTER | n changes | the loop is a *quantity* of repetitions |
| run / step / reset | robot state advances | execution is sequential and re-runnable |

### 4.4 Execution model — the trace is the core derived value

```
runProgram(start, program, world) → {
  trace: [{ pos:{col,row,heading}, instrIndex, iteration, event }],  // one frame per executed step
  final: {col,row,heading},
  collected: [cellIds],
  blocked: boolean,          // hit a wall/obstacle/edge
  blockedAt: index | null,
}
```

- `flatten(program)` unrolls `RÉPÉTER` into the executed step list — **this function IS the
  pedagogy of M5**: the loop and its unrolled form produce an identical trace.
- Collision: a step into an obstacle or off-grid does **not** move the robot; it sets `blocked`
  and stops. The robot stays visibly stuck against the wall — consequence-based feedback.
- Execution is **pure**: no React state inside. The UI replays `trace` frame by frame.

### 4.5 Invariants (must remain true and be *visible*)

1. `runProgram` is deterministic — the same program always yields the same trace. (Makes
   prediction meaningful; makes debugging a matter of reasoning, not luck.)
2. A `RÉPÉTER n [body]` and its unrolled `n × body` produce **identical traces** — verified by a
   unit test. This is the mathematical content of P7.
3. The robot never leaves the grid and never enters an obstacle.
4. The program is never mutated by execution — running is repeatable and non-destructive
   (« le robot ne se casse pas »): reset always returns to the exact start state.
5. `col, row ≥ 0` always (6e scope: no negative coordinates).

### 4.6 Derived values (never stored)

Robot pixel position, direction cone rotation, the flattened step list, step count, landing cell,
success verdict, the divergence index between expected and actual trace, the `×N` loop badge.

### 4.7 Representations, all derived from the same state

```
        program (array)  ──flatten──▶  step list  ──runProgram──▶  trace
              │                             │                        │
        instruction blocks            « 5 pas »                  robot on grid
        (what I wrote)              (what it costs)            (what happens)
```

Only permitted desynchronization is *pedagogical delay*: the verdict text appears after the robot
finishes its animation (settle-then-number, playbook §10.11).

---

## 5. Signature interaction

### 🤖 **`ProgramLab` — « Écris, lance, regarde, corrige »**

| Facet | Definition |
|---|---|
| **Name** | ProgramLab (the robot workbench: grid + program strip + transport controls) |
| **Purpose** | Make the causal link *instruction → behaviour* physically visible |
| **Concept** | A program is an ordered sequence of instructions executed one by one |
| **Student action** | Taps instruction blocks to build a program; presses ▶ Exécuter; watches; edits; re-runs |
| **Visual behaviour** | The robot moves cell by cell / rotates in place; **the instruction currently executing is highlighted in the strip** — the correspondence is shown, not asserted |
| **Feedback** | Success = robot on target + trail drawn. Failure = robot stops *where it actually went* (against a wall, or on the wrong cell), with the gap named |
| **Discovery** | The robot obeys the program, not the intention |
| **Mastery challenge** | M8 — build a correct program for a constrained world, multiple solutions accepted |
| **Why memorable** | The student *causes* a machine to act and sees their own mistake replay itself |

Returns in the boss's Synthèse as a frozen recap (a program next to its trace).

**Interaction candidates considered** (playbook §3 requires ≥ 3 per major concept):

| Concept | Candidates | Verdict |
|---|---|---|
| Sequence | (a) type text commands · (b) drag blocks into a slot list · (c) **tap blocks to append, ±/↑↓ to edit** | **(c)** — typing is excluded by the brief (syntax ≠ logic); pure drag fails tap-first §10.1. Tap-to-append with tap-to-reorder is fully keyboard/touch operable. |
| Order matters | (a) MCQ "which order is right?" · (b) **two programs, same blocks, run side by side** · (c) shuffle animation | **(b)** — the student *builds* the second from the first and sees two different landings. An MCQ would let them guess. |
| Repetition | (a) show the loop syntax then practise · (b) **build the long version, then compress it and verify identical trace** · (c) count repetitions in a given program | **(b)** — the loop arrives as the *solution to the student's own tedium*, per "let the student experience the problem first". |
| Debugging | (a) highlight the faulty instruction in red · (b) **run, observe divergence, inspect, hypothesise, fix, re-run** · (c) MCQ "which line is wrong?" | **(b)** — the brief explicitly forbids "find the red instruction". |

---

## 6. Aha moments (one per major module)

| Module | The aha |
|---|---|
| M1 | « Le robot ne comprend pas ce que je veux — seulement ce que je lui dis. » |
| M2 | « Chaque bloc fait *exactement* une chose, et je peux la voir. » |
| M3 | « TOURNER ne fait pas avancer : ça change la direction du robot, pas sa case. » |
| M4 | « Les mêmes blocs dans un autre ordre → un autre résultat. » |
| M5 | « RÉPÉTER 5 FOIS, c'est *écrire* 1 fois et *faire* 5 fois. » |
| M6 | « Je n'ai pas à tout refaire : je change une instruction. » |
| M7 | « L'erreur se voit à l'endroit où le robot quitte le bon chemin. » |
| M8 | « Plusieurs programmes différents peuvent résoudre le même problème. » |

---

## 7. Module architecture (9 modules · 86 min · stages non-decreasing)

| # | Slug | Title | Stage | LPs | min |
|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | `prerequisite_check` | — | 4 |
| 1 | `le-robot-nobeit-pas` | Le robot n'obéit pas | `trigger` | P1, P2 | 8 |
| 2 | `une-instruction-un-effet` | Une instruction, un effet | `discovery` | P2, P5 | 9 |
| 3 | `construire-une-sequence` | Construire une séquence | `discovery` | P3, P4 | 10 |
| 4 | `lordre-change-tout` | L'ordre change tout | `manipulation` | P6, P5 | 10 |
| 5 | `repeter-sans-tout-reecrire` | Répéter sans tout réécrire | `manipulation` | P7 | 11 |
| 6 | `reparer-un-programme` | Réparer un programme | `formalization` | P8, P9, P10 | 10 |
| 7 | `le-labo-de-debogage` | Le labo de débogage | `practice_lab` | P11, P12 | 9 |
| 8 | `mission-finale-le-robot-explorateur` | 🏆 Mission finale | `evaluation` | — | 15 |

**Sum = 86 min ≤ 90.** Stage order: prerequisite_check → trigger → discovery ×2 → manipulation ×2
→ formalization → practice_lab → evaluation. Non-decreasing ✓. All REQUIRED_STAGES present ✓.
Every LP P1–P12 appears in some non-evaluation module ✓. The evaluation module declares no
`teachesLearningPointIds` ✓.

### Module briefs (responsibility — what each is *uniquely* for)

**M0 — Mission de départ** (diagnostic, teal, never gates). 5 closed questions × 2 pts on the two
declared prerequisites only: reading/using whole numbers (counting steps) and repérage in a
grid (rows/columns, moving cell to cell). Never on instructions or programs.

**M1 — Le robot n'obéit pas** (trigger, indigo). *Uniquely responsible for*: creating the need for
instructions. The student is shown a robot and a target and given a tempting button
« 🗣️ Dis-lui d'aller au drapeau ». It does nothing (the robot shrugs — one short animation).
Only the instruction blocks move it. Aha: `objectif ≠ programme`. Ends with the student's first
2-instruction program reaching a target one step away. **Introduces the word *instruction*; does
NOT define "algorithme" formally** (M3 does, after the gesture).

**M2 — Une instruction, un effet** (discovery, sky). *Uniquely*: isolating a single instruction's
effect. One instruction at a time, executed alone from a fixed start; the student predicts the
resulting cell/orientation before running (predict → run → verify). Establishes that `TOURNER`
changes heading **without moving** — the single most common 6e confusion. Introduces `RAMASSER`.

**M3 — Construire une séquence** (discovery, emerald). *Uniquely*: composing instructions into an
ordered whole, and decomposing a goal into steps (P3). The student is given a target 3–4 steps
away and builds the full program. The word **algorithme** is formalized *here*, as the name for
what they have just built. Step-by-step (`⏭ Pas à pas`) runner introduced.

**M4 — L'ordre change tout** (manipulation, violet). *Uniquely*: order as meaning (P6). Two
programs with **exactly the same blocks** in different orders, run side by side to different
landings; then the student reorders a given program with ↑/↓ to hit the target. No new
instruction is introduced — the whole cognitive load is on order.

**M5 — Répéter sans tout réécrire** (manipulation, purple). *Uniquely*: the loop (P7). Sequence:
(1) a long corridor forces `AVANCER ×6` by hand — deliberately tedious; (2) `RÉPÉTER` is offered;
(3) the student compresses their own program and **verifies the identical trace** — the unroll is
animated so the loop's `×N` badge visibly expands into the steps it stands for. Formal word
*boucle* arrives only after the compression works.

**M6 — Réparer un programme** (formalization, blue). *Uniquely*: modifying an existing program
(P8) and locating/correcting a fault (P9, P10). Given a working program, the goal *changes*
slightly → edit, don't rewrite. Then a broken program: run it, see where it diverges, fix one
instruction. Carries the lesson's « À retenir » card, built from the gestures already performed.

**M7 — Le labo de débogage** (practice_lab, rose). *Uniquely*: the full test/observe/hypothesise
cycle on the student's own initiative (P11, P12) — translating a stated strategy into a program.
2–3 independent worlds, escape hatch after 3 failed runs.

**M8 — 🏆 Mission finale** (evaluation, amber). 10 QCM épreuves, silent until one submit, per-skill
badges, Synthèse reusing ProgramLab frozen. Authored **last**, distractors mirroring the traps
actually taught.

### Continuity (one adventure, no shared runtime state)

Carried object: **ROBI**, the delivery robot of the school, mapping the *potager de l'école*.
Vocabulary introduced exactly once — *instruction* (M1), *programme/algorithme* (M3), *ordre*
(M4), *boucle/répéter* (M5), *bug/déboguer* (M6) — and only *used* afterwards. Deep links and the
mastery-bypass path must keep working: **no module reads another module's runtime state.**

---

## 8. Error & misconception strategy

| Misconception | Detection | Consequence shown | Hint | Recovery |
|---|---|---|---|---|
| « Dire le but suffit » | Presses the intention button | Robot shrugs, stays put | « Il attend des instructions » | Instruction blocks are the only live control |
| TOURNER makes it advance | Predicts a moved cell in M2 | Robot rotates *in place*, cell unchanged | « Regarde la case : elle n'a pas changé » | Re-run the single instruction |
| Turn direction egocentric | Turns the wrong way | Robot faces visibly wrong; direction cone shown | The cone + « le robot regarde vers … » | Undo one instruction, re-run |
| Order is irrelevant | Same blocks, wrong order | Two side-by-side runs land differently | « Mêmes blocs, ordre différent » | Reorder with ↑/↓ |
| `RÉPÉTER 5` = 5 written once = 1 step | Miscounts the trace | Unroll animation expands the badge into 5 steps | « RÉPÉTER 5 FOIS remplace 5 lignes » | Compare trace lengths |
| Off-by-one on repetitions | 4 or 6 instead of 5 | Robot stops short / overshoots visibly | Count the cells between robot and flag | Adjust `times` and re-run |
| Debugging = rewrite everything | Clears the whole program | (allowed, but) M6 goal is edit-in-place | « Une seule instruction est fautive » | Replace a single slot |

**Boss distractors** encode exactly these: direction errors, off-by-one loop counts, order swaps,
turn-vs-advance confusion.

---

## 9. Guidance system (the student never asks "what now?")

Every ProgramLab screen shows, always: **Objectif** (one line, e.g. « Amène ROBI au drapeau »),
**the world** with start/target marked, **the program strip** (empty state reads « Ajoute des
instructions ci-dessous »), **the palette** of allowed instructions for that mission,
**transport** (▶ Exécuter · ⏭ Pas à pas · ↺ Réinitialiser), and **status** (« ROBI est en
(2 ; 1), tourné vers le haut »).

Guidance ladder per module: **SHOW** (a single soft pulse ≤ 2 cycles on the first instruction
block, disabled after first tap and under reduced motion) → **TRY** (M1/M2: one enabled action so
the gesture cannot be missed) → **EXPLORE** (M3–M5: full palette) → **CHALLENGE** (M7) →
**TRANSFER** (M8). Step instructions ≤ 2 short sentences, imperative micro-missions.

**Escape hatch** (playbook §8): after **3** failed runs in any goal-gated mission, a
« Je ne trouve pas — montre-moi » button appears; it reveals a working program, plays it, and
completes the step with honest copy (« Pas grave, on te le montre »). Manipulations complete on
the **real goal** (robot on target / correct trace), never on mere placement, and controls stay
live during feedback.

---

## 10. Component architecture

```
components/
  algoUtils.js       pure model: DIRECTIONS, DELTA, turn/step, flatten, runProgram,
                     makeWorld, gridToSvg, formatProgram, describeHeading, diffTrace
  RobotWorld.jsx     SVG grid + robot + trail + obstacles + target (display only,
                     driven entirely by a trace frame — no logic of its own)
  ProgramStrip.jsx   the program as instruction blocks: add / remove / move / replace /
                     set times; highlights the currently executing instruction
  ProgramLab.jsx     composes RobotWorld + ProgramStrip + transport; owns the replay
                     animation; calls onRunComplete(result) from an EFFECT, never
                     from a state updater (§10.10)
  learningPoints.js  literal LP mirror + recommendedSlug per LP (boss profile)
```

`ProgramLab` is controlled: the **module owns** `program` state and passes
`program` / `onProgramChange`. Reused across M1–M8 with props narrowing the palette
(`allowed`), the world, and the success predicate — one component, eight missions.

### Engineering rules applied (playbook §10 — each a known bug class)

1. Tap-first: every instruction is a ≥ 44 px button; reordering via ↑/↓ buttons (no drag
   required); full keyboard operability.
2. No drag mechanic is introduced at all → the NumberLine drag recipe is not needed here.
3. `pointerEvents: 'none'` on every decorative SVG sibling (grid lines, labels, trail, target
   glyph) so nothing intercepts taps.
4. ARIA: `ProgramLab` wrapper `role="group"`; the SVG world is `role="img"` with a French
   `aria-label` stating the reading (« ROBI en colonne 2, ligne 1, tourné vers le haut ») —
   it contains **no buttons**; the program strip's blocks are real `<button>`s outside the SVG.
5. Density: worlds capped at **7 × 6 intervals** and programs at **14 instructions** →
   well under the ~52 interactive/animated node cap.
6. Reachability: every target is reachable with the palette offered in that mission — asserted
   by a unit test that solves each authored mission with its reference program.
7. Controlled components; all transitions from `algoUtils` only.
8. Robot movement uses a CSS `transform` on a `<g>` (never framer-motion `animate={{x,y}}` on
   SVG).
9. `AnimatePresence` children carry their key on a `motion.*` element.
10. `onRunComplete` fires from a `useEffect` at the end of the replay — never inside an updater.
11. Settle-then-verdict: the success/failure card appears only after the robot stops.
12. `useReducedMotion` collapses the replay to an instant final frame (logic unchanged);
    component `<style>` blocks carry the `prefers-reduced-motion` query.

---

## 11. Accessibility · Mobile · Visual language

- **A11y**: keyboard on every control (Enter/Space); `focus-visible:ring` house classes; French
  aria-labels stating the reading; colour never the sole carrier (the robot's heading is a cone
  **and** a text readout; success is ✓ + text); every visual consequence mirrored in text; the
  step-by-step runner is the non-animated alternative to the replay.
- **Mobile** (375×667 baseline): single column — world on top, strip below, palette last; tap
  targets ≥ 44 px; `touchAction: 'manipulation'` on the SVG; the program strip wraps (it never
  scrolls the page horizontally); no hover-only affordance.
- **Visual**: house `COLOR_MAP` colours only (teal M0 → indigo → sky → emerald → violet → purple
  → blue → rose → amber boss). Instruction blocks are white cards with 2 px borders, filled with
  the module colour when executing. Animations ≤ 600 ms and each answers a question: robot
  translation = one AVANCER; rotation = one TOURNER; the loop unroll = what RÉPÉTER stands for;
  trail = the path actually taken. No decorative animation.

---

## 12. Validation rules (the gate chain)

1. `npx esbuild <file> --loader:.jsx=jsx` on every new file.
2. `npm run validate:lessons` → `6e:algorithmique-programmation: 12/12 learning points covered`,
   **zero new errors** vs the recorded baseline of **30 errors / 52 warnings**.
3. `npm run test --workspace=packages/core` green + new unit tests for `algoUtils`:
   turn arithmetic (4 turns = identity, left/right inverse), `AVANCER` per heading,
   **loop-unroll trace equality (invariant 2)**, obstacle blocking, no negative coordinates,
   and every authored mission solved by its reference program (invariant: reachability).
4. E2E Playwright suite `apps/web/e2e/lesson-kit/z1-algorithmique.mjs` per house conventions
   (vite from `apps/web/`, curl 200 first, seeded `u_anon_smarter_lesson_algorithmique-programmation`,
   `domcontentloaded` + ~1200 ms, anchored regexes, `.count()` + `{force:true}` for transparent
   SVG hit areas): index + non-blocking diagnostic; ProgramLab build→run→success; a
   **wrong-on-purpose run that still progresses with the correction visible**; the loop unroll;
   the debugging module; boss silent-until-submit → score → profil → synthèse → Terminer,
   reload-shows-review, redo; a mobile pass; **zero console/page errors**.
5. Visual review of each flagship state (mid-run, blocked-against-wall, loop unrolled, step-by-step).
6. Student walkthrough QA on every interactive module.
7. Status flip `available` → re-validate → curriculum export/import → `smarter:validate-curriculum`.
8. Scope check: `git status` confined to this lesson's directory, `coursesData.js`, `App.jsx`,
   this spec, and the e2e file.

---

## 13. Anti-patterns explicitly avoided

No typed code as the central interaction · no drag-only mechanic · no MCQ-only module · no
definition before gesture · no `_archive_original/` · no `totalModules` literal · no hardcoded
duplicate of the movement table · no blocking on correctness · no uncapped retry loop (3 then
reveal) · no red "find the wrong line" · no variables or conditions (out of official scope) ·
no new global CSS or dependencies · no sibling lesson touched.

---

## 14. Definition of Done

Every LP taught and assessed · every concept has a real manipulation · the student always knows
what to do next · the loop and the bug are *discovered*, not announced · execution is causal and
visible · the 9 modules form one adventure (ROBI, the potager) · fully integrated (routes,
catalogue, registry, progress, unlocking, evidence) · usable by touch and keyboard · zero runtime
errors, dead controls, or unexplained interactions.

---

## 15. Shipped state (implementation record)

Built and verified 2026-09-03. Deviations from the design above: none — the module list,
stages, LP wiring, instruction set and signature interaction shipped as specified.

### Gate chain results

| Gate | Result |
|---|---|
| esbuild syntax, every new file | 20/20 ok |
| `npm run validate:lessons` | `6e:algorithmique-programmation: 12/12 learning points covered`; repo total **30 errors = recorded baseline**, none from this lesson, no warnings from it |
| `npm run test --workspace=packages/core` | 136/136 pass |
| `algoUtils.test.js` (vitest) | 34/34 pass — includes the loop-unroll trace-equality invariant |
| `npm run build` | ✓ built |
| e2e `apps/web/e2e/lesson-kit/z1-algorithmique.mjs` | **32/32 pass**, zero console/page errors |
| Visual review | index, M1 trigger, M2 prediction, M3 blocked-against-wall, M4 side-by-side, M5 loop compression, M6/M7 labs, boss, mobile ×2 |
| `smarter:import-curriculum` | lessons updated 1, retired 0 |
| `smarter:validate-curriculum` | **No drift: MySQL matches coursesData.js**; the 5 duration violations are pre-existing lessons (this one is 86 ≤ 90) |
| Scope | `coursesData.js`, `App.jsx`, this lesson's directory, this spec, the e2e file — no sibling lesson touched |

### Notes for the next maintainer

- `components/algoUtils.js` is the only place movement, turning, unrolling and collision live.
  `heading` is an index into `DIRECTIONS` (clockwise N,E,S,O) so turning is `±1 mod 4`; the SVG
  vertical inversion exists only in `gridToSvg`. Do not re-derive either elsewhere.
- **The loop-unroll invariant is the lesson's mathematical content** (P7) and is guarded by a unit
  test: `RÉPÉTER n [body]` and `n` copies of `body` must always produce identical traces.
- `makeRepeat` strips nested `RÉPÉTER` on construction — the "boucles simples" scope boundary is
  structural, not a convention. Keep it that way; variables and conditions are out of the 6e scope.
- Every authored mission is solvable by a reference `solution` program that also feeds the
  after-3-attempts escape hatch; if a world is edited, re-check its solution still succeeds.
- `ProgramLab` reports run results from a `useEffect`, never from a state updater, and only shows
  a verdict once the replay has settled.
