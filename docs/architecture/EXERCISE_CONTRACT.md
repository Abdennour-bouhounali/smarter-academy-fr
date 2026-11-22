# Exercise Contract

> **Status (2026-11-22).** Covers the practice engine: answer types, the evaluator (JS preview, PHP judge), outcomes,
> the non-blocking invariant, the bank's metadata and checks, statement figures, the exam sheet, the practice player,
> photo answers, the exam coach. Imported from the Algerian platform (DZ dev 7f4cef1c) on 2026-11-22. True here: the
> engine (`packages/core/practice/`, `Domain/Practice`, `features/practice/`, `scripts/validate-exercises.mjs`, the
> oracle ENGINE `scripts/practice-oracle/{engine,helpers}.mjs`). Not true here: `content/practice/` holds no bank
> (`active.json` and `exam-style.json` are `[]`, `policy.json` has no lesson); the in-lesson exercises of the deleted
> module lessons are gone. Since 2026-11-22 the practice screens and the exam sheet are French and read left to right
> (`apps/web/src/i18n/locales/fr/student.json › practice.*`, `teacher.json`; `FRENCH_LANGUAGE_CONTRACT.md`): the sheet
> is drawn as a brevet paper (« Diplôme national du brevet »). Since 2026-11-23 the VALIDATOR is French
> (`scripts/validate-lib.mjs`): sub-items « a) », « b) »…, the brevet provenance (`brevet` sources, « Brevet <year> »
> badges), the two brevet tags `brevet` / `calculator` (§« The brevet tags »), French typography of every visible text
> (§« French typography of the bank »). A practice difficulty step is a « palier » (« Palier 1 »…« Palier 5 »).

---

## 0. The exercise system that exists

The **practice engine**: JSON in `content/practice/<grade>/<lesson>/level-{1..5}/` (no folder exists yet), rendered
by `PracticeSession` + `QuestionRenderer` in the student space, evaluated by `practice.evaluateAnswer` for every type,
persisted on the server (sessions, exercise and question attempts, hint events, evidence), counted for mastery
(`assessment_type: 'practice_exercise'`), and **judged by the server** (Mastery V2) — the browser's verdict is only an
instant preview. The other evidence sources are a v2 lesson's game-world first tries (`LESSON_V2.md` §1bis) and the
server door of a final test (`LEARNING_ARCHITECTURE.md` « Evidence sources »). The in-lesson exercises of the module
lessons (`content/exercises.js`, `TextbookExercise`) were deleted with those lessons.

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
decimal POINT are the SAME writing (owner, 2026-10-07): « 1.5 », « 1,5 » and « 1 » + the Arabic decimal separator U+066B + « 5 » are all `correct`
when the key is « 1,5 » (`sameWriting()` in JS, `AnswerEvaluator::sameWriting` in PHP, shared fixture
`rational-decimal-dot-same-writing`).

Answer types: `choice`, `multiChoice`, `rational`, `affine`, `interval`,
`point`, `integerSet`.

**`MathLive is not used.`** The dependency is installed and `MathInput.jsx`
wraps it, but nothing imports that component. `compareMathExpressions` and the
compute-engine path are likewise unused by any live page. Free algebraic input
does not exist: answers are choices, rationals, sets, intervals or points, all
exactly comparable.

**Retry, as implemented.** In the practice engine there are two different « again »:

- **« Réessayer » inside an open question** re-uses the same attempt id: the
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

The client never decides anything that counts for mastery.

```
Student input — PracticeSession
     │
     ▼
evaluateAnswer (packages/core/practice/answerEvaluator.js) — client preview only
     │
     ▼
SERVER judge (apps/api/…/Practice/Support/AnswerEvaluator.php) — the authority; kept
equivalent to the JS by the shared fixture packages/core/practice/fixtures/answers.json
     │
     ▼
evidence → versioned mastery engine
```

`packages/core/validation/` (`validateNumericAnswer`, `validateChoiceAnswer`) still exists and is tested; only `packages/core` itself (the barrel, `mathComparison.js`) imports it — no page calls it.

### Student input normalisation — one rule for every parser (2026-09-29)

A writing convention is never a mathematical error (the rule was written for an Arabic interface, where a keyboard
types Arabic-Indic digits; it is kept: it costs a French student nothing). Every parser of student input
therefore goes through `toLatinDigits` (`packages/core/numberFormat.js`), and
its PHP mirror `Rational::latinDigits`.

| Input | Integer (`parseFr`, deleted 2026-11-22) | Numeric (`parseDec`) | Fraction (`Rational.parse`) | Integer set (`parseIntegerSet`) |
|---|---|---|---|---|
| Arabic-Indic digits U+0660–U+0669, Persian U+06F0–U+06F9 | accepted | accepted | accepted | accepted |
| `.` | only as a well-formed thousands separator (`4.582`); `81.0`, `1.2` → not a number | decimal point | decimal point | only a TRAILING dot is dropped; `1.5` stays a syntax error |
| `,` / the Arabic decimal separator U+066B | `,` → not an integer | decimal separator | decimal separator | `,` `;`, the Arabic comma U+060C and semicolon U+061B are separators |
| spaces, thin/nbsp | ignored | ignored | ignored | separators |
| `0x12`, `5e1` | not a number | not a number | syntax error | syntax error |
| `{…}`, `\{…\}`, the Arabic « and » (U+0648) | — | — | — | accepted as set notation / separator |
| `∕` (U+2215) | — | — | read as `/` | — |

Before this rule, `parseFr` (deleted on 2026-11-22, used by nothing) deleted every dot (« 81.0 » accepted as 810, « 810.0 »
refused as 8100), refused 810 in Arabic-Indic digits, `Rational.parse` refused 3/4 in Arabic-Indic digits as a syntax
error (ending the one-attempt question). Changing a practice parser is a CONTRACT change on both
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

## Phase 8 additions (2026-09-18)

- **`answerType: 'integerSet'`** — a set of natural numbers (in English, « name every divisor of 84 »). Free separators, Arabic-Indic digits accepted; order and duplicates ignored; a strict subset is `partially_correct`. Evaluator `packages/core/practice/answerEvaluator.js` (`parseIntegerSet`), widget `features/practice/inputs/IntegerSetInput.jsx`.
- **`evaluationPolicy.requiredForm: 'irreducible'`** is now **enforced** for `rational`: a value-equal but non-reduced fraction yields `partially_correct` with `feedbackKey: 'notIrreducible'` (`feedback.notIrreducible`). A **decimal** (`1,75` for `7/4`) is not an irreducible fraction either: it is `partially_correct` / `notIrreducible` too, unless the value is an integer (2026-09-24 answer audit; JS and PHP evaluators and the fixture).
- **`content/practice/policy.json`** — per-lesson coverage minimum with a named source, read by `validate-exercises.mjs` (invariant 12). The default 3 × 5 is unchanged for every other lesson.
- **`metadata.source`** — provenance of an exercise file (the textbook checker `check:textbook` that read it was deleted on 2026-11-22).

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

## The brevet tags — `brevet` and `calculator` (owner's council, 2026-11-22, plan §7bis)

Two fields at the EXERCISE level, beside `templateId`. The five paliers (`level` 1–5) stay: they are the progression;
the tags say what part of the brevet the exercise trains and whether a calculator is allowed. From the 2027 session
the brevet's mathematics paper is part 1, automatisms WITHOUT calculator (6 points, 20 min), and part 2, problems
(14 points) (plan §5, 2A).

| Field | Values | Meaning |
|---|---|---|
| `brevet` | `1` · `2` · `null` | `1`: an automatism of part 1 (no calculator); `2`: a problem of part 2; `null`: an exercise of the bank that is neither (a step of the lesson's progression) |
| `calculator` | `true` · `false` | whether the student may use a calculator on it |

Rules (`scripts/validate-lib.mjs › brevetTagErrors`, run by `validate-exercises.mjs`, tests
`scripts/validate-lib.test.mjs`, `scripts/validate-exercises.french.test.mjs`):
- **REQUIRED on every exercise of a 3e bank** (the grade is the bank's folder, `content/practice/3e/…`); optional in
  6e–4e, where a present value is checked the same way;
- `brevet` ∈ {1, 2, null}; `calculator` is a boolean;
- `brevet: 1` ⇒ `calculator: false`;
- a brevet excerpt (`metadata.source.type: "brevet"`) trains the part it was taken from: `brevet` = `source.part`.

Who reads them: nobody yet but the validator. The readers of the bank ignore unknown fields (checked read-only on
2026-11-23: `packages/core/practice/answerEvaluator.js` and `content.test.js` read question fields and have no list of
allowed keys; `ExerciseRepository.php` decodes the whole file;
`ContentRegistryImporter.php` reads named keys). `content/practice/_schema/exercise.schema.json` (not enforced, its
`additionalProperties: false`) does not list them yet `[NOT CHECKED 2026-11-23: the schema belongs to content/]`. A
filter by part or by calculator in the practice space or the sittings is `Planned`.

## French typography of the bank (2026-11-23)

`validate-exercises.mjs` refuses an exercise whose VISIBLE text breaks French writing (`FRENCH_LANGUAGE_CONTRACT.md`
§4, §5, §7) — `scripts/validate-lib.mjs › exerciseTypographyErrors`. Visible = `metadata.title`, `tags`,
`exam.heading`, `statement.content`, `formulas`, the table's cells, each question's `lead`, `statement`, `prompt`,
`answerFormat`, choices, hints, feedback, `solution.lines` and `solution.result`; the answer key is data and is not
read. The error names the path and the kind:

| Kind | In prose (formulas `$…$` set aside) | Write instead |
|---|---|---|
| `espace` | « Calcule: », « Calcule : » with a plain space | U+00A0 before « : », U+202F before « ; ! ? » |
| `guillemets`, `guillemets-anglais` | «oui», "oui", “oui” | « oui » with no-break spaces |
| `apostrophe` | l'élève | l’élève |
| `ordinal`, `double` | 3ème, 1ère, « !! » | 3e, 1re |
| `point-décimal` | 3.5 | 3,5 |
| `unité`, `monnaie`, `devise` | 35€, 35 € (plain space), 20 %, €35, EUR, 450 DA, dinars | 35 €, 20 % with a no-break space |
| `arabe`, `bidi` | an Arabic letter or comma, a bidi control | — |
| `point-virgule` | PGCD(12, 18) (prose or formula) | PGCD(12 ; 18) |

Inside every formula: `produit` (`\cdot`, `*` → `\times`), `virgule` (`2,5` → `2{,}5`), `point-décimal` (`2.5`),
`inégalité` (`\le`, `\geq` → `\leqslant`, `\geqslant`).
Not checked: the narrow no-break space of thousands, a count and its noun on one line, the register.

## Answer-key integrity (2026-09-24 answer audit) — permanent checks

An answer key is content, and content can be wrong. Three gates, none of which
trusts the configured key:

1. **Round trip** — `validate-exercises.mjs` (`checkAnswerKeyRoundTrip`) runs
   every practice question through the real `evaluateAnswer`: the key must be
   accepted, **every** choice distractor must be rejected, and no
   `misconceptionSignature` may itself be a correct answer.
2. **Independent oracle** — `scripts/practice-answer-oracle.test.mjs` recomputes
   the answer of every constructed-answer practice question of EVERY grade (`content/practice/{6e,5e,4e,3e}`) from the
   mathematics (its own gcd, divisor lists, reduced fractions, searches) and
   asserts the evaluator accepts it and the configured key equals it. A new
   constructed-answer question **fails the test until it gets an oracle entry**.
   Oracle entries live in `scripts/practice-oracle/<lesson>.mjs` (the per-lesson files were deleted with the DZ
   banks; `engine.mjs` and `helpers.mjs`, the independent calculator, remain).
3. **Lesson keys** — `validate-lessons.mjs --strict` checks that every assessed option object in a lesson has an
   explicit `correct` index inside its option range (no silent default to 0).

Writing rules the audit enforced: a distractor must be **false**, not merely
"not the textbook's argument" (a second valid proof is a second right answer);
a bound in a statement must say whether it is strict (`40 < a < 55`); a
question that asks for an intermediate form (in English, « after dividing by 4 ») is a choice,
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

The thinking lab « Le labo des énigmes » (OFF in `config/features.js`) checks answers with `answer.check`, using `integer`, `number`, `rational`,
`expression` or `choice`.

- **Reused:** `integer`, `rational` and `choice` delegate to this contract's evaluator (`answerEvaluator.js` /
  `AnswerEvaluator.php`) and its outcomes.
- **Not a practice answer type:** `expression` (equivalence by evaluation at seeded points, `ExpressionEvaluator.php` ↔
  `packages/core/thinkingLab/expression.js`) and `number`. Do not add them to `SUPPORTED_ANSWER_TYPES` or to the
  exercise schema.

Contract: [`THINKING_LAB.md`](./THINKING_LAB.md) §4.

## Platform-generated practice exercises

A generated exercise is declared, never passed off as a source:

- `metadata.source = { type: "platform_addition", reason: "practice_generation", learningPoint: "<the primary LP>",
  modelledOn: "<an element of the SAME lesson, or null>" }`;
- the lesson's `policy.json` entry, when the bank cannot reach the default `minPerLevel`, names its source;
- every rule of this contract still applies: one primary learning point per question and every learning point of the
  lesson primary on enough questions; a real difficulty ladder (level 1 recognition → level 5 problem situations);
  distractors false and tagged with a `misconceptionId` (`content/practice/misconceptions.json`); graded hints that
  never reveal the answer; each question standing alone; an ORACLE entry recomputing every answer by an independent
  path (never the platform's own `packages/core/arithmetic/*`).

Answer-shape rules learned on the Algerian banks, still binding: a polynomial, a factored or an intermediate form is
a `choice` whose every distractor is false (proved in the oracle); an equation's solution is a `rational`, a solution
SET or an inequality's set is a `choice`; a pair (a system's solution, coordinates, components) is
`answerType: "point"`; a ROUNDED value is a `rational` whose key is the rounded number, the statement stating the
precision; an exact surd or a value « in terms of π » is a `choice` (or a `rational` asking the coefficient of π); a
QCM with several correct options becomes ONE `choice` among combinations.

## Statement figures — one switch, `statement.figure`

A statement that shows a figure DRAWS it. `StatementFigure.jsx` (render — `ExerciseStatement`, `ExamSheet`,
`ProblemSupport`) and `validateStatementFigure` (`statementFigure.js` — `validate-exercises.mjs`) dispatch on `kind`;
all components live in `lessons/common/components/`:

| `kind` | Component | What it draws, and the rules its validator enforces |
|---|---|---|
| (plane, default) | `GeoFigure.jsx` + `geoFigure.js` | named points in free units, y up; `segments` (label, `ticks`, `arrows`, `dashed`, `bold`, `tone`), `lines`, `rays`, `polygons`, `rightAngles`, `angles`, `labels`, `hidden`, `vectors`, `grid`, `axes`, `arcs`, `circles`, `maxWidth`, `caption`, a required `ariaLabel`. Unknown key, point or tone fails; every bank figure passes `figureQuality(fig)` (no strip, no colliding label). Inside a `<p>` pass `inline`. Keep `maxWidth` ≥ ~300 px |
| `space` | `SpaceFigure.jsx` + `spaceFigure.js` | 3D points with z up, an orthographic view, spheres, polyhedra, cylinders, cones, frustums, planes, sections; seen lines solid, hidden lines dashed; `spaceFigureQuality(fig)` |
| `chart` | `StatChart.jsx` + `statChart.js` | `bar`, `histogram` (optional `polygon`), `line`, `pie` / half pie (`show: value \| angle \| percent \| none`); a value that is not printed must fall on a gridline; `missing` parts drawn dashed; ≤ 12 bars or classes; the chart body reads left to right |
| `tape` | `ArcTape.jsx` + `arcTape.js` | a line cut into 2–4 parts with arcs above and the whole below, the unknown marked; refused when its given values do not add up |

A `statement.table` with `sheet: true` is a spreadsheet grid (head `['', 'A', 'B', …]`, numbered rows), read left to
right. **Rule:** a statement that says « in the figure » carries a `figure`; otherwise everything the question needs is
stated in words. The `ariaLabel` is required in French: `geoFigure.js` refuses an empty one or one holding an Arabic
letter (« ariaLabel en français obligatoire »).

## Publication of an imported exercise

An imported exercise is born `published` when its lesson is published (`draft` otherwise), and a `draft` one under a
published lesson is published at the next sync; `hidden` / `archived` stay admin acts and are kept. Changing a
lesson's state in the admin gives that state to all its exercises; one exercise can then be hidden alone. The server
caches `active.json` and the exercise index (`practice.cache_ttl`, 1 h): the deploy runs `cache:clear`; locally run
`php artisan cache:clear` after adding files.

## The exam sheet (`metadata.exam`)

**Status.** Since 2026-11-22 the sheet is drawn as a French brevet paper, in French and left to right
(`features/practice/exam/`, strings `student.json › practice.exam.*`): « Diplôme national du brevet », « Brevet <year> »,
« Sur le modèle du brevet <year> ». Since 2026-11-23 the validator wants the FRENCH data format below (`brevet`
sources, « Brevet <year> » badges, sub-items « a) »…); the sheet reads only the badge's YEAR, `kind`,
`source.year` and `source.part` (`examSheet.js › examBadge`, `examSession`, `examPart`), so it needed no change.
`exam.points` keeps its two-digit data form « 02,5 » (shown « 2,5 points »). What follows is the engine as it runs.

**Switching a lesson on.** A lesson's levels page is the exam page when the lesson is listed in
`content/practice/exam-style.json` (read by `exam/examSheet.js` → `isExamLesson`). It is the
only switch; nothing in the code names a lesson. `scripts/validate-exercises.mjs` refuses a
listed lesson that is not active or whose bank still has an exercise without `metadata.exam`,
and in `--strict` wants 10 sheets per level; a lesson whose bank is partly converted but not
listed only warns and keeps the classic page. The server needs no switch: it reads
`metadata.exam` exercise by exercise (`ExamSheetAnyLessonTest` proves the chain on another
lesson).

**Opt-in per exercise.** An exercise is rendered as an exam sheet if and only if it carries
`metadata.exam`. Every other exercise keeps the classic card, unchanged.

### Data

The JSON schema file is not enforced; `scripts/validate-exercises.mjs` (`validateExamPresentation`) checks these fields.

| Field | Values | Meaning |
|---|---|---|
| `metadata.exam.kind` | `official`, `excerpt`, `modelled`, `adapted` | `official`: an annal exercise, word for word. `excerpt`: the same, with steps outside the unit removed. `modelled`: the same wording with new numbers (shown « Sur le modèle du brevet <year> »). `adapted`: an existing bank exercise rewritten in the exam register. |
| `metadata.exam.badge` | 3e: `Brevet <year>` (official, excerpt) · `Sur le modèle du brevet <year>` (modelled) — 6e–4e: `Sur le modèle d’un contrôle` (modelled) — `null` (adapted) | The sheet reads only the YEAR and writes « Brevet <year> » / « Sur le modèle du brevet <year> »; a badge with no year is a class test (`practice.exam.badgeTerm`). |
| `metadata.exam.heading` | text (« Exercice 1 », « Automatismes »…) | Rendered in the grey band, « <heading> » on one side and « (<points> points) » on the other. Checked: non-empty, French typography. |
| `metadata.exam.points` | « 03 », « 02,5 », « 08 » | Two digits in the data; shown « 2,5 points » (`examPoints`). |
| `metadata.source` | `{type:"brevet", year, part:1\|2, exercise}` | 3e only, for official / excerpt exercises: `year` a session of `BREVET_YEARS` (2017–2027 `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`), `exercise` ≥ 1; `part 2` is shown « Partie 2 »; the exercise's `brevet` tag equals `part`. |
| | `{type:"platform_addition", reason:"brevet_modelled", modelledOn}` | 3e modelled exercises (`modelledOn` free text, e.g. « Brevet 2023 II-1 »). |
| | `{type:"platform_addition", reason:"control_modelled", modelledOn:"<grade>"}` | 6e–4e modelled exercises — no official paper exists below 3e; `modelledOn` is the exercise's own grade. |
| | `{type:"bem"}`, `{type:"term_exam"}` | REFUSED: the Algerian exam and the deleted Algerian term-exam corpus. |
| | the original source + `adaptedFrom` | For adapted exercises. |
| `statement.formulas[]` | LaTeX strings | Centred on one line under the setup sentence. |
| `statement.table` | `{head, rows}` | Same shape as a problem's table (`ProblemTable`). |
| | | **Every screen that shows a statement passes `formulas` and `table`** to `features/practice/ExerciseStatement.jsx`, which renders them like the exam sheet (since 2026-11-09: the practice session, its review, the teacher's player, the daily challenge and its review, the games space's refuel and the year compass had shown `content` alone). A statement whose data lives in `formulas` is unanswerable without them. |
| `questions[].step` | « 01 »…« 06 » | Required, non-decreasing; shown « 1 », « 2 »… |
| `questions[].sub` | `a` … `h` | Optional; shown « a) », « b) » (`ExamSheet.jsx` writes `sub` followed by « ) »). Lower-case letters only (`validate-lib.mjs › EXAM_SUBS`), never going back inside a step (`b` then `a` is refused; a new `step` starts again at `a`). |
| `questions[].lead` | text | Optional. The step text that precedes its sub-items. |
| `questions[].solution` | `{lines[], result?}` | Required: the model answer in the solutions booklet's style. `result` is LaTeX shown in a box (checked as a formula: `\times`, `{,}`, « ; » in a pair); a result written in words is shown as text (`examSheet.js › resultIsWords`). |
| `questions[].counted: false` | boolean | The step is judged but is never mastery evidence. Used for a step that belongs to another lesson, e.g. an irreducible fraction in a PGCD exercise. Such a step still carries one of the lesson's own learning points as its label (validator rule). |

**`answerType: "selfCheck"`** is for « Montrer que », « Justifier » steps: proofs that cannot be
auto-checked. It has no `expectedAnswer`, `solution` is required, and it is never counted
for mastery (`countsForMastery`, in both JS and PHP).

| Step | Student does | Sent | Evaluator returns | Server |
|---|---|---|---|---|
| 1 | Writes the proof in a text box, clicks « Enregistrer ma réponse » | `{text}` | `abandoned`, `normalized: "self:pending"` | Records the attempt. The text is locked from now on. |
| 2 | The model answer opens under the locked text; the student answers « Oui, elle correspond » / « Non, elle ne correspond pas » | `{text, selfMark}` with the same text | `correct` / `incorrect` | `PracticeEvidenceRecorder::recordSelfMark` accepts one mark, refuses (422) any different text, and replays the stored verdict afterwards. Text is capped at 5000 characters. |

The provenance rules (`source`, `kind`, `badge`) live in `scripts/validate-lib.mjs › examProvenanceErrors` (the
French port of the Algerian `examProvenance.mjs`: the BEM for 4AM, the term exam for 1AM–3AM), run by
`validate-exercises.mjs › validateExamPresentation`: in **3e**, `official` / `excerpt` cite `{type:"brevet", year,
part, exercise}` with the badge « Brevet <year> » and `modelled` carries « Sur le modèle du brevet <year> »; in
**6e–4e** an exercise is never `official` nor `excerpt` and never cites the brevet, and `modelled` carries « Sur le
modèle d’un contrôle » with `platform_addition / control_modelled`; `adapted` has no badge; `bem` and `term_exam` are
REFUSED. The grade is read in the exercise id (`ex-<grade>-…`). Tests: `scripts/validate-lib.test.mjs`.

### Screen (`features/practice/exam/`)

The components:
- **`ExamSheet.jsx`** draws the sheet: paper, the grey band « Exercice 1 » / « (2,5 points) », the
  provenance ribbon (dashed for `modelled`), « Partie 2 » above a Part 2 problem, the setup
  sentence, centred formulas, step numbers with their sub-items « a) », « b) ».
- **`SolutionPanel.jsx`** is « Corrigé »: collapsed after each answer, open in a self-check.
- **`inputs/SelfCheckInput.jsx`** is the self-check input.
- **`examSheet.js`** holds the pure logic.

Behaviour:
- **Steps are progressive** (owner, 2026-10-06). Only step 1 is shown at first. Once it is
  answered, step 2 is added below it and nothing above disappears. Done steps keep the
  student's answer and its verdict.
- **`PracticeSession.jsx` keeps its single exercise state.** Only the presentation branches
  (`isExam`). The extracted `answerZone` is shared by the card and by the sheet's current
  step.
- **Side column.** On an exam sheet there is none: see « No side column on a sheet » below. Other lessons keep it.
- **Font.** The sheet reads like a printed paper in the system's serif (`.sa-exam-paper`: Georgia, Times New Roman —
  no font is loaded for it); the input controls keep the interface's font (Inter). KaTeX keeps its own fonts.
- **The model answer is earned** (owner, 2026-10-06). « Corrigé » opens only after a
  real attempt. An unreadable entry (`syntax_error`) or a step skipped without an answer
  shows nothing, and a proof shorter than 15 characters (`MIN_PROOF_CHARS`) cannot be saved.
  Hints stay available before the attempt; they guide but never contain the answer (the
  validator checks that).
- **Steps area « Étapes du calcul »** (owner, 2026-10-06). It is set per question by `work`:
  `required` when the statement asks for the steps, `optional` on other PGCD computations; the validator accepts these two
  values on constructed answers only. It is a ruled area (`WorkArea.jsx`) above the answer
  line. The text is sent as `answer.work`, so it is saved in the database and locked with the
  answer, and it is shown again under the answered step. It is capped at 5000 characters on
  the server. While a required area is empty, « Vérifier » stays disabled.
- **Writing maths: MathLive** (owner, 2026-10-06). On a sheet, a `rational` answer is a MathLive field
  (`exam/math/ExamMathField.jsx`):
  - formulas are written left to right and « 7/9 » becomes a real fraction;
  - « * » is typed as « × »;
  - the virtual keyboard (`examKeyboard.js`) has digits, operations, fraction, root, « ; »
    and « PGCD »;
  - the value sent stays what the evaluator reads, `asciiToAnswer` (« 7/9 », « 135 »),
    and the LaTeX is kept as `answer.latex` for the recap.

  « Étapes du calcul » and the « Montrer que » proof are a LINE editor (`MathLinesEditor.jsx`):
  - each line is either text or a formula (MathLive), both left to right
    (« Ligne de calcul » / « Ligne de texte »);
  - Enter adds a line of the same kind, and two buttons add either kind;
  - it is saved as a plain string, one line per line with formulas written `$…$`
    (`linesModel.js`);
  - when read back (`RedactionText.jsx`), every formula is a KaTeX island in its line.

  MathLive is loaded lazily (`exam/math/lazy.jsx`; BUNDLE_BOUNDARIES §6). Each field is keyed
  by question, so a field never carries a value over to the next question.
- **« Commencer »** (owner, 2026-10-06). The current step stays HIDDEN behind « Commencer » (with its
  time). Pressing it reveals the statement and starts the countdown. The start time is kept
  per attempt in localStorage, so a reload never gives a fresh time. The button stays
  disabled until the question is open on the server, because otherwise the server's late
  reply erased the start.
- **Field width** (owner, 2026-10-06). By default a field is exactly as wide as the correct
  answer (`answerChars`, CSS `--answer-ch`), and that width is also its minimum. The student
  widens it with the corner handle (`resize: horizontal`). Ruled areas resize vertically.
- **Unreadable entry.** On a sheet an unreadable entry (`syntax_error`) is NOT sent: the
  step would stay locked on it. The message « Je n’ai pas pu lire ta réponse : vérifie ton écriture, puis appuie de
  nouveau sur « Vérifier ». » appears and the field stays editable.
- **The paper** (owner's mock-up, 2026-10-06). The header is ONE row: the centred lines in the middle
  (« Diplôme national du brevet », the title « Brevet blanc — sujet d’entraînement » — a practice paper, not an official
  document — and « Mathématiques »), with an information box (`data-exam-info`):
  - « Niveau »;
  - « Durée conseillée » (`estimatedMinutes`);
  - « Session »: the session year for `official` / `excerpt` (`examSession`), « Entraînement » otherwise;
  - « Source »: « Brevet 2008 », « Sur le modèle du brevet 2015 » or « Exercice de la leçon ».

  « Se repérer dans l’exercice » lives in the centred window (see below). The exercise sits in a grey band,
  « Exercice 1 » on one side and « (2,5 points) » on the other, with « Partie 2 » above it for a Part 2 problem. The
  sheet ends with « Bon courage ».
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
  | `choice` | a closed question | « ☐ Oui ☐ Non » boxes |

  The text in every field starts at the start of the line (`text-align: start`, left); the red margin of the proof
  area is on the start side (`border-inline-start`). « Vérifier » is a small outlined button next to the field. The
  « Indice » link sits beside it, and the hints panel appears only once a hint has been asked for or after a wrong answer.
- **Vertical budget.** The paper header, information box, band and gaps are compact. A
  one-step exercise fits a 1366×768 screen without scrolling; only long problems scroll.
- **Around the paper.** `ExamNavigator.jsx` « Se repérer dans l’exercice » (in the centred window):
  - the exercise and its points, and its questions (✓/✕ done, current, upcoming locked
    until the previous one is solved); clicking one scrolls the sheet to it;
  - the flag « Je veux revenir à cette question plus tard », kept in localStorage only (it is never
    server state);
  - « Tes réponses sont enregistrées automatiquement. ».

  The top bar opens on a clear outlined button « Retour aux paliers » (back to the level
  cards, `data-practice-back`; owner, 2026-10-23) followed by « Leçon : <lesson title> » and the current-level pill
  « Palier N · name » (`data-exercise-level`), with the pill « Brevet blanc » (`data-exam-simulation`; « Contrôle blanc »
  for a term paper). The main action is dark green. The footer reads left to right: « Question précédente » first, then
  the next action. (The countdown is per question; see the next bullet.)
- **Countdown per question** (owner, 2026-10-06; this OVERRIDES the player's former « no
  timer » rule, for exam sheets only). Each step has its own time, `timeSeconds` in the
  content (30–3600, checked by the validator). The defaults were generated by splitting the
  exercise's `estimatedMinutes` by weight (required steps and proofs ×2, optional steps
  ×1.5, yes/no ×0.5, rounded to 30 s, at least 60 s) and can be edited per question.
  - `StepTimer.jsx` counts down from the step's opening, which is kept per attempt in
    localStorage so a reload does not reset it. It turns amber in the last fifth.
  - At zero it shows « Temps écoulé » and counts the overtime. It never blocks, because of
    the non-blocking invariant.
  - On answering, the time spent is sent as `answer.seconds`, so it is saved in the
    database. It is shown frozen on the step: « Réponse en 01:20 sur 03:00 » ✓, or the overtime.
  - Helpers in `examSheet.js`: `stepSeconds`, `formatClock`, `clockState`.
- **No side column on a sheet** (owner, 2026-10-06). The exercise keeps the full width. A
  button (`ExamPanelButton`: « Afficher le savoir-faire » for the student, « Afficher » + « Réponses des élèves » for the
  teacher) opens a CENTRED
  window (the shared `components/admin/ui/Modal.jsx`: ✕, Escape, click outside). The window
  is wide (`xl`) and stacks its blocks over its full width (the savoir-faire first), so no label wraps. The window
  holds « Se repérer dans l’exercice » plus the savoir-faire (student) or the students' responses
  (teacher). Clicking a question in it closes the window and scrolls to that step. Other
  lessons keep their side column.
- **Going back is always possible** (owner, 2026-10-06).
  - Student: the finished steps stay on the sheet, and « Question précédente » scrolls to the
    previous one. « Exercice précédent » reopens an exercise finished during this visit, read-only
    (a snapshot of the student's answers, verdicts and model answers), with « Revenir à l’exercice en cours ».
    Answering it again would count twice for mastery, so it is never replayed.
  - Teacher: « Question précédente » reopens the previous step blank, and « Exercice précédent » links
    to the previous exercise of the level.
- **Teacher player.** `TeacherPracticePlayer.jsx` renders the same sheet, with the same
  progressive steps and a local history. On a sheet, « Afficher la réponse attendue » stays
  disabled (with a one-line reason) until an answer has been entered and checked with « Vérifier ma réponse ». An
  unreadable entry does not count; a saved proof does. Once enabled, it also opens the full model answer. Other lessons
  keep the button always active.

Tests:
- `examSheet.test.js`
- `answers.json` fixture cases `selfCheck-*` (JS ↔ PHP)
- `EvidenceTrustBoundaryTest::test_self_checked_and_uncounted_exam_steps_never_become_evidence`
- (the per-lesson oracle and the browser walk of the pilot lesson were deleted with it)

## Earlier-year review link — « À revoir : » after a wrong answer (2026-10-14)

Owner decision D7: links to earlier years go **inside exercises** too, not only in the lesson's « get ready » module (in English; the module lessons are deleted).

- **Where:** under the verdict of a wrong answer, in the practice player (`PracticeSession` › `FeedbackPanel`;
  classic card and exam sheet alike). (The final-test review of the deleted module lessons showed it too.) Not on `selfCheck` steps or inert outcomes.
- **What:** up to three compact lines « À revoir : <lesson> (<year>) », nearest year first. The lesson title is a link
  when the target lesson is published. When it is not, the line shows the official text of the savoir-faire with no
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
  - Screen: the « Réglages de l’élève » card on the student's page (`StudentSettingsCard.jsx`).
  - The student sees the setting but cannot change it: `PATCH /me/settings` answers 422
    with `managed_by_teacher`.
- **Independent student:** the student, on « Réglages », a WINDOW rather than a page (owner,
  2026-10-06). `features/settings/SettingsButton.jsx` opens `StudentSettingsPanel.jsx` in the
  shared `Modal`, through `GET/PATCH /me/settings`. It opens from the gear next to logout in
  the desktop sidebar, from the profile page, and from the exam hub's header; there is no
  route. The phone top bar has no gear, because it squeezed the bar. Future settings
  get a section on this page.

Tests: `tests/Feature/StudentSettingsTest.php` (default lock, independent student, class
student refused while his teacher succeeds, another teacher refused).

Second setting (2026-10-06): `practice_validation`, which decides who corrects photos and
proofs. See « Image answers and teacher validation » below.

### A plane figure on an exam sheet must be readable (2026-10-08)

`validate-exercises.mjs` refuses a `statement.figure` (plane, GeoFigure) on any sheet carrying `metadata.exam` when
`figureQuality(fig)` is not empty — a band wider than 2 : 1, a label on another label or on a point. The fix is a
redesign with the same concept and data.
GeoFigure itself (2026-10-08): a length label is pushed off its segment by half its own width (or height) along the
normal — never less than the former 13 px — and the viewBox grows to contain every length label, so « 3,06 m » beside a
vertical edge is neither on the line nor clipped. Applies to every plane figure (lessons and practice).

### Model solution opened = no retry; answer field fits its chrome (2026-10-08, every lesson)

Owner's rules, implemented in the shared players, so they hold for every practice exercise of every lesson:

- **Opening « Corrigé » removes « Réessayer »** for that question: `SolutionPanel` calls `onReveal` when its
  `<details>` opens, and `PracticeSession` / `TeacherPracticePlayer` hide the retry button for that question
  (`solutionSeenFor`, keyed `exercise:question`). Seeing the answer and then retyping it proves nothing. The exam sheet
  already had one attempt per step; this closes the classic practice page and the teacher preview.
- **Teacher preview: « Afficher la réponse attendue » only for a question WITHOUT a model solution** (the classic banks of
  units 9–14). When `solution` exists, its boxed result already gives the answer; the panel repeated it word for word.
- **Exam answer field width** = the expected answer + 2 characters, or the `answerFormat` placeholder if longer
  (`answerChars`), PLUS the MathLive keyboard button inside the field (`--answer-chrome`, index.css). Before, the
  keyboard and menu buttons (68 px) left ~5 px for the answer and cut the placeholder « Nombre entier ».
- **`answerFormat` may carry a formula, and the student never sees a raw `$`** (2026-10-22). The case that triggered the rule (in English): « write only the value of $K$ (a natural number) »
  was displayed with its dollar signs under the field and in the placeholder, reported from the games space (`madar`).
  The rule for every input:
  - The visible hint goes through `MathLabel`.
  - String-only attributes (`placeholder`, `aria-label`, the MathLive `\text{}` placeholder) go through `mathToPlain`.

  The inputs concerned are `RationalInput`, `IntegerSetInput` and `SelfCheckInput`. Locked by `features/practice/QuestionRenderer.math.test.jsx`: no `$` in the HTML of any answer type.
  The same rule applies to a savoir-faire title or a lesson title shown outside a lesson: it goes through `MathLabel`, never `{title}`.
- **MathLive, every field (practice and Math Lab)**: the menu ☰ is hidden (`math-field::part(menu-toggle)`; its items
  were already emptied and it did nothing), and the virtual keyboard has a « ✕ Fermer » tab on its top edge
  (`features/mathlab/tools/functionGrapher/keyboardClose.js`, installed by `ensureMathLive()`), which closes like the
  built-in `[hide-keyboard]` key: command on the focused field, blur, hide — otherwise « auto » mode reopens it.

### Answer templates — the answer is typed in its own shape (owner STANDARD, 2026-11-09)

**Binding for every question of the platform** (practice, exam sheet, modules, tests, games, the year compass): a typed answer is
never a bare box with the instructions in its placeholder. The input is drawn as the mathematics it completes, and the
student types ONLY the unknown. Plan with one mock per kind: https://claude.ai/artifact/DLnrZSjqCARn5Xfyju4eZb.

- **One pure rule** — `templateFor(question)` (`features/practice/answerTemplates/templateFor.js`) reads only what the client
  always has (the question's statement, `answerFormat`, `evaluationPolicy`), never the expected answer. Kinds:

  | kind | The input | Read from |
  |---|---|---|
  | `gap` | the box replaces « … » (`\ldots`, `\dots`, `…`, `\square`) INSIDE the formula; for « l’exposant $n$ » it replaces `^{n}`, raised | the question's statement |
  | `form` | « A = ax + [b] »: the asked coefficient is a box, the form is printed | « $A$ s’écrit sous la forme $…$ : écris seulement le nombre $b$ » |
  | `fraction` | ± toggle, numerator box over denominator box, a real bar; empty denominator = an integer | « fraction », « quotient », « a/b », `requiredForm` |
  | `percent` | [ ] % | « pourcentage », « % » |
  | `quantity` | [ ] + the printed unit (€, cm², m², cm³, km/h, km, cm, mm, m, °, L, kg, g, h, min) | « en euros », « en mètres », « (cm) »… |
  | `solution` | x = [ ] | « valeur de $x$ » |
  | `digit` | ten buttons 0–9 | « un seul chiffre » |
  | `natural` | digits only, thousands spaced while typing | « nombre entier », « entier naturel », « nombre de boîtes » |
  | `signed` | ± toggle + box | « relatif », « négatif » |
  | `decimal` | one box, « . » becomes « , » | everything else |

  A gap inside a `{…}` group (e.g. `\dfrac{\ldots}{5}`) never cuts the formula: it falls back to the next kind.
- **Rendering** — `answerTemplates/TemplateInput.jsx`: the fixed parts through `RichText` (KaTeX); the boxes are real inputs (`inputmode` numeric/decimal — the system's number pad is enough, a fraction has two boxes).
- **Grading unchanged** — `templateValue(template, boxes)` produces the `{ value }` that `AnswerEvaluator` already reads
  (« -5/6 », « 12500 », « -2,5 »). Nothing changes on the server; the answer key never reaches the client.
- **Rollout** — applied to the year compass's first round (`CompassPage`, 2026-11-09 — the compass is OFF in `config/features.js`; over its bank: 2 686 typed answers → gap 168,
  form 190, fraction 914, natural 463, decimal 655, signed 153, quantity 124, percent 15, solution 3, digit 1).
  *Planned:* practice session, exam sheet, daily challenge, the games space, modules; merging a step's sibling questions (a, b, c of one
  form) into ONE template with several boxes (owner: yes); sets as chips, the inequality sign selector, vectors as columns,
  proof starters; an explicit `answerTemplate` field for new exercises and a `check:answer-templates` coverage check.
- Tests: `answerTemplates/templateFor.test.jsx`.

### A formula never breaks across two lines (owner RULE, 2026-11-09)

An inline formula is never split over two lines — above all when there is room around it. `index.css` sets
`.katex { white-space: nowrap }` everywhere. When a formula does not fit, the CONTAINER grows (a wider card — the
year compass's question card is `max-w-5xl`) or the formula's own row scrolls in its box (`TemplateInput` rows are
`flex-nowrap overflow-x-auto`); the formula itself never wraps. A new screen that shows maths in a narrow column must
check this at 768 px and 1366 px.

### « Clavier mathématique » — the fixed math pad (2026-11-09, owner request + council)

A `rational` answer that can be a FRACTION is written in a MathLive field with a FIXED pad beside it, on every surface that
renders `QuestionRenderer` (the year compass, the daily challenge, the games space's refuel, classic practice, the exam sheet, the teacher player).

- **When** — `needsMathPad(question)` (`features/practice/inputs/mathPad.js`), a pure rule on what the client always knows, even
  without the answer key: `answerFormat` names a fraction, a rational or a relative number (« fraction », « nombre rationnel »,
  « nombre relatif », « quotient », « a/b »), or `evaluationPolicy.requiredForm` is `irreducible`/`fraction`. A natural or decimal answer keeps the plain field.
  Measured on 16 466 `rational` answers: ~4 441 expect a fraction, NONE a root (the grader reads rationals only).
- **Keys** — `padKeys(question)`: the fraction key first and wide, digits, −, the decimal comma, ⌫, ← →. √ and the power key appear
  ONLY when the format names them (« racine », « √ », « puissance »); none does today.
- **Not MathLive's keyboard** — the pad is page buttons (`inputs/MathPad.jsx`) writing into THE question's field: `pointerdown` is
  cancelled so the field keeps its focus, insertion goes through MathLive commands, then an `input` event. With the pad,
  `ExamMathField` gets `pad`: MathLive's floating keyboard stays closed (`policy: manual`, its toggle hidden) and, on a touch screen,
  the system keyboard is suppressed (`inputmode="none"` on its textarea) so the two never fight.
- **Where** — beside the field on the reading-end side from `lg` (the right), under it on a portrait tablet; hidden once the question
  is closed (an answered step). The pad lives inside the answer box, so no screen's layout (the no-scroll player included) changes.
- **Size** — the field writes big (`math-field.sa-exam-mathfield.sa-pad-mathfield`, 1.9rem, index.css): owner, « the numbers are small ».
- **Typing still works** — « 7/9 » on a physical keyboard becomes a fraction, as before. The answer sent is `{ value, latex }` (the
  evaluator reads `value`), as on the exam sheet. Strings: `student.practice.mathPad.*`. Test: `inputs/mathPad.test.jsx`.
- The ☰ menu of MathLive is hidden on every `.sa-exam-mathfield` (index.css), as this contract already required.

### One step split into several questions — the model answer waits (2026-10-07)

A paper step is often typed as several questions on the same `step` (and `sub`): the bound
then the direction of an inequality, the smaller solution then the larger, « 10 cm ? » then « 18 cm ? ».
The step's model answer would give away the next question, so `solutionReady(questions, i,
answeredThrough)` (`exam/examSheet.js`) keeps a question's `SolutionPanel` CLOSED while a later
question of the same group is unanswered; when the last one is answered, all of them open. Used
by `ExamSheet` (done steps, prop `answeredThrough`), the student player and the teacher player
for the current step. Self-check panels (« Montrer que », photo-only self-marking) are not affected:
the student needs the model answer to mark himself. Authors still keep the first question's
hints and `feedback.correct` free of the next answer.

### The exam levels page (2026-10-06)

For the lessons listed in `content/practice/exam-style.json` (`isExamLesson`, `exam/examSheet.js`),
`PracticeHub.jsx` renders the « Brevet blanc » page:
- a header card with its pill, the title (« Des exercices présentés comme le sujet du brevet : la même mise en page, le
  même minutage. »), and the buttons « Ce que tu as montré jusqu’ici », « Revoir la leçon » and « Réglages » (which
  opens the settings window);
- the open-session banner;
- the five levels as CARDS (`ExamLevelCards.jsx`). Each card shows its number and name, how
  many exercises come from a brevet paper (« 2 exercices sur le modèle du brevet », counted from
  `metadata.exam.kind`), its progress, and a « Commencer » button (green on the suggested
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

- A wrong answer earns nothing, and neither does a self-checked « Montrer que » or a self-marked
  photo answer (`evaluated_by = self`). A proof or a photo answer judged correct by the
  TEACHER (`evaluated_by = teacher`, « Correction par le professeur ») earns its medal, with the time
  actually spent (`medalFor({…, evaluatedBy})`, `Medals::medalFor(…, $evaluatedBy)`).
- The points make a rank (`rankFor`): « Débutant » 0 → « Appliqué » 15 → « Excellent » 40 → « Champion du brevet » 80.
- Nothing is stored. Medals are DERIVED from the saved attempts (outcome, `hints_used`,
  `answer.seconds`) against the content's `timeSeconds`. Only the first answer per question
  counts. Endpoint: `GET /lessons/{code}/practice/medals` → `{total, levels}`.

**Screen** (`features/practice/medals/`):
- `MedalCelebration.jsx`: after a correct answer, the medal spins in, a shine crosses it,
  gold throws confetti, and a line gives the reason and the points. It never blocks
  (`pointer-events: none`), dismisses itself, and is quiet under reduced motion.
- `Medal.jsx`: the SVG medal, with a green / white / red ribbon (`#006233`, `#d21034`: still the Algerian flag's colours in the code).
- `MedalTray.jsx`: « Mes médailles dans cette leçon : » in the sheet's top band, live.
- Each answered step shows its medal. The finished exercise shows its haul, plus « Exercice en or :
  toutes tes réponses ont l’or. » when every step is gold.
- `MedalCabinet.jsx`: « Ma vitrine de médailles » on the levels page (totals, rank, progress to
  the next rank, the rule in one line). The level cards show their medals.
- The teacher view plays the celebration locally and records nothing.

**Sound.** `medalSound.js` plays a short synthesised fanfare: gold gets the richest one,
bronze the shortest. It plays only when « Son et effets » is on in the settings window.
That is the device preference already used by the lessons (`useEffectsPreference`), off by
default.

## Saved answers and locked exam steps (2026-10-06)

Every answer is saved on the server (`question_attempts.submitted_answer`).

- **An answered step is locked.** On an exam sheet a step is answered once. Re-opening it
  (going back, reloading) returns the same attempt with its saved answer, its outcome and
  `normalized` (`PracticeSessionService::openQuestion`, `POST …/questions` → `attempt.answer`).
  The student player adopts that attempt uuid and shows the answer locked. There is no
  « Réessayer » on a sheet, because the model answer is visible once the step has been
  answered.
- **« Exercice précédent » reads the database.** It is rebuilt from
  `GET /practice/sessions/{id}/answers` (the session's exercises with the first saved answer
  per question), so it survives a reload and shows only what was actually recorded.
- **Teacher view.** On a sheet, « Question précédente » scrolls back to the locked step instead of
  reopening it. The teacher view is still never recorded (« Consultation sans suivi »).

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
| Review queue | A new teacher page « Réponses à corriger » (`/enseignant/corrections`), all classes, class filter, counter in the menu |
| Notification | In the app only (a bell); NO e-mail |
| Annotation | The teacher can DRAW on the photo (red pen), saved as a separate image |
| What enters the queue | Photos, proofs (`selfCheck`) and steps with `work: required`; a typed answer alone stays automatic |

### The photo

- **Picker** (`exam/images/AnswerImagePicker.jsx`), under the answer field of every exam
  step: « Photographier ma copie » (`accept="image/*" capture="environment"`, the camera on a phone) and
  « Choisir une image » (a file). Each photo is resized in the browser (`prepareAnswerImage`: JPEG,
  1600 px longest side, EXIF orientation applied) and uploaded at once:
  `POST /practice/question-attempts/{attemptUuid}/images` (multipart `image`). It can be
  removed (`DELETE /practice/answer-images/{uuid}`) until the step is answered. After that it
  is LOCKED with the answer (`answer_locked`).
- **Answer = typed, photo, or both.** « Vérifier » opens with a photo alone. A photo also
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
  never answered « Pas encore » on the spot.
- **Retention.** `smarter:answer-images:purge` (scheduled daily at 04:10) deletes expired
  photos, file and row, and the folders of deleted accounts (a cascade removes the rows,
  not the files).

### Who validates — `student_settings.practice_validation`

`self` (« Autocorrection », the default) or `teacher` (« Correction par le professeur »). It is set PER STUDENT
by the teacher on the « Réglages de l’élève » card (`PATCH
/teacher/classrooms/{id}/students/{studentId}/settings` `{practiceValidation}`); a student
cannot set it. It APPLIES only while the student is an active member of an active class:
`StudentSettingsService::practiceValidation`, exposed as `effectiveValidation` by `GET
/me/settings` and shown read-only in the student's settings window. Outside a class the
student is always `self`.

`PracticeEvidenceRecorder::route()` decides, on the FIRST answer to an exam step:

| Mode | Step | Result |
|---|---|---|
| any | typed answer, no photo, no required work | judged by the server, as before |
| `self` | photo only (`imageOnly`) | `abandoned` + `self:pending` → model answer + « Oui, elle correspond » / « Non, elle ne correspond pas » (`SelfMarkChoice`) → `evaluated_by = self`, never evidence, never a medal |
| `self` | proof (`selfCheck`) | unchanged self-check flow (`evaluated_by = self` once marked) |
| `teacher` | proof, or photo only | `abandoned` + `review:pending`; an `answer_reviews` row with `kind = verdict`; no verdict, no model answer, no medal; the student CONTINUES; self-marking is refused (`review_pending`) |
| `teacher` | typed answer + photo, or `work: required` | judged by the server now (evidence, medal, model answer) + an `answer_reviews` row with `kind = feedback` |

While the server decides an exam step with a photo or a proof, the player shows NO local
prediction: it cannot know who will judge, and showing it would flash the model answer.

### The teacher's review — « Réponses à corriger »

- `GET /teacher/reviews[?classroom=]` returns the pending copies of the teacher's students,
  oldest first. A foreign `classroom` is 403. `GET /teacher/reviews/count` feeds the menu
  badge (`useReviewCount`).
- The page is `pages/teacher/TeacherReviewsPage.jsx`. For each copy it shows the student,
  the class, the step statement read from the content, the typed answer, the proof, the
  work, the photos, the time and the model answer (folded). Then the verdict (« Juste » / « Fausse »;
  for `feedback`: « Correct » / « À revoir ») and a comment (≤ 2000 characters).
- **Annotation** (`features/teacher/reviews/AnnotationEditor.jsx`). A canvas at the photo's
  real size, a red pen in three widths, undo and clear. « Enregistrer la correction sur la photo » composes a JPEG and sends
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
- **Opening a notification** goes to `/espace/corrections/:reviewId`
  (`pages/student/practice/AnswerReviewPage.jsx`, `GET /practice/reviews/{id}`, owner only).
  It shows EXACTLY that exercise as an exam sheet up to that step, read-only: the earlier
  steps with their answers, then the reviewed step with the saved answer, the photos (the
  « Corrigée » version first), the verdict and comment (`ReviewStatus.jsx`) and the model
  answer.

### Where the copy is read again

`AttemptPresenter::answer` is the one shape: answer, outcome, `normalized`, `evaluatedBy`,
`images`, `review`. It is used by « Exercice précédent », a reopened step (`POST …/questions`
also returns the photos attached BEFORE the answer, so a reload keeps them), the
correction page, the queue, and « Les réponses de mes élèves » (`TeacherPracticeResponses`, photos plus
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
- Browser: the DZ walk `e2e/lesson-kit/practice-image-answers.mjs` was deleted with the lesson walks; none replaces it yet.

### Two zones on a step that asks for working (2026-10-06)

When a step has `work` (required or optional), the answer area shows TWO numbered zones so the
student sees where each thing goes:
1. **« 1 · Étapes du calcul »** — an amber panel with its ruled lines (`WorkArea`, the `ZoneNumber` badge).
2. **« 2 · Résultat final »** — below a dashed divider, a green-framed box holding the answer
   field and « Vérifier » (`data-result-zone`). Same markup in the student player and in
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
player, the summary (`PracticeSummary`, « Palier n — <lesson> ») and the daily challenge (owner request,
2026-09-25; the summary used the wider 40/60 px gutter before). Mobile/tablet: one column — Learning Point module → exercise header
(level · level name · estimated minutes · tags, `h1` title) → statement
(« Énoncé de l’exercice ») → question history → current-question card → footer. From
`xl` (1280 px): ONE side column (28rem, 30.6rem at `2xl` — widened ×1.7 at the owner's request, 2026-09-24; sticky) at the
start edge holding the Learning Point module and « Le fil de l’exercice »
(`QuestionContextPanel`: every question — done with the student's answer,
current, upcoming as « S’affiche après la question n » without its statement); the exercise
takes all the remaining width. In classroom mode (« mode classe ») the grid collapses
(`[[data-sa-classroom]_&]:block`) and the side column is `ClassroomHidden`.
Each fact appears once: the question/exercise position lives only in the
card header (`SessionProgress`: « Question n / N » is the card's `h2`, N = the
questions of THIS exercise, with one tone-coloured segment per real question,
and « Exercice n sur N » of the level); the « what's left » sentence is `sr-only`
(`aria-live`). The first pass's third column (question squares, session
correct-count tile, SVG encouragement) and the « remember » card were removed as
duplicates.

**The Learning Point module (`LearningPointProgress.jsx`).** Always on top: the
eyebrow « Savoir-faire », the point's name (the primary Learning Point of the
**current question** — an exercise may mix points —,
`currentLearningPoint()`), a **star path** and two counters.

- *Stars = the real Mastery V2 state*, never an invented score: three stars
  joined by a line, lit by `masteryStage()` — `unassessed` 0, `gap` 1,
  `reinforce` 2, `mastered` 3 — labelled with `student:mastery.*`. The next
  star has a dashed ring (the stage in progress); a star that lights up fills
  with a small spring (off under reduced motion).
- *Counters = activity*, in completion words only (« exercices terminés », « questions
  répondues » — never a mastery word, `FRENCH_LANGUAGE_CONTRACT.md`): exercises completed /
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
frame (`.sa-page--flush`, 20 px, full width). Header: « Exercices » eyebrow, the
lesson title (`h1`), « Revoir la leçon » as a tertiary link. An open session is one
row with the page's only solid button (« Reprendre »). The five levels are a
**path** (`LevelSelector.jsx`): one row per level joined by a rail — node
(number / ✓ done / 🔒), « Palier n · name », a bar with `completedCount /
exerciseCount` (« 1 / 3 exercices terminés »), the « Conseillé » / « Terminé » chip and
« Commencer » / « M’entraîner encore ». A locked row is not a button and says which level
unlocks it. The lesson's Learning Points reuse **the same
`LearningPointProgress` module** as the player (star path + the two counters,
`eyebrow={false}`, `h3`), with the `reinforce` reason / `mastered` freshness
under it; from `xl` they sit in a 30.6rem column at the start edge, below
`xl` after the levels (choosing a level is the page's action).

**Button hierarchy.** One solid primary at a time: « Vérifier ma réponse » before
the answer, then « Question suivante » (outline/secondary — disabled — until an
answer is checked). Secondary: « Réessayer ». Tertiary (text + icon, no
fill): « Indice », « Question précédente », report. The notebook is not in the card: it
is the lesson's floating « 📓 Mon cahier » pill (see `NOTEBOOK.md`), and the
question footer keeps its end (`lg:pe-36`) clear for it.

**Question history — derived, never a second store.** When the student leaves
a question with « Question suivante », `historyEntry()`
(`features/practice/questionHistory.js`, pure, tested) snapshots what the page
already holds: question id/number/statement, the student's answer formatted
per `answerType` (`formatAnswer`: typed answers stay the student's own
writing, never fed to KaTeX; a QCM shows the choice's content),
the **displayed** (server) verdict and its tone, `misconceptionId`, the
feedback message, hints used, and `retried` (validated more than once — the
server counted only the first answer). Entries are replaced by question id
(`recordQuestion`, idempotent) and reset when the next exercise loads. The
previous question renders as the « Question précédente » card (full statement, answer
in a read-only box, verdict in words, feedback behind « Voir l’explication »); older
ones as one-line collapsed rows below `xl` and in « Le fil de l’exercice » from `xl`.
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
- « Réessayer » **keeps** the answer so the student corrects it, and
  returns focus to the field.
- The hint panel is one collapsed line (« 💡 Indices · 3 indices disponibles ») until
  a hint is requested; it opens itself on the first hint and resets per
  question.
- Hints stay available after an **incorrect** verdict (the server accepts a
  hint on an answered attempt; evidence is already recorded, so this cannot
  farm mastery). They close after a correct one; revealed hints stay as a
  trace. `HintPanel` shows the ladder: revealed / next (the only request
  button) / locked slots labelled by `type` (« Observe » · « Piste » · « Plan de résolution »),
  never by content.
- « Question suivante » lives in a footer, disabled only until an answer is checked
  — right or wrong (non-blocking). « Question précédente » scrolls to the previous
  card: it re-reads, it does not re-open an attempt. The footer is sticky
  above the mobile tab bar except on very short screens (landscape phones).
- The previous question is a compact summary (number, verdict in words, the
  student's answer, the statement clamped to two lines; « Voir l’explication » unfolds
  the statement and feedback) — no large card for finished work.
- Arrival (`QuestionArrival.jsx`): on « Question suivante », tall screens scroll the
  « Question précédente » summary to the top (context, then the question); phones scroll
  to the current card. Focus goes to the answer field on a fine pointer and to
  the question heading on touch (no virtual keyboard popping over an unread
  question). New exercise: top of page, focus on the `h1`. Nothing scrolls in
  classroom mode. `prefers-reduced-motion`: instant scroll, and framer-motion runs
  under `MotionConfig reducedMotion="user"`.
- Exercise completion shows « Tu as terminé cet exercice · Réponses justes : n / N »
  (`exerciseScore`) — the only celebration; no confetti per question.
- Buttons in the card carry an explicit text size: inside the classroom frame
  an inherited size is `1rem × scale`.

Tests: `questionHistory.test.js`, `QuestionHistory.test.jsx` (history, context
column, hint ladder without leaks), `learningPointProgress.test.js`,
`LearningPointProgress.test.jsx` (scenarios A, C, D, E; no mastery word in the
counters), `notebookAvailability.test.js`, `pageFrame.test.js` (`--flush`);
the DZ browser walk `e2e/lesson-kit/practice-progress.mjs` was deleted with the lesson walks.


## « Le coach du brevet » — the exam coach of an exam sheet (PILOT, 2026-11-15)

**Status: pilot, on the lessons whose pack has `coach` (`lesson.pack.js`, `LESSON_V2.md` §1) — none today (its DZ pilot
lesson is not in this repository). Not a rollout rule.**
The sheet, its steps, its timer and the server's grading are unchanged; the coach changes what surrounds them
(`features/practice/exam/examCoach.js`, `ExamCoach.jsx`, four small edits in `PracticeSession.jsx`):

- **« Salle d’examen »** stands before the sheet: phone away, paper and pen out, silence, the clock — and « Commencer
  l’épreuve » waits for a mode and for « J’ai ma feuille et mon stylo devant moi ». On a coached sheet the medal jingle is
  silent, and a strip above the answer keeps « Mode examen · Sans musique · Résous d’abord sur ta feuille, puis recopie
  ta réponse. ».
- **Two modes, chosen by the student and changeable at any time** (saved per student):
  - `guide` « Guide-moi seulement » — the answer is NEVER shown: after a mistake, three nudges one by one (re-read what is asked, the rule,
    the trap), and « Réessayer » is offered even on an exam sheet. A test (`examCoach.test.js`, on a neutral fixture) checks that no line of the
    solution appears in this mode.
  - `explain` « Explique-moi la solution » — the solution is told as a lesson, one step per tap: what is asked, the rule used, each written
    line, the result, the trap, the exam tip, then « rewrite it in your notebook without looking ». Once it is shown there is no
    retry (retyping a visible answer proves nothing — the existing rule).
- **The notebook of mistakes** — after ANY mistake, in both modes: « Prends ton cahier et note ton erreur, pour ne pas la
  refaire », with the lines to copy into the « Mes erreurs » part of the notebook (« Question », « Mon erreur » in the
  student's own words, « À retenir », what to remember; the right answer only in explain mode).
- **The rule reminded is the lesson's own** (`loadRule`: the pack part `coach` maps each learning point to its knowledge sheet)
  — never retyped. A lesson joins the pilot through its pack alone.
- Unit: `examCoach.test.js`. The practice page is a paper sheet and scrolls like one; the no-scroll rule is the game world's.
