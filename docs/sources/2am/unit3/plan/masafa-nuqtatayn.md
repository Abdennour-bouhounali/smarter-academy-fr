# Plan — `masafa-nuqtatayn` « المسافة بين نقطتين على مستقيم مدرّج » (2AM unit 3, entry 5 of 6 — pair 4, lane A)

Read the unit [`README.md`](README.md) first. `talim-mustaqim-mudarraj-2`, `muqarana-nisbiya` and `jam-tarh-nisbiya` are published
before this lesson.

## 1. Identity

- **Code** `masafa-nuqtatayn` · **title** « المسافة بين نقطتين على مستقيم مدرّج » · unit `adad-nisbiya-2` · catalogue order 15 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/masafa-nuqtatayn/`.
- **Textbook pages** (PDF = book − 3): `act-5` p. 41 (PDF 38, the end of the line is cut); `know-2c` p. 44 (PDF 41); `ex-35` p. 48;
  `self-9` p. 49; `deep-40`, `deep-41`, `deep-42` p. 50; `ict-1` p. 53 (PDF 50). The book has NO طريقة for r07: the platform writes its own.
  Catalogue `textbookRef` (activity 41, knowledge 44, method null) is right.
- `durationMinutes` ≈ 75; `difficulty` « متوسط »; icon 🌡️.

## 2. Programme & net

**Item:** `2am.m4.r07` « حساب المسافة بين نقطتين ذات فاصلتين معلومتين على مستقيم مدرّج ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | حساب المسافة بين نقطتين على مستقيم مدرّج بطرح الفاصلة الصغرى من الفاصلة الكبرى | حساب المسافة بين نقطتين على مستقيم مدرّج بطرح الفاصلة الصغرى من الفاصلة الكبرى، مثل $A(+4{,}5)$ و $B(-3)$: $AB=(+4{,}5)-(-3)=7{,}5$ | Example added (own numbers). |
| P2 | التحقّق من أنّ المسافة بين نقطتين عدد موجب دائما | معرفة أنّ المسافة بين نقطتين عدد موجب دائمًا وأنّ $AB=BA$ ، وإيجاد فاصلتي النقطتين اللتين تبعدان بمسافة معلومة عن نقطة معلومة (حلّان) | **Adds the two points at a given distance** (book `deep-41`, `deep-42`, `ict-1`) — otherwise P2 is a one-line remark with nothing to practise. |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `2am.m4.r05` | جمع وطرح عددين نسبيين | `jam-tarh-nisbiya` | published → link | items 1, 2, 6 |

Extra `priorKnowledge` (no net link, measured — README owner Q2): `muqarana-nisbiya-2am` (« which abscissa is larger »: item 3),
`masafa-sifr` (r01: item 5), `faasila-2am` (r01: item 4).

**noRebuild:** none (no `extends` / `consolidates`).

**pointPrerequisites:**
- intra: P2 ← P1;
- along `2am.m4.r05 → 2am.m4.r07` (requires): **P1 ← `2am_jam-tarh-nisbiya_P3`** (the distance IS a difference of relatives);
- no edge toward `muqarana-nisbiya` (no net link r02 → r07 — owner Q2; with the link, P1 ← `2am_muqarana-nisbiya_P2`).

**Where it is used next:** the synthesis; 4AM `hisab-murakkibatay` and `ithbat-khawas-maalam` (r07 → 4am.m4.r05) — §12; 4AM
`muntasaf-masafa` P2 meets the distance in a frame (no net link from r07 to 4am.m4.r07).

## 3. Boundary

**Owns:** see README. **Leaves:** the comparison as a skill (`muqarana-nisbiya`, recalled in M2 « تذكّر » WITH a link: « the larger
abscissa is to the right »); the subtraction rule (`jam-tarh-nisbiya`, recalled WITH a link); the midpoint as a formula $\frac{a+b}2$
(4AM: here « half the distance from the smaller end »); distances in the plane (4AM).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-5` | A(5), B(−1), C(−6), D(…): measure AB, AC, BC, CD, then compute from the abscissae, compare, find a rule | measure vs compute | **Not the entry** (the rule is conjectured from four measures, no necessity). M4 item 1 (own: A(4), B(−2), C(−7)) |
| `know-2c` | « the larger abscissa minus the smaller », A(+6), B(−2,5), the distance is positive | the rule and the remark | M2 (own words, own example) |
| `ex-35` | AB and CD in three cases (decimals, −150, +125) | P1 | M4 item 2 (own numbers) |
| `ict-1` | GeoGebra: other positions with AB = 7; AB from abscissae | translation keeps the distance | M4 item 3 (**adapted**: no software — the lab's free mode does it) |
| `deep-40` | midpoint of [AB] in three cases | half the distance | M4 item 4 (own numbers), M6 |
| `deep-41` | M(−1), MN = 3,5: N? | two answers | lab a2 (own numbers), M4 item 5 |
| `deep-42` | A(−1,3), AB = 0,9, AC = 4,2, BC = 3,3: B and C? | two configurations | M4 item 6 (own numbers) |
| `self-9` | AB on a figure (−3 and 5) | P1 | test register + bank |

## 5. Design

**The lesson in one paragraph.** The school's weather club keeps a big thermometer board in the courtyard: each morning the members
clip coloured beads on it — the temperature at dawn and at noon, or the dawn temperatures of two cities. A brass caliper hangs by the
board: one jaw is clipped on a bead, the student turns the screw to OPEN the caliper until the free jaw touches the other bead; the
opening, read on the screw's dial, is the gap. Djelfa at dawn $-4$, at noon $+9$: the jaw must cross the zero, the opening is $13$, not
$5$. Two negative readings $-7$ and $-2$: the opening is $5$, not $9$. The caliper can never open « negatively »: a gap is a positive
number, whichever bead holds the clip. At the advanced level the student types the opening BEFORE turning the screw, and a lone bead with
a fixed opening swings both ways: two readings are at the same gap from one temperature.

**Entry point — candidates compared:**
- (a) **The book's act-5** (measure four segments, then compute): the measure gives the answer before any reasoning. Rejected → M4.
- (b) **Two probes reading a signed difference** (`difference-meter`, 3AM): the needle computes; the order of the probes is that lab's
  idea.
- (c) **A rigid bar laid between two points**: the length is given by the bar; nothing is predicted.
- (d) **An opening held by the hand, clamped on one point, that must reach the other**: the hand holds the DISTANCE itself (a positive
  quantity by construction), crossing zero makes « add the two distances to zero » visible, the swing makes the two answers visible.
  **Chosen.** `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'meteoboard' }`.

**Order of ideas:** two readings on both sides of zero (the gap crosses zero) → two negative readings (the gap is the difference of the
distances to zero) → two positive readings → one reading at zero → one rule: larger − smaller (a subtraction of relatives covers all
cases) → the gap is positive and the clip may be on either bead → a fixed opening swung both ways (two answers) → معارف → طريقة →
practice, مسائل, test.

**Contexts (values):** the school's weather club (observing, recording honestly), three Algerian cities in winter (Djelfa, Tamanrasset,
Constantine — the country's diversity), bus stops on a straight road (planning), a tower's floors (living together).

## 6. Lab — `gap-caliper` « مسماك الفرق » (new type)

**Drawn world `meteoboard`** (new theme, kind `axis`, label « لوحة نادي الأرصاد: مقياس حرارة كبير وخرزات ومسماك نحاسي »):
- the school courtyard, a white wooden board with a tall thermometer scale graduated from −10 to +12 °C (1 °C marks, 0,5 at متقدم), the
  zero line drawn across the board in blue, a small Stevenson screen and a wind vane beside it;
- coloured beads clipped on the scale (city names on small tags: « الجلفة — الفجر », « الجلفة — الظهر », « سطيف », « تمنراست »…);
- a brass caliper parallel to the scale: a fixed jaw clipped on one bead, a free jaw moved by a screw; the screw's dial reads the opening
  (always ≥ 0); a translucent band between the jaws shows the gap, split at zero into its two coloured parts when it crosses zero;
- KidFigure Nour (girl, hijab + long tunic, club badge) at مبتدئ; Ilyes (boy, hoodie) at متقدم; mood by verdict.

**The variable in the hand: the OPENING d of the caliper** (d ≥ 0; step 1 at مبتدئ, 0,5 at متقدم) and, at متقدم, the swing (up / down)
of the free jaw.

**Gestures (three paths):** turn / drag the screw (the free jaw slides along the scale); −/+ steppers « افتح » / « أغلق »; keyboard
(↑/↓, PageUp/PageDown by 5); the swing: two big buttons « إلى الأعلى » / « إلى الأسفل » (≥ 44 px). Enter « ثبّت » checks.

**The judge:** the free jaw lands at anchor ± d; it is right when it touches the target bead exactly (`relative.js gap`). A typed
prediction (متقدم) is judged before the screw unlocks: a negative typed value is refused with the jaws drawn crossed (« الفكّان لا
يتقاطعان: المسافة لا تكون سالبة »).

**Opening (no title):**
- Context: « يعلّق أعضاء نادي الأرصاد خرزة لكلّ درجة حرارة مسجّلة. المسماك يُشدّ على خرزة، ونفتحه حتى يلمس فكّه الآخر الخرزة الثانية. »
- Question (g1): « الجلفة: $-4$ °C عند الفجر و $+9$ °C عند الظهر. افتح المسماك حتى يلمس خرزة الظهر، ثم اكتب الفرق بين الدرجتين. »
- `lead`: « فتحة المسماك هي المسافة بين الخرزتين. »

**Levels** (same `objective` on both):

*مبتدئ* (the clip on the LOWER bead; integers):

| id | Beads | Opening | End state |
|---|---|---|---|
| `g1` | Djelfa dawn $-4$ / noon $+9$ | crosses zero: 4 + 9 | **13** |
| `g2` | Sétif $-7$ / Batna $-2$ | 7 − 2 | **5** |
| `g3` | Oran $+3$ / Tamanrasset $+11$ | 11 − 3 | **8** |
| `g4` | Algiers $0$ / Djelfa $-6$ | | **6** |

*متقدم* (PREDICT: type d first; decimals; the clip may be on either bead):

| id | Task | End state |
|---|---|---|
| `a1` | $A(-2{,}5)$ , $B(+6)$ ; clip on A | **8,5** |
| `a2` | one bead at $+1{,}5$ ; « a city is $4$ °C away from it: where can its bead be? » (opening fixed at 4, swing both ways) | **+5,5** and **−2,5** (both found) |
| `a3` | $C(-6{,}5)$ , $D(+3)$ ; clip on the UPPER bead D | **9,5** (same as from C: $DC=CD$) |

**« جرّب أعدادك » (always open):** two readings (|x| ≤ 10, 0 to 2 decimals; `-` or `−`; Arabic-Indic digits) or one reading and a gap;
the caliper does the rest; never counted.

**LabCoach** (`sa.labCoach.gap-caliper.off`): 1 `screw` « أدر البرغي لتفتح المسماك » · 2 `fix` « ثبّت حين يلمس الفكّ الخرزة » · 3 `type`
« اكتب الفرق » · 4 `predict` (متقدم) · 5 `swing` (a2) « حرّك الفكّ إلى الجهة الأخرى » · 6 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- g1: « كم درجة من −4 إلى الصفر؟ ومن الصفر إلى +9؟ » (4, 9) → « لماذا الفتحة 13 لا 5؟ »;
- g2: « المسافة إلى الصفر لـ −7؟ ولـ −2؟ » (7, 2) → « لماذا الفتحة 7 − 2؟ »;
- g3: « أيّ حساب يعطي 8 من +11 و +3؟ »;
- g4 (ends on the RULE): « في الحالات الأربع: الفاصلة الكبرى − الفاصلة الصغرى » ($(+9)-(-4)=13$ ، $(-2)-(-7)=5$ …);
- a2: « كم نقطة تبعد 4 عن +1,5؟ » (two);
- a3: « هل تغيّرت الفتحة حين شددنا المسماك على الخرزة الأخرى؟ » (no: $AB=BA$, positive).
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per notch, `bell` when the jaw touches, `flag` / `over`), full screen,
`guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:**
- `subDist` (g1: opens to 5): the jaw stops at +1, short of the noon bead; the band shows the missing part beyond zero;
- `addSame` (g2: opens to 9): the jaw overshoots to +2, past the zero line;
- `negDist` (types −13): crossed jaws drawn, refused;
- `oneAnswer` (a2: stops after +5,5): the task stays open; the coach suggests the swing;
- `orderSwap` (a3: expects a different value from the other bead): the dial shows the same 9,5.

**Formal phase:** with the student's readings: « $AB=(+9)-(-4)=(+9)+(+4)=13$ ؛ $CD=(-2)-(-7)=(-2)+(+7)=5$ ؛ المسافة موجبة دائمًا ».

**Core maths:** `relative.js` E5 row (`gap`, `pointsAt`, `midpointAbscissa`). Lab logic `logic/gapCaliper.js`: `tasksOf`, `open(state, d)`,
`swing(state, dir)`, `jawAt(state)`, `judge(task, state)` → `{ ok, landed, short, over }`, `judgePredict(task, text)` → `{ ok, model }`,
`coachOf`; events `{ kind: 'open', task, d }`, `{ kind: 'fix', task, d, landed, ok, model }`, `{ kind: 'predict', task, value, ok }`,
`{ kind: 'swing', task, dir }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `zero-probe` (this unit, its closest kin): there the hand holds a cable length FROM ZERO plus a side toggle, and the output is a
  POSITION; here the anchor is ANY point, the jaws cannot go negative, and the output is a GAP between two given positions. The scale is
  a thermometer board, not the sea; the gesture is a screw on a caliper, not a cable unrolled.
- `difference-meter` (3AM): two probes read a SIGNED difference (« red minus black »); here the reading is never signed and the student
  predicts it.
- `ruler-compare` (1AM), `level-laser` (2AM m1): comparing / reading graduations; nothing is opened.
- `midpoint-distance`, `route-compare` (4AM): distances in a frame by Pythagoras.

**Screen budget:** 1024×768, lab column ≈ 414 px: the board 414 × 420 px (scale −10 … +12 = 22 °C → 18 px per degree, 9 px per half
degree; beads 24 px with a 44 px hit area), the caliper drawn at the scale's left edge, the dial + answer pill + swing buttons in one row
below. No scroll at 768×1024 and 1024×768 (the board's height is computed from the screen height, `HundredGrid`'s rule).

**DOM:** `[data-gap-caliper][data-level][data-task][data-d][data-solved]`, `[data-gc-bead=<id>][data-value]`, `[data-gc-anchor]`,
`[data-gc-jaw][data-value]`, `[data-gc-screw]` (slider, `aria-valuenow` = d), `[data-gc-swing=up|down][aria-pressed]`, `[data-gc-band]`,
`[data-gc-answer]`, `[data-gc-verdict]`, `[data-gc-free]`, `[data-gc-formal]`, `[data-gc-kid][data-mood]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من طرح الأعداد النسبية ومقارنتها والمسافة إلى الصفر »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $(+6)-(-2{,}5)=(+8{,}5)$ | ✓ | r05 |
| 2 | $(-7)-(-2)=(-9)$ | ✗ ($-5$) | r05 |
| 3 | « $-6{,}5$ أكبر من $-6$ » | ✗ | muqarana-nisbiya |
| 4 | « على مستقيم تدريجته $1$ ، النقطة التي تبعد $3$ تدريجات يسار $-1$ فاصلتها $-4$ » | ✓ | r01 |
| 5 | « المسافة إلى الصفر للعدد $-4{,}5$ هي $-4{,}5$ » | ✗ | r01 |
| 6 | $(+2)-(+9)=(-7)$ | ✓ | r05 |

**M1 نشاط — « مسماك الفرق »** — `objectives`: « أكتشف كيف أحسب المسافة بين نقطتين من فاصلتيهما ». Lab on top; then the trace and the
bricks: `masafa-abr-sifr` (g1) · `masafa-nafs-jiha` (g2) · « أتوقّع القاعدة » then `qaidat-masafa` (g4) · `masafa-mujaba` (a3) · `nuqtatan`
(a2).

**M2 معارف** — `objectives`: « أسمّي قاعدة حساب المسافة بين نقطتين ».
- Lab ALONE (`levels={false}`, $A(-4)$ , $B(+3)$ → **7**).
- Boxes (after the answer): « تذكّر » toward `jam-tarh-nisbiya` (link: subtract = add the opposite) and toward `muqarana-nisbiya` (link:
  the larger number is to the right / higher) · the rule (platform words) · the remark « موجبة دائمًا، $AB=BA$ » · example
  $A(+5{,}5)$ ، $B(-1)$: $AB=(+5{,}5)-(-1)=6{,}5$.

**M3 طريقة** — `objectives`: « أحسب مسافة وأجد نقطتين على بعد معلوم ». Steps:
1. $A(+4{,}5)$ ، $B(-3)$: the larger is $+4{,}5$ → $AB=(+4{,}5)-(-3)=(+4{,}5)+(+3)=7{,}5$;
2. $C(-7)$ ، $D(-2{,}5)$: the larger is $-2{,}5$ → $CD=(-2{,}5)-(-7)=4{,}5$ (Q « لماذا لا نطرح $-7$ من $-2{,}5$ بالعكس؟ » — we would get $-4{,}5$);
3. points at distance $3$ from $M(-1{,}5)$: $(-1{,}5)+3=+1{,}5$ and $(-1{,}5)-3=-4{,}5$.
Method box: « نعيّن الفاصلة الكبرى، ثم نطرح منها الصغرى؛ وللنقطتين على بعد $d$ من $M$ : نضيف $d$ ونطرح $d$ ».

**M4 أتمرّن** — `objectives`: « أتدرّب على حساب المسافات واستعمالها »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | $A(+4)$ ، $B(-2)$ ، $C(-7)$ : احسب $AB$ ، $AC$ ، $BC$ ، ثم تحقّق: $AC=AB+BC$ ؟ | $6$ ; $11$ ; $5$ ; نعم | `act-5` |
| 2 | احسب $AB$ و $CD$: أ) $A(-1{,}8)$ ، $B(+0{,}7)$ ، $C(-0{,}3)$ ، $D(+1{,}2)$ ب) $A(-6)$ ، $B(-13)$ ، $C(+2{,}5)$ ، $D(-9)$ ج) $A(-120)$ ، $B(+80)$ ، $C(+150)$ ، $D(-17{,}5)$ | $2{,}5$ ، $1{,}5$ ; $7$ ، $11{,}5$ ; $200$ ، $167{,}5$ | `ex-35` |
| 3 | جد ثلاثة أزواج أخرى $(A\,;B)$ على المستقيم المدرّج بحيث $AB=7$ ، ثم احسب $AB$ لـ $A(-36{,}5)$ و $B(-29{,}5)$ | e.g. $(-5\,;2)$ ، $(0\,;7)$ ، $(-10\,;-3)$ ; $7$ | `ict-1` (adapted) |
| 4 | فاصلة منتصف $[AB]$: $A(-24)$ و $B(+10)$ ؛ $A(-61)$ و $B(-29)$ ؛ $A(-4{,}6)$ و $B(+1{,}8)$ | $-7$ ; $-45$ ; $-1{,}4$ | `deep-40` |
| 5 | $M(+1{,}5)$ و $MN=4$ : ما فاصلة $N$ ؟ | $+5{,}5$ أو $-2{,}5$ | `deep-41` |
| 6 | $A(-1{,}5)$ ، $AB=1{,}2$ ، $AC=4$ ، $BC=2{,}8$ : ما فاصلتا $B$ و $C$ الممكنتان؟ | $B(-0{,}3)$ و $C(+2{,}5)$ ، أو $B(-2{,}7)$ و $C(-5{,}5)$ | `deep-42` |

**M5 مسألة 1 (`lessonProblem`) — « فارق الحرارة في ثلاث مدن »** — `objectives`: « أحسب المدى اليومي لدرجات الحرارة وأقارن ».
- Statement (table): « في يوم شتوي: الجلفة الصغرى $-5$ والكبرى $+8$ ؛ تمنراست $+4$ و $+22$ ؛ قسنطينة $-1$ و $+12$ (°C). »
- Q/A: 1) فارق كلّ مدينة → $13$ ; $18$ ; $13$ ; 2) أكبر فارق → تمنراست ; 3) « مدينة رابعة صغراها موجبة وتبعد $6$ درجات عن صغرى الجلفة:
  ما صغراها؟ » → $+1$ (the other point, $-11$, is negative).

**M6 مسألة 2 — « محطّات الحافلة »** — `objectives`: « أحسب مسافات على طريق مستقيم وأعيّن منتصفًا ».
- Statement: « طريق مستقيم مدرّج بالكيلومتر، مبدؤه المحطة الرئيسية: $A(-3{,}5)$ ، $B(+2{,}5)$ ، $C(+6)$ . »
- Q/A: 1) $AB$ ، $AC$ ، $BC$ → $6$ ، $9{,}5$ ، $3{,}5$ km ; 2) « كشك في منتصف $[AC]$ : فاصلته؟ » → $-3{,}5+\frac{9{,}5}2=+1{,}25$ ;
  3) « أيّ محطة أقرب إلى الكشك؟ » → $B$ ($1{,}25$ km vs $4{,}75$).

**M7 مسألة 3 — « ارتفاعات البرج »** — `objectives`: « أحسب مسافات بين ارتفاعات موجبة وسالبة ».
- Statement: « في برج: المرأب على $-7{,}5$ m ، الطابق الأرضي $0$ ، الطابق الثالث $+9$ m ، السطح $+24$ m . »
- Q/A: 1) من المرأب إلى السطح → $31{,}5$ m ; 2) من الطابق الثالث إلى المرأب → $16{,}5$ m ; 3) « هل المسافة من السطح إلى المرأب هي نفسها
  من المرأب إلى السطح؟ » → نعم.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | $A(-4)$ ، $B(+9)$ : $AB$ | $13$ | $5$ (SUBDIST) · $-13$ (NEGDIST) · $9$ | P1 |
| 2 | $C(-7)$ ، $D(-2)$ : $CD$ | $5$ | $9$ (ADDSAME) · $-5$ (NEGDIST) · $-9$ | P1 |
| 3 | $E(+2{,}5)$ ، $F(+11)$ : $EF$ | $8{,}5$ | $13{,}5$ (ADDSAME) · $-8{,}5$ (NEGDIST) · $9$ | P1 |
| 4 | النقط التي تبعد $3$ عن $M(-1)$ | $-4$ و $+2$ | $+2$ فقط (ONEANSWER) · $-4$ فقط (ONEANSWER) · $-2$ و $+4$ (SIGNSWAP) | P2 |
| 5 | فاصلة منتصف $[AB]$ ، $A(-6)$ و $B(+2)$ | $-2$ | $4$ (HALFDIST) · $-4$ (SUMNOHALF) · $0$ | P2 |

## 8. Misconceptions (`MISC-MASAFA2-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `SUBDIST` | subtract the distances to zero even across zero | g1 jaw stops short | test 1 |
| `ADDSAME` | add the distances to zero on the same side | g2 jaw overshoots | tests 2, 3 |
| `NEGDIST` | a distance can be negative (smaller − larger) | crossed jaws | tests 1–3 |
| `ONEANSWER` | only one point at a given distance | a2 stays open | test 4 |
| `SIGNSWAP` | the two points are $-(M\pm d)$ | — | test 4 |
| `HALFDIST` | the midpoint's abscissa is half the distance | — | test 5 |
| `SUMNOHALF` | the midpoint's abscissa is the sum | — | test 5 |
| `ORDERSWAP` | $AB\neq BA$ | a3 | M7 q 3 |

## 9. Practice bank (`content/practice/2am/masafa-nuqtatayn/`, 5 × 10)

**Read by the planner** (README partition): `2am-s2-63` ex 2 q 2–q 3 (A(+4,5), B(−5), C(−2): BC, AC, deduce AB; K such that C is the
midpoint of [BK]); `2am-s2-62` ex 2 q 2, q 5 (A(−5), B(+3), C(−2): the midpoint M of [AB], distances BC and ML with L(+5)); `2am-s2-70`
ex 1 q 2 (E(−5), G(−30), F(+20): EG, FE, « what is E for [GF]? »); `2am-s2-73` ex 1 b (L(−6), K(−4): KL); `2am-s1-66` ex 3 (A(−7), B(−3),
C(+2): AB, BC, the midpoint E of [AC] — term 1); `2am-s1-69` ex 4 q 2, q 3 (F(+5), E(−3): EF; the midpoint G — term 1). **To read:**
`2am-s2-69` ex 1 q 3 (values on the scan), `2am-s2-71` ex 1 (no text layer), `2am-s2-57` ex 1 q 2 (unindexed exercise, poor layer).

**Honest FAITHFUL count: 6 read today; 7–8 expected.**

| Level | Content | Provenance |
|---|---|---|
| L1 | distances from two abscissae (integers, decimals, same / opposite sides) | 2 term_exam (`-73` ex 1 b, `-70` ex 1 q 2 distances) · 6 modelled · 2 adapted (`ex-35`, `self-9`) |
| L2 | a distance then « برّر » (positive? which is larger?); the two points at a given distance | 1 term_exam (`2am-s1-69` ex 4 q 2–q 3) · 7 modelled · 2 adapted (`deep-41`, `ict-1`) |
| L3 | full exercise: place points, distances, a midpoint, « deduce AB » | 3 term_exam (`-63` ex 2 q 2–q 3, `-62` ex 2 q 2 + q 5, `2am-s1-66` ex 3) · 1 after reading · 5 modelled · 1 adapted (`deep-40`) |
| L4 | mobilises `jam-tarh-nisbiya` / `muqarana-nisbiya` (same term): order the points then compute distances; those steps `counted: false` | 1 after reading (`-69` ex 1 q 3) · 8 modelled · 1 adapted (`deep-42`) |
| L5 | « الوضعية الإدماجية »: a road with stops, temperatures of cities, a tower's heights; a decision (where to put a kiosk, which city has the largest range) | 10 modelled (`2am-s2`) |

**Oracle** `scripts/practice-oracle/masafa-nuqtatayn.mjs` (BigInt hundredths; `max − min`, two points at distance d, midpoint when it
needs ≤ 2 decimals; each distractor checked equal to its named error and false).

## 10. Risks & owner questions

1. **P2's extension** (two points at a given distance) — README Q5.
2. **Missing net link `r02 → r07`** — README Q2 (default: measured by M0 item 3, no edge).
3. **The midpoint** stays an application of P2 (half the distance from the smaller end): never the formula; the oracle refuses a
   midpoint needing three decimals.
4. **Kinship with `zero-probe`** — the gesture (screw), the anchor (any bead) and the output (a gap) differ; the screenshots review
   checks that the two labs do not look alike (different world, horizontal caliper band vs hanging cable).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 38, 41, 45, 46, 47, 50 at 200 dpi (`act-5`'s D: record what is legible); `verified: True`;
  destinations: `act-5` → 4 (README move); `know-2c` → 2; `ex-35`, `deep-40`, `deep-41`, `deep-42`, `ict-1` (README move) → 4 (cited by M4);
  `self-9` → 8.
- [ ] `relative.js` E5 functions + tests (`gap` symmetric and ≥ 0 over all pairs |a|, |b| ≤ 10 by 0,25; `pointsAt`; `midpointAbscissa`
  null exactly when a third decimal is needed).
- [ ] Lab `gap-caliper` (type, theme `meteoboard`, levels, registry, strings `gapCaliper`, logic + test (every task; `subDist` /
  `addSame` landing positions; negative prediction refused), render test, LabCoach, §6ter ✅, contract section, DNA row, screenshots: g1
  initial, g1 short at 5, g1 solved with the split band, a2 both answers, a3 clip on the upper bead — five sizes, reviewed).
- [ ] Lesson: 9 modules, header, « تذكّر » with links (`jam-tarh-nisbiya`, `muqarana-nisbiya`), `content.test.js` (BigInt), memos.
- [ ] Catalogue (P1–P2 final, `pointPrerequisites` above), index, net map, e2e `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-masafa-nuqtatayn.mjs`,
  gates, bank (`MISC-MASAFA2-*`), publish (lesson, 9 modules, 50 exercises `published`), commit `feat(lessons): masafa-nuqtatayn`.

## 12. Successor connection

- **4AM `hisab-murakkibatay`** and **`ithbat-khawas-maalam`** (published; net `2am.m4.r07 → 4am.m4.r05`, requires): README owner
  question 4 — **default: no edge written** (it would be the first `2am_*` prerequisite of a 4AM الكفاءة). Proposed if the owner agrees:
  `4am_hisab-murakkibatay_P1` ← `2am_masafa-nuqtatayn_P1` ($x_B-x_A$ is the same subtraction of abscissae, here signed);
  `4am_ithbat-khawas-maalam_P2` ← `2am_masafa-nuqtatayn_P1` (equal components). `hisab-murakkibatay`'s « أستعدّ » already measures
  `tarh-nisbi` (prep items p2, p3): its « راجع » panel lights up by itself; neither lesson has a « تذكّر — السنة الثانية » box.
- No 3AM net link starts at r07 → nothing else.

## Generator notes (2026-10-29)

Fixes and decisions made while generating (nothing else of the plan was changed):

1. **`act-5` was mis-transcribed** (plan §4 and the extraction): re-read at 110 dpi, the line of points is cut on the right; what is legible is `B(5)`, `C(−1)`, `D(−6)` and the abscissa of `A` is lost (the plan assumed `A(5)`, `B(−1)`, `C(−6)`). Recorded in `build-extraction.py` (`DISCREPANCIES › act-5`, `verified: True`, answers `BC = 6`, `CD = 5`). The lesson uses its own points `A(+4)`, `B(−2)`, `C(−7)` in M4 item 1 (answers 6, 11, 5, `AC = AB + BC`), as planned.
2. **Textbook values re-read** (`ex-35`, `deep-40`, `deep-41`, `deep-42`, `self-9`, `know-2c`, `ict-1`, all `verified: True`): `ex-35` is `A(−2,3) B(+0,6) C(−0,1) D(+1)` / `A(−5) B(−12) C(+3,5) D(−10)` / `A(−150) B(+75) C(+125) D(−12,5)` (the plan's M4 item 2 numbers are the lesson's OWN, kept); `deep-41` has the unit « cm » and `MN = 3,5 cm` (the lesson's `M(+1,5)`, `MN = 4` is its own).
3. **Destinations moved** in `build-extraction.py`: `act-5` → module 4 (README move), `ict-1` → module 4 (adapted, a choice exercise without software); `ex-35`, `deep-40…42` → 4; `know-2c` → 2; `self-9` → 8.
4. **Lab `gap-caliper`** (plan §6 followed; additions): the thermometer is VERTICAL (−10 … +12) with the caliper rail on its left; the direction of the free jaw is DERIVED from the target (only `a2` has the swing buttons); in a `predict` task the screw is locked until the typed opening is right (a negative is refused with crossed jaws); `a2` asks for the ABSCISSA of the point the jaw touches, once up and once down (the signed-swap `2,5` is refused: `signSwap`); the stage height is `clamp(236, 34 % of the screen, 380)` px (the plan's 420 px did not fit 1024×768 in 700 px). The lab `advanced` level cites `deep-41` as its textbook reference (the levels test requires a textbook ref there; the book has no طريقة for r07).
5. **Checkpoint chains** (plan §6 « Lab prototype »): `g1 parts · whyAdd`, `g2 parts2 · whySub`, `g3 calc`, `g4 ruleA` (the rule), `a1 sub` (added: the planned chain skipped a1), `a2 howMany`, `a3 same · ruleB` (AB = BA, ends the advanced level), `m1 calcM · ruleA` (the معارف lab).
6. **Knowledge map** (7 items): M1 `masafa-abr-sifr`, `masafa-nafs-jiha`, `qaidat-masafa`, `nuqtatan`, `masafa-mujaba` (a2 is taught before a3, the run order); M2 `taarif-masafa` (the larger / smaller abscissa) with the two « تذكّر » boxes LINKED to `jam-tarh-nisbiya` and `muqarana-nisbiya`; M3 `tariqa-masafa` (the midpoint stays an application: « the smaller abscissa + half the distance »). Two common mistakes (`subDist` across zero, `addSame` on one side).
7. **Catalogue**: P1 / P2 final as planned (`pointPrerequisites`: P1 ← `2am_jam-tarh-nisbiya_P3`, P2 ← P1), `available`, `durationMinutes` 75, `difficulty` « متوسط », icon 🌡️. The 4AM edges are NOT written (the `decomposition.test.js` guard, see `PLAN_2AM_M4.md`).
8. **Bank**: see the report and `EXERCISE_CONTRACT.md` (7 `term_exam`, 37 modelled, 6 adapted; `2am-s2-71` ex 1 and `2am-s2-57` were not read, so 7 and not 8).
