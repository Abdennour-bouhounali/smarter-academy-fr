# Plan — `jidaa-adadayn-nisbiyayn` « جداء عددين نسبيين » (3AM unit 1, lesson 1 of 3 + synthesis)

## 1. Identity

- **Code** `jidaa-adadayn-nisbiyayn` · **title** « جداء عددين نسبيين » · **unit** `aadad-nisbiya` « الأعداد النسبية » · catalogue
  `order: 0` · `kind: lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/aadad-nisbiya/jidaa-adadayn-nisbiyayn/`.
- **Base path** `/courses/moyen/3am/ansab_al_aadad_wal_hisab/jidaa-adadayn-nisbiyayn`.
- **Textbook** (book pp. = PDF − 1): نشاط 1 p. 8 (PDF 9, the well), نشاط 2 p. 8 (the escalator, repeated addition), نشاط 3 p. 9
  (justification by distributivity + the (−7)×n table), معارف p. 10 « قاعدة الإشارات » and « حساب جداء عددين نسبيين » (with a × 0 = 0),
  طرائق p. 11 تمرين 1–2 + طريقة « لضرب عددين نسبيين », exercises 1–4, 6, 7, 8, 17, 19, 29, 34 (pp. 14–16), أؤكّد 1–5 (p. 17), أتعمّق
  37, 43 (p. 18), أستعدّ items 7, 10, 11, 14, 15 (p. 7).
- **Seeds the unit: YES** — `_unit/` and the whole-unit extraction (`docs/sources/3am/unit1/build-extraction.py` → `extraction.json`);
  see `README.md` (seeding, element ids, destinations, boundary block for the header).

## 2. Programme & net

- **Item** `3am.m1.r01` « حساب جداء عددين نسبيين. » (shared with `jidaa-ida-nisbiya`; boundary in README).
- **Draft الكفاءات** (catalogue, verbatim):
  1. حساب جداء عدد سالب في عدد موجب بالرجوع إلى معنى الضرب كجمع متكرر
  2. اكتشاف قاعدة الإشارات: جداء عددين نسبيين لهما نفس الإشارة موجب، ومختلفين في الإشارة سالب
  3. تبرير قاعدة إشارة جداء عددين سالبين باستعمال الخاصية التوزيعية
  4. حساب جداء عددين نسبيين بضرب المسافتين إلى الصفر وتطبيق قاعدة الإشارات
- **Proposed final wording** (order kept, LP ids `3am_jidaa-adadayn-nisbiyayn_P1…P4`):
  1. **P1** حساب جداء عدد سالب في عدد موجب بالرجوع إلى معنى الضرب كجمع متكرر، مثل $(-2)\times3=(-2)+(-2)+(-2)=-6$ — *example added (a
     measurable form)*.
  2. **P2** تعيين إشارة جداء عددين نسبيين بقاعدة الإشارات: يكون موجبًا إذا كان للعددين الإشارة نفسها، وسالبًا إذا اختلفت إشارتاهما — *« اكتشاف »
     is how it is learned, not what is assessed: an LP is a competence the test can measure*.
  3. **P3** تبرير إشارة جداء عددين سالبين بالخاصية التوزيعية، مثل $(-3)\times4+(-3)\times(-4)=(-3)\times0=0$ إذن $(-3)\times(-4)=12$ — *example
     added*.
  4. **P4** حساب جداء عددين نسبيين (صحيحين أو عشريين) بتعيين إشارته ثم ضرب المسافتين إلى الصفر، ومعرفة أنّ $a\times0=0$ — *a × 0 = 0 is in the
     book's « حساب جداء » box (p. 10) and had no LP; « صحيحين أو عشريين » fixes the scope (fractions are unit 2)*.
- **pointPrerequisites** (intra-lesson only): `P2 ← P1`, `P3 ← P2`, `P4 ← P2`. No cross-lesson edge: the net's prerequisite lesson
  `jam-tarh-nisbiya` (2AM) is `coming_soon` (LEARNING_NET §4.8).
- **Review items for « أستعدّ »** (`reviewLinksForLesson`): `2am.m4.r05` « جمع وطرح عددين نسبيين. » — home `jam-tarh-nisbiya` (2AM,
  `coming_soon`, shows « قريبًا »). **Extra** `priorKnowledge` measured (not net-linked, owner question 1 of README): `2am.m1.r03`
  « معرفة خاصة توزيع الضرب بالنسبة إلى الجمع والطرح واستعمالها. » (home `tawzi-darb-jam-tarh`, `coming_soon`) and the distance to zero
  (2AM `talim-mustaqim-mudarraj-2`, `coming_soon`). `priorKnowledge: ['jam-tarh-nisbi', 'tawzi-darb', 'masafa-sifr']`.
- **noRebuild**: none (`noRebuildForLesson` is empty). The 2AM addition rules are RECALLED in a « تذكّر — السنة الثانية » `TextbookBox
  kind="remark"` in معارف (`addition('prior_year_reminder')`, no link while unpublished), never rebuilt.
- **Where it serves later** (`forwardLinksForLesson`): `qismat-nisbiyayn` (r02), `amaliyat-natiqa` (r08), and the PUBLISHED
  `quwat-adad-nisbi` (3am.m3.r06), `nashr-jabri-3am` (3am.m5.r02), `musawiyat-amaliyat` (3am.m5.r05). 4AM through them:
  `amaliyat-judhur` / `tawzif-khawass-judhur` (signs under roots), `mutatabiqat-shahira`, `jidaa-maadum` (4am.m3.r03: a product is 0 iff a
  factor is 0 — the a × 0 = 0 of P4), `talis-hisab-atwal` (via r08).

## 3. Boundary

Owns: the product of TWO relative numbers (integers, decimals), P1–P4. Leaves: three or more factors, ×(−1) named as the opposite, the
square, distributivity as a computing tool → `jidaa-ida-nisbiya`; any division, « □ × b = a » blanks → `qismat-nisbiyayn`; fractions →
unit 2; aⁿ → `quwat-adad-nisbi`. Distributivity is used ONCE, as the ARGUMENT of P3 (with numbers), never taught as a technique here.

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| act-1 (p. 8) | A well dug to −6 m, then « 3 أضعاف » the depth; write two writings; the rule for different signs | neg × pos = repeated addition of the negative | **Application** in أتمرّن (E5), own context and numbers (a borehole at −8 m, three times as deep: (−8)+(−8)+(−8) = (−8)×3 = −24). Rejected as entry: it only reaches neg × pos, and q3 asks the rule from one case |
| act-2 (p. 8) | 90 escalator steps of −28,5 cm; E = (−3)+(−3)+(−3)+(−3) → (−3)×4; A–D as sums; « guess a method » | repeated addition → product, then the shortcut « multiply the distances » | **Application** in أتمرّن (E4): a pedestrian tunnel stair, 48 steps of −17 cm → (−17)×48 = −816 cm = −8,16 m |
| act-3 (p. 9) | S = 4,5×2,1 + (−4,5)×2,1 = 0 ⇒ (−4,5)×2,1 = −9,45; (−7)×(−9) via the (−7)×5…(−7)×0 table; (−1,5)×(−0,6) via A = (−1,5)×0,6 + (−1,5)×(−0,6) | **the** justification: k×b + k×(−b) = k×0 = 0, and the table that keeps decreasing by the same step | **Kept as the معارف track** (P3), own numbers: (−3)×4 + (−3)×(−4) = 0; table (−4)×3…(−4)×(−2) = −12, −8, −4, 0, 4, 8; decimals (−2,5)×(−0,4) = 1 |
| know-1 (p. 10) | sign rule box + 4 examples | the rule | **Named** in module 1 after q3 (own words, own examples: (−5)×(−4) = 20, 6×(−3) = −18) |
| know-2 (p. 10) | « 1) sign, 2) product of distances », a×0 = 0 | the two-step method | **طريقة** (module 3), own examples |
| method-1 ex 1–2 + طريقة (p. 11) | A = −3×7 = −21, B = −6×(−3,5) = 21 | the commented solution layout | **طريقة** worked example layout (own numbers: −6 × 7 = −42; −1,5 × (−8) = 12) |
| ex-1…ex-4 (p. 14) | compute 24 products (integers, decimals) | fluency | bank (adapted) + 6 in أتمرّن E1 |
| ex-6 (p. 14) | match equal products | contrast of signs/distances | أتمرّن E2 (own pairs) |
| ex-7, ex-8 (p. 14) | compute only the positive / only the negative products | sign before computing | bank (adapted) |
| ex-17 (p. 15) | two relatives with product 32, −28, −0,25, 4,9 | inverse thinking without division | أتمرّن E7 (own targets) |
| ex-19 (p. 15) | 7,5×0,2 then the 4 signed versions | one distance, four signs | bank (adapted) |
| ex-29 (p. 16) | complete with the sign | the sign rule backwards | أتمرّن E3 |
| ex-34 (p. 16) | the multiple of 6 that precedes / follows (12, −6, 120, −42 / 18, −30, 48, −54) | multiples 6 × k with k relative | bank (adapted; keys 6, −12, 114, −48 / 24, −24, 54, −48) |
| self-1…5 (p. 17) | QCM: (−3)×(−7), 3×(−4), (−4)×4, 8,1×(−3,2), product of the opposites of 6 and 7 | quick checks | test items and bank (redesigned numbers) |
| deep-37 (p. 18) | two relatives: product +/−, sum +/− (4 cases) | product sign vs sum sign (2AM rule) contrast | أتمرّن E8 |
| deep-43 (p. 18) | true/false: double of a negative; sum zero ⇒ opposites; product bigger than each | counter-examples | أتمرّن E6 (a, c only; b is 2AM) |
| prep 7, 10, 11, 14, 15 (p. 7) | sums and differences of relatives | the 2AM base | « أستعدّ » statements, rewritten |

## 5. Design

**The lesson in one paragraph.** A product of two relative numbers has a SIGN and a DISTANCE to zero that are decided separately: the
distance is the product of the distances, the sign is « + » when the two factors have the same sign and « − » when they differ. The
student must discover that a negative times a negative is POSITIVE — the one result that cannot come from « repeated addition » — and
see why it must be so: if (−3) × (−4) were negative, then (−3) × 4 + (−3) × (−4) would not be (−3) × 0 = 0.

**Entry point.** Candidates:
- (a) The book's well (act-1): only neg × pos; the rule is asked after ONE case. Rejected as entry (application in أتمرّن).
- (b) The book's (−7) × n table (act-3 ②): neg × neg appears as a pattern continuation; good as an ARGUMENT, but answered with the pen,
  nothing for the hand. Kept in معارف.
- (c) **Chosen — a security-camera replay of an elevator.** An elevator moves at a constant signed speed r (floors per minute) and
  passes the ground floor at time 0; its floor at time t is r × t. Time AFTER the passage is positive, time BEFORE is negative. For
  « where was it 2 minutes before it passed the ground floor, going DOWN 2 floors a minute? » the hand must rewind the video into
  negative time and the cabin appears ABOVE the street: (−2) × (−2) = +4 becomes a fact of the world before it is a rule. All four sign
  cases live in one honest model (speed × time = displacement, already known for positive numbers).

**Order of ideas.** neg × pos as jumps of r (P1) → the surprise: rewinding a descending elevator lifts it (neg × neg) → the four
records → sign rule (P2) → معارف: why it must be so (distributivity, then the table) (P3) → طريقة: sign first, then distances, decimals,
× 0 (P4) → أتمرّن (the book's well and escalator redesigned) → three مسائل → test.

**Story contexts** (own, Algerian daily life): the freight elevator of a shopping centre in Bab Ezzouar with three parking levels
(−1, −2, −3) and the replay screen of the security room (KidFigure « ياسين » and « سلمى » on a school visit); a winter night in Sétif
(temperature falling 2 °C an hour); a school quiz (+3 / −2); the school cooperative's internet subscription (−350 DA a month).

## 6. Lab — `elevator-reel` « شريط المصعد »

> **Revised 2026-10-27 (four-voice council on the live lab, then the owner).** As implemented the lab printed `(−2) × (−1) = 2` on every
> stop, so the sign rule was read before the module asked for it, and مبتدئ could be solved by trying the seven times. Now: no product
> before the discovery (a stop on the wrong side of the street asks « قبل مروره بالطابق 0 أم بعده؟ »), a مبتدئ prediction `p1` (where was
> the descending elevator one minute BEFORE its passage — cards `2 · −2 · −3 · −1`) between `m1` and `m2`, a « ▶ شغّل التسجيل » film once
> the predictions are answered, the signed speed as its own card (owner: « the speed is very important — make it clear »), the coach
> above the controls, and the game screen (`immersive`: the lab fills the laptop). Contract: MANIPULATION_CONTRACT §2septentricies.

- **Type** `elevator-reel` (free in `manipulationRegistry.js`; declare it in `packages/core/curriculum/manipulationTypes.js`), theme
  `mallElevator` in `VISUAL_THEMES` (« مصعد مركز تجاري: طوابق فوق الشارع وطوابق مرآب تحته، وشاشة إعادة تسجيل كاميرا المراقبة »).
  Files: `manipulations/operations/ElevatorReel.jsx` (+ `operations/elevatorReel/`), `manipulations/logic/elevatorReel.js` (+ test),
  `operations/elevatorReel.render.test.jsx`, levels preset in `levels.js`, strings in `lesson.manipulation.json › elevatorReel`, a new
  `MANIPULATION_CONTRACT.md` §2… section (next free number) and a row in `MANIPULATION_DNA.md` §15.
- **Drawn world.** A cross-section of a building, inline SVG with depth: floors +1 … +9 above the street (shop windows, a café), the
  street line labelled « الطابق 0 », parking levels −1 … −9 below (cars, pillars, the signed number painted on each level's wall). A glass
  freight elevator in its shaft. Beside it, the security room's monitor showing the same cabin, and under the monitor the replay
  timeline. A small direction-speed badge on the cabin (an arrow ↑/↓ with « 2 طابق/د »). KidFigure « سلمى » (hijab + tunic) and
  « ياسين » stand at the monitor and react (`wonder` when the cabin goes above street level in negative time, `proud` on success) —
  never carrying information. Floor height budgeted from the viewport (`useLessonViewport`, min 20 px; 19 levels).
- **The variable in the hand.** The signed TIME t (minutes, 0 = the moment the cabin passes the ground floor; negative = before) —
  a big round knob on the replay timeline (`role="slider"`, ←/→ by one step, Home/End, tap a tick; the drag previews, the RELEASE is the
  trial, MANIPULATION_CONTRACT §2octovicies pattern) and a `StepperCard` −/+ under it. At متقدم the hand ALSO holds the signed speed r:
  a two-position lever « يصعد / ينزل » (sign) and a −/+ stepper « طابق في الدقيقة » (1…3). Every gesture is an answer: not eligible
  for auto-complete (§6bis).
- **What the world shows** (never the rule): the cabin at floor r × t; the displacement drawn as |t| stacked arrows of r floors each
  (repeated addition: each whole minute = one arrow of 2 floors), solid when t > 0 (the path travelled since passing 0), dashed when
  t < 0 (the path the cabin still HAS to travel to reach 0 — so the cabin sits on the other side); half minutes draw a half arrow. The
  floor pill « الطابق −6 » and, after a validated stop, the calculation « $(-2)\times3=-6$ » in an LTR island. The « سجلّ الكاميرا »
  (record table: السرعة r · الزمن t · الطابق) fills one row per solved mission.
- **Opening (no title, DNA §17.9).** Context: « مصعد الشحن في المركز التجاري ينزل بانتظام طابقين في كل دقيقة، ومرّ بالطابق الأرضي (0) عند
  الدقيقة 0. » Question: « أعِد تشغيل التسجيل وأوقفه عند اللحظة التي يكون فيها المصعد في الطابق المطلوب. » (the mission line names the
  floor: « المطلوب: الطابق −6 »).
- **مبتدئ** (r fixed, t ∈ [−3, 3] step 1), four missions, each ends when the released knob puts the cabin on the asked floor:
  - m1 r = −2, floor −6 → t = 3 ((−2)+(−2)+(−2) = (−2) × 3 = −6);
  - m2 r = −2, floor 4 → t = −2 (the surprise: (−2) × (−2) = 4);
  - m3 r = +3 (« مصعد الزبائن يصعد 3 طوابق في الدقيقة »), floor 6 → t = 2;
  - m4 r = +3, floor −9 → t = −3 ((+3) × (−3) = −9).
  A wrong stop is a refused trial with the calculation (MANIPULATION_CONTRACT « Verdicts say the CALCULATION »): « عند الدقيقة 2:
  $(-2)\times2=-4$ ، المصعد في الطابق −4 لا في الطابق 4 ». End state: the four records written.
- **متقدم** (hand holds r and t; t step 0.5; NO stacked arrows until release; a prediction before a1):
  - a1 prediction: r = −3, t = −2 — « في أي طابق كان المصعد؟ » cards `6` · `−6` · `−5` · `1` (keys: 6; −6 = MISC-JIDAA-NEGNEG, −5 =
    MISC-JIDAA-ADD, 1 = MISC-JIDAA-SUB); then scrub to verify;
  - a2 « اجعل المصعد في الطابق −6 بطريقتين: مرّة وهو يصعد ومرّة وهو ينزل » → (r, t) ∈ {(2, −3), (3, −2)} and {(−2, 3), (−3, 2)};
  - a3 r = −2, floor 3 → t = −1,5;
  - a4 r = +2, floor −5 → t = −2,5.
  End state: a1–a4 solved.
- **« جرّب أعدادك »** (always open, DNA owner rule): the student types r (integer −3…3, 0 allowed: the cabin never moves — a × 0 = 0
  appears for free) and t (−3…3, step 0,5); the world plays it; |r × t| ≤ 9 guaranteed by the limits.
- **LabCoach** (`coachOf`, pure, tested to the end of every task; MANIPULATION_CONTRACT §8quater): ① knob — « اسحب مؤشّر التسجيل لتعيد
  المصعد إلى لحظة أخرى. » ② the left half of the timeline (first time t < 0 is reachable) — « يسار الصفر: لحظات قبل مروره بالطابق
  الأرضي. » ③ (متقدم) lever + stepper — « اختر هنا اتجاه المصعد وسرعته. » ④ (متقدم a1) cards — « اختر توقّعك قبل أن تحرّك التسجيل. »
- **Wrong moves made visible**: NEGNEG (expecting a negative floor in negative time with a descending cabin: the cabin is drawn above
  the street), ADD (−3 + −2: the five-floor answer is not where the cabin is), TIME-DIRECTION (thinking « before » = « lower »: the dashed
  arrows show the path still to travel), SIGN-OF-LARGER (the 2AM addition rule « sign of the farther number »: m1 (−2) × 3 is negative
  although 3 is farther).
- **Core maths**: `relativeOps.js` (README) — `times`, `productSign`, `repeatedSum`, `distributeCheck`, `parseRel`, `relText`, `relTex`.
  Lab logic `logic/elevatorReel.js`: `floorAt(r, t)`, `arrowsOf(r, t)` → `[{ from, to, dashed, half }]`, `timeFor(r, floor, step)` (the
  unique t on the rail or null), `judge(mission, r, t)` → `{ ok, floor, calc }`, `missionsOf(level)`, `coachOf(state)`.
- **Why not another lab (DNA §12).** `zero-probe` (2AM): the hand holds a DISTANCE on a cable under the sea, the side is a switch,
  nothing is multiplied. `power-train` (3AM): the hand holds an EXPONENT, the factors are all equal, the world is a train from 1.
  `equality-lanes`: two runners on one graduation receiving the same operation. Here the hand holds a FACTOR that is TIME, signed, on a
  replay scrubber; the world is vertical and kinematic (displacement = speed × time); the resistance is the cabin's position — neg × neg
  is forced by rewinding a descending cabin.
- **Screen budget.** 1024×768 (lesson column ~700 px): tower 300 px wide on the right (RTL: tower at the start side), monitor + timeline +
  record table in a 360 px column; floor height ≥ 20 px. 768×1024: tower above (height ~470 px), timeline full width below, record
  table under it; the « جرّب أعدادك » panel stays open under the record (no fold). Screenshots at 768×1024, 1024×768, 1280×800, 1366×768:
  initial, m2 refusal, m2 success, a1 prediction, formal phase.

## 7. Modules (9)

`durationMinutes` = 6 + 14 + 12 + 10 + 12 + 8 = **62** (without مسائل); with the three مسائل (3 × 8) the lesson is 86 min ≤ 90.

**00 أستعدّ** — `objectives`: « أتحقّق من جمع الأعداد النسبية وطرحها ومن خاصية التوزيع قبل أن أضربها. » Seven true/false statements
(`PrerequisiteDiagnostic`):
1. $(-7)+(-5)=-12$ → صحيح (2am.m4.r05).
2. $(-9)+4=5$ → خطأ (−5).
3. $3-(-8)=11$ → صحيح.
4. $(-6)-(-6)=-12$ → خطأ (0).
5. $(-4)+(-4)+(-4)=-12$ → صحيح (prepares P1).
6. $5\times(2+3)=5\times2+5\times3$ → صحيح (2am.m1.r03).
7. « المسافة إلى الصفر للعدد $-3{,}5$ هي $-3{,}5$ » → خطأ (3,5).

**01 نشاط — شريط المصعد** — `objectives`: « أكتشف إشارة جداء عددين نسبيين بإعادة تشغيل تسجيل مصعد إلى الأمام وإلى الخلف. » Lab at the
top (both levels, no brief, no workspace title/lead). Then, each after an evidence line (`onTrial` → `[data-activity-evidence]`):
- q1 (m1) « في سجلّك: المصعد ينزل طابقين في كل دقيقة، وبعد 3 دقائق صار في الطابق −6. أيّ كتابة تصف نزوله؟ » choices:
  $(-2)+(-2)+(-2)=(-2)\times3=-6$ ✓ · $(-2)+3=1$ · $2\times3=6$ · $(-3)\times(-2)=-6$. → brick P1.
- q2 (m2) « قبل دقيقتين من مروره بالطابق الأرضي كان المصعد النازل في الطابق 4. اكتب إذن قيمة $(-2)\times(-2)$. » numeric → 4.
- « أتوقّع القاعدة » (§14.3ter): « متى يكون جداء عددين نسبيين موجبًا؟ متى يكون سالبًا؟ » (free text, then reveal).
- q3 (the record table) « في أيّ صفوف سجلّك كان الطابق موجبًا؟ ماذا تلاحظ على إشارتي السرعة والزمن فيها؟ » choices: « لهما الإشارة
  نفسها » ✓ · « الزمن موجب » · « السرعة موجبة » · « مسافة الزمن إلى الصفر أكبر ». → brick P2, then the box naming the sign rule (know-1
  rewritten; examples (−5)×(−4) = 20, 6×(−3) = −18).
- q4 (no lab) « مصعد ينزل 3 طوابق في الدقيقة. أين كان قبل 3 دقائق من مروره بالطابق الأرضي؟ » numeric → 9.

**02 معارف — لماذا يكون جداء سالبين موجبًا؟** — `objectives`: « أبرّر بخاصية التوزيع أنّ جداء عددين سالبين موجب. » **Since 2026-10-27 (owner
request) the track opens on a lab**: `sign-machine` « آلة الجداءات » (MANIPULATION_CONTRACT § 2septentricies-bis) — the act-3 table made
manipulable: the machine carries −3, the hand lowers the second factor from 4 to −4 and each product lights as a column above or below 0
(« +3 » between neighbours); the negative side is locked until (−3) × (−1) is predicted; متقدم (a = −4) also flips the first factor's sign. A new
q0 asks what the student SAW (« كلّما نقص العامل الثاني بـ 1 في آلتك، بكم زاد الجداء؟ » → 3, with the student's columns), then the questions below
follow unchanged (renumbered 2–6; the (−4) × n table is now a transfer off the machine). Module time 12 → 16 min, lesson 86 → 90 min.
- q1 « احسب $(-3)\times4$ » → −12.
- q2 « أكمل: $(-3)\times4+(-3)\times(-4)=(-3)\times(4+(-4))=(-3)\times0=\;?$ » → 0.
- q3 « إذن $-12+(-3)\times(-4)=0$. ما العدد الذي إذا أُضيف إلى $-12$ أعطى 0؟ » → 12, so $(-3)\times(-4)=12$. → brick P3.
- q4 (the table, act-3 redesigned) rows $(-4)\times3=-12$, $(-4)\times2=-8$, $(-4)\times1=-4$, $(-4)\times0=0$: « كلّما نقص العامل الثاني
  بـ 1 زاد الجداء بـ 4. أكمل: $(-4)\times(-1)$ و $(-4)\times(-2)$ » → 4 and 8.
- q5 (decimals) « $(-2{,}5)\times0{,}4=-1$. استعمل الطريقة نفسها لتجد $(-2{,}5)\times(-0{,}4)$ » → 1.
- Then « تذكّر — السنة الثانية » box (sums of relatives), the property box (sign rule + justification, rewritten), and the knowledge-map
  node.

**03 طريقة — أحسب جداء عددين نسبيين** — `objectives`: « أحسب جداء عددين نسبيين: أعيّن الإشارة أوّلًا ثم أضرب المسافتين. » Steps (a sign tap
« + / − », then the distance product typed): $(-6)\times7=-42$; $(-1{,}5)\times(-8)=12$; $0{,}25\times(-36)=-9$; $(-0{,}3)\times(-0{,}2)=0{,}06$
(MISC-JIDAA-DECIMAL: 0,6); $(-12)\times0=0$ → brick P4 + method box (know-2 + method-1 rewritten).

**04 أتمرّن** — `objectives`: « أطبّق قاعدة الإشارات في حسابات وسياقات متنوعة. » `brief` allowed (« ثمانية تمارين… »). Exercises (own
numbers; keys computed):
- E1 compute: $(-8)\times5=-40$, $(-7)\times(-6)=42$, $9\times(-0{,}5)=-4{,}5$, $(-2{,}5)\times(-4)=10$, $(-0{,}3)\times0{,}2=-0{,}06$,
  $(-1{,}2)\times(-1{,}5)=1{,}8$.
- E2 match equal products: $15\times(-2)$ ↔ $(-6)\times5$ (−30); $(-0{,}5)\times(-8)$ ↔ $2\times2$ (4); $(-3)\times(-4)$ ↔ $0{,}5\times24$ (12);
  $(-1{,}5)\times4$ ↔ $3\times(-2)$ (−6).
- E3 complete the sign: $(-5)\times(\square9)=45$ → −; $(\square4)\times7=-28$ → −; $(-2{,}5)\times(\square2)=-5$ → +.
- E4 (act-2 redesigned) « درج نفق الراجلين في ساحة الشهداء فيه 48 درجة، وكل درجة تنزل 17 cm » → $(-17)\times48=-816$ cm, i.e. −8,16 m.
- E5 (act-1 redesigned) « حفر أوّل إلى عمق 8 m ، ثم وجب بلوغ عمق يساوي 3 أضعافه » → $(-8)+(-8)+(-8)=(-8)\times3=-24$ m.
- E6 true/false: « ضعف عدد سالب سالب » ✓; « جداء عددين نسبيين أكبر دائمًا من كلّ منهما » ✗ (e.g. $(-3)\times2=-6$).
- E7 « أعطِ عددين نسبيين سالبين جداؤهما 24 » (open; accepted if both negative and product 24, e.g. −4 and −6); « عددين جداؤهما −36
  ومجموعهما 0 » → 6 and −6.
- E8 (deep-37) « عددان جداؤهما سالب ومجموعهما موجب » (open; checked: product < 0, sum > 0, e.g. 5 and −2).

**05 مسألة 1 — ليلة شتوية في سطيف** (lessonProblem, shown from the summary) — `objectives`: « أوظّف جداء عددين نسبيين لأتتبّع درجة الحرارة
قبل لحظة معلومة وبعدها. » « تنخفض درجة الحرارة بانتظام 2°C في كل ساعة، وكانت 0°C عند منتصف الليل. » 1) at 4:00 → $(-2)\times4=-8$ °C;
2) at 21:00 (3 hours BEFORE) → $(-2)\times(-3)=6$ °C; 3) « في أيّ ساعة كانت 5°C؟ » choices 21:30 ✓ ($(-2)\times(-2{,}5)=5$) · 02:30 ·
22:00 · 19:00 — each checked by a product (no division taught).

**06 مسألة 2 — مسابقة الأسئلة** — `objectives`: « أحسب نقاطًا موجبة وسالبة وأفسّر حذف نقطة سالبة. » « +3 لكل إجابة صحيحة و −2 لكل
إجابة خاطئة. » 1) سلمى: 6 correct, 4 wrong → $6\times3+4\times(-2)=18-8=10$; 2) ياسين: 5 and 5 → 15 − 10 = 5; 3) « ألغت اللجنة إجابتين
خاطئتين لياسين (سؤال ملغى). كيف تتغيّر نقطته؟ » → $(-2)\times(-2)=+4$, new score 9.

**07 مسألة 3 — اشتراك تعاونية المدرسة** — `objectives`: « أعبّر بجداء عن تغيّرات رصيد في الماضي وفي المستقبل. » « تدفع التعاونية
350 DA في كل شهر لاشتراك الإنترنت؛ نعتبر رصيدها اليوم مرجعًا (0). » 1) change in 3 months → $(-350)\times3=-1050$ DA; 2) « كم كان رصيدها
مقارنة باليوم قبل 4 أشهر؟ » → $(-350)\times(-4)=1400$ DA more; 3) « بعد كم شهر يصبح التغيّر −2450 DA؟ » choices 7 ✓ (checked
$(-350)\times7=-2450$) · −7 · 6 · 8.

**08 إختبار أولي** (5 items, keys and misconception distractors):
1. $(-9)\times(-4)$ → **36**; −36 (NEGNEG), −13 (ADD), 13.
2. $7\times(-0{,}6)$ → **−4,2**; 4,2 (SIGN), −42 (DECIMAL), 6,4 (ADD).
3. « جداء عددين نسبيين موجب، إذن… » → **« لهما الإشارة نفسها »**; « كلاهما موجب » (PARTIAL), « أحدهما سالب », « أحدهما أبعد عن الصفر ».
4. $(-5)\times3+(-5)\times(-3)$ → **0**; −30 (NEGNEG), 30, −15.
5. « ينزل مصعد 4 طوابق في الدقيقة ويمرّ الآن بالطابق الأرضي. أين كان قبل دقيقتين؟ » → **الطابق 8**; −8 (TIME-DIRECTION), −2, 2.

## 8. Misconceptions (`MISC-JIDAA-*`, in `content/practice/misconceptions.json`)

| Id | Wrong belief | Where the lab shows it | Caught by |
|---|---|---|---|
| `MISC-JIDAA-NEGNEG` | (−) × (−) = (−) | m2 / a1: the cabin is above the street | test 1, 4; bank L1–L3 |
| `MISC-JIDAA-ADD` | multiplying = adding ((−3)×(−2) = −5) | a1 card −5; the floor is elsewhere | test 1, 2; E1 |
| `MISC-JIDAA-SUB` | (−3)×(−2) = 1 (subtracting distances) | a1 card 1 | bank L1 |
| `MISC-JIDAA-LARGER` | sign of the factor farther from 0 (the 2AM addition rule) | m1: (−2)×3 is negative | E2, bank L2 |
| `MISC-JIDAA-TIME` | « before » means « lower » | dashed arrows, m2 | test 5, مسألة 1 |
| `MISC-JIDAA-DECIMAL` | (−0,3)×(−0,2) = 0,6 | — (طريقة) | test 2, E1, bank |
| `MISC-JIDAA-PARTIAL` | positive product ⇒ both positive | record table (m2 row) | test 3, E7 |

## 9. Practice bank — `content/practice/3am/jidaa-adadayn-nisbiyayn/` (5 levels × 10 sheets)

- **Corpus candidates** (term 1, badge « على منوال اختبار الفصل الأول »):
  - `3am-s1-110` ex 1 — A = (−2)×(+4) = −8, B = (−6)×(−2) = 12, C = (+9)×(+3) = 27 (D = (−2)×(−3)×(+7)÷(+2) = 21 → `counted: false`, L3);
  - `3am-s1-2` ex 6 (model 7) — A = (−7)×(−11) = 77 (B with ÷, C with 6 factors → `counted: false`);
  - `3am-s1-2` ex 3 (model 5) — only its two-factor partial products are L1; mostly L2/L3;
  - `3am-s1-1` ex 1 — A = (−2)(+5)(−3)(+4)(−1) = −120 is L2; its two-factor first steps can be a modelled sheet.
- **Honest count of FAITHFUL `term_exam` sheets: 3–4** (`3am-s1-110` ex 1 twice with its own numbers kept in one sheet and a second
  one modelled closely, `3am-s1-2` ex 6, `3am-s1-2` ex 3). The rest: ~30 `term_exam_modelled` (`modelledOn: "3am-s1"`) and ~16 `adapted`
  (one per textbook element L1 cites but does not show: ex-1…4, 6, 7, 8, 17, 19, 29, 34, self-1…5, deep-37, 43).
- **Per level**: L1 sign only (« إشارة الجداء ») and integer products of two; L2 decimals and « complete the sign »; L3 contexts (elevator,
  temperatures, scores — modelled); L4 justification steps (« أكمل بالتوزيع … = 0 ») and the (−a)×n table; L5 term-exam sheets (110, s1-2).
- **Oracle** `scripts/practice-oracle/jidaa-adadayn-nisbiyayn.mjs` (+ import in `scripts/practice-answer-oracle.test.mjs`): parses each
  statement's product with its own BigInt-fraction code (no float), recomputes every `rational` key and every `choice` option; a sign
  question's key is recomputed from the parsed factors.

## 10. Risks & owner questions

1. Net: `2am.m1.r03` (distributivity) is measured as an extra review item but has no net link to `3am.m1.r01` (README question 1).
2. P4 adds « $a\times0=0$ »; the book's special cases (×(−1), ×0) p. 11 are placed in L2's طريقة — the zero rule is TAUGHT here
   (know-2) and only practised there. Confirm.
3. The elevator « 2 floors per minute » is slow for a real elevator: the story calls it « مصعد الشحن » (freight). Accept, or switch to
   a construction hoist?
4. The unit challenge text in `units_3am › aadad-nisbiya.challenge.textAr` is the book's verbatim text; should it be rewritten in the
   platform's words (as `tanasubiya-sura` was) when `challenge.sourceElementId` is set by L2?

## 11. Generator checklist

- Seed `_unit/` + whole-unit extraction (README); `npm run check:textbook` green with L2/L3/synthesis destinations « pending ».
- `relativeOps.js` + `relativeOps.test.js` (L1 functions; exact, no float); import by path.
- Lab: `elevator-reel` type + theme + registry + `levels.js` preset (both levels carry the SAME `objective` string) + logic test
  (`elevatorReel.test.js`: every mission solvable on the rail, `timeFor` unique, refusals carry the calculation, `coachOf` followed to the
  end of every task) + render test (`elevatorReel.render.test.jsx`: opens on its CONTEXT then ONE question; says each thing ONCE; no
  title; keyboard path) + screenshots at four sizes reviewed and iterated (§17.8).
- Lesson folder per guide §14 (lesson.config.js header with the entry decision, the rejected candidates and the order of ideas;
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'mallElevator' }`); `content/content.test.js`
  re-computes every key with its own arithmetic; `prepDiagnostic` test; knowledge map progressive.
- e2e `apps/web/e2e/lesson-kit/3am-aadad-nisbiya-jidaa-adadayn-nisbiyayn.mjs` (no `[data-module-brief]` above the lab, lab before the
  first question, bricks hidden before their answer, coach step id); add a block to `e2e/lesson-kit/lab-coach.mjs`.
- `npm run validate:lessons`, `npm run generate:lesson-index`, `npm run check:lessons`, `npm test`, entry budget unchanged.
- Catalogue: final `pointsToLearn`, `pointPrerequisites` (intra only), `durationMinutes: 62`, `difficulty: 'متوسط'`, `icon: '🛗'`, status
  `available` — by the coordinator at publish (guide §11: export/import, local DB modules + exercises `published`, generate:learning-net,
  commit, fast-forward `dev`, push).


## 12. Generator notes (2026-10-26)

Deviations from this plan, each minimal and recorded:

1. **« أستعدّ » statements.** Seven statements, but the textbook rewrites are prep 14, 11, 7 and 10 (not 14, 11 only): (−7)+(−5)=−12 ✓, 3−(−8)=11 ✓, the temperature fall from −2 °C to −10 °C « rose by 8 » ✗, the kitchen / freezer gap « 11 °C » ✗ (47), then the three platform items (−4 three times = −12 ✓, 5×(2+3) distributivity ✓, « the distance to zero of −3,5 is −3,5 » ✗). The plan's (−9)+4 and (−6)−(−6) statements were replaced by the two textbook temperature items (they measure the same `2am.m4.r05` skill and cite `prep` honestly). Skills `jam` / `tawzi` / `masafa` map to `priorKnowledge` `jam-tarh-nisbi` / `tawzi-darb` / `masafa-sifr`.
2. **Module 1.** The stand-alone « أتوقّع القاعدة » between q2 and q3 is the `predictPrompt` of the brick `ishara-jidaa` placed after q3 (the rule is written once, after the student has read his record). q2 is a typed number, q4 a typed number, q1 and q3 are choices, as planned.
3. **Lab.** (a) The speed lever / −/+ exist only in the `both` mission (a2): in a1, a3, a4 the speed is imposed by the story and shown on the monitor — otherwise the floor would not fix t. (b) At متقدم a1 the timeline and −/+ are not mounted until the card is answered (a disabled copy cost ~230 px and hid nothing useful). (c) The lab's discovery asks the DISTANCE (`|r × t| = |r| × |t|`) rather than the signs, so that the module's q3 (the signs) is not asked twice (« say it once »). (d) Theme `mallElevator` and the type were declared exactly as planned; the contract section is `2septentricies` (`2sextricies` was taken by `gear-crank` the day before).
4. **Final test.** `validate:lessons --strict` requires an assessment item per الكفاءة: P1 had none, so item 1 became « ينزل مصعد 4 طوابق في كل دقيقة… أين بعد 5 دقائق؟ » → −20 (distractors 20 SIGN, 1 ADD, −9 SUB) and the plan's (−9)×(−4) item is not in the test (neg × neg is tested by item 5, the elevator before, and by the bank). Item 3 (« جداء موجب إذن… », PARTIAL) is kept as planned.
5. **أتمرّن.** Nine steps (E7 split into a typed number and a choice, deep-37 as a choice); « ضعف عدد سالب » ✓, « جداء … أكبر دائمًا » ✗, « (−4)×(−4) موجب » ✓ (the plan's b-statement is 2AM).
6. **Extraction.** `opener` is destined to the synthesis (module `None`) instead of `unit`/`page`, as units 3 and 6 do, because `check:textbook` requires unit-level content to cite an element destined to `unit`.
7. **Bank.** `term_exam` sheets keep the corpus numbers when only two-factor steps are counted; the contract says « no word-for-word copy » — see the report's open points. The 4 `selfCheck` steps are justifications.
8. **Not run.** `node apps/web/e2e/lesson-route-boundary.mjs` needs the API (login), which was down; the lesson e2e ran with `QA_STUB=1` (API simulated).
