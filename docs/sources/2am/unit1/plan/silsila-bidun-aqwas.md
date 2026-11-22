# Plan — `silsila-bidun-aqwas` « سلسلة عمليات دون أقواس وأولوية العمليات » (2AM unit 1, lesson 1 of 4 + synthesis)

Read the unit [`README.md`](README.md) first (boundaries, `chainOps.js`, element ids, discrepancies). **This entry SEEDS the unit** and
writes the whole-unit extraction.

## 1. Identity

- **Code** `silsila-bidun-aqwas` · **title** « سلسلة عمليات دون أقواس وأولوية العمليات » · **unit** `amaliyat-tabiiya-ushriya` ·
  catalogue order 0 · kind `lesson` · programme item `2am.m1.r01`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/silsila-bidun-aqwas/`.
- **Textbook pages** (book → PDF = book − 3):

  | Book p. (PDF) | Elements |
  |---|---|
  | 6 (3) | `challenge` (30 − 8 + 2, two trees), `objectives`, `opener` (→ synthesis) |
  | 7 (4) | `prep` items 3, 4, 5, 6, 7 |
  | 8 (5) | `act-1` (25 − 7 + 3: 15 or 21; keys; four checked results; Younes 230 − 160 + 100), `act-2` (calculator checks; instalments) |
  | 10 (7) | `know-1` (+ − left to right; × ÷ left to right; priority) |
  | 14 (11) | `ex-1` … `ex-7` |
  | 17 (14) | `self-1`, `self-6` |
  | 18 (15) | `deep-39` |

- **Seeds the unit: YES** (README « Seeding »): `_unit/`, `build-extraction.py` → `extraction.json` (whole unit, this lesson's elements
  `verified: True`), `chainOps.js` (L1 row), the تحدّ rewrite.

## 2. Programme & net

**Programme item:** `2am.m1.r01` « إجراء سلسلة عمليات. » (shared with L2 and L3).

**Draft الكفاءات (verbatim):**
1. « إنجاز سلسلة عمليات جمع وطرح (أو ضرب وقسمة) فقط بإجراء العمليات من اليسار نحو اليمين »
2. « تطبيق أولوية الضرب والقسمة على الجمع والطرح في سلسلة عمليات دون أقواس، مثل $13 + 7 \times 4 = 41$ »
3. « ترجمة وضعية من الحياة اليومية بسلسلة عمليات ثمّ حسابها »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | إنجاز سلسلة عمليات فيها جمع وطرح فقط (أو ضرب وقسمة فقط) دون أقواس، بإجراء العمليات من اليسار نحو اليمين | wording only |
| P2 | تطبيق أولوية الضرب والقسمة على الجمع والطرح في سلسلة عمليات دون أقواس، مثل $15 + 3 \times 4 = 27$ | example: the book's `13 + 7 × 4` (know-1) replaced by the lab's own (independence rule) |
| P3 | ترجمة وضعية من الحياة اليومية بسلسلة عمليات **دون أقواس** ثمّ حسابها | « دون أقواس » added: a situation that needs brackets is `silsila-bi-aqwas`'s (boundary) |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home | Status |
|---|---|---|---|
| `1am.m1.r05` | جمع، طرح وضرب أعداد عشرية في وضعية معيّنة. | `mana-jam-tarh` (1AM) | **published** → the panel links it; « تذكّر — السنة الأولى » box WITH `getLessonPath('mana-jam-tarh')` |

Extra `priorKnowledge` (allowed, measured, recalled without link): multiplying decimals (`darb-adad-ashriya`, 1AM, coming_soon) and
dividing (`qisma-iqlidiya-baqi`, 1AM, published — link). **noRebuild:** empty (`noRebuildForLesson` = []). The lesson never re-teaches
choosing + or − (`mana-jam-tarh` P1) or the tape diagram (P3): it uses them.

**pointPrerequisites:**
- intra-lesson: P2 ← P1; P3 ← P1, P2;
- cross-year (net link `1am.m1.r05 → 2am.m1.r01`, `requires`; `mana-jam-tarh` is published, its LPs final): **P3 ← `1am_mana-jam-tarh_P1`**
  (choose the operation in a situation) and **P3 ← `1am_mana-jam-tarh_P3`** (translate « يزيد، ينقص » before computing). P1 and P2 take
  no cross-year edge (`mana-jam-tarh` teaches no chain).

**Where it is used next:** L2–L4 and the synthesis; `quwat-adad-nisbi` P4 (published, § 12); `mutawassit-mutawazin` (3AM, planned:
Σ nᵢxᵢ ÷ N is a priority chain); 3AM `qismat-nisbiyayn` P4 / `amaliyat-natiqa` P4 (if the owner adds the link).

## 3. Boundary

**Owns:** chains without brackets and without a fraction bar; + − only and × ÷ only from left to right; × ÷ before + −; naturals and
decimals; translating a story whose numbers come in reading order; the scientific calculator obeys the same rule (shown in a result,
never typed with brackets); « اتّفاق » — a chain must have ONE reading.

**Leaves:** any bracket, [ ], fraction bar, keys with brackets → L2; naming a chain by its last operation → L3; distributivity → L4; any
negative intermediate (2AM unit 3); Euclidean division / approximate quotients (unit 2).

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `challenge` | 30 − 8 + 2 by two trees (20 / 24) | two readings → we must agree | **The entry idea**, as the lab's first task with own numbers (26 − 9 + 4) and a story that makes the order MEAN something |
| `act-1` | explain 15 and 21; the calculator's order; check four + − / × ÷ results; Younes 230 − 160 + 100 | the calculator reads left to right | **Not the entry** (the student is asked to explain someone else's numbers, from memory). أتمرّن item 1 (own numbers 31 − 9 + 4: 18 or 26) |
| `act-2` q1 | check 8 + 3 × 4 = 20 etc. with a calculator | the calculator does × first | أتمرّن item 2 (own) |
| `act-2` q2 | 54 000 DA in 4 instalments (misprint, discrepancy 3) | a − n × b | مسألة 1 (redesigned: a bicycle) |
| `know-1` | the three rules + 6 examples | wording of the rules | معارف: platform sentences, own examples |
| `prep` 3–7 | order of terms, mental sum, decimals, segment lengths | 1AM operations in context | « أستعدّ » (rewritten) |
| `ex-1` … `ex-3` | + − / × ÷ chains, mental | P1 | bank L1 (adapted) |
| `ex-4`, `ex-6` | priority, mental | P2 | أتمرّن item 4 (own) |
| `ex-5` | Khaled's sheet (three errors) | the named errors | أتمرّن item 5 (own sheet) |
| `ex-7`, `deep-39` | missing operation / missing number | priority read backwards | أتمرّن item 6 (own) |
| `self-1` | six chains | test register | bank L1 / L2 (adapted) |
| `self-6` | BOC = 82° − 27° − 33° | translation with angles | أتمرّن item 7 (own angles) |

## 5. Design

**The lesson in one paragraph.** A class goes on a tram outing. « في العربة 26 تلميذًا. في محطة السوق نزل 9، وفي محطة الجامعة صعد 4 »:
the chain is 26 − 9 + 4. Two friends compute 13 and 21. Who is right? The tram's passenger counter, which counts the pupils stop after
stop, says 21: the stops happen in the ORDER they are written, so we compute from left to right. With only « صعد » the order never
matters (26 + 4 + 9 in any order); with « نزل » it does. The ticket kiosk shows the same for × and ÷: « دفتر من 6 تذاكر بـ 150 DA ؛ كم
ثمن 4 تذاكر؟ » 150 ÷ 6 × 4 = 100, whereas multiplying first gives 6,25 DA for four tickets — absurd. Then « في محطة الملعب صعد 3 أفواج في
كلّ فوج 4 تلاميذ » — 15 + 3 × 4: a group of 4 boards AS A WHOLE, so 3 × 4 is ONE quantity, computed before it joins the 15; adding first
(18 × 4 = 72) would turn the 15 seated pupils into groups of 4. That is the priority of × and ÷. On a bare chain the reading is an
AGREEMENT (« اتّفاق ») that the calculator also follows.

**Entry point — candidates compared:**
- (a) **The book's `act-1`** (explain 15 and 21 for 25 − 7 + 3): the student explains other people's numbers; the rule is asked from
  memory. Rejected as the entry → أتمرّن.
- (b) **The تحدّ trees** (Younes / Inès): shows two readings but gives no reason to prefer one. Its idea is kept inside (c).
- (c) **A shop receipt** (3 × 45 + 2 × 30): makes the priority natural, but not the left-to-right of + −. Kept for مسألة 2 / the test.
- (d) **The tram trip** (stops in time order; groups that board together; a kiosk for × ÷): one world where BOTH rules have a visible
  reason and a wrong order produces a visible absurdity checked by a counter. **Chosen.** `experience: { type: 'platform_context',
  reason: 'platform_designed_entry', theme: 'tramline' }`.

**Order of ideas:** two readings of the same chain (t1) → only « صعد »: order free; with « نزل »: left to right (t2) → × ÷ only: left to
right (t3) → groups: × ÷ first (t4) → معارف names the three rules → طريقة: underline × ÷, then left to right; translate a story → أتمرّن,
three مسائل, the test.

**Contexts:** a school tram outing; a bicycle paid in instalments (family budget); the class library fund (a parent's donation); a
nature club's walk and bike ride. All neutral, Algerian (tramway of Algiers / Oran / Constantine / Sétif — no city named on screen).

## 6. Lab — `tram-route` « خطّ الترامواي » (new type)

**Drawn world `tramline`** (new theme, kind `objects`, shows « ترامواي مدينة جزائرية: محطات، عربة، عدّاد الركّاب وكشك التذاكر »):
- a tram line drawn left → right across the stage (rails, overhead wire, 3–4 stations with their sign and a shelter); the tram (two
  articulated cars, windows where seated pupils show) at the first station;
- at each station, the pupils waiting or getting off (`KidFigure`, boys in hoodies, girls in hijab and tunic; a GROUP holds hands under a
  coloured flag with its size « 4 »);
- the passenger counter « عدّاد الركّاب » above the driver's cab (a big LED readout) and, for × ÷ tasks, a ticket kiosk at the platform
  (a screen « ثمن التذاكر »);
- under the line, the story's chain written in a wide LTR strip (numbers as plates, operators as round chips);
- KidFigure Amine (hoodie) is the driver's helper and reacts (`wonder` on a refused plan, `proud` on success).

**The variable in the hand: the ORDER of the operations** — a permutation of the chain's operators.

**Gesture:**
- **stamp tickets**: a ticket punch holds the numbered tickets ① ② ③ (as many as operators); tap an operator chip to stamp the next
  number on it (or drag a ticket onto the chip); tap a stamped chip to take its ticket back (the later ones shift down);
- keyboard: Tab to a chip, Enter stamps / unstamps; « مسح » clears;
- then « انطلق » (enabled when every chip has a ticket) replays the plan.

**What the world shows (the replay):**
- the plan is computed in the student's order on the chain strip (each stamped operation collapses its two plates into one, in ticket
  order) — the PLAN's result goes on the driver's board « حسابك »;
- the tram then rides the line in TIME order: at each station the pupils get on / off and the counter ticks — the COUNTER's result is the
  truth;
- equal → stamp « ✓ », the counter and the plan glow together (`solved`);
- different → refused (`reason: 'mismatch'`): the replay stops on the FIRST stamped operation that has no meaning in the trip, and the
  world draws it: « نزل 13 تلميذًا في محطة السوق؟ لم ينزل إلا 9 » (t1, + done first), « 18 فوجًا من 4؟ في العربة 15 تلميذًا جالسين لا
  أفواج » (t4, 15 + 3 done first — the seated pupils are drawn duplicated in ghost groups), « 4 تذاكر بـ 6,25 DA ؟ » (t3);
- a plan whose result equals the counter by commutativity (any order in a + only chain) is ACCEPTED and the banner says « هنا كلّ ترتيب
  يعطي العدد نفسه » (`kind: 'plan', ok: true, conventional: false`) — this contrast opens the discovery.

**Opening (no title):**
- Context (t1): « رحلة القسم بالترامواي: في العربة 26 تلميذًا. في محطة السوق نزل 9، وفي محطة الجامعة صعد 4. »
- Question: « رقّم العمليات بالترتيب الذي تحسبها به، ثم انطلق: هل يوافق حسابُك عدّادَ الركّاب؟ »
- `lead` (lesson): « كلّ عملية تحدث في محطة. »

**Levels** (same `objective` on both: « أكتشف الترتيب الذي تُحسب به سلسلة عمليات دون أقواس »):

*مبتدئ* (chain given, plan stamped, counter visible at the end of each replay):

| id | Story | Chain | Truth | Wrong plans and what they give |
|---|---|---|---|---|
| `t1` | 26 seated; 9 get off; 4 get on | 26 − 9 + 4 | **21** | + first: 26 − 13 = **13** (« نزل 13؟ ») |
| `t2` | 40 seated; 12 off; 6 off; 9 on | 40 − 12 − 6 + 9 | **31** | 40 − (12 − 6) + 9 = **43**; 40 − 12 − (6 + 9) = **13** |
| `t3` | kiosk: 6 tickets cost 150 DA; price of 4 tickets | 150 ÷ 6 × 4 | **100 DA** | × first: 150 ÷ 24 = **6,25 DA** |
| `t4` | 15 seated; 3 groups of 4 get on | 15 + 3 × 4 | **27** | + first: 18 × 4 = **72** (ghost groups) |

*متقدم* (TRANSLATE then PREDICT: the student first builds the chain from the story — number plates and operator chips dragged into the
strip in station order, judged by `chainOps` value against the story — then types the predicted result BEFORE « انطلق »; diagnostic,
never blocking; no counter before the replay):

| id | Story | Chain | Truth |
|---|---|---|---|
| `a1` | 32 seated; 4 groups of 5 get off; 6 get on | 32 − 4 × 5 + 6 | **18** (wrong: (32 − 4) × 5 + 6 = 146; 32 − (4 × 5 + 6) = 6) |
| `a2` | odometer: 1,5 km to the first stop, then 4 sections of 0,8 km | 1,5 + 4 × 0,8 | **4,7 km** (wrong: (1,5 + 4) × 0,8 = 4,4) |
| `a3` | 60 pupils share 4 cars equally; at the stadium 3 groups of 6 board OUR car | 60 ÷ 4 + 3 × 6 | **33** (wrong: (60 ÷ 4 + 3) × 6 = 108) |

**« جرّب أعدادك » (always open, `[data-tram-free]`):** up to four stations, each « صعد n » / « نزل n » / « صعد k أفواج من m » / « نزل k
أفواج من m » (n, k, m ≤ 40; the panel refuses a trip whose counter would go below 0 — « لا يمكن أن ينزل أكثر ممّا في العربة »); the chain
is written live; any plan may be replayed; nothing counts (`free: true`).

**LabCheckpoint (lab prototype, L1 — questions OVER the lab after each task; 2 hints each; data `CHAINS` + `QUESTIONS` in the lab file;
strings `lesson.manipulation.json › tramRoute.cp.*`):**
- after `t1`: « في خطّتك المرفوضة حسبتَ 9 + 4 أوّلًا. كم تلميذًا نزل فعلًا في محطة السوق؟ » → 9 · « في أيّ ترتيب حدثت المحطّتان؟ » →
  « السوق ثم الجامعة، كما كُتبتا ».
- after `t2`: « هل يتغيّر العدد إذا بدّلتَ ترتيب عمليتي صعود فقط؟ » → لا · « وإذا كان بينهما نزول؟ » → نعم → **rule** (chain ends): « في سلسلة
  جمع وطرح فقط نحسب من اليسار نحو اليمين ».
- after `t3`: « بكم تذكرة واحدة؟ » → 25 DA · « لماذا لا يمكن أن تكون 4 تذاكر بـ 6,25 DA؟ » (choice) → « لأنّ تذكرة واحدة 25 DA » ·
  rule « في سلسلة ضرب وقسمة فقط نحسب أيضًا من اليسار نحو اليمين ».
- after `t4`: « كم تلميذًا في الأفواج الثلاثة معًا؟ » → 12 · « متى أُضيفوا إلى الـ 15؟ » → « بعد حساب 3 × 4 » · rule « الضرب والقسمة قبل
  الجمع والطرح ».
- Teacher switch L2 (`useLabCheckpointSettings('tram-route')`); stepper L3 (`LabStepper`), celebration L4 once per task; « إعادة » L5
  restarts from `t1` (tickets, trials, questions via `resetKey`); sounds L6 (`playSfx`: stamp = gesture, success = `bell`, refusal = `over`;
  off by default); full screen L7 (`immersive`; the line is laid out to the screen height, stations spaced to the width); guided L9.

**LabCoach** (`coachOf`, pure; never names an order or a number):
1. `stamp`: « اضغط على عملية لتضع عليها رقم ترتيبها. » (on the first chip)
2. `stampMore`: no text (same gesture) — ring only on the next unstamped chip;
3. `go`: « انطلق لترى العدّاد. » (on « انطلق »)
4. `refused`: silent (the banner speaks); then `retry` on « مسح »: « غيّر الترتيب وانطلق من جديد. »
5. `build` (متقدم): « اسحب الأعداد والعمليات إلى الشريط بترتيب المحطات. »
6. `predict` (متقدم): « اكتب توقّعك قبل أن تنطلق. »
7. `free`: « جرّب رحلتك في « جرّب أعدادك ». »

**Wrong moves made VISIBLE:** + before − (t1, t2: more pupils get off than there are); × before ÷ (t3: a ticket price absurd); + before ×
(t4, a3: seated pupils turned into groups); right to left (any task: the replay plays the stations backwards and the counter disagrees).

**Discovery (formal phase after `t4`):** the three rules NAMED (bricks in the module), plus « على الآلة الحاسبة العلمية: تحسب الآلة
بالترتيب نفسه » shown with the lab's own `t4` typed as 15 + 3 × 4 = 27 (a drawn calculator in the side panel — no brackets).

**Core maths:** `chainOps.js` (L1 row: `parseChain`, `evaluateChain`, `valueInOrder`, `conventionalOrder`, `isNonNegativeChain`,
`chainText`); lab logic `logic/tramRoute.js`: `tripOf(task)` → stations and events; `counterAt(trip, i)`; `replay(trip, order)` →
`{ planValue, counterValue, firstAbsurd: { station, kind: 'overflow' | 'groups' | 'price' } | null }`; `coachOf(state)`; events:
- `{ kind: 'plan', task, order, value, truth, ok, conventional, free }`;
- `{ kind: 'refused', task, reason: 'mismatch', order, value, truth, station }`;
- `{ kind: 'build', task, chain, ok }` / `{ kind: 'predict', task, predicted, truth, ok }` (متقدم);
- `{ kind: 'custom', free: true }`, `{ kind: 'solved', task, value }`.

**Why not another lab (DNA §12):**
- `merge-board` (3AM): tap two NEIGHBOURING tiles to merge them; a magnet forbids the wrong merge (the priority is imposed, never
  discovered); rationals and signs. Here the student AUTHORS a whole order before anything happens, and the WORLD (time, groups, prices)
  is the referee.
- `story-bars` (1AM): the tape decides whether a story adds or subtracts; one operation. Here the operations are known; their ORDER is
  the variable.
- `elevator-reel` (3AM): scrubbing a signed time. Nothing is scrubbed here; time is a sequence of stations.
- `vector-chain` (4AM, theme `metro`): a route on a metro map (Chasles); here no geometry, the tram is a counter of people.

**Screen budget:** 1024×768 with the sidebar: the line at full width (stations every ~22 %), the strip of the chain under it (plates
≥ 56 px, chips ≥ 48 px), the counter and « حسابك » side by side above the cab; the punch with its tickets at the strip's right end; the
free panel as a compact row under the strip. 768×1024: the line on two rows if four stations. Full screen: the line uses the height.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من الجمع والطرح والضرب بأعداد عشرية في وضعية قبل أن أربطها في سلسلة »:

| # | Statement | Key | Item / prior |
|---|---|---|---|
| 1 | rewritten `prep` 4: « $46{,}3 + 128{,}4 + 53{,}7 = 228{,}4$ ويمكن حسابه ذهنيًا » | ✓ (46,3 + 53,7 = 100) | 1am.m1.r05 |
| 2 | rewritten `prep` 5: « $512{,}6 - 307{,}48 = 205{,}12$ » | ✓ | 1am.m1.r05 |
| 3 | rewritten `prep` 6: « A ——6,5 cm—— B ——12 cm—— C : طول AC هو $12 - 6{,}5$ » | ✗ (12 + 6,5 = 18,5) | 1am.m1.r05 (translation) |
| 4 | rewritten `prep` 3: « $18 + 35 + 12 = 18 + 12 + 35$ » | ✓ | 1am.m1.r05 |
| 5 | « ثمن 4 كراريس، الواحد بـ 37,5 DA ، هو $4 \times 37{,}5 = 150$ DA » | ✓ | multiplication (`darb-adad-ashriya`, prior) |
| 6 | « في حافلة 25 راكبًا ونزل 7: بقي $25 + 7 = 32$ » | ✗ (18) | `mana-jam-tarh` P1 |
| 7 | curiosity: « $20 - 6 + 4 = 10$ » | ✗ (18) | 2am.m1.r01 (the new case) |

(`prep` 7 « AC = 14,5 − 9 » is cited by item 3's `cites`.) Advice text names « معنى الجمع والطرح (السنة الأولى) ».

**M1 نشاط — « خطّ الترامواي »** — `objectives`: « أكتشف لماذا نتّفق على ترتيب واحد لحساب سلسلة عمليات دون أقواس ». Lab on top (both
levels); the steps hold the TRACE of the checkpoints and the bricks:
1. evidence « في t1 رفض العدّاد خطّتك (13) » → trace of the t1 checkpoint → brick `yasar-yamin-jam` (« نحسب من اليسار نحو اليمين »,
   after « أتوقّع القاعدة »);
2. trace t2 (order free with « صعد » only) — no brick (the contrast);
3. trace t3 → brick `yasar-yamin-darb`;
4. trace t4 → brick `awlawiya` (« الضرب والقسمة قبل الجمع والطرح »).
The تحدّ idea is cited here (`duplicatedIn`).

**M2 معارف** — `objectives`: « أسمّي قواعد حساب سلسلة عمليات دون أقواس ».
- Opens on the lab ALONE (`levels={false}`, world `mixed`, one task: 50 seated; 4 groups of 6 get off; 30 pupils waiting are shared
  equally among the 5 cars and our car takes its share: 50 − 4 × 6 + 30 ÷ 5) → **32**.
- Questions: « أيّ العمليات حسبتَ أوّلًا؟ » → 4 × 6 و 30 ÷ 5 · « ثم؟ » → من اليسار: 50 − 24 = 26 ثم 26 + 6 = 32.
- Boxes: « تذكّر — السنة الأولى » (operations on decimals; link `getLessonPath('mana-jam-tarh')`); the three rules (platform words);
  examples $42 + 15 - 9 = 48$ · $56 \div 7 \times 3 = 24$ · $18 + 6 \times 5 - 40 \div 8 = 18 + 30 - 5 = 43$; a remark « هذا اتّفاق: الآلة
  الحاسبة العلمية تتّبعه ».

**M3 طريقة** (`addition('knowledge_formalization')` — the book's p. 11 is L2's) — `objectives`: « أنجز سلسلة عمليات مرحلة مرحلة وأترجم
وضعية بسلسلة »:
1. $D = 4{,}5 + 2 \times 8 - 27 \div 9$: underline 2 × 8 and 27 ÷ 9 → $4{,}5 + 16 - 3$ → **17,5**. Q « ما العمليتان اللتان تُجريان أوّلًا؟ »
2. $E = 100 - 36 \div 4 \times 3$: ÷ then × from the left → $100 - 27$ → **73**.
3. « اشترى سمير 3 كراريس بـ 45 DA للكرّاس وقلمًا بـ 25 DA ، ودفع 200 DA »: the chain $200 - 3 \times 45 - 25$ → **40 DA**.

Method box: « 1) أحدّد عمليات الضرب والقسمة وأحسبها من اليسار نحو اليمين؛ 2) أحسب ما بقي من جمع وطرح من اليسار نحو اليمين؛ 3) أكتب كلّ
مرحلة في سطر ».

**M4 أتمرّن** — `objectives`: « أتدرّب على الترتيب والأولوية وعلى الترجمة »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | « $31 - 9 + 4$ : وجد تلميذ 18 ووجد آخر 26. من على صواب؟ كيف حصل الآخر على عدده؟ » | 26 ; 31 − (9 + 4) | `act-1` |
| 2 | تحقّق: $24 + 15 - 7 = 32$ ؛ $60 - 25 - 15 = 20$ ؛ $36 \div 4 \times 3 = 27$ ؛ $8 \times 5 \div 4 = 10$ | all true | `act-1`, `act-2` |
| 3 | احسب: $35 - 12 + 5$ ؛ $35 - 12 - 5$ ؛ $90 \div 3 \times 2$ ؛ $12 \times 5 \div 6 \div 2$ | 28 · 18 · 60 · 5 | `ex-1`…`ex-3` |
| 4 | احسب بعد أن تحيط العملية الأولى: $9 + 4 \times 7$ ؛ $50 - 6 \times 8$ ؛ $45 \div 9 + 6$ ؛ $0{,}5 \times 12 - 4 \times 0{,}25$ | 37 · 2 · 11 · 5 | `ex-4`, `ex-6` |
| 5 | ورقة زميل: $6 + 2 \times 9 = 8 \times 9 = 72$ ؛ $20 - 5 + 3 = 20 - 8 = 12$ ؛ $4 + 3 \times 2 + 5 = 7 \times 7 = 49$ — صحّح | 24 · 18 · 15 | `ex-5` |
| 6 | أتمم: $6 \ldots 12 \ldots 3 = 10$ ؛ $5 + 3 \times \ldots = 26$ ؛ $40 - 4 \times \ldots = 12$ | 6 + 12 ÷ 3 · 7 · 7 | `ex-7`, `deep-39` |
| 7 | زاوية $\widehat{xOz}$ قيسها 95° ، وفيها $\widehat{xOy} = 38°$ و $\widehat{tOz} = 21°$ متجاورتان مع $\widehat{yOt}$: اكتب سلسلة تعطي $\widehat{yOt}$ ثم احسبها | 95 − 38 − 21 = 36° | `self-6` |

**M5 مسألة 1 (`lessonProblem`)** — « درّاجة عمّي مراد » (`act-2` q2 redesigned):
- « اشترى العمّ مراد درّاجة بـ 18 500 DA . دفع 4 أقساط في كلّ قسط 3 200 DA ، ثم دفع ابنه 1 500 DA . »
- 1) « اكتب سلسلة عمليات تعطي ما بقي عليه أن يدفعه » → $18\,500 - 4 \times 3\,200 - 1\,500$; 2) احسبها → **4 200 DA**; 3) « حسب زميلك
  $18\,500 - 4$ أوّلًا: ما الخطأ؟ » (choice) → الضرب أوّلًا.

**M6 مسألة 2** — « صندوق مكتبة القسم » (`act-1` q3 register):
- « في صندوق القسم 2 400 DA . اشترى الأستاذ 6 قصص بـ 250 DA للقصّة، ثم تبرّع وليّ تلميذ بـ 800 DA . »
- 1) the chain $2\,400 - 6 \times 250 + 800$; 2) → **1 700 DA**; 3) « هل يكفي المال لشراء قاموس بـ 1 850 DA ؟ » → لا (ينقص 150 DA).

**M7 مسألة 3** — « خرجة نادي البيئة » (decimals):
- « مشى أعضاء النادي $2{,}5$ km ، ثم قطعوا بالدرّاجات 3 مراحل طول كلّ منها $4{,}2$ km ، ثم تقاسمت 4 أفواج مسارًا جبليًا طوله 12 km بالتساوي. »
- 1) the distance covered by ONE group, as a chain: $2{,}5 + 3 \times 4{,}2 + 12 \div 4$; 2) → **18,1 km**; 3) « هل قطع الفوج أكثر من 18 km ؟ » → نعم.

**M8 إختبار أولي** (literal in `Module08Itqan.jsx`, data in `FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | $28 - 10 + 6$ | $24$ | $12$ (MISC-SILSILA-ADDFIRST) · $44$ · $22$ |
| 2 | $7 + 5 \times 4$ | $27$ | $48$ (MISC-SILSILA-NOPRIORITY) · $35$ · $20$ |
| 3 | $72 \div 6 \times 2$ | $24$ | $6$ (MISC-SILSILA-MULFIRST) · $144$ · $12$ |
| 4 | $3{,}5 + 2 \times 1{,}5 - 6 \div 3$ | $4{,}5$ | $6{,}25$ (NOPRIORITY: (3,5 + 2) × 1,5 − 2) · $6{,}5$ · $2{,}5$ |
| 5 | « اشترت ليلى 5 أقلام بـ 35 DA للقلم وكرّاسًا بـ 60 DA ودفعت 500 DA . أيّ سلسلة تعطي الباقي؟ » | $500 - 5 \times 35 - 60$ (= 265) | $500 - 5 \times 35 + 60$ (MISC-SILSILA-STORYSIGN) · $500 - 5 + 35 - 60$ · $5 \times 35 + 60 - 500$ (MISC-SILSILA-STORYORDER) |

## 8. Misconceptions (`MISC-SILSILA-*`, prefix free)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `ADDFIRST` | in a + − chain, add before subtracting (26 − 9 + 4 = 13) | t1 « نزل 13؟ » | test 1; L1, L3 |
| `MULFIRST` | in a × ÷ chain, multiply before dividing | t3 « 4 تذاكر بـ 6,25 DA ؟ » | test 3; L1 |
| `NOPRIORITY` | compute strictly left to right across × and + | t4 ghost groups | tests 2, 4; L1–L3 |
| `RIGHTLEFT` | compute from the right (Arabic reading direction) | replay played backwards | L2 |
| `PARTIAL` | compute the product and forget the rest of the chain (15 + 3 × 4 = 12) | — | L1 |
| `STORYSIGN` | a story's « دفع / صرف » written with + | متقدم build refused | test 5; L3, L5 |
| `STORYORDER` | the story's numbers written out of reading order | متقدم build refused | test 5; L5 |

## 9. Practice bank (`content/practice/2am/silsila-bidun-aqwas/`, 5 levels × 10)

**Corpus read for this plan** (term 1 unless noted; badge « على منوال اختبار الفصل الأول »): `2am-s1-87` ex 1 A (2 × 3 + 35 ÷ 5 − 7 = 6),
`2am-s1-91` ex 1 K (20 × 5 + 11 − 75 ÷ 3 = 86), `2am-s1-77` ex 1 E (7 × 13 + 6 − 22 ÷ 0,5 = 53), `2am-s1-81` ex 1 A (5 × 8 + 4 ÷ 2 − 10 = 32),
`2am-s1-84` ex 1 ① (18 + 2 × 0,4 − 15 ÷ 5 = 15,8), `2am-s1-88` ex 1 I, J (18 × 2 ÷ 3 − 5 = 7; 14 + 4 × 3 − 6 = 20), `2am-s1-79` ex 2 ② (two
calculators, « 4 + 3 × 8 »: which result is right — the paper inverts the calculators, keep the question with the TRUE values 28 / 56).
Doubtful: `2am-s1-78` ex 1 A (negative — not used). Not read: `2am-s1-66`, `-73`, `-83` ex 1 (index tags r01; read before claiming).

**Honest count of FAITHFUL `term_exam`: 7–8** (one per read exercise; each keeps the structure, changes the numbers). Most exercise 1s mix
this lesson with brackets (L2): their bracket parts become `counted: false` (L2 is NOT published before L1 — they are simply omitted).

| Level | Content | Provenance |
|---|---|---|
| L1 | two or three chains: + − only, × ÷ only, one priority | 3 term_exam (`2am-s1-88` ex 1, `2am-s1-87` ex 1, `2am-s1-91` ex 1) · 4 modelled · 3 adapted (`ex-1`, `ex-2`, `ex-3`) |
| L2 | compute then « برّر » (which operation first; is a classmate right) | 2 term_exam (`2am-s1-79` ex 2 ②, `2am-s1-81` ex 1) · 5 modelled · 3 adapted (`ex-5`, `self-1`, `ex-7`) |
| L3 | full exercise: four chains with decimals + a missing number | 2 term_exam (`2am-s1-77` ex 1 E, `2am-s1-84` ex 1 ①) · 6 modelled · 2 adapted (`deep-39`, `ex-4`) |
| L4 | mobilises 1AM (`mana-jam-tarh`: choose the operation, tape) — a story with a tape, then the chain; earlier-year steps `counted: false` | 0–1 term_exam · 8 modelled · 1 adapted (`self-6`) |
| L5 | « الوضعية الإدماجية »: a budget / a trip in several stages → one chain without brackets, a justified decision (enough money? who covers more?) | 0 term_exam (no read integration fits without brackets) · 9 modelled · 1 adapted (`act-2` q2) |

**Answer types:** `decimal` (exact), `choice`, `selfCheck` for « برّر ». **Oracle:** `scripts/practice-oracle/silsila-bidun-aqwas.mjs`
(its OWN BigInt-rational evaluator with priorities — not `chainOps`; checks every intermediate ≥ 0 and every distractor's named error
reproduces its value). **No bracket appears in any statement of this bank.**

## 10. Risks & owner questions

1. **Convention vs meaning** (README question 9): the tram makes left-to-right meaningful because stories are written in time order; the
   معارف remark says it is an agreement. A bare chain is never « justified » by the tram.
2. **Seeding load**: entry 1 seeds `_unit/`, writes the 100+-element extraction and `chainOps.js`; delegate the extraction and the bank to
   two helpers with a brief (`docs/sources/2am/unit1/brief-authors.md`).
3. **The تحدّ rewrite** (README question 5) and the catalogue `method` page (README question 4).
4. **Screen at 1024×768**: four stations + strip + counter must fit; the free panel stays one row (test at the four sizes).
5. Few faithful exam items for L4–L5 (honest count above).

## 11. Generator checklist

- [ ] Seed `_unit/` (copy `kusur-amaliyat/_unit`, labels of 2AM, `UNIT_ID 'amaliyat-tabiiya-ushriya'`); `prepDiagnostic.test.js` red until
  the publish flip (expected).
- [ ] `build-extraction.py` → `extraction.json` (whole unit, README table, boundary header, `DISCREPANCIES` 1–9, this lesson's elements
  `verified: True` with exact asserts; the rest `False`); `check:textbook` shows the other lessons' elements « pending ».
- [ ] `chainOps.js` (L1 row) + `chainOps.test.js` (cross-check with `relativeOps.evaluate`).
- [ ] Lab `tram-route`: type in `manipulationTypes.js`, theme `tramline` in `VISUAL_THEMES`, registry, `levels.js` (`t1`–`t4`, `a1`–`a3`,
  same `objective`), strings `lesson.manipulation.json › tramRoute` (+ `cp.*`), `logic/tramRoute.js` + test (every task via `coachOf`,
  every wrong plan's absurdity, commutative plans accepted, free-panel refusal below 0), render test (L8: every task, 2 hints, one right
  answer, no raw key, « opens on its CONTEXT then ONE question », guided mode), LabCoach, LabCheckpoint, stepper, celebration, sound,
  « إعادة », full screen; contract section in `MANIPULATION_CONTRACT.md` + DNA §15 row; screenshots (initial, a refused plan with its
  absurdity, a commutative plan accepted, t4 success, متقدم build + predict, free panel) at 768×1024, 1024×768, 1280×800, 1366×768 —
  reviewed and iterated. `node apps/web/scripts/lab-rollout-status.mjs --lesson silsila-bidun-aqwas` ✅.
- [ ] Lesson: 9 modules with `objectives`; `lesson.config.js` header (entry, rejected (a)–(c), order, LP changes); « أستعدّ » measures
  `1am.m1.r05`; « تذكّر — السنة الأولى » with the link; memo cards (`KnowledgeSnapshot variant="memo"`, `memo` on every knowledge item);
  `content.test.js` (independent BigInt arithmetic); no student string points to the book.
- [ ] `units_2am_2026_2027.json › challenge` rewritten + `sourceElementId`.
- [ ] `pointsToLearn` final, `pointPrerequisites` (§ 2), `durationMinutes` (≤ 90), `difficulty`, `icon`; `generate:lesson-index`,
  `generate:learning-net`.
- [ ] Bank (50) + oracle + `active.json` / `exam-style.json` / `misconceptions.json`.
- [ ] Gates: `npm test`, `validate:lessons`, `check:textbook`, `check:lessons` (entry budget unchanged), `build`; e2e
  `apps/web/e2e/lesson-kit/2am-amaliyat-tabiiya-ushriya.mjs` (+ coach / retrofit blocks); `node apps/web/e2e/lesson-route-boundary.mjs`.
- [ ] Publish (guide §11, coordinator): `available`, export/import, local DB publish (lesson, 9 modules, 50 exercises — nothing `draft`),
  commit `feat(lessons): silsila-bidun-aqwas`, push `dev`.
- [ ] Successor edges (§ 12) after publishing.

## 12. Successor connection

| Successor | Its LP (catalogue `lessons_3am_2026_2027.json`) | Edge to add | Along |
|---|---|---|---|
| `quwat-adad-nisbi` (3AM, published) | P4 « إجراء حساب يتضمن قوى باحترام أولوية القوى على باقي العمليات والتمييز بين $-a^n$ و $(-a)^n$ » | `pointPrerequisites.P4` += **`2am_silsila-bidun-aqwas_P2`** | `2am.m1.r01 → 3am.m3.r08` (requires) |
| `mutawassit-mutawazin` (3AM, planned) | (drafted) P2 « حساب المتوسط المتوازن بمجموع جداءات القيم في تكراراتها مقسوما على التكرار الكلي » | its OWN generator writes P2 ← `2am_silsila-bidun-aqwas_P2` | `2am.m1.r01 → 3am.m7.r11` |
| `qismat-nisbiyayn` P4, `amaliyat-natiqa` P4 (published) | chains on relative / rational numbers | **only if** the owner adds `2am.m1.r01 → 3am.m1.r02` (3AM unit-1 question 1): P4 ← `2am_silsila-bidun-aqwas_P2` | — |

**Links in the published successor's content:**
- `quwat-adad-nisbi › content/textbook.js › PREP_PLATFORM_ITEMS` (skill `silsila`: « $2 + 3 \times 4 = 20$ », « $18 - 6 \div 2 = 15$ ») already
  measure this lesson's P2; nothing to change — the « راجع قبل أن تنطلق » card becomes a LINK by itself once this lesson is `available`.
- `quwat-adad-nisbi › modules/Module03Tariqa.jsx` step 2 « بأيّ ترتيب نحسب؟ »: add a « تذكّر — السنة الثانية » `TextbookBox kind="remark"`
  (`addition('prior_year_reminder')`, link `getLessonPath('silsila-bidun-aqwas')`) before the brick `awlawiya-quwa`: « الضرب والقسمة قبل
  الجمع والطرح، ومن اليسار نحو اليمين ».
- Stale comment: `quwat-adad-nisbi/modules/Module00Astaidd.jsx` and `content/textbook.js` call the 2AM lesson `silsila-amaliyat` — rename to
  `silsila-bidun-aqwas` in the comments.

## Generator notes

Generated 2026-10-28 (Sonnet lead). Deviations and fixes, none of them touching the entry point, the lab, the modules, the numbers or the bank sources:

1. **`decimal` answer type does not exist** (§9): exact decimals are `rational` answers with a point-decimal key (as in the `mana-jam-tarh` bank).
2. **`textbookRef.pages.method`** of the catalogue entry set to `null` (README question 4); the تحدّ of the unit rewritten to « احسب: 40 - 12 + 6 . وجدت سلمى 34 ووجد أنس 22 … » with `challenge.sourceElementId: "challenge"` (both applied).
3. **« أستعدّ » item 3** is built on the figure of `prep` 6 only (the extraction found `prep` 7's options « 14,5 ± 9 » inconsistent with its 14 cm figure; `prep` 7 is cited, not used).
4. **Questions over the lab also exist in متقدم** (the plan listed t1–t4 only; `a1`–`a3` carry `groupsTotal` / `firstOp` / `carShare`, a3 has no rule question because `60 ÷ 7` would show a non-decimal quotient).
5. **Gesture of the build step**: plates and chips are TAPPED into the strip (first free slot of their parity), not dragged — same judging by value, keyboard-operable.
6. **Absurd station**: for `overflow` the tram stops at the quay where the swallowed term (the 9) goes down, not at the quay of the merged number.
7. **`LabCoach` `stampMore`** has a short sentence (« ضع التذكرة التالية على عملية أخرى. ») instead of no text.
8. **`durationMinutes`** of the catalogue is 66 (modules without the مسائل, the validator's rule) and `estimatedDurationMin` of the config 90.
9. **Bank** (helper, §9): `L4` sheets 1–3 carry the textbook-style tape (`ArcTape`, arcs not brackets); L4 has 0 `term_exam`; the paper `2am-s1-79` ex 2 inverts its calculators — the sheet keeps the TRUE values (33 / 63 for its numbers). Counts: 7 `term_exam` · 33 `term_exam_modelled` · 10 `adapted` · 0 `platform_addition`.
10. **Successor edges (§12) NOT applied by the generator** (instruction: published 3AM lessons and the net are edited by the coordinator): `quwat-adad-nisbi` P4 ← `2am_silsila-bidun-aqwas_P2`, plus the « تذكّر — السنة الثانية » box in its `Module03Tariqa.jsx` and the stale `silsila-amaliyat` comments.
