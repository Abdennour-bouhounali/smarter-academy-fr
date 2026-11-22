# Generating the « مسائل » of a lesson — exam-style problem modules

> **Authoritative** for designing, authoring, wiring and validating the three
> « مسألة » modules of a 4AM lesson. The engine contract is summarised in
> [`../architecture/LESSON_CONTRACT.md`](../architecture/LESSON_CONTRACT.md) § Modules « مسائل »;
> the progress renumbering in [`../architecture/PROGRESS_MODEL.md`](../architecture/PROGRESS_MODEL.md)
> § Renumérotation des modules. When this guide and the code disagree, the code
> (`apps/web/src/lessons/common/problems/`) wins — then fix this guide.

**Status (2026-10-06).** Prototype validated by the owner on ONE lesson:
`qasim-adad-tabii` (unit 1, lesson 1). Use it as the reference:
`apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/qasim-adad-tabii/`
(`content/problems.js`, `content/problems.test.js`, `modules/Module04Masala1.jsx` … `Module07Itqan.jsx`).

**Rollout to every regular 4AM lesson (started 2026-10-06)** — one unit at a time, one author per lesson,
common brief and lock in [`../sources/4am/masail-rollout/`](../sources/4am/masail-rollout/) (`brief-authors.md`
carries the lessons learned per unit), one Laravel remap migration per unit
(`2026_10_06_0000NN_remap_problem_modules_unit<N>_*.php`), browser tests for any lesson:
`apps/web/e2e/lesson-kit/masail-lesson.mjs` (`MASAIL_LESSON=<code>`) and `predict-lesson.mjs` (`PREDICT_LESSON=<code>`).

| Unit | Lessons with مسائل | Remap migration | Status |
|---|---|---|---|
| 1 « الأعداد الطبيعيّة والأعداد النّاطقة » | 8 / 8 (pilot + 7) | `2026_10_06_000001_remap_problem_modules_unit1_aadad.php` | done 2026-10-06 |
| 2 « الحساب على الجذور » | 5 / 5 | `2026_10_06_000002_remap_problem_modules_unit2_judhur.php` | done 2026-10-06 |
| 3 « الحساب الحرفي » | 3 / 3 | `2026_10_06_000003_remap_problem_modules_unit3_harfi.php` | done 2026-10-06 |
| 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » | 4 / 4 | `2026_10_06_000004_remap_problem_modules_unit4_muadalat.php` | done 2026-10-06 |
| 5 « جمل معادلتين من الدرجة الأولى بمجهولين » | 3 / 3 | `2026_10_06_000005_remap_problem_modules_unit5_jumal.php` | done 2026-10-06 |
| 6 « الدالة الخطية والتناسبية » | 5 / 5 | `2026_10_06_000006_remap_problem_modules_unit6_khattiya.php` | done 2026-10-06 |
| 7 « الدالة التآلفية » | 5 / 5 | `2026_10_06_000007_remap_problem_modules_unit7_taalufiya.php` | done 2026-10-06 |
| 8 « الإحصاء » | 4 / 4 | `2026_10_06_000008_remap_problem_modules_unit8_ihsa.php` | done 2026-10-06 |
| 9 « خاصية طالس » | 3 / 3 | `2026_10_07_000009_remap_problem_modules_unit9_talis.php` | done 2026-10-07 |
| 10 « حساب المثلثات » | 4 / 4 | `2026_10_07_000010_remap_problem_modules_unit10_muthallathat.php` | done 2026-10-07 |
| 11 « الأشعة والانسحاب » | 4 / 4 | `2026_10_07_000011_remap_problem_modules_unit11_ashia.php` | done 2026-10-07 |
| 12 « الأشعة في معلم » | 4 / 4 | `2026_10_07_000012_remap_problem_modules_unit12_maalam.php` | done 2026-10-07 |
| 13 « الدوران - الزوايا - المضلّعات المنتظمة » | 4 / 4 | `2026_10_07_000013_remap_problem_modules_unit13_dawaran.php` | done 2026-10-07 |
| 14 « الهندسة في الفضاء » | 4 / 4 | `2026_10_07_000014_remap_problem_modules_unit14_fada.php` | done 2026-10-07 |

**Rollout complete (2026-10-07): 60 / 60 regular lessons, 180 problems.** The 14 synthesis lessons have
none (owner rule). Client map (`moduleLayoutMigrations.js`) and the 14 server migrations cover the same
60 lessons (cross-checked). New modules take their lesson's state at import (since 2026-11-11): nothing to publish by hand.

---

## 1. Why these modules exist

After every module of a lesson, the student still has never solved **one complete
exam exercise**: a real situation in words, data to pick out (and data to ignore),
a translation into mathematics, calculations, an answer to each demand, and a
written solution as on the exam copy. The lesson modules teach the الكفاءات one by
one; the مسائل train the **problem-solving chain** that the امتحان actually grades.

They **never** change the student's الكفاءات (mastery). Mastery comes only from the
إختبار أولي.

## 2. What the student experiences

1. **Lesson page** — a « مسألة الدرس » card (`LessonProblemCard`) shows the
   statement of problem 1 *before* anything is taught: « read it now, think about
   it; you will solve it step by step at the end ».
2. **Module 1** — after the opening lab, the same card again: the problem continues
   the advanced manipulation (same instrument, other numbers).
3. **Modules N, N+1, N+2** — the three مسائل, just before the test:
   - the brief shows the **whole statement and all numbered questions**, like the exam sheet;
   - each question 1), 2), 3) is one step of the module;
   - under each question: « المطلوب في هذا السؤال — لكلّ مطلب جوابه » lists its
     demands; each gets ✓ and the student's value as it is answered;
   - **every sub-step is visible from the start**; the ones not reached yet are
     greyed 🔒 with their instruction and the demand they answer (never the answer);
   - sub-steps open one by one: أستخرج المعطيات → أترجم → أحسب → أستنتج / أكتب الجواب → أحرّر الحلّ;
   - a wrong answer shows the correction and the path continues (non-blocking);
   - each question ends with the student **writing** the solution (`MathTextArea`,
     whose symbol palette holds only the symbols of the model solution's `lines`),
     then revealing the model solution **one line per click**.
4. **Test** — unchanged, always open, renumbered after the مسائل.

## 3. Owner rules — non-negotiable

| # | Rule | Enforced by |
|---|---|---|
| R1 | 3 problem modules per lesson; problem 1 is « مسألة الدرس », shown at the start and tied to the lesson's **advanced** manipulation; problems 2 and 3 are new situations | review + `lessonProblem` |
| R2 | Placed **before** the evaluation; they count in **completion**, never in **mastery** | validator (stage `practice_lab`, no `assessment`) |
| R3 | Solving is **always guided** (sub-steps) | `GuidedProblem` |
| R4 | **Each demand has its own answer.** « كم حافلة؟ وكم مقعدًا؟ » = two inputs, never one — and the student must **see** both from the start | validator (`asks`/`ask`) + UI (demands list, locked steps visible) |
| R5 | Long, non-checkable answers (redaction, تعليل): a real text area; the reveal button is active only after writing; the model is revealed **line by line** | `WrittenAnswer` |
| R6 | **No `KnowledgeSnapshot`** (« للتذكّر… بطاقتي ») in these modules | review (module files have no footer) |
| R7 | « These exercises are the model: they must be very strong » — exam quality, every number verified | `problems.test.js` + review |

## 4. Engine facts (do not fight them)

- `stage: 'practice_lab'`, `track: 'problem'`. The validator requires journey order,
  so problem modules come **before** `evaluation`. The evaluation is always unlocked
  (`packages/core/lessonAccess.js`), so the مسائل never block the test.
- **Numbering**: problems take the numbers of the old evaluation onward; the
  evaluation is renumbered after them (pilot: 4, 5, 6 → test 7). Completed modules
  are stored **by number** → a one-time layout migration is mandatory (§7.6).
- Completion counts every module equally → the مسائل are required for « lesson completed ».
- **Duration**: `estimatedMin: 8` each by default. They are excluded from the
  comparison with the owner's catalogue duration but **count toward the 90-min cap**.
  `bahth-pgcd` and `tawzif-khawass-judhur` are already at 71 min → use `6` each there.
- **Synthesis lessons** (`kind: 'synthesis'`, the 14 « وضعية إدماجية » lessons) have no مسائل **by default**
  (they are already integrative situations). **First exception, owner decision 2026-10-13: `wadiya-idmajiya-aadad`**
  (unit 1's « أدمج تعلّماتي ») carries **six « وضعيات تدريبية »** (modules 1–6, titled « الوضعية التدريبية N — … », `track: 'problem'`, `content/problems.js`,
  ids `wadiya-1…6`) so the student practises many PGCD situations before the one he is evaluated on: module 7
  « تحليل الوضعية النهائية للاختبار » (read + analyse, no solving; stage `practice_lab`, no `trigger` — `REQUIRED_STAGES_BY_KIND.synthesis`
  is now `practice_lab, evaluation`) then module 8 « وضعية الاختبار النهائي » = the textbook's aprons challenge, p. 7,
  936 / 845 — never used in a training; test renumbered 3 → 8; « أؤكّد تعلّماتي » and the p. 16 قصر الرياس situation were removed the same day, owner decision;
  remap `2026_10_13_000001_remap_wadiya_modules_idmajiya_aadad.php` `{1 → 7, 2 → 0, 3 → 8}` + the `moduleLayoutMigrations.js` entry;
  textbook tracing: `extraction.json` marks `situation` « notIntegrated » (checker support added), `qcm` lives in the lessons' own tests,
  `challenge` is declared `duplicatedIn` this lesson). Differences from a regular lesson's three مسائل: SIX of them; no `lessonProblem`
  card (the lesson already has its situation, module 1); statements come from the owner's sheet
  « رياضيات ببساطة — وضعيات إدماجية حول PGCD » (declared `addition('exam_style_problem')`, never textbook); 6–9 min each
  (the lesson stays ≤ 90 min: 87). Same engine, validator and `problems.test.js` pattern (recomputes every number;
  its evaluator reads `PGCD(a ; b ; c)` for three numbers). Reuse this recipe if the owner extends another synthesis.

## 5. Designing the three problems (the pedagogical work)

### 5.1 Scope — the lesson, nothing else

Use **only** the lesson's الكفاءات (its `teachingScope.include`) and earlier knowledge.
Never use a later lesson's notion (`teachingScope.exclude`). Example: lesson 1
« قاسم عدد طبيعي » uses Euclidean division, remainder 0 ⇔ divisor, `a = b × q`,
the four equivalent phrasings — never « all the divisors » (lesson 2) or PGCD (lesson 4).

### 5.2 Situations

- **Problem 1 = « مسألة الدرس »**: the advanced manipulation's world with new numbers
  (pilot: the 420-book shelf → 756 books, shelves of 32 or 36, price per shelf).
- **Problems 2 and 3**: two **different** real Algerian contexts (cooperative,
  school trip, market, sports club, bakery, construction site…), plausible
  quantities, prices in **دج** (Arabic text; never « DA » inside Arabic).
- Each problem is a **platform addition**: `source: addition('exam_style_problem')`.
  Never present it as a textbook exercise; never copy a textbook statement.

### 5.3 Exam anatomy — three graded questions

Write each problem like a BEM exercise, with 3 questions of increasing depth:

| Question | Role | Pilot example (problem 3, school trip) |
|---|---|---|
| 1) | direct application of the الكفاءة on the situation's numbers | 270 participants, buses of 54: full buses? how many? |
| 2) | a variation that forces **interpretation** (a non-zero remainder, a choice, an equivalence) | 2 teachers absent → 268 = 54 × 4 + 52: how many buses? how many empty seats? |
| 3) | a **real-world consequence**, often money, using results from 1)–2) | the pupils share the rent: show 252 divides 63000, how much each pays |

A question may contain **several demands** (R4). Count them: every « ؟ » and every
imperative **بيّن / احسب / استنتج / عبّر / عيّن** is one demand. « أجرِ القسمة » and
« علّل » are not demands of their own: the first is done in `compute` sub-steps, the
second is covered by the conclusion and the written solution.

### 5.4 Data and decoys

`problem.data` feeds the sorting sub-step of question 1: 4–5 **useful** items and
1–2 **useless** ones, of which **at least one is a number** (« المكتبة مفتوحة 5 أيام »,
« 140 دجاجة », « الانطلاق على الساعة 7 »). Plain strings (no `$…$`): `InfoSorter`
uses them as labels and joins them.

### 5.5 The guided path of a question

Order the sub-steps the way an expert thinks:

| Kind / role | Label shown | Use it for | Write it so that… |
|---|---|---|---|
| `sort` / extract | أستخرج المعطيات | question 1 only | the decoy is tempting |
| `choice` / translate | أترجم إلى سؤال رياضي | turning words into the mathematical question | distractors are **real misconceptions** (reversed divisor, wrong total, wrong operation) |
| `numeric` / compute | أحسب | intermediate results (quotient, remainder, a total) | one number per input |
| `choice` / conclude | أستنتج | a conclusion or interpretation | wrong options are plausible wrong reasoning, not jokes |
| `numeric` / answer | أكتب الجواب | the final value of a demand (with `suffix: 'دج'` when money) | **one input per demand** |
| `batch` / answer | أكتب الجواب | several short items of one demand (« عبّر بأربع صيغ » → 4 sentences to complete) | each row has 2+ options |
| `solution` / written | أحرّر الحلّ كما في ورقة الامتحان | always last: the student writes, then the model line by line | lines read like a good exam copy |

Every demand `k` of `asks` must be answered by at least one sub-step carrying
`ask: k` that is **not** the written solution (a value entered or a conclusion chosen).
An interpretation step that answers no demand simply has no `ask`.

Every `explain` gives the **reason** (the equality, the rule), not « الجواب الصحيح هو … ».
Use `requires` with the lesson's knowledge ids (`knowledge.jsx`) where a sub-step
relies on one.

### 5.6 The written solution (`lines`)

2–4 lines, the way a teacher wants it on the copy: the computation with its
condition (`$756 = 32 \times 23 + 20$ مع $20 < 32$.`), the property used, then a
sentence that **answers the demand in the situation's words** (« يلزم 5 حافلات،
ويبقى $54 - 52 = 2$ مقعدان شاغران. »).

### 5.7 Numbers

- Computable **by hand** at 4AM level; avoid a calculator-only product.
- Make the **trap real**: one candidate that fails (non-zero remainder), one that works.
- Every `expected` and every equality is **recomputed** in `content/problems.test.js` (§8.2) —
  never typed only. A wrong number in a model exercise is the worst defect possible.

## 6. Data reference — `content/problems.js`

```js
import { addition } from '../../_unit/unitMeta.js';
import { LESSON_CONFIG } from '../lesson.config.js';

const SOURCE = addition('exam_style_problem');

export const PROBLEMS = [            // one per `track: 'problem'` module, in order
  {
    id: 'masala-1',
    title: 'مسألة 1 — رفوف المكتبة',            // module title
    context: LESSON_CONFIG.lessonProblem.title,  // brief title / subtitle
    headline: 'مسألة الدرس',                    // problem 1 only
    emoji: '📚',
    source: SOURCE,
    statement: LESSON_CONFIG.lessonProblem.statement, // problem 1: single source in the config
    data: [{ id, text, useful }],                // for the `sort` sub-step
    parts: [ /* 3 questions */ ],
  },
  // masala-2, masala-3: same shape, `statement` written here
];
export const PROBLEM = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
```

A complete question (pilot, problem 3, question 2 — the two-demand case):

```js
{
  label: '2)', title: 'غياب أستاذين',
  question: 'يوم الرحلة تغيّب أستاذان. أجرِ القسمة الإقليدية لعدد المشاركين الجديد على 54. كم حافلة يلزم؟ وكم مقعدًا يبقى شاغرًا؟',
  asks: ['كم حافلة يلزم؟', 'كم مقعدًا يبقى شاغرًا؟'],          // 2 « ؟ » → 2 demands
  steps: [
    { kind: 'numeric', role: 'compute', prompt: 'عدد المشاركين يوم الرحلة:', expected: 268, explain: '$270 - 2 = 268$.' },
    { kind: 'numeric', role: 'compute', requires: ['qisma-iqlidiya'], prompt: 'حاصل القسمة الإقليدية للعدد 268 على 54:', expected: 4, explain: '…' },
    { kind: 'numeric', role: 'compute', requires: ['qisma-iqlidiya'], prompt: 'باقي هذه القسمة:', expected: 52, explain: '…' },
    { kind: 'choice', role: 'conclude', prompt: 'ماذا يعني الباقي 52 في هذه الوضعية؟',      // interpretation: no `ask`
      options: ['52 مشاركًا لا يجدون مكانًا في 4 حافلات: تلزم حافلة خامسة', '52 مشاركًا يبقون في المتوسطة', 'نحتاج 52 حافلة'], correct: 0, explain: '…' },
    { kind: 'numeric', role: 'answer', ask: 0, prompt: 'عدد الحافلات اللازمة:', expected: 5, explain: '…' },   // demand 1
    { kind: 'numeric', role: 'answer', ask: 1, prompt: 'عدد المقاعد الشاغرة:', expected: 2, explain: '…' },    // demand 2
    { kind: 'solution', ask: 0, lines: [
      '$268 = 54 \\times 4 + 52$ مع $52 < 54$.',
      'الباقي ليس معدومًا: 4 حافلات لا تكفي، ويركب 52 مشاركًا حافلة خامسة.',
      'يلزم 5 حافلات، ويبقى $54 - 52 = 2$ مقعدان شاغران.',
    ] },
  ],
}
```

Field reference:

| Field | Where | Notes |
|---|---|---|
| `asks` | part | one short label per demand, ≥ `demandsOf(question)` |
| `ask: k` | sub-step | only `numeric` role `answer`, `choice` role `conclude`, `batch`, `solution`; a numeric `answer` **must** have it |
| `prompt` | sub-step | also shown while the step is locked — never put its answer in it, nor an EARLIER step's demand answer or division result (audit: `audit-locked-leaks.mjs`) |
| `options`, `correct`, `cols` | `choice` | `cols` default 1; 2 for short formulas |
| `expected`, `suffix`, `prefix`, `display` | `numeric` | `expected` is a number literal; decimals parsed by `parseDec` |
| `rows: [{ label, options, correct, correction }]` | `batch` | label like `'12 … 2028'` |
| `lines` | `solution` | ≥ 2 |
| `requires` | any | knowledge ids of the lesson |
| `figure` | problem | optional — a declarative `GeoFigure` (or `SpaceFigure` with `kind: 'space'`) shown under the statement; validated by `validateGeoFigure` / `validateSpaceFigure`. A statement that says « الشكل » MUST carry it (added 2026-10-06 for the graph / geometry units) |
| `visual` | problem | optional — `CoordPlane` props (a function graph, points to read): the same closed prop list and 460 px cap as the practice `visual` |
| `table` | problem | optional — `{ head, rows, caption? }`, every row as long as `head`, first cell of a row = its header; numbers isolated LTR (`ProblemTable.jsx`) |
| `tone` | problem | optional (2026-10-13) — one of `indigo violet amber emerald teal sky rose`; default `amber`. Colours the question card, the demand chips and the brief (`problemTone.js`, classes written in full for Tailwind). Give each مسألة of a lesson its own tone when they are meant to feel like distinct situations |
| `illustration` | problem | the **picture of the situation**, drawn in SVG (`ProblemIllustration.jsx`; data/validator `problemIllustration.js`, closed names in `situationKinds.js`, generic drawers in `situationDrawings.jsx`); shown first under the statement. **Since 2026-10-13 EVERY « مسألة » carries a drawn support** — `illustration`, or a `figure` / `visual` / `table` / `scene` — enforced by `common/problems/masailIllustrations.test.js`. Drawn in code, never a raster. Fourteen kinds. The six of the owner's sheet: `books`, `bouquets`, `field`, `orchard`, `glass`, `hall`. Eight generic ones, driven by data: `plan` (top view with dimension pills — `shape` rect/square/ring/cut/tri/grow, `fill` theme, `diag`, `area`, `border`, `grid:true` = generic « ؟ » tiling), `stacks` (1–3 rows of counted icons), `tags` (1–3 tariff / offer / bill cards, fixed + variable lines), `tanks` (1–3 containers with a level), `route` (two places, distance, ≤ 2 vehicles), `ladder` (right triangle of a ladder / guyed mast; the unknown side shows « ؟ »), `timeline` (icon + 1–4 marks, a mark without `value` shows « ؟ »), `scene` (big icon + 1–4 data chips; the fallback for budget / ages / cards situations). Icons: `ICON_KINDS`. **Rules**: it illustrates the SITUATION, never the solution — every digit it prints must be a number of the statement (`data[].text` / `parts[].question` included; the test checks it), the unknown is omitted (⇒ « ؟ »), a total or a derived value is never drawn; algebraic dimensions are plain strings (`'2x + 3'`); Arabic `ariaLabel` required; a `masala-1` that reads `LESSON_CONFIG.lessonProblem` keeps its drawing in `lessonProblem.illustration` (the lesson-index card and the module show the same data, like `figure`). |
| `scene` | problem | optional (2026-10-13) — an **interactive drawn scene** (`ProblemScene.jsx`, pure logic `problemScene.js`, validated by `validateScene`): the student moves ONE number (groups / post spacing / tile side) and the SVG shows whether the division is exact (remainder hatched, `total = d × q + r` recomputed). Kinds: `share` (items split in n groups), `fence` (posts every d around a `rect` or `triangle`, one at each corner), `tiles` (rectangle paved with squares). Rules: it never gives the answer (only « sans reste » / « il reste r » — no « c'est le plus grand », no post or tile count); every number is one of the statement's (cm ↔ m allowed); `ariaLabel` in Arabic; UI strings in `lesson.json › problem.scene.*`; hatch colour is rose, so avoid the `rose` tone for a `share` scene. Engine capability only: no lesson uses it now (the six « وضعيات » of `wadiya-idmajiya-aadad` had it and the owner removed it on 2026-10-13 — they keep their `illustration` and `tone`) |
| — | problem | a statement or question that REFERS to a support (« في الشكل », « الجدول المقابل », « بقراءة بيانية », « في التمثيل البياني »… — `SUPPORT_REFERENCE` in guidedProblem.js; « مربّع الشكل » is not a reference) without `figure`/`visual`/`table` is rejected by `validateProblem` |

## 7. Wiring checklist (per lesson)

1. **`lesson.config.js`**
   - `lessonProblem: { module: <first problem number>, title, statement }` (literals). If مسألة 1 has a
     `figure` / `visual` / `table`, put that literal HERE too (pure literals, no constant from problems.js) and
     reference it from problems.js (`visual: LESSON_CONFIG.lessonProblem.visual`): the « مسألة الدرس » card
     (`LessonProblemCard`, lesson page + module 1) draws it — `validate-lessons` enforces the single source.
   - Three modules before the evaluation:
     ```js
     { id: '04', number: 4, slug: 'masala-1', path: `${LESSON_BASE_PATH}/masala-1`,
       title: 'مسألة 1 — …', desc: '…', stage: 'practice_lab', track: 'problem',
       teachesLearningPointIds: [/* the الكفاءات it uses */],
       color: 'amber', style: 'featured', estimatedMin: 8, difficulty: 3, actionText: 'أحلّ المسألة' },
     ```
   - Renumber the evaluation (`id`, `number`; keep its `slug`).
   - Three `resources` of `kind: 'situation'` (`code: 'masala-N'`, `module`, `title`, `learningPointIds`).
2. **`content/problems.js`** (§6) and **`content/problems.test.js`** (§8.2).
3. **Module files** — `modules/Module0NMasalaK.jsx`, no footer (R6):
   ```jsx
   import { GuidedProblem } from '../../../../../../common/problems';
   import { MODULE_CTX, getNavLinks } from '../moduleContext';
   import { PROBLEM } from '../content/problems';

   export default function Module04Masala1() {
     return <GuidedProblem ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
       problem={PROBLEM['masala-1']} estimatedTime="8 دقائق" />;
   }
   ```
   (adjust the `../` depth to the lesson's folder depth.)
4. **Rename the evaluation file** to its new number (`Module04Itqan.jsx` → `Module07Itqan.jsx`)
   and update `getNavLinks(n)` / `moduleNumber={n}` inside. Check every `skills.module`
   of its `BossFinal` still points at a teaching module.
5. **Module 1 reminder** — at the end of the opening activity:
   `<LessonProblemCard problem={LESSON_CONFIG.lessonProblem} compact />`
   (import `LessonProblemCard` from `common/problems/LessonProblemCard` directly, not
   from the folder index — keeps `GuidedProblem` out of that chunk).
6. **Progress renumbering — both sides, same change** (`PROGRESS_MODEL.md`):
   - client: add the lesson to `MODULE_LAYOUT_MIGRATIONS` in
     `packages/core/progress/moduleLayoutMigrations.js`
     (`'<code>': [{ version: 2, map: { <oldEval>: <newEval> } }]`);
   - server: a **new** Laravel migration with the same map (copy
     `2026_10_05_000003_remap_problem_modules_qasim_adad_tabii.php`; never edit an
     executed migration — one new migration per batch, map of all its lessons).
7. **Regenerate and import**:
   `node packages/core/curriculum/exportContentRegistry.mjs`,
   `node packages/core/curriculum/exportCurriculum.mjs`, then in `apps/api`:
   `php artisan migrate`, `php artisan smarter:import-curriculum`,
   `php artisan smarter:import-content-registry`.
8. **Publish**: nothing to do — since 2026-11-11 a module (the renumbered
   evaluation included) takes its lesson's state at import.

## 8. Validation

### 8.1 What the validator enforces (`npm run check:lessons`)

`scripts/validate-lessons.mjs` + `validateProblem()` (`common/problems/guidedProblem.js`):
`track` is `'problem'` and stage `practice_lab`; `content/problems.js` exists with exactly
one problem per problem module; each problem has id/title/statement/source, ≥ 2 parts;
each part ≥ 2 sub-steps, ends with `solution` (≥ 2 lines); `sort` only in part 1 with
useful **and** useless data; valid kinds/roles/options/`correct`; numeric `expected` is a
number; **`asks` ≥ demands in the question and every demand answered by its own
non-solution step**; numeric `answer` names its `ask`. Plus all the usual lesson checks
(non-blocking, katex, knowledge `requires`, routes, coverage, 90-min cap).

### 8.2 The lesson's `content/problems.test.js` (mandatory)

Model it on the pilot's. It must:
- run `validateProblem` on every problem;
- assert the module layout (numbers, slugs, `practice_lab`, evaluation last, `lessonProblem.module`);
- assert every demand has a non-solution answer step;
- **recompute every `expected`** from the statement's numbers with arithmetic
  (`div(a, b)`, products, differences), so a typo fails the test.

### 8.3 Browser QA

Run `apps/web/e2e/lesson-kit/masail-lesson.mjs` with `MASAIL_LESSON=<code>` (the pilot script `masail-pilot.mjs`, generalised; real student account
`qa-eleve@smarter.dz`, API on :8000): it answers **every sub-step wrong**, checks each
still advances, checks demands listed + one answer slot each visible at opening, all
demands ticked at the end, modules completed, **no POST to evidence / final-test**,
the test open, module-1 reminder, the statement support drawn on the « مسألة الدرس »
card and in the brief (`[data-geo-figure]`, `[data-space-figure]` for a 3D `SpaceFigure`,
`[data-problem-visual] svg`, `[data-problem-table]`), no horizontal overflow at phone
width, no console error. Reset the QA student's `student_lesson_progress` row first, otherwise the
modules open in revisit mode (everything unlocked) and hide the guided flow. If the
lesson is draft for review, publish it locally only for the run and restore it.
Then **look at the screenshots** (desktop and phone) — RTL of every equality and amount.

## 9. Text and RTL rules

- Formulas in `$…$` (`\\times`, `\\ldots` in JS strings); plain Arabic sentences
  around them. Amounts « 38850 دج ».
- Statement, questions and prompts in the textbook's register (أجرِ، بيّن، احسب، استنتج، علّل).
- Interface strings come from the `lesson` i18n namespace (`problem.*`); never hard-code chrome.
- The student's typed calculations are isolated LTR automatically (`isolateMath`):
  nothing to do in content, but never bypass `WrittenAnswer` with a raw `<textarea>`.
- Terminology: « الكفاءة / الكفاءات », never « نقاط التعلّم ».

## 10. Pitfalls met during the pilot

| Symptom | Cause | Rule now |
|---|---|---|
| « 2 questions, 1 input » although two inputs existed | sub-steps opened one by one; the student saw one box | demands list + all sub-steps visible (locked) from the start |
| A demand answered only inside a choice | counting answers was too weak | explicit `asks` + `ask: k` per demand |
| Typed « 268 = 54 × 4 + 52 » shown reversed | bidi of neutrals in RTL; no CSS fixes it mid-sentence | `isolateMath` in `WrittenAnswer` |
| Correction line of the sorter unreadable | useful items joined by a space | joined with « ؛ » in `InfoSorter` |
| A one-line solution never « finishes » | line-by-line reveal needs ≥ 2 lines | validator: `lines.length ≥ 2` |
| Old « module 4 = test » shown as problem 1 done | progress stored by number | one-time layout migration, client + server |
| Lesson unreachable for students after import | the lesson is `hidden` / `archived` | change the LESSON's state (modules follow) |
| E2E saw everything unlocked | QA account had completed the module before | reset progress before the run |
| A greyed (locked) sub-step showed the previous remainder (« باقي قسمة 91 على 29 ») or a demand's answer (« ماذا يمثّل $\frac{8}{15}$؟ ») | locked steps display their `prompt` from the start | keep the FIRST division's numbers, word later lines like the algorithm (« باقي قسمة القاسم السابق على الباقي الذي وجدته »); `docs/sources/4am/masail-rollout/audit-locked-leaks.mjs` (✗ fails: demand answers and division results; trivial re-uses only warn) |

## 11. Rolling out to many lessons (parallel authors)

Follow the unit recipe (brief + lock, see `docs/sources/4am/unit13/`):
- one **brief** per batch listing the lessons, their الكفاءات, their advanced
  manipulation (for problem 1), the module numbers before/after, and this guide;
- **shared files** edited only through the lock (`locked_edit.py`):
  `packages/core/progress/moduleLayoutMigrations.js`, the batch's Laravel migration,
  `apps/web/e2e/lesson-kit/*`, the generated exports (regenerated once, by the lead);
- per-lesson files are owned by one author: `lesson.config.js`, `content/problems*.js`,
  `modules/*`;
- the lead runs §7.7–7.8 and §8 once for the batch, reviews every statement and
  number, and reports the screenshots.

## 12. Reference files

| What | Path |
|---|---|
| Guided module | `apps/web/src/lessons/common/problems/GuidedProblem.jsx` |
| Contract & validation | `apps/web/src/lessons/common/problems/guidedProblem.js` (+ `.test.js`) |
| Statement support | `apps/web/src/lessons/common/problems/ProblemSupport.jsx` (+ `ProblemTable.jsx`; `GeoFigure` / `SpaceFigure` / `CoordPlane`) — drawn in the brief by `GuidedProblem.jsx` and, lazily, on `LessonProblemCard` |
| Written answer | `apps/web/src/lessons/common/problems/WrittenAnswer.jsx` (input: `common/components/MathTextArea.jsx`, palette `mathSymbols.js`) |
| Bidi isolation | `apps/web/src/lessons/common/components/isolateMath.js` (+ `.test.js`) |
| « مسألة الدرس » card | `apps/web/src/lessons/common/problems/LessonProblemCard.jsx` (used by `LessonIndex.jsx`) |
| UI strings | `apps/web/src/i18n/locales/ar/lesson.json` › `problem.*`, `textbook.additionReason.exam_style_problem` |
| Layout migration | `packages/core/progress/moduleLayoutMigrations.js`, `apps/api/database/migrations/2026_10_05_000003_*` |
| Validator | `scripts/validate-lessons.mjs` (track `problem`), `scripts/lib/lessonAst.mjs` (`track`) |
| Reference lesson | `…/aadad-tabiiya-natiqa/qasim-adad-tabii/` |
| Browser QA | `apps/web/e2e/lesson-kit/masail-pilot.mjs` |

## 14. Synthesis lessons with training situations (unit 1 pattern, 2026-10-13)

**All 14 synthesis lessons have it since 2026-10-13** (owner decision), and **ALL have exactly unit 1's format — owner rule, permanent**:
M0 أستعدّ · M1–6 « الوضعية التدريبية N » · M7 « تحليل الوضعية النهائية للاختبار » (`al-wadiya`, `practice_lab`) · M8 « وضعية الاختبار النهائي »
(`ahill`/`itqan`). **« أؤكّد تعلّماتي » (the textbook QCM) and « أتعمّق » never appear in « أدمج تعلّماتي »**: no module, no resource, no
`section`/title label in the synthesis practice bank (section « الوضعيات »). Their textbook items live in regular lessons or as `module: "practice"`
destinations in `extraction.json` (`notIntegrated` is refused while the bank cites an item). The old `trigger` stage of the situation module became
`practice_lab`. **The unit page's « 🏁 تحدّ » is the synthesis lesson's module-7 situation** (owner rule 2026-10-13: `units_4am_2026_2027.json › challenge` = the lesson's `SITUATION`, `sourceElementId: 'situation'` + its page; drawing through `pages/unit/UnitOpenerFigure.jsx › FIGURES['<unit>:challenge']`, reusing the synthesis lesson's figure, never showing an answer; units 3, 9, 14 keep the textbook challenge because module 7 already includes it). Lesson ≤ 90 min; the catalogue `durationMinutes` = the validator's module total (without the trainings). To convert a new one (checklist, as done):

1. **Layout**: M0 أستعدّ (items on what the situations mobilise) · M1…Mn « الوضعية التدريبية N — … » (`stage: 'practice_lab'`,
   `track: 'problem'`, `GuidedProblem`, ids `<lesson>-1…n`, `color` varied) · analysis module « تحليل الوضعية النهائية للاختبار »
   (`practice_lab`, read only) · the evaluated situation last. Keep the lesson ≤ 90 min.
2. **Content**: `content/problems.js` (+ `problems.test.js` recomputing every number), statements declared
   `addition('exam_style_problem')` unless they are the textbook's; no `assessment` on a training step (mastery comes from the
   last module only); an `illustration` (or figure/table) per situation; values in the story (LESSON_DEVELOPMENT_GUIDE §5).
3. **Config**: no `lessonProblem`; `priorKnowledge`, `teachingScope`, `textbookRef`, `description`, `situations` list and the
   learning-point ids follow the new content; `knowledge.jsx` / `knowledgeGraph.js` move to the analysis module's number.
4. **Engine**: stages are `practice_lab, evaluation` (no `trigger`, `REQUIRED_STAGES_BY_KIND`); add the lesson to
   `packages/core/progress/moduleLayoutMigrations.js` (version 2 map) AND a Laravel remap migration (model:
   `2026_10_13_000001_remap_wadiya_modules_idmajiya_aadad.php`); delete the removed modules' files and e2e/tests that name them.
5. **Sources**: `docs/sources/4am/unitN/extraction.json` — mark removed textbook items `notIntegrated` with the owner's decision,
   point `duplicatedIn` at the new module; run `check:textbook`.
6. **Docs**: LESSON_DEVELOPMENT_GUIDE lesson table, KNOWLEDGE_MAP row, PROGRESS_MODEL migration list.

