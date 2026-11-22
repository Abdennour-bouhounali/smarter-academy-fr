# Batch 2 — the design page of lessons 4–8 of 4AM unit 1 (ACCEPTED by the owner on 2026-11-19: « Go, full design »)

Written 2026-11-19 by the main session, after the review of the same day (`REVIEW_2026-11-19.md`, R8, R9 and open item
12). **State, 2026-11-19 evening: lesson 4 is BUILT (`LESSON_4_GATE_REPORT.md`); the six new kinds are written
(`summit` and `deal` played by lesson 4; `lists`, `sort`, `measure`, `part` have their unit tests and have NOT been seen
in a browser — that happens with lessons 5–8); the four new modes are being written; lessons 5–8 are not built.** It is
the ONE design page of the batch (`LESSON_V2_MASTER_PLAN.md` §9, step 1): the
owner's « go » covers it; what he corrects is corrected here first.

Sources: `npm run lesson:brief -- <id>` for the five lessons (the الكفاءات, the learning points, the weight of each in
the bank), `GAME_WORLD.md` « استكشف » (the sixteen kinds), and the `world/` folders written on 2026-11-18 (untracked):
their stories, numbers, practice, trainers and knowledge are KEPT where the review found them sound; their forges and
experiments are what this page replaces.

## 1. What was wrong with the first draft (the review, in one table)

| Finding | Where | What this page does |
|---|---|---|
| The same three kinds (`common`, `ladder`, `nest`) carried 8 of 11 keys | lessons 5, 7, 8 | each key gets the experiment of ITS nature (§3); six kinds are added, four get a new mode |
| Lesson 4's planned experiment was identical to lesson 5's (`common` on an ordinary pair) | 4, 5 | lesson 4 keeps `common`; lesson 5 finds the PGCD from LISTS (`lists`) |
| Keys that replay lesson 3's experiments (`join` for a − b, `peel` for the remainder) | 6 | lesson 3 proved « a common plank holds the difference / the piece »; lesson 6 asks the NEW thing — the two pairs have the SAME common planks (`nest`, mode `pair`), and a run of subtractions IS one division (`ladder`, mode `fold`) |
| A key sealed inside the key before it (the longest plank asked at the end of `common`) | 4 | `common` stops at the shelves in lesson 4 (`crown: false`); the longest is its own search (`summit`) |
| Rules told, hints and distractors marked wrong though true, evidence on wrong answers, memo quizzes marking true equalities wrong | 4–8 | repaired lesson by lesson BEFORE its forges are written (§5) — these are defects of the written content, not of the design |
| No experiment for « reduce in stages » and for a fraction that comes out of a calculation | 8 | `measure`, `part` |
| The 1AM lesson `ikhtizal-kitaba-kasriya` forged on Euclid's algorithm (no PGCD in 1AM) | 1AM | OUT of this page: redesigned after the five 4AM lessons (§6) |

## 2. Kit work — what the world « أرخبيل القواسم » must gain

**Six new kinds** (each: pure logic in `divisorIsles/`, its screen, unit and render tests, its row in `GAME_WORLD.md`):

| Kind | Its nature | What the student does |
|---|---|---|
| `summit` | a search for a MAXIMUM, with the reason to stop | two strips. He holds a plank that fills both gaps and is asked for a longer one: first he TYPES any length he wants (the world lays it on both gaps and writes the two divisions — a fact), each try kept on a line of lengths. Then the planks of the SHORTER gap are tried from the longest down; before each he says whether it holds the other gap; the first that holds is crowned; he says whether the shorter ones still need trying. Mode `first`: before the search he says how many planks will be tried — one, when the shorter gap's own length holds the longer gap. |
| `deal` | a sharing of TWO collections into identical lots | drawn flowers (or dates and figs) and empty vases. He chooses the number of lots, says BEFORE whether everything will be shared, the world deals both collections round by round; what cannot be dealt stays on the table (`40 = 6 × 6 + 4`). A table keeps his tries: lots, of each kind per lot, left over. Then: the most lots, and what one lot holds (typed in its template). |
| `lists` | a PROCEDURE on two lists | he builds the planks of each gap by pairs (he types a plank, the world writes its partner — lesson 2's method, not re-taught), the two lists stand one above the other; he links the planks that are in both; the world outlines a link that is wrong by its division; the longest linked plank is asked last. |
| `sort` | a CLASSIFICATION of pairs | cards, one pair of gaps each (or one fraction each, lesson 8). For each he may open ONE instrument he already owns (the lists, the summit, the ladder — the world runs it and shows facts), then drops the card in one of two baskets. Trap cards: two numbers that are not prime and share only 1 (25 ; 27), neighbours (44 ; 45), a hidden common plank (85 ; 119 → 17), a number and its multiple. A card in the wrong basket is answered by the plank the world lays. |
| `measure` | a CHANGE OF UNIT | the fraction is two strips, the numerator above the denominator. He picks a plank that fills both as the unit; the world counts both strips again in that unit and writes the new fraction beside the old one with « = » (a real fraction bar). Mode `stages`: he goes on until no plank but 1 fills both, by the road HE chooses; a second run by another road ends on the SAME fraction (a fact he predicts). Mode `direct`: he must end in ONE stage — which plank? |
| `part` | a part of a whole, re-cut | ONE strip (the whole, 39 cells) with a painted part made in two strokes (5 cells, then 8); he writes the fraction painted; then he picks a plank that fills the part AND the whole: the strip is re-cut in that unit, the painted length does not move, the writing does (13/39 → 1/3). |

**Four new modes of kinds that exist**: `common` — `crown: false` (ends on the shelves and their count) and `witness`
(the tray is the planks the divisibility rules give — 2, 3, 5, 9, 10; ONE plank on the shelf « both » ends the round:
« is one enough? »); `nest` — `pair` (the third strip is replaced by a second PAIR: the planks of (a ; b) against the
planks of (b ; a − b) or (b ; r)); `ladder` — `fold` (the rows of a subtraction ladder that take away the same gap are
folded by him into one line `a = b × q + r`) and `both` (the two ladders of the same pair side by side: he says
BEFORE which is shorter, and by how many rows).

To check in the code before the build (not verified today): that `common` can draw a gap of 0 cells (lesson 5, key ⚡).
— Checked 2026-11-19: `commonOf` threw on a gap of 0 and the strip was invisible; both fixed (one gap of 0 allowed, drawn
as an empty mark with « 0 », `0 = d × 0 + 0`), tested; the four modes are built (`gcdModes.js`, `InquiryGcdModes.jsx`).

## 3. The five lessons — every key, its nature, its experiment

The stories written on 2026-11-18 are kept (islands, gaps, the last bridge's problem); numbers quoted are theirs.
`(P…)` = the learning point; the count is its PRIMARY questions in the bank — the weight of the key.

### Lesson 4 — `qasim-mushtarak-akbar` (what the PGCD IS) — « سوق الزهور »

| Key | Nature | Experiment | Numbers |
|---|---|---|---|
| 🤝 القواسم المشتركة (P1, 19) | a plank that must fill two gaps | BUILT 2026-11-19 (§7, replaces `common`): the convoy « twins » — the planks of island A build 198 then 234, island B has none; a refused second gap sends him back to A. Forge without experiment: 5 predictions on new pairs, then tiles « يبني اللوح الجسرين معًا إذا كان [يملأ تمامًا · أقصر من] [كلّ هوّة من الهوّتين · الأولى · الثانية · إحداهما على الأقلّ · هوّة لصقهما · هوّة طولها فرقهما] » (12 rules), tested on the planks he fired; `use` unchanged (the common planks of a new pair, as a set) | 198 and 234; island A: 7 (neither), 11 (the first only), 13 (the second only), 9 (both) |
| 👑 القاسم المشترك الأكبر (P2, 56) | the plank that builds both bridges with the fewest planks | BUILT 2026-11-19 (§7, replaces `summit`): the convoy « crown » with a purse of 42 coins, one per plank — 2 runs out on the first bridge, 7 on the second (38 + 4 of 46), only 14 builds both (19 + 23). Forge without experiment: 5 predictions, then tiles « آخذ [أطول لوح · أقصر لوح · أيّ لوح، فكلّها سواء] من بين الألواح التي [تملأ الهوّتين كلتيهما · تملأ الهوّة الأقصر · تملأ الهوّة الأطول] » (9 rules), tested on the planks he fired with the planks each needs; `use` unchanged (A = g × x, B = g × y) | 266 and 322; island C: 2, 7, 14 |
| 💐 الباقات المتماثلة (P3, 53 — 38 of them at level 5) | a sharing read with common divisors | `deal` | 40 roses and 56 lilies: 8 bouquets at most, 5 and 7 in each |
| 🧩 قواسم القاسم المشترك الأكبر (P4, 23) | an equality of two sets | `nest` (as written) | 228 dates, 276 figs, 12 |

One number changes: the market's 208 roses (now a plank of `qisma-iqlidiya-hasr`) → 364 (364 and 286: 26 bouquets of 14
roses and 11 lilies; the walkway 650 cells). 182, proposed first, is a number of the lesson's own bank (level 4).

**The final mission — the last bridge needs the lesson** (2026-11-19, after the screenshot review: « 650 cells, which
plank fills them? » was a plain division, the PGCD was not needed). The market's walkway is TWO stretches laid end to
end — 364 cells for the roses, then 286 for the lilies — and ONE kind of plank must fill EACH stretch exactly, the longest
there is. The store offers **28 against 26**: 28 is longer and fills the roses' stretch alone (364 = 28 × 13; 286 =
28 × 10 + 6), 26 = PGCD(364 ; 286) fills both (14 + 11 = 25 planks). Only the content changed (`world/story.js`: the
mission, the question, Zero's sentences, the failure that names the lilies' stretch, the success « 14 في ممرّ الورود و 11
في ممرّ الزنابق »); the kit's store still divides the whole walkway — 650 = 28 × 23 + 6, the same 6 empty cells — so what
the store and the world do stays true. The price step is kept: 25 planks × 140 دج = 3500 دج. No sentence tells him to
compute the PGCD: he is asked for « the longest plank that fills both stretches ».

### Lesson 5 — `tayin-pgcd` (FINDING it, small numbers) — « مرفأ الرصيفين »

| Key | Nature | Experiment | Numbers |
|---|---|---|---|
| 📋 احصر القواسم ثم قاطعها (P1, 116) | a procedure | `lists` | 32 and 44; then 65 and 39 |
| ⚡ نتائج مباشرة (P2, 7) | limit cases | `common` on special pairs, the longest asked: twins of the same length, a gap of 0 cells (`0 = d × 0`: every plank « fills » it), the pair turned round | 27 and 27; 27 and 0; 27 and 1; (44 ; 32) against (32 ; 44) |
| 🎯 عندما يقسم الأصغر الأكبر (P3, 27) | a search that ends at its first step | `summit`, mode `first` | 76 and 19; 84 and 21; against 90 and 36 |

### Lesson 6 — `bahth-pgcd` (FINDING it, long gaps: the two algorithms) — « أطول لوح »

| Key | Nature | Experiment | Numbers |
|---|---|---|---|
| ➖ الفرق يحفظ الألواح المشتركة (P1, 4) | two pairs, the same common planks | `nest`, mode `pair` | (152 ; 95) and (95 ; 57) |
| 🪜 خوارزمية الفروق (P2, 13) | a procedure repeated until a gap is gone | `ladder`, mode `subtract` | 152 and 95 |
| 🧮 الباقي يحفظ الألواح المشتركة (P3, 3) | a pattern compressed | `ladder`, mode `fold` | 962 and 296: three subtractions, one division, 74 left |
| 🔁 خوارزمية إقليدس (P4, 48) | a procedure | `ladder`, mode `divide` | 1833 and 546 |
| ⏱️ أيّ الخوارزميتين أسرع (P5, 57) | a comparison he predicts | `ladder`, mode `both` | 1003 and 34 (31 rows against 2); a pair where the two ladders are equal |

Five keys on two kinds, four of them on `ladder`: the lesson IS the ladder; every (kind, mode) is used once.

### Lesson 7 — `awwaliyan-fima-baynahuma` (coprime numbers) — « جسرا المرفأ »

| Key | Nature | Experiment | Numbers |
|---|---|---|---|
| 🤝 عددان أوّليان فيما بينهما (P1, 26) | a classification of pairs | `sort` | (26 ; 39), (25 ; 27), (44 ; 45), (85 ; 119), (13 ; 39) |
| ✅ أثبت أنّهما أوّليان فيما بينهما (P2, 113) | a proof by a procedure | `ladder`, mode `divide`, ending on 1; the last step is the sentence of the proof, typed in its template | 45 and 44; then 546 and 385 |
| ❌ أثبت أنّهما ليسا أوّليين فيما بينهما (P3, 41) | ONE witness is enough | `common`, mode `witness` | 645 and 410 (5); a pair with no witness among the rules' planks (85 ; 119) — a fact: « no witness seen » proves nothing |

### Lesson 8 — `ikhtizal-kasr` (reducing a fraction) — « مرفأ الكسور »

The reading of the world stays the draft's: **two gaps crossed one after the other are ONE fraction** (the first the
numerator, the second the denominator); a plank that fills both is a UNIT in which both are counted again.

| Key | Nature | Experiment | Numbers |
|---|---|---|---|
| 🪜 الاختزال على مراحل (P1, 4) | a change of unit, repeated | `measure`, mode `stages` | 66/78 → 22/26 → 11/13, and by 6 at once |
| 🔒 الكسر غير القابل للاختزال (P2, 9) | a classification of fractions | `sort` (fraction cards) | 25/27, 11/13, 22/26, 13/39, 15/22 |
| 🎯 الاختزال بالقاسم المشترك الأكبر (P3, 94) | the one unit that ends at once | `measure`, mode `direct` | 66/99 with 33 |
| 🧾 نتيجة حساب (P4, 42) | a part of a whole, re-cut | `part` | 5 and 8 cells of a bridge of 39: 13/39 = 1/3 |

## 4. What stays as the kit already does it

The exam sitting is the bank as it is (`createBankSittings`); « تدرّب », the practice ladder, the knowledge map and
the store of the last bridge are the kit's; evidence uses the claim kinds added on 2026-11-19 (`pgcd`, `coprime`,
`commonDivisor`, `fraction`) behind `guardEvidence`. Each lesson gets its board (`board/script.js`, `memo.js`), its
class test, its launch-kit family and its walks; lesson 8's launch needs the family of `1am.m5.r02`.

## 5. Order of work

1. **Lesson 4 first, alone, to « done »** — it is the reference of the four others (the first lesson built with the new
   kinds): `summit` and `deal` ∥ the repair of its written content ∥ its forges, board, satellites, walks.
2. While lesson 4 is walked: the kinds of lessons 5–8 (`lists`, `sort`, `measure`, `part`, the four modes).
3. Lessons 5, 6, 7, 8 in that order, each to « done » and committed before the next is declared finished.
4. The integration lesson `wadiya-idmajiya-aadad` after them (`INTEGRATION_LESSON_PLAN.md`).

A lesson is « done » by `LESSON_V2.md`: its status line ✅, its tests, its walks at 1366×768, 1024×768 and 1840×900,
its screenshots looked at. (The walks of the six lessons already v2 are still owed: master plan §4ter-0, step 16.)

## 6. Open, for the owner

(Item 1 is answered: « Go, full design », 2026-11-19. Design choices the kinds' agents left open are listed in
`LESSON_4_GATE_REPORT.md` § « Open ».)

1. **« go » on this page** — or the lean variant: only `deal`, `measure` and `sort` are added, and `summit`, `lists`,
   `part` are replaced by kinds that exist (`common` with the longest asked, `common` again, a mirror alone). It costs
   about half the kit work and brings back two of the review's findings (lessons 4 and 5 on the same experiment; a key
   without an experiment).
2. The fraction read as two gaps (lesson 8): accepted as the draft wrote it, or another reading.
3. The 1AM lesson `ikhtizal-kitaba-kasriya` (core prerequisite of lesson 8): proposed AFTER the five lessons, with a
   design of its own (equal writings, decimal fractions, reducing by the divisibility rules — no PGCD).

## 7. THE OWNER'S REDESIGN of 2026-11-19 — a situation lived on the islands (ACCEPTED for lessons 5–8; lesson 4 in work)

After lesson 4 was built the owner changed how a rule is met (`LESSON_V2_MASTER_PLAN.md` §4ter-0 step 19; the contract:
`GAME_WORLD.md` §2ter-1): **the need for the rule comes from the world itself** — a constraint he carries from one
island to the next — and that situation REPLACES the experiment screen of the mirror. The mirror keeps the tiles, the
test on what he did on the islands, the attacks, the seal, the last step and the tablet. Three rules hold in every
world: the instruction is big and stays, the facts of the island before stand on the right, he can walk back.

The world has two mechanics for it (built 2026-11-19): **a convoy** (two bridges built with the planks of ONE island;
the island between holds none; a gap that refuses sends him back) and **a purse** (a coin per plank, whatever its
length). §3 above stays the record of the experiment kinds; where this section gives a key an island situation, that
situation replaces the experiment named in §3.

### Lesson 4 — decided, in work

| Key | The situation on the islands | In the mirror |
|---|---|---|
| 🤝 القواسم المشتركة | he is told the two gaps (198, 234) and that the planks he picks build BOTH bridges, the next island having none: 7 fills neither, 11 only the first, 13 only the second, 9 both | tiles (what makes a plank build both), tested on the planks he tried |
| 👑 القاسم المشترك الأكبر | 266 and 322, planks 2, 7 and 14 that ALL fill both; a plank costs one coin whatever its length; 42 coins: only 14 pays for both bridges (19 + 23) | tiles (which plank costs least), tested on the planks he tried |
| 💐 الباقات المتماثلة · 🧩 قواسم القاسم المشترك الأكبر | unchanged (`deal`, `nest` — a sharing and an equality of two sets have no bridge to carry) | as built |

### Lessons 5–8 — ACCEPTED by the owner on 2026-11-19 (« 1-accept, 2-agree, 3-yes »); nothing of it is built yet

« New piece » = something the world does not have yet. A key marked « mirror » keeps its experiment of §3: I found no
honest situation on the islands for it — a procedure or a proof is not a constraint one carries.

**Lesson 5 `tayin-pgcd`**

| Key | The situation on the islands | Stays in the mirror | New piece |
|---|---|---|---|
| 📋 احصر القواسم ثم قاطعها (116 questions — the heart of the lesson) | a convoy with NO plank offered: the island has a workshop where he MAKES the plank he wants; gaps 32 and 44, a purse of 19 coins (8 + 11 planks of 4). To know which plank to make he fills the workshop's two lists (the planks of each gap, by pairs) and links those in both | tiles: the procedure in his words | the workshop opens the `lists` bench on the island (the kind exists; today it opens in the mirror) |
| ⚡ نتائج مباشرة | three short convoys with the workshop, where the purse says it all: twins 27 and 27 (2 coins); 27 and 1 (28 coins); 27 and a gap already full, 0 cells (1 coin) | tiles | a gap of 0 cells drawn as a bridge already standing |
| 🎯 عندما يقسم الأصغر الأكبر | 76 and 19 with 5 coins — the shorter gap's own length is the plank; against 90 and 36 (7 coins: 18, not 36) | tiles | — |

**Lesson 5 — the road as it is built (2026-11-19, the story « مرفأ الرصيفين » of the draft kept where it fits)**

| Islands | What happens | Numbers |
|---|---|---|
| A (a workshop) → B (no planks) → C | convoy « lists », key 📋: no plank is offered — he MAKES one in the workshop (he types its length); the workshop's bench holds the two lists; a purse | gaps 32 and 44; 19 coins = 8 + 11 planks of 4 (with 2: 16 + 22; with 1: 76) |
| C: the mirror | forge 📋 — tiles: the procedure in his words; its last step: PGCD of a new pair, the lists typed | 39 and 65 → 13 |
| C (a workshop) → D → E | convoy « same », key ⚡: two gaps of the same length | 27 and 27; 2 coins |
| E (a workshop) → F → G | convoy « full », key ⚡: the second gap is already full (0 cells: its bridge stands) | 27 and 0; 1 coin |
| G: the mirror | forge ⚡ — tiles; the mirror's attacks hold (27 ; 1) and a pair turned round (44 ; 32) | — |
| G (a workshop) → H → I | convoy « nest », key 🎯: the shorter gap's own length builds both | 19 and 76; 5 coins = 1 + 4 |
| I: the mirror | forge 🎯 — tiles; the mirror's attacks hold 90 and 36, where the shorter gap does NOT build the longer (18) | — |
| I → the dash → J → the last bridge → K | the gate dash on the three keys; the store of the last bridge: the two piers, the longest plank that fills both, the price | 154 and 238: 14 (22 fills 154 only), 90 دج a plank |

New pieces of the world used: a workshop on any island that works from the start, where he types the plank's
length and opens a bench (the `lists` kind); a gap of 0 cells (a bridge that stands).

**Lesson 6 `bahth-pgcd`**

| Key | The situation on the islands | Stays in the mirror | New piece |
|---|---|---|---|
| ➖ الفرق يحفظ الألواح المشتركة | a convoy of THREE gaps: 152, 95, then 57 — announced as « the first minus the second »; planks 19 (fills the three), 8 (152 only), 5 (95 only), 3 (57 only): a plank that builds the first two always builds the third | tiles | a convoy of three bridges (the mechanic allows it; not tried) |
| 🪜 خوارزمية الفروق | the first two steps lived: after each crossing a storm cuts the longer gap by the shorter one (152 ; 95 → 95 ; 57 → 57 ; 38) | the `ladder/subtract` experiment carries the procedure to its end | the storm that cuts a gap (a storm exists; this use is new) |
| 🧮 الباقي يحفظ الألواح المشتركة | — | mirror (`ladder/fold`) | — |
| 🔁 خوارزمية إقليدس | — | mirror (`ladder/divide`) | — |
| ⏱️ أيّ الخوارزميتين أسرع | two workshops on one island, the subtractions' and the divisions'; a step costs a coin; the purse (2 coins for 1003 and 34) pays only the divisions (31 steps against 2) | tiles | the purse counting steps instead of planks |

**Lesson 6 — the road as it is built (2026-11-19; it SUPERSEDES the table above for 🪜, 🔁 and ⏱️)**

No new piece of the world: lesson 5's workshop and its BENCH carry the three procedures. Where the gaps are too long
for two lists, no plank is offered, and the purse pays only the longest plank, he NEEDS a procedure to know which plank
to make — and the workshop's bench is that procedure (the experiment `ladder`, played on the island, facts only).

| Islands | What happens | Numbers (to check against the bank) |
|---|---|---|
| A → B → C → D | convoy « diff » of THREE gaps, planks offered (no workshop): the third gap is announced as « the first minus the second » | 152, 95, 57; planks 19 (the three), 8 (152 only), 5 (95 only), 3 (57 only) |
| D: the mirror | forge ➖ `farq-yabqi` — a plank that builds two gaps builds the gap of their difference | — |
| D (workshop, bench `ladder/subtract`) → E → F | convoy « tarh » with a purse: he makes his plank; the bench takes the shorter gap away from the longer, again and again | 259 and 185 (37: 7 + 5 = 12 coins; the design's 119 and 85 is lesson 7's trap pair, 161 and 115 stands in the bank) |
| F: the mirror | forge 🪜 `khawarizmiyat-al-tarh`; then forge 🧮 `baqi-yabqi`, which KEEPS its experiment in the mirror (`ladder/fold`: the rows that take away the same gap folded into one division) | 962 and 296 for the fold |
| F (workshop, bench `ladder/divide`) → G → H | convoy « iqlidis » with a purse, long gaps | 1833 and 546 (39: 47 + 14 = 61 coins) |
| H: the mirror | forge 🔁 `iqlidis` | — |
| H (workshop, bench `ladder/both`) → I → J | convoy « sibaq » with a purse: on the bench he says first which procedure will be shorter, then both run | 1003 and 34 (17: 59 + 2 = 61 coins; 31 rows against 2) |
| J: the mirror | forge ⏱️ `aqall-khutuwat` — which procedure to choose (57 of the bank's 125 questions) | — |
| J → the dash → K → the last bridge → L | the dash on the five keys; the store: two lanes, the longest plank that fills both, the price | 1176 and 868: 28 (56 fills 1176 only), 85 دج a plank |

The storm that cuts a gap and the purse of steps (§7's « new pieces » for this lesson) are NOT built: the bench does
their work with what exists.

**Lesson 7 `awwaliyan-fima-baynahuma`**

| Key | The situation on the islands | Stays in the mirror | New piece |
|---|---|---|---|
| 🤝 عددان أوّليان فيما بينهما | a convoy 25 and 27 with planks 3, 5, 9 and 1: only the plank 1 builds both (52 coins); then 26 and 39, where 13 does | tiles; the pairs of §3 (44 ; 45, 85 ; 119, 13 ; 39) are the mirror's attacks | — |
| ✅ أثبت أنّهما أوّليان فيما بينهما (113 questions) | — | mirror (`ladder/divide` ending on 1, then the sentence of the proof) | — |
| ❌ أثبت أنّهما ليسا أوّليين فيما بينهما | a convoy 645 and 410 with the planks the divisibility rules give (2, 3, 5, 9, 10): ONE plank that builds both ends it; then 85 and 119, where none of them does — and the bridges still stand with 17, made in the workshop | tiles (one witness is enough; no witness seen proves nothing) | — |

**Lesson 7 AS BUILT (2026-11-20):** the pairs of the table above changed where a check refused them — 26 ; 39 → 39 ; 52 (the bank holds « 39 = 26 × 1 + 13 »), the proof's bench plays 35 ; 26, the mirror of ✅ keeps a two-round experiment (440 ; 301 ending on 1, 341 ; 176 ending on 11), the attack 13 ; 39 was replaced, the store's lanes are 105 and 74. Every last step ends on a yes/no conclusion.

**Lesson 8 — DECIDED 2026-11-19 (the owner, after a council of five advisors): it stays on the islands, with ONE bridge
and a marked stretch; the table below it is SUPERSEDED.** The gap is the whole; a stretch of it is marked (roofed,
lit); the fraction is that stretch over the whole bridge and a sign writes it. He builds with one kind of plank, and a
joint between two planks must fall exactly where the stretch ends — which happens only when the plank fills both
numbers. The sign then counts in planks (66 of 78 → 33 of 39 with planks of 2 → 11 of 13 with 6): the stretch has not
moved, only the writing. The four keys on that one situation: 🪜 in stages (a longer plank, the sign shortens again);
🔒 irreducible (25 of 27: every joint misses the mark but the plank 1's); 🎯 by the PGCD at once (a purse that only the
longest plank pays); 🧾 the result of a calculation (the stretch marked in two strokes, 5 then 8 of 39). New piece of the
world: a bridge with a marked stretch, the joint rule and the sign. NOT yet checked against the lesson's bank and board.
**The world piece is CODED (2026-11-19, `divisorIsles/mark.js` + `Game.js › buildMark`, the equation's second line, the
sign « لافتة الجسر »; unit-tested, not yet seen in a browser):** a segment declares `mark: 66` (and `strokes: [5, 8]`
for a stretch marked in two strokes); planks of `b` hold only when `b` divides the gap AND the mark; a plank that fills
the gap but misses the mark is shown (the post stands in the middle of a plank), then the bridge goes back.

**The road, checked against the bank (25 of 27 stands in the bank and is lesson 7's pair — replaced by 35 of 48):**

| Island | The bridge | Planks | What the world shows | Mirror |
|---|---|---|---|---|
| A → B | 78 cells, 66 lit | offered 2, 4, 6, 9 | 2 holds: the sign writes 66/78 = 33/39; 4 and 9 do not fill 78; rebuilt with 6: = 11/13. The instruction after the first hold asks for a SHORTER writing | 🪜 in stages (P1, 4 questions) |
| B → C | 48 cells, 35 lit | offered 3, 5, 7, 1 | 3 fills the gap and misses the mark (35 = 3 × 11 + 2); 5 and 7 do not fill; only 1 holds, and the sign does not change | 🔒 irreducible (P2, 9) |
| C → D, D → E | 99 cells, 66 lit, a purse of 3; then 216 cells, 168 lit, a purse of 9, a workshop whose bench is the division notebook | made in the workshop | only the longest plank is paid: 33 → 2/3 at once; 24 → 7/9 at once | 🎯 by the PGCD (P3, 94 — the richest last step: a fraction of the platform's own reduced in one line, typed with its fraction bar) |
| E → F | 39 cells, lit in two strokes: 5 then 8 | made in the workshop, a purse of 3 | the sign opens on 5/39 + 8/39 = 13/39; 13 → 1/3 | 🧾 the result of a calculation (P4, 42) |
| F → the dash → the store | the final mission: a fraction that a plain division cannot reduce (to design with the world's agent) | | | |

A new world for fractions (« أَحيِ الواحة », an oasis fed by a foggara — sketches in `mockups/oasis-world.html` with
three other ideas) was proposed and NOT retained: the council (four of five) found it unproven for fun, broken by large
numbers (a comb of 78 teeth), and a second world to maintain; no other fractions lesson is committed to either world,
and adding and multiplying fractions are expected to need a lighter representation (a number line, an area), to be
decided on evidence. First evidence wanted: a built lesson played by five or more real students.

**Lesson 8 `ikhtizal-kasr` — SUPERSEDED table** (two gaps one after the other are one fraction: the first the numerator, the second the denominator)

| Key | The situation on the islands | Stays in the mirror | New piece |
|---|---|---|---|
| 🪜 الاختزال على مراحل | a convoy 66 and 78; a sign over the two bridges writes the fraction counted in the planks laid: 66/78, with planks of 2 → 33/39; the next island shows the same two gaps counted in those planks, he picks again (3) → 11/13 | tiles; the second road (3 then 2, or 6 at once) is the mirror's test | the sign that re-writes the fraction in planks |
| 🔒 الكسر غير القابل للاختزال | — (the situation would be lesson 7's first key again) | mirror (`sort`, fraction cards) | — |
| 🎯 الاختزال بالقاسم المشترك الأكبر | a convoy 66 and 99 with a purse of 5 coins (2 + 3 planks of 33): one choice, the fewest planks, the sign writes 2/3 at once | tiles | the sign |
| 🧾 نتيجة حساب | — | mirror (`part`) | — |

### The three questions put to the owner, and his answers (2026-11-19)

**Answers: 1 — accepted (the same gesture may carry several keys, lesson 5's three included); 2 — agreed (the seven
keys stay in the mirror); 3 — yes (the six new pieces of the world are to be built).** Question 4 stays open.

1. **The same mechanic carries several keys** (a convoy with a purse: lesson 4 key 2, lesson 5's three keys, lesson 7
   key 1, lesson 8 key 3). What he discovers differs each time, but the gesture is the same. To accept, or to ask for
   a different situation where it repeats inside one lesson (lesson 5).
2. **Seven keys stay in the mirror** (the two algorithms and their comparison's ladders, the proof, the two
   classifications of fractions, the calculation): a procedure or a proof is not a constraint carried over two islands.
3. **Six new pieces** of the world would be built (the workshop's lists bench, a gap of 0 cells, a three-bridge
   convoy, the storm that cuts a gap, the sign of a fraction; a purse of steps): each is the owner's « go ».
4. The kinds written on 2026-11-19 for the keys that move to the islands (`summit`, `measure`, `common/witness`,
   `nest/pair`, `ladder/both`) would have no lesson to play them: kept for the mirror's tests where they fit, or
   deleted — to decide once the lessons are built.
