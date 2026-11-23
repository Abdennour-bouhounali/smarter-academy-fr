# The review — what a machine cannot judge

Two reviews are the pipeline's two quality gates (`SKILL.md` §2, `docs/TWO_PLATFORMS_PLAN.md` §6), read by the
strongest model (`fable`) in a fresh short context, after every machine check is green: gate A, the DESIGN before any
code (§A); gate B, the ten chosen SCREENSHOTS and the forges' tiles before « done » (§B). Each returns a numbered
defect list and a verdict, counted in `defects.md` « Cost ». Each question below was learned from a defect that passed every automatic check; its number in
`defects.md` is in brackets. Add a question whenever the eyes find something this list did not name.

## A. The design, before the first brief

Before the keys (`SKILL.md` §1bis and §0ter):

- **What did the port map keep?** Every DZ key, station and exercise kept must teach one of THIS lesson's learning
  points; every one cut is named with where it goes. A French point that nothing ported teaches gets its own key.
- Is this plan the student's path, or the official list's? If it has one key per listed learning point in the list's
  order, start again from what he must be able to DO.
- What did the lessons before it in the unit (and, in 3e, the 4e items of `lesson:brief`) already make him do? None of
  it is forged again here.
- What is NEW for him in this lesson? Each key answers that.

For each key:

0. **Is there a situation IN THE WORLD that makes the rule necessary?** (owner, 2026-11-19) — a constraint he carries
   from one island to the next (one choice of planks for two bridges, an island with none), a cost (a purse that only
   the right plank pays). If there is one, it REPLACES the experiment screen of the mirror: the forge has no
   `inquiry`, its evidence is what he did on the islands. Only a rule with no honest situation (a procedure, a proof)
   keeps an experiment in the mirror. `GAME_WORLD.md` §2ter-1; first case: the Algerian lesson 4, keys 1 and 2. [A11]
1. **What is the NATURE of this rule** — a condition on one case, a search, a maximum with a reason to stop, a procedure,
   a sharing, a classification, a change of unit, an equality of two sets, a proof, a writing convention (a power)? The
   experiment is of that nature.
2. **Is its (kind, mode) used by another key of this lesson?** By the lesson before, on the same idea with easier
   numbers? Then it is the same mirror re-skinned: find the experiment that is this rule's own. [A3]
3. **Could he find the rule FALSE on this screen?** List the wrong rules students really hold; the experiment's numbers
   must hold a case against each. An experiment true for every number it shows teaches nothing. [A4]
4. **Does any sentence, hint, tile or label say the rule or its name before the seal?** Also on the screens around the
   forge: the hub, the warm-up and its lab, the board. [A1, A2]
5. **What does he HOLD when the forge opens?** The experiment starts from what he has just done (the plank he used, the
   gap he crossed) — write it down for the forges' agent.
6. **Is the key about a bridge?** If it is a sharing, a fraction, a classification, a decomposition: name now what each
   surface draws and says — the mirror, the log, the board's cards, the trainer. [A10]
7. **Does the world's main gesture run the same way as the concept?** (« from … to … ») [D32]

For the lesson:

8. **Does the final mission need the lesson?** Play it in your head with only last lesson's keys: if it can be won, it
   is the wrong mission. Its distractor is the error this lesson fights. [A5]
9. **Do the keys weigh what the bank weighs?** `lesson:brief` gives the primary questions per learning point: a key that
   carries half the bank gets the richest experiment and the `use` step closest to the exam. In 3e: which part of the
   brevet (`brevet: 1` automatisms without calculator, `2` problems) does each key serve?
10. **Are the numbers free?** Not a number of another FRENCH lesson, not a headline pair of the lesson's own bank. [A9]
11. **Are the contexts French and for everybody?** Euros at a plausible price, no religion, no brand, no alcohol, no
    betting, no playing cards; a die, a coin, an urn, a spinner only as an experiment; first names of today's France,
    girls and boys equally; `KidFigure` in ordinary clothes. (`FRENCH_LANGUAGE_CONTRACT.md` §9, plan §7bis)

## B. The screenshots, before the commit

**Since 2026-11-19 (owner, `SKILL.md` §0bis): open about TEN chosen screens per lesson — the ones this lesson is the
first to show — not every screenshot.** On the FIRST French lesson every kind of screen is new: open one of each. Run
the walks at 1366×768 ONLY on a frozen copy. Then OPEN the pictures. The list of screens:

| Walk | Open at 1366×768 |
|---|---|
| the story | the start; EVERY screen of every experiment; for each forge: tiles, a refutation, an attack, the last step with its wrong-answer feedback; the tablets; the dash; the stone; every step of the store; the end |
| the hub | locked, open, a node's rule card, the guide |
| the trainer | the knowledge map (a card open, « Entraîne-toi » open), one question of each type, a correction |
| the sitting (« Brevet blanc ») | a sheet being read, a sheet being sat, the corrected copy with its model answer, the level-5 sheet, the longest sheet |
| the board | every `ask` station after the check, every naming station, both copybook pages, the station with the most cards |
| the warm-up (« L’échauffement ») | the sort, the workshop, the capsule's lab |

A screenshot that an agent says it looked at still counts as NOT looked at.

On each picture, in this order:

0. **In the world: is the instruction there, whole, and enough to act on without the robot's sentence?** Is the card
   of the island before (« De l’île précédente ») there with what he needs to connect the two islands? Can he walk back,
   the camera behind him? (`GAME_WORLD.md` §2ter-1) [B14]
1. **Does the drawing say what the sentence says?** Vases for a sharing, not planks; the count on the picture equal to
   the count in the words; the thing the question names visible on the question's screen. [A10]
2. **Is anything told too early?** A rule's words in an experiment; a key's name on a locked node, in the lab, on the
   board before its naming station. [A1, A2]
3. **Is every sentence whole?** No ellipsis, no clipped line, no card cut by its box, no label under a card. The
   automatic checks miss a `text-overflow` and anything hidden by `overflow`. French sentences are longer than the
   Arabic ones the kit was laid out for. [B5, B8]
4. **How does a list or a long sentence wrap?** A card on three lines; a count split from its noun (« 3 / leçons »); a
   formula alone on a line is fine, a formula broken is not; « 60 = 2² × 3 × 5 » on ONE line. [B6]
5. **French typography**: « … » with their spaces, a space before « : ; ! ? », « ’ » not « ' », « 3e » not « 3ème »,
   the decimal comma, « 12,50 € », « × » not « · », « PGCD(12 ; 18) ». Crop and enlarge a line when a space is in doubt
   (`PIL`: `crop(...).resize(3×)`): a no-break space and a narrow one are not told apart at screenshot size.
6. **French agreement**: a count with its noun (0 and 1 singular: « 0 planche », « 1 planche », « 2 planches »), the
   gender of each noun (« une case », « un fossé »), elision (« l’île », « d’une ») — read every sentence that a template
   built. [B11]
7. **Placeholders**: a « • », an empty label, « undefined », a 0 where a count should be, « 0 bouquet ». [B9]
8. **Small and crowded**: labels stacked on a line of lengths, SVG numbers near 12 px, glyphs under 10 px that carry
   meaning. Fit is not legibility. [B3]
9. **Empty**: a frame that is two-thirds empty while a drawing beside it is squeezed.
10. **The feedback to a wrong answer**: is it what the world DOES and a fact, never « faux », never the answer?
11. **Shapes** in the brand blue; no person drawn locally; `KidFigure` in ordinary clothes. [B12]
12. **Leftovers of the port**: a layout still placed from the right, a mirrored arrow, an Algerian name, a price in
    dinars or an implausible euro sum, an Arabic word in a drawing.

What the review finds becomes fix batches (`briefs.md` §R) AND lines of `defects.md`.
