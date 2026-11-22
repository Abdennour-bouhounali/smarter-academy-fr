# Plan — `qimat-ibara-harfiya` « حساب قيمة عبارة حرفية » (3AM unit 4, queue Phase 0 #15)

Planner: Opus, 2026-10-25. Read the unit README first ([`README.md`](README.md): boundaries, shared maths, owner questions).
Every number below was computed (exact rationals, sympy / `fractions`); the generator re-computes them in `content.test.js` with its own code.

## 1. Identity

- **Code** `qimat-ibara-harfiya` · **title** « حساب قيمة عبارة حرفية » · unit `ibarat-harfiya-3` (« الحساب الحرفي », textbook unit 4) ·
  catalogue `order` 17 · `kind: lesson` · status `coming_soon` → `available` at publish.
- **Folder** `apps/web/src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/ibarat-harfiya-3/qimat-ibara-harfiya/` (same file set as
  `nashr-jabri-3am/`: `lesson.config.js`, `routes.jsx`, `index.jsx`, `moduleContext.js`, `knowledge.jsx`, `knowledgeGraph.js`,
  `content/{textbook,exercises,problems}.js` + `content.test.js` + `problems.test.js`, `modules/Module00…Module08`).
- **Textbook** pp. 54–69 (PDF page = printed page). Elements of this lesson (`docs/sources/3am/unit4/extraction.json`, all still
  `verified: false` — re-read them at 250 dpi):
  - `prep` items 1–4 p. 55 (priority of operations; a×a×a). **Item 1 reads `8 − 5 × 2` = −2 (option 2)** — fix the extraction (README).
  - `act-4` p. 57 « حساب قيمة عبارة حرفية »: A = (3x + 2)(x − 5) at x = 1, −1, 5 (values −20, 6, 0); a student's « 3x² − 17x − 6 » agrees
    at x = 1 (−20) but gives 14 at x = −1 and −16 at x = 5 (true expansion 3x² − 13x − 10).
  - `know-4` p. 60 (معارف 4): substitute and compute with priority; examples 3x² − 7x − 4 at 2 → −6; (−5x + 7)(2 − y) at x = −1,4,
    y = −9 → 14 × 11 = 154; remark: write the × and brackets for a negative.
  - `method-4` p. 61 (طريقة « توظيف قيمة عبارة حرفية والحساب الحرفي »): A = 2x² − 6, B = (x − 1)(2x + 6), C = 2(x² + x) + 2(x − 3) at x = 1:
    A = −4 (the book prints 4 — misprint already recorded), B = 0, C = 0; A ≠ B; B = C proved by expanding (2x² + 4x − 6); remark: equal
    values do not prove equality (x² + 19 and x² − 7x + 19 at x = 0).
  - `now-61` item ① p. 61: (x + 4)(x − 3) and x² − 12 at x = −4 → 0 and 4: not equal.
  - `ex-1` … `ex-4` p. 62: −2x + 5 at 7, −1, −3 (−9, 7, 11); x² − 4x + 3 at 0, 2, −2 (3, −1, 15); test two equalities at x = 1 (both
    consistent: 2 = 2, 7 = 7 — and both are in fact true); stopping distance d = 0,0064v² + 0,5v at 50, 90, 130 km/h (41; 96,84; 173,16).
  - `self-3` p. 65: (x + 7)(x − 2) at x = −3 → −20.
  - `deep-37` p. 66 « أميّز بين قيمة مضبوطة وقيمة مقرّبة »: blue area of a figure of semicircles on a 16 cm segment cut in four —
    reading: ½π·8² − ½π·4² + ½π·4² = 32π ≈ 100,53 cm² (by default to 0,01). Re-read the figure at 250 dpi before using the number.
  - `deep-39` p. 66 « أستعمل مثالا مضادا »: D = 9a + 6, C = (2 + a)(3 + 2a): equal at a = 1 (15) and a = 0 (6), not at a = 2 (24 vs 28).
  - `ict` p. 69: spreadsheet check of two expansions of (5x − 7)(3x + 2) (= 15x² − 11x − 14); « دوري الآن »: (x + 13)(x − 4) + 27 vs
    (x + 5)(x − 5): x² + 9x − 25 vs x² − 25, equal only at x = 0.
- **Does it seed the unit?** No (seeded by `tabsit-hadhf-aqwas`). It rewrites the r03 / r04 lines of the extraction header (README).

## 2. Programme & net

- **programmeItems** `3am.m5.r03` « حساب قيمة عبارة حرفية. »
- **Draft الكفاءات** (catalogue, verbatim):
  1. تعويض الحرف بقيمة نسبية في عبارة حرفية وحساب قيمتها باحترام أولوية العمليات
  2. إعادة كتابة علامة الضرب واستعمال الأقواس عند تعويض الحرف بعدد سالب
  3. استعمال قيم عددية لإثبات أن عبارتين غير متساويتين (مثال مضاد)
- **Proposed final wording** (order kept — LP ids positional):
  1. **P1** تعويض الحرف (أو الحرفين) بقيمة نسبية أو ناطقة في عبارة حرفية وحساب قيمتها باحترام أولوية العمليات، مثل قيمة $2x^2-5x+1$ من أجل $x=3$ — *added « أو الحرفين » (`know-4`'s B(x, y)) and « أو ناطقة » (the net's `addedValueAr` of `1am.m5.r08 → 3am.m5.r03`: « قيم نسبية أو ناطقة »).*
  2. **P2** إظهار علامة الضرب المضمَرة ووضع القيمة السالبة بين قوسين عند التعويض: $5x$ من أجل $x=-3$ تُكتب $5\times(-3)$ ، و $x^2$ تُكتب $(-3)^2=9$ لا $-3^2$ — *same content, made checkable (the two failures the lab shows).*
  3. **P3** الحكم على تساوي عبارتين بالقيم: قيمة واحدة تختلف عندها العبارتان تثبت أنهما غير متساويتين (مثال مضاد)، أمّا تساوي قيمتيهما من أجل بعض القيم فلا يثبت تساويهما — *adds the second half (`method-4`'s remark, the lesson's real logic).*
- **Review items for « أستعدّ »** (`reviewLinksForLesson`): `3am.m1.r08` « حساب مجموع وفرق وجداء وحاصل قسمة عددين ناطقين » (home
  `amaliyat-natiqa`, queue #9 — expected **published** when this lesson is generated; check the catalogue) and `1am.m5.r08` « تطبيق
  قاعدة حرفية في وضعية بسيطة » (home `tatbiq-qaida-harfiya`, `coming_soon`, queue #56 — unpublished). Also measured as extra
  `priorKnowledge` (no net link — owner question 1): `3am.m3.r06` « حساب قوة عدد نسبي » (published `quwat-adad-nisbi`) and the priority of
  operations (`prep` 1–3).
- **noRebuild**: `1am.m5.r08` **extends** → معارف opens on a « تذكّر — السنة الأولى » `TextbookBox kind="remark"`
  (`addition('prior_year_reminder')`, link `getLessonPath('tatbiq-qaida-harfiya')` = null → no link): « في السنة الأولى عوّضنا الحرف بعدد
  موجب في قاعدة مثل محيط مربع $4\times c$ ». Build only the added value: negative and rational values, two letters, the counter-example.
  If `amaliyat-natiqa` is published: a second « تذكّر » (same year) with its link — operations on rationals are never re-taught.
- **pointPrerequisites** — intra: `P2 ← P1`, `P3 ← P1, P2`. Cross-lesson: only along `3am.m1.r08 → 3am.m5.r03`, and only if
  `amaliyat-natiqa` is `available` at generation: `P1 ← 3am_amaliyat-natiqa_P<k>` where P<k> is its FINAL الكفاءة « تنظيم سلسلة حسابات …
  باحترام أولوية العمليات » (draft P4 today; read its final list). No edge toward `tabsit-hadhf-aqwas` / `nashr-jabri-3am` (no net link r01/r02 → r03).
- **Where 4AM uses it**: `3am.m5.r03 → 4am.m5.r07` (`mafhum-taalufiya`, `tanasub-taghayyurat`: images f(−2), f(1/2)); BEM: « احسب قيمة
  العبارة من أجل x = … » in nearly every algebra exercise, often at a fraction or a root (4AM `hisab-judhur`).

## 3. Boundary

Owns: substitution of one or two letters by relative or rational values; × made visible; brackets around a negative (and around a
fraction under a power); priority of operations inside the substituted line; exact value with π versus rounded value (`deep-37`); the
counter-example logic and « equal values prove nothing — expand to prove equality ». Leaves: simplifying and expanding (published
lessons — used as TOOLS, recalled, never taught: the « أنشر » button of the lab and the method's last step use them); comparing two
numbers by the sign of their difference (`muqaranat-natiqayn`); solving equations (unit 5) — an « equality verified for which x? » item
only TESTS the proposed values; the notation A(−3) / f(−3) (4AM).

## 4. Textbook analysis

| Element | What it asks | Idea worth keeping | Platform use |
|---|---|---|---|
| `prep` 1–4 | priority (8 − 5×2, 2×(8 − 5), 3 − 3²), a×a×a | the left-to-right trap (6 instead of −2), 3² inside a difference | « أستعدّ » items 5–6 rewritten (own numbers) |
| `act-4` | compute A at 3 values, then use the values to show a student's expansion is wrong | ONE value (x = 1) agrees, other values refute — the counter-example is born from a mistake | **application** in أتمرّن (E1, own numbers); rejected as entry (see §5) |
| `know-4` | the definition + two examples (one with two letters and decimals) | two letters, negative decimal in brackets | معارف box in own words, own examples |
| `method-4` | three expressions at x = 1, decide A ≠ B, B = C by expanding; the remark | the method « values to refute, expansion to prove » | طريقة, own numbers (A = 3x² − 6, B = (x − 2)(3x + 6), C = 3(x² − x) + 3(x − 4)) |
| `now-61` ① | two values at x = −4, equal? | a value that zeroes a bracket | أتمرّن E5 (own: x = −5) |
| `ex-1`, `ex-2` | direct evaluation, incl. negatives | the sign traps | أتمرّن E2 (own expressions) |
| `ex-3` | « test » two equalities at x = 1 | a consistent test proves nothing (both are true here) | أتمرّن E3 (one consistent, one refuted) |
| `ex-4` | a stopping-distance formula at 3 speeds | evaluation with decimals in a real formula | أتمرّن E4 redesigned (a thrown ball h = 20t − 5t²) — braking stays for the synthesis (`evaluation`) |
| `self-3` | one value of a product | — | أتمرّن E6 (own) |
| `deep-37` | exact area with π, then rounded by default to 0,01 | exact vs approximate value | أتمرّن E8 (own figure: square + semicircle) |
| `deep-39` | counter-example: equal at a = 1 and a = 0, not at a = 2 | TWO agreeing values still prove nothing | أتمرّن E7 (own: (1 + a)(4 + a) vs 6a + 4) |
| `ict` | spreadsheet table of 3 expressions on x = −6…6 | a table of values is a mass test | أتمرّن E9: a value table to fill (no spreadsheet on the platform) |

## 5. Design

**The idea in one paragraph.** Computing the value of an expression is putting the SAME number in EVERY place of its letter, without
changing the role it played: what was « 4 times x » stays « 4 × (the number) » (the hidden × must appear, or 4 and 3 fuse into 43), and
what was « x squared » stays « (the number) squared » — for a negative number the brackets keep the sign inside the square
($(-2)^2=4$, while $-2^2=-4$). Then the priority of operations does the rest. Two different letters may take different numbers. And
values can JUDGE an equality only one way: one value where two expressions part proves they are not equal; values where they agree
prove nothing — the expansion proves it.

**Entry decision.** Candidates:
- (a) the book's `act-4` (compute (3x + 2)(x − 5) at three values, then judge a student's expansion): the student computes from memory of
  2AM priority rules — nothing in it makes brackets or × NECESSARY; its strong part (one value agrees, others refute) is the
  counter-example, which comes later (module 3). → application in أتمرّن (E1).
- (b) a function machine « x ↦ value » (black box): rejected — that is 4AM's `linear-machine`, and a black box hides exactly what this
  lesson is about (where the number goes in the expression).
- (c) **chosen — the marble run**: the expression is BUILT as a marble run whose stations are its operations (the tree of the
  expression made physical: squaring = a copier that makes a second identical marble and presses the two together; « 4 × » = a press
  with a 4-marble; + / − = junctions; a minus in front = a flip gate). The hand releases a marble carrying a number into the letter's
  reservoir — the reservoir sends an identical marble to EVERY inlet of that letter — and WRITES the substituted line under the run.
  The run computes what the expression MEANS; a strict reader computes what the LINE says. Brackets and × become necessary because
  without them the line computes something else (43 + 7 = 50 against 19; −2² − 3 × (−2) = 2 against 10), and the place where the two
  calculations part is lit. The value is never told: it rolls out.

**Order of ideas.** Same number in every slot, × made visible (P1, P2 — module 1, مبتدئ) → brackets around a negative, the square of
a negative (P2) → a fraction, two letters, predict before running (P1 — module 1, متقدم) → معارف: the words, the method of
substitution, two letters with decimals (P1, P2) → طريقة: twin runs, the counter-example and why agreement proves nothing, then the
method « values refute, expansion proves » (P3) → أتمرّن → three مسائل → إختبار أولي.

**Story contexts** (own; values woven, short): the school science club's marble run on the pegboard wall (cooperation: Younes and
Inès build it for the open day); a garden plot measured in x (care of the school garden — problem 1); two calculation programs
challenged by a classmate (honesty: a claim needs a proof — problem 2); the temperature down the Djurdjura and at the Chott Melghir, 40 m
below sea level (curiosity for one's country — problem 3).

## 6. Lab — `marble-run` « مسار الكريات »

- **Type** `marble-run` (free in `manipulationRegistry.js` on 2026-10-25 — re-check), declared in
  `packages/core/curriculum/manipulationTypes.js`; theme `marblerun` added to `VISUAL_THEMES` (`{ kind: 'objects', shows: 'كريات ومسارات' }`).
  Files: `common/manipulations/algebra/MarbleRun.jsx` (+ `algebra/marbleRun/*` art and geometry), `manipulations/logic/marbleRun.js` (+
  test), `algebra/marbleRun.render.test.jsx`, strings `lesson.manipulation.json › marbleRun`.
- **Drawn world.** The club's pegboard wall: wooden rails and clear tubes drawn to scale in inline SVG, with depth (soft shadows, glass
  highlights). At the top one **reservoir per letter** (« خزّان x », « خزّان y ») with a funnel. A marble shows its number on its face
  (stacked fraction for ½); positive marbles teal, negative marbles red with « − » (the platform's « opposite » convention from
  `like-terms`). Stations, read top to bottom = the expression tree, each drawn as a small machine with its label: **ناسخة** (²: one marble
  in, two identical out, then pressed together — the chip under it shows « (−2) × (−2) = 4 »), **مكبس** (× k: the marble meets a k-marble
  from a cup), **قلّاب** (a minus in front: the marble flips colour), **ملتقى** (+ / −: two tracks merge). Number constants wait in small
  cups. The result drops into « سلّة النتيجة ». Under the wall, **the written line** (LTR, big): the expression with every letter
  replaced by a SLOT. A `KidFigure` girl in hijab and tunic, « إيناس », stands at the wall (`wonder` while the marbles roll, `proud` on a
  stamp) — she carries no information.
- **The variable in the hand.** (1) The VALUE of the letter: a marble taken from the rack (−5 … 5; at متقدم also −½, ½, −⅓, ⅔, −1,5) and
  dropped into the reservoir (drag; tap the marble then the reservoir; keyboard: arrows across the rack, Enter takes, Enter on the
  reservoir drops). (2) The WRITING of each slot: tap the slot to toggle the brackets « v » ↔ « (v) »; tap the gap before a slot to toggle
  « × » (shown only where a number or a closing bracket precedes the letter); keyboard: Tab between slots, B brackets, X the ×.
  (3) « شغّل المسار » (a lever, ≥ 44 px; Enter / Space).
- **What the world shows (never the rule).** The marbles roll; every station chip shows its own computation; the basket shows the run's
  value. The **reader** (a small brass ticker under the line, « القارئ ») reads the line literally — juxtaposed digits fuse, a power
  binds before a leading minus, two signs side by side are unreadable — and prints its value. Equal → a stamp, the line turns green.
  Different → the reader's tape and the run part at the first station where their values differ: that station and the guilty slot pulse;
  the banner says the two computations in the student's numbers (« سطرك يقرأ العدد 43، أمّا المكبس فيضرب 4 في 3 » ;
  « سطرك يربّع 2 ثم يأخذ المعاكس: −4، أمّا الناسخة فتضرب −2 في −2: 4 » ; « في سطرك علامتان متجاورتان: × و − »).
- **Opening (no title, DNA §17.9).** Context: « بنى نادي العلوم مسارًا للكريات يحسب العبارة $4x+7$: كل كرية تحمل عددًا. » Question:
  « أسقِط الكرية 3 في خزّان x، ثم اكتب تحت المسار السطر الذي يحسبه حتى يتّفق مع سلّة النتيجة. » (The lesson's `lead` replaces the
  context per task and carries every number.)
- **Level مبتدئ** (station chips visible during the run; the value appears in the basket). Tasks (exact):
  - `r1` E = $4x+7$, x = 3 → line `4 × 3 + 7`, value **19**. Without × the reader gives **50** (« 43 + 7 »): refused, reason `fused`.
  - `r2` E = $4x+7$, x = −2 → `4 × (−2) + 7` = **−1**. Without brackets: « 4 × −2 » refused, reason `syntax`.
  - `r3` E = $x^2-3x$, x = −2 → `(−2)² − 3 × (−2)` = 4 + 6 = **10**. Without brackets on the first slot the reader gives −4 + 6 = **2**:
    refused, reason `unbracketed`, at the copier.
  End state: three lines accepted.
- **Level متقدم** (no chips during the run; BEFORE running the student PREDICTS the value on a keypad: sign, integer or fraction p/q;
  the prediction is diagnostic, never blocking; the chips appear after the run). Tasks:
  - `r4` E = $5-2x^2$, x = −3 → `5 − 2 × (−3)²` = 5 − 18 = **−13**. Typical predictions: 23 (from −3² = −9) and −31 (from (2·(−3))² = 36):
    the run shows the copier BEFORE the press (the order is the tree, not the reading order).
  - `r5` E = $6x-1$, x = −½ → `6 × (−1/2) − 1` = −3 − 1 = **−4**.
  - `r6` E = $3x-2y$, x = −1, y = 4 (two reservoirs) → `3 × (−1) − 2 × 4` = **−11**. A marble dropped into the wrong reservoir is a free
    trial (the run still works; the task needs the named values).
  End state: three lines accepted.
- **World `twins` (module 3, `levels={false}`, the lesson's `tasks`).** Two runs side by side under ONE reservoir x; the student drops
  marbles (rack −3 … 3) and compares the two baskets; three claim buttons: « وجدتُ مثالًا مضادًا: غير متساويتين » (accepted iff the
  current marble gives two different values; otherwise refused: « عند x = 0 تعطي العبارتان 6 و 6: هذا ليس مثالًا مضادًا »), « متساويتان »
  (refused while not expanded: « قيمٌ متساوية لا تكفي: جرّب قيمة أخرى أو انشر »), « انشر » (each run's reduced form appears in
  LTR under it — the published `nashr` skill used as a tool through `expansion.js`; after it, « متساويتان » is judged on the reduced forms).
  Tasks: `tw1` $(x+2)(x+3)$ vs $x^2+6$ (equal at 0: 6 / 6; at 1: 12 / 7; at −1: 2 / 7) → « غير متساويتين »; `tw2` $2x^2+2$ vs $x^2+x+2$
  (equal at 0 → 2 and at 1 → 4; at 2: 10 / 8; at −1: 4 / 2) → « غير متساويتين »; `tw3` $(x-2)(3x+3)$ vs $3(x^2-1)-3(x+1)$ (equal at every
  marble: −1 → 0, 0 → −6, 1 → −6, 2 → 0, 3 → 12; both reduce to $3x^2-3x-6$) → « متساويتان » after « انشر ». Opening: « قال زميلك إنّ
  كل عبارتين في المسارين متساويتان. » / « أسقِط كريات حتى تحكم على كل زوج: متساويتان أم لا، وبرهن حكمك. »
- **« جرّب أعدادك » — always open.** The marble: any integer −9 … 9 or fraction ±p/q (1 ≤ p ≤ 9, 2 ≤ q ≤ 9). The expression: one of six
  cards (`3x − 4`, `x² + 1`, `−x²`, `(x − 1)(x + 2)`, `2x² − x`, `5 − 3x`) or typed (grammar: integers ≤ 99, x, y, + − × ( ), `²`/`^2`,
  `^3`, implicit coefficient « 3x »; ≤ 24 characters; Arabic-Indic digits and the real minus accepted). In `twins`: two typed expressions.
  Free trials carry `free: true`, never tick a task or the discovery; « عُد إلى مهامّك ».
- **LabCoach** (one sentence each, on the control, never the rule): `rack` « اسحب كرية إلى الخزّان » → `slots` « المس الخانة لتضيف القوسين أو
  تحذفهما » → `times` « المس الفراغ قبل الخانة لتضيف ×» → `run` « اسحب الذراع لتشغّل المسار » → (once, if the student bracketed every
  negative from the start) `bare` « جرّب مرّةً دون قوسين وشاهد السلّة » → `predict` (متقدم) « اكتب توقّعك قبل التشغيل » ; twins: `drop`,
  `claim`, `expand`. `coachOf` is pure and tested by following it to the end of every task.
- **Misconceptions the lab makes VISIBLE.** fused digits (43); −2² taken for (−2)²; the coefficient inside the square ((2·(−3))² = 36:
  the copier stands before the press); one slot replaced and the other left (impossible: the reservoir feeds every inlet — the slot cards
  all fill at once, drawn); x and y given the same number (two reservoirs); « equal at x = 0 ⇒ equal » (`twins`).
- **Discovery** (`ManipulationDiscovery`, refutable options, after all tasks AND `bareTried` — one negative run without brackets, the
  contrast trial, as `term-ferry`'s `keepTried`): « لماذا احتاج سطرك إلى قوسين حول −2 في $x^2$؟ » — right « لأنّ الناسخة تضرب −2 كلّه في
  نفسه: $(-2)^2=4$ ، ودون قوسين يُربَّع 2 وحده » ; wrong « القوسان للزينة: النتيجة نفسها » (refuted by the student's own refused run, 2 vs
  10) ; « نضع قوسين حول كل عدد موجب أيضًا وإلّا أخطأنا » (refuted by `r1`: 4 × 3 accepted without brackets). Formal (named only now):
  « التعويض »، « قيمة العبارة من أجل x = … »، × المضمَرة، القوسان حول العدد السالب، أولوية العمليات.
- **Core maths** — new `packages/core/arithmetic/substitution.js` (+ `substitution.test.js`), exact through `powers.js`:
  `parseExpression(text) → Tree` (nodes `num` (rat), `var` (name), `neg`, `add`, `sub`, `mul` (explicit / implicit), `pow` (base, n));
  `treeTex(tree)`; `evaluate(tree, env) → rat`; `trace(tree, env) → [{ node, op, args, value }]` (station chips, bottom-up); `slots(tree) →
  [{ i, name, needsTimes }]`; `needsBrackets(tree, slotIndex, value) → boolean` (negative value, or fraction under a power);
  `writeLine(tree, env, choices) → tokens`; `readLine(tokens) → { ok: true, value } | { ok: false, reason: 'syntax', at }` (literal
  reading: digits fuse, power before a leading minus); `judgeLine(tree, env, choices) → { ok, runValue, lineValue, reason: 'fused' |
  'unbracketed' | 'syntax' | null, station, slot }`; `toTerms(tree) → polynomial terms | null` (for « انشر », through `polynomials.js`);
  `witness(treeA, treeB, candidates) → value | null`; `claimJudge(pair, claim, state)`. UI orchestration in `logic/marbleRun.js` (+ test:
  every task of both levels and of `twins` solved by following `coachOf`; every refusal reason with its numbers; reset).
- **Events (`state.report`)**: `{ kind: 'drop', world, task, letter, value, free }` · `{ kind: 'write', task, slot, brackets, times }` ·
  `{ kind: 'run', world, task, runValue, lineValue, ok, reason, station }` · `{ kind: 'predict', task, predicted, value, ok }` ·
  `{ kind: 'claim', world: 'twins', task, claim, ok, witness }` · `{ kind: 'expand', task, left, right }` (LaTeX) · `{ kind: 'solved', world,
  task, line, value }` · `{ kind: 'custom', world }`.
- **DOM contract**: `[data-marble-run][data-world][data-task][data-solved]`, `[data-mr-glance]`, `[data-mr-rack]` / `[data-mr-marble=<v>]`,
  `[data-mr-reservoir=x|y]`, `[data-mr-station=<id>][data-op]`, `[data-mr-basket]`, `[data-mr-line]`, `[data-mr-slot=<i>][data-brackets]`,
  `[data-mr-times=<i>]`, `[data-mr-run]`, `[data-mr-reader]`, `[data-mr-refused=<reason>]`, `[data-mr-banner]`, `[data-mr-predict]`,
  `[data-mr-claim=counter|equal]`, `[data-mr-expand]`, `[data-mr-free]`, `[data-mr-formal]`.
- **Why not another lab (DNA §12).** `linear-machine` (4AM): a closed machine x ↦ f(x) judged against a·x — the inside is hidden; here the
  inside IS the lesson (each station of the tree, the copier of the square) and the hand writes the line. `like-terms` / `area-split`
  (this unit): a value meter at x only CHECKS that simplifying / expanding keeps the value; nobody writes a substituted line, nothing
  rolls. `term-ferry` (« عوّض » writes the substitution of the solution): one automatic line, no brackets decision, no tree. Gesture family
  here: release a value + clip brackets / × into a written line + run — no carrying of terms, no cutting, no slider.
- **Screen budget** (tablet and laptop only). At 1024×768 with the lesson sidebar open the column is ≈ 450–520 px (measure on the REAL
  page): the wall (reservoirs + 3–5 stations + basket) ≤ 300 px high, the line one row (font ≥ 26 px, scales down with its length), rack
  and lever in one row under it; the reader's tape and the free panel in `LabFold` below 660 px (the free panel stays OPEN — it is a row of
  two controls, not a fold, when it fits; owner rule « always open »). `twins` puts the two runs side by side ≥ 900 px, stacked with a
  shared reservoir below. Budgets from `useLessonViewport`; label-collision geometry tests for station chips.

## 7. Modules (standard 9)

| # | slug | title | LPs |
|---|---|---|---|
| 0 | `astaidd` | أستعدّ | — |
| 1 | `nashat` | نشاط — مسار الكريات | P1, P2 |
| 2 | `maarif` | معارف — عوّض ثم احسب | P1, P2 |
| 3 | `tariqa` | طريقة — مثال مضاد أم نشر؟ | P3, P1 |
| 4 | `atamarran` | أتمرّن | P1, P2, P3 |
| 5–7 | `masala-1…3` | مسائل | P1–P3 |
| 8 | `itqan` | إختبار أولي | P1–P3 |

**Module 0 — أستعدّ.** `objectives`: « أتحقّق من العمليات على الأعداد الناطقة، ومن تطبيق قاعدة حرفية، ومن أولوية العمليات وقوة عدد سالب ».
Six true/false statements (`prepQuestion`, never blocking; « راجع قبل أن تنطلق » automatic):
1. « $-\frac34+\frac12=-\frac14$ » — صحيح (`requires: amaliyat-natiqa`).
2. « $\left(-\frac23\right)\times6=4$ » — خاطئ (−4) (`amaliyat-natiqa`).
3. « محيط مربع طول ضلعه $c$ هو $4\times c$ ؛ من أجل $c=7{,}5$ نجد 30 » — صحيح (`tatbiq-qaida-harfiya`).
4. « $(-3)^2=-9$ » — خاطئ (9) (`quwat-adad-nisbi`).
5. « $9-4\times2=10$ » — خاطئ (1; the left-to-right trap gives 10) (`prep` 1 rewritten, `src('prep', …, 1)`).
6. « $a\times a\times a=a^3$ » — صحيح (`prep` 4 rewritten). `prep` 2–3 are cited by item 5's `cites`.

**Module 1 — نشاط (lab `marble-run`, two levels).** `objectives`: « أعوّض الحرف بعدد في كل مكان منه، وأُظهر علامة الضرب، وأضع العدد السالب
بين قوسين ». No brief, no workspace title/lead; the lab at the top. Steps (each with an evidence line from `onTrial`, never blocking):
- q1 (choice) « رفض القارئ سطرك "43 + 7" في المهمة الأولى. لماذا؟ » — right « لأنّ $4x$ جداء: دون × يُقرأ 4 و 3 عددًا واحدًا هو 43 » ;
  wrong « لأنّ القارئ يجمع قبل أن يضرب » ; « لأنّ 3 عدد فردي ». Brick `ithar-darb` after the answer: « عند التعويض نُظهر علامة الضرب المضمَرة: $4x$
  من أجل $x=3$ تُكتب $4\times3$ ».
- q2 (numeric) « في المهمة الثالثة: ما قيمة $x^2-3x$ من أجل $x=-2$؟ » → **10** (evidence: « سطرك الأول أعطى 2 فتوقّف المسار عند الناسخة »).
  Brick `aqwas-salib`: « نضع القيمة السالبة بين قوسين: $(-2)^2=4$ أمّا $-2^2=-4$ ».
- q3 (choice) « كم كرية خرجت من خزّان x في المهمة الثالثة، وما العدد على كل واحدة؟ » — right « كريتان تحملان العدد نفسه −2: كل مكان لـ x
  يأخذ العدد نفسه » ; wrong « كرية −2 والأخرى 2 » ; « كرية واحدة فقط ». Brick `nafs-al-adad`.
- q4 (numeric, advanced) « بالطريقة نفسها: ما قيمة $3x-2y$ من أجل $x=2$ و $y=-1$؟ » → **8** (= 6 + 2). Brick `harfan`: حرفان مختلفان قد
  يأخذان عددين مختلفين.

**Module 2 — معارف.** `objectives`: « أكتب بكلماتي طريقة حساب قيمة عبارة حرفية، وأطبّقها بعدد ناطق وبحرفين ». Opens on its first question (no
lab). Track: q1 (numeric) « احسب قيمة $2x^2-5x+1$ من أجل $x=3$ » → **4** ; q2 « … من أجل $x=-1$ » → **8** ; « أتوقّع القاعدة » (free text,
§14.3ter) « اكتب بكلماتك كيف تحسب قيمة عبارة حرفية من أجل قيمة للحرف » ; then the box (own words, `know-4`): « لحساب قيمة عبارة حرفية من أجل
قيمة للحرف، نعوّض الحرف بهذه القيمة في كل مكان منه، ونُظهر علامة × ، ونضع العدد السالب بين قوسين، ثم نحسب باحترام أولوية العمليات » ;
q3 (numeric) « احسب قيمة $B=(4-x)(y+2)$ من أجل $x=-1{,}5$ و $y=-7$ » → **−27,5** (5,5 × (−5)). The two « تذكّر » boxes (§2) sit in the
`brief`. Knowledge map: nodes التعويض → × المضمَرة → القوسان → الأولوية → حرفان; a guide node « خطأ شائع: $-3^2$ » under the second node
(layout rules: never hung on the root, ≥ 2 core nodes per guide node).

**Module 3 — طريقة (lab `marble-run`, world `twins`, `levels={false}`).** `objectives`: « أثبت أنّ عبارتين غير متساويتين بمثال مضاد، وأعرف أنّ
تساوي القيم لا يكفي لإثبات التساوي ». Steps:
- q1 (choice) « في الزوج الأول أعطت الكرية 0 القيمة 6 في المسارين. هل يكفي ذلك لنقول إنّ $(x+2)(x+3)=x^2+6$؟ » — right « لا: عند $x=1$ تعطي
  الأولى 12 والثانية 7 » ; wrong « نعم: قيمة واحدة متساوية تكفي » (MISC-QIMA-ONE-VALUE) ; « نعم لأنّ 0 أصغر عدد ».
- q2 (choice) « في الزوج الثاني تساوت القيم عند $x=0$ و $x=1$. ماذا تستنتج؟ » — right « لا شيء بعد: عند $x=2$ نجد 10 و 8، فهما غير متساويتين ».
- q3 (choice) « لماذا لم تجد مثالًا مضادًا للزوج الثالث؟ » — right « لأنّ النشر يعطي العبارة نفسها $3x^2-3x-6$: هما متساويتان ».
- The method (own worked example, `method-4` redesigned): « لتكن $A=3x^2-6$ و $B=(x-2)(3x+6)$ و $C=3(x^2-x)+3(x-4)$ » — values at
  x = 1: **A = −3, B = −9, C = −9** → A ≠ B (counter-example); B and C may be equal → expand: **B = C = $3x^2-12$**. Remark (own): « لا يكفي
  تساوي قيمتي عبارتين من أجل قيمة لنحكم بتساويهما: $x^2+5$ و $x^2-4x+5$ لهما القيمة 5 من أجل $x=0$ » (5 and 5; at x = 1: 6 and 2).
  Brick `mithal-mudad`. « أتوقّع القاعدة » placed before the remark.

**Module 4 — أتمرّن.** `objectives`: « أحسب قيمًا لعبارات حرفية بأعداد نسبية وناطقة وبالعدد π، وأحكم على مساواة بالقيم ». Exercises (own numbers;
`source` = the element, `src()` without `number`):
- E1 (`act-4`): $A=(2x+3)(x-4)$ at 1, −1, 4 → **−15, −5, 0**; « نشر زميلك: $2x^2-11x-6$ » gives −15, **7**, **−18** → wrong (true $2x^2-5x-12$);
  question « لماذا لا تكفي القيمة $x=1$؟ ».
- E2 (`ex-1`, `ex-2`): $-3x+4$ at 5, −2, −⅓ → **−11, 10, 5**; $x^2-5x+6$ at 0, 3, −1 → **6, 0, 12**.
- E3 (`ex-3`): test at x = 2: $(2x-1)(3-x)=-2x^2+7x-3$ → 3 and 3 (consistent — then expand: true); at x = 1: $6x-2x^2=-2x(x+3)$ → **4** and
  **−8** → false.
- E4 (`ex-4`): a ball's height $h=20t-5t^2$ (m, t in s) at t = 1, 2, 4, 1,5 → **15, 20, 0, 18,75**.
- E5 (`now-61` ①): $(x+5)(x-2)$ and $x^2-10$ at x = −5 → **0** and **15**: not equal.
- E6 (`self-3`): $(x+6)(x-3)$ at x = −2 → **−20**.
- E7 (`deep-39`): Yacine says $(1+a)(4+a)=6a+4$ for every a: a = 0 → 4 / 4; a = 1 → 10 / 10; a = 2 → **18 / 16** → false.
- E8 (`deep-37`): a figure = a square of side 6 cm + a semicircle of diameter 6 cm on one side: exact area **$36+\frac92\pi$** cm²,
  rounded by default to 0,01: **50,13** (50,1371…). `GeoFigure` data, measured in `content.test.js`.
- E9 (`ict`): two expansions of $(4x-3)(2x+5)$ — « $8x^2+26x-15$ » and « $8x^2+14x-15$ » — fill the table for x = −2 … 2: true **−11, −21,
  −15, 7, 45**; first **−35, −33, −15, 19, 69** (wrong); second equal everywhere (then expand: $8x^2+14x-15$).

**Modules 5–7 — مسائل** (`GuidedProblem`, values in context, plain-text `data`/`tags`, `$` only in prompts through `MathText`):
1. **مسألة الدرس — حديقة القسم** (`lessonProblem`, module 5): « قطعة أرض مستطيلة بعداها بالمتر $(x+3)$ و $(2x-1)$ يعتني بها تلاميذ القسم. كيس
   البذور يكفي 20 م². » Q1 انشر وبسّط المساحة S → $2x^2+5x-3$ (tool: nashr, `counted: false` in the bank sense, a step here) ; Q2 احسب S من أجل
   $x=2{,}5$ → **22** (5,5 × 4, and from the expanded form 12,5 + 12,5 − 3) ; Q3 هل يكفي كيس واحد؟ → **لا: 22 > 20، يلزم كيسان** ; Q4 من أجل
   $x=3{,}5$ → **39**. `illustration: { kind: 'plan', shape: 'rect', w: '2x - 1', h: 'x + 3' }`.
2. **برنامجا حساب** (module 6): البرنامج 1: اختر عددًا، أضف 3، ربّع الناتج، اطرح 9 → $(x+3)^2-9$ ; البرنامج 2: اختر عددًا، ربّعه، أضف 6 →
   $x^2+6$. « جرّب أمين العدد 1 فوجد 7 في البرنامجين، فقال: البرنامجان متساويان. » Q1 values at 1 → **7, 7** ; Q2 at 2 → **16, 10** ; Q3 حكمك
   → **غير متساويين، 2 مثال مضاد** ; Q4 برنامج ثالث « اضرب العدد في العدد مضافًا إليه 6 » $x(x+6)$: at 2 → 16, at −1 → **−5** (P1 → −5 too) →
   « انشر: $x^2+6x$ في الحالتين » → equal.
3. **من جرجرة إلى شطّ ملغيغ** (module 7): « تنخفض درجة الحرارة في يوم ما حسب العلاقة $T=15-6h$ حيث h الارتفاع بالكيلومتر. » Q1 at h = 2,5 →
   **0 °C** ; Q2 at h = 3 → **−3 °C** ; Q3 شط ملغيغ 40 م تحت سطح البحر: h = −0,04 → $15-6\times(-0{,}04)$ = **15,24 °C** (the brackets of P2) ; Q4
   at h = 2,3 → **1,2 °C**. (Values: knowing one's country.)

**Module 8 — إختبار أولي** (`BossFinal`, literal epreuves in `Module08Itqan.jsx`, `FINAL` data in `content/exercises.js`; cite `self-3`):
1. قيمة $5-2x$ من أجل $x=-3$: **11** ✓ · −1 (sign lost, MISC-QIMA-SIGN-LOST) · −9 ((5 − 2) × (−3), MISC-QIMA-LEFT-TO-RIGHT) · 0 (5 − 2 − 3,
   MISC-QIMA-FUSED).
2. قيمة $x^2-4$ من أجل $x=-3$: **5** ✓ · −13 (−3² − 4, MISC-QIMA-NEG-POWER) · −10 (x² read 2x, MISC-QIMA-SQUARE-DOUBLE) · 13.
3. قيمة $3x^2$ من أجل $x=-2$: **12** ✓ · 36 ((3 × (−2))², MISC-QIMA-COEF-IN-POWER) · −12 (MISC-QIMA-NEG-POWER) · −36.
4. قيمة $2x-3y$ من أجل $x=\frac12$ و $y=-1$: **4** ✓ · −2 (sign of y lost) · $-\frac72$ (x and y swapped, MISC-QIMA-LETTERS-SAME) · 1.
5. العبارتان $(x+1)^2$ و $x^2+1$: **غير متساويتين لأنّ من أجل $x=1$ نجد 4 و 2** ✓ · « متساويتان لأنّ لهما القيمة 1 من أجل $x=0$ »
   (MISC-QIMA-ONE-VALUE) · « متساويتان لأنّ $(x+1)^2=x^2+1^2$ » · « لا يمكن أبدًا الحكم على مساواة بالقيم ».

## 8. Misconceptions (`MISC-QIMA-*`, added to `content/practice/misconceptions.json`)

| id | wrong belief | lab | caught by |
|---|---|---|---|
| `MISC-QIMA-FUSED` | 4x at x = 3 written 43 (no ×) | `r1` refusal `fused` | final 1, L1 |
| `MISC-QIMA-NEG-POWER` | x² at −3 written −3² = −9 | `r3`, `r4` refusal `unbracketed` at the copier | final 2, 3, L1–L3 |
| `MISC-QIMA-SIGN-LOST` | the minus of the value dropped (uses 3 for −3) | the red marble cannot turn teal except at a flip gate | final 1, 4 |
| `MISC-QIMA-COEF-IN-POWER` | 2x² at 3 computed (2·3)² | `r4` (copier before the press) | final 3, L2 |
| `MISC-QIMA-LEFT-TO-RIGHT` | operations done in reading order | stations order (tree) vs reader | final 1, `prep` 5 |
| `MISC-QIMA-SQUARE-DOUBLE` | x² read as 2x | the copier presses, it does not add | final 2 |
| `MISC-QIMA-PARTIAL` | only the first x replaced | the reservoir fills every slot at once | L1 choice items |
| `MISC-QIMA-LETTERS-SAME` | x and y forced to the same value / swapped | two reservoirs (`r6`) | final 4 |
| `MISC-QIMA-ONE-VALUE` | equal at one (or two) values ⇒ equal | `twins` `tw1`, `tw2` | final 5, L2, L4 |

## 9. Practice bank — `content/practice/3am/qimat-ibara-harfiya/` (5 × 10, ids `ex-3am-qimat-ibara-harfiya-l<N>-<NNN>`)

**Corpus** (`exams-index.json`, item `3am.m5.r03`: 14 exercises tagged, 13 distinct situations; plus two mis-tagged precise hits):
`3am-s2-75` ex 2 (brackets, expand, value) · `3am-s2-68` ex 2 (expand/simplify, value — scan) · `3am-s2-70` ex 1 (same; `-copy` is a
duplicate) · `3am-s2-80` ex 2 (D = (2x + 1)(x − 3) − (3x² − 7x + 1) = −x² + 2x − 4, value at x = 3 → **−7**) · `3am-s2-80` ex 5 Q3 (test
6x < 324 − 6x at x = 18 and x = 30 — evaluation; the comparison part is `muqaranat-natiqayn`'s) · `3am-s2-81` ex 1 (D = (4x − 3)(6x + 2) =
24x² − 10x − 6, check at x = −2 → **110 = 110**) · `3am-s2-81` ex 5 (farmer's plot L, P, S in x, trees at x = 1; `3am-s2-76` ex 5 is the same
situation — cite ONE) · `3am-s2-82` ex 2 (A = 2x² − 6x − 2(4x + 2) + 1 = 2x² − 14x − 3, value at 1 → **−15**) · `3am-s2-82` ex 5 (school
yard areas in x, perimeter at x = 80) · `3am-s3-47` ex 1 Q③ (−6x² + 36x − 30 = −6x² + 21x + 15 « محققة من أجل » 3 / −3 / ⅓: only **x = 3**
(24 = 24; −192 ≠ −102; −56/3 ≠ 64/3) — tagged `3am.m1.r05` in the index, it is r03) · `3am-s3-47` ex 5 (perimeter/area in x + Pythagoras) ·
`3am-s3-49` ex 1 (expand, equation, value) · `3am-s3-56` ex 1 (expand and check) · `2am-s2-65` ex 4 and ex 5 (a misfiled 3AM paper: its
header counts). **Faithful `term_exam`: about 12** (honest: every one of them also expands — those steps are `counted: false` with the
lesson `nashr-jabri-3am`, published, same term S2; an equation step of `3am-s3-49` is dropped or `counted: false`).

**Levels** (EXAM_PATTERN §6; every exercise has `metadata.exam`):
- **L1** (10, 2–3 ن, one skill): direct values at integers, negatives, a fraction, two letters; `choice` (distractors from §8, each
  tagged) and `rational`. 10 `platform_addition` `term_exam_modelled` (`modelledOn: "3am-s2"`).
- **L2** (10, 3 ن, compute then « علّل »): « هل العبارتان متساويتان؟ علّل » (counter-example or « القيم لا تكفي »), « اختبر صحة المساواة
  من أجل … » (`3am-s3-47` Q③ register), the place of brackets (« أين الخطأ في هذا التعويض؟ »). ~3 `term_exam` (`3am-s3-47` ex 1, `3am-s2-81` ex 1,
  `3am-s3-56` ex 1), 7 modelled.
- **L3** (10, 3 ن, complete 3–4-question exercises « بسّط / انشر ثم احسب من أجل x = −½, ⅔, 10⁻¹ »): ~5 `term_exam` (`3am-s2-75`, `-68`, `-70`,
  `-80` ex 2, `-82` ex 2), 5 modelled (values at fractions: BEM register).
- **L4** (10, 3–4 ن, with another lesson of the same term — powers of 10 (`x = 10^{-2}`), Pythagoras, scientific notation; those steps
  `counted: false`): ~2 `term_exam` (`3am-s3-49` ex 1, `2am-s2-65` ex 4), 8 modelled.
- **L5** (10, « الوضعية الإدماجية (08 ن) », two parts, a justified decision): plots and yards in x, the farmer's trees, temperatures, a
  ball's flight; ~3 `term_exam` (`3am-s2-81` ex 5, `3am-s2-82` ex 5, `3am-s3-47` ex 5) + `2am-s2-65` ex 5 if its scan reads well, the rest
  modelled. Badge « على منوال اختبار الفصل الثاني » (S2) / « … الثالث » (S3).
- `answerType`: `rational` for values (exact, fractions accepted), `choice` (every distractor FALSE, `misconceptionId`), `selfCheck` for
  « علّل ». Each LP primary on ≥ 8 questions (P3 is the thinnest: put it in L2, L4, L5). `learningPoints`: exactly one primary of THIS lesson.
- **Oracle** `scripts/practice-oracle/qimat-ibara-harfiya.mjs`: its own exact rational evaluator (BigInt fractions, `helpers.mjs`, never
  `packages/core`): every value, every key, every distractor recomputed; every « not equal » checked by a witness, every « equal » by
  equality of the expanded polynomials; imported into `scripts/practice-answer-oracle.test.mjs`.
- Wiring: `active.json`, `exam-style.json`, `policy.json` (`minPerLevel: 10`), `misconceptions.json`, the generated practice index.

## 10. Risks & owner questions

- `prep` item 1 reading (8 − 5 × 2 = −2) — README question 2.
- Net links `3am.m3.r06 → 3am.m5.r03` and `2am.m4.r09 → 3am.m5.r03` — README question 1. Until then no cross-lesson edge along them.
- `deep-37` figure: the reading 32π must be re-checked at 250 dpi (the plan's E8 uses its own figure anyway).
- The written-line reader is the delicate code: keep its grammar tiny (the lab only produces lines from the tree + toggles; the free
  panel's typed expressions use `parseExpression`, not the reader). Juxtaposition « 4(3) » is read as a product (mathematically right):
  the lab does not refuse it; the طريقة and the bricks ask for « × » by convention.
- Notation: never print A(−3) (4AM). README question 5.

## 11. Generator checklist

- Core: `substitution.js` + test (exact, parser round-trips, `readLine` on the four refusal cases, `judgeLine` on every task).
- Lab: `logic/marbleRun.test.js` (every task of both levels and `twins` solved by following `coachOf`; refusals `fused` / `unbracketed`
  / `syntax` with their numbers; `bareTried`; claims; reset), `algebra/marbleRun.render.test.jsx` (both levels and `twins` render;
  no `{{`; no Latin prose; opens on CONTEXT then ONE question; says each thing once), registry + `levels.js` (both levels carry the SAME
  `objective`) + `levels.test.js`, `MANIPULATION_CONTRACT.md` section (next free `§2…tricies` number — re-read the file), `MANIPULATION_DNA.md`
  §15 row, `docs/reports/LAB_COACH_ROLLOUT.md` row. Screenshots at 768×1024, 1024×768 (sidebar open, real page), 1280×800, 1366×768:
  initial, refusal `fused`, refusal `unbracketed` (the copier lit), the prediction at متقدم, `twins` with a counter-example, the formal
  phase — reviewed and iterated (DNA §17).
- Lesson: `content.test.js` (independent BigInt-rational evaluator; every module answer, every E-exercise value, every final-test key and
  distractor, the `GeoFigure` of E8 measured), `problems.test.js`, the unit's `prepDiagnostic.test.js`, `validate:lessons`, `check:textbook`
  (all 14 elements cited; `prep` 1–4 by module 0), `audit:knowledge:gate`, `check:non-blocking`, `npm run generate:lesson-index`.
- e2e `apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3-qimat-ibara-harfiya.mjs` (every module mounts; nothing above the lab; bricks hidden
  before their answer; no raw `$`; coach step ids) + `node apps/web/e2e/lesson-route-boundary.mjs`. Port 5173 or 5174, never 4173.
- Catalogue: `status: "available"`, `durationMinutes` ≈ 85 (≤ 90), `difficulty: "متوسط"`, `icon: "🎯"`, final `pointsToLearn`,
  `pointPrerequisites` (§2). `npm run generate:learning-net`. Extraction: elements verified, destinations with module numbers,
  discrepancies updated, header boundary rewritten.
- Publish (coordinator, guide §11): gates `npm test`, `npm run check:lessons`, `npm run build`, `node scripts/learning-net-queue.mjs --check`;
  one commit; push `dev`; local DB handshake; publish the 9 modules and 50 exercises locally; progress report entry.

## 12. Generator notes (2026-10-26, Sonnet lead)

Minimal deviations from the plan, all recorded here:
- **`prep` item 2** is `2 × (8 − 5)` = 6 (re-read at 250 dpi by the extraction helper; the plan/extraction had `(8 − 5) × 2`); item 1 confirmed `8 − 5 × 2` = −2.
- **Not seeding**: the unit and its extraction already existed (seeded by `tabsit-hadhf-aqwas`); the extraction was updated (elements verified, destinations with module numbers, header boundary rewritten, `now-61` ② transcription fixed).
- **Lab**: `marble-run` as planned; two simplifications — the lever is a button (not a drag), and the « inlet » marbles are the slots of the written line (they all fill at once), no separate row. The reveal of the run is station by station (≈ 340 ms each, none under reduced motion); the verdict and the basket wait for its end. The plan's `LabFold` for the free panel was NOT used (the panel is always open, compacted).
- **`pointPrerequisites`**: `P2 ← P1`, `P3 ← P1, P2` and, because `amaliyat-natiqa` was published in the same batch, `P1 ← 3am_amaliyat-natiqa_P4` (its final « تنظيم سلسلة حسابات … باحترام أولوية العمليات والأقواس »). No edge toward `tabsit-hadhf-aqwas` / `nashr-jabri-3am`.
- **Bricks**: `ithar-darb`, `aqwas-salib`, `nafs-al-adad`, `harfan` (module 1), `tawid-qimat` (module 2), `mithal-mudad`, `nashr-yuthbit` (module 3; the plan named only `mithal-mudad`).
- **Module 2** opens on two numeric questions (3 then −1) then the gated brick, the box and the example; the second step has B at (−1,5 ; −7) and a remark on the exact value with π (`deep-37`). Both « تذكّر » boxes are always present and show their link only when `getLessonPath` answers (`amaliyat-natiqa` became available during the batch; `tatbiq-qaida-harfiya` is still `coming_soon`).
- **Module 4** exercises: ids `act-4` (E1), `ex-1` (E2, cites `ex-2`), `ex-3`, `ex-4`, `now-61`, `self-3`, `deep-39`, `deep-37` (with a `GeoFigure`: square + semicircle on its top side, measured in the test), `ict`; E4's ball keeps the plan's numbers (15, 20, 0, 18,75).
- **Primary الكفاءة** of the exercises: P1 `ex-4`, `deep-37`; P2 `ex-1`, `self-3`; P3 the five counter-example items. Final test: P1 E1, E4 · P2 E2, E3 · P3 E5.
- **`durationMinutes`** 64 (modules without the مسائل; 88 with them, cap 90).
- **Unit challenge card** (`units_3am › ibarat-harfiya-3.challenge.textAr`) rewritten with own numbers (« عددان مجموعهما 126,4 … لكل منهما 5 » → 657); its element `challenge` stays destined to `nashr-jabri-3am`'s bank, no `sourceElementId`.
- **Bank**: see the helper's counts in `MOYEN_ROLLOUT_PROGRESS.md` (50 sheets; 14 `term_exam` modelled, 36 `term_exam_modelled`, 0 adapted). Corpus facts found: `3am-s3-47` ex 1 is a 4-point MCQ (item III is the r03 one); `3am-s2-82` ex 5 part II is a Pythagoras tree (replaced by a budget decision); `3am-s3-49` ex 1 has no separate value step (its equation step is dropped: unit 5).
