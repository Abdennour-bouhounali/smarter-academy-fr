# The review — what a machine cannot judge

Two reviews are made by the main session and by nobody else: the DESIGN before any code (§A) and the SCREENSHOTS before
any commit (§B). Each question below was learned from a defect that passed every automatic check; its number in
`defects.md` is in brackets. Add a question whenever the eyes find something this list did not name.

## A. The design, before the first brief

Before the keys (owner, 2026-11-21 — `SKILL.md` §0ter):

- Is this plan the student's path, or the book's list? If it has one key per listed learning point in the list's order,
  start again from what he must be able to DO.
- What did the lessons before it in the unit already make him do? None of it is forged again here.
- What is NEW for him in this lesson? Each key answers that.

For each key:

0. **Is there a situation IN THE WORLD that makes the rule necessary?** (owner, 2026-11-19) — a constraint he carries
   from one island to the next (one choice of planks for two bridges, an island with none), a cost (a purse that only
   the right plank pays). If there is one, it REPLACES the experiment screen of the mirror: the forge has no
   `inquiry`, its evidence is what he did on the islands. Only a rule with no honest situation (a procedure, a proof)
   keeps an experiment in the mirror. `GAME_WORLD.md` §2ter-1; first case: lesson 4, keys 1 and 2. [A11]
1. **What is the NATURE of this rule** — a condition on one case, a search, a maximum with a reason to stop, a procedure,
   a sharing, a classification, a change of unit, an equality of two sets, a proof? The experiment is of that nature.
2. **Is its (kind, mode) used by another key of this lesson?** By the lesson before, on the same idea with easier
   numbers? Then it is the same mirror re-skinned: find the experiment that is this rule's own. [A3]
3. **Could he find the rule FALSE on this screen?** List the wrong rules students really hold; the experiment's numbers
   must hold a case against each. An experiment true for every number it shows teaches nothing. [A4]
4. **Does any sentence, hint, tile or label say the rule or its name before the seal?** Also on the screens around the
   forge: the hub, the launch kit and its lab, the board. [A1, A2]
5. **What does he HOLD when the forge opens?** The experiment starts from what he has just done (the plank he used, the
   gap he crossed) — write it down for the forges' agent.
6. **Is the key about a bridge?** If it is a sharing, a fraction, a classification: name now what each surface draws
   and says — the mirror, the log, the board's cards, the trainer. [A10]

For the lesson:

7. **Does the final mission need the lesson?** Play it in your head with only last lesson's keys: if it can be won, it
   is the wrong mission. Its distractor is the error this lesson fights. [A5]
8. **Do the keys weigh what the bank weighs?** `lesson:brief` gives the primary questions per الكفاءة: a key that carries
   half the bank gets the richest experiment and the `use` step closest to the exam.
9. **Are the numbers free?** Not a number of another lesson, not a headline pair of the lesson's own bank. [A9]

## B. The screenshots, before the commit

**Since 2026-11-19 (owner, `SKILL.md` §0bis): open about TEN chosen screens per lesson — the ones this lesson is the first to show — not every screenshot.** Run the walks at 1366×768 ONLY (owner, 2026-11-19: the one size; the right-hand column below is no longer done) on a frozen copy. Then OPEN the pictures. The list of screens:

| Walk | Open at 1366×768 | Open again at 1024×768 and 1840×900 |
|---|---|---|
| the story | the start; EVERY screen of every experiment; for each forge: tiles, a refutation, an attack, the last step with its wrong-answer feedback; the four tablets; the dash; the stone; every step of the store; the end | every experiment's busiest screen; one forge screen; the tablet with the longest text |
| the hub | locked, open, a node's rule card, the guide | the hub |
| the trainer | the knowledge map (a card open, « تدرّب » open), one question of each type, a correction | the map |
| the sitting | a sheet being read, a sheet being sat, the corrected copy with its model answer, the level-5 sheet | the longest sheet |
| the board | every `ask` station after the check, every naming station, both copybook pages | the station with the most cards |
| the launch kit | the sort, the workshop, the capsule's lab | the sort |

A screenshot that an agent says it looked at still counts as NOT looked at.

On each picture, in this order:

0. **In the world: is the instruction there, whole, and enough to act on without the robot's sentence?** Is the card
   « من الجزيرة السابقة » there with what he needs to connect the two islands? Can he walk back, the camera behind
   him? (`GAME_WORLD.md` §2ter-1) [B14]

1. **Does the drawing say what the sentence says?** Vases for a sharing, not planks; the count on the picture equal to
   the count in the words; the thing the question names visible on the question's screen. [A10]
2. **Is anything told too early?** A rule's words in an experiment; a key's name on a locked node, in the lab, on the
   board before its naming station. [A1, A2]
3. **Is every sentence whole?** No ellipsis, no clipped line, no card cut by its box, no label under a card. The
   automatic checks miss a `text-overflow` and anything hidden by `overflow`. [B5, B8]
4. **How does a list or a long sentence wrap?** A line that starts with « ، »; a card on three lines; a formula alone
   on a line is fine, a formula broken is not. [B6]
5. **Mixed Arabic and Latin text: in the right order?** Do not judge it at screenshot size — crop the line and enlarge
   it (`PIL`: `crop(...).resize(3×)`). Two readings made at full size on 2026-11-19 were wrong. [B7]
6. **Arabic**: number agreement (1, 2, 3–10, 11+), a definite noun with an indefinite adjective, the dual, the gender
   of « كلّ واحد منها ». Read every sentence that a template built. [B11]
7. **Placeholders**: a « • », an empty label, « undefined », a 0 where a count should be, « 0 وردة ». [B9]
8. **Small and crowded**: labels stacked on a line of lengths, SVG numbers near 12 px, glyphs under 10 px that carry
   meaning. Fit is not legibility. [B3]
9. **Empty**: a frame that is two-thirds empty at one size while a drawing beside it is squeezed.
10. **The feedback to a wrong answer**: is it what the world DOES and a fact, never « wrong », never the answer?
11. **Shapes** in the brand blue; no person drawn locally. [B12]

What the review finds becomes fix batches (`briefs.md` §R) AND lines of `defects.md`.
