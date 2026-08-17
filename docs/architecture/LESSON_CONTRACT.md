# Lesson & Module Contract

This documents the contract that **already exists** in every one of the 17 implemented lessons (`LESSON_CONFIG` in each `lesson.config.js`), formalized so future lessons — 5e, the regenerated 3e, Lycée — are held to the same shape deliberately rather than by accident. No field below was invented; every one is read from a real `lesson.config.js` (`apps/web/src/lessons/college/6e/nombres_calculs/nombres-entiers/lesson.config.js` used as the reference — it's the most complete example) and cross-checked against 6 others.

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
  totalModules: number,           // REQUIRED. Must equal modules.length — see "known gap" below.
  passingScore: number,           // Used by boss/assessment modules for a pass/fail threshold.
  masteryThreshold: number,       // 0–1. Feeds the non-sequential isMastered check in LessonIndex.jsx.
  emoji: string,                  // Display icon.
  estimatedDurationMin: number,   // Sum of module estimatedMin, roughly.
  skills: string[],               // Free-text learning objectives, shown on the lesson landing page.
  teachingScope: {                // Optional but present on every inspected lesson.
    include: string[],
    exclude: string[],
  },
  modules: ModuleContract[],      // REQUIRED. See below.
}
```

**Known gap, documented not fixed:** three independent id surfaces (`LESSON_CONFIG.id`, `coursesData.js`'s `smaMetadata[...].id`, and the folder path) must agree, and `totalModules` must match `modules.length` and the count of routes actually wired in `App.jsx` — all by convention, none enforced by code or a build step. Every lesson audited (17/17) is currently consistent. This contract doesn't fix that (would require a validation step / build check — future work, not this phase); it makes the requirement explicit so a future lesson-registration mechanism (replacing the `App.jsx` static route table) can validate against it.

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
                        // and the ModuleNN<Descriptor>.jsx file-naming convention.
  slug: string,          // REQUIRED. URL segment, currently always String(number).
  path: string,           // REQUIRED. Full route path — must match an App.jsx <Route>.
  title: string,           // REQUIRED. Display name.
  desc: string,             // REQUIRED. One-line teaser, shown on the lesson landing page.
  color: string,             // REQUIRED. One of LessonIndex.jsx's COLOR_MAP keys.
  style: 'featured' | 'boss' | 'assessment',  // Drives the card style on the lesson landing page.
  estimatedMin: number,      // Display only.
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

### Module types observed (not enforced, described)

`style: 'featured'` (the default — explanation + manipulation + practice), `'boss'` (multi-phase capstone, e.g. `Module11BossFinal.jsx`'s épreuves/profil/synthèse/flash structure), `'assessment'` (used by `Module10BilanEvaluation.jsx`-style modules). The contract supports all three without requiring they behave identically — per the phase brief's explicit instruction not to force different module types into one artificial shape.
