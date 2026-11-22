# Rollout « مسائل » + « أتوقّع القاعدة » — common brief for the lesson authors (2026-10-06)

Repository: `/home/abdennour/websites/smarter-academy/smarter-academy-dz` (Arabic-first RTL platform, Algerian 4AM).
You are ONE of several authors working in parallel, **one lesson each**. Two features were prototyped and validated by
the owner on ONE lesson (`qasim-adad-tabii`, unit 1 lesson 1); you roll them out to YOUR lesson. The engine is DONE and
must not be redesigned: this is **content + wiring** work. Read this whole brief first.

## 0. Read before writing (in this order — really read them)

1. `CLAUDE.md` (root), then `docs/README.md`.
2. `docs/lessons/MASAIL_GENERATION_GUIDE.md` — authoritative for A (owner rules R1–R7, design method §5, data schema §6,
   wiring checklist §7, validation §8, pitfalls §10).
3. `docs/lessons/PREDICT_PROMPT_GUIDE.md` — authoritative for B (criteria §2, per-lesson procedure §3, verification §4).
4. `docs/architecture/KNOWLEDGE_DEPENDENCY.md` § « أتوقّع القاعدة », `docs/architecture/LESSON_CONTRACT.md` § Modules « مسائل »,
   `docs/architecture/ARABIC_RTL_CONTRACT.md` (bidi, every formula in `$…$`, amounts, `isolateMath`).
5. The reference lesson, end to end:
   `apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/`
   (`lesson.config.js` › `lessonProblem`, `resources` situation rows, modules 4–7; `content/problems.js`; `content/problems.test.js`;
   `modules/Module04Masala1.jsx` … `Module07Itqan.jsx`; `knowledge.jsx` `predictPrompt` fields; `modules/Module01AlMaktaba.jsx` › `LessonProblemCard`).
6. The engine (read, do not edit): `apps/web/src/lessons/common/problems/guidedProblem.js` (`validateProblem`, `demandsOf`).
7. YOUR lesson, entirely: `lesson.config.js` (`skills`, `teachingScope.include/exclude`, `resources` — find the module-1 manipulation of
   level `advanced`), `knowledge.jsx`, every module file, `content/*`. And the unit's textbook extraction `docs/sources/4am/unit<N>/extraction.json`
   if you need the textbook's context (never copy a textbook statement into a مسألة).

## 1. What you deliver (per lesson, A and B together)

### A. Three « مسائل » (MASAIL guide §5–§7)

- `content/problems.js` — `PROBLEMS` (3) + `PROBLEM`, `source: addition('exam_style_problem')` (import `addition` from `../../_unit/unitMeta.js`).
- `content/problems.test.js` — modelled on the pilot's: `validateProblem` on each; module layout (numbers, slugs, `practice_lab`,
  evaluation last, `lessonProblem.module`, statement of masala-1 === `lessonProblem.statement`); every demand has a non-solution answer;
  **every `expected` and every equality in `explain`/`lines`/options RECOMPUTED with arithmetic from the statement's numbers**
  (`div`, products, fractions, roots…). Use exact arithmetic where the lesson needs it (fractions: compare numerators/denominators
  as integers; surds/vectors/trig: use the lesson's own `packages/core/arithmetic/*.js` helpers or plain JS, as the lesson's other
  tests do). A wrong number in a model exercise is the worst possible defect.
- Three module files `modules/Module0<N>Masala<K>.jsx` (pilot shape, NO footer, NO KnowledgeSnapshot; `estimatedTime="8 دقائق"`
  or `"6 دقائق"` when the table says 6). **Import depth**: count the `../` from YOUR `modules/` folder to `lessons/common/`
  (copy it from an existing module file of your lesson — never from the pilot blindly).
- The evaluation file renamed to its new number (`git mv`-equivalent: create the new file, delete the old) with `getNavLinks(n)` /
  `moduleNumber={n}` (and any other occurrence of the old number inside it) updated; rename its default-exported function too.
  Check every BossFinal `skills.*.module` still points at a TEACHING module (they normally do; do not change them otherwise).
- `lesson.config.js`: `lessonProblem: { module, title, statement }` (literals); 3 modules `track: 'problem'` (pilot shape, ids
  zero-padded `'05'`, slugs `masala-1..3`, `stage: 'practice_lab'`, `teachesLearningPointIds` = the الكفاءات each problem uses,
  `color: 'amber', style: 'featured', estimatedMin: <table>, difficulty: 3, actionText: 'أحلّ المسألة'`); the evaluation renumbered
  (`id`, `number`; keep slug); 3 `resources` `kind: 'situation'` (`code: 'masala-K'`, `module`, `title`, `learningPointIds`).
  Update the header comment of the config (one line: « puis trois « مسائل » de la plateforme (modules X–Y) »). **Do NOT touch**
  `estimatedDurationMin`, titles, `skills`, LP ids, or anything that mirrors owner metadata.
- Module 1 reminder: `<LessonProblemCard problem={LESSON_CONFIG.lessonProblem} compact />` at the END of the step of module 1 that
  holds the ADVANCED manipulation (or the last step of module 1 if the levels share a step). Import it from
  `common/problems/LessonProblemCard` directly (not the folder index). If module 1 does not import `LESSON_CONFIG` yet, add it.
- Progress renumbering, client side — ONE line, **through the lock** (§4):
  `  '<code>': [{ version: 2, map: { <oldEval>: <newEval> } }],` inserted before the anchor
  `  // <<masail-rollout: one line per lesson, inserted above this anchor>>` of `packages/core/progress/moduleLayoutMigrations.js`.
  The lead writes the Laravel migration for the whole batch — do not.

### B. The `predictPrompt`s (PREDICT guide §2–§3)

- `node scripts/audit-predict-prompts.mjs --lesson <code>` lists the gated rules. For EACH: find the brick
  (`grep -n 'KnowledgeBrick id="<id>"' modules/*.jsx`), read the step and everything before it in the module, then decide:
  - the brick re-poses a rule from an EARLIER lesson or an earlier module of this lesson → `variant="rappel"` on that brick
    (check the item's `module` in knowledge.jsx and whether another brick already poses it first);
  - prediction makes no sense (pure convention, notation, a name) → `predict: false` on the item;
  - otherwise → `predictPrompt: '…'` in `knowledge.jsx`, right after the item's `title` (ONE string literal; `\\times`, `\\frac`…).
- A prompt is ANCHORED on the numbers/gesture the student just used in THAT module, OPEN (متى…؟ كيف…؟ ماذا تستنتج؟), never
  contains the rule's key term or result, names precisely WHAT to formulate, 1–3 sentences, 4AM vocabulary already owned.
- Spoiler check: nothing visible just BEFORE the brick may state the rule (a `TextbookBox`, a `Feedback`, the `explain` of the
  question immediately before). A box stating it → wrap it `<PredictRule id="<item>" prompt="…">…</PredictRule>` (import as other
  lessons do: `grep -rn "<PredictRule id=" apps/web/src/lessons/moyen` — the import line is in those files).
- Palette: the symbol bar comes from the item's `title`/`summary`/`body`. Do NOT add generic symbol lists; only if the rule needs a
  symbol its text lacks, add it inside a `$…$` of the `summary`… but summaries are plain text (no `$`) in this repo — so put it in `body`.
- Target: `--lesson <code>` reports every gated rule ✓ (or deliberately `rappel` / `predict: false`).

## 2. Problem design — the owner's bar (MASAIL guide §3, §5)

- Problem 1 = « مسألة الدرس »: the ADVANCED manipulation's world (same instrument, same kind of objects) with NEW numbers.
  Problems 2 and 3: two DIFFERENT, realistic Algerian situations (cooperative, school trip, souk, bakery, sports club,
  construction site, olive harvest, Ramadan couffin, wedding hall, transport, the wilaya's stadium…), plausible quantities,
  money in « دج » (never « DA » in Arabic). Never present it as a textbook exercise; never copy one.
  **Variety across lessons (lead review, unit 1):** the examples above are not a menu — four unit-1 authors all picked
  « قفة رمضان ». Before choosing, list the contexts already used in the whole 4AM tree
  (`grep -h "context:\|title: 'مسألة" apps/web/src/lessons/moyen/4am/*/*/*/content/problems.js`) and pick contexts used by NO
  lesson of your unit and at most once elsewhere. Prefer contexts that fit your lesson's mathematics naturally (a graph of a
  taxi fare for an affine function, a stadium ramp for trigonometry, a mosaic for rotations…).
- ONLY the lesson's الكفاءات (`teachingScope.include`) and earlier knowledge; never a notion in `teachingScope.exclude`
  or a later lesson's notion.
- 3 questions of increasing depth: 1) application → 2) interpretation (a variation, a choice, a remainder, a case that fails) →
  3) real-world consequence (often money/time/quantity) using results of 1)–2).
- `data` (sort sub-step, question 1 only): 4–5 useful items + 1–2 useless ones, **at least one useless item is a number**. Plain
  strings, no `$`.
- **EVERY demand has its OWN answer step** — count every « ؟ » and every imperative بيّن / احسب / استنتج / عبّر / عيّن in `question`;
  `asks` has one entry per demand; each demand k gets a `numeric` role `answer` / `choice` role `conclude` / `batch` with `ask: k`.
  « 2 questions, 1 input » is THE defect the owner rejected. Avoid the words بيّن/احسب/… inside `question` when they are not a
  demand (e.g. « بين » without شدّة is fine — it is the preposition).
- Distractors = real misconceptions (reversed divisor, wrong total, wrong operation, forgot the decoy, sign error, wrong formula…),
  never jokes. `explain` gives the REASON (the equality, the rule), not « الجواب الصحيح هو ».
- Each question ends with `{ kind: 'solution', lines: [...] }`, 2–4 lines, as on an exam copy, last line answering in the
  situation's words.
- Numbers computable by hand at 4AM level; a real trap (one candidate fails, one works).
- `requires` with the lesson's knowledge ids (and the priorKnowledge ids) where a sub-step relies on one.
- Math in `$…$` (one island per formula), Arabic prose around; amounts « 38850 دج » (number then دج, outside `$` is fine);
  never a bare « a/b », « √ », « x² » or point names in Arabic prose: put them in `$…$`.
- Terminology: « الكفاءة / الكفاءات », never « نقاط التعلّم ».

### Lessons from unit 1 (apply them)

- « برهن / أثبت » are demands too (the engine only counts ؟ بيّن احسب استنتج عبّر عيّن): declare them in `asks` and answer each.
- A demand whose answer is a fraction, a surd, a vector or an expression: answer it with a `choice` role `conclude` whose
  options are the candidate forms (after `compute` steps for the numbers), not with two numeric inputs — the demand chip shows only
  the first answering value.
- `content/problems.js` imports keep their `.js` extension (`../../_unit/unitMeta.js`, `../lesson.config.js`): the browser test
  imports the file in Node.
- A test that parses and EVALUATES every `$a = b \times c + r$` / `$\frac{…}{…}$` equality written in explains, lines and options
  (as several unit-1 tests do) is strongly recommended — mutate one number once to prove it fails.
- If a shared lab's own text (engine/i18n) states a rule before its brick, do NOT edit it: list it in your report.
- When you renumber the evaluation, also fix its `desc` if it still says « نقطة/نقاط/نقطتي التعلّم » → « الكفاءة/الكفاءات/الكفاءتين »
  (terminology rule; 9 lesson configs still carry it on 2026-10-06).
- **Reserved contexts (from unit 3 on).** Parallel authors of one unit could not see each other's contexts (unit 2: two
  identical « زليج 180 dm² » panels, two civil-protection ladders, two carpet workshops). Your launch prompt now RESERVES
  context families for your problems 2 and 3: use them (or ask the lead), and never a family reserved for another author.
  Problem 1 stays in your lab's world. Re-grep all `problems.js` before reporting.
- **Statement support (engine, 2026-10-06).** A problem may carry `figure` (GeoFigure data, or SpaceFigure with
  `kind: 'space'`), `visual` (CoordPlane props: function graphs, points — the practice `visual` format) and `table`
  (`{ head, rows }`). A statement or question that says « الشكل / الجدول / التمثيل البياني » MUST show it. In
  geometry, also assert `figureQuality(fig)` is `[]` (geoFigure.js) in your problems test. MASAIL guide §6.
  **Problem 1's support lives in `LESSON_CONFIG.lessonProblem`** (pure literals) and problems.js references it — the
  lesson card draws it (validator-enforced). A reference without support (« في الشكل », « الجدول المقابل », « بقراءة
  بيانية »…) is rejected by validateProblem.
- Lessons whose labs live in the module `intro` (both levels): put `LessonProblemCard` at the end of the LAST step of module 1.
- **Locked prompts (lead review, unit 1 screenshots).** Every sub-step's `prompt` is VISIBLE from the start, greyed. It must
  never show a value an earlier sub-step asks for when that value answers a demand or is a division result: a Euclid chain
  written « باقي قسمة 91 على 29 » after « باقي قسمة 120 على 91 » gives every remainder away; « ماذا يمثّل العدد $\frac{8}{15}$؟ »
  gives the demand's answer. Keep the FIRST division with its numbers (they are data), then word the next lines like the
  algorithm (« السطر الثاني: باقي قسمة القاسم السابق على الباقي الذي وجدته: »), « ماذا يمثّل هذا العدد…؟ ». A trivial re-use
  (« 268 » = 270 − 2) is acceptable (owner-validated pilot). `explain` and solution `lines` may show everything.

## 3. Verify (before reporting)

```bash
cd <repo>
node scripts/audit-predict-prompts.mjs --lesson <code>          # all ✓
node docs/sources/4am/masail-rollout/audit-locked-leaks.mjs <code>   # no ✗ (see « Locked prompts » below)
(cd apps/web && npx vitest run src/lessons/moyen/4am/<path-to-your-lesson>)
(cd packages/core && npx vitest run progress)
npm run check:lessons 2>&1 | grep -i -E "<code>|error|✗|❌" | head -40   # other authors work in parallel: judge only YOUR lesson's lines
```
Then re-read every statement, demand, number and prompt aloud. Do NOT run the exports, `php artisan`, the e2e scripts, nor edit
any doc: the lead does it for the batch.

## 4. Shared files — the lock

Only ONE shared file is yours to touch: `packages/core/progress/moduleLayoutMigrations.js`, and only through
`docs/sources/4am/masail-rollout/locked_edit.py`:
```bash
printf "  // <<masail-rollout: one line per lesson, inserted above this anchor>>" > <scratch>/anchor.txt
printf "  '<code>': [{ version: 2, map: { 4: 7 } }],\n" > <scratch>/line.txt
python3 docs/sources/4am/masail-rollout/locked_edit.py append-before packages/core/progress/moduleLayoutMigrations.js <scratch>/anchor.txt <scratch>/line.txt
```
Everything else outside your lesson folder is OFF-LIMITS (engine, i18n, other lessons, `_unit/`, docs, e2e, migrations, catalogue
JSON). If the engine blocks you with a real bug, STOP and describe it in your report — do not fix it yourself.
No git commit/push. No deploy.

## 5. Report (your final message — the lead reviews EVERYTHING from it)

1. Files created / modified / deleted.
2. The three problems IN FULL: title, statement, each question with its `asks`, and for each numeric answer the computation
   that gives it (e.g. `756 = 32 × 23 + 20`). The decoy(s).
3. Every predict decision: item id → prompt text | `rappel` (why) | `predict: false` (why); any `PredictRule` wrapping.
4. Module numbers before → after; the line added to moduleLayoutMigrations.js; total estimatedMin before → after (≤ 90).
5. Test / audit / check results (paste the relevant lines). Anything doubtful you want the lead to decide.
