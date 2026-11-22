# Plan — `jam-tarh-nisbiya` « جمع وطرح عددين نسبيين » (2AM unit 3, entry 2 of 6 — pair 2, lane A)

Read the unit [`README.md`](README.md) first. `talim-mustaqim-mudarraj-2` (entry 1) and `muqarana-nisbiya` are published before this lesson.

## 1. Identity

- **Code** `jam-tarh-nisbiya` · **title** « جمع وطرح عددين نسبيين » · unit `adad-nisbiya-2` · catalogue order 14 · `lesson`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/adad-nisbiya-2/jam-tarh-nisbiya/`.
- **Textbook pages** (PDF = book − 3): `act-3`, `act-4` p. 41 (PDF 38, right edge cut); `know-2a`, `know-2b` p. 44 (PDF 41); `method-3`,
  `method-4`, `now-45` p. 45 (PDF 42); `ex-25`…`ex-28`, `ex-30`…`ex-34` p. 48 (PDF 45); `self-7`, `self-8` p. 49; `deep-38`, `deep-45`,
  `deep-48`, `deep-57` pp. 50–51. Catalogue `textbookRef` (activity 41, knowledge 44, method 45) is right.
- `durationMinutes` ≈ 85; `difficulty` « متوسط »; icon 🎈.

## 2. Programme & net

**Item:** `2am.m4.r05` « جمع وطرح عددين نسبيين ».

| LP | Draft (verbatim) | Final | Change and reason |
|---|---|---|---|
| P1 | جمع عددين نسبيين من نفس الإشارة: نجمع مسافتيهما إلى الصفر ونحافظ على الإشارة المشتركة | جمع عددين نسبيين لهما الإشارة نفسها: نجمع مسافتيهما إلى الصفر ونحتفظ بالإشارة المشتركة، مثل $(-3{,}2)+(-5)=(-8{,}2)$ | Example added (decimals: the 2AM relatives). |
| P2 | جمع عددين نسبيين من إشارتين مختلفتين: نطرح المسافة الصغرى من الكبرى ونأخذ إشارة العدد الأبعد عن الصفر | جمع عددين نسبيين من إشارتين مختلفتين: نطرح المسافة الصغرى إلى الصفر من الكبرى ونأخذ إشارة العدد الأبعد عن الصفر؛ ومجموع عددين متعاكسين معدوم | **Adds « opposites → 0 »** (book act-3 Tuesday, ex-26 (−6) + (+6); needed by `majmu-jabri` P2 and 3AM `jidaa-adadayn-nisbiyayn` P3). |
| P3 | طرح عدد نسبي بإضافة معاكسه، مثل $(+5) - (-7) = (+5) + (+7)$ | (kept) طرح عدد نسبي بإضافة معاكسه، مثل $(+5)-(-7)=(+5)+(+7)=(+12)$ | Result added. |

**Review items for « أستعدّ »:**

| Item | Text | Home | Status | Measured by |
|---|---|---|---|---|
| `2am.m4.r01` | قراءة فاصلة نقطة… على مستقيم مدرّج | `talim-mustaqim-mudarraj-2` | published (entry 1) → link | items 1, 2 |

Extra `priorKnowledge` (no net link, measured): `muqarana-nisbiya-2am` (« which is farther from zero » — item 3), `jam-tarh-ashri`
(decimal sums and differences, 1AM, item 4).

**noRebuild:** none (r05 has no `extends` / `consolidates` base). The 1AM programme met negative numbers only in contexts (1am.m5.r05);
2AM BUILDS the two rules here.

**pointPrerequisites:**
- intra: P3 ← P1, P3 ← P2;
- same year along `2am.m4.r01 → 2am.m4.r05` (requires; entry 1 published, final الكفاءات): **P1 ← `2am_talim-mustaqim-mudarraj-2_P1`**,
  **P2 ← `2am_talim-mustaqim-mudarraj-2_P1`** (distances to zero), **P3 ← `2am_talim-mustaqim-mudarraj-2_P1`** (the opposite);
- no edge toward `muqarana-nisbiya` (no net link r02 → r05).

**Where it is used next:** `majmu-jabri` (r05 → r06), `masafa-nuqtatayn` (r05 → r07), the synthesis; 3AM `jidaa-adadayn-nisbiyayn` and
`jidaa-ida-nisbiya` (r05 → 3am.m1.r01) — §12.

## 3. Boundary

**Owns:** see README (two terms, missing term, pyramids). **Leaves:** chains of three terms or more (`majmu-jabri`: the book's `ex-29`,
`deep-49`, `deep-50`, `deep-58` move there), the simplified writing $5-3$ (`majmu-jabri` P3 — here every number keeps its brackets and
sign: $(+5)-(+3)$), the distance between two points (`masafa-nuqtatayn`: here « by how much did it rise » is a DIFFERENCE, never called a
distance), products (3AM).

## 4. Textbook analysis (reference, not script)

| Element | What it asks | Idea kept | Platform use |
|---|---|---|---|
| `act-3` | Amine's video game, two rounds a day, gains/losses, conjecture the rule | gains and losses cancel | **Not the entry** (a table to fill by intuition, no necessity). M4 item 1 (own: a quiz club's two rounds) |
| `act-4` | −2 °C then down 5; « add (+7) + (−7) to compute (−7) − (+5) »; (+5) − (−7) | adding a NEUTRAL PAIR lets you remove what is not there | **This is the lab's core gesture** (tie a token-and-bag pair, then remove); the book's numbers become M4 item 2 (own: Djelfa −3, then down 6) |
| `know-2a`, `know-2b` | the two addition rules, « subtract = add the opposite » | the rules | M2 (own words, own examples) |
| `method-3`, `method-4`, `now-45` | (−4)+(−7), (−4)+(+7); (+8,4)−(−5,2), (+3)−(+7), (−3)−(+7) | the written layout | M3 (own numbers) |
| `ex-25`…`ex-27` | sums of two (integers, decimals) | P1, P2 | M4 item 3 |
| `ex-28`, `ex-31` | missing term | reasoning on the rule | M4 item 4 |
| `ex-30`, `deep-45` | pyramids of sums | pairwise sums | M4 item 5 (own pyramid) / bank |
| `ex-32`, `ex-34` | differences | P3 | M4 item 6 |
| `ex-33` | match calculations with equal results | subtract ↔ add opposite | M4 item 7 |
| `deep-38` | « a sum is always smaller than each term »? | counter-example | M4 item 8 |
| `deep-48` | °C → K: + 273,15 | adding a decimal | bank L2 (adapted) |
| `deep-57` | two negative integers, sum −12, difference 2 | reasoning | bank L3 (adapted: sum −14, difference 4 → −5 and −9) |
| `self-7`, `self-8` | QCM | — | test register + bank |

## 5. Design

**The lesson in one paragraph.** A hot-air balloon floats by the edge of the Tassili plateau; the edge is the zero, the canyon below is
negative. Its altitude is its LOAD: every orange flame token tied to the basket lifts it one metre, every sandbag pulls it down one metre.
A token and a bag together leave it where it is — a neutral pair. To add $(-4)$ the student ties four bags; the balloon at $+6$ drops to
$+2$ and four token-bag pairs glow and lock: what is left decides the answer (subtract the distances, keep the sign of the bigger load).
To SUBTRACT $(-3)$ the student throws three bags overboard: the balloon RISES, exactly as if three tokens had been tied — subtracting a
number is adding its opposite. When the basket holds no bag to throw, the student first ties neutral pairs (the balloon does not move),
then throws the bags: the book's « (−7) + (+7) » trick, made with the hands.

**Entry point — candidates compared:**
- (a) **The book's act-3** (a game's daily totals): the student fills a table by intuition; the rule is « conjectured », never needed.
  Rejected → M4.
- (b) **A thermometer that rises and falls**: models sums well but NOT the subtraction of a negative (« remove a fall of 3 °C » has no
  physical gesture); vertical scale already used by `zero-probe`.
- (c) **Moves on a number line** (jumps): `division-jumps` (1AM) jumps, `difference-meter` (3AM) reads a signed difference; subtraction
  again needs « turn around », a convention to memorise.
- (d) **A load of opposite objects whose sum is the altitude, where objects can be ADDED or REMOVED**: addition and subtraction are two
  different gestures on the same load, and the neutral pair makes « subtract = add the opposite » visible. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'balloonvalley' }`.

**Order of ideas:** same sign (tie more bags: distances add) → different signs (pairs cancel: subtract distances, sign of the bigger
load) → opposites (all pairs: 0) → subtract a negative (throw bags: the balloon rises) → subtract when nothing to remove (tie neutral
pairs first) → « subtract = add the opposite » → معارف → طريقة (layout, decimals) → practice, مسائل, test.

**Contexts (values):** the balloon festival (wonder at the Sahara), Djelfa's winter mornings (caring for the cold), a building's
elevator (neighbours), a quiz club's points (fair play — never money, never betting).

## 6. Lab — `balloon-ballast` « أكياس المنطاد » (new type)

**Drawn world `balloonvalley`** (new theme, kind `load`, label « منطاد فوق وادي التاسيلي: نفخات لهب وأكياس رمل »):
- the edge of a sandstone plateau (Tassili arches, a few cypress-like Saharan trees), the canyon below; the plateau's edge is drawn as the
  « 0 » line across the scene; a vertical altitude scale on the right (−12 … +12 m);
- the balloon (striped envelope, wicker basket) moves vertically by whole metres (half metres at متقدم's predict check); a guide line
  from the basket to the scale;
- under the scene a shelf with two bins: orange flame tokens « نفخة +1 » and brown sandbags « كيس −1 », and a « زوج محايد » bundle (a
  token tied to a bag) at متقدم;
- on the basket's ropes the tied objects hang; a token and a bag on the same rope row glow and lock as a pair (drawn tied together);
- KidFigure Sara (girl, hijab + tunic, sun hat) in the basket at مبتدئ, Rayan (boy, hoodie) at متقدم; mood by verdict.

**The variable in the hand: the LOAD of the basket** (two integers: tokens t ≥ 0, bags s ≥ 0; altitude = t − s), changed only by four
gestures: tie a token, tie a bag, throw a token, throw a bag (and, at متقدم, tie a neutral pair = one token + one bag).

**Gestures (three paths):** drag an object from the shelf onto a rope (tie); flick / drag an object out of the basket (throw — it falls
and the balloon reacts); −/+ steppers under each bin (« اربط » / « ارمِ »); keyboard (T / S tie, Shift+T / Shift+S throw, P pair).

**The task card and its judge:** each task is an operation card $a \pm b$; the balloon starts LOADED for $a$ (minimal load: |a| tokens
or bags). The card's second number tells the gesture: « + (−4) » = tie 4 bags; « − (−3) » = throw 3 bags; « + (+5) » = tie 5 tokens;
« − (+5) » = throw 5 tokens. The student performs it, then types the altitude. The judge checks (1) the LOG of gestures against the card
(type and count) and (2) the typed altitude against $a\pm b$ (`relative.js add / sub`). A wrong gesture is refused visibly (the log line
turns red: « البطاقة تطلب رمي 3 أكياس، وأنت ربطت 3 أكياس »); throwing what the basket does not hold is impossible (the object is not
there: the coach suggests the neutral pair only after two refused tries).

**Opening (no title):**
- Context: « الصفر هو حافة الهضبة. كلّ نفخة لهب ترفع المنطاد مترًا، وكلّ كيس رمل يُنزله مترًا. »
- Question (t1): « المنطاد عند $+6$ : نفّذ البطاقة $(+6)+(-4)$ بأكياس الرمل، ثم اكتب ارتفاعه الجديد. »
- `lead`: « نفخة وكيس معًا لا يغيّران الارتفاع. »

**Levels** (same `objective` on both):

*مبتدئ* (sums; integers):

| id | Card | Gesture | Pairs that lock | End state |
|---|---|---|---|---|
| `t1` | $(+6)+(-4)$ | tie 4 bags | 4 | **+2** |
| `t2` | $(-3)+(-5)$ | tie 5 bags | 0 | **−8** |
| `t3` | $(-9)+(+5)$ | tie 5 tokens | 5 | **−4** |
| `t4` | $(-6)+(+6)$ | tie 6 tokens | 6 | **0** |

*متقدم* (differences; PREDICT: the student types the altitude BEFORE the burner runs; the gestures then check it):

| id | Card | Gesture | End state |
|---|---|---|---|
| `a1` | $(-7)-(-3)$ | throw 3 bags | **−4** |
| `a2` | $(+5)-(-7)$ | no bag aboard: tie 7 neutral pairs, throw 7 bags | **+12** |
| `a3` | $(-2)-(+5)$ | no token aboard: tie 5 neutral pairs, throw 5 tokens | **−7** |
| `a4` | $(+6)-(+7)$ | 6 tokens aboard: tie 1 neutral pair, throw 7 tokens | **−1** |

**« جرّب أعدادك » (always open):** a card $a \pm b$ with |a|, |b| ≤ 12 integers; the balloon starts loaded for $a$; never counted.

**LabCoach** (`sa.labCoach.balloon-ballast.off`): 1 `tie` « اسحب كيسًا إلى حبال السلّة » · 2 `type` « اكتب الارتفاع الجديد » · 3 `pairs`
(first locked pair) « نفخة وكيس متقابلان لا يغيّران شيئًا » · 4 `throw` (متقدم) « ارمِ من السلّة ما تطلبه البطاقة » · 5 `neutral` (after two
refused throws) « اربط زوجًا محايدًا: المنطاد لا يتحرّك » · 6 `free`.

**Lab prototype (§6ter):** chains from the student's run:
- t1: « كم زوجًا انقفل؟ » (4) → « ماذا بقي في السلّة؟ » (2 tokens) → « ما إشارة الناتج ولماذا؟ » (+, more tokens);
- t2: « هل انقفل زوج؟ » (no) → « كيف حصلت على 8؟ » (3 + 5 bags);
- t3 (P2): « أيّهما أبعد عن الصفر: −9 أم +5؟ » → « الناتج = 9 − 5 مع إشارة … » (−);
- t4: « ماذا يحدث حين نجمع عددين متعاكسين؟ » (0);
- a1: « رميت 3 أكياس: صعد المنطاد أم نزل؟ » → « أيّ ربط يعطي الحركة نفسها؟ » (tie 3 tokens = $+(+3)$);
- a2: « لماذا ربطت أزواجًا محايدة قبل الرمي؟ » → « $(+5)-(-7)$ يساوي أيّ مجموع؟ » ($(+5)+(+7)$);
- a4 (ends on the RULE): « لطرح عدد نضيف معاكسه ».
`LabStepper`, `useStepCelebration`, « إعادة », `playSfx` (`gesture` on tie / throw, `bell` when a pair locks, `flag` / `over`), full
screen, `guided={!!chain}`, render test over every task.

**Wrong moves made VISIBLE:**
- `addDist` (t3: types −14): a ghost balloon at −14 under the real one, and the 5 locked pairs blink: « هذه الأزواج لا تُحسب »;
- `signFirst` (t3: types +4, the sign of the number added): the ghost on the wrong side of the plateau edge;
- `subNoFlip` (a1: types −10): the ghost below while the real balloon rose after the throw;
- `flipBoth` (a2: types −2 = $(-5)+(+7)$): the log shows the card's « − (−7) » and the student's prediction drawn as a ghost;
- wrong gesture (ties bags for « − (−3) »): the log line turns red and the balloon is shown going the wrong way.

**Formal phase:** with the student's cards: $(+6)+(-4)=(+2)$ ؛ $(-9)+(+5)=(-4)$ ؛ $(+5)-(-7)=(+5)+(+7)=(+12)$.

**Core maths:** `relative.js` E2 row (`add`, `sub`, `ruleCase`, `ballastOf`). Lab logic `logic/balloonBallast.js`: `tasksOf`,
`loadFor(a)`, `apply(state, gesture)` (`tie`/`throw` × `token`/`bag`, `pair`), `altitude(state)`, `lockedPairs(state)`,
`judge(task, log, typed)` → `{ ok, gestureOk, valueOk, model }`, `coachOf`; events `{ kind: 'gesture', task, g, object, altitude }`,
`{ kind: 'answer', task, value, ok, model }`, `{ kind: 'predict', task, value, ok }`, `{ kind: 'solved', task }`,
`{ kind: 'custom', free: true }`.

**Why not another lab (DNA §12):**
- `zero-probe` (this unit): one distance and a side make ONE number; here two opposite kinds of objects make a load, and the operation is
  the gesture (tie or throw).
- `difference-meter` (3AM): two probes READ a signed difference already computed by the needle; here the student builds the result.
- `merge-board` (3AM): neighbouring tiles merge in a chosen order; no load, no removal.
- `kit-packer` (2AM m1): dispensers fill identical kits (k × (a + b)); no opposite objects, no cancellation.
- `equality-lanes` / `term-ferry` (equations): the operation is applied to both sides of an equality; here there is no equality.

**Screen budget:** 1024×768, lab column ≈ 414 px: the valley scene 414 × 300 px (scale 25 m → 12 px per metre), the shelf (two bins +
the pair bundle) 414 × 90 px under it, the card + answer pill in one row. The balloon never leaves the scene for |altitude| ≤ 12.

**DOM:** `[data-balloon-ballast][data-level][data-task][data-altitude][data-solved]`, `[data-bb-balloon][data-value]`,
`[data-bb-token=<i>][data-paired]`, `[data-bb-bag=<i>][data-paired]`, `[data-bb-shelf=token|bag|pair]`, `[data-bb-log]`,
`[data-bb-answer]`, `[data-bb-ghost][data-model]`, `[data-bb-free]`, `[data-bb-formal]`, `[data-bb-kid][data-mood]`.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من المسافة إلى الصفر والمعاكس وجمع العشريات »:

| # | Statement | Key | Item |
|---|---|---|---|
| 1 | « المسافة إلى الصفر للعدد $-6{,}5$ هي $6{,}5$ » | ✓ | r01 |
| 2 | « معاكس $+3{,}2$ هو $-2{,}3$ » | ✗ ($-3{,}2$) | r01 |
| 3 | « $-9$ أبعد عن الصفر من $+5$ » | ✓ | muqarana-nisbiya |
| 4 | $8{,}4+5{,}2=13{,}6$ و $5{,}2-3{,}7=1{,}5$ | ✓ | 1AM decimals |
| 5 | « ارتفعت الحرارة من $2$ °C إلى $9$ °C : ارتفعت بـ $7$ درجات » | ✓ | contexts |
| 6 | « على مستقيم مدرّج، $-4$ على يمين $-1$ » | ✗ | r01 |

**M1 نشاط — « أكياس المنطاد »** — `objectives`: « أكتشف كيف أجمع عددين نسبيين وكيف أطرح عددًا نسبيًا ». Lab on top; then the trace
and the bricks: `jam-nafs-ishara` (t2) · `jam-ishara-mukhtalifa` (t3) · `mutaakisan-sifr` (t4) · « أتوقّع القاعدة » then
`tarh-bi-muakis` (a1–a4).

**M2 معارف** — `objectives`: « أسمّي قاعدتي الجمع وقاعدة الطرح ».
- Lab ALONE (`levels={false}`, two cards: $(-8)+(+3)$ → **−5**; $(+4)-(-6)$ → **+10**).
- Boxes (platform words, after the answers): rule 1 (same sign) · rule 2 (different signs) · opposites → 0 · subtraction rule · examples
  $(-2{,}5)+(-4)=(-6{,}5)$ ؛ $(+7)+(-10)=(-3)$ ؛ $(-6)-(+9)=(-6)+(-9)=(-15)$.

**M3 طريقة** — `objectives`: « أكتب حساب مجموع وفرق بخطوات واضحة ». Steps (own numbers):
1. $A=(-5)+(-8)=-(5+8)=(-13)$ ؛ $B=(-5)+(+8)$: $8>5$ → $+(8-5)=(+3)$;
2. $C=(+6{,}3)-(-2{,}4)=(+6{,}3)+(+2{,}4)=(+8{,}7)$ ؛ $D=(+2)-(+9)=(+2)+(-9)=(-7)$ ؛ $E=(-4)-(+6)=(-4)+(-6)=(-10)$;
3. $F=(-3{,}3)-(-5)=(-3{,}3)+(+5)=(+1{,}7)$ (Q « من أبعد عن الصفر؟ »).
Method box: « لطرح عدد: نكتب الطرح جمعًا للمعاكس، ثم نطبّق قاعدة الجمع ».

**M4 أتمرّن** — `objectives`: « أتدرّب على الجمع والطرح في حسابات ووضعيات »:

| # | Statement (own numbers) | Answers | cites |
|---|---|---|---|
| 1 | نادي المسابقات: نقاط فريق في جولتين كلّ يوم: $(+8;-3)$ ، $(-6;+6)$ ، $(-5;-4)$ ، $(+7;-12)$ : الحصيلة اليومية | $+5$ ; $0$ ; $-9$ ; $-5$ | `act-3` |
| 2 | في الجلفة كانت الحرارة $-3$ °C ثم انخفضت بـ $6$ °C : اكتب الحساب والنتيجة؛ ثم احسب $(-8)-(+4)$ بإضافة $(+4)+(-4)$ | $(-3)+(-6)=(-9)$ ; $(-12)$ | `act-4` |
| 3 | احسب: $(+9)+(-4)$ ، $(-7)+(+2)$ ، $(-6)+(-8)$ ، $(-4{,}6)+(+4{,}6)$ ، $(+3{,}75)+(-5{,}25)$ ، $(-2{,}8)+(-6{,}2)$ | $+5$ ; $-5$ ; $-14$ ; $0$ ; $-1{,}5$ ; $-9$ | `ex-25`…`ex-27` |
| 4 | أكمل: $\ldots+(+4)=(-9)$ ؛ $(-6)+\ldots=(+2)$ ؛ $(+3)-\ldots=(+10)$ | $(-13)$ ; $(+8)$ ; $(-7)$ | `ex-28`, `ex-31` |
| 5 | هرم: القاعدة $-5$ ، $+8$ ، $-2$ ، $-6$ ؛ كلّ خانة مجموع الخانتين تحتها | $+3$ ، $+6$ ، $-8$ ؛ $+9$ ، $-2$ ؛ $+7$ | `ex-30` |
| 6 | احسب: $(-11)-(-4)$ ، $(+7)-(+15)$ ، $(+9)-(-9)$ ، $(-2{,}5)-(+7{,}5)$ ، $(+1{,}6)-(+4{,}25)$ | $-7$ ; $-8$ ; $+18$ ; $-10$ ; $-2{,}65$ | `ex-32`, `ex-34` |
| 7 | اربط كلّ فرق بالمجموع الذي يساويه: $(+3)-(-8)$ ، $(-3)-(+8)$ ، $(-3)-(-8)$ with $(-3)+(+8)$ ، $(+3)+(+8)$ ، $(-3)+(-8)$ | (1, 2), (2, 3), (3, 1) | `ex-33` |
| 8 | « مجموع عددين أصغر دائمًا من كلّ منهما » — صحيح أم خاطئ؟ مثال مضادّ | خاطئ: $(+3)+(+4)=7>4$ (true only for two negatives) | `deep-38` |

**M5 مسألة 1 (`lessonProblem`) — « صباحات الجلفة »** — `objectives`: « أترجم تغيّرات الحرارة بجمع وطرح ».
- Statement: « سجّلت محطة الأرصاد في الجلفة $-4$ °C عند الفجر، ثم ارتفعت الحرارة $11$ درجة حتى الظهر، ثم انخفضت $9$ درجات في المساء. »
- Q/A: 1) حرارة الظهر → $(-4)+(+11)=(+7)$ ; 2) حرارة المساء → $(+7)+(-9)=(-2)$ ; 3) « بكم تختلف حرارة المساء عن حرارة الفجر؟ » →
  $(-2)-(-4)=(+2)$ : أدفأ بدرجتين.

**M6 مسألة 2 — « مصعد البرج »** — `objectives`: « أحسب طابق الوصول وأحسب كم طابقًا صعد أو نزل ».
- Statement: « في برج طوابق من $-4$ (المرأب) إلى $+15$ . ركبت مريم المصعد في الطابق $-2$ . »
- Q/A: 1) صعدت $9$ طوابق → $(+7)$ ; 2) ثم نزلت $11$ طابقًا → $(-4)$ ; 3) « من الطابق $+7$ إلى الطابق $-4$ : اكتب الفرق » → $(-4)-(+7)=(-11)$ : نزلت 11.

**M7 مسألة 3 — « مسابقة بين قسمين »** — `objectives`: « أجمع نقاطًا موجبة وسالبة وأقارن نتيجتين ».
- Statement: « في مسابقة ثقافية: الإجابة الصحيحة $+5$ نقاط والخاطئة $-3$ . الجولة الأولى: القسم أ $(+10)$ و $(-6)$ ، القسم ب $(+5)$ و $(-9)$ . »
- Q/A: 1) حصيلة أ → $(+4)$ ; 2) حصيلة ب → $(-4)$ ; 3) « حصيلتان متعاكستان؟ » → نعم، مجموعهما $0$ ; 4) « كم ينقص ب ليلحق أ؟ » → $(+4)-(-4)=(+8)$.

**M8 إختبار أولي:**

| # | Prompt | Key | Distractors | LP |
|---|---|---|---|---|
| 1 | $(-7)+(-9)$ | $-16$ | $+16$ (SIGNLOST) · $-2$ (SUBDIST) · $+2$ | P1 |
| 2 | $(-13)+(+8)$ | $-5$ | $+5$ (SIGNFIRST: the sign of the number added) · $-21$ (ADDDIST) · $+21$ | P2 |
| 3 | $(+6)-(-4)$ | $+10$ | $+2$ (SUBNOFLIP) · $-10$ (FLIPBOTH) · $-2$ | P3 |
| 4 | $(-3{,}5)-(+1{,}5)$ | $-5$ | $-2$ (SUBNOFLIP) · $+5$ · $+2$ | P3 |
| 5 | « ارتفعت الحرارة من $-4$ °C إلى $+3$ °C . بكم ارتفعت؟ » | $7$ | $-1$ (ADDINSTEAD: $(-4)+(+3)$) · $1$ (SUBDIST) · $-7$ (REVERSED) | P3 |

## 8. Misconceptions (`MISC-JAMNISB-*`)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `SIGNLOST` | the sum of two negatives is positive | t2 ghost | test 1 |
| `SUBDIST` | always subtract the distances | t2 / t1 | tests 1, 5 |
| `ADDDIST` | always add the distances | t3 ghost + blinking pairs | test 2 |
| `SIGNFIRST` | the sign of the first term (or of the positive) | t3 | test 2 |
| `SUBNOFLIP` | $a-(-b)=a-b$ | a1 ghost | tests 3, 4 |
| `FLIPBOTH` | both numbers change sign | a2 log | test 3 |
| `ADDINSTEAD` | « by how much » computed as a sum | — | test 5 |
| `REVERSED` | initial − final | — | test 5 |

## 9. Practice bank (`content/practice/2am/jam-tarh-nisbiya/`, 5 × 10)

**Read by the planner:** `2am-s2-62` ex 1 A, B ($(-8)+(-12)$, $(+11)-(+25)$); `2am-s2-70` ex 1 q 1 A, B ($(+13{,}2)+(-6{,}8)$, $(+15)-(+24)$);
`2am-s2-50` ex 1 A, B ($(+8)+(+2)$, $(+12)-(-5)$). Each sheet keeps the register (« أحسب بتمعّن موضّحًا مراحل الحساب ») with other
numbers. **To read:** `2am-s2-69` ex 1 q 2 (A − D, B + C: the values of A, B, C, D are on the scan only), `2am-s1-73` ex 1 (no text layer),
`2am-s2-71` ex 1 (no text layer), `2am-s2-52` ex 3 (coordinates found by addition — check it is r05, not r04).

**Honest FAITHFUL count: 3 read today; 5–7 expected.** The two-term parts are short: L1–L3 carry the faithful sheets.

| Level | Content | Provenance |
|---|---|---|
| L1 | sums and differences of two relatives (integers, decimals), « أكمل » | 2 term_exam (`-62` ex 1 A B, `-50` ex 1 A B) · 6 modelled · 2 adapted (`ex-27`, `self-8`) |
| L2 | a calculation then « برّر » (which rule, why this sign); temperature / floor changes | 1 term_exam (`-70` ex 1 q 1 A B) · 7 modelled · 2 adapted (`deep-48` K = °C + 273,15, `act-4` own numbers) |
| L3 | full exercise: several two-term calculations, a missing term, a pyramid | 1–2 after reading (`-69` ex 1 q 2, `2am-s1-73` ex 1) · 7 modelled · 1–2 adapted (`ex-30`, `deep-57` with sum −14 / difference 4) |
| L4 | mobilises `talim-mustaqim-mudarraj-2` / `muqarana-nisbiya` (same term): place the results on a line, order them; those steps `counted: false` | 1 after reading (`2am-s2-71` ex 1) · 9 modelled |
| L5 | « الوضعية الإدماجية »: temperatures of a week, an elevator, a quiz's points; a decision (warmer? which floor? who wins?) | 10 modelled (`2am-s2`) |

**Oracle** `scripts/practice-oracle/jam-tarh-nisbiya.mjs` (BigInt hundredths; each key recomputed; each distractor checked equal to its
named error and false).

## 10. Risks & owner questions

1. **P2's extension** (opposites → 0) — README Q5.
2. **A neutral pair is a convention to learn**: the coach introduces it only when the student is stuck (a2, a3, a4), and the chain asks
   WHY it changes nothing (« نفخة وكيس: مترٌ إلى الأعلى ومترٌ إلى الأسفل »).
3. **Decimals in the lab**: integers only (a balloon load is countable); decimals live in M2–M4 and the bank. The free panel accepts
   integers only.
4. **« By how much did it rise »** is written as a difference (P3) and never named « المسافة » (`masafa-nuqtatayn`).

## 11. Generator checklist

- [ ] `build-extraction.py`: re-read PDF pp. 38, 41, 42, 45, 46, 47, 48 at 200 dpi; `verified: True`; destinations: `act-3`, `act-4` → 4
  (README move); `know-2a`, `know-2b` → 2; `method-3`, `method-4`, `now-45` → 3; `ex-25`…`ex-28`, `ex-30`…`ex-34`, `deep-38` → 4 (cited by
  M4); `self-7`, `self-8` → 8; `deep-45`, `deep-48`, `deep-57` → `None` (bank). Move `ex-29`, `deep-49`, `deep-50`, `deep-58` to
  `majmu-jabri` m4 and `self-4` to L1 m8 only if entry 1's lead has not done it (README table).
- [ ] `relative.js` E2 functions + tests (exhaustive: `add`/`sub` over all pairs |a|, |b| ≤ 12 by 0,25 against a reference).
- [ ] Lab `balloon-ballast` (type, theme `balloonvalley`, levels, registry, strings `balloonBallast`, logic + test (every task; the
  gesture log judge; altitude = tokens − bags after any sequence), render test, LabCoach, §6ter ✅, contract section, DNA row,
  screenshots: t1 initial, t1 pairs locked, t3 ghost (−14), a2 with neutral pairs, a4 solved — five sizes, reviewed).
- [ ] Lesson: 9 modules, header, `content.test.js` (BigInt), memos.
- [ ] Catalogue (P1–P3 final, `pointPrerequisites` above), index, net map, e2e `apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-jam-tarh-nisbiya.mjs`,
  gates, bank (`MISC-JAMNISB-*`), publish (lesson, 9 modules, 50 exercises `published`), commit `feat(lessons): jam-tarh-nisbiya`.

## 12. Successor connection

- **3AM `jidaa-adadayn-nisbiyayn`** (published; net `2am.m4.r05 → 3am.m1.r01`, requires):
  - catalogue `pointPrerequisites`: **`3am_jidaa-adadayn-nisbiyayn_P1` ← `2am_jam-tarh-nisbiya_P1`** ($(-2)\times3=(-2)+(-2)+(-2)$ is a sum of
    negatives) — create `"P1": ["2am_jam-tarh-nisbiya_P1"]`; **`3am_jidaa-adadayn-nisbiyayn_P3` ← `2am_jam-tarh-nisbiya_P2`** (the
    distributive proof ends on « $(-12)+(+12)=0$ », a sum of opposites) — append to `P3`'s list (today `["3am_jidaa-adadayn-nisbiyayn_P2"]`);
  - `content/textbook.js › RECALL_ADD` already has `lesson: 'jam-tarh-nisbiya'`, and `Module02Maarif.jsx` already renders
    `{recallPath && <Link …>}`: the link appears by itself once the lesson is `available`; update the comment « (درس 2AM غير منشور بعد : لا
    رابط) » and add the history line in `lesson.config.js`; its « أستعدّ » items (`jam-tarh-nisbi`) unchanged.
- **3AM `jidaa-ida-nisbiya`** (published; same net link): **`3am_jidaa-ida-nisbiya_P4` ← `2am_jam-tarh-nisbiya_P2`, `2am_jam-tarh-nisbiya_P3`**
  (distributivity « in both directions » on relatives needs the sum and the difference) — append to `P4`'s list. It has no « تذكّر —
  السنة الثانية » box toward r05 (only toward its own unit's lesson): nothing else to edit; history line in its header.
- **Inside the unit:** `majmu-jabri` and `masafa-nuqtatayn` write their own edges toward this lesson (their plans §2).
- No 4AM net link starts at r05.

## Generator notes (lead, 2026-10-29)

1. **Lab constants.** The scene is 220 px high (1 m = 4,2 px) instead of the plan's 300 px, so that `[data-bb-glance]` is ≈ 710 px at 1024×768; up to 24 objects per kind (the plan said nothing; a sum of two cards of 12 needs 24). The shelf holds a pair bundle only at متقدم and in « جرّب أعدادك ».
2. **Gestures.** The plan's « flick » is a drag of more than 28 px from the bin (tie) or out of the basket (throw); taps and the « اربط / ارمِ » buttons do the same; an opposite gesture CANCELS its twin in the log (so a mistaken tie can be undone without leaving a red trace).
3. **Entry/chain.** Cards: `t1`–`t4` (sums) and `a1`–`a4` (differences) exactly as planned; module 2 poses two cards `m1` `(−8)+(+3)` → −5 and `m2` `(+4)−(−6)` → +10 (`predict`, 6 neutral pairs then 6 bags thrown). Chains: t1 `pairs · left · whySign`, t2 `noPair · howEight`, t3 `farther · signOf`, t4 `oppZero · ruleSum`, a1 `rose · sameTie`, a2 `whyNeutral · equalsSum`, a3 `equalsSum`, a4 `ruleDiff`.
4. **Misconception definitions made precise.** `FLIPBOTH` = −(a − b) (the result of the difference, sign changed); `SUBNOFLIP` = a + b computed instead of a − b; `SUBDIST` for same-sign sums = ||a|−|b|| with the first sign; `SIGNFIRST` = sign of the number added with the difference of distances.
5. **Bank** (helper): 7 `term_exam` instead of the planned 3 (all seven papers were read), 6 `adapted`; MCQs have three options with two named errors; `2am-s2-71` ex 1 is cited by this bank for q 1 only (the line-placing part q 2 is `talim-mustaqim-mudarraj-2`'s). `2am-s2-52` ex 3 is mostly a frame exercise; only its q 4 (add (+3) to an abscissa, subtract (−3) from an ordinate) was modelled, re-sketched as two numbers on a game screen.
6. **Extraction.** `act-3`, `act-4` → module 4; `ex-29`, `deep-49`, `deep-50`, `deep-58` → `majmu-jabri`; `deep-45`, `deep-48`, `deep-57` → bank (`module: None`); `know-2a`, `know-2b`, `method-3`, `method-4`, `now-45` re-read (pp. 44–45) and set `verified: True`; the others were NOT re-read at 200 dpi (the lesson uses none of the book's numbers). `now-45` is cited by `METHOD.sum`, `deep-45` by the exercise `ex-30`.
7. **Catalogue.** `durationMinutes` 64 (modules without the three مسائل), difficulty « متوسط », icon 🎈, `pointPrerequisites` P1 ← talim P1, P2 ← talim P1, P3 ← P1, P2 and talim P1 (the plan's P3 ← talim P1 edge kept).
8. **Not done by the lead** (coordinator): successor connection (§12), DB export/import and publication, the guide's « patterns to reuse » note (the guide file was dirty in the tree and left untouched), `MOYEN_ROLLOUT_PROGRESS.md`.
