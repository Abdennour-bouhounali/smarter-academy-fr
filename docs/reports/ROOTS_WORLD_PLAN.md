# The world of 4AM unit 2 « الحساب على الجذور » — PLAN (2026-11-20, nothing is built)

> **Status (2026-11-22).** HISTORY: why the world `gameworld/rootCourts/` is shaped as it is — three candidate mechanics,
> the council, the design of the Algerian lessons that played it. Imported from the Algerian platform (DZ dev `7f4cef1c`)
> on 2026-11-22. True here: the world's code (`apps/web/src/lessons/common/gameworld/rootCourts/`), its contract in
> `GAME_WORLD.md` §2ter-3. Not true here: every lesson named below (`jidhr-tarbii`, `natiqa-ghayr-natiqa`,
> `muadalat-x-murabba`…) is an Algerian lesson, not in this repository — see the Algerian platform; its bank, its walk and
> its Arabic sentences are gone. The plan's first French use is « racine carrée » (3e) on this world (plan §8). Documents
> it cites that were deleted on 2026-11-22 are read with `git show 049380e:docs/<path>`.

**Status: a plan, written for the owner's decision. No code, no file other than this one was written; no build, walk,
test suite or `check:lessons` was run (another session was committing).** What was read: `CLAUDE.md`, `docs/README.md`,
`LESSON_V2_MASTER_PLAN.md` §4ter-0 and §9 (deleted 2026-11-22), the skill `.claude/skills/lesson-v2/` (five files), `LESSON_V2.md`,
`GAME_WORLD.md` (§1–§2ter-2, §2ter-0, §2ter-1, §2sexies, « استكشف » and its table of kinds), `MANIPULATION_DNA.md` §17 and
`INTEGRATION_LESSON_PLAN.md` §6 (both deleted 2026-11-22), the headers of `kit/WorldRuntime.js`, `kit/LessonWorld.jsx`, `missionIsle/Game.js`,
`kit/authoring/README.md`, and `npm run lesson:brief` for the six lessons. NOT read, by the owner's rule: the old
lessons, the textbook, `docs/sources/**`. Of the banks, only the briefs' digests and one exercise file (for its shape).

**The STOP is §9: nothing is coded before the owner's yes on the decisions of §11.**

> **2026-11-21 — the owner chose mechanic A (« greate build the world A on lesson 1 just the lesson inside not the
> exercices … when i validated you continue the work »). BUILT, to be validated: the world `gameworld/rootCourts/` and
> the STORY of lesson 1 with its three forges** — what exists, how it differs from this plan and what is left:
> `docs/architecture/GAME_WORLD.md` §2ter-3. Differences from the plan below: the terraces float at ONE height and a
> platform that rides FLIES to the next terrace (the shared runtime's ground is flat: no cliff, no lift shaft); the
> first forge's tiles say « ثلث المساحة » where the plan said « half the area » (two pairs of rules were identical on
> every court); the fraction court of the attacks is 9/16, not 49/64 (a headline of the bank); the gate run and the
> final mission are NOT built. Decisions D2–D7 were taken as recommended, D3 (the unit's order) is still the owner's.

Same day, after the owner played the first court: (1) he was stuck after rods 5 and 6 — the rod now returns to its post by itself (`story.release`) and the instruction sends him to the court of 16, the only one lit; (2) the tool is called « المقياس » on screen (this plan's older paragraphs still say « القضيب »); (3) the rod is lit, at rest on its post and in his hand. (4) he puts the tool down whenever he wants (key X or its button), and one platform on the court of 30 is enough to leave it; (5) the six terraces stand in one line going into the screen; (6) a course of fourteen gates « سباق المربّعات » (the kit's new `GateRun`) stands on the third terrace, before the court of 100. (7) forge 2's last step names each of its boxes; (8) the clamp on the court of 30 works on whole marks; (9) a platform flies him away only when the terrace is finished; (10) the view follows him in every direction (the kit's `freeLook`, clock controls); (11) the first terrace opens on a building yard — crates of 9 and 25 tiles laid as squares — before the court of 30; (12) every world has « قواعدي » in its top bar, and a tablet he closes flies to it.

---

## 1. The six lessons — what binds, and what the banks ask

The catalogue's order (from `lesson:brief`) is NOT the order of the request: the catalogue puts `muadalat-x-murabba`
third; the request lists it fifth. Decision D3.

| # (catalogue) | Lesson | الكفاءات (ids stay) | Bank: 50 exercises each | What the questions ask |
|---|---|---|---|---|
| 1 | `jidhr-tarbii` | P1 √a = the positive number whose square is a · P2 read and write √a; exact value against what the calculator shows · P3 (√a)² = a and √(a²) = a, a positive | 140 questions; P1 45, P2 44, P3 51 | complete « 13 is the root of … »; write without the sign; (√19)²; √289 as a decimal, √(49/64) as a fraction; a value rounded to 10⁻²; « show A is natural »; √((2 − √5)²) with the sign to decide; level 5: a SQUARE PLOT of given area, its side |
| 2 | `natiqa-ghayr-natiqa` | P1 classify a root: rational or not · P2 squares of rational numbers and their roots · P3 the root of a non-square is not rational; the calculator gives an approximation · P4 bracket a root, give its rounding | 154 questions; P1 47, P2 57, P3 50, **P4 none** | pick the number that is not rational and justify; « compute 1,732² without a calculator »; which of 4, 8, 16, 32… have a rational root; approximations by defect and by excess; all n with √(2n) rational; level 5: plots, tanks, panels |
| 3 | `muadalat-x-murabba` | P1 opposite numbers have the same square; a square is positive · P2 the number of solutions of x² = a by the sign of a · P3 solve by writing x² = (√a)² · P4 equations that reduce to x² = a | 170 questions; P1 66, P2 104, **P3 none, P4 none** | (−3/2)²; how many solutions has x² = −7; « is Mourad right? »; the positive solution, the negative one; write x² − 6 = 0 as x² = a; level 5: a rectangle whose width is two thirds of its length (x² = 3600) |
| 4 | `amaliyat-judhur` | P1 √a × √b = √(ab) · P2 √a ÷ √b = √(a ÷ b) · P3 the proof by squaring (two positive numbers with the same square are equal) · P4 √(a + b) ≠ √a + √b | 142 questions; P1 90, P2 35, P3 17, **P4 none** | compute A; write as √n; « show A × B is natural »; an irreducible fraction; √(a + b) on a = 9, b = 16; level 5: a square plot of 432 m², its side as a√3 |
| 5 | `tawzif-khawass-judhur` | P1 √n as a√b, b smallest · P2 add like roots (distributivity) · P3 a rational denominator · P4 expand with the identities | 152 questions; P1 59 (+28), P2 65, P3 28, **P4 none** | write as a√2, a√3; the largest perfect square dividing 72; 3√8 as a√2; 1/√2 = √2/c; level 5: plots of 288 m², « show L² = 800 » |
| 6 | `wadiya-idmajiya-judhur` | P1 the integration situation | 169 questions | plots, rectangles of the same area as a square, perimeters as a√10, a triangle with sides √3, √6, 3, discs |

Four facts of the banks that shape the world:

1. **The exam's situation is a square plot whose area is known and whose side is asked** (every level 5 of lessons 1, 2,
   4, 5 and most of 6). A world whose object is that square is the exam's own picture.
2. **Lessons 4 and 5 weigh most**, and « a√b » is the most frequent shape (a√2, a√3, a√5).
3. **Five الكفاءات have no bank exercise** (lesson 2 P4; lesson 3 P3, P4; lesson 4 P4; lesson 5 P4): the exam sitting
   cannot prove them. Decision D6.
4. **Almost every answer is typed as a number** (« rational » 122–149 per bank; « give a »): the sitting needs no new
   template. The world's own last steps and the trainer do: no typed answer with a real radical sign exists in the kit.

Prerequisites (the launch kit): core `3am.m3.r06` (powers; `quwat-adad-nisbi`, an old lesson), support `3am.m4.r03`
(Pythagoras, an old lesson). Lessons 4 and 5 also stand on `3am.m5.r01` (simplifying an expression).

---

## 2. Three mechanics

**One page per mechanic** (asked by the owner; standalone — open each in a browser):
`docs/reports/mockups/roots-world-A-courts.html`, `roots-world-B-lantern.html`, `roots-world-C-ropes.html`. Each has a
3D view at the top (2026-11-21: the game engine's own robot, sky, clouds and materials; the mouse turns it) and, under
it, the controls, a 2D diagram and small drawings of the other lessons. The 3D view follows the controls. They are
sketches to compare the ideas, not the game: the robot does not walk, there is no forge. The 3D sources are
`docs/reports/mockups/roots-world-3d/` (`a.js`, `b.js`, `c.js`, `common.js`); `node
docs/reports/mockups/roots-world-3d/build.mjs` bundles them, with three.js, into the three pages (about 750 KB each).

### A — « قصر الساحات » : the square court and its side (area ↔ length)

- A court is a SQUARE whose area is written on its gate, in tiles. Its side is a length that has no number yet.
- The student sets a LENGTH (his walk along the wall pulls out a rod); the world builds the square on that length.
- Law of the world: **a length is the side of the court exactly when the square built on it covers the court — no band
  left, nothing over the walls.**
- The square on his length is a platform: it rides the court's lift, or tilts into the band it leaves, or jams on the rim.
- Most courts are ridden by NO number of the rod's dial: the side is then named by its court — √a.

| Lesson | How it lives there |
|---|---|
| 1 | the side of the court of a; a calculator's rod leaves a band; build a court on a rod and take a rod from a court undo each other |
| 2 | courts whose side is on a mark (squares of naturals, of fractions) against the others; the dial that zooms and never closes; bracketing |
| 3 | a post at 0 on a signed wall: the walk left and the walk right build the same court; a court of 0 tiles is a point; no walk builds a court of −4 |
| 4 | changing the unit tile: a court of a slabs, each of area b, holds a × b tiles and its wall is √a slab-sides of √b; two rods at a right angle against the diagonal for the sum |
| 5 | which slab paves the court squarely (b smallest); rods of the same slab end to end; a square cut by his hand for the identities and the rational denominator |

- **The hand**: the length (walk, then a dial of units, tenths, hundredths); later the slab and the count per side; the cuts.
- **The verdict**: a band left in amber with its area written (the platform tilts into it); a platform jammed on the rim
  with what sticks out; a platform that rides.
- **Weak**: it is the classic picture of a square (the novelty must be the play, not the name); « fits exactly » can
  read as unit 1's « nothing left »; exactness is invisible to the eye (49,999 looks like 50); lessons 4–5 are symbolic
  and the world can fall to an illustration; negative numbers have no object in a world of lengths.

### B — « فانوس التكبير » : a number is an enlargement

- A lantern on a rail projects a one-tile stencil on a tiled wall; at distance k it lights a square of side k, k² tiles.
- The robot's distance IS the factor; √a is the distance that lights exactly a tiles.
- Two lanterns in a chain multiply: enlarging by √a then by √b lights a × b tiles — the product rule is a composition.
- The quotient is the enlargement reversed; √72 is « enlarge by 6, then by √2 ».
- The floor carries marks in units, tenths, hundredths: the place for 50 is on none of them.

| Lesson | How it lives there |
|---|---|
| 1 | the distance that lights a tiles |
| 2 | the floor's marks; bracketing |
| 3 | needs an « inverted image » behind the lantern for the negative solution |
| 4 | its strength: product and quotient as chained lanterns |
| 5 | √72 = 6 then √2; nothing for sums |

- **The hand**: the distance. **The verdict**: light that spills past the painted square, or a dark margin.
- **Weak**: a number as an operator is abstract at 14; **sums have no home** (3√2 + 5√2, √a + √b, a + b√c, a
  perimeter) — half of lesson 5; the negative solution is not honest optics; the light's geometry must be true.

### C — « أوتاد وحبال » : a root is a distance on a grid

- Pillars stand on a grid over the sea; the robot throws a rope from one to another, p cells across and q along.
- The square built on the rope holds p² + q² tiles, shown by cutting and moving (Pythagoras).
- He chooses the pillar; a rope too short does not reach, too long sags.
- √8 = 2√2 is two equal hops in a line; like roots add along one direction.
- √a + √b > √(a + b) is the triangle itself.

| Lesson | How it lives there |
|---|---|
| 1 | the rope whose square holds a tiles |
| 2 | ropes along an axis and Pythagorean triples against the others |
| 3 | weak |
| 4 | the sum, very well; product and quotient have no image |
| 5 | k√b as k hops; like roots |

- **The hand**: the target pillar (p, q). **The verdict**: the rope reaches, falls short, or sags.
- **Weak**: only numbers that are a sum of two squares — **no √3, √6, √7, √11, √12**, and a√3 is everywhere in the
  bank; it stands on Pythagoras, only a supporting prerequisite; product, quotient and x² = a have no natural image.

*(A fourth idea was set aside before the council: a ramp whose height is the square of the distance — a parabola. Two
solutions are natural there, but reading a curve is not in the 4AM programme and lessons 4–5 have no image.)*

---

## 3. The council (skill `llm-council`, every agent on fable)

How it was run: five advisors in parallel (Contrarian, First Principles, Expansionist, Outsider, Executor), then
**three** anonymous peer reviewers — not five: the project's earlier council also used three — one plain, one with a
mathematics teacher's eye, one with a game designer's eye; then a chairman. The advisors saw mechanic A as first
drafted: with a « furnace » that melted tiles into a slab and cut the rod, a « squarer » that judged every identity,
and a « lens ×√b ».

**What it agrees on**

- **A is the mechanic.** All five advisors chose it. B has no home for sums and no honest negative solution. C cannot
  make √3 and has no image for the product.
- **A as first drafted would be rejected.** Opening on « 49 tiles: side 6 leaves 13, side 7 closes » is unit 1's
  remainder again.
- **The furnace goes.** A machine that hands over the rod does the mathematics for him.
- **Lessons 4–5 decide everything**: they carry the exam and had no experiment driven by the hand.

**Where it clashes**

- **The « squarer » as the only judge.** The Expansionist and First Principles wanted it; the Contrarian and all three
  reviewers call it one mirror asked five times — what the owner forbids. The chairman sides with the reviewers.
- **The lens.** Two advisors keep it, two drop it. The reviewers showed that paving with slabs alone gives only k√b and
  cannot do √2 × √3.
- **The first step.** The Executor wants a grey-box scene of lesson 1; the Contrarian and First Principles want lessons
  4–5 on paper first.

**What the peer review caught** (all three ranked the Contrarian strongest and the Expansionist the largest blind spot)

- Two mathematical errors in the Outsider's answer: a rectangle √a by √b has area √(ab), not ab; « the 50th tile spread
  along two edges » gives 7 + 1/14, not √50.
- **Exactness cannot be seen**: comparing two areas by eye is a calculator. Only a dissection that fits with no gap, or
  an exact written comparison, proves an equality.
- **No stake**: a bridge that falls is a verdict; a square that « does not close » is not. Nobody said what the student wants.
- **Irrationality is not observable**: « it never closes » is still telling. Lesson 2's bracketing had no experiment.
- **Negatives have no object.**
- **« b smallest » is the largest square divisor** — unit 1's skill: a bridge, or a re-skin?
- **Scale and transfer**: 432 tiles are unreadable at 1366×768; the exam is written.

**The verdict**: build A, changed — open on a court no number closes; no furnace; ONE object for lessons 4–5, « changing
the unit tile », in place of the lens; identities as dissections he cuts; lesson 3 on a signed wall; unit 1's divisors
used as a tool, not re-taught; he counts slabs, never 432 tiles; every sealed key ends in written form. **It rejects**
B, C, the furnace, the 49-first opening, the squarer as universal mirror, and any 3D before a storyboard of lessons 4–5.
**It could not settle**: the stake (the owner), whether a stated argument for irrationality is acceptable under « no
rule is told » (the owner), and whether dissections carry over to written a√3 work (only a real student).

**What I did with it.** §4 onwards is mechanic A rebuilt on the verdict. Two parts are MINE and were not seen by the
council: the stake (the court's lift, §4) and the argument for lesson 2 (the last digit of a square, §7). They answer
two of its open points; they are proposals.

---

## 4. The chosen mechanic — « قصر الساحات » in ten lines

1. A hanging ksar: terraces stacked up a cliff face, each with a square COURT. The robot زيرو climbs it court by court.
2. A court's AREA is written on its gate, in tiles (« 30 بلاطة »). Its floor is a grid of unit tiles; where the area is
   not a perfect square, the tiles along two walls are cut — the court is a given of the world, as a gap was.
3. The court's lift is a square shaft the size of the court. Only a platform that touches the four walls rides it.
4. The robot carries a ROD. Walking along the wall from the corner post pulls it out: **his walk is the length.** The
   world builds the square platform on the rod.
5. He lowers the platform. Smaller than the court: it tilts into the band it leaves, the band's area is written, and it
   slides back. Larger: it jams on the rim, and what sticks out is written. Equal: it rides to the next terrace.
6. The line at the top of the screen writes it live: `5 × 5 = 25` beside « الساحة: 30 » — the analogue of `a = b × q + r`.
7. A court of 36 is ridden by 6. A court of 30 is ridden by NO number: 5 leaves a band, 6 jams; 5,4 and 5,5; 5,47 and
   5,48 — at every zoom of the dial. Most courts are like this one.
8. The side of the 30-court exists all the same: it is the wall. He clamps the rod on the wall, corner to corner, and
   that rod rides. It is a length with no number; it gets a NAME — the side of the court of 30, written √30.
9. So three things only: a tile (area), a court (a square), a rod (a length). Lessons 4–5 change the tile; lesson 3
   puts the post at 0 on a wall that goes both ways.
10. The world never says « wrong »: it builds the platform he asked for, and the platform does what it does.

**Why this is not unit 1 again.** Unit 1 is one-dimensional and whole: a plank fills a gap or leaves cells. Here the
variable is continuous, the failure has two sides (too small, too large) so every miss narrows the search, and the
central fact is the opposite of unit 1's: for most courts no number fits at all. The first court of lesson 1 is one of
those (decision D4).

### The pieces — what is drawn, what moves

| Piece | Drawn | Moves |
|---|---|---|
| The ksar | terraces on a cliff face, ochre walls, arcades, palms, the sea of clouds below (the kit's sky and clouds) | — |
| A court | a square floor of unit tiles in the brand blue and sand; cut tiles along two walls when the area is not a square; a gate plaque with the area | the tiles under the platform light up as it lowers |
| The corner post | a post at the court's corner, where the rod is anchored | — |
| The rod | a telescopic rod with a dial on its handle (units; then tenths, hundredths when the terrace allows) | pulled out by the walk; snaps to the dial's marks; clamps on a wall |
| The platform | a square slab of light on the rod, its side label and its area label | grows with the walk; lowers; tilts, jams or rides |
| The band | the L of floor the platform leaves, in amber, with its area; a magnifier the student drives when it is thin | blinks; widens under the magnifier |
| The lift | the court's shaft and its rail up the cliff | carries him to the next terrace |
| The hall of mirrors | a terrace with a mirror wall: the rule forge | — |
| Two stations (lesson 1, key 3) | « ابنِ ساحة » (a rod in, a court out) and « خذ الضلع » (a court in, a rod out) | — |
| The gate run | the rail of light of lesson 1's run, up the cliff | as today |
| People | none drawn in lesson 1; if one is needed, `KidFigure` | — |

Text on the world's screens is 18 px or more (as on « جزيرة المهمّات »). Large numbers are never tiled one by one: a
court above about 150 tiles is drawn in blocks, and the paper mode carries the exam's numbers.

---

## 5. Lesson 1 `jidhr-tarbii` — its keys, each with its own experiment and forge

Every number below is a PROPOSAL: before use each is checked against the bank and the other lessons
(`scripts/lesson-bank-numbers.mjs`, the story's test). Three الكفاءات of about equal weight in the bank → three keys.

### Key 1 🔑 `dil-as-saha` — P1: the side of a court of a tiles is the positive number whose square is a

- **Nature**: a condition on one case. **Found in the world, not on a screen** (`review.md` §A.0): the lifts are the
  situation that makes the rule necessary.
- **What he does before the forge**: court of 30 first (nothing whole rides: 5 leaves a band of 5 tiles, 6 jams by 6);
  then courts of 16, 36 and 100, each ridden after tries. Before each lowering he says how many tiles the platform will
  cover — the prediction, a star when right at the first try.
- **The tiles** — « تركب المنصّة مصعد الساحة عندما: [what I compute from the rod] [equals what] ». First slot: the
  rod × itself / the rod × 2 / the rod × 4 / the rod + 2. Second slot: the court's area / half the area / a quarter of
  the area / the area less 1. Sixteen rules, ONE holds (the forge's test must prove it on the story's courts).
- **The false rules students really hold** (the bank's own misconception signature is the double for the square):
  « twice the rod is the area », and « four times the rod is the area » (the perimeter).
- **The mirror** runs his rule on his own log of platforms. The court of 16 is chosen so that « four times the rod »
  SURVIVES it (the rod 4 rides, and four times 4 is also 16); the court of 36 breaks it in front of him (the rule sends
  a rod of 9: 81 tiles, jammed).
- **The attacks**: a court of 0,25 tile — its side 0,5 is LARGER than its area, which breaks every « a part of the
  area » rule; a court of 49/64.
- **The last step** (paper): a square plot whose area is three digits; he types `[ ] × [ ] = [ ]`, then the side.
- **The tablet**: his rule first, then its name — « الجذر التربيعي », and the writing √36 = 6.

### Key 2 ✍️ `qima-madbuta` — P2: the exact value is written √a; a calculator shows an approximation

- **Nature**: a comparison of three candidates for one length — a whole number, a decimal, the calculator's ten
  digits — none of which is the length. A NEW experiment kind, `calc`.
- **It starts from** the court of 30, which he left unridden.
- **The experiment**: three rods lie ready — 5, then 5,5, then the calculator's 5,477225575 (shown on a drawn
  calculator). For each he says BEFORE whether it rides. The world lowers each platform; the band or the overhang is
  written with its exact area, and he drives the magnifier himself until he SEES it (the review's point: 29,99… looks
  like 30). The calculator's rod is computed exactly by the code: it misses by about a hundred-millionth of a tile, on
  one side or the other — a fact, shown magnified. Then he clamps the rod on the wall: it rides.
- **The tiles** — « طول ضلع ساحة مساحتها 30 بالضبط هو: [the number 5 / the calculator's number / the length whose
  square is 30] ؛ وما تعرضه الحاسبة: [is that length / comes close to it] ». The rule « the calculator shows the
  length » is refuted by his own row.
- **The attack**: a court of 36 with a calculator showing 6 — there the calculator's number IS the length. The rule
  that survives says « comes close, and sometimes is »: the attack is what makes it exact.
- **The last step**: two columns to fill for three numbers — the exact writing (a real radical sign over a box) and
  the value rounded to 10⁻² (a decimal box).
- **The tablet**: the sign √, how it is read, « القيمة المضبوطة » and « قيمة مقرّبة ».

### Key 3 🔁 `dhahab-wa-iyab` — P3: (√a)² = a and √(a²) = a, a positive

- **Nature**: two operations that undo each other. A NEW experiment kind, `roundtrip`.
- **The experiment**, at the two stations of a terrace: a rod goes into « ابنِ ساحة » and a court comes out with its
  plaque; a court goes into « خذ الضلع » and a rod comes out. He predicts the plaque or the rod BEFORE each run:
  the rod √23 → a court of ? ; the rod 14 → a court → its side ? ; then chains of two and three runs. One round walks
  9 steps to the LEFT of the post: the court holds 81 tiles, and the side that comes out is 9 — a length, never −9.
- **The tiles** — « أبني ساحة على القضيب √a فتكتب لوحتها: [a / a × a / √a / 2 × a] ؛ وآخذ ضلع ساحة بُنيت على قضيب
  طوله a فأجد: [a / a × a / √a / العدد نفسه بإشارته] ».
- **The false rules**: (√23)² = 23 × 23; √(14²) = 14²; « the sign comes back ».
- **The attack**: the walk to the left on a new number; a rod that is a fraction.
- **The last step**: four lines typed in their shape — `(√[ ])² = [ ]`, `√([ ]²) = [ ]`.
- **Honest limit**: the bank's level 4 asks √((2 − √5)²), which needs « 2 − √5 is negative ». The key gives the idea
  (the side is a length); the comparison of 2 and √5 is trained in « تدرّب » and belongs to lesson 2's bracketing.

No two keys share a (kind, mode): the islands' log, `calc`, `roundtrip`.

### The stages of lesson 1's story

| # | Terrace | What he does | Key |
|---|---|---|---|
| 1 | « السطح الأوّل » — a court of 30 | pulls the rod, lowers platforms of 5 and 6: a band, a jam. The lift stays. A side door leads on | — |
| 2 | courts of 16, 36, 100 | finds the rod that rides each; predicts the tiles covered before each lowering | P1 |
| 3 | the hall of mirrors | forge 1 → tablet 🔑 | P1 |
| 4 | back at the court of 30 (he walks back: §2ter-1) | the three rods, the magnifier, the rod clamped on the wall; forge 2 → tablet ✍️ | P2 |
| 5 | the terrace of the two stations | the round trips; forge 3 → tablet 🔁 | P3 |
| 6 | the gate run up the cliff | eight gates: √81, (√7)², √(5²), « which writing is exact? » — mental numbers only | P1–P3 |
| 7 | « السطح الأخير » — the lesson's problem, in paper mode | a square school garden of known area must be fenced. He CHOOSES how to get its side — area ÷ 4, area ÷ 2, or the number whose square is the area — and the world fences the square he computed: the two wrong ones are visibly not the garden. Then he types the side, the fence's length, its cost in دج | P1 |

The instruction of each step is whole and stays (the story's `objective`); the card « من الساحة السابقة » on the right
carries the last court and its rod (`recall`). The final mission cannot be won with last year's keys alone: its
distractors are the two errors the lesson fights.

---

## 6. The gate run, the practice, the sitting and the satellites of lesson 1

| Part | What it is | New or kit |
|---|---|---|
| The gate run | lesson 1's run as it is (rail, arches, three gates, hearts), the questions as data of the lesson | the run's code lives in `divisorIsles/Game.js` and again in `missionIsle/Game.js`: for a third world it MOVES to the kit, once (kit work) |
| « فضاء التدريب » | a node per key, levels of gate runs, the summary node « تحدّي الامتحان » | kit (`PracticeHub`, `kit/ladder.js`) + the lesson's `practice.js` |
| « تدرّب » | game and exam formats per knowledge card | kit (`Trainer.jsx`) + the lesson's `trainer.js`; NEW: a typed root (below) |
| « الامتحان الأبيض » | the bank, as it is | kit: one call to `createBankSittings` |
| « خريطة المعارف » | the lesson's map and its journey | kit (`KnowledgePage`) + the lesson's `knowledge.js` |
| « عُدّة الانطلاق » | one family for the core prerequisite, the square of a number (`3am.m3.r06`) | kit + one NEW family; its `labTool` is null (no instrument of an earlier lesson exists) |
| « مختبري » | ONE instrument, « الساحة والقضيب »: a court and a rod, free numbers, the three verdicts | NEW tool in `lessonlab/tools/` |
| The board | the hour on numbers different from the story's; each key proved on the board before its name | kit (`LessonBoard`) + the lesson's script; to check: whether its `ask` stations can draw a court (a station type may be missing — reported, not bent) |
| The class test | the platform's own questions, every الكفاءة, keys re-computed | data |

---

## 7. Lessons 2 to 5 — how each reuses and extends the world

One line of design per key; each lesson gets its own design stop. The catalogue's order is used (D3).

| Lesson | The world piece it adds | Its keys and the nature of each experiment |
|---|---|---|
| 2 `natiqa-ghayr-natiqa` | the rod's dial opens tenths, hundredths, thousandths; courts of fractional area | **classify** (a sort of courts by « ridden by a number of the dial or not »: the kind `sort` exists in the first world and would be re-made here) · **squares of fractions** (a court of 49/64: tiles cut in eighths, the rod 7/8 rides) · **the calculator again, as an argument** (below) · **bracketing** (a procedure: a kind `dial` — he predicts the next digit, each try is a band or a jam, the two bounds stay written; the rounding is read from them) |
| 3 `muadalat-x-murabba` | the post stands at 0 in the MIDDLE of a wall graduated both ways | **opposites** (the walk left and the walk right build the same court — a symmetry) · **how many** (he is given a court to build: 49, 0, −4; he walks; the counter never goes under 0 — a count of 2, 1, 0) · **solving** (the two stopping places written ±√a) · **reducing** (an equation is first brought to « a court of a ») |
| 4 `amaliyat-judhur` | « تغيير البلاطة »: the unit tile is replaced by a SLAB of area b; a second rod | **product** (a court of a slabs of area b: its plaque reads a × b tiles, its wall is √a slab-sides — his hand chooses a and b; a whole count per side gives 6√2, any count gives √2 × √3) · **quotient** (the same, reversed: which smaller tile) · **the proof by squaring** (a procedure: cards in order, like `letters`) · **the sum** (two rods at a right angle: the diagonal's court holds a + b tiles, and the corner path is longer than the diagonal — the misreading √a + √b is BUILT and is too long) |
| 5 `tawzif-khawass-judhur` | cuts: a square he cuts and moves | **a√b, b smallest** (a hunt: which slabs pave the court of 72 squarely — 2, 8, 18, 72 — and which is smallest; unit 1's divisors are the tool, not re-taught) · **like roots** (rods of the same slab end to end; a rod of another slab does not join) · **rational denominator** (the court of 2 cut in half: a rectangle √2 by √2/2 holding exactly 1 tile) · **identities** ((√3 + 1)² cut in four pieces: 3, 1 and two strips; (3 + √5)(3 − √5): a square of side 3 less a square of side √5, moved into a rectangle of 4 tiles) |
| 6 `wadiya-idmajiya-judhur` | no key: `mission-isle`, missions as data, the endless game | a « plot » SCENE is needed (the integration plan's §6 listed it, not built): the square plot, the rectangle of the same area, the fence |

**Lesson 2's argument — mine, not the council's.** No walk shows that a root is not rational. What a 14-year-old CAN
find and defend: **the last digit of a square**. He squares decimals whose last digit is 1 … 9 and reads the last digit
of each square (1, 4, 9, 6, 5, 6, 9, 4, 1): never 0. So a number with decimals, however long, never has a whole
square: no number of the dial rides the court of 30. That is a pattern he finds (a chart), not a sentence he is told.
What it does NOT prove: that no FRACTION does. The step from « no decimal » to « not rational » would be told on the
tablet. Decision D5.

**The verdicts of lessons 4–5 are exact, never by eye**: a dissection that fits with no gap, or the two plaques
written (`5 + 2√6` against `5`). The code compares exact values (`packages/core/arithmetic/trigonometry.js` already has
`surd`, `surdMul`, `surdEq`, `surdLatex`; sums `a + b√c` are to add).

---

## 8. What is the kit's, what is new

**Reused as it is** (`gameworld/kit/`, `gameworld/engine/`): `WorldRuntime` (scene, loop, robot, camera, sky, turning
round, the prompt bubble, save, evidence, the hub, the sitting, the paper mode), `LessonWorld` (the shell), `Instruction`
and `Recall`, `RuleForge` and `forge.js`, `Tablet`, `Trainer`, `KnowledgePage`, `PracticeHub`, `ExamSitting` and
`bankSitting`, `Paper`, `Spaces`, `Title`, `End`, `Result`, `Fit`, `saveSync`, `claims`, `journey`, `ladder`; the launch
kit, « مختبري », the class board; `status:lesson-v2`, `lesson:brief`; registration in `worlds.js › WORLDS`
(one line). The kit names no lesson and no world; the new world names no lesson.

**New — the world** `gameworld/rootCourts/` (id `root-courts`):

| File | What |
|---|---|
| `Game.js` | extends `WorldRuntime`: the ksar, the courts, the rod and its dial, the platform, the three verdicts, the lift, the stations, the last terrace, the log of platforms |
| `RootCourts.jsx` | what the world gives the shell: `Hud` (the live line `s × s = …` against the court), `Under`, overlays |
| `logic.js`, `strings.js` | the law of the world (`outcome(side, area)`: rides / band / jam, exact), its sentences |
| `ruleForge.js`, `forgeParts.jsx` | a case is a court and a rod; the mirror draws it (the court, the platform, the band magnified) |
| `Inquiry.jsx` + one file per kind | lesson 1: `calc`, `roundtrip`; later `dial`, `lastdigit`, `sort`, `mirror-walk`, `retile`, `corner`, `hunt`, `cut` — each written when its lesson is designed, never ahead |
| tests | logic exhaustively; render tests; the law as a forge (exactly one rule holds) |

**New — in the kit** (each serves every world):

1. **A typed root**: a token of a last step and of a trainer sheet with a real radical sign over a box, and « a√b » as
   two boxes around a printed sign — as `{ frac }` was added for lesson 8.
2. **The gate run moved to the kit** (today copied in two worlds).
3. **Claim kinds for roots**, in `kit/claims.js` AND `ClaimVerifier.php` with rows in the shared fixture: today every
   kind is a statement about divisors. At least: `square` (s × s = a, rationals), `rootBracket`, later `rootForm`
   (k² × b = n, b with no square factor), `solutions`.
4. **Authoring helpers for this unit** (`kit/authoring/`): squares, exact surds, the pool of free numbers; the bank
   script checks single numbers as well as pairs.
5. **The shared walk library**: its story part plays bridges; it needs the world's own driver (a walk reads sizes and
   questions from the lesson, never the answer).

**New — for the lesson**: its folder (`world/`, `board/`, `lesson.pack.js`), the instrument, the launch family, the
class test; its old version traced and deleted in the same change.

---

## 9. The order of work — with the STOPS

| # | Step | Who | Ends with |
|---|---|---|---|
| 0 | **This plan** | — | **STOP: the owner's decisions (§11). Nothing below starts without his yes.** |
| 1 | A storyboard page (static, drawn in code, in `docs/reports/mockups/`): six screens of lesson 1 (band, jam, ride; the three rods; the round trip) AND the five experiments of lessons 4–5 the council asked for — √72 = 6√2, √2 × √3, (√3 + 1)², (3 + √5)(3 − √5), 1/√2 — each naming the variable his hand moves and what the world does. If one cannot be played, it is said there | main session | **STOP: the owner looks** |
| 2 | A grey-box of ONE terrace, no art: the walk, the rod, the platform, the three verdicts, courts of 30 and 36 | main session (3D) | **STOP: the owner plays it.** Its real time is measured: it prices the rest |
| 3 | The kit's additions (typed root, claims on both sides, the run moved) ∥ the world's core (scene, mirror, the two kinds) | agents on opus ∥ main session (3D) | unit tests; the run re-walked on ONE reference lesson of unit 1 |
| 4 | Lesson 1 through the skill's pipeline: wave 1 (written world ∥ board, class test, launch family, instrument), wave 2 (forges and experiments ∥ pack, old version deleted), walks at 1366×768 on a frozen copy, the eyes on the new screens — all of them: every screen of a new world is new | agents, main session | status ✅, the gate report, the docs, commit `feat(lessons): jidhr-tarbii — v2` on `dev`. Never pushed |
| 5 | Write back into the skill (the ledger, the briefs, the proven screens of the new world) | main session | same commit |
| 6 | Lesson 2's design stop, then lessons 3–5 one by one, then the last lesson by the integration plan (deleted 2026-11-22) | — | a STOP per lesson for a new piece |

One heavy check at a time; agents that write at once touch files that do not overlap; no source edited while a walk runs.

---

## 10. Risks, and what cannot be known before a student plays

| Risk | What is done about it | Still unknown |
|---|---|---|
| The owner reads « rides when it fits exactly » as unit 1's remainder | the first court is one nothing rides; two-sided misses; a continuous variable | his judgement — step 1 shows it before any 3D |
| The cost of a whole new world has never been measured (a lesson on an existing world: 1 h 30 to 2 h; a new piece: about an hour more) | step 2 is time-boxed and measured | the real figure. My guess — several working days before lesson 1's content starts — is a guess |
| Lessons 4–5 fall to illustration | each key has an experiment where his hand sets a and b, the slab, or the cut; shown on paper first | whether cutting a square carries over to WRITTEN a√3 work: only a student sitting the bank afterwards shows it |
| Walking is too coarse to set a length | the rod snaps to the dial's marks; the dial's precision is the terrace's | whether pulling a rod by walking feels good or fiddly on a laptop keyboard |
| A thin band is invisible | the band's area is written exactly and the magnifier is his | whether he trusts a magnified sliver |
| Irrationality is partly told | the last-digit argument covers decimals | D5 |
| Negatives have no object | lesson 3's signed wall; « no court of −4 » is the world failing to build one | whether « the counter never goes under 0 » reads as a reason or as a bug |
| The numbers collide with the bank or with other lessons | every number checked by script before use | the proposals of §5 are unchecked |
| The 3D scene on a weak school laptop | the same runtime as unit 1 (quality adapts) | never measured on a school machine — as for unit 1 |
| The prerequisites are old lessons | a launch family for the square of a number | whether students arrive able to square 14 or 0,5 at all |
| The board's stations may not draw a court | reported at lesson 1's wave 1, the kit grows first | — |

Not verified in this pass: that the proposals' numbers are free; that `kit/RuleForge.jsx` takes a new token without
touching its layout limits; that the walk library's non-story parts (hub, trainer, sitting, board, launch) run unchanged
on another world; the exact square of the calculator's ten digits (the tests compute it).

---

## 11. The decisions needed from the owner

| # | Decision | My recommendation |
|---|---|---|
| D1 | The mechanic: « قصر الساحات » (the square court, the rod, the lift) — or B, C, or none | this one, as rebuilt on the council's verdict |
| D2 | The stake and the setting: a hanging ksar climbed by lifts, the robot زيرو kept | yes; the council left the stake to you |
| D3 | The order of the unit: the catalogue's (x² = a third) or your message's (x² = a fifth) | the catalogue's: lesson 3 needs no product rule, and the compass and the reports read that order |
| D4 | Lesson 1 opens on a court NO number rides (30), the perfect squares second | yes — it is what separates this world from unit 1 |
| D5 | Lesson 2: the forge proves « no decimal number »; « not a fraction either » is given on the tablet | accept, and say so in the lesson's report — or tell me the argument you want |
| D6 | The five الكفاءات with no bank exercise: proved by the world's « تدرّب » only | yes for now; the gap in the bank is reported, not filled by generated exercises |
| D7 | Steps 1 and 2 before any world code: the storyboard page, then the grey-box you play | yes |

---

## 12. Lesson 2 `natiqa-ghayr-natiqa` — design (2026-11-21, by the skill's §0ter)

**What he already owns from lesson 1** (never forged again): the side of a court is the number whose square is its area
(√a); most courts have no decimal side; a root is bracketed between two marks (5,47 < √30 < 5,48); the calculator's
display is near the root, not the root; (√a)² = a and √(a²) = a.

**What is NEW for him here** — three things, three keys:

| Key | What he can do after it | Its own experiment (nature) | Where |
|---|---|---|---|
| 🧩 `murabba-natiq` « مربّع عدد ناطق » | Look at an area — a whole number, a decimal, a fraction (reduced or not) — and say whether its side is a number that can be WRITTEN (a fraction), and write it: √(16/9) = 4/3, √0,49 = 0,7, √(8/18) = 2/3; 2,5 and 12 are not | **A sorting by trying, in the world**: a terrace of five small courts, the rod's dial has marks of 1/3, 1/4 and 0,1. He predicts « تُركب / لا تُركب » for each before trying. No experiment screen: the forge's evidence is what he did (a key discovered in the world) | terrace 1–2 |
| ♾️ `la-kasr-yarkab` « عدد غير ناطق » | Know that the side of a court whose area is NOT the square of a rational is written by NO fraction and NO decimal — it is an irrational number — and that a calculator can only show a value near it | **A pursuit that never closes, in fractions** (new experiment kind `chase`): on the court of 2 the mirror proposes better and better fractions (3/2, 7/5, 17/12, 41/29, 99/70); for each he predicts band or jam; the world shows p × p against 2 × q × q: always ONE small tile apart, never zero. (Lesson 1's zoom was in decimals and showed a gap; this one shows the gap can never be zero whatever the fraction.) | the hall of mirrors |
| 🎯 `al-mudawwar` « المدوَّر » | Give the two values near a root at 1, 0,1, 0,01 (by default, by excess) and choose the ROUNDED one | **A decision by the middle mark, in the world**: between two neighbouring marks he lowers the rod of the MIDDLE mark (5,45 between 5,4 and 5,5): a band says the wall ends beyond the middle — the upper mark is nearer; a jam says the lower one. Evidence from the world's log | terrace 4, the dial gets a mark of 0,05 then 0,005 |

Classification (« ناطق / غير ناطق ») is not a fourth key: it is what key 🧩 and key ♾️ make him able to do together; it is
the practice ladder and the final mission.

**The story** (terraces in one line; numbers are this lesson's own, checked against its bank before use):
1. « سطح الكسور » — two courts whose areas are a fraction and a decimal (16/9, 0,49): the dial offers marks of 1/3 and
   0,1. Both ride.
2. « سطح الفرز » — five courts: 2,25 · 8/18 · 2,5 · 12 · 1,44. He predicts each, then tries. Three ride.
3. « قاعة المرايا » — forge 🧩 (tiles: the area written as an irreducible fraction; its two terms squares / even /
   decimals…), then the court of 2 with the mirror's fractions: forge ♾️. The tablets name « عدد ناطق » and
   « عدد غير ناطق ».
4. « سطح العلامات » — courts of 7 and 40: the middle marks. Forge 🎯 at the dial-maker's bench.
5. « السطح الأعلى » — the final mission: three plots of a co-operative (6,25 · 28/63 · 7): which sides can be written,
   write them; for the third, its two values at 0,1 and its rounded value, from a calculator's display.

**World work** (main session): fraction marks on the ruler (ticks and labels of 1/3, 1/4), courts smaller than one tile
drawn at a readable size, a dial with a middle mark. **Kit work** (agent): the experiment kind `chase`.

**Said at the design stop:** the fourth learning point of the brief (bracketing, rounding) is tested by NO exercise of
this lesson's bank — key 🎯 is taught because lessons 4–6 and the BEM need it, and the sitting cannot prove it.

---

**Corrected at the end of the build (2026-11-21):** the catalogue gives this lesson THREE الكفاءات, not the four the
brief printed — « bracketing and rounding » is not one of them. The three keys stay (the rounded value is needed by the
lessons after it and by the BEM); the evidence maps 🧩 → P2, ♾️ → P1, 🎯 → P3 (`world/evidence.js`). The same holds for
lesson 3 below: its catalogue entry has TWO الكفاءات (P1, P2), whatever the brief lists.

**As built:** the story has six terraces of DECIMAL courts (2,56 · 0,64 | 1,96 · 1,6 · 5,76 · 8,1 · 4,41 | 10,24 | 2 |
19 · 66 · 11,56 | the pavilion); fractions live in the forges, « تدرّب », the board and the final mission (12,96 ·
50/72 · 31). No course of gates. Three mirrors open the three forges.

---

## 13. Lesson 3 `muadalat-x-murabba` — design (2026-11-21, by the skill's §0ter)

The unit's order is the catalogue's (x² = a third). The owner once listed it fifth (decision D3, never answered): the
design below needs nothing of lessons 4–5, so the order can still change.

**What he already owns** (never forged again): √a is the side of a court of area a; (√a)² = a and √(a²) = a — and in
lesson 1's forge 🔁 he met ONE walk to the left that came back as a positive side; whether a side can be written
(lesson 2).

**What is NEW for him here** — three things, three keys:

| Key | What he can do after it | Its own experiment (nature) | Where |
|---|---|---|---|
| ↔️ `mutaakisan` « عددان متعاكسان، مربّع واحد » | Know that a number and its opposite have the same square, and that a square is never negative | **A symmetry he makes with his feet, in the world**: the corner post now stands BETWEEN two twin courts and the ruler runs both ways (… −2, −1, 0, 1, 2 …). Pulled to the right, the rod reads 5 and its platform covers the right court; pulled to the left it reads −5 and covers the LEFT one: the count from above reaches the same number. Evidence from the world's log | terrace 1–2: « الساحتان التوأمان » |
| 🔢 `adad-al-hulul` « حلول x² = a » | Say how many numbers have a given square — two when a > 0 (√a and −√a), one when a = 0, none when a < 0 — and write them, also when a is not a perfect square | **A hunt for ALL of them, in the world**: the twin lift takes off only when EVERY rod that rides has been lowered (both courts covered). Then a builder's slab orders « منصّة مساحتها −9 »: whatever rod he pulls, either way, the counted area is positive — the world closes the slab as « لا مقياس يبنيها »; and a slab « 0 »: one rod only. The tablet names « معادلة » and « حلّ » | terrace 3, then the hall |
| 🧮 `azl-al-murabba` « اعزل المربّع » | Bring an equation to the shape x² = a before solving: 3x² = 75, x² − 6 = 0, x² + 4 = 0, and a rectangle whose width is a fraction of its length | **A procedure he undoes step by step** (new experiment kind `peel`): a plaque is written for SEVERAL equal courts, or for a court with tiles added or missing; he peels one operation at a time (share between the courts, give back the tiles) until ONE court and its area stand alone — then the two rods | the dial-maker's bench, 2D |

The number of solutions by the SIGN of a is the practice ladder and the final mission; the rectangle problems of the
bank's level 5 (a width that is two thirds of the length) are the final mission's model, on the platform's own numbers.

**World work** (main session): twin courts round one post, a ruler with negative marks, a platform built to the left,
the lift that waits for every rod that rides, a builder's slab that orders an area. **Kit work** (agent): the kind `peel`.

**Said at the design stop:** the brief says NO exercise of this lesson's bank tests its third and fourth learning points
(writing x² = (√a)², equations that reduce to x² = a) although the bank's sheets do ask both in other words; the sitting
proves them only as far as the bank's own tagging lets it.

**State when the owner asked to stop after lesson 2 (2026-11-21):** nothing of lesson 3 is built except the experiment
kind `peel`, written as NEW files that nothing imports yet and that are NOT committed (`rootCourts/peel.js`,
`InquiryPeel.jsx`, `peel.css`, their two tests; the walk player `e2e/lib/lessonWalk/worlds/rootCourtsPeel.mjs`; 34 unit
tests pass; never seen in a browser). To wire it: one import and `peel: Peel` in `rootCourts/Inquiry.jsx › KINDS`, one
import and `peel: peelExperiment` in `e2e/lib/lessonWalk/experiments.mjs`; its spec is the complete Arabic example at
the top of `inquiryPeel.render.test.jsx`. Until then `check:unused` and `check:unreached` flag those files.
