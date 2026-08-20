# Diagnostic 6e — Report

Placed in `docs/reports/`, per this repo's convention for point-in-time phase reports (see `docs/architecture/DIAGNOSTIC_6E.md` for the living architecture this report complements).

## What was found

No diagnostic feature, no id-based competency/prerequisite graph, and no real mastery model existed anywhere in the codebase — confirmed by repository-wide search before writing anything. This was genuinely greenfield, but every architectural precedent needed already existed: the grade-as-free-text-catalog pattern (`users.grade`, validated against `packages/core`'s catalogue, not a DB enum) was the direct model for how the competency graph and question bank should be stored (in versioned PHP code, not database rows); the bearer-token API was already client-agnostic; the `{isCorrect, fields?, feedback?}` exercise-result shape was already the documented convention worth building on qualitatively, even though the diagnostic couldn't reuse the lesson system's hint/retry state machine itself (see architecture doc §10 for why). Backend audit found zero foreign-key constraints anywhere, no service layer, no `FormRequest`/Policy classes, and no JSON-column precedent — a clean slate with a clear house style (inline `$request->validate()`, private `formatX()` camelCase serializers, `{success, ...}` response shape) to match.

## Decisions made up front

- **Competency graph and question bank live in PHP code** (`SixiemeDiagnosticProvider`), not database tables — same reasoning as `packages/core/curriculum/coursesData.js` not being database-driven. Only genuinely dynamic, per-student data (sessions, responses, skill assessments) got new tables — 3 total, each with real `->constrained()->cascadeOnDelete()` foreign keys (nothing in this domain should outlive its parent).
- **The engine is grade-agnostic**; every 6e-specific fact flows through one interface (`GradeDiagnosticProvider`). Adding 5e later is registering one new class, not touching the engine.
- **Correctness is decided server-side**, via a small, deliberately-scoped PHP re-implementation of answer-checking (exact match, numeric tolerance, fraction cross-multiplication, sequence/set equality) — not a port of `packages/core`'s compute-engine algebraic comparator, and not reused from the client. The 6e question bank was authored around answer shapes simple enough to check this way.
- **Two lesson-side shared widgets were deliberately NOT reused** (`OrderingGame`, `InfoSorter`): both bake the correct answer directly into their own props and self-validate client-side with detailed red/green feedback — exactly right for ungraded lesson practice, exactly wrong for a graded diagnostic (answer-key leak in the DOM, and feedback richer than the diagnostic's neutral-acknowledgment UX rule allows). New capture-only widgets (`OrderingQuestion`, `ClassificationQuestion`) mirror their tap-to-place interaction without either problem. `ChoiceGrid`/`NumberField`/`NumberLine` were reused as-is — verified against their real source that none of the three receives the correct answer as a prop or self-validates.
- **No AI.** Misconception detection is explicit per-question metadata (a wrong-answer signature → a misconception id) plus two structural rules (fraction numerator/denominator swap, exactly-reversed ordering) — deterministic, auditable, nothing calls a model.

## What changed

**Backend** — see `docs/architecture/DIAGNOSTIC_6E.md` for the full design; summary here:
- 3 migrations: `diagnostic_sessions`, `diagnostic_responses`, `diagnostic_skill_assessments`.
- 3 models: `DiagnosticSession`, `DiagnosticResponse`, `DiagnosticSkillAssessment`; `User::diagnosticSessions()` relation added.
- `app/Domain/Diagnostic/`: `Contracts/GradeDiagnosticProvider.php`, `Grades/SixiemeDiagnosticProvider.php` (13 skills, 50 questions), `Support/{AnswerChecker,MasteryModel,AdaptiveSelector,ProfileBuilder}.php`, `DiagnosticEngine.php`.
- `DiagnosticController.php` (start/current/respond) + 3 routes under `auth:sanctum`.
- `User.php`: doc comment only (role stays a free-text column, no schema change for future account types — unrelated to this feature but touched in a prior phase and referenced here for context).

**Frontend**:
- `services/diagnosticService.js`, `hooks/useDiagnosticSession.js`.
- `components/diagnostic/`: `QuestionRenderer.jsx` (registry), 6 question widgets, `DiagnosticProgress.jsx`, `SkillProfileList.jsx`, `RecommendationCard.jsx`, `DiagnosticInviteBanner.jsx`.
- `pages/student/diagnostic/`: `DiagnosticIntro.jsx`, `DiagnosticRun.jsx`, `DiagnosticResult.jsx`.
- `App.jsx`: 3 new routes under `/espace` (outside `StudentLayout` — a standalone flow, same pattern as the existing `ChooseGrade` onboarding step).
- `ChooseGrade.jsx`: picking 6e now routes to the diagnostic intro instead of straight to `/espace` (any other grade: unchanged).
- `StudentHome.jsx`: `DiagnosticInviteBanner` inserted above the existing "continue lesson" card.

## Bugs found and fixed along the way

All four were caught by driving the actual flow live (backend `tinker`/`curl` and a real browser against the real dev servers) — none surfaced in isolated unit tests, which is exactly the category of bug that category of testing can't catch.

1. **Negative response-time crash (real MySQL only).** `now()->diffInMilliseconds($presentedAt)` returned a small negative float for a near-instant answer — Carbon 3's diff methods are signed by default, and the stored `timestamp` column's precision vs. the live clock could tip a genuinely-tiny elapsed time negative. Failed to insert into an `unsignedInteger` column, crashing the submission. Never reproduced against the test suite's SQLite backend (different precision handling) — only found by submitting an answer against the project's actual configured MySQL database. Fixed with plain integer millisecond-timestamp subtraction floored at 0, not a Carbon diff call.
2. **Blank page on the diagnostic's last question.** The hook nulled out `question` the instant a completing response came back, but the page still needed to render that (now-answered) question, disabled, under the completion feedback and "Voir mon profil" button — the early-return `if (!question) return null` fired first, showing nothing. Found by driving a real session to completion in a browser and watching the last question disappear instead of showing the finish button.
3. **Recommended module always locked.** The first-mission link pointed at `startingPoint.moduleNumber` directly — but every 6e lesson has `sequentialUnlock: true`, so `ModuleLayout` locks any module past 1 for a student with no progress on that lesson, regardless of how its URL was reached. Confirmed by actually clicking the CTA and landing on "Module verrouillé." Fixed by linking to the lesson's index page instead (module 1, already unlocked) — preserves the existing, working lesson-engine locking behavior rather than changing it, and arguably a better first look anyway (the whole mission roadmap, not one bare module). `moduleTitle` is still shown as descriptive context on the result card.
4. **The "few questions for a strong student" requirement wasn't actually met.** A consistently-correct run hit the full 24-question ceiling, not a short diagnostic — traced to `MIN_ATTEMPTS_BEFORE_EARLY_STOP = 2` forcing every one of the 13 skills through a flat two-question minimum regardless of how decisive the first answer was, and separately, the "boosted starting confidence" mechanism's own trigger threshold (0.85) being mathematically unreachable by the normal two-attempt resolution path (~0.72–0.82), so it silently never fired. Fixed by allowing single-attempt resolution when confidence is decisive (≥0.78, stricter than the normal 0.70 bar) and unifying the "boost trigger" and "decisive" thresholds into one constant so a boosted skill's own resolution can itself trigger the next tier's boost — verified this cascades through all 4 tiers, not just one. A consistently-correct run of the real content now resolves all 13 skills in 15 questions.

## Testing performed

**Backend** — 90 tests total (was 25 before this phase; +65 new), `./vendor/bin/pint` clean:
- 48 unit tests (`tests/Unit/Diagnostic/`): `AnswerCheckerTest` (all 6 representations, tolerance edges, misconception signatures, malformed-input safety), `MasteryModelTest` (confidence formula asymmetry, status bands, single-vs-multi-attempt sufficiency including the decisive-threshold cascade), `AdaptiveSelectorTest` (tier ordering, transitive gap-blocking two tiers deep, misconception-verification priority, difficulty targeting, question-bank exhaustion, the `MAX_QUESTIONS` ceiling), `ProfileBuilderTest` (the three named student journeys — strong/mixed/foundational-gap — against a synthetic graph, plus "never guess a status for an untested, non-inferable skill").
- 16 feature tests (`tests/Feature/DiagnosticFlowTest.php`): session start/resume idempotency, unsupported-grade rejection, unauthenticated/cross-user access (404, not 403), the response-time regression, resume returning the same pending question, stale-question-id rejection (409), idempotent response replay (no double-counted evidence), a **full adaptive run to completion twice** — all-correct (15 questions, 13/13 mastered, 0 gaps) and all-incorrect (short, dominated by inferred gaps) — against the real 50-question content, completed-session rejecting further responses, restart-after-completion, and confirming a wrong answer never leaks `misconceptionId` to the client.

**Frontend build** — `npm run build` succeeds throughout.

**Live end-to-end**, driven against the project's real dev servers and real MySQL database (Puppeteer + system Chrome, mobile viewport 420×860, matching this repo's established live-verification pattern from prior phases):
- Full registration → grade selection (6e) → diagnostic intro → adaptive run → result → first-mission-click, twice: once with a deliberately mixed/guessing answer strategy (completed in 5 questions once both tier-0 skills confirmed as gaps, correctly inferring all 11 downstream skills as gaps without testing them, recommending the true root-cause skill) and once answering every question correctly via the real provider's own answer key (completed in 15 questions, 13/13 mastered, correctly fell back to the capstone recommendation).
- All 6 question representations individually confirmed rendering and submitting correctly in the browser: `choice`, `numeric`, `numberline` (via the two full runs above) and `fraction`, `ordering`, `classification` (via 3 directly-seeded sessions, since the adaptive algorithm's natural paths in the two full runs didn't happen to select those specific representations before completing) — zero console errors in every case.
- Resume-after-refresh: the same pending question is returned before and after a hard page reload mid-diagnostic.
- The corrected first-mission link confirmed landing on the lesson index (not a locked-module screen).
- All test accounts and their cascaded sessions/responses/assessments deleted afterward; temporary `puppeteer-core` install (`--no-save`) left `package.json`/`package-lock.json` untouched; no stray files or processes left in the repository.

## What this phase deliberately did not build

Per the brief and the architecture doc's §12: 5e/4e/3e/2nde/lycée diagnostics (the engine supports them architecturally; no content exists yet), any AI component, misconception detection for `classification`/`numberline`, cross-session/longitudinal mastery tracking, admin authoring tooling beyond editing the PHP provider file, and gamification. The existing lesson system, its progress model, its authentication system, and its curriculum catalogue were not modified beyond the two integration points this feature genuinely needed (`ChooseGrade`'s post-selection redirect, `StudentHome`'s dashboard banner) — no second progress system, no second auth system, no second curriculum system was introduced.

## Final safety check

No destructive migration, no dropped table, no deleted student/lesson data. Working-tree diff scoped to: 3 new migrations (additive only), 3 new models, `User.php`'s one added relation, the `Domain/Diagnostic` tree, `DiagnosticController.php` + 3 new routes, the frontend diagnostic components/pages/service/hook, `App.jsx`'s 3 new routes, `ChooseGrade.jsx`'s one-line redirect change, `StudentHome.jsx`'s one banner insertion, this report, and `docs/architecture/DIAGNOSTIC_6E.md`. All test/debug data created during live verification was deleted from the real database afterward.
