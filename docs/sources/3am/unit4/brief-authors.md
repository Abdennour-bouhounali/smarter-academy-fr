# 3AM unit 4 « الحساب الحرفي » — authors' brief (lesson `tabsit-hadhf-aqwas`, 2026-10-20)

Cycle moyen rollout, phase 3, Phase A of the queue (entry #3). Same organisation as `docs/sources/1am/unit11/brief-authors.md` (read its two
author sections: they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/tabsit-hadhf-aqwas/`), seeds the unit (`ibarat-harfiya-3/_unit/`)
and writes the whole-unit extraction (`docs/sources/3am/unit4/extraction.json`, built by `build-extraction.py`).

**Two other leads work in the SAME working tree at the same time** (3AM `quwat-adad-nisbi` and `khassiyat-fitaghuras`). Shared files
(`lesson.manipulation.json`, `manipulationRegistry.js`, `levels.js`, `levels.test.js`, `MANIPULATION_CONTRACT.md`, `MANIPULATION_DNA.md`,
`active.json`, `exam-style.json`, `policy.json`, `misconceptions.json`, `practice-answer-oracle.test.mjs`, the generated practice index):
edit them with the Edit tool in SMALL targeted edits right after a FRESH Read; never rewrite them whole; never revert someone else's change.
Do NOT commit, do NOT push, do NOT run the DB import, do NOT run `npm run build`. Tablet and laptop only (768×1024, 1024×768, 1280×800,
1366×768, 1920×1080) — no phone work.

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `apps/web/src/lessons/common/manipulations/algebra/LikeTerms.jsx` (+ sub-components in a new folder `algebra/likeTerms/`), `manipulations/logic/likeTerms.js` (+ `likeTerms.test.js`), `manipulations/algebra/likeTerms.render.test.jsx`, the `like-terms` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `likeTerms` namespace of `apps/web/src/i18n/locales/ar/lesson.manipulation.json`, its section in `MANIPULATION_CONTRACT.md` (the next FREE `§2…vicies` number at the time you write — other leads add sections too: re-read the file first) and its row in `MANIPULATION_DNA.md` §15; may ADD functions (with tests) to `packages/core/arithmetic/brackets.js` | the lesson folder, `content/practice/**`, the extraction, `PitchExpansion.jsx` / `TurfFactoring.jsx` (4AM's labs: NOT to be reskinned or reused) |
| **Bank** | `content/practice/3am/tabsit-hadhf-aqwas/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/tabsit-hadhf-aqwas.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type `'like-terms'` is declared in `packages/core/curriculum/manipulationTypes.js`, the drawn
world `workbench` is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`), and the exact maths of the lesson is
`packages/core/arithmetic/brackets.js` (+ test) on `polynomials.js` (a term is `{ c, p }`: integer coefficient, power of x; an expression is a
list of terms and groups `{ sign: 1 | -1, terms }`; `removeBrackets`, `simplify`, `valueAt`, `sameExpression`, `witness`, `kindWitness`,
`exitTerm`, `isRightExit`, `expressionTex`, `openedTex`, `simplifiedTex`, `multiplyMonomials`). Import it BY PATH, never through the core barrel.
Until the lab author adds the registry entry and the levels preset, `manipulationRegistry.test.js` and `levels.test.js` fail — expected.

## The lesson in one paragraph

« تبسيط عبارة جبرية وحذف الأقواس » (3AM, unit 4 pp. 54–69; activity 1–2 p. 56, معارف 1–2 p. 58, طريقة p. 59 « حذف الأقواس وتبسيط
عبارة حرفية »). Programme item `3am.m5.r01` « تبسيط عبارة جبرية ». The idea the student must DISCOVER: **only LIKE terms (same literal part:
x², x, numbers) merge into one term — we add their coefficients (3x + 5x = 8x, the distributivity he knows from 2AM read backwards); x and x²
never merge (their values differ: at x = 3, 9 ≠ 3); a term and its opposite cancel. A product of monomials is simplified by multiplying the
numbers and the letters (3x × 5x = 15x²). Brackets preceded by + (and not followed by × or ÷) are removed WITHOUT changing any sign; brackets
preceded by − are removed by changing the sign of EVERY term inside: a − (b − c) = a − b + c. The value of the expression never changes.**

Boundary with the next lesson of the unit (written once in `build-extraction.py`): `nashr-jabri-3am` owns distributivity as EXPANSION
k(a + b) = ka + kb and (a + b)(c + d), and « expand then simplify ». This lesson never expands a product of brackets; a bracket here is preceded
by + or − only. Evaluating an expression at a value of x is a 2AM skill (`tatbiq-qaida-harfiya`) used as a CHECK; the 3AM lesson
`qimat-ibara-harfiya` owns it formally (counter-examples, negative values in brackets).

Final الكفاءات (`3am_tabsit-hadhf-aqwas_P<n>`, order kept):

1. **P1** تبسيط عبارة جبرية: مجموع بجمع الحدود المتشابهة (التي لها الجزء الحرفي نفسه) وجداء بضرب الأعداد معًا والحروف معًا، مثل $3x+5x=8x$ و $3x\times5x=15x^2$
2. **P2** حذف قوسين مسبوقين بالإشارة $+$ (وغير متبوعين بـ $\times$ أو $\div$) دون تغيير إشارات الحدود التي بينهما
3. **P3** حذف قوسين مسبوقين بالإشارة $-$ مع تغيير إشارة كل حدّ بينهما: $a-(b-c)=a-b+c$ ، ثم تبسيط العبارة الناتجة
4. **P4** التمييز بين عبارة على شكل مجموع وعبارة على شكل جداء (آخر عملية فيها جمع أو ضرب)

## Lab author — `like-terms` (« طاولة الحدود »)

Read first: `docs/architecture/MANIPULATION_DNA.md` (all — §12 « not another lab », §16.3 and §17 above all), `MANIPULATION_CONTRACT.md` §1, §2,
§4.1, §6bis (each gesture IS an answer: NOT eligible for auto-complete — say so in the header), §6ter, §7, §7bis-levels, §7ter (the ten
steps), §8, §8bis, §8ter, §8quater (LabCoach — mandatory, `coachOf` pure and tested by following it to the end of every task), §9;
`docs/reports/LAB_COACH_ROLLOUT.md`. Idiom references (read the code, do not copy): `surface/TileYard.jsx` + `logic/tileYard.js` (the most
recent lab: shell, `useLessonViewport` budget, `state.report`, `ManipulationDiscovery`, `LabFold`, LabCoach wiring, a hand that carries),
`operations/DecimalComma.jsx` / `operations/RulerCompare.jsx` (always-open « جرّب أعدادك »), `useDragInteraction` (drag, tap-tap, keyboard),
`primitives/LabKit.jsx`, `SvgPill.jsx`, `primitives/KidFigure.jsx` (girls ALWAYS in hijab + tunic). Strings only in
`lesson.manipulation.json › likeTerms` (read as `t('manipulation.likeTerms.…')` with `useTranslation('lesson')`), never in the component;
counted nouns through plural keys; every formula a KaTeX/LTR island (`MathText` or the kit's LTR spans) — never Arabic inside KaTeX.

**Why this is not another lab (DNA §12).** 4AM `pitch-expansion` stretches a LENGTH x on a football pitch to expand k(a + b) / (a + b)(c + d)
(areas of rectangles); `turf-factoring` lays identical turf rows to factor. Both read an expression as an AREA. Here the hand holds a TERM — a
bundle of identical wooden pieces shaped like its literal part — and CARRIES it: into the tray of its shape (like terms), or out of a bracket
crate « as is » or « sign changed ». The resistance is the VALUE of the expression at x (which the hand also sets): a wrong tray mixes pieces
whose values differ at x; a wrong exit changes the value of the whole expression. No area, no rectangle, no expansion.

**The drawn world `workbench`** (theme declared): the work table of the school maths club (value: cooperation — classmates tidy the club's
pieces together). Honest pieces drawn to scale in inline SVG with depth: a TERM `3x` is a bundle of 3 identical « x-rods » (length x, width 1);
`2x²` = 2 square plates of side x (the plate's side IS the rod's length: visibly); `5` = 5 small unit cubes; a NEGATIVE term is the same pieces
in the « opposite » finish (red, hatched, a « − » mark): a piece and its opposite cancel (a small poof) — this is how 5x − 2x leaves 3 rods.
The unit u (px) is budgeted from the viewport; x is set by the hand on a ruler/stepper (`x` ∈ 1…6, default 3): every rod and plate re-sizes
live (x rods are x·u long) — the value pills (« 3x = 9 عند x = 3 ») follow. A KidFigure (a girl in hijab, the club's host « سلمى ») may stand at
the table and react (`wonder` while sorting, `proud` when solved) — never carrying information.

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="like-terms"
  world="collect" | "brackets"      // from the level preset (collect); module 3 passes world="brackets" with levels={false}
  tasks={[{ id, expr }]}            // expr in brackets.js format; collect: terms only; brackets: terms and groups. Default: the preset's
  level, levels, coach, lead        // as every type; lead REPLACES the default context sentence of the authored level (must carry every number)
  onTrial={(e) => …}                // each VALIDATED gesture, via state.report (« Events » below)
  onFinished={({ world }) => …}     // the formal phase reached
/>
```

`levels.js`: `'like-terms': { beginner: { numbers: { world: 'collect', tasks: [...] }, ...P }, advanced: { numbers: { world: 'collect', tasks:
[...] }, ...T('act-1') } }` with these tasks (exact; `t(c, p)` = `{ c, p }`):

- **مبتدئ** `collect-1`: 2x + 3 + 4x + 1 + x → 7x + 4 ; `collect-2`: 5x + 6 − 2x − 4 → 3x + 2 (opposite pieces cancel).
  Running tray readouts visible; the reduced expression WRITES ITSELF (LTR line) when every term is in a tray.
- **متقدم** `collect-3`: 4x² + 7 − x − 2x² + 5x − 9 → 2x² + 4x − 2 ; `collect-4`: 3x² − 4x + 6 + x − 3x² − 2 → −3x + 4 (the x² tray empties
  to 0: the term disappears). Scaffold removed: no running readout; when all terms are sorted the student sets each tray's result
  (stepper/cards per tray: the coefficient) and presses « تحقّق »; a wrong tray result is refused with its value at x
  (« في الصينية عند x = 3: 4x² − 2x² تساوي 18، وما كتبتَه يساوي 54 »).

**World `collect` (module 1).** Context then ONE question (DNA §17.9, no title), e.g. context « على طاولة النادي كتبت سلمى العبارة
2x + 3 + 4x + 1 + x ، وكل حدّ حزمة من القطع. » / question « رتّب كل حزمة في صينية شكلها حتى تُكتب العبارة بأقل عدد ممكن من الحدود. ».
Three trays labelled by their SHAPE (x², x, 1 — a drawn silhouette + the symbol). Gesture: carry a term bundle (drag; tap the bundle then tap
the tray; keyboard: arrows between bundles/trays, Enter takes / drops, Esc lets go). A bundle dropped on a tray of ANOTHER shape is REFUSED
(reason `kind`): it returns with a wobble and the banner gives the two values at the current x — or at a WITNESS x when the current one hides the
difference (`kindWitness`: x = 1 makes x² and x equal): « قطعة $x^2$ لا تُرصّ مع قطع $x$: عند $x=3$ الأولى تساوي 9 والثانية 3 ». In a
tray, positive and opposite pieces pair off and vanish two by two (animated, reduced-motion safe). Two value meters, always visible side by side:
« قيمة العبارة عند x = 3 » for the WRITTEN expression and for the TABLE (what is in the trays + what is still loose): they stay equal (the
student sees that sorting never changes the value) — the student changes x and both move together. Free panel « جرّب أعدادك » ALWAYS OPEN
(DNA, owner rule): + / − buttons per shape add a piece to a new loose bundle (or a « امسح » to start an empty table) so the student builds
and sorts his own expression (≤ 12 pieces per shape).
Discovery (`ManipulationDiscovery`, refutable options, nothing before it states the rule): « متى تجتمع حزمتان في حدّ واحد؟ » — right
« عندما يكون لقطعهما الشكل نفسه (الجزء الحرفي نفسه): نجمع عدد القطع » ; wrong « دائمًا: $3x+2$ تصير $5x$ » (refuted by the student's value
meter: at x = 3, 11 ≠ 15) and « عندما يكون لهما العدد نفسه: $2x$ و $2x^2$ » (refuted by the `kind` refusal). `discoveryReady` = both tasks of
the level solved (and, at مبتدئ, at least one cancellation seen). Formal (named only here): like terms, adding coefficients, the opposite
cancels, the value unchanged.

**World `brackets` (module 3, `levels={false}`, the lesson passes its own `tasks`; defaults):** `plus`: 7 + (2x − 3) → 7 + 2x − 3 → 2x + 4 ;
`minus`: 9 − (4x − 5) → 9 − 4x + 5 → −4x + 14 ; `both`: 3x + (x − 2) − (5 − 2x) → 3x + x − 2 − 5 + 2x → 6x − 7. Each bracket is a CRATE with its
sign tag painted in front (« + » / « − »), the terms inside as bundles. Gesture: carry a bundle OUT of a crate onto one of TWO exits of the
table — « كما هي » (as is) or « بعكس إشارتها » (sign changed: the bundle turns to its opposite finish as it lands) — drag, tap-tap, keyboard.
The judge is the value: the written expression and the expression the table would hold are compared at the current x
(`isRightExit`, `witness`): a wrong exit is REFUSED (reason `sign`), the bundle returns, the banner gives the two values
(« عند x = 3: العبارة تساوي 2، ولو أخرجتَ $4x$ كما هي لصارت 26 »). A loose term outside crates stays where it is. Under the table, the
written line GROWS as terms leave (« $9-(4x-5)=9-4x+5$ »). When every crate is empty, the three trays appear and the student collects as in
`collect` (running readouts visible) to reach the reduced form. Discovery after `minus` (or at the end): « ماذا حدث لإشارة كل حدّ أخرجتَه
من قوسين مسبوقين بـ $-$ ؟ » — right « تغيّرت إشارة كل حدّ » ; wrong « تغيّرت إشارة الحدّ الأول وحده » (refuted by the student's own refused
second term, or by a witness) and « لم تتغيّر أي إشارة » (refuted). Formal: the two rules with the student's own lines. Free panel always open:
build a crate (sign + / −, up to 3 terms) and its loose terms.

**Events (`state.report`, fixed — the lesson reads them):**
- `{ kind: 'sort', world, task, term, tray }` (an accepted drop; `term` = `{c,p}`, `tray` = p) · `{ kind: 'cancel', world, task, tray }`
- `{ kind: 'refused', world, task, reason: 'kind', term, tray, x, termValue, trayValue }`
- `{ kind: 'exit', world: 'brackets', task, crateSign, term, flipped }` (accepted) ·
  `{ kind: 'refused', world: 'brackets', task, reason: 'sign', crateSign, term, flipped, x, before, after }`
- `{ kind: 'check', world: 'collect', task, tray, ok }` (متقدم) · `{ kind: 'x', x }`
- `{ kind: 'solved', world, task, expr, opened, result }` (LaTeX strings from `expressionTex` / `openedTex` / `simplifiedTex`)
- `{ kind: 'custom', world }` (the free panel used)

**DOM contract:** `[data-like-terms][data-world][data-task][data-solved]`, `[data-lt-glance]` (table + trays + meters + controls),
`[data-lt-bundle=<id>][data-c][data-p]`, `[data-lt-tray=2|1|0][data-coef]`, `[data-lt-crate=<i>][data-sign]`, `[data-lt-exit=keep|flip]`,
`[data-lt-x]` (the readout) with `[data-lt-x-less]` / `[data-lt-x-more]`, `[data-lt-value=written|table]`, `[data-lt-line]` (the written
line), `[data-lt-result]`, `[data-lt-refused=<reason>]`, `[data-lt-banner]`, `[data-lt-next]`, `[data-lt-free]`, `[data-lt-add=<p><+|->]`,
`[data-lt-coef=<p>]` + `[data-lt-check]` (متقدم), `[data-lt-formal]`.

**Must:** the design sheet (DNA §7) and the contract's five questions in the header; one screen at the five sizes (both levels and the
brackets world; trays and meters budgeted from `useLessonViewport`; secondary material in `LabFold`); LabCoach (`coachOf` for collect and
brackets, followed to the end of every task in the test); Arabic everywhere (aria-labels too); numbers LTR; reduced motion; 3 hints, closed
by default, short thinking questions; « إعادة » clears the trial memory; every gesture has a tap and a keyboard path, controls ≥ 44 px.
**Screenshots (Playwright, a dev server on port 4173 — `npx vite --port 4173 --strictPort` in `apps/web` if none is running; the lesson's
module pages mount even while the lesson is `coming_soon`: `/courses/moyen/3am/ansab_al_aadad_wal_hisab/tabsit-hadhf-aqwas/nashat` and
`…/tariqa` once the lead has written them; until then render the lab in a scratch page or a render test) of the initial and mid-activity
states (a refusal `kind`, a cancellation, the advanced check, a refusal `sign`, the written line growing, the formal phase) at 768×1024,
1024×768, 1280×800, 1366×768, 1920×1080 — LOOK at every one and iterate to the DNA §17 bar.** Tests: `logic/likeTerms.test.js` (every task
solved by following `coachOf`; refusals with the right witness; cancellation; value invariance; advanced check; reset),
`algebra/likeTerms.render.test.jsx` (both levels and the brackets world render with `renderToString` in the i18n test setup; no `{{`; no
Latin prose; opens on its CONTEXT then ONE question; says each thing once), then `npx vitest run src/lessons/common/manipulations` (incl.
`levels.test.js`, `manipulationRegistry.test.js`) in `apps/web` and `npx vitest run arithmetic` in `packages/core`.
Report: files, test results, the DOM contract as built, the screenshots reviewed and what you changed after them, anything not done.

## Bank author — `content/practice/3am/tabsit-hadhf-aqwas/`

Read first: `docs/architecture/EXERCISE_CONTRACT.md` § « Platform-generated practice exercises », « Answer-key integrity », « A practice
question may be served alone », « Présentation examen (BEM) », « Term-exam provenance (1AM–3AM) », « Earlier-year review link » (nothing to
author); `docs/sources/moyen/exams/EXAM_PATTERN.md` (all; §6 is the recipe); `docs/sources/4am/bem-practice/brief-authors.md` (the sheet
format); the most recent converted banks as shape references: `content/practice/1am/masahat-muhit-sath/` (+ `scripts/practice-oracle/masahat-muhit-sath.mjs`)
and a 4AM algebra bank `content/practice/4am/nashr-tabsit/` (+ its oracle) for algebraic answers; `scripts/lib/examProvenance.mjs`;
`scripts/practice-oracle/helpers.mjs` (an exact rational-polynomial calculator independent of `packages/core`).

- **50 exercises**, 10 per level, ids `ex-3am-tabsit-hadhf-aqwas-l<N>-<NNN>`, every exercise with `metadata.exam` (exam sheet). Levels follow
  EXAM_PATTERN §6 (L1 one direct skill 2–3 ن ; L2 compute then « علّل / برّر » ; L3 a complete 3–4-question exercise ; L4 an exercise that also
  mobilises another lesson of the SAME term — such steps `counted: false` ; L5 « الوضعية الإدماجية (08 ن) » in two parts ending on a justified
  decision).
- **Provenance:** the 3AM term-exam corpus `docs/sources/moyen/exams/exams-index.json` (PDFs under `docs/Exames-1 AM to 3AM/3am/`; `pdftotext
  -layout`, or `pdftoppm -r 110` for scans). Exercises tagged `3am.m5.r01` (15, all « الفصل الثاني » except `3am-s3-*` « الفصل الثالث »):
  `3am-s2-75` ex 2, `3am-s2-68` ex 2 and part 2, `3am-s2-69` ex 2, `3am-s2-70` ex 1, `3am-s2-76` / `3am-s2-81` (same situation — cite ONE), `3am-s2-80`
  ex 2 and ex 5, `3am-s2-82` ex 2 and ex 5, `3am-s3-47`, `3am-s3-49` ex 1, `3am-s3-59`; `2am-s2-65` is a 3AM paper misfiled (its header counts).
  Almost all of them mix simplification with EXPANSION (`3am.m5.r02`, next lesson `nashr-jabri-3am`, not yet published) and evaluation
  (`3am.m5.r03`): keep THIS lesson's steps counted; an expansion or evaluation step that the sheet needs is `counted: false` (or rewrite the
  expression so no expansion is needed: brackets preceded by + / − only, monomial products). About half of levels 3–5 modelled on ONE precise
  corpus exercise (`metadata.source = {type:"term_exam", grade:"3am", semester, file, exercise}`, kind `modelled`, badge « على منوال اختبار الفصل
  الثاني / الثالث »): keep its structure and register, CHANGE numbers and context, never copy word for word. The rest:
  `{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"3am-s2"}` with the badge. A few may be `adapted` from a textbook element
  (badge `null`, `source: {type:"textbook", elementId, page, …}`) — ONLY elements whose destination is `tabsit-hadhf-aqwas` in
  `docs/sources/3am/unit4/extraction.json` (the lead writes it first: `act-1`, `act-2`, `know-1`, `know-2`, `method-1`, `now-59` (item 1),
  `ex-5`, `ex-6`, `ex-7`, `ex-12`, `ex-13`, `ex-14`, `deep-36`, `deep-43` (item a), `deep-47`, `self-1`, `self-2`, `self-6`, `prep` (items 5–8);
  check the file). Citing any other element breaks `check:textbook`. Own numbers and contexts: never « الكتاب ص … », never a box or an exercise
  copied word for word.
- **What is assessed:** P1 (reduce a sum of like terms with x², x and numbers, incl. cancellations and a term that vanishes; simplify a product
  of monomials 4 × 3x, 3x × 5x, −2x × 4x; spot the classic errors 5x − 3 = 2x, 3x + 7x = 10x², 2x × 3x = 6x), P2 (remove brackets preceded by +),
  P3 (remove brackets preceded by −, every sign changed, then reduce; the error « only the first sign changed »), P4 (sum or product: which
  expressions are sums, which are products; the last operation). Each LP primary on ≥ 8 questions. Geometry contexts from the corpus (a
  perimeter as a sum of sides in x, a triangle's third angle 180 − x − (x − 20)) are welcome when they need ONLY this lesson's skills.
- `answerType`: `choice` (every distractor FALSE and tagged `misconceptionId`), `expression` if the contract has an algebraic answer type
  (check `EXERCISE_CONTRACT.md` and the 4AM `nashr-tabsit` bank: reuse exactly what they use for an algebraic answer — never invent a type),
  `rational`, `selfCheck` for « برّر » steps. New misconception ids `MISC-TABSIT-*` in `content/practice/misconceptions.json` (e.g. unlike
  terms merged 3x + 2 = 5x, x and x² merged, coefficients multiplied for a sum 3x + 7x = 10x², powers added for a sum, only the first sign
  changed after −( ), the signs kept after −( ), the sign changed after +( ), product of monomials without multiplying the letters 2x × 3x = 6x,
  sum and product confused).
- Every question: `step`, `timeSeconds`, `solution.lines` (« التصحيح النموذجي » style), hints that never contain the answer, `feedback.correct`
  as a one-line explanation, `learningPoints` with exactly one primary of THIS lesson, standing alone (daily challenge).
- **Values in story contexts** (LESSON_DEVELOPMENT_GUIDE §5 « Values in story contexts »): each story woven with a good value, short. A pure
  « بسّط » item gets no invented story.
- **Oracle:** `scripts/practice-oracle/tabsit-hadhf-aqwas.mjs` recomputes EVERY constructed answer and every choice key (algebraic answers
  checked as polynomials AND by evaluation at several values of x, with its own code — `helpers.mjs`, never `packages/core`), imported into
  `scripts/practice-answer-oracle.test.mjs` like the other lessons.
- **Wiring:** add the lesson to `content/practice/active.json`, `exam-style.json`, `policy.json` (`minPerLevel: 10`, source naming the textbook
  pages and the term-exam generation); regenerate whatever generated index the practice content uses (find its script).
- **Gates you run:** `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs` (after the lead's
  extraction exists), the scripts tests (root `package.json`). Do NOT run `npm run build`.
  Report: files, counts per level and per LP, the corpus exercises used (file + exercise), test results.

---

# ADDENDUM — lesson `nashr-jabri-3am` « نشر عبارات جبرية » (queue #4, 2026-10-21)

Second lesson of the unit, generated into its catalogue entry (item `3am.m5.r02`, textbook pp. 54–69: activity 3 p. 57, معارف 3 p. 58, طرائق 2–3 p. 59,
دوري الآن ② p. 59, exercises 8–11 p. 62, 15–26 pp. 63–64, أؤكّد 4, 5, 7, 8 p. 65, أتعمّق 40–46 pp. 66–67, تحدّي p. 54). Folder
`apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/nashr-jabri-3am/`. The extraction destinations were updated (see the
header of `build-extraction.py` for the BOUNDARY — it now also says: no identities are named, no factoring, a value only CHECKS an expansion).
Same organisation, same shared-file rules and same « other leads work in the same tree » warning as above (the 3AM unit-5 lead and the 2AM
`muqarana-nisbiya` lead are active). Do NOT commit/push/import/build; tablet and laptop only.

Final الكفاءات (`3am_nashr-jabri-3am_P<n>`, order kept from the draft, wording refined):

1. **P1** نشر عبارة من الشكل $k(a+b)$ بالخاصية التوزيعية: $k(a+b)=ka+kb$ (مع $k$ سالب أو قوسين فيهما إشارة $-$)
2. **P2** نشر عبارة من الشكل $(a+b)(c+d)=ac+ad+bc+bd$ حيث $a$ و $b$ و $c$ و $d$ أعداد نسبية
3. **P3** تبرير قاعدة النشر بحساب مساحة مستطيل بطريقتين: جداء بعديه ومجموع مساحات أجزائه
4. **P4** نشر ثم تبسيط عبارة جبرية وترتيب حدودها حسب قوى $x$ تنازليًا

The idea the student must DISCOVER: **the area of a rectangle counted two ways — the product of its two sides and the sum of the areas of its
parts — gives the expansion; a bite taken from a side (a term with a minus) is an area taken away, and when two bites overlap the corner was
taken twice, so it is given back ((−)×(−)=+); every term of the first bracket multiplies every term of the second; then like terms merge.
The value never changes.**

## Lab author — `area-split` (« أرض الحديقة »)

Type `'area-split'` is declared in `packages/core/curriculum/manipulationTypes.js` and the drawn world `schoolgarden` in `VISUAL_THEMES`
(already done by the lead; do not redo). Read first exactly what the previous lab author read (see « Lab author — like-terms » above: DNA all,
CONTRACT §1, §2, §4.1, §6bis, §6ter, §7, §7bis-levels, §7ter, §8, §8bis, §8ter, §8quater LabCoach, §9; `docs/reports/LAB_COACH_ROLLOUT.md`), and
READ the code of `algebra/LikeTerms.jsx` + `algebra/likeTerms/*` + `logic/likeTerms.js` (the freshest 3AM lab: shell, viewport budget,
`state.report`, `ManipulationDiscovery`, LabCoach wiring, free panel, two worlds in one type). Do NOT reuse or reskin `PitchExpansion` /
`TurfFactoring` (4AM) or `like-terms`.

**Why this is not another lab (DNA §12).** 4AM `pitch-expansion` stretches x on a FOOTBALL pitch and CARRIES each zone into a sum; `like-terms`
carries bundles of pieces into trays. Here the hand holds a **CUT LINE** (a handle sliding along a side of a school-garden plot) and decides
**what each parcel counts as** (added, or taken away — the dallée path, the doubly-removed corner), and in the second world it **draws the
arrows** from a term to every term of the other bracket and decides each product's SIGN. The resistance is always an AREA / a VALUE counted
independently at the current x (which the hand also sets): a cut at the wrong place, a wrong sign, a wrong product are refused with the two
numbers. No football pitch, no trays, no pieces.

**Drawn world `schoolgarden`** (value: care for the school's shared garden): the plot seen from above — lawn (green), flower bed (warm colours,
tiny flowers), paved path (stone slabs, hatched when « removed »), a low hedge border, a gardener KidFigure (a girl in hijab + tunic, « هناء »)
at the edge who reacts (`wonder` / `proud`) and never carries information. A square grid unit u is budgeted from the viewport; x ∈ 4…9 (default
6) set by −/+ (and ← →) in a value pill; the plot resizes live. Honest drawing to scale; no raster.

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="area-split"
  world="plot" | "arrows"        // from the level preset (plot); module 3 passes world="arrows" with levels={false} and its own tasks
  tasks={[…]}                    // plot: { id, h, w } ; arrows: { id, expr } (see below). Default: the preset's
  level, levels, coach, lead     // as every type; lead REPLACES the default context sentence of the authored level (must carry every number)
  onTrial={(e) => …}             // each VALIDATED gesture, via state.report (« Events » below)
  onFinished={({ world }) => …}  // the formal phase reached
/>
```

### World `plot` (module 1, two levels)
A side is `{ m, n }` = `m·x + n` with m ∈ {0,1,2}, n an integer (m = 0 → a constant side, never cut). `h` = the vertical side (the plot's
width), `w` = the horizontal side (its length); the expression is `h × w` — e.g. `3(x+4)`, `(x−2)(x−3)`.
`levels.js`: `'area-split': { beginner: { numbers: { world: 'plot', tasks: [...] }, ...P }, advanced: { numbers: { world: 'plot', tasks: [...] }, ...T('act-3') } }`:
- **مبتدئ** `p1`: `h={m:0,n:3}`, `w={m:1,n:4}` → 3(x+4) = 3x + 12 (a lawn of length x and a flower bed of length 4, both 3 wide);
  `p2`: `h={m:0,n:2}`, `w={m:1,n:-3}` → 2(x−3) = 2x − 6 (a plot x long from which a paved path 3 wide is taken). Scaffold: the cut handle
  shows the side's brace labels once it is right; patch areas are SHOWN (value pills) and the reduced line writes itself.
- **متقدم** `p3`: `h={m:1,n:3}`, `w={m:1,n:2}` → (x+3)(x+2) = x² + 2x + 3x + 6 → x² + 5x + 6 (four parcels, two cuts, two like patches merge);
  `p4`: `h={m:1,n:-2}`, `w={m:1,n:-3}` → (x−2)(x−3) = x² − 3x − 2x + 6 → x² − 5x + 6 (a x×x plot, two paved paths overlap in a corner: the
  corner is given back). Scaffold removed: no brace labels (only the written side `x + 3`, `x − 2`…), no patch-area pills; the student sets the
  coefficient of each power (stepper per x², x, 1) and presses « تحقّق » to reduce.

Hand and gestures (every gesture has pointer drag, tap-tap and keyboard paths; controls ≥ 44 px):
1. **CUT** — each cut side (m·x ≠ 0 and n ≠ 0) has a handle on its outer edge, sliding by whole units (arrows ← → on the focused handle, tap
   a tick, drag). For n > 0 the right cut position is `m·x` (where the term `m·x` ends and the number begins); for n < 0 it is `m·x + n`
   (the start of the paved strip). A release anywhere else is a trial `refused reason 'cut'`: the parcels it makes are shown for a moment with
   numeric lengths that cannot be written with x (« 5 و 7 »), the handle returns, the banner says why in one sentence (never the answer).
   (Numerically any cut keeps area = sum: the free panel lets the student cut anywhere and read both meters equal.)
2. **SIGNS** — after the cuts the patches (1 or 2 for `h` constant, 4 for two cut sides) are drawn, each with a card « تُضاف » / « تُطرح »
   (two buttons, none pre-selected). A patch's area is `|a|·|b|` (dims shown on the card as the two sides' terms, e.g. `(−2) × (−3)`); the judge is
   the COUNTED AREA of the plot at the current x versus the signed sum: a wrong choice is refused (`reason 'sign'`, with the two areas:
   « الأرض بعد الممرّين تساوي 12 م² وما كتبتَه يساوي 0 »). The corner patch of `p4` is the decision that matters.
3. **x** — the value pill's −/+ (and the free panel); two live meters, side by side and ALWAYS equal once the signs are right:
   « مساحة الأرض (جداء البعدين) » and « مجموع مساحات الأجزاء » at the current x; the student moves x and both move together.
4. **Reduce** (advanced; beginner writes itself): coefficient steppers per power + « تحقّق » (a wrong coefficient is refused with both values at
   x, `reason 'coef'`).
5. **Free panel « جرّب أعدادك » ALWAYS OPEN** (DNA owner rule): −/+ steppers for h = m₁x + n₁ and w = m₂x + n₂ (m₁ ∈ 0…2, m₂ ∈ 1…2, n ∈ −6…6,
   the plot never degenerate: x > |n|), building a custom task that runs the SAME mechanics (`{ kind: 'custom', world }`).

Discovery (`ManipulationDiscovery`, refutable options, nothing before it states the rule): « كم مرّة نُحصي مساحة الأرض، ولماذا النتيجة واحدة؟ » —
right « مرّةً كجداء البعدين ومرّةً كمجموع مساحات أجزائها، والنتيجتان متساويتان مهما كان $x$ » ; wrong « المجموع أكبر لأنّ الأجزاء تتراكب » (refuted by
the two meters), « تتساوى عند $x$ واحد فقط » (refuted by the student's own change of x). `discoveryReady` = both tasks of the level solved.
Formal (named only here): area two ways, distributivity as « كل حدّ يضرب كل حدّ », the corner given back.

### World `arrows` (module 3, `levels={false}`, the lesson passes its own `tasks`; defaults)
`tasks=[{ id, expr }]` with `expr` = `{ products: [{ sign: 1|-1, f1: [terms], f2: [terms] }, …] }` in `polynomials.js` term format
(`{ c, p }`), e.g. `5(x+2)` = one product `f1=[{c:5,p:0}]`, `f2=[{c:1,p:1},{c:2,p:0}]`; a leading minus before a product is `sign: -1`.
Defaults, exactly: `a1` 5(x + 2) → 5x + 10 · `a2` −3(x − 4) → −3x + 12 (a minus sign / negative factor) · `a3` (2x + 1)(x − 3) →
2x² − 5x − 3 (four arrows, two like terms) · `a4` 3(2 − x) − 4(x − 1) → 10 − 7x (two products, a minus before the second, then like terms).
The written expression is drawn big (LTR line, every term a chip); the factor chips are the arrow ORIGINS. Gesture: drag from a factor chip of
the first bracket (or the leading factor) onto a term chip of the other bracket — a red arrow (like the textbook's arcs) is drawn and the
**partial product** appears under the line as a card with its MAGNITUDE (`2x × 4 → 8x`) and two sign buttons; the student sets the sign. The
judge is the VALUE at the current x of the product of the two terms (`(2x)·(−3)` at x = 2 is −12, the card says `+` → refused, `reason 'sign'`,
banner with the two numbers). An arrow that lands inside its OWN bracket or on a term already linked from the same origin is refused
(`reason 'arrow'`). When every origin has reached every term the products are collected (like terms: the student sets the coefficient per
power with steppers, « تحقّق », exactly as the advanced plot level) and the final line is written; the value pill (x, −/+) and the two meters
(written expression / written expansion) stay visible throughout. A leading minus before a bracket is a sign-button decision on the products
below it (the lesson recalls « −(…) » from the previous lesson). Free panel always open: build `f1`, `f2` (1–2 terms each, c ∈ −6…6, p ∈ 0…1)
and run the same mechanics. Discovery after `a3` or `a4`: « ماذا يحدث لكل حدّ في القوس الأوّل؟ » — right « يُضرب في كل حدّ من القوس الثاني ثم
تُجمَع الجداءات » ; wrong « يُضرب في الحدّ الأول فقط » (refuted by the value meters: 2 arrows are missing) and « يُضاف إلى كل حدّ » (refuted).

### Exact maths (before the UI)
Create `packages/core/arithmetic/expansion.js` (+ `expansion.test.js`), imported BY PATH, never from the core barrel, built on `polynomials.js` and
`brackets.js` (reuse `partialProducts`, `expand`, `reduce`, `evaluate`, `termsTex`; add what is missing, with tests): sides and plots
(`plotOf(h, w)`, the correct cut positions, the parcels with their dims and signed areas at x, the counted area), the patch sign rule
(`patchSign`), the corner, arrows products and `valueAt`, witnesses (an x for which a wrong answer differs: x ranges guarantee it), and every
LaTeX string through `termsTex`. UI-side orchestration in `manipulations/logic/areaSplit.js` (+ test: every task of both worlds SOLVED by
following `coachOf`; every refusal reason with its numbers; value invariance when x changes; reset).

**Events (`state.report`, fixed — the lesson reads them):**
- `{ kind: 'cut', world: 'plot', task, side: 'h'|'w', at, ok }` (every release; `ok` false → also `{ kind: 'refused', reason: 'cut', ... }`)
- `{ kind: 'patch', world: 'plot', task, patch, sign: 1|-1, ok, corner: boolean }` ; `{ kind: 'refused', world: 'plot', reason: 'sign', patch, corner, x, counted, written }`
- `{ kind: 'arrow', world: 'arrows', task, from, to, ok }` ; `{ kind: 'product', world: 'arrows', task, from, to, sign, ok }` ; `{ kind: 'refused', world: 'arrows', reason: 'sign'|'arrow', ... }`
- `{ kind: 'coef', world, task, power, ok }` ; `{ kind: 'x', x }` ; `{ kind: 'solved', world, task, expr, expanded, result }` (LaTeX strings) ; `{ kind: 'custom', world }`

**DOM contract:** `[data-area-split][data-world][data-task][data-solved]`, `[data-as-glance]` (plot/line + meters + controls), `[data-as-cut=h|w][data-at]`
(handle), `[data-as-patch=<id>][data-sign][data-corner]` + `[data-as-sign=plus|minus]`, `[data-as-x]` with `[data-as-x-less]` / `[data-as-x-more]`,
`[data-as-meter=whole|parts]`, `[data-as-line]`, `[data-as-coef=<p>]` + `[data-as-check]`, `[data-as-origin=<i>]`, `[data-as-target=<j>]`,
`[data-as-arrow]`, `[data-as-product=<k>][data-sign]`, `[data-as-refused=<reason>]`, `[data-as-banner]`, `[data-as-next]`, `[data-as-free]`, `[data-as-formal]`.

**Must:** the design sheet (DNA §7) and the contract's five questions in the header; NO title — the context in one or two plain sentences, then ONE
direct question naming the goal and the end state (DNA §17.9); one screen at 768×1024, 1024×768 **with the lesson sidebar open (content column
≈ 450–520 px on the real lesson page — measure there, not on a scratch page)**, 1280×800, 1366×768, 1920×1080, both levels and the arrows world
(budgets from `useLessonViewport`, secondary material in `LabFold`); LabCoach (`coachOf` for plot and arrows, followed to the end of every task in
the test, the bubble NEVER covering the working area); KidFigure girl in hijab; Arabic everywhere (aria-labels too); numbers and formulas LTR
(signed numbers in `<bdi dir="ltr">`; formulas through `MathText` or the kit's LTR spans; no `$` printed raw); reduced motion; 3 hints, closed by
default; « إعادة » clears the trial memory; strings ONLY in `lesson.manipulation.json › areaSplit` (`t('manipulation.areaSplit.…')`, counted nouns
via plural keys); label-collision geometry tests (patch labels, brace labels and the two meters never overlap at any size); register the type in
`manipulationRegistry.js`, `levels.js` (+ `levels.test.js`), the contract section in `MANIPULATION_CONTRACT.md` (next FREE `§2…` number — re-read
the file first), the row in `MANIPULATION_DNA.md` §15, the row in `docs/reports/LAB_COACH_ROLLOUT.md`.
**Screenshots (Playwright, dev server on port 4173; the lesson's module pages mount even while the lesson is `coming_soon`:
`/courses/moyen/3am/ansab_al_aadad_wal_hisab/nashr-jabri-3am/nashat` and `…/tariqa` once the lead has written them — until then a scratch page)
of the initial and mid-activity states (a refused cut, a refused sign, the corner decision, the reduce check, an arrow + its product card,
the formal phase) at the five sizes × both levels × both worlds — LOOK at every one and iterate to the DNA §17 bar.** Tests:
`expansion.test.js`, `logic/areaSplit.test.js`, `algebra/areaSplit.render.test.jsx` (renderToString in the i18n test setup; no `{{`; no Latin prose;
opens on CONTEXT then ONE question), then `npx vitest run src/lessons/common/manipulations` in `apps/web` and `npx vitest run arithmetic` in
`packages/core`. Report: files, test results, the DOM contract as built, the screenshots reviewed and what you changed after them.

## Bank author — `content/practice/3am/nashr-jabri-3am/`

Read first the same documents as « Bank author — tabsit-hadhf-aqwas » above (all of it applies word for word with the names below), and use
`content/practice/3am/tabsit-hadhf-aqwas/` + `scripts/practice-oracle/tabsit-hadhf-aqwas.mjs` as the freshest shape reference (algebraic answers
written from terms, every option generated by a tested function, every distractor FALSE).
- **50 exercises**, 10 per level, ids `ex-3am-nashr-jabri-3am-l<N>-<NNN>`, every one with `metadata.exam`.
- **Provenance:** corpus exercises tagged `3am.m5.r02` (check each file's text with `pdftotext -layout` / `pdftoppm`): `3am-s2-75` ex 2, `3am-s2-68`
  ex 2, `3am-s2-69` ex 2, `3am-s2-70` ex 1 (`3am-s2-70-copy` is the same paper — cite ONE), `3am-s2-76` ex 5 / `3am-s2-81` ex 1 and 5 (same situation — cite ONE),
  `3am-s2-80` ex 2, `3am-s2-82` ex 2 and 5, `3am-s3-47` ex 5, `3am-s3-49` ex 1, `3am-s3-51` ex 1 (the expansion part), `3am-s3-56` ex 1, `3am-s3-59` ex 2 and 5;
  `2am-s2-65` ex 4 is a 3AM paper misfiled (its header counts). ~15 `term_exam`, the rest `term_exam_modelled` / adapted from textbook elements.
  Many of those exercises also evaluate (`3am.m5.r03`, lesson `qimat-ibara-harfiya`, not yet generated) or solve an equation (`3am.m5.r06`):
  keep THIS lesson's steps counted; evaluation / equation steps are `counted: false` and light; never teach the identities by name; never factor.
- **Textbook elements the bank MUST cite** (each in `source: {type:"textbook", elementId, page, …}` of an adapted exercise or in `cites`; own numbers
  and contexts, never « الكتاب ص … », never copied word for word) — every element of `docs/sources/3am/unit4/extraction.json` whose destination
  lesson is `nashr-jabri-3am` and that the lesson's modules do not already cite. The lesson's modules cite: `act-3`, `know-3`, `method-2`,
  `method-3`, `now-59` (item 2), `ex-8`, `ex-15`, `ex-16`, `ex-18`, `deep-43` (items ب, جـ), `prep` (9–11). The bank must therefore cover:
  `challenge`, `ex-9`, `ex-10`, `ex-11`, `ex-17`, `ex-19`, `ex-20`, `ex-21`, `ex-22`, `ex-23`, `ex-24`, `ex-25`, `ex-26`, `self-4`, `self-5`, `self-7`,
  `self-8`, `deep-40`, `deep-41`, `deep-42`, `deep-44`, `deep-45`, `deep-46` (read each `answer` in the extraction: they are computed). `ex-11` only READS
  the equality right-to-left and checks it by expanding (no factoring question); `ex-24` is « square = product of two equal brackets » (no
  identity named); `ex-25` / `ex-26` / `deep-45` / `deep-46` are mental-calculation exercises that use an expansion. Citing an element destined elsewhere breaks `check:textbook`.
- **What is assessed:** P1 (k(a ± b), k negative, x(…), `3 + 5(x−2)` — the factor that does not reach the first term), P2 ((a+b)(c+d) with
  signs, four products, a square read as a product), P3 (the area of a rectangle counted two ways; a plot with a path; « نشر = مساحة » in a story),
  P4 (expand then simplify and order: 3(1−4x) − 7(x−2) + x(5−3x); spot the error; check an expansion by a value at two x; several-step
  stories). Each LP primary on ≥ 8 questions. Geometry contexts (areas and perimeters in x) are welcome. `answerType` `choice` (every distractor
  FALSE, tagged `misconception`: factor not distributed to every term, sign of a negative product lost, the second product forgotten
  `(a+b)(c+d)=ac+bd`, the corner sign, a sum written as ka + b, 5x² for 5x + … merged) or `numeric` / `expression` as the other banks do.
  Misconception ids `MISC-NASHR-*`.
- **Oracle:** `scripts/practice-oracle/nashr-jabri-3am.mjs` recomputes EVERY constructed answer and every choice key as a polynomial AND by
  evaluation at several x (its own code in `helpers.mjs`, never `packages/core`), imported into `scripts/practice-answer-oracle.test.mjs`.
- **Wiring:** `content/practice/active.json`, `exam-style.json`, `policy.json`, `misconceptions.json` and the generated practice index (small
  targeted Edits after a fresh Read — other leads edit these files NOW). Gates: `node scripts/validate-exercises.mjs --strict`, the oracle test,
  `node scripts/check-textbook-coverage.mjs`, the scripts tests. Report: files, counts per level and per LP, corpus exercises used (file + exercise).
