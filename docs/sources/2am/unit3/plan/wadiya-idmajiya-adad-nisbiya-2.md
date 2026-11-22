# Plan — `wadiya-idmajiya-adad-nisbiya-2` « أدمج تعلّماتي — الأعداد النسبية » (2AM unit 3, synthesis — pair 5)

Read the unit [`README.md`](README.md) first. The six lessons of the unit (`muqarana-nisbiya` + the five entries) are published before
this synthesis. Shape: the 2AM unit-2 synthesis (`docs/sources/2am/unit2/plan/wadiya-idmajiya-kusur-amaliyat.md` and its « Generator
notes »), itself the 3AM / 4AM synthesis shape.

## 1. Identity

- **Code** `wadiya-idmajiya-adad-nisbiya-2` · **title** « أدمج تعلّماتي — الأعداد النسبية » · unit `adad-nisbiya-2` · catalogue order 17 ·
  `kind: synthesis` · `prerequisiteLessonCodes`: the six lessons (already in the catalogue).
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/wadiya-idmajiya-adad-nisbiya-2/`, module files
  `Module00Astaidd.jsx`, `Module01Wadiya1.jsx` … `Module06Wadiya6.jsx`, `Module07TahlilWadiya.jsx`, `Module08Ahill.jsx` (every declared module
  needs its route: `registry.test.js`).
- **Textbook** (PDF = book − 3): « أدمج تعلّماتي » p. 52 (PDF 49): `integration` (a family's September budget sheet in a spreadsheet:
  expenses and incomes) and `evaluation` (« وضعية للتقويم »: time differences between world cities, found on the internet); `challenge`
  p. 38 (unit page + here, redesigned).
- **Seeds the unit: no.** After this entry `check:textbook` must show NO pending element in the unit.
- **Shape:** 00 أستعدّ · 01–06 « الوضعية التدريبية 1…6 » (`track: 'problem'`, `practice_lab`) · 07 « تحليل الوضعية النهائية للاختبار » ·
  08 « وضعية الاختبار النهائي ». `durationMinutes` 30 (validate:lessons computes modules 0 + 7 + 8); `difficulty` « متقدم »; icon 🧩. No lab.
  `objectives` only on the `ContentModule` (module 7), the other modules carry their goal in `desc` (unit-2 synthesis generator note).

## 2. Programme & net

- `programmeItems: []` (catalogue). One LP (the published syntheses' decision): **P1** « حلّ وضعية إدماجية بتوظيف الأعداد النسبية: التعليم
  على مستقيم مدرّج وفي معلم، المقارنة والترتيب، الجمع والطرح والمجموع الجبري، والمسافة بين نقطتين » → `2am_wadiya-idmajiya-adad-nisbiya-2_P1`.
- `pointPrerequisites` (the unit's own lessons, all published):
  - P1 ← `2am_talim-mustaqim-mudarraj-2_P2`;
  - P1 ← `2am_muqarana-nisbiya_P3`;
  - P1 ← `2am_talim-nuqta-mustawi_P3`;
  - P1 ← `2am_jam-tarh-nisbiya_P3`;
  - P1 ← `2am_majmu-jabri_P2`;
  - P1 ← `2am_masafa-nuqtatayn_P1`.
- `reviewLinksForLesson` is empty; « أستعدّ » measures one key الكفاءة of each lesson and its advice names the six lessons. noRebuild:
  nothing is taught.

## 3. Boundary

No new notion. Every question uses only: abscissae (any graduation, origin choice), coordinates (axes, regions, symmetric about an
axis), comparison and order, sums and differences of two relatives, algebraic sums (brackets first), distances on a line (and the
midpoint as half the distance). **Never:** a product or a quotient of relatives (3AM), an equation (unit 4 `mafhum-muadala`), central
symmetry as a property (book unit 8), the nature of a quadrilateral proved (2am.m5). Amounts of money are sums of incomes and expenses
— no loan, no interest, no debt that grows.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `integration` | a family's September sheet (date, operation, expenses, incomes) typed in a spreadsheet; totals; « what do you conclude? » | incomes positive, expenses negative, a balance | **Training situation 1, redesigned**: a month's budget week by week, written as algebraic sums (own amounts, no spreadsheet) |
| `evaluation` | look up time differences on the internet; the time in Tokyo, Washington, Beirut, Cairo, London, South Africa at 12h in Algiers | offsets as relative numbers | **Training situation 2, redesigned**: the platform GIVES the winter offsets (no internet), order, sums, a gap |
| `challenge` | the Great Lakes' depths from the surface and bottom altitudes | depth = surface − bottom | **Training situation 3, redesigned** with Algerian altitudes (README تحدّ) |
| exam situations | a wall's corners in a frame (`2am-s2-62`), a classroom's floor in a frame (`2am-s2-71`) | a frame, lengths by subtraction, an area, a cost | **Training situation 4** (own classroom) |

## 5. Modules (9)

**00 أستعدّ** — `desc`: « أتحقّق من أنّي أعلّم وأقارن وأجمع وأطرح وأحسب المسافة قبل الوضعيات ». Six statements:

| # | Statement | Key | Lesson |
|---|---|---|---|
| 1 | « على مستقيم تدريجته $5$ ، النقطة على التدريجة الرابعة يسار المبدأ فاصلتها $-20$ » | ✓ | talim-mustaqim-mudarraj-2 |
| 2 | $-3{,}5<-3{,}05$ | ✓ | muqarana-nisbiya |
| 3 | « النقطة $(-2\,;0)$ على محور التراتيب » | ✗ (axis of abscissae) | talim-nuqta-mustawi |
| 4 | $(-6)+(+2{,}5)=(-3{,}5)$ | ✓ | jam-tarh-nisbiya |
| 5 | $-7+3-5+9=0$ | ✓ | majmu-jabri |
| 6 | « المسافة بين $A(-3)$ و $B(+4)$ هي $1$ » | ✗ ($7$) | masafa-nuqtatayn |

**01 الوضعية التدريبية 1 — ميزانية الأسرة في شهر** (`integration` redesigned)
- Goal: « أكتب حصيلة كلّ أسبوع بمجموع جبري وأقارن الأسابيع وأحكم على الشهر ». Mobilises majmu P1–P3, muqarana P3, masafa P1.
- Context (table): « مداخيل (+) ومصاريف (−) أسرة خلال شهر، بالدينار:
  الأسبوع 1: الأجرة $+56000$ ، المشتريات $-12500$ ، فاتورة الكهرباء $-3200$ ؛ الأسبوع 2: المشتريات $-11800$ ، الأدوات المدرسية $-4600$ ؛
  الأسبوع 3: بيع خبز الدار $+6500$ ، المشتريات $-13200$ ؛ الأسبوع 4: المشتريات $-12900$ ، هدية للجدّة $-2400$ . »
- Q/A: 1) حصيلة كلّ أسبوع → $+40300$ ، $-16400$ ، $-6700$ ، $-15300$ ; 2) رتّب الحصائل تصاعديًا → $-16400<-15300<-6700<+40300$ ;
  3) حصيلة الشهر → $+1900$ DA (positives $40300$, negatives $38400$) ; 4) « هل ادّخرت الأسرة؟ » → نعم، $1900$ DA ; 5) « الفرق بين حصيلتي
  الأسبوعين 3 و 2 » → $(-6700)-(-16400)=9700$ DA.

**02 الوضعية التدريبية 2 — فارق التوقيت** (`evaluation` redesigned)
- Goal: « أقرأ فروق التوقيت أعدادًا نسبية وأحسب بها الساعة والفرق بين مدينتين ». Mobilises talim P2–P3, muqarana P3, jam-tarh P1–P3,
  masafa P1.
- Context: « في فصل الشتاء، تتقدّم الساعة أو تتأخّر عن توقيت لندن (الصفر) بـ: الجزائر $+1$ ، القاهرة $+2$ ، بيروت $+2$ ، جوهانسبورغ $+2$ ،
  طوكيو $+9$ ، واشنطن $-5$ . »
- Q/A: 1) ضعها على مستقيم مدرّج (تدريجة مناسبة) → graduation 1 or 2 (from −5 to +9) ; 2) رتّبها تنازليًا → $+9>+2=+2=+2>+1>0>-5$ ;
  3) « الساعة $12$ في الجزائر: كم الساعة في كلّ مدينة؟ » → Tokyo 20h ($12+(+9)-(+1)$), Washington 6h ($12+(-5)-(+1)$), Cairo / Beirut /
  Johannesburg 13h, London 11h ; 4) الفارق بين طوكيو وواشنطن → $(+9)-(-5)=14$ h ; 5) « اتّصال في الساعة 20 بتوقيت طوكيو: كم الساعة في
  واشنطن؟ » → 6h.

**03 الوضعية التدريبية 3 — بين شطّ ملغيغ وقمّة تاهات** (`challenge` redesigned)
- Goal: « أحسب فروق ارتفاعات موجبة وسالبة ». Mobilises jam-tarh P3, masafa P1, muqarana P3.
- Context: README تحدّ (Chott Melghir ≈ $-40$ m, Tahat ≈ $+2908$ m, a plane at $+3500$ m, a well $160$ m deep near the chott).
- Q/A: 1) فرق الارتفاع بين القمّة والشطّ → $2948$ m ; 2) علوّ الطائرة فوق كلّ منهما → $592$ m ، $3540$ m ; 3) ارتفاع قاع البئر →
  $-40-160=-200$ m ; 4) رتّب تصاعديًا: قاع البئر، الشطّ، مستوى البحر، القمّة، الطائرة → $-200<-40<0<2908<3500$.

**04 الوضعية التدريبية 4 — تبليط قاعة القسم** (register of `2am-s2-71` / `-62`, own numbers)
- Goal: « أعلّم رؤوس شكل في معلم وأحسب أطواله بطرح الفواصل أو التراتيب ». Mobilises talim-nuqta P2–P3, masafa P1.
- Context: « مخطّط أرضية قسم في معلم متعامد ومتجانس (الوحدة $1$ m): $E(-3\,;2)$ ، $F(4\,;2)$ ، $G(4\,;-3)$ . »
- Q/A: 1) $H$ ليكون $EFGH$ مستطيلًا → $H(-3\,;-3)$ ; 2) $EF$ و $FG$ → $4-(-3)=7$ m ، $2-(-3)=5$ m (lengths along lines parallel to an axis:
  the distance of two abscissae / ordinates) ; 3) المساحة → $35$ m² ; 4) « بلاطة مساحتها $0{,}25$ m² ثمنها $180$ DA: عدد البلاطات والتكلفة » →
  $140$ ، $25200$ DA ; 5) « مكتب المعلّم عند $(3{,}5\,;-2{,}5)$ : هل هو داخل القسم؟ » → نعم.

**05 الوضعية التدريبية 5 — مصعد البرج**
- Goal: « أتتبّع رحلة بمجموع جبري وأجد أعلى وأدنى طابق والفرق بينهما ». Mobilises majmu P2, muqarana P3, masafa P1.
- Context: « ركب سمير المصعد من الطابق $-2$ ، ثم تحرّك: $+9$ ، $-4$ ، $+6$ ، $-12$ ، $+3$ . »
- Q/A: 1) المجموع الجبري وطابق الوصول → $(-2)+(+9)+(-4)+(+6)+(-12)+(+3)=0$ (الطابق الأرضي) ; 2) الطوابق التي مرّ بها → $7$ ، $3$ ، $9$ ،
  $-3$ ، $0$ ; 3) أعلى وأدنى طابق → $9$ و $-3$ ; 4) الفرق بينهما → $12$ طابقًا.

**06 الوضعية التدريبية 6 — ورقة إجابات سليم** (judge a classmate)
- Goal: « أحكم على إجابات زميل وأصحّح الخاطئ منها مع التعليل ». Mobilises all six lessons.
- Five answers (صحيح / خطأ, then the corrected value):
  - a) $(-5)+(-3)=(+8)$ → خطأ, $(-8)$ (`MISC-JAMNISB-SIGNLOST`);
  - b) $(-4)-(-9)=(+5)$ → صحيح;
  - c) « $-2{,}7>-2{,}07$ » → خطأ (the muqarana lesson's misconception id for « more digits, larger »: look it up in `misconceptions.json`);
  - d) « المسافة بين $A(-6)$ و $B(-1)$ هي $7$ » → خطأ, $5$ (`MISC-MASAFA2-ADDSAME`);
  - e) « نظيرة $M(-3\,;2)$ بالنسبة إلى محور الفواصل هي $(-3\,;-2)$ » → صحيح.
- « ما نقطة سليم من 5؟ » → **2**.

**07 تحليل الوضعية النهائية للاختبار — مخيّم شتوي في الجلفة** (analysed, NOT solved)
- `objectives`: « أقرأ الوضعية النهائية وأفرز معطياتها وأختار الحسابات وترتيبها قبل أن أحلّها ».
- Situation text (it carries every datum module 8 needs): « خلال مخيّم شتوي في الجلفة سجّل التلاميذ درجات الحرارة (°C) خمسة أيام:
  الصغرى: $-3$ ، $-5{,}5$ ، $+1$ ، $-0{,}5$ ، $-2$ ؛ الكبرى: $+6$ ، $+4{,}5$ ، $+9$ ، $+7{,}5$ ، $+5$ . ثم مثّلوا كلّ يوم بنقطة (رقم اليوم ؛ الصغرى)
  في معلم متعامد ومتجانس. »
- Stages (unit-2 synthesis pattern):
  1. **Sort the data**: minima vs maxima; « day » vs « temperature »; which data each question needs.
  2. **Choose the operations** (one-of-four `TapQuestion`s — no new component): the coldest night = an order; the range of a day = a
     distance (larger − smaller); the change from one day to the next = new − old; the total of the changes = an algebraic sum; the point
     of a day = (day ; minimum).
  3. **The traps**: « change = old − new » (counter-check: the minimum ROSE from day 2 to day 3, the change must be positive); « range of
     day 2 = 5,5 − 4,5 » (counter-check: the two readings are on both sides of zero, the gap crosses zero); « the total of the changes »
     equals last − first ($(-2)-(-3)=+1$): a check, not a new rule.

**08 وضعية الاختبار النهائي** — `desc`: « أحلّ وضعية المخيّم الشتوي ». Five evaluated stages (the final test):

| Stage | Question | Key | Distractors (misconception) |
|---|---|---|---|
| E1 | رتّب الصغرى تصاعديًا | $-5{,}5<-3<-2<-0{,}5<+1$ | $-0{,}5<-2<-3<-5{,}5<+1$ (ordered by distance: the muqarana lesson's id) · $+1<-0{,}5<-2<-3<-5{,}5$ (descending) · $-2<-3<-0{,}5<-5{,}5<+1$ |
| E2 | الفارق بين الكبرى والصغرى في اليوم 2 | $4{,}5-(-5{,}5)=10$ | $1$ (`MASAFA2-SUBDIST`) · $-10$ (`MASAFA2-NEGDIST`) · $-1$ |
| E3 | تغيّر الصغرى من اليوم 2 إلى اليوم 3 | $(+1)-(-5{,}5)=+6{,}5$ | $-6{,}5$ (`JAMNISB-REVERSED`) · $-4{,}5$ (`JAMNISB-SUBNOFLIP`) · $+4{,}5$ |
| E4 | مجموع تغيّرات الصغرى من اليوم 1 إلى اليوم 5: $(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)$ | $+1$ | $-1$ · $-12$ (`JABRI-ALLNEG`) · $+12$ |
| E5 | إحداثيا نقطة اليوم 4 وموضعها | $(4\,;-0{,}5)$ ، تحت محور الفواصل | $(-0{,}5\,;4)$ (`NUQTA2-SWAP`) · $(4\,;0{,}5)$ (`NUQTA2-SIGNAXIS`) · $(-4\,;-0{,}5)$ |

Changes: $(-5{,}5)-(-3)=-2{,}5$ ; $(+1)-(-5{,}5)=+6{,}5$ ; $(-0{,}5)-(+1)=-1{,}5$ ; $(-2)-(-0{,}5)=-1{,}5$ ; total $+1=(-2)-(-3)$.
New synthesis ids only where no lesson id fits: `MISC-SYN-NISB2-OLDMINUSNEW` (a change computed old − new; if `JAMNISB-REVERSED` covers it,
use that), `MISC-SYN-NISB2-SUMCHANGES` (the total of the changes believed unrelated to last − first).

## 6. Practice bank — `content/practice/2am/wadiya-idmajiya-adad-nisbiya-2/` (5 × 10)

**Corpus (integration situations of term 2 whose relative-number parts belong to this unit):**
- read: `2am-s2-62` « الوضعية الإدماجية » part 1 (a wall's corners L(0 ; 4), M(−4 ; 0) in a frame; N, P symmetric of L, M about O — central
  symmetry `counted: false` or GIVEN; LMNP is a square; 32 m² and the painting cost — the cost is a 2am.m1 chain `counted: false`);
- to read: `2am-s2-71` ex 5 (a classroom floor in a frame, distances, area, tiling cost — no text layer), `2am-s1-66` ex 5 (classes'
  positions in a frame, symmetric about the origin, fractions of sport players — poor layer; the fraction part is unit 2: `counted: false`),
  the eleven unindexed term-2 papers (README) for a situation with temperatures or altitudes.
- the other term-2 situations are « بدلالة x » plans (unit 4 `mafhum-muadala`): not used.

**Honest FAITHFUL count: 1 read today; 3–4 expected.** Most sheets are `term_exam_modelled` (« exercise 1 » of a term-2 paper always
mixes an algebraic sum, a graduated line and distances: that register is the synthesis' L1–L3).

| Level | Content | Provenance |
|---|---|---|
| L1 | one short item per lesson (abscissa, comparison, coordinates, sum / difference, algebraic sum, distance) | 10 modelled (`2am-s2`) |
| L2 | « exercise 1 » of a term-2 paper: an algebraic sum, then points on a line, distances, a midpoint, « برّر » | 10 modelled |
| L3 | temperatures / altitudes / time offsets: order, changes, ranges, a decision | 10 modelled (+ 1 term_exam if an unindexed paper is read) |
| L4 | figures in a frame: complete a rectangle, lengths along the axes by subtraction, an area | 1 term_exam (`-62` situation part 1) · 1 after reading (`-71` ex 5) · 8 modelled |
| L5 | « الوضعية الإدماجية (08 ن) », two parts, a justified decision (savings? which city? enough tiles?) | 1 after reading (`2am-s1-66` ex 5, term 1) · 9 modelled |

**Badges:** « على منوال اختبار الفصل الثاني » (the `2am-s1-66` sheet: « … الأول »). Modelled sheets: `platform_addition`,
`reason: "term_exam_modelled"`, `modelledOn: "2am-s2"`. **Answer types:** `decimal`, `choice`, `selfCheck`, point pairs as two
`decimal` fields. Every question's primary LP: the synthesis P1 or the lesson LP it mobilises (follow the unit-2 synthesis bank).
**Oracle:** `scripts/practice-oracle/wadiya-idmajiya-adad-nisbiya-2.mjs` — imports the six lessons' oracle helpers if they export them
(otherwise its own BigInt code, as the unit-2 synthesis did), recomputes every key from the statement's numbers.

## 7. Risks & owner questions

1. **One LP with `programmeItems: []`** — README Q8.
2. **The challenge redesign and its facts** (README Q1, Q7): Tahat ≈ 2908 m, Chott Melghir ≈ −40 m, said « حوالي ».
3. **Time offsets** are given for WINTER (Cairo and Washington change in summer; Algiers does not). Confirm the wording « في فصل الشتاء ».
4. **The budget** has no loan and no interest; « هدية للجدّة » and « بيع خبز الدار » are family values, not occasions.

## 8. Generator checklist

- [ ] `build-extraction.py`: `integration` → module 1; `evaluation` → module 2; `challenge` → module 3 (and the `unit` page via
  `duplicatedIn`, as the unit-2 synthesis did); all `verified: True` after re-reading PDF pp. 35 and 49 at 150–200 dpi; record the
  `evaluation` (internet, DST) and `integration` (spreadsheet, cut amounts) discrepancies; `check:textbook` green with NO pending element in
  the unit.
- [ ] Lesson folder: nine module files; `content/problems.js` + `problems.test.js` (every answer recomputed with BigInt hundredths; every
  distractor false or equal to its named error); `content/textbook.js`; progressive knowledge map; `objectives` on module 7.
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json` (`MISC-SYN-NISB2-*` only if needed).
- [ ] `validate:lessons`, `generate:lesson-index`, `generate:learning-net`, `check:lessons`, `npm test`, `build`; e2e: extend
  `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2.mjs` with the synthesis (module routes mount, module 8 evaluates).
- [ ] Publish (guide §11): `pointsToLearn` (P1), `pointPrerequisites`, `durationMinutes` 30, `difficulty`, `icon`, status `available`;
  export/import; local DB publish (lesson, 9 modules, 50 exercises — nothing `draft`); commit `feat(lessons): wadiya-idmajiya-adad-nisbiya-2`;
  progress report « 2AM unit 3 complete ».

## 9. Successor connection

None: a synthesis has no programme item and no net link.

## Generator notes (2026-10-30, pair 5, lane A)

Generated INTO its catalogue entry (`status: available`, `durationMinutes: 30`, `difficulty: متقدم`, icon 🧩), folder `adad-nisbiya-2/wadiya-idmajiya-adad-nisbiya-2/` (nine modules, `content/{textbook,problems}.js` + tests, `knowledge*.js(x)`), bank `content/practice/2am/wadiya-idmajiya-adad-nisbiya-2/` (5 × 10), oracle `scripts/practice-oracle/wadiya-idmajiya-adad-nisbiya-2.mjs`, e2e `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-wadiya-idmajiya-adad-nisbiya-2.mjs`. Fixes and decisions against the plan:

1. **`pointPrerequisites` P1** = the six lessons' LPs exactly as §2 lists them (`talim-mustaqim-mudarraj-2_P2`, `muqarana-nisbiya_P3`, `talim-nuqta-mustawi_P3`, `jam-tarh-nisbiya_P3`, `majmu-jabri_P2`, `masafa-nuqtatayn_P1`); all exist in the catalogue (`content.test.js` checks it) and `decomposition.test.js` passes. The same six LPs' key ideas are the « أستعدّ » prerequisites (`priorKnowledge`: `faasila`, `salibayn`, `nuqta-ala-mihwar`, `jam-ishara-mukhtalifa`, `qaidat-majmu-jabri`, `qaidat-masafa`).
2. **The unit's تحدّي** is `units_2am_2026_2027.json › units[adad-nisbiya-2].challenge.textAr` (the plan said `challengeAr`; that name is the textbook map's). Both `challenge.textAr` and `docs/sources/2am/textbook-map.json › challengeAr` now carry the Chott Melghir / Tahat version (« حوالي ») ; `sourceElementId: "challenge"` and the card's other fields are untouched.
3. **Extraction**: `integration` → module 1, `evaluation` → module 2, `challenge` → module 3 with `duplicatedIn: unit page`; the three elements were re-read at 170 dpi (pdf pp. 35 and 49): `verified: True`, with new discrepancy entries — the family sheet starts from 8000 DA and its « 80 » is 980 (water), the final balance is dated 30/9/2016 (typo), the Huron bottom is −53 m (not −63), the Great Lakes left half is cut by the binding. `check:textbook` shows NO pending element in the unit.
4. **No « هل تعلم » in module 0**: the unit's `opener` is destined to `muqarana-nisbiya` (undeclared duplication otherwise), so module 0 is the six statements + live recall links to the six lessons only.
5. **Training situation 2, part 1**: only the graduation `1` fits the seven offsets (`+1` and `-5` fall between graduations of `2`, `0,1` needs 90 graduations): the two distractors are those two readings. The offsets are the plan's (Algiers `+1`, Cairo / Beirut / Johannesburg `+2`, Tokyo `+9`, Washington `-5`, London `0`) and the time questions are `12 + [(+9) - (+1)] = 20`, `12 + [(-5) - (+1)] = 6`, `13`.
6. **Training situation 1** is split into four parts (week balances `+40300`, `-16400`, `-6700`, `-15300`; their order; the month `+1900` and « did the family save? »; `(-6700) - (-16400) = +9700`).
7. **Module 7 counter-checks use GENERIC numbers** (a temperature from `-4` to `+2`; a day with min `-2` and max `+3`; changes `+3, +3` summing to `+6`) so that no value of the final solution (`-5,5 < -3 < -2 < -0,5 < +1`, `10`, `+6,5`, `+1`, `(4 ; -0,5)`) is shown before module 8 (`content.test.js` greps the module 7 source and the situation for them). The three traps of §5 are the two counter-checks (« old − new » gives a negative change after a rise; a range that crosses zero is a SUM of distances) and, as a stage-4 question, the algebraic sum of the changes with « last − first » as a check, never a new rule.
8. **Module 8 distractors** follow §5 exactly, plus the third distractor of E1 (`-2 < -3 < -0,5 < -5,5 < +1`, a plain permutation) and `+4,5` for E3 (distances subtracted); `MISC-SYN-NISB2-*` was NOT needed (every wrong option is an error of a lesson of the unit: BDG, OD, SUBDIST, NEGDIST, REVERSED, SUBNOFLIP, ALLNEG, SWAP, SIGNAXIS, SIGNLEFT).
9. **`requires`** in modules 7–8 are limited to the six `priorKnowledge` ids: the knowledge gate refuses a `requires` that is neither a brick of the lesson nor declared prior knowledge (`E_REQUIRES_NOT_ESTABLISHED`).
10. **Bank**: 216 questions on the synthesis P1 only; **2 `term_exam`** (not 3–4): `2am-s2-62` ex 5 (rendered text layer, wall corners L(0 ; 4), M(−4 ; 0) — the central symmetry of N, P is replaced by the symmetric about an AXIS, the nature of LMNP is not asked) and `2am-s2-71` ex 5 (rendered scan, classroom floor, distances, area, tiling cost), numbers changed; `2am-s1-66` ex 5 was not read so it is not cited; 48 `term_exam_modelled` (`modelledOn: 2am-s2`). Area / total price steps are `counted: false` (18). No new misconception id.
