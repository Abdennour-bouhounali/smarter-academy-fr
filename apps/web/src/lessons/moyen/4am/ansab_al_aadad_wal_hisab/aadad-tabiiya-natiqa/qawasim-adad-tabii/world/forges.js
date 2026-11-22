/**
 * THE FOUR FORGES of the lesson « قواسم عدد طبيعي » — one per key: no rule of this lesson is told (frame: kit/forge.js;
 * the bridges: divisorIsles/ruleForge.js).
 *   jidaa-aamilayn   a bridge that holds gives a SECOND bridge: planks as long as the first one's count     (a = d × e)
 *   qasim-rappel     the plank is a divisor when the exact quotient is a natural number                      (no part of a plank)
 *   tariqa-qawasim   which planks must be tried to find them ALL: those whose square does not pass the gap   (d² ≤ a)
 *   qawaid-qisma     for planks 2, 3, 4, 5 and 9, what to read in the gap instead of dividing                 (the rules)
 * In each, the tiles let the student write the false rules students really hold, and exactly ONE rule survives
 * (`forges.test.js` writes every rule and checks it).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { planks } from '../../../../../../common/gameworld/divisorIsles/strings';
import {
  BRIDGE_TEXT,
  SMALL,
  attackOn,
  bridgeId,
  casesOfKinds,
  cellsOf,
  evidence,
  holds,
  nudgeWith,
  outcome,
  pickWith,
} from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { lastNeeded } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { STOP_INQUIRY, RULES_INQUIRY, TURN_INQUIRY, CUT_INQUIRY } from './inquiries';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const math = (s) => ['$', s.replaceAll('×', '\\times').replaceAll('÷', '\\div'), '$'].join('');
const verdictOf = (yes) => (yes ? 'يثبت' : 'ينهار');
const dedupe = (cases) => cases.filter((c, i) => cases.findIndex((x) => bridgeId(x) === bridgeId(c)) === i);
const seenIn = (rows) => (c) => rows.some((row) => bridgeId(row) === bridgeId(c));
/** The bridges of the small pool that hold with more than one plank of more than one cell. */
const HELD = SMALL.filter((c) => holds(c.a, c.b)).map((c) => outcome(c.a, c.b));

// ───────────────────────── 1. « جداء عاملين » — one bridge gives a second one ─────────────────────────

/** Another plank the rule promises over the same gap, from the first bridge: planks of d, e of them. */
const PARTNERS = [
  { id: 'count', label: 'لوح طوله عدد ألواح الجسر الأوّل', of: (a, d, e) => e },
  { id: 'next', label: 'لوح أطول من الأوّل بخانة واحدة', of: (a, d) => d + 1 },
  { id: 'double', label: 'لوح طوله ضعف الأوّل', of: (a, d) => 2 * d },
  { id: 'rest', label: 'لوح طوله الهوّة ناقص اللوح الأوّل', of: (a, d) => a - d },
];
/** How many planks the rule says that second bridge has. */
const COUNTS = [
  { id: 'first', label: 'طول اللوح الأوّل', of: (a, d) => d },
  { id: 'same', label: 'عدد ألواح الجسر الأوّل نفسه', of: (a, d, e) => e },
  { id: 'one', label: 'لوح واحد فقط', of: () => 1 },
  { id: 'two', label: 'لوحان فقط', of: () => 2 },
];
const PT = Object.fromEntries(PARTNERS.map((x) => [x.id, x]));
const CN = Object.fromEntries(COUNTS.map((x) => [x.id, x]));
const isPairRule = (rule) => rule?.p === 'count' && rule?.n === 'first';
/**
 * The second bridge a rule builds from a first one (planks of d over a, e of them): planks of L, and the count N the rule
 * promises. `fits` = the bridge holds; `held` = the rule kept BOTH promises (it holds, with N planks).
 */
function second(rule, first) {
  const { a, b: d, q: e } = first;
  const L = PT[rule.p].of(a, d, e);
  const N = CN[rule.n].of(a, d, e);
  const c = outcome(a, L);
  const kept = c.held && c.q === N;
  return {
    ...c,
    from: { d, e },
    want: N,
    fits: c.held,
    held: kept,
    tag: kept ? 'كما وعدت' : c.held ? 'ثبت بعدد آخر' : 'انهار',
  };
}
/** A question of the predictions: « this bridge held — will that plank hold too? » (no count is promised yet). */
const willHold = (first, L) => ({ ...outcome(first.a, L), from: { d: first.b, e: first.q } });

const pairForge = {
  key: 'jidaa-aamilayn',
  logs: true,
  /** He finds it on the wall first (inquiries.js); the mirror then tests the rule he writes on the bridges HE turned. */
  inquiry: TURN_INQUIRY,
  fromInquiry: (result) => ({ rows: result.bridges.map((f) => outcome(f.a, f.d)) }),
  slots: [
    { id: 'p', label: 'يثبت أيضًا فوق الهوّة نفسها', options: PARTNERS.map(({ id, label }) => ({ id, label })) },
    { id: 'n', label: 'وعدد ألواحه', options: COUNTS.map(({ id, label }) => ({ id, label })) },
  ],
  /** The rule PROMISES its second bridge: of the bridge it built, it always says « it holds, with that many planks ». */
  says: () => true,
  isTheRule: isPairRule,
  ruleText: (rule) =>
    `عندما يثبت جسر، يثبت أيضًا فوق الهوّة نفسها ${PT[rule.p].label}، وعدد ألواحه ${CN[rule.n].label}.`,
  explain: (rule, c) =>
    `الجسر الأوّل: ${planks(c.from.e)} طولها ${c.from.d}. قاعدتك تبني فوق الهوّة نفسها جسرًا بألواح طولها ${c.b}، وتَعِد بأنّ عددها ${c.want}.`,
  caseId: bridgeId,
  evidence,
  /** The rule is run on HIS bridges that held: from each, the mirror builds the second bridge the rule promises. */
  tests(rule, rows) {
    const firsts = rows.filter((row) => row.held && row.q > 1 && row.b > 1);
    const mine = (firsts.length ? firsts : [outcome(24, 3), outcome(40, 5)]).slice(-4);
    return dedupe(mine.map((first) => ({ ...second(rule, first), mirror: true })));
  },
  /** « This bridge held with e planks of d. Will planks of … hold too? » — the count, one more, the count again, the double… */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const gaps = rows.map((row) => row.a);
    const used = [];
    const first = (test) => {
      const c = pick(
        HELD.filter((x) => x.q > 1 && x.b !== x.q && !gaps.includes(x.a) && !used.includes(x.a) && test(x)),
      );
      used.push(c.a);
      return c;
    };
    const a1 = first((x) => x.b <= 4);
    const a2 = first((x) => !holds(x.a, x.b + 1));
    const a3 = first((x) => x.b >= 5);
    const a4 = first((x) => !holds(x.a, 2 * x.b));
    const a5 = first((x) => x.q >= 4);
    const a6 = first((x) => !holds(x.a, x.a - x.b));
    return [
      willHold(a1, a1.q),
      willHold(a2, a2.b + 1),
      willHold(a3, a3.q),
      willHold(a4, 2 * a4.b),
      willHold(a5, a5.q),
      willHold(a6, a6.a - a6.b),
    ];
  },
  /** A wrong rule: the smallest first bridge whose promised second bridge breaks the promise. The right one: a square, a long plank. */
  attacks(rule, rows) {
    const seen = seenIn(rows);
    if (!isPairRule(rule)) {
      for (const first of HELD.filter((x) => x.q > 1 && x.b > 1)) {
        const c = second(rule, first);
        if (!c.held && !seen(c) && c.b >= 1) return [c];
      }
      return [];
    }
    const square = [outcome(25, 5), outcome(16, 4), outcome(9, 3)].find((x) => !seen(x));
    const long = [outcome(27, 3), outcome(28, 2), outcome(26, 2)].find((x) => !seen(outcome(x.a, x.q)));
    return [square && second(rule, square), long && second(rule, long)].filter(Boolean);
  },
  nudge(n, rows) {
    const [a, d] = [
      [20, 4],
      [18, 3],
      [28, 4],
    ].find(([gap]) => !rows.some((row) => row.a === gap)) ?? [20, 4];
    const first = outcome(a, d);
    // never a choice between two written rules: at the third help, a square bridge — the plank that is its own partner
    if (n <= 2) return { kind: 'experiment', cases: [first, outcome(a, first.q)] };
    return { kind: 'experiment', cases: [outcome(25, 5), outcome(16, 4)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, d] = pickWith(rand)([
        [91, 7],
        [104, 8],
        [119, 7],
        [117, 9],
        [102, 6],
      ]);
      return outcome(a, d);
    },
    lines: () => [
      {
        dir: 'rtl',
        tokens: ['ألواح طولها', slot('x', 'طول ألواح الجسر الآخر', 3), 'وعددها', slot('y', 'عدد ألواحه', 3)],
      },
    ],
    check(c, vals) {
      const x = Number(vals.x);
      const y = Number(vals.y);
      if (x === c.q && y === c.b) return 'ok';
      return x === c.b && y === c.q ? 'same' : 'other';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الأزواج',
    ask: (c) =>
      `جسر هوّته ${cellsOf(c.a)} ثبت بـ ${planks(c.from.e)} طولها ${c.from.d}. هل يثبت فوق الهوّة نفسها جسر بألواح طولها ${c.b}؟`,
    fact: (c) =>
      (c.fits ?? c.held)
        ? `ثبت بـ ${planks(c.q)} طولها ${c.b}.`
        : c.b > c.a
          ? 'اللوح أطول من الهوّة: الجسر انهار.'
          : 'بقيت خانات فارغة: الجسر انهار.',
    eq: (c) =>
      (c.fits ?? c.held) ? `$${c.a} = ${c.from.d} \\times ${c.from.e} = ${c.b} \\times ${c.q}$` : BRIDGE_TEXT.eq(c),
    frame: 'عندما يثبت جسر، يثبت أيضًا:',
    buildLead: 'اختر بطاقتين: أيّ جسر آخر تَعِد به قاعدتك، وبكم لوح؟ المرآة ستبنيه من جسورك.',
    testing: 'المرآة تبني من كلّ جسر لك الجسرَ الذي تَعِد به قاعدتك…',
    says: () => 'قاعدتك: يثبت، بالعدد الموعود',
    refuted: (m) =>
      m.fits
        ? `قاعدتك وعدت بـ ${planks(m.want)} طولها ${m.b} فوق هوّة من ${cellsOf(m.a)} — الجسر ثبت، لكن بـ ${planks(m.q)}.`
        : `قاعدتك وعدت بجسر ألواحه طولها ${m.b} فوق هوّة من ${cellsOf(m.a)} — لكنّه انهار أمامك.`,
    agreed: 'كلّ جسر وعدت به قاعدتك ثبت، وبالعدد الموعود. الآن المرآة تتحدّاها بجسر جديد.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: جسر هوّته ${cellsOf(c.a)} ثبت بـ ${planks(c.from.e)} طولها ${c.from.d}. قاعدتك تبني جسرًا بألواح طولها ${c.b}. ماذا تقول قاعدتك؟`,
    broken: () => 'قاعدتك انكسرت هنا: الجسر لم يفعل ما وعدت به.',
    wordsHint: 'مثال: كلّ جسر يثبت يعطيني…',
    experiment: 'انظر جيّدًا: الهوّة نفسها، وجسران. عُدّ ألواح كلّ جسر، ثمّ انظر إلى طولها.',
    tryKey: (c) =>
      `جسر هوّته ${cellsOf(c.a)} ثبت بـ ${planks(c.q)} طولها ${c.b}. المرآة لا تبني: اكتب الجسر الآخر الذي يثبت فوقها بالتأكيد.`,
    use: {
      same: 'هذا هو الجسر الأوّل نفسه. قاعدتك تعطيك جسرًا آخر: ما طول ألواحه؟',
      other: 'هل أنت متأكّد دون أن تبنيه؟ عُد إلى قاعدتك: طول الألواح الجديدة، ثمّ عددها.',
    },
    useOk: 'جسر واحد يعطيك جسرين: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. « تذكير: القاسم » — the exact quotient is a natural number ─────────────────────────

/** A quotient as a student reads it on a calculator: « 8 », « 15,5 », « 10,33… » (LaTeX). */
function quotient(a, b) {
  const v = a / b;
  if (Number.isInteger(v)) return String(v);
  const two = Math.round(v * 100) / 100;
  return `${String(two).replace('.', '{,}')}${Math.abs(two - v) > 1e-9 ? '\\dots' : ''}`;
}
const Q_QUANTITIES = [
  {
    id: 'exact',
    label: 'الحاصل التامّ لقسمة الهوّة على اللوح',
    of: (c) => c.a / c.b,
    show: (c) => math(`${c.a} ÷ ${c.b} = ${quotient(c.a, c.b)}`),
  },
  {
    id: 'diff',
    label: 'الفرق بين الهوّة واللوح',
    of: (c) => c.a - c.b,
    show: (c) => math(`${c.a} - ${c.b} = ${c.a - c.b}`),
  },
  {
    id: 'sum',
    label: 'مجموع الهوّة واللوح',
    of: (c) => c.a + c.b,
    show: (c) => math(`${c.a} + ${c.b} = ${c.a + c.b}`),
  },
  {
    id: 'prod',
    label: 'جداء الهوّة واللوح',
    of: (c) => c.a * c.b,
    show: (c) => math(`${c.a} × ${c.b} = ${c.a * c.b}`),
  },
];
const Q_CONDITIONS = [
  {
    id: 'natural',
    label: 'عدد طبيعي، بلا فاصلة',
    test: (v) => Number.isInteger(v),
    yes: 'عدد طبيعي',
    no: 'ليس عددًا طبيعيًّا',
  },
  {
    id: 'decimal',
    label: 'عدد بفاصلة',
    test: (v) => !Number.isInteger(v),
    yes: 'عدد بفاصلة',
    no: 'ليس عددًا بفاصلة',
  },
  {
    id: 'even',
    label: 'عدد زوجي',
    test: (v) => Number.isInteger(v) && v % 2 === 0,
    yes: 'عدد زوجي',
    no: 'ليس عددًا زوجيًّا',
  },
  {
    id: 'gtB',
    label: 'أكبر من طول اللوح',
    test: (v, c) => v > c.b,
    yes: 'أكبر من طول اللوح',
    no: 'ليس أكبر من طول اللوح',
  },
];
const QQ = Object.fromEntries(Q_QUANTITIES.map((x) => [x.id, x]));
const QC = Object.fromEntries(Q_CONDITIONS.map((x) => [x.id, x]));
const quotientSays = (rule, c) => QC[rule.c].test(QQ[rule.q].of(c), c);
const isQuotientRule = (rule) => rule?.q === 'exact' && rule?.c === 'natural';

const quotientForge = {
  key: 'qasim-rappel',
  logs: true,
  /** He finds it with the saw first (inquiries.js); the mirror then tests his rule on the lengths HE tried and judged. */
  inquiry: CUT_INQUIRY,
  fromInquiry: (result) => ({
    rows: [...result.tried.slice(-4).map((b) => outcome(result.a, b)), ...result.asks.map((x) => outcome(x.a, x.b))],
  }),
  slots: [
    { id: 'q', label: 'ماذا أحسب؟', options: Q_QUANTITIES.map(({ id, label }) => ({ id, label })) },
    { id: 'c', label: 'كيف يجب أن يكون؟', options: Q_CONDITIONS.map(({ id, label }) => ({ id, label })) },
  ],
  says: quotientSays,
  isTheRule: isQuotientRule,
  ruleText: (rule) => `يثبت الجسر عندما: ${QQ[rule.q].label} ${QC[rule.c].label}.`,
  explain(rule, c) {
    const yes = quotientSays(rule, c);
    return `${QQ[rule.q].show(c)}: ${yes ? QC[rule.c].yes : QC[rule.c].no}. قاعدتك تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  caseId: bridgeId,
  evidence,
  predictCases: (rows, rand = Math.random) =>
    casesOfKinds(
      [
        (c) => holds(c.a, c.b) && c.b <= 5,
        (c) => !holds(c.a, c.b) && c.b === 2,
        (c) => holds(c.a, c.b) && c.b >= 6,
        (c) => !holds(c.a, c.b) && c.b === 4 && c.a % 2 === 0,
        (c) => holds(c.a, c.b) && c.a % 2 === 1,
        (c) => !holds(c.a, c.b) && c.b === 5,
      ],
      rows,
      rand,
    ),
  attacks: (rule, rows) =>
    attackOn(
      rows,
      (c) => quotientSays(rule, outcome(c.a, c.b)),
      isQuotientRule(rule),
      (free) => [
        free.find((c) => c.b === 4 && c.a % 4 === 2 && c.a >= 14),
        free.find((c) => holds(c.a, c.b) && c.b >= 7 && c.a / c.b === 3),
      ],
    ),
  nudge(n, rows) {
    const h = nudgeWith(n, rows, [
      { q: 'diff', c: 'natural' },
      { q: 'exact', c: 'natural' },
    ]);
    // never a choice between two written rules: a third pair of bridges — the same plank, a gap one cell longer
    return h.kind === 'choice' ? { kind: 'experiment', cases: [outcome(28, 7), outcome(29, 7)] } : h;
  },
  use: {
    make: (rand = Math.random) => ({ a: pickWith(rand)([98, 91, 85, 119, 115, 95]), held: true }),
    lines: (c) => [{ dir: 'ltr', tokens: [String(c.a), '=', slot('x', 'لوح أوّل', 3), '×', slot('y', 'لوح ثانٍ', 3)] }],
    /** Two planks, neither of them 1, whose product is the gap: both fill it, and nothing was built. */
    check(c, vals) {
      const x = Number(vals.x);
      const y = Number(vals.y);
      if (x * y !== c.a) return 'product';
      return x === 1 || y === 1 ? 'trivial' : 'ok';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة الجزيرة العنيدة',
    fact: (c) =>
      c.held
        ? `${math(`${c.a} ÷ ${c.b} = ${c.q}`)}: عدد طبيعي من الألواح — الجسر ثبت.`
        : `${math(`${c.a} ÷ ${c.b} = ${quotient(c.a, c.b)}`)}: لا يوجد جزء من لوح — الجسر انهار.`,
    eq: (c) => `$${c.a} \\div ${c.b} = ${quotient(c.a, c.b)}$`,
    experiment: 'انظر جيّدًا: اللوح نفسه، هوّة ثمّ التي بعدها. أيّ حاصل تكتبه المرآة في كلّ مرّة؟',
    tryKey: (c) => `هوّة من ${cellsOf(c.a)}. المرآة لا تبني: اكتب لوحين يملآنها، لا أحد منهما 1، على شكل جداء.`,
    use: {
      product: 'الجداء لا يساوي طول الهوّة: أعد الحساب.',
      trivial: 'اللوح 1 يصلح دائمًا. ابحث عن جداء آخر: عاملان، لا أحد منهما 1.',
    },
    useOk: 'جداء بعددين طبيعيين: كلاهما لوح يملأ الهوّة. مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. « أين نتوقّف » — which planks must be tried ─────────────────────────

/**
 * « We look for ALL the planks of the gap, and every shorter plank was tried: must THIS one be tried? » A case is the
 * bridge of that plank; `fits` = it holds, `held` = it HAD to be tried (its square does not pass the gap).
 */
const tryCase = (a, d) => {
  const c = outcome(a, d);
  const need = d * d <= a;
  return { ...c, fits: c.held, held: need, tag: need ? 'كان لازمًا' : 'لا جديد' };
};
const S_QUANTITIES = [
  { id: 'sq', label: 'مربّع طول اللوح', of: (c) => c.b * c.b, show: (c) => math(`${c.b} × ${c.b} = ${c.b * c.b}`) },
  { id: 'len', label: 'طول اللوح', of: (c) => c.b, show: (c) => `طول اللوح ${c.b}` },
  { id: 'dbl', label: 'ضعف طول اللوح', of: (c) => 2 * c.b, show: (c) => math(`2 × ${c.b} = ${2 * c.b}`) },
  { id: 'plus', label: 'طول اللوح زائد 10', of: (c) => c.b + 10, show: (c) => math(`${c.b} + 10 = ${c.b + 10}`) },
];
const S_CONDITIONS = [
  {
    id: 'leA',
    label: 'لا يتجاوز طول الهوّة',
    test: (v, c) => v <= c.a,
    yes: (c) => `لا يتجاوز ${c.a}`,
    no: (c) => `يتجاوز ${c.a}`,
  },
  {
    id: 'leHalf',
    label: 'لا يتجاوز نصف الهوّة',
    test: (v, c) => 2 * v <= c.a,
    yes: (c) => `لا يتجاوز نصف ${c.a}`,
    no: (c) => `يتجاوز نصف ${c.a}`,
  },
  { id: 'lt10', label: 'أصغر من 10', test: (v) => v < 10, yes: () => 'أصغر من 10', no: () => 'ليس أصغر من 10' },
  { id: 'even', label: 'عددًا زوجيًّا', test: (v) => v % 2 === 0, yes: () => 'عدد زوجي', no: () => 'عدد فردي' },
];
const SQ = Object.fromEntries(S_QUANTITIES.map((x) => [x.id, x]));
const SC = Object.fromEntries(S_CONDITIONS.map((x) => [x.id, x]));
const stopSays = (rule, c) => SC[rule.c].test(SQ[rule.q].of(c), c);
const isStopRule = (rule) => rule?.q === 'sq' && rule?.c === 'leA';
/** Every (gap, plank) a mirror can draw, as a « must it be tried? » case. */
const TRIES = SMALL.map((c) => tryCase(c.a, c.b));

/** What he tried in the investigation, read again as « had it to be tried? »: around the crossing of its first two gaps. */
const triedAround = (a) => {
  const m = lastNeeded(a);
  const back = [];
  for (let d = m + 1; d <= a && back.length < 1; d += 1) if (a % d === 0) back.push(d);
  const picked = [...new Set([m - 1, m, m + 1, ...back, m + 2])].filter((d) => d >= 1).slice(0, 4);
  return picked.sort((x, y) => x - y).map((d) => tryCase(a, d));
};

const stopForge = {
  key: 'tariqa-qawasim',
  /** He finds it on the strip first (inquiries.js); the mirror then tests the rule he writes on the planks HE tried. */
  inquiry: STOP_INQUIRY,
  fromInquiry: (result) => ({ rows: result.gaps.slice(0, 2).flatMap((g) => triedAround(g.a)) }),
  slots: [
    { id: 'q', label: 'ماذا أحسب للّوح؟', options: S_QUANTITIES.map(({ id, label }) => ({ id, label })) },
    { id: 'c', label: 'أجرّبه فقط إذا كان هذا', options: S_CONDITIONS.map(({ id, label }) => ({ id, label })) },
  ],
  says: stopSays,
  isTheRule: isStopRule,
  ruleText: (rule) => `لأجد كلّ ألواح هوّة، أجرّب لوحًا فقط إذا كان ${SQ[rule.q].label} ${SC[rule.c].label}.`,
  explain(rule, c) {
    const yes = stopSays(rule, c);
    return `${SQ[rule.q].show(c)}، وهذا ${yes ? SC[rule.c].yes(c) : SC[rule.c].no(c)}: قاعدتك تقول ${yes ? 'نجرّب' : 'لا حاجة إلى تجريب'} اللوح ${c.b}.`;
  },
  caseId: bridgeId,
  /** His own bridges, read again: was each of them a plank that HAD to be tried? */
  evidence: (rows) => evidence(rows).map((row) => ({ ...tryCase(row.a, row.b), mirror: row.mirror })),
  /** At the edge, where it is decided: the last plank to try, then the first one that is useless. */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const seen = rows.map((row) => row.a);
    const used = [];
    const gap = (list) => {
      const left = list.filter((a) => !used.includes(a));
      const a = pick(left.some((x) => !seen.includes(x)) ? left.filter((x) => !seen.includes(x)) : left);
      used.push(a);
      return a;
    };
    const last = (a) => Math.floor(Math.sqrt(a));
    const [a1, a2, a3, a4, a5, a6] = [
      gap([20, 28, 30]),
      gap([18, 22, 26]),
      gap([25, 16]),
      gap([12, 14, 15]),
      gap([27, 21, 29]),
      gap([10, 11, 13]),
    ];
    return [
      tryCase(a1, last(a1)),
      tryCase(a2, last(a2) + 1),
      tryCase(a3, last(a3)),
      tryCase(a4, last(a4) + 2),
      tryCase(a5, last(a5) - 1),
      tryCase(a6, last(a6) + 1),
    ];
  },
  /** A wrong rule: the smallest new case where it disagrees. The right one: a square exactly, then a plank just past it. */
  attacks(rule, rows) {
    const seen = seenIn(rows);
    if (!isStopRule(rule)) {
      const breaks = TRIES.filter((c) => !seen(c) && stopSays(rule, c) !== c.held);
      // a plank the rule SKIPS although it gives a new plank is the clearest refutation: something is missing from his list
      const best = breaks.find((c) => c.held && c.fits && !stopSays(rule, c)) ?? breaks[0];
      return best ? [best] : [];
    }
    const square = [tryCase(25, 5), tryCase(16, 4), tryCase(9, 3)].find((c) => !seen(c));
    const past = [tryCase(24, 5), tryCase(15, 4), tryCase(30, 6), tryCase(8, 3)].find((c) => !seen(c));
    return [square, past].filter(Boolean);
  },
  nudge(n, rows) {
    if (n === 1) {
      // two of his bridges over one gap: a short plank and its partner — the second one told him nothing new
      for (const x of rows) {
        const y = rows.find((z) => z.a === x.a && z.fits && x.fits && z.b === x.q && z.b > x.b);
        if (y) return { kind: 'compare', cases: [x, y] };
      }
    }
    if (n <= 2) return { kind: 'experiment', cases: [tryCase(16, 4), tryCase(16, 8)] };
    // never a choice between two written rules: one more pair of bridges to look at — the plank at the crossing, the one after
    return { kind: 'experiment', cases: [tryCase(30, 5), tryCase(30, 6)] };
  },
  use: {
    make: (rand = Math.random) => ({ a: pickWith(rand)([96, 110, 150, 200, 75, 130]), held: true }),
    lines: () => [{ dir: 'rtl', tokens: ['آخر لوح أجرّبه طوله', slot('d', 'طول آخر لوح', 3)] }],
    check(c, vals) {
      const d = Number(vals.d);
      if (d * d > c.a) return 'far';
      return (d + 1) * (d + 1) <= c.a ? 'near' : 'ok';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة المربّعات',
    log: 'ألواح جرّبتَها',
    ask: (c) =>
      `نبحث عن كلّ ألواح هوّة من ${cellsOf(c.a)}، وقد جرّبنا كلّ الألواح الأقصر من ${c.b}. هل نحتاج إلى تجريب اللوح ${c.b}؟`,
    yes: 'نجرّبه',
    no: 'لا حاجة',
    fact: (c) =>
      c.held
        ? c.fits
          ? `${math(`${c.a} = ${c.b} × ${c.q}`)}: لوح جديد، وشريكه ${c.q}. كان لا بدّ من تجريبه.`
          : `انهار — لكن لم نكن لنعرف دون تجريبه: ${math(`${c.b} × ${c.b} = ${c.b * c.b}`)} لا يتجاوز ${c.a}.`
        : c.fits
          ? `ثبت بـ ${planks(c.q)}… لكنّه جسر اللوح ${c.q} مقلوبًا: كان في قائمتك من قبل.`
          : `انهار، وكان ذلك معلومًا: لو ثبت لكان عدد ألواحه أقلّ من ${c.b}، وقد جرّبنا كلّ الألواح الأقصر.`,
    eq: (c) => `$${c.b} \\times ${c.b} = ${c.b * c.b}$`,
    next: 'لوح آخر',
    frame: 'لأجد كلّ ألواح هوّة، أجرّب لوحًا فقط إذا كان:',
    buildLead: 'اختر بطاقتين: متى يستحقّ لوح أن يُجرَّب؟ المرآة ستسأل قاعدتك عن الألواح التي جرّبتَها.',
    testing: 'المرآة تسأل قاعدتك عن كلّ لوح جرّبتَه…',
    says: (yes) => `قاعدتك: ${yes ? 'نجرّبه' : 'لا حاجة'}`,
    refuted: (m) =>
      m.held
        ? `قاعدتك تقول: لا حاجة إلى اللوح ${m.b} للهوّة ${m.a} — لكن بدون تجريبه ${m.fits ? `يضيع لوحان: ${m.b} و ${m.q}` : 'لا نعرف هل يثبت'}.`
        : `قاعدتك تقول: نجرّب اللوح ${m.b} للهوّة ${m.a} — لكنّه لم يعطِ شيئًا جديدًا${m.fits ? `: هو جسر اللوح ${m.q} مقلوبًا` : ''}.`,
    agreed: 'قاعدتك اختارت الألواح اللازمة، لا أكثر ولا أقلّ. الآن المرآة تتحدّاها بلوح جديد.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: هوّة من ${cellsOf(c.a)}، وكلّ الألواح الأقصر من ${c.b} جُرّبت. ماذا تقول قاعدتك عن اللوح ${c.b}؟`,
    fire: 'ابنِه لنرى',
    survived: 'صمدت قاعدتك: اللوح فعل ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'نجرّبه' : 'لا حاجة'} »، ${yes ? 'ولم يعطِ اللوح شيئًا جديدًا' : 'وكان لا بدّ من تجريبه'}.`,
    wordsHint: 'مثال: أتوقّف عن التجريب عندما…',
    compare: (cases) => `قارن هذين الجسرين: الهوّة نفسها (${cases[0].a}). هل أعطاك الثاني لوحًا لم تكن تعرفه؟`,
    experiment: 'انظر جيّدًا: الهوّة نفسها، لوح قصير ثمّ لوح طويل. أيّهما أعطى شيئًا جديدًا؟',
    tryKey: (c) => `هوّة من ${cellsOf(c.a)}: تريد كلّ ألواحها. دون أن تبني شيئًا: ما آخر لوح تجرّبه؟`,
    use: {
      far: 'مربّع هذا اللوح يتجاوز طول الهوّة: تجريبه لا يعطي شيئًا جديدًا.',
      near: 'ما زال بعده لوح مربّعه لا يتجاوز طول الهوّة: لو توقّفت هنا قد يضيع لوح.',
    },
    useOk: 'تعرف أين تتوقّف: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. « قواعد القسمة » — what to read instead of dividing ─────────────────────────

const RULE_PLANKS = [2, 3, 4, 5, 9];
const READINGS = {
  units: { label: 'رقم الآحاد', of: (a) => a % 10 },
  sum: {
    label: 'مجموع الأرقام',
    of: (a) =>
      String(a)
        .split('')
        .reduce((s, d) => s + Number(d), 0),
  },
  last2: { label: 'الرقمان الأخيران', of: (a) => a % 100 },
  tens: { label: 'رقم العشرات', of: (a) => Math.floor(a / 10) % 10 },
};
/**
 * What each plank offers to read — exactly ONE reading decides for it. (For 2 and 5 the two last digits would decide as
 * well as the units digit: they are not offered there.)
 */
const OFFERED = {
  2: ['units', 'sum', 'tens'],
  3: ['units', 'sum', 'last2'],
  4: ['units', 'sum', 'last2'],
  5: ['units', 'sum', 'tens'],
  9: ['units', 'sum', 'last2'],
};
const RIGHT = { 2: 'units', 3: 'sum', 4: 'last2', 5: 'units', 9: 'sum' };
const slotOf = (b) => `b${b}`;
const readingOf = (rule, b) => READINGS[rule[slotOf(b)]];
const rulesSays = (rule, c) => readingOf(rule, c.b).of(c.a) % c.b === 0;
const isRulesRule = (rule) => RULE_PLANKS.every((b) => rule?.[slotOf(b)] === RIGHT[b]);
/** Gaps of three digits a mirror can still draw: their digits are what the rule reads. */
const RULE_CASES = Array.from({ length: 27 }, (_, i) => 100 + i).flatMap((a) => RULE_PLANKS.map((b) => outcome(a, b)));

/** The gaps of the chart he tested by hand, as bridges: the lines of his evidence. */
const CHART_ROWS = [outcome(10, 5), outcome(12, 5), outcome(18, 9), outcome(9, 3), outcome(10, 3), outcome(12, 4)];

const rulesForge = {
  key: 'qawaid-qisma',
  logs: true,
  /**
   * He finds each reading on the chart (inquiries.js): what he claimed and the chart accepted IS his rule — one reading per
   * plank — and the mirror attacks it at once, on gaps of three digits. The tiles are only reached if a reading breaks.
   */
  inquiry: RULES_INQUIRY,
  fromInquiry: (result) => ({
    rule: Object.fromEntries(result.readings.map((r) => [slotOf(r.b), r.lens])),
    rows: CHART_ROWS,
  }),
  slots: RULE_PLANKS.map((b) => ({
    id: slotOf(b),
    label: `اللوح ${b}`,
    options: OFFERED[b].map((id) => ({ id, label: READINGS[id].label })),
  })),
  chip: (s, o) => `${s.label}: ${o.label}`,
  says: rulesSays,
  isTheRule: isRulesRule,
  ruleText: (rule) =>
    `دون قسمة، أقرأ في طول الهوّة — ${RULE_PLANKS.map((b) => `للّوح ${b}: ${readingOf(rule, b).label}`).join('، ')}.`,
  explain(rule, c) {
    const r = readingOf(rule, c.b);
    const v = r.of(c.a);
    const yes = v % c.b === 0;
    return `قاعدتك تقرأ للّوح ${c.b} ${r.label}: ${v}. و ${v} ${yes ? 'في' : 'ليس في'} جدول ${c.b}: قاعدتك تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  caseId: bridgeId,
  /** His bridges built with one of the five planks, then those of the mirror — never fewer than four lines. */
  evidence(rows) {
    const mine = evidence(rows).filter((row) => RULE_PLANKS.includes(row.b));
    const base = [outcome(24, 3), outcome(40, 5), outcome(36, 4), outcome(36, 9)].filter(
      (c) => !mine.some((row) => bridgeId(row) === bridgeId(c)),
    );
    return [...base.slice(0, Math.max(0, 4 - mine.length)).map((c) => ({ ...c, mirror: true })), ...mine];
  },
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const used = [];
    const one = (test) => {
      const c = pick(RULE_CASES.filter((x) => !used.includes(x.a) && test(x)));
      used.push(c.a);
      return c;
    };
    const tail369 = (a) => [3, 6, 9].includes(a % 10);
    return [
      one((c) => c.b === 3 && c.held && !tail369(c.a)),
      one((c) => c.b === 4 && !c.held && c.a % 2 === 0),
      one((c) => c.b === 9 && c.held),
      one((c) => c.b === 3 && !c.held && tail369(c.a)),
      one((c) => c.b === 5 && c.held),
      one((c) => c.b === 9 && !c.held && c.a % 3 === 0),
    ];
  },
  /** A wrong reading: a gap where that plank's reading lies. The right ones: two gaps written to trap. */
  attacks(rule, rows) {
    const seen = seenIn(rows);
    if (!isRulesRule(rule)) {
      const b = RULE_PLANKS.find((p) => rule[slotOf(p)] !== RIGHT[p]);
      const breaks = RULE_CASES.filter((c) => c.b === b && !seen(c) && rulesSays(rule, c) !== c.held);
      const best = breaks.find((c) => rulesSays(rule, c)) ?? breaks[0];
      return best ? [best] : [];
    }
    const falls = [outcome(114, 4), outcome(122, 4), outcome(106, 4), outcome(118, 4)].find((c) => !seen(c));
    const stands = [outcome(117, 9), outcome(108, 9), outcome(126, 9)].find((c) => !seen(c));
    return [falls, stands].filter(Boolean);
  },
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [outcome(102, 3), outcome(103, 3)] };
    if (n === 2) return { kind: 'experiment', cases: [outcome(112, 4), outcome(114, 4)] };
    return { kind: 'experiment', cases: [outcome(117, 9), outcome(119, 9)] };
  },
  use: {
    // the gap the stone asked about: the key is used on the question that opened the search
    make: () => ({ a: 252, held: true }),
    lines: () => [
      { dir: 'rtl', tokens: ['مجموع أرقامها', slot('s', 'مجموع الأرقام', 2)] },
      {
        dir: 'rtl',
        tokens: ['رقماها الأخيران يكوّنان العدد', slot('l', 'العدد المكوَّن من الرقمين الأخيرين', 2)],
      },
      {
        dir: 'rtl',
        tokens: ['عدد الألواح التي تثبت من بين 2، 3، 4، 5، 9', slot('n', 'عدد الألواح التي تثبت', 1)],
      },
    ],
    check(c, vals) {
      if (Number(vals.s) !== READINGS.sum.of(c.a)) return 'sum';
      if (Number(vals.l) !== READINGS.last2.of(c.a)) return 'last';
      return Number(vals.n) === RULE_PLANKS.filter((b) => c.a % b === 0).length ? 'ok' : 'count';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة المرفأ الأخير',
    ask: (c) => `هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. دون أيّ قسمة: هل يثبت الجسر؟`,
    frame: 'دون قسمة — لكلّ لوح، أقرأ في طول الهوّة:',
    buildLead: 'لكلّ لوح بطاقة: ماذا تقرأ في طول الهوّة لتعرف، دون قسمة، هل يثبت؟',
    testing: 'المرآة تقرأ هوّاتك بقاعدتك…',
    experiment: 'انظر جيّدًا: اللوح نفسه، هوّتان متقاربتان. ماذا تغيّر في أرقام الهوّة؟',
    tryKey: (c) => `الحجر ينتظر جوابك: هوّة من ${c.a} خانة، لا تُبنى ولا تُقسم. اقرأها بقاعدتك.`,
    use: {
      sum: 'أعد جمع أرقام طول الهوّة.',
      last: 'انظر إلى الرقمين الأخيرين فقط: أيّ عدد يكوّنان؟',
      count: 'القراءتان صحيحتان. طبّق الآن قاعدتك على كلّ لوح من الخمسة، وعُدّ التي تثبت.',
    },
    useOk: 'خمسة ألواح حُكم عليها دون أيّ قسمة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'jidaa-aamilayn': pairForge,
  'qasim-rappel': quotientForge,
  'tariqa-qawasim': stopForge,
  'qawaid-qisma': rulesForge,
};
