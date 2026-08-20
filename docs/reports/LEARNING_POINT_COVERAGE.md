# Learning Point Coverage

Assessment coverage of each lesson's learning points. Convention:
`docs/architecture/AI_LESSON_CONTRACT.md`. Machine-checked by
`npm run validate:lessons` (coverage enforced per migrated lesson; for all
available lessons once `--strict` is flipped on in CI).

> **Status after the lesson reset (2026-08-17, see `LESSON_RESET_AUDIT.md`):**
> all lesson implementations were deleted ahead of the rebuild from the
> official pedagogical specification. The evidence pipeline (metadata
> convention, submission hook, offline queue, API, validator) survives the
> reset intact; each rebuilt lesson must reach ✓ COVERED for all of its
> learning points before its status flips back to `available`.
> `6e:fractions` (below) is the first lesson rebuilt under the new contract.

## Status overview

| Lesson | Learning points | Coverage |
|---|---|---|
| `6e:fractions` | 3 | ✓ COVERED (4 assessment questions, module 08) |
| *(remaining catalog lessons)* | 294 | awaiting rebuild — not yet implemented |

## `6e:fractions` — Fractions, Partie 1 : construire la fraction

Built as the **Fraction Factory**
(`apps/web/src/lessons/college/6e/nombres_calculs/fractions/`): a
mathematically-accurate SVG pizza (dynamic wedge geometry for any N, real
crust/sauce/cheese/topping layers) driven by an explicit `{totalParts,
selectedParts}` state model, reused across a trigger → discovery ×2 →
manipulation ×2 → formalization → practice_lab → evaluation journey (8
modules, 45 min). Evaluation module: `modules/08_defi-pizzeria.jsx` —
also the lesson's real-world practice, its Knowledge Hub synthesis, and its
"Mes acquis" per-Learning-Point mastery report built from real evidence,
never an invented score (see `apps/web/src/lessons/common/components/
LearningPointMastery.jsx` and `useLearningProfile.js`). Full redesign notes:
`LESSON_IMPLEMENTATION_REPORT.md`.

Question ids keep the literal `fractions-1-assessment-0N` form (stable,
unique-within-lesson strings — they do not need to match the lesson id).

| LP | Competency | Question | Success behavior | Why it measures the competency | Misconception revealed by a wrong answer |
|---|---|---|---|---|---|
| `6e_fractions_P1` — Construire une fraction en partageant une unité en parts égales | Partition a whole into N *equal* parts and select K of them | `fractions-1-assessment-01` — "Construis 3/5" | Student picks denominator 5 (from a free choice of 2–8) AND selects exactly 3 of the resulting equal slices on the live pizza | The student must produce BOTH numbers themselves from a blank pizza — no denominator is given, so guessing "3 of something" without first fixing 5 equal parts cannot succeed | Selecting 3 slices while the pizza is still cut into the wrong total (e.g. 4) reveals "counting selected pieces without first equalizing the whole" — module 01/03's cut-inspection and overlay-compare experiences target this directly |
| `6e_fractions_P2` — Comprendre le sens du numérateur et du dénominateur | Read what each number of a fraction *represents*, not just its position | `fractions-1-assessment-02` — pizza showing 3/4; "que représentent 4 et 3 ?" | Student correctly answers, for a live SVG pizza with 4 equal parts and 3 highlighted, that 4 = total equal parts and 3 = selected parts (two linked choices, visually anchored to the same pizza) | Directly tests the numerator/denominator *meaning*, decoupled from memorized top/bottom position — the question never uses the words "numerator"/"denominator" | Answering "4 = parts sélectionnées" reveals the denominator/numerator swap (misconception #2 in the module spec); the pizza's live highlight (module 06's scanner) is the targeted remediation |
| `6e_fractions_P3` — Trouver une fraction simple d'une quantité | Find a fraction of a discrete quantity by forming equal groups, not by formula | `fractions-1-assessment-03` — "Montre 1/3 de ces 12 parts" | Student distributes 12 discrete pizza-slice objects into exactly 3 equal groups (via `QuantityGroupLab`, reserve → group tap-to-give), then selects exactly 1 group | The division `12 ÷ 3 = 4` can only be reached by first constructing 3 truly equal groups — no numeric input field exists, so the manipulation itself is graded | Selecting a group before the groups are equal is structurally impossible (`selectable` only activates once `isSolved`); a student who tries to skip grouping and guess a count has no path to a correct answer |

**Integrated question** (`fractions-1-assessment-04`, tags `P1` + `P2`): "Une
grande pizza est découpée en 8 parts égales. 5 parts sont vendues. Construis
la fraction vendue." — pizza is pre-cut into the given 8 parts (denominator
supplied by the story, matching the real-world framing), student selects 5
slices; success requires both the partition-reading (P1) and the
numerator-as-selected-count sense (P2) to already be solid.

Practice-only interactions (never submit evidence): modules 01–08's pizza
cutting, equal-slice experiments, unequal-partition investigation, mission
construction, fraction-scanner matching, and the forward/reverse fraction
factory. `npm run validate:lessons --strict` confirms all 3 LPs covered and
no `discovery`/`practice` question carries `learningPointIds`.

Verified end-to-end against the real API (not simulated): a fresh test
account answered all 4 questions (one deliberately wrong), and
`/students/me/learning-profile` correctly returned mixed real states —
`P1` (2/2 correct) → mastered, `P2` (1 correct + 1 wrong) → reinforce, `P3`
(1 correct) → reinforce — confirming the mastery report never shows a
fabricated number and correctly reflects partial/mixed evidence rather than
the lesson's overall 3/4 score.

## Historical reference: the pilot migration

Before the reset, `6e:resolution-problemes` had been fully migrated as the
architecture's pilot (6/6 learning points ✓ COVERED, including two authored
questions filling genuine P3/P5 gaps; its final Flash quiz was the assessment
section, its scaffolded Boss mission classified as practice). That
implementation was deleted with the reset, but it validated the entire
pipeline end-to-end and its per-question audit method (the §26 table:
competency / question / success behavior / why it measures / misconception
revealed) is the template every rebuilt lesson's coverage entry must follow.
The full pilot audit is recoverable from git history if needed.

## Per-lesson process (for every rebuilt lesson)

1. Author modules with pedagogical staging: discovery / practice /
   assessment — judged by function, not location.
2. Give every question a stable literal `id`; tag assessment questions with
   `assessment: {enabled: true, type: 'assessment', learningPointIds: [...]}`
   using only ids from the lesson's `learningPoints` in `coursesData.js`.
3. Ensure EVERY learning point has ≥ 1 genuine assessment question — author
   one into the challenge/final section if missing; never force-map.
4. Wire `useEvidenceSubmission` at the point correctness is already known.
5. `npm run validate:lessons` until clean; append the lesson's §26 audit
   table to this file, then flip the lesson to `available` and re-run
   `php artisan smarter:import-curriculum`.
