# AI Lesson Contract

The contract every future lesson — human- or AI-authored — must honor for the
learning-intelligence system to work. Sibling to `EXERCISE_CONTRACT.md` (which
governs the validate → result boundary); this document governs **pedagogical
staging and assessment metadata**.

## What an AI lesson generator receives

- Grade, chapter, lesson (codes from `coursesData.js`).
- The lesson's `learningPoints` array: `[{id, title, order}]`, e.g.
  `{id: '4am_qasim-adad-tabii_P1', title: 'التعرّف على قاسم لعدد طبيعي من خلال الباقي المعدوم للقسمة الإقليدية', order: 1}`.

## Absolute rules

1. **Never invent a learning point id.** Only ids from the lesson's
   `learningPoints` array may appear in `assessment.learningPointIds`. The
   validator rejects unknown ids; the API rejects them at submission time.
2. **Every learning point must end up with ≥ 1 genuine assessment question.**
   "The lesson mentions it" or "a practice question uses it" does not count —
   the question's answer must provide meaningful evidence about that specific
   competency. If no existing question qualifies, generate one and integrate
   it into the challenge / final-evaluation section.
3. **Question CONTENT stays in JSX.** No prompt, option text or explanation
   in MySQL, ever. What the server needs to JUDGE — the learning points and
   their roles, the difficulty and the answer key (`correct`) — is exported
   to the assessment-item registry (`assessment_items`) by
   `exportContentRegistry.mjs` → `smarter:import-content-registry`, exactly as
   modules and exercises are. That is an index of the content, never a second
   definition of it (Mastery V2, 2026-09-24).
4. **Do not force bad mappings.** A question maps to the learning point(s) it
   actually measures — normally one primary learning point; several only when
   it genuinely evaluates several distinct competencies. When uncertain,
   classify the question as practice and write a better assessment instead.

5. **Never remove, fake or force a manipulation's manual gesture.** A
   generated activity whose gesture repeats mechanically once understood may
   rely on the type's auto-completion (`controls.autoComplete`,
   `MANIPULATION_CONTRACT.md` §6bis) — never a completed picture over an
   unchanged state, never a completion that fires without the learner's
   click, never a second definition of « correct », and never on a gesture
   that is itself the learning objective or an answer.

## The textbook owns the mathematics; the platform owns the experience

**Permanent product principle (2026-09-20).** A generated lesson must never
turn a textbook activity into a manipulation by copying its story. The pipeline
is:

```
textbook activity
   ↓  extract the mathematical objective        ← never changes
   ↓  extract the mathematical structure         ← never changes
   ↓  extract the intended discovery             ← never changes
   ↓  judge the textbook's CONTEXT for engagement and interactivity
   ↓  keep it · adapt it · or choose a better age-appropriate one
   ↓  generate مبتدئ and متقدم (both, always)
   ↓  choose the visualisation technology (reuse before adding a dependency)
   ↓  validate mathematics · interaction · age-appropriateness
```

Two fidelities, and only one is absolute:

- **Mathematical fidelity — non-negotiable.** Concept, definition, property,
  method, notation, vocabulary, progression, expected outcome. All from the
  textbook; all unchanged. Arithmetic comes from `packages/core/arithmetic/`.
- **Contextual fidelity — negotiable, never silent.** A situation may be
  replaced when the mathematical structure and the objective survive intact,
  the replacement introduces no ambiguity, and it is age-appropriate.

Every levelled manipulation therefore carries its traceability in
`lesson.config.js` — where the mathematics came from, what was adapted, and
why:

```js
{ level: 'beginner',
  objective: '…',                  // identical at both levels
  autonomy: '',                    // required and non-empty on 'advanced'
  experience: { type: 'platform_context',
                reason: 'smaller_numbers_for_first_contact', theme: 'football' },
  sourceElementIds: ['act-1'] }
```

`validate-lessons.mjs` **fails the build** on a missing level, divergent
objectives, an `advanced` level with no declared `autonomy`, an adapted context
with no reason from the closed list, or a levelled manipulation citing no
textbook element. The vocabularies live in
`packages/core/curriculum/manipulationLevels.js`; the full rule is
[`MANIPULATION_CONTRACT.md` §7bis-levels](./MANIPULATION_CONTRACT.md).

**Do not force a context.** When the textbook's situation is already
manipulable and the drawing *is* the argument, both levels keep it and only the
cognitive demand changes. A theme bolted onto a list of divisors makes the
mathematics harder to see, not more engaging.

## Non-blocking progression — HARD INVARIANT for every generated lesson

A generated lesson inherits this rule automatically. It is **normative**, and
a violation is a **RELEASE BLOCKER**:

- The generated lesson **MUST** allow progression after incorrect answers.
- The generated lesson **MUST NOT** create correctness-gated progression.
- The generated lesson **MUST** provide targeted feedback after errors
  (`explain` / `explainWrong` / `explainFor` naming the actual misconception,
  not just « Incorrect »).
- The generated lesson **MAY** recommend a retry.
- The generated lesson **MUST NOT** require a retry to unlock subsequent
  learning content.
- The generated lesson **MUST** provide a valid continuation path after an
  incorrect answer.

This applies to **every** generated question, in every stage —
`prerequisite_check`, `trigger`, `discovery`, `manipulation`,
`formalization`, `practice_lab` and `evaluation` alike.

Mechanically: the kit calls `onAnswered(isCorrect)` unconditionally and
reveals the correct answer, so a step must be marked done on *answered*, not
on *answered correctly*:

```jsx
- onAnswered={(ok) => { if (ok) setQ2(true); }}   // ❌ traps the learner
+ onAnswered={() => setQ2(true)}                   // ✅
```

Enforced by `npm run check:non-blocking` (in `npm run check:lessons`).
Full rule and the conforming exceptions (replayable manipulations,
bounded-attempt components): `LESSON_CONTRACT.md` § Progression non bloquante.

## Pedagogical staging

A lesson's **modules** follow the canonical learning journey
(`packages/core/curriculum/lessonStages.js`): `prerequisite_check → trigger →
discovery → manipulation → formalization → practice_lab → evaluation`, each
module declaring its `stage` in `lesson.config.js` (see `LESSON_CONTRACT.md`).
Two consequences for question authoring:

- **Enabled assessment questions may only live in an `evaluation`-stage
  module** (validator-enforced through the `modules/<NN>_<slug>.jsx`
  filename convention). Everything before the evaluation is learning — its
  questions never generate evidence.
- **Prerequisite checks never persist.** A `prerequisite_check` module's
  questions are `discovery`/`practice`-typed: they gate and orient the
  student locally, but produce no server-side evidence of any kind.

A lesson's questions belong to one of three roles:

| Role | When | Touches mastery? |
|---|---|---|
| `discovery` | the student is meeting the concept; mistakes are expected | never |
| `practice` | the student is training; scaffolded, hinted, retryable | never |
| `assessment` | challenges / final evaluation; the student demonstrates the competency | **yes — generates learning evidence** |

Judge the role from the question's actual pedagogical function, not its
location: a scaffolded, hint-laden, retry-until-correct sequence is practice
even if it sits in a "Boss Final" module. A live assessment module to read:
`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-mushtarak-akbar/modules/Module07Itqan.jsx`.

## Knowledge map — generated WITH the lesson (2026-09-29)

The lesson's Knowledge Map is the **progressive interactive learning map**
(`KNOWLEDGE_MAP.md` Part A): a Mind Map discovered node by node and its linear
numbered reading, both built from `knowledge.jsx` and `knowledgeGraph.js`. A
generator produces the graph **as part of the lesson**, never as a
post-processing step: its `reveals` is the lesson's progression, and its
guidance comes from the lesson's own material.

What to generate: the core nodes carrying every `knowledge.jsx` item
(`notebook: true`), labelled relationships, examples attached to what they
illustrate, and — only where the lesson supports them — common mistakes,
warnings, checks, tips, a reminder and a concise takeaway (A.13).

Where guidance may come from — and nowhere else:

| Guidance | Source in the generated lesson |
|---|---|
| خطأ شائع (wrong / why / right) | a question's distractor and its `explain`, an exercise's `commonError`, a module's correction (« العكس: … ») |
| تحقّق | the lesson's worked cases (an activity's computations, a method it teaches) |
| تذكّر | `priorKnowledge` as diagnosed by « أستعدّ », an exercise's `method` |
| انتبه | a condition written in a definition (`b ≠ 0`), a subtle distinction the lesson makes |
| نصيحة | a strategy the lesson itself teaches, within its `teachingScope` |
| خلاصة | the lesson's own definitions and remarks, assembled |

Absolute rules for the map (`KNOWLEDGE_MAP.md` A.10):

1. **Never invent knowledge or guidance to fill the map.** No generic advice
   (« انتبه أثناء الحساب »). No source in the lesson → no node.
2. **Import texts from `content/*.js`**; never retype a definition or an example.
3. **Gate every node** with `requires` = the item that establishes it: the map
   never shows what the lesson has not taught.
4. **Label every relationship** with why the two ideas connect; attach guidance
   to the idea it explains, never to the root by default.
5. **Keep the core dominant**: guidance stays fewer than half the nodes.
6. The map is **not a mastery system**: mastery stays per Learning Point
   (Mastery V2). Do not add a mastery field to a node.

7. **Write every equality inside `$…$`** and compute the worked arithmetic from
   the textbook's numbers; **never put an evaluation's answer in the map**
   (every node is visible once its teaching module is done).
8. A **خطأ شائع needs the lesson's own « لماذا؟ »**; without one, a distractor's
   rule is at most a انتبه.

Gate: the checklist of `KNOWLEDGE_MAP.md` A.14, automated for every lesson by
`progressive/lessonGraphs.test.js` (no per-lesson test to write) and
`validate-lessons.mjs` (mode, graph file, re-export). A.10 rules 11–16 and the
A.15 migration record list the traps the migrated lessons hit — read them first.

## Question metadata

```js
// ASSESSMENT — the only kind that submits evidence
{
  id: 'rp-flash-03',                       // REQUIRED: stable, unique within the lesson
  /* …existing question fields (q/prompt, options, explain, …)… */
  correct: 2,                              // REQUIRED literal index in the AUTHOR's `options` array, inside its range (validate-lessons --strict): the registry exports it as the answer key
  assessment: {
    enabled: true,
    type: 'assessment',
    // ONE learning point → the short form is fine:
    learningPointIds: ['4am_qasim-adad-tabii_P1'],
    // SEVERAL learning points → roles are REQUIRED (exactly one primary):
    // learningPoints: [
    //   { code: '4am_awwaliyan-fima-baynahuma_P3', role: 'primary' },
    //   { code: '4am_awwaliyan-fima-baynahuma_P2', role: 'secondary' },
    // ],
    difficulty: 3,                         // optional, 1..5 (default 3 on the server)
  },
}

// PRACTICE / DISCOVERY — metadata optional; if present, it must be inert:
{
  id: 'rp-practice-07',
  assessment: { enabled: false, type: 'practice' },   // no learningPointIds
}
```

Rules the validator (`npm run validate:lessons`) enforces:

- `id` is a literal, non-empty string, unique within the lesson.
- `assessment.enabled` is a boolean literal; `assessment.type` is one of
  `discovery | practice | assessment`.
- `enabled: true` requires `type: 'assessment'` and a non-empty
  `learningPointIds` **or** `learningPoints` whose every code belongs to
  **this** lesson.
- `learningPoints` carries exactly one `primary` (at most 4 entries).
  `learningPointIds` with **more than one** id is an error in a live lesson
  (it would declare several primaries — the registry refuses that).
- `difficulty`, when present, is an integer literal 1..5; `correct`, when
  present, is a numeric literal (a computed `correct` cannot be exported, so
  the server could not judge the question).
- `discovery`/`practice` questions must not carry `learningPointIds`.

**Display order ≠ author order (2026-09-29).** The final test shows each
question's options in a stable, per-question **display** order —
`optionOrder(id, n)` in `apps/web/src/lessons/common/kit/testPresentation.js`,
a deterministic shuffle seeded by the question id (same order on the board and
for the student, from one load to the next); `keepOrder: true` on a question
keeps the written order (a scale, an ordered list). The stored and submitted
`picked` and the registry's `correct` stay in the **author's index space**, so
authors keep writing `correct` as the index in their own `options` array and
never compensate for the shuffle.
- `enabled: true` questions must sit inside an `evaluation`-stage module's
  own file (`modules/<NN>_<slug>.jsx`).
- All metadata must be static literals (no computed values) — it is parsed,
  not executed.

This question-level convention **composes with** the existing lesson-level
`assessment: {moduleId, totalQuestions, masteryScore}` block in
`lesson.config.js` (the 3e convention) — that block keeps governing the local
"leçon maîtrisée" label; this one governs server-side evidence. They do not
conflict: the validator distinguishes them by the presence of `enabled`.

## Wiring evidence submission

**You normally write nothing.** The final test is `BossFinal`
(`lessons/common/kit`), which submits every question once, at the single
global submit. If a new evaluation component ever needs to submit evidence,
it calls the shared hook with the student's ANSWER — never with its own
verdict:

```js
import { useEvidenceSubmission } from '…/common/hooks/useEvidenceSubmission';

const { submitEvidence } = useEvidenceSubmission(MODULE_CTX.lessonId);
submitEvidence(question, { picked });   // picked = option index, or null if unanswered
```

The payload is `{questionCode, attemptId, answer: {picked}}`. The SERVER looks
the question up in the registry, judges `picked` against the answer key,
resolves the learning points, the difficulty and the source; an unanswered
question is recorded as `abandoned` (inert). The client-side `isCorrect` is
kept only for the results screen and XP.

The server **refuses the legacy `{isCorrect, learningPointCodes}` payload by
default** since 2026-09-29: `apps/api/config/mastery.php`
`accept_legacy_evidence_payload` defaults to `false`;
`MASTERY_ACCEPT_LEGACY_EVIDENCE=true` reopens it (the test suite's
`apps/api/phpunit.xml` sets it for inherited fixtures). A generated lesson
never sends that shape.

`submitEvidence` never throws and never blocks the lesson: failures are
parked in an offline queue (`evidenceQueue.js`) and retried: `flushEvidenceQueue`
runs at app start and on every `online` event (`apps/web/src/hooks/useLessonProgressSync.js`,
mounted in `App.jsx`), and again when a final test mounts (`useEvidenceSubmission`);
a 422 is kept with its error and a retry counter and expires after 30 days —
it is never dropped silently. Anonymous visitors and teachers generate no
evidence.

Reference implementation: the nine live 4AM lessons of unit 1
(`apps/web/src/lessons/moyen/4am/…/modules/Module0xItqan.jsx`, final module
« إختبار أولي »). `qawasim-adad-tabii` E5 and `awwaliyan-fima-baynahuma` E5 show
the `learningPoints` form with a primary and a secondary point.

## Quality bar for generated assessment questions

Appropriate for the grade and lesson; aligned with the learning point;
mathematically correct and unambiguous; solvable with the knowledge expected
at that point — every term and notation in `prompt` or `options`, distractors
included, is either established by an earlier `<KnowledgeBrick>` in the lesson
or listed in `priorKnowledge` and diagnosed by Module 0, declared with
`requires={[...]}`; a definition sitting in `explain`, `correction` or the
`footer` arrives after the demand and does not count (`KNOWLEDGE_DEPENDENCY.md`);
able to distinguish understanding from guessing (distractors encode real
misconceptions); consistent with the lesson's existing UX and
components. For each learning point, be able to answer: what competency, which
question, what success looks like, why the question measures it, and what
misconception a wrong answer reveals (the §26 audit — recorded per lesson in
`docs/reports/LEARNING_POINT_COVERAGE.md`).
