# Diagnostic 6e — Architecture

The first Smarter Academy adaptive diagnostic. Not a quiz, not a fixed-length test: it estimates what a 6e student already masters, what's fragile, and what's missing, using as few questions as the evidence allows, then recommends one specific place to start learning. This document is the map — the reference for extending it to 5e/4e/3e later, adding question types, and understanding why the pieces are shaped the way they are.

Everything here is grounded in the actual repository: the 13-skill competency graph below was derived from the real `skills[]`/`prerequisites` fields already present in the 9 available 6e lessons (see `packages/core/curriculum/coursesData.js` and each lesson's `lesson.config.js`), not invented. See `ARCHITECTURE.md` §1/§9/§10 for how this fits the rest of the identity/grade/lesson system.

## 1. The core architectural split: engine vs. grade content

Nothing in the adaptive engine (`app/Domain/Diagnostic/DiagnosticEngine.php`, `Support/AdaptiveSelector.php`, `Support/MasteryModel.php`, `Support/AnswerChecker.php`, `Support/ProfileBuilder.php`) knows anything about 6e specifically. All grade-specific knowledge — the competency graph, the question bank, the skill→lesson starting-point map — lives behind one interface:

```
App\Domain\Diagnostic\Contracts\GradeDiagnosticProvider
    grade(): string
    skills(): array            — the competency graph
    questions(): array         — the question bank
    startingPointFor(skillId)  — where to send a student who's weak on this skill
```

`App\Domain\Diagnostic\Grades\SixiemeDiagnosticProvider` is the only implementation today, registered in `DiagnosticEngine::PROVIDERS`. **Adding Diagnostic 5e later means writing one new class implementing this interface and adding one line to that map — nothing else changes.** See §9.

This mirrors an existing convention in the codebase: `packages/core`'s grade catalogue (`courseLevels[].grades[]`) is the source of truth for which grades exist, and the backend just stores whichever grade string it's given (`users.grade`, `diagnostic_sessions.grade`) without a DB-level enum. The competency graph and question bank follow the same pattern — **content lives in versioned PHP code, not database rows** — for the same reason `coursesData.js` isn't database-driven: it's reviewable in a PR, requires no admin CMS, and ships atomically with the code that interprets it.

## 2. The 6e competency graph

13 skills across 4 dependency tiers, each tracing to a real lesson (and a specific module within it, not just the lesson index) among the 9 currently available:

| Tier | Skill id | Label | Depends on | Lesson (module) |
|---|---|---|---|---|
| 0 | `nombres.lecture-ecriture` | Lire, écrire, décomposer les nombres entiers | — | nombres-entiers (M3) |
| 0 | `nombres.valeur-position` | Valeur de position de chaque chiffre | — | nombres-entiers (M4) |
| 1 | `nombres.comparaison-rangement` | Comparer/ranger (entiers et décimaux) | valeur-position | nombres-entiers (M6) |
| 1 | `nombres.droite-graduee` | Repérer sur une droite graduée | valeur-position | nombres-entiers (M8) |
| 1 | `fractions.sens` | Sens d'une fraction | lecture-ecriture | fractions (M2) |
| 1 | `decimaux.ecriture-virgule` | Écritures décimales équivalentes | valeur-position | nombres-decimaux (M4) |
| 1 | `operations.sens-technique` | Sens des 4 opérations, techniques posées | valeur-position | quatre-operations (M2) |
| 2 | `fractions.quantite-quotient` | Fraction d'une quantité / quotient | fractions.sens | fractions (M5) |
| 2 | `operations.division-reste` | Division euclidienne, reste | sens-technique | quatre-operations (M5) |
| 2 | `mesures.conversions` | Conversions (longueur/masse/contenance) | ecriture-virgule | longueurs (M4) |
| 2 | `mesures.perimetre` | Périmètre d'un polygone | conversions, sens-technique | longueurs (M6) |
| 3 | `estimation.ordre-grandeur` | Estimer, arrondir, ordre de grandeur | sens-technique, comparaison-rangement | ordre-grandeur-estimation (M2) |
| 3 | `problemes.resolution` | Résoudre et communiquer une réponse | division-reste, quantite-quotient, ordre-grandeur | resolution-problemes (M2) |

**Why 13, not the ~55 individual `skills[]` strings across all 9 lessons combined:** a diagnostic needs to *distinguish* students, not enumerate every learning objective. Each node here groups 2-4 of a lesson's most diagnostically-important, foundational skills — e.g. `nombres.valeur-position` stands in for "place value," which several `skills[]` strings across `nombres-entiers` and `nombres-decimaux` restate in different words. Fewer, higher-signal nodes mean each one can carry 3-4 real questions instead of 1, which is what makes difficulty-adaptive questioning (§4) possible at all.

**Why `mesures.conversions` covers longueurs/masses/contenances together:** converting cm↔m, g�↔kg, and cL↔L are the same underlying competency (multiply/divide by a power of ten) applied to three contexts — treating them as three separate skills would inflate the graph without adding diagnostic information. `mesures.perimetre` stays separate because it's a genuinely distinct (geometric, not just numeric) skill, only taught inside `longueurs`.

**The graph is a DAG by construction:** every edge points from a higher tier to a lower one, so it's provably acyclic — `AdaptiveSelector`'s recursive `isBlockedByGapPrerequisite()` (§4) relies on this to always terminate.

**Importance:** `nombres.lecture-ecriture`, `nombres.valeur-position`, `nombres.comparaison-rangement`, `fractions.sens`, `decimaux.ecriture-virgule`, and `operations.sens-technique` are marked `critical` (they gate the most downstream skills); the rest are `standard`. Importance only affects tie-breaking within the same tier, never overrides tier order.

## 3. The question bank

50 hand-authored questions in `SixiemeDiagnosticProvider::QUESTIONS`, 3-4 per skill, spanning 6 representations:

| Representation | Widget (frontend) | What it captures | Example |
|---|---|---|---|
| `choice` | `ChoiceGrid` (reused as-is) | one selected option id | "1/4 ou 1/8, laquelle est la plus grande ?" |
| `numeric` | `NumberField` (reused as-is) | a free-text value | "Calcule 356 + 478." |
| `fraction` | `FractionQuestion` (new) | numerator + denominator | "Quelle fraction du gâteau as-tu mangée ?" |
| `ordering` | `OrderingQuestion` (new) | a built sequence of item ids | "Range ces nombres du plus petit au plus grand." |
| `classification` | `ClassificationQuestion` (new) | item→bin assignments | "Quelles informations sont utiles ?" |
| `numberline` | `NumberLine` (reused, `mode="place"`) | a placed value | "Place 2,3 sur la demi-droite graduée." |

Difficulty is 1-4 (the same star scale `LESSON_CONTRACT.md` already documents for modules), so the diagnostic's difficulty language matches the rest of the platform.

**Why some widgets are reused and some are new** (see §7 for the full reasoning): `ChoiceGrid`, `NumberField`, and `NumberLine` never receive the correct answer as a prop and don't self-validate — safe to reuse. The lesson-side `OrderingGame` and `InfoSorter` do both (the correct order/bin is baked into their `items` prop, and they show their own red/green feedback) — appropriate for ungraded practice, but it would hand a diagnostic student the answer key in the page's own DOM/props, and the diagnostic's own UX rule (§5) forbids the detailed reveal-feedback these components render anyway. `OrderingQuestion`/`ClassificationQuestion` mirror their tap-to-place interaction exactly, capture-only. No shared numerator/denominator widget existed at all (`FractionBuilder.jsx` is local to the 6e fractions lesson) — `FractionQuestion` is new, not a promotion of that one, since promoting a lesson-local component into a shared one wasn't asked for and the diagnostic's needs (stepper, no visual partition diagram) are simpler.

## 4. The adaptive algorithm (`AdaptiveSelector`)

Pure, deterministic, no randomness — given the same evidence, always the same next question. Runs entirely server-side (`selectNext()`), called after every response and whenever a session's current question needs (re)computing.

**Selection order, every call:**

1. **Hard stop at 24 questions** (`MAX_QUESTIONS`), regardless of anything else — the bounded-diagnostic guarantee.
2. **Pending misconception verification wins first**, ahead of tier order: if the previous response on some not-yet-resolved skill flagged a misconception, and a question tagged `verifies: <that misconception id>` hasn't been asked yet, ask it next — investigate a suspicious answer immediately, not several questions later.
3. Otherwise, pick the **eligible** skill lowest in tier (then `critical` before `standard`, then id, for determinism). A skill is eligible if it isn't already resolved (§5) and isn't **transitively blocked**: blocked if any prerequisite is a confirmed gap, *or* if any prerequisite is itself blocked further up the chain — not just a one-level check. Without the transitive check, a skill two tiers below a confirmed gap (whose immediate prerequisite was therefore never tested, and so has no row at all) would slip through as "eligible" and get tested anyway, defeating the point of skipping downstream skills for a struggling student. This is what makes Student C's diagnostic short (§10).
4. For the chosen skill, pick the unasked question closest to a **target difficulty**: 2 (medium) for a skill's first question, boosted to 3 if every prerequisite is already strongly mastered (confidence ≥ 0.85 — lets a confident student's downstream skills start harder instead of re-proving the basics); afterwards, `MasteryModel::nextDifficulty()` — steps up on correct, down on incorrect, with a bigger jump when confidence is already decisive, so a clearly strong or weak student converges in fewer questions.
5. If a skill's own question bank is exhausted before its evidence is conclusive (only 3-4 authored per skill), it's treated as resolved-by-exhaustion and the next eligible skill takes over — never a stuck loop.
6. **Null return** (no eligible skill left) means the diagnostic is ready to complete — `DiagnosticEngine` calls `ProfileBuilder::build()` and marks the session `completed`.

## 5. The mastery model (`MasteryModel`)

Not binary. A confidence value (0..1) per skill per session, updated after every response:

```
correct on difficulty d:    confidence += 0.22 × (0.3 + 0.7 × d/4)
incorrect on difficulty d:  confidence -= 0.22 × (0.3 + 0.7 × (1 - d/4))
```

A correct answer on a **hard** question moves confidence up more than an easy one; a miss on an **easy** question moves it down more than a hard one — the intuition IRT-style adaptive tests use, without the black-box math. Every constant lives in `MasteryModel`'s class constants, documented there — this is the complete, auditable spec of "how mastery is decided," not scattered magic numbers.

**Status bands:** 🟢 `mastered` ≥ 0.70, 🟠 `reinforce` 0.40–0.70, 🔴 `gap` < 0.40.

**When a skill stops being probed** (`hasSufficientEvidence`): at 0 attempts, never. At exactly 1 attempt, only if confidence is *decisive* — ≥0.78 or ≤0.20 (`DECISIVE_CONFIDENCE`/`DECISIVE_GAP_CONFIDENCE`), stricter than the normal 0.70/0.40 bar, since a single data point is easier to reach by a lucky/unlucky guess than two. At 2+ attempts, the normal 0.70/0.40 bar applies. Unconditionally at 4 attempts (`MAX_ATTEMPTS_PER_SKILL`) regardless of confidence — the per-skill loop-termination guarantee.

**Why a single attempt can resolve a skill at all** (`startingConfidence` + the boosted difficulty in `AdaptiveSelector::targetDifficulty`): a skill whose every prerequisite already resolved at ≥0.78 confidence seeds at 0.6 instead of 0.5 and targets difficulty 3 (not 2) for its first question. A correct answer there lands at ≈0.7815 — already past the 0.78 decisive bar, resolving the skill in one question instead of two. **This is the mechanism that makes the diagnostic genuinely shorter for a strong student** (§10 of the brief): a consistently-correct run of the real 6e content resolves all 13 skills in **15 questions**, not the 24-question ceiling (verified live in a real browser against the real API — see `docs/reports/DIAGNOSTIC_6E_REPORT.md`). The same 0.78 threshold governs both "is this single attempt decisive" and "is this skill's own confidence strong enough to boost its dependents" *on purpose*: a boosted skill's own 1-shot resolution (≈0.7815) must itself clear the bar, or the cascade would reach tier 1 and silently stop instead of propagating through tiers 2 and 3. The boosted target is difficulty **3**, not 4, deliberately — every skill in the bank has a difficulty-3 question, whereas only a few have a 4; targeting 4 would make the fast path depend on which skill happened to have hard content authored for it.

## 6. The misconception model

Deterministic, explicit, not AI (per the brief: rules first, AI is future work — see §12). Each question can declare `misconceptions`: a map from a specific wrong answer to a misconception id.

- **`choice`**: a specific distractor id → misconception (e.g. picking "1/8" on "which is bigger, 1/4 or 1/8?" → `plus-grand-denominateur-plus-grande-fraction`, the exact "bigger denominator = bigger fraction" example named in the brief).
- **`numeric`**: a specific wrong value → misconception (e.g. answering `0.37` instead of `3.7` → `virgule-mal-placee`).
- **`fraction`**: numerator/denominator swap is detected structurally (`AnswerChecker::checkFraction`), not per-question — answering 4/3 when the correct answer is 3/4 always flags `numerator-denominateur-inverses`.
- **`ordering`**: an exactly-reversed sequence always flags `sens-inverse`, structurally.
- **`classification`/`numberline`**: no misconception detection in v1 — a deliberate scope limit (correctness only), not an oversight.

A response's `misconception_id` (if any) is persisted on `diagnostic_responses` and aggregated (with a count) onto `diagnostic_skill_assessments.misconceptions`. **Never exposed to the client** — the student-facing API (`toPublicQuestion()`, the profile response) never includes misconception ids or which distractor is "the trap." This is deliberate (§26 of the brief: don't expose hidden pedagogical metadata unless required) and leaves room for a future teacher-facing or AI-facing view of the same data without a schema change.

## 7. Trust boundary: why answer-checking is re-implemented in PHP

The diagnostic's correctness decisions are entirely server-side (`AnswerChecker::check()`, `app/Domain/Diagnostic/Support/AnswerChecker.php`) — the client renders a question and submits a raw structured answer; it never computes or asserts `isCorrect` itself. This is **not** a duplication of `packages/core`'s JS validators in the sense the codebase normally warns against (`ARCHITECTURE.md`/`CONTRIBUTING.md` conventions): those stay exactly as-is, powering the *lesson-practice* experience, where client-side self-checking is fine because there's no assessment stake. A diagnostic is graded, though, and per the brief's security requirement, correctness for a graded item is a trust boundary that has to be enforced server-side regardless of what the client can compute.

The re-implementation is deliberately minimal: exact match (`choice`), numeric tolerance (`numeric`/`numberline`), fraction equivalence via cross-multiplication (`fraction` — `a/b == c/d ⟺ a·d == c·b`, exact integer arithmetic, no floating point), and sequence/set equality (`ordering`/`classification`). It does **not** port `packages/core/mathComparison.js`'s compute-engine-based algebraic comparator — the 6e question bank was deliberately designed around answer shapes simple enough to check correctly in a few lines of PHP, specifically to avoid needing that.

## 8. Database

Three new tables — the only new persistence this feature needed, chosen after checking what already existed (no service layer, no FK constraints anywhere yet, no JSON-column precedent — see the phase's audit notes). Every FK here uses real `->constrained()->cascadeOnDelete()` relationships, since nothing about this domain's data should ever legitimately outlive its parent.

- **`diagnostic_sessions`** — one per attempt. `status` (`in_progress`/`completed`), `current_question_id` + `current_question_presented_at` (so a refresh re-shows the same question instead of silently skipping it), `profile_summary` (JSON, the computed result, written once at completion).
- **`diagnostic_responses`** — one per answered question: `question_id`/`skill_id` (string references into the grade's PHP-defined content, same convention as `users.grade` — not FKs to a DB table, since the content isn't one), `is_correct`, `misconception_id`, the raw `answer` (JSON), `response_time_ms`.
- **`diagnostic_skill_assessments`** — one per (session, skill): the live mastery estimate (`status`, `confidence`, `attempts`, `correct_count`, `misconceptions` JSON), unique on `(session_id, skill_id)`.

**No separate `diagnostic_results`/`DiagnosticQuestion`/`MisconceptionEvidence` tables**, each a deliberate decision, not an oversight:
- A *result* has no lifecycle independent of its session — it's the session's terminal-state snapshot, so it lives as a column (`profile_summary`) on `diagnostic_sessions`, not a 1:1 table.
- *Questions* are content (§1), not runtime data — no table.
- A *misconception* only has meaning in the context of a response or a skill's aggregated evidence — it's an attribute of `diagnostic_responses`/`diagnostic_skill_assessments`, not an independent entity with its own table.

**No `engine_state` blob either.** The engine recomputes its next decision from `diagnostic_responses` + `diagnostic_skill_assessments` fresh on every call (`DiagnosticEngine::selectNext()` builds the plain-array inputs `AdaptiveSelector` needs from these two tables each time) — nothing about "what's already been asked" or "current per-skill confidence" is cached anywhere else. One source of truth, and it's what makes resume (§9 of the brief) trivial: there's no separate session state that could drift out of sync with the actual evidence.

## 9. API

All under `auth:sanctum`, scoped to the authenticated user via `$request->user()->diagnosticSessions()->findOrFail(...)` (a session belonging to another user 404s, not 403 — doesn't even confirm it exists).

```
POST /v1/diagnostic/sessions              {grade}   → start-or-resume; idempotent, returns {session, question}
GET  /v1/diagnostic/sessions/current      ?grade=6e → read-only peek; session:null if none exists yet
POST /v1/diagnostic/sessions/{id}/responses  {questionId, answer, responseTimeMs?}
                                                      → {isCorrect, completed, nextQuestion, profile}
```

`respond` is idempotent by `questionId`: replaying an already-recorded response (a retried request after a dropped connection, a double-tap) returns the same `isCorrect` without double-counting evidence, rather than erroring. Submitting a `questionId` that doesn't match the session's actual current question → `409`, not silently accepted (prevents answering a stale/already-superseded question). A completed session rejects further responses → `409`.

The public question shape (`DiagnosticEngine::toPublicQuestion()`) is a plain data contract, not executable UI: `{id, representation, prompt, ...representation-specific fields}` — `choices`/`items` carry only display fields (`id`+`label`/`text`), shuffled server-side so array order never hints at the answer; never `correct`, `misconceptions`, or `verifies`. Same shape regardless of client — this is what makes a future non-web client (§20 of the brief) additive, not a redesign.

## 10. Frontend

```
services/diagnosticService.js        thin transport — no algorithm logic client-side
hooks/useDiagnosticSession.js        session/question/profile state + submitAnswer/advanceTo
components/diagnostic/
  QuestionRenderer.jsx               registry: representation string → widget component
  questions/{Choice,Numeric,Fraction,Ordering,Classification,NumberLine}Question.jsx
  DiagnosticProgress.jsx             confidence-flavored progress bar, not "question N/M"
  SkillProfileList.jsx               one strengths/reinforce/gaps group
  RecommendationCard.jsx             the "first mission" CTA
  DiagnosticInviteBanner.jsx         dashboard nudge for an incomplete/unstarted diagnostic
pages/student/diagnostic/
  DiagnosticIntro.jsx  → DiagnosticRun.jsx  → DiagnosticResult.jsx
```

**Adding a question type** = one new component in `questions/` implementing `{question, onChange, disabled} → void`, one line in `QuestionRenderer`'s `REGISTRY`, and a matching `case` in the backend's `AnswerChecker::check()` + `DiagnosticEngine::toPublicQuestion()`. No branching logic anywhere else needs to know the full set of types.

**Why the diagnostic doesn't reuse `useAdaptiveExercise`** (the lesson system's hint/retry/solution-reveal state machine, `apps/web/src/lessons/common/hooks/`): that hook's whole purpose is scaffolding a student toward a correct answer within one exercise (hints, "voir la solution," multiple attempts) — the opposite of what a diagnostic needs, which is one clean, unscaffolded data point per question, then move on. Reusing it would mean either fighting its API to disable the parts a diagnostic can't use, or quietly leaking the correct answer via its hint ladder. `DiagnosticRun.jsx` implements its own minimal two-phase flow (`answering` → `feedback`) instead — a genuinely different, simpler state shape. It does keep the same result-shape philosophy (`{isCorrect, fields?, feedback?}` from `EXERCISE_CONTRACT.md`) as its qualitative reference, just decided server-side instead of by a client-side `validate` function.

**Feedback tone**: no red/green, no "Correct !"/"Faux !" banner, no per-question explanation — a neutral acknowledgement (`"On continue."`, `"Pas de souci, on continue."`, picked from a small varied set) and a single "Continuer" button. The lesson system's red/green `AdaptiveFeedback` is correct for *that* context (practice, immediate correction is the point) and wrong for this one (assessment, where over-explaining after every answer would bias the remaining responses and turn the diagnostic into a lesson).

**Progress**: `DiagnosticProgress` grows with each answered question but caps short of 100% until the engine actually signals completion (`Math.min(0.92, askedCount / 18)`, then snaps to 100%) — an honest "still going" signal instead of "Question 7/15," which would either be meaningless (variable length) or imply a fixed target that keeps moving.

## 11. Student flow and entry points

```
Visitor → Register (email+password) → Choose grade
  → grade === '6e' → Diagnostic intro → Run (adaptive) → Result → First mission
  → any other grade → straight to the student space (no diagnostic exists yet)
```

Existing 6e students who skip or exit mid-diagnostic aren't blocked from anything — `DiagnosticInviteBanner` on the dashboard (`StudentHome.jsx`) offers to start/resume, and disappears once `status === 'completed'`. `isDiagnosticAvailableForGrade()` (`diagnosticService.js`) is the one frontend place that knows which grades have a diagnostic — `ChooseGrade.jsx` and the banner both defer to it rather than hardcoding `'6e'` independently, mirroring the backend's own `DiagnosticEngine::PROVIDERS` map.

**Recommendation logic** (`ProfileBuilder::recommend()`): the lowest-tier `gap` skill, or failing that the lowest-tier `reinforce` skill, or failing that (everything mastered) a fixed capstone fallback (`resolution-problemes`, module 1). Picking the *lowest-tier* gap is equivalent to picking the true frontier/root-cause gap without a separate frontier-detection pass: because the engine only ever tests a skill once its prerequisites are resolved (§4), if a downstream skill is a gap, either its prerequisite is fine (so this really is the root cause) or its prerequisite is *also* a gap — in which case that prerequisite has a strictly lower tier and sorts first automatically. This is why Student B (one fragile fraction skill, everything else fine) gets pointed at exactly that skill, and Student C (foundational gap) gets pointed at the foundation, never at a downstream symptom.

**The "first mission" link goes to the recommended lesson's index page, not `startingPoint.moduleNumber` directly** — found live, not anticipated: every 6e `lesson.config.js` has `sequentialUnlock: true`, so `ModuleLayout`/`isModuleUnlocked` locks any module beyond 1 for a student with no progress on that lesson yet, regardless of how its URL was reached. Deep-linking straight into, say, module 3 would land on a "Module verrouillé" screen instead of the intended question — confirmed by driving the actual flow in a browser. Respecting that existing, working locking behavior (rather than changing it for this feature) means the recommendation's precision lives in *which lesson* gets picked and in `moduleTitle` as descriptive context ("au programme, notamment : « … »" on the result screen), not in a direct deep link — the student still starts at module 1 of the right lesson, which is also arguably the better first look anyway (the whole mission roadmap, not one bare module).

## 12. What this phase deliberately did not build

- **5e/4e/3e/2nde/lycée diagnostics** — the engine supports them architecturally (§1, §13); no content exists yet.
- **Any AI component.** The engine is 100% deterministic rule-based logic. The data it persists (per-response evidence, misconceptions, skill confidence) is structured so a future AI layer could consume it for personalized explanations or teacher summaries, but nothing here calls a model.
- **Misconception detection for `classification`/`numberline`** — correctness only, by design (§6).
- **Cross-session mastery / longitudinal tracking.** Each diagnostic session's assessments are scoped to that session; there's no "your mastery of X across your whole history" rollup. A student can retake the diagnostic (a new `POST /diagnostic/sessions` after completion starts a fresh session) but nothing links the two attempts together yet.
- **Admin tooling** for authoring questions/skills outside of editing the PHP provider file directly, or for viewing a student's diagnostic results.
- **Gamification** (leaderboards, XP, timers) — explicitly excluded per the brief; the existing lesson system's XP/streak mechanics are untouched and not extended into the diagnostic.

## 13. Adding Diagnostic 5e later

The concrete steps, so this stays a content problem, not an engine rewrite:

1. Trace 5e's real curriculum the same way §2 did for 6e: read `packages/core/curriculum/coursesData.js`'s 5e entries and every `apps/web/src/lessons/college/5e/**/lesson.config.js` that exists once 5e lessons are built (none are today). Build a competency graph from real `skills[]`/`prerequisites`, not an invented one.
2. Create `app/Domain/Diagnostic/Grades/CinquiemeDiagnosticProvider.php` implementing `GradeDiagnosticProvider` — same shape as `SixiemeDiagnosticProvider`: a `SKILLS` map (tiers, prerequisites, importance, starting points) and a `QUESTIONS` map (3-4 per skill, varied representations, misconceptions where genuinely well-defined).
3. Register it: `DiagnosticEngine::PROVIDERS['5e'] = CinquiemeDiagnosticProvider::class`.
4. Add `'5e'` to the frontend's `DIAGNOSTIC_AVAILABLE_GRADES` (`apps/web/src/services/diagnosticService.js`) once ready to expose it — this alone turns on the `ChooseGrade`/`DiagnosticInviteBanner` entry points for 5e students.

Nothing in `DiagnosticEngine`, `AdaptiveSelector`, `MasteryModel`, `AnswerChecker`, `ProfileBuilder`, the controller, the routes, the migrations, or any frontend component needs to change. If a genuinely new *question representation* is needed for 5e content, that's the one exception — see §10's "adding a question type."
