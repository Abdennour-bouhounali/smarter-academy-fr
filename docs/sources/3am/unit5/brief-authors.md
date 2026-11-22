# 3AM unit 5 « المساويات – المتباينات – المعادلات » — authors' brief (lessons `musawiyat-amaliyat`, then `muadalat-darajat-ula`, 2026-10-21)

Cycle moyen rollout, phase 3, Phase A queue entries #5 and #6 — same organisation as `docs/sources/3am/unit11/brief-authors.md` (its « Bank author »
section applies word for word with the names below; read it first). The LEAD writes the lessons
(`apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-mutabayinat/<lesson>/`), the labs, the extraction
(`docs/sources/3am/unit5/extraction.json`, built by `build-extraction.py`) and the catalogue flip. Other leads work in the SAME tree at the same
time: never touch their folders, edit a shared file only by a small `Edit` right after a fresh `Read`, never revert someone else's change.
Tablet and laptop only. Never commit, never push, never run the DB import.

| Author | Owns | Never touches |
|---|---|---|
| **Lead** | the lesson folders, `_unit/`, the extraction, the labs (`equality-lanes`, `term-ferry`), registry / levels / i18n entries, the catalogue flip | `content/practice/**` |
| **Bank** | `content/practice/3am/<lesson>/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/<lesson>.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the labs, the extraction, the catalogue |

## Unit boundaries (also in the header of `build-extraction.py`)

- `musawiyat-amaliyat` (#5) = EQUALITIES and the operations on their two sides (item `3am.m5.r05`, equality half). `mutabayinat-amaliyat` =
  the same item, inequality half (not generated yet). `hasr-adad-ushri` = bracketing / rounding of a decimal (`3am.m5.x1`, not generated yet).
  `muadalat-darajat-ula` (#6) = first-degree equations in one unknown (`3am.m5.r06`; EXTENDS the 2AM item `2am.m4.r08`).
- **Never write a step that belongs to another lesson of the unit**: no inequality in #5's bank (the corpus tags `3am.m5.r05` mostly for
  inequalities: model only its EQUALITY exercises, or build platform exercises on equalities), no bracketing/rounding step, and in #5 no
  « solve ax + b = cx + d » method (it is #6's); in #6 no inequality, no rounding.

## Lesson #5 — `musawiyat-amaliyat` « المساويات والعمليات » (the bank brief)

The idea the student DISCOVERS in the lab `equality-lanes` (two runners stand on the same mark when the two sides of an equality are equal; the hand
holds the number c of an operation applied to both sides — one side only breaks the equality): **a = b ⟹ a + c = b + c, a − c = b − c, a × c = b × c
and a ÷ c = b ÷ c (c ≠ 0)** for any rational c (negative too); the operation must be done on BOTH sides; ÷ 0 is refused; × 0 keeps the equality true but
loses all information (0 = 0). Used to TRANSFORM a known equality (3 = 2x − 4 ⟹ 2x − 5 = 2) and to decide that an equality follows from it or not.

Final الكفاءات (`3am_musawiyat-amaliyat_P<n>`, order kept):

1. **P1** معرفة أنّه إذا كان $a=b$ فإنّ $a+c=b+c$ و $a-c=b-c$ (عدد ناطق c): لا تتغيّر مساواة عندما نضيف إلى طرفيها معًا (أو نطرح منهما) العدد نفسه
2. **P2** معرفة أنّه إذا كان $a=b$ فإنّ $a\times c=b\times c$ و $\frac{a}{c}=\frac{b}{c}$ مع $c\neq 0$ (c موجب أو سالب)
3. **P3** توظيف خواص المساويات والعمليات للتحقق من صحة مساواة أو لتحويل مساواة معطاة إلى مساواة أخرى

Review links (« أستعدّ »): `2am.m4.r09` (test the truth of an equality / inequality with an unknown replaced by a value — `ikhtibar-musawat-mutabayina`,
planned) and `3am.m1.r01` (product of two rationals — `jidaa-adadayn-nisbiyayn`, planned). Both unpublished: `pointPrerequisites` intra-lesson.

- **Elements you may cite** (`source: {type:"textbook", elementId, page}`): `prep` (items 1, 3, 4, 9 only), `act-1`, `know-1a`, `know-1b`, `method-1a`,
  `method-1b`, `ex-1` … `ex-5`, `self-1`, `self-2`. Anything else breaks `check:textbook`. Independence from the book: never « الكتاب ص … », never copy.
- Corpus exercises on equalities (read the PDFs; `exams-index.json` tags): `3am-s3-59` ex 2 (« تبيين نشر، حل معادلتين »), `3am-s3-57` ex 1 (test a
  solution, solve), `3am-s3-47` ex 1 (mcq with justification — equalities rows only), `3am-s2-81` ex 2 (an equation, test a number), `3am-s3-49` ex 1,
  `3am-s2-68` / `3am-s2-80` for contexts. About 15 `term_exam`, the rest `term_exam_modelled` / `adapted`.
- What is assessed: P1 (equality kept after + / − on both sides; the same number on ONE side only breaks it; negative c), P2 (× / ÷ both sides; c ≠ 0;
  c < 0 keeps the EQUALITY — only inequalities flip, and they are not in this lesson), P3 (« x with 3 = 2x − 4: are 2x − 5 = 2 and 2x + 4 = −3 true? » by
  the properties, not by finding x; fill the blank equality; write the equality obtained by multiplying both sides by −3; true/false « if 3x = 4 then x = 1 »).
- Misconception ids `MISC-MUSAWIYA-*` in `content/practice/misconceptions.json`: `ONE-SIDE` (operation on one side only), `ADD-MULT-MIX` (adds where he must
  multiply / forgets the other term: 2x − 5 × (−3) = −6x − 5), `SIGN-NEG` (× by a negative keeps the signs), `DIV-ZERO` (divides by 0), `MULT-ZERO`
  (concludes anything from 0 = 0), `TERM-LOST` (does not apply c to every term of a side), `CONVERSE` (believes 2x + 4 = −3 is « still true » because
  the operation is allowed: a different number added), `VALUE-CHECK-ONLY` (decides truth from one value without using the property).
- Answer types: `choice`, `rational` (decimal comma accepted), `selfCheck` for « برّر » steps; an equality typed as an answer is a `choice` among equalities.

## Lesson #6 — `muadalat-darajat-ula`

« المعادلات من الدرجة الأولى بمجهول واحد » (3AM, textbook pp. 73, 76, 77, 79–80, 82–83, 85; programme item `3am.m5.r06`, which EXTENDS the 2AM item
`2am.m4.r08` « a ÷ … = b »: the lesson opens on a « تذكّر — السنة الثانية » box, never rebuilds it). The idea the student DISCOVERS in the lab
`term-ferry` (two river banks = the two sides, crates = the terms; the hand carries a crate and CHOOSES its sign on arrival, then picks the divisor): **a term
that crosses the « = » changes sign because we add its opposite to BOTH sides; keeping the sign breaks the equation; when x is alone times a coefficient
(ax = n) we divide both sides by a, x = n/a; the solution is verified by substitution in the starting equation; a problem is put into an equation by choosing
the unknown, translating the data, solving, stating the solution and checking it in the story.** Builds on #5 (operations on both sides) without
re-teaching it.

Final الكفاءات (`3am_muadalat-darajat-ula_P<n>`, order kept):

1. **P1** التعرّف على معادلة من الدرجة الأولى بمجهول واحد (من الشكل $ax+b=cx+d$) ومعنى حلّها: قيمة المجهول التي تجعل الطرفين متساويين
2. **P2** التحقق بالتعويض من أنّ عددًا حلّ لمعادلة (حساب الطرفين وإثبات تساويهما أو عدم تساويهما)
3. **P3** حلّ معادلة من الشكل $ax+b=cx+d$ بإضافة معاكس الحدود إلى الطرفين (نقل حدّ بتغيير إشارته) ثم القسمة على معامل المجهول، والتحقق من الحلّ
4. **P4** ترييض مشكلة: اختيار المجهول وترجمة المعطيات بمعادلة وحلّها والتصريح بالحلّ والتحقق منه ضمن السياق

Review links (« أستعدّ »): `2am.m4.r08` (`hall-mushkil-muadala`, planned), `3am.m5.r01` (simplify an algebraic expression — `tabsit-hadhf-aqwas`, another lead's, treat as
unpublished) and `3am.m5.r05` (`musawiyat-amaliyat`, PUBLISHED = lesson #5). `pointPrerequisites` P3 ← `3am_musawiyat-amaliyat_P1`, `_P2` (net link r05 → r06).

- **Elements you may cite** (extraction destinations = `muadalat-darajat-ula`): `prep` (items 2, 5, 6, 10, 11, 12), `act-4`, `know-4`, `know-5`, `method-4`, `method-5`,
  `now-77-2`, `ex-29` … `ex-61`, `ex-63`, `ex-64`, `ex-65`, `self-6` … `self-13`, `ict`. Nothing else. Independence from the book: never « الكتاب ص … », never copy; figures
  that the book's exercises need (ex-41, 43, 45, 47, 48, 52, 54, 59, 60, 64) are drawn with the platform's own numbers (GeoFigure data) or replaced by a verbal statement.
- **Corpus exercises tagged `3am.m5.r06`** (read the PDFs): `3am-s2-68` ex 5, `3am-s2-81` ex 2, `3am-s3-47` ex 2, `3am-s3-49` ex 1, `3am-s3-51` ex 2 and 3, `3am-s3-56` ex 5,
  `3am-s3-57` ex 1 and 4, `3am-s3-59` ex 2, 3 and 5. About 15 `term_exam`, the rest `term_exam_modelled` / `adapted`.
- What is assessed: P1 (is it a first-degree equation in one unknown? left / right side; the meaning of « حلّ »), P2 (test a number: compute BOTH sides — « هل 0 حلّ لـ 2x + 1 = 3x − 5 »,
  fractional and negative values), P3 (solve ax + b = cx + d with integer, negative and decimal coefficients; every line of a model solution « نضيف … إلى الطرفين » ; check by
  substitution; an equation whose x terms cancel is OUT of scope), P4 (age, perimeter, price, consecutive numbers, marks average, angles of a triangle, two shops, a trip: choose
  the unknown WITH ITS UNIT, write the equation, solve, state the answer in a sentence, check IN THE STORY). Never a system of two equations, never an inequality.
- Misconception ids `MISC-MUADALA-*`: `SIGN-KEPT` (moves a term without changing its sign), `ONE-SIDE` (operates on one side only), `DIV-PART` (divides only one term of a side),
  `DIV-WRONG` (multiplies or subtracts the coefficient instead of dividing), `NEG-COEF` (loses the sign when dividing by a negative), `NO-CHECK` (does not verify), `UNKNOWN-UNIT`
  (unknown without a unit / a vague « x » for « the price »), `TRANSLATE` (misreads « ينقصه » / « يزيد عن » / « ضعف »: adds where he subtracts), `SOLUTION-CONTEXT` (a solution that does not fit the story: negative age, fractional people),
  `PARTIAL-SOLVE` (stops at ax = n).
- Answer types: `choice`, `rational` (decimal comma accepted; say the unit), `selfCheck` for the written solution of a modelled problem (« اكتب معادلة ») — equations typed as answers are
  `choice` among equations. The oracle recomputes every equation, solution and check with its OWN exact rational code (never `packages/core`).
