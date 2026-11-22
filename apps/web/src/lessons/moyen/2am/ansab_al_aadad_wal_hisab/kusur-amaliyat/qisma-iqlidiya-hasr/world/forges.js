/**
 * THE THREE FORGES of lesson « القسمة الإقليدية وحصر حاصل القسمة » — one per key, in the order of the story; no rule of
 * this lesson is told (frame: kit/forge.js; the bridges: divisorIsles/ruleForge.js; « استكشف »: GAME_WORLD.md).
 *   qisma-ay-adad  estimate   what is NEW here is the long plank (three digits): its multiples are not known by heart, so
 *                             each digit of the count of planks is TRIED — estimated with the plank rounded to a hundred —
 *                             then JUDGED by its product with the plank itself: too big when the product passes what is
 *                             left, too small when what is left after it takes one more plank. (The first year's rule —
 *                             tens of planks, then planks — is not forged again: the story recalls it on island B.)
 *   hasr-hasil     bracket    a ÷ b lies between the full planks and that number plus one (b × q ≤ a < b × (q + 1))
 *   inidam-baqi    the mirror alone (one condition on a case): a bridge holds, and « a يقبل القسمة على b », « a مضاعف
 *                             للعدد b », « b يقسم a » are true, exactly when the remainder is 0
 * The first two are a procedure and a bracketing: each opens on an experiment of its own kind (inquiries.js), then the
 * student writes his rule with the tiles. A CASE of the first is a TRIAL — a count of planks tried on what is left — and
 * of the second a written bracket; the world says whether the planks really make it (`held`), and his rule « says yes »
 * when it accepts exactly that. The tiles let him write the false rules students really hold, and exactly ONE rule
 * survives (`forges.test.js` writes every rule of every forge and refutes each wrong one by a computed case).
 * A name comes only after its seal: no sentence of a forge says the name of its key (« حصر », « انعدام »).
 */
import { EVIDENCE_MAX, slot } from '../../../../../../common/gameworld/kit/forge';
import {
  BRIDGE_TEXT,
  checkDivision,
  outcome,
  pickWith,
} from '../../../../../../common/gameworld/divisorIsles/ruleForge';
import { bracketSays, estimateSteps } from '../../../../../../common/gameworld/divisorIsles/inquiry';
import { agree, cells, planks, planksOf } from './counted';
import { ESTIMATE_INQUIRY, BRACKET_INQUIRY } from './inquiries';

/** An equality inside an Arabic sentence: a formula — the screen renders it with MathText, left to right. */
const math = (s) => ['$', s.replaceAll('×', '\\times'), '$'].join('');
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const options = (list) => list.map(({ id, label }) => ({ id, label }));
/** One line per different case, in the order they came; only the cases of THIS forge (those `own` recognises). */
const keepOwn = (own, idOf) => (rows) =>
  rows.filter((row, i) => own(row) && rows.findIndex((x) => own(x) && idOf(x) === idOf(row)) === i);
/** The (gap, plank) pairs the mirror of the second forge can draw and play: gaps 20 … 300, planks 3 … 40, 2 … 30 planks. */
const PAIRS = (() => {
  const out = [];
  for (let a = 20; a <= 300; a += 1)
    for (let b = 3; b <= 40; b += 1) {
      const q = Math.floor(a / b);
      if (q >= 2 && q <= 30) out.push({ a, b, q, r: a % b });
    }
  return out;
})();
/** A case the mirror can draw and play: 1 … 30 planks laid. */
const drawable = (n) => n >= 1 && n <= 30;
/**
 * THE ATTACK of a wrong rule that writes a result (`writes(a, b)` → a case): on the first pair it gets wrong and he has
 * not seen, the mirror shows what the rule WRITES and the planks do otherwise; when the rule writes nothing it can draw,
 * the true result, which the rule does not write.
 */
function firstWrong(rule, rows, { writes, truth, says, idOf }) {
  const seen = new Set(rows.map(idOf));
  const fresh = (c) => c && !seen.has(idOf(c)) && says(rule, c) !== c.held;
  for (const p of PAIRS) {
    const w = writes(rule, p.a, p.b);
    if (w && drawable(w.q) && fresh(w)) return [w];
  }
  for (const p of PAIRS) {
    const t = truth(p.a, p.b);
    if (fresh(t)) return [t];
  }
  return [];
}

// ───────────────────────── 1. « القسمة على أيّ عدد » — a long plank, one digit at a time ─────────────────────────

/**
 * A TRIAL: `t` planks of `b` (three digits) tried on what is left, `left` cells (fewer than ten planks). `held`: it is the
 * count the planks take — they do not pass what is left (r ≥ 0) and no other plank fits after them (r < b).
 * The mirror draws it as a bridge: a = what is left, q = the planks tried.
 */
const trial = (left, b, t) => {
  const r = left - b * t;
  const held = r >= 0 && r < b;
  return {
    kind: 'trial',
    a: left,
    b,
    q: t,
    r,
    held,
    fits: held,
    text: `${t ? planksOf(t, b) : `لا لوح طوله ${b}`} في ${cells(left, 'gen')} باقية`,
    tag: held ? 'هذا عددها' : r < 0 ? 'تتجاوز' : 'يدخل لوح آخر',
  };
};
const trialId = (c) => `${c.a}:${c.b}:${c.q}`;
/** The mirror draws what is left cell by cell: never more than this (GAME_WORLD.md « استكشف », the forge's mirror). */
const DRAW_MAX = 2600;
/** How he tries a digit: with which plank he MULTIPLIES it to judge it. */
const BY = [
  { id: 'real', label: 'أقدّره باللوح مقرّبًا إلى مئة، ثمّ أضربه في اللوح نفسه', of: (b) => b },
  {
    id: 'near',
    label: 'أقدّره باللوح مقرّبًا إلى مئة، وأضربه في هذا اللوح المقرّب',
    of: (b) => Math.round(b / 100) * 100,
  },
  { id: 'cut', label: 'أقدّره بمئات اللوح وحدها، وأضربه فيها', of: (b) => Math.floor(b / 100) * 100 },
];
/** When the digit is too big: `p` = the product he made, `left` = what is left. */
const BIG = [
  { id: 'passes', label: 'تجاوز الجداء ما بقي', test: (p, left) => p > left },
  { id: 'reach', label: 'بلغ الجداء ما بقي أو تجاوزه', test: (p, left) => p >= left },
  {
    id: 'hundreds',
    label: 'تجاوزت مئاتُ الجداء مئاتِ ما بقي',
    test: (p, left) => Math.floor(p / 100) > Math.floor(left / 100),
  },
];
/** When the digit is too small: `rest` = what is left after the product, `plank` = the plank he multiplied by. */
const SMALL = [
  { id: 'room', label: 'اتّسع ما بقي بعد الطرح للوح آخر', test: (rest, plank) => rest >= plank },
  { id: 'any', label: 'بقي شيء بعد الطرح', test: (rest) => rest > 0 },
  { id: 'over', label: 'بقي بعد الطرح أكثر من طول لوح', test: (rest, plank) => rest > plank },
];
const TB = byId(BY);
const TG = byId(BIG);
const TS = byId(SMALL);
/** What a rule computes on a trial, and what it concludes: too big, too small, or the count. */
const judge = (rule, c) => {
  const plank = TB[rule.by].of(c.b);
  const p = plank * c.q;
  const rest = c.a - p;
  const big = TG[rule.big].test(p, c.a);
  return { plank, p, rest, big, small: !big && TS[rule.small].test(rest, plank) };
};
const trialSays = (rule, c) => {
  const j = judge(rule, c);
  return !j.big && !j.small;
};
const isTrialRule = (rule) => rule?.by === 'real' && rule?.big === 'passes' && rule?.small === 'room';
/** The long planks of the mirror, and the trials it can draw: each digit, the one before and the one after. */
const LONG = [208, 248, 312, 365, 152];
const TRIALS = (() => {
  const out = [];
  for (const b of LONG)
    for (let d = 2; d <= 9 && b * d + b - 1 <= DRAW_MAX; d += 1)
      for (const r of [0, 1, 7, Math.round(b / 2), b - 7, b - 1])
        for (const t of [d - 1, d, d + 1]) if (t <= 9) out.push(trial(b * d + r, b, t));
  return out;
})();
/** Why a trial is not the count the planks take (plain words). */
const trialWhy = (c) => (c.r < 0 ? 'الألواح تتجاوز ما بقي' : `في الخانات الباقية يدخل لوح آخر طوله ${c.b}`);

const divisionForge = {
  key: 'qisma-ay-adad',
  /** He finds it on the ruler (inquiries.js); the mirror then tests his rule on the single planks HE tried and laid. */
  inquiry: ESTIMATE_INQUIRY,
  /**
   * His evidence: in each gap, the step where a mark is ONE plank — the count he laid, and before it the counts he
   * pressed that the ruler refused (they passed the flag, or left the next mark under it).
   */
  fromInquiry: (result) => ({
    rows: result.rounds.flatMap((x) => {
      const step = estimateSteps(x.a, x.b).find((s) => s.place === 0);
      const missed = (x.guesses ?? []).filter((g) => g.place === 0 && !g.ok).map((g) => trial(step.from, x.b, g.count));
      return [...missed, trial(step.from, x.b, step.q)];
    }),
  }),
  slots: [
    { id: 'by', label: 'كيف أجرّب رقمًا؟', options: options(BY) },
    { id: 'big', label: 'هو أكبر من اللازم إذا', options: options(BIG) },
    { id: 'small', label: 'هو أصغر من اللازم إذا', options: options(SMALL) },
  ],
  chip: (s, o) =>
    s.id === 'big' ? `أكبر من اللازم إذا ${o.label}` : s.id === 'small' ? `أصغر من اللازم إذا ${o.label}` : o.label,
  says: trialSays,
  isTheRule: isTrialRule,
  ruleText: (rule) =>
    `لأجد رقمًا من عدد الألواح واللوح طويل: ${TB[rule.by].label}. هو أكبر من اللازم إذا ${TG[rule.big].label}، وأصغر من اللازم إذا ${TS[rule.small].label}.`,
  explain(rule, c) {
    const j = judge(rule, c);
    const head = `قاعدتك تحسب ${math(`${j.plank} × ${c.q} = ${j.p}`)}`;
    if (j.big) return `${head}، وتقارنه بما بقي (${c.a}): تقول إنّ ${c.q} أكبر من اللازم، فليس هذا العدد.`;
    const rest = `${head} و ${math(`${c.a} - ${j.p} = ${j.rest}`)}`;
    return j.small
      ? `${rest}: تقول إنّ ${c.q} أصغر من اللازم، فليس هذا العدد.`
      : `${rest}: لا أكبر من اللازم ولا أصغر، فتقول إنّه العدد.`;
  },
  caseId: trialId,
  evidence: keepOwn((row) => row.kind === 'trial', trialId),
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const seen = new Set(rows.map(trialId));
    const used = [];
    const one = (test) => {
      const c = pick(TRIALS.filter((x) => !seen.has(trialId(x)) && !used.includes(x.a) && test(x)));
      used.push(c.a);
      return c;
    };
    return [
      one((c) => c.held && c.r > 0),
      one((c) => c.r < 0),
      one((c) => c.held && c.r === 0),
      one((c) => c.r >= c.b),
      one((c) => c.held),
    ];
  },
  /**
   * A wrong rule: the first new trial it judges otherwise than the planks — one it ACCEPTS when there is one (he then
   * sees the planks pass, or leave room). The right one: what is left is exactly one plank, no plank at all, six cells.
   */
  attacks(rule, rows) {
    const seen = new Set(rows.map(trialId));
    if (!isTrialRule(rule)) {
      const free = TRIALS.filter((c) => !seen.has(trialId(c)) && trialSays(rule, c) !== c.held);
      const best = free.find((c) => trialSays(rule, c)) ?? free[0];
      return best ? [best] : [];
    }
    return [trial(2190, 365, 5), trial(195, 208, 0), trial(1450, 208, 7)]
      .filter((c) => !seen.has(trialId(c)))
      .slice(0, 2);
  },
  // never a choice between two written rules: what is left three times, each with two counts of planks in front of him
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [trial(1700, 248, 7), trial(1700, 248, 6)] };
    if (n === 2) return { kind: 'experiment', cases: [trial(2300, 365, 5), trial(2300, 365, 6)] };
    return { kind: 'experiment', cases: [trial(1040, 208, 4), trial(1040, 208, 5)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [13000, 312],
        [20000, 365],
        [15000, 248],
        [25000, 208],
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
      const q = Number(vals.q);
      const r = Number(vals.r);
      if (c.b * q + r !== c.a) return 'sum';
      return r < c.b ? 'ok' : 'big';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة العلامات',
    log: 'أعداد جرّبتَها',
    ask: () => 'هل هذا هو عدد الألواح الذي يأخذه ما بقي؟',
    yes: 'نعم، هو',
    no: 'لا، ليس هو',
    fact: (c) => {
      if (c.r < 0)
        return `${math(`${c.b} × ${c.q} = ${c.b * c.q}`)}، و ${math(`${c.b * c.q} > ${c.a}`)}: ${planks(c.q)} ${agree(c.q, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])} ما بقي.`;
      if (!c.q && c.held) return `${math(`${c.a} < ${c.b}`)}: لا يدخل أيّ لوح طوله ${c.b}.`;
      const rest = math(`${c.a} - ${c.b} × ${c.q} = ${c.r}`);
      if (c.held) return `${rest}: ${c.r ? `في ${cells(c.r, 'gen')} لا يدخل لوح طوله ${c.b}` : 'لا خانة باقية'}.`;
      return `${rest}: في ${cells(c.r, 'gen')} يدخل لوح آخر طوله ${c.b}.`;
    },
    eq: (c) =>
      c.r < 0 ? `$${c.b} \\times ${c.q} = ${c.b * c.q} > ${c.a}$` : `$${c.a} = ${c.b} \\times ${c.q} + ${c.r}$`,
    next: 'تجربة أخرى',
    frame: 'لأجد رقمًا من عدد الألواح، واللوح طويل:',
    buildLead: 'اختر ثلاث بطاقات: كيف تجد رقمًا مع لوح طويل؟ المرآة ستحكم بقاعدتك على الأعداد التي جرّبتَها.',
    testing: 'المرآة تحكم بقاعدتك على أعدادك، واحدًا واحدًا…',
    says: (yes) => `قاعدتك: ${yes ? 'هو العدد' : 'ليس العدد'}`,
    refuted: (m) =>
      m.says
        ? `قاعدتك تقبل: ${m.text} — لكنّ ${trialWhy(m)}.`
        : `قاعدتك ترفض: ${m.text} — لكنّك رأيت الألواح تفعل هذا.`,
    agreed: 'قاعدتك حكمت على كلّ أعدادك كما حكمت الألواح. الآن المرآة تتحدّاها بعدد جديد.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: بقيت ${cells(c.a)}، واللوح طوله ${c.b}. هل هذا عدد ألواحها؟ ماذا تقول قاعدتك؟`,
    fire: 'ضع الألواح',
    survived: 'صمدت قاعدتك: الألواح فعلت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'هو العدد' : 'ليس العدد'} »، والألواح ${yes ? 'لم تفعل ذلك' : 'فعلت ذلك'}.`,
    wordsHint: 'مثال: مع لوح طويل أجرّب رقمًا ثمّ…',
    experiment: 'انظر جيّدًا: ما بقي نفسه واللوح نفسه، وعددان من الألواح. أيّهما تأخذه الخانات الباقية؟',
    tryKey: (c) => `هوّة من ${cells(c.a, 'gen')} وألواح طولها ${c.b}. المرآة لا تبني ولا مسطرة هنا: اكتب قسمتها.`,
    use: {
      sum: 'تحقّق: عدد الألواح في طول اللوح، زائد الخانات الباقية، يساوي طول الهوّة.',
      big: 'الخانات الباقية تتّسع للوح آخر.',
    },
    useOk: 'قسمتَ هوّة طويلة على لوح طويل دون أن تضع لوحًا: مفتاحك يعمل!',
  },
};

// ───────────────────────── 2. « حصر حاصل القسمة » — between two numbers ─────────────────────────

/**
 * A written bracket of a ÷ b: « n planks of b do not pass the gap a, and m planks pass it ». `held`: it is true AND the
 * two numbers follow each other (b × n ≤ a < b × m, m = n + 1). The mirror draws the gap with its true full planks.
 */
const brCase = (a, b, n, m) => {
  const held = bracketSays(a, b, n, m).ok;
  return {
    ...outcome(a, b),
    kind: 'bracket',
    n,
    m,
    held,
    fits: held,
    text: `${planksOf(n, b)} ${agree(n, ['لا يتجاوز', 'لا يتجاوزان', 'لا تتجاوز'])} ${cells(a)}، و ${planks(m)} ${agree(m, ['يتجاوزها', 'يتجاوزانها', 'تتجاوزها'])}`,
    tag: held ? 'صحيحة' : b * n > a ? `${n} تتجاوز` : `${m} لا تتجاوز`,
  };
};
const brId = (c) => `${c.a}:${c.b}:${c.n}:${c.m}`;
const trueBr = (a, b) => brCase(a, b, Math.floor(a / b), Math.floor(a / b) + 1);
const FULL = (a, b) => Math.floor(a / b);
const NEEDED = (a, b) => Math.ceil(a / b);
const ROUND = (a, b) => Math.round(a / b);
const B_LO = [
  { id: 'full', label: 'عدد الألواح الكاملة التي تدخل الهوّة', of: FULL },
  { id: 'round', label: 'حاصل القسمة مدوّرًا إلى أقرب عدد طبيعي', of: ROUND },
  { id: 'needed', label: 'عدد الألواح اللازمة لتغطية الهوّة كلّها', of: NEEDED },
];
const B_HI = [
  { id: 'next', label: 'العدد الأوّل زائد 1', of: (lo) => lo + 1 },
  { id: 'needed', label: 'عدد الألواح اللازمة لتغطية الهوّة كلّها', of: (lo, a, b) => NEEDED(a, b) },
  { id: 'round', label: 'حاصل القسمة مدوّرًا إلى أقرب عدد طبيعي', of: (lo, a, b) => ROUND(a, b) },
];
const BL = byId(B_LO);
const BU = byId(B_HI);
/** The two numbers a rule writes for a ÷ b. */
const brWrites = (rule, a, b) => {
  const n = BL[rule.lo].of(a, b);
  return { n, m: BU[rule.hi].of(n, a, b) };
};
const brSays = (rule, c) => {
  const w = brWrites(rule, c.a, c.b);
  return w.n === c.n && w.m === c.m;
};
const isBrRule = (rule) => rule?.lo === 'full' && rule?.hi === 'next';
/** Why a written bracket is not true (plain words). */
const brWhy = (c) =>
  c.b * c.n > c.a
    ? `${planksOf(c.n, c.b)} ${agree(c.n, ['يتجاوز', 'يتجاوزان', 'تتجاوز'])} الهوّة`
    : `${planksOf(c.m, c.b)} ${agree(c.m, ['لا يتجاوز', 'لا يتجاوزان', 'لا تتجاوز'])} الهوّة`;

const bracketForge = {
  key: 'hasr-hasil',
  /** He finds it on the line of multiples (inquiries.js); the mirror tests his rule on the brackets HE wrote. */
  inquiry: BRACKET_INQUIRY,
  fromInquiry: (result) => ({
    rows: result.rounds.flatMap((x) => [
      // the numbers he typed and the line refused are evidence too — unless they did not follow each other
      ...(x.guesses ?? [])
        .filter((g) => !g.ok && g.lo >= 1 && g.hi <= g.lo + 1)
        .map((g) => brCase(x.a, x.b, g.lo, g.hi)),
      brCase(x.a, x.b, x.lo, x.hi),
    ]),
  }),
  slots: [
    { id: 'lo', label: 'العدد الأوّل', options: options(B_LO) },
    { id: 'hi', label: 'العدد الثاني', options: options(B_HI) },
  ],
  says: brSays,
  isTheRule: isBrRule,
  // « حصر » is the NAME of this key: it is said by its tablet, after the seal — never by the forge
  ruleText: (rule) => `حاصل قسمة الهوّة على اللوح يقع بين: ${BL[rule.lo].label}، و${BU[rule.hi].label}.`,
  explain(rule, c) {
    const w = brWrites(rule, c.a, c.b);
    return `قاعدتك تضع حاصل قسمة ${c.a} على ${c.b} بين ${w.n} و ${w.m}: ${brSays(rule, c) ? 'هي هذه الجملة' : 'ليست هذه الجملة'}.`;
  },
  caseId: brId,
  evidence: keepOwn((row) => row.kind === 'bracket', brId),
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const seen = new Set(rows.map(brId));
    const used = [];
    const one = (test, make) => {
      const c = pick(
        PAIRS.filter((p) => !used.includes(p.a) && test(p))
          .map(make)
          .filter((x) => !seen.has(brId(x))),
      );
      used.push(c.a);
      return c;
    };
    return [
      one(
        (p) => p.r > 0,
        (p) => trueBr(p.a, p.b),
      ),
      one(
        (p) => p.r > 0,
        (p) => brCase(p.a, p.b, p.q + 1, p.q + 2),
      ),
      one(
        (p) => p.r === 0,
        (p) => trueBr(p.a, p.b),
      ),
      one(
        (p) => p.r === 0,
        (p) => brCase(p.a, p.b, p.q, p.q),
      ),
      one(
        (p) => 2 * p.r >= p.b,
        (p) => trueBr(p.a, p.b),
      ),
    ];
  },
  /** A wrong rule: the first new gap where it writes a bracket the line refuses. The right one: a mark, a trap. */
  attacks(rule, rows) {
    if (!isBrRule(rule))
      return firstWrong(rule, rows, {
        writes: (r, a, b) => {
          const w = brWrites(r, a, b);
          return brCase(a, b, w.n, w.m);
        },
        truth: trueBr,
        says: brSays,
        idOf: brId,
      });
    const seen = new Set(rows.map(brId));
    return [brCase(285, 15, 19, 20), brCase(260, 24, 11, 12), brCase(200, 30, 6, 7)]
      .filter((c) => !seen.has(brId(c)))
      .slice(0, 2);
  },
  // never a choice between two written rules: three more gaps, each with two brackets to look at
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [brCase(260, 24, 10, 11), brCase(260, 24, 11, 12)] };
    if (n === 2) return { kind: 'experiment', cases: [brCase(285, 15, 19, 20), brCase(285, 15, 19, 19)] };
    return { kind: 'experiment', cases: [brCase(200, 30, 6, 7), brCase(200, 30, 7, 8)] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b] = pickWith(rand)([
        [7000, 245],
        [6000, 312],
        [9125, 365],
        [1700, 36],
      ]);
      return { a, b, held: true };
    },
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [
          String(c.b),
          '×',
          slot('lo', 'العدد الأوّل', 3),
          '≤',
          String(c.a),
          '<',
          String(c.b),
          '×',
          slot('hi', 'العدد الثاني', 3),
        ],
      },
    ],
    check(c, vals) {
      const j = bracketSays(c.a, c.b, Number(vals.lo), Number(vals.hi));
      if (!j.loFits) return 'lo';
      if (!j.hiPasses) return 'hi';
      return j.consecutive ? 'ok' : 'next';
    },
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة الرايات',
    log: 'هوّات وضعتَها على الخطّ',
    ask: (c) => `هوّة من ${cells(c.a, 'gen')} وألواح طولها ${c.b}. هل هذه الجملة صحيحة؟`,
    yes: 'صحيحة',
    no: 'غير صحيحة',
    fact: (c) =>
      `${math(`${c.b} × ${c.n} = ${c.b * c.n}`)} ${c.b * c.n <= c.a ? 'لا يتجاوز' : 'يتجاوز'} ${c.a}، و ${math(`${c.b} × ${c.m} = ${c.b * c.m}`)} ${c.a < c.b * c.m ? 'يتجاوز' : 'لا يتجاوز'} ${c.a}.`,
    eq: (c) => `$${c.a} = ${c.b} \\times ${c.q} + ${c.r}$`,
    next: 'هوّة أخرى',
    frame: 'حاصل قسمة الهوّة على اللوح يقع بين:',
    buildLead: 'اختر بطاقتين: بين أيّ عددين يقع حاصل القسمة؟ المرآة ستجرّب قاعدتك على الهوّات التي وضعتَها على الخطّ.',
    testing: 'المرآة تكتب بقاعدتك عددَي كلّ هوّة من هوّاتك، واحدة واحدة…',
    says: (yes) => `قاعدتك: ${yes ? 'هذه جملتها' : 'ليست جملتها'}`,
    refuted: (m) =>
      m.says ? `قاعدتك تكتب: ${m.text} — لكنّ ${brWhy(m)}.` : `قاعدتك لا تكتب: ${m.text} — لكنّك رأيت الخطّ يقبلها.`,
    agreed: 'قاعدتك كتبت لكلّ هوّاتك العددين اللذين قبلهما الخطّ. الآن المرآة تتحدّاها بهوّة جديدة.',
    attack: (c) =>
      `المرآة تتحدّى قاعدتك: هوّة من ${cells(c.a, 'gen')} وألواح طولها ${c.b}. هل هذه الجملة صحيحة؟ ماذا تقول قاعدتك؟`,
    fire: 'ضع الألواح',
    survived: 'صمدت قاعدتك: الألواح فعلت ما قالته.',
    broken: (yes) =>
      `قاعدتك انكسرت هنا: قالت « ${yes ? 'صحيحة' : 'غير صحيحة'} »، والألواح ${yes ? 'لم تفعل ذلك' : 'فعلت ذلك'}.`,
    wordsHint: 'مثال: حاصل القسمة بين…',
    experiment: 'انظر جيّدًا: الهوّة نفسها وجملتان. أيّهما تصدق عليها الألواح؟',
    // true also when a plank fills the gap (9125 with 365): the template takes the count of planks and the one after it
    tryKey: (c) =>
      `هوّة من ${cells(c.a, 'gen')} وألواح طولها ${c.b}. المرآة لا تبني: أكمل القالب بعددين طبيعيين متتاليين.`,
    use: {
      lo: 'ألواح العدد الأوّل تتجاوز الهوّة.',
      hi: 'ألواح العدد الثاني لا تتجاوز الهوّة.',
      next: 'العددان ليسا متتاليين.',
    },
    useOk: 'وجدتَ العددين دون أن تبني: مفتاحك يعمل!',
  },
};

// ───────────────────────── 3. « انعدام الباقي » — four sentences, one fact ─────────────────────────

/** The sentences a bridge can be said with: the gap a, the plank b. */
const SAY = {
  div: (a, b) => `${a} يقبل القسمة على ${b}`,
  mul: (a, b) => `${a} مضاعف للعدد ${b}`,
  dvs: (a, b) => `${b} يقسم ${a}`,
};
/** A bridge of his crossing (`kind: 'bridge'`), or a SENTENCE about a bridge: true exactly when the bridge holds. */
const zCase = (a, b, kind = 'bridge') => ({ ...outcome(a, b), kind, ...(SAY[kind] ? { text: SAY[kind](a, b) } : {}) });
const zId = (c) => `${c.kind}:${c.a}:${c.b}`;
const Z_READ = [
  { id: 'r', label: 'باقي قسمة الهوّة على اللوح', of: (c) => c.a % c.b, show: (c) => `باقي قسمة ${c.a} على ${c.b}` },
  {
    id: 'q',
    label: 'عدد الألواح الكاملة',
    of: (c) => Math.floor(c.a / c.b),
    show: (c) => `عدد الألواح الكاملة طولها ${c.b} في ${c.a}`,
  },
  {
    id: 'first',
    label: 'باقي قسمة العدد المكتوب أوّلًا على العدد المكتوب ثانيًا',
    of: (c) => (c.kind === 'dvs' ? c.b % c.a : c.a % c.b),
    show: (c) => (c.kind === 'dvs' ? `باقي قسمة ${c.b} على ${c.a}` : `باقي قسمة ${c.a} على ${c.b}`),
  },
  { id: 'units', label: 'رقم آحاد الهوّة', of: (c) => c.a % 10, show: (c) => `رقم آحاد ${c.a}` },
];
const Z_COND = [
  { id: 'zero', label: 'يساوي 0', yes: 'يساوي 0', no: 'لا يساوي 0', test: (v) => v === 0 },
  { id: 'less', label: 'أصغر من اللوح', yes: 'أصغر من اللوح', no: 'ليس أصغر من اللوح', test: (v, c) => v < c.b },
  { id: 'digit', label: 'رقم واحد (أصغر من 10)', yes: 'أصغر من 10', no: 'ليس أصغر من 10', test: (v) => v < 10 },
  { id: 'even', label: 'عدد زوجي', yes: 'عدد زوجي', no: 'عدد فردي', test: (v) => v % 2 === 0 },
];
const ZR = byId(Z_READ);
const ZC = byId(Z_COND);
const zSays = (rule, c) => ZC[rule.c].test(ZR[rule.q].of(c), c);
const isZRule = (rule) => rule?.q === 'r' && rule?.c === 'zero';
/** The sentences a mirror can ask: gaps 12 … 99, planks 2 … 12 (30 planks at most), each said three ways. */
const Z_POOL = (() => {
  const out = [];
  for (let a = 12; a <= 99; a += 1)
    for (let b = 2; b <= 12; b += 1)
      if (b < a && a / b < 31) for (const kind of Object.keys(SAY)) out.push(zCase(a, b, kind));
  return out;
})();
const OWN_MAX = 5;
/**
 * The evidence: one line per different case — the bridges of his OWN crossing first (its last five), then the sentences
 * the mirror asked in front of him (`mirror: true`), eight lines at most.
 */
function zEvidence(log) {
  const out = [];
  for (const row of log) {
    const c = zCase(row.a, row.b, row.kind && SAY[row.kind] ? row.kind : 'bridge');
    const i = out.findIndex((x) => zId(x) === zId(c));
    const was = i >= 0 ? out.splice(i, 1)[0] : null;
    out.push({ ...c, mirror: Boolean(row.mirror) && (was ? was.mirror : true) });
  }
  const own = out.filter((x) => !x.mirror).slice(-OWN_MAX);
  return [...own, ...out.filter((x) => x.mirror).slice(-(EVIDENCE_MAX - own.length))];
}

const zeroForge = {
  key: 'inidam-baqi',
  slots: [
    { id: 'q', label: 'ماذا أقرأ؟', options: options(Z_READ) },
    { id: 'c', label: 'كيف يجب أن يكون؟', options: options(Z_COND) },
  ],
  says: zSays,
  isTheRule: isZRule,
  ruleText: (rule) => `يثبت الجسر، وتصدق جملته، عندما: ${ZR[rule.q].label} ${ZC[rule.c].label}.`,
  explain(rule, c) {
    const v = ZR[rule.q].of(c);
    const yes = zSays(rule, c);
    const what = c.text ? `الجملة ${yes ? 'صحيحة' : 'خاطئة'}` : `الجسر ${yes ? 'يثبت' : 'ينهار'}`;
    return `${ZR[rule.q].show(c)} هو ${v}، و ${v} ${yes ? ZC[rule.c].yes : ZC[rule.c].no}: قاعدتك تقول إنّ ${what}.`;
  },
  caseId: zId,
  evidence: zEvidence,
  /** Sentences he has not seen, true and false in turn, said in the three ways. */
  predictCases(rows, rand = Math.random) {
    const pick = pickWith(rand);
    const seen = new Set(rows.map(zId));
    const used = [];
    const one = (test) => {
      const c = pick(Z_POOL.filter((x) => !seen.has(zId(x)) && !used.includes(x.a) && x.a <= 72 && test(x)));
      used.push(c.a);
      return c;
    };
    return [
      one((c) => c.kind === 'div' && c.held && c.b >= 3),
      one((c) => c.kind === 'mul' && !c.held && c.a % 2 === 0 && c.b % 2 === 0),
      one((c) => c.kind === 'dvs' && c.held && c.b >= 4),
      one((c) => c.kind === 'div' && !c.held && c.r === 1),
      one((c) => c.kind === 'mul' && c.held && c.a % 2 === 1),
      one((c) => c.kind === 'dvs' && !c.held && c.b >= 5),
    ];
  },
  /** A wrong rule: the first new sentence where it says otherwise than the bridge. The right one: two hard sentences. */
  attacks(rule, rows) {
    const seen = new Set(rows.map(zId));
    if (!isZRule(rule)) {
      const free = Z_POOL.filter((c) => !seen.has(zId(c)) && zSays(rule, c) !== c.held);
      const best = free.find((c) => zSays(rule, c)) ?? free[0];
      return best ? [best] : [];
    }
    return [zCase(91, 7, 'dvs'), zCase(50, 4, 'mul'), zCase(87, 3, 'div')].filter((c) => !seen.has(zId(c))).slice(0, 2);
  },
  // never a choice between two written rules: one more pair of sentences, one cell apart or two
  nudge(n) {
    if (n === 1) return { kind: 'experiment', cases: [zCase(56, 8, 'mul'), zCase(58, 8, 'mul')] };
    if (n === 2) return { kind: 'experiment', cases: [zCase(63, 9, 'dvs'), zCase(64, 9, 'dvs')] };
    return { kind: 'experiment', cases: [zCase(48, 6, 'div'), zCase(50, 6, 'div')] };
  },
  use: {
    make: (rand = Math.random) => {
      const [a, b, kind] = pickWith(rand)([
        [2001, 23, 'mul'],
        [1428, 42, 'dvs'],
        [1000, 24, 'div'],
        [1302, 31, 'div'],
        [1500, 35, 'mul'],
      ]);
      return zCase(a, b, kind);
    },
    verdict: true,
    lines: (c) => [
      {
        dir: 'ltr',
        tokens: [String(c.a), '=', String(c.b), '×', slot('q', 'حاصل القسمة', 3), '+', slot('r', 'الباقي', 2)],
      },
    ],
    check: checkDivision,
  },
  text: {
    ...BRIDGE_TEXT,
    title: 'مرآة جزيرة القوارب',
    ask: (c) => (c.text ? 'هل هذه الجملة صحيحة؟' : `هوّة من ${cells(c.a, 'gen')}، ولوح طوله ${c.b}. هل يثبت الجسر؟`),
    yes: 'نعم',
    no: 'لا',
    fact: (c) =>
      c.held
        ? `${math(`${c.a} = ${c.b} × ${c.q}`)}: لا خانة باقية — الجسر ثبت.`
        : `${math(`${c.a} = ${c.b} × ${c.q} + ${c.r}`)}: بقيت ${cells(c.r)} — الجسر انهار.`,
    next: 'جملة أخرى',
    frame: 'يثبت الجسر، وتصدق جملته، عندما:',
    buildLead: 'اختر بطاقتين. المرآة ستجرّب قاعدتك على جسورك وعلى الجمل التي رأيتَها.',
    testing: 'المرآة تمرّ على جسورك وجملك واحدة واحدة…',
    says: (yes) => `قاعدتك: ${yes ? 'نعم' : 'لا'}`,
    refuted: (m) =>
      m.text
        ? `قاعدتك تقول إنّ « ${m.text} » ${m.says ? 'صحيحة' : 'خاطئة'} — لكنّ جسرها ${m.held ? 'ثبت' : 'انهار'}.`
        : `قاعدتك تقول إنّ جسر ${m.a} باللوح ${m.b} ${m.says ? 'يثبت' : 'ينهار'} — لكنّك رأيته ${m.held ? 'يثبت' : 'ينهار'}.`,
    agreed: 'قاعدتك توافق كلّ ما رأيتَه. الآن المرآة تتحدّاها بجملة جديدة.',
    attack: () => 'المرآة تتحدّى قاعدتك بجملة جديدة: هل هي صحيحة؟ ماذا تقول قاعدتك؟',
    fire: 'ابنِ جسرها',
    broken: (yes) => `قاعدتك انكسرت هنا: قالت « ${yes ? 'نعم' : 'لا'} »، والجسر ${yes ? 'انهار' : 'ثبت'}.`,
    wordsHint: 'مثال: الجملة صحيحة إذا…',
    experiment: 'انظر جيّدًا: جملتان متشابهتان، والمرآة تبني جسر كلّ واحدة. ماذا بقي في كلّ مرّة؟',
    tryKey: (c) => `« ${c.text} ». المرآة لا تبني هذه المرّة: اكتب القسمة، ثمّ قل هل الجملة صحيحة.`,
    use: {
      sum: 'المساواة غير صحيحة: احسب الجداء ثمّ أضف الباقي.',
      big: 'الخانات الباقية تتّسع للوح آخر.',
      verdict: 'القسمة صحيحة. انظر إلى الباقي: هل الجملة صحيحة؟',
    },
    useOk: 'عرفتَ صدق الجملة دون أن تُبنى: مفتاحك يعمل!',
  },
};

/** The forges of the lesson, by the key each makes. */
export const FORGES = {
  'qisma-ay-adad': divisionForge,
  'hasr-hasil': bracketForge,
  'inidam-baqi': zeroForge,
};
