# 1AM unit 2 « الجمع والطرح » — authors' brief (lesson `mana-jam-tarh`, 2026-10-14)

Cycle moyen rollout, phase 3. The lead writes the lesson (`apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/jam-tarh-ashriya/mana-jam-tarh/`),
the extraction (`docs/sources/1am/unit2/extraction.json`, built by `build-extraction.py`) and the shared figure `ArcTape`.
Two authors work in parallel, each on its own files only:

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/operations/StoryBars.jsx`, `manipulations/logic/storyBars.js` (+ `.test.js`), `manipulations/operations/storyBars.render.test.jsx`, the `story-bars` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `storyBars` namespace of `i18n/locales/ar/lesson.manipulation.json` | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/mana-jam-tarh/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/mana-jam-tarh.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type is declared in `packages/core/curriculum/manipulationTypes.js` (`'story-bars'`),
the drawn world `checkup` is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`), the figure kind `tape`
(« مخطط بأقواس ») exists: `lessons/common/components/ArcTape.jsx` + `arcTape.js` (data model in its header; dispatched by
`StatementFigure` / `validateStatementFigure`, so a practice `statement.figure` may be `{ kind: 'tape', … }`).

## The lesson in one paragraph

« معنى الجمع والطرح » (1AM, textbook pp. 25, 26, 29). Programme items `1am.m1.r01` (جمع، طرح … أعداد طبيعية في وضعيات معطاة) and
`1am.m1.r05` (… أعداد عشرية في وضعية معيّنة). The idea the student must DISCOVER: **the words « يزيد / ينقص / أكثر / أقل » do not decide
the operation — the structure does. In the tape diagram (« مخطط بأقواس »: one line cut into parts, an arc above each part, an arc
below the whole), if the unknown is the WHOLE we add the parts; if the unknown is a PART we subtract the other part from the whole.**
The textbook's own traps: activity 1 text ① « ينقصه 11,5DA » → 24,5 + 11,5 ; text ③ « زادت علامتها … بـ 1,5 » → 17,5 − 1,5.

Final الكفاءات (ids are positional, `1am_mana-jam-tarh_P<n>`):

1. **P1** اختيار العملية المناسبة (جمع أو طرح) لحلّ مشكلة من الحياة اليومية بأعداد طبيعية أو عشرية
2. **P2** استعمال المفردات: مجموع، فرق، حدّا المجموع، حدّا الفرق، حدود، في وصف عملية
3. **P3** ترجمة عبارات « يزيد، ينقص، أكثر، أقل » بتمثيل مناسب (مخطط بأقواس) قبل الحساب

## Lab author — `story-bars`

Read first: `docs/architecture/MANIPULATION_DNA.md` (all), `docs/architecture/MANIPULATION_CONTRACT.md` §1, §2, §4.2, §6bis (« جرّب كل
الإمكانيات »: this type is NOT eligible — each stretch and each card IS the answer; say so in the header), §6ter, §7, §7bis-levels,
§7ter (the ten steps), §8, §8bis, §9. Idiom reference: `manipulations/stats/GroupTanks.jsx` + `logic/groupTanks.js` (shell, stage,
`useStretchInteraction`, `useLessonViewport` budget, `state.report`, `ManipulationDiscovery`, `LabFold`). Carry gesture:
`useDragInteraction` (see `divisibility/TeamBuilder.jsx` or `systems/StoryModeller.jsx`). Exact arithmetic ONLY through
`@smarter-academy/core/arithmetic/linear.js` imported BY PATH (`parseNumber`, `add`, `sub`, `eq`, `cmp`, `fracDecimal`) — never floats
for a verdict, never the core barrel (`docs/architecture/BUNDLE_BOUNDARIES.md` §4 rule 9). All strings in
`apps/web/src/i18n/locales/ar/lesson.manipulation.json` under `storyBars.*` (read as `t('manipulation.storyBars.…')` with
`useTranslation('lesson')`), never in the component, never in `lesson.json`. Counted nouns through plural keys.

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="story-bars"
  story="checkup" | "act1" | "method29"   // the story set; numbers in logic/storyBars.js › STORIES, words in storyBars.stories.<id>
  level, levels, title, lead               // as every type (levels={false} for the worked example of M3)
  onTrial={(e) => …}                       // each VALIDATED trial, through state.report:
                                           //   { story, item, kind: 'stretch' | 'calc' | 'card', value, ok, calc? }
  onFinished={({ story }) => …}            // the formal phase (or, for a story with discovery: false, all items done)
/>
```

`levels.js`: `'story-bars': { beginner: { numbers: { story: 'checkup' }, …P }, advanced: { numbers: { story: 'act1' }, …T('act-1') } }`.
The mode comes from the story (`STORIES[id].mode`).

**Story `checkup` (مبتدئ, platform, `mode: 'stretch'`, unit cm).** The school medical check: pupils stand before a wall height gauge
(toise) graduated 100–150 cm (every cm, a number every 10 cm), drawn in SVG, the children as simple drawn figures whose height is TO SCALE.
Known: سارة 130 cm. Four items, in order, one sentence each (Arabic in i18n):
1. « أمين أطول من سارة بـ 6 cm » → أمين = 136 (unknown is the whole: 130 + 6);
2. « ريم أقصر من سارة بـ 4 cm » → ريم = 126 (unknown is a part: 130 − 4);
3. « تزيد قامة سارة عن قامة نزيم بـ 9 cm » → نزيم = 121 (the TRAP: « تزيد » but 130 − 9);
4. « تنقص قامة سارة عن قامة ياسين بـ 5 cm » → ياسين = 135 (the TRAP: « تنقص » but 130 + 5).

For each item: (a) the hand STRETCHES the unknown child's height (drag the head handle vertically; keyboard arrows ±1, Page ±5; −/+
buttons; tap on the gauge) — `useStretchInteraction`, `role="slider"`, live during the drag, committed on release. A dashed
horizontal line joins the two heads; the live difference is drawn as an arc between them with its value. On commit the sentence lamp
judges EXACTLY (`ok` when the sentence is true); a wrong commit is refused in the story's words with the student's own numbers
(« بهذا الطول تكون ريم أطول من سارة، والجملة تقول: أقصر »). (b) Once the height is right, the student WRITES the calculation by
choosing one of three calc cards built from the item's numbers (`130 + 6`, `130 − 6`, `6 − 130`, in a stable shuffled order): the
card's result is drawn as a ghost head; a wrong card is refused with what it would give; the right card writes the formal line
`□ = 130 + 6 = 136` and draws the closed tape (`ArcTape`: the whole = the taller child, parts = the shorter child and the difference).
`onTrial` fires for each stretch commit (`kind: 'stretch'`) and each card (`kind: 'calc'`).

`discoveryReady` = items 1–3 done (an addition, a subtraction AND a trap). Discovery (`ManipulationDiscovery`), prompt « ماذا يقرّر
العملية: الكلمة أم المخطط؟ » with three options, the two wrong ones refuted WITH THE STUDENT'S OWN ITEMS:
« كلمة "يزيد" أو "أطول" تعني دائمًا أن نجمع » (refuted by نزيم: 130 − 9), « نطرح دائمًا العدد الأصغر من العدد الأكبر » (refuted by
أمين: 130 + 6), and the right one « إذا كان المجهول هو الكلّ (الأطول) نجمع الجزأين، وإذا كان المجهول جزءًا نطرح الجزء الآخر من
الكلّ ». Formal: the generic tape + that sentence. Item 4 stays available after the discovery (a transfer).

**Story `act1` (متقدم, textbook act-1 p. 25, `mode: 'cards'`).** The textbook's six texts (verbatim in i18n — copy them from
`docs/sources/1am/unit2/extraction.json › act-1.texts`) and its six calc cards (`24,5 + 11,5`, `17,5 + 1,5`, `17,5 − 1,5`,
`31,02 − 22,60`, `31,02 + 22,60`, `24,5 − 11,5`). NO gauge and no reading: the student decides first. Gesture: carry a card onto a text
(`useDragInteraction`, tap-tap and keyboard). A card is accepted on a text iff its value equals the text's answer (exactly). On
acceptance the text shows its closed tape (`ArcTape` with the story's labels: e.g. ① parts « ما يملكه 24,5 » and « ما ينقصه 11,5 »,
whole « ثمن الكرّاس □ »). On refusal the card returns AND the text's tape is drawn with the card's value in the unknown's role, NOT
closed (`ArcTape` draws the gap / overflow by itself when parts ≠ whole), with a reason in the story's words from i18n
(`stories.act1.texts[i].wrongWhy`, interpolated with the value). Structure per text (which quantity is the whole): ① whole = price
(unknown), ② whole = 24,5 (the difference is a part), ③ whole = Ines 17,5 (unknown Younes is a part), ④ whole = 19 (unknown result =
17,5 + 1,5), ⑤ whole = the sum (unknown), ⑥ whole = 31,02 (the increase is a part). `discoveryReady` = all six matched; same
discovery, refuted with texts ① and ③.

**Story `method29` (textbook method p. 29, `mode: 'stretch'`, `discovery: false`).** Known أكرم 124 cm; items: « تزيد قامة يونس عن قامة
زميله أكرم بـ 3cm » (يونس = 127), « تقلّ قامة محمد عن قامة زميله أكرم بـ 5cm » (محمد = 119). Same gestures as `checkup`; no discovery:
`onFinished` when both items are done. Used alone (`levels={false}`) in module 3.

**Must:** the design sheet (DNA §7) and the five questions in the header; one screen at 1280×800 → 320×640 (the gauge height is budgeted
from `useLessonViewport`, the handle beside the child, the sentence and the cards above the stage; secondary lists in `LabFold`);
`[data-sb-glance]` wraps the object + its controls + its reading; Arabic everywhere (aria-labels too), numbers LTR, decimal comma;
reduced motion; hints (3, progressive, never the answer); « إعادة » clears the trial memory; `state.report` for every lesson callback.
DOM contract: `[data-story-bars][data-story][data-mode][data-item][data-solved]`, `[data-sb-glance]`, `[data-sb-handle]` (slider),
`[data-sb-person=<id>][data-height]`, `[data-sb-sentence][data-ok]`, `[data-sb-calc=<i>]`, `[data-sb-card=<id>][data-placed]`,
`[data-sb-slot=<n>][data-matched]`, `[data-sb-verdict]`, `[data-sb-refused=<kind>]`, the tape's own `[data-arc-tape]`.

**Tests:** `logic/storyBars.test.js` — every STORIES answer recomputed exactly; each `checkup`/`method29` item closes for exactly ONE
height in 100..150 (sweep) and its right card is the only accepted one; `act1` cards have six distinct values and each text accepts exactly
one card; refusal kinds; `discoveryReady`; reset. `operations/storyBars.render.test.jsx` — both levels and `method29` render
(`renderToString` inside the i18n test setup used by the other render tests), no `{{` left in a rendered option, no Latin prose.
Then `npx vitest run src/lessons/common/manipulations` (incl. `levels.test.js`, `manipulationRegistry.test.js`) must pass.
Do NOT run `npm run build` (the lead runs it). Report: files, test results, the DOM contract as built, anything you could not do.

## Bank author — `content/practice/1am/mana-jam-tarh/`

Read first: `docs/architecture/EXERCISE_CONTRACT.md` § « Platform-generated practice exercises », « Answer-key integrity », « A practice
question may be served alone », « Présentation examen (BEM) » (Data, Term-exam provenance), « Earlier-year review link » (nothing to
author); `docs/sources/moyen/exams/EXAM_PATTERN.md` (all, §6 is the recipe); `docs/sources/4am/bem-practice/brief-authors.md` (the sheet
format); a converted 4AM bank as the shape reference (`content/practice/4am/qasim-adad-tabii/`) and its oracle
(`scripts/practice-oracle/qasim-adad-tabii.mjs`); `scripts/lib/examProvenance.mjs`.

- **50 exercises**, 10 per level, ids `ex-1am-mana-jam-tarh-l<N>-<NNN>`, every exercise with `metadata.exam` (exam sheet). Levels follow
  EXAM_PATTERN §6 (L1 one direct skill 2–3 ن ; L2 calculate then « علّل / برّر » ; L3 a complete 3–4-question exercise ; L4 an exercise
  that also mobilises another lesson of the SAME term — such steps `counted: false` ; L5 « الوضعية الإدماجية (08 ن) » in two parts ending on
  a justified decision).
- **Provenance:** term-exam corpus `docs/sources/moyen/exams/exams-index.json` (read the PDFs under `docs/Exames-1 AM to 3AM/1am/`;
  `pdftotext -layout`, or `pdftoppm -r 110` for scans). Exercises touching `1am.m1.r01` / `1am.m1.r05` in term 1:
  `1am-s1-91` ex 3 (temperature differences with a diagram) and ex 5, `1am-s1-93` ex 5, `1am-s1-94` ex 5, `1am-s1-96` ex 5, `1am-s1-98` ex 4,
  `1am-s1-99` ex 2, `1am-s1-101` ex 5, `1am-s1-104` ex 5, `1am-s1-106` ex 5 (+ `1am-s2-64` ex 4 for a duration). About half of levels 3–5
  modelled on ONE precise corpus exercise (`metadata.source = {type:"term_exam", grade:"1am", semester, file, exercise}`, kind `modelled`,
  badge « على منوال اختبار الفصل الأول »): keep its structure and register, CHANGE numbers and context, never copy word for word. The rest:
  `{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"1am-s1"}`, same badge. A few may be `adapted` from a textbook
  element (badge `null`, `source: {type:"textbook", elementId, page, …}`) — ONLY elements whose destination is `mana-jam-tarh` in the
  extraction: `act-1`, `know-1a`, `know-1d`, `method-3`, `now-29`, `ex-1`, `ex-16`, `ex-17`, `self-6`, `self-7`, `self-8`, `deep-8`. Citing
  any other element breaks `check:textbook`.
- **What is assessed** (this lesson is the MEANING, not the column technique of the next lesson): choosing the operation in a story (incl.
  the keyword traps « يزيد / ينقص / أكثر / أقل » in both directions), the vocabulary (مجموع، فرق، حدّا المجموع، حدّا الفرق، حدود), reading
  and choosing a tape diagram (`statement.figure: { kind: 'tape', … }` — every statement figure must close), and computing the answer
  (sums and differences of naturals and decimals up to two decimals, as in primary school). Each LP primary on ≥ 8 questions.
- `answerType`: `choice` (an operation, a diagram, a term — every distractor FALSE and tagged `misconceptionId`), `rational` (a value; decimal
  comma accepted), `selfCheck` for « مثّل الوضعية / برّر » steps. New misconception ids `MISC-JAMTARH-*` in
  `content/practice/misconceptions.json` (e.g. keyword taken for the operation, difference reversed, sum and difference confused, the whole
  taken for a part).
- Every question: `step`, `timeSeconds`, `solution.lines` (« التصحيح النموذجي » style), hints that never contain the answer, `feedback.correct`
  as a one-line explanation, `learningPoints` with exactly one primary of THIS lesson, standing alone (daily challenge).
- **Values in story contexts** (LESSON_DEVELOPMENT_GUIDE §5): each story woven with a good value (التعاون، الصدق، احترام الوقت…), short;
  rewrite the corpus' cultural contexts, never copy them. Amounts « دج » in Arabic text (never « DA » inside Arabic), units `$…\,\mathrm{cm}$`
  inside math islands when glued to a number.
- **Oracle:** `scripts/practice-oracle/mana-jam-tarh.mjs` recomputes EVERY constructed answer and every choice key from the statement's
  numbers with its own exact decimal arithmetic (helpers in `scripts/practice-oracle/helpers.mjs`), imported into
  `scripts/practice-answer-oracle.test.mjs` like the other lessons.
- **Wiring:** add the lesson to `content/practice/active.json`, `exam-style.json`, `policy.json` (`minPerLevel: 10`, source naming the
  textbook pages and the term-exam generation); regenerate whatever generated index the practice content uses (find its script).
- **Gates you run:** `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`,
  `npx vitest run scripts` (or the scripts test command in the root `package.json`). Do NOT run `npm run build`.
  Report: files, counts per level and per LP, the corpus exercises used (file + exercise), test results.
