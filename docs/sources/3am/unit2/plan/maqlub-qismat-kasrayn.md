# Plan — `maqlub-qismat-kasrayn` « مقلوب عدد وقسمة كسرين » (3AM unit 2, lesson 1 of 5 + synthesis)

Read the unit [`README.md`](README.md) first: it holds the boundaries, the shared module `fractions3.js`, the element ids and the
seeding steps. **This lesson SEEDS the unit and writes the whole-unit extraction.**

## 1. Identity

- **Code** `maqlub-qismat-kasrayn` · **title** « مقلوب عدد وقسمة كسرين » · **unit** `kusur-natiqa` « العمليات على الكسور والأعداد
  الناطقة » · catalogue order 4 · kind `lesson`.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/maqlub-qismat-kasrayn/` (9 modules, the shape of
  `…/tanasubiya-sura/nisba-miawiya-3am/`).
- **Textbook pages** (book → pdf = book + 1):
  - p. 23 → 24: `prep` items 1 (reciprocal of 0,8) and 2 (4/9 × 5/3);
  - p. 24 → 25: `act-1` « قسمة كسرين » (strip 3/4 ÷ 2; 2/3 ÷ 4, 4/5 ÷ 3; a = 3 ÷ 4/5, b = 7/8 ÷ 3/2, c = 4/3 ÷ 3/5);
  - p. 26 → 27: `know-1` « مقلوب عدد غير معدوم » and `know-2` « قسمة كسرين »;
  - **no method**: the طرائق of p. 27 belong to `tasawi` and `jam-tarh`;
  - p. 30 → 31: `ex-1`, `ex-2`, `ex-4`…`ex-7`; p. 33 → 34: `self-1`, `self-7`, `self-11`; p. 34 → 35: `deep-59`; p. 35 → 36: `deep-71`.
- **Seeds the unit: YES** — `_unit/`, `extraction.json`, the catalogue `textbookRef` fixes and `challenge.sourceElementId`
  (README « Seeding »).

## 2. Programme & net

**Programme items:**
- `3am.m1.r03` « تعيين مقلوب عدد غير معدوم. »
- `3am.m1.r04` « قسمة كسرين. »

**Draft الكفاءات (catalogue, verbatim):**
1. « تعيين مقلوب عدد غير معدوم: مقلوب $a$ هو $\frac{1}{a}$ ومقلوب $\frac{a}{b}$ هو $\frac{b}{a}$ »
2. « التعبير عن القسمة على عدد غير معدوم بالضرب في مقلوبه »
3. « قسمة كسرين: $\frac{a}{b}\div\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}$ »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | تعيين مقلوب عدد غير معدوم (طبيعي أو عشري أو كسر موجب): مقلوب $a$ هو $\frac{1}{a}$ ومقلوب $\frac{a}{b}$ هو $\frac{b}{a}$ ، وجداء عدد ومقلوبه يساوي $1$ ؛ والعدد $0$ ليس له مقلوب | Adds the DEFINING property x × 1/x = 1 (the lab discovers it, and 0 is excluded because of it). Names the cases the book's exercises use (0,8 → 5/4). The negative numbers stay with `amaliyat-natiqa` P3 (README boundary). |
| P2 | التعبير عن القسمة على عدد غير معدوم بالضرب في مقلوبه: $a\div b=a\times\frac{1}{b}$ | adds the formula only |
| P3 | قسمة كسرين: $\frac{a}{b}\div\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}$ ، مع الاختزال قبل الضرب وكتابة الناتج على أبسط شكل | Adds simplifying, which is the book's own demand (ex-5 « بسّط ثم احسب », ex-7 « احسب ثم بسّط »). Reducing itself is 1AM `ikhtizal-kitaba-kasriya` (published): used, never rebuilt. |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home lesson | Status |
|---|---|---|---|
| `2am.m1.r07` | ضرب كسرين. | `jida-kasrayn` (2AM) | coming_soon → measured with platform statements; « تذكّر — السنة الثانية » box with NO link |
| `3am.m1.r02` | حساب حاصل قسمة عددين نسبيين. | `qismat-nisbiyayn` (3AM unit 1) | generated BEFORE this lesson (owner order units 1 → 5). If it is `available`, the « تذكّر » box links it with `getLessonPath`. |

`priorKnowledge` slugs: `jida-kasrayn-2am`, `qisma-darb-3am` (a ÷ b = q ⇔ b × q = a), and `ikhtizal-kasr-1am` (allowed extra: reducing is
used).

**noRebuild:** none from the net (both links are `requires`). Even so, the lesson never re-teaches the product a/b × c/d. It is recalled
and used.

**pointPrerequisites:**
- intra-lesson: P2 ← P1, P3 ← P2;
- cross-lesson, along the net link `3am.m1.r02 → 3am.m1.r03`: P1 ← `3am_qismat-nisbiyayn_P1` (a ÷ b = q ⇔ b × q = a), ONLY if that lesson
  is published and its P1 keeps that meaning (check its catalogue entry at generation time);
- no edge toward `jida-kasrayn` (unpublished, LEARNING_NET §4.8).

**Where 4AM (and the rest of 3AM) uses it:**
- `amaliyat-natiqa` (r04 → r08) divides rationals;
- `tabsit-hadhf-aqwas` (published, via r08) and `muadalat-darajat-ula` (published) divide by a coefficient (3x = 7/2 → x = 7/6);
- 4AM `amaliyat-judhur` (√a / √b, the reciprocal of a root when rationalising), `ikhtizal-kasr`, `talis-hisab-atwal` (missing length:
  x = a × c / b), and every BEM « اكتب على شكل كسر غير قابل للاختزال ».

## 3. Boundary

**Owns:**
- the reciprocal of a non-zero natural, decimal or positive fraction, and x × (1/x) = 1;
- « 0 has no reciprocal »;
- the notation $\left(\frac{7}{5}\right)^{-1}=\frac{5}{7}$ as a remark only, tied to the published `quwat-adad-nisbi` (a⁻¹ = 1/a);
- ÷ b = × 1/b;
- the division of two positive fractions, a natural by a fraction and a fraction by a natural;
- a compound fraction (a/b)/(c/d) or (a/b)/n with positive terms;
- simplifying before multiplying;
- word problems « how many c/d in a/b » and « the whole from a fraction of it ».

**Leaves:**
- the reciprocal of a negative number and every signed division → `amaliyat-natiqa`;
- comparing → `tasawi`;
- sums and differences → `jam-tarh` (a step that needs one, such as « reciprocal of 3/7 + 3/5 », goes to the synthesis);
- the logic of solving equations → unit 5.

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| `act-1` | a strip with 3/4 coloured, halved → 3/4 ÷ 2 = 3/8 = 3/4 × 1/2; then 2/3 ÷ 4, 4/5 ÷ 3, a = 3 ÷ 4/5, b = 7/8 ÷ 3/2, c = 4/3 ÷ 3/5 | « ÷ 2 is taking half, so × 1/2 » | **Not the entry.** It only shows SHARING by a natural, where « division makes smaller » still holds, so the surprise of ÷ 3/4 never appears. It becomes an APPLICATION in أتمرّن, with own numbers. |
| `know-1` | reciprocal of a natural a (1/a), of a/b (b/a); 8 → 1/8 = 0,125; 7/5 → 5/7, (7/5)⁻¹ | definition and examples | NAMED in معارف after the lab, with own examples; ⁻¹ as a remark |
| `know-2` | « dividing by a non-zero number is multiplying by its reciprocal »; 7 ÷ 0,25 = 28, 7/5 ÷ 6 = 7/30, 7/12 ÷ 3/5 = 35/36 | the property | معارف, own examples: 9 ÷ 0,75 = 12, 5/4 ÷ 10 = 1/8, 8/9 ÷ 2/3 = 4/3 |
| `prep` 1, 2 | reciprocal of 0,8 (5/4 and 1/0,8); 4/9 × 5/3 (20/27 and 60/81) | multiple right options | « أستعدّ » keeps item 2 rewritten (5/6 × 9/10 = 3/4). Item 1 is the lesson itself: it moves to the final test's register (reciprocal of 0,4 = 5/2). |
| `ex-1`, `ex-2` | reciprocals of 5, 0,016, 0,4, 2/7, 5/4, 3/5; (4)⁻¹, (0,35)⁻¹, (11/8)⁻¹, (7/3)⁻¹ | decimals and the ⁻¹ notation | أتمرّن item 2 (own numbers) + bank |
| `ex-4` | mental products incl. 7/19 × 19/7 | a product equal to 1 | أتمرّن item 3 |
| `ex-5` | simplify, then compute products | cancel first | طريقة + أتمرّن item 4 |
| `ex-6`, `ex-7` | 14/9 ÷ 2, 8 ÷ 4/15, 34/21 ÷ 17/14… | the three shapes of division | أتمرّن items 5, 6 + bank |
| `self-1`, `self-7`, `self-11` | 4/3 ÷ 8/9 = 3/2; (2/5)/8 = 1/20; 3/14 = 3/7 ÷ 2 | QCM register | final test register + bank |
| `deep-59` | rectangle 15/4 dm², length 27/4 dm → width 5/9 dm | division as a missing factor of an area | أتمرّن item 7 (own: 21/8 m² and 7/2 m → 3/4 m) |
| `deep-71` | 15 pupils = 3/4 of 5/6 of the class → 24 | the whole from a fraction | مسألة 3 (redesigned: 18 = 3/5 of 5/6 → 36) |

## 5. Design

**The lesson in one paragraph.** Dividing by a number asks « how many times does it fit », and one turn of the wheel needs « how many
pedal turns ». With a small chainring (24 teeth) and a big rear sprocket (32), one pedal turn moves the wheel only 3/4 of a turn. So 6
wheel turns need MORE than 6 pedal turns: exactly 8. **6 ÷ 3/4 = 8 is larger than 6.** The number of pedal turns for ONE wheel turn is
4/3, the reverse gear ratio. 4/3 is the **reciprocal** of 3/4, because 3/4 × 4/3 = 1 (one pedal turn for 4/3 … gives back one turn).
Then 6 wheel turns = 6 × (one wheel turn) = 6 × 4/3 = 8: **dividing by 3/4 is multiplying by its reciprocal 4/3**. The same holds for
any fraction: a/b ÷ c/d = a/b × d/c. Zero has no reciprocal: no number times 0 gives 1, and no gear has 0 teeth.

**Entry point — candidates compared:**
- (a) **The book's نشاط 1** (halve a strip): only sharing by a natural. « ÷ makes smaller » survives and the rule ÷ c/d is never NEEDED.
  Rejected as the entry; it becomes an application.
- (b) **Measuring division with containers** (how many 3/4-L bottles in 6 L): good meaning, but it repeats the « units into containers »
  experience of `egg-trays`, and unit 5 plans `scoop-scale` (pouring). Kept as a problem context (مسألة 1), not as the lab.
- (c) **The gear ratio of a bicycle**: one pedal turn = F/R wheel turns. The hand TURNS the crank, the variable is the number of pedal
  turns, and the reciprocal is a physical object: the reverse ratio. The result « more turns than the target » is a visible surprise.
  **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'bikestand' }`.

**Order of ideas:**
1. pedal turns for a given number of wheel turns (÷ a natural, then ÷ 3/4 — the surprise);
2. ONE wheel turn → the reverse ratio 4/3; 3/4 × 4/3 = 1 → the reciprocal;
3. 6 = 6 × 1 → 6 ÷ 3/4 = 6 × 4/3;
4. a fraction target → a/b ÷ c/d = a/b × d/c;
5. معارف names the reciprocal (natural, decimal, fraction, 0 excluded, ⁻¹), then ÷ = × reciprocal;
6. طريقة: simplify before multiplying, compound fractions;
7. أتمرّن, three مسائل, the test.

**Story contexts (own numbers, values woven in):**
- Yacine and his sister Lina prepare the club's bicycles for the « يوم بلا سيارات » ride (care for shared things);
- olive oil pressed by Salim's family, bottled and shared with neighbours;
- the school garden's beds;
- a class tree-planting campaign.

## 6. Lab — `gear-crank` « دوّاسة الدرّاجة » (new type, free in the registry)

**Drawn world `bikestand`** (new in `VISUAL_THEMES`, kind `objects`, shows « درّاجة جبلية: دوّاسة وصحن أمامي وترس خلفي وسلسلة وعجلة »):
- the club's mountain bike on a short road strip in the school courtyard;
- the chainring and the rear sprocket are drawn with their REAL number of teeth (honest: 24 teeth are 24 drawn teeth), and the chain
  links move tooth by tooth;
- the wheel has a coloured valve marker, and the road has a chalk start line and a FLAG at the target distance (target wheel turns ×
  the wheel's circumference, drawn to scale);
- a KidFigure (Lina, in hijab and tunic) stands at the flag and reacts: `wonder` while riding, `proud` on the flag, a hand on the head
  when the bike passes the flag.

**The variable in the hand: the number of PEDAL turns**, an exact fraction with step 1/F (one chainring tooth). The wheel's turns are a
CONSEQUENCE: teeth / R.

**Gesture:**
- drag the pedal crank around its axle (circular drag; the crank arm follows the finger angle, and full turns accumulate);
- tap « ‹ سنّ » / « سنّ › » (−/+ one tooth, ≥ 44 px);
- keyboard: ← → one tooth, Shift+← → six teeth, Home back to the start line;
- the drag previews, the release is the trial (MANIPULATION_CONTRACT §2octovicies);
- reduced motion: the bike jumps to its position without rolling.

**What the world shows (never the rule):**
- the bike rolls, the valve marker turns, and the chain links pass;
- two counters with BIG readouts: « دورات الدوّاسة » (teeth/F as a reduced fraction + a ring around the axle filling per turn) and
  « دورات العجلة » (teeth/R);
- at the flag: a « stamp » and the counters freeze;
- past the flag: the front wheel crosses the chalk, a red gap pill shows the overshoot in wheel turns (« تجاوزتَ العلم بـ 1/8 دورة »),
  and the bike can be rolled back.

**Opening (DNA §17.9, no title).**
- Context: « على درّاجة النادي صحنٌ أمامي فيه 24 سنًّا وترسٌ خلفي فيه 32 سنًّا. العلم على بُعد 6 دورات للعجلة. »
- Question: « أدِر الدوّاسة حتى تقف العجلة الأمامية عند العلم تمامًا. »
- The lesson's `lead` (one line, story mapping): « كل سنّ تتقدّم به الدوّاسة يُقدّم السلسلة حلقة واحدة. »

**Levels.** Both levels carry the SAME `objective` string (validate:lessons).

*مبتدئ* — `missions` (counters visible, the flag stamps):

| id | F / R | target (wheel turns) | end state: teeth = target × R → pedal turns | what it shows |
|---|---|---|---|---|
| `m1` | 48 / 24 | 3 | 72 teeth → **3/2** pedal turns | ÷ 2 = half, so × 1/2 |
| `m2` | 24 / 32 | 6 | 192 teeth → **8** pedal turns | the SURPRISE: 8 > 6, because one pedal turn = 3/4 wheel turn |
| `m3` | 24 / 32 | 1 | 32 teeth → **4/3** pedal turn | the reverse ratio = the reciprocal of 3/4 |

*متقدم* — PREDICT then check:
- the crank is locked until the student types the pedal turns as a fraction (a fraction keypad: numerator / denominator, ≤ 3 digits
  each);
- then the student rides, and the counters stay veiled until the release at the flag;
- a wrong prediction is refuted by the student's own ride: « توقّعتَ 27/8 دورة، والعلم احتاج 6 دورات ».

| id | F / R | target | end state | contrast it must refute |
|---|---|---|---|---|
| `a1` | 36 / 48 | 9/2 | 216 teeth → **6** | « multiply by the ratio » 9/2 × 3/4 = 27/8 · « flip the first » 2/9 × 3/4 = 1/6 |
| `a2` | 40 / 24 | 5/2 | 60 teeth → **3/2** | a ratio > 1 (5/3): now fewer pedal turns than wheel turns |
| `a3` | 30 / 42 | 10/3 | 140 teeth → **14/3** | a fraction ÷ a fraction, non-trivial: 10/3 × 7/5 = 70/15 = 14/3 |
| `a4` | 42 / 30, then the chain moved to 30 / 42 | 1 each | 30 teeth → **5/7**, then 42 teeth → **7/5** | swapping the gears swaps the ratio: 7/5 ↔ 5/7 are reciprocals, product 1 |

**« جرّب أعدادك » (always open, never counted):**
- F ∈ 12…52 teeth, R ∈ 12…52 teeth;
- target wheel turns = a fraction p/q (p ≤ 40, q ≤ 12);
- a target whose teeth count target × R is not whole is refused with its reason: « هذا العلم يقع بين سنّين: 7/5 × 32 ليس عددًا صحيحًا من
  الأسنان »;
- 0 teeth is refused: « صحنٌ بلا أسنان لا يُدير السلسلة ».

**LabCoach steps** (`coachOf`, one sentence each, shown once, on the control, never the answer):
1. `crank`: « اسحب ذراع الدوّاسة حول محورها لتتقدّم الدرّاجة. »
2. `teeth`: « لخطوة صغيرة دقيقة، اضغط زرّ السنّ. »
3. `flag`: « توقّف حين تلمس العجلة العلم: سيُختَم العدّاد. »
4. `predict` (متقدم): « اكتب عدد دورات الدوّاسة قبل أن تنطلق. »
5. `free`: « غيّر الأسنان والعلم في « جرّب أعدادك ». »

**Wrong moves made VISIBLE:**
- overshoot or undershoot: the gap pill in wheel turns;
- « division makes smaller »: m2 (8 > 6);
- « multiply instead of divide », « flip the first », « flip both »: refuted in متقدم by the ride;
- « the reciprocal of 3/4 is −3/4 »: m3's counter shows 4/3 (and the discovery's option is refuted by 3/4 × (−3/4) ≠ 1);
- « 0,33 is the reciprocal of 3 »: in the free panel, F = 3 and R = 1 give 1/3 pedal turn for one wheel turn. The readout shows 1/3, and
  0,33 × 3 = 0,99 is drawn as a 1 % gap before the flag.

**Discovery** (`ManipulationDiscovery`; opens after m2 AND m3 at مبتدئ; refutable options; nothing above states the rule):
- Question: « لماذا احتاجت العجلة 6 دورات إلى 8 دورات للدوّاسة؟ »
- Right: « لأنّ دورة العجلة الواحدة تحتاج 4/3 دورة للدوّاسة، و 6 × 4/3 = 8 ».
- Wrong:
  - « لأنّ 6 + 2 = 8 » (refuted with m1: 3 wheel turns needed 3/2, not 5);
  - « لأنّ 6 × 3/4 = 8 » (refuted: 6 × 3/4 = 9/2, drawn as a flag before the real one).

The formal phase names: « مقلوب 3/4 هو 4/3 لأنّ 3/4 × 4/3 = 1 » and « 6 ÷ 3/4 = 6 × 4/3 ».

**Core maths:**
- `packages/core/arithmetic/fractions3.js` (new, README table, L1 row): `raw`, `valueOf`, `rawTex`, `reciprocal`,
  `isReciprocalPair`, `divideFractions`, `simplifyBeforeMultiply`, `gearTurns(F, R, teeth)`;
- lab state in `manipulations/logic/gearCrank.js`: `initial(level)`, `turnTo(state, teeth)`, `release(state)`, `judge(state)` →
  `{ atFlag, gap }`, `coachOf(state)`, `report` events `{ kind: 'release', mission, teeth, pedal, wheel, atFlag, gap }`,
  `{ kind: 'predict', mission, value, ok }`, `{ kind: 'custom' }`, `{ kind: 'solved', mission }`.

**Why not another lab (DNA §12):**
- `fair-share` holds the share of one child (two steppers, cakes): division as sharing.
- `egg-trays` holds the dividend swept into trays: division as grouping of naturals, remainder.
- `fourth-gauges` holds the missing cell of a 2×2 price board.
- Here the hand turns a crank. The variable is a number of turns measured in teeth, and the divisor is a RATIO of two tooth counts. The
  resistance is the flag (overshoot); the reciprocal is the reverse gear.
- No container, no slices, no board. Unit-1 `code-lockers` rolls code wheels (a missing factor) — no crank, no ratio.

**Screen budget (tablet and laptop only):**
- 1024×768 with the sidebar open (content column ≈ 450–520 px): bike + road on top (≈ 46 % of the stage height); the two counters
  side by side under it; the crank's grab circle ≥ 56 px. « جرّب أعدادك » in a compact strip under the counters (always open: it must
  fit — measure at 1024×768 first).
- 768×1024: the road strip is wider and the counters sit below.
- Size the bike from BOTH `useLessonViewport` height and the column width (the `hundred-grid` lesson: `min(heightBudget, widthBudget)`).

## 7. Modules (9)

Bricks appear only after their answer (`{qN && <KnowledgeBrick/>}`). « أتوقّع القاعدة » sits before the brick of the rule (§14.3ter).

**M0 أستعدّ** — `objectives`: « أتحقّق من أنّي أضرب كسرين وأربط القسمة بالضرب ». Six true/false statements, own numbers.

| # | Statement | Key | Item measured |
|---|---|---|---|
| 1 | $\frac{3}{5}\times\frac{10}{9}=\frac{2}{3}$ | ✓ (30/45) | 2am.m1.r07 |
| 2 | $\frac{4}{7}\times3=\frac{12}{21}$ | ✗ (= 12/7: the 3 multiplies the numerator only) | 2am.m1.r07 |
| 3 | $\frac{5}{6}\times\frac{9}{10}=\frac{3}{4}$ (rewritten `prep` 2) | ✓ (45/60) | 2am.m1.r07 |
| 4 | « $35\div7=5$ لأنّ $7\times5=35$ » | ✓ | 3am.m1.r02 |
| 5 | $(-24)\div6=-4$ | ✓ | 3am.m1.r02 |
| 6 | $(-18)\div(-3)=-6$ | ✗ (= 6) | 3am.m1.r02 |

**M1 نشاط — « دوّاسة الدرّاجة »** — `objectives`: « أكتشف كم دورةً للدوّاسة تلزم لعددٍ من دورات العجلة، وأتعرّف على المقلوب ». The lab (both
levels) at the top, no `brief`, no workspace title or lead. Each step has an evidence line from `onTrial`, then the question:

1. Evidence « في المهمة 2 دارت العجلة 6 دورات ». Q: « كم دورةً دارت الدوّاسة؟ » (numeric) → **8**. Then « لماذا أكثر من 6؟ » (choice) →
   « لأنّ دورة دوّاسة واحدة تُدير العجلة 3/4 دورة فقط ». Distractors: « لأنّ الصحن الأمامي أكبر » (false, it is smaller: 24 < 32),
   « لأنّ السلسلة تنزلق ».
2. Q: « في المهمة 3: كم دورةً للدوّاسة لدورة واحدة للعجلة؟ » → **4/3**. Then « احسب $\frac{3}{4}\times\frac{4}{3}$ » → **1**.
   « أتوقّع القاعدة » (prompt « عددان جداؤهما 1… ») → brick `maqlub` « مقلوب عدد غير معدوم $x$ هو العدد الذي جداؤه مع $x$ يساوي $1$ ».
3. Q: « 6 دورات للعجلة هي 6 مرّات دورة واحدة: أيّ حساب يعطي عدد دورات الدوّاسة؟ » (choice) → $6\times\frac{4}{3}=8$. Distractors:
   $6\times\frac{3}{4}$, $6+\frac{4}{3}$. Then brick `qisma-darb` « القسمة على $\frac{3}{4}$ هي الضرب في مقلوبه $\frac{4}{3}$ ».
4. (Evidence from `a1` or `a3` if done; otherwise the statement.) Q: « احسب $\frac{9}{2}\div\frac{3}{4}$ » → **6** (= 9/2 × 4/3 = 36/6).
   Brick `qismat-kasrayn` (preceded by « أتوقّع القاعدة »): $\frac{a}{b}\div\frac{c}{d}=\frac{a}{b}\times\frac{d}{c}$.

**M2 معارف** — `objectives`: « أسمّي المقلوب وأعبّر عن القسمة بالضرب في المقلوب ».
- Opens on the lab ALONE (`levels={false}`, world `reverse`, the lesson's `tasks`):
  - `r1`: F 40 / R 24 → one wheel turn = 3/5 pedal turn;
  - `r2`: chain moved to F 24 / R 40 → one wheel turn = 5/3 pedal turns.
  - Context: « نقلت لينا السلسلة: صار الصحن الأمامي هو الترس الخلفي. »; question: « أدِر الدوّاسة حتى تدور العجلة دورة واحدة، في الوضعين. »
- Questions, then each box:
  1. « ما مقلوب 8؟ » → 1/8 (= 0,125);
  2. « ما مقلوب 0,25؟ » → 4;
  3. « ما مقلوب $\frac{7}{5}$؟ » → 5/7;
  4. « هل للعدد 0 مقلوب؟ » → « لا: كل عدد مضروب في 0 يعطي 0 لا 1 ».
- Then the boxes, platform words:
  - definition (natural, fraction, decimal: 0,4 → 1/0,4 = 10/4 = 5/2), 0 excluded;
  - remark « نكتب أيضًا $\left(\frac{7}{5}\right)^{-1}=\frac{5}{7}$ » with « تذكّر — قوى عدد نسبي » (link `getLessonPath('quwat-adad-nisbi')`,
    published);
  - property $a\div b=a\times\frac1b$, $\frac ab\div\frac cd=\frac ab\times\frac dc$;
  - examples: $9\div0{,}75=9\times\frac43=12$ · $\frac54\div10=\frac54\times\frac1{10}=\frac18$ · $\frac89\div\frac23=\frac89\times\frac32=\frac43$.
- « تذكّر — السنة الثانية: جداء كسرين » box, `addition('prior_year_reminder')`, no link: `jida-kasrayn` is unpublished.

**M3 طريقة** (declared `addition('knowledge_formalization')`: the book has no method for division) — `objectives`: « أقسم كسرين وأختزل قبل
الضرب ». One worked chain per question:
1. $\frac{14}{15}\div\frac{21}{10}=\frac{14}{15}\times\frac{10}{21}=\frac{2\times7\times2\times5}{3\times5\times3\times7}=\frac{4}{9}$ — Q « أيّ العوامل
   نختزل قبل الضرب؟ » → 7 and 5.
2. Compound fraction $\dfrac{\frac34}{\frac98}=\frac34\times\frac89=\frac23$ — Q « اكتبها قسمةً ثم احسب » → 2/3.
3. $\dfrac{\frac56}{10}=\frac56\times\frac1{10}=\frac1{12}$ → 1/12; and $12\div\frac34=16$.
4. Traps (true/false):
   - « $\frac{2}{9}\div\frac{3}{4}=\frac{9}{2}\times\frac{3}{4}$ » ✗ (flipped the first);
   - « $0{,}33$ هو مقلوب $3$ » ✗ (0,33 × 3 = 0,99 ≠ 1).

Method box: « لقسمة كسر على كسر: نضرب الأول في مقلوب الثاني، ونختزل قبل أن نضرب ».

**M4 أتمرّن** — `objectives`: « أطبّق المقلوب والقسمة في تمارين متنوّعة ». Seven exercises, own numbers (`cites`):

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | جدارية تغطّي $\frac35$ من جدار تُقسَّم بالتساوي على فوجين؛ ثم $\frac56$ على 5 أفواج؛ ثم: $4\div\frac23$ ، $\frac56\div\frac54$ ، $\frac9{10}\div\frac35$ | 3/10 · 1/6 · 6 · 2/3 · 3/2 | `act-1` |
| 2 | مقلوبات: $9$ ، $0{,}5$ ، $0{,}04$ ، $\frac38$ ، $\frac65$ ، $0{,}75$ ؛ و $\left(\frac52\right)^{-1}$ | 1/9 · 2 · 25 · 8/3 · 5/6 · 4/3 · 2/5 | `ex-1`, `ex-2` |
| 3 | احسب ذهنيًا: $\frac83\times\frac38$ ، $\frac57\times\frac{14}{15}$ ، $\frac94\times\frac49$ | 1 · 2/3 · 1 | `ex-4` |
| 4 | بسّط ثم احسب: $\frac{21}{10}\times\frac{15}{14}$ ، $\frac{16}{27}\times\frac98$ | 9/4 · 2/3 | `ex-5` |
| 5 | اكتب على شكل كسر بسيط: $\frac{15}{8}\div3$ ، $10\div\frac52$ ، $7\div\frac{21}4$ | 5/8 · 4 · 4/3 | `ex-6` |
| 6 | احسب ثم بسّط: $\frac{18}{25}\div\frac{27}{10}$ ، $\frac{14}9\div\frac{35}{27}$ | 4/15 · 6/5 | `ex-7` |
| 7 | قطعة مستطيلة مساحتها $\frac{21}8\,\text{m}^2$ وطولها $\frac72\,\text{m}$: ما عرضها؟ | 3/4 m | `deep-59` |

**M5 مسألة 1 (the lesson problem, `lessonProblem`)** — « زيت الزيتون ».
- Statement: « عصرت عائلة سليم $\frac{45}{4}$ لترًا من زيت الزيتون وتريد تعبئته في قوارير سعة كلّ منها $\frac34$ لتر. »
- Questions and answers:
  1. « كم قارورة تملأ؟ » → 15;
  2. « لو استعملت قوارير سعتها $\frac58$ لتر؟ » → 18;
  3. « أهدت العائلة الجيران 3 قوارير من الصغيرة: كم لترًا أهدت؟ » → 15/8 L.
- Illustration `tags`: « الزيت: 45/4 L », « قارورة: 3/4 L », « قارورة صغيرة: 5/8 L ».

**M6 مسألة 2** — « أحواض الحديقة ».
- Statement: « حديقة مدرسية مستطيلة مساحتها $\frac{35}6\,\text{m}^2$ وعرضها $\frac74\,\text{m}$. »
- Questions and answers:
  1. « ما طولها؟ » → 10/3 m;
  2. « نقسم العرض إلى أحواض عرض كلّ منها $\frac7{12}\,\text{m}$: كم حوضًا؟ » → 3.

**M7 مسألة 3** — « حملة التشجير ».
- Statement: « شارك 18 تلميذًا في حملة تشجير الحيّ، وهم يمثّلون $\frac35$ من $\frac56$ من تلاميذ القسم. »
- Questions and answers:
  1. « ما الكسر الذي يمثّله المشاركون من القسم؟ » → 1/2;
  2. « كم عدد تلاميذ القسم؟ » → 18 ÷ 1/2 = 36;
  3. « كم تلميذًا لم يشارك؟ » → 18.

**M8 إختبار أولي** — five literal epreuves in `Module08Itqan.jsx`, the same data in `FINAL` (`content/exercises.js`):

| # | Prompt | Key | Distractors (misconception) |
|---|---|---|---|
| 1 | مقلوب $\frac38$ | $\frac83$ | $-\frac38$ (MISC-MAQLUB-OPPOSITE) · $\frac18$ (MISC-MAQLUB-NUMONLY) · $0{,}38$ |
| 2 | $\frac56\div\frac{10}9$ | $\frac34$ | $\frac{25}{27}$ (MISC-MAQLUB-NOFLIP) · $\frac43$ (MISC-MAQLUB-FLIPFIRST) · $\frac{27}{25}$ (MISC-MAQLUB-FLIPBOTH) |
| 3 | $12\div\frac45$ | $15$ | $\frac{48}5$ (NOFLIP) · $\frac1{15}$ (FLIPFIRST) · $\frac35$ |
| 4 | $\frac79\div14$ | $\frac1{18}$ | $\frac{98}9$ (NOFLIP) · $18$ (MISC-MAQLUB-REVERSED) · $\frac12$ |
| 5 | « كم قارورة سعتها $\frac34$ L نملأ من $6$ L؟ » | $8$ | $\frac92$ (MISC-MAQLUB-DIVSMALLER) · $\frac18$ (REVERSED) · $\frac{15}2$ |

## 8. Misconceptions (`content/practice/misconceptions.json`, prefix `MISC-MAQLUB-`)

| Id | Wrong belief | Where the lab shows it | Caught by |
|---|---|---|---|
| `MISC-MAQLUB-OPPOSITE` | the reciprocal is the opposite (3/4 → −3/4) | discovery option refuted: product ≠ 1 | test 1, L1, L2 |
| `MISC-MAQLUB-NUMONLY` | reciprocal of a/b is 1/a | m3 shows 4/3 | test 1, L1 |
| `MISC-MAQLUB-NOFLIP` | a/b ÷ c/d = a/b × c/d | a1 prediction refuted (27/8 vs 6) | tests 2–4, L1–L3 |
| `MISC-MAQLUB-FLIPFIRST` | flip the dividend | a1 (1/6 vs 6) | tests 2, 3, L2 |
| `MISC-MAQLUB-FLIPBOTH` | flip both fractions | free panel | test 2, L2 |
| `MISC-MAQLUB-DIVSMALLER` | a quotient is always smaller than the dividend | m2 (8 > 6) | test 5, L2, L4 |
| `MISC-MAQLUB-REVERSED` | 6 ÷ 3/4 computed as 3/4 ÷ 6 | the flag far before the target | test 4, 5 |
| `MISC-MAQLUB-ZERO` | 0 has a reciprocal (or « 1/0 = 0 ») | free panel refuses 0 teeth | L2 (برّر) |
| `MISC-MAQLUB-APPROX` | 0,33 is the reciprocal of 3 | free panel: the 0,99 gap | L2, M3 |

## 9. Practice bank — `content/practice/3am/maqlub-qismat-kasrayn/` (5 levels × 10)

**Corpus candidates** (term 1 unless noted, badge « على منوال اختبار الفصل الأول »):
- `3am-s1-104` ex 1 ② (opposite of A ÷ B, then the reciprocal of A/B);
- `3am-s1-109` ex 1 (reciprocal and opposite);
- `3am-s1-113` ex 1 (reciprocal, rounding to 0,01);
- `3am-s1-103` ex 2 (Q = (N/3) ÷ M — keep the ÷ step, the sums `counted: false`);
- `3am-s1-1` ex 2 (compute and simplify, a division of two fractions);
- `3am-s1-2` ex 4 and ex 7;
- `3am-s1-108` ex 2; `3am-s1-110` ex 2;
- `3am-s2-69` ex 1 and `3am-s2-75` ex 1 (term 2, « الفصل الثاني »);
- `3am-s3-59` ex 1 (term 3);
- misfiled `1am-s1-100` ex 2 (header 3AM, term 1).

**Honest count of FAITHFUL `term_exam` sheets: about 6–8.** Almost every corpus exercise mixes ÷ with + / − (`jam-tarh`, `amaliyat`, not
yet published). A sheet stays faithful only if its counted steps are reciprocals or divisions. The other steps become `counted: false`,
or the sheet is relabelled `term_exam_modelled`.

**Plan per level:**

| Level | Content | Provenance |
|---|---|---|
| L1 (2–3 ن, one skill) | reciprocals (natural, decimal, fraction, ⁻¹ notation); a ÷ c/d; a/b ÷ n | 2 term_exam (`3am-s1-109` ex 1, `3am-s1-113` ex 1, reciprocal parts) · 6 modelled · 2 adapted (`ex-1`, `ex-6`) |
| L2 (calc + علّل) | « is 0,33 the reciprocal of 3? برّر »; « why has 0 no reciprocal? »; a ÷ b > a when b < 1 — برّر | 1 term_exam (`3am-s1-104` ex 1) · 7 modelled · 2 adapted (`self-1`, `self-11`) |
| L3 (complete exercise, 3–4 questions) | compute A = a/b ÷ c/d, B = compound, C = n ÷ c/d, irreducible form, « show that A × B = 1 » | 3 term_exam (`3am-s1-1` ex 2, `3am-s1-108` ex 2, `3am-s1-110` ex 2, ÷ parts) · 5 modelled · 2 adapted (`ex-7`, `ex-5`) |
| L4 (mobilises an earlier lesson of term 1: unit 1) | quotients of relatives + division of fractions; signed steps `counted: false` | 1–2 term_exam (`3am-s1-103` ex 2, `1am-s1-100` ex 2) · 8 modelled |
| L5 (« الوضعية الإدماجية (08 ن) », two parts, a justified decision) | bottling and pricing (how many bottles, which bottle size wastes less), the whole from a fraction of a fraction | 0–1 term_exam · 8 `platform_addition` `term_exam_modelled` (`modelledOn: "3am-s1"`) · `deep-71` adapted once |

**Answer types:**
- `rational` with `requiredForm: 'irreducible'` where the statement says « على أبسط شكل »;
- `choice` (every distractor FALSE and tagged with its `MISC-MAQLUB-*`);
- `selfCheck` for « برّر ».

Each LP is primary on ≥ 8 questions. Each story is woven with a good value, short; a pure « احسب » item has no story.

**Oracle:** `scripts/practice-oracle/maqlub-qismat-kasrayn.mjs`, exact BigInt rationals from `scripts/practice-oracle/helpers.mjs` (never
`packages/core`). It recomputes every key, checks every distractor is FALSE, checks every irreducible key is reduced, and checks every
reciprocal satisfies x·y = 1. It is imported in `scripts/practice-answer-oracle.test.mjs`. Add the lesson to `active.json` and
`exam-style.json`.

## 10. Risks & owner questions

1. **Gear ratios as division.** Are they clear enough for 13-year-olds? The lab says « سنّ » and « حلقة », never « نسبة التروس ». The
   numbers are physical tooth counts. Watch the screenshots: the two counters must read at a glance.
2. **The ⁻¹ notation** is shown only as a remark tied to the published `quwat-adad-nisbi` (a⁻¹ = 1/a). If the owner prefers no notation
   before unit 3 is fully generated, drop the remark (the book uses it in know-1 and ex-2).
3. **`prep` item 1** (the reciprocal of 0,8) is new content in « أستعدّ ». It is moved to the test register rather than diagnosed.
4. **Cross-lesson edge P1 ← `3am_qismat-nisbiyayn_P1`** depends on unit 1's final wording. If that P1 changes meaning, keep intra-lesson
   edges only.
5. **Seeding** makes `_unit/prepDiagnostic.test.js` and `coursesData.test.js` red until the publish flip (expected, guide « Adding a
   GRADE »).

## 11. Generator checklist

- [ ] Seed `_unit/` (README), set `challenge.sourceElementId`, fix the five catalogue `textbookRef` blocks, write `build-extraction.py` →
  `extraction.json`:
  - whole unit, `Fraction` assertions;
  - `verified: True` for L1's elements;
  - the six discrepancies;
  - the boundary header.
- [ ] `fractions3.js` (+ `fractions3.test.js`, L1 functions), imported by path; `npx vitest run arithmetic` in `packages/core`.
- [ ] Lab:
  - type `gear-crank` in `packages/core/curriculum/manipulationTypes.js`;
  - theme `bikestand` in `VISUAL_THEMES`;
  - registry entry (lazy);
  - `levels.js` preset (same `objective` on both levels);
  - strings in `i18n/locales/ar/lesson.manipulation.json › gearCrank`;
  - `logic/gearCrank.js` + test: every mission solved by following `coachOf`; overshoot gap; prediction refusal; the free panel's
    refusals (0 teeth, non-whole teeth);
  - `gearCrank.render.test.jsx` (both levels and world `reverse`; no `{{`; no Latin prose; opens on its CONTEXT then ONE question; says
    each thing once);
  - section in `MANIPULATION_CONTRACT.md` (next free § number, re-read first) and a row in `MANIPULATION_DNA.md` §15;
  - screenshots of the initial state, an overshoot, the m2 stamp, a refused prediction and the formal phase, at 768×1024, 1024×768
    (sidebar open), 1280×800, 1366×768, 1920×1080 — reviewed and iterated.
- [ ] Lesson:
  - 9 modules; `lesson.config.js` header: design, rejected entries, order of ideas, LP history;
  - `knowledge.jsx` / `knowledgeGraph.js` (progressive map: no guide node on the root, ≥ 2 core nodes per guide node);
  - `content/exercises.js` + `content/content.test.js`: independent BigInt rationals; every key and distractor; `FINAL` options present
    literally in `Module08Itqan.jsx`, backslashes doubled;
  - `content/problems.js` + test;
  - `content/textbook.js` (reference data only).
- [ ] « أستعدّ » measures `2am.m1.r07` and `3am.m1.r02`; `priorKnowledge` set; `pointPrerequisites` as in §2.
- [ ] `npm run generate:lesson-index` (never touch `App.jsx`); `npm run generate:learning-net`.
- [ ] e2e:
  - `apps/web/e2e/lesson-kit/3am-kusur-natiqa-maqlub.mjs`: no `[data-module-brief]` above the lab; lab before the first question;
    bricks hidden before their answer; raw `$` scan; RTL;
  - a block in `e2e/lesson-kit/lab-coach.mjs` and `moyen-retrofit-phase1.mjs`;
  - `node apps/web/e2e/lesson-route-boundary.mjs`; `e2e/moyen-draft-grades.mjs` if useful.
- [ ] Gates: `npm test`, `npm run validate:lessons`, `npm run check:textbook`, `npm run check:lessons` (lesson index + entry budget
  ≤ 330 KB gzip), `npm run build`.
- [ ] Bank: 50 sheets + oracle + `active.json` / `exam-style.json` / `policy.json` / `misconceptions.json` entries.
- [ ] Publish (coordinator, guide §11 « Publish a lesson »):
  1. catalogue `status: "available"`, `durationMinutes` ≤ 90, `difficulty`, `icon`;
  2. lesson index regenerated;
  3. `exportCurriculum.mjs` → `smarter:import-curriculum`;
  4. publish the lesson, its 9 modules and 50 exercises in the LOCAL database;
  5. commit, fast-forward `dev`, push `origin dev`;
  6. append to `docs/reports/MOYEN_ROLLOUT_PROGRESS.md`.

## 12. Generator notes (2026-10-25)

- **Plan error fixed — `self-1`.** The plan wrote « 4/3 ÷ 8/9 = 3/2 ». 3/2 is in none of the printed options (2/9, 1/6, 2/3). Zoom at 220 dpi: the scan prints « 4/3 ÷ 8/9 » as an island, and the only reading that gives an option is 8/9 ÷ 4/3 = 2/3. Recorded in `extraction.json › discrepancies`. The lesson's own test item (5/6 ÷ 10/9) is unaffected.
- **Reading rule of the scan.** The README says islands are read left to right. The only readings that match the printed options of `prep` 7, 11, 12 and `self-1` are the RIGHT-to-left ones (4/3 − 8/15, (−8) − (−12), (−7) ÷ (−2), 8/9 ÷ 4/3), while ex-6 reads naturally. The header of `build-extraction.py` says so.
- **`prep` items 8 and 12 have two true options each** (−7 > −9 and −9 < −7; 3,5 and 7/2): recorded in `discrepancies`. Item 4's figures are left to `tasawi-muqaranat-kasrayn`.
- **Extraction.** 124 elements, pp. 22–36; the 17 elements of this lesson plus the unit page are `verified: True`; the other lessons' elements are transcribed more briefly with `verified: False` (their leads re-read at 200–250 dpi); `ex-48…52` (compound fractions) are only named; `ict` (book p. 37) is recorded MISSING. `prep` is split by `items` (`1-2` → this lesson; `3-4-5`, `6-7`, `8-12`, `9-10-11` → L2…L5). Destinations of this lesson: `act-1`, `ex-1`, `ex-2`, `ex-4`…`ex-7`, `deep-59` → module 4; `deep-71` → مسألة 3 (`sourceElementIds` on the situation resource); `self-1`, `self-7`, `self-11` and `prep` 1 → module 8.
- **Catalogue.** The three الكفاءات got the plan's final wording; `textbookRef.pages.method = null`; `pointPrerequisites` P2 ← P1, P3 ← P2 (no cross-lesson edge: `qismat-nisbiyayn` is not published); `durationMinutes` 63 (modules without مسائل, as the validator checks), `difficulty` « متوسط », icon 🚲; `units_3am › kusur-natiqa.challenge.sourceElementId = "challenge"` (the card's text is untouched: owner question 2).
- **Lab.** `gear-crank` as planned, with these deviations: the free panel accepts F, R in 12…52, so the plan's « F = 3, R = 1 → 0,33 × 3 = 0,99 » demo is NOT reachable; the « 0,33 is not the reciprocal of 3 » trap is posed in module 3 (true/false) instead. The discovery exists only at مبتدئ, world `ride`. A release is the pointer-up of the crank, or 650 ms after the last tooth key. `ok` events are emitted per release; `tk: 'solved'` follows.
- **Modules.** Module 1 has four steps (the plan's step 2 also asks the 3/4 × 4/3 product and a short « which relation » choice before the brick `maqlub`); step 4 shows a fallback sentence when the student has not run `a1`. Module 2 recalls `quwat-adad-nisbi` with a real link (published) and `jida-kasrayn` without one. مسألة 2 and 3 use `choice conclude` steps for fractional answers because `GuidedProblem` numeric steps take numbers only.
- **Bank.** 50 sheets, 9 `term_exam` (kept in structure with new numbers; none word for word, non-division steps `counted: false`), 34 `term_exam_modelled`, 7 `adapted`. `policy.json` has a stray `nisba-miawiya-3am` entry at the root (another lesson's file) — to be fixed by its owner.
