/**
 * THE STORY of lesson « اختزال كسر » in the world « أرخبيل القواسم » — what the world's mechanic plays
 * (`divisorIsles/Game.js`): its islands and bridges, the waves of its gate dash, its words, and what happens on the way.
 * Every bridge of the road is a BRIDGE WITH A MARKED STRETCH (`divisorIsles/mark.js`): its first cells are lit and a
 * lantern post stands where they end; the bridge IS the fraction « the lit stretch over the whole bridge », and its sign
 * writes it. A plank holds only when it fills the gap AND a joint falls on the post; the sign is then rewritten in
 * planks — the same stretch, another writing (`docs/reports/BATCH_2_DESIGN.md` §7, « Lesson 8 », the road).
 *
 *   A → B   78 cells, 66 lit, planks 2, 4, 6, 9 on A. 2 holds: the sign is rewritten in planks of 2; 4 and 9 do not fill 78;
 *           6 holds too: = 11/13. The instruction asks, after the first hold, for the bridge again with the other plank
 *           that holds. THE MIRROR OF B (key 🪜) OPENS ONLY WHEN THE SIGN HOLDS BOTH WRITINGS — he built with 2 AND with
 *           6 (`writings`): arriving on B without them, the instruction sends him back to A's platform; rebuilding there
 *           after he crossed opens the mirror as soon as the second plank holds (`onHold`). The keys are forged in order:
 *           no later mirror opens before 🪜 (`forgeAt`).
 *   B → C   48 cells, 35 lit, planks 3, 5, 7, 1 on B: 3 fills 48 and misses the post (35 = 3 × 11 + 2); 5 and 7 do not
 *           fill; only 1 holds, and the sign does not change. C: the mirror of key 🔒.
 *   C → D   99 cells, 66 lit: a workshop (its bench: the division notebook), a purse of 3 — only 33 is paid: 2/3.
 *   D → E   243 cells, 189 lit: a workshop (the notebook), a purse of 9 — only 27 is paid: 7/9. E: the mirror of 🎯.
 *   E → F   39 cells lit in two strokes, 5 then 8: a workshop, a purse of 3 — the sign opens on 5/39 + 8/39 = 13/39;
 *           only 13 is paid: 1/3. F: the mirror of 🧾.
 *   F → G   the gate dash (its waves use the four keys).
 *   G → H   the last bridge, the store: 273 cells lit in two strokes, 88 then 107, a purse of 7. The store offers 3 and
 *           39 — both hold the post; 3 writes 65/91, which still reduces (by 13, that no rule of divisibility shows),
 *           and needs 91 planks: the purse stops it. Only the PGCD 39 writes the irreducible form 5/7 with the 7 coins.
 * The three workshop bridges and the store are each a CONVOY OF ONE BRIDGE: it is how the world gives a bridge a purse
 * (`story.convoys`, GAME_WORLD.md §2ter-1). The hooks receive the game and use its commands; they hold no mechanic.
 */
import {
  COINS,
  NUMBERS,
  andAr,
  cells,
  coinsLeft,
  counted,
  fracTex,
  gcd,
  ltr,
  markVerdict,
  pgcdTex,
  planksFill,
  planksOf,
  signChain,
  signTex,
} from './math';
import { THULUTH_BENCH, TUSU_BENCH } from './inquiries';

export { NUMBERS };
const { marahil: MA, ghayr: GH, thuluth: TH, tusu: TS, natija: NA, boss: BO } = NUMBERS;
const sum = (xs) => xs.reduce((n, x) => n + x, 0);
const NA_MARK = sum(NA.strokes);
const BO_MARK = sum(BO.strokes);
const BOSS_Q = BO.gap / BO.plank;

/** The four keys, in the order the story gives them. */
export const K = {
  marahil: 'ikhtizal-marahil',
  ghayr: 'ghayr-qabil',
  pgcd: 'ikhtizal-pgcd',
  natija: 'natija-mukhtazala',
};
const KEY_ORDER = [K.marahil, K.ghayr, K.pgcd, K.natija];

/**
 * The lesson's modules (its config keeps them as DATA: progress, the reports and the compass read their numbers) and the
 * keys their learning points need — P1 🪜, P2 🔒, P3 🎯, P4 🧾. `journey.test.js` checks this table against the config.
 * Modules 0 and 8 teach no learning point.
 */
export const MODULE_KEYS = {
  1: [K.marahil, K.ghayr],
  2: [K.ghayr, K.pgcd],
  3: [K.pgcd],
  4: [K.ghayr, K.natija],
  5: [K.marahil, K.ghayr, K.pgcd],
  6: [K.pgcd, K.natija],
  7: [K.ghayr, K.pgcd],
};
/**
 * The modules that are problems: 6 (a calculation, then its irreducible form — the last bridge's own ask) is done when
 * the store is paid; 5 and 7 by the story's end (`kit/storyEnd.js` marks every module).
 */
const PROBLEM_MODULES = ['5', '6', '7'];
const PROBLEM_MODULE = '6';
/** The key just sealed completes the modules that teach it and need nothing he does not hold yet. */
function completeModules(game, key) {
  const held = [...game.state.keys, key];
  for (const [m, keys] of Object.entries(MODULE_KEYS))
    if (!PROBLEM_MODULES.includes(m) && keys.includes(key) && keys.every((k) => held.includes(k))) game.onModule(m);
}
const missing = (game, key) => !game.state.keys.includes(key);

const ISLANDS = [
  { id: 'A', name: 'مرسى الفوانيس', R: 9.5, theme: 'meadow', turn: 0 },
  { id: 'B', name: 'جزيرة اللوز', R: 9, theme: 'meadow', turn: 0.35 },
  { id: 'C', name: 'جزيرة المرجان', R: 9.5, theme: 'crystal', turn: -0.35, feature: 'anvil' },
  { id: 'D', name: 'جزيرة التين', R: 9.5, theme: 'pine', turn: 0.3, feature: 'anvil' },
  { id: 'E', name: 'جزيرة الرمّان', R: 10, theme: 'autumn', turn: -0.3, feature: 'anvil' },
  { id: 'F', name: 'جزيرة القرنفل', R: 9.5, theme: 'stone', turn: 0.25 },
  { id: 'G', name: 'جزيرة الأقحوان', R: 9, theme: 'snow', turn: -0.25 },
  { id: 'H', name: 'مرفأ اللافتات', R: 12, theme: 'snow', turn: 0 },
];
/** The island whose mirror forges each key (its index in ISLANDS). */
const ISLAND_OF = { [K.marahil]: 1, [K.ghayr]: 2, [K.pgcd]: 4, [K.natija]: 5 };

/**
 * The workshop of an island: he TYPES the plank's length (1 … the whole gap), open from the start; `bench` — the
 * division notebook on the bridge's two numbers.
 */
const workshop = (max, bench) => ({ min: 1, max, open: true, typed: true, ...(bench ? { bench } : {}) });

const SEGMENTS = [
  {
    id: `m${MA.gap}`,
    kind: 'bridge',
    a: MA.gap,
    mark: MA.mark,
    len: 13,
    moulds: MA.moulds,
    predict: false,
    holdsWith: MA.plank,
  },
  {
    id: `m${GH.gap}`,
    kind: 'bridge',
    a: GH.gap,
    mark: GH.mark,
    len: 12.5,
    moulds: GH.moulds,
    predict: false,
    holdsWith: GH.plank,
  },
  {
    id: `m${TH.gap}`,
    kind: 'bridge',
    a: TH.gap,
    mark: TH.mark,
    len: 14,
    moulds: [],
    predict: false,
    holdsWith: TH.plank,
    convoy: 'thuluth',
    workshop: workshop(TH.gap, THULUTH_BENCH),
  },
  {
    id: `m${TS.gap}`,
    kind: 'bridge',
    a: TS.gap,
    mark: TS.mark,
    len: 20,
    moulds: [],
    predict: false,
    holdsWith: TS.plank,
    convoy: 'tusu',
    workshop: workshop(TS.gap, TUSU_BENCH),
  },
  {
    id: `m${NA.gap}`,
    kind: 'bridge',
    a: NA.gap,
    mark: NA_MARK,
    strokes: NA.strokes,
    len: 12.5,
    moulds: [],
    predict: false,
    holdsWith: NA.plank,
    convoy: 'natija',
    workshop: workshop(NA.gap, null),
  },
  { id: 'dash', kind: 'rail', len: 300 },
  {
    id: `m${BO.gap}`,
    kind: 'bridge',
    a: BO.gap,
    mark: BO_MARK,
    strokes: BO.strokes,
    len: 22,
    moulds: [],
    predict: false,
    holdsWith: BO.plank,
    convoy: 'marfa',
    boss: { options: BO.options, price: BO.price },
  },
];
/** The purse of each bridge that has one (a convoy of ONE bridge: how the world gives a bridge a purse). */
const CONVOYS = {
  thuluth: { purse: TH.purse },
  tusu: { purse: TS.purse },
  natija: { purse: NA.purse },
  marfa: { purse: BO.purse },
};

/** Equal fractions on the sign: `\frac{66}{78} = \frac{11}{13}` — from the planks that held, in his order. */
const signOf = (seg, held) => signTex(signChain(seg.a, seg.mark, held), seg.strokes ?? null);
/** The planks that held a bridge (`game.markSigns`, saved with the world) — [] on a game that has none. */
const heldOn = (game, seg) => {
  const s = game.markSigns;
  const list = s && typeof s === 'object' ? s[seg.id] : null;
  return Array.isArray(list) ? list : [];
};
/** How many writings A's sign holds beyond its cells: both planks of A that hold (2 and 6) → 2. */
const writings = (game) => new Set(heldOn(game, SEGMENTS[0])).size;
/** A key's mirror may open: 🪜 waits for both writings on A's sign; the others for nothing. */
const ready = (game, key) => key !== K.marahil || writings(game) >= MA.holders.length;
/**
 * The mirror to open on island k: the FIRST key he does not hold, if its island is k or behind him and it is ready —
 * the keys are forged in order, none skipped.
 */
function forgeAt(game, k) {
  const key = KEY_ORDER.find((x) => missing(game, x));
  if (!key || ISLAND_OF[key] > k || !ready(game, key)) return null;
  return key;
}

/** « 78 خانة، أوّل 66 منها مضاءة » — or, lit in two strokes, « 39 خانة، أُضيئت منها 5 ثمّ 8 ». */
const bridgeWords = (seg) =>
  seg.strokes
    ? `${seg.a} خانة، أُضيئت منها ${seg.strokes[0]} ثمّ ${seg.strokes[1]}`
    : `${seg.a} خانة، أوّل ${seg.mark} منها مضاءة`;
/** The rule of a marked bridge, said as what the world does (never as a rule of fractions). */
const HOLDS = 'يثبت الجسر إذا امتلأ ووقع عمود المصباح على فاصل بين لوحين.';
/** « لكلّ لوح قطعة، وفي الكيس 3 قطع. » */
const purseWords = (n) => `لكلّ لوح قطعة، وفي الكيس ${counted(n, COINS)}.`;

/** The story's own words, laid over the world's (`divisorIsles/strings.js`). */
const TEXT = {
  title: 'أرخبيل القواسم: لافتات الجسور',
  subtitle: `مرفأ اللافتات ينتظر جسرًا من ${BO.gap} خانة، أُضيء منها جزءان، ولافتة تكتب الجزء المضاء من الجسر كلّه. ابنِ مع «زيرو» جسور الطريق واقرأ لافتاتها.`,
  objective: {
    // island A: nothing in hand; planks of b in hand; the bridge standing with ONE writing; with both
    pickA: `خذ من هذه الجزيرة ألواحًا تبني الجسر: ${MA.gap} خانة، أوّل ${MA.mark} منها مضاءة، وعمود مصباح عند آخرها. ${HOLDS} أطوال الألواح ${andAr(MA.moulds)}.`,
    pickB: `خذ ألواحًا تبني الجسر: ${GH.gap} خانة، أوّل ${GH.mark} منها مضاءة. ${HOLDS} أطوال ألواح هذه الجزيرة ${andAr(GH.moulds)}.`,
    carry: (seg, b, left) =>
      `معك ألواح طولها ${b}: ابنِ بها الجسر (${bridgeWords(seg)}) عند منصّة الضوء. ${HOLDS}${left == null ? '' : ` ${purseWords(left)}`}`,
    // after the first hold on A: with 2, a shorter writing (a longer plank); with 6, the other plank that holds
    shorter: (tex) =>
      `اللافتة كتبت $${tex}$: الجزء المضاء نفسه، بالألواح. هل يُكتب بعدد أقلّ من الألواح؟ خذ لوحًا أطول من ألواح هذه الجزيرة وابنِ الجسر من جديد.`,
    other: (tex) =>
      `اللافتة كتبت $${tex}$. لوح آخر من ألواح هذه الجزيرة يثبت هذا الجسر أيضًا: خذه وابنِ الجسر من جديد، ثمّ قارن ما تكتبه اللافتة.`,
    crossA: (tex) => `اللافتة تكتب $${tex}$: الجزء المضاء نفسه بثلاث كتابات. اعبر إلى «${ISLANDS[1].name}».`,
    backA: `ارجع إلى منصّة الضوء في «${ISLANDS[0].name}»: ابنِ جسرها بلوح آخر من ألواحها يثبت أيضًا، ثمّ اقرأ لافتة الجسر.`,
    // a workshop bridge, nothing in hand
    make: (seg, left) =>
      `اصنع في ورشة هذه الجزيرة لوحًا يبني الجسر: ${bridgeWords(seg)}. ${HOLDS} ${purseWords(left)}${seg.workshop?.bench ? ' وفي الورشة دفتر.' : ''}`,
    board: `اركب لوح الضوء نحو «${ISLANDS[6].name}»`,
    bossGo: `اذهب إلى المنصّة المضيئة: جسر المرفأ ${BO.gap} خانة، أُضيئت منها ${BO.strokes[0]} ثمّ ${BO.strokes[1]}. اختر ألواحًا تكتب لافتته على الشكل غير القابل للاختزال، وفي الكيس ${counted(BO.purse, COINS)}.`,
    bossCross: 'جسر المرفأ ثابت — اعبر إلى مرفأ اللافتات!',
    end: 'وصلتَ المرفأ',
  },
  say: {
    hello: `أنا زيرو! جسر من ${MA.gap} خانة، أوّل ${MA.mark} منها مضاءة، وعمود مصباح عند آخرها. اختر ألواحًا من هذه الجزيرة، ثمّ تعال إلى منصّة الضوء واقرأ لافتة الجسر.`,
    // a bridge of A held: what its sign writes now
    firstWriting: (tex) => `الجسر ثابت، والعمود على فاصل! اللافتة كتبت $${tex}$.`,
    twoWritings: (tex) => `اللافتة تكتب الآن $${tex}$: الجزء المضاء لم يتغيّر، تغيّرت كتابته فقط.`,
    backA: `قبل المرآة: ارجع إلى «${ISLANDS[0].name}» وابنِ جسرها بلوح آخر من ألواحها يثبت أيضًا.`,
    // what waits on the next island (said once the tablet before is closed, or on arrival)
    ghayr: `جسر جديد: ${GH.gap} خانة، أوّل ${GH.mark} منها مضاءة. هل تُكتب لافتته بعدد أقلّ من الألواح؟ جرّب ألواح هذه الجزيرة.`,
    holdB: (tex) =>
      `اللوح ${GH.plank} ثبّت الجسر: ${counted(GH.mark, ['لوح واحد', 'لوحان', 'ألواح مضاءة', 'لوحًا مضاءً'])} من ${GH.gap}، واللافتة بقيت $${tex}$.`,
    thuluth: `جسر جديد: ${TH.gap} خانة، أوّل ${TH.mark} منها مضاءة، وفي الكيس ${counted(TH.purse, COINS)} فقط. اصنع لوحك في ورشة هذه الجزيرة.`,
    tusu: `جسر أطول: ${TS.gap} خانة، أوّل ${TS.mark} منها مضاءة، وفي الكيس ${counted(TS.purse, COINS)}. اصنع لوحك في ورشة هذه الجزيرة.`,
    natija: `آخر جسور الورش: ${NA.gap} خانة، أُضيئت على مرّتين: ${cells(NA.strokes[0])} ثمّ ${cells(NA.strokes[1])}. وفي الكيس ${counted(NA.purse, COINS)}.`,
    // a workshop bridge held: how many planks, the coins left, the sign
    holdShop: (a, b, left, tex) =>
      `${planksFill(a / b, b)} ${a} خانة، والعمود على فاصل، ${coinsLeft(left)}. اللافتة: $${tex}$.`,
    f: 'لوح الضوء جاهز. اقرأ الجملة واعبر من البوّابة التي تحقّقها.',
    boss: `ها هو جسر المرفأ: ${BO.gap} خانة، أُضيئت منها ${BO.strokes[0]} ثمّ ${BO.strokes[1]}، وفي الكيس ${counted(BO.purse, COINS)}. في المخزن نوعان من الألواح: ${BO.options[0]} و ${BO.options[1]}.`,
    bossOk: `${planksOf(BOSS_Q, BO.plank)}: الجسر ثابت، والعمود على فاصل. اللافتة: $${signTex(signChain(BO.gap, BO_MARK, [BO.plank]), BO.strokes)}$.`,
    end: 'وصل الجسر إلى مرفأ اللافتات، ولافتته على الشكل غير القابل للاختزال. شكرًا لك!',
  },
  /** The workshop's notebook: one name for the two benches. */
  workshop: {
    bench: 'دفتر الورشة',
    benchSub: 'الدفتر يكتب قسمات العددين، واللوح تختاره أنت',
  },
  /** The card on the right (kit/Instruction.jsx › Recall): what matters from the island before. */
  recall: {
    sign: (tex) => `لافتة الجسر: $${tex}$`,
    // what a plank did on a marked bridge (`didOf`)
    plank: (b, did) =>
      did === 'holds'
        ? `اللوح ${b}: ثبّت الجسر`
        : did === 'post'
          ? `اللوح ${b}: ملأ الجسر، والعمود في وسط لوح`
          : did === 'coins'
            ? `اللوح ${b}: لم تكفِ القطع`
            : `اللوح ${b}: لم يملأ الجسر`,
  },
  boss: {
    title: 'مخزن مرفأ اللافتات',
    mission: `المهمّة: جسر المرفأ ${BO.gap} خانة، أُضيئت منها ${BO.strokes[0]} ثمّ ${BO.strokes[1]}. لافتته تكتب الجزء المضاء على الشكل غير القابل للاختزال، وفي الكيس ${counted(BO.purse, COINS)}، قطعة لكلّ لوح. اختر الألواح، ابنِ الجسر، ثمّ ادفع ثمنها.`,
    choose: `أيّ ألواح تكتب لافتة الجسر على الشكل غير القابل للاختزال؟ احسب في كرّاسك قبل أن تختار.`,
    mould: (b) => `ألواح طولها ${b}`,
    steps: ['اختر الألواح واحسب', 'ابنِ الجسر', 'ادفع الثمن'],
    price: `ثمن اللوح الواحد: ${BO.price} دج`,
    divide: (b) => `الألواح ${b} على الجسر كلّه: كم لوحًا يدخل في ${BO.gap} خانة؟ وكم خانة تبقى؟`,
    qLabel: 'عدد الألواح',
    change: 'أغيّر الألواح',
    unit: 'دج',
    costAsk: (b, q) => `الجسر ثابت: ${planksOf(q, b)}. ثمن اللوح الواحد ${BO.price} دج. كم تدفع للمخزن؟`,
    err: {
      nan: 'اكتب العددين معًا: عدد الألواح، والخانات الباقية.',
      long: (b, q) => `${planksOf(q, b)}: $${b} \\times ${q} = ${b * q}$ خانة، أطول من الجسر (${BO.gap} خانة)!`,
      sum: (b, q, r) => `تحقّق: $${b} \\times ${q} + ${r} = ${b * q + r}$، والجسر ${BO.gap} خانة.`,
      big: (b, r) => `بقيت ${cells(r)}: ما زال هناك مكان للوح آخر طوله ${b}. الباقي يجب أن يكون أصغر من ${b}.`,
      cost: (n) => `${n} دج ليس الثمن الصحيح. احسب: عدد الألواح × ثمن اللوح الواحد.`,
    },
  },
  end: { text: 'وصلتَ مرفأ اللافتات، وصنعتَ مفاتيح المعرفة الأربعة بنفسك.' },
};

/** What a plank b did on a marked bridge (with its purse): it held, it missed the post, the coins, or it did not fill. */
export function didOf(seg, b, purse = Infinity) {
  const v = markVerdict(seg.a, seg.mark, b);
  if (v.q > purse) return 'coins';
  if (!v.fills) return 'open';
  return v.joint ? 'holds' : 'post';
}
/** The planks he fired on a bridge, in the order he first tried them (the last two): never the mirror's. */
function triedOn(game, a) {
  const order = [];
  for (const x of game.log ?? []) if (x.a === a && !x.mirror && !order.includes(x.b)) order.push(x.b);
  return order.slice(-2);
}

const pgcdWave = (n, d, gates, side) => ({
  say: `${side === 'n' ? 'بسط' : 'مقام'} $${fracTex(n, d)}$ على الشكل غير القابل للاختزال`,
  gates,
  test: (x) => x === (side === 'n' ? n : d) / gcd(n, d),
});
/** « $\frac{34}{46} = \frac{17}{\square}$ »: the numerator divided, the denominator by the same number. */
const stageWave = (n, d, k, gates, side) => ({
  say:
    side === 'd'
      ? `$${fracTex(n, d)} = ${fracTex(n / k, '\\square')}$`
      : `$${fracTex(n, d)} = ${fracTex('\\square', d / k)}$`,
  gates,
  test: (x) => x === (side === 'd' ? d / k : n / k),
});
/** « بسط يجعل $\frac{\square}{26}$ غير قابل للاختزال »: a gate is right when it is coprime with the number shown. */
const coprimeWave = (n, side, gates) => ({
  say:
    side === 'n'
      ? `بسط يجعل $${fracTex('\\square', n)}$ غير قابل للاختزال`
      : `مقام يجعل $${fracTex(n, '\\square')}$ غير قابل للاختزال`,
  gates,
  test: (x) => x >= 1 && gcd(x, n) === 1,
});
/** « $\frac{23}{36} - \frac{11}{36} = \frac{1}{\square}$ »: the result, reduced. */
const resultWave = (x, op, y, n, gates) => {
  const s = op === '+' ? x + y : x - y;
  const g = gcd(s, n);
  return {
    say: `$${fracTex(x, n)} ${op} ${fracTex(y, n)} = ${fracTex(s / g, '\\square')}$`,
    gates,
    test: (v) => v === n / g,
  };
};
/**
 * The gate dash (after island F: the four keys are forged): one sentence, three gates, exactly one right. Mental
 * arithmetic — every number at most 100 — and every pair checked with `lesson-bank-numbers.mjs` (CLEAR). Each wrong
 * gate is a real mistake: the denominator not divided, a writing that still reduces, the denominators added.
 */
const DASH_WAVES = [
  stageWave(34, 46, 2, [23, 46, 29], 'd'),
  coprimeWave(26, 'n', [15, 39, 12]),
  pgcdWave(36, 60, [5, 10, 15], 'd'),
  resultWave(17, '+', 11, 30, [15, 30, 60]),
  stageWave(45, 75, 3, [15, 45, 5], 'n'),
  coprimeWave(10, 'd', [27, 24, 35]),
  pgcdWave(56, 98, [4, 28, 8], 'n'),
  resultWave(23, '-', 11, 36, [3, 36, 12]),
];

/** The tablet of each rule: its name comes AFTER the student forged it. `notes` are plain text (no formula). */
export const TABLETS = {
  [K.marahil]: {
    icon: '🪜',
    title: 'نختزل كسرًا على مراحل',
    lines: [
      'نختزل كسرًا بقسمة بسطه ومقامه على قاسم مشترك لهما: نحصل على كسر يساويه، بعددين أصغر.',
      `ونعيد ما دام لهما قاسم مشترك غير 1: $${signTex(signChain(MA.gap, MA.mark, MA.holders))}$.`,
    ],
    math: [`${MA.mark} = 2 \\times 3 \\times 11`, `${MA.gap} = 2 \\times 3 \\times 13`],
    notes: [
      `اللوح 2 ثمّ اللوح 6: الجزء المضاء ${MA.mark} من ${MA.gap} خانة، ثمّ ${MA.mark / 2} لوحًا من ${MA.gap / 2}، ثمّ ${MA.mark / 6} من ${MA.gap / 6}.`,
    ],
  },
  [K.ghayr]: {
    icon: '🔒',
    title: 'كسر غير قابل للاختزال',
    lines: [
      'نقول إنّ الكسر غير قابل للاختزال إذا كان بسطه ومقامه أوّليّين فيما بينهما: قاسمهما المشترك الوحيد هو 1.',
      `مثل $${fracTex(GH.mark, GH.gap)}$: لا يُكتب بعددين أصغر.`,
    ],
    math: [`${pgcdTex(GH.mark, GH.gap)} = ${gcd(GH.mark, GH.gap)}`],
    notes: [
      `اللوح 3 ملأ ${GH.gap} خانة، لكنّ العمود وقع في وسط لوح: ${ltr(`${GH.mark} = 3 × ${Math.floor(GH.mark / 3)} + ${GH.mark % 3}`)}`,
    ],
  },
  [K.pgcd]: {
    icon: '🎯',
    title: 'نختزل بالقاسم المشترك الأكبر',
    lines: [
      'نقسم البسط والمقام على قاسمهما المشترك الأكبر: نحصل مباشرةً على الكسر غير القابل للاختزال.',
      `مثل: $${fracTex(TH.mark, TH.gap)} = ${fracTex(`${TH.mark} \\div ${TH.plank}`, `${TH.gap} \\div ${TH.plank}`)} = ${fracTex(TH.mark / TH.plank, TH.gap / TH.plank)}$.`,
    ],
    math: [
      `${pgcdTex(TH.mark, TH.gap)} = ${gcd(TH.mark, TH.gap)}`,
      `${pgcdTex(TS.mark, TS.gap)} = ${gcd(TS.mark, TS.gap)}`,
    ],
    notes: [
      `اللوح ${TS.plank} بنى الجسر بـ ${counted(TS.purse, COINS)}: ${ltr(`${TS.gap} = ${TS.plank} × ${TS.gap / TS.plank}`)}`,
    ],
  },
  [K.natija]: {
    icon: '🧾',
    title: 'نختزل نتيجة الحساب',
    lines: [
      'نُجري الحساب أوّلًا، ثمّ نكتب الكسر الناتج على الشكل غير القابل للاختزال: نقسم بسطه ومقامه على قاسمهما المشترك الأكبر.',
      `مثل: $${signTex(signChain(NA.gap, NA_MARK, [NA.plank]), NA.strokes)}$.`,
    ],
    math: [`${NA.strokes[0]} + ${NA.strokes[1]} = ${NA_MARK}`, `${pgcdTex(NA_MARK, NA.gap)} = ${gcd(NA_MARK, NA.gap)}`],
    notes: [
      `الضربتان أضاءتا ${cells(NA_MARK)}، واللوح ${NA.plank} بنى الجسر بـ ${counted(NA.purse, COINS)}: ${ltr(`${NA.gap} = ${NA.plank} × ${NA.gap / NA.plank}`)}`,
    ],
  },
};

export const STORY = {
  islands: ISLANDS,
  segments: SEGMENTS,
  dashWaves: DASH_WAVES,
  text: TEXT,
  /** The purses: a coin per plank, whatever its length (each a convoy of one bridge). */
  convoys: CONVOYS,

  /**
   * The WHOLE instruction of the moment (it stays on screen): the bridge — its cells, its lit stretch, when it holds —
   * the planks of the island or its workshop, the purse; on A, after a hold, what the sign wrote and what to do next;
   * on B, the way back to A while the sign of A holds one writing. null: the world's own (the rail, the store).
   */
  objective(game, seg) {
    const o = game.T.objective;
    if (seg.kind !== 'bridge' || seg.boss) return null;
    const b = game.state.held;
    const i = game.segs.indexOf(seg);
    if (i === 0) {
      if (!seg.complete) return b == null ? o.pickA : o.carry(seg, b, null);
      const held = heldOn(game, seg);
      const tex = signOf(seg, held);
      if (writings(game) >= MA.holders.length) return o.crossA(tex);
      return held[0] === Math.min(...MA.holders) ? o.shorter(tex) : o.other(tex);
    }
    // the way back to A: its sign holds one writing, or the bridge he rebuilt there fell
    if (i === 1 && !seg.complete && (!game.segs[0].complete || !ready(game, K.marahil))) return o.backA;
    if (seg.complete) return null;
    if (i === 1) return b == null ? o.pickB : o.carry(seg, b, null);
    const left = game.purseOf?.(seg)?.left ?? CONVOYS[seg.convoy]?.purse ?? null;
    return b == null ? o.make(seg, left) : o.carry(seg, b, left);
  },
  /** The card on the right: the sign of the bridge just crossed, and what his last planks did there. */
  recall(game, k) {
    const R = game.T.recall;
    const before = game.segs[k - 1];
    if (!before || before.kind !== 'bridge' || !before.mark || before.boss) return null;
    const purse = CONVOYS[before.convoy]?.purse ?? Infinity;
    return [
      R.sign(signOf(before, heldOn(game, before))),
      ...triedOn(game, before.a).map((b) => R.plank(b, didOf(before, b, purse))),
    ];
  },

  /** What the story does on arriving at island k. No rule is told: each one is forged in the mirror of an island. */
  onArrive(game, k) {
    const { say } = game.T;
    const key = forgeAt(game, k);
    if (key) {
      game.openForge(key);
      return;
    }
    // 🪜 still waits for the second writing of A's sign: back to A
    if (k >= ISLAND_OF[K.marahil] && missing(game, K.marahil)) {
      game.say(say.backA, 9);
      return;
    }
    if (k === 3) game.say(say.tusu, 9);
    if (k === 6) game.say(say.boss, 10);
  },
  /** What the story does once the tablet of a key is closed: the modules it completes are done, then the road goes on. */
  afterKey: {
    [K.marahil]: (game) => {
      completeModules(game, K.marahil);
      game.say(game.T.say.ghayr, 9);
    },
    [K.ghayr]: (game) => {
      completeModules(game, K.ghayr);
      game.say(game.T.say.thuluth, 9);
    },
    [K.pgcd]: (game) => {
      completeModules(game, K.pgcd);
      game.say(game.T.say.natija, 9);
    },
    [K.natija]: (game) => {
      game.flags.key4 = true;
      completeModules(game, K.natija);
      game.refreshObjective();
      game.say(game.T.say.f, 8);
      game.save();
    },
  },
  /** The forge the story is waiting for, when the page was closed in front of its mirror. */
  pendingForge(game) {
    return forgeAt(game, game.state.stage);
  },
  /** A bridge held: the story's own sentence — what its sign writes now. The store's own is the world's (bossOk). */
  onHold(game, seg, b) {
    const { say } = game.T;
    const i = game.segs.indexOf(seg);
    const tex = signOf(seg, heldOn(game, seg));
    if (i === 0) {
      if (writings(game) < MA.holders.length) {
        game.say(say.firstWriting(tex), 9);
        return true;
      }
      game.say(say.twoWritings(tex), 9);
      // rebuilt from behind (he had crossed with one writing): the mirror of B opens now
      if (game.state.stage > 0 && missing(game, K.marahil)) game.openForge(K.marahil);
      return true;
    }
    if (i === 1) {
      game.say(say.holdB(tex), 9);
      return true;
    }
    if (!seg.convoy) return false;
    game.say(say.holdShop(seg.a, b, game.purseOf?.(seg)?.left ?? 0, tex), 10);
    return true;
  },
  // the last bridge is the lesson's problem (module 6: a calculation, then its result in irreducible form)
  onBossPaid: (game) => game.onModule(PROBLEM_MODULE),
};
