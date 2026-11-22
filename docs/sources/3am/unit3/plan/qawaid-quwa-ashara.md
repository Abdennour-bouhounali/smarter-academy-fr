# Plan — `qawaid-quwa-ashara` « قواعد الحساب على قوى العدد 10 » (3AM unit 3, entry 2 of 4)

Read the unit README first (boundaries, `tenPowers.js`, the published `quwat-adad-nisbi` overlap rules). Generated AFTER `quwa-adad-ashara`.

## 1. Identity

- Code `qawaid-quwa-ashara`, title « قواعد الحساب على قوى العدد 10 », unit `quwa-nisbiya`, catalogue order 11, kind `lesson`.
- Folder `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/quwa-nisbiya/qawaid-quwa-ashara/`.
- Textbook: activity 4 p. 41 (`act-4`: 10³ × 10⁴ as factors; 10⁹/10⁵; (10³)⁵; a pupil's notebook corrected in red — 10⁵ × 10³ = 10¹⁵ ✗,
  10⁻⁵ × 10² = 10⁷ ✗, 10⁵/10⁻² = 10³ ✗, (10³)⁴ = 10⁷ ✗; conjecture of the three rules), معارف 3 p. 42 (`know-3`), طريقة p. 43 (`method-43c`,
  A … I), دوري الآن p. 43 (`now-43`: P … U, k × 10ᵖ computations), exercises `ex-14` … `ex-20` pp. 46–47, `ex-50`, `ex-55`, `ex-56` p. 50,
  أؤكّد `self-4` … `self-10` p. 49. All `verified: False`: re-read pp. 41, 42, 43, 46, 47, 49, 50 at 220 dpi (ex-14 and ex-16 have scan doubts).
- Does not seed. Moves its pending destinations.

## 2. Programme & net

- Item: `3am.m3.r02` « معرفة واستعمال قواعد الحساب على قوى العدد 10. »

| LP | Draft | Final (proposed) | Why |
|---|---|---|---|
| P1 | استعمال القاعدة $10^m\times 10^n=10^{m+n}$ | استعمال القاعدة $10^m\times10^n=10^{m+n}$ من أجل $m$ و $n$ عددين صحيحين نسبيين | precise the domain (negative exponents are in every example) |
| P2 | استعمال القاعدة $\frac{10^m}{10^n}=10^{m-n}$ | unchanged (+ « من أجل $m$ و $n$ صحيحين نسبيين ») | — |
| P3 | استعمال القاعدة $(10^m)^n=10^{m\times n}$ | unchanged (same domain note) | — |
| P4 | تبسيط عبارات تتضمن قوى العدد 10 وكتابتها على شكل قوة واحدة | تبسيط عبارة تتضمّن قوى العدد 10 وكتابتها على شكل قوة واحدة، وحساب جداء أو حاصل قسمة أعداد مكتوبة على الشكل $a\times10^p$ (مثل $7\times10^3\times3\times10^9=21\times10^{12}$) | now-43 (P … U) is in this lesson's pages; without this LP it is untaught. The result is NOT normalised (scientific writing = next lesson) |

- Review items for « أستعدّ »: `3am.m3.r01` « تعيين القوة من الرتبة $n$ للعدد 10. » — home `quwa-adad-ashara` (generated just before: its
  الكفاءات are final). Platform diagnostic: conversion of units (1AM/2AM, not a net link).
- noRebuild: none.
- pointPrerequisites: intra P2 ← P1, P3 ← P1, P4 ← P1 P2 P3; cross-lesson along `3am.m3.r01 → 3am.m3.r02`: **P1 ← `3am_quwa-adad-ashara_P1`**,
  **P2 ← `3am_quwa-adad-ashara_P2`** (10⁻ⁿ needed for negative exponents). Both sibling LPs are final once entry 1 is published.
- Where it leads: `3am.m3.r07` (rules for any base, `quwat-adad-nisbi`, published — its « تذكّر » box `RECALL_TEN` states 10³ × 10⁴ = 10⁷,
  10⁶/10² = 10⁴, (10²)³ = 10⁶: these must stay TRUE statements of this lesson's rules); through the recommended net edit, `3am.m3.r04`
  (scientific writing of computation results). 4AM: no direct link (BEM « الكتابة العلمية للعدد B » computations use it via r04).

## 3. Boundary

Owns: the three rules on 10 for relative exponents; reducing a chain to one power; a × 10ᵖ computations with a NOT-normalised result
(« 21 × 10¹² », « 30 × 10⁻³ », « 0,4 × 10⁵ » accepted; when the sheet wants a single number it asks for the decimal). Conversions of
length / area / volume units as products / quotients / powers of powers of 10. Does NOT: say « الكتابة العلمية », normalise, bracket, give an
order of magnitude; use a base other than 10 (aⁿ is `quwat-adad-nisbi`); re-teach the decimal writing of 10ⁿ (recalled in « أستعدّ »).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| act-4 1)–3) p. 41 | complete 10³ × 10⁴ = 10 × … (7 factors); 10⁹/10⁵ = 10⁹ × 1/… ; (10³)⁵ = … (15 factors) | count factors | REJECTED as entry (it is « write the factors » — the published train already made that the experience); the count survives as the JUSTIFICATION line of each brick |
| act-4 notebook p. 41 | explain the red corrections, conjecture the rules | the four typical errors | M2 « دفتر رياض » (own lines, same four error TYPES) — a strong judge-and-fix track |
| know-3 p. 42 | the three rules, examples 10³ × 10⁵, 10⁴ × 10⁻⁶, 10⁷/10², 10⁵/10⁻², (10³)², (10⁻³)² | — | معارف box rewritten with OWN examples (below) |
| method-43c p. 43 | A … I: sums, differences, products of exponents | the three gestures on exponents | طريقة, own numbers |
| now-43 p. 43 | P … U: k × 10ᵖ × k' × 10ᵠ, quotients | regroup numbers and powers | طريقة method 2 + أتمرّن « a × 10ᵖ » batch (results NOT normalised here) |
| ex-14, ex-15 | mental single power; big quotients A, B | chains | أتمرّن « قوة واحدة » + M8 E4 |
| ex-16 | decimal of 10⁻¹³ × (10¹⁵ + 10⁻¹³) | distributing — scan doubt | bank (adapted) only after a 220-dpi re-read |
| ex-17 | which expressions equal 10⁻⁶ | equal writings | أتمرّن « أيّها يساوي $10^{-4}$ » (own) |
| ex-18 | calculator screen expression with a | a × 10⁰ = a | bank adapted |
| ex-19 | multiplicative magic squares of powers | sums of exponents per line | bank L5 adapted (own square) |
| ex-20 | T/F: half of 10²⁰¹⁸ is 10¹⁰⁰⁹; 10² + 10³ = 10⁵ … | the sum/half traps | أتمرّن T/F (own) |
| ex-50 | 10 000² × 100⁵ / 0,01³ | decimal → powers first | أتمرّن numeric (own: 1000² × 100³ / 0,01² = 10¹⁶) |
| ex-55, ex-56 | calculation programmes × 10⁷ × 10⁻³ ÷ 10² | a chain = one multiplication | مسألة 3 (own programme) |
| self-4 … self-10 | 10³ × 10² ; 10³ × 10⁻³ ; (10³)² ; 10² ± 10⁻² ; (10⁻¹ + 10¹)/10 ; 10¹⁷ ÷ 10²⁰ | — | إختبار أولي inspiration; self-7 misprint (no correct option) noted |

## 5. Design

**The lesson in one paragraph.** With powers of ten, an exponent is a NUMBER OF RANKS: multiplying by 10ⁿ moves a quantity n ranks.
Two moves one after the other add up (10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ); « how many small units in a big one » is the GAP between their two ranks, so a
quotient subtracts exponents — and the gap from 10⁻² up to 10³ is 3 − (−2) = 5, not 1 (10³/10⁻² = 10⁵); squaring or cubing a unit makes
every rank count twice or three times (1 km² = (10³ m)² = 10⁶ m²), so a power of a power multiplies exponents. Exponents are never multiplied
in a product, never added in a sum (10² + 10³ = 1 100, not 10⁵), and half of 10¹⁰ is 5 × 10⁹, not 10⁵.

**Entry point.** Book activity 4 (complete the factors) vs platform situation « the conversion ruler of the technology class »: a brass
ruler of columns (one column = one rank = ×10) with unit plaques (km … mm … µm, nm); to answer « how many mm in 1 km? », « how many cm in
1 km? », « how many m² in 1 km²? » the student STRETCHES a band from one unit plaque to the other and counts the columns. Two hops chained
force the sum; a band between two plaques on both sides of the metre forces « 3 − (−2) »; the area and volume tables (2 and 3 columns per
unit — the conversion tables the student knows) force the product of exponents. Chosen: the ruler — it is the platform's own reading of the
three rules, meaningful for 10 only, and distinct from the published train (no factor-by-factor build, no cancellation).

**Order of ideas.** (M1) chained hops: sum → gap across the metre: difference (with a negative exponent) → area / volume: product ·
(M2) the notebook of a classmate judged line by line → the three rules named · (M3) one single power from a chain; k × 10ᵖ computations ·
(M4) practice · (M5–M7) problems · (M8) test.

**Story contexts.** The technology class conversion ruler; phone storage (Ko, Mo, Go, To — each ×10³); the house's rooftop water tank
(1 m³ = 10³ L) and a farm in hectares (1 ha = 10⁴ m²); a calculation programme posted by the maths club.

## 6. Lab — `unit-ladder` « مسطرة التحويل »

- **Type** `unit-ladder` (free); `manipulations/operations/UnitLadder.jsx` on `logic/unitLadder.js`; theme `tech-bench` (new: kind `objects`,
  shows « مسطرة تحويل ولوحات وحدات »); strings `lesson.manipulation.json › unitLadder`.
- **Drawn world.** The technology-class bench: a long brass ruler engraved with COLUMNS (equal width, LTR island, bigger units on the LEFT like
  the place-value table); enamel unit plaques hang above their column(s): length km · hm · dam · m · dm · cm · mm · (two blank columns) · µm ·
  (two blank) · nm; each plaque carries its value in metres in small type (« 1 km = $10^3$ م », « 1 cm = $10^{-2}$ م ») — known from L1. A
  MODE dial on the bench: « طول » (1 column per unit), « مساحة » (km² … mm²: every plaque now spans 2 columns — the ruler visibly re-tiles), « حجم »
  (m³ · dm³ (= لتر) · cm³ · mm³: 3 columns per plaque). A red measuring BAND (elastic tape) with two round handles (≥ 44 px). A boy `KidFigure`
  (« أنيس ») at the bench reacts (`wonder` while stretching, `proud` on success).
- **The variable in the hand: the band's signed length in columns** k (= the exponent of the conversion factor), set by dragging its free
  handle from the FROM plaque (handle 1, placed by the task) to a plaque; and, at متقدم, the MODE (columns per unit = the outer exponent n).
  Gesture family: **STRETCH a band between two marks** (drag; tap a plaque to send the handle there; keyboard ← → one column, Enter to
  validate, `role="slider"` with `aria-valuetext` « 5 أعمدة »).
- **What the world shows.** The band's column count (big readout « 5 أعمدة ») and, along the band, the factor in decimal (« × 100 000 »);
  in a two-hop task the first band stays drawn and the second starts at its end — the two counts sit side by side (« 3 » then « 3 ») and
  the total band (from first to last plaque) appears dashed with its own count. The handle only snaps to plaque BOUNDARIES (in area mode a
  band ending in the middle of a plaque is refused: « في جدول المساحة لكل وحدة عمودان: أنهِ الشريط عند حدّ لوحة »). Direction: toward a SMALLER
  unit the band is red and the count positive (more small units); toward a BIGGER unit it is blue and the count negative (« 1 mm² = 10⁻⁶ m² »).
  The written rule never appears before the formal phase.
- **Opening (no title).** Context: « في قسم التكنولوجيا مسطرة تحويل: بين كل عمودين متجاورين نضرب في 10. فوق الأعمدة لوحات الوحدات. »
  Question: « مدّ الشريط من لوحة البطاقة إلى اللوحة المطلوبة حتى تعرف كم وحدة صغيرة في الوحدة الكبيرة. »
- **مبتدئ** (mode « طول » fixed): T1 « كم ميليمترًا في 1 كم؟ » — two hops imposed (km → m, then m → mm): bands 3 and 3, total 6 → 1 000 000;
  prediction BEFORE (label « كم عمودًا بين كم و ملم؟ »): 6 / 9 / 3 · T2 « كم سنتيمترًا في 1 كم؟ » — one band cm ↔ km across the metre: 5 →
  100 000; prediction 5 / 1 / 6 · T3 « كم ميكرومترًا في 1 ملم؟ » → 3 → 1 000. End: three stamps.
- **متقدم** (mode chosen by the student; no factor written along the band until validation): T4 « كم م² في 1 كم²؟ » → mode مساحة, 6 →
  1 000 000 · T5 « كم سم³ في 1 م³؟ » → mode حجم, 6 → 1 000 000 · T6 « 1 ملم² كم م² هو؟ » → mode مساحة, band toward the bigger unit: −6 →
  0,000001 · T7 « كم لترًا في 1 م³؟ » → mode حجم, m³ → dm³ (لتر) = 3 → 1 000. A task done in the wrong mode is refused with the calculation
  (« في جدول الطول من كم إلى م 3 أعمدة، لكن 1 كم² مربّع ضلعه 1 كم: 1 000 × 1 000 م² »).
- **« جرّب أعدادك » (always open).** Choose a FROM unit, a TO unit and a mode (selects built from `UNIT_SCALE`, length km … nm, area km² …
  mm², volume m³ … mm³); it becomes a task; the student stretches. Limits: |k| ≤ 12.
- **LabCoach:** (1) task card « هذا هو السؤال: من أيّ وحدة إلى أيّ وحدة. » (2) the free handle « اسحب طرف الشريط إلى اللوحة المطلوبة. »
  (3) the readout « هنا عدد الأعمدة التي قطعها الشريط. » (4) prediction cards « اختر توقّعك قبل أن تمدّ الشريط. » (5) mode dial (متقدم)
  « اختر الجدول: طول أو مساحة أو حجم. » (6) free panel « ركّب سؤالك بوحدتين من اختيارك. »
- **Misconceptions made VISIBLE.** Multiplying exponents in a product (prediction 9 for 3 + 3); ignoring the sign of a negative exponent
  in a quotient (prediction 1 for cm ↔ km: the band visibly crosses the metre, 3 columns left of it and 2 right); adding exponents in a power
  of a power (5 for km² → m²: the area ruler shows 2 columns per plaque); « squaring the exponent » (9 for (10³)²); direction errors
  (1 mm² = 10⁶ m²: the band is blue, the count negative).
- **Discovery.** D1 « قطع الشريطان 3 أعمدة ثم 3 أعمدة. كم عمودًا من كم إلى ملم؟ » ✓ « 3 + 3 = 6: الأسّان يُجمعان » ✗ « 3 × 3 = 9 » (refuted by the
  dashed total band) ✗ « 3: الأكبر منهما ». D2 « 1 كم = $10^3$ م و 1 سم = $10^{-2}$ م: كم عمودًا بينهما؟ » ✓ « 3 − (−2) = 5 » ✗ « 3 − 2 = 1 »
  (refuted by the band) ✗ « 3 × (−2) = −6 ». D3 (متقدم) « في جدول المساحة لكل وحدة عمودان: من كم² إلى م²؟ » ✓ « 3 × 2 = 6 » ✗ « 3 + 2 = 5 »
  ✗ « $3^2 = 9$ ». `discoveryReady`: all tasks of the level stamped. Formal: 10³ × 10³ = 10⁶; 10³/10⁻² = 10⁵; (10³)² = 10⁶.
- **Events:** `{kind:'stretch', task, from, to, k}` · `{kind:'hop', task, i, k}` · `{kind:'predict', task, choice, ok}` ·
  `{kind:'mode', mode}` · `{kind:'refused', task, reason:'mid-plaque'|'mode'|'wrong-unit', k}` · `{kind:'solved', task, k, mode}` ·
  `{kind:'custom', from, to, mode}`. DOM: `[data-unit-ladder][data-mode][data-task]`, `[data-ul-glance]`, `[data-ul-plaque=<unit>]`,
  `[data-ul-band][data-k]`, `[data-ul-handle]`, `[data-ul-readout]`, `[data-ul-mode=<1|2|3>]`, `[data-ul-predict=<i>]`, `[data-ul-free]`,
  `[data-ul-formal]`.
- **Core maths:** `tenPowers.js` — `UNIT_SCALE`, `unitColumns(from, to, mode)`, `productExp`, `quotientExp`, `powerExp`, `chainExp`
  (README table). `logic/unitLadder.js`: `snap(columnX, mode)`, `bandOf(from, to, mode)`, `verdict(task, state)`, `coachOf`.
- **Why not another lab (DNA §12).** `power-train` couple world (published sibling): two trains of unit factors are coupled, and in a
  quotient the divisor's wagons turn into « ÷ » wagons that cancel « × » wagons — here no factor is built, nothing cancels: a quotient is the
  DISTANCE between two marks (km and cm are 5 columns apart), and a power of a power is the columns-per-unit of the area / volume tables,
  a geometric reading the train has not. `decimal-comma` machine (1AM): a given decimal's comma shifts by one operator — here there is no
  digit string; the band measures between UNITS, and modes change the ruler. `ruler-compare` (graduation to compare two jumps) and
  `tile-yard` (areas by tiles): no tiles, no comparison of two values. Gesture family STRETCH, not used by the unit's other labs
  (`ten-zoom` rotate/pinch, `size-ladder` drag-and-dock).
- **Screen budget.** The ruler must show km … nm (16 columns) in length mode and km² … mm² (14 columns) in area mode. 1024×768 lesson column
  ≈ 414 px: columns ≥ 24 px → horizontal scroll of the RULER ONLY inside its frame (never the page), the band's handles auto-scroll it; the
  plaques km … mm (7–14 columns) fit without scroll for every preset task (presets never need µm/nm in area mode). 768×1024: whole ruler
  visible at ≥ 40 px per column for mode طول. The glance (ruler + readout + mode dial + task card) fits the height at the five sizes.

## 7. Modules (standard 9)

**M0 أستعدّ** (6 min). Seven statements, skills `quwa-ashara` (r01, `quwa-adad-ashara`) and `wahdat` (platform):
1. « $10^5 = 100\,000$ » ✓. 2. « $10^{-3} = -1000$ » ✗ (0,001). 3. « $10^0 = 0$ » ✗ (1). 4. « $0{,}0001 = 10^{-4}$ » ✓. 5. « $1\,000 \times 100 = 100\,000$ » ✓.
6. « $1\ \mathrm{km} = 100\ \mathrm{m}$ » ✗ (1 000 m). 7. « $\frac{1}{100} = 0{,}01$ » ✓. `requires`: 1–4, 7 `quwa-ashara`; 5–6 `wahdat`.

**M1 نشاط — مسطرة التحويل** (`trigger`, P1 P2 P3, 14 min). `objectives`: « ماذا يحدث للأعمدة حين نتابع تحويلين؟ », « كم عمودًا بين
وحدتين على جهتي المتر؟ », « ماذا يتغيّر في جدول المساحة والحجم؟ ».
- Q1 (P1) evidence T1. « $1\ \mathrm{km}=10^3\ \mathrm{m}$ و $1\ \mathrm{m}=10^3\ \mathrm{mm}$ ، إذن $1\ \mathrm{km}=10^3\times10^3\ \mathrm{mm}$ يساوي: » ✓ $10^{6}$ · $10^{9}$
  · $100^{6}$. Brick `jidaa-quwa-ashara` (lead « شريطان: 3 أعمدة ثم 3 أعمدة »; predictPrompt).
- Q2 (P2) evidence T2. « عدد السنتيمترات في 1 كم هو $\frac{10^3}{10^{-2}}$ ، أي: » ✓ $10^{5}$ · $10^{1}$ · $10^{-5}$. Brick `hasil-quwa-ashara`.
- Q3 (P3) evidence T4 (متقدم). « $1\ \mathrm{km^2}=(10^3)^2\ \mathrm{m^2}$ يساوي: » ✓ $10^{6}$ · $10^{5}$ · $10^{9}$. Brick `quwat-quwa-ashara`.
- Q4 (P3) evidence T5. « $1\ \mathrm{m^3}=(10^2)^3\ \mathrm{cm^3}$ يساوي: » ✓ $10^{6}$ · $10^{5}$ · $10^{8}$.

**M2 معارف — دفتر رياض** (`discovery`, P1 P2 P3, 12 min). `objectives`: « أيّ سطور الدفتر صحيحة؟ », « ما القواعد الثلاث؟ ». Track: batch
judge (✓/✗ per line, then the corrected exponent) — own lines with the four error types of act-4: $10^{4}\times10^{5}=10^{9}$ ✓ · $10^{6}\times10^{2}=10^{12}$ ✗
→ $10^{8}$ · $\frac{10^{8}}{10^{3}}=10^{5}$ ✓ · $10^{-6}\times10^{4}=10^{10}$ ✗ → $10^{-2}$ · $\frac{10^{4}}{10^{-3}}=10^{1}$ ✗ → $10^{7}$ · $(10^{2})^{5}=10^{7}$ ✗ → $10^{10}$.
Then `TextbookBox` « القواعد الثلاث » (`source: src('know-3', 42, 'معارف')`, platform wording, OWN examples): $10^{5}\times10^{-8}=10^{-3}$ ·
$\frac{10^{6}}{10^{4}}=10^{2}$ · $\frac{10^{3}}{10^{-4}}=10^{7}$ · $(10^{-2})^{4}=10^{-8}$ · $(10^{4})^{-2}=10^{-8}$. Each rule wrapped in `PredictRule` where no brick
precedes it. Remark box: « لا قاعدة للجمع: $10^2+10^3=1\,100$ ».

**M3 طريقة — قوة واحدة، وعدد × قوة للعدد 10** (`formalization`, P4, 11 min). Methods (`source: src('method-43c', 43, 'طرائق')` and
`src('now-43', 43, 'دوري الآن')`):
- A $=\frac{10^{5}\times10^{-2}}{10^{-4}}$ = $\frac{10^{3}}{10^{-4}}=10^{7}$ · B $=(10^{-2})^{3}\times10^{8}=10^{-6}\times10^{8}=10^{2}$ · C $=\frac{(10^{3})^{2}}{10^{4}\times10^{-5}}=\frac{10^{6}}{10^{-1}}=10^{7}$.
- D $=6\times10^{4}\times5\times10^{-7}=(6\times5)\times10^{4-7}=30\times10^{-3}=0{,}03$ · E $=\frac{8\times10^{5}}{2\times10^{-3}}=4\times10^{8}$.
- Rule text: « نجمع الأعداد مع الأعداد وقوى العدد 10 مع قوى العدد 10، ثم نطبّق القواعد ».
- Questions: $10^{-3}\times10^{7}\times10^{-2}=10^{?}$ → 2 · $\frac{10^{6}}{10^{-2}\times10^{3}}=10^{?}$ → 5 · $3\times10^{2}\times4\times10^{5}=12\times10^{?}$ → 7 ·
  $\frac{9\times10^{-4}}{3\times10^{2}}=3\times10^{?}$ → −6. Brick `tabsit-ashara`.

**M4 أتمرّن** (P1–P4, 13 min):
- « قوة واحدة » (ex-14): $10^{6}\times10^{5}$ → $10^{11}$ · $\frac{10^{8}}{10^{3}}$ → $10^{5}$ · $\frac{10^{3}}{10^{-6}}$ → $10^{9}$ · $(10^{4})^{3}$ → $10^{12}$ · $(10^{-2})^{5}$ → $10^{-10}$ ·
  $(10^{3})^{-4}$ → $10^{-12}$ · $10^{-7}\times10^{-2}$ → $10^{-9}$ · $\frac{10^{5}\times10^{3}}{10^{6}}$ → $10^{2}$ · $10^{4}\times(10^{2})^{3}$ → $10^{10}$.
- « أيّها يساوي $10^{-4}$ ؟ » (ex-17): $\frac{10^{3}}{10^{7}}$ ✓ · $10^{-1}\times10^{-3}$ ✓ · $0{,}01\times10^{-2}$ ✓ · $\frac{10^{-6}}{100}$ ✗ ($10^{-8}$) · $\frac{0{,}001}{10}$ ✓ · $10^{-5}+10^{-5}$ ✗.
- T/F (ex-20): « نصف $10^{10}$ هو $10^{5}$ » ✗ ($5\times10^{9}$) · « $10^{3}+10^{2}=10^{5}$ » ✗ ($1\,100$) · « $100\times10^{-4}=10^{-2}$ » ✓ · « $10^{4}\times10^{-4}=1$ » ✓ ·
  « $10^{2}+10^{-2}=100{,}01$ » ✓.
- numeric (ex-50): $\frac{1000^{2}\times100^{3}}{0{,}01^{2}}=10^{?}$ → 16 (10⁶ × 10⁶ / 10⁻⁴).
- « a × 10ᵖ » (now-43): $7\times10^{2}\times5\times10^{4}=35\times10^{?}$ → 6 · $0{,}4\times10^{-3}\times50\times10^{6}=20\times10^{?}$ → 3 · $\frac{12\times10^{-2}\times5\times10^{7}}{3\times10^{4}}=$ → 200.
- programme (ex-56): « اختر عددًا، اضربه في $10^{5}$ ، ثم في $10^{-2}$ ، ثم اقسمه على $10^{4}$ »: start 30 → 3 ; start −4 → −0,4 ; « قالت ليلى: البرنامج
  يقسم على 10 » → صحيح.

**M5 مسألة 1 — مسألة الدرس « ذاكرة الهاتف »** (`lessonProblem`, P1 P2 P3, 8 min; illustration `stacks` Ko → Mo → Go → To). « في هاتف رانيا:
1 كيلو أكتي (Ko) $=10^3$ أكتي، 1 ميغا أكتي (Mo) $=10^3$ Ko، 1 جيغا أكتي (Go) $=10^3$ Mo، 1 تيرا أكتي (To) $=10^3$ Go. سعة الهاتف 128 Go، وحجم
الصورة الواحدة حوالي 4 Mo. » 1) 1 Go in octets as one power → $(10^3)^3$ or $10^3\times10^3\times10^3$ = $10^{9}$. 2) 1 To in octets → $10^{12}$.
3) photos that fit: $\frac{128\times10^{9}}{4\times10^{6}}$ → 32 000. 4) Go in 1 To → $\frac{10^{12}}{10^{9}}=10^{3}$.

**M6 مسألة 2 — الخزّان والمزرعة** (P3 P4, 8 min; illustration `tanks`). « فوق سطح بيت أمين خزّان ماء مكعّب طول حرفه 1 م، وفي سهل متيجة
مزرعة مساحتها 1 كم². » 1) 1 m³ in dm³ = litres → $(10^1)^3=10^3$ L. 2) in cm³ → $(10^2)^3=10^6$. 3) a drop ≈ $5\times10^{-2}$ cm³: drops in the tank
→ $\frac{10^{6}}{5\times10^{-2}}=2\times10^{7}$ (20 000 000). 4) 1 ha $=10^4$ m²: the farm in hectares → $\frac{10^{6}}{10^{4}}=100$.

**M7 مسألة 3 — برنامج الحساب** (P1 P2 P3, 8 min; illustration `route` of the steps). « برنامج نادي الرياضيات: اختر عددًا، اضربه في
$10^{6}$ ، اقسم الناتج على $10^{-3}$ ، ثم اضربه في $(10^{-2})^{4}$ . » 1) start 2 → 20. 2) start 0,35 → 3,5. 3) the programme as one multiplication
→ × $10^{6-(-3)+(-8)}=10^{1}$. 4) « قال أنيس: النتيجة دائمًا عشرة أضعاف العدد المختار » → صحيح ; start $10^{-1}$ → 1.

**M8 إختبار أولي** (5 items): E1 (P1) « $10^{4}\times10^{-7}$ » ✓ $10^{-3}$ · $10^{-28}$ · $10^{11}$ · $100^{-3}$. E2 (P2) « $\frac{10^{5}}{10^{-3}}$ » ✓ $10^{8}$ · $10^{2}$ ·
$10^{-15}$ · $1^{8}$. E3 (P3) « $(10^{-2})^{4}$ » ✓ $10^{-8}$ · $10^{2}$ · $10^{-6}$ · $10^{16}$. E4 (P4) « $\frac{(10^{3})^{2}\times10^{-1}}{10^{4}}$ » ✓ $10^{1}$ · $10^{0}$ · $10^{9}$ ·
$10^{-1}$. E5 (P4) « $4\times10^{3}\times2\times10^{-5}$ » ✓ $8\times10^{-2}$ · $8\times10^{-15}$ · $6\times10^{-2}$ · $8\times10^{8}$.

## 8. Misconceptions

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| MISC-QAWAID-DARB-ASS | product: multiply the exponents (10³ × 10³ = 10⁹) | prediction 9; dashed total band 6 | M1 Q1, M2 line 2, E1 (−28) |
| MISC-QAWAID-ASAS | multiply the bases too (10³ × 10³ = 100⁶) | — | M1 Q1, E1 (100⁻³) |
| MISC-QAWAID-ISHARA | quotient ignoring a negative sign (10⁵/10⁻² = 10³) | band across the metre | M1 Q2, M2 line 5, E2 |
| MISC-QAWAID-QUWA-JAM | power of power: add (km² → 5) | area ruler 2 columns per plaque | M1 Q3, M2 line 6, E3 (10²) |
| MISC-QAWAID-QUWA-ASS | « exponent of the exponent » (10^(3²)) | prediction 9 / 8 | M1 Q3–Q4 |
| MISC-QAWAID-MAJMU | a sum of powers adds exponents (10² + 10³ = 10⁵) | — | M2 remark, M4 T/F |
| MISC-QAWAID-NISF | half of 10ⁿ is 10^(n/2) | — | M4 T/F, bank |
| MISC-QAWAID-AMIL | in k × 10ᵖ × k' × 10ᵠ add the k or multiply the exponents | — | M3, M4, E5 |
| MISC-QAWAID-ITTIJAH | conversion toward a bigger unit gets a positive exponent (1 mm² = 10⁶ m²) | blue band, negative count | M1 T6, bank |

## 9. Practice bank (`content/practice/3am/qawaid-quwa-ashara/`)

- **Corpus:** `3am-s1-3` ex 1 (q1: 1 000 000, 0,00001 → 10ⁿ, then $\frac{10^4}{10^{-2}}=10^{6}$, $(10^3)^2=10^{6}$, $10^4\times10^7=10^{11}$ ; q2 table →
  `kitaba-ilmiya-rutba` steps `counted: false`) · `2am-s2-65` ex 1 (misfiled 3AM S2 paper, no text layer: read it visually; « كتابة أعداد على شكل
  قوة وحساب عبارة بقوى ») · `3am-s2-76` ex 2 ($S=\frac{10^{6}\times10^{-5}}{(10^{7})^{-3}\times10^{9}}=\frac{10^{1}}{10^{-12}}=10^{13}$ ; $R$ is base 3 →
  `counted: false`) · `3am-s2-83` ex 1 (poor layer: read visually; the powers-of-10 part) · `3am-s2-80` ex 1 only as MODELLED (its questions are
  bracket / order). **Honest faithful `term_exam`: 4** (badges: « الفصل الأول » 3am-s1-3; « الفصل الثاني » the three S2 papers).
- **Plan:** L1 single products/quotients of two powers: 1 term_exam (3am-s1-3) + 6 modelled (`3am-s1`) + 3 adapted (self-4, self-5, self-10).
  L2 negative exponents, notebook-type judging: 7 modelled (`3am-s2`) + 3 adapted (act-4 notebook, ex-20, self-6). L3 chains to one power:
  2 term_exam (3am-s2-76 ex2, 2am-s2-65 ex1) + 5 modelled + 3 adapted (ex-14, ex-15, ex-17). L4 k × 10ᵖ computations, decimals ↔ powers
  (ex-50 type): 1 term_exam (3am-s2-83 ex1) + 6 modelled + 3 adapted (now-43, ex-50, ex-18). L5 problems (storage, units, programmes, magic
  square): 8 modelled + 2 adapted (ex-55/56, ex-19). ≈ 4 / 32 / 14.
- **Answer types:** exponent n (`rational`), a decimal (`rational`), `choice`; « 21 × 10^? » asks the exponent with k fixed.
- **Oracle** `scripts/practice-oracle/qawaid-quwa-ashara.mjs`: own parser of « 10^{n} », products, quotients, powers and k × 10ᵖ with BigInt
  rationals; the single exponent recomputed by direct evaluation (value = 10ⁿ exactly, else fail); every `choice` option evaluated.
  `MISC-QAWAID-*`. Add to `active.json`, `exam-style.json`.

## 10. Risks & owner questions

1. P4 extended with k × 10ᵖ computations (now-43) — confirm; results stay NOT normalised here.
2. The quotient read as a « distance between units » assumes the plaques' values in metres (from L1's prefixes). Confirm that units of
   area/volume in 3AM are acceptable as the power-of-power evidence (they are 1AM–2AM conversion tables, recalled, not taught).
3. ex-13 (« ألف مليار لألف كتاب »), ambiguous, dropped from L1: this bank may adapt it as « 10¹² × 10³ » with an explicit wording.
4. `RECALL_TEN` in the published `quwat-adad-nisbi` must stay coherent with this lesson's wording (no change needed; check after publishing).

## 11. Generator checklist

- [ ] Re-read the cited pages at 220 dpi; verify; move destinations; re-run `build-extraction.py`.
- [ ] Extend `tenPowers.js` (+ tests) with `UNIT_SCALE`, `unitColumns`, `productExp`, `quotientExp`, `powerExp`, `chainExp`, `mulSci`, `divSci`.
- [ ] Lab `unit-ladder`: type, theme `tech-bench`, preset (مبتدئ T1–T3, متقدم T4–T7), registry, `logic/unitLadder.js` + test (snap, modes,
      verdicts, `coachOf` to the end of each task), render test (context then ONE question; each thing once; keyboard), strings, contract
      section + DNA §15 row.
- [ ] Lesson files, knowledge map, predictPrompts, content tests with independent BigInt arithmetic; « أستعدّ » test.
- [ ] e2e `apps/web/e2e/lesson-kit/3am-quwa-nisbiya-qawaid-quwa-ashara.mjs`; screenshots (initial, mid-band, a refusal in the wrong mode,
      formal) at 768×1024, 1024×768, 1280×800, 1366×768.
- [ ] `generate:lesson-index`, `npm test`, `check:lessons`, `build`; catalogue (final LPs, `pointPrerequisites` incl. the two sibling edges,
      `available`, `durationMinutes` ≤ 90, `difficulty: 'متوسط'`, `icon: '📏'`); coordinator publishes (guide §11).

## 12. Generator notes (2026-10-26)

Executed from the plan; the minimal fixes and choices below were recorded while generating.

1. **Extraction re-read** (130–260 dpi, pages 41, 43, 46, 47, 49, 50): the elements of this lesson are `verified: True` in `build-extraction.py` (`READ_L2`); `ex-14` was read again at 260 dpi (the transcription was right), `ex-16` keeps its thin exponents (only the IDEA is reused), `self-7` is a misprint (no correct option). DEST moved: `act-4`, `know-3` → module 2; `method-43c`, `now-43` → module 3; `ex-14, 17, 20, 50, 56` → module 4; `ex-55` → module 7; `self-4, 5, 6` → module 8; `ex-13, 15, 16, 18, 19, self-7 … 10` → `module: 'practice'` (the bank).
2. **Task u2 is km → cm, not cm → km.** The plan wrote « T2 كم سنتيمترًا في 1 كم » with the band « cm ↔ km »; the direction that answers the question is km → cm (+5, a red band). A cm → km band would be −5 (blue) and its prediction 5 would then be a magnitude. `PRESETS.beginner` and `levels.js` use `['km', 'cm']`.
3. **The discovery is one per level**, because `ManipulationDiscovery` carries one prompt: مبتدئ « gap » (D2: `3 − (−2) = 5`) and متقدم « tables » (D3: `3 × 2 = 6`). D1 (the SUM of two chained bands) is asked by module 1, question 1, with the student's own two bands as evidence, and is shown by the dashed total band.
4. **LabCoach**: the plan's six steps are `predict · mode · handle · readout · dock · next · free`; the « task card » step is merged into `handle` (the card is the question). The coach is silent after a refusal and during the discovery.
5. **Length ruler: 13 columns** (km … nm, the unit plaques at exponents 3, 2, 1, 0, −1, −2, −3, −6, −9), not 16; area mode 14 columns (km² … mm²), volume 12 (m³ … mm³). Plaque values are written only in length mode (in area / volume they would give the answer).
6. **Plan numbers checked**: 10⁶/(5×10⁻²) = 2 × 10⁷ = 20 000 000 (masala 2, part 3); 128 × 10⁹ / (4 × 10⁶) = 32 000 (masala 1, part 3); the programme 10⁶ ÷ 10⁻³ × (10⁻²)⁴ = × 10¹ (masala 3). The now-43 row « 12 × 10⁻² × 5 × 10⁷ / (3 × 10⁴) » is posed as the value 200 (options 200 / 20 / 2 000), not as an exponent.
7. **`RECALL_QUWAT`**: the « تذكّر » box of module 2 links to the published `quwat-adad-nisbi` (« أراجع درس قوة عدد نسبي ») and states that a power is built factor by factor and a quotient shortens a fraction there; it does not rebuild either. `RECALL_TEN` in `quwat-adad-nisbi` stays true (10³ × 10⁴ = 10⁷, 10⁶/10² = 10⁴, (10²)³ = 10⁶ are the three rules of this lesson).
8. **Bank**: `3am-s2-83` ex 1 is not the E / F computation (that is ex 2); the bank cites ex 2 (see the bank report in `MOYEN_ROLLOUT_PROGRESS.md`). L1's third adapted sheet is `ex-13` (10¹² × 10³, explicit wording) instead of `self-10`.
9. **`durationMinutes` 62** (modules 0–4 and 8: 6 + 14 + 12 + 11 + 13 + 6; with the three مسائل 86), following the catalogue convention of `quwa-adad-ashara`.
10. **Knowledge map**: nodes = the five notebook ideas + `القواعد الثلاث`, `لا قاعدة للجمع` and the takeaway, with TWO typical errors (multiplied exponents in a product, ignored sign in a quotient); the other two (added exponents in a power of a power, a sum of powers) are corrected in module 2 and the bank only, because `lessonGraphs.test.js` accepts only a parent with two mistakes in one lane plus one child in lane `end`.
11. **« أستعدّ »** has no textbook item (skills `quwa` — the net link `3am.m3.r01` — and `wahdat`); the seven statements are platform additions as in the plan.
