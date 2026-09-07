# Lesson & Module Contract

The contract every rebuilt lesson must honor. It descends from the pre-reset
convention (17 lessons, removed by the controlled lesson reset —
`docs/reports/LESSON_RESET_AUDIT.md`) with the changes the new pedagogical
system requires:

- **Every module declares a `stage`** from the canonical learning journey
  (`packages/core/curriculum/lessonStages.js`): `prerequisite_check → trigger
  → discovery → manipulation → formalization → practice_lab → evaluation`.
  Stages must appear in that order across the `modules` array (several modules
  may share a stage). `trigger`, `discovery`, `formalization`, `practice_lab`
  and `evaluation` are required for an `available` lesson;
  `prerequisite_check` and `manipulation` are used when the mathematics calls
  for them. Exception: a lesson declaring `knowledgeMap: true` formalises
  continuously through its cumulative Knowledge Map (every module's « À
  retenir » is the current map, the final synthèse is the complete map) and
  needs no `formalization` module — reference: `vecteurs-2nde`, see
  `KNOWLEDGE_MAP.md`. There is no `results` stage — the results / learning-profile
  screen is the completion view of the `evaluation` module.
- **A built lesson's modules fit in 90 minutes** (`MAX_LESSON_MINUTES`,
  enforced by `validate-lessons.mjs` on the sum of module `estimatedMin`, and
  by `smarter:validate-curriculum` on the catalogue's `durationMinutes`) —
  a hard cap for the interactive module sequence. A topic whose full scope
  genuinely warrants more than one sitting can be built as multiple
  `lesson.config.js` files (the retired "Partie 1 / Partie 2" convention),
  but the catalogue (`coursesData.js`) always presents it as one entry per
  official curriculum object. Some already-built lessons currently exceed
  this cap (flagged by `smarter:validate-curriculum`'s duration-violation
  section) — a known backlog, not silently ignored drift.
- **`totalModules` is gone** — it is derived (`modules.length`) and served to
  the app by the lesson registry (`apps/web/src/lessons/registry.js`).
- **Module files live directly under `modules/`**, one file per module,
  named `Module<NN><Descriptor>.jsx` (module number, zero-padded to two
  digits, followed by a PascalCase descriptor, e.g.
  `modules/Module03Decouper.jsx`) — this is the restored pre-reset
  convention, standard for every lesson. The validator maps a question file
  to its owning module by reading the file's `Module(\d+)` number prefix and
  matching it against the module's `number` field in `lesson.config.js` (not
  the slug) to enforce that evidence-generating questions live only in
  `evaluation`-stage modules. A module that genuinely needs more than one
  file (e.g. a large evaluation module's question bank) may instead use the
  legacy `modules/<slug>/` directory form — both conventions are
  validator-supported, but flat `Module<NN><Descriptor>.jsx` is preferred.
- **The final evaluation is always open.** Sequential unlock applies to
  learning modules only; an `evaluation`-stage module is accessible from the
  start (`lessonAccess.js`) — the "Je pense déjà maîtriser" alternative path.
  A student who demonstrates sufficient mastery there completes the lesson
  with `completion_mode: 'mastery'`; weak Learning Points map back to the
  modules that teach them (`recommendModulesForLearningPoints`) instead of
  "restart the lesson".
- **Lessons and questions declare their knowledge dependencies.** `priorKnowledge: string[]` on
  `LESSON_CONFIG` lists the concept ids the lesson assumes and its Module 0 diagnoses; each question
  declares `requires: string[]`, and a `<KnowledgeBrick id>` establishes an id at the point it is
  taught. Nothing here affects the runtime: it is the contract
  `scripts/audit-knowledge-dependencies.mjs` checks, so that no demand precedes what it needs
  (`KNOWLEDGE_DEPENDENCY.md`).

- **Modules declare their Learning-Point wiring**: `teachesLearningPointIds`
  (which LPs a learning module teaches — powers post-evaluation
  recommendations; every LP must be taught by ≥ 1 module, and evaluation
  modules teach nothing) and, sparingly, `requiresLearningPointIds` (a
  mastery gate on LP ids, never scores — only LPs taught by an earlier
  module, and it blocks only on a *demonstrated* gap, never on missing
  evidence).
- **Module completion is the module's own meaningful learning experience** —
  never time spent, page views, or a generic score. Practice mistakes do not
  block completion; the module exists for learning, not examination.

## Progression non bloquante — INVARIANT DUR

> **Une mauvaise réponse ne DOIT JAMAIS bloquer, verrouiller, piéger ni
> empêcher l'élève de poursuivre son parcours.**
>
> Une réponse fausse est une **preuve pédagogique**, jamais un verrou de
> progression. Toute interaction validée DOIT fournir un retour ciblé et un
> chemin de sortie. L'élève PEUT réessayer, être guidé, voir la solution, ou
> continuer vers l'activité suivante — mais le réessai NE DOIT JAMAIS être
> obligatoire pour avancer.

Violer cet invariant est un **RELEASE BLOCKER**, pas une préférence d'UX.

**Quatre systèmes, à garder découplés** — une validation en échec n'implique
jamais, à elle seule, `nextActivity.disabled = true` :

| Système | Question à laquelle il répond |
| --- | --- |
| Validation | la réponse est-elle juste ? |
| Retour (feedback) | quelle erreur de raisonnement l'élève a-t-il faite ? |
| Preuve (evidence) | que nous apprend cette réponse sur le Learning Point ? |
| Progression | l'élève peut-il continuer à apprendre ? |

Concrètement, pour chaque activité interactive :

```text
réponse juste    → retour → progression
réponse fausse   → retour ciblé → remédiation/réessai FACULTATIFS → progression
```

et jamais :

```text
réponse fausse   → verrou → cul-de-sac
```

**Ce que cela veut dire dans le code.** Le kit (`lessons/common/kit/questions.jsx`)
appelle `onAnswered(isCorrect)` **inconditionnellement** et révèle la bonne
réponse en cas d'erreur, sans boucle « Réessayer » : une question du kit ne
peut pas être re-répondue. Un module DOIT donc valider son étape dès que
l'élève a **répondu**, jamais seulement s'il a répondu **juste** :

```jsx
- onAnswered={(ok) => { if (ok) setQ2(true); }}   // ❌ cul-de-sac
+ onAnswered={() => setQ2(true)}                   // ✅
```

Sans cela, l'étape ne se valide jamais, `ContentModule` laisse `nextLink`
à `undefined`, et le module suivant reste verrouillé
(`packages/core/lessonAccess.js`) : l'élève doit recharger la page.

**Restent conformes**, parce que le chemin de sortie existe :
- une **manipulation rejouable** (glisser un point, relancer un robot,
  cliquer une barre) qui n'avance que sur un geste juste — l'élève
  recommence autant qu'il veut ;
- un composant à **essais bornés** qui finit par révéler la solution et
  appeler `onDone(false)` (`BuildCheck`, `ProofOrder`).

**Maîtrise ≠ autorisation d'avancer.** Un élève continue son parcours alors
qu'un Learning Point est « en cours », « à renforcer » ou « découverte » ; le
système RECOMMANDE de la pratique, il n'enferme pas.

Cet invariant ne consiste PAS à accepter toutes les réponses : la distinction
juste / faux / partiellement juste et le retour ciblé restent entiers. Le but
est un apprentissage **non bloquant, pas non évalué**.

**Garde exécutable :** `npm run check:non-blocking`
(`scripts/check-non-blocking.mjs`), inclus dans `npm run check:lessons`.

`npm run validate:lessons` (`scripts/validate-lessons.mjs`) enforces all of
this.

## Lesson contract

```js
export const LESSON_CONFIG = {
  id: string,                    // REQUIRED, unique. Progress storage key: `smarter_lesson_${id}`.
                                  // Must match coursesData.js's smaMetadata[...].id (convention only,
                                  // not enforced — see "known gap" below).
  sequentialUnlock: boolean,     // REQUIRED. Whether modules gate on the previous one's completion
                                  // (lessonAccess.js). Existing lessons vary — this is a real per-lesson
                                  // decision, not a bug (fonctions-lineaires-affines opts out deliberately
                                  // per the cleanup-phase audit's finding, revisit only with intent).
  title: string,                 // REQUIRED. Display name.
  description: string,           // REQUIRED. One paragraph, shown on the lesson landing page.
  level: 'college' | 'lycee',    // REQUIRED.
  grade: string,                 // REQUIRED. e.g. '6e', '3e'.
  chapter: string,                // REQUIRED. Domain id, e.g. 'nombres_calculs'.
  chapterTitle: string,           // REQUIRED. Display name for the chapter.
                                  // (totalModules was removed — modules.length is the count,
                                  // exposed to the app via apps/web/src/lessons/registry.js.)
  passingScore: number,           // Used by boss/assessment modules for a pass/fail threshold.
  masteryThreshold: number,       // 0–1. Feeds the non-sequential isMastered check in LessonIndex.jsx.
  emoji: string,                  // Display icon.
  estimatedDurationMin: number,   // Sum of module estimatedMin — ≤ 45 (validator-enforced) and
                                  // within 10 min of the catalogue's durationMinutes.
  skills: string[],               // Free-text learning objectives, shown on the lesson landing page.
  teachingScope: {                // Optional but present on every inspected lesson.
    include: string[],
    exclude: string[],
  },
  modules: ModuleContract[],      // REQUIRED. See below.
}
```

**Id agreement, now partially enforced:** `LESSON_CONFIG.id` must equal `coursesData.js`'s lesson id for the grade the folder path names — `validate-lessons.mjs` fails on a config id that doesn't exist in the catalogue for that grade. Still convention-only: the folder path's last segment matching the id, and the `App.jsx` route table matching `modules[].path` (a future lesson-registration mechanism replacing the static route table can validate against this contract).

## Module contract

```js
{
  id: string,          // REQUIRED, unique within the lesson. Storage format varies today
                        // ('L01-ent', 'L01-4e', or bare '1') — see PROGRESS_MODEL.md for how
                        // this is normalized. New lessons should prefer a bare zero-padded
                        // number as the id going forward for consistency, but this contract
                        // does not require renaming existing ones (explicitly out of scope —
                        // module IDs are load-bearing for existing student progress data).
  number: number,       // REQUIRED. 1-indexed position — drives prev/next nav (moduleContext.js)
                        // AND the module's file identity: its file lives at
                        // modules/Module<NN><Descriptor>.jsx, where <NN> is this number
                        // zero-padded to two digits (the validator maps questions to
                        // modules by reading this number out of the filename).
  slug: string,          // REQUIRED. URL segment (routes.jsx maps slug -> the Module<NN>*.jsx
                        // component by module number, not by encoding the slug in the filename).
  path: string,           // REQUIRED. Full route path — must match an App.jsx <Route>.
  title: string,           // REQUIRED. Display name.
  desc: string,             // REQUIRED. One-line teaser, shown on the lesson landing page.
  stage: string,             // REQUIRED. One of LESSON_STAGES (lessonStages.js) — the module's
                              // place in the learning journey. Stages must be in journey order
                              // across the modules array; enabled assessment questions may only
                              // live in an 'evaluation'-stage module. 'evaluation' modules are
                              // always unlocked (the mastery-bypass path).
  teachesLearningPointIds: string[],   // Learning modules: the LP ids this module teaches.
                              // Union across modules must cover every lesson LP (strict);
                              // evaluation modules must not declare it. Powers the
                              // post-evaluation "revoir Module N" recommendations.
  requiresLearningPointIds?: string[], // OPTIONAL mastery gate — LP ids (never scores) that must
                              // not be in demonstrated-'gap' status. Only LPs taught by an
                              // EARLIER module; use sparingly, only when pedagogically necessary.
  color: string,             // REQUIRED. One of LessonIndex.jsx's COLOR_MAP keys.
  style: 'featured' | 'boss' | 'assessment',  // Drives the card style on the lesson landing page.
  estimatedMin: number,      // REQUIRED, load-bearing: the per-lesson sum must stay ≤ 45.
  difficulty: 1|2|3|4,        // Display only (star rating) — NOT read by useAdaptiveExercise
                               // despite the name suggesting it should be (AUDIT.md finding,
                               // unchanged — "adaptive" difficulty doesn't exist yet).
  actionText: string,          // Button label on the lesson landing page.
}
```

### What a module IS, structurally (not a new abstraction — a description of the existing one)

A module is **one React component**, always wrapped in `<ModuleLayout>`, whose body is an author-controlled sequence of steps. This phase does **not** introduce an `Activity` layer between Module and Exercise (§23 of the phase brief explicitly reserves "activity model" formalization for later) — the current reality is that a module's JSX *is* its sequence of content + activities + exercises, undifferentiated in code. What the contract requires structurally:

- Wrapped in `<ModuleLayout lessonId totalModules moduleNumber prevLink nextLink isCompleted>`.
- Calls `useProgress(lessonId).markModuleCompleted(moduleId)` (directly, or via `ModuleLayout`'s `onNextClick`) exactly when the module's own definition of "done" is met — this is module-specific and intentionally not standardized (a "discovery" module and a "boss" module have different completion definitions; forcing one shape here would be exactly the kind of premature abstraction the phase brief warns against).
- Where the module contains a *gradeable* exercise, the exercise portion should honor the Exercise Contract (`EXERCISE_CONTRACT.md`) rather than inventing a new validate/feedback shape.

### Module Progress Bar — layout contract

The step progress bar (`StepProgressBar`, `lessons/common/components/LessonUI.jsx`) belongs to the **lesson shell, not to the header**. Its sticky offset is derived from what is actually rendered above it — never from a hardcoded `top-16`.

**Source of truth:** `lessons/common/utils/lessonChrome.js` (`getLessonChromeLayout({ authenticated })`), surfaced to React by `lessons/common/hooks/useLessonChrome.js`. `ModuleLayout` computes it once and publishes it through `LessonChromeContext`; children *receive* the layout rather than guessing whether a header exists.

The chrome a lesson actually renders (`CourseLayout` picks the shell from auth state):

| Mode | Shell | Persistent top element | `stickyTopClass` | `contentOffsetClass` |
|---|---|---|---|---|
| Visitor | `MainLayout` | `Navbar` — `fixed top-0 h-16` | `top-16` | `pt-16` |
| Student, `< lg` | `StudentLayout` | mobile header — `fixed top-0 h-14` | `top-14` | `pt-0` |
| Student, `≥ lg` | `StudentLayout` | sidebar only — **none at top** | `lg:top-0` | `pt-0` |

Student mode uses `pt-0` because `StudentLayout`'s `<main>` already consumes its mobile header with `pt-14 lg:pt-0`; the module must not reserve that space a second time.

**Rules**

- The progress bar must **never reserve space for a header that is not rendered.** Reserving 64px in the student shell is the regression this contract exists to prevent.
- It sticks immediately below the highest persistent navigation element, and at the very top of the viewport when there is none.
- All modules use the **same shared component**. No lesson may implement an independent progress-bar variant without an explicit architectural reason.
- A module must never silently omit the bar. Content modules that don't use the `ContentModule` kit still render `StepProgressBar` themselves, fed by the same state that gates `nextLink` (see `college/4e/nombres_calculs/racines-carrees`).
- Progress values are always **derived**, never hardcoded — `doneCount`/`total` come from real step/exercise state, and the bar hides at `allDone` (`{!allDone && …}` in `ContentModule`).
- **No layout hacks**: negative offsets (`-mt-16`), `translateY` compensation, or `overflow: hidden` to mask the gap are forbidden. Fix the layout relationship instead.
- Offsets are expressed as Tailwind scale steps in `lessonChrome.js`'s literal class tables. Every class must exist **verbatim** in that file, or Tailwind's JIT scan won't emit it and the offset silently becomes zero.

**Guards:** `lessons/common/utils/lessonChrome.test.js` (unit — offsets, no-negative-offset, JIT literals, single implementation) and `apps/web/e2e/lesson-kit/lesson-chrome-sticky.mjs` (browser — both shells across 320→1440px, module transitions, reload).

### Module types observed (not enforced, described)

`style: 'featured'` (the default — explanation + manipulation + practice), `'boss'` (multi-phase capstone, e.g. `Module11BossFinal.jsx`'s épreuves/profil/synthèse/flash structure), `'assessment'` (used by `Module10BilanEvaluation.jsx`-style modules). The contract supports all three without requiring they behave identically — per the phase brief's explicit instruction not to force different module types into one artificial shape.
