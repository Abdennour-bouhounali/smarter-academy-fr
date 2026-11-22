/**
 * THE FIVE FORGES of lesson « البحث عن القاسم المشترك الأكبر لعددين طبيعيين » — one per key, in the order of the story; no
 * rule of this lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js, forgeParts.jsx). Four keys are
 * MET ON THE ISLANDS (owner, 2026-11-19; GAME_WORLD.md §2ter-1; BATCH_2_DESIGN.md §7 « Lesson 6 — the road as it is
 * built »): those forges have no `inquiry`, their evidence is what he did there (`evidence(log)`, the world's log of
 * bridges `[{ a, b }]`), `predictCases` returns none and the kit opens them on their TILES. Forge 🧮 KEEPS its experiment
 * in the mirror (`ladder` / `fold`, inquiries.js › FOLD_INQUIRY). Then the mirror tests his rule on his rows, attacks it,
 * he seals it, USES it in a last step, and only then the tablet names it.
 *
 *   farq-yabqi            ➖ island D — convoy « diff » (152, 95, then 57 = 152 − 95; the planks 8, 19, 5, 3 offered): WHEN
 *                         a plank builds the longer and the shorter gap together — it builds every gap of [the shorter and
 *                         the difference] — 2 slots, 8 rules. The island's planks refute three wrong rules each on his own
 *                         row: 8 fills the longer alone, 5 the shorter alone, 3 the difference alone.
 *   khawarizmiyat-al-tarh 🪜 island F — convoy « tarh » (259 and 185, 12 coins; the bench: the subtraction notebook): the
 *                         PROCEDURE that tells which plank to make — the next pair, when he stops, which number is the
 *                         plank — 3 slots, 12 rules
 *   baqi-yabqi            🧮 island F, after 🪜 — the fold of 962 and 296 in the mirror: WHEN a plank builds both gaps —
 *                         it builds [the shorter and the remainder's gap]; and a gap of 0 cells — 2 slots, 8 rules
 *   iqlidis               🔁 island H — convoy « iqlidis » (1833 and 546, 61 coins; the bench: the division notebook): the
 *                         PROCEDURE by divisions — 3 slots, 18 rules
 *   aqall-khutuwat        ⏱️ island J — convoy « sibaq » (1003 and 34, 61 coins; the bench: both notebooks, 31 rows
 *                         against 2): how many rows of subtractions ONE division gathers, and which notebook he chooses —
 *                         2 slots, 12 rules
 * A case of ➖, 🧮, 🪜 and 🔁 is ONE plank d asked of a PAIR of gaps A and B (`pair`, drawn as two bridges). For ➖ and 🧮
 * what the world does (`held`) is « d builds both » — the drawing shows it; for 🪜 and 🔁 d must also be paid by the purse
 * (`purse` = A ÷ g + B ÷ g, g the longest plank of both: `held` is d = g, as in lesson 5). A case of ⏱️ is a pair of
 * numbers and a question about its two notebooks, drawn as its first row: the gap A with the planks of B laid at once.
 * In each forge exactly ONE rule holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by a
 * computed case — on his rows, or by the first new case where it breaks (`firstBreak`), also when he made the right
 * plank at once. The words of a key's name never appear in its forge before its last step (tested).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  byId,
  differenceBox,
  divisionRow,
  fills,
  firstBreak,
  fromLog,
  gather,
  givenDivision,
  hard,
  lazy,
  noPredictions,
  options,
  pairKey,
  pairPool,
  pgcdBox,
  pgcdPairBox,
  plankCase,
  subtractionRow,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { BRIDGE_TEXT, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { FOLD_INQUIRY } from './inquiries';
import {
  COINS,
  DIVISIONS_GEN,
  NUMBERS,
  PLANKS_ACC,
  ROWS_ACC,
  SUBTRACTIONS_GEN,
  counted,
  differences,
  divisionTex,
  euclid,
  gcd,
  range,
} from './math';

const coins = (n) => counted(n, COINS);
const fillWord = (yes) => (yes ? 'يملأ' : 'لا يملأ');

/**
 * The pairs this lesson's exercise bank names (content/practice/4am/bahth-pgcd): the mirror never draws one of them
 * (`forges.test.js` reads the bank as `story.test.js` does and checks this list against it).
 */
export const BANK_PAIRS = new Set(
  (
    '14;21 18;24 30;45 32;60 39;135 42;60 48;84 54;78 60;84 63;110 70;98 84;114 87;203 88;165 91;117 99;135 105;240 ' +
    '120;156 140;220 190;247 195;285 210;301 270;378 300;460 315;1005 336;480 392;1078 406;696 441;770 448;567 ' +
    '507;1352 528;1188 560;595 637;1001 690;966 714;935 812;1392 832;1053 836;1938 845;936 932;1631 945;1215 ' +
    '945;1386 5858;6767 19251;22816 21957;43351'
  ).split(' '),
);
const notInBank = (A, B) => !BANK_PAIRS.has(pairKey(A, B));

// ───────────────────────── the words of a plank asked of two gaps (➖, 🧮) ─────────────────────────

/** What the world answers: does the plank build both gaps? (`c` names them) */
const both = (c, yes) => (yes ? `يبني ${c.A} و ${c.B} معًا` : `لا يبني ${c.A} و ${c.B} معًا`);
const TOGETHER = {
  yes: 'يبنيهما معًا',
  no: 'لا يبنيهما',
  testing: 'المرآة تمرّ على الألواح، وتسأل قاعدتك عن كلّ لوح…',
  says: (yes) => `قاعدتك: ${yes ? 'يبنيهما معًا' : 'لا يبنيهما'}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ اللوح ${m.d} ${m.says ? 'يبني' : 'لا يبني'} ${m.A} و ${m.B} معًا — لكنّ ${
      m.held ? `اللوح ${m.d} بناهما معًا` : `اللوح ${m.d} لا يملأ ${m.fa ? m.B : m.A}`
    }.`,
  fire: 'ضع اللوح',
  survived: 'صمدت قاعدتك: الجسران فعلا ما قالته.',
  broken: (yes) =>
    `قاعدتك انكسرت هنا: قالت « ${yes ? 'يبنيهما معًا' : 'لا يبنيهما'} »، والجسران قالا « ${yes ? 'لا يبنيهما' : 'يبنيهما معًا'} ».`,
  log: 'ألواح على هوّتين',
};
/** « كلّ هوّة من … » / « هوّة واحدة على الأقلّ من … »: the gaps a rule looks at, and how many it wants built. */
const ALL = (gaps, built) => gaps.every(built);

// ───────────────────────── 1. ➖ « الفرق يحفظ الألواح المشتركة » — the gap of the difference ─────────────────────────
// Islands A–D were the experiment (convoy « diff »): the planks of island A build THREE bridges, 152, 95, then 57 — told
// to be the first minus the second. 19 builds the three; 8 fills 152 only, 5 fills 95 only, 3 fills 57 only. A case is
// ONE plank on the two gaps A > B; the rule says when it builds both, looking at other gaps (the difference D = A − B).

const [D1, D2, D3] = NUMBERS.diff.gaps;
const farqCase = (A, B, d) => {
  const D = A - B;
  const fa = fills(A, d);
  const fb = fills(B, d);
  const held = fa && fb;
  return {
    of: 'farq',
    A,
    B,
    D,
    d,
    fa,
    fb,
    fd: fills(D, d),
    fits: held,
    held,
    laid: Math.max(Math.floor(A / d), Math.floor(B / d)),
    pair: { a: A, b: B, d },
    tag: held ? TOGETHER.yes : TOGETHER.no,
  };
};
const farqId = (c) => `farq:${c.A}:${c.B}:${c.d}`;
/** How many of the gaps he looks at the plank must build. */
const F_HOW = [
  { id: 'all', label: 'كلّ هوّة من', test: ALL },
  { id: 'one', label: 'هوّة واحدة على الأقلّ من', test: (gaps, built) => gaps.some(built) },
];
/** Which gaps he looks at. */
const F_LOOK = [
  { id: 'pair', label: 'الأقصر وهوّة الفرق', of: (c) => [c.B, c.D] },
  { id: 'diff', label: 'هوّة الفرق وحدها', of: (c) => [c.D] },
  { id: 'short', label: 'الأقصر وحدها', of: (c) => [c.B] },
  { id: 'long', label: 'الأطول وحدها', of: (c) => [c.A] },
];
const FH = byId(F_HOW);
const FL = byId(F_LOOK);
const farqSays = (rule, c) => FH[rule.how].test(FL[rule.look].of(c), (n) => fills(n, c.d));
const isFarqRule = (rule) => rule?.how === 'all' && rule?.look === 'pair';
/** Small pairs A > B a mirror can draw (A ≤ 60), every plank whose two bridges it can lay; never a pair of the bank. */
const FARQ_POOL = pairPool({
  A: [12, 60],
  B: (a) => [4, a - 1],
  d: (a) => [2, a],
  make: farqCase,
  exclude: BANK_PAIRS,
});
/** The last step: a new pair whose shorter number is a multiple of the difference (its plank is then the difference). */
const FARQ_USE = [
  [92, 69],
  [129, 86],
  [177, 118],
];

const farqForge = {
  key: 'farq-yabqi',
  slots: [
    { id: 'how', label: 'كم هوّة؟', options: options(F_HOW) },
    { id: 'look', label: 'أيّ هوّات؟', options: options(F_LOOK) },
  ],
  says: farqSays,
  isTheRule: isFarqRule,
  ruleText: (rule) =>
    `يبني اللوح الهوّتين الأطول والأقصر معًا عندما يبني ${FH[rule.how].label} ${FL[rule.look].label}.`,
  explain(rule, c) {
    const gaps = FL[rule.look].of(c);
    const facts = gaps.map((g, i) => `${i ? '، و' : ''}${fillWord(fills(g, c.d))} ${g}`).join('');
    return `هوّة الفرق ${c.D}. اللوح ${c.d} ${facts}: قاعدتك تقول إنّه ${both(c, farqSays(rule, c))}.`;
  },
  caseId: farqId,
  // every plank he fired on the three gaps is one case of 152 and 95; he crossed the three with the plank 19: island D
  // cannot be reached otherwise
  evidence: fromLog({
    of: 'farq',
    gaps: NUMBERS.diff.gaps,
    make: farqCase,
    lived: [NUMBERS.diff.plank],
    caseId: farqId,
  }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isFarqRule(rule)) return firstBreak(FARQ_POOL(), rule, rows, farqSays, farqId);
    // the difference is longer than the shorter gap here: 14 fills it alone; 6 builds the three
    return hard(rows, [farqCase(66, 24, 14), farqCase(66, 24, 6)], farqId);
  },
  // never a choice between two written rules: two more planks on a pair, one that builds both and one that does not
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [farqCase(39, 15, 3), farqCase(39, 15, 8)] };
    if (n === 2) return { kind: 'experiment', cases: [farqCase(50, 20, 10), farqCase(50, 20, 15)] };
    return { kind: 'experiment', cases: [farqCase(42, 30, 6), farqCase(42, 30, 7)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)(FARQ_USE);
      return { A, B, D: A - B, g: gcd(A, B), held: true };
    },
    lines: (c) => [differenceBox(c.A, c.B), pgcdPairBox(c.A, c.B), pgcdBox(c.A, c.B)],
    check(c, vals) {
      if (Number(vals.d) !== c.D) return 'diff';
      if (Number(vals.p) !== c.D) return 'pair';
      return Number(vals.g) === c.g ? 'ok' : 'pgcd';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    ...TOGETHER,
    title: 'مرآة جزيرة القصب',
    frame: 'يبني اللوح الهوّتين الأطول والأقصر معًا عندما يبني:',
    buildLead: `اختر بطاقة من كلّ عمود: متى يبني لوحٌ الهوّتين الأطول والأقصر معًا؟ المرآة ستجرّب قاعدتك على ألواح الهوّات ${D1} و ${D2} و ${D3}.`,
    agreed: 'قاعدتك توافق الألواح التي جرّبتَها. الآن المرآة تتحدّاها بهوّتين أخريين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}، وهوّة فرقهما ${c.D}. اللوح ${c.d}: هل يبني ${c.A} و ${c.B} معًا؟ ماذا تقول قاعدتك؟`,
    eq: (c) =>
      `$${divisionTex(c.A, c.d)} \\qquad ${divisionTex(c.B, c.d)} \\qquad ${c.A} - ${c.B} = ${divisionTex(c.D, c.d)}$`,
    wordsHint: 'مثال: يبني اللوح الهوّتين عندما…',
    experiment: 'انظر جيّدًا: هوّتان وهوّة فرقهما، ولوحان. ماذا يفعل كلّ لوح في الهوّات الثلاث؟',
    tryKey: (c) => `المرآة لا تبني: اكتب فرق العددين ${c.A} و ${c.B}، ثمّ أكمل المساواتين.`,
    use: {
      diff: 'تحقّق من الطرح: العدد الأكبر ناقص العدد الأصغر.',
      pair: 'في الزوج الجديد: العدد الأصغر، وفرق العددين.',
      pgcd: 'انظر إلى الزوج الجديد: أحد عدديه يقسم الآخر.',
    },
    useOk: 'كتبتَ الفرق، وصار الزوج أصغر دون أن يتغيّر جوابه: مفتاحك يعمل!',
  },
};

// ───────────────────────── a plank, a pair of gaps and a purse (🪜, 🔁 — as lesson 5) ─────────────────────────

/** A case of 🪜 and 🔁: the plank d on the gaps A and B with the coins of the purse (`plankCase`: `held` is d = PGCD). */
const plankId = (c) => `${c.of}:${c.A}:${c.B}:${c.d}`;
const twoDivisions = (A, B, d) => `${divisionTex(A, d)} \\qquad ${divisionTex(B, d)}`;
/** What the world answers, in words: does the plank build both bridges with the coins of the purse? */
const builds = (yes) => (yes ? 'يبنيهما بقطع الكيس' : 'لا يبنيهما بقطع الكيس');
/** Why the world did what it did with a case (a plain sentence: the screen does not render it as a formula). */
const why = (c) =>
  c.held
    ? `اللوح ${c.d} بناهما بقطع الكيس كلّها: ${coins(c.need)}`
    : !c.fits
      ? `اللوح ${c.d} لا يملأ ${c.fa ? c.B : c.A}`
      : `اللوح ${c.d} يحتاج ${counted(c.need, PLANKS_ACC)}، وفي الكيس ${coins(c.purse)}`;
/** Small pairs A < B ≤ 60 a mirror can draw (never a pair of the bank), every plank whose bridges it can lay. */
const pursePool = (of) =>
  pairPool({
    A: [6, 40],
    B: (a) => [a + 1, 60],
    d: (a, b) => [1, b],
    make: (A, B, d) => plankCase(of, A, B, d),
    exclude: BANK_PAIRS,
  });
/** The words of a procedure forge (a plank on two gaps, with a purse). */
const PURSE_TEXT = {
  ...BRIDGE_TEXT,
  yes: builds(true),
  no: builds(false),
  eq: (c) =>
    c.fits && !c.held
      ? `$${twoDivisions(c.A, c.B, c.d)} \\qquad ${c.A} = ${c.g} \\times ${c.A / c.g} \\qquad ${c.B} = ${c.g} \\times ${c.B / c.g}$`
      : `$${twoDivisions(c.A, c.B, c.d)}$`,
  testing: 'المرآة تمرّ على الألواح التي صنعتَها، وتسأل قاعدتك عن كلّ لوح…',
  says: (yes) => `قاعدتك: ${builds(yes)}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ اللوح ${m.d} ${m.says ? 'يبني' : 'لا يبني'} جسري ${m.A} و ${m.B} بقطع الكيس — لكنّ ${why(m)}.`,
  agreed: 'قاعدتك توافق كلّ الألواح التي صنعتَها. الآن المرآة تتحدّاها بهوّتين أخريين.',
  attack: (c) =>
    `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}، وفي الكيس ${coins(c.purse)}. اللوح ${c.d}: هل يبنيهما بقطع الكيس؟ ماذا تقول قاعدتك؟`,
  fire: 'ضع اللوح',
  survived: 'صمدت قاعدتك: الكيس والجسران فعلوا ما قالته.',
  broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${builds(yes)} »، والجسران قالا « ${builds(!yes)} ».`,
  log: 'ألواح صنعتَها',
  experiment: 'انظر جيّدًا: هوّتان ولوحان، والكيس لا يكفي إلّا لواحد منهما. ماذا يفعل كلّ لوح؟',
};
/** The words that say what a procedure made of two gaps (a plain sentence). */
const madeText = (A, B, made, n, after) =>
  made == null
    ? `قاعدتك لا تتوقّف على ${A} و ${B}: تعود إلى زوج كتبَته من قبل، فلا تصنع أيّ لوح`
    : `قاعدتك تصنع للهوّتين ${A} و ${B} اللوح ${made}، بعد ${counted(n, after)}`;

// ───────────────────────── 2. 🪜 « خوارزمية الفروق » — the procedure by subtractions ─────────────────────────
// Islands D–F were the experiment (convoy « tarh »): no plank offered, the workshop where he types its length, the
// purse of 12 coins that only 37 pays (7 + 5), and the bench: the subtraction notebook of 259 and 185 (5 rows, ending
// (37 ; 37) → 0). His evidence: every plank he made for 259 and 185.

const [T1, T2] = NUMBERS.tarh.gaps;
const tarhCase = (A, B, d) => plankCase('tarh', A, B, d);
/** What a procedure of subtractions does with two gaps: its differences, in order, and the plank it makes (null: never). */
function tarhRun(rule, A, B) {
  let [x, y] = [Math.max(A, B), Math.min(A, B)];
  const diffs = [];
  const seen = new Set();
  for (;;) {
    if (seen.has(`${x}:${y}`)) return { diffs, made: null };
    seen.add(`${x}:${y}`);
    const v = x - y;
    diffs.push(v);
    if (v === 0 || (rule.stop === 'less' && v < y)) break;
    [x, y] = rule.next === 'sd' ? [Math.max(y, v), Math.min(y, v)] : [Math.max(x, v), Math.min(x, v)];
  }
  const nonZero = diffs.filter((v) => v > 0);
  const made = { last: nonZero.at(-1) ?? Math.min(A, B), first: diffs[0], count: diffs.length }[rule.make];
  return { diffs, made };
}
const T_NEXT = [
  { id: 'sd', label: 'الأقصر والفرق' },
  { id: 'ld', label: 'الأطول والفرق' },
];
const T_STOP = [
  { id: 'zero', label: 'حين يصير الفرق 0' },
  { id: 'less', label: 'حين يصير الفرق أقصر من الأقصر' },
];
const T_MAKE = [
  { id: 'last', label: 'آخر فرق ليس 0' },
  { id: 'first', label: 'الفرق الأوّل' },
  { id: 'count', label: 'عدد عمليات الطرح' },
];
const TN = byId(T_NEXT);
const TS = byId(T_STOP);
const TM = byId(T_MAKE);
const tarhSays = (rule, c) => tarhRun(rule, c.A, c.B).made === c.d;
const isTarhRule = (rule) => rule?.next === 'sd' && rule?.stop === 'zero' && rule?.make === 'last';
const TARH_POOL = pursePool('tarh');
const TARH_CHIP = { next: 'الزوج التالي:', stop: 'أتوقّف', make: 'اللوح:' };
/** The last step: a new pair whose notebook of subtractions has three rows (3g ; 2g) or (3g ; g). */
const TARH_USE = [
  [159, 106],
  [183, 122],
  [213, 71],
  [219, 73],
];

const tarhForge = {
  key: 'khawarizmiyat-al-tarh',
  slots: [
    { id: 'next', label: 'بعد كلّ طرح، الزوج التالي:', options: options(T_NEXT) },
    { id: 'stop', label: 'وأتوقّف:', options: options(T_STOP) },
    { id: 'make', label: 'وأصنع لوحًا طوله:', options: options(T_MAKE) },
  ],
  chip: (s, o) => `${TARH_CHIP[s.id]} ${o.label}`,
  says: tarhSays,
  isTheRule: isTarhRule,
  ruleText: (rule) =>
    `لأعرف أيّ لوح أصنع: أطرح الأقصر من الأطول، والزوج التالي ${TN[rule.next].label}، وأتوقّف ${TS[rule.stop].label}، وأصنع لوحًا طوله ${TM[rule.make].label}.`,
  explain(rule, c) {
    const { diffs, made } = tarhRun(rule, c.A, c.B);
    const says = made === c.d;
    return `${madeText(c.A, c.B, made, diffs.length, SUBTRACTIONS_GEN)}: تقول إنّ اللوح ${c.d} ${builds(says)}.`;
  },
  caseId: plankId,
  // he crossed both gaps with the plank 37: island F cannot be reached otherwise
  evidence: fromLog({
    of: 'tarh',
    gaps: NUMBERS.tarh.gaps,
    make: tarhCase,
    lived: [NUMBERS.tarh.plank],
    caseId: plankId,
  }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isTarhRule(rule)) return firstBreak(TARH_POOL(), rule, rows, tarhSays, plankId);
    // a notebook of seven rows: the first difference (30) is no plank of both; the last that is not 0 (3) is
    return hard(rows, [tarhCase(51, 21, 30), tarhCase(51, 21, 3)], plankId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [tarhCase(48, 30, 6), tarhCase(48, 30, 12)] };
    if (n === 2) return { kind: 'experiment', cases: [tarhCase(55, 22, 11), tarhCase(55, 22, 22)] };
    return { kind: 'experiment', cases: [tarhCase(75, 30, 15), tarhCase(75, 30, 5)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)(TARH_USE);
      return { A, B, rows: differences(A, B), g: gcd(A, B), held: true };
    },
    lines: (c) => [
      differenceBox(c.A, c.B, { name: 'd1', w: 3 }),
      subtractionRow(2),
      subtractionRow(3),
      pgcdBox(c.A, c.B),
    ],
    check(c, vals) {
      const v = (k) => Number(vals[k]);
      if (v('d1') !== c.rows[0].d) return 'row1';
      for (const i of [2, 3]) {
        const r = c.rows[i - 1];
        if (v(`x${i}`) !== r.x || v(`y${i}`) !== r.y) return 'pair';
        if (v(`d${i}`) !== r.d) return `row${i}`;
      }
      if (v('g') === c.g) return 'ok';
      return v('g') === 0 ? 'zero' : 'pgcd';
    },
  },
  text: {
    ...PURSE_TEXT,
    title: 'مرآة جزيرة البلّوط',
    frame: 'لأعرف أيّ لوح أصنع: أطرح الأقصر من الأطول،',
    buildLead: `اختر بطاقة من كلّ عمود: كيف عرفتَ أيّ لوح تصنع؟ المرآة ستجرّب قاعدتك على الألواح التي صنعتَها للهوّتين ${T1} و ${T2}.`,
    wordsHint: 'مثال: أطرح… حتّى…',
    tryKey: (c) => `المرآة لا تبني: اكتب أسطر الطرح للعددين ${c.A} و ${c.B}، ثمّ $\\mathrm{PGCD}(${c.A} ; ${c.B})$.`,
    use: {
      row1: 'تحقّق من الطرح في السطر الأوّل.',
      row2: 'تحقّق من الطرح في السطر الثاني.',
      row3: 'تحقّق من الطرح في السطر الثالث.',
      pair: 'في كلّ سطر: العدد الأصغر والفرق من السطر الذي قبله، الأكبر أوّلًا.',
      zero: '0 ليس طول لوح: انظر إلى الفرق الذي قبله.',
      pgcd: 'انظر إلى الفروق التي كتبتَها.',
    },
    useOk: 'طرحتَ حتّى الفرق 0، ووجدتَ اللوح دون أن تكتب أيّ قائمة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. 🧮 « الباقي يحفظ الألواح المشتركة » — the gap of the remainder ─────────────────────────
// It keeps its experiment in the mirror (inquiries.js › FOLD_INQUIRY): the notebook of subtractions on 962 and 296, its
// three rows that take away 296 folded by him into 962 = 296 × 3 + 74, the rest folded by the world (296 = 74 × 4 + 0),
// and beside every line the planks that fill both — the same. His evidence: the two longest of those planks on each line.

const [F1, F2] = NUMBERS.fold.gaps;
const baqiCase = (A, B, d) => {
  const fa = fills(A, d);
  const fb = fills(B, d);
  const held = fa && fb;
  return {
    of: 'baqi',
    A,
    B,
    d,
    q: Math.floor(A / B),
    rem: A % B,
    fa,
    fb,
    fits: held,
    held,
    laid: Math.max(Math.floor(A / d), Math.floor(B / d)),
    pair: { a: A, b: B, d },
    tag: held ? TOGETHER.yes : TOGETHER.no,
  };
};
const baqiId = (c) => `baqi:${c.A}:${c.B}:${c.d}`;
const B_LOOK = [
  { id: 'br', label: 'الأقصر وهوّة الباقي', of: (c) => [c.B, c.rem] },
  { id: 'bq', label: 'الأقصر وهوّة طولها الحاصل', of: (c) => [c.B, c.q] },
  { id: 'r', label: 'هوّة الباقي وحدها', of: (c) => [c.rem] },
  { id: 'qr', label: 'هوّتا الحاصل والباقي', of: (c) => [c.q, c.rem] },
];
const B_ZERO = [
  { id: 'any', label: 'يبنيها كلّ لوح' },
  { id: 'none', label: 'لا يبنيها أيّ لوح' },
];
const BL = byId(B_LOOK);
const BZ = byId(B_ZERO);
/** What his rule says a plank does on a gap: a gap of 0 cells as his tile says, any other as the plank fills it. */
const baqiBuilt = (rule, d) => (n) => (n === 0 ? rule.zero === 'any' : fills(n, d));
const baqiSays = (rule, c) => ALL(BL[rule.look].of(c), baqiBuilt(rule, c.d));
const isBaqiRule = (rule) => rule?.look === 'br' && rule?.zero === 'any';
/** The two longest planks of both gaps (the fold's column shows them on every line). */
const longestTwo = (A, B) =>
  range(1, Math.min(A, B))
    .filter((d) => fills(A, d) && fills(B, d))
    .slice(-2)
    .reverse();
/** Small pairs A > B a mirror can draw (A ≤ 60), every plank whose two bridges it can lay; never a pair of the bank. */
const BAQI_POOL = pairPool({
  A: [10, 60],
  B: (a) => [3, a - 1],
  d: (a) => [2, a],
  make: baqiCase,
  exclude: BANK_PAIRS,
});
/** The last step: A = B × q + r with r a plank of B (the new pair's plank is then r). */
const BAQI_USE = [
  [483, 92],
  [551, 87],
  [403, 93],
];
const remTex = (c) => `${c.A} = ${c.B} \\times ${c.q} + ${c.rem}`;

const baqiForge = {
  key: 'baqi-yabqi',
  /** The notebook folded in the mirror; every line it shows is a pair of his evidence, with the planks of its column. */
  inquiry: FOLD_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rounds.flatMap((r) =>
      euclid(r.a, r.b).flatMap((s) => longestTwo(r.a, r.b).map((d) => baqiCase(s.a, s.b, d))),
    ),
  }),
  slots: [
    { id: 'look', label: 'أيّ هوّات؟', options: options(B_LOOK) },
    { id: 'zero', label: 'وهوّة من 0 خانة:', options: options(B_ZERO) },
  ],
  chip: (s, o) => (s.id === 'zero' ? `وهوّة من 0 خانة ${o.label}` : o.label),
  says: baqiSays,
  isTheRule: isBaqiRule,
  ruleText: (rule) =>
    `يبني اللوح الهوّتين الأطول والأقصر معًا عندما يبني كلّ هوّة من: ${BL[rule.look].label}؛ وهوّة من 0 خانة ${BZ[rule.zero].label}.`,
  explain(rule, c) {
    const built = baqiBuilt(rule, c.d);
    const facts = BL[rule.look]
      .of(c)
      .map((g, i) => {
        const and = i ? '، و' : '';
        if (g === 0) return `${and}هوّة من 0 خانة ${built(0) ? 'يبنيها' : 'لا يبنيها'} في قاعدتك`;
        return `${and}${fillWord(built(g))} ${g}`;
      })
      .join('');
    return `$${remTex(c)}$. اللوح ${c.d} ${facts}: قاعدتك تقول إنّه ${both(c, baqiSays(rule, c))}.`;
  },
  caseId: baqiId,
  evidence: gather({ own: (row) => row.of === 'baqi', fromRow: () => [], caseId: baqiId }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isBaqiRule(rule)) return firstBreak(BAQI_POOL(), rule, rows, baqiSays, baqiId);
    // 4 fills 64 and the remainder 4, not 10; 2 builds the three
    return hard(rows, [baqiCase(64, 10, 4), baqiCase(64, 10, 2)], baqiId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [baqiCase(38, 12, 2), baqiCase(38, 12, 4)] };
    if (n === 2) return { kind: 'experiment', cases: [baqiCase(51, 15, 3), baqiCase(51, 15, 6)] };
    return { kind: 'experiment', cases: [baqiCase(60, 16, 4), baqiCase(60, 16, 12)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)(BAQI_USE);
      return { A, B, q: Math.floor(A / B), rem: A % B, g: gcd(A, B), held: true };
    },
    lines: (c) => [givenDivision(c.A, c.B), pgcdPairBox(c.A, c.B), pgcdBox(c.A, c.B)],
    check(c, vals) {
      if (Number(vals.q) !== c.q || Number(vals.r) !== c.rem) return 'div';
      if (Number(vals.p) !== c.rem) return 'pair';
      return Number(vals.g) === c.g ? 'ok' : 'pgcd';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    ...TOGETHER,
    title: 'المرآة الثانية في جزيرة البلّوط',
    log: 'ألواح على هوّتين',
    frame: 'يبني اللوح الهوّتين الأطول والأقصر معًا عندما يبني كلّ هوّة من:',
    buildLead: `اختر بطاقة من كلّ عمود: متى يبني لوحٌ الهوّتين معًا؟ المرآة ستجرّب قاعدتك على أسطر الدفتر المطويّ: ${F1} و ${F2}، ثمّ ${F2} و ${F1 % F2}.`,
    testing: 'المرآة تمرّ على أسطر الدفتر، وتسأل قاعدتك عن كلّ لوح…',
    agreed: 'قاعدتك توافق أسطر الدفتر. الآن المرآة تتحدّاها بهوّتين أخريين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: الهوّتان ${c.A} و ${c.B}، و $${remTex(c)}$. اللوح ${c.d}: هل يبني ${c.A} و ${c.B} معًا؟ ماذا تقول قاعدتك؟`,
    eq: (c) => `$${divisionTex(c.A, c.d)} \\qquad ${divisionTex(c.B, c.d)} \\qquad ${remTex(c)}$`,
    wordsHint: 'مثال: يبني اللوح الهوّتين عندما…',
    experiment: 'انظر جيّدًا: هوّتان، وقسمة الأطول على الأقصر، ولوحان. ماذا يفعل كلّ لوح؟',
    tryKey: (c) => `المرآة لا تبني: اقسم ${c.A} على ${c.B}، ثمّ أكمل المساواتين.`,
    use: {
      div: 'تحقّق من القسمة: الباقي أصغر من العدد الذي تقسم عليه.',
      pair: 'في الزوج الجديد: العدد الأصغر، وباقي القسمة.',
      pgcd: 'انظر إلى الزوج الجديد: أحد عدديه يقسم الآخر.',
    },
    useOk: 'قسمة واحدة صغّرت الزوج دون أن يتغيّر جوابه: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. 🔁 « خوارزمية إقليدس » — the procedure by divisions ─────────────────────────
// Islands F–H were the experiment (convoy « iqlidis »): 1833 and 546, a purse of 61 coins that only 39 pays (47 + 14),
// and the bench: the division notebook (4 rows, ending 156 = 39 × 4 + 0). His evidence: every plank he made for them.

const [I1, I2] = NUMBERS.iqlidis.gaps;
const iqCase = (A, B, d) => plankCase('iqlidis', A, B, d);
/** What a procedure of divisions does with two numbers: its rows { x, y, q, r } and the plank it makes. */
function iqRun(rule, A, B) {
  let [x, y] = [Math.max(A, B), Math.min(A, B)];
  const rows = [];
  for (;;) {
    const q = Math.floor(x / y);
    const r = x % y;
    rows.push({ x, y, q, r });
    if (r === 0 || (rule.stop === 'qone' && q === 1)) break;
    // every pair is smaller than the one before (r < y; q ≤ x ÷ y): the procedure always stops
    [x, y] = rule.next === 'sr' ? [y, r] : rule.next === 'qr' ? [Math.max(q, r), Math.min(q, r)] : [x, r];
  }
  const end = rows.at(-1);
  const made = { last: end.r !== 0 ? end.r : end.y, q: end.q, count: rows.length }[rule.make];
  return { rows, made };
}
const I_NEXT = [
  { id: 'sr', label: 'الأصغر والباقي' },
  { id: 'qr', label: 'الحاصل والباقي' },
  { id: 'ar', label: 'الأكبر والباقي' },
];
const I_STOP = [
  { id: 'zero', label: 'حين يصير الباقي 0' },
  { id: 'qone', label: 'حين يصير الحاصل 1' },
];
const I_MAKE = [
  { id: 'last', label: 'آخر باقٍ ليس 0' },
  { id: 'q', label: 'الحاصل الأخير' },
  { id: 'count', label: 'عدد القسمات' },
];
const IN = byId(I_NEXT);
const IS = byId(I_STOP);
const IM = byId(I_MAKE);
const iqSays = (rule, c) => iqRun(rule, c.A, c.B).made === c.d;
const isIqRule = (rule) => rule?.next === 'sr' && rule?.stop === 'zero' && rule?.make === 'last';
const IQ_POOL = pursePool('iqlidis');
const IQ_CHIP = { next: 'الزوج التالي:', stop: 'أتوقّف', make: 'اللوح:' };
/** The last step: a new pair whose notebook of divisions has three rows, the last one ending on 0. */
const IQ_USE = [
  [1334, 319],
  [1395, 217],
  [1288, 207],
  [1411, 272],
];

const iqForge = {
  key: 'iqlidis',
  slots: [
    { id: 'next', label: 'بعد كلّ قسمة، الزوج التالي:', options: options(I_NEXT) },
    { id: 'stop', label: 'وأتوقّف:', options: options(I_STOP) },
    { id: 'make', label: 'وأصنع لوحًا طوله:', options: options(I_MAKE) },
  ],
  chip: (s, o) => `${IQ_CHIP[s.id]} ${o.label}`,
  says: iqSays,
  isTheRule: isIqRule,
  ruleText: (rule) =>
    `لأعرف أيّ لوح أصنع: أقسم الأكبر على الأصغر، والزوج التالي ${IN[rule.next].label}، وأتوقّف ${IS[rule.stop].label}، وأصنع لوحًا طوله ${IM[rule.make].label}.`,
  explain(rule, c) {
    const { rows, made } = iqRun(rule, c.A, c.B);
    return `${madeText(c.A, c.B, made, rows.length, DIVISIONS_GEN)}: تقول إنّ اللوح ${c.d} ${builds(made === c.d)}.`;
  },
  caseId: plankId,
  // he crossed both gaps with the plank 39: island H cannot be reached otherwise
  evidence: fromLog({
    of: 'iqlidis',
    gaps: NUMBERS.iqlidis.gaps,
    make: iqCase,
    lived: [NUMBERS.iqlidis.plank],
    caseId: plankId,
  }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isIqRule(rule)) return firstBreak(IQ_POOL(), rule, rows, iqSays, plankId);
    // the first quotient is 1 and its remainder (18) is no plank of both; the last remainder that is not 0 (9) is
    return hard(rows, [iqCase(63, 45, 18), iqCase(63, 45, 9)], plankId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [iqCase(77, 28, 7), iqCase(77, 28, 21)] };
    if (n === 2) return { kind: 'experiment', cases: [iqCase(68, 51, 17), iqCase(68, 51, 34)] };
    return { kind: 'experiment', cases: [iqCase(90, 54, 18), iqCase(90, 54, 9)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)(IQ_USE);
      return { A, B, rows: euclid(A, B), g: gcd(A, B), held: true };
    },
    lines: (c) => [
      givenDivision(c.A, c.B, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      pgcdBox(c.A, c.B),
    ],
    check(c, vals) {
      const v = (k) => Number(vals[k]);
      const [r1] = c.rows;
      if (v('q1') !== r1.q || v('r1') !== r1.r) return 'row1';
      for (const i of [2, 3]) {
        const r = c.rows[i - 1];
        if (v(`a${i}`) !== r.a || v(`b${i}`) !== r.b) return `pair${i}`;
        if (v(`q${i}`) !== r.q || v(`r${i}`) !== r.r) return `row${i}`;
      }
      if (v('g') === c.g) return 'ok';
      return v('g') === 0 ? 'zero' : 'pgcd';
    },
  },
  text: {
    ...PURSE_TEXT,
    title: 'مرآة جزيرة الأرز',
    frame: 'لأعرف أيّ لوح أصنع: أقسم الأكبر على الأصغر،',
    buildLead: `اختر بطاقة من كلّ عمود: كيف عرفتَ أيّ لوح تصنع؟ المرآة ستجرّب قاعدتك على الألواح التي صنعتَها للهوّتين ${I1} و ${I2}.`,
    wordsHint: 'مثال: أقسم… حتّى…',
    tryKey: (c) =>
      `المرآة لا تبني: اكتب قسمات العددين ${c.A} و ${c.B} سطرًا سطرًا حتّى الباقي 0، ثمّ $\\mathrm{PGCD}(${c.A} ; ${c.B})$.`,
    use: {
      row1: 'تحقّق من القسمة في السطر الأوّل: الباقي أصغر من العدد الذي تقسم عليه.',
      row2: 'تحقّق من القسمة في السطر الثاني: الباقي أصغر من العدد الذي تقسم عليه.',
      row3: 'تحقّق من القسمة في السطر الثالث: الباقي أصغر من العدد الذي تقسم عليه.',
      pair2: 'السطر الثاني يقسم العدد الأصغر من السطر الأوّل على باقيه.',
      pair3: 'السطر الثالث يقسم العدد الأصغر من السطر الثاني على باقيه.',
      zero: '0 ليس طول لوح: انظر إلى الباقي الذي قبله.',
      pgcd: 'انظر إلى البواقي التي كتبتَها.',
    },
    useOk: 'ثلاث قسمات، والباقي 0، واللوح بين يديك: مفتاحك يعمل!',
  },
};

// ───────────────────────── 5. ⏱️ « أيّ الخوارزميتين أسرع » — the rows of the two notebooks ─────────────────────────
// Islands H–J were the experiment (convoy « sibaq »): 1003 and 34, and the bench that ran both notebooks after he said
// which would be shorter (31 rows against 2). His evidence: the three pairs he crossed with a notebook — 259 and 185, 1833
// and 546, 1003 and 34 — each with its two counts. A case is a pair and a question about its two notebooks; the mirror
// draws its first row (the gap A, the planks of B laid at once: that many subtractions in one division).

const SIBAQ = NUMBERS.sibaq.gaps;
/** The two notebooks of a pair: the rows of subtractions S, the divisions D (euclid's rows). */
const notebooks = (A, B) => ({ S: differences(A, B).length, divs: euclid(A, B) });
const rowsTex = (divs) => divs.map((s) => `${s.a} = ${s.b} \\times ${s.q} + ${s.r}`).join(' \\qquad ');
/** « do the subtractions take k rows more than the divisions? » (k = 0: « the same number of rows? ») */
const countCase = (A, B, k) => {
  const { S, divs } = notebooks(A, B);
  return {
    ...outcome(A, B),
    of: 'aqall',
    kind: 'count',
    A,
    B,
    k,
    S,
    D: divs.length,
    divs,
    fits: A % B === 0,
    held: S - divs.length === k,
    // its line names the pair of numbers, never a plank (forgeParts.jsx › `head`, defects.md A10)
    head: `${A} و ${B}`,
    tag: `${S} مقابل ${divs.length}`,
  };
};
/** « does the notebook of divisions take MORE rows than the notebook of subtractions? » */
const pickCase = (A, B) => {
  const { S, divs } = notebooks(A, B);
  return {
    ...outcome(A, B),
    of: 'aqall',
    kind: 'pick',
    A,
    B,
    S,
    D: divs.length,
    divs,
    fits: A % B === 0,
    held: divs.length > S,
    head: `${A} و ${B}`,
    tag: `${S} مقابل ${divs.length}`,
  };
};
/** The count case of a pair, with its true number of rows saved. */
const truth = (A, B) => {
  const { S, divs } = notebooks(A, B);
  return countCase(A, B, S - divs.length);
};
const aqallId = (c) => `${c.kind}:${c.A}:${c.B}${c.kind === 'count' ? `:${c.k}` : ''}`;
/** How many rows of subtractions one division gathers. */
const A_GATHER = [
  { id: 'q', label: 'عددًا يساوي حاصلها', of: (s) => s.q },
  { id: 'one', label: 'سطرًا واحدًا', of: () => 1 },
  { id: 'r', label: 'عددًا يساوي باقيها', of: (s) => s.r },
  { id: 'b', label: 'عددًا يساوي العدد الأصغر', of: (s) => s.b },
];
/** Which notebook he chooses — what his choice says of « do the divisions take more rows? ». */
const A_PICK = [
  { id: 'divide', label: 'دفتر القسمة دائمًا', more: () => false },
  { id: 'subtract', label: 'دفتر الطرح دائمًا', more: () => true },
  { id: 'small', label: 'دفتر الطرح للعددين الأصغر من 100', more: (c) => Math.max(c.A, c.B) < 100 },
];
const AG = byId(A_GATHER);
const AP = byId(A_PICK);
/** The rows of subtractions his rule counts for a pair: what each division gathers, summed. */
const sumOf = (rule, c) => c.divs.reduce((n, s) => n + AG[rule.gather].of(s), 0);
const aqallSays = (rule, c) => (c.kind === 'count' ? sumOf(rule, c) - c.D === c.k : AP[rule.pick].more(c));
const isAqallRule = (rule) => rule?.gather === 'q' && rule?.pick === 'divide';
/** Small pairs a mirror can draw (the gap A ≤ 90, at most 40 planks of B in it), at most three divisions to write. */
const AQALL_POOL = lazy(() =>
  range(20, 90).flatMap((A) =>
    range(2, A)
      .filter((B) => notInBank(A, B) && Math.floor(A / B) <= 40 && euclid(A, B).length <= 3)
      .flatMap((B) => [truth(A, B), pickCase(A, B)]),
  ),
);
const yesNo = (yes) => (yes ? 'نعم' : 'لا');
/** The last step: two lengths whose divisions take two rows, and many subtractions (S ≥ 11: « … سطرًا »). */
const AQALL_USE = [
  [1953, 84],
  [1548, 90],
  [1896, 72],
  [1508, 78],
];

const aqallForge = {
  key: 'aqall-khutuwat',
  slots: [
    { id: 'gather', label: 'قسمة واحدة تجمع من أسطر دفتر الطرح:', options: options(A_GATHER) },
    { id: 'pick', label: 'لذلك أختار:', options: options(A_PICK) },
  ],
  chip: (s, o) => (s.id === 'gather' ? `قسمة واحدة تجمع ${o.label} من أسطر الطرح` : `فأختار ${o.label}`),
  says: aqallSays,
  isTheRule: isAqallRule,
  ruleText: (rule) =>
    `لعددين: قسمة واحدة في دفتر القسمة تجمع ${AG[rule.gather].label} من أسطر دفتر الطرح، فأختار ${AP[rule.pick].label}.`,
  explain(rule, c) {
    const yes = aqallSays(rule, c);
    if (c.kind === 'pick') return `قاعدتك تختار ${AP[rule.pick].label}: تقول « ${yesNo(yes)} ».`;
    return `دفتر القسمة: $${rowsTex(c.divs)}$. قاعدتك تعدّ لدفتر الطرح ${counted(sumOf(rule, c), ROWS_ACC)}، ولدفتر القسمة ${counted(c.D, ROWS_ACC)}: تقول « ${yesNo(yes)} ».`;
  },
  caseId: aqallId,
  evidence: gather({
    own: (row) => row.of === 'aqall',
    fromRow: () => [],
    // the three pairs he crossed by a notebook: island J cannot be reached otherwise
    lived: [NUMBERS.tarh.gaps, NUMBERS.iqlidis.gaps, SIBAQ].map(([A, B]) => truth(A, B)),
    caseId: aqallId,
  }),
  predictCases: noPredictions,
  attacks(rule, rows) {
    if (!isAqallRule(rule)) return firstBreak(AQALL_POOL(), rule, rows, aqallSays, aqallId);
    // twins: one row each; a pair where the subtractions take many rows; and « more rows by dividing? » — never
    return hard(rows, [truth(64, 64), truth(86, 4), pickCase(86, 4)], aqallId);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [truth(75, 6), pickCase(75, 6)] };
    if (n === 2) return { kind: 'experiment', cases: [truth(58, 4), pickCase(58, 4)] };
    return { kind: 'experiment', cases: [truth(33, 33), pickCase(33, 33)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [A, B] = pickWith(rand)(AQALL_USE);
      const divs = euclid(A, B);
      return { A, B, divs, S: differences(A, B).length, g: gcd(A, B), held: true };
    },
    lines: (c) => [
      givenDivision(c.A, c.B, { q: 'q1', r: 'r1' }),
      {
        dir: 'ltr',
        tokens: [String(c.B), '=', slot('b2', 'العدد', 2), '×', slot('q2', 'الحاصل', 1), '+', slot('r2', 'الباقي', 2)],
      },
      { dir: 'rtl', tokens: ['دفتر الطرح:', slot('s', 'عدد الأسطر', 2), 'سطرًا'] },
      { dir: 'rtl', tokens: ['طول القطعة:', slot('g', 'الطول', 2), 'سم'] },
    ],
    check(c, vals) {
      const v = (k) => Number(vals[k]);
      const [d1, d2] = c.divs;
      if (v('q1') !== d1.q || v('r1') !== d1.r) return 'div1';
      if (v('b2') !== d2.b) return 'pair2';
      if (v('q2') !== d2.q || v('r2') !== d2.r) return 'div2';
      if (v('s') !== c.S) return 'count';
      return v('g') === c.g ? 'ok' : 'piece';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة اليمام',
    log: 'دفاتر الهوّات التي عبرتَها',
    yes: 'نعم',
    no: 'لا',
    frame: 'لعددين، في دفتر القسمة:',
    buildLead: `اختر بطاقة من كلّ عمود: ماذا تجمع القسمة الواحدة، وأيّ دفتر تختار؟ المرآة ستجرّب قاعدتك على دفاتر الهوّات التي عبرتَها، حتّى ${SIBAQ[0]} و ${SIBAQ[1]}.`,
    testing: 'المرآة تمرّ على دفاتر الهوّات التي عبرتَها، وتسأل قاعدتك عن كلّ واحد…',
    says: (yes) => `قاعدتك: ${yesNo(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول « ${yesNo(m.says)} » — لكنّ دفتر الطرح كتب ${counted(m.S, ROWS_ACC)} للعددين ${m.A} و ${m.B}، ودفتر القسمة ${counted(m.D, ROWS_ACC)}.`,
    agreed: 'قاعدتك توافق دفاتر الهوّات التي عبرتَها. الآن المرآة تتحدّاها بعددين آخرين.',
    attack: (c) =>
      c.kind === 'pick'
        ? `المرآة تتحدّى قاعدتك: العددان ${c.A} و ${c.B}. هل يكتب دفتر القسمة أسطرًا أكثر من دفتر الطرح؟ ماذا تقول قاعدتك؟`
        : `المرآة تتحدّى قاعدتك: دفتر القسمة للعددين ${c.A} و ${c.B}: $${rowsTex(c.divs)}$. ${
            c.k === 0
              ? 'هل يكتب دفتر الطرح العدد نفسه من الأسطر؟'
              : `هل يكتب دفتر الطرح ${counted(c.k, ROWS_ACC)} أكثر منه؟`
          } ماذا تقول قاعدتك؟`,
    eq: undefined,
    fire: 'شغّل الدفترين',
    survived: 'صمدت قاعدتك: الدفتران فعلا ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yesNo(yes)} »، والدفتران قالا « ${yesNo(!yes)} ».`,
    wordsHint: 'مثال: أختار… لأنّ كلّ قسمة…',
    experiment: 'انظر جيّدًا: عددان ودفتراهما. كم سطرًا يكتب كلّ دفتر؟',
    tryKey: (c) =>
      `عارضتان من الخشب، ${c.A} سم و ${c.B} سم، تُقطعان قطعًا متساوية، أطول ما يمكن، دون أن يبقى شيء. اكتب سطري دفتر القسمة، وعدد أسطر دفتر الطرح، وطول القطعة.`,
    use: {
      div1: 'تحقّق من القسمة الأولى: الباقي أصغر من العدد الذي تقسم عليه.',
      pair2: 'في السطر الثاني يُقسم العدد الأصغر على باقي السطر الأوّل.',
      div2: 'تحقّق من القسمة الثانية.',
      count: 'كلّ قسمة تجمع من أسطر الطرح عددًا يساوي حاصلها.',
      piece: 'طول القطعة هو آخر باقٍ ليس 0.',
    },
    useOk: 'سطران من القسمة بدل أسطر الطرح الكثيرة، والقطعة وجدتَها: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'farq-yabqi': farqForge,
  'khawarizmiyat-al-tarh': tarhForge,
  'baqi-yabqi': baqiForge,
  iqlidis: iqForge,
  'aqall-khutuwat': aqallForge,
};
