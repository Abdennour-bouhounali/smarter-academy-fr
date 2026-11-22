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

## Lessons 2–5

Not designed yet. Port sources are in `docs/curriculum/net-3e/fr_dz_table.json` and the plan's log of 2026-11-23.
