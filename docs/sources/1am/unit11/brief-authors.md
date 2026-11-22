# 1AM unit 11 « السطوح المستوية : الأطوال، المحيطات، المساحات » — authors' brief (lesson `masahat-muhit-sath`, 2026-10-15)

Cycle moyen rollout, phase 3 — same organisation as `docs/sources/1am/unit2/brief-authors.md` and `unit4/brief-authors.md` (read their tables
of file ownership and their two author sections: they apply here with the names below). The lead writes the lesson
(`apps/web/src/lessons/moyen/1am/handasa/sutuh-masahat-muhitat/masahat-muhit-sath/`) and the extraction
(`docs/sources/1am/unit11/extraction.json`, built by `build-extraction.py`; the unit is seeded: `sutuh-masahat-muhitat/_unit/`).

| Author | Owns | Never touches |
|---|---|---|
| **Lab** | `manipulations/surface/TileYard.jsx` (+ any sub-components in that folder), `manipulations/logic/tileYard.js` (+ `.test.js`), `manipulations/surface/tileYard.render.test.jsx`, `packages/core/arithmetic/surfaces.js` (+ test, exact pure maths: perimeter / area of a union of cells, connectivity, holes, canonical shape, floor tilings; imported BY PATH), the `tile-yard` entries of `manipulations/levels.js` and `manipulationRegistry.js`, the `tileYard` namespace of `i18n/locales/ar/lesson.manipulation.json`, its section in `MANIPULATION_CONTRACT.md` (next free § number, after `ruler-compare` §2quatervicies) and its row in `MANIPULATION_DNA.md` §15 | the lesson folder, `content/practice/**`, the extraction |
| **Bank** | `content/practice/1am/masahat-muhit-sath/**`, the lesson's entries in `content/practice/{active,exam-style,policy,misconceptions}.json`, `scripts/practice-oracle/masahat-muhit-sath.mjs` and its import in `scripts/practice-answer-oracle.test.mjs` | the lesson folder, the lab, the extraction |

Already done by the lead (do not redo): the type `'tile-yard'` is declared in `packages/core/curriculum/manipulationTypes.js` (its `shows`
line is hidden until discovery) and the drawn world `courtyard` is in `VISUAL_THEMES` (`packages/core/curriculum/manipulationLevels.js`).
Until the lab author adds the registry entry and the levels preset, `manipulationRegistry.test.js` (« missing: tile-yard ») and
`levels.test.js` fail — expected, it is the lab author's first commit. Geometry figures in lessons and practice are `GeoFigure` data /
inline SVG (never raster); look at `lessons/common/components/GeoFigure*.jsx` and a 4AM geometry bank for the shapes the bank may use
(the bank author reads how `statement.figure` kinds work, `EXERCISE_CONTRACT.md` § « Statement figures »; a `grid` / `polygons` figure
is what a squared-paper figure needs — check `GeoFigure` in the 4AM unit 11 lessons `ashia-maalam`, `grid` + `polygons`).

**Lab author must meet MANIPULATION_DNA §17 incl. §17.7, §17.9, §17.11 (LabCoach) and review screenshots at 768×1024, 1024×768, 1280×800,
1366×768, 1920×1080 of initial and mid-activity states** (a refused drop, a kept yard, the walk around the fence, the formal phase, the
floor world with halves, with the double tile). Tablet and laptop only (owner, 2026-10-15): NO phone work (320–430 px).

## The lesson in one paragraph

« مساحة سطح مستو ومحيطه » (1AM, textbook pp. 149 (نشاط 1), 151, 152 (طريقة 1), 155 ex 1–6, 157 أقوّم 1–2, 158 أتعمّق 2, p. 148 prep 1–3).
Programme items `1am.m2.r06` « تعيين مساحة سطح مستوٍ باستعمال رصف بسيط » and `1am.m2.r07` « مقارنة مساحات في وضعيات بسيطة ». The idea
the student must DISCOVER: **the area of a surface is HOW MANY unit areas (tiles) cover it; its perimeter is the LENGTH of its boundary (how
many unit lengths of fence run round it). Moving the tiles around changes the perimeter but not the area (same tiles); a fixed length of
fence can enclose different numbers of tiles. So two surfaces can have the same area without the same perimeter and the same perimeter
without the same area — and the number that measures an area depends on the unit chosen (21 single tiles = 10,5 double tiles; two
slanted halves make one tile).**

Boundary of the unit (written once, `build-extraction.py` header): this lesson does NOT give the units mm² … km² and their conversions
(`wahdat-tul-masaha`), nor `P = 2(a+b)` / `A = a × b` (`mustatil-murabba-masaha`), nor the area of a right triangle, nor π. A rectangle's
area is counted by tiles (rows of tiles), its perimeter by adding its sides' lengths; the formulas come later.

Final الكفاءات (`1am_masahat-muhit-sath_P<n>`, order kept; changes vs the drafts listed by the lead in the progress log):

1. **P1** التمييز بين محيط سطح (طول حدّه، يُعدّ بوحدات الطول على حدّه) ومساحته (الحيّز الذي يشغله، يُعدّ بوحدات المساحة التي تغطّيه)
2. **P2** تعيين مساحة سطح مستو برصفه بوحدة مساحة (مربعات، أنصاف مربعات) والتعبير عن المساحة نفسها بوحدتين مختلفتين بينهما علاقة (إحداهما ضعف الأخرى)
3. **P3** مقارنة مساحات ومحيطات سطوح: سطحان لهما نفس المساحة دون نفس المحيط، وسطحان لهما نفس المحيط دون نفس المساحة

No `noRebuildForLesson` entry, no review link (the net has no edge into `1am.m2.r06` / `r07`); « أستعدّ » measures the primary-school
prerequisites (measuring a length with a unit, naming a polygon and its sides, counting unit squares).

Modules (lead; ≤ 90 min whole): 0 أستعدّ · 1 نشاط « حوش الزليج » (the lab, `world: 'yard'`, both levels, then « أتوقّع القاعدة ») ·
2 معارف (names + the three statements, the honeycomb card) · 3 طريقة « أعيّن المساحة برصف » (the lab again, `world: 'floor'`, standalone) ·
4 أتمرّن (act-1 as an application, ex-1…6, self-2) · 5–7 three مسائل (the second built on deep-2) · 8 إختبار أولي (self-1 and three more).

## Lab author — `tile-yard` (« حوش البلاط »)

Read first: `docs/architecture/MANIPULATION_DNA.md` (all — §12 « not another lab », §16.3 and §17 above all), `MANIPULATION_CONTRACT.md` §1, §2,
§4.2, §6bis (« جرّب كل الإمكانيات »: this type is NOT eligible — each placement IS an answer; say so in the header), §6ter, §7, §7bis-levels,
§7ter (the ten steps), §8, §8bis, §8ter, §8quater (LabCoach — mandatory, `coachOf` pure and tested by following it to the end of every task),
§9; `LAB_COACH_ROLLOUT.md`. Idiom references (read the code): `operations/RulerCompare.jsx` + `logic/rulerCompare.js` and
`operations/DecimalComma.jsx` (shell, stage, `useLessonViewport` budget, `state.report`, `ManipulationDiscovery`, `LabFold`, LabCoach wiring,
always-open « جرّب أعدادك » when it makes sense), `useDragInteraction` for the carry gesture (see `divisibility/TeamBuilder.jsx` or
`systems/StoryModeller.jsx`: drag, tap-tap, keyboard), `primitives/LabKit.jsx`, `SvgPill.jsx`, **`primitives/KidFigure.jsx` (girls ALWAYS in
hijab + tunic, guide §6)**. Exact arithmetic ONLY through `packages/core/arithmetic/surfaces.js` (you write it: integers and exact halves,
never floats for a verdict), imported BY PATH — never the core barrel (`BUNDLE_BOUNDARIES.md` §4 rule 9). All strings in
`lesson.manipulation.json › tileYard` (read as `t('manipulation.tileYard.…')` with `useTranslation('lesson')`), never in the component, never
in `lesson.json`; counted nouns (« بلاطة / بلاطات », « عصا / عصي ») through plural keys `_zero … _other`; numbers as LTR islands.

**Why this is not another lab (DNA §12).** 1AM: `story-bars` stretches an unknown height; `division-jumps` stretches the number of groups;
`digit-cards` colours table cells; `rank-exchange` ties tens; `fraction-knife` holds a knife (the number of equal pieces of ONE area);
`decimal-comma` holds a comma; `ruler-compare` holds a ruler's graduation; `fair-share` holds one child's share. 4AM `square-tiling` stretches k,
the number of tiles per side of a square of area n (roots). Here the hand holds ONE TILE (a unit area) and CARRIES it: an area is built of tiles
and a perimeter is the number of fence posts' spans round the tiles — two measures that are both READ, never typed, and that the same gesture
moves independently. The resistance is geometric: a tile that would break the yard in two, touch only by a corner, close a hollow, or burst the
rope is refused.

**Props contract (fixed — the lesson is written against it):**

```jsx
<Manipulation type="tile-yard"
  world="yard" | "floor"               // from the level preset; a lesson may force it
  mode="fence" | "rope"                // world=yard only: fence = n tiles that are only MOVED; rope = a fixed fence length, tiles free
  tasks={['terrace-halves','terrace-double']}   // world=floor only: the scenes, in order (default: both)
  level, levels, title, lead           // as every type (levels={false} for the standalone floor of module 3)
  onTrial={(e) => …}                   // each VALIDATED gesture, via state.report (see « Events »)
  onFinished={({ world, mode }) => …}  // the formal phase
/>
```

`levels.js`: `'tile-yard': { beginner: { numbers: { world: 'yard', mode: 'fence' }, ...P }, advanced: { numbers: { world: 'yard', mode: 'rope' },
...T('act-1') } }` (the `floor` world is used alone in module 3: the lesson passes `world="floor"`, `levels={false}`, its own `tasks`).
Theme `courtyard` for both levels (the lab is drawn with its own SVG: a stone-paved courtyard seen from above with perspective-free flat
tiles, zellige tiles with an eight-pointed star in two or three colours, wooden fence posts with round caps and rails; the kit around it as
every lab).

**The mathematics (`packages/core/arithmetic/surfaces.js`, pure, exact).** A yard is a set of grid cells (r, c). `area` = number of cells.
`perimeter` = number of cell sides with a cell on one side only (4-neighbourhood) — the unit of length is the side of a cell. A yard is
VALID iff it is 4-connected AND has no hollow (no empty cell unreachable from outside by 4-moves through empty cells). Removing a tile is
legal iff the rest stays valid; dropping a tile is legal on an empty cell sharing a full side with the yard iff the result is valid. `shape`
= a canonical string of the cells normalised by translation AND rotation/reflection (the notebook never stores two congruent yards).
Known values to test: 12 tiles ⇒ perimeter 14 only for the 3×4 rectangle (the minimum), 16 for the 2×6 rectangle and many other shapes,
26 for any tree-like shape (the maximum 2n + 2); perimeter is always EVEN; for a fixed perimeter p the area ranges from p/2 − 1 (a straight
line) to ⌊(p/4)²⌋ (the most compact: p = 12 ⇒ 5…9 tiles, every value in between possible). Floor tilings: a floor is a set of WHOLE cells plus
HALF cells (a cell cut along one of its diagonals); area in unit ① = whole + halves / 2 (exact, in halves); a double tile (unit ②, two cells
side by side, horizontal or vertical) has area 2 in unit ①; a floor of 21 whole cells measures 10,5 in unit ② (10 doubles and one half
double); area in unit ② = area in unit ① / 2, for ANY pairing the student chooses (assert it by test over several pairings).

**World `yard`, level مبتدئ — `mode: 'fence'`** (platform context: a grandfather's courtyard paved with zellige tiles; the value is
helping / generosity to the neighbours — a free line of context, one or two plain sentences). 12 identical tiles on a 10 × 7 grid
(the cell is sized from `useLessonViewport`), starting as the 2 × 6 rectangle (area 12, fence 16). The fence is drawn as posts and rails
around the yard (1 rail span = 1 stick, « عصا »); two live meters ALWAYS side by side, never merged: « البلاطات » (the area) with a stack of
tile icons, and « السياج » (the perimeter) with a measuring-stick icon. The hand: pick up a tile (pointer, or arrows + Enter), the ghost of the
yard with the fence it WOULD have is drawn under the pointer, legal drop cells glow softly, drop. A refused move returns the tile with a wobble and
a short Arabic reason from i18n (`detached` « البلاطة تلمس البلاطات بزاوية فقط »؛ `splits` « إن رفعتها انفصل الحوش إلى قطعتين »؛ `hole` « سيبقى
ثقب داخل الحوش »). **« أمشِ حول السياج »**: a button starts a walk — a KidFigure (a girl in hijab, the gardener) walks along the fence, a
counter ticks one per stick, the sticks she has passed light up; this is the PERIMETER made physical (a length walked, versus the area under
her feet). **« أحتفظ بهذا الحوش »** stamps the current yard (a mini drawing with its two numbers) into a « دفتر الأحواش » (never two
congruent yards; the stamp refuses a duplicate with a note). Task 1 (the direct question, DNA §17.9: context, then ONE question naming the
goal and end state): « أعد ترتيب البلاطات الاثنتي عشرة حتى يصير السياج أقصر ما يمكن » — completed when a kept yard has fence 14 (the lab
never says 3 × 4 or 14); then Task 2: « والآن اصنع حوشًا سياجه 20 عصا بالضبط » (any shape; kept). The tile count never changes in this
mode (the meter shows it unchanged: the whole point). `discoveryReady` = ≥ 3 kept yards with ≥ 3 DISTINCT fence lengths, including the
shortest (14). Free « جرّب » panel: always open means nothing to type here — skip it (say so in the header).

**World `yard`, level متقدم — `mode: 'rope'`** (same courtyard, the fence is now a ROLL OF ROPE of 12 sticks drawn as a coil on the side whose
unwound part is the fence in use: « استعملتَ 8 من 12 »). A heap of tiles beside the grid: drag a tile from the heap onto the grid (the first
tile lands anywhere), drag a tile back to the heap to remove it. A drop whose fence would exceed the rope is REFUSED (`rope`: « الحبل لا
يكفي: السياج صار 14 »). A yard may be KEPT only when its fence uses the WHOLE rope (exactly 12): the button says how many sticks are left
otherwise. Task 1: « عندك حبل طوله 12 عصا يلزم أن يُستعمل كله: اصنع حوشًا بأكبر عدد من البلاطات » (completed at 9 kept); Task 2:
« والآن بأقلّ عدد من البلاطات » (completed at 5 kept). `discoveryReady` = ≥ 3 kept yards with ≥ 3 DISTINCT tile counts, including 9 and 5.

**Discovery** (`ManipulationDiscovery`, the conjectures refuted with the student's OWN kept yards and meters; the rule is never visible before
it: no `shows` line, no lead that states it, no option carrying evidence — DNA §9):
- مبتدئ — « ماذا بقي ثابتًا كلّما أعدتَ ترتيب البلاطات ؟ » — right « عدد البلاطات بقي نفسه بينما تغيّر طول السياج » ; wrong « طول السياج
  لا يتغيّر ما دمنا لا نضيف بلاطات » (refuted by the student's fences) and « كلّما قصر السياج نقص عدد البلاطات » (refuted by the unchanged count).
- متقدم — « بحبل واحد طوله 12 عصا: هل يتعيّن عدد البلاطات ؟ » — right « لا: بالحبل نفسه حصلتُ على أحواش بعدد بلاطات مختلف » ; wrong
  « نعم: السياج نفسه يعطي دائمًا الحوش نفسه » and « الحوش الأطول شكلًا فيه بلاطات أكثر » (refuted by the 9-tile square block and the 5-tile line).
- **Formal** (the platform names it only here): « مساحة السطح: عدد وحدات المساحة التي تغطّيه (البلاطات) » and « محيطه: طول حدّه (عدد وحدات
  الطول على السياج) » with the student's own kept pairs; the three sentences « نفس المساحة دون نفس المحيط / نفس المحيط دون نفس المساحة /
  نفس المساحة ونفس المحيط » each illustrated by two of the student's own stamps when they exist.

**World `floor`** (module 3, `levels={false}`; context: a terrace being tiled — the value is care of a shared place). A floor figure drawn
on cells, tiles to lay by the hand. Gesture: pick a tile from the box (one tile = unit ①, a triangular half tile, a double tile = unit ②
that can be turned) and drop it on the floor (pointer, tap-tap, keyboard); a drag across free cells may lay a row of single tiles (the
repeated gesture; `autoComplete` NOT used — the count is the answer). A tile that overlaps, crosses the floor's edge or does not fit a half
cell is refused (`overlap`, `outside`, `unit`). The reading « مساحة الأرضية = … وحدة ① » updates live (whole tiles + halves as 0,5) and the
formal phrase appears only when the floor is fully covered.
- Scene `terrace-halves` (unit ① only): a floor of 14 whole cells plus 4 half cells along a slanted edge — area 16 unit ①: the student
  covers the whole cells, then fits half tiles into the cut cells (two halves = one whole), and reads 16.
- Scene `terrace-double` (the two units): a floor of 21 whole cells (an irregular staircase; NOT a rectangle) — the student first covers it with single tiles
  (reads 21 unit ①), then the double tile is offered: lay doubles; the last single cell gets a HALF double (a double tile cut across);
  the reading is « 10 بلاطات مزدوجة ونصف » = 10,5 unit ② (any pairing of the cells gives the same reading: a pairing that leaves three
  singles reads 9 doubles and 3 halves = 10,5 — drawn, not told). Then a one-line sentence: the same floor, two numbers, because the units differ
  (the unit ② is twice the unit ①).
- `onFinished` when both scenes are read.

**Events (`state.report`, fixed — the lesson reads them):**
- yard: `{ kind: 'move', world: 'yard', mode, tiles, fence, prevFence }` (an accepted move of a tile; in `rope` mode also
  `kind: 'add'` / `'remove'` with the same fields) · `{ kind: 'refused', reason: 'detached' | 'splits' | 'hole' | 'rope' }` ·
  `{ kind: 'walk', tiles, fence }` (a walk completed) · `{ kind: 'keep', mode, tiles, fence, shape }` (each NEW kept yard) ·
  `{ kind: 'task', task: 'shortest' | 'twenty' | 'biggest' | 'smallest' }` (a task completed).
- floor: `{ kind: 'lay', scene, unit: 'one' | 'half' | 'two', area }` (area in unit ① as a string, decimal comma: `'16'`, `'10,5'` for unit ② scenes
  carries `areaTwo`) · `{ kind: 'refused', scene, reason: 'overlap' | 'outside' | 'unit' }` · `{ kind: 'read', scene, unit: 'one' | 'two', value }`
  (the student confirmed the reading, `value` as a string: `'16'`, `'21'`, `'10,5'`).

**Must:** the design sheet (DNA §7) and the contract's five questions in the header; one screen at every size above (the grid cell and the
meters budgeted from `useLessonViewport`; the notebook and secondary lists in `LabFold`); `[data-ty-glance]` wraps the grid + its meters +
its controls; Arabic everywhere (aria-labels too), numbers LTR with the decimal comma; reduced motion; hints (3, progressive, never the
answer); « إعادة » clears the trial memory; every gesture has a tap and a keyboard path, controls ≥ 44 px; `state.report` for every lesson
callback. DOM contract: `[data-tile-yard][data-world][data-mode][data-task]`, `[data-ty-glance]`, `[data-ty-tile=<r>-<c>]`,
`[data-ty-area]` (the number), `[data-ty-fence]` (the number), `[data-ty-walk]`, `[data-ty-keep]`, `[data-ty-notebook] [data-ty-stamp]`,
`[data-ty-refused=<reason>]`, `[data-ty-rope][data-used]`, `[data-ty-floor][data-scene]`, `[data-ty-reading]`, `[data-ty-verdict]`.

**Tests:** `surfaces.test.js` + `logic/tileYard.test.js` — the known values above (the 12-tile minimum 14 is reached only by 3 × 4; every
perimeter of a 12-tile yard is even and in 14…26; for a rope of 12 the reachable areas are exactly 5…9; removal / drop legality incl. the
three refusals; canonical shape equality under rotation / reflection; `discoveryReady`; the floor readings 16, 21, 10,5 and the pairing
invariance; reset), a `coachOf` walk-through to the end of each task. `surface/tileYard.render.test.jsx` — both levels and the floor
render (`renderToString` inside the i18n test setup used by the other render tests), no `{{` left, no Latin prose. Then
`npx vitest run src/lessons/common/manipulations` (incl. `levels.test.js`, `manipulationRegistry.test.js`) and `npx vitest run` in
`packages/core` for your arithmetic file must pass. Do NOT run `npm run build` (the lead runs it). Report: files, test results, the DOM contract
as built, the screenshots you reviewed and what you changed after them, anything you could not do.

## Bank author — `content/practice/1am/masahat-muhit-sath/`

Read first: `docs/architecture/EXERCISE_CONTRACT.md` § « Platform-generated practice exercises », « Answer-key integrity », « A practice
question may be served alone », « Présentation examen (BEM) » (Data, Term-exam provenance), « Earlier-year review link » (nothing to author),
§ « Statement figures » (grid / polygons figures); `docs/sources/moyen/exams/EXAM_PATTERN.md` (all, §6 is the recipe);
`docs/sources/4am/bem-practice/brief-authors.md` (the sheet format); a converted bank as the shape reference
(`content/practice/1am/muqaranat-adad-ashriya/` and its oracle `scripts/practice-oracle/muqaranat-adad-ashriya.mjs`, then a 4AM geometry bank
such as `content/practice/4am/khassiyat-talis/` for figures); `scripts/lib/examProvenance.mjs`.

- **50 exercises**, 10 per level, ids `ex-1am-masahat-muhit-sath-l<N>-<NNN>`, every exercise with `metadata.exam` (exam sheet). Levels follow
  EXAM_PATTERN §6 (L1 one direct skill 2–3 ن ; L2 compute then « علّل / برّر » ; L3 a complete 3–4-question exercise ; L4 an exercise that also
  mobilises another lesson of the SAME term — such steps `counted: false` ; L5 « الوضعية الإدماجية (08 ن) » in two parts ending on a justified
  decision).
- **Provenance:** term-exam corpus `docs/sources/moyen/exams/exams-index.json` (read the PDFs under `docs/Exames-1 AM to 3AM/1am/`;
  `pdftotext -layout`, or `pdftoppm -r 110` for scans). **No corpus exercise is tagged `1am.m2.r06` / `r07`** (the BEM-style papers examine the
  rectangle formulas, `r08`): the register to model is the PERIMETER-AS-BOUNDARY and fence-cost situations — `1am-s1-96` ex 5 (a field's
  perimeter, an entrance subtracted, cost of fencing), `1am-s2-70` ex 4 (fence length after the entrance, its cost), `1am-s2-64` ex 5,
  `1am-s2-62` ex 4, `1am-s2-77` ex 5, `1am-s2-78` ex 4, `1am-s2-80` ex 5 and `1am-s3-39` ex 5 for the land-and-fence storyline — keeping the
  structure and register but ONLY with this lesson's concepts: a surface's area is a NUMBER OF TILES counted on a grid (or given), a perimeter is
  a sum of side lengths / a count of unit lengths along the boundary; the formulas `P = 2(a+b)` and `A = a × b` are the NEXT lesson's — a
  rectangle's area may be counted by rows of tiles (« 3 صفوف في كل صفّ 7 بلاطات »), never by a rule. About half of levels 3–5 modelled on ONE
  precise corpus exercise (`metadata.source = {type:"term_exam", grade:"1am", semester, file, exercise}`, kind `modelled`, badge « على منوال
  اختبار الفصل الأول / الثاني »): keep its structure and register, CHANGE numbers and context, never copy word for word. The rest:
  `{type:"platform_addition", reason:"term_exam_modelled", modelledOn:"1am-s1"|"1am-s2"}` with the badge. A few may be `adapted` from a textbook
  element (badge `null`, `source: {type:"textbook", elementId, page, …}`) — ONLY elements whose destination is `masahat-muhit-sath` in the
  extraction: `prep`, `act-1`, `know-1`, `method-1`, `ex-1` … `ex-6`, `self-1`, `self-2`, `deep-2`, `opener`. Citing any other element breaks
  `check:textbook`. Figures are DRAWN with the platform's own numbers (the book's grids are reference only; independence from the book:
  never « الكتاب ص … », never copy a box or an exercise word for word).
- **What is assessed:** P1 (perimeter vs area: which quantity answers « كم بلاطة؟ » and which « كم متر سياج؟ », a figure's perimeter counted along a
  grid or summed from lengths; fence cost with an entrance subtracted), P2 (area by counting whole tiles, half tiles, and expressing one area in
  two units where one is double the other: 18 unit ① = 9 unit ②, 21 = 10,5), P3 (compare two surfaces on a grid: same area / different perimeter, same
  perimeter / different area, same both; build or choose the pair that fits a description; the claim « la plus longue clôture = la plus grande
  surface » refuted). Each LP primary on ≥ 8 questions; ≥ 12 questions with a grid figure.
- `answerType`: `choice` (every distractor FALSE and tagged `misconceptionId`), `rational` (a number; decimal comma accepted), `selfCheck` for
  « برّر » steps. New misconception ids `MISC-MASAHA-*` in `content/practice/misconceptions.json` (e.g. area and perimeter confused, longer
  perimeter taken for bigger area, equal area taken for equal perimeter, half cells ignored, the larger unit's count taken for the larger area,
  boundary counted by cells not by sides).
- Every question: `step`, `timeSeconds`, `solution.lines` (« التصحيح النموذجي » style), hints that never contain the answer, `feedback.correct`
  as a one-line explanation, `learningPoints` with exactly one primary of THIS lesson, standing alone (daily challenge).
- **Values in story contexts** (LESSON_DEVELOPMENT_GUIDE §5): each story woven with a good value (التعاون، الصدق، العناية بالمكان المشترك…), short;
  rewrite the corpus' cultural contexts, never copy them. Amounts « دج » in Arabic text (never « DA » inside Arabic), units `$…\,\mathrm{cm}$`
  inside math islands when glued to a number.
- **Oracle:** `scripts/practice-oracle/masahat-muhit-sath.mjs` recomputes EVERY constructed answer and every choice key FROM THE FIGURE DATA
  (cells → area and perimeter with its own exact integer code, not the lab's file), imported into `scripts/practice-answer-oracle.test.mjs` like
  the other lessons.
- **Wiring:** add the lesson to `content/practice/active.json`, `exam-style.json`, `policy.json` (`minPerLevel: 10`, source naming the textbook
  pages and the term-exam generation); regenerate whatever generated index the practice content uses (find its script).
- **Gates you run:** `node scripts/validate-exercises.mjs --strict`, the oracle test, `node scripts/check-textbook-coverage.mjs`,
  `npx vitest run scripts` (or the scripts test command in the root `package.json`). Do NOT run `npm run build`.
  Report: files, counts per level and per LP, the corpus exercises used (file + exercise), test results.
