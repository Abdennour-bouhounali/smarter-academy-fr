/**
 * « تدرّب » of lesson `natiqa-ghayr-natiqa` — the CONTENT of its trainer (PURE). The frame — six questions, two formats
 * that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`, the screen `kit/Trainer.jsx`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer gives (never the answer), then the written correction.
 *
 *   game formats: a gate of the practice ladder (`practice.js › waveOf`, its facts as hints), a true / false in one tap;
 *   exam formats, the asks of the bank's levels 1–3 on the platform's OWN numbers and contexts —
 *     🧩 « اكتب دون الرمز √ » a decimal or a fraction (shown unreduced: reduce first), a square tile whose side is asked;
 *     ♾️ « احسب دون حاسبة مربّع ما تعرضه الحاسبة » (its square is never the number under the root), « صحيح أم خطأ؟ علّل »;
 *     🎯 without a calculator, the value by default to 0,1 and the ROUNDED value; from a calculator's display, the values
 *        by default and by excess to 0,01 and the rounded one.
 *
 * THE KIT'S LIMITS, designed around (not bent): a box keeps DIGITS only — a decimal is typed in two boxes, whole part,
 * « , », decimals, on a left-to-right line whose Arabic words all stand to the RIGHT of the boxes (defects.md D22); a
 * fraction is the kit's template `{ frac }`; a line of a form is plain text (no formula): the formula is in the
 * statement, and each box is named by the words beside it (D28). The classification « ناطق / غير ناطق » is asked as a
 * true / false with its reason: no claim kind states it (`evidence.js`).
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import {
  above,
  calculator,
  compare,
  cut,
  equal,
  K1,
  K2,
  K3,
  middle,
  read,
  rootOf,
  rounded,
  sq,
  square,
  tex,
  typedDecimal,
  typedFrac,
  typedWhole,
  wholeBelow,
  write,
} from './math';
import { isRight, waveOf } from './practice';

// ───────────────────────────── the numbers of the exam formats (checked against the bank in trainer.test.js) ─────────────────────────────

/**
 * The headline numbers of the exam questions: none is a radicand of the bank, nor an area of the lesson's story or of
 * its final mission (`trainer.test.js` reads the bank and the story).
 */
export const POOLS = {
  jidhr: {
    dec: ['1,8', '2,7', '3,1', '0,13', '0,21'],
    frac: [
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 11],
      [3, 11],
    ],
  },
  dil: [
    { what: 'بلاطة مزخرفة مربّعة الشكل', unit: 'دسم', roots: ['1,8', '2,7', '4,3'] },
    { what: 'نافذة مربّعة الشكل', unit: 'م', roots: ['1,8', '2,3'] },
    { what: 'منديل مربّع الشكل', unit: 'دسم', roots: ['2,7', '3,1', '4,3'] },
  ],
  /** The whole areas of « (√a)… » and the calculator's displays: drawn in these ranges, never an avoided one. */
  tadwir: [21, 99],
  qiyam: [14, 24],
  murabbaQima: [14, 99],
};
/** Courts drawn at random never land on these: the bank's radicands, the story's courts, the mission's, lesson 1's. */
export const AVOID = new Set([
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 20, 25, 26, 27, 30, 36, 40, 41, 43, 45, 54, 63, 100], // the bank
  ...[19, 66, 31], // the story's courts and the mission's
  ...[49, 58, 85, 53, 29, 41, 59, 73], // lesson 1's story and the examples of its tests
]);
/** A whole number that is no square and not avoided, from lo to hi — or null (« ask again »). */
const freeCourt = (rand, [lo, hi]) => {
  const a = int(rand, lo, hi);
  return rootOf(String(a)) === null && !AVOID.has(a) ? a : null;
};
const drawCourt = (rand, range) => {
  let a = null;
  while (a == null) a = freeCourt(rand, range);
  return a;
};

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** A decimal typed in two boxes, read LEFT TO RIGHT: whole part, comma, decimals (the kit's Num keeps digits only). */
const decimalBoxes = (i, d) => [num(i, 'الوحدات'), ',', num(d, 'الجزء العشري')];
/** A fraction typed in the kit's template: numerator over a real bar over denominator. */
const fracBox = (n, d) => ({ frac: { n: num(n, 'البسط'), d: num(d, 'المقام') } });
/** A fraction GIVEN by the statement, printed in the same shape. */
const fracShown = (n, d) => ({ frac: { n, d } });
/** A decimal of k decimals as a whole number of 10^-k (« 4,3 », 1 → 43), or null when it has more decimals. */
export function inUnits(x, k) {
  if (!x) return null;
  const v = read(x);
  const n = v.n * 10n ** BigInt(k);
  return n % v.d === 0n ? Number(n / v.d) : null;
}
const step = (k) => write(`1/${10n ** BigInt(k)}`);

// ───────────────────────────── true / false ─────────────────────────────

/** The statements of each key: [statement, truth, why] — `why` opens on a formula or a noun (the reason reads « لأنّ » + why). */
const TF = {
  [K1]: (rand) => {
    const r = pick(rand, POOLS.jidhr.dec);
    const a = sq(r);
    const a10 = write(`${read(a).n * 10n}/${read(a).d}`);
    const [p, q] = pick(rand, POOLS.jidhr.frac);
    return pick(rand, [
      [`$\\sqrt{${tex(a)}} = ${tex(r)}$`, true, `$${tex(r)} \\times ${tex(r)} = ${tex(a)}$ و $${tex(r)}$ موجب`],
      [`$\\sqrt{${tex(a10)}} = ${tex(r)}$`, false, `$${tex(r)} \\times ${tex(r)} = ${tex(a)}$، وليس $${tex(a10)}$`],
      [
        `$\\sqrt{\\dfrac{${2 * p * p}}{${2 * q * q}}} = \\dfrac{${p}}{${q}}$`,
        true,
        `$\\dfrac{${2 * p * p}}{${2 * q * q}} = \\dfrac{${p * p}}{${q * q}}$ و $\\dfrac{${p}}{${q}} \\times \\dfrac{${p}}{${q}} = \\dfrac{${p * p}}{${q * q}}$`,
      ],
    ]);
  },
  [K2]: (rand) => {
    const a = drawCourt(rand, POOLS.murabbaQima);
    const r = pick(rand, POOLS.jidhr.dec);
    return pick(rand, [
      [`العدد $\\sqrt{${a}}$ عدد ناطق`, false, `$${a}$ ليس مربّع عدد ناطق: لا كسر مربّعه $${a}$`],
      [`العدد $\\sqrt{${tex(sq(r))}}$ عدد ناطق`, true, `$${tex(r)} \\times ${tex(r)} = ${tex(sq(r))}$`],
      [
        `$\\sqrt{${a}} = ${tex(calculator(String(a)))}$`,
        false,
        `ما تعرضه الحاسبة قيمة مقرّبة: $\\sqrt{${a}}$ عدد غير ناطق، لا يكتبه أيّ عدد عشريّ`,
      ],
    ]);
  },
  [K3]: (rand) => {
    const a = String(drawCourt(rand, POOLS.tadwir));
    const [lo, hi, mid, r] = [cut(a, 1), above(a, 1), middle(a, 1), rounded(a, 1)];
    const other = equal(r, lo) ? hi : lo;
    const why = `$${tex(mid)} \\times ${tex(mid)} = ${tex(sq(mid))}$، ${compare(sq(mid), a) < 0 ? 'أصغر' : 'أكبر'} من $${a}$: العلامة الأقرب هي $${tex(r)}$`;
    return pick(rand, [
      [`مدوَّر $\\sqrt{${a}}$ إلى $0{,}1$ هو $${tex(r)}$`, true, why],
      [`مدوَّر $\\sqrt{${a}}$ إلى $0{,}1$ هو $${tex(other)}$`, false, why],
    ]);
  },
};
/** Two reasons that prove nothing, per key: each states a false fact. */
const FOILS = {
  [K1]: ['لأنّ الجذر التربيعي لعدد عشريّ هو نصفه', 'لأنّ جذر الكسر هو جذر بسطه وحده'],
  [K2]: ['لأنّ الحاسبة تعرض أرقامًا كثيرة بعد الفاصلة', 'لأنّ كلّ عدد عشريّ مربّع عدد عشريّ'],
  [K3]: ['لأنّ المدوَّر هو دائمًا القيمة المقرّبة بالنقصان', 'لأنّ المدوَّر هو دائمًا القيمة المقرّبة بالزيادة'],
};
const TF_HINT = {
  [K1]: 'تحقّق بالضرب: اضرب العدد في نفسه، واختزل الكسر، قبل أن تحكم.',
  [K2]: 'تحقّق: هل العدد تحت الجذر مربّع عدد عشريّ أو كسر؟',
  [K3]: 'تحقّق: احسب مربّع العلامة الوسطى، وقارنه بالعدد تحت الجذر.',
};

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    const prompt = wave.tex ? `${wave.say} $${wave.tex}$` : wave.say;
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, key) {
    const [statement, truth, why] = TF[key](rand);
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      reasons:
        format === 'exam'
          ? shuffle(rand, [{ t: `لأنّ ${why}`, ok: true }, ...FOILS[key].map((t) => ({ t, ok: false }))])
          : null,
      prompt: statement,
    };
  },

  /** 🧩 exam — « اكتب العدد √a دون الرمز √ »: a decimal (two boxes) or a fraction shown unreduced (a typed bar). */
  jidhr(rand) {
    const shape = pick(rand, ['dec', 'frac', 'frac']);
    if (shape === 'dec') {
      const r = pick(rand, POOLS.jidhr.dec);
      const a = sq(r);
      return {
        format: 'exam',
        kind: 'jidhr',
        key: K1,
        shape,
        a,
        r,
        prompt: `اكتب العدد $\\sqrt{${tex(a)}}$ كتابة عشريّة دون الرمز $\\sqrt{\\;}$.`,
        form: {
          tip: 'tipCompute',
          lines: [{ ltr: true, tokens: [...decimalBoxes('i', 'd'), ':', `الجذر التربيعي للعدد ${a}`] }],
        },
      };
    }
    const [p, q] = pick(rand, POOLS.jidhr.frac);
    const k = pick(rand, [1, 2, 3]);
    return {
      format: 'exam',
      kind: 'jidhr',
      key: K1,
      shape,
      a: write(`${p * p}/${q * q}`),
      r: write(`${p}/${q}`),
      shown: [p * p * k, q * q * k],
      prompt: `اكتب العدد $\\sqrt{\\dfrac{${p * p * k}}{${q * q * k}}}$ على شكل كسر دون الرمز $\\sqrt{\\;}$.`,
      form: {
        tip: 'tipCompute',
        lines: [{ tokens: ['الجذر التربيعي للعدد', fracShown(p * p * k, q * q * k), 'هو', fracBox('n', 'd')] }],
      },
    };
  },

  /** 🧩 exam — a square tile (a window, a handkerchief) of a decimal area: the length of its side. */
  dil(rand) {
    const c = pick(rand, POOLS.dil);
    const r = pick(rand, c.roots);
    const a = sq(r);
    return {
      format: 'exam',
      kind: 'dil',
      key: K1,
      a,
      r,
      unit: c.unit,
      prompt: `${c.what} مساحتها $${tex(a)}$ ${c.unit}². احسب طول ضلعها.`,
      form: {
        tip: 'tipCompute',
        lines: [{ ltr: true, tokens: [...decimalBoxes('i', 'd'), c.unit, ':', 'طول الضلع'] }],
      },
    };
  },

  /** ♾️ exam — the calculator's display of √a cut to 0,01: its square, without a calculator. */
  murabbaQima(rand) {
    const a = drawCourt(rand, POOLS.murabbaQima);
    const shows = calculator(String(a));
    const x = cut(String(a), 2);
    return {
      format: 'exam',
      kind: 'murabbaQima',
      key: K2,
      a,
      shows,
      x,
      prompt: `عرضت الحاسبة للعدد $\\sqrt{${a}}$ القيمة $${tex(shows)}$. احسب دون حاسبة مربّع العدد $${tex(x)}$.`,
      form: { tip: 'tipCompute', lines: [{ ltr: true, tokens: [...decimalBoxes('i', 'd'), ':', `مربّع العدد ${x}`] }] },
    };
  },

  /** 🎯 exam — without a calculator: the value by default to 0,1 of √a, and its ROUNDED value to 0,1. */
  tadwir(rand) {
    const a = drawCourt(rand, POOLS.tadwir);
    const n = wholeBelow(String(a));
    return {
      format: 'exam',
      kind: 'tadwir',
      key: K3,
      a,
      n,
      prompt: `دون حاسبة: $${n} < \\sqrt{${a}} < ${n + 1}$. أعط القيمة المقرّبة إلى $0{,}1$ بالنقصان للعدد $\\sqrt{${a}}$، ثمّ مدوَّره إلى $0{,}1$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [...decimalBoxes('i1', 'd1'), ':', 'بالنقصان إلى 0,1'] },
          { ltr: true, tokens: [...decimalBoxes('i2', 'd2'), ':', 'المدوَّر إلى 0,1'] },
        ],
      },
    };
  },

  /** 🎯 exam — a calculator's display of √a: the values by default and by excess to 0,01, and the rounded one. */
  qiyam(rand) {
    const a = drawCourt(rand, POOLS.qiyam);
    const shows = calculator(String(a));
    return {
      format: 'exam',
      kind: 'qiyam',
      key: K3,
      a,
      shows,
      prompt: `عرضت الحاسبة للعدد $\\sqrt{${a}}$ القيمة $${tex(shows)}$. أعط القيمتين المقرّبتين إلى $0{,}01$، ثمّ المدوَّر إلى $0{,}01$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [...decimalBoxes('i1', 'd1'), ':', 'بالنقصان'] },
          { ltr: true, tokens: [...decimalBoxes('i2', 'd2'), ':', 'بالزيادة'] },
          { ltr: true, tokens: [...decimalBoxes('i3', 'd3'), ':', 'المدوَّر'] },
        ],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  k1: [['tap', 'sqrtDec', {}], ['tf', K1], ['jidhr'], ['tap', 'sqrtFrac', { reduce: true }], ['dil'], ['jidhr']],
  k2: [['tap', 'notWritable', {}], ['tf', K2], ['murabbaQima'], ['tap', 'calcSquare', {}], ['tf', K2], ['murabbaQima']],
  k3: [['tap', 'byDefault', { k: 1 }], ['tf', K3], ['tadwir'], ['tap', 'round', { k: 1 }], ['qiyam'], ['tadwir']],
  mix: [['tap', 'writable', {}], ['tf', K2], ['jidhr'], ['tap', 'round', { k: 2 }], ['murabbaQima'], ['qiyam']],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  natiq: 'k1',
  'murabba-kasr': 'k1',
  'jidhr-natiq': 'k1',
  ikhtizal: 'k1',
  'ghayr-natiq': 'k2',
  tard: 'k2',
  'khata-fasila': 'k2',
  hasiba: 'k2',
  mudawwar: 'k3',
  wusta: 'k3',
  'naqs-ziyada': 'k3',
  khulasa: 'mix',
};

/** A decimal as the two boxes of its writing: « 4,35 » → { i: 4, d: '35' }. */
const boxesOfDecimal = (x, k) => {
  const [i, d = ''] = write(x).split(',');
  return { i: Number(i), d: k ? d.padEnd(k, '0') : d };
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'jidhr': {
      if (q.shape === 'dec') return boxesOfDecimal(q.r);
      const r = read(q.r);
      return { n: Number(r.n), d: Number(r.d) };
    }
    case 'dil':
      return boxesOfDecimal(q.r);
    case 'murabbaQima':
      return boxesOfDecimal(sq(q.x));
    case 'tadwir': {
      const [lo, r] = [boxesOfDecimal(cut(String(q.a), 1), 1), boxesOfDecimal(rounded(String(q.a), 1), 1)];
      return { i1: lo.i, d1: lo.d, i2: r.i, d2: r.d };
    }
    case 'qiyam': {
      const a = String(q.a);
      const [lo, hi, r] = [cut(a, 2), above(a, 2), rounded(a, 2)].map((x) => boxesOfDecimal(x, 2));
      return { i1: lo.i, d1: lo.d, i2: hi.i, d2: hi.d, i3: r.i, d3: r.d };
    }
    default:
      return null;
  }
}

/** A typed number as a formula (« 1{,}8 », « \\dfrac{4}{9} »), or « … » when the box is empty or not a number. */
const shown = (x) => (x == null ? '\\ldots' : tex(x));
const typedOf = (v, i, d) => (typedDecimal(v[i], v[d]) ? write(typedDecimal(v[i], v[d])) : null);

/** The value by default to 10^-k he typed, judged: a hint, or null when it is right. */
function hintLow(a, x, k) {
  const lo = cut(a, k);
  if (inUnits(x, k) == null)
    return `قيمة مقرّبة إلى $${tex(step(k))}$ تُكتب بـ ${k === 1 ? 'منزلة واحدة' : 'منزلتين'} بعد الفاصلة.`;
  if (equal(x, lo)) return null;
  if (compare(square(x), a) > 0)
    return `$${tex(x)} \\times ${tex(x)} = ${tex(sq(x))}$، أكبر من $${tex(a)}$: القيمة بالنقصان لا تتجاوز الجذر.`;
  return `يوجد عدد أقرب بـ ${k === 1 ? 'منزلة واحدة' : 'منزلتين'} بعد الفاصلة، ومربّعه ما زال أصغر من $${tex(a)}$.`;
}
/** The rounded value he typed (the lower neighbour already right), judged: a hint, or null. */
function hintRound(a, x, k) {
  if (inUnits(x, k) == null)
    return `المدوَّر إلى $${tex(step(k))}$ يُكتب بـ ${k === 1 ? 'منزلة واحدة' : 'منزلتين'} بعد الفاصلة.`;
  if (equal(x, rounded(a, k))) return null;
  if (!equal(x, cut(a, k)) && !equal(x, above(a, k)))
    return 'المدوَّر واحد من العددين المتجاورين اللذين يقع الجذر بينهما.';
  return 'احسب مربّع العدد الذي في منتصف المسافة بين العددين، وقارنه بالعدد تحت الجذر.';
}
const roundFix = (a, k) => {
  const [lo, hi, mid, r] = [cut(a, k), above(a, k), middle(a, k), rounded(a, k)];
  const c = compare(sq(mid), a) < 0;
  return `$${tex(lo)} < \\sqrt{${tex(a)}} < ${tex(hi)}$، و $${tex(mid)} \\times ${tex(mid)} = ${tex(sq(mid))}$ ${c ? 'أصغر' : 'أكبر'} من $${tex(a)}$: الجذر ${c ? 'بعد' : 'قبل'} المنتصف، والمدوَّر هو $${tex(r)}$.`;
};

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  const val = v ?? {};
  switch (q.kind) {
    case 'tap': {
      const right = isRight(q.wave, v);
      const fact = right ? q.wave.why.right : (q.wave.why.wrong?.[v] ?? q.wave.why.right);
      return { ok: right, hint: fact, fix: q.wave.why.right };
    }
    case 'tf': {
      const truthOk = val.truth === q.truth;
      const reasonOk = !q.reasons || q.reasons[val.reason]?.ok === true;
      return {
        ok: truthOk && reasonOk,
        hint: !truthOk ? TF_HINT[q.key] : 'الحكم في محلّه، لكنّ هذا التعليل لا يثبته: ابحث عن المساواة التي تبرهن.',
        fix: `العبارة ${q.truth ? 'صحيحة' : 'ليست صحيحة'}. ${q.why}.`,
      };
    }
    case 'jidhr':
    case 'dil': {
      const fix =
        q.kind === 'dil'
          ? `$${tex(q.r)} \\times ${tex(q.r)} = ${tex(q.a)}$: طول الضلع $${tex(q.r)}$ ${q.unit}.`
          : q.shape === 'frac'
            ? `$\\dfrac{${q.shown[0]}}{${q.shown[1]}} = ${tex(q.a)}$ و $${tex(q.r)} \\times ${tex(q.r)} = ${tex(q.a)}$: $\\sqrt{${tex(q.a)}} = ${tex(q.r)}$.`
            : `$${tex(q.r)} \\times ${tex(q.r)} = ${tex(q.a)}$ و $${tex(q.r)}$ موجب: $\\sqrt{${tex(q.a)}} = ${tex(q.r)}$.`;
      const typed = q.shape === 'frac' ? typedFrac(val.n, val.d) : typedOf(val, 'i', 'd');
      if (typed == null) return { ok: false, hint: 'املأ كلّ خانة: العدد الذي مربّعه العدد تحت الجذر.', fix };
      if (equal(sq(typed), q.a)) return { ok: true, fix };
      return {
        ok: false,
        hint: `$${shown(typed)} \\times ${shown(typed)} = ${tex(sq(typed))}$، وليس $${tex(q.a)}$.`,
        fix,
      };
    }
    case 'murabbaQima': {
      const { a, x } = q;
      const fix = `$${tex(x)} \\times ${tex(x)} = ${tex(sq(x))}$، وهو أصغر من $${a}$: ما تعرضه الحاسبة قيمة مقرّبة، و $\\sqrt{${a}}$ عدد غير ناطق.`;
      const typed = typedOf(val, 'i', 'd');
      if (typed == null) return { ok: false, hint: 'املأ الخانتين: الوحدات والجزء العشري.', fix };
      if (equal(typed, square(x))) return { ok: true, fix };
      return {
        ok: false,
        hint: equal(typed, String(a))
          ? `لو كان مربّع $${tex(x)}$ هو $${a}$ لكان $${tex(x)}$ هو الجذر نفسه. احسب الجداء رقمًا رقمًا.`
          : `$${shown(typed)}$ ليس جداء $${tex(x)} \\times ${tex(x)}$: احسبه من جديد، رقمًا رقمًا.`,
        fix,
      };
    }
    case 'tadwir': {
      const a = String(q.a);
      const fix = `$${tex(cut(a, 1))} \\times ${tex(cut(a, 1))} = ${tex(sq(cut(a, 1)))}$ و $${tex(above(a, 1))} \\times ${tex(above(a, 1))} = ${tex(sq(above(a, 1)))}$: القيمة بالنقصان $${tex(cut(a, 1))}$. ${roundFix(a, 1)}`;
      const [lo, r] = [typedOf(val, 'i1', 'd1'), typedOf(val, 'i2', 'd2')];
      if (lo == null || r == null)
        return { ok: false, hint: 'املأ الخانات الأربع: لكلّ قيمة وحداتها وجزؤها العشري.', fix };
      const h = hintLow(a, lo, 1) ?? hintRound(a, r, 1);
      return h ? { ok: false, hint: h, fix } : { ok: true, fix };
    }
    case 'qiyam': {
      const a = String(q.a);
      const fix = `$${tex(cut(a, 2))} < \\sqrt{${a}} < ${tex(above(a, 2))}$. ${roundFix(a, 2)}`;
      const [lo, hi, r] = [typedOf(val, 'i1', 'd1'), typedOf(val, 'i2', 'd2'), typedOf(val, 'i3', 'd3')];
      if (lo == null || hi == null || r == null)
        return { ok: false, hint: 'املأ الخانات الستّ: لكلّ قيمة وحداتها وجزؤها العشري.', fix };
      const h =
        hintLow(a, lo, 2) ??
        (equal(hi, above(a, 2))
          ? null
          : 'بالزيادة: العدد الذي يلي القيمة بالنقصان بـ $0{,}01$، ومربّعه يتجاوز العدد تحت الجذر.') ??
        hintRound(a, r, 2);
      return h ? { ok: false, hint: h, fix } : { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const val = v ?? {};
  const dec = (i, d) => shown(typedOf(val, i, d));
  const frac = (n, d) => (typedFrac(n, d) == null ? '\\ldots' : `\\dfrac{${typedWhole(n)}}{${typedWhole(d)}}`);
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${val.truth ? 'صحيح' : 'ليس صحيحًا'}${q.reasons && q.reasons[val.reason] ? ` — ${q.reasons[val.reason].t}` : ''}`;
    case 'jidhr':
      return `$\\sqrt{${tex(q.a)}} = ${q.shape === 'frac' ? frac(val.n, val.d) : dec('i', 'd')}$`;
    case 'dil':
      return `طول الضلع: $${dec('i', 'd')}$ ${q.unit}`;
    case 'murabbaQima':
      return `$${tex(q.x)}^2 = ${dec('i', 'd')}$`;
    case 'tadwir':
      return `بالنقصان $${dec('i1', 'd1')}$ ، المدوَّر $${dec('i2', 'd2')}$`;
    case 'qiyam':
      return `$${dec('i1', 'd1')} < \\sqrt{${q.a}} < ${dec('i2', 'd2')}$ ، المدوَّر $${dec('i3', 'd3')}$`;
    default:
      return '';
  }
}

/** The trainer of this lesson: its questions and how they are judged, bound to the kit's frame. */
export const trainer = createTrainer({
  kinds: Q,
  plans: PLANS,
  planOf: PLAN_OF,
  fallback: 'mix',
  check,
  solution,
  answerLabel,
});
