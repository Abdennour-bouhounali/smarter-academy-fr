# Plan — `majmu-jabri` « حساب مجموع جبري » (2AM unit 3, entry 3 of 6 — pair 3, lane A)

Read the unit [`README.md`](README.md) first. `jam-tarh-nisbiya` (entry 2) is published before this lesson; `talim-nuqta-mustawi` is
generated at the same time in lane B (no shared file except the catalogue, `relative.js` and the registries: small targeted edits after a
fresh read).

## 1. Identity

- **Code** `majmu-jabri` · **title** « حساب مجموع جبري » · unit `adad-nisbiya-2` · catalogue order 16 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/majmu-jabri/`.
- **Textbook pages** (PDF = book − 3): `act-6` p. 41 (PDF 38, right edge cut); `know-2d`, `know-2e` p. 44 (PDF 41); `method-5` p. 45
  (PDF 42); `ex-36`, `ex-37` p. 48 + `ex-29` (moved here); `self-10`, `self-11` p. 49; `deep-39`, `deep-43`, `deep-44`, `deep-46`, `deep-47`,
  `deep-59` pp. 50–51 + `deep-49`, `deep-50`, `deep-58` (moved here). Catalogue `textbookRef` (activity 41, knowledge 44, method 45) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🪢.

## 2. Programme & net

**Item:** `2am.m4.r06` « حساب مجموع جبري ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | تحويل عمليات الطرح في مجموع جبري إلى جمع للأعداد المعاكسة | تحويل كلّ طرح في مجموع جبري إلى جمع للعدد المعاكس، مثل $(-9)-(+2)+(-5)-(-4)=(-9)+(-2)+(-5)+(+4)$ | Example added. |
| P2 | حساب مجموع جبري بتجميع الحدود الموجبة فيما بينها والحدود السالبة فيما بينها | حساب مجموع جبري بتجميع الحدود الموجبة فيما بينها والحدود السالبة فيما بينها (يمكن نقل الحدود وحذف المتعاكسين)، وبحساب ما بين الأقواس أوّلًا عند وجودها، مثل $(+12)-[(-6)-(-2)+(+9)]=(+7)$ | **Adds the brackets computed first** — the net's second inbound link `2am.m1.r02 → 2am.m4.r06` (« استعمال الأقواس ») and every term-2 paper (`2am-s2-63` B, `-50` C, `-62` D, `1am-s2-79` P R). |
| P3 | تبسيط كتابة مجموع جبري بحذف إشارة الجمع والأقواس، مثل $(+5) - (+6) = 5 - 6$ | تبسيط كتابة مجموع جبري بحذف إشارة الجمع وأقواس الأعداد، مثل $(+5)-(+6)+(-8)=5-6-8$ ، وحساب مجموع مكتوب في شكله المبسّط مثل $-15+4+8+3$ | Adds the converse use (book `self-10`, papers `2am-s2-73` B, `1am-s2-79` R). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `2am.m4.r05` | جمع وطرح عددين نسبيين | `jam-tarh-nisbiya` | published (entry 2) → link | items 1, 2, 3 |
| `2am.m1.r02` | استعمال الأقواس | `silsila-bi-aqwas` | published → link | items 4, 5 |

**noRebuild:** none (no `extends` / `consolidates`).

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P1;
- along `2am.m4.r05 → 2am.m4.r06` (requires): **P1 ← `2am_jam-tarh-nisbiya_P3`** (subtract = add the opposite), **P2 ←
  `2am_jam-tarh-nisbiya_P1`, `2am_jam-tarh-nisbiya_P2`** (the two addition rules);
- along `2am.m1.r02 → 2am.m4.r06` (requires; published, final): **P2 ← `2am_silsila-bi-aqwas_P1`** (inside the brackets first) and
  **`2am_silsila-bi-aqwas_P2`** (inner level first, [ ] outside).

**Where it is used next:** the synthesis; unit 4 `ikhtibar-musawat-mutabayina` (r06 → 2am.m4.r09, other planner) — §12; 3AM
`tabsit-hadhf-aqwas` and `jidaa-ida-nisbiya` meet algebraic sums but have no net link from r06.

## 3. Boundary

**Owns:** see README. **Leaves:** two-term sums and differences (`jam-tarh-nisbiya`: recalled in M2 « تذكّر » WITH a link); removing a
bracket preceded by « − » by changing every inner sign (3AM `tabsit-hadhf-aqwas` P1: here the bracket is computed FIRST, then subtracted);
letters (3AM); the book's `deep-47` « ماذا تستنتج؟ » (a − (b − c) = a − b + c is that 3AM rule): only its two numeric columns are compared.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-6` | complete A = (−9) − (+2) + (−5) − (…) as a sum; compute two chains | every subtraction becomes an addition | **Not the entry** (the transformation is given as a blank to fill). M4 item 1 (own numbers) |
| `know-2d` | definition, example S = −12, « نقل وتجميع الحدود » | grouping | M2 (own words, own example) |
| `know-2e` | convention: drop + and brackets of positives | simplified writing | M2 box after the lab's scoreboard |
| `method-5` | S = (+5,2) + (−6) − (+9) + (+6,3) − (−5,2) − (−11) | a long decimal chain, opposites first | M1 a1 (own numbers), M3 step 1 |
| `ex-29` (moved) | sums of 4–6 terms | grouping | M4 item 2 |
| `ex-36` | three algebraic sums | P1 + P2 | M4 item 3 |
| `ex-37` | a pupil cancels « (+5) + (−5) » wrongly | − (+5) is (−5) | M4 item 4 (own) |
| `deep-39` | simplify then compute | P3 | M4 item 5 |
| `deep-43` | fill the signs | reasoning | M4 item 6 (own) |
| `deep-44` | 100 − 99 + … + 2 − 1 | pairs | M4 item 7 (own: 50 − 49 + … + 2 − 1 = 25) |
| `deep-46` | largest result with four given numbers | the sign of each term | M4 item 8 (own numbers) |
| `deep-58` (moved) | magic square −4 … 4, sums 0 | sums of three | M4 item 9 |
| `deep-49`, `deep-50`, `deep-59` (moved / kept) | magic square error; paths; 1 + 23 − 4 + … = 100 | sums of many terms | bank L3–L4 (adapted) |
| `deep-47` | a − b, (a − b) + c, b − c, a − (b − c) | compare two computations | bank L3 (numbers only, no rule) |
| `self-10`, `self-11` | QCM (stems to re-read: README discrepancies 1–2) | — | test register + bank, only after re-reading |

## 5. Design

**The lesson in one paragraph.** Sports day at school: a tug of war. Each child wears a bib with a relative number: a « + » child pulls
toward the right flag with that strength, a « − » child toward the left. The algebraic sum on the board is the queue of children walking
in, in the written order — and some of them carry a « − » sign BEFORE their bib (« ينسحب لصالح الفريق الآخر »): that child turns
round and pulls for the other side, his bib now showing the opposite number. The student turns the « − » children, then sends every
child to the left or right team. The whistle blows: the ribbon on the rope moves toward the stronger team by the difference of the team
totals. Whatever order the children join the rope, the ribbon stops at the same mark; two children with opposite bibs cancel and can
leave together. The scoreboard writes the chain as the student turns the children, in the simplified form $-9-2-5+4$.

**Entry point — candidates compared:**
- (a) **The book's act-6** (fill the blanks of a transformation): the transformation is given; the student copies a pattern. Rejected → M4.
- (b) **An elevator or a thermometer through several changes**: models a sum computed LEFT TO RIGHT; grouping and moving terms has no
  physical meaning (time order), and these worlds are taken (`zero-probe`, entry 2's M5–M6).
- (c) **Merging neighbouring tiles** (`merge-board`, 3AM): the order of merges matters there; here ANY grouping is allowed.
- (d) **Two teams on a rope**: grouping positives and negatives is literally « forming the teams », the subtraction sign is a child who
  turns round, opposites cancel, the order of arrival does not matter. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'tugfield' }`.

**Order of ideas:** a chain of additions (sort the children: positives right, negatives left, compare the totals) → a chain with
subtractions (turn the « − » children first) → opposites leave together → any order gives the same mark → a long decimal chain, brackets
(a sub-team settles first) → the simplified writing → معارف → طريقة → practice, مسائل, test.

**Contexts (values):** sports day (fair play, both girls and boys pull), a diver's dives (curiosity), Sétif's winter day (attention to
weather), a quiz between classes (honest scoring).

## 6. Lab — `tug-rope` « شدّ الحبل » (new type)

**Drawn world `tugfield`** (new theme, kind `sorting`, label « ساحة يوم الرياضة: حبل وفريقان وشريط في الوسط »):
- the school's sports ground: a long rope across the scene, a red ribbon tied at its middle above a mark « 0 » on a graduated ground strip
  (−20 … +20 in steps of 1; ±0,5 drawn at متقدم), a green flag on the right (« + ») and an orange flag on the left (« − »);
- the queue: up to six KidFigures in the written order at the top (girls in hijab + long tunic, boys in hoodies), each with a bib
  « −9 », « +4 » … and, for a subtracted term, a « − » card held before the bib;
- the two team areas on the rope; each team's total on a small board above it; the scoreboard over the field writes the chain as
  the student acts (first with brackets, then simplified);
- a bracket group arrives as a mini-team on a mat (« فريق صغير »): it settles first, its result child joins the queue.

**The variable in the hand: the TEAM of every term** (a sign flip for each « − » card, then left / right for each child). The ribbon's
displacement (= the sum) is the output.

**Gestures (three paths):** tap a « − » child to turn him round (his bib flips: −(+2) → −2; −(−4) → +4); drag a child to the left or right
team; buttons « يمين » / « يسار » under the selected child; keyboard (Tab between children, T turn, ←/→ send). « صفّارة » (Enter) runs the
pull.

**The judge:** before the whistle, a child is accepted on a side only if its CURRENT bib's sign matches the side (an unturned « − »
child dropped by his printed bib is accepted physically — the error is shown at the whistle: the ribbon goes the wrong way with a ghost
ribbon at the true mark). At متقدم the student types the predicted mark before the whistle.

**Opening (no title):**
- Context: « في يوم الرياضة يتجاذب فريقان الحبل: كلّ طفل يجرّ بقدر العدد على صدريته، الموجب نحو العلم الأخضر والسالب نحو العلم البرتقالي. »
- Question (t1): « وزّع الأطفال $(+7)+(-3)+(+5)+(-6)$ على الفريقين، ثم أطلق الصفّارة واكتب أين يتوقّف الشريط. »
- `lead`: « الطفل الذي يحمل إشارة − قبل صدريته يستدير ويجرّ مع الفريق الآخر. »

**Levels** (same `objective` on both):

*مبتدئ*:

| id | Chain | Turns | Teams (right / left) | End state |
|---|---|---|---|---|
| `t1` | $(+7)+(-3)+(+5)+(-6)$ | — | 12 / 9 | **+3** |
| `t2` | $(-8)-(+3)+(-6)-(-5)$ | two: $-(+3)\to-3$ , $-(-5)\to+5$ | 5 / 17 | **−12** |
| `t3` | $(+5)+(-7)+(-5)+(+7)+(-3)$ | — | two opposite pairs leave | **−3** |

*متقدم* (PREDICT: type the mark before the whistle; decimals and brackets):

| id | Chain | End state |
|---|---|---|
| `a1` | $(+4{,}5)+(-7)-(+8)+(+3{,}5)-(-4{,}5)-(-10)$ | right 22,5 / left 15 → **+7,5** |
| `a2` | $(+12)-[(-6)-(-2)+(+9)]$ | the mini-team: $-6+2+9=+5$ ; then $(+12)-(+5)$ → **+7** |
| `a3` | simplified: $-15+4+8+3$ | right 15 / left 15 → **0** |

**« جرّب أعدادك » (always open):** a chain of 2–6 terms typed in either form (brackets or simplified), |term| ≤ 20, ≤ 2 decimals; the
lab builds the queue; never counted.

**LabCoach** (`sa.labCoach.tug-rope.off`): 1 `turn` « المس الطفل الذي يحمل − ليستدير » (only when the chain has one) · 2 `send` « اسحب
الطفل إلى فريقه » · 3 `whistle` « أطلق الصفّارة » · 4 `predict` (متقدم) « اكتب أين سيتوقّف الشريط » · 5 `group` (a2) « الفريق الصغير يتجاذب أوّلًا » ·
6 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- t1: « كم يجرّ الفريق الأيمن؟ والأيسر؟ » (12, 9) → « لماذا توقّف الشريط عند +3؟ » (12 − 9, right stronger);
- t2: « صدرية الطفل −(+3) صارت؟ » (−3) → « و −(−5)؟ » (+5) → « اكتب السلسلة جمعًا فقط » (−8 − 3 − 6 + 5);
- t3: « من خرج من الحبل دون أن يتغيّر شيء؟ » (+5 and −5, +7 and −7);
- a1: « هل يتغيّر الموضع إذا انضمّ الأطفال بترتيب آخر؟ » (no);
- a2: « لماذا تجاذب الفريق الصغير أوّلًا؟ » (the bracket);
- a3 (ends on the RULE): « نجمع الحدود الموجبة معًا والسالبة معًا، ثم نطبّق قاعدة جمع عددين ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` on turn / send, `bell` on the whistle, `flag` / `over`), full screen,
`guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:**
- `noTurn` (t2: the −(−5) child sent left by his printed bib): the ribbon stops at −22 with a ghost ribbon at −12 and the child's
  printed bib blinking;
- `turnAll` (turns an added term): the chain on the scoreboard shows the changed sign in red;
- `bracketDrop` (a2: the mini-team's children sent one by one with their own signs): ghost at +12 − 6 + 2 + 9 = +17;
- `signLast` (types the sign of the last child): ghost on the other side.

**Formal phase:** with the student's chain: $(-8)-(+3)+(-6)-(-5)=(-8)+(-3)+(-6)+(+5)=(-17)+(+5)=(-12)$ ; simplified $-8-3-6+5=-12$.

**Core maths:** `relative.js` E3 row (`terms`, `asSum`, `groupBySign`, `algebraicSum`, `simplifiedText`). Lab logic `logic/tugRope.js`:
`tasksOf`, `queueOf(chain)`, `turn(state, i)`, `send(state, i, side)`, `teams(state)`, `whistle(state)` → `{ mark, truth, ghost }`,
`judge(task, state, typed?)`, `coachOf`; events `{ kind: 'turn', task, i }`, `{ kind: 'send', task, i, side, ok }`,
`{ kind: 'whistle', task, mark, ok, model }`, `{ kind: 'predict', task, value, ok }`, `{ kind: 'solved', task }`,
`{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `merge-board` (3AM): two NEIGHBOURING tiles fuse, the order of fusions is the variable; here any child may join any time, and the
  variable is the side.
- `term-ferry` (4AM): a term crosses an equals sign and may change sign; here there is no equation, the « − » is the operation's sign.
- `tram-route` / `chain-cutter` (2AM m1): the ORDER of operations / the last operation; here the order is free (the point of the lesson).
- `balloon-ballast` (entry 2): a load of identical unit objects for TWO numbers; here whole numbers are people of different strengths and
  the gesture is sorting.
- `stat-balance`, `group-tanks`: balances of data / volumes; no signed terms.

**Screen budget:** 1024×768, lab column ≈ 414 px: the queue strip 414 × 110 px (six KidFigures at 64 px), the field with the rope and the
ground strip 414 × 220 px, the scoreboard + answer pill in one row. At ≥ 1280 px the queue and the field sit side by side.

**DOM:** `[data-tug-rope][data-level][data-task][data-mark][data-solved]`, `[data-tr-child=<i>][data-bib][data-turned][data-side]`,
`[data-tr-team=left|right][data-total]`, `[data-tr-ribbon][data-value]`, `[data-tr-ghost][data-model]`, `[data-tr-scoreboard]`,
`[data-tr-whistle]`, `[data-tr-answer]`, `[data-tr-free]`, `[data-tr-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من جمع وطرح عددين نسبيين ومن الأقواس »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | $(-6)+(-9)=(-15)$ | ✓ | r05 |
| 2 | $(+4)-(-7)=(-3)$ | ✗ ($+11$) | r05 |
| 3 | $(-2{,}5)+(+2{,}5)=0$ | ✓ | r05 |
| 4 | $20-(8-3)=9$ | ✗ ($15$) | 2am.m1.r02 |
| 5 | $30-[12-(5+2)]=25$ | ✓ | 2am.m1.r02 |
| 6 | « $(-5)-(+3)$ يساوي $(-5)+(-3)$ » | ✓ | r05 |

**M1 نشاط — « شدّ الحبل »** — `objectives`: « أكتشف كيف أحسب سلسلة من الجمع والطرح لأعداد نسبية ». Lab on top; then the trace and
the bricks: `tajmi-hudud` (t1) · `tarh-ila-jam` (t2) · `hadhf-mutaakisayn` (t3) · « أتوقّع القاعدة » then `qaidat-majmu-jabri` (a3).

**M2 معارف** — `objectives`: « أسمّي المجموع الجبري وطريقة حسابه وكتابته المبسّطة ».
- Lab ALONE (`levels={false}`, $(-11)-(+6)-(-9)-(+4)$ → $(-11)+(-6)+(+9)+(-4)$ → **−12**).
- Boxes (after the answer): « تذكّر » toward `jam-tarh-nisbiya` (WITH link: the two addition rules, the subtraction rule) · definition of
  an algebraic sum (platform words) · « we may move and group terms » · the convention of the simplified writing · examples
  $(+7)-(+9)+(-4)+(-2)=7-9-4-2=-8$ ; $-6+10-4=0$.

**M3 طريقة** — `objectives`: « أحسب مجموعًا جبريًا خطوة خطوة، بأقواس أو بدونها ». Steps (own numbers):
1. $S=(+7)-(+9)+(-4)+(-2)$ → $S=(+7)+(-9)+(-4)+(-2)=(+7)+(-15)=(-8)$;
2. $T=6-11+4{,}5-2{,}5$ → positives $10{,}5$ ، negatives $13{,}5$ → $T=-3$ (Q « لماذا نجمع 6 و 4,5 معًا؟ »);
3. $U=(+18)-[(-9)-(+6)]$ → inside $(-9)+(-6)=(-15)$ → $U=(+18)-(-15)=(+33)$.
Method box: « نحسب ما بين الأقواس أوّلًا، نحوّل كلّ طرح إلى جمع المعاكس، نجمع الموجبة والسالبة كلًّا على حدة، ثم نجمع الناتجين ».

**M4 أتمرّن** — `objectives`: « أتدرّب على المجاميع الجبرية »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | أكمل ثم احسب: $(-7)-(+3)+(-4)-(-6)=(-7)+(\ldots)+(\ldots)+(\ldots)$ ؛ احسب $(-10)-(+5)-(-8)-(+2)$ و $(+7)+(-2)-(-5)+(+4)$ | $(-3)$ ، $(-4)$ ، $(+6)$ → $-8$ ; $-9$ ; $+14$ | `act-6` |
| 2 | احسب: $(-6)+(+9)+(-3)+(+6)+(-9)$ ؛ $(+8)+(-11)+(+5)+(-7)$ ؛ $(-4)+(+15)+(-6)+(+4)+(+6)+(-8)$ | $-3$ ; $-5$ ; $+7$ | `ex-29` |
| 3 | $A=(+7)+(-4)-(+8)-(-2)+(-6)$ ؛ $B=(-11)-(-8)-(-6)+(+4)-(+10)$ ؛ $C=(-3)+(-12)-(-5)-(+4)+(+13)$ | $-9$ ; $-3$ ; $-1$ | `ex-36` |
| 4 | لحساب $(+7)-(+4)+(-4)+(-10)$ كتب تلميذ: « $(+4)+(-4)=0$ إذن الناتج $(+7)+(-10)=(-3)$ ». أين الخطأ؟ صحّح | $-(+4)$ هو $(-4)$ ؛ الناتج $7-4-4-10=-11$ | `ex-37` |
| 5 | بسّط الكتابة ثم احسب: $(-5)+(+12)+(-3)+(-7)$ ؛ $(+8)+(-2)-(+8)-(-9)$ | $-5+12-3-7=-3$ ; $8-2-8+9=7$ | `deep-39` |
| 6 | ضع إشارات + أو − : $(+4)\ldots(-6)\ldots(+3)\ldots(-2)=(+5)$ | $-$ ، $-$ ، $+$ ($4+6-3-2=5$) | `deep-43` |
| 7 | احسب $50-49+48-47+\cdots+2-1$ | $25$ (25 pairs of 1) | `deep-44` |
| 8 | بالأعداد $(-6{,}4)$ ، $(-5)$ ، $(+2{,}7)$ ، $(+12)$ مرّة واحدة وبالإشارتين + و − ، اكتب عبارة نتيجتها أكبر ما يمكن | $(+12)+(+2{,}7)-(-6{,}4)-(-5)=26{,}1$ | `deep-46` |
| 9 | املأ مربّعًا سحريًا $3\times3$ بالأعداد من $-4$ إلى $4$ بحيث يكون مجموع كلّ سطر وعمود وقطر $0$ | e.g. $3,-4,1$ / $-2,0,2$ / $-1,4,-3$ | `deep-58` |

**M5 مسألة 1 (`lessonProblem`) — « غطسات الغوّاص »** — `objectives`: « أترجم سلسلة تغيّرات بمجموع جبري وأحسبه بالتجميع ».
- Statement: « غوّاص عند $-3$ m . نزل $5$ m ، ثم صعد $2$ m ، ثم نزل $7$ m ، ثم صعد $9$ m . »
- Q/A: 1) المجموع الجبري → $(-3)+(-5)+(+2)+(-7)+(+9)$ ; 2) موضعه الأخير بالتجميع → $(+11)+(-15)=(-4)$ ; 3) أعمق موضع بلغه → $-13$ m
  (after the third move: $-3-5+2-7$).

**M6 مسألة 2 — « يوم شتوي في سطيف »** — `objectives`: « أكتب مجموعًا جبريًا في شكله المبسّط وأحسبه ».
- Statement: « درجة الحرارة عند الفجر $-5$ °C ، ثم تغيّرت خلال اليوم بـ: $+3$ ، $+6$ ، $-2$ ، $+4$ ، $-8$ . »
- Q/A: 1) الكتابة المبسّطة → $-5+3+6-2+4-8$ ; 2) حرارة آخر اليوم → $-2$ °C ; 3) « هل نحصل على النتيجة نفسها إذا جمعنا التغيّرات أوّلًا؟ »
  → $+3$ ، ثم $-5+3=-2$ : نعم.

**M7 مسألة 3 — « حصيلة جولتين »** — `objectives`: « أحسب مجاميع بأقواس وأتحقّق من أنّ مجموع حصيلتين معدوم ».
- Statement: « في مسابقة ثقافية حصيلة الفريق أ: $A=(-6)+(-9)$ ، وحصيلة الفريق ج: $C=(+4)-(-18)+(-7)$ ، وحصيلة الحكَم:
  $S=(+20)-[(+12)-(-5)]+(-3)$ . »
- Q/A: 1) $A=-15$ ، $C=+15$ ; 2) « بيّن أنّ $A+C=0$ » ; 3) $S=20-17-3=0$.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | $(-8)-(-3)+(+5)$ | $0$ | $-6$ (NOTURN) · $-10$ (TURNALL) · $+6$ | P1, P2 |
| 2 | الكتابة المبسّطة لـ $(-4)-(+7)+(+2)-(-1)$ | $-4-7+2+1$ | $-4+7+2-1$ (SIMPLIFYSIGN) · $4-7+2+1$ (FIRSTSIGN) · $-4-7+2-1$ (NOTURN) | P3 |
| 3 | $(+15)-[(-6)+(+4)]$ | $+17$ | $+13$ (BRACKETDROP) · $-17$ · $+25$ | P2 |
| 4 | $-9+4-6+11$ | $0$ | $-30$ (ALLNEG) · $+30$ · $-8$ (ADDDIST) | P2, P3 |
| 5 | العبارة التي تساوي $(-7)-(-2)$ | $(-7)+(+2)$ | $(+7)+(-2)$ (FLIPBOTH) · $(-7)+(-2)$ (NOTURN) · $(-7)-(+2)$ | P1 |

## 8. Misconceptions (`MISC-JABRI-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `NOTURN` | a subtracted term keeps its printed sign | t2 ghost ribbon | tests 1, 2, 5 |
| `TURNALL` | every term changes sign | scoreboard in red | test 1 |
| `SIMPLIFYSIGN` | dropping the brackets keeps the inner sign and drops the « − » | scoreboard | test 2 |
| `FIRSTSIGN` | the first term loses its « − » in the simplified form | — | test 2 |
| `BRACKETDROP` | the bracket is ignored | a2 ghost | test 3 |
| `ALLNEG` | a chain starting with « − » is all negative | — | test 4 |
| `ADDDIST` (r05 recalled) | $-9+4=-13$ | t1 | test 4 |
| `FLIPBOTH` | both numbers change sign | — | test 5 |

## 9. Practice bank (`content/practice/2am/majmu-jabri/`, 5 × 10)

**Read by the planner** (each part to ONE sheet, README partition): `2am-s2-63` ex 1 (A = (−3,4) + (+4,5) − (−2) − (+1); B = (+17) −
[(−5) − (−3) + (+8)]; C = −9 + 4 − (−2,5 + 3)); `2am-s2-62` ex 1 C, D (C = (−2) − (−23) + (+54) − (+31) + (−24); D = [(−15) + (+25)] −
[(−30) − (+30)]; « أثبت أنّ A + C = 0 »); `2am-s2-70` ex 1 q 1 C, D (C = (−8) + [4 − (−3 + 4)]; D = (−5) + (−3) − (+2) − (−1) + (+4));
`2am-s2-50` ex 1 C, D (C = (+25) − [(−12) − (+15)]; D = (−5) + (−3) − (+2) − (−1) − (−4)); `2am-s2-72` ex 1 (E = (−7) + (+4) − (−8); G =
(+10) + (−30) + (+5) − (−15)); `2am-s2-73` ex 1 a (A = (−14) + (+5) − (−12) − (+9); B = −22 + 3 + 10 + 9); `2am-s2-53` ex 1 q 1 (A =
(−10) − (−23) + (+54) − (+31) + (−11)); misfiled `1am-s2-79` ex 2 q 1 (P = [(+200) + (−303)] + [(+46) − (−57)]; R = −9 + 11 + (−7 + 3 − 10)
− (+8 + 5)); `2am-s1-66` ex 1 F (= (−9) − (+7) + (−2) − (−5), term 1). **To read:** `2am-s2-59` ex 1, `2am-s2-71` ex 2, `2am-s2-52` ex 2,
`2am-s2-75` ex 1 q 1, `2am-s2-57` ex 1 q 1 (unindexed exercises), `2am-s3-40` ex 1, `2am-s3-44` ex 1 (term 3).

Note on `2am-s2-63` C and `1am-s2-79` R: « $-(-2{,}5+3)$ » and « $-(+8+5)$ » are computed INSIDE FIRST (P2), never by changing the inner
signs (3AM): the solution lines say so.

**Honest FAITHFUL count: 9 read today; 10–12 expected** (the item is the backbone of term 2).

| Level | Content | Provenance |
|---|---|---|
| L1 | turn a chain into a sum; simplified writing; a 3–4-term chain | 2 term_exam (`-72` ex 1, `2am-s1-66` ex 1 F) · 6 modelled · 2 adapted (`ex-29`, `deep-39`) |
| L2 | a chain then « برّر » (which terms were grouped, why the sign); « A + C = 0 » | 2 term_exam (`-62` ex 1 C D, `-73` ex 1 a) · 6 modelled · 2 adapted (`ex-37`, `deep-43`) |
| L3 | full exercise « أحسب بتمعّن موضّحًا مراحل الحساب »: three chains, decimals, brackets [ ] | 3 term_exam (`-63` ex 1, `-50` ex 1 C D, `1am-s2-79` ex 2 q 1) · 1–2 after reading · 5 modelled · 1 adapted (`deep-47` numbers only) |
| L4 | mobilises `jam-tarh-nisbiya` / `talim-mustaqim-mudarraj-2` (same term): a chain then its value placed on a line, or a two-term check; those steps `counted: false` | 2 term_exam (`-70` ex 1 C D, `-53` ex 1 q 1) · 8 modelled |
| L5 | « الوضعية الإدماجية »: a week of temperatures, a diver, a lift, a quiz; a decision (warmer than…? deepest? who wins?) | 10 modelled (`2am-s2`) |

**Oracle** `scripts/practice-oracle/majmu-jabri.mjs` (BigInt hundredths; its own tokenizer for brackets and [ ]; every key recomputed;
each distractor checked equal to its named error and false).

## 10. Risks & owner questions

1. **P2's extension** (brackets) — README Q5.
2. **A bracket preceded by « − »** must never be « opened » by a sign rule in solutions (3AM). The oracle's solution lines compute inside
   first; the content test greps the solution texts for « نغيّر إشارات ».
3. **Six KidFigures at 414 px** — 64 px each with bibs readable at 13 px; at 768×1024 the queue wraps to two rows of three.
4. **The book's `self-10`, `self-11`** are cited only after re-reading (README discrepancies 1–2).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 38, 41, 42, 45, 46, 47, 48 at 200 dpi; `verified: True`; destinations: `act-6` → 4 (README
  move); `know-2d`, `know-2e` → 2; `method-5` → 3; `ex-29` (moved), `ex-36`, `ex-37`, `deep-39`, `deep-43`, `deep-44`, `deep-46`, `deep-58`
  (moved) → 4 (cited by M4); `self-10`, `self-11` → 8; `deep-47`, `deep-49`, `deep-50`, `deep-59` → `None` (bank); add discrepancies 1–2 and
  the `deep-47` scope note.
- [ ] `relative.js` E3 functions + tests (the tokenizer on every chain of the plan and of the read papers; `algebraicSum` = left-to-right
  evaluation for 500 random chains).
- [ ] Lab `tug-rope` (type, theme `tugfield`, levels, registry, strings `tugRope`, logic + test (every task; any sending order gives the
  same mark; `noTurn` ghost), render test, LabCoach, §6ter ✅, contract section, DNA row, screenshots: t1 initial, t2 after the turns, t2
  `noTurn` ghost, t3 opposite pairs leaving, a2 mini-team — five sizes, reviewed).
- [ ] Lesson: 9 modules, header, « تذكّر » with link to `jam-tarh-nisbiya`, `content.test.js` (BigInt), memos.
- [ ] Catalogue (P1–P3 final, `pointPrerequisites` above), index, net map, e2e `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-majmu-jabri.mjs`,
  gates, bank (`MISC-JABRI-*`), publish (lesson, 9 modules, 50 exercises `published`), commit `feat(lessons): majmu-jabri`.

## 12. Successor connection

- **2AM unit 4 `ikhtibar-musawat-mutabayina`** (2am.m4.r09; net `2am.m4.r06 → 2am.m4.r09`, requires; planned by the unit-4 planner):
  - if it is published BEFORE this lesson: write **`2am_ikhtibar-musawat-mutabayina_P1` ← `2am_majmu-jabri_P2`** (testing an equality at a
    value computes algebraic sums) — and P3 (inequalities at given values) ← `2am_majmu-jabri_P2` if its final P3 evaluates relatives;
    read its final الكفاءات first; add a history line and, if it holds a « تذكّر » toward r06 without a link, its `getLessonPath` link;
  - if it is published AFTER: its own lead writes those edges (tell the unit-4 coordinator).
- No published 3AM / 4AM successor along a net link from r06 → nothing else.

## Generator notes (2026-10-29)

- **Group = a two-stage lab, not a separate mat.** The plan's « mini-team on a mat » is built as stage 0 of the same rope (only the bracket's children are in the queue, the whistle turns the result into ONE child — with its « − » card — of stage 1). `bracketDrop` is a TYPED model (predict phase: `+17` = the bracket's operator ignored), not a physical gesture, because the bracket's children cannot reach the main teams.
- **t2 `noTurn` ghost.** With NO child turned the ribbon stops at −16 (not −22: the plan turned one child); the ghost is at the true −12 and the un-turned children blink. The typed model `noTurn` is the sum of the printed numbers (−16 for t2).
- **The ribbon scale** is −20 … +20 (halves drawn at متقدم); the free chain accepts |term| ≤ 20 (flat, 2–6 terms).
- **Opposites « leave together »** is asked, not animated: t3's question `leave` names the two cancelling pairs (no child can be removed from a team).
- **Bank (helper-built, oracle `scripts/practice-oracle/majmu-jabri.mjs`):** 50 sheets; `MISC-JAMNISB-ADDDIST` and `MISC-JAMNISB-FLIPBOTH` are reused instead of new `MISC-JABRI-*` twins; `2am-s2-72` ex 1 G is two bracketed two-term sums; `2am-s2-57` is cited only as `term_exam_modelled` (its index entry lists no exercises).
- **Extraction:** `act-6` re-read and `verified: True`; `act-6` → module 4, `deep-47`, `deep-49`, `deep-50`, `deep-59` → bank; `self-10` / `self-11` (read at 110 dpi, stems half-cut) are rewritten as the final-test questions E2 / E4 with the platform's own numbers. The other L6 elements keep `verified: False` (not re-read at 200 dpi).
- **Module 4** has 9 exercises (act-6, ex-29, ex-36, ex-37, deep-39, 43, 44, 46, 58), module 3 three steps, `durationMinutes` 64 (the modules without the مسائل).
- **Successor connection:** nothing written in unit 4 (`ikhtibar-musawat-mutabayina` writes `P1 ← 2am_majmu-jabri_P2` itself).
