# EXERCISE_ENGINE_ARCHITECTURE.md

## 1. Purpose

The Exercise Engine is the platform's dedicated system for **repeated mathematical practice**.

It is not a simple `question → answer → feedback` quiz system.

Its purpose is to allow a student to:

- practice the mathematics of a completed lesson;
- work through school-style and exam-style exercises;
- choose a difficulty level;
- solve exercises sequentially;
- receive intelligent, progressive help without being given the solution;
- understand mistakes and misconceptions;
- write notes and mark mistakes in a persistent notebook;
- progressively strengthen the same Learning Points used by the lesson Final Test;
- build a historical record of practice, errors, hints, notes and performance;
- receive increasingly appropriate exercises as evidence accumulates.

The architecture must make it possible to generate and integrate large numbers of exercises later **without changing the Exercise Engine code**.

---

# 2. Fundamental pedagogical architecture

There are three distinct roles in the learning experience.

```text
LESSON MODULES
    ↓
Teach / discover / manipulate / understand
    ↓
No Learning Point evaluation

FINAL TEST
    ↓
Evaluate Learning Points

PRACTICE SYSTEM
    ↓
Train / repeat / challenge / diagnose
    ↓
Also contributes to the same Learning Point evaluation
```

The critical rule is:

> **Module activities are for teaching. The lesson Final Test and Practice Exercises are evaluation sources for the same canonical Learning Points.**

There must never be separate "practice mastery" and "final-test mastery" states.

There is one canonical Learning Point evaluation per student.

---

# 3. Relationship with lessons

Practice is a separate part of the platform.

A lesson does not contain the Practice Engine UI.

At the lesson/index level, the student can see:

```text
[ Commencer à pratiquer ]
```

Clicking this redirects the student to the Practice Hub for that lesson.

```text
Lesson Index
    │
    └── Commencer à pratiquer
            ↓
       Practice Hub
            ↓
      Level Selection
            ↓
         Exercise
```

The Practice Hub is therefore linked to a lesson through a stable `lessonId`, but is architecturally independent from the lesson module renderer.

---

# 4. Learning Point architecture

Learning Points (LPs) remain the canonical pedagogical units of the platform.

Every relevant Final Test question and every Practice question must reference one or more stable Learning Point IDs.

Example:

```text
LP-2N-DER-03
Calculer la dérivée d'une fonction simple
```

Practice must never create a second version of the Learning Point.

It references the existing canonical LP.

```text
Learning Point
       ↑
       │
 ┌─────┴──────────┐
 │                │
Final Test     Practice
```

---

# 5. Learning Point evaluation

## 5.1 One canonical evaluation

For each student and LP, the platform maintains one current evaluation state.

Example states:

- `non_evalue`
- `decouverte`
- `en_cours`
- `maitrise`
- `a_renforcer`

The exact student-facing French labels should follow the existing platform's canonical terminology.

The evaluation is based on historical evidence.

```text
LP
 │
 ├── Final Test evidence
 │
 ├── Practice evidence
 │
 ├── Answer quality
 │
 ├── Difficulty
 │
 ├── Hint usage
 │
 └── Repeated performance
          ↓
   Evaluation Engine
          ↓
 Current LP Evaluation
```

## 5.2 Module questions do not contribute

Questions inside normal lesson modules must never create formal LP evaluation evidence.

They may be used to teach, guide and prepare the student, but they do not update the canonical LP mastery state.

## 5.3 Final Test contributes

The Final Test at the end of the lesson produces formal evaluation evidence for the LPs it assesses.

## 5.4 Practice contributes

Practice exercises also produce LP evidence.

Practice can:

- strengthen an LP;
- confirm an LP;
- reveal weakness;
- reveal a misconception;
- cause an LP previously considered strong to require reinforcement.

The current LP state therefore represents the student's **current demonstrated level**, not a permanent result obtained once.

---

# 6. Evidence model

Every evaluation event should be stored historically.

Do not store only the latest score.

The system must be able to answer:

> Why is this student's LP currently considered mastered / in progress / needing reinforcement?

Each evidence record should contain enough context to reconstruct the decision.

Conceptually:

```text
LearningPointEvidence
    id
    studentId
    learningPointId
    sourceType
    sourceId
    exerciseId
    questionId
    level
    result
    answerQuality
    hintsUsed
    misconceptionId
    timestamp
```

Possible `sourceType`:

- `final_test`
- `practice`

Future source types can be added without redesigning the model.

---

# 7. Evaluation policy

The evaluation engine must be deterministic, configurable and testable.

It must not simply do:

```text
correct = +1
wrong = -1
```

A correct answer's evidential value depends on context.

Relevant dimensions include:

- source (`final_test` or `practice`);
- difficulty level;
- correctness;
- partial correctness where supported;
- number of attempts;
- hints used;
- misconception detected;
- repeated performance;
- recency;
- question/LP relationship.

The exact weighting algorithm must live in a dedicated domain service, not inside React components.

Recommended architecture:

```text
EvaluationEngine
    ├── EvidenceNormalizer
    ├── EvidenceScorer
    ├── MasteryPolicy
    └── LearningPointStateCalculator
```

The policy must be documented and covered by automated tests.

Do not scatter evaluation rules throughout the UI.

---

# 8. Exercise definition

An **Exercise** is a complete school-style mathematical problem.

It may contain several questions.

Example:

```text
Exercise
    ├── Statement
    ├── Question 1
    ├── Question 2
    ├── Question 3
    └── Question 4
```

This is preferable to treating every question as an exercise.

The student should feel that they are solving a real mathematical exercise, not completing a collection of disconnected quiz cards.

---

# 9. Question definition

Each question is independently evaluable.

A question can contain:

- statement/context;
- primary Learning Point;
- optional secondary Learning Points;
- answer type;
- student-facing answer format;
- expected answer;
- evaluation policy;
- choices if QCM;
- misconception mappings;
- hints;
- feedback;
- optional support/manipulation.

Relationship:

```text
Exercise
    ↓
Questions
    ↓
Learning Points
```

Each question should have one **primary LP** whenever possible.

Secondary LPs may be attached when the mathematical work genuinely involves them.

Avoid unnecessary LP mapping.

---

# 10. Answer modes

The Exercise Engine initially supports two first-class answer modes.

## 10.1 QCM

The student chooses:

```text
A
B
C
D
```

Each incorrect choice should, where pedagogically meaningful, map to a specific misconception.

Example:

```text
Choice B
→ misconception: derivative confused with function value

Choice C
→ misconception: sign error

Choice D
→ misconception: incorrect derivative rule
```

Therefore feedback can explain the student's mathematical thinking error rather than simply saying:

> "Wrong."

## 10.2 Free response / MathLive

The student enters a mathematical answer using MathLive.

Every free-response question must explicitly define:

```text
answerType: mathlive
answerFormat: ...
expectedAnswer: ...
evaluationPolicy: ...
```

### Student-facing answer format

`answerFormat` is visible to the student.

Examples:

```text
a^n
x = ...
... cm
... %
```

It tells the student **how to enter the response**, but must not:

- reveal the answer;
- reveal the method;
- make the problem artificially easier;
- contain hidden mathematical clues;
- expose evaluator data.

### Hidden evaluator data

The expected answer and evaluation rules are not shown.

The evaluator must support mathematical equivalence when appropriate.

Example:

```text
2(x + 3)
```

and

```text
2x + 6
```

may be equivalent when the question permits equivalent expressions.

However, when a question explicitly requires a form, the required form must be respected.

Therefore a question may define:

```text
acceptEquivalent: true
requiredForm: null
```

or:

```text
acceptEquivalent: true
requiredForm: factorized
```

The evaluation policy belongs to the question data, not the UI.

---

# 11. Answer outcomes

The evaluator should distinguish useful outcomes.

Recommended canonical outcomes:

```text
correct
equivalent_correct
partially_correct
incorrect
syntax_error
abandoned
```

The exact supported outcomes may evolve, but the model must not collapse every unsuccessful attempt into one generic `wrong`.

Where possible, an incorrect result should include:

```text
misconceptionId
```

---

# 12. Hints

Hints are progressive and should preserve productive struggle.

Each question can contain up to three hints.

Recommended structure:

```text
Hint 1 — LOOK
    Highlight important information.

Hint 2 — DIRECTION
    Tell the student where/how to start.

Hint 3 — STRATEGY
    Give the relevant method, formula or strategic direction.
```

Examples:

```text
Hint 1:
Observe the coefficient of x².

Hint 2:
Commence par calculer la dérivée.

Hint 3:
Utilise la règle de dérivation d'une puissance.
```

Hints must never directly reveal the final answer unless the product explicitly introduces a separate solution/reveal mechanism.

Hint usage must be recorded as historical events.

Hint usage can reduce the strength of evidence for autonomous mastery, but using a hint is not itself a failure.

---

# 13. Intelligent feedback

Feedback must be mathematical and diagnostic.

## Correct

Do not over-explain.

Confirm the result and, where useful, identify the mathematical idea successfully applied.

## Incorrect free response

The system should explain:

- what is wrong;
- what mathematical point should be reconsidered;
- which hint or next step may help.

It should not immediately dump the full solution.

## Incorrect QCM

If a misconception is mapped to the selected option, show a complete explanation of that misconception.

The goal is:

```text
Wrong
   ↓
Understand why
   ↓
Correct the reasoning
   ↓
Try again
```

not:

```text
Wrong
   ↓
Here is the answer
```

---

# 14. Difficulty levels

The initial system uses **5 levels**.

The architecture must nevertheless be configurable so that the number of levels can change in the future without rewriting the engine.

Recommended initial semantic progression:

| Level | Purpose |
|---|---|
| 1 | Reconnect / guided practice |
| 2 | Basic application |
| 3 | Standard school exercise |
| 4 | Complex / multi-step / transfer |
| 5 | Challenge / exam-style |

These names are semantic guidance, not merely UI labels.

## Difficulty is multidimensional

Difficulty must not be represented only by larger numbers.

Relevant dimensions include:

- conceptual distance;
- number of reasoning steps;
- abstraction;
- information density;
- novelty;
- autonomy;
- calculation load;
- representation changes;
- number of interacting LPs.

A Level 5 exercise should be difficult because of mathematical reasoning, structure or transfer—not merely because it contains larger numbers.

---

# 15. Initial content requirement

Every lesson connected to the Practice Engine must initially contain at least:

```text
3 exercises × 5 levels = 15 exercises
```

Therefore:

```text
Level 1 → 3
Level 2 → 3
Level 3 → 3
Level 4 → 3
Level 5 → 3
```

This is the **minimum initial content requirement**.

The architecture must make it trivial to add:

```text
15
30
50
100+
```

exercises later.

There must be no assumption that a level contains exactly three exercises.

---

# 16. Exercise variation

The three minimum exercises within a level must not simply be copies with different numbers.

Variation should include, where appropriate:

- different contexts;
- different representations;
- different wording;
- different data;
- different reasoning paths;
- different combinations of LPs;
- different misconceptions;
- different degrees of autonomy.

The goal is to prevent students from memorizing a template.

---

# 17. Level unlocking and practice progression

The student chooses a level from the Practice Hub.

Initial level progression should be controlled by a clear mastery policy.

However, the engine must not force a rigid:

```text
Exercise 1 → Exercise 2 → Exercise 3
```

experience forever.

Inside an unlocked level, exercise selection can become adaptive.

Example:

```text
Level 3

Exercise 1 → weak on LP2
       ↓
Next exercise targets LP2

Exercise 2 → strong
       ↓
Normal Level 3 exercise

Exercise 3 → misconception detected
       ↓
Targeted exercise
```

The system should prioritize the student's learning needs while preserving the chosen difficulty level.

---

# 18. Adaptive exercise selection

Exercise selection should eventually use:

- current LP evaluation;
- weak LPs;
- misconceptions;
- previous exercises;
- recent failures;
- recent successes;
- difficulty level;
- repetition needs;
- exercise history.

Architecture:

```text
PracticeSession
       ↓
RecommendationEngine
       ↓
Candidate Exercises
       ↓
Filtering
       ↓
Ranking
       ↓
Next Exercise
```

The recommendation engine must be separated from the Exercise Player.

---

# 19. Practice sessions

Practice should support a session concept.

A session can contain several exercises at the chosen level.

Example:

```text
Practice Session
    Lesson: Fractions
    Level: 3

    Exercise 1
    Exercise 2
    Exercise 3
    Exercise 4
    Exercise 5
```

At the end:

```text
Session Summary

LP progress
Mistakes
Misconceptions
Hints used
Exercises completed
Recommended next practice
```

The student should be able to continue practicing without returning manually to the lesson.

---

# 20. Notebook / mistakes system

Every exercise should provide a notebook area.

The student can:

- write a note;
- mark a mistake;
- record a difficulty;
- annotate their reasoning.

Notes and mistakes must be persisted in the backend.

They are historical records, not ephemeral UI state.

Conceptually:

```text
NotebookNote
    id
    studentId
    lessonId
    exerciseId
    questionId
    learningPointId
    content
    mistakeType
    createdAt
    updatedAt
```

Later the platform can expose:

```text
Mes erreurs
Mes notes
Mes erreurs par Learning Point
Mes erreurs par chapitre
Mes erreurs par type
```

Do not build these future dashboards now unless required by the current scope, but the data model must support them.

---

# 21. Optional interactive laboratory

A Level 1 exercise may include an interactive manipulation/lab when it has genuine pedagogical value.

Example:

```text
Exercise
    ├── Statement
    ├── Interactive Lab
    └── Questions
```

The lab is optional.

It must not become a decorative game.

Use it only when manipulating an object, graph, number line, geometric figure, etc. genuinely helps the student find or understand the answer.

The lab must remain subordinate to the mathematical exercise.

---

# 22. School/exam authenticity

The Practice Engine should visually and cognitively resemble real French school mathematics.

The student should feel:

> "Je suis en train de faire un exercice de maths."

not:

> "Je joue à un quiz."

Modern interaction design is encouraged, but the mathematical task remains serious.

The UI should prioritize:

- readable statement;
- clear mathematical notation;
- enough workspace;
- answer area;
- hints;
- feedback;
- notebook;
- progress.

Avoid excessive:

- XP;
- coins;
- badges;
- animations unrelated to mathematics;
- countdown pressure by default;
- game-like answer cards.

Gamification is secondary.

Mastery is the reward.

---

# 23. Content must be data-driven

React components must not contain exercise-specific mathematical content.

The renderer should consume structured exercise definitions.

Conceptually:

```text
Exercise JSON
       ↓
Exercise Validator
       ↓
Exercise Engine
       ↓
React Renderer
```

Adding a new exercise should require content creation and validation, not new frontend components.

---

# 24. Recommended exercise contract

Illustrative structure:

```json
{
  "id": "ex-2nde-fonctions-003",
  "lessonId": "2nde-fonctions-affines",
  "level": 3,

  "metadata": {
    "title": "Variation d'une fonction",
    "estimatedMinutes": 8,
    "tags": ["standard", "multi-step"]
  },

  "learningPoints": [
    {
      "id": "LP-2N-FCT-03",
      "role": "primary"
    }
  ],

  "statement": {
    "content": "..."
  },

  "questions": [
    {
      "id": "q1",
      "learningPoints": [
        {
          "id": "LP-2N-FCT-03",
          "role": "primary"
        }
      ],

      "answerType": "mathlive",
      "answerFormat": "x = ...",

      "expectedAnswer": "...",

      "evaluationPolicy": {
        "acceptEquivalent": true,
        "requiredForm": null
      },

      "hints": [
        {
          "id": "h1",
          "type": "look",
          "content": "..."
        },
        {
          "id": "h2",
          "type": "direction",
          "content": "..."
        },
        {
          "id": "h3",
          "type": "strategy",
          "content": "..."
        }
      ],

      "feedback": {
        "correct": "...",
        "incorrect": "..."
      }
    }
  ]
}
```

This is illustrative. The actual contract must be aligned with the existing `EXERCISE_CONTRACT.md` and project architecture before implementation.

---

# 25. QCM contract

Illustrative:

```json
{
  "answerType": "choice",

  "choices": [
    {
      "id": "A",
      "content": "...",
      "isCorrect": true
    },
    {
      "id": "B",
      "content": "...",
      "isCorrect": false,
      "misconceptionId": "MISC-SIGN-001"
    },
    {
      "id": "C",
      "content": "...",
      "isCorrect": false,
      "misconceptionId": "MISC-RULE-002"
    },
    {
      "id": "D",
      "content": "...",
      "isCorrect": false,
      "misconceptionId": "MISC-CONCEPT-003"
    }
  ]
}
```

Misconceptions should be reusable entities/IDs rather than duplicated free text whenever practical.

---

# 26. Backend architecture

Separate content from student evidence.

## Content entities

Conceptually:

```text
lessons
learning_points
exercises
exercise_questions
exercise_learning_points
exercise_choices
exercise_hints
exercise_misconceptions
exercise_variants
```

## Student activity/evidence entities

```text
practice_sessions
exercise_attempts
question_attempts
hint_events
misconception_events
notebook_notes
learning_point_evidence
```

The exact Laravel/MySQL implementation must follow the existing project conventions.

Do not create redundant parallel LP systems.

---

# 27. Attempt model

An attempt must represent an actual student interaction.

A question attempt should record enough information to reconstruct what happened.

Conceptually:

```text
QuestionAttempt
    id
    sessionId
    exerciseId
    questionId
    studentId
    submittedAnswer
    normalizedAnswer
    outcome
    score/evidence value
    hintsUsed
    misconceptionId
    startedAt
    submittedAt
```

Sensitive or unnecessary raw data should not be stored merely because it is technically possible.

---

# 28. Historical integrity

Never overwrite historical attempts to represent a new state.

Store:

```text
Attempt 1
Attempt 2
Attempt 3
...
```

and derive the current LP state from evidence.

This allows future features such as:

- progress history;
- error review;
- improvement graphs;
- spaced practice;
- teacher reports;
- family reports;
- recommendation systems.

---

# 29. Separation of responsibilities

The architecture should clearly separate:

```text
Content
    ↓
Contracts / validation

Evaluation
    ↓
Answer correctness + evidence

Mastery
    ↓
Learning Point state

Recommendation
    ↓
What to practice next

Session
    ↓
Practice flow

UI
    ↓
Rendering / interaction
```

React components must not implement database persistence or mastery algorithms directly.

---

# 30. Recommended frontend package architecture

Adapt names to the existing repository structure, but conceptually:

```text
packages/
  exercise-engine/
    core/
      evaluator/
      hint-engine/
      misconception-engine/
      mastery-engine/
      recommendation-engine/
      session-engine/
      math-comparison/
    contracts/
      exercise.schema
      question.schema
      answer.schema
      hint.schema
      feedback.schema
    components/
      ExercisePlayer
      ExerciseStatement
      QuestionRenderer
      ChoiceInput
      MathInput
      HintPanel
      FeedbackPanel
      Notebook
      SessionProgress
      LevelSelector
      SessionSummary
      PracticeHub
    content/
      exercises/
        6e/
        5e/
        4e/
        3e/
        2nde/
        1ere/
        terminal/
```

Adapt this to existing repository conventions rather than creating unnecessary parallel architecture.

---

# 31. Validation

Every exercise must pass automated validation before integration.

Validation must check at minimum:

### Identity
- stable unique exercise ID;
- valid lesson ID;
- valid LP IDs;
- valid question IDs.

### Difficulty
- valid level;
- level exists in the configured level system.

### Questions
- valid answer type;
- valid answer format;
- valid expected answer;
- valid evaluation policy.

### QCM
- valid choices;
- exactly the appropriate number of correct answers;
- misconception mappings where required.

### Hints
- valid ordering;
- maximum supported number;
- no accidental answer leakage.

### LP mapping
- every evaluative question has a valid LP mapping.

### Content
- no missing required fields;
- no malformed mathematical content;
- no duplicate IDs.

### Lesson minimum
For a lesson's initial Practice content:

```text
5 levels
×
3 exercises minimum
=
15 exercises minimum
```

---

# 32. Exercise generation pipeline

The system must be designed for continuous content generation.

Recommended workflow:

```text
Existing curriculum / lesson documentation
            ↓
Learning Points
            ↓
Exercise generation specification
            ↓
Exercise JSON generation
            ↓
Automated schema validation
            ↓
Pedagogical validation
            ↓
Integration
            ↓
Runtime validation
```

When generating exercises for a lesson, the generation agent must first understand:

- the lesson;
- its Learning Points;
- prerequisites;
- what was already taught;
- what must not be duplicated;
- the intended level progression;
- existing exercise patterns.

Generated exercises must respect the existing project's canonical contracts and terminology.

---

# 33. Scaling content

The architecture must support adding exercises without code changes.

Example:

```text
Initial:
15 exercises / lesson

Later:
30 exercises / lesson

Later:
50 exercises / lesson

Later:
100+ exercises / lesson
```

The engine should automatically discover valid exercise content through the configured content registry/index.

Do not hardcode:

```text
exercise1
exercise2
exercise3
```

inside React.

---

# 34. Exercise variants

The architecture should support future variants of an exercise.

For example:

```text
Base Exercise
    ├── Variant A
    ├── Variant B
    ├── Variant C
```

Variants may change:

- numbers;
- context;
- representation;
- wording;
- parameters.

They must preserve the intended mathematical structure and LP mapping.

This enables large-scale practice generation without making every exercise manually unique in architecture.

---

# 35. Student experience

Expected flow:

```text
Student finishes lesson
        ↓
Final Test
        ↓
Learning Point evaluation
        ↓
Lesson result
        ↓
[ Commencer à pratiquer ]
        ↓
Practice Hub
        ↓
Select level
        ↓
Practice Session
        ↓
Exercise
        ↓
Question
        ↓
Answer
        ↓
Feedback / hint / correction
        ↓
Next question
        ↓
Next exercise
        ↓
Session Summary
        ↓
Updated LP evaluation
        ↓
Recommended next action
```

---

# 36. Practice Hub

The Practice Hub should display the selected lesson and its practice levels.

Example:

```text
Dérivée d'une fonction

Ta progression

Niveau 1
Reprendre les bases
3+ exercices

Niveau 2
Consolider
3+ exercices

Niveau 3
S'entraîner
3+ exercices

Niveau 4
Approfondir
3+ exercices

Niveau 5
Challenge
3+ exercices
```

The actual labels can follow the final UX copy system.

Completed levels should remain accessible.

Locked levels should have a clear pedagogical reason.

---

# 37. Accessibility and usability

The Exercise Player must be usable on:

- desktop;
- tablet;
- mobile web.

Mathematical content must remain readable.

The student must always understand:

1. what is being asked;
2. where to answer;
3. what format is expected;
4. how to request help;
5. what happened after submission;
6. what to do next.

The student should never have to guess the intended interaction.

---

# 38. Performance

The Exercise Player should not load an entire future exercise library into memory unnecessarily.

Use appropriate:

- lazy loading;
- content indexing;
- session-level loading;
- caching;
- pagination or candidate selection where appropriate.

Do not sacrifice pedagogical correctness for premature optimization.

---

# 39. Security and integrity

Student evidence must be persisted server-side.

The client must not be trusted to declare:

```text
correct = true
mastery = mastered
```

The backend/domain layer must validate important evaluation results.

Expected answers and sensitive evaluator logic should not be unnecessarily exposed to the client.

---

# 40. Testing strategy

The Exercise Engine requires strong automated tests because errors in evaluation can corrupt the student's learning data.

## Unit tests

Test:

- MathLive equivalence;
- required-form evaluation;
- QCM correctness;
- misconception mapping;
- hint progression;
- evidence calculation;
- LP state transitions;
- difficulty weighting;
- adaptive selection.

## Contract tests

Every exercise fixture must validate against the canonical schema.

## Integration tests

Test:

```text
Exercise
 → answer
 → attempt
 → evidence
 → LP evaluation
 → persisted state
```

## End-to-end tests

At minimum:

```text
Lesson
 → Final Test
 → LP evaluation
 → Start Practice
 → Level selection
 → Exercise
 → answer
 → hint
 → feedback
 → next exercise
 → updated LP evaluation
```

---

# 41. Non-goals for the first implementation

Do not unnecessarily build:

- teacher dashboards;
- parent dashboards;
- advanced analytics dashboards;
- social leaderboards;
- complex reward economies;
- AI-generated feedback at runtime;
- automatic generation of hundreds of exercises;
- mobile native application;
- unnecessary game mechanics.

The first objective is a robust, reusable Exercise Engine and its evidence/evaluation backbone.

---

# 42. Implementation phases

## Phase 1 — Audit and contract

Before coding:

1. Read all existing architecture and pedagogy documentation.
2. Read the existing `EXERCISE_CONTRACT.md`.
3. Inspect current exercise-related code.
4. Inspect current Learning Point/progress implementation.
5. Inspect Final Test implementation.
6. Identify reusable existing components and services.
7. Identify conflicts before creating new architecture.
8. Define the final Exercise Contract.

Do not replace existing systems blindly.

---

## Phase 2 — Domain engine

Implement/test pure domain logic:

```text
Evaluator
HintEngine
MisconceptionEngine
MasteryEngine
RecommendationEngine
SessionEngine
MathComparison
```

No UI-specific logic.

---

## Phase 3 — Exercise Player

Implement:

```text
PracticeHub
LevelSelector
ExercisePlayer
QuestionRenderer
ChoiceInput
MathInput
HintPanel
FeedbackPanel
Notebook
SessionProgress
SessionSummary
```

Reuse existing platform UI primitives where possible.

---

## Phase 4 — Persistence

Implement backend persistence for:

- sessions;
- attempts;
- hints;
- misconceptions;
- notes;
- LP evidence.

Connect to the existing Laravel/MySQL architecture.

---

## Phase 5 — Shared LP evaluation

Connect:

```text
Final Test → LP Evidence → LP Evaluation

Practice → LP Evidence → LP Evaluation
```

Ensure there is one canonical LP state.

Module activities remain excluded.

---

## Phase 6 — First production lesson

Create at least:

```text
5 levels
×
3 exercises
=
15 exercises
```

for one lesson.

Use this as the reference implementation.

---

## Phase 7 — Quality validation

Validate:

- pedagogy;
- mathematical correctness;
- UX;
- accessibility;
- evaluation correctness;
- persistence;
- LP state transitions;
- responsive behavior.

Only after the reference implementation is solid should large-scale exercise generation begin.

---

# 43. Critical invariants

These rules must never be violated.

### Invariant 1

> Module questions do not modify LP evaluation.

### Invariant 2

> Final Test and Practice contribute to the same canonical LP evaluation.

### Invariant 3

> There is no separate practice mastery and final-test mastery.

### Invariant 4

> Historical evidence is never replaced by the latest attempt.

### Invariant 5

> Exercise content is data-driven, not hardcoded into React.

### Invariant 6

> Every evaluative question has explicit LP mapping.

### Invariant 7

> Every free-response question defines a student-facing answer format.

### Invariant 8

> Student-facing answer format must not reveal the answer or solution.

### Invariant 9

> QCM distractors should encode meaningful misconceptions whenever possible.

### Invariant 10

> Hints guide without immediately revealing the solution.

### Invariant 11

> Difficulty levels represent increasing mathematical demand, not merely larger numbers.

### Invariant 12

> Every lesson initially has at least 15 exercises: 3 per level across 5 levels.

### Invariant 13

> Adding more exercises must not require changing Exercise Engine code.

### Invariant 14

> Notebook notes and mistakes are persistent historical records.

### Invariant 15

> The current LP state must be explainable from stored evidence.

---

# 44. Final architectural principle

The Exercise Engine is not:

```text
Question
    ↓
Answer
    ↓
Correct / Wrong
```

It is:

```text
Learning Point
      ↓
Exercise
      ↓
Question
      ↓
Student reasoning
      ↓
Answer
      ↓
Evaluation
      ├── Correctness
      ├── Misconception
      ├── Hint usage
      └── Difficulty
      ↓
Historical Evidence
      ↓
Canonical Learning Point Evaluation
      ↓
Next Practice Recommendation
```

The fundamental product principle is:

> **Teach inside the lesson. Evaluate through the Final Test and Practice. Practice repeatedly. Use every meaningful practice interaction to understand and improve the student's Learning Point mastery.**

The engine must be built once, rigorously, so that the platform can then scale from 15 exercises per lesson to hundreds or thousands of exercises without architectural redesign.
