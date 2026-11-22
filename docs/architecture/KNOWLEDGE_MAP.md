# Knowledge Map Architecture

> **The contract for integrating the cumulative Knowledge Map (« Ma carte des connaissances »)
> into a lesson.** Written for AI coding agents and developers. It was first written while migrating
> the French-era 3e and 2nde lessons (reference: `vecteurs-2nde`); **those lessons were deleted on
> 2026-09-25**. The reference integration today is the **4AM unit** « الأعداد الطبيعيّة والأعداد
> النّاطقة » — all 9 lessons declare `knowledgeMap: true`, own a `knowledge.jsx`, and pass
> `loadKnowledge: () => import('./knowledge')` to `buildLessonRoutes`. The shared implementation
> lives in `apps/web/src/lessons/common/knowledge/`. Passages that cite `vecteurs-2nde`, a
> lesson-local `components/…` path or an e2e suite (`km-*.mjs`, `*-carte.mjs`,
> `sidebar-toggle.mjs`) are **historical** — those files no longer exist; the current automated
> coverage is the vitest tests in `apps/web/src/lessons/common/knowledge/*.test.js(x)`. Where
> something is deliberately not built, it is marked **NOT IMPLEMENTED**.
>
> **Two layers since 2026-09-29.** The **progressive interactive learning map** (Part A below) is
> Smarter Academy's Knowledge Map. It was approved on one lesson (`qasim-adad-tabii`, the reference)
> and **migrated to all nine lessons of the unit the same day** (A.15). The stratified map described
> from « Purpose » onwards is now only the engine underneath and a documented escape hatch — no
> lesson shows it. Both layers share the same engine — one `knowledge.jsx`, one cumulative state,
> one progress system.

Companion docs: `LESSON_CONTRACT.md` (module/stage contract, including the `knowledgeMap: true`
exemption), `LESSON_INTEGRATION_GUIDE.md` (routing, locking, storage), `PROGRESS_MODEL.md`
(completion vs mastery), `INTERACTION_PEDAGOGY.md` (how a module teaches).
Migration notes for the French 2nde and 6e lessons (including the « a brick must live in
the literal `steps` » trap) were deleted on 2026-09-25 together with those lessons and
`common/knowledge6e/`; they remain in git history.

---

# Part A — The progressive interactive learning map (approved architecture)

> Approved by the product owner on 2026-09-29 after the prototype on « التعرّف على قاسم لعدد
> طبيعي ». This part states **what the Knowledge Map is** in Smarter Academy's educational
> architecture, the **rules** every lesson follows, and **how far the implementation goes today**.
> Implementation detail (files, layout algorithm, animation timings) lives in
> [« Progressive map — implementation »](#progressive-map--implementation), further down.

## A.1 Status

| | **Today (since the migration of 2026-09-29)** |
| --- | --- |
| Lessons | **all nine** lessons of the unit declare `knowledgeMapMode: 'progressive'` and export a hand-authored `KNOWLEDGE_GRAPH` (A.15); `qasim-adad-tabii` is the reference |
| New / generated lessons | authored with the graph from the start (A.13) — the gates below refuse a lesson without one |
| Engine | shared: `common/knowledge/` + `common/knowledge/progressive/`, lazy-loaded — **no fork per lesson** |
| Gates | `scripts/validate-lessons.mjs` (a lesson with `knowledgeMap: true` must declare the mode, own a `knowledgeGraph.js` and re-export it) and `progressive/lessonGraphs.test.js` (the A.14 invariants, for **every** lesson, automatically) |
| Fallback | a lesson declaring the mode with a missing or invalid graph gets a graph **derived** from its items (A.9) — never a blank map; no current lesson uses it |
| Escape hatch | **none since 2026-11-08** — the stratified presentation was deleted; `knowledgeMapMode` stays declared (the gate checks it) but the panel always shows the mind map |

## A.2 One knowledge model, two representations

The old map was a **structured summary** of the lesson's knowledge. The new map is a
**progressive interactive learning map**: the learner *constructs* the lesson's knowledge by
discovering it, idea by idea, along its relationships.

It has two representations of the **same** model — never two content systems:

| | **A. الخريطة — the interactive Mind Map** | **B. المعارف مفصّلة — the linear reading** |
| --- | --- | --- |
| Answers | « كيف ترتبط المعارف؟ » — how do the ideas connect? | « بأي ترتيب أقرأ وأراجع المعارف؟ » — in what order do I read and revise? |
| Form | visual, spatial, interactive graph | one column, numbered top to bottom |
| Content | `KNOWLEDGE_GRAPH` nodes + edges, and the `knowledge.jsx` items they carry | the **same** nodes and items, in `linearEntries` order |
| Discovery | progressive: nodes revealed along relationships | everything the learner has reached, in reading order |
| Print | — | the printed A4 document |

Both read one source: the lesson's `knowledge.jsx` items (the mathematics, shared with the
`<KnowledgeBrick>` of the modules) and its `knowledgeGraph.js` (the structure, relationships and
guidance). Nothing is written twice; a text in either view is the same string.

## A.3 The Mind Map

The Mind Map is **visual, spatial and interactive**:

- **nodes** — knowledge objects: a semantic type (icon + label), a title, a short subtitle
  (often the notation), and a state;
- **semantic relationships** — every arrow carries a label saying *why* two ideas are linked (A.8);
- **animated edges** — an arrow draws itself when a relationship is discovered, then its label
  appears, then the new node enters;
- **contextual information** — opening a node shows its content (the lesson's words), its
  relationships written out, and « أضف إلى كرّاسي » where the node is a knowledge item;
- **a complete-map view** — « عرض الخريطة كاملة » shows every node and relationship in the same
  layout as a recap (locked nodes as ghosts);
- **the learner's progression** — the map never shows knowledge the learner has not reached (A.4).

**The finger on the first card** (owner, 2026-11-08): in the explore view, while nothing is discovered yet, a hand 👇 bobs
ABOVE the root card (« ابدأ هنا ») pointing at it — « tap here to see the explanation » without one more sentence
(`GraphNode`, `data-kg-start-finger`). It leaves at the first tap; with reduced motion it stays still. Every lesson's map.

The learner **discovers** the structure progressively — the root first, then each relationship
leads to the next idea, with exactly one « التالي » node flashing to show the next step. The whole
structure is never handed over before learning.

## A.4 Learning-synchronised reveal — and the five states

**Central principle.** The map reveals knowledge **as the learner learns the corresponding part of
the lesson**. It is not a static graph of the whole lesson shown before learning. And « available
to learn » is not « mastered ».

> **Exception — the OPEN map (owner, 2026-11-08, PILOT `qasim-adad-tabii` only, not yet a rule).** `knowledgeMapOpen: true` in
> the lesson config shows EVERY knowledge item from the start, with no lock by محور, and the map opens on its « full » view
> (exploration stays one tap away). Only the map's `items` open. What the student has really ESTABLISHED stays separate:
> `useLessonKnowledge().learnedItems` (the progression-based list) is what the mission's tool coins (`useMission`) and
> « أتوقّع القاعدة » (`usePredictGate › known`) read — otherwise every coin would be lit and every rule prediction skipped.
> `unlockedModules` stays the real progression (the mastery overlay reads it), and the end-of-module memo still shows only its
> own items (`KnowledgeSnapshot`, same rule as the teacher's view).

Recommended progression, and how the implementation realises each step **with the existing
progress system** (no second progression, no second mastery system):

| Step | Pedagogical meaning | Implemented by |
| --- | --- | --- |
| module available | the learner can open the محور | `moduleGate` / `stepUnlock` (unchanged) |
| knowledge established | the learner meets an idea in the module | a `<KnowledgeBrick id>` renders → `unlockItem(id)` (live), `KNOWLEDGE_DEPENDENCY.md` |
| module learned / completed | all steps done | `markModuleCompleted` → `completedModules` → `unlockModule(n)` (persisted + live) |
| knowledge becomes available in the map | nodes whose `requires` item is now in the cumulative map | `nodeStates` — a node is **locked** until then |
| learner explores the map | opens nodes, follows relationships | exploration state (`discover`), per tab |
| exercises / evaluation | practice and final test | the existing exercise and evidence pipeline (`EXERCISE_CONTRACT.md`) |
| mastery | per Learning Point | Mastery V2 (`LEARNING_ARCHITECTURE.md`), shown on the « بطاقتك » strip under the graph |

The five states, precisely:

| State | Meaning | Source — and what is NOT invented |
| --- | --- | --- |
| **locked** | the idea has not been reached in the lesson | the node's `requires` item is absent from the cumulative map (completion ∪ brick ∪ `freeNavigation`). Shown as a ghost without title (no spoiler) and « بعد المحور n » |
| **available** | reached, not yet opened in the map | revealed by exploration, not opened. One of them — the next in discovery order — flashes « التالي » |
| **discovered** | opened in the map | **exploration UI state** only: `sessionStorage` `sa_km_explore_<lessonId>`, never sent to the server, never read by progress or mastery |
| **learned** | the lesson has taught it | **not a separate node state**: every non-locked node *is* learned knowledge in the platform's sense (its item was established by a brick or a completed module). The strip shows module completion |
| **mastered** | the learner has demonstrated it | **not a node state**: mastery exists **per Learning Point** (`unassessed` · `gap` · `reinforce` · `mastered`, Mastery V2), shown as dots on the « بطاقتك » strip, with « راجع » for a gap. A node carries no Learning Point id today (A.15) |

Guidance nodes (A.5) only ever go **available → discovered**: a warning is read, not mastered.
A teacher or admin (`freeNavigation`) sees every node unlocked from the start; nothing is written.

## A.5 Knowledge types

`kind` is a **semantic type** — what role an idea plays for the learner. The types are a closed
vocabulary (`graphModel.js` `CORE_KINDS` / `GUIDE_KINDS`, habillage in `nodeKinds.js`), **not
mandatory categories**: a lesson uses only the types its mathematics justifies, and must not
force every type into every lesson.

| `kind` | Arabic label | Family | Role |
| --- | --- | --- | --- |
| `concept` | مفهوم | core | the idea the lesson is about |
| `definition` | تعريف | core | a textbook definition |
| `idea` | فكرة أساسية | core | a key idea that is neither a definition nor a property |
| `relationship` | علاقة | core | a property or formula linking objects |
| `method` | طريقة | core | a procedure to apply |
| `example` | مثال | core | a worked example that supports a concept |
| `term` | مصطلحات | core | vocabulary, equivalent phrasings |
| `retain` | للحفظ | core | a fact to know by heart |
| `common_mistake` | خطأ شائع | guide | a frequent wrong action or reasoning (A.6) |
| `warning` | انتبه | guide | a condition or subtle distinction (A.6) |
| `tip` | نصيحة | guide | a useful reasoning / solving strategy (A.7) |
| `check` | تحقّق | guide | a concrete way to verify an answer or understanding (A.7) |
| `prerequisite` | تذكّر | guide | prior knowledge the idea needs (A.7) |
| `takeaway` | خلاصة | guide | the essential idea to keep (A.7) |

**Core** is what to KNOW; **guide** is what ACCOMPANIES it. Core stays visually dominant (white
card, 2 px border); guide nodes are tinted, 1 px border, thick start-edge bar, lighter title —
identifiable by icon + label, never by colour alone. All fourteen types are used across the unit
(A.15 lists them lesson by lesson); no lesson uses them all.

**A knowledge item may be carried by a guide-type node** when that is what it honestly is: the
« تذكير » items of lessons 2, 3 and 9 are `prerequisite` nodes, « كيف أتأكد أنني انتهيت؟ » (lesson 8)
is a `check`, « أي طريقة أختار؟ » (lesson 6) a `tip`, « أوليان فيما بينهما ≠ عددان أوليان »
(lesson 7) a `warning`. The node is still `notebook: true` — the item is carried, counted and
listed exactly like a core item — it only *looks* like the aid it is.

## A.6 Common mistake vs warning

**خطأ شائع** is a **first-class** knowledge type. It describes, in its `context.parts`:

| `role` | Label | Content |
| --- | --- | --- |
| `wrong` | الخطأ | what students commonly do or conclude |
| `why` | لماذا؟ | why it is incorrect |
| `right` | الصحيح | the correct reasoning or result |
| `example` (optional) | مثال | a concise example |

A common mistake is **derived from the lesson's actual mathematics and pedagogy** — a distractor
the lesson's questions use, an exercise's `commonError`, a correction a module writes (« العكس:
… »). Never generic filler (« انتبه أثناء الحساب »): every mistake teaches something concrete.

They are **not interchangeable**:

| | **خطأ شائع** | **انتبه** |
| --- | --- | --- |
| Is | a common incorrect student action / reasoning | a mathematical condition, subtle distinction or point needing attention |
| Example (prototype) | « من 120 = 6 × 20 نستنتج أن 6 وحده قاسم » | « التعريفان يشترطان b ≠ 0 » |
| Shape | `parts` wrong / why / right (+ example) | `text` (+ `note`) |

## A.7 Supporting knowledge — نصيحة, تحقّق, تذكّر, خلاصة

| Type | Is | Example shape |
| --- | --- | --- |
| **نصيحة** (`tip`) | a useful reasoning or solving strategy | a shortcut the lesson itself teaches — only when it is **in this lesson's scope** |
| **تحقّق** (`check`) | a concrete way to verify an answer or understanding | « نُجري القسمة الإقليدية وننظر إلى الباقي » + the lesson's own worked cases |
| **تذكّر** (`prerequisite`) | relevant prior knowledge the idea depends on | the Euclidean division, from the lesson's « أستعدّ » — not a list of everything learnt before |
| **خلاصة** (`takeaway`) | the essential idea that must remain: « if you remember one thing » | one or two sentences assembled from the lesson's definitions |

All four are **lesson-specific and pedagogically justified**, like the mistakes. If the lesson
gives no source for a tip, there is no tip (the prototype has none: its only candidate was out of
the lesson's `teachingScope`).

## A.8 Relationships are semantic

Every edge carries a `label` saying **why** two ideas are connected; arrows are never decorative.
The label is free Arabic text, written for the lesson; the recommended vocabulary:

| Relation | Use for |
| --- | --- |
| يعني / معناه | a notion → its definition |
| يعرّف | a definition → the notion it defines |
| يوضّح / مثال على | an example → what it illustrates |
| يكافئ / نفس الفكرة | two equivalent formulations (often `lateral`) |
| يؤدي إلى / نستنتج / نستخلص | a consequence, a conclusion, the takeaway |
| يعتمد على / تذكّر | a dependency on prior knowledge |
| انتبه إلى | a condition or subtle point |
| خطأ شائع (في) | the mistake attached to the idea it concerns |
| نتحقق منه بـ | the check for an idea |
| يساعد على | a tip for a task |
| يلخّص | a summary |
| حالتان خاصّتان | special cases |

Used by the reference lesson: معناه · نفس الفكرة · تذكّر · باقٍ معدوم · نتحقق منه بـ · مثال · خطأ شائع ·
نقول أيضًا · حالتان خاصّتان · انتبه إلى · نستخلص. The migrated lessons add labels taken from their
own sentences — « الجداءات تتكرّر », « يصبح خاصية », « الباقي فرق », « يكفي », « أكبرها »,
« نرمز له », « في حالات خاصّة », « نكرّرها », « نختصر الطرحات », « ننفيه بـ / نثبته بـ »,
« نتوقّف عند », « نصل إليه بـ » (A.15). A relationship is also written out in the node's
context (« الروابط »), which is what a screen reader gets instead of the drawing.

## A.9 The data model — as implemented

The conceptual model maps onto **real** fields. There is no other schema; nothing is stored in the
database (the model is lesson source code, like the rest of the lesson).

```js
// knowledge.jsx — the MATHEMATICS (unchanged, shared with <KnowledgeBrick> and the stratified map)
export const LESSON_KNOWLEDGE = { modules: { [n]: [{ id, type, title, summary, visual?, body }] } };
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';      // opt-in

// knowledgeGraph.js — the STRUCTURE, RELATIONSHIPS and GUIDANCE
export const KNOWLEDGE_GRAPH = {
  root,                                                  // id of the starting node
  nodes: [{ id, kind, lane, title, subtitle?, requires, reveals?, notebook?,
            context: { text?, formula?, list?, parts?: [{ role, text }], note? } }],
  edges: [{ from, to, label, lateral? }],
};
// lesson.config.js — the flag
knowledgeMapMode: 'progressive'
```

| Conceptual field | Implemented as |
| --- | --- |
| id | `node.id` (graph) · `item.id` (knowledge) |
| type | `node.kind` (A.5) · the stratified map's `item.type` is a separate, older category set |
| title | `node.title` |
| description | `node.context.text` (+ `subtitle`, the one-line notation) |
| optional example | `context.formula`, `context.list`, a `parts` entry of role `example`, or an `example` node |
| relationship | `edge.label` (+ `lateral` for same-level relations) |
| connections | `edges` (drawing) and `reveals` (discovery order; default = outgoing edges) |
| learning / reveal state | **derived, never stored in the data**: locked from `requires` vs the cumulative map; available / discovered from the exploration state (A.4) |
| module association | **indirect**: `node.requires` → the `knowledge.jsx` item → the module that declares it in `LESSON_KNOWLEDGE.modules`; the locked hint « بعد المحور n » reads it (`lockedInfoFor` in `ProgressiveKnowledgeMap.jsx`) |
| exercise / evaluation association | **NOT IMPLEMENTED** — no field links a node to an exercise, a question or a Learning Point (A.15) |
| knowledge item carried | `notebook: true` — the node *is* its `requires` item (linear reading, « أضف إلى كرّاسي »). A `notebook` node may **omit `context`**: its card then shows the item's own `summary` (`contextOf` in `graphModel.js`) — the graph never retypes what `knowledge.jsx` already says |
| fallback graph | `graphFromKnowledge(knowledge)` / `resolveGraph(authored, knowledge)` (`graphModel.js`): when a lesson declares the mode but its graph is missing or fails `validateGraph` (unknown ids, unreachable node, **cycle**), the map uses one `notebook` node per item, in module then declaration order, chained by the lesson order only (label « ثمّ », `map.progressive.fallbackSequence`), with the A.15 category → kind starting point and **no** guidance. Marked `derived: true`; the per-lesson test refuses it for a shipped lesson |
| layout | `lane` (`start`/`center`/`end`); rows derived; declaration order breaks ties |

## A.10 Authoring rules (lesson authors and AI generation)

1. **Do not invent knowledge to fill the map.** Every node comes from the lesson: its textbook
   content, its activities, its exercises (`method`, `commonError`), its questions and corrections.
   Texts are **imported** from `content/*.js`, never retyped.
2. **Do not force every type.** Use the types the mathematics justifies (A.5).
3. **Prefer meaningful relationships.** Every edge has a label that says why (A.8); attach guidance
   to the idea it explains — **never to the root by default**.
4. **Common mistakes are mathematically specific** — what is done, why it is wrong, what is right
   (A.6), grounded in the lesson's own distractors and errors.
5. **Useful content is concise.** A context is a few sentences; the long text stays in the module.
6. **Examples support concepts.** An example node hangs from the definition it illustrates.
7. **The map follows the actual pedagogical progression.** `reveals` reproduces the lesson's order;
   each node is gated (`requires`) by the item that establishes it — the map never shows more than
   the lesson has taught.
8. **Do not duplicate the lesson verbatim.** Nodes quote the essential sentences, not whole modules.
9. **The map is a learning representation, not a transcript.**
10. **Keep core mathematical knowledge dominant.** Guidance nodes stay fewer than half the map (the
    prototype: 6 of 13); combine related aids into one node rather than multiplying them.
11. **A خطأ شائع needs the lesson's « لماذا؟ ».** A distractor whose error the lesson never
    explains is not a common mistake: if the lesson only *states* the right rule, the node is a
    `warning` quoting it (lesson 5, « PGCD(a ; 0) = a »). One idea, one node: a distinction already
    carried by an item is not doubled by a mistake node (lesson 7).
12. **Write every equality inside `$…$`.** Outside a math island, digits after Arabic text are
    reordered: « 252 − 140 = 112 » displays as « 112 = 140 − 252 ». This includes a quoted source:
    if a lesson string carries a bare equality, the map leaves that part out rather than show it
    reversed (asserted by the per-lesson test). A Latin word glued to a formula (`PGCD$(a ; b)$`)
    is handled by `MathText` (`ARABIC_RTL_CONTRACT.md`).
13. **Compute, don't copy, the worked arithmetic.** Divisor lists, factor pairs, successive
    differences and Euclidean divisions shown by a node are computed from the textbook's own numbers
    (`ACTIVITY.numbers`…), counted **as the textbook counts** (« 13 − 13 = 0 » is a step: « ثمان
    خطوات » for 765 and 135).
14. **Never spoil an evaluation.** Every node is gated by an item, and items belong to teaching
    modules; content that *is* an evaluation's answer stays out of the map (lesson 9: the solution
    2440 of « أحلّ الوضعية »).
15. **Mind the discovery order.** `discoveryOrder` is depth-first over `reveals`: the aid that
    reveals the takeaway must be in the **last** branch, or the takeaway is reached before the rest
    of the lesson. A second aid pointing at the takeaway draws its edge but does not list it in
    `reveals`.
16. **Keep labels short and titles shorter.** A long label on a straight edge sits in the middle of
    the row it crosses; the layout test fails when it lands on a node. Titles ≤ 28 characters (≈ 20 to
    avoid « … » on a phone); a math subtitle must fit a phone lane at 0.7 scale — name the pair in the
    title and keep the subtitle to the result (« PGCD = 28 »).

## A.11 Arabic, RTL and mathematics

The map follows `ARABIC_RTL_CONTRACT.md` with nothing specific to relax:

- all UI text is Arabic (i18n `lesson.json` → `map.progressive.*`), in **Cairo** (global stack);
- the UI is **RTL**: the `start` lane is on the right, the reading order runs right to left, the
  first step is on the reading-start side;
- mathematics goes through `MathText` (KaTeX in a `dir="ltr"` island): `a = b × q` and
  `143 = 11 × 13 + 0` are never reversed;
- only **lane positions** mirror; arrows keep flowing downward, and notation is never mirrored;
- relation labels are **DOM text** (Cairo, browser bidi), not SVG text;
- a **math subtitle is never truncated** — it is scaled to fit (`FittedMath`): « 11 × 13 + 0 »
  without « 143 = » would be a false equality; an Arabic subtitle may end in « … ».

## A.12 Responsive and accessible

**Readable without leaning in** (owner, 2026-11-08). In FULL-SCREEN mode the whole content (nodes, arrows, labels, context card,
« المعارف مفصّلة ») is scaled by ONE factor from the panel width — `readZoom = clamp(width / 900, 1.15, 1.5)` (CSS `zoom`,
`data-km-read-zoom`), like the mission player; the graph geometry does not change. The two tabs are `text-base` there. The
graph never grows beyond two 250 px lanes (≈ 600 px), so the side CONTEXT card takes the rest: from 300 to 560 px
(`ProgressiveKnowledgeMap`, `sideW`) instead of leaving an empty margin between the card and the graph. Drawer and column
modes are unchanged.

| | Behaviour |
| --- | --- |
| Desktop (map body ≥ 760 px: full-screen panel, wide column) | graph + context panel beside it; column mode has a fixed best width (« The column ») |
| Tablet, drawer, phone (< 760 px) | graph full width, context as a bottom sheet (≤ 42 vh); the scroll centres incoming nodes above it; the next step is always fully visible |
| Keyboard | nodes are buttons in reading order; ↓ / ↑ / Home / End move focus; Enter / Space open; Escape closes one level at a time; visible focus rings |
| Screen reader | node `aria-label` = type · title · state; relationships written out in « الروابط »; a polite live region announces what was discovered and revealed |
| Touch | targets ≥ 44 px (nodes, pills, header switch, close) |
| Reduced motion | no drawing, no delays, no pulse, a still next-step ring — same information, same interaction |
| Not colour alone | every type has an icon + label; mistakes use ✗ ؟ ✓ markers; states have a text label and ✓ / lock icons |

## A.13 Future lesson generation

**Every future lesson — human- or AI-authored — is authored with the progressive map from the
beginning.** The graph is not a post-processing step: it is designed with the lesson, because its
`reveals` *is* the lesson's progression and its guidance comes from the lesson's own exercises.

A generated lesson produces, besides `knowledge.jsx`:

- the **core knowledge** nodes carrying each item (`notebook: true`);
- **meaningful relationships** (labelled edges, A.8);
- **useful examples** attached to their definitions;
- **relevant common mistakes** (A.6) — from its questions' distractors and its exercises' `commonError`;
- **relevant warnings** (conditions of its definitions);
- **useful checks / tips** where the lesson supports them;
- a **concise takeaway** where appropriate;
- `knowledgeMapMode: 'progressive'` in `lesson.config.js`.

Rules: A.10. Gate: A.14. Contract entry: `LESSON_DEVELOPMENT_GUIDE.md` §14.2 and
`AI_LESSON_CONTRACT.md` « Knowledge map ».

## A.14 Quality checklist

A lesson's map is ready only if:

- [ ] Core concepts are represented (every `knowledge.jsx` item is carried by a `notebook` node).
- [ ] Important relationships are represented, each with a label that says why.
- [ ] The learning sequence is coherent (`reveals` follows the lesson; `requires` gates by the item that establishes the node).
- [ ] Examples are meaningful and hang from what they illustrate.
- [ ] Relevant common mistakes are included, each with wrong / why / right.
- [ ] Relevant warnings are included (conditions of the definitions).
- [ ] Verification strategies are included where useful.
- [ ] No fabricated or generic content exists — every text is traceable to the lesson's sources.
- [ ] The Mind Map is not overloaded (guidance < half the nodes; no arrow crosses a node; no labels overlap).
- [ ] The detailed view has a clear reading order (① is the start; aids next to their ideas).
- [ ] Arabic / RTL is correct (Cairo, RTL, Arabic labels).
- [ ] Mathematics is correctly rendered (LTR islands, nothing truncated or mirrored).
- [ ] Learning-state integration is correct (locked before the module teaches it; teacher sees all).

What the tests check automatically, **for every lesson** (`progressive/lessonGraphs.test.js`, no
per-lesson code — a new lesson is picked up by existing): the mode and the re-export; graph validity
(no cycle); every node gated by a real item and the root by an item of the first teaching module;
every item carried by exactly one `notebook` node; unique ids and titles; a label on every edge;
something to show on every node; every mistake with wrong / why / right; no guidance on the root and
guidance < half; **every aid quotes at least one of its texts word for word from the lesson's
`content/*.js` or `modules/*.jsx`**; discovery never reaching a later محور before an earlier one;
the flash walking the whole map and, after the first محور, exactly that محور's ideas open; the linear
reading listing every item and aid once, a reminder before its idea; **every numeric equality,
Euclidean division and PGCD claim arithmetically true**; no equality outside a math island; and
layout geometry at 328 / 400 / 720 / 1100 px (inside the width, no node overlap, no arrow through a
node, no label on a node or on a label). `progressiveMap.test.js` keeps the reference lesson's own
assertions and the engine's (fallback, `contextOf`, cycles). In the browser,
`apps/web/e2e/knowledge-map.mjs` measures every lesson at 1440 / 820 / 390 px (full map, linear
reading, the flash walk, replay, a student after module 1). **Relevance** — is this the right
mistake, the right relation? — remains a human review.

## A.15 Migration of the existing lessons — done 2026-09-29

The eight other lessons were migrated in four batches (divisors · PGCD · coprime & fractions ·
integration), each one authored, tested (`lessonGraphs.test.js`), measured in the browser
(`e2e/knowledge-map.mjs`) and reviewed on screenshots before the next. **Representation changed;
curriculum did not**: no `knowledge.jsx` item, brick, snapshot, module, exercise or lesson order was
edited — each lesson gained a `knowledgeGraph.js`, one re-export line in `knowledge.jsx` and the
flag in `lesson.config.js`.

| Lesson | Nodes · edges · aids | Items → kind (normalisation) | Aids — and their source | Handled explicitly |
| --- | --- | --- | --- | --- |
| 1 `qasim-adad-tabii` | 13 · 15 · 6 | reference (unchanged) | — | reference |
| 2 `qawasim-adad-tabii` | 11 · 11 · 5 | methodes → method ×2; « تذكير » → prerequisite; memoriser → retain | 3 mistakes: ex 3 `commonError`, module 2 q 1 distractor « نصف 105 », ex 6 `commonError`; takeaway | the 60 factor pairs computed |
| 3 `khawass-qawasim` | 13 · 13 · 5 | « تذكير » → prerequisite; regles → relationship ×2; methodes → method ×2 | tip: ex 12 / 13 (the `commonError` of 13 is a loss of time, not an error); mistakes: ex 15 `commonError`, module 3 q 1 (condition vs conclusion); takeaway | the activity's three cases computed; the conjecture is an `idea` node; the converse left out (no « why » in the lesson) |
| 4 `qasim-mushtarak-akbar` | 9 · 8 · 2 | concepts → definition ×2; vocabulaire → term; regles → relationship | mistake: ex 10 (distractor + `commonError` + explanation); takeaway | the evaluation's « أصغر عدد » distractor merged into it, not doubled |
| 5 `tayin-pgcd` | 8 · 8 · 3 | methodes → method; regles → relationship ×2 | warning « PGCD(a ; 0) = a » (a distractor the lesson never explains → A.10 rule 11); mistake: ex 22 `commonError` + `explainFor(45)`; takeaway | 42 and 60 computed |
| 6 `bahth-pgcd` | 12 · 11 · 5 | regles → relationship ×2; methodes → method ×2; memoriser « أي طريقة أختار؟ » → tip | 2 reminders (خاصية 1 and 2 of lesson 3 — `priorKnowledge`, module corrections); mistake « آخر فرق هو 0؟ » (evaluation E2 + the textbook's last step); takeaway = the طرائق page's rule and remarks, verbatim | 252 / 140 and 765 / 135 computed (8 differences vs 3 divisions, as the book counts); the textbook misprint note stays in module 1 |
| 7 `awwaliyan-fima-baynahuma` | 10 · 10 · 4 | concepts → definition; methodes → method ×2; memoriser « ≠ عددان أوليان » → warning | tip: ex 27 + مريم (module 1); mistake: ex 39 `commonError`; takeaway | ex 39's closing bare equality left out (A.10 rule 12) |
| 8 `ikhtizal-kasr` | 11 · 11 · 5 | methodes → method ×2; concepts → definition; memoriser « كيف أتأكد…؟ » → check | reminder: « أستعدّ » item 8 + the diagnostic's advice; mistakes: module 1 q 1 distractors, « لأن 7 عدد أولي » (module 1 q 2, module 2 q 1, E2); takeaway | — |
| 9 `wadiya-idmajiya-aadad` | 7 · 7 · 3 | « تذكير » → prerequisite; methodes → method | mistake « مجموع أم قاسم؟ » (module 1 question 3 distractors + its explanation); takeaway = the three stage labels (a platform addition, not the textbook's) | **integration lesson** (since 2026-10-13 its situation is the textbook's aprons challenge, p. 7 — nodes: PGCD reminder, « مجموع أم قاسم؟ » mistake, Euclid, three stages; modules 1–6 are six practice « وضعيات تدريبية », module 7 « تحليل الوضعية النهائية للاختبار » gates the map, the evaluation is module 8): no new knowledge; the map shows the method (قراءة → استراتيجية → تنفيذ), and **not** the solution (13 schools) — it is the evaluation's answer (A.10 rule 14); (« أؤكّد تعلّماتي » was removed 2026-10-13) it formerly referred to lessons 1–7, whose maps carry that knowledge |

**The A.15 blockers are resolved:** (1) the isolation test became « every lesson with a map has a
valid, hand-authored graph » plus a per-lesson invariant suite (`lessonGraphs.test.js`); (2) the
graph gate is in `scripts/validate-lessons.mjs` (static) and the invariants in the test suite (run by
`npm test`); (3) the polished header switch « عمود / ملء الشاشة » (single selection) is now the only
switch. **Fallback:** implemented (A.9, `resolveGraph`). **Shared fixes found by the migration:**
`MathText` groups a Latin word glued to a formula into its LTR island (16 textbook strings of five
lessons read `(b ; r)PGCD(a ; b) = PGCD`); the floating « بطاقتي » / « كرّاسي » pills rise above the
bottom navigation bar below `lg` (the map was unreachable on phones and tablets); `validateGraph`
rejects cycles.

**Still NOT IMPLEMENTED, decide before scale:** a node ↔ Learning Point / exercise association (for a
per-node mastery hint), a print of the graph itself, persistence of the exploration beyond the
browser tab, automatic placement for more than two parallel branches per row, and the in-page
« للتذكّر » snapshot (still the stratified list). **French:** no French lesson exists since
2026-09-25 and no French locale ships; relation labels are data (Arabic, written per lesson), the
engine's UI strings go through i18n (`map.progressive.*`) — a French lesson would write its own labels.

---

# Part B — The cumulative map engine and the stratified presentation

> **REMOVED 2026-11-08 (owner): the stratified PRESENTATION.** The panel now shows ONLY the interactive mind map (Part A) and its
> linear reading « المعارف مفصّلة ». Deleted from `KnowledgeMap.jsx`: the « navigation » strata list (`StructuredView`,
> `HighlightBand`, `KnowledgeRow`), the item and category detail screens (`ItemDetailView`, `CategoryDetailView`,
> `NavigationView`) and the stratified print sheet (`PrintView`, `PrintCard`, `PrintHero`); print now always uses
> `LinearKnowledgeView variant="print"`. `useProgressiveGraph` no longer reads `knowledgeMapMode`: every lesson gets its
> `KNOWLEDGE_GRAPH` or the graph derived from its items. KEPT (still used): the engine below (items, cumulative state, bricks,
> the panel and its geometry), `CompleteView` + `knowledgeStructure.js` (the end-of-module / final synthesis cards,
> `KnowledgeSnapshot`) and the « بطاقتك » strip. Where this Part describes the stratified list as what the panel shows, it is
> historical.

> Everything below « Purpose » describes the engine both layers share (items, cumulative state,
> module completion, bricks, the panel, its drawer / column / full-screen geometry, print) and the
> **stratified** presentation — today shown by **no** lesson (all nine declare the progressive
> mode), kept as the engine underneath and the `'legacy'` escape hatch. The progressive
> implementation's own detail is in « Progressive map — implementation ».

---

## Purpose

The Knowledge Map is the student's **evolving record of what they have learned in this lesson**.
It is not a summary of the current module, and not a static revision sheet shipped with the lesson.

It starts empty, gains the contribution of each module as that module is completed, and ends as the
complete lesson knowledge. Its presentations are all fed by the same data:

- **the drawer** — a right-anchored, resizable panel floating above the lesson. No longer offered
  as a *choice* (its button is gone): it is the fallback below 1024px, where a column has no room.
  *Not a presentation the student picks.*
- **the column** (« Colonne », *prior mode*) — the workspace makes ROOM for the map instead of
  letting it float above the lesson: the sidebar compresses to icons, the content genuinely
  shrinks, and the map becomes a real third region. **Fixed width** — the best for the screen, never
  resized by the reader (2026-09-29) — and the lesson always keeps `MIN_CONTENT_WIDTH`. Desktop only
  (≥ 1024px), for students **and teachers**. *A second workspace.*
- **expanded** — the same map filling the lesson's own viewport. *A full knowledge workspace.*
- **print (A4)** — a dedicated structured document. *A mathematical reference.*
- **the module « À retenir »** — the end-of-module snapshot of that same map, in the page.

```text
Module completion → authoritative progress (useProgress) → knowledge contribution
                  → cumulative reducer → drawer | column | expanded | print | snapshot
```

### The column (prior mode)

```text
┌────┬────────────────────────────┬────────────┐
│ S  │        CONTENU             │  MA CARTE  │
└────┴────────────────────────────┴────────────┘
```

The layout state lives in `src/context/WorkspaceLayoutContext.jsx`, mounted above the router in
`App.jsx` — **above every shell**, since `CourseLayout` picks `StudentLayout`, `TeacherLayout` (a
teacher reads the same lesson in their own space — `TEACHER_CLASSROOM_ARCHITECTURE.md` §8b) or
`MainLayout` by the reader, and the column must work under any of them. `mode` is `closed | normal | prior`; only
`prior` changes the shell, so the drawer and expanded geometry are untouched. (They were locked by
`km-layout.mjs` and ten `*-carte.mjs` e2e suites — historical, deleted with the French lessons.)

**How the content actually shrinks.** The shell reserves a right gutter in the padding of its
`<main>`, via `--sa-gutter-w` and the `.sa-workspace-main` rule in `index.css`. This is deliberate:
`useLessonViewport` already measures that padding box to find the rectangle offered to the lesson,
so reserving the gutter there means every existing measurement sees the new geometry unchanged —
and the map lands exactly in the gutter it just created. A CSS grid would have added a *second*
measurement system.

> Reserve with `padding-right` on `<main>`, never with a competing grid.

`contentGutter === maCarteWidth` is what guarantees the content is never hidden behind the card.

**The column width is fixed — the best for the screen (2026-09-29).** There is no resize handle in
column mode (the floating drawer below 1024 px keeps its own). `columnWidthFor(viewport, sidebar)`
in `WorkspaceLayoutContext.jsx` gives 40 % of the space beside the sidebar, at least
`MA_CARTE_MIN_WIDTH` (360 — two lanes of nodes and an untruncated header), at most
`MA_CARTE_MAX_WIDTH` (480; `MA_CARTE_MAX_WIDE` 560 from 1600 px), and never so much that the lesson
drops under `MIN_CONTENT_WIDTH` (560):

| Screen | Sidebar folded: map / lesson | Sidebar open: map / lesson |
| --- | --- | --- |
| 1024 | 378 / 566 | — (toggle locked) |
| 1280 | 480 / 720 | 410 / 614 |
| 1440 | 480 / 880 | 474 / 710 |
| 1920 | 560 / 1280 | 560 / 1104 |

The former per-reader width (`maCarteColumnWidth` in storage, `setPriorWidth`, `priorWidthBounds`)
is gone. Pinned by `src/context/workspaceLayout.test.js`.

**The lesson's side padding shrinks in column mode.** `.sa-page` keeps its 60 px sides everywhere
else; inside `.sa-workspace-main[data-workspace-prior]` it becomes `clamp(20px, 2vw, 32px)` (index.css),
with the same 300 ms transition as the gutter.

**The sidebar has two reasons to be collapsed, and one state.** Outside column mode,
`sidebarCollapsed` is the reader's manual choice (`sidebarCollapsed` in storage). In column mode the
sidebar is **folded by default** but can be **reopened** with the same toggle: the column is then
recomputed beside it (`sidebarOpenBesideMap` in storage, a separate choice so neither overwrites the
other). The toggle is locked (disabled, and its label says why) only where reopening would squeeze
the lesson under `MIN_CONTENT_WIDTH` — `sidebarCanOpenBesideColumn(viewport)`, i.e. below 1176 px.

**One toggle for both spaces** — `components/common/SidebarToggle.jsx`, used by `StudentNavbar`
and `TeacherNavbar` (`data-sidebar-toggle`): a 32 px disc sitting on the sidebar's edge, level with
the logo row (`top-4 -end-4`), with a 44 px hit area (`after:-inset-1.5`), shadow, the space's
accent on hover/focus (blue student, teal teacher), a chevron naming the action's direction
(`DirectionalIcons`), `aria-expanded`, and an honest disabled state.

> **Superseded on 2026-11-16:** the sidebar no longer folds. Both workspaces have a fixed 80 px rail (`components/common/WorkspaceNav.jsx`, `RAIL_WIDTH`) and `SidebarToggle` is deleted; the knowledge map's column sits beside the rail. See `docs/reports/NAVIGATION_REBUILD_PLAN.md` §0.

**The teacher shell is the same workspace.** `TeacherLayout`'s `<main>` carries
`.sa-workspace-main`, `--sa-sidebar-w`, `--sa-gutter-w` and `data-workspace-prior` like
`StudentLayout`, and `TeacherNavbar` folds to icons (`w-20`) like `StudentNavbar`. Before
2026-09-29 the teacher `<main>` used a hard `lg:ps-64`: column mode reserved nothing and the map
covered 380 px of the lesson.

**Fullscreen suspends the column.** `mapExpanded` (published by the panel) drops the gutter to 0:
fullscreen covers the lesson area itself, so reserving a column there would amputate the very
rectangle it fills — the card stopped short of the right edge. For the same reason `expandedGeom`
is computed as *sidebar edge → window edge* rather than read from `<main>`: the shell only releases
the gutter on the next render, so a measured width made the panel lurch left before correcting
right. (Both were regression-tested in `km-prior.mjs` — historical, deleted; no current e2e suite
covers them.)

**Opening and closing** slide in from the right (`x: 100% → 0`, 300ms) while the shell's gutter
opens underneath on the same curve — the lesson makes room *while* the card arrives, and both
movements land together.

Only `x` is animated, never the geometry. `top/left/width/height` are **posed** through `style`,
and the panel is not mounted until `useLessonViewport` reports `ready`. Animating the geometry was
a real bug: framer-motion interpolated from its own zero state (`left: 0`), so the card was born at
the *left* edge and travelled across the screen. `useLessonViewport` also measures in a
`useLayoutEffect`, so the first painted frame already carries the true rectangle.

*(Historical: this was covered by `km-prior.mjs` (54 assertions) and `sidebar-toggle.mjs` (29),
deleted on 2026-09-25 — no current e2e suite covers the prior column.)*

The architectural rule that motivates everything else:

> A lesson has **one** knowledge source. The « À retenir » is a *presentation* of the map, never a
> second hand-written summary of the same mathematics.

---

## Reference Implementation

**The 4AM unit is the reference integration**, and `apps/web/src/lessons/common/knowledge/` is the
single shared implementation. A lesson *imports* it — never copies it.

```text
apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/<lesson>/
├── knowledge.jsx         ← WHAT each module contributes (the data: LESSON_KNOWLEDGE)
├── lesson.config.js      ← declares knowledgeMap: true
├── routes.jsx            ← passes loadKnowledge: () => import('./knowledge') to buildLessonRoutes
└── modules/Module0*.jsx  ← each passes <KnowledgeSnapshot moduleNumber={n} /> as its footer

apps/web/src/lessons/common/knowledge/
├── KnowledgeMap.jsx            ← the drawer UI (generic; do not fork)
├── knowledgeState.js (+ test)  ← pure cumulative reducer
├── knowledgeStructure.js       ← hierarchy / strata
├── knowledgeMastery.js (+ test)
├── KnowledgeProvider.jsx       ← cumulative state + mounts the drawer
├── LazyKnowledgeProvider.jsx   ← loads knowledge.jsx on demand
├── KnowledgeSnapshot.jsx       ← the « À retenir » presentation
└── ConceptVisual.jsx (+ test), finalSynthesis.test.js
```

**Who wraps the page in the provider.** Not `routes.jsx`: `buildLessonRoutes`
(`lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/_unit/lessonRoutes.jsx`) renders
every page through `LessonPageFrame` of the lazy lesson runtime
(`apps/web/src/lessons/common/lessonRuntime.jsx`), which mounts
`<LazyLessonKnowledgeProvider load={loadKnowledge} lessonId={config.id} …>`. `routes.jsx` only
passes `loadKnowledge`. Modules import the snapshot from the shared folder:

```jsx
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';   // modules
```

*(Historical: until 2026-09-25 the reference was `lycee/seconde/geometrie/vecteurs-2nde/`, with
lesson-local `components/KnowledgeMap.jsx` re-exports and a `routes.jsx` that wrapped each route in
`<LessonKnowledgeProvider>` itself. Those lessons were deleted; read them in git history.)*

---

## Architecture

```text
                         LESSON (any 4AM lesson)
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
out of `visibleItems`. It is **not used** by any 4AM lesson.

### The categories

Defined once and exported from `apps/web/src/lessons/common/knowledge/KnowledgeMap.jsx`. **Do not invent new categories** —
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

**Mastery overlay (Mastery V2, 2026-09-24).** Visibility stays COMPLETION-driven; mastery is only
an overlay on the « بطاقتك » strip (`ProgressionStrip` in `KnowledgeMap.jsx`,
`knowledgeMastery.js` → `moduleMasteryOverlay`): each module chip carries one dot per Learning
Point its config declares in `teachesLearningPointIds`, coloured with `MASTERY_STATES`, titled
with the label + reason. A module chip with at least one `gap` point adds a small « راجع » link to
that module when the module is in the map's `unlockedModules` (`useLessonKnowledge()` —
`KnowledgeMap.jsx` passes it as `completedModules` to `moduleMasteryOverlay`): the modules stored
as completed **plus** those unlocked live on this page, including every module once the final
test's synthesis calls `unlockAll`. The profile is fetched only when the lesson's modules declare taught points; the
overlay is `data-km-noprint` and never reaches the A4 print. The map computes no mastery.

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

### A real example (module 1 of `vecteurs-2nde` — historical, lesson deleted 2026-09-25; the shape is unchanged, see any 4AM `knowledge.jsx`)

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

A figure used by a lesson's `knowledge.jsx` is written in that lesson, as a self-contained SVG component (student-space
coordinates, y upward, converted inside). Plain SVG on purpose: it renders identically on screen and in print.
(The shared file `knowledgeVisuals.jsx` was deleted on 2026-11-17: no lesson imported any of its figures.)

They do **not** use `CoordPlane` or the lesson's `VectorScene`/`labelLayout` label placer. Map
figures are small, static and hand-placed. Their labels are audited by the e2e layout audit like
any other SVG, so a badly placed label fails the suite (see [Validation](#validation)).

### The memo card — « 🔑 للتذكّر » as a FICHE DE MÉMOIRE (`variant="memo"`, PROTOTYPE 2026-10-28)

Owner: « the end-of-module card must be clear — the rule is SEEN and memorised at first sight —, professional and made for Gen Z;
it is the core the student must understand, memorise and use in the exam ». Prototype on `maqlub-qismat-kasrayn` modules 1–4
(`<KnowledgeSnapshot moduleNumber={n} variant="memo" />`), rendered by `knowledge/MemoCard.jsx`. Validated 2026-10-28; rolled out to every
lesson (done 2026-10-28) and BINDING on every new lesson (`LESSON_DEVELOPMENT_GUIDE.md` §6ter), along [`../reports/LAB_PROTOTYPE_ROLLOUT.md`](../reports/LAB_PROTOTYPE_ROLLOUT.md) (`memoContent.test.js` checks every lesson's `memo`).

- **Header** (dark band): « 🔑 للتذكّر », the promise « افهم · احفظ · استعمل في الامتحان », the count of new rules (Arabic plurals
  `map.memo.newCount_*`), « ⏱ اختبر ذاكرتك » (when the card's items carry `memo.quiz`) and « افتح بطاقتي ».
- **One TILE per item of the module**, in the order of the eye: the RULE large (`memo.rule`, KaTeX, `\dfrac`; what CHANGES is coloured
  `\textcolor{#e11d48}{…}` — the lesson's helper `R(x)`), the SLOGAN (`memo.hook`, 2–5 words), then three short lines with an icon each:
  مثال (`memo.example`, a formula), فخّ (`memo.trap`), في الامتحان (`memo.exam`). Formula first when the card is narrow (< `xl`), side by
  side above; a formula never wraps.
- **Earlier items** are CHIPS (title + `memo.chip`, a mini-formula). A module that brings nothing (exercises) shows every item as a tile.
- **« اختبر ذاكرتك » — the timed challenge (optional, 2026-10-28)** (`MemoQuiz.jsx`, pure logic `memoQuiz.js`): the centre of the
  screen over a shaded background (portal on `body`, page scroll locked with `classroom/useScrollLock`). Up to `QUIZ_SIZE` = 5 questions,
  3 choices, `SECONDS` = 12 s each (a bar that empties, red in the last quarter). Questions come from the card's items
  (`memo.quiz = [{ q, options: [3], correct }]`, 2 per rule): the module's rules FIRST (one each, then the second), then earlier ones;
  the PLACE of the right answer is balanced over the run (`answerSlots`: each place at most ⌈n/3⌉ times, never twice in a row —
  owner: « a quiz where the answer is mostly the 1st or 2nd is not a quiz »). Large layout (≈ 1040 px, up to 84 % of the screen height,
  three big option cards, one progress segment per question in the top band). Sound: the device's « الصوت » preference, with its own
  speaker button in the band (start, right, wrong, the last 3 seconds tick, a fanfare at the end). Right → « صحيح! » and the next one comes alone; wrong or time up → the right answer stays green with « راجع القاعدة 02 »
  until « التالي ». End: stars (3 all right, 2 ≥ 60 %), score, time, best score (localStorage per page × module, try/catch), the rules to
  review, « أعد التحدّي ». Keys 1 2 3 · Enter · Escape. NOT learning evidence: nothing is sent. Numbers inside Arabic sentences (score,
  best, rule list) are isolated LRI…PDI — measured with `Range.getBoundingClientRect`, not eyeballed.
  **Authoring `memo.quiz`:** each distractor is a REAL mistake of the rule (not flipped, both flipped, the opposite instead of the
  inverse…), never a random number; each option compiles in KaTeX (`memoQuiz.test.js`).
- An item without `memo` shows its `summary` in the tile: any lesson can switch, the card improves when the author writes `memo`.
- **Width of `memo.rule` (measured 2026-10-28):** about 12–14 symbols at 1366 px, no « … »; the box shrinks when `memo.example` is long and a longer formula
  is clipped or overlaps its example. A long identity may go on three lines with `aligned`. Measure it in the browser (teacher view, `[data-memo-tile]`), don't estimate.
  Keep `hook`/`trap`/`exam` to words: `<`, `>`, signed numbers and Latin letters reorder inside Arabic text.
- **Authoring `memo`:** the rule in symbols (letters a, b, c, d, x), never a sentence; the example with the lesson's OWN numbers; a trap that
  names the real mistake; no fraction inside a sentence (`trap`, `exam`, `hook` stay one line — put formulas in `rule` / `example`).
  Every `rule`, `example`, `chip` must compile in KaTeX strict (`memoCard.render.test.jsx`).
- DOM contract: the `KnowledgeSnapshot` one (each item once, « جديد » only on the module's items) + `[data-memo-card]`,
  `[data-memo-tile]`, `[data-memo-rule]`, `[data-memo-chip]`, `[data-memo-quiz-open]`; the challenge `[data-memo-quiz][data-phase=intro|play|end]`,
  `[data-memo-quiz-option][data-state]`, `[data-memo-quiz-timer]`, `[data-memo-quiz-next]`, `[data-memo-quiz-score]`. Verified in the browser at 1366 and 1024
  (a full run: right answers, a time-out, wrong answers, the end screen, Escape).

### Mathematical notation

Use the platform's single renderer, `apps/web/src/lessons/common/components/MathText.jsx`
(KaTeX via `react-katex`). Inline `$…$`, display `$$…$$`. **Do not introduce a second math
renderer** and do not store formulas as plain-text approximations.

Backslashes are doubled inside JS strings: `{'$\\overrightarrow{AB}$'}`. A lone backslash silently
produces broken output — never bulk-edit these strings with regex tooling.

---

## Cumulative State

### The reducer

`apps/web/src/lessons/common/knowledge/knowledgeState.js` is **pure**: it reads no storage, no context, no React state.

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

teacher / admin reader  → complete lesson knowledge from the start (freeNavigation)
```

**A teacher reads the complete map (2026-09-29).** A reader with `freeNavigation`
(`features/learning/learningViewer.js` — teacher or admin; never a role test) has no progression
(`tracksProgress` is false) and prepares the lesson rather than learning it, so
`LessonKnowledgeProvider` treats **every** module of `LESSON_KNOWLEDGE` as unlocked for them:
drawer, column, expanded, « عرض كامل » and print all show the whole lesson, on every lesson. Nothing
is written. One exception keeps the teacher's view honest: a module's footer
`<KnowledgeSnapshot moduleNumber={n}>` (the « للتذكّر » at the end of a محور) shows that reader
only the items of modules `≤ n` — what a student holds at that point — while the final
`<KnowledgeSnapshot complete>` shows everything. Students are unaffected.

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
knowledge — verified by the e2e suite. The one reader for whom the map is complete without
progress is a `freeNavigation` reader (teacher/admin — [The progression](#the-progression)).

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
// modules/Module01AlMaktaba.jsx (qasim-adad-tabii)
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';

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
separate « À retenir » module is redundant. The 4AM lessons **have none** (as `vecteurs-2nde`,
historical, had none). Its `lesson.config.js`
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

The drawer is mounted **once per lesson page** by the knowledge provider, which `LessonPageFrame`
(`apps/web/src/lessons/common/lessonRuntime.jsx`, used by `buildLessonRoutes`) wraps around every
route element (lesson index and every module) as `<LazyLessonKnowledgeProvider load={loadKnowledge}>`.
*(Historical — the snippet below is the French-era per-lesson `routes.jsx` form.)*

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
fixed bottom-6 left-6 z-40   ·   data-km-trigger="true"   ·   data-km-noprint="true"
```

`left-6`, a **physical** edge and never `start-6`: under RTL `start` resolves to the right, where
the student sidebar sits and swallows every click (found in RTL QA).

`bottom-6`: the ground floor of the lesson's **floating column**. It used to sit at
`bottom-[5.5rem]` above the classroom-mode button « ⛶ عرض »; since that button moved into the
محور's marker row (2026-09-24) the map took its storey, and « كرّاسي » sits above it
(`CLASSROOM_MODE.md`, `classroom.css`).

**Below 1024 px (fixed 2026-09-29, with the migration):** the student and teacher spaces show an
`h-16` bottom nav (`lg:hidden fixed bottom-0 z-40`) that used to cover this trigger — a tap landed on
the nav, and the map was unreachable on every tablet and phone. `index.css` now sets
`--sa-bottom-nav: 4rem` below `lg` on a page that has the workspace shell
(`body:has(.sa-workspace-main)` — the pills live in a portal, outside `<main>`), and both pills add
it: « بطاقتي » at `bottom-[calc(1.5rem+var(--sa-bottom-nav,0px))]`, « كرّاسي » at
`calc(5.5rem + var(--sa-bottom-nav, 0px))` (`notebook.css`). Desktop and the visitor shell are
unchanged (the variable is 0); the practice player's own « كرّاسي » override is untouched.

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
| Desktop / laptop | column mode: fixed best width (table above); drawer (only below 1024 px): resizable 320–800 px | fills the lesson viewport; content laid out in 2–3 columns (`≥1100 px → 3`, `≥720 px → 2`) |
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
| Trigger | `bottom-6 left-6`, ground floor of the floating column | same | same — **covered by the `h-16` student bottom nav below 1024 px (known issue, [The trigger button](#the-trigger-button))** |

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
└── KnowledgeSnapshot.jsx    « À retenir »
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

In a 4AM lesson there is nothing to wrap: `routes.jsx` passes
`loadKnowledge: () => import('./knowledge')` to `buildLessonRoutes`, and `LessonPageFrame`
(`common/lessonRuntime.jsx`) mounts the provider and the drawer around every page.
*(Historical — the French-era lessons wrapped each route by hand, as below.)*

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
                     OR the reader has freeNavigation (teacher/admin): every module, nothing written
  live unlock        fired from the footer snapshot (same allDone as ModuleLayout's
                     markModuleCompleted) or from a brick inside a step the student has reached
  item unlock        page-local, exactly the lifetime of the module's step state
  no knowledge is ever persisted separately from module progress

LAYOUT
  ONE implementation common/knowledge/KnowledgeMap.jsx — never fork or copy it
  lesson viewport    measured from <main>'s padding box + #app-header (useLessonViewport)
  drawer right edge  flush with the LESSON VIEWPORT's right edge, fixed
  drawer left edge   the only resize handle; 320px ≤ width ≤ min(available·0.95, 800px)
  column (prior)     FIXED width = columnWidthFor(viewport, sidebar); no handle; lesson ≥ 560px;
                     same shell for students and teachers (.sa-workspace-main + data-workspace-prior)
  expanded           == the lesson viewport on all four edges; NEVER the browser Fullscreen API,
                     never covers the global header or sidebar
  top edge           never moves on resize; tracked by ResizeObserver (header AND main)
  height             grows/shrinks from the BOTTOM; content area scrolls; no vertical resize
  width memory       knowledgeMapWidth survives a trip through expanded mode
  panel              portalled to document.body (print isolation depends on it)
  trigger            bottom-6 left-6 (ground floor of the floating column; « كرّاسي » above)

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
- **Placing the trigger with `start-6`/`right-6`**, which under RTL puts it beneath the student
  sidebar, visible but unclickable.
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
| Knowledge unit tests (shared) | `npx vitest run --root apps/web src/lessons/common/knowledge` | `knowledgeState`, `knowledgeMastery`, `finalSynthesis`, `ConceptVisual` tests |
| Knowledge dependency contract | `npm run audit:knowledge:gate` | exit 0 |
| Unit e2e | `node apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs` | unit page, opening lab, no horizontal scroll (it does **not** assert the map) |

No current e2e suite asserts the map's progression, sizing or print view. *(Historical: the
French-era suites `2nde-vecteurs-carte.mjs` (the per-lesson template), `2nde-vecteurs.mjs`,
`km-layout.mjs` (sizing, 96 checks) and `km-structure.mjs` (hierarchy / reveal / print, 16 checks)
were deleted on 2026-09-25 with the French lessons; read them in git history. The invariants they
asserted — empty map at lesson start, live update on module completion, no future item leaking,
print lists exactly the current items, complete map at the boss synthèse — remain the contract.)*

## Progressive map — implementation

**Status: the Knowledge Map of every lesson.** Approved on `qasim-adad-tabii` (« التعرّف على قاسم
لعدد طبيعي », the reference lesson whose graph is drawn below) on 2026-09-29 and migrated the same
day to the eight other lessons (A.15). The architecture, rules and checklist are in **Part A**;
**new** lessons are authored with the graph from the start (A.13). This section documents the
implementation.

### What it is

For every lesson, the body of the map's first tab (renamed « الخريطة »; the second tab is
renamed « المعارف مفصّلة ») is an **interactive knowledge graph** instead of the stratified list:
knowledge objects (nodes) linked by **labelled relations** (arrows that say *why* two ideas are
linked: « معناه », « نفس الفكرة », « مثال », « تذكّر », « خطأ شائع », « نستخلص »…), discovered
progressively. Beside the mathematics it carries a **guidance layer** — reminders, checks, common
mistakes, warnings, a takeaway — each grounded in the lesson and attached to the idea it helps. The
second tab, « المعارف مفصّلة », becomes a **linear numbered reading** (`LinearKnowledgeView`,
see « The linear reading » below), which is also what prints.
Everything else is the ordinary map, unchanged: the panel and its drawer / column / full-screen
geometry, and the « بطاقتك » strip with its Mastery V2 overlay (rendered under the graph as its
`footer`).

### Declaring the map (every lesson)

Three things, all required — `validate-lessons.mjs` refuses a lesson with `knowledgeMap: true`
that misses one:

```text
lesson.config.js   knowledgeMapMode: 'progressive'          ← the flag ('legacy' or absent = stratified map)
knowledgeGraph.js  export const KNOWLEDGE_GRAPH = { root, nodes, edges }
knowledge.jsx      export { KNOWLEDGE_GRAPH } from './knowledgeGraph';
```

`LazyKnowledgeProvider` passes `mod.KNOWLEDGE_GRAPH ?? null` to `LessonKnowledgeProvider`, which
exposes it as `graph`; `KnowledgeMap.jsx` (`useProgressiveGraph`) resolves it with
`resolveGraph(graph, knowledge)` when the flag is set — the lesson's graph if valid, else the
**derived fallback** (A.9) — and renders the lazy `progressive/ProgressiveKnowledgeMap`. Each
lesson's graph lives in that lesson's own lazy `knowledge` chunk (≈ 1.5–2.5 KB gzip): opening one
lesson never downloads another lesson's graph.

### The graph data (`knowledgeGraph.js`, per lesson)

```js
export const KNOWLEDGE_GRAPH = {
  root: 'qasim',
  nodes: [{ id, kind, lane, title, subtitle?, requires, reveals?, notebook?,
            context: { text?, formula?, list?, parts?, note? } }],
  edges: [{ from, to, label, lateral? }],
};
```

| Field | Meaning |
| --- | --- |
| `kind` | a **semantic type** from one of two families (`graphModel.js` `CORE_KINDS` / `GUIDE_KINDS`, habillage in `nodeKinds.js`). **core** — what to KNOW: `concept` مفهوم · `definition` تعريف · `idea` فكرة أساسية · `relationship` علاقة · `method` طريقة · `example` مثال · `term` مصطلحات · `retain` للحفظ. **guide** — what ACCOMPANIES it: `common_mistake` خطأ شائع · `warning` انتبه · `tip` نصيحة · `check` تحقّق · `prerequisite` تذكّر · `takeaway` خلاصة. A lesson uses only the types its mathematics justifies. The renderer reads data (icon, label, family, colours); no component tests « is this a mistake? » |
| `lane` | `start` · `center` · `end` — `start` is the reading-start side (right under RTL). Rows are **derived**, never written (see Layout) |
| `requires` | the `knowledge.jsx` item id that establishes this node. A node whose item is not in the cumulative map is **locked** — the graph never shows more than the ordinary map. Guidance nodes are gated the same way (by the item they accompany) |
| `reveals` | what opening the node reveals (default: its outgoing edges' targets) — this is the discovery order |
| `notebook` | the node *is* that item: its context offers « أضف إلى كرّاسي » and it carries the item in the linear reading |
| `context` | the content shown when opened — **the lesson's words**, imported from `content/textbook.js` / `content/exercises.js`, never retyped (asserted by the test). `parts: [{ role, text }]` with `role` ∈ `wrong` · `why` · `right` · `example` (labels الخطأ · لماذا؟ · الصحيح · مثال, each with a text marker ✗ ؟ ✓ •, never colour alone) is how a `common_mistake` says what is done, why it is wrong, and what is right. Rendered by `NodeContextBody.jsx` in both the map and the linear reading |
| `lateral` | a same-row relation (dashed « handle » under both nodes), e.g. بالباقي ⇢ بالجداء « نفس الفكرة » |

**Declaration order matters for layout**: when two nodes would share a lane and a row, the one
declared later moves down (with its descendants).

### The lesson's graph (13 nodes, 15 relations)

```text
                        [قاسم عدد طبيعي]  مفهوم
                  معناه ┌───────┴───────┐ معناه
                 [بالباقي] ─ ─ نفس الفكرة ─ ▶ [بالجداء]              تعريف × 2
                تذكّر │                      │ مثال
       📌 [القسمة الإقليدية]                  [120 و 6]
           باقٍ معدوم │           ┆            │ خطأ شائع
                [143 و 11] ┄┄┄┄┄┄┆      ⛔ [قاسم واحد فقط؟]
       نتحقق منه بـ │               ┆  ← central corridor
            🔍 [نحسب الباقي]        ┆
                              نقول أيضًا
                       [أربع جمل، معنى واحد]                        مصطلحات
             خطأ شائع ┌─────────┴─────────┐ حالتان خاصّتان
          ⛔ [عكس الاتجاه]       [1 والعدد نفسه قاسمان دائمًا]        للحفظ
                   │                          │ انتبه إلى
                   │                   ⚠️ [القاسم ليس 0]
                   └──────── نستخلص ──────────┘
                         🎯 [قاسم ⇔ باقٍ معدوم]                       خلاصة
```
(drawn LTR here; under RTL بالباقي is on the right.)

### The guidance layer — and what grounds each node (2026-09-29)

Every guidance node cites the lesson; nothing is generic advice. `progressiveMap.test.js` asserts
the texts are the lesson's own, that every mistake has wrong / why / right, that every Euclidean
equality shown is true (`a = b × q + r`, `r < b`), and that no guidance hangs off the root.

| Node | Type | Attached to (relation) | Source in the lesson |
| --- | --- | --- | --- |
| القسمة الإقليدية | تذكّر | بالباقي (« تذكّر »), leads to the example (« باقٍ معدوم ») | exercise 1 `method`; أستعدّ items 2–3 corrections (137 ÷ 5, 72 ÷ 24) |
| نحسب الباقي | تحقّق | example 143 (« نتحقق منه بـ ») | نشاط 1: `420 = 28 × 15 + 0` vs `420 = 26 × 16 + 4` (computed from `ACTIVITY.numbers`); M2 Q1 « التعريف كله في الباقي » |
| قاسم واحد فقط؟ | خطأ شائع | example 120 (« خطأ شائع ») | M2 Q2 distractor « 6 قاسم للعدد 120 فقط » and its explanation « المساواة تُقرأ في الاتجاهين » |
| عكس الاتجاه | خطأ شائع | أربع جمل (« خطأ شائع ») | exercise 5 `commonError`, explanation and correction (« 8 يقسم 4 »); M1/M2 « العكس » corrections |
| القاسم ليس 0 | انتبه | 1 والعدد نفسه (« انتبه إلى ») | `b ≠ 0` in both definitions; « غير معدوم » in the remark |
| قاسم ⇔ باقٍ معدوم | خلاصة | end of both last branches (« نستخلص ») | the two definitions + the four-sentence remark |

**Deliberately left out:** a `tip`. The only candidate (exercise 2: « قابلية القسمة على 6 = على 2
وعلى 3 ») is a property of divisors, which this lesson's `teachingScope` excludes (الدرس 3).

### States — and what is NOT a new system

| State | Source |
| --- | --- |
| `locked` | the node's `requires` item is absent from `items` — i.e. the **existing** completion ∪ brick ∪ `freeNavigation` rule. A locked node shows no title (no spoiler), only « بعد المحور n » and, when opened, which محور unlocks it |
| `available` | revealed, not yet opened — halo + « اكتشف » chip (« ابدأ هنا » on the root at the start, « التالي » on the next step) |
| `discovered` | opened — ✓ |

Core and guidance nodes share these states; guidance has **no** learned/mastered state (a warning
is read, not mastered). `available → discovered` is **exploration UI state**, not knowledge and not
mastery: it is kept in `sessionStorage` under `sa_km_explore_<lessonId>`
(`{ explore: { revealed, discovered }, view }`), restored defensively (unknown ids dropped), never
sent to the server, never read by progress or mastery. Mastery stays on the « بطاقتك » strip.

### Interaction

- **Two floating pills, at the top** (`sticky top-0` in the map's scroll area, reading-start corner):
  - the view toggle (`data-kg-view-toggle`) — ONE button that names the action it performs:
    « عرض الخريطة كاملة » while exploring, « الاستكشاف » on the full map (owner's choice: one
    alternating button, not a two-option switch);
  - replay (`data-kg-replay`) « إعادة استكشاف الخريطة », same pill design, beside it. Where both
    labels do not fit side by side (map body < 440 px: drawer, phones) replay becomes a **round**
    pill of the same design, its label kept as `aria-label` / `title`.
- **Explore** (default): only the root is shown. Opening a node:
  1. **scrolls first** — the map moves so the incoming node(s) land at the **centre of the visible
     area** (below the floating pills, above the bottom context sheet, measured after render). When
     the incoming group is taller than that area (phones), the next-step node is centred instead;
  2. **then reveals**, the whole timeline shifted by the scroll time (`batch.lead`, 0.45 s; 0 when
     nothing needs to move): *parent reacts → arrow draws itself (SVG `pathLength`) → relation
     label appears → child enters (opacity, scale 0.85 → 1, slight drop)*; further links of the
     newcomer draw after it.
  A scroll-past-end runway (`data-kg-runway`, exploration only) lets the last rows reach the centre.
  The graph's height is set at once (not animated) so the scroll target exists before the reveal.
- **The next step flashes** — exactly ONE node, the first `available` one in the lesson's
  **discovery order** (`discoveryOrder`: depth-first over `reveals` — finish a branch before the
  next), carries an indigo ring that springs out and fades in a loop (`data-kg-next-flash`) and the
  chip « التالي ». Same colour on every node type: the signal means the same thing everywhere.
  Following the flash walks the whole lesson; a locked branch is never pointed at; no flash once
  everything is discovered. Reduced motion: a still ring.
- **Full map**: every node and relation, same layout, staggered by row; locked nodes as ghosts;
  selection cleared so the recap is not dimmed; nodes stay clickable. « الاستكشاف » returns to the
  exploration exactly as left.
- **Replay**: back to the root alone, no page reload, focus on the root.
- **Progress**: « اكتشفت n من m » over the unlocked nodes, « · k مقفلة » when some are locked; the
  « اكتملت خريطتك » banner appears only when nothing is locked.
- **Context**: kind · state, title, `NodeContextBody` (text, formula, list, the roled `parts` of a
  mistake, note), the node's **relations written out** (clickable — what a screen reader gets
  instead of the drawing), « أضف إلى كرّاسي » for `notebook` nodes. Closed by ✕ or `Escape`.
- **Keyboard**: nodes are buttons in reading order; `↓`/`↑`/`Home`/`End` move focus, `Enter`/`Space`
  open. A polite live region announces what was discovered and revealed.
- **Panel header switch** « عمود / ملء الشاشة » (`data-km-switch="polished"`), every lesson since
  the migration: a segmented control with a roomier track, ≥ 44 px targets on touch (36 px from
  `sm`), the active segment raised in white with an indigo icon, matching 44 / 36 px collapse and
  close buttons. It marks only the visible presentation as selected (the old switch marked **both**
  « عمود » and « ملء الشاشة » as checked in full screen, the column staying remembered underneath —
  that defect is gone with it).

### Layout and responsiveness (`graphLayout.js`, pure, tested)

Two lanes plus a centre, rows top to bottom.

- **Rows** = longest path from the root (lateral edges ignored), then **collision resolution**: two
  nodes in the same lane and row — or a centre node with any other — cannot coexist; the one
  declared later moves down one row, and its descendants follow. Deterministic.
- **Edges**, shape chosen by geometry: *straight* (same x); *elbow* (down–across–down; elbows
  converging on one target **merge on a junction with one label**, placed just above the target);
  *lateral* (a dashed handle under both nodes); *corridor* — towards a centre node when the source's
  lane is **occupied** between the two rows (guidance stacked under an example), the edge leaves by
  the source's inner flank and runs down the gap between the lanes instead of crossing those nodes.
- **Labels** of a branch sit mid-arm when they fit (`labelWidth(text) < |dx| − 8`), otherwise on the
  short drop into the child, so long sibling labels never collide at the centre.
- Tests assert, at 328 / 400 / 720 / 1100 px: no node overlap, no arrow crossing a node it does not
  connect, no label on a node, no two labels overlapping.

Only lane positions mirror under RTL — arrows keep flowing downward and mathematical notation is
never mirrored.

| Width of the map body | Behaviour |
| --- | --- |
| ≥ 760 px (full-screen panel, wide column) | graph + **context beside it** (300 px, sticky); a legend/hint fills it when nothing is selected |
| < 760 px (400 px drawer, tablet, phone) | graph full width, **context as a bottom sheet** (≤ 42 vh, sticky, relations collapsed into « الروابط n ») |

Node heights are 86 / 92 px so Cairo's tall glyphs are never clipped. **Core** nodes: 2 px border,
white while available, tinted once discovered — they dominate. **Guidance** nodes: tinted
background, 1 px border, a thick start-edge bar (`border-s-4`), slightly lighter title — visibly
« accompaniment », identifiable by icon + type label, never by colour alone. A **math subtitle is
never truncated** (« 11 × 13 + 0 » without « 143 = » would be false): `FittedMath` scales it down
(≥ 0.7) to fit the lane; an Arabic subtitle may end in « … ». Interactive targets are ≥ 44 px.
`prefers-reduced-motion`: no drawing, no delays, no pulse, a still next-step ring — same
information, same interaction.

### The linear reading « المعارف مفصّلة »

`LinearKnowledgeView.jsx` replaces `CompleteView` for every lesson — on screen **and** in
print (`variant="print"` in `.sa-print-view`, instead of the stratified `PrintView`). The map
answers « how are these ideas linked? »; this view answers « if I read everything, where do I start
and what comes next? ». It never redraws the graph.

- **One column**, top to bottom, at every breakpoint, **full width** with generous padding (owner:
  no centred narrow column).
- **Numbered steps** 1 → n, the number in a circle linked to the next by a quiet vertical rule;
  step ① carries « ابدأ من هنا » (and only ①). Hierarchy: number → type → title → explanation → body.
- **Order** — `linearEntries(graph, items)`: the graph walked **depth-first** by `reveals`, so each
  aid comes right after the knowledge it explains (never all mistakes at the end), and a
  `prerequisite` comes **before** the idea that reveals it (recall, then read). For this lesson:
  تذكّر القسمة الإقليدية → بالباقي → تحقّق → بالجداء → خطأ «قاسم واحد فقط؟» → أربع جمل →
  خطأ «عكس الاتجاه» → 1 والعدد نفسه → انتبه b ≠ 0 → الخلاصة (10 steps).
- **Two kinds of step, one renderer driven by type**: a knowledge item (a `notebook` node) shows
  exactly the content of the usual view — title, summary, visual, body (the textbook text); a
  guidance node shows its `context` via `NodeContextBody` in a tinted card with the start-edge bar,
  the same visual grammar as on the map. Core nodes without an item (root, examples) have no step:
  their content already lives in the body of the item they illustrate.
- Only what the cumulative map holds is listed; « n معارف أخرى تُفتح … » closes the list when steps
  are still locked. Entrance animation: 6 px fade, 50 ms stagger, none under reduced motion or in print.

### Files

```text
apps/web/src/lessons/common/knowledge/progressive/
├── graphModel.js              kinds, validateGraph, discover, nodeStates, visibleEdges, relationsOf,
│                              exploreProgress, linearEntries, discoveryOrder, nextToDiscover
├── graphLayout.js             layoutGraph, nodeRows (with collision resolution), roundedPath, labelWidth
├── nodeKinds.js               KIND_STYLE (family, icon, full Tailwind class strings), isGuideKind
├── GraphNode.jsx              one node (+ FittedMath, next-step flash)
├── GraphEdges.jsx             GraphEdgeLines (SVG, self-drawing) + GraphEdgeLabels (DOM pills)
├── NodeContextBody.jsx        a node's `context` (text / formula / list / parts / note) — map and reading
├── NodeContextCard.jsx        the context card (side / sheet)
├── LinearKnowledgeView.jsx    « المعارف مفصّلة »: numbered single column, screen + print variants
├── ProgressiveKnowledgeMap.jsx  orchestration: exploration state, views, replay, scroll-then-reveal
│                              timeline, next step, keyboard, live region
├── progressiveMap.test.js     the reference lesson (integrity vs its sources, guidance grounding,
│                              discovery & next step, linear order, layout) + the engine (fallback,
│                              contextOf, cycles)
└── lessonGraphs.test.js       the A.14 invariants for EVERY lesson (A.14 lists them)
apps/web/src/lessons/moyen/4am/…/<lesson>/knowledgeGraph.js   each lesson's graph (nine)
apps/web/e2e/knowledge-map.mjs                                 browser QA of every lesson's map
```

Both views are lazy chunks (`React.lazy` in `KnowledgeMap.jsx`: `ProgressiveKnowledgeMap` ≈ 9.5 KB
gzip, `LinearKnowledgeView` ≈ 2.5 KB gzip), requested when a lesson's map opens; the pure model
(`graphModel.js`) is in the `KnowledgeMap` chunk, and nothing of the map is in the entry bundle
(measured after the migration: only the i18n key `fallbackSequence` of the eager `lesson` namespace).

### Open questions after the migration

- Every graph is hand-authored: the relations are pedagogical judgements, not derivable from
  `knowledge.jsx` categories — the derived fallback exists only so that a lesson is never blank.
- Lanes are authored and rows derived; a node with more than two same-row children is pushed down
  (lesson 7's definition has four, laid out on two rows). A lesson needing three parallel branches
  would need a third lane or automatic placement. The deepest map is 10 rows (lesson 6).
- Guidance is quoted from the lesson but assembled into nodes by hand; a generated lesson needs its
  exercises' `method` / `commonError` and its distractors' `explain` authored with this in mind.
- The in-page « للتذكّر » snapshot stays the stratified list; only the drawer changes.
- Exploration state is per tab (`sessionStorage`); whether it should persist across visits is open.
- A student who has established no item yet sees the map's empty state, not the root (the root
  is gated like every node) — unchanged from the stratified map.

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
| `index.js` | the public entry point — import from here |
| `progressive/` | the progressive map of every lesson — see [Progressive map — implementation](#progressive-map--implementation) |

**The lesson (reference integration)** — any lesson of
`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/`

| File | Role |
| --- | --- |
| `knowledge.jsx` | `LESSON_KNOWLEDGE.modules[n]` — the only place knowledge text is written |
| `routes.jsx` | passes `loadKnowledge: () => import('./knowledge')` to `buildLessonRoutes` (`../_unit/lessonRoutes.jsx`), whose `LessonPageFrame` (`common/lessonRuntime.jsx`) mounts the provider |
| `lesson.config.js` | `knowledgeMap: true` |
| `modules/Module0*.jsx` | `footer={<KnowledgeSnapshot moduleNumber={N} />}` |
| `modules/Module0*Itqan.jsx` | `synthese={<KnowledgeSnapshot complete variant="complete" />}` |

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
| `apps/web/src/lessons/common/lessonRuntime.jsx` | `LessonPageFrame` — mounts `LazyLessonKnowledgeProvider` around every lesson page |
