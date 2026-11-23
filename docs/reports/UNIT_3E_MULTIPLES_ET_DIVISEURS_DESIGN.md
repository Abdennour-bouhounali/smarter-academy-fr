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

Not designed yet. Port sources are in `docs/curriculum/net-3e/fr_dz_table.json` and the plan's log of 2026-11-23.

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

## Lesson 3 — `fraction-irreductible` — keys and numbers only

Port source: DZ `ikhtizal-kasr` (v2, every key on the islands: a MARKED bridge — the whole gap and its lit stretch are
the fraction) and `awwaliyan-fima-baynahuma` (the coprime pairs). Keys, in the student's order:

| # | Key | Rule | On what | Point |
|---|---|---|---|---|
| 1 | `simplifier-facteurs` | strike out the prime factors common to the numerator and the denominator | a marked bridge 210 cases, 154 lit — the sign writes 154/210 = (2 × 7 × 11)/(2 × 3 × 5 × 7) → 11/15 (DZ's « successive divisions » key rebuilt around the decompositions) | P2 |
| 2 | `irreductible` | a fraction stays as it is when its terms share no prime factor (their PGCD is 1) | port `ghayr-qabil`: a marked bridge 96 cases, 65 lit, held only by the plank 1 (65 = 5 × 13, 96 = 2⁵ × 3) | P1 |
| 3 | `diviser-par-le-pgcd` | divide both terms by their PGCD: irreducible in ONE step | port `ikhtizal-pgcd` with a purse: 858/1 131, PGCD 39 by Euclid (1 131 = 858 × 1 + 273, 858 = 273 × 3 + 39, 273 = 39 × 7 + 0) → 22/29 | P4 |
| 4 | `resultat-irreductible` | give a calculation's result irreducible | port `natija-mukhtazala`: 5/12 + 7/30 = 39/60 = 13/20; 6/35 × 14/15 = 84/525 = 4/25 | P3 |

Reserved: 154, 210, 65, 96, 858, 1 131, 273, 39, 22/29, 5/12, 7/30, 39/60, 13/20, 6/35, 14/15, 84/525, 4/25 — checked
CLEAR (pairs and numbers ≥ 100) against lesson 1 and the stories. Version 1's 767/1 003 (PGCD 59: lesson 1's 3 127 =
53 × 59 writes 59) is dropped.

## Lesson 4 — `multiples-et-diviseurs-communs` — keys and numbers only

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
