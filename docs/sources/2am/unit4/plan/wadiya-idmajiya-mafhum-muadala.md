# Plan — `wadiya-idmajiya-mafhum-muadala` « أدمج تعلّماتي — مفهوم معادلة » (2AM unit 4, synthesis)

Read the unit [`README.md`](README.md) first. The three lessons of the unit (`ibara-harfiya-intaj`, `hall-mushkil-muadala`,
`ikhtibar-musawat-mutabayina`) are published before this synthesis. Shape: the 2AM unit-2 synthesis
(`docs/sources/2am/unit2/plan/wadiya-idmajiya-kusur-amaliyat.md` and its « Generator notes »), itself the 3AM / 4AM synthesis shape.
Pair 5, lane B (port 5174); the other lane runs `wadiya-idmajiya-adad-nisbiya-2`.

## 1. Identity

- **Code** `wadiya-idmajiya-mafhum-muadala` · **title** « أدمج تعلّماتي — مفهوم معادلة » · unit `mafhum-muadala` · catalogue order 21 ·
  `kind: synthesis` · `prerequisiteLessonCodes`: the three lessons (already in the catalogue).
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/wadiya-idmajiya-mafhum-muadala/`, module files
  `Module00Astaidd.jsx`, `Module01Wadiya1.jsx` … `Module06Wadiya6.jsx`, `Module07TahlilWadiya.jsx`, `Module08Ahill.jsx` (every declared
  module needs its route: `registry.test.js`).
- **Textbook** (PDF = book − 3): « أدمج تعلّماتي » p. 68 (PDF 65): `integration` (Amine chooses between two clubs: 1300 + 150 per
  session vs 800 + 170) and `evaluation` (braking distance D = V × V / 203,2 or / 101,6; a car at 130 km/h, an animal at 150 m); `ict`
  act p. 69 (PDF 66: « + 3, × 2, + 2 × the number → 48 » by a spreadsheet); `deep-58` p. 67 (bank). Catalogue `textbookRef.pages`:
  `integration: [68, 68]` → **add `evaluation: [68, 68]` and `ict: [69, 69]`**.
- **Seeds the unit: no.** After this entry `check:textbook` must show NO pending element in the unit.
- **Shape:** 00 أستعدّ · 01–06 « الوضعية التدريبية 1…6 » (`track: 'problem'`, `practice_lab`) · 07 « تحليل الوضعية النهائية للاختبار » (the
  only `ContentModule`, with `objectives`) · 08 « وضعية الاختبار النهائي ». No lab. `durationMinutes` 30 (validate:lessons computes
  modules 0 + 7 + 8); `difficulty` « متقدم »; icon 🧩.

## 2. Programme & net

- `programmeItems: []` (catalogue). One LP (README Q11, the 2AM unit-1 / unit-2 syntheses' decision): **P1** « حلّ وضعية إدماجية بإنتاج
  عبارة حرفية وحساب قيمها وتبسيطها، واختبار صحّة مساواة أو متباينة بقيم معطاة، وحلّ معادلة من الأشكال $a\times x=b$ ، $\frac xa=b$ ،
  $\frac ax=b$ أو من خطوتين » → `2am_wadiya-idmajiya-mafhum-muadala_P1`.
- `pointPrerequisites` (the unit's own lessons, all published):
  - P1 ← `2am_ibara-harfiya-intaj_P2`;
  - P1 ← `2am_hall-mushkil-muadala_P3`;
  - P1 ← `2am_ikhtibar-musawat-mutabayina_P1`;
  - P1 ← `2am_ikhtibar-musawat-mutabayina_P3`.
- `reviewLinksForLesson` is empty; « أستعدّ » measures one key الكفاءة of each lesson and its advice names the three lessons. noRebuild:
  nothing is taught.

## 3. Boundary

No new notion. Every question uses only: expressions with one or two letters, their values and simplified writings (k·a + m·a, k(a + b)
from unit 1); testing an equality / an inequality at GIVEN values; the three one-operation forms and the two-step k·x + c = d. **Never:**
x on both sides to SOLVE (an equality « 1200 + 150n = 600 + 180n » is TESTED at given n, or read in a table — never solved), the same
operation on both members, bracket removal after −, an answer that needs the 3AM rules.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `integration` | two club formulas; a table; when equal; from which n is B cheaper | two expressions, a table, an equality tested, an inequality among values | **Training situation 1, redesigned**: a computer club, 1200 + 150n vs 600 + 180n (equal at n = 20) |
| `evaluation` | braking distance V²/203,2 and V²/101,6 at 130 km/h vs 150 m | the value of a formula, a decision | **Training situation 2, redesigned**: a workshop's shoe-size rule P = 1,5 × L + 2 (exact values; a value, a two-step equation, a test) — README Q13 |
| `ict` act | « + 3, × 2, + 2 × the number → 48 » by a spreadsheet in steps of 0,5 (x = 10,5) | a program → an expression → simplified → solved; a table | **Training situation 6, redesigned**: « + 5, × 2, + 3 × the number → 65 » (x = 11) |
| `challenge` (unit page, rewritten) | 40 cells? 151 rods → how many cells? | expression, value, equation | **Training situation 5** (the rewritten تحدّ, README) |
| `deep-58` | angles x, 2x, 3x of a triangle | like terms then a × x = b | bank L3 |

## 5. Modules (9) — each with `objectives`

**00 أستعدّ** — `objectives`: « أتحقّق من أنّي أنتج عبارة وأحسب قيمتها وأختبر مساواة وأحلّ معادلة قبل الوضعيات ». Six statements:

| # | Statement | Key | Lesson |
|---|---|---|---|
| 1 | « عدد الأعواد لصفّ من $n$ خلية هو $6n$ » | ✗ ($5n+1$: عود مشترك) | ibara-harfiya-intaj |
| 2 | $2a+5a-a=6a$ | ✓ | ibara-harfiya-intaj |
| 3 | « قيمة $3x^2$ من أجل $x=2$ هي $36$ » | ✗ ($12$) | ibara-harfiya-intaj |
| 4 | « $4x+1=2x+7$ صحيحة من أجل $x=3$ » | ✓ ($13=13$) | ikhtibar-musawat-mutabayina |
| 5 | « حلّ المعادلة $\frac{9}{x}=0{,}6$ هو $5{,}4$ » | ✗ ($15$) | hall-mushkil-muadala |
| 6 | « حلّ $3x+12=30$ هو $6$ » | ✓ | hall-mushkil-muadala |

« هل تعلم » closes the module (platform words): the sign « = » was first used by Robert Recorde in 1557, « because no two things can be
more equal than two parallel lines » — no computation.

**01 الوضعية التدريبية 1 — نادي الإعلام الآلي** (`integration` redesigned)
- `objectives`: « أكتب عبارتين لصيغتين وأقارنهما بجدول قيم ». Mobilises ibara P1/P2, ikhtibar P1/P3.
- Context: « يقترح نادي الإعلام الآلي صيغتين: A: $1200$ DA للتسجيل و $150$ DA للحصّة ؛ B: $600$ DA للتسجيل و $180$ DA للحصّة. »
- Q/A: 1) المبلغ بدلالة عدد الحصص $n$ → $1200+150n$ ؛ $600+180n$ ; 2) أكمل الجدول $n=10, 15, 20, 25$ → A: $2700, 3450, 4200, 4950$ ؛
  B: $2400, 3300, 4200, 5100$ ; 3) « اختبر المساواة $1200+150n=600+180n$ من أجل $n=20$ » → $4200=4200$ ✓ ; 4) « من بين $15$ ، $20$ ، $25$:
  القيم التي تجعل $600+180n<1200+150n$ صحيحة » → $15$ فقط ; 5) « أيّ صيغة تنصح بها تلميذًا يحضر $12$ حصّة؟ » → B ($2760<3000$).

**02 الوضعية التدريبية 2 — قاعدة مقاس الحذاء** (`evaluation` redesigned)
- `objectives`: « أحسب قيمة صيغة وأجد مجهولًا فيها وأختبر شرطًا ». Mobilises ibara P2, hall P3, ikhtibar P3.
- Context: « تعتمد ورشة أحذية قاعدة تقريبية: مقاس الحذاء $P=1{,}5\times L+2$ ، حيث $L$ طول القدم بالسنتيمتر. »
- Q/A: 1) مقاس قدم طولها $24$ cm → $38$ ; 2) طول قدم مقاسها $41$ → $1{,}5L+2=41$ ، $1{,}5L=39$ ، $L=26$ cm ; 3) « حذاء مقاسه $40$ يناسب
  قدمًا إذا كان $1{,}5\times L+2\le40$ : اختبر $L=25$ ثمّ $L=26$ » → $39{,}5\le40$ ✓ ; $41\le40$ ✗ ; 4) « هل يمكن أن يكون مقاس الحذاء
  $2$؟ » → selfCheck (L = 0: no foot).

**03 الوضعية التدريبية 3 — حديقة بدلالة x** (the S2 register, own numbers)
- `objectives`: « أكتب محيط شكل ومساحته بدلالة x ثمّ أجد x من محيط معلوم ». Mobilises ibara P1/P3, hall P3.
- Context: « حديقة مستطيلة طولها $x+20$ m وعرضها $x$ m. »
- Q/A: 1) المحيط بدلالة $x$ مبسّطًا → $2(x+20)+2x=4x+40$ ; 2) المحيط $160$ m: أوجد $x$ → $4x+40=160$ ، $4x=120$ ، $x=30$ ; 3) الأبعاد
  → $50$ m و $30$ m ; 4) المساحة → $1500$ m² ; 5) « تحقّق من المحيط بالأبعاد » → $2\times50+2\times30=160$.

**04 الوضعية التدريبية 4 — ورقة إجابات سارة** (judge a classmate)
- `objectives`: « أحكم على إجابات زميلة وأصحّح الخاطئ منها مع التعليل ». Mobilises all three lessons.
- Five answers (صحيح / خطأ, then the corrected value):
  - a) $3\times a\times a=3a^2$ → صحيح;
  - b) « قيمة $4x^2$ من أجل $x=3$ هي $144$ » → خطأ, $36$ (`MISC-IBARA2-PRODSQUARE`);
  - c) « حلّ $\frac{7{,}2}{x}=0{,}9$ هو $6{,}48$ » → خطأ, $8$ (`MISC-MAJHUL-MULTDIV`);
  - d) « $2x+5=4x-1$ صحيحة من أجل $x=3$ » → صحيح ($11=11$);
  - e) « $x+6$ و $3x+2$ متساويتان لأنّهما تعطيان $8$ من أجل $x=2$ » → خطأ ($x=0$ : $6\neq2$) (`MISC-IKHTIBAR-ONEVALUE`).
- « ما نقطة سارة من 5؟ » → **2**.

**05 الوضعية التدريبية 5 — صفّ الخلايا** (the rewritten تحدّ)
- `objectives`: « أعمّم نمطًا بعبارة ثمّ أستعملها لأجد عددًا مجهولًا ». Mobilises ibara P1/P2, hall P3, ikhtibar P3.
- Context: « في صفّ من خلايا سداسية متلاصقة تشترك كلّ خليتين متجاورتين في عود: الخلية الواحدة $6$ أعواد، والخليتان $11$ عودًا. »
- Q/A: 1) عدد الأعواد لـ $n$ خلية → $5n+1$ ; 2) لـ $40$ خلية → $201$ ; 3) « مع ياسين $151$ عودًا: كم خلية يصنع بها كلّها؟ » → $5n+1=151$ ،
  $n=30$ ; 4) « هل تكفي $230$ عودًا لـ $46$ خلية؟ » → $5\times46+1=231$ ، $231\le230$ خاطئة : لا.

**06 الوضعية التدريبية 6 — برنامج الحساب** (`ict` act redesigned)
- `objectives`: « أكتب برنامجًا بعبارة وأبسّطها ثمّ أجد العدد المختار بجدول وبمعادلة ». Mobilises ibara P1/P3, hall P3, ikhtibar P1.
- Context: « اختر عددًا، أضف إليه $5$، اضرب الناتج في $2$، ثمّ أضف إلى النتيجة ثلاثة أضعاف العدد المختار. حصلت هدى على $65$. »
- Q/A: 1) العبارة → $2(x+5)+3x$ ; 2) بسّطها → $5x+10$ (`tawzi-darb-jam-tarh` recalled, then $2x+3x=5x$) ; 3) أكمل الجدول $x=8$ إلى $12$ →
  $50, 55, 60, 65, 70$ ; 4) العدد الذي اختارته هدى → $11$ (by the table, and by $5x+10=65$ ، $5x=55$) ; 5) « تحقّق » → $2\times16+33=65$.

**07 تحليل الوضعية النهائية للاختبار — الرحلة المدرسية** (analysed, NOT solved)
- `objectives`: « أقرأ الوضعية النهائية وأفرز معطياتها وأختار الحسابات وترتيبها قبل أن أحلّها ».
- Situation text (it carries every datum module 8 needs): « تنظّم متوسطة رحلة إلى متحف: كراء الحافلة $12000$ DA، وتذكرة الدخول $200$ DA
  لكلّ تلميذ. عدد التلاميذ $x$. في صندوق التعاونية $18000$ DA. وفي النهاية بلغت التكلفة $20000$ DA وقُسّمت بالتساوي على التلاميذ. »
- Stages (unit-2 synthesis pattern):
  1. **Sort the data**: a FIXED amount (12000) vs an amount PER pupil (200); the budget (18000) is a LIMIT (an inequality), the final
     cost (20000) is an EQUALITY (an equation).
  2. **Choose the operations** (one-of-four `TapQuestion`s, no new component): the cost = expression; its value at 36; « does the budget
     cover? » = test an inequality at given values; « how many pupils? » = a two-step equation (undo + 12000 first); the share = a quotient
     (or the equation $\frac{20000}{x}=500$ checked).
  3. **The trap**: 20000 ÷ 200 = 100 pupils forgets the bus — counter-check: $12000+200\times100=32000\neq20000$.

**08 وضعية الاختبار النهائي** — `objectives`: « أحلّ وضعية الرحلة المدرسية ». Five evaluated stages (the final test):

| Stage | Question | Key | Distractors (misconception) |
|---|---|---|---|
| E1 | تكلفة الرحلة بدلالة $x$ | $12000+200x$ | $12200x$ (`SYN-MUAD2-ADDCOEF`) · $200+12000x$ (`SYN-MUAD2-ROLE`) · $12000\times200x$ |
| E2 | التكلفة من أجل $36$ تلميذًا | $19200$ DA | $7200$ (`SYN-MUAD2-FIXED`: the bus forgotten) · $439200$ (`SYN-MUAD2-ADDCOEF`: $12200\times36$) · $432200$ (`SYN-MUAD2-ROLE`: $200+12000\times36$) |
| E3 | من بين $25$ ، $30$ ، $32$ : القيم التي تجعل $12000+200x\le18000$ صحيحة | $25$ و $30$ | $25$ فقط (`MISC-IKHTIBAR-STRICT`: $18000\le18000$) · $32$ فقط · الثلاث |
| E4 | عدد التلاميذ إذا كانت التكلفة $20000$ DA | $x=40$ ($200x=8000$) | $100$ (`SYN-MUAD2-FIXED`) · $160$ (`SYN-MUAD2-SIGN`: « $+12000$ » undone by adding: $(20000+12000)\div200$) · $60$ ($12000\div200$) |
| E5 | « نصيب كلّ تلميذ $500$ DA » : تحقّق بالمعادلة $\frac{20000}{x}=500$ | صحيح ($20000\div40=500$) | « $x=10\,000\,000$ » (`MISC-MAJHUL-MULTDIV`) · « $x=0{,}025$ » (`MISC-MAJHUL-FLIP`) |

All values verified (planner, 2026-10-29). New synthesis ids only where no lesson id fits: `MISC-SYN-MUAD2-FIXED` (the fixed part
forgotten), `MISC-SYN-MUAD2-ADDCOEF` (a fixed amount added to the coefficient), `MISC-SYN-MUAD2-ROLE` (fixed and per-unit amounts swapped), `MISC-SYN-MUAD2-SIGN` (an operation undone by itself instead of its
inverse).

## 6. Practice bank — `content/practice/2am/wadiya-idmajiya-mafhum-muadala/` (5 × 10)

**Corpus (term-2 integration situations whose remaining parts are not claimed by the three lessons — README « one paper part, one
sheet »):**
- read today: none whose part is free (`2am-s2-50` ex 5 parts 1 and 3, `2am-s2-72` ex 5, `2am-s2-73` ex 5 and `2am-s2-75` ex 5 are
  allotted to the lessons; their part 2 « سياج وتكلفته » of `2am-s2-50` — the fence with a 2 m gate at 150 DA/m — is FREE and goes here
  after the lead checks the scan);
- to read: `2am-s2-52` ex 5 (a kitchen and a bathroom in x, tiling, the cheaper width), `-53` ex 5 (a tomato farmer: areas, an equation, a
  fraction of a quantity, a profit — keep « ربح », never « فائدة »), `-56` ex 5 (a house and a garage, tiling — poor text), `-59` ex 5 (if
  not used by hall), `2am-s3-41` ex 5 (a car and bicycle park), `-30` ex 5, `-37` ex 5 (if not used by ibara), `2am-s3-25` ex 5 (equations
  then statistics: the statistics steps `counted: false`).

**Honest FAITHFUL count: 0 read today; 3–5 expected.** A sheet is faithful when its unit-4 part stands alone; perimeter / area / cost
parts of 1AM–2AM geometry stay but are `counted: false`.

| Level | Content | Provenance |
|---|---|---|
| L1 | one short item per lesson (an expression, a value, a test, an equation) | 10 modelled |
| L2 | short contexts: a formula with a fixed part, its value, a given value tested | 8 modelled · 2 adapted (`deep-58`, `self-2`) |
| L3 | two formulas compared with a table; the equal value TESTED; the cheaper one among given values | 1 term_exam (`2am-s2-52` ex 5 after reading) · 9 modelled |
| L4 | figures « بدلالة x »: perimeter → equation → dimensions → area / cost | 1–2 term_exam (`2am-s2-50` ex 5 part 2, `2am-s2-53` ex 5 after reading) · 8 modelled |
| L5 | « الوضعية الإدماجية (08 ن) », two parts, a justified decision (enough? which offer? does the truck cross?) | 1–2 term_exam (`2am-s3-41` ex 5, `-56` ex 5 after reading) · 8 modelled |

**Badges:** « على منوال اختبار الفصل الثاني ». Modelled sheets: `platform_addition`, `reason: "term_exam_modelled"`, `modelledOn: "2am-s2"`.
**Answer types:** `decimal`, `rational`, `expression` (if the lesson banks use it — else `choice`), `choice`, `selfCheck`. Every question's
primary LP: the synthesis P1 or the lesson LP it mobilises. **Oracle:** `scripts/practice-oracle/wadiya-idmajiya-mafhum-muadala.mjs` —
reuses the three lesson oracles' exported helpers if they export any (else its own BigInt code) and recomputes every key from the
statement's numbers.

## 7. Risks & owner questions

1. **One LP with `programmeItems: []`** (README Q11).
2. **The integration's equality is TESTED, never solved** (x on both sides is 3AM): question 3 gives n = 20; question 4 lists values.
3. **The evaluation is redesigned** (README Q13): the braking context (an animal on a wet road) is dropped because 130² ÷ 101,6 is not
   exact; confirm.
4. **The Recorde « هل تعلم »** is a platform fact (1557, « The Whetstone of Witte »): keep it in platform words, no image.

## 8. Generator checklist

- [ ] `build-extraction.py`: `integration` → module 1; `evaluation` → module 2; `ict` act → module 6; `deep-58` → `None` (bank); all
  `verified: True` after re-reading PDF pp. 64–66 at 200 dpi; `check:textbook` green with NO pending element in the unit.
- [ ] Lesson folder: nine module files; `content/problems.js` + `problems.test.js` (every answer recomputed exactly; every distractor
  false or equal to its named error); `content/textbook.js`; progressive knowledge map; `objectives` on the `ContentModule` (module 7;
  modules 0–6 and 8 carry their goal in `desc`, unit-2 generator note).
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json` (`MISC-SYN-MUAD2-*`).
- [ ] `validate:lessons`, `generate:lesson-index`, `generate:learning-net`, `check:lessons`, `npm test`, `build`; e2e: extend the unit's
  lesson-kit scripts with the synthesis (module routes mount, module 8 evaluates).
- [ ] Publish (guide §11): `pointsToLearn` (P1), `pointPrerequisites`, `textbookRef.pages` (+ `evaluation`, `ict`), `durationMinutes` 30,
  `difficulty`, `icon`, status `available`; export/import; local DB publish (lesson, 9 modules, 50 exercises — nothing `draft`); commit
  `feat(lessons): wadiya-idmajiya-mafhum-muadala`; progress report « 2AM unit 4 complete ».

## 9. Successor connection

None: a synthesis has no programme item and no net link. The 3AM unit-5 lessons keep the edges written for `hall-mushkil-muadala` and
`ikhtibar-musawat-mutabayina`.

## 10. Generator notes (2026-10-30)

Generated INTO the catalogue entry; bank by a helper, lesson by the lead. Changes to the plan:
- **`objectives`** live only on the `ContentModule` (module 7), as in the unit-2 synthesis: modules 0–6 and 8 carry their goal in `desc`.
- **Situation texts as built:** 1 (club) — table asked at n = 10 and 25, equality tested at 20 with both sides computed, inequality at 15 / 20 / 25 (15 only), advice at 12 sessions (B, 2760 < 3000); 2 (shoe rule) — the « a size of 2 » question is a choice (L = 0 means no foot); 3 (garden) — the unit-1 « 4x + 20 / 2x + 40 » slips as distractors; 4 (Sara's sheet) — the five claims are a `problem.table` (the long inline statement was unreadable in bidi), the counterexample of (e) is x = 0 (6 ≠ 2); 5 (cells) — 5n + 1, 201, n = 30, 231 > 230; 6 (program) — 2(x + 5) + 3x = 5x + 10, table 50…70, x = 11, check 32 + 33 = 65. Every number was recomputed in `problems.test.js` (BigInt).
- **Module 7** shows the counter-check « 12000 + 200 × 100 = 32000 ≠ 20000 » (the plan's trap) in an option of step 6, and no value of the solution (`content.test.js` greps for 19200 and the cost expression « 12000+200x »); its four `TapQuestion`s never keep the correct option first.
- **Final test E1–E5** as planned; E5's options are statements about the verification (« صحيح: 20000 ÷ 40 = 500 » against three wrong solutions of the retyped equation).
- **Data lines** (`data[].text`, `asks`) wrap every value + unit / Latin letter run in an LTR isolate (U+2066 … U+2069): in the sorter chips « 160 m » read « m 160 » otherwise. The illustrations are `tags` cards (the `scene` chips touch the frame border).
- **Catalogue:** P1 = 181 characters, `pointPrerequisites` P1 ← `ibara-harfiya-intaj_P2`, `hall-mushkil-muadala_P3`, `ikhtibar-musawat-mutabayina_P1`, `…_P3`; `textbookRef.pages` also lists `evaluation: [68, 68]` and `ict: [69, 69]`; `durationMinutes` 30; `description` written. The unit's تحدّ text (units file) is the rewritten « 40 cells / 151 rods » and matches situation 5.
- **Extraction:** `integration` → 1, `evaluation` → 2, `ict` act → 6 are cited by `src()`; `deep-58` → bank; all four marked `verified` after re-reading book pp. 67–69 (PDF 64–66) at 90 dpi; `self-2` gets a declared `duplicatedIn` for the synthesis because the bank adapts it at L2; no pending element is left in the unit.
- **Bank (helper):** 50 sheets, 3 `term_exam` (`2am-s2-52`, `-53`, `-56`, all exercise 5) / 45 modelled / 2 adapted (`deep-58`, `self-2`), 152 questions, every question's primary الكفاءة is the synthesis P1 (`validate-exercises` rejects another lesson's LP: the plan's « or the lesson LP it mobilises » is not possible). `2am-s2-50` ex 5 part 2 (the fence) is NOT free (hall L5-001 cites it) and `2am-s3-41` ex 5 is ambiguous (its corrigé contradicts the figure): both left out; `2am-s2-59` ex 5 needs x + x/2 = 450 (outside the boundary). `2am-s2-53` ex 5 part 4: the paper's corrigé gives 290 but the text (transport deducted) gives 320; 320 is used and 290 is the `MISC-SYN-MUAD2-FIXED` signature. New misconceptions `MISC-SYN-MUAD2-FIXED / ADDCOEF / ROLE / SIGN`.
- **Open points:** none for the owner; the coordinator runs the DB export/import and the publish commit.
