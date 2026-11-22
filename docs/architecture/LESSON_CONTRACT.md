# Lesson & Module Contract

> **Scope note (2026-09-20).** This document is authoritative on the lesson and
> module contract: fields, stages, unlock rules and the non-blocking invariant.
> It was written for the French-era lessons and still describes them, because
> the contract itself did not change. Two things did, and are described in
> § « L'unité 4AM » at the end: the **file wiring** (an Algerian lesson gets its
> routes, module context and Classroom shell from shared `_unit/` factories) and
> the **vocabulary** (المحور = module, الوحدة = a textbook unit).
>
> For building a lesson, start at
> [`../lessons/LESSON_DEVELOPMENT_GUIDE.md`](../lessons/LESSON_DEVELOPMENT_GUIDE.md).
> Anything below that mentions French grades, `lessons/college/…` paths,
> `smaMetadata` or `App.jsx` route tables describes French content that was
> **deleted on 2026-09-25** (lessons and catalogue alike); the contract it
> illustrates still applies to 4AM lessons.
>
> **Catalogue scope (2026-09-25).** `coursesData.js` holds only the Algerian
> catalogue, and it shows only the ميادين that carry at least one lesson
> (today: ميدان أنساب الأعداد والحساب, with the unit « الأعداد الطبيعيّة
> والأعداد النّاطقة »). The official programme JSON keeps all four ميادين
> and 28 topics; a ميدان reappears automatically when a lesson names it.

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
  needs no `formalization` module — reference: every lesson of the 4AM unit
  (all nine declare `knowledgeMap: true`), see `KNOWLEDGE_MAP.md`. A lesson that also
  declares `knowledgeMapMode: 'progressive'` and exports a `KNOWLEDGE_GRAPH` shows the
  approved **progressive interactive learning map** (`KNOWLEDGE_MAP.md` Part A — all nine
  lessons since 2026-09-29, required for every lesson with a map by `validate-lessons.mjs`); the flag changes the map's
  presentation, never the stages, the locking or the progress. There is no `results` stage — the results / learning-profile
  screen is the completion view of the `evaluation` module.
- **A built lesson's modules fit in 90 minutes** (`MAX_LESSON_MINUTES`,
  enforced by `validate-lessons.mjs` on the sum of module `estimatedMin`, and
  by `smarter:validate-curriculum` on the catalogue's `durationMinutes`) —
  a hard cap for the interactive module sequence. A topic whose full scope
  genuinely warrants more than one sitting can be built as multiple
  `lesson.config.js` files (the retired "Partie 1 / Partie 2" convention),
  but the catalogue (`coursesData.js`) always presents it as one entry per
  official curriculum object. No built lesson exceeds the cap today (the
  longest 4AM lessons, `bahth-pgcd` and `ikhtizal-kasr`, sum to 65 min).
- **`totalModules` is gone** — it is derived (`modules.length`) and served to
  the app by the lesson registry (`apps/web/src/lessons/registry.js`).
- **Module files live directly under `modules/`**, one file per module,
  named `Module<NN><Descriptor>.jsx` (module number, zero-padded to two
  digits, followed by a PascalCase descriptor, e.g.
  `modules/Module02Maarif.jsx`) — this is the restored pre-reset
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
  SOFT mastery gate on LP ids, never scores — only LPs taught by an earlier
  module. Since Mastery V2 it never blocks: a demonstrated `gap` shows the
  hint « نوصي بمراجعة … أولًا » with links to the teaching module
  (`lessons/common/utils/softGate.js`), and the module stays open).
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
                                  // Must equal the catalogue code (packages/core/curriculum/dz/
                                  // lessons_<grade>_*.json) — validate-lessons.mjs enforces it.
  sequentialUnlock: boolean,     // REQUIRED. Whether modules gate on the previous one's completion
                                  // (lessonAccess.js). Existing lessons vary — this is a real per-lesson
                                  // decision, not a bug (fonctions-lineaires-affines opts out deliberately
                                  // per the cleanup-phase audit's finding, revisit only with intent).
  title: string,                 // REQUIRED. Display name.
  description: string,           // REQUIRED. One paragraph, shown on the lesson landing page.
  level: 'moyen',                // REQUIRED. (The French 'college' | 'lycee' values are gone.)
  grade: string,                 // REQUIRED. An ACTIVE grade id — '4am' today.
  chapter: string,                // REQUIRED. المجال id, e.g. 'ansab_al_aadad_wal_hisab'.
  chapterTitle: string,           // REQUIRED. Display name for the chapter.
                                  // (totalModules was removed — modules.length is the count,
                                  // exposed to the app via apps/web/src/lessons/registry.js.)
  passingScore: number,           // Declared by every 4AM lesson, READ BY NOTHING (verified 2026-09-29):
                                  // the final test has no pass/fail threshold; mastery is the server's.
  masteryThreshold: number,       // 0–1. Read only on the NON-sequential branch of LessonIndex.jsx
                                  // (`isPathComplete`); all 4AM lessons are sequential, so inert today.
  emoji: string,                  // Display icon.
  estimatedDurationMin: number,   // = sum of module estimatedMin (convention, true for all 9 lessons;
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

**Id agreement:** `LESSON_CONFIG.id` must equal the catalogue lesson code for the grade the folder path names — `validate-lessons.mjs` fails otherwise. Routes are not a separate table any more: `buildLessonRoutes` (`_unit/lessonRoutes.jsx`) mounts exactly `config.modules[].path`, and since 2026-10-14 `App.jsx` mounts every lesson through ONE lazy route boundary fed by the generated lesson index (`lessons/lessonRouteBoundary.jsx`, `lessons/lessonIndex.generated.json`); `check:routes` verifies the boundary is mounted, that every active lesson is in the index and in the loaders' glob, and that its base path is the catalogue's. The folder name equal to the id is now ENFORCED (`scripts/generate-lesson-index.mjs` fails otherwise): the lazy loader finds a lesson by its folder.

## Module contract

```js
{
  id: string,          // REQUIRED, unique within the lesson. Storage format varies today
                        // ('L01-ent', 'L01-4e', or bare '1') — see PROGRESS_MODEL.md for how
                        // this is normalized. New lessons should prefer a bare zero-padded
                        // number as the id going forward for consistency, but this contract
                        // does not require renaming existing ones (explicitly out of scope —
                        // module IDs are load-bearing for existing student progress data).
  number: number,       // REQUIRED. Integer ≥ 0; the FIRST module may be 0 (« أستعدّ »), and
                        // numbers must be CONTIGUOUS (ContentModule reads the previous module's
                        // stage as number − 1). Drives prev/next nav (moduleContext.js)
                        // AND the module's file identity: its file lives at
                        // modules/Module<NN><Descriptor>.jsx, where <NN> is this number
                        // zero-padded to two digits (the validator maps questions to
                        // modules by reading this number out of the filename).
  slug: string,          // REQUIRED. URL segment (routes.jsx maps slug -> the Module<NN>*.jsx
                        // component by module number, not by encoding the slug in the filename).
  path: string,           // REQUIRED. Full route path = `${LESSON_BASE_PATH}/${slug}` (the index generator
                        // checks it; buildLessonRoutes mounts it, and getModulePath rebuilds it from the index).
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
  color: string,             // REQUIRED. One of LessonIndex.jsx's COLOR_MAP keys (emerald, indigo,
                             // violet, blue, teal, sky, amber, rose, slate…); an unknown key falls
                             // back to slate silently.
  style: 'featured' | 'diagnostic' | 'boss' | 'assessment',  // Card style on the lesson landing page.
  estimatedMin: number,      // REQUIRED, load-bearing: the per-lesson sum must stay ≤ 90.
  difficulty: 1|2|3|4,        // Display only (a star rating). Nothing reads it to adapt
                               // anything: there is no adaptive selection for lesson
                               // modules. (The practice engine has its own 1–5 levels,
                               // which DO weight mastery — a separate system.)
  actionText: string,          // Button label on the lesson landing page.
}
```

### What a module IS, structurally (not a new abstraction — a description of the existing one)

A module is **one React component**, always wrapped in `<ModuleLayout>`, whose body is an author-controlled sequence of steps. This phase does **not** introduce an `Activity` layer between Module and Exercise (§23 of the phase brief explicitly reserves "activity model" formalization for later) — the current reality is that a module's JSX *is* its sequence of content + activities + exercises, undifferentiated in code. What the contract requires structurally:

- Wrapped in `<ModuleLayout lessonId totalModules moduleNumber prevLink nextLink isCompleted>`.
- Tells `ModuleLayout` its own definition of "done" through `isCompleted` — module-specific on purpose (a content module is done when every step is answered, a « أستعدّ » when its answers are submitted, a final test when it is submitted). **`ModuleLayout` is the only writer of module completion** and applies ONE rule everywhere — the effect, « التالي » and « إنهاء » alike: it writes `markModuleCompleted` only when `isCompleted && unlocked && !presenting` (since 2026-09-29; « التالي » on a non-blocking module used to write completion unconditionally, so skipping « أستعدّ » marked it done). Leaving a module is not finishing it. A module never calls the progress API itself.
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
| Teacher | `TeacherLayout` | same as the student rows (same header and sidebar geometry) | same | same |

Student and teacher modes use `pt-0` because their `<main>` already consumes the mobile header with `pt-14 lg:pt-0`; the module must not reserve that space a second time. The predicate is `usesWorkspaceShell(user)` (`CourseLayout.jsx`), derived from `features/learning/learningViewer.js`.

**Rules**

- The progress bar must **never reserve space for a header that is not rendered.** Reserving 64px in the student shell is the regression this contract exists to prevent.
- It sticks immediately below the highest persistent navigation element, and at the very top of the viewport when there is none.
- All modules use the **same shared component**. No lesson may implement an independent progress-bar variant without an explicit architectural reason.
- A module must never silently omit the bar. Every 4AM content module uses the `ContentModule` kit, which renders it; a module that did not would have to render `StepProgressBar` itself, fed by the same state that gates `nextLink`.
- Progress values are always **derived**, never hardcoded — `doneCount`/`total` come from real step/exercise state, and the bar hides at `allDone` (`{!allDone && …}` in `ContentModule`).
- **No layout hacks**: negative offsets (`-mt-16`), `translateY` compensation, or `overflow: hidden` to mask the gap are forbidden. Fix the layout relationship instead.
- Offsets are expressed as Tailwind scale steps in `lessonChrome.js`'s literal class tables. Every class must exist **verbatim** in that file, or Tailwind's JIT scan won't emit it and the offset silently becomes zero.

**Guards:** `lessons/common/utils/lessonChrome.test.js` (unit — offsets, no-negative-offset, JIT literals, single implementation). The browser guard `lesson-chrome-sticky.mjs` was deleted with the French lessons on 2026-09-25; `apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs` checks horizontal overflow at phone width.

### Module types observed (not enforced, described)

In the 4AM unit: `style: 'featured'` (the default — activity, معارف, أوظّف تعلّماتي), `'diagnostic'` (the « أستعدّ » module 0 that opens each of the nine lessons, built on `PrerequisiteDiagnostic`) and `'boss'` (every « إختبار أولي », built on `BossFinal`, e.g. `qasim-mushtarak-akbar/modules/Module07Itqan.jsx`). `'assessment'` is accepted but unused today. The style only changes the landing-page card.


## Phase 8 additions — unit, kind, resources (2026-09-18)

- **`unit`** (literal string, optional) — the textbook unit (الوحدة) code this lesson belongs to; must match the catalogue (`lesson.unitId`). Lesson folders of a unit live under `lessons/<level>/<grade>/<chapter>/<unit>/<lesson>/`.
- **`kind`** (`'lesson'` default | `'synthesis'`) — `synthesis` is the unit's « أدمج تعلّماتي »; never counted as a درس; required stages `practice_lab, evaluation`; **the format is fixed for every unit (2026-10-13): M0 أستعدّ, M1–6 training situations, M7 analysis, M8 final — never « أؤكّد تعلّماتي » / « أتعمّق »** (`REQUIRED_STAGES_BY_KIND`; no `trigger` since 2026-10-13, `packages/core/curriculum/manipulationTypes.js`). The catalogue must declare the same `kind`.
- **`resources`** (literal array, optional) — `{ kind: 'manipulation'|'method'|'situation'|'example', code, type?, title, module, learningPointIds, sourceElementIds? }`, plus, for a **levelled** manipulation, `{ level: 'beginner'|'advanced', objective, autonomy, experience: { type, reason?, theme? } }` (2026-09-20). A module that declares one level must declare both; the two levels must state the same `objective`; an `advanced` level must declare its `autonomy`; a non-`textbook` experience must carry a reason from the closed list in `packages/core/curriculum/manipulationLevels.js`. `validate-lessons.mjs` enforces all four. See [`MANIPULATION_CONTRACT.md` §7bis-levels](./MANIPULATION_CONTRACT.md). A `manipulation` names a **type from the closed registry** (`MANIPULATION_TYPES`); the component comes from `apps/web/src/lessons/common/manipulations/manipulationRegistry.js`, never from content. `validate-lessons.mjs` checks kinds, types, module numbers and learning-point ownership. `exportContentRegistry.mjs` → `smarter:import-content-registry` mirrors resources into `lesson_resources` (identity only).
- **Textbook source** — every pedagogical datum of a textbook-derived lesson carries `source: { type: 'textbook', elementId, page, section, number }` resolving to `docs/sources/<grade>/<unit>/extraction.json`; platform additions carry `type: 'platform_addition'` and render as « مثال تفاعلي إضافي ». `npm run check:textbook` enforces one destination per extracted element.
- **Prerequisites are pedagogical** — `prerequisiteLessonCodes` and `pointPrerequisites` are displayed with mastery state; they never lock anything.
- **`programmeItems`** (2026-10-13) — every non-synthesis lesson of `lessons_<grade>_*.json` lists the official programme items it teaches (`4am.m1.r03`…). They anchor the lesson in the learning net: review links under « أستعدّ », coverage of the official programme, the no-rebuild rule for 1AM–3AM generation. Contract: `LEARNING_NET.md`.
- **Module file numbers** — `Module<NN>…jsx` must use exactly two digits: `Module0117Wa18.jsx` is read as module 117 and its route is silently not mounted (found and fixed in phase 8).

## Déverrouillage séquentiel — les trois règles qui ne se négocient pas

`sequentialUnlock` guide vers la suite ; il n'enferme jamais l'élève dehors.
Trois invariants, tous dans `packages/core/lessonAccess.js` et couverts par
`lessonAccess.test.js` :

1. **Le premier module est celui de la leçon**, pas le numéro 1. Deux leçons
   de l'unité 4AM (`qasim-adad-tabii`, `ikhtizal-kasr`) ouvrent sur un
   module 0 (« أستعدّ ») ; le traiter comme « pas le premier »
   exigeait un module −1 inexistant et scellait la leçon entière.
2. **Un module terminé ne se referme jamais.** La maîtrise passe avant le
   verrou : revenir sur un module fini dont le prédécesseur ne l'est pas
   affichait « أتمِم المحور 00 » sur son propre travail.
3. **Un diagnostic ne barre pas la route.** Un module `prerequisite_check`
   est « client-side only, never persisted as evidence » : le sauter est un
   droit, donc il ne verrouille pas le module suivant.

Rappel opérationnel : depuis le 2026-11-11 un module n'a pas d'état propre —
il est ouvert ou fermé avec sa leçon (`ContentAccess`), et l'import lui recopie
l'état de la leçon. Il n'y a plus rien à publier à la main après un import.


---

## Modules « مسائل » (track: 'problem') — PILOTE, 2026-10-05/06

**Statut :** prototype validé par le propriétaire le 2026-10-06 sur
`qasim-adad-tabii` (modules 4–6) ; déployé ensuite unité par unité à toutes
les leçons régulières (pas aux 14 synthèses) — état dans le guide ci-dessous. **Guide de génération faisant autorité :
[`../lessons/MASAIL_GENERATION_GUIDE.md`](../lessons/MASAIL_GENERATION_GUIDE.md)** —
cette section n'en résume que le contrat moteur.


**Support de l'énoncé (2026-10-06).** Une مسألة peut porter `figure` (GeoFigure / SpaceFigure), `visual` (props de CoordPlane, même liste fermée et même plafond de 460 px que la pratique) et `table` (`{ head, rows }`), dessinés sous l'énoncé et validés par `validateProblem` ; un énoncé qui dit « الشكل / الجدول / التمثيل البياني » les montre (`validateProblem` refuse un renvoi sans support). Le support de la مسألة 1 vit dans `lessonProblem` (une seule source) : la carte « مسألة الدرس » le dessine aussi (`ProblemSupport`, chargé paresseusement).
**Pourquoi.** Après les modules d'une leçon, l'élève n'a jamais résolu un
exercice COMPLET de type امتحان : situation réelle → extraire les données →
traduire en mathématiques → calculer → répondre → rédiger. Trois modules
« مسألة » comblent ce manque, sans toucher à la maîtrise des الكفاءات.

**Place et nature.**
- `stage: 'practice_lab'`, `track: 'problem'`, AVANT le module `evaluation`
  (le validateur exige l'ordre des stages ; le test reste toujours ouvert).
- Comptent dans la complétion (décision du propriétaire), JAMAIS dans la
  maîtrise : aucune question `assessment`, aucun envoi d'evidence.
- Pas de `KnowledgeSnapshot` en pied de module (décision du propriétaire).
- Hors durée catalogue : le validateur exclut leurs `estimatedMin` de la
  comparaison avec `durationMinutes` du propriétaire, pas du plafond de 90 min.

**« مسألة الدرس ».** `LESSON_CONFIG.lessonProblem = { module, title, statement }`
(littéraux) : l'énoncé de la مسألة 1, montré au sommaire par `LessonProblemCard`, résolu au module indiqué. Elle prolonge la
manipulation du niveau متقدم (même instrument, autres nombres).

**La carte n'est PLUS dans les modules (2026-10-09, décision du propriétaire).** Posée au module 1
(`<LessonProblemCard … compact />`, dans 60 leçons) elle ne menait nulle part : l'élève y arrive de
toute façon. `LessonProblemCard` ne vit plus qu'au sommaire (`LessonIndex`, avec le lien vers le
module de la مسألة). Une leçon nouvelle ne la pose pas dans un module.

**Données, pas de JSX.** `content/problems.js` exporte `PROBLEMS` (un par
module `problem`, dans l'ordre) ; chaque module fait
`<GuidedProblem problem={PROBLEM[id]} … />` (`lessons/common/problems/`).
Source : `addition('exam_style_problem')`.

**Contrat d'une مسألة** (`common/problems/guidedProblem.js › validateProblem`,
appliqué par `scripts/validate-lessons.mjs`) :
- ≥ 2 parties (1), 2), 3)…), l'énoncé entier dans le brief comme sur la copie ;
- sous-étapes, ouvertes une à une, faites dès qu'on y RÉPOND (non bloquant) :
  `sort` (partie 1 seulement, données utiles ET inutiles, dont un nombre
  piège), `choice` translate|conclude, `numeric` compute|answer, `batch`
  (plusieurs phrases à compléter), `solution` ;
- **chaque demande a sa réponse** (2026-10-06) : `asks` liste les demandes de
  la question (au moins une par « ؟ » et par بيّن / احسب / استنتج / عبّر /
  عيّن) ; chaque demande est couverte par une sous-étape `ask: k` qui n'est
  pas la seule rédaction (valeur saisie ou conclusion choisie). « كم حافلة؟ وكم
  مقعدًا؟ » = deux saisies, jamais une ; et c'est VISIBLE dès l'ouverture de la
  partie : sous la question, la liste « المطلوب في هذا السؤال » (cochée avec la
  valeur de l'élève au fil des réponses), et toutes les sous-étapes affichées,
  les fermées grisées 🔒 avec leur consigne et la demande à laquelle elles
  répondent (jamais leur réponse) ;
- chaque partie se termine par `solution` : **`WrittenAnswer`** — l'élève
  RÉDIGE dans une zone dédiée (`MathTextArea` : les seuls symboles de la
  rédaction modèle), le bouton
  « أظهر الإجابة النموذجية » n'est actif qu'après quelques mots, puis la
  rédaction modèle (`lines`, ≥ 2) se révèle UNE LIGNE PAR CLIC sous le texte
  de l'élève, conservé. Rien n'est noté : une rédaction ne se corrige pas par
  mots-clés ;
- chaque nombre est vérifié par calcul dans `content/problems.test.js`.

**RTL.** Un calcul tapé dans une phrase arabe s'inverse (« 268 = 54 × 4 + 52 »
→ « 52 + 4 × 54 = 268 ») ; aucun CSS ne le corrige en milieu de phrase.
`isolateMath` l'isole en LTR (U+2066…U+2069) au fil de la frappe, curseur
conservé. Les montants s'écrivent « دج » dans le texte arabe.

## L'unité 4AM — le câblage réel d'une leçon algérienne (2026-09-20)

Les leçons d'une unité (`lessons/moyen/4am/ansab_al_aadad_wal_hisab/<unité>/` :
`aadad-tabiiya-natiqa/`, depuis le 2026-09-30 `hisab-judhur/`, depuis le 2026-10-01 `hisab-harfi/`, `muadalat-mutarajihat/` et `jumal-muadalatayn/`) ne recopient
plus `routes.jsx` ni `moduleContext.js` : trois fabriques partagées vivent dans
le `_unit/` de chaque unité et sont la manière actuelle de monter une leçon.

**Les fabriques sont COMMUNES à toutes les unités (2026-09-30).** Leur code vit
une seule fois dans `lessons/common/unit/` — `buildModuleContext.js`
(`createModuleContextBuilder(unitMeta)`), `buildLessonRoutes.jsx`
(`createLessonRoutesBuilder({ printSubject })`) et `prepQuestion.jsx` (la forme
« أستعدّ ») — et le `_unit/` d'une unité ne fait que les lier à ses constantes,
en une ligne chacun :

```js
// _unit/moduleContext.js
export const buildModuleContext = createModuleContextBuilder(UNIT_META);   // import * as UNIT_META from './unitMeta'
// _unit/lessonRoutes.jsx
export const buildLessonRoutes = createLessonRoutesBuilder({ printSubject: PRINT_SUBJECT });
// _unit/prepDiagnostic.jsx
export { YES_NO, prepQuestion } from '../../../../../common/unit/prepQuestion';
```

Une nouvelle unité écrit donc son `unitMeta.js` et ces trois lignes, jamais une
seconde fabrique. Les leçons, elles, importent toujours `../_unit/…` : rien n'a
changé pour elles.

**`_unit/unitMeta.js`** — les constantes de l'unité (`UNIT_ID`, `UNIT_TITLE`,
`CHAPTER_ID`, `CHAPTER_TITLE`, `LEVEL_ID`, `GRADE_ID`, `LEVEL_LABEL`,
`GRADE_LABEL`, `PRINT_SUBJECT`, `BASE`) et les deux fabriques de provenance :
`src(elementId, page, section, number)` pour le manuel, `addition(reason)` pour
un ajout de la plateforme.

**`_unit/moduleContext.js`** — `buildModuleContext(LESSON_CONFIG, LESSON_BASE_PATH)`
rend `{ MODULE_CTX, getNavLinks }`. Le `moduleContext.js` d'une leçon est donc
une seule ligne, et non plus vingt. `MODULE_CTX` porte, en plus des champs
historiques, trois clés que le déverrouillage exige :

- `firstModuleNumber` — le premier module de LA leçon, pas 1. Une leçon qui
  ouvre sur « أستعدّ » commence à 0 ; traiter 0 comme « pas le premier »
  réclamerait un module −1 et scellerait la leçon entière.
- `stageByNumber` — l'étape de chaque module, pour que `ContentModule` lise
  celle du module PRÉCÉDENT et qu'un `prerequisite_check` ne barre jamais la
  route.
- `lastModuleNumber` — le vrai dernier numéro, car `modules.length` ne l'est
  plus dès qu'un module 0 existe.

**`_unit/lessonRoutes.jsx`** — `buildLessonRoutes({ config, basePath, moduleFiles,
loadKnowledge, loadIndex })` résout chaque module par le NUMÉRO lu dans son nom
de fichier, enveloppe chaque page dans le fournisseur de carte des
connaissances et l'ancre du cahier, et place `LessonClassroomShell` **au-dessus**
de l'ensemble en route « layout » sans chemin — c'est ce qui fait survivre une
session de mode classe au passage d'un module à l'autre. Le `routes.jsx` d'une
leçon se réduit à un `import.meta.glob` (Vite exige le littéral) et un appel.

Depuis le 2026-09-25, ces enveloppes (`LessonClassroomShell`, et
`LessonPageFrame` = porte de palier → carte des connaissances → page → ancre
du cahier) vivent dans `common/lessonRuntime.jsx`, UN lot paresseux partagé par
toutes les leçons : la fabrique est chargée avec CHAQUE leçon (par la frontière
de routes, `lessons/lessonRouteBoundary.jsx`, depuis le 2026-10-14 — plus par
`App.jsx`), donc rien de lourd ne doit y être importé statiquement. Elle
enregistre aussi la config de la leçon (`rememberLessonConfig`) : les pages de
la leçon la lisent synchrone par `getLoadedLessonConfig`. Une leçon nouvelle n'a rien à faire de
plus. Voir [`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md).

Conséquence pratique : une leçon 4AM obtient le mode classe, le cahier et la
carte des connaissances **sans rien déclarer**. Ne reconstruisez aucun des
trois.

### Vocabulaire — ce que les mots désignent

| Arabe | Désigne | Ne désigne jamais |
|---|---|---|
| **الوحدة** | une **unité du manuel** : un groupe de leçons | un module |
| **المحور** | un **module** d'une leçon | une unité |
| **الدرس** | une leçon | — |
| **الميدان** | un domaine du programme (chapitre) | — |

Le seul emploi interne de « unit » pour autre chose est celui du mode classe
(`moduleUnits`), qui découpe un module présenté en tranches : c'est une notion
de présentation, pas de curriculum.

### Champs ajoutés par l'unité

`kind` (`'lesson' | 'synthesis'`), `unit`, `unitTitle`, `textbookRef`,
`resources[]` et `priorKnowledge` sont décrits en § « Phase 8 additions »
ci-dessus. À noter, vérifié dans le code : `passingScore`, `unitTitle` et le
`textbookRef` du config ne sont lus par personne ; `difficulty` est purement
décoratif ; `requiresLearningPointIds` produit un CONSEIL, jamais un verrou
(Mastery V2) : `LessonIndex` construit `masteryStatusById` depuis le profil de
la leçon et l'utilise pour `softGateHint`, mais `resolveModuleStatus`
(`utils/moduleGate.js`) ne le transmet VOLONTAIREMENT pas à
`getModuleStatus` de `packages/core`, qui, lui, verrouillerait.

### Le module 0 EST un module — la règle, et le défaut qu'elle a corrigé

Un module peut porter le numéro **0** : c'est le cas de « أستعدّ »
(`prerequisite_check`), le premier module de `qasim-adad-tabii` et de
`ikhtizal-kasr`. Toute la chaîne de progression doit donc traiter 0 comme un
numéro ordinaire.

**La règle, exécutable :** on valide la NATURE d'un numéro de module, jamais sa
vérité. `isValidModuleNumber(moduleNumber)` (`@smarter-academy/core`) est le
seul juge — un entier fini ≥ 0, et non les valeurs que `Number()` convertirait
en 0 (`''`, `[]`, `false`).

```js
if (lessonId && moduleNumber) …                    // ❌ le module 0 disparaît
if (lessonId && isValidModuleNumber(moduleNumber)) // ✅
```

**Le défaut qu'elle remplace (2026-09-20, corrigé).** `ModuleLayout` gardait ses
quatre écritures derrière `if (lessonId && moduleNumber && …)` : le module 0
n'était jamais marqué visité ni terminé, les deux leçons concernées plafonnaient
à 80 % et ne pouvaient pas se terminer. Les suites e2e semaient `completed:
['0']` à la main, ce qui masquait exactement le défaut.

**Le premier module n'est pas toujours 1**, et la reprise le sait désormais :
`getNextIncompleteModule(uniqueModules, totalModules, firstModuleNumber)` balaie
l'intervalle réel de la leçon (défaut 1, donc les appelants qui l'ignorent ne
changent pas), et `getFirstModuleNumber(lessonId)` du registre le lui fournit.
Sans cela « continuer » menait au module 1 en sautant أستعدّ.

Verrous : `packages/core/progress/isValidModuleNumber.test.js`,
`getNextIncompleteModule.test.js` et
`apps/web/src/lessons/common/components/moduleZeroProgress.test.js`, qui
interdit le retour du motif dans `ModuleLayout`.
