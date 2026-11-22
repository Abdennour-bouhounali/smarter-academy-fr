/**
 * THE STORY of lesson « قواعد قابلية القسمة » (1AM) in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea: the storm broke Zero's dividing machine. Every gap must still be filled exactly, and the gaps grow long —
 * the student learns to tell, from the gap's NUMBER alone, which plank fills it. Island after island (the textbook fixes
 * the الكفاءات, never this road; the numbers are the platform's own):
 *   A–C  planks 5 then 2 fill 35 and 46 → forge 1️⃣ on the chart of planks 5 and 2 (what to read: the units digit);
 *        95 with the moulds 2, 3, 5: the key answers before any try;
 *   C–E  plank 9 fills 81 → forge ➕ on the chart of planks 9 and 3 (the sum of the digits); 111 with 2, 9, 3: 3 and not 9;
 *   F    the gate dash, which ends on the table of 4 (36, then 28 among 26, 28, 30) → forge 🔢, found by GLUING: a gap of
 *        whole hundreds and a short gap, plank 4 on the gap they make (the hundreds change nothing: the number written
 *        by the units and tens digits decides); 136 with 3, 4, 5;
 *   H    the stone: « without dividing, which planks fill 1575? » — its answer shows each plank's remainder → forge 0️⃣
 *        (divisible ⇔ remainder 0, said three ways);
 *   the last bridge: 1575 cells, planks of 45 or 50 in the store — the Euclidean division decides, and the planks are paid
 *   in دج.
 * Every number of the story is in `NUMBERS` (one place); the sentences and the tablets are written from it.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';

/** The numbers of the story — ONE place: the segments, the sentences, the tablets and the tests read them from here. */
export const NUMBERS = {
  /** Islands A–C: plank 5 fills 35, plank 2 fills 46; then 95 is read before any try. */
  units: { gaps: [35, 46], planks: [5, 2], use: 95, useMoulds: [2, 3, 5] },
  /** Islands D–E: plank 9 fills 81 (2 and 5 are left out by the first key); then 111 with 2, 9, 3 — 3 and not 9. */
  sum: { gap: 81, plank: 9, moulds: [2, 5, 9], use: 111, useMoulds: [2, 9, 3], usePlank: 3 },
  /** After the dash (which ends on the table of 4): 136 with 3, 4, 5. */
  last2: { plank: 4, use: 136, useMoulds: [3, 4, 5] },
  /** The stone and the last bridge: one gap, five planks to read, two kinds in the store, the price of one plank (دج). */
  boss: { gap: 1575, read: [2, 3, 4, 5, 9], options: [45, 50], plank: 45, price: 80 },
};
const { units: U, sum: S, last2: L, boss: B } = NUMBERS;
const [U5, U2] = U.planks;
const [G35, G46] = U.gaps;
const BOSS_A = B.gap;
const BOSS_Q = BOSS_A / B.plank;
/** « n = d × k » with k computed. */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
const digitsOf = (n) => String(n).split('').map(Number);
const sumOf = (n) => digitsOf(n).reduce((t, x) => t + x, 0);

/** The stone's question: which of the five planks fill the last gap — said WITHOUT any division. */
export const STONE = { gap: BOSS_A, read: B.read, answer: B.read.filter((b) => BOSS_A % b === 0) };

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
  { id: 'A', name: 'مرسى الصيّادين', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة النخيل', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة اللوحة الخضراء', R: 9, theme: 'crystal', turn: -0.55 },
  { id: 'D', name: 'جزيرة الرمال', R: 9, theme: 'pine', turn: 0.42 },
  { id: 'E', name: 'جزيرة الزيتون', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة الضوء', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة المئات', R: 9, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'جزيرة اللوح الحجري', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'المنارة الكبيرة', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge(`g${G35}`, G35, 12.5, [U5], U5, { predict: false }),
  bridge(`g${G46}`, G46, 14.5, [U5, 3, U2], U2),
  bridge(`g${U.use}`, U.use, 16, U.useMoulds, U5),
  bridge(`g${S.gap}`, S.gap, 14, S.moulds, S.plank),
  bridge(`g${S.use}`, S.use, 17, S.useMoulds, S.usePlank),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(`g${L.use}`, L.use, 19, L.useMoulds, L.plank),
  {
    id: `g${BOSS_A}`,
    kind: 'bridge',
    a: BOSS_A,
    len: 26,
    moulds: [],
    holdsWith: B.plank,
    boss: { options: B.options, price: B.price },
  },
];
/**
 * The gate dash: one sentence, three gates, exactly one right — the two first keys on numbers of three digits, then the
 * table of 4 on small numbers: the last plank of the next mirror is met first where the student still knows it by heart.
 */
const DASH_WAVES = [
  { say: 'عدد يقبل القسمة على 5', gates: [352, 235, 523], test: (n) => n % 5 === 0 },
  { say: 'عدد يقبل القسمة على 2', gates: [417, 941, 568], test: (n) => n % 2 === 0 },
  { say: 'عدد يقبل القسمة على 9', gates: [705, 702, 708], test: (n) => n % 9 === 0 },
  { say: 'عدد يقبل القسمة على 3', gates: [124, 125, 126], test: (n) => n % 3 === 0 },
  { say: 'عدد يقبل القسمة على 2 وعلى 5', gates: [255, 250, 252], test: (n) => n % 2 === 0 && n % 5 === 0 },
  { say: 'عدد يقبل القسمة على 3 ولا يقبل القسمة على 9', gates: [36, 33, 35], test: (n) => n % 3 === 0 && n % 9 !== 0 },
  { say: '$4 \\times \\square = 36$', gates: [8, 9, 7], test: (n) => 4 * n === 36 },
  { say: 'عدد يقبل القسمة على 4', gates: [26, 28, 30], test: (n) => n % 4 === 0 },
];

/** The tablet of each rule: its name comes AFTER the student forged it. */
export const TABLETS = {
  'raqm-alahad': {
    icon: '1️⃣',
    title: 'رقم الآحاد: القسمة على 2 و 5',
    lines: [
      'يقبل عدد طبيعي القسمة على 2 إذا كان رقم آحاده 0 أو 2 أو 4 أو 6 أو 8.',
      'ويقبل القسمة على 5 إذا كان رقم آحاده 0 أو 5.',
    ],
    math: [times(G46, U2), times(U.use, U5)],
    notes: [`رقم آحاد ${G46} هو ${G46 % 10}، ورقم آحاد ${U.use} هو ${U.use % 10}`],
  },
  'majmu-arqam': {
    icon: '➕',
    title: 'مجموع الأرقام: القسمة على 3 و 9',
    lines: [
      'يقبل عدد طبيعي القسمة على 3 إذا كان مجموع أرقامه يقبل القسمة على 3.',
      'ويقبل القسمة على 9 إذا كان مجموع أرقامه يقبل القسمة على 9.',
    ],
    math: [`${digitsOf(S.gap).join(' + ')} = ${sumOf(S.gap)}`, times(S.gap, S.plank)],
    notes: [`مجموع أرقام ${S.use} هو ${sumOf(S.use)}: يقبل القسمة على 3 ولا يقبل القسمة على 9`],
  },
  'raqmayn-akhirayn': {
    icon: '🔢',
    title: 'الرقمان الأخيران: القسمة على 4',
    lines: ['يقبل عدد طبيعي القسمة على 4 إذا كان العدد المشكّل من رقمَي آحاده وعشراته يقبل القسمة على 4.'],
    math: [`${L.use} = 100 + ${L.use % 100}`, times(L.use % 100, L.plank)],
    // plain text (a tablet's notes are not drawn through MathText): no equality inside an RTL line
    notes: ['المئات تقبل دائمًا القسمة على 4، لأنّ 100 مضاعف للعدد 4'],
  },
  'baqi-sifr': {
    icon: '0️⃣',
    title: 'يقبل القسمة ⇔ الباقي معدوم',
    // ONE line of rule, the three sentences, one equality with its note: the board's naming card holds it at 1024 px
    lines: ['يقبل $a$ القسمة على $b$ عندما يكون باقي القسمة الإقليدية للعدد $a$ على $b$ معدومًا.'],
    list: [`${BOSS_A} يقبل القسمة على ${U5}`, `${BOSS_A} مضاعف للعدد ${U5}`, `${U5} يقسم ${BOSS_A}`],
    math: [`${BOSS_A} = ${U5} \\times ${BOSS_A / U5} + 0`],
    notes: ['الباقي 0: للجمل الثلاث معنى واحد'],
  },
};

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  // two lines on the title screen, like every lesson of the world: a longer name pushes the key hints out of the window
  title: 'أرخبيل القواسم: الآلة المعطّلة',
  subtitle: `العاصفة عطّلت آلة القسمة لدى «زيرو»، والهوّات تطول حتى ${BOSS_A} خانة. ابحث معه عن طريقة تعرف بها اللوح الذي يملأ الهوّة دون أن تقسم.`,
  objective: {
    board: 'اركب لوح الضوء نحو جزيرة المئات',
    bossGo: `اذهب إلى المنصّة المضيئة واختر الألواح التي تملأ ${BOSS_A} خانة`,
    bossCross: 'الجسر الأخير ثابت — اعبر إلى المنارة!',
  },
  say: {
    hello: `أنا زيرو! العاصفة عطّلت آلة القسمة عندي، والجسور مقطوعة. خذ القالب ${U5} ثم تعال إلى منصّة الضوء عند الهوّة.`,
    first: `${planks(G35 / U5)} طولها ${U5} تملأ ${G35} خانة. كنتُ أعرف ذلك بآلتي… والآن؟`,
    b46: `هوّة من ${G46} خانة وثلاثة قوالب. أيّها يملؤها؟`,
    both: `اللوح ${U2} ملأ ${G46}، واللوح ${U5} ملأ ${G35}. هل نعرف ذلك دون قسمة؟ مرآة الجزيرة تنتظرك.`,
    g95: `هوّة من ${U.use} خانة، والقوالب ${U.useMoulds.join(' و ')}. مفتاحك يجيب قبل أن تجرّب.`,
    g95Ok: `$${times(U.use, U5)}$: كما قال مفتاحك.`,
    d81: `هوّة من ${S.gap} خانة. مفتاحك يُبعد قالبين منها… جرّب الثالث.`,
    g111: `هوّة من ${S.use} خانة، والقوالب ${S.useMoulds.join(' و ')}. مفتاحك الجديد يجيب قبل أن تجرّب.`,
    g111Ok: `$${times(S.use, S.usePlank)}$: كما قال مفتاحك.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    g136: `هوّة من ${L.use} خانة، والقوالب ${L.useMoulds.join(' و ')}. مفاتيحك الثلاثة تجيب قبل أن تجرّب.`,
    g136Ok: `$${times(L.use, L.plank)}$: كما قالت مفاتيحك.`,
    h: `قبل الجسر الأخير، لوح هذه الجزيرة يسألك عن هوّته: ${BOSS_A} خانة.`,
    boss: `ها هو الجسر الأخير: ${BOSS_A} خانة. في المخزن نوعان من الألواح: ${B.options[0]} و ${B.options[1]}.`,
    bossFail: (b, r) => `بقيت ${r} خانة فارغة: الألواح ${b} لا تملأ ${BOSS_A}. جرّب النوع الآخر.`,
    bossOk: `${planks(BOSS_Q)} طولها ${B.plank}، والباقي 0: لا خانة فارغة. الجسر الأخير ثابت!`,
    end: 'عادت المنارة تضيء، وصرتَ تعرف من أرقام العدد وحدها ما كانت الآلة تقسمه. شكرًا لك!',
  },
  quiz: {
    stone: {
      prompt: `الهوّة الأخيرة طولها ${BOSS_A} خانة. دون أيّ قسمة، أيّ هذه الألواح يملؤها تمامًا؟ اختر كلّ ما يصلح.`,
      options: STONE.read.map((n) => ({ v: n, label: String(n) })),
      answer: STONE.answer,
      multi: true,
      a: BOSS_A,
      wrongGeneric: 'ليس تمامًا. اقرأ الهوّة بمفاتيحك الثلاثة، لوحًا بعد لوح.',
    },
  },
  boss: {
    title: 'مخزن الجسر الأخير',
    mission: `المهمّة: الجسر الأخير ${BOSS_A} خانة. اختر الألواح التي تملؤه تمامًا، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `أيّ النوعين يملأ ${BOSS_A} خانة تمامًا؟ أجرِ القسمة الإقليدية في كرّاسك: الباقي يحكم.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b}: كم لوحًا يدخل في ${BOSS_A} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planks(q)} طولها ${b}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planks(q)} طولها ${b} تساوي ${b * q} خانة: أطول من الهوّة (${BOSS_A})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة ${BOSS_A} خانة.`,
      big: (b, r) => `بقيت ${r} خانة: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ المنارة، وصنعتَ مفاتيح المعرفة الأربعة بنفسك.' },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b46, 8);
    if (k === 2) game.openForge('raqm-alahad');
    if (k === 3) game.say(say.d81, 8);
    if (k === 4) game.openForge('majmu-arqam');
    if (k === 5) game.say(say.f, 8);
    if (k === 6) game.openForge('raqmayn-akhirayn');
    if (k === 7) {
      game.say(say.h, 6);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /**
   * What the story does once the tablet of a key is closed. Modules of the lesson (its config): 1 = the units digit and
   * the sum of the digits, 3 = the last two digits, 2 = « يقبل القسمة » said by the remainder, 6 = the lesson's problem.
   */
  afterKey: {
    'raqm-alahad': (game) => game.say(game.T.say.g95, 8),
    'majmu-arqam': (game) => {
      game.onModule('1');
      game.say(game.T.say.g111, 8);
    },
    'raqmayn-akhirayn': (game) => {
      game.onModule('3');
      game.say(game.T.say.g136, 8);
    },
    'baqi-sifr': (game) => {
      game.flags.key4 = true;
      game.onModule('2');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 2 && missing(game, 'raqm-alahad')) return 'raqm-alahad';
    if (game.state.stage === 4 && missing(game, 'majmu-arqam')) return 'majmu-arqam';
    if (game.state.stage === 6 && missing(game, 'raqmayn-akhirayn')) return 'raqmayn-akhirayn';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg) {
    const { say } = game.T;
    if (seg.id === `g${G35}`) game.say(say.first, 7);
    else if (seg.id === `g${G46}`) game.say(say.both, 8);
    else if (seg.id === `g${U.use}`) game.say(say.g95Ok, 8);
    else if (seg.id === `g${S.use}`) game.say(say.g111Ok, 8);
    else if (seg.id === `g${L.use}`) game.say(say.g136Ok, 8);
    else return false;
    return true;
  },
  /** The stone of the last island: its question first, then the mirror where « remainder 0 » is forged. */
  onStone: (game) => (game.flags.stone ? { forge: 'baqi-sifr' } : { quiz: 'stone' }),
  onQuiz(game, id) {
    if (id !== 'stone') return;
    game.flags.stone = true;
    game.save();
    game.openForge('baqi-sifr');
  },
  // the last bridge is the lesson's problem (module 6)
  onBossPaid: (game) => game.onModule('6'),
};
