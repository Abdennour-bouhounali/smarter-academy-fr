# Plan — `wadiya-idmajiya-kusur-amaliyat` « أدمج تعلّماتي — الكسور والعمليات عليها » (2AM unit 2, synthesis)

Read the unit [`README.md`](README.md) first. The five lessons of the unit (`qisma-iqlidiya-hasr` + the four entries) are published
before this synthesis. Shape: the 3AM unit-2 synthesis (`docs/sources/3am/unit2/plan/wadiya-idmajiya-kusur-natiqa.md` and its « Generator
notes »), itself the 4AM synthesis shape.

## 1. Identity

- **Code** `wadiya-idmajiya-kusur-amaliyat` · **title** « أدمج تعلّماتي — الكسور والعمليات عليها » · unit `kusur-amaliyat` · catalogue
  order 10 · `kind: synthesis` · `prerequisiteLessonCodes`: the five lessons (already in the catalogue).
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/kusur-amaliyat/wadiya-idmajiya-kusur-amaliyat/`, module files
  `Module00Astaidd.jsx`, `Module01Wadiya1.jsx` … `Module06Wadiya6.jsx`, `Module07TahlilWadiya.jsx`, `Module08Ahill.jsx` (every declared
  module needs its route: `registry.test.js`).
- **Textbook** (PDF = book − 3): « أدمج تعلّماتي » p. 36 (PDF 33): `integration` (« التنمية المستدامة »: world sanitation, 3/25, 19/75,
  23/61 of 7,5 billion / 488 000) and `evaluation` (« وضعية للتقويم »: Rachid's phone credit 4/12, then 4/5 of the rest, 10 min left);
  `opener` p. 22 (re-routed here, README); `challenge` p. 22 (unit page + here, redesigned).
- **Seeds the unit: no.** After this entry `check:textbook` must show NO pending element in the unit.
- **Shape:** 00 أستعدّ · 01–06 « الوضعية التدريبية 1…6 » (`track: 'problem'`, `practice_lab`) · 07 « تحليل الوضعية النهائية للاختبار » ·
  08 « وضعية الاختبار النهائي ». `durationMinutes` 30 (validate:lessons computes modules 0 + 7 + 8 — 3AM generator note); `difficulty`
  « متقدم »; icon 🧩.

## 2. Programme & net

- `programmeItems: []` (catalogue). One LP (the 3AM syntheses' decision, published): **P1** « حلّ وضعية إدماجية بتوظيف الكسور والعمليات
  عليها: القسمة الإقليدية والحصر والقيم المقرّبة، الجمع والطرح، الجداء، والمقارنة » → `2am_wadiya-idmajiya-kusur-amaliyat_P1`.
- `pointPrerequisites` (the unit's own lessons, all published):
  - P1 ← `2am_qisma-iqlidiya-hasr_P2`;
  - P1 ← `2am_kasr-hasil-qisma_P4`;
  - P1 ← `2am_jam-tarh-kusur_P3`;
  - P1 ← `2am_jida-kasrayn_P3`;
  - P1 ← `2am_muqarana-kasrayn_P3`.
- `reviewLinksForLesson` is empty; « أستعدّ » measures one key الكفاءة of each lesson and its advice names the five lessons. noRebuild:
  nothing is taught.

## 3. Boundary

No new notion. Every question uses only: Euclidean division and the unit bracket; quotients by a decimal and their approximate values at
0,1 / 0,01; sums and differences when one denominator is a multiple of the others (n ± a/b, the rest); products (« of the remainder »);
comparison and order in the four 2AM cases. **Never:** unrelated denominators (3AM), division BY a fraction (3AM): a whole is found from
a unit fraction by multiplication (« $\frac16$ هو 500 MB، إذن الكلّ $6\times500$ »), percentages, equations.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `integration` | world sanitation: 3/25 without toilets, 19/75 gained sanitation, 23/61 of 488 000 deaths are children; numbers of people from 7,5 billion | a fraction of a large quantity; reading data | **Training situation 1, redesigned**: a commune's water network (fractions with related denominators, amounts, a comparison with 1/2, a per-household share bracketed to 0,01). The sad statistic (child deaths) is not reused. |
| `evaluation` | Rachid's phone credit: 4/12 week 1, 4/5 of the rest; left 10 min → the whole | of the remainder; the whole from a part | **Training situation 2, redesigned**: an internet package, 1/3 then 3/4 of the rest → 1/6 left = 500 MB → 3000 MB (×6, never ÷ 1/6) |
| `challenge` | four of five cards summing to 1 (printed set has NO solution) | sums to 1 with related denominators | **Training situation 3, redesigned** (cards 1/2, 1/3, 1/4, 1/6, 1/12: one choice of four) |
| `opener` | Egyptians wrote unit fractions; 1/3 + 1/2 = 5/6 | history | M0 « هل تعلم » in platform words; no computation (6 is outside the 2AM case) |

## 5. Modules (9) — each with `objectives`

**00 أستعدّ** — `objectives`: « أتحقّق من أنّي أقسم وأحصر وأجمع وأضرب وأقارن الكسور قبل الوضعيات ». Six statements:

| # | Statement | Key | Lesson |
|---|---|---|---|
| 1 | « $158=12\times13+2$ تعبّر عن القسمة الإقليدية لـ $158$ على $12$ » | ✓ (2 < 12) | qisma-iqlidiya-hasr |
| 2 | « $3{,}33$ قيمة مقرّبة إلى $0{,}01$ بالزيادة لـ $\frac{10}3$ » | ✗ (by default; excess 3,34) | kasr-hasil-qisma |
| 3 | $\frac56-\frac13=\frac12$ | ✓ | jam-tarh-kusur |
| 4 | « $\frac34$ من $\frac29$ هو $\frac16$ » | ✓ ($\frac6{36}$) | jida-kasrayn |
| 5 | $\frac5{12}>\frac12$ | ✗ ($\frac5{12}<\frac6{12}$) | muqarana-kasrayn |
| 6 | $\frac12+\frac14+\frac16+\frac1{12}=1$ | ✓ (12/12) | jam-tarh-kusur (cards) |

« هل تعلم » (`opener`, rewritten: the Egyptians wrote fractions with numerator 1, except 2/3) closes the module.

**01 الوضعية التدريبية 1 — شبكة مياه البلدية** (`integration` redesigned)
- `objectives`: « أحسب أجزاء من عدد كبير وأقارن الجزء بالنصف وأحصر نصيبًا ». Mobilises jam-tarh P3, jida P3, muqarana P3/P4, kasr P4.
- Context: « في بلدية $4800$ أسرة. رُبطت $\frac38$ منها بشبكة المياه الجديدة في السنة الأولى، و $\frac14$ في السنة الثانية. »
- Q/A: 1) الكسر المربوط → $\frac58$ ; 2) « هل رُبط أكثر من النصف؟ » → نعم ($\frac58>\frac48$) ; 3) عدد الأسر المربوطة → $3000$ (1800 + 1200) ;
  4) غير المربوطة → $\frac38$ ، $1800$ ; 5) « يوفّر الخزّان $2500\,\text{m}^3$ يوميًا للأسر المربوطة: احصر نصيب الأسرة إلى $0{,}01$ » →
  $\frac{2500}{3000}=\frac56$ ، $0{,}83<\frac56<0{,}84$ m³.

**02 الوضعية التدريبية 2 — باقة الإنترنت** (`evaluation` redesigned)
- `objectives`: « أتتبّع كسرًا من الباقي ثم أجد الكلّ من جزئه ». Mobilises jida P3, jam-tarh P3.
- Context: « استعملت عائلة $\frac13$ من باقة الإنترنت الشهرية في الأسبوع الأول، ثم $\frac34$ ما بقي في بقيّة الشهر. »
- Q/A: 1) الباقي بعد الأسبوع الأول → $\frac23$ ; 2) ما استُعمل بعده كسرًا من الباقة → $\frac34\times\frac23=\frac12$ ; 3) ما بقي في آخر الشهر →
  $1-\frac13-\frac12=\frac16$ ; 4) « بقي $500$ MB: ما حجم الباقة؟ » → $6\times500=3000$ MB ; 5) الأسبوع الأول → $1000$ MB.

**03 الوضعية التدريبية 3 — بطاقات المجموع** (`challenge` redesigned)
- `objectives`: « أبحث عن مجموع يساوي 1 بمقام مشترك هو مضاعف لكلّ المقامات ». Mobilises jam-tarh P2/P3, muqarana P2.
- Context: « لدى سارة خمس بطاقات: $\frac12$ ، $\frac13$ ، $\frac14$ ، $\frac16$ ، $\frac1{12}$ . »
- Q/A: 1) اكتب كلّ بطاقة بالمقام 12 → 6, 4, 3, 2, 1 من 12 ; 2) « رتّب البطاقات تصاعديًا » (same numerator) → $\frac1{12}<\frac16<\frac14<\frac13<\frac12$ ;
  3) « اختر أربع بطاقات مجموعها 1 » → $\frac12+\frac14+\frac16+\frac1{12}$ (the only four) ; 4) « وثلاث بطاقات؟ » → $\frac12+\frac13+\frac16$ ;
  5) « مجموع البطاقات الخمس أكبر من 1 بكم؟ » → $\frac{16}{12}-1=\frac4{12}=\frac13$.

**04 الوضعية التدريبية 4 — قماش الستائر**
- `objectives`: « أوظّف القسمة الإقليدية والقسمة على عدد عشري والقيم المقرّبة لاتّخاذ قرار ». Mobilises qisma P1/P2, kasr P3/P4.
- Context: « لفّة قماش طولها $50$ m ، تُقصّ منها ستائر طول كلّ واحدة $2{,}6$ m لأقسام المدرسة. »
- Q/A: 1) حوّل إلى ديسيمتر واكتب القسمة الإقليدية → $500=26\times19+6$ ; 2) عدد الستائر الكاملة والباقي → $19$ ، $0{,}6$ m ;
  3) احصر $\frac{50}{2{,}6}$ إلى $0{,}1$ → $19{,}2<\ldots<19{,}3$ ; 4) « تحتاج المدرسة $21$ ستارة: هل تكفي اللفّة؟ كم مترًا ينقص؟ » → لا ; $21\times2{,}6=54{,}6$ ، ينقص $4{,}6$ m.

**05 الوضعية التدريبية 5 — تبرّعات المستويات** (register of `2am-s1-91`, rewritten without the event)
- `objectives`: « أقارن حصصًا وأرتّبها ثم أحسب المبالغ ». Mobilises muqarana P3, jam-tarh P3, jida P3.
- Context: « جمعت متوسطة $9600$ DA لتجهيز مكتبتها: مستوى السنة الأولى $\frac38$ من المبلغ، والثانية $\frac14$ ، والثالثة $\frac5{16}$ ، والرابعة الباقي. »
- Q/A: 1) حصّة الرابعة → $\frac1{16}$ ; 2) رتّب الحصص تنازليًا → $\frac38>\frac5{16}>\frac14>\frac1{16}$ ; 3) المبالغ → $3600$ ، $2400$ ، $3000$ ، $600$ DA ;
  4) « هل ساهمت السنتان الأولى والثانية بأكثر من النصف؟ » → $\frac58>\frac12$ : نعم.

**06 الوضعية التدريبية 6 — ورقة إجابات رياض** (judge a classmate)
- `objectives`: « أحكم على حسابات زميل وأصحّح الخاطئ منها مع التعليل ». Mobilises all five lessons.
- Five answers (صحيح / خطأ, then the corrected value):
  - a) $\frac25+\frac3{10}=\frac5{15}$ → خطأ, $\frac7{10}$ (`MISC-JAMKASR-ACROSS`);
  - b) $\frac34\times\frac89=\frac23$ → صحيح;
  - c) $\frac47>\frac45$ → خطأ (`MISC-MUQKASR-BIGDEN`);
  - d) « $3{,}14$ قيمة مقرّبة إلى $0{,}01$ بالنقصان لـ $\frac{22}7$ » → صحيح ($3{,}142\ldots$);
  - e) « $125=9\times12+17$ هي القسمة الإقليدية لـ 125 على 9 » → خطأ (17 > 9; $125=9\times13+8$) (`MISC-HASR-*`).
- « ما نقطة رياض من 5؟ » → **2**.

**07 تحليل الوضعية النهائية للاختبار — أرض التعاونية** (analysed, NOT solved)
- `objectives`: « أقرأ الوضعية النهائية وأفرز معطياتها وأختار الحسابات وترتيبها قبل أن أحلّها ».
- Situation text (it carries every datum module 8 needs): « أرض تعاونية فلاحية مستطيلة طولها $120$ m وعرضها $80$ m . زُرع $\frac38$ منها قمحًا،
  و $\frac14$ بطاطا، و $\frac18$ زيتونًا، والباقي بستان. غُرس $\frac23$ البستان أشجار تفّاح. أنتج حقل القمح $1750$ kg . »
- Stages (4AM / 3AM pattern):
  1. **Sort the data**: fractions « of the LAND » (3/8, 1/4, 1/8) vs « of the ORCHARD » (2/3); the lengths; the yield.
  2. **Choose the operations** (one-of-four `TapQuestion`s, 3AM generator note — no new component): the planted part = sum; the orchard =
     1 − sum; the apple trees = 2/3 × the orchard; an area = fraction × 9600; the yield per m² = 1750 ÷ 3600 (a quotient to bracket).
  3. **The trap**: « $\frac23$ of the LAND » — counter-check: 3/8 + 1/4 + 1/8 + 2/3 > 1, impossible.

**08 وضعية الاختبار النهائي** — `objectives`: « أحلّ وضعية أرض التعاونية ». Five evaluated stages (the final test):

| Stage | Question | Key | Distractors (misconception) |
|---|---|---|---|
| E1 | الجزء المزروع قمحًا وبطاطا وزيتونًا | $\frac38+\frac14+\frac18=\frac68=\frac34$ | $\frac5{20}$ (JAMKASR-ACROSS) · $\frac58$ (JAMKASR-NOSCALE: 1/4 → 1/8) · $\frac{6}{24}$ (JAMKASR-DENSUM: 3/8 + 2/8 + 1/8 with the denominators added) |
| E2 | الجزء المخصّص للبستان، وأكبر المزروعات | $\frac14$ ; القمح ($\frac38$) | $\frac34$ (PART for the rest) · « الزيتون » (MUQKASR-BIGDEN: 8 > 4) |
| E3 | الكسر الذي يمثّله التفّاح من الأرض | $\frac23\times\frac14=\frac16$ | $\frac23$ (JIDAKASR-OFWHOLE / `SYN-KASR2-WHOLE`) · $\frac{11}{12}$ (sum for product) · $\frac83$ (JIDAKASR-CROSS: 2 × 4 / 3 × 1) |
| E4 | مساحة الأرض ومساحة التفّاح | $9600$ m² ; $1600$ m² | $400$ m² (perimeter) · $6400$ m² (2/3 of the land) |
| E5 | احصر مردود القمح في المتر المربّع إلى $0{,}01$ | $0{,}48<\frac{1750}{3600}<0{,}49$ kg | $0{,}4<\ldots<0{,}5$ (QARIBA-RANK) · $0{,}49<\ldots<0{,}50$ (QARIBA-ROUNDED) · $2{,}05<\ldots<2{,}06$ (RATIOFLIP: 3600 ÷ 1750) |

Wheat area 3600 m² (3/8 × 9600); 3600 × 0,48 = 1728 ≤ 1750 < 1764 = 3600 × 0,49. New synthesis ids only where no lesson id fits:
`MISC-SYN-KASR2-WHOLE` (a fraction of a part taken of the whole), `MISC-SYN-KASR2-PERIM` (perimeter for area).

## 6. Practice bank — `content/practice/2am/wadiya-idmajiya-kusur-amaliyat/` (5 × 10)

**Corpus (integration situations of term 1 whose FRACTION parts belong to this unit):**
- read: `2am-s1-68` « الوضعية الإدماجية » (three sons: 3/5, 2/25, the rest; is Hamza's share enough for a phone — the amount reads badly on the
  text layer: read the scan); `2am-s1-91` problem (associations 5/12, 2/4, the rest; 780 000 DA; boxes at 5000 DA — rewritten as a
  neutral solidarity context); `2am-s1-87` situation (land 800 m × 600 m — README discrepancy 4 first); `2am-s1-75` situation part 2
  (jam gifts — fractions on page 2);
- to read: `-83` ex 5 (land: wheat, pomegranate, olive, Deglet Nour palms), `-88` ex 5 (expenses over three months, 216 000 DA), `-73`
  ex 5 (three brothers share 1200 DA), `-69` ex 5 (brothers gather the parents' Umrah money — an Islamic context, keep it respectful
  or neutralise), `-70` ex 4 (flour for traditional pastries — drop the occasion), `-92` ex 1 / `-67` ex 5 (ploughing 120 m × 200 m over
  three days), `-74` ex 5 (ploughing and seed bags — also uses `qisma-iqlidiya-hasr`), `-84` ex 5 (fencing + ploughing), misfiled
  `3am-s1-112` ex 8 (wheat over four days).

**Honest FAITHFUL count: 3–4 read today; 5–7 expected.** A sheet is faithful when its fraction part stands alone; perimeter / area /
cost parts of 1AM–2AM geometry stay (they are earlier lessons) but are `counted: false`.

| Level | Content | Provenance |
|---|---|---|
| L1 | one short item per lesson (division, bracket, sum, product, comparison) | 10 modelled (the « exercise 2 » of a term-1 paper) |
| L2 | short contexts: the rest, a fraction of an amount, who has most — with « برّر » | 1 term_exam (`-73` ex 5 after reading) · 7 modelled · 2 adapted (`ex-29`-like, `deep-36`-like registers already used by lessons → here `platform_addition`) |
| L3 | shares of a land / a budget over days: is it all, what remains, order | 2 term_exam (`-91` problem, `-68` situation) · 8 modelled |
| L4 | land situations with lengths: areas of parts, a bracket of a yield or a price per m² | 1–2 term_exam (`-83` ex 5, `-92` ex 1 after reading) · 8 modelled |
| L5 | « الوضعية الإدماجية (08 ن) », two parts, a justified decision (enough? who most? how many bags/trucks?) | 1–2 term_exam (`-88` ex 5, `3am-s1-112` ex 8) · 8 modelled |

**Badges:** « على منوال اختبار الفصل الأول ». Modelled sheets: `platform_addition`, `reason: "term_exam_modelled"`, `modelledOn: "2am-s1"`.
**Answer types:** `rational`, `decimal`, `choice`, `selfCheck`. Every question's primary LP: the synthesis P1 or the lesson LP it
mobilises (follow the 3AM synthesis bank). **Oracle:** `scripts/practice-oracle/wadiya-idmajiya-kusur-amaliyat.mjs` — imports the
four lessons' oracle helpers (no new parser) and recomputes every key from the statement's numbers.

## 7. Risks & owner questions

1. **One LP with `programmeItems: []`** — as published for the 3AM syntheses (README Q8).
2. **The challenge redesign** (README Q3): the unit card keeps the book text until the owner decides.
3. **`integration` loses its statistics** (sanitation, child deaths): replaced by a commune's water network. Confirm.

## 8. Generator checklist

- [ ] `build-extraction.py`: `integration` → module 1; `evaluation` → module 2; `challenge` → module 3 (and `unit` page via
  `duplicatedIn`, as 3AM did); `opener` → module 0 (moved from `jam-tarh-kusur`); all `verified: True` after re-reading PDF pp. 19
  and 33 at 200 dpi; `check:textbook` green with NO pending element in the unit.
- [ ] Lesson folder: nine module files; `content/problems.js` + `problems.test.js` (every answer recomputed with exact fractions; every
  distractor false or equal to its named error); `content/textbook.js`; progressive knowledge map; `objectives` on every module.
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json` (`MISC-SYN-KASR2-*`).
- [ ] `validate:lessons`, `generate:lesson-index`, `generate:learning-net`, `check:lessons`, `npm test`, `build`; e2e: extend the unit's
  lesson-kit scripts with the synthesis (module routes mount, module 8 evaluates).
- [ ] Publish (guide §11): `pointsToLearn` (P1), `pointPrerequisites`, `durationMinutes` 30, `difficulty`, `icon`, status `available`;
  export/import; local DB publish (lesson, 9 modules, 50 exercises — nothing `draft`); commit `feat(lessons): wadiya-idmajiya-kusur-amaliyat`;
  progress report « 2AM unit 2 complete ».

## 9. Successor connection

None: a synthesis has no programme item and no net link. The 3AM unit-2 synthesis keeps its own five 3AM prerequisites.

## 10. Generator notes (2026-10-29)

Generated INTO the catalogue entry; bank by a helper, lesson by the lead. Changes to the plan:
- **`objectives`** live only on the `ContentModule` (module 7) in this codebase (the 3AM model has none elsewhere): modules 0–6 and 8 carry the plan's goal in their `desc`.
- **Final test E5 distractors**: `0,4 < … < 0,5` (QARIBA-RANK) is a TRUE statement for 0,486, so it was dropped; replaced by `0,49 < … < 0,50` (rounded), `2,05 < 3600/1750 < 2,06` (flipped quotient) and `0,72 < 1750/2400 < 0,73` (the potato field's area). E2 distractors: `3/4`, « the olive, because 8 is the largest denominator », `1 − 3/8 = 5/8`; E4: perimeter 400, `2/3 × 9600 = 6400`, `1/4 × 9600 = 2400` (the whole orchard as apple).
- **Module 7** has six steps (sorter, three-stage analysis, from what, order, « which area do we divide by », the `17/12 > 1` counter-check); the `situation` text carries every datum module 8 needs.
- **Situation 1** part 5 brackets 2500/3000 at 0,01 by `3000 × 0,83 = 2490 < 2500 < 2520`; situation 3 has five parts (the three-card and the `16/12 − 1` questions added); the printed challenge has no solution (discrepancy kept), the redesigned set has exactly one choice of four and one of three.
- **Bank (helper):** 8 `term_exam` (`2am-s1-73` ex 5, `-68` ex 4, `-91` ex 5, `-88` ex 5, `3am-s1-112` ex 8, `-83` ex 5, `-87` ex 5, `-92` ex 1), 42 modelled, 0 adapted — one over the planned 3–7 because all eight were read; the oracle imports `E` / `TEX` from `amaliyat-natiqa.mjs` (the four lesson oracles export nothing to import); extra misconception `MISC-SYN-KASR2-FRACONLY`.
- `extraction`: `integration` → 1, `evaluation` → 2, `challenge` → 3 (+ unit page), `opener` → 0, all `verified` after re-reading PDF pp. 19 and 33 at 110 dpi; no pending element left in the unit.
- Catalogue `textbookRef.pages` also lists `evaluation: [36]`.
