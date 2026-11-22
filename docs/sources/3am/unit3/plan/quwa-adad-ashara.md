# Plan — `quwa-adad-ashara` « قوى العدد 10 » (3AM unit 3, entry 1 of 4)

Read the unit README first (boundaries, shared module `tenPowers.js`, the BLOCKER net issue 1).

## 1. Identity

- Code `quwa-adad-ashara`, title « قوى العدد 10 », unit `quwa-nisbiya` « القوى ذات أسس نسبية صحيحة », catalogue order 10, kind `lesson`.
- Folder `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/quwa-nisbiya/quwa-adad-ashara/` (route base
  `/courses/moyen/3am/ansab_al_aadad_wal_hisab/quwa-adad-ashara`).
- Textbook (pdf = book): activities 1–3 p. 40 (`act-1` cells ×10 per hour, notation 10ⁿ, square/cube; `act-2` table 10⁴ … 10⁻⁴ with « ÷ 10 »
  arrows, 10⁰, 10⁻ⁿ = 1/10ⁿ; `act-3` decimal writing, « 1 followed by … zeros », rank of the 1), معارف 1–2 p. 42 (`know-1`, `know-2`), طرائق
  p. 43 (`method-43a` positive, `method-43b` negative), exercises `ex-1` … `ex-13` p. 46, أؤكّد `self-1`, `self-2`, `self-3`, `self-11` p. 49,
  أستعدّ `prep` items 1–15, 18–25 p. 39. All `verified: False` in the extraction: re-read pp. 39, 40, 42, 43, 46, 49 at 220 dpi before citing.
- Does NOT seed the unit (`_unit/` exists). Moves its pending destinations (`act-1..3`, `know-1..2`, `method-43a..b`, `ex-1..13`, `self-1..3`,
  `self-11`, `prep` items) to real modules in `build-extraction.py`.

## 2. Programme & net

- Items: `3am.m3.r01` « تعيين القوة من الرتبة $n$ للعدد 10. » · `3am.m3.r03` « كتابة عدد عشري باستعمال قوى 10. »
- Draft الكفاءات (verbatim) and PROPOSED final wording (order kept — LP ids positional):

| LP | Draft | Final (proposed) | Why |
|---|---|---|---|
| P1 | تعريف $10^n$ كجداء $n$ عاملا كلها تساوي 10 من أجل $n$ عدد طبيعي غير معدوم | تعريف $10^n$ ، من أجل $n$ عدد طبيعي غير معدوم، جداءً لـ $n$ عاملًا كلّها تساوي 10 وقراءته « 10 أس $n$ »، مع $10^1=10$ | adds the reading and 10¹ (know-1) |
| P2 | تعريف $10^{-n}=\frac{1}{10^n}$ كمقلوب $10^n$ و $10^0=1$ | معرفة أنّ $10^0=1$ وأنّ $10^{-n}=\frac{1}{10^n}$ هو مقلوب $10^n$ | wording only |
| P3 | الانتقال بين الكتابة العشرية وكتابة قوة للعدد 10 (عدد الأصفار ورتبة الرقم 1) | الانتقال بين الكتابة العشرية لقوة للعدد 10 وكتابتها $10^n$ : 1 متبوع بـ $n$ صفرًا، أو 1 في الرتبة $n$ بعد الفاصلة، وقراءتها بالأسماء (ألف، مليون، مليار؛ جزء من ألف، جزء من مليون…) والبادئات (كيلو، ميلي، ميكرو، نانو…) | names and prefixes are in the book's exercises (ex-2, ex-4, ex-7, ex-10–12) and need an owner LP |
| P4 | كتابة عدد عشري باستعمال قوى 10 | كتابة عدد عشري باستعمال قوى 10: مفكوكه مثل $3985=3\times10^3+9\times10^2+8\times10^1+5\times10^0$ و $0{,}407=4\times10^{-1}+7\times10^{-3}$ ، وكتابات مثل $45\,000=45\times10^3$ و $0{,}07=7\times10^{-2}$ | makes the boundary with the scientific writing explicit (no normalisation here) |

- Review items for « أستعدّ » (`reviewLinksForLesson`): `1am.m1.r03` « ضرب وقسمة عدد عشري في/على 10، 100، 1000 أو في/على 0,1، 0,01، 0,001. »
  — home `kusur-ashriya-kitaba` (1AM, **available**) ; `3am.m3.r02` (rules) — home `qawaid-quwa-ashara` (**planned, NEXT lesson**): see README
  issue 1. Plan assumes the recommended net edit (only `1am.m1.r03` measured). Platform diagnostics also measure « مقلوب » (book prep item 15;
  `maqlub-qismat-kasrayn`, 3AM unit 2, coming_soon — not a net link: a `platform_addition` item, never blocking).
- noRebuild: none (`noRebuildForLesson` empty).
- pointPrerequisites: intra-lesson P2 ← P1, P3 ← P1, P4 ← P3, plus ONE cross-year edge along the net link `1am.m1.r03 → 3am.m3.r01`:
  the published 1AM LP `1am_kusur-ashriya-kitaba_P4` (« ضرب عدد عشري في 10 أو 100 أو 1000 … بإزاحة الفاصلة ») feeds P3 (an r01 LP: the decimal
  writing of 10ⁿ is the shift of the 1). Catalogue: `"P2": ["3am_quwa-adad-ashara_P1"], "P3": ["3am_quwa-adad-ashara_P1",
  "1am_kusur-ashriya-kitaba_P4"], "P4": ["3am_quwa-adad-ashara_P3"]`. (P4 is r03: no net link from 1AM to r03, so no cross edge on P4.)
- Where it leads: inside the unit to r02 (`qawaid-quwa-ashara`) and, through r03 → r04, the scientific writing; 4AM: no direct net link
  (the 4AM BEM exercise « أعط الكتابة العلمية للعدد B », e.g. `tawzif-khawass-judhur` exercises, uses it through `kitaba-ilmiya-rutba`).

## 3. Boundary

Owns the left column of the README table for this lesson. Explicitly does NOT: compute 10ᵐ × 10ⁿ, 10ᵐ/10ⁿ, (10ᵐ)ⁿ (a conversion that would
need one is given in decimal); normalise (« 4,5 × 10⁴ » never appears as « the » writing — `45 × 10³` and `4 × 10³ + 5 × 10²` are fine); say
« الكتابة العلمية » or « رتبة القدر »; touch aⁿ for a ≠ 10. Multiplying a decimal by 10ⁿ IS allowed: it is the 1AM shift of the comma
(« 36 × 10⁶ = 36 000 000 »), recalled, not rebuilt.

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| act-1 p. 40 | a cell splits into 10 each hour: cells after 3, 5, 9, n hours; hours to reach 10 billion; notation 10ⁿ; square of side 10 cm, cube of edge 10 dm | each step multiplies by 10 → n factors | candidate entry, REJECTED (it is exactly the train of `quwat-adad-nisbi` with base 10 — a product built factor by factor); its square/cube → أتمرّن row « 10 cm × 10 cm = 10² cm² »; the « 10 billion » question → masala-2 Q3 style (names) |
| act-2 p. 40 | table 10⁴ … 10⁻⁴ with « ÷ 10 » arrows; 10⁰, 10¹; 10⁻¹ … 10⁻⁴ as fractions; 10⁻ⁿ = 1/10ⁿ | going DOWN by ÷10 gives 1, 0,1, 0,01 … naturally | the zoom-IN half of the lab (each notch ÷ 10); the table → معارف box (own exponents −5 … 5) |
| act-3 p. 40 | decimal writing of 10², 10⁶, 10⁹; « 10¹² is 1 followed by … zeros »; powers from 100 … 1 000 000 000; 10⁻², 10⁻³ …; zeros and rank of the 1 in 10⁻¹¹, 10⁻¹³ | counting zeros / the rank of the 1 | lab's evidence (label of the frame) + نشاط Q2/Q4; the « 10⁻¹¹ » count → أتمرّن numeric (own: 10⁻¹¹ rank 11 kept as a skill, other numbers: 10⁻¹⁴) |
| know-1, know-2 p. 42 | definitions, 10ⁿ = 100…0, 10⁻ⁿ = 0,00…01 (1 at rank n), examples 10⁵, 10¹⁹, 10⁻⁵, 10⁻²³ | — | معارف boxes REWRITTEN with own examples (10⁷, 10¹⁵, 10⁻⁴, 10⁻¹⁸) |
| method-43a/b p. 43 | write 10 000 … as 10ⁿ (count zeros); decimal of 10⁹; 0,01 … as 10⁻ⁿ (rank of the 1); decimal of 10⁻⁶ | the two counting methods | طريقة, own numbers (below) |
| ex-1 … ex-7 p. 46 | decimal ↔ power, names (عشرة … مليار; جزء من عشرة … جزء من مليار), 1/10ⁿ, 1/10⁻ⁿ | names, 1/10⁻ⁿ = 10ⁿ | أتمرّن batches (own numbers) |
| ex-8, ex-9 | which writings equal 10⁶; group equal writings | the « 6 000 000 » trap | أتمرّن T/F + bank |
| ex-10, ex-11, ex-12 | units: 1 kg = 10³ g, 1 m² = 10⁴ cm², 1 mL = 10⁻³ L, octets Ko … To | prefixes ARE powers of 10 | lab world `prefixes` (معارف) + أتمرّن « units » batch + masala-1 |
| ex-13 | « ألف مليار لألف كتاب » … (ambiguous wording, needs products) | — | DROPPED (needs the product rule; ambiguous) — bank of `qawaid-quwa-ashara` may adapt it |
| self-1, 2, 3, 11 p. 49 | 10⁵ =, 10^4 (misprint: 10⁻⁴ intended), 10⁻¹ =, « 36 مليون » | — | إختبار أولي inspiration (own numbers); self-2 misprint noted, not reproduced |
| prep 1–15, 18–25 p. 39 | ×10/100/0,01, reciprocal of 10, 2×5 repeated, units | — | « أستعدّ » (rewritten, own numbers) |

## 5. Design

**The lesson in one paragraph.** An exponent of ten is a COUNT you can read in the decimal writing: 10ⁿ is 1 followed by exactly n zeros
because each factor 10 shifts the 1 one rank to the left; going the other way, each « ÷ 10 » shifts it one rank to the right, so 10⁻ⁿ has its 1
at rank n after the comma — and with no factor at all you stay at 1 (10⁰ = 1). The exponent is not a size you multiply by (10³ ≠ 30) and a
negative exponent does not make a negative number (10⁻³ = 0,001 > 0): it is the rank of the 1. Every metric prefix (kilo, milli, micro, nano)
is one of these powers, and any decimal is a sum of digits times powers of 10.

**Entry point.** Book activity 1 (cells ×10 per hour) vs platform situation « the science club's lens »: a square frame seen through a lens
whose ring zooms by exactly ×10 or ÷10 per notch, from a 1 m frame (a classroom desk) out to a country and in to a virus. The student must
make the frame side equal to a written length (« 1 000 000 م », « 0,001 م », « مليار متر »): the number of notches becomes NECESSARY, and it is
read in the label as zeros or as the rank of the 1. Chosen: the lens — it is about the DECIMAL WRITING and SIZES (what is specific to ten), the
negative side appears as « smaller frames » (never negative lengths), 10⁰ is « no notch = the desk », and it does not re-run the train.

**Order of ideas.** (M1) notches out: 1 000 m = 3 notches = 3 zeros → 10ⁿ = n factors → 10⁰ = 1 (back to the desk) → notches in: 0,001 m =
3 notches = 1 at rank 3 → 10⁻ⁿ = 1/10ⁿ · (M2) names and prefixes on the same lens (world `prefixes`) → definitions · (M3) the two counting
methods + writing a decimal with powers of 10 (مفكوك, k × 10ⁿ) · (M4) practice · (M5–M7) problems · (M8) test.

**Story contexts (own numbers, Algerian life).** The science club of the متوسطة (lens); the SVT microscope (hair ≈ 0,0001 m, red cell ≈
0,00001 m, virus ≈ 0,0000001 m); road and Earth lengths (2 000 km, 40 075 km); the water meter of the house (m³ black dials, litres red
dials); phone storage (octets, Ko … To).

## 6. Lab — `ten-zoom` « عدسة القوى »

- **Type** `ten-zoom` (free in `manipulationRegistry.js`); file `manipulations/operations/TenZoom.jsx` on `manipulations/logic/tenZoom.js`; theme
  `science-lens` (new in `VISUAL_THEMES`, kind `objects`, shows « عدسة وإطار ومشاهد »); strings `lesson.manipulation.json › tenZoom`.
- **Drawn world.** The science-club table: a big brass lens (circular viewport, raised rim, soft shadow) with a knurled ZOOM RING around it
  (notches engraved, 44 px grab). Inside the lens: a square FRAME (bright outline) and the scene at that scale; under the lens a brass plate
  « ضلع الإطار » with the side in DECIMAL in an LTR island (`decText`, groups of 3: « 1 000 000 م », « 0,000 001 م » shown as the book writes
  « 0,000001 م »), and a unit-name pill (« كيلومتر » at n = 3, « ميليمتر » at −3, « ميكرومتر » −6, « نانومتر » −9; none elsewhere). A club host,
  `KidFigure` girl in hijab (« مريم »), beside the lens, reacts (`wonder` while zooming, `proud` on a stamp) — never carries information.
  Scenes, one simple vignette per integer n from −7 to 9 (honest TYPICAL sizes, labelled with « ≈ » where needed): −7 a virus · −6 a bacterium
  · −5 a red blood cell · −4 a hair's cross-section · −3 a grain of salt · −2 a ladybird · −1 an eraser · 0 the desk top with a schoolbag ·
  1 the classroom · 2 the school with its football pitch · 3 the neighbourhood · 4 the town · 5 the wilaya (coast + mountains, no named
  borders) · 6 northern Algeria and the coast · 7 the Earth · 8 Earth and Moon orbit (part) · 9 the Moon's orbit whole. Beyond (free panel up
  to ±12): the nested grid only, with « لا مشهد لهذا السلّم ».
- **The variable in the hand: n** (integer, the exponent of the frame side in metres), **gesture: turn the zoom ring** one notch at a time
  (drag around the ring; it clicks per notch), **pinch / spread** on the lens (tablet), **wheel** (laptop), **round − / + buttons** under the
  plate, keyboard **+ / −** and **← / →** (`role="slider"`, `aria-valuenow = n`, `aria-valuetext` = the decimal side).
- **What the world shows (never the rule).** Zoom OUT: the current frame shrinks into ONE cell of a 10 × 10 grid of the new frame (outlined,
  then fades) — « ten across » is visible. Zoom IN: the centre cell grows to fill the lens. The plate's decimal changes one rank per notch
  (the 1 moves, a zero appears/disappears — animate the moving 1). مبتدئ only: a « notch tally » under the plate in the student's own
  operations « 1 × 10 × 10 × 10 » / « 1 ÷ 10 ÷ 10 » (from the 1 m start). The notation 10ⁿ is NOT shown until the formal phase.
- **Opening (DNA §17.9, no title).** Context: « عدسة نادي العلوم: كل نقرة على حلقتها تكبّر الإطار المربّع عشر مرّات أو تصغّره عشر مرّات.
  الإطار الآن ضلعه 1 م: سطح طاولة القسم. » Question: « أدر الحلقة حتى يصير ضلع الإطار مساويًا للطول المكتوب على البطاقة. »
- **Every mission starts with the frame back on the 1 m desk (n = 0)** so that « the number of notches » is always counted from 1 — except
  مبتدئ mission 4, which starts where mission 3 ended (n = −3) and asks to come back to the desk.
- **مبتدئ** (tally visible): mission cards in order — (1) « 1 000 م » → n = 3, end: frame 1 000 m, stamp ; (2) « 1 000 000 م » with a PREDICTION
  card BEFORE the first notch, under its own label « كم نقرة تكبير تحتاج؟ »: 6 / 7 / 1 000 000 (judged by the world after docking) → n = 6 ;
  (3) « 0,001 م » → n = −3 ; (4) « 1 م » (back to the desk) → n = 0. End state of the level: four stamps.
- **متقدم** (no tally; the target is a name or another unit): (1) « مليار متر » → 9 ; (2) « ميكرومتر واحد: جزء من مليون من المتر » → −6 ;
  (3) « 0,0000001 م » with prediction « كم نقرة تصغير؟ » 6 / 7 / 8 → −7 (6 = zeros after the comma only, 8 = all digits) ; (4) « 10 كم » → 4
  (10 km = 10 000 m). End: four stamps.
- **Verdicts (in the student's numbers, MANIPULATION_CONTRACT « verdicts say the calculation »).** Overshoot: « إطارك 10 000 م: أكبر من
  البطاقة بعشر مرّات (10 000 = 1 000 × 10) ». Undershoot: « إطارك 100 م: يلزمه ضرب في 10 مرّة أخرى ». Wrong direction for a small target:
  « إطارك 10 م والبطاقة أصغر من 1 م: صغّر ». A prediction wrong: the card wobbles after docking and says the count the ring made.
- **« جرّب أعدادك » (always open, DNA owner rule).** One input « اكتب طولًا بالمتر » accepting a power of ten in decimal (`exponentOfPow10`,
  from 0,000000000001 to 1 000 000 000 000) or a name from the list (ألف … ألف مليار, جزء من عشرة … جزء من مليار); anything else is refused
  in one line « هذا الطول ليس قوة للعدد 10: جرّب 1 متبوعًا بأصفار، أو 0,0…1 ». It becomes a new mission card.
- **LabCoach (`coachOf`, one sentence each):** (1) mission card « هذا هو الطول المطلوب لضلع الإطار. » (2) the ring « أدر الحلقة: كل نقرة
  تكبّر الإطار عشر مرّات أو تصغّره. » (3) the plate « هنا تقرأ ضلع إطارك الآن. » (4) prediction cards (when present) « اختر توقّعك قبل أن تدير
  الحلقة. » (5) the free panel « اكتب طولًا من اختيارك. »
- **Misconceptions made VISIBLE.** 10ⁿ = 10 × n (prediction distractor; the plate never shows 30 for 3 notches); zeros = digits (« 7 » for
  1 000 000; the plate shows 6 zeros after the 1); 10⁻ⁿ negative (the frame never vanishes or flips: it gets SMALLER, the label stays
  positive); zeros after the comma = n (prediction « 6 » for 0,0000001); 10⁰ = 0 (with no notch the frame is the 1 m desk, not nothing).
- **Discovery (`ManipulationDiscovery`, refutable).** « ما العلاقة بين عدد نقرات التكبير وضلع الإطار؟ » ✓ « عدد النقرات يساوي عدد الأصفار
  بعد الرقم 1 » ✗ « عدد النقرات يساوي عدد أرقام الطول » (refuted by the student's 1 000: 4 digits, 3 notches) ✗ « عدد النقرات يساوي الطول مقسومًا
  على 10 » (refuted: 100 notches?). Second (متقدم or after mission 3): « بعد 3 نقرات تصغير ضلع الإطار 0,001 م: أين الرقم 1؟ » ✓ « في الرتبة
  الثالثة بعد الفاصلة » ✗ « بعد ثلاثة أصفار بعد الفاصلة » (refuted: 0,0001 is 4 notches) ✗ « الطول صار −1 000 م ». `discoveryReady` = the
  four missions of the level stamped. Formal (named only here): 10³ = 10 × 10 × 10 = 1 000; 10⁰ = 1; 10⁻³ = 1/10³ = 0,001.
- **Events (`state.report`):** `{kind:'notch', n, dir}` · `{kind:'dock', task, n, ok}` · `{kind:'predict', task, choice, ok}` ·
  `{kind:'refused', task, n, target, reason:'over'|'under'|'direction'}` · `{kind:'solved', world, task, n}` · `{kind:'custom', n}`.
  DOM: `[data-ten-zoom][data-world][data-n]`, `[data-tz-glance]`, `[data-tz-ring]`, `[data-tz-plate]`, `[data-tz-less]`/`[data-tz-more]`,
  `[data-tz-card]`, `[data-tz-predict=<i>]`, `[data-tz-free]`, `[data-tz-formal]`.
- **Worlds.** `zoom` (module 1, both levels) and `prefixes` (module 2, `levels={false}`): the plate shows the unit name and the student dials
  to a prefix card (« كيلومتر », « ميليمتر », « ميكرومتر », « نانومتر », then « ميغامتر = مليون متر »); same gesture, the tasks are names.
- **Core maths:** `tenPowers.js` — `pow10`, `pow10Text`, `exponentOfPow10`, `zerosOf`, `rankOfOne`, `zerosBeforeOne`, `pow10Name`, `PREFIXES`,
  `parseDec`, `decText` (README table). Lab logic `logic/tenZoom.js`: `stepTo(n, dir)`, `verdict(n, target)`, `coachOf(state)`, presets.
- **Why not another lab (DNA §12).** `power-train` (3AM): the hand builds a product factor by factor, the load is the output, the coupling
  adds exponents — here nothing is multiplied by the hand: the hand changes a SCALE, and the evidence is the decimal writing of one side
  and a physical size; no wagons, no « × and ÷ cancel ». `decimal-comma` (1AM): the digits are fixed and the hand moves the COMMA of an
  arbitrary decimal (value changes by 10^k) — here there is no digit string to handle; the label is an output and only powers of ten exist.
  `ruler-compare` (1AM): the hand picks a graduation (m … mm) to separate two jumps — here the scale spans 22 orders of magnitude and is the
  answer itself (n), with names/prefixes. Gesture family: ROTATE / PINCH (none of the three uses it).
- **Screen budget.** 768×1024: lens Ø ≈ 420 px centred, plate and buttons under it, mission card above-right, free panel in the right
  column folded BELOW only if height < 900 (never closed: always visible). 1024×768 (lesson column ≈ 414 px with the menu open): lens Ø ≈
  300 px, plate inline under it, mission card overlaid in the lens corner, coach bubbles placed outside the lens (never over the plate).
  The `[data-tz-glance]` (lens + plate + controls + card) must fit the viewport height at 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080.

## 7. Modules (standard 9)

**M0 أستعدّ** (`prerequisite_check`, 6 min). Seven statements (true/false + why), skills `darb-ashara` (1am.m1.r03), `maqlub` (platform),
`wahdat` (platform). Sources: `prep` items rewritten (own numbers) + `addition('prerequisite_diagnostic')`.
1. « $4{,}37 \times 100 = 437$ » — true (comma 2 ranks right). 2. « $26{,}8 \div 1000 = 0{,}268$ » — false: $0{,}0268$. 3. « القسمة على 0,1 هي
الضرب في 10 » — true. 4. « $0{,}6 \times 0{,}01 = 0{,}06$ » — false: $0{,}006$. 5. « مقلوب 100 هو $0{,}01$ » — true. 6. « $2\times5\times2\times5\times2\times5 = 1000$ » — true
(three times 10). 7. « $3{,}2\ \mathrm{km} = 320\ \mathrm{m}$ » — false: 3 200 m. `requires`: 1–4 `darb-ashara`, 5 `maqlub`, 6 `darb-ashara`, 7 `wahdat`.
`priorKnowledge: ['darb-ashara', 'maqlub', 'wahdat']`.

**M1 نشاط — عدسة القوى** (`trigger`, P1 P2, 14 min). `objectives`: « كم نقرة تكبير تصنع 1 000 000 م؟ », « ماذا يحدث بلا أيّ نقرة؟ »,
« أين الرقم 1 بعد نقرات التصغير؟ ». Track: `ManipulationWorkspace` (`ten-zoom`, levels) → questions with `Evidence` from the trials →
bricks after each answer.
- Q1 (P1) evidence « وصلتَ إلى 1 000 000 م بـ 6 نقرات تكبير ». « في كل نقرة يُضرب ضلع الإطار في 10. أيّ كتابة تعبّر عن الضلع بعد 6 نقرات؟ »
  ✓ « $10\times10\times10\times10\times10\times10$ (ستة عوامل) » · « $10\times6=60$ » · « $10+10+10+10+10+10$ ». Brick `ashara-taarif` (lead
  « ستة عوامل كلّها 10: كيف نكتبها باختصار؟ », predictPrompt).
- Q2 (P3) « في 1 000 000 ستة أصفار بعد 1. لماذا؟ » ✓ « كل ضرب في 10 يضيف صفرًا واحدًا » · « لأنّ العدد فيه سبعة أرقام » · « لأنّ $6\times10=60$ ».
  Brick `ashara-asfar` (1 followed by n zeros).
- Q3 (P2) evidence « عدتَ إلى إطار المتر بلا نقرة ». « بلا أيّ نقرة ضلع الإطار 1 م. ماذا يساوي $10^0$ ؟ » ✓ 1 · 0 · 10. Brick `ashara-sifr`.
- Q4 (P2, needs متقدم or mission 3) evidence « بـ 3 نقرات تصغير صار الضلع 0,001 م ». « كل نقرة تصغير تقسم الضلع على 10. ماذا يساوي الضلع بعد
  3 نقرات تصغير؟ » ✓ « $\frac{1}{10\times10\times10}=\frac{1}{1000}=0{,}001$ » · « $-1000$ » · « $0{,}0001$ ». Brick `ashara-salib` (10⁻ⁿ = 1/10ⁿ,
  1 at rank n after the comma), lead « ثلاث نقرات تصغير: ما علاقة $10^{-3}$ بـ $10^3$ ؟ ».

**M2 معارف — الأسماء والبادئات** (`discovery`, P1 P2 P3, 12 min). `objectives`: « كيف نقرأ $10^n$ ونكتبه؟ », « ما $10^{-n}$ ؟ », « ما
الأسماء والبادئات؟ ». Track: lab `ten-zoom` world `prefixes` (`levels={false}`; tasks كيلومتر 3 · ميليمتر −3 · ميكرومتر −6 · نانومتر −9 ·
ميغامتر 6) → questions → boxes (`TextbookBox`, platform wording; `source: src('know-1'|'know-2', 42, 'معارف')`).
- Q « الكتابة العشرية لـ $10^{7}$ » ✓ 10 000 000 · 70 · 1 000 000. → box definition 10ⁿ (example $10^{15}$ = 1 followed by 15 zeros), notes $10^1=10$, $10^0=1$.
- Q « $0{,}00001 = 10^{?}$ » ✓ −5 · −4 · 5. → box 10⁻ⁿ (example $10^{-4}=\frac{1}{10^4}=0{,}0001$, the 1 at rank 4; $10^{-18}$ has its 1 at rank 18).
- Q « ميكرومتر واحد = $10^{-6}$ م. كم ميكرومترًا في المتر؟ » ✓ $1\,000\,000$ · 6 · $0{,}000\,001$ (read off the lens: 6 notches).
- Q « مليار = $10^{?}$ » ✓ 9 · 12 · 6. → box table « names & prefixes » (تيرا 10¹² · جيغا 10⁹ · ميغا 10⁶ · كيلو 10³ · هكتو 10² · ديكا 10¹ · ديسي 10⁻¹ ·
  سنتي 10⁻² · ميلي 10⁻³ · ميكرو 10⁻⁶ · نانو 10⁻⁹ · بيكو 10⁻¹²) — the book's table has misprints (تيرا printed 10⁻¹²): use the correct values.
- « أتوقّع القاعدة » on the brick `ashara-salib` (prompt: « بعد n نقرة تصغير، أين يقع الرقم 1؟ »).

**M3 طريقة — من الكتابة العشرية إلى القوى، والعكس** (`formalization`, P3 P4, 11 min). `objectives`: « كيف أعدّ الأصفار أو رتبة 1؟ »,
« كيف أكتب عددًا عشريًا بقوى 10؟ ». No lab. Worked methods (`MethodSteps`, `source: src('method-43a'|'method-43b', 43, 'طرائق')` for the first,
`addition('knowledge_formalization')` for P4):
- Method A: « اكتب على شكل قوة للعدد 10: $a=100\,000$ ؛ $b=0{,}0001$ ، ثم الكتابة العشرية لـ $c=10^{8}$ و $d=10^{-6}$ » → $a=10^5$ (5 zeros),
  $b=10^{-4}$ (1 at rank 4), $c=100\,000\,000$, $d=0{,}000001$.
- Method B (مفكوك): $e=7\,040\,300 = 7\times10^6+4\times10^4+3\times10^2$ ; $f=0{,}0509=5\times10^{-2}+9\times10^{-4}$ (empty ranks absent).
- Method C (k × 10ⁿ, comma shift recalled from 1AM): $36$ مليون $=36\times10^6=36\,000\,000$ ; $25\ \mu\mathrm{m}=25\times10^{-6}\ \mathrm{m}=0{,}000025\ \mathrm{m}$.
- Questions: « $60\,000\,000 = 6\times10^{?}$ » → 7 · « $0{,}008 = 8\times10^{?}$ » → −3 · « مفكوك $5\,030{,}07$ » ✓ $5\times10^3+3\times10^1+7\times10^{-2}$ ·
  $5\times10^3+3\times10^2+7\times10^{-2}$ · $5\times10^4+3\times10^2+7\times10^{-1}$. Brick `ashara-mafkuk` (predictPrompt « كل رقم × قوة رتبته »).

**M4 أتمرّن** (`practice_lab`, P1–P4, 13 min). Batches (`interaction: 'batch'`, keys computed with `tenPowers.js`, re-checked in content.test.js):
- « الكتابة العشرية »: $10^4$ → 10 000 · $10^9$ → 1 000 000 000 · $10^{-2}$ → 0,01 · $10^{-7}$ → 0,0000001 · $10^0$ → 1 · $10^1$ → 10 (cites ex-1, ex-3).
- « على شكل قوة »: 100 000 → $10^5$ · 0,000001 → $10^{-6}$ · $\frac{1}{10^4}$ → $10^{-4}$ · $\frac{1}{10^{-3}}$ → $10^3$ (cites ex-5, ex-6).
- « الأسماء »: مئة ألف → 10⁵ · مئة مليار → 10¹¹ · جزء من مليون → 10⁻⁶ · ألف مليار → 10¹² (ex-2, ex-4, ex-7).
- « الوحدات »: 1 km = 10³ m · 1 g = 10³ mg · 1 mm = 10⁻³ m · 1 To = 10¹² octets · 1 m² = 10⁴ cm² (100 × 100) · 1 L = 10³ cm³ (ex-10, 11, 12; act-1 square/cube idea).
- T/F: « $10^6=6\,000\,000$ » ✗ · « $10^6=10\times10\times10\times10\times10\times10$ » ✓ · « $10^{-3}=-1000$ » ✗ · « $10^{-3}=0{,}001$ » ✓ · « جزء من مليار $=10^{-9}$ » ✓ (ex-8, ex-9).
- numeric: « كم صفرًا في الكتابة العشرية لـ $10^{15}$ ؟ » → 15 · « في $10^{-14}$ ما رتبة 1 بعد الفاصلة؟ » → 14 (act-3).
- « k × 10ⁿ »: $4\,000=4\times10^{?}$ → 3 · $250\,000=25\times10^{?}$ → 4 · $0{,}0003=3\times10^{?}$ → −4 · 36 مليون $=36\times10^{?}$ → 6 (self-11 idea).

**M5 مسألة 1 — مسألة الدرس « تحت المجهر »** (`lessonProblem`, P2 P3, 8 min; illustration `scene` or `tags`). « في حصّة العلوم الطبيعية
شاهد تلاميذ القسم تحت المجهر: شعرة سُمكها حوالي $0{,}0001$ م، وكرية دم حمراء قطرها حوالي $0{,}00001$ م، وفيروسًا قطره حوالي $0{,}0000001$ م. »
1) the hair as a power → $10^{-4}$ (step: rank of the 1 = 4). 2) the red cell and the virus → $10^{-5}$, $10^{-7}$. 3) « كم صفرًا قبل الرقم 1 في
قطر الفيروس؟ » → 7 (the units 0 and six after the comma). 4) « قالت سارة: الفيروس أصغر الثلاثة لأنّ أسّه −7 أصغر من −5 و −4 » → صحيح (choice;
distractor « خطأ: −7 فيه رقم أكبر »).

**M6 مسألة 2 — مسافات كبيرة** (P3 P4, 8 min; illustration `route`). « تقطع حافلة حوالي 2 000 كم من الجزائر العاصمة إلى أقصى الجنوب، ومحيط
الأرض عند خط الاستواء حوالي 40 075 كم. » 1) 1 km = 10³ m: 2 000 km in m → 2 000 000 m. 2) « $2\,000\,000 = 2\times10^{?}$ » → 6. 3) 40 000 km
in m → 40 000 000 m $=4\times10^{7}$. 4) the مفكوك of 40 075 (km) → $4\times10^4+7\times10^1+5\times10^0$.

**M7 مسألة 3 — عدّاد الماء** (P4, 8 min; illustration `tags` with the meter). « يقرأ عدّاد الماء في بيت ياسين $1\,207{,}035\ \mathrm{m^3}$ (الأرقام
السوداء بالمتر المكعّب، والحمراء أجزاؤه). » 1) the مفكوك → $1\times10^3+2\times10^2+7\times10^0+3\times10^{-2}+5\times10^{-3}$ (choice, distractors
skip/shift a rank). 2) 1 L $=10^{-3}\ \mathrm{m^3}$: the red part 0,035 m³ in litres → 35 L. 3) the month's use 18 m³ in litres: $18\times10^3$ → 18 000 L.

**M8 إختبار أولي** (5 items, `BossFinal`, literal options; keys in content.test.js):
E1 (P1) « $10^{4}$ يساوي » ✓ $10\,000$ · $40$ · $1\,000$ · $100\,000$ (MISC-ASHARA-DARB, -RAQAM ±1). E2 (P2) « $10^{-2}$ يساوي » ✓ $0{,}01$ · $-100$ ·
$0{,}001$ · $-20$ (-SALIB, -FASILA, -DARB). E3 (P2) « $10^{0}$ يساوي » ✓ 1 · 0 · 10 (-SIFR). E4 (P3) « $0{,}000001=$ » ✓ $10^{-6}$ · $10^{-5}$ ·
$10^{6}$ · $10^{-7}$ (-FASILA, -SALIB). E5 (P4) « $3\,000\,400=$ » ✓ $3\times10^6+4\times10^2$ · $3\times10^6+4\times10^3$ · $3\times10^7+4\times10^2$ ·
$3\times10^5+4\times10^2$ (-MAFKUK). Badges: « أقرأ قوى العدد 10 », « أكتب بقوى 10 ».

## 8. Misconceptions

| Id | Wrong belief | Lab shows it | Caught by |
|---|---|---|---|
| MISC-ASHARA-DARB | 10ⁿ = 10 × n (10³ = 30) | prediction distractor; the plate shows 1 000 | M1 Q1, E1, E2 (−20), bank L1–L2 |
| MISC-ASHARA-RAQAM | n = number of digits (1 000 000 → 7) | prediction « 7 »; tally 6 | M1 Q2, M4 numeric, E1 |
| MISC-ASHARA-SALIB | 10⁻ⁿ is negative (10⁻³ = −1000) | the frame gets smaller, never negative | M1 Q4, M4 T/F, E2, E4 |
| MISC-ASHARA-FASILA | 10⁻ⁿ has n zeros after the comma (10⁻³ = 0,0001) | prediction « 6 » for 0,0000001; refusal over/under by one notch | M1 Q4, M2, E2, E4 |
| MISC-ASHARA-SIFR | 10⁰ = 0 (or 10) | no notch = the 1 m desk | M1 Q3, E3 |
| MISC-ASHARA-MAFKUK | skipping or shifting an empty rank in a مفكوك | — | M3, M7 Q1, E5 |
| MISC-ASHARA-WIHDA | a prefix read backwards (1 mm = 10³ m) | world `prefixes`: ميليمتر is 3 notches IN | M2, M4 units, bank |

## 9. Practice bank (`content/practice/3am/quwa-adad-ashara/`, 5 levels × 10)

- **Corpus (exams-index):** `3am-s1-3` ex 1 (q1 « اكتب على شكل 10ⁿ »: 1 000 000, 0,00001, then 10⁴/10⁻², (10³)², 10⁴ × 10⁷ — the last three are
  `qawaid-quwa-ashara` steps → `counted: false` with the lesson's own LP label, or omitted; q2 table is `kitaba-ilmiya-rutba` → omitted) ;
  `3am-s2-83` ex 1 (« كتابة على شكل aⁿ، الكتابة العشرية لقوى 10 », text layer poor: READ IT VISUALLY at 110 dpi before using). No other paper
  hits r01/r03. **Honest faithful `term_exam`: 2** (badges « على منوال اختبار الفصل الأول » for 3am-s1-3, « … الثاني » for 3am-s2-83).
- **Plan per level:** L1 (recognition: decimal ↔ power, names): 1 term_exam (3am-s1-3 ex1 q1 part) + 6 modelled (`modelledOn: "3am-s1"`) + 3
  adapted (ex-1, ex-3, self-1). L2 (10⁻ⁿ, 1/10ⁿ, 1/10⁻ⁿ, prefixes): 7 modelled + 3 adapted (ex-5, ex-6, self-3). L3 (units, octets,
  conversions written k × 10ⁿ): 1 term_exam (3am-s2-83 ex1) + 5 modelled + 4 adapted (ex-10, ex-11, ex-12, act-1). L4 (مفكوك, writing decimals
  with powers, T/F traps): 7 modelled + 3 adapted (ex-8, ex-9, self-11). L5 (multi-step problems: microscope, meter, storage named in
  decimal): 8 modelled + 2 adapted (act-3, act-2). Totals ≈ 2 term_exam / 33 modelled / 15 adapted. Adapted sheets carry `badge: null`.
- **Answer types:** an exponent n (integer `rational`), a decimal value (`rational`, written « 0,0001 »), or `choice`. « Write as 10ⁿ » asks for
  n (as the published bank does for aⁿ).
- **Oracle** `scripts/practice-oracle/quwa-adad-ashara.mjs` (+ import in `scripts/practice-answer-oracle.test.mjs`): its OWN BigInt decimal
  parser (not `tenPowers.js`): parses the statement's decimals and « 10^{n} », finds the unique n (exponent questions), compares values
  exactly, evaluates every `choice` option and fails unless exactly one is true. Misconceptions `MISC-ASHARA-*` in `misconceptions.json`.
- Add to `active.json` and `exam-style.json`.

## 10. Risks & owner questions

1. **Net BLOCKER** (README issue 1): r02 → r03 makes the next lesson a « review » of this one. Recommended edit given there.
2. P3 now includes names and prefixes (owner LP wording) — confirm.
3. Lab vignettes: honest TYPICAL sizes; the town/wilaya/country scenes must not draw named borders (political maps) — stylised coast and
   relief only. Confirm that 17 vignettes is the expected finish (fallback: 9 vignettes for n ∈ {−7, −5, −3, −1, 0, 1, 3, 6, 7, 9} and the
   nested grid elsewhere).
4. `self-2` (10^4 misprint, intended 10⁻⁴) and the prefix table misprints (p. 52) are not reproduced; noted in the extraction discrepancies.
5. The edge P3 ← `1am_kusur-ashriya-kitaba_P4` is the first 1AM → 3AM LP edge of this unit — confirm.

## 11. Generator checklist

- [ ] Re-read pp. 39, 40, 42, 43, 46, 49 at 220 dpi; set `verified: True` on the cited elements; move destinations; re-run `build-extraction.py`.
- [ ] `packages/core/arithmetic/tenPowers.js` + test (L1 functions of the README table), imported by path.
- [ ] Lab: type in `packages/core/curriculum/manipulationTypes.js`, theme `science-lens` in `VISUAL_THEMES`, `levels.js` preset (`zoom` مبتدئ /
      متقدم numbers above) + `levels.test.js`, registry entry, `logic/tenZoom.js` + `tenZoom.test.js` (verdicts, prediction judging, `coachOf`
      followed to the end of every task), `operations/tenZoom.render.test.jsx` (« opens on its CONTEXT then ONE question », « says each thing
      ONCE », keyboard + / −), strings `tenZoom` namespace, contract section in MANIPULATION_CONTRACT (next free §2… number) + DNA §15 row.
- [ ] Lesson files (config header with the design choice and rejected candidates, 9 modules, knowledge.jsx with predictPrompts,
      knowledgeGraph.js, content/{textbook,exercises,problems}.js + content.test.js and problems.test.js with INDEPENDENT BigInt arithmetic).
- [ ] « أستعدّ »: `_unit/prepDiagnostic.test.js` passes (it compares with the unit's `available` lessons).
- [ ] e2e `apps/web/e2e/lesson-kit/3am-quwa-nisbiya-quwa-adad-ashara.mjs` (every module at 768 and 1280, lab by keyboard and touch, the glance at
      five sizes, nothing above the lab, bricks absent before answers).
- [ ] Screenshots of the lab (initial, overshoot refusal, a stamp, formal phase) at 768×1024, 1024×768, 1280×800, 1366×768 — looked at, iterated.
- [ ] `npm run generate:lesson-index`, `npm test`, `npm run check:lessons` (validate:lessons, predict prompts, entry budget ≤ 330 KB), `npm run build`.
- [ ] Catalogue: final pointsToLearn, `pointPrerequisites`, `status: available`, `durationMinutes` ≤ 90 (module total), `difficulty: 'سهل'`, `icon: '🔭'`.
- [ ] Coordinator: guide §11 « Publish a lesson » (export/import, local DB publish of lesson + 9 modules + 50 exercises, commit, push `dev`).

## 12. Generator notes (2026-10-26)

- **Net** (README issue 1) applied by the coordinator before generation: `r01 → r03`, `r02 → r04`, `kitaba-ilmiya-rutba` lists `qawaid-quwa-ashara`. « أستعدّ » therefore measures only the review link `1am.m1.r03` plus `maqlub` and `wahdat` (platform additions, not blocking).
- **Extraction** re-read at 220–500 dpi (pp. 39, 40, 42, 43, 46, 49): the plan's reading of `ex-5` / `ex-6` / `ex-10` was wrong in the details (§ 4 table row ex-5: the last three denominators are `10^-4`, `10^-6`, `10^-9`; ex-6 has `1/10^+5`; ex-10 is `1 mL = 10^-2 dL` and `1 cm³ = 10^-9 dam³`); `ex-13` re-destined to `qawaid-quwa-ashara` (pending: it needs a product); `ex-63/64/68/69` are `notIntegrated` (not destined to the synthesis); `self-2` (`10 ⁴`) is read `10⁻²` in the test (E2) and cited with `self-3`.
- **Module 1** teaches P1, P2 AND P3 (Q2 « why six zeros » is P3), not P1 P2 only. The coach has the steps `predict · ring · plate · dock · next · free` (the plan's `card` step is dropped: it could not end by a gesture; `dock` is added: nothing else showed where to confirm). The lab's `discovery` is `count` for مبتدئ and `rank` for متقدم (one each, instead of two in a level).
- **Boundary**: the plan's bank option « 10³ × 10² » for ex-8 (§ 9 L4) and the sentence « 10⁴ mm in m » were changed to decimal / factor-count forms (they break the README boundary).
- **Knowledge map**: the « empty rank » mistake node was dropped (it failed the 328 / 400 px layout test); `GUIDE.mafkuk` still feeds the module-3 explanation.
- **Catalogue**: `icon` 🔭, `durationMinutes` 62, `difficulty` سهل; final الكفاءات wording as proposed in § 2 with P3 extended by names and prefixes (owner question 2 of § 10: kept, to confirm).
- **Vignettes** (§ 10 question 3): all 17 are drawn (n from −7 to 9), sizes typical and labelled « حجمه تقريبي » where needed; no political borders (coast and relief only).
