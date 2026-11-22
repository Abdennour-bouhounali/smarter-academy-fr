# Plan — `talim-mustaqim-mudarraj-2` « التعليم على مستقيم مدرّج » (2AM unit 3, entry 1 of 6 — pair 1, lane A)

Read the unit [`README.md`](README.md) first. `muqarana-nisbiya` (r02, r03) is already published; this lesson comes BEFORE it in the
catalogue and gives it its missing back-edge (§12).

## 1. Identity

- **Code** `talim-mustaqim-mudarraj-2` · **title** « التعليم على مستقيم مدرّج » · unit `adad-nisbiya-2` · catalogue order 11 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/talim-mustaqim-mudarraj-2/`.
- **Textbook pages** (PDF = book − 3): `act-1` a-b p. 40 (PDF 37); `know-1a` p. 42 (PDF 39); `prep` 1–4 p. 39; `ex-1`…`ex-11` p. 46
  (PDF 43); `self-4` p. 49 (moved here). There is NO طريقة for r01 in the book (method-1 is the comparison): the platform writes its own.
  Catalogue `textbookRef` (activity 40, knowledge 42, method 43) → set `method: null`.
- `durationMinutes` ≈ 80; `difficulty` « سهل »; icon 📏.

## 2. Programme & net

**Item:** `2am.m4.r01` « قراءة فاصلة نقطة معلومة أو وضع نقطة ذات فاصلة معلومة على مستقيم مدرّج ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | التعرّف على العدد النسبي (موجب، سالب) وعلى العددين المتعاكسين مثل $(+3)$ و $(-3)$ | التعرّف على العدد النسبي بإشارته (موجب، سالب) ومسافته إلى الصفر، وعلى العددين المتعاكسين مثل $(+3)$ و $(-3)$: لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان | Adds the DISTANCE TO ZERO (book know-1a names it; `muqarana-nisbiya` P1 and `jam-tarh-nisbiya` P1–P2 rest on it). |
| P2 | قراءة فاصلة نقطة على مستقيم مدرّج وكتابتها، مثل $A(-3)$ | قراءة فاصلة نقطة على مستقيم مدرّج وكتابتها مثل $A(-3)$ ، بعدّ التدريجات من المبدأ وبمراعاة قيمة التدريجة الواحدة ($1$ ، $5$ ، $10$ ، $0{,}1$ …)، ولو وقعت النقطة بين تدريجتين | Makes the graduation value explicit (book ex-6, ex-7, ex-8, ex-11). |
| P3 | وضع نقط ذات فواصل معلومة على مستقيم مدرّج مع اختيار مبدأ ووحدة تدريج مناسبين | (kept) وضع نقط ذات فواصل معلومة على مستقيم مدرّج مع اختيار مبدأ ووحدة تدريج مناسبين | — |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r06` | توظيف الأعداد النسبية في تدريج مستقيم وقراءة فاصلة نقطة… | `talim-mustaqim-mudarraj` (1AM) | coming_soon → « تذكّر » without link | items 2, 4 |

Extra `priorKnowledge` (measured, no net link): `adad-nisbiya-siyaq-1am` (1am.m5.r05, `adad-nisbiya-siyaqat`, coming_soon: items 1, 6),
`nisf-mustaqim-1am` (1am.m5.r04, `adad-ashri-mustaqim-mudarraj`, coming_soon: item 5), `adad-mutaakis` (item 3).

**noRebuild:** `2am.m4.r01` **consolidates** `1am.m5.r06` (« نفس الكفاءة على مستقيم مدرّج: تُستحضر وتُرسى ولا يُعاد بناؤها »). The
1AM home is unpublished, so the pattern of `nisba-miawiya-3am` applies (guide §9, Phase A entry #10): « أستعدّ » measures the base, M2
opens on a « تذكّر — السنة الأولى » `TextbookBox` (`addition('prior_year_reminder')`, NO link) that says what 1AM already gave (the origin,
positive to the right, negative to the left, a point $A(-3)$), and the lesson goes straight to الإرساء: graduations other than 1, the
CHOICE of origin and graduation, the opposite as « same distance ». The lab is not a rebuild: it never asks « where is −3 » on a unit line.

**pointPrerequisites:** intra only — P2 ← P1, P3 ← P1, P3 ← P2. No cross-year edge (§4.8: the 1AM home is a draft).

**Where it is used next:** `muqarana-nisbiya` (r01 → r02), `jam-tarh-nisbiya` (r01 → r05), `masafa-nuqtatayn`, the synthesis; 3AM
`jidaa-ida-nisbiya` (« أستعدّ » measures the opposite, out of net); 4AM `mutarajiha-ula` (solutions on a graduated line, through r03).

## 3. Boundary

**Owns:** see README. **Leaves:** comparing and ordering (`muqarana-nisbiya`: a « تذكّر » never needed — M1–M8 never ask which is
smaller); the distance between two points and the midpoint (`masafa-nuqtatayn`; the book's `deep-40`–`deep-42` are not here); sums;
the plane (`talim-nuqta-mustawi`, `act-1` c); fractions as abscissae (`prep` 2: « $\frac17$ لا يُكتب عددًا نسبيًا في هذه السنة »).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-1` a-b | order four monuments by date (one « ق.م »), place them on a suitable graduated line; read K, L, M, N; draw lines for A(+100), B(0), C(−25), D(+75) and M(+0,1), N(−0,5), O(0), P(−1) | an ORIGIN and a GRADUATION are chosen to suit the numbers | **Not the entry** (the student reads a given picture; the dates are answered from memory). M4 item 1 redesigned: own timeline whose ORIGIN is the school's opening year (no BC date, no historical fact to check); M1 متقدم uses the « choose the graduation » idea with own numbers |
| `know-1a` | abscissa, A(−3), distance to zero, opposites | the three words | M2 (own words, own examples) |
| `prep` 1–4 | −2 is negative; 1/7 not relative; opposite of −8; (+1,2), (−2,1) not opposite | — | M0 items 1–3 (rewritten) |
| `ex-1`, `ex-3` | situations of relatives; link events and dates | contexts | M4 item 7 (own: five everyday situations) |
| `ex-2` | internet search: body temperature, freezing, boiling, absolute zero | a scale with very different numbers | M4 item 6 (**adapted**: the platform GIVES 37 ; 0 ; 100 ; −273,15 °C — no internet) |
| `ex-4`…`ex-8` | read abscissae with graduation 1, 5, 10, fine | P2 | M4 items 2–3 (own figures, `GeoFigure` lines) |
| `ex-9` | place −4 ; 3 ; −2,5 ; −0,75 | P3 | M4 item 4 (own: −3,5 ; 2 ; −1,25 ; 0,75) |
| `ex-10`, `ex-11` | place, « not relative », opposites | P1 | M4 item 5 (opposites only; the fraction question becomes « $\frac17$ is not a 2AM relative ») |
| `self-4` | opposite of −5 | P1 | test register + bank |

## 5. Design

**The lesson in one paragraph.** The town's seafront (« الكورنيش ») gets a long wooden sign board under its railing: a graduated strip
with six graduations on each side of a « 0 ». Lina (hijab) is the city's young guide: she plants the « 0 » pin under a landmark, and every
landmark — the fountain, the bench, the lamppost, the kiosk — gets its number by counting graduations from that pin, right is « + »,
left is « − ». Move the pin to the bench and the kiosk's number changes although the kiosk never moved: an abscissa is a position SEEN
FROM AN ORIGIN. Two landmarks the same number of graduations from the pin, on opposite sides, carry opposite numbers. At the advanced
level the board is fixed under the fountain and the hand chooses what ONE graduation is worth (0,1 m … 100 m): too small and the far
landmarks fall off the board; badly chosen and they fall between graduations.

**Entry point — candidates compared:**
- (a) **The book's act-1** (a timeline of monuments): the order of dates is known before any graduation (a test of memory), and the
  graduation is drawn by the book. Rejected → M4.
- (b) **A thermometer** (place temperatures): vertical scale = `zero-probe` (this unit) and the comparison lesson's world.
- (c) **An elevator's floors**: integers only, graduation fixed at 1, `elevator-reel` (3AM) uses an elevator.
- (d) **A sign board graduated BY THE STUDENT under fixed landmarks**: the origin and the graduation are the hand's variables, the
  abscissa is the OUTPUT and changes when they change — the two ideas 1AM never questioned. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'corniche' }`.

**Order of ideas:** read a landmark's abscissa (graduation 10) → move the origin, the same landmark gets another number → two landmarks
with opposite numbers (same distance to zero) → a landmark between two graduations (−35 with graduation 10) → معارف (abscissa,
$A(-3)$, distance to zero, opposites) → choose the graduation that fits given numbers → طريقة (how to choose a graduation; read a fine
graduation) → practice, مسائل, test.

**Contexts (values):** the seafront kept clean (civic care), the school's timeline (memory of the place), a dam's level (water
saving), a building's floors (neighbourliness).

## 6. Lab — `corniche-ruler` « مسطرة الكورنيش » (new type)

**Drawn world `corniche`** (new theme, kind `axis`, label « كورنيش المدينة: معالم ولوحة مدرّجة تحت الدرابزين »):
- a sunny seafront in front of the sea: a blue railing, palm trees, a fountain, two benches, a lamppost, an ice-cream kiosk, a bus stop,
  a fishermen's kiosk, a tiled pavement; seagulls; no swimmers;
- under the railing, a long wooden board with a graduated strip of 13 graduations (−6 … +6 positions around its « 0 »); each landmark
  drops a thin dotted plumb line onto the strip; a landmark between two graduations lands on a hatched half-cell (never rounded);
- the « 0 » is a red pin with a flag; at متقدم a brass STEP LEVER on the board's side, with notches labelled 0,1 · 0,5 · 1 · 2 · 5 · 10 ·
  20 · 25 · 50 · 100 (metres per graduation); the graduation labels on the strip update with the step;
- KidFigure Lina (girl, hijab + tunic, guide's cap) next to the pin at مبتدئ; Yacine (boy, hoodie) at the lever at متقدم; mood by verdict.

**The variables in the hand:** مبتدئ — the ORIGIN (which landmark / graduation receives the « 0 » pin; graduation fixed at 10 m);
متقدم — the STEP (value of one graduation; origin fixed under the fountain). The abscissae are outputs; the student TYPES them (reading)
or TAPS the graduation of a landmark (placing).

**Gestures (three paths):** drag the pin along the board (snaps to landmarks and graduations); tap a landmark to plant the pin under it;
keyboard on the pin (`role="slider"`, ←/→, Home/End). The lever: drag between notches, −/+ buttons, ↑/↓. Placing: tap a graduation (or
a half-cell) for the named landmark; Enter to confirm.

**Opening (no title):**
- Context: « تصنع البلدية لوحة مدرّجة تحت درابزين الكورنيش: كلّ معلم يأخذ عددًا حسب موضعه من دبّوس الصفر. »
- Question (b1): « الصفر تحت النافورة والتدريجة الواحدة $10$ m . اكتب فاصلة كشك المثلّجات وفاصلة المقعد. »
- `lead`: « على يمين الصفر أعداد موجبة، وعلى يساره أعداد سالبة. »

**Levels** (same `objective` on both). World positions of the landmarks (metres, hidden): fountain 0, kiosk +30, bench −20, lamppost −40,
palm tree +20, bus stop −35, fishermen's kiosk +50, second bench +60.

*مبتدئ* (graduation 10 m; the hand moves the origin):

| id | Task | End state |
|---|---|---|
| `b1` | pin under the fountain: type the kiosk's and the bench's abscissae | **+30** and **−20** |
| `b2` | « انقل الصفر إلى المقعد »: type the kiosk's abscissa now | **+50** (the fountain is now +20) |
| `b3` | « ضع الصفر بحيث تكون لعمود الإنارة وللنخلة فاصلتان متعاكستان » | pin at world −10 (a free graduation): **−30** and **+30** |
| `b4` | pin under the fountain: « اكتب فاصلة موقف الحافلة » (it falls on a hatched half-cell) | **−35** |

*متقدم* (origin under the fountain; the hand chooses the step, then taps; PREDICT: the strip's labels stay hidden until the step is
confirmed):

| id | Landmarks to put on the board (abscissae from the fountain) | Smallest step that fits, all on graduations | End state |
|---|---|---|---|
| `a1` | −50 ; +75 ; +150 | **25** (positions −2, +3, +6; 20 → 150 is at 7,5: off the board) | step 25, three taps |
| `a2` | the fountain's mosaic: +0,3 ; −0,5 ; −0,1 ; +0,6 | **0,1** (0,5 → 0,3 between graduations) | step 0,1, four taps |
| `a3` | −250 ; +400 ; +600 | **100** (50 → 600 off the board) | step 100, three taps |

**« جرّب أعدادك » (always open):** up to four abscissae (|x| ≤ 9999, ≤ 2 decimals, `-` or `−`, Arabic-Indic digits), a free step; the
board shows « خارج اللوحة » arrows and hatched half-cells; never counted.

**LabCoach** (`sa.labCoach.corniche-ruler.off`): 1 `read` « عُدّ التدريجات من دبّوس الصفر » · 2 `type` « اكتب الفاصلة » · 3 `pin` (b2)
« اسحب دبّوس الصفر » · 4 `lever` (متقدم) « اختر قيمة التدريجة » · 5 `tap` « المس تدريجة المعلم » · 6 `free`. Never points at the answer.

**Lab prototype (§6ter):** chains from the student's run:
- b1: « كم تدريجة بين الصفر والكشك؟ » (3) → « كم مترًا تساوي التدريجة؟ » (10) → « لماذا فاصلة المقعد سالبة؟ » (on the left);
- b2: « هل تحرّك الكشك؟ » (no) → « لماذا تغيّرت فاصلته؟ » (the origin moved);
- b3 (P1): « ما المسافة بين كلّ منهما والصفر؟ » (30 and 30) → « ماذا نسمّي −30 و +30؟ » (متعاكسان);
- b4: « بين أيّ تدريجتين يقع الموقف؟ » (−40 and −30);
- a1–a3 (ends on the RULE of choice): « لماذا لا تصلح التدريجة 20؟ » → « نختار تدريجة تجعل أبعد نقطة داخل اللوحة وكلّ النقاط على تدريجات ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per snap, `flag` on a right abscissa, `over` on a refused one), full
screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:**
- `unitIgnored` (types 3 for the kiosk): a ghost kiosk is drawn 3 m from the pin, far from the real one;
- `signSide` (types +20 for the bench): the ghost bench appears on the right, mirrored;
- `originFixed` (b2: keeps +30): the ghost stands 30 m from the NEW pin, not on the kiosk;
- `notOpposite` (b3: pin under the fountain, −40 and +20): both plumb lines are drawn with their distances 4 and 2 graduations;
- `tooSmall` (a1: step 20): the far landmark slides off the board with an arrow « خارج اللوحة »; `between` (a2: step 0,5): hatched
  half-cells.

**Formal phase:** with the student's numbers: « $K(+30)$ ، $B(-20)$ ؛ $-30$ و $+30$ متعاكسان: المسافة إلى الصفر $30$ لكلّ منهما ».

**Core maths:** `relative.js` E1 row (`opposite`, `abscissaOf`, `positionOf`, `boardFit`, `smallestStep`). Lab logic
`logic/cornicheRuler.js`: `tasksOf(level)`, `abscissaFor(state, landmark)`, `judgeRead(task, landmark, text)` → `{ ok, model, ghost }`,
`judgeStep(task, step)` → `{ ok, off, between }`, `judgeTap(task, landmark, cell)`, `coachOf(state)`; events
`{ kind: 'pin', task, origin }`, `{ kind: 'read', task, landmark, value, ok, model }`, `{ kind: 'step', task, step, ok, off, between }`,
`{ kind: 'tap', task, landmark, cell, ok }`, `{ kind: 'solved', task }`, `{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `zero-probe` (this unit): the hand holds a DISTANCE from a fixed zero and a side; here the zero itself moves, and the step.
- `ruler-compare` (1AM): the hand chooses the graduation of a ruler to TELL APART two positive decimals; here the graduation must make a
  SET of signed numbers fit a fixed board, and the origin is a variable.
- `number-line-pegs` (3AM): carry a card and hang it where a fraction lives; here nothing is carried — the pin is planted, the lever thrown.
- `mooring-lines` (2AM m1): a clip slides along a rope to a candidate quotient with a precision dial; here the pin defines the origin
  (all numbers change at once) and the lever changes the scale of the whole board — no candidate value is searched.
- `ten-zoom`, `size-ladder`, `unit-ladder`: powers of ten / unit conversions; no signs, no origin.

**Screen budget:** 1024×768, lab column ≈ 414 px: the seafront scene ≈ 414 × 190 px (landmarks scaled), the board 414 × 70 px under it
(13 graduations → 30 px each; the pin ≥ 44 px touch target with an enlarged hit area), the answer pill + lever in ONE row below. At
1366×768 the board is 600 px wide. No scroll at 768×1024 and 1024×768.

**DOM:** `[data-corniche-ruler][data-level][data-task][data-origin][data-step][data-solved]`, `[data-cr-pin]` (slider),
`[data-cr-lever]` (slider), `[data-cr-landmark=<id>][data-abscissa]`, `[data-cr-cell=<i>][data-half]`, `[data-cr-answer]`,
`[data-cr-ghost][data-model]`, `[data-cr-off]`, `[data-cr-free]`, `[data-cr-formal]`, `[data-cr-kid][data-mood]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق ممّا أعرفه عن الأعداد السالبة والمستقيم المدرّج »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | « درجة حرارة $5$ تحت الصفر تُكتب $-5$ °C » | ✓ | 1am.m5.r05 |
| 2 | « على مستقيم مدرّج وحدته $1$ ، النقطة التي تبعد عن المبدأ بثلاث تدريجات إلى اليسار فاصلتها $3$ » | ✗ ($-3$) | 1am.m5.r06 |
| 3 | « العدد المعاكس لـ $-8$ هو $8$ » | ✓ | `prep` 3 |
| 4 | « $(+1{,}2)$ و $(-2{,}1)$ عددان متعاكسان » | ✗ | `prep` 4 / 1am.m5.r06 |
| 5 | « على نصف مستقيم مدرّج تدريجته $0{,}1$ ، النقطة الواقعة على التدريجة السابعة بعد $2$ فاصلتها $2{,}7$ » | ✓ | 1am.m5.r04 |
| 6 | « $\frac17$ عدد نسبي من أعداد هذه السنة » | ✗ (decimal writing only) | `prep` 2 |

**M1 نشاط — « مسطرة الكورنيش »** — `objectives`: « أكتشف أنّ فاصلة نقطة تتعلّق بالمبدأ وبقيمة التدريجة ». Lab on top (both levels);
then the trace and the bricks: `faasila` (b1) · `faasila-tataghayyar` (b2) · `mutaakisan` (b3) · « أتوقّع القاعدة » then
`ikhtiyar-tadrij` (a1–a3).

**M2 معارف** — `objectives`: « أسمّي الفاصلة والمسافة إلى الصفر والعددين المتعاكسين ».
- Lab ALONE (`levels={false}`, graduation 5, pin under the bench — world −20): the student types the lamppost **−20**, the palm
  **+40**, the bus stop **−15**.
- Boxes: « تذكّر — السنة الأولى » (no link: the origin, positive to the right, negative to the left) · definition of the abscissa
  (platform words), $A(-3)$ · distance to zero · opposites · examples $B(+12{,}5)$ ، $C(-0{,}4)$ ؛ $-7$ و $7$ متعاكسان.

**M3 طريقة** — `objectives`: « أختار تدريجة مناسبة وأقرأ فاصلة على تدريج دقيق ». Steps:
1. Place $-30$ ، $45$ ، $60$ ، $-15$ on a board of 6 graduations each side: the largest distance to zero is 60, $60\div6=10$, but 45 falls
   between two graduations; graduation **15** puts them at −2, 3, 4, −1 (Q « لماذا لا تصلح التدريجة $5$؟ » — 60 is at 12 graduations);
2. read a point on a line graduated in $0{,}25$: three graduations left of 0 → $-0{,}75$;
3. place $-1{,}25$ on the same line (five graduations left).
Method box: « نبحث عن أبعد عدد عن الصفر، ونختار تدريجة تُبقيه داخل المستقيم وتجعل كلّ الأعداد على تدريجات إن أمكن ».

**M4 أتمرّن** — `objectives`: « أقرأ فواصل وأضع نقطًا وأختار التدريج »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | خطّ زمن المتوسطة: المبدأ سنة $2000$ (افتتاح المتوسطة). ضع على مستقيم فيه 10 تدريجات في كلّ جهة: ميلاد الجدّ $1955$ ، أوّل رحلة $1990$ ، المكتبة $2015$ ، القاعة الرياضية $2025$ | $-45$ ; $-10$ ; $+15$ ; $+25$ ; graduation 5 ($-45$ at −9) | `act-1` a-b |
| 2 | اقرأ فواصل أربع نقط على مستقيم تدريجته $5$ | $-15$ ; $-5$ ; $+10$ ; $+25$ | `ex-4`…`ex-6` |
| 3 | اقرأ فواصل أربع نقط على مستقيم تدريجته $10$ ، ثم على مستقيم تدريجته $0{,}25$ | $-30$ ; $+20$ ; $-50$ ; $+40$ / $-0{,}5$ ; $+0{,}75$ ; $-1{,}25$ ; $+1$ | `ex-7`, `ex-8`, `ex-11` |
| 4 | ضع $A(-3{,}5)$ ، $B(2)$ ، $C(-1{,}25)$ ، $D(0{,}75)$ | figure | `ex-9` |
| 5 | من بين $-2{,}5$ ؛ $4$ ؛ $2{,}5$ ؛ $-4$ ؛ $0{,}4$ ، ما الأزواج المتعاكسة؟ | $(-2{,}5\,;2{,}5)$ ، $(4\,;-4)$ | `ex-10`, `ex-11` c |
| 6 | درجات مهمّة: الجسم $37$ ، تجمّد الماء $0$ ، غليانه $100$ ، الصفر المطلق $-273{,}15$ °C : أيّ تدريجة تضعها كلّها على مستقيم من 6 تدريجات في كلّ جهة؟ | $50$ ($-273{,}15$ between −6 and −5) | `ex-2` (adapted) |
| 7 | خمس وضعيات (رصيد نقاط مسابقة، طابق المرأب، عمق غوّاص، سنة قبل افتتاح المدرسة، حرارة الفجر في الجلفة): اكتب العدد النسبي | $-15$ ; $-2$ ; $-12$ ; $-3$ ; $-4$ | `ex-1`, `ex-3` |

**M5 مسألة 1 (`lessonProblem`) — « خطّ زمن متوسطتنا »** — `objectives`: « أختار مبدأ وأقرأ الفواصل وأغيّرها بتغيير المبدأ ».
- Statement: « نتّخذ سنة افتتاح المتوسطة $2000$ مبدأً. أحداث: $1985$ ، $1990$ ، $2010$ ، $2015$ ، $2024$ . »
- Q/A: 1) فواصل الأحداث → $-15$ ، $-10$ ، $+10$ ، $+15$ ، $+24$ ; 2) « أيّ حدثين فاصلتاهما متعاكستان؟ » → $1985$ و $2015$ ، $1990$ و $2010$ ;
  3) « لو اتّخذنا $1990$ مبدأً، ما فاصلة $2024$؟ » → $+34$ ; 4) « تدريجة تضعها كلّها على مستقيم من 6 تدريجات في كلّ جهة » → $5$ ($24$ between 4 and 5).

**M6 مسألة 2 — « منسوب السدّ »** — `objectives`: « أختار تدريجة عشرية تناسب فواصل عشرية وأضعها ».
- Statement: « نقيس منسوب الماء في سدّ بالنسبة إلى منسوبه العادي (الصفر): جانفي $+1{,}5$ m ، أفريل $+0{,}5$ m ، جويلية $-0{,}75$ m ، سبتمبر $-2{,}25$ m . »
- Q/A: 1) « أيّ التدريجتين $0{,}25$ أو $0{,}5$ تضع المناسيب الأربعة على مستقيم فيه 6 تدريجات في كلّ جهة؟ » → $0{,}5$ ($0{,}25$ puts
  $-2{,}25$ at −9: off; with $0{,}5$: $+3$ ، $+1$ ، $-1{,}5$ ، $-4{,}5$ — two between graduations) ; 2) « هل يوجد شهر منسوبه معاكس لمنسوب
  أفريل؟ » → لا: معاكس $+0{,}5$ هو $-0{,}5$ ; 3) المسافة إلى الصفر لمنسوب سبتمبر → $2{,}25$ m.

**M7 مسألة 3 — « أزرار المصعد »** — `objectives`: « أمثّل طوابق عمارة على مستقيم مدرّج عمودي ».
- Statement: « في عمارة طوابق من $-3$ (المرأب) إلى $+9$ . نمثّلها على مستقيم مدرّج عمودي مبدؤه الطابق الأرضي. »
- Q/A: 1) فاصلة المرأب الأسفل → $-3$ ; 2) « الطابق المعاكس للطابق الذي فيه المخبزة $+4$ موجود؟ » → لا ($-4$ < $-3$) ; 3) « نتّخذ الطابق $+2$ مبدأ: ما فاصلة المرأب؟ » → $-5$.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | النقطة $M$ على ثلاث تدريجات يسار المبدأ، والتدريجة $5$ : فاصلتها | $-15$ | $-3$ (UNITIGNORED) · $+15$ (SIGNSIDE) · $-8$ (ADDSTEP) | P2 |
| 2 | معاكس $-2{,}5$ | $2{,}5$ | $-2{,}5$ (OPPSAME) · $0{,}4$ (RECIP) · $-5{,}2$ (DIGITSWAP) | P1 |
| 3 | نريد وضع $-40$ ، $+60$ ، $+20$ ، $+30$ على تدريجات مستقيم فيه 6 تدريجات في كلّ جهة: التدريجة المناسبة | $10$ | $5$ (TOOSMALL: 60 at 12) · $15$ (40 between) · $20$ (30 between) | P3 |
| 4 | « $A(-7)$ و $B(+7)$ » : العبارة الصحيحة | « لهما المسافة نفسها إلى الصفر » | « $A$ و $B$ في الجهة نفسها » · « المسافة إلى الصفر لـ $A$ هي $-7$ » (NEGDIST) · « $A$ هي $B$ » | P1 |
| 5 | التدريجة $1$ ؛ نقلنا المبدأ إلى النقطة $C(+20)$ : فاصلة $D(+50)$ الجديدة | $+30$ | $+50$ (ORIGINFIXED) · $+70$ (ADDORIGIN) · $-30$ | P3 |

## 8. Misconceptions (`MISC-TALIM2-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `UNITIGNORED` | count graduations, forget their value | ghost 3 m from the pin | test 1 |
| `SIGNSIDE` | a point left of 0 read positive | mirrored ghost | test 1 |
| `ADDSTEP` | count + step | — | test 1 |
| `OPPSAME` | the opposite of $-a$ is $-a$ | b3 | test 2 |
| `RECIP` | opposite confused with reciprocal | — | test 2 |
| `DIGITSWAP` | opposite = digits reversed (book prep 4) | b3 | test 2; M0 4 |
| `TOOSMALL` | the smallest step is always best | off-board arrow | test 3 |
| `NEGDIST` | a distance to zero can be negative | formal phase | test 4 |
| `ORIGINFIXED` | an abscissa belongs to the point whatever the origin | b2 ghost | test 5 |
| `ADDORIGIN` | new abscissa = old + new origin | b2 | test 5 |

## 9. Practice bank (`content/practice/2am/talim-mustaqim-mudarraj-2/`, 5 × 10)

**Read by the planner:** `2am-s2-62` ex 2 q 1, q 3, q 4 (place A(−5), B(+3), C(−2); « L نظيرة A بالنسبة إلى O » ON THE LINE = the
opposite; abscissae of M and L — M needs the midpoint: that question is `masafa-nuqtatayn`'s, here only L); `2am-s1-69` ex 4 q 1, q 4
(place F(+5), E(−3); D whose abscissa is the opposite of G's — G is the midpoint: give G's abscissa in the statement); `2am-s2-63` ex 2
q 1 (place A(+4,5), B(−5), C(−2) on a line of unit 1 cm). **To read:** `2am-s1-73` ex 3 (rendering), `2am-s2-71` ex 1 (rendering).

**Honest FAITHFUL count: 3 read today; 4–6 expected.** r01 is a small item of the papers (a question inside an exercise): the
faithful sheets are short (L1–L3); L4–L5 are modelled.

| Level | Content | Provenance |
|---|---|---|
| L1 | read an abscissa (graduation 1, 5, 10, 0,1, 0,25); write the opposite | 1 term_exam (`-62` ex 2 q 1 placement read back) · 7 modelled · 2 adapted (`ex-6`, `self-4`) |
| L2 | place points, choose a graduation, « برّر » (why this graduation?) | 1 term_exam (`-63` ex 2 q 1) · 7 modelled · 2 adapted (`ex-9`, `ex-2` without internet) |
| L3 | full exercise: place, opposite, read, change origin | 1 term_exam (`2am-s1-69` ex 4 q 1, q 4) · 1–2 after reading (`2am-s1-73` ex 3, `2am-s2-71` ex 1) · 7 modelled · 1 adapted (`act-1` own dates) |
| L4 | mobilises `muqarana-nisbiya` (same term): place then order; those steps `counted: false` | 10 modelled (`2am-s2`) |
| L5 | « الوضعية الإدماجية »: a timeline / a dam / a building, a decision (which graduation fits the board? which events are symmetric?) | 10 modelled |

**Oracle** `scripts/practice-oracle/talim-mustaqim-mudarraj-2.mjs` (BigInt hundredths; every abscissa recomputed from graduation count
× step and the origin; every « suitable graduation » key checked = the smallest step in the offered list that fits; each distractor
checked equal to its named error and false).

## 10. Risks & owner questions

1. **P1's extension** (distance to zero) — README Q5.
2. **The consolidates pattern with an unpublished 1AM base** — the lesson never rebuilds « −3 is left of 0 » as a discovery; if the
   owner prefers a short rebuild for students who never had 1AM, M1's b1 is that rebuild (default: as planned).
3. **Real dates avoided**: the BC date of `act-1` (25 ق.م) is not reused; the school timeline has no year 0 problem (its origin is 2000).
4. **Board width at 414 px**: 13 graduations × 30 px; the landmarks' labels are icons + short Arabic words; test « no label overlaps ».

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 36, 37, 39, 43, 46 at 200 dpi; `verified: True` for `act-1`, `know-1a`, `prep`, `ex-1`…`ex-11`,
  `self-4`; destinations: `act-1` items a-b → 4 (README move); `know-1a` → 2; `prep` 1-2-3-4 → 0; `ex-1`…`ex-11` → 4 (cited by M4 items);
  `self-4` → 8 (moved here); record the README discrepancies (`scope`) for `ex-2`, `ex-10`; copy the README boundary block into the header.
- [ ] `relative.js` E1 functions + tests (exhaustive: `boardFit` for every step of the lever and every abscissa |x| ≤ 600 by 5).
- [ ] Lab `corniche-ruler` (type, theme `corniche`, levels, registry, strings `cornicheRuler`, logic + test (every task; every model of
  `judgeRead`; `smallestStep` = the planned step for a1–a3), render test, LabCoach, §6ter ✅, contract section, DNA row, screenshots: b1
  initial, b2 after the move, b3 solved, a1 with step 20 (off board), a2 solved — five sizes, reviewed).
- [ ] Lesson: 9 modules, header (design + rejected candidates), « تذكّر — السنة الأولى » without link, `content.test.js` (BigInt), memos.
- [ ] Catalogue (P1–P3 final, `pointPrerequisites` intra, `textbookRef.method: null`, duration, difficulty, icon), index, net map, e2e
  `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-talim-mustaqim-mudarraj-2.mjs`, gates, bank (`MISC-TALIM2-*`), publish (guide §11: lesson,
  9 modules, 50 exercises `published`), commit `feat(lessons): talim-mustaqim-mudarraj-2`.

## 12. Successor connection

- **2AM `muqarana-nisbiya`** (published; net `2am.m4.r01 → 2am.m4.r02`, requires):
  - catalogue `pointPrerequisites`: **`2am_muqarana-nisbiya_P1` ← `2am_talim-mustaqim-mudarraj-2_P1`** (two negatives are compared by
    their distances to zero) — today P1 has no entry: create `"P1": ["2am_talim-mustaqim-mudarraj-2_P1"]`. r03 (P3) has no link from
    r01 → no edge on P3; P2 is r02 too but rests on the order of the line, already reached through P1 → no edge;
  - its `lesson.config.js` header: history line « 2026-10-?? : P1 ← 2am_talim-mustaqim-mudarraj-2_P1 (net r01 → r02) »; it holds NO
    « تذكّر » box toward r01 (its « أستعدّ » measures r01 and the « راجع قبل أن تنطلق » panel becomes a link by itself): nothing else to
    edit; `brief-authors.md` § 1 « leçon NON publiée » gets a dated note.
- **Inside the unit:** `jam-tarh-nisbiya` writes its own edges toward this lesson (its plan §2).
- No 3AM / 4AM net link starts at r01 → nothing else.

## Generator notes (lead, 2026-10-29)

Fixes and deviations from the plan, all minimal:
1. **a3 miscomputed.** The plan's `a3` values `−250 ; +400 ; +600` do not give the planned step: `−250 ÷ 100 = −2,5` is between two graduations, so no notch of the lever fits. Built with **`−300 ; +400 ; +600` → 100** (`50` puts 600 at 12 graduations: off the board). `relative.test.js` and the lab's logic test sweep every notch.
2. **Module 2 graduation.** The plan's « graduation 5, pin under the bench » was not built: the beginner board is a fixed 10 m board. Module 2 poses the same lab alone with the pin under the bench (−20) and the same numbers (lamp −20, palm +40, bus stop −15, the last one between two graduations); chain `m1` (`count · ruleB`).
3. **M0 items.** `prep` 1, 3, 4, 2 are the textbook items (rewritten); the two platform items measure `1am.m5.r06` (reading left of the origin) and `1am.m5.r04` (decimal graduation). `priorKnowledge`: `faasila-nuqta`, `adad-nisbiya-siyaq-1am`, `nisf-mustaqim-1am`, `adad-mutaakis`.
4. **No student-visible figure in the bank** (a 12:1 graduated line fails `figureQuality`): reading and placing questions use counted graduations in words.
5. **Bank.** 50 sheets: 5 `term_exam` (all modelled, numbers changed), 40 `term_exam_modelled`, 5 `adapted`; an eleventh misconception `MISC-TALIM2-TOOBIG`; `DIGITSWAP` = the book's error (sign flipped and digits reversed). See the bank report in the final report.
6. **Extraction.** Destinations moved in `build-extraction.py`: `act-1` a-b → module 4, `self-4` → L1 module 8; discrepancies `scope` for `ex-2` and `ex-10`. The elements `act-1`, `ex-1…11`, `self-4` were NOT re-read at 200 dpi (`verified` unchanged): the lesson uses none of the book's numbers.
7. **Catalogue.** `textbookRef.pages.method: null`, `durationMinutes` 60 (modules without the three مسائل), difficulty « سهل », icon 📏; `pointPrerequisites` P2 ← P1, P3 ← P1, P2. A third prerequisite chip « الأعداد السالبة في الحياة اليومية » was added.
8. **Not done by the lead** (coordinator): successor connection (§12), DB export/import and publication, the guide's « patterns to reuse » note (the guide file was dirty in the tree and left untouched).
9. **Bidi rule (coordinator review).** In an Arabic sentence every « value + unit » (`10 m`, `20 m`) is ONE LTR run: in plain strings wrap it in an LTR isolate (U+2066 … U+2069), in KaTeX strings write `$10\,\mathrm{m}$` (never `$10$ m`); in JSX put the unit INSIDE the `<bdi dir="ltr">`. Applied to `cornicheRuler` strings, the lever readout, `Module01Nashat`, `problems.js` and the 16 bank sheets that carried `$N$ m`. Re-grep `[0-9}$] m\b` in every new lab, module and bank.
