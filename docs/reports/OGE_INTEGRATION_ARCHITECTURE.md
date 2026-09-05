# Ordre de grandeur et estimation — updated integration architecture

Date: 2026-09-01 · Lesson id `ordre-grandeur-estimation` (6e, nombres_calculs)
Scope: kit port + contract-compliance pass of the existing V1 lesson, following the
mandatory Fractions ↔ OGE comparison phase. Companion to
`docs/architecture/LESSON_INTEGRATION_GUIDE.md` (the contracts themselves).

---

## 1. Documentation baseline

Analyzed: `LESSON_CONTRACT.md`, `EXERCISE_CONTRACT.md`, `LESSON_INTEGRATION_GUIDE.md`,
`AI_LESSON_CONTRACT.md`, `ARCHITECTURE.md`, `PROGRESS_MODEL.md`,
`LEARNING_ARCHITECTURE.md`, `docs/architecture/CLAUDE.md`, `CONTRIBUTING.md`.

Load-bearing rules for this lesson: `totalModules` is derived (`modules.length`),
lesson duration ≤ `MAX_LESSON_MINUTES = 90`, formative questions are never blocking
(no retry loops, unconditional `onAnswered`), the final module must follow the
BossFinal shape (QCM only, silent → single submit → correction → profil → synthèse,
no 4th phase), evidence flows only through `assessment` metadata consumed by
`useEvidenceSubmission`, and new modules are written on the lesson kit.

## 2. Difference analysis — Fractions vs Ordre de grandeur

### 2.1 Pedagogical logic
- **Fractions** builds a mathematical **object**: whole → partition → numerator/
  denominator → fraction → equivalence. Discovery = constructing and naming a thing.
- **OGE** builds a mental **process / judgment**: quantity → friendly number →
  approximation → predicted magnitude → comparison with the exact result →
  plausibility verdict. Discovery = the reflex **ESTIMER → CALCULER → VÉRIFIER**.
- Consequence: OGE's answers are legitimately **interval-tolerant** (several
  roundings are acceptable) and its terminal skill is a **classification**
  (plausible / suspect / impossible), not a construction. Neither exists in
  Fractions, and nothing forces symmetry of steps or module count.

### 2.2 Mathematical object / state
Fractions has per-manipulation state (cells, partitions). OGE's central state per
exercise is `{ exact operands, rounded operands, operation, estimate, exact result,
discrepancy → plausibility class }`. Per project architecture (verified in the
rebuilt Fractions), **no mathematical state is shared across modules** — continuity
is rhetorical, persistence covers only completion/XP/attempts. OGE keeps the same
model: module-local interaction state + **pure validators** in
`components/estimationUtils.js` (`friendlyNeighbours`, `classifyPlausibility`),
interval validation expressed as predicate `expected` on the kit's `NumericQuestion`.

### 2.3 Interaction logic — REUSE / ADAPT / REPLACE / REJECT
**REUSE** (as-is): kit engines (`ContentModule`, `TapQuestion`,
`BatchChoiceQuestion`, `NumericQuestion`, `BossFinal`, `PrerequisiteDiagnostic`),
`ModuleLayout`, `LessonUI` primitives, `NumberLine`, lesson-local `ArrayGrid`,
all module slugs/paths/numbers, the existing French copy and pedagogy.

**ADAPT** (estimation-specific behavior on shared engines):
- `RoundPicker` → thin wrapper over `TapQuestion` (`above` = short NumberLine,
  options = the two friendly neighbours, explain = both distances; tie explains the
  round-up convention). One tap = the answer, unconditional.
- `EstimateInput` → thin wrapper over `NumericQuestion` with predicate `expected`
  (`acceptMin ≤ n ≤ acceptMax`) — the interval tolerance IS the estimation
  pedagogy; `explain` reveals the exact result.
- Detective classification → shared `PlausibilityQuestion`
  (`TapQuestion` cols 3 with icon options), replacing the duplicated
  `DetectiveCard`/`DetectiveMini`.

**REPLACE**: hand-rolled boss phases → kit `BossFinal` data file (QCM épreuves with
visual `extra`s); "Flash retour" phase → dropped (guide §7); module 9's
all-or-nothing quiz → `BatchChoiceQuestion`; the two self-certified "J'ai compris"
steps → real check questions; every "Réessayer" loop → kit reveal-and-continue.

**REJECT from Fractions**: `PartitionShape`, `FractionBuilder`, `ObjectGroup`,
fraction equivalence/quotient patterns — no pedagogical meaning here. No generic
"EstimationEngine" abstraction is created: the four lesson-local components are the
whole estimation-specific layer, and nothing else showed evidence of being shared.

### 2.4 Module map (final)

| # | slug | stage | engine | LPs |
|---|------|-------|--------|-----|
| 0 | mission-de-depart (new) | prerequisite_check | PrerequisiteDiagnostic | — |
| 1 | resultat-impossible | trigger | ContentModule + TapQuestion | P1 |
| 2 | estimer-avant-de-calculer | discovery | ContentModule + RoundPicker/TapQuestion | P1 |
| 3 | arrondir-pour-estimer | manipulation | ContentModule + RoundPicker | P2 |
| 4 | ordre-de-grandeur-somme | manipulation | ContentModule + EstimateInput/TapQuestion | P3 |
| 5 | ordre-de-grandeur-difference | manipulation | ContentModule + NumberLine/EstimateInput | P3 |
| 6 | ordre-de-grandeur-produit | manipulation | ContentModule + ArrayGrid/EstimateInput | P3 |
| 7 | detective-des-erreurs | formalization | ContentModule + PlausibilityQuestion | P4 |
| 8 | estimation-dans-des-problemes | practice_lab | ContentModule, 4-phase problems | P1, P4 |
| 9 | choisir-le-niveau-de-precision | practice_lab | ContentModule + BatchChoiceQuestion | P5 |
| 10 | detective-des-resultats | evaluation | BossFinal (10 QCM, evidence P1–P5) | — |

Durations rebalanced to 4+8+8+9+8+8+8+9+9+6+12 = **89 min** (≤ 90), catalogue
`durationMinutes` aligned.

## 3. Defects corrected by this pass
1. `moduleContext.js` read the removed `LESSON_CONFIG.totalModules` → NaN progress
   bar, "Module N / " header, and no "Terminer" button on module 10.
2. Boss Final: no `useEvidenceSubmission` (LP evidence never sent despite
   `assessment` metadata), no `useFinalTestAttempt` (refresh wiped the attempt),
   per-épreuve reveal gated on success, `misses` never recorded (profile/badges
   dead), duplicate badge predicate, forbidden Flash-retour phase.
3. Formative violations in modules 1–9 (15 retry loops, correctness-gated
   `onSolved`, self-certified steps, all-or-nothing batch check).
4. Duration 102 > 90.
5. `friendlyNeighbours` tie rounded down while module 3 taught "both acceptable" —
   now both teach the round-up convention (750 → 800).
6. `EstimateInput` `≈ NaN` on remount; `Module08` completion via unstable-dep
   `useEffect`; duplicated `CATS`/detective widget.

## 4. Progress / routing / curriculum integration
Unchanged mechanisms, now fully exercised: `useProgress` via `ModuleLayout`
(completion), `useEvidenceSubmission` + `useFinalTestAttempt` via kit `BossFinal`,
`usePrerequisiteDiagnostic` via kit module 0. Routes stay in `routes.jsx` (spread in
`App.jsx`), with module 0 added. Catalogue entry untouched except `durationMinutes`.
Pre-kit originals are archived in `modules/_archive_original/` (never routed), per
the kit-port procedure.
