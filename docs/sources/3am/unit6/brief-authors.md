# 3AM unit 6 « التناسبية » — authors' brief (lessons `tanasub-tamthil-bayani` #9 then `nisba-miawiya-3am` #10, 2026-10-21)

Cycle moyen rollout, phase 3, Phase A queue entries #9 and #10 — same organisation as `docs/sources/3am/unit5/brief-authors.md` and
`docs/sources/3am/unit11/brief-authors.md` (its « Bank author » section applies word for word with the names below; read both first). The LEAD writes the
lesson folders (`apps/web/src/lessons/moyen/3am/tanasubiya_duwal/tanasubiya-sura/<lesson>/`, `_unit/` is seeded), the labs, the extraction
(`docs/sources/3am/unit6/extraction.json`, built by `build-extraction.py`) and the catalogue flip. Other leads work in the SAME tree (3AM `nashr-jabri-3am`,
2AM `rabi-mutanasib`): never touch their folders, edit a shared file only by a small `Edit` right after a fresh `Read`, never revert someone else's change.
Tablet and laptop only. Never commit, never push, never run the DB import.

| Author | Owns | Never touches |
|---|---|---|
| **Lead** | the lesson folders, `_unit/`, the extraction, the labs (`pin-rails`, `hundred-grid`), registry / levels / i18n entries, the catalogue flip | `content/practice/**` |
| **Bank** | `content/practice/3am/<lesson>/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/<lesson>.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the labs, the extraction, the catalogue |

## Unit boundaries (also in the header of `build-extraction.py`)

- `tanasub-tamthil-bayani` (#9) = GRAPHS of proportional situations (item `3am.m7.r01`). `nisba-miawiya-3am` (#10) = percent as a proportional situation
  (`3am.m7.r06`, CONSOLIDATES the 2AM `nisba-miawiya`: recalled, never rebuilt). `haraka-muntazama-sura` (#11, not generated now) = uniform motion, V = d/t,
  d = V×t, time and speed units (`3am.m7.r02–r05`). The synthesis follows.
- **Never write a step that belongs to another lesson of the unit**: no speed / distance / duration / km/h in #9 and #10 banks (no `d = V × t`), no
  percent in #9, no graph reading in #10, no affine function (y = ax + b with b ≠ 0 is met in #9 ONLY as a REFUSED case: « the line does not pass through
  O, so the situation is not proportional » — never studied as a function).

## Lesson #9 — `tanasub-tamthil-bayani` « التناسبية والتمثيل البياني »

The idea the student DISCOVERS in the lab `pin-rails` (a price board of drawing-pin boxes: the hand drags a column's pin UP its vertical rail to the price, then
lays a straight rod through two chosen nodes (O or pins)): **plotting a table's columns gives points of a frame; a situation is proportional exactly when ALL
its points lie on ONE straight line that PASSES THROUGH THE ORIGIN O; points aligned but off O (a delivery fee), points that bend (a price that changes
after the 8th box), or a curve are NOT proportional; on a proportional graph, the ordinate of the point of abscissa 1 is the coefficient a, every point
(x ; y) satisfies y = a·x, and an unknown value is read on the line (or computed with y = ax).**

Final الكفاءات (`3am_tanasub-tamthil-bayani_P<n>`, order kept):

1. **P1** تمثيل جدول معطيات بنقط في معلم متعامد ومتجانس (كل عمود من الجدول نقطة: فاصلتها العدد الأوّل وترتيبها العدد الثاني)
2. **P2** التعرّف على وضعية تناسبية من تمثيل بياني نقطه على استقامة واحدة مع مبدأ المعلم
3. **P3** التعرّف على أن تمثيلا بيانيا لا يمر بالمبدأ أو نقطه غير مستقيمة لا يمثل وضعية تناسبية
4. **P4** قراءة معامل التناسبية واستغلال التمثيل البياني لإيجاد قيم مجهولة ($y = ax$)

`pointPrerequisites`: P2 ← P1, P3 ← P2, P4 ← P2 (intra-lesson only: the net's earlier-year prerequisites are unpublished 2AM lessons).
Review links (« أستعدّ »): `2am.m6.r01` (recognise a proportional situation from a table — `wadiya-tanasubiya-jadwal`) and `2am.m4.r04` (read / place a
point by its coordinates — `talim-nuqta-mustawi`). Both unpublished; « أستعدّ » measures them with textbook `prep` items 1, 4, 5, 6 (rewritten) + platform items.

- **Elements you may cite** (extraction destinations = `tanasub-tamthil-bayani`): `prep` (items 1, 4, 5, 6 only), `act-1`, `know-1a`, `know-1b`, `method-1a`, `method-1b`,
  `ex-1` … `ex-5`, `self-1`, `self-2`, `deep-31`, `deep-32`, `deep-33`, `deep-41`. Nothing else (the `challenge` belongs to the unit page).
- **Corpus exercises tagged `3am.m7.r01`** — read `docs/sources/moyen/exams/exams-index.json` and the PDFs (graph of a proportional situation, table → points,
  « هل الوضعية تناسبية؟ برّر », read a quantity on a graph). ~15 `term_exam` (faithful), the rest `term_exam_modelled` / `adapted`.
- What is assessed: P1 (the coordinates of the point of a column; which table gives which graph; a graduated axis with scale 2 or 5 per square), P2 (graph of a
  proportional situation: line through O; verdict + justification), P3 (the three refusals: off O, not aligned, curve; « points aligned but not through O »;
  « a rising graph is proportional » is FALSE), P4 (the coefficient a = y/x read at one point; y = a·x; the unknown ordinate for a given abscissa and the
  unknown abscissa for a given ordinate, from the line or by computation; units).
- Figures: `statement.figure` = GeoFigure data (axes, grid, points, segments/lines) — read the 4AM banks `content/practice/4am/tamthil-bayani-khatti/` for the shape.
  Rounded values are `rational` (decimal comma accepted), verdicts are `choice`.
- Misconception ids `MISC-TAMTHIL-*`: `LINE-ANY` (any straight line is proportional), `THROUGH-O-ANY` (any graph through O, even a curve, is proportional),
  `RISING` (it goes up so it is proportional), `SWAP-XY` (abscissa / ordinate swapped), `SCALE-READ` (reads a graduation as 1 when a square is 2 or 5),
  `DIFFERENCE` (a = y − x), `COEF-INVERSE` (a = x/y), `TWO-POINTS` (checks two points only), `JOIN-DOTS` (reads between the dots with a segment line),
  `ORIGIN-DROP` (forgets that O is part of the graph).

## Lesson #10 — `nisba-miawiya-3am` « النسبة المئوية »

Net: item `3am.m7.r06` CONSOLIDATES `2am.m6.r04` (percent): « أستعدّ » measures that item with platform statements; معارف opens on a « تذكّر — السنة الثانية »
`TextbookBox` (link `getLessonPath('nisba-miawiya')`, null while unpublished); the lesson goes straight to the proportional treatment. The idea the student
DISCOVERS in the lab `hundred-grid` (a stock cut in 100 equal packets; the hand paints t packets; the value of one packet is x ÷ 100): **t % of a number x is
the value of t packets = x × t/100 (the coefficient of the proportional situation « 100 ↔ x »); a percentage a out of b is the t with a/b = t/100 (proportion
table: 100 ↔ b, t ↔ a); an increase of t % keeps the 100 packets and ADDS t packets: × (1 + t/100); a decrease takes t packets away: × (1 − t/100); the percent
is always taken of the STARTING quantity; an increase then a decrease by the same t % does not return to the start.**

Final الكفاءات (`3am_nisba-miawiya-3am_P<n>`, order kept, the three drafts kept word for word):

1. **P1** حساب $t\%$ من عدد بضربه في $\frac{t}{100}$
2. **P2** حساب نسبة مئوية بجدول تناسبية أو بالكتابة $\frac{a}{b}=\frac{t}{100}$
3. **P3** حساب ناتج زيادة أو تخفيض بنسبة $t\%$ بالضرب في $1+\frac{t}{100}$ أو $1-\frac{t}{100}$

`pointPrerequisites`: P2 ← P1, P3 ← P1 (intra-lesson; no net link from `3am.m7.r01` to `r06`, so no edge toward #9; the earlier-year link is to an unpublished 2AM lesson).
Review link (« أستعدّ »): `2am.m6.r04`.

- **Elements you may cite**: `prep` (items 7, 8, 9 only), `act-2`, `know-2a`, `know-2b`, `method-2`, `now-91`, `ex-6` … `ex-16`, `self-3` … `self-6`, `deep-30` (item `a` only),
  `deep-39`, `deep-40`. Nothing else.
- **Corpus exercises tagged `3am.m7.r06`** — read `exams-index.json` and the PDFs (a price with a discount / VAT, a percentage of a class, a rise of t %).
  ~15 `term_exam`, the rest `term_exam_modelled` / `adapted`.
- What is assessed: P1 (t % of x with whole and decimal values; 5 % = 0,05; 12,5 %), P2 (a out of b → t %, tables 100 ↔ b, the rate given the part and the whole, the whole
  given the part and the rate), P3 (the new price after +/− t %, the coefficient 1,15 / 0,85 chosen among options, the rate between an old and a new price, two
  successive changes: they multiply, +20 % then −20 % ≠ 0). Contexts: VAT, sales, population, class statistics, a battery, a recipe — never speed or graphs.
- Misconception ids `MISC-NISBA3-*`: `DIV100-ONLY` (divides by 100 and forgets × t), `MULT-T` (× t instead of × t/100), `ADD-T` (x + t, the percent added as a number),
  `COEF-INC` (increase by 15 % = × 0,15), `COEF-DEC` (decrease by 20 % = × 1,2 or × 0,2), `WRONG-BASE` (the rate taken on the NEW price), `PART-WHOLE-SWAP` (b/a instead of a/b),
  `SUM-RATES` (adds percents of different wholes), `UNDO` (+10 % then −10 % returns to the start), `ROUND-EARLY`.

## Bank author — rules (both lessons)

Read first: `docs/architecture/EXERCISE_CONTRACT.md` § « Platform-generated practice exercises », « Answer-key integrity », « A practice question may be served alone »,
« Présentation examen (BEM) » (Data, **Term-exam provenance**: `term_exam` = a FAITHFUL corpus exercise only, otherwise `term_exam_modelled`), « Earlier-year review link », « Statement figures »;
`docs/sources/moyen/exams/EXAM_PATTERN.md` (all, §6 is the recipe); `docs/sources/4am/bem-practice/brief-authors.md`; `scripts/lib/examProvenance.mjs`; shape references: the
published 3AM banks `content/practice/3am/musawiyat-amaliyat/`, `muadalat-darajat-ula/`, `khassiyat-fitaghuras/` and their oracles `scripts/practice-oracle/<lesson>.mjs`.
50 exercises per lesson, 10 per level, ids `ex-3am-<lesson>-l<N>-<NNN>`, every exercise with `metadata.exam`; levels per EXAM_PATTERN §6; each LP primary on ≥ 8 questions;
values woven into the stories (التعاون، الأمانة، إتقان العمل…), amounts in « دج »; `solution.lines`, hints that never contain the answer, `feedback.correct`, `learningPoints`
with exactly ONE primary of THIS lesson; standing alone. The oracle `scripts/practice-oracle/<lesson>.mjs` recomputes EVERY constructed answer and choice key with its own exact code
(Fractions / BigInt, never `packages/core`). Gates: `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`, `npx vitest run scripts`.
Report: files, counts per level and per LP, corpus exercises used, the `term_exam` ids, test results.

## The labs (lead)

- `pin-rails` « سكك الدبابيس » (#9) — contract `MANIPULATION_CONTRACT.md` new §: the hand drags a column's pin up its rail (exact snapping, refusal with the reading) and a
  straight rod's two ends onto chosen nodes (O or pins); pins on the rod turn green, the others show their gap; three price boards (proportional / aligned but off O / bending).
- `hundred-grid` « الصينية المئة » (#10) — the hand paints t packets of a stock cut in 100 equal parts (`x ÷ 100` per packet); an increase adds packets, a decrease removes them;
  distinct from `percent-tag` (4AM: a continuous bar stretched, chain bet).
