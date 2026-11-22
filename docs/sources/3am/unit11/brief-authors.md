# 3AM unit 11 « خاصية فيثاغورس، جيب تمام زاوية » — authors' brief (lesson `khassiyat-fitaghuras`, 2026-10-20)

Cycle moyen rollout, phase 3, Phase A queue entry #2 — same organisation as `docs/sources/1am/unit11/brief-authors.md` (read its two
author sections: they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/3am/handasa/fitaghuras-jayb-tamam/khassiyat-fitaghuras/`), the lab `pythagoras-tanks` and the extraction
(`docs/sources/3am/unit11/extraction.json`, built by `build-extraction.py`; the unit is seeded: `fitaghuras-jayb-tamam/_unit/`). Two
other leads work in the SAME tree at the same time (3AM `quwat-adad-nisbi`, 3AM `tabsit-hadhf-aqwas`): never touch their folders, and
edit a shared file only by a small `Edit` right after a fresh `Read` (never rewrite it, never revert someone else's change).

| Author | Owns | Never touches |
|---|---|---|
| **Lead** | the lesson folder, `_unit/`, the extraction, the lab (`manipulations/geometry/PythagorasTanks.jsx`, `logic/pythagorasTanks.js`, `packages/core/arithmetic/pythagoras.js`), its registry / levels / i18n entries, the catalogue flip | `content/practice/**` |
| **Bank** | `content/practice/3am/khassiyat-fitaghuras/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/khassiyat-fitaghuras.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction, the catalogue |

Tablet and laptop only (owner, 2026-10-15). Never commit, never push, never run the DB import (the coordinator does).

## The lesson in one paragraph

« خاصية فيثاغورس » (3AM, textbook pp. 167 (أستعدّ 1–4, 6, 7), 168 (نشاط 1 Perigal, نشاط 2 اللمسة √), 170 (معارف 1 + its « نتيجة »), 171
(طريقة « حساب طول ضلع », the FEJ half of « المثلث قائم أم لا », دوري الآن 1 and 2-ب), 174–175 (ex 1–9, 11–17 with 16-2), 177 (أؤكّد 1–4 HDB), 178
(أتعمّق 31)). Programme items `3am.m4.r03` « معرفة خاصية فيثاغورس واستعمالها » and `3am.m4.x1` « المبرهنة والمبرهنة العكسية » (shared with
`aksiya-fitaghuras`). The idea the student must DISCOVER: **in a right triangle, the square built on the hypotenuse has exactly the area of the
two other squares together — BC² = AB² + AC² — and ONLY when the angle is right (smaller when the angle is acute, larger when it is obtuse).
So the equality computes a missing side (the hypotenuse by adding, a leg by subtracting), the calculator's √ key gives its exact value √n or a
rounded one, and a triangle whose longest side squared is NOT the sum of the two others is NOT right.**

**Boundary** (written once in `build-extraction.py`): this lesson = the DIRECT property and its CONTRAPOSITIVE (prove « NOT right »). Proving a
triangle IS right (the converse), deciding the nature in both cases and distinguishing property / converse in a proof belong to
`aksiya-fitaghuras` (not generated yet). √ is ONLY the calculator key here: the square root is BUILT in 4AM by `jidhr-tarbii` (labs
`square-root-side`, `square-fold`, `square-tiling`) — never bracket √n by hand, never re-teach it. Cosine belongs to `jayb-tamam-zawiya` /
`hisab-jayb-tamam`.

Final الكفاءات (`3am_khassiyat-fitaghuras_P<n>`, order kept):

1. **P1** معرفة خاصية فيثاغورس: إذا كان $ABC$ قائما في $A$ فإن $BC^2=AB^2+AC^2$ (مربع طول الوتر، وهو الضلع المقابل للزاوية القائمة، يساوي مجموع مربعي طولي الضلعين الآخرين)
2. **P2** حساب طول الوتر أو طول ضلع قائم في مثلث قائم بمعرفة طولي الضلعين الآخرين (بكتابة مساواة فيثاغورس المناسبة ثم التعويض)
3. **P3** استعمال اللمسة $\sqrt{\ }$ للآلة الحاسبة لإعطاء القيمة المضبوطة أو قيمة مقرّبة لطول
4. **P4** استعمال خاصية فيثاغورس لإثبات أن مثلثا غير قائم (مربع طول أطول أضلاعه لا يساوي مجموع مربعي طولي الضلعين الآخرين)

Review links (« أستعدّ »): `1am.m2.r08` (area of a rectangle / square — `mustatil-murabba-masaha`, planned) and `3am.m3.r06` (power of a
rational — `quwat-adad-nisbi`, being generated in parallel, treat as unpublished). Both are unpublished: `pointPrerequisites` are intra-lesson.

## Bank author — `content/practice/3am/khassiyat-fitaghuras/`

Read first: `docs/architecture/EXERCISE_CONTRACT.md` § « Platform-generated practice exercises », « Answer-key integrity », « A practice
question may be served alone », « Présentation examen (BEM) » (Data, Term-exam provenance), « Earlier-year review link » (nothing to author),
« Statement figures » and « Unit 9 » / « Unit 10 » (geometry `statement.figure` = GeoFigure data, rounded values are `rational`, exact surds
are `choice`); `docs/sources/moyen/exams/EXAM_PATTERN.md` (all, §6 is the recipe); `docs/sources/4am/bem-practice/brief-authors.md` (the
sheet format); shape references: `content/practice/1am/masahat-muhit-sath/` + `scripts/practice-oracle/masahat-muhit-sath.mjs` (a 1AM–3AM
term-exam bank), and a 4AM geometry bank with right-triangle figures (`content/practice/4am/nisab-muthallathiya/` or `.../talis-hisab-atwal/`)
for `statement.figure`; `scripts/lib/examProvenance.mjs`. The 3AM folder `content/practice/3am/` may be created by another lead at the same
time — just add your lesson's folder.

- **50 exercises**, 10 per level, ids `ex-3am-khassiyat-fitaghuras-l<N>-<NNN>`, every exercise with `metadata.exam` (exam sheet). Levels follow
  EXAM_PATTERN §6 (L1 one direct skill; L2 compute then « علّل / برّر »; L3 a complete 3–4-question exercise; L4 an exercise that also mobilises
  another lesson of the SAME term — such steps `counted: false`; L5 « الوضعية الإدماجية » in parts ending on a justified decision).
- **Provenance — the 3AM term-exam corpus** (`docs/sources/moyen/exams/exams-index.json`, PDFs under `docs/Exames-1 AM to 3AM/3am/`;
  `pdftotext -layout` for text layers, `pdftoppm -r 100` for scans — read only what you need). Exercises tagged `3am.m4.r03` / `3am.m4.x1`:
  `3am-s2-76` ex 3 (lengths by Pythagoras, « هل المثلث قائم »), `3am-s2-81` ex 3 (a broken tree), `3am-s2-80` ex 4 (circle, right triangle,
  Pythagoras), `3am-s2-82` ex 3 and ex 5 (integration: courtyard, tree), `3am-s2-83` ex 4 and ex 5 (a right triangular plot, a well),
  `3am-s2-78` ex 3 and ex 5 (billiards), `3am-s2-72` ex 3 and ex 5 (cross-country course), `3am-s2-70` ex 5 (a footbridge), `3am-s2-68` ex 4,
  `3am-s3-47` ex 5 (a pipe and its price), `3am-s3-56` ex 4, `3am-s3-59` ex 5, and `2am-s2-65` ex 5 (a 3AM paper misfiled: a basketball-hoop
  ladder). **About 15 exercises `term_exam`** = modelled on ONE precise corpus exercise (`metadata.source = {type:"term_exam", grade:"3am",
  semester, file, exercise}`, badge « على منوال اختبار الفصل الثاني / الثالث » from that paper's header): keep its structure and register,
  CHANGE numbers and context, never copy word for word. The rest `{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"3am-s2"}`
  (badge), plus a few `adapted` from a textbook element (badge `null`, `source: {type:"textbook", elementId, page, …}`) — ONLY elements whose
  destination is `khassiyat-fitaghuras` in the extraction: `prep`, `act-1`, `act-2`, `know-1`, `method-1`, `method-2` (FEJ half only), `now-1`,
  `now-2` (item b only), `ex-1` … `ex-9`, `ex-11` … `ex-15`, `ex-16` (item 2 only), `ex-17`, `self-1` … `self-3`, `self-4` (HDB only), `deep-31`.
  Citing any other element breaks `check:textbook`. Figures are drawn with the platform's own numbers; independence from the book: never
  « الكتاب ص … », never copy a box or an exercise word for word.
- **What is assessed (and what is NOT):** P1 (write the Pythagoras equality for a named right triangle — the hypotenuse is the side opposite the
  right angle; several right triangles in one figure), P2 (hypotenuse by adding squares, a leg by subtracting; units; a diagonal of a rectangle /
  square, the height of an isosceles or equilateral triangle, a ladder, a ramp, a TV screen…), P3 (exact value `$\sqrt{21}$` vs a value rounded to
  0,1 / 0,01 with the √ key; rounding, never truncating; a perfect square gives an exact decimal: √6,25 = 2,5), P4 (« هل المثلث قائم؟ » whose answer
  is NO: compare the square of the LONGEST side with the sum of the two others and conclude « ليس قائما » by the property). **Never** a step that
  proves a triangle IS right (the converse — next lesson), never a cosine, never bracketing √n by hand. Each LP primary on ≥ 8 questions; ≥ 15
  questions with a GeoFigure right-triangle figure (right-angle mark, lengths as `$…\,\mathrm{cm}$` labels).
- `answerType`: `choice` (every distractor FALSE and tagged `misconceptionId`), `rational` (a number; decimal comma accepted; say the rounding
  in the question), `selfCheck` for « برّر » steps. New misconception ids `MISC-FITAGHURAS-*` in `content/practice/misconceptions.json`:
  `HYP-WRONG` (a leg taken for the hypotenuse: adds where it must subtract — the classic « EG² = 17² + 15² »), `ADD-LENGTHS` (BC = AB + AC),
  `SQUARE-DOUBLE` (a² read as 2a), `NO-ROOT` (gives BC² as BC), `ROOT-SPLIT` (√(a² + b²) = a + b), `LEG-ADD` (a leg by adding squares),
  `ROUND-TRUNC` (truncates instead of rounding), `ROUND-EARLY` (rounds an intermediate result), `NOT-LONGEST` (compares with a side that is not
  the longest), `LOOKS-RIGHT` (decides by eye / « almost equal so right »: 9,4² = 88,36 vs 90,25), `NON-RIGHT-APPLIED` (applies the property in a
  triangle not known to be right).
- Every question: `step`, `timeSeconds`, `solution.lines` (« التصحيح النموذجي » style: « المثلث ABC قائم في A، حسب خاصية فيثاغورس: … »),
  hints that never contain the answer, `feedback.correct` as a one-line explanation, `learningPoints` with exactly one primary of THIS lesson,
  standing alone (daily challenge).
- **Values in story contexts** (LESSON_DEVELOPMENT_GUIDE §5): each story woven with a good value (التعاون، الأمانة، إتقان العمل، العناية بالمكان
  المشترك، برّ الوالدين…), short; rewrite the corpus' contexts, never copy them. Amounts « دج » in Arabic text; units glued to a number inside the
  math island `$2{,}4\,\mathrm{cm}$`.
- **Oracle:** `scripts/practice-oracle/khassiyat-fitaghuras.mjs` recomputes EVERY constructed answer and every choice key from the statement /
  figure data with its own exact code (decimal squares as BigInt over powers of 10, √ exact when the radicand is the square of a decimal, else
  rounded HALF-UP at the asked precision), imported into `scripts/practice-answer-oracle.test.mjs` like the other lessons.
- **Wiring:** add the lesson to `content/practice/active.json`, `exam-style.json`, `policy.json` (`minPerLevel: 10`, source naming the textbook
  pages and the term-exam generation); regenerate whatever generated index the practice content uses (find its script) — edits to shared files
  are small `Edit`s after a fresh `Read`.
- **Gates you run:** `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs` (the lesson
  folder may not exist yet when you start — then only your bank's own citations matter), `npx vitest run scripts` (or the scripts test command
  of the root `package.json`). Do NOT run `npm run build`, do not run the DB import.
  Report: files, counts per level and per LP, the corpus exercises used (file + exercise), the term_exam ids, test results.

## The lab — `pythagoras-tanks` (lead)

« خزّانات فيثاغورس » — a science-fair machine: three thin square tanks of the same thickness built on the sides of a triangle whose two legs are
hinged at A. The hand holds the ANGLE at A (مبتدئ, legs 3 and 4) or the LENGTH of the third side (متقدم, legs 5 and 12, then 2 and 3 → √13 with
the √ key); « اسكب » pours the two small tanks into the big one: exact fill only at 90°, overflow when acute, a gap when obtuse. Contract:
`MANIPULATION_CONTRACT.md` § « The square tanks under the hand — `pythagoras-tanks` ».
