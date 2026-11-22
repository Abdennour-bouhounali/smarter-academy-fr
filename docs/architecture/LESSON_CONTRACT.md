# Lesson & Module Contract

> **Status (2026-11-22).** Covers the `lesson.config.js` contract (fields, stages, learning-point wiring), the
> non-blocking invariant and the unlock rules. Imported from the Algerian platform (DZ `dev` `7f4cef1c`) on 2026-11-22.
> True here: a v2 lesson still has a `lesson.config.js` whose modules are DATA (`LESSON_V2.md`), and
> `validate-lessons.mjs`, `check:non-blocking` and `isValidModuleNumber` still enforce what follows (the unlock code
> `packages/core/lessonAccess.js` was deleted on 2026-11-22, commit `4511da19`, as used by nothing);
> they run on a tree with NO lesson today. Not true here: the module PAGES (`ModuleLayout`, `ContentModule`, the kit
> `common/kit/`, `_unit/` factories), the « مسائل » modules and the textbook provenance are deleted (their sections are
> cut; `git show 049380e:docs/architecture/LESSON_CONTRACT.md`).

The contract every lesson's `lesson.config.js` must honor:

- **Every module declares a `stage`** from the canonical learning journey
  (`packages/core/curriculum/lessonStages.js`): `prerequisite_check → trigger
  → discovery → manipulation → formalization → practice_lab → evaluation`.
  Stages must appear in that order across the `modules` array (several modules
  may share a stage). `trigger`, `discovery`, `formalization`, `practice_lab`
  and `evaluation` are required for an `available` lesson (`REQUIRED_STAGES_BY_KIND` in
  `packages/core/curriculum/manipulationTypes.js`); `prerequisite_check` and `manipulation` are used when the
  mathematics calls for them. A lesson declaring `knowledgeMap: true` needs no `formalization` module, and
  `validate-lessons.mjs` then requires `knowledgeMapMode: 'progressive'` and, for a v2 lesson, a pack whose
  `knowledge` names an existing file (`LESSON_V2.md` §1). There is no `results` stage.
- **A built lesson's modules fit in 90 minutes** (`MAX_LESSON_MINUTES`,
  enforced by `validate-lessons.mjs` on the sum of module `estimatedMin`, and
  by `smarter:validate-curriculum` on the catalogue's `durationMinutes`) —
  a hard cap for the interactive module sequence. A topic whose full scope
  genuinely warrants more than one sitting can be built as multiple
  `lesson.config.js` files (the retired "Partie 1 / Partie 2" convention),
  but the catalogue (`coursesData.js`) always presents it as one entry per
  official curriculum object.
- **`totalModules` is gone** — it is derived (`modules.length`) and served to
  the app by the lesson registry (`apps/web/src/lessons/registry.js`).
- **A lesson has no module page**: its modules are data the world marks, and `buildLessonRoutes`
  (`lessons/common/lessonRoutes.jsx`) turns each module `path` into a redirect to the lesson's home, so an old link never
  ends on a 404. The ids and numbers stay because progress is stored by them.
- **The final evaluation is always open.** Sequential unlock applies to
  learning modules only; an `evaluation`-stage module is accessible from the
  start (the rule of the deleted `lessonAccess.js`; no code applies it today).
  A student who demonstrates sufficient mastery there completes the lesson
  with `completion_mode: 'mastery'`; weak Learning Points map back to the
  modules that teach them (`recommendModulesForLearningPoints`) instead of
  "restart the lesson".
- **Knowledge dependencies** (`priorKnowledge`, `requires`) are checked by `scripts/audit-knowledge-dependencies.mjs`
  (`KNOWLEDGE_DEPENDENCY.md`); the `<KnowledgeBrick>` component it was written for is deleted.

- **Modules declare their Learning-Point wiring**: `teachesLearningPointIds`
  (which LPs a learning module teaches — powers post-evaluation
  recommendations; every LP must be taught by ≥ 1 module, and evaluation
  modules teach nothing) and, sparingly, `requiresLearningPointIds` (a
  SOFT mastery gate on LP ids, never scores — only LPs taught by an earlier
  module. Since Mastery V2 it never blocks).
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

**Ce que cela voulait dire dans le code.** Les pages de module (supprimées) devaient valider une étape dès que
l'élève avait **répondu**, jamais seulement s'il avait répondu **juste** :
`onAnswered={(ok) => { if (ok) setQ2(true); }}` était un cul-de-sac. `check:non-blocking` cherche encore ce motif ;
dans un monde v2, la même règle tient : un verdict est ce que fait le monde, jamais un verrou (`GAME_WORLD.md`).
Restent conformes une manipulation rejouable qui n'avance que sur un geste juste, et un composant à essais bornés
qui finit par révéler la solution.

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
                                  // Must equal the catalogue code (packages/core/curriculum/fr/
                                  // lessons_<grade>_*.json) — validate-lessons.mjs enforces it.
  sequentialUnlock: boolean,     // REQUIRED. Whether modules gate on the previous one's completion
                                  // — a per-lesson decision; no code reads it today (lessonAccess.js deleted).
  title: string,                 // REQUIRED. Display name.
  description: string,           // REQUIRED. One paragraph, shown on the lesson landing page.
  level: 'college',              // REQUIRED.
  grade: string,                 // REQUIRED. An ACTIVE grade id: '6e' | '5e' | '4e' | '3e'.
  chapter: string,                // REQUIRED. The thème id, e.g. 'nombres_calculs'.
  chapterTitle: string,           // REQUIRED. Display name for the chapter.
                                  // (totalModules was removed — modules.length is the count,
                                  // exposed to the app via apps/web/src/lessons/registry.js.)
  passingScore: number,           // Read by nothing (verified on the Algerian tree, 2026-09-29).
  masteryThreshold: number,       // 0–1. Read by nothing in this tree (grep, 2026-11-22).
  emoji: string,                  // Display icon.
  estimatedDurationMin: number,   // = sum of module estimatedMin (convention;
                                  // the validator checks the SUM ≤ 90 and warns at ±10 min from the
                                  // catalogue's durationMinutes, not this equality).
  skills: string[],               // Free-text learning objectives, shown on the lesson landing page.
  teachingScope: {                // Optional but present on every inspected lesson.
    include: string[],
    exclude: string[],
  },
  modules: ModuleContract[],      // REQUIRED. See below.
}
```

**Id agreement:** `LESSON_CONFIG.id` must equal the catalogue lesson code for the grade the folder path names — `validate-lessons.mjs` fails otherwise. Routes are not a separate table: a lesson's `routes.jsx` calls `buildLessonRoutes` of `lessons/common/lessonRoutes.jsx`, and since 2026-10-14 `App.jsx` mounts every lesson through ONE lazy route boundary fed by the generated lesson index (`lessons/lessonRouteBoundary.jsx`, `lessons/lessonIndex.generated.json`); `check:routes` verifies the boundary is mounted, that every active lesson is in the index and in the loaders' glob, and that its base path is the catalogue's. The folder name equal to the id is now ENFORCED (`scripts/generate-lesson-index.mjs` fails otherwise): the lazy loader finds a lesson by its folder.

## Module contract

```js
{
  id: string,          // REQUIRED, unique within the lesson; prefer a bare zero-padded number.
                        // Load-bearing for stored progress (PROGRESS_MODEL.md).
  number: number,       // REQUIRED. Integer ≥ 0; the FIRST module may be 0; numbers are CONTIGUOUS.
  slug: string,          // REQUIRED. URL segment.
  path: string,           // REQUIRED. Full route path = `${LESSON_BASE_PATH}/${slug}` (the index generator
                        // checks it; buildLessonRoutes mounts it as a redirect to the home).
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
  requiresLearningPointIds?: string[], // OPTIONAL SOFT mastery gate — LP ids (never scores); a
                              // demonstrated 'gap' on one of them shows a review hint, never a lock.
                              // Only LPs taught by an EARLIER module; use sparingly.
  color: string,             // Card colour of the deleted module landing page; read by nothing today.
  style: 'featured' | 'diagnostic' | 'boss' | 'assessment',  // idem; no script checks either (grep, 2026-11-22).
  estimatedMin: number,      // REQUIRED, load-bearing: the per-lesson sum must stay ≤ 90.
  difficulty: 1|2|3|4,        // Display only (a star rating). Nothing reads it to adapt
                               // anything: there is no adaptive selection for lesson
                               // modules. (The practice engine has its own 1–5 levels,
                               // which DO weight mastery — a separate system.)
  actionText: string,          // Button label on the lesson landing page.
}
```

## Unit, kind, resources, programme items

- **`unit`** (optional) — the unit code; must match the catalogue. Lesson folders live under
  `lessons/college/<grade>/<theme>/<unit>/<lesson>/`.
- **`kind`** (`'lesson'` default | `'synthesis'`) — a synthesis lesson is never counted as a lesson; its required stages
  come from `REQUIRED_STAGES_BY_KIND`. The catalogue must declare the same `kind`.
- **`resources`** (literal array, optional) — `{ kind: 'manipulation'|'method'|'situation'|'example', code, type?, title,
  module, learningPointIds }`, plus beginner/advanced levels for a manipulation (`manipulationLevels.js`).
  `validate-lessons.mjs` still enforces kinds, types from `MANIPULATION_TYPES` (`manipulationTypes.js`), module numbers
  and learning-point ownership, although the lab components those types named are deleted.
  `exportContentRegistry.mjs` → `smarter:import-content-registry` mirrors resources into `lesson_resources`.
- **Prerequisites are pedagogical** — `prerequisiteLessonCodes` and `pointPrerequisites` never lock anything.
- **`programmeItems`** — every non-synthesis lesson of `lessons_<grade>_*.json` lists the official programme items it
  teaches. Contract: `LEARNING_NET.md`.

## Déverrouillage séquentiel — les trois règles qui ne se négocient pas

`sequentialUnlock` guide vers la suite ; il n'enferme jamais l'élève dehors.
Trois invariants. Ils étaient codés dans `packages/core/lessonAccess.js`, supprimé le 2026-11-22 (commit `4511da19`,
plus rien ne l'appelait) : ils restent la règle pour le code qui reviendra, aucun code ne les applique aujourd'hui :

1. **Le premier module est celui de la leçon**, pas le numéro 1. Une leçon peut
   ouvrir sur un module 0 ; le traiter comme « pas le premier » exigerait un
   module −1 inexistant et scellerait la leçon entière.
2. **Un module terminé ne se referme jamais.** La maîtrise passe avant le
   verrou.
3. **Un diagnostic ne barre pas la route.** Un module `prerequisite_check`
   est « client-side only, never persisted as evidence » : le sauter est un
   droit, donc il ne verrouille pas le module suivant.

Rappel opérationnel : depuis le 2026-11-11 un module n'a pas d'état propre —
il est ouvert ou fermé avec sa leçon (`ContentAccess`), et l'import lui recopie
l'état de la leçon. Il n'y a plus rien à publier à la main après un import.


---

## Le module 0 EST un module
 — la règle, et le défaut qu'elle a corrigé

Un module peut porter le numéro **0** (un `prerequisite_check`). Toute la chaîne
de progression doit donc traiter 0 comme un numéro ordinaire.

**La règle, exécutable :** on valide la NATURE d'un numéro de module, jamais sa
vérité. `isValidModuleNumber(moduleNumber)` (`@smarter-academy/core`) est le
seul juge — un entier fini ≥ 0, et non les valeurs que `Number()` convertirait
en 0 (`''`, `[]`, `false`).

```js
if (lessonId && moduleNumber) …                    // ❌ le module 0 disparaît
if (lessonId && isValidModuleNumber(moduleNumber)) // ✅
```

**Le premier module n'est pas toujours 1**, et la reprise le sait désormais :
`getNextIncompleteModule(uniqueModules, totalModules, firstModuleNumber)` balaie
l'intervalle réel de la leçon (défaut 1, donc les appelants qui l'ignorent ne
changent pas), et `getFirstModuleNumber(lessonId)` du registre le lui fournit.

Verrous : `packages/core/progress/isValidModuleNumber.test.js`,
`getNextIncompleteModule.test.js` et
`apps/web/src/lessons/common/components/moduleZeroProgress.test.js`.
