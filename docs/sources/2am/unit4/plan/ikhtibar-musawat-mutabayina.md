# Plan — `ikhtibar-musawat-mutabayina` « اختبار صحة مساواة أو متباينة » (2AM unit 4, entry 3 of 4)

Read the unit [`README.md`](README.md) first. Published before this lesson: `ibara-harfiya-intaj` (pair 1), `hall-mushkil-muadala`
(pair 2) and, in unit 3, `jam-tarh-nisbiya` (pair 2) and **`majmu-jabri` (pair 3 — the net link `2am.m4.r06 → r09`)**. In the
catalogue (what the student sees) this lesson comes BEFORE `hall-mushkil-muadala`: it never uses the words « معادلة » / « حلّ » and has
no « تذكّر » toward hall (README « renvois »).

## 1. Identity

- **Code** `ikhtibar-musawat-mutabayina` · **title** « اختبار صحة مساواة أو متباينة » · unit `mafhum-muadala` · catalogue order 19 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/mafhum-muadala/ikhtibar-musawat-mutabayina/`.
- **Textbook pages** (PDF = book − 3): act-3 p. 57 (PDF 54, upper half); know-3, know-4 p. 60 (PDF 57); method-3, now-61 ① p. 61
  (PDF 58); ex-27 … ex-33 p. 64 (PDF 61); self-8, self-9 p. 65; deep-49, deep-50 p. 66; deep-54, deep-55, deep-57, deep-60 p. 67; ict
  « دوري الآن » p. 69. Catalogue `textbookRef` (activity 57, knowledge 60, method 61) is right; **add `ict: [69, 69]`**.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🚚 (not ⚖️: the balance belongs to the 4AM equation lessons' imagery).
- Pair 4, lane B (port 5174); the other lane runs `masafa-nuqtatayn` (unit 3).

## 2. Programme & net

**Item:** `2am.m4.r09` « اختبار صحة مساواة أو متباينة تتضمّن عددا مجهولا (أو عددين مجهولين) عندما نستبدله بقيمة معلومة ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | اختبار صحّة مساواة تتضمّن عددا مجهولا (أو عددين مجهولين) بتعويضه بقيمة معلومة، مثل $7 \times x + 8 = 12 \times x - 4$ من أجل $x = 6$ | اختبار صحّة مساواة تتضمّن عددًا مجهولًا أو عددين مجهولين بتعويضه بقيمة معلومة، وحساب كلّ من الطرفين ومقارنتهما، مثل $7x+8=12x-4$ من أجل $x=6$ (خاطئة: $50\neq68$)، وتعيين القيم التي تجعلها صحيحة من بين قيم معطاة | Adds « compute each member » and « among given values » (book ex-31, corpus). |
| P2 | اختبار تساوي عبارتين حرفيتين: يكفي مثال مضادّ واحد لإثبات أنّهما غير متساويتين | اختبار تساوي عبارتين حرفيتين: تكونان متساويتين إذا أعطتا القيمة نفسها مهما كانت قيمة الحرف (بقاعدة معروفة مثل التوزيع)، ويكفي مثال مضادّ واحد لإثبات أنّهما غير متساويتين، أمّا تساويهما من أجل بعض القيم فلا يكفي | The « some values prove nothing » half (book know-3 third example, `self-9`). |
| P3 | تعيين القيم التي تجعل متباينة صحيحة من بين قيم معطاة، مثل $10x - 2 < 55 - 3x$ | اختبار صحّة متباينة (بالرموز $<$ ، $>$ ، $\le$ ، $\ge$) من أجل قيم معطاة لمجهول أو لمجهولين، وتعيين القيم التي تجعلها صحيحة من بين قيم معطاة، مثل $10x-2<55-3x$ | Adds the test itself, two unknowns (corpus truck) and ≤ ≥ (README Q12). |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `1am.m5.r08` | تطبيق قاعدة حرفية في وضعية بسيطة | `tatbiq-qaida-harfiya` (1AM) | coming_soon → text only | items 1, 2 |
| `2am.m4.r06` | حساب مجموع جبري | `majmu-jabri` (2AM unit 3) | published (pair 3) → link | items 3, 4 |

Extra `priorKnowledge`: `qimat-ibara-2am` (`ibara-harfiya-intaj` P2, published), `muqarana-ushriya` (comparing decimals — the book's
« مقارنة الأعداد العشرية »), `muqarana-nisbiya-2am` (published), `tawzi-2am` (2(x + 3) = 2x + 6).

**noRebuild:** both net links are `requires` → no « extends » box; « أستعدّ » measures them; M2 carries a « تذكّر — السنة الأولى »
(no link: « قاعدة حرفية: $P=4\times c$ ، من أجل $c=2{,}5$ : $P=10$ ») and a « تذكّر — المجموع الجبري » WITH a link to `majmu-jabri`.

**pointPrerequisites:**
- intra: P2 ← P1, P3 ← P1;
- along `2am.m4.r06 → r09` (requires): **P1 ← the `majmu-jabri` LP that computes an algebraic sum** (draft
  « حساب مجموع جبري بتجميع الحدود الموجبة فيما بينها والحدود السالبة فيما بينها » = P2; the lead re-reads its FINAL list);
- same unit, no net link (README Q4, default yes): **P1 ← `2am_ibara-harfiya-intaj_P2`** (the value of an expression);
- no 1AM edge (`tatbiq-qaida-harfiya` is `coming_soon`).
- `prerequisiteLessonCodes`: `['tatbiq-qaida-harfiya', 'majmu-jabri']` → **add `'ibara-harfiya-intaj'`** (README Q4). Never
  `hall-mushkil-muadala` (later in the catalogue).

**Where it is used next:** 3AM `musawiyat-amaliyat` and `mutabayinat-amaliyat` (net `2am.m4.r09 → 3am.m5.r05`), the synthesis; through
the proposed links (README Q5) 3AM `qimat-ibara-harfiya` P3 and `muadalat-darajat-ula` P2.

## 3. Boundary

**Owns:** see README. **Leaves:** « معادلة », « حلّ », the inverse operation (`hall`); a list of values beyond the GIVEN ones (« all
the solutions » is 4AM `mutarajiha-ula`); transforming an equality / inequality (3AM); proving an identity by expansion beyond
k(a ± b) (unit 1) — `deep-49`/`deep-50`-like identities are justified by distributivity, never by expanding two brackets.

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-3` q1–q2 | a Roberval balance: 3 cubes = 2 balls + 200 g; 3c = 2b + 200; test (10, 70), (20, 80) | two unknowns tested by values | **Not the entry** (a balance is 4AM `equation-balance`'s world; the values are given). M4 item 1 (own masses) |
| `act-3` q3 | 7x + 8 = 12x − 4 at 6; 9x + 8 = 7x + 10 at 1 | test an equality | M4 item 2 (own) |
| `act-3` q4 | 10x − 2 < 55 − 3x among « …, 5, 6, 7 » (cut) | values among given ones | M4 item 6 (own: 8x − 5 < 40 − x among 3 … 6) |
| `know-3` | 2x + 3 vs 5x at 4; 2(x + 3) = 2x + 6 always; one counterexample; x² + 9 vs 4x + 6 | equal / not equal | M2 (own: x² + 4 vs 5x) |
| `know-4` | 4 + 6x < 27 at 3 and 4 | test an inequality | M2 (own: 3 + 5x < 20) |
| `method-3` | x + 5 = 3x − 7 at 6 and 2, the table « النتيجة » | the layout | M3 step 1 (own: 2x + 9 = 5x − 3 at 4 and 2) |
| `now-61` ① | 2 + 7x = 9x at 1, 3; for every x? | one true value ≠ always | M4 item 4 |
| `ex-27`, `ex-28`, `ex-30`, `ex-31` | 28 + 4x = 9x − 2 at 6; a table of two equalities at 2, 5, 0,2; which are always true; 6x + 7 = 22 among 1 … 2,5 | practice | M4 items 2–5 |
| `deep-54` | « the sum of three consecutive naturals is 3 × the middle one » | a claim to test, then to justify | M7 (with a false twin about the product) |
| `deep-55` | n + n = n × n at 0: always? | a counterexample | M4 item 4 |
| `deep-49`, `deep-50` | two identities: test, conjecture, justify | « always » by a rule | bank L4 |
| `ict` « دوري الآن » | 2x + 3 = 3x − 1 with a table x = 0 … 11 | a table of both members | M4 item 7 (own: 3x + 2 = 5x − 6) |
| `ex-29`, `ex-32`, `ex-33`, `self-8`, `self-9`, `deep-57`, `deep-60` | practice | — | bank |

## 5. Design

**The lesson in one paragraph.** A building-materials truck must cross the bridge over the oued. Before the bridge a weighbridge
weighs it and a sign states the rule: « الكتلة الكلّية أقلّ من 5000 kg ». The truck weighs 4000 kg empty; each cement sack 50 kg. The
student LOADS x sacks and drives onto the weighbridge: its screen writes the substitution in the textbook's way — « 4000 + 50 × 15 =
4750 » — then « 4750 < 5000 ؟ صحيحة » and the barrier opens; with 22 sacks « 5100 < 5000 ؟ خاطئة » and the truck turns back. Testing a
statement for a value = substituting and computing each side. Among 18, 19, 20, 21 sacks only 18 and 19 pass — 20 gives exactly 5000,
which is NOT « less than »: the sign matters (and a « ≤ » sign at متقدم lets it pass). With sand sacks too (40 kg), the rule has two
unknowns. Then two trucks share the SAME load x: truck A (3000 + 70x) and truck B (3600 + 50x) weigh the same only for x = 30. At
متقدم, Yacine claims « A is always lighter than B »: ONE load (x = 31) that breaks the claim is enough; and a claim true for x = 10
(« 2000 + 100x and 2400 + 60x weigh the same ») is refuted at x = 0 — equal for one value proves nothing.

**Entry point — candidates compared:**
- (a) **The book's act-3** (a balance in equilibrium, 3c = 2b + 200): the balance world is 4AM `equation-balance`; the values are given,
  the hand does nothing. Rejected → M4.
- (b) **A probe x on a line** lighting « true / false »: 4AM `solution-ray` (and it would invite scanning every value, not testing).
- (c) **Two scoreboards for a pair (x, y)**: 4AM `pair-scoreboard` (systems).
- (d) **A truck loaded by the hand before a bridge with a mass sign** — the corpus' own S2 register (`2am-s2-72`, `-75`), two unknowns
  that are COUNTS (natural to carry), a verdict that is physical (the barrier), the boundary case « = 5000 » that separates < from ≤,
  and two trucks with one load for the equalities. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'weighbridge' }`.

**Order of ideas:** load, weigh, read the substitution line → the verdict compares two computed sides (P3 then P1) → among given loads
→ the boundary case (< vs ≤) → two unknowns → two trucks, one load: an equality true for ONE load → claims « always »: one
counterexample suffices; one equal value proves nothing (P2) → معارف → طريقة → practice, مسائل, test.

**Contexts (values):** the building site (work, safety rules), a lift's maximum load (safety), the national flags of a neighbourhood
association and a school (citizenship), a numbers trick between classmates (curiosity, honesty in proving).

## 6. Lab — `bridge-load` « حمولة الجسر » (new type)

**Drawn world `weighbridge`** (new theme, kind `loads`, label « جسر الوادي وميزانه: شاحنة مواد البناء »):
- a building-materials depot by a dry oued: stacked cement sacks (grey, 50 kg) and sand sacks (beige, 40 kg) on pallets; a truck with an
  open bed (its empty mass painted on the door); a weighbridge plate with a digital screen; a barrier; the bridge with its round sign
  (« < 5000 kg », « ≤ 7000 kg ») — the sign's text is DOM, LTR island;
- the screen writes the substitution line (« $4000+50\times15=4750$ ») and the comparison (« $4750<5000$ ؟ ») then « صحيحة / خاطئة »;
- for the equality tasks: TWO lanes, truck A and truck B, ONE load control feeding both beds with the same x (each truck's own formula
  on its door), two screens and « = ؟ » between them;
- KidFigure Anis (boy, hoodie) carries at مبتدئ; Salma (girl, hijab + tunic) reads the screens at متقدم; the drivers are never drawn
  (a cab silhouette).

**The variables in the hand: x (cement sacks) and y (sand sacks)** — counts 0 … 60, carried one at a time or by pallets of 5.

**Gestures (three paths):** drag a sack (or a pallet) from the depot onto the bed / back; −/+ steppers « إسمنت » « رمل » (±1, ±5);
keyboard (↑/↓ x, ←/→ y). « اعبر إلى الميزان » (Enter) weighs and tests. In « among given values » tasks the given loads are CARDS
(« 18 كيسًا ») the student drags onto the bed one by one (the bed empties between them).

**The question and its judge:** each task asks a verdict BEFORE the barrier moves: « هل تعبر الشاحنة؟ » (نعم / لا) or « أيّ الحمولات
تعبر؟ » (tick the cards) or « هل للشاحنتين الكتلة نفسها؟ ». The judge is `equation2.testAt` on the task's relation; refused verdicts are
DRAWN: a « نعم » on a failing load lets the student watch the screen line turn red and the barrier stay down; a « يعبر » on the boundary
load (= 5000) shows « $5000<5000$ ؟ خاطئة » with « $5000=5000$ » under it. A counterexample task accepts ANY load that breaks the claim
and refuses a load that satisfies it (« هذه الحمولة توافق ادّعاءه »).

**Opening (no title):**
- Context: « شاحنة مواد البناء كتلتها فارغة $4000$ kg، وكيس الإسمنت $50$ kg. لافتة الجسر: الكتلة الكلّية أقلّ من $5000$ kg. »
- Question: « حمّل الشاحنة ثمّ اعبر إلى الميزان: هل تعبر بـ $15$ كيسًا؟ وبـ $22$؟ ثمّ أيّ الحمولات $18$ ، $19$ ، $20$ ، $21$ تعبر؟ »
- `lead`: « الميزان يعوّض عدد الأكياس في القاعدة ويحسب الطرفين. »

**Levels** (same `objective` on both):

*مبتدئ:*

| id | Rule (sign) | Loads | End state |
|---|---|---|---|
| `b1` | $4000+50x<5000$ | 15 ; 22 ; then cards 18, 19, 20, 21 | 4750 ✓ ; 5100 ✗ ; **18 and 19 only** (20 gives 5000: not « < ») |
| `b2` | $4500+50x+40y<7000$ (two unknowns) | (20, 30) ; (30, 25) ; (25, 35) | 6700 ✓ ; **7000 ✗** (boundary) ; 7150 ✗ |
| `b3` | trucks A $3000+70x$ and B $3600+50x$, one load x: « $3000+70x=3600+50x$ ؟ » | 20 ; 30 ; 40 | 4400 ≠ 4600 ; **5100 = 5100** ; 5800 ≠ 5600 |

*متقدم* (PREDICT: the screens are hidden until the student types both sides' values; counterexamples):

| id | Claim | Judge | End state |
|---|---|---|---|
| `a1` | Yacine: « الشاحنة A أخفّ من B دائمًا » ($3000+70x<3600+50x$) | any x with A ≥ B refutes | **e.g. x = 31: 5170 > 5150** (any x ≥ 30: at 30 they are equal, also a counterexample to « أخفّ ») |
| `a2` | « $2000+100x$ و $2400+60x$ متساويتان لأنّهما متساويتان من أجل $x=10$ » | any x ≠ 10 refutes | **e.g. x = 0: 2000 ≠ 2400** |
| `a3` | sign « ≤ 7000 kg », $4500+50x+40y\le7000$: cards (10, 40), (30, 25), (40, 15), (25, 30) | tick the passing loads | **(10, 40) 6600, (30, 25) 7000, (25, 30) 6950 pass; (40, 15) 7100 does not** |

All values verified (planner, 2026-10-29, exact).

**« جرّب أعدادك » (always open):** the empty mass, the sack masses and the sign's number and symbol (<, ≤, =) free; never counted.

**LabCoach** (`sa.labCoach.bridge-load.off`): 1 `load` « اسحب كيسًا (أو منصّة من 5) إلى الشاحنة » · 2 `weigh` « اعبر إلى الميزان » ·
3 `screen` (first weighing) « الشاشة تعوّض وتحسب: اقرأ الطرفين » · 4 `cards` « اسحب كلّ حمولة إلى الشاحنة بدورها » · 5 `twin` (b3) « حمولة
واحدة للشاحنتين » · 6 `claim` (متقدم) « ابحث عن حمولة واحدة تُبطل الادّعاء » · 7 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- b1: « ماذا كتب الميزان؟ » (the line) → « لماذا لم تعبر بـ 20 كيسًا؟ » ($5000$ ليس أقلّ من $5000$);
- b2: « كم مجهولًا في القاعدة؟ » (2) ; b3: « من أجل أيّ حمولة تساوت الكتلتان؟ » (30) → « وهل تتساويان من أجل 20؟ » (no);
- a1: « كم حمولة تكفي لإبطال الادّعاء؟ » (واحدة) ; a2 ends on the RULE « تساوي عبارتين من أجل قيمة واحدة لا يكفي » ; a3: « ما الفرق بين
  الإشارتين $<$ و $\le$ عند الحمولة 7000؟ ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` per sack, `flag` on a right verdict, `over` on a refused one), full
screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:** a wrong verdict (the screen line and the barrier), the boundary load, a « counterexample » that agrees with
the claim, a two-unknown load with x and y swapped (`SWAP`: the screen shows 50 × 30 + 40 × 20 — a different line, a different mass).

**Formal phase:** « $4000+50\times15=4750$ و $4750<5000$ : المتباينة صحيحة من أجل $x=15$ » ; « $3000+70\times30=5100$ و
$3600+50\times30=5100$ : المساواة صحيحة من أجل $x=30$ » ; « من أجل $x=0$ : $2000\neq2400$ : العبارتان غير متساويتين ».

**Core maths:** `equation2.js` E3 (`parseRelation`, `testAt`, `whichHold`, `identityVerdict`) on `substitution.js` and `powers.js`. Lab
logic `logic/bridgeLoad.js`: `tasksOf`, `load(state, kind, delta)`, `weigh(state)` → `{ lines, values, holds }`, `judgeVerdict(state,
answer)`, `judgeCards(state, ticked)`, `judgeCounter(state)`, `coachOf`; events `{ kind: 'weigh', task, x, y, holds }`, `{ kind:
'verdict', task, answer, ok }`, `{ kind: 'cards', task, ticked, ok }`, `{ kind: 'counter', task, x, ok }`, `{ kind: 'solved', task }`,
`{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- 4AM `equation-balance` (two pans, the hand moves bags and balls to SOLVE), 4AM `solution-ray` (a probe x on a ray that leaves true /
  false traces), 3AM `equality-lanes` (an operation given to both sides), 3AM `loom-threads`, `difference-meter`: here nothing is solved
  or transformed — a load is TESTED against a rule, and the hand holds counts.
- 4AM `pair-scoreboard` (both numbers of a pair, two equations of a SYSTEM read live): here one rule, two unknowns as two kinds of sacks,
  and the scene's verdict is a barrier; no system.
- 3AM `marble-run` (a value travels down an expression tree, brackets around negatives): here the substitution is the weighbridge's
  screen line, the student's act is the load and the verdict.
- 2AM unit 3 `tug-rope` (sorting signed children onto two teams) and `balloon-ballast` (tokens on a basket): signed sums, not a test.

**Screen budget:** 1024×768: the depot + truck + weighbridge ≈ 440 × 260 px; at b3 / a1 / a2 two lanes stacked (two trucks of ≈ 180 px);
the cards and the verdict buttons in one row under the scene. Sacks ≥ 44 px targets; pallets of 5 for counts > 20.

**DOM:** `[data-bridge-load][data-level][data-task][data-x][data-y][data-solved]`, `[data-bl-depot=<kind>]`, `[data-bl-bed=<A|B>]`,
`[data-bl-sack][data-kind]`, `[data-bl-weigh]`, `[data-bl-screen=<A|B>][data-holds]`, `[data-bl-barrier][data-open]`,
`[data-bl-card=<i>][aria-pressed]`, `[data-bl-verdict]`, `[data-bl-free]`, `[data-bl-formal]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من حساب قيمة عبارة حرفية ومن المجاميع الجبرية ومن المقارنة »:

| # | Statement | Key | Measures |
|---|---|---|---|
| 1 | « قيمة $3x+5$ من أجل $x=4$ هي $17$ » | ✓ | `1am.m5.r08` / `ibara-harfiya-intaj` |
| 2 | « قيمة $2a+b$ من أجل $a=3$ و $b=1{,}5$ هي $9$ » | ✗ ($7{,}5$) | `1am.m5.r08` |
| 3 | $-7+4-(-8)=5$ | ✓ | `2am.m4.r06` (`majmu-jabri`) |
| 4 | $(+5)-(+9)=4$ | ✗ ($-4$) | `2am.m4.r06` |
| 5 | $12{,}05>12{,}5$ | ✗ | comparing decimals |
| 6 | $-3<-1$ | ✓ | `muqarana-nisbiya` |

**M1 نشاط — « حمولة الجسر »** — `objectives`: « أكتشف أنّ اختبار مساواة أو متباينة يعني التعويض وحساب الطرفين ». Lab on top; then the
trace and the bricks: `tawid-wa-hisab` « نعوّض ونحسب كلّ طرف » (b1) · `hadd` « $5000<5000$ خاطئة » (b1) · `majhulan` « مجهولان » (b2) ·
`musawat-qima` « مساواة صحيحة من أجل قيمة » (b3) · `mithal-mudad` « مثال مضادّ واحد يكفي » (a1, a2).

**M2 معارف** — `objectives`: « أسمّي اختبار المساواة والمتباينة وتساوي عبارتين ».
- Lab ALONE (`levels={false}`, b1 with x = 12: $4000+50\times12=4600<5000$ ✓).
- Boxes: « تذكّر — السنة الأولى » (1AM r08, no link) · « تذكّر — المجموع الجبري » (`majmu-jabri`, link: « $-7+4-(-8)=-7+4+8=5$ ») ·
  test an equality (platform words, know-3) · equal expressions: « $2(x+3)$ و $2x+6$ متساويتان مهما كان $x$ (خاصية التوزيع) »
  (`tawzi-darb-jam-tarh`, link) · property: one counterexample; example $x^2+4$ and $5x$: $5=5$ at $1$, $20=20$ at $4$, but $4\neq0$ at
  $0$ → not equal · test an inequality (know-4 own): $3+5x<20$ true at $3$ ($18$), false at $4$ ($23$) · the four symbols $<$ $>$ $\le$ $\ge$.

**M3 طريقة** — `objectives`: « أختبر مساواة أو متباينة وأنظّم الحساب في جدول ». Steps:
1. $2x+9=5x-3$ for $x=4$ ($17=17$ ✓) and $x=2$ ($13\neq7$ ✗) in the table « $x$ | الطرف الأوّل | الطرف الثاني | النتيجة »;
2. two unknowns: $3x+2y=24$ for $(4;6)$ ($12+12=24$ ✓) and $(6;4)$ ($18+8=26$ ✗ — the order of the pair matters);
3. an inequality among given values: $4x-3\le2x+7$ for $3, 4, 5, 6$ → $9\le13$ ✓, $13\le15$ ✓, $17\le17$ ✓, $21\le19$ ✗ → $3, 4, 5$;
4. a counterexample: « $3x+x=3x^2$ ؟ » at $x=1$: $4\neq3$ → not equal (and $3x+x=4x$ always, unit-1 factorisation).

Method box: « لاختبار مساواة (أو متباينة) من أجل قيمة: نعوّض الحرف بالقيمة في الطرفين، نحسب كلّ طرف، ثمّ نقارن النتيجتين ».

**M4 أتمرّن** — `objectives`: « أتدرّب على اختبار المساويات والمتباينات وعلى المثال المضادّ »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | على كفّتي ميزان متوازن: $4$ علب كتلة كلّ منها $c$ ، و $3$ كرات كتلة كلّ منها $b$ مع $250$ g: $4c=3b+250$ . اختبر $(b;c)=(50;100)$ ثمّ $(70;110)$ | $400=400$ ✓ ; $440\neq460$ ✗ | `act-3` q1–q2 |
| 2 | $15+3x=7x-1$ من أجل $x=4$ ثمّ $x=5$ | $27=27$ ✓ ; $30\neq34$ ✗ | `act-3` q3, `ex-27` |
| 3 | جدول: $1+x=2x-0{,}5$ و $3+3x=3(x+1)$ من أجل $x=1{,}5$ ، $3$ ، $0{,}5$ ؛ أيّهما صحيحة دائمًا؟ | الأولى عند $1{,}5$ فقط ; الثانية دائمًا | `ex-28` |
| 4 | أيّها صحيحة مهما كان $x$: $x+x=2x$ ، $x+x=x^2$ ، $2+3x=5x$ ، $4(x+2)=4x+8$ ؛ و « $n+n=n\times n$ » من أجل $n=0$ ثمّ دائمًا؟ | ✓ ، ✗ ($x=3$) ، ✗ ($x=0$) ، ✓ ; صحيحة عند $0$ (و $2$) لا دائمًا ($n=1$) | `ex-30`, `now-61` ①, `deep-55` |
| 5 | من بين $1{,}5$ ، $2$ ، $2{,}5$ ، $3$ : القيمة التي تحقّق $4x+3=13$ | $2{,}5$ | `ex-31` |
| 6 | من بين $3$ ، $4$ ، $5$ ، $6$ : القيم التي تجعل $8x-5<40-x$ صحيحة | $3$ و $4$ ($5$ يعطي $35<35$ خاطئة) | `act-3` q4 |
| 7 | أكمل جدول قيم $3x+2$ و $5x-6$ من أجل $x=0$ إلى $8$ : من أجل أيّ قيمة تتساويان؟ | $x=4$ ($14=14$) | `ict` « دوري الآن » |

**M5 مسألة 1 (`lessonProblem`) — « مصعد العمارة »** — `objectives`: « أختبر متباينة في وضعية وأستنتج أكبر عدد ممكن ».
- Statement: « يحمل مصعد عمارة $630$ kg على الأكثر. يركبه $x$ شخصًا متوسّط كتلة كلّ منهم $70$ kg مع صندوق كتلته $45$ kg. »
- Q/A: 1) المتباينة → $70x+45\le630$ ; 2) اختبرها من أجل $x=8$ ثمّ $x=9$ → $605\le630$ ✓ ; $675\le630$ ✗ ; 3) « أكبر عدد من الأشخاص
  مع الصندوق » → $8$ (من بين القيم المختبرة: selfCheck « لماذا لا 10؟ »).

**M6 مسألة 2 — « أعلام الحيّ »** — `objectives`: « أترجم وضعية بمساواة وأختبرها بقيم معطاة ».
- Statement: « اشترت جمعية الحيّ $6$ أعلام وطنية ولافتة بـ $900$ DA، واشترت المدرسة $10$ أعلام من النوع نفسه، فدفعتا المبلغ نفسه. ثمن العلم
  $x$. »
- Q/A: 1) المساواة → $6x+900=10x$ ; 2) اختبرها من أجل $150$ ، $225$ ، $300$ → $1800\neq1500$ ; $2250=2250$ ✓ ; $2700\neq3000$ ; 3) ثمن العلم
  → $225$ DA ; 4) ما دفعته كلّ جهة → $2250$ DA.

**M7 مسألة 3 — « ادّعاءان عن الأعداد المتتالية »** (`deep-54` + a false twin) — `objectives`: « أبطل ادّعاءً بمثال مضادّ وأبرّر ادّعاءً صحيحًا ».
- Statement: « قال ياسين: مجموع ثلاثة أعداد طبيعية متتالية يساوي دائمًا ثلاثة أضعاف أوسطها. وقالت لينا: وجداؤها يساوي دائمًا مكعّب أوسطها. »
- Q/A: 1) اختبر بـ $4, 5, 6$ → المجموع $15=3\times5$ ✓ ; الجداء $120\neq125$ ✗ ; 2) « هل يكفي هذا لإبطال ادّعاء لينا؟ » → نعم، مثال مضادّ واحد ;
  3) « وهل يكفي مثال واحد لإثبات ادّعاء ياسين؟ » → لا ; 4) مع الأوسط $n$: $(n-1)+n+(n+1)=3n$ (selfCheck, the ibara simplification).

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | المساواة $5x-4=3x+2$ صحيحة من أجل | $x=3$ | $x=2$ · $x=1$ · $x=6$ (ONESIDE: only $5x-4$ computed) | P1 |
| 2 | « $2x+y=13$ من أجل $x=4$ و $y=5$ » | صحيحة | خاطئة (SWAP: $2\times5+4=14$) | P1 |
| 3 | من بين $2$ ، $3$ ، $4$ : القيم التي تجعل $6x-1<2x+11$ صحيحة | $2$ فقط | $2$ و $3$ (BOUNDARY: $17<17$) · $3$ و $4$ · $4$ فقط | P3 |
| 4 | « $x^2$ و $2x$ متساويتان لأنّهما تعطيان $4$ من أجل $x=2$ » | خاطئ ($x=3$ : $9\neq6$) | صحيح (ONEVALUE) | P2 |
| 5 | « لإثبات أنّ عبارتين غير متساويتين يكفي » | مثال واحد تختلفان عنده | « ثلاثة أمثلة » (MANYEX) · « لا يمكن إثبات ذلك » · « أن تختلفا من أجل كلّ القيم » | P2 |

## 8. Misconceptions (`MISC-IKHTIBAR-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `ONESIDE` | only one member computed, compared with a number | the screen shows both | test 1 |
| `SWAP` | the values of x and y swapped | the swapped line weighs differently | test 2; M3 step 2 |
| `BOUNDARY` | « a < a » taken as true | b1 load 20, b2 (30, 25) | test 3 |
| `STRICT` | « a ≤ a » taken as false | a3 (30, 25) | bank |
| `ONEVALUE` | equal for one value ⇒ equal for every value | a2 | test 4 |
| `MANYEX` | a counterexample is not enough, « several » are needed | a1 | test 5 |
| `JUXTA` | 5x at x = 3 read « 53 » | — | bank L1 |
| `SIGNSUB` | a negative value substituted without brackets (−3² for x² at x = −3) | — | bank L3 (signed values) |

## 9. Practice bank (`content/practice/2am/ikhtibar-musawat-mutabayina/`, 5 × 10)

**Read by the planner:** `2am-s2-73` ex 2 (3x − 1 = 4x − 2 at 3 and 1; 2x + 5 < 15 at 6); `2am-s2-72` ex 5 part 1 (the truck
50x + 80y + 5000 < 7500 at (10, 30) and (8, 25): 7900 ✗, 7400 ✓; what x and y stand for; which case crosses); `2am-s3-39` ex 2 (2x − 4
= 3x − 7 at 4: 4 ≠ 5; 5y − 8 ≤ 20 − 2y at 3: 7 ≤ 14 ✓; q3 three missing numbers → hall's, `counted: false`); misfiled `1am-s2-79` ex 5
(9 lanterns + 630 DA = 14 lanterns, test 180, 126, 75 → 126; the price; what each paid). Allotted parts: `2am-s2-50` ex 2 q2 (1 − 3x =
2 − 4x at 1 and 0,5); `2am-s2-75` ex 5 part 2 (a cement truck before a 5,5 t bridge — numbers garbled: read the scan) and ex 1 q2–q3
(images). **To read:** `2am-s2-52` ex 1, `-59` ex 2, `2am-s3-31` ex 1, `-41` ex 1, `-44` ex 1.

**Honest FAITHFUL count: 4 read today; 6–8 expected.**

| Level | Content | Provenance |
|---|---|---|
| L1 | test an equality at one or two values (one unknown) | 2 term_exam (`2am-s2-73` ex 2, `2am-s2-50` ex 2 q2) · 6 modelled · 2 adapted (`ex-27`, `now-61` ①) |
| L2 | test an inequality (<, ≤) at values; values among given ones | 1 term_exam (`2am-s3-39` ex 2) · 7 modelled · 2 adapted (`ex-31`, `self-8`) |
| L3 | two unknowns; signed values (unit 3 published); a table of both members | 1 term_exam (`2am-s2-75` ex 1 after reading) · 8 modelled · 1 adapted (`ex-28`) |
| L4 | equal expressions or not: a counterexample, an identity justified by distributivity | 9 modelled · 1 adapted (`deep-50`) |
| L5 | « الوضعية الإدماجية » part: a truck before a bridge (two unknowns), lanterns / flags (an equality tested at given prices) | 2 term_exam (`2am-s2-72` ex 5 part 1, `1am-s2-79` ex 5) · 1 (`2am-s2-75` ex 5 part 2 after reading) · 7 modelled |

**Badges:** « على منوال اختبار الفصل الثاني » (`2am-s3-39` → « … الثالث »; `1am-s2-79` counts as 2AM term 2 by its header). **Oracle**
`scripts/practice-oracle/ikhtibar-musawat-mutabayina.mjs` (BigInt; every member recomputed from the statement; every « among » list
recomputed; every counterexample re-checked).

## 10. Risks & owner questions

1. **No « حلّ » here** (README « renvois »): M6 says « ثمن العلم » found by the tests, never « حلّ المعادلة ».
2. **≤ / ≥** (README Q12) — if refused, a3 and M5 use « < » and « أقلّ من أو يساوي » disappears from P3.
3. **The truck register** is the corpus' own: the lab's numbers (4000 / 4500 kg, 50 / 40 kg, 5000 / 7000 kg) differ from every paper's,
   so no `term_exam` sheet duplicates a module.
4. **Two new « تذكّر — السنة الثانية » boxes in published 3AM lessons** (README Q7, §12 below).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 54 (upper half), 57, 58, 61, 62, 63, 64, 66 at 200 dpi; `verified: True`; destinations:
  `act-3` q1–q4 → 4; `know-3`, `know-4` → 2; `method-3` → 3; `now-61` ① → 4; `ex-27`, `ex-28`, `ex-30`, `ex-31` → 4; `deep-55` → 4;
  `deep-54` → 7; `ict` « دوري الآن » → 4; `ex-29`, `ex-32`, `ex-33`, `self-8`, `self-9`, `deep-49`, `deep-50`, `deep-57`, `deep-60` →
  `None` (bank). Discrepancy 4 written.
- [ ] `equation2.js` E3 functions + tests.
- [ ] Lab `bridge-load` (type, theme `weighbridge`, levels, registry, strings `bridgeLoad`, logic + test (every task, every boundary case,
  every counterexample range), render test, LabCoach, §6ter ✅, contract section, DNA row, screenshots: initial, a passing load, a failing
  load, the boundary 5000, two unknowns, two lanes b3, a1 counterexample, a3 cards — four sizes, reviewed).
- [ ] Lesson: 9 modules with `objectives`, header, « تذكّر » (1AM text only; `majmu-jabri` and `tawzi-darb-jam-tarh` with links),
  `content.test.js`, memos.
- [ ] Catalogue (`textbookRef.pages.ict`, `prerequisiteLessonCodes`, edges), index, net, e2e `2am-mafhum-muadala-ikhtibar-musawat-mutabayina.mjs`,
  gates, bank (`MISC-IKHTIBAR-*`), publish, commit `feat(lessons): ikhtibar-musawat-mutabayina`.

## 12. Successor connection

- **3AM `musawiyat-amaliyat`** (published; net `2am.m4.r09 → 3am.m5.r05`, requires):
  - catalogue `pointPrerequisites`: **`3am_musawiyat-amaliyat_P1` ← `2am_ikhtibar-musawat-mutabayina_P1`** (an equality is true or false
    for a value — the lab's whole verdict; P1 has no entry today: create it) and **`3am_musawiyat-amaliyat_P3` ←
    `2am_ikhtibar-musawat-mutabayina_P1`** (« … للتحقق من صحة مساواة »; append to `["3am_musawiyat-amaliyat_P1", "3am_musawiyat-amaliyat_P2"]`);
  - « تذكّر — السنة الثانية »: **none exists** (its header says r09's lesson is unpublished and « أستعدّ » measures it). Default (README
    Q7): add `RECALL = { lesson: 'ikhtibar-musawat-mutabayina', title: 'تذكّر — السنة الثانية', text: 'في السنة الثانية اختبرنا صحّة
    مساواة بتعويض الحرف بقيمة وحساب الطرفين: $3x-5=7$ صحيحة من أجل $x=4$ لأنّ $3\times4-5=7$ .', source: addition('prior_year_reminder') }`
    in `content/textbook.js`, rendered as a compact `TextbookBox kind="remark"` at the top of `Module02Maarif.jsx` with
    `{base && <Link …>درس « اختبار صحة مساواة أو متباينة » — السنة الثانية متوسط</Link>}` (`getLessonPath`); its prep items requiring
    `ikhtibar-musawat` stay. Header history line.
- **3AM `mutabayinat-amaliyat`** (published; same net link):
  - catalogue `pointPrerequisites`: **`3am_mutabayinat-amaliyat_P1` ← `2am_ikhtibar-musawat-mutabayina_P3`** (an inequality is true or
    false for a value; append to `["3am_musawiyat-amaliyat_P1"]`). No edge on P4 (comparing / bracketing transforms inequalities — 3AM's
    own);
  - « تذكّر — السنة الثانية »: none exists; default (README Q7): a third `RECALL` entry `year2` (`lesson: 'ikhtibar-musawat-mutabayina'`,
    text « اختبرنا في السنة الثانية صحّة متباينة بقيمة: $2x+5<15$ خاطئة من أجل $x=6$ لأنّ $17>15$ ») rendered FIRST in `Module02Maarif.jsx`
    with the existing `link(code, label)` helper. Header history line.
- **3AM `qimat-ibara-harfiya`** P3 (the counterexample): **no edge** — no net link `2am.m4.r09 → 3am.m5.r03` (README Q5).
- **3AM `muadalat-darajat-ula`** P2 (verification by substitution): **no edge** — no net link `2am.m4.r09 → 3am.m5.r06` (README Q5).
- **4AM**: through the 3AM lessons only.

## Generator notes (2026-10-30)

- **Lab flow (decided at generation):** b1 = load 15 → weigh → verdict « نعم/لا » (the barrier tells the truth AFTER any answer; only a right verdict advances) → 22 → the cards 18 19 20 21 (dragged on the truck to be weighed, then ticked); b2 two kinds of sacks; b3 two lanes, one load; a1/a2 = `kind: 'claim'` with `predict: true` (the screens stay hidden until BOTH masses are typed; a wrong prediction still reveals the true line and is only recorded `ok: false`), the student weighs any load then presses « هذه الحمولة تُبطل الادّعاء » (`data-bl-counter`); a3 the sign « ≤ 7000 », cards. Task shape `{ id, rule, loads?, cards?, kind?, predict?, at? }`; `K1_TASK = { id: 'k1', rule: '4000+50x<5000', loads: [12] }` for module 2. Checkpoint chains: b1 `line, why20` · b2 `unknowns` · b3 `which, twenty` · a1 `howmany` · a2 `rule` · a3 `diff` · k1 `line`.
- **`equation2.js` E3:** as planned (`parseRelation`, `testAt`, `whichHold`, `identityVerdict`) plus `relText`; `testAt` accepts a string or a parsed relation, `env` carries every letter (`{ x: 15, y: '2,5' }`), `lines = { left, right, leftEq, rightEq, cmp }`; `identityVerdict(a, b, candidates = [0, 1, 2, 3, 4, 5, 10], letter = 'x')` returns `'always'` or `{ counterexample }`.
- **Catalogue:** `durationMinutes` 64 (the convention excludes the three مسائل; the plan said ≈ 85); `description` rewritten (the book's balance is no longer the entry); `textbookRef.pages.ict = [69, 69]`; `prerequisiteLessonCodes` `['tatbiq-qaida-harfiya', 'majmu-jabri', 'ibara-harfiya-intaj']`; `pointPrerequisites` P1 ← `2am_majmu-jabri_P2` (the algebraic-sum LP, along the net link `2am.m4.r06 → r09`) and `2am_ibara-harfiya-intaj_P2`, P2 ← P1, P3 ← P1. Final الكفاءات: 209 / 198 / 159 characters.
- **« أستعدّ »:** all six items are platform additions (`PREP_ITEMS = []`): items 1–2 measure `1am.m5.r08`, items 3–4 `2am.m4.r06`, item 5 decimals, item 6 relatives.
- **Plan numbers kept:** every number of §6–§9 was recomputed (content tests) and is right. Module 4 has SEVEN exercises (the plan table), one more than hall.
- **Bank (helper-built):** 50 sheets, **12 `term_exam` / 32 modelled / 6 adapted** (the plan expected 4 read today and 6–8; all the « to read » papers were read: `2am-s2-52`, `-59`, `2am-s3-31`, `-41`, `-44` and `2am-s2-75` ex 1 / ex 5 part 2 are now `term_exam`); counted exercises only; `counted: false` « what do x and y stand for » steps carry P1 of THIS lesson.
- **Extraction:** the elements that have no module (`ex-20`, `ex-29`, `ex-32`, `ex-33`, `self-9`, `deep-49`, `deep-57`, `deep-60`) are cited as `alsoSource` of the module-4 exercises / the مسألة 3 they inspire (the coverage check wants every destination cited); `act-3`, `know-3`, `know-4`, `method-3`, `now-61`, `ex-27` … `ex-33`, `ict` marked `verified` (book pp. 57, 58, 60, 61, 64, 69 re-read at 100 dpi).
- **Open points:** the successor connection (3AM `musawiyat-amaliyat` P1/P3 ← P1, `mutabayinat-amaliyat` P1 ← P3, their « تذكّر » boxes) is left to the coordinator; the last paragraph of the final test says « الدرس التالي: حلّ مشكل باستعمال معادلة » (a forward pointer in the catalogue order, never a prerequisite).
