# Writing the « أتوقّع القاعدة » prompts of a lesson

> **Authoritative** for writing the `predictPrompt` of every rule a lesson gates.
> The mechanism (when a rule is gated, who is never gated, storage, palette) is
> specified in [`../architecture/KNOWLEDGE_DEPENDENCY.md`](../architecture/KNOWLEDGE_DEPENDENCY.md)
> § « أتوقّع القاعدة » — read it first. This guide is the **content** work.

## 1. Status (2026-10-06)

- The gate is **live in every lesson** (engine default in `KnowledgeBrick`, plus
  12 textbook boxes wrapped in `PredictRule`).
- **Prototype done**: `qasim-adad-tabii` — its 3 gated rules have their prompt
  (`knowledge.jsx`), validated by the owner.
- **Rollout (started 2026-10-06, with the « مسائل », one unit at a time — `../sources/4am/masail-rollout/`)**:
  **all 14 units done (2026-10-07)**: every regular lesson prompted; the synthesis lessons decided item by item — 70 bricks turned `rappel`, 6 genuinely new synthesis methods prompted; unit 1: one brick turned `rappel`, one item `predict: false`, one
  textbook method box moved and wrapped). Browser check for any lesson:
  `PREDICT_LESSON=<code> node apps/web/e2e/lesson-kit/predict-lesson.mjs` (an autopilot answers the steps
  until each panel appears and checks the lesson's own prompt is shown — see §4).
- **To do**: the other units' gated rules still show the generic question
  (`lesson.json › predict.prompt`). Track it with:

```bash
npm run audit:predict                          # per lesson: prompted / gated
node scripts/audit-predict-prompts.mjs --missing                # + every item to write
node scripts/audit-predict-prompts.mjs --lesson tayin-pgcd      # one lesson
```

**296 / 296** gated rules prompted on 2026-10-07 (15 / 410 before the rollout; the total shrank as re-posed rules became `rappel` and conventions `predict: false`). `--strict` is now part of `check:lessons`.
When it reaches 410 / 410, add `node scripts/audit-predict-prompts.mjs --strict`
to `check:lessons` so no future lesson ships without its prompts.

## 2. What a good `predictPrompt` is

The student has just manipulated and answered guided questions. The prompt makes
them **put into words the rule they have just seen at work** — before reading it.

| Criterion | Do | Don't |
|---|---|---|
| Anchored | Recall the **numbers / gesture the student just used** (« مع 28 لم يبقَ أيّ كتاب، ومع 26 بقيت 4 ») | Ask in the abstract (« ما هو القاسم؟ ») |
| Open | Ask **when / how / what do you conclude** (متى…؟ كيف…؟ ماذا تستنتج؟) | Ask a yes/no or a single number — that is a question, not a rule |
| Answer-free | Use the **words of the question**, never the rule's key term or result | Write « الباقي معدوم » in a prompt about the remainder rule |
| Precise target | Say **what** to formulate (« اكتب القاعدة بكلماتك: متى نقول إنّ $b$ قاسم لـ $a$؟ ») | Let several rules be acceptable answers |
| Short | 1–3 sentences, read in 10 seconds | A paragraph that re-teaches the activity |
| Level | 4AM vocabulary the student already owns | A term introduced later in the lesson |

By sort of knowledge:

- `concepts` (a definition): « متى نقول إنّ …؟ » after a contrast the student saw (one case works, one doesn't).
- `regles` / `formules` (a property, a formula): « ماذا تلاحظ في كل الحالات؟ اكتب القاعدة » / « كيف تحسب … بدلالة … ؟ ».
- `methodes` (a procedure): « لو أعطيناك عددين آخرين، بأيّ خطوات تبدأ؟ اكتب الطريقة ».
- `memoriser` (a fact to keep): make them test it — « جرّب بأعداد مختلفة (7 ، 20 ، 143) ثم اكتب ما تستنتجه ».

### Reference — the prototype (`qasim-adad-tabii/knowledge.jsx`)

```js
predictPrompt: 'على الرفوف: مع 28 كتابًا في كل رفّ لم يبقَ أيّ كتاب على الأرض، ومع 26 بقيت 4 كتب. متى نقول إنّ عددًا $b$ «قاسم» لعدد $a$؟ اكتب القاعدة بكلماتك.',
predictPrompt: 'على الرفّ: $143 = 11 \\times 13$ ولم يبقَ شيء. كيف تكتب «$b$ قاسم لـ $a$» بمساواة فيها جداء، دون أن تذكر الباقي؟',
predictPrompt: 'هل العدد 1 قاسم لكل عدد طبيعي؟ وهل كل عدد قاسم لنفسه؟ جرّب بأعداد مختلفة (مثلًا 7 ، 20 ، 143) ثم اكتب ما تستنتجه.',
```

More examples (the 12 wrapped textbook boxes): `grep -rn "<PredictRule id=" apps/web/src/lessons/moyen`.

## 3. Procedure, per lesson

1. `node scripts/audit-predict-prompts.mjs --lesson <code>` → the items to write.
2. For each item, find **where it is gated**: `grep -n 'KnowledgeBrick id="<id>"' <lesson>/modules/*.jsx`.
   Read that step and **everything before it in the module** (the manipulation, its
   numbers, the guided questions): the prompt is built on them.
3. **Decide first whether it should be gated at all**:
   - the brick re-poses a rule from an EARLIER lesson or module → it is a reminder:
     set `variant="rappel"` on the brick (no prompt needed);
   - prediction makes no sense there (pure convention, a notation) → `predict: false`
     on the item;
   - **synthesis lessons** (`kind: 'synthesis'`, 14 lessons, « وضعية إدماجية »): most of
     their bricks recall the unit's rules → usually `variant="rappel"`; prompt only
     a genuinely new rule.
4. Write `predictPrompt` in `knowledge.jsx`, right after the item's `title`
   (one literal string — the audit reads it statically). JS string: `\\times`,
   `\\frac`, `\\overrightarrow` (doubled backslashes), math in `$…$`.
5. **Spoiler check** in the same step: nothing visible *before* the brick may state
   the rule (a `TextbookBox`, a `Feedback`, an `explain` of the previous question).
   A box that states it → wrap it: `<PredictRule id="<item>" prompt="…">` (one
   prediction then box + brick). An `explain` that states it is acceptable only if
   it belongs to an earlier, already-answered question.
6. **Palette check**: the student's symbol bar is derived from the item's
   `title` / `summary` / `body` (`mathSymbols.js`). If the rule needs a symbol its
   text does not contain (rare), add it to the `summary` in `$…$`.

## 4. Verification

```bash
node scripts/audit-predict-prompts.mjs --lesson <code>   # all ✓
npm run check:lessons                                     # KaTeX of the prompts, knowledge audit
(cd apps/web && npx vitest run src/lessons)               # unchanged behaviour
```

Then **read every prompt aloud against its rule**: does it give the answer away?
Could a student who did the activity answer it? A browser pass is optional per lesson;
template: `apps/web/e2e/lesson-kit/predict-rule.mjs` (real student account
`qa-eleve@smarter.dz`, reset its `student_lesson_progress` row for the lesson first;
a lesson in `draft` must be published locally for the run, then restored).

The generic script `apps/web/e2e/lesson-kit/predict-lesson.mjs` (`PREDICT_LESSON=<code>`) does this for
any lesson:

- **Expected prompt**: the brick's `predictPrompt` in `knowledge.jsx` — single quotes, double quotes or a
  template literal, read only inside that brick's entry (a brick without a prompt never borrows its
  neighbour's) — else the `prompt` of its `<PredictRule id="…">` in `modules/*.jsx`.
- **Autopilot**: one pick per question row (`role="group"`, so every row of a `BatchChoiceQuestion` gets
  answered), first option first; a number step gets `1`. When a step stays stuck on a rejected pick (the
  pressed option shown ✗), that row moves to its next option and the module is reloaded and replayed — at
  most 6 reloads per module, none for a lesson passed first time. No answer is read from the source.
- A rule the autopilot still cannot reach (a numeric answer, a lab to solve) is **reported, not failed**;
  the lesson needs **at least one** rule met.

## 5. Working in parallel

`knowledge.jsx` is per lesson, so **one author per lesson needs no lock**. Split by unit
(the audit groups by folder). Shared files are touched only if a box must be wrapped
(`modules/*.jsx` of that lesson — still per lesson). Nothing to regenerate or deploy
for prompts alone: no migration, no registry export.

## 6. Done means

- `audit-predict-prompts` reports every gated rule prompted (or deliberately
  `rappel` / `predict: false`);
- `--strict` added to `check:lessons`;
- `KNOWLEDGE_DEPENDENCY.md` § « أتوقّع القاعدة » « Couverture » paragraph updated.
