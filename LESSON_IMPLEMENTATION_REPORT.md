# Lesson Implementation Report — The Fraction Factory

Grade 6e · lesson id `fractions` · domain `nombres_calculs` · 8 modules · ~45 min

This report covers the full redesign of the existing `fractions` lesson into
**the Fraction Factory**: a laboratory identity (dark, atmospheric,
"discovery space") distinct from a bright "knowledge space", a signature
conveyor-belt device that carries a manipulation into its symbolic result,
knowledge-capture moments after every module, and an 8-module structure
ending in a merged practice → synthesis → evaluation final module.

## 0. Audit findings (phase 1)

The lesson already had a solid, working foundation from its first build:
`PizzaSVG` (dynamic wedge geometry, click/keyboard selection, lift/pulse/dim
animation), `QuantityGroupLab` (equal-grouping manipulator), `FractionDisplay`,
`SliceCompare` (transparent overlay), `fractionUtils.js` (all the angle math,
including the drag-to-cut clamping helpers), a working evidence/mastery
pipeline (`useEvidenceSubmission`, `useLearningProfile`,
`LearningPointMastery.jsx`), and 9 modules whose manipulations were
pedagogically sound (drag-cut, N-part experimentation, unequal-partition
investigation, guided construction missions, tap-to-match scanner,
forward/reverse machine, real-world grouping challenge, 4-question
assessment). **None of that was rewritten from scratch.** The redesign
preserves every manipulation's logic verbatim and changes: the visual frame
around it, the addition of explicit knowledge-capture moments, a new
conveyor-belt visualization for the two "build a fraction" modules, and the
lesson's structure (9 modules → 8, per the requested mapping).

## 1. Files changed

**New shared components** (`common/components/`, `common/hooks/`) — already
existed from the previous build, unchanged: `LearningPointMastery.jsx`,
`useLearningProfile.js`.

**New lesson-local components** (`fractions/components/`):
- `theme.js` — one semantic palette (lab/mission/success/error/hint/key roles) used by every module instead of ad hoc per-module colors.
- `LabShell.jsx` — the dark, atmospheric "factory" frame every manipulation lives inside.
- `ConveyorBelt.jsx` — pizza → TOTAL/CHOSEN stations → symbolic result, the lesson's signature device (see §3).
- `KnowledgeReveal.jsx` — the "🧠 unlock" capture card (definition/rule/vocab/mistake/tip sections) shown after a manipulation succeeds.
- `ManipulationFeedback.jsx` — the standard OBSERVATION + QUESTION shape for a wrong manipulation (never a bare "faux").
- `GuidedHint.jsx` — an opt-in, escalating hint ladder.
- `SuccessAnimation.jsx` — one short, meaningful confirmation.

**Rewritten**: `lesson.config.js` (8 modules), `routes.jsx`, `learningPoints.js`
(recommended-module slugs), `LessonSummary.jsx` (retitled "🏆 Fraction
Factory — Knowledge Hub", added a consolidated "Erreurs fréquentes" section),
all 8 module files (new slugs, `LabShell`/`KnowledgeReveal` framing — see §4
for what stayed the same underneath).

**Deleted**: the old `01_pizza-probleme.jsx` … `07_fabrique-fractions.jsx`
(superseded 1:1 by their renamed/restyled versions) and `09_bilan-final.jsx`
(merged into the new `08_defi-pizzeria.jsx`).

**Unchanged**: `PizzaSVG.jsx`, `QuantityGroupLab.jsx`, `FractionDisplay.jsx`,
`SliceCompare.jsx`, `fractionUtils.js`, `MasteryReport.jsx`, `index.jsx`,
`moduleContext.js` — and `App.jsx`'s route registration (same
`fractionsRoutes()` import, only the module slugs behind it changed).

## 2. Module structure (9 → 8, per the requested mapping)

| # | Slug | Stage | Title | Teaches | From (old) |
|---|---|---|---|---|---|
| 01 | `entree-usine` | trigger | Entrée dans l'usine | P1 | `01_pizza-probleme` |
| 02 | `station-decoupe` | discovery | La station de découpe | P1 | `02_labo-parts-egales` |
| 03 | `controle-qualite` | discovery | Contrôle qualité | P1 | `03_pizzeria-parts-inegales` |
| 04 | `fraction-builder` | manipulation | Fraction Builder | P1, P2 | `04_construire-fraction` + ConveyorBelt |
| 05 | `station-quantite` | manipulation | Station Quantité | P3 | `05_fraction-dune-quantite` |
| 06 | `scanner-sens` | formalization | Le scanner de sens | P2 | `06_numerateur-denominateur` |
| 07 | `machine-fractions` | practice_lab | La machine à fractions | P1, P2 | `07_fabrique-fractions` + ConveyorBelt |
| 08 | `defi-pizzeria` | evaluation | Le défi de la pizzeria | *(evaluates)* | `08_defi-pizzeria` (practice) **+** `09_bilan-final` (challenge/hub/mastery), merged |

Stage order stays non-decreasing (contract requirement); `estimatedMin` sums
to 45 (5+4+4+7+5+5+5+10). Module numbers 1–8 map 1:1 to the brief's
"MODULE 1…8" narrative (Enter the Factory → Cutting Station → Quality
Control → Fraction Builder → Quantity Station → Meaning Scanner → Fraction
Machine → Pizzeria Challenge).

**Module 8's internal flow** (`phase` state machine, never all shown at
once): `practice` (the 24-part pizzeria order — real-world, ungraded) →
`hub` (🏆 Knowledge Hub — full lesson synthesis) → `challenge` (the 4
assessment questions, reframed as "La Pizzeria Bella Napoli" order's 4
steps) → `score` (brief celebration) → `mastery` (🎯 Mes acquis + 🎉 Bravo
closure). This matches the brief's explicit ordering: synthesis before the
graded challenge, LP progress after it.

## 3. The Fraction Factory visual system

- **Two spaces, always visually distinct**: `LabShell` (dark
  slate→indigo gradient, glowing corner accents, white/translucent panels)
  for every manipulation; plain bright white cards for `KnowledgeReveal` and
  the Knowledge Hub. A student can tell which mode they're in without
  reading text.
- **`ConveyorBelt`**: an animated (moving diagonal-stripe) belt carrying a
  live TOTAL and CHOSEN count into a `FractionDisplay` result — used in
  Fraction Builder (module 04) and the Fraction Machine (module 07), the two
  modules whose entire point is "watch the fraction get built." On mobile it
  recomposes to a vertical stack (verified — see §8).
- **One semantic palette** (`theme.js`): violet = the factory/lab identity,
  amber = mission/narrative, emerald = success, rose = error, sky = hint,
  amber-soft = "key concept." No module invents its own accent color.
- **`KnowledgeReveal`** implements the brief's RuleCard/VocabularyCard/
  MistakeCard as one small typed section renderer (icon + color per kind)
  rather than three separate files — each is a two-line visual variant, not
  independent behavior.

## 4. Manipulations (unchanged logic, new framing)

- **Drag-to-cut** (01): live pointer-drag of cut handles (mouse/touch/keyboard), an inspection mode on unequal cuts, a lift-apart celebration on success.
- **N-part experiment** (02): 2–12 part selector rebuilding the pizza live; ≥3 distinct values required before the reflection questions unlock.
- **Overlay comparison** (03): two selected slices superposed at a shared vertex, semi-transparent — the size mismatch is seen, not stated.
- **Fraction Builder** (04): free discovery + 4 build-missions (1/2, 2/3, 3/4, 3/5), now visualized through the conveyor belt; denominator-vs-numerator–specific `ManipulationFeedback` on a wrong attempt.
- **Equal-grouping** (05): `QuantityGroupLab` — give/reprendre into buckets, then select completed groups; "1/3 of 12" is read off the manipulation before `12 ÷ 3 = 4` is ever shown.
- **Tap-to-match scanner** (06): pick-a-chip/tap-a-question 2-step matching (no native drag, mobile-robust), now inside `LabShell` with a `ManipulationFeedback` wrong-zone reaction.
- **Fraction Machine** (07): stepper knobs, direct sense then 3 reverse challenges, now producing its fraction through the conveyor belt (fitting, since this module *is* "the machine").
- **Pizzeria order + Final Challenge** (08): real-world grouping practice, then the same 4 assessment mechanics as before (construct 3/5; identify what 4 and 3 mean; show 1/3 of 12; construct 5/8), reframed as one order's 4 steps.

## 5. Error handling (misconception-aware, never a bare "faux")

Every wrong manipulation now goes through `ManipulationFeedback`'s fixed
shape — an **observation** (what the student actually built) plus a
**question** (what to check themselves):

1. Unequal partition ("4 parts" ≠ "4 equal parts") → module 01's inspection mode, module 03's whole premise.
2. Numerator/denominator confusion → module 06's scanner; assessment Q2.
3. "Selected count matches, denominator doesn't" / 4. "Denominator matches, selection doesn't" → module 04's two distinct feedback branches.
5. Selecting every slice ("5/5") → explicit branch: "tu as sélectionné toutes les parts, combien dois-tu vraiment prendre ?"
6. Counting objects without equal groups → `QuantityGroupLab` structurally blocks group-selection until `isSolved`.
7. Guessing a quantity fraction without grouping → same structural gate (05, 08's practice, assessment Q3).
8. Random-click guessing → every construction task requires the *correct combination* of total + selection; a lucky single click cannot satisfy both.

## 6. Knowledge-capture moments

Every module now ends with a `KnowledgeReveal` immediately after its
manipulation succeeds, reusing that module's own visual result (never an
unrelated static example): definitions (unité, part égale), the rule
discovered, relevant vocabulary, a named common mistake, and a memorable tip.
Module 08 additionally hosts the full **🏆 Fraction Factory Knowledge Hub**
(vocabulary grid, 3 mini-pizza definitions, 2 method cards with numbered
steps, one interactive reference example, 3 consolidated "erreurs
fréquentes" cards, one "à retenir").

## 7. Learning Point mapping & practice/evaluation separation

| LP | Taught by | Assessed by |
|---|---|---|
| `6e_fractions_P1` | 01, 02, 03, 04 | `fractions-1-assessment-01`, `-04` |
| `6e_fractions_P2` | 04, 06, 07 | `fractions-1-assessment-02`, `-04` |
| `6e_fractions_P3` | 05, 08 (taught earlier, at 05 — an `evaluation`-stage module may not declare `teachesLearningPointIds`) | `fractions-1-assessment-03` |

Only the 4 questions inside module 08's `challenge` phase submit evidence
(`assessment.enabled: true`); everything else — all 7 learning modules plus
module 08's own practice phase — is discovery/practice and never touches
`useEvidenceSubmission`. `npm run validate:lessons --strict` mechanically
enforces this (enabled questions only inside the `evaluation`-stage module's
own file; discovery/practice questions may never carry `learningPointIds`).

## 8. Student progress integration — verified against the real backend

Unchanged from the previous build (already correct, re-verified after the
restructure): `useEvidenceSubmission` → `POST /lessons/fractions/evidence` →
`ProgressEngine`/`MasteryModel` → `StudentLearningPointProgress` — the
frontend is never the source of truth. `MasteryReport.jsx` +
`useLearningProfile` fetch `GET /students/me/learning-profile` and render
only real `{status, confidence}` rows; a Learning Point with no evidence
renders "Pas encore évalué" with no fabricated bar.

**Re-verified end-to-end with a real account** after the full redesign:
registered test user → completed module 08's practice → Knowledge Hub →
4-step Final Challenge (all correct) → `POST .../evidence` ×4 → all `201` →
`GET .../learning-profile` → `200` with real per-LP states rendered
identically in module 08's "Mes acquis" and in the Student Space
"Ma progression" page (`Progression.jsx`, unchanged from the previous
build). XP, `Terminer`, and sequential module unlocking all confirmed
working with the new module numbers/slugs.

## 9. Tests performed

- `npm run validate:lessons --strict` — pass (8-module stage order, LP coverage, assessment metadata, 45-min cap).
- `npm run test --workspace=packages/core` — 136/136 pass.
- `npm run test --workspace=apps/web` — 6/6 pass.
- `vite build` — succeeds; all 8 modules and every new component code-split into their own small chunks.
- Full browser sweep of all 8 modules (dev + production preview) — zero console errors.
- Live interaction verified: module 01's drag-to-cut → equal partition → celebration; module 04's conveyor belt updating live from pizza selection (screenshotted); module 03's overlay comparison; module 08's full practice → hub → challenge → score → mastery flow, including the real-backend run above.
- Mobile (390×844): lesson index, module 01, and module 04 (conveyor belt reflows to a vertical stack, pizza stays full-size, touch targets ≥44px) — no console errors.
- Confirmed the previous session's assessment question ids (`fractions-1-assessment-0N`) and evidence pipeline were preserved through the restructure — no evidence continuity was broken.

## 10. Remaining issues / notes for the user

- **Pre-existing dev-only bug, not fixed (out of scope, unchanged from before)**: `useProgress.js`'s `awardXP` double-invokes under React 18 StrictMode in `npm run dev` only (verified harmless in production builds). Shared infrastructure outside this lesson.
- **Large main JS bundle warning** (~3 MB) is pre-existing, unrelated to this lesson.
- Not done (same scope boundary as before — the lesson-contract's 45-minute cap and the lesson's own official teaching scope): decimal fractions, placing a fraction on a graduated line, comparing fractions. A future continuation lesson covers the rest of the official `fractions` object.
- `GuidedHint.jsx` is wired into module 01's inspection mode (2-level escalating ladder: "réduis l'écart" → the exact target angle) alongside `ManipulationFeedback`, and stays available as reusable infrastructure for any other module or future lesson that wants a deeper hint ladder — `ManipulationFeedback`'s observation+question shape alone already covers the remaining misconception cases in this lesson.
