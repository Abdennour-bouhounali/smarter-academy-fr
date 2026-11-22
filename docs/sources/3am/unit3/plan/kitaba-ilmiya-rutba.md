# Plan — `kitaba-ilmiya-rutba` « الكتابة العلمية ورتبة القدر » (3AM unit 3, entry 3 of 4)

Read the unit README first. Generated AFTER `quwa-adad-ashara` and `qawaid-quwa-ashara`.

## 1. Identity

- Code `kitaba-ilmiya-rutba`, title « الكتابة العلمية ورتبة القدر », unit `quwa-nisbiya`, catalogue order 12, kind `lesson`.
- Folder `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/quwa-nisbiya/kitaba-ilmiya-rutba/`.
- Textbook: opener p. 38 (`opener`, astronomical unit 149 597 870,700 km ≈ 150 million km), activity 5 p. 41 (`act-5`: 16 384 × 31 250
  with/without calculator; planets' distances and three pupils' writings 150 × 10⁶ / 15 × 10⁷ / 1,5 × 10⁸; « a × 10ⁿ with one non-zero digit
  before the comma »; orders of magnitude of a sand grain, a bacterium, a carbon atom), معارف 4–5 p. 44 (`know-4` scientific writing,
  `know-5` bracket and order of magnitude), طرائق p. 45 (`method-45a`, `method-45b`), دوري الآن ① p. 45 (`now-45` item 1), exercises `ex-21` …
  `ex-33` p. 47–48, `ex-52`, `ex-54`, `ex-57` … `ex-62` p. 50–51, `ex-65`, `ex-66`, `ex-67`, `ex-70` p. 51, أؤكّد `self-12` … `self-21` p. 49.
  All `verified: False` (several exponent doubts: ex-23, ex-24, ex-32, ex-52, ex-62): re-read pp. 38, 41, 44, 45, 47, 48, 49, 50, 51 at 220 dpi.
- Does not seed. Moves its pending destinations. `ex-61` (Pythagoras — 3AM `khassiyat-fitaghuras`, published but later in the book) and
  `ex-62` (Thales — 4AM) need tools this lesson does not own → bank `adapted` only if the step is given, else `notIntegrated` with the reason (coordinator decision).

## 2. Programme & net

- Items: `3am.m3.r04` « تعيين الكتابة العلمية لعدد عشري. » · `3am.m3.r05` « استعمال الكتابة العلمية لحصر عدد عشري ولإيجاد رتبة مقدار عدد. »

| LP | Draft | Final (proposed) | Why |
|---|---|---|---|
| P1 | تعيين الكتابة العلمية لعدد عشري $a\times 10^n$ حيث $1\le a<10$ | تعيين الكتابة العلمية لعدد عشري: $a\times10^n$ حيث $1\le a<10$ (و $a$ مسبوق بإشارته إن كان العدد سالبًا) و $n$ عدد صحيح نسبي، انطلاقًا من كتابته العشرية أو من كتابة مثل $35{,}2\times10^4$ أو من نتيجة حساب بقوى العدد 10 | the three sources of the term exams; the sign covers ex-54 (−65 000 000) |
| P2 | حصر عدد عشري بين قوتين متتاليتين للعدد 10 انطلاقا من كتابته العلمية | حصر عدد عشري موجب بين قوتين متتاليتين للعدد 10 انطلاقًا من كتابته العلمية: إذا كان $A=a\times10^n$ فإنّ $10^n\le A<10^{n+1}$ | « موجب » (a bracket of a negative number is not in the book) |
| P3 | إعطاء رتبة قدر عدد ومقارنة مقادير كبيرة أو صغيرة جدا | إعطاء رتبة قدر عدد موجب $a'\times10^n$ حيث $a'$ مدوّر $a$ إلى الوحدة، واستعمال الكتابة العلمية لمقارنة مقادير كبيرة جدًا أو صغيرة جدًا وترتيبها | states the book's definition (know-5) — not « the nearest power » |

- Review items for « أستعدّ »: `1am.m1.r06` « تحديد رتبة مقدار لنتيجة حساب على الأعداد العشرية. » — home `rutbat-miqdar-jam` (1AM, **planned**,
  link `extends`) ; `3am.m3.r03` « كتابة عدد عشري باستعمال قوى 10. » — home `quwa-adad-ashara` (sibling, published before this one). With the
  README's recommended net edit, `3am.m3.r02` (rules, `qawaid-quwa-ashara`) is also a review item: measure it too (the plan's « أستعدّ » does).
- **noRebuild** (`extends` 1am.m1.r06 → 3am.m3.r05, added value « رتبة مقدار عدد بالكتابة العلمية، وحصره بين قوّتين للعدد 10. »): the lesson
  RECALLS the 1AM idea in a « تذكّر » box (« رتبة المقدار قيمة قريبة سهلة الحساب نتحقّق بها من نتيجة: $4\,987+3\,012$ قريب من $5\,000+3\,000=8\,000$ »)
  and builds ONLY the scientific-writing order of magnitude and the bracket. The 1AM lesson is unpublished: the box carries the recall itself,
  no link; « راجع » shows it « قريبًا ».
- pointPrerequisites: intra P2 ← P1, P3 ← P1. Cross-lesson along `3am.m3.r03 → 3am.m3.r04`: **P1 ← `3am_quwa-adad-ashara_P4`** (writing with
  powers of 10). With the net edit `r02 → r04`: **P1 ← `3am_qawaid-quwa-ashara_P4`** (computations a × 10ᵖ). No edge toward the 1AM lesson
  (draft LPs, LEARNING_NET §4.8).
- Where it leads: no net link toward 4AM, but the 4AM BEM exercise « أعط الكتابة العلمية للعدد B » (`tawzif-khawass-judhur` exercises, BEM
  annals) and 4AM sciences use it constantly; inside the unit, the synthesis.

## 3. Boundary

Owns: normalising to 1 ≤ a < 10 (from a decimal, from k × 10ᵖ, from a computation); recognising a scientific writing; the bracket
10ⁿ ≤ A < 10ⁿ⁺¹; the order of magnitude a' × 10ⁿ (a' = round half up of a; a' = 10 is written 1 × 10ⁿ⁺¹); comparing and ordering with
these. Uses (recalls, never re-teaches): the three rules (`qawaid-quwa-ashara`), the decimal writing of 10ⁿ (`quwa-adad-ashara`), rounding
to the unit (« المدوّر إلى الوحدة », earlier years), the 1AM « رتبة مقدار ». Does NOT do aⁿ for a ≠ 10, nor geometry (Thales/Pythagoras
exercises ex-61/ex-62 are bank material with the geometric step given).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| opener p. 38 | the astronomical unit, « ≈ 150 million km » | huge numbers need a compact writing | not reused (the Sun–Earth distance is also act-5 / now-45): the platform uses its own objects |
| act-5 1) | 16 384 × 31 250 on a calculator, then 163 840 × 312 500 without | the calculator's E-notation, zeros added | REJECTED as entry (it is calculator reading); bank adapted (own factors) |
| act-5 2) | planets' distances in mixed writings; three pupils 150 × 10⁶ / 15 × 10⁷ / 1,5 × 10⁸ « who is right? »; normalise and order | ALL three are equal; only one is the scientific writing; ordering needs it | the « three writings » idea → نشاط Q1 (own object: the satellite's altitude) ; ordering → lab mission « compare » |
| act-5 3) | orders of magnitude in m of a sand grain 0,00025 m, a bacterium 0,2 µm, a carbon atom 0,14 nm | small sizes, prefixes | own small objects in the lab (sugar grain 0,0006 m, hair 0,000048 m …) |
| know-4, know-5 p. 44 | definition; bracket; order of magnitude a' × 10ⁿ; examples Earth–Moon 384 400 km, virus 149 nm, Mars 227,9 × 10⁶ km | — | معارف boxes rewritten, OWN examples (Algeria's coastline, a pollen grain) |
| method-45a | 352 000 and 0,043: « by what do we multiply 3,52 to get 352 000? » (comma moved 5 ranks) | the comma move = the exponent | طريقة method A, own numbers |
| method-45b | 526 000 000 and 0,00027: scientific, bracket, order | the full three-step exercise = the term-exam pattern | طريقة method C |
| now-45 ① | Earth–Sun 149,59789 × 10⁶ km; carbon mass 199 × 10⁻²⁸ kg | from k × 10ᵖ | طريقة method B (own numbers) |
| ex-21 … ex-26 | complete … × 10ⁿ; is it scientific?; equal writings; a × 10⁶; 68 × 10ⁿ; give the scientific writing | normalisation | M2 « هل هي كتابة علمية؟ », أتمرّن batches (own numbers) |
| ex-27 … ex-29 | T/F comparisons, ordering six numbers | compare n then a | أتمرّن (own) |
| ex-30, ex-31, ex-52 | compute then write in scientific | the term-exam pattern | طريقة method D, M7 |
| ex-32, ex-33 | planets' minimal distances: scientific, bracket, order; order of A × B, A/B | full chain | bank (own objects) |
| ex-54, ex-57 … ex-60, ex-65 … ex-67, ex-70 | real quantities: age of the Earth, heartbeats in a life, blinks, Earth's areas, light-year, data storage | real orders of magnitude | M5/M6 contexts (own: breaths per year, a satellite, a pollen grain); bank adapted |
| ex-61, ex-62 | Pythagoras / Thales with big numbers | — | bank adapted only with the geometric step GIVEN, or `notIntegrated` |
| self-12 … self-21 | QCM scientific / order / bracket / ordering | — | إختبار أولي inspiration (own numbers); self-11 (36 million) went to L1 |

## 5. Design

**The lesson in one paragraph.** Every positive number sits between two consecutive powers of ten — on ONE rung of the ladder
[10ⁿ ; 10ⁿ⁺¹[ — and inside its rung it is a × 10ⁿ with a from 1 to (not including) 10: that writing is the scientific writing, it is unique,
and it can be read off the rung (n) and the place on the rung (a). 35,2 × 10⁴ is not « on rung 4 »: it equals 352 000, which is on rung 5,
so it is written 3,52 × 10⁵. The bracket is the rung itself (10⁵ ≤ 352 000 < 10⁶), and the order of magnitude is the nearest whole mark of the
rung (a rounded to the unit: 3,52 → 4, so 4 × 10⁵). To compare two numbers you compare rungs first, then places — 9,8 × 10⁻⁵ < 1,2 × 10⁻⁴
although 9,8 > 1,2.

**Entry point.** Book activity 5-2 (planets and three pupils) vs platform situation « the science-fair wall »: a vertical ladder of
decades (each rung from 1 × 10ⁿ to 10 × 10ⁿ, log-spaced marks 2 … 9) where cards of real lengths — the minaret of Djamaa El Djazaïr 265 m, a
bus trip of 1 950 000 m, a notebook sheet 0,0001 m, a sugar grain 0,0006 m — must be hung. A card only docks on its own rung; slid inside
the rung, it stops in its cell and the scientific writing writes itself; a magnet snaps it to the nearest whole mark: the order of
magnitude. The normalisation 1 ≤ a < 10 becomes NECESSARY: a card « 35,2 × 10⁴ م » refuses rung 4. Chosen: the wall — it makes the three
الكفاءات one gesture (rung = n = bracket; cell = a; magnet = order) and the comparison visible (higher = bigger).

**Order of ideas.** (M1) hang decimal cards → rung = bracket, cell = a → « why 2,65 × 10² and not 26,5 × 10¹ » → magnet = order of
magnitude → compare two cards · (M2) definitions + « is it a scientific writing? » + the 1AM recall · (M3) the four methods (decimal; k × 10ᵖ;
bracket + order; compute then write) · (M4) practice · (M5–M7) problems (satellite, microscope, term-exam exercise) · (M8) test.

**Story contexts (own numbers).** The science fair of the متوسطة; the minaret of Djamaa El Djazaïr (265 m); a bus trip Algiers → far south
(≈ 1 950 km); Algeria's coastline (≈ 1 200 km); the Earth's diameter (12 742 km); Alcomsat-1, Algeria's geostationary satellite (altitude
≈ 36 000 km); a pollen grain (0,000025 m), a bacterium (0,000002 m), a virus (0,00000012 m); breaths in a year.

## 6. Lab — `size-ladder` « سلّم الأحجام »

- **Type** `size-ladder` (free); `manipulations/operations/SizeLadder.jsx` on `logic/sizeLadder.js`; theme `fair-wall` (new: kind `objects`,
  shows « جدار معرض وسلّم وبطاقات »); strings `lesson.manipulation.json › sizeLadder`.
- **Drawn world.** The science-fair corridor: a tall painted wall with a wooden LADDER of rungs (the visible window shows 4–6 rungs around
  the active card and scrolls smoothly; the whole ladder spans 10⁻⁹ … 10¹² m in the free panel). Each rung is a horizontal wooden board, its
  left end labelled « $10^n$ م » and its right end « $10^{n+1}$ م », with nine cells between the whole marks 1 · 2 · … · 9 · 10 placed
  LOGARITHMICALLY (honest: the cell 1–2 is wider than 9–10; draw a thin « 0,5 » hairline in each cell for the rounding boundary of the magnet,
  label it only after the discovery). Object CARDS (illustrated: the minaret, a bus, a sheet, a sugar grain…) with their length on a tag in
  the given writing. A girl `KidFigure` in hijab (« ليلى », exhibitor) beside the wall reacts.
- **The variable in the hand: the card's POSITION on the ladder** — first its RUNG n (drag up/down), then its CELL (slide left/right on the
  rung: the integer part of a), then the MAGNET (a toggle on the card: snaps to the nearest whole mark = a'). Gesture family **DRAG-AND-DOCK
  on a continuous scale** (drag; tap a rung then tap a cell; keyboard ↑ ↓ rungs, ← → cells, M magnet, Enter validate).
- **What the world shows.** A card hovering a WRONG rung glows red and will not dock; on release it slides back with a calculation verdict
  (« 265 ≥ 1 000؟ لا: البطاقة أصغر من $10^3$ م ، فدرجتها تحت » / « 35,2 × 10⁴ = 352 000 ≥ 10⁵ : درجتها فوق »). On its rung, while sliding, the
  cell under it lights up; docked in its cell (the cell must contain the exact a — computed by `scientific`), the tag rewrites itself as
  « 2,65 × 10² م » (مبتدئ: automatically; متقدم: the student types a and n first, judged). The magnet makes the card jump to the nearest whole
  mark and its tag shows « ≈ 3 × 10² م » (an a = 9,7 card jumps to the 10 mark = the start of the next rung: « ≈ 1 × 10³ »). In a compare
  mission, the two cards hang at their places and the higher one gets a crown.
- **Opening (no title).** Context: « في معرض العلوم بالمتوسطة جدار عليه سلّم: كل درجة تبدأ عند قوة للعدد 10 وتنتهي عند القوة الموالية. »
  Question: « علّق كل بطاقة على درجتها ثم في خانتها حتى تُكتب كتابتها العلمية. »
- **مبتدئ** (decimal tags; the scientific writing appears by itself; magnet introduced at card 3): C1 « منارة جامع الجزائر: 265 م » → rung 2,
  cell 2, 2,65 × 10² · C2 « رحلة حافلة من الجزائر العاصمة إلى أقصى الجنوب: 1 950 000 م تقريبًا » → rung 6, cell 1, 1,95 × 10⁶; magnet → 2 × 10⁶
  · C3 « سُمك ورقة كرّاس: 0,0001 م » → rung −4, cell 1, 1 × 10⁻⁴ (the card sits ON the left end: 10⁻⁴ ≤ A) ; magnet → 1 × 10⁻⁴ · C4 compare
  « حبّة سكّر 0,0006 م » vs the sheet → both rung −4, sugar further right: bigger. End: four stamps.
- **متقدم** (tags in non-scientific forms or other units; the student types a and n before docking; magnet on every card): C5 « طول الساحل
  الجزائري: حوالي 1 200 كم » → 1,2 × 10⁶ م (order 1 × 10⁶) · C6 « سُمك شعرة: 0,048 × 10⁻³ م » → 4,8 × 10⁻⁵ (order 5 × 10⁻⁵) · C7 « قطر الأرض:
  12 742 كم » → 1,2742 × 10⁷ م (order 1 × 10⁷) · C8 compare « $9{,}8\times10^{-5}$ م » vs « $1{,}2\times10^{-4}$ م » → rungs −5 < −4: the second is bigger
  although 9,8 > 1,2. End: four stamps.
- **« جرّب أعدادك » (always open).** Type a positive decimal (≤ 15 significant digits) or « k × 10^p » (k decimal, |p| ≤ 12), result within
  10⁻⁹ … 10¹²; a plain card is made; the student hangs it. Refusal line for 0, negatives (« السلّم للأعداد الموجبة ») and out-of-range.
- **LabCoach:** (1) the card « هذه بطاقتك: طولها مكتوب عليها. » (2) drag up/down « اسحبها إلى درجتها. » (3) slide « حرّكها داخل الدرجة إلى
  خانتها. » (4) magnet « شغّل المغناطيس لتقترب البطاقة من أقرب تدريجة. » (5) متقدم input « اكتب كتابتها العلمية قبل أن تعلّقها. » (6) free
  panel « اكتب عددًا من اختيارك. »
- **Misconceptions made VISIBLE.** n = number of digits (265 → 3: the card refuses rung 3); « k × 10ᵖ is scientific whatever k » (35,2 × 10⁴
  refuses rung 4); comma direction for small numbers (0,048 × 10⁻³ typed 4,8 × 10⁻¹: refused with « 4,8 × 10⁻¹ = 0,48 ≠ 0,000048 »); the order of
  magnitude by truncation (2,65 → 2: the magnet jumps to 3); comparing a's across rungs (C8).
- **Discovery.** D1 « متى تكون الكتابة $a\times10^n$ هي الكتابة العلمية؟ » ✓ « عندما تقع البطاقة على الدرجة $10^n$ نفسها: $1\le a<10$ » ✗ « عندما
  يكون a عددًا طبيعيًا » (refuted: 35 × 10⁴ refused on rung 4) ✗ « عندما يكون n موجبًا » (refuted: the sheet docks on rung −4). D2 « رتبة قدر
  البطاقة: » ✓ « أقرب تدريجة كاملة على درجتها: نقرّب a إلى الوحدة » ✗ « نحذف ما بعد الفاصلة من a » (refuted: 2,65 → 3) ✗ « القوة التالية $10^{n+1}$ ».
  `discoveryReady` = all cards of the level stamped. Formal: $265=2{,}65\times10^2$ ؛ $10^2\le265<10^3$ ؛ رتبة القدر $3\times10^2$.
- **Events:** `{kind:'hover', task, rung}` · `{kind:'refused', task, rung, reason:'below'|'above'|'typed', value}` · `{kind:'dock', task, n, a}` ·
  `{kind:'magnet', task, a1, n1}` · `{kind:'typed', task, a, n, ok}` · `{kind:'compare', task, winner}` · `{kind:'solved', task, sci, order}` ·
  `{kind:'custom', value}`. DOM: `[data-size-ladder][data-task]`, `[data-sl-glance]`, `[data-sl-rung=<n>]`, `[data-sl-cell=<n>:<k>]`,
  `[data-sl-card=<id>][data-docked]`, `[data-sl-tag]`, `[data-sl-magnet]`, `[data-sl-input]`, `[data-sl-free]`, `[data-sl-formal]`.
- **Core maths:** `tenPowers.js` — `parseDec`, `scientific`, `isScientific`, `bracketOf`, `orderOfMagnitude`, `compareDec`, `logPos` (view only).
  `logic/sizeLadder.js`: `rungOf(card)`, `cellOf(card)`, `canDock(card, rung)`, `magnet(card)`, `verdict`, `coachOf`.
- **Why not another lab (DNA §12).** `pin-rails` (3AM): a pin slides along a LINEAR price rail to a value read on a squared frame — here the
  scale is LOGARITHMIC by decades, the docking refuses a whole rung (the bracket), and the place inside a rung IS the mantissa a; no frame, no
  line through nodes. `ruler-compare` (1AM): the hand picks a graduation to separate two decimals — here nothing is graduated finer: the card
  is hung on a multiplicative scale and the order of magnitude is a magnet. `decimal-comma`: no digit string, no comma handle; the
  normalisation emerges from where the card fits. `ten-zoom` (this unit): a lens rescales ONE view (the hand holds n of a frame); here many
  numbers live on one fixed ladder (the hand holds a card's position). Gesture family DRAG-AND-DOCK, distinct from the unit's rotate/pinch and
  stretch.
- **Screen budget.** The ladder window shows 5 rungs at 768×1024 (rung height ≈ 110 px, cells ≥ 28 px wide at the narrow end) and 4 rungs at
  1024×768 (lesson column ≈ 414 px: rung width ≈ 380 px, cell 9–10 ≈ 18 px → the magnet hairlines are drawn but the 9–10 cell gets a magnifier
  bubble when the card hovers it). The card tray sits above the ladder window; the glance (tray + window + magnet + input) fits the height at
  the five sizes; the window scrolls itself, never the page.

## 7. Modules (standard 9)

**M0 أستعدّ** (6 min). Seven statements; skills `rutbat-miqdar` (1am.m1.r06, platform wording), `mudawwar` (rounding, platform),
`kitaba-quwa` (r03, `quwa-adad-ashara`), `qawaid-ashara` (r02, if the net edit is made):
1. « رتبة مقدار $4\,987+3\,012$ هي $8\,000$ » ✓ (5 000 + 3 000). 2. « مدوّر $6{,}48$ إلى الوحدة هو 6 » ✓. 3. « مدوّر $3{,}5$ إلى الوحدة هو 3 » ✗ (4).
4. « $52\,000=52\times10^3$ » ✓. 5. « $0{,}007=7\times10^{-2}$ » ✗ ($7\times10^{-3}$). 6. « $10^{-4}<10^{-3}$ » ✓. 7. « $10^{2}\times10^{-6}=10^{-4}$ » ✓ (`qawaid-ashara`).

**M1 نشاط — سلّم الأحجام** (`trigger`, P1 P2 P3, 14 min). `objectives`: « على أيّ درجة تُعلَّق البطاقة؟ », « لماذا $2{,}65\times10^2$ وليس
$26{,}5\times10^1$ ؟ », « ماذا يفعل المغناطيس؟ », « أيّ البطاقتين أكبر؟ ».
- Q1 (P1) evidence C1. « على الدرجة $10^2$ كُتبت البطاقة $2{,}65\times10^2$ . لماذا لا نكتبها $26{,}5\times10^1$ ؟ » ✓ « لأنّ 26,5 ليس من 1 إلى أقل من
  10: على كل درجة يكون العدد الأوّل كذلك » · « لأنّ $26{,}5\times10^1$ لا يساوي 265 » · « لأنّ الأس هو عدد أرقام العدد ». Brick `kitaba-ilmiya` (predictPrompt).
- Q2 (P2) evidence C3. « سُمك الورقة $1\times10^{-4}$ م. بين أيّ قوتين؟ » ✓ $10^{-4}\le0{,}0001<10^{-3}$ · $10^{-5}\le0{,}0001<10^{-4}$ · $10^{-3}\le0{,}0001<10^{-2}$.
  Brick `hasr-quwatayn`.
- Q3 (P3) evidence magnet on C1. « رتبة قدر 265 م هي: » ✓ $3\times10^{2}$ م · $2\times10^{2}$ م · $10^{3}$ م. Brick `rutbat-qadr` + « تذكّر » box (1AM recall, noRebuild).
- Q4 (P3) evidence C8 (متقدم). « أيّهما أكبر: $9{,}8\times10^{-5}$ أم $1{,}2\times10^{-4}$ ؟ » ✓ $1{,}2\times10^{-4}$ (درجته أعلى) · $9{,}8\times10^{-5}$ (لأنّ 9,8 > 1,2) ·
  متساويان. Brick `muqarana-ilmiya`.

**M2 معارف** (`discovery`, P1 P2 P3, 12 min). No lab. Track: a batch « هل هي كتابة علمية؟ » first (`act-5` idea, own numbers): $0{,}72\times10^{5}$ ✗ ·
$7{,}2\times10^{4}$ ✓ · $10\times10^{3}$ ✗ · $1\times10^{-6}$ ✓ · $9{,}99\times10^{8}$ ✓ · $45\times10^{-2}$ ✗ ; then boxes (`src('know-4'|'know-5', 44, 'معارف')`, platform wording):
definition (examples: Algeria's coastline $1\,200\ \mathrm{km}=1{,}2\times10^{6}\ \mathrm{m}$ ; a pollen grain $0{,}000025\ \mathrm{m}=2{,}5\times10^{-5}\ \mathrm{m}$), the bracket, the
order of magnitude (with « a' = 10 → $1\times10^{n+1}$ » remark: $9{,}7\times10^{3}$ → $1\times10^{4}$), the comparison rule (rung first). « أتوقّع القاعدة »
on the bracket.

**M3 طريقة** (`formalization`, P1 P2 P3, 12 min). Methods (`src('method-45a'|'method-45b', 45, 'طرائق')`, `src('now-45', 45, 'دوري الآن', 1)`):
- A (from a decimal): $A=47\,300\,000=4{,}73\times10^{7}$ (comma moved 7 ranks left) ; $B=0{,}000608=6{,}08\times10^{-4}$ (4 ranks right).
- B (from k × 10ᵖ, rules recalled): $C=528\times10^{-6}=5{,}28\times10^{2}\times10^{-6}=5{,}28\times10^{-4}$ ; $D=0{,}039\times10^{9}=3{,}9\times10^{-2}\times10^{9}=3{,}9\times10^{7}$.
- C (bracket and order): $10^{7}\le A<10^{8}$, order $5\times10^{7}$ ; $10^{-4}\le B<10^{-3}$, order $6\times10^{-4}$.
- D (compute then write — the term-exam pattern): $E=\frac{6\times10^{5}\times1{,}5\times10^{-2}}{4{,}5\times10^{-3}}=\frac{9}{4{,}5}\times10^{5-2+3}=2\times10^{6}$.
- Questions: scientific of $0{,}00052$ ✓ $5{,}2\times10^{-4}$ · $52\times10^{-5}$ · $5{,}2\times10^{-3}$ · $0{,}52\times10^{-3}$ — $2\,500\times10^{-7}$ ✓ $2{,}5\times10^{-4}$ ·
  $2{,}5\times10^{-10}$ · $2{,}5\times10^{-3}$ — order of $7{,}62\times10^{9}$ ✓ $8\times10^{9}$ · $7\times10^{9}$ · $10^{10}$ — $F=3\times10^{4}\times8\times10^{-9}$ scientific ✓
  $2{,}4\times10^{-4}$ · $24\times10^{-5}$ · $2{,}4\times10^{-5}$ · $2{,}4\times10^{-36}$. Brick `tariqa-ilmiya`.

**M4 أتمرّن** (P1–P3, 13 min):
- complete (ex-21): $8\,451=\ldots\times10^{3}$ → 8,451 · $0{,}2463=\ldots\times10^{-2}$ → 24,63 · $5\,380{,}4=53{,}804\times10^{?}$ → 2 · $0{,}73=0{,}00073\times10^{?}$ → 3.
- scientific (ex-26): $608\,000$ → $6{,}08\times10^{5}$ · $0{,}047$ → $4{,}7\times10^{-2}$ · $795\,312$ → $7{,}95312\times10^{5}$ · $0{,}86$ → $8{,}6\times10^{-1}$ · $302\,500\,000$ →
  $3{,}025\times10^{8}$ · $0{,}0000419$ → $4{,}19\times10^{-5}$.
- T/F compare (ex-27/28): $17\times10^{3}>15\times10^{4}$ ✗ · $4{,}2\times10^{5}>6{,}1\times10^{4}$ ✓ · $23\times10^{8}>1{,}9\times10^{9}$ ✓ · $3{,}4\times10^{5}>0{,}62\times10^{7}$ ✗ ·
  $7\times10^{-3}>6\times10^{-4}$ ✓ · $8{,}9\times10^{-5}>4{,}6\times10^{-4}$ ✗.
- ordering (ex-29), ascending: $130{,}05\times10^{2}$ ; $1\times10^{4}$ ; $67{,}8\times10^{3}$ ; $9\,263$ ; $112\,486\times10^{-1}$ ; $0{,}08888\times10^{5}$ → $0{,}08888\times10^{5}$ (8 888) <
  $9\,263$ < $1\times10^{4}$ < $112\,486\times10^{-1}$ (11 248,6) < $130{,}05\times10^{2}$ (13 005) < $67{,}8\times10^{3}$ (67 800).
- compute then write (ex-30/31): $2\,500\times6\,000$ → $1{,}5\times10^{7}$ · $0{,}0004\times0{,}002$ → $8\times10^{-7}$ · $\frac{48\,000\,000}{0{,}0006}$ → $8\times10^{10}$.
- real quantity (ex-57/59 idea): « يتنفّس الإنسان حوالي 15 مرّة في الدقيقة: كم مرّة في سنة من 365 يومًا؟ » → $15\times60\times24\times365=7\,884\,000=7{,}884\times10^{6}$, order $8\times10^{6}$.

**M5 مسألة 1 — مسألة الدرس « ألكوم سات 1 »** (`lessonProblem`, P1 P2 P3, 8 min; illustration `scene` Earth + satellite). « يدور القمر الصناعي
الجزائري ألكوم سات 1 على ارتفاع حوالي 36 000 كم فوق خط الاستواء، وتنتقل إشارته بسرعة حوالي $3\times10^{8}$ م في الثانية. » 1) altitude in m
→ $36\,000\,000$ م $=3{,}6\times10^{7}$ م. 2) bracket → $10^{7}\le h<10^{8}$. 3) time for the signal to come down: $\frac{3{,}6\times10^{7}}{3\times10^{8}}$ → $1{,}2\times10^{-1}$ s
(0,12 s). 4) order of magnitude of that time → $1\times10^{-1}$ s.

**M6 مسألة 2 — تحت المجهر** (P1 P3, 8 min; illustration `tags`). « حبّة طلع قطرها $0{,}000025$ م، وبكتيريا طولها $0{,}000002$ م، وفيروس قطره
$0{,}00000012$ م. » 1) scientific: $2{,}5\times10^{-5}$ ; $2\times10^{-6}$ ; $1{,}2\times10^{-7}$. 2) ascending order → virus < bacterium < pollen. 3) bacteria side
by side across the pollen grain: $\frac{2{,}5\times10^{-5}}{2\times10^{-6}}=12{,}5$ → order $1\times10^{1}$. 4) bracket of the virus → $10^{-7}\le v<10^{-6}$.

**M7 مسألة 3 — على منوال اختبار الفصل** (P1 P2 P3, 8 min; illustration `tags` A, B). « $A=\frac{2{,}4\times10^{-3}\times5\times10^{8}}{3\times10^{2}}$ و
$B=0{,}000325\times10^{9}$ . » 1) A scientific → $4\times10^{3}$ ; B → $3{,}25\times10^{5}$. 2) bracket of B → $10^{5}\le B<10^{6}$. 3) orders: A $4\times10^{3}$ ; B
$3\times10^{5}$. 4) order of $A\times B=1{,}3\times10^{9}$ → $1\times10^{9}$.

**M8 إختبار أولي** (5 items): E1 (P1) « الكتابة العلمية لـ $6\,040\,000$ » ✓ $6{,}04\times10^{6}$ · $604\times10^{4}$ · $6{,}04\times10^{5}$ · $6{,}04\times10^{7}$.
E2 (P1) « الكتابة العلمية لـ $0{,}035\times10^{-2}$ » ✓ $3{,}5\times10^{-4}$ · $3{,}5\times10^{0}$ · $35\times10^{-5}$ · $3{,}5\times10^{-3}$. E3 (P2) « عدد محصور بين $10^{-3}$ و
$10^{-2}$ » ✓ $0{,}0042$ · $0{,}042$ · $4{,}2\times10^{-4}$ · $42\times10^{-2}$. E4 (P3) « رتبة قدر $0{,}000786$ » ✓ $8\times10^{-4}$ · $7\times10^{-4}$ · $8\times10^{-3}$ · $1\times10^{-3}$.
E5 (P3) « $A=5{,}1\times10^{-6}$ ، $B=48\times10^{-7}$ ، $C=0{,}6\times10^{-5}$ : الترتيب التصاعدي » ✓ $B<A<C$ · $A<B<C$ · $C<A<B$ · $B<C<A$.

## 8. Misconceptions

| Id | Wrong belief | Lab | Caught by |
|---|---|---|---|
| MISC-ILMIYA-RAQAM | n = number of digits (265 → 10³) | refused on rung 3 | M1 Q1, E1 (10⁷) |
| MISC-ILMIYA-K | any k × 10ᵖ is scientific (604 × 10⁴, 35 × 10⁻⁵) | 35,2 × 10⁴ refused on rung 4 | M2 batch, E1, E2 |
| MISC-ILMIYA-FASILA | wrong direction for the exponent when moving the comma (0,00052 → 5,2 × 10⁻³ or 10⁰ after « adding ») | typed refusal with the value | M3 Q, E2 |
| MISC-ILMIYA-HASR | bracket shifted by one (10⁻⁵ ≤ 0,0001 < 10⁻⁴) or strict/large bounds swapped | the sheet card sits ON the left end | M1 Q2, E3 |
| MISC-ILMIYA-BATR | order of magnitude by truncation (7,86 → 7) | magnet jumps to 3 for 2,65 | M1 Q3, M3 Q, E4 |
| MISC-ILMIYA-QUWA | order of magnitude = the next power (265 → 10³) | — | M1 Q3, E4 |
| MISC-ILMIYA-MUQARANA | compare the a's without the rungs (9,8 × 10⁻⁵ > 1,2 × 10⁻⁴) | crown on the higher card | M1 Q4, M4 T/F, E5 |

## 9. Practice bank (`content/practice/3am/kitaba-ilmiya-rutba/`)

- **Corpus (16 exercises hit r04/r05; text layers vary — read the « none/poor » papers VISUALLY):** `3am-s1-3` ex1 q2 (table: 46 000 000 →
  $4{,}6\times10^{7}$, order $5\times10^{7}$, $10^{7}\le A<10^{8}$ ; 0,00167 → $1{,}67\times10^{-3}$, order $2\times10^{-3}$) · `3am-s1-4` ex2 · `3am-s1-113` ex2 ($B=5{,}4\times10^{8}$,
  $A=0{,}0036\times10^{-2}=3{,}6\times10^{-5}$, order of A $4\times10^{-5}$, $10^{8}\le B<10^{9}$) · `3am-s2-72` ex2 · `3am-s2-76` ex1 ($A=0{,}00045\times(10^{-6})^{-2}=4{,}5\times10^{8}$,
  $B=\frac{120\,000\times0{,}000003}{2\times10^{-5}}=1{,}8\times10^{4}$; orders $5\times10^{8}$, $2\times10^{4}$, $A\times B=8{,}1\times10^{12}$ → $8\times10^{12}$; $\frac{A}{B}=2{,}5\times10^{4}$ →
  $10^{4}\le\frac{A}{B}<10^{5}$) · `3am-s2-68` ex1 · `3am-s2-70` ex2 · `3am-s2-78` ex2 · `3am-s2-80` ex1 ($A=0{,}00135\times10^{6}=1\,350$ → $10^{3}\le A<10^{4}$ ;
  $B=\frac{72\times10^{2}\times5\times10^{4}}{14\times(10^{-2})^{3}}=2{,}571428\ldots\times10^{13}$ → order $3\times10^{13}$ ; C (fractions) `counted: false`) · `3am-s2-82` ex1 (B =
  $0{,}0000456\times10^{2}=4{,}56\times10^{-3}$; A: read the operators visually) · `3am-s2-83` ex2 · `2am-s2-65` ex2 (misfiled 3AM S2) · `3am-s2-75` ex1,
  `3am-s2-69` ex1, `3am-s3-51` ex1 (partial: other lessons' steps `counted: false`) · `3am-s2-83` ex5 (integration: an area in scientific writing,
  geometry steps given / `counted: false`). **Honest faithful `term_exam`: ≈ 13** (badges « الفصل الأول » for the 3am-s1 papers, « الثاني »
  3am-s2 and 2am-s2-65, « الثالث » 3am-s3-51).
- **Plan:** L1 scientific writing from decimals: 2 term_exam (3am-s1-3, 3am-s1-113) + 5 modelled (`3am-s1`) + 3 adapted (ex-26, self-12,
  self-17). L2 from k × 10ᵖ and « is it scientific? »: 2 term_exam (3am-s1-4, 2am-s2-65) + 5 modelled + 3 adapted (ex-21, ex-22, self-13/14).
  L3 bracket + order: 3 term_exam (3am-s2-72, -70, -78) + 4 modelled + 3 adapted (ex-32, method-45b, self-19/20). L4 compute then write,
  compare/order: 4 term_exam (3am-s2-76, -80, -82, -68) + 3 modelled + 3 adapted (ex-30, ex-31, ex-29). L5 real quantities and full
  term-exam exercises: 2 term_exam (3am-s2-83 ex2, 3am-s2-83 ex5) + 6 modelled + 2 adapted (ex-57, ex-66). ≈ 13 / 23 / 14.
- **Answer types:** a scientific writing asked as TWO answers (a as `rational`, n as integer) or `choice`; a bracket asked as n; an order of
  magnitude as (a', n) or `choice`; orderings as `choice`.
- **Oracle** `scripts/practice-oracle/kitaba-ilmiya-rutba.mjs`: own BigInt decimal code; recomputes every A from the statement's own
  expression, normalises (1 ≤ a < 10), brackets, rounds half up with the a' = 10 carry, checks orderings and every `choice` option (exactly one
  true). `MISC-ILMIYA-*`. Add to `active.json`, `exam-style.json`.

## 10. Risks & owner questions

1. **Order-of-magnitude convention**: the book's « a' = مدوّر a إلى الوحدة » (half up; 2,5 → 3; 9,7 → 10 → 1 × 10ⁿ⁺¹). Some teachers use « the
   nearest power of 10 ». The plan follows the book (know-5, method-45b) and makes « the next power » a misconception — confirm.
2. Negative numbers: P1 allows a sign (ex-54); the lab and P2/P3 are positive only — confirm.
3. `prerequisiteLessonCodes` should gain `qawaid-quwa-ashara` (README issue 2); « أستعدّ » item 7 measures r02 only if the net edit is made.
4. ex-61 / ex-62 need Pythagoras (3AM, later unit) / Thales (4AM): bank only with the geometric step given, or `notIntegrated` (coordinator).
5. Real-world values are rounded and introduced with « حوالي » (minaret 265 m, coastline ≈ 1 200 km, Alcomsat-1 ≈ 36 000 km, Earth's diameter
   12 742 km, typical micro sizes): keep « حوالي » in every student-visible string.

## 11. Generator checklist

- [ ] Re-read the cited pages at 220 dpi (exponent doubts listed in §1); verify; move destinations; re-run `build-extraction.py`.
- [ ] Extend `tenPowers.js` (+ tests) with `scientific`, `isScientific`, `bracketOf`, `orderOfMagnitude` (carry case tested), `compareDec`, `logPos`.
- [ ] Lab `size-ladder`: type, theme `fair-wall`, preset (مبتدئ C1–C4, متقدم C5–C8), registry, `logic/sizeLadder.js` + test (docking, cells,
      magnet incl. the 9,7 carry, typed answers, `coachOf` to the end), render test (context then ONE question; each thing once; keyboard),
      strings, contract section + DNA §15 row.
- [ ] Lesson files; the « تذكّر » 1AM box (noRebuild); predictPrompts; content tests with independent arithmetic; « أستعدّ » test.
- [ ] e2e `apps/web/e2e/lesson-kit/3am-quwa-nisbiya-kitaba-ilmiya-rutba.mjs`; screenshots (initial, a refused rung, a docked card with the magnet,
      compare crown, formal) at 768×1024, 1024×768, 1280×800, 1366×768.
- [ ] `generate:lesson-index`, `npm test`, `check:lessons`, `build`; catalogue (final LPs, edges, `available`, `durationMinutes` ≤ 90,
      `difficulty: 'متوسط'`, `icon: '🪜'`); coordinator publishes (guide §11).

## 12. Generator notes (2026-10-26)

Executed from the plan; the minimal fixes and choices below were recorded while generating.

1. **Extraction re-read** (120–220 dpi, pages 38, 41, 44, 45, 47, 48, 49, 50, 51): the elements of this lesson are `verified: True` in `build-extraction.py` (`READ_L3`). DEST moved: `know-4`, `know-5` → module 2; `method-45a/b`, `now-45` item 1 → module 3; `ex-21 … ex-31, 52, 57, 58, 59` → module 4; `self-12, 14, 19, 20, 21` → module 8; `ex-32, 33, 54, 60, 65, 66, 67, 70`, `self-13, 15, 16, 17, 18` → `practice`; `act-5` (module 1) and `opener` (cited as a trace, not reused) with `module: None`. **`ex-61` (Pythagoras) and `ex-62` (Thales) are `notIntegrated`** with their reason (the tool belongs to the published `khassiyat-fitaghuras` / to 4AM; no geometric step is given in the statement) — owner may revisit. Printed details: `act-5` prints Venus « 108,2 × 10⁵ Km » (already in the discrepancies); `self-19` is the order of magnitude and `self-20` the bracket (the plan swapped them: E3 cites `self-20`, E4 `self-19`; E2 cites `self-14`).
2. **The magnet is required from the FIRST card** (the plan said « introduced at card 3 » but module 1 question 3 uses the magnet on the minaret). Every card of both levels carries `magnet: true`; the two comparison cards do not.
3. **Two discoveries, one per level** (`ManipulationDiscovery` carries one prompt): مبتدئ `order` (the magnet rounds `a`), متقدم `sci` (`1 ≤ a < 10` on the card's own rung). The plan's D1 / D2 are split this way.
4. **A wrong rung does not glow red while hovering** (plan § 6 said it would): the verdict comes with the release, otherwise the lab is solved by colour. The refusal states the calculation (`265 ≥ 1 000 ؟ لا`); a wrong cell states the value of the graduation (`300 > 265`), never the mantissa.
5. **Comparison tasks have a pick step** (two buttons / a tap on a card, then the crown) instead of the crown appearing by itself: the student must decide, and a wrong pick is refused with the reason (same rung → the further right; different rungs → the higher rung).
6. **Illustrations are `tags`**, not a `scene` (the scene icon list has no satellite). The lab strings keep « حوالي » on every real quantity.
7. **« أستعدّ »** has no textbook item (skills `rutba`, `mudawwar`, `quwa`, `qawaid`; the 1AM review item `1am.m1.r06` is measured by statement 1); the seven statements are platform additions as in the plan.
8. **`durationMinutes` 63** (modules 0–4 and 8: 6 + 14 + 12 + 12 + 13 + 6; with the three مسائل 87). `skills` has 3 entries (one per الكفاءة); the comparison is part of P3 as in the catalogue wording.
9. **الكفاءات wording** = plan § 2 proposals (P1 gains the sign and the three sources, P2 « موجب », P3 states the book's definition); `pointPrerequisites`: P1 ← `3am_quwa-adad-ashara_P4` and `3am_qawaid-quwa-ashara_P4`, P2 ← P1, P3 ← P1.
10. **Knowledge map**: nodes = the four notebook ideas + `ما الذي يجعلها علمية؟`, the two methods and the takeaway, with TWO typical errors (exponent = number of digits; truncation instead of rounding); the comparison fault and « k × 10ᵖ is scientific as it stands » are corrected in module 1 / 2 and the bank (`lessonGraphs.test.js` accepts one parent with two mistakes in one lane plus one child in lane `end`).
11. **Bank** (`content/practice/3am/kitaba-ilmiya-rutba/`, 5 × 10): 13 `term_exam` sheets (3am-s1-3 ex 1, 3am-s1-113 ex 2, 3am-s1-4 ex 2, 2am-s2-65 ex 2, 3am-s2-72 / -70 / -78 ex 2, 3am-s2-76 / -80 / -82 / -68 ex 1, 3am-s2-83 ex 2 and ex 5), 23 `term_exam_modelled`, 14 textbook-adapted; oracle `scripts/practice-oracle/kitaba-ilmiya-rutba.mjs` (own BigInt parser); 7 `MISC-ILMIYA-*`.
