/**
 * THE STORY of lesson « تعيين القاسم المشترك الأكبر لعددين طبيعيين » in the world « أرخبيل القواسم » — what the world's
 * mechanic plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens
 * on the way. The lesson before it says WHAT the PGCD is (the longest plank that fills both gaps); here he learns to FIND
 * it. The road is the owner's redesign of 2026-11-19 (`docs/reports/BATCH_2_DESIGN.md` §7, « Lesson 5 — the road as it
 * is built »): every key is MET on the islands, in FOUR CONVOYS with a purse (GAME_WORLD.md §2ter-1) — no plank is
 * offered anywhere: each head island has a WORKSHOP where he makes the plank he wants (he types its length).
 *
 *   A → B → C   convoy « lists »: 32 then 44, a purse of 19 coins. Only planks of 4 build both with 19 coins (8 + 11):
 *               8 or 16 fill 32 and not 44, 2 fills both but costs 16 + 22, 11 fills 44 only. The workshop's bench
 *               holds the two lists (`inquiries.js › LISTS_BENCH`, the `lists` kind). C: the mirror of key 📋.
 *   C → D → E   convoy « same »: 27 then 27, 2 coins — one plank of 27 for each gap.
 *   E → F → G   convoy « full »: 27, then a gap of 0 cells whose bridge stands from the start; 1 coin. G: the mirror
 *               of key ⚡ (its evidence: the two convoys « same » and « full »).
 *   G → H → I   convoy « nest »: 19 then 76, 5 coins — the shorter gap's own length builds both (1 + 4). I: the mirror
 *               of key 🎯.
 *   I → J       the gate dash (its waves use the three keys, all forged at I).
 *   J → K       the last bridge, the lesson's problem: the harbour's two piers laid end to end, 154 cells then 238, ONE
 *               kind of plank that fills each pier exactly, the longest. The store offers 22 (it fills the first pier
 *               alone: 238 = 22 × 10 + 18) and 14 = PGCD(154 ; 238): he must find the longest plank of BOTH piers.
 * Every number is in `NUMBERS` (math.js, ONE place); the sentences and the tablets are written from it. The hooks
 * receive the game and use its commands; they hold no mechanic.
 */
import {
  COINS,
  NUMBERS,
  coinsLeft,
  commonDivisors,
  counted,
  divisorsOf,
  emptyCells,
  gcd,
  listAr,
  pgcdTex as pgcd,
  planksFill,
  planksOf,
  roadOf,
} from './math';
import { LISTS_BENCH } from './inquiries';

/** What a plank b did on the road of a convoy, as the world plays it (the kit's `roadOf`, re-exported by `math.js`). */
export { NUMBERS, roadOf };
const { lists: LS, same: SM, full: FL, nest: NS, boss: B } = NUMBERS;
const [L1, L2] = LS.gaps;
const [S1, S2] = SM.gaps;
const [F1, F2] = FL.gaps;
const [N1, N2] = NS.gaps;
const [PIER1, PIER2] = B.piers;
const BOSS_A = PIER1 + PIER2;
const BOSS_Q = BOSS_A / B.plank;
const LISTS_PGCD = gcd(L1, L2);

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 📋, P2 ⚡, P3 🎯. `journey.test.js` checks this table against the config.
 * Module 0 and 7 teach no learning point.
 */
export const MODULE_KEYS = {
  1: ['hasr-wa-taqatu'],
  2: ['nataij-mubashira', 'b-yaqsim-a'],
  3: ['hasr-wa-taqatu', 'b-yaqsim-a'],
  4: ['hasr-wa-taqatu'],
  5: ['hasr-wa-taqatu', 'nataij-mubashira', 'b-yaqsim-a'],
  6: ['hasr-wa-taqatu'],
};
/** The modules that are problems: 4 is done when the store of the last bridge is paid; 5 and 6 by the story's end. */
const PROBLEM_MODULES = ['4', '5', '6'];
const PROBLEM_MODULE = '4';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (!PROBLEM_MODULES.includes(m) && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}

const missing = (game, key) => !game.state.keys.includes(key);
const bridge = (id, a, len, holdsWith, extra = {}) => ({
  id,
  kind: 'bridge',
  a,
  len,
  moulds: [],
  predict: false,
  holdsWith,
  ...extra,
});
/** The workshop of a head island: it works from the start, he TYPES the plank's length (1 … the longest gap). */
const workshop = (max, bench) => ({ min: 1, max, open: true, typed: true, ...(bench ? { bench } : {}) });

const ISLANDS = [
  { id: 'A', name: 'مرسى النجّار', R: 9, theme: 'meadow', turn: 0, feature: 'anvil' },
  { id: 'B', name: 'جزيرة الصخور الملساء', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة النوارس', R: 9, theme: 'crystal', turn: -0.5, feature: 'anvil' },
  { id: 'D', name: 'جزيرة الأصداف', R: 8, theme: 'crystal', turn: 0.4 },
  { id: 'E', name: 'جزيرة المجاديف', R: 9, theme: 'pine', turn: -0.35, feature: 'anvil' },
  { id: 'F', name: 'جزيرة الشباك', R: 8, theme: 'pine', turn: 0.3 },
  { id: 'G', name: 'جزيرة الصواري', R: 9, theme: 'autumn', turn: -0.42, feature: 'anvil' },
  { id: 'H', name: 'جزيرة المرساة', R: 8, theme: 'autumn', turn: 0.35 },
  { id: 'I', name: 'جزيرة الحبال', R: 10.5, theme: 'stone', turn: -0.2 },
  { id: 'J', name: 'جزيرة الفوانيس', R: 9, theme: 'stone', turn: 0.25 },
  { id: 'K', name: 'مرفأ الرصيفين', R: 12, theme: 'snow', turn: 0 },
];
/** The convoys, in the order of the road: what the plank of the head island builds (the instruction says it). */
const ROADS = {
  lists: `هوّة ${L1} خانة ثمّ هوّة ${L2} خانة`,
  same: `هوّتين من ${S1} خانة، واحدة بعد الأخرى`,
  full: `هوّة ${F1} خانة، وبعدها هوّة من ${F2} خانة جسرها قائم`,
  nest: `هوّة ${N1} خانة ثمّ هوّة ${N2} خانة`,
};
const CONVOYS = {
  lists: { purse: LS.purse },
  same: { purse: SM.purse },
  full: { purse: FL.purse },
  nest: { purse: NS.purse },
};
const SEGMENTS = [
  bridge(`g${L1}`, L1, 13, LS.plank, { convoy: 'lists', workshop: workshop(Math.max(L1, L2), LISTS_BENCH) }),
  bridge(`g${L2}`, L2, 15, LS.plank, { convoy: 'lists' }),
  bridge(`g${S1}a`, S1, 12.5, SM.plank, { convoy: 'same', workshop: workshop(Math.max(S1, S2)) }),
  bridge(`g${S2}b`, S2, 12.5, SM.plank, { convoy: 'same' }),
  bridge(`g${F1}c`, F1, 12.5, FL.plank, { convoy: 'full', workshop: workshop(F1) }),
  // a gap of 0 cells: nothing is open, its bridge stands from the start (Game.js › `standing`)
  bridge(`g${F2}`, F2, 7, FL.plank, { convoy: 'full', standing: true }),
  bridge(`g${N1}`, N1, 12, NS.plank, { convoy: 'nest', workshop: workshop(Math.max(N1, N2)) }),
  bridge(`g${N2}`, N2, 17, NS.plank, { convoy: 'nest' }),
  { id: 'dash', kind: 'rail', len: 300 },
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
const both = (x, y) => (n) => n >= 1 && x % n === 0 && y % n === 0;
const pgcdWave = (x, y, gates) => ({ say: `$${pgcd(x, y)} = \\square$`, gates, test: (n) => n === gcd(x, y) });
/**
 * The gate dash (after island I: the three keys are forged): one sentence, three gates, exactly one right. Mental
 * arithmetic — every number at most 100 — and no pair of the exercise bank (`story.test.js`).
 */
const DASH_WAVES = [
  pgcdWave(36, 36, [1, 6, 36]),
  pgcdWave(48, 0, [0, 1, 48]),
  pgcdWave(18, 30, [3, 6, 18]),
  pgcdWave(75, 15, [5, 15, 75]),
  { say: 'قاسم مشترك للعددين 26 و 39', gates: [2, 3, 13], test: both(26, 39) },
  pgcdWave(20, 8, [2, 4, 8]),
  pgcdWave(1, 53, [0, 1, 53]),
  pgcdWave(57, 19, [3, 19, 57]),
];

/**
 * An equality inside a plain Arabic sentence, isolated left to right (LRI … PDI): without it the bidi algorithm draws
 * « 8 + 11 = 19 » as « 19 = 11 + 8 » (defects.md B7; seen on the tablets 2026-11-19).
 */
const ltr = (s) => `\u2066${s}\u2069`;

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
export const TABLETS = {
  'hasr-wa-taqatu': {
    icon: '📋',
    title: 'احصر القواسم ثم قاطعها',
    lines: ['لتعيين $\\mathrm{PGCD}(a ; b)$: نكتب قواسم $a$ وقواسم $b$، ثمّ القواسم المشتركة، ونأخذ أكبرها.'],
    // the two lists side by side, then the common ones under their PGCD: three rows on the board's name card at
    // 1366 × 768 (2026-11-19: a third list row and the purse's note pushed the tablet out of its card when a reader is
    // picked). The coins of the convoy stay in the world (the card « من الجزيرة السابقة », Zero's sentences).
    list: [`قواسم ${L1}: ${listAr(divisorsOf(L1))}`, `قواسم ${L2}: ${listAr(divisorsOf(L2))}`],
    math: [`${pgcd(L1, L2)} = ${LISTS_PGCD}`],
    notes: [`القواسم المشتركة: ${listAr(commonDivisors(L1, L2))}، وأكبرها ${LISTS_PGCD}`],
  },
  'nataij-mubashira': {
    icon: '⚡',
    title: 'نتائج مباشرة',
    lines: [
      'لكلّ عدد طبيعي غير معدوم $a$: $\\mathrm{PGCD}(a ; a) = a$ و $\\mathrm{PGCD}(a ; 0) = a$ و $\\mathrm{PGCD}(a ; 1) = 1$.',
      'وترتيب العددين لا يغيّر شيئًا: $\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; a)$.',
    ],
    math: [`${pgcd(S1, S2)} = ${gcd(S1, S2)}`, `${pgcd(F1, F2)} = ${gcd(F1, F2)}`],
    notes: [
      `كلّ لوح يملأ هوّة من 0 خانة: ${ltr(`0 = ${F1} × 0`)}`,
      `${planksFill(S1 / SM.plank, SM.plank)} كلّ هوّة من ${S1} خانة`,
    ],
  },
  'b-yaqsim-a': {
    icon: '🎯',
    title: 'عندما يقسم الأصغر الأكبر',
    lines: [
      'إذا كان $b$ قاسمًا للعدد $a$ فإنّ $\\mathrm{PGCD}(a ; b) = b$.',
      'كلّ قاسم للعدد $b$ يقسم $a$ أيضًا، وأكبر قواسم $b$ هو $b$ نفسه.',
    ],
    math: [`${N2} = ${N1} \\times ${N2 / N1}`, `${pgcd(N2, N1)} = ${gcd(N2, N1)}`],
    notes: [
      'قبل حصر القواسم، نتحقّق: هل يقسم العدد الأصغر العدد الأكبر؟',
      `الألواح ${NS.plank} بنت الجسرين بـ ${counted(NS.purse, COINS)}: ${ltr(`${N1 / NS.plank} + ${N2 / NS.plank} = ${NS.purse}`)}`,
    ],
  },
};

/** Planks as the object of a verb (« يحتاجان لوحين », « 6 ألواح », « 12 لوحًا »): the card of the twins. */
const PLANKS_NEEDED = ['لوحًا واحدًا', 'لوحين', 'ألواح', 'لوحًا'];

/** The two piers of the last bridge, in the order they are laid. */
const PIERS = [
  { n: PIER1, name: 'الرصيف الأوّل' },
  { n: PIER2, name: 'الرصيف الثاني' },
];
/** What planks of b leave on each pier: « الألواح 22 تملأ الرصيف الأوّل (154 خانة)، لكن في الرصيف الثاني … ». */
function piersWith(b) {
  const filled = PIERS.filter((x) => x.n % b === 0);
  const open = PIERS.filter((x) => x.n % b !== 0);
  const left = open.map((x) => `في ${x.name} (${x.n} خانة) ${emptyCells(x.n % b)}`).join('، و');
  return filled.length
    ? `الألواح ${b} تملأ ${filled[0].name} (${filled[0].n} خانة)، لكن ${left}`
    : `الألواح ${b}: ${left}`;
}

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: مرفأ الرصيفين',
  subtitle: `رصيفا المرفأ، ${PIER1} خانة ثمّ ${PIER2} خانة، ينتظران ألواحًا بطول واحد. اصنع مع «زيرو» ألواحك في ورشات الجزر.`,
  objective: {
    // the head island of a convoy: everything he needs — the gaps ahead, no planks on the next island, the workshop,
    // the price of a plank and the purse (owner, 2026-11-19: the instruction stays and says it all)
    make: (convoy) =>
      `اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني ${ROADS[convoy]}، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس ${counted(CONVOYS[convoy].purse, COINS)}.`,
    // …once he holds planks there
    carry: (convoy, b, left) =>
      `معك ألواح طولها ${b}: ابنِ بها ${ROADS[convoy]} عند منصّة الضوء. لكلّ لوح قطعة، وفي الكيس ${counted(left, COINS)}. لوح بطول آخر؟ اصنعه في الورشة.`,
    // the later gap of a convoy, with the planks he carries
    tail: (a, b, left) =>
      `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها: لا ألواح على هذه الجزيرة، ${coinsLeft(left)}.`,
    // the gap of 0 cells
    standing: `الهوّة التالية ${F2} خانة: لا خانة فيها تُملأ، فجسرها قائم دون أيّ لوح. اعبر إلى الجزيرة التالية.`,
    convoyBack: (name) => `لا ألواح على هذه الجزيرة. ارجع إلى «${name}» واصنع في ورشتها لوحًا بطول آخر.`,
    board: `اركب لوح الضوء نحو ${ISLANDS[9].name}`,
    bossGo: `اذهب إلى المنصّة المضيئة واختر أطول لوح يملأ الرصيفين ${PIER1} و ${PIER2}`,
    bossCross: 'جسر المرفأ ثابت — اعبر إلى مرفأ الرصيفين!',
    end: 'وصلتَ المرفأ',
  },
  say: {
    hello: `أنا زيرو! لا ألواح على هذه الجزيرة، لكن فيها ورشة: اصنع لوحًا يبني الهوّتين ${L1} و ${L2}، ثمّ تعال إلى منصّة الضوء.`,
    b44: `لا ألواح على هذه الجزيرة. الهوّة ${L2} خانة: هل تملؤها الألواح التي تحملها، بما بقي في الكيس؟`,
    // a head bridge held: how many planks, the coins left, what waits on the next island
    headOk: (a, b, left, next) => `${planksFill(a / b, b)} ${a} خانة، ${coinsLeft(left)}. ${next}`,
    next: {
      lists: `اعبر: الهوّة ${L2} تنتظر الألواح نفسها.`,
      same: `اعبر: الهوّة ${S2} التالية تنتظر الألواح نفسها.`,
      full: `اعبر: الهوّة التالية ${F2} خانة، وجسرها قائم.`,
      nest: `اعبر: الهوّة ${N2} تنتظر الألواح نفسها.`,
    },
    // a tail bridge held: both bridges stand
    tailOk: (a, b, left) =>
      `${planksFill(a / b, b)} ${a} خانة: الجسران ثابتان، ${left ? coinsLeft(left) : 'وقطع الكيس كلّها في الجسرين'}.`,
    same: `هوّتان جديدتان، كلّ واحدة ${S1} خانة، ولا ألواح على الجزيرة التالية. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(SM.purse, COINS)}.`,
    d27: `لا ألواح على هذه الجزيرة. الهوّة ${S2} خانة: هل يبنيها ما بقي في الكيس بالألواح التي تحملها؟`,
    e27: `هوّة ${F1} خانة، وبعدها هوّة من ${F2} خانة جسرها قائم. اصنع لوحك في الورشة: في الكيس ${counted(FL.purse, COINS)}.`,
    f0: `الهوّة هنا ${F2} خانة: لا شيء فيها يُملأ، فجسرها قائم. اعبر!`,
    nest: `هوّتان جديدتان: ${N1} خانة ثمّ ${N2} خانة، ولا ألواح على الجزيرة التالية. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(NS.purse, COINS)}.`,
    h76: `لا ألواح على هذه الجزيرة. الهوّة ${N2} خانة: هل تبنيها الألواح التي تحملها، بما بقي في الكيس؟`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    boss: `ها هو جسر المرفأ: رصيف من ${PIER1} خانة، ثمّ رصيف من ${PIER2} خانة. نوع واحد من الألواح يملأ كلّ رصيف تمامًا، أطولُ ما يمكن. في المخزن نوعان: ${B.options[0]} و ${B.options[1]}.`,
    // the store divides the whole bridge; the sentence says WHICH pier is not filled
    bossFail: (b) => `${piersWith(b)}. جرّب النوع الآخر.`,
    bossOk: `${planksOf(BOSS_Q, B.plank)}: ${PIER1 / B.plank} في الرصيف الأوّل و ${PIER2 / B.plank} في الرصيف الثاني، ولا خانة فارغة. جسر المرفأ ثابت!`,
    end: 'وصل الجسر إلى المرفأ، والرصيفان من ألواح بطول واحد. شكرًا لك!',
    // the world's convoy sentences, said for a workshop (he makes planks; none lie on a pedestal)
    convoyBack: (name, r) =>
      `${emptyCells(r)}، فانهار الجسر الثاني. لا ألواح هنا: ارجع إلى «${name}» واصنع في ورشتها لوحًا بطول آخر.`,
    convoyReset: (b) => `صنعتَ ألواحًا طولها ${b}: الجسور التي بنيتها بألواح أخرى انهارت، وعادت قطعها إلى الكيس.`,
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    first: (a, b) => `الجسر الأوّل: $${a} = ${b} \\times ${a / b}$`,
    paid: (q, left) => `دفعتَ ${counted(q, COINS)}، ${coinsLeft(left)}`,
    // what a plank did on the road of a convoy (`on`: roadOf)
    plank: (b, on) =>
      on.every((x) => x.did === 'fills')
        ? `اللوح ${b}: ملأ ${on.map((x) => x.a).join(' و ')}`
        : `اللوح ${b}: ${on
            .map((x) =>
              x.did === 'fills' ? `ملأ ${x.a}` : x.did === 'open' ? `لم يملأ ${x.a}` : `لم تكفِ القطع للهوّة ${x.a}`,
            )
            .join('، و')}`,
    // the twins of the same length: what each plank needs for both
    need: (b, a) =>
      a % b ? `اللوح ${b}: لم يملأ ${a}` : `اللوح ${b}: الجسران يحتاجان ${counted(2 * (a / b), PLANKS_NEEDED)}`,
    // the two convoys of key ⚡, read from the bridges that stand
    same: (a, b) => `الهوّتان ${a} و ${a}: $${a} = ${b} \\times ${a / b}$ لكلّ واحدة`,
    full: (a, b) => `الهوّتان ${a} و 0: $${a} = ${b} \\times ${a / b}$ و $0 = ${b} \\times 0$`,
  },
  boss: {
    title: 'مخزن المرفأ',
    mission: `المهمّة: رصيفا المرفأ متتاليان، ${PIER1} خانة ثمّ ${PIER2} خانة (${BOSS_A} خانة). نوع واحد من الألواح يجب أن يملأ كلّ رصيف وحده تمامًا، وأطولُ ما يمكن. اختر الألواح، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `ما أطول لوح يملأ الرصيفين ${PIER1} و ${PIER2} كليهما؟ ابحث عنه في كرّاسك قبل أن تختار.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${B.price} دج`,
    divide: (b) => `الألواح ${b} على الجسر كلّه: كم لوحًا يدخل في ${BOSS_A} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planksOf(q, b)}. ثمن اللوح الواحد ${B.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planksOf(q, b)}: $${b} \\times ${q} = ${b * q}$ خانة، أطول من الجسر (${BOSS_A} خانة)!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والجسر ${BOSS_A} خانة.`,
      big: (b, r) => `${emptyCells(r)}: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ مرفأ الرصيفين، وصنعتَ مفاتيح المعرفة الثلاثة بنفسك.' },
};

/** The planks he fired on the gaps of a convoy, in the order he first tried them (the last three). */
function triedOn(game, gaps) {
  const order = [];
  for (const x of game.log) if (gaps.includes(x.a) && !x.mirror && !order.includes(x.b)) order.push(x.b);
  return order.slice(-3);
}
const laidOn = (game, b) => (a) => game.log.some((x) => x.a === a && x.b === b && !x.mirror);

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  /** Each convoy pays a coin per plank, whatever its length. */
  convoys: CONVOYS,

  /**
   * The instruction of the moment on the four convoys — the WHOLE instruction (it stays on screen): on a head island,
   * the gaps its plank builds, that the next island has none, the workshop, the price and the purse; on a later island,
   * the plank he carries and the coins left; on the gap of 0 cells, that its bridge stands. null: the world's own (a
   * bridge built, « go back » once refused).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.standing) return o.standing;
    if (seg.complete || !seg.convoy) return null;
    const left = game.purseOf(seg)?.left ?? 0;
    const b = game.state.held;
    if (!game.convoyTail(seg)) return b == null ? o.make(seg.convoy) : o.carry(seg.convoy, b, left);
    // nothing in hand on an island without planks (a page opened again there), or refused: back to the workshop
    if (game.flags.convoyStuck || b == null) return o.convoyBack(game.isl[game.convoyOf(seg)[0].index].name);
    return o.tail(seg.a, b, left);
  },
  /** The card on the right: what the island before showed. Elsewhere the world's (the gap just crossed). */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.convoy) return null;
    const group = game.convoyOf(before);
    const { purse } = CONVOYS[before.convoy];
    // the first bridge of a convoy: its equality and the coins it cost
    if (group[0] === before) {
      const b = before.builtWith ?? before.holdsWith;
      return [R.first(before.a, b), R.paid(before.a / b, game.purseOf(before).left)];
    }
    // the end of a convoy: what each plank he tried did there (the last three)
    if (before.convoy === 'full') {
      const [same] = game.segs.filter((s) => s.convoy === 'same');
      const bs = same.builtWith ?? same.holdsWith;
      const bf = group[0].builtWith ?? group[0].holdsWith;
      return [R.same(same.a, bs), R.full(group[0].a, bf)];
    }
    const gaps = group.map((s) => s.a);
    if (before.convoy === 'same') return triedOn(game, gaps).map((b) => R.need(b, gaps[0]));
    return triedOn(game, gaps).map((b) => R.plank(b, roadOf(gaps, purse, b, laidOn(game, b))));
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b44, 8);
    if (k === 2 && missing(game, 'hasr-wa-taqatu')) game.openForge('hasr-wa-taqatu');
    if (k === 3) game.say(say.d27, 8);
    if (k === 4) game.say(say.e27, 8);
    if (k === 5) game.say(say.f0, 6);
    if (k === 6 && missing(game, 'nataij-mubashira')) game.openForge('nataij-mubashira');
    if (k === 7) game.say(say.h76, 8);
    if (k === 8 && missing(game, 'b-yaqsim-a')) game.openForge('b-yaqsim-a');
    if (k === 9) game.say(say.boss, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    'hasr-wa-taqatu': (game) => {
      completeModules(game, 'hasr-wa-taqatu');
      game.say(game.T.say.same, 9);
    },
    'nataij-mubashira': (game) => {
      completeModules(game, 'nataij-mubashira');
      game.say(game.T.say.nest, 9);
    },
    'b-yaqsim-a': (game) => {
      game.flags.key4 = true;
      completeModules(game, 'b-yaqsim-a');
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    if (game.state.stage === 2 && missing(game, 'hasr-wa-taqatu')) return 'hasr-wa-taqatu';
    if (game.state.stage === 6 && missing(game, 'nataij-mubashira')) return 'nataij-mubashira';
    if (game.state.stage === 8 && missing(game, 'b-yaqsim-a')) return 'b-yaqsim-a';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (!seg.convoy || seg.standing) return false;
    const left = game.purseOf(seg)?.left ?? 0;
    if (game.convoyTail(seg)) game.say(say.tailOk(seg.a, b, left), 9);
    else game.say(say.headOk(seg.a, b, left, say.next[seg.convoy]), 8);
    return true;
  },
  // the last bridge is the lesson's problem (module 4: one length of plank for the two piers)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
