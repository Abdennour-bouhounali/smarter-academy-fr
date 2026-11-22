/**
 * « تدرّب » of lesson `qawasim-adad-tabii` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that
 * drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « اكتب … على شكل جداء عاملين بكلّ الأشكال », « بيّن أنّ … ثمّ استنتج », « أحصر … بين مربّعين »,
 *   « عيّن كلّ قواسم … », « دون إجراء القسمة … », « صحيح أم خطأ؟ علّل ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { divisorsOf, isRight, lastTry, waveOf } from './practice';

const K = { jidaa: 'jidaa-aamilayn', rappel: 'qasim-rappel', tariqa: 'tariqa-qawasim', qawaid: 'qawaid-qisma' };
const digitSum = (a) =>
  String(a)
    .split('')
    .reduce((s, d) => s + Number(d), 0);
/** What each divisibility rule reads in the number, and the name of that reading. */
export const READ = {
  2: { label: 'رقم الآحاد', of: (a) => a % 10 },
  5: { label: 'رقم الآحاد', of: (a) => a % 10 },
  3: { label: 'مجموع الأرقام', of: digitSum },
  9: { label: 'مجموع الأرقام', of: digitSum },
  4: { label: 'العدد المكوَّن من الرقمين الأخيرين', of: (a) => a % 100 },
};
/** The numbers whose divisors come in exactly `n` pairs — small enough to be written on one screen. */
const WITH_PAIRS = {
  2: [8, 10, 14, 15, 21, 22, 26, 27],
  3: [12, 18, 20, 28, 32, 44, 45, 50],
  4: [24, 30, 40, 42, 54, 56],
};
const pairsOf = (a) =>
  divisorsOf(a)
    .filter((d) => d * d <= a)
    .map((d) => [d, a / d]);

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
const strong = (n) => ({ strong: n });
const YES_NO = [
  { id: 'yes', value: true, text: 'يقبل' },
  { id: 'no', value: false, text: 'لا يقبل' },
];
/** One line « a = [x] × [y] » per pair of factors. */
const pairsForm = (a, n) => ({
  tip: 'tipWrite',
  lines: Array.from({ length: n }, (_, i) => ({
    ltr: true,
    tokens: [
      String(a),
      '=',
      num(`x${i}`, `العامل الأوّل في الجداء ${i + 1}`),
      '×',
      num(`y${i}`, `العامل الثاني في الجداء ${i + 1}`),
    ],
  })),
});
/** « a = b × [q] », then « قاسم آخر للعدد a: [x] ». */
const showForm = (a, b) => ({
  tip: 'tipDivision',
  model: { a, b },
  lines: [
    { ltr: true, tokens: [String(a), '=', String(b), '×', num('q', 'العدد الناقص')] },
    { tokens: ['قاسم آخر للعدد', strong(a), ':', num('x', 'قاسم آخر')] },
  ],
});
/** « [d]² ≤ a < [e]² ». */
const stopForm = (a) => ({
  tip: 'tipWrite',
  lines: [
    {
      ltr: true,
      tokens: [num('d', 'العدد الذي مربّعه لا يتجاوز'), '² ≤', String(a), '<', num('e', 'العدد الموالي'), '²'],
    },
  ],
});
/** As many boxes as the number has divisors. */
const listForm = (n) => ({
  tip: 'tipWrite',
  lines: [
    {
      ltr: true,
      tokens: Array.from({ length: n }, (_, i) => num(`d${i}`, `القاسم ${i + 1}`)).flatMap((t, i) =>
        i ? [{ text: '،', rtl: true }, t] : [t],
      ),
    },
  ],
});
/** « [reading]: [v] », then « إذن a [يقبل / لا يقبل] القسمة على b ». */
const ruleForm = (a, b) => ({
  tip: 'tipWrite',
  lines: [
    { tokens: [`${READ[b].label}:`, num('v', READ[b].label)] },
    { tokens: ['إذن', strong(a), { choice: 'fits', options: YES_NO }, 'القسمة على', strong(b)] },
  ],
});

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour) {
    const b = int(rand, 3, 9);
    const q = int(rand, 3, 9);
    const a = b * q;
    const make = {
      pair: () =>
        pick(rand, [
          [
            `بما أنّ $${a} = ${b} \\times ${q}$، فإنّ ${q} قاسم للعدد ${a}`,
            true,
            `$${a} = ${b} \\times ${q}$: العاملان ${b} و ${q} قاسمان للعدد ${a} معًا.`,
            K.jidaa,
          ],
          [
            `المساواة $${a} = ${b} \\times ${q}$ تعطي قاسمًا واحدًا للعدد ${a}`,
            false,
            `$${a} = ${b} \\times ${q}$ تعطي قاسمين: ${b} و ${q}.`,
            K.jidaa,
          ],
        ]),
      natural: () => {
        const odd = 2 * int(rand, 4, 12) + 1;
        return pick(rand, [
          [
            `بما أنّ $${odd} = 2 \\times ${String(odd / 2).replace('.', '{,}')}$، فإنّ 2 قاسم للعدد ${odd}`,
            false,
            `${String(odd / 2).replace('.', ',')} ليس عددًا طبيعيًّا: 2 ليس قاسمًا للعدد ${odd}.`,
            K.rappel,
          ],
          [`${b} قاسم للعدد ${a}`, true, `$${a} = ${b} \\times ${q}$ و ${q} عدد طبيعي.`, K.rappel],
        ]);
      },
      stop: () => {
        const n = pick(rand, [30, 40, 50, 60, 70, 90]);
        const d = lastTry(n);
        return pick(rand, [
          [
            `لتعيين كلّ قواسم ${n} يكفي أن نجرّب الأعداد من 1 إلى ${d}`,
            true,
            `$${d} \\times ${d} = ${d * d}$ لا يتجاوز ${n}، و $${d + 1} \\times ${d + 1} = ${(d + 1) * (d + 1)}$ يتجاوزه.`,
            K.tariqa,
          ],
          [
            `لتعيين كلّ قواسم ${n} يجب أن نجرّب الأعداد حتّى ${n / 2}`,
            false,
            `بعد ${d} تعود الجداءات نفسها مقلوبة: $${d + 1} \\times ${d + 1} = ${(d + 1) * (d + 1)}$ يتجاوز ${n}.`,
            K.tariqa,
          ],
        ]);
      },
      rule: () => {
        const p = pick(rand, [3, 9, 4]);
        const n = int(rand, 100, 400);
        const yes = n % p === 0;
        const v = READ[p].of(n);
        return [
          `${n} يقبل القسمة على ${p}`,
          yes,
          `${READ[p].label} ${v}، و ${v} ${v % p === 0 ? 'من' : 'ليس من'} مضاعفات ${p}.`,
          K.qawaid,
        ];
      },
    };
    const [statement, truth, why, key] = make[flavour]();
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      reasons:
        format === 'exam'
          ? shuffle(rand, [
              { t: `لأنّ ${why}`, ok: true },
              { t: 'لأنّ العدد زوجي', ok: false },
              { t: 'لأنّ العدد أكبر من 10', ok: false },
            ])
          : null,
      prompt: statement,
    };
  },

  /** exam — « اكتب a على شكل جداء عاملين بكلّ الأشكال الممكنة ». */
  pairs(rand, f, count = 3) {
    const a = pick(rand, WITH_PAIRS[count]);
    return {
      format: 'exam',
      kind: 'pairs',
      key: K.jidaa,
      a,
      n: count,
      prompt: `اكتب العدد ${a} على شكل جداء عاملين بكلّ الأشكال الممكنة (${count} كتابات).`,
      form: pairsForm(a, count),
    };
  },

  /** exam — « بيّن أنّ b قاسم للعدد a، ثمّ استنتج قاسمًا آخر للعدد a ». */
  show(rand) {
    let b;
    let q;
    do {
      b = int(rand, 6, 15);
      q = int(rand, 12, 28);
    } while (b === q);
    return {
      format: 'exam',
      kind: 'show',
      key: K.rappel,
      a: b * q,
      b,
      q,
      prompt: `بيّن أنّ ${b} قاسم للعدد ${b * q}، ثمّ استنتج قاسمًا آخر للعدد ${b * q}.`,
      form: showForm(b * q, b),
    };
  },

  /** exam — « أحصر a بين مربّعي عددين متتاليين »: where the search stops. */
  stop(rand) {
    const a = pick(rand, [40, 52, 68, 75, 90, 96, 105, 110, 130, 150]);
    return {
      format: 'exam',
      kind: 'stop',
      key: K.tariqa,
      a,
      prompt: `لتعيين قواسم ${a}، إلى أيّ عدد نجرّب؟ أحصر ${a} بين مربّعي عددين متتاليين.`,
      form: stopForm(a),
    };
  },

  /** exam — « عيّن كلّ قواسم a ». */
  list(rand, f, count = 3) {
    const a = pick(rand, WITH_PAIRS[count]);
    const n = divisorsOf(a).length;
    return {
      format: 'exam',
      kind: 'list',
      key: K.tariqa,
      a,
      n,
      prompt: `عيّن كلّ قواسم العدد ${a} (عددها ${n}).`,
      form: listForm(n),
    };
  },

  /** exam — « دون إجراء القسمة: هل a يقبل القسمة على b؟ ». */
  rule(rand) {
    const b = pick(rand, [3, 9, 4, 5]);
    const yes = rand() < 0.5;
    let a;
    do a = int(rand, 120, 990);
    while ((a % b === 0) !== yes);
    return {
      format: 'exam',
      kind: 'rule',
      key: K.qawaid,
      a,
      b,
      prompt: `دون إجراء القسمة: هل ${a} يقبل القسمة على ${b}؟`,
      form: ruleForm(a, b),
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  jidaa: [
    ['tap', 'missing', { bMin: 2, bMax: 9, qMin: 2, qMax: 9, key: K.jidaa }],
    ['tf', 'pair'],
    ['pairs', 2],
    ['tap', 'fromProduct', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
    ['pairs', 3],
    ['pairs', 4],
  ],
  rappel: [
    ['tap', 'divisorOf', { aMin: 8, aMax: 40, dMax: 8, key: K.rappel }],
    ['tf', 'natural'],
    ['show'],
    ['tap', 'remainder', { bMin: 2, bMax: 9, key: K.rappel }],
    ['tf', 'natural'],
    ['show'],
  ],
  tariqa: [
    ['tap', 'lastTry', { aMin: 10, aMax: 60, key: K.tariqa }],
    ['tf', 'stop'],
    ['stop'],
    ['tap', 'countOf', { list: [6, 8, 10, 12, 15, 16, 18, 20], key: K.tariqa }],
    ['list', 2],
    ['list', 3],
  ],
  qawaid: [
    ['tap', 'rule', { planks: [2, 5], key: K.qawaid }],
    ['tf', 'rule'],
    ['rule'],
    ['tap', 'rule', { planks: [3, 9, 4], key: K.qawaid }],
    ['rule'],
    ['rule'],
  ],
  mix: [
    ['tap', 'missing', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
    ['tf', 'stop'],
    ['pairs', 3],
    ['tap', 'rule', { planks: [3, 9], key: K.qawaid }],
    ['stop'],
    ['list', 3],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  qawasim: 'mix',
  khulasa: 'mix',
  jidaa: 'jidaa',
  ex60: 'jidaa',
  'khata-nisyan': 'jidaa',
  rappel: 'rappel',
  tariqa: 'tariqa',
  ex105: 'tariqa',
  'khata-nisf': 'tariqa',
  qawaid: 'qawaid',
  'khata-9': 'qawaid',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'pairs':
      return Object.fromEntries(
        pairsOf(q.a).flatMap(([d, e], i) => [
          [`x${i}`, d],
          [`y${i}`, e],
        ]),
      );
    case 'show':
      return { q: q.q, x: q.q };
    case 'stop':
      return { d: lastTry(q.a), e: lastTry(q.a) + 1 };
    case 'list':
      return Object.fromEntries(divisorsOf(q.a).map((d, i) => [`d${i}`, d]));
    case 'rule':
      return { v: READ[q.b].of(q.a), fits: q.a % q.b === 0 };
    default:
      return null;
  }
}

/** The factors a student wrote for « pairs », pair by pair, and the divisors he wrote for « list ». */
export const writtenPairs = (q, v) =>
  Array.from({ length: q.n }, (_, i) => [Number(v?.[`x${i}`]), Number(v?.[`y${i}`])]);
export const writtenList = (q, v) => Array.from({ length: q.n }, (_, i) => Number(v?.[`d${i}`]));

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  const n = (k) => Number(v?.[k]);
  const whole = (...ks) => ks.every((k) => v?.[k] !== '' && v?.[k] != null && Number.isInteger(n(k)) && n(k) >= 0);
  switch (q.kind) {
    case 'tap': {
      const g = explain(q.wave, v);
      return { ok: isRight(q.wave, v), hint: g.wrong, fix: g.right };
    }
    case 'tf': {
      const truthOk = v?.truth === q.truth;
      const reasonOk = !q.reasons || q.reasons[v?.reason]?.ok === true;
      return {
        ok: truthOk && reasonOk,
        hint: !truthOk
          ? 'تحقّق بالحساب: اكتب المساواة أو طبّق القاعدة قبل أن تحكم.'
          : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن المساواة أو القراءة التي تبرهن.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'pairs': {
      const all = pairsOf(q.a);
      const fix = `$${q.a} = ${all.map(([d, e]) => `${d} \\times ${e}`).join(' = ')}$`;
      const mine = writtenPairs(q, v);
      if (!whole(...Array.from({ length: q.n }, (_, i) => [`x${i}`, `y${i}`]).flat()))
        return { ok: false, hint: 'املأ كلّ الخانات: عاملان في كلّ سطر.', fix };
      const bad = mine.find(([x, y]) => x * y !== q.a);
      if (bad)
        return { ok: false, hint: `تحقّق: $${bad[0]} \\times ${bad[1]} = ${bad[0] * bad[1]}$، وليس ${q.a}.`, fix };
      const seen = new Set(mine.map(([x, y]) => Math.min(x, y)));
      return {
        ok: seen.size === q.n,
        hint: 'كتبتَ الجداء نفسه مرّتين (ولو مقلوبًا): ابحث عن جداء آخر، مبتدئًا بـ 1 ثمّ 2 ثمّ 3…',
        fix,
      };
    }
    case 'show': {
      const fix = `$${q.a} = ${q.b} \\times ${q.q}$: ${q.b} قاسم للعدد ${q.a}، و ${q.q} قاسم له أيضًا.`;
      if (!whole('q', 'x')) return { ok: false, hint: 'اكتب العدد الناقص في المساواة، ثمّ القاسم الآخر.', fix };
      if (q.b * n('q') !== q.a)
        return { ok: false, hint: `تحقّق: $${q.b} \\times ${n('q')} = ${q.b * n('q')}$، وليس ${q.a}.`, fix };
      if (n('x') === q.b)
        return { ok: false, hint: `${q.b} هو القاسم الذي بيّنته. المطلوب قاسم آخر: اقرأ المساواة من جديد.`, fix };
      if (n('x') < 1 || q.a % n('x') !== 0)
        return { ok: false, hint: `${n('x')} ليس قاسمًا للعدد ${q.a}. القاسم الآخر مكتوب في مساواتك.`, fix };
      return { ok: true, fix };
    }
    case 'stop': {
      const d = lastTry(q.a);
      const fix = `$${d}^2 = ${d * d} \\leq ${q.a} < ${(d + 1) * (d + 1)} = ${d + 1}^2$: نجرّب الأعداد من 1 إلى ${d}.`;
      if (!whole('d', 'e')) return { ok: false, hint: 'اكتب العددين المتتاليين.', fix };
      if (n('e') !== n('d') + 1) return { ok: false, hint: 'العددان يجب أن يكونا متتاليين.', fix };
      if (n('d') * n('d') > q.a)
        return { ok: false, hint: `$${n('d')}^2 = ${n('d') * n('d')}$ يتجاوز ${q.a}: ابحث عن عدد أصغر.`, fix };
      if (n('e') * n('e') <= q.a)
        return { ok: false, hint: `$${n('e')}^2 = ${n('e') * n('e')}$ لا يتجاوز ${q.a} بعد: ابحث عن عدد أكبر.`, fix };
      return { ok: true, fix };
    }
    case 'list': {
      const all = divisorsOf(q.a);
      const fix = `قواسم ${q.a} هي: ${all.join(' ، ')}.`;
      const mine = writtenList(q, v);
      if (!whole(...Array.from({ length: q.n }, (_, i) => `d${i}`)))
        return { ok: false, hint: 'املأ كلّ الخانات.', fix };
      const wrong = mine.find((d) => d < 1 || q.a % d !== 0);
      if (wrong != null) return { ok: false, hint: `${wrong} ليس قاسمًا للعدد ${q.a}: اقسم لتتأكّد.`, fix };
      return {
        ok: new Set(mine).size === q.n,
        hint: 'كتبتَ قاسمًا مرّتين: كلّ قسمة تامّة تعطي قاسمين، لا تنسَ الشريك.',
        fix,
      };
    }
    case 'rule': {
      const r = READ[q.b];
      const val = r.of(q.a);
      const yes = q.a % q.b === 0;
      const fix = `${r.label} ${val}، و ${val} ${val % q.b === 0 ? 'من' : 'ليس من'} مضاعفات ${q.b}: ${q.a} ${yes ? 'يقبل' : 'لا يقبل'} القسمة على ${q.b}.`;
      if (!whole('v')) return { ok: false, hint: `اكتب ${r.label} أوّلًا.`, fix };
      if (n('v') !== val) return { ok: false, hint: `أعد قراءة العدد: ${r.label} ليس ${n('v')}.`, fix };
      return { ok: v.fits === yes, hint: `القراءة صحيحة. هل ${val} من مضاعفات ${q.b}؟`, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'pairs':
      return `$${q.a} = ${writtenPairs(q, v)
        .map(([x, y]) => `${x || '…'} \\times ${y || '…'}`)
        .join(' = ')}$`;
    case 'show':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'}$ — قاسم آخر: ${v?.x ?? '…'}`;
    case 'stop':
      return `$${v?.d ?? '…'}^2 \\leq ${q.a} < ${v?.e ?? '…'}^2$`;
    case 'list':
      return writtenList(q, v)
        .map((d) => d || '…')
        .join(' ، ');
    case 'rule':
      return `${READ[q.b].label}: ${v?.v ?? '…'} — ${q.a} ${v?.fits ? 'يقبل' : 'لا يقبل'} القسمة على ${q.b}`;
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
