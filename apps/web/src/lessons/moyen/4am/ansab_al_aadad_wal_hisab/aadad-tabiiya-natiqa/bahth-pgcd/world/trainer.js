/**
 * « تدرّب » of lesson `bahth-pgcd` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that drift
 * toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's TRAINER questions,
 * generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « أكمل بالفرق ثمّ احسب PGCD », « بطريقة الفروق المتتالية », « أجرِ القسمة الإقليدية ثمّ أكمل بالباقي »,
 *   « بخوارزمية إقليدس », « كم قسمة؟ كم عملية طرح؟ أيّهما أسرع؟ », « صحيح أم خطأ؟ علّل ».
 * Every reason offered to « علّل » that is not the right one is a FALSE statement (an equality or a « يقسم » that does
 * not hold), and an equality the student completes that is TRUE but not the one asked is told so, never called false:
 * `trainer.test.js` computes each one. A form line holds at most three boxes (defects.md B17).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { differences, divTex, euclid, gcd, listAr, pgcdTex as P, subTex } from './math';
import { isRight, waveOf } from './practice';

const K = {
  farq: 'farq-yabqi',
  tarh: 'khawarizmiyat-al-tarh',
  baqi: 'baqi-yabqi',
  iqlidis: 'iqlidis',
  sura: 'aqall-khutuwat',
};

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/**
 * Two paper numbers a = g·m and b = g·n with m, n coprime and 2 ≤ n < m (so the PGCD is g ≥ gMin and b does not divide
 * a), min ≤ a ≤ max; `ok(a, b, m, n)` filters the pair.
 */
export function paperPair(rand, { min, max, gMin = 2, gMax = 40, ok = () => true }) {
  for (let t = 0; t < 600; t += 1) {
    const g = int(rand, gMin, gMax);
    const hi = Math.floor(max / g);
    if (hi < 3) continue;
    const m = int(rand, 3, hi);
    const n = int(rand, 2, m - 1);
    const [a, b] = [g * m, g * n];
    if (gcd(m, n) === 1 && a >= min && ok(a, b, m, n)) return [a, b];
  }
  throw new Error('trainer: no pair');
}

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** « PGCD(a ; b) » as a plain token of a form line. */
const pgcdText = (a, b) => `PGCD(${a} ; ${b})`;
const pgcdLine = (a, b) => ({ ltr: true, tokens: [pgcdText(a, b), '=', num('g', 'القاسم المشترك الأكبر')] });
/** « PGCD(a ; b) = PGCD(b ; [e]) ». */
const sameLine = (a, b, label) => ({
  ltr: true,
  tokens: [pgcdText(a, b), '=', `PGCD(${b} ;`, num('e', label), ')'],
});
/** « a = b × [q] + [r] ». */
const divisionLine = (a, b) => ({
  ltr: true,
  tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')],
});

/** « $x = n × q + r$ » — the division of x by n. */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const chainOf = (a, b) =>
  differences(a, b)
    .map((s) => `$${subTex(s)}$`)
    .join('، ');
const divisionsOf = (a, b) =>
  euclid(a, b)
    .map((s) => `$${divTex(s)}$`)
    .join('، ');

/** The hint for a PGCD n written for a and b (b < a), when it is not the right one (never the answer). */
function pgcdHint(a, b, n) {
  if (n === 0) return '0 ليس قاسمًا لأيّ عدد: القاسم المشترك الأكبر ليس 0.';
  if (n > b) return `${n} أكبر من ${b}: لا يقسمه.`;
  if (a % n === 0 && b % n === 0) return `${n} قاسم مشترك فعلًا. هل هو الأكبر؟ أكمل الخوارزمية حتّى آخرها.`;
  return a % n === 0 ? `${n} يقسم ${a}، لكن ${leaves(b, n)}.` : `${leaves(a, n)}: ${n} لا يقسم ${a}.`;
}

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. Every verdict is computed. */
  tf(rand, format, flavour) {
    // each statement: [its words, its truth, why (true), two reasons that are FALSE as statements, its key]
    const make = {
      farq: () => {
        const [a, b] = paperPair(rand, { min: 60, max: 400, ok: (x, y, m, n) => m < 2 * n });
        const [d, g] = [a - b, gcd(a, b)];
        const right = [
          `$${P(a, b)} = ${P(b, d)}$`,
          true,
          `$${a} - ${b} = ${d}$، والفرق يحفظ القواسم المشتركة.`,
          [`${g} لا يقسم ${d}`, `$${a} = ${b} \\times 1 + ${d + 1}$`],
          K.farq,
        ];
        // d ≠ g: d does not divide b (if it did, it would divide a = b + d and be the PGCD)
        const wrong = [
          `$${P(a, b)} = ${d}$`,
          false,
          `${leaves(b, d)}: الفرق ${d} لا يقسم ${b}، و $${P(a, b)} = ${g}$.`,
          [`${d} يقسم ${b}`, `${g} لا يقسم ${a}`],
          K.farq,
        ];
        return d === g ? right : pick(rand, [right, wrong]);
      },
      tarh: () => {
        const [a, b] = paperPair(rand, { min: 40, max: 200, ok: (x, y) => differences(x, y).length <= 6 });
        const g = gcd(a, b);
        return pick(rand, [
          [
            `$${P(a, b)} = ${g}$`,
            true,
            `${chainOf(a, b)}: آخر فرق غير معدوم هو ${g}.`,
            [`${g} لا يقسم ${a}`, `$${a} = ${g} \\times ${a / g + 1}$`],
            K.tarh,
          ],
          [
            `$${P(a, b)} = 0$`,
            false,
            `0 ليس قاسمًا لأيّ عدد: ${chainOf(a, b)}، وآخر فرق غير معدوم هو ${g}.`,
            [`${g} لا يقسم ${b}`, `$${b} = ${g} \\times ${b / g + 1}$`],
            K.tarh,
          ],
        ]);
      },
      baqi: () => {
        const [a, b] = paperPair(rand, { min: 80, max: 999, ok: (x, y, m, n) => m >= 2 * n });
        const g = gcd(a, b);
        const s = euclid(a, b)[0];
        const right = [
          `$${P(a, b)} = ${P(b, s.r)}$`,
          true,
          `$${divTex(s)}$، والباقي يحفظ القواسم المشتركة.`,
          [`$${a} = ${b} \\times ${s.q} + ${s.r + 1}$`, `${g} لا يقسم ${s.r}`],
          K.baqi,
        ];
        const wrong = [
          `$${P(a, b)} = ${P(b, s.q)}$`,
          false,
          `$${divTex(s)}$: ${s.q} هو الحاصل، و $${P(b, s.q)} = ${gcd(b, s.q)}$ بينما $${P(a, b)} = ${g}$.`,
          [`$${a} = ${s.q} \\times ${b} + ${s.r + 1}$`, `${g} لا يقسم ${b}`],
          K.baqi,
        ];
        return gcd(b, s.q) === g ? right : pick(rand, [right, wrong]);
      },
      iqlidis: () => {
        // exactly three divisions: a reason that chains more shrank the exam panel under 12 px at 1024 × 768 (trainer.test.js)
        const [a, b] = paperPair(rand, { min: 100, max: 999, gMin: 3, ok: (x, y) => euclid(x, y).length === 3 });
        const g = gcd(a, b);
        const steps = euclid(a, b);
        const [s] = steps;
        const lastQ = steps.at(-1).q;
        const lies = [`${g} لا يقسم ${b}`, `$${a} = ${b} \\times ${s.q} + ${s.r + 1}$`];
        const right = [
          `$${P(a, b)} = ${g}$`,
          true,
          `${divisionsOf(a, b)}: آخر باقٍ غير معدوم هو ${g}.`,
          lies,
          K.iqlidis,
        ];
        const wrong = [
          `$${P(a, b)} = ${lastQ}$`,
          false,
          `${divisionsOf(a, b)}: آخر باقٍ غير معدوم هو ${g}، أمّا ${lastQ} فهو آخر حاصل.`,
          lies,
          K.iqlidis,
        ];
        return lastQ === g ? right : pick(rand, [right, wrong]);
      },
      sura: () => {
        const [a, b] = paperPair(rand, {
          min: 100,
          max: 999,
          // at most three divisions, as above (a reason chains them all)
          ok: (x, y) =>
            differences(x, y).length > euclid(x, y).length &&
            differences(x, y).length <= 30 &&
            euclid(x, y).length <= 3,
        });
        const steps = euclid(a, b);
        const [e, s] = [steps.length, differences(a, b).length];
        const [first] = steps;
        const sum = `$${steps.map((x) => x.q).join(' + ')} = ${s}$`;
        const lies = [`$${a} = ${b} \\times ${first.q + 1} + ${first.r}$`, `${gcd(a, b)} لا يقسم ${a}`];
        const ask = `لحساب $${P(a, b)}$: عدد عمليات الطرح بخوارزمية الفروق`;
        return pick(rand, [
          [
            `${ask} ${s}، وعدد القسمات بخوارزمية إقليدس ${e}`,
            true,
            `${divisionsOf(a, b)}، وكلّ قسمة تجمع عمليات طرح بعدد حاصلها: ${sum}.`,
            lies,
            K.sura,
          ],
          [
            `${ask} ${s}، وعدد القسمات بخوارزمية إقليدس ${s} أيضًا`,
            false,
            `${divisionsOf(a, b)}: عدد القسمات ${e} فقط، وكلّ قسمة تجمع عمليات طرح بعدد حاصلها: ${sum}.`,
            lies,
            K.sura,
          ],
        ]);
      },
    };
    const [statement, truth, why, lies, key] = make[flavour]();
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      reasons:
        format === 'exam'
          ? shuffle(rand, [{ t: `لأنّ ${why}`, ok: true }, ...lies.map((t) => ({ t: `لأنّ ${t}`, ok: false }))])
          : null,
      prompt: statement,
    };
  },

  /** exam — « أكمل المساواة بالفرق a − b، ثمّ احسب PGCD(a ; b) » (the PGCD of b and a − b is then within reach). */
  farq(rand) {
    const [a, b] = paperPair(rand, { min: 60, max: 400, ok: (x, y, m, n) => m - n <= 2 });
    return {
      format: 'exam',
      kind: 'farq',
      key: K.farq,
      a,
      b,
      prompt: `ليكن العددان ${a} و ${b}. أكمل المساواة بالفرق $${a} - ${b}$، ثمّ احسب $${P(a, b)}$.`,
      form: { tip: 'tipWrite', lines: [sameLine(a, b, 'الفرق'), pgcdLine(a, b)] },
    };
  },

  /** exam — « احسب PGCD(a ; b) بطريقة الفروق المتتالية » (b < a < 2b: the first subtraction leaves less than b). */
  furuq(rand) {
    const [a, b] = paperPair(rand, {
      min: 60,
      max: 300,
      ok: (x, y, m, n) => m < 2 * n && differences(x, y).length <= 7,
    });
    return {
      format: 'exam',
      kind: 'furuq',
      key: K.tarh,
      a,
      b,
      prompt: `احسب $${P(a, b)}$ بطريقة الفروق المتتالية، ثمّ انقل الفرق الأوّل والنتيجة.`,
      form: {
        tip: 'tipWrite',
        lines: [{ ltr: true, tokens: [`${a} − ${b}`, '=', num('d', 'الفرق الأوّل')] }, pgcdLine(a, b)],
      },
    };
  },

  /** exam — « أجرِ القسمة الإقليدية للعدد a على b، ثمّ أكمل بالباقي PGCD(a ; b) = PGCD(b ; …) ». */
  baqi(rand) {
    const [a, b] = paperPair(rand, { min: 300, max: 2000, ok: (x, y, m, n) => m >= 2 * n });
    return {
      format: 'exam',
      kind: 'baqi',
      key: K.baqi,
      a,
      b,
      prompt: `أجرِ القسمة الإقليدية للعدد ${a} على ${b}، ثمّ أكمل المساواة بالباقي.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b), sameLine(a, b, 'الباقي')] },
    };
  },

  /** exam — « احسب PGCD(a ; b) بخوارزمية إقليدس »: the first division, then the result. */
  iqlidis(rand) {
    const [a, b] = paperPair(rand, { min: 400, max: 3000, gMin: 6, ok: (x, y) => euclid(x, y).length >= 3 });
    return {
      format: 'exam',
      kind: 'iqlidis',
      key: K.iqlidis,
      a,
      b,
      prompt: `احسب $${P(a, b)}$ بخوارزمية إقليدس مع كتابة مراحل الحساب، ثمّ انقل القسمة الأولى والنتيجة.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b), pgcdLine(a, b)] },
    };
  },

  /** exam — « كم قسمة؟ كم عملية طرح؟ أيّهما أسرع؟ ». */
  sura(rand) {
    const [a, b] = paperPair(rand, {
      min: 100,
      max: 1200,
      ok: (x, y) => differences(x, y).length > euclid(x, y).length && differences(x, y).length <= 30,
    });
    return {
      format: 'exam',
      kind: 'sura',
      key: K.sura,
      a,
      b,
      prompt: `لحساب $${P(a, b)}$: كم قسمة تحتاج خوارزمية إقليدس؟ وكم عملية طرح تحتاج خوارزمية الفروق؟ أيّهما أسرع؟`,
      form: {
        tip: 'tipWrite',
        lines: [
          { tokens: ['عدد القسمات بخوارزمية إقليدس:', num('e', 'عدد القسمات')] },
          { tokens: ['عدد عمليات الطرح بخوارزمية الفروق:', num('s', 'عدد عمليات الطرح')] },
          {
            tokens: [
              'الأسرع:',
              {
                choice: 'fast',
                options: shuffle(rand, [
                  { value: 'euclid', text: 'خوارزمية إقليدس' },
                  { value: 'diff', text: 'خوارزمية الفروق' },
                ]),
              },
            ],
          },
        ],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  farq: [
    ['tap', 'diffBox', { max: 80, key: K.farq }],
    ['tf', 'farq'],
    ['farq'],
    ['tap', 'diffBox', { max: 100, key: K.farq }],
    ['tf', 'farq'],
    ['farq'],
  ],
  tarh: [
    ['tap', 'lastDiff', { maxSteps: 4, key: K.tarh }],
    ['tf', 'tarh'],
    ['furuq'],
    ['tap', 'lastDiff', { maxSteps: 6, key: K.tarh }],
    ['tf', 'tarh'],
    ['furuq'],
  ],
  baqi: [
    ['tap', 'restBox', { key: K.baqi }],
    ['tf', 'baqi'],
    ['baqi'],
    ['tap', 'remainder', { key: K.baqi }],
    ['tf', 'baqi'],
    ['baqi'],
  ],
  iqlidis: [
    ['tap', 'lastRest', { key: K.iqlidis }],
    ['tf', 'iqlidis'],
    ['iqlidis'],
    ['tap', 'pgcdOf', { key: K.iqlidis }],
    ['tf', 'iqlidis'],
    ['iqlidis'],
  ],
  sura: [
    ['tap', 'divCount', { key: K.sura }],
    ['tf', 'sura'],
    ['sura'],
    ['tap', 'subCount', { key: K.sura }],
    ['tf', 'sura'],
    ['sura'],
  ],
  mix: [
    ['tap', 'diffBox', { max: 100, key: K.farq }],
    ['tf', 'baqi'],
    ['furuq'],
    ['tap', 'lastRest', { key: K.iqlidis }],
    ['iqlidis'],
    ['sura'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  'pgcd-tawil': 'mix',
  rappel: 'baqi',
  farq: 'farq',
  'khata-farq': 'farq',
  'mithal-152': 'farq',
  silsila: 'tarh',
  'khata-sifr': 'tarh',
  'mithal-259': 'tarh',
  baqi: 'baqi',
  'mithal-962': 'baqi',
  'khata-hasil': 'baqi',
  iqlidis: 'iqlidis',
  'mithal-1833': 'iqlidis',
  muqarana: 'sura',
  khulasa: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  const first = q.a ? euclid(q.a, q.b)[0] : null;
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'farq':
      return { e: q.a - q.b, g: gcd(q.a, q.b) };
    case 'furuq':
      return { d: q.a - q.b, g: gcd(q.a, q.b) };
    case 'baqi':
      return { q: first.q, r: first.r, e: first.r };
    case 'iqlidis':
      return { q: first.q, r: first.r, g: gcd(q.a, q.b) };
    case 'sura':
      return { e: euclid(q.a, q.b).length, s: differences(q.a, q.b).length, fast: 'euclid' };
    default:
      return null;
  }
}

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  const n = (k) => Number(v?.[k]);
  const whole = (...ks) => ks.every((k) => v?.[k] !== '' && v?.[k] != null && Number.isInteger(n(k)) && n(k) >= 0);
  if (q.kind === 'tap') {
    const g = explain(q.wave, v);
    return { ok: isRight(q.wave, v), hint: g.wrong, fix: g.right };
  }
  if (q.kind === 'tf') {
    const truthOk = v?.truth === q.truth;
    const reasonOk = !q.reasons || q.reasons[v?.reason]?.ok === true;
    return {
      ok: truthOk && reasonOk,
      hint: !truthOk
        ? 'تحقّق بالحساب: أجرِ الفروق أو القسمات قبل أن تحكم.'
        : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن الحساب الذي يبرهن.',
      fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
    };
  }
  const { a, b } = q;
  const g = gcd(a, b);
  const steps = euclid(a, b);
  const [first] = steps;
  /** The division a = b × q + r he wrote, or null when it is right. */
  const divisionHint = () => {
    if (b * n('q') + n('r') !== a)
      return `تحقّق: $${b} \\times ${n('q')} + ${n('r')} = ${b * n('q') + n('r')}$، وليس ${a}.`;
    if (n('r') >= b) return `الباقي ${n('r')} ليس أصغر من ${b}: العدد ${b} يدخل مرّة أخرى على الأقلّ.`;
    return null;
  };
  /** An e that is not the number asked: a TRUE equality is told so; a false one is shown false. */
  const sameHint = (e, asked) =>
    e >= 1 && gcd(b, e) === g
      ? `المساواة $${P(a, b)} = ${P(b, e)}$ صحيحة، لكنّ المطلوب هنا ${asked}.`
      : `المساواة لا تُكمَل بالعدد ${e}: المطلوب هنا ${asked}.`;
  switch (q.kind) {
    case 'farq': {
      const d = a - b;
      const fix = `$${a} - ${b} = ${d}$، إذن $${P(a, b)} = ${P(b, d)} = ${g}$.`;
      if (!whole('e', 'g')) return { ok: false, hint: 'املأ الخانتين: الفرق، ثمّ القاسم المشترك الأكبر.', fix };
      if (n('e') !== d) {
        const e = n('e');
        const hint =
          e >= 1 && gcd(b, e) === g
            ? sameHint(e, `الفرق $${a} - ${b}$`)
            : `تحقّق: $${b} + ${e} = ${b + e}$، وليس ${a}.`;
        return { ok: false, hint, fix };
      }
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      return { ok: true, fix };
    }
    case 'furuq': {
      const fix = `${chainOf(a, b)}: آخر فرق غير معدوم هو ${g}، إذن $${P(a, b)} = ${g}$.`;
      if (!whole('d', 'g')) return { ok: false, hint: 'املأ الخانتين: الفرق الأوّل، ثمّ النتيجة.', fix };
      if (n('d') !== a - b) return { ok: false, hint: `تحقّق: $${b} + ${n('d')} = ${b + n('d')}$، وليس ${a}.`, fix };
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      return { ok: true, fix };
    }
    case 'baqi': {
      const fix = `$${divTex(first)}$، إذن $${P(a, b)} = ${P(b, first.r)}$.`;
      if (!whole('q', 'r', 'e'))
        return { ok: false, hint: 'املأ كلّ الخانات: الحاصل، الباقي، ثمّ العدد الثاني في المساواة.', fix };
      const h = divisionHint();
      if (h) return { ok: false, hint: h, fix };
      if (n('e') !== first.r) return { ok: false, hint: sameHint(n('e'), 'الباقي الذي وجدته في السطر الأوّل'), fix };
      return { ok: true, fix };
    }
    case 'iqlidis': {
      const fix = `${divisionsOf(a, b)}: آخر باقٍ غير معدوم هو ${g}، إذن $${P(a, b)} = ${g}$.`;
      if (!whole('q', 'r', 'g')) return { ok: false, hint: 'املأ كلّ الخانات: القسمة الأولى، ثمّ النتيجة.', fix };
      const h = divisionHint();
      if (h) return { ok: false, hint: h, fix };
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      return { ok: true, fix };
    }
    case 'sura': {
      const s = differences(a, b).length;
      const fix = `${divisionsOf(a, b)}: عدد القسمات ${steps.length}. وكلّ قسمة تجمع عمليات طرح بعدد حاصلها: $${steps.map((x) => x.q).join(' + ')} = ${s}$. خوارزمية إقليدس أسرع.`;
      if (!whole('e', 's') || !v?.fast) return { ok: false, hint: 'املأ الخانتين واختر الأسرع.', fix };
      if (n('e') !== steps.length)
        return { ok: false, hint: 'اكتب القسمات واحدة تحت الأخرى حتّى تصل إلى الباقي 0، ثمّ عُدّها.', fix };
      if (n('s') !== s) return { ok: false, hint: 'كلّ قسمة تجمع عمليات طرح بعدد حاصلها: اجمع الحواصل.', fix };
      if (v.fast !== 'euclid') return { ok: false, hint: `قارن العددين اللذين كتبتهما: ${n('e')} و ${n('s')}.`, fix };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const x = (k) => v?.[k] ?? '…';
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'farq':
      return listAr([`$${P(q.a, q.b)} = ${P(q.b, x('e'))}$`, `$${P(q.a, q.b)} = ${x('g')}$`]);
    case 'furuq':
      return listAr([`$${q.a} - ${q.b} = ${x('d')}$`, `$${P(q.a, q.b)} = ${x('g')}$`]);
    case 'baqi':
      return listAr([`$${q.a} = ${q.b} \\times ${x('q')} + ${x('r')}$`, `$${P(q.a, q.b)} = ${P(q.b, x('e'))}$`]);
    case 'iqlidis':
      return listAr([`$${q.a} = ${q.b} \\times ${x('q')} + ${x('r')}$`, `$${P(q.a, q.b)} = ${x('g')}$`]);
    case 'sura': {
      const fast = q.form.lines[2].tokens[1].options.find((o) => o.value === v?.fast)?.text ?? '…';
      return `القسمات: ${x('e')} — عمليات الطرح: ${x('s')} — الأسرع: ${fast}`;
    }
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
