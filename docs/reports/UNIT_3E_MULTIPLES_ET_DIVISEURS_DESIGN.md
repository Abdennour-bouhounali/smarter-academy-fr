# 3e — « Multiples et diviseurs » — design of the unit's lessons

One page per unit (`.claude/skills/lesson-v2/SKILL.md` §2, step 1). World: `divisor-isles` (« L'archipel des
diviseurs »), DZ 4AM unit 1's world, by the owner's word. Written 2026-11-23 by the main session, BEFORE any code:
everything below is a plan until the lesson's line in `FRANCE_REBUILD_PLAN.md` §9 says built.

## Lesson 1 — `decomposer-en-facteurs-premiers` — « Décomposer un nombre en facteurs premiers »

### Port map (skill §1bis)

DZ has NO prime-factorisation lesson (its unit excludes it on purpose). Nothing ports whole.

| DZ piece | Decision | Target |
|---|---|---|
| `qawasim-adad-tabii` key 3 — the STOP experiment (kind `pairs`) and its forge (« le carré de la planche ⩽ le fossé »), claim `stop` | **port**, numbers changed | key 3 |
| `qawasim-adad-tabii` key 4 — the divisibility lens (`chart`) | **cut** as a key (5e–4e in France); the rules for 2, 3, 5 come back in the warm-up | warm-up |
| `bahth-pgcd` — the `ladder` notebook layout (mode `divide`) | **port the layout** into a new mode `factor` (one number, not two) | keys 1 and 4 |
| exercises with factored numbers: `qasim-adad-tabii` l3-005, l4-001, l4-006, l4-007; the decomposition steps of `3am/adad-natiq` (13 files); one of `4am/mada-wasit-mutawassit` | **port as `adapted`**, rewritten | the bank |
| instruments `divisors`, `rules`, `paper` (already here, untagged) | **reuse** | the lab |
| every PGCD and fraction key | **cut** → lessons 2 and 3 | — |
| prime factorisation itself, powers typed, a tool for large numbers, a factorisation answer and claim, a board station, a lab instrument | **DZ lacks them — built new**, same world | below |

### What is new for the student

The 4e programme already says « décompose un nombre entier en produit de facteurs premiers » (`4e.m1.r06`), but no 4e
lesson exists here and the 3e points list the procedure again: the lesson forges it, quickly, then spends its weight
on what 3e adds — certainty (when may I stop?) and large numbers with a tool.

### The keys

| # | Key (id) | Rule the student forges | Nature | Experiment (kind, mode) | Wrong rules the numbers refute | Point |
|---|---|---|---|---|---|---|
| 1 | `plus-petit-premier` | Divide by the smallest prime that works, AGAIN while it works, then the next one, until the quotient is 1 | a procedure | `ladder`, NEW mode `factor`: one gap; he lays the plank of his choice, the gap shrinks to the quotient. Rounds 60, 72, 495 | « one division per prime, then move on » (72: after one 2, 36 is still even); « try 4, 6, 9 too » (once 2 and 3 are used up they never hold: he sees it on 72 and 495); « start anywhere » (495: 2 fails, the order matters for losing nothing) | P1 |
| 2 | `puissances` | A factor written n times is written once with the exponent n | a writing convention | none (a convention has no honest experiment): the mirror tests his writing on the ladders he made at key 1 | 2³ read as 2 × 3 (72 = 2³ × 3² is not 6 × 6… and 2 × 3 × 3 × 2 = 36); the exponent put on the wrong factor | P2 |
| 3 | `arret` | A number with no prime divisor p such that p² ⩽ n is prime: stop there | a maximum with a reason to stop | `pairs` (ported). Gaps 91, 97, 221 | « 91 is prime » (7 × 13); « try up to n » or « up to n ÷ 2 » (97: nothing after 9 can work — its partner would be smaller than 10 and was already tried) | P1, P3 |
| 4 | `tableur` | For a large number, let the tool compute the remainders; read the first 0, divide, start again on the quotient | a search with a tool | NEW kind `sheet`: a spreadsheet-like table — column A the primes, column B « =MOD(n ; A) » filled by the world; he picks the line, the number becomes the quotient. Numbers 2 431, 4 641, 3 127 | « a big number that ends in 1, 3, 7, 9 is prime » (2 431 = 11 × 13 × 17); « the table must go up to n » (3 127 = 53 × 59: it stops at 53) | P3 |

- What he holds when each forge opens: key 1 — the planks he laid on the first islands; key 2 — his own ladders of
  key 1; key 3 — the quotient 91 left at the bottom of a ladder that he could not break; key 4 — the stop rule, and a
  gap too long to try by hand.
- No sentence, tile, hint or label says « facteur premier », « décomposition » or « puissance » as a RULE before its
  seal; « nombre premier » is a word he has (5e–4e) and may be used.
- Last steps (`use`): key 1 — fill the ladder of 126; key 2 — type 1 400 = 2³ × 5² × 7 (NEW: an exponent box);
  key 3 — verdict yes/no « 143 est premier » then its two factors; key 4 — the decomposition of 4 641 typed.
- **Final mission** (the existing `boss` bridge): a gap announced only as « 2³ × 3² × 7 cases », two planks, 36 and 48.
  Only a student who decomposes 36 = 2² × 3² and 48 = 2⁴ × 3 can choose without computing 504; the distractor 48 is
  the error « the same primes are there, so it divides ». It needs keys 1 and 2; it also opens lessons 2 and 3.
- Cut from this lesson, on purpose: the factor TREE and the uniqueness of the decomposition (not a 3e point; a
  candidate for the lab instrument), the divisibility rules as a key.

### Numbers (reserved for this lesson)

Ladders 60, 72, 495, 126; powers 72, 1 400; stop 91, 97, 221, 143; tool 2 431, 4 641, 3 127; mission 504, 36, 48.
The bank's headline numbers must differ from these.

### New engine pieces (skill step 2 — the owner's « go » of 2026-11-22: same world, same engine, same kit)

| Piece | Where |
|---|---|
| `ladder` mode `factor`; kind `sheet` | `gameworld/divisorIsles/` |
| an exponent box in a forge's last step (`{pow:{base, exp}}`) | `gameworld/kit/` (`RuleForge`, `forgeBlocks`, the authoring suites) |
| claims `factorization` and `prime` | `kit/claims.js`, `ClaimVerifier.php`, the shared fixture |
| practice answer type `factorization` (canonical `2^3*3^2*5`: primes increasing, exponent 1 omitted) | `packages/core/practice/answerEvaluator.js`, `AnswerEvaluator.php`, the shared outcomes, the practice input |
| a board station and a lab instrument « l'échelle des facteurs » | `LessonBoard`, `lessonlab/` |

### The bank first

50 exam-format exercises (10 per « palier »), every one tagged `brevet` and `calculator`: paliers 1–3 mostly brevet
part 1 (automatisms, no calculator: « 84 = 2² × 3 × 7, vrai ou faux », decompose 90, is 51 prime); paliers 4–5 brevet
part 2 (problems where decomposing is the tool, calculator allowed). Sources: the DZ exercises of the port map as
`adapted`; brevet-modelled ones marked « Sur le modèle du brevet <année> » ONLY from a paper filed in
`docs/curriculum/officiel/` — otherwise `adapted`.

### What the bank showed (2026-11-23, after it was written: 50 exercises, primary points P1 65 · P2 44 · P3 23)

Three things a student must be able to DO that the four keys above did not carry — the design is corrected, not the
bank:

1. **Reading a decomposition as a tool** (does 12 divide 2³ × 3² × 7? what is the quotient? is it a square?) carries
   paliers 3–5, and the error « the same primes are there, so it divides » appears in 8 questions. It is not a fifth
   key (comparing exponents is forged in lesson 2, where it gives the PGCD): here it is what key 2 is FOR — key 2's
   last step ends on one such reading, the trainer's ladder holds reading questions from its third stage, and the
   final mission (36 or 48 into 2³ × 3² × 7) is its test. The perfect-square reading stays in the bank only, as a
   palier-5 problem.
2. **Following a program** that tests divisors (5 of the 10 palier-4 sheets): key 4's experiment stays the
   spreadsheet, but its last step and the trainer's key-4 questions include a short program in French blocks whose
   trace the student completes (which divisor does it try next, when does it stop).
3. **Where to stop** (p² ⩽ n) is nowhere in the 3e attendus or repères `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`: it
   is taught because deciding « this quotient is prime » is impossible without it. Key 3 stays.

## Lessons 2–5

Lessons 2, 3 and 4 are designed and built (sections below); lesson 5 (the unit's synthesis) is not designed yet. Port sources are in `docs/curriculum/net-3e/fr_dz_table.json` and the plan's log of 2026-11-23.

## Lesson 2 — `trouver-le-pgcd` — « Trouver le PGCD de deux nombres »

Designed BEFORE any code for « Test 1 » of `docs/TWO_PLATFORMS_PLAN.md` (§7). **Version 2, after gate A** (verdict
« pass with corrections »: 2 blocking, 8 should-fix, 6 notes — each answered in § « Gate A, answered » at the end of
this section). The designer's working notes — the inventory of the Algerian files, the computations, the alternatives
rejected, the doubts — are in the session's scratch folder, `reports/pgcd-design-notes.md`; every computation is ONE
script beside it, `proof.js` (`node proof.js` → « every line ok », printed once, at the end). Everything below is a plan.

### Port map (skill §1bis, steps P1–P5)

The table gives three DZ 4AM lessons (all v2, built, walked, played): `qasim-mushtarak-akbar` (« what the PGCD is »),
`tayin-pgcd` (« finding it by lists »), `bahth-pgcd` (« the two algorithms »). DZ root:
`../smarter-academy-dz/apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/<lesson>/`. Target
root here: `apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/trouver-le-pgcd/` (« ⟶ » below).

| DZ piece | Decision | Target | Conversion |
|---|---|---|---|
| `qasim` keys 🤝 `qawasim-mushtaraka` and 👑 `al-akbar` (convoys « twins » and « crown », a purse) | **port, merged into ONE key** (K1): France's P1 is one point. The convoy and the purse are kept; the planks are no longer offered: he MAKES them in a typed workshop, with NO bench | ⟶ `world/forges.js` K1, `world/story.js` islands A–C | numbers 90 and 54, purse 15 (never exact: below); 5 tile rules |
| `tayin` key 📋 `hasr-wa-taqatu` and its `LISTS_BENCH` (`lists`) | **cut as a key and as a bench**: the bench's link step crosses the two lists FOR him (gate A, defect 3); the listing is his, on paper or in his head | — | its exercises are ported (bank) |
| `qasim` key 💐 `baqat-mutamathila` — `DEAL_INQUIRY` (kind `deal`) and its forge | **port** (K2, P4) | ⟶ `world/inquiries.js › DEAL_INQUIRY`, forge K2 | roses / lilies / vases → apples / pears / baskets (glyphs `apple`, `pear`, lot `basket` exist in `dealParts.jsx`); 30 and 42 |
| `bahth` key 🔁 `iqlidis` — `IQLIDIS_BENCH` (`ladder` / `divide`, `plain`), its convoy with a purse, its forge's slots « stop » and « make » | **port** (K4, P3) — the slot « next » is NOT ported: the notebook writes the next pair itself (gate A, defect 2) | ⟶ `world/inquiries.js › EUCLIDE_BENCH`, forge K4 | numbers 52 015 and 31 209, purse 807; 6 tile rules |
| `bahth` key 🧮 `baqi-yabqi` (the remainder keeps the common planks; experiment `ladder` / `fold`) | **cut as a key**; its FACT becomes K4's mirror experiment, on (`nest`, `pair`) — two rounds — instead of the fold of SUBTRACTION rows | ⟶ forge K4 `inquiry` | — |
| `bahth` keys ➖ `farq-yabqi`, 🪜 `khawarizmiyat-al-tarh`, ⏱️ `aqall-khutuwat` and their exercises (P1, P2, P3, P5: 77 questions) | **cut** — France teaches neither the subtraction algorithm nor the comparison | — | — |
| `qasim` key 🧩 `qawasim-al-pgcd` (the common divisors are the divisors of the PGCD) and its 23 questions | **cut** — no French point; told nowhere (no tablet line either) | — | — |
| `tayin` keys ⚡ `nataij-mubashira`, 🎯 `b-yaqsim-a` and their 34 questions | **cut** — no French point. A pair where b divides a may stand in the bank as a plain P1 computation | — | — |
| the store of `qasim`'s last bridge (options, « the longest plank that fills both ») | **cut**: a store of options is won by one division (gate A, defect 1). The final mission is a FOURTH convoy where he makes the plank | ⟶ `world/story.js` islands H–J | — |
| the banks: `content/practice/4am/{qasim-mushtarak-akbar,tayin-pgcd,bahth-pgcd}/level-1…5` (3 × 50) | **port 36**, cut the rest, **14 new** | ⟶ `content/practice/3e/trouver-le-pgcd/` | § Bank plan |
| class tests `content/class-tests/4am/{qasim-mushtarak-akbar,tayin-pgcd,bahth-pgcd}.json` | **port one** from the questions on kept points | ⟶ `content/class-tests/3e/trouver-le-pgcd.json` | same cut as the bank |
| lab instruments `common` (qasim), `lists` (tayin), `euclid` (bahth) — `lessonlab/registry.js` (here untagged) | **tag `common` and `lists`**; **`euclid` (« les carrés d'Euclide ») stays untagged**: its name says « Euclide » and the lab is reachable before K4 (A2) | ⟶ `lessonlab/registry.js` | names re-read for leaks |
| boards `board/{script,memo,board.test}.js` | **port the stations of the kept keys** | ⟶ `board/` | a station never names a key before it |
| walks `apps/web/e2e/lessons/{tayin-pgcd,bahth-pgcd}.walk.mjs` | **starting point** of the descriptor | ⟶ `apps/web/e2e/lessons/trouver-le-pgcd.walk.mjs` | written WITH the lesson (outline below) |
| the PGCD by prime decompositions (FR P2) | **DZ lacks it — built new** (K3), on the convoy mechanic, lesson 1's `sheet` as the workshop's bench | ⟶ forge K3, islands C–E | new; needs the kit work below |

### What is new for the student

He holds from lesson 1: decomposing (the factor ladder), powers, where to stop, the spreadsheet of remainders for a large
number (it holds the primes up to 89: 24 lines, `sheet.js › MAX_LINES`), and — lesson 1's last bridge — reading a
decomposition to say whether a plank divides a gap (36 into 2³ × 3² × 7). None of it is forged again. From 6e–4e he
holds the Euclidean division (« reste », « quotient ») and divisibility. NEW: one plank that must hold TWO gaps, and the
longest such plank (P1); reading it on two decompositions (P2); finding it when decomposing is out of reach (P3); a
sharing into identical lots read as that plank (P4). The order is the student's path, not the list's: P1, P4, P2, P3.
**Four keys** (lesson 1 had four).

### The keys

| # | Key (id) | The rule he writes | Nature | Experiment (kind, mode) — used by no other key here, nor by lesson 1 as a key's experiment | Numbers | Point |
|---|---|---|---|---|---|---|
| K1 | `diviseurs-communs` | The plank that builds both bridges with the fewest planks is the LONGEST plank that fills BOTH gaps | a search for a maximum over two sets | **a situation** (review §A.0): convoy « jumeaux » 90 then 54, nothing offered, A's typed workshop with NO bench, a purse of 15. The forge has no `inquiry` | 90, 54; purse 15 | P1 |
| K2 | `lots-identiques` | n identical baskets leave no fruit when n divides both numbers; the most baskets is their PGCD | a sharing read with common divisors | (`deal`, default) in the mirror — a sharing has no bridge to carry (A10) | 30 apples, 42 pears; chips 2…12 | P4 |
| K3 | `pgcd-facteurs` | The PGCD is the product of the prime factors COMMON to both, each with the SMALLER exponent seen | a reading of two decompositions (a minimum per prime) | **a situation**: convoy « grands fossés » 1 736 then 980, C's typed workshop whose bench is lesson 1's TOOL (`sheet`, two rounds), a purse of 193. No `inquiry` | 1 736 = 2³ × 7 × 31, 980 = 2² × 5 × 7²; PGCD 28 = 2² × 7 | P2 |
| K4 | `euclide` | Dividing as the notebook does, I stop at the remainder 0 and make the plank of the LAST remainder that is not 0 — because each pair (smaller ; remainder) keeps the common planks of the pair before | a procedure, and why it ends on the plank | **a situation**: convoy « Euclide » 52 015 then 31 209, E's typed workshop whose bench is (`ladder`, `divide`, `plain`), a purse of 807; **then in the mirror** (`nest`, `pair`), two rounds, as the forge's `inquiry` | 52 015 = 5 × 101 × 103, 31 209 = 3 × 101 × 103; PGCD 10 403 | P3 |

K1, K3, K4 share the CONVOY + PURSE + WORKSHOP constraint — it IS the PGCD (one plank, two gaps, the fewest planks), as
in DZ. What is each key's own is what the world gives him to find the plank: two small counts and nothing (K1), the
decompositions from the tool he owns (K3), the division notebook when that tool cannot reach (K4). Lesson 1's key
experiments were `ladder`/`factor`, `pairs`, `sheet`; here the `sheet` is only a TOOL on a bench (its rule was sealed in
lesson 1; K3's rule is another).

**The purses are never exact** (DZ's were: (a + b) ÷ coins read the plank). Each pays the PGCD and NOT the next common
plank, and (a + b) ÷ coins is not a plank that builds. What a purse still allows is a brute-force run upward from
(a + b) ÷ coins, every wrong length sending him back across the convoy — `proof.js` prints each window: K1 10 … 18
(9 tries), K3 15 … 28 (14), K4 104 … 10 403 (10 300), mission 44 … 86 (43). The purse is set just under the next common
plank's need, which makes each window as wide as the numbers allow.

#### K1 `diviseurs-communs` — islands A → B → C, the mirror of C

- **Situation**: the instruction says the constraint only: two bridges, 90 then 54 cases; the island between has no
  mould and no workshop, so ONE plank length builds both; a coin per plank laid, 15 coins. A's workshop makes any
  length 1 … 90 (typed). Paper mode stays open (`Paper.jsx`). After each refusal the robot says the FACT
  (« 54 = 27 × 2 ; 90 = 27 × 3 + 9 »), never what to try.
- **He holds** the planks he made and what each did: refused by a gap (27, 45, 30, 15), stopped by the purse (9 → 10 + 6
  planks, 6 → 15 + 9, 2 → 45 on 90 alone), built (18: 5 + 3 planks, 7 coins left).
- **Tiles** — one slot, five distinct rules (gate A note 11: the 12 of version 1 were 7): « Je fabrique » [la plus longue
  planche qui remplit les deux fossés · la plus longue planche qui remplit le fossé le plus court · la plus courte
  planche, plus longue que 1, qui remplit les deux fossés · une planche longue comme la différence des deux fossés ·
  n'importe quelle planche qui remplit les deux fossés].
- **Refutations (computed — `proof.js` K1)**: the shorter gap's longest → 54 (90 = 54 × 1 + 36); the shortest common
  but 1 → 2 (45 planks on 90, 15 coins); the difference → 36 (90 = 36 × 2 + 18); « any common plank » claims that 9
  (and 6, 3, 2, 1) build → 9 runs out of coins (16 planks). Each is on his log when he tried it; else the forge's attack
  lays it. Only 18 builds.
- **Last step** (before the name): (75 ; 45) — the planks that fill both (1, 3, 5, 15, a set) and the one to make (15).
  Its difference 30 is NOT the PGCD (gate A, defect 10: (84 ; 63) had 21 = 21).
- **Tablet** (the name, after): « Diviseurs communs et PGCD » — PGCD(90 ; 54) = 18, the notation with « ; ». Nothing
  about the divisors of the PGCD (gate A note 13).

#### K2 `lots-identiques` — the stall of island C (the mirror's second forge)

- **Experiment** `deal`: 30 apples and 42 pears into identical baskets, chips 2…12, `minTries: 4`, then the most baskets
  and what one holds. Every chip computed: 2, 3, 6 share everything; 5, 10 leave pears; 7 leaves apples; 4, 8, 9, 11,
  12 leave both. **He holds** his table of deals.
- **Tiles** — slot 1 « On peut faire n paniers identiques sans qu'il reste un fruit quand n » [divise les deux
  nombres · divise l'un des deux nombres · divise leur somme · divise leur différence] · slot 2 « et le plus de paniers
  possible, c'est » [leur PGCD · leur plus petit diviseur commun autre que 1 · le nombre de leurs diviseurs communs ·
  leur différence] (gate A note 12: every wrong option is now a CHIP of the table and a belief students hold).
- **Refutations (computed — K2)**: « one of the two » → 5 baskets (42 = 5 × 8 + 2); « the sum », « the difference » →
  4 baskets (30 = 4 × 7 + 2); « the smallest common » → 2 shares, but 3 and 6 share too and are more; « how many common
  divisors » → 4 (leaves fruit); « the difference » → 12 (30 = 12 × 2 + 6). The sum 72 (a lesson 1 number) is never
  written: a refutation line shows the deal, not the sum.
- **Last step**: 35 apples and 56 pears — 7 baskets, 5 apples and 8 pears in each. **Tablet**: « Partager en lots
  identiques ».

#### K3 `pgcd-facteurs` — islands C → D → E, the mirror of E

- **Situation**: C's workshop, « Le moule pour les fossés 1 736 et 980 », purse 193. The bench is the spreadsheet he
  forged in lesson 1, two rounds: it writes 1 736 → 868 → 434 → 217 → 31 and 980 → 490 → 245 → 49 → 7 (every
  derived number checked: `proof.js` prints them, the collision check passes them). He writes the decompositions with
  powers himself (lesson 1's key 2), reads which plank fits in both (lesson 1's last bridge), and the purse wants the
  longest. **Both decompositions stay in front of him where he types the plank** (kit work 1).
- **He holds** the two decompositions, the planks he made and what they did.
- **Tiles** — frame « Pour écrire le PGCD de deux nombres décomposés, je multiplie » · slot 1 [les facteurs premiers
  communs aux deux · tous les facteurs premiers qu'on voit dans l'un ou l'autre] · slot 2 « chacun avec » [son plus
  petit exposant · son plus grand exposant · l'exposant 1]. 6 rules. **The owner chose this wording on 2026-11-23**
  (« human and clear »: « qu'on voit » is dropped everywhere — tiles, the rule's sentence in the story, the knowledge
  card and the trainer). « son » does the job « qu'on voit » did: a prime seen in one number only (5, 31) keeps the
  exponent it has, so « tous + son plus petit exposant » is a different, wrong rule (it is not « exponent 0 »).
- **Refutations (computed — K3)**: common + largest → 2³ × 7² = 392 (1 736 = 392 × 4 + 168); common + exponent 1 → 14
  (124 + 70 planks, 193 coins); all + smallest seen → 2² × 5 × 7 × 31 = 4 340; all + largest → 60 760; all +
  exponent 1 → 2 170 (all longer than 1 736). The slip « copy one decomposition » (2³ × 7 = 56: 980 = 56 × 17 + 28;
  2² × 7² = 196: 1 736 = 196 × 8 + 168) is a misconception signature of the bank and a trainer question, not a tile.
- **Last step**: 2⁴ × 3³ × 5 and 2² × 3⁴ × 7 (given decomposed) → the PGCD in factors 2² × 3³ (lesson 1's exponent
  boxes), then 108. **Tablet**: « Le PGCD par les facteurs premiers ».

#### K4 `euclide` — islands E → F → G, the mirror of G

- **Why the notebook and not the sheet — a fact of the world, not a decree** (gate A, defect 4): 52 015 = 5 × 101 × 103
  and 31 209 = 3 × 101 × 103. After 5 (or 3) the sheet would have to try every prime up to 101 (26 lines); it holds 24
  (up to 89). E's workshop card says it in the world's words (« Le tableur de l'île C s'arrête à 89 : pour 10 403, il
  faudrait aller jusqu'à 101. »), and E's bench is the division notebook. By hand, 26 failed divisions; the notebook
  writes 3 rows: 52 015 = 31 209 × 1 + 20 806 | 31 209 = 20 806 × 1 + 10 403 | 20 806 = 10 403 × 2 + 0. Few planks
  (5 + 3 = 8), so laying them is quick.
- **What the notebook SHOWS and K4 does NOT make him find** (gate A, defect 2 and note 14): « divide the larger by the
  smaller », « go on with (the smaller ; the remainder) », « stop when the remainder is 0 » — the notebook does them
  and stops by itself. `manual: 2` remains: he types the next pair of rows 1 and 2 BEFORE the notebook writes it — a
  prediction answered by the notebook's fact, not a discovery. The count question is a prediction too. **What K4 makes
  him find**: WHICH number is the plank (the gaps and the purse judge the plank he makes: 20 806 refused, 2 refused,
  10 403 builds), and in the mirror, WHY.
- **The mirror's experiment** (`nest`, `pair`) — two rounds, three probes, 12 yes / no (version 1: 32):
  1. CONTRAST first — (88 ; 33) against (88 ; 22): probes 11, 22, 8 — 22 fills both of (88 ; 22) and not 33; lists
     1 11 against 1 2 11 22: DIFFERENT. Not every smaller pair keeps the common planks.
  2. HIS notebook's last two rows — (31 209 ; 20 806) against (20 806 ; 10 403): probes 10 403, 20 806, 31 209 —
     lists 1 101 103 10 403 on both: EQUAL; and 10 403 fills 20 806, so the last pair's common planks are the planks of
     10 403: the longest is the last remainder that is not 0.
  Every probe is drawn (`proof.js`: d × u ⩾ 3 px at u = 920 ÷ the longest strip — 83 px at least; every rest ⩾ 1 cell
  on the 88 strip, ⩾ 10 403 cells on the long ones).
- **Tiles** — frame (the notebook's facts, owned) « Comme le carnet : je divise le plus grand par le plus petit, puis le
  plus petit par le reste, et ainsi de suite. » · slot « je m'arrête » [quand le reste est 0 · quand le quotient est 1] ·
  slot « et je fabrique une planche de la longueur » [du dernier reste qui n'est pas 0 · du dernier quotient · du nombre
  de divisions]. 6 rules; his evidence (`fromInquiry`) = the lived plank 10 403 (he cannot reach G otherwise) + the
  probes' facts.
- **Refutations (computed — K4)**: all five wrong rules make, on the lived pair, a plank the world refuses: 2 (last
  quotient: 52 015 = 2 × 26 007 + 1), 3 (divisions: 52 015 = 3 × 17 338 + 1), 20 806 (stop at quotient 1: 52 015 =
  20 806 × 2 + 10 403), 1 and 1 (52 015 planks, 807 coins).
- **Last step** (ported shape): (1 073 ; 957) — three rows 1 073 = 957 × 1 + 116 | 957 = 116 × 8 + 29 | 116 = 29 × 4 + 0,
  then PGCD(1 073 ; 957) = 29. **Tablet**: « L'algorithme d'Euclide » — with the line PGCD(a ; b) = PGCD(b ; r).

### The three open questions

1. **How is Euclid's rule discovered without DZ's two subtraction keys?** Honestly split (gate A, defect 2): the CHAIN
   of divisions and its stop are shown by the notebook (a tool of the world, as DZ's 🔁 bench was); what he discovers
   is which number is the plank — the purse and the two gaps refuse the others — and why: the mirror's `nest`/`pair`
   shows that the smaller pair (b ; r) keeps the common planks while (a ; r) may not, and that the last pair's common
   planks are those of the last remainder. DZ needed the subtraction keys to make the division step understood; here
   the division keeps the planks directly, seen on the strips.
2. **Which experiment carries P2?** A situation, not an experiment screen (review §A.0): a convoy of two large gaps whose
   workshop bench is lesson 1's `sheet` (an existing kind, its default mode, two rounds). No new kind, mode or
   mechanic — but the bench must keep its state and show it where he types (kit work 1). Rejected: gaps announced by
   their decompositions (`boss.label` on every bridge: an extended mechanic, the owner's go).
3. **Why does a student who holds the decompositions need Euclid?** Because the tool he owns stops at the prime 89:
   10 403 = 101 × 103 is out of its reach (26 primes needed, 24 lines), and by hand it is 26 failed divisions against 3
   rows. Without a calculator (brevet part 1), Euclid stays on 3-digit pairs; the bank's two new P3 exercises put the
   same choice in a brevet's words.

### No rule told before its seal — where a rule could leak, and how it is avoided

| Where | Risk | What the lesson does (and what `inquiries.test.js` / `lockedNames` check) |
|---|---|---|
| the instruction and the robot's lines on islands A–G | « prends la plus longue planche commune », « le plus petit exposant », « le dernier reste » | they state the CONSTRAINT (one kind of plank for both bridges, a coin per plank) and FACTS after a bridge (« 90 = 18 × 5 »). Forbidden per stretch: A–C « commun(e) », « diviseur commun », « PGCD », « plus grand »; C–E « exposant », « plus petit », « commun »; E–G « dernier reste », « reste qui n'est pas 0 », « algorithme », « Euclide » |
| the recall card « De l'île précédente » | a line that reads the rule | facts only (« 980 = 28 × 35 »); never « 28 = 2² × 7, the smaller exponents » |
| the workshop's bench texts (`sheet`, `ladder`) and the card of E's workshop | naming which plank to make | the sheet's words are lesson 1's; the notebook is `plain` (no column of common planks, no gold); E's card states the sheet's limit, nothing of the plank. K1 has NO bench (the `lists` link step was the « common » half of K1, gate A defect 3) |
| the tiles | a right tile worded more precisely than the wrong ones; two tiles meaning the same | same grammar for every option of a slot; K3's « son plus petit exposant » (owner, 2026-11-23); K1's five rules are five different planks |
| hints and nudges of the forges | a nudge that states the rule | a nudge is a CASE laid in the mirror (`kind: 'experiment'`), never a sentence |
| tablets of earlier keys | K1's or K3's tablet telling a faster way (K4) | each tablet holds its rule and one example, nothing of a later key; no line on the divisors of the PGCD |
| the hub, the warm-up and its lab, the board, the trainer | a key's name (« Euclide », « lots identiques ») before its forge (A2) | `lockedNames.render.test.jsx`; the lab instrument `euclid` stays untagged; board stations follow the keys; trainer questions of a key unlock after its seal |
| the gate dash and the final convoy | — | after every seal; the mission states only the constraint (two stretches, one plank, the purse), never « PGCD » nor a method |

### The final mission — a fourth convoy (gate A, defect 1)

The jetty of the lighthouse: TWO stretches, 1 462 cases then 946 cases (H → I → J), a convoy: I holds no plank. H's
workshop makes any length (typed), **with NO bench**; the purse holds 55 coins. He must MAKE the plank: the store of
options is gone, so no division of a given candidate wins it. He chooses his method: decompose (1 462 = 2 × 17 × 43,
946 = 2 × 11 × 43: lesson 1 + K3) or divide (1 462 = 946 × 1 + 516 | 946 = 516 × 1 + 430 | 516 = 430 × 1 + 86 |
430 = 86 × 5 + 0: K4), on paper (`Paper.jsx`). Only 86 builds (17 + 11 = 28 planks, 27 coins left). Every error of the
lesson is refused by the world (`proof.js › MISSION`): 516 (stop at the first remainder; also the difference) and 430
(one row early) by the gap 1 462; 43 (a common plank, not the longest) by the purse (34 + 22 planks); 5 (the last
quotient) and 946 (the shorter gap) by the gap 1 462.

**Why it cannot be won with lesson 1's keys only**: lesson 1 decomposes and reads « does this plank divide that gap »;
nothing in it says that ONE plank for two gaps with the fewest planks is the longest common one — the purse refuses 43.
A student without the lesson can only run upward from 2 408 ÷ 55 = 43,8, length by length, walking back after each
refusal (43 tries). **The code allows this ending** (read, not run): `Game.js › arrive(k)` calls `finale()` when he
reaches the LAST island, whatever segment led there; `bossSeg` is `null` when no segment carries `boss`, and nothing
else needs it (the gates on `boss` only apply to a boss segment). The story marks the problem module in its `onHold`
hook when the second bridge of this convoy holds (lesson 1 used `onBossPaid`). The price step of the old store is
dropped; the purse plays its part.

### Numbers (reserved for this lesson)

Islands: 90, 54 (purse 15, plank 18) · 30 apples, 42 pears · 1 736, 980 (purse 193, plank 28; the sheet writes 868,
434, 217, 31, 490, 245, 49, 7) · 52 015, 31 209 (purse 807, plank 10 403; the notebook writes 20 806, 10 403) ·
88, 33, 22 · mission 1 462, 946 (purse 55, plank 86). Last steps: (75 ; 45), 35 and 56, 2⁴ × 3³ × 5 = 2 160 and
2² × 3⁴ × 7 = 2 268, (1 073 ; 957). Dash: PGCD(18 ; 30), PGCD(2³ × 5 ; 2 × 5²), 57 = 15 × 3 + 12, 27 = 12 × 2 + 3,
28 and 35, PGCD(2² × 3 × 7 ; 2 × 3² × 5).
**Checked**: every pair, every number ≥ 100 AND every number a bench or a mirror derives on screen, against lesson 1's
bank and every French story, with the collision function of `scripts/lesson-bank-numbers.mjs` (through the wrapper
`check.mjs`: the script refuses a lesson with no bank) — all CLEAR (`numbers.out`). Small numbers checked by hand
against the other lessons' lists: lesson 1's 91, 97, 60, 72, 36, 48 appear nowhere on screen (version 1's sheet wrote
91, its notebook 59, its dash 20; all gone); lesson 4's numbers were changed so that 18, 33, 35, 588 are this lesson's
only. Rejected on the way: notes § 4.

### Kit work — REQUIRED (gate A, defect 7), one item, no new kind, mode or mechanic

1. **The `sheet` as a bench keeps its state and shows it where he types.** Today `Workshop.jsx › Bench` passes
   `spec.from` / `spec.onState`, but `InquirySheet.jsx` and `sheet.js` read neither: closing the bench loses both
   decompositions, and the typed workshop shows nothing of the bench. Change: `divisorIsles/sheet.js` (an initial state
   from `spec.from`), `divisorIsles/InquirySheet.jsx` (call `spec.onState(state)` on every change, as
   `InquiryLists.jsx` does; the end screen keeps every round's result); `divisorIsles/Workshop.jsx › Typed` (when the
   bench kept a state, a card under the length box with the lesson's `bench.text.kept(state)` lines — for K3 the two
   decompositions); tests `inquirySheet.render.test.jsx`, `workshop.render.test.jsx`; `GAME_WORLD.md` §2ter-1 (the bench
   paragraph lists `sheet` among the kinds that read `spec.from`). The same card serves any bench.
To VERIFY in the first brief (one look at the code or one render test): `nest`/`pair` with a first round whose lists
differ (gate A read `gcdModes.js:123-136`: yes); `ladder`/`divide` `plain` `manual: 2` on 5-digit gaps (bars only);
a story ending on a convoy (`arrive` → `finale`, above); the workshop's typed `max` of 31 209.

### Bank plan — 50 exercises, 10 per palier, every one `brevet` and `calculator` tagged

Unchanged in its sources and counts by gate A (which did not open the Algerian tree: the bank agent re-reads every
ported file). Sources: `../smarter-academy-dz/content/practice/4am/<lesson>/level-<n>/ex-4am-<lesson>-l<n>-<nnn>.json`,
cited `qasim l1-001`. Ported = `exam.kind: adapted` (DZ « excerpt » / « official » BEM papers too: no French brevet
paper on the PGCD is filed in `docs/curriculum/officiel/`). Points: `qasim` P1–P2 → FR P1, `qasim` P3 → FR P4,
`tayin` P1 → FR P1, `bahth` P4 → FR P3. A ported pair equal to a world pair of this lesson, or holding a number of
another lesson's list, is renumbered (the script once the bank exists). Money in plausible euros.

| Palier | brevet | P1 (lists, the greatest) | P2 (decompositions) | P3 (Euclid) | P4 (identical lots) | ported / new |
|---|---|---|---|---|---|---|
| 1 | 1, no calculator (10) | 4 ported: `qasim l1-001` (12 ; 18), `qasim l1-007` (42 ; 70), `tayin l1-005` (63 ; 49), `tayin l1-010` (77 ; 121) | 3 new (PGCD read on two given decompositions, small) | 2 ported: `bahth l1-007` (203 ; 87), `bahth l1-010` (247 ; 190) | 1 ported: `qasim l2-005` (66 ; 88) | 7 / 3 |
| 2 | 1, no calculator (10) | 2 ported: `tayin l2-005` (39 ; 65), `tayin l2-006` (85 ; 51) | 3 new (decompose two 3-digit numbers, then the PGCD) | 3 ported: `bahth l2-007` (1 005 ; 315), `bahth l2-009` (1 078 ; 392), `bahth l2-010` (935 ; 714) | 2 ported: `qasim l2-004` (150 ; 120), `qasim l3-009` (132 ; 156) | 7 / 3 |
| 3 | 4 × part 1, 6 × part 2 | 2 ported: `qasim l3-003` (104 ; 156), `qasim l4-006` (330 ; 462) | 2 new (« vrai ou faux » on a PGCD written in factors; the error « largest exponents ») | 3 ported: `bahth l3-004` (945 ; 1 215), `bahth l3-009` (1 631 ; 932), `bahth l3-010` (1 001 ; 637) | 3 ported: `qasim l3-004` (240 ; 180), `qasim l4-007` (156 ; 180), `qasim l5-005` (144 ; 108) | 8 / 2 |
| 4 | 2, calculator (10) | 2 ported: `tayin l4-003` (234 ; 156), `tayin l4-009` (275 ; 165) | 2 new (decompositions given, a lots problem) | 2 ported: `bahth l4-002` (5 858 ; 6 767), `bahth l4-008` (22 816 ; 19 251) + 1 new (a pair out of the sheet's reach: why the divisions) | 3 ported: `qasim l5-001`, `qasim l5-004`, `qasim l5-007` | 7 / 3 |
| 5 | 2, calculator (10) | 1 ported: `tayin l5-003` (156 ; 104) | 2 new (a brevet-length problem: decompose, PGCD, lots, price in €) | 1 ported: `bahth l2-004` (1 352 ; 507) + 1 new (Euclid on a 4-digit pair, then the lots) | 5 ported: `qasim l5-002`, `l5-003`, `l5-006`, `l5-008`, `l5-010` | 7 / 3 |

Totals by primary point (sheets): P1 11, P2 12, P3 13, P4 14 — the four keys weigh what the bank weighs. 36 ported
(qasim 18, tayin 7, bahth 11), 14 new (P2 12, P3 2). Brevet part 1: 24 sheets (`calculator: false`), part 2: 26. Cut
from the 150: `qasim` P4 (23 questions), `tayin` P2–P3 (34), `bahth` P1–P3, P5 (77) and the rest beyond 50. Answer
types: `rational`, `integerSet` (a list of common divisors), `factorization` (a PGCD in factors), `choice`.

### The walk's outline (the descriptor is written with the lesson, from it)

| # | Screen | What the student does | What the walk checks |
|---|---|---|---|
| 1 | Title → island A (anvil) | reads the instruction: 90 then 54, one kind of plank, 15 coins | the instruction stays; `data-di-purse=15`; no bench button |
| 2 | A's workshop (typed) | makes 27 (refused by 90), walks back, makes 9 (the purse runs out on 54), walks back, makes 18 | each refusal's fact; `convoyBack`; 18: both bridges stand, 7 coins left |
| 3 | C, the mirror — K1 | tiles (5) → the mirror tests on 27, 9, 18 → attack → seal → last step (75 ; 45) → tablet | no name before the tablet |
| 4 | C, the mirror's 2nd forge — K2 | `deal`: tries 2, 5, 7, 6 → answers 6 baskets of 5 and 7 → tiles → seal → 35 / 56 → tablet | apples, pears, baskets; no « planche » (A10); no « 72 » |
| 5 | C's workshop → bench `sheet` (1 736, then 980) | picks the lines with 0 down to both decompositions; back | both decompositions on the bench's end AND on the workshop's card (kit work 1); reopened, the bench keeps them |
| 6 | C's workshop (typed), C → D → E, 193 coins | makes 14 (the purse runs out on 980), then 28 | 28: 62 + 35 planks |
| 7 | E, the mirror — K3 | tiles → test → seal → last step 2² × 3³ then 108 → tablet | exponent boxes; « qu'on voit » |
| 8 | E's workshop → bench `ladder`/`divide` (52 015 ; 31 209) | reads the card (the sheet stops at 89); types (31 209 ; 20 806), then (20 806 ; 10 403); the count 3; the notebook ends | `plain`: no planks column, no gold; the card's sentence |
| 9 | E's workshop (typed), E → F → G, 807 coins | makes 20 806 (refused by 52 015), then 10 403 | 5 + 3 planks |
| 10 | G, the mirror — K4 | `nest`/`pair`: two rounds × 3 probes → tiles (6) → test → seal → last step (1 073 ; 957) → tablet | round 1's lists DIFFERENT, round 2's EQUAL; every probe drawn |
| 11 | G → H, the gate dash | six waves | one right gate each (`proof.js`) |
| 12 | H's workshop (typed, no bench), H → I → J, 55 coins | makes 43 (the purse runs out on 946), walks back, makes 86 | 17 + 11 planks; arriving at J plays the finale; the problem module is marked |
| 13 | End | — | the four tablets in « Mes règles » |

Islands, in one line ahead (play.md §2): A the workshop quay, B (no planks), C the mirror and the stall, D (no
planks), E the mirror and the workshop, F (no planks), G the mirror, H the dash's end and the jetty's workshop, I (no
planks), J the lighthouse. Ten islands (lesson 1: nine). Their names are new words (`story.test.js`).

### Gate A, answered

| # | Gate A defect | What changed |
|---|---|---|
| 1 | BLOCKING — the store is won by one division | the store is gone; the mission is a fourth convoy, typed workshop, no bench, purse 55: he makes 86; the code lets a story end on a convoy (`arrive` → `finale`) |
| 2 | BLOCKING — K4 and K5 forge the same rule; the notebook writes the next pair | **merged** into one key K4 `euclide`: the « next » slot is dropped (the notebook's fact, owned in the frame), 6 rules all refused on the lived pair; what the notebook shows and what he finds are written down. Merged rather than kept apart: four keys for four points, and the « why » (`nest`/`pair`) stays as K4's mirror experiment instead of a key France does not name |
| 3 | K1's `lists` bench crosses the lists for him | no bench at K1: he lists on paper, the gaps and the purse judge |
| 4 | Euclid's need by decree | the pair is out of the sheet's reach (101 × 103 needs 26 lines, it holds 24); the workshop card says so |
| 5 | probe 3 undrawable on 1 456-cell strips | round 1 is (88 ; 33); the long round's probes are 10 403 and up; every probe ⩾ 83 px (`proof.js`) |
| 6 | 32 guesses; round 1 separated nothing; quotient tiles | two rounds, 12 guesses, the contrast first; no quotient tile |
| 7 | « kit work: none » false | kit work 1 listed, required, with its files |
| 8 | 588 and 91 on the sheet; 18, 33, 20, 59, 72 shared | K3 is 1 736 / 980 (its sheet writes none of them); the dash's 20 gone; 59 gone from this lesson; 72 never written; lesson 4 renumbered (no 18, 33, 588), lesson 3's Euclid pair changed (no 59) |
| 9 | five keys too long | four keys; three benches → two (sheet, notebook); 32 predictions → 12; four convoys of 8, 97, 8 and 28 planks |
| 10 | (84 ; 63): difference = PGCD | (75 ; 45): difference 30, PGCD 15 |
| 11 | K1's 12 rules were 7 | one slot, five distinct planks |
| 12 | K2's second slot thin | its options are chips and beliefs |
| 13 | K1's tablet told a cut rule | the line is removed |
| 14 | K4's frame hands « divide the larger by the smaller » | listed under « what the notebook shows » |
| 15 | « écrits » hard to read | « qu'on voit »; to read aloud to the owner |
| 16 | `proof.js` proves less than it prints | one verdict at the end; K2's « most » check tests « is the most »; « any » tests every common plank; headers name the design's keys; it also prints the derived numbers and each purse's window |

## Lesson 3 — `fraction-irreductible` — « Rendre une fraction irréductible »

**Built (2026-11-26, uncommitted)** — 4 keys, 50-exercise bank; walked at 1366×768, 0 FAIL (story 1583, hub 337, trainer 688, board 295, sitting 2606); gates A and B « go with corrections ». Debts: far islands' labels overlap by < 12 px, forge mini-bars thin, K2's sealed sentence clumsy. Cost and defects: `TWO_PLATFORMS_PLAN.md` §9.

Designed 2026-11-26, BEFORE any code. **Version 2, after gate A** (verdict « go with corrections »: defects 1–7 fixed,
8–10 answered — § « Gate A, answered » at the end; the gate's report `reports/fraction-irreductible-gate-A.md`). It
replaces the section « Lesson 3 — keys and numbers only ». Every number below is computed by ONE script beside this page,
`fraction-irreductible-proof.mjs` (`node fraction-irreductible-proof.mjs` → 177 lines, then « every line ok »); the
collision check's own output is `fraction-irreductible-numbers.out`. Everything below is a plan. Folder to be:
`apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/fraction-irreductible/`, world `divisor-isles`.

What binds (`lesson:brief`): `3e.m1.r06` « Il simplifie une fraction pour la rendre irréductible », and four points —
P1 recognise an irreducible fraction (no common prime factor, PGCD 1); P2 make it irreducible by the decompositions,
striking the common prime factors; P3 give a calculation's result irreducible; P4 make it irreducible in ONE step by
dividing by the PGCD (beyond the 2020 text, by the owner's decision of 2026-11-23 — `fr_dz_table.json` note). The bank was
written today, in parallel with this design (`content/practice/3e/fraction-irreductible/`, 50 sheets — § Bank plan); every
number of this design was checked against it too.

### Port map (skill §1bis, steps P1–P5)

P1 — the table gives two rows: DZ 4AM `ikhtizal-kasr` (`same-maths-other-method`, v2: FR P1 ← DZ P2, FR P2 ← DZ P1,
FR P3 ← DZ P4, FR P4 ← DZ P3) and `awwaliyan-fima-baynahuma` (`partial`: FR P1 ← its P1; « France never says premiers
entre eux here »). DZ root `../smarter-academy-dz/apps/web/src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/aadad-tabiiya-natiqa/`;
« ⟶ » = the target here.

| DZ piece | Decision | Target | Conversion |
|---|---|---|---|
| `ikhtizal-kasr/lesson.config.js`, `lesson.pack.js` | **new** from `npm run lesson:new -- fraction-irreductible --world divisor-isles`; the DZ files are read for the pack's markers and module table only | ⟶ the lesson folder | FR ids `3e_fraction-irreductible_P1…P4`; `teachingScope.exclude` keeps « operations on fractions as a topic » (lesson `calculer-avec-des-fractions`) and drops DZ's « prime factorisation » exclusion (it is the French method) |
| key 🪜 `ikhtizal-marahil` (« both terms divided by the same number », 18 rules, bridge 78/66 built with 2 AND 6) | **cut as a key**: equal fractions by dividing both terms are 5e–4e (`4e.m1.r07`, « produire des fractions égales »); he owns them. Its MECHANIC is ported into K1: the A → B bridge built with both planks that hold (the « writings » rule of its story), its `writingCase` for the mirror's cases | ⟶ K1, `world/story.js` island A, `world/forges.js` | the warm-up measures the 5e rule (new family below) |
| key 🔒 `ghayr-qabil` (bridge 48/35 held only by 1; tiles « both odd / both prime / numerator does not divide / coprime ») | **port** (K2) | ⟶ forge K2, island B → C | bridge 96/65; tiles: « premiers entre eux » is NOT said (FR), its tile becomes « n'ont aucun facteur premier commun »; two beliefs added (« l'un pair, l'autre impair », « ni 2, ni 3, ni 5 ne divise les deux »); last step: 3 fractions, renumbered |
| key 🎯 `ikhtizal-pgcd` (two convoys of one, 99/66 purse 3 and 243/189 purse 9, notebook benches, 12 rules) | **port** (K3), ONE bridge instead of two, now the EVIDENCE of a mirror experiment (gate A defect 1) | ⟶ forge K3, islands C → D, `world/inquiries.js › NOTEBOOK_BENCH` (from `THULUTH_BENCH`) + `PGCD_INQUIRY` (`measure`, `direct`) | bridge 1 786/722, purse 93; tiles « subtract » and « the difference » cut; 6 rules |
| key 🧾 `natija-mukhtazala` (39 lit in strokes 5 + 8, same denominator, a purse) | **port, rebuilt**: France's P3 is any calculation — sums of different denominators and products; the bridge keeps the two strokes, the purse goes; as in DZ, NO mirror experiment (gate A defect 4) | ⟶ forge K4, island D → E | strokes 65 + 4 on 78 (5/6 + 2/39); products in the guided last step and the mission |
| the last bridge, the STORE (273 lit 88 + 107, options 3 and 39, purse 7) | **cut**: won by lesson 2's rule (« the longest plank that holds both, the fewest planks ») — see § The final mission | ⟶ the lighthouse plaque (new) | — |
| `world/math.js` (`NUMBERS`, `fracTex`, `reduce`), `world/text.js`, `world/journey.js` (KEYS), `world/sitting.js`, `world/evidence.js` (claims `pgcd`, `coprime`, `fraction` — all three exist in `kit/claims.js` here), `world/knowledge.js` (4 cards), `world/practice.js`, `world/trainer.js` | **port**, file by file, renumbered and rewritten from their job | ⟶ `world/` | French words (« fraction irréductible », « simplifier », « numérateur », « dénominateur »); the trainer's DZ P1 stages (successive divisions by any divisor) become decomposition questions (P2) |
| `board/{script,memo,board.test}.js` | **port the stations of the four keys** | ⟶ `board/` | no station names a key before it |
| `revision.js` (DZ has one) | **port** (`docs/architecture/REVISION_PAGE.md` §2 — required of every v2 lesson with a world) | ⟶ `revision.js` | the four rules, French method first |
| bank `content/practice/4am/ikhtizal-kasr/level-1…5` (50) | **ported 10**, 40 new — DONE today by the bank agent | ⟶ `content/practice/3e/fraction-irreductible/` (exists) | § Bank plan |
| class test `content/class-tests/4am/ikhtizal-kasr.json` | **port** from the questions of the kept exercises | ⟶ `content/class-tests/3e/fraction-irreductible.json` | same cut and renumbering as the bank |
| lab instrument `strip` (« La bande de la fraction », here with `lesson: null`) | **tag** `fraction-irreductible`: its name and hint state no rule (« Ses jointures tombent-elles là où finit la lumière ? ») | ⟶ `lessonlab/registry.js` | re-read for leaks: no « irréductible », « simplifier » |
| warm-up family `1am.m5.r02` (equal fractions: one number divides both terms; slips « subtract », « one term only ») | **port** as the family of `4e.m1.r07` (what P2/P4 stand on, `lesson:brief`); `3e.m1.r05` keeps lesson 1's `BIG_DECOMPOSITION` | ⟶ `launchkit/families.js › FAMILIES['4e.m1.r07']` | its fractions never one of this lesson's banks (`FRAC_AVOID`, re-read); no stages, no « cannot be rewritten » |
| walk `apps/web/e2e/lessons/ikhtizal-kasr.walk.mjs` | **starting point** of the descriptor | ⟶ `apps/web/e2e/lessons/fraction-irreductible.walk.mjs` | from § The walk's outline |
| `awwaliyan-fima-baynahuma` — its key 1 (`sort` of coprime pairs), its instrument `duo`, its bank | **cut**: a whole lesson on pairs « premiers entre eux » that France does not name; its condition lives in K2 (« aucun facteur premier commun »); `duo` stays untagged | — | — |
| the decompositions as the method of P2 | **DZ lacks it — built new** (K1), on the experiment `measure` (mode `stages`) that exists here and was never used by a French lesson | ⟶ forge K1 `inquiry` | numbers new |
| `measure` in mode `direct` for K3, the plaque of the mission | `measure`/`direct` **exists** (unused in France); the plaque is **new** — § Kit work; `part` is no longer used | — | — |

### What is new for the student

He holds from lesson 1: decomposing (the factor ladder), powers, where to stop, the spreadsheet for a big number. From
lesson 2: the longest plank of two gaps, the PGCD by lists, by the decompositions, by Euclid's notebook, and identical
lots (30 apples, 42 pears → 6 baskets of 5 and 7). From 5e–4e: equal fractions — both terms divided (or multiplied) by
the same number — and the rules of 2, 3, 5 to find a first divisor. None of it is forged again.

NEW for him: **a fraction is a pair of terms whose common prime factors can be struck** (P2 — on the two
decompositions, a factor as often as it is common, 1 and not 0 left); **when a fraction is finished** (P1 — not « when
I can see no rule of 2, 3, 5 », but « when no prime factor is common »: the 4e habit of simplifying by the visible
divisors stops too early, the bank's commonest error); **that the PGCD does it at once** (P4 — the link between lesson
2's number and a fraction); **that a computed result is checked again**, even when the fractions computed were
irreducible (P3). The order is the student's road, DZ's order, which the owner validated: strike (P2) → finished (P1) →
at once (P4) → after a calculation (P3). Four keys.

### The keys

| # | Key (id) | The rule he writes | Nature | Experiment (kind, mode) — no other key here, nor lesson 1 or 2, uses it | Numbers | Point |
|---|---|---|---|---|---|---|
| K1 | `simplifier-facteurs` | From the two decompositions, strike each prime factor common to both, as often as it is in both, in the numerator AND the denominator | a procedure on two decompositions | **(`measure`, `stages`)** in the mirror of B, PRIME CHIPS ONLY (no typed box), two rounds; the bridge A → B gives him his sign first | bridge 246, 138 lit; rounds 69/123, 52/76 | P2 |
| K2 | `irreductible` | A fraction stays as it is exactly when its terms have no prime factor in common (their PGCD is 1) | a classification | **a situation** (review §A.0): the marked bridge B → C, 96 cases, 65 lit, that only the plank 1 holds; the mirror opens once 2, 3, 5 and 13 have been tried. No `inquiry` | 65/96 | P1 |
| K3 | `diviser-par-le-pgcd` | To make a fraction irreducible in one step, divide numerator and denominator by their PGCD | a maximum read as ONE division | **(`measure`, `direct`)** in the mirror of D, on 722/1 786, typed box only; its evidence is the bridge C → D (marked convoy of one, workshop, notebook bench, purse) he has just crossed | bridge 1 786, 722 lit; purse 93; plank 38 | P4 |
| K4 | `resultat-irreductible` | Even when the fractions computed are irreducible, the result may not be: I look for a prime factor common to its terms and make it irreducible | a claim on a calculation's result | **a situation**: the marked bridge D → E lit in two strokes, the sum 5/6 + 2/39. No `inquiry` | 78 cases, strokes 65 + 4 | P3 |

**Why the four are distinct** (review §A.2). Lesson 1's key experiments: (`ladder`, `factor`), `pairs`, `sheet`. Lesson
2's: three convoys (K1, K3, K4), (`deal`), (`nest`, `pair`); `sheet` and (`ladder`, `divide`) only as benches. Here:
**K1 (`measure`, `stages`)** — several stages, ONE PRIME each, on his choice of road, ended by his claim: the striking,
factor by factor; **K3 (`measure`, `direct`)** — ONE stage only, the length typed, and the world says at once whether one
stage was enough: the maximum (the PGCD) in one division. Same kind, two modes whose gesture is the opposite (many small
strikes / one big one) — and the brief must say so to the forges' agent. K2 and K4 are situations on the marked bridge,
the world piece of every key (`divisorIsles/mark.js`: the gap is the whole, the lit stretch from the island he leaves is
the numerator, a plank holds only when it fills the gap AND puts a joint on the lantern post, and the sign is rewritten
in planks); they differ by what the bridge is: ONE stretch that only 1 holds (K2) against a stretch lit in TWO strokes, a
sum (K4). The bridge C → D (convoy, workshop, notebook) is lesson 2's K4 mechanic replayed ON PURPOSE as a tool — it makes
him find 38 with what he owns; it is K3's evidence, not its experiment (gate A defect 1). The gesture runs as the concept
(review §A.7): numerator lit from the start, denominator the whole.

#### K1 `simplifier-facteurs` — island A → B, the mirror of B

- **The bridge** A → B: 246 cases, 138 lit; moulds on A: 2, 3, 5, 7. 2 holds (sign 69/123), 3 holds (46/82); 5 and 7 do
  not fill 246 (246 = 5 × 49 + 1 = 7 × 35 + 1). As in DZ's 🪜 story, after his first hold the instruction asks for the
  bridge again with the other plank that holds; the mirror of B opens only when the sign holds both writings:
  « 138/246 = 69/123 = 46/82 ». Neither is the end (23/41): no plank of 6 is on A.
- **He holds** his sign (two writings). The recall card on B says nothing of the decompositions any more (gate A defect
  6): the experiment's first screen asks him to type them (lesson 1's tool, exponent boxes), then writes them over the
  strips.
- **Experiment** (`measure`, `stages`, `runs: 1` per round), **chips 2, 3, 5, 7, 11, 13 and NO typed box** (kit work 2):
  each count strikes ONE prime from both decompositions, which the lesson's `counted` text rewrites (« En planches de 3 :
  69 = 3 × 23 et 123 = 3 × 41 »). Round 1 = his sign with planks of 2, 69/123: only 3 → 23/41; his end claim holds.
  Round 2: 52/76 = (2² × 13)/(2² × 19): 2 → 26/38; a claim there is answered by the plank 2 that still fills both; 2 again
  → 13/19 — « 2 struck twice » is SEEN, since 4 is not a chip. Strips ⩽ 130 cells (`measure.js`'s scale): 123 and 76.
- **The end button** « Aucune planche plus longue qu'une case ne remplit les deux » is HIS claim, which the world may
  refute (gate A note 8): it is K2's criterion in plank words, used before K2's seal as a thing he says, not as a rule
  told. K2 then forges the criterion on the DECOMPOSITIONS (the hidden 7, 17, 19 of its last step and attack).
- **Tiles** — frame « Pour écrire la même fraction avec les plus petits nombres, à partir des deux décompositions, je
  barre » · slot 1 [chaque facteur premier commun aux deux termes, autant de fois qu'il est dans les deux · chaque
  facteur premier commun, une seule fois · seulement le plus petit facteur premier commun · tous les facteurs premiers
  du numérateur] · slot 2 [au numérateur et au dénominateur · au dénominateur seulement]. 8 rules, one holds.
- **Refutations (computed — proof K1)**: « une seule fois » → 52/76 gives 26/38, 2 still fills both; « le plus petit »
  → 138/246 gives 69/123, 3 still fills both; « tous ceux du numérateur » → 76 = 52 × 1 + 24 (the denominator cannot);
  « au dénominateur seulement » → 69/41, another stretch (longer than the bridge).
- **Last step**: item 1 from the RAW fraction (gate A defect 6; the bank's P2 starts from the numbers): 735/588 — he
  types 735 = 3 × 5 × 7² and 588 = 2² × 3 × 7² (claim `factorization` ×2), then 5/4 (7 struck twice); item 2, given
  decomposed: (2 × 53)/(2² × 7 × 53) → 1/14 (everything of the numerator struck: 1 is left, not 0).
- **Tablet**: « Simplifier avec les facteurs premiers » (built; « Simplifier une fraction avec les facteurs premiers » in the design, shortened for the hub map) — 138/246 = (2 × 3 × 23)/(2 × 3 × 41) = 23/41.

#### K2 `irreductible` — island B → C, the mirror of C

- **Situation** (DZ's 🔒): 96 cases, 65 lit; moulds on B: 2, 3, 5, 13, 1. 2 and 3 fill 96 and miss the post (65 =
  2 × 32 + 1 = 3 × 21 + 2); 5 and 13 do not fill 96 (96 = 5 × 19 + 1 = 13 × 7 + 5 — 13 is in 65: the post would hold,
  the gap does not); only 1 holds; the sign stays 65/96.
- **His evidence does not depend on his luck** (gate A defect 7): as on A, the mirror of C opens only when the four
  planks 2, 3, 5 and 13 have each been fired on B → C (the story's `onHold`/`onArrive` hook reads the log; arriving with
  fewer, the instruction sends him back: « Essaie aussi les planches que tu n'as pas posées »). He holds the four facts
  and the sign that stayed.
- **Tiles** — slot « Quand je vois que » [les deux termes sont impairs · l'un est pair, l'autre impair · les deux termes
  sont des nombres premiers · le numérateur ne divise pas le dénominateur · ni 2, ni 3, ni 5 ne divise les deux termes ·
  les deux termes n'ont aucun facteur premier commun] × slot « la fraction » [reste comme elle est · s'écrit avec des
  nombres plus petits]; ruleText « …, sinon l'inverse ». 12 rules, one holds. (Six options in a slot: one of the screens
  to look at first, § The walk's outline.)
- **Refutations (computed — proof K2)**, his own signs first: both odd → 69/123 shrinks; both prime (and its inverse) →
  65/96 stays though neither is prime; « ne divise pas » → 138/246 shrinks; and ONE forge attack, 95/228 (= 5/12) — odd
  over even AND no 2, 3, 5 in common, its 19 seen in NEITHER term at a glance (gate A defect 10: 14/77 showed its 7).
  All 11 wrong rules fall (the proof prints each with its case).
- **Last step**: item 1 — he types PGCD(65 ; 96) (claim `pgcd`): 1, the longest plank that held, which he SAW (gate A
  note 8: « PGCD est 1 » is found on his own bridge, not told); items 2–4 — three fractions, none separated by a rule of
  2, 3, 5 — 141/253 (stays), 238/287 (= 34/41, 7 hidden), 204/289 (= 12/17, 17 hidden): « irréductible ? oui / non »,
  then for a no the irreducible form (claims `coprime`, `fraction`).
- **Tablet**: « La fraction irréductible » — « Une fraction est irréductible quand son numérateur et son dénominateur
  n'ont aucun facteur premier commun, c'est-à-dire quand leur PGCD est 1 », with his example « sur le pont, seule la
  planche de 1 tenait : PGCD(65 ; 96) = 1 ».
- **The word « irréductible » before this tablet** (gate A note 8, correcting version 1's false claim « said HERE
  first »): the lesson's TITLE « Rendre une fraction irréductible » says it on the title screen, the hub, the lesson
  list and the warm-up's header — as lesson 2's title said « PGCD » before its K1. It names the goal, never the
  criterion: no sentence, tile or hint says WHAT makes a fraction irreducible before this tablet.

#### K3 `diviser-par-le-pgcd` — islands C → D, the mirror of D

- **The bridge, his evidence**: a marked convoy of one, 1 786 cases, 722 lit, purse 93 (a coin per plank laid). C's
  workshop makes any length 2 … 1 786 (typed); its bench is lesson 2's notebook, `plain`: 1 786 = 722 × 2 + 342 |
  722 = 342 × 2 + 38 | 342 = 38 × 9 + 0 (`manual: 2`), its rows kept under the length box (`text.kept`). 722 = 2 × 19²,
  1 786 = 2 × 19 × 47. The planks that hold: 1, 2, 19, 38. 38 → 47 planks, 46 coins left; 19 → 94 planks, ONE coin short
  (its wrong try lasts about 10 s: below); 2 → 893. The brute-force window is 20 … 38 (19 lengths). He crosses with 38;
  the sign writes 722/1 786 = 19/47 — written FOR him: that is why the rule is forged in the mirror.
- **He holds** the notebook's three rows, the planks he made and what each did, the sign.
- **Experiment** (`measure`, `direct`) on 722/1 786 — the fraction of the bridge he crossed, **the typed box only** (no
  chips: the length is his to find, by the notebook he just ran or by the decompositions): ONE stage; the world counts
  both strips again in planks of his length, then tries the planks of the new numerator on the new denominator.
  « 2 » → 361/893 — the world lays 19 on both: « une étape ne suffit pas » → back to 722/1 786; « 19 » → 38/94 — 2 still
  fills both → back; « 38 » → 19/47 — nothing fills both: one stage was enough. A typed 342 or 9 (the notebook's first
  rest, its last quotient) is laid and leaves a piece: nothing changes. The writing is now HIS act; the wrong rules are
  refuted by writings (361/893, 38/94), not by the purse (gate A defect 1).
- **Scale** (kit work 3): `measure` draws strips up to ~130 cells; 722 and 1 786 need the long-strip drawing — a strip as
  one bar, the cuts drawn only when a plank is at least 3 px (38 → 47 cuts, 19 → 94 cuts on ~900 px; 2 → 893 cuts: one
  bar and the count). To verify in the first brief; no new mode.
- **Tiles** — frame « Pour rendre une fraction irréductible en une seule étape, » · slot « je prends » [leur PGCD · un de
  leurs diviseurs communs · leur plus petit diviseur commun autre que 1] × slot « et » [je divise le numérateur et le
  dénominateur par ce nombre · je divise le dénominateur seulement par ce nombre]. 6 rules; « la différence des deux
  termes » is dropped (gate A defect 1: refuted twice in lesson 2).
- **Refutations (computed — proof K3)**, by his own stages (or the forge's attack when he went straight to 38): any
  divisor → 361/893 (19 still) or 38/94 (2 still); the smallest → 361/893; « dénominateur seulement » → 722/47, another
  stretch.
- **Last step**: 558/682 — the notebook's three rows typed (682 = 558 × 1 + 124 | 558 = 124 × 4 + 62 | 124 = 62 × 2 + 0),
  PGCD 62, then 9/11 in one division (claims `pgcd`, `fraction`).
- **Tablet**: « Diviser par le PGCD » (built; shortened for the hub map) — 722/1 786 = (722 ÷ 38)/(1 786 ÷ 38) = 19/47.

#### K4 `resultat-irreductible` — island D → E, the mirror of E

- **The situation** (review §A.0 — it REPLACES the experiment, gate A defect 4): 78 cases lit in two strokes; the
  instruction: « L'équipe de Léa a éclairé les 5/6 de la passerelle, celle de Hugo les 2/39 » — 65 cases then 4 (the sign
  opens on 65/78 + 4/78 = 69/78). Moulds on D: 2, 3, 6, 13. 2 and 6 fill 78 and miss the post; 13 puts a joint exactly
  at the end of Léa's stroke (65 = 13 × 5) and misses the post (69 = 13 × 5 + 4) — the operand simplifies, the sum does
  not; only 3 holds: 69/78 = 23/26. As on B, the mirror of E opens once 13 and 3 have both been fired.
- **He holds** the sign and its fact: both crews' fractions were irreducible (5/6, 2/39), their sum is not.
- **Tiles** — ONE slot of four distinct rules (gate A defect 4), frame « Pour donner le résultat d'un calcul de
  fractions irréductibles, » [je le calcule, puis je cherche un facteur premier commun à ses deux termes et je le rends
  irréductible · je le calcule et je le laisse tel quel : il est irréductible comme elles · je le calcule et je le
  simplifie une fois, par le premier diviseur commun que je vois · je simplifie d'abord chaque fraction du calcul, puis le
  résultat est irréductible]. Each is a belief the bank's misconceptions name (the result left as it is; simplified once).
- **Refutations (computed — proof K4)**: « tel quel » and « chaque fraction d'abord » → his bridge, 69/78 (3 holds);
  « une fois » → the forge's attack on the SAME passerelle: 2/3 × 9/26 = 18/78 → by 2 once 9/39, 3 still fills both
  → 3/13.
- **Last step** (gate A defect 3: the product struck before multiplying is FOUND here, then named): item 1, GUIDED —
  3²/23 × (2 × 23)/(3² × 7), the decompositions shown: he taps the factors to strike (3², 23 — one tap per factor, in
  both terms), then types the product of what is left: 2/7 (the raw 414/1 449, once by 3 138/483, are what the world
  shows when he multiplies first); item 2, raw: 23/52 × 44/69 → 11/39 (raw 1 012/3 588; once by 2: 506/1 794, 2 and 23
  still). Typed as fractions (claim `fraction` with `calc`).
- **Tablet**: « Le résultat d’un calcul » (built; shortened for the hub map) — 5/6 + 2/39 = 69/78 = 23/26, and the line « dans
  un produit, on peut barrer avant de multiplier » with item 1 as its example — he did it before reading it.
- What each surface draws (review §A.6): the mirror's cases of K2–K4 are fractions drawn as the marked bridge's two bars
  (`pair`: whole, lit, the plank laid on both), named by their own head (« 69/78 → 23/26 »); products are never drawn
  (typed, in the last step, the trainer and the plaque); the board's cards follow the same.

### The open questions

1. **The plaque of the final mission is a NEW world piece** (§ The final mission, § Kit work): every mission built from
   existing pieces (a store of planks, a workshop with a purse, a convoy) is won by lesson 2's rule. The owner's « go »
   is needed; gate A agreed it is needed.
2. **Two plaques per run** (the cost of a try): what « walk back » means in this world — back to the quay of E and over
   the dash's bridge again (its gates do not replay) — is the owner's call; lesson 4's mission uses a purse of 3
   posters per run.
3. **No French brevet paper on fractions is filed** in `docs/curriculum/officiel/`: every ported exercise is `adapted`.

**Decided by default by the main session on 2026-11-26 (the owner said « continue »; he may override any line):** go
for the plaque; « walk back » as written here (after two blank plaques, he walks back to E's quay and the run starts
again); the two `measure` options (hide the typed box, strips longer than 130 cells) are built as options of the kind,
off by default; 5/6 and 2/3 accepted as calculation operands.

### No rule told before its seal — where a rule could leak, and how it is avoided

| Where | Risk | What the lesson does (checked by `inquiries.test.js` / `lockedNames`) |
|---|---|---|
| the title, the hub, the lesson list | « irréductible » in the lesson's name | stated, accepted: the GOAL's name, as lesson 2's « PGCD »; never its criterion |
| instructions and robot lines, A → C | « simplifie », « barre les facteurs communs », « aucun facteur commun », « PGCD » | facts only (« 246 = 3 × 82 ; 138 = 3 × 46 : la planche de 3 tient »). Forbidden per stretch: A–B « simplifi », « barr », « commun », « PGCD »; B–C « aucun facteur », « premiers entre eux » (never, in the whole lesson); C–D « une seule étape », « dernier reste »; D–E « vérifie le résultat » |
| the recall card | a line that reads the rule | decompositions and divisions only, never « 3 est commun » |
| `measure`'s texts (K1, K3) | the kit writes no word; the lesson's could | K1 `counted`: « En planches de 3 : 69 = 3 × 23 et 123 = 3 × 41 »; K1's end button is his claim (above); K3 `notEnough`: « une étape ne suffit pas : 19 remplit encore 361 et 893 » — a fact, never « prends le PGCD » |
| the K3 bench | naming which plank to make | `plain` notebook: rows only, no gold, no planks column |
| the tiles | a right tile worded more precisely than the wrong ones | same grammar inside a slot; K2's right tile is « aucun facteur premier commun », not « premiers entre eux » |
| hints and nudges | a sentence that states the rule | a nudge is a case laid in the mirror |
| tablets | K1's telling K2's criterion, K2's telling K3's method | K1: no criterion; K2: « PGCD est 1 » tied to his own bridge, nothing about dividing by it; K3: nothing about results of calculations |
| the hub, warm-up, lab, board, trainer | a key's name early | the warm-up family `4e.m1.r07` says « one number divides both »; the lab's `strip` names nothing; board stations and trainer questions unlock after each seal |
| the dash and the plaque | — | after all seals; the plaque says « irréductible », never which method; its refusals never give the answer |

### The final mission — the lighthouse plaque (island F → G)

After the dash, on island F, the keeper's plaque. **Its text states the calculation** (gate A defect 2b): « Sur la
jetée, les 85/87 des lanternes sont allumées, et les 3/34 des lanternes allumées sont rouges. La part des lanternes
rouges est $\dfrac{3}{34} \times \dfrac{85}{87}$. Grave-la sur la plaque, sous forme irréductible. » Modelling the fraction
of a fraction is `calculer-avec-des-fractions` (out of scope): the product is given; the lesson's work is to make it
irreducible. He types a fraction (the kit's fraction box).

- **A try costs** (gate A defect 2c; lesson 4's posters, lesson 2's purse): the keeper gives TWO blank plaques per run;
  each engraved plaque is used up. After two refused plaques, he walks back to the quay of E for two new ones
  (open question 2). The chip « plaques : 2 » shows what is left.
- **The refusals never give the answer** — no number, no plank, no count: a fraction that is not the product — « Ce
  n'est pas la part des lanternes rouges » (also the slip « add across », 88/121); an equal fraction that is not
  irreducible (255/2 958, the distractor 85/986, 15/174) — « Le gardien refuse : cette fraction s'écrit encore avec des
  nombres plus petits ». Version 1's cross products and counts are gone.
- **The drawing is coherent and keeps the 17 hidden** (gate A defect 2a): the jetty stays DARK until the right plaque
  — no lantern count is ever written; on 5/58 the jetty lights: 174 lanterns, 170 lit, 15 red (= 5/58; 174 and 15
  hold no 17), and he crosses to G, the finale.
- **The distractor 85/986** is what the rules of 2, 3, 5 give (255/2 958 by 3, then nothing visible: 85 = 5 × 17,
  986 = 2 × 17 × 29). The lesson's road: strike before multiplying, by the decompositions (3/(2 × 17) × (5 × 17)/(3 × 29)
  → 5/(2 × 29): P2 + P3), or multiply and divide by PGCD(255 ; 2 958) = 51 (P4) — then know it is finished (P1).

**Why lessons 1–2 do not win it — honestly** (gate A defect 2c): with lessons 1–2 he can multiply and simplify the 4e
way; he engraves 85/986 and is told only « s'écrit encore avec des nombres plus petits ». On his SECOND plaque, a student
who then decomposes 85 and 986 with lesson 1's ladder finds the 17 and wins — so the mission is winnable on a second
plaque without this lesson. What it measures is the FIRST plaque: knowing, before engraving, that a writing is finished
only when no prime is common (P1) and how to get there (P2 or P4). The first try is the evidence (only exam-format first
tries count, CLAUDE.md); a student without the lesson spends a plaque, and after two, a walk back.

### Numbers (reserved for this lesson)

Islands: 246 / 138 lit (moulds 2 3 5 7; sign 69/123, 46/82; end 23/41) · 96 / 65 lit (moulds 2 3 5 13 1) · 1 786 /
722 lit, purse 93 (plank 38, 47 planks, 46 left; the notebook writes 342, 38) · 78 lit 65 + 4 (moulds 2 3 6 13; 69/78 =
23/26). Mirrors: K1 69/123, 52/76 (26/38, 13/19); K3 722/1 786 (361/893, 38/94, 19/47). Attacks: K2 95/228 (= 5/12);
K4 2/3 × 9/26 = 18/78 (9/39, 3/13). Last steps: 735/588 = 5/4, (2 × 53)/(2² × 7 × 53) = 106/1 484 = 1/14 ·
PGCD(65 ; 96), 141/253, 238/287 = 34/41, 204/289 = 12/17 · 558/682 (124, 62) = 9/11 · 3²/23 × (2 × 23)/(3² × 7) = 2/7
(414/1 449, 138/483), 23/52 × 44/69 = 1 012/3 588 = 11/39 (506/1 794). Dash (all six waves, every gate): (2 × 41 × 3)/
(2² × 3 × 23) → 41/46 · 82/92 · 41/23; « laquelle est irréductible ? » 39/50 · 52/65 · 85/238; PGCD(289 ; 663) = 17 →
17/39 · 289/39 · 39/17; (2² × 13 × 19)/(2³ × 13²) → 19/26 · 38/52 · 19/52; 10/23 × 17/20 → 17/46 · 85/230 · 34/92;
319/551 → 11/19 · 319/551 · 29/1 (the numerator asked: 11 · 319 · 29; 551 replaces 629, a number of lesson 2's board). Mission: 3/34 × 85/87 = 255/2 958 = 5/58 (85/986, 15/174, 88/121; 174 lanterns, 15
red).

**Checked** (proof « freedom »), in three ways:
1. every pair with a term ⩾ 20 and every number ⩾ 100 a screen writes — refutation lines, every dash gate and every
   attack included (gate A defect 5) — with the collision function of `scripts/lesson-bank-numbers.mjs`
   (`bank.js › collisions`) against all FIVE 3e banks (lessons 1, 2, 4, Thalès, this lesson's own) and every French
   story: 65 groups CLEAR. `node scripts/lesson-bank-numbers.mjs <id> --check <the 65 groups>` was also run once per
   bank: 65 CLEAR in each (`fraction-irreductible-numbers.out`);
2. every SMALL fraction (both terms < 20) shown as a result or a gate is written by NO bank (`\dfrac{p}{q}` or `p/q`
   searched in every sheet) — version 1's « pairs under 20 were not used on a screen » was false (8/12, gate A 5), and
   its 5/26, 1/12, 7/10, 3/10, 3/4, 3/14, 1/2, 2/5, 34/51 were replaced. **Accepted, and named**: the operands 5/6 (the
   crews' first fraction, K4) and 2/3 (the K4 attack's first operand) — the commonest fractions there are, written by six
   sheets and more, never a result, a gate or a headline; the only bridge with a free whole, sum and result was this one;
3. numbers under 100 by hand against the reserved lists: none of lessons 1–2's except 15 (the 15 red lanterns of the
   final drawing: lesson 2's purse of 15 coins — a count in a drawing, accepted); of lesson 4's, 26 (its dropped
   version-1 plank: 23/26, 26/38, 19/26) and 37 (dropped with 481/629: the dash's last wave is now 319/551 = (11 × 29)/(19 × 29)).

**Changed from the « keys and numbers only » section, with the reason**: 154/210 → 246/138 (the mirror's strips must be
⩽ 130 cells and start from his sign); 858/1 131 → 1 786/722 (858 and 273 are in lesson 2's bank; 22/29 showed lesson
2's 29); 5/12 + 7/30 = 39/60 → 5/6 + 2/39 on 78 (60 is lesson 1's ladder and lesson 4's PPCM); 6/35 × 14/15 = 84/525 →
3²/23 × (2 × 23)/(3² × 7) (84 is a headline of lesson 1's bank); 65/96 KEPT.

### Kit work — one item needs the owner's « go »; the rest is reuse or a small option

1. **NEW (owner's go): the plaque** — a store view of the last island: the story's text (the product), a fraction box
   (the kit's, as in a forge's last step), the chip of plaques left (2 per run), the two refusal sentences (no number),
   and on the irreducible writing the jetty lit (174 lanterns, 15 red) and the finale. Files: `divisorIsles/Game.js`
   (`bossOverlay('write')`, `boss.write: { calc, p, q, plaques: 2 }` on the last segment, the walk back), the store's
   screen, `GAME_WORLD.md` §2ter-1, a render test. No new kind or mode of experiment.
2. **`measure`: a spec flag `typed: false`** (K1: chips only) — today the typed box is always on screen. A spec option,
   not a mode.
3. **`measure`: long strips** (K3 on 722/1 786 — today ~130 cells): a strip drawn as one bar, the cuts only when a plank
   is ⩾ 3 px. To verify first; if the kit already scales, nothing.
4. **To VERIFY in the first brief** (one look or one render test each): `measure` (`stages`, `direct`) mounts and plays at
   1366 × 768 here (render tests exist; no French walk has shown it); a marked bridge with `strokes` in a story; a mould
   of 1; a marked convoy of one with a purse and a typed workshop whose bench is `ladder`/`divide` with `text.kept`; a
   forge's evidence reading the island signs and a kept inquiry (DZ's `gather`); the story hook that keeps a mirror shut
   until named planks were fired (K2, K4 — as DZ's `writings`).
5. **The warm-up family `4e.m1.r07`** (ported, above) and the lab tag `strip`.

**Built as (2026-11-26, the kit agent)** — items 1–3:
- 1, the plaque: a VARIANT of lesson 4's `story.mission` (not `bossOverlay('write')` / `boss.write` on the last segment):
  `story.mission = { at: <F>, opens: <the standing road F → G>, plaques: 2, refill: { at: <E> }, write: { calc: { x: 3, y: 34,
  op: '*', z: 85, w: 87 }, p: 5, q: 58 }, jetty: { lanterns: 174, lit: 170, red: 15 }, check(values, writing), text, … }`.
  The world judges the fraction (`plaque.js › writingOf`: `other` / `notReduced` / `ok`); the story's `check` writes
  the two refusals (no number). After two refused plaques the board is shut until he stands on E's island again; the
  ridden dash rail is then walkable. The road F → G stays shut and dark until 5/58, then stands, its lanterns lit; the
  finale plays on G. Shapes and hooks: `GAME_WORLD.md` « THE FINAL MISSION » (the plaque).
- 2, `measure` `typed: false` (spec or round; needs chips) — built, off by default.
- 3, `measure` `long: true` — built, off by default: one bar per strip, a plank under 3 px one band with its count
  (722/1 786: 2 → bands of 361 and 893; 19 and 38 drawn plank by plank). Without it, a long strip is a bar and a thin
  plank is not drawn at all (as before).

### Bank plan — 50 exercises, 10 per palier, every one `brevet` and `calculator` tagged

**The bank was written TODAY, in parallel with this design** (skill §2 step 0: « the brevet bank FIRST »), by the bank
agent: `content/practice/3e/fraction-irreductible/level-1…5`, 50 sheets, 144 primary questions, its report
`reports/fraction-irreductible-bank.md` (validated `--strict` on a scratch copy with its appended misconceptions). The
design does not re-plan it: it is the source of what the student must DO (§0ter), and the keys were weighed against it.
Read from the files (2026-11-26):

| Palier | brevet | P1 (irreducible?) | P2 (decompositions) | P3 (a result, irreducible) | P4 (by the PGCD) | sheets by their main point |
|---|---|---|---|---|---|---|
| 1 | 1, `calculator: false` | 3 | 3 | 2 | 2 | 10 |
| 2 | 1, `calculator: false` | 3 | 3 | 2 | 2 | 10 |
| 3 | sheets 1–7 part 1, 8–10 part 2 | 3 | 3 | 3 | 1 | 10 |
| 4 | 2, `calculator: true` | — | — | 5 | 5 | 10 |
| 5 | 2, `calculator: true` | — | 4 | 3 | 3 | 10 |

Totals — sheets: P1 9, P2 13, P3 15, P4 13; primary QUESTIONS: P1 21, P2 45, P3 43, P4 35. Brevet part 1: 27 sheets,
part 2: 23. **The keys weigh what the bank weighs** (review §A.9): K1 (P2), K4 (P3), K3 (P4) carry ~13–15 sheets each and
the richest experiments or situations; K2 (P1) — the condition every other key ends on — 9, all in brevet part 1
(automatisms: « est-elle irréductible ? »). The French method is the bank's heaviest point (P2, 45 questions), as K1 is
the first key. Ports: 10 DZ sheets (`dz_port`: `l2-001`, `l2-008`, `l1-004`, `l4-002`, `l1-008`, `l2-004`, `l5-009`,
`l5-001`, `l5-006`, `l5-005`), every number changed; DZ's « successive divisions » rewritten as the prime-factor method;
`l4-006` ((n + 7)/(n + 1)) and the `awwaliyan` bank not ported. Answer types: `rational` 110, `choice` 20,
`factorization` 10, `integerSet` 4.

What the design asks of the bank (for the main session; not done here — this design touches no file): (1) palier 4
has no P1 and no P2 sheet — the mission's road (decompose to see a hidden prime in a big product) has no part-2
exercise at palier 4; one P2 sheet there, in place of a P3, would mirror the plaque; (2) the world's numbers above were
checked against the bank AS IT STANDS — if the bank changes before the commit, the proof script is run again.


### The walk's outline (the descriptor is written with the lesson, from it)

Islands, in one line ahead (play.md §2): A the quay (moulds), B the mirror and the second bridge's moulds, C the mirror
and the workshop, D the mirror and the moulds, E the mirror, F the dash's end and the plaque, G the lighthouse. Seven
islands. Their names are new words (`story.test.js`).

| # | Screen | What the student does | What the walk checks |
|---|---|---|---|
| 0 | Launch (« L'échauffement ») | `BIG_DECOMPOSITION` (lesson 1's) and the new `4e.m1.r07` family (one number divides both terms) | no criterion of « irréductible », no « simplifier » |
| 1 | Title → A | reads: the lit stretch, one kind of plank, the post must stand on a joint | instruction stays; moulds 2 3 5 7 |
| 2 | A → B | **wrong first try**: 5 (246 = 5 × 49 + 1, the bridge crumbles), reload; 2 holds (69/123); the instruction asks again; 3 holds (= 46/82) | sign « 138/246 = 69/123 = 46/82 »; mirror locked until both |
| 3 | B, the mirror — K1 | `measure`/`stages`: types 69 = 3 × 23, 123 = 3 × 41; chip 3 → 23/41, end claim; 52/76: chip 2 → 26/38, a claim answered by 2, chip 2 → 13/19 → tiles (8) → test → seal → last step (735 and 588 decomposed by him, 5/4; 1/14) → tablet | no typed box on the experiment; case « 52/76 → 26/38 »: « une seule fois » says FALSE where the world says 2 still fills both; the name only on the tablet |
| 4 | B → C | **wrong first try**: 1 first — the sign stays, the instruction sends him back to try 2, 3, 5, 13; then 13 (96 = 13 × 7 + 5), 3, 2, 5 | the mirror of C stays shut until the four were fired |
| 5 | C, the mirror — K2 | tiles (12) → test on his signs → attack 95/228 → seal → last step (PGCD(65 ; 96) = 1; 141/253 oui; 238/287 non → 34/41; 204/289 non → 12/17) → tablet | no « premiers entre eux » anywhere; the tablet's example is his bridge |
| 6 | C's workshop → bench notebook (1 786 ; 722) | types (722 ; 342), then (342 ; 38); the notebook ends | `plain`; the kept card shows 3 rows under the length box |
| 7 | C's workshop (typed), C → D, purse 93 | **wrong first try**: 19 — 93 planks laid, the purse empty one short; walks back; 38 | ≈ 10 s (below); 47 planks, 46 coins left; sign 722/1 786 = 19/47 |
| 8 | D, the mirror — K3 | `measure`/`direct` on 722/1 786, typed: 2 → 361/893 « une étape ne suffit pas », 38 → 19/47 → tiles (6) → test → seal → last step 558/682 (3 rows, PGCD 62, 9/11) → tablet | case « 722/1 786 → 361/893 »: « un diviseur commun » says TRUE, the world lays 19 on both; long strips drawn |
| 9 | D → E | **wrong first try**: 13 (a joint at the end of Léa's stroke, not at the post), then 3 | sign « 65/78 + 4/78 = 69/78 = 23/26 »; mirror locked until 13 and 3 were fired |
| 10 | E, the mirror — K4 | tiles (4, one slot) → test on his bridge → attack 2/3 × 9/26 = 18/78 → seal → last step (taps 3² and 23 to strike, types 2/7; 11/39) → tablet | case « 5/6 + 2/39 → 69/78 »: « tel quel » says it stays, the world's plank 3 holds |
| 11 | E → F, the dash | six waves | one right gate each (proof) |
| 12 | F, the plaque | **wrong first try**: 85/986 → « s'écrit encore avec des nombres plus petits », plaques 2 → 1; reload: 5/58 | no number in a refusal; the jetty dark until 5/58, then 174 lanterns, 15 red; arriving at G plays the finale; the problem module is marked |
| 12b | F, the plaque, two refused | a second wrong plaque | plaques 0 → the walk back to E's quay, two new plaques |
| 13 | End | — | four tablets in « Mes règles »; the revision page opens (`revision.js`) |

**The screens to look at first** (gate A note 9; skill §0bis — the first walk's ten): (1) K1's `measure` with the two
decomposition lines over the strips and the prime chips (it has never been seen at 1366 × 768); (2) K1's tiles — slot 1
holds options of ~80 characters; (3) K2's six-option slot; (4) K3's `measure`/`direct` on 1 786-cell strips (kit work 3);
(5) K4's one slot of four options of ~90 characters; (6) the plaque — three sentences, the product, the box, the chip,
a refusal line; (7) the jetty lit (174 lanterns); (8) the sign of K4's bridge in two strokes (« 65/78 + 4/78 = … »);
(9) K4's guided last step (the taps to strike); (10) the purse running out on the wrong try 19.

**The wrong try 19, timed** (read in `Game.js › forge`, not run): a plank every max(7/q, 3.4/q) s capped at 0.42 s,
q = 94 planks needed → 0.074 s; 93 planks paid → 6.9 s, plus 0.9 s before and 0.35 s after, the purse line, the crumble
1.15 + 92 × 0.0065 ≈ 1.7 s: **about 10 s**, then the walk back across C → D. Acceptable (lesson 2's « 10 403 » convoy
had the same); the walk must wait for it (`purseOut`), not time out. If the owner finds 10 s long, the cap is the kit's,
not this lesson's.

### Gate A, answered

| # | Gate A defect | What changed (version 2) |
|---|---|---|
| 1 | K3's situation is lesson 2's K4 replayed; refutations by the purse, never by a writing | K3's forge has an `inquiry` (`measure`, `direct`) on 722/1 786, typed box only: one stage, « une étape ne suffit pas » on 2 (361/893) and 19 (38/94), 38 ends it; the bridge (convoy, notebook, purse) is its EVIDENCE. Unique: K1 is (`measure`, `stages`), lessons 1–2 never used `measure`; the brief says why the modes differ. Tile « la différence » dropped (6 rules). Long strips: kit work 3 |
| 2a | the jetty « 58 lanterns, 5 red » contradicts 85/87 | the jetty stays dark until the right plaque, then 174 lanterns, 170 lit, 15 red (= 5/58); no count is written; 174 and 15 hold no 17 |
| 2b | the plaque gives no calculation; the cross product hands the product | the plaque WRITES « 3/34 × 85/87 »; refusals are two sentences without a number |
| 2c | free retries + the count give K2's verdict for nothing | two blank plaques per run, then a walk back to E's quay; refusals never count nor name a plank; « why lessons 1–2 do not win it » now says honestly that a second plaque can be won without the lesson, and that the first plaque is what is measured |
| 3 | K4's tablet tells « strike before multiplying », found by nobody | K4's last step item 1 is GUIDED: the decompositions shown, he taps what to strike, then multiplies (2/7); the tablet line names what he just did |
| 4 | K4's `part` experiment refutes a made-up belief; 3 × 3 incoherent tiles | no `inquiry`: the bridge 65 + 4 is the situation; one slot of 4 distinct beliefs; refuted by his bridge and the attack 2/3 × 9/26 = 18/78 |
| 5 | 34/51 is a headline of this bank; 8/12 on a screen; gates and attacks not checked | every dash gate and attack is in the proof's collision list (65 groups, all five banks CLEAR) and every small fraction is searched in every sheet; 34/51, 8/12 and the dash's 5/26, 1/2, 2/5, 3/15, 26/65 replaced; the dash renumbered whole |
| 6 | the typed box lets him type 4; he never decomposes himself | K1's experiment has chips only (kit work 2) — « 2 struck twice » is seen; he types the two decompositions at its start; the last step's item 1 starts from the raw 735/588 |
| 7 | K2's evidence depends on his tries (1 first) | the mirror of C opens only when 2, 3, 5, 13 were all fired (as A's `writings`); the same for K4 (13 and 3) |
| 8 | K1's end button; « irréductible said first on K2's tablet » false; « PGCD est 1 » told | the end button is written down as HIS claim that K2 then forges on the decompositions; the title's « irréductible » is stated (goal, not criterion); K2's last step asks PGCD(65 ; 96), which he saw on the bridge, and the tablet cites it |
| 9 | not seen at 1366 × 768; the 93-plank try | the ten screens to look at first are listed; the wrong try 19 is timed (≈ 10 s) from `Game.js` |
| 10 | 14/77 shows its 7 | the attack is 95/228 (= 5/12): 19 hidden, odd over even, no 2, 3, 5 in common |

### What this design could not verify

- No screen of `measure`, a marked bridge with strokes, or a marked convoy has been seen in a French browser; the
  1366 × 768 fit of the ten screens above is NOT checked.
- Whether `measure` already draws 1 786-cell strips, and whether its typed box can be hidden (kit work 2, 3): read in the
  docs, not in a render.
- That a French forge's evidence can read the island signs and a kept inquiry as DZ's `gather` does.
- The bank was written by another agent; I read its distribution and checked every world number against it, I did not
  review its sheets. The banks of lessons 3 and 4 are still moving: the proof script (which reads them live) must be run
  again before the commit.
- The plaque and its walk back do not exist; their words are a plan. The 10 s of the wrong try are read, not measured.

## Lesson 4 — `multiples-et-diviseurs-communs` — keys and numbers only

> **Superseded** by the full design at the end of this page (2026-11-26, version 2, after gate A). Kept as the
> record of version 1.

Port source: none whole (the table: DZ `jam-tarh-kasrayn` finds a common denominator by scanning multiples, not v2).
Keys:

| # | Key | Rule | On what | Point |
|---|---|---|---|---|
| 1 | `multiple-commun` | two rhythms meet again at a common multiple; the first meeting is the smallest | planks of 21 and of 26 laid from the same end of one long walkway: their joints first meet at 546 (then 1 092). The experiment is open: a mode of `cycle` (one plank on growing gaps) or of `join` / `stack` (k copies of one gap) if one can carry two rhythms — else a new mode, which needs the owner's go | P1 |
| 2 | `ppcm-facteurs` | the smallest common multiple: every prime seen in either decomposition, with its LARGER exponent | 2³ × 3² × 5 (360) and 2² × 3 × 13 (156) → 2³ × 3² × 5 × 13 = 4 680; its distractor is lesson 2's rule (common primes, smaller exponents: 12) | P2 |
| 3 | `rendez-vous` | read the smallest common multiple as a duration or a number of turns | two lighthouses every 16 s and every 20 s → together again after 80 s; gears of 32 and 20 teeth → 160 teeth, 5 and 8 turns | P3 |

Reserved: 21, 26, 546, 1 092, 360, 156, 4 680, 16, 20, 80, 32, 160 — checked CLEAR (pairs and numbers ≥ 100). Version
1's planks 18 and 33 (lesson 2's K1 plank and K4 gap) and 588 (on lesson 2's sheet in version 1) are dropped; rejected
too: planks 10 and 14 (a line of lesson 1's bank holds both), 15 and 25 (150 in lesson 1's bank), 12 and 35 (35 is
lesson 2's).

### Lesson 4 — the owner's direction (2026-11-23), to redesign from before any code

A council (5 advisors, peer review, chairman) and the owner agreed: **keep the archipelago** (no new world; the
three-proposition page is for new worlds). The keys above are to be redone around what the student DOES:

- **21 and 26 are dropped as the opening pair**: coprime, so 546 = 21 × 26 teaches « the PPCM is the product ». Open on
  16 and 20 (80, not 320); a coprime pair last, as a special case; 546 cells cannot be drawn at 1366×768 (a scale rule
  for 80 and 160 too, decided before code).
- **The core situation**: two crews build ONE walkway from the same shore, planks of 16 and of 20; the pillar holds only
  where both finish a whole plank; the student places the pillar BEFORE the crews lay; the purse pays the wood, so
  320 holds but ruins him; the world says facts (« l’équipe B s’arrête 4 cases avant le pilier »).
- **Then**: big numbers make the decompositions necessary (larger exponent; lesson 2's rule gives 12 and fails, the
  product is too far); a story translated BY HIM into crews (nothing drawn as a gear; the 32-tooth gear makes 5 turns,
  not 8); a « PGCD ou PPCM ? » step on the same pair, the wrong choice shown by a fact; PGCD × PPCM = a × b kept for
  lesson 5.
- **The workshop (owner's exercise, his choice of rhythm)**: five teams start together on day 1; team x works 1 day
  then sleeps x days (cycles 2, 3, 4, 5, 6). The student runs it day by day, team by team, sees teams working and
  sleeping, the five tables of multiples lit at once (0 at the top of each). Question: the next day all the teams work
  together → **day 61** (PPCM(2, 3, 4, 5, 6) = 2² × 3 × 5 = 60). Computed: teams 1–2 meet on day 7, 1–3 on day 13, 1–4
  on day 61, and team 5 changes nothing (6 = 2 × 3 — the moment the decompositions matter); four of five work on days
  13, 25, 31, 37, 49 (the world names the one asleep); the product 720 is far too far; day 1 is « 0 days since the
  start », a multiple of everything, hence « the smallest NON-ZERO common multiple ». Caught by nothing here:
  PPCM(1, …, 5) is also 60, so a student who takes the sleep days for the cycle is right by luck — a later mission must
  catch it with other numbers. Rejected by the owner: « x days on, x days off » (all work together on day 25 by chance;
  the true realignment is day 121) and « x days on, 1 day off » (the first empty day is 60).

## Lesson 4 — `multiples-et-diviseurs-communs` — « Engrenages et rendez-vous : quand deux rythmes se retrouvent »

**Built (2026-11-26, uncommitted)** — 4 keys (`pilier-commun`, `ppcm-facteurs`, `traduire-rendez-vous`, `cinq-equipes`), 50-exercise bank; walked at 1366×768, 0 FAIL (story 1445, hub 335, trainer 779, board 329, sitting 2610); gates A and B « go with corrections ». Owner's choices taken by default: « plus petit multiple commun » in full, no gear, teams as rows. Debts: evidence list opens scrolled, kit subtitle wraps with four steps, translucent panel, typed « 2129 » ungrouped, « avant » in the 110 px team column. Cost and defects: `TWO_PLATFORMS_PLAN.md` §9.

Written BEFORE any code, from the owner's direction of 2026-11-23 (« Lesson 4 — the owner's direction »), which it
follows point by point; everything below is a plan. **Version 2, after gate A** (verdict « go with corrections », 13
defects — each answered in § « Gate A, answered » at the end; 8 and 9 are the owner's). Every number is computed by ONE
script beside this file, `multiples-et-diviseurs-communs-design-proof.mjs` (`node …-design-proof.mjs` → « every line
ok », 111 lines);
every collision by `…-design-check.mjs` over the FIVE 3e banks (lesson 1, lesson 2, lesson 3 `fraction-irreductible`,
Thalès, and this lesson's own bank, written today) and every story — outputs `…-design-numbers.out`,
`…-design-numbers-own-bank.out` (the latter is `scripts/lesson-bank-numbers.mjs multiples-et-diviseurs-communs --check`).
The search script that picked the numbers is `…-design-pick.mjs`.

Folder: `apps/web/src/lessons/college/3e/nombres_calculs/multiples-et-diviseurs/multiples-et-diviseurs-communs/`.
World: `divisor-isles`. Learning points (ids locked): P1 recognise that simultaneous repetitions are a common-multiple
problem; P2 the smallest non-zero common multiple from the prime decompositions; P3 solve a rendez-vous problem in
context and read the smallest common multiple as a duration or a number of turns. Programme item `3e.m1.r07`
(« engrenages, conjonction de phénomènes »).

### Port map (skill §1bis, steps P1–P5)

The table (`fr_dz_table.json`) has ONE row: DZ 3AM `jam-tarh-kasrayn`, `partial`, not v2, FR P2 ↔ DZ P3 (« the smallest
common denominator, found by scanning the multiples of the larger denominator »). DZ root:
`../smarter-academy-dz/apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/kusur-natiqa/jam-tarh-kasrayn/`.
**Nothing ports whole.**

| DZ piece | Decision | Target | Why / conversion |
|---|---|---|---|
| the lesson's modules `Module00…08` (non-v2 pages: activity, rule, method, exercises, three problems, test), `content/{exercises,problems,textbook}.js` | **cut** | — | not v2; its subject is adding fractions (France: 5e–4e); a textbook source is never used |
| its method « scan the multiples of the larger denominator » | **kept as a METHOD the student may use, not a key**: it is what a student does on K1's walkway with paper, and K2 shows its cost (32 tries) | K1, K2 | not a wrong rule; the wrong rule is « a multiple of the larger is enough » |
| its bank `content/practice/3am/jam-tarh-kasrayn/level-1…5` (50, fraction sums) | **cut**. The bank agent wrote this lesson's bank on 2026-11-26 and found no DZ sheet that fitted (its report: « nothing fitted P2 »). Three candidates were looked at here — `l1-005` (smallest common denominator of 4/9 + 5/6, signatures product / sum / larger), `l2-010` (4/15 and 5/18 → 90), `l2-004` (5/8 + 7/12 with 96 and 24) — they sit on the 4e automatism « trouver un dénominateur commun » (programme 2026, Automatismes); if the owner wants that link, port ONE as `adapted`, renumbered (18, 54, 90, 96 are other lessons' numbers) | (bank) | open question 6 |
| class test, board, walk, warm-up of DZ | none exist for this point | built new | — |
| lab instruments (here, untagged): `jumps` « Les sauts des multiples » (one jump length, a flag) | **tag** `jumps` for this lesson; `factor` (lesson 1's) stays tagged to lesson 1 | `lessonlab/registry.js` | its name says « multiples », a word he owns since 6e — no key's name |
| launch-kit families of the prerequisites | **reuse** `BIG_DECOMPOSITION` (`3e.m1.r05`) and `DIVISOR_LISTS` (`4e.m1.r08`), already in `launchkit/families.js` | — | nothing new |
| the world, the purse, the bench, the sheet, the gate dash, the forge | **reuse** (here, French) | `gameworld/divisorIsles/`, `kit/` | — |
| the two-crew walkway, the five-team calendar, a story read into crews | **DZ lacks them — built new** (§ New engine pieces) | `gameworld/divisorIsles/` | NEW — needs the owner's go |

### What is new for the student

He holds from lesson 1: decomposing (the factor ladder), powers, where to stop, the spreadsheet of remainders for a
large number (primes up to 89, 24 lines); from lesson 2: one plank for two gaps, the PGCD, the PGCD by the SMALLER
exponents of the common primes, Euclid, sharing into lots. From 6e–4e: multiples, tables, divisibility. None of it is
forged again. The PGCD tiles of lesson 2 come back here as WRONG options.

NEW, in the student's order (not the list's): the world turned round — until now he chose the PLANK for a given gap;
here two planks are given and he chooses where the gap ENDS (the pillar): from two rhythms TO the place they meet (play.md
§4, the gesture runs the way of the concept). Then: why the smallest, why not 0 (K1); the decompositions when listing is
too long, with the LARGER exponent and every prime (K2); a story that is not a walkway, translated by him into crews and
read back as turns or a clock time, and « PGCD ou PPCM ? » (K3); more than two rhythms, a day count from 1 not 0, a
rhythm that divides another changing nothing, the cycle that is NOT the sleep (K4). **Four keys** (lessons 1 and 2 had
four).

### The keys

| # | Key (id) | The rule he writes | Nature | Experiment (kind, mode) — unique in this lesson, not a key experiment of lessons 1–2 | Numbers | Point |
|---|---|---|---|---|---|---|
| K1 | `pilier-commun` | The pillar holds where BOTH crews finish a whole plank — a length that is a multiple of each plank; the cheapest is the smallest of them that is not 0 | a search for the smallest element of an intersection, with a reason (a cost) and an exclusion (0) | **a situation** (review §A.0): walkway segment, NEW `walkway`, fixed scale, purse; the forge has no `inquiry` | planks 16 and 20, ruler 0…400, purse 14 → 80 | P1, P2 |
| K2 | `ppcm-facteurs` | To write the smallest common multiple of two decomposed numbers, multiply EVERY prime seen, each with its LARGER exponent | a reading of two decompositions (a maximum per prime) | **a situation**: walkway segment `walkway`, mode `fit` (per-try scale), with lesson 1's `sheet` as its bench (two rounds), purse; no `inquiry` | 414 = 2 × 3² × 23 and 192 = 2⁶ × 3 → 2⁶ × 3² × 23 = 13 248; purse 120 | P2 |
| K3 | `traduire-rendez-vous` | Two rhythms that start together meet again first after their smallest common multiple; each has then repeated (that number ÷ ITS OWN period) times — a number of turns, or a duration added to the start | a modelling: translate into the walkway, solve, translate back | NEW kind `crews`, mode `story`, in the mirror | gears 32 and 20 teeth → 160 teeth, 5 and 8 turns; buses every 10 and 46 min, together at 6 h 10 → 10 h 00; its own ruler 0…700 | P1, P3 |
| K4 | `cinq-equipes` | The next day all teams work together is day 1 + the smallest common multiple of their CYCLES, a cycle being 1 day of work + the days of sleep | the conjunction of several periodic phenomena counted from day 1 (a pattern in time) | NEW kind `crews`, mode `days`, in the mirror — the owner's exercise | cycles 2, 3, 4, 5, 6 → 60 → day 61; last step THREE teams, cycles 4, 14, 19 → 2² × 7 × 19 = 532 → day 533 | P1, P2, P3 |

K1 and K2 share the walkway situation, as lesson 2's K1, K3, K4 shared the convoy: the walkway IS the common multiple
(two rhythms from one start, one place where both end). What is each key's own is what the world gives him to place the
pillar: small planks on a ruler and NO bench (K1); planks too long to list, and lesson 1's spreadsheet as the bench
(K2). That is lesson 2's precedent (one situation, the bench is each key's own), and it is the honest claim: the
`fixed` / `fit` difference is only how the ruler is drawn, not an experiment (gate A, defect 10). K3 (`crews`/`story`)
and K4 (`crews`/`days`) are mirror experiments of their rules' nature — a modelling, a pattern in time; lesson 1's key experiments were `ladder`/`factor`, `pairs`, `sheet`; lesson 2's were situations and
(`deal`), (`nest`, `pair`) — none is reused as a key's experiment here (the `sheet` is again only a bench).

**The purses are never exact** (lesson 2's rule). K1: a plank costs 1 coin whatever its length; the pillar at d costs
d/16 + d/20 = 9d/80 planks; 14 coins pay d ⩽ 124, and the only pillar that holds there is 80 (9 planks, 5 coins left).
K2: 120 coins; 13 248 costs 32 + 69 = 101; the next pillar that holds, 26 496, costs 202. Neither purse reads the answer.

#### K1 `pilier-commun` — islands A → B, the mirror of B

- **Situation** (the owner's core): two crews build ONE walkway from the same shore of island A, crew A (« l’équipe A »)
  with planks of 16 cases, crew B with planks of 20, each on its own half (two lanes side by side); a coin per plank
  laid; 14 coins. Island B floats and moors at the pillar; the pillar holds only where BOTH crews finish a whole plank.
  **He places the pillar BEFORE the crews lay**: he types its distance in « Le pilier à □ cases du bord » (0 … 400),
  sees it stand on the drawn water, then presses « Les équipes posent ». The instruction states only the constraint
  (two crews, planks of 16 and of 20, one pillar where both end, a coin per plank, 14 coins); paper mode stays open.
- **What the world says — facts only** (computed, proof K1): at 64 « L’équipe B s’arrête 4 cases avant le pilier »
  (the owner's sentence: A 4 planks, ends; B 3 planks = 60); at 20 (the longer plank) A stops 4 before; at 16 B lays
  no plank (« sa première planche dépasserait le pilier »); at 36 (the sum) A stops 4 before, B 16 before; at 40 A 8
  before; at 48 B 8 before; at 60 A 12 before; at 4 (the PGCD) neither lays a plank; at 0 « Un pilier sur le bord : il
  n’y a pas de passerelle à construire » (both « end », nothing is built — the reason for « non nul »); at 160 « Le
  pilier tient : 10 planches de 16 et 8 planches de 20, 18 planches. Ta bourse en paie 14 : le marchand reprend ses
  planches »; at 320 (the product) the same with 36 planks — **it holds and ruins him**; at 80 it holds, 5 + 4 = 9
  planks, 5 coins left, B moors. Pillars that hold on 0…400: 80, 160, 240, 320, 400; the purse pays only 80.
- **He holds** when the forge opens: every pillar he placed with its two lanes' facts (the world's log), the 80 that
  held, and the ones that held but were refused by the purse (if he tried them).
- **Tiles** (gate A, defect 7) — two slots, every option of a slot in one grammar, the qualifier of 0 in its own slot so
  that no option is the only one qualified: « Je pose le pilier à » [la plus petite distance où les deux équipes
  finissent pile · n’importe quelle distance où les deux équipes finissent pile · la plus petite distance où l’équipe aux
  plus longues planches finit pile · la somme des deux longueurs de planche · le produit des deux longueurs de planche ·
  le PGCD des deux longueurs de planche] « , » [sans compter 0 · en comptant 0]. 12 rules (the last three options are
  the same pillar whatever the second slot: the mirror refutes them once). « le PGCD » is lesson 2's rule coming back
  as a wrong option (sealed in lesson 2).
- **Refutations (computed — proof K1)**, each on his log if he tried it, else laid by the forge's attack: « en comptant
  0 » with any of the first three → 0, no walkway; « the longer plank's » → 20 (and 40, 60: A 4, 8, 12 short); « the
  sum » → 36; « the product » → 320 (36 planks for 14 coins); « the PGCD » → 4 (neither crew lays a plank); « any » →
  160 (18 planks). Only « la plus petite distance où les deux équipes finissent pile, sans compter 0 » → 80.
- **Last step** (`use`): planks of 14 and of 49 — « Le premier pilier qui tient : □ cases » (98), « L’équipe de 14
  pose □ planches, celle de 49 pose □ planches » (7, 2). A wrong answer gets a fact: 49 → « l’équipe de 14 s’arrête 7
  cases avant le pilier » (49 = 14 × 3 + 7); 686 (product) → « il tient, mais un pilier plus proche tient déjà »
  (gate A, defect 1: the fact never writes the answer).
- **Tablet** (the name, after): « Multiples communs » — « 80, 160, 240… sont des multiples communs de 16 et de 20. Le
  plus petit qui n’est pas 0 est le plus petit multiple commun de 16 et de 20 : 80. » In version A of § « PPCM : two
  versions » (below) it adds « On l’écrit PPCM(16 ; 20) = 80. »; in version B it does not
  `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`.

#### K2 `ppcm-facteurs` — islands C → D, the mirror of D

- **Situation**: the owner's « big numbers make the decompositions necessary ». Island C's chantier: crew A planks of
  414, crew B planks of 192, purse 120. The walkway panel has a bench button « Le tableur » — lesson 1's `sheet`, two
  rounds: it writes 414 → 207 → 69 → 23 and 192 → 96 → 48 → 24 → 12 → 6 → 3 (proof K2); he writes the decompositions
  with powers himself (lesson 1's key 2). **The kept card stays under the pillar box** (`bench.text.kept`, lesson 2's
  kit work): 414 = 2 × 3² × 23, 192 = 2⁶ × 3.
- **Why the decompositions — a fact of the world, not a decree**: listing the multiples of 414 and testing 192 takes 32
  tries (B is short 30, 60, 90 … cases: 30k mod 192 first reaches 0 at k = 32 — proof K2), each a walk to the post and
  a laying; the product 79 488 holds but costs 606 planks for 120 coins; lesson 2's rule (common primes, smaller
  exponents) gives 6, where neither crew lays a plank.
- **Facts (computed)**: 6 → « aucune planche de 414 ni de 192 ne tient avant le pilier »; 576 = 2⁶ × 3² (common primes,
  larger exponent) → « l’équipe A s’arrête 162 cases avant le pilier »; 138 = 2 × 3 × 23 (every prime, smaller exponent,
  = exponent 1) → neither lays a plank; 414 (copy one) → B 30 before; 4 416 = 2⁶ × 3 × 23 (the larger exponent forgotten
  on 3) → A 276 before; 26 496 → holds, 202 planks, refused by the purse; 13 248 → holds, 32 + 69 = 101 planks, 19
  coins left, D moors.
- **He holds**: the two decompositions (kept card), the pillars and their facts, 13 248.
- **Tiles** — lesson 2's frame turned round (owner's wording of 2026-11-23 kept): « Pour écrire le plus petit multiple
  commun de deux nombres décomposés, je multiplie » [les facteurs premiers communs · tous les facteurs premiers]
  « chacun avec » [son plus petit exposant · son plus grand exposant · l’exposant 1]. 6 rules. K1 is sealed, so
  « plus petit multiple commun » may stand in the frame.
- **Refutations (computed)**: on the lived pair, common+smaller 6, common+larger 576, common+1 6, all+smaller 138,
  all+1 138 — none holds; all+larger 13 248 holds. Two pairs of rules give the same number there, so the mirror's
  attack tests his rule on a SECOND pair where the six rules give six numbers: 1 156 = 2² × 17² and 952 = 2³ × 7 × 17 →
  68, 2 312, 34, 476, **16 184**, 238 — only 16 184 is a multiple of both (proof K2).
- **Last step**: given decomposed (the values 616 and 484 are never written): 2³ × 7 × 11 and 2² × 11² → the smallest
  common multiple in factors 2³ × 7 × 11² (lesson 1's exponent boxes), then 6 776; lesson 2's rule there gives 2² × 11
  = 44; its fact names, for each number, the factors the answer lacks (« 2² × 11 : il manque un 2 et le 7 de
  2³ × 7 × 11, et un 11 de 2² × 11² »), never the rule. Then **the coprime pair, last, as a special case** (owner): 2⁵ and 3³ → no
  prime in common → 2⁵ × 3³ = 864, the product.
- **Tablet**: « Le plus petit multiple commun par les facteurs premiers » — the rule, 13 248 = 2⁶ × 3² × 23, and one line
  « Sans facteur premier commun, c’est le produit : 2⁵ × 3³ = 864. »

#### K3 `traduire-rendez-vous` — island E, the mirror (kind `crews`, mode `story`)

- **Experiment** — the owner's « a story translated BY HIM into crews; nothing drawn as a gear ». Two rounds.
  Round 1, the story card (words only): « Deux roues dentées s’engrènent : l’une a 32 dents, l’autre 20. On marque
  la dent de chacune qui touche l’autre. Les deux marques se retrouvent face à face pour la première fois après
  combien de dents passées ? Combien de tours a fait chaque roue ? ». Step « Traduis » (chips): « Une case, c’est »
  [une dent · un tour · une roue]; « L’équipe A pose des planches de » [32 · 20 · 52 · 12 · 2], same for B — the
  distractors are errors of TRANSLATION (52 the sum, 12 the difference, 2 the number of wheels), never the results 5,
  8, 160 (gate A, defect 2). A wrong mapping gets the story's fact (« un tour de la roue de 32 dents, c’est 32 dents
  qui passent »; « 52 dents : aucune roue n’en a autant »). Step « Le pilier »: he types it (K1's gesture), the lanes
  drawn on the story's OWN ruler 0…700 (1,57 px per case: plank 32 = 50 px, 20 = 31 px; 160 at 251 px — gate A, defect
  3); the crews lay; K1's facts. Step
  « Reviens à l’histoire »: « Les marques se retrouvent après □ dents » (160), « la roue de 32 dents a fait □ tours »
  (5), « la roue de 20 dents a fait □ tours » (8). **The 32-tooth gear makes 5 turns, not 8**: on 8, « 8 tours de la
  roue de 32 dents, c’est 8 × 32 = 256 dents, pas 160 ». Round 2: « Au terminus, la ligne 3 part toutes les 10 min, la
  navette de l’aéroport toutes les 46 min. Elles partent ensemble à 6 h 10. À quelle heure repartiront-elles ensemble
  pour la première fois ? » → « une case, c’est » [une minute · un bus · une heure]; « L’équipe A pose des planches
  de » [10 · 46 · 6 · 2 · 3] (6 the start hour, 2 the number of lines, 3 the line's number — translation errors, never
  23, 5, 230); pillar 230 (at 361 px; plank 10 = 16 px, 46 = 72 px), then « □ h □ min » (10 h 00). On « 3 h 50 »:
  « 3 h 50 min, c’est la durée depuis 6 h 10 ».
- **He holds** his two translations, the two pillars (160, 230) with their crews, his read-backs.
- **Tiles** — frame « Deux rythmes partis ensemble se retrouvent pour la première fois après » [leur plus petit
  multiple commun · leur produit · leur PGCD] « ; chacun s’est alors répété » [ce nombre divisé par son propre rythme ·
  ce nombre divisé par le rythme de l’autre] « fois ». 6 rules.
- **Refutations (computed — proof K3)**, all LAID on the 0…700 ruler: product → 640 teeth at 1 006 px (« les marques
  s’y retrouvent, mais elles s’étaient déjà retrouvées avant ») and 460 min at 723 px (13 h 50: « elles étaient déjà
  reparties ensemble avant »); PGCD → 4 teeth
  (« la roue de 32 n’a pas fini un tour ») and 2 min; « by the other's rhythm » → 8 turns of 32 = 256 ≠ 160, 5 departures
  of 10 min = 50 ≠ 230.
- **Last step — « PGCD ou PPCM ? » on the same pair** (owner): two short situations with 32 and 20. (a) « Deux
  baguettes de 32 cm et de 20 cm sont coupées en morceaux tous de même longueur, la plus grande possible, sans chute. »
  (b) « Deux roues de 32 et 20 dents : après combien de dents les marques se retrouvent-elles ? » For each: a choice
  between two tools — its words depend on § « PPCM : two versions » (version A [PGCD · PPCM]; version B [le plus grand
  diviseur commun · le plus petit multiple commun]) — then the value. The wrong choice is shown by a fact: (a) with
  160 → « un morceau de 160 cm ne se coupe pas dans une baguette de 32 cm »; (b) with 4 → « après 4 dents, aucune roue
  n’a fait un tour ». Right: 4 cm (8 + 5 = 13 morceaux), 160 dents.
- **Tablet**: « Rendez-vous : traduire, puis revenir à l’histoire » — the gears line and the bus line, as text and
  two lanes (no gear drawn). Nothing on any surface remarks that 4 × 160 = 32 × 20 (§ What is kept for lesson 5).

#### K4 `cinq-equipes` — island F, the mirror (kind `crews`, mode `days`) — the owner's exercise

- **Experiment**, the owner's words kept: five teams start together on day 1; team x works 1 day then sleeps x days
  (x = 1 … 5, so their cycles are 2, 3, 4, 5, 6 — the word « cycle » is not given before the seal). He runs it day by
  day, team by team (§ New engine pieces): each press of « Jour suivant » lights the day's column team after team; a
  team's lit cells carry the number of days since the start, so each row IS its table of multiples, 0 first (day 1 =
  « 0 jour depuis le départ »).
  1. First, before running: « Le jour 1, combien de jours se sont écoulés depuis le départ ? » [0 · 1] → 0 is in every
     team's row (« 0 est dans la table de chaque équipe »).
  2. « Prochain jour où les équipes 1 et 2 travaillent ensemble ? » — he types, then runs day by day → **day 7**.
  3. « Et les équipes 1, 2 et 3 ? » — types, « Avance » (4 days a second, pausable) → **day 13**.
  4. « Et les équipes 1, 2, 3 et 4 ? » → **day 61**; on the way the run stops on each day where four of the five work
     and names the one asleep: 13 (team 4), 25 (team 4), 31 (team 3), 37 (team 4), 49 (team 4) (proof K4). Day 31 is the
     moment 4 = 2² matters: 30 days is 2 × 3 × 5, not a multiple of 4.
  5. « Et avec l’équipe 5 ? » → day 61 again: « l’équipe 5 ne change rien : 60 jours, c’est 6 × 10 » — the moment the
     decompositions matter (6 = 2 × 3 is already inside 2² × 3 × 5).
  A prediction past 61 (e.g. the product's 721) is answered at 61: « Jour 61 : les cinq travaillent ensemble — bien
  avant le jour 721. »
- **He holds** his four predictions and the four days (7, 13, 61, 61), the four-of-five days with their sleepers.
- **Tiles** — « Le prochain jour où toutes les équipes travaillent ensemble, c’est le jour » [1 + le plus petit multiple
  commun · le plus petit multiple commun · 1 + le produit] « de leurs » [jours de travail et de sommeil réunis · jours
  de sommeil] — the same grammar on both options of the second slot (gate A, defect 7). 6 rules (K1 is sealed:
  « plus petit multiple commun » may stand). The word « cycle » is the tablet's, after the seal.
- **Refutations on HIS evidence (computed — proof K4)**: 1 + PPCM(cycles) gives 7, 13, 61, 61 — the rule; PPCM(cycles)
  6 → day 6 team 1 asleep; 1 + product(cycles) 7, **25** ≠ 13; 1 + PPCM(sleeps) **3** ≠ 7 (team 2 asleep on day 3),
  7 ≠ 13; PPCM(sleeps) 2; 1 + product(sleeps) 3. **The owner's trap** — PPCM(1, …, 5) = 60 too, so « sleep days as
  the cycle » is right by luck on the headline question — is caught HERE by his own sub-questions (teams 1–2: day 3 ≠ 7;
  teams 1–3: day 7 ≠ 13), and again by K4's last step and by the final mission, with other numbers.
- **Last step** (gate A, defect 5: the smallest common multiple of THREE numbers, in factors, is forged here before the
  mission and the five bank sheets that ask it — l3-004, l4-002, l4-003, l5-003, l5-009): three teams — A works 1 day
  then sleeps 3, B 1 day then 13, C 1 day then 18; all work on day 1. Boxes: « Les jours de travail et de sommeil réunis :
  A □, B □, C □ » (4, 14, 19); « en facteurs premiers, le plus petit multiple commun : » 2^□ × 7 × 19 (exponent boxes, 2² ×
  7 × 19); « = □ » (532); « Elles retravaillent toutes ensemble le jour □ » (533). Facts written by the reducer, never
  the answer (proof K4 last step): 267 (2 × 7 × 19 + 1, the larger exponent forgotten) → « le jour 267, l’équipe A
  dort »; 235 (sleep days as the cycle: PPCM(3 ; 13 ; 18) = 234) → « le jour 235, les trois équipes dorment »; 532 → « le
  jour 532, les trois équipes dorment »; 1065 (the product) → « elles travaillent ensemble, mais ce n’est pas la première
  fois depuis le jour 1 ».
- **Tablet**: « Plusieurs rythmes : compter les jours depuis le jour 1 » — 2² × 3 × 5 = 60, day 61; the cycle = the days
  of work and of sleep together; three numbers decomposed: every prime, its larger exponent.

**Built as (2026-11-26, the forges agent; accepted by the main session)** — where `world/forges.js` differs from the keys
above:
- K1's tiles: the one column of six long tiles broke the frame's limits (≤ 4 tiles of ≤ 32 characters a column), so
  three columns — « Je pose le pilier à » [la plus petite distance · n’importe quelle distance] × « où finit pile »
  [chaque équipe · l’équipe aux longues planches · l’équipe aux courtes planches] × « Et la distance 0 ? » [sans compter
  0 · en comptant 0], 12 rules; the sum, the product and the PGCD are no longer tiles (the product, 320, still refutes
  « n’importe quelle distance » with 160). The right rule's built cases are on two free pairs, 16 / 38 → 304 (purse 53)
  and 14 / 46 → 322 (purse 59) — a mirror pair's purse is 2 × the planks of its first pillar − 1 (K2's 1 156 / 952: 61);
  proof script « The mirrors' own cases »;
- K4's attack and nudge days come from the five teams: teams 1 and 3 meet on day 5 (day 9 is not the first), 2 and 4
  on day 16 (not 15), 1 and 4 on day 11 (not 7) — proof script;
- K4's tiles: « Je calcule » [le plus petit multiple commun · le produit] × « de leurs » [jours de travail et de sommeil ·
  jours de sommeil] × « Le jour cherché, c’est » [1 + ce nombre · ce nombre] — 8 rules (one grammar per column: « le
  produit » without « 1 + » is a rule too, refuted on day 7); « réunis » dropped for the 32-character limit;
- K2's last step prints the 7 between the two exponent boxes (2^□ × 7 × 11^□ = □): lesson 2's 2² × 11 = 44 cannot be
  typed, and each wrong exponent gets its fact (too few 2: not a multiple; too many: a smaller one is);
- K3's second column reads « Ses répétitions, c’est » [ce nombre ÷ son propre rythme · ce nombre ÷ le rythme de
  l’autre]; its last step's choice is [PGCD · plus petit multiple commun].

### What each surface draws (review §A.6 — gate A, defect 6)

K1 and K2 are about a walkway; K3 is a modelling, K4 a calendar. No surface draws a gear (the owner: « nothing drawn as a
gear »), unless the owner names one (open question 9).

| Surface | K1 | K2 | K3 | K4 |
|---|---|---|---|---|
| the world's log / the mirror's evidence rows | each pillar: two lanes (`crewLanes`), the shortfalls in amber, the verdict | the same, `fit` scale, the kept decompositions beside | each round: the story's text (one line) + the two lanes at the pillar | each stage: the day rows 1…d of the asked teams, the day outlined |
| the board's cards (`board/script.js`) | the 16 / 20 lanes with the pillar at 64, then at 80 | 414 and 192 decomposed, the larger exponent outlined per prime | the gears sentence (text) and its two lanes; the bus sentence and its lanes; « PGCD ou PPCM ? » as two short texts | five day rows, days 1 … 14 (team 1–3 meeting on 13) |
| the trainer's questions | a pillar to type on drawn lanes | decompositions to combine (exponent boxes) | a story (text) to answer in turns / a clock time | a work/sleep text, the day to type; a strip of day rows as the correction |
| the revision page | lanes 16 / 20, pillar 80 | the rule, 13 248 = 2⁶ × 3² × 23, the coprime line | « Roues de 32 et 20 dents : 160 dents, 5 tours et 8 tours » as TEXT, the bus line | the five rows, day 61 |

### What is kept for lesson 5 (gate A, defect 12)

PGCD × PPCM = a × b is lesson 5's (owner). K3's last step shows 4 and 160 on 32 and 20 and the product 640 is a
refutation number, so: no tablet, board card, trainer question, revision line or robot sentence remarks on it (no
« 4 × 160 = 640 », no « produit »-of-the-two-results line). `inquiries.test.js` gets a check that no string of the
lesson holds both « PGCD » and « produit » in one sentence.

### « PPCM » : two versions (gate A, defect 8 — the owner decides, open question 2)

The design works either way; ONLY these sentences change:

| Where | Version A — « PPCM » sealed on K1's tablet | Version B — « plus petit multiple commun » only |
|---|---|---|
| K1's tablet | « … est le plus petit multiple commun de 16 et de 20 : 80. On l’écrit PPCM(16 ; 20) = 80. » | the same without the second sentence |
| K2's tablet | « PPCM(414 ; 192) = 2⁶ × 3² × 23 = 13 248 » | « Le plus petit multiple commun de 414 et 192 est 2⁶ × 3² × 23 = 13 248 » |
| K3's tiles, slot 1 | [leur PPCM · leur produit · leur PGCD] | [leur plus petit multiple commun · leur produit · leur plus grand diviseur commun] |
| K3's last step, the choice | [PGCD · PPCM] — the owner's « PGCD ou PPCM ? » | « Quel outil ? » [le plus grand diviseur commun · le plus petit multiple commun] |
| K4's tiles, slot 1 | [1 + le PPCM · le PPCM · 1 + le produit] | as written above |
| dash W4 | « PGCD ou PPCM ? » in its sentence | « le plus grand diviseur commun ou le plus petit multiple commun ? » |
| the trainer, the board, the revision page | may write « PPCM » after K1's seal | the words in full |

Either way: the bank never writes « PPCM » (the bank agent's report) — the trainer's agent is told so; and lesson 2's
« PGCD » stays as it is.

### New engine pieces — NEW, each needs the owner's go (he has asked for these lessons; the workshop is his own exercise)

THREE pieces (gate A, defect 4: the mission is the third), the first two sharing ONE drawing
(`divisorIsles/crewLanes.jsx`: two to five lanes from one start, planks or days, a marker, the shortfall in amber).
Nothing else new in the world; the kit gets one claim kind.

**1. Segment kind `walkway`** (`Game.js`, a panel `divisorIsles/Chantier.jsx`, logic `divisorIsles/walkway.js` — pure,
unit-tested — and words in `strings.js › T.walkway`). Story shape:
`{ kind: 'walkway', crews: [16, 20], ruler: 400, scale: 'fixed' | 'fit', convoy?: id, bench?: <inquiry spec> }` and
`story.convoys[id].purse` as today.
- **On the island**: a post « le pilier » lit (beacon) with the prompt « Appuie sur E — Pose le pilier »; two crew
  robots (the world's robot model, two colours, `mouldColor(16)`, `mouldColor(20)`), no person drawn.
- **State** `{ d: null | n, laying: false, tries: [{ d, lanes: [{ b, planks, short, ends }], holds, cost, paid }] }`,
  saved with the world (`flags.walkways[segId]`).
- **Gestures**: E → the panel opens. One box « Le pilier à □ cases du bord » (integers 0 … `ruler` for `fixed`, 0 …
  999 999 for `fit`; ←/→ nudge ±1, Shift ±10; Enter or « Poser le pilier » plants it, drawn at once); « Les équipes
  posent » lays: lane A then lane B, plank by plank (`plank` sound), ⩽ 2 s whatever the count; « Reprendre le pilier »
  at any moment, and ✕ / Escape close the panel (play.md D26). With `bench`: the button « Le tableur »
  (`Game.openBench`/`closeBench`, `flags.benches`, `spec.from`/`onState` as the workshop's) and the kept card under the
  box (`bench.text.kept`, ⩽ 4 lines).
- **Logic** (`walkway.js › lay(crews, d, purse)`): per lane `planks = ⌊d ÷ b⌋`, `short = d − b × planks`, `ends =
  short === 0`; `holds = d > 0 && every lane ends`; `cost = Σ planks`; `paid = holds && cost ⩽ purse left`. NEW purse
  behaviour: on a walkway the crews lay the WHOLE walkway, then the purse is read (owner: « 320 holds but ruins him »);
  the existing stop-where-the-coins-run-out stays for bridges. **A refused walkway costs no coin** (short, ruins or
  shore: the planks go back and the purse is untouched) — this differs from the bridges' purse, which spends as it lays
  (gate A, defect 13).
- **Facts** (`T.walkway`, one per lane, then the verdict; never « faux »): `ends` « L’équipe A (planches de 16) finit
  pile au pilier : 5 planches. »; `short > 0, planks > 0` « L’équipe B s’arrête 4 cases avant le pilier : 3 planches,
  la 4e dépasserait. »; `planks = 0` « L’équipe A ne pose aucune planche : la première dépasserait le pilier. »; `d = 0`
  « Un pilier sur le bord : il n’y a pas de passerelle à construire. » Verdict: `paid` « Le pilier tient. 9 planches,
  il te reste 5 pièces. » → the 3D walkway stands (two lanes in the crews' colours, `seg.a = d`, `cell = len ÷ d`),
  island B moors (it slides in along the road axis to the pillar's end: the layout is NOT moved; B stands where the
  layout put it and the walkway's 3D length is the segment's — see open question 7); `holds && !paid` « Le pilier tient :
  36 planches. Ta bourse en paie 14 : le marchand reprend ses planches. »; else the planks go back, no coin spent.
- **Draw at 1366×768** (the scale rule): the panel 1 180 × 430 px over the world; the water a ruler of 1 100 px.
  `fixed`: 0 … `ruler`, here 2,75 px per case (K1: plank 16 = 44 px, 20 = 55 px, 80 at 220 px, 320 at 880 px — near and
  far drawn true); ticks every 10 cases, labels every 50 (0, 50 … 400: 80 is not a label). `fit`: per try, 1 100 px =
  1,15 × max(d, longest plank) — the ruler relabelled with 4–6 round ticks (K2 at 13 248: plank 414 = 30 px, 192 = 14 px);
  a lane whose planks fall under 6 px, or over 120 planks, is ONE band with its count printed (« 414 planches de 192 »).
  Lanes 44 px tall, joints as ticks, the shortfall amber with its length (« 4 cases »; a shortfall narrower than its
  label — 4 cases = 11 px at K1's scale — puts the label under the lane with a short leader, gate A defect 13), the pillar a brand-blue post
  with « 64 cases » under it; the facts card on the right (⩽ 4 lines, 18 px); the instruction compact above.
- **What it says to the forge**: each try is pushed to `game.log` (`{ kind: 'walkway', seg, d, lanes, holds, cost, paid
  }`): the evidence of K1 and K2 (`forge.evidence(log)`). The story's hook `onHold` fires when a walkway is paid.
- **Hooks**: `data-di-walkway=<segId>`, `data-di-in="pillar"`, `data-di-plant`, `data-di-lay`, `data-di-lane="A|B"`
  with `data-di-planks`, `data-di-short`, `data-di-walkway-verdict="paid|ruins|short|shore"`, `data-di-purse`.
- Tests: `walkway.test.js` (every fact of proof K1/K2 through `lay`), `chantier.render.test.jsx`.

**2. Inquiry kind `crews`** (`divisorIsles/crews.js` — reducers —, `InquiryCrews.jsx`, `inquiryCrews.css`; contract row
in GAME_WORLD.md « Explore »). Two modes.
- **`story`** — spec `{ kind: 'crews', mode: 'story', ruler: 700, rounds: [{ text, unit: { options, right }, numbers: [32, 20, 52, 12, 2],
  crews: [32, 20], ask: [{ id, label, value }], clock?: { start: [6, 10] } }], text }`. Stages per round: `read` (the
  story card, words only, 18 px, ⩽ 5 lines) → `map` (chips onto « une case, c’est » and the two crews; a wrong chip:
  the story's fact, the chip goes back) → `pillar` (K1's box and laying, drawn by `crewLanes` at the spec's own `ruler`,
  `fixed` — here 700) → `back` (his boxes: integers, or « □ h □ min »; a wrong value: the fact, he tries again) → `seen`. Result:
  `{ rounds: [{ mapping, d, said, facts }] }` for `fromInquiry`. Nothing drawn as a gear: the card is text, the
  lanes are planks.
- **`days`** — spec `{ kind: 'crews', mode: 'days', teams: [{ sleep: 1 }, …], days: 62, stages: [{ ask: 'zero' }, {
  teams: [1, 2], run: 'step' }, { teams: [1, 2, 3], run: 'fast' }, { teams: [1, 2, 3, 4], run: 'fast', stopOn: 'all-but-one'
  }, { teams: [1, 2, 3, 4, 5], run: 'fast' }], text }`. A team works on day d when (d − 1) is a multiple of (sleep + 1).
  Stage = he types the day BEFORE the run (`data-di-in="day"`); `step`: « Jour suivant » (Enter) lights the next column
  team by team (5 × 150 ms); `fast`: « Avance » runs 4 days a second, « Pause » stops it; the run stops on the first
  day the asked teams all work (and, with `stopOn`, on each day where all teams but one work, naming that one) and
  writes the fact beside his prediction. **Draw**: 5 rows × 62 day columns of 17 px = 1 054 px; a row 60 px: its upper
  half the team's state (lit brand blue with a hammer glyph 14 px / grey with a moon 14 px), its lower half, under each
  lit cell only, the days since the start at 18 px (team 1's lit cells are 34 px apart: room for « 58 »). Day labels
  every 5 days (1, 6, 11 …) at 18 px over the columns; the current day outlined. The asked teams' rows outlined.
  Nothing scrolls: 62 days is the whole window (61 + one). **Feasibility, to prove at the first render** (gate A, defect
  13): 1 054 px of columns + a 110 px team label column = 1 164 px inside the mirror's frame; if the frame is narrower,
  the columns go to 15 px (930 px; team 1's lit cells 30 px apart, « 58 » still fits at 18 px); 310 glyphs of 14 px are
  SVG `use` of one symbol. **The owner's « five tables lit at once, 0 at the top of
  each »** is drawn as five ROWS aligned on the day axis, 0 at the LEFT of each (a column of 31 multiples does not fit
  768 px at 18 px) — open question 4. Result: `{ zero, stages: [{ teams, said, day, sleepers }] }`.
- **Variant `window`** of `days` (the mission's only): no stages, 3 lanes, a 31-day window centred on the typed day
  (31 × 34 px = 1 054 px, « … » and the day count at the left when the window does not start at day 1), the run
  fast-forwarding to that day; it hands back `crews.js › daysFact(cycles, day, names)`.
- Tests: `crews.test.js` (every day of proof K4 and of the mission through the reducer), `inquiryCrews.render.test.jsx`.

**3. The final mission in this world: `story.mission`, ported from `rootCourts`** (`rootCourts/Game.js` 1174–1195:
`story.mission = { prompt, title, lead, lines(), check(values) → 'ok' | a FACT, ok }`; its overlay draws the lead and
the kit's `UseLines` boxes). `divisorIsles/Game.js` has today only `boss` and bridges: it gets `missionOpen()` (the story
has a mission, it is not solved, he stands on the LAST island), `openMission()` (the overlay `{ type: 'mission' }`, the
prompt « Appuie sur E — Le tableau du port » on the island's board), `solveMission()` (`flags.mission = true`, saved),
and `arrive()` plays `finale()` on the last island only once the mission is solved — rootCourts' line 1279. No segment
leaves G: G is the last island. The mission's content: one box « Le jour □ »; `check(day)` calls
`crews.js › daysFact([8, 17, 20], day, ['nord', 'ouest', 'sud'])`, which returns `'ok'` on 681 or THE sentence, written
by the reducer from who crosses (« Le jour 2129, la navette de l’ouest et celle du sud sont au port. »); under the
answer, the three lanes in the `window` variant. **What a wrong try costs**: nothing but its run (≈ 3 s) and its fact —
as in rootCourts. So 34 tries on the days 21, 41, 61 … (20k + 1) would find it, and any-day typing up to 680: the cost
of brute force is time, not coins (open question 10 asks whether he wants a cost). Hooks: `data-di-mission`,
`data-di-in="day"`, `data-di-mission-fact`. Tests: `crews.test.js` (every row of the mission table), `mission.render.test.jsx`.

**Kit (no new mechanic)**: a claim kind `ppcm` `{ ns: [a, b, …], m }` → `m === lcm(ns) && m > 0` in `kit/claims.js`,
`ClaimVerifier.php` and the shared fixture (the forges' last steps of K1, K2; K4's day is `m + 1` in the story's words).
No new practice answer type: the bank uses `rational`, `choice`, `factorization`, `integerSet` (a clock time is two
`rational` boxes « h » and « min »). The forge's last step needs the existing integer and exponent boxes and a choice.

**Built as (2026-11-26, the kit agent; accepted by the main session)** — where the build differs from the lines above:
- the claim is `{ kind: 'ppcm', a, b, more?: [c, …], m }`, not `{ ns, m }` — `GameEvidenceController` requires `claim.a`
  and `claim.b` (0 to 4 numbers in `more`, m ≤ 10^6);
- the purse of posters: each wrong answer spends a poster; the third ends the run (the boxes close, `text.spent`,
  `onSpent`); the NEXT OPENING of the board refills it (3 again) — brute force across runs costs time, not coins;
- `crews` mode `story`: ANY pillar that holds (640 too) opens « Reviens à l’histoire »; the read-back refutes it;
- the chantier card is about 500 px tall (the facts to the right of the box, the lanes under them), not 430;
- the mission's day box is the story's `UseLines` box: its hook is `data-rf-use=<slot>`, not `data-di-in="day"`;
- `daysFact(cycles, day)` returns `{ kind: 'start' | 'first' | 'again' | 'some' | 'none', working, idle }`, not a
  sentence: the story writes the sentence (the kit writes no French);
- the three « To VERIFY »: a bench outside a workshop works (`Game.openBench`/`closeBench` accept the walkway's overlay);
  `seg.a` is set at run time when a walkway is paid (`walkwayGame.js › standWalkway`); `arrive` plays the finale on the
  last island only once `flags.mission` is set.
Files, shapes and hooks: `GAME_WORLD.md` §2ter-1 (« A WALKWAY », « THE FINAL MISSION ») and « Explore » (`crews`).

To VERIFY in the first brief (a look at the code or one render test): a bench opened from a segment that is not a
`workshop` (`Game.openBench` reads `seg.workshop.bench` today?); `seg.a` set at run time for a walkway (the layout's
`cell = len ÷ a` is computed in `buildLayout`); a story ending at an island reached after a mission (`arrive` →
`finale`, lesson 2's note).

### No rule told before its seal — where it could leak, and how it is avoided

| Where | Risk | What the lesson does (checked by `inquiries.test.js` / `lockedNames` / `story.test.js`) |
|---|---|---|
| instruction, robot lines, facts on A–B (K1) | « multiple commun », « plus petit », « PPCM », « non nul » | the CONSTRAINT only (two crews, one pillar where both end, a coin per plank) and FACTS per lane (« s’arrête 4 cases avant »). Forbidden A–B: « commun », « PPCM », « plus petit », « non nul », « multiple de 16 et de 20 » |
| C–D (K2), the bench, the kept card | « plus grand exposant », « tous les facteurs » | the sheet's words are lesson 1's; the kept card is the two decompositions only; facts are shortfalls. Forbidden C–D: « exposant » (except inside the decompositions he writes), « plus grand », « tous les facteurs », « PPCM » |
| K3's story card and its facts | « divisé par ses dents », « ajoute la durée » | the card is the problem; a wrong read-back gets the product that refutes it (8 × 32 = 256), never the method |
| K4's screen | « cycle », « + 1 », « jours de sommeil + 1 » | the teams are described in work/sleep words; facts name who sleeps; « cycle » first appears in the tiles (both options use it), after K1–K3 are sealed |
| the recall card « De l’île précédente » | a line that reads K1's rule on B→C | facts only: « 80 = 16 × 5 = 20 × 4 » |
| tiles | the right tile worded more precisely | one grammar per slot; K1's 0 qualifier in its own slot, on every option; K4's second slot same grammar; K2 reuses lesson 2's owner-approved words |
| nudges | a sentence stating the rule | a nudge is a CASE laid in the mirror (`kind: 'experiment'`) |
| tablets | a later key in an earlier tablet | K1's tablet has no factors; K2's has no turns or days; K3's has no days |
| hub, warm-up, lab, board, trainer | « PPCM », « Rendez-vous », « cinq équipes » before the forge (A2) | `lockedNames.render.test.jsx`; the lab instrument `jumps` says « multiples », never « commun »; board stations follow the keys; trainer questions unlock after each seal |
| gate dash, final mission | — | after every seal; the mission states only the story (three ferries, work/rest days), never « PPCM » nor « + 1 » |

### The final mission — the harbour's three ferries (island G, the last)

At island G (the harbour, the LAST island), the board « Le tableau du port » (piece 3): « Les trois navettes du port traversent toutes le jour 1.
La navette du nord traverse 1 jour, puis reste au port 7 jours ; celle de l’ouest traverse 1 jour, puis reste au port
16 jours ; celle du sud traverse 1 jour, puis reste au port 19 jours. La fête des navettes aura lieu le prochain jour où
les trois traversent ensemble. Quel jour ? » He types the day; the world runs the three lanes to it (`window`) and
the reducer writes the fact from who crosses that day — every ferry at port is named, and the answer is never written
(gate A, defect 1; proof MISSION checks who crosses on each day below). Cycles 8, 17, 20: 8 = 2³, 17, 20 = 2² × 5 →
2³ × 5 × 17 = 680 → **day 681**. Every error of the lesson is refused by a fact:

| He types | The error | The world's fact |
|---|---|---|
| He types | The error | Who crosses (proof) | The world's fact |
|---|---|---|---|
| 2129 | **the owner's trap**: the rest days taken as the cycle, PPCM(7 ; 16 ; 19) = 2 128 | nord only | « Le jour 2129, la navette de l’ouest et celle du sud sont au port. » |
| 680 | the day count from 0 (no + 1) | none | « Le jour 680, les trois navettes sont au port. » |
| 2 | lesson 2's rule: PGCD(8 ; 17 ; 20) = 1, + 1 | none | « Le jour 2, les trois navettes sont au port. » |
| 1 | 0 as a common multiple | all (the start) | « Le jour 1, c’est le départ : 0 jour depuis le départ. » |
| 2721 | the product 2 720 + 1 | all | « Les trois traversent ensemble ce jour-là, mais ce n’est pas la première fois depuis le jour 1. » |
| 41 | 17 forgotten (PPCM(8 ; 20) = 40) | nord, sud | « Le jour 41, la navette de l’ouest est au port. » |
| 161 | 8 × 20 (the two sharing a prime, multiplied) | nord, sud | « Le jour 161, la navette de l’ouest est au port. » |
| 341 | copy 20 × 17 | ouest, sud | « Le jour 341, la navette du nord est au port. » |

681 → « Les trois navettes traversent ensemble : c’est le jour de la fête. » `solveMission()`; the story marks the
problem module in its mission hook; the finale plays on G.

**Why it cannot be won with lessons 1–2 only**: they hold the decompositions and the PGCD; nothing in them makes three
rhythms meet — the PGCD gives day 2. **Why it needs this lesson**: K1 (a common multiple, the smallest, not 0), K2 (three
decompositions, larger exponents: 2³ wins over 2²), K4 (cycle = 1 + rest, the day = 1 + the multiple) — and it is « the
later mission with other numbers » the owner asked for: here the rest-day reading gives 2 129, not 681. Brute force:
typing 21, 41, 61 … (the multiples of 20 plus 1) takes 34 tries; typing any day takes up to 680.

### Numbers (reserved for this lesson)

K1: planks 16, 20; purse 14; pillars 80 (paid), 160, 240, 320, 400 (hold); facts 4, 8, 12, 16, 36, 64. Last step 14 and
49 → 98. K2: 414 = 2 × 3² × 23, 192 = 2⁶ × 3, purse 120 → 13 248; sheet 207, 69, 23, 96, 48, 24, 12, 6, 3; facts 6,
576, 138, 4 416, 26 496, 79 488; mirror test 1 156 and 952 (68, 2 312, 34, 476, 16 184, 238); last step 2³ × 7 × 11 and
2² × 11² → 6 776 (44), 2⁵ and 3³ → 864. K3: 32 and 20 → 160, 5, 8 (256, 640, 4); bus 10 and 46 min, 6 h 10 → 230 min,
10 h 00 (460, 2); rods 32 cm and 20 cm → 4 cm. K4: cycles 2 … 6 → 60, days 7, 13, 61; 25, 31, 37, 49; 720 / 721;
last step cycles 4, 14, 19 (rests 3, 13, 18) → 532 → day 533 (267, 235, 532, 1 065; 266 and 234 are never written).
K3's story ruler 0…700. Mission: 8, 17, 20 → 681 (2 129, 680, 2 721, 41, 161, 341). Dash: W1 planks 4 and 34 → 68 |
2 | 38; W2 2³ × 3 and 2² × 23 → 2³ × 3 × 23 = 552 | 2² = 4 | 2 208; W3 gears 26 and 34, the 34-tooth gear's turns →
13 | 17 | 2; W4 24 red and 92 blue marbles into identical bags, the most bags → 4 | 552 | 2; W5 work 1 / rest 4
and work 1 / rest 7 → day 41 | 29 | 40; W6 coprime planks 19 and 37 → 703 | 1 | 18.

**Checked** (`…-design-numbers.out`): every pair and every number ⩾ 100 above against the FIVE 3e banks and every
story — CLEAR (re-run for version 2), except, **for the owner to accept** (open question 5): 160 and 320 (the owner's numbers: in Thalès's bank l2-004, l3-004,
l4-002, l5-005 and lesson 3's l5-006 — lengths, another unit); 60 / 61 / 720 (the owner's workshop; 60 is lesson 1's
first ladder and the programme's own automatism example « 60 = 2² × 3 × 5 »); 207 (a quotient the sheet writes, in
lesson 2's bank l3-010); and single-digit pairs (6 ; 10), (4 ; 10), (3 ; 9) that the tool finds on incidental lines (a
decomposition « 3² = 9 », a sum « 10 × 3 + 9 × 4 ») — none is a pair a statement names. Against this lesson's own bank
(`…-design-numbers-own-bank.out`): no world pair is a headline pair of a sheet (the bank's 8 ; 14 — l2-001 —, 10 ; 25 —
l2-006 —, 6 ; 10 — l2-007 —, 28 ; 42, 280, 2 240 were candidates and were dropped). Small headline numbers of lessons
1–3 kept off screen by hand: 36, 48, 72, 91, 97, 126 (lesson 1), 18, 28, 30, 33, 35, 42, 54, 55, 56, 75, 90 (lesson 2),
65, 84, 96 (lesson 3) — except 96 and 48 on K2's sheet (192 ÷ 2, ÷ 4: the sheet writes them; open question 5).
Version 2 dropped 63 / 75 from the dash (75 is lesson 2's; both stand in this bank's l1-006, l1-008, l2-006 and lesson
2's l1-003 — gate A, defect 11). Also met: 266 (in lesson 3's bank l5-004) is a value a wrong rule computes in K4's last
step; its fact names day 267 only. The ruler label 700 (lesson 1's bank l4-010) is a tick label. (4 ; 14), (14 ; 19)
cleared except one incidental line « De 14 h à 18 h : 4 h » (own bank l5-010).
Rejected on the way: 25/35, 10/25 (bank lines), 250/220, 198/192, 360/156, 528/216, 936/676 (lesson 3's bank), 21/24
(product 504 = lesson 1's mission), 12/14/16 ferries (336 in two banks), 8/14/20 (this bank's l4-001).

### Bank — 50 exercises, 10 per palier, every one tagged `brevet` and `calculator` (written 2026-11-26, read here)

The bank was written FIRST (pipeline step 0) by the bank agent: `content/practice/3e/multiples-et-diviseurs-communs/
level-1…5`, 50 sheets, 144 questions (rational 104, choice 23, factorization 13, integerSet 4); levels 1–3 `brevet: 1`,
`calculator: false` except l3-008…010 (`brevet: 2`, calculator); levels 4–5 `brevet: 2`, calculator. Every sheet
`exam.kind: adapted` (no French brevet paper on multiples is filed in `docs/curriculum/officiel/`: no « Sur le modèle du
brevet »). Primary questions: P1 46 (16 of them PGCD computations `counted: false`), P2 24, P3 74 — **P3 carries half**,
so K3, K4 and the mission (three P3 places) get the richest experiments and the `use` steps closest to the exam (the
clock time, the turns, the « PGCD ou PPCM ? » choice); P2's 24 sit on K2. Its 14 misconception ids (product, lesson 2's
smaller exponent, only-common primes, 0, turns swapped, rest days = cycle, not-smallest, PGCD/PPCM tool, count vs
duration, clock time, day offset) are exactly this design's wrong rules — the trainer reads them. Its headlines that
echo the world: l5-001 « Une passerelle à deux équipes » (45 / 50, prices in €), l4-005 and l5-003 (teams that rest),
l2-007 (gears 6 / 10). Per palier (titles in the sheets):

| Palier | brevet | content (from the sheets) | P1 / P2 / P3 primary |
|---|---|---|---|
| 1 | 1, no calculator | the multiples of 6 and 8, two lights, a common multiple of 10 and 15, two buses, two bells, 9 and 15, « quel outil ? », one number dividing the other, decompositions of 6 and 10, « le plus grand exposant » | read by the bank agent (`…-bank.md`) |
| 2 | 1, no calculator | two lorries, a PPCM in factors, « un exposant contre l’autre », multiple or divisor?, 18 and 30, lights and minutes, two gears, « à quelle heure ? », when the product works, 6 and 7 | idem |
| 3 | 4 × part 1, 6 × part 2 (l3-008…010) | a factor not to forget, two gears, macarons and financiers (PGCD side), three lights, two volunteers and a cycle, two numbers two results, two lighthouses, two bus lines, a 28/42 gear, ribbons and a machine | idem |
| 4 | 2, calculator | a chain of two sprockets, three bus lines, three gardens, tiles for a room, two teams that rest, lots for the fête, a two-colour garland, when the product is right, verrines and timers, a train and a coach at what time | idem |
| 5 | 2, calculator | a two-crew walkway, two sprockets and a counter, three teams that rest, a field in squares, a garland, a budget for the walkway, two problems two tools, a bicycle's sprockets, three lighthouses, the school fête | idem |

Not this designer's to change; two notes for the bank agent: the bank says « plus petit multiple commun » and never
asks for the name « PPCM » — consistent with open question 2; and no DZ sheet is ported (open question 6).

### The walk's outline (the descriptor is written with the lesson, from it)

| # | Screen | What the student does | What the walk checks |
|---|---|---|---|
| 1 | Title → island A (the chantier) | reads the instruction: two crews, 16 and 20, one pillar, a coin per plank, 14 coins | instruction whole; `data-di-purse=14`; the post lit |
| 2 | A's walkway panel | types 64 → plants → « Les équipes posent »: B 4 short; « Reprendre le pilier »; 320 → holds, ruins; 0 → shore; 80 → holds, 9 planks | `data-di-lane="B"` `data-di-short=4`; verdicts `short`, `ruins`, `shore`, `paid`; 5 coins left; 80 at x ≈ 220 px of the ruler |
| 3 | A → B, B moors | walks the walkway | the 3D walkway has two lanes; recall card « 80 = 16 × 5 = 20 × 4 » |
| 4 | B, the mirror — K1 | tiles (6) → test on his log → attack (e.g. 36, 160) → seal → last step 14 / 49: 98, 7, 2 (a first try 49 → its fact) → tablet | no « commun » / « PPCM » before the tablet; the claim `ppcm` |
| 5 | B → C (a standing bridge), C's chantier | opens « Le tableur »: 414 then 192 → back; the kept card shows both decompositions | `data-di-bench=sheet`; `data-di-bench-kept` 2 lines; reopened, kept |
| 6 | C's walkway (`fit`) | 6 → no plank; 576 → A 162 short; 13 248 → holds, 101 planks, 19 coins | per-try ruler relabelled; plank 192 ≈ 14 px; 79 488 (if tried) → one band per lane |
| 7 | D, the mirror — K2 | tiles (lesson 2's frame) → test → attack on 1 156 / 952 → seal → last step 2³ × 7 × 11 ; 2² × 11² → 2³ × 7 × 11², 6 776; then 2⁵ ; 3³ → 864 → tablet | exponent boxes; no « plus grand exposant » before the tablet |
| 8 | E, the mirror — K3 (`crews`/`story`) | round 1: maps « une dent », tries 52 on A (its fact), 32 → A, 20 → B; pillar 160; turns 8 then 5 (fact on 8), 8; round 2: « une minute », 10 → A, 46 → B, 230, 10 h 00 (fact on 3 h 50) → tiles → attack lays 640 → seal → the two-tool step (rods: the multiple first, its fact, then 4; gears 160) → tablet | no gear drawn (`InquiryCrews` holds no gear SVG); chips hold no 5, 8, 160; 160 at 251 px, 640 at 1 006 px; the clock boxes |
| 9 | F, the mirror — K4 (`crews`/`days`) | 0; predicts 7, steps to 7; predicts 13, runs; predicts 61, the run stops on 13, 25, 31, 37, 49 naming the sleeper; 61; « avec l’équipe 5 » 61 → tiles → test (sleep-as-cycle refuted on 1–2) → seal → last step 4, 14, 19; 2² × 7 × 19; 532; a first try 235 (its fact), then 533 → tablet | 62 columns no scroll (17 or 15 px); lit cells carry 0, 2, 4 …; day 31 names team 3; no fact holds the answer |
| 10 | F → G, the gate dash | six waves | one right gate each (proof DASH) |
| 11 | G, the harbour — final mission (`story.mission`) | E at « Le tableau du port »; types 2129 → « … l’ouest et celle du sud sont au port »; 680 → « les trois navettes sont au port »; 681 → the three cross | `data-di-mission-fact` never holds « 681 » before it is typed; 31-day window; the problem module marked |
| 12 | G — end | the finale plays after the mission | the four tablets in « Mes règles » |

Islands in one line ahead (play.md §2): A the chantier, B (moors at the pillar; the mirror), C the second chantier, D
(moors; the mirror), E the mirror, F the mirror, G the harbour (the last island: the mission, then the finale). Seven
islands. B → C, D → E, E → F are standing bridges (`standing: true`, a gap of 0 — `Game.js` 673); F → G the dash.
Island names are new words (`story.test.js`). The revision page (`revision.js`, REVISION_PAGE.md §2) is written after
the knowledge sheets: the four rules, the 16 / 20 walkway, the gears as TEXT (no gear drawn), the five teams.

### Open questions for the owner

1. **The go for THREE new pieces**: the segment `walkway` (the pillar placed before the crews lay; the purse read AFTER
   the whole walkway is laid; a refused walkway costs nothing); the inquiry kind `crews` (modes `story`, `days`, and the
   mission's `window` variant of `days`), sharing one lane drawing; and `story.mission` ported from `rootCourts` into
   `divisorIsles` (the final mission on the last island, its fact written by `crews.js`).
2. **« PPCM »** (gate A, defect 8): no official text filed names it, nor « plus petit multiple commun » (the 3e
   attendus and the 2026 programme say « problèmes mettant en jeu la divisibilité (engrenages, conjonction de
   phénomènes) » and the automatism « trouver un dénominateur commun ») `[À VÉRIFIER DANS LE PROGRAMME OFFICIEL]`.
   Version A — K1's tablet writes « PPCM(16 ; 20) = 80 » and your « PGCD ou PPCM ? » stands as you said it — or version
   B — the words in full everywhere? § « PPCM : two versions » lists the seven sentences that change.
3. **New nouns**: « la passerelle », « le pilier », « l’équipe A / B », « le chantier », « le marchand », « le tableau
   des équipes », « les navettes », « le tableau du port ».
4. **Your « five tables lit at once, 0 at the top of each »** (gate A, defect 9): drawn as five ROWS on the day axis,
   0 at the left — it keeps the day-by-day run on one screen (a column of 31 multiples does not fit 768 px at 18 px).
   Or: two pages of 31 days, vertical, 0 at the top, 19 px rows — it follows your words, but the run turns a page at
   day 32. Which one? (Needed before the brief.)
5. **Collisions to accept**: your 160 and 320 (Thalès's and lesson 3's banks), your 60 (lesson 1's first ladder), the
   sheet's 207, 96, 48 (quotients of 414 and 192).
6. **A DZ port**: one fraction exercise (« le plus petit dénominateur commun », the 4e automatism) into the bank, or
   none.
7. **Island B « moors »**: B stands where the layout put it; the 3D walkway spans the segment whatever the pillar (the
   true scale is the panel's). Moving B to the pillar is a layout change — not proposed.
8. **K3 and K4 surfaces**: no gear is drawn on any surface (mirror, log, board, trainer, revision page). Do you want a
   gear anywhere (e.g. the revision page)?
9. **The mission's wrong tries cost nothing** but their run (34 tries on 20k + 1 would find 681). Keep it so, or a cost
   (e.g. a coin of the harbour per wrong poster)?

**Decided by default by the main session on 2026-11-26, after the owner said « continue » without answering — he may
override any line:** 1 — go for the three pieces (he asked for both lessons; the workshop is his own exercise);
2 — version B, « plus petit multiple commun » in full everywhere, never « PPCM » (no official text names it);
3 — the nouns accepted; 4 — five ROWS, 0 at the left; 5 — the collisions accepted; 6 — no DZ port; 7 — B does not
move; 8 — no gear drawn anywhere; 9 — **a purse of 3 posters per run of the mission** (free tries let 20k + 1 find 681
in 34 tries without the lesson: the mission must need it, review §A.8).

### What this design could not verify

The engine claims marked « To VERIFY » (a bench outside a workshop, `seg.a` set at run time, the end after a mission);
how the 3D walkway's two lanes read at 1366×768 (no walk); the 18 px legibility of K4's 17 px columns (computed, not
seen); whether the bank's P1 sheets that compute a PGCD (`counted: false`) are meant to stay. Small numbers below 100
were checked by hand against the design page's lists, not by the tool.

### Gate A, answered

| # | Gate A defect | What changed |
|---|---|---|
| 1 | four feedbacks gave the answer; 2129's fact was false | every fact written from who crosses / who works that day, never the answer: K1 686 « un pilier plus proche tient déjà »; K4's last step 1065 « pas la première fois »; mission 2129 « l’ouest et le sud sont au port », 680 and 2 « les trois sont au port », 2721 « pas la première fois »; the proof checks who crosses on each mission day (8 lines) |
| 2 | K3's chips showed the turns | chips 32 · 20 · 52 · 12 · 2 and 10 · 46 · 6 · 2 · 3 — translation errors only |
| 3 | K3's product could not be laid | the story mode has its own ruler 0…700 (1,57 px per case); 640 at 1 006 px, 460 at 723 px |
| 4 | the mission was an unnamed third piece | piece 3: `story.mission` ported from rootCourts (missionOpen, openMission, solveMission, finale after it on the last island G), the fact from `crews.js › daysFact`, the `window` variant; a wrong try costs nothing — open questions 1 and 9 |
| 5 | three numbers in factors forged by no key | K4's last step: three teams, cycles 4, 14, 19, exponent boxes 2² × 7 × 19, 532, day 533; K4's tablet adds the line |
| 6 | surfaces of K3, K4 undescribed; « the gears » on the revision page | § What each surface draws; no gear on any surface; open question 8 |
| 7 | tiles that told | K1: two slots, the 0 qualifier its own slot, « le PGCD » added; K4: « jours de travail et de sommeil réunis · jours de sommeil » |
| 8 | « PGCD ou PPCM ? » on an open question | NOT decided: § « PPCM : two versions » — the design works either way, the seven sentences that change are listed; open question 2 |
| 9 | the five tables drawn otherwise | NOT decided: open question 4, both drawings described |
| 10 | uniqueness argued by the scale | rewritten: lesson 2's precedent, the bench is each key's own; `fixed` / `fit` is drawing only |
| 11 | 63 / 75 on screen | the dash's W2 and W4 now 24 and 92 (552, 4, 2 208): checked CLEAR |
| 12 | PGCD × PPCM = a × b not said to be left out | § What is kept for lesson 5, and a string check |
| 13 | feasibility | K4's 1 164 px (or 15 px columns); the shortfall label under the lane when wider than the gap; a refused walkway costs no coin, unlike the bridges' purse |
