# « مختبر التفكير » — Challenge bank, seed batch

> **Status.** This file is the authored seed content for the challenge ladder « سُلَّم التحدّيات » (path 1 of the
> thinking space).
>
>
> - **Written to the schema (published):** ALL 46 seed entries. #318 was written on 2026-10-30, and the other 45 on
>   2026-11-01 (phase 1), in `content/thinking-lab/challenges/`.
>   - Each has its oracle in `scripts/thinking-lab-oracle/{seed,primary,middle,secondary,university}.mjs`.
>   - 15 figures were drawn in code.
>   - The schema and pipeline are described in [`architecture/THINKING_LAB.md`](../architecture/THINKING_LAB.md).
> - **Where the JSON differs from the entries below, the JSON is right.**
>   - **Per-student numbers** were added where every tuple stays clean.
>   - **Summits** ask one question and put the rest in `parts`.
>   - **Multiples of 25** are summits, including #125 and #425, which this file does not mark.
>   - **Keys that computed the answer** were rewritten as questions.
>   - **#47:** splitting the balls in halves takes 3 weighings, not 4.
>   - **Interactive figures** (river, balance) are static in V1.
> - **Section 4 (backlog):** not written yet; phase 5.
> The implementation plan, which says how each entry becomes data, is
> [`reports/THINKING_LAB_PLAN_2026-10-30.md`](../reports/THINKING_LAB_PLAN_2026-10-30.md).
> Every answer below was checked numerically on 2026-10-30.

## 1. Rules every challenge follows

1. **Our own text.** Every statement is written for the platform, with our own numbers and
   Algerian everyday contexts. A source is credited as *inspiration* in the entry, never
   copied. This is the owner's independence rule (`CLAUDE.md`, « INDEPENDENCE FROM THE BOOK »),
   applied to puzzle books and competitions.
2. **Licence classes of sources.** Each entry declares one:
   - **PD (public domain).** Dudeney, *Amusements in Mathematics* (1917, Project Gutenberg #16713)
     and *The Canterbury Puzzles* (1907, #27635). Lewis Carroll, *A Tangled Tale* (1885, #29042).
     Alcuin's *Propositiones* (9th century). The idea may be adapted closely. We still rewrite the text and change the numbers.
   - **FOLK (folklore).** Classics with no single author: river crossings, the handshake count,
     Gauss's pairing, pigeonhole socks, the snail in the well, Josephus.
   - **TYPE (inspired by a type only).** Copyrighted competitions and authors: Math Kangaroo, UKMT,
     AMC, the shaded-area puzzles of Catriona Agg. Only the *kind* of problem is taken. The
     statement, figure and numbers are new. Never reproduce one of their problems.
3. **Respect.** No gambling (no dice games, no cards, no lottery, no betting), no alcohol, no pigs,
   no interest or usury, no non-Islamic festivals. Probability uses bags of balls, draws from a
   box and spinners in a science experiment. Girls in figures are drawn with `KidFigure`, the
   shared character.
4. **A different number for each student wherever possible** (`params`). The figure stays the same and the
   numbers change. A copied answer earns nothing; a copied method still helps.
5. **The answer is checkable by machine** (`check`): `integer`, `number` (tolerance), `rational`,
   `expression` (equivalence: evaluated at random values of the variables), `choice`.
6. **Three keys, each one a question:** S (analysis) → 👁 (observation) → R (relation). A key never
   contains a calculation that gives the answer away.
7. **The replay is honest.** At least one challenge in five shows a dead end « ↩ طريق مسدود »,
   and every replay of 6 steps or more has one « اشرح لنفسك » (explain to yourself) pause.
8. **Hidden bands** (the student sees only the number):

   | Numbers | Hidden band | Mode |
   |---|---|---|
   | 1–120 | primary | worked example → twin, no one-day lock |
   | 121–260 | middle | full « try first » (3 attempts + 1 day / teacher request) |
   | 261–420 | secondary | full « try first » |
   | 421–500 | university | full « try first » |

   Every multiple of 25 is a **summit** (« قمّة »): a larger challenge, often in parts.

## 2. Entry schema

```
### #<n> · <Arabic title>
- family · band · licence · exam tag (optional)
- statement: the Arabic text the student reads
- figure: what the code draws (SVG / whiteboard seed); "none" when there is none
- params: per-student numbers (optional)
- answer + check: the expected answer and how it is compared
- mistakes: frequent wrong answers → the reply (« ليس بعد … »)
- keys: S · 👁 · R
- observe: the observation target the platform detects (whiteboard), if any
- replay: the phase sequence + the key sentence of each important step
- twin · ceiling (« ارفع السقف »)
- move: the thinking move collected as a card (« أدوات الرياضي »)
```

The 40 entries below give each band its first challenges and its summits. Section 4 is the
backlog of further ideas, to be written to the same schema.

---

## 3. Seed entries

### Band 1–120 (primary · worked example then twin)

### #1 · مجموع عمرين
- family: ages · primary · FOLK
- statement: « عمر أحمد 8 سنوات وعمر أخته مريم 3 سنوات. بعد كم سنة يصبح مجموع عمريهما 25 سنة؟ »
- figure: two `KidFigure` children and a counter of years.
- params: ages (a, b) and target T with T − a − b even.
- answer: `7` · check `integer`.
- mistakes: `14` → « كل سنة تمرّ تزيد عمر الاثنين معًا: كم يزيد المجموع في السنة الواحدة؟ »
- keys: S « ماذا يحدث للمجموع بعد سنة واحدة؟ » · 👁 « المجموع يكبر بسنتين لا بسنة » · R « كم ينقص المجموع اليوم ليصل إلى 25؟ »
- replay: S → A → 👁 (+2 per year) → R (25 − 11 = 14, 14 ÷ 2 = 7) → T (15 + 10 = 25).
- twin: three siblings, the sum grows by 3 each year. · ceiling: « متى يصبح عمر أحمد ضعف عمر مريم؟ » (after 2 years).
- move: « ماذا يتغيّر في كل خطوة؟ »

### #5 · المصافحات الأولى
- family: counting · primary · FOLK
- statement: « التقى 5 أصدقاء، وصافح كل واحد منهم كل واحد من الآخرين مرّة واحدة. كم مصافحة حدثت؟ »
- figure: 5 points on a circle; a click draws a segment (whiteboard seed).
- params: n ∈ {4, 5, 6}.
- answer: `10` · check `integer` (n(n−1)/2).
- mistakes: `20` → « كل مصافحة يشترك فيها شخصان: هل عددتها مرّتين؟ » · `25` → « هل يصافح الشخص نفسه؟ »
- keys: S « ارسم الأصدقاء نقاطًا والمصافحة خطًّا » · 👁 « 5 × 4 يعدّ كل مصافحة مرّتين » · R « أقسم على 2 »
- observe: all 10 segments of the complete graph.
- replay: S → M (point = person, segment = handshake) → R (4 + 3 + 2 + 1) → 👁 (5 × 4 ÷ 2) → T.
- twin: diagonals of a hexagon (9). · ceiling: « كم شخصًا إذا حدثت 45 مصافحة؟ » (10).
- move: « عُدّ ثم انتبه لما عددته مرّتين »

### #12 · الحلزون في البئر
- family: patterns · primary · FOLK
- statement: « حلزون في قاع بئر عمقها 10 m. يصعد 3 m في النهار وينزلق 2 m في الليل. في أيّ يوم يخرج من البئر؟ »
- figure: an animated well with a day/night ruler.
- params: (depth, up, down) with depth > up.
- answer: `8` · check `integer`.
- mistakes: `10` → « في اليوم الأخير، هل ينزلق بعد أن يخرج؟ »
- keys: S « تابع الحلزون يومًا بيوم » · 👁 « اليوم الأخير مختلف: لا ليلة بعده » · R « متى يصل في الصباح إلى 7 m؟ »
- replay: S → ↩ (10 ÷ 1 = 10, a dead end, explained) → 👁 the last day → R (7 days × 1 m, then +3) → T.
- twin: depth 20, up 5, down 3 (day 9). · ceiling: a general formula.
- move: « انتبه لآخر خطوة: قد تختلف عن غيرها »

### #18 · جمع غاوس
- family: numbers · primary · FOLK
- statement: « احسب بسرعة: 1 + 2 + 3 + … + 20. »
- params: n ∈ {20, 30, 40, 50}.
- answer: `210` · check `integer` (n(n+1)/2).
- keys: S « هل تحتاج أن تجمع واحدًا واحدًا؟ » · 👁 « 1 + 20 = 2 + 19 = 3 + 18 … » · R « كم زوجًا؟ »
- replay: S → ↩ (adding one by one is slow and error-prone) → 👁 pairs → R (10 × 21) → T.
- twin: 1 + 2 + … + 100. · ceiling: 2 + 4 + … + 40.
- move: « اجمع الأطراف أزواجًا »

### #25 · قمّة · السياج
- family: geometry/counting · primary · FOLK · summit (2 parts)
- statement: « (أ) سياج مستقيم طوله 20 m، نضع عمودًا كل 2 m من أوّله إلى آخره. كم عمودًا؟ (ب) والآن حول حديقة مربّعة محيطها 20 m، عمود كل 2 m. كم عمودًا؟ »
- answer: (أ) `11` · (ب) `10` · check `integer` × 2.
- mistakes: (أ) `10` → « ارسم سياجًا طوله 4 m فقط: كم عمودًا تجد؟ »
- keys: S « جرّب حالة صغيرة » · 👁 « في الخطّ: عدد الأعمدة = عدد المسافات + 1. في الدائرة المغلقة: متساويان » · R « احسب عدد المسافات »
- replay: S (a small case) → 👁 → R → T, then part (ب) compared with (أ).
- move: « جرّب حالة صغيرة »

### #33 · الراعي والنهر
- family: logic · primary · PD (Alcuin, *Propositiones*)
- statement: « راعٍ معه ذئب وخروف وحزمة برسيم، وقارب لا يحمل إلا هو وشيئًا واحدًا. إذا بقي الذئب مع الخروف وحدهما أكله، وإذا بقي الخروف مع البرسيم أكله. كيف يعبر الجميع؟ أقلّ عدد من العبورات؟ »
- figure: an interactive river; the student moves the boat.
- answer: `7` · check `integer`, and the solution path is validated by state simulation.
- keys: S « من هو الخطير على من؟ » · 👁 « الخروف هو المشكلة في الحالتين » · R « ماذا لو أعدت شيئًا معك في الطريق؟ »
- replay: S → ↩ (taking the wolf first, which fails) → 👁 the sheep → R (bring the sheep back) → T.
- move: « قد تحتاج أن ترجع خطوة إلى الوراء »

### #47 · الكرة الأثقل
- family: logic · primary · FOLK
- statement: « عندك 9 كرات متشابهة، واحدة منها أثقل قليلًا، وميزان بكفّتين. ما أقلّ عدد من الوزنات يكفي دائمًا لإيجادها؟ »
- figure: a playable balance.
- answer: `2` · check `integer`, then a play-through on the balance.
- mistakes: `3` or `4` → « هل يجب أن تكون الكفّتان ممتلئتين بكل الكرات؟ ماذا تخبرك الكرات التي لم تضعها؟ »
- keys: S « كم نتيجة ممكنة لكل وزنة؟ » · 👁 « ثلاث نتائج: يسار، يمين، توازن » · R « قسّم إلى ثلاث مجموعات »
- replay: S → ↩ (dividing in two gives 4 weighings) → 👁 3 outcomes → R (3 + 3 + 3, then 1 + 1 + 1) → T.
- twin: 27 balls (3 weighings). · ceiling: 12 balls, the odd one heavier or lighter (FOLK, hard).
- move: « عُدّ النتائج الممكنة لكل فعل »

### #60 · الجوارب في الظلام
- family: logic · primary · FOLK
- statement: « في درج 10 جوارب بيضاء و 10 سوداء، والغرفة مظلمة. كم جوربًا تسحب على الأقل لتتأكّد أن معك زوجًا من اللون نفسه؟ »
- answer: `3` · check `integer`.
- mistakes: `11` → « لم يُطلب زوج أبيض، بل أيّ زوج من لون واحد »
- keys: S « ما أسوأ ما يمكن أن يحدث؟ » · 👁 « بلونين فقط » · R « بعد جوربين مختلفين، ماذا يفعل الثالث؟ »
- move: « فكّر في أسوأ حالة » (pigeonhole, first contact)

### #72 · أرقام الصفحات
- family: numbers · primary · TYPE (Kangaroo-like)
- statement: « كم رقمًا نكتب لترقيم صفحات كتاب من الصفحة 1 إلى الصفحة 120؟ »
- params: last page ∈ {99, 120, 150, 200}.
- answer: `252` · check `integer`.
- keys: S « هل لكل الصفحات عدد الأرقام نفسه؟ » · 👁 « ثلاث مجموعات: رقم واحد، رقمان، ثلاثة » · R « عُدّ كل مجموعة »
- replay: S → A → 👁 → R (9 + 180 + 63) → T.
- move: « قسّم إلى حالات »

### #88 · البحيرة والطحالب
- family: patterns · primary · FOLK
- statement: « تتضاعف مساحة الطحالب على بحيرة كل يوم. غطّت البحيرة كاملة في اليوم 30. في أيّ يوم كانت تغطّي نصفها؟ »
- answer: `29` · check `integer`.
- mistakes: `15` → « في اليوم 15، هل كانت نصف مساحة اليوم 30؟ تتضاعف، لا تزيد بنفس المقدار »
- keys: S « ماذا يعني التضاعف؟ » · 👁 « اعمل بالعكس من اليوم 30 » · R « يومًا واحدًا إلى الوراء »
- move: « اعمل بالعكس »

### #100 · قمّة · طرق الدفع
- family: counting · primary · TYPE · summit
- statement: « بكم طريقة يمكن أن تدفع 50 دج بقطع من فئة 10 دج و 20 دج فقط؟ ثم: بقطع 5 و 10 و 20 دج؟ »
- answer: `3`, then `12` · check `integer` × 2.
- keys: S « رتّب: ابدأ بأكبر قطعة » · 👁 « عدد القطع الكبيرة يحدّد الباقي » · R « جدول منظّم »
- replay: R builds an organised table and shows a list that misses cases (↩).
- move: « نظّم العدّ في جدول »

### Band 121–260 (middle · full « try first »)

### #125 · السرعة المتوسّطة
- family: algebra · middle · PD (Dudeney #67, adapted) · exam: BEM proportionality
- statement: « ذهب كريم بالحافلة إلى وهران بسرعة 60 km/h، وعاد في الطريق نفسه بسرعة 40 km/h. ما سرعته المتوسّطة في الرحلة كلها؟ »
- params: (v1, v2) ∈ {(60, 40), (90, 60), (30, 20)}.
- answer: `48` · check `number` (harmonic mean 2v1v2 / (v1 + v2)).
- mistakes: `50` → « هل قضى المدّة نفسها في الذهاب والعودة؟ »
- keys: S « السرعة المتوسّطة = ؟ ÷ ؟ » · 👁 « المسافة لا تُعطى: اخترها أنت! » · R « خذ مسافة مناسبة، 120 km مثلًا »
- replay: S → ↩ (the average (60 + 40) ÷ 2) → 👁 choose a convenient distance → R (2 h + 3 h, 240 ÷ 5) → T.
- twin: a cyclist at 12 and 6 km/h (8). · ceiling: « هل يمكن أن تكون المتوسّطة 50 إذا كانت سرعة الذهاب 25؟ »
- move: « عندما ينقص معطى، اختر له قيمة مريحة »

### #132 · إلى بيت الجدّ
- family: algebra · middle · PD (Dudeney #71, new numbers)
- statement: « إذا سار يونس بدرّاجته بسرعة 12 km/h وصل إلى بيت جدّه قبل الموعد بنصف ساعة، وإذا سار بسرعة 8 km/h وصل بعده بنصف ساعة. ما المسافة؟ »
- answer: `24` (km) · check `number`.
- keys: S « ما الثابت بين الحالتين؟ » · 👁 « الفرق بين المدّتين ساعة كاملة » · R « d/8 − d/12 = 1 »
- replay: … → T (2 h and 3 h, the appointment is at 2.5 h ✓).
- move: « اكتب ما هو ثابت »

### #138 · عمر الأم وابنتها
- family: algebra · middle · PD (Dudeney #43, new numbers)
- statement: « عمر الأم اليوم ضعف عمر ابنتها. وقبل 12 سنة كان عمرها ثلاثة أضعاف عمر ابنتها. كم عمر كل منهما اليوم؟ »
- answer: `24` and `48` · check `integer` × 2.
- keys: S « مجهولان، وعلاقتان » · 👁 « سمِّ عمر البنت x فيصبح عمر الأم 2x » · R « 2x − 12 = 3(x − 12) »
- move: « سمِّ المجهول »

### #150 · قمّة · الدجاج والأرانب
- family: algebra/logic · middle · FOLK · summit (2 methods)
- statement: « في مزرعة دجاج وأرانب: 20 رأسًا و 56 رجلًا. كم أرنبًا؟ ثم حلّها بطريقة ثانية. »
- params: (heads, legs) with legs even, 2h ≤ legs ≤ 4h.
- answer: `8` · check `integer`; the second method is shown under « طرق أخرى ».
- keys: S « لو كانت كلها دجاجًا؟ » · 👁 « كل أرنب يضيف رجلين » · R « (56 − 40) ÷ 2 »
- replay: method 1 (imagine all chickens) and method 2 (a system of two equations), both shown.
- move: « تخيّل حالة متطرّفة »

### #158 · زيادة ثم تخفيض
- family: numbers · middle · TYPE · exam: BEM percentages
- statement: « ارتفع ثمن محفظة بـ 20 %، ثم انخفض الثمن الجديد بـ 20 %. هل عاد إلى ثمنه الأوّل؟ ما النسبة النهائية للتغيّر؟ »
- answer: `−4` (%) · check `number`.
- mistakes: `0` → « جرّب بثمن 100 دج »
- keys: S « على أيّ عدد طُبّقت كل نسبة؟ » · 👁 « التخفيض يُحسب من الثمن الجديد » · R « 1.2 × 0.8 »
- move: « جرّب بعدد سهل »

### #166 · العددان المقلوبان
- family: numbers · middle · TYPE
- statement: « عدد من رقمين، نجمعه مع العدد الذي نحصل عليه بقلب رقميه، فنجد 132. كم عددًا يحقّق ذلك؟ »
- answer: `7` · check `integer`.
- keys: S « اكتب العدد بالرقمين a و b » · 👁 « 10a + b + 10b + a = 11(a + b) » · R « a + b = 12 »
- move: « اكتب العدد بأرقامه »

### #175 · قمّة · الأكياس الثلاثة
- family: algebra · middle · PD (Carroll, Knot IV, simplified) · summit
- statement: « وزنّا ثلاثة أكياس اثنين اثنين، فوجدنا 10 kg و 13 kg و 15 kg. كم يزن كل كيس؟ ثم: خمسة أكياس، وُزنت أزواجًا في كل التركيبات (عشر وزنات)… »
- answer: `4, 6, 9` · check `integer` × 3.
- keys: S « كم مرّة دخل كل كيس في الوزنات؟ » · 👁 « اجمع الوزنات الثلاث: كل كيس محسوب مرّتين » · R « المجموع 19، ثم اطرح »
- move: « اجمع كل شيء ثم انظر »

### #182 · المربّع المائل
- family: geometry · middle · TYPE (shaded area)
- statement: « داخل مربّع ضلعه 10 cm، رسمنا مربّعًا رؤوسه على أضلاعه، كل رأس يبعد 3 cm عن ركن. ما مساحة المربّع الداخلي؟ »
- figure: two squares, the four right triangles that can be highlighted.
- params: (side, d).
- answer: `58` · check `number`.
- keys: S « هل تحتاج طول ضلع المربّع الداخلي؟ » · 👁 « أربعة مثلّثات قائمة متطابقة حوله » · R « 100 − 4 × (3 × 7 ÷ 2) »
- observe: the student shades or outlines a corner triangle.
- replay: S → ↩ (computing √(9 + 49) first, valid but longer) → 👁 → R → T (√58² = 58 ✓, both methods meet).
- move: « احسب ما حول الشكل بدل الشكل »

### #190 · الصادقون والكاذبون
- family: logic · middle · FOLK (format)
- statement: « في قرية، الصادق يقول الصدق دائمًا، والكاذب يكذب دائمًا. قال أمين: "بلال كاذب". وقال بلال: "أمين وسليم من النوع نفسه". ماذا تعرف عن سليم؟ »
- answer: `choice`: « سليم كاذب » (among: صادق / كاذب / لا يمكن المعرفة).
- keys: S « افترض أن أمين صادق » · 👁 « جرّب الحالتين » · R « ماذا تقول كل حالة عن سليم؟ »
- replay: two branches drawn as a tree; both end at « سليم كاذب ».
- move: « افترض، ثم تابع حتى النهاية »

### #200 · قمّة · السلّم المنزلق
- family: geometry · middle · TYPE · exam: BEM Pythagoras · summit
- statement: « سلّم طوله 5 m مسنود إلى حائط، قدمه على بعد 3 m من الحائط. انزلقت قدمه 1 m إضافيًّا مبتعدة عن الحائط. كم نزل رأسه؟ »
- figure: the wall and the ladder, draggable.
- answer: `1` (m) · check `number`.
- mistakes: `0` → « احسب الارتفاع قبل وبعد »
- keys: S « مثلّث قائم قبل الانزلاق وبعده » · 👁 « 3، 4، 5 ثم 4، 3، 5 » · R « فيثاغورس مرّتين »
- ceiling: « هل ينزل الرأس دائمًا بالمقدار الذي تبتعد به القدم؟ » (no, a counterexample with 6 m).
- move: « ارسم الوضعيتين »

### #210 · مجموع الأعداد الفردية
- family: patterns · middle · FOLK
- statement: « احسب 1 + 3 + 5 + … + 99. »
- answer: `2500` · check `integer`.
- keys: S « احسب 1، 1 + 3، 1 + 3 + 5… » · 👁 « 1، 4، 9، 16: مربّعات! » · R « كم عددًا فرديًّا من 1 إلى 99؟ »
- figure: an L-shaped gnomon square that grows (shown in the replay).
- move: « ابحث عن نمط في الحالات الصغيرة »

### #220 · آخر رقم
- family: numbers · middle · TYPE
- statement: « ما هو رقم الآحاد في العدد 7^2026؟ »
- answer: `9` · check `integer`.
- keys: S « احسب آحاد 7، 7²، 7³، 7⁴… » · 👁 « الدورة 7، 9، 3، 1 تتكرّر كل 4 » · R « باقي 2026 على 4 »
- move: « ابحث عن الدورة »

### #232 · الحنفيتان
- family: algebra · middle · FOLK
- statement: « حنفية تملأ خزّانًا في 6 ساعات، وأخرى في 3 ساعات. في كم ساعة تملآنه معًا؟ »
- answer: `2` · check `number`.
- mistakes: `4.5` → « إذا عملتا معًا، هل تستغرقان وقتًا أطول من الحنفية السريعة وحدها؟ »
- keys: S « كم تملأ كل حنفية في ساعة واحدة؟ » · 👁 « 1/6 + 1/3 = 1/2 » · R « نصف الخزّان في ساعة »
- move: « فكّر في وحدة زمن واحدة »

### #250 · قمّة · ظلّ الشجرة
- family: geometry · middle · TYPE · exam: BEM Thales · summit (2 parts)
- statement: « في الوقت نفسه، عصا طولها 1.5 m لها ظلّ 2 m، وشجرة لها ظلّ 18 m. ما ارتفاع الشجرة؟ ثم: إذا كان طولك 1.6 m، فكم يكون ظلّك؟ »
- answer: `13.5` then `2.13…` (`32/15`) · check `number`.
- keys: S « ما المشترك بين العصا والشجرة؟ » · 👁 « أشعة الشمس متوازية: مثلّثان متشابهان » · R « تناسب »
- move: « ابحث عن التشابه »

### Band 261–420 (secondary)

### #265 · مقلوب ومربّع
- family: algebra · secondary · TYPE
- statement: « إذا كان x + 1/x = 3، فاحسب x² + 1/x² دون حساب x. »
- answer: `7` · check `number`.
- keys: S « هل تحتاج x؟ » · 👁 « ربّع العلاقة المعطاة » · R « (x + 1/x)² = x² + 2 + 1/x² »
- replay: S → ↩ (solving the quadratic, heavy) → 👁 → R → T (with x = (3 + √5)/2 numerically).
- ceiling: x³ + 1/x³ (18).
- move: « حوّل المعطى بدل حلّه »

### #275 · قمّة · فرق المربّعين
- family: numbers · secondary · TYPE · summit
- statement: « احسب ذهنيًّا: 2027² − 2026². ثم: 1² − 2² + 3² − 4² + … + 99² − 100². »
- answer: `4053`, then `−5050` · check `integer` × 2.
- keys: S « لا تربّع! » · 👁 « a² − b² = (a − b)(a + b) » · R « كل زوج يعطي −(2k − 1 + 2k) »
- move: « تعرّف على الشكل المختصر »

### #300 · قمّة · الدالة الغامضة
- family: functions · secondary · TYPE · summit
- statement: « دالة f تحقّق f(0) = 0 و f(x + 1) = f(x) + 2x + 1 لكل x. احسب f(10). ثم خمّن عبارة f(n) وبرهنها. »
- answer: `100`; the conjecture `n^2` · check `integer`, then `expression`.
- keys: S « احسب f(1)، f(2)، f(3) » · 👁 « 1، 4، 9… » · R « برهان بالتراجع »
- move: « احسب الحالات الأولى ثم خمّن ثم برهن »

### #310 · الكرات في الكيس
- family: probability · secondary · TYPE · exam: BAC probability
- statement: « في كيس 3 كرات حمراء و 2 زرقاء. نسحب كرتين واحدة بعد الأخرى دون إرجاع. ما احتمال أن تكونا حمراوين؟ »
- answer: `3/10` · check `rational`.
- mistakes: `9/25` → « هل أرجعت الكرة الأولى؟ » · `3/5` → « هذا احتمال الكرة الأولى فقط »
- keys: S « ما الذي يتغيّر بعد السحب الأوّل؟ » · 👁 « في السحب الثاني بقيت 4 كرات، منها 2 حمراوان » · R « 3/5 × 2/4 »
- move: « ارسم شجرة »

### #318 · المساحة بين الأقواس الأربعة (the platform's showcase)
- family: geometry · secondary · TYPE (shaded area) · inspired by the owner's post « تحدّي SMART #1 »
- statement: « مربّع طول ضلعه x، رسمنا من كل رأس من رؤوسه ربع دائرة نصف قطرها x. احسب مساحة المنطقة المشتركة بين الأقواس الأربعة بدلالة x. »
- figure: the square, the four arcs, the shaded central region (the shading is the intersection of the FOUR arcs; the original post image shades a lens and must be corrected).
- params: none (the answer is an expression in x).
- answer: `x^2*(1 + pi/3 - sqrt(3))` ≈ 0.3151x² · check `expression` (also accepts `(3 + pi - 3*sqrt(3))*x^2/3`).
- mistakes: `1 − π/4` (≈ 0.2146) → « هذه مساحة ركن واحد خارج ربع الدائرة » · `π/2 − 1` (≈ 0.5708) → « هذه مساحة تقاطع قوسين فقط (العدسة) » · ≤ 0 or ≥ 1 for x = 1 → « المنطقة داخل مربّع مساحته x² »
- keys: S « هل تعرف قانونًا لهذا الشكل؟ إلى أيّ أشكال معروفة يمكن تقطيعه؟ » · 👁 « صل نقطة تقاطع قوسين برأسي المربّع اللذين هما مركزاهما: ما أطوال المثلّث؟ » · R « المنطقة = مربّع رؤوسه نقاط التقاطع + 4 قطع دائرية: بأيّ زاوية يرى المركز كل قطعة؟ »
- observe: the equilateral triangle (two corners + an intersection point) drawn on the whiteboard.
- replay: S (symmetry) → ↩ (square minus surroundings: harder) → A (turn into known shapes) → 👁 (equilateral triangle) → M (h = (√3/2)x) → R (inner square + 4 segments) → R (d = (√3 − 1)x, area (2 − √3)x²) → 👁 « اشرح لنفسك: لماذا 30°؟ » (segment ½x²(π/6 − ½)) → R (sum) → T (≈ 0.315 for x = 1).
- twin: #333. · ceiling: the same construction in an equilateral triangle of side x.
- move: « دوائر نصف قطرها يساوي المسافة بين مراكزها: ابحث عن مثلّث متساوي الأضلاع » + « منحنٍ = مضلّع + قطع دائرية »

### #325 · قمّة · الدائرة في المثلّث القائم
- family: geometry · secondary · TYPE · summit
- statement: « مثلّث قائم أضلاعه 3 و 4 و 5. ما نصف قطر الدائرة المحاطة به (المماسّة لأضلاعه الثلاثة)؟ ثم عمّم لمثلّث قائم ضلعاه a و b ووتره c. »
- answer: `1`, then `(a + b − c)/2` · check `number`, then `expression`.
- keys: S « ارسم أنصاف الأقطار نحو نقاط التماسّ » · 👁 « مماسّان من نقطة واحدة متساويان » · R « (3 − r) + (4 − r) = 5 »
- move: « المماسّات المتساوية »

### #333 · العدسة (twin of #318)
- family: geometry · secondary · TYPE
- statement: « دائرتان نصف قطر كل منهما r، ومركز كل واحدة على محيط الأخرى. احسب مساحة المنطقة المشتركة. »
- answer: `r^2*(2*pi/3 - sqrt(3)/2)` ≈ 1.2284r² · check `expression`.
- keys: S « مضلّع + قطع » · 👁 « المركزان ونقطة تقاطع: مثلّث متساوي الأضلاع » · R « قطعتان بزاوية 120° »
- move: same as #318 (the card levels up).

### #340 · الطرق على الشبكة
- family: counting · secondary · TYPE · exam: BAC counting
- statement: « على شبكة 4 × 4، ننتقل من الركن السفلي الأيسر إلى الركن العلوي الأيمن خطوة إلى اليمين أو خطوة إلى الأعلى فقط. كم طريقًا؟ »
- answer: `70` · check `integer`.
- keys: S « كم خطوة في كل طريق؟ » · 👁 « كل طريق = كلمة من 4 "يمين" و 4 "أعلى" » · R « اختيار مواضع "يمين": C(8, 4) »
- replay: also the table method (Pascal's triangle written on the grid).
- move: « حوّل الطريق إلى كلمة »

### #350 · قمّة · كم كانوا؟
- family: algebra · secondary · FOLK · summit
- statement: « في حفل تخرّج، صافح كل حاضر كل الآخرين مرّة واحدة، فكانت 66 مصافحة. كم حاضرًا؟ »
- answer: `12` · check `integer`.
- keys: S « تذكّر المصافحات » · 👁 « n(n − 1)/2 = 66 » · R « معادلة من الدرجة الثانية، أو جرّب أعدادًا قريبة »
- move: « مسألة قديمة في ثوب جديد »

### #358 · جداء مثلّثي
- family: trigonometry · secondary · TYPE
- statement: « احسب sin 15° × cos 15° دون آلة حاسبة. »
- answer: `1/4` · check `rational`.
- keys: S « أين رأيت sin a × cos a؟ » · 👁 « sin 2a = 2 sin a cos a » · R « ½ sin 30° »
- move: « ابحث عن القانون الذي يحتوي الشكل »

### #375 · قمّة · قوى 2
- family: sequences · secondary · TYPE · summit
- statement: « احسب 1 + 2 + 4 + 8 + … + 1024. ثم: لماذا تكون 1 + 2 + 4 + … + 2ⁿ أقلّ من 2ⁿ⁺¹ دائمًا بواحد؟ »
- answer: `2047` · check `integer`.
- keys: S « احسب المجاميع الأولى » · 👁 « 1، 3، 7، 15: قبل قوّة 2 بواحد » · R « S = 2S − S »
- move: « اضرب ثم اطرح »

### #384 · أين الخطأ؟
- family: critical thinking · secondary · FOLK
- statement: « "برهان" أن 1 = 2: ليكن a = b. إذن a² = ab، و a² − b² = ab − b²، أي (a − b)(a + b) = b(a − b)، فـ a + b = b، أي 2b = b، أي 2 = 1. في أيّ سطر الخطأ؟ »
- answer: `choice`: the line that divides by (a − b).
- keys: S « تحقّق من كل سطر بقيم a = b = 1 » · 👁 « a − b = 0 » · R « القسمة على صفر »
- move: « تحقّق من كل سطر بقيمة »

### #392 · نهاية خفيّة
- family: analysis · secondary · TYPE · exam: BAC limits
- statement: « احسب نهاية √(x² + x) − x عندما يؤول x إلى +∞. »
- answer: `1/2` · check `rational`.
- mistakes: `0` → « ∞ − ∞ ليست صفرًا. ماذا تفعل أمام هذا الشكل؟ »
- keys: S « ما شكل عدم التعيين؟ » · 👁 « اضرب في المرافق » · R « x / (√(x² + x) + x) »
- move: « المرافق يزيل الجذر »

### #400 · قمّة · أصفار 100!
- family: numbers · secondary · TYPE · summit
- statement: « بكم صفر ينتهي العدد 100! = 1 × 2 × 3 × … × 100؟ »
- answer: `24` · check `integer`.
- mistakes: `20` → « 25 = 5 × 5: كم مرّة يدخل 5 فيها؟ »
- keys: S « من أين يأتي الصفر؟ » · 👁 « كل صفر = 2 × 5، والخمسات أقلّ » · R « عُدّ الخمسات: 20 + 4 »
- move: « اسأل: ما الذي يصنع الشيء الذي أعدّه؟ »

### Band 421–500 (university)

### #425 · مجموع يتلاشى
- family: sequences · university · TYPE
- statement: « احسب 1/(1×2) + 1/(2×3) + … + 1/(99×100). »
- answer: `99/100` · check `rational`.
- keys: S « احسب أوّل حدّين أو ثلاثة » · 👁 « 1/(k(k + 1)) = 1/k − 1/(k + 1) » · R « الحدود تتلاشى »
- move: « فكّك الحدّ »

### #435 · الرسائل الضائعة
- family: counting · university · FOLK (derangements)
- statement: « أربع رسائل وأربعة أظرف مكتوبة عليها العناوين. بكم طريقة نضع الرسائل بحيث لا تدخل أيّ رسالة ظرفها الصحيح؟ »
- answer: `9` · check `integer`.
- keys: S « جرّب 2 ثم 3 رسائل » · 👁 « 1، 2، 9… » · R « الإدخال والإخراج، أو العلاقة التراجعية »
- move: « عُدّ المرفوض واطرحه »

### #450 · قمّة · تكامل بالتجزئة
- family: analysis · university · TYPE · summit
- statement: « احسب ∫₀¹ x eˣ dx. ثم ∫₀¹ x² eˣ dx. »
- answer: `1`, then `e − 2` · check `number` × 2.
- keys: S « جداء دالّتين » · 👁 « اشتقاق x يبسّطها » · R « التكامل بالتجزئة »
- move: « بسّط بالاشتقاق »

### #460 · عيد الميلاد المشترك
- family: probability · university · FOLK
- statement: « في قسم من 23 تلميذًا، ما احتمال أن يكون لتلميذين على الأقل تاريخ الميلاد نفسه؟ (365 يومًا، والأيام متساوية الاحتمال) »
- answer: ≈ `0.507` · check `number` (tolerance 0.005).
- mistakes: `23/365` → « احسب الحدث المعاكس: ألّا يتكرّر أيّ تاريخ »
- keys: S « الحدث "على الأقل" » · 👁 « المعاكس أسهل » · R « 1 − (365 × 364 × … × 343)/365²³ »
- move: « احسب المعاكس »

### #475 · قمّة · الباقي
- family: numbers · university · TYPE · summit
- statement: « ما باقي قسمة 2¹⁰⁰ على 7؟ ثم: على 13؟ »
- answer: `2`, then `3` · check `integer` × 2 (2¹² ≡ 1 mod 13, 100 = 8·12 + 4, 2⁴ = 16 ≡ 3).
- keys: S « احسب بواقي 2، 4، 8، 16… على 7 » · 👁 « 2³ ≡ 1 » · R « 100 = 3 × 33 + 1 »
- move: « ابحث عن الدورة » (the #220 card levels up)

### #490 · لوح الحلوى
- family: invariants · university · FOLK
- statement: « لوح حلوى من 6 × 8 مربّعات. في كل مرّة نكسر قطعة واحدة على خطّ مستقيم إلى قطعتين. كم كسرة نحتاج للحصول على 48 مربّعًا منفصلًا، مهما كانت الطريقة؟ »
- answer: `47` · check `integer`.
- keys: S « جرّب لوحًا صغيرًا بطرق مختلفة » · 👁 « كل كسرة تزيد عدد القطع بواحد » · R « من 1 إلى 48 »
- move: « ابحث عمّا لا يتغيّر (اللامتغيّر) »

### #500 · قمّة · الدائرة الأخيرة
- family: recursion · university · FOLK (Josephus) · summit
- statement: « وقف 41 طفلًا في دائرة مرقّمين من 1 إلى 41. نبدأ من الطفل 1، ويخرج كل ثاني طفل (2، 4، 6…) وتستمرّ الدائرة. ما رقم الطفل الذي يبقى أخيرًا؟ ثم: لـ n طفلًا؟ »
- answer: `19`, then `2(n − 2^k) + 1` with 2^k ≤ n < 2^(k+1) · check `integer`, then `choice`.
- keys: S « جرّب n = 1، 2، 3… 10 » · 👁 « عند قوى 2 يبقى الطفل 1 » · R « 41 = 32 + 9 »
- move: « جدول الحالات الصغيرة يكشف القاعدة »

---

## 4. Backlog (to write to the full schema)

Each line becomes a full entry. Numbers are indicative; the ladder reorders itself by
hidden rating (plan §4).

| ~# | Family | Idea | Licence |
|---|---|---|---|
| 2–10 | ages / money | change from a purchase, sum of ages of three siblings, pocket money saved weekly | FOLK |
| 14 | patterns | the next term of 2, 6, 12, 20, 30… (n(n+1)) | FOLK |
| 20 | geometry | how many squares on a 3 × 3 grid (14) | TYPE |
| 28 | logic | three boxes with wrong labels « تمر » / « لوز » / « مخلوط »: open one box only | FOLK |
| 36 | counting | number of triangles in a subdivided triangle | TYPE |
| 40 | money | pay exactly 70 DA with the fewest coins | TYPE |
| 52 | logic | measure 4 L with jugs of 3 L and 5 L | FOLK |
| 64 | numbers | the smallest number divisible by 2, 3, 4, 5, 6 (60) | TYPE |
| 80 | geometry | perimeter of a staircase shape = perimeter of the rectangle around it | TYPE |
| 95 | logic | Sudoku-type 4 × 4 with arithmetic cages | FOLK |
| 110 | patterns | matchstick squares: how many matches for n squares in a row (3n + 1) | FOLK |
| 128 | algebra | two trains meet: Dudeney #68 type with new numbers | PD |
| 135 | numbers | divisibility by 9: the missing digit of 5_47 so it is divisible by 9 | TYPE |
| 142 | money | Dudeney #38 type (a buyer pays with a worthless cheque) rewritten as a counterfeit banknote: total loss | PD |
| 155 | geometry | the angle between clock hands at 3:40 (130°) | FOLK |
| 162 | algebra | clock hands overlap after 3:00 (16 4/11 min) | FOLK |
| 170 | logic | who sits where: 4 friends, 4 clues | TYPE |
| 185 | geometry | the area of a shaded quarter-circle region in a square (16 − 4π type) | TYPE |
| 195 | numbers | the sum of digits of numbers 1 to 99 (900) | TYPE |
| 205 | algebra | Alcuin's « 100 bushels for 100 people » rewritten as dates and bread: integer solutions | PD |
| 215 | geometry | the diagonal of a cuboid room | TYPE |
| 225 | summit | a 3-part problem on proportionality: map scale, speed, recipe | TYPE |
| 238 | statistics | mean, median: the effect of adding one value | TYPE |
| 245 | geometry | diagonals of a 12-gon (54) | FOLK |
| 262 | algebra | Dudeney #74 type: collecting potatoes in a row (a sum of an arithmetic sequence) | PD |
| 270 | functions | the maximum area of a rectangle with perimeter 20 (25) | TYPE |
| 282 | vectors | Varignon: the midpoints of any quadrilateral form a parallelogram | FOLK |
| 290 | sequences | the lily pad, then compound growth with no interest (populations) | FOLK |
| 305 | geometry | the angle inscribed in a semicircle (Thales), discovered on the whiteboard | FOLK |
| 315 | inequalities | x + 4/x ≥ 4 for x > 0, with the equality case | TYPE |
| 330 | probability | at least one red in 3 draws with replacement | TYPE |
| 345 | logic | the 12-ball problem (heavier OR lighter, 3 weighings) | FOLK |
| 362 | geometry | the area of the regular hexagon from its side, cut into 6 triangles | TYPE |
| 370 | complex | i^2026 (−1) | TYPE |
| 380 | analysis | the minimum of a distance with the derivative (the shortest route to a river) | FOLK |
| 395 | proof | √2 is irrational: put the steps of a proof in order | FOLK |
| 410 | pigeonhole | 5 points in a square of side 2: two are at most √2 apart | FOLK |
| 430 | analysis | the limit of (1 + 1/n)^n, observed then proved | FOLK |
| 440 | linear algebra | how many 2 × 2 matrices with entries 0/1 are invertible (6) | TYPE |
| 455 | series | the sum of 1/2^k (1) and the "Zeno" walk to the wall | FOLK |
| 465 | graphs | Königsberg-type: can you draw this figure without lifting the pen? (Euler) | FOLK |
| 480 | number theory | there are infinitely many primes (Euclid): order the proof | FOLK |
| 495 | probability | the expected number of draws to see both colours | TYPE |

Target for V1 of the ladder: **150 challenges** (40 above + about 110 written from this backlog and
from new ideas). It then grows by batches of 50 (plan §8).

## 5. Sources consulted (inspiration, not copied text)

- H. E. Dudeney, *Amusements in Mathematics* (1917), Project Gutenberg #16713 —
  https://gutenberg.org/ebooks/16713 (public domain in the USA; check local law before quoting text).
- H. E. Dudeney, *The Canterbury Puzzles* (1907), Project Gutenberg #27635 —
  https://gutenberg.org/ebooks/27635
- Lewis Carroll, *A Tangled Tale* (1885), Project Gutenberg #29042 — https://www.gutenberg.org/ebooks/29042
  (Knot I: 24 miles; Knot III: 19 trains; Knot IV: sacks weighed in pairs).
- Math Kangaroo levels and sample sets (copyrighted; types only) — https://www.cuemath.com/blog/math-kangaroo-past-papers/
- UKMT Junior Mathematical Challenge (copyrighted; types only) — e.g. https://birkenheadparkschool.com/files/UKMT/JMC2017_sol_extended.pdf
- Catriona Agg's shaded-area geometry puzzles (copyrighted; style only) — https://mathgames.substack.com/p/math-games-the-catriona-agg-geometry
- NRICH, low-threshold high-ceiling tasks (the « ارفع السقف » idea) — https://nrich.maths.org/7701
- A. Engel, *Problem-Solving Strategies*, and Andreescu & Gelca, *Putnam and Beyond* (strategy families:
  invariants, extremal principle, pigeonhole) — used for the « move » cards, not for problems.
