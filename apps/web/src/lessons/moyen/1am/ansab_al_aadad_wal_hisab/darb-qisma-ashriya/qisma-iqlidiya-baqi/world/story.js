/**
 * THE STORY of lesson « القسمة الإقليدية » in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea, island after island (the textbook fixes the الكفاءات, never this road; the numbers are the platform's own):
 *   A — 4 planks of 7 fill 28 cells: count the planks;
 *   B — a gap of 30 and three moulds: 4 lays 7 planks and leaves 2, 7 lays 4 and leaves 2, 6 fills it
 *       → C: forge 🧺 « المجموعات الكاملة » (as many full planks as fit; their number is the quotient);
 *   C — 45 with the moulds 8, 9, 6 (8 leaves 5, 6 leaves 3)
 *       → D: forge ⚖️ « الباقي أصغر من المقسوم عليه » (what a plank can leave: 0, 1 … b − 1, the longest is b − 1);
 *   D — 52 with the moulds 5, 4, 6 (6 lays 8 planks and leaves 4)
 *       → E: forge 🟰 « a = b × q + r » (the gap rebuilt from its planks and its leftover);
 *   E — 63 with the mould 8: 7 planks and 7 cells, the longest leftover a plank of 8 can leave; F — the gate dash;
 *       → G: forge 🔭 « تقدير الحاصل » (the spyglass shows an old bridge of 692 cells, planks of 27);
 *   G — 78 with a plank of two digits (13);
 *   H — the station of the cable car: nothing is built here. 78 travellers, cabins of 8 — the stone's mirror
 *       → forge 🚡 « الباقي في مسألة » (the same division answers three questions: full cabins, cabins needed, who
 *       stays). The context is this lesson's own: the 2AM lesson of the same road has a boat and its trips.
 *   the last bridge is the harbour's: 864 cells, planks of 34 or 36, a price in دج.
 * Every number of the story is in `NUMBERS` (one place); the sentences and the tablets are written from it.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { cabinsOf, cellsOf, fullPlanksOf, planksOf, travellersOf } from './counted';

/** The numbers of the story — ONE place: the segments, the sentences, the tablets and the tests read them from here. */
export const NUMBERS = {
  /** Island A: the first bridge, one mould that fits. */
  first: { a: 28, plank: 7 },
  /** Island B: the plank 4 lays 7 full planks in 30; an eighth one would need 32. */
  count: { a: 30, moulds: [4, 6, 7], plank: 6, probe: 4 },
  /** Island C: 45 — the mould 8 leaves 5 cells (the gap the second mirror starts from). */
  groups: { a: 45, moulds: [8, 9, 6], plank: 9, probe: 8 },
  /** Island D: 52 — the mould 6 lays 8 planks and leaves 4 (the gap the third mirror hides under its cloth). */
  rests: { a: 52, moulds: [5, 4, 6], plank: 4, probe: 6 },
  /** Island E: 63 with 8 leaves 7 — the longest leftover of a plank of 8. */
  rebuild: { a: 63, moulds: [5, 8, 7], plank: 7, probe: 8 },
  /** Island G: a plank of two digits. */
  two: { a: 78, moulds: [8, 13, 9], plank: 13 },
  /** The spyglass of island G: an old bridge, too long to count plank by plank. */
  scope: { a: 692, plank: 27 },
  /** The cable-car station of island H: as many travellers as the cells he has just crossed, cabins of 8. */
  cable: { a: 78, b: 8 },
  /** The last bridge: two kinds of plank in the store, the price of one plank (دج). */
  boss: { a: 864, options: [34, 36], plank: 36, price: 50 },
};
const { first: A0, count: C, groups: GR, rests: RS, rebuild: RB, two: TW, scope: SC, cable: CB, boss: B } = NUMBERS;

/** Euclidean division: { q, r } — every leftover of the story is computed here, never typed. */
export const divide = (a, b) => ({ q: Math.floor(a / b), r: a % b });
const div = (a, b) => {
  const { q, r } = divide(a, b);
  return `${a} = ${b} \\times ${q} + ${r}`;
};
const COUNT = divide(C.a, C.probe);
const BOSS_Q = B.a / B.plank;
const SCOPE = divide(SC.a, SC.plank);
const CABLE = divide(CB.a, CB.b);
/** The gap near island C's where a plank of 8 leaves its longest leftover — one cell more and a plank goes in. */
const TOP = { a: GR.a - (GR.a % GR.probe) + GR.probe - 1 };
/** The tens digit of the old bridge's quotient, and its tens. */
const T1 = Math.floor(SCOPE.q / 10);
const SCOPE_T = T1 * 10;

/**
 * The old bridge of the spyglass, and the three orders of size a class may propose for its quotient — « between t and
 * t + 1 », « between 10t and 10(t + 1) », « between 100t and 100(t + 1) »; only the tens are right (the board asks it).
 */
export const SPYGLASS = { a: SC.a, b: SC.plank, tens: SCOPE_T, options: [T1, SCOPE_T, SCOPE_T * 10] };
/** The upper end of an option: t → t + 1, 10t → 10(t + 1), 100t → 100(t + 1). */
export const upTo = (n) => (n / T1) * (T1 + 1);

const missing = (game, key) => !game.state.keys.includes(key);
const bridge = (a, len, moulds, holdsWith, extra = {}) => ({
  id: `g${a}`,
  kind: 'bridge',
  a,
  len,
  moulds,
  predict: true,
  holdsWith,
  ...extra,
});

/**
 * The island where each mirror stands — ONE place: the story opens each forge from it (on arriving, or from the stone
 * of the island that has one), and a test checks that every forge is titled « مرآة <its island> ».
 */
const MIRROR_ISLAND = {
  'majmuaat-kamila': 'C',
  'baqi-asghar': 'D',
  'musawat-qisma': 'E',
  'taqdir-hasil': 'G',
  'baqi-fi-masala': 'H',
};
const ISLANDS = [
  { id: 'A', name: 'مرسى الألواح', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة العدّ', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة المجموعات', R: 9, theme: 'pine', turn: -0.55 },
  { id: 'D', name: 'جزيرة البقايا', R: 9, theme: 'autumn', turn: 0.42 },
  { id: 'E', name: 'جزيرة البنّاء', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة الضوء', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة المنظار', R: 9, theme: 'pine', turn: -0.42 },
  { id: 'H', name: 'جزيرة التليفريك', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'مرفأ النخيل', R: 12, theme: 'snow', turn: 0 },
];
const SEGMENTS = [
  bridge(A0.a, 12.5, [A0.plank], A0.plank, { predict: false }),
  bridge(C.a, 13, C.moulds, C.plank),
  bridge(GR.a, 15, GR.moulds, GR.plank),
  bridge(RS.a, 16, RS.moulds, RS.plank),
  bridge(RB.a, 17, RB.moulds, RB.plank),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(TW.a, 19, TW.moulds, TW.plank),
  {
    id: `g${B.a}`,
    kind: 'bridge',
    a: B.a,
    len: 26,
    moulds: [],
    holdsWith: B.plank,
    boss: { options: B.options, price: B.price },
  },
];
const RSD = divide(RS.a, RS.probe);
/** The gate dash: one sentence, three gates, exactly one right — the facts of THIS lesson, after its first three keys. */
const DASH_WAVES = [
  { say: `حاصل قسمة ${C.a} على ${C.probe}`, gates: [6, 7, 8], test: (n) => n === divide(C.a, C.probe).q },
  { say: `باقي قسمة ${C.a} على 7`, gates: [1, 2, 3], test: (n) => n === divide(C.a, 7).r },
  { say: `باقي قسمة ${GR.a} على 6`, gates: [1, 3, 5], test: (n) => n === divide(GR.a, 6).r },
  { say: 'باقٍ ممكن لقسمة على 6', gates: [4, 6, 8], test: (n) => n < 6 },
  { say: `أكبر باقٍ ممكن في القسمة على ${RB.probe}`, gates: [6, 7, 8], test: (n) => n === RB.probe - 1 },
  { say: `حاصل قسمة ${RS.a} على ${RS.probe}`, gates: [7, 8, 9], test: (n) => n === RSD.q },
  {
    say: `المقسوم عليه ${RS.probe}، الحاصل ${RSD.q}، الباقي ${RSD.r}: المقسوم`,
    gates: [RS.probe * RSD.q, RS.a, RS.probe * (RSD.q + 1)],
    test: (n) => n === RS.probe * RSD.q + RSD.r,
  },
  { say: `حاصل قسمة ${RB.a} على ${RB.probe}`, gates: [6, 7, 8], test: (n) => n === divide(RB.a, RB.probe).q },
];

/** The tablet of each rule: its name comes AFTER the student forged it. Two short equalities at most; notes in words. */
export const TABLETS = {
  'majmuaat-kamila': {
    icon: '🧺',
    title: 'المجموعات الكاملة',
    lines: [
      'نضع أكبر عدد ممكن من الألواح الكاملة: نتوقّف عندما لا يدخل لوح آخر.',
      'عدد الألواح الكاملة هو حاصل القسمة الإقليدية.',
    ],
    math: [
      `${C.probe} \\times ${COUNT.q} = ${C.probe * COUNT.q}`,
      `${C.probe} \\times ${COUNT.q + 1} = ${C.probe * (COUNT.q + 1)}`,
    ],
    notes: [
      `في ${C.a} خانة: ${fullPlanksOf(COUNT.q)} طولها ${C.probe}، واللوح التالي يحتاج ${C.probe * (COUNT.q + 1)} خانة`,
    ],
  },
  'baqi-asghar': {
    icon: '⚖️',
    title: 'الباقي أصغر من المقسوم عليه',
    lines: [
      'ما يبقى بعد الألواح الكاملة هو الباقي $r$، وهو أصغر دائمًا من المقسوم عليه $b$: $r < b$.',
      'في القسمة على $b$ الباقي هو أحد الأعداد $0$، $1$، …، $b - 1$: أكبر باقٍ ممكن هو $b - 1$.',
    ],
    math: [div(TOP.a, GR.probe), div(TOP.a + 1, GR.probe)],
    notes: [
      `مع ألواح طولها ${GR.probe} يبقى من 0 إلى ${GR.probe - 1} خانات: ${cellsOf(GR.probe)} فارغة تأخذ لوحًا آخر`,
    ],
  },
  'musawat-qisma': {
    icon: '🟰',
    title: 'مساواة القسمة الإقليدية',
    lines: ['$a = b \\times q + r$ حيث $r < b$.', '$a$ المقسوم، $b$ المقسوم عليه، $q$ الحاصل، $r$ الباقي.'],
    math: [div(RS.a, RS.probe), div(C.a, C.probe)],
    notes: ['الألواح الكاملة مع الخانات الباقية تعيد طول الهوّة كاملًا'],
  },
  'taqdir-hasil': {
    icon: '🔭',
    title: 'تقدير الحاصل',
    lines: [
      'للقسمة على عدد من رقمين نقدّر عشرات الحاصل أوّلًا، ثمّ آحاده.',
      'نجرّب $b \\times 10$ ثمّ $b \\times 20$… ونتوقّف قبل أن نتجاوز المقسوم.',
    ],
    math: [`${SC.plank} \\times ${SCOPE_T} = ${SC.plank * SCOPE_T}`, div(SC.a, SC.plank)],
    notes: [`${planksOf(SCOPE_T)} أوّلًا، ثمّ ${planksOf(SCOPE.q - SCOPE_T)} أخرى: الحاصل ${SCOPE.q}`],
  },
  'baqi-fi-masala': {
    icon: '🚡',
    title: 'الباقي في مسألة',
    lines: [
      'في مسألة توزيع نُجري القسمة الإقليدية ثمّ نقرأ السؤال: الحاصل $q$ هو عدد المجموعات الكاملة، والباقي $r$ هو ما يبقى خارجها.',
      'ليُؤخذ الكلّ: تلزم $q$ مجموعة إذا كان $r = 0$، وتلزم $q + 1$ إذا بقي شيء.',
    ],
    math: [div(CB.a, CB.b), `${CABLE.q} + 1 = ${CABLE.q + 1}`],
    notes: [
      `${travellersOf(CB.a)} في عربات تحمل ${CB.b}: تمتلئ ${cabinsOf(CABLE.q)}، ويبقى ${travellersOf(CABLE.r)}، فتلزم ${cabinsOf(CABLE.q + 1)}`,
    ],
  },
};

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: مرفأ النخيل',
  subtitle: `مرفأ النخيل ينتظر جسرًا من ${B.a} خانة. اعبر الجزر مع «زيرو»: عُدّ الألواح الكاملة، وانظر ماذا يبقى في كلّ مرّة.`,
  prompt: { stone: 'انظر في مرآة الحجر' },
  objective: {
    board: 'اركب لوح الضوء نحو جزيرة المنظار',
    stone: 'اذهب إلى حجر الجزيرة (السهم الأصفر): مرآته تنتظرك',
    bossGo: `اذهب إلى المنصّة المضيئة واختر الألواح التي تملأ ${B.a} خانة`,
    bossCross: 'جسر المرفأ ثابت — اعبر إلى المرفأ!',
  },
  say: {
    hello: `أنا زيرو! جسور مرفأ النخيل مقطوعة. خذ القالب ${A0.plank} ثم تعال إلى منصّة الضوء عند الهوّة.`,
    first: `${planksOf(A0.a / A0.plank)} طولها ${A0.plank} تملأ ${A0.a} خانة. عُدّ الألواح في كلّ جسر: عددها مهمّ.`,
    b30: `هوّة من ${C.a} خانة وثلاثة قوالب. قبل أن تطلق: كم خانة ستبقى فارغة؟`,
    g45: `هوّة من ${GR.a} خانة. مفتاحك يعدّ الألواح الكاملة قبل أن تطلقها.`,
    g45Ok: `$${GR.a} = ${GR.plank} \\times ${GR.a / GR.plank}$: ألواح كاملة، ولا خانة فارغة.`,
    d52: `هوّة من ${RS.a} خانة. مفتاحك يعرف ما يمكن أن يبقى مع كلّ قالب، قبل أن تطلق.`,
    g63: `الهوّة التالية ${RB.a} خانة، وفيها القالب ${RB.probe}. ما أكبر باقٍ يمكن أن يتركه؟ أعد بناء الهوّة بمساواتك.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    g78: `هوّة من ${TW.a} خانة، وقالب طوله ${TW.plank}: رقمان! قدّر عدد الألواح قبل أن تطلق.`,
    g78Ok: `$${TW.a} = ${TW.plank} \\times ${TW.a / TW.plank} + 0$: كما قدّرتَ.`,
    h: `هنا لا نبني جسرًا: ${travellersOf(CB.a)} ينتظرون عربات التليفريك، وكلّ عربة تحمل ${CB.b}. مرآة الحجر تسألك عنهم.`,
    stoneWaits: 'مرآة الحجر تنتظرك: السهم الأصفر يدلّك عليها.',
    boss: `ها هو جسر المرفأ: ${B.a} خانة. في المخزن نوعان من الألواح: ${B.options[0]} و ${B.options[1]}.`,
    bossFail: (b, r) =>
      `دخل ${fullPlanksOf(divide(B.a, b).q)} وبقيت ${cellsOf(r)}: لا مكان للوح آخر، والألواح ${b} لا تملأ ${B.a}. جرّب النوع الآخر.`,
    bossOk: `${planksOf(BOSS_Q)} طولها ${B.plank} ولا خانة فارغة. جسر المرفأ ثابت!`,
    end: 'عادت المنارة تضيء، ومرفأ النخيل موصول بالجزر من جديد. شكرًا لك!',
  },
  boss: {
    title: 'مخزن جسر المرفأ',
    mission: `المهمّة: جسر مرفأ النخيل ${B.a} خانة. اختر الألواح التي تملؤه تمامًا، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `أيّ النوعين يملأ ${B.a} خانة دون أن تبقى خانة فارغة؟ قدّر الحاصل أوّلًا، ثمّ أجرِ القسمة في كرّاسك.`,
    mould: (b) => `ألواح طولها ${b}`,
    tried: (r) =>
      `جُرِّب: ${r === 0 ? 'لا تبقى أيّ خانة' : r === 1 ? 'تبقى خانة واحدة' : r === 2 ? 'تبقى خانتان' : `تبقى ${cellsOf(r)}`}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b}: كم لوحًا كاملًا يدخل في ${B.a} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planksOf(q)} طولها ${b}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planksOf(q)} طولها ${b} تساوي ${b * q} خانة: أطول من الهوّة (${B.a})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والهوّة ${B.a} خانة.`,
      big: (b, r) => `بقيت ${cellsOf(r)}: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ مرفأ النخيل بالجزر، وصنعتَ مفاتيح القسمة الخمسة بنفسك.' },
};

/** The forge that opens on ARRIVING at an island (the last one opens from the stone of island H). */
const FORGE_AT = {};
/** …and the forge the stone opens. */
let STONE_FORGE = null;
for (const [key, id] of Object.entries(MIRROR_ISLAND)) {
  const k = ISLANDS.findIndex((isl) => isl.id === id);
  if (ISLANDS[k].feature === 'stone') STONE_FORGE = key;
  else FORGE_AT[k] = key;
}

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b30, 8);
    if (k === 5) game.say(say.f, 8);
    if (FORGE_AT[k]) game.openForge(FORGE_AT[k]);
    if (k === 7) {
      game.say(say.h, 7);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /**
   * What the story does once the tablet of a key is closed. The modules of the lesson's config it marks: 1 (the activity:
   * the full groups), 2 (the knowledge: the remainder and the equality), 3 (the divisions and the bracketing: the
   * estimate), 4 (the problems: what the leftover means).
   */
  afterKey: {
    'majmuaat-kamila': (game) => {
      game.onModule('1');
      game.say(game.T.say.g45, 8);
    },
    'baqi-asghar': (game) => game.say(game.T.say.d52, 8),
    'musawat-qisma': (game) => {
      game.onModule('2');
      game.say(game.T.say.g63, 9);
    },
    'taqdir-hasil': (game) => {
      game.onModule('3');
      game.say(game.T.say.g78, 8);
    },
    // the world's flag `key4` means « the stone has given its key »: the store of the last bridge opens
    'baqi-fi-masala': (game) => {
      game.flags.key4 = true;
      game.onModule('4');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    const key = FORGE_AT[game.state.stage];
    return key && missing(game, key) ? key : null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg) {
    const { say } = game.T;
    if (seg.id === `g${A0.a}`) game.say(say.first, 7);
    else if (seg.id === `g${GR.a}`) game.say(say.g45Ok, 8);
    else if (seg.id === `g${TW.a}`) game.say(say.g78Ok, 8);
    else return false;
    return true;
  },
  /** The stone of the last island: no question is asked before the rule exists — it opens the mirror where the last key is forged. */
  onStone: () => ({ forge: STONE_FORGE }),
  // the last bridge is the lesson's problem (module 5: a big gap, two kinds of plank, a price)
  onBossPaid: (game) => game.onModule('5'),
};
