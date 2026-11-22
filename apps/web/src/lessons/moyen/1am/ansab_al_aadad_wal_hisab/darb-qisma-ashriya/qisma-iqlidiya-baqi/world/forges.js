/**
 * THE FIVE FORGES of lesson « القسمة الإقليدية » — one per key, in the order of the story (`journey.js › KEYS`); no rule
 * of this lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js; « استكشف »: GAME_WORLD.md).
 * Each rule has its own nature, and its own way of being found:
 *   majmuaat-kamila  groups    a SEARCH: lay planks one at a time — what is counted, and when the laying stops
 *   baqi-asghar      cycle     a PATTERN: one plank on gaps that grow cell by cell — what it can leave, from … to …
 *   musawat-qisma    rebuild   a PATTERN read backwards: the gap from its planks and its piece
 *   taqdir-hasil     estimate  a PROCEDURE: tens of planks first, then single planks
 *   baqi-fi-masala   (mirror)  ONE decision on a case: which number of the division answers the question asked?
 * Key 1 says nothing of what is left (only « no other plank fits »): what a plank can leave is key 2's own discovery.
 * A case of the searches is a CLAIM about a gap (« it takes n planks », « it is n cells long »): `held` is what the
 * world does with it — the mirror builds the gap. The tiles let the student write the false rules students really hold,
 * and exactly ONE rule survives (`forges.test.js` writes every rule of every forge and refutes each wrong one by a
 * computed case).
 */
import { slot } from '../../../../../../common/gameworld/kit/forge';
import { BRIDGE_TEXT, outcome, pickWith } from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import {
  cabinsOf,
  cellsOf,
  emptyCellsOf,
  emptyRestOf,
  fullPlanksOf,
  ofCells,
  planksOf,
  restOf,
  travellersOf,
} from './counted';
import { GROUPS_INQUIRY, CYCLE_INQUIRY, REBUILD_INQUIRY, ESTIMATE_INQUIRY } from './inquiries';
import { NUMBERS } from './story';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const math = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
/** « a = b × q + r » of a case, the rest green when it is 0, amber otherwise. */
const restEq = (c) => `$${c.a} = ${c.b} \\times ${c.q} + \\textcolor{${c.r === 0 ? '#34d399' : '#fbbf24'}}{${c.r}}$`;
/** « تأخذ 7 ألواح كاملة » — the claim of a case. */
const takes = (n) => (n === 0 ? 'لا تأخذ أيّ لوح كامل' : `تأخذ ${fullPlanksOf(n, { acc: true })}`);
/** « بعد لوحين » — how many planks were laid before the question. */
const afterPlanks = (n) => (n === 0 ? 'قبل أيّ لوح' : `بعد ${planksOf(n, { gen: true })}`);
/** One line per different case, in the order they came; only the cases of THIS forge (`f`). */
const keepOwn = (f, idOf) => (rows) =>
  rows.filter((row, i) => row.f === f && rows.findIndex((x) => x.f === f && idOf(x) === idOf(row)) === i);
/** Cases he has not seen, one per kind, on different gaps: the predictions (held and not held in turn). */
function oneOfEach(pool, rows, rand, idOf, kinds) {
  const pick = pickWith(rand);
  const seen = new Set(rows.map(idOf));
  const used = [];
  return kinds
    .map((test) => {
      const list = pool.filter((c) => !seen.has(idOf(c)) && !used.includes(c.a) && test(c));
      if (!list.length) return null;
      const c = pick(list);
      used.push(c.a);
      return c;
    })
    .filter(Boolean);
}
/** THE ATTACK of a wrong rule: the first case he has not seen where the world does not do what it says (a « yes » first). */
function firstBreak(pool, rows, says, idOf) {
  const seen = new Set(rows.map(idOf));
  const free = pool.filter((c) => !seen.has(idOf(c)) && says(c) !== c.held);
  const best = free.find((c) => says(c)) ?? free[0];
  return best ? [best] : [];
}
const fresh = (rows, idOf, list, n = 2) => {
  const seen = new Set(rows.map(idOf));
  return list.filter((c) => !seen.has(idOf(c))).slice(0, n);
};

// ─────────────── the claim « the gap a takes n planks of b » (keys 1 and 4) ───────────────

/** The mirror lays planks of b on the gap a as the world does: `held` = the gap really takes n planks. */
const claimCase = (f, a, b, n) => {
  const c = outcome(a, b);
  const held = n === c.q;
  return { ...c, f, n, held, fits: c.held, tag: held ? `${planksOf(n)}: نعم` : `ليس ${n}: ${planksOf(c.q)}` };
};
const claimId = (c) => `${c.a}:${c.b}:${c.n}`;
const claimText = {
  ...BRIDGE_TEXT,
  ask: (c) => `هوّة من ${ofCells(c.a)}، وألواح طولها ${c.b}. هل ${takes(c.n)}؟`,
  yes: 'نعم',
  no: 'لا',
  fact: (c) =>
    c.b > c.a
      ? `اللوح ${c.b} أطول من الهوّة: لم يدخل أيّ لوح.`
      : `دخل ${planksOf(c.q)}، و${restOf(c.r)}، واللوح التالي لم يدخل.`,
  eq: (c) => math(`${c.a} - ${c.b} × ${c.q} = ${c.r}`),
  next: 'هوّة أخرى',
  says: (yes) => `قاعدتك: ${yes ? 'نعم' : 'لا'}`,
  refuted: (m) =>
    `قاعدتك تقول إنّ الهوّة ${m.a} ${m.says ? takes(m.n) : m.n === 0 ? 'تأخذ لوحًا واحدًا على الأقلّ' : `لا ${takes(m.n)}`} — لكنّك رأيتها ${takes(m.q)}.`,
  attack: (c) =>
    `المرآة تتحدّى قاعدتك: هوّة من ${ofCells(c.a)}، وألواح طولها ${c.b}. هل ${takes(c.n)}؟ ماذا تقول قاعدتك؟`,
  survived: 'صمدت قاعدتك: المرآة وضعت الألواح كما قالت.',
  broken: (yes) =>
    `قاعدتك انكسرت هنا: قالت « ${yes ? 'نعم' : 'لا'} »، والمرآة ${yes ? 'وضعت عددًا آخر من الألواح' : 'وضعت هذا العدد بالضبط'}.`,
};

// ───────────────────────── 1. « المجموعات الكاملة » — how many full planks ─────────────────────────

// `label` is the tile (the student speaks: « أعدّ … »); `noun` is the same thing said of his rule (« تعدّ … »)
const K_COUNT = [
  { id: 'full', label: 'الألواح الكاملة التي وضعتُها', noun: 'الألواح الكاملة الموضوعة', of: (a, b, k) => k },
  {
    id: 'tried',
    label: 'كلّ الألواح التي جرّبتُها، مع الذي لم يدخل',
    noun: 'كلّ الألواح المجرَّبة، مع الذي لم يدخل',
    of: (a, b, k) => k + 1,
  },
  { id: 'cells', label: 'الخانات التي بقيت فارغة', noun: 'الخانات التي بقيت فارغة', of: (a, b, k) => a - b * k },
  { id: 'covered', label: 'الخانات التي غطّتها الألواح', noun: 'الخانات التي غطّتها الألواح', of: (a, b, k) => b * k },
];
// when the laying stops — said by the PLANKS only (what is left, and how long it may be, is key 2's discovery)
const K_STOP = [
  { id: 'noMore', label: 'عندما لا يدخل لوح آخر', at: (a, b) => Math.floor(a / b) },
  { id: 'passes', label: 'بعد أوّل لوح يبرز خارج الهوّة', at: (a, b) => Math.floor(a / b) + 1 },
  { id: 'empty', label: 'عندما لا تبقى أيّ خانة فارغة', at: (a, b) => (a % b === 0 ? a / b : null) },
  { id: 'nine', label: 'بعد 9 ألواح على الأكثر', at: (a, b) => Math.min(Math.floor(a / b), 9) },
];
const KC = byId(K_COUNT);
const KS = byId(K_STOP);
/** Where the rule stops (planks laid), or null when it never stops on this gap. */
const kamilaStop = (rule, a, b) => KS[rule.stop].at(a, b);
const kamilaValue = (rule, a, b) => {
  const k = kamilaStop(rule, a, b);
  return k == null ? null : KC[rule.count].of(a, b, k);
};
const kamilaSays = (rule, c) => kamilaValue(rule, c.a, c.b) === c.n;
const isKamila = (rule) => rule?.count === 'full' && rule?.stop === 'noMore';
const kCase = (a, b, n) => claimCase('kamila', a, b, n);
/** Every gap a mirror can draw and a student can count: gaps 6 … 126, planks 3 … 12, at most 15 planks. */
const K_GAPS = (() => {
  const out = [];
  for (let a = 6; a <= 126; a += 1) for (let b = 3; b <= 12; b += 1) if (b < a && a / b <= 15) out.push([a, b]);
  return out;
})();
const K_PREDICT = K_GAPS.filter(([a]) => a <= 60).flatMap(([a, b]) => {
  const { q, r } = outcome(a, b);
  return [...new Set([q, q + 1, q - 1, r])].filter((n) => n >= 0).map((n) => kCase(a, b, n));
});

const kamilaForge = {
  key: 'majmuaat-kamila',
  /** He finds it by laying planks one at a time (inquiries.js); the mirror then tests his rule on the gaps HE filled. */
  inquiry: GROUPS_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rounds.flatMap((x) => [
      kCase(x.a, x.b, x.q),
      ...(x.said && x.said.q !== x.q ? [kCase(x.a, x.b, x.said.q)] : []),
    ]),
  }),
  slots: [
    { id: 'count', label: 'ماذا أعدّ؟', options: options(K_COUNT) },
    { id: 'stop', label: 'متى أتوقّف؟', options: options(K_STOP) },
  ],
  says: kamilaSays,
  isTheRule: isKamila,
  ruleText: (rule) =>
    `لأعرف كم لوحًا كاملًا تأخذ الهوّة: أعدّ ${KC[rule.count].label}، وأتوقّف ${KS[rule.stop].label}.`,
  explain(rule, c) {
    const k = kamilaStop(rule, c.a, c.b);
    if (k == null)
      return `مع اللوح ${c.b} تبقى خانات فارغة مهما وُضع من ألواح: قاعدتك لا تتوقّف أبدًا، فلا تعطي أيّ عدد.`;
    const v = KC[rule.count].of(c.a, c.b, k);
    const lays = k === 0 ? 'قاعدتك لا تضع أيّ لوح' : `قاعدتك تضع ${planksOf(k, { acc: true })} ثمّ تتوقّف`;
    return `${lays}، وتعدّ ${KC[rule.count].noun}: ${v}. إذن تقول « ${v === c.n ? 'نعم' : 'لا'} ».`;
  },
  caseId: claimId,
  evidence: keepOwn('kamila', claimId),
  predictCases: (rows, rand = Math.random) =>
    oneOfEach(K_PREDICT, rows, rand, claimId, [
      (c) => c.held && c.r > 0,
      (c) => !c.held && c.n === c.q + 1,
      (c) => c.held && c.r === 0,
      (c) => !c.held && c.n === c.r && c.r > 0,
      (c) => c.held && c.q >= 5,
    ]),
  /** A wrong rule: the first new gap where the world does not lay what it says. The right one: a long gap, an exact fit. */
  attacks(rule, rows) {
    if (!isKamila(rule)) {
      const pool = K_GAPS.map(([a, b]) => {
        const v = kamilaValue(rule, a, b);
        return kCase(a, b, v != null && v >= 0 ? v : Math.floor(a / b));
      });
      return firstBreak(pool, rows, (c) => kamilaSays(rule, c), claimId);
    }
    return fresh(rows, claimId, [kCase(100, 8, 12), kCase(56, 8, 6), kCase(117, 9, 13), kCase(48, 6, 7)]);
  },
  // never a choice between two written rules: one more pair of gaps — the same plank, a little more or less gap
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [kCase(30, 4, 7), kCase(32, 4, 8)] };
    if (n === 2) return { kind: 'experiment', cases: [kCase(23, 5, 4), kCase(25, 5, 5)] };
    return { kind: 'experiment', cases: [kCase(6, 8, 0), kCase(19, 8, 2)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [95, 8],
        [100, 7],
        [118, 9],
        [87, 6],
      ]);
      return { a, b, held: true };
    },
    lines: (c) => [
      {
        dir: 'rtl',
        tokens: [
          `${c.a} خانة، ألواح ${c.b}:`,
          slot('q', 'عدد الألواح الكاملة', 2),
          'لوحًا، وتبقى',
          slot('r', 'الخانات الفارغة', 2),
          'خانة',
        ],
      },
    ],
    check(c, vals) {
      if (Number(vals.q) !== Math.floor(c.a / c.b)) return 'q';
      return Number(vals.r) === c.a % c.b ? 'ok' : 'r';
    },
  },
  text: {
    ...claimText,
    title: 'مرآة جزيرة المجموعات',
    log: 'هوّات ملأتَها',
    frame: 'كم لوحًا كاملًا تأخذ الهوّة؟',
    buildLead: 'اختر بطاقتين: ماذا تعدّ، ومتى تتوقّف؟ المرآة ستجرّب قاعدتك على الهوّات التي ملأتَها.',
    testing: 'المرآة تمرّ على الهوّات التي ملأتَها، وتسأل قاعدتك عن كلّ واحدة…',
    agreed: 'قاعدتك توافق كلّ الهوّات التي ملأتَها. الآن المرآة تتحدّاها بهوّتين جديدتين.',
    fire: 'ضع الألواح',
    wordsHint: 'مثال: أعدّ الألواح…',
    experiment: 'انظر جيّدًا: اللوح نفسه، وهوّتان متقاربتان. أين توقّف وضع الألواح في كلّ مرّة؟',
    tryKey: (c) =>
      `هوّة من ${ofCells(c.a)} وألواح طولها ${c.b}: أطول من أن تُعدّ. المرآة لا تبني: كم لوحًا كاملًا تأخذ، وكم خانة تبقى؟`,
    use: {
      q: 'تحقّق من عدد الألواح بالضرب: هل تدخل كلّها؟ وهل يدخل لوح آخر بعدها؟',
      r: 'عدد الألواح صحيح. كم خانة تبقى بعد آخر لوح؟',
    },
    useOk: 'هوّة طويلة، دون أن تعدّ الخانات: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. « الباقي أصغر من المقسوم عليه » — what a plank can leave ─────────────────────────

/**
 * After k planks of b on a gap, n cells are empty (a = b × k + n): do those cells STAY empty? Only when no other plank
 * goes in — n < b. The mirror draws the gap and lays every plank that fits: `q`, `r` are what it really shows.
 */
const leftCase = (b, k, n) => {
  const c = outcome(b * k + n, b);
  const held = n < b;
  return {
    ...c,
    f: 'asghar',
    k,
    n,
    held,
    fits: c.held,
    tag: n === 0 ? 'لا خانة فارغة' : held ? `${cellsOf(n)}: تبقى` : `${cellsOf(n)}: لوح آخر`,
  };
};
const leftId = (c) => `${c.b}:${c.k}:${c.n}`;
const A_FROM = [
  { id: 'zero', label: 'من 0 (لا خانة)', min: () => 0 },
  { id: 'one', label: 'من خانة واحدة', min: () => 1 },
];
const A_TO = [
  { id: 'bm1', label: 'إلى طول اللوح ناقص 1', max: (b) => b - 1 },
  { id: 'b', label: 'إلى طول اللوح نفسه', max: (b) => b },
  { id: 'nine', label: 'إلى 9 خانات، مهما كان اللوح', max: () => 9 },
  { id: 'half', label: 'إلى نصف طول اللوح', max: (b) => Math.floor(b / 2) },
];
const AF = byId(A_FROM);
const AT = byId(A_TO);
/** The rule's range for a plank of b: [the fewest cells it leaves, the most]. */
const asgharRange = (rule, b) => [AF[rule.from].min(b), AT[rule.to].max(b)];
const asgharSays = (rule, c) => {
  const [lo, hi] = asgharRange(rule, c.b);
  return c.n >= lo && c.n <= hi;
};
const isAsghar = (rule) => rule?.from === 'zero' && rule?.to === 'bm1';
/** Every stop a mirror can draw: planks 3 … 14, 1 … 6 of them laid, 0 … b + 3 cells empty, 99 cells at most. */
const A_POOL = (() => {
  const out = [];
  for (let b = 3; b <= 14; b += 1)
    for (let k = 1; k <= 6; k += 1)
      for (let n = 0; n <= b + 3; n += 1) if (b * k + n <= 99) out.push(leftCase(b, k, n));
  return out;
})();
/** « بعد 5 ألواح بقيت 7 خانات فارغة » — the stop a case shows before its question. */
const stopOf = (c) =>
  `هوّة من ${ofCells(c.b * c.k + c.n)}، وألواح طولها ${c.b}. ${afterPlanks(c.k)} ${c.n === 0 ? 'لم تبقَ أيّ خانة فارغة' : emptyRestOf(c.n)}.`;
const stopAsk = (c) => (c.n === 0 ? 'هل ينتهي وضع الألواح هكذا؟' : 'هل تبقى فارغة حتّى النهاية؟');

const asgharForge = {
  key: 'baqi-asghar',
  /**
   * He finds it on gaps that grow one cell at a time (inquiries.js). The mirror then tests his rule on what HE saw there:
   * for each plank, the most cells it left, the step where b cells took one more plank, the gap it filled — and what he
   * said that the strip did not do.
   */
  inquiry: CYCLE_INQUIRY,
  fromInquiry(result) {
    const rows = [];
    const add = (c) => {
      if (!rows.some((x) => leftId(x) === leftId(c))) rows.push(c);
    };
    for (const { b, steps } of result.rounds) {
      const top = steps.find((st) => st.r === b - 1);
      const fall = steps.find((st, i) => i > 0 && st.r === 0);
      if (top) add(leftCase(b, Math.floor(top.a / b), b - 1));
      if (fall) {
        add(leftCase(b, fall.a / b - 1, b));
        add(leftCase(b, fall.a / b, 0));
      }
      for (const st of steps)
        if (st.said != null && st.said >= b && st.said <= 3 * b)
          add(leftCase(b, Math.max(1, Math.floor(st.a / b) - 1), st.said));
    }
    for (const p of result.probes ?? []) {
      const k = Math.max(1, p.from / p.b);
      add(leftCase(p.b, k, p.b - 1));
      add(leftCase(p.b, k, p.b));
      if (p.said.max > p.b && p.said.max <= 3 * p.b) add(leftCase(p.b, k, p.said.max));
    }
    return { rows };
  },
  slots: [
    { id: 'from', label: 'أقلّ ما يتركه اللوح فارغًا', options: options(A_FROM) },
    { id: 'to', label: 'أكثر ما يتركه اللوح فارغًا', options: options(A_TO) },
  ],
  says: asgharSays,
  isTheRule: isAsghar,
  ruleText: (rule) => `ما يتركه لوح فارغًا، مهما كانت الهوّة: ${AF[rule.from].label} ${AT[rule.to].label}.`,
  explain(rule, c) {
    const [lo, hi] = asgharRange(rule, c.b);
    const here = c.n === 0 ? 'لا خانة فارغة' : emptyCellsOf(c.n);
    return `مع اللوح ${c.b} قاعدتك تترك من ${lo} إلى ${hi}. هنا ${here}: قاعدتك تقول « ${asgharSays(rule, c) ? 'نعم' : 'لا'} ».`;
  },
  caseId: leftId,
  evidence: keepOwn('asghar', leftId),
  predictCases: (rows, rand = Math.random) =>
    oneOfEach(A_POOL, rows, rand, leftId, [
      (c) => c.held && c.n >= 3,
      (c) => !c.held && c.n > c.b,
      (c) => c.held && c.n === c.b - 1,
      (c) => !c.held && c.n === c.b,
      (c) => c.held && c.n === 0,
    ]),
  /** A wrong rule: the first new stop where the world does otherwise. The right one: a long leftover, a leftover of b. */
  attacks(rule, rows) {
    if (!isAsghar(rule)) return firstBreak(A_POOL, rows, (c) => asgharSays(rule, c), leftId);
    return fresh(rows, leftId, [leftCase(13, 2, 12), leftCase(15, 2, 15), leftCase(16, 3, 15), leftCase(11, 4, 11)]);
  },
  // never a choice between two written rules: one more pair of stops — the same plank, one empty cell more
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [leftCase(5, 3, 4), leftCase(5, 3, 5)] };
    if (n === 2) return { kind: 'experiment', cases: [leftCase(10, 2, 9), leftCase(10, 2, 10)] };
    return { kind: 'experiment', cases: [leftCase(14, 2, 13), leftCase(14, 2, 14)] };
  },
  use: {
    make: (rand = Math.random) => ({ b: pickWith(rand)([23, 36, 47, 58]), held: true }),
    lines: () => [
      {
        dir: 'rtl',
        tokens: ['يبقى فارغًا من', slot('lo', 'أقلّ ما يبقى', 2), 'إلى', slot('hi', 'أكثر ما يبقى', 2), 'خانة'],
      },
    ],
    check(c, vals) {
      const [lo, hi] = [Number(vals.lo), Number(vals.hi)];
      if (lo !== 0) return 'lo';
      if (hi === c.b - 1) return 'ok';
      return hi === c.b ? 'same' : hi > c.b ? 'big' : 'small';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة البقايا',
    log: 'هوّات كبرت أمامك',
    ask: (c) => `${stopOf(c)} ${stopAsk(c)}`,
    yes: 'نعم',
    no: 'لا',
    fact: (c) =>
      c.n === 0
        ? 'لم تبقَ أيّ خانة فارغة: انتهى وضع الألواح.'
        : c.held
          ? `اللوح ${c.b} لا يدخل في ${ofCells(c.n)}: بقيت فارغة.`
          : `اللوح ${c.b} دخل في الخانات الفارغة: ${restOf(c.r)}.`,
    eq: restEq,
    next: 'هوّة أخرى',
    frame: 'ما يتركه لوح فارغًا، مهما كانت الهوّة:',
    buildLead: 'اختر بطاقتين: أقلّ ما يتركه لوح، وأكثر ما يتركه. المرآة ستجرّب قاعدتك على الهوّات التي كبرت أمامك.',
    testing: 'المرآة تمرّ على الهوّات التي كبرت أمامك، وتسأل قاعدتك…',
    says: (yes) => `قاعدتك: ${yes ? 'نعم' : 'لا'}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ اللوح ${m.b} ${m.says ? 'يترك' : 'لا يترك أبدًا'} ${
        m.n === 0 ? 'الهوّة بلا خانة فارغة' : emptyCellsOf(m.n, { acc: true })
      } — لكنّك رأيت ${m.held ? (m.n === 0 ? 'هوّة امتلأت تمامًا' : 'هذه الخانات تبقى فارغة') : 'لوحًا آخر يدخل فيها'}.`,
    agreed: 'قاعدتك توافق كلّ ما رأيتَه. الآن المرآة تتحدّاها.',
    attack: (c) => `المرآة تتحدّى قاعدتك: ${stopOf(c)} ${stopAsk(c)} ماذا تقول قاعدتك؟`,
    fire: 'ضع الألواح',
    survived: 'صمدت قاعدتك: المرآة فعلت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'نعم' : 'لا'} »، و${yes ? 'دخل لوح آخر' : 'لم يدخل أيّ لوح آخر'}.`,
    wordsHint: 'مثال: مع لوح يبقى فارغًا…',
    experiment: 'انظر جيّدًا: اللوح نفسه، وخانة فارغة أكثر في المرّة الثانية. ماذا فعل اللوح؟',
    tryKey: (c) => `ألواح طولها ${c.b}، وهوّة لا تراها. المرآة لا تبني: ما أقلّ ما يمكن أن يبقى فارغًا؟ وما أكثره؟`,
    use: {
      lo: 'عندما تملأ الألواح الهوّة تمامًا، كم خانة تبقى فارغة؟',
      same: 'خانات بطول اللوح تأخذ لوحًا آخر: لا تبقى فارغة.',
      big: 'خانات أكثر من طول اللوح تأخذ لوحًا آخر.',
      small: 'يمكن أن يبقى أكثر من ذلك دون أن يدخل لوح آخر.',
    },
    useOk: 'عرفتَ ما يتركه لوح لم تضعه قطّ: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. « مساواة القسمة » — the gap from its planks and its piece ─────────────────────────

const M_FIRST = [
  { id: 'bq', label: 'طول اللوح مضروبًا في عدد الألواح', of: (b, q) => b * q, tex: (b, q) => `${b} × ${q}` },
  { id: 'bPlusQ', label: 'طول اللوح زائد عدد الألواح', of: (b, q) => b + q, tex: (b, q) => `${b} + ${q}` },
  { id: 'br', label: 'طول اللوح مضروبًا في الخانات الباقية', of: (b, q, r) => b * r, tex: (b, q, r) => `${b} × ${r}` },
  { id: 'q', label: 'عدد الألواح وحده', of: (b, q) => q, tex: (b, q) => `${q}` },
];
const M_THEN = [
  { id: 'plusR', label: 'ثمّ أضيف الخانات الباقية', of: (x, q, r) => x + r, tex: (q, r) => ` + ${r}` },
  { id: 'minusR', label: 'ثمّ أطرح الخانات الباقية', of: (x, q, r) => x - r, tex: (q, r) => ` - ${r}` },
  { id: 'plusQ', label: 'ثمّ أضيف عدد الألواح', of: (x, q) => x + q, tex: (q) => ` + ${q}` },
  { id: 'none', label: 'ولا أضيف شيئًا', of: (x) => x, tex: () => '' },
];
const MF = byId(M_FIRST);
const MT = byId(M_THEN);
const musawatValue = (rule, c) => MT[rule.then].of(MF[rule.first].of(c.b, c.pq, c.pr), c.pq, c.pr);
const musawatSays = (rule, c) => musawatValue(rule, c) === c.n;
const isMusawat = (rule) => rule?.first === 'bq' && rule?.then === 'plusR';
const lying = (b, q, r) =>
  `${q === 0 ? `لا لوح طوله ${b}` : q === 1 ? `لوح واحد طوله ${b}` : q === 2 ? `لوحان طولهما ${b}` : `${planksOf(q)} طولها ${b}`}${r ? `، وقطعة من ${ofCells(r)}` : ''}`;
/** q planks of b and a piece of r cells lie on a gap under a cloth; the sentence says it is n cells long. */
const gapCase = (b, pq, pr, n) => {
  const a = b * pq + pr;
  const c = outcome(a, b);
  const held = n === a;
  return {
    ...c,
    f: 'musawat',
    pq,
    pr,
    n,
    held,
    fits: c.held,
    text: `${lying(b, pq, pr)}: الهوّة ${cellsOf(n)}`,
    tag: held ? 'صحيحة' : `الهوّة ${a}`,
  };
};
const gapId = (c) => `${c.b}:${c.pq}:${c.pr}:${c.n}`;
/**
 * Every gap a mirror can draw: planks 3 … 12, 1 … 9 of them, a piece shorter than a plank, 126 cells at most — those with
 * two planks or more and a piece first (an attack is then a gap worth looking at, not one plank on its own).
 */
const M_POOL = (() => {
  const out = [];
  for (let b = 3; b <= 12; b += 1)
    for (let q = 1; q <= 9; q += 1) for (let r = 0; r < b; r += 1) if (b * q + r <= 126) out.push([b, q, r]);
  const rich = ([, q, r]) => q >= 2 && r > 0;
  return [...out.filter(rich), ...out.filter((x) => !rich(x))];
})();
const M_PREDICT = M_POOL.filter(([b, q, r]) => b * q + r <= 60).flatMap(([b, q, r]) =>
  [...new Set([b * q + r, b + q + r, b * q, b * r + q])].filter((n) => n > 0).map((n) => gapCase(b, q, r, n)),
);
/** The gap of island D, which the experiment hid first: 52 = 6 × 8 + 4. */
const { rests: RS } = NUMBERS;
const RS_Q = Math.floor(RS.a / RS.probe);

const musawatForge = {
  key: 'musawat-qisma',
  /** He finds it by saying the gap before the cloth is lifted (inquiries.js); the mirror tests his rule on those gaps. */
  inquiry: REBUILD_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rounds.flatMap((x) => [
      gapCase(x.b, x.q, x.r, x.a),
      ...(x.said != null && x.said !== x.a ? [gapCase(x.b, x.q, x.r, x.said)] : []),
    ]),
  }),
  slots: [
    { id: 'first', label: 'ماذا أحسب أوّلًا؟', options: options(M_FIRST) },
    { id: 'then', label: 'ثمّ؟', options: options(M_THEN) },
  ],
  says: musawatSays,
  isTheRule: isMusawat,
  ruleText: (rule) => `طول الهوّة تحت القماش: ${MF[rule.first].label}، ${MT[rule.then].label}.`,
  explain(rule, c) {
    const v = musawatValue(rule, c);
    const tex = `${MF[rule.first].tex(c.b, c.pq, c.pr)}${MT[rule.then].tex(c.pq, c.pr)} = ${v}`;
    return `قاعدتك تحسب ${math(tex)}: الهوّة عندها ${v}، فالجملة عندها « ${v === c.n ? 'صحيحة' : 'خاطئة'} ».`;
  },
  caseId: gapId,
  evidence: keepOwn('musawat', gapId),
  predictCases: (rows, rand = Math.random) =>
    oneOfEach(M_PREDICT, rows, rand, gapId, [
      (c) => c.held && c.pr > 0,
      (c) => !c.held && c.n === c.b + c.pq + c.pr,
      (c) => c.held && c.pr === 0,
      (c) => !c.held && c.n === c.b * c.pq,
      (c) => c.held && c.pq >= 5,
    ]),
  /** A wrong rule: the first new gap where the cloth shows another length. The right one: a long gap, a wrong sentence. */
  attacks(rule, rows) {
    if (!isMusawat(rule)) {
      const pool = M_POOL.map(([b, q, r]) => {
        const v = musawatValue(rule, { b, pq: q, pr: r });
        return gapCase(b, q, r, v > 0 ? v : b * q + r);
      });
      return firstBreak(pool, rows, (c) => musawatSays(rule, c), gapId);
    }
    return fresh(rows, gapId, [
      gapCase(11, 9, 10, 109),
      gapCase(9, 6, 4, 19),
      gapCase(12, 8, 11, 107),
      gapCase(7, 0, 5, 5),
    ]);
  },
  // never a choice between two written rules: one more pair of gaps with ONE change between them — the piece, then
  // the number of planks, then the length of the plank
  nudge(n) {
    if (n === 1)
      return {
        kind: 'experiment',
        cases: [gapCase(RS.probe, RS_Q, RS.a % RS.probe, RS.a), gapCase(RS.probe, RS_Q, 0, RS.probe * RS_Q)],
      };
    if (n === 2) return { kind: 'experiment', cases: [gapCase(5, 4, 3, 23), gapCase(5, 6, 3, 33)] };
    return { kind: 'experiment', cases: [gapCase(6, 3, 5, 23), gapCase(9, 3, 5, 32)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [b, q, r] = pickWith(rand)([
        [23, 21, 9],
        [17, 35, 12],
        [42, 15, 30],
        [19, 26, 7],
      ]);
      return { b, q, r, held: true };
    },
    lines: (c) => [
      { dir: 'ltr', tokens: [String(c.b), '×', String(c.q), '+', String(c.r), '=', slot('a', 'طول الهوّة', 4)] },
    ],
    check: (c, vals) => (Number(vals.a) === c.b * c.q + c.r ? 'ok' : 'a'),
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة البنّاء',
    log: 'هوّات تحت القماش',
    ask: () => 'هل هذا طول الهوّة؟',
    yes: 'صحيحة',
    no: 'خاطئة',
    fact: (c) => `تحت القماش هوّة من ${ofCells(c.a)}${c.held ? '.' : `، لا ${c.n}.`}`,
    eq: (c) => math(`${c.b} × ${c.pq} + ${c.pr} = ${c.a}`),
    next: 'جملة أخرى',
    frame: 'طول الهوّة تحت القماش:',
    buildLead: 'اختر بطاقتين: كيف تحسب طول الهوّة من ألواحها وقطعتها؟ المرآة ستجرّب قاعدتك على الهوّات التي رأيتَها.',
    testing: 'المرآة ترفع القماش عن كلّ هوّة رأيتَها، وتسأل قاعدتك…',
    says: (yes) => `قاعدتك: ${yes ? 'صحيحة' : 'خاطئة'}`,
    refuted: (m) => `قاعدتك تقول إنّ الجملة ${m.says ? 'صحيحة' : 'خاطئة'} — لكنّ الهوّة تحت القماش ${cellsOf(m.a)}.`,
    agreed: 'قاعدتك توافق كلّ الهوّات التي رأيتَها. الآن المرآة تتحدّاها بجمل جديدة.',
    attack: () => 'المرآة تتحدّى قاعدتك بجملة جديدة: هل هي صحيحة؟ ماذا تقول قاعدتك؟',
    fire: 'ارفع القماش',
    survived: 'صمدت قاعدتك: القماش رُفع عن الطول الذي قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'صحيحة' : 'خاطئة'} »، والهوّة ${yes ? 'ليست بهذا الطول' : 'بهذا الطول بالضبط'}.`,
    wordsHint: 'مثال: طول الهوّة هو…',
    experiment: 'انظر جيّدًا: هوّتان، وبينهما تغيير واحد. ماذا تغيّر في طول الهوّة؟',
    tryKey: (c) =>
      `زيرو وضع ${planksOf(c.q, { acc: true })} طولها ${c.b}، وبقيت قطعة من ${ofCells(c.r)}. الهوّة أطول من أن تُرى تحت القماش. المرآة لا تبني: كم طولها؟`,
    use: { a: 'كم خانة تغطّي الألواح كلّها؟ ثمّ لا تنسَ القطعة الباقية.' },
    useOk: 'عرفتَ طول الهوّة دون أن ترفع القماش: مفتاحك يعمل!',
  },
};

// ───────────────────────── 4. « تقدير الحاصل » — a long gap, a long plank ─────────────────────────

const T_TENS = [
  { id: 'big', label: 'أكبر عدد من عشرات الألواح لا يتجاوز الهوّة', t: (a, b) => Math.floor(a / (10 * b)) },
  { id: 'near', label: 'عدد عشرات الألواح الأقرب إلى طول الهوّة، ولو تجاوزها', t: (a, b) => Math.round(a / (10 * b)) },
  { id: 'first', label: 'أوّل عدد من عشرات الألواح يتجاوز الهوّة', t: (a, b) => Math.floor(a / (10 * b)) + 1 },
];
const T_UNITS = [
  { id: 'big', label: 'أكبر عدد من الألواح يتّسع له ما بقي', u: (left, b) => (left >= 0 ? Math.floor(left / b) : 0) },
  { id: 'none', label: 'لا شيء: أكتفي بالعشرات', u: () => 0 },
  { id: 'one', label: 'لوح واحد فقط', u: () => 1 },
  { id: 'cells', label: 'عدد الخانات التي بقيت', u: (left) => Math.max(0, left) },
];
const TT = byId(T_TENS);
const TU = byId(T_UNITS);
/** The rule's planks: tens first (10 × t planks), then u single planks on what is left. */
const taqdirParts = (rule, a, b) => {
  const tens = 10 * TT[rule.tens].t(a, b);
  const left = a - b * tens;
  return { tens, left, units: TU[rule.units].u(left, b) };
};
const taqdirValue = (rule, a, b) => {
  const p = taqdirParts(rule, a, b);
  return p.tens + p.units;
};
const taqdirSays = (rule, c) => taqdirValue(rule, c.a, c.b) === c.n;
const isTaqdir = (rule) => rule?.tens === 'big' && rule?.units === 'big';
const tCase = (a, b, n) => claimCase('taqdir', a, b, n);
/** Long gaps the mirror draws as a bar: 200 … 800 cells, planks 12 … 40, between 10 and 40 planks. */
const T_GAPS = (() => {
  const out = [];
  for (let a = 200; a <= 800; a += 1)
    for (let b = 12; b <= 40; b += 1) {
      const q = Math.floor(a / b);
      if (q >= 10 && q <= 40) out.push([a, b]);
    }
  return out;
})();
const T_PREDICT = T_GAPS.filter(([a, b]) => (a + b) % 7 === 0).flatMap(([a, b]) => {
  const q = Math.floor(a / b);
  return [q, q + 10, q - 10, 10 * Math.round(a / (10 * b))].filter((n) => n > 0).map((n) => tCase(a, b, n));
});
/** « لا شيء », « لوحًا واحدًا », « 20 لوحًا » — what a step of the rule lays. */
const lays = (n) => (n === 0 ? 'لا شيء' : planksOf(n, { acc: true }));

const taqdirForge = {
  key: 'taqdir-hasil',
  /** He finds it on the ruler of tens, then of single planks (inquiries.js); the mirror tests his rule on those gaps. */
  inquiry: ESTIMATE_INQUIRY,
  fromInquiry: (result) => ({ rows: result.rounds.map((x) => tCase(x.a, x.b, x.q)) }),
  slots: [
    { id: 'tens', label: 'أوّلًا، عشرات الألواح:', options: options(T_TENS) },
    { id: 'units', label: 'ثمّ، الألواح المفردة:', options: options(T_UNITS) },
  ],
  says: taqdirSays,
  isTheRule: isTaqdir,
  ruleText: (rule) =>
    `لأعرف كم لوحًا كاملًا تأخذ هوّة طويلة: أوّلًا ${TT[rule.tens].label}، ثمّ ${TU[rule.units].label}.`,
  explain(rule, c) {
    const p = taqdirParts(rule, c.a, c.b);
    const v = p.tens + p.units;
    const first = `${math(`${c.b} × ${p.tens} = ${c.b * p.tens}`)}${p.left < 0 ? `، أطول من ${c.a}` : ''}`;
    return `قاعدتك تضع أوّلًا ${lays(p.tens)} (${first})، ثمّ ${lays(p.units)}: المجموع ${v}. إذن تقول « ${v === c.n ? 'نعم' : 'لا'} ».`;
  },
  caseId: claimId,
  evidence: keepOwn('taqdir', claimId),
  predictCases: (rows, rand = Math.random) =>
    oneOfEach(T_PREDICT, rows, rand, claimId, [
      (c) => c.held && c.r > 0,
      (c) => !c.held && c.n === c.q + 10,
      (c) => c.held && c.q % 10 >= 5,
      (c) => !c.held && c.n % 10 === 0,
      (c) => c.held,
    ]),
  /** A wrong rule: the first new long gap where the world lays another count. The right one: two gaps it has not seen. */
  attacks(rule, rows) {
    if (!isTaqdir(rule)) {
      const pool = T_GAPS.map(([a, b]) => tCase(a, b, taqdirValue(rule, a, b)));
      return firstBreak(pool, rows, (c) => taqdirSays(rule, c), claimId);
    }
    return fresh(rows, claimId, [tCase(812, 27, 30), tCase(950, 46, 21), tCase(777, 37, 21), tCase(640, 29, 23)]);
  },
  // never a choice between two written rules: one more pair of long gaps — ten planks more, or a few cells more
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [tCase(270, 27, 10), tCase(540, 27, 20)] };
    if (n === 2) return { kind: 'experiment', cases: [tCase(600, 25, 24), tCase(620, 25, 24)] };
    return { kind: 'experiment', cases: [tCase(700, 34, 20), tCase(714, 34, 21)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [5000, 48],
        [2750, 64],
        [4321, 37],
        [1998, 23],
      ]);
      return { a, b, held: true };
    },
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.a), '=', String(c.b), '×', slot('q', 'عدد الألواح', 3), '+', slot('r', 'الخانات الباقية', 3)],
      },
    ],
    check(c, vals) {
      const [q, r] = [Number(vals.q), Number(vals.r)];
      if (c.b * q + r !== c.a) return 'sum';
      return r < c.b ? 'ok' : 'big';
    },
  },
  text: {
    ...claimText,
    title: 'مرآة جزيرة المنظار',
    log: 'هوّات طويلة',
    frame: 'كم لوحًا كاملًا تأخذ هوّة طويلة؟',
    buildLead: 'اختر بطاقتين: ماذا تضع أوّلًا، وماذا بعده؟ المرآة ستجرّب قاعدتك على الهوّات التي قدّرتَها.',
    testing: 'المرآة تمرّ على الهوّات التي قدّرتَها، وتسأل قاعدتك عن كلّ واحدة…',
    agreed: 'قاعدتك توافق كلّ الهوّات التي قدّرتَها. الآن المرآة تتحدّاها بهوّتين جديدتين.',
    fire: 'ضع الألواح',
    wordsHint: 'مثال: أضع أوّلًا…',
    experiment: 'انظر جيّدًا: اللوح نفسه، وهوّتان. كم عشرة من الألواح دخلت في كلّ واحدة؟',
    tryKey: (c) =>
      `هوّة من ${ofCells(c.a)} وألواح طولها ${c.b}. المرآة لا تبني: اكتب كم لوحًا كاملًا تأخذ، وكم خانة تبقى.`,
    use: {
      sum: 'تحقّق: الألواح كلّها مع الخانات الباقية يجب أن تعطي طول الهوّة.',
      big: 'ما بقي يتّسع للوح آخر على الأقلّ: أضف الألواح التي تدخل فيه.',
    },
    useOk: 'هوّة من آلاف الخانات، دون أن تضع الألواح واحدًا واحدًا: مفتاحك يعمل!',
  },
};

// ───────────────────────── 5. « الباقي في مسألة » — the same division, three questions ─────────────────────────
// At the cable-car station of island H nothing is built: a travellers wait, a cabin carries b. ONE division
// a = b × q + r, and three questions it answers differently. In the mirror every traveller is a cell and every FULL
// cabin a plank: the cells left are the travellers still at the station. A case is a SENTENCE with a number; the mirror
// fills the cabins and the station shows whether that number is the answer — a cabin too few leaves travellers
// behind, a cabin too many leaves empty.

/** The three questions, by id. */
const P_ASK = {
  full: 'العربات الممتلئة',
  need: 'العربات اللازمة ليعبر الجميع',
  left: 'المسافرون خارج العربات الممتلئة',
};
const P_TYPES = Object.keys(P_ASK);
/** The same three, in one word each (inside the written rule). */
const P_CHIP = { full: 'الممتلئة', need: 'اللازمة', left: 'خارجها' };
const P_FULL = [
  { id: 'q', label: 'حاصل القسمة', of: (q) => q },
  { id: 'q1', label: 'حاصل القسمة زائد 1', of: (q) => q + 1 },
  { id: 'r', label: 'باقي القسمة', of: (q, r) => r },
];
const P_NEED = [
  { id: 'q', label: 'حاصل القسمة دائمًا', of: (q) => q },
  { id: 'q1', label: 'حاصل القسمة زائد 1 دائمًا', of: (q) => q + 1 },
  { id: 'cond', label: 'حاصل القسمة، وأزيد 1 إذا بقي أحد', of: (q, r) => q + (r > 0 ? 1 : 0) },
  { id: 'qr', label: 'حاصل القسمة زائد الباقي', of: (q, r) => q + r },
];
const P_LEFT = [
  { id: 'r', label: 'باقي القسمة', of: (q, r) => r },
  { id: 'q', label: 'حاصل القسمة', of: (q) => q },
  { id: 'lack', label: 'ما ينقص لتمتلئ عربة أخرى', of: (q, r, b) => b - r },
];
const P_OPTIONS = { full: byId(P_FULL), need: byId(P_NEED), left: byId(P_LEFT) };
/** What the division really answers to each question. */
const masalaTruth = (t, { q, r }) => (t === 'full' ? q : t === 'need' ? q + (r > 0 ? 1 : 0) : r);
/** What the student's rule answers to question t of a station (a travellers, cabins of b). */
const masalaValue = (rule, t, a, b) => P_OPTIONS[t][rule[t]].of(Math.floor(a / b), a % b, b);
const masalaSays = (rule, c) => masalaValue(rule, c.t, c.a, c.b) === c.n;
const isMasala = (rule) => rule?.full === 'q' && rule?.need === 'cond' && rule?.left === 'r';
/** The sentence « question t of this station is answered by n ». */
const pCase = (t, a, b, n) => {
  const c = outcome(a, b);
  const truth = masalaTruth(t, c);
  const held = n === truth;
  return {
    ...c,
    f: 'masala',
    t,
    n,
    held,
    fits: c.held,
    text: `${travellersOf(a)}، وكلّ عربة تحمل ${b} — ${P_ASK[t]}: ${n}`,
    tag: held ? 'صحيحة' : `خاطئة: ${truth}`,
  };
};
const pId = (c) => `${c.t}:${c.a}:${c.b}:${c.n}`;
/** What the station shows once the mirror has filled the cabins (the verb comes first: feminine before « عربة »). */
const station = (c) =>
  c.q === 0
    ? `لم تمتلئ أيّ عربة، وبقي في المحطّة ${travellersOf(c.r)}`
    : c.r === 0
      ? `امتلأت ${cabinsOf(c.q)}، ولم يبقَ أحد في المحطّة`
      : `امتلأت ${cabinsOf(c.q)}، وبقي في المحطّة ${travellersOf(c.r)}`;
/** What the number of the sentence does at that station, when it speaks of the cabins needed. */
function needTail(c) {
  const need = masalaTruth('need', c);
  if (c.n === 0) return ' دون أيّ عربة لا يعبر أحد.';
  if (c.n < need) return ` لا تكفي ${cabinsOf(c.n)}: يبقى ${travellersOf(c.a - c.b * c.n)} دون عربة.`;
  if (c.n > need) return ` تكفي ${cabinsOf(need)}: تبقى ${cabinsOf(c.n - need)} دون أيّ مسافر.`;
  return c.r > 0 ? ` عربة أخرى تأخذهم ولا تمتلئ: تلزم ${cabinsOf(need)}.` : ` تلزم ${cabinsOf(need)} بالضبط.`;
}
/** Every station a mirror can draw: 14 … 60 travellers, cabins of 4 … 9, between 2 and 9 full cabins. */
const P_STATIONS = (() => {
  const out = [];
  for (let a = 14; a <= 60; a += 1)
    for (let b = 4; b <= 9; b += 1) if (Math.floor(a / b) >= 2 && Math.floor(a / b) <= 9) out.push([a, b]);
  return out;
})();
const P_PREDICT = P_STATIONS.flatMap(([a, b]) => {
  const { q, r } = outcome(a, b);
  const said = { full: [q, q + 1, r], need: [q, q + 1, q + r], left: [r, q, b - r] };
  return P_TYPES.flatMap((t) => [...new Set(said[t])].map((n) => pCase(t, a, b, n)));
});

const masalaForge = {
  key: 'baqi-fi-masala',
  // no investigation: the rule is ONE decision on a case — the mirror alone (predict, write, test, attack)
  slots: [
    { id: 'full', label: `${P_ASK.full}:`, options: options(P_FULL) },
    { id: 'need', label: `${P_ASK.need}:`, options: options(P_NEED) },
    { id: 'left', label: `${P_ASK.left}:`, options: options(P_LEFT) },
  ],
  /** Inside the rule a tile is written with its question, in one word: three tiles alone would not say what each answers. */
  chip: (s, o) => `${P_CHIP[s.id]}: ${o.label}`,
  says: masalaSays,
  isTheRule: isMasala,
  ruleText: (rule) =>
    `بعد القسمة الإقليدية: ${P_TYPES.map((t) => `${P_ASK[t]} — ${P_OPTIONS[t][rule[t]].label}`).join('؛ ')}.`,
  explain(rule, c) {
    const v = masalaValue(rule, c.t, c.a, c.b);
    return `${math(`${c.a} = ${c.b} × ${c.q} + ${c.r}`)}. عن « ${P_ASK[c.t]} » قاعدتك تجيب: ${P_OPTIONS[c.t][rule[c.t]].label}، أي ${v}. الجملة تقول ${c.n}: هي عندها « ${v === c.n ? 'صحيحة' : 'خاطئة'} ».`;
  },
  caseId: pId,
  /** His evidence: the stations the mirror has filled in front of him (his predictions, then the robot's experiments). */
  evidence: keepOwn('masala', pId),
  predictCases: (rows, rand = Math.random) =>
    oneOfEach(P_PREDICT, rows, rand, pId, [
      (c) => c.t === 'full' && c.held && c.r > 0,
      // the classic: as many cabins as the quotient — travellers stay at the station
      (c) => c.t === 'need' && !c.held && c.n === c.q && c.r > 0,
      (c) => c.t === 'need' && c.held && c.r > 0,
      // … and one cabin more when nobody is left: it leaves empty
      (c) => c.t === 'need' && !c.held && c.n === c.q + 1 && c.r === 0,
      (c) => c.t === 'left' && c.held && c.r > 0,
      (c) => c.t === 'need' && c.held && c.r === 0,
    ]),
  /**
   * A wrong rule: the first new station where ITS OWN answer is not what the station shows — the world carries out
   * his decision. The right one: a cabin that is not full, a cabin too many.
   */
  attacks(rule, rows) {
    if (!isMasala(rule)) {
      const pool = P_STATIONS.flatMap(([a, b]) =>
        P_TYPES.map((t) => pCase(t, a, b, Math.max(0, masalaValue(rule, t, a, b)))),
      );
      return firstBreak(pool, rows, (c) => masalaSays(rule, c), pId);
    }
    return fresh(rows, pId, [
      pCase('need', 59, 8, 8),
      pCase('need', 54, 9, 7),
      pCase('left', 50, 7, 1),
      pCase('full', 47, 6, 8),
    ]);
  },
  // never a choice between two written rules: one more pair of stations — the same cabins, one traveller more
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [pCase('need', 40, 8, 5), pCase('need', 41, 8, 5)] };
    if (n === 2) return { kind: 'experiment', cases: [pCase('need', 36, 9, 4), pCase('need', 37, 9, 5)] };
    return { kind: 'experiment', cases: [pCase('full', 42, 6, 7), pCase('full', 43, 6, 7)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [130, 12],
        [248, 23],
        [196, 15],
        [270, 18],
      ]);
      return { a, b, held: true };
    },
    lines: (c) => [
      { dir: 'ltr', tokens: [String(c.a), '=', String(c.b), '×', slot('q', 'الحاصل', 3), '+', slot('r', 'الباقي', 3)] },
      { dir: 'rtl', tokens: [`${P_ASK.need}:`, slot('n', P_ASK.need, 3)] },
    ],
    check(c, vals) {
      const [q, r, n] = [Number(vals.q), Number(vals.r), Number(vals.n)];
      if (c.b * q + r !== c.a) return 'sum';
      if (r >= c.b) return 'big';
      if (n === q + (r > 0 ? 1 : 0)) return 'ok';
      return n === q ? 'few' : 'need';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة التليفريك',
    log: 'مسائل في المرآة',
    ask: () => 'في المرآة كلّ خانة مسافر، وكلّ لوح عربة ممتلئة. هل هذه الجملة صحيحة؟',
    yes: 'صحيحة',
    no: 'خاطئة',
    fact: (c) => `${station(c)}.${c.t === 'need' ? needTail(c) : ''}`,
    eq: restEq,
    next: 'مسألة أخرى',
    frame: 'من القسمة الإقليدية، أيّ عدد يجيب عن كلّ سؤال؟',
    buildLead: 'اختر ثلاث بطاقات، واحدة لكلّ سؤال. المرآة ستجرّب قاعدتك على المسائل التي رأيتَها.',
    testing: 'المرآة تمرّ على المسائل التي رأيتَها، وتسأل قاعدتك عن كلّ واحدة…',
    says: (yes) => `قاعدتك: ${yes ? 'صحيحة' : 'خاطئة'}`,
    refuted: (m) =>
      `قاعدتك تقول إنّ الجملة ${m.says ? 'صحيحة' : 'خاطئة'} — لكنّك رأيت في المحطّة: ${station(m)}${
        m.t === 'need' ? `، فتلزم ${cabinsOf(masalaTruth('need', m))}` : ''
      }.`,
    agreed: 'قاعدتك توافق كلّ المسائل التي رأيتَها. الآن المرآة تتحدّاها.',
    attack: () => 'المرآة تتحدّى قاعدتك بمسألة جديدة: هل الجملة صحيحة؟ ماذا تقول قاعدتك؟',
    fire: 'املأ العربات',
    survived: 'صمدت قاعدتك: المحطّة أظهرت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'صحيحة' : 'خاطئة'} »، والمحطّة ${yes ? 'أظهرت عددًا آخر' : 'أظهرت هذا العدد بالضبط'}.`,
    wordsHint: 'مثال: العربات اللازمة هي…',
    experiment: 'انظر جيّدًا: العربات نفسها، ثمّ مسافر واحد أكثر. ماذا تغيّر في المحطّة؟',
    tryKey: (c) =>
      `${travellersOf(c.a)} في المحطّة، وكلّ عربة تحمل ${c.b}. المرآة لا تبني: أجرِ القسمة الإقليدية، ثمّ اكتب كم عربة تلزم ليعبر الجميع.`,
    use: {
      sum: 'تحقّق: العربات الممتلئة مع من بقي يجب أن تعطي عدد المسافرين كلّهم.',
      big: 'من بقوا يملؤون عربة أخرى على الأقلّ: أكمل القسمة أوّلًا.',
      few: 'بهذا العدد من العربات يبقى مسافرون في المحطّة.',
      need: 'انظر إلى الحاصل وإلى الباقي: كم عربة تمتلئ؟ وهل بقي أحد في المحطّة؟',
    },
    useOk: 'عرفتَ عدد العربات دون أن ترى المحطّة: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'majmuaat-kamila': kamilaForge,
  'baqi-asghar': asgharForge,
  'musawat-qisma': musawatForge,
  'taqdir-hasil': taqdirForge,
  'baqi-fi-masala': masalaForge,
};
