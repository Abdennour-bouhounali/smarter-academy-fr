# Plan — `hasr-adad-ushri` « حصر عدد عشري موجب » (3AM unit 5, lesson 2 of the remaining 3)

Every number in this plan was recomputed exactly while planning (Decimal with ROUND_HALF_UP, Fraction). Every Arabic string is final and the
platform's own.

---

## 1. Identity

| | |
|---|---|
| Code | `hasr-adad-ushri` |
| Title | « حصر عدد عشري موجب » |
| Unit | `musawiyat-mutabayinat` (3AM unit 5) |
| Catalogue | `lessons_3am_2026_2027.json`, order 22, `kind: lesson`, `coming_soon` |
| Folder | `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-mutabayinat/hasr-adad-ushri/` |
| Book pages | book = pdf: activity p. 73 (نشاط 3 « حصر عدد عشري موجب »), معارف p. 76 (§3), طرائق p. 77 (« حصر عدد عشري موجب » + دوري الآن 1), exercises p. 79 (20, 21, 22, 25, 28) and p. 83 (62), أؤكّد p. 81 (5), أستعدّ p. 71 (13, 14, 15) |
| Seeds the unit? | No. Generated AFTER `mutabayinat-amaliyat`, whose properties it uses. |

**Extraction elements destined here** (after the README re-routing): `prep` items 13, 14, 15 · `act-3` · `know-3` · `method-3` · `now-77-1` ·
`ex-20`, `ex-21`, `ex-22`, `ex-25`, `ex-28`, `ex-62` · `self-5`. The elements `ex-19`, `ex-23`, `ex-24`, `ex-26`, `ex-27` have moved to
`mutabayinat-amaliyat`.

**Readings to fix** (re-read at 200 dpi; set `verified: True`):
- `now-77-1`: « 8,34 is the rounding of a to 0,01. Can a be 8,342? 8,336? 8,345? ». Keys: 8,342 → 8,34 ✓ ; 8,336 → 8,34 ✓ ; 8,345 → 8,35 ✗.
  The extraction's `answer` says 8,336 false and 8,345 true: BOTH are wrong. Correct them and record the discrepancy. Bracket 8,335 ≤ a < 8,345.
- `know-3`: 14,5 ≤ x < 15,5 for the rounding 15 to the unit ; 3,647 → 4 / 3,6 / 3,65, with brackets 3 ≤ 3,647 < 4, 3,6 ≤ 3,647 < 3,7,
  3,64 ≤ 3,647 < 3,65 (as printed). Number-line figure: 14,5 · 15 · 15,5.
- `ex-28`: h rounds to 5,41 → 5,405 ≤ h < 5,415. V = 5 × 3 × h = 15h → 81,075 ≤ V < 81,225.
- `ex-62`: P = 2π × 2,5 = 5π ; 3,14 < π < 3,15 ⟹ 15,7 < P < 15,75.

## 2. Programme & net

**programmeItems:** `3am.m5.x1`, « حصر عدد موجب مكتوب في الشكل العشري باستعمال التدوير إلى رتبة معيّنة. » (origin `manhaj-2016`).

**Draft الكفاءات (verbatim):**
1. حصر عدد عشري موجب بين عددين طبيعيين متتاليين
2. إعطاء القيمة المقرّبة بالنقصان وبالزيادة إلى $\frac{1}{10}$ أو $\frac{1}{100}$ أو $\frac{1}{1000}$
3. تعيين مدوّر عدد عشري إلى رتبة معيّنة
4. حصر حاصل قسمة باستعمال الآلة الحاسبة

**Proposed final wording** (order kept):

| LP | Final | Change and why |
|---|---|---|
| P1 | حصر عدد عشري موجب بين عددين طبيعيين متتاليين، وتسمية طرفي الحصر قيمتين مقرّبتين إلى الوحدة بالنقصان وبالزيادة | Sharpened only. 1AM items `1am.m3.r04` and `1am.m3.r05` and 2AM `2am.m1.r06` already cover this, so the lesson RECALLS and uses it (no-duplication), it does not rebuild it. |
| P2 | إعطاء القيمتين المقرّبتين بالنقصان وبالزيادة إلى $\frac{1}{10}$ أو $\frac{1}{100}$ أو $\frac{1}{1000}$ لعدد عشري موجب، وحصره بهما (مثل $4{,}6 \le 4{,}679 < 4{,}7$) | Adds « وحصره بهما ». This is the use the item asks for. It is a 2AM item (`2am.m1.r05`), consolidated here. |
| P3 | تعيين مدوّر عدد عشري موجب إلى رتبة معيّنة (أقرب القيمتين المقرّبتين)، وحصر عدد عُلم مدوّره: مدوّره إلى $0{,}1$ هو $10{,}7$ يعني $10{,}65 \le x < 10{,}75$ | **Adds the inverse.** That is the programme item's own words (« حصر … باستعمال التدوير »), the book's know-3, act-3 1) and now-77-1, and the net's `addedValueAr` (« التدوير إلى أيّ رتبة واستعماله لحصر عدد موجب »). The draft missed it. It is the heart of the lesson. |
| P4 | حصر حاصل قسمة إلى رتبة معيّنة بقراءة شاشة الآلة الحاسبة، وتعيين مدوّره | Adds « وتعيين مدوّره » (act-3 2), prep 13–15, self-5). |

**Review items for « أستعدّ »:**

| Item | Text | Home lesson | Status |
|---|---|---|---|
| `1am.m3.r05` (`extends`) | تدوير عدد عشري إلى الوحدة. | `hasr-qiyam-muqarraba` (1AM) | coming_soon, planned |

Also measured, outside the net:
- the approximations of a quotient to 0,01, `2am.m1.r05` (2AM `kasr-hasil-qisma`, planned): there is no net link, README Q1;
- the previous sibling's ×positive property (`3am_mutabayinat-amaliyat_P2`, published before this lesson).

**noRebuild:** `1am.m3.r05`, `extends`, added value « التدوير إلى أيّ رتبة واستعماله لحصر عدد موجب ».
- معارف opens on « تذكّر — السنة الأولى » (`TextbookBox kind="remark"`, `addition('prior_year_reminder')`, link
  `getLessonPath('hasr-qiyam-muqarraba')`, null while unpublished). It recalls the bracket between integers and the rounding to the unit.
- The lesson builds only the rounding at ANY rank and the bracket FROM a rounding.

**pointPrerequisites:**
- intra-lesson: P2 ← P1 ; P3 ← P2 ; P4 ← P2, P3;
- no cross-lesson edge: the base lesson is unpublished, and `mutabayinat-amaliyat` shares no net link with `3am.m5.x1`.

**Where 4AM uses it:** there is no net link out of `3am.m5.x1`. In practice 4AM uses the skill in:
- `jidhr-tarbii` and the root lessons: √n rounded at a rank, with brackets such as 1,41 < √2 < 1,42;
- trigonometry (`4am.m2.r03`, « قيمة مقرّبة » on the calculator);
- statistics (rounded means).

Say so in the knowledge map's guidance, without a link.

## 3. Boundary

**Owns:**
- the bracket of a POSITIVE decimal between consecutive integers and between its approximations at 0,1 / 0,01 / 0,001;
- the rounding at a rank (half up: the next digit ≥ 5 rounds up);
- the half-open bracket of a number known only by its rounding;
- bracketing a quotient read on a calculator screen;
- using a bracket with the previous lesson's properties (×positive) in ex-28, ex-62 and the مسائل.

**Leaves:**
- negative decimals (the item says « موجب »);
- the order of decimals as a skill (1AM `muqaranat-adad-ashriya`: ex-25 is only a warm-up « by brackets »);
- scientific notation and bracketing between powers of 10 (`kitaba-ilmiya-rutba`, `3am.m3.r05`);
- the inequality properties themselves (`mutabayinat-amaliyat`: used, never re-stated as new);
- √ as a notion (4AM): the calculator KEY may appear in the bank (« a calculator key is not a rebuild », guide, Phase A entry 2), never in the
  lesson modules.

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| `prep` 13–15 | rounding of 135/14 to the unit (10) and to 0,1 (9,6) ; 46 ÷ 6 = 7.666666667 → 8 / 7,7 / 7,67 | reading a screen and rounding | « أستعدّ » items 5–6, own quotients |
| `act-3` 1) | a square's perimeter P rounds to 10,7 at 0,1: three possible values, the zone on a line from 10,5 to 11, a bracket | **the inverse: a rounding is an INTERVAL** | **Entry candidate (rejected as is, §5).** Its question is the right one, but on paper the zone is drawn from memory of the rule. The lab makes it necessary. Becomes أتمرّن E1 (own: a length of cloth rounding to 2,4 m). |
| `act-3` 2) | 247 ÷ 83 = 2.975903614: 2 < A < 3 named, then brackets at 0,1 / 0,01 / 0,001 | the calculator screen as a source of brackets | أتمرّن E2 (own: 389 ÷ 47) |
| `know-3` | a number rounding to 15 cannot be 14,4 or 15,5 ; 14,5 ≤ x < 15,5 ; 3,647 at three ranks | — | معارف boxes, with the student's own lab numbers and own examples (6,358) |
| `method-3` | 4,679: bracket between integers, then at 0,1 | — | طريقة method A (own: 7,4826 at 0,01 and 0,001) |
| `now-77-1` | 8,34 at 0,01: can a be 8,342 / 8,336 / 8,345? bracket | the half-open end | أتمرّن E3 (own: 5,07) |
| `self-5` | 136/14: rounding to the unit (10) and bracket 9 < … < 10 | — | إختبار أولي item 1 `cites: [src('self-5')]` (own numbers) |
| `ex-20`, `ex-22`, `ex-25` | prove 17/19 < 1 < 19/17 ; 2/5 < 33/50 < 3/4 ; c < a < b with 5,115 / 5,12 / 5,3 | brackets through decimal writings | أتمرّن E7 (own: 3/8 < 0,4 < 5/12) + bank L1 |
| `ex-21` | 3 + 10/71 < π < 3 + 1/7 by calculator (3,14084… < 3,14159… < 3,14285…) | calculator brackets, π | أتمرّن E5 (own: 3,14 < π < 3,15 then 8π) + bank |
| `ex-28` | h rounds to 5,41 → bracket h, then the volume 15h | rounding → bracket → bracket an expression | أتمرّن E6 (own: 6,32 and a 4 × 5 base) |
| `ex-62` | 5π with 3,14 < π < 3,15 | — | bank L3 adapted |

## 5. Design

**The lesson in one paragraph.** A decimal always sits between two consecutive marks of any rank: the mark below is its approximation by defect,
the mark above its approximation by excess. Each finer rank closes the trap tenfold. Its rounding at that rank is the NEARER of the two marks, and
the upper one when it sits exactly halfway (the next digit is 5 or more). The surprising part is the inverse. A screen that rounds and shows
« 1,3 » does not mean 1,3. It means every quantity from 1,25 included up to 1,35 EXCLUDED: half a step of the rank on each side, closed on the
left and open on the right. That is why two rounded readings can still decide who is faster, and why a quotient such as 2/7 can be trapped but
never reached by a decimal scale.

**Entry-point decision.**
- **(a) The book's act-3 1)** (P rounds to 10,7: give three values, shade the zone). Its QUESTION is the right one, but the zone is drawn from
  the rule the student does not have yet: answered by guesswork, not discovered. It is posed as أتمرّن E1.
- **(b) A graduated ruler zoomed rank by rank**, the hand choosing the graduation. REJECTED: that is `ruler-compare` (the hand holds the
  graduation m / dm / cm / mm).
- **(c) A probe x on a number line leaving traces** where the rounding equals r. REJECTED: the gesture and the evidence of `solution-ray` (4AM).
- **(d) The spice shop scale (CHOSEN).** The hand builds the QUANTITY itself, pouring and pinching cumin onto a scale whose big screen ROUNDS at
  the task's rank, while a fine strip shows the exact mass. The idea becomes NECESSARY because the customer's order is « the least (or the most)
  cumin that the screen shows as 1,3 kg ». The student must find where the screen flips: one more pinch at 1,34 and it shows 1,4; one pinch
  less at 1,25 and it shows 1,2. The half-open interval is met by the hand at both ends.

**Order of ideas:**

| Module | Step | LP |
|---|---|---|
| 1 نشاط | a rounded reading is an interval [r − ½u ; r + ½u[ | P3 |
| | the width depends on the rank (0,1 versus 1) | P3 |
| | a quotient is trapped between two consecutive marks, never reached | P2, P4 |
| 2 معارف | « تذكّر — السنة الأولى » (bracket between integers, rounding to the unit) → the chain of brackets of ONE number at 1, 0,1, 0,01 → rounding at a rank (the next-digit rule) → the bracket from a rounding (boxes named after the questions) | P1, P2, P3 |
| 3 طريقة | three methods: bracket at a rank; bracket from a rounding; bracket and round a calculator quotient | P2, P3, P4 |
| 4 أتمرّن | exercises | P1–P4 |
| 5–7 مسائل | three problems | P1–P4 |
| 8 إختبار أولي | final test | P1–P4 |

**Story contexts:**
- the lab: « دكّان العطّار » in a souk (cumin, black pepper), girl at the counter (`KidFigure`, hijab);
- مسألة 1: a semolina mill;
- مسألة 2: a family car trip;
- مسألة 3: a 100 m race timed to the hundredth.

## 6. Lab — `scoop-scale` « ميزان العطّار » (new type, free in the registry)

- **Folder / files.** `manipulations/operations/ScoopScale.jsx`, `logic/scoopScale.js` + test, render test `operations/scoopScale.render.test.jsx`.
  - Registry key `scoop-scale`, presets in `levels.js`, strings `lesson.manipulation.json › scoopScale`, theme `attar`.
  - New MANIPULATION_CONTRACT section « The quantity under the hand — `scoop-scale` ».
- **Drawn world.**
  - A spice-shop counter: shelves of jars behind, a sack of cumin with a brass SCOOP on the left, a digital scale in the centre with a large LCD
    (« الشاشة », seven-segment digits, the unit « kg ») and a pan where a cone of spice grows honestly with the mass.
  - Under the scale, the « شريط الدقّة »: a magnified strip around the current mass.
    - Fine graduations at the task's resolution (0,01 or 0,001 kg).
    - The marks of the DISPLAY's rank are taller and labelled (e.g. 1,2 · 1,3 · 1,4).
    - A needle at the exact mass with its exact value in a pill (« 1,27 kg »).
  - The girl at the counter reacts (`mood`).
  - In the `trap` task a reference sachet hangs on a hook beside the scale with a lamp « أخفّ من الكيس النموذج / أثقل من الكيس النموذج ».
- **THE variable in the hand:** the MASS m, the number itself, in units of the task's resolution.
  - Gestures:
    - press-and-hold on the scoop pours: one unit every 140 ms after a 300 ms delay, accelerating ×4 after 2 s, the grains falling;
    - a tap on the scoop = one pinch, +1 unit;
    - a tap on the cone in the pan = take one pinch back, −1 unit.
  - Keyboard: the pan is `role="slider"`, ↑/↓ ±1 unit, PageUp/PageDown ±10, Home = the start mass. The −/+ round buttons of a `StepperCard`
    mirror the pinch.
  - « سلّم الكيس » validates a trial.
- **What the world shows** (never the rule):
  - the LCD updates live at the task's rank, half up; the digits ROLL when the reading changes;
  - the two display marks around the needle glow faintly (they get their names only after the discovery: « بالنقصان » / « بالزيادة »);
  - the needle and pill move.
  - When « سلّم الكيس » is refused, the scale says why IN THE STUDENT'S NUMBERS, by showing the neighbour as a ghost:
    - least task: « لو أنقصت حفنة لصارت الكتلة 1,25 kg والشاشة ما تزال تقرأ 1,3 » ;
    - most task: « لو زدت حفنة لصارت 1,34 kg والشاشة ما تزال 1,3 ».
  - On the excluded end: at 1,35 the screen reads « 1,4 » and the verdict says « الشاشة لم تعد تقرأ 1,3 ».
- **Opening (§17.9), no title.**
  - Context: « تطلب زبونة كيس كمّون تقرأ عليه الشاشة 1,3 kg . الشاشة تكتب الكتلة برقم واحد بعد الفاصلة، وشريط الدقّة يكتبها بالضبط. »
  - ONE question: « املأ الكيس بأقلّ كمّية ممكنة تقرأ عليها الشاشة 1,3 kg، ثم سلّمه. »

  Each next task changes only the question line: « … بأكبر كمّية ممكنة … ».
- **Levels** (ONE workspace, two levels, same `objective`):

  | Level | Task | Display rank / resolution | Start | Goal | Key |
  |---|---|---|---|---|---|
  | مبتدئ | T1 `least` | 0,1 kg / 0,01 kg | 1,00 | least m that shows 1,3 | **1,25** (1,24 → 1,2) |
  | | T2 `most` | 0,1 / 0,01 | 1,25 | most m that shows 1,3 | **1,34** (1,35 → 1,4: the end is EXCLUDED) |
  | | T3 `least`+`most` | 1 kg (a second, coarse scale « ميزان الأكياس الكبيرة ») / 0,01 | 1,00 | least and most that show « 2 » | **1,50** and **2,49** (2,50 → 3) |
  | متقدم | T1 `least` | 0,01 kg / 0,001 kg | 5,600 | least m showing 5,68 | **5,675** |
  | | T2 `most` | 0,01 / 0,001 | 5,675 | most m showing 5,68 | **5,684** (5,685 → 5,69) |
  | | T3 `trap` | the LCD shows the exact mass to 0,001; the reference sachet = 2 kg of pepper shared into 7 equal sachets = 2/7 kg | 0,250 | « املأ أثقل كيس أخفّ من النموذج، ثم أخفّ كيس أثقل منه » | **0,285** and **0,286** (2/7 = 0,285714…; the lamp NEVER says equal) |

- **« جرّب أعدادك »** (always open, `free: true`):
  - (a) a screen reading R, a positive decimal 0 < R < 100 with 0 to 2 digits after the comma. The NUMBER OF DIGITS TYPED sets the rank:
    « 7 » is the unit, « 7,0 » is the tenth. The same least/most tasks run on it with resolution = rank / 10. The panel's helper line:
    « اكتب القراءة كما تظهر على الشاشة: 7 و 7,0 قراءتان مختلفتان ».
  - (b) a quotient a/b (1 ≤ a ≤ 999, 2 ≤ b ≤ 99) and a rank 0,1 / 0,01 / 0,001, for a `trap` run. If a/b is decimal at that rank, the lamp CAN
    balance and says so.
- **Discovery** (after every task AND one refused « سلّم » at an end, the contrast; the coach proposes it once):
  - question: « ما كلّ الكمّيات التي تقرأ عليها الشاشة 1,3 kg؟ »
  - ✓ « من 1,25 kg إلى أقلّ من 1,35 kg » ;
  - ✗ « من 1,3 kg إلى أقلّ من 1,4 kg », refuted by HIS 1,25, which read 1,3 ;
  - ✗ « من 1,25 kg إلى 1,35 kg » , refuted by his trial at 1,35, which read 1,4 ;
  - ✗ « 1,3 kg فقط », refuted by his 1,27 / 1,34.
  - Formal: r rounded at 10⁻ᵏ ⟺ r − ½·10⁻ᵏ ≤ m < r + ½·10⁻ᵏ, written with his three tasks, then the trap 0,285 < 2/7 < 0,286.
- **LabCoach steps** (`coachOf`):
  1. `pour`: « اضغط مطوّلًا على المغرفة لتصبّ، أو انقر نقرة لحفنة واحدة. »
  2. `remove`: « انقر على الكومة في الكفّة لتنقص حفنة. »
  3. `deliver`: « حين تظنّ أنّك وصلت، اضغط "سلّم الكيس". »
  4. `tryEnd` (once, the contrast): « جرّب حفنة واحدة أكثر وراقب الشاشة. »
  5. `lamp` (trap): « راقب مصباح المقارنة تحت الكيس النموذج. »
  6. `next`.

  Followed to the end of both levels in the test.
- **Wrong moves made VISIBLE:**

  | Misconception | What the student sees |
  |---|---|
  | `TRUNC`: « the screen cuts digits » | 1,25 already shows 1,3 |
  | `UPPER-INCLUDED` | 1,35 shows 1,4 |
  | `CENTER-EXACT`: « 1,3 means exactly 1,3 » | 1,27 and 1,34 both show 1,3 |
  | `WIDTH`: « the half-width is always 0,05 » | T3: ±0,5 at the unit rank |
  | `QUOTIENT-EXACT`: « a calculator display is the exact value » | the lamp never balances on 2/7 |

- **Core maths** (exact, `packages/core/arithmetic/decimals.js`, BigInt, values `{ n, k }` ≥ 0, imported BY PATH):

  | Function | Returns | Example |
  |---|---|---|
  | `floorAt(v, k)` | the approximation by defect at 10⁻ᵏ | — |
  | `ceilAt(v, k)` | the approximation by excess; equals `floorAt` when v is exact at that rank | — |
  | `roundAt(v, k)` | half up | `roundAt(parse('1,25'), 1)` → 1,3 ; `roundAt(parse('9,8462'), 1)` → 9,8 |
  | `roundingInterval(r, k)` | `{ lo, hi, loIncluded: true, hiIncluded: false }` with lo = r − 5·10⁻⁽ᵏ⁺¹⁾ and hi = r + 5·10⁻⁽ᵏ⁺¹⁾ | `roundingInterval(parse('1,3'), 1)` → 1,25 / 1,35 |
  | `quotientDigits(a, b, n)` | the calculator screen string, n significant digits, last digit ROUNDED as a calculator does | `quotientDigits(247, 83, 10)` → « 2.975903614 » |
  | `quotientBracket(a, b, k)` | `{ lo, hi, exact }` | `quotientBracket(2, 7, 3)` → 0,285 / 0,286, exact false |

  - Tests: sweeps over every value of ≤ 4 decimals below 100 at every rank (floor ≤ v ≤ ceil, ceil − floor ∈ {0, 10⁻ᵏ}, round ∈ {floor, ceil},
    v ∈ roundingInterval(roundAt(v, k), k)).
  - Lab logic `logic/scoopScale.js`: `init(task)`, `pour(s, units)`, `pinch(s, ±1)`, `deliver(s)` → `{ ok, reading, refused: 'notLeast' |
    'notMost' | 'wrongReading', ghost }`, `lamp(s)` (trap: `<` / `>` / `=`), `discoveryReady`, `witnesses`, `coachOf`, `freeSet`.
- **Why not another lab** (DNA §12):
  - **vs `ruler-compare`.** There the hand holds the GRADUATION of a ruler and compares two given numbers. Here the rank is fixed by the task,
    the hand holds the QUANTITY, and the question is the SET of quantities behind one rounded reading.
  - **vs `solution-ray`.** That is a probe on an abstract line with red/grey traces, and an inequation. Here the hand builds a mass by pouring,
    and the verdict comes from an instrument (a rounding screen) that refuses.
  - **vs `decimal-comma`.** There the hand holds the comma of fixed digits.
  - **vs `zero-probe`.** That is a signed distance to zero.
  - **vs `hundred-grid`.** Cells of a percentage.
  - **vs the unit sibling `loom-threads`.** That is a mapping of the whole line by dragging a knot. This is building one quantity by
    pouring / pinching.
- **Screen budget.**
  - 1024×768 with the sidebar open (column ≈ 414 px): scoop + scale + pan ≈ 210 px tall, LCD digits ≥ 44 px, the precision strip 380 × 90 px
    (fine ticks at 0,01 over a ±0,1 window = 20 ticks, 19 px apart; at 0,001 the window is ±0,01), controls row ≈ 110 px. Glance target
    ≤ 720 / 768.
  - 768×1024: same layout, strip 460 px.
  - The trap's reference sachet sits to the right of the scale above 520 px of lab width, under it below.

## 7. Modules (9)

`estimatedMin`: 0 → 6 · 1 → 14 · 2 → 10 · 3 → 10 · 4 → 12 · 5, 6, 7 → 8 each · 8 → 6. Total 82. `durationMinutes` = 58.

### Module 0 — أستعدّ (`priorKnowledge: ['tadwir-wahda', 'qiyam-muqarraba']`)

`objectives`: « أتحقّق من أنّني أحصر عددًا عشريًا بين عددين طبيعيين وأدوّره إلى الوحدة، وأقرأ شاشة الآلة الحاسبة. »

| # | Statement (true/false) | Key | Measures |
|---:|---|---|---|
| 1 | مدوّر $7{,}5$ إلى الوحدة هو $8$ . | صحيح | 1am.m3.r05 |
| 2 | مدوّر $12{,}49$ إلى الوحدة هو $13$ . | خطأ (12) | 1am.m3.r05 |
| 3 | $3<3{,}08<4$ | صحيح | bracket between integers |
| 4 | القيمة المقرّبة إلى الوحدة بالزيادة للعدد $6{,}02$ هي $6$ . | خطأ (7) | approx (1AM / 2AM) |
| 5 | مدوّر حاصل القسمة $\frac{157}{12}$ إلى الوحدة هو $13$ (`prep` 13 rewritten). | صحيح (13,083…) | quotient rounding |
| 6 | شاشة الآلة الحاسبة: $53 \div 7 = 7.571428571$ . المدوّر إلى الجزء من عشرة هو $7{,}5$ (`prep` 15 rewritten). | خطأ (7,6) | 2am.m1.r05 |
| 7 | إذا كان $2{,}5 \le x < 3{,}5$ فإنّ $10 \le 4x < 14$ . | صحيح | `3am_mutabayinat-amaliyat_P2` |

### Module 1 — نشاط « ميزان العطّار » (lab first; no title, lead or brief)

`objectives`: « أكتشف كلّ الكمّيات التي تقرأ عليها شاشة مدوِّرة عددًا معيّنًا. »

| Step | Question (after the evidence line) | Options / key | LP and brick |
|---|---|---|---|
| Q1 | Evidence: « أقلّ كمّية قرأت عليها الشاشة 1,3 هي … kg ». « لماذا تقرأ الشاشة 1,3 عند 1,25 kg وليس 1,2؟ » | ✓ « لأنّ 1,25 في منتصف المسافة بين 1,2 و 1,3، وفي المنتصف تأخذ الشاشة العلامة الأكبر » ; ✗ « لأنّ الشاشة تحذف الأرقام بعد الرقم الأوّل » (`TRUNC`, it would show 1,2) ; ✗ « لأنّ 1,25 أكبر من 1,3 » | P3, brick « المدوّر » after the answer (`predictPrompt`: « اكتب بكلماتك كيف تختار الشاشة العدد الذي تكتبه. ») |
| Q2 | « عند 1,35 kg ماذا قرأت الشاشة؟ » (choice 1,3 / **1,4** / 1,35). Then « إذن كلّ كمّية m تقرأ عليها الشاشة 1,3 تحقّق: » | ✓ $1{,}25 \le m < 1{,}35$ ; ✗ $1{,}25 \le m \le 1{,}35$ (`UPPER-INCLUDED`) ; ✗ $1{,}3 \le m < 1{,}4$ (`TRUNC`) ; ✗ $1{,}2 < m < 1{,}4$ (`WIDTH`) | P3, brick « الحصر من المدوّر » |
| Q3 | « على ميزان الأكياس الكبيرة قرأت الشاشة 2: من أيّ كمّية إلى أيّ كمّية؟ » | ✓ $1{,}5 \le m < 2{,}5$ ; ✗ $1{,}95 \le m < 2{,}05$ (`WIDTH`) ; ✗ $2 \le m < 3$ | P3 |
| Q4 (متقدم evidence) | « أثقل كيس أخفّ من النموذج 0,285 kg، وأخفّ كيس أثقل منه 0,286 kg. هل يمكن أن يتوازن الكيس والنموذج على هذا الميزان؟ » | ✓ « لا: $\frac27=0{,}285714\ldots$ ليس له عدد منتهٍ من الأرقام » ; ✗ « نعم عند 0,2855 » ; ✗ « نعم عند 0,286 » | P2/P4, brick « القيمتان المقرّبتان » (named here: بالنقصان 0,285 ، بالزيادة 0,286) |

### Module 2 — معارف (opens on its first question)

`objectives`: « أحصر عددًا عشريًا موجبًا إلى الوحدة وإلى $0{,}1$ و $0{,}01$ ، وأعيّن مدوّره، وأحصر عددًا علمت مدوّره. »

1. **Question** (`BatchChoiceQuestion` / numeric), own number 6,358:
   - « أكمل: $6 \le 6{,}358 < \dots$ ؛ $6{,}3 \le 6{,}358 < \dots$ ؛ $\dots \le 6{,}358 < 6{,}36$ » → 7 ; 6,4 ; 6,35;
   - « مدوّره إلى الوحدة؟ إلى 0,1؟ إلى 0,01؟ » → 6 ; 6,4 (next digit 5 → up) ; 6,36 (next digit 8).
2. **« تذكّر — السنة الأولى »** box (bracket between consecutive integers; rounding to the unit; `getLessonPath('hasr-qiyam-muqarraba')`, null).
3. **Boxes** (own words):
   - « القيمتان المقرّبتان إلى $10^{-k}$ بالنقصان وبالزيادة »: the two consecutive marks of that rank around x;
   - « المدوّر »: the nearer, the upper one when the next digit is 5 or more;
   - « حصر عدد علمنا مدوّره »: r − ½·10⁻ᵏ ≤ x < r + ½·10⁻ᵏ, with a number-line figure (`GeoFigure` data or a small SVG: 8,5 · 9 · 9,5 for a
     rounding of 9 to the unit, own example).
4. **Second question:** « عدد مدوّره إلى الوحدة 9: هل يمكن أن يساوي 8,5؟ 9,49؟ 9,5؟ » → نعم ; نعم ; لا.

### Module 3 — طريقة (three methods, each opened by its question)

`objectives`: « أحصر عددًا إلى رتبة، وأحصر عددًا من مدوّره، وأحصر حاصل قسمة بالآلة الحاسبة وأدوّره. »

- **Method A (P2, P3).** « احصر $7{,}4826$ إلى $0{,}01$ ثم إلى $0{,}001$ وأعط مدوّره في كل رتبة. »
  - At 0,01: 7,48 ≤ x < 7,49, rounding 7,48 (next digit 2).
  - At 0,001: 7,482 ≤ x < 7,483, rounding 7,483 (next digit 6).
- **Method B (P3).** « مدوّر $a$ إلى $0{,}01$ هو $3{,}72$ . احصر $a$ ، ثم قل: هل يمكن أن يساوي $3{,}7249$ ؟ $3{,}725$ ؟ $3{,}714$ ؟ »
  → 3,715 ≤ a < 3,725 ; نعم ; لا (it rounds to 3,73) ; لا.
- **Method C (P4).** « شاشة: $355 \div 113 = 3.14159292$ . احصر الحاصل إلى $0{,}001$ ، ثم أعط مدوّره إلى $0{,}01$ وإلى $0{,}001$ . »
  → 3,141 < q < 3,142 ; 3,14 ; 3,142 (next digit 5).

### Module 4 — أتمرّن (`brief`: « سبعة تمارين على الحصر والتدوير. »)

`objectives`: « أطبّق الحصر والتدوير على أطوال وكتل وحواصل قسمة. »

| Ex | cites | Statement (own) | Keys |
|---|---|---|---|
| E1 | `act-3` (1) | طول قطعة قماش $L$ مدوّره إلى $0{,}1$ هو $2{,}4$ m . صحيح أم خطأ: $L$ يمكن أن يساوي $2{,}35$ ؛ $2{,}449$ ؛ $2{,}45$ ؛ $2{,}3$ . احصر $L$ . | ص ; ص ; خ (2,5) ; خ ; 2,35 ≤ L < 2,45 |
| E2 | `act-3` (2) | شاشة: $389 \div 47 = 8.276595745$ . احصر $A=\frac{389}{47}$ إلى 1، 0,1، 0,01، 0,001 . | 8 < A < 9 ; 8,2 < A < 8,3 ; 8,27 < A < 8,28 ; 8,276 < A < 8,277 |
| E3 | `now-77-1`, `know-3` | مدوّر $b$ إلى $0{,}01$ هو $5{,}07$ . هل يمكن أن يكون $b$ : $5{,}074$ ؟ $5{,}065$ ؟ $5{,}075$ ؟ $5{,}0649$ ؟ احصر $b$ . | نعم ; نعم ; لا ; لا ; 5,065 ≤ b < 5,075 |
| E4 | `self-5`, `prep` 14 | أعط مدوّر $\frac{151}{12}$ إلى الوحدة وإلى $0{,}1$ ، واحصره بين عددين طبيعيين متتاليين. | 13 ; 12,6 (12,583…) ; 12 < 151/12 < 13 |
| E5 | `ex-21` | باستعمال الآلة الحاسبة تحقّق أنّ $3{,}14<\pi<3{,}15$ ، ثم احصر محيط دائرة نصف قطرها 4 cm . | 25,12 < 8π < 25,2 |
| E6 | `ex-28` | علبة قاعدتها مستطيل $4\ \text{cm}\times 5\ \text{cm}$ ، وارتفاعها $h$ مدوّره إلى $0{,}01$ هو $6{,}32$ cm . احصر $h$ ثم حجمها. | 6,315 ≤ h < 6,325 ; 126,3 ≤ V < 126,5 |
| E7 | `ex-20`, `ex-22`, `ex-25` | أثبت أنّ $\frac38<0{,}4<\frac{5}{12}$ (اكتب كل كسر بالشكل العشري أو احصره إلى $0{,}001$). | 0,375 < 0,4 ; 0,416 < 5/12 < 0,417 |

### Modules 5–7 — مسائل

**مسألة 1 = `lessonProblem`** « كيس السميد » (P3, P4 with the sibling's property)
- Statement: « على أكياس مطحنة مكتوب 25 kg . ميزان المطحنة يكتب الكتلة مدوّرة إلى $0{,}1$ kg، وقرأ على أحد الأكياس $24{,}9$ kg . »
- Questions and keys:
  1. احصر الكتلة الحقيقية $m$ → $24{,}85 \le m < 24{,}95$
  2. هل يمكن أن تكون $24{,}96$ kg؟ → لا (it would read 25,0)
  3. هل الكيس أخفّ من 25 kg بالتأكيد؟ → نعم ($m<24{,}95<25$)
  4. احصر كتلة 40 كيسًا من هذا النوع → $994 \le 40m < 998$
- Illustration `tags`.

**مسألة 2** « رحلة العائلة » (P4)
- Statement: « قطعت سيارة 437 km واستهلكت 31 لترًا من الوقود. »
- Questions and keys:
  1. الاستهلاك لكل 100 km هو $\frac{3100}{437}$ : احصره إلى $0{,}01$ → $7{,}09<c<7{,}10$
  2. مدوّره إلى $0{,}1$ → $7{,}1$
  3. المسافة لكل لتر $\frac{437}{31}$ : مدوّرها إلى الوحدة وإلى $0{,}1$ → $14$ ; $14{,}1$
- Illustration `route`.

**مسألة 3** « سباق 100 m » (P3)
- Statement: « يكتب الميقاتي الزمن مدوّرًا إلى $0{,}01$ s . قرأ لمريم $12{,}47$ s ولسارة $12{,}48$ s . »
- Questions and keys:
  1. احصر زمن مريم → $12{,}465 \le t_M < 12{,}475$
  2. احصر زمن سارة → $12{,}475 \le t_S < 12{,}485$
  3. هل يمكن الجزم أنّ مريم أسرع؟ → نعم ($t_M<12{,}475\le t_S$)
  4. لو قرأ الميقاتي $12{,}47$ s للاثنتين؟ → لا يمكن الجزم
- Illustration `timeline`.

### Module 8 — إختبار أولي (5 items; options literal in `Module08Itqan.jsx`)

| # | LP | Prompt | ✓ | Distractors |
|---:|---|---|---|---|
| 1 | P1 (`cites: self-5`) | حصر $17{,}08$ بين عددين طبيعيين متتاليين | $17<17{,}08<18$ | $17{,}0<17{,}08<17{,}1$ (`RANK`) ; $16<17{,}08<17$ ; $17<17{,}08<17{,}1$ |
| 2 | P2 | القيمة المقرّبة بالزيادة إلى $0{,}01$ للعدد $4{,}2531$ | $4{,}26$ | $4{,}25$ (`NAQS-ZIYADA`) ; $4{,}3$ (`RANK`) ; $4{,}253$ |
| 3 | P3 | مدوّر $9{,}8462$ إلى $0{,}1$ | $9{,}8$ | $9{,}9$ (`DOUBLE-ROUND`: 9,85 → 9,9) ; $9{,}84$ ; $10$ |
| 4 | P3 | $x$ مدوّره إلى $0{,}1$ هو $3{,}6$ . أيّ حصر صحيح؟ | $3{,}55\le x<3{,}65$ | $3{,}6\le x<3{,}7$ (`TRUNC`) ; $3{,}55\le x\le 3{,}65$ (`UPPER-INCLUDED`) ; $3{,}5<x<3{,}7$ (`WIDTH`) |
| 5 | P4 | شاشة: $250 \div 7 = 35.71428571$ . حصر الحاصل إلى $0{,}01$ | $35{,}71<\frac{250}{7}<35{,}72$ | $35{,}7<\frac{250}{7}<35{,}8$ (`RANK`) ; $35{,}72<\frac{250}{7}<35{,}73$ (rounding used as the lower end) ; $35{,}71<\frac{250}{7}<35{,}714$ |

## 8. Misconceptions (`MISC-TADWIR-*`, new; reuse the existing `MISC-TAQRIB-NAQS-ZIYADA` for defect/excess swapped)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `TRUNC` | rounding = cutting the digits | 1,25 already shows 1,3 | M1 Q1–2, test 4 |
| `UPPER-INCLUDED` | the upper end of a rounding interval is included | 1,35 shows 1,4 | M1 Q2, M3 B, test 4 |
| `CENTER-EXACT` | a rounded reading is the exact value | many masses show 1,3 | M1, مسألة 3 |
| `WIDTH` | the half-width is a whole unit of the rank, or always 0,05 | T3, unit rank | M1 Q3, test 4 |
| `DOUBLE-ROUND` | rounds in a chain (9,8462 → 9,85 → 9,9) | — | test 3, bank L2 |
| `HALF-DOWN` | a next digit of 5 rounds down | 1,25 / 5,675 | M2, E3 |
| `RANK` | works at the wrong rank (0,1 instead of 0,01 / the unit) | — | test 1, 2, 5 |
| `QUOTIENT-EXACT` | the screen's digits are the exact quotient / a quotient can be hit | trap lamp | M1 Q4, M3 C |
| `LAST-DIGIT` | rounds by looking at the LAST digit instead of the next one | — | bank L1–L2 |

## 9. Practice bank — `content/practice/3am/hasr-adad-ushri/` (5 × 10)

**Corpus.** `coverage['3am.m5.x1'] = 2`. I read the PDFs at 80 dpi.

FAITHFUL 3AM `term_exam`:

| File / ex | Term | What | Note |
|---|---|---|---|
| `3am-s1-113` ex 1 q3 | الفصل الأول | C = A ÷ B with A = −5,2 + (−6,33) − (+9,06) = −20,59 and B = (−5,2)(−3,4)(−8) = −141,44 ; C = 0,14557… → rounded to 1/100: **0,15** | the relative-number steps `counted: false`; the rounding counted |
| `3am-s1-2` « النموذج 5 – التمرين الأول » | الفصل الأول | products of relative decimals, bracket a quotient, round | a 15-page scan with no text layer: render pp. at 110 dpi and find model 5 |
| `3am-s3-51` ex 2 q2 | الفصل الثالث | profit 42 500 − 39 000 = 3 500 DA; percentage 3500/39000 = 8,974…% → rounded to the unit **9 %** | percentage step `counted: false` (`nisba-miawiya-3am`) |

**Honest count: 3 faithful 3AM sheets.** If the owner allows 2AM papers (README Q4), add up to 8 FAITHFUL `term_exam` with `grade: "2am"` on
the same skills (quotient approximations, bracket, rounding):
- `2am-s1-77` ex 2 (32,46 t of sand in 4 t trucks: 8 < 8,115 < 9 → 9 trucks, the excess approximation in context);
- `2am-s1-87` ex 3 (134 ÷ 19 to 0,01: 7,05 < … < 7,06);
- `2am-s1-91` ex 2 · `2am-s1-75` ex 2 · `2am-s1-73` ex 2 (18,14 ÷ 0,7 = 25,914… bracket at 0,1, rounding) · `2am-s1-83` ex 1 (true/false on
  approximations and roundings) · `2am-s1-88` ex 2;
- `3am-s1-112` ex 2 / ex 6 (header says « 2 متوسط »: it counts as 2AM).

Each 2AM model is RAISED to 3AM by adding the « from a rounding » step.

**Plan per level:**

| Level | Content | Provenance |
|---|---|---|
| L1 | one skill: bracket at a rank, round, approximations | 4 `adapted` (`ex-20`, `ex-22`, `ex-25`, `prep` 13), 6 `term_exam_modelled` `modelledOn: "3am-s1"` |
| L2 | compute then justify: rounding vs truncation, double rounding, « can x be … ? » | 1 `term_exam` (`3am-s1-113`), 2 `adapted` (`now-77-1`, `know-3`), 7 modelled |
| L3 | complete exercise: calculator quotient at three ranks + rounding; π brackets | 1 `term_exam` (`3am-s1-2`), 2 `adapted` (`ex-21`, `ex-62`), 7 modelled |
| L4 | with the sibling's properties (`counted: false` steps of other lessons): from a rounding to a bracket of an expression (perimeter, volume, total mass) | 1 `term_exam` (`3am-s3-51` ex 2), 1 `adapted` (`ex-28`), 8 modelled `modelledOn: "3am-s3"` |
| L5 | two-part situation ending on a justified decision (who wins a timed race, is a lorry overloaded, how many bottles to fill) | 10 modelled (`modelledOn: "3am-s1"` / `"3am-s3"`) |

If 2AM papers are allowed, replace up to 8 modelled sheets in L1–L3 by 2AM `term_exam`.

**Answer types:** `rational` (decimal comma accepted, the key at its exact rank: « 2,40 » ≠ « 2,4 » is NOT a constraint, since both are the same value;
the RANK is asked through `choice` when it matters), `choice` (brackets, yes/no), `selfCheck`.

**Oracle** `scripts/practice-oracle/hasr-adad-ushri.mjs`: its own BigInt decimals (scaled integers), never `decimals.js`.
- It rounds half up, floors and ceils at every rank and rebuilds rounding intervals.
- It recomputes quotients by long division.
- Each `choice` bracket is checked option by option (only the key is true).
- The term-exam numbers above are recomputed (0,15 ; 9 % ; 9 trucks …).

## 10. Risks & owner questions

1. **P1/P2 re-teach 2AM items** (`2am.m1.r05`, `2am.m1.r06`) that the net does not link to `3am.m5.x1` (README Q1). The plan keeps them as fast
   consolidation inside one معارف question, and the lab spends its time on P3.
2. **P3 rewording** (adds the inverse): owner to confirm (README Q3).
3. **2AM papers in a 3AM bank** (README Q4). Without them the bank has 3 faithful sheets, the lowest of the batch.
4. **`now-77-1` extraction key wrong** for 8,336 and 8,345: fix it in `build-extraction.py` with an assertion and record the discrepancy.
5. **Calculator display rounding.** Calculators round their last displayed digit (2/7 → « 0.2857142857 »). The book's screens follow that
   (247 ÷ 83 = 2.975903614, where the true digits are 2.97590361445…). `quotientDigits` must ROUND the last digit, and the oracle checks the
   printed screens.
6. **A possible collision with the future 1AM lab of `hasr-qiyam-muqarraba`** (not planned in this batch). Whoever plans it must not reuse the
   scale world: its concept (bracket between integers, rounding to the unit) can be served by another hand.
7. **Pour gesture accessibility.** Press-and-hold is not the only path: tap-pinch, stepper and keyboard give the same task (DNA §10).

## 11. Generator checklist

- [ ] `build-extraction.py`:
  - [ ] this lesson's elements re-read at 200 dpi, `verified: True`;
  - [ ] assertions on every answer of section 1 (exact Decimal half-up), the `now-77-1` fix, discrepancies;
  - [ ] module numbers;
  - [ ] rebuild `extraction.json`.
- [ ] Core: `floorAt`, `ceilAt`, `roundAt`, `roundingInterval`, `quotientDigits`, `quotientBracket` in `decimals.js` + sweeps in `decimals.test.js`.
- [ ] Lab `scoop-scale`:
  - [ ] registry, `levels.js`, i18n `scoopScale.*`;
  - [ ] logic test (every task's key, the refusals and ghosts, the trap lamp never `=` for 2/7, `coachOf` to the end);
  - [ ] render test (context then ONE question, says each thing ONCE, DOM contract `[data-scoop-scale][data-task][data-solved]`, `[data-ss-lcd]`,
    `[data-ss-scoop]`, `[data-ss-pan][role=slider]`, `[data-ss-strip]`, `[data-ss-deliver]`, `[data-ss-lamp]`, `[data-ss-free]`…);
  - [ ] MANIPULATION_CONTRACT section;
  - [ ] screenshots at four sizes (initial, mid-pour, refusal ghost, 1,35 flip, trap, formal), reviewed and iterated.
- [ ] Lesson files:
  - [ ] `lesson.config.js` header: design (a)(b)(c)(d) and الكفاءات changes;
  - [ ] resources: two levels, same `objective`, `experience.reason: 'platform_designed_entry'`, theme `attar`;
  - [ ] `lessonProblem` = مسألة 1;
  - [ ] `estimatedDurationMin` 82;
  - [ ] knowledge map progressive, `predictPrompt` on every rule.
- [ ] `content/content.test.js` (own BigInt decimals: every key and distractor above), `problems.test.js`, `figures.test.js` for the number-line figure.
- [ ] e2e `apps/web/e2e/lesson-kit/3am-musawiyat-mutabayinat-hasr.mjs`: lab first, no brief above it, bricks hidden before the answer, pour / pinch / keyboard,
  the 1,35 flip.
- [ ] Bank (section 9), active / exam-style / policy, oracle import.
- [ ] Gates: lesson index, `npm test`, `npm run check:lessons`, `npm run build`, browser 768 / 1280 RTL.
- [ ] Publish (coordinator, guide §11):
  - [ ] catalogue flip: `available`, final `pointsToLearn`, `durationMinutes: 58`, `difficulty: "متوسط"`, `icon: "⚖️"`, intra-lesson `pointPrerequisites`;
  - [ ] `generate:learning-net`;
  - [ ] export/import, local DB publish;
  - [ ] commit, push `dev`.

---

## Generator notes (2026-10-26)

Generated from this plan, INTO its catalogue entry, with the changes below (all minimal; entry point, lab, modules, numbers and bank sources unchanged).

1. **« أستعدّ » priorKnowledge**: four ids (`tadwir-wahda`, `qiyam-muqarraba`, `qisma-ashriya-2am`, `mutabayinat-amaliyat-3am`) instead of two, so each item's `requires` names the skill it measures; items 5–6 are `prep` 13 and 15 (15 corrected to its three printed rows, extraction), `prep` 14 is E4.
2. **Final-test item 1** listed distractors `17,0 < 17,08 < 17,1` and `17 < 17,08 < 17,1`, which are TRUE inequalities (not between consecutive naturals, but true). Replaced by FALSE ones: `16 < 17,08 < 17`, `17,1 < 17,08 < 18`, `18 < 17,08 < 19`. **Item 5**: `35,7 < 250/7 < 35,8` and `35,71 < … < 35,714` are true too; replaced by `35,72 < … < 35,73`, `35,7 < … < 35,71`, `35,6 < … < 35,7`. Item 4's closed-end distractor stays: it is true for every member of the set but describes a DIFFERENT set (3,65 rounds to 3,7), so the tests use the equivalence criterion there.
3. **Module 1 Q1**: the distractor « لأنّ 1,25 أكبر من 1,3 » is replaced by « لأنّ الشاشة تأخذ دائمًا العلامة الأعلى » (refuted by his own 1,24 reading 1,2). **Q4 (the 2/7 trap)** is optional: the step counts as done without the advanced level (`done: !!q.d || !hasTrap`).
4. **Problem 1 part 1**: `24,85 ≤ m ≤ 24,95` (closed) replaced by `24,85 < m < 24,95` as the distractor; the closed form is the unit's recurring mistake and lives in the knowledge map. Problem 2 part 1 distractor `7,0 < c < 7,1` (true) replaced by `7,09 < c < 7,093`.
5. **Lab**: the LCD digits are ≈ 38 px at the 414 px column of 1024 × 768 (plan: ≥ 44) — the glance (scene 200 px + strip 86 px + one controls row) was the constraint; the strip labels every fifth tick in `trap`; the scoop also pinches by keyboard (Enter / Space); a hold on the PILE removes pinches like the scoop adds them.
6. **Hold-timer bug** (found by the e2e): `release()` zeroed the direction before a `setState` updater ran, so a tap on the pile ADDED a pinch; the direction is now captured first.
7. **Bank** (by a helper): L2-001 and L3-001 first used invented numbers under a `term_exam` claim; they now use the scans' own numbers (`3am-s1-113` ex 1: A = −20,59, B = −141,44, C → 0,15; `3am-s1-2` model 5: 10 ÷ 7 bracketed 1,428 < … < 1,429 then rounded 1,4) and `3am-s3-51` ex 2 (9 %). The exam index numbers `3am-s1-2` model 5 ex 1 as entry 3. No 2AM paper is used (README Q4 not granted): 3 `term_exam`, 31 `term_exam_modelled`, 9 `adapted`.
8. **Extraction** (by a helper): `prep` 14 options printed `9 / 10 / 9,6` (the extraction had them reversed), `prep` 15 is three rows of three options; `now-77-1` keys 8,342 yes, 8,336 yes, 8,345 NO; `ex-62` stays bank-only (cited by `ex-21`'s `cites`).
9. **Catalogue**: `durationMinutes` 58 (82 with the مسائل), icon ⚖️, difficulty متوسط, `pointPrerequisites` P2 ← P1, P3 ← P2, P4 ← P2, P3 (intra-lesson only).
