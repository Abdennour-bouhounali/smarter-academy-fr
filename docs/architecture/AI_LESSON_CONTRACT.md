# AI Lesson Contract

> **Status (2026-11-22).** Covers the learning-point and assessment-metadata rules every generated lesson must honor.
> Imported from the Algerian platform (DZ `dev` `7f4cef1c`) on 2026-11-22. True here: the absolute rules, the question
> roles, the metadata that `validate-lessons.mjs` checks, the server judging evidence from the registry. Not true here:
> the module-lesson kit (`BossFinal`, `useEvidenceSubmission`, `evidenceQueue.js`), the progressive knowledge map and the
> textbook-levelled manipulations are deleted (their sections are cut). A v2 lesson's evidence goes through
> `gameworld/kit/evidenceSend.js` (`LESSON_V2.md` §1bis). No lesson exists yet.

The contract every future lesson — human- or AI-authored — must honor for the
learning-intelligence system to work. Sibling to `EXERCISE_CONTRACT.md` (which
governs the validate → result boundary); this document governs **pedagogical
staging and assessment metadata**.

## What an AI lesson generator receives

- Grade, chapter, lesson (codes from `coursesData.js`).
- The lesson's `learningPoints` array: `[{id, title, order}]`; an id is `<grade>_<lessonCode>_P<n>`, opaque and
  append-only (`FRANCE_REBUILD_PLAN.md` §2).

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

## Where the mathematics comes from

In this repository the official French texts (`docs/curriculum/officiel/`) say WHAT is taught, never HOW: own
contexts, own numbers, own wording; never a textbook (root `CLAUDE.md`). The Algerian section « the textbook owns the
mathematics » and its levelled-manipulation traceability were cut on 2026-11-22.

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
  module** (validator-enforced). Everything before the evaluation is learning — its
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
even if it sits in a final module.

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
    learningPointIds: ['3e_<lessonCode>_P1'],
    // SEVERAL learning points → roles are REQUIRED (exactly one primary):
    // learningPoints: [
    //   { code: '3e_<lessonCode>_P3', role: 'primary' },
    //   { code: '3e_<lessonCode>_P2', role: 'secondary' },
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

- `enabled: true` questions must sit inside an `evaluation`-stage module.
- All metadata must be static literals (no computed values) — it is parsed,
  not executed.

This question-level convention **composes with** the existing lesson-level
`assessment: {moduleId, totalQuestions, masteryScore}` block in
`lesson.config.js` (a convention of the old French lessons); this one governs server-side evidence. They do not
conflict: the validator distinguishes them by the presence of `enabled`.

## Wiring evidence submission

The client sends the student's ANSWER, never its own verdict; the SERVER looks the question up in the registry, judges
it against the answer key and resolves the learning points, the difficulty and the source. In a v2 lesson only
exam-format first tries are evidence, sent by `gameworld/kit/evidenceSend.js` to `POST /lessons/{lesson}/game-evidence`
(idempotent by `attemptId`; a failed send is queued per student for 30 days) — `LESSON_V2.md` §1bis. The server refuses
the legacy `{isCorrect, learningPointCodes}` payload unless `MASTERY_ACCEPT_LEGACY_EVIDENCE=true`
(`apps/api/config/mastery.php`). Anonymous visitors and teachers generate no evidence.

## Quality bar for generated assessment questions

Appropriate for the grade and lesson; aligned with the learning point;
mathematically correct and unambiguous; solvable with the knowledge expected
at that point — every term and notation in the question, distractors included, has been met before the demand
(`KNOWLEDGE_DEPENDENCY.md`);
able to distinguish understanding from guessing (distractors encode real
misconceptions); consistent with the lesson's existing UX and
components. For each learning point, be able to answer: what competency, which
question, what success looks like, why the question measures it, and what
misconception a wrong answer reveals.
