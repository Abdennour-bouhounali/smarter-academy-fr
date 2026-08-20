# Migration Audit — Slice 1

What the curriculum/learning-point migration found, decided, and shipped.
Architecture: `docs/architecture/LEARNING_ARCHITECTURE.md`. Coverage:
`LEARNING_POINT_COVERAGE.md`. Diagnostic: `DIAGNOSTIC_INTEGRATION.md`,
`DIAGNOSTIC_COVERAGE.md`. Curriculum sync: `CURRICULUM_SYNC_REPORT.md`
(generated).

## Starting state (audited before any change)

| Area | Found |
|---|---|
| Curriculum | Entirely in `packages/core/curriculum/coursesData.js` (official JSON + `smaMetadata` merged by `buildChaptersForGrade`). No curriculum tables in MySQL. `pointsToLearn` = informal learning points as bare strings. |
| Diagnostic | Complete, tested, self-contained `app/Domain/Diagnostic` module (6e only): adaptive, server-graded, per-session skill assessments, terminal `profile_summary`. |
| Lesson progress | 100% client-side localStorage (`useProgress`, `smarter_lesson_{id}`, XP). **No server-side progress/mastery of any kind.** |
| Lessons | 9 implemented 6e lessons; questions inline in module JSX, no shared staging taxonomy in 6e (3e has a lesson-level `assessment` config block + module `style` field). |
| Dead code | `apps/web/public/smarter-ui/lesson.js` — orphaned pre-React runtime with an incompatible `smarter_completed_lessons` key (flagged, untouched). |

## Key decisions

1. **`pointsToLearn` stays authored; `learningPoints` is derived** from it in
   `buildChaptersForGrade` (`{gradeId}_{lessonId}_P{n}`) — zero risk to
   existing readers; append-only discipline enforced by the validate command.
2. **Diagnostic skills ≠ learning points** — two vocabularies, disjoint
   tables, one advisory nullable `diagnostic_skill_id` column (4 verified
   links seeded, 9 skills deliberately unmapped — see DIAGNOSTIC_COVERAGE.md).
   `app/Domain/Diagnostic` not modified in any way.
3. **Baseline-never-overwritten by construction**: diagnostic tables (session
   + skill keys) and mastery tables (user + learning-point keys) share no
   code path; regression-tested byte-identity.
4. **Trust boundary**: lesson `isCorrect` is client-computed (questions live
   in JSX by design); the server owns relationship validation (student from
   token, LP codes must resolve to one lesson matching the URL) and mastery
   bookkeeping. Deliberate, documented asymmetry from the diagnostic.
5. **Lesson codes are not globally unique** (discovered during
   implementation: `resolution-problemes`, `proportionnalite`, etc. repeat
   across grades). Evidence submission therefore disambiguates through the
   globally-unique learning-point codes; the validator indexes lessons by
   `grade:code`.
6. **Retire, never delete**: learning points missing from the source get
   `retired_at`; hard deletion would cascade-orphan evidence.

## Shipped

**Backend** — 7 migrations (`grades`, `chapters`, `lessons`,
`learning_points`, `learning_evidence`, pivot, `student_learning_point_progress`);
6 thin models; `app/Domain/Curriculum` (pure `CurriculumDiffer` +
transactional `CurriculumImporter`); `app/Domain/Progress` (parallel
`MasteryModel`, `ProgressEngine`, pure `LearningProfileBuilder`);
`smarter:import-curriculum` (idempotent, `--dry-run`, `--from-json`);
`smarter:validate-curriculum` (report + `--strict`);
`POST /api/v1/lessons/{lessonCode}/evidence`;
`GET /api/v1/students/me/learning-profile`; `DiagnosticSkillLinkSeeder`.

**Frontend/core** — `learningPoints` derivation (+ JSON import attribute so
plain Node can load `coursesData.js`); `exportCurriculum.mjs` (the JS↔PHP
boundary); `learningEvidenceService`; offline-safe `evidenceQueue`
(localStorage, flushed on reconnect, 422s dropped not wedged);
`useEvidenceSubmission` hook; `scripts/validate-lessons.mjs`
(`npm run validate:lessons`).

**Pilot lesson** — `resolution-problemes` fully classified (BossMission =
practice, FLASH = assessment), 2 generated questions filling the P3/P5
coverage gaps, 6/6 learning points covered, evidence wired end-to-end.

**Import run** — 8 grades, 36 chapters, 79 lessons, 297 learning points;
second run 100% unchanged (idempotency verified live and in tests);
`CURRICULUM_SYNC_REPORT.md`: in sync, no drift.

## Test results

- Laravel: **126/126 passing** (59 new across
  `CurriculumDifferTest`, `Progress/MasteryModelTest` incl. threshold
  lockstep guard, `CurriculumImportTest`, `LearningEvidenceFlowTest`,
  `StudentLearningProfileTest`; all pre-existing suites — including the full
  diagnostic regression suite — untouched and green).
- Core (vitest): 112 passing (5 new `learningPoints` derivation tests).
- Web (vitest): 6 passing (`evidenceQueue` — first tests in apps/web).
- `npm run validate:lessons`: pass, `6e:resolution-problemes 6/6`.
- Note: this environment's PHP 8.5 lacks `pdo_sqlite`; the Laravel suite runs
  against a dedicated MySQL database (`smart_academy_test`). CI environments
  with `pdo_sqlite` can keep using the in-memory sqlite config in
  `phpunit.xml` unchanged.

## Deferred (explicit)

The 8 remaining 6e lesson migrations (template in
`LEARNING_POINT_COVERAGE.md` §Process); `validate:lessons --strict` as the CI
gate once they're done; profile UI; question difficulty metadata; the
adaptive recommendation engine; `smarter-ui/lesson.js` cleanup.

No `MIGRATION_REVIEW_REQUIRED.md`: the single judgment call (BossMission
classified as practice) is documented with rationale in
`LEARNING_POINT_COVERAGE.md` and left no learning point uncovered.
