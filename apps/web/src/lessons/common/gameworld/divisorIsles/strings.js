/**
 * « أرخبيل القواسم » — every sentence of the game (Arabic, the platform's own wording; nothing is quoted from the textbook).
 * A rule is NAMED only on a « لوح المعرفة » that opens AFTER the student has seen it happen in the world.
 */
/** Arabic number agreement: « لوح واحد », « لوحان », « 5 ألواح », « 21 لوحًا ». */
export const planks = (q) =>
  q === 1 ? 'لوح واحد' : q === 2 ? 'لوحان' : q >= 3 && q <= 10 ? `${q} ألواح` : `${q} لوحًا`;
const cells = (r) =>
  r === 1
    ? 'خانة واحدة فارغة'
    : r === 2
      ? 'خانتان فارغتان'
      : r >= 3 && r <= 10
        ? `${r} خانات فارغة`
        : `${r} خانة فارغة`;

const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });

/**
 * The sentence of a practice wave (shown big above the rail). `$…$` is maths. A wave of a type this world does not know
 * is one the lesson wrote itself: its own `say` (and its own guidance `why`, read by `explain`).
 */
export function waveSay(w) {
  switch (w.type) {
    case 'divisorOf':
    case 'sureOf':
    case 'fromProduct':
      return `قاسم للعدد ${w.a}`;
    case 'divides':
      return `عدد يقسم ${w.a}`;
    case 'multipleOf':
      return `مضاعف للعدد ${w.b}`;
    case 'divisibleBy':
      return `عدد يقبل القسمة على ${w.b}`;
    case 'remainder':
      return `باقي قسمة ${w.a} على ${w.b}`;
    case 'missing':
      return `$${w.a} = ${w.b} \\times \\square$`;
    case 'everyNumber':
      return 'قاسم لكلّ عدد طبيعي';
    case 'biggest':
      return `أكبر قاسم للعدد ${w.a}`;
    case 'smallest':
      return `أصغر قاسم للعدد ${w.a}`;
    case 'lastTry':
      return `آخر عدد نجرّبه لتعيين قواسم ${w.a}`;
    case 'countOf':
      return `عدد قواسم ${w.a}`;
    default:
      return w.say ?? '';
  }
}
/** A line above the sentence, when the wave gives something to read first (the product of « اقرأ الجداء »). */
export const waveHint = (w) => (w.type === 'fromProduct' ? `$${w.a} = ${w.b} \\times ${w.q}$` : null);

/**
 * Guidance after a wrong gate: WHY the chosen number does not fit (with its own division), then why the right one does.
 * Always the world's reasoning — a remainder, a product — never « wrong » alone.
 */
export function explain(w, n) {
  const g = w.gates[w.good];
  const zero = '0 ليس قاسمًا لأيّ عدد: لا نقسم على 0.';
  const notDivisor = (a, x) => {
    if (x === 0) return zero;
    if (x > a && x % a === 0) return `${x} مضاعف للعدد ${a}، وليس قاسمًا له: القاسم لا يكون أكبر من العدد.`;
    const { q, r } = div(a, x);
    return `$${a} = ${x} \\times ${q} + ${r}$: الباقي ${r}، إذن ${x} ليس قاسمًا للعدد ${a}.`;
  };
  const isDivisor = (a, x) =>
    x === 1
      ? `1 قاسم لكلّ عدد طبيعي: $${a} = 1 \\times ${a}$.`
      : x === a
        ? `كلّ عدد غير معدوم قاسم لنفسه: $${a} = ${a} \\times 1$.`
        : `$${a} = ${x} \\times ${a / x}$: الباقي 0، إذن ${x} قاسم للعدد ${a}.`;
  switch (w.type) {
    case 'divisorOf':
    case 'divides':
    case 'sureOf':
    case 'fromProduct':
      return { wrong: notDivisor(w.a, n), right: isDivisor(w.a, g) };
    case 'multipleOf':
    case 'divisibleBy': {
      let wrong;
      if (n === 0) wrong = zero;
      else if (n < w.b && w.b % n === 0)
        wrong = `${n} قاسم للعدد ${w.b}، وليس مضاعفًا له: مضاعفات ${w.b} هي ${w.b}، ${2 * w.b}، ${3 * w.b}…`;
      else {
        const { q, r } = div(n, w.b);
        wrong = `$${n} = ${w.b} \\times ${q} + ${r}$: الباقي ${r}، إذن ${n} لا يقبل القسمة على ${w.b}.`;
      }
      return { wrong, right: `$${g} = ${w.b} \\times ${g / w.b}$: ${g} مضاعف للعدد ${w.b}، أي يقبل القسمة عليه.` };
    }
    case 'remainder':
      return {
        wrong: `تحقّق: $${w.b} \\times ${w.q} + ${n} = ${w.b * w.q + n}$، وليس ${w.a}.`,
        right: `$${w.a} = ${w.b} \\times ${w.q} + ${w.r}$: الباقي ${w.r}.`,
      };
    case 'missing':
      return {
        wrong: `$${w.b} \\times ${n} = ${w.b * n}$، وليس ${w.a}.`,
        right: `$${w.a} = ${w.b} \\times ${w.q}$: العددان ${w.b} و ${w.q} قاسمان للعدد ${w.a}.`,
      };
    case 'everyNumber':
      return {
        wrong: n === 0 ? zero : `${n} ليس قاسمًا لكلّ عدد: $${n + 1} = ${n} \\times 1 + 1$، الباقي 1.`,
        right: '1 قاسم لكلّ عدد طبيعي: $a = 1 \\times a$.',
      };
    case 'biggest':
      return {
        wrong:
          n > w.a
            ? `${n} أكبر من ${w.a}: هو مضاعف له، والقاسم لا يتجاوز العدد.`
            : w.a % n === 0
              ? `${n} قاسم للعدد ${w.a} فعلًا، لكنّه ليس الأكبر.`
              : notDivisor(w.a, n),
        right: `أكبر قاسم للعدد ${w.a} هو ${w.a} نفسه: $${w.a} = ${w.a} \\times 1$.`,
      };
    case 'smallest':
      return {
        wrong: n === 0 ? zero : w.a % n === 0 ? `${n} قاسم للعدد ${w.a} فعلًا، لكنّه ليس الأصغر.` : notDivisor(w.a, n),
        right: `أصغر قاسم لأيّ عدد هو 1: $${w.a} = 1 \\times ${w.a}$.`,
      };
    case 'lastTry': {
      const d = Math.floor(Math.sqrt(w.a));
      return {
        wrong:
          n * n > w.a
            ? `$${n} \\times ${n} = ${n * n}$ يتجاوز ${w.a}: بعد هذا الحدّ تعود الجداءات نفسها مقلوبة.`
            : `ما زال بعد ${n} عدد مربّعه لا يتجاوز ${w.a}: $${n + 1} \\times ${n + 1} = ${(n + 1) * (n + 1)}$.`,
        right: `$${d} \\times ${d} = ${d * d}$ لا يتجاوز ${w.a}، و $${d + 1} \\times ${d + 1} = ${(d + 1) * (d + 1)}$ يتجاوزه: نتوقّف عند ${d}.`,
      };
    }
    case 'countOf': {
      const ds = [];
      for (let d = 1; d <= w.a; d += 1) if (w.a % d === 0) ds.push(d);
      return {
        wrong: `عُدّها زوجًا زوجًا: كلّ جداء يساوي ${w.a} يعطي قاسمين.`,
        right: `قواسم ${w.a} هي: ${ds.join('\u00a0، ')} — عددها ${ds.length}.`,
      };
    }
    default:
      // a wave the lesson WROTE itself (a type this world does not know): it carries its sentence `say` and its guidance
      // `why: { right, wrong: { [gate]: line } }` — data, one line per wrong gate
      return w.why ? { wrong: w.why.wrong?.[n] ?? '', right: w.why.right ?? '' } : { wrong: '', right: '' };
  }
}

/**
 * The world's own words for an experiment (`Inquiry*.jsx`) when the lesson's `spec.text` does not give its own: a press
 * that cannot be answered yet is answered by what is missing on the screen — a fact, never « wrong ».
 */
export const INQUIRY_TEXT = {
  // common: « تحقّق » pressed with no plank marked on the shelf of both gaps, or with the count box empty
  sayFirst: ({ needLong, needCount }) =>
    needLong && needCount
      ? 'لم تعلّم لوحًا بعدُ، وخانة عدد الألواح فارغة: اضغط أطول لوح على رفّ الهوّتين معًا، ثمّ اكتب العدد.'
      : needLong
        ? 'لم تعلّم لوحًا بعدُ: اضغط أطول لوح على رفّ الهوّتين معًا.'
        : 'خانة عدد الألواح فارغة: عُدّ الألواح على رفّ الهوّتين معًا واكتب العدد.',
  // common · witness: the tray is empty and no plank of it filled both gaps — that fact only (never « they share none »)
  witnessEmpty: () => 'لا لوح من هذه الكومة يملأ الهوّتين معًا.',
  // chart: the next hundred, while he tests its first gaps himself (then the world finishes it: `text.confirming`)
  confirmTest: (b, from, n) =>
    `هل تصمد قراءتك بعد المئة الأولى؟ جرّب اللوح ${b} بنفسك على أوّل ${n === 1 ? 'هوّة' : n === 2 ? 'هوّتين' : n <= 10 ? `${n} هوّات` : `${n} هوّة`} من ${from}، ثمّ يكمل العالم إلى ${from + 99}.`,
  // letters: a false card that none of the samples refutes — where it stands, not a verdict
  unrefuted: () => 'هذا السطر لا يُستنتَج من المعطيات ولا من سطر فوقه: لا مكان له في البرهان.',
  // letters: a sample whose □ is not a natural number (value is not by × a natural number) — shown, then the world moves on
  noWhole: (v, value, by) => `بهذه الأعداد لا يوجد عدد طبيعي □ يجعل $${by} \\times \\square = ${value}$.`,
};

export const T = {
  turn: { body: 'الأرخبيل واسع: يُلعب والهاتف بالعرض.' },
  title: 'أرخبيل القواسم',
  subtitle: 'عاصفة كسرت جسور الضوء بين الجزر، والمنارة انطفأت. أعد بناء الجسور مع الروبوت «زيرو» وأنِر المنارة.',
  hud: {
    remainder: 'الباقي',
    unpaid: 'خانات بلا ألواح',
  },
  prompt: {
    take: (b) => `خذ القالب ${b}`,
    forge: (b) => `ابنِ الجسر بألواح طولها ${b}`,
    needMould: 'خذ قالبًا أوّلًا',
    statues: 'أيقظ الحرّاس',
    board: 'اركب لوح الضوء',
    anvil: 'اصنع قالبك',
    anvilLocked: 'جرّب القوالب أوّلًا',
    boss: 'افتح مخزن القوالب',
    stone: 'اقرأ اللوح',
  },
  objective: {
    bridge: (a) => `املأ ${a} خانة تمامًا لتعبر`,
    cross: 'الجسر ثابت — اعبر!',
    storm: 'بلا أيّ قسمة: أيّ قالب يملأ 48 بالتأكيد؟',
    stubborn: 'جد قالبًا يملأ 7 خانات',
    statues: 'أيقظ الحرّاس الأربعة',
    board: 'اركب لوح الضوء نحو الجزيرة العنيدة',
    dash: 'اعبر من البوّابة الصحيحة',
    stone: 'اذهب إلى لوح الجزيرة (السهم الأصفر) وأجب عن سؤاله',
    bossGo: 'اذهب إلى المنصّة المضيئة واختر القالب الذي يملأ 756 خانة',
    bossCross: 'الجسر الأعظم ثابت — اعبر إلى المنارة!',
    end: 'أنِر المنارة',
    // a CONVOY (two bridges built with the planks of ONE island): the second gap refused his planks, and its island has none
    convoyBack: (name) => `لا ألواح على هذه الجزيرة. ارجع إلى «${name}» واختر ألواحًا تبني الجسرين معًا`,
  },
  /** What matters from the island before (kit/Instruction.jsx › Recall): the gap he has just crossed. */
  recall: { bridge: (a, b, q) => `الهوّة السابقة: $${a} = ${b} \\times ${q}$` },
  /** The purse of a convoy: a coin per plank, whatever its length. */
  purse: { label: 'قطع الجسرين', one: 'قطع الجسر' },
  say: {
    hello: 'أنا زيرو! العاصفة كسرت جسور الضوء. خذ القالب 3 ثم تعال إلى منصّة الضوء عند الهوّة.',
    goAltar: 'ممتاز! الآن اذهب إلى المنصّة المضيئة عند الهوّة: السهم الأصفر يدلّك عليها.',
    first: 'خمسة ألواح ولا خانة فارغة: الجسر ثابت. هيا نعبر!',
    carry3: 'ما زال معي القالب 3. الهوّة هنا 16 خانة… ماذا تتوقّع؟',
    gap: (r) => `بقيت ${cells(r)}، فانهار الجسر! جرّب قالبًا آخر.`,
    convoyBack: (name, r) =>
      `بقيت ${cells(r)}، فانهار الجسر الثاني. لا ألواح هنا: ارجع إلى «${name}» واختر ألواحًا تبني الجسرين معًا.`,
    convoyReset: (b) => `الألواح ${b} تبني الجسرين معًا: الألواح القديمة عادت إلى أماكنها.`,
    convoyOnly: 'الجسران يُبنيان بالألواح نفسها: خذها من الجزيرة السابقة.',
    // a marked stretch (`mark.js`): the gap is filled, but the post of the mark stands in the middle of a plank
    markMiss: (b, mark) =>
      `الجسر امتلأ، لكنّ عمود المصباح عند الخانة ${mark.m} وقع في وسط لوح: ${mark.m} = ${b} × ${mark.q} + ${mark.r}. العمود لا يثبت إلا على فاصل بين لوحين.`,
    purseOut: (laid, need) =>
      `انتهت القطع! وُضع ${planks(laid)}، والجسر يحتاج ${planks(need)}. لكلّ لوح قطعة، مهما كان طوله.`,
    gapRight: (r) => `كما توقّعتَ: بقيت ${cells(r)}. إذن هذا القالب لا يصلح — جرّب قالبًا آخر.`,
    gapShort: (r) => `بقي ${r}… الجسر لا يثبت إلا إذا امتلأ تمامًا.`,
    tooLong: (b, a) => `لوح طوله ${b} أطول من الهوّة كلّها (${a})! لم يدخل أيّ لوح.`,
    ok: (b, q) =>
      q === 1 ? `لوح واحد طوله ${b} يملأ الهوّة كلّها. اعبر!` : `${planks(q)} بطول ${b}، ولا خانة فارغة. اعبر!`,
    c42: 'هوّة من 42 خانة وأربعة قوالب. فكّر قبل أن تطلق: توقّعك الأوّل يساوي نجمة.',
    d48: 'جزيرة المرايا… لا يوجد هنا إلا القالب 6. عُدّ الألواح جيّدًا!',
    storm: 'عاصفة! طارت الألواح وانكسر القالب 6… لكنّي حفظت ما رأيناه: $48 = 6 \\times 8$',
    stormHint: 'ظهرت أربعة قوالب جديدة. واحد منها يملأ 48 بالتأكيد — دون أيّ قسمة!',
    stormOk: 'ستّة ألواح طولها 8: نفس المساواة مقلوبة: $48 = 8 \\times 6$',
    e120: 'هوّة طويلة: 120 خانة. أيّ هذه القوالب يملؤها؟',
    f: 'الحرّاس الأربعة نائمون. كلّ واحد يقول نفس الحقيقة بجملته… أيقظهم لنركب لوح الضوء.',
    statuesFirst: 'لوح الضوء لا يتحرّك ما دام الحرّاس نائمين.',
    boardReady: 'استيقظ الحرّاس! لوح الضوء جاهز عند حافّة الجزيرة.',
    dashGo: 'اقرأ الجملة، واعبر من البوّابة التي تحقّقها. يمينًا ويسارًا!',
    dashHit: 'آخ! انظر إلى البوّابة الخضراء.',
    dashAgain: 'انتهت الدروع… نعيد الانطلاق!',
    g7: 'الجزيرة العنيدة! الهوّة 7 خانات فقط. جرّب قوالبها…',
    anvilOpen: 'لا قالب من قوالب الجزيرة يملأ 7! الورشة مفتوحة: اصنع قالبًا بالطول الذي تريده.',
    crafted: (b) => `قالب بطول ${b} جاهز. إلى المنصّة!`,
    h: 'قبل الجسر الأعظم، لوح هذه الجزيرة يسألك عن الهوّة العنيدة.',
    stoneWaits: 'اللوح ينتظر جوابك: السهم الأصفر يدلّك عليه.',
    boss: 'ها هو الجسر الأعظم: 756 خانة حتى المنارة. اذهب إلى المنصّة المضيئة: في المخزن قالبان فقط، 32 و 36.',
    bossFail: (b, r) => `بقيت ${r} خانة فارغة: القالب ${b} لا يملأ 756. جرّب القالب الآخر.`,
    bossOk: '21 لوحًا طولها 36 ولا خانة فارغة. الجسر الأعظم ثابت!',
    pay: 'دُفع الثمن. اعبر إلى المنارة!',
    fall: ['أوه! الهواء لا يحمل الروبوتات.', 'هبوط غير مبرمج… أعادتني السحب.', 'لا جسر هنا بعد!'],
    done: 'الجسر جاهز. اعبر!',
    end: 'عادت المنارة تضيء! شكرًا لك.',
  },
  // Two SEPARATE results after a forge: the student's prediction (right or not), then what the mould does to the gap.
  // a bridge with a marked stretch: its label over the gap, the name of its sign
  mark: {
    label: (m, a) => `${m} مضاءة من ${a} خانة`,
    sign: 'لافتة الجسر',
    stretch: 'الجزء المضاء',
  },
  verdict: {
    markMiss: (b, m) => `القالب ${b} يملأ الجسر، لكن لا فاصل عند الخانة ${m}: العمود لا يثبت`,
    purse: (laid, need) => `وُضع ${planks(laid)} من ${need}: انتهت القطع قبل أن يمتلئ الجسر`,
    right: (r) => (r === 0 ? 'توقّعك صحيح: لم تبقَ أيّ خانة فارغة' : `توقّعك صحيح: بقيت ${cells(r)}`),
    wrong: (p, r) => `توقّعتَ ${p}، والباقي ${r}`,
    star: 'نجمة التوقّع',
    holds: (b, a) => `القالب ${b} يملأ ${a} تمامًا: الجسر ثابت`,
    open: (b, a) => `القالب ${b} لا يملأ ${a}: الجسر لا يثبت`,
  },
  predict: {
    title: (a, b) => `ألواح طولها ${b} على هوّة من ${a} خانة`,
    ask: 'كم خانة ستبقى فارغة في آخر الجسر؟',
    cancel: 'أغيّر القالب',
  },
  workshop: {
    title: 'ورشة القوالب',
    ask: 'اختر طول القالب الذي تريد صنعه',
    make: 'اصنع القالب',
    close: 'إغلاق',
    // the typed form (`workshop.typed`): he writes the length, in its own shape — a box and the printed unit
    typedAsk: 'اكتب طول القالب الذي تريد صنعه',
    unit: 'خانة',
    lengthLabel: 'طول القالب',
    // the gaps the plank must build (the whole convoy): « القالب للهوّتين 32 و 44 »
    forGaps: (gaps) =>
      gaps.length === 1
        ? `القالب للهوّة ${gaps[0]}`
        : gaps.length === 2
          ? `القالب للهوّتين ${gaps[0]} و ${gaps[1]}`
          : `القالب للهوّات ${gaps.slice(0, -1).join(' ، ')} و ${gaps.at(-1)}`,
    empty: 'اكتب طول القالب أوّلًا.',
    tooShort: 'أقصر قالب طوله خانة واحدة.',
    tooLong: (b, max, n) =>
      n === 1 ? `قالب طوله ${b} أطول من الهوّة كلّها (${max}).` : `قالب طوله ${b} أطول من كلّ هوّة هنا: أطولها ${max}.`,
    // the bench (`workshop.bench`): an experiment beside the workshop — it gives facts, never the plank to make
    bench: 'دفتر القوائم',
    benchSub: 'ما تكتبه هنا يبقى في دفترك',
    benchBack: 'رجوع إلى الورشة',
  },
  quiz: {
    check: 'تحقّق',
    back: 'أغلق اللوح',
    fits: (v, a, q) => `${v} يملأ ${a} تمامًا: ${planks(q)}`,
    leaves: (v, a, q, r) => `$${a} = ${v} \\times ${q} + ${r}$ — تبقى ${cells(r)}`,
    missing: (n) =>
      n === 0
        ? 'احذف من اختيارك ما لا يملأ الهوّة.'
        : n === 1
          ? 'وما زال ينقص قالب واحد يملأ الهوّة: ابحث عنه.'
          : 'وما زال ينقص قالبان يملآن الهوّة: ابحث عنهما.',
    seven: {
      prompt: 'الهوّة العنيدة طولها 7. أيّ القوالب تملؤها تمامًا؟ اختر كلّ ما يصلح.',
      options: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ v: n, label: String(n) })),
      answer: [1, 7],
      multi: true,
      a: 7,
      wrongGeneric: 'ليس تمامًا. جرّب في رأسك: كم خانة تبقى مع كلّ قالب اخترته؟ وهل نسيت قالبًا؟',
    },
  },
  statues: {
    title: 'الحرّاس الأربعة',
    fact: 'الحقيقة: ألواح طولها 6 ملأت هوّة من 120 خانة بـ 20 لوحًا.',
    ask: 'كلّ حارس يقول هذه الحقيقة بجملته. اضغط على جملة لتبدّل مكان العددين، ثمّ أيقظهم.',
    go: 'أيقظ الحرّاس',
    hint: {
      qasim: '«120 قاسم للعدد 6»؟ هل تملأ ألواح طولها 120 هوّة من 6 خانات؟',
      yaqsim: '«120 يقسم 6»؟ الذي يقسم هو طول اللوح الذي يملأ الهوّة.',
      yaqbal: '«6 يقبل القسمة على 120»؟ اقسم 6 على 120: هل الباقي 0؟',
      mudaaf: '«6 مضاعف للعدد 120»؟ مضاعفات 120 هي 120، 240، 360… هل 6 بينها؟',
    },
  },
  boss: {
    title: 'مخزن الجسر الأعظم',
    mission: 'المهمّة: الهوّة 756 خانة. اختر القالب الذي يملؤها تمامًا، ابنِ الجسر، ثمّ ادفع ثمن ألواحه.',
    steps: ['اختر قالبًا واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    choose: 'أيّ القالبين يملأ 756 خانة تمامًا؟ احسب في كرّاسك، ثمّ اختر.',
    mould: (b) => `ألواح طولها ${b}`,
    untried: 'لم يُجرَّب بعد',
    tried: (r) => `جُرِّب: ${cells(r)}`,
    // the store's planks refused for another reason: the purse ran out, or the post of a marked stretch missed a joint
    triedPurse: (laid, need) => `انتهت القطع: ${laid} من ${need}`,
    triedMark: (r) => `العمود في وسط لوح (الباقي ${r})`,
    price: 'ثمن اللوح الواحد: 1850 بلّورة ضوء',
    divide: (b) => `القالب ${b}: كم لوحًا يدخل في 756 خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    rLabel: 'الخانات الباقية',
    forge: 'ابنِ وجرّب',
    change: 'أغيّر القالب',
    close: 'إغلاق',
    costAsk: (b, q) => `الجسر ثابت: ${planks(q)} بطول ${b}. ثمن اللوح الواحد 1850 بلّورة ضوء. كم تدفع للمخزن؟`,
    pay: 'ادفع',
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planks(q)} بطول ${b} تساوي ${b * q} خانة: أطول من الهوّة (756)!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة 756 خانة.`,
      big: (b, r) => `بقيت ${r} خانة: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  tablets: {
    'qasim-baqi': {
      icon: '🔑',
      title: 'القاسم بالباقي',
      lines: [
        'الجسر يثبت عندما لا تبقى أيّ خانة فارغة: باقي القسمة الإقليدية 0.',
        'نقول عندئذ إنّ طول اللوح قاسم لطول الهوّة.',
      ],
      math: ['42 = 6 \\times 7 + \\textcolor{#34d399}{0}', '42 = 5 \\times 8 + \\textcolor{#fb7185}{2}'],
      notes: ['6 قاسم للعدد 42', '5 ليس قاسمًا للعدد 42'],
    },
    'qasim-jidaa': {
      icon: '🗝️',
      title: 'القاسم بالجداء',
      lines: [
        'إذا كتبنا عددًا على شكل جداء عددين طبيعيين، فكلّ واحد منهما قاسم له.',
        '$b$ قاسم للعدد $a$ معناه: يوجد عدد طبيعي $q$ حيث $a = b \\times q$.',
      ],
      math: ['48 = 6 \\times 8 = 8 \\times 6'],
      notes: ['6 قاسم للعدد 48، و 8 قاسم له أيضًا'],
    },
    'siyagh-mutakafia': {
      icon: '🗣️',
      title: 'أربع جمل، معنى واحد',
      lines: ['هذه الجمل الأربع تقول الشيء نفسه:'],
      list: ['6 قاسم للعدد 120', '6 يقسم 120', '120 يقبل القسمة على 6', '120 مضاعف للعدد 6'],
      math: ['120 = 6 \\times 20'],
      notes: ['القاسم هو الأصغر، والمضاعف هو الأكبر'],
    },
    'wahid-wa-nafsuh': {
      icon: '⭐',
      title: '1 والعدد نفسه',
      lines: ['العدد 1 قاسم لكلّ عدد طبيعي.', 'وكلّ عدد طبيعي غير معدوم قاسم لنفسه.'],
      math: ['7 = 1 \\times 7 = 7 \\times 1', '143 = 1 \\times 143'],
      notes: ['قالب من خانة واحدة، وقالب بطول الهوّة كلّها: يصلحان دائمًا'],
    },
  },
  end: {
    title: 'أنرتَ المنارة!',
    text: 'أعدتَ بناء كلّ الجسور وجمعت مفاتيح المعرفة الأربعة.',
    stay: 'أتجوّل في الأرخبيل',
  },
};
