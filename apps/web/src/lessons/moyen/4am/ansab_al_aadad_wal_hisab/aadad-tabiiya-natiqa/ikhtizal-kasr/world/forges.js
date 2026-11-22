/**
 * THE FOUR FORGES of lesson « اختزال كسر » — one per key, in the order of the story; no rule of this lesson is told
 * (frame: kit/forge.js; the screen: kit/RuleForge.jsx; the world's drawing: divisorIsles/forgeParts.jsx). Assembled from
 * the authoring kit (`kit/authoring/forgeBlocks.js`); the lesson writes only what the tiles mean, the words, the hard
 * cases and the last steps' numbers. EVERY KEY IS MET ON THE ISLANDS: no forge keeps an experiment (`inquiry`), each
 * opens on its tiles, its evidence is what the world wrote while he built (the log: for each plank fired on a bridge with
 * a lit stretch, `{ a: gap, b }` then `{ a: mark, b }`) and what its SIGN wrote — he cannot stand at the mirror without.
 *
 * A CASE IS A FRACTION: the whole bridge (`A` cells) and its lit stretch (`B` cells), drawn as the two bars of a pair
 * (`pair` = { a: whole, b: lit, d: the plank laid on both }) and named in its line by its own `head` (« 66/78 → 33/39 »),
 * never « 78 و 66 لوح 6 ». Three forges ask of a WRITING (`p/q`): is it what the sign writes?
 *
 *   ikhtizal-marahil   🪜 island B — he built 78 (66 lit) with 2 AND with 6: the sign wrote 66/78 = 33/39 = 11/13. A case
 *                      is a writing p/q of L/W; the mirror lays planks of W ÷ q and counts the lit ones: the same lit
 *                      stretch (`held`) when they are p. His rule says how p/q comes from L/W — 3 × 3 × 2 = 18 rules
 *                      (the numerator divided, a number subtracted, kept; the denominator the same; one number for
 *                      both or one each); one holds: both divided by the same number.
 *   ghayr-qabil        🔒 island C — 48 with 35 lit held only with 1, its sign stayed 35/48. A case is a fraction; the
 *                      mirror lays the longest plank that holds it: 1 alone (`held`: it stays) or a longer one. His rule
 *                      says what he sees in the two terms and what follows — 4 × 2 = 8 rules (both odd, both prime, the
 *                      numerator does not divide the denominator, the terms coprime); one holds: coprime ⇔ it stays.
 *   ikhtizal-pgcd      🎯 island E — 99 (66 lit) with 33 and 243 (189 lit) with 27, each paid with the coins of its
 *                      purse: 2/3 and 7/9 at once. A case is a writing p/q of L/W; the mirror lays the longest plank
 *                      that holds: `held` when p/q is what it writes. His rule says by which number and how — 4 × 3 =
 *                      12 rules (the PGCD, any common divisor, the smallest one but 1, the difference; divide both,
 *                      subtract from both, divide the denominator only); one holds: both divided by their PGCD.
 *   natija-mukhtazala  🧾 island F — 39 lit in two strokes, 5 then 8, built with 13: 5/39 + 8/39 = 13/39 = 1/3. A case
 *                      is a sum and a writing p/q of its result; `held` when p/q is the sign's shortest writing. His
 *                      rule says what to do first and then — 2 × 3 = 6 rules; one holds: add the numerators over the
 *                      same denominator, then divide both terms by their PGCD.
 * In each forge exactly ONE rule holds; `forges.test.js` writes every rule the tiles allow and refutes each wrong one by a
 * computed case — on his rows, or by the first new case where it breaks (`attacksOf`), also when he took the right plank
 * at once. The words of a key's name never appear in its forge before its last step (tested). Every last step is typed
 * in its own shape: a fraction over a real bar (`fractionBox`, `givenFraction`).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import {
  attacksOf,
  divisionRow,
  firstWrong,
  fractionBox,
  gather,
  givenDivision,
  givenFraction,
  judge,
  lazy,
  line,
  makerOf,
  noPredictions,
  pairCase,
  pairKey,
  pairsOutside,
  pgcdBox,
} from '../../../../../../common/gameworld/kit/authoring/forgeBlocks';
import { BRIDGE_TEXT } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { NUMBERS, commonDivisors, divisorsOf, euclid, fracTex, gcd, ltr, range, reduce } from './math';

// 58 pairs named by content/practice/4am/ikhtizal-kasr (scripts/lesson-bank-numbers.mjs)
export const BANK_PAIRS = new Set(
  (
    '8;30 10;16 12;18 14;20 15;22 16;44 18;30 18;48 27;133 28;42 28;91 36;84 48;84 63;110 69;529 104;136 156;325 ' +
    '210;301 234;312 238;340 240;320 240;520 245;312 260;364 261;348 266;342 310;651 315;1005 324;1080 333;666 ' +
    '360;528 360;840 405;1080 441;770 560;595 646;1102 707;909 732;1978 924;1386 925;1000 932;1631 1032;1462 ' +
    '1035;1150 1044;2175 1092;1428 1092;1716 1111;1919 1144;1430 1326;2210 1350;1620 1350;1890 1443;1924 1458;2754 ' +
    '1665;2405 1725;2070 2275;2925 3553;4199 19251;22816'
  ).split(' '),
);

const n = (v) => Number(v);
const isPrime = (x) => x > 1 && divisorsOf(x).length === 2;
/** « 66/78 » as plain text: an isolated LTR run (defects.md B16 — never reversed inside an Arabic sentence). */
const fr = (p, q) => ltr(`${p}/${q}`);
/** The smallest common divisor of two numbers other than 1, or null. */
const smallest = (x, y) => commonDivisors(x, y).find((k) => k > 1) ?? null;
const sameFrac = (x, y) => x[0] === y[0] && x[1] === y[1];
/** A fraction bridge's facts once a plank d is laid on both bars: « 78 = 6 × 13 », « 66 = 4 × 16 + 2 ». */
const laidTex = (x, d) =>
  x % d ? `${x} = ${d} \\times ${Math.floor(x / d)} + ${x % d}` : `${x} = ${d} \\times ${x / d}`;
const worldEq = (c) => `$${laidTex(c.A, c.d)} \\qquad ${laidTex(c.B, c.d)}$`;
/** A pair the bank names, or whose writing it names: the mirror never draws it. */
const outsideBank = (...pairs) => pairs.every(([x, y]) => !BANK_PAIRS.has(pairKey(x, y)));

// ───────────────────────── 1. 🪜 — the same lit stretch, written with smaller numbers ─────────────────────────
// Island A: 78 cells, 66 lit; planks 2, 4, 6 and 9. 2 and 6 hold: the sign wrote 66/78 = 33/39 = 11/13 (he reaches the
// mirror of B only when it holds BOTH writings). His evidence: the three equalities of his sign.

const MA = NUMBERS.marahil;
/**
 * A WRITING p/q asked of the fraction L/W: the mirror lays planks of W ÷ q (q of them fill the whole) and counts the lit
 * ones — the same lit stretch (`held`) when they are p.
 */
const writingCase = (of) => (W, L, p, q) => {
  const c = pairCase(of, W, L, W / q);
  const held = L * q === p * W;
  return {
    ...c,
    L,
    W,
    p,
    q,
    held,
    head: ltr(`${L}/${W} → ${p}/${q}`),
    tag: held ? 'الجزء نفسه' : 'جزء آخر',
  };
};
const maCase = writingCase('marahil');
const maId = (c) => `marahil:${c.W}:${c.L}:${c.p}:${c.q}`;

/** How a term of the new writing comes from the old one: the number it takes, 'any' (kept), or null (it cannot). */
const STEP = {
  div: (from, to) => (to >= 1 && from % to === 0 && from / to >= 2 ? from / to : null),
  sub: (from, to) => (to >= 1 && from - to >= 1 ? from - to : null),
  keep: (from, to) => (from === to ? 'any' : null),
};
const MA_NUM = [
  { id: 'div', label: 'البسط مقسومًا على عدد' },
  { id: 'sub', label: 'البسط مطروحًا منه عدد' },
  { id: 'keep', label: 'البسط كما هو' },
];
const MA_DEN = [
  { id: 'div', label: 'المقام مقسومًا على عدد' },
  { id: 'sub', label: 'المقام مطروحًا منه عدد' },
  { id: 'keep', label: 'المقام كما هو' },
];
const MA_K = [
  { id: 'one', label: 'والعدد نفسه للحدّين' },
  { id: 'own', label: 'ولكلّ حدّ عدده' },
];
/** What his rule says of a writing: both terms come from the old ones as the tiles say (one number, or one each). */
const maSays = (rule, c) => {
  const kn = STEP[rule.num](c.L, c.p);
  const kd = STEP[rule.den](c.W, c.q);
  if (kn == null || kd == null) return false;
  return rule.k === 'own' || kn === 'any' || kd === 'any' || kn === kd;
};
const MA_J = judge({
  slots: [
    { id: 'num', label: 'البسط الجديد', options: MA_NUM },
    { id: 'den', label: 'المقام الجديد', options: MA_DEN },
    { id: 'k', label: 'والعدد', options: MA_K },
  ],
  right: { num: 'div', den: 'div', k: 'one' },
  says: maSays,
});
/** A term of the new writing, as his rule reads it: « 66 ÷ 2 = 33 », « 66 − 33 = 33 », « 66 كما هو ». */
const termTex = (op, from, to) => {
  const k = STEP[op](from, to);
  if (op === 'keep') return k ? `${from} بقي كما هو` : `${from} صار ${to}`;
  if (k == null) return `${to} لا يأتي من ${from} ${op === 'div' ? 'بقسمة' : 'بطرح'}`;
  return `$${from} ${op === 'div' ? '\\div' : '-'} ${k} = ${to}$`;
};
/** The lived evidence: his sign — 66/78 = 33/39 (planks of 2), 66/78 = 11/13 (planks of 6), and so 33/39 = 11/13. */
const MA_LIVED = [
  maCase(MA.gap, MA.mark, MA.mark / 2, MA.gap / 2),
  maCase(MA.gap, MA.mark, MA.mark / 6, MA.gap / 6),
  maCase(MA.gap / 2, MA.mark / 2, MA.mark / 6, MA.gap / 6),
];
/**
 * The writings a mirror can draw: every fraction L/W (W ≤ 40) outside the bank, every plank of W that leaves at most 40
 * planks, and the writings students really write — both divided (when it can), both minus the same number, the numerator
 * kept, each divided by its own number.
 */
const MA_POOL = lazy(() =>
  range(8, 40).flatMap((W) =>
    range(2, W - 1).flatMap((L) =>
      divisorsOf(W)
        .filter((d) => d > 1 && d < W)
        .flatMap((d) => {
          const q = W / d;
          const ps = new Set([L % d ? null : L / d, L - (W - q), L, ...divisorsOf(L).map((k) => L / k)]);
          return [...ps]
            .filter((p) => p != null && p >= 1 && p < q && outsideBank([W, L], [q, p]))
            .map((p) => maCase(W, L, p, q));
        }),
    ),
  ),
);
/** The last step: a fraction of his own to write twice, each time with smaller numbers. */
const MA_USE = [
  [60, 84],
  [84, 132],
  [54, 90],
  [70, 98],
];
/** Is x/y the fraction a/b with both terms divided by the same number (at least 2)? */
const dividedBoth = (a, b, x, y) => x >= 1 && y >= 1 && a % x === 0 && a / x >= 2 && b === y * (a / x);
const sayMa = (yes) => (yes ? 'الجزء نفسه' : 'جزء آخر');

const maForge = {
  key: 'ikhtizal-marahil',
  ...MA_J,
  ruleText: (rule) =>
    `اللافتة تكتب الجزء المضاء نفسه بكسر آخر: ${MA_J.tile.num[rule.num].label}، و${MA_J.tile.den[rule.den].label}، ${MA_J.tile.k[rule.k].label}.`,
  explain(rule, c) {
    const kn = STEP[rule.num](c.L, c.p);
    const kd = STEP[rule.den](c.W, c.q);
    const both = typeof kn === 'number' && typeof kd === 'number' && rule.k === 'one';
    const same = both ? (kn === kd ? '، بالعدد نفسه' : '، بعددين مختلفين') : '';
    return `${termTex(rule.num, c.L, c.p)}، و ${termTex(rule.den, c.W, c.q)}${same}: قاعدتك تقول إنّ $${fracTex(c.p, c.q)}$ ${maSays(rule, c) ? 'تكتب الجزء نفسه' : 'تكتب جزءًا آخر'}.`;
  },
  caseId: maId,
  evidence: gather({
    own: (row) => row.of === 'marahil',
    // a plank he fired on A's bridge that held wrote one more equality on its sign
    fromRow: (row) =>
      row.a === MA.gap && MA.gap % row.b === 0 && MA.mark % row.b === 0 && row.b > 1
        ? [maCase(MA.gap, MA.mark, MA.mark / row.b, MA.gap / row.b)]
        : [],
    lived: MA_LIVED,
    caseId: maId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...MA_J,
    caseId: maId,
    pool: MA_POOL,
    // 20/45 = 4/9 (planks of 5); 24/40 is not 4/20 — 24 − 20 = 4 and 40 − 20 = 20, but planks of 2 light 12, not 4
    hard: [maCase(45, 20, 4, 9), maCase(40, 24, 4, 20)],
  }),
  // never a choice between two written rules: two writings of one fraction, one the same stretch and one not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [maCase(24, 20, 10, 12), maCase(24, 20, 8, 12)] };
    if (k === 2) return { kind: 'experiment', cases: [maCase(36, 27, 9, 12), maCase(36, 27, 3, 12)] };
    return { kind: 'experiment', cases: [maCase(26, 10, 5, 13), maCase(26, 10, 10, 13)] };
  },
  use: {
    make: makerOf(pairsOutside(MA_USE, BANK_PAIRS), (L, W) => ({ A: W, B: L, L, W, g: gcd(L, W) })),
    /** « 60/84 = □/□ = □/□ » — two writings, each with smaller numbers than the one before. */
    lines: (c) => [line([givenFraction(c.L, c.W), '=', fractionBox('n1', 'd1'), '=', fractionBox('n2', 'd2')])],
    check: (c, v) =>
      firstWrong([
        ['first', dividedBoth(c.L, c.W, n(v.n1), n(v.d1))],
        ['second', dividedBoth(n(v.n1), n(v.d1), n(v.n2), n(v.d2))],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة اللوز',
    log: 'كتابات لافتتك',
    frame: 'تكتب اللافتة الجزء المضاء نفسه حين يكون:',
    buildLead: `اختر بطاقة من كلّ عمود: كيف تكتب اللافتة الجزء المضاء نفسه بعددين آخرين؟ المرآة ستجرّب قاعدتك على لافتتك ${ltr(`${MA.mark}/${MA.gap} = 33/39 = 11/13`)}.`,
    yes: sayMa(true),
    no: sayMa(false),
    testing: 'المرآة تمرّ على كتابات لافتتك، وتسأل قاعدتك عن كلّ واحدة…',
    says: (yes) => `قاعدتك: ${sayMa(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ ${fr(m.p, m.q)} ${m.says ? 'تكتب الجزء المضاء نفسه' : 'لا تكتب الجزء المضاء نفسه'} من ${fr(m.L, m.W)} — لكنّ ألواح ${m.d} ${m.held ? `تضيء منها ${m.p} من ${m.q}` : m.fits ? `تضيء منها ${m.L / m.d} لا ${m.p}` : 'تترك العمود في وسط لوح'}.`,
    agreed: 'قاعدتك توافق كتابات لافتتك. الآن المرآة تتحدّاها بلافتة أخرى.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: لافتة تكتب $${fracTex(c.L, c.W)}$. هل $${fracTex(c.p, c.q)}$ تكتب الجزء المضاء نفسه؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع الألواح',
    survived: 'صمدت قاعدتك: الألواح أضاءت ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${sayMa(yes)} »، والألواح قالت « ${sayMa(!yes)} ».`,
    wordsHint: 'مثال: لأكتب الجزء نفسه بعددين أصغر…',
    experiment: 'انظر جيّدًا: كسر واحد وكتابتان، والألواح تعدّ المضاء. ماذا صار البسط والمقام في كلّ كتابة؟',
    tryKey: (c) =>
      `لافتة تكتب $${fracTex(c.L, c.W)}$. اكتب الجزء المضاء نفسه بكسرين: كلّ واحد بعددين أصغر من الذي قبله.`,
    use: {
      first: 'الكسر الأوّل لا يكتب الجزء نفسه: بأيّ عدد قسمت البسط؟ هل قسمت المقام على العدد نفسه؟',
      second: 'الكسر الثاني لا يكتب الجزء نفسه بعددين أصغر: اقسم حدّي الكسر الأوّل على عدد يقسمهما معًا.',
    },
    useOk: 'كتابتان للجزء نفسه، كلّ واحدة بعددين أصغر: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. 🔒 — a fraction that stays as it is ─────────────────────────
// Island B: 48 cells, 35 lit; planks 3, 5, 7 and 1. 3 fills 48 and leaves the post in the middle of a plank; 5 and 7 do
// not fill; only 1 holds, and the sign stays 35/48. His evidence: the four fractions his signs wrote — 66/78, 33/39 and
// 11/13 (island A), and 35/48.

const GH = NUMBERS.ghayr;
/** A fraction L/W; the mirror lays the longest plank that holds it (1 alone, or longer). `held`: it stays as it is. */
const ghCase = (W, L) => {
  const g = gcd(W, L);
  const c = pairCase('ghayr', W, L, g);
  const [p, q] = reduce(L, W, g);
  return { ...c, L, W, g, held: g === 1, head: fr(L, W), tag: g === 1 ? 'يبقى كما هو' : `يصير ${fr(p, q)}` };
};
const ghId = (c) => `ghayr:${c.W}:${c.L}`;
const GH_SEE = [
  { id: 'odd', label: 'الحدّان فرديّان', test: (c) => c.L % 2 === 1 && c.W % 2 === 1 },
  { id: 'prime', label: 'الحدّان أوّليّان', test: (c) => isPrime(c.L) && isPrime(c.W) },
  { id: 'nodiv', label: 'البسط لا يقسم المقام', test: (c) => c.W % c.L !== 0 },
  { id: 'coprime', label: 'الحدّان أوّليّان فيما بينهما', test: (c) => c.g === 1 },
];
const STAYS = 'يبقى كما هو';
const SHRINKS = 'يُكتب بعددين أصغر';
const GH_THEN = [
  { id: 'stays', label: STAYS },
  { id: 'shrinks', label: SHRINKS },
];
const GH_J = judge({
  slots: [
    { id: 'see', label: 'ماذا أرى في الحدّين؟', options: GH_SEE },
    { id: 'then', label: 'فالكسر:', options: GH_THEN },
  ],
  right: { see: 'coprime', then: 'stays' },
  says: (rule, c, tile) => tile.see[rule.see].test(c) === (rule.then === 'stays'),
});
/** What he can see in the two terms, said plainly (or as a formula through MathText). */
const ghFact = {
  odd: (c) => `${c.L} ${c.L % 2 ? 'فرديّ' : 'زوجيّ'}، و ${c.W} ${c.W % 2 ? 'فرديّ' : 'زوجيّ'}`,
  prime: (c) =>
    `${c.L} ${isPrime(c.L) ? 'أوّليّ' : 'ليس أوّليًّا'}، و ${c.W} ${isPrime(c.W) ? 'أوّليّ' : 'ليس أوّليًّا'}`,
  nodiv: (c) => `باقي قسمة ${c.W} على ${c.L} هو ${c.W % c.L}`,
  coprime: (c) => `$\\mathrm{PGCD}(${c.L} ; ${c.W}) = ${c.g}$`,
};
/** The fractions his signs wrote: island A's three, then 35/48. */
const GH_LIVED = [
  ghCase(MA.gap, MA.mark),
  ghCase(MA.gap / 2, MA.mark / 2),
  ghCase(MA.gap / 6, MA.mark / 6),
  ghCase(GH.gap, GH.mark),
];
/** Fractions a mirror can draw: W ≤ 90, at most 40 planks of the longest plank that holds; never a pair of the bank. */
const GH_POOL = lazy(() =>
  range(6, 90).flatMap((W) =>
    range(2, W - 1)
      .filter((L) => W / gcd(W, L) <= 40 && outsideBank([W, L]))
      .map((L) => ghCase(W, L)),
  ),
);
/**
 * The last step: fractions of his own — four that stay, four that do not, which no rule of divisibility shows. No 143:
 * it is the pilot's number (the story walk met it, 2026-11-20 — 139/206 and 77/203 took its two pairs; CLEAR).
 */
const GH_USE = [
  [91, 138],
  [139, 206],
  [87, 128],
  [121, 195],
  [77, 203],
  [87, 145],
  [85, 153],
  [123, 164],
];
const ghWorld = (m) =>
  m.held ? 'أطول لوح يثبت جسره هو 1' : `ألواح ${m.g} تثبت جسره وتكتبه ${fr(m.L / m.g, m.W / m.g)}`;

const ghForge = {
  key: 'ghayr-qabil',
  ...GH_J,
  ruleText: (rule) =>
    `عندما أرى «${GH_J.tile.see[rule.see].label}»، فالكسر ${GH_J.tile.then[rule.then].label}؛ وإلّا فالعكس.`,
  explain: (rule, c) =>
    `${ghFact[rule.see](c)}: قاعدتك تقول إنّ $${fracTex(c.L, c.W)}$ ${GH_J.says(rule, c) ? STAYS : SHRINKS}.`,
  caseId: ghId,
  evidence: gather({
    own: (row) => row.of === 'ghayr',
    fromRow: (row) =>
      row.a === GH.gap ? [ghCase(GH.gap, GH.mark)] : row.a === MA.gap ? [ghCase(MA.gap, MA.mark)] : [],
    lived: GH_LIVED,
    caseId: ghId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...GH_J,
    caseId: ghId,
    pool: GH_POOL,
    // 25/36: neither prime, one even, 25 does not divide 36 — it stays; 39/65: both odd, 39 does not divide 65 — 13 holds
    hard: [ghCase(36, 25), ghCase(65, 39)],
  }),
  // two fractions alike for a false belief: one stays, one does not
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [ghCase(25, 21), ghCase(25, 15)] };
    if (k === 2) return { kind: 'experiment', cases: [ghCase(27, 16), ghCase(27, 15)] };
    return { kind: 'experiment', cases: [ghCase(39, 22), ghCase(39, 21)] };
  },
  use: {
    make: makerOf(pairsOutside(GH_USE, BANK_PAIRS), (L, W) => ({
      A: W,
      B: L,
      L,
      W,
      g: gcd(L, W),
      held: gcd(L, W) === 1,
    })),
    lines: (c) => [pgcdBox(c.L, c.W)],
    /** He types the PGCD of the two terms, then says whether the fraction stays (`verdict`: yes). */
    verdict: true,
    check: (c, v, verdict) =>
      firstWrong([
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ['verdict', verdict === c.held],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة المرجان',
    log: 'لافتات جسورك',
    frame: 'عندما أرى في الحدّين:',
    buildLead: `اختر بطاقة من كلّ عمود: متى يبقى الكسر كما هو؟ المرآة ستجرّب قاعدتك على لافتاتك: ${fr(MA.mark, MA.gap)} و ${fr(33, 39)} و ${fr(11, 13)} و ${fr(GH.mark, GH.gap)}.`,
    yes: STAYS,
    no: SHRINKS,
    testing: 'المرآة تمرّ على لافتات جسورك، وتسأل قاعدتك عن كلّ كسر…',
    says: (yes) => `قاعدتك: ${yes ? STAYS : SHRINKS}`,
    refuted: (m) => `قاعدتك تقول إنّ ${fr(m.L, m.W)} ${m.says ? STAYS : SHRINKS} — لكنّ ${ghWorld(m)}.`,
    agreed: 'قاعدتك توافق لافتات جسورك. الآن المرآة تتحدّاها بكسرين آخرين.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: لافتة تكتب $${fracTex(c.L, c.W)}$. هل يبقى الكسر كما هو، أم يُكتب بعددين أصغر؟ ماذا تقول قاعدتك؟`,
    eq: (c) => (c.g > 1 ? worldEq(c) : `$\\mathrm{PGCD}(${c.L} ; ${c.W}) = 1$`),
    fire: 'ضع أطول لوح',
    survived: 'صمدت قاعدتك: أطول لوح يثبت الجسر فعل ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? STAYS : SHRINKS} »، والألواح قالت « ${yes ? SHRINKS : STAYS} ».`,
    wordsHint: 'مثال: يبقى الكسر كما هو عندما…',
    experiment: 'انظر جيّدًا: كسران يتشابه حدّاهما، وأطول لوح يثبت كلّ جسر. ما الذي يختلف بينهما؟',
    tryKey: (c) =>
      `المرآة لا تبني: لافتة تكتب $${fracTex(c.L, c.W)}$. احسب PGCD حدّيها، ثمّ احكم: هل يبقى الكسر كما هو، أم يُكتب بعددين أصغر؟`,
    use: {
      pgcd: 'PGCD: اقسم الأكبر على الأصغر، ثمّ الأصغر على الباقي، حتّى يصير الباقي 0.',
      zero: '0 ليس طول لوح: انظر إلى الباقي الذي قبله.',
      verdict: 'انظر إلى PGCD الذي كتبتَه: هل يثبت الجسرَ لوحٌ أطول من 1؟',
    },
    useOk: 'PGCD واحد قال كلّ شيء: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. 🎯 — the shortest writing at once ─────────────────────────
// Islands C and D: 99 cells, 66 lit, 3 coins — only 33 is paid: 2/3; 243 cells, 189 lit, 9 coins — only 27: 7/9.
// Cheaper planks left the post in the middle of a plank or ran out of coins; the benches were notebooks of divisions.
// His evidence: every writing a plank he fired there gave its sign (planks that held the post), the two he crossed with.

const TH = NUMBERS.thuluth;
const TS = NUMBERS.tusu;
/**
 * A WRITING p/q asked of L/W: is it the shortest writing of its sign? The mirror lays the longest plank that holds the
 * bridge (`d` = the PGCD) and writes L ÷ d over W ÷ d; `held` when p/q is that writing.
 */
const shortCase = (of) => (W, L, p, q) => {
  const g = gcd(W, L);
  const c = pairCase(of, W, L, g);
  const best = reduce(L, W, g);
  const held = sameFrac([p, q], best);
  const equal = L * q === p * W;
  return {
    ...c,
    L,
    W,
    p,
    q,
    g,
    held,
    head: ltr(`${L}/${W} → ${p}/${q}`),
    tag: held ? 'بأصغر عددين' : equal ? 'تصغر أكثر' : 'جزء آخر',
  };
};
const pgCase = shortCase('pgcd');
const pgId = (c) => `pgcd:${c.W}:${c.L}:${c.p}:${c.q}`;
/** By which number (the numbers it may be, for this fraction). */
const PG_BY = [
  { id: 'pgcd', label: 'القاسم المشترك الأكبر للحدّين', ks: (L, W) => [gcd(L, W)] },
  { id: 'any', label: 'أيّ قاسم مشترك للحدّين', ks: (L, W) => commonDivisors(L, W) },
  { id: 'small', label: 'أصغر قاسم مشترك غير 1', ks: (L, W) => [smallest(L, W)].filter(Boolean) },
  { id: 'diff', label: 'فرق الحدّين', ks: (L, W) => [W - L] },
];
/** What is done with it: the new writing, or null. */
const PG_HOW = [
  { id: 'both', label: 'نقسم عليه البسط والمقام', of: (L, W, k) => (L % k || W % k ? null : [L / k, W / k]) },
  { id: 'sub', label: 'نطرحه من البسط والمقام', of: (L, W, k) => (L - k >= 1 ? [L - k, W - k] : null) },
  { id: 'den', label: 'نقسم عليه المقام وحده', of: (L, W, k) => (W % k ? null : [L, W / k]) },
];
/** Every writing his rule makes of L/W. */
const pgWrites = (rule, c, tile) =>
  tile.by[rule.by]
    .ks(c.L, c.W)
    .map((k) => ({ k, w: tile.how[rule.how].of(c.L, c.W, k) }))
    .filter((x) => x.w);
const PG_J = judge({
  slots: [
    { id: 'by', label: 'بأيّ عدد؟', options: PG_BY },
    { id: 'how', label: 'ماذا نفعل به؟', options: PG_HOW },
  ],
  right: { by: 'pgcd', how: 'both' },
  says: (rule, c, tile) => pgWrites(rule, c, tile).some((x) => sameFrac(x.w, [c.p, c.q])),
});
const opTex = (how, L, W, k) =>
  how === 'sub'
    ? `$${L} - ${k} = ${L - k} \\qquad ${W} - ${k} = ${W - k}$`
    : how === 'den'
      ? `$${W} \\div ${k} = ${W / k}$`
      : `$${L} \\div ${k} = ${L / k} \\qquad ${W} \\div ${k} = ${W / k}$`;
const PG_LIVED = [pgCase(TH.gap, TH.mark, 2, 3), pgCase(TS.gap, TS.mark, 7, 9)];
/** A writing his plank b gave the sign of the bridge W (L lit), when the plank held the post. */
const pgFromPlank = (W, L, b) => (b >= 1 && W % b === 0 && L % b === 0 ? [pgCase(W, L, L / b, W / b)] : []);
/**
 * The writings a mirror can draw: every fraction L/W (W ≤ 60, at most 40 planks of its PGCD) outside the bank, written
 * with each of its common divisors — the shortest writing and the ones that still shrink — and with its difference.
 */
const PG_POOL = lazy(() =>
  range(6, 60).flatMap((W) =>
    range(2, W - 1)
      .filter((L) => W / gcd(W, L) <= 40)
      .flatMap((L) => {
        const ws = commonDivisors(L, W).map((k) => [L / k, W / k]);
        if (L > W - L) ws.push([L - (W - L), L]);
        return ws.filter(([p, q]) => outsideBank([W, L], [q, p])).map(([p, q]) => pgCase(W, L, p, q));
      }),
  ),
);
/** The last step: a fraction of his own; three divisions find the PGCD (each pair checked: CLEAR). */
const PG_USE = [
  [92, 161],
  [91, 169],
  [88, 165],
  [60, 165],
  [77, 176],
];
const sayPg = (yes) => (yes ? 'هي أقصر كتابة' : 'ليست هي');

const pgForge = {
  key: 'ikhtizal-pgcd',
  ...PG_J,
  ruleText: (rule) =>
    `لأكتب الكسر بأصغر عددين دفعةً واحدة: آخذ ${PG_J.tile.by[rule.by].label}، و${PG_J.tile.how[rule.how].label}.`,
  explain(rule, c) {
    const writes = pgWrites(rule, c, PG_J.tile);
    const hit = writes.find((x) => sameFrac(x.w, [c.p, c.q]));
    const shown = hit ?? writes[0];
    if (!shown)
      return `لا عدد يصلح لقاعدتك هنا: قاعدتك لا تكتب $${fracTex(c.L, c.W)}$ بعددين آخرين، فتقول ${sayPg(false)}.`;
    const what = `${opTex(rule.how, c.L, c.W, shown.k)}: قاعدتك تكتب $${fracTex(shown.w[0], shown.w[1])}$`;
    return `${what}، فتقول عن $${fracTex(c.p, c.q)}$: ${sayPg(Boolean(hit))}.`;
  },
  caseId: pgId,
  evidence: gather({
    own: (row) => row.of === 'pgcd',
    fromRow: (row) =>
      row.a === TH.gap
        ? pgFromPlank(TH.gap, TH.mark, row.b)
        : row.a === TS.gap
          ? pgFromPlank(TS.gap, TS.mark, row.b)
          : [],
    lived: PG_LIVED,
    caseId: pgId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...PG_J,
    caseId: pgId,
    pool: PG_POOL,
    // 28/49 is 4/7 at once (planks of 7); 24/60 written 12/30 still shrinks: the longest plank that holds is 12
    hard: [pgCase(49, 28, 4, 7), pgCase(60, 24, 12, 30)],
  }),
  // two writings of one fraction, both of the same lit stretch: the shortest one and one that still shrinks
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [pgCase(54, 12, 2, 9), pgCase(54, 12, 6, 27)] };
    if (k === 2) return { kind: 'experiment', cases: [pgCase(50, 20, 2, 5), pgCase(50, 20, 10, 25)] };
    return { kind: 'experiment', cases: [pgCase(56, 16, 2, 7), pgCase(56, 16, 4, 14)] };
  },
  use: {
    make: makerOf(pairsOutside(PG_USE, BANK_PAIRS), (L, W) => {
      const g = gcd(L, W);
      return { A: W, B: L, L, W, g, rows: euclid(W, L), best: reduce(L, W, g) };
    }),
    /** Euclid's divisions row by row, then its PGCD and the fraction with the smallest numbers, over a real bar. */
    lines: (c) => [
      givenDivision(c.W, c.L, { q: 'q1', r: 'r1', rw: 3 }),
      divisionRow(2),
      divisionRow(3),
      line(['PGCD', '=', slot('g', 'PGCD', 2), givenFraction(c.L, c.W), '=', fractionBox('n', 'd', { w: 2 })]),
    ],
    check: (c, v) =>
      firstWrong([
        ['row1', n(v.q1) === c.rows[0].q && n(v.r1) === c.rows[0].r],
        ...[2, 3].flatMap((i) => [
          [`pair${i}`, n(v[`a${i}`]) === c.rows[i - 1].a && n(v[`b${i}`]) === c.rows[i - 1].b],
          [`row${i}`, n(v[`q${i}`]) === c.rows[i - 1].q && n(v[`r${i}`]) === c.rows[i - 1].r],
        ]),
        [n(v.g) === 0 ? 'zero' : 'pgcd', n(v.g) === c.g],
        ['equal', n(v.n) >= 1 && n(v.d) >= 1 && n(v.n) * c.W === n(v.d) * c.L],
        ['short', sameFrac([n(v.n), n(v.d)], c.best)],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الرمّان',
    log: 'كتابات لافتاتك',
    frame: 'لأكتب الكسر بأصغر عددين دفعةً واحدة:',
    buildLead: `اختر بطاقة من كلّ عمود: كيف تكتب لافتةٌ الكسرَ بأصغر عددين دفعةً واحدة؟ المرآة ستجرّب قاعدتك على ${fr(TH.mark, TH.gap)} و ${fr(TS.mark, TS.gap)}.`,
    yes: sayPg(true),
    no: sayPg(false),
    testing: 'المرآة تمرّ على كتابات لافتاتك، وتسأل قاعدتك عن كلّ واحدة…',
    says: (yes) => `قاعدتك: ${sayPg(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ ${fr(m.p, m.q)} ${m.says ? 'أقصر كتابة' : 'ليست أقصر كتابة'} لـ ${fr(m.L, m.W)} — لكنّ أطول لوح يثبت الجسر هو ${m.g}، وهو يكتب ${fr(m.L / m.g, m.W / m.g)}.`,
    agreed: 'قاعدتك توافق كتابات لافتاتك. الآن المرآة تتحدّاها بلافتة أخرى.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: لافتة تكتب $${fracTex(c.L, c.W)}$. هل $${fracTex(c.p, c.q)}$ أقصر كتابة لها؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع أطول لوح',
    survived: 'صمدت قاعدتك: أطول لوح يثبت الجسر كتب ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${sayPg(yes)} »، وأطول لوح قال « ${sayPg(!yes)} ».`,
    wordsHint: 'مثال: لأكتب الكسر بأصغر عددين مرّة واحدة…',
    experiment: 'انظر جيّدًا: كسر واحد وكتابتان للجزء نفسه، وأطول لوح يثبت الجسر. أيّ كتابة يكتبها؟',
    tryKey: (c) =>
      `المرآة لا تبني: لافتة تكتب $${fracTex(c.L, c.W)}$. اكتب قسمات ${c.W} و ${c.L} حتّى الباقي 0، ثمّ PGCD، ثمّ الكسر بأصغر عددين.`,
    use: {
      row1: 'تحقّق من القسمة في السطر الأوّل: الباقي أصغر من العدد الذي تقسم عليه.',
      row2: 'تحقّق من القسمة في السطر الثاني: الباقي أصغر من العدد الذي تقسم عليه.',
      row3: 'تحقّق من القسمة في السطر الثالث: الباقي أصغر من العدد الذي تقسم عليه.',
      pair2: 'السطر الثاني يقسم العدد الأصغر من السطر الأوّل على باقيه.',
      pair3: 'السطر الثالث يقسم العدد الأصغر من السطر الثاني على باقيه.',
      zero: '0 ليس طول لوح: انظر إلى الباقي الذي قبله.',
      pgcd: 'انظر إلى البواقي التي كتبتَها: آخر باقٍ ليس 0.',
      equal: 'هذا الكسر لا يكتب الجزء نفسه: اقسم البسط والمقام على PGCD الذي كتبتَه.',
      short: 'هذا الكسر يكتب الجزء نفسه، لكنّه يُكتب بعددين أصغر بعد: اقسم على PGCD نفسه.',
    },
    useOk: 'قسمات، ثمّ PGCD، ثمّ أصغر كتابة دفعةً واحدة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. 🧾 — the result of a calculation, at its shortest ─────────────────────────
// Island E: 39 cells lit in two strokes, 5 then 8, 3 coins — only 13 is paid: 5/39 + 8/39 = 13/39 = 1/3. His evidence:
// every writing a plank he fired there gave the sign of that sum, the one he crossed with.

const NA = NUMBERS.natija;
const [S1, S2] = NA.strokes;
/** A SUM s1/W + s2/W and a writing p/q of its result; `held` when p/q is the shortest writing of that result. */
const naCase = (W, s1, s2, p, q) => {
  const c = shortCase('natija')(W, s1 + s2, p, q);
  return { ...c, s1, s2, head: ltr(`${s1}/${W} + ${s2}/${W} → ${p}/${q}`) };
};
const naId = (c) => `natija:${c.W}:${c.s1}:${c.s2}:${c.p}:${c.q}`;
const NA_FIRST = [
  { id: 'same', label: 'نجمع البسطين، والمقام نفسه', of: (c) => [c.s1 + c.s2, c.W] },
  { id: 'both', label: 'نجمع البسطين ونجمع المقامين', of: (c) => [c.s1 + c.s2, 2 * c.W] },
];
const NA_THEN = [
  { id: 'pgcd', label: 'نقسم الحدّين على PGCD لهما', of: ([x, y]) => reduce(x, y) },
  { id: 'keep', label: 'نترك الكسر كما هو', of: (w) => w },
  {
    id: 'small',
    label: 'نقسمهما على أصغر قاسم غير 1',
    of: ([x, y]) => (smallest(x, y) ? [x / smallest(x, y), y / smallest(x, y)] : [x, y]),
  },
];
/** The writing his rule gives the result of a sum. */
const naWrites = (rule, c, tile) => tile.then[rule.then].of(tile.first[rule.first].of(c));
const NA_J = judge({
  slots: [
    { id: 'first', label: 'أوّلًا:', options: NA_FIRST },
    { id: 'then', label: 'ثمّ:', options: NA_THEN },
  ],
  right: { first: 'same', then: 'pgcd' },
  says: (rule, c, tile) => sameFrac(naWrites(rule, c, tile), [c.p, c.q]),
});
const NA_LIVED = [naCase(NA.gap, S1, S2, (S1 + S2) / NA.plank, NA.gap / NA.plank)];
/**
 * The sums a mirror can draw: s1/W + s2/W (W ≤ 36, s1 ≤ s2, the result under W, at most 40 planks of its PGCD), each
 * with its shortest writing, its result as it is, and the writing that divides by the smallest common divisor only.
 */
const NA_POOL = lazy(() =>
  range(6, 36).flatMap((W) =>
    range(1, W - 2).flatMap((s1) =>
      range(s1, W - 1 - s1)
        .filter((s2) => W / gcd(W, s1 + s2) <= 40 && outsideBank([W, s1 + s2], [W, s1], [W, s2]))
        .flatMap((s2) => {
          const L = s1 + s2;
          const k = smallest(L, W);
          const ws = [reduce(L, W), [L, W], ...(k ? [[L / k, W / k]] : [])];
          return ws
            .filter((w, i) => ws.findIndex((x) => sameFrac(x, w)) === i)
            .map(([p, q]) => naCase(W, s1, s2, p, q));
        }),
    ),
  ),
);
/** The last step: sums, differences and a product of his own (each pair checked: CLEAR). */
const NA_USE = [
  { op: '+', a: [19, 75], b: [31, 75] },
  { op: '+', a: [23, 45], b: [13, 45] },
  { op: '+', a: [31, 72], b: [17, 72] },
  { op: '+', a: [29, 48], b: [11, 48] },
  { op: '−', a: [41, 60], b: [11, 60] },
  { op: '×', a: [12, 55], b: [11, 18] },
];
/** The result of a calculation as it comes, before anything is divided: [numerator, denominator]. */
const rawOf = ({ op, a, b }) =>
  op === '×' ? [a[0] * b[0], a[1] * b[1]] : [op === '+' ? a[0] + b[0] : a[0] - b[0], a[1]];
const sayNa = (yes) => (yes ? 'نعم، هذه هي' : 'لا، ليست هي');

const naForge = {
  key: 'natija-mukhtazala',
  ...NA_J,
  ruleText: (rule) =>
    `لأكتب نتيجة جمع كسرين لهما المقام نفسه: ${NA_J.tile.first[rule.first].label}، ثمّ ${NA_J.tile.then[rule.then].label}.`,
  explain(rule, c) {
    const [x, y] = NA_J.tile.first[rule.first].of(c);
    const [p, q] = naWrites(rule, c, NA_J.tile);
    const then = sameFrac([x, y], [p, q]) ? '' : `، ثمّ $${fracTex(p, q)}$`;
    return `قاعدتك تحسب $${fracTex(c.s1, c.W)} + ${fracTex(c.s2, c.W)} = ${fracTex(x, y)}$${then}: فتقول عن $${fracTex(c.p, c.q)}$: ${sayNa(NA_J.says(rule, c))}.`;
  },
  caseId: naId,
  evidence: gather({
    own: (row) => row.of === 'natija',
    fromRow: (row) =>
      row.a === NA.gap && NA.gap % row.b === 0 && (S1 + S2) % row.b === 0
        ? [naCase(NA.gap, S1, S2, (S1 + S2) / row.b, NA.gap / row.b)]
        : [],
    lived: NA_LIVED,
    caseId: naId,
  }),
  predictCases: noPredictions,
  attacks: attacksOf({
    ...NA_J,
    caseId: naId,
    pool: NA_POOL,
    // 3/26 + 11/26 = 14/26 = 7/13; 7/36 + 9/36 = 16/36, and 8/18 still shrinks: the longest plank that holds is 4
    hard: [naCase(26, 3, 11, 7, 13), naCase(36, 7, 9, 8, 18)],
  }),
  // one sum, two writings of its result: the shortest and one that still shrinks
  nudge(k) {
    if (k === 1) return { kind: 'experiment', cases: [naCase(30, 7, 17, 4, 5), naCase(30, 7, 17, 12, 15)] };
    if (k === 2) return { kind: 'experiment', cases: [naCase(24, 5, 11, 2, 3), naCase(24, 5, 11, 8, 12)] };
    return { kind: 'experiment', cases: [naCase(40, 7, 9, 2, 5), naCase(40, 7, 9, 8, 20)] };
  },
  use: {
    make: makerOf(
      NA_USE.filter((u) => outsideBank(u.a, u.b, rawOf(u))).map((u) => [u, rawOf(u)]),
      (u, raw) => ({ ...u, raw, A: raw[1], B: raw[0], best: reduce(raw[0], raw[1]) }),
    ),
    /** « 19/75 + 31/75 = □/□ = □/□ » — the result as it comes, then at its shortest; every fraction over a real bar. */
    lines: (c) => [
      line([
        givenFraction(...c.a),
        c.op,
        givenFraction(...c.b),
        '=',
        fractionBox('s', 'w', { w: 3 }),
        '=',
        fractionBox('n', 'd', { w: 2 }),
      ]),
    ],
    check: (c, v) =>
      firstWrong([
        ['calc', sameFrac([n(v.s), n(v.w)], c.raw)],
        ['equal', n(v.n) >= 1 && n(v.d) >= 1 && n(v.n) * c.raw[1] === n(v.d) * c.raw[0]],
        ['short', sameFrac([n(v.n), n(v.d)], c.best)],
      ]),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة القرنفل',
    log: 'جمعٌ ولافتته',
    frame: 'لأكتب نتيجة جمع كسرين لهما المقام نفسه:',
    buildLead: `اختر بطاقة من كلّ عمود: كيف تكتب اللافتة نتيجة جمع الضربتين؟ المرآة ستجرّب قاعدتك على ${ltr(`${S1}/${NA.gap} + ${S2}/${NA.gap}`)}.`,
    yes: sayNa(true),
    no: sayNa(false),
    testing: 'المرآة تمرّ على ما كتبته لافتتك، وتسأل قاعدتك…',
    says: (yes) => `قاعدتك: ${sayNa(yes)}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ ${fr(m.p, m.q)} ${m.says ? 'هي' : 'ليست'} نتيجة ${ltr(`${m.s1}/${m.W} + ${m.s2}/${m.W}`)} بأصغر عددين — لكنّ أطول لوح يثبت الجسر هو ${m.g}، وهو يكتب ${fr(m.L / m.g, m.W / m.g)}.`,
    agreed: 'قاعدتك توافق ما كتبته لافتتك. الآن المرآة تتحدّاها بجمع آخر.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: $${fracTex(c.s1, c.W)} + ${fracTex(c.s2, c.W)}$. هل نتيجته بأصغر عددين $${fracTex(c.p, c.q)}$؟ ماذا تقول قاعدتك؟`,
    eq: worldEq,
    fire: 'ضع أطول لوح',
    survived: 'صمدت قاعدتك: أطول لوح يثبت الجسر كتب ما قالته.',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${sayNa(yes)} »، وأطول لوح قال « ${sayNa(!yes)} ».`,
    wordsHint: 'مثال: أحسب أوّلًا، ثمّ…',
    experiment: 'انظر جيّدًا: جمع واحد وكتابتان لنتيجته، وأطول لوح يثبت الجسر. أيّ كتابة يكتبها؟',
    tryKey: (c) =>
      `المرآة لا تبني: احسب $${fracTex(...c.a)} ${c.op === '×' ? '\\times' : c.op === '−' ? '-' : '+'} ${fracTex(...c.b)}$، ثمّ اكتب النتيجة بأصغر عددين.`,
    use: {
      calc: 'احسب أوّلًا، ولا تقسم شيئًا: النتيجة كما هي.',
      equal: 'الكسر الثاني لا يساوي نتيجة الحساب: اقسم حدّيها على العدد نفسه.',
      short: 'هذا الكسر يساوي النتيجة، لكنّه يُكتب بعددين أصغر بعد: اقسم حدّيها على PGCD لهما.',
    },
    useOk: 'الحساب أوّلًا، ثمّ أصغر كتابة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'ikhtizal-marahil': maForge,
  'ghayr-qabil': ghForge,
  'ikhtizal-pgcd': pgForge,
  'natija-mukhtazala': naForge,
};
