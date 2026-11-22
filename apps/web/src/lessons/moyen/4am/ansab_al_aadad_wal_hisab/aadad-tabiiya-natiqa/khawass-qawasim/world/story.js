/**
 * THE STORY of lesson « خواص قواسم عدد طبيعي » in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea, island after island (the textbook fixes the الكفاءات, never this road; the numbers are the platform's own):
 *   A — ONE plank of 7 fills the gaps 21 and 35; glued they make 56, cut they leave 14, and 7 fills both; but 7 fills
 *       22 + 20 = 42 while it fills neither 22 nor 20 → forge 🧩 « المجموع والفرق » (an experiment: join);
 *   B — a bridge of 18 with planks of 6, repeated: 36, 54 … up to 100 copies, too long to draw → forge ✖️ (stack);
 *   C — after the gate dash, a long gap of 735 and a bridge of 280: two bridges fit, 175 is left; the planks of 35 fill
 *       both, and they fill the leftover → forge 🧮 « باقي القسمة » (peel); the NEXT gap is one the key just sealed
 *       reads: the bridge 280 with the piece 175 laid on it leaves 105 — of the moulds 10, 14 and 35, the first two fill
 *       280 only (the lesson's trap), 35 fills 280 and 175, so it fills what is left;
 *   D — the stone: the harbour's question, then « the world picks other numbers each time: only letters hold » → forge ✍️
 *       (its island is « جزيرة الحجر »: the word « حروف » comes only with the tablet, after he has found them);
 *   the last bridge is the harbour's: 735 and 280 glued, 1015, with planks of 35.
 * LETTERS: k and k′ are the two natural numbers of a = d × k and b = d × k′ — in the proof cards, the tablet, the
 * trainer, the memo; q is only ever the quotient of a Euclidean division, and n the number a is multiplied by.
 * Every number of the story is in `NUMBERS` (one place); the sentences and the tablets are written from it.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';

/** The numbers of the story — ONE place: the segments, the sentences, the tablets and the tests read them from here. */
export const NUMBERS = {
  /** Island A: the plank 7 fills the two gaps; glued and cut; a sum it fills although it fills neither part. */
  join: { plank: 7, gaps: [21, 35], foil: [22, 20] },
  /** Island B: one bridge repeated. */
  stack: { bridge: 18, plank: 6, copies: 100 },
  /**
   * Island C: a long gap, a shorter bridge, the planks that are offered (35 fills both); `after`: the moulds of the gap
   * that follows the key — what the bridge leaves once the piece is laid on it (280 = 175 × 1 + 105).
   */
  peel: { long: 735, short: 280, plank: 35, planks: [5, 7, 10, 14, 35, 70], after: [10, 14, 35] },
  /** The last bridge: the two long bridges glued, two kinds of plank in the store, the price of one plank (دج). */
  boss: { long: 735, short: 280, options: [30, 35], plank: 35, price: 150 },
};
const { join: J, stack: K, peel: P, boss: B } = NUMBERS;
const [J1, J2] = J.gaps;
const GLUED = J1 + J2;
const CUT = J2 - J1;
const BOSS_A = B.long + B.short;
const BOSS_Q = BOSS_A / B.plank;
/** « n = d × k » with k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
const PEEL_Q = Math.floor(P.long / P.short);
const PEEL_R = P.long % P.short;
/** The gap after the third key: what is left of the bridge once the piece is laid on it. */
const AFTER = P.short % PEEL_R;
/** « n ألواح طولها d », agreed with the count: one plank, two planks, more. */
const planksOf = (n, d) => (n === 1 ? `لوح واحد طوله ${d}` : n === 2 ? `لوحان طولهما ${d}` : `${planks(n)} طولها ${d}`);

/** The harbour's question at the stone: which lengths the planks of 35 fill — said WITHOUT any division. */
export const HARBOUR = {
  sum: B.long + B.short,
  diff: B.long - B.short,
  rest: B.long % B.short,
  twice: 2 * B.short,
  plusOne: B.long + 1,
};

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
  { id: 'A', name: 'مرسى السبعة', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة الهوّتين', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة اللصق والقصّ', R: 9, theme: 'crystal', turn: -0.55 },
  { id: 'D', name: 'جزيرة الستّة', R: 9, theme: 'pine', turn: 0.42 },
  { id: 'E', name: 'جزيرة الأبراج', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة الضوء', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة البقايا', R: 9, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'جزيرة الحجر', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'المرفأ الكبير', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge('g21', J1, 12.5, [J.plank], J.plank, { predict: false }),
  bridge('g35', J2, 14.5, [4, 6, J.plank], J.plank),
  bridge('g56', GLUED, 17, [5, 6, J.plank], J.plank),
  bridge('g18', K.bridge, 12.5, [4, 5, K.plank], K.plank),
  bridge('g54', 3 * K.bridge, 17, [4, 5, K.plank], K.plank),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(`g${AFTER}`, AFTER, 19, P.after, P.plank),
  {
    id: 'g1015',
    kind: 'bridge',
    a: BOSS_A,
    len: 26,
    moulds: [],
    holdsWith: B.plank,
    boss: { options: B.options, price: B.price },
  },
];
/** The gate dash: one sentence, three gates, exactly one right — the facts of THIS lesson. */
const DASH_WAVES = [
  { say: `قاسم مشترك للعددين ${J1} و ${J2}`, gates: [5, 7, 3], test: (n) => J1 % n === 0 && J2 % n === 0 },
  { say: `$${J.plank} \\times \\square = ${GLUED}$`, gates: [7, 8, 9], test: (n) => J.plank * n === GLUED },
  {
    say: `$${GLUED} - ${J1} = ${J.plank} \\times \\square$`,
    gates: [4, 5, 6],
    test: (n) => J.plank * n === GLUED - J1,
  },
  { say: `مضاعف للعدد ${K.bridge}`, gates: [48, 54, 58], test: (n) => n % K.bridge === 0 },
  { say: `$${K.plank} \\times \\square = 54$`, gates: [7, 8, 9], test: (n) => K.plank * n === 54 },
  { say: `باقي قسمة ${J2} على ${J1}`, gates: [7, 12, 14], test: (n) => n === J2 % J1 },
  { say: 'قاسم مشترك للعددين 28 و 42', gates: [4, 6, 14], test: (n) => 28 % n === 0 && 42 % n === 0 },
  // the last wave gives nothing of island G away: it reads the sum island A showed him (22 + 20 = 42)
  {
    say: `$${J.plank} \\times \\square = ${J.foil[0] + J.foil[1]}$`,
    gates: [5, 6, 7],
    test: (n) => J.plank * n === J.foil[0] + J.foil[1],
  },
];

/** The tablet of each rule: its name comes AFTER the student forged it. */
export const TABLETS = {
  'jam-wal-farq': {
    icon: '🧩',
    title: 'المجموع والفرق',
    lines: [
      'إذا كان عدد $d$ يقسم العددين $a$ و $b$، فإنّه يقسم مجموعهما $a + b$.',
      'ويقسم فرقهما $a - b$ (حيث $a \\geq b$).',
    ],
    math: [`${J1} + ${J2} = ${times(GLUED, J.plank)}`, `${J2} - ${J1} = ${times(CUT, J.plank)}`],
    notes: [
      `العكس لا يصحّ: ${J.plank} يقسم ${J.foil[0] + J.foil[1]} = ${J.foil[0]} + ${J.foil[1]}، ولا يقسم أيًّا منهما`,
    ],
  },
  madaaf: {
    icon: '✖️',
    title: 'المضاعفات',
    lines: ['إذا كان $d$ يقسم $a$، فإنّه يقسم كلّ مضاعف للعدد $a$: يقسم $a \\times n$ مهما كان العدد الطبيعي $n$.'],
    math: [times(K.bridge, K.plank), `${K.bridge} \\times ${K.copies} = ${times(K.bridge * K.copies, K.plank)}`],
    notes: [
      `${K.plank} يقسم ${K.bridge}، إذن يقسم ${2 * K.bridge} و ${3 * K.bridge} و … و ${K.bridge * K.copies} دون أيّ قسمة`,
    ],
  },
  'baqi-qisma': {
    icon: '🧮',
    title: 'باقي القسمة',
    lines: [
      'إذا كان $d$ يقسم $a$ و $b$، و $r$ باقي القسمة الإقليدية للعدد $a$ على $b$، فإنّ $d$ يقسم $r$.',
      'الباقي هو $a - b \\times q$ (حيث $q$ حاصل القسمة): فرق عددين يقسمهما $d$.',
    ],
    math: [`${P.long} = ${P.short} \\times ${PEEL_Q} + ${PEEL_R}`, times(PEEL_R, P.plank)],
    notes: [`${P.plank} يقسم ${P.long} و ${P.short}، إذن يقسم الباقي ${PEEL_R}`],
  },
  burhan: {
    icon: '✍️',
    title: 'البرهان',
    lines: [
      'لإثبات أنّ $d$ يقسم عددًا، يكفي أن نكتب هذا العدد جداءً: $d$ في عدد طبيعي.',
      'نبدأ من الشرط، ونكتبه بحروف لا بأعداد: الأمثلة تتحقّق ولا تبرهن.',
    ],
    // the letters of the proof he assembled from cards (inquiries.js): k and k′ — never q, the quotient of tablet 3
    math: ["a = d \\times k \\qquad b = d \\times k'", "a + b = d \\times (k + k')"],
    notes: ['مجموع العاملين الجديدين عدد طبيعي، إذن القاسم يقسم المجموع مهما كانت الأعداد'],
  },
};

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: جسور المرفأ',
  subtitle: `المرفأ الكبير ينتظر جسرًا من ${BOSS_A} خانة، وألواح الجزر قليلة. ابحث مع «زيرو» عمّا يقوله لوح واحد عن جسور كثيرة.`,
  objective: {
    board: 'اركب لوح الضوء نحو جزيرة البقايا',
    bossGo: `اذهب إلى المنصّة المضيئة واختر الألواح التي تملأ ${BOSS_A} خانة`,
    bossCross: 'جسر المرفأ ثابت — اعبر إلى المرفأ!',
  },
  say: {
    hello: `أنا زيرو! جسور المرفأ مقطوعة. خذ القالب ${J.plank} ثمّ تعال إلى منصّة الضوء عند الهوّة.`,
    first: `${planksOf(J1 / J.plank, J.plank)} تملأ ${J1} خانة. احفظ هذا اللوح: ${J.plank}.`,
    b35: `هوّة من ${J2} خانة وثلاثة قوالب. أيّها يملؤها؟`,
    both: `اللوح ${J.plank} يملأ الهوّتين معًا: ${J1} و ${J2}.`,
    glued: `الهوّتان صارتا هوّة واحدة: ${GLUED} خانة. أيّ قالب يملؤها؟ مفتاحك يجيب قبل أن تجرّب.`,
    gluedOk: `$${GLUED} = ${J1} + ${J2} = ${J.plank} \\times ${GLUED / J.plank}$: كما قال مفتاحك.`,
    d18: `هوّة من ${K.bridge} خانة. جرّب القوالب.`,
    tower: `الهوّة التالية ${3 * K.bridge} خانة: ${K.bridge} ثلاث مرّات. مفتاحك يعرف اللوح.`,
    towerOk: `$${3 * K.bridge} = ${K.bridge} \\times 3 = ${K.plank} \\times ${(3 * K.bridge) / K.plank}$: كما قال مفتاحك.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    // the gap the third key reads before any plank is laid: what the bridge leaves under the piece
    after: `نضع القطعة ${PEEL_R} على الجسر ${P.short}: تبقى هوّة من ${AFTER} خانة. مفتاحك يعرف القالب قبل أن تجرّب.`,
    afterOk: `$${P.short} = ${PEEL_R} \\times ${Math.floor(P.short / PEEL_R)} + ${AFTER}$ و $${times(AFTER, P.plank)}$: كما قال مفتاحك.`,
    h: `قبل جسر المرفأ، حجر هذه الجزيرة يسألك عن الجسرين الطويلين: ${B.long} و ${B.short}.`,
    boss: `ها هو جسر المرفأ: ${BOSS_A} خانة. في المخزن نوعان من الألواح: ${B.options[0]} و ${B.options[1]}.`,
    bossFail: (b, r) => `بقيت ${r} خانة فارغة: الألواح ${b} لا تملأ ${BOSS_A}. جرّب النوع الآخر.`,
    bossOk: `${planksOf(BOSS_Q, B.plank)} ولا خانة فارغة. جسر المرفأ ثابت!`,
    end: 'عادت المنارة تضيء، والمرفأ موصول بالجزر من جديد. شكرًا لك!',
  },
  quiz: {
    harbour: {
      prompt: `جسران طويلان: ${B.long} و ${B.short} خانة، يملأ كلًّا منهما لوح طوله ${B.plank}. دون أيّ قسمة، أيّ هذه الأطوال يملؤها اللوح ${B.plank} تمامًا؟ اختر كلّ ما يصلح.`,
      options: [HARBOUR.sum, HARBOUR.plusOne, HARBOUR.diff, HARBOUR.twice, HARBOUR.rest].map((n) => ({
        v: n,
        label: String(n),
      })),
      answer: [HARBOUR.sum, HARBOUR.diff, HARBOUR.twice, HARBOUR.rest],
      multi: true,
      wrong: {
        [HARBOUR.plusOne]: `${HARBOUR.plusOne} هو ${B.long} + 1، واللوح ${B.plank} لا يملأ خانة واحدة: مفاتيحك لا تقول عنه شيئًا.`,
      },
      wrongGeneric:
        'ليس تمامًا. كلّ طول هنا صُنع من الجسرين: باللصق، أو بالقصّ، أو بالتكرار، أو هو ما يبقى. أيّها صُنع من أطوال يملؤها اللوح؟',
    },
  },
  boss: {
    title: 'مخزن جسر المرفأ',
    mission: `المهمّة: جسر المرفأ ${BOSS_A} خانة، وهو الجسران ${B.long} و ${B.short} معًا. اختر الألواح التي تملؤه تمامًا، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `أيّ النوعين يملأ ${BOSS_A} خانة تمامًا؟ مفتاحك يجيب قبل القسمة، ثمّ تحقّق في كرّاسك.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b}: كم لوحًا يدخل في ${BOSS_A} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planksOf(q, b)}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planksOf(q, b)}: ${b * q} خانة، أطول من الهوّة (${BOSS_A})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة ${BOSS_A} خانة.`,
      big: (b, r) => `بقيت ${r} خانة: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ المرفأ بالجزر، وصنعتَ مفاتيح المعرفة الأربعة بنفسك.' },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b35, 8);
    if (k === 2) game.openForge('jam-wal-farq');
    if (k === 3) game.say(say.d18, 8);
    if (k === 4) game.openForge('madaaf');
    if (k === 5) game.say(say.f, 8);
    if (k === 6) game.openForge('baqi-qisma');
    if (k === 7) {
      game.say(say.h, 6);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /** What the story does once the tablet of a key is closed (module 1 = the first key, 2 = the three properties, 3 = the proof). */
  afterKey: {
    'jam-wal-farq': (game) => {
      game.onModule('1');
      game.say(game.T.say.glued, 8);
    },
    madaaf: (game) => game.say(game.T.say.tower, 8),
    'baqi-qisma': (game) => {
      game.onModule('2');
      game.say(game.T.say.after, 9);
    },
    burhan: (game) => {
      game.flags.key4 = true;
      game.onModule('3');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 2 && missing(game, 'jam-wal-farq')) return 'jam-wal-farq';
    if (game.state.stage === 4 && missing(game, 'madaaf')) return 'madaaf';
    if (game.state.stage === 6 && missing(game, 'baqi-qisma')) return 'baqi-qisma';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg) {
    const { say } = game.T;
    if (seg.id === 'g21') game.say(say.first, 7);
    else if (seg.id === 'g35') game.say(say.both, 8);
    else if (seg.id === 'g56') game.say(say.gluedOk, 8);
    else if (seg.id === 'g54') game.say(say.towerOk, 8);
    else if (seg.id === `g${AFTER}`) game.say(say.afterOk, 9);
    else return false;
    return true;
  },
  /** The stone of the last island: the harbour's question first, then the mirror where the proof is forged. */
  onStone: (game) => (game.flags.harbour ? { forge: 'burhan' } : { quiz: 'harbour' }),
  onQuiz(game, id) {
    if (id !== 'harbour') return;
    game.flags.harbour = true;
    game.save();
    game.openForge('burhan');
  },
  // the last bridge is the lesson's problem (module 5: two lengths and the planks that fill them)
  onBossPaid: (game) => game.onModule('5'),
};
