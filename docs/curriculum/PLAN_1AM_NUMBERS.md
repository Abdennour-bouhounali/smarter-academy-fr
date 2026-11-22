# Generation plan — 1AM « ميدان الأنشطة العددية » (units 1–6), the 20 remaining entries (2026-10-30)

**Status:** planned 2026-10-30; generation in progress (entries 1–6 done). **Who reads this:** the generating session (Sonnet), one entry at a time.
**Authority:** this file sets the order, the lanes, each entry's design card, the generator prompt and the « successor connection »
step. The contracts stay authoritative for HOW a lesson is built:
- `LESSON_DEVELOPMENT_GUIDE.md` §14;
- `LEARNING_NET.md` §3bis and §4;
- `MANIPULATION_DNA.md` §17;
- `MANIPULATION_CONTRACT.md` §8ter–§8quinquies;
- `EXERCISE_CONTRACT.md`.

The method is the one used for `PLAN_2AM_M1.md`, `PLAN_2AM_M4.md` and `PLAN_3AM_UNITS_1_5.md`. One difference: there are no per-lesson
plan files. Each entry has a **design card** below, and the lead fills its open numbers (step 0 of the prompt).

## Where the domain stands

The programme domain `ansab_al_aadad_wal_hisab` « ميدان الأنشطة العددية » has 6 textbook units and 28 catalogue entries. **8 are
published**:
- `kitabat-adad-tabii`, `kusur-ashriya-kitaba`, `muqaranat-adad-ashriya` (unit 1);
- `mana-jam-tarh` (unit 2);
- `qisma-iqlidiya-baqi`, `qawaid-qabiliyat-qisma` (unit 3);
- `hasil-qisma-kasr`, `ikhtizal-kitaba-kasriya` (unit 4).

**20 remain `coming_soon`**: 14 lessons and 6 syntheses.

| Unit | Folder (`lessons/moyen/1am/ansab_al_aadad_wal_hisab/…`) | Book pp. | `_unit/` + extraction | Remaining |
|---:|---|---|---|---|
| 1 | `adad-tabiiya-ashriya/` | 7–22 | exist (`docs/sources/1am/unit1/`, 72 el.) | `adad-ashri-mustaqim-mudarraj`, `hasr-qiyam-muqarraba`, synthesis |
| 2 | `jam-tarh-ashriya/` | 23–34 | exist (`unit2/`, 56 el.) | `injaz-jam-tarh-mudad`, `rutbat-miqdar-jam`, synthesis |
| 3 | `darb-qisma-ashriya/` | 35–50 | exist (`unit3/`, 75 el.) | `darb-adad-ashriya`, `qisma-ashriya-taqrib`, synthesis |
| 4 | `kitabat-kasriya/` | 51–62 | exist (`unit4/`, 63 el.) | `hasil-qisma-mustaqim`, `akhdh-kasr-min-adad`, synthesis |
| 5 | `adad-nisbiya/` | 63–76 | **to seed** | `adad-nisbiya-siyaqat`, `talim-mustaqim-mudarraj`, `talim-fi-mustawi`, synthesis |
| 6 | `ibarat-harfiya/` | 77–88 | **to seed** | `bahth-adad-naqisa`, `tatbiq-qaida-harfiya`, `intaj-ibara-harfiya`, synthesis |

Notes on the sources:
- The textbook is `docs/official-book-pdfs/كتاب الرياضيات للسنة الأولى متوسط الجيل الثاني.pdf`. It has no text layer: render the pages
  with `pdftoppm -r 110` (zones at 180–200 dpi). For printed pages 1–150, PDF page = printed page (`docs/sources/1am/textbook-map.json`).
- Units 1–4 already map every element to its lesson and module in `extraction.json › destinations`. A remaining lesson takes the
  elements addressed to its code; move them out of « pending » in `build-extraction.py`.
- The term-exam corpus is `docs/Exames-1 AM to 3AM/1am/SEMESTER {1,2,3}/`, indexed in `docs/sources/moyen/exams/exams-index.json`
  (pattern: `EXAM_PATTERN.md` §3 « 1AM »). By term:
  - S1 holds m1: the decimals, ×/÷ 10…, ordering, order of magnitude.
  - S2 holds m3 and m5 fractions: decimal division with a table of approximations, a fraction on a half-line, « أكمل a × … = b ».
  - S3 holds m5 relatives and the frame.
- Well covered (≥ 10 exercises): `1am.m1.r02/r03/r05` and `1am.m5.r01/r10`. Thin: m3 (24 exercises in all) and m5.r05–r09. Expect
  more `term_exam_modelled` sheets there.

## Order and lanes

The order follows the queue (`GENERATION_QUEUE.md`). Phase A comes first: 4AM needs `jidhr-tarbii`, `muadala-ula` and
`tanasub-muamil`, which pull in units 5–6 and `adad-ashri-mustaqim-mudarraj`. The order also follows the net's `requires` links.

| Pair | Lane A — port 5173 | Lane B — port 5174 |
|---:|---|---|
| 1 | `adad-ashri-mustaqim-mudarraj` (U1, r04) | `adad-nisbiya-siyaqat` (U5, r05; **seeds unit 5**) |
| 2 | `talim-mustaqim-mudarraj` (U5, r05 r06; needs both of pair 1) | `bahth-adad-naqisa` (U6, r10; **seeds unit 6**) |
| 3 | `talim-fi-mustawi` (U5, r07) | `tatbiq-qaida-harfiya` (U6, r08) |
| 4 | `wadiya-idmajiya-adad-nisbiya` (U5 synthesis) | `intaj-ibara-harfiya` (U6, r09; needs r08) |
| 5 | `hasr-qiyam-muqarraba` (U1, r04 r05) | `wadiya-idmajiya-ibarat-harfiya` (U6 synthesis) |
| 6 | `wadiya-idmajiya-adad-tabiiya-ashriya` (U1 synthesis) | `injaz-jam-tarh-mudad` (U2, r01 r05) |
| 7 | `rutbat-miqdar-jam` (U2, r06) | `qisma-ashriya-taqrib` (U3, r03 r04 r05) |
| 8 | `wadiya-idmajiya-jam-tarh-ashriya` (U2 synthesis) | `darb-adad-ashriya` (U3, r01 r03 r05 r06) |
| 9 | `hasil-qisma-mustaqim` (U4, r04 r01) | `wadiya-idmajiya-darb-qisma-ashriya` (U3 synthesis) |
| 10 | `akhdh-kasr-min-adad` (U4, r01 r03; needs `darb` for decimal products) | — |
| 11 | `wadiya-idmajiya-kitabat-kasriya` (U4 synthesis) | — |

Rules of the run:
- **One session = one lane.** If only one session runs, take the entries in this order: pair 1 A, 1 B, 2 A, 2 B, …
- Within a lane, entries are strictly sequential. A pair is published before the next pair starts.
- A synthesis starts only after every lesson of its unit is published.
- The catalogue order (what the student sees) never changes. Only the generation order differs from the book.
- **Forward references** (a lesson uses an item taught later in the year): the lesson recalls the item in a « تذكّر » box and never
  builds it. These are:
  - `hasr-qiyam-muqarraba` needs decimal division (`1am.m3.r03`, taught by `qisma-ashriya-taqrib`, pair 7);
  - `tatbiq-qaida-harfiya` needs the rectangle's perimeter and area (`1am.m2.r08`, taught by `mustatil-murabba-masaha`, geometry,
    not yet generated);
  - `adad-ashri-mustaqim-mudarraj` is listed in the queue as using ordering (`1am.m1.r04`), which is already published, so no box is
    needed.

## Lab distinctness (checked 2026-10-30 against `manipulationRegistry.js`; all 14 names are free)

| Lesson | Lab (new type) | What the hand holds | Gesture · drawn world |
|---|---|---|---|
| `adad-ashri-mustaqim-mudarraj` | `jump-tape` « شريط القفز » | the UNIT LENGTH, then a flag's position | stretch the « 1 » mark; drag flags · sports-day long-jump pit with a measuring tape |
| `hasr-qiyam-muqarraba` | `bus-stations` « محطّات الحافلة » | the TWO BOUNDS around a number | plant two stop signs on posts · a road with km posts, lamp posts every 0,1 km |
| `injaz-jam-tarh-mudad` | `column-slider` « مسطرة الأعمدة » | the HORIZONTAL OFFSET of each number strip | slide strips under a fixed rank grid · a shop's order slips |
| `rutbat-miqdar-jam` | `market-estimate` « تقدير السلّة » | the ROUND VALUE chosen for each price | snap price tags to a nearby round value · a weekly market basket and a cashier's receipt |
| `darb-adad-ashriya` | `carpet-grid` « زربية الخلايا » | the TWO DIMENSIONS of a rectangle on a 0,1 m grid | drag the corner, cells of 0,01 m² counted · a carpet workshop |
| `qisma-ashriya-taqrib` | `olive-press` « معصرة الزيتون » | WHEN to convert the remainder to the next unit (L → dL → cL) and when to stop | pour into jars; « break » the remainder · an olive press sharing oil between families |
| `hasil-qisma-mustaqim` | `ribbon-marks` « علامات الشريط » | b, the NUMBER OF PARTS per unit, then a step count | drag a divider handle; step part by part or jump whole units · a tailor's ribbon on a rod |
| `akhdh-kasr-min-adad` | `date-crates` « صناديق التمر » | the SPLIT into b crates and the a crates taken | drag dividers into a heap; tap crates · a date harvest |
| `adad-nisbiya-siyaqat` | `frost-gauge` « ميزان الصقيع » | the TEMPERATURE (sign + distance to 0) | drag the liquid level; the mirror « opposite » · a week of winter in Djelfa |
| `talim-mustaqim-mudarraj` | `stride-stamp` « خطوة الطابع » | the UNIT STRIDE carried on BOTH sides of O | stamp a unit stick from O east and west · a village road, bus stop as origin |
| `talim-fi-mustawi` | `courtyard-drone` « مسيّرة الساحة » | x, THEN y (one axis at a time) | drive along the abscissa axis, then the ordinate axis · a drone over the school courtyard plan |
| `bahth-adad-naqisa` | `rewind-belt` « الحزام المعاكس » | the INVERSE OPERATION card and the found number | run an operation conveyor backward, then forward to check · a packing workshop |
| `tatbiq-qaida-harfiya` | `letter-dial` « قرص الحروف » | the VALUE of each letter | turn a number dial; the value drops into every letter slot · a stationery shop's price rule, a fence rule |
| `intaj-ibara-harfiya` | `rod-train` « قطار العيدان » | the RODS (x-rods and number rods) put on a track | drag rods onto a track; the expression builds itself · a carpenter's rods |

Before writing each lab, the lead re-checks the name in the registry and reads the nearest existing lab's § in
`MANIPULATION_CONTRACT.md`, so the gesture stays distinct:
- `corniche-ruler` and `dig-grid`: the 2AM consolidation of r06/r07;
- `story-bars`: 1AM, stretches an unknown bar;
- `decimal-comma` and `rank-exchange`: 1AM unit 1;
- `fair-share` and `fraction-knife`: 1AM unit 4;
- `tile-yard`: 1AM rectangle area;
- `wax-cells`, `juice-line`, `bridge-load`: 2AM literal calculus;
- `zero-probe` and `elevator-reel`: relatives.

An earlier year never reuses a later year's lab (the net's no-rebuild rule), and no two labs share a gesture.

## Design cards

Conventions:
- **Modules of a lesson**, as in the published 1AM lessons: 00 أستعدّ · 01 نشاط (the lab at the top, nothing above it) · 02 معارف ·
  03 طريقة (when the book has one) · 04 أتمرّن · 05–07 three مسائل · 08 إختبار أولي. Every `ContentModule` has `objectives`.
- **الكفاءات**: the draft `pointsToLearn` are kept in order. The lead may make an item explicit (as earlier leads did), with each
  الكفاءة ≤ 200 characters. Record every change in the progress report.
- **LP edges** (`pointPrerequisites`) only along a net link, and only toward a published lesson. Read the target P numbers in that
  lesson's `lesson.config.js` before writing them.
- **Contexts** are the platform's own: Algerian, everyday, Islam-respecting. Never the book's story, and never a line pointing to
  the book.

### 1. `adad-ashri-mustaqim-mudarraj` — الأعداد العشرية ونصف المستقيم المدرّج (U1, r04) · pair 1 A

- **Elements:** `act-4` → module 1 (as a later application, not the entry point); `know-5` → 2; `ex-15`, `ex-16` → 4; `self-7`.
- **Entry (lab `jump-tape`):** a school sports day; three long jumps of 2,4 m · 3,1 m · 1,8 m must be flagged on the pit's tape. The
  tape shows only O and nothing else.
  - Step 1: the hand stretches the « 1 » mark (the unit length) until the longest jump fits the pit, then the tape draws ten small
    ticks per unit.
  - Step 2: the hand drags each flag; the abscissa reads live. A wrong « 2,4 » placed at 2 + 4 small ticks of a wrong unit is shown
    off the mark.
  - Level 2: read three flags already planted; one sits between two ticks (bounds).
- **Questions over the lab:**
  - « كم تدريجة صغيرة في الوحدة؟ ماذا يمثّل التباعد بينها؟ » (answer 1/10 = 0,1);
  - « ما فاصلة العلم الأزرق؟ »
- **Named afterwards:** half-line, origin, unit, abscissa, O(0), A(2,4); « في حالات معيّنة لا يظهر المبدأ ».
- **الكفاءات:** keep P1–P3. P2 = read exactly OR by bounds.
- **أستعدّ:** measures `1am.m1.r04` (ordering, published) and `1am.m1.r02`.
- **LP edges:** P2, P3 ← `1am_muqaranat-adad-ashriya_P1` (net `1am.m1.r04 → 1am.m5.r04`).
- **Bank:** S1/S2 papers with a half-line.
- **Successor connection:** none outside 1AM. `talim-mustaqim-mudarraj` (pair 2) and `hasil-qisma-mustaqim` (pair 9) write their own
  edges toward this lesson.

### 2. `adad-nisbiya-siyaqat` — الأعداد النسبية وسياقات استعمالها (U5, r05) · pair 1 B · SEEDS UNIT 5

- **Status: ✅ generated and published locally (2026-10-30)** — see « Generator notes » entry 2 and `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.

- **Seed:**
  - `adad-nisbiya/_unit/`, copying the shape of `darb-qisma-ashriya/_unit/` (lessonRoutes, moduleContext, prepDiagnostic + test,
    unitMeta);
  - the whole-unit extraction `docs/sources/1am/unit5/` (`build-extraction.py`, `extraction.json`, `brief-authors.md`), book
    pp. 63–76, every element given a destination; the elements of later lessons stay « pending »;
  - the unit's تحدّ cited in `units_1am › adad-nisbiya.challenge`.
- **Entry (lab `frost-gauge`):** a week of January in Djelfa. Each morning the hand drags the thermometer's liquid to the reading
  given in words (« 3 درجات تحت الصفر »). The scale shows 0 and a sign appears only once the liquid passes below 0.
  - Second scene: the lowest point of Algeria (Chott Melrhir, below sea level) next to a mountain peak, on a vertical altitude
    gauge.
  - « Opposite » mode: the hand drags one level and its mirror follows at the same distance on the other side of 0.
- **Questions over the lab:**
  - « أيّ صباح كان الأبرد؟ »
  - « ما المسافة بين القراءة والصفر؟ »
  - « ما العدد المعاكس لـ −4؟ »
- **Named afterwards:** positive / negative relative number, sign, distance to zero, opposites. 0 is both positive and negative.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r04` (decimals on a half-line, published in pair 1) and `1am.m1.r04`.
- **LP edges:** none. The item has no net predecessor.
- **Bank:** S3 papers (relatives).
- **Successor connection:** `talim-mustaqim-mudarraj` (pair 2) writes P ← `1am_adad-nisbiya-siyaqat_P*`.

### 3. `talim-mustaqim-mudarraj` — التعليم على مستقيم مدرّج (U5, r05 r06) · pair 2 A

- **Status: ✅ generated and published locally (2026-10-30)** — see « Generator notes » entry 3 and `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.

- **Entry (lab `stride-stamp`):** a straight village road. The bus stop is O; the school lies east and the mosque square lies west.
  - The hand chooses the direction (an arrow) and the unit stride.
  - It then STAMPS the stride from O in both directions; the ticks −1, −2 … appear only when stamped west.
  - It places houses A(−3), B(2,7), C(−1,5).
  - Level 2: read abscissae with a hidden origin, and bound a point between two ticks.
- **Questions over the lab:**
  - « لماذا نحمل الوحدة نفسها في الجهتين؟ »
  - « ما فاصلة البيت الأخضر؟ »
- **Named afterwards:** graduated line (origin, direction, unit), abscissa of a point; symmetric points have opposite abscissae.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r04` and `1am.m5.r05`.
- **LP edges** (net `1am.m5.r04 → r06`, `1am.m5.r05 → r06`):
  - P2, P3 ← `1am_adad-ashri-mustaqim-mudarraj_P2`, `_P3`;
  - P1 ← `1am_adad-nisbiya-siyaqat_P2`.
- **Bank:** S3.
- **Successor connection:**
  - `talim-mustaqim-mudarraj-2` (2AM, net `1am.m5.r06 → 2am.m4.r01`, consolidates): its « تذكّر — السنة الأولى » becomes a live link,
    and an LP edge P1 ← this lesson's P3 is added if its config allows.

### 4. `bahth-adad-naqisa` — البحث عن أعداد ناقصة (U6, r10) · pair 2 B · SEEDS UNIT 6

- **Seed:** `ibarat-harfiya/_unit/` and `docs/sources/1am/unit6/` (book pp. 77–88), as in entry 2.
- **Entry (lab `rewind-belt`):** a packing workshop. A machine card (« +9 », « −14 », « ×6 ») took a number of items and gave 54.
  - The hand runs the belt BACKWARD and must pick the inverse card (−9, +14, ÷6) to find the missing input.
  - It then runs the belt forward to check (substitution).
  - The trap card « a − … = b » shows that the missing term of a difference is found by a subtraction (a − b), not by the inverse
    of « − ».
  - Level 2: decimal a and b, and the × case with a division that does not stop (the answer is a fraction, as published in
    `hasil-qisma-kasr`).
- **Questions over the lab:**
  - « أيّ بطاقة تعيد الآلة إلى الوراء؟ »
  - « تحقّق: ماذا يخرج إذا أدخلنا العدد الذي وجدته؟ »
- **Named afterwards:** a missing number written □; the three forms and their inverse operations; check by substitution.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m1.r05` (published `mana-jam-tarh`) and `1am.m5.r01`.
- **LP edges:** P2, P3 ← `1am_mana-jam-tarh_P1` (net `1am.m1.r05 → 1am.m5.r10`).
- **Bank:** S2 « أكمل a × … = b » is well covered (≥ 10 exercises).
- **Successor connection:** `hall-mushkil-muadala` (2AM, net `r10 → 2am.m4.r08`, extends): its « تذكّر — السنة الأولى » becomes a live
  link, plus an LP edge.
- **Status (2026-10-30):** generated, published locally and on `dev`; see « Generator notes » 4 and `docs/reports/MOYEN_ROLLOUT_PROGRESS.md` (1AM entry 4).

### 5. `talim-fi-mustawi` — التعليم في المستوي (U5, r07) · pair 3 A

- **Status: ✅ generated and published locally (2026-10-30)** — see « Generator notes » entry 5 and `docs/reports/MOYEN_ROLLOUT_PROGRESS.md` (1AM entry 5).

- **Entry (lab `courtyard-drone`):** the school courtyard plan with a frame. The origin is the flag pole; the axes are two painted
  lines.
  - The drone must photograph the fountain at (3 ; −2). The hand drives it along the abscissa axis FIRST, then along the ordinate
    axis (one axis at a time; the drone refuses a diagonal).
  - The swapped-order trap lands the drone on (−2 ; 3), a different place.
  - Level 2: read the coordinates of drawn objects, on squared paper and then on plain paper.
- **Questions over the lab:**
  - « هل يصل المسيّر إلى المكان نفسه إذا بدّلنا العددين؟ »
  - « ما إحداثيا البوابة؟ »
- **Named afterwards:** orthogonal frame, origin, abscissa axis, ordinate axis, M(x ; y) (abscissa first).
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r06`.
- **LP edges:** P2, P3 ← `1am_talim-mustaqim-mudarraj_P2`, `_P3` (net `r06 → r07`).
- **Bank:** S3.
- **Successor connection:** `talim-nuqta-mustawi` (2AM, net `r07 → 2am.m4.r04`, consolidates): live link and LP edge.

### 6. `tatbiq-qaida-harfiya` — تطبيق قاعدة حرفية (U6, r08) · pair 3 B

- **Status: ✅ generated and published (2026-10-30)** — see « Generator notes » entry 6 and `docs/reports/MOYEN_ROLLOUT_PROGRESS.md` (1AM entry 6).

- **Forward reference:** the rectangle's perimeter and area (`1am.m2.r08`) come in a « تذكّر » box. Do not rebuild them.
- **Entry (lab `letter-dial`):** a stationery shop's price rule « الثمن = 5 × n + 20 » printed on a card.
  - The hand turns a number dial for n; the value drops into EVERY slot of the letter and the card computes.
  - Level 2: a fence rule P = 2 × (a + b) with two dials.
  - Level 3: a « rule » that claims a + b = a × b. The hand turns the dials until the card shows ≠: one counterexample is enough.
- **Questions over the lab:**
  - « كم يدفع من نسخ 12 ورقة؟ »
  - « هل تكفي قيمة واحدة لنقول إن القاعدة خاطئة؟ »
- **Named afterwards:** literal expression; the convention 2 × x = 2x, a × b = ab (never 2 × 3 = 23); substitution;
  counterexample.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m1.r05`. Add `1am.m2.r08` only if the net lists it.
- **LP edges:** none in 1AM (`1am.m2.r08` is not published). Re-check that before writing.
- **Bank:** S3/S2 papers.
- **Successor connection:**
  - `ikhtibar-musawat-mutabayina` (2AM, r08 → 2am.m4.r09);
  - `qimat-ibara-harfiya` (3AM, r08 → 3am.m5.r03, extends);
  - in both: live links and LP edges.

### 7. `wadiya-idmajiya-adad-nisbiya` — synthesis U5 · pair 4 A

- **Structure:** no lab. 00 أستعدّ · 01–06 « الوضعية التدريبية » · 07 analysis of the final situation (the only `ContentModule`, with
  `objectives`) · 08 final test.
- **Models:** `wadiya-idmajiya-kusur-amaliyat` (2AM) and `wadiya-idmajiya-adad-nisbiya-2` (2AM).
- **الكفاءة:** one, with P1 ← the three U5 lessons.
- **Final situation (own context):** a regional weather station network. Temperatures of several towns go on a vertical line; the
  stations are marked on a map frame by coordinates. The student orders the temperatures, finds opposites and reads or places
  stations.
- **Training situations 01–06:** one per الكفاءة of the unit, plus two mixed.
- **Elements:** the unit's « integration » / « evaluation » become application or analysis material. Never copy their story.

### 8. `intaj-ibara-harfiya` — إنتاج عبارات حرفية (U6, r09) · pair 4 B

- **Entry (lab `rod-train`):** a carpenter assembles frames from rods: x-rods of unknown length and 1-rods.
  - The hand drags rods onto a track; the expression builds itself (x + x + 3 → 2x + 3).
  - Then a slider gives x a value and the track measures.
  - Level 2: a calculation program (« اختر عددا، أضف 3، اضرب في 2 ») is translated by laying rods: 2 × (x + 3). Copies of a group
    show why brackets are needed.
  - Level 3 (generalise): the same build for any x.
- **Questions over the lab:**
  - « اكتب طول القطار بدلالة x »
  - « ماذا يصبح إذا كان x = 4؟ »
- **Named afterwards:** produce a literal expression, a length in terms of x, a program as an expression.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r08` (published in pair 3).
- **LP edges:** P1–P3 ← `1am_tatbiq-qaida-harfiya_P2` (net `r08 → r09`).
- **Successor connection:** none in the net. The 2AM `ibara-harfiya-intaj` recalls it: turn its « تذكّر — السنة الأولى » into a live
  link (no LP edge; it has no item).

### 9. `hasr-qiyam-muqarraba` — حصر عدد عشري وقيمه المقرّبة (U1, r04 r05) · pair 5 A

- **Forward reference:** decimal division (`1am.m3.r03`) comes in a « تذكّر » box (the queue's « renvoi en avant »).
- **Elements:** `act-6` → 1 (application); `know-8` → 2; `ex-21`…`ex-25` → 4; `self-10`…`self-12`.
- **Entry (lab `bus-stations`):** a road with a bus stop at every kilometre post. The bus has stopped at 1,6 km.
  - The hand plants TWO stop signs: the post just before and the post just after (bounds 1 < 1,6 < 2). Signs that are not
    consecutive posts are refused, shown by a sign that floats.
  - « The nearest stop » = rounding to the unit; « before » / « after » = the approximate values by default / by excess.
  - Level 2: the road zooms to lamp posts every 0,1 km (bounds at the tenth); insert numbers between 1,6 and 1,7.
- **Questions over the lab:**
  - « بين أيّ محطتين تقف الحافلة؟ »
  - « أيّ محطة هي الأقرب؟ »
- **Named afterwards:** bounding, approximate value by default / by excess, rounding to the unit.
- **الكفاءات:** keep P1–P3. P2 may name rounding explicitly, because it carries r05.
- **أستعدّ:** measures `1am.m1.r04` and `1am.m5.r04`.
- **LP edges:** P1, P2 ← `1am_muqaranat-adad-ashriya_P1` (net `1am.m1.r04 → 1am.m3.r04/r05`).
- **Successor connection:**
  - `kasr-hasil-qisma` (2AM, r04 → 2am.m1.r05, extends);
  - `hasr-adad-ushri` (3AM, r05 → 3am.m5.x1, extends);
  - in both: live link and LP edge.

### 10. `wadiya-idmajiya-ibarat-harfiya` — synthesis U6 · pair 5 B

- **Structure and models:** as in entry 7. The model `wadiya-idmajiya-mafhum-muadala` (2AM) is the nearest.
- **الكفاءة:** P1 ← the three U6 lessons.
- **Final situation (own context):** a class prepares a school-fair stand. A price rule is applied, the expression of a stand's
  border length in terms of x is produced, and missing quantities are completed (□ × 12 = 180).

### 11. `wadiya-idmajiya-adad-tabiiya-ashriya` — synthesis U1 · pair 6 A

- **Elements:** `deep-4`, `integration`, `evaluation` (book context: data storage). Take the idea, not the story.
- **Final situation (own context):** a school library digitises its archive.
  - File sizes in Mo and Go are written in decimal form and from words.
  - They are ordered and placed on a graduated half-line.
  - They are rounded to decide how many memory sticks to buy.
- **الكفاءة:** P1 ← the five U1 lessons.

### 12. `injaz-jam-tarh-mudad` — إنجاز عمليات الجمع والطرح والحساب على المدد (U2, r01 r05) · pair 6 B

- **Elements:** `act-2` → 1; `know-1b/c/e` → 2; `method-1`, `method-2`, `now-27` → 3; 21 exercises → 4; `ict`.
- **Entry (lab `column-slider`):** a shop's order slips. Decimal numbers are paper strips above a fixed rank grid (hundreds … hundredths).
  - The hand SLIDES each strip until its comma sits on the comma column. A misaligned strip makes the grid add tenths to units:
    the drawn total turns wrong in front of the student.
  - Level 2: regrouping terms. The hand drags terms into pairs that make round numbers (8,25 + 1,75 = 10).
  - Level 3: durations on a stopwatch board, where 60 s fold into 1 min and 60 min into 1 h (a carry at 60, not at 10).
- **Questions over the lab:**
  - « لماذا تغيّر المجموع عندما تحرّك الشريط؟ »
  - « كم دقيقة في ساعة ونصف؟ »
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m1.r02`, `1am.m1.r03`.
- **LP edges:** P1 ← `1am_kusur-ashriya-kitaba_P4` (net `1am.m1.r03 → r05`); P2 ← `1am_mana-jam-tarh_P1`.
- **Successor connection:**
  - `silsila-bidun-aqwas`, `silsila-bi-aqwas`, `wasf-silsila-hisab` (2AM, net `1am.m1.r05 → 2am.m1.r01`): live links. Add an LP edge
    only where the 2AM P1 is the calc.
  - `qisma-iqlidiya-baqi` (1AM, net `r01 → m3.r01`): already linked to `mana-jam-tarh`; add only if its config misses r01.

### 13. `rutbat-miqdar-jam` — رتبة مقدار مجموع وفرق (U2, r06) · pair 7 A

- **Elements:** `act-3` → 1; `know-2` → 2; `ex-13`…`ex-15`, `self-4`, `deep-1` → 4.
- **Entry (lab `market-estimate`):** the weekly market basket. Six price tags such as 498,75 DA and 1 205,50 DA.
  - The hand SNAPS each tag to a nearby round value (choose tens or hundreds); a needle shows the estimate.
  - Then the cashier's receipt appears with one wrong total. The estimate's band exposes it without any exact computation.
  - Level 2: choose between mental, exact and calculator computation for three situations.
- **Questions over the lab:**
  - « هل المبلغ المكتوب في الوصل معقول؟ لماذا؟ »
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m1.r05` and rounding to the unit (`1am.m3.r05`, published in pair 5).
- **LP edges:** P1 ← `1am_mana-jam-tarh_P1` (net `r05 → r06`).
- **Money in Arabic strings:** an LTR isolate (« 498,75 DA »).
- **Successor connection:** `kitaba-ilmiya-rutba` (3AM, net `r06 → 3am.m3.r05`, extends): live link and LP edge.

### 14. `qisma-ashriya-taqrib` — القسمة العشرية والقيمة المقرّبة لحاصل قسمة (U3, r03 r04 r05) · pair 7 B

- **Elements:** `act-5` → 1 (book context: milk; the platform uses its own); `know-4` → 2; `method-3`, `now-44` → 3; `ex-25`,
  `ex-27`…`ex-30` → 4; `self-9`…`self-11`, `deep-2`.
- **Entry (lab `olive-press`):** an olive press shares the oil of a pressing between families.
  - Case 1: 87 L shared between 4 families. The hand pours whole litres into each jar; when the remainder is too small, it
    « breaks » the remainder into decilitres (×10, the next rank after the comma) and pours again, then into centilitres. The
    division stops when the remainder is 0: 21,75 L.
  - Case 2: 158 L between 12. The remainder never vanishes, so the student decides where to stop and reads the approximate values
    by default and by excess to 1 L, 0,1 L and 0,01 L.
- **Questions over the lab:**
  - « ماذا فعلت بالباقي؟ »
  - « هل ستتوقّف القسمة يوما؟ »
- **Named afterwards:** decimal division, exact vs approximate quotient, approximations by default / by excess.
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m3.r01` (published) and `1am.m1.r03`.
- **LP edges:**
  - P1 ← `1am_qisma-iqlidiya-baqi_P1` (net `m3.r01 → m3.r03`) and ← `1am_kusur-ashriya-kitaba_P4` (net `m1.r03 → m3.r03`);
  - P3 ← `1am_hasr-qiyam-muqarraba_P2`.
- **Successor connection:**
  - `hasr-qiyam-muqarraba` (published in pair 5): its « تذكّر » toward decimal division becomes a live link;
  - `kasr-hasil-qisma` (2AM, r04) and `hasr-adad-ushri` (3AM, r05): live links and LP edges.

### 15. `wadiya-idmajiya-jam-tarh-ashriya` — synthesis U2 · pair 8 A

- **Elements:** `opener`, `deep-2`, `deep-7`, `deep-9`, `integration`, `evaluation`. The book context is a utility bill. The p. 33
  « وضعية تقويم » has swapped clocks (recorded in `discrepancies`).
- **Final situation (own context):** a family trip by bus between two wilayas.
  - Leg durations are added (h/min).
  - The budget lines are added and subtracted with decimals.
  - The order of magnitude checks the total before the exact computation.
- **الكفاءة:** P1 ← the three U2 lessons.

### 16. `darb-adad-ashriya` — ضرب الأعداد العشرية (U3, r01 r03 r05 r06) · pair 8 B

- **Elements:** `act-1`, `act-2` → 1; `know-1` → 2; `method-1`, `now-40` → 3; 15 exercises → 4; `opener`, `self-1`…`self-6`,
  `deep-1/3/4/5/7` (the lead assigns the modules).
- **Entry (lab `carpet-grid`):** a carpet workshop on a floor gridded every 0,1 m.
  - The hand drags the carpet's corner to 3,1 m × 2,4 m.
  - The cells (each 0,01 m²) are counted: 31 × 24 = 744 cells = 7,44 m².
  - So the number of decimals of the product is the total of the factors' decimals, seen as « hundredths of a square metre ».
  - Then the order of magnitude (3 × 2 ≈ 6) confirms the comma.
  - Level 2: ×0,1 / ×0,01 as « a tenth / a hundredth of the carpet », linked to ÷10, ÷100. Commuting and grouping:
    4 × 20,17 × 25 = 100 × 20,17.
- **Questions over the lab:**
  - « كم خلية؟ كم متر مربع؟ »
  - « أين الفاصلة ولماذا؟ »
- **الكفاءات:** keep P1–P4.
- **أستعدّ:** measures `1am.m1.r03`, `1am.m1.r06`.
- **LP edges:**
  - P2 ← `1am_kusur-ashriya-kitaba_P4` (net `r03`);
  - P4 ← `1am_rutbat-miqdar-jam_P1` (net `r05 → r06`);
  - P1 ← `1am_mana-jam-tarh_P1`.
- **Successor connection:**
  - `quwa-adad-ashara` (3AM, r03 → 3am.m3.r01): live link and LP edge;
  - the 2AM `silsila-*` (r05);
  - `qisma-ashriya-taqrib` (1AM, published in pair 7; net `r03 → m3.r03`): add its LP edge.

### 17. `hasil-qisma-mustaqim` — حاصل القسمة على نصف مستقيم مدرّج (U4, r04 r01) · pair 9 A

- **Elements:** `act-2` → 1; `know-2` → 2; `ex-6`…`ex-9` → 4; `self-6`.
- **Entry (lab `ribbon-marks`):** a tailor's ribbon on a graduated rod.
  - The hand drags a divider handle that splits EVERY unit into b equal parts (b = 4, then 5, then 3).
  - It steps a marker part by part to a/b.
  - For 19/5 a « jump a whole unit » button appears (5 parts = 1). The Euclidean division 19 = 3 × 5 + 4 becomes « 3 jumps, then 4
    steps »: 3 < 19/5 < 4.
- **Questions over the lab:**
  - « كم جزءا في الوحدة؟ »
  - « بين أيّ عددين طبيعيين تقع 19/5؟ »
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r04`, `1am.m5.r01`, `1am.m3.r01`.
- **LP edges:**
  - P1, P2 ← `1am_adad-ashri-mustaqim-mudarraj_P1`, `_P3`;
  - P2 ← `1am_hasil-qisma-kasr_P1`;
  - P3 ← `1am_qisma-iqlidiya-baqi_P1`.
- **Successor connection:**
  - `muqarana-kasrayn` (2AM, r01 → 2am.m1.r08) and `adad-natiq` (3AM, r01 → 3am.m1.r07): live links and LP edges if missing;
  - `talim-mustaqim-mudarraj` (1AM, published, r04 → r06): add an edge only if the net needs it (it already reaches r04 through
    entry 1).

### 18. `wadiya-idmajiya-darb-qisma-ashriya` — synthesis U3 · pair 9 B

- **Elements:** `deep-6`, `deep-9`, `integration`, `evaluation` (book context: decorating a room).
- **Final situation (own context):** a class cooperative prepares bread for a school open day.
  - Flour costs are computed with decimal products.
  - Loaves are shared into boxes (Euclidean division and divisibility).
  - The cost per loaf is a decimal division with an approximate value.
- **الكفاءة:** P1 ← the four U3 lessons.

### 19. `akhdh-kasr-min-adad` — أخذ كسر من عدد (U4, r01 r03) · pair 10 A

- **Elements:** `act-3` → 1 (book context: juice drink; the platform uses its own); `method-1` → 3; `ex-10`…`ex-14` → 4; `aside-58`,
  `self-7`, `self-8`, `deep-3`…`deep-7`, `ict-opinion`; `now-56` item 1.
- **Entry (lab `date-crates`):** a date harvest of 35 kg must be packed; 3/5 of it goes to the market.
  - The hand drags dividers to split the heap into 5 equal crates, then taps 3 crates: (35 ÷ 5) × 3 = 21.
  - The second and third routes play on the same heap: 3 × 35 then ÷ 5, and 0,6 × 35.
  - Level 2: a case where ÷ b does not stop (2/3 of 20) shows why one route is better there.
- **Questions over the lab:**
  - « كم كلغ في كل صندوق؟ »
  - « هل تعطي الطرق الثلاث العدد نفسه؟ »
  - « أيّ طريقة أسهل هنا؟ »
- **الكفاءات:** keep P1–P3.
- **أستعدّ:** measures `1am.m5.r01`, `1am.m1.r05`.
- **LP edges:**
  - P1 ← `1am_hasil-qisma-kasr_P1` (net `r01 → r03`);
  - P1 ← `1am_darb-adad-ashriya_P1` (net `m1.r05 → m5.r03`).
- **Successor connection:** `jida-kasrayn`, `jam-tarh-kusur` (2AM, r03 → 2am.m1.r07/r09, extends): live links and LP edges.

### 20. `wadiya-idmajiya-kitabat-kasriya` — synthesis U4 · pair 11 A

- **Elements:** `integration`, `evaluation`.
- **The book context is not reused.** It is a farm loan; any « interest » theme is forbidden.
- **Final situation (own context):** a school sports field. 2/5 of it is grass and 1/4 is a running track.
  - Fractions are placed on a half-line and compared.
  - Fractions of the area are taken.
  - The fractional writings are reduced.
- **الكفاءة:** P1 ← the four U4 lessons.

## Successor connection (after each publish, coordinator)

For each published successor named in the entry's card:
1. **LP edges:**
   - add `pointPrerequisites` P<n> ← `1am_<code>_P<m>`, only along a net link;
   - add a history line in the successor's `lesson.config.js` header;
   - `curriculum/dz/decomposition.test.js` must stay green. 2AM and 3AM accept earlier-year LP ids; 4AM does not.
2. **Live link:** its « تذكّر — السنة الأولى » becomes a link to the new lesson. The « راجع » panels and
   `EarlierYearReview` light up by themselves.

## The generator prompt (one per entry)

Replace `<CODE>`, `<N>` (unit number 1–6), `<UNIT>` (unit folder), `<PORT>`, `<CARD>` (the card number in this file).

```
You are the lead generator for ONE 1AM lesson of the cycle moyen rollout (phase 3, 1AM « ميدان الأنشطة العددية »).
Repo /home/abdennour/Projects/smarter-academy/smarter-academy-dz, branch dev.

Your lesson: <CODE>. Its design card is « <CARD>. <CODE> » in docs/curriculum/PLAN_1AM_NUMBERS.md. Execute the card. The entry
point, the lab (name, world, what the hand holds), the module list, the الكفاءات and the LP edges are decided. If something is wrong
(a miscomputed number, a lab name taken, a contract it breaks), fix it minimally and record it under « Generator notes » at the end
of PLAN_1AM_NUMBERS.md and in your report.

Step 0 (design): read the textbook pages of the lesson (docs/official-book-pdfs/…السنة الأولى…pdf, pdftoppm -r 110; PDF page =
printed page), its extraction elements (docs/sources/1am/unit<N>/extraction.json › destinations), and the nearest existing lab's §
in MANIPULATION_CONTRACT.md. Fix every number of the lab, modules and مسائل, and compute every answer independently.

Read first: CLAUDE.md, docs/README.md, docs/architecture/LEARNING_NET.md (§3bis, §4), docs/lessons/LESSON_DEVELOPMENT_GUIDE.md
(§3, §4ter–§4quinquies, §6, §6ter, §11 « Publish a lesson », §14, « Generating a 1AM–3AM unit LESSON BY LESSON » and the
« patterns to reuse » notes), docs/architecture/BUNDLE_BOUNDARIES.md §3–§4, MANIPULATION_DNA.md §17, MANIPULATION_CONTRACT.md
(§8ter, §8quater, §8quinquies), EXERCISE_CONTRACT.md (« Term-exam provenance », « Earlier-year review link »,
« Présentation examen (BEM) »), docs/sources/moyen/exams/EXAM_PATTERN.md §3 and §6, docs/reports/LAB_PROTOTYPE_ROLLOUT.md, and the
« Learned in pair N » notes of docs/curriculum/PLAN_2AM_M4.md (bidi, 255-char الكفاءات, memo-card sizes, JSX \frac, knowledge graph
tests, synthesis shape). Model lessons: the published 1AM lessons
apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/darb-qisma-ashriya/qisma-iqlidiya-baqi/,
.../kitabat-kasriya/hasil-qisma-kasr/, .../adad-tabiiya-ashriya/muqaranat-adad-ashriya/; for a synthesis the 2AM
.../wadiya-idmajiya-kusur-amaliyat/ and .../wadiya-idmajiya-mafhum-muadala/.

Do, in order:
1. If the card says SEEDS UNIT: seed lessons/moyen/1am/ansab_al_aadad_wal_hisab/<UNIT>/_unit/ (shape of darb-qisma-ashriya/_unit/)
   and build docs/sources/1am/unit<N>/ (build-extraction.py, extraction.json, brief-authors.md) for the WHOLE unit, every element
   given a destination. Otherwise move this lesson's « pending » destinations in the unit's build-extraction.py (small targeted edit).
2. Generate the lesson INTO its catalogue entry (same code, same programmeItems), folder named exactly like the code: modules (each
   ContentModule with `objectives`), the lab (new type, core maths imported BY PATH, strings in
   i18n/locales/ar/lesson.manipulation.json, LabCoach on, KidFigure — girls always in hijab —, no title, context then ONE question,
   the full lab prototype: questions over the lab after each step, stepper, success celebration, sounds off by default with a
   « الصوت » switch, « إعادة », full screen, memo end card with « اختبر ذاكرتك »), knowledge map, « أستعدّ » from the net (every
   review item measured), « تذكّر » boxes for forward references, the الكفاءات of the card (order kept, ≤ 200 chars each),
   `pointPrerequisites` as the card says (verify the target P ids). No student-visible line points to the textbook. Respect Islam
   in every string, icon and emoji (no pig, alcohol, gambling, dice as a game, interest). Never touch App.jsx: run
   `npm run generate:lesson-index`.
3. Practice bank (5 levels × 10 sheets) in content/practice/1am/<CODE>/, oracle scripts/practice-oracle/<CODE>.mjs, misconceptions
   MISC-<KEY>-*; add it to active.json and exam-style.json. `term_exam` only for exercises you actually read in
   docs/Exames-1 AM to 3AM/1am/ (render papers without text with pdftoppm -r 150); otherwise `platform_addition` +
   `reason: term_exam_modelled` + `modelledOn`, or `adapted` from the lesson's textbook elements. A synthesis has no bank unless
   the 2AM model synthesis has one — copy what it does.
4. Gates: the lab's logic + render tests, content.test.js (independent arithmetic), the unit's prepDiagnostic test,
   `node apps/web/scripts/lab-rollout-status.mjs --lesson <CODE>` prints ✅, `cd apps/web && npx vitest run src/lessons/common/knowledge`,
   `npm test`, `npm run check:lessons` (exit 0; entry budget 212 KB gzip — never raise it; no eager module imports catalogue
   names), `NODE_OPTIONS=--max-old-space-size=8192 npm run build`; browser check of every module on port <PORT> at 768×1024,
   1024×768, 1280×800 and 1366×768 (tablet and laptop only, NO phone); lab screenshots of the initial and mid-activity states at
   those sizes, VIEWED and iterated; a lesson-kit e2e apps/web/e2e/lesson-kit/1am-<CODE>.mjs (local API on 127.0.0.1:8000).
5. Catalogue: status `available`, durationMinutes (guide §11 convention: module total without the مسائل), regenerate the lesson
   index and `npm run generate:learning-net`.
6. Documentation sync: the lab's § in MANIPULATION_CONTRACT.md; reusable patterns in the guide's « patterns to reuse »; append the
   entry to docs/reports/MOYEN_ROLLOUT_PROGRESS.md under « 1AM ميدان الأنشطة العددية ».
7. Publish (owner rules): import into the LOCAL database and set the lesson, its modules and its exercises to `published` (nothing
   stays `draft`); commit `feat(lessons): <CODE>`; push to dev. Then apply the card's « Successor connection » and commit it as
   `feat(lessons): connect <successor> to <CODE>`.

Two leads share lessonIndex.generated.json, content/practice/*.json, the registries and the i18n file: small targeted edits after
a fresh read; never regenerate over the other lead's lines.

Final report: URL path; modules; the lab and the screenshots you reviewed; bank counts (term_exam / modelled / adapted /
platform_addition); every الكفاءات change; LP edges written; gates with results; files created or changed; docs updated; fixes to the
card; open points for the owner.
```

## Coordinator steps after each pair

1. Read both reports and look at the lab screenshots.
2. Gates on the tree: `rm -rf apps/web/dist`, `npm test`, `npm run check:lessons`, `npm run build`,
   `node scripts/learning-net-queue.mjs --check`, `npx vitest run curriculum/dz/net` (in `packages/core`), grep for forbidden emoji.
3. One commit per lesson, `feat(lessons): <code>`, then `git push origin dev`.
4. Local DB: export/import the curriculum and the content registry; the lesson's modules and exercises are `published`.
5. Successor connection: gate it, then commit it as `feat(lessons): connect <successor> to <code>`.
6. Progress log entry in `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`; tick the entry's status here.

## Owner questions (defaults applied unless the owner says otherwise)

1. **Run order.**
   - Default: units 5–6 first (Phase A, 4AM needs them), then units 1–4 in book order.
   - Alternative: pure book order (U1 → U6).
2. **Synthesis banks.** Default: as in the 2AM syntheses.
3. **`tatbiq-qaida-harfiya` and the rectangle's perimeter and area.**
   - Default: recalled in a « تذكّر » box (taught later in geometry), not taught here.

## Generator notes

(Leads append deviations here, one line per entry.)

- **1 · `adad-ashri-mustaqim-mudarraj` (2026-10-30).**
  (a) The catalogue entry's `programmeItems` is **`1am.m5.r04`** (and `sourceTopicId` `1am.m5`), not `1am.m1.r04`: the card's « r04 » is the net PREREQUISITE
  `1am.m1.r04 → 1am.m5.r04` (ordering, published `muqaranat-adad-ashriya`). The entry keeps `1am.m5.r04`; « أستعدّ » measures `1am.m1.r04` (items 1–2) and `1am.m1.r02` (items 3–6).
  (b) `prerequisiteLessonCodes` stays `[]` (`coursesData.test.js` requires a prerequisite lesson to come EARLIER in the unit and `muqaranat-adad-ashriya` is `order` 3, after this lesson's 2 — a forward reference of the book); `pointPrerequisites` P2, P3 ← `1am_muqaranat-adad-ashriya_P1` (verified: P1 = comparing two decimals).
  (c) **Extraction error corrected**: `act-4`'s B and C are **1,7 and 0,5** (read at 400 dpi: 17 and 5 small ticks of 35,5 px from O), not 1,9 and 0,6; `act-4`, `know-5`, `ex-15`, `ex-16`, `self-7` are now `verified: True` (discrepancy recorded in `build-extraction.py`).
  (d) The card's worlds overlap with `ruler-compare` (both a sports-day long-jump pit): `jump-tape` has its own theme `sportsday` and a different gesture (the hand STRETCHES the unit, then plants a flag; متقدم: a reading cursor). Level 2 grew from the card's single task to three (a1 flag between two ticks, a2 a tape without its origin, a3 a tape in hundredths) to cover P2's « حتى حين لا يظهر المبدأ » and the book's four graduations.
  (e) **No statement figure draws a graduated half-line** (`StatementFigure` knows plane, space, chart, tape): the bank uses worded positions (« n وحدة و t تدريجة صغيرة », « بين العلامتين … »); module 4 draws the arrows with `NumberLine` (static). A `halfline` figure kind is an open point for the owner.
- **2 · `adad-nisbiya-siyaqat` (2026-10-30).**
  (a) **The unit has NO تحدّ** (page 63 carries the objectives, the lift and the Chinese counting-rod box; checked at 200 dpi): `units_1am › adad-nisbiya.challenge` stays `null`, the card's « cite the تحدّ » was generic.
  (b) The card's « mountain peak next to the Chott » became a **hill of 30 m** (the 10-m gauge cannot hold the Chott at −40 m and a real peak; `Tahat` would need another scale): the lesson never states a real altitude it cannot check; the Chott is « نحو 40 م تحت سطح البحر ».
  (c) The catalogue entry keeps `programmeItems: ['1am.m5.r05']` (as the card); `pointPrerequisites` none; **P1 gains « طوابق العمارة »** (the lab's floors world, the book's lift).
  (d) A module 3 « طريقة » is a platform addition (the book's method is the next lesson's), as in entry 1; the lesson therefore has the same nine modules.
  (e) The book's `self-2` (« which of these is not a relative number: 1/7 ») and `self-3` (−2 then 4 degrees lower) go to the synthesis: the first depends on the 1AM definition of a relative number (integer or decimal), the second is an addition of relatives (2AM). `know-2`'s « distance to zero — opposites » paragraph belongs to THIS lesson; its half-line and abscissa paragraphs to `talim-mustaqim-mudarraj`.
  (f) Successor `talim-mustaqim-mudarraj` is **not generated yet**: its `pointPrerequisites` P ← `1am_adad-nisbiya-siyaqat_P*` are still to write when it is published (nothing to connect now).
- **3 · `talim-mustaqim-mudarraj` (2026-10-30).**
  (a) The catalogue entry keeps `programmeItems: ['1am.m5.r06', '1am.m5.r05']` and its `prerequisiteLessonCodes` **gains `adad-nisbiya-siyaqat`** (the home lesson of `r05`, `order` 20 < 21; the card listed only `adad-ashri-mustaqim-mudarraj`). Net links verified before writing the edges: `1am.m5.r04 → r06`, `1am.m5.r05 → r06` (`requires`) and `1am.m5.r06 → 2am.m4.r01` (`consolidates`).
  (b) **LP edges written** (target ids and meanings read in the published lessons): P1 ← `1am_adad-nisbiya-siyaqat_P2` (« التعرّف على العدد النسبي … تمييز الإشارة من المسافة »), **P2 ← `1am_adad-ashri-mustaqim-mudarraj_P2`** (reading an abscissa, exactly or by bounds) and **P3 ← `1am_adad-ashri-mustaqim-mudarraj_P3`** (marking a point): the card's « P2, P3 ← `_P2`, `_P3` » is read one-to-one.
  (c) **P2 gains « ولو لم يُعلَّم المبدإ »** (the hidden-origin tasks of متقدم), the only الكفاءة change; P1 and P3 are the draft's words.
  (d) The lab keeps the card's gesture (STAMP a unit stick from O in both directions, place `A(−3)`, `B(2,7)`, `C(−1,5)`, read with a hidden origin, bound between two ticks) and adds two kinds: **`twin`** (the symmetric house, the « symmetric points have opposite abscissae » of the card's « named afterwards ») and **`origin`** (the card's « hidden origin »: the flag of O between two written graduations, relabelled live). The card's « the hand chooses the direction (an arrow) » is NOT built: the direction is the east (the positive side, the school) in every task and only the STRIDE is chosen on a rail of three notches (the arrow would add a second variable without a second idea; open point). The long stride is the starting one in b1 on purpose: the finite road (250 west) stops it at −2.
  (e) `deep-4` (the snail) is reused with a statement that SAYS the direction (the scan does not show it); `act-1-line` becomes the symmetric-point exercise, `act-2` the `place` task, `deep-2` a timeline problem (choose the scale of a 24 cm sheet), `self-5`/`self-6` the final test; `ex-10`…`ex-15`, `now-68`, `deep-3` are in أتمرّن. All re-read at 110 dpi and marked `verified: True` in `docs/sources/1am/unit5/build-extraction.py`; `know-2`'s half-line and abscissa paragraphs are this lesson's, as recorded in entry 2 (e).
  (f) Statement figures: the bank and the module's figures use `GeoFigure` number lines (one label per written tick, names above the axis); a dedicated `halfline`/`numberline` statement-figure kind (entry 1 (e)) stays an open point for the owner.
- **4 · `bahth-adad-naqisa` (2026-10-30).**
  (a) The catalogue entry keeps `programmeItems: ['1am.m5.r10']` and `prerequisiteLessonCodes: ['mana-jam-tarh']` (unit 2, earlier in the order). Net link verified before writing the edge: `1am.m1.r05 → 1am.m5.r10` (`requires`). **LP edge written: P2 ← `1am_mana-jam-tarh_P1`** (« اختيار العملية المناسبة (جمع أو طرح) »: choosing the subtraction for a missing term of a sum is the same choice). **P3 has NO edge**: the card's « P2, P3 ← `_P1` » was not followed for P3, because a product with its division and the check by substitution are not prepared by an additive-operation choice (a forward LP edge must be justified, `LEARNING_NET.md` §4.6).
  (b) **الكفاءات** (order kept): P1 is made explicit with the lab's numbers (« مثل □ + 9 = 54 أو 6 × □ = 54 » instead of « 9 × □ = 54 »); **P3 gains « (ولو كان الناتج كسرًا) » and « كلّ نتيجة »** (the quotient that does not stop, written as a fraction, and the check of EVERY result, not only of a product); P2 is the draft's words.
  (c) **The unit DOES print a تحدّ** (p. 77, al-Kāshī's pomegranates): `units_1am › ibarat-harfiya.challenge` already cites it; the extraction routes it to the synthesis (`n(n+1)/2 = 6n`, n = 11). The book HAS a طريقة for this lesson (p. 82) but NO معارف: module 3 is the book's method with the platform's numbers, module 2 is a platform addition (names of what the student did + a history card on al-Khwarizmi).
  (d) **The official form is `a − … = b`** (programme item `1am.m5.r10`), so « a − □ » is not a mere trap: the lab's `rsub` card (« 80 − ») is the standard second-position difference; « □ − a = b » (the book's « دوري الآن » (1) and ex-15 ب, د) is the first-position one. The lab and the bank carry both.
  (e) **Two misprints read, not copied**: `now-82` (2) is printed « □ − 123,8 ÷ 13 » and is read « □ × 13 = 123,8 » (619/65, the case of a division that does not stop, the card's level-2 « × case »); `ex-17`'s rectangle has a length « n » (a letter) with no value, so the lesson gives its own length (6,5 cm → 14 cm). The card's « published as in `hasil-qisma-kasr` » is kept: the answer is `p/q` (`answerType: rational`).
  (f) **Level 2 of the lab** (decimals + the division that does not stop) was split in three tasks: a1 a decimal sum `+ 17,5 → 46,2`, a2 the trap card with decimals `12,5 − → 4,8`, a3 `× 7 → 20` (the fraction `20/7`, checked exactly). The book's two-card « برنامج حساب » (`ex-18`, `deep-6`) is NOT a lab task (one card per task keeps the gesture distinct) but the MASALA 3 and the bank's `back` questions rewind it card by card in the REVERSE order (`MISC-NAQISA-ORDER`).
  (g) **Bank provenance**: 5 `term_exam` sheets, all of the third term, each read in the PDF (text layer of `1am-s3-39` ex 2, `-37` ex 2, `-43` ex 4; images of `1am-s3-44` ex 1 and `-47` ex 1 rendered with `pdftoppm -r 100`); the S2 « أكمل a × … = b » items of the card could not be read item by item (their text layers are shifted-glyph or image-only), so that register is `term_exam_modelled` (sheet 1-08). 34 modelled, 11 adapted from the textbook, 0 other `platform_addition`.
  (h) Successor `hall-mushkil-muadala` (2AM): « تذكّر — السنة الأولى » links to this lesson and its LP edges are written: P2 ← `1am_bahth-adad-naqisa_P3` (the check by substitution), P3 ← `1am_bahth-adad-naqisa_P2` and `_P3` (history line in its `lesson.config.js` header).

- **5 · `talim-fi-mustawi` (2026-10-30).**
  (a) The catalogue entry keeps `programmeItems: ['1am.m5.r07']` and `prerequisiteLessonCodes: ['talim-mustaqim-mudarraj']` (order 21 < 22). Net link verified before writing the edges: `1am.m5.r06 → 1am.m5.r07` (`requires`) and `1am.m5.r07 → 2am.m4.r04` (`consolidates`). **LP edges written:** P2 ← `1am_talim-mustaqim-mudarraj_P2` (reading an abscissa → reading both coordinates) and P3 ← `_P3` (marking a point by its abscissa → by its two coordinates), as the card says, **plus P1 ← `1am_talim-mustaqim-mudarraj_P1`** (the frame is made of TWO graduated lines with a common origin: choosing origin, direction and unit is exactly what the frame reuses). The card listed only P2 and P3.
  (b) **الكفاءات unchanged** (the draft's three, in order). **The book's map of Algeria is not reproduced** (`act-3`): the lab keeps its QUESTION (one number is not enough, two numbers in a certain order are) with a drone and a school courtyard; the three pupils' answers (« 1 », « 1 then 3 », « 3 then 1 ») become the swapped pair `(3 ; −2)` / `(−2 ; 3)`.
  (c) **The lab (`courtyard-drone`)** keeps the card's gesture (x FIRST, then y, one axis at a time, a diagonal refused, the swapped order lands on `(−2 ; 3)`) and adds two things: **a `read` kind** (the card's « read the coordinates of the gate »: the object is drawn and the pill reads `(x ; y)`) beside the `fly` kind (the place is said by its numbers), and **a map WITHOUT squares** (`paper: 'plain'`, the book's « ورقة غير مرصوفة »: the drone projects its two parallels to the axes). The lab never says « محور الفواصل / التراتيب » (module 2 names them).
  (d) **Four read papers → four `term_exam` sheets:** `1am-s3-43` ex 2 (mark `D(−4 ; 0)`, `C(3 ; 0)`, `B(−3 ; −3)`, `A(−3 ; 3)`; the protractor steps are not asked), `1am-s3-37` ex 4 (`A(−3,5 ; 2)`, `B(1 ; 3)`, their symmetrics about the abscissa axis), `1am-s3-45` ex 4 (`M(3 ; −1)`, `N(0 ; 2)`, the symmetric of `M` about the abscissa axis, the image of the triangle about the ordinate axis) and `1am-s3-39` ex 3 (`D(−2 ; 1)`, `C(1 ; −1)`, `B(4 ; 1)`, `A(1 ; 3)` and the crossing point of the diagonals `(1 ; 1)`; the nature of the quadrilateral is not asked: a rhombus needs lengths 1AM cannot compute). The S1–S2 papers hold no frame item. The corpus counts only four exercises for `1am.m5.r07`; the other sheets are `term_exam_modelled` (34) or `adapted` from the lesson's own textbook elements (12).
  (e) **Misprints and readings:** `ict-ex` prints `G(−3 ; −2)` and `H(−3 ; −2)` (read at 110 dpi, recorded in `discrepancies`, the list is not used); `ex-20` read at 200 dpi: `A(−5 ; 0)`, `B(−3 ; 1)`, `C(−2 ; 2)`, `D(−1 ; 4)`, `E(−1 ; −1)`, `F(0 ; −3)`, `G(3 ; 1)`, `H(3 ; −1)` (the lesson uses its own points). `deep-6` (the dart board) becomes a bean-bag throw at a target of nested squares (no weapon, no game of chance); the zones are scored by the larger of the two coordinates without sign.
  (f) **Glance height:** a plane of 11 × 9 tiles cannot be as flat as the 760 × 300 road of `stride-stamp`: `[data-cd-glance]` is ≈ 731 / 757 px at 1024×768 (مبتدئ / متقدم), not ≤ 700 (the e2e threshold is 760); recorded in the contract. A `halfline`/`numberline` statement-figure kind is still an open point.
  (g) Successor `talim-nuqta-mustawi` (2AM): « تذكّر — السنة الأولى » links to this lesson by itself; its LP edges written: P1 ← `1am_talim-fi-mustawi_P1`, P2 ← `1am_talim-fi-mustawi_P2` (the pair read in order), P3 ← `1am_talim-fi-mustawi_P3` (marking a point), kept beside its internal edges (history line in its `lesson.config.js` header).

- **6 · `tatbiq-qaida-harfiya` (2026-10-30).**
  (a) The catalogue entry keeps `programmeItems: ['1am.m5.r08']` and `prerequisiteLessonCodes: []`. The ONLY net link into `1am.m5.r08` is `1am.m2.r08 → r08` (the rectangle's perimeter and area, taught later by the unpublished `mustatil-murabba-masaha`); `1am.m1.r05` is NOT a net prerequisite of r08 (the card's « measures r05 » is kept because the substituted values are decimal). « أستعدّ » measures r05 (items 1–2), the order of operations (3–4, the catalogue's `prerequisites`) and `1am.m2.r08` as a primary-school acquis (5–6). **No LP edge** (the only net source is unpublished); the perimeter and area appear only in a « تذكّر » box and as a GIVEN rule `P = 2 × (a + b)` (fence), never taught, no link.
  (b) **الكفاءات** (order kept): P1 gains « دون الخلط مع $2\times 3 = 6$ لا $23$ » (the convention is never applied between two numbers); P2 says « كلّ حرف … في كلّ موضع … بالأولويات » and uses the lab's values (a = 15, b = 8); P3 gains « وإدراك أنّ الأمثلة التي تصحّ فيها لا تثبت صحّتها ».
  (c) **The card's three levels became two** (the workspace has مبتدئ / متقدم): level 2 = the fence rule (a1 15 and 8 → 46, a2 the swapped values), level 3 = a3 the pretended rule `a + b = a × b` (it holds at (2 ; 2), ONE counterexample refutes it). مبتدئ is b1 (12 sheets → 80), b2 (a customer paid 95: n = 15, a `find` task) and b3 (`5 × n + 20 − n`: n written TWICE, 10 → 60). A value counts at the RELEASE of the dial. From (2 ; 2) any single move already gives a counterexample, so the « holds » verdict is reached only by returning to (2 ; 2) or (0 ; 0).
  (d) **Extraction boundary re-routed** (`docs/sources/1am/unit6/build-extraction.py`, all this lesson's elements re-read at 110 dpi and `verified: True`): `know-1` is SPLIT by `items` — the definition and the omitted-× conventions (P1 of the catalogue) go to this lesson's module 2, the remarks (`x × 1`, `ba = ab`, `x × 0`, `a × a`) stay with `intaj-ibara-harfiya`; `act-2` (the Ruffier test) becomes ex-1 « football points » (not the entry); `act-4` is the lab's a3 (module 1); `ict` / `ict-ex` → ex-6 (a spreadsheet formula `=6*A2-4`); `deep-5` → مسألة 3. `ex-6` prints volumes in mL for a rule that needs litres: recorded in `discrepancies`, the lesson writes its own rule `V = d ÷ t`.
  (e) **Module 3 is a platform addition** (the book has no طريقة here), as in entries 2–4: the same lab alone (m1 `4 × n + 15` with n = 9, m2 `2a = a + 2`), then the four actions write / place the values / compute by priorities / answer.
  (f) **Bank** (written by a delegated helper from a brief, 50 sheets × 3–4 questions = 177): 3 `term_exam` (`1am-s3-47` ex 3 and `1am-s3-37` ex 5 ×2, read in the PDFs), 37 `term_exam_modelled`, 10 `adapted` (one per textbook element), 0 other; 10 `MISC-TATBIQ-*`. `1am-s2-79` ex 5 is NOT cited (its header says 2AM; the index marks it misfiled). The « write the expression » parts of those papers belong to `intaj-ibara-harfiya`.
  (g) **Glance height** at 1024×768 (sidebar open, column ≈ 414 px): `[data-ld-glance]` is 715 px (مبتدئ) and 739 px (متقدم), not ≤ 700 (e2e threshold 760); recorded in the contract.
  (h) Successors: `ikhtibar-musawat-mutabayina` (2AM): « تذكّر — السنة الأولى » is a live link and LP edges P1 ← `1am_tatbiq-qaida-harfiya_P2`, P2 ← `_P3`; `qimat-ibara-harfiya` (3AM): the link was already wired through `getLessonPath`, LP edges P1 ← `_P2`, P3 ← `_P3` (history line in each `lesson.config.js` header).

## Run status (2026-10-30, after entry 6)

Published and pushed on `dev`: entries 1–4 (`adad-ashri-mustaqim-mudarraj`, `adad-nisbiya-siyaqat`, `talim-mustaqim-mudarraj`, `bahth-adad-naqisa`), entry 5 `talim-fi-mustawi`, and **entry 6 `tatbiq-qaida-harfiya`** with their successor connections (`talim-mustaqim-mudarraj-2`, `hall-mushkil-muadala`, `talim-nuqta-mustawi`, `ikhtibar-musawat-mutabayina`, `qimat-ibara-harfiya`).
**Resume at card 7 `wadiya-idmajiya-adad-nisbiya` (synthesis U5, needs all of unit 5 — published) and card 8 `intaj-ibara-harfiya` (U6, `1am.m5.r09`, needs r08 — published).** Tips from the runs: build with
`NODE_OPTIONS=--max-old-space-size=8192 npx vite build` then `node scripts/analyze-entry-bundle.mjs --dist apps/web/dist --budget 212`
(the `check:entry-budget` script OOMs on its own 4 GB build); `buildLessonMemo.test.js` can time out under load and passes alone.
Open owner points: a `halfline`/`numberline` statement-figure kind is still missing; confirm the 2AM LP edges chosen for `hall-mushkil-muadala` (note 4), `talim-nuqta-mustawi` (note 5) and `ikhtibar-musawat-mutabayina` (note 6).
