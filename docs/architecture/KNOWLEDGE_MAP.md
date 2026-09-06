# Knowledge Map Architecture

> **The contract for integrating the cumulative Knowledge Map (« Ma carte des connaissances »)
> into a lesson.** Written for AI coding agents and developers migrating the generated 3e and
> 2nde lessons. Everything below describes code that exists today in the reference lesson — it is
> not a design proposal. Where something is deliberately not built, it is marked
> **NOT IMPLEMENTED**.

Companion docs: `LESSON_CONTRACT.md` (module/stage contract, including the `knowledgeMap: true`
exemption), `LESSON_INTEGRATION_GUIDE.md` (routing, locking, storage), `PROGRESS_MODEL.md`
(completion vs mastery), `INTERACTION_PEDAGOGY.md` (how a module teaches).

---

## Purpose

The Knowledge Map is the student's **evolving record of what they have learned in this lesson**.
It is not a summary of the current module, and not a static revision sheet shipped with the lesson.

It starts empty, gains the contribution of each module as that module is completed, and ends as the
complete lesson knowledge. Its presentations are all fed by the same data:

- **the drawer** (« Ma carte ») — a right-anchored, resizable companion panel, openable from any
  lesson page. *Compact access.*
- **expanded** — the same map filling the lesson's own viewport. *A full knowledge workspace.*
- **print (A4)** — a dedicated structured document. *A mathematical reference.*
- **the module « À retenir »** — the end-of-module snapshot of that same map, in the page.

```text
Module completion → authoritative progress (useProgress) → knowledge contribution
                  → cumulative reducer → drawer | expanded | print | snapshot
```

The architectural rule that motivates everything else:

> A lesson has **one** knowledge source. The « À retenir » is a *presentation* of the map, never a
> second hand-written summary of the same mathematics.

---

## Reference Implementation

**`vecteurs-2nde` is the reference integration**, and `common/knowledge/` is the single shared
implementation. Migrate other lessons by *importing* it — never by copying it.

```text
apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/
├── knowledge.jsx                        ← WHAT each module contributes (the data)
├── lesson.config.js                     ← declares knowledgeMap: true
├── routes.jsx                           ← wraps every page in the provider
├── components/
│   ├── KnowledgeMap.jsx                 ← the drawer UI (generic; do not fork)
│   ├── knowledgeVisuals.jsx             ← SVG mini-figures used by knowledge.jsx
│   ├── knowledgeState.js                ← pure cumulative reducer
│   ├── knowledgeState.test.js           ← unit tests for the reducer
│   ├── KnowledgeProvider.jsx            ← cumulative state + mounts the drawer
│   └── KnowledgeSnapshot.jsx            ← the « À retenir » presentation
└── modules/Module0*.jsx                 ← each passes <KnowledgeSnapshot> as its footer
```

Everything lives **inside the lesson folder** for the ten lessons migrated on 2026-09-05.

**Since 2026-09-06 the generic files also exist as a shared implementation**,
`apps/web/src/lessons/common/knowledge/` (`KnowledgeMap.jsx`, `knowledgeState.js` + test,
`KnowledgeSnapshot.jsx`, `knowledgeVisuals.jsx` with `MiniPlane` / `MiniGraph`, and a
parameterised `KnowledgeProvider.jsx` taking `lessonId`, `knowledge`, `printTitle`,
`printSubject`). The six lessons built that day (`positions-relatives-droites-2nde`,
`fonctions-2nde`, `fonctions-de-reference-2nde`, `signe-fonctions-2nde`,
`variations-extremums-2nde`, `fonction-affine-2nde`) import it:

```jsx
import { LessonKnowledgeProvider } from '../../../../common/knowledge';   // routes.jsx
import { KnowledgeSnapshot } from '../../../../../common/knowledge';       // modules
<LessonKnowledgeProvider lessonId={LESSON_CONFIG.id} knowledge={LESSON_KNOWLEDGE} printTitle="…" printSubject="Mathématiques · 2nde">
```

**Since 2026-09-06 there is exactly one implementation.** The eleven per-lesson
`components/KnowledgeMap.jsx` files (~9 270 duplicated lines) are now one-line **re-exports** of
`common/knowledge/KnowledgeMap`, so their existing `./KnowledgeMap` imports still resolve while
every lesson shares the same drawer, expanded mode, hierarchy and print view. Never reintroduce a
copy.

---

## Architecture

```text
                         LESSON (vecteurs-2nde)
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        ↓                                                   ↓
  knowledge.jsx                                    useProgress(lessonId)
  LESSON_KNOWLEDGE.modules[n] = [items]            completedModules: string[]
        │                                          (localStorage, user-scoped)
        │                                                   │
        │                                          + live unlockModule(n)
        │                                            fired by the snapshot
        └─────────────────────┬─────────────────────────────┘
                              ↓
                  knowledgeState.js
                  cumulativeKnowledge(K, unlocked, newModules)
                              │
                              ↓
                  KnowledgeProvider.jsx
                  { items, unlockModule, unlockAll, openMap, … }
                              │
              ┌───────────────┴────────────────┐
              ↓                                ↓
      KnowledgeMap.jsx                 KnowledgeSnapshot.jsx
      (drawer, portalled to body)      (in-page, module footer)
              │                                │
      ┌───────┴────────┐              ┌────────┴────────┐
      ↓                ↓              ↓                 ↓
  Navigation      Complete        variant="compact"  variant="complete"
   + Print          view          (end of module)    (boss synthèse)
```

One source of truth, one cumulative state, two presentations.

---

## Data Model

### The item

An item is the atomic unit of knowledge. It is a **plain object holding JSX**, declared by the
lesson author in `knowledge.jsx`:

```js
{
  id: 'vecteur-deplacement',   // REQUIRED. Unique across the whole lesson. Identity for dedup.
  type: 'concepts',            // REQUIRED. One of the CATEGORIES ids below.
  title: 'Vecteur',            // REQUIRED. Shown in lists, cards, print, and the snapshot.
  summary: 'Un vecteur décrit un déplacement — indépendamment du point de départ.',
                               // REQUIRED in practice: the snapshot and item detail show it.
  visual: <MiniPlane … />,     // OPTIONAL. JSX figure (SVG). Rendered on screen AND in print.
  body: (<div …>…</div>),      // REQUIRED. The full JSX content: explanation, example, KaTeX.
}
```

Two fields are **added by the reducer, never written by the author**:

| Field | Added by | Meaning |
| --- | --- | --- |
| `module` | `cumulativeKnowledge` | the module number that contributes this item |
| `isNew` | `cumulativeKnowledge` | the item's module was unlocked during this page session |

One optional escape hatch is honored by the drawer: an item with `discovered: false` is filtered
out of `visibleItems`. It is **not used** by `vecteurs-2nde`.

### The categories

Defined once and exported from `components/KnowledgeMap.jsx`. **Do not invent new categories** —
the drawer, the print view and the snapshot all iterate this exact array:

```js
export const CATEGORIES = [
  { id: 'concepts',    emoji: '🔵', label: 'CONCEPTS',    color: 'blue' },
  { id: 'regles',      emoji: '🟠', label: 'RÈGLES',      color: 'orange' },
  { id: 'methodes',    emoji: '🟢', label: 'MÉTHODES',    color: 'green' },
  { id: 'vocabulaire', emoji: '🟣', label: 'VOCABULAIRE', color: 'purple' },
  { id: 'memoriser',   emoji: '🔴', label: 'À MÉMORISER', color: 'red' },
  { id: 'formules',    emoji: '🧮', label: 'FORMULES',    color: 'indigo' },
];
```

`CAT_THEME` maps each `color` to its Tailwind classes (`hdr`, `card`, `badge`) and is exported
alongside. Category ids are French; `item.type` must match one of them exactly.

What each category answers:

| Category | Answers |
| --- | --- |
| `concepts` | What is it? |
| `regles` | What is always true? |
| `methodes` | How do I do it? |
| `vocabulaire` | What word must I know? |
| `memoriser` | The few things to know by heart (⭐ prefix; becomes the print hero) |
| `formules` | The bare mathematical relationships |

A category with zero items is omitted everywhere — never rendered empty. Use a category only when
the content genuinely belongs there; not every module fills every category.

There is **no separate `examples` category**. Examples live inside the `body` of the concept, rule
or method they illustrate, so the example stays attached to its mathematics.

### The hierarchy (`knowledgeStructure.js`)

The six categories are flat, but they already carry an **epistemic role**. `buildStructure(items)`
groups them into three strata so the map reads as a mathematical structure instead of a list of
identical cards. This is **derived, not declared** — lessons keep writing `type` and nothing more:

```text
LESSON
└── STRATUM              ← derived from item.type
    └── CATEGORY         ← CATEGORIES (shown only when a stratum holds more than one)
        └── ITEM         ← one compact row: title + summary
```

| Stratum | Caption | Categories | Answers |
| --- | --- | --- | --- |
| `IDÉES` | De quoi on parle | `concepts`, `vocabulaire` | What am I learning? |
| `PROPRIÉTÉS` | Ce qui est toujours vrai | `regles`, `formules` | What is always true? |
| `MÉTHODES` | Comment s'en servir | `methodes` | How do I use it? |

`memoriser` is **not** a stratum. It is a cross-cutting highlight (`HIGHLIGHT_CAT`) rendered as the
« À RETENIR » band at the top of every representation — and as the print hero. Empty strata,
groups and the band itself are omitted, so a student at module 1 sees a small honest map, never
empty scaffolding.

`progressionByModule(items)` returns `[{ module, count }]` — the `M1 +2 → M2 +4 → …` trail that
makes the cumulative reveal visible.

**Adding a category** means placing it in a stratum in `STRATA`; a category listed nowhere simply
will not render.

---

## Module Contributions

### Where the data lives

One file per lesson: `knowledge.jsx` at the lesson root, exporting a single object keyed by
**module number**:

```js
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [ /* items contributed by module 1 */ ],
    2: [ /* items contributed by module 2 */ ],
    …
    7: [ /* items contributed by module 7 */ ],
  },
};
```

Association with a module is the **numeric key**, matching `LESSON_CONFIG.modules[].number` and the
`Module<NN>` filename number. A module that teaches nothing new is either absent from the object or
maps to `[]` — both are handled.

Modules that contribute nothing in the reference lesson: module 0 (prerequisite diagnostic — it
tests prior knowledge, it does not teach) and module 8 (the final assessment — it evaluates).

### A real example (module 1 of `vecteurs-2nde`)

```jsx
1: [
  {
    id: 'vecteur-deplacement',
    type: 'concepts',
    title: 'Vecteur',
    summary: 'Un vecteur décrit un déplacement — indépendamment du point de départ.',
    visual: (
      <MiniPlane
        width={210} height={145}
        xMin={0} xMax={6} yMin={0} yMax={4}
        showAxes={false}
        points={[
          { x: 1, y: 1, label: 'A', color: '#0369a1', labelPos: 'bl' },
          { x: 4, y: 3, label: 'B', color: '#7c3aed', labelPos: 'tr' },
        ]}
        arrows={[{ from: { x: 1, y: 1 }, to: { x: 4, y: 3 }, color: '#7c3aed', label: 'AB' }]}
      />
    ),
    body: (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Un vecteur est un <strong>déplacement</strong>…</p>
        …
        <div className="text-violet-700 font-bold">
          <MathText>{'$\\overrightarrow{AB}$'}</MathText>
          <span className="text-xs font-normal text-slate-500"> — le vecteur qui mène de A à B</span>
        </div>
        <div className="text-xs text-slate-400 italic">
          📍 Souvenir : le robot sur le sol carrelé — la même recette depuis n'importe quelle case.
        </div>
      </div>
    ),
  },
  { id: 'mem-deplacement', type: 'memoriser', title: '⭐ Un vecteur = un déplacement', … },
],
```

Note the last line of the body: a « 📍 Souvenir » that ties the abstract item back to the
manipulation the student actually performed. This is a convention of the reference lesson, worth
keeping — the map should recall the gesture, not just state the result.

### Duplicate handling

`cumulativeKnowledge` keeps a `Set` of ids and **skips any id already emitted**. The
lowest-numbered module that declares an id wins. So if module 1 introduces `Vecteur` and module 3
also lists it, the student sees one « Vecteur » card, attributed to module 1.

Practical consequence: **an item belongs to the module that first teaches it.** To enrich a concept
later, edit that one item — do not re-declare it under a later module.

### Visuals

Figures used by `knowledge.jsx` live in `components/knowledgeVisuals.jsx` and are self-contained
SVG components: `MiniPlane` (compact coordinate plane with points/arrows), `RightTriangle`
(Pythagoras), `ChaslesArrow` (A → B → C). They take student-space coordinates (y upward) and
convert internally. They are plain SVG on purpose: they render identically on screen and in print.

They do **not** use `CoordPlane` or the lesson's `VectorScene`/`labelLayout` label placer. Map
figures are small, static and hand-placed. Their labels are audited by the e2e layout audit like
any other SVG, so a badly placed label fails the suite (see [Validation](#validation)).

### Mathematical notation

Use the platform's single renderer, `apps/web/src/lessons/common/components/MathText.jsx`
(KaTeX via `react-katex`). Inline `$…$`, display `$$…$$`. **Do not introduce a second math
renderer** and do not store formulas as plain-text approximations.

Backslashes are doubled inside JS strings: `{'$\\overrightarrow{AB}$'}`. A lone backslash silently
produces broken output — never bulk-edit these strings with regex tooling.

---

## Cumulative State

### The reducer

`components/knowledgeState.js` is **pure**: it reads no storage, no context, no React state.

```js
cumulativeKnowledge(lessonKnowledge, unlocked, newModules = []) → item[]
```

- `unlocked` — the module numbers considered learned. Accepts numbers or strings, because
  `useProgress` stores `completedModules` as strings (`['0','1','2']`).
- `newModules` — the subset to flag `isNew`.
- Returns items ordered **by ascending module, then by declaration order**, each carrying `module`
  and `isNew`, deduplicated by `id`.

Membership is a **set test, not a threshold**: unlocking modules 1 and 3 yields modules 1 and 3's
items, not 1-2-3. Skipping a module never back-fills the one you skipped.

Also exported: `knowledgeModuleNumbers(K)` (sorted numeric keys), `toModuleSet(list)`
(normalizing), `allKnowledge(K)` (everything, for consistency tests), and
`groupByCategory(items, CATEGORIES)` (groups in category order, dropping empty groups).

### The progression

```text
lesson start            → map is EMPTY (no prerequisite knowledge is pre-loaded)
module 1 completed      → M1 items
module 2 completed      → M1 + M2
…
last content module     → complete lesson knowledge
boss synthèse reached   → complete lesson knowledge (unlockAll)
```

The reference lesson deliberately starts with an **empty map**, and the drawer shows an explicit
empty state (« Ta carte est encore vide. »). The prerequisite diagnostic (module 0) contributes
nothing. Pre-seeding a lesson's map with prior-year knowledge is **NOT IMPLEMENTED**; if a lesson
genuinely needs it, add a contribution under a module the student has actually done, never a
synthetic "module 0 knowledge" the student never saw.

---

## Module Completion

### The exact trigger

Knowledge becomes available when a module is **completed** — never when it is merely opened.

Two inputs are unioned by `KnowledgeProvider`:

1. **Persisted** — `useProgress(LESSON_CONFIG.id).completedModules`, read from user-scoped
   localStorage (`u_<userId>_smarter_lesson_<lessonId>`). This is the existing platform progress
   system; the Knowledge Map adds nothing to it and writes nothing to it.

2. **Live** — `unlockModule(n)`, called from `KnowledgeSnapshot`'s mount effect.

### Why the live part exists

`useProgress` instances do **not** share React state and do **not** subscribe to storage. Several
instances coexist on a page (`ModuleLayout` and the provider). When `ModuleLayout` writes
`markModuleCompleted`, the provider's own instance does not re-render, so without the live signal
the drawer would only catch up on the next navigation.

The live signal is safe because it is bound to **exactly the same condition** as the persisted one.
`ContentModule` renders its `footer` slot only when `allDone` is true, and `ModuleLayout` calls
`markModuleCompleted` under that same `allDone`. So:

```text
all steps done
   ├─→ ModuleLayout    → markModuleCompleted(n)   → localStorage (persisted)
   └─→ ContentModule   → renders footer
                        → <KnowledgeSnapshot moduleNumber={n}> mounts
                        → unlockModule(n)          → live state (this page only)
```

There is **no second progress system**. `liveUnlocked` is page-local React state; on the next
navigation the provider re-reads storage and reaches the same conclusion.

`allDone` is `alreadyCompleted || steps.every(s => s.done)`, so re-visiting a finished module
re-renders the footer and re-unlocks harmlessly (`unlockModule` is idempotent).

### `unlockAll`

`unlockAll()` marks every module in `LESSON_KNOWLEDGE` unlocked at once. It is called only by
`<KnowledgeSnapshot complete />`, used as the final assessment's synthèse — the point at which the
whole lesson has been worked through and evaluated.

### Interaction with locking

The Knowledge Map is a **read-only consumer** of progress. It never unlocks a module, never changes
`sequentialUnlock` behaviour, and never writes progress. A student who jumps straight to the
always-reachable evaluation module with only module 1 done sees a map holding only module 1's
knowledge — verified by the e2e suite.

---

## À Retenir Integration

### The principle

Before this integration, every content module ended with a hand-written `<Feedback tone="ok">`
paragraph beginning « **Retenons.** », and a dedicated module 7 « À retenir » held a hand-written
grid of the same eight formulas. That was three copies of the same mathematics.

Now:

```text
              knowledge.jsx  (the only place the mathematics is written)
                     │
                     ↓
             cumulative state
                     │
          ┌──────────┴───────────┐
          ↓                      ↓
    drawer « Ma carte »    <KnowledgeSnapshot>  ← rendered as the module footer
```

### How a module wires it

```jsx
// modules/Module04EnchainerLesDeplacements.jsx
import KnowledgeSnapshot from '../components/KnowledgeSnapshot';

<ContentModule
  …
  footer={<KnowledgeSnapshot moduleNumber={4} />}
/>
```

A module that must add a sentence bridging to the next module passes it as children — this is for
narrative continuity, **not** for restating knowledge:

```jsx
footer={
  <KnowledgeSnapshot moduleNumber={1}>
    <strong>Le mot juste.</strong> Cette recette … les mathématiciens l'appellent un
    <strong>vecteur</strong> … Module suivant : on le promène.
  </KnowledgeSnapshot>
}
```

### The two variants

| Prop | Presentation | Used by |
| --- | --- | --- |
| `variant="compact"` (default) | Grouped by category. Items from **this** module get a white card with title + summary + a « nouveau » pill. Earlier items are grey chips (title only). Header counts total and new. Button « Ouvrir ma carte ». | every content module's footer |
| `variant="complete" complete` | Renders the drawer's own `<CompleteView items printable={false} />` inline: every card, with visuals and KaTeX. Also calls `unlockAll()`. Button « Ouvrir et imprimer ma carte ». | the final assessment's `synthese` |

The compact variant deliberately shows **only the new items in detail**. The full detail is one
click away in the drawer, so the page does not become a wall of definitions.

`KnowledgeSnapshot` props, complete list:

```js
{
  moduleNumber,        // number — whose « À retenir » this is; drives the detailed/new items
  unlock = true,       // boolean — call unlockModule(moduleNumber) on mount
  complete = false,    // boolean — call unlockAll() on mount instead
  variant = 'compact', // 'compact' | 'complete'
  children,            // ReactNode — optional transition sentence, rendered under a divider
}
```

Set `unlock={false}` to display the map without contributing anything (e.g. a read-only
recapitulation placed mid-lesson).

### The removed formalization module

Because every module now ends on the current map and the assessment ends on the complete map, a
separate « À retenir » module is redundant. `vecteurs-2nde` **has none**. Its `lesson.config.js`
declares:

```js
knowledgeMap: true,
```

`scripts/validate-lessons.mjs` reads this literal and skips the otherwise-required `formalization`
stage for that lesson (see `LESSON_CONTRACT.md`). Every other stage rule is unchanged.

---

## Bricks — knowledge at the moment it is established

The « À retenir » closes a module; a **brick** opens the knowledge, mid-module, at the exact point
the student has earned it. Both render the same item from `knowledge.jsx`: there is still one source.

```jsx
import { KnowledgeBrick } from '<rel>/common/kit';

{ranOnce && (
  <KnowledgeBrick id="image" variant="new" lead="Tu as donné 4, il est sorti 9.">
    <NumericQuestion prompt="…" requires={['image']} … />
  </KnowledgeBrick>
)}
```

| Prop | Role |
| --- | --- |
| `id` | the `knowledge.jsx` item to render — and the key the dependency audit uses |
| `establishes` | extra concept ids this brick makes available to `requires` (default `[id]`) |
| `variant` | `'new'` (dark, a new notion) · `'rappel'` (light, just-in-time support) · `'enrichment'` (dashed, optional) |
| `lead` | one sentence tying the item to the gesture just performed |
| `unlock` | call `unlockItem(id)` on mount (default true) |
| `compact` | hide the item's `visual` in dense steps |
| `children` | the immediate try-it: a small question or manipulation |

On mount the brick calls `unlockItem(id)`, so the item enters the map **there**, not at the end of
the module. That is the point: the student watches their map grow as they learn. The unlock is
page-local state, with the same lifetime as the module's own step state — no new storage key, and
module completion still persists the whole module as before.

Why this exists: a map that only fills at the end of a module is a summary. Distributed across the
journey, it is the record of what the student has established so far — and the thing that makes
« I just learned this, and now I can use it » literally visible. See `KNOWLEDGE_DEPENDENCY.md`.

Bricks are the reason an item's text must be valid **at its position**: an example that uses
notation from a later module is now a real spoiler on screen, not just a theoretical one.

---

## Screen UI

### Mounting

The drawer is mounted **once per lesson page** by `LessonKnowledgeProvider`, which `routes.jsx`
wraps around every route element (lesson index and every module):

```jsx
function withSuspense(Component) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LessonKnowledgeProvider>
        <Component />
      </LessonKnowledgeProvider>
    </Suspense>
  );
}
```

`LessonKnowledgeProvider` renders `<KnowledgeMapTrigger items={items} open onOpenChange />` after
its children. `KnowledgeMapTrigger` renders the floating button in the page and **portals the panel
to `document.body`** (`ReactDOM.createPortal`) — required so the print CSS can isolate it.

Do **not** mount the trigger inside a module or the lesson index; one provider per page is the
whole mounting story.

### The trigger button

```text
fixed bottom-20 right-6 z-40   ·   data-km-trigger="true"   ·   data-km-noprint="true"
```

`bottom-20`, not `bottom-6`: the visitor site's command-palette button (`#command-palette-trigger`)
sits at `fixed bottom-6 right-6 z-40` in the same corner, and the student space has a `h-16` mobile
bottom nav. At `bottom-6` the trigger is unclickable in both shells.

### Layout model — the lesson viewport

Everything below rests on one idea: the map never invents its own page size. It borrows the
rectangle the **lesson** already occupies.

```text
Application
┌──────────────────────────────────────────────┐
│ Global header / sidebar  (never covered)     │
├──────────────────────────────────────────────┤
│                                              │
│   LESSON VIEWPORT   ──  Lesson               │
│                     └─  Knowledge Map        │
│                         (drawer | expanded)  │
└──────────────────────────────────────────────┘
```

`useLessonViewport.js` measures that rectangle and is the single source of geometry for both modes.

**Why it measures `<main>` and not the header + sidebar.** Lesson routes go through `CourseLayout`,
which picks a shell from the auth state, and the two shells put their chrome in different places:

| Shell | Desktop chrome | `#app-header` | Lesson viewport |
| --- | --- | --- | --- |
| authenticated → `StudentLayout` | fixed sidebar `w-64` / `w-20` collapsed | **absent** (`lg:hidden`) | `left: 256/80, top: 0` |
| anonymous → `MainLayout` | fixed top navbar | present, 64 px | `left: 0, top: 64` |
| either, mobile | top bar 56 px + bottom nav 64 px | present, 56 px | `top: 56, bottom: 64` |

All four insets are **already encoded in `<main>`'s padding** (`pt-14 pb-20 lg:pt-0 lg:pb-0`,
`lg:pl-64` / `lg:pl-20`) — that padding *is* the constraint the lesson itself lives inside. So the
hook reads `<main>`'s padding box rather than reconstructing it from hard-coded constants, and gets
the right answer in every shell and breakpoint for free.

`#app-header` is still measured (`ResizeObserver`) and still sets `top` where it exists — the
documented anchoring is preserved, not replaced. A `lg:hidden` header measures 0 and needs no
breakpoint branch. A `ResizeObserver` also watches `<main>`, so the sidebar's `w-64 ⇄ w-20`
animation and the visitor navbar's scroll-resize both re-measure automatically.

### Panel geometry — two modes

`#km-root` is `position: fixed` in both modes. The geometry is **animated by framer-motion**, never
written as inline styles that would swap instantly (`top / left / width / height` as numbers, so
the two states interpolate):

```js
drawerGeom   = { top: vpTop, left: rightEdge - width, width, height: vpHeight }   // right edge fixed
expandedGeom = { top: vpTop, left: vpLeft,            width: vpWidth, height: vpHeight }
```

| | Drawer | Expanded |
| --- | --- | --- |
| Right edge | **fixed** at the lesson viewport's right edge | lesson viewport right edge |
| Left edge | **draggable** — the only resize handle | lesson viewport left edge |
| Width | `320 … min(available·0.95, 800)`; on ≤ 640 px the full width is allowed | 100 % of lesson viewport |
| Height | lesson viewport height; shrinks from the **bottom**, top never moves | 100 % of lesson viewport |
| Resize handle | present | hidden (nothing to resize) |
| Collapse (chevron) | available | hidden (drawer-only state) |

**Expanded is an application layout mode, not browser fullscreen.** The Fullscreen API is never
called; the student stays inside Smarter Academy, and the global header/sidebar stay visible and
correctly positioned. The map replaces the *lesson content area* only.

Measured (drawer 400 px, expanded, per shell):

| Shell / viewport | Drawer x · w | Expanded x · w · y | Header covered |
| --- | --- | --- | --- |
| anon 1280 × 900 | 880 · 400 | 0 · 1280 · 64 | no |
| auth 1440 × 900 (sidebar 256) | 1040 · 400 | 256 · 1184 · 0 | no |
| auth 1440, sidebar collapsed | 1040 · 400 | 80 · 1360 · 0 | no |
| auth mobile 375 × 667 | 0 · 375 | 0 · 375 · 56 | no |

### Transitions

Open, close and the drawer ⇄ expanded switch are all animated (spring, `damping 30 / stiffness
260`); nothing jumps:

```text
open  drawer    x: 110% → 0            (slides in from the right edge)
open  expanded  opacity + scale .985→1 (it comes from no edge; it TAKES the lesson's place)
switch          all four edges interpolate   400px → … → 1280px  (~10 sampled steps, not 1)
close           reverses the mode's own entry, then unmounts
```

Returning to the drawer restores the **remembered width** (`knowledgeMapWidth`); the expanded mode
never overwrites it.

### Responsive rules

| | Drawer | Expanded |
| --- | --- | --- |
| Desktop / laptop | resizable 320–800 px, lesson stays readable beside it | fills the lesson viewport; content laid out in 2–3 columns (`≥1100 px → 3`, `≥720 px → 2`) |
| Tablet | same, clamped to 95 % of available width | same, 2 columns |
| Mobile (≤ 640 px) | may span the full width — a desktop width is **not** preserved if it would make the lesson unusable | full lesson viewport, 1 column |

The expand control is available at every width: on mobile "expanded" still means *the whole lesson
viewport available on that device*.

### Header controls

🧠 « MA CARTE » + a live count, then an explicit **presentation switcher** and the close button:

```text
[ ▣ Tiroir | ⛶ Plein écran ]   ⌃(replier, drawer only)   ✕
    data-km-view="drawer" / "expanded"      data-km-minimize
```

The switcher is a labelled `role="radiogroup"` with the active state highlighted. It replaced two
unlabelled icon buttons that both used `Maximize2` (one meant "fullscreen", the other "unfold") and
were routinely confused. Labels collapse to icons only below `sm`. The collapse chevron exists only
in drawer mode and no longer shares an icon with expand.

`Escape` steps back one level at a time: detail view → expanded → close.

`aria-modal="false"`, `role="dialog"`: the map is a **companion**, not a blocking modal. There is
no backdrop and the lesson stays interactive underneath — intentional, so a student can consult the
map while working.

### Empty state

When `visibleItems.length === 0` the content area renders a 🧭 empty state (`data-km-empty`)
instead of either view. This is what a student sees before completing module 1.

---

## Navigation Mode

The default mode (persisted; see [Persistence](#persistence)). A **structured outline**, not a card
grid: hierarchy is carried by rules, indentation and typography rather than by nested boxes.

```text
NavigationView
├── StructuredView                       ← the cumulative structure, always fully visible
│   ├── HighlightBand         « À RETENIR »   (memoriser items, pinned first)
│   ├── stratum: IDÉES        rule + label + caption + count
│   │   └── category group    → KnowledgeRow ·  title + one-line summary
│   ├── stratum: PROPRIÉTÉS
│   ├── stratum: MÉTHODES
│   └── progression trail     M1 +2 → M2 +4 → M3 +8
├── ItemDetailView            ← one item: back link, title badge, summary, visual, body
└── CategoryDetailView        ← one category: back link, header, all its CompleteCards
```

A knowledge item is a **row**, not a card: a coloured dot, its title, and its summary underneath.
Clicking one slides in its detail (framer-motion, 0.18 s); « Retour à la carte » returns to the
structure. Items unlocked during this page session show an indigo dot plus a screen-reader-only
« (nouveau) », and carry `data-km-item` / `data-km-new`.

`ItemDetailView` also supports an optional `item.manipulationRef` (`{ title, href }`) block —
« 🔗 Tu l'as découvert avec ». It is wired in the component but **no item uses it today**.

Test hooks: `data-km-structured`, `data-km-stratum`, `data-km-group`, `data-km-highlight`,
`data-km-progression`.

---

## Complete Mode

The same hierarchy as navigation mode, but every item is rendered in full (`CompleteCard`: title,
summary, visual, body with KaTeX). For **reading or printing everything**, where navigation mode is
for **finding one thing**.

```jsx
export function CompleteView({ items, printable = true, columns = 1 })
```

`CompleteCard` deliberately has **no coloured frame, border or shadow** — hierarchy comes from the
stratum rule and typography. This is what keeps a 29-item map from reading as 29 competing boxes.

`printable={false}` hides the « Imprimer ma carte » button and the footer line — used when the view
is embedded in a page (the boss synthèse) rather than shown in the drawer, because printing belongs
to the drawer.

`columns` comes from the panel: 1 in the drawer, 2 when expanded (rich KaTeX/SVG cards do not split
well beyond two columns, so complete mode is capped at 2 while navigation mode may use 3).

---

## Resizing

**Invariant, do not break:**

```text
RIGHT EDGE → FIXED   (flush with the LESSON VIEWPORT's right edge)
LEFT EDGE  → the resize handle; dragging it moves the left edge only
TOP EDGE   → fixed under the header; resizing never moves it
NO VERTICAL RESIZE
```

This is a right-anchored drawer, **not** a centered panel. Implementation:

- the handle is `absolute left-0 top-0 bottom-0 w-6 -translate-x-1/2 cursor-col-resize`,
  `touch-none`, `aria-hidden`, `data-km-noprint`; it is **not rendered in expanded mode**;
- it uses **pointer events** (`onPointerDown/Move/Up/Cancel` + `setPointerCapture`), so mouse, pen
  and touch drags all work;
- new width is `(window.innerWidth - vpRight) - e.clientX` — the distance from the pointer to the
  **lesson viewport's** right edge, not the window's (they differ whenever the shell insets it);
- clamped to `min(320, available)` … `min(available · 0.95, 800)`, where `available` is the lesson
  viewport width. Below 640 px the full width is allowed, since the drawer already opens full-width
  there and a 95 % cap would only make it impossible to drag back to the edge;
- additionally clamped at render by `maxWidth: '100vw'` and `Math.min(width, vpWidth)`, which
  matters when a width stored on a desktop session is replayed on a phone.

The width is persisted (`knowledgeMapWidth`) and **survives a round trip through expanded mode** —
expanding never overwrites it.

---

## Height Behavior

**Invariant:** the top edge never moves. The panel grows and shrinks **from the bottom**.

Height is animated to the lesson viewport's height (`vpHeight`), so:

- **short content** — the `flex flex-col` box is as tall as its content; the bottom edge rises
  toward the top, which stays anchored. Content is never stretched to fill empty space.
- **tall content** — the panel stops at the lesson viewport height. The header and mode switcher
  are `shrink-0`; only the content area (`flex-1 overflow-y-auto overscroll-contain`,
  `data-km-scroll`) scrolls. `overscroll-contain` stops scroll chaining into the lesson behind it.
- **collapsed** — height animates to 56 px, the header bar only, still anchored at the top.
  Measured: 836 → 56 → 836 px, restoring exactly. Drawer-only; expanding clears the flag.

---

## Header Integration (`#app-header`)

The panel must sit **under the application header**, not beneath an arbitrary offset, because the
two app shells put their chrome in different places (see
[Layout model](#layout-model--the-lesson-viewport)).

`useLessonViewport.js` reads the anchor by id and observes it, alongside `<main>`:

```js
const header = document.getElementById('app-header');   // 0 when lg:hidden — no branch needed
const ro = new ResizeObserver(measure);
ro.observe(header); ro.observe(document.querySelector('main'));
```

Observing both means a header that grows/shrinks on scroll **and** the student sidebar's
`w-64 ⇄ w-20` animation both re-position the panel live. `transitionend` on `padding-left` catches
the end of that 300 ms sidebar animation.

| File | Element | Notes |
| --- | --- | --- |
| `apps/web/src/components/navigation/Navbar.jsx` | `<motion.nav id="app-header" className="fixed top-0 … z-50">` | visitor shell; 64 px content row |
| `apps/web/src/components/student/StudentNavbar.jsx` | `<header id="app-header" className="lg:hidden fixed top-0 … h-14">` | student shell; **mobile-only** |

The student space uses a fixed **left sidebar** on desktop and has no top header there, so
`#app-header` is `lg:hidden`: below `lg` it measures 56 px, at `lg`+ it measures 0 and the sidebar
inset comes from `<main>`'s padding instead. That is intended, not a bug.

If both are missing, the hook falls back to the window box — a safe degradation.

**Do not** remove these ids, rename them, hard-code a header height, or anchor the map to any other
element.

---

## Print / A4

Browser printing with CSS only. There is **no server-side PDF generation, no PDF library, and no
second export path** — `window.print()` is the entire mechanism. **Do not add one.**

```text
drawer open  →  « Imprimer ma carte » (or ⌘P)  →  @media print  →  A4 portrait document
```

### How the isolation works

`PRINT_CSS` is a template string in `KnowledgeMap.jsx`, injected once into `<head>` as
`<style id="km-print-styles">` by `KnowledgeMapTrigger`. Because the panel is portalled to `body`,
one rule isolates it completely:

```css
body > *:not(#km-root) { display: none !important; }
```

Then `#km-root` is flattened back into a static document (`position: static`, `width: 100%`, no
`max-height`, no shadow, no radius, no transform, `opacity: 1`) — necessary because framer-motion
leaves inline transform/opacity on it.

### Screen vs print swap

Two sibling subtrees always exist in the DOM; the media query chooses:

| Element | Screen | Print |
| --- | --- | --- |
| `.sa-screen-view` (navigation or complete) | visible | `display: none` |
| `.sa-print-view` (`<PrintView>`) | `hidden` | `display: block` |
| anything `data-km-noprint` (header, mode switcher, resize handle, trigger, print button, « nouveau » pills) | visible | `display: none` |

Keeping print markup separate from screen markup is deliberate: **do not** try to restyle the
screen views for print.

### A4 geometry and pagination

- `@page { size: A4 portrait; margin: 12mm 14mm; }`
- `PrintView` is `max-w-[210mm] mx-auto`.
- Type is re-declared in points (`text-xs → 8pt`, `text-sm → 9pt`, body `9pt`, hero `10pt`).
- Colors are forced with `-webkit-print-color-adjust: exact`.
- Pagination is by break-avoidance, not fixed pages: `.print-section`, `.print-card`,
  `.print-example`, `.print-equation-group` get `break-inside: avoid`; headings get
  `break-after: avoid`. Content flows to as many pages as it needs.

### Print layout

The printed sheet carries the **same hierarchy as the screen** — it is a structured mathematical
reference, not a screenshot of the drawer:

```text
┌─────────────────────────────────────────────┐
│ LES VECTEURS            SMARTER ACADEMY     │  header (title/subject are props)
│ Ma carte de connaissances  Mathématiques·2nde│
├─────────────────────────────────────────────┤
│ ⭐ À RETENIR  (PrintHero — the 'memoriser'   │  hero band, full width
│    items, bodies only, pink frame)          │
├──────────────────────┬──────────────────────┤
│ IDÉES  De quoi…      │ MÉTHODES  Comment…   │  strata, `columns-1 md:columns-2`
│   CONCEPTS           │   (rule + caption,   │  category subheads appear only
│   VOCABULAIRE        │    then its items)   │  when a stratum holds several
│ PROPRIÉTÉS  Ce qui…  │                      │
│   RÈGLES · FORMULES  │                      │
├─────────────────────────────────────────────┤
│ SMARTER ACADEMY                          01 │  footer (page number hardcoded)
└─────────────────────────────────────────────┘
```

Each stratum, group and card is `break-inside: avoid`, so a concept never splits across an A4 page
boundary. Verified: 6 pages for the full 29-item Vecteurs map, hierarchy and KaTeX intact.

`PrintView` receives the **same `visibleItems`** as the screen views, so the printout is the map as
it stands at that moment. Printing after module 6 yields the 26 items known then, not the lesson's
29. Visuals and KaTeX print as-is.

**Print header, now props:** `PrintView` takes `printTitle` and `printSubject`, passed down by
`KnowledgeMapTrigger`; each lesson supplies them from its `KnowledgeProvider` (e.g.
`printTitle="LES VECTEURS"`, `printSubject="Mathématiques · 2nde"`). The footer page number
(`01`) is still a literal.

---

## Responsive Behavior

One component at every width — there is **no separate mobile component**. What changes is the
lesson viewport the map is measured against, and the column count.

| | Desktop (≥ 1024) | Tablet (~768–1023) | Mobile (< 768) |
| --- | --- | --- | --- |
| Drawer | right-anchored, stored width (default 400 px) | identical, clamped to 95 % of available | clamped to the viewport; at 375 px it spans the full width |
| Expanded | fills the lesson viewport (inset by the sidebar when authenticated) | same | same — the whole lesson area on that device |
| Columns | expanded: 3 at ≥ 1100 px, 2 at ≥ 720 px (complete mode caps at 2) | 2 | 1 |
| Top anchor | lesson viewport top: 0 in the student shell (sidebar), 64 px in the visitor shell | under the header | under the header (56–64 px) |
| Overlay | none — companion panel, page stays interactive | none | none; the panel covers the page at small widths but does not block it |
| Resize | pointer drag on the left edge | same | same handle, `touch-none`; full width is reachable |
| Switcher labels | « Tiroir » / « Plein écran » | same | icons only (labels hidden below `sm`) |
| Trigger | `bottom-20 right-6`, clear of the command palette | same | same, clear of the `h-16` student bottom nav |

A desktop width is **never** preserved at the cost of making the lesson unusable: the clamp is
always relative to the width actually available.

The e2e suite asserts, at six shell/breakpoint combinations, that the drawer's right edge is flush
with the lesson viewport, the top is anchored, expanded matches the lesson viewport on all four
edges, the header is never covered, and the drawer width is restored on return.

---

## Persistence

Three keys, all optional and all guarded by `try/catch`:

| Key | Storage | Written by | Purpose |
| --- | --- | --- | --- |
| `knowledgeMapWidth` | raw `localStorage` | `KnowledgeMap` | drawer width, per browser |
| `knowledgeMapViewMode` | raw `localStorage` | `KnowledgeMapTrigger` | `'navigation'` \| `'complete'` |
| `knowledgeMapExpanded` | raw `localStorage` | `KnowledgeMapTrigger` | `'true'` \| `'false'` — drawer vs expanded; kept separate from the width so returning to the drawer restores it |
| `smarter_lesson_<lessonId>` | **scoped** storage (`scopedStorage`, `u_<userId>_…`) | `useProgress` — *not* the map | `completedModules`, the real progress |

The first two are UI preferences, deliberately unscoped and shared across lessons. Knowledge state
itself is **never persisted separately** — it is always derived from module progress, so there is
exactly one thing to keep in sync.

---

## Integration Guide

Steps to add the Knowledge Map to another lesson. Nothing here requires touching
`apps/web/src/components/` or `apps/web/src/lessons/common/`.

### Step 1 — Import the shared implementation (do **not** copy it)

There is exactly **one** Knowledge Map, in `apps/web/src/lessons/common/knowledge/`. A lesson
imports it; it never forks it:

```jsx
import { LessonKnowledgeProvider, KnowledgeSnapshot } from '<rel>/common/knowledge';
```

```text
common/knowledge/
├── KnowledgeMap.jsx         drawer + expanded UI, print view   ← the only implementation
├── useLessonViewport.js     lesson-viewport geometry
├── knowledgeStructure.js    strata / hierarchy derivation
├── knowledgeState.js        cumulative reducer  (+ .test.js)
├── KnowledgeProvider.jsx    parameterised: lessonId, knowledge, printTitle, printSubject
├── KnowledgeSnapshot.jsx    « À retenir »
└── knowledgeVisuals.jsx     shared SVG figures (optional; write lesson-specific ones locally)
```

The provider is parameterised, so nothing needs editing per lesson — pass `lessonId`, `knowledge`,
`printTitle` and `printSubject` as props.

> **History.** Ten 2nde lessons once held byte-identical copies of `KnowledgeMap.jsx`. Since
> 2026-09-06 those files are one-line re-exports of `common/knowledge/KnowledgeMap`, so existing
> `./KnowledgeMap` imports still resolve while there is a single implementation to improve. Never
> reintroduce a copy: an improvement to sizing, hierarchy or print must reach every lesson at once.

Map figures are audited by the e2e layout audit like any other SVG ≥ 200 px wide: a tick label
that collides with a point or arrow label fails the suite. `showAxes={false}` is the usual fix
when a point sits on an axis.

### Step 2 — Write `knowledge.jsx`

For each module, list what a student genuinely knows **after finishing that module and nothing
later**. Read the module's steps and its old « Retenons » footer for material; re-check every
example against the notation available at that point.

```jsx
export const LESSON_KNOWLEDGE = { modules: { 1: [ … ], 2: [ … ], … } };
```

Give each item a stable unique `id`, a `type` from `CATEGORIES`, `title`, `summary`, `body`, and a
`visual` when a figure helps.

### Step 3 — Declare the config flag

In `lesson.config.js`:

```js
knowledgeMap: true,
```

If the lesson has a dedicated « À retenir » (`formalization`) module, decide explicitly: keeping it
is allowed; removing it requires renumbering the following modules (`number`, `path`, filename,
`getNavLinks(n)`, `moduleNumber`, `knowledge.jsx` keys, e2e seeds) and realigning
`estimatedDurationMin` with `coursesData.js`.

### Step 4 — Wrap the routes

In `routes.jsx`, wrap the element of every route (index + modules) in `<LessonKnowledgeProvider>`.
This both supplies the state and mounts the drawer:

```jsx
<LessonKnowledgeProvider
  lessonId={LESSON_CONFIG.id} knowledge={LESSON_KNOWLEDGE}
  printTitle="LES VECTEURS" printSubject="Mathématiques · 2nde">
  {element}
</LessonKnowledgeProvider>
```

### Step 5 — Replace each module's « À retenir »

In every content module, delete the hand-written summary footer and pass the snapshot:

```jsx
footer={<KnowledgeSnapshot moduleNumber={N} />}
```

Keep at most a one-sentence narrative bridge as children.

### Step 6 — Point the final synthèse at the complete map

In the `BossFinal` module:

```jsx
synthese={<KnowledgeSnapshot variant="complete" complete />}
```

Delete the hand-written synthèse component and its now-unused imports.

### Step 7 — Verify progression

Unit-test the reducer (copy `knowledgeState.test.js`), then check in the browser that the map is
empty at lesson start, gains exactly module N's items when module N is completed, and never shows a
later module's items.

### Step 8 — Verify print

Open the drawer, switch to « Vue complète », print (or emulate print media). Confirm the page shows
only the map, the ⭐ hero comes first, and the content matches the current progress.

### Step 9 — Verify responsive and no regressions

Check desktop and 375 px: no horizontal scroll, right edge flush, top under the header, trigger
clickable. Re-run the lesson's e2e suite; module navigation, locking and completion must be
unchanged.

---

## Migration Rules

1. **Reuse the existing Knowledge Map.** Copy `KnowledgeMap.jsx` as-is; adapt only the two
   hardcoded print strings. Do not redesign the drawer, resize, navigation or print layout.
2. **One Knowledge Map per lesson.** Never a second parallel map, panel or summary widget.
3. **Knowledge is revealed progressively.** A module's items appear only once that module is
   completed.
4. **Knowledge comes from what the module taught.** An item must correspond to something the
   student did or was told in that module.
5. **One source of truth.** All knowledge text lives in `knowledge.jsx`. Nothing is retyped in a
   module, in the drawer, or in the print view.
6. **No independent « À retenir ».** The module footer is `<KnowledgeSnapshot>`. If you feel the
   need to add explanatory prose there, it belongs in the item's `body`.
7. **No spoilers.** An item must not use notation or results introduced later — check every
   example, not just the statement.
8. **Preserve mathematical notation.** `MathText`/KaTeX only, backslashes doubled, no plain-text
   formulas, no second renderer.
9. **Keep screen and print separate.** `.sa-screen-view` / `.sa-print-view` / `data-km-noprint`.
   No PDF backend.
10. **Preserve the drawer invariants.** Right edge fixed, left edge resizes, top anchored under
    `#app-header`, panel shrinks from the bottom.
11. **Reuse the existing completion mechanism.** `useProgress` + the footer's `allDone` render.
    Never add a second progress store or a new storage key for knowledge.
12. **Never write progress from the map.** The map reads progress; it does not unlock modules.

---

## Invariants

Breaking any of these breaks the system:

```text
DATA
  item.id            unique within the lesson; first declaring module wins on duplicates
  item.type          ∈ CATEGORIES ids  (concepts|regles|methodes|vocabulaire|memoriser|formules)
  knowledge.jsx      the ONLY place lesson knowledge text is written
  module/isNew       written by the reducer only, never by the author

STATE
  knowledgeState.js  stays PURE — no storage, no context, no React
  unlock trigger     module COMPLETED (persisted completedModules ∪ live unlockModule)
                     OR a <KnowledgeBrick id> establishing the item has RENDERED (live unlockItem)
  live unlock        fired from the footer snapshot (same allDone as ModuleLayout's
                     markModuleCompleted) or from a brick inside a step the student has reached
  item unlock        page-local, exactly the lifetime of the module's step state
  no knowledge is ever persisted separately from module progress

LAYOUT
  ONE implementation common/knowledge/KnowledgeMap.jsx — never fork or copy it
  lesson viewport    measured from <main>'s padding box + #app-header (useLessonViewport)
  drawer right edge  flush with the LESSON VIEWPORT's right edge, fixed
  drawer left edge   the only resize handle; 320px ≤ width ≤ min(available·0.95, 800px)
  expanded           == the lesson viewport on all four edges; NEVER the browser Fullscreen API,
                     never covers the global header or sidebar
  top edge           never moves on resize; tracked by ResizeObserver (header AND main)
  height             grows/shrinks from the BOTTOM; content area scrolls; no vertical resize
  width memory       knowledgeMapWidth survives a trip through expanded mode
  panel              portalled to document.body (print isolation depends on it)
  trigger            bottom-20 right-6 (bottom-6 collides with the command palette / bottom nav)

HIERARCHY
  strata             derived by knowledgeStructure.js from item.type — lessons declare nothing more
  memoriser          a cross-cutting « À RETENIR » highlight, not a stratum
  empty groups       omitted everywhere; never render empty scaffolding
  cards              CompleteCard has no frame/shadow; hierarchy comes from rules + typography

PRINT
  browser print only; no PDF backend
  body > *:not(#km-root) { display: none }
  .sa-screen-view hidden, .sa-print-view shown, data-km-noprint hidden
  printed content = the CURRENT cumulative items
  print carries the SAME hierarchy as the screen (strata + À RETENIR hero), break-inside: avoid
```

---

## Common Mistakes

- **Creating a second Knowledge Map component**, or copying `KnowledgeMap.jsx` into a lesson,
  instead of importing `common/knowledge`. Copies drift, and a sizing or hierarchy fix then has to
  be applied eleven times. Import it.
- **Duplicating knowledge**: leaving the old « Retenons » footer in place next to the snapshot, or
  retyping a formula in a module because it "reads better there".
- **Showing the complete map from the start** by passing all modules as unlocked, or by declaring
  everything under module 1.
- **Unlocking on module open** (a `useEffect` on mount of the module page) instead of on completion.
- **Spoilers**: giving an early item a coordinate/notation example the student meets three modules
  later. Move the example, do not move the whole item.
- **Re-declaring an item under a later module** to "enrich" it — the reducer keeps the first
  declaration and your edit never appears.
- **Adding a knowledge storage key** or a second progress store, instead of deriving from
  `useProgress`.
- **Breaking the resize invariant**: recomputing width from the left edge, or adding vertical
  resize.
- **Measuring width against `window.innerWidth`** instead of the lesson viewport — correct in the
  visitor shell, off by the sidebar (256/80 px) in the student shell.
- **Making expanded mode a `left: 0; right: 0` overlay**, which slides under the sidebar and covers
  the global header. Expanded must equal the lesson viewport.
- **Calling the browser Fullscreen API** for expanded mode. It is an application layout mode.
- **Swapping geometry with inline styles** instead of animating it — the drawer ⇄ expanded switch
  then jumps 400 px → 1280 px in one frame.
- **Resetting the drawer width when leaving expanded mode** instead of restoring the stored one.
- **Giving the panel a fixed height**, which makes the top drop when content is short.
- **Hard-coding a header height** or reconstructing the shell insets by hand instead of measuring
  `<main>` + `#app-header`.
- **Inventing new entity types for the hierarchy.** Strata are derived from `item.type`; a lesson
  declares `type` and nothing more.
- **Wrapping every knowledge item in its own bordered card**, which is exactly the fragmentation the
  strata layout exists to remove.
- **Anchoring to the wrong header** (a lesson-local header, or a hardcoded `top: 64px`) instead of
  `#app-header`.
- **Mixing print CSS into screen layout**, or deleting the `data-km-noprint` attributes.
- **Adding a PDF library / server-side export** when `window.print()` already produces the A4
  document.
- **Placing the trigger at `bottom-6 right-6`**, where the command-palette button covers it.
- **Bulk-editing KaTeX strings with regex**, producing single backslashes and silently broken math.
- **Forgetting `knowledgeMap: true`** after removing a formalization module — the lesson validator
  then reports a missing required stage.

---

## Validation

What the reference implementation is checked by, and what a migrated lesson should reproduce:

| Check | Command | Reference result |
| --- | --- | --- |
| Reducer unit tests | `npx vitest run --root apps/web <lessonDir>` | 9 tests in `knowledgeState.test.js` |
| Lesson contract | `node scripts/validate-lessons.mjs` | no new error; `knowledgeMap: true` waives `formalization` |
| Build | `npm run build` | passes |
| Knowledge-map e2e | `node apps/web/e2e/lesson-kit/2nde-vecteurs-carte.mjs` (vite on :5231) | 64/64 |
| Lesson e2e | `node apps/web/e2e/lesson-kit/2nde-vecteurs.mjs` | 70/70 |
| **Sizing** (shared, all lessons) | `node apps/web/e2e/lesson-kit/km-layout.mjs` | 96/96 |
| **Hierarchy / reveal / print** (shared) | `node apps/web/e2e/lesson-kit/km-structure.mjs` | 16/16 |

`km-layout.mjs` and `km-structure.mjs` test the **shared** component, not one lesson: run them
after any change to `common/knowledge/`. They mock `/auth/me` to exercise the student shell, whose
sidebar inset is where sizing bugs actually appear.

Every migrated lesson ships its own `*-carte.mjs` copy; see
`KNOWLEDGE_MAP_MIGRATION_2NDE.md` for the per-lesson counts.

`2nde-vecteurs-carte.mjs` is the template to copy. It asserts, at every stage: the map is empty at
lesson start; module 1 completed live updates both snapshot and drawer without navigation; for each
seeded module the snapshot set equals the drawer set equals the expected cumulative set; no future
item leaks; only the current module's items are detailed and flagged « nouveau »; navigation mode
renders KaTeX in item detail; the print view lists exactly the current items and nothing later;
the boss synthèse renders the complete map inline and moves the drawer to the same state; and the
mobile panel fits the viewport with the right edge flush and the top under the header.

---

## Future Work — NOT IMPLEMENTED

Explicitly not built today. Do not document these as available, and do not assume them when
migrating:

- **Cross-lesson map.** The map is scoped to one lesson; there is no chapter- or year-level map.
- **A « mastered / consolidated » state.** Items are either not yet unlocked or acquired. The
  progress model records module *completion*, not per-item mastery, so a finer state would be
  invented rather than derived — see `PROGRESS_MODEL.md`.
- **Server persistence of knowledge.** Nothing about the map is sent to the API; it is derived from
  local module progress (which does sync, on its own).
- **`item.manipulationRef`.** Rendered by `ItemDetailView` but unused by every current item.
- **`item.discovered`.** Honored as a filter by the drawer, unused by the reference lesson.
- **Pre-seeded prerequisite knowledge.** The map starts empty.
- **Server-side PDF export.** Browser print only.

---

## Reference Files

**The canonical implementation** — `apps/web/src/lessons/common/knowledge/`

| File | Role |
| --- | --- |
| `KnowledgeMap.jsx` | the **only** drawer/expanded UI. Exports `KnowledgeMap` (default), `KnowledgeMapTrigger`, `CompleteView`, `CATEGORIES`, `CAT_THEME`; holds `PRINT_CSS`, `StructuredView` and the print views privately |
| `useLessonViewport.js` | lesson-viewport geometry (`<main>` padding box + `#app-header`, `ResizeObserver`) |
| `knowledgeStructure.js` | `STRATA`, `HIGHLIGHT_CAT`, `buildStructure`, `progressionByModule` |
| `knowledgeState.js` | `cumulativeKnowledge`, `knowledgeModuleNumbers`, `toModuleSet`, `allKnowledge`, `groupByCategory` (+ `.test.js`) |
| `KnowledgeProvider.jsx` | `LessonKnowledgeProvider` (parameterised), `useLessonKnowledge`; mounts the drawer |
| `KnowledgeSnapshot.jsx` | the « À retenir » presentation (`compact` / `complete`) |
| `knowledgeVisuals.jsx` | shared SVG figures |
| `index.js` | the public entry point — import from here |

**The lesson (reference integration)** —
`apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/`

| File | Role |
| --- | --- |
| `knowledge.jsx` | `LESSON_KNOWLEDGE.modules[n]` — the only place knowledge text is written |
| `components/KnowledgeMap.jsx` | one-line **re-export** of `common/knowledge/KnowledgeMap` (legacy import path) |
| `components/knowledgeVisuals.jsx` | lesson figures: `MiniPlane`, `RightTriangle`, `ChaslesArrow` |
| `routes.jsx` | wraps every route element in the provider |
| `lesson.config.js` | `knowledgeMap: true` |
| `modules/Module0[1-7]*.jsx` | `footer={<KnowledgeSnapshot moduleNumber={N} />}` |
| `modules/Module08MissionFinale.jsx` | `synthese={<KnowledgeSnapshot variant="complete" complete />}` |

**Platform files it depends on**

| File | Role |
| --- | --- |
| `apps/web/src/components/layout/CourseLayout.jsx` | picks the shell (student vs visitor) a lesson renders in |
| `apps/web/src/components/layout/StudentLayout.jsx` | `<main>` whose padding encodes the sidebar/header/bottom-nav insets |
| `apps/web/src/components/navigation/Navbar.jsx` | provides `#app-header` (visitor shell) |
| `apps/web/src/components/student/StudentNavbar.jsx` | provides `#app-header` (student shell, `lg:hidden`) + the desktop sidebar |
| `apps/web/src/lessons/common/hooks/useProgress.js` | `completedModules`, `markModuleCompleted` |
| `apps/web/src/lessons/common/kit/ContentModule.jsx` | renders `footer` when `allDone` |
| `apps/web/src/lessons/common/components/ModuleLayout.jsx` | calls `markModuleCompleted` under the same condition |
| `apps/web/src/lessons/common/kit/BossFinal.jsx` | renders the `synthese` prop |
| `apps/web/src/lessons/common/components/MathText.jsx` | KaTeX renderer |
| `scripts/validate-lessons.mjs` | honors `knowledgeMap: true` |
| `apps/web/e2e/lesson-kit/2nde-vecteurs-carte.mjs` | the progression/print/responsive e2e template |
| `apps/web/e2e/lesson-kit/km-layout.mjs` | sizing invariants: drawer/expanded × 6 shell-breakpoint combinations (96 checks) |
| `apps/web/e2e/lesson-kit/km-structure.mjs` | hierarchy, progressive reveal, both modes, detail view, print (16 checks) |
