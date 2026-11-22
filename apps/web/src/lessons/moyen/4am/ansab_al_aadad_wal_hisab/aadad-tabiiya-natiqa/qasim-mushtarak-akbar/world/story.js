/**
 * THE STORY of lesson « القاسم المشترك الأكبر لعددين طبيعيين » in the world « أرخبيل القواسم » — what the world's mechanic
 * plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 *
 * The idea, island after island (the textbook fixes the الكفاءات, never this road; the numbers are the platform's own):
 *   A → C — a CONVOY (owner, 2026-11-19): the planks he takes on A build TWO bridges, 198 then 234, and island B has none.
 *           A offers 7 (fills neither), 11 (the first only), 13 (the second only) and 9 (both). With 11 the first bridge
 *           holds and the second refuses it: he walks back to A and picks again — the islands ARE the experiment of
 *           forge 🤝 « القواسم المشتركة », whose evidence is the planks he fired on the two gaps (no « استكشف » screen);
 *   C → E — a convoy with a PURSE of 42 coins, one per plank whatever its length: 266 then 322, and C offers 2, 7, 14 —
 *           all fill both. 2 runs out of coins on the first bridge, 7 on the second (38 + 4 of 46); only 14 builds both
 *           (19 + 23 = 42). Its evidence: the planks he tried and how many each needs → forge 👑 « PGCD(a ; b) »;
 *   E → G — the longest common plank of the twins (18) fills the gap 342; the gate dash; then the florist's flowers:
 *           identical bouquets with ALL of them → forge 💐 « الباقات المتماثلة »;
 *   H     — the stone: the dates and the figs of the island, shared into identical baskets — every number of baskets that
 *           works — then the mirror where the common planks are read off the longest one → forge 🧩;
 *   I     — the last bridge leads to the flower market: its walkway is TWO stretches laid end to end, one cell per flower —
 *           364 for the roses, then 286 for the lilies — and ONE kind of plank must fill each stretch exactly, the longest
 *           there is. The store offers 28 (it fills the roses' stretch alone: 286 = 28 × 10 + 6) and 26 = PGCD(364 ; 286):
 *           he must look for the longest plank of BOTH stretches, a plain division of 650 is not enough to choose. On the
 *           whole walkway 650 = 28 × 23 + 6 (the same 6 empty cells) and 650 = 26 × 25; then the price of the 25 planks.
 *           (The market's bouquets themselves are the last bridge, not a screen.)
 * Every number of the story is in `NUMBERS` (one place); the sentences and the tablets are written from it.
 * The hooks receive the game and use its commands; they hold no mechanic.
 */
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import {
  BOUQUETS,
  COINS,
  DATES,
  FIGS,
  LILIES,
  ROSES,
  commonDivisors,
  counted,
  divisorsOf,
  emptyCells,
  gcd,
  listAr,
} from './math';

/** The numbers of the story — ONE place: the segments, the sentences, the tablets and the tests read them from here. */
export const NUMBERS = {
  /**
   * Islands A–C, the convoy « twins »: the planks of island A build both gaps (island B has none) — 7 fills neither, 11
   * the first only, 13 the second only, 9 both.
   */
  twin: { gaps: [198, 234], moulds: [11, 7, 9, 13], neither: 7, first: 11, second: 13, plank: 9 },
  /**
   * Islands C–E, the convoy « crown »: every plank of island C fills both gaps; the purse pays one coin per plank, and
   * only the longest plank builds both bridges with its coins (19 + 23 = 42).
   */
  second: { gaps: [266, 322], moulds: [2, 7, 14], plank: 14, purse: 42 },
  /** Island E–F: the longest common plank of the twins fills another gap. */
  long: { gap: 342, moulds: [8, 12, 18], plank: 18 },
  /** Island G: the florist's flowers — the numbers of the bouquets' forge. */
  bouquets: { roses: 40, lilies: 56 },
  /** Islands G–H: the gap of the dates, and the stone's baskets (dates and figs, the numbers of baskets offered). */
  baskets: { dates: 228, figs: 276, moulds: [8, 12, 24], plank: 12, options: [4, 6, 8, 12, 24] },
  /**
   * The last bridge: the flowers of the market (one cell each — the roses' stretch, then the lilies'), the two kinds of
   * plank (28 fills the roses' stretch only; 26 fills both, the longest that does), the price of one plank (دج).
   */
  boss: { roses: 364, lilies: 286, options: [28, 26], plank: 26, price: 140 },
};
const { twin: W, second: S, long: L, bouquets: F, baskets: K, boss: B } = NUMBERS;
const [W1, W2] = W.gaps;
const [S1, S2] = S.gaps;
const TWIN_PGCD = gcd(W1, W2);
const SECOND_PGCD = gcd(S1, S2);
const FLOWERS_PGCD = gcd(F.roses, F.lilies);
const BASKETS_PGCD = gcd(K.dates, K.figs);
const BOSS_A = B.roses + B.lilies;
const BOSS_Q = BOSS_A / B.plank;
/** The two stretches of the market's walkway, in the order they are laid: the roses', then the lilies'. */
const STRETCHES = [
  { n: B.roses, name: 'ممرّ الورود' },
  { n: B.lilies, name: 'ممرّ الزنابق' },
];
/** What planks of b leave on each stretch: « … تملأ ممرّ الورود، لكن في ممرّ الزنابق بقيت 6 خانات فارغة ». */
function stretchesWith(b) {
  const filled = STRETCHES.filter((x) => x.n % b === 0);
  const open = STRETCHES.filter((x) => x.n % b !== 0);
  const left = open.map((x) => `في ${x.name} (${x.n} خانة) ${emptyCells(x.n % b)}`).join('، و');
  return filled.length
    ? `الألواح ${b} تملأ ${filled[0].name} (${filled[0].n} خانة)، لكن ${left}`
    : `الألواح ${b}: ${left}`;
}
/** « n = d × k » with k computed (LaTeX). */
const times = (n, d) => `${n} = ${d} \\times ${n / d}`;
/** « n = d × q + r », plain text, for the sentences that are not drawn as formulas. */
const leaves = (n, d) => `${n} = ${d} × ${Math.floor(n / d)} + ${n % d}`;
const pgcd = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;

/** The stone's baskets: which numbers of baskets share ALL the dates and ALL the figs. */
export const BASKETS = {
  answer: K.options.filter((n) => K.dates % n === 0 && K.figs % n === 0),
  pgcd: BASKETS_PGCD,
};

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 🤝, P2 👑, P3 💐, P4 🧩. A module is done once the student holds every key it
 * teaches; `journey.test.js` checks this table against the config. Modules 0 and 7 teach no learning point.
 */
export const MODULE_KEYS = {
  1: ['qawasim-mushtaraka', 'baqat-mutamathila'],
  2: ['qawasim-mushtaraka', 'al-akbar', 'qawasim-al-pgcd'],
  3: ['qawasim-mushtaraka', 'al-akbar'],
  4: ['qawasim-mushtaraka', 'al-akbar', 'baqat-mutamathila'],
  5: ['qawasim-mushtaraka', 'al-akbar', 'baqat-mutamathila', 'qawasim-al-pgcd'],
  6: ['qawasim-mushtaraka', 'al-akbar', 'baqat-mutamathila', 'qawasim-al-pgcd'],
};
/** The module of the lesson's last problem: done when the store of the last bridge is paid. */
const PROBLEM_MODULE = '6';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (m !== PROBLEM_MODULE && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}

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
  { id: 'A', name: 'مرسى التوأمين', R: 8, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة اللوح الحائر', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة الياقوت', R: 9, theme: 'crystal', turn: -0.55 },
  { id: 'D', name: 'جزيرة الصنوبر', R: 9, theme: 'pine', turn: 0.42 },
  { id: 'E', name: 'جزيرة التاج', R: 9, theme: 'crystal', turn: -0.3 },
  { id: 'F', name: 'جزيرة البوّابات', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'G', name: 'جزيرة الباقات', R: 9, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'جزيرة السلال', R: 8.5, theme: 'autumn', turn: 0.3, feature: 'stone' },
  { id: 'I', name: 'سوق الزهور', R: 12, theme: 'snow', turn: 0 },
];
// the two convoys: the bridges of one are built with the planks of its FIRST island (Game.js › « convoy »); no remainder
// is predicted on them — the choice of the plank, made for two gaps at once, is what he predicts there
const TWINS = { convoy: 'twins', predict: false };
const CROWN = { convoy: 'crown', predict: false };
const SEGMENTS = [
  bridge(`g${W1}`, W1, 14, W.moulds, W.plank, TWINS),
  bridge(`g${W2}`, W2, 15, [], W.plank, TWINS),
  bridge(`g${S1}`, S1, 15.5, S.moulds, S.plank, CROWN),
  bridge(`g${S2}`, S2, 16.5, [], S.plank, CROWN),
  bridge(`g${L.gap}`, L.gap, 18, L.moulds, L.plank),
  { id: 'dash', kind: 'rail', len: 300 },
  bridge(`g${K.dates}`, K.dates, 18.5, K.moulds, K.plank),
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

/** A common divisor of x and y. */
const both = (x, y) => (n) => x % n === 0 && y % n === 0;
/**
 * The gate dash: one sentence, three gates, exactly one right — the facts of the two keys already forged (common planks,
 * the longest one). Mental arithmetic: every number inside the tables or a two-digit multiple of a gate.
 */
const DASH_WAVES = [
  { say: 'قاسم مشترك للعددين 38 و 57', gates: [2, 3, 19], test: both(38, 57) },
  { say: `$${pgcd(56, 72)} = \\square$`, gates: [4, 8, 14], test: (n) => n === gcd(56, 72) },
  { say: 'أطول لوح يملأ الهوّتين 64 و 88', gates: [4, 8, 16], test: (n) => n === gcd(64, 88) },
  { say: 'قاسم مشترك للعددين 34 و 85', gates: [2, 5, 17], test: both(34, 85) },
  { say: `$${pgcd(35, 56)} = \\square$`, gates: [5, 7, 8], test: (n) => n === gcd(35, 56) },
  { say: 'قاسم مشترك للعددين 46 و 69', gates: [2, 3, 23], test: both(46, 69) },
  { say: 'أطول لوح يملأ الهوّتين 40 و 100', gates: [10, 20, 40], test: (n) => n === gcd(40, 100) },
  { say: `$${pgcd(62, 93)} = \\square$`, gates: [2, 3, 31], test: (n) => n === gcd(62, 93) },
];

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
export const TABLETS = {
  'qawasim-mushtaraka': {
    icon: '🤝',
    title: 'القواسم المشتركة',
    lines: [
      'القاسم المشترك للعددين $a$ و $b$ عدد يقسم $a$ ويقسم $b$ معًا.',
      'لتعيينها: نكتب قواسم كلّ عدد، ونحتفظ بالقواسم الموجودة في القائمتين.',
    ],
    list: [`القواسم المشتركة للعددين ${W1} و ${W2}: ${listAr(commonDivisors(W1, W2))}`],
    math: [times(W1, 6), times(W2, 6)],
    notes: [`${W.first} يقسم ${W1} ولا يقسم ${W2}: ${leaves(W2, W.first)}، فليس قاسمًا مشتركًا`],
  },
  'al-akbar': {
    icon: '👑',
    title: 'القاسم المشترك الأكبر',
    lines: [
      'أكبر القواسم المشتركة للعددين $a$ و $b$ يسمّى القاسم المشترك الأكبر لهما.',
      'نرمز له بـ $\\mathrm{PGCD}(a ; b)$.',
    ],
    math: [`${pgcd(W1, W2)} = ${TWIN_PGCD}`, `${pgcd(S1, S2)} = ${SECOND_PGCD}`],
    notes: [
      `${SECOND_PGCD} أطول لوح يملأ الهوّتين ${S1} و ${S2}: يبني الجسرين بأقلّ عدد من الألواح، ${planks((S1 + S2) / SECOND_PGCD)}`,
    ],
  },
  'baqat-mutamathila': {
    icon: '💐',
    title: 'الباقات المتماثلة',
    lines: [
      'نوزّع كمّيتين $a$ و $b$ كاملتين في باقات متماثلة: عدد الباقات قاسم مشترك للعددين $a$ و $b$.',
      'أكبر عدد من الباقات هو $\\mathrm{PGCD}(a ; b)$.',
    ],
    math: [
      `${pgcd(F.roses, F.lilies)} = ${FLOWERS_PGCD}`,
      `${times(F.roses, FLOWERS_PGCD)} \\qquad ${times(F.lilies, FLOWERS_PGCD)}`,
    ],
    notes: [
      `${counted(FLOWERS_PGCD, BOUQUETS)} على الأكثر، في كلّ واحدة ${counted(F.roses / FLOWERS_PGCD, ROSES)} و ${counted(F.lilies / FLOWERS_PGCD, LILIES)}`,
    ],
  },
  'qawasim-al-pgcd': {
    icon: '🧩',
    title: 'قواسم القاسم المشترك الأكبر',
    lines: ['القواسم المشتركة للعددين $a$ و $b$ هي بالضبط قواسم العدد $\\mathrm{PGCD}(a ; b)$.'],
    list: [`قواسم ${BASKETS_PGCD}: ${listAr(divisorsOf(BASKETS_PGCD))}`],
    math: [`${pgcd(K.dates, K.figs)} = ${BASKETS_PGCD}`],
    notes: [
      `القواسم المشتركة للعددين ${K.dates} و ${K.figs} هي قواسم ${BASKETS_PGCD}، دون أن نكتب قواسم كلّ عدد منهما`,
    ],
  },
};

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: سوق الزهور',
  subtitle: `سوق الزهور ينتظر جسرًا من ${BOSS_A} خانة. ابحث مع «زيرو» عن الألواح التي تملأ هوّتين معًا، وعن أطولها.`,
  objective: {
    // the two convoys: what the planks of the first island build, said BEFORE he picks (owner, 2026-11-19)
    twins: `الألواح التي تأخذها هنا تبني جسرين: هوّة ${W1} خانة، ثمّ هوّة ${W2} خانة. لا ألواح على الجزيرة التالية: اختر لوحًا يبني الجسرين.`,
    crown: `الألواح التي تأخذها هنا تبني جسرين: ${S1} خانة ثمّ ${S2} خانة. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس ${counted(S.purse, COINS)} فقط.`,
    // the second gap of a convoy, with the planks he carries
    tail: (a, b) => `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها: لا ألواح على هذه الجزيرة.`,
    tailPurse: (a, b) => `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها، بما بقي في الكيس.`,
    board: 'اركب لوح الضوء نحو جزيرة الباقات',
    bossGo: `اذهب إلى المنصّة المضيئة واختر أطول لوح يملأ الممرّين ${B.roses} و ${B.lilies}`,
    bossCross: 'جسر السوق ثابت — اعبر إلى سوق الزهور!',
  },
  say: {
    hello: `أنا زيرو! أمامنا هوّتان: ${W1} خانة ثمّ ${W2} خانة، ولا ألواح إلّا على هذه الجزيرة. اختر لوحًا، ثمّ تعال إلى منصّة الضوء.`,
    first: (b) => `${planks(W1 / b)} طولها ${b} تملأ ${W1} خانة. اعبر: الهوّة ${W2} تنتظر الألواح نفسها.`,
    b234: `لا ألواح على هذه الجزيرة. الهوّة ${W2} خانة: هل تملؤها الألواح التي تحملها؟`,
    twinOk: (b) => `${planks(W2 / b)} طولها ${b} تملأ ${W2} خانة: الألواح ${b} بنت الجسرين معًا.`,
    pairs: `هوّتان جديدتان: ${S1} خانة ثمّ ${S2} خانة. كلّ ألواح الجزيرة تملؤهما، لكنّ لكلّ لوح قطعة من الكيس، وفي الكيس ${counted(S.purse, COINS)}.`,
    secondFirst: (b) =>
      `${planks(S1 / b)} طولها ${b} تملأ ${S1} خانة، وبقيت في الكيس ${counted(S.purse - S1 / b, COINS)}.`,
    d322: `لا ألواح على هذه الجزيرة. الهوّة ${S2} خانة: هل بقي في الكيس ما يبني جسرها؟`,
    secondOk: (b) => `${planks(S2 / b)} طولها ${b} تملأ ${S2} خانة: الجسران ثابتان، وقطع الكيس كلّها في الجسرين.`,
    long: `هوّة من ${L.gap} خانة. أطول لوح يملأ ${W1} و ${W2} معًا ينتظر في القوالب.`,
    longOk: `${planks(L.gap / L.plank)} طولها ${L.plank}: الهوّة ${L.gap} ثابتة.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    dates: `هوّة من ${K.dates} خانة، بعدد تمرات الجزيرة المقبلة. أيّ القوالب يملؤها؟`,
    h: `على هذه الجزيرة ${K.dates} تمرة و ${K.figs} تينة. لوح الجزيرة يسألك عن سلالها.`,
    boss: `ها هو جسر سوق الزهور: ممرّ من ${B.roses} خانة للورود، ثمّ ممرّ من ${B.lilies} خانة للزنابق. نوع واحد من الألواح يملأ كلّ ممرّ تمامًا، أطولُ ما يمكن. في المخزن نوعان: ${B.options[0]} و ${B.options[1]}.`,
    // the store divides the whole walkway (r = 650 mod b); the sentence says WHICH stretch is not filled
    bossFail: (b) => `${stretchesWith(b)}. جرّب النوع الآخر.`,
    bossOk: `${planks(BOSS_Q)} طولها ${B.plank}: ${B.roses / B.plank} في ممرّ الورود و ${B.lilies / B.plank} في ممرّ الزنابق، ولا خانة فارغة. جسر السوق ثابت!`,
    end: 'وصل الجسر إلى سوق الزهور، وكلّ الباقات متماثلة. شكرًا لك!',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    first: (a, b) => `الجسر الأوّل: $${times(a, b)}$`,
    ahead: (a) => `أمامك الهوّة ${a}، بالألواح نفسها`,
    // what a plank of the twins did on the gaps it was laid on (`on`: [{ a, fills }], in the order of the road)
    twin: (b, on) =>
      on.length === 1
        ? `اللوح ${b}: ${on[0].fills ? 'ملأ' : 'لم يملأ'} ${on[0].a}`
        : on[1].fills
          ? `اللوح ${b}: ملأ ${on[0].a} و ${on[1].a}`
          : `اللوح ${b}: ملأ ${on[0].a}، ولم يملأ ${on[1].a}`,
    paid: (q, left) => `دفعتَ ${counted(q, COINS)}، وبقيت في الكيس ${counted(left, COINS)}`,
    // the planks of the crown: what each needs for the two bridges
    crown: (b, need) => `اللوح ${b}: الجسران يحتاجان ${planks(need)}`,
  },
  quiz: {
    baskets: {
      prompt: `على الجزيرة ${K.dates} تمرة و ${K.figs} تينة، توضع كلّها في سلال متماثلة: في كلّ سلّة العدد نفسه من التمر والعدد نفسه من التين، ولا يبقى شيء. أيّ هذه الأعداد يمكن أن يكون عدد السلال؟ اختر كلّ ما يصلح.`,
      options: K.options.map((n) => ({ v: n, label: String(n) })),
      answer: BASKETS.answer,
      multi: true,
      wrong: Object.fromEntries(
        K.options
          .filter((n) => !BASKETS.answer.includes(n))
          .map((n) => {
            const bad = K.dates % n ? K.dates : K.figs;
            const left = counted(bad % n, bad === K.dates ? DATES : FIGS);
            return [n, `${leaves(bad, n)}: إذا كان عدد السلال ${n} تبقى ${left} دون سلّة.`];
          }),
      ),
      wrongGeneric: `ليس تمامًا. عدد السلال يجب أن يوزّع ${K.dates} و ${K.figs} كليهما دون أن يبقى شيء.`,
    },
  },
  boss: {
    title: 'مخزن جسر السوق',
    mission: `المهمّة: ممشى السوق ممرّان متتاليان، خانة لكلّ زهرة: ${B.roses} خانة للورود ثمّ ${B.lilies} خانة للزنابق (${BOSS_A} خانة). نوع واحد من الألواح يجب أن يملأ كلّ ممرّ وحده تمامًا، وأطولُ ما يمكن. اختر الألواح، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `ما أطول لوح يملأ الممرّين ${B.roses} و ${B.lilies} كليهما؟ ابحث عنه في كرّاسك قبل أن تختار.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b} على الممشى كلّه: كم لوحًا يدخل في ${BOSS_A} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planks(q)} طولها ${b}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planks(q)} طولها ${b} تساوي ${b * q} خانة: أطول من الممشى (${BOSS_A})!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والممشى ${BOSS_A} خانة.`,
      big: (b, r) => `${emptyCells(r)}: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ سوق الزهور، وصنعتَ مفاتيح المعرفة الأربعة بنفسك.' },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  /** The convoy « crown » pays a coin per plank: only the longest plank of both gaps builds its two bridges. */
  convoys: { crown: { purse: S.purse } },

  /**
   * The instruction of the moment on the two convoys: the gaps the planks of the first island build, before he picks;
   * on the second island, the plank he carries. null: the world's own (a bridge built, « go back » once refused).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.complete || !seg.convoy) return null;
    if (!game.convoyTail(seg)) return seg.convoy === 'crown' ? o.crown : o.twins;
    const b = game.state.held;
    // nothing in hand on an island without planks (a page opened again there): the world's « go back »
    if (game.flags.convoyStuck || b == null) return o.convoyBack(game.isl[game.convoyOf(seg)[0].index].name);
    return game.purseOf(seg) ? o.tailPurse(seg.a, b) : o.tail(seg.a, b);
  },
  /** The card on the right, on the islands of the two convoys; elsewhere the world's (the gap just crossed). */
  recall(game, k) {
    const R = game.T.recall;
    const tried = (gaps) => {
      const order = [];
      for (const x of game.log) if (gaps.includes(x.a) && !x.mirror && !order.includes(x.b)) order.push(x.b);
      return order.slice(-3);
    };
    if (k === 1 || k === 3) {
      const first = game.segs[k - 1];
      const b = first.builtWith ?? first.holdsWith;
      const purse = game.purseOf(first);
      return [R.first(first.a, b), purse ? R.paid(first.a / b, purse.left) : R.ahead(game.segs[k].a)];
    }
    if (k === 2)
      return tried(W.gaps).map((b) =>
        R.twin(
          b,
          W.gaps.filter((a) => game.log.some((x) => x.a === a && x.b === b)).map((a) => ({ a, fills: a % b === 0 })),
        ),
      );
    if (k === 4) return tried(S.gaps).map((b) => R.crown(b, (S1 + S2) / b));
    return null;
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b234, 8);
    if (k === 2) game.openForge('qawasim-mushtaraka');
    if (k === 3) game.say(say.d322, 8);
    if (k === 4) game.openForge('al-akbar');
    if (k === 5) game.say(say.f, 8);
    if (k === 6) game.openForge('baqat-mutamathila');
    if (k === 7) {
      game.say(say.h, 6);
      game.wait(1.5).then(() => !game.dead && game.state.phase === 'play' && game.openStone());
    }
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    'qawasim-mushtaraka': (game) => {
      completeModules(game, 'qawasim-mushtaraka');
      game.say(game.T.say.pairs, 8);
    },
    'al-akbar': (game) => {
      completeModules(game, 'al-akbar');
      game.say(game.T.say.long, 8);
    },
    'baqat-mutamathila': (game) => {
      completeModules(game, 'baqat-mutamathila');
      game.say(game.T.say.dates, 8);
    },
    'qawasim-al-pgcd': (game) => {
      game.flags.key4 = true;
      completeModules(game, 'qawasim-al-pgcd');
      game.refreshObjective();
      game.say(game.T.say.boss, 9);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror (the last one waits at its stone). */
  pendingForge(game) {
    if (game.state.stage === 2 && missing(game, 'qawasim-mushtaraka')) return 'qawasim-mushtaraka';
    if (game.state.stage === 4 && missing(game, 'al-akbar')) return 'al-akbar';
    if (game.state.stage === 6 && missing(game, 'baqat-mutamathila')) return 'baqat-mutamathila';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (seg.id === `g${W1}`) game.say(say.first(b), 7);
    else if (seg.id === `g${W2}`) game.say(say.twinOk(b), 9);
    else if (seg.id === `g${S1}`) game.say(say.secondFirst(b), 8);
    else if (seg.id === `g${S2}`) game.say(say.secondOk(b), 9);
    else if (seg.id === `g${L.gap}`) game.say(say.longOk, 7);
    else return false;
    return true;
  },
  /** The stone of the last island: the baskets' question first, then the mirror where the last key is forged. */
  onStone: (game) => (game.flags.baskets ? { forge: 'qawasim-al-pgcd' } : { quiz: 'baskets' }),
  onQuiz(game, id) {
    if (id !== 'baskets') return;
    game.flags.baskets = true;
    game.save();
    game.openForge('qawasim-al-pgcd');
  },
  // the last bridge leads to the lesson's problem (the flower market: the most bouquets and what each one holds)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
