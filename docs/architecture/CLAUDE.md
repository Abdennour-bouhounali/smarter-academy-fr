# CLAUDE.md — Smarter Academy

> This file is the primary project context and engineering constitution for Smarter Academy.
> Read and follow it before modifying architecture, learning logic, lessons, interactions, backend models, or shared components.

---

# 1. PROJECT IDENTITY

## Product

Smarter Academy is an adaptive, interactive mathematics learning platform for students in the French education system.

The product is not simply:
- a collection of online courses
- a quiz platform
- a homework platform
- an AI chatbot
- a gamified exercise bank

It is intended to become a:

> **Learning Engine that understands what the student knows, how they reason, where they struggle, why they struggle, and what they should do next.**

The core product loop is:

```text
Student
   ↓
Interaction
   ↓
Observation
   ↓
Evidence
   ↓
Diagnosis
   ↓
Mastery estimation
   ↓
Next best learning action
   ↓
New interaction
```

---

# 2. PRODUCT NORTH STAR

The central question of the platform is:

> **"What should this student do next to learn this concept effectively?"**

Everything should ultimately support this question.

Do not optimize primarily for:
- number of lessons
- number of exercises
- visual complexity
- amount of content
- AI-generated explanations
- gamification metrics

Optimize for:
- learning effectiveness
- conceptual understanding
- meaningful interaction
- misconception detection
- mastery
- retention
- appropriate difficulty
- student motivation
- measurable learning evidence

---

# 3. PEDAGOGICAL PHILOSOPHY

The Smarter Academy methodology is:

```text
CONCRET
   ↓
VISUEL
   ↓
NUMÉRIQUE
   ↓
SYMBOLIQUE
   ↓
AUTOMATISATION
```

The broader learning loop is:

```text
1. Discover
2. Manipulate
3. Understand
4. Formulate
5. Practice
6. Diagnose
7. Transfer
8. Master
```

A lesson should progressively move from experience to abstraction.

Avoid introducing formal notation before the learner has had a meaningful opportunity to observe the underlying mathematical idea.

---

# 4. CORE PEDAGOGICAL RULE

## Never teach the symbol before the meaning when the concept can be discovered.

Bad:

```text
Definition
   ↓
Formula
   ↓
Exercise
```

Preferred:

```text
Real situation
   ↓
Manipulation
   ↓
Observation
   ↓
Prediction
   ↓
Explanation
   ↓
Mathematical language
   ↓
Symbolic representation
   ↓
Practice
   ↓
Transfer
```

The interface should help students construct the concept rather than merely display it.

---

# 5. STUDENT EXPERIENCE PRINCIPLES

Target users are primarily collège and lycée students in France.

Students should not feel like they are reading a digital textbook.

The experience should feel:
- active
- visual
- responsive
- immediate
- playful
- clear
- purposeful
- rewarding

But:

> **Gamification must reinforce learning, not distract from it.**

Avoid:
- unnecessary animations
- decorative interactions
- animations with no pedagogical purpose
- excessive badges
- noisy UI
- long explanations
- redundant screens
- unnecessary text entry

---

# 6. INTERACTION-FIRST DESIGN

Whenever a mathematical concept can be manipulated, prefer manipulation over passive explanation.

Examples:

## Fractions

Prefer:
```text
divide
drag
shade
merge
split
compare
place on number line
construct
```

over:
```text
read definition
type answer
```

## Geometry

Prefer:
```text
drag point
construct shape
change angle
resize
observe invariants
```

## Functions

Prefer:
```text
move x
observe y
drag graph
change parameters
```

## Probability

Prefer:
```text
simulate
repeat
observe frequency
compare theoretical probability
```

## Algebra

Prefer:
```text
balance
move tiles
group
decompose
transform
```

---

# 7. MATHEMATICAL REPRESENTATION RULE

Whenever possible, maintain several synchronized representations:

```text
CONCRETE
   ↕
VISUAL
   ↕
NUMERICAL
   ↕
SYMBOLIC
```

Example:

```text
3/4
```

should potentially correspond to:
```text
partitioned object
+
fraction strip
+
number line
+
quantity
+
symbol 3/4
```

All representations should derive from the same mathematical state.

Do NOT maintain independent mathematical states for different visualizations.

---

# 8. SINGLE SOURCE OF MATHEMATICAL TRUTH

This is a critical architectural invariant.

Example:

```ts
type FractionState = {
  numerator: number
  denominator: number
}
```

The following must derive from this state:
- SVG partition
- fraction strip
- shaded quantity
- number line position
- textual representation
- answer validation

Never allow:
```text
SVG state ≠ number-line state ≠ answer state
```

Instead:
```text
             Mathematical State
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
      SVG       NumberLine    Symbol
```

---

# 9. TECHNICAL STACK

## Primary language

TypeScript.

Use TypeScript across the main application wherever practical.

Reasons:
- shared types
- safer contracts
- easier refactoring
- frontend/backend consistency
- complex domain model
- interactive state
- learning engine

---

# 10. FRONTEND STACK

Preferred:

```text
TypeScript
React
Vite
Tailwind CSS
Zustand
TanStack Query
Framer Motion / Motion
KaTeX
SVG
```

Potential specialized technologies:

```text
PixiJS
Phaser
Matter.js
```

Use them only when justified.

---

# 11. ROLE OF EACH FRONTEND TECHNOLOGY

## React

Use for:
- application architecture
- lesson composition
- UI components
- module orchestration
- dashboards
- navigation
- state integration

React is not the mathematical engine.

## SVG

SVG is the preferred technology for:
- mathematical diagrams
- fractions
- number lines
- geometry
- graphs
- manipulable shapes
- educational visualizations

Prefer SVG when mathematical objects need:
- semantic identity
- precise geometry
- accessibility
- direct manipulation
- scalable rendering

## Motion / Framer Motion

Use for:
- UI transitions
- feedback
- success states
- progress
- onboarding
- cards
- micro-interactions
- rewards

Do not use animation purely for decoration.

## Zustand

Use for:
- local lesson state
- interaction state
- transient manipulation state
- lesson session state

Do not put everything into global state.

## TanStack Query

Use for:
- API data
- server state
- caching
- synchronization
- invalidation
- loading/error states

Do not use Zustand as a replacement for server-state management.

## KaTeX

Use for mathematical notation.

Never ask students to type raw LaTeX or plain-text fractions when a visual interaction can be provided.

---

# 12. PIXIJS

PixiJS is a specialized rendering engine.

Use it for:
- high-object-count 2D scenes
- simulations
- particles
- rich 2D interactions
- complex visual environments

Do NOT replace normal React/SVG UI with PixiJS.

Use SVG for precise mathematical manipulation whenever possible.

---

# 13. PHASER

Phaser is optional.

Use it when an activity genuinely becomes a game:
- character movement
- collision
- levels
- game worlds
- arcade mechanics
- game loops
- game scenes

Do NOT build the entire learning platform in Phaser.

Phaser is an activity/game layer, not the application architecture.

---

# 14. MATTER.JS

Use Matter.js only when physics adds meaningful pedagogical value.

Potential use cases:
- spatial reasoning
- vectors
- probability simulations
- physics-inspired mathematical activities
- balance mechanics

Never introduce physics merely because it looks impressive.

---

# 15. BACKEND

Preferred architecture for a new implementation:

```text
NestJS
Prisma
PostgreSQL
```

Laravel may remain in an existing deployment if required, but a new architecture should strongly consider TypeScript end-to-end for the main application backend.

---



# 18. LEARNING ENGINE

The learning engine is one of the core intellectual components of Smarter Academy.

Conceptual architecture:

```text
LearningEngine
├── SkillGraph
├── PrerequisiteResolver
├── DiagnosticEngine
├── MisconceptionEngine
├── MasteryEngine
├── EvidenceEngine
├── AdaptivePractice
└── RecommendationEngine
```

---

# 19. SKILLS

A skill represents a meaningful mathematical capability.

Example:

```text
fraction.meaning
fraction.numerator
fraction.denominator
fraction.equivalence
fraction.comparison
fraction.addition
```

Skills should be:
- atomic enough to diagnose
- meaningful pedagogically
- connected to prerequisites
- observable through evidence

Avoid defining skills that are simply lesson titles.

---

# 20. PREREQUISITES

Skills form a graph.

Example:

```text
unit_partition
      ↓
fraction_meaning
      ↓
numerator_denominator
      ↓
equivalent_fractions
      ↓
fraction_comparison
      ↓
fraction_operations
```

The graph should influence:
- diagnostics
- remediation
- recommendations
- mastery
- lesson sequencing

---

# 21. MISCONCEPTIONS

Misconceptions are first-class entities.

Examples:

```text
numerator_denominator_confusion
fraction_as_two_independent_numbers
larger_denominator_means_larger_fraction
decimal_comma_misinterpretation
sign_rule_error
equation_operation_error
```

A wrong answer is NOT automatically a misconception.

Evidence must support the diagnosis.

---

# 22. LEARNING EVIDENCE

Do not reduce learning to a score.

Capture evidence such as:

```ts
type LearningEvidence = {
  studentId: string
  skillId: string
  moduleId: string

  correct: boolean

  responseTime?: number
  attempts?: number

  interactionType?: string

  misconception?: string

  prediction?: boolean
  explanation?: boolean
  transfer?: boolean
}
```

The exact schema may evolve, but the principle must remain:

> **Capture evidence about reasoning, not only answers.**

---

# 23. MASTERY

Mastery should not simply be:

```text
correctAnswers / totalAnswers
```

Eventually mastery should consider:
- repeated performance
- difficulty
- transfer
- response patterns
- misconceptions
- recency
- prerequisite mastery
- independent performance
- hints
- time
- context

Possible future models:
- Bayesian Knowledge Tracing
- Item Response Theory
- Knowledge tracing
- probabilistic student models
- ML-based mastery prediction

Start simple and measurable.

Do not build a sophisticated model before enough data exists.

---

# 24. DIAGNOSTIC SYSTEM

Diagnostics should answer:

> What does the student know?

and more importantly:

> What is preventing the student from progressing?

Diagnostic activities should identify:
- missing prerequisite
- misconception
- procedural weakness
- conceptual weakness
- transfer weakness

Avoid giant diagnostic exams when a few targeted interactions can isolate the issue.

---

# 25. ADAPTIVE LEARNING

The system should eventually produce:

```text
Next Best Action
```

Possible actions:

```text
continue
practice
remediate
review prerequisite
change representation
increase difficulty
decrease difficulty
explain differently
attempt transfer
assess mastery
```

Do not simply recommend the next lesson in chronological order.

---

# 26. LESSON ARCHITECTURE

A lesson should be declarative at the top level.

Conceptually:

```text
Lesson
├── metadata
├── objectives
├── skills
├── prerequisites
├── modules
├── final assessment
└── navigation
```

A module should have a clear pedagogical purpose.

Example:

```text
Module
├── phase
├── objective
├── skill
├── interaction
├── evidence
├── validation
└── completion
```

---

# 27. MODULE RESPONSIBILITY

Each module should answer:

> "What is this module uniquely responsible for teaching or measuring?"

If two modules teach the same concept in essentially the same way, reconsider the architecture.

Avoid duplication of:
- explanations
- definitions
- examples
- interactions
- exercises
- feedback

---

# 28. PEDAGOGICAL SEQUENCING

Before creating a module, determine:

```text
What does the student already know?
        ↓
What experience should they have?
        ↓
What should they notice?
        ↓
What should they predict?
        ↓
What concept should emerge?
        ↓
What language should formalize it?
        ↓
What practice is needed?
        ↓
What evidence proves understanding?
        ↓
Can they transfer it?
```

Do not explain a concept in Module 1 if Module 3 exists specifically to let the student discover it.

---

# 29. LESSON CONTRACT

Every lesson should have:

```text
1. Clear learning objective
2. Explicit skill mapping
3. Prerequisites
4. Pedagogical progression
5. Interactive manipulation
6. Feedback
7. Evidence collection
8. Progress tracking
9. Transfer
10. Final mastery check
```

---

# 30. EXERCISE CONTRACT

Every exercise should define:

```text
skill
difficulty
objective
input
validation
feedback
misconceptions
evidence
```

Prefer structured exercise definitions over custom validation scattered across components.

---

# 31. INTERACTION CONTRACT

An interaction should define:

```text
initial state
allowed actions
mathematical state
visual representation
constraints
validation
feedback
evidence
completion condition
```

Example:

```ts
type Interaction = {
  type: "fraction_partition"

  skill: "fraction.meaning"

  initialState: {
    denominator: 4
    selectedParts: []
  }

  validate: (...)

  evidence: (...)
}
```

---

# 32. CONTENT ENGINEERING

Content should be generated from structured specifications where possible.

Preferred:

```text
Curriculum
 ↓
Skill
 ↓
Lesson
 ↓
Module
 ↓
Interaction
 ↓
Exercise
```

Avoid giant monolithic lesson components.

---

# 33. ONE REFERENCE LESSON

The first major benchmark for the architecture should be:

> **Fractions — 6e**

It should demonstrate:
- manipulation
- visual representation
- synchronized representations
- misconception detection
- evidence collection
- mastery
- adaptive remediation
- gamification
- transfer
- responsive interaction

Do not scale to dozens of lessons before the reference architecture is stable.

---

# 34. FRACTIONS AS REFERENCE IMPLEMENTATION

Fractions are particularly important because they exercise many platform capabilities.

Potential interaction primitives:

```text
PartitionShape
FractionStrip
NumberLine
QuantityModel
ShadeWorkshop
MergeTool
SplitTool
ComparisonTool
EquivalenceBuilder
```

All should ultimately share a coherent fraction mathematical state.

---

# 35. CURRICULUM STRATEGY

The initial curriculum direction is:

```text
6e
 ↓
5e
 ↓
4e
 ↓
3e
 ↓
Lycée
```

However:

> Curriculum sequencing and market sequencing are not necessarily the same thing.

6e is an excellent environment for proving the interaction/pedagogy engine.

Lycée, especially Seconde/Première/Terminale, may contain stronger commercial urgency.

This distinction should remain explicit.

---

# 36. MARKET STRATEGY

Do not assume the optimal commercial entry point without validation.

Important hypotheses to test:

```text
learning improvement
retention
engagement
willingness to pay
parent demand
student demand
content production cost
CAC
conversion
```

Potential product strategy:

```text
6e
 ↓
prove learning engine
 ↓
validate interaction system
 ↓
test commercial demand
 ↓
expand
```

Potential commercial wedge:

```text
Seconde / Première / Terminale
```

should be considered separately.

---

# 37. GAMIFICATION

Gamification should reinforce learning behavior.

Good:

```text
complete difficult skill
→ XP

master prerequisite
→ badge

maintain learning streak
→ reward

recover from misconception
→ progress celebration
```

Bad:

```text
click 20 times
→ XP

watch animation
→ badge
```

The reward system should favor:
- persistence
- mastery
- exploration
- correct reasoning
- improvement
- transfer

not meaningless activity volume.

---

# 38. UX PRINCIPLES

Prioritize:

```text
clarity
speed
feedback
discoverability
consistency
low cognitive load
```

A student should understand:

1. What am I doing?
2. Why am I doing it?
3. What can I manipulate?
4. What happened?
5. What did I discover?
6. What should I do next?

Avoid interfaces where the student has to read instructions to understand how to interact.

---

# 39. RESPONSIVENESS

The platform should work well on:
- desktop
- laptop
- tablet
- mobile
- touch screens
- stylus where applicable

Interactions must support Pointer Events where appropriate.

Do not design interactions exclusively around mouse hover.

---

# 40. PERFORMANCE

Interactive mathematical content must feel immediate.

Target:

```text
interaction latency → minimal
animation → smooth
initial lesson load → fast
```

Avoid:
- unnecessary API requests
- rerendering the entire lesson
- large dependencies without justification
- unnecessary DOM trees
- expensive calculations inside render
- network requests during continuous dragging

During manipulation:

```text
Pointer
 ↓
local state
 ↓
render
```

Persist after meaningful events rather than on every pointer movement.

---

# 41. ACCESSIBILITY

Interactive content must consider:
- keyboard interaction where practical
- focus states
- readable text
- sufficient contrast
- reduced motion
- semantic labels
- touch targets
- screen-reader-compatible UI where possible

Accessibility is especially important for educational products.

---

# 42. DATA ARCHITECTURE

Core entities are expected to include concepts such as:

```text
User
Student
Teacher
Parent

Course
Chapter
Lesson
Module

Skill
SkillPrerequisite
Misconception

DiagnosticSession
DiagnosticResponse

Exercise
ExerciseAttempt

LearningEvidence
SkillMastery
LessonProgress

Recommendation
Achievement
```

Do not introduce duplicate representations of the same domain concept.

---

# 43. API PRINCIPLES

APIs should be:
- explicit
- typed
- versionable
- predictable
- validated

Use DTOs / schemas.

Never trust frontend input.

Validate:
- IDs
- numerical values
- exercise answers
- progress updates
- mastery changes
- permissions

---

# 44. SECURITY

Never trust the client for:
- mastery
- XP
- achievements
- completion
- assessment results
- permissions
- paid access

The server must validate authoritative learning events.

Never expose:
- secrets
- API keys
- private student data
- service credentials

in frontend code.

---

# 45. TESTING STRATEGY

Test three levels.

## Unit

Test:
- mathematical utilities
- validators
- mastery calculations
- skill graph logic
- misconception logic

## Component

Test:
- interaction components
- lesson modules
- feedback
- state transitions

## End-to-end

Test:

```text
student opens lesson
 ↓
interacts
 ↓
answers
 ↓
receives feedback
 ↓
progresses
 ↓
completion recorded
 ↓
next module unlocked
```

Interactive behavior must be tested, not only rendered HTML.

---

# 46. DEVELOPMENT WORKFLOW

Before modifying an existing feature:

```text
1. Understand architecture
2. Locate source of truth
3. Identify contracts
4. Trace state flow
5. Trace API flow
6. Check dependent components
7. Implement minimal change
8. Run tests
9. Run build
10. Verify actual user flow
```

Never blindly patch the first error you encounter.

---

# 47. DEBUGGING RULE

When something breaks:

Do not immediately add:

```text
optional chaining
try/catch
fallback value
```

Instead determine:

```text
Why is the value missing?
Who owns it?
Who should initialize it?
What contract was violated?
```

Fix the root cause.

---

# 48. REFACTORING RULE

Prefer:
```text
small reusable components
clear contracts
single responsibility
shared primitives
pure functions
```

Avoid:
```text
giant components
duplicated logic
hidden state
magic constants
lesson-specific infrastructure
```

---

# 49. DO NOT OVER-ENGINEER

Do not introduce:
- microservices
- Kubernetes
- event buses
- complex ML
- real-time infrastructure
- advanced distributed systems

before the product needs them.

Start with a modular monolith.

Extract services only when there is a concrete reason.

---

# 50. ARCHITECTURAL PRIORITY

When choosing between two technical solutions, prioritize:

```text
1. Pedagogical correctness
2. Mathematical correctness
3. Student experience
4. Reliability
5. Maintainability
6. Performance
7. Scalability
```

Do not sacrifice pedagogical clarity for technical novelty.

---

# 51. CODE QUALITY RULES

Prefer:

```ts
const
readonly
explicit types
pure functions
small components
domain-specific names
```

Avoid:

```ts
any
magic numbers
duplicated validation
deep prop drilling
giant useEffect blocks
implicit global state
```

Use `any` only when there is a documented reason.

---

# 52. NAMING

Use domain language consistently.

Prefer:

```text
skill
mastery
misconception
evidence
interaction
module
lesson
diagnostic
remediation
transfer
```

Avoid inventing multiple names for the same concept.

For example, don't use:

```text
knowledgeScore
competencyLevel
skillScore
masteryPercent
```

for four different representations of the same underlying concept unless they genuinely mean different things.

---

# 53. FILE STRUCTURE

A scalable lesson can follow:

```text
lesson/
├── lesson.config.ts
├── skills.ts
├── modules/
│   ├── Module01.tsx
│   ├── Module02.tsx
│   ├── Module03.tsx
│   └── ...
├── components/
│   ├── FractionStrip.tsx
│   ├── NumberLine.tsx
│   └── ...
└── utils/
```

Shared components belong in the shared interaction/UI packages, not inside individual lessons.

---

# 54. ARCHITECTURE LAYERS

Maintain this separation:

```text
┌────────────────────────────────────┐
│             APP / UX               │
├────────────────────────────────────┤
│          LESSON ENGINE              │
├────────────────────────────────────┤
│        INTERACTION ENGINE           │
├────────────────────────────────────┤
│         LEARNING ENGINE             │
├────────────────────────────────────┤
│          DOMAIN / DATA              │
├────────────────────────────────────┤
│       INFRASTRUCTURE / API         │
└────────────────────────────────────┘
```

A UI component should not directly implement database logic.

A lesson module should not directly implement authentication.

A mathematical interaction should not directly know about PostgreSQL.

---

# 55. CORE ARCHITECTURAL MODEL

The platform should evolve toward:

```text
                         SMARTER ACADEMY
                                │
                ┌───────────────┼────────────────┐
                │               │                │
           CONTENT ENGINE   INTERACTION      LEARNING
                              ENGINE           ENGINE
                │               │                │
             Lessons          SVG             Skills
             Modules          PixiJS          Mastery
             Exercises        Phaser          Diagnosis
             Skills           Motion          Misconceptions
                │               │              Evidence
                └───────────────┼────────────────┘
                                │
                           Student Model
                                │
                                ▼
                        NEXT BEST ACTION
```

---

# 56. GOLDEN RULES

## Rule 1
> **Do not build a feature unless its pedagogical purpose is clear.**

## Rule 2
> **Do not duplicate mathematical state.**

## Rule 3
> **Do not duplicate concept explanations across modules without pedagogical justification.**

## Rule 4
> **Do not let an LLM become the source of truth for curriculum or mastery.**

## Rule 5
> **Do not use gamification as a substitute for learning.**

## Rule 6
> **Do not send continuous interactions through the backend.**

## Rule 7
> **Do not scale content before the lesson engine is stable.**

## Rule 8
> **Do not build sophisticated ML before enough learning data exists.**

## Rule 9
> **Do not patch symptoms when the underlying contract is broken.**

## Rule 10
> **Every student interaction should have the potential to produce meaningful learning evidence.**

---

# 57. DEFINITION OF DONE — LESSON

A lesson is not finished because it renders.

A lesson is finished when:

```text
□ Pedagogical sequence is coherent
□ No unnecessary duplicated explanation exists
□ Concepts appear at the appropriate moment
□ Mathematical state is centralized
□ Interactions are responsive
□ Feedback is meaningful
□ Skills are mapped
□ Evidence is collected
□ Progress works
□ Locked/unlocked states work
□ Final mastery is evaluated
□ Transfer is present where appropriate
□ Mobile/touch behavior works
□ Accessibility is considered
□ No console errors
□ Tests pass
□ Production build succeeds
```

---

# 58. DEFINITION OF DONE — FEATURE

A feature is finished when:

```text
□ User flow works
□ Edge cases handled
□ Loading state handled
□ Error state handled
□ Empty state handled
□ Responsive behavior verified
□ Accessibility considered
□ Backend validation exists where needed
□ Tests exist
□ No regression introduced
□ Documentation updated if architecture changed
```

---

# 59. AGENT BEHAVIOR

When working on this project, Claude should act as:

```text
Senior Software Architect
+
Educational Technology Engineer
+
Mathematics Learning Designer
+
Interactive UX Engineer
+
AI/ML Engineer when relevant
```

Do not behave as a generic code generator.

Before coding, reason about:

```text
pedagogy
domain model
state
architecture
interaction
evidence
performance
testing
```

---

# 60. WHEN ASKED TO CREATE A NEW LESSON

Follow this process:

```text
1. Identify curriculum objective
2. Identify prerequisite skills
3. Identify target skills
4. Identify likely misconceptions
5. Design discovery situation
6. Design manipulation
7. Design observation/prediction
8. Formalize concept
9. Design practice
10. Design diagnostic
11. Design transfer
12. Define evidence
13. Define mastery criteria
14. Only then write React code
```

Do not start by writing JSX.

---

# 61. WHEN ASKED TO IMPROVE AN EXISTING LESSON

First audit:

```text
Pedagogy
Architecture
Duplication
Interaction
Mathematical correctness
State management
Accessibility
Performance
Assessment
Evidence
```

Then propose changes.

Do not rewrite a working module simply because the implementation style is different.

Preserve valuable existing behavior unless there is a concrete reason to replace it.

---

# 62. WHEN ASKED TO BUILD AN INTERACTION

First determine:

```text
What mathematical concept does the interaction expose?
What should the student manipulate?
What should remain invariant?
What should change?
What should the student notice?
What misconception can be detected?
What evidence should be collected?
```

Then implement the interaction.

---

# 63. WHEN ASKED TO BUILD AN AI FEATURE

First determine:

```text
What decision requires intelligence?
What structured data is available?
Can deterministic logic solve it?
What should ML solve?
What should the LLM solve?
What evidence will evaluate quality?
```

Never add an LLM simply because "AI" sounds valuable.

---

# 64. PRODUCT DEVELOPMENT ORDER

Preferred order:

```text
FOUNDATION
 ↓
Domain model
 ↓
Skill graph
 ↓
Learning contracts
 ↓
Lesson engine
 ↓
Interaction SDK
 ↓
Reference lesson
 ↓
Evidence system
 ↓
Mastery
 ↓
Diagnostic
 ↓
Adaptive learning
 ↓
Student dashboard
 ↓
Content scaling
 ↓
AI tutor
 ↓
Advanced ML
```

---

# 65. FIRST TECHNICAL MILESTONE

The first meaningful milestone is NOT:

```text
authentication
dashboard
admin panel
AI chatbot
100 lessons
```

It is:

> **One complete interactive lesson proving the Smarter learning loop end-to-end.**

Recommended reference:

```text
Fractions — 6e
```

with:

```text
Discover
 ↓
Manipulate
 ↓
Understand
 ↓
Formulate
 ↓
Practice
 ↓
Diagnose
 ↓
Transfer
 ↓
Master
```

and measurable evidence throughout.

---

# 66. LONG-TERM VISION

The long-term architecture should allow:

```text
Student
   ↓
Diagnostic
   ↓
Student Model
   ↓
Skill Graph
   ↓
Recommended Mission
   ↓
Interactive Lesson
   ↓
Evidence
   ↓
Mastery
   ↓
Adaptive Recommendation
```

Across:

```text
6e
5e
4e
3e
Seconde
Première
Terminale
```

and eventually other subjects if the learning engine becomes sufficiently general.

---

# 67. FINAL PRINCIPLE

Smarter Academy should not become:

> "Duolingo but for French mathematics."

It should become:

> **A system that makes mathematical concepts manipulable, makes student reasoning observable, converts interactions into learning evidence, and uses that evidence to continuously choose the most useful next learning action.**

When making an architectural decision, ask:

> **Does this make the system better at helping the right student learn the right concept at the right moment?**

If not, reconsider the feature.
