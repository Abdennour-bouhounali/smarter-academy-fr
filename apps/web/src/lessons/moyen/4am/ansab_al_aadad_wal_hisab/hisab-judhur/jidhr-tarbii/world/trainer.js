/**
 * « تدرّب » of lesson `jidhr-tarbii` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that
 * drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`, the screen `kit/Trainer.jsx`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer gives (never the answer), then the written correction.
 *
 *   game formats: a gate of the practice ladder (`practice.js › waveOf`, its facts as hints), a true / false in one tap;
 *   exam formats, the asks of the bank's levels 1–3 on the platform's OWN numbers and contexts —
 *     🔑 « اكتب دون الرمز √ » (a whole number, a decimal, a fraction), « أيّ عدد جذره التربيعي k؟ », a square plot whose
 *        side is asked;
 *     ✍️ « احصر √a بين عددين طبيعيين متتاليين », the values to 0,01 by default and by excess from a calculator's display;
 *     🔁 « (√a)² » and « √((−b)²) », with a decimal and a fraction; and « صحيح أم خطأ؟ علّل » for each key.
 *
 * THE KIT'S LIMITS, designed around (not bent): a box keeps DIGITS only — a decimal is typed in two boxes, whole part,
 * « , », decimals, on a left-to-right line whose Arabic words all stand to the RIGHT of the boxes (defects.md D22); a
 * fraction is the kit's template `{ frac }`; a line of a form is plain text (no formula, no √ sign — the kit has no
 * printed radical in a form): the formula is in the statement, and each box is named by the words beside it (D28).
 * No `form.model` (the long division) and no division tips here.
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import {
  calculator,
  equal,
  K1,
  K2,
  K3,
  read,
  rootOf,
  scaled,
  sq,
  tex,
  tiles,
  typedDecimal,
  typedWhole,
  wholeBelow,
  write,
} from './math';
import { isRight, waveOf } from './practice';

// ───────────────────────────── the numbers of the exam formats (checked against the bank in trainer.test.js) ─────────────────────────────

/**
 * The headline numbers of the exam questions: none is a radicand or an area of the bank, nor a number of the lesson's
 * story or of its forges' last steps (`trainer.test.js` reads the bank and the forges).
 */
export const POOLS = {
  bila: {
    whole: [15, 16, 18, 19, 36, 39],
    dec: ['1,3', '1,7', '0,8', '0,06', '1,9'],
    frac: ['2/3', '3/7', '5/6', '4/11'],
  },
  of: [16, 18, 19, 44, 46],
  dil: [
    { what: 'حديقة مربّعة الشكل', unit: 'م', roots: [15, 18, 36, 39] },
    { what: 'سجّادة مربّعة الشكل', unit: 'دسم', roots: [15, 16, 18, 19] },
    { what: 'ساحة مدرسة مربّعة الشكل', unit: 'م', roots: [36, 39] },
  ],
  ihsib: [15, 44, 46, 51, 57],
  ihsibFrac: { dec: ['1,3', '2,6', '0,3', '3,5', '0,8'], frac: ['2/7', '3/8', '5/9', '4/7'] },
};
/** Courts drawn at random (a bracket, a calculator's display, (√a)²) never land on these: the bank's and the lesson's. */
export const AVOID = new Set([
  ...[2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 17, 18, 19, 20, 23, 45, 50, 52, 65, 72, 294, 336, 490, 800], // the bank's own
  ...[30, 41, 59, 73, 29], // the story's court of 30, the forges' attacks, the experiment's chain
  ...[39, 58, 87, 43, 62, 79, 47, 67, 83, 37, 32, 27, 53, 38, 33, 61, 42, 48], // the forges' last steps
]);
/** A whole number that is no square and not avoided, from lo to hi — or null (« ask again »). */
const freeCourt = (rand, lo, hi) => {
  const a = int(rand, lo, hi);
  return rootOf(String(a)) === null && !AVOID.has(a) ? a : null;
};

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** A decimal typed in two boxes, read LEFT TO RIGHT: whole part, comma, decimals (the kit's Num keeps digits only). */
const decimalBoxes = (i, d) => [num(i, 'الوحدات'), ',', num(d, 'الجزء العشري')];
/** A fraction typed in the kit's template: numerator over a real bar over denominator. */
const fracBox = (n, d) => ({ frac: { n: num(n, 'البسط'), d: num(d, 'المقام') } });
/** A fraction GIVEN by the statement, printed in the same shape. */
const fracShown = (x) => {
  const r = read(x);
  return { frac: { n: Number(r.n), d: Number(r.d) } };
};

// ───────────────────────────── true / false ─────────────────────────────

/** The statements of each key: [statement, truth, why] — `why` opens on a formula or a noun (the reason reads « لأنّ » + why). */
const TF = {
  [K1]: (rand) => {
    const k = pick(rand, [15, 16, 18, 19]);
    const a = k * k;
    const h = pick(rand, [16, 18]) ** 2 / 2; // the half of an even square: a whole number
    return pick(rand, [
      [`$\\sqrt{${a}} = ${k}$`, true, `$${k} \\times ${k} = ${a}$ و $${k}$ عدد موجب`],
      [`$\\sqrt{${2 * h}} = ${h}$`, false, `$${h} \\times ${h} = ${h * h}$، وليس $${2 * h}$`],
      [`العدد $-${k}$ هو الجذر التربيعي للعدد $${a}$`, false, `الجذر التربيعي عدد موجب، و $-${k}$ سالب`],
    ]);
  },
  [K2]: (rand) => {
    let a = null;
    while (a == null) a = freeCourt(rand, 21, 99);
    const n = wholeBelow(String(a));
    return pick(rand, [
      [
        `$${n} < \\sqrt{${a}} < ${n + 1}$`,
        true,
        `$${n} \\times ${n} = ${n * n}$ و $${n + 1} \\times ${n + 1} = ${(n + 1) ** 2}$، و $${n * n} < ${a} < ${(n + 1) ** 2}$`,
      ],
      [
        `$\\sqrt{${a}} = ${tex(calculator(String(a)))}$`,
        false,
        `ما تعرضه الحاسبة قيمة مقرّبة: لا عدد عشريّ مربّعه $${a}$، والقيمة المضبوطة هي $\\sqrt{${a}}$`,
      ],
      [
        `$${n + 1} < \\sqrt{${a}} < ${n + 2}$`,
        false,
        `$${n + 1} \\times ${n + 1} = ${(n + 1) ** 2}$، وهو أكبر من $${a}$`,
      ],
    ]);
  },
  [K3]: (rand) => {
    let a = null;
    while (a == null) a = freeCourt(rand, 21, 99);
    const k = pick(rand, [15, 16, 18, 19]);
    return pick(rand, [
      [`$(\\sqrt{${a}})^2 = ${a}$`, true, `مربّع الجذر التربيعي لعدد موجب هو العدد نفسه`],
      [`$\\sqrt{(-${k})^2} = -${k}$`, false, `$(-${k})^2 = ${k * k}$، وجذره التربيعي $${k}$ موجب`],
      [`$(\\sqrt{${a}})^2 = ${2 * a}$`, false, `مربّع الجذر التربيعي للعدد $${a}$ هو $${a}$ نفسه، لا ضعفه`],
    ]);
  },
};
/** Two reasons that prove nothing, per key: each states a false fact. */
const FOILS = {
  [K1]: ['لأنّ الجذر التربيعي لعدد هو نصفه', 'لأنّ الجذر التربيعي لعدد هو ربعه'],
  [K2]: ['لأنّ الحاسبة تعرض الطول كاملًا', 'لأنّ لكلّ جذر تربيعي كتابة عشريّة'],
  [K3]: ['لأنّ الجذر والمربّع يحفظان إشارة العدد', 'لأنّ مربّع عدد هو ضعفه'],
};
const TF_HINT = {
  [K1]: 'تحقّق بالضرب: اضرب العدد في نفسه، وانظر إشارته، قبل أن تحكم.',
  [K2]: 'تحقّق: احسب مربّع كلّ عدد حول الجذر، وقارنه بالعدد تحت الجذر.',
  [K3]: 'تحقّق: هل العدد تحت الجذر موجب؟ وما الذي يعود إليه الذهاب والإياب؟',
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

  /** 🔑 exam — « اكتب العدد √a دون الرمز √ »: a whole number, a decimal (two boxes) or a fraction (a typed bar). */
  bila(rand) {
    const shape = pick(rand, ['whole', 'whole', 'dec', 'frac']);
    const r = shape === 'whole' ? String(pick(rand, POOLS.bila.whole)) : pick(rand, POOLS.bila[shape]);
    const a = sq(r);
    const how = { whole: '', dec: ' كتابة عشريّة', frac: ' على شكل كسر' }[shape];
    const lines = {
      whole: [{ tokens: [`الجذر التربيعي للعدد ${a} هو`, num('r', 'الجذر التربيعي')] }],
      dec: [{ ltr: true, tokens: [...decimalBoxes('i', 'd'), ':', `الجذر التربيعي للعدد ${a}`] }],
      frac: [{ tokens: ['الجذر التربيعي للعدد', fracShown(a), 'هو', fracBox('n', 'd')] }],
    }[shape];
    return {
      format: 'exam',
      kind: 'bila',
      key: K1,
      shape,
      a,
      r,
      prompt: `اكتب العدد $\\sqrt{${tex(a)}}$${how} دون الرمز $\\sqrt{\\;}$.`,
      form: { tip: 'tipCompute', lines },
    };
  },

  /** 🔑 exam — « أيّ عدد جذره التربيعي k؟ ». */
  of(rand) {
    const k = pick(rand, POOLS.of);
    return {
      format: 'exam',
      kind: 'of',
      key: K1,
      k,
      prompt: `أيّ عدد جذره التربيعي $${k}$؟ اكتبه.`,
      form: { tip: 'tipCompute', lines: [{ tokens: [`العدد الذي جذره التربيعي ${k} هو`, num('a', 'العدد')] }] },
    };
  },

  /** 🔑 exam — a square plot (a garden, a carpet, a school yard) of a given area: the length of its side. */
  dil(rand) {
    const c = pick(rand, POOLS.dil);
    const s = pick(rand, c.roots);
    return {
      format: 'exam',
      kind: 'dil',
      key: K1,
      a: s * s,
      s,
      unit: c.unit,
      prompt: `${c.what} مساحتها $${s * s}$ ${c.unit}². احسب طول ضلعها.`,
      form: { tip: 'tipCompute', lines: [{ tokens: ['طول الضلع:', num('s', 'طول الضلع'), c.unit] }] },
    };
  },

  /** ✍️ exam — « احصر √a بين عددين طبيعيين متتاليين ». */
  hasr(rand) {
    let a = null;
    while (a == null) a = freeCourt(rand, 21, 300);
    return {
      format: 'exam',
      kind: 'hasr',
      key: K2,
      a,
      n: wholeBelow(String(a)),
      prompt: `احصر العدد $\\sqrt{${a}}$ بين عددين طبيعيين متتاليين: $\\ldots < \\sqrt{${a}} < \\ldots$`,
      form: {
        tip: 'tipCompute',
        lines: [
          { tokens: ['العدد الطبيعي الذي قبله:', num('lo', 'العدد الذي قبله')] },
          { tokens: ['العدد الطبيعي الذي بعده:', num('hi', 'العدد الذي بعده')] },
        ],
      },
    };
  },

  /** ✍️ exam — the calculator's display of √a: its values to 0,01 by default and by excess. */
  muqarraba(rand) {
    let a = null;
    while (a == null) a = freeCourt(rand, 11, 99);
    const shows = calculator(String(a));
    // √a × 100 lies between lo and lo + 1: lo is the largest whole number whose square does not pass a × 10^4
    const lo = wholeBelow(String(a * 10000));
    return {
      format: 'exam',
      kind: 'muqarraba',
      key: K2,
      a,
      shows,
      lo,
      prompt: `سُئلت الحاسبة عن ضلع ساحة مساحتها ${tiles(String(a))} فعرضت $${tex(shows)}$. أعط القيمتين المقرّبتين إلى $0{,}01$ للعدد $\\sqrt{${a}}$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [...decimalBoxes('i1', 'd1'), ':', 'بالنقصان'] },
          { ltr: true, tokens: [...decimalBoxes('i2', 'd2'), ':', 'بالزيادة'] },
        ],
      },
    };
  },

  /** 🔁 exam — « A = (√a)² » and « B = √((−b)²) » (or √(b²)), without a calculator. */
  ihsib(rand) {
    let a = null;
    while (a == null) a = freeCourt(rand, 21, 99);
    const b = pick(rand, POOLS.ihsib);
    const neg = rand() < 0.6;
    return {
      format: 'exam',
      kind: 'ihsib',
      key: K3,
      a,
      b,
      neg,
      prompt: `دون حاسبة، أوجد العددين: $A = (\\sqrt{${a}})^2$ و $B = \\sqrt{${neg ? `(-${b})` : b}^2}$.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: ['A', '=', num('A', 'العدد A')] },
          { ltr: true, tokens: ['B', '=', num('B', 'العدد B')] },
        ],
      },
    };
  },

  /** 🔁 exam — the same with a decimal (A, two boxes) and a fraction (B, a typed bar). */
  ihsibFrac(rand) {
    const x = pick(rand, POOLS.ihsibFrac.dec);
    const f = pick(rand, POOLS.ihsibFrac.frac);
    return {
      format: 'exam',
      kind: 'ihsibFrac',
      key: K3,
      x,
      f,
      prompt: `دون حاسبة، أوجد العددين: $A = (\\sqrt{${tex(x)}})^2$ و $B = \\sqrt{\\left(${tex(f)}\\right)^2}$ — $A$ كتابة عشريّة و $B$ على شكل كسر.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: ['A', '=', ...decimalBoxes('i', 'd')] },
          { ltr: true, tokens: ['B', '=', fracBox('n', 'dn')] },
        ],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  k1: [
    ['tap', 'side', { kMin: 2, kMax: 9 }],
    ['tf', K1],
    ['bila'],
    ['tap', 'of', { kMin: 4, kMax: 12 }],
    ['of'],
    ['dil'],
  ],
  k2: [['tap', 'before', { max: 99 }], ['tf', K2], ['hasr'], ['tap', 'display', {}], ['muqarraba'], ['hasr']],
  k3: [['tap', 'sqSqrt', {}], ['tf', K3], ['ihsib'], ['tap', 'sqrtSq', { neg: true }], ['ihsibFrac'], ['ihsib']],
  mix: [
    ['tap', 'sqrt', { kMin: 2, kMax: 12 }],
    ['tf', K2],
    ['bila'],
    ['tap', 'sqSqrt', { dec: true }],
    ['hasr'],
    ['ihsib'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  saha: 'k1',
  murabba: 'k1',
  jidhr: 'k1',
  'khata-rub': 'k1',
  madbuta: 'k2',
  hasr: 'k2',
  muqarraba: 'k2',
  'khata-hasiba': 'k2',
  dhahab: 'k3',
  salib: 'k3',
  khulasa: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'bila': {
      if (q.shape === 'whole') return { r: Number(q.r) };
      if (q.shape === 'dec') {
        const [i, d] = q.r.split(',');
        return { i: Number(i), d };
      }
      const r = read(q.r);
      return { n: Number(r.n), d: Number(r.d) };
    }
    case 'of':
      return { a: q.k * q.k };
    case 'dil':
      return { s: q.s };
    case 'hasr':
      return { lo: q.n, hi: q.n + 1 };
    case 'muqarraba': {
      const [i1, d1] = write(`${q.lo}/100`).split(',');
      const [i2, d2] = write(`${q.lo + 1}/100`).split(',');
      return { i1: Number(i1), d1: (d1 ?? '0').padEnd(2, '0'), i2: Number(i2), d2: (d2 ?? '0').padEnd(2, '0') };
    }
    case 'ihsib':
      return { A: q.a, B: q.b };
    case 'ihsibFrac': {
      const [i, d] = q.x.split(',');
      const f = read(q.f);
      return { i: Number(i), d, n: Number(f.n), dn: Number(f.d) };
    }
    default:
      return null;
  }
}

/** A typed number as a formula (« 1{,}3 », « \\dfrac{4}{6} »), or « … » when the box is empty or not a number. */
const shown = (x) => (x == null ? '\\ldots' : tex(x));
const typedFrac = (n, d) => {
  const [p, q] = [typedWhole(n), typedWhole(d)];
  return p == null || !q ? null : `${p}/${q}`;
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
    case 'bila': {
      const fix = `$${tex(q.r)} \\times ${tex(q.r)} = ${tex(q.a)}$ و $${tex(q.r)}$ موجب: $\\sqrt{${tex(q.a)}} = ${tex(q.r)}$.`;
      const typed =
        q.shape === 'whole'
          ? typedWhole(val.r) == null
            ? null
            : String(typedWhole(val.r))
          : q.shape === 'dec'
            ? typedDecimal(val.i, val.d) && write(typedDecimal(val.i, val.d))
            : typedFrac(val.n, val.d);
      if (typed == null) return { ok: false, hint: 'املأ كلّ خانة: العدد الذي مربّعه العدد تحت الجذر.', fix };
      if (equal(sq(typed), q.a)) return { ok: true, fix };
      return {
        ok: false,
        hint: `$${shown(typed)} \\times ${shown(typed)} = ${tex(sq(typed))}$، وليس $${tex(q.a)}$.`,
        fix,
      };
    }
    case 'of': {
      const a = typedWhole(val.a);
      const fix = `$${q.k} \\times ${q.k} = ${q.k * q.k}$ و $${q.k}$ موجب: $\\sqrt{${q.k * q.k}} = ${q.k}$.`;
      if (a == null) return { ok: false, hint: 'اكتب العدد في خانته.', fix };
      if (a === q.k * q.k) return { ok: true, fix };
      return {
        ok: false,
        hint:
          a === 2 * q.k
            ? `$${q.k} \\times 2 = ${a}$: هذا ضعف $${q.k}$، وليس العدد الذي جذره التربيعي $${q.k}$.`
            : `$${q.k} \\times ${q.k} \\neq ${a}$: منصّة المقياس $${q.k}$ لا تركب ساحة مساحتها $${a}$.`,
        fix,
      };
    }
    case 'dil': {
      const s = typedWhole(val.s);
      const fix = `$${q.s} \\times ${q.s} = ${q.a}$: طول الضلع $${q.s}$ ${q.unit}.`;
      if (s == null) return { ok: false, hint: 'اكتب طول الضلع في خانته.', fix };
      if (s === q.s) return { ok: true, fix };
      return { ok: false, hint: `مربّع بضلع $${s}$ مساحته $${s} \\times ${s} = ${s * s}$، وليس $${q.a}$.`, fix };
    }
    case 'hasr': {
      const [lo, hi] = [typedWhole(val.lo), typedWhole(val.hi)];
      const { a, n } = q;
      const fix = `$${n} \\times ${n} = ${n * n}$ و $${n + 1} \\times ${n + 1} = ${(n + 1) ** 2}$، و $${n * n} < ${a} < ${(n + 1) ** 2}$، إذن $${n} < \\sqrt{${a}} < ${n + 1}$.`;
      if (lo == null || hi == null)
        return { ok: false, hint: 'املأ الخانتين: العدد الذي قبله، والعدد الذي بعده.', fix };
      if (lo !== n)
        return {
          ok: false,
          hint:
            lo * lo > a
              ? `$${lo} \\times ${lo} = ${lo * lo}$، وهو أكبر من $${a}$: العدد الذي قبله أصغر.`
              : `$${lo + 1} \\times ${lo + 1} = ${(lo + 1) ** 2}$ ما زال أصغر من $${a}$: يوجد عدد أقرب.`,
          fix,
        };
      if (hi !== n + 1) return { ok: false, hint: 'العددان متتاليان: الذي بعده يلي الذي قبله مباشرةً.', fix };
      return { ok: true, fix };
    }
    case 'muqarraba': {
      const { a, lo } = q;
      const w = (h) => tex(write(`${h}/100`));
      const fix = `$${w(lo)} \\times ${w(lo)} = ${tex(sq(write(`${lo}/100`)))}$ و $${w(lo + 1)} \\times ${w(lo + 1)} = ${tex(sq(write(`${lo + 1}/100`)))}$: $${w(lo)} < \\sqrt{${a}} < ${w(lo + 1)}$.`;
      const x1 = typedDecimal(val.i1, val.d1);
      const x2 = typedDecimal(val.i2, val.d2);
      if (!x1 || !x2) return { ok: false, hint: 'املأ الخانات الأربع: لكلّ قيمة وحداتها ومنزلتان بعد الفاصلة.', fix };
      const [h1, h2] = [scaled(x1, 2), scaled(x2, 2)];
      if (!Number.isInteger(h1) || !Number.isInteger(h2))
        return { ok: false, hint: 'قيمة مقرّبة إلى $0{,}01$ تُكتب بمنزلتين بعد الفاصلة.', fix };
      if (h1 !== lo)
        return {
          ok: false,
          hint:
            h1 > lo
              ? `مربّع $${shown(write(x1))}$ هو $${tex(sq(x1))}$، أكبر من $${a}$: القيمة بالنقصان لا تتجاوز الجذر.`
              : `بالنقصان: أقرب عدد بمنزلتين عشريّتين لا يتجاوز الجذر. انظر جيّدًا إلى ما عرضته الحاسبة.`,
          fix,
        };
      if (h2 !== lo + 1)
        return {
          ok: false,
          hint: 'بالزيادة: العدد الذي يلي القيمة بالنقصان بـ $0{,}01$، ومربّعه يتجاوز العدد تحت الجذر.',
          fix,
        };
      return { ok: true, fix };
    }
    case 'ihsib': {
      const [A, B] = [typedWhole(val.A), typedWhole(val.B)];
      const { a, b } = q;
      const fix = `$A = (\\sqrt{${a}})^2 = ${a}$، و $${q.neg ? `(-${b})` : b}^2 = ${b * b}$ و $\\sqrt{${b * b}} = ${b}$، إذن $B = ${b}$.`;
      if (A == null || B == null) return { ok: false, hint: 'املأ الخانتين: العدد A والعدد B.', fix };
      if (A !== a)
        return {
          ok: false,
          hint: `الساحة المبنيّة على ضلع الساحة $${a}$: ما مساحتها؟ ليست $${A}$.`,
          fix,
        };
      if (B !== b)
        return {
          ok: false,
          hint:
            B === b * b
              ? `$${B}$ هو مربّع العدد، والمطلوب جذر هذا المربّع.`
              : `$${B} \\times ${B} = ${B * B}$، وليس $${b * b}$.`,
          fix,
        };
      return { ok: true, fix };
    }
    case 'ihsibFrac': {
      const { x, f } = q;
      const fix = `$A = (\\sqrt{${tex(x)}})^2 = ${tex(x)}$، و $B = \\sqrt{\\left(${tex(f)}\\right)^2} = ${tex(f)}$ لأنّ $${tex(f)}$ موجب.`;
      const A = typedDecimal(val.i, val.d);
      const B = typedFrac(val.n, val.dn);
      if (!A || B == null) return { ok: false, hint: 'املأ كلّ الخانات: A كتابة عشريّة، و B كسر.', fix };
      if (!equal(A, x))
        return {
          ok: false,
          hint: `الساحة المبنيّة على ضلع الساحة $${shown(write(A))}$ مساحتها $${shown(write(A))}$. وعلى ضلع أيّ ساحة بُنيت $A$؟`,
          fix,
        };
      if (!equal(B, f))
        return {
          ok: false,
          hint: equal(B, sq(f))
            ? `$${tex(B)}$ هو مربّع الكسر، والمطلوب جذر هذا المربّع.`
            : `$${tex(B)} \\times ${tex(B)} = ${tex(sq(B))}$، وليس $${tex(sq(f))}$.`,
          fix,
        };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const val = v ?? {};
  const dec = (i, d) => (typedDecimal(i, d) ? tex(write(typedDecimal(i, d))) : '\\ldots');
  const box = (x) => (typedWhole(x) == null ? '\\ldots' : typedWhole(x));
  const frac = (n, d) => (typedFrac(n, d) == null ? '\\ldots' : `\\dfrac{${typedWhole(n)}}{${typedWhole(d)}}`);
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${val.truth ? 'صحيح' : 'ليس صحيحًا'}${q.reasons && q.reasons[val.reason] ? ` — ${q.reasons[val.reason].t}` : ''}`;
    case 'bila': {
      const typed = q.shape === 'whole' ? box(val.r) : q.shape === 'dec' ? dec(val.i, val.d) : frac(val.n, val.d);
      return `$\\sqrt{${tex(q.a)}} = ${typed}$`;
    }
    case 'of':
      return `$\\sqrt{${box(val.a)}} = ${q.k}$`;
    case 'dil':
      return `طول الضلع: $${box(val.s)}$ ${q.unit}`;
    case 'hasr':
      return `$${box(val.lo)} < \\sqrt{${q.a}} < ${box(val.hi)}$`;
    case 'muqarraba':
      return `$${dec(val.i1, val.d1)} < \\sqrt{${q.a}} < ${dec(val.i2, val.d2)}$`;
    case 'ihsib':
      return `$A = ${box(val.A)}$ ، $B = ${box(val.B)}$`;
    case 'ihsibFrac':
      return `$A = ${dec(val.i, val.d)}$ ، $B = ${frac(val.n, val.dn)}$`;
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
