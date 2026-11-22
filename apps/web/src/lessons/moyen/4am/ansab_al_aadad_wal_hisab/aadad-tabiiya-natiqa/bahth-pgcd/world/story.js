/**
 * THE STORY of lesson « البحث عن القاسم المشترك الأكبر لعددين طبيعيين » in the world « أرخبيل القواسم » — what the
 * world's mechanic plays (`divisorIsles/Game.js`): its islands and gaps, the waves of its gate dash, its words, and what
 * happens on the way. The lessons before it say WHAT the PGCD is (the longest plank that fills both gaps) and how to find
 * it by listing; here the gaps are too long to list, and he finds it by a PROCEDURE. The road is the owner's redesign of
 * 2026-11-19 (`docs/reports/BATCH_2_DESIGN.md` §7, « Lesson 6 — the road as it is built »): the need for each rule comes
 * from a convoy he carries across the islands (GAME_WORLD.md §2ter-1).
 *
 *   A → B → C → D  convoy « diff », THREE bridges, planks offered on A (no workshop, no purse): 152, 95, then 57 — the
 *                  instruction says the third is the first minus the second. 19 fills the three, 8 fills 152 only, 5 fills
 *                  95 only, 3 fills 57 only. D: the mirror of key ➖ `farq-yabqi`.
 *   D → E → F      convoy « tarh »: 259 then 185, a purse of 12 coins (7 + 5 planks of 37); D has a workshop whose bench
 *                  is the subtraction ladder (`inquiries.js › TARH_BENCH`). F: the mirror of key 🪜
 *                  `khawarizmiyat-al-tarh`, then the mirror of key 🧮 `baqi-yabqi` (its experiment `ladder` / `fold` on
 *                  962 and 296 stays IN the mirror).
 *   F → G → H      convoy « iqlidis »: 1833 then 546, 61 coins (47 + 14 planks of 39); the bench is the division ladder.
 *                  H: the mirror of key 🔁 `iqlidis`.
 *   H → I → J      convoy « sibaq »: 1003 then 34, 61 coins (59 + 2 planks of 17); the bench runs both ladders side by
 *                  side (31 rows against 2). J: the mirror of key ⏱️ `aqall-khutuwat`.
 *   J → K          the gate dash (its waves use the five keys, all forged at J).
 *   K → L          the last bridge, the lesson's problem: the landing's two lanes laid end to end, 1176 cells then 868,
 *                  ONE kind of plank that fills each lane exactly, the longest. The store offers 56 (it fills the first
 *                  lane alone: 868 = 56 × 15 + 28) and 28 = PGCD(1176 ; 868): he must run an algorithm on the two lanes.
 * Every number is in `NUMBERS` (math.js, ONE place); the sentences and the tablets are written from it. The hooks
 * receive the game and use its commands; they hold no mechanic.
 */
import {
  COINS,
  NUMBERS,
  SUBTRACTIONS,
  coinsLeft,
  counted,
  differences,
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
import { IQLIDIS_BENCH, SIBAQ_BENCH, TARH_BENCH } from './inquiries';

/** What a plank b did on the road of a convoy, as the world plays it (the kit's `roadOf`, re-exported by `math.js`). */
export { NUMBERS, roadOf };
const { diff: DF, tarh: TR, fold: FD, iqlidis: IQ, sibaq: SB, boss: B } = NUMBERS;
const [D1, D2, D3] = DF.gaps;
const [T1, T2] = TR.gaps;
const [F1, F2] = FD.gaps;
const [I1, I2] = IQ.gaps;
const [S1, S2] = SB.gaps;
const [LANE1, LANE2] = B.lanes;
const BOSS_A = LANE1 + LANE2;
const BOSS_Q = BOSS_A / B.plank;
/** The two ladders of the convoys, as the tablets quote them. */
const IQ_STEPS = euclid(I1, I2);
const SB_STEPS = euclid(S1, S2);
const SB_SUBS = differences(S1, S2).length;
/** Euclid's divisions after « مقابل » (genitive): « قسمة واحدة », « قسمتين », « 4 قسمات », « 12 قسمة ». */
const DIVISIONS_GEN = ['قسمة واحدة', 'قسمتين', 'قسمات', 'قسمة'];

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 ➖, P2 🪜, P3 🧮, P4 🔁, P5 ⏱️. `journey.test.js` checks this table against the
 * config. Modules 0 and 8 teach no learning point.
 */
export const MODULE_KEYS = {
  1: ['farq-yabqi', 'khawarizmiyat-al-tarh'],
  2: ['farq-yabqi', 'khawarizmiyat-al-tarh', 'baqi-yabqi'],
  3: ['baqi-yabqi', 'iqlidis', 'aqall-khutuwat'],
  4: ['khawarizmiyat-al-tarh', 'iqlidis', 'aqall-khutuwat'],
  5: ['farq-yabqi', 'khawarizmiyat-al-tarh'],
  6: ['baqi-yabqi', 'iqlidis'],
  7: ['baqi-yabqi', 'iqlidis', 'aqall-khutuwat'],
};
/**
 * The modules that are problems: 7 (the algorithms on two lengths and the choice of one — the last bridge's own ask) is
 * done when the store is paid; 5 and 6 by the story's end (`kit/storyEnd.js` marks every module).
 */
const PROBLEM_MODULES = ['5', '6', '7'];
const PROBLEM_MODULE = '7';
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
const workshop = (max, bench) => ({ min: 1, max, open: true, typed: true, bench });

const ISLANDS = [
  { id: 'A', name: 'مرسى الخشّابين', R: 9, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة المحار', R: 8, theme: 'meadow', turn: 0.38 },
  { id: 'C', name: 'جزيرة الكثبان', R: 8, theme: 'crystal', turn: -0.45 },
  { id: 'D', name: 'جزيرة القصب', R: 9.5, theme: 'crystal', turn: 0.4, feature: 'anvil' },
  { id: 'E', name: 'جزيرة اللؤلؤ', R: 8, theme: 'pine', turn: -0.35 },
  { id: 'F', name: 'جزيرة البلّوط', R: 9.5, theme: 'pine', turn: 0.3, feature: 'anvil' },
  { id: 'G', name: 'جزيرة الشلّال', R: 8, theme: 'autumn', turn: -0.42 },
  { id: 'H', name: 'جزيرة الأرز', R: 9.5, theme: 'autumn', turn: 0.35, feature: 'anvil' },
  { id: 'I', name: 'جزيرة الصفصاف', R: 8, theme: 'stone', turn: -0.3 },
  { id: 'J', name: 'جزيرة اليمام', R: 10.5, theme: 'stone', turn: 0.2 },
  { id: 'K', name: 'جزيرة الياسمين', R: 9, theme: 'snow', turn: -0.25 },
  { id: 'L', name: 'مرسى الممرّين', R: 12, theme: 'snow', turn: 0 },
];
/** The convoys with a workshop, in the order of the road: what the plank he makes builds (the instruction says it). */
const ROADS = {
  tarh: `هوّة ${T1} خانة ثمّ هوّة ${T2} خانة`,
  iqlidis: `هوّة ${I1} خانة ثمّ هوّة ${I2} خانة`,
  sibaq: `هوّة ${S1} خانة ثمّ هوّة ${S2} خانة`,
};
/** Each convoy with a workshop pays a coin per plank, whatever its length; the convoy « diff » has no purse. */
const CONVOYS = {
  tarh: { purse: TR.purse },
  iqlidis: { purse: IQ.purse },
  sibaq: { purse: SB.purse },
};
const SEGMENTS = [
  bridge(`g${D1}`, D1, 15, DF.plank, { convoy: 'diff', moulds: DF.moulds }),
  bridge(`g${D2}`, D2, 13.5, DF.plank, { convoy: 'diff' }),
  bridge(`g${D3}`, D3, 12.5, DF.plank, { convoy: 'diff' }),
  bridge(`g${T1}`, T1, 16, TR.plank, { convoy: 'tarh', workshop: workshop(Math.max(T1, T2), TARH_BENCH) }),
  bridge(`g${T2}`, T2, 14, TR.plank, { convoy: 'tarh' }),
  // the long gaps are drawn as a strip of light (no tick per cell past 200 cells: Game.js › buildBridge)
  bridge(`g${I1}`, I1, 24, IQ.plank, { convoy: 'iqlidis', workshop: workshop(Math.max(I1, I2), IQLIDIS_BENCH) }),
  bridge(`g${I2}`, I2, 19, IQ.plank, { convoy: 'iqlidis' }),
  bridge(`g${S1}`, S1, 22, SB.plank, { convoy: 'sibaq', workshop: workshop(Math.max(S1, S2), SIBAQ_BENCH) }),
  bridge(`g${S2}`, S2, 11, SB.plank, { convoy: 'sibaq' }),
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

const pgcdWave = (x, y, gates) => ({ say: `$${pgcd(x, y)} = \\square$`, gates, test: (n) => n === gcd(x, y) });
/** « PGCD(x ; y) = PGCD(y ; □) »: a gate is right when the equality is TRUE (exactly one gate is: story.test.js). */
const sameWave = (x, y, gates) => ({
  say: `$${pgcd(x, y)} = \\mathrm{PGCD}(${y} ; \\square)$`,
  gates,
  test: (n) => n >= 1 && gcd(y, n) === gcd(x, y),
});
/**
 * The gate dash (after island J: the five keys are forged): one sentence, three gates, exactly one right. Mental
 * arithmetic — every number at most 100 — and no pair of the exercise bank (`story.test.js`).
 */
const DASH_WAVES = [
  sameWave(91, 35, [56, 45, 26]),
  pgcdWave(45, 27, [3, 9, 18]),
  sameWave(78, 24, [6, 3, 8]),
  { say: 'عدد عمليات الطرح في خوارزمية الفروق للعددين 40 و 8', gates: [1, 4, 5], test: (n) => n === 5 },
  pgcdWave(84, 36, [6, 12, 48]),
  { say: 'عدد القسمات في خوارزمية إقليدس للعددين 70 و 21', gates: [2, 3, 6], test: (n) => n === 2 },
  pgcdWave(100, 75, [5, 25, 75]),
  sameWave(65, 26, [4, 12, 13]),
];

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
export const TABLETS = {
  'farq-yabqi': {
    icon: '➖',
    title: 'الفرق يحفظ الألواح المشتركة',
    lines: [
      'إذا كان $a > b$ فإنّ $\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; a - b)$.',
      'كلّ لوح يملأ الهوّتين $a$ و $b$ يملأ هوّة فرقهما $a - b$، وكلّ لوح يملأ $b$ و $a - b$ يملأ $a$.',
    ],
    math: [`${D1} - ${D2} = ${D3}`, `${pgcd(D1, D2)} = ${pgcd(D2, D3)}`],
    notes: [
      `اللوح ${DF.plank} بنى الجسور الثلاثة: ${ltr(`${D1} = ${DF.plank} × ${D1 / DF.plank}`)} و ${ltr(`${D2} = ${DF.plank} × ${D2 / DF.plank}`)} و ${ltr(`${D3} = ${DF.plank} × ${D3 / DF.plank}`)}`,
    ],
  },
  'khawarizmiyat-al-tarh': {
    icon: '🪜',
    title: 'خوارزمية الفروق',
    lines: [
      'نطرح العدد الأصغر من الأكبر، ثمّ نعيد مع العدد الأصغر والفرق، حتّى نصل إلى فرق معدوم.',
      'القاسم المشترك الأكبر هو آخر فرق غير معدوم.',
    ],
    math: [`${TR.plank} - ${TR.plank} = 0`, `${pgcd(T1, T2)} = ${gcd(T1, T2)}`],
    notes: [
      `الألواح ${TR.plank} بنت الجسرين بـ ${counted(TR.purse, COINS)}: ${ltr(`${T1 / TR.plank} + ${T2 / TR.plank} = ${TR.purse}`)}`,
    ],
  },
  'baqi-yabqi': {
    icon: '🧮',
    title: 'الباقي يحفظ الألواح المشتركة',
    lines: [
      'إذا كان $r$ باقي القسمة الإقليدية للعدد $a$ على العدد $b$ فإنّ $\\mathrm{PGCD}(a ; b) = \\mathrm{PGCD}(b ; r)$.',
      'القسمة تجمع في سطر واحد عمليات طرح العدد $b$ المتتالية.',
    ],
    math: [`${F1} = ${F2} \\times ${Math.floor(F1 / F2)} + ${F1 % F2}`, `${pgcd(F1, F2)} = ${pgcd(F2, F1 % F2)}`],
    notes: [`${counted(Math.floor(F1 / F2), SUBTRACTIONS)} للعدد ${F2} في قسمة واحدة`],
  },
  iqlidis: {
    icon: '🔁',
    title: 'خوارزمية إقليدس',
    lines: [
      'نقسم الأكبر على الأصغر، ثمّ نقسم القاسم على الباقي، ونعيد حتّى نصل إلى باقٍ معدوم.',
      'القاسم المشترك الأكبر هو آخر باقٍ غير معدوم.',
    ],
    math: [divTex(IQ_STEPS.at(-1)), `${pgcd(I1, I2)} = ${gcd(I1, I2)}`],
    notes: [
      `الألواح ${IQ.plank} بنت الجسرين بـ ${counted(IQ.purse, COINS)}: ${ltr(`${I1 / IQ.plank} + ${I2 / IQ.plank} = ${IQ.purse}`)}`,
    ],
  },
  'aqall-khutuwat': {
    icon: '⏱️',
    title: 'أيّ الخوارزميتين أسرع',
    lines: [
      'كلّ قسمة في خوارزمية إقليدس تجمع عددًا من عمليات الطرح يساوي حاصلها.',
      'لذلك لا تحتاج خوارزمية إقليدس خطوات أكثر من خوارزمية الفروق، وتختصر كثيرًا حين يكون أحد العددين أكبر من الآخر بكثير.',
    ],
    math: [divTex(SB_STEPS[0]), `${pgcd(S1, S2)} = ${gcd(S1, S2)}`],
    notes: [
      `للعددين ${S1} و ${S2}: ${counted(SB_SUBS, SUBTRACTIONS)} مقابل ${counted(SB_STEPS.length, DIVISIONS_GEN)}`,
    ],
  },
};

/** The two lanes of the last bridge, in the order they are laid. */
const LANES = [
  { n: LANE1, name: 'الممرّ الأوّل' },
  { n: LANE2, name: 'الممرّ الثاني' },
];
/** What planks of b leave on each lane: « الألواح 56 تملأ الممرّ الأوّل (1176 خانة)، لكن في الممرّ الثاني … ». */
function lanesWith(b) {
  const filled = LANES.filter((x) => x.n % b === 0);
  const open = LANES.filter((x) => x.n % b !== 0);
  const left = open.map((x) => `في ${x.name} (${x.n} خانة) ${emptyCells(x.n % b)}`).join('، و');
  return filled.length
    ? `الألواح ${b} تملأ ${filled[0].name} (${filled[0].n} خانة)، لكن ${left}`
    : `الألواح ${b}: ${left}`;
}

const A_NAME = ISLANDS[0].name;
/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: مرسى الممرّين',
  subtitle: `مرسى الممرّين ينتظر جسرًا بممرّين، ${LANE1} خانة ثمّ ${LANE2} خانة، من ألواح بطول واحد. ابحث مع «زيرو» عن أطول لوح يملأ هوّتين طويلتين.`,
  objective: {
    // island A: the three gaps the planks taken here build, and that the third is the first minus the second
    diff: `الألواح التي تأخذها هنا تبني ثلاثة جسور: هوّة ${D1} خانة، ثمّ هوّة ${D2} خانة، ثمّ هوّة ${D3} خانة، والهوّة الثالثة هي الأولى ناقص الثانية: ${ltr(`${D1} − ${D2} = ${D3}`)}. لا ألواح على الجزيرتين التاليتين: اختر لوحًا يبني الجسور الثلاثة.`,
    // …once he holds planks there
    diffCarry: (b) =>
      `معك ألواح طولها ${b}: ابنِ بها هوّة ${D1} خانة عند منصّة الضوء، ثمّ ${D2}، ثمّ ${D3}. لوح بطول آخر؟ خذه من قوالب هذه الجزيرة.`,
    // a later gap of the convoy « diff », with the planks he carries
    diffTail: (a, b) => `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها: لا ألواح على هذه الجزيرة.`,
    // the head island of a convoy with a workshop: the gaps ahead, no planks on the next island, the workshop, the
    // price of a plank and the purse (owner, 2026-11-19: the instruction stays and says it all)
    make: (convoy) =>
      `اصنع في ورشة هذه الجزيرة لوحًا بالطول الذي تختاره: ألواحه تبني ${ROADS[convoy]}، ولا ألواح على الجزيرة التالية. لكلّ لوح قطعة من الكيس مهما كان طوله، وفي الكيس ${counted(CONVOYS[convoy].purse, COINS)}. وفي الورشة دفتر للهوّتين.`,
    // …once he holds planks there
    carry: (convoy, b, left) =>
      `معك ألواح طولها ${b}: ابنِ بها ${ROADS[convoy]} عند منصّة الضوء. لكلّ لوح قطعة، وفي الكيس ${counted(left, COINS)}. لوح بطول آخر؟ اصنعه في الورشة.`,
    // the later gap of a convoy with a purse, with the planks he carries
    tail: (a, b, left) =>
      `الهوّة ${a} خانة. ابنِ جسرها بالألواح ${b} التي تحملها: لا ألواح على هذه الجزيرة، ${coinsLeft(left)}.`,
    convoyBack: (name) =>
      name === A_NAME
        ? `لا ألواح على هذه الجزيرة. ارجع إلى «${name}» واختر ألواحًا أخرى تبني الجسور الثلاثة.`
        : `لا ألواح على هذه الجزيرة. ارجع إلى «${name}» واصنع في ورشتها لوحًا بطول آخر.`,
    board: `اركب لوح الضوء نحو ${ISLANDS[10].name}`,
    bossGo: `اذهب إلى المنصّة المضيئة واختر أطول لوح يملأ الممرّين ${LANE1} و ${LANE2}`,
    bossCross: 'جسر المرسى ثابت — اعبر إلى مرسى الممرّين!',
    end: 'وصلتَ المرسى',
  },
  say: {
    hello: `أنا زيرو! أمامنا ثلاث هوّات: ${D1} خانة، ثمّ ${D2}، ثمّ ${D3}، ولا ألواح إلّا على هذه الجزيرة. اختر لوحًا، ثمّ تعال إلى منصّة الضوء.`,
    b95: `لا ألواح على هذه الجزيرة. الهوّة ${D2} خانة: هل تملؤها الألواح التي تحملها؟`,
    c57: `لا ألواح هنا أيضًا. الهوّة ${D3} خانة: هل تملؤها الألواح التي تحملها؟`,
    // a bridge of the convoy « diff » held: how many planks, and what waits next
    diffOk: (a, b, next) =>
      next == null
        ? `${planksFill(a / b, b)} ${a} خانة: الجسور الثلاثة ثابتة.`
        : `${planksFill(a / b, b)} ${a} خانة. اعبر: الهوّة ${next} تنتظر الألواح نفسها.`,
    // a head bridge of a convoy with a purse held: how many planks, the coins left, what waits on the next island
    headOk: (a, b, left, next) =>
      `${planksFill(a / b, b)} ${a} خانة، ${coinsLeft(left)}. اعبر: الهوّة ${next} تنتظر الألواح نفسها.`,
    // a tail bridge held: both bridges stand
    tailOk: (a, b, left) =>
      `${planksFill(a / b, b)} ${a} خانة: الجسران ثابتان، ${left ? coinsLeft(left) : 'وقطع الكيس كلّها في الجسرين'}.`,
    // what waits after each forge (the road goes on from the island of its mirror)
    tarh: `هوّتان جديدتان: ${T1} خانة ثمّ ${T2} خانة، ولا ألواح على الجزيرة التالية. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(TR.purse, COINS)}.`,
    e185: `لا ألواح على هذه الجزيرة. الهوّة ${T2} خانة: هل تبنيها الألواح التي تحملها، بما بقي في الكيس؟`,
    iqlidis: `هوّتان طويلتان: ${I1} خانة ثمّ ${I2} خانة. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(IQ.purse, COINS)}.`,
    g546: `لا ألواح على هذه الجزيرة. الهوّة ${I2} خانة: هل تبنيها الألواح التي تحملها، بما بقي في الكيس؟`,
    sibaq: `هوّتان جديدتان: ${S1} خانة ثمّ ${S2} خانة. اصنع لوحك في ورشة هذه الجزيرة، وفي الكيس ${counted(SB.purse, COINS)}.`,
    i34: `لا ألواح على هذه الجزيرة. الهوّة ${S2} خانة: هل تبنيها الألواح التي تحملها، بما بقي في الكيس؟`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    boss: `ها هو جسر المرسى: ممرّ من ${LANE1} خانة، ثمّ ممرّ من ${LANE2} خانة. نوع واحد من الألواح يملأ كلّ ممرّ تمامًا، أطولُ ما يمكن. في المخزن نوعان: ${B.options[0]} و ${B.options[1]}.`,
    // the store divides the whole bridge; the sentence says WHICH lane is not filled
    bossFail: (b) => `${lanesWith(b)}. جرّب النوع الآخر.`,
    bossOk: `${planksOf(BOSS_Q, B.plank)}: ${LANE1 / B.plank} في الممرّ الأوّل و ${LANE2 / B.plank} في الممرّ الثاني، ولا خانة فارغة. جسر المرسى ثابت!`,
    end: 'وصل الجسر إلى مرسى الممرّين، والممرّان من ألواح بطول واحد. شكرًا لك!',
    // the world's convoy sentences (they said « the two bridges »; a convoy here may hold three, or a workshop)
    convoyBack: (name, r) =>
      name === A_NAME
        ? `${emptyCells(r)}، فانهار الجسر. لا ألواح هنا: ارجع إلى «${name}» واختر ألواحًا أخرى.`
        : `${emptyCells(r)}، فانهار الجسر الثاني. لا ألواح هنا: ارجع إلى «${name}» واصنع في ورشتها لوحًا بطول آخر.`,
    convoyReset: (b) => `الألواح ${b} في يدك الآن: الجسور التي بنيتها بألواح أخرى انهارت.`,
    convoyOnly: 'هذه الجسور تُبنى بالألواح نفسها التي بنت الجسر السابق.',
  },
  /** The workshop's notebook: one name for the three benches (the world's default was the lists' notebook). */
  workshop: {
    bench: 'دفتر الورشة',
    benchSub: 'الدفتر يكتب ما يحدث للهوّتين، واللوح تختاره أنت',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    first: (a, b) => `الجسر الأوّل: $${a} = ${b} \\times ${a / b}$`,
    held: (a, b) => `$${a} = ${b} \\times ${a / b}$`,
    ahead: (gaps) => `أمامك ${gaps.join(' ثمّ ')}، بالألواح نفسها`,
    // the third gap of the convoy « diff »: the first minus the second, as the instruction of island A said
    third: `أمامك الهوّة $${D3} = ${D1} - ${D2}$`,
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
    title: 'مخزن مرسى الممرّين',
    mission: `المهمّة: ممرّا المرسى متتاليان، ${LANE1} خانة ثمّ ${LANE2} خانة (${BOSS_A} خانة). نوع واحد من الألواح يجب أن يملأ كلّ ممرّ وحده تمامًا، وأطولُ ما يمكن. اختر الألواح، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `ما أطول لوح يملأ الممرّين ${LANE1} و ${LANE2} كليهما؟ ابحث عنه في كرّاسك قبل أن تختار.`,
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
  end: { text: 'وصلتَ مرسى الممرّين، وصنعتَ مفاتيح المعرفة الخمسة بنفسك.' },
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
  /** The convoys with a workshop pay a coin per plank, whatever its length. */
  convoys: CONVOYS,

  /**
   * The instruction of the moment on the four convoys — the WHOLE instruction (it stays on screen): on island A, the
   * three gaps and that the third is the first minus the second; on a head island with a workshop, the gaps its plank
   * builds, that the next island has none, the workshop, the price and the purse; on a later island, the plank he
   * carries (and the coins left). null: the world's own (a bridge built, the rail, the store).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.complete || !seg.convoy) return null;
    const b = game.state.held;
    if (seg.convoy === 'diff') {
      if (!game.convoyTail(seg)) return b == null ? o.diff : o.diffCarry(b);
      if (game.flags.convoyStuck || b == null) return o.convoyBack(game.isl[game.convoyOf(seg)[0].index].name);
      return o.diffTail(seg.a, b);
    }
    const left = game.purseOf(seg)?.left ?? 0;
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
    const gaps = group.map((s) => s.a);
    const at = group.indexOf(before);
    const built = (s) => s.builtWith ?? s.holdsWith;
    // the end of a convoy: what each plank he tried did there (the last three)
    if (at === group.length - 1) {
      const purse = CONVOYS[before.convoy]?.purse ?? Infinity;
      return triedOn(game, gaps).map((b) => R.plank(b, roadOf(gaps, purse, b, laidOn(game, b))));
    }
    // the convoy « diff », inside: the bridges standing, then what is ahead (its third gap: the first minus the second)
    if (before.convoy === 'diff') {
      if (at === 0) return [R.first(before.a, built(before)), R.ahead(gaps.slice(1))];
      return [...group.slice(0, at + 1).map((s) => R.held(s.a, built(s))), R.third];
    }
    // the first bridge of a convoy with a purse: its equality and the coins it cost
    const b = built(before);
    return [R.first(before.a, b), R.paid(before.a / b, game.purseOf(before).left)];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    if (k === 1) game.say(say.b95, 8);
    if (k === 2) game.say(say.c57, 8);
    if (k === 3 && missing(game, 'farq-yabqi')) game.openForge('farq-yabqi');
    if (k === 4) game.say(say.e185, 8);
    if (k === 5) {
      if (missing(game, 'khawarizmiyat-al-tarh')) game.openForge('khawarizmiyat-al-tarh');
      else if (missing(game, 'baqi-yabqi')) game.openForge('baqi-yabqi');
    }
    if (k === 6) game.say(say.g546, 8);
    if (k === 7 && missing(game, 'iqlidis')) game.openForge('iqlidis');
    if (k === 8) game.say(say.i34, 8);
    if (k === 9 && missing(game, 'aqall-khutuwat')) game.openForge('aqall-khutuwat');
    if (k === 10) game.say(say.boss, 9);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    'farq-yabqi': (game) => {
      completeModules(game, 'farq-yabqi');
      game.say(game.T.say.tarh, 9);
    },
    // island F holds two mirrors: the second opens as soon as the first tablet is closed
    'khawarizmiyat-al-tarh': (game) => {
      completeModules(game, 'khawarizmiyat-al-tarh');
      if (missing(game, 'baqi-yabqi')) game.openForge('baqi-yabqi');
    },
    'baqi-yabqi': (game) => {
      completeModules(game, 'baqi-yabqi');
      game.say(game.T.say.iqlidis, 9);
    },
    iqlidis: (game) => {
      completeModules(game, 'iqlidis');
      game.say(game.T.say.sibaq, 9);
    },
    'aqall-khutuwat': (game) => {
      game.flags.key4 = true;
      completeModules(game, 'aqall-khutuwat');
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    const { stage } = game.state;
    if (stage === 3 && missing(game, 'farq-yabqi')) return 'farq-yabqi';
    if (stage === 5 && missing(game, 'khawarizmiyat-al-tarh')) return 'khawarizmiyat-al-tarh';
    if (stage === 5 && missing(game, 'baqi-yabqi')) return 'baqi-yabqi';
    if (stage === 7 && missing(game, 'iqlidis')) return 'iqlidis';
    if (stage === 9 && missing(game, 'aqall-khutuwat')) return 'aqall-khutuwat';
    return null;
  },
  /** A bridge held: the story's own sentence for it (true), or nothing — the world then says how many planks it took. */
  onHold(game, seg, b) {
    const { say } = game.T;
    if (!seg.convoy) return false;
    if (seg.convoy === 'diff') {
      const group = game.convoyOf(seg);
      game.say(say.diffOk(seg.a, b, group[group.indexOf(seg) + 1]?.a ?? null), 8);
      return true;
    }
    const left = game.purseOf(seg)?.left ?? 0;
    if (game.convoyTail(seg)) game.say(say.tailOk(seg.a, b, left), 9);
    else game.say(say.headOk(seg.a, b, left, game.convoyOf(seg)[1].a), 8);
    return true;
  },
  // the last bridge is the lesson's problem (module 7: the algorithms on two lengths, and the choice of one)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
