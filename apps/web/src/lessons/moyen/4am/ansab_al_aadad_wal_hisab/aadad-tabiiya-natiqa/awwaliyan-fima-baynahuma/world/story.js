/**
 * THE STORY of lesson « العددان الأوّليّان فيما بينهما » in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what happens on the way.
 * The lessons before it say what the PGCD is (the longest plank that fills both gaps) and how Euclid's divisions find
 * it; here he meets two gaps whose ONLY common plank is 1, proves it, and learns that one plank other than 1 proves
 * the opposite. The road is the owner's redesign of 2026-11-19 (`docs/reports/BATCH_2_DESIGN.md` §7, « Lesson 7 »): the
 * need for each rule comes from a convoy he carries across the islands (GAME_WORLD.md §2ter-1).
 *
 *   A → B → C   convoy « only »: 25 then 27, planks 3, 5, 9 and 1 on A, 52 coins — only the plank 1 builds both.
 *   C → D → E   convoy « common »: 39 then 52, planks 2, 3, 13 and 1 on C, 40 coins — 13 builds both (3 + 4), 1 costs
 *               91. E: the mirror of key 🤝 `awwaliyan`.
 *   E → F → G   convoy « proof »: 35 then 26, a workshop whose bench is the division notebook (its last remainder that is
 *               not 0 is 1), 61 coins = 35 + 26 planks of 1. G: the mirror of key ✅ `ithbat-awwaliyan` (its experiment
 *               stays in the mirror: `ladder` / `divide` ending on 1, then the sentence of the proof — the forges' agent).
 *   G → H → I   convoy « witness »: 645 then 410, the planks of the divisibility rules on G (2, 3, 5, 9, 10), no purse —
 *               ONE of them, 5, builds both.
 *   I → J → K   convoy « hidden »: 85 then 119, the same five planks on I — none builds both — and a workshop that opens
 *               once the first bridge has fallen twice (its bench: the division notebook, down to 17); 50 coins: 5 + 7
 *               planks of 17 cost 12, the plank 1 would cost 204. K: the mirror of key ❌ `shahid-wahid`.
 *   K → L       the gate dash (its waves use the three keys, all forged at K).
 *   L → M       the last bridge, the lesson's problem: the harbour's two lanes laid end to end, 105 cells then 74, ONE
 *               kind of plank that fills each lane exactly, the longest. The store offers 35 (it fills the first lane
 *               alone: 74 = 35 × 2 + 4) and 1. 105 and 74 have no common plank but 1 — and no small witness either (2,
 *               3, 5, 7 each fill one lane at most): he must DECIDE that they are coprime, by a proof (Euclid ends on 1).
 * Every number is in `NUMBERS` (math.js, ONE place); the sentences and the tablets are written from it. The hooks
 * receive the game and use its commands; they hold no mechanic.
 */
import {
  COINS,
  NUMBERS,
  andAr,
  coinsLeft,
  counted,
  divTex,
  emptyCells,
  euclid,
  gcd,
  ltr,
  pgcdTex as pgcd,
  planksFill,
  planksOf,
  roadOf,
} from './math';
import { HIDDEN_BENCH, PROOF_BENCH } from './inquiries';

/** What a plank b did on the road of a convoy, as the world plays it (the kit's `roadOf`, re-exported by `math.js`). */
export { NUMBERS, roadOf };
const { only: ON, common: CM, proof: PR, witness: WT, hidden: HD, boss: B } = NUMBERS;
const [LANE1, LANE2] = B.lanes;
const BOSS_A = LANE1 + LANE2;
const BOSS_Q = BOSS_A / B.plank;
const PROOF_STEPS = euclid(...PR.gaps);
/** What the planks of 17 cost on the convoy « hidden » (a coin per plank). */
const HD_COST = HD.gaps.reduce((n, a) => n + a / HD.plank, 0);

/** The three keys, in the order the story gives them. */
const K = { only: 'awwaliyan', proof: 'ithbat-awwaliyan', witness: 'shahid-wahid' };

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 🤝, P2 ✅, P3 ❌. `journey.test.js` checks this table against the config. Modules
 * 0 and 7 teach no learning point.
 */
export const MODULE_KEYS = {
  1: [K.only, K.witness],
  2: [K.only, K.proof],
  3: [K.proof, K.witness],
  4: [K.only, K.proof, K.witness],
  5: [K.only, K.proof, K.witness],
  6: [K.proof, K.witness],
};
/**
 * The modules that are problems: 4 (decide whether two numbers are coprime, and prove it — the last bridge's own ask)
 * is done when the store is paid; 5 and 6 by the story's end (`kit/storyEnd.js` marks every module).
 */
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
/**
 * The workshop of a head island: he TYPES the plank's length (1 … the longest gap); `open` — it works from the start,
 * else once the first bridge has fallen twice (`flags.anvil`).
 */
const workshop = (max, bench, open) => ({ min: 1, max, open, typed: true, bench });

const ISLANDS = [
  { id: 'A', name: 'مرسى النوارس', R: 9, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة الإسفنج', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة الحصى', R: 9, theme: 'crystal', turn: -0.4 },
  { id: 'D', name: 'جزيرة العنبر', R: 8, theme: 'crystal', turn: 0.35 },
  { id: 'E', name: 'جزيرة السنديان', R: 9.5, theme: 'pine', turn: -0.3, feature: 'anvil' },
  { id: 'F', name: 'جزيرة الكرز', R: 8, theme: 'pine', turn: 0.4 },
  { id: 'G', name: 'جزيرة الصخور', R: 9.5, theme: 'autumn', turn: -0.35 },
  { id: 'H', name: 'جزيرة الزعتر', R: 8, theme: 'autumn', turn: 0.3 },
  { id: 'I', name: 'جزيرة الدردار', R: 10.5, theme: 'stone', turn: -0.25, feature: 'anvil' },
  { id: 'J', name: 'جزيرة القطا', R: 8, theme: 'stone', turn: 0.4 },
  { id: 'K', name: 'جزيرة الريحان', R: 10.5, theme: 'snow', turn: 0.2 },
  { id: 'L', name: 'جزيرة الخزامى', R: 9, theme: 'snow', turn: -0.25 },
  { id: 'M', name: 'مرفأ الجسرين', R: 12, theme: 'snow', turn: 0 },
];

/**
 * The five convoys, in the order of the road: what the head island holds (`moulds` — planks on its pedestals,
 * `workshop`, or `both`), the purse (a coin per plank, whatever its length) and the gaps its planks build.
 */
const ROAD = {
  only: { head: 'moulds', purse: ON.purse, gaps: ON.gaps },
  common: { head: 'moulds', purse: CM.purse, gaps: CM.gaps },
  proof: { head: 'workshop', purse: PR.purse, gaps: PR.gaps },
  witness: { head: 'moulds', purse: null, gaps: WT.gaps },
  hidden: { head: 'both', purse: HD.purse, gaps: HD.gaps },
};
/** « هوّة 25 خانة ثمّ هوّة 27 خانة ». */
const roadWords = (id) => ROAD[id].gaps.map((a) => `هوّة ${a} خانة`).join(' ثمّ ');
/** The convoys with a purse (`story.convoys`): the world reads `{ purse }`. */
const CONVOYS = Object.fromEntries(
  Object.entries(ROAD)
    .filter(([, r]) => r.purse)
    .map(([id, r]) => [id, { purse: r.purse }]),
);

const SEGMENTS = [
  bridge(`g${ON.gaps[0]}`, ON.gaps[0], 12.5, ON.plank, { convoy: 'only', moulds: ON.moulds }),
  bridge(`g${ON.gaps[1]}`, ON.gaps[1], 13, ON.plank, { convoy: 'only' }),
  bridge(`g${CM.gaps[0]}`, CM.gaps[0], 13.5, CM.plank, { convoy: 'common', moulds: CM.moulds }),
  bridge(`g${CM.gaps[1]}`, CM.gaps[1], 14.5, CM.plank, { convoy: 'common' }),
  bridge(`g${PR.gaps[0]}`, PR.gaps[0], 14, PR.plank, {
    convoy: 'proof',
    workshop: workshop(Math.max(...PR.gaps), PROOF_BENCH, true),
  }),
  bridge(`g${PR.gaps[1]}`, PR.gaps[1], 12.5, PR.plank, { convoy: 'proof' }),
  // the long gaps are drawn as a strip of light (no tick per cell past 200 cells: Game.js › buildBridge)
  bridge(`g${WT.gaps[0]}`, WT.gaps[0], 24, WT.plank, { convoy: 'witness', moulds: WT.moulds }),
  bridge(`g${WT.gaps[1]}`, WT.gaps[1], 20, WT.plank, { convoy: 'witness' }),
  bridge(`g${HD.gaps[0]}`, HD.gaps[0], 14, HD.plank, {
    convoy: 'hidden',
    moulds: HD.moulds,
    workshop: workshop(Math.max(...HD.gaps), HIDDEN_BENCH, false),
  }),
  bridge(`g${HD.gaps[1]}`, HD.gaps[1], 16, HD.plank, { convoy: 'hidden' }),
  { id: 'dash', kind: 'rail', len: 300 },
  {
    id: `g${BOSS_A}`,
    kind: 'bridge',
    a: BOSS_A,
    len: 24,
    moulds: [],
    holdsWith: B.plank,
    boss: { options: B.options, price: B.price },
  },
];

const pgcdWave = (x, y, gates) => ({ say: `$${pgcd(x, y)} = \\square$`, gates, test: (n) => n === gcd(x, y) });
/** « قاسم مشترك للعددين x و y غير 1 »: a gate is right when it divides both and is not 1. */
const witnessWave = (x, y, gates) => ({
  say: `قاسم مشترك للعددين ${x} و ${y} غير 1`,
  gates,
  test: (n) => n > 1 && x % n === 0 && y % n === 0,
});
/** « عدد أوّليّ مع n فيما بينهما »: a gate is right when its PGCD with n is 1. */
const coprimeWave = (n, gates) => ({
  say: `عدد أوّليّ مع ${n} فيما بينهما`,
  gates,
  test: (m) => m >= 1 && gcd(m, n) === 1,
});
/**
 * The gate dash (after island K: the three keys are forged): one sentence, three gates, exactly one right. Mental
 * arithmetic — every number at most 100 — and no pair of the exercise bank (`story.test.js`). Two waves hide their
 * common plank from the rules' planks (91 and 65: 13; 68 and 51: 17): « no witness seen » is not a proof.
 */
const DASH_WAVES = [
  pgcdWave(32, 45, [1, 3, 5]),
  witnessWave(63, 84, [2, 5, 7]),
  coprimeWave(12, [9, 25, 14]),
  pgcdWave(93, 62, [1, 3, 31]),
  witnessWave(91, 65, [5, 7, 13]),
  coprimeWave(15, [21, 28, 35]),
  pgcdWave(49, 20, [1, 4, 7]),
  witnessWave(68, 51, [2, 3, 17]),
];

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
export const TABLETS = {
  [K.only]: {
    icon: '🤝',
    title: 'عددان أوّليّان فيما بينهما',
    lines: [
      'نقول إنّ العددين الطبيعيين $a$ و $b$ أوّليّان فيما بينهما إذا كان قاسمهما المشترك الوحيد هو 1.',
      'أي: $\\mathrm{PGCD}(a ; b) = 1$.',
    ],
    math: [`${pgcd(...ON.gaps)} = ${gcd(...ON.gaps)}`, `${pgcd(...CM.gaps)} = ${gcd(...CM.gaps)}`],
    notes: [
      `اللوح ${ON.plank} وحده بنى الجسرين ${ON.gaps[0]} و ${ON.gaps[1]} بـ ${counted(ON.purse, COINS)}: ${ltr(`${ON.gaps[0]} + ${ON.gaps[1]} = ${ON.purse}`)}`,
    ],
  },
  [K.proof]: {
    icon: '✅',
    title: 'نثبت أنّهما أوّليّان فيما بينهما',
    lines: [
      'نحسب $\\mathrm{PGCD}(a ; b)$ بخوارزمية إقليدس: إذا كان آخر باقٍ غير معدوم هو 1 فإنّ $\\mathrm{PGCD}(a ; b) = 1$.',
      'إذن العددان $a$ و $b$ أوّليّان فيما بينهما.',
    ],
    math: [divTex(PROOF_STEPS.at(-2)), `${pgcd(...PR.gaps)} = ${gcd(...PR.gaps)}`],
    notes: [
      `اللوح ${PR.plank} بنى الجسرين ${PR.gaps[0]} و ${PR.gaps[1]} بـ ${counted(PR.purse, COINS)}: ${ltr(`${PR.gaps[0]} + ${PR.gaps[1]} = ${PR.purse}`)}`,
    ],
  },
  [K.witness]: {
    icon: '❌',
    title: 'قاسم مشترك واحد غير 1 يكفي',
    lines: [
      'لنثبت أنّ عددين ليسا أوّليّين فيما بينهما يكفي أن نجد قاسمًا مشتركًا لهما يختلف عن 1.',
      'وإذا لم يقسمهما معًا أيّ من 2 و 3 و 5 و 9 و 10 فلا نستنتج شيئًا: نحسب قاسمهما المشترك الأكبر.',
    ],
    math: [`${pgcd(...WT.gaps)} = ${gcd(...WT.gaps)}`, `${pgcd(...HD.gaps)} = ${gcd(...HD.gaps)}`],
    notes: [
      `اللوح ${HD.plank} بنى الجسرين ${HD.gaps[0]} و ${HD.gaps[1]} بـ ${counted(HD_COST, COINS)}: ${ltr(`${HD.gaps[0] / HD.plank} + ${HD.gaps[1] / HD.plank} = ${HD_COST}`)}`,
    ],
  },
};

/** The two lanes of the last bridge, in the order they are laid. */
const LANES = [
  { n: LANE1, name: 'الممرّ الأوّل' },
  { n: LANE2, name: 'الممرّ الثاني' },
];
/** What planks of b leave on each lane: « الألواح 35 تملأ الممرّ الأوّل (105 خانة)، لكن في الممرّ الثاني … ». */
function lanesWith(b) {
  const filled = LANES.filter((x) => x.n % b === 0);
  const open = LANES.filter((x) => x.n % b !== 0);
  const left = open.map((x) => `في ${x.name} (${x.n} خانة) ${emptyCells(x.n % b)}`).join('، و');
  return filled.length
    ? `الألواح ${b} تملأ ${filled[0].name} (${filled[0].n} خانة)، لكن ${left}`
    : `الألواح ${b}: ${left}`;
}

/** The name of the head island of each convoy (the instruction sends him back there). */
const HEAD_NAME = Object.fromEntries(
  Object.keys(ROAD).map((id) => [id, ISLANDS[SEGMENTS.findIndex((s) => s.convoy === id)].name]),
);
/** What waits at the head island he is sent back to: planks to take, a workshop, or both. */
const backTo = (name) => {
  const id = Object.keys(ROAD).find((c) => HEAD_NAME[c] === name);
  const head = ROAD[id]?.head ?? 'moulds';
  return head === 'workshop'
    ? `ارجع إلى «${name}» واصنع في ورشتها لوحًا بطول آخر`
    : head === 'both'
      ? `ارجع إلى «${name}» وخذ ألواحًا أخرى، أو اصنعها في ورشتها`
      : `ارجع إلى «${name}» واختر ألواحًا أخرى تبني الجسرين`;
};
/** « لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس 52 قطعة. » — the purse, as the head instruction says it. */
const purseWords = (n) => `لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس ${counted(n, COINS)}.`;

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: جسرا المرفأ',
  subtitle: `مرفأ الجسرين ينتظر جسرًا بممرّين، ${LANE1} خانة ثمّ ${LANE2} خانة، من ألواح بطول واحد. ابحث مع «زيرو» عن أطول لوح يملأ الممرّين معًا.`,
  objective: {
    // the head island of a convoy, nothing in hand: the gaps ahead, no planks on the next island, what the island holds
    // and the purse (owner, 2026-11-19: the instruction stays and says it all)
    pick: (id) =>
      `خذ من هذه الجزيرة ألواحًا تبني جسرين: ${roadWords(id)}، ولا ألواح على الجزيرة التالية. ${ROAD[id].purse ? purseWords(ROAD[id].purse) : ''}`.trim(),
    witness: `خذ من هذه الجزيرة ألواحًا تبني جسرين: ${roadWords('witness')}، ولا ألواح على الجزيرة التالية. أطوال ألواحها ${andAr(WT.moulds)}: أعداد تعرف قواعد قابلية القسمة عليها.`,
    make: (id) =>
      `اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني ${roadWords(id)}، ولا ألواح على الجزيرة التالية. ${purseWords(ROAD[id].purse)} وفي الورشة دفتر للهوّتين.`,
    // island I: its five planks first; the workshop opens once the first bridge has fallen twice
    hidden: `خذ ألواحًا تبني ${roadWords('hidden')}، ولا ألواح على الجزيرة التالية. أطوال ألواح الجزيرة ${andAr(HD.moulds)}، وفي الكيس ${counted(HD.purse, COINS)}، قطعة لكلّ لوح. الورشة تُفتح إذا انهار الجسر الأوّل مرّتين.`,
    hiddenOpen: `الورشة مفتوحة: اصنع فيها لوحًا يبني ${roadWords('hidden')}، ولا ألواح على الجزيرة التالية. في الكيس ${counted(HD.purse, COINS)}، قطعة لكلّ لوح. وفي الورشة دفتر للهوّتين.`,
    // …once he holds planks there
    carry: (id, b, left, anvil) => {
      const coins = ROAD[id].purse ? ` لكلّ لوح قطعة، وفي الكيس ${counted(left, COINS)}.` : '';
      const other =
        ROAD[id].head === 'workshop'
          ? 'اصنعه في الورشة'
          : ROAD[id].head === 'both' && anvil
            ? 'خذه من الجزيرة أو اصنعه في الورشة'
            : 'خذه من هذه الجزيرة';
      return `معك ألواح طولها ${b}: ابنِ بها ${roadWords(id)} عند منصّة الضوء.${coins} لوح بطول آخر؟ ${other}.`;
    },
    // the later gap of a convoy, with the planks he carries
    tail: (a, b, left) =>
      `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها: لا ألواح على هذه الجزيرة${left == null ? '' : `، ${coinsLeft(left)}`}.`,
    convoyBack: (name) => `لا ألواح على هذه الجزيرة. ${backTo(name)}.`,
    board: `اركب لوح الضوء نحو ${ISLANDS[11].name}`,
    bossGo: `اذهب إلى المنصّة المضيئة واختر أطول لوح يملأ الممرّين ${LANE1} و ${LANE2}`,
    bossCross: 'جسر المرفأ ثابت — اعبر إلى مرفأ الجسرين!',
    end: 'وصلتَ المرفأ',
  },
  prompt: {
    anvilLocked: 'جرّب ألواح الجزيرة أوّلًا',
  },
  say: {
    hello: `أنا زيرو! أمامنا هوّتان: ${ON.gaps[0]} خانة ثمّ ${ON.gaps[1]} خانة، ولا ألواح إلّا على هذه الجزيرة. اختر لوحًا، ثمّ تعال إلى منصّة الضوء.`,
    // arriving on the island of a later gap, with the planks he carries
    tailPurse: (a) => `لا ألواح على هذه الجزيرة. الهوّة ${a} خانة: هل تبنيها الألواح التي تحملها، بما بقي في الكيس؟`,
    tailFree: (a) => `لا ألواح على هذه الجزيرة. الهوّة ${a} خانة: هل تملؤها الألواح التي تحملها؟`,
    // what waits at the head of each convoy (the road goes on from the island of a mirror)
    common: `هوّتان جديدتان: ${CM.gaps[0]} خانة ثمّ ${CM.gaps[1]} خانة، وفي الكيس ${counted(CM.purse, COINS)} فقط. اختر لوحًا من هذه الجزيرة.`,
    proof: `هوّتان جديدتان: ${PR.gaps[0]} خانة ثمّ ${PR.gaps[1]} خانة. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(PR.purse, COINS)}.`,
    witness: `هوّتان طويلتان: ${WT.gaps[0]} خانة ثمّ ${WT.gaps[1]} خانة. أطوال ألواح هذه الجزيرة ${andAr(WT.moulds)}.`,
    hidden: `هوّتان جديدتان: ${HD.gaps[0]} خانة ثمّ ${HD.gaps[1]} خانة، وفي الكيس ${counted(HD.purse, COINS)}. جرّب ألواح هذه الجزيرة أوّلًا.`,
    anvilOpen: 'انهار الجسر الأوّل مرّتين: الورشة مفتوحة الآن. اصنع فيها لوحًا بالطول الذي تختاره.',
    // a head bridge held: how many planks, the coins left, what waits on the next island
    headOk: (a, b, left, next) =>
      `${planksFill(a / b, b)} ${a} خانة${left == null ? '' : `، ${coinsLeft(left)}`}. اعبر: الهوّة ${next} تنتظر الألواح نفسها.`,
    // a tail bridge held: both bridges stand
    tailOk: (a, b, left) =>
      `${planksFill(a / b, b)} ${a} خانة: الجسران ثابتان${left == null ? '' : left ? `، ${coinsLeft(left)}` : '، وقطع الكيس كلّها في الجسرين'}.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    boss: `ها هو جسر المرفأ: ممرّ من ${LANE1} خانة، ثمّ ممرّ من ${LANE2} خانة. نوع واحد من الألواح يملأ كلّ ممرّ تمامًا، أطولُ ما يمكن. في المخزن نوعان: ${B.options[0]} و ${B.options[1]}.`,
    // the store divides the whole bridge; the sentence says WHICH lane is not filled
    bossFail: (b) => `${lanesWith(b)}. جرّب النوع الآخر.`,
    bossOk: `${planksOf(BOSS_Q, B.plank)}: ${LANE1 / B.plank} في الممرّ الأوّل و ${LANE2 / B.plank} في الممرّ الثاني، ولا خانة فارغة. جسر المرفأ ثابت!`,
    end: 'وصل الجسر إلى مرفأ الجسرين، والممرّان من ألواح بطول واحد. شكرًا لك!',
    // the world's convoy sentences, said with what the head island holds
    convoyBack: (name, r) => `${emptyCells(r)}، فانهار الجسر الثاني. لا ألواح هنا: ${backTo(name)}.`,
    convoyReset: (b) => `الألواح ${b} في يدك الآن: الجسر الذي بنيته بألواح أخرى انهار.`,
    convoyOnly: 'الجسر الثاني يُبنى بالألواح نفسها التي بنت الجسر الأوّل.',
  },
  /** The workshop's notebook: one name for the two benches (the world's default was the lists' notebook). */
  workshop: {
    bench: 'دفتر الورشة',
    benchSub: 'الدفتر يكتب ما يحدث للهوّتين، واللوح تختاره أنت',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    first: (a, b) => `الجسر الأوّل: $${a} = ${b} \\times ${a / b}$`,
    ahead: (a) => `أمامك الهوّة ${a}، بالألواح نفسها`,
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
  },
  boss: {
    title: 'مخزن مرفأ الجسرين',
    mission: `المهمّة: ممرّا المرفأ متتاليان، ${LANE1} خانة ثمّ ${LANE2} خانة (${BOSS_A} خانة). نوع واحد من الألواح يجب أن يملأ كلّ ممرّ وحده تمامًا، وأطولُ ما يمكن. اختر الألواح، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `ما أطول لوح يملأ الممرّين ${LANE1} و ${LANE2} كليهما؟ أثبت ذلك في كرّاسك قبل أن تختار.`,
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
  end: { text: 'وصلتَ مرفأ الجسرين، وصنعتَ مفاتيح المعرفة الثلاثة بنفسك.' },
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
  /** The convoys with a purse pay a coin per plank, whatever its length. */
  convoys: CONVOYS,

  /**
   * The instruction of the moment on the five convoys — the WHOLE instruction (it stays on screen): on a head island,
   * the gaps its planks build, that the next island has none, what the island holds and the purse; on a later island,
   * the plank he carries (and the coins left). null: the world's own (a bridge built, the rail, the store).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.complete || !seg.convoy) return null;
    const b = game.state.held;
    const id = seg.convoy;
    const road = ROAD[id];
    const left = road.purse ? (game.purseOf(seg)?.left ?? road.purse) : null;
    if (!game.convoyTail(seg)) {
      if (b != null) return o.carry(id, b, left, Boolean(game.flags.anvil));
      if (road.head === 'workshop') return o.make(id);
      if (road.head === 'both') return game.flags.anvil ? o.hiddenOpen : o.hidden;
      return id === 'witness' ? o.witness : o.pick(id);
    }
    // nothing in hand on an island without planks (a page opened again there), or refused: back to the head island
    if (game.flags.convoyStuck || b == null) return o.convoyBack(game.isl[game.convoyOf(seg)[0].index].name);
    return o.tail(seg.a, b, left);
  },
  /** The card on the right: what the island before showed. Elsewhere the world's (the gap just crossed). */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.convoy) return null;
    const group = game.convoyOf(before);
    const gaps = group.map((s) => s.a);
    const road = ROAD[before.convoy];
    // the end of a convoy: what each plank he tried did there (the last three)
    if (group.indexOf(before) === group.length - 1) {
      const purse = road.purse ?? Infinity;
      return triedOn(game, gaps).map((b) => R.plank(b, roadOf(gaps, purse, b, laidOn(game, b))));
    }
    // the first bridge of a convoy: its equality, then the coins it cost (a purse) or the gap ahead
    const b = before.builtWith ?? before.holdsWith;
    return [R.first(before.a, b), road.purse ? R.paid(before.a / b, game.purseOf(before).left) : R.ahead(gaps[1])];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.tailPurse(ON.gaps[1]), 8);
    if (k === 2) game.say(say.common, 9);
    if (k === 3) game.say(say.tailPurse(CM.gaps[1]), 8);
    if (k === 4 && missing(game, K.only)) game.openForge(K.only);
    if (k === 5) game.say(say.tailPurse(PR.gaps[1]), 8);
    if (k === 6 && missing(game, K.proof)) game.openForge(K.proof);
    if (k === 7) game.say(say.tailFree(WT.gaps[1]), 8);
    if (k === 8) game.say(say.hidden, 9);
    if (k === 9) game.say(say.tailPurse(HD.gaps[1]), 8);
    if (k === 10 && missing(game, K.witness)) game.openForge(K.witness);
    if (k === 11) game.say(say.boss, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    [K.only]: (game) => {
      completeModules(game, K.only);
      game.say(game.T.say.proof, 9);
    },
    [K.proof]: (game) => {
      completeModules(game, K.proof);
      game.say(game.T.say.witness, 9);
    },
    [K.witness]: (game) => {
      game.flags.key4 = true;
      completeModules(game, K.witness);
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    const { stage } = game.state;
    if (stage === 4 && missing(game, K.only)) return K.only;
    if (stage === 6 && missing(game, K.proof)) return K.proof;
    if (stage === 10 && missing(game, K.witness)) return K.witness;
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (!seg.convoy) return false;
    const left = ROAD[seg.convoy].purse ? (game.purseOf(seg)?.left ?? 0) : null;
    if (game.convoyTail(seg)) game.say(say.tailOk(seg.a, b, left), 9);
    else game.say(say.headOk(seg.a, b, left, game.convoyOf(seg)[1].a), 8);
    return true;
  },
  // the last bridge is the lesson's problem (module 4: decide whether two numbers are coprime, and prove it)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
