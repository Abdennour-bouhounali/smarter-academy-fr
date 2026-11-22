# Exercise Contract

> **Read § 0 first (2026-09-20).** This document was written for the French-era
> lessons and canonicalised `useAdaptiveExercise`'s result shape. **That hook,
> `useSimpleExercise`, `ExerciseValidator`, `GuidedSolution` and `QuizQuestion`
> were dead code and were DELETED on 2026-09-29** (no importer anywhere;
> `AdaptiveFeedback` remains, unused by the 4AM lessons). The passages below that
> name them are history. The rest of this document is still correct about the
> **non-blocking invariant** and about what a validator should return, and § 0
> describes the two systems that actually run.

---

## 0. The two exercise systems that actually exist

| | **A — lesson exercises** | **B — the practice engine** |
|---|---|---|
| Where the content lives | `content/exercises.js` inside the lesson | JSON in `content/practice/<grade>/<lesson>/level-{1..5}/` |
| Rendered by | `TextbookExercise` inside a `ContentModule` step | `PracticeSession` + `QuestionRenderer` in the student space |
| Evaluated by | the kit's question components, or `practice.evaluateAnswer` for `integerSet` and `fraction` | `practice.evaluateAnswer` for every type |
| Persisted | **nothing per exercise** — only module completion | server: sessions, exercise and question attempts, hint events, evidence |
| Touches mastery | no (instructional — decision D9) | yes (`assessment_type: 'practice_exercise'`) |
| Judged by | the browser | **the server** (Mastery V2) — the browser's verdict is only an instant preview |

A third source of evidence is the **final test** (`BossFinal`, `evaluation`
stage): MCQ only, writes evidence with `assessment_type: 'assessment'`.

**The live evaluation contract is `practice.evaluateAnswer`** in
`packages/core/practice/answerEvaluator.js`, and its **server twin**
`App\Domain\Practice\Support\AnswerEvaluator` (PHP, since 2026-09-24). Both
return an **outcome, not a boolean**:

```
correct · equivalent_correct · partially_correct · incorrect · syntax_error · abandoned
```

`syntax_error` deliberately does not move mastery: not knowing how to write a
number is not getting the number wrong. Comparison is exact rational
arithmetic — `Math.abs(a-b) < ε` is banned from the comparison path, so 0.1 +
0.2 equals 0.3 and 7.5 equals 15/2.

`correct` vs `equivalent_correct`: the same value written differently (« 3/2 » for « 1,5 ») is
`equivalent_correct` (the student is told it is another valid writing). The decimal COMMA and the
decimal POINT are the SAME writing (owner, 2026-10-07): « 1.5 », « 1,5 » and « 1٫5 » are all `correct`
when the key is « 1,5 » (`sameWriting()` in JS, `AnswerEvaluator::sameWriting` in PHP, shared fixture
`rational-decimal-dot-same-writing`).

Answer types: `choice`, `multiChoice`, `rational`, `affine`, `interval`,
`point`, `integerSet`.

**`MathLive is not used.`** The dependency is installed and `MathInput.jsx`
wraps it, but nothing imports that component. `compareMathExpressions` and the
compute-engine path are likewise unused by any live page. Free algebraic input
does not exist: answers are choices, rationals, sets, intervals or points, all
exactly comparable.

**Lesson exercise entry shape** (`content/exercises.js`), as authored in all
eight 4AM lessons:

```js
{
  id: 'ex-1',                                   // unique in the lesson; also the DOM key
  source: src('ex-1', 14, 'أوظّف تعلّماتي', 1),  // textbook provenance, always
  learningPointId: LP.P2,                        // documentation only — nothing reads it
  difficulty: 'facile',                          // label only — no ordering, no selection
  statement: '…',                                // the textbook's words
  interaction: 'choice',                         // choice | trueFalse | numeric | integerSet
                                                 // | fraction | batch | reasoning
  question: { /* shape depends on `interaction` */ },
  method: '…',                                   // NOT rendered today
  commonError: '…',                              // rendered under the exercise
}
```

There is **no schema and no validator** for this file, unlike the practice JSON
(`content/practice/_schema/exercise.schema.json`).

**Retry and blocking, as implemented:** a lesson exercise has no retry and no
attempt limit. The answer is revealed immediately, `onAnswered(isCorrect)` fires
unconditionally, and the controls disable. In the practice engine there are two
different « again »:

- **« أعد المحاولة » inside an open question** re-uses the same attempt id: the
  server treats the second submission as a duplicate and **only the first
  outcome counts** for mastery. The retried answer is still **judged on its
  own**: the response carries the evaluation of the NEW answer, with
  `duplicate: true` and `recorded: false`, and nothing is written. (Before the
  2026-09-24 answer audit the server echoed the first verdict, so after one
  wrong pick no answer — not even the right one — was ever accepted on retry.)
  The practice screen counts a correct answer in its session score only when
  `recorded !== false`.
- **Opening the same question again later** (a new session, or a revisit)
  creates a new attempt (`attempt_number + 1`) and a new evidence row. The
  mastery engine classifies it — `retry_after_failure` or
  `repeat_after_success` — and weighs it accordingly
  ([`LEARNING_ARCHITECTURE.md`](./LEARNING_ARCHITECTURE.md) § « Repetition »).
  Unlimited practice is encouraged; it cannot farm mastery.

### Server-side evaluation (Mastery V2, 2026-09-24)

`POST /practice/sessions/{id}/answers` takes `{attemptUuid, answer, outcome?}`.
The server evaluates `answer` against the question from the content
(`ExerciseRepository`) with the PHP evaluator, stores that outcome on
`question_attempts` (`evaluated_by = server`) and on the evidence, and returns
it as `evaluation {outcome, isCorrect, misconceptionId, normalized,
feedbackKey}` — **the verdict the screen shows**. The client's `outcome` is a
prediction for its instant feedback: compared, logged on disagreement
(`evidence.disagreement`, `question_attempts.client_outcome`), never decisive.
`mastery.server_evaluation=false` is the rollback switch.

The two evaluators are held equal by ONE fixture,
`packages/core/practice/fixtures/answers.json` (168 cases generated by running
the JS evaluator), consumed by `answerEvaluator.fixtures.test.js` and
`tests/Unit/Practice/AnswerEvaluatorFixtureTest.php`. Rules: regenerate the
fixture only from the JS side; when PHP disagrees, fix PHP. Two subtleties the
port reproduces: JS `\d`/`\s` are ASCII-/JS-specific (PHP uses `[0-9]` and
an explicit whitespace class), and `normalizeNumeric` strips `;`.

### Outcome semantics — one table for everything

| Outcome | Mastery | Success rate (`OutcomeStats`) |
|---|---|---|
| `correct`, `equivalent_correct` | full positive evidence | success |
| `partially_correct` | weak positive (×0.4), not a distinct success | partial — in the denominator |
| `incorrect` | negative | failure — in the denominator |
| `syntax_error`, `abandoned` | inert | excluded, reported as `inert` |

`successRate = successes / (successes + partials + failures)`. The student's
practice summary, the student dossier, the teacher's class view and the admin
analytics all use `App\Domain\Progress\Support\OutcomeStats`.

---

*(Historical paragraph.)* Three exercise patterns once existed with no shared contract (`docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md` §6); this document canonicalised the strongest one — the result shape of the since-deleted `useAdaptiveExercise` hook. The shape itself remains the rule for any validator.

## The canonical Exercise Result

```js
// What a validator must return — this shape already exists and is now consistently
// produced by every useAdaptiveExercise consumer in the codebase (verified: pythagore-3e
// and racines-carrees module families, post cleanup-phase fix).
{
  isCorrect: boolean,        // REQUIRED.
  fields?: { [key: string]: boolean },  // Optional — per-field correctness for multi-input exercises.
                                          // If omitted, the hook treats the whole exercise as one field.
  feedback?: string,          // Optional — a SPECIFIC message for this wrong answer. If omitted,
                               // the hook falls back to the module's generic guidanceSteps hint ladder.
}
```

Any pure validation function must return this shape (never a bare boolean). It says nothing about progression: the kit's question components call `onAnswered(isCorrect)` unconditionally.

## Non-blocking progression — HARD INVARIANT

> **An incorrect answer MUST NEVER block lesson progression.** It is
> pedagogical evidence, not a progression lock. Every validated interaction
> MUST provide targeted feedback and a clear recovery path. The learner MAY
> retry, be guided, see the solution, or continue — retry MUST NOT be
> mandatory to continue.

Violating this is a **RELEASE BLOCKER**.

Four systems, deliberately **decoupled** — a failed validation MUST NOT by
itself imply `nextActivity.disabled = true`:

| System | Question |
| --- | --- |
| **Validation** | is the answer correct? (`{isCorrect, fields?, feedback?}` above) |
| **Feedback** | what reasoning error did the learner make? |
| **Evidence** | what does this tell us about the Learning Point? |
| **Progression** | can the learner continue? |

The Exercise Result shape carries `isCorrect` for validation, feedback and
evidence. It says **nothing** about progression, and no consumer may derive
progression from it alone. Concretely, the kit calls `onAnswered(isCorrect)`
unconditionally; a module completes its step on *answered*, never on
*answered correctly*:

```jsx
- onAnswered={(ok) => { if (ok) setQ2(true); }}   // dead end
+ onAnswered={() => setQ2(true)}
```

An exercise that genuinely warrants retry uses a bounded-attempts component
that ends by revealing the solution and calling `onDone(false)`
(`BuildCheck`, `ProofOrder`) — the way out always exists.

Enforced by `npm run check:non-blocking`, part of `npm run check:lessons`.
Full rule: `LESSON_CONTRACT.md` § Progression non bloquante.

## Answer validation boundary

Two paths exist, one per exercise system (§0). Neither lets the client decide
anything that counts for mastery.

```
IN-LESSON (formative, no evidence)              PRACTICE BANK (evidence)
Student input — component-local state           Student input — PracticeSession
     │                                               │
     ▼                                               ▼
Normalise + parse                               evaluateAnswer (packages/core/practice/
  NumericQuestion  → parseFr (integers)           answerEvaluator.js) — client preview only
  TextbookExercise → parseDec (numeric)              │
  FractionQuestion → Rational.parse                  ▼
  IntegerSetQuestion → parseIntegerSet          SERVER judge (apps/api/…/Practice/Support/
     │                                            AnswerEvaluator.php) — the authority; kept
     ▼                                            equivalent to the JS by the shared fixture
verdict → Feedback (correction always shown)      packages/core/practice/fixtures/answers.json
     │                                               │
     ▼                                               ▼
onAnswered(isCorrect) — the step is done         evidence → versioned mastery engine
whatever the verdict (non-blocking)
```

The final test (`BossFinal`) is a third, choice-only path: the client sends the
picked index (`{ picked }`), the server judges it against the assessment-item
registry (Mastery V2, `LEARNING_ARCHITECTURE.md`).

`packages/core/validation/` (`validateNumericAnswer`, `validateChoiceAnswer`)
still exists and is tested, but no live lesson calls it: its consumers were the
French-era modules and the `useAdaptiveExercise` hook, deleted on 2026-09-25 and
2026-09-29 respectively.

### Student input normalisation — one rule for every parser (2026-09-29)

The interface is Arabic: an Arabic keyboard types « ١٢ », and a writing
convention is never a mathematical error. Every parser of student input
therefore goes through `toLatinDigits` (`packages/core/numberFormat.js`), and
its PHP mirror `Rational::latinDigits`.

| Input | Integer (`parseFr`) | Numeric (`parseDec`) | Fraction (`Rational.parse`) | Integer set (`parseIntegerSet`) |
|---|---|---|---|---|
| Arabic-Indic ٠–٩, Persian ۰–۹ | accepted | accepted | accepted | accepted |
| `.` | only as a well-formed thousands separator (`4.582`); `81.0`, `1.2` → not a number | decimal point | decimal point | only a TRAILING dot is dropped; `1.5` stays a syntax error |
| `,` / Arabic `٫` | `,` → not an integer | decimal separator | decimal separator | `,` `،` `؛` `;` are separators |
| spaces, thin/nbsp | ignored | ignored | ignored | separators |
| `0x12`, `5e1` | not a number | not a number | syntax error | syntax error |
| `{…}`, `\{…\}`, « و » | — | — | — | accepted as set notation / separator |
| `∕` (U+2215) | — | — | read as `/` | — |

Before this rule, `parseFr` deleted every dot (« 81.0 » accepted as 810, « 810.0 »
refused as 8100), refused « ٨١٠ », `Rational.parse` refused « ٣/٤ » as a syntax
error (ending the one-attempt question), and `TextbookExercise` used `Number()`
(accepting `0x12`). Changing a practice parser is a CONTRACT change on both
sides: add fixture cases produced by executing the JS evaluator (never written
by hand) and run `AnswerEvaluatorFixtureTest` in PHP.

**Size bound (2026-10-02).** A `Rational` numerator or denominator may be any safe
integer, up to 2⁵³ − 1 (`MAX_SAFE_COMPONENT` in `rational.js` and `Rational.php`).
Cross-products and sums are computed exactly, in `BigInt` (JS) and `bcmath` (PHP), and a
result whose terms leave the bound is `null`. Before this date the bound was
⌊√(2⁵³ − 1)⌋ = 94 906 265, so a typed answer such as 132 000 000 (unit 6, ex-27: a flow
in L/min) was a `syntax_error` and the bank had to make it a choice question. It is a typed
`rational` again. An answer above 2⁵³ − 1 is still a `syntax_error`, and so is a decimal
with more than 12 places. Fixtures: `rational-large-integer-*`,
`rational-above-max-safe-integer-is-syntax-error`, `rational-max-safe-integer-is-read`.

## Exercise types the contract must support (not force into one component)

Per the phase brief: multiple choice, numeric, fraction, algebra, ordering, matching, interactive manipulation, graphical, free response. The contract above only constrains the **validate → result** boundary — it says nothing about rendering, so `NumberLine`, `OrderingGame`, `InfoSorter`, `AnswerBuilder`, `GroupBuilder`, and free-form `MathInput` remain exactly as different as they need to be. What's shared is only: "however you validate, return `{isCorrect, fields?, feedback?}`."

## Attempt model

> **Outdated (2026-09-20).** The table below says attempts are not persisted.
> That was true for lessons and is **still true for system A**, but the practice
> engine persists them: `practice_sessions`, `exercise_attempts`,
> `question_attempts`, `hint_events`, and `learning_evidence` carry `outcome`,
> `level`, `hints_used` and `misconception_id`. Mastery is a real,
> evidence-driven value in `student_learning_point_progress` — not a completion
> proxy. Read the row below as "for in-lesson exercises only".

### Original text (lessons only)

An attempt should eventually capture:

| Field | Belongs to | Exists today? |
|---|---|---|
| `student` | backend | Identity exists as of Phase 4 (`User` with `role='student'`) but nothing links an attempt to one — Attempt itself is still unimplemented. See §1 of ARCHITECTURE.md. |
| `exercise` / `module` id | frontend, derivable | Yes — module id is known at the call site |
| `answer` (raw student input) | frontend at time of attempt | Yes, but never persisted past the current render |
| `isCorrect` | frontend, derivable | Yes — the Exercise Result above |
| `timestamp` | either | No |
| `attemptNumber` | frontend | `useAdaptiveExercise` tracks `attempts` in memory, but **it's never read by anything and never persisted** — confirmed by grep, unchanged this phase |
| `hintsUsed` | frontend | `hintLevel` exists in the hook's internal state, not exposed or persisted |
| `timeSpent` | frontend | Not tracked anywhere |
| `competency` | backend, once competencies exist | No |

**Decision for this phase:** do not add an `attempts` table or start persisting attempt-level data. The reason isn't that it's unimportant — it's the single biggest gap for the eventual mastery/analytics system — but adding persistence for it means designing the backend attempt model *and* wiring a sync boundary, which is explicitly future-phase work (dashboards, mastery engine, analytics — §23 of the brief). What this phase does instead: make sure the frontend already computes every field above in a form that's trivial to send once that boundary exists (the Exercise Result shape carries `isCorrect`; `useAdaptiveExercise`'s `attempts`/`hintLevel` are already there, just unexposed). No architecture decision made now would need to be undone to add this later.


## Phase 8 additions (2026-09-18)

- **`answerType: 'integerSet'`** — a set of natural numbers (« عيّن كل قواسم العدد 84 »). Free separators, Arabic-Indic digits accepted; order and duplicates ignored; a strict subset is `partially_correct`. Evaluator `packages/core/practice/answerEvaluator.js` (`parseIntegerSet`), widget `features/practice/inputs/IntegerSetInput.jsx`.
- **`evaluationPolicy.requiredForm: 'irreducible'`** is now **enforced** for `rational`: a value-equal but non-reduced fraction yields `partially_correct` with `feedbackKey: 'notIrreducible'` (`feedback.notIrreducible`). A **decimal** (`1,75` for `7/4`) is not an irreducible fraction either: it is `partially_correct` / `notIrreducible` too, unless the value is an integer (2026-09-24 answer audit; JS and PHP evaluators and the fixture).
- **`content/practice/policy.json`** — per-lesson coverage minimum with a named source, read by `validate-exercises.mjs` (invariant 12). The default 3 × 5 is unchanged for every other lesson.
- **`metadata.source`** — textbook provenance of an exercise file, read by `scripts/check-textbook-coverage.mjs`.

## Mastery V2 additions (2026-09-24) — metadata for large and generated banks

All optional, all validated by `validate-exercises.mjs` and the schema:

| Field | Level | Meaning | Read by |
|---|---|---|---|
| `templateId` | exercise | the family shared by VARIANTS (other numbers/context, same primary learning point and `answerType` per question — enforced) | mastery engine (`variant` demonstration), selector |
| `variantOf` | exercise | provenance: the exercise this one varies | nobody (audit) |
| `generator: {tool, version?, seed?}` | exercise | provenance of a GENERATED exercise | nobody (audit) |
| `difficulty` (1..5) | question | when a question is easier/harder than its exercise's level (default: the level) | assessment-item registry → mastery engine |
| `cognitiveDemand` (`recall`/`apply`/`transfer`/`reason`) | question | explanation only — never a weight | explanation |

**A generated exercise needs nothing else.** If it passes
`npm run validate:exercises -- --strict` and `smarter:import-content-registry`,
it is mastery-ready: the registry indexes its questions (learning points,
roles, difficulty, template, answer key) and the engine handles it without a
line of code. Measured on synthetic banks of 15 → 2 500 exercises: validation
0.20 s → 0.32 s, registry export 1.2 s → 1.6 s, and every hot request (answer
write, profile, class × LP, replay) issues the same number of queries
(`tests/Feature/Scale/MasteryScaleTest.php`). `SMARTER_PRACTICE_ROOT` lets both
scripts read a synthetic bank.

## Answer-key integrity (2026-09-24 answer audit) — permanent checks

An answer key is content, and content can be wrong. Three gates, none of which
trusts the configured key:

1. **Round trip** — `validate-exercises.mjs` (`checkAnswerKeyRoundTrip`) runs
   every practice question through the real `evaluateAnswer`: the key must be
   accepted, **every** choice distractor must be rejected, and no
   `misconceptionSignature` may itself be a correct answer.
2. **Independent oracle** — `scripts/practice-answer-oracle.test.mjs` recomputes
   the answer of every constructed-answer practice question of EVERY grade (it walks `content/practice/[1-4]am` since
   2026-10-14; it read only `4am` before, so a 1AM bank would have been silently skipped) from the
   mathematics (its own gcd, divisor lists, reduced fractions, searches) and
   asserts the evaluator accepts it and the configured key equals it. A new
   constructed-answer question **fails the test until it gets an oracle entry**.
   It also pins the reported case (`qasim-adad-tabii` l3-001 q2: only A).
3. **Lesson keys** — `validate-lessons.mjs --strict` checks, in live `moyen/`
   lessons, that every assessed option object and every `<TapQuestion>` has an
   explicit `correct` index inside its option range (no silent default to 0).

4. **Option order in the final test** (2026-09-29) — authors put the right
   answer first (36 of the unit's 45 final-test keys were index 0, so always
   clicking the first option scored ≈ 80 % on the only source of mastery
   evidence). `BossFinal` now shows every question's options in a stable,
   per-question DISPLAY order (`optionOrder(id, n)` in
   `lessons/common/kit/testPresentation.js`, seeded by the question id: the same
   order on the student page and on the board). The picked index, the stored
   attempt, the evidence and the registry `correct` all stay in the AUTHOR's
   index space — write `correct` as the index in your `options` array, as
   before. `keepOrder: true` on a question keeps the written order (a scale, a
   « صحيح / خاطئ »).

Writing rules the audit enforced: a distractor must be **false**, not merely
"not the textbook's argument" (a second valid proof is a second right answer);
a bound in a statement must say whether it is strict (`40 < a < 55`); a
question that asks for an intermediate form (« بعد القسمة على 4 ») is a choice,
not a `rational` (which would accept every equal value).

## A practice question may be served alone — the daily challenge (2026-09-25)

The daily challenge (`DAILY_CHALLENGE.md`) picks single QUESTIONS from the
practice bank and serves each one alone: the exercise `statement` (text +
`visual`) above the question `statement`, rendered by the same
`QuestionRenderer`. Consequences for authors: a question should be
answerable from the exercise statement and its own text (a question that
needs the answer of the previous question reads badly out of context);
`feedback.correct` is shown as the one-line explanation after the verdict,
so it should explain, not just congratulate. For the challenge the server
serves the question **without** its answer key (`expectedAnswer`, choice
`isCorrect`, signatures, hints, feedback) and reveals the correction only
after the answer — the practice player still receives the full JSON (D5).
Exercises with an interactive `support` lab are not excluded by the
selector; none exists in the live bank.

## The `expression` check lives in the thinking lab, not in practice (2026-10-30)

The thinking space « مختبر التفكير » checks answers with `answer.check`, using `integer`, `number`, `rational`,
`expression` or `choice`.

- **Reused:** `integer`, `rational` and `choice` delegate to this contract's evaluator (`answerEvaluator.js` /
  `AnswerEvaluator.php`) and its outcomes.
- **Not a practice answer type:** `expression` (equivalence by evaluation at seeded points, `ExpressionEvaluator.php` ↔
  `packages/core/thinkingLab/expression.js`) and `number`. Do not add them to `SUPPORTED_ANSWER_TYPES` or to the
  exercise schema.

Contract: [`THINKING_LAB.md`](./THINKING_LAB.md) §4.

## Platform-generated practice exercises (2026-09-30)

For unit 2 « الحساب على الجذور » the owner asked for **10 exercises per level ×
5 levels = 50 per lesson**, generated by the platform to test each learning
point (the textbook alone cannot supply them). They are declared, never passed
off as the textbook:

- `metadata.source = { type: "platform_addition", reason: "practice_generation",
  learningPoint: "<the primary LP>", modelledOn: "<an extraction element of the
  SAME lesson, or null>" }`, title « تدريب — <topic> »;
- the lesson's `policy.json` entry says `minPerLevel: 10` with a source naming the
  textbook AND the generation (six lessons of unit 2);
- every rule of this contract still applies: one primary LP per question and
  every LP of the lesson primary on ≥ 8 questions; a real difficulty ladder
  (L1 recognition → L5 problem situations); distractors false and tagged with a
  `misconceptionId` (unit-2 ids added to `misconceptions.json`); graded hints
  that never reveal the answer; each question standing alone; an ORACLE entry
  recomputing every answer (`scripts/practice-answer-oracle.test.mjs`);
- `check:textbook` ignores `modelledOn` (it is not a citation), so a generated
  exercise never counts as coverage of a textbook element.

**Unit 3 « الحساب الحرفي » (2026-10-01)** follows the same rule (four lessons ×
50). Algebra adds one constraint: the bank uses only `choice` and `rational`. A
quadratic, a factored form or an intermediate form is a `choice` whose every
distractor is FALSE as a polynomial (proved in the oracle with an exact
polynomial comparison); a typed answer is a number — a coefficient of the
reduced expansion, a value for a given x, a mental-calculation result.
`affine` is not used: its two-field input is labelled slope / intercept, which
reads wrongly for « the coefficient of x in an expansion ». Oracle entries are
per lesson in `scripts/practice-oracle/<lesson>.mjs`, built on the independent
calculator `scripts/practice-oracle/helpers.mjs`.

**Unit 4 « معادلات ومتراجحات » (2026-10-01)** follows the same rule (five lessons × 50, 250 exercises,
`choice` and `rational` only). An equation's solution is a `rational` (exact fractions accepted through
`Rational.parse`); an equation WITHOUT solution, a solution SET (two roots of a zero product), an inequality's
solution set or its number-line picture is a `choice` whose every distractor is false — the oracle checks a set
of roots exactly and replays a modelling story by brute force; a typed inequality answer is a NUMBER (the bound,
the largest whole number of messages, the first whole number of sessions). A QCM item with two correct options
(textbook « أؤكّد تعلّماتي » 5 and 7) becomes, in the bank, ONE choice whose options are combinations
(« (1) و (3) »), and in a lesson a « يحقّق / لا يحقّق » batch.

**Unit 5 « جمل معادلتين » (2026-10-01)** — four lessons × 50, 200 exercises, and the FIRST bank to use
`answerType: "point"`: a system's solution is a ثنائية, typed in the textbook's order as
`"expectedAnswer": { "x": "13", "y": "19" }` (exact fractions `"-1/2"`, `"68/19"`, decimals with a comma accepted
through `Rational.parse`; one right number is `partially_correct`). The student types it in `PointInput`, whose
row is isolated `dir="ltr"` since that day (an RTL flex row drew « ) y ; x ( »). `answerFormat` names the shape
(« الثنائية (x ; y) ») and never the values. The oracle gives a point as `P(x, y)` and recomputes it with
`solve2` (Cramer in exact rationals, `scripts/practice-oracle/helpers.mjs`, independent of
`packages/core/arithmetic/linearSystem.js`) or by replaying the story by brute force; the oracle test checks that
the content's key EQUALS the recomputed pair (not only that it is accepted). « Which system translates the story »
items are `choice`, each option an equation re-read in the oracle (exactly one must give the story's pair); a
textbook QCM with two or three correct options becomes ONE choice among combinations, and in a lesson a
« صحيح / خاطئ » batch. In-lesson answers use `TextbookExercise`'s `interaction: 'pair'` (`PairQuestion`, same
evaluator; `names: ['a', 'b']` for the textbook's (a ; b) and (d ; t)). New misconceptions: `MISC-JUMLA-*`,
`MISC-TAWID-*`, `MISC-JAM-*`, `MISC-TAKHFID-NISBA` (`content/practice/misconceptions.json`).

**Statistical charts — unit 8 « الإحصاء » (2026-10-08).** A statement that SHOWS a chart draws it: `statement.figure` with
`{ kind: 'chart', type: 'bar' | 'histogram' | 'line' | 'pie', … }` is drawn by `StatChart` (`lessons/common/components/StatChart.jsx` +
`statChart.js`, schema in the module header) — مخطط بالأعمدة (`bars: [{ label, value }]`), مدرّج تكراري (contiguous rectangles,
`edges` + `values`, optional `polygon: true` = مضلّع التكرارات through the tops' midpoints), مضلّع / المضلّع المجمّع (`x: { min, max, step }`,
`points: [[x, y]]`), مخطط دائري / نصف دائري (`parts: [{ label, value }]`, `half`, `show: 'value' | 'angle' | 'percent' | 'none'` = the number
written in each sector, computed from the values so it can never contradict the drawing; the category names are written inside the sectors only when EVERY sector can hold its name (all or none),
and every category is in a legend — MathText, so a class « $10 \le a < 20$ » is a formula). Reading rules enforced by `validateStatChart`:
a bar / rectangle / vertex value is NOT printed (unless `values: true`), so it must fall on a gridline — a multiple of `y.step / y.minor` —
or the chart is refused as unreadable; bar names shrink to fit their slot and stagger on two rows below 11 px (360 px phones); `missing: true` (bar, sector) or `missing: [i]` (class) = the part the student completes, drawn
dashed with « ؟ » (a `polygon` with a missing class is refused: it would give the answer away); ≤ 12 bars or classes; Arabic `ariaLabel`.
The chart body reads left to right (`dir="ltr"`, ARABIC_RTL_CONTRACT « Charts read left to right »); axis titles (`xTitle`, `yTitle`) are
Arabic DOM text. One switch for every statement figure: `StatementFigure.jsx` (render — `ExerciseStatement`, `ExamSheet`,
`ProblemSupport`) and `validateStatementFigure` (`statementFigure.js` — `validate-exercises.mjs`, `guidedProblem.js`) dispatch on `kind`
(plane by default, `space`, `chart`). A chart's data is never transcribed into a table with « نُقلت … إلى الجدول » any more. A SPREADSHEET grid (« المجدول », unit 8 lesson 3) is a
`statement.table` with `sheet: true`: read left to right like Excel, head `['', 'A', 'B', …]`, consecutive row numbers in the first
column — checked by the validator (ARABIC_RTL_CONTRACT « Spreadsheet formulas are LTR code »).

**1AM unit 2 « الجمع والطرح » (2026-10-14) — the tape diagram « مخطط بأقواس ».** A `statement.figure` may be
`{ kind: 'tape', parts: [{ label, value?, unknown? }, …], whole: { label, value?, unknown? }, ariaLabel }` (2 to 4 parts), drawn by
`lessons/common/components/ArcTape.jsx` (data and layout in `arcTape.js`): one line cut into the parts, an arc above each part with its
label, an arc below the whole — the textbook's representation of a sum or a difference, the unknown written □, △ or ؟ in rose. Labels
read left to right (an Arabic label right to left); lengths are schematic. `validateArcTape` (through `validateStatementFigure`) refuses
an unknown key, a missing label, a non-Arabic `ariaLabel` and a tape whose given values do NOT add up (« a statement figure is true »).
Use it for « مثّل الوضعية بمخطط » steps and for « which diagram fits the story? » choices.

**Unit 14 « الهندسة في الفضاء » (2026-10-05) — figures in SPACE, values with π.** A `statement.figure` may be a figure of space:
`{ kind: 'space', … }` is drawn by `SpaceFigure` (`lessons/common/components/SpaceFigure.jsx` + `spaceFigure.js`: 3D points with z up,
an orthographic view, spheres with their equator, polyhedra from faces, vertical cylinders / cones / frustums, circles, planes, sections,
segments — the textbook's convention: SEEN lines solid, HIDDEN lines dashed, computed from the view) and validated by `validateSpaceFigure`
(`StatementFigure` / `validateStatementFigure` dispatch on `kind`); every bank figure passes `spaceFigureQuality(fig)`. A value « بدلالة π »
is either a `choice` (36π vs 12π, 4π/3 …, distractors = the formula errors `MISC-MISAHA-*`, `MISC-HAJM-*`) or a `rational` asking the
COEFFICIENT k of kπ, the statement saying so; a rounded area / volume is `rational` with the rounded key (unit 10's rule); an exact surd radius
(√119/4, 2√3) is a `choice`. The oracle recomputes with `Math.PI` and its own formulas, never `packages/core/arithmetic/space.js`.
Misconceptions `MISC-KURA-*`, `MISC-MISAHA-*`, `MISC-HAJM-*`, `MISC-MAQTA-*`, `MISC-TAKBIR-*`, `MISC-MABTUR-*`, `MISC-MURAKKAB-NISF`,
`MISC-TADWIR`, `MISC-WAHDA`, `MISC-SAA-WAHDA` (each lesson's author added its own: the reverse calculations `MISC-MISAHA-JADHR` / `-RUB`,
`MISC-HAJM-JADHR`, the ratio taken from the base `MISC-MAQTA-NISBA`, `MISC-TAKBIR-BUUD` / `-JADHR`, the forgotten ⅓ `MISC-MABTUR-THULTH`…).

**Units 11–12 « الأشعة » (2026-10-04) — vectors in statements, components as pairs.** A `statement.figure` may carry
`vectors` (arrows), `grid` (squared paper), `axes` (the repère), `arcs` (semicircles) and `circles`, and every bank figure passes `figureQuality(fig)` (no strip, no colliding label — the owner's
figure rule, LESSON_DEVELOPMENT_GUIDE §5); a coordinate figure may instead be `visual` (CoordPlane `arrows`). A pair of components or of
coordinates is `answerType: "point"` (unit 5's type); an exact distance (√13, 3√2) is a `choice`, a rounded one `rational`; a vector
expression (« AB + BC = ? ») and a nature (« ما طبيعة الرباعي؟ ») are `choice` with meaningful false distractors. Misconceptions
`MISC-SHUAA-*` (unit 11) and `MISC-MAALAM-*` (unit 12).

**Unit 10 « حساب المثلثات في المثلث القائم » (2026-10-04) — approximate and exact values, without a new answer type.**
Trigonometry answers are of two natures. A **rounded value** (BC ≈ 5,92 cm, x ≈ 43°) is `answerType: "rational"` whose key is the
ROUNDED number (`"5.92"`), the statement stating the precision (« المدوّر إلى الجزء من 100 », « إلى الوحدة ») — rounding is the skill
assessed, so 5,915 is wrong; its oracle recomputes the value with `Math.sin/cos/tan` in degrees and rounds it with its own code (never
`packages/core/arithmetic/trigonometry.js`). An **exact surd** (3√13/13, √21/5, 10 cos 55°) has no answer type: it is asked as a
`choice` whose distractors are the meaningful errors (inverted ratio `MISC-MUTH-NISBA-MAQLUBA`, the wrong side, the forgotten root
`MISC-MUTH-JADHR-NASI`, the impossible value > 1 `MISC-MUTH-AKBAR-MIN-WAHID`). An exact rational ratio (4/3, 35/37) stays `rational`.
The unit's misconceptions are `MISC-MUTH-*` (`content/practice/misconceptions.json`).

**Unit 9 « خاصية طالس » (2026-10-02) — a statement may carry a drawn GEOMETRIC FIGURE.** Geometry exercises
depend on a figure, and the practice player had only `visual` (a `CoordPlane`: a repère with axes). An exercise
statement may now carry **`statement.figure`**, a DECLARATIVE figure drawn in SVG by the shared
`lessons/common/components/GeoFigure.jsx` (data model and layout in `geoFigure.js`):

```json
"figure": {
  "points": { "A": [0, 4], "B": [-2, 0], "C": [3, 0], "M": [-1, 2], "N": [1.5, 2] },
  "segments": [["A", "B"], ["A", "C"], { "from": "B", "to": "C", "label": "10" },
               { "from": "M", "to": "N", "label": "x", "arrows": 1 }],
  "ariaLabel": "مثلث ABC و (MN) يوازي (BC)"
}
```

Points are named, in free units with y UP; `segments` (label, `ticks` 1–3 for equal lengths, `arrows` 1–2 for
parallels, `dashed`, `bold`, `tone`), `lines` (`through` two points, `name` « (d) », `extend`), `rays`,
`polygons` (tinted triangles), `rightAngles` (`[a, vertex, b]`), `angles` (`at`/`from`/`to`, `label` « 40° »),
`labels` (forced label directions), `hidden` (helper points), `ariaLabel` (ARABIC, required), `maxWidth`,
`caption`. Point names and lengths are LTR text inside the SVG. It is rendered by `ExerciseStatement` (practice
player, daily challenge question and review — the server's `ChallengeQuestionPresenter` passes `figure` like
`visual`), and `validate:exercises` runs `validateGeoFigure` on it (unknown key, unknown point, unknown tone or a
missing Arabic `ariaLabel` fail). **Rule:** a statement that says « في الشكل المقابل » / « لاحظ الشكل » carries a
`figure`; otherwise everything the question needs is stated in words. Lessons use the same component for the
textbook's figures (one drawing language for the lesson and its bank).
Inside a `<p>` (a `BossFinal` question prompt) pass `inline`: the figure renders as `<span>` blocks instead of
`<figure>`/`<figcaption>` (otherwise React reports invalid DOM nesting). Labels are drawn at 13–14 px on a layout normalised to
~300 units, so keep `maxWidth` close to the figure's natural width (≥ ~300 px) — a smaller box makes the letters unreadable. The
unit-9 banks generate their `statement.figure` from the lesson's own `content/figures.js` (one drawing source for lesson and bank).

The four unit-9 banks (4 × 50 exercises, `rational` and `choice`) test the REASONING of a figure or a construction: equal ratios,
a fourth proportional, k and reduction / enlargement, « parallel or not » with the order of the points, how many equal marks, which
mark to join, AM/AB from MA/MB, inside or outside the segment, a constructed length (√ compared on exact squares in the oracle).
New misconceptions `MISC-TALIS-*` (`content/practice/misconceptions.json`): the segment instead of the side in a ratio, an inverted
ratio, adding instead of multiplying by k, k inverted, the area multiplied by k, Thales without parallels, the forgotten order
condition, equal approximations as a proof, marks counted instead of parts, MA/MB vs AM/AB, the diameter for the radius, a result
unfit for reality, and the synthesis / construction ones added by their authors.

## Non-textbook sources — worksheets (2026-09-24)

The textbook is the default source, but the owner may bring **other official
exercise sheets** (first case: « سلسلة التفوق رقم 01 », BEM 2021,
`docs/official-exerices/exercices-aadad-tabiiya-natiqa.pdf`). Such a sheet is
integrated into the **practice bank** under its own provenance, never passed
off as the textbook:

1. **Provenance file** `docs/sources/<grade>/<unit>/worksheet-<id>.json`:
   `worksheetId`, title, file, and one entry per element (`ws01-ex-05`,
   `ws01-sit-07`…) with its `destination {lesson, exercise}`, an `adaptation`
   note when the wording had to change, or `destination: null` +
   `notIntegrated` with the reason.
2. **Each exercise** cites it: `metadata.source = {type: "worksheet",
   worksheetId, elementId, section, number}`; title « سلسلة التفوق، تمرين n —
   <topic> » (same « n — topic » form as textbook titles, which the session
   header splits at the dash).
3. **Destination** = the lesson whose learning point the item practises;
   integration situations (« وضعيات ») go to the unit's synthesis lesson
   (`wadiya-idmajiya-aadad`, LP `…_P1`), whose practice is activated in
   `active.json` with a named `policy.json` source.
4. **Checks:** `check:textbook` verifies both directions (every element has
   one destination or a reason; every cited element exists; worksheet ids are
   never mistaken for textbook ids — mutation-tested); every constructed
   answer gets an **oracle** entry; `validate:exercises --strict` round-trips
   keys and refuses hints that reveal the answer.
5. **The sheet is not trusted either.** Where its mathematics is ambiguous the
   wording is corrected and declared (`adaptation`): «بين 25 و 40» written
   `25 < a < 40` (inclusive reading gives 3 answers); «جد العدد x» asks for
   all values (15 **and** 30 satisfy both divisions); «جد x» → «جد d» (the
   named unknown). An item outside the unit's learning points (scientific
   notation, ex. 14 q2) is **not integrated** rather than tagged with a wrong
   learning point.
6. **Going live:** an imported exercise is born `published` when its lesson is
   published (`draft` otherwise), and a `draft` one under a published lesson is
   published at the next sync (owner, 2026-11-11); `hidden` / `archived` stay
   admin acts and are kept. Changing a LESSON's state in the admin gives that
   state to all its exercises too (« publish the lesson, everything is
   published »); one exercise can then be hidden alone. The server caches `active.json` and the
   exercise index (`practice.cache_ttl`, 1 h): the deploy runs
   `cache:clear`; locally run `php artisan cache:clear` after adding files.

## Présentation examen (BEM) — the exam sheet (2026-10-06; rollout to every lesson approved 2026-10-06)

**Status: the standard practice format, rolled out UNIT BY UNIT.** The prototype lesson
`bahth-pgcd` (« البحث عن القاسم المشترك الأكبر لعددين طبيعيين ») has it since 2026-10-06; the
owner approved extending it to every lesson the same day. The owner wants the practice bank to
feel like the شهادة التعليم المتوسط exam, in its look and its wording.
Source: `docs/official-BREVET-exams/`, which holds the 2007–2025 annals and the solutions
booklet. The PDF text layer is garbled, so render the pages with `pdftoppm -r 150` and read
the images. **The corpus index** — every exercise of the 19 sessions, its points, pages, the
lesson that owns it and the lessons of its steps — is
`docs/sources/4am/bem-practice/annals-index.md` (+ `.json`). Authors' brief:
`docs/sources/4am/bem-practice/brief-authors.md`; per-unit brief, lock and audit in
`docs/sources/4am/bem-practice/rollout/unit<N>/`.

**Switching a lesson on.** A lesson's levels page is the BEM page when the lesson is listed in
`content/practice/exam-style.json` (read by `exam/examSheet.js` → `isExamLesson`). It is the
only switch; nothing in the code names a lesson. `scripts/validate-exercises.mjs` refuses a
listed lesson that is not active or whose bank still has an exercise without `metadata.exam`,
and in `--strict` wants 10 sheets per level; a lesson whose bank is partly converted but not
listed only warns and keeps the classic page. The server needs no switch: it reads
`metadata.exam` exercise by exercise (`ExamSheetAnyLessonTest` proves the chain on another
lesson).

**Owner decisions for the rollout (2026-10-06).**
- Each lesson's current bank is REPLACED IN PLACE, ids kept (`ex-4am-<lesson>-lN-NNN`): existing
  exercises become `kind: adapted`. Attempts and mastery evidence stay attached to their ids;
  no DB migration (cache clear + registry re-import).
- Order: pilot unit 2; then, at the owner's request (2026-10-06), ONE LESSON AT A TIME (no parallel
  authors), from the oldest lesson added to the platform to the newest: unit 1, then units 3 → 14.
- A lesson with no annals exercise (all of units 8 and 14, regular polygons, most of unit 1)
  gets « على منوال BEM <year> » and adapted sheets only, never an « official » badge.
- A step of a paper that uses a skill of an earlier year or of another lesson (Pythagoras,
  fraction arithmetic, scientific notation…) stays as printed with `counted: false`.
- Level 5 receives NEW « الوضعية الإدماجية (08 ن) » sheets; the lesson's « مسائل » modules and
  « أتوقّع القاعدة » stay in the lesson, unchanged.
- Photo answers and teacher validation are on in every converted lesson; production runs the
  scheduler (`smarter:answer-images:purge`). Free / premium status is unchanged.

**Status by unit** (number of annals exercises the index assigns to the unit's lessons):

| Unité | Leçons | Annales citées (index) | État |
|---|---|---|---|
| 1 « الأعداد الطبيعيّة والأعداد النّاطقة » | 9 | 9 | **basculée** (2026-10-07) — 9 leçons, 450 feuilles, aucune annale propre hors bahth-pgcd (« على منوال » + adapted) |
| 2 « الحساب على الجذور » | 6 | 12 | **basculée** (pilote, 2026-10-06) — 6 leçons, 300 feuilles |
| 3 « الحساب الحرفي » | 4 | 18 | **basculée** (2026-10-07) — 4 leçons, 200 feuilles, 18 sujets officiels |
| 4 « معادلات ومتراجحات » | 5 | 3 | **basculée** (2026-10-07) — 5 leçons, 250 feuilles |
| 5 « جمل معادلتين » | 4 | 5 | **basculée** (2026-10-07) — 4 leçons, 200 feuilles |
| 6 « الدالة الخطية والتناسبية » | 6 | 0 | **basculée** (2026-10-07) — 6 leçons, 300 feuilles |
| 7 « الدالة التآلفية » | 6 | 15 | **basculée** (2026-10-07) — 6 leçons, 300 feuilles, 15 sujets officiels |
| 8 « الإحصاء » | 5 | 0 | **basculée 2026-10-08** (5 leçons, 250 feuilles) — aucune annale, « على منوال » + adapted ; diagrammes dessinés (StatChart), grilles de tableur `sheet: true` |
| 9 « خاصية طالس » | 4 | 10 | **basculée 2026-10-08** (4 leçons, 200 feuilles) — 10 officiels (2007–2023), figures GeoFigure exactes vérifiées par l'oracle, `figureQuality` exigé ; réciproque = deux rapports saisis puis décision |
| 10 « حساب المثلثات » | 5 | 7 | **basculée 2026-10-08** (5 leçons, 250 feuilles) — 7 officiels ; Pythagore compte dans tarrid-muthallathiya (P3), Thalès dans la synthèse (P1) ; figures `space` (SpaceFigure) sur feuille d'examen |
| 11 « الأشعة والانسحاب » | 5 | 1 | en attente (leçon par leçon, après l'unité 1) |
| 12 « الأشعة في معلم » | 5 | 12 | en attente (leçon par leçon, après l'unité 1) |
| 13 « الدوران والزوايا والمضلّعات المنتظمة » | 5 | 3 | en attente (leçon par leçon, après l'unité 1) |
| 14 « الهندسة في الفضاء » | 5 | 0 | en attente (leçon par leçon, après l'unité 1) |

**Opt-in per exercise.** An exercise is rendered as an exam sheet if and only if it carries
`metadata.exam`. Every other exercise keeps the classic card, unchanged.

### Data

The JSON schema file is not enforced; `scripts/validate-exercises.mjs`
(`validateExamPresentation`) checks these fields. The provenance rules (`source`, `kind`, `badge`) for both
examinations live in `scripts/lib/examProvenance.mjs`, tested by `scripts/exam-provenance.test.mjs`.

| Field | Values | Meaning |
|---|---|---|
| `metadata.exam.kind` | `official`, `excerpt`, `modelled`, `adapted` | `official`: an annal exercise, word for word. `excerpt`: the same, with steps outside unit 1 removed. `modelled`: « على منوال BEM <year> », the same wording with new numbers. `adapted`: an existing bank exercise rewritten in the exam register. |
| `metadata.exam.badge` | `BEM <year>` (official, excerpt) · `على منوال BEM <year>` (modelled, 4AM) · `على منوال اختبار الفصل الأول / الثاني / الثالث` (modelled, 1AM–3AM) · `null` (adapted) | The session ribbon. |
| `metadata.exam.heading` | « التمرين الأول »، « التمرين »، « الوضعية الإدماجية »… | Rendered « <heading>:(<points> ن) », as in the annals. |
| `metadata.exam.points` | « 03 »، « 02,5 »، « 08 » | Written as on the exam paper. |
| `metadata.source` | `{type:"bem", year, part:1\|2, exercise}` | For official / excerpt exercises; `part 2` = الوضعية الإدماجية. |
| | `{type:"platform_addition", reason:"bem_modelled", modelledOn}` | For modelled exercises (4AM). |
| | `{type:"term_exam", grade, semester, file, exercise}` | 1AM–3AM, modelled on ONE exercise of the term-exam corpus (§ « Term-exam provenance »). |
| | `{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"<g>am-s<n>"}` | 1AM–3AM, generated on the model of a term (§ « Term-exam provenance »). |
| | the original source + `adaptedFrom` | For adapted exercises. |
| `statement.formulas[]` | LaTeX strings | Centred on one line under the setup sentence. |
| `statement.table` | `{head, rows}` | Same shape as a مسألة table (`ProblemTable`). |
| | | **Every screen that shows a statement passes `formulas` and `table`** to `features/practice/ExerciseStatement.jsx`, which renders them like the exam sheet (since 2026-11-09: the practice session, its review, the teacher's player, the daily challenge and its review, Madar refuel and « بوصلتي » had shown `content` alone). A statement whose data lives in `formulas` is unanswerable without them. |
| `questions[].step` | « 01 »…« 06 » | Required, non-decreasing. |
| `questions[].sub` | ا / ب / ج / د | Optional sub-item. |
| `questions[].lead` | text | Optional. The step text that precedes its (ا)(ب). |
| `questions[].solution` | `{lines[], result?}` | Required: the model answer in the solutions booklet's style. `result` is LaTeX shown in a box; when it contains Arabic it is shown as plain text instead. |
| `questions[].counted: false` | boolean | The step is judged but is never mastery evidence. Used for a BEM step that belongs to another lesson, e.g. an irreducible fraction in a PGCD exercise. Such a step still carries one of the lesson's own learning points as its label (validator rule). |

**`answerType: "selfCheck"`** is for « بيّن أن »، « برّر » steps: proofs that cannot be
auto-checked. It has no `expectedAnswer`, `solution` is required, and it is never counted
for mastery (`countsForMastery`, in both JS and PHP).

| Step | Student does | Sent | Evaluator returns | Server |
|---|---|---|---|---|
| 1 | Writes the proof in a text box, clicks « سجّل إجابتي » | `{text}` | `abandoned`, `normalized: "self:pending"` | Records the attempt. The text is locked from now on. |
| 2 | The model answer opens under the locked text; the student ticks « مطابق / غير مطابق » | `{text, selfMark}` with the same text | `correct` / `incorrect` | `PracticeEvidenceRecorder::recordSelfMark` accepts one mark, refuses (422) any different text, and replays the stored verdict afterwards. Text is capped at 5000 characters. |

### Term-exam provenance (1AM–3AM, 2026-10-14)

The 4AM sheet simulates the شهادة التعليم المتوسط. A **1AM–3AM** lesson's sheet simulates the end-of-term exam
(« اختبار الفصل »). Its corpus is `docs/sources/moyen/exams/` (index `exams-index.json`, recipe
`EXAM_PATTERN.md` §6). The validator tells the two apart by the exercise's year (`ex-<grade>-…`).

- **Never `official` nor `excerpt`.** The term exams are school papers republished by a third-party site, with no
  official status; the owner allows « على منوال » only. No word-for-word copy, no session year.
- **`modelled` on one precise exercise** of the corpus: `metadata.source = {type:"term_exam", grade, semester,
  file:"<exams-index id>", exercise:n}`.
  - `file` must exist in `exams-index.json`, and `exercise` must be one of its exercises.
  - A `misfiled` paper counts for the grade and term of its **header** (`gradeInFile` / `semesterInFile`), not of
    its folder.
  - `2am-s2-61` (war context) is excluded.
- **`modelled` on a term's pattern only:** `metadata.source = {type:"platform_addition",
  reason:"term_exam_modelled", modelledOn:"<g>am-s<n>"}`. `modelledOn` is the exercise's own grade.
- **Badge:** « على منوال اختبار الفصل الأول » / « … الثاني » / « … الثالث ». Its term must equal `source.semester`
  (or the `s<n>` of `modelledOn`). `adapted` keeps `badge: null`.
- **Not allowed:** a 1AM–3AM exercise citing `bem`, and a 4AM exercise citing `term_exam`. The 4AM rules are
  unchanged.
- **Screen:** `examPaper(lessonCode)` (`examSheet.js`) reads the lesson's grade from the catalogue.
  - Paper title: « اختبار تجريبي — على منوال اختبارات الفصل » (`practice.exam.paper.titleTerm`).
  - Nav pill: « محاكاة اختبار الفصل » (`nav.simulationTerm`).
  - Level and subject take the grade number (`paper.levelValue` / `nav.subject`: « {{n}} متوسط »).
  - `examBadge` keeps the all-Arabic badge RTL (`ltr: false`); only « BEM yyyy » is an LTR island.
- **Status:** live since 2026-10-14 — the first 1AM–3AM bank is `content/practice/1am/mana-jam-tarh/` (50 sheets: 15 `term_exam`
  modelled on one corpus exercise each — `1am-s2-64` ex 4 with the « الفصل الثاني » badge —, 24 `term_exam_modelled` on `1am-s1`,
  11 `adapted` from the lesson's own textbook elements; `tape` statement figures; misconceptions `MISC-JAMTARH-*`).
  Second: `qisma-iqlidiya-baqi` (50 sheets, term-2 corpus; a bank may mix term badges — each sheet's badge matches its own
  source paper, `1am-s1-101` keeps « الفصل الأول »; misconceptions `MISC-IQLIDIYA-*`). Third: `qawaid-qabiliyat-qisma` (50 sheets, 14 `term_exam`; a corpus paper misfiled under term 2 whose header says term 3, `1am-s2-62`, gives « الفصل الثالث » — the badge follows the paper's HEADER; oracle decides by BigInt `n % d`; misconceptions `MISC-QABILIYA-*`). Batch 2 (2026-10-14): `kitabat-adad-tabii` (50 sheets, 14 `term_exam`, term 1; its own number speller cross-checked against the extraction; `MISC-KITABA-*`), `ikhtizal-kitaba-kasriya` (50 sheets; term-2 and term-3 badges follow each source paper — `1am-s3-37/39/43/47` → « الفصل الثالث »; every « أبسط شكل ممكن » key goes through `evaluationPolicy.requiredForm: "irreducible"`; `MISC-KASRIYA-*`) and the FIRST 2AM bank `content/practice/2am/qisma-iqlidiya-hasr/` (50 sheets, 15 `term_exam` on `2am-s1` papers, `modelledOn: "2am-s1"`, `MISC-HASR-*`; a `content/practice/<grade>/` folder is picked up by every reader without change; « راجع » toward the 1AM lesson comes from the net, nothing to author). Later banks: `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`. Batch 3 (2026-10-15): `hasil-qisma-kasr` (50 sheets, 207 questions: term-2 papers `1am-s2-72`, `-78`, `-64`, `-65` and the term-3 paper `1am-s3-37` modelled one exercise at a time, misconceptions `MISC-HASIL-*`, 19 `counted: false` steps of other lessons). Phase A (2026-10-20): the first 3AM geometry bank `content/practice/3am/khassiyat-fitaghuras/` (50 sheets, 196 questions; 16 `term_exam` on `3am-s2` / `3am-s3` papers — badges « الفصل الثاني / الثالث » from each paper's header, the misfiled 3AM paper `2am-s2-65` keeps its own header —, 27 `term_exam_modelled` `modelledOn: "3am-s2"`, 7 `adapted`; `MISC-FITAGHURAS-*`). Two geometry conventions it fixed: a corpus step that proves a triangle IS right (the converse, next lesson) is REPLACED by a « not right » step and cosine steps are dropped; a right-triangle `statement.figure` keeps its right-angle mark true, writes its lengths as plain labels (« 4,5 cm », GeoFigure draws no KaTeX), and a figure stretched to pass the 2 : 1 aspect rule says so in its caption « (الأطوال غير حقيقية) ». Its oracle `scripts/practice-oracle/khassiyat-fitaghuras.mjs` decides which side is the hypotenuse itself (add or subtract), and the longest side for every « not right » step, in exact BigInt rationals. The same day, the first 3AM numbers bank `content/practice/3am/quwat-adad-nisbi/` (50 sheets, 220 questions; 16 `term_exam` on `3am-s2-72`, `-76`, `-69`, `-78`, `-80`, `-83`, `3am-s3-51` and the misfiled 3AM paper `2am-s2-65`, 23 `term_exam_modelled` `modelledOn: "3am-s2"`, 11 `adapted`; 15 `MISC-QUWA-*`; 11 `counted: false` steps — fractions, powers of 10, scientific notation belong to other lessons). A « write as aⁿ » step asks for the EXPONENT n (`rational` cannot hold « 3^6 »); its oracle `scripts/practice-oracle/quwat-adad-nisbi.mjs` parses the statement's own expressions (signed integer exponents, the power binding before a unary minus: −3⁴ = −81), finds the unique n, and evaluates every `choice` option. Phase A entry 3 (2026-10-20): `content/practice/3am/tabsit-hadhf-aqwas/` (50 sheets, 194 questions, 69 `counted: false` steps — expansion and evaluation belong to the next lessons; 15 `term_exam` on `3am-s2-68/69/70/75/76/80/82`, `3am-s3-47/49/59` and the misfiled 3AM paper `2am-s2-65`, badges « الفصل الثاني / الثالث » from each paper, 35 `term_exam_modelled` `modelledOn: "3am-s2"`, no `adapted`; 16 `MISC-TABSIT-*`). Algebraic answers are `rational` / `choice` only (no expression answer type exists): the oracle `scripts/practice-oracle/tabsit-hadhf-aqwas.mjs` parses the statement's own expressions with its own exact polynomial code (`helpers.mjs`) and decides each key by evaluation at several values of x. Phase A entry 4 (2026-10-21): `content/practice/3am/nashr-jabri-3am/` (50 sheets, 202 questions, 48 `counted: false` steps — evaluation and equations belong to later lessons; 16 `term_exam` on `3am-s2-68/69/70/75/76/80/81/82`, `3am-s3-47/49/51/56/59` and the misfiled 3AM paper `2am-s2-65` ex 4, 11 `term_exam_modelled`, 23 `adapted` — one per textbook element the lesson's modules do not cite, so `check:textbook` is green; 14 `MISC-NASHR-*`). Same answer types as `tabsit-hadhf-aqwas` (`rational` / `choice`, never an expression type); two reusable conventions it fixed: a rectangle cut into parts is a plain `statement.figure` built from a grid of hidden points with labelled outer segments and tinted cells (« area two ways », « plot minus a path, the corner given back once »), and a final « decision » step (enough trees / budget / card matches) is a `counted: false` yes/no `choice` whose key the oracle recomputes from the situation's own numbers (`scripts/practice-oracle/nashr-jabri-3am.mjs`).

- **2AM `rabi-mutanasib` (2026-10-21):** `content/practice/2am/rabi-mutanasib/` — 50 sheets (7 `term_exam`, all 2AM term 3 — `2am-s3-30` ex 1, `-47` ex 1, `-31` ex 2, `-42` ex 1, `-34` ex 1, `-41` ex 2, `-43` ex 1 —, 31 `term_exam_modelled`, 12 `adapted` from the lesson's own textbook elements), misconceptions `MISC-RABI-*`, oracle `scripts/practice-oracle/rabi-mutanasib.mjs` (BigInt fractions; a multiple-choice sheet is judged option by option and fails unless exactly one option is true; an equality in x is checked true or false). The corpus has the topic only in term 3, so no term-1/2 provenance was invented; papers with a percentage step or a « recognise a table » step were set aside for the sister lessons.
- **2AM `kasr-hasil-qisma` (2026-10-28):** `content/practice/2am/kasr-hasil-qisma/` — 50 sheets, 210 questions (24 `counted: false`: the Euclidean and natural-bracket steps of `qisma-iqlidiya-hasr` and the unit counts); 10 `term_exam` on `2am-s1-75`, `-87`, `-68`, `-91`, `-78`, `-88`, `-79`, `-74` and the misfiled 2AM paper `3am-s1-112` (cited with `grade: 2am`, `file: 3am-s1-112`; each exercise read in the scan or text layer before citing), 32 `term_exam_modelled` `modelledOn: "2am-s1"`, 8 `adapted`; 7 `MISC-QARIBA-*` (`REMCOMMA`, `SWAP`, `RANK`, `ROUNDED`, `EXACTAPPROX`, `ONETERM`, `RATIOFLIP`). Oracle `scripts/practice-oracle/kasr-hasil-qisma.mjs` (BigInt scaled decimals, its own long division, strict brackets `b·lo < a < b·hi`, every distractor inequality generated FALSE — a bracket at the wrong rank is TRUE, so it is never a distractor). A corpus « تدوير » step is never asked (default / excess only).

- **3AM `tasawi-muqaranat-kasrayn` (2026-10-26, Phase 0):** `content/practice/3am/tasawi-muqaranat-kasrayn/` — 50 sheets, 205 questions (17 `selfCheck`), 27 `counted: false` steps (divisions of `maqlub`, reductions, sums, final decisions); 5 `term_exam` (`3am-s3-47` ex 1, `3am-s1-104` ex 2, `3am-s1-3` ex 4, `3am-s1-103` ex 5, `3am-s1-108` ex 5), 38 `term_exam_modelled` (`modelledOn: "3am-s1"`), 7 `adapted` (ex-8, ex-10, ex-12, ex-13, ex-15, ex-17, deep-55); 8 `MISC-TASAWI-*`. A `term_exam` whose corpus numbers are SIGNED (`3am-s3-47`, `3am-s1-104`) keeps the structure with POSITIVE fractions (signed comparison belongs to `adad-natiq`): « term_exam » there means « modelled on that one exercise ». The oracle `scripts/practice-oracle/tasawi-muqaranat-kasrayn.mjs` has its OWN BigInt rationals, recomputes every relation by cross products, re-reads the LaTeX of every choice option (81 of the 88 choice questions are fully judged: exactly one true option, the one marked correct) and checks reduced keys and `MISC-TASAWI-*` labels on counted distractors.
- **3AM `jam-tarh-kasrayn` (2026-10-26, Phase 0):** `content/practice/3am/jam-tarh-kasrayn/` — 50 sheets, 180 questions (18 `selfCheck`), 42 `counted: false` steps (products and quotients of `maqlub`, `tasawi` comparisons, decisions and amounts: a step of an EARLIER lesson cannot be `counted: true` because `validate-exercises` requires every question's learning point to belong to this lesson); 13 `term_exam` (`3am-s1-108` ex 2, `3am-s1-110` ex 2, `3am-s2-69` ex 1, `3am-s1-104` ex 2, `3am-s2-75` ex 1, `3am-s1-1` ex 2, `3am-s1-2` ex 4, `3am-s3-59` ex 1, `1am-s1-100` ex 2, `3am-s1-103` ex 2 and ex 5 III, `3am-s1-3` ex 4, `3am-s1-108` ex 5 — signed corpus steps re-sketched with positive fractions, so « term_exam » means « modelled on that one exercise »), 30 `term_exam_modelled`, 7 `adapted` (ex-19, ex-20, self-2, self-3, now-2, deep-80, deep-74); 7 `MISC-JAMTARH-*` (ACROSS, NOSCALE, BIGGER, SUMDEN, PRODUCTONLY, INTEGER, RESULTCHANGES; the prefix is shared with the 1AM `mana-jam-tarh` ids FASILA…WAHDA, no clash). `3am-s1-2` ex 4 prints `35 + T = 0` with T = 1/4 (a corpus error replaced by a true step). Oracle `scripts/practice-oracle/jam-tarh-kasrayn.mjs` (own BigInt rationals, brute-force smallest common multiples, option-by-option judging of the multiChoice, every distractor false).
- **3AM `adad-natiq` (2026-10-26, Phase 0):** `content/practice/3am/adad-natiq/` — 50 sheets, 227 questions; `r07` is a CORPUS GAP (one exercise, `3am-s1-109` ex 2, duplicate `3am-s1-114`): **2 `term_exam`** (`3am-s1-104` ex 2 step ③ and `3am-s1-109` ex 2, both modelled on that one exercise with other numbers — the faithful share is nil), 40 `term_exam_modelled` (badge « على منوال اختبار الفصل الأول »), 8 `adapted` (ex-24, ex-26, ex-25, ex-29, ex-32, self-4, self-9, self-10; `ex-25`, `ex-29`, `self-4` are cited only by the bank); steps that need a sum, a product or a reciprocal of rationals (the next lesson) are `counted: false`; number lines are `GeoFigure` data; `rational` cannot force a positive denominator, so those items ask « ما بسط الكتابة x/N » or use `requiredForm: 'irreducible'`; 10 `MISC-NATIQ-*` (DROPSIGN, TWONEG, NEGPLACE, NEGORDER, WRITINGS, NOTANUMBER, NEGNOTDEC, INVERT, DECIMAL, APPROX; the 4AM ids `MISC-NATIQ-TABII-FAQAT` / `-KULL-JIDHR` are distinct). Oracle `scripts/practice-oracle/adad-natiq.mjs` (own BigInt rationals; the 2^i·5^j test; order chains re-parsed and checked sorted).
- **3AM `jidaa-adadayn-nisbiyayn` (2026-10-26, Phase 0):** `content/practice/3am/jidaa-adadayn-nisbiyayn/` — 50 sheets, 202 questions (4 `selfCheck`), 24 `counted: false` steps (three or more factors and divisions belong to the next two lessons); 7 `term_exam` (all term 1: `3am-s1-110` ex 1, `3am-s1-2` ex 6 and ex 3, `3am-s1-4` ex 1, `3am-s1-1` ex 1, `3am-s1-108` ex 1, `3am-s1-113` ex 1 — a step the paper does not count as two-factor gets an added counted opening step), 25 `term_exam_modelled` (`modelledOn: "3am-s1"`), 18 `adapted` (ex-1…4, 6, 7, 8, 17, 19, 29, 34, self-1…5, deep-37, deep-43, one sheet each); 7 `MISC-JIDAA-*` (NEGNEG, ADD, SUB, LARGER, TIME, DECIMAL, PARTIAL — every constructed distractor carries one, one deep-43 distractor none). Oracle `scripts/practice-oracle/jidaa-adadayn-nisbiyayn.mjs`: its OWN exact BigInt-fraction parser reads the statement's expressions (`A = …`, `$…$` islands, `□` equations filled with + then −, each `choice` option evaluated); where a number lives only in a story (elevator, temperature, quiz scores) the expression is retyped in the oracle's syntax and the statement's own target is re-read and compared.

- **3AM `jidaa-ida-nisbiya` (2026-10-26, Phase 0):** `content/practice/3am/jidaa-ida-nisbiya/` — 50 sheets, 225 questions (3 `selfCheck`), 12 `counted: false` steps (divisions, a bracketed sum, a decimal bracketing and an equation in `x` of the corpus papers belong to other lessons); 8 `term_exam` (all term 1: `3am-s1-1` ex 1, `3am-s1-4` ex 1, `3am-s1-2` ex 6 and ex 3, `3am-s1-109` ex 1, `3am-s1-113` ex 1, `3am-s1-103` ex 1 and the misfiled 3AM paper `1am-s1-100` ex 1 — the multi-factor steps are COUNTED here, unlike in the sister lesson that reuses some of the same papers), 23 `term_exam_modelled` (`modelledOn: "3am-s1"`, five of them « الوضعية الإدماجية (08 ن) »), 19 `adapted` (one sheet per textbook element no module cites: ex-5, 9–14, 18, 20, self-6, 7, 12, deep-35, 39, 42, 44, 46, 49, 51); 8 `MISC-IDA-*` (ANYNEG, MORENEG, ORDER, SQUARENEG, MINUSONE, MINUSA, DISTSIGN, ZERO). Boundary kept: numbers only in distributivity, squares only as `(−a)²`, no `aⁿ`, no division except in `counted: false` steps. Oracle `scripts/practice-oracle/jidaa-ida-nisbiya.mjs` (own BigInt-fraction parser with `^2`, brackets, juxtaposed factors and `… × (−18)` chains): a SIGN key is computed twice — by counting the parsed negative factors and by the exact product — and the two must agree (`signBoth`); « جداء عدد عوامله n وعدد العوامل السالبة/الموجبة فيه p » statements are read (n, p and the word) and the sign is obtained by multiplying n factors ±1 in BigInt; a step of an exam sheet holds at most four sub-items (ا ب ج د), longer lists are cut into steps. Reading note (corrected 2026-10-26 by the lead of `qismat-nisbiyayn`, scan re-read at 100–300 dpi): `3am-s1-2` ex 3 prints `E = (−10) × 2 × 0,1 × (−7) × (−0,5)` = **−7** (then V/E = 10/7, bracket 1,428 < V/E < 1,429, rounded to 10⁻¹ = 1,4); `jidaa-adadayn-nisbiyayn-l3-007` and `qismat-nisbiyayn-l5-007` carry it. The sheet `jidaa-ida-nisbiya-l3-003` had read `(−10) × (−7) × (+1) × 2 × (−0,5)` = −70 and was repaired the same day.
- **3AM `qismat-nisbiyayn` (2026-10-26, Phase 0):** `content/practice/3am/qismat-nisbiyayn/` — 50 sheets, 211 questions (one `selfCheck` question, `l5-003` q5), 30 `counted: false` steps (the products, sums and sign counts of the corpus papers, the opposite and the reciprocal of `A ÷ B` in `l5-002`, the fraction `155/2` of `l5-005`, and the known-factor product of `l5-006`); 10 `term_exam` (all term 1: `3am-s1-103` ex 1, `-104` ex 1, `-108` ex 1, `-110` ex 1, `-113` ex 1, `-5` ex 1, `-2` ex 3 and ex 6, `-109` ex 1 and the misfiled 3AM paper `1am-s1-100` ex 1; `-104` and `-108` are the same exercise printed in two papers with different questions, each cited on its own sheet), 17 `term_exam_modelled` (`modelledOn: "3am-s1"`), 23 `adapted` (one sheet per textbook element no module cites: ex-15, 16, 21–28, 30–32, self-8…11, deep-36, 47, 48, 50 and the redesigned ex-33, deep-45); 8 `MISC-QISMA-*` (SIGN, ORDER, DIST, ZERO, FRACSIGN, PRIORITY, SUBNEG, DECIMAL). Boundary kept: no `عدد ناطق`, no reciprocal rule, no operation on fractions, a non-decimal quotient only as the FINAL result written `a/b` with coprime terms, letters only as `a`, `b` in the writings of a quotient. Oracle `scripts/practice-oracle/qismat-nisbiyayn.mjs` (own BigInt-fraction evaluator with priorities, brackets, unary minus and decimals; `□` statements solved by `missing = a / b` and re-checked by multiplication; rounding keys recomputed from the exact fraction, half up): every MCQ has exactly one true option, every tagged distractor equals the value its misconception computes. Reading note on `3am-s1-2` ex 3 below.

- **3AM `amaliyat-natiqa` (2026-10-26, Phase 0):** `content/practice/3am/amaliyat-natiqa/` — 50 sheets, 167 questions (9 `selfCheck`), 13 `counted: false` steps (the power steps of level 4 belong to the published `quwat-adad-nisbi`, and the « compare A and B » steps to `muqaranat-natiqayn`); 16 `term_exam` (`3am-s1-110` ex 2, `-103` ex 2, `-108` ex 2, `-4` ex 1, `-109` ex 2, `-104` ex 2 twice, `-1` ex 2, `-2` ex 4 and ex 7, `-110` ex 2, the misfiled 3AM paper `1am-s1-100` ex 2, `-5` ex 2 and the term-2 papers `3am-s2-69`, `-72`, `-75` ex 1 with the « الفصل الثاني » badge — every sheet re-numbered, never word for word), 26 `term_exam_modelled` (`modelledOn: "3am-s1"`, level 4 on `"3am-s2"`), 8 `adapted` (ex-3, self-5, ex-43, self-6, ex-47, deep-66, deep-57, deep-79); 9 `MISC-AMAL-*` (SUMSIGN, ADDDIST, ACROSS, PRODSIGN, NOFLIP, FLIPFIRST, RECIPSIGN, PRIORITY, DECNUM; the 0,33 « reciprocal of 3 » trap of `ex-3` is a DECNUM distractor, never a key). Answer types stay `rational` (irreducible) / `choice` (sign, integer?, equality, compare, value MCQ) / `selfCheck` (« بيّن أنّ … عدد صحيح/طبيعي », « علّل »). Oracle `scripts/practice-oracle/amaliyat-natiqa.mjs`: its own BigInt chain evaluator over retyped ASCII strings (priorities, brackets, compound fractions `[n|d]`, signed fractions `{a/-b}`, integer powers, letters) for the keys, and a SECOND parser that re-reads the statement's LaTeX (nested `\dfrac`, `\left(`, `{,}`, `^{k}`, « من أجل » assignments) to judge every « احسب », reciprocal, `x` equation (by substitution), « بيّن أنّ » claim and every option of every choice; the PRIORITY distractor is recomputed left to right and SUMSIGN / PRODSIGN / RECIPSIGN must be the opposite of the key.
- **3AM `qimat-ibara-harfiya` (2026-10-26, Phase 0):** `content/practice/3am/qimat-ibara-harfiya/` — 50 sheets, 243 questions (6 `selfCheck`), 52 `counted: false` steps (expanding / simplifying belong to the published `nashr-jabri-3am` and `tabsit-hadhf-aqwas`, Pythagoras, square roots and powers of 10 to their own lessons, and every final « enough? / does it match? » decision is a yes/no `choice` whose key the oracle recomputes by comparing two NUMBERS — never a sign of a difference, never an equation); 14 `term_exam` (`3am-s3-47` ex 1 and ex 5, `3am-s2-81` ex 1 and ex 5, `3am-s3-56` ex 1, `3am-s2-75` ex 2, `-68` ex 2, `-70` ex 1, `-80` ex 2, `-82` ex 2 and ex 5, `3am-s3-49` ex 1 and the misfiled 3AM paper `2am-s2-65` ex 4 and ex 5 — the badge follows each paper: « الثاني » or « الثالث »; every one is `kind: modelled`, new numbers, a corpus step that solves an equation or proves a right angle is replaced by a TEST of the proposed values or dropped), 36 `term_exam_modelled` (`3am-s2` 25, `3am-s3` 11), no `adapted` (the textbook elements are all cited by the lesson's modules); 9 `MISC-QIMA-*` (FUSED, NEG-POWER, SIGN-LOST, COEF-IN-POWER, LEFT-TO-RIGHT, SQUARE-DOUBLE, PARTIAL, LETTERS-SAME, ONE-VALUE), every `choice` distractor carries one. The three الكفاءات are all primary: P1 on 141 questions, P2 on 70, P3 on 32 (L2, L4, L5 judge by values: ONE value that separates the two expressions proves them unequal, equal values prove nothing, expanding proves equality). Reusable conventions it fixed: (1) a « which line computes it? » `choice` (`lines`) is judged by EVALUATING every option line (a line that keeps a letter is not a substitution) so exactly one equals the target; (2) a conclusion `choice` over values states a PREMISE the oracle checks (« agree at … », « a witness separates them », « equal as expanded polynomials »); (3) an exact value with π is asked as the coefficient of π (`k` or `a`) and the approximation as a `rational` at 10^-2 « بالنقصان » (default value) or « بالتدوير », the oracle holding π to 40 digits in BigInt. Oracle `scripts/practice-oracle/qimat-ibara-harfiya.mjs`: its OWN multi-letter polynomial arithmetic over BigInt rationals and parser (the power binds before a unary minus, so `-3^2` is the VALUE of the wrong reading), every signature recomputed from the formula of the mistake, every number quoted in a text recomputed, every formula shown on a sheet re-read from its LaTeX island and compared as a polynomial, tested by `scripts/practice-answer-oracle.test.mjs`. Corpus facts verified on the scans: `3am-s3-47` ex 1 is a 4-point MCQ (item III is the equality tested at 3 / −3 / ⅓, true only at 3), `3am-s2-81` ex 5 is the farmer's plot (8 points, « المسألة »), `2am-s2-65` ex 5 is a 6-point « المسألة » (ladder + court `(x+12)(x−1)`, area 420 at x = 16) modelled here as an 08-point situation, and `3am-s2-82` ex 5 has a Pythagorean-converse part II replaced here by a budget decision.
- **3AM `muqaranat-natiqayn` (2026-10-26, Phase 0):** `content/practice/3am/muqaranat-natiqayn/` — 50 sheets, 230 questions (21 `selfCheck`), 54 `counted: false` steps (fraction products and sums, expansion, the value of an expression, Pythagoras and powers of 10 belong to the lessons that own them; the bank NEVER operates on an inequality — « اختبر صحة المتباينة » only evaluates both sides at a value); 9 `term_exam` (`3am-s3-47` ex 1 Q1 and ex 5, `3am-s2-69` ex 2, `3am-s2-80` ex 5, `3am-s1-104` ex 2 and ex 5, `3am-s1-3` ex 4, `3am-s1-103` ex 5 — each sheet keeps the structure and the register of its paper with NEW numbers, none is word for word; `3am-s1-110` ex 4 is the duplicate of `3am-s1-3` ex 4 and is cited once; `3am-s1-108` ex 5 was not readable and is not claimed), 34 `term_exam_modelled`, 7 `adapted` (the textbook elements `ex-27`…`ex-32`, `self-9`, `self-10`, new numbers; there is no separate `platform_addition` sheet); 8 `MISC-MUQ-*` (ABS, ORDER-SUB, NUMERATOR, SUB-TERMS, NEED-VALUES, ABS-DIFF, COEF, BRACKET), every `choice` distractor carries one. Primary الكفاءات: P1 on 30 questions, P2 on 79, P3 on 67. Corpus fact: NO exercise of the corpus is tagged `3am.m5.r04` (`coverageOwnGrade` 0) — the honest item is the pair of comparison-by-sign hits above plus modelled contexts that ask « بحساب الفرق » where the corpus compares by a common denominator. Oracle `scripts/practice-oracle/muqaranat-natiqayn.mjs`: its own BigInt fractions and small polynomial arithmetic recompute every difference, sign, verdict and coefficient, every « A > B for x > c » at five values on each side AND by the simplified difference, and check that each distractor is false and tagged.
- **3AM `quwa-adad-ashara` (2026-10-26, Phase 0):** `content/practice/3am/quwa-adad-ashara/` — 50 sheets, 170 questions (139 `rational`, 31 `choice`), 2 `term_exam` (`3am-s1-3` ex 1 q1 — decimal → 10ⁿ only, `3am-s2-83` ex 1 part 2, both read visually at 110 dpi; the product / power-of-power parts belong to `qawaid-quwa-ashara` and were omitted) / 33 `term_exam_modelled` / 15 adapted (ex-1, ex-3, self-1, ex-5, ex-6, self-3, ex-10, ex-11, ex-12, act-1, ex-8, ex-9, self-11, act-3, act-2; `badge: null`) / 0 `platform_addition`; oracle `scripts/practice-oracle/quwa-adad-ashara.mjs` with its OWN BigInt decimal parser; boundary kept (no product / quotient / power of powers of 10: conversions in decimal); 7 `MISC-ASHARA-*` in `misconceptions.json`.
- **3AM `qawaid-quwa-ashara` (2026-10-26, Phase 0):** `content/practice/3am/qawaid-quwa-ashara/` — 50 sheets, 168 questions (all `rational` or `choice`, no `selfCheck`), 6 `counted: false` steps (decimal writings of 10ⁿ belong to `quwa-adad-ashara`; bases 2, 3, 5 of the `2am-s2-65` / `3am-s2-76` papers belong to `quwat-adad-nisbi`); **4 `term_exam`** (`3am-s1-3` ex 1 q1 — « الفصل الأول »; `3am-s2-76` ex 2 and the misfiled `2am-s2-65` ex 1 — header 3AM term 2 —; `3am-s2-83` ex 2 — the `E` / `F` computations only, its scientific-writing / bracketing / order-of-magnitude parts omitted; all four PDFs read visually at 220 dpi) / 32 `term_exam_modelled` / 14 adapted (self-4, self-5, ex-13, act-4, ex-20, self-6, ex-14, ex-15, ex-17, now-43, ex-50, ex-18, ex-19, ex-56; `badge: null`) / 0 `platform_addition` other than `term_exam_modelled`; boundary kept (powers of 10 only, results never normalised — `21 × 10ⁿ`, `0,3 × 10ⁿ` stay — no « الكتابة العلمية », no order of magnitude); oracle `scripts/practice-oracle/qawaid-quwa-ashara.mjs` with its OWN BigInt parser (products, quotients, powers of powers, `k × 10ᵖ`; `exp` / `expb` / `solve` / `coef` / `val` kinds, every `choice` option evaluated); 9 `MISC-QAWAID-*` in `misconceptions.json`.
- **3AM `kitaba-ilmiya-rutba` (2026-10-26, Phase 0):** `content/practice/3am/kitaba-ilmiya-rutba/` — 50 sheets; **13 `term_exam`** (`3am-s1-3` ex 1, `3am-s1-113` ex 2, `3am-s1-4` ex 2, the misfiled `2am-s2-65` ex 2, `3am-s2-72` / `-70` / `-78` ex 2, `3am-s2-76` / `-80` / `-82` / `-68` ex 1, `3am-s2-83` ex 2 and ex 5) / 23 `term_exam_modelled` / 14 textbook-adapted; the scientific-writing / bracket / order-of-magnitude steps are counted (P1 / P2 / P3), the power-rule computations of the term-exam statements are `counted: false` (they belong to `qawaid-quwa-ashara`); answers are TWO numbers (`a`, `n`) or a `choice`; oracle `scripts/practice-oracle/kitaba-ilmiya-rutba.mjs` with its OWN BigInt parser (normalisation 1 ≤ a < 10, bracket, round-half-up with the `a' = 10` carry, orderings, exactly one true `choice` option); 7 `MISC-ILMIYA-*` in `misconceptions.json`; `ex-61` / `ex-62` (Pythagoras / Thales) are `notIntegrated`.
- **3AM `wadiya-idmajiya-quwa-nisbiya` (2026-10-28, synthesis of unit 3):** `content/practice/3am/wadiya-idmajiya-quwa-nisbiya/` — 50 sheets, 210 questions (`rational` / `choice` only), **0 `term_exam`** / 47 `term_exam_modelled` (`modelledOn` `3am-s2` and `3am-s3`, badges « الفصل الثاني / الثالث » alternating) / 3 `adapted` (the book's `evaluation`, `ict`, `integration`, new numbers, `badge: null`); every step is counted on the synthesis's single الكفاءة P1. Generated from parameterised TEMPLATES (layers, cells × volume, light time, growth, area per inhabitant, mass) with every key computed twice — by the generator (Python Fractions) and by the committed oracle `scripts/practice-oracle/wadiya-idmajiya-quwa-nisbiya.mjs` (own BigInt rationals, spec retyped per question, literals checked against the sheet, unique `n` for « base^n » and for scientific writing, half-up order of magnitude, each `choice` judged by reading its powers of 10 / its words); a scientific-writing answer is asked as TWO `rational` questions (`a`, then `n`); a `misconceptionSignatures` value must be readable (no 0,000000000000000125); 24 `MISC-WQ-*` in `misconceptions.json`, the audit recomputes SIGN, PRIORITY, MULEXP, POWSUM, DIGITS, ROUND, FIRST.
- **3AM `wadiya-idmajiya-musawiyat-mutabayinat` (2026-10-28, synthesis of unit 5):** `content/practice/3am/wadiya-idmajiya-musawiyat-mutabayinat/` — 50 sheets, 210 questions (`rational` / `choice` only), **0 `term_exam`** / 47 `term_exam_modelled` (`3am-s2` / `3am-s3` alternating) / 3 `adapted` (the book's `integration`, `evaluation`, `challenge`, new numbers, `badge: null`); questions are counted on the synthesis's two الكفاءات (P1 properties and brackets, P2 model / solve / check). Built from parameterised family templates; the committed oracle `scripts/practice-oracle/wadiya-idmajiya-musawiyat-mutabayinat.mjs` re-solves every equation in x (affine forms over BigInt rationals), recomputes the round-half-up / `r ∓ p/2` brackets and judges each choice option by its own spec (`sat`, `holds`, `eqsol`, `br`, `law` on a grid, `always` / `undecided`); only ONE option may be true and no two signatures of one question may share a value. Reuses the unit's `MISC-MUSAWIYA-*`, `MISC-MUADALA-*`, `MISC-MUTABAYINA-*`, `MISC-TADWIR-*` — no new id.
- **2AM `silsila-bidun-aqwas` (2026-10-28, Phase 3, unit 1 lesson 1):** `content/practice/2am/silsila-bidun-aqwas/` — 50 sheets, 195 questions (17 `selfCheck` for « برّر », 34 `counted: false` steps of 1AM `mana-jam-tarh` — choosing the operation, the tape — and yes/no decisions in L4–L5), **7 `term_exam`** / 33 `term_exam_modelled` (`modelledOn: "2am-s1"`, badge « على منوال اختبار الفصل الأول ») / 10 `adapted` / 0 `platform_addition`. The 7 `term_exam` keep the structure of an exercise actually READ in the corpus, with their own numbers: L1 `2am-s1-88` ex 1 I and J, `2am-s1-87` ex 1 A, `2am-s1-91` ex 1 K; L2 `2am-s1-79` ex 2 (the two calculators with the TRUE values — the paper inverts them) and `2am-s1-81` ex 1 A; L3 `2am-s1-77` ex 1 E and `2am-s1-84` ex 1 ①. Every bracketed part of those exercises is OMITTED (brackets are the next lesson's). No bracket or fraction bar appears in any statement, option or solution, and no intermediate result is negative; the plan's `decimal` answer type does not exist — an exact decimal is `rational` with a point-decimal key. Oracle `scripts/practice-oracle/silsila-bidun-aqwas.mjs` has its OWN BigInt-rational evaluator with priorities (independent of `chainOps.js`), reproduces every distractor's named error (`MISC-SILSILA-ADDFIRST` / `MULFIRST` / `NOPRIORITY` / `RIGHTLEFT` / `PARTIAL` / `STORYSIGN` / `STORYORDER`) and rejects brackets and negative intermediates.
- **2AM `silsila-bi-aqwas` (2026-10-29, Phase 3, unit 1 lesson 2):** `content/practice/2am/silsila-bi-aqwas/` — 50 sheets, 190 questions (14 `selfCheck` for « اشرح / برّر », 27 `counted: false` steps — flat priority and decimal division of the earlier lesson in L3–L4, yes/no decisions in L5), **13 `term_exam`** / 28 `term_exam_modelled` (`modelledOn: "2am-s1"`, badge « على منوال اختبار الفصل الأول ») / 9 `adapted` / 0 `platform_addition`. Per level (term_exam / modelled / adapted): L1 3/5/2 · L2 2/5/3 · L3 4/4/2 · L4 2/7/1 · L5 2/7/1. The 13 `term_exam` keep the structure of an exercise actually READ in the corpus (`2am-s1-87` ex 1, `-81` ex 1, `-88` ex 1; `-70` ex 1 keys, `-77` ex 1 ②; `-91` ex 1, `-68` ex 1, `-77` ex 1 F, `-79` ex 2 D; `-84` ex 1 ②, `-78` ex 1 B; `-75` ex 1, `-77` the milk seller again at situation size), each with its own numbers; the distributivity parts of those papers (« احسب بطريقتين », « حلّل ») are omitted (`tawzi-darb-jam-tarh`). Brackets, bars and calculator keys appear; no intermediate result is negative and the × sign is always written in L1–L3 (`4(6 + 3)` appears once, in L4, as the named `MISC-AQWAS-IMPLICITX`). Oracle `scripts/practice-oracle/silsila-bi-aqwas.mjs` has its OWN BigInt-rational evaluator with ( ) [ ] and fraction bars (independent of `chainOps.js`), re-computes every `$…$` expression, a « useless pair » only if removing it leaves the value unchanged on the sheet's numbers AND on 40 random value sets, and reproduces every distractor's named error (`MISC-AQWAS-IGNORED` / `DROPOUTER` / `BARSPLIT` / `CALCNOBRACKET` / `ALLUSELESS` / `ALLNEEDED` / `IMPLICITX` / `MISPLACED`).
- **2AM `wasf-silsila-hisab` (2026-10-29, Phase 3, unit 1 lesson 3):** `content/practice/2am/wasf-silsila-hisab/` — 50 sheets (223 questions): 2 faithful `term_exam` (`2am-s1-87` exercise 2 ① re-read on the rendered page, numbers changed; `2am-s1-83` exercise 1 item ج, own chains), 40 `platform_addition` + `term_exam_modelled` (`modelledOn: "2am-s1"`), 8 `adapted` textbook elements. Oracle `scripts/practice-oracle/wasf-silsila-hisab.mjs` (own positioned BigInt parser; every sentence compared with `chainOps.describe` AND an 11-entry hand table; `MISC-WASF-FIRSTOP` / `FIRSTWRITTEN` / `PIECES` / `ORDERDIFF` / `NOBRACKET` reproduced exactly; ORDERDIFF is used only in sentence / term choices and for ÷ because swapping a difference is negative).
- **2AM `tawzi-darb-jam-tarh` (2026-10-29, Phase 3, unit 1 lesson 4):** `content/practice/2am/tawzi-darb-jam-tarh/` — 50 sheets, 200 questions (4 `selfCheck`, 9 `counted: false` — the naming steps of L4, which belong to `wasf-silsila-hisab`), **9 `term_exam`** (`2am-s1-74` ex 1, `-81` ex 1 ③, `-78` ex 1 ②, `-84` ex 1 ④ and ③, `-91` ex 1 ②, `-79` ex 2 E, `-83` ex 2 ②, `-67` ex 1 ②; each READ on the rendered PDF page, own numbers, one part of a paper never cited twice; the corpus's fractions, negative intermediates and two-letter parts are re-sketched with decimals, non-negative steps and ONE letter) / 32 `term_exam_modelled` (`modelledOn: "2am-s1"`) / 9 `adapted` (`ex-24`, `ex-25`, `ex-23`, `self-8`, `ex-33`, `now-13`, `self-10`, `ex-34`, `ex-27`). Answer types `rational` / `choice` only (`affine` is a two-field slope/intercept input, so an expansion with the letter is a `choice` whose options the oracle builds). Six `MISC-TAWZI-*` (FIRSTONLY, SIGNCHANGE, ADDK, FACTORMULT, FACTORWRONG, NOTATION). Oracle `scripts/practice-oracle/tawzi-darb-jam-tarh.mjs` has its OWN BigInt-rational evaluator in a·x + b form (independent of `chainOps.js`), re-reads the LaTeX of every statement, option, hint and solution line, rejects any negative intermediate, solves each blank by evaluation at 0 and 1, builds every `choice` option itself (one true option) and reproduces each named error exactly.
- **2AM `wadiya-idmajiya-amaliyat-tabiiya-ushriya` (2026-10-29, Phase 3, unit 1 synthesis):** `content/practice/2am/wadiya-idmajiya-amaliyat-tabiiya-ushriya/` — 50 sheets, 221 questions, ONE primary الكفاءة `_P1` on every question (none `counted: false`, as in the 3AM synthesis banks), **4 `term_exam`** (`2am-s1-75` ex 5 part 1, `2am-s2-71` ex 5, `2am-s1-84` ex 5 part 1, `2am-s2-62` ex 5; each READ on the rendered page, fraction and coordinate parts left out) / 40 `term_exam_modelled` (`modelledOn: "2am-s1"`) / 6 `adapted` (`deep-37`, `deep-44`, `deep-45`, `deep-46` redesigned in text, `deep-51`, `deep-52`); misconceptions reuse `MISC-SILSILA-*` / `MISC-AQWAS-*` / `MISC-WASF-*` / `MISC-TAWZI-*` plus `MISC-SYN-AMALIYAT-ROUNDUP` and `-MAXNOTMIN`; oracle `scripts/practice-oracle/wadiya-idmajiya-amaliyat-tabiiya-ushriya.mjs` (imports the chain evaluator `E`/`parse` of `silsila-bi-aqwas.mjs`, `audit()` re-reads every LaTeX island).
- **2AM `jam-tarh-kusur` (2026-10-29):** `content/practice/2am/jam-tarh-kusur/` — 50 sheets, 163 questions (29 `counted: false` — the amount parts of L5 and the decimal steps of L4 that mobilise `kasr-hasil-qisma` —, 4 `selfCheck`); **8 `term_exam`** (`2am-s1-75` ex 3, `-68` ex 2 and the situation, `-84` ex 2, `-73` ex 1, `-67` ex 2, `-88` and `-83` situations; each text READ by the generator) / 35 `term_exam_modelled` (`modelledOn: "2am-s1"`) / 7 `adapted` (`ex-9`, `ex-10`, `ex-12`, `self-5`, `deep-40`, `ict-1`, `deep-36`, own numbers, `badge: null`); misconceptions `MISC-JAMKASR-*` (ACROSS, NOSCALE, DENSUM, PART, NATURAL); oracle `scripts/practice-oracle/jam-tarh-kusur.mjs` (own BigInt rationals; its `audit()` re-reads the LaTeX of every statement, option, hint and solution line and FAILS on any pair of denominators where neither divides the other — the bank never holds a 3AM pair, a negative result or a product in a counted question).
- **2AM `ibara-harfiya-intaj` (2026-10-29):** `content/practice/2am/ibara-harfiya-intaj/` — 50 sheets, 172 questions (2 `counted: false`: the triangle areas of `l5-001` and `l5-002`); **6 `term_exam`** (`2am-s2-50` ex 5 part 3, `-73` ex 5 part 2, `-72` ex 5 part 2, `2am-s3-37` ex 5 part 1, `2am-s3-39` ex 4, `2am-s2-69` ex 4), 36 modelled, 6 adapted (`ex-1`, `self-3`, `ex-21`, `self-7`, `deep-47`, `ex-9`); every counted value ≥ 0; misconceptions `MISC-IBARA2-*` (PERCELL, NOFIRST, POWER, ADDFOR, PRODSQUARE, SQUARE2, ADDPOWERS, MULTCOEF, ZEROSKIP, JUXTA, BRACKET); oracle `scripts/practice-oracle/ibara-harfiya-intaj.mjs` (own BigInt rationals and polynomials).
- **2AM `jida-kasrayn` (2026-10-29):** `content/practice/2am/jida-kasrayn/` — 50 sheets, 178 questions (61 `counted: false` — the sums, differences, comparisons, natural arithmetic and decimal values of earlier lessons —, 3 `selfCheck` for « برّر »); **9 `term_exam`** (`2am-s1-68` ex 2 and ex 4, `-75` ex 3 N and K, `-91` ex 5, `-67` ex 2 and ex 5, `-87` ex 5 and the term-3 paper `2am-s3-25` ex 2 with the « الفصل الثالث » badge; each READ by the generator — text layer, or the scan for `-67` and `-68`, whose situation reads 7500 / 15000 دج, not the text layer's 0011 / 10111) / 31 `term_exam_modelled` (`modelledOn: "2am-s1"`) / 10 `adapted` (`ex-15`, `self-7`, `self-8`, `deep-41`, `deep-43`, `deep-44`, `deep-45`, `ex-19`, `deep-39`, `ex-30` with « أرباح », own numbers, `badge: null`); per level (term_exam / modelled / adapted): L1 2/5/3 · L2 1/5/4 · L3 3/5/2 · L4 0/10/0 · L5 3/6/1. Misconceptions `MISC-JIDAKASR-*` (SUMACROSS, DENSUM, CROSS, BOTHMUL, FLIP, HALFWAY, OFWHOLE, OFSPENT); `deep-42` (400 × 4/9, not whole) is not used. Oracle `scripts/practice-oracle/jida-kasrayn.mjs` (own BigInt rationals; every « of the remainder » key, area, volume and amount recomputed from the statement's numbers; its `audit()` recomputes each named error from the question's operands and FAILS if a signature or a QCM distractor is not exactly that error's value, if a key is not reduced, or if a sum pairs two denominators where neither divides the other, a division by a fraction, a percentage or a negative result appears).
- **2AM `muqarana-kasrayn` (2026-10-29):** `content/practice/2am/muqarana-kasrayn/` — 50 sheets, 196 questions (51 `counted: false` — the rest, the sums and the amounts of earlier lessons —, 10 `selfCheck` for « برّر »); **12 `term_exam`** (`2am-s1-68` ex 2 ب, `-81` ex 2, `-84` ex 2 and ex 5 part 2, `-67` ex 2, `-70` problem, `-91` ex 5, `-87` ex 5, `-88` ex 5, `-83` ex 5, `-75` ex 5 — skeleton only, its fractions are ambiguous in the text layer —, `-73` ex 5; each READ by the generator, text layer or rendered scan, each part cited once) / 28 `term_exam_modelled` (`modelledOn: "2am-s1"`) / 10 `adapted` (`ex-20`, `ex-21`, `ex-22`, `ex-23`, `ex-24`, `ex-25`, `ex-32` redesigned without a calculator, `self-10`, `self-11`, `deep-34`, `badge: null`); per level (term / modelled / adapted): L1 2/6/2 · L2 1/6/3 · L3 1/4/5 · L4 2/8/0 · L5 6/4/0. Misconceptions `MISC-MUQKASR-*` (NUMONLY, BIGDEN, NOSCALE, GAP, ONEWRONG, REVERSED — widened to « sign or ordering direction swapped »). Oracle `scripts/practice-oracle/muqarana-kasrayn.mjs` (own BigInt cross-multiplication; every key recomputed from the statement's numbers; every compared pair asserted to be a 2AM case — same denominator, same numerator, one denominator a multiple of the other, or straddling 1 —; one true option per QCM; each signature recomputed and wrong).
- **2AM `wadiya-idmajiya-kusur-amaliyat` (2026-10-29, Phase 3, unit 2 synthesis):** `content/practice/2am/wadiya-idmajiya-kusur-amaliyat/` — 50 sheets, 213 questions (19 `counted: false` — rectangle area / perimeter, one fence cost, the `selfCheck`s —, 4 `selfCheck`), every question on the synthesis P1; **8 `term_exam`** (`2am-s1-73` ex 5, `-68` ex 4, `-91` ex 5, `-88` ex 5, `3am-s1-112` ex 8 cited with `grade: 2am`, `-83` ex 5, `-87` ex 5, `-92` ex 1 — each read in the corpus, each cited once in this bank), **42 `term_exam_modelled`** (`modelledOn: "2am-s1"`), 0 adapted; misconceptions the neighbours' + `MISC-SYN-KASR2-WHOLE` / `-PERIM` / `-FRACONLY`; oracle `scripts/practice-oracle/wadiya-idmajiya-kusur-amaliyat.mjs` (own BigInt checks on top of `amaliyat-natiqa.mjs` `E` / `TEX`; audits the 2AM scope: nested denominators, no division by a fraction, no percentage).
- **2AM `talim-nuqta-mustawi` (2026-10-29, unit 3 « الأعداد النسبية », lesson 4):** `content/practice/2am/talim-nuqta-mustawi/` — 50 sheets, 156 judged questions (levels 1–4 three per sheet, level 5 four), oracle `scripts/practice-oracle/talim-nuqta-mustawi.mjs` (own BigInt decimals; reading questions never print the coordinates they ask; every figure is a `statement.figure` GeoFigure with `grid` + `axes` that passes `figureQuality`). 10 `term_exam` (the frame / placing parts of `1am-s2-79` ex 4, `2am-s1-73` ex 3, `2am-s2-70` ex 2, `2am-s2-69` ex 3, `2am-s2-63` ex 3, `2am-s2-72` ex 3, `2am-s2-75` ex 2, `2am-s2-59` ex 4, `2am-s2-52` ex 3, `2am-s2-53` ex 2), 33 modelled, 7 adapted; central symmetry, a rectangle's centre, the nature of a quadrilateral and the cost steps are `counted: false` (at most one per sheet). Misconceptions `MISC-NUQTA2-*` (23).
- **2AM `masafa-nuqtatayn` (2026-10-29, unit 3 « الأعداد النسبية », lesson 5):** `content/practice/2am/masafa-nuqtatayn/` — 50 sheets, 158 judged questions (10 `counted: false` — the order of abscissae, differences of relatives, the opposite of a number and one cost, steps of `muqarana-nisbiya` / `jam-tarh-nisbiya` and of arithmetic —, 4 `selfCheck` « برّر »); no statement figure (a graduated line is not a plane `GeoFigure`: abscissae are given in words and `$A(-4)$`, graduation counts as numbers); **7 `term_exam`** (`2am-s2-73` ex 1 b · `2am-s2-70` ex 1 q 2 · `2am-s1-69` ex 4 q 2–q 3 · `2am-s2-63` ex 2 q 2–q 3 + K · `2am-s2-62` ex 2 q 2 + q 5 · `2am-s1-66` ex 3 · `2am-s2-69` ex 1 q 3 — each text READ (text layer, or the rendered scan for `-69`, `2am-s1-66`, `-69`), numbers changed, one sheet per paper part), 37 modelled (`modelledOn` `2am-s1` / `2am-s2`), 6 `adapted` (`ex-35`, `self-9`, `deep-41`, `ict-1`, `deep-40`, `deep-42`, own numbers, `badge: null`); per level (term_exam / modelled / adapted): L1 2/6/2 · L2 1/7/2 · L3 3/6/1 · L4 1/8/1 · L5 0/10/0. The midpoint is only an APPLICATION (smaller abscissa + half the distance; the formula (a+b)/2 is never stated and a midpoint needing three decimals is refused); « the two points at a distance d » are asked as one choice (pair / count) or as two single-answer questions (right side, left side). Misconceptions `MISC-MASAFA2-*` (SUBDIST, ADDSAME, NEGDIST, ONEANSWER, SIGNSWAP, HALFDIST, SUMNOHALF, ORDERSWAP). Oracle `scripts/practice-oracle/masafa-nuqtatayn.mjs` (own BigInt hundredths, no import of `packages/core`; every key recomputed from the retyped abscissae, every signature / distractor recomputed from its NAMED error and checked false, the printed numbers compared with the retyped ones, the text scanned for textbook pointers, forbidden terms, Latin units and signed numbers outside `$…$`).
- **2AM `talim-mustaqim-mudarraj-2` (2026-10-29, unit 3 « الأعداد النسبية », lesson 1):** `content/practice/2am/talim-mustaqim-mudarraj-2/` — 50 sheets, 180 questions (17 `counted: false` — L4 mobilises `muqarana-nisbiya` (smallest / greatest / ordering of the placed points) —, 14 `selfCheck` « برّر »; no statement figure: a reading or placing question is phrased with COUNTED graduations in words « على 3 تدريجات إلى يسار المبدأ، وقيمة التدريجة 5 », a placing question asks the signed number of graduations, a plane `GeoFigure` band cannot draw a 13-graduation line); **5 `term_exam`** (`2am-s2-62` ex 2 q 1, 3, 4 · `2am-s2-63` ex 2 q 1 · `2am-s2-71` ex 1 q 2 · `2am-s1-69` ex 4 q 1, 4 · `2am-s1-73` ex 3 q 1 — each text READ, 3 on the text layer and 2 by rendering the scan, numbers changed, one sheet per paper part), 40 `platform_addition` + `term_exam_modelled` (`modelledOn` `2am-s1` / `2am-s2`), 5 `adapted` textbook elements (`ex-6`, `self-4`, `ex-9`, `ex-2` with the values GIVEN, `act-1` with own dates). Oracle `scripts/practice-oracle/talim-mustaqim-mudarraj-2.mjs`: BigInt decimals, every abscissa recomputed as graduations × step signed by the side, a new origin as a subtraction, the opposite as a sign change, every « suitable graduation » key checked as the only offered step with all abscissae on a graduation and within 6 graduations of the origin, every `MISC-TALIM2-*` (UNITIGNORED, SIGNSIDE, ADDSTEP, OPPSAME, RECIP, DIGITSWAP, TOOSMALL, TOOBIG, NEGDIST, ORIGINFIXED, ADDORIGIN) recomputed and false.
- **2AM `hall-mushkil-muadala` (2026-10-29, unit 4 « مفهوم معادلة », lesson 2):** `content/practice/2am/hall-mushkil-muadala/` — 50 sheets; **8 `term_exam`** (`2am-s2-72` ex 2, `2am-s2-50` ex 2 q1 and ex 5 part 1, `2am-s3-25` ex 2 and ex 5, `1am-s2-79` ex 2 q2 — a misfiled 2AM paper —, `2am-s2-75` ex 5 part 1, `2am-s2-73` ex 5 part 1), 36 modelled, 6 adapted (`self-11`, `ex-39`, `act-4`, `ex-37`, `deep-56`, `deep-53`); every value and intermediate ≥ 0 (the corpus' `x + 7 = 2` became `x + 8 = 20`); misconceptions `MISC-MAJHUL-*` (MULTDIV, FLIP, SUBFORM, ADDFORM, DIVDIVIDEND, SWAP, ROLE, RANK, UNDOFIRST); oracle `scripts/practice-oracle/hall-mushkil-muadala.mjs`. Validator rule met: a `counted: false` step must carry a learning point of THIS lesson (the L5 « expression of the perimeter » steps use `P1` of `hall-mushkil-muadala`, not `ibara-harfiya-intaj`'s).
- **2AM `ikhtibar-musawat-mutabayina` (2026-10-29, unit 4 « مفهوم معادلة », lesson 3):** `content/practice/2am/ikhtibar-musawat-mutabayina/` — 50 sheets, 166 questions (140 `choice`, 26 `rational`; 7 `counted: false` — « ماذا يمثّل الحرف » in the L5 situations, `P1` of this lesson —; no `selfCheck`; every question is auto-checkable: a verdict is « نعم / لا », « which values hold » is a single `choice` among value SETS, never `multiChoice`). The lesson never says « معادلة » / « حلّ » (the oracle forbids both) and tests only GIVEN values. **12 `term_exam`** (`2am-s2-73` ex 2 · `2am-s2-50` ex 2 q2 · `2am-s2-52` ex 1 q1 · `2am-s2-59` ex 2 q2 · `2am-s3-31` ex 1 · `2am-s3-39` ex 2 · `2am-s3-41` ex 1 q2–3 · `2am-s3-44` ex 1 q3 · `2am-s2-75` ex 1 q2–3 and ex 5 part 2 · `2am-s2-72` ex 5 part 1 · `1am-s2-79` ex 5 — a misfiled 2AM paper —; each READ by the generator, text layer or rendered scan, numbers changed, one sheet per paper part) / 32 `term_exam_modelled` / 6 `adapted` (`ex-27`, `now-61`, `ex-31`, `self-8`, `ex-28`, `deep-50`, own numbers); per level (term / modelled / adapted): L1 5/3/2 · L2 3/5/2 · L3 1/8/1 · L4 0/9/1 · L5 3/7/0. Values may be signed (unit 3 is a prerequisite) and two unknowns appear from L3; L4 identities are justified by distributivity, never by expanding two brackets. Misconceptions `MISC-IKHTIBAR-*` (ONESIDE, SWAP, BOUNDARY, STRICT, ONEVALUE, MANYEX, JUXTA, SIGNSUB). Oracle `scripts/practice-oracle/ikhtibar-musawat-mutabayina.mjs`: own BigInt rationals with signed values, every relation retyped from the statement and evaluated member by member, every « among given values » list re-tested value by value, polynomial identity on 12 points for « equal for every value » with a single re-evaluated counterexample, the situations' « does the truck cross » sets recomputed (boundary load = 5000-style equality), each signature / tagged distractor rebuilt from its named error and checked false.
- **2AM `wadiya-idmajiya-adad-nisbiya-2` (2026-10-30, Phase 3, unit 3 synthesis):** `content/practice/2am/wadiya-idmajiya-adad-nisbiya-2/` — 50 sheets, 216 questions (148 numeric, 42 choice, 21 `point`, 5 `selfCheck` « أثبت أنّ A + C = 0 » ; 18 `counted: false` — rectangle area and total price, the primary-school multiplication), every question on the synthesis P1; **2 `term_exam`** (`2am-s2-62` ex 5 — the wall corners L(0 ; 4), M(−4 ; 0) and the painting cost, central symmetry replaced by the symmetric about an AXIS —, and `2am-s2-71` ex 5 — a classroom floor in a frame, lengths by subtracting two abscissae or two ordinates, area, tiling cost; both texts READ, numbers changed, one sheet per paper part), 48 `term_exam_modelled` (`modelledOn: 2am-s2`): L1 one short item per lesson · L2 « exercise 1 » of a term-2 paper (five algebraic-sum sheets A, B, C, D + « prove A + C = 0 », five graduated-line sheets: midpoint, opposite, distances) · L3 temperatures / altitudes / time offsets / money / floors (order, change = new − old, range, algebraic sum, `ynrel` yes-no) · L4 rectangles in a frame (fourth vertex, EF / FG by subtraction, area, price) · L5 « الوضعية الإدماجية (08 ن) » with a justified decision (savings? enough budget?). Question kinds recomputed by the oracle: `calc` (two-way evaluation), `dist`, `mid`, `change`, `opp`, `read`, `cmpsym`, `ord`, `ynrel`, `place` / `symx` / `symy` / `rectpt` (`point`), `axis`, `area`, `cost`. Misconceptions reused from the unit-3 lessons (`MISC-JAMNISB-*`, `MISC-JABRI-NOTURN`, `MISC-MASAFA2-*`, `MISC-MUQARANA-NISBIYA-BDG / SI / SBD / OD`, `MISC-TALIM2-*`, `MISC-NUQTA2-*`): no new id. Oracle `scripts/practice-oracle/wadiya-idmajiya-adad-nisbiya-2.mjs` (own BigInt hundredths and a group-reduction evaluator, no import of `packages/core`; every key recomputed, every signature / distractor recomputed from its NAMED error and checked false, printed numbers compared with the retyped ones, text scanned for textbook pointers, forbidden terms, Latin letters / units and signed numbers outside `$…$`); the 211 keyed questions are listed in the file as retyped specs.
- **2AM `jam-tarh-nisbiya` (2026-10-29, unit 3 « الأعداد النسبية », lesson 5):** `content/practice/2am/jam-tarh-nisbiya/` — 50 sheets, 181 oracle-checked questions; every calculation is a sum or a difference of exactly TWO bracketed relatives (no 3-term chain: that is `majmu-jabri`; no fraction); L4 steps that belong to earlier lessons (order, opposite, distance to zero, side of the origin) are `counted: false` and carry this lesson's الكفاءة; **7 `term_exam`** (`2am-s2-62` ex 1 · `2am-s2-50` ex 1 · `2am-s2-70` ex 1 q 1 · `2am-s2-69` ex 1 q 2 (B + C and A − D only) · `2am-s1-73` ex 1 q 3 · `2am-s2-52` ex 3 q 4 · `2am-s2-71` ex 1 q 1 — each READ, numbers changed), 37 `platform_addition` + `term_exam_modelled` (`modelledOn` `2am-s2`), 6 `adapted` (`ex-27`, `self-8`, `deep-48` K = °C + 273,15, `act-4`, `ex-30`, `deep-57` with sum −14 / difference 4). Units are written inside math (`$-3\,{}^{\circ}\mathrm{C}$`). Oracle `scripts/practice-oracle/jam-tarh-nisbiya.mjs`: BigInt hundredths, each sum/difference recomputed by the lesson's rules and cross-checked against direct addition, pyramids and missing terms by substitution, every `MISC-JAMNISB-*` (SIGNLOST, SUBDIST, ADDDIST, SIGNFIRST, SUBNOFLIP, FLIPBOTH, ADDINSTEAD, REVERSED) recomputed from its named error and checked false.

### Screen (`features/practice/exam/`)

The components:
- **`ExamSheet.jsx`** draws the sheet: paper, ruled header « التمرين الأول:(02,5 ن) », the
  ribbon (dashed for `modelled`), « الجزء الثاني: » above a Part II problem, the setup
  sentence, centred formulas, red step boxes « 01 » with (ا)(ب).
- **`SolutionPanel.jsx`** is « الحل النموذجي »: collapsed after each answer, open in a
  self-check.
- **`inputs/SelfCheckInput.jsx`** is the self-check input.
- **`examSheet.js`** holds the pure logic.

Behaviour:
- **Steps are progressive** (owner, 2026-10-06). Only step 01 is shown at first. Once it is
  answered, step 02 is added below it and nothing above disappears. Done steps keep the
  student's answer and its verdict.
- **`PracticeSession.jsx` keeps its single exercise state.** Only the presentation branches
  (`isExam`). The extracted `answerZone` is shared by the card and by the sheet's current
  step.
- **Side column.** On an exam sheet there is none: see « No side column on a sheet » below. Other lessons keep it.
- **Font.** The sheet uses **Amiri**, loaded on demand (`examFont.js`) with system naskh
  fallbacks, while inputs keep Cairo. KaTeX inside the sheet is forced to LTR, because a
  wrapped formula's chunks used to be laid out right to left.
- **The model answer is earned** (owner, 2026-10-06). « الحل النموذجي » opens only after a
  real attempt. An unreadable entry (`syntax_error`) or a step skipped without an answer
  shows nothing, and a proof shorter than 15 characters (`MIN_PROOF_CHARS`) cannot be saved.
  Hints stay available before the attempt; they guide but never contain the answer (the
  validator checks that).
- **Steps area « مراحل الحساب »** (owner, 2026-10-06). It is set per question by `work`:
  `required` when the statement asks for the steps (« مع كتابة مراحل الحساب »، « باستعمال
  خوارزمية … »), `optional` on other PGCD computations; the validator accepts these two
  values on constructed answers only. It is a ruled area (`WorkArea.jsx`) above the answer
  line. The text is sent as `answer.work`, so it is saved in the database and locked with the
  answer, and it is shown again under the answered step. It is capped at 5000 characters on
  the server. While a required area is empty, « تحقّق » stays disabled.
- **Writing maths: MathLive** (owner, 2026-10-06: Arabic right to left, formulas left to
  right). On a sheet, a `rational` answer is a MathLive field (`exam/math/ExamMathField.jsx`):
  - formulas are written left to right and « 7/9 » becomes a real fraction;
  - « * » is typed as « × »;
  - the virtual keyboard (`examKeyboard.js`) has digits, operations, fraction, root, « ; »
    and « PGCD »;
  - the value sent stays what the evaluator reads, `asciiToAnswer` (« 7/9 », « 135 »),
    and the LaTeX is kept as `answer.latex` for the recap.

  « مراحل الحساب » and the « بيّن أن » proof are a LINE editor (`MathLinesEditor.jsx`):
  - each line is either Arabic text (an RTL input) or a formula (MathLive, LTR);
  - Enter adds a line of the same kind, and two buttons add either kind;
  - it is saved as a plain string, one line per line with formulas written `$…$`
    (`linesModel.js`);
  - when read back (`RedactionText.jsx`), every line is RTL and every formula an isolated
    LTR KaTeX island.

  MathLive is loaded lazily (`exam/math/lazy.jsx`; BUNDLE_BOUNDARIES §6). Each field is keyed
  by question, so a field never carries a value over to the next question.
- **« ابدأ »** (owner, 2026-10-06). The current step stays HIDDEN behind « ابدأ » (with its
  time). Pressing it reveals the statement and starts the countdown. The start time is kept
  per attempt in localStorage, so a reload never gives a fresh time. The button stays
  disabled until the question is open on the server, because otherwise the server's late
  reply erased the start.
- **Field width** (owner, 2026-10-06). By default a field is exactly as wide as the correct
  answer (`answerChars`, CSS `--answer-ch`), and that width is also its minimum. The student
  widens it with the corner handle (`resize: horizontal`). Ruled areas resize vertically.
- **Unreadable entry.** On a sheet an unreadable entry (`syntax_error`) is NOT sent: the
  step would stay locked on it. The message « لم أستطع قراءة إجابتك… » appears and the field
  stays editable.
- **The paper** (owner's mock-up, 2026-10-06). The header is ONE row: the three centred
  lines in the middle, « المستوى / دورة » on the right, « المدة / المصدر » on the left (on a
  phone the title comes first). « التنقل في التمرين » lives in the centred window (see below).
  The header's three lines are:
  « الجمهورية الجزائرية الديمقراطية الشعبية », « اختبار تجريبي — محاكاة شهادة التعليم المتوسط »
  (it says « trial »: a practice paper, not an official document) and « مادة الرياضيات ».
  Then comes an information box (`data-exam-info`, two columns):
  - المستوى;
  - المدة المقترحة (`estimatedMinutes`);
  - الدورة: the session year for `official` / `excerpt` (`examSession`), « تدريب » otherwise;
  - المصدر: « BEM 2008 », « على منوال BEM 2015 » or « تمرين الدرس ».

  The exercise sits in a grey band, « التمرين الأول: » on one side and « (02,5 ن) » on the
  other, with « الجزء الثاني: » above it for a وضعية. The sheet ends with « بالتوفيق ».
- **The answer is written on the paper** (owner, 2026-10-06: a small answer gets a small
  field, a big answer a big one, and nothing should feel like a platform). The player sets
  `data-answer-size` from `answerSize(question)`, and `index.css` styles each size inside
  `.sa-exam-paper` only:

  | Size | Used for | Looks like |
  |---|---|---|
  | `short` | a number of up to 5 characters | blue ink on a dotted line, 8rem |
  | `medium` | a fraction, a large number, a pair, a short list | 13rem |
  | `long` | a long list | full width |
  | `proof` | a `selfCheck` step | ruled lines with the red copy margin, growing with the text |
  | `choice` | a closed question | « ☐ نعم ☐ لا » boxes |

  The text in every field is right-aligned, as one writes on an Arabic copy. The internal
  direction of each line stays automatic, so « 7/9 » and « PGCD(…) » are not reversed. The
  red margin of the proof area stays on the right.
  « تحقّق » is a small outlined button next to the field. The « إرشاد » link sits beside it,
  and the hints panel appears only once a hint has been asked for or after a wrong answer.
- **Vertical budget.** The paper header, information box, band and gaps are compact. A
  one-step exercise fits a 1366×768 screen without scrolling, and so does BEM 2008 I-1;
  only long problems (a وضعية) scroll.
- **Around the paper.** `ExamNavigator.jsx` « التنقل في التمرين » (in the centred window):
  - the exercise and its points, and its questions (✓/✕ done, current, upcoming locked
    until the previous one is solved); clicking one scrolls the sheet to it;
  - the flag « أريد العودة إلى هذا السؤال لاحقًا », kept in localStorage only (it is never
    server state);
  - « تُحفظ إجاباتك تلقائيًا ».

  The top bar opens on a clear outlined button « رجوع إلى المستويات » (back to the level
  cards, `data-practice-back`; owner, 2026-10-23) followed by « الدرس: <lesson title> » and the current-level pill « المستوى N · name » (`data-exercise-level`, no longer a loose line above the progress bar), with the pill « محاكاة شهادة التعليم المتوسط
  · رياضيات · 4 متوسط ». The main action is dark green. In the footer « السابق » is on the
  right and « التالي » on the left, the natural RTL order (owner, 2026-10-06). (The countdown is per question; see the next bullet.)
- **Countdown per question** (owner, 2026-10-06; this OVERRIDES the player's former « no
  timer » rule, for exam sheets only). Each step has its own time, `timeSeconds` in the
  content (30–3600, checked by the validator). The defaults were generated by splitting the
  exercise's `estimatedMinutes` by weight (required steps and proofs ×2, optional steps
  ×1.5, yes/no ×0.5, rounded to 30 s, at least 60 s) and can be edited per question.
  - `StepTimer.jsx` counts down from the step's opening, which is kept per attempt in
    localStorage so a reload does not reset it. It turns amber in the last fifth.
  - At zero it shows « انتهى الوقت » and counts the overtime. It never blocks, because of
    the non-blocking invariant.
  - On answering, the time spent is sent as `answer.seconds`, so it is saved in the
    database. It is shown frozen on the step: « أجبت في 01:20 من 03:00 » ✓, or the overtime.
  - Helpers in `examSheet.js`: `stepSeconds`, `formatClock`, `clockState`.
- **No side column on a sheet** (owner, 2026-10-06). The exercise keeps the full width. The
  button « إظهار الكفاءة » (student) or « إظهار إجابات التلاميذ » (teacher) opens a CENTRED
  window (the shared `components/admin/ui/Modal.jsx`: ✕, Escape, click outside). The window
  is wide (`xl`) and stacks its blocks over its full width (الكفاءة first), so no label wraps. The window
  holds « التنقل في التمرين » plus the الكفاءة (student) or the students' responses
  (teacher). Clicking a question in it closes the window and scrolls to that step. Other
  lessons keep their side column.
- **Going back is always possible** (owner, 2026-10-06).
  - Student: the finished steps stay on the sheet, and « السؤال السابق » scrolls to the
    previous one. « التمرين السابق » reopens an exercise finished during this visit, read-only
    (a snapshot of the student's answers, verdicts and model answers), with « العودة إلى
    التمرين الحالي ». Answering it again would count twice for mastery, so it is never
    replayed.
  - Teacher: « السؤال السابق » reopens the previous step blank, and « التمرين السابق » links
    to the previous exercise of the level.
- **Teacher player.** `TeacherPracticePlayer.jsx` renders the same sheet, with the same
  progressive steps and a local history. On a sheet, « إظهار الإجابة المنتظرة » stays
  disabled (with a one-line reason) until an answer has been entered and checked with « تحقّق
  من إجابتي ». An unreadable entry does not count; a saved proof does. Once enabled, it also
  opens the full model answer. Other lessons keep the button always active.

Tests:
- `examSheet.test.js`
- `answers.json` fixture cases `selfCheck-*` (JS ↔ PHP)
- `EvidenceTrustBoundaryTest::test_self_checked_and_uncounted_exam_steps_never_become_evidence`
- `scripts/practice-oracle/bahth-pgcd.mjs`
- browser: `e2e/lesson-kit/practice-exam-sheet.mjs`, which walks levels 1→5, checks the
  progressive steps and the self-check lock, and checks a phone at 360 px

## Earlier-year review link — « راجع » after a wrong answer (2026-10-14)

Owner decision D7: links to earlier years go **inside exercises** too, not only in the lesson's « أستعدّ ».

- **Where:** under the verdict of a wrong answer, in the practice player (`PracticeSession` › `FeedbackPanel`;
  classic card and exam sheet alike) and in the lesson's final-test review (`BossFinal` › `EpreuveReview`;
  student page and classroom presentation). Not on `selfCheck` steps or inert outcomes.
- **What:** up to three compact lines « راجع: <lesson> (<year>) », nearest year first. The lesson title is a link
  when the target lesson is published. When it is not, the line shows the official text of the الكفاءة with no
  link; the link appears by itself when the lesson is published.
- **Authoring: nothing.** The link is derived, never written in an exercise:
  - the question's primary learning point (`learningPoints[role=primary]`, or `assessment.learningPointIds[0]` in a
    lesson test);
  - → its lesson;
  - → the learning net's review links, kept to earlier years (`earlierYearReviewFor`, `LEARNING_NET.md` §3).
  - A question whose LP belongs to an earlier lesson (`counted: false` steps) links from THAT lesson.
- **Component:** `apps/web/src/features/learning/EarlierYearReview.jsx`, the only one. It loads the resolver by
  dynamic `import()`, so the net never enters the entry or the practice chunk. Do not render review links any
  other way.
- **Contract:** never gates and sends no evidence. Strings: `lesson.json › review.*`.

### Lesson questions in the student « focus » view (pilot 2026-11-03)

In a lesson with `studentView: 'focus'` (guide §4sexies), and for the student only:
- A RIGHT answer in `TapQuestion` or `TextbookExercise` shows « صحيح », with its explanation behind « لماذا؟ ».
- A WRONG answer keeps its correction open, as before.
- `commonError` folds behind « خطأ شائع » (it is no longer read before answering).

The fold is `MoreToggle`, which renders inline outside focus, so the teacher view and every other lesson are unchanged. Practice
exam sheets (`features/practice/exam/`) are not affected.

## Level unlocking and the student setting « open all levels » (2026-10-06)

**Default.** `LevelPolicy::levels` opens level 1. Each later level opens once the student
has finished one exercise of the level before it (`EXERCISES_TO_UNLOCK_NEXT`), and the
locked level shows `previous_level_incomplete`. The practice overview is the only place
that decides; nothing else enforces the lock.

**The setting.** Different students start from different places, so the owner wanted the
five levels openable from the start, as a per-student setting.

| Piece | Where |
|---|---|
| Storage: one row per student, created on the first change; no row means the defaults | table `student_settings` (`practice_levels_open`, `practice_validation`, `updated_by`) |
| Rules | `App\Domain\Settings\StudentSettingsService` |
| Effect: when on, every level that has exercises is unlocked | `LevelPolicy::levels(..., $allOpen)` |

Who decides:
- **Student in a class** (an active member of an active class): the teacher, student by
  student.
  - API: `GET/PATCH /teacher/classrooms/{id}/students/{studentId}/settings`, with the
    student resolved through the owned class (`ClassroomAccess::activeStudent`).
  - Screen: the « إعدادات التلميذ » card on the student's page (`StudentSettingsCard.jsx`).
  - The student sees the setting but cannot change it: `PATCH /me/settings` answers 422
    with `managed_by_teacher`.
- **Independent student:** the student, on « الإعدادات », a WINDOW rather than a page (owner,
  2026-10-06). `features/settings/SettingsButton.jsx` opens `StudentSettingsPanel.jsx` in the
  shared `Modal`, through `GET/PATCH /me/settings`. It opens from the gear next to logout in
  the desktop sidebar, from the profile page, and from the BEM hub's header; there is no
  route. The phone top bar has no gear, because it squeezed the bar. Future settings
  get a section on this page.

Tests: `tests/Feature/StudentSettingsTest.php` (default lock, independent student, class
student refused while his teacher succeeds, another teacher refused).

Second setting (2026-10-06): `practice_validation`, which decides who corrects photos and
proofs. See « Image answers and teacher validation » below.

### A plane figure on an exam sheet must be readable (2026-10-08, before the geometry units 9–13)

`validate-exercises.mjs` refuses a `statement.figure` (plane, GeoFigure) on any sheet carrying `metadata.exam` when
`figureQuality(fig)` is not empty — a band wider than 2 : 1, a label on another label or on a point. The fix is a
redesign with the same concept and data (memory rule « figures du manuel : analyser puis redessiner »,
LESSON_DEVELOPMENT_GUIDE §5). At the time of the rule, every figure of the 45 switched lessons passed; 14 figures of
not-yet-converted banks fail and are redesigned when their lesson is converted.
GeoFigure itself (2026-10-08): a length label is pushed off its segment by half its own width (or height) along the
normal — never less than the former 13 px — and the viewBox grows to contain every length label, so « 3,06 m » beside a
vertical edge is neither on the line nor clipped. Applies to every plane figure (lessons and practice).

### Model solution opened = no retry; answer field fits its chrome (2026-10-08, every lesson)

Owner's rules, implemented in the shared players, so they hold for every practice exercise of every lesson:

- **Opening « الحل النموذجي » removes « أعِد المحاولة »** for that question: `SolutionPanel` calls `onReveal` when its
  `<details>` opens, and `PracticeSession` / `TeacherPracticePlayer` hide the retry button for that question
  (`solutionSeenFor`, keyed `exercise:question`). Seeing the answer and then retyping it proves nothing. The exam sheet
  already had one attempt per step; this closes the classic practice page and the teacher preview.
- **Teacher preview: « إظهار الإجابة المنتظرة » only for a question WITHOUT a model solution** (the classic banks of
  units 9–14). When `solution` exists, its boxed result already gives the answer; the panel repeated it word for word.
- **Exam answer field width** = the expected answer + 2 characters, or the `answerFormat` placeholder if longer
  (`answerChars`), PLUS the MathLive keyboard button inside the field (`--answer-chrome`, index.css). Before, the
  keyboard and menu buttons (68 px) left ~5 px for the answer and cut « عدد طبيعي ».
- **`answerFormat` may carry a formula, and the student never sees a raw `$`** (2026-10-22). The case that triggered the rule: « اكتب قيمة $K$ فقط (عدد طبيعي) »
  was displayed with its dollar signs under the field and in the placeholder, reported from the game « مدار ».
  The rule for every input:
  - The visible hint goes through `MathLabel`.
  - String-only attributes (`placeholder`, `aria-label`, the MathLive `\text{}` placeholder) go through `mathToPlain`.

  The inputs concerned are `RationalInput`, `IntegerSetInput` and `SelfCheckInput`. Locked by `features/practice/QuestionRenderer.math.test.jsx`: no `$` in the HTML of any answer type.
  The same rule applies to a skill title (الكفاءة) or a lesson title shown outside a lesson: it goes through `MathLabel`, never `{title}`.
- **MathLive, every field (practice and Math Lab)**: the menu ☰ is hidden (`math-field::part(menu-toggle)`; its items
  were already emptied and it did nothing), and the virtual keyboard has a « ✕ إغلاق » tab on its top edge
  (`features/mathlab/tools/functionGrapher/keyboardClose.js`, installed by `ensureMathLive()`), which closes like the
  built-in `[hide-keyboard]` key: command on the focused field, blur, hide — otherwise « auto » mode reopens it.

### « قوالب الإجابة » — the answer is typed in its own shape (owner STANDARD, 2026-11-09)

**Binding for every question of the platform** (practice, exam sheet, modules, tests, games, « بوصلتي »): a typed answer is
never a bare box with the instructions in its placeholder. The input is drawn as the mathematics it completes, and the
student types ONLY the unknown. Plan with one mock per kind: https://claude.ai/artifact/DLnrZSjqCARn5Xfyju4eZb.

- **One pure rule** — `templateFor(question)` (`features/practice/answerTemplates/templateFor.js`) reads only what the client
  always has (the question's statement, `answerFormat`, `evaluationPolicy`), never the expected answer. Kinds:

  | kind | The input | Read from |
  |---|---|---|
  | `gap` | the box replaces « … » (`\ldots`, `\dots`, `…`, `\square`) INSIDE the formula; for « الأسّ $n$ » it replaces `^{n}`, raised | the question's statement |
  | `form` | « A = ax + [b] »: the asked coefficient is a box, the form is printed | « يُكتب $A$ على الشكل $…$ : اكتب العدد $b$ فقط » |
  | `fraction` | ± toggle, numerator box over denominator box, a real bar; empty denominator = an integer | « كسر », « a/b », `requiredForm` |
  | `percent` | [ ] % | « مئوية », « % » |
  | `quantity` | [ ] + the printed unit (دج, m, cm, °, L, km, kg, سا, د…) | « عدد بالدينار (دج) », « بالمتر »… |
  | `solution` | x = [ ] | « قيمة $x$ » |
  | `digit` | ten buttons 0–9 | « رقم واحد » |
  | `natural` | digits only, thousands spaced while typing | « عدد طبيعي », « عدد العلب » |
  | `signed` | ± toggle + box | « عدد نسبي / صحيح » |
  | `decimal` | one box, « . » becomes « , » | everything else |

  A gap inside a `{…}` group (e.g. `\dfrac{\ldots}{5}`) never cuts the formula: it falls back to the next kind.
- **Rendering** — `answerTemplates/TemplateInput.jsx`: the fixed parts through `RichText` (KaTeX), LTR and isolated in the
  Arabic page; the boxes are real inputs (`inputmode` numeric/decimal — the system's number pad is enough, a fraction has two boxes).
- **Grading unchanged** — `templateValue(template, boxes)` produces the `{ value }` that `AnswerEvaluator` already reads
  (« -5/6 », « 12500 », « -2,5 »). Nothing changes on the server; the answer key never reaches the client.
- **Rollout** — applied to « جولة الانطلاق » (`CompassPage`, 2026-11-09; over its bank: 2 686 typed answers → gap 168,
  form 190, fraction 914, natural 463, decimal 655, signed 153, quantity 124, percent 15, solution 3, digit 1).
  *Planned:* practice session, exam sheet, daily challenge, Madar, modules; merging a step's sibling questions (a, b, c of one
  form) into ONE template with several boxes (owner: yes); sets as chips, the inequality sign selector, vectors as columns,
  proof starters; an explicit `answerTemplate` field for new exercises and a `check:answer-templates` coverage check.
- Tests: `answerTemplates/templateFor.test.jsx`.

#### Typed steps of a guided problem — the step `shape` fields (2026-11-10, PROVISIONAL with the synthesis pilot)

A `numeric` step of a guided problem (`content/problems.js`, played by `GuidedProblem`) has no `answerFormat` to read. It DECLARES
the shape of its input with explicit optional fields. The shape is never derived from `expected`.

| Step fields | The input | Template kind |
|---|---|---|
| `shape: 'quantity'`, `unit: 'm'` | [ ] m — the unit is printed. `unit` is one of the closed list `STEP_UNITS` (m, cm, mm, km, m², cm², mm², km², m³, cm³, L, cL, mL, g, kg, °, km/h, دج); « DA » is refused. | `quantity` |
| `shape: 'form'`, `subject: 'V'`, `factor: '\\pi'` | « V = [ ]π » — the student types the coefficient | `form` |
| `shape: 'gap'`, `subject: 'AM \\times AC'` | « AM × AC = [ ] ». If `subject` holds one `\ldots`, the box takes its place instead. | `gap` |
| `shape: 'decimal'` | one box, « . » becomes « , » — a ratio without unit | `decimal` |

- `subject` and `factor` are LaTeX without « $ ».
- **Only a step that carries `shape` changes.** A step without it keeps the bare box with its `prefix` / `suffix`.
- A step with a `shape` carries no `prefix` / `suffix` (the shape prints them).
- **One pure rule** — `stepTemplate(step)` in `lessons/common/problems/guidedProblem.js` returns the template that `TemplateInput`
  reads, or `null` (no shape, or an invalid one: the bare box, never a broken formula).
- **Validation** — `validateProblem` (run by `check:lessons`) refuses an unknown shape, a missing or unknown unit, a missing `subject` /
  `factor`, a field of another shape, a shape field without `shape`, a `\ldots` inside a `{…}` group, and a shape on a non-numeric step.
- **Rendering** — `NumericQuestion` takes an optional `template` prop: `TemplateInput` replaces the bare box. `parse`, `expected`, the
  saved answer and the feedback are unchanged. `TemplateInput` gained two optional props: `onEnter` (Enter in a box validates) and
  `ariaLabel` (the step's prompt names the value box).
- The answer shown in the list of asks is written in its shape too (`stepGiven`: « 7,25 m », « V = 81π »).
- Tests: `problems/guidedProblem.test.js`, `kit/numericTemplate.render.test.jsx`.

### A formula never breaks across two lines (owner RULE, 2026-11-09)

An inline formula is never split over two lines — above all when there is room around it. `index.css` sets
`.katex { white-space: nowrap }` everywhere. When a formula does not fit, the CONTAINER grows (a wider card — the
« بوصلتي » question card is `max-w-5xl`) or the formula's own row scrolls in its box (`TemplateInput` rows are
`flex-nowrap overflow-x-auto`); the formula itself never wraps. A new screen that shows maths in a narrow column must
check this at 768 px and 1366 px.

### « لوحة الرموز » — the fixed math pad (2026-11-09, owner request + council)

A `rational` answer that can be a FRACTION is written in a MathLive field with a FIXED pad beside it, on every surface that
renders `QuestionRenderer` (« بوصلتي », the daily challenge, Madar refuel, classic practice, the exam sheet, the teacher player).

- **When** — `needsMathPad(question)` (`features/practice/inputs/mathPad.js`), a pure rule on what the client always knows, even
  without the answer key: `answerFormat` names a fraction, a rational or a relative number (« كسر », « ناطق », « نسبي », « a/b »,
  « حاصل قسمة »), or `evaluationPolicy.requiredForm` is `irreducible`/`fraction`. A natural or decimal answer keeps the plain field.
  Measured on 16 466 `rational` answers: ~4 441 expect a fraction, NONE a root (the grader reads rationals only).
- **Keys** — `padKeys(question)`: the fraction key first and wide, digits, −, the decimal comma, ⌫, ← →. √ and the power key appear
  ONLY when the format names them (« جذر », « على شكل قوة »); none does today.
- **Not MathLive's keyboard** — the pad is page buttons (`inputs/MathPad.jsx`) writing into THE question's field: `pointerdown` is
  cancelled so the field keeps its focus, insertion goes through MathLive commands, then an `input` event. With the pad,
  `ExamMathField` gets `pad`: MathLive's floating keyboard stays closed (`policy: manual`, its toggle hidden) and, on a touch screen,
  the system keyboard is suppressed (`inputmode="none"` on its textarea) so the two never fight.
- **Where** — beside the field on the reading-end side from `lg` (left in RTL), under it on a portrait tablet; hidden once the question
  is closed (an answered step). The pad lives inside the answer box, so no screen's layout (the no-scroll player included) changes.
- **Size** — the field writes big (`math-field.sa-exam-mathfield.sa-pad-mathfield`, 1.9rem, index.css): owner, « the numbers are small ».
- **Typing still works** — « 7/9 » on a physical keyboard becomes a fraction, as before. The answer sent is `{ value, latex }` (the
  evaluator reads `value`), as on the exam sheet. Strings: `student.practice.mathPad.*`. Test: `inputs/mathPad.test.jsx`.
- The ☰ menu of MathLive is hidden on every `.sa-exam-mathfield` (index.css), as this contract already required.

### One step split into several questions — the model answer waits (2026-10-07)

A paper step is often typed as several questions on the same `step` (and `sub`): the bound
then the direction of an inequality, « الحل الأصغر » then « الأكبر », « 10cm ؟ » then « 18cm ؟ ».
The step's model answer would give away the next question, so `solutionReady(questions, i,
answeredThrough)` (`exam/examSheet.js`) keeps a question's `SolutionPanel` CLOSED while a later
question of the same group is unanswered; when the last one is answered, all of them open. Used
by `ExamSheet` (done steps, prop `answeredThrough`), the student player and the teacher player
for the current step. Self-check panels (« بيّن أن », photo-only self-marking) are not affected:
the student needs the model answer to mark himself. Authors still keep the first question's
hints and `feedback.correct` free of the next answer.

### The BEM levels page (2026-10-06)

For the lessons listed in `content/practice/exam-style.json` (`isExamLesson`, `exam/examSheet.js`),
`PracticeHub.jsx` renders the « محاكاة » page:
- a header card with the pill « محاكاة شهادة التعليم المتوسط », the title, and the buttons
  « ما أظهرته إلى حدّ الآن », « راجع الدرس » and « الإعدادات » (which opens the settings window);
- the open-session banner;
- the five levels as CARDS (`ExamLevelCards.jsx`). Each card shows its number and name, how
  many exercises come from a real BEM paper (« تمرينان من الشهادة », counted from
  `metadata.exam.kind`), its progress, and a « ابدأ » button (green on the suggested
  level). A locked level gives its reason.

The learning points open in a wide centred window, one column, so titles never wrap. There
is no side column. A lesson not listed keeps the classic hub.

### Medals — the motivation layer (2026-10-06)

The owner wanted correct answers rewarded with medal tiers from bronze to gold. This
overrides the hub's former « nothing playful » stance, for every exam-sheet lesson.

**The rule.** `exam/medals.js` (`medalFor`) and `App\Domain\Practice\Medals` (PHP)
implement it, both checked against `exam/medals.fixture.json`. A CORRECT answer on an exam
step earns:

| Medal | Condition | Points |
|---|---|---|
| 🥇 gold | no hint, within the step's time | 3 |
| 🥈 silver | one fault: one hint OR over time | 2 |
| 🥉 bronze | two faults or more | 1 |

- A wrong answer earns nothing, and neither does a self-checked « بيّن أن » or a self-marked
  photo answer (`evaluated_by = self`). A proof or a photo answer judged correct by the
  TEACHER (`evaluated_by = teacher`, « تصحيح الأستاذ ») earns its medal, with the time
  actually spent (`medalFor({…, evaluatedBy})`, `Medals::medalFor(…, $evaluatedBy)`).
- The points make a rank (`rankFor`): مبتدئ 0 → مجتهد 15 → متفوّق 40 → بطل الشهادة 80.
- Nothing is stored. Medals are DERIVED from the saved attempts (outcome, `hints_used`,
  `answer.seconds`) against the content's `timeSeconds`. Only the first answer per question
  counts. Endpoint: `GET /lessons/{code}/practice/medals` → `{total, levels}`.

**Screen** (`features/practice/medals/`):
- `MedalCelebration.jsx`: after a correct answer, the medal spins in, a shine crosses it,
  gold throws confetti, and a line gives the reason and the points. It never blocks
  (`pointer-events: none`), dismisses itself, and is quiet under reduced motion.
- `Medal.jsx`: the SVG medal, with a ribbon in the Algerian flag's colours.
- `MedalTray.jsx`: « ميدالياتي في هذا الدرس: » in the sheet's top band, live.
- Each answered step shows its medal. The finished exercise shows its haul, plus « تمرين
  ذهبي! » when every step is gold.
- `MedalCabinet.jsx`: « خزانة الميداليات » on the levels page (totals, rank, progress to
  the next rank, the rule in one line). The level cards show their medals.
- The teacher view plays the celebration locally and records nothing.

**Sound.** `medalSound.js` plays a short synthesised fanfare: gold gets the richest one,
bronze the shortest. It plays only when « الصوت والمؤثرات » is on in the settings window.
That is the device preference already used by the lessons (`useEffectsPreference`), off by
default.

## Saved answers and locked exam steps (2026-10-06)

Every answer is saved on the server (`question_attempts.submitted_answer`).

- **An answered step is locked.** On an exam sheet a step is answered once. Re-opening it
  (going back, reloading) returns the same attempt with its saved answer, its outcome and
  `normalized` (`PracticeSessionService::openQuestion`, `POST …/questions` → `attempt.answer`).
  The student player adopts that attempt uuid and shows the answer locked. There is no
  « أعد المحاولة » on a sheet, because the model answer is visible once the step has been
  answered.
- **« التمرين السابق » reads the database.** It is rebuilt from
  `GET /practice/sessions/{id}/answers` (the session's exercises with the first saved answer
  per question), so it survives a reload and shows only what was actually recorded.
- **Teacher view.** On a sheet, « السؤال السابق » scrolls back to the locked step instead of
  reopening it. The teacher view is still never recorded (« تصفّح دون تتبّع »).

Test: `EvidenceTrustBoundaryTest::test_an_answered_exam_step_reopens_locked_with_its_saved_answer`.

## Image answers and teacher validation (2026-10-06)

The owner wanted students to be able to photograph their handwritten work, and teachers to
correct it. It applies to every exam sheet (any lesson listed in `content/practice/exam-style.json`;
the engine has no lesson list of its own). Classic cards have no photo picker.

### Owner decisions (2026-10-06)

| Question | Decision |
|---|---|
| Teacher mode, step with an auto-checkable typed answer | The automatic verdict and model answer appear IMMEDIATELY, as today |
| Does the teacher's verdict count? | Yes: mastery evidence `evaluated_by = teacher` and a medal, with the time limit applied to the time actually spent |
| Limits | 3 photos per step, 5 MB before compression, kept 12 months; a student who leaves the class takes the photos back (the teacher loses access) |
| Review queue | A new teacher page « تصحيح الإجابات » (`/enseignant/tashih`), all classes, class filter, counter in the menu |
| Notification | In the app only (a bell); NO e-mail |
| Annotation | The teacher can DRAW on the photo (red pen), saved as a separate image |
| What enters the queue | Photos, proofs (`selfCheck`) and steps with `work: required`; a typed answer alone stays automatic |

### The photo

- **Picker** (`exam/images/AnswerImagePicker.jsx`), under the answer field of every exam
  step: « صوّر ورقتك » (`accept="image/*" capture="environment"`, the camera on a phone) and
  « اختر صورة » (a file). Each photo is resized in the browser (`prepareAnswerImage`: JPEG,
  1600 px longest side, EXIF orientation applied) and uploaded at once:
  `POST /practice/question-attempts/{attemptUuid}/images` (multipart `image`). It can be
  removed (`DELETE /practice/answer-images/{uuid}`) until the step is answered. After that it
  is LOCKED with the answer (`answer_locked`).
- **Answer = typed, photo, or both.** « تحقّق » opens with a photo alone. A photo also
  satisfies `work: required`.
- **Server** (`App\Domain\Practice\AnswerImageStore`):
  - private disk `local` (`storage/app/private/answer-images/{userId}/`), never a public
    URL;
  - type read from the CONTENT (finfo + getimagesize: JPEG, PNG or WebP), with a guard
    against decompression bombs;
  - RE-ENCODED to JPEG by GD (EXIF orientation applied, then every metadata block, GPS
    included, is gone), longest side ≤ 1600 px;
  - 3 per step (`image_limit_reached`), 5 MB (`image_too_large`), `expires_at` = +12 months.
  - Refusal codes are translated by the client (`practice.exam.images.errors.*`).
- **Serving.** `GET /practice/answer-images/{uuid}` serves only the owner. `GET
  /teacher/answer-images/{uuid}` serves only a teacher whose ACTIVE class contains the
  student (`TeacherPracticeResponses::rosterOf`). Add `?annotated=1` for the teacher's
  version. Responses carry `Cache-Control: private, no-store` and `nosniff`. The client loads
  them with the token (`apiBlob`) and shows an object URL (`AnswerImageGallery.jsx`,
  `BlobImage`).
- **The saved answer.** `submitted_answer.images` = the image uuids, read from the
  DATABASE. A list sent by the client is ignored. `imageOnly: true` is also a server key,
  set when the photos come with nothing machine-checkable (an empty or unreadable field, a
  `choice` / `multiChoice` step with no box ticked — `PracticeEvidenceRecorder::nothingPicked`,
  2026-10-06 — or a proof with no text). Such a step waits (teacher or self-mark); it is
  never answered « ليس بعد » on the spot.
- **Retention.** `smarter:answer-images:purge` (scheduled daily at 04:10) deletes expired
  photos, file and row, and the folders of deleted accounts (a cascade removes the rows,
  not the files).

### Who validates — `student_settings.practice_validation`

`self` (« مستقل », the default) or `teacher` (« تصحيح الأستاذ »). It is set PER STUDENT
by the teacher on the « إعدادات التلميذ » card (`PATCH
/teacher/classrooms/{id}/students/{studentId}/settings` `{practiceValidation}`); a student
cannot set it. It APPLIES only while the student is an active member of an active class:
`StudentSettingsService::practiceValidation`, exposed as `effectiveValidation` by `GET
/me/settings` and shown read-only in the student's settings window. Outside a class the
student is always `self`.

`PracticeEvidenceRecorder::route()` decides, on the FIRST answer to an exam step:

| Mode | Step | Result |
|---|---|---|
| any | typed answer, no photo, no required work | judged by the server, as before |
| `self` | photo only (`imageOnly`) | `abandoned` + `self:pending` → model answer + « مطابق / غير مطابق » (`SelfMarkChoice`) → `evaluated_by = self`, never evidence, never a medal |
| `self` | proof (`selfCheck`) | unchanged self-check flow (`evaluated_by = self` once marked) |
| `teacher` | proof, or photo only | `abandoned` + `review:pending`; an `answer_reviews` row with `kind = verdict`; no verdict, no model answer, no medal; the student CONTINUES; self-marking is refused (`review_pending`) |
| `teacher` | typed answer + photo, or `work: required` | judged by the server now (evidence, medal, model answer) + an `answer_reviews` row with `kind = feedback` |

While the server decides an exam step with a photo or a proof, the player shows NO local
prediction: it cannot know who will judge, and showing it would flash the model answer.

### The teacher's review — « تصحيح الإجابات »

- `GET /teacher/reviews[?classroom=]` returns the pending copies of the teacher's students,
  oldest first. A foreign `classroom` is 403. `GET /teacher/reviews/count` feeds the menu
  badge (`useReviewCount`).
- The page is `pages/teacher/TeacherReviewsPage.jsx`. For each copy it shows the student,
  the class, the step statement read from the content, the typed answer, the proof, the
  work, the photos, the time and the model answer (folded). Then the verdict (صحيحة / غير
  صحيحة; for `feedback`: سليم / يحتاج مراجعة) and a comment (≤ 2000 characters).
- **Annotation** (`features/teacher/reviews/AnnotationEditor.jsx`). A canvas at the photo's
  real size, a red pen in three widths, undo and clear. « احفظ » composes a JPEG and sends
  it to `POST /teacher/answer-images/{uuid}/annotation`, re-encoded like the photo and
  stored NEXT TO the original, which never changes.
- **Decision** (`POST /teacher/reviews/{id}` `{verdict, comment}`, `AnswerReviewService`).
  A copy is judged once (409 `already_reviewed` after that).
  - `verdict` kind: `PracticeEvidenceRecorder::recordTeacherVerdict`. The verdict becomes the
    attempt's outcome (`normalized = teacher:<verdict>`, `evaluated_by = teacher`), and
    evidence is written through `ProgressEngine` (`EvidenceEvent::EVALUATED_BY_TEACHER`,
    full weight; never for `counted: false`). This is still the ONLY door from practice to
    mastery.
  - `feedback` kind: the outcome does not change.
- **Scope.** The same scope as the whole student file: active members of the teacher's
  non-archived classes. A student who leaves drops out of the queue, and the old teacher gets
  404 on the photos. The student keeps everything, and can self-mark a copy that was still
  pending (the request becomes `withdrawn`).

### The notification and the read-only correction

- When the teacher decides, the student gets `App\Notifications\AnswerReviewedNotification`
  on Laravel's `database` channel (table `notifications`; no e-mail). Its data is
  `{reviewId, verdict, lessonCode, exerciseId, questionId}`; no photo, no comment.
- **Bell** (`features/notifications/NotificationBell.jsx`, `GET /me/notifications`, `POST
  /me/notifications/{id}/read`, `…/read-all`). It sits in the desktop sidebar (opening
  upward) and in the phone top bar. It refreshes every 2 minutes and when the tab becomes
  visible; the mounted bells sync through the `sa:notifications-changed` event.
- **Opening a notification** goes to `/espace/tashih/:reviewId`
  (`pages/student/practice/AnswerReviewPage.jsx`, `GET /practice/reviews/{id}`, owner only).
  It shows EXACTLY that exercise as an exam sheet up to that step, read-only: the earlier
  steps with their answers, then the reviewed step with the saved answer, the photos (the
  « مصحّحة » version first), the verdict and comment (`ReviewStatus.jsx`) and the model
  answer.

### Where the copy is read again

`AttemptPresenter::answer` is the one shape: answer, outcome, `normalized`, `evaluatedBy`,
`images`, `review`. It is used by « التمرين السابق », a reopened step (`POST …/questions`
also returns the photos attached BEFORE the answer, so a reload keeps them), the
correction page, the queue, and « إجابات تلاميذي » (`TeacherPracticeResponses`, photos plus
`ReviewStatus` in `StudentResponsesPanel.jsx`). History entries carry `images`, `review` and
`evaluatedBy` (`questionHistory.historyEntry`), and `ExamSheet` (`imageLoader` prop) shows them
on the finished steps.

Tests:
- `tests/Feature/AnswerImagesAndTeacherReviewTest.php` covers re-encoding without EXIF,
  1600 px, the limits, the scope, self-marking a photo, teacher mode end to end (queue,
  annotation, verdict, `teacher` evidence, medal, notification, correction page), leaving
  the class, the purge, and that a student cannot choose the mode.
- The privacy suite (`TeacherPrivacyContractTest`) includes the queue and its counter.
- `TeacherAuthorizationTest` maps `{uuid}`.
- `exam/images/answerImages.test.js`.
- `medals.fixture.json` has 5 new cases.
- Browser: `apps/web/e2e/lesson-kit/practice-image-answers.mjs` (36 checks; needs a test
  class, see its header).

### Two zones on a step that asks for working (2026-10-06)

When a step has `work` (required or optional), the answer area shows TWO numbered zones so the
student sees where each thing goes:
1. **« ١ مراحل الحساب »** — an amber panel with its ruled lines (`WorkArea`, the `ZoneNumber` badge).
2. **« ٢ النتيجة النهائية »** — below a dashed divider, a green-framed box holding the answer
   field and « تحقّق » (`data-result-zone`). Same markup in the student player and in
   `TeacherPracticePlayer`.

Steps without `work` keep the single field with no label.

### Which exercise next — the selector (Mastery V2)

`GET /practice/sessions/{id}/next` → `{exerciseId|null, reason, candidates}` from
`App\Domain\Practice\ExerciseSelector`, which READS the Learning Point states and the registry
and never writes mastery (and the engine never calls it). Ranking inside the session's level:
weakest primary point (gap > reinforce > unassessed > stale mastered > mastered) → exercise never
seen → template never succeeded → targets a recent misconception → stable tie-break seeded by the
session. Cost is one level of one lesson (10 queries at 15 and at 2 500 exercises). The client
(`features/practice/nextExercise.js`) falls back to content order when the call fails or
`practice.selector_enabled=false`, ends the session on `exerciseId: null`, and shows
`practice.selectedBecause.*` for `weak_learning_point` / `recent_misconception`.


## The practice player — screen contract (2026-09-24)

`pages/student/practice/PracticeSession.jsx` is **one** page and keeps **one**
exercise state (the React state it already had: question index, answer,
evaluation, hints, busy). The redesign added presentation only; the API calls,
the server verdict, the non-blocking invariant and the notebook are unchanged.

**Layout (second pass, 2026-09-24).** The page is full screen width with a
gutter of 60 px from 640 px up and 20 px on phones (`.sa-page.sa-page--flush`,
`index.css`; ×3 at the owner's request 2026-09-25, 20 px at every size before;
no max-width) and `py-6 sm:py-8` vertically — the SAME frame on the hub, the
player, the summary (« الحصيلة ») and the daily challenge (owner request,
2026-09-25; the summary used the wider 40/60 px gutter before). Mobile/tablet: one column — Learning Point module → exercise header
(level · level name · estimated minutes · tags, `h1` title) → statement
(«نصّ التمرين») → question history → current-question card → footer. From
`xl` (1280 px): ONE side column (28rem, 30.6rem at `2xl` — widened ×1.7 at the owner's request, 2026-09-24; sticky) at the
start edge holding the Learning Point module and «سياق السؤال»
(`QuestionContextPanel`: every question — done with the student's answer,
current, upcoming as «سيظهر بعد السؤال n» without its statement); the exercise
takes all the remaining width. In وضع القسم the grid collapses
(`[[data-sa-classroom]_&]:block`) and the side column is `ClassroomHidden`.
Each fact appears once: the question/exercise position lives only in the
card header (`SessionProgress`: «السؤال n من N» is the card's `h2`, N = the
questions of THIS exercise, with one tone-coloured segment per real question,
and «التمرين n من N» of the level); the « what's left » sentence is `sr-only`
(`aria-live`). The first pass's third column (question squares, session
correct-count tile, SVG encouragement) and the «تذكّر» card were removed as
duplicates.

**The Learning Point module (`LearningPointProgress.jsx`).** Always on top: the
eyebrow «الكفاءة», the point's name (the primary Learning Point of the
**current question** — 25 of the 85 4AM exercises mix points —,
`currentLearningPoint()`), a **star path** and two counters.

- *Stars = the real Mastery V2 state*, never an invented score: three stars
  joined by a line, lit by `masteryStage()` — `unassessed` 0, `gap` 1,
  `reinforce` 2, `mastered` 3 — labelled with `student:mastery.*`. The next
  star has a dashed ring (the stage in progress); a star that lights up fills
  with a small spring (off under reduced motion).
- *Counters = activity*, in completion words only («تمارين أنهيتها», «أسئلة
  أجبت عنها» — never إتقان/متحكَّم, ARABIC_RTL_CONTRACT): exercises completed /
  total and questions answered / total, **separately**, from the overview's
  `learningPoints[].practice`.
- Refreshed (overview re-fetched) after every recorded answer and every
  completed exercise; a failed fetch never blocks the session. Below `xl` the
  name clamps to two lines (full name in `title`) and stars + counters share
  one row.

**Refusals of `GET /lessons/{code}/practice/overview` and `POST
/lessons/{code}/practice/sessions` (2026-09-25).** Status 422 (the content-access
convention shared with the final test and the evidence routes) with a closed
`code`: `practice_unavailable` — the lesson is not in
`content/practice/active.json` **as the server reads it** — or
`lesson_unavailable` — `ContentAccess` refused (tier, publication, hidden by
the teacher). `PracticeHub` renders `student.json` →
`practice.unavailable.{code}`. Unknown lesson → 404, guest → 401. The server's
copy of `content/practice/` is shipped and fingerprint-checked by the deploy
(`smarter:practice-doctor`, `docs/deployment/DZ_FIRST_DEPLOYMENT.md`); a missing
`active.json` is never cached. `PracticeOverviewTest` locks all of it.

**`GET /lessons/{code}/practice/overview` — `learningPoints[].practice`**
(additive, 2026-09-24): `{exercises, exercisesCompleted, questions,
questionsAnswered}` from `App\Domain\Practice\LearningPointPracticeProgress`.
An exercise belongs to a point when at least one of its questions has it as
**primary**; `questions` is the sum of the REAL question counts of those
exercises (4 + 6 + 3 = 13 — never exercises × a fixed number); an exercise is
completed when one of the student's `exercise_attempts` in this lesson is
`completed`; a question is answered when one of their `question_attempts` on it
has `submitted_at` (right or wrong — correctness belongs to mastery). The same
content index as the level counters; no mastery is computed here. Pure core
`tally()` tested in `tests/Unit/Practice/LearningPointPracticeProgressTest.php`
(scenarios: 4+6+3, five uneven exercises, 0 / 1 / all completed, mixed points).

**The practice home (`PracticeHub.jsx`, levels page) — same language.** Same
frame (`.sa-page--flush`, 20 px, full width). Header: «التمارين» eyebrow, the
lesson title (`h1`), «راجع الدرس» as a tertiary link. An open session is one
row with the page's only solid button («واصل»). The five levels are a
**path** (`LevelSelector.jsx`): one row per level joined by a rail — node
(number / ✓ done / 🔒), «المستوى n · name», a bar with `completedCount /
exerciseCount` isolated LTR («تمارين أنهيتها»; the former «{{done}} من
{{total}}» inside `dir="ltr"` rendered «0 1 من»), the مُقترح / مكتمل chip and
«ابدأ» / «تمرّن من جديد». A locked row is not a button and says which level
unlocks it. The lesson's Learning Points reuse **the same
`LearningPointProgress` module** as the player (star path + the two counters,
`eyebrow={false}`, `h3`), with the `reinforce` reason / `mastered` freshness
under it; from `xl` they sit in a 30.6rem column at the start edge, below
`xl` after the levels (choosing a level is the page's action).

**Button hierarchy.** One solid primary at a time: «تحقّق من إجابتي» before
the answer, then «السؤال التالي» (outline/secondary — disabled — until an
answer is checked). Secondary: «أعِد المحاولة». Tertiary (text + icon, no
fill): «إرشاد», «السؤال السابق», report. The notebook is not in the card: it
is the lesson's floating « 📓 كرّاسي » pill (see `NOTEBOOK.md`), and the
question footer keeps its end (`lg:pe-36`) clear for it.

**Question history — derived, never a second store.** When the student leaves
a question with «السؤال التالي», `historyEntry()`
(`features/practice/questionHistory.js`, pure, tested) snapshots what the page
already holds: question id/number/statement, the student's answer formatted
per `answerType` (`formatAnswer`: typed answers stay the student's own
writing, isolated LTR, never fed to KaTeX; a QCM shows the choice's content),
the **displayed** (server) verdict and its tone, `misconceptionId`, the
feedback message, hints used, and `retried` (validated more than once — the
server counted only the first answer). Entries are replaced by question id
(`recordQuestion`, idempotent) and reset when the next exercise loads. The
previous question renders as the «السؤال السابق» card (full statement, answer
in a read-only box, verdict in words, feedback behind «عرض التوضيح»); older
ones as one-line collapsed rows below `xl` and in «سياق السؤال» from `xl`.
Nothing about the **current** question's solution is shown anywhere.

*Not persisted:* the server re-opens an exercise at question 1 after a reload
(new attempt UUIDs), so the history starts empty again — it mirrors what the
player shows, and inventing a client-side cache would diverge from the
server's attempts. `Not yet implemented`: resuming mid-exercise.

**One tone table.** `outcomeTone(outcome)` maps the six outcomes to
`correct | partial | incorrect | neutral`; `features/practice/toneStyle.jsx`
gives each an icon (✓ ◐ ✕ ?) and colours. An incorrect answer is **orange**,
never alarm red, and colour is never the only signal (icon + label
everywhere). Feedback, history, context column and progress segments all use
it.

**Interaction rules.**

- The answer area is a `<form>`: Enter in a field validates; choices and
  bracket toggles are `type="button"`.
- After validation, focus moves to the feedback (`tabIndex=-1`,
  `role="status"`), because the button that had it disappears.
- «أعِد المحاولة» **keeps** the answer so the student corrects it, and
  returns focus to the field.
- The hint panel is one collapsed line («💡 الإرشادات · 3 إرشادات متاحة») until
  a hint is requested; it opens itself on the first hint and resets per
  question.
- Hints stay available after an **incorrect** verdict (the server accepts a
  hint on an answered attempt; evidence is already recorded, so this cannot
  farm mastery). They close after a correct one; revealed hints stay as a
  trace. `HintPanel` shows the ladder: revealed / next (the only request
  button) / locked slots labelled by `type` (ملاحظة · توجيه · خطّة الحلّ),
  never by content.
- «السؤال التالي» lives in a footer, disabled only until an answer is checked
  — right or wrong (non-blocking). «السؤال السابق» scrolls to the previous
  card: it re-reads, it does not re-open an attempt. The footer is sticky
  above the mobile tab bar except on very short screens (landscape phones).
- The previous question is a compact summary (number, verdict in words, the
  student's answer, the statement clamped to two lines; «عرض التوضيح» unfolds
  the statement and feedback) — no large card for finished work.
- Arrival (`QuestionArrival.jsx`): on «السؤال التالي», tall screens scroll the
  «السؤال السابق» summary to the top (context, then the question); phones scroll
  to the current card. Focus goes to the answer field on a fine pointer and to
  the question heading on touch (no virtual keyboard popping over an unread
  question). New exercise: top of page, focus on the `h1`. Nothing scrolls in
  وضع القسم. `prefers-reduced-motion`: instant scroll, and framer-motion runs
  under `MotionConfig reducedMotion="user"`.
- Exercise completion shows «أتممت هذا التمرين · الإجابات الصحيحة: n / N»
  (`exerciseScore`) — the only celebration; no confetti per question.
- Buttons in the card carry an explicit text size: inside the classroom frame
  an inherited size is `1rem × scale`.

Tests: `questionHistory.test.js`, `QuestionHistory.test.jsx` (history, context
column, hint ladder without leaks), `learningPointProgress.test.js`,
`LearningPointProgress.test.jsx` (scenarios A, C, D, E; no mastery word in the
counters), `notebookAvailability.test.js`, `pageFrame.test.js` (`--flush`);
browser: `e2e/lesson-kit/practice-progress.mjs` § 3bis, § 6 (history on
`wadiya-idmajiya-aadad`, «الدنّان») and § 7 (the Learning Point module equals
the server's overview row).


## « مدرّب الامتحان » — the exam coach of an exam sheet (PILOT, 2026-11-15)

**Status: pilot on the lessons whose pack has `coach` (`lesson.pack.js`, `LESSON_V2.md` §1 — today: `qasim-adad-tabii`; the
list `content/practice/exam-coach.json` was deleted on 2026-11-17). Not a rollout rule.**
The sheet, its steps, its timer and the server's grading are unchanged; the coach changes what surrounds them
(`features/practice/exam/examCoach.js`, `ExamCoach.jsx`, four small edits in `PracticeSession.jsx`):

- **« قاعة الامتحان »** stands before the sheet: phone away, paper and pen out, silence, the clock — and « أبدأ الامتحان » waits for
  a mode and for « ورقتي وقلمي أمامي ». On a coached sheet the medal jingle is silent, and a strip above the answer keeps
  « وضع الامتحان · بلا موسيقى · حلّ على ورقتك أوّلًا ».
- **Two modes, chosen by the student and changeable at any time** (saved per student):
  - `guide` « أرشدني فقط » — the answer is NEVER shown: after a mistake, three nudges one by one (re-read what is asked, the rule,
    the trap), and « أعد المحاولة » is offered even on an exam sheet. A test checks on the 172 questions of the bank that no line of
    the solution appears in this mode.
  - `explain` « اشرح لي الحلّ » — the solution is told as a lesson, one step per tap: what is asked, the rule used, each written
    line, the result, the trap, the exam tip, then « rewrite it in your notebook without looking ». Once it is shown there is no
    retry (retyping a visible answer proves nothing — the existing rule).
- **« دفتر أخطائي »** — after ANY mistake, in both modes: « خذ كرّاسك واكتب خطأك، حتّى لا تكرّره », with the lines to copy on paper
  (the question, « خطئي » in the student's own words, what to remember; the right answer only in explain mode).
- **The rule reminded is the lesson's own** (`loadRule`: the memo sheet of `knowledge.jsx`, by the question's primary learning
  point) — never retyped. A lesson joins the pilot by being listed AND by having its entry in `KNOWLEDGE` (examCoach.js).
- Check (needs the local API and a student token): `node apps/web/e2e/practice-exam-coach.mjs <outDir> <token file>`.
  Unit: `examCoach.test.js`. The practice page is a paper sheet and scrolls like one; the no-scroll rule is the game world's.
