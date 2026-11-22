/**
 * THE TWO INVESTIGATIONS of lesson « قواسم عدد طبيعي » — its numbers and its words (the screens and their logic are the
 * world's: `divisorIsles/Inquiry.jsx`, `inquiry.js`). Each of the lesson's two hard rules is FOUND by an experiment of its
 * own nature (owner, 2026-11-17: « the student never told the rule, he gets the rule himself »), never by the same mirror:
 *
 *   STOP    « where does the search stop? » — he tries the planks of ONE gap in order, starting with the gap of the island
 *           he has just crossed (36). A plank and its partner walk toward each other and cross; past the crossing every
 *           partner is a plank he tried. Then two gaps where he says the last plank BEFORE trying — the last one with only
 *           the squares in front of him. He then writes his rule from what he saw.
 *   RULES   « what to read instead of dividing? » — the stone asks about a gap too long to build. He tests ONE plank on
 *           the gaps 5, 6, 7… of a chart, chooses a LENS (what he looks at in the number) and what he claims of it: its
 *           values (« يساوي », planks 5 and 2) or ONE number it is divisible by (« يقبل القسمة على », planks 9, 3, 4).
 *           The chart answers. Plank 4 has a lens of its own: the number written by the tens and the units (owner).
 *           What he claimed and the chart accepted IS his rule: the mirror attacks it at once.
 * No sentence here states a rule: each one says what the strip or the chart has just done.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';

const math = (s) => `$${s.replaceAll('×', '\\times')}$`;
const lo = (t) => Math.floor(t.partner);

export const STOP_INQUIRY = {
  kind: 'pairs',
  gaps: [36, 30, 60],
  text: {
    stripLabel: (a) => `شريط الألواح من 1 إلى ${a}`,
    cols: { plank: 'اللوح', partner: 'شريكه', square: 'مربّعه' },
    plank: (d) => `اللوح ${d}`,
    partner: 'شريكه',
    between: (x, y) => `بين ${x} و ${y}`,
    tryBtn: (d) => `جرّب اللوح ${d}`,
    lead: (a, gi) =>
      gi === 0
        ? `عبرتَ هوّة ${a}. نريد الآن كلّ ألواحها: جرّبها واحدًا واحدًا، من اللوح 1، وراقب اللوح وشريكه على الشريط.`
        : `هوّة ${a}: جرّب الألواح بالترتيب، وراقب أين يقف الشريك.`,
    guess: (a, gi) =>
      gi === 1
        ? `هوّة جديدة: ${a} خانة. قبل أن تجرّب: ما آخر لوح ستحتاج إلى تجريبه لتجد كلّ ألواحها؟`
        : `هوّة ${a}. هذه المرّة الجدول أمامك قبل أيّ تجربة. ما آخر لوح ستحتاج إلى تجريبه؟`,
    held: (a, t) =>
      t.q === t.d
        ? `${math(`${a} = ${t.d} × ${t.d}`)}: ثبت — اللوح ${t.d} شريك نفسه!`
        : `${math(`${a} = ${t.d} × ${t.q}`)}: ثبت — وشريكه ${t.q} لوح آخر يملأ الهوّة.`,
    fell: (a, t) => `اللوح ${t.d} لا يملأ ${a}. لو ثبت لوقف شريكه بين ${lo(t)} و ${lo(t) + 1}: أمامه.`,
    fellBehind: (a, t) =>
      `اللوح ${t.d} لا يملأ ${a}. انظر أين كان سيقف شريكه: بين ${lo(t)} و ${lo(t) + 1} — خلفه، بين ألواح جرّبتَها.`,
    known: (a, t) =>
      `${math(`${a} = ${t.d} × ${t.q}`)}: ثبت… لكنّ شريكه ${t.q} خلفه. هذا جسر اللوح ${t.q} مقلوبًا: عندك من قبل.`,
    ask: (a, n) => `جرّبتَ ${n} ألواح. لو واصلتَ حتى اللوح ${a}: هل يمكن أن يظهر لوح لا تعرفه؟`,
    askYes: 'ربّما — نواصل لنرى',
    askNo: 'لا — مستحيل',
    swept: (n, a, over) =>
      over
        ? `${n} تجربة أخرى، حتى اللوح ${a}: ولا لوح جديد. كلّ ما ثبت كان شريكًا تعرفه.`
        : `العالم يواصل التجريب… ${n}`,
    afterSweep: 'رأيتُ',
    pick: (a) => `انتهت التجارب. ما آخر لوح كان تجريبه لازمًا للهوّة ${a}؟`,
    pickLate: (a, k, t) =>
      t.whole
        ? `اللوح ${k}: شريكه ${t.q} جرّبتَه قبله — كنتَ ستعرفه دون تجريبه.`
        : `اللوح ${k}: لو ثبت لوقف شريكه خلفه، بين ألواح جرّبتَها كلّها. لم يكن تجريبه لازمًا.`,
    pickEarly: (a, k, missed) =>
      missed
        ? `لو توقّفتَ عند اللوح ${k} لضاع منك ${missed === 1 ? 'لوح' : missed === 2 ? 'لوحان' : `${missed} ألواح`} من ألواح الهوّة ${a}.`
        : `لو توقّفتَ عند اللوح ${k}: اللوح ${k + 1} شريكه ليس خلفه — لا شيء ممّا جرّبتَ يخبرك عنه.`,
    pickOk: (a, m, guess) =>
      `اللوح ${m} آخر لوح لازم للهوّة ${a}.${guess == null ? '' : guess === m ? ' توقّعك كان صحيحًا!' : ` كنتَ توقّعتَ ${guess}.`}`,
    foundLine: (a, m) => `الهوّة ${a} ← آخر لوح لازم: ${m}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};

export const RULES_INQUIRY = {
  kind: 'chart',
  /** what he claimed and the chart accepted is his rule: no tile is offered after it */
  writes: true,
  planks: [
    { b: 5, manual: 8, lenses: ['tens', 'units', 'sum'] },
    { b: 2, manual: 6, lenses: ['tens', 'units', 'sum'] },
    // the claim of 5 and of 2 is said « lens · يساوي · values »; the others « lens · يقبل القسمة على · a number » (owner)
    { b: 9, manual: 10, lenses: ['units', 'tens', 'sum'], link: 'divides' },
    { b: 3, manual: 8, lenses: ['units', 'tens', 'sum'], link: 'divides' },
    // 4: no single digit and no sum separates its chart — its lens is the number the tens and the units write (owner)
    { b: 4, manual: 9, lenses: ['units', 'sum', 'last2'], link: 'divides' },
  ],
  /** the numbers offered after « يقبل القسمة على » */
  divisors: [2, 3, 4, 5, 6, 7, 8, 9],
  text: {
    lens: {
      units: 'رقم الآحاد',
      tens: 'رقم العشرات',
      sum: 'مجموع الأرقام',
      last2: 'العدد المكوّن من الآحاد والعشرات',
    },
    board: (b, from) => `اللوح ${b} · الهوّات من ${from || 1} إلى ${from + 99}`,
    testBtn: (n) => `جرّب الهوّة ${n}`,
    fill: 'أكمل اللوحة',
    look: 'ماذا ألاحظ؟',
    /** THE QUESTION of the chart and its GOAL, in the owner's words (2026-11-17), on screen while he tests. */
    lead: (b) => `ما هي الهوّات التي يمكن تشكيل جسر لها باستخدام لوح طوله ${b}؟`,
    goal: (b) => `الهدف: معرفة تلك الهوّات فقط من شكلها، دون تقسيم طولها في كلّ مرّة على العدد ${b}.`,
    /** between the lens he chose and what he claims: « رقم الآحاد · يساوي · 0 أو 5 », « مجموع الأرقام · يقبل القسمة على · 9 » */
    link: { equals: 'يساوي', divides: 'يقبل القسمة على' },
    /** what to do now, under the goal */
    how: (b, enough) =>
      enough
        ? 'واصل التجريب، أو دع العالم يكمل اللوحة.'
        : `جرّب الهوّات واحدة واحدة، من ${b}: نقسم طول الهوّة على ${b}، وإذا كان الباقي 0 صارت خانتها خضراء.`,
    /** beside the division of each gap he tries (n = q × b + r, drawn by the world) */
    rest: (r) => `الباقي ${r}`,
    lensAsk: (b) =>
      `الخانات الخضراء هوّات يثبت فيها اللوح ${b}. ماذا يكفي أن تنظر إليه في العدد لتعرفها دون قسمة؟ اختر عدسة.`,
    valuesAsk: (b, lens, link) =>
      link === 'divides'
        ? `عدستك: ${lens}. على أيّ عدد يقبل القسمة عندما يثبت اللوح ${b}؟ اضغط عددًا — واللوحة تجيبك.`
        : `عدستك: ${lens}. اضغط كلّ قيمة يثبت معها اللوح ${b} — واللوحة تجيبك.`,
    claim: (orphans, intruders) =>
      [
        intruders ? `${intruders} خانة غير خضراء دخلت في اختيارك` : null,
        orphans ? `${orphans} خانة خضراء بقيت خارجه` : null,
      ]
        .filter(Boolean)
        .join(' · '),
    claimOk: () => 'كلّ الخانات الخضراء داخل اختيارك، ولا خانة غيرها معها.',
    seal: (b) => `هذه قراءتي للّوح ${b}`,
    confirming: (b, from) => `هل تصمد قراءتك بعد المئة الأولى؟ العالم يجرّب اللوح ${b} من ${from} إلى ${from + 99}…`,
    confirmed: (b, from) => `صمدت: من ${from} إلى ${from + 99}، قراءتك أحاطت بكلّ الخانات الخضراء، وبها وحدها.`,
    next: 'لوح آخر',
    last: 'قراءاتي الخمس',
    foundLine: (b, lens, values, link) =>
      link === 'divides'
        ? `اللوح ${b}: ${lens} يقبل القسمة على ${values.join(' أو ')}`
        : `اللوح ${b}: ${lens} ${values.join(' أو ')}`,
    sealed: 'خمسة ألواح، وخمس قراءات وجدتَها بنفسك. المرآة ستتحدّاها الآن بهوّات لم ترها.',
    done: 'إلى المرآة',
  },
};

/**
 *   TURN    « one bridge gives a second one » — his first bridge (24 with planks of 3) is lifted plank by plank into a
 *           wall and taken down column by column: the same cells give 3 planks of 8, the second bridge he built. Then he
 *           says what the columns will give BEFORE the wall is turned: a bridge that held, one that fell (a ragged
 *           wall), a square wall, and a bridge he does not see.
 */
export const TURN_INQUIRY = {
  kind: 'turn',
  rounds: [
    { a: 24, d: 3, mode: 'hands' },
    { a: 40, d: 5, mode: 'predict' },
    { a: 40, d: 6, mode: 'predict' },
    { a: 36, d: 6, mode: 'predict' },
    { a: 42, d: 7, mode: 'blind' },
  ],
  text: {
    wallLabel: (w) => `جدار الجسر: هوّة ${w.a}، ألواح طولها ${w.d}`,
    under: (w, turned) =>
      turned
        ? w.even
          ? `${planks(w.d)} طولها ${w.e}`
          : 'أعمدة غير متساوية'
        : `${planks(w.e)} طولها ${w.d}${w.rest ? ` — وبقيت ${w.rest} خانات` : ''}`,
    lift: (w) =>
      `جسرك الأوّل ثبت: ${planks(w.e)} طولها ${w.d} فوق هوّة ${w.a}. ارفع ألواحه واحدًا واحدًا، وضعها فوق بعضها.`,
    cut: (w) => `جدار من ${w.a} خانة: لا خانة زادت ولا نقصت. أنزله الآن عمودًا عمودًا فوق الهوّة نفسها.`,
    askPair: (w) => `جسر ثبت: ${planks(w.e)} طولها ${w.d} فوق هوّة ${w.a}. قبل أن تقلب جداره: ماذا ستعطي أعمدته؟`,
    askEqual: (w) =>
      `هذا الجسر انهار: ${planks(w.e)} طولها ${w.d} فوق هوّة ${w.a}، وبقيت ${w.rest} خانات. لو رفعتَ كلّ خاناته جدارًا: هل تكون أعمدته متساوية؟`,
    askBlind: (w) => `جسر لا تراه: ثبت فوق هوّة ${w.a} بـ ${planks(w.e)} طولها ${w.d}. دون جدار: ماذا ستعطي أعمدته؟`,
    seen: (w, guess, right) =>
      `${
        w.d === w.e
          ? `${math(`${w.a} = ${w.d} × ${w.d}`)}: جدار مربّع — أعمدته هي ألواحه نفسها.`
          : `${math(`${w.a} = ${w.d} × ${w.e} = ${w.e} × ${w.d}`)}: الخانات نفسها، ${planks(w.d)} طولها ${w.e} — والجسر ثابت.`
      }${guess ? (right ? ' كما توقّعت!' : ` كنتَ توقّعت ${planks(guess.count)} طولها ${guess.len}.`) : ''}`,
    seenRagged: (w, guess, right) =>
      `أعمدة الجدار غير متساوية (${w.e + 1} خانات، ثمّ ${w.e}): لا تصلح ألواحًا لجسر واحد.${right ? ' كما توقّعت!' : ' كنتَ توقّعت أعمدة متساوية.'}`,
    len: 'طول اللوح الجديد',
    count: 'عدد الألواح',
    yes: 'نعم، متساوية',
    no: 'لا، غير متساوية',
    liftBtn: 'ارفع لوحًا',
    layBtn: 'أنزل عمودًا',
    turn: 'اقلب الجدار',
    next: 'جسر آخر',
    done: 'أكتب قاعدتي',
    foundLine: (f) => math(f.d === f.e ? `${f.a} = ${f.d} × ${f.e}` : `${f.a} = ${f.d} × ${f.e} = ${f.e} × ${f.d}`),
  },
};

/**
 *   CUT     « a whole number of planks » — the gap no mould filled (31): his hand slides the length of the plank, the
 *           planks are laid again at once with the piece that would have to be sawn, and the count is written as the
 *           quotient. He says how many lengths need no cut; then he judges four planks from the quotient ALONE, before
 *           the saw shows them.
 */
const div = (a, b, q) => `$${a} \\div ${b} = ${q}$`;
export const CUT_INQUIRY = {
  kind: 'cut',
  free: { a: 31, start: 4, need: 6, exact: 2 },
  asks: [
    { a: 36, b: 8 },
    { a: 36, b: 9 },
    { a: 45, b: 6 },
    { a: 52, b: 4 },
  ],
  text: {
    sawLabel: (a, b) => `هوّة ${a}، ألواح طولها ${b}`,
    cols: { plank: 'اللوح', count: 'عدد الألواح' },
    length: 'طول اللوح',
    shorter: 'أقصر بخانة',
    longer: 'أطول بخانة',
    lengthIs: (b) => `طول اللوح: ${b}`,
    laid: (whole, piece) => (piece ? `${planks(whole)} + قطعة` : planks(whole)),
    piece: (r, b) => `${r} من ${b}`,
    free: (a, enough) =>
      enough
        ? `واصل التجريب إن شئت. هل وجدتَ كلّ الأطوال التي تملأ الهوّة ${a} دون أيّ قطع؟`
        : `هوّة ${a} لم يملأها أيّ قالب. الورشة تصنع كلّ الأطوال: حرّك المنزلق، غيّر طول اللوح، وراقب آخر لوح.`,
    enough: 'عندي جواب',
    fact: (a, b, q, p) =>
      `${div(a, b, q)} — ${planks(p.whole)} ${p.whole > 1 ? 'كاملة' : 'كامل'}${p.exact ? '، ولا قطعة.' : '، ثمّ قطعة من لوح.'}`,
    countAsk: (a) => `كم طولًا مختلفًا يملأ الهوّة ${a} تمامًا، دون أيّ قطع؟`,
    countMiss: (k, found) =>
      found.length
        ? `حتى الآن وجدتَ بلا قطع: ${[...found].sort((x, y) => x - y).join(' و ')}. هل جرّبتَ المنزلق من أوّله إلى آخره؟`
        : 'لم تجد بعد أيّ طول بلا قطع: جرّب أقصر لوح، وأطول لوح.',
    ask: (a, b, q) =>
      `هوّة ${a} ولوح طوله ${b}. الآلة الحاسبة تقول: ${div(a, b, q)}. دون أن تبني: هل يملأ اللوح الهوّة بلا قطع؟`,
    yes: 'نعم، بلا قطع',
    no: 'لا، تلزم قطعة',
    shown: (a, b, p, right) =>
      `${p.exact ? `${planks(p.whole)} كاملة تملأ ${a}: لا قطعة.` : `${planks(p.whole)} كاملة، ثمّ قطعة: ${p.piece} خانات من لوح طوله ${b}.`}${right ? ' كما توقّعت!' : ' لم يكن هذا توقّعك.'}`,
    next: 'هوّة أخرى',
    done: 'أكتب قاعدتي',
  },
};
