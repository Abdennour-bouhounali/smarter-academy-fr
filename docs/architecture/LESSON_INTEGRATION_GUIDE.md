# Lesson Integration Guide

Practical, code-level reference for how a lesson is wired end-to-end into the
platform — routing, module locking, step locking, learning-point evidence,
final test, prerequisite diagnostic, and storage. Worked example throughout:
`apps/web/src/lessons/college/6e/nombres_calculs/nombres-entiers/`, the first
lesson with every mechanism below fully implemented.

This is an **integration** doc, not a **content-authoring contract**. For the
`LESSON_CONFIG` field contract and module-authoring rules, see
[`LESSON_CONTRACT.md`](./LESSON_CONTRACT.md). For the assessment-question
metadata contract and evidence-authoring checklist, see
[`AI_LESSON_CONTRACT.md`](./AI_LESSON_CONTRACT.md) and
[`LEARNING_POINT_COVERAGE.md`](../reports/LEARNING_POINT_COVERAGE.md)'s
"Per-lesson process." For the server-side progress/mastery data model, see
[`PROGRESS_MODEL.md`](./PROGRESS_MODEL.md). This doc fills the gap those
leave: the actual runtime mechanics of locking and persistence, none of which
were documented anywhere before this lesson existed.

---

## 1. File layout

```
apps/web/src/lessons/college/6e/nombres_calculs/nombres-entiers/
├── index.jsx              # thin wrapper: <LessonIndex config={LESSON_CONFIG} basePath={LESSON_BASE_PATH} />
├── lesson.config.js        # LESSON_CONFIG — source of truth, see §2
├── moduleContext.js        # MODULE_CTX + getNavLinks(), see §3
├── routes.jsx               # route registration, see §4
├── modules/
│   ├── Module00Diagnostic.jsx    # prerequisite_check stage, see §8
│   ├── Module01Mission.jsx       # content module, StepCard-gated, see §6
│   ├── ...
│   └── Module11BossFinal.jsx     # evaluation stage, multi-phase, see §7
└── components/              # lesson-local components (PlaceValueTable, numberUtils, ...)
```

Every lesson follows this exact shape. `index.jsx` and `routes.jsx` are
almost boilerplate — the only per-lesson work is `lesson.config.js`,
`moduleContext.js` (a 20-line copy-paste with the lesson's id swapped in),
and the module components themselves.

---

## 2. `lesson.config.js` — source of truth

```js
export const LESSON_BASE_PATH = '/courses/college/6e/nombres_calculs/nombres-entiers';

export const LESSON_CONFIG = {
  id: 'nombres-entiers',          // matches coursesData.js id — the progression storage key
  sequentialUnlock: true,          // enables module-to-module locking, see §5
  title, description, level, grade, chapter, chapterTitle,
  passingScore, masteryThreshold, emoji, estimatedDurationMin,
  skills: [...],                   // short strings shown on the lesson index hero
  teachingScope: { include: [...], exclude: [...] },
  modules: [
    { id, number, slug, path, title, desc, stage, color, style,
      estimatedMin, difficulty, actionText,
      teachesLearningPointIds: [...] },   // omit on modules that teach nothing gradeable
    ...
  ],
};
```

Field notes not already covered by `LESSON_CONTRACT.md`:

- **`id`** is the single key every persistence mechanism hangs off of —
  `useProgress(lessonId)`'s storage key, the evidence-submission `lessonCode`,
  the final-test-attempt key. Get it right once; nothing else needs it typed
  again except each module's own `MODULE_CTX.lessonId` (which just re-reads
  it from config).
- **`modules[].number`** is the array-order integer used for routing
  (`MODULE_COMPONENTS[m.number]` in `routes.jsx`), for `moduleNumber`
  passed to `ModuleLayout`, and for the string key modules are marked
  completed under (`isModuleCompleted(m.number.toString())`). It does not
  need to start at 1 or be contiguous — a `number: 0` prerequisite module
  slots in cleanly (§8) because every consumer (`routes.jsx`,
  `moduleContext.js`'s `getNavLinks`, `LessonIndex.jsx`) walks the `modules`
  array in order, not by arithmetic on `number`.
- **`style`** picks which card renderer `LessonIndex.jsx` uses:
  `'featured'` (standard content module), `'assessment'` (final test —
  dashed border, 📝/🏆 icon), `'boss'` (unused by this lesson, dark-themed
  card), or `'diagnostic'` (prerequisite check — teal dashed border,
  compass icon, "Mission de départ" badge instead of a module number). Any
  other value silently renders nothing — `LessonIndex.jsx`'s style chain
  ends in `return null`.
- **`stage`** drives one specific behavior beyond display: `stage:
  'evaluation'` makes a module *always* unlocked regardless of
  `sequentialUnlock` (the "I think I already know this" escape hatch — see
  `isModuleUnlocked` in §5). `stage: 'prerequisite_check'` has no special
  handling in `isModuleUnlocked` today (a `number: 0` module is unlocked
  anyway via the `n <= 1` rule) — it exists purely as a semantic marker and
  to keep `teachesLearningPointIds` absent by convention (a diagnostic
  teaches nothing; it only checks).

---

## 3. `moduleContext.js` — the 20-line copy-paste

```js
import { LESSON_CONFIG, LESSON_BASE_PATH } from './lesson.config';

export const MODULE_CTX = {
  lessonId: LESSON_CONFIG.id,
  coursePath: LESSON_BASE_PATH,
  courseTitle: LESSON_CONFIG.title,
  chapter: LESSON_CONFIG.chapter,
  chapterTitle: LESSON_CONFIG.chapterTitle,
  levelLabel: 'Collège',            // hardcoded per-level, not derived from LESSON_CONFIG.level
  gradeLabel: '6ème',                // hardcoded per-grade, not derived from LESSON_CONFIG.grade
  totalModules: LESSON_CONFIG.modules.length,
  // With a module 0, modules.length ≠ last module number — ModuleLayout's
  // "Terminer" button on the final module needs the real last number
  // (it defaults to totalModules, which is only right for 1..N numbering).
  lastModuleNumber: LESSON_CONFIG.modules[LESSON_CONFIG.modules.length - 1].number,
  sequentialUnlock: LESSON_CONFIG.sequentialUnlock,
};

export const getNavLinks = (currentModuleNumber) => {
  const idx = LESSON_CONFIG.modules.findIndex((m) => m.number === currentModuleNumber);
  if (idx === -1) return { prevLink: null, nextLink: null };
  return {
    prevLink: idx > 0 ? LESSON_CONFIG.modules[idx - 1].path : LESSON_BASE_PATH,
    nextLink: idx < LESSON_CONFIG.modules.length - 1 ? LESSON_CONFIG.modules[idx + 1].path : null,
  };
};
```

Every module component calls `getNavLinks(itsOwnNumber)` and spreads
`MODULE_CTX` (or its individual fields) into `<ModuleLayout>`. `levelLabel`/
`gradeLabel` are copy-pasted literals per lesson (`'Collège'`/`'6ème'` for
6e, `'Collège'`/`'3ème'` for 3e) — when integrating a new lesson, update
these two lines, not `LESSON_CONFIG.level`/`.grade` (those feed the
curriculum catalog, not the UI label).

---

## 4. Routing

```js
// routes.jsx
const MODULE_COMPONENTS = {
  0: lazy(() => import('./modules/Module00Diagnostic.jsx')),
  1: lazy(() => import('./modules/Module01Mission.jsx')),
  // ... one entry per module.number
  11: lazy(() => import('./modules/Module11BossFinal.jsx')),
};

export default function nombresEntiersRoutes() {
  return [
    <Route path={LESSON_BASE_PATH} element={withSuspense(LessonHome)} />,
    ...LESSON_CONFIG.modules
      .map((m) => MODULE_COMPONENTS[m.number] && <Route path={m.path} element={withSuspense(MODULE_COMPONENTS[m.number])} />)
      .filter(Boolean),
  ];
}
```

This is registered into the app's top-level `<Routes>` (see `App.jsx` or
wherever lesson route arrays are spread — not covered here, unrelated to
per-lesson wiring). Keyed by `number`, so adding a module is: add the config
entry, add the `MODULE_COMPONENTS[N]` line, write the file. No other routing
change needed.

---

## 5. Module-to-module locking (the lesson roadmap)

Source: `packages/core/lessonAccess.js`. Consumed by `ModuleLayout.jsx` (gates
the page itself) and `LessonIndex.jsx` (gates the roadmap card).

```js
export function isModuleUnlocked(isModuleCompleted, moduleNumber, { stage } = {}) {
  if (stage === 'evaluation') return true;      // final test always reachable
  const n = Number(moduleNumber);
  if (!Number.isFinite(n) || n <= 1) return true; // module 0 AND module 1 always unlocked
  return getModuleMastery(isModuleCompleted, n - 1) >= MASTERY_UNLOCK_THRESHOLD; // 80
}
```

- Binary mastery today: a module is "80%+ mastered" iff
  `isModuleCompleted(String(n-1))` is true — completion is currently
  all-or-nothing (`ModuleLayout` only calls `markModuleCompleted` once
  every internal step is done), so this threshold is trivially satisfied
  by completion, not a real partial score.
- **A module never re-locks.** Once `completedModules` contains it, it
  stays unlocked forever — `isModuleUnlocked` never re-checks a completed
  module's own state, only whether the *next* one's gate is satisfied.
- `getModuleStatus()` layers a `requiresLearningPointIds` mastery gate on
  top (server-fed `masteryStatusById`) and an `in_progress` label when
  `currentModule === moduleNumber` — cosmetic on the roadmap, not a lock.
- **`n <= 1` is why module 0 doesn't hard-gate module 1.** A prerequisite
  diagnostic (§8) is informational only by construction: there is no
  `n <= 0` branch, so completing module 0 is never required to reach module
  1. If a future lesson genuinely needs to gate module 1 on module 0, that
  threshold has to change in this shared file — high blast radius, since
  every lesson using `sequentialUnlock: true` depends on it. Don't special-
  case a single lesson here; if it's ever needed, it needs a plan, not a
  patch.

`ModuleLayout.jsx` calls this on every module page load
(`isModuleUnlocked(isModuleCompleted, moduleNumber, { stage })`) and renders
a full-page "locked" screen (`lockedReason(moduleNumber)`) if it fails.
`LessonIndex.jsx` calls `getModuleStatus()` per roadmap card and renders a
non-clickable dashed placeholder for `status === 'locked'`.

---

## 6. Step-to-step locking *inside* a module

This is a **different, unrelated mechanism** from §5 — entirely internal to
each module component, using the `StepCard` component from `LessonUI.jsx`.
Nothing in `ModuleLayout` or `lessonAccess.js` knows about it.

```jsx
// LessonUI.jsx
export function StepCard({ num, title, subtitle, done, locked, children, tone }) {
  if (locked) return <div>{title} — <span>termine l'étape précédente</span></div>; // dashed placeholder
  return <motion.section>{/* header + children */}</motion.section>;
}
```

`StepCard` is purely presentational — it has zero awareness of storage,
`useProgress`, or "was this module already completed." Every content module
(01–10 in this lesson) hand-derives its own step-done booleans and chains
`locked={!prevStepDone}` by hand:

```jsx
const [s1, setS1] = useState(false);
const [s2, setS2] = useState(false);
// ...
<StepCard num={1} done={s1}>...</StepCard>                          {/* step 1: never locked */}
<StepCard num={2} done={s2} locked={!s1}>...</StepCard>
```

**This state is 100% ephemeral by default** — plain `useState(false)`,
reset to locked on every remount. Leaving and returning to an *incomplete*
module always replays from step 1; that's correct, expected behavior.

**The problem this caused:** a student who already finished the whole
module once still had to re-click through steps 1→N-1 to reach step N again
on a later visit, because the local state resets but the module-completion
flag (§5's `completedModules`) does not. Fixed via
`apps/web/src/lessons/common/utils/stepUnlock.js`:

```js
export function isStepLocked(alreadyCompleted, sequentialLocked) {
  return !alreadyCompleted && sequentialLocked;
}
```

Applied at every call site, in every content module:

```jsx
const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
const alreadyCompleted = isModuleCompleted('1');   // moduleNumber.toString(), matches §5's key

const allDone = alreadyCompleted || (s1 && s2 && s3);   // keeps the bottom nav button live on revisit

<StepCard num={2} done={s2} locked={isStepLocked(alreadyCompleted, !s1)}>
```

**Rule for any new lesson:** every `StepCard`'s `locked` prop must be
`isStepLocked(alreadyCompleted, <the sequential check>)`, never a bare
`!prevStepDone`. And every module's `allDone`/`isCompleted`-driving boolean
must OR in `alreadyCompleted`, or the "Module suivant" button silently
disables itself on every revisit of an already-mastered module (its own
local state hasn't been re-earned this visit).

**What this does *not* touch:** fine-grained content pacing *inside* an
already-unlocked step — e.g. `i === 0 || someDone.includes(i - 1)` gates
that reveal sub-item 2 of a step only after sub-item 1 (seen in Module04,
05, 06, 08, 09, 10). Those are pacing choices within a single step's
content, not step-to-step navigation, and are intentionally left as
ephemeral replay-from-scratch — revisiting a step still walks its internal
items in order. Only `StepCard`-level `locked` props are in scope for the
"already completed → free navigation" rule.

### The disabled next button must explain itself (`incompleteSteps`)

A content module gates its bottom "Module suivant" button on completion
(`nextLink={allDone ? navLinks.nextLink : undefined}`). A disabled button
with no explanation just tells the student "no" — so every content module
must also pass `incompleteSteps`: the list of its not-yet-done steps,
titles matching the `StepCard`s:

```jsx
const incompleteSteps = [
  !s1 && { num: 1, title: 'Range les six quantités…' },
  !s2 && { num: 2, title: "Qu'est-ce qui t'a aidé à décider ?" },
  !s3 && { num: 3, title: 'Un dernier duel avant de partir' },
].filter(Boolean);

<ModuleLayout ... nextLink={allDone ? navLinks.nextLink : undefined}
  isCompleted={allDone} incompleteSteps={incompleteSteps}>
```

With this, `ModuleLayout`'s `IncompleteStepsHint` turns the disabled button
into a clickable popover — "À terminer avant de continuer" — listing each
remaining step ("Étape N — title"); clicking an entry scrolls straight to
that `StepCard` (matched by its `id="step-{num}"` anchor). Without the
prop, the button falls back to a plain disabled state (never breaks), but
that fallback is not acceptable for an integrated lesson: always pass it.

### Formative question policy (content modules)

Questions inside content modules are **part of the learning process, not an
evaluation** — this applies to every module except the first (an intentional
no-rules-given discovery trigger) and the last (the graded Boss Final, §7).
The mandatory interaction pattern, uniform across every nombres-entiers
content module (module 2 through the second-to-last):

1. The student answers — a tap (§ below) or a Valider click for the
   interaction types that need one.
2. The answer is **revealed immediately** — `ChoiceGrid`'s
   `revealed`/`correctIndex` highlights the correct option in green, and the
   `Feedback` (tone `ok`/`ko`) states **both** the student's own answer and
   the correct one explicitly ("Ta réponse : … Bonne réponse : …"), plus a
   reminder of the rule/concept needed (an explicit hint string, not just
   the bare correct value) — never a generic "À revoir" with no reasoning.
3. The step/sub-item **counts as done regardless of correctness** —
   `onSolved` fires on answer, never conditionally on `pick === correct`.
   The next step or sub-item opens either way.

**Never** gate progression on getting the answer right: no
"Réessayer" loops, no `if (pick === correct) onSolved()` — a student who
answers wrong learns from the revealed correction and moves on. For
multi-row batch checks (several picks validated together), the reveal
must highlight the correct option in **every** row (green), not just color
the student's wrong picks red — the correction has to be visible, not
inferred. Pure **manipulations** (pouring, filling to a target, building
groups) are not questions and keep their reach-the-goal mechanics.

**Audit shared components too, not just the module's own JSX.** The
easiest way to miss a violation is a shared component the module merely
*calls* — `OrderingGame` (`common/components/OrderingGame.jsx`) only calls
`onSolved` when the ordering is exactly right, by design, because it's also
used by graded Boss Final modules elsewhere where that gating is correct.
A content module that embeds it for formative practice must opt in to the
non-blocking behavior explicitly via its `formative` prop:

```jsx
<OrderingGame items={ITEMS} direction="asc" solved={done} onSolved={...} formative />
```

With `formative`, a wrong order still shows the exact break point (existing
behavior) **and** now reveals the fully correct order and calls `onSolved`
after that first check — no infinite retry. Without the prop (the default),
nothing changes for existing evaluation-context callers. When integrating a
new lesson, grep every content module for shared exercise components and
check each one's own gating default before assuming a bare `onSolved={...}`
wiring is automatically compliant.

**Deduction puzzles are an exception with a cap, not a free pass.** A
"guess the mystery number from N clues" style puzzle (Module10's
`NombreMystere`) is different from a single MCQ: getting it exactly right
*is* the point, and revealing the answer on the first wrong guess would
gut the exercise. These may gate `onSolved` on success — but **only** up to
a fixed attempt cap (`MYSTERE_MAX_ATTEMPTS = 3` in the reference
implementation); once the student hits the cap, force-reveal the answer and
call `onSolved` unconditionally, with copy that acknowledges the reveal
("Pas grave, on te le donne : …") rather than presenting it as a win. A
puzzle with no cap at all is a violation, not a legitimate exception —
"the puzzle is the point" justifies bounded extra attempts, never
indefinite blocking.

### One tap = one answer (no Valider click in content modules)

Since a formative answer costs nothing, an intermediate "Valider" click is
pure friction — the target audience expects Duolingo-style instant
response. The click rules, by interaction type:

- **Single-choice question** (`ChoiceGrid`, cards, symbol buttons):
  **tapping the option IS the answer** — the same handler selects, reveals
  and fires `onSolved`:
  `onSelect={(i) => { setPick(i); setRevealed(true); onSolved?.(); }}`.
  No `ValidateButton`. (`ChoiceGrid` disables its options once `revealed`,
  so a second tap can't re-answer.)
- **Fixed-size multi-part check** (N rows answered together — match the
  unit, =/≠ per line): reveals automatically **when the last part is
  picked** — the row handler builds `next = {...picks, [id]: v}` and, if
  every part is now answered, sets checked + `onSolved`. Guard the handler
  with `if (solved || checked) return`. Earlier rows stay editable until
  the last one commits.
- **Free input** (`NumberField`): keep ONE validate button, and always
  wire `onEnter` to the same handler so the keyboard needs zero clicks.
- **Set-selection of unknown size** (pick all the tiles/zeros) and
  **ordering games**: keep one commit button — the component can't know
  when the selection is finished.
- **Manipulations**: auto-complete on goal reach (a `useEffect` firing
  `onSolved` when the target is hit) — no "C'est exact, continuer" click.
- **Boss final and module 0 diagnostic are exempt**: they stay silent with
  a single global submit (§7/§8) — that one click covers the whole test
  and must not be removed per-question.

### Micro-celebration / engagement layer (sound, streak, XP burst)

A small shared toolkit, all in `common/hooks/` and `common/components/
LessonUI.jsx`, gives every content module the same lightweight feedback
loop without per-module reinvention:

```jsx
const { effectsEnabled, toggleEffects, streak, react } = useModuleEffects();
```

- **`useModuleEffects()`** — one call per module. Returns `react(isCorrect)`
  — call it at the exact point a question reveals its answer (same call
  site as `onSolved`, see policy above), alongside `onSolved`, never
  instead of it. `react` plays a short WebAudio chime + haptic pulse (via
  `playEffect`, no-op when `effectsEnabled` is false), grows/resets a
  **session-only** streak counter, and returns a fresh numeric id on every
  call for that question's own `<XPBurst tick={id} />` — never share one id
  across two questions, their bursts would fire together.
- **`<EffectsToggle enabled={effectsEnabled} onToggle={toggleEffects} />`**
  — sound/haptics on-off switch, rendered once near the top of the module
  (alongside `<StreakChip count={streak} />`). Backed by
  `useEffectsPreference()`, which stores the choice in the **unscoped**
  `storage` (not `scopedStorage`) under `smarter_effects_enabled` — this is
  a device preference like OS volume, not learning data: it must survive
  login/logout on the same browser and never sync to the server or another
  device. Defaults to **off** — never surprise a first-time visitor with
  sound.
- **`<XPBurst amount={10} tick={burstId} />`** — floating "+N XP" next to a
  just-answered question, rendered inside a `<div className="relative">`
  wrapping the `ChoiceGrid`. Only fires on a correct answer (the module
  decides whether to pass a fresh tick, i.e. `if (isCorrect) setBurst(id)`).
- **`<StepProgressBar doneCount={n} total={N} />`** — sticky ●●○-style bar
  near the top, driven by the same step-done booleans already used for
  `incompleteSteps`; only render it while `!allDone`.
- **No auto-scroll, no auto-advance** (removed after review of the
  reference lesson). Completing a step must NOT scroll the page, and
  completing a module must NOT start a countdown to the next module — the
  student scrolls and taps "Module suivant" themselves. Do not add
  `scrollToStep` effects on step boundaries or render `<AutoAdvance />` in
  content modules. (`scrollToStep` stays in use for one thing only: the
  user-initiated jump from `ModuleLayout`'s "what's left" popover, §6.)

None of this is optional polish to skip when integrating a new lesson —
apply the full toolkit to every content module for consistency with the
reference implementation. `playEffect`'s `AudioContext` is a module-level
singleton recreated whenever missing *or* `state === 'closed'` (a dev
hot-reload or a long-backgrounded tab can silently close it) — don't
"simplify" that guard back to `if (!sharedCtx)` only, it was a real bug.

---

## 7. The final module — multi-phase "Boss Final" pattern (mandatory shape)

The final module is the **opposite** of a content module: it's summative.
Its non-negotiable rules (first fully implemented in nombres-entiers'
`Module11BossFinal.jsx`, then in contenances'
`Module07LienVolumeMission.jsx`):

- **QCM only.** Every graded question is a `ChoiceGrid` multiple-choice —
  no free-text/numeric input in the final test. A numeric task becomes a
  choice among plausible values (one correct, distractors built from the
  classic mistakes).
- **Silent until submit.** During the boss phase, `ChoiceGrid` is rendered
  **without** `revealed`/`correctIndex` — picking an option produces no
  feedback of any kind. The student answers all N épreuves, then submits
  once ("Valider mes N réponses", disabled until every question has an
  answer). Only then does the review screen show the score, each question,
  the student's answer, the correct answer, and the explanation.
- **Every question tied to learning points.** Each épreuve carries
  `assessment: {enabled: true, type: 'assessment', learningPointIds: [...]}`
  and is submitted through `useEvidenceSubmission` at submit time — this is
  what feeds the student-performance/mastery tracking. A final-test question
  without `learningPointIds` is a bug. Together the épreuves must cover
  every learning point the lesson teaches.
- **Per-skill profile.** Each épreuve also carries a `skill` key mapping to
  the module that teaches it, so the review can compute a per-skill miss
  count and the profile phase can link "revoir le module N".

It does not use `StepCard` at all: `stage: 'evaluation'`,
`style: 'assessment'`, 3 sequential **phases** selected by tab buttons,
the later two unlocked only once the boss is submitted:

```jsx
const PHASES = [
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
];
const phaseUnlocked = (key) => key === 'boss' || bossDone;  // profil+synthese unlock together, once boss is submitted
```

Structure:
1. **Boss** — N graded MCQ "épreuves," each tagged with `assessment:
   {enabled: true, type: 'assessment', learningPointIds: [...]}` and a
   `skill` key used to compute a per-skill miss count on submission.
2. **Profil de maîtrise** — per-skill pass/fail derived from the miss
   counts, with a "revoir le module N" link back into the lesson for any
   skill scoring below perfect.
3. **Synthèse** — a static visual recap of the lesson's core concept; ends
   in a completion/mastery banner (no further gating).

Persistence: `useFinalTestAttempt(lessonId)` (§9) saves `{score,
totalQuestions, answers[]}` on submit; a saved attempt short-circuits
straight to the review screen on next visit (never re-shows the blank
quiz), with a "Refaire le test" button that clears it via `redo()`.

A previous version of this module had a 4th phase, "Flash retour" (5 extra
spaced-repetition questions gating the final completion banner behind
`flashDone`). It was removed — the completion banner now shows directly at
the end of Synthèse. If you're integrating a lesson from an older template
that still has this phase, drop it: it added a second gate after the real
assessment for no pedagogical reason once Profil + Synthèse already close
the loop.

---

## 8. The first module — "prerequisite check" pattern

`Module00Diagnostic.jsx`, `number: 0`, `stage: 'prerequisite_check'`,
`style: 'diagnostic'`. Purpose: a short, ungraded, non-gating check of the
lesson's stated prerequisites (from `LESSON_CONFIG` or the catalog's
`prerequisites` field) — never the material the lesson itself teaches.

Hard rules, enforced by construction, not by a runtime check:

- **Never blocks.** No question in it carries `assessment: {enabled: true,
  ...}` — omit the field entirely, matching `LESSON_STAGES`'
  `prerequisite_check` docblock: *"client-side only, never persisted as
  evidence."* `useEvidenceSubmission` no-ops on questions without that
  metadata, so this is automatic as long as you don't add it.
- **`nextLink` is passed to `ModuleLayout` unconditionally**, not gated on
  `submitted`/`allAnswered` the way content modules gate on `allDone`. The
  bottom "Module suivant" button works from the moment the page loads,
  before a single question is answered.
- **Answer format is closed-choice only** — MCQ (`ChoiceGrid`) or a single
  click-to-select interaction (this lesson's `PlaceValueTable
  onDigitClick`). No free-text input; scoring must be exact-match on a
  known option index or key, not a parsed/normalized string comparison.
- **Score buckets, not pass/fail.** Three tiers by total score (`< 5`, `5–7`,
  `> 7` out of a normalized max), each with its own tone/copy/CTA label —
  never a binary "you failed, try again."

Persistence: a dedicated hook,
`apps/web/src/lessons/common/hooks/usePrerequisiteDiagnostic.js`, modeled on
`useFinalTestAttempt`'s shape but **local-only** (no server sync) —
`scopedStorage` key `smarter_prereq_diagnostic_{lessonId}`, no backend
route. This is a deliberate choice, not a placeholder: the diagnostic's
contract says it's never persisted as evidence, so there is no
cross-device mastery signal that would justify a server round-trip. If a
future requirement changes that, add a real
`usePrerequisiteDiagnostic`-mirroring backend table — don't repurpose
`useFinalTestAttempt`'s endpoint, which is hardcoded to "final test"
semantics end-to-end (see §9).

On mount, a saved result rehydrates both the score *and* the original
`answers` map (not just the score) so a page reload shows the identical
correction screen, not just a stale number — see the `hydratedFromSaved`
ref-guard `useEffect` pattern, reused verbatim from `useFinalTestAttempt`.

`LessonIndex.jsx` renders `style: 'diagnostic'` modules with a distinct
teal, dashed-border card and a "Mission de départ" badge instead of a
zero-padded module number, so it never reads as "Module 1."

**Side effect to handle:** adding a module 0 makes `modules.length` differ
from the last module's `number` — which silently breaks `ModuleLayout`'s
"Terminer" button on the final module (its last-module check defaults to
`moduleNumber === totalModules`). Always set `lastModuleNumber` in
`MODULE_CTX` (see §3) when a lesson has a module 0.

---

## 9. Persistence layer — what's local, what's synced

| Mechanism | Hook | Storage key | Scope | Server sync |
|---|---|---|---|---|
| Module completion, XP, `currentModule` | `useProgress(lessonId)` | `smarter_lesson_{lessonId}` | per-lesson | via `progressQueue.js`, offline-queued |
| Learning-point evidence | `useEvidenceSubmission(lessonCode)` | none locally — fire-and-forget | per-question | via `evidenceQueue.js`, offline-queued; **auth required**, no-ops for anonymous visitors |
| Final-test attempt | `useFinalTestAttempt(lessonId)` | `smarter_final_test_{lessonId}` | per-lesson | `lesson_final_test_attempts` table, one row per (user, lesson), best-effort (no offline queue) |
| Prerequisite diagnostic | `usePrerequisiteDiagnostic(lessonId)` | `smarter_prereq_diagnostic_{lessonId}` | per-lesson | **none** — local only, by design (§8) |
| Sound/haptics preference | `useEffectsPreference()` | `smarter_effects_enabled` | **device**, not per-lesson or per-student | **none** — deliberately unscoped `storage`, not `scopedStorage` (§6) |

The first four go through **`scopedStorage`**
(`apps/web/src/utils/storage.js`), which prefixes every key with
`u_{userId|anon}_` (`authUserId.js` mirrors `AuthContext`'s current user id
synchronously, outside React, so storage scoping is correct even before
`AuthContext`'s effects settle). This means:

- **Anonymous visitors get full local persistence** for everything except
  learning-point evidence (which requires a token by design — mastery
  tracking is account-level). Module completion, XP, final-test review, and
  the diagnostic all work and survive reloads with no account.
- **Switching accounts on the same browser never leaks progress** —
  `u_42_smarter_lesson_x` and `u_anon_smarter_lesson_x` are different keys.
- **First login folds anonymous progress into the account** —
  `AuthContext.jsx`'s `applyUser()` calls `migrateLegacyStorageToUser()`
  once per browser, moving `anon_`-scoped keys onto the newly-known user id.
- Every one of these hooks follows the same **hydration-guard idiom**:
  `useState(readLocal)` for the synchronous initial value (no flash of
  empty state), a `useRef` flag (`hydratedFromSaved`) plus a `useEffect`
  that fires exactly once when server data arrives (for the synced ones)
  or on mount (for local-only ones), and a `redo()`/reset path that sets
  the guard ref so a deliberate "start over" doesn't immediately
  re-hydrate from the now-stale saved value. Copy this idiom for any new
  per-lesson persisted state — don't invent a new pattern.

---

## 10. Checklist — integrating a new lesson

Assuming module content already exists and follows
[`LESSON_CONTRACT.md`](./LESSON_CONTRACT.md) / evidence tagging follows
[`AI_LESSON_CONTRACT.md`](./AI_LESSON_CONTRACT.md):

1. `lesson.config.js` — `id` matches `coursesData.js`; `sequentialUnlock:
   true` if the lesson should gate module-to-module; every module has
   `number`, `slug`, `path`, `style` (one of `featured`/`assessment`/
   `boss`/`diagnostic`), `stage`.
2. `moduleContext.js` — copy verbatim, swap `levelLabel`/`gradeLabel`.
3. `routes.jsx` — copy verbatim, fill `MODULE_COMPONENTS`.
4. If adding a **module 0 diagnostic**: `number: 0`, `stage:
   'prerequisite_check'`, `style: 'diagnostic'`; no question gets
   `assessment.enabled`; `nextLink` unconditional; use
   `usePrerequisiteDiagnostic`, not `useFinalTestAttempt`; set
   `lastModuleNumber` in `MODULE_CTX` (§3/§8) or the final module's
   "Terminer" button breaks.
5. The **final module** must follow the Boss Final shape (§7): QCM only,
   silent until one-click submit, then Boss review → Mon profil → Synthèse;
   every épreuve tagged with `assessment` + `learningPointIds` (covering
   all the lesson's learning points) and submitted via
   `useEvidenceSubmission`; a `skill` key per épreuve for the profile's
   "revoir le module N" links; persistence via `useFinalTestAttempt`; no
   phase after the mastery/synthesis screen that re-gates completion.
6. Every content module using `StepCard`: read `alreadyCompleted =
   isModuleCompleted(moduleNumber.toString())`; wrap every `locked=` with
   `isStepLocked(alreadyCompleted, ...)`; OR `alreadyCompleted` into the
   module's `allDone`. Every question in a content module follows the
   **formative policy** (§6): the correct answer is revealed on answer and
   `onSolved` fires unconditionally — no retry-until-correct gates, no
   "Réessayer" loops — and **one tap = one answer** (§6): no Valider
   button on single-choice questions, auto-reveal on the last part of a
   batch check, `onEnter` on every free input. Grep every content module
   for shared exercise components (`OrderingGame` and similar) and check
   each one's own gating default — a bare `onSolved={...}` wiring is not
   automatically compliant if the component itself only calls it on
   success; pass its formative-mode opt-in (`formative` on `OrderingGame`
   and on `InfoSorter`, which also takes `onCheck={kit.react}`) instead of
   re-deriving the fix per lesson. And every
   content module passes `incompleteSteps` (§6) so the disabled "Module
   suivant" button lists what's left to do, plus the full micro-celebration
   toolkit (§6: `useModuleEffects`, `EffectsToggle`, `StreakChip`,
   `XPBurst`, `StepProgressBar` — and no auto-scroll / `AutoAdvance`).
   New modules should be written on the lesson kit (§11), which applies
   all of the above by construction.
7. Run `npm run validate:lessons` (evidence coverage —
   `LEARNING_POINT_COVERAGE.md`'s checklist) and manually verify: fresh
   module keeps sequential step-locks; a module marked complete
   (seed `completedModules` in `localStorage['u_anon_smarter_lesson_
   {id}']` to test without replaying) shows every step unlocked
   immediately, survives reload, and doesn't affect other modules.

## 11. The lesson kit — `common/kit/` (build modules from data)

Everything §6–§8 require is now applied **by construction** by five shared
components in `apps/web/src/lessons/common/kit/` (barrel: `index.js`). A
module written on the kit cannot violate the formative policy, the silent
boss, the step-locking rules or the mobile tap-target minimums — it only
supplies *content*. Reference implementations: `nombres-entiers`
(`Module00DiagnosticV2.jsx` … `Module11BossFinalV2.jsx`) and `contenances`
(`Module00DiagnosticV2.jsx` … `Module06LienVolumeMissionV2.jsx`).

```js
import { ContentModule, useKit, TapQuestion, BatchChoiceQuestion, NumericQuestion,
         BossFinal, PrerequisiteDiagnostic } from '../../../../../common/kit';
```

### `ContentModule` — shell of every content module (§6)

```jsx
<ContentModule
  ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
  moduleTitle="…" moduleSubtitle="…" estimatedTime="9 min"
  brief={{ tag: '📋 Mission 03', title: '…', tone: 'slate', body: <p>…</p> }}
  intro={<CardsGrid />}                                 // optional, between brief and steps
  steps={[
    { num: 1, title: '…', subtitle: '…', done: s1, content: <TapQuestion … /> },
    { num: 2, title: '…', done: s2, content: (kit) => <MyManipulation react={kit.react} … /> },
  ]}
  footer={<ClosingNote />}                             // optional, rendered when allDone
/>
```

What it does for you, so the module never re-implements it: `useProgress`
(`alreadyCompleted`, XP badge), `useModuleEffects` (sound/haptics/streak:
`StreakChip` + `EffectsToggle` rendered once), `StepProgressBar` while not
done, `MissionBrief`, one `StepCard` per step with
`locked={isStepLocked(alreadyCompleted, !previousStep.done)}` (sequential on
first pass, all open on revisit — §6), `incompleteSteps` derived from the
`done` flags (the "what's left" popover), `isCompleted={allDone}` → the
layout records the module as completed. **No auto-scroll, no auto-advance.**

The module keeps only: its own `done` booleans (one per step, derived from
its state) and the step contents. `steps[].content`, `intro` and `footer`
accept a ReactNode **or** `(kit) => ReactNode` with
`kit = { react, alreadyCompleted, effectsEnabled }` — use the function form
when a bespoke manipulation needs `react(true)` at its success moment. Kit
question components don't need it: they read the same object via
`useKit()`.

### Question components (formative, content modules only)

All three: **one tap / one OK = the answer**, reveal immediately, call
`onAnswered(isCorrect, …)` **unconditionally**, and on a wrong answer show
*the student's answer + "Bonne réponse : …" + the rule (`explain`)*. Sound,
streak and `XPBurst` are wired internally. `solved` (revisit) freezes them.

| Component | Use for | Key props |
|---|---|---|
| `TapQuestion` | single-choice MCQ, rich cards | `prompt`, `above` (node or `(revealed) => node`), `options`, `correct`, `cols`, `renderOption(opt)`, `correctionLabel` (when `options[correct]` isn't printable), `explain`, `explainWrong`, `xp`, `solved`, `onAnswered(ok, index)` |
| `BatchChoiceQuestion` | N rows each with small option buttons, one correction at the last pick (unit matching, vrai/faux lists, ladders) | `intro`, `rows: [{ id, label, options, correct, correction }]`, `feedback({ allRight, nCorrect, total }) => node`, `solved`, `onAnswered(allRight)` |
| `NumericQuestion` | typed number + OK / Enter | `prompt`, `above`, `prefix`, `suffix`, `expected` (number or `(n) => bool`), `parse` (default `parseFr`; pass `parseDec` for decimals), `display` (printed correct answer), `explain`, `explainFor(n)` (targeted feedback for known traps), `solved`, `onAnswered(ok, n)` |

### Bespoke manipulations (the lesson's own components)

Block workshops, liquid containers, number lines, ordering games… stay
hand-written, but follow the same contract so the shell can drive them:
props `solved` / `onSolved` (+ `react` from the slot function), call
`onSolved()` **unconditionally** at the first validation, call
`react(isCorrect)` at the same spot, cap deduction puzzles at a few attempts
then reveal, and — because `solved` flips true on the very next render —
**never gate the wrong-answer feedback on `!solved`** (`checked && !isRight`
is enough; `checked` is internal state and is `false` on a revisit remount).

Reusable labs already built on this contract live in `common/components/`:
`MeasureFillMission` (contenances M4 — graduated tank, capacity-scaled
beakers, pour/drain gestures, `mode="repeat"` for "10 small = 1 big" and
`mode="free"` for exact-target challenges with `solution` hints; the number
only changes once the liquid has settled), `OrderingGame`, `InfoSorter`,
`GroupBuilder`, `NumberLine`. Prefer extending one of these over a new
counter-with-buttons.

### `PrerequisiteDiagnostic` — Module 0 (§8), data only

```jsx
<PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min"
  brief={{ body: <p>…</p> }}                       // tag/title/tone have §8 defaults
  skills={{ key: { label, emoji } }}                // ≥2 skills → per-skill dots + result bars
  questions={[{ id, skill, points, prompt, options, correct, cols, explain },
              { id, skill, points, type: 'custom', prompt, render({ pick, onPick }), isCorrect(pick),
                review({ pick }), explainOk, explainKo }]} />
```
Silent until the single submit, score out of the summed `points`, tiers
< 5 / 5–7 / > 7, correction screen, always-enabled next link, local-only
persistence via `usePrerequisiteDiagnostic`, `awardXP` once (`L00`).

### `BossFinal` — last module (§7), data only

```jsx
<BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(N)} moduleNumber={N} lessonConfig={LESSON_CONFIG}
  moduleTitle="🏆 …" moduleSubtitle="…" estimatedTime="15 min" timerSeconds={8 * 60} timerLabel="8 min"
  brief={{ tag, title, tone: 'amber', body }}
  registre={[{ id, emoji, label, value }]}          // optional context cards
  skills={{ key: { label, module } }}               // profile rows → "Revoir le module N"
  epreuves={[{ id, skill, title?, prompt, extra?, options, correct, cols?, renderOption?, optionLabel?, explain,
               assessment: { enabled: true, type: 'assessment', learningPointIds: […] } }]}
  badges={[{ id, emoji, label, test: (misses) => bool }]}
  synthese={<Synthese />}                           // the lesson's own visual synthesis
  completion={{ masterTitle, title, message, verbs: [4 strings], masterBadgeLabel }} />
```
QCM only, silent, one global submit, Boss → Mon profil → Synthèse tabs,
evidence per épreuve, `useFinalTestAttempt` persistence + redo, XP
`xpPerCorrect` per correct épreuve keyed `String(moduleNumber)`, optional
timer. Side effects are ref-guarded (never inside a state updater).

### Porting a lesson to the kit (the backup-first procedure)

1. Read every original module; list bespoke manipulations vs. plain
   questions. Keep the lesson's `components/` untouched.
2. Write `Module<NN><Descriptor>V2.jsx` **next to** each original — never
   edit or delete the original until the V2 is validated.
3. Point `routes.jsx`'s `MODULE_COMPONENTS` at the V2 files (one line per
   module, a comment saying the originals are the backup). Reverting is
   dropping the `V2` suffix.
4. `npx esbuild <file> --loader:.jsx=jsx --outfile=/dev/null` on each new
   file, then `vite build`.
5. Drive it end to end with the Playwright suites in `apps/web/e2e/lesson-kit/`
   (copy a `t*.mjs` as the template): fresh flows answering **wrong on
   purpose** (must still progress and show the correction), step locking
   fresh vs. revisit, boss submit/review/profil/synthèse + reload + redo,
   then the mobile pass (375×667, `hasTouch`, `.tap()`, no horizontal
   scroll, tap targets ≥ 40 px).
6. Stop for validation. Once the user confirms:
   - move every pre-kit `Module<NN>*.jsx` (the ones *without* the `V2`
     suffix) into a new `modules/_archive_original/` folder — never delete
     them outright, and never route to that folder;
   - drop the `V2` suffix from every remaining `Module<NN>*V2.jsx` file
     (rename the file **and** its `export default function`), so the kit
     version becomes the one and only canonical `Module<NN>*.jsx`;
   - update `routes.jsx`'s `MODULE_COMPONENTS` to the de-suffixed filenames,
     with a comment noting the originals are archived (not routed) and the
     validation date;
   - re-run the full Playwright suite against the renamed files before
     considering the port done — a rename can't be assumed safe, it must
     be verified (imports, lazy() paths, esbuild, `vite build`, the suite).
   nombres-entiers and contenances were done this way on 2026-08-22 —
   `modules/_archive_original/` in each is the reference example.

---

## 12. Geometry lessons — the conventions this repo actually uses

Written while building the 3e « Espace et géométrie » chapter (2026-09-04),
because §1–§11 answer none of the three questions a geometry lesson raises
first. Everything below is normative for new geometry work.

### 12.1 Where geometric mathematics lives

| Layer | File | Rule |
|---|---|---|
| 2-D algebra shared by every lesson | `apps/web/src/lessons/common/utils/geometry2d.js` | The **only** source of vectors, lines, parallelism/perpendicularity, polygon predicates, reflection, `angleAtDeg`, `circleCircleIntersections`. Extend it (with tests) — never re-derive a dot product inside a lesson. |
| 3-D models and projections | `apps/web/src/lessons/common/utils/geometry3d.js` | The **only** source of solids, rotation, cavalière/orthogonal projection, edge visibility, F/A/S counts, relative positions. |
| A lesson's own mathematics | `<lesson>/components/<topic>Utils.js` + `.test.js` | Ratios of Thalès, the square-area balance, triangle classification… Pure functions, vitest-tested **before** any UI is written. |

`packages/core/geometry.js` holds `computeHypotenuse` / `computePythagoreanLeg`
and `packages/core/errorClassifiers.js` holds `isMissingSquareRoot`; reuse
them rather than recomputing.

**Angle conventions stay local.** `geometry2d.js` deliberately carries no
polar convention (`angleUtils`, `durationUtils` and `fractionUtils` use three
different ones). `angleAtDeg(a, b, c)` is safe because a geometric angle is
unoriented — it returns the same number in either y-orientation. Anything
oriented (an arc to draw, a rotation to animate) declares its convention in
its own file header.

### 12.2 Representing the space (3-D)

- **A solid is a model, never a drawing.** `{ vertices, edges, faces, names }`
  with each face's vertices listed **anti-clockwise seen from outside**. That
  ordering is what makes `faceNormal` point outward, so it is an invariant the
  tests check on every solid — a face listed backwards silently turns the
  object inside out.
- **Visibility is computed.** `visibleEdges(solid, eye)` returns
  `{ visible, hidden }`; an edge is hidden exactly when every face carrying it
  faces away. A component must never receive "this edge is dashed" as a prop:
  the student's whole discovery is that turning the solid changes which edges
  are hidden.
- **Counts come from `countsOf(solid)`**, never from the drawing, and
  `eulerCheck` verifies them (F + S − A = 2 for the polyhedra).
- **Cavalière parameters are named once**: `CAVALIERE = { angle: 45, k: 0.5 }`.
  A lesson that lets the student vary them passes them explicitly.
- **World frame is y-up; the projections are the only place y flips** to
  screen orientation. Lessons therefore always speak in student coordinates.
- **SVG only.** No Three.js, no WebGL, no new dependency (playbook §17): the
  solids of the collège programme are convex with ≤ 12 edges, so back-face
  culling in pure JS is exact and cheap. Curved solids (cylindre, cône, boule)
  that are shown but never rotated stay hand-drawn silhouettes.

### 12.3 Dragging a point or a figure (2-D)

Playbook §10.2 sanctions one drag recipe, written for `NumberLine`'s 1-D
value. Its 2-D form is `CoordPlane.jsx` / `CoordGrid.jsx`, and it is the
pattern to copy:

1. **One transparent full-frame `<rect>`** carries the interaction; pointer
   coordinates become mathematics through `svgToCoord`/`svgToGrid`. The
   interactive-node count is then independent of grid size (playbook §10.5).
2. **All decor gets `pointerEvents: 'none'`** — it is painted after the hit
   area and would otherwise intercept it.
3. **`role="group"`** whenever a hit area exists; `role="img"` only on a
   purely visual figure.
4. **A keyboard twin is mandatory**: arrows/Home/End/PageUp/PageDown on a
   `role="slider"` with a French `aria-valuetext` that states the reading.
5. **Steppers and chips come first, drag second.** Drag is the twin of a
   tap-first control, never the only way in.

For multi-vertex figures, `ShapeLab.jsx` (6e figures-planes) is the reference:
copy-and-adapt it (playbook §14 ADAPT) rather than importing it, and keep its
three reachability affordances — `axisLock`, `linkedPairs`, `snapEqualSides` /
`snapRightAngle`. **Tight tolerances need snapping, not dexterity**: with a 1°
angular tolerance, building a rectangle by free-dragging four vertices is a
test of mouse control, not of geometry.

**Tolerance follows the display, not the other way round.** A lesson exports
one `TOL` object from its utils (`{ lengthRatio: 0.04, absMax: 1.5,
angleDeg: 1 }` is the shipped default). `absMax: 1.5 px` exists because side
lengths render as rounded integers: a purely relative 4 % tolerance once
declared 143 and 141 "equal" while the labels disagreed on screen. Two sides
called equal must show the same number.

**The drawing may never contradict the mathematics.** Right-angle marks,
equal-side ticks, parallel chevrons, arrowheads, endpoint dots, hidden-edge
dashes, and figure names are all **derived** (`isRightAngleAt`, `areParallel`,
`classify`, `endpointsOf`, `visibleEdges`), never passed as props. This single
rule is what stops a component from labelling a non-square « carré ».

### 12.4 Carrying a figure across modules

Modules never share runtime state (§5: deep links and the mastery bypass must
always work). A figure reused by several modules is a **literal constant** in
the lesson's utils:

```js
// components/thalesUtils.js
export const FIGURES = {
  standard: { A: { x: 40, y: 30 }, B: { x: 20, y: 200 }, C: { x: 250, y: 200 } },
};
```

Each module imports what it needs and owns its own `useState`. Continuity is
narrative (the same scene, the same names), never a store.

### 12.5 Catalogue keys for a geometry lesson

`smaMetadata` is keyed `` `${gradeId}_${officialObjectId}` `` — the id from
`smarter_academy_programmes_maths_2026.json`, not the lesson's own slug. A key
that matches no official object silently produces an **empty** lesson. The 3e
geometry keys are `3e_reperage`, `3e_representations_espace`, `3e_triangles`,
`3e_translations_vecteurs`, `3e_thales`, `3e_pythagore`, `3e_trigonometrie`.

Overriding a stub's auto-generated id (`meta.id`) **retires the old code**:
the importer marks the previous lesson code retired and its learning points
become orphans. That is safe only while no evidence references them — check
before flipping, and run `smarter:prune-retired-learning-points` afterwards.

### 12.6 Rebuilding a pre-kit geometry lesson

§11's backup-first procedure applies, with one correction: **do not create
`modules/_archive_original/`**. The validator recurses into it and reports
every question id twice — those duplicates are a large part of the repo's
standing error baseline. Git history is the archive. Delete the pre-kit
modules once the kit versions pass their e2e suite.

Two defects found in both 3e geometry lessons, worth grepping for in any
other pre-kit lesson:

- `markModuleCompleted('L01')` writes an id **nothing reads**. `ModuleLayout`
  records `String(moduleNumber)`, and `lessonAccess.js` reads that. The `L0N`
  keys accumulate as dead entries and sequential unlock never sees them.
- An effect with an unstable callback dependency
  (`useEffect(() => onChange(k), [k, onChange])` where `onChange` is an inline
  arrow) fires on **every** render, not when the value changes.
