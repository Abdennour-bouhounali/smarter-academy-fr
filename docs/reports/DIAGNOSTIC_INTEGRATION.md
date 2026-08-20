# Diagnostic Integration

How the existing 6e diagnostic (unchanged by this migration) becomes the
FIRST SOURCE OF TRUTH for a student's initial knowledge inside the new
learning-point architecture. Companion: `docs/architecture/DIAGNOSTIC_6E.md`
(the diagnostic's own spec), `docs/architecture/LEARNING_ARCHITECTURE.md`.

## 1–6. The existing diagnostic, as found (audit)

- **Architecture**: `app/Domain/Diagnostic/` — `DiagnosticEngine`
  (orchestrator), `Contracts/GradeDiagnosticProvider` (grade plugin
  interface, only `6e` registered), `Grades/SixiemeDiagnosticProvider`
  (content: 13 skills, question bank, lesson paths, starting points),
  `Support/{AdaptiveSelector, AnswerChecker, MasteryModel, ProfileBuilder}`
  (pure, unit-tested).
- **Questions** live in PHP (code is the source of truth); the client is a
  thin renderer/transport (`diagnosticService.js` computes nothing).
- **Adaptive logic**: skills form a prerequisite DAG; `AdaptiveSelector`
  skips skills whose prerequisites resolved as confirmed gaps, re-verifies
  detected misconceptions first, and staircases difficulty; hard cap 24
  questions, per-skill cap 4 — maximum information, minimum questions.
- **Scoring**: confidence 0..1 per skill (`MasteryModel`, learning rate 0.22,
  difficulty-weighted), statuses `mastered ≥ 0.70` / `gap < 0.40` /
  `reinforce` between.
- **Storage**: `diagnostic_sessions` (with the terminal `profile_summary`
  JSON snapshot), `diagnostic_responses`, `diagnostic_skill_assessments`
  (unique per session + skill — per-session by design).
- **Result interpretation**: `ProfileBuilder` → `{strengths, reinforce,
  gaps, recommendation}`; the UI deliberately never shows a raw score.

**None of the above was modified.** The full `DiagnosticFlowTest` +
`Unit/Diagnostic/*` suites run unchanged as the regression gate.

## 7. Learning-point mapping

Diagnostic **skills** (13, adaptive-graph granularity) and **learning
points** (~50 across 6e, curriculum granularity) are different vocabularies
at different granularities. They are NOT force-unified:

- `learning_points.diagnostic_skill_id` is a nullable, **advisory** string
  column — populated only where a genuine correspondence was verified
  (`database/seeders/DiagnosticSkillLinkSeeder.php`, 4 links today), null
  everywhere else. Analysis of considered-and-rejected mappings:
  `DIAGNOSTIC_COVERAGE.md`.
- Nothing in the diagnostic reads or writes this column.

## 8. Initial baseline creation

The baseline **already exists** the moment a diagnostic completes: the
session's persisted `profile_summary` plus its per-skill assessments. The new
profile API surfaces it verbatim as `initialKnowledge` — one entry per grade
with a completed diagnostic (latest per grade; in-progress sessions are not a
baseline):

```
GET /api/v1/students/me/learning-profile
{
  "profile": {
    "initialKnowledge": [{ "source": "diagnostic", "grade": "6e",
                           "completedAt": …, "profile": {strengths, reinforce, gaps, recommendation} }],
    "currentMastery":   [{ "grade": "6e", "lessons": [{ "lesson": …,
                           "learningPoints": [{code, status, confidence, …, diagnosticSkillId}] }] }]
  }
}
```

## 9. How lesson evidence relates to the baseline

It doesn't touch it — by construction. Lesson evidence lives in
`learning_evidence` / `student_learning_point_progress` (keyed by user +
learning point); the baseline lives in the diagnostic tables (keyed by
session + skill). There is no code path from one to the other, which is a
stronger guarantee than guard logic. Regression-tested:
`StudentLearningProfileTest::test_lesson_evidence_never_touches_the_diagnostic_baseline`
asserts the diagnostic rows are byte-identical after lesson submissions
(including incorrect ones).

Timeline the data model now supports:

```
diagnostic → initial baseline (frozen)
lesson assessments → evidence → current mastery (live)
future re-diagnostic → a NEW session/baseline (the old one remains history)
```

## 10. What remains for future adaptive learning

- **Recommendation engine**: combine `initialKnowledge.gaps` with
  `currentMastery` statuses to recommend prerequisite lessons and unlock
  content. The data model supports it; no engine was built (per the brief:
  don't build an adaptive engine now).
- **5e/4e/3e diagnostics**: register new `GradeDiagnosticProvider`s — the
  engine, schema, and profile API need no changes.
- **Richer skill↔LP links**: as diagnostic question banks grow, more
  `diagnostic_skill_id` links can be verified and seeded.
- **Re-assessment flows**: a fresh diagnostic after study creates a new
  baseline; the profile could later expose baseline history per grade.
