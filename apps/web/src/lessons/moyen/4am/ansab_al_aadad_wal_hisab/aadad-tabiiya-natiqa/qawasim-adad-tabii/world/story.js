/**
 * THE STORY of lesson « قواسم عدد طبيعي » in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea, island after island (the textbook fixes the الكفاءات, never this road; the numbers are the platform's own):
 *   24 with planks of 3 holds with 8 planks → the SAME gap holds with planks of 8, 3 of them: a bridge gives a second one;
 *   40: 5, 6 or 8? → the mirror: forge 🧱 « جداء عاملين »;
 *   31: nothing on the pedestals fits; the workshop makes any length — only 1 does → forge 🔑 (a natural number of planks);
 *   36 = 4 × 9 = 6 × 6, the gate dash, then forge 🔍: which planks must be tried (their square does not pass the gap);
 *   60, then the stone: 252 cells and five planks, no division → forge ⚡ (the divisibility rules);
 *   the last bridge is the lesson's problem: 96 books in equal rows, shelves of 20 or of 12.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';

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

/** The last bridge — ONE place for its numbers: the segment and every sentence of the store read them from here. */
const BOSS = { a: 96, options: [20, 12], holdsWith: 12, price: 1400 };
const shelves = (q) => (q === 1 ? 'رفّ واحد' : q === 2 ? 'رفّان' : q <= 10 ? q + ' رفوف' : q + ' رفًّا');

const ISLANDS = [
  { id: 'A', name: 'مرسى الأزواج', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة الشريك', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة الاختيار', R: 9, theme: 'pine', turn: -0.55 },
  { id: 'D', name: 'جزيرة الأزواج', R: 9, theme: 'crystal', turn: 0.42, feature: 'anvil' },
  { id: 'E', name: 'الجزيرة العنيدة', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة الضوء', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة المربّعات', R: 9, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'المرفأ الأخير', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'منارة المكتبة', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge('g24', 24, 12.5, [3], 3, { predict: false }),
  bridge('g24b', 24, 12.5, [5, 8], 8),
  bridge('g40', 40, 16.5, [6, 5, 8], 5),
  bridge('g31', 31, 14.5, [2, 3, 5], 1, { workshop: { min: 1, max: 9 } }),
  bridge('g36', 36, 15.5, [4, 6, 9], 6),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge('g60', 60, 19, [7, 8, 10], 10),
  {
    id: 'g96',
    kind: 'bridge',
    a: BOSS.a,
    len: 26,
    moulds: [],
    holdsWith: BOSS.holdsWith,
    boss: { options: BOSS.options, price: BOSS.price },
  },
];
/** The gate dash: one sentence, three gates, exactly one right. */
const DASH_WAVES = [
  { say: 'قاسم للعدد 24', gates: [5, 8, 9], test: (n) => 24 % n === 0 },
  { say: '$35 = 5 \\times \\square$', gates: [6, 7, 8], test: (n) => 5 * n === 35 },
  { say: 'قاسم للعدد 36', gates: [7, 8, 9], test: (n) => 36 % n === 0 },
  { say: '$48 = 6 \\times \\square$', gates: [7, 8, 9], test: (n) => 6 * n === 48 },
  { say: 'قاسم للعدد 40', gates: [6, 8, 9], test: (n) => 40 % n === 0 },
  { say: 'شريك 4 في العدد 28', gates: [6, 7, 8], test: (n) => 4 * n === 28 },
  { say: 'قاسم للعدد 63', gates: [6, 8, 9], test: (n) => 63 % n === 0 },
  { say: '$54 = 9 \\times \\square$', gates: [5, 6, 7], test: (n) => 9 * n === 54 },
];

/** The tablet of each rule: its name comes AFTER the student forged it. */
export const TABLETS = {
  'jidaa-aamilayn': {
    icon: '🧱',
    title: 'جداء عاملين: قاسمان معًا',
    lines: [
      'كلّ كتابة لعدد على شكل جداء عاملين تعطي قاسمين له: العاملان معًا.',
      'لتعيين قواسم عدد، نكتبه جداءَ عاملين بكلّ الأشكال الممكنة.',
    ],
    math: ['24 = 3 \\times 8 = 8 \\times 3', '24 = 1 \\times 24 = 2 \\times 12 = 3 \\times 8 = 4 \\times 6'],
    notes: ['قواسم 24 هي: 1، 2، 3، 4، 6، 8، 12، 24'],
  },
  'qasim-rappel': {
    icon: '🔑',
    title: 'القاسم: جداء بعدد طبيعي',
    lines: [
      '$b$ قاسم للعدد $a$ معناه: يوجد عدد طبيعي $q$ حيث $a = b \\times q$.',
      'حاصل بفاصلة لا يجعل العدد قاسمًا: لا يوجد جزء من لوح.',
    ],
    math: ['36 = 4 \\times 9', '31 = 2 \\times 15{,}5'],
    notes: ['4 قاسم للعدد 36', '2 ليس قاسمًا للعدد 31'],
  },
  'tariqa-qawasim': {
    icon: '🔍',
    title: 'أين نتوقّف',
    lines: [
      'لتعيين قواسم عدد $a$ نجرّب فقط الأعداد التي مربّعها لا يتجاوز $a$.',
      'كلّ قسمة تامّة تعطي قاسمين: العدد المجرَّب وشريكه.',
    ],
    math: [
      '7^2 = 49 \\leq 60 < 64 = 8^2',
      '60 = 1 \\times 60 = 2 \\times 30 = 3 \\times 20 = 4 \\times 15 = 5 \\times 12 = 6 \\times 10',
    ],
    notes: ['لقواسم 60 نجرّب من 1 إلى 7 فقط', 'بعد ذلك تعود الجداءات نفسها مقلوبة'],
  },
  'qawaid-qisma': {
    icon: '⚡',
    title: 'قواعد قابلية القسمة',
    lines: ['من أجل 2 و 3 و 4 و 5 و 9 لا نُجري القسمة: نقرأ أرقام العدد.'],
    list: [
      'على 2: رقم الآحاد زوجي',
      'على 5: رقم الآحاد 0 أو 5',
      'على 3: مجموع الأرقام من مضاعفات 3',
      'على 9: مجموع الأرقام من مضاعفات 9',
      'على 4: الرقمان الأخيران يكوّنان مضاعفًا للعدد 4',
    ],
    math: ['252:\\ 2+5+2 = 9'],
    notes: ['252 يقبل القسمة على 3 وعلى 9، وعلى 2 وعلى 4، ولا يقبلها على 5'],
  },
};

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: جزر الأزواج',
  subtitle:
    'المنارة تنتظر 96 كتابًا، والجسور مقطوعة من جديد. هذه المرّة لا يكفي لوح واحد: ابحث مع «زيرو» عن كلّ الألواح.',
  objective: {
    board: 'اركب لوح الضوء نحو جزيرة المربّعات',
    bossGo: 'اذهب إلى المنصّة المضيئة واختر الرفّ الذي يملأ 96 خانة',
    bossCross: 'جسر المكتبة ثابت — اعبر إلى المنارة!',
  },
  say: {
    hello: 'أنا زيرو! عدنا إلى الأرخبيل. خذ القالب 3 ثم تعال إلى منصّة الضوء عند الهوّة.',
    first: 'ثمانية ألواح طولها 3. احفظ هذا العدد: ثمانية!',
    again: 'الهوّة نفسها: 24 خانة. بين القوالب لوح طوله… 8. ماذا تتوقّع؟',
    partner: 'ثلاثة ألواح طولها 8: الجسر الأوّل مقلوبًا! $24 = 3 \\times 8 = 8 \\times 3$',
    c40: 'هوّة من 40 خانة وثلاثة قوالب. إن ثبت أحدها، فكّر في شريكه.',
    d31: 'هوّة من 31 خانة… جرّب قوالب الجزيرة، ثمّ انظر إلى الورشة.',
    anvilOpen: 'لا قالب من قوالب الجزيرة يملأ 31! الورشة مفتوحة: اصنع قالبًا بالطول الذي تريده.',
    e36: 'هوّة من 36 خانة: 4، 6 أو 9؟ أحدها شريك نفسه.',
    square: 'ستّة ألواح طولها 6: الشريك هو اللوح نفسه! $36 = 6 \\times 6$',
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    g60: 'هوّة من 60 خانة. كم لوحًا يجب أن نجرّب لنجدها كلّها؟',
    h: 'قبل جسر المكتبة، لوح هذه الجزيرة يسألك عن هوّة لا تُبنى.',
    boss: 'ها هو جسر المكتبة: 96 خانة حتى المنارة. في المخزن رفّان فقط: 20 و 12.',
    bossFail: (b, r) => `بقيت ${r} خانة فارغة: الرفّ ${b} لا يملأ 96. جرّب الرفّ الآخر.`,
    bossOk: `${planks(8)} طولها 12 ولا خانة فارغة. جسر المكتبة ثابت!`,
    end: 'عادت المنارة تضيء، والكتب الستّة والتسعون في رفوفها. شكرًا لك!',
  },
  quiz: {
    rules: {
      prompt: 'هوّة من 252 خانة: أطول من أن تُبنى أو تُقسم. دون أيّ قسمة، أيّ القوالب تملؤها تمامًا؟ اختر كلّ ما يصلح.',
      options: [2, 3, 4, 5, 9].map((n) => ({ v: n, label: String(n) })),
      answer: [2, 3, 4, 9],
      multi: true,
      a: 252,
      wrongGeneric: 'ليس تمامًا. انظر إلى أرقام 252: رقم آحاده، مجموع أرقامه، رقماه الأخيران.',
    },
  },
  boss: {
    title: 'مخزن جسر المكتبة',
    mission:
      'المهمّة: 96 كتابًا تُعرض في رفوف مملوءة تمامًا. اختر الرفّ الذي يملأ 96 خانة، ابنِ الجسر، ثمّ ادفع ثمن رفوفه.',
    choose: 'أيّ الرفّين يملأ 96 خانة تمامًا؟ احسب في كرّاسك، ثمّ اختر.',
    mould: (b) => `رفوف تتّسع لـ ${b} كتابًا`,
    steps: ['اختر رفًّا واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن الرفّ الواحد: ${BOSS.price} دج`,
    divide: (b) => `الرفّ ${b}: كم رفًّا يدخل في ${BOSS.a} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الرفوف',
    change: 'أغيّر الرفّ',
    unit: 'دج',
    costAsk: (b, q) =>
      `الجسر ثابت: ${shelves(q)} تتّسع كلّ واحدة لـ ${b} كتابًا. ثمن الرفّ الواحد ${BOSS.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الرفوف، والخانات الباقية.',
      long: (b, q) => `${shelves(q)} من ${b} تساوي ${b * q} خانة: أطول من الهوّة (${BOSS.a})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة ${BOSS.a} خانة.`,
      big: (b, r) => `بقيت ${r} خانة: ما زال هناك مكان لرفّ آخر يتّسع لـ ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الرفوف × ثمن الرفّ الواحد.`,
    },
  },
  end: { text: 'أعدتَ بناء كلّ الجسور وصنعتَ مفاتيح المعرفة الأربعة بنفسك.' },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.again, 8);
    if (k === 2) game.say(say.c40, 8);
    if (k === 3) game.openForge('jidaa-aamilayn');
    if (k === 4) game.openForge('qasim-rappel');
    if (k === 5) game.say(say.f, 8);
    if (k === 6) {
      game.onModule('3');
      game.openForge('tariqa-qawasim');
    }
    if (k === 7) {
      game.say(say.h, 6);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /** What the story does once the tablet of a key is closed. */
  afterKey: {
    'jidaa-aamilayn': (game) => game.say(game.T.say.d31, 8),
    'qasim-rappel': (game) => {
      game.onModule('1');
      game.say(game.T.say.e36, 8);
    },
    'tariqa-qawasim': (game) => game.say(game.T.say.g60, 8),
    'qawaid-qisma': (game) => {
      game.flags.key4 = true;
      game.onModule('2');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 3 && missing(game, 'jidaa-aamilayn')) return 'jidaa-aamilayn';
    if (game.state.stage === 4 && missing(game, 'qasim-rappel')) return 'qasim-rappel';
    if (game.state.stage === 6 && missing(game, 'tariqa-qawasim')) return 'tariqa-qawasim';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (seg.id === 'g24') game.say(say.first, 7);
    else if (seg.id === 'g24b') game.say(say.partner, 8);
    else if (seg.id === 'g36' && b === 6) game.say(say.square, 8);
    else return false;
    return true;
  },
  /** What the stone of the last harbour shows: its question about a gap nobody can build, then the mirror of the last key. */
  // the stone's question cannot be answered yet: it OPENS the search (the forge, whose last step is that very question);
  // once the key is his, the stone asks it again as a quiz
  onStone: (game) => (game.flags.key4 ? { quiz: 'rules' } : { forge: 'qawaid-qisma' }),
  onQuiz(game, id) {
    if (id !== 'rules') return;
    game.flags.rules = true;
    game.save();
    game.openForge('qawaid-qisma');
  },
  onBossPaid: (game) => game.onModule('4'),
};
