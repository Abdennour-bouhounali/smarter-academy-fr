# Plan — `talim-nuqta-mustawi` « تعليم نقطة في المستوي » (2AM unit 3, entry 4 of 6 — pair 3, lane B, port 5174)

Read the unit [`README.md`](README.md) first. Generated in PARALLEL with `majmu-jabri` (lane A): shared files (`relative.js`, the
catalogue, `manipulationTypes.js`, `manipulationLevels.js`, `levels.js`, `manipulationRegistry.js`, `lesson.manipulation.json`,
`misconceptions.json`, `active.json`, `exam-style.json`) get small targeted edits after a FRESH read, never a rewrite.

## 1. Identity

- **Code** `talim-nuqta-mustawi` · **title** « تعليم نقطة في المستوي » · unit `adad-nisbiya-2` · catalogue order 13 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/talim-nuqta-mustawi/`.
- **Textbook pages** (PDF = book − 3): `act-1` c p. 40 (PDF 37); `know-1c` p. 42 (PDF 39); `method-2`, `now-43` ② p. 43 (PDF 40, right
  edge cut); `prep` 8–13 p. 39; `ex-21`…`ex-24` p. 47 (PDF 44); `self-1`…`self-3` p. 49; `deep-51`…`deep-56` p. 51. Catalogue
  `textbookRef` (activity 40, knowledge 42, method 43) is right.
- `durationMinutes` ≈ 80; `difficulty` « سهل »; icon 🏺.

## 2. Programme & net

**Item:** `2am.m4.r04` « قراءة إحداثيي نقطة معلومة أو وضع نقطة ذات إحداثيين معلومين في مستوٍ منسوب إلى معلم متعامد ومتجانس ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | التعرّف على المعلم المتعامد والمتجانس للمستوي (المبدأ، محور الفواصل، محور التراتيب) | التعرّف على المعلم المتعامد والمتجانس للمستوي: المبدأ، ومحور الفواصل ومحور التراتيب متعامدان ولهما الوحدة نفسها | Makes « متعامد ومتجانس » explicit — exactly the net note of `1am.m5.r07 → 2am.m4.r04` (« يُضاف إليها صراحةً المعلم المتعامد والمتجانس »). |
| P2 | قراءة إحداثيي نقطة في المستوي: الفاصلة على المحور الأفقي ثمّ الترتيب على المحور العمودي، مثل $A(-3\,;2)$ | قراءة إحداثيي نقطة في المستوي: الفاصلة على المحور الأفقي ثمّ الترتيب على المحور العمودي، مثل $A(-3\,;2)$ ، وتمييز $(3\,;5)$ من $(5\,;3)$ | Adds the order contrast (book `prep` 8, `self-1`). |
| P3 | وضع نقطة ذات إحداثيين معلومين في معلم متعامد ومتجانس | وضع نقطة ذات إحداثيين معلومين (صحيحين أو عشريين) في معلم متعامد ومتجانس، ومنها النقط الواقعة على المحورين، وتعيين إحداثيي نظيرة نقطة بالنسبة إلى أحد المحورين | **Adds decimals (method-2: R(−1,5 ; 4)), points on the axes (`prep` 10–11) and the symmetric about an AXIS** (`ex-23`, `deep-53`, `prep` 13; axial symmetry is 1AM). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r07` | قراءة إحداثيي نقطة معلومة، أو تعليم نقطة ذات إحداثيين معلومين في مستوٍ مزوّد بمعلم | `talim-fi-mustawi` (1AM) | coming_soon → « تذكّر » without link | items 1, 2, 3 |

Extra `priorKnowledge` (no net link, measured): `faasila-2am` (r01, `talim-mustaqim-mudarraj-2`, published: item 5 — README owner Q3),
`tanazur-mihwari-1am` (axial symmetry, 1AM: item 4).

**noRebuild:** `2am.m4.r04` **consolidates** `1am.m5.r07`. The 1AM home is unpublished: « أستعدّ » measures it, M2 opens on a « تذكّر —
السنة الأولى » (`addition('prior_year_reminder')`, no link: « a point of the plane has two coordinates, the abscissa first »), and the
lesson goes to الإرساء: the ORTHONORMAL frame said explicitly, decimals, points on the axes, the regions' signs, the symmetric about an
axis, and the inverse task (choose the frame from the points: book `deep-51`) that 1AM never asks.

**pointPrerequisites:** intra only — P2 ← P1, P3 ← P1, P3 ← P2 (the 1AM home is a draft; no net link from r01).

**Where it is used next:** the synthesis; 3AM `tanasub-tamthil-bayani` (r04 → 3am.m7.r01); 4AM `murakkibata-shuaa` (→ 4am.m4.r04),
`muntasaf-masafa` (→ 4am.m4.r06) — §12.

## 3. Boundary

**Owns:** see README. **Leaves:** the symmetric about the ORIGIN or about a point (central symmetry, 2am.m2 = book unit 8, later); the
nature of a quadrilateral (2am.m5) — a rectangle or a square may be COMPLETED (« ضع D ليكون ABCD مستطيلًا ») from the grid, never proved;
lengths by SUBTRACTION of coordinates (`masafa-nuqtatayn` on a line, 4AM in the plane): a length along a grid line is COUNTED in units;
vectors (4AM).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-1` c | read B, C, D given A(4 ; 2) on a drawn figure; E symmetric of D about the x-axis; segments draw a digit | read from a known point; a picture made of points | **Not the entry** (the frame is given, the student reads). M4 item 1 (own: points that draw the digit 4) |
| `know-1c` | coordinates, abscissa first, A(−3 ; 2) | the words | M2 (own words) |
| `method-2` | place R(−1,5 ; 4) by two parallels | the two parallels | M3 step 1 (own: R(−2,5 ; 3)) |
| `now-43` ② | R(−4 ; 4), R′(4 ; −4); S for a right isosceles triangle | completing a figure | M4 item 6 (own numbers) |
| `prep` 8–13 | read P, on axes, alignment, symmetric about an axis | — | M0 items 1–4 (rewritten) |
| `ex-21`, `ex-22` | read five points; points by region and on axes | P2, signs by region | M4 items 2–3 |
| `ex-23` | symmetric of M about each axis | P3 | M4 item 4 |
| `ex-24` | three points on the circle of radius 5 | placing, a surprise | M4 item 5 (own: (3 ; 4), (−5 ; 0), (−4 ; −3)) |
| `deep-51`, `deep-52` | draw a frame for given coordinates; choose the units | the INVERSE task | **the lab's مبتدئ level**; bank L3 |
| `deep-53` | symmetric about each axis and about O | axes only | bank L2 (the O part `counted: false`) |
| `deep-54`…`deep-56` | rectangle, right isosceles triangle, circle | completing figures | M4 item 6 / bank L3–L4 |
| `self-1`…`self-3` | QCM | — | test register + bank |

## 5. Design

**The lesson in one paragraph.** At an archaeological dig near Djemila, every find must be RECORDED by two numbers. The dig is
squared with a grid of strings (1 m); the team plants an origin stake with two cords along the grid — one east-west, one north-south —
and reads each find as « how many metres along the east cord, then along the north cord ». Selma (hijab, cap) holds the stake: the
supervisor's notebook says « the jar was recorded at $(2\,;1)$ »: where was the stake? The student drags the stake (and its two cords)
until the jar reads $(2\,;1)$. Two finds recorded at once fix the stake completely — unless the notebook swapped two numbers: $(1\,;2)$
instead of $(2\,;1)$ makes the two records impossible together, and the order of the coordinates becomes a necessity. At the advanced
level the stake is fixed: the student predicts the coordinates of new finds before the labels appear, records a ring at
$(2{,}5\,;-1{,}5)$ between strings, and marks the mirror place of a coin across the east cord.

**Entry point — candidates compared:**
- (a) **The book's act-1 c** (read B, C, D from A(4 ; 2) on a given frame): a reading exercise, no necessity. Rejected → M4.
- (b) **A pin moved by two sliders (x then y)**: the hand holds the coordinates directly (`window-blinds` pulls two orthogonal covers,
  `pin-rails` slides pins in grooves) — the answer is in the hand, nothing to discover.
- (c) **A delivery on a city grid** (`component-steps`, 4AM): steps = components of a vector, the 4AM idea.
- (d) **The FRAME is the hand's variable and the points are fixed**: the coordinates are outputs that change with the stake; the order
  of the two numbers and the role of the origin become necessary; the inverse task (book `deep-51`) is the entry. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'digsite' }`.

**Order of ideas:** place the stake for one recorded find → for another → for two finds at once (one stake) → an impossible notebook
(swapped numbers) → the frame named: origin, two perpendicular cords, the SAME metre on both (orthonormal) → read finds (predict) → place a
find with decimals → points on a cord (one coordinate 0) → the symmetric across a cord → معارف → طريقة → practice, مسائل, test.

**Contexts (values):** heritage (Djemila's ruins, care for what is found), a neighbourhood map (orientation), a sports field (fair
lines), a temperature chart (toward 3AM graphs).

## 6. Lab — `dig-grid` « شبكة الحفرية » (new type)

**Drawn world `digsite`** (new theme, kind `plane`, label « حفرية أثرية: شبكة خيوط ووتد المبدأ ولُقى »):
- a square excavation pit seen from above (earth tones), a grid of white strings every metre (9 × 7 squares visible), stone walls of
  a ruined house in the background, a brush, a bucket, a sieve; mountains of Sétif province faint behind;
- finds lying on string crossings: a jar (جرّة), an oil lamp (قنديل زيت), a plate fragment (شقفة صحن), a plain coin (قطعة نقدية — a
  plain disc, no face, no symbol), a mosaic tile (قطعة فسيفساء — geometric pattern), a bead (خرزة); at متقدم a ring (خاتم) to record;
- the origin stake (a red wooden peg) with two coloured cords along the strings: blue east-west (« محور الفواصل », arrow east), green
  south-north (« محور التراتيب », arrow north), graduated −6 … +6 by small tags at each metre; the tags move with the stake;
- the supervisor's notebook (a small card) lists the records to match;
- KidFigure Selma (girl, hijab + long tunic, sun cap, notebook) at مبتدئ; Anis (boy, hoodie, brush) at متقدم; mood by verdict.

**The variables in the hand:** مبتدئ — the ORIGIN STAKE (one 2D drag: both coordinates of every find change); متقدم — a TAPPED point
(record a find, or a mirror place) and typed coordinates (predict).

**Gestures (three paths):** drag the stake (snaps to string crossings, the cords follow); arrow keys move it by one metre
(`role="application"` with a described position); « لا يوجد موضع » button (visible in every مبتدئ task, judged exactly; pressed when a
position exists, it is refused by showing one). متقدم: tap a crossing or a half-metre point (snap 0,5) to record; type « ( x ; y ) » in a
two-field pill.

**Opening (no title):**
- Context: « في الحفرية نسجّل موضع كلّ لُقية بعددين: كم مترًا شرق الوتد على الحبل الأزرق، ثم كم مترًا شمالًا على الحبل الأخضر. »
- Question (d1): « في دفتر المشرف: الجرّة عند $(2\,;1)$ . اسحب الوتد إلى المكان الذي يجعل الجرّة عند $(2\,;1)$ . »
- `lead`: « غرب الوتد وجنوبه أعداد سالبة. »

**Levels** (same `objective` on both). World crossings (columns, rows; hidden): jar (5,4), lamp (2,5), plate (2,1), coin (6,2), tile (4,6),
bead (3,1).

*مبتدئ* (the hand moves the stake):

| id | Notebook | Stake (world) | End state |
|---|---|---|---|
| `d1` | jar $(2\,;1)$ | (3,3) | jar reads **(2 ; 1)** |
| `d2` | lamp $(-3\,;2)$ | (5,3) | lamp reads **(−3 ; 2)** |
| `d3` | jar $(2\,;1)$ AND plate $(-1\,;-2)$ | (3,3) — one stake for both | both match |
| `d4` | jar $(2\,;1)$ AND plate $(1\,;2)$ | none (jar − plate is 3 m east and 3 m north; the notebook says 1 east, 1 south) | **« لا يوجد موضع »** |

*متقدم* (stake fixed at world (3,3); PREDICT: the finds' tags stay hidden until the student types):

| id | Task | End state |
|---|---|---|
| `p1` | type the coordinates of the coin, the tile, the bead | **(3 ; −1)**, **(1 ; 3)**, **(0 ; −2)** (the bead is ON the north cord) |
| `p2` | record a ring at $(2{,}5\,;-1{,}5)$ and an arrowhead at $(-1{,}5\,;0)$ | taps at world (5,5 ; 1,5) and (1,5 ; 3) |
| `p3` | mark the mirror place of the coin across the BLUE cord (axis of abscissae), type its coordinates | **(3 ; 1)** |

**« جرّب أعدادك » (always open):** type any $(x\,;y)$ with |x|, |y| ≤ 6, 0 to 2 decimals (snap display to 0,5 if needed); the lab drops a
marker there and says in which region it lies; or drag the stake freely and read every find; never counted.

**LabCoach** (`sa.labCoach.dig-grid.off`): 1 `stake` « اسحب الوتد: الحبلان يتبعانه » · 2 `read` « اقرأ رقم الحبل الأزرق أوّلًا ثم الأخضر » ·
3 `none` (after three stake moves that never satisfy both records, d4 only) « هل يوجد موضع يحقّق السجلّين معًا؟ » · 4 `type` (متقدم) · 5 `tap`
(متقدم) · 6 `mirror` · 7 `free`. Never points at the answer.

**Lab prototype (§6ter):** chains from the student's run:
- d1: « كم مترًا شرق الوتد الجرّة؟ وكم شمالًا؟ » (2, 1) → « أيّ العددين نكتب أوّلًا؟ » (the east cord);
- d2: « لماذا العدد الأوّل للقنديل سالب؟ » (west of the stake);
- d3: « هل يوجد وتد آخر يحقّق السجلّين؟ » (no: one stake);
- d4: « ما الخطأ المحتمل في الدفتر؟ » (the plate's numbers swapped / the order) → « هل $(1\,;2)$ و $(2\,;1)$ الموضع نفسه؟ »;
- p1: « الخرزة على أيّ حبل؟ ما فاصلتها؟ » (north cord, 0);
- p3 (ends on the RULE): « نظيرة نقطة بالنسبة إلى محور الفواصل لها الفاصلة نفسها وترتيب معاكس »; a closing card (no task) asks
  « لماذا يكون المتر نفسه على الحبلين؟ » with two drawn frames (equal units / doubled north unit) → « معلم متعامد ومتجانس ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per snap, `flag` / `over`), full screen, `guided={!!chain}`, render test
over every task.

**Wrong moves made VISIBLE:**
- `swap` (the stake placed so the jar reads (1 ; 2)): the notebook line turns red and both readings are shown side by side;
- `signAxis` (p1: types (3 ; 1) for the coin): a ghost coin at (3 ; 1), mirrored across the blue cord;
- `onAxis` (p1: types (−2 ; 0) for the bead): the ghost lies on the BLUE cord, the real bead on the green one;
- `symMix` (p3: changes the abscissa): the ghost lands across the green cord;
- `noneWrong` (« لا يوجد موضع » pressed in d1–d3): refused, the lab shows one right stake.

**Formal phase:** with the student's records: « $J(2\,;1)$ : $2$ فاصلة الجرّة و $1$ ترتيبها ؛ الخرزة $(0\,;-2)$ على محور التراتيب ؛ نظيرة
$(3\,;-1)$ بالنسبة إلى محور الفواصل هي $(3\,;1)$ ».

**Core maths:** `relative.js` E4 row (`pointText`, `quadrantOf`, `symX`, `symY`, `coordsOf`, `originFor`, `consistent`). Lab logic
`logic/digGrid.js`: `tasksOf`, `moveStake(state, to)`, `readings(state)`, `judgeStake(task, stake)` → `{ ok, mismatches }`,
`judgeNone(task)`, `judgeTyped(task, find, text)` → `{ ok, model, ghost }`, `judgeTap(task, point)`, `coachOf`; events
`{ kind: 'stake', task, at, ok }`, `{ kind: 'none', task, ok }`, `{ kind: 'typed', task, find, value, ok, model }`,
`{ kind: 'tap', task, at, ok }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `window-blinds` (2AM m1): two orthogonal 1D pulls make an AREA; here one 2D drag moves a whole FRAME and the coordinates of fixed
  objects are read.
- `pin-rails` (3AM): pins slide in vertical grooves to values of a table (the frame is fixed); here the frame moves.
- `component-steps`, `component-calc`, `midpoint-distance`, `shape-prover`, `route-compare` (4AM): vectors, components, distances,
  proofs; no origin to choose, no reading of coordinates as the goal.
- `corniche-ruler` (entry 1): the origin of a LINE chosen among landmarks; here a 2D frame with two cords and the order of two numbers.
- `zero-probe`: a cable length on one vertical axis.

**Screen budget:** 1024×768, lab column ≈ 414 px: the pit 9 × 7 squares at 44 px = 396 × 308 px (one square = one ≥ 44 px target), the
notebook card + answer pill in one row under it. 768×1024: the pit at 46 px. Labels on the cord tags at 12 px, no overlap test.

**DOM:** `[data-dig-grid][data-level][data-task][data-stake][data-solved]`, `[data-dg-stake]`, `[data-dg-cord=x|y]`,
`[data-dg-find=<id>][data-coords]`, `[data-dg-note=<i>][data-ok]`, `[data-dg-none]`, `[data-dg-answer]`, `[data-dg-ghost][data-model]`,
`[data-dg-tap]`, `[data-dg-free]`, `[data-dg-formal]`, `[data-dg-kid][data-mood]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق ممّا أعرفه عن إحداثيي نقطة ونظيرتها »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | « النقطة التي فاصلتها $5$ وترتيبها $3$ تُكتب $P(3\,;5)$ » | ✗ ($P(5\,;3)$) | 1am.m5.r07 (`prep` 8) |
| 2 | « النقطة $(0\,;3)$ تقع على محور التراتيب » | ✓ | 1am.m5.r07 (`prep` 9, 11) |
| 3 | « كلّ نقطة على محور الفواصل ترتيبها معدوم » | ✓ | 1am.m5.r07 (`prep` 10) |
| 4 | « $K(2\,;5)$ و $L(-2\,;5)$ متناظرتان بالنسبة إلى محور التراتيب » | ✓ | axial symmetry (`prep` 13) |
| 5 | « على مستقيم مدرّج تدريجته $0{,}5$ ، النقطة الواقعة على التدريجة الخامسة يسار المبدأ فاصلتها $-2{,}5$ » | ✓ | r01 |
| 6 | « النقط $M(-1\,;1)$ و $O(0\,;0)$ و $N(-3\,;3)$ على استقامة واحدة » | ✓ | `prep` 12 |

**M1 نشاط — « شبكة الحفرية »** — `objectives`: « أكتشف كيف يحدّد عددان موضع نقطة وما دور المبدأ وترتيب العددين ». Lab on top;
then the trace and the bricks: `ihdathiyan` (d1) · `tartib-ihdathiyayn` (d4) · `nuqta-ala-mihwar` (p1) · « أتوقّع القاعدة » then
`nadhira-mihwar` (p3) · `maalam-mutajanis` (closing card).

**M2 معارف** — `objectives`: « أسمّي المعلم المتعامد والمتجانس وإحداثيي نقطة ».
- Lab ALONE (`levels={false}`, stake at world (4,2): type the jar **(1 ; 2)**, the lamp **(−2 ; 3)**, the plate **(−2 ; −1)**).
- Boxes: « تذكّر — السنة الأولى » (no link) · definition of the orthonormal frame (platform words) with a figure contrasting a
  non-homogeneous frame · coordinates, abscissa then ordinate, $A(-3\,;2)$ · points on the axes · the four regions' signs (a figure, not a
  rule to memorise).

**M3 طريقة** — `objectives`: « أضع نقطة بإحداثيين عشريين وأقرأ نقطة على محور وأجد نظيرة نقطة ». Steps:
1. Place $R(-2{,}5\,;3)$: the parallel to the axis of ordinates through $-2{,}5$, the parallel to the axis of abscissae through $3$, their
   crossing (Q « بأيّ موازٍ نبدأ؟ » — either: the crossing is the same);
2. read $T$ on the axis of ordinates, 2 units under O → $(0\,;-2)$;
3. the symmetric of $R$ about the axis of abscissae → $(-2{,}5\,;-3)$; about the axis of ordinates → $(2{,}5\,;3)$.
Method box: « الفاصلة على المحور الأفقي أوّلًا ثم الترتيب على المحور العمودي؛ نظيرة النقطة بالنسبة إلى محور تحتفظ بالإحداثية التي على هذا
المحور وتأخذ معاكس الأخرى ».

**M4 أتمرّن** — `objectives`: « أقرأ وأضع نقطًا في معلم وأكمل أشكالًا »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | علّم $A(-2\,;3)$ ، $B(-2\,;0)$ ، $C(2\,;0)$ ، $D(1\,;3)$ ، $E(1\,;-3)$ ، وارسم $[AB]$ و $[BC]$ و $[DE]$ : ما الرقم الذي يظهر؟ | 4 | `act-1` c |
| 2 | اقرأ إحداثيات خمس نقط من شكل (own `GeoFigure`) | $(3\,;2)$ ، $(-4\,;1)$ ، $(-2\,;-3)$ ، $(0\,;-1{,}5)$ ، $(2{,}5\,;0)$ | `ex-21` |
| 3 | من بين نقط التمرين 2: ما النقط ذات فاصلة موجبة وترتيب سالب؟ ذات ترتيب معدوم؟ | none ; $(2{,}5\,;0)$ | `ex-22` |
| 4 | $M(3\,;-2)$ : نظيرتها $A$ بالنسبة إلى محور الفواصل و $B$ بالنسبة إلى محور التراتيب؛ ماذا تلاحظ؟ | $A(3\,;2)$ ، $B(-3\,;-2)$ ؛ تتغيّر إشارة إحداثية واحدة | `ex-23` |
| 5 | علّم $A(3\,;4)$ ، $B(-5\,;0)$ ، $C(-4\,;-3)$ (الوحدة 1 cm)، وتحقّق بالمدوّر أنّها على الدائرة التي مركزها $O$ ونصف قطرها $5$ cm | yes | `ex-24` |
| 6 | $A(-3\,;2)$ و $B(-3\,;-3)$ : عيّن $C$ ليكون $ABC$ قائمًا في $B$ ومتقايس الضلعين (بعدّ الوحدات) | $C(2\,;-3)$ أو $C(-8\,;-3)$ | `deep-55`, `now-43` ② |
| 7 | أيّ وحدة تختار لتضع $A(-20\,;60)$ ثم $B(-2\,;-3)$ في ورقتك؟ | 1 cm ↔ 10 ; 1 cm ↔ 1 | `deep-52` |

**M5 مسألة 1 (`lessonProblem`) — « ملعب الحيّ »** — `objectives`: « أستعمل الإحداثيات لإكمال مستطيل ووضع نقط فيه ».
- Statement: « رسم مهندس البلدية ملعب الحيّ في معلم متعامد ومتجانس (الوحدة $5$ m): $A(-4\,;3)$ ، $B(5\,;3)$ ، $C(5\,;-2)$ . »
- Q/A: 1) $D$ ليكون $ABCD$ مستطيلًا → $D(-4\,;-2)$ ; 2) طول $AB$ وعرض $BC$ بعدّ الوحدات → $9$ و $5$ وحدات، أي $45$ m و $25$ m ;
  3) « علّم نقطة الجزاء $P(3{,}5\,;0{,}5)$ : في أيّ منطقة من المعلم؟ » → فاصلة وترتيب موجبان.

**M6 مسألة 2 — « خريطة الحيّ »** — `objectives`: « أقرأ إحداثيات معالم وأحدّد مواضعها بالنسبة إلى المحورين ».
- Statement: « المتوسطة في المبدأ $O$ . المكتبة $(3\,;-2)$ ، المخبزة $(-2\,;4)$ ، الصيدلية $(-3\,;0)$ ، البريد $(0\,;2{,}5)$ . »
- Q/A: 1) المعلمان على المحورين → الصيدلية (محور الفواصل)، البريد (محور التراتيب) ; 2) « معلم نظير المكتبة بالنسبة إلى محور الفواصل؟ »
  → $(3\,;2)$ ; 3) « نقلنا الخريطة: صار المبدأ عند المخبزة. ما إحداثيا المتوسطة؟ » → $(2\,;-4)$.

**M7 مسألة 3 — « منحنى حرارة الأسبوع »** — `objectives`: « أمثّل جدول قيم بنقط في معلم ».
- Statement: « درجة الحرارة الصباحية (°C): اليوم 1: $-2$ ، اليوم 2: $1{,}5$ ، اليوم 3: $-0{,}5$ ، اليوم 4: $3$ . نمثّل كلّ يوم بنقطة
  (رقم اليوم ; الدرجة). »
- Q/A: 1) النقط → $(1\,;-2)$ ، $(2\,;1{,}5)$ ، $(3\,;-0{,}5)$ ، $(4\,;3)$ ; 2) « أيّ النقط تحت محور الفواصل؟ ماذا يعني ذلك؟ » → الأيام 1 و 3:
  درجة سالبة ; 3) « اختر وحدة المحور العمودي إذا كان لديك $6$ cm فوق المحور » → 1 cm ↔ 0,5 °C (keeps 3 within 6 cm).

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | نقطة على بعد $3$ وحدات يمين $O$ و $2$ تحته: إحداثياها | $(3\,;-2)$ | $(-2\,;3)$ (SWAP) · $(3\,;2)$ (SIGNAXIS) · $(-3\,;-2)$ | P2 |
| 2 | النقطة $(0\,;-4)$ تقع | على محور التراتيب | على محور الفواصل (ONAXIS) · في المبدأ · تحت محور الفواصل وعلى يمين محور التراتيب | P3 |
| 3 | نظيرة $(-5\,;2)$ بالنسبة إلى محور الفواصل | $(-5\,;-2)$ | $(5\,;2)$ (SYMMIX) · $(5\,;-2)$ (BOTHSIGNS) · $(2\,;-5)$ (SWAP) | P3 |
| 4 | موضع $(-2{,}5\,;1{,}5)$ | فوق محور الفواصل وعلى يسار محور التراتيب | the three other regions | P2 |
| 5 | « معلم وحدته على المحور الأفقي مربّعان وعلى العمودي مربّع واحد » | متعامد وغير متجانس | متعامد ومتجانس (UNITIGNORED) · غير متعامد · « لا يمكن القراءة فيه » | P1 |

## 8. Misconceptions (`MISC-NUQTA2-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `SWAP` | the ordinate first | d4, notebook red | tests 1, 3 |
| `SIGNAXIS` | below the x-axis read positive | p1 ghost | test 1 |
| `ONAXIS` | a point on the y-axis has ordinate 0 | p1 ghost | test 2 |
| `SYMMIX` | symmetric about the x-axis changes the abscissa | p3 ghost | test 3 |
| `BOTHSIGNS` | both coordinates change (that is the origin) | p3 | test 3 |
| `UNITIGNORED` | any frame with perpendicular axes is orthonormal | closing card | test 5 |
| `ORIGINFIXED2` | coordinates belong to a point whatever the origin | d1–d3 | M6 q 3 |

## 9. Practice bank (`content/practice/2am/talim-nuqta-mustawi/`, 5 × 10)

**Read by the planner:** `2am-s2-63` ex 3 q 1, q 4–q 5 (place A(+1 ; +4), D(+1 ; −4), E(+2,5 ; 0); C for a rectangle ABCD, its
coordinates — q 2 « B symmetric of D about E » is central symmetry: `counted: false` or replaced by giving B); `2am-s2-70` ex 2 (place
A(+4 ; +3), B(0 ; +3), C(+4 ; −3); D symmetric of B about O and the quadrilateral: `counted: false`); `2am-s2-72` ex 3 (place L(+2 ; −2),
N(−4 ; −2), M(−4 ; +2); K for a rectangle MNLK, its coordinates; I the centre: `counted: false`); `2am-s2-53` ex 2 (place A(−1 ; +2),
B(+3 ; +2), C(−1 ; −4); the midpoint M of [BC] READ on the figure (1 ; −1); A′ symmetric about M: `counted: false`); misfiled
`1am-s2-79` ex 4 (place E(+4 ; +3), F(0 ; +3), G(0 ; −3), L(−4 ; 0); « E and L symmetric about O? »: `counted: false`; areas: other
lesson). **To read:** `2am-s2-69` ex 3 (D symmetric of A about the axis of ordinates — axial, the points are on the scan), `2am-s2-75` ex 2,
`2am-s1-73` ex 3 (frame part), `2am-s2-59` ex 4, `2am-s2-52` ex 3.

**Honest FAITHFUL count: 5 read today; 7–9 expected.** Many paper questions are central symmetry or the nature of a quadrilateral
(later units): each sheet keeps the PLACING / READING / COMPLETING part counted and marks the rest `counted: false` (never more than one
uncounted step per sheet; otherwise the step is replaced by giving the point).

| Level | Content | Provenance |
|---|---|---|
| L1 | read coordinates on a figure; place points; on the axes | 1 term_exam (`1am-s2-79` ex 4 q 1) · 7 modelled · 2 adapted (`ex-21`, `self-1`) |
| L2 | place, then a region / sign question « برّر »; symmetric about an axis | 1 term_exam (`-70` ex 2 q 1) · 1 after reading (`-69` ex 3) · 6 modelled · 2 adapted (`ex-23`, `deep-53` axes part) |
| L3 | full exercise: place, complete a rectangle or a square, coordinates of the 4th vertex | 2 term_exam (`-63` ex 3, `-72` ex 3) · 1–2 after reading · 5 modelled · 1 adapted (`deep-55`) |
| L4 | mobilises `talim-mustaqim-mudarraj-2` / `muqarana-nisbiya` (same term): read then order the abscissae, choose the unit of an axis | 1 term_exam (`-53` ex 2) · 9 modelled |
| L5 | « الوضعية الإدماجية »: a field / a classroom floor / a map in a frame, counted lengths, area and a cost (the cost step `counted: false`) | 10 modelled (the term-2 « tiling » and « wall » situations go to the synthesis) |

**Oracle** `scripts/practice-oracle/talim-nuqta-mustawi.mjs` (BigInt hundredths; points, regions, axial symmetric, 4th vertex of a
rectangle with sides parallel to the axes; each distractor checked equal to its named error and false).

## 10. Risks & owner questions

1. **P3's extension** (decimals, axes, symmetric about an axis) — README Q5.
2. **Missing net link `r01 → r04`** — README Q3 (default: measured by M0 item 5, no edge).
3. **Central symmetry in the papers** — `counted: false` only (README boundary). If the owner prefers, the sheets can GIVE the
   symmetric point instead.
4. **The coin and the mosaic tile** are drawn plain (no face, no religious or imperial symbol).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 36, 37, 39, 40, 44, 46, 48 at 200 dpi; `verified: True`; destinations: `act-1` item c → 4
  (README move); `know-1c` → 2; `method-2`, `now-43` item 2 → 3; `prep` 8–13 → 0; `ex-21`…`ex-24`, `deep-52`, `deep-55` → 4 (cited by M4);
  `self-1`…`self-3` → 8; `deep-51`, `deep-53`, `deep-54`, `deep-56` → `None` (bank).
- [ ] `relative.js` E4 functions + tests (`originFor` / `consistent` exhaustive over a 13 × 13 grid; `symX`, `symY` involutions).
- [ ] Lab `dig-grid` (type, theme `digsite`, levels, registry, strings `digGrid`, logic + test (every task; d4 impossible; the `none`
  judge), render test, LabCoach, §6ter ✅, contract section, DNA row, screenshots: d1 initial, d3 solved, d4 notebook red, p1 ghost, p3
  mirror — five sizes, reviewed).
- [ ] Lesson: 9 modules, header, « تذكّر — السنة الأولى » without link, `content.test.js` (BigInt), memos; every figure is `GeoFigure`
  (`grid`, `axes`, points) — no image.
- [ ] Catalogue (P1–P3 final, intra `pointPrerequisites`), index, net map, e2e `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-talim-nuqta-mustawi.mjs`,
  gates, bank (`MISC-NUQTA2-*`), publish (lesson, 9 modules, 50 exercises `published`), commit `feat(lessons): talim-nuqta-mustawi`.

## 12. Successor connection

- **3AM `tanasub-tamthil-bayani`** (published; net `2am.m4.r04 → 3am.m7.r01`, requires; 3am.m7.r01 is all four of its LPs):
  - catalogue `pointPrerequisites`: **`3am_tanasub-tamthil-bayani_P1` ← `2am_talim-nuqta-mustawi_P3`** (a table's columns become points
    placed in an orthonormal frame) — create `"P1": [...]`; **`3am_tanasub-tamthil-bayani_P4` ← `2am_talim-nuqta-mustawi_P2`** (reading
    values on the graph) — append to `P4`'s list. P2 and P3 reach them through P1;
  - it holds no « تذكّر — السنة الثانية » box (its `knowledge.jsx` header: the 2AM links are `priorKnowledge` measured in « أستعدّ »; prep
    items 3 and 5 `requires: ['talim-nuqta-2am']`); its « راجع » panel turns into a link by itself. History line in its header.
- **4AM `murakkibata-shuaa`** (net → 4am.m4.r04) and **`muntasaf-masafa`** (net → 4am.m4.r06): README owner question 4 — **default: no
  edge written**. Proposed if the owner agrees: `4am_murakkibata-shuaa_P2` ← `2am_talim-nuqta-mustawi_P2` (OM's components ARE M's
  coordinates), `4am_murakkibata-shuaa_P3` ← `2am_talim-nuqta-mustawi_P3` (draw from a given point); `4am_muntasaf-masafa_P1` ←
  `2am_talim-nuqta-mustawi_P2` (the midpoint's coordinates from the ends' coordinates). Neither 4AM lesson has a « تذكّر — السنة الثانية »
  box; nothing else to edit.

## Generator notes (lead, 2026-10-29)

Fixes and decisions taken while executing the plan (each is also in the final report):
- **§6 table, « Stake (world) » column** is the ANSWER, not the starting position: the stake starts elsewhere (d1 and d3 at (1,1), d2 at (6,1), d4 at (1,1)), otherwise d1 would be solved before any gesture. The levels (`levels.js`) hold the starting cells.
- **d4 question « ما الخطأ المحتمل في الدفتر؟»**: with the jar at (2 ; 1) and the plate at (1 ; 2) the notebook cannot be repaired by swapping one pair (the real plate is (−1 ; −2)), so the checkpoint says only that the two records cannot both be true (distractors: « the stake is too far », « swap both pairs » — proven false: after the swap the records are still impossible). The planned second question « هل (1 ; 2) و (2 ; 1) الموضع نفسه؟ » is carried by the `tartib-ihdathiyayn` brick and the rule question instead.
- **Closing card « لماذا يكون المتر نفسه على الحبلين؟ » (two drawn frames)** was NOT built as a lab card: the orthonormal frame is named in module 2 (brick `maalam-mutajanis`, with « تذكّر — السنة الأولى » and the definition); the bank item « UNITIGNORED » and the مسألة 3 unit choice test it. Lab misconception `UNITIGNORED` stays a bank/test one.
- **p3** is a typed answer (the mirror place of the coin across the BLUE cord), judged `right | same | symMix | bothSigns | other`; **p2** is the half-metre tap (ring (2,5 ; −1,5), arrowhead (−1,5 ; 0)).
- **Lab pit** is 9 × 7 squares; the square size is capped by the screen height (~28 %) so the lab glance stays ≤ 700 px at 1024×768 at both levels.
- **Module 4 exercises**: the textbook elements `deep-51`, `deep-54`, `deep-56` are cited by `deep-52` / `deep-55` (`cites`) and routed to the BANK in `build-extraction.py`; `act-1` item c moved to module 4 as planned. `TextbookExercise` gained an optional `figure` (a `StatementFigure`) so reading exercises show their GeoFigure.
- **Durations**: the modules sum to 64 minutes without the مسائل (the checker compares it with the catalogue), so `durationMinutes` is 64 (not ≈ 80); `estimatedDurationMin` of the config is 88 with the three مسائل.
- **« أستعدّ »** keeps the plan's six items (prep 8, 9/11, 10, 12 rewritten + two platform items); the knowledge ids are `ihdathiyat-1am`, `tanazur-mihwari-1am`, `faasila-2am`.
- **Bank** (50 sheets, 156 judged questions): 10 `term_exam` (read: `1am-s2-79` ex 4, `2am-s1-73` ex 3, `2am-s2-70` ex 2, `2am-s2-69` ex 3, `2am-s2-63` ex 3, `2am-s2-72` ex 3, `2am-s2-75` ex 2, `2am-s2-59` ex 4, `2am-s2-52` ex 3, `2am-s2-53` ex 2), 33 modelled, 7 adapted; 12 `counted: false` steps (central symmetry, a rectangle's centre, the nature of a quadrilateral, the four cost steps of level 5).
