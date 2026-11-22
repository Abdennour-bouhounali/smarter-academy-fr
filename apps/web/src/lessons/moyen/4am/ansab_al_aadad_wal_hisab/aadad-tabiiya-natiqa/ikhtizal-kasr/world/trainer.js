/**
 * « تدرّب » of lesson `ikhtizal-kasr` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that
 * drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's TRAINER
 * questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   game formats: one gate of the practice ladder (`tap`).
 *   exam formats: « اختزل على مرحلتين » (🪜), « احسب PGCD ثمّ احكم: هل الكسر قابل للاختزال؟ » (🔒), « اكتب الكسر على الشكل
 *   غير القابل للاختزال » (🎯), « احسب ثمّ أعطِ النتيجة على شكل كسر غير قابل للاختزال » (🧾).
 * A FRACTION on the sheet is the kit's fraction template, ONE token `{ frac: { n, d } }` (`Trainer.jsx › FormLines`):
 * typed, n and d are two boxes stacked over a real bar (`given(a, b)` prints a fraction of the statement the same way).
 * A typed fraction is one answer in its shape: it counts as ONE on a line (defects.md B17); a line types one at most.
 */
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { explain } from '../../../../../../common/gameworld/divisorIsles/strings';
import { fracTex as F, gcd, pgcdTex as P } from './math';
import { isRight, waveOf } from './practice';
import { K } from './story';

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** A fraction to type: its numerator box over its denominator box, on a real bar (the kit's fraction template). */
const fracBoxes = (n, d, of = '') => ({ frac: { n: num(n, `البسط${of}`), d: num(d, `المقام${of}`) } });
/** A fraction given by the statement, printed in the same shape. */
const given = (a, b) => ({ frac: { n: a, d: b } });
/** « PGCD(a ; b) » as a plain token of a form line. */
const pgcdLine = (a, b) => ({ ltr: true, tokens: [`PGCD(${a} ; ${b})`, '=', num('g', 'القاسم المشترك الأكبر')] });
/** The two verdicts of « هل الكسر قابل للاختزال؟ ». */
const VERDICTS = [
  { value: 'irr', text: 'غير قابل للاختزال' },
  { value: 'red', text: 'قابل للاختزال' },
];

/** Two coprime numbers p < q in [lo, hi]. */
function coprime(rand, lo, hi) {
  for (let t = 0; t < 400; t += 1) {
    const q = int(rand, lo + 1, hi);
    const p = int(rand, lo, q - 1);
    if (gcd(p, q) === 1) return [p, q];
  }
  throw new Error('trainer: no coprime pair');
}
/** The common divisors the trainer hides from the rules of divisibility (2, 3, 5, 9, 10). */
const HIDDEN = [7, 11, 13, 17, 19];
/** A box is a whole number written (not empty, not a decimal, not negative). */
const whole = (v, ...ks) =>
  ks.every((k) => v?.[k] != null && String(v[k]).trim() !== '' && Number.isInteger(Number(v[k])) && Number(v[k]) >= 0);
const n = (v, k) => Number(v?.[k]);

/** The hint for a PGCD x written for a and b, when it is not the right one (never the answer). */
function pgcdHint(a, b, x) {
  if (x === 0) return '0 ليس قاسمًا لأيّ عدد: القاسم المشترك الأكبر ليس 0.';
  if (x > Math.min(a, b)) return `${x} أكبر من ${Math.min(a, b)}: لا يقسمه.`;
  if (a % x === 0 && b % x === 0) return `${x} قاسم مشترك فعلًا. هل هو الأكبر؟ أكمل خوارزمية إقليدس حتّى آخرها.`;
  const [u, w] = a % x === 0 ? [b, a] : [a, b];
  return `$${u} = ${x} \\times ${Math.floor(u / x)} + ${u % x}$: ${x} لا يقسم ${u}${a % x === 0 ? `، وإن كان يقسم ${w}` : ''}.`;
}

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: wave.say };
  },

  /** exam (🪜) — « اختزل $\frac{a}{b}$ على مرحلتين: على d، ثمّ على e ». */
  marahil(rand) {
    const [p, q] = coprime(rand, 2, 15);
    const d = pick(rand, [2, 3, 5]);
    const e = pick(rand, [2, 3, 7]);
    const m = int(rand, 1, 2);
    const [a, b] = [p * m * d * e, q * m * d * e];
    return {
      format: 'exam',
      kind: 'marahil',
      key: K.marahil,
      a,
      b,
      d,
      e,
      prompt: `اختزل الكسر $${F(a, b)}$ على مرحلتين: اقسم بسطه ومقامه على ${d}، ثمّ اقسم بسط الكسر الناتج ومقامه على ${e}.`,
      form: {
        tip: 'tipCompute',
        lines: [
          { ltr: true, tokens: [given(a, b), '=', fracBoxes('p1', 'q1', ' الأوّل')] },
          { ltr: true, tokens: ['=', fracBoxes('p2', 'q2', ' الثاني')] },
        ],
      },
    };
  },

  /** exam (🔒) — « احسب PGCD(a ; b)، ثمّ احكم: هل الكسر $\frac{a}{b}$ قابل للاختزال؟ ». */
  hukm(rand) {
    // irreducible, or a common divisor that no rule of divisibility shows (7, 11, 13, 17, 19)
    const g = rand() < 0.5 ? 1 : pick(rand, HIDDEN);
    const [p, q] = g === 1 ? coprime(rand, 20, 150) : coprime(rand, 3, Math.floor(400 / g));
    const [a, b] = [p * g, q * g];
    return {
      format: 'exam',
      kind: 'hukm',
      key: K.ghayr,
      a,
      b,
      prompt: `احسب $${P(a, b)}$، ثمّ احكم: هل الكسر $${F(a, b)}$ قابل للاختزال؟`,
      form: {
        tip: 'tipDivision',
        model: { a: b, b: a },
        lines: [
          pgcdLine(a, b),
          { tokens: ['الكسر', given(a, b), { choice: 'verdict', options: shuffle(rand, VERDICTS) }] },
        ],
      },
    };
  },

  /** exam (🎯) — « اكتب $\frac{a}{b}$ على الشكل غير القابل للاختزال »: the PGCD, then the fraction. */
  mukhtazal(rand) {
    const [p, q] = coprime(rand, 2, 20);
    const g = pick(rand, [12, 14, 15, 18, 21, 24, 26, 27, 28, 33, 35, 36, 39]);
    const [a, b] = [p * g, q * g];
    return {
      format: 'exam',
      kind: 'mukhtazal',
      key: K.pgcd,
      a,
      b,
      prompt: `احسب $${P(a, b)}$، ثمّ اكتب الكسر $${F(a, b)}$ على الشكل غير القابل للاختزال.`,
      form: {
        tip: 'tipDivision',
        model: { a: b, b: a },
        lines: [pgcdLine(a, b), { ltr: true, tokens: [given(a, b), '=', fracBoxes('p', 'q')] }],
      },
    };
  },

  /** exam (🧾) — « احسب، ثمّ أعطِ النتيجة على شكل كسر غير قابل للاختزال »: a sum, a difference or a product. */
  hisab(rand) {
    for (let t = 0; t < 400; t += 1) {
      const op = pick(rand, ['+', '-', '×']);
      const [x, y] = op === '×' ? coprime(rand, 1, 12) : [int(rand, 1, 59), int(rand, 12, 60)];
      const [z, w] = op === '×' ? coprime(rand, 1, 15) : [int(rand, 1, 59), y];
      const [A, B] = op === '×' ? [x * z, y * w] : [op === '+' ? x + z : x - z, y];
      // each fraction given is irreducible; the result is not, and is not a whole number
      if (x >= y || z >= w || gcd(x, y) !== 1 || gcd(z, w) !== 1 || x === z) continue;
      if (!(A > 0) || A % B === 0 || gcd(A, B) === 1 || (op !== '×' && A >= B)) continue;
      return hisabOf(op, x, y, z, w, A, B);
    }
    throw new Error('trainer: no calculation');
  },
};

/** The question « احسب … ثمّ أعطِ النتيجة على شكل كسر غير قابل للاختزال » on x/y op z/w = A/B. */
function hisabOf(op, x, y, z, w, A, B) {
  const expr = op === '×' ? `${F(x, y)} \\times ${F(z, w)}` : `${F(x, y)} ${op} ${F(z, w)}`;
  return {
    format: 'exam',
    kind: 'hisab',
    key: K.natija,
    op,
    x,
    y,
    z,
    w,
    A,
    B,
    prompt: `احسب $${expr}$، ثمّ أعطِ النتيجة على شكل كسر غير قابل للاختزال.`,
    form: {
      tip: 'tipCompute',
      lines: [
        { ltr: true, tokens: [given(x, y), op === '-' ? '−' : op, given(z, w), '=', fracBoxes('s', 't', ' الناتج')] },
        { ltr: true, tokens: ['=', fracBoxes('p', 'q', ' المختزل')] },
      ],
    },
  };
}

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  marahil: [
    ['tap', 'marhala', { key: K.marahil }],
    ['tap', 'marhala', { key: K.marahil }],
    ['marahil'],
    ['tap', 'marhala', { key: K.marahil }],
    ['marahil'],
    ['marahil'],
  ],
  ghayr: [
    ['tap', 'ghayrW', { key: K.ghayr }],
    ['tap', 'ghayrW', { key: K.ghayr }],
    ['hukm'],
    ['tap', 'ghayrW', { key: K.ghayr }],
    ['hukm'],
    ['hukm'],
  ],
  pgcd: [
    ['tap', 'pgcdW', { key: K.pgcd, max: 60 }],
    ['tap', 'pgcdW', { key: K.pgcd, max: 100 }],
    ['mukhtazal'],
    ['tap', 'pgcdW', { key: K.pgcd, max: 100 }],
    ['mukhtazal'],
    ['mukhtazal'],
  ],
  natija: [
    ['tap', 'natijaW', { key: K.natija, op: '+' }],
    ['tap', 'natijaW', { key: K.natija, op: '-' }],
    ['hisab'],
    ['tap', 'natijaW', { key: K.natija, op: '+' }],
    ['hisab'],
    ['hisab'],
  ],
  mix: [
    ['tap', 'ghayrW', { key: K.ghayr }],
    ['tap', 'natijaW', { key: K.natija, op: '+' }],
    ['hukm'],
    ['tap', 'pgcdW', { key: K.pgcd, max: 100 }],
    ['mukhtazal'],
    ['hisab'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  'kasr-jisr': 'marahil',
  rappel: 'marahil',
  marahil: 'marahil',
  'mithal-78': 'marahil',
  'khata-marahil': 'marahil',
  ghayr: 'ghayr',
  'mithal-48': 'ghayr',
  'khata-ghayr': 'ghayr',
  pgcd: 'pgcd',
  'mithal-99': 'pgcd',
  'khata-pgcd': 'pgcd',
  natija: 'natija',
  'mithal-39': 'natija',
  'khata-natija': 'natija',
  khulasa: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'marahil':
      return { p1: q.a / q.d, q1: q.b / q.d, p2: q.a / q.d / q.e, q2: q.b / q.d / q.e };
    case 'hukm':
      return { g: gcd(q.a, q.b), verdict: gcd(q.a, q.b) === 1 ? 'irr' : 'red' };
    case 'mukhtazal': {
      const g = gcd(q.a, q.b);
      return { g, p: q.a / g, q: q.b / g };
    }
    case 'hisab': {
      const g = gcd(q.A, q.B);
      return { s: q.A, t: q.B, p: q.A / g, q: q.B / g };
    }
    default:
      return null;
  }
}

/** « $\frac{p}{q}$ » of what he wrote in two boxes. */
const wrote = (v, a, b) => `$${F(n(v, a), n(v, b))}$`;
/** The hint for a fraction p/q written where the irreducible form of A/B is asked (equal? irreducible?). */
function irreducibleHint(A, B, p, q) {
  if (q === 0) return 'المقام لا يكون 0.';
  if (A * q !== p * B) return `$${F(p, q)}$ لا يساوي $${F(A, B)}$: اقسم البسط والمقام على العدد نفسه.`;
  return `$${F(p, q)}$ يساوي $${F(A, B)}$، لكنّه يُختزل بعد: $${P(p, q)} = ${gcd(p, q)}$.`;
}

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  if (q.kind === 'tap') {
    const g = explain(q.wave, v);
    return { ok: isRight(q.wave, v), hint: g.wrong || 'انظر إلى البوّابة الخضراء.', fix: g.right };
  }
  switch (q.kind) {
    case 'marahil': {
      const { a, b, d, e } = q;
      const [a1, b1] = [a / d, b / d];
      const fix = `$${F(a, b)} = ${F(a1, b1)} = ${F(a1 / e, b1 / e)}$: نقسم البسط والمقام على ${d}، ثمّ على ${e}.`;
      if (!whole(v, 'p1', 'q1', 'p2', 'q2')) return { ok: false, hint: 'املأ الخانات الأربع: كسرين.', fix };
      const steps = [
        [n(v, 'p1'), d, a, 'البسط'],
        [n(v, 'q1'), d, b, 'المقام'],
        [n(v, 'p2'), e, a1, 'البسط'],
        [n(v, 'q2'), e, b1, 'المقام'],
      ];
      for (const [x, k, of, part] of steps)
        if (x * k !== of) return { ok: false, hint: `${part}: $${k} \\times ${x} = ${k * x}$، وليس ${of}.`, fix };
      return { ok: true, fix };
    }
    case 'hukm': {
      const { a, b } = q;
      const g = gcd(a, b);
      const fix = `$${P(a, b)} = ${g}$، إذن الكسر $${F(a, b)}$ ${g === 1 ? 'غير قابل للاختزال' : `قابل للاختزال: يُختزل على ${g}`}.`;
      if (!whole(v, 'g') || !['irr', 'red'].includes(v?.verdict))
        return { ok: false, hint: 'املأ الخانة واختر الحكم.', fix };
      if (n(v, 'g') !== g) return { ok: false, hint: pgcdHint(a, b, n(v, 'g')), fix };
      if (v.verdict !== (g === 1 ? 'irr' : 'red'))
        return { ok: false, hint: `قارن القاسم المشترك الأكبر الذي وجدته، ${g}، بالعدد 1.`, fix };
      return { ok: true, fix };
    }
    case 'mukhtazal': {
      const { a, b } = q;
      const g = gcd(a, b);
      const fix = `$${P(a, b)} = ${g}$، إذن $${F(a, b)} = ${F(`${a} \\div ${g}`, `${b} \\div ${g}`)} = ${F(a / g, b / g)}$.`;
      if (!whole(v, 'g', 'p', 'q'))
        return { ok: false, hint: 'املأ كلّ الخانات: القاسم المشترك الأكبر، ثمّ الكسر.', fix };
      if (n(v, 'g') !== g) return { ok: false, hint: pgcdHint(a, b, n(v, 'g')), fix };
      if (n(v, 'p') !== a / g || n(v, 'q') !== b / g)
        return { ok: false, hint: irreducibleHint(a, b, n(v, 'p'), n(v, 'q')), fix };
      return { ok: true, fix };
    }
    case 'hisab': {
      const { A, B } = q;
      const g = gcd(A, B);
      const expr = q.op === '×' ? `${F(q.x, q.y)} \\times ${F(q.z, q.w)}` : `${F(q.x, q.y)} ${q.op} ${F(q.z, q.w)}`;
      const fix = `$${expr} = ${F(A, B)}$ و $${P(A, B)} = ${g}$، إذن النتيجة $${F(A / g, B / g)}$.`;
      if (!whole(v, 's', 't', 'p', 'q'))
        return { ok: false, hint: 'املأ الخانات الأربع: النتيجة، ثمّ الكسر المختزل.', fix };
      if (n(v, 't') === 0 || A * n(v, 't') !== n(v, 's') * B)
        return {
          ok: false,
          hint:
            q.op === '×'
              ? `${wrote(v, 's', 't')} ليس الجداء: نضرب البسطين معًا والمقامين معًا.`
              : `${wrote(v, 's', 't')} ليس النتيجة: ${q.op === '+' ? 'نجمع' : 'نطرح'} البسطين فقط، والمقام يبقى ${B}.`,
          fix,
        };
      if (n(v, 'p') !== A / g || n(v, 'q') !== B / g)
        return { ok: false, hint: irreducibleHint(A, B, n(v, 'p'), n(v, 'q')), fix };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const x = (k) => v?.[k] ?? '…';
  const fr = (a, b) => `$${F(x(a), x(b))}$`;
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'marahil':
      return `$${F(q.a, q.b)}$ = ${fr('p1', 'q1')} = ${fr('p2', 'q2')}`;
    case 'hukm': {
      const verdict = VERDICTS.find((o) => o.value === v?.verdict)?.text ?? '…';
      return `$${P(q.a, q.b)} = ${x('g')}$ — ${verdict}`;
    }
    case 'mukhtazal':
      return `$${P(q.a, q.b)} = ${x('g')}$ — ${fr('p', 'q')}`;
    case 'hisab':
      return `${fr('s', 't')} = ${fr('p', 'q')}`;
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
