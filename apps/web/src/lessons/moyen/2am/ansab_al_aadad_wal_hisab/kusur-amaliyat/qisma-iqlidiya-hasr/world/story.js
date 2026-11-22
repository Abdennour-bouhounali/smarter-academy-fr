/**
 * THE STORY of lesson « القسمة الإقليدية وحصر حاصل القسمة » in the world « أرخبيل القواسم » — what the world's mechanic
 * plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea, island after island (the textbook fixes the الكفاءات, never this road; the numbers are the platform's own):
 *   A — a first gap of 84 filled by planks of 12;
 *   B — THE RECALL, one bridge and no forge: 912 with planks of two digits (17, 24, 35) — the division of the first year
 *       (tens of planks, then planks), which this lesson does not forge again;
 *   C — what is NEW: a gap of 4576 and LONG planks (208, 248, 365 — three digits). Their multiples are not known by
 *       heart: predicting what each leaves is a question he cannot answer yet → on island D the forge ➗ « القسمة على أيّ
 *       عدد » (an experiment: estimate — each digit of the count of planks is tried, then judged by its product);
 *   D — 5475 with long planks (208, 312, 365), divided with his key: two leave cells, one fills it → on island E the
 *       forge 📏 « حصر حاصل القسمة » (an experiment: bracket);
 *   E — 644 with planks of 28, 30, 45, then the gate dash;
 *   G — 1080 filled by planks of 45: the full planks ARE the planks needed; the stone asks the boat's trips (1250 boxes,
 *       48 a trip: 26 full trips, 27 needed), then the mirror → forge 0️⃣ « انعدام الباقي »;
 *   the last bridge is the port's: 1872 cells, two kinds of long plank in its store (130 and 156), a price in دج.
 * Nothing pre-solves the bridge that comes next: an experiment and the dash use only gaps he has already crossed.
 * Every number of the story is in `NUMBERS` (one place); the sentences and the tablets are written from it.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { BOX, TRIP, cells, count, planks, planksOf } from './counted';

/** The numbers of the story — ONE place: the segments, the sentences, the tablets and the tests read them from here. */
export const NUMBERS = {
  /** The first gap: one plank, no prediction. */
  intro: { gap: 84, plank: 12 },
  /** The recall: a division by a plank of two digits, as in the first year — one bridge, no forge. */
  recall: { gap: 912, moulds: [17, 24, 35], plank: 24 },
  /** Before the first forge: three LONG planks (three digits) on a gap of four digits, two leave cells. */
  long: { gap: 4576, moulds: [208, 248, 365], plank: 208 },
  /** After the first key, before the second forge: 5475 — planks of 208 fall short at 26 and overflow at 27. */
  bracket: { gap: 5475, moulds: [208, 312, 365], plank: 365 },
  /** After the second key. */
  after: { gap: 644, moulds: [28, 30, 45], plank: 28 },
  /** After the dash: the full planks are the planks needed. */
  exact: { gap: 1080, moulds: [45, 50, 64], plank: 45 },
  /** The stone: the boat of the port carries `boat` boxes a trip; `boxes` wait on the quay. */
  trips: { boxes: 1250, boat: 48 },
  /** The last bridge: two kinds of long plank in the store, the price of one plank (دج). */
  boss: { gap: 1872, options: [130, 156], plank: 156, price: 120 },
};
const { intro: I, recall: C, long: L, bracket: H, after: F, exact: X, trips: P, boss: B } = NUMBERS;
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
/** « a = b × q + r » with q and r computed. */
const euclid = (a, b) => `${a} = ${b} \\times ${div(a, b).q} + ${div(a, b).r}`;
/** The plank of each long gap that the tablets and the dash speak of. */
const LONG_PLANK = L.moulds[2];
const LQ = div(L.gap, LONG_PLANK);
const BRACKET_PLANK = H.moulds[0];
const BH = div(H.gap, BRACKET_PLANK);
const TRIPS = div(P.boxes, P.boat);

/** The stone's question: the boat's trips — the full ones and the ones needed, both computed. */
export const STONE = { full: TRIPS.q, needed: TRIPS.q + 1, left: TRIPS.r, fewer: TRIPS.q - 1, more: TRIPS.q + 2 };

const missing = (game, key) => !game.state.keys.includes(key);
const bridge = (id, a, len, moulds, holdsWith, extra = {}) => ({
  id,
  kind: 'bridge',
  a,
  len,
  moulds,
  predict: true,
  holdsWith,
  ...extra,
});

const ISLANDS = [
  { id: 'A', name: 'مرسى الاثني عشر', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة القوالب الثلاثة', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة الألواح الطويلة', R: 9, theme: 'crystal', turn: -0.55 },
  { id: 'D', name: 'جزيرة العلامات', R: 9, theme: 'pine', turn: 0.42 },
  { id: 'E', name: 'جزيرة الرايات', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة الضوء', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة الصدى', R: 9, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'جزيرة القوارب', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'الميناء الكبير', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge(`g${I.gap}`, I.gap, 12.5, [I.plank], I.plank, { predict: false }),
  bridge(`g${C.gap}`, C.gap, 18, C.moulds, C.plank),
  bridge(`g${L.gap}`, L.gap, 17, L.moulds, L.plank),
  bridge(`g${H.gap}`, H.gap, 17, H.moulds, H.plank),
  bridge(`g${F.gap}`, F.gap, 17, F.moulds, F.plank),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(`g${X.gap}`, X.gap, 19, X.moulds, X.plank),
  {
    id: `g${B.gap}`,
    kind: 'bridge',
    a: B.gap,
    len: 26,
    moulds: [],
    holdsWith: B.plank,
    boss: { options: B.options, price: B.price },
  },
];
/**
 * The gate dash: one sentence, three gates, exactly one right — the facts of the bridges he has ALREADY crossed (the
 * gap that comes after the dash is never in a wave).
 */
const DASH_WAVES = [
  { say: `$${C.gap} = ${C.plank} \\times \\square$`, gates: [36, 38, 42], test: (n) => C.plank * n === C.gap },
  {
    say: `$${L.gap} = ${LONG_PLANK} \\times \\square + ${LQ.r}$`,
    gates: [11, 12, 13],
    test: (n) => LONG_PLANK * n + LQ.r === L.gap,
  },
  { say: `باقي قسمة ${L.gap} على ${L.moulds[1]}`, gates: [18, 112, 136], test: (n) => n === L.gap % L.moulds[1] },
  {
    say: `حاصل القسمة بالنقصان: $${H.gap} \\div ${BRACKET_PLANK}$`,
    gates: [25, 26, 27],
    test: (n) => n === Math.floor(H.gap / BRACKET_PLANK),
  },
  {
    say: `عدد الألواح اللازمة: $${H.gap} \\div ${H.moulds[1]}$`,
    gates: [17, 18, 171],
    test: (n) => n === Math.ceil(H.gap / H.moulds[1]),
  },
  { say: `مضاعف للعدد ${F.plank}`, gates: [196, 200, 204], test: (n) => n % F.plank === 0 },
  { say: `باقي قسمة ${F.gap} على ${F.moulds[2]}`, gates: [4, 14, 41], test: (n) => n === F.gap % F.moulds[2] },
  {
    say: `$\\square \\div ${H.plank}$ عدد طبيعي`,
    gates: [5465, 5475, 5485],
    test: (n) => n % H.plank === 0,
  },
];

/** The tablet of each rule: its name comes AFTER the student forged it. */
export const TABLETS = {
  'qisma-ay-adad': {
    icon: '➗',
    title: 'القسمة على أيّ عدد',
    lines: [
      'نقسم $a$ على أيّ عدد طبيعي غير معدوم $b$ (المقسوم عليه)، ولو من ثلاثة أرقام: $a = b \\times q + r$ و $r < b$.',
      'نقدّر كلّ رقم من الحاصل بتقريب $b$ إلى مئة، ثمّ نضربه في $b$ نفسه: جداء يتجاوز ما بقي؟ ننقص الرقم. يبقى ما يتّسع لـ $b$ آخر؟ نزيده.',
    ],
    math: [euclid(L.gap, LONG_PLANK), `${LONG_PLANK} \\times ${LQ.q + 1} = ${LONG_PLANK * (LQ.q + 1)}`],
    notes: [`${LONG_PLANK} قريب من 400: نقدّر به، ثمّ الحكم لجداء ${LONG_PLANK} نفسه`],
  },
  'hasr-hasil': {
    icon: '📏',
    title: 'حصر حاصل القسمة',
    lines: [
      'إذا كان $a = b \\times q + r$ و $0 < r < b$ فإنّ $q < a \\div b < q + 1$.',
      '$q$ قيمة مقرّبة إلى الوحدة بالنقصان (الألواح الكاملة)، و $q + 1$ قيمة مقرّبة إلى الوحدة بالزيادة (الألواح اللازمة).',
      // the notation of the exercise bank, with a real fraction bar — a writing of the quotient, no lesson on fractions
      'حاصل القسمة $a \\div b$ يُكتب أيضًا $\\frac{a}{b}$.',
    ],
    math: [euclid(H.gap, BRACKET_PLANK), `${BH.q} < \\frac{${H.gap}}{${BRACKET_PLANK}} < ${BH.q + 1}`],
    notes: [`${planksOf(BH.q, BRACKET_PLANK)} لا تكفي الهوّة ${H.gap}، و ${planks(BH.q + 1)} تغطّيها كلّها`],
  },
  'inidam-baqi': {
    icon: '0️⃣',
    title: 'انعدام الباقي',
    // ONE line of rule, the four sentences, two equalities each with its note: the board's naming card holds it at 1024 px
    lines: ['إذا كان الباقي $r = 0$ فإنّ $a = b \\times q$، و $a \\div b = q$ عدد طبيعي.'],
    list: [
      'الباقي معدوم',
      `${X.gap} يقبل القسمة على ${X.plank}`,
      `${X.gap} مضاعف للعدد ${X.plank}`,
      `${X.plank} يقسم ${X.gap}`,
    ],
    math: [`${X.gap} = ${X.plank} \\times ${X.gap / X.plank} + 0`, `${X.gap} \\div ${X.plank} = ${X.gap / X.plank}`],
    notes: ['الباقي 0: للجمل الأربع معنى واحد', 'الألواح الكاملة هي الألواح اللازمة'],
  },
};

const bossQ = (b) => div(B.gap, b);
/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  // two lines on the title screen, like every lesson of the world: a longer name pushes the key hints out of the window
  title: 'أرخبيل القواسم: ميناء الألواح',
  subtitle: `الميناء الكبير ينتظر جسرًا من ${cells(B.gap)}. اقسم مع «زيرو» أطوالًا كبيرة على ألواح من كلّ طول.`,
  objective: {
    board: 'اركب لوح الضوء نحو جزيرة الصدى',
    bossGo: `اذهب إلى المنصّة المضيئة واختر الألواح التي تملأ ${cells(B.gap)}`,
    bossCross: 'جسر الميناء ثابت — اعبر إلى الميناء!',
    end: 'ادخل الميناء الكبير',
  },
  say: {
    hello: `أنا زيرو! جسور الميناء مقطوعة. خذ القالب ${I.plank} ثمّ تعال إلى منصّة الضوء عند الهوّة.`,
    first: `${planksOf(I.gap / I.plank, I.plank)} تملأ ${cells(I.gap)}: $${I.gap} = ${I.plank} \\times ${I.gap / I.plank}$.`,
    recall: `هوّة من ${cells(C.gap)} وثلاثة قوالب من رقمين: قسمة تعرفها. توقّع الخانات الباقية قبل أن تطلق.`,
    recallOk: `$${C.gap} = ${C.plank} \\times ${C.gap / C.plank}$: عشرات الألواح أوّلًا ثمّ الألواح، كما تعلّمتَ في السنة الأولى.`,
    long: `هوّة من ${cells(L.gap)}، والقوالب هنا طويلة: ${L.moulds.join(' و ')}. توقّع الخانات الباقية… إن استطعت!`,
    far: `هوّة من ${cells(H.gap)} وألواح طويلة. مفتاحك يجد عدد الألواح رقمًا رقمًا قبل أن تطلق.`,
    farOk: `$${H.gap} = ${H.plank} \\times ${H.gap / H.plank}$: جرّبتَ كلّ رقم ثمّ حكمتَ عليه، كما يقول مفتاحك.`,
    after: `هوّة من ${cells(F.gap)}. مفتاحك يحصر عدد الألواح قبل أن تطلق.`,
    afterOk: `$${F.gap} = ${F.plank} \\times ${F.gap / F.plank}$: ولا خانة فارغة.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    g1080: `هوّة من ${cells(X.gap)}. أيّ القوالب يملؤها دون أن يبقى شيء؟`,
    h: `قبل جسر الميناء، لوح هذه الجزيرة يسألك عن قارب الميناء.`,
    boss: `ها هو جسر الميناء: ${cells(B.gap)}. في المخزن نوعان من الألواح: ${B.options[0]} و ${B.options[1]}.`,
    bossFail: (b, r) =>
      `بقيت ${cells(r)}: ${planksOf(bossQ(b).q, b)} لا تكفي، و ${planks(bossQ(b).q + 1)} تتجاوز الهوّة. جرّب النوع الآخر.`,
    bossOk: `${planksOf(B.gap / B.plank, B.plank)} ولا خانة فارغة: الألواح الكاملة هي الألواح اللازمة. جسر الميناء ثابت!`,
    pay: 'دُفع الثمن. اعبر إلى الميناء!',
    end: 'عاد الميناء موصولًا بالجزر. شكرًا لك!',
  },
  quiz: {
    trips: {
      prompt: `قارب الميناء يحمل ${count(P.boat, BOX, 'acc')} في كلّ رحلة، وعلى الرصيف ${count(P.boxes, BOX)}. اختر عددين: عدد الرحلات التي يمتلئ فيها القارب تمامًا، وعدد الرحلات اللازمة لنقل كلّ الصناديق.`,
      options: [STONE.left, STONE.fewer, STONE.full, STONE.needed, STONE.more].map((n) => ({ v: n, label: String(n) })),
      answer: [STONE.full, STONE.needed],
      multi: true,
      wrong: {
        [STONE.left]: `${STONE.left} هو عدد الصناديق الباقية بعد الرحلات المملوءة، وليس عدد رحلات.`,
        [STONE.fewer]: `بعد ${count(STONE.fewer, TRIP)} يبقى على الرصيف ${count(P.boxes - P.boat * STONE.fewer, BOX)}: ما زالت تملأ رحلة أخرى.`,
        // the boat's ROOM, not boxes that do not exist: only `boxes` wait on the quay
        [STONE.more]: `${count(STONE.needed, TRIP)} تتّسع لـ ${count(P.boat * STONE.needed, BOX)}، وعلى الرصيف ${P.boxes} فقط: هذا يكفي، و ${count(STONE.more, TRIP)} أكثر من اللازم.`,
      },
      wrongGeneric: `ليس تمامًا. كم مرّة يدخل ${P.boat} في ${P.boxes}؟ ثمّ ماذا نفعل بالصناديق الباقية؟`,
    },
  },
  boss: {
    title: 'مخزن الميناء',
    mission: `المهمّة: جسر الميناء ${cells(B.gap)}. اختر نوع الألواح الذي يملؤه تمامًا، ابنِ الجسر، ثمّ ادفع ثمن ألواحه.`,
    choose: `أيّ النوعين يملأ ${cells(B.gap)} دون أن يبقى شيء؟ احسب في كرّاسك، ثمّ اختر.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b}: كم لوحًا كاملًا يدخل في ${cells(B.gap)}؟ وكم خانة تبقى؟`,
    qLabel: 'الألواح الكاملة',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planksOf(q, b)}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: الألواح الكاملة، والخانات الباقية.',
      long: (b, q) => `${planksOf(q, b)}: ${cells(b * q)}، أطول من الهوّة (${B.gap})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة ${cells(B.gap)}.`,
      big: (b, r) => `بقيت ${cells(r)}: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { title: 'وصلتَ الميناء!', text: 'وصلتَ الميناء بالجزر، وصنعتَ مفاتيح المعرفة الثلاثة بنفسك.' },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,

  /**
   * What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island — and the
   * division of the first year is only RECALLED, by the bridge of island B (no forge).
   */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.recall, 8);
    if (k === 2) game.say(say.long, 8);
    if (k === 3) game.openForge('qisma-ay-adad');
    if (k === 4) game.openForge('hasr-hasil');
    if (k === 5) game.say(say.f, 8);
    if (k === 6) game.say(say.g1080, 8);
    if (k === 7) {
      game.say(say.h, 6);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /**
   * What the story does once the tablet of a key is closed. Modules (lesson.config.js): the first key marks module 1 (the
   * activity), the bracket module 3 (bracketing a big quotient), the zero remainder module 2 (the knowledge of all three).
   */
  afterKey: {
    'qisma-ay-adad': (game) => {
      game.onModule('1');
      game.say(game.T.say.far, 8);
    },
    'hasr-hasil': (game) => {
      game.onModule('3');
      game.say(game.T.say.after, 8);
    },
    'inidam-baqi': (game) => {
      // the world opens its last bridge on this flag (it was named for the pilot's fourth key)
      game.flags.key4 = true;
      game.onModule('2');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 3 && missing(game, 'qisma-ay-adad')) return 'qisma-ay-adad';
    if (game.state.stage === 4 && missing(game, 'hasr-hasil')) return 'hasr-hasil';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg) {
    const { say } = game.T;
    if (seg.id === `g${I.gap}`) game.say(say.first, 7);
    else if (seg.id === `g${C.gap}`) game.say(say.recallOk, 8);
    else if (seg.id === `g${H.gap}`) game.say(say.farOk, 8);
    else if (seg.id === `g${F.gap}`) game.say(say.afterOk, 8);
    else return false;
    return true;
  },
  /** The stone of the last island: the boat's trips first, then the mirror where the zero remainder is forged. */
  onStone: (game) => (game.flags.trips ? { forge: 'inidam-baqi' } : { quiz: 'trips' }),
  onQuiz(game, id) {
    if (id !== 'trips') return;
    game.flags.trips = true;
    game.save();
    game.openForge('inidam-baqi');
  },
  // the last bridge is the lesson's problem (module 5: a long gap, the planks that fill it, their price)
  onBossPaid: (game) => game.onModule('5'),
};
