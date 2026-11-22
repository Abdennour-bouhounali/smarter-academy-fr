# Plan — `tawzi-darb-jam-tarh` « توزيع الضرب على الجمع والطرح » (2AM unit 1, lesson 4 of 4 + synthesis)

Read the unit [`README.md`](README.md) first. The three earlier lessons of the unit are published before this one.

## 1. Identity

- **Code** `tawzi-darb-jam-tarh` · **title** « توزيع الضرب على الجمع والطرح » · **unit** `amaliyat-tabiiya-ushriya` · catalogue order 3 ·
  kind `lesson` · programme item `2am.m1.r03`.
- **Folder** `apps/web/src/lessons/moyen/2am/ansab_al_aadad_wal_hisab/amaliyat-tabiiya-ushriya/tawzi-darb-jam-tarh/`.
- **Textbook pages** (book → PDF = book − 3):

  | Book p. (PDF) | Elements |
  |---|---|
  | 7 (4) | `prep` items 9 (area 2,4 × 2 + 2,4 × 3), 11 (a × 2 = 2a) |
  | 9 (6) | `act-6` (rectangles 3 × (4,8 + 2,1), 3 × (4,8 − 1,3)) |
  | 12 (9) | `know-4` (property, A = 3 × (5 + 7), B = 9 × (6 − 2), remark نشر / تحليل) |
  | 13 (10) | `method-3` (mental), `method-4` (3(x − 5)), `now-13` ① ② |
  | 15–16 (12–13) | `ex-21` … `ex-28`, `ex-31` … `ex-36` |
  | 17 (14) | `self-7` … `self-10` |
  | 18 (15) | `deep-42` |

- **Seeds the unit: no.** It is the LAST lesson of the unit: after it, only the synthesis's elements stay pending.

## 2. Programme & net

**Programme item:** `2am.m1.r03` « معرفة خاصة توزيع الضرب بالنسبة إلى الجمع والطرح واستعمالها. »

**Draft الكفاءات (verbatim):**
1. « التعبير عن مساحة مستطيل مركّب بطريقتين للوصول إلى المساواة $k \times (a + b) = k \times a + k \times b$ »
2. « تطبيق خاصية توزيع الضرب على الطرح: $k \times (a - b) = k \times a - k \times b$ »
3. « نشر جداء (من جداء إلى مجموع) وتحليل مجموع (من مجموع إلى جداء) باستعمال الخاصية التوزيعية »
4. « توظيف الخاصية التوزيعية في الحساب الذهني، مثل $17 \times 6{,}1 + 17 \times 3{,}9$ »

**Proposed final wording (order kept):**

| LP | Final | Change |
|---|---|---|
| P1 | التعبير عن عدد أشياء أو ثمن أو مساحة بطريقتين للوصول إلى المساواة $k \times (a + b) = k \times a + k \times b$ | **meaning widened**: the area is one of the two-way counts, not the only one (the lab counts kits; `act-6` keeps the area) |
| P2 | تطبيق خاصية توزيع الضرب على الطرح: $k \times (a - b) = k \times a - k \times b$ (حيث $a \ge b$) | « a ≥ b » made explicit (no negatives before unit 3) |
| P3 | نشر جداء (من جداء إلى مجموع أو فرق) وتحليل مجموع أو فرق (من مجموع إلى جداء) بالخاصية التوزيعية، ومنها عبارة فيها حرف مثل $4 \times (x - 3) = 4x - 12$ | adds the difference, the letter case and the notation `4x` (README question 1) |
| P4 | توظيف الخاصية التوزيعية في الحساب الذهني، مثل $25 \times 4{,}3 + 25 \times 5{,}7$ و $99 \times 7$ | own examples (the book's is `method-3`'s) |

**Review items for « أستعدّ »** (`reviewLinksForLesson`):

| Item | Text | Home | Status |
|---|---|---|---|
| `2am.m1.r02` | استعمال الأقواس. | `silsila-bi-aqwas` (2AM, this unit) | published before this lesson → panel link; « تذكّر — الأقواس » box WITH `getLessonPath` |

Extra `priorKnowledge`: rectangle area (1AM, `masahat-muhit-sath`, published — link), the description vocabulary of `wasf-silsila-hisab`
(« جداء عدد ومجموع »), the letter as a number (`prep` 11). **noRebuild:** empty.

**pointPrerequisites:**
- intra-lesson: P2 ← P1; P3 ← P1, P2; P4 ← P3;
- cross-lesson along the net link `2am.m1.r02 → 2am.m1.r03` (`requires`): **P1 ← `2am_silsila-bi-aqwas_P1`**;
- no cross-year edge (no 1AM item is linked into `2am.m1.r03`).

**Where it is used next:** the synthesis; 2AM `ibara-harfiya-intaj` (k × (a + b) with letters, simplifying 1 × a, 0 × a); 3AM
`tabsit-hadhf-aqwas` (published, net link `2am.m1.r03 → 3am.m5.r01`); 3AM `nashr-jabri-3am`, `jidaa-adadayn-nisbiyayn` P3, `jidaa-ida-nisbiya`
P4 (published; no net link yet — § 12); 4AM factorisation and identities.

## 3. Boundary

**Owns:** k × (a ± b) = k × a ± k × b on naturals and decimals (a ≥ b), both ways; the common factor visible on either side (k × a + k × b
or a × k + b × k); mental tricks ×11, ×9, ×99, ×101, (50 − 2) × 7; ONE letter in k × (x ± b) and the notation 3 × x = 3x; checking an
expansion by a value of the letter.

**Leaves:** two brackets (a + b)(c + d) and squares → 3AM `nashr-jabri-3am`; negative numbers (2AM unit 3, 3AM); sums of like terms as
simplification (5x + 2x + 3x) beyond a single factorisation → 3AM `tabsit-hadhf-aqwas` P1 (`ex-36` bank only, as factorisation); removing
brackets preceded by − ; producing expressions from situations, 1 × a, 0 × a, a², a³ → 2AM `ibara-harfiya-intaj`.

## 4. Textbook analysis

| Element | What it asks | Idea to keep | Platform use |
|---|---|---|---|
| `act-6` | two rectangles: what do 3 × (4,8 + 2,1) and 3 × (4,8 − 1,3) represent; justify the equalities | the area two ways | **Not the entry** (the expressions are given; the student only interprets). أتمرّن item 1 (own rectangles) |
| `know-4` | property + A, B + نشر / تحليل | wording, vocabulary نشر / تحليل | معارف (own examples) |
| `method-3` | mental A, B, C | P4 | طريقة steps 1–3 (own numbers) |
| `method-4` | 3(x − 5) and three values | the letter case | طريقة step 4 (own: 4(x − 3)) |
| `now-13` | ① 5(3a − 2) at a = 0,5 → −2,5 (discrepancy 4); ② six mental products | P3, P4 | ① rewritten (4(2a + 3), a = 0,5) → أتمرّن item 7 ; ② → أتمرّن item 5 |
| `ex-21`, `ex-23` | complete; Samira's four errors | the named errors | أتمرّن item 2 (own) |
| `ex-24`, `ex-25`, `ex-26` | expand; factor; two ways (ex-24 B negative — discrepancy 5) | P3 | أتمرّن items 3, 4 (own, all ≥ 0) |
| `ex-27` | 8 rows of 12 strawberry plants, 3 rows lost | factor in a story | أتمرّن item 6 (own) |
| `ex-28`, `deep-42` | broken keys; a product too long for the calculator | distributivity as a computing tool | مسألة 3 (own) |
| `ex-31` | T-shape area mentally | area two ways | bank (adapted) |
| `ex-32` … `ex-34`, `self-7` … `self-10`, `ex-35`, `ex-36` | practice | — | bank |

## 5. Design

**The lesson in one paragraph.** The school's solidarity club prepares 6 identical school kits: each kit gets 3 notebooks and 2 pens.
Fatima fills them kit by kit: 6 × (3 + 2) = 30 items leave the store. Ali works « صنفًا بصنف »: he sets the notebook dispenser, then the pen
dispenser, and the belt shares each load equally among the 6 bags. If he releases 3 notebooks and 2 pens, only three bags get a notebook
and only two get a pen: the bags are not ready. He must release 6 × 3 = 18 notebooks and 6 × 2 = 12 pens — every bag gets its share, and
the store counter shows 18 + 12 = 30, exactly what Fatima used. **Multiplying a sum by 6 is multiplying EACH term by 6** — the product is
« distributed » over the sum, like the items over the bags. Removing 2 damaged notebooks from each of 7 packs of 10 is the same with a
difference. Read backwards (the dispensers already show 12 × 5 and 12 × 3), the count of bags comes out as a common factor:
12 × 5 + 12 × 3 = 12 × (5 + 3). And it makes mental calculation easy: 9 bags of 48 items = 9 × 50 − 9 × 2.

**Entry point — candidates compared:**
- (a) **The book's `act-6`** (two rectangles, expressions given): interpret-and-justify, nothing to do with the hand. Rejected as the entry →
  أتمرّن item 1 (the area stays a context of P1).
- (b) **An area cut in two by moving a side**: it is the 3AM `area-split` experience (a knob cutting a side of a garden) and the 4AM
  `turf-factoring` one — same gesture, same picture. Rejected (DNA §12).
- (c) **A shop receipt read two ways** (per customer / per article): honest, but the two totals are simply displayed; no resistance. Kept as
  مسألة 1.
- (d) **Filling identical kits with two dispensers**: the student's hand sets k × a and k × b; a wrong setting leaves bags short or items
  left over (visible, countable); the equality with the kit-by-kit count is the discovery; the word « توزيع » becomes literal. **Chosen.**
  `experience: { type: 'platform_context', reason: 'platform_designed_entry', theme: 'solidarity' }`.

**Order of ideas:** two ways of filling the kits (k1, k2) → a difference (k3) → read backwards: the common factor (k4) → mental
calculation (a1) → decimals with ribbons (a2) → معارف names نشر / تحليل → طريقة: mental tricks, the letter → أتمرّن, three مسائل, the test.

**Contexts:** a solidarity club's school kits (solidarity); a sewing workshop's curtains (family craft); the cooperative's purchase in two
ways; a calculator with too few digits (curiosity).

## 6. Lab — `kit-packer` « ورشة الحقائب التضامنية » (new type)

**Drawn world `solidarity`** (new theme, kind `objects`, shows « ورشة نادي التضامن: حقائب مدرسية، رفوف كراريس وأقلام، موزّعان وحزام ناقل »):
- a workshop room: shelves of notebooks (blue stacks) and pen boxes (red) behind a counter; a STORE COUNTER « خرج من المخزن » above the door;
- left lane « حقيبة بحقيبة »: KidFigure Fatima (hijab, tunic) fills bags one by one from a model kit (a notebooks + b pens shown in a
  transparent pouch) — automatic, counted on the store counter;
- right lane « صنفًا بصنف » (the HAND's lane): two big DISPENSERS (a hopper with a dial and a big readout — notebooks, pens; in a2 two
  ribbon spools in metres) above a conveyor belt that passes in front of k open school bags; KidFigure Ali (hoodie) works the belt;
- the bags: drawn school bags (different colours) with a small window showing their content as icons + a count pill « 3 كراريس · 2 أقلام »;
- `mood`: Ali `wonder` on short / extra bags, `proud` when every bag is ready and both counters agree.

**The variable in the hand: how many items each dispenser releases** (n, m) — in `k4` the number of bags k with the dispensers locked.

**Gesture:**
- turn each dispenser's dial (drag in a circle, or −/+ round buttons ≥ 48 px, keyboard ↑ ↓ ±1, PageUp/PageDown ±10) — the readout shows the
  number big; « وزّع » drops the loads on the belt: items are dealt ONE PER BAG in turn (round robin), so the student SEES the sharing;
- `k4`: a stepper on the bag rack (k bags), then « وزّع »;
- متقدم: predict the total on a keypad before « وزّع » (diagnostic), and in `a1` choose the split of 48 on a dial (40 + 8 / 50 − 2 / free).

**What the world shows:**
- every bag ready, nothing left: ✓ on each bag, the right lane's store counter shows n + m; Fatima's lane finishes at the same time and its
  counter shows k × (a + b): the two counters glow together « 30 = 30 »;
- too few (n < k × a): the last bags stay without notebooks (red outline, « 3 حقائب دون كرّاس »), `reason: 'short'`;
- too many (n > k × a): extra items pile at the end of the belt (« 4 كراريس زائدة »), `reason: 'extra'`;
- a bag with more than its share never happens (round robin gives each bag ⌊n / k⌋ or ⌈n / k⌉: when n is not a multiple of k the bags are
  UNEQUAL — some with 3, some with 4: « حقائب غير متساوية », `reason: 'unequal'`);
- `k3` (difference): a REJECT bin catches 2 damaged notebooks from each pack: the student sets the packs dispenser AND the reject count;
  the bags get 8 good notebooks each when packs = 70 and reject = 14.

**Opening (no title):**
- Context (k1): « يحضّر نادي التضامن 6 حقائب مدرسية متماثلة: في كلّ حقيبة 3 كراريس وقلمان. »
- Question: « اضبط الموزّعين ثم وزّع حتى تكون كلّ حقيبة جاهزة ولا يبقى شيء على الحزام. »
- `lead` (lesson): « الحزام يوزّع ما يخرج من كلّ موزّع على الحقائب بالتساوي. »

**Levels** (same `objective`: « أكتشف كيف يتوزّع الضرب على حدّي المجموع أو الفرق »):

*مبتدئ:*

| id | Story | Hand | End state |
|---|---|---|---|
| `k1` | 6 kits × (3 notebooks + 2 pens) | dials n, m | n = **18**, m = **12**; counters **30 = 6 × (3 + 2)** |
| `k2` | 8 kits × (4 notebooks + 5 pens) | dials | **32 + 40 = 72 = 8 × 9** |
| `k3` | 7 kits; each gets one pack of 10 notebooks minus 2 damaged | packs dial (notebooks), reject dial | **70 − 14 = 56 = 7 × (10 − 2)** |
| `k4` | dispensers LOCKED at 60 notebooks and 36 pens; each kit must hold 5 notebooks and 3 pens | the number of bags k | k = **12**: 12 × 5 + 12 × 3 = **12 × (5 + 3) = 96** |

*متقدم* (predict the total first; no count pills before « وزّع »):

| id | Story | End state |
|---|---|---|
| `a1` | 9 kits × 48 stickers; the sticker dispenser releases only full rolls of 50 or of 10 | split 48 = 50 − 2 (or 40 + 8): **450 − 18 = 432** |
| `a2` | 15 kits × (1,2 m red ribbon + 0,8 m blue ribbon), two spools in metres | **18 + 12 = 30 m = 15 × 2** |
| `a3` | 6 kits × (4 notebooks + 3 pens), a classmate's order says « 6 × 4 + 3 » | pens dial at 3 → only 3 bags get a pen (`short`), corrected to **18**: **24 + 18 = 42** |

**« جرّب أعدادك » (always open, `[data-kit-free]`):** k ≤ 12 bags, a ≤ 9 and b ≤ 9 items (or a − b with b < a), dials free, the belt deals
and both counters show; nothing counts.

**LabCheckpoint** (`kitPacker.cp.*`):
- after `k1`: « كم كرّاسًا أخرجتَ؟ » → 18 · « لماذا 18 وليس 3؟ » → « لأنّ لكلّ حقيبة من الحقائب الست 3 كراريس » · « قارن عدّادي الممرّين » → 30 = 30.
- after `k2`: rule « ضرب عدد في مجموع = مجموع جداءَي هذا العدد في حدّي المجموع » (« أتوقّع القاعدة » in the module first).
- after `k3`: « كم كرّاسًا تالفًا رُمي؟ » → 14 = 7 × 2 · rule « … وكذلك في فرق ».
- after `k4`: « كم حقيبة؟ » → 12 · « ما العدد المشترك بين 12 × 5 و 12 × 3 ؟ » → 12 · rule « نحلّل مجموعًا بإخراج العامل المشترك ».
- after `a1`: « لماذا 50 − 2 أسهل؟ » → « لأنّ 9 × 50 و 9 × 2 تُحسبان ذهنيًا ».
- L2 teacher switch (`useLabCheckpointSettings('kit-packer')`), L3 `LabStepper`, L4 celebration, L5 « إعادة » from `k1`, L6 `playSfx` (dial =
  gesture, ready = `bell`, short / extra = `over`), L7 `immersive`, L9 guided.

**LabCoach** (`coachOf`): 1. `dial` « أدر الموزّع لتختار عدد الكراريس. » 2. `dial2` (no text: ring on the second dial) 3. `deal` « اضغط
« وزّع » لترى الحقائب. » 4. `short` / `extra` silent (the banner speaks), then `retry` on the dial « غيّر العدد ووزّع من جديد. » 5. `bags`
(k4) « اختر عدد الحقائب. » 6. `predict` (متقدم) « اكتب توقّعك للعدد الكلّي. » 7. `split` (a1) « اختر كيف تكتب 48 . » 8. `free`.

**Wrong moves made VISIBLE:** k × a + b (pens = b: bags without pens — `a3`, MISC-TAWZI-FIRSTONLY); k × a − b in a difference (only 2 damaged
removed instead of 14: bags with 9 and 10 notebooks — `unequal`); adding k instead of multiplying (n = 6 + 3 = 9: unequal bags); the common
factor not common (k4 with k = 10: 6 notebooks each but 3,6 pens — `unequal`).

**Core maths:** `chainOps.js` L4 row (`expand`, `factorOut` reusing `relativeOps.factorize`, `commonFactor`, `mentalSplits`, `expandLetter`);
lab logic `logic/kitPacker.js`: `deal(n, k)` → per-bag counts (round robin), `judgeBags(task, n, m, reject?)` → `{ ok, reason: 'short' |
'extra' | 'unequal' | null, bags }`, `counters(task, settings)`, `coachOf`; events:
- `{ kind: 'deal', task, n, m, k, ok, reason, total, free }`, `{ kind: 'refused', task, reason, n, m, k, need }`;
- `{ kind: 'predict', task, predicted, total, ok }`, `{ kind: 'split', task, parts, op }`;
- `{ kind: 'custom', free: true }`, `{ kind: 'solved', task, total }`.

**Why not another lab (DNA §12):**
- `area-split` (3AM, `nashr-jabri-3am`): a garden seen from above, a knob cuts a SIDE, parcels with signs and letters — distributivity as an
  AREA. Here no area at all: discrete items dealt into bags by a belt; the hand sets QUANTITIES (k × a, k × b), and the refusal is a short or
  overfull bag.
- `turf-factoring` / `pitch-expansion` (4AM): turf pieces in rows / zones of a pitch (area, gcd, identities).
- `fair-share` (1AM, cakes) shares ONE quantity into equal parts (division); here two quantities are dealt into k bags and the point is the
  SUM of the two loads.
- `egg-trays` (2AM unit 2) packs eggs into trays (Euclidean division); no sum, no second item.

**Screen budget:** 1024×768: two lanes side by side (Fatima's narrow on the left, Ali's wide on the right), up to 12 bags in two rows of 6
(bag ≥ 56 px), dials ≥ 72 px with big readouts, counters on top. 768×1024: lanes stacked. Full screen: the belt widens.

## 7. Modules (9)

**M0 أستعدّ** — `objectives`: « أتحقّق من الأقواس ومن مساحة المستطيل قبل أن أوزّع الضرب »:

| # | Statement | Key | Item / prior |
|---|---|---|---|
| 1 | « $6 \times (10 + 2) = 72$ » | ✓ | 2am.m1.r02 (`silsila-bi-aqwas`) |
| 2 | « $6 \times 10 + 2 = 72$ » | ✗ (62) | 2am.m1.r02 |
| 3 | « $(7 - 3) \times 5 = 20$ » | ✓ | 2am.m1.r02 |
| 4 | rewritten `prep` 9: « مستطيل عرضه 3 cm وطوله مكوّن من قطعتين 4 cm و 2,5 cm : مساحته $3 \times 4 + 3 \times 2{,}5$ » | ✓ (19,5 cm²) | area (1AM, prior) |
| 5 | « مساحة مستطيل بعداه 6 cm و 4,5 cm هي 21 cm² » | ✗ (27) | area (1AM) |
| 6 | rewritten `prep` 11: « الجداء $x \times 5$ يُكتب $5x$ » | ✓ | letter notation (prior) |

**M1 نشاط — « ورشة الحقائب التضامنية »** — `objectives`: « أكتشف لماذا ضرب عدد في مجموع يساوي مجموع جداءين ». Lab on top; steps = traces +
bricks: 1. trace `k1` (the two counters) — no brick yet; 2. trace `k2` → « أتوقّع القاعدة » → brick `tawzi-jam`; 3. trace `k3` → brick `tawzi-tarh`;
4. trace `k4` → brick `tahlil` (the common factor).

**M2 معارف** — `objectives`: « أسمّي خاصية توزيع الضرب والنشر والتحليل ».
- Opens on the lab ALONE (`levels={false}`, one task: 5 kits × (6 + 4) → 30 + 20 = 50).
- Questions: « اكتب ما أخرجه كلّ ممرّ » → 5 × (6 + 4) و 5 × 6 + 5 × 4 · « هل هما متساويان؟ » → نعم 50.
- Boxes: « تذكّر — الأقواس » (link `getLessonPath('silsila-bi-aqwas')`); the property (k, a, b decimal numbers, platform words, with the
  arrows k → a and k → b drawn); examples $A = 4 \times (9 + 6) = 4 \times 9 + 4 \times 6 = 36 + 24 = 60$ ·
  $B = 7 \times (12 - 5) = 84 - 35 = 49$; the remark نشر / تحليل with $6 \times (8 - 3) = 6 \times 8 - 6 \times 3$ and $9 \times 7 + 9 \times 3 = 9 \times (7 + 3) = 90$.

**M3 طريقة** — `objectives`: « أستعمل التوزيع لأحسب ذهنيًا ولأنشر عبارة فيها حرف »:
1. $A = 25 \times 4{,}3 + 25 \times 5{,}7 = 25 \times (4{,}3 + 5{,}7) = 25 \times 10$ → **250** (Q « ما العامل المشترك؟ »);
2. $B = 14{,}6 \times 12 - 4{,}6 \times 12 = (14{,}6 - 4{,}6) \times 12$ → **120**;
3. $C = 3{,}5 \times 101 = 3{,}5 \times (100 + 1) = 350 + 3{,}5$ → **353,5**; $D = 19 \times 6 = (20 - 1) \times 6$ → **114**;
4. the letter: $E = 4 \times (x - 3) = 4x - 12$ (notation 4 × x = 4x); E for x = 5 → **8**, x = 3 → **0**, x = 4,5 → **6** (two ways each).
Method box: « للحساب الذهني: أبحث عن عامل مشترك، أو أكتب عددًا قريبًا من عدد مدوّر على شكل مجموع أو فرق؛ ثم أوزّع ».

**M4 أتمرّن** — `objectives`: « أتدرّب على النشر والتحليل والحساب الذهني »:

| # | Statement | Answers | cites |
|---|---|---|---|
| 1 | مستطيلان عرضهما 4 cm: الأوّل طوله $5{,}5 + 1{,}5$ ، الثاني $5{,}5 - 1{,}5$ — اكتب مساحة كلّ منهما بطريقتين | 28 cm² · 16 cm² | `act-6` |
| 2 | أتمم ثم صحّح: $15 \times (20 + 4) = 15 \times \ldots + 15 \times \ldots$ ؛ $6 \times 9 - 6 \times 4 = 6 \times (\ldots)$ ؛ « $5 \times (12 + 3) = 5 \times 12 - 5 \times 3$ » ؛ « $9 \times (8 - 2) = 9 \times 8 - 2$ » | 20, 4 (360) · 9 − 4 (30) · ✗ (+) · ✗ (9 × 2) | `ex-21`, `ex-23` |
| 3 | انشر ثم احسب: $12 \times (5 + 8)$ ؛ حلّل ثم احسب: $7 \times 13 + 7 \times 17$ ؛ $2{,}5 \times 18 - 2{,}5 \times 8$ | 60 + 96 = 156 · 7 × 30 = 210 · 2,5 × 10 = 25 | `ex-24`, `ex-25` |
| 4 | احسب بطريقتين: $9 \times (6 + 4)$ ؛ $4{,}5 \times (12 - 2)$ | 90 · 45 | `ex-26` |
| 5 | احسب ذهنيًا: $45 \times 11$ ؛ $28 \times 99$ ؛ $3{,}2 \times 101$ ؛ $64 \times 9$ | 495 · 2772 · 323,2 · 576 | `now-13` ②, `ex-32` |
| 6 | « غرس فلّاح 9 صفوف في كلّ صفّ 15 شتلة، فأتلف البَرَد 4 صفوف. » اكتب بطريقتين عدد الشتلات الباقية | 9 × 15 − 4 × 15 = (9 − 4) × 15 = 75 | `ex-27` |
| 7 | انشر $F = 4 \times (2a + 3)$ ثم احسب F من أجل $a = 0{,}5$ بطريقتين ؛ حلّل $6x + 4x$ و $9x - 2x$ | 8a + 12 ; 16 ; (6 + 4)x = 10x ; 7x | `now-13` ① (rewritten), `ex-35` |

**M5 مسألة 1 (`lessonProblem`)** — « حقائب النادي »: « يحضّر النادي 35 حقيبة؛ في كلّ حقيبة 4 كراريس ثمن الواحد 45 DA و 3 أقلام ثمن الواحد
25 DA . » 1) the cost of one kit → **255 DA**; 2) the total two ways: 35 × 255 and 35 × 180 + 35 × 75 → **8 925 DA**; 3) « لدى النادي 9 000 DA :
هل يكفي؟ » → نعم، يبقى 75 DA.

**M6 مسألة 2** — « ورشة الخياطة » (decimals): « تخيط أمّ أمين 12 ستارة؛ تحتاج كلّ ستارة $2{,}35$ m من القماش و $0{,}65$ m من البطانة. » 1) the total
two ways: $12 \times (2{,}35 + 0{,}65)$ → **36 m** (mentally); 2) « اشترت لفّة من 40 m : ما الباقي؟ » → **4 m**.

**M7 مسألة 3** — « آلة لا تتّسع » (`ex-28`, `deep-42` redesigned): « شاشة آلة حاسبة بسيطة لا تعرض أكثر من 8 أرقام. نريد حساب
$12\,345\,678 \times 99$ . » 1) « لماذا لا تكفي الآلة؟ » → the result has 10 digits; 2) write 99 = 100 − 1 and expand → $1\,234\,567\,800 - 12\,345\,678$;
3) → **1 222 222 122** (subtraction by hand).

**M8 إختبار أولي** (`FINAL`):

| # | Prompt | Key | Distractors |
|---|---|---|---|
| 1 | « نشر $7 \times (10 + 3)$ هو » | $7 \times 10 + 7 \times 3$ (= 91) | $7 \times 10 + 3$ (MISC-TAWZI-FIRSTONLY) · $7 + 10 \times 3$ · $7 \times 10 \times 3$ |
| 2 | « نشر $6 \times (9 - 4)$ هو » | $6 \times 9 - 6 \times 4$ | $6 \times 9 + 6 \times 4$ (MISC-TAWZI-SIGNCHANGE) · $6 \times 9 - 4$ (FIRSTONLY) · $6 - 9 \times 4$ |
| 3 | $13 \times 8 + 13 \times 2$ | $130$ | $208$ (MISC-TAWZI-FACTORMULT: 13 × 8 × 2) · $260$ (factor counted twice: 26 × 10) · $106$ (13 × 8 + 2) |
| 4 | $99 \times 7$ ذهنيًا | $693$ | $699$ (FIRSTONLY: 700 − 1) · $707$ (SIGNCHANGE: 700 + 7) · $630$ |
| 5 | « نشر $5 \times (x - 4)$ هو » | $5x - 20$ | $5x - 4$ (FIRSTONLY) · $5x + 20$ (SIGNCHANGE) · $x - 20$ |

## 8. Misconceptions (`MISC-TAWZI-*`, prefix free)

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| `FIRSTONLY` | k × (a + b) = k × a + b | `a3` bags without pens | tests 1, 2, 4, 5; L1–L3 |
| `SIGNCHANGE` | k × (a − b) = k × a + k × b (or the reverse) | `k3` reject bin | tests 2, 4, 5; L2 |
| `ADDK` | k × (a + b) = k + a + b or (k + a) × b | dials at 9: unequal bags | L1 |
| `FACTORMULT` | k × a + k × b = k × a × b | `k4` | test 3; L2–L3 |
| `FACTORWRONG` | 8 × 13 − 8 × 7 = 8 × (13 − 8) (the factor inside) | — | L2 (Samira-style sheets) |
| `NOTATION` | 3x read as 3 + x, or 4(x − 3) = 4x − 3 (FIRSTONLY with a letter) | — | test 5; L3–L4 |

## 9. Practice bank (`content/practice/2am/tawzi-darb-jam-tarh/`, 5 levels × 10)

**Corpus read for this plan** (term 1): `2am-s1-91` ex 1 ② (factor without computing: M = 4,8 + 4,8 × 3,5 = 4,8 × (1 + 3,5); N = 7 × 1,4 − 7 × 2,4
+ 14 — negative intermediate: keep the factorisation, write 7 × (1,4 + 2 − 2,4) = 7 and never compute 1,4 − 2,4), `2am-s1-79` ex 2 E (3,9 × 0,2 + 3,9 ×
0,98 = 3,9 × 1,18 = 4,602), `2am-s1-81` ex 1 ③ (2 × (6 + 4) two ways), `2am-s1-84` ex 1 ③ ④ (expand 8,5 (12 + 2,5) = 123,25; factor 10 × 4,1 −
10 × 1,9 = 22), `2am-s1-78` ex 1 ② (5 × (32 − 7) two ways = 125), `2am-s1-87` ex 2 ② (expand 2(x + y), factor 15a − 15b — TWO letters: only if
the owner accepts letters, README question 1). Not read: `2am-s1-67` ex 1, `2am-s1-74` ex 1, `2am-s1-83` ex 2, `2am-s1-84` ex 1 rest,
`2am-s3-39` ex 4 (term 3, a hall's carpet in x).

**Honest count of FAITHFUL `term_exam`: 6–7** (8–10 after reading the five unread papers).

| Level | Content | Provenance |
|---|---|---|
| L1 | expand / factor / two ways on numbers | 3 term_exam (`2am-s1-81` ex 1 ③, `2am-s1-78` ex 1 ②, `2am-s1-84` ex 1 ④) · 5 modelled · 2 adapted (`ex-24`, `ex-25`) |
| L2 | a classmate's errors, « برّر » (which property) | 1 term_exam (`2am-s1-91` ex 1 ②) · 6 modelled · 3 adapted (`ex-23`, `self-8`, `ex-33`) |
| L3 | full exercise: mental calculations, expand with a letter, values of the letter | 2 term_exam (`2am-s1-79` ex 2 E, `2am-s1-84` ex 1 ③) · 6 modelled · 2 adapted (`now-13`, `self-10`) |
| L4 | mobilises L1–L3 (priority, brackets, naming « جداء … ومجموع … ») — those steps `counted: false` | 0–1 term_exam (`2am-s1-87` ex 2 ② if letters accepted) · 8 modelled · 1 adapted (`ex-34`) |
| L5 | « الوضعية الإدماجية »: costs of identical kits, rows of plants, a calculator too short — two ways and a decision | 0 term_exam · 9 modelled · 1 adapted (`ex-27`) |

**Answer types:** `decimal`, `choice` (expansions, factorisations), `expression` only if the validator supports it for `kx + c` — else
`choice`. **Oracle:** `scripts/practice-oracle/tawzi-darb-jam-tarh.mjs` (own BigInt evaluator; checks both sides of every equality, every
distractor's named error, every letter value; every number ≥ 0).

## 10. Risks & owner questions

1. **Letters** (README question 1) — the default keeps ONE letter in k × (x ± b); two-letter items (`2am-s1-87` ex 2 ②) wait for the decision.
2. **P1's meaning widened** (counts, prices, areas) and **P3 extended** (difference, letter).
3. **Round-robin dealing at k = 12**: 12 bags × 9 items = 108 icons on the belt — draw stacks with a count past 5 per bag; screenshot at
   1024×768 with k = 12.
4. Successor edges need net links for three of the four published successors (§ 12, README question 3).

## 11. Generator checklist

- [ ] `build-extraction.py`: this lesson's elements `verified: True`, modules; rebuild; `check:textbook` (only the synthesis's elements
  pending after this lesson).
- [ ] `chainOps.js` L4 row + tests (reuse `relativeOps.factorize`).
- [ ] Lab `kit-packer` (type, theme `solidarity`, registry, `levels.js` `k1`–`k4` / `a1`–`a3`, strings `kitPacker` + `cp.*`, logic + test
  (round robin, short / extra / unequal, reject bin, k4 bags, predict, split), render test, LabCoach, LabCheckpoint, L1–L9; contract section +
  DNA row; screenshots: initial, a short bag, extra items, k3 reject bin, k4 with a wrong k, both counters « 30 = 30 », a2 ribbons, free —
  four sizes, reviewed). Rollout status ✅.
- [ ] Lesson: 9 modules + `objectives`; header (entry, rejected (a)–(c)); « أستعدّ »; « تذكّر » with links; memo cards; `content.test.js`.
- [ ] Catalogue: `pointsToLearn`, `pointPrerequisites` (§ 2), `durationMinutes`, `difficulty`, `icon`; index + learning-net.
- [ ] Bank (50) + oracle + JSON; e2e block; gates; publish; successor edges (§ 12).

## 12. Successor connection

| Successor | Its LP | Edge | Along |
|---|---|---|---|
| `tabsit-hadhf-aqwas` (3AM, published) | P1 « تبسيط عبارة جبرية: مجموع بجمع الحدود المتشابهة … مثل $3x+5x=8x$ … » | **P1 ← `2am_tawzi-darb-jam-tarh_P3`** (3x + 5x = (3 + 5)x is a factorisation) | `2am.m1.r03 → 3am.m5.r01` (requires) — **writable now** |
| `nashr-jabri-3am` (3AM, published) | P1 « نشر عبارة من الشكل $k(a+b)$ … مع $k$ سالب أو قوسين مسبوقين بإشارة $-$ » | P1 ← `2am_tawzi-darb-jam-tarh_P3` | **no link**: needs `2am.m1.r03 → 3am.m5.r02` (`extends`, README question 3) |
| `jidaa-adadayn-nisbiyayn` (3AM, published) | P3 « تبرير إشارة جداء عددين سالبين بالخاصية التوزيعية … » | P3 ← `2am_tawzi-darb-jam-tarh_P1` | **no link**: needs `2am.m1.r03 → 3am.m1.r01` (3AM unit-1 question 1, still open) |
| `jidaa-ida-nisbiya` (3AM, published) | P4 « توظيف توزيع الضرب على الجمع أو الطرح في الاتجاهين … على أعداد نسبية » | P4 ← `2am_tawzi-darb-jam-tarh_P3`, `_P4` | same missing link |

**Links in published content:**
- `tabsit-hadhf-aqwas › content/textbook.js › PREP_ITEMS` (skill `tawzi`: « $7\times(10+8)=7\times10+7\times8$ », « $2\times(5+3)=2\times5+3$ ») already
  measure P3 / FIRSTONLY: no change; the « راجع » card becomes a link by itself.
- `tabsit-hadhf-aqwas` معارف, before the like-terms brick: a « تذكّر — السنة الثانية » `TextbookBox kind="remark"` (`addition('prior_year_reminder')`,
  link `getLessonPath('tawzi-darb-jam-tarh')`): « $3x + 5x = (3 + 5)x$ : نحلّل بإخراج العامل المشترك $x$ ».
- `nashr-jabri-3am` معارف: the same kind of recall (« $k \times (a + b) = k \times a + k \times b$ — السنة الثانية ») is a recall box, allowed
  without a net link; the LP edge waits for the link.

## Generator notes

Generated 2026-10-29 (lesson published = status `available`, 9 modules, 66 min without the مسائل). Deviations from the plan, all minimal:

1. **Refusal reasons.** The plan lists `short` / `extra` / `unequal` as three exclusive reasons, but the dealt counts are always adjacent integers (⌊n / k⌋ or ⌈n / k⌉), so « some bags too few AND some too many » never happens. `logic/kitPacker.js › judge` therefore uses: `unequal` whenever k does not divide the load (the banner counts « حقائب بلا … » when a bag is empty), `short` / `extra` when the shares are equal but too small / too big, `pack` (k3: the bags are ready but not by « a pack minus the damaged »), `split` (a1: p ± q ≠ n). Extra items are drawn in the bag counts (more than the model), not piled at the end of the belt.
2. **Layout.** At 1024×768 the lab column is ~414 px: the two lanes are NOT side by side. A single strip (Fatima, her counter, Ali's counter, Ali) replaces the two lanes; the dispensers sit under it and the bags (≤ 16, two rows above 8) under them. Bags are ≥ 34 px (the plan's 56 px does not fit 6–8 bags in 414 px); their contents are drawn (blue notebooks, red pens) and counted.
3. **k3 judge.** The plan's end state is n = 70, m = 14; a pair that fills the bags otherwise (n = 56, m = 0) is refused with `pack`, so the hand must reproduce « a pack minus the damaged ».
4. **a1 is a `split` task** (round number ± small number on two dials, + / − chips), not a free dial of 48; the prediction (432) is typed first.
5. **a2 ribbons** are shared in equal parts n / k (metres), no round-robin; the dials are in whole metres (18 and 12).
6. **أستعدّ.** Plan items kept; order mixed so the `silsila-bi-aqwas` review items come first. **M2** opens on the lab with one task and four question steps (instead of the plan's two).
7. **Bank.** Built by a helper from the plan: 50 sheets (9 `term_exam` read in the corpus: `2am-s1-74`, `-81`, `-78`, `-84` (two parts), `-91`, `-79`, `-83`, `-67`; 32 `term_exam_modelled`; 9 `adapted`). `2am-s1-67`, `-74`, `-83` were opened and read by the helper (the plan listed them « not read »). The corpus numbers had negatives or two letters, so the sheets keep the exercise's structure with own non-negative numbers and ONE letter.
8. **Successor connection** is NOT written here (coordinator): `tabsit-hadhf-aqwas` P1 ← `2am_tawzi-darb-jam-tarh_P3` (net link `2am.m1.r03 → 3am.m5.r01`, writable now), the recall box in `tabsit-hadhf-aqwas` معارف, and the three edges waiting for net links (`nashr-jabri-3am`, `jidaa-adadayn-nisbiyayn`, `jidaa-ida-nisbiya`).
