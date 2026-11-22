/**
 * THE FOUR FORGES of the lesson — one per key: no rule of this lesson is told, the student forges each of them in the
 * mirror of an island (frame: kit/forge.js; the bridges and the law of the world: divisorIsles/ruleForge.js).
 *   qasim-baqi         « the bridge holds when the remainder is 0 »            — the law of the world itself
 *   qasim-jidaa        « … when the gap = the plank × a natural number »        — no division: the plank's table
 *   siyagh-mutakafia   four sentences, one fact: which number is written first — a reading of each sentence
 *   wahid-wa-nafsuh    two planks hold over EVERY gap: 1 and the gap itself     — a rule about all gaps
 * In each: the tiles let the student write the false rules students really hold, and exactly ONE rule survives
 * (`forges.test.js` writes every rule and checks it).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { STATUES } from '../../../../../../common/gameworld/divisorIsles/logic';
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
  remainderForge,
} from '../../../../../../common/gameworld/divisorIsles/ruleForge';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const ltr = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const verdictOf = (yes) => (yes ? 'يثبت' : 'ينهار');

// ───────────────────────── 2. « القاسم بالجداء » — the plank's table ─────────────────────────

const P_QUANTITIES = [
  { id: 'a', label: 'طول الهوّة', of: (c) => c.a },
  { id: 'b', label: 'طول اللوح', of: (c) => c.b },
  { id: 'n', label: 'عدد الألواح الموضوعة', of: (c) => c.q },
  { id: 'l', label: 'رقم آحاد طول الهوّة', of: (c) => c.a % 10 },
];
const P_CONDITIONS = [
  {
    id: 'times',
    label: 'يساوي طول اللوح × عددًا طبيعيًّا',
    test: (v, c) => v % c.b === 0,
    yes: (v, c) => `${ltr(`${v} = ${c.b} × ${v / c.b}`)}`,
    no: (v, c) => {
      const k = Math.floor(v / c.b);
      return `${v} ليس في جدول ${c.b}: ${ltr(`${c.b} × ${k} = ${c.b * k}`)} و ${ltr(`${c.b} × ${k + 1} = ${c.b * (k + 1)}`)}`;
    },
  },
  {
    id: 'plus',
    label: 'يساوي طول اللوح + عددًا طبيعيًّا',
    test: (v, c) => v >= c.b,
    yes: (v, c) => `${ltr(`${v} = ${c.b} + ${v - c.b}`)}`,
    no: (v, c) => `${v} أصغر من ${c.b}`,
  },
  { id: 'even', label: 'عدد زوجي', test: (v) => v % 2 === 0, yes: (v) => `${v} عدد زوجي`, no: (v) => `${v} عدد فردي` },
  {
    id: 'gtB',
    label: 'أكبر من طول اللوح',
    test: (v, c) => v > c.b,
    yes: (v, c) => `${v} أكبر من ${c.b}`,
    no: (v, c) => `${v} ليس أكبر من ${c.b}`,
  },
];
const PQ = Object.fromEntries(P_QUANTITIES.map((x) => [x.id, x]));
const PC = Object.fromEntries(P_CONDITIONS.map((x) => [x.id, x]));
const productSays = (rule, c) => PC[rule.c].test(PQ[rule.q].of(c), c);
const isProductRule = (rule) => rule?.q === 'a' && rule?.c === 'times';
/** Two bridges against the usual false ideas: two even numbers out of the table, a long plank whose table holds the gap. */
const hardProduct = (free) => {
  const evenOut = free.find((c) => c.a % 2 === 0 && c.b % 2 === 0 && c.b >= 6 && !holds(c.a, c.b));
  const inTable = free.find((c) => c.b >= 7 && holds(c.a, c.b) && c.a / c.b >= 3 && c.a !== evenOut?.a);
  return [evenOut, inTable];
};
/** The product he wrote for the last step — the biggest one of the plank's table that does not pass the gap. */
function checkProduct(c, vals, verdict) {
  const k = Number(vals.k);
  const p = Number(vals.p);
  if (c.b * k !== p) return 'sum';
  if (p > c.a) return 'over';
  if (p + c.b <= c.a) return 'far';
  return verdict === (p === c.a) ? 'ok' : 'verdict';
}

const productForge = {
  key: 'qasim-jidaa',
  logs: true,
  slots: [
    { id: 'q', label: 'ماذا أقرأ؟', options: P_QUANTITIES.map(({ id, label }) => ({ id, label })) },
    { id: 'c', label: 'كيف يجب أن يكون؟', options: P_CONDITIONS.map(({ id, label }) => ({ id, label })) },
  ],
  says: productSays,
  isTheRule: isProductRule,
  ruleText: (rule) => `يثبت الجسر عندما: ${PQ[rule.q].label} ${PC[rule.c].label}.`,
  explain(rule, c) {
    const v = PQ[rule.q].of(c);
    const yes = productSays(rule, c);
    return `${PQ[rule.q].label} هو ${v}، و ${yes ? PC[rule.c].yes(v, c) : PC[rule.c].no(v, c)}: قاعدتك تقول إنّ الجسر ${verdictOf(yes)}.`;
  },
  caseId: bridgeId,
  evidence,
  predictCases: (rows, rand = Math.random) =>
    casesOfKinds(
      [
        (c) => holds(c.a, c.b) && c.b >= 6,
        (c) => !holds(c.a, c.b) && c.a % c.b === c.b - 1,
        (c) => holds(c.a, c.b) && c.b <= 5 && c.a / c.b >= 4,
        (c) => !holds(c.a, c.b) && c.a % 2 === 0 && c.b % 2 === 0,
        (c) => holds(c.a, c.b) && c.b % 2 === 1,
        (c) => !holds(c.a, c.b) && c.a % c.b === 1,
      ],
      rows,
      rand,
    ),
  attacks: (rule, rows) =>
    attackOn(rows, (c) => productSays(rule, outcome(c.a, c.b)), isProductRule(rule), hardProduct),
  nudge: (n, rows) =>
    nudgeWith(n, rows, [
      { q: 'a', c: 'plus' },
      { q: 'a', c: 'times' },
    ]),
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [91, 7],
        [96, 8],
        [104, 8],
        [100, 7],
        [117, 9],
        [110, 9],
      ]);
      return outcome(a, b);
    },
    verdict: true,
    lines: (c) => [
      { dir: 'ltr', tokens: [String(c.b), '×', slot('k', 'عدد الألواح', 3), '=', slot('p', 'الجداء', 3)] },
    ],
    check: checkProduct,
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الجداء',
    ask: (c) => `هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. بلا قسمة: هل يثبت الجسر؟`,
    fact: (c) => (c.held ? `${c.a} في جدول ${c.b}: الجسر ثبت.` : `${c.a} ليس في جدول ${c.b}: الجسر انهار.`),
    eq: (c) =>
      c.held
        ? `$${c.a} = ${c.b} \\times ${c.q}$`
        : `$${c.b} \\times ${c.q} = ${c.b * c.q} < \\textcolor{#fbbf24}{${c.a}} < ${c.b} \\times ${c.q + 1} = ${c.b * (c.q + 1)}$`,
    compare: (cases) => `قارن هذين الجسرين: الهوّة نفسها (${cases[0].a}). كم لوحًا وُضع في كلّ مرّة؟`,
    experiment: 'انظر جيّدًا: اللوح نفسه، هوّة ثمّ التي بعدها. أيّ مساواة تكتبها المرآة في كلّ مرّة؟',
    tryKey: (c) =>
      `هوّة من ${cellsOf(c.a)}، ولوح طوله ${c.b}. المرآة لا تبني، ولا قسمة: اكتب أكبر جداء من جدول ${c.b} لا يتجاوز ${c.a}، ثمّ احكم.`,
    use: {
      sum: 'الجداء غير صحيح: أعد حسابه.',
      over: 'هذا الجداء يتجاوز طول الهوّة: الألواح تخرج عنها.',
      far: 'ما زال هناك مكان للوح آخر: ابحث عن جداء أكبر.',
      verdict: 'الجداء صحيح. هل يساوي طول الهوّة تمامًا؟ ماذا تقول قاعدتك؟',
    },
    useOk: 'مفتاحك يعمل دون أيّ قسمة!',
  },
};

// ───────────────────────── 3. « أربع جمل » — which number is written first ─────────────────────────

/** The four phrasings; `first` = what the number written first really is: the plank (the divisor) or the gap. */
const FORMS = STATUES.sentences.map((s) => ({ id: s.id, mid: s.mid, first: s.smallFirst ? 'plank' : 'gap' }));
const FORM = Object.fromEntries(FORMS.map((f) => [f.id, f]));
const READINGS = [
  { id: 'plank', label: 'اللوح' },
  { id: 'gap', label: 'الهوّة' },
];
/** The bridge a sentence « x <form> y » means when its first number is read as `first`. */
const bridgeOf = (first, x, y) => (first === 'plank' ? { a: y, b: x } : { a: x, b: y });
/** A sentence as a case: its words, and the bridge it REALLY means (which holds — the sentence is true — or not). */
function sentence(form, x, y) {
  const { a, b } = bridgeOf(FORM[form].first, x, y);
  return { form, x, y, text: `${x} ${FORM[form].mid} ${y}`, ...outcome(a, b) };
}
/** The sentence that says « small divides big » in that phrasing — or, `reversed`, the same numbers the wrong way round. */
const about = (form, small, big, reversed = false) => {
  const smallFirst = (FORM[form].first === 'plank') !== reversed;
  return smallFirst ? sentence(form, small, big) : sentence(form, big, small);
};
const sentenceId = (c) => `${c.form}:${c.x}:${c.y}`;
const sentenceSays = (rule, c) => {
  const { a, b } = bridgeOf(rule[c.form], c.x, c.y);
  return holds(a, b);
};
const isSentenceRule = (rule) => FORMS.every((f) => rule?.[f.id] === f.first);
const RIGHT_READING = Object.fromEntries(FORMS.map((f) => [f.id, f.first]));
/** What the guardians accepted: the one fact of their island, said in the four phrasings. */
const GUARDIANS = FORMS.map((f) => about(f.id, STATUES.small, STATUES.big));
/** Pairs (small, big) the mirror can draw: the small one divides the big one — or, in `OFF`, it does not. */
const PAIRS = [
  [4, 20],
  [5, 30],
  [7, 28],
  [3, 27],
  [8, 24],
  [9, 18],
  [6, 12],
  [5, 25],
];
const OFF = [
  [5, 28],
  [4, 30],
  [7, 30],
  [6, 28],
];

const sentenceForge = {
  key: 'siyagh-mutakafia',
  slots: FORMS.map((f) => ({ id: f.id, label: `… ${f.mid} …`, options: READINGS })),
  chip: (s, o) => `« ${FORM[s.id].mid} »: ${o.label}`,
  says: sentenceSays,
  isTheRule: isSentenceRule,
  ruleText: (rule) =>
    `العدد المكتوب أوّلًا هو — ${FORMS.map((f) => `في « ${f.mid} »: ${READINGS.find((r) => r.id === rule[f.id]).label}`).join('، ')}.`,
  explain(rule, c) {
    const { a, b } = bridgeOf(rule[c.form], c.x, c.y);
    const yes = holds(a, b);
    return `قاعدتك تقرأ « ${c.text} » هكذا: لوح طوله ${b} فوق هوّة من ${cellsOf(a)} — ${verdictOf(yes)}. فهي تقول إنّ الجملة ${yes ? 'صحيحة' : 'خاطئة'}.`;
  },
  caseId: sentenceId,
  /** The guardians' four sentences, then the sentences the mirror judged in front of him (the last four). */
  evidence(rows) {
    const shown = [];
    for (const row of rows) {
      if (!row.form || !row.mirror || GUARDIANS.some((g) => sentenceId(g) === sentenceId(row))) continue;
      const i = shown.findIndex((x) => sentenceId(x) === sentenceId(row));
      if (i >= 0) shown.splice(i, 1);
      shown.push({ ...sentence(row.form, row.x, row.y), mirror: true });
    }
    return [...GUARDIANS, ...shown.slice(-4)];
  },
  /** Six sentences which alternate: a true one, the same idea the wrong way round, one that is false by its numbers… */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const used = [];
    const pair = (list) => {
      const p = pick(list.filter((x) => !used.includes(x)));
      used.push(p);
      return p;
    };
    return [
      about('qasim', ...pair(PAIRS)),
      about('mudaaf', ...pair(PAIRS), true),
      about('yaqbal', ...pair(PAIRS)),
      about('yaqsim', ...pair(PAIRS), true),
      about('mudaaf', ...pair(PAIRS)),
      about('qasim', ...pair(OFF)),
    ];
  },
  /** A wrong reading: a sentence of the phrasing it reads backwards. The right one: two sentences written to trap. */
  attacks(rule, rows) {
    const seen = (c) => rows.some((row) => sentenceId(row) === sentenceId(c));
    const fresh = (make) => PAIRS.map((p) => make(p)).find((c) => !seen(c));
    if (!isSentenceRule(rule)) {
      const wrong = FORMS.find((f) => rule[f.id] !== f.first);
      const c = fresh((p) => about(wrong.id, ...p));
      return c ? [c] : [];
    }
    const trap = fresh((p) => about('yaqbal', ...p, true));
    const truth = PAIRS.map((p) => about('mudaaf', ...p)).find((c) => !seen(c) && c.a !== trap?.b);
    return [trap, truth].filter(Boolean);
  },
  nudge(n) {
    if (n === 1) return { kind: 'compare', cases: [GUARDIANS[0], GUARDIANS[GUARDIANS.length - 1]] };
    if (n === 2) return { kind: 'experiment', cases: [about('qasim', 5, 20), about('qasim', 5, 20, true)] };
    return { kind: 'choice', rules: [Object.fromEntries(FORMS.map((f) => [f.id, 'plank'])), RIGHT_READING] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [96, 8],
        [84, 7],
        [72, 9],
        [90, 6],
      ]);
      return outcome(a, b);
    },
    lines: () =>
      FORMS.map((f) => ({
        dir: 'rtl',
        tokens: [slot(`${f.id}.x`, `${f.mid}: العدد الأوّل`, 3), f.mid, slot(`${f.id}.y`, `${f.mid}: العدد الثاني`, 3)],
      })),
    /** Each sentence must be TRUE and speak of the fact: the gap, and one of its two factors as the plank. */
    check(c, vals) {
      const factors = [c.b, c.q];
      const lines = FORMS.map((f) => {
        const { a, b } = bridgeOf(f.first, Number(vals[`${f.id}.x`]), Number(vals[`${f.id}.y`]));
        return { ok: a === c.a && factors.includes(b), swapped: b === c.a && factors.includes(a) };
      });
      if (lines.every((l) => l.ok)) return 'ok';
      return lines.some((l) => l.swapped) ? 'order' : 'numbers';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الحرّاس',
    log: 'جمل الحرّاس',
    ask: () => 'هل هذه الجملة صحيحة؟',
    yes: 'صحيحة',
    no: 'خاطئة',
    fact: (c) =>
      c.held
        ? 'الجسر الذي تعنيه ثبت: الجملة صحيحة.'
        : c.b > c.a
          ? `هي تعني لوحًا طوله ${c.b} فوق هوّة من ${cellsOf(c.a)}: لا يدخل. الجملة خاطئة.`
          : 'الجسر الذي تعنيه انهار: الجملة خاطئة.',
    eq: (c) => (c.held ? `$${c.a} = ${c.b} \\times ${c.q}$` : null),
    next: 'جملة أخرى',
    frame: 'في كلّ جملة، العدد المكتوب أوّلًا هو:',
    buildLead: 'لكلّ جملة بطاقة: العدد المكتوب أوّلًا، هو اللوح أم الهوّة؟ المرآة ستقرأ جمل الحرّاس بقاعدتك.',
    testing: 'المرآة تقرأ الجمل بقاعدتك واحدةً واحدة…',
    says: (yes) => `قاعدتك: ${yes ? 'صحيحة' : 'خاطئة'}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ « ${m.text} » ${m.says ? 'صحيحة' : 'خاطئة'} — لكنّ ${m.mirror ? `المرآة أظهرت أنّها ${m.held ? 'صحيحة' : 'خاطئة'}` : 'الحرّاس قبلوها'}.`,
    agreed: 'قاعدتك تقرأ كلّ الجمل كما يجب. الآن المرآة تتحدّاها بجملة جديدة.',
    attack: (c) => `المرآة تتحدّى قاعدتك: « ${c.text} ». ماذا تقول قاعدتك؟`,
    fire: 'ابنِ الجسر الذي تعنيه',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yes ? 'صحيحة' : 'خاطئة'} »، والجسر ${yes ? 'انهار' : 'ثبت'}.`,
    wordsHint: 'مثال: القاسم هو العدد الذي…',
    compare: () => `قارن هاتين الجملتين: الحقيقة نفسها. أين كُتب العدد ${STATUES.small} في كلّ واحدة؟`,
    experiment: 'انظر جيّدًا: الكلمة نفسها والعددان نفساهما، بترتيبين. أيّ جسر تبنيه المرآة في كلّ مرّة؟',
    tryKey: (c) => `حقيقة واحدة: ${ltr(`${c.a} = ${c.b} × ${c.q}`)}. اكتبها بالجمل الأربع.`,
    use: {
      order: 'جملة واحدة على الأقلّ مكتوبة بالمقلوب: في كلّ جملة، أين اللوح وأين الهوّة؟',
      numbers: 'استعمل أعداد المساواة فقط: الهوّة، وأحد عامليها.',
    },
    useOk: 'أربع جمل، حقيقة واحدة: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. « 1 والعدد نفسه » — two planks for every gap ─────────────────────────

const SHORT = [
  { id: 'one', label: 'لوح طوله 1', of: () => 1 },
  { id: 'two', label: 'لوح طوله 2', of: () => 2 },
  { id: 'three', label: 'لوح طوله 3', of: () => 3 },
  { id: 'five', label: 'لوح طوله 5', of: () => 5 },
];
const LONG = [
  { id: 'self', label: 'لوح بطول الهوّة نفسها', of: (a) => a },
  { id: 'minus', label: 'لوح أقصر من الهوّة بخانة', of: (a) => a - 1 },
  { id: 'double', label: 'لوح طوله ضعف الهوّة', of: (a) => 2 * a },
  { id: 'ten', label: 'لوح طوله 10', of: () => 10 },
];
const SH = Object.fromEntries(SHORT.map((x) => [x.id, x]));
const LG = Object.fromEntries(LONG.map((x) => [x.id, x]));
/** The two planks a rule promises over a gap of `a` cells. */
const planksOf = (rule, a) => [
  { ...outcome(a, SH[rule.short].of(a)), tile: SH[rule.short].label },
  { ...outcome(a, LG[rule.long].of(a)), tile: LG[rule.long].label },
];
const isAlwaysRule = (rule) => rule?.short === 'one' && rule?.long === 'self';
const gapsOf = (rows) => [...new Set(rows.map((row) => row.a))];
const dedupe = (cases) => cases.filter((c, i) => cases.findIndex((x) => bridgeId(x) === bridgeId(c)) === i);
const PRIMES = [13, 11, 17, 19, 23, 29];

const alwaysForge = {
  key: 'wahid-wa-nafsuh',
  logs: true,
  slots: [
    { id: 'short', label: 'أقصر لوح يثبت دائمًا', options: SHORT.map(({ id, label }) => ({ id, label })) },
    { id: 'long', label: 'أطول لوح يثبت دائمًا', options: LONG.map(({ id, label }) => ({ id, label })) },
  ],
  /** The rule promises that its two planks hold over every gap: of one of ITS planks it always says « holds ». */
  says: (rule, c) => planksOf(rule, c.a).some((p) => p.b === c.b),
  isTheRule: isAlwaysRule,
  ruleText: (rule) => `فوق أيّ هوّة يثبت دائمًا: ${SH[rule.short].label}، و${LG[rule.long].label}.`,
  explain(rule, c) {
    const tile = planksOf(rule, c.a).find((p) => p.b === c.b)?.tile ?? `لوح طوله ${c.b}`;
    return `قاعدتك تقول إنّ « ${tile} » يثبت فوق كلّ هوّة. فوق هوّة من ${cellsOf(c.a)}، هذا لوح طوله ${c.b}: قاعدتك تقول إنّه يثبت.`;
  },
  caseId: bridgeId,
  evidence,
  /** The rule is run on HIS gaps: the mirror builds its two planks over the last four gaps he crossed (60 cells at most). */
  tests(rule, rows) {
    const gaps = gapsOf(rows).filter((a) => a <= 60);
    const mine = (gaps.length ? gaps : [15, 16, 42, 7]).slice(-4);
    // a bridge he did not build himself is the mirror's: it is marked so in the list
    const own = (c) => rows.some((row) => !row.mirror && bridgeId(row) === bridgeId(c));
    return dedupe(mine.flatMap((a) => planksOf(rule, a))).map((c) => ({ ...c, mirror: !own(c) }));
  },
  /** Bridges he has not built: plank 1, plank 2 over an odd gap, the gap itself, one cell less, a prime gap, twice the gap. */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const gaps = gapsOf(rows);
    const used = [];
    const gap = (list) => {
      const left = list.filter((x) => !used.includes(x));
      const a = pick(left.some((x) => !gaps.includes(x)) ? left.filter((x) => !gaps.includes(x)) : left);
      used.push(a);
      return a;
    };
    const odd = gap([9, 15, 21, 25, 27]);
    const any = gap([12, 14, 18, 20, 22]);
    const less = gap([10, 16, 24, 26, 28]);
    const twice = gap([8, 10, 12, 14, 16]);
    return [
      outcome(gap(PRIMES), 1),
      outcome(odd, 2),
      outcome(any, any),
      outcome(less, less - 1),
      outcome(gap(PRIMES), 1),
      outcome(twice, 2 * twice),
    ];
  },
  /** A wrong rule: the smallest new gap where one of its planks crumbles. The right one: a prime gap, twice. */
  attacks(rule, rows) {
    const gaps = gapsOf(rows);
    const free = [...new Set(SMALL.map((c) => c.a))].filter((a) => !gaps.includes(a));
    if (!isAlwaysRule(rule)) {
      for (const a of free) {
        const falls = planksOf(rule, a).find((p) => !p.held);
        if (falls) return [outcome(falls.a, falls.b)];
      }
      return [];
    }
    const [p1, p2] = PRIMES.filter((a) => free.includes(a));
    return [p1 && outcome(p1, 1), p2 && outcome(p2, p2)].filter(Boolean);
  },
  nudge(n, rows) {
    const gaps = gapsOf(rows);
    const two = [9, 10, 11, 12, 13, 14].filter((a) => !gaps.includes(a)).slice(0, 2);
    const [x, y] = two.length === 2 ? two : [9, 10];
    if (n === 1) return { kind: 'experiment', cases: [outcome(x, 1), outcome(y, 1)] };
    if (n === 2) return { kind: 'experiment', cases: [outcome(x, x), outcome(y, y)] };
    return {
      kind: 'choice',
      rules: [
        { short: 'two', long: 'self' },
        { short: 'one', long: 'self' },
      ],
    };
  },
  use: {
    make: (rand = Math.random) => ({ a: pickWith(rand)([143, 187, 221, 209, 133]), held: true }),
    lines: () => [
      {
        dir: 'rtl',
        tokens: ['لوح طوله', slot('x', 'طول اللوح الأوّل', 3), 'ولوح طوله', slot('y', 'طول اللوح الثاني', 3)],
      },
    ],
    check(c, vals) {
      const mine = [Number(vals.x), Number(vals.y)];
      const right = [1, c.a].filter((b) => mine.includes(b)).length;
      return right === 2 ? 'ok' : right === 1 ? 'one' : 'none';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة المرفأ الأخير',
    log: 'جسورك',
    frame: 'فوق أيّ هوّة، يثبت دائمًا:',
    buildLead: 'اختر لوحين. المرآة ستبنيهما فوق الهوّات التي عبرتَها.',
    testing: 'المرآة تبني لوحَيْ قاعدتك فوق هوّاتك…',
    refuted: (m) => `قاعدتك تقول إنّ لوحًا طوله ${m.b} يثبت فوق هوّة من ${cellsOf(m.a)} — لكنّه انهار أمامك.`,
    agreed: 'لوحا قاعدتك ثبتا فوق كلّ هوّاتك. الآن المرآة تتحدّاها بهوّة جديدة.',
    attack: (c) => `المرآة تتحدّى قاعدتك بهوّة من ${cellsOf(c.a)}: لوح قاعدتك هنا طوله ${c.b}. ماذا تقول قاعدتك؟`,
    wordsHint: 'مثال: كلّ هوّة يملؤها…',
    experiment: 'انظر جيّدًا: اللوح نفسه فوق هوّتين مختلفتين. هل انهار مرّة واحدة؟',
    tryKey: (c) => `هوّة من ${cellsOf(c.a)}: لا تعدّ ولا تقسم. أيّ لوحين يثبتان فوقها بالتأكيد؟`,
    use: {
      one: 'واحد منهما يثبت بالتأكيد. والآخر؟ عُد إلى قاعدتك.',
      none: 'لا تستطيع التأكّد دون حساب. قاعدتك تعطيك لوحين مضمونين: ما هما؟',
    },
    useOk: 'لوحان مضمونان فوق أيّ هوّة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'qasim-baqi': remainderForge('qasim-baqi', { title: 'مرآة جزيرة المرايا' }),
  'qasim-jidaa': productForge,
  'siyagh-mutakafia': sentenceForge,
  'wahid-wa-nafsuh': alwaysForge,
};
