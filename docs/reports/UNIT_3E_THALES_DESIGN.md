# 3e — « Thalès et triangles semblables » — design of the unit's lessons

The unit `thales-et-triangles-semblables` (chapter `espace_geometrie`) has four lessons: `triangles-semblables`,
`thales-configuration-papillon`, `reciproque-de-thales`, `vers-le-brevet-thales-et-triangles-semblables`. They are
played on the world « Les pyramides » (`nile-pyramids`), designed and built FIRST in the Algerian platform
(`../smarter-academy-dz`, branch `feat/thales-pyramids`, `docs/reports/PYRAMIDS_WORLD_PLAN.md`) — « Test 2 » of
`docs/TWO_PLATFORMS_PLAN.md` §7. **Only lesson 2 is designed here** (the first French lesson on the world, as test 2
asks); lessons 1, 3, 4 are one line each in § 8.

## Lesson 2 — `thales-configuration-papillon` — « Thalès dans le papillon »

**Version 2, 2026-11-24, after gate A** (verdict « not passed as written »: 4 blocking defects, 16 notes — each answered
in § « Gate A, answered » at the end). Nothing is built. Every number is computed exactly by ONE script in the session's
scratch folder, `reports/proof3.js` (BigInt fractions; `node proof3.js` → « every line ok »), and checked PAIR BY PAIR by
`reports/pairs.js` / `pick.js` (§ 3 states the rule). No test, build, walk or browser was run (the machine's memory).

What binds (`npm run -s lesson:brief -- thales-configuration-papillon`): programme items `3e.m4.r05` (« Le théorème de
Thalès et sa réciproque dans la configuration du papillon sont énoncés et utilisés (démonstration possible, utilisant une
symétrie centrale pour se ramener à la configuration étudiée en quatrième) ») and `3e.m2.r09`; learning points
- `3e_thales-configuration-papillon_P1` — Reconnaître une configuration de Thalès en papillon et écrire l’égalité des
  trois rapports
- `3e_thales-configuration-papillon_P2` — Choisir l’ordre des longueurs dans les rapports selon la configuration,
  emboîtée ou en papillon ⇐ P1
- `3e_thales-configuration-papillon_P3` — Calculer une longueur dans une configuration de Thalès en papillon ⇐ P2

It stands on `4e.m4.r04` (Thalès in nested triangles, with its hypotheses and its converse) and `4e.m2.r09`
(proportionality in geometry, enlargement and reduction) — no 4e lesson exists on the platform, so the launch kit
measures them (§ 5) — and, as support, `5e.m4.r03` (central symmetry). The converse in the butterfly is lesson 3, never
here: K1's tablet states the DIRECT theorem only.

Target root here (« ⟶ » below): `apps/web/src/lessons/college/3e/espace_geometrie/thales-et-triangles-semblables/thales-configuration-papillon/`.
DZ lesson root (« DZ › »): `../smarter-academy-dz/apps/web/src/lessons/moyen/4am/handasa/khassiyat-talis/talis-hisab-atwal/`.
DZ world: `../smarter-academy-dz/apps/web/src/lessons/common/gameworld/nilePyramids/`.

### State of the Algerian side, and the order of work (decisions of 2026-11-24)

The DZ world and lesson are BUILT (commit `0864bbe5`) but **NOT WALKED** (the walk descriptor: « NOT RUNNABLE YET — the
world's walk handlers do not exist »; `GAME_WORLD.md` §2ter-4: « BEING BUILT, not validated »). **ONE world code, never a
French copy**: every change of the world below is made in DZ FIRST (the owner applies it there), then crosses to France
as a patch, and France adds only its text file. So the order is: DZ walk and owner's play → the four world changes of
§ « Engine changes » in DZ → the patch to France → the French lesson. Only the French BANK and class test can be written
before (they need no world code).

### 1. Port map (skill §1bis, P1–P5)

**P1 — the table.** `fr_dz_table.json`: `thales-configuration-papillon` ↔ `talis-hisab-atwal` (4AM), `partial`; FR P1 ↔
DZ P1, FR P3 ↔ DZ P2; FR P2 has no DZ point; DZ P3 (k) has no French point HERE. Its note « check the DZ lesson before
reuse » is answered: the DZ lesson covers the butterfly as key 🦋 (`wadiyat-al-farasha`) and 14 bank sheets.

**P3 — the cut.** DZ 🔑 (the nested configuration, its hypotheses) and the nested half of 📐 are what a French 3e student
OWNS from 4e (`4e.m4.r04`): not forged again; their stages 1 and 2 are not on France's map. 🦋 is the heart of the
French lesson (K1). 📐 is recast on mixed figures (K2). 🔍 k is lesson 1's (`triangles-semblables` P4): cut; its stage 4
is played as his own 4e reduction, and holds K2's table.

| DZ piece | Decision | Target | Conversion |
|---|---|---|---|
| **The world** `gameworld/nilePyramids/` (34 files: `Game.js`, `gestures.js`, `orders.js`, `logic.js`, `scenery.js`, `riverMeshes.js`, `figure.js`, `surd.js`, `ruleForge.js`, `forgeParts.jsx`, `Gauge.jsx`, `plan.js`/`InquiryPlan.jsx`, `halfturn.js`/`InquiryHalfturn.jsx`, `scale.js`/`InquiryScale.jsx`, `Inquiry.jsx`, `inquiryParts.js`, `practice.js`, `NilePyramids.jsx`, three css, tests) | **port whole, as ONE code**: cleaned and changed in DZ first (§ « Engine changes » W1–W4), then `scripts/engine-patch.mjs` | `apps/web/src/lessons/common/gameworld/nilePyramids/`, registered last in `worlds.js` | France writes ONE file, **`strings.fr.js`** (`DIR = 'ltr'`, no bidi isolates — `FRENCH_LANGUAGE_CONTRACT.md` §8; the world's nouns § 6; « m » after a no-break space; the decimal comma; `\parallel` in formulas, words in sentences — never « // »). `strings.js` re-exports the country's file; the patch list never names `strings*.js` |
| world numbers `logic.js › RIVER, CAPSTONE, PLATEAU, CAMERA_BOX` (FIELD and FACE are on docks France does not show) | **port as they are** (the world's geography) | same | disclosed in § 3 |
| the kind `halfturn` | **port** — it IS the programme's « démonstration … utilisant une symétrie centrale » — **with W3**: the line that rewrites the chain in the butterfly's own letters is hidden (`chainOwn: false`) | same | words only |
| the kind `plan` | **port + W4** (butterfly rounds, a length ACROSS the vertex) | same | — |
| the kind `scale` | **port, unused by this lesson** (kept for lesson 1) | same | words only |
| kit K-a (the sitting draws `statement.figure`), K-b (`GateRun` skin + hazards), K-c (decimal box, `ChoiceToken`, choice inside a fraction, claim `scale`), K-e (`kit/exact.js`, decimal-aware `authoring/test/bank.js` and `scripts/lesson-bank-numbers.mjs`), K-f (`WorldRuntime` hooks), `kit/sheetFigure.js`, `kit/trainerFigure.js`, `ClaimVerifier.php` + fixture | **port by hand, file by file** (K1 of § « Engine changes ») — the French kit has its own edits since the import (`RuleForge.jsx`, `Trainer.jsx`, `ExamSitting.jsx`, `forgeBlocks.js`, `suites.js`, `claims.js`, `rootCourts/logic.js`), so `engine-patch.mjs` refuses them | `apps/web/src/lessons/common/gameworld/kit/…`, `apps/api/…` | their tests with them |
| the board's figure station (`features/classSession/boardFigure.js`, `MemoFigures.jsx`, `LessonBoard.jsx`, `classSession.css`, `figureStation.render.test.jsx`) | **port by hand** | same paths | words |
| the QA preview `qa/nilePyramids/NilePyramidsPreview.jsx` (+ route) | **port** (development only) | same | — |
| the walk library's world players (`lessonWalk/worlds/nilePyramids.mjs`, `nilePyramidsExperiments.mjs`, `gateRun.mjs`) | **do not exist in DZ yet** — written there for the DZ walk, then ported | `apps/web/e2e/lib/lessonWalk/…` | — |
| DZ › key 🔑 `wadiyat-talis` and stage 1 « حقل النيل » | **cut** (owned 4e: the configuration and its hypotheses); dock 1 is not on France's map (W2) | — | — |
| DZ › key 📐 `hisab-tul` (`PLAN_INQUIRY`, nested) and stage 2 « ورشة البنّائين » | **recast as K2** (same kind, the plan writes the rule) on ONE nested round and three butterfly rounds; dock 2 not on France's map | ⟶ forge K2, `world/inquiries.js › PLAN_INQUIRY` | new figures (§ 3) |
| DZ › key 🦋 `wadiyat-al-farasha` (`HALFTURN_INQUIRY`, `TURN_RIVER`, tiles ONE × TWO, `forges.test.js` proofs) | **port as K1**, with its last step extended by the brevet's sentence (DZ plan §5) | ⟶ forge K1, `world/inquiries.js › HALFTURN_INQUIRY` | tiles in French; round 2, the crooked round, the two attacks renumbered (§ 3) |
| DZ › key 🔍 `muamil-k`, `SCALE_INQUIRY`, its last step, trainer questions, knowledge cards, the leg « k », the mission's line « k = 73 » | **cut** | — | — |
| DZ › stage 4 « حجر القمّة » (the capstone « كلّ طول × [k] ») | **played as his 4e reduction, no forge of its own**; its table holds K2 | — | its card states the pyramid's base (99 m), which DZ's stage 2 gave |
| DZ › `world/math.js` | **port** the shape; French groups (§ 3) | ⟶ `world/math.js` | — |
| DZ › `world/story.js` | **rewrite from its job**: `stages: ['river', 'summit', 'plateau']` (W2), `forges: { river: 'papillon', summit: 'calcul-depuis-le-sommet' }`, `mission` (morning, k line cut), `box` (§ 2) | ⟶ `world/story.js` | — |
| DZ › `world/run.js` | **port** the 🦋 leg (river → summit); **new** leg summit → plateau (across the vertex); DZ's two nested legs not used | ⟶ `world/run.js` | the duplicate-buoy test kept |
| DZ › `world/{practice,trainer,knowledge,evidence,journey,tablets,text,sitting}.js` | **port the structure**, content per French key | ⟶ `world/` | evidence: K1 → P1, P2; K2 → P2, P3 |
| DZ › `board/{script,memo,board.test}.js` | **port** the 🦋 and computing stations; cut 🔑 and 🔍 | ⟶ `board/` | the sentence in K1's station |
| DZ › class test `content/class-tests/4am/talis-hisab-atwal.json` | **port** start (fourth proportional; one nested length, renumbered) and pool `p3` (butterfly, re-checked); cut `p2`, `p5` (k) | ⟶ `content/class-tests/3e/thales-configuration-papillon.json` | French net items |
| DZ launch family `3am.m2.r03` (`launchkit/families.js`, activities `fourth`, `triangle`, `TRI_AVOID`) | **port** as the family of `4e.m4.r04` | ⟶ `launchkit/families.js` | `TRI_AVOID` rebuilt from § 3 |
| DZ lab instrument `rope` (`RopeTriangle.jsx`, `lessonlab/logic.js › ropeOf`, registry, css, test) | **port and tag** | ⟶ `lessonlab/tools/RopeTriangle.jsx` | « La corde et le triangle »; nested only: tells nothing of K1 |
| DZ bank (50 sheets) | **port 16, 34 new** | ⟶ `content/practice/3e/thales-configuration-papillon/level-1…5/` | § 4 |
| DZ walk descriptor `talis-hisab-atwal.walk.mjs` | **starting point** | ⟶ `apps/web/e2e/lessons/thales-configuration-papillon.walk.mjs` | § 6 |

### 2. §0ter — what he holds, what is new, the keys

**What 4e gave him** (owned, measured by the launch kit, never forged again): the nested configuration and its
hypotheses (M on [AB], N on [AC], (MN) ∥ (BC) ⟹ AM/AB = AN/AC = MN/BC); computing a length from it, with pieces
(AB = AM + MB); the fourth proportional; enlargement and reduction (× k). From 5e the half-turn; from 4e Pythagoras.

**What is NEW in 3e:**
1. the points stand ON THE OTHER SIDE of the vertex and the equality still holds; each length pairs with the one on the
   SAME LINE through the vertex, not the one that « faces » it on the drawing (P1, P2);
2. **the lengths on both sides of the vertex**: in the nested figure the big side is the WHOLE (AM + MB); in the
   butterfly it is the length beyond the vertex ALONE — the length across (AE = OA + OE) is never a term. One rule: every
   term is a length FROM THE VERTEX (P2, P3);
3. the brevet's sentence for the butterfly — both alignments through the vertex, the parallel, then the equality (P1,
   « écrire ») — a writing of the theorem he already owns in the nested case: it is K1's last step, not a key.

**Two keys, each at its own table** (the map shows three docks, sailed in this order: **dock 3 « La largeur du Nil » →
dock 4 « Le pyramidion » → dock 5 « L’ombre de la grande pyramide »**; W2):

| # | Key (id) | Points | Nature | Experiment (kind, mode) | Table | He holds when the forge opens |
|---|---|---|---|---|---|---|
| K1 | `papillon` « De l’autre côté du sommet » | P1, P2 | a reduction to the known case (a proof) | the river (a situation), then `halfturn` with `chainOwn: false` (W3) as the forge's `inquiry` | dock 3 | his river: SA 72, SE 9, ER 52, his ferry rope and its fact |
| K2 | `calcul-depuis-le-sommet` « Chaque longueur part du sommet » | P2, P3 | a procedure | `plan` on mixed rounds (W4); the plan writes the rule | dock 4, after the capstone | his river (and its 468 if he typed it), his capstone |

No (kind, mode) twice. No two forges at one table. Where each point is PROVEN (evidence and last steps): **P1** — K1's
tiles (the chain), K1's last step (the sentence and the three ratios), line 1–2 of the box; **P2** — K1's tiles (the
partner on the same line; the across ratio refuted), K2's plan (join in the nested round, cut across in the butterfly
rounds), K2's last step (the chosen ratio « OA / [OE] »); **P3** — K2's rounds and last step, the box's lines 3–4, the
leg summit → plateau, the bank.

#### K1 `papillon` — dock 3, then the mirror

- **Rule** (the direct theorem only): when (AE) and (BF) are secant at O and (AB) ∥ (EF),
  $\dfrac{OA}{OE} = \dfrac{OB}{OF} = \dfrac{AB}{EF}$; on the river's letters $\dfrac{SE}{SA} = \dfrac{SR}{SF} = \dfrac{ER}{AF}$.
- **The situation**: the ferry rope is cut BEFORE anyone crosses. He measures AS = 72, SE = 9, walks inland square to the
  bank until, in Zero's eye, S hides the far post F: ER = 52. He TYPES the rope: **ties** (416) · **falls short** ·
  **slack**. His 4e habit takes the whole length across the stake: 52 × 81 / 9 = **468** (slack); the inverted ratio
  **6,5** (short). No size is written in the world.
- **The experiment** `halfturn` (W3: the butterfly-letter line hidden): round 1 HIS river; round 2 a parallel butterfly
  I K L / P Q: IK 4, IP 7, IL 6, IQ 10,5, KL 8, PQ 14 (k = 4/7); round 3 the crooked one on the same small triangle:
  IP 6,5, IQ 8, PQ 11,5 (cos Î = −1/4, so PQ² = 6,5² + 8² + 2·6,5·8/4 = 11,5²; ratios 8/13, 3/4, 16/23). Before each
  turn he says where K lands, on (IP) or (IQ); the turned triangle lands inside the big one: his 4e figure, its gauge and
  the NESTED chain he owns. Writing it back in the butterfly's letters is his act — the tiles.
- **Tiles** (ported, 4 × 4 = 16; a rule says « these three ratios are equal exactly when the two sides are parallel »).
  Frame « Sur la rive : [premier rapport] = [deuxième rapport] = $\dfrac{ER}{AF}$ ».
  - Premier rapport: $\dfrac{SE}{SA}$ ✓ · $\dfrac{SE}{SF}$ (crossed partner) · $\dfrac{SA}{SE}$ (upside down) ·
    $\dfrac{SE}{EA}$ (across).
  - Deuxième rapport: $\dfrac{SR}{SF}$ ✓ · $\dfrac{SR}{SA}$ · $\dfrac{SF}{SR}$ · $\dfrac{SR}{RF}$.
- **Refutations** — all fifteen on round 2 (parallel: each claims « equal »), its three values written (`proof3.js`):
  SE/SA with SR/SA → 4/7, 6/7, 4/7; with SF/SR → 4/7, 7/4, 4/7; with SR/RF → 4/7, 4/11, 4/7; SE/SF with any → 8/21
  against 4/7; SA/SE with SR/SF, SR/SA, SR/RF → 7/4 against 4/7; **SA/SE with SF/SR → 7/4 = 7/4 but 4/7** and
  **SE/EA with SR/RF → 4/11 = 4/11 but 4/7**: true equalities between themselves, refuted by NAMING THE THIRD RATIO;
  SE/EA with the others → 4/11 against 4/7. Exactly one rule holds. On the river only the measured lengths are used
  (SR = √2785, SF = 8√2785 were never measured).
- **Attacks on the right rule**: O U V W T, OU 5, OW 7,5, OV 8, OT 12, UV 9, WT 13,5 (k = 2/3: equal); crooked on the same
  big triangle, OU 4, OV 2,5, UV 4,5 (cos Ô = 1/10, UV² = 16 + 6,25 − 2 = 20,25): 8/15, 5/24, 1/3 — not equal.
- **Last step** (the sentence, then the ratios, then one length): a new butterfly, (AE) and (BF) secant at O, OA = 4,2 m,
  OE = 7 m, OB = 5,1 m, EF = 9 m, (AB) ∥ (EF):
  « Les points [A], [O], [E] sont alignés, ainsi que les points [B], [O], [F] ; les droites [(AB)] et [(EF)] sont
  parallèles. D’après le théorème de Thalès : $\dfrac{OA}{[OE]} = \dfrac{[OB]}{[OF]} = \dfrac{[AB]}{[EF]}$. »
  (CHOICE tokens, K-c; every true writing is accepted: either triple first, the points of a triple in either order, the
  three ratios all inverted), then `OF = [8,5]` m (decimal box; k = 3/5).
- **Tablet**: « Le théorème de Thalès dans le papillon » (direct only), the sentence as a model, his line « Un demi-tour
  autour du point d’intersection ramène le papillon aux triangles emboîtés ». Then the story card on Thalès de Milet and
  the pyramid's shadow (the 2026 programme's « repères historiques »).

#### K2 `calcul-depuis-le-sommet` — dock 4's table

- **Rule** (written by the plan; 130 characters, under the 145 of `ruleText`): « Chaque longueur part du sommet : je
  recolle les morceaux ou j’enlève celui d’en face, puis je garde deux rapports avec l’inconnue. »
- **Nature**: a procedure. `plan` WRITES the rule (`inquiry.writes`); one option per column; false procedures refused
  where he makes them, then the mirror attacks.
- **Rounds** (three ratio cards, the join/cut tool along a side or across the vertex, the typed unknown):
  1. HIS river (butterfly): AF = **416**; across EA = 81 → 468 (too long); inverted 6,5 (too short).
  2. ONE nested round (the contrast): AM 2, MB 4, BC 16,5 → AB = 6 (join), MN = **5,5**; the piece gives 8,25, the
     inverted 49,5 (too long).
  3. Butterfly O A B E F (k = 2/5): OA 9, AE 31,5 (ACROSS), AB 5 → OE = 22,5 (cut across), EF = **12,5**; the across
     gives 17,5 (too long), the inverted 2 (too short).
- **Attacks**: (a) the same butterfly, the unknown across: OA 9, OE 22,5, OB 11 → OF = 27,5, BF = **38,5** (typing 27,5
  falls short); (b) the nested figure, the unknown a piece: AB 6, AM 2, AC 13,5 → AN = 4,5, NC = **9** (typing 4,5 falls
  short).
- **Last step** (the exam's shape): (AB) ∥ (EF), (AE) and (BF) secant at O; OA = 4 cm, AE = 10 cm, OB = 5 cm,
  EF = 4,5 cm. First « $\dfrac{OA}{[\,\cdot\,]}$ » with the choice [OE · AE · OF · EF] (P2's verb: he CHOOSES), then
  `OE = [10] − [4] = [6]`, `OF = [7,5]`, `AB = [3]` (k = 2/3). The across errors give 12,5 and 1,8; no additive slip
  (OB + OE, EF − OE, …) gives 7,5 or 3.
- **Tablet**: his plan, « Calculer une longueur dans le papillon ».

#### The final mission — dock 5

- **Morning (warm-up: his 4e tool + K2's join)** — the DZ stage: stick 2 m, its shadow 3 m, the pyramid's shadow 104 m
  from its base edge, base 230 m; card `AB = [104] + [115] = [219]`, « (MN) et (BC) sont parallèles car [toutes deux
  verticales] », `[3] / [219] = [2] / h ⟹ h = [146]`; Zero rises (apex · below · above). DZ's line « k = 73 » is cut.
- **Noon — the decisive card (`story.box`), the box stays where the world puts it** (no world change): « La chambre
  noire d’Ibn al-Haytham est posée à 177 m du bord de la pyramide ; son trou O est à 0,5 m du fond. Quelle hauteur de
  feuille faut-il au fond pour que l’image de la pyramide la remplisse exactement ? » Schematic `GeoFigure` (« figure non
  à l’échelle »), points S (apex), H (centre of the base), S′, H′ (their images on the back wall). Lines, all in metres:
  1. « Les points S, O, S′ sont alignés, ainsi que [H], O, [H′] ; (SH) ∥ (S′H′) car [toutes deux verticales] » (K1's
     sentence);
  2. « D’après le théorème de Thalès : $\dfrac{[OH′]}{[OH]} = \dfrac{[S′H′]}{[SH]}$ » (K1's pairing);
  3. `OH = [177] + [115] = [292]` (K2: OH starts at the vertex O and runs to the axis — the half base is added);
  4. `S′H′ = [0,5] × [146] / [292] = [0,25]` m (K2).
  Facts (`check`, the sheet he cut against the image): **remplit la feuille** (0,25) · **la feuille est trop grande**
  (the half base forgotten: 73/177 ≈ 0,41; the inverted ratio: 1) · **l’image déborde** (the whole base instead of the
  half: 73/407 ≈ 0,18). The image's 0,25 m is written nowhere before the card (a check for the world agent).
- **Honestly**: the box cannot test the length ACROSS the hole — taking OH + OH′ = 292,5 as the term gives 0,2496 m,
  0,4 mm short: physically true, too small to be a lesson's fact, so it is NOT one of its designed distractors (the world
  answers it truthfully with « déborde »). « Across » is proven by K1's tiles, K2's rounds 1 and 3, attack (a), K2's last
  step and the leg summit → plateau.
- **Can it be won without the lesson?** With 4e only: the morning card yes (it is the warm-up, owned); the box needs the
  butterfly pairing (K1), the sentence's two alignments (K1's last step) and OH from the vertex (K2). The butterfly chain
  can be guessed; the cut at the axis and the sentence are not.

### 3. Numbers

**The rule applied (decided once, stricter than `lesson-bank-numbers.mjs`, which checks a pair only in a group of two):**
a pair is forbidden when its two numbers stand together on ONE SHEET of a French bank (both banks, and the 16 ported
sheets planned in § 4), in ONE item of a French class test, or on ONE source line of another French lesson's files
(world, board, trainer). Tracked numbers: every integer ≥ 10 and every non-integer; integers under 10 stand in every
sheet and are not tracked. Every group below was run PAIR BY PAIR (`pairs.js`, 4 098 forbidden pairs from 423 lines) and,
inside the lesson, against every other group and the planned bank. Most new figures are in metres with one decimal: the
integers of two digits are the arithmetic lessons' land (their multiples fill every sheet).

| Group | Numbers | Pairwise |
|---|---|---|
| river (world) | 72, 9, 52, 416 · 81, 468, 6,5 never written | CLEAR |
| capstone (world, dock 4) | 99, 2,75, 2,5 · « 1/36 » typed by him | CLEAR (the edge 90 is not shown in France) |
| K1 round 2, crooked round | 4, 7, 6, 10,5, 8, 14 · 6,5, 8, 11,5 | CLEAR (was 35, 49, 63 / 50, 70, 90: « 49 ; 63 » is PGCD l1-003's title) |
| K1 attack, crooked attack | 5, 7,5, 8, 12, 9, 13,5 · 4, 2,5, 4,5 | CLEAR (was 26/32/14 – 65/80/35 and 18/39/24: « 39 ; 65 » PGCD l2-001, « 26 ; 39 » l4-001) |
| K1 last step | 4,2, 7, 5,1, 9 → 8,5 (5,4) | CLEAR |
| K2 nested round, attack (b) | 2, 4, 6, 4,5, 13,5, 9, 5,5, 16,5 · errors 8,25, 49,5 | CLEAR |
| K2 butterfly round, attack (a) | 9, 11, 5, 22,5, 27,5, 12,5, 31,5, 38,5 · error 17,5 | CLEAR (was 17, 51, 13, 39, 19, 57: PGCD and « décomposer » land) |
| K2 last step | 4, 10, 5, 4,5 → 6, 7,5, 3 · errors 12,5, 1,8 | CLEAR |
| mission | 2, 3, 104, 115, 219, 230, 146 · 177, 292, 0,5, 0,25 | CLEAR as pairs |

**World numbers that stay, disclosed** (the world's geography, one code with DZ): **104** stands alone in PGCD l3-001
and l5-001 (« PGCD(156 ; 104) = 52 »); **52** (the river's ER) is in the same two sheets, never beside 104 on a French
screen of this lesson (different docks); **115** (half the base) is in the PGCD class test (« 299 = 115 × 2 + 69 »);
**72** is the river's AS and stands in « décomposer »'s story (« 72 » with 16 there — 16 is not shown here, the field
is gone). **133** (the sum of the river's data) and **584** are never written.

Within the lesson, the k are 4/7, 2/3 (attack and K2 last step, at two different docks), 3/5, 1/3, 2/5, 1/8 (river),
1/584 (box). Small overlaps between forges (4,5 in K1's crooked attack and K2's nested figure; 7,5 in K1's attack and
K2's last step) are at different docks and never in one figure.

### 4. Bank plan — 50 exercises, 10 per palier, brevet part 1 = 25, part 2 = 25

Sources: `../smarter-academy-dz/content/practice/4am/talis-hisab-atwal/level-<n>/ex-4am-talis-hisab-atwal-l<n>-<nnn>.json`.
A ported sheet: `source: { type: "platform_addition", reason: "dz_port", learningPoint, adaptedFrom }`, `exam.kind:
"adapted"`, no badge. A new sheet: `source: { type: "platform_addition", reason: "practice_generation", learningPoint }`.
Every DZ question on k is CUT; « Écris les trois rapports » (DZ `selfCheck`) becomes a `choice` among four equalities.
Figures are DATA in the DZ shape `statement.figure = { points, segments: [{ from, to, label, arrows }], labels?,
rightAngles?, caption?, ariaLabel, maxWidth }` (French `ariaLabel`, decimal comma, « Figure non à l’échelle »).
Misconceptions: `MISC-THALES-RAPPORT-INVERSE`, `MISC-THALES-MORCEAU`, `MISC-THALES-A-TRAVERS` (new),
`MISC-THALES-PARTENAIRE-CROISE` (new), `MISC-THALES-SANS-PARALLELE` (new), `MISC-THALES-ADDITION`.

**The 16 ported sheets, their primary point:** `l1-002` P1 (ratios; EF = 4,8) · `l1-008` P1 (OL/OQ = 2/3; PQ = 3,6) ·
`l2-002` P3 (x = 4, y = 6) · `l2-007` P3 (AB = 4, OD = 5) · `l2-008` P3 **renumbered in cm**: OA 3, OB 2, OC 3,3,
BD 2,6 → OD = 2,2, AC = 3,9 · `l3-002` P3 (AC′ 2,25, B′C′ 1,5; q3 k cut) · `l3-003` P3 (EW 3,15; WT 3,5 by Thalès; q2 k
cut) · `l3-004` P3 (OF 4/3, GH 6; q3 k cut) · `l3-005` P3 (10/3, 20/3) · `l3-007` P2 (Pythagoras, then nested: BM 20/3,
EM 16/3) · `l3-010` P2 (Pythagoras, then nested: EL 2, KL 1,5) · `l4-002` P2 (the butterfly in a parallelogram;
CN = CD + DN) · `l4-003` P1 (converse of Pythagoras → (BD) ∥ (AF) → AF = 7,425) · `l4-005` P3 (OD 5, CD 10; q3 k cut) ·
`l5-001` P3 (the valley 40 m; the footbridge in plausible euros) · `l5-006` P3 **renumbered**: the folding table OA 31,
OD 46,5, OC 37,5, AB 38 → DC = 57, OB = 25; legs 77,5 and 62,5 cm, so 25 tables need 25 × (77,5 + 62,5) cm = **35 m**
(q3 k cut). P1 3 · P2 3 · P3 10.

| Palier | brevet | Ported | New (primary point) |
|---|---|---|---|
| 1 | part 1 ×10, no calculator | `l1-002`, `l1-008`, `l2-002`, `l2-007` | papillon, emboîtée ou aucune (P1) · the three ratios in a turned figure (P1) · « complète le rapport » (P2) · AE given → OE first (P2) · two integer lengths (P3 ×2) |
| 2 | part 1 ×10 | `l2-008`*, `l3-005`, `l3-002`, `l4-005` | a figure with no parallel: « on ne peut pas » (P1) · vrai/faux on the crossed partner (P1) · « complète le rapport » (P2) · across given (P2) · two decimal lengths (P3 ×2) |
| 3 | part 1 ×5, part 2 ×5 | part 1: `l3-004`; part 2: `l3-003`, `l4-002`, `l3-007` | part 1: the ratios with other letters (P1) · vrai/faux on OA/AE (P2) · « complète le rapport » in a figure holding both configurations (P2) · a decimal length (P3); part 2: « Justifier puis calculer » (P1) · two steps (P3) |
| 4 | part 2 ×10, calculator | `l4-003`, `l5-001`, `l5-006`*, `l3-010` | the full sentence + a length (P1) · a figure with both configurations (P2) · a « compas de réduction » (P3) · an ironing board (P3) · Pythagoras then the butterfly (P3) · two cables crossing on a footbridge (P3) |
| 5 « Défi » | part 2 ×10 | — | the sentence (P1 ×2) · across + mixed figure (P2 ×2) · real situations (P3 ×6: a projector's lens and its screen, a folding chair, a scissor lift, a tent's crossed poles, a sighting across a pond, a lamp through a window frame) |

Totals: **16 ported, 34 new**; primary points **P1 12 · P2 12 · P3 26** (new: P1 9, P2 9, P3 16); part 1: 10 + 10 + 5 =
**25**, part 2: 5 + 10 + 10 = **25**. `l5-001` uses the river stage's method (other numbers, place, question —
disclosed). The bank agent runs `pairs.js` on the finished bank (each new sheet against § 3 and the other banks).

### 5. Class test, warm-up family, lab instrument

- **Class test** `content/class-tests/3e/thales-configuration-papillon.json`: `start` = the fourth proportional
  (`4e.m2.r09`) and one nested length (`4e.m4.r04`, DZ `p1` renumbered); `pool` = the butterfly length (DZ `p3`, re-checked),
  the across trap, the crossed partner, the sentence's missing alignment, a two-step length. Every number run by
  `pairs.js` (the PGCD class test is in its lines).
- **Warm-up family**: ONE, net item **`4e.m4.r04`** (the DZ family of `3am.m2.r03`, activities `fourth` and `triangle`;
  `TRI_AVOID` rebuilt from § 3). `5e.m4.r03` (support) gets none: the half-turn shows its turn.
- **Lab instrument**: « La corde et le triangle » (DZ `rope`), tagged to this lesson; nested only.

### 6. The walk's outline

| # | Screen | What the student does | What the walk checks |
|---|---|---|---|
| 1 | Title → the map | three docks only (W2) | `data-np-dock` × 3; Zero at dock 3 |
| 2 | Dock 3 « La largeur du Nil » | AS 72, SE 9, inland to the sight (`data-np-sight`), ER 52; types 468 (slack), then 416 (ties) | the sight hides F; no size written; the instruction teaches the rope here (first dock) |
| 3 | Dock 3's table — K1 | `halfturn` ×3 (prediction, turn) → tiles (16) → mirror → attacks → seal → sentence + ratios + OF 8,5 → tablet, the Thalès card | after each turn NO line in the butterfly's letters (W3); the two true pairs refuted by the third ratio; the world's sentences hold no « papillon » before the tablet (the lesson's title does — the check is scoped to the world) |
| 4 | Felucca dock 3 → 4 | four butterfly buoys, crocodiles | one right buoy per wave |
| 5 | Dock 4 « Le pyramidion » | the capstone « chaque longueur × [1/36] » (owned) | sits; the card states the base 99 m |
| 6 | Dock 4's table — K2 | `plan`: rounds 416, 5,5, 12,5 (the across once: too long) → attacks 38,5 and 9 → seal → the chosen ratio, 6, 7,5, 3 → tablet | join across / cut across (W4); decimal box |
| 7 | Felucca dock 4 → 5 | four buoys (across the vertex) | — |
| 8 | Dock 5, morning | stick, shadows, slide; card 219, « verticales », 146; Zero rises | at the apex |
| 9 | Dock 5, noon — the box | lines 1–4; 292, then 0,25 | « remplit la feuille »; 0,25 written nowhere before |
| 10 | End | — | two tablets in « Mes règles » |

New screens for the eyes: one of each dock, the halfturn without its own-letter line, the plan on a butterfly, the box
card, the three-dock map.

### 7. What of the world France does NOT use

Docks 1 and 2 (the field, the workshop) and their legs; the forges 🔑 and 🔍, their tiles, last steps, tablets and
cards; the kind `scale` and the claim `scale` (ported, unused); the leg « k » and the mission's « k = 73 »; DZ's box card
(« confirm the height ») — replaced; the DZ bank's 34 other sheets (nested only — 4e; k; trigonometry).

### 8. The unit's other lessons on this world (one line each)

- `triangles-semblables` (lesson 1, before this one): docks 2 and 4 (courses and capstone, the same shape) and the kind
  `scale` (k and 1/k) — its own stage list.
- `reciproque-de-thales`: dock 1 « Le champ du Nil » at the next flood — he stakes a NEW canal, parallel only when the
  ratios are equal AND the points stand in the same order; a butterfly stake on the wrong side is the trap; it builds on
  K1's crooked rounds (the contrapositive) and extends K1's sentence.
- `vers-le-brevet-thales-et-triangles-semblables`: no key; the docks become mission docks with brevet problems.

### Engine changes (each in DZ FIRST, then the patch to France; the DZ lesson declares all five stages and is unchanged)

| # | Change | Files | Lines (tests apart) | Owner |
|---|---|---|---|---|
| W1 | **Clean-up: the words leave the code** — Arabic in 26 files besides `strings.js` (comments to English; `ruleForge.js › THALES_TEXT`, the `ariaLabel` of `figure.js` l. 149, `InquiryHalfturn.jsx` l. 38, `InquiryScale.jsx` l. 44 into `strings.js`; the three hard-coded `dir="rtl"` of `InquiryHalfturn.jsx` read from `DIR`); `strings.js` → `strings.ar.js` + a re-export | the world's folder | ~250 touched + tests | DZ, an `opus` agent; the owner applies |
| W2 | **The stage list from the story** (`story.stages`, default the five): the map shows only those docks; `STAGE_IDS` and the ~12 places that read a stage by index (`at === 4 / 3 / 1 / 0` for the sun and the shadow box, the tables, the stakes, `legs[i]`, the recall), the save, the practice trips | `Game.js`, `NilePyramids.jsx`, `practice.js`, tests | 100–200 | DZ, main session (the 3D) |
| W3 | **`halfturn` option `chainOwn: false`**: no line in the butterfly's own letters after the turn (protects the DZ lesson's 🦋 too) | `InquiryHalfturn.jsx`, `kinds.render.test.jsx` | ~3 + a test | DZ, with W1 |
| W4 | **`plan` on butterflies**: `SIDES` per kind; `withPieces` gives a butterfly its across lengths under their OWN keys (`VMB`, `VNC`, never `MB`); a label for an across length in `figureSpec`; the laid fact's words for a line from the vertex | `plan.js`, `figure.js`, `InquiryPlan.jsx`, `kinds.test.js` | 60–100 | DZ, an `opus` agent |
| K1 | the kit pieces K-a…K-f, `sheetFigure`, `trainerFigure`, the board's figure station — **ported by hand into France** (France's kit diverged) | France's kit | as in DZ | France, an `opus` agent |
| — | `strings.fr.js` | France | ~300 | France, `sonnet` |

No « two forges at one table », no new kind, no new mode.

### 9. Open questions for the owner

None left by this design: the clean-up (DZ first, one code) and the map (only the lesson's docks) were decided on
2026-11-24. The order of work (§ « State of the Algerian side ») depends on the DZ walk and the owner's play.

### Gate A, answered

| # | Gate A's defect | The fix in this page |
|---|---|---|
| B1 | K3 « citer » forged again 4e's hypotheses, had no act, held tiles nobody believes, broke the tile limits, needed an undrawable figure | **no K3**: the brevet sentence is K1's last step (choice tokens, every true writing accepted — N7) and line 1 of the box; no new figure, no E1; two keys; where P1–P3 are proven is listed (§ 2) |
| B2 | `halfturn` printed SE/SA, SR/SF, ER/AF before the tiles | W3 `chainOwn: false` (DZ first; it protects the DZ lesson too); the walk checks the line is absent |
| B3 | « CLEAR » was not pairwise; « 49 ; 63 », « 39 ; 65 » and more; 115 and 52 undisclosed | the rule stated (§ 3); every group run pair by pair against both banks, both class tests, every French lesson file and the planned bank; K1 round 2, crooked round, both attacks, both K2 figures, K2's last step and both renumbered sheets renumbered; 104, 52, 115, 72 disclosed |
| B4 | contradicted the decisions (the map, the clean-up) and did not cost the stage list | three docks, sailed 3 → 4 → 5, each key at its own table, no new engine piece for that; W2 costed (100–200 lines, DZ, main session); the clean-up is W1 in DZ, one code; § 9 questions removed |
| N1 | the box cannot carry « across » | said honestly; across proven elsewhere (listed); the 176,5 distractor removed |
| N2 | the box stands at 177 m, then the card asked where to put it | the card now GIVES 177 and asks the sheet's height (0,25): no world change |
| N3 | 25 cm / 50 cm against 0,25 / 0,5 | every length of the card in metres |
| N4 | K2 never makes him CHOOSE the order; too many nested rounds | one nested round; K2's last step opens on « OA / [ ] » with the choice OE · AE · OF · EF |
| N5 | K2's rule 297 characters | 130 characters |
| N6 | K1 states the contrapositive of the converse | the tablet states the direct theorem only; lesson 3 builds on the crooked rounds (§ 8) |
| N7 | the sentence has several true writings | all accepted (§ 2, K1's last step) |
| N8 | « S, O, s » | S′ and H′ |
| N9 | palier 3 was 4 / 6 | 5 / 5 (one new sheet moved to part 1); the bank is 25 / 25 |
| N10 | points of the ported sheets unknown; new sheets' source | each ported sheet's point listed; new sheets `practice_generation` |
| N11 | the wood line had no formula | 25 × (77,5 + 62,5) cm = 35 m, legs OA + OD and OB + OC |
| N12 | E1 | not needed any more |
| N13 | `plan`'s key `MB` would mean two things | across lengths under their own keys (W4) |
| N14 | 26 files, three `ariaLabel`, three `dir="rtl"` | W1 names them |
| N15 | « papillon » is in the title | the walk's check is scoped to the world's sentences |
| N16 | « // » or `\parallel` | `\parallel` (∥) in formulas, words in sentences, never « // » |

Gate A's second reading is owed on this version.

### As built (2026-11-24) — what changed from this page while building

- **Numbers moved off the bank** (pairwise collisions found while building): K1's crooked attack OV 2,5 → **3,9**, UV
  4,5 → **5,3** (OU 4 and the big triangle unchanged; « 7,5 ; 2,5 » stood on l3-007). K2's last step OB 5 → **5,8**, EF
  4,5 → **6,9**, so OF 7,5 → **8,7**, AB 3 → **4,6**, and the errors become **14,5** and **2,76** (« 4,5 ; 1,8 » stood
  on l2-008; F3's 12,5 is gone with it). The table of § « Numbers checked » above keeps the values as designed.
- **F1**: each triple of points of K1's last step is ONE choice token; « ratios all inverted » deleted. The sentence has
  no « D’après le théorème de Thalès » (no name before the tablet); the tablet carries the whole sentence.
- **W3** shipped the other way round: `halfturn` prints no chain by default (`chainOwn: true` to show it), so K1 sets
  nothing.
- **P2** is proved by ANSWERS of both keys (`world/evidence.js › ANSWER_POINTS`, read by `scripts/validate-lessons.mjs`),
  not by a key: the kit maps one key to one point.
- Dock 2 (not on France's map) is named « Le chantier des bâtisseurs » in `strings.fr.js` (« atelier » is the math lab).
- Walked at 1366×768: story 962 ok, hub 278, trainer 557, board 248, launch 165, sitting 2595 — 0 FAIL. The board's
  count of checked relations went from 14 to 9 when its two long proofs were cut to fit beside their figures.
