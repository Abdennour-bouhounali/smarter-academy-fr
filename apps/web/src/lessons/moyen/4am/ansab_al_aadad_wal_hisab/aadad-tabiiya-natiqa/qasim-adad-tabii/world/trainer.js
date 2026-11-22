/**
 * « تدرّب » of lesson `qasim-adad-tabii` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that
 * drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « أجرِ القسمة الإقليدية … ثمّ استنتج », « بيّن أنّ … », « أكمل », « صحيح أم خطأ؟ علّل », « اذكر … ».
 */
import { divide } from '../../../../../../common/gameworld/divisorIsles/logic';
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { divisionTip } from '../../../../../../common/gameworld/kit/tips';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { waveOf, isRight } from './practice';

const K = { baqi: 'qasim-baqi', jidaa: 'qasim-jidaa', siyagh: 'siyagh-mutakafia', wahid: 'wahid-wa-nafsuh' };
export const PHRASES = [
  { id: 'qasim', text: 'قاسم للعدد', small: true },
  { id: 'yaqsim', text: 'يقسم', small: true },
  { id: 'mudaaf', text: 'مضاعف للعدد', small: false },
  { id: 'yaqbal', text: 'يقبل القسمة على', small: false },
];
const eq = (a, b, q, r) => (r ? `$${a} = ${b} \\times ${q} + ${r}$` : `$${a} = ${b} \\times ${q}$`);

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
// A form is what the kit's trainer draws (kit/trainer.js › « a form »): lines of signs, boxes (`num`) and choices.
const num = (name, label) => ({ num: name, label });
const strong = (n) => ({ strong: n });
const VERDICT = [
  { id: 'yes', value: true, text: 'قاسم' },
  { id: 'no', value: false, text: 'ليس قاسمًا' },
];
/** « a = b × [q] + [r] », then « إذن b [قاسم / ليس قاسمًا] للعدد a ». The long division of a by b can be posed as a model. */
const divisionForm = (a, b) => ({
  tip: 'tipDivision',
  model: { a, b },
  lines: [
    { ltr: true, tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')] },
    { tokens: ['إذن', strong(b), { choice: 'fits', options: VERDICT }, 'للعدد', strong(a)] },
  ],
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
/** « x [العبارة] y »: the answer is the phrase chosen. */
const completeForm = (x, y) => ({
  tip: 'tipWrite',
  single: 'phrase',
  review: `${x} … ${y}`,
  lines: [
    {
      tokens: [
        strong(x),
        { choice: 'phrase', options: PHRASES.map((p) => ({ value: p.id, text: p.text })) },
        strong(y),
      ],
    },
  ],
});
/** « [x] و [y] ». */
const TWO_FORM = {
  tip: 'tipWrite',
  lines: [{ ltr: true, tokens: [num('x', 'القاسم الأوّل'), { text: 'و', rtl: true }, num('y', 'القاسم الثاني')] }],
};

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour = 'direction') {
    let statement;
    let truth;
    let why;
    let key = K.siyagh;
    let fact;
    if (flavour === 'special') {
      key = K.wahid;
      const a = pick(rand, [7, 12, 15, 23, 36, 49]);
      [statement, truth, why] = pick(rand, [
        [`1 قاسم للعدد ${a}`, true, `1 قاسم لكلّ عدد طبيعي: $${a} = 1 \\times ${a}$.`],
        [`${a} قاسم للعدد ${a}`, true, `كلّ عدد غير معدوم قاسم لنفسه: $${a} = ${a} \\times 1$.`],
        [`0 قاسم للعدد ${a}`, false, 'لا قسمة على 0: القاسم لا يكون معدومًا أبدًا.'],
        [`${a} قاسم لكلّ عدد طبيعي`, false, `العدد 1 وحده قاسم لكلّ عدد: $${a + 1} = ${a} \\times 1 + 1$، الباقي 1.`],
      ]);
      fact = why;
    } else {
      const b = int(rand, 2, 9);
      const k = int(rand, 2, 9);
      const a = b * k;
      const p = pick(rand, PHRASES);
      const mode = pick(rand, ['true', 'reversed', flavour === 'remainder' ? 'other' : 'reversed', 'true']);
      const [small, big] = [b, a];
      if (flavour === 'remainder') key = K.baqi;
      if (mode === 'other') {
        const x =
          pick(
            rand,
            [2, 3, 4, 5, 6, 7, 8, 9].filter((n) => a % n !== 0),
          ) ?? b + 1;
        const d = divide(a, x);
        statement = `${x} قاسم للعدد ${a}`;
        truth = false;
        fact = `${eq(a, x, d.q, d.r)}: الباقي ${d.r} ليس معدومًا.`;
        why = `${fact} إذن ${x} ليس قاسمًا للعدد ${a}.`;
      } else {
        const right = mode === 'true';
        const [x, y] = p.small === right ? [small, big] : [big, small];
        statement = `${x} ${p.text} ${y}`;
        truth = right;
        fact = `${eq(a, b, k, 0)}: القاسم هو ${b} والمضاعف هو ${a}.`;
        why = right ? fact : `${fact} الجملة مقلوبة الاتجاه.`;
      }
      // the wrong reasons are the lesson's own false leads: the parity of a number says nothing about a divisor
      const lures = [
        `لأنّ ${a} عدد ${a % 2 ? 'فردي' : 'زوجي'}`,
        `لأنّ حاصل القسمة ${k} عدد ${k % 2 ? 'فردي' : 'زوجي'}`,
      ];
      return {
        format,
        kind: 'tf',
        key,
        statement,
        truth,
        why,
        reasons:
          format === 'exam'
            ? shuffle(rand, [{ t: `لأنّ ${fact}`, ok: true }, ...lures.map((t) => ({ t, ok: false }))])
            : null,
        prompt: statement,
      };
    }
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
              { t: `لأنّ ${fact}`, ok: true },
              { t: 'لأنّ العدد فردي', ok: false },
              { t: 'لأنّ العدد أكبر من 1', ok: false },
            ])
          : null,
      prompt: statement,
    };
  },

  /** exam — « أجرِ القسمة الإقليدية للعدد a على b، ثمّ استنتج: هل b قاسم للعدد a؟ » */
  division(rand, f, fits = null) {
    // paper numbers, as on an exam sheet: a two-digit divisor, a two-digit quotient (420 ÷ 28, 756 ÷ 36 …)
    const b = int(rand, 12, 36);
    const q = int(rand, 11, 29);
    const yes = fits ?? rand() < 0.5;
    const r = yes ? 0 : int(rand, 1, b - 1);
    const a = b * q + r;
    return {
      format: 'exam',
      kind: 'division',
      key: K.baqi,
      a,
      b,
      q,
      r,
      prompt: `أجرِ القسمة الإقليدية للعدد ${a} على ${b}، ثمّ استنتج: هل ${b} قاسم للعدد ${a}؟`,
      form: divisionForm(a, b),
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
      key: K.jidaa,
      a: b * q,
      b,
      q,
      prompt: `بيّن أنّ ${b} قاسم للعدد ${b * q}، ثمّ استنتج قاسمًا آخر للعدد ${b * q}.`,
      form: showForm(b * q, b),
    };
  },

  /** exam — « أكمل بالعبارة المناسبة ». */
  complete(rand) {
    const b = int(rand, 3, 12);
    const k = int(rand, 3, 12);
    const a = b * k;
    const smallFirst = rand() < 0.5;
    return {
      format: 'exam',
      kind: 'complete',
      key: K.siyagh,
      a,
      b,
      k,
      x: smallFirst ? b : a,
      y: smallFirst ? a : b,
      smallFirst,
      prompt: 'أكمل بالعبارة المناسبة:',
      form: completeForm(smallFirst ? b : a, smallFirst ? a : b),
    };
  },

  /** exam — « دون أيّ حساب، اذكر قاسمين للعدد a ». */
  two(rand) {
    const a = pick(rand, [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 113]);
    return {
      format: 'exam',
      kind: 'two',
      key: K.wahid,
      a,
      prompt: `دون أيّ حساب، اذكر قاسمين للعدد ${a}.`,
      form: TWO_FORM,
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots of SESSION (game, game, exam, game, exam, exam). */
const PLANS = {
  baqi: [
    ['tap', 'divisorOf', { aMin: 6, aMax: 40, dMax: 8, key: K.baqi }],
    ['tap', 'remainder', { aMin: 10, aMax: 50, bMin: 2, bMax: 9, key: K.baqi }],
    ['division', true],
    ['tf', 'remainder'],
    ['division', false],
    ['division'],
  ],
  jidaa: [
    ['tap', 'missing', { bMin: 2, bMax: 9, qMin: 2, qMax: 9, key: K.jidaa }],
    ['tap', 'fromProduct', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
    ['show'],
    ['tap', 'missing', { bMin: 6, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
    ['show'],
    ['division', true],
  ],
  siyagh: [
    ['tap', 'multipleOf', { bMin: 2, bMax: 9, kMax: 6, key: K.siyagh }],
    ['tf', 'direction'],
    ['complete'],
    ['tap', 'divisorOf', { aMin: 12, aMax: 40, dMax: 10, key: K.siyagh, trap: true }],
    ['tf', 'direction'],
    ['complete'],
  ],
  wahid: [
    ['tap', 'everyNumber', { key: K.wahid }],
    ['tf', 'special'],
    ['two'],
    ['tap', 'sureOf', { key: K.wahid }],
    ['tf', 'special'],
    ['two'],
  ],
  mix: [
    ['tap', 'divisorOf', { aMin: 6, aMax: 40, dMax: 8, key: K.baqi }],
    ['tf', 'direction'],
    ['division'],
    ['tap', 'missing', { bMin: 3, bMax: 9, qMin: 3, qMax: 9, key: K.jidaa }],
    ['show'],
    ['complete'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  qasim: 'mix',
  khulasa: 'mix',
  baqi: 'baqi',
  tadhakkar: 'baqi',
  ex143: 'baqi',
  tahaqqaq: 'baqi',
  jidaa: 'jidaa',
  ex120: 'jidaa',
  'khata-amil': 'jidaa',
  siyagh: 'siyagh',
  'khata-ittijah': 'siyagh',
  wahid: 'wahid',
  intabih: 'wahid',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'division':
      return { q: q.q, r: q.r, fits: q.r === 0 };
    case 'show':
      return { q: q.q, x: q.q };
    case 'complete':
      return PHRASES.find((p) => p.small === q.smallFirst).id;
    case 'two':
      return { x: 1, y: q.a };
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
          ? 'تحقّق من اتجاه الجملة: من القاسم؟ ومن المضاعف؟ جرّب القسمة.'
          : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن المساواة التي تبرهن.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'division': {
      const fix = `${eq(q.a, q.b, q.q, q.r)}: الباقي ${q.r}${q.r === 0 ? '' : ' ليس معدومًا'}، إذن ${q.b} ${q.r === 0 ? 'قاسم' : 'ليس قاسمًا'} للعدد ${q.a}.`;
      const tip = divisionTip(q.a, q.b);
      if (!whole('q', 'r')) return { ok: false, hint: 'اكتب حاصل القسمة والباقي معًا.', fix, tip };
      if (q.b * n('q') + n('r') !== q.a)
        return {
          ok: false,
          hint: `تحقّق: $${q.b} \\times ${n('q')} + ${n('r')} = ${q.b * n('q') + n('r')}$، وليس ${q.a}.`,
          fix,
          tip,
        };
      if (n('r') >= q.b)
        return { ok: false, hint: `الباقي يجب أن يكون أصغر من ${q.b}: ما زال ${q.b} يدخل في ${n('r')}.`, fix, tip };
      if (v.fits !== (q.r === 0))
        return { ok: false, hint: 'القسمة صحيحة. انظر الآن إلى الباقي: هل هو معدوم؟', fix, tip };
      return { ok: true, fix, tip: divisionTip(q.a, q.b) };
    }
    case 'show': {
      const fix = `${eq(q.a, q.b, q.q, 0)}: ${q.b} قاسم للعدد ${q.a}، و ${q.q} قاسم له أيضًا.`;
      if (!whole('q', 'x')) return { ok: false, hint: 'اكتب العدد الناقص في المساواة، ثمّ القاسم الآخر.', fix };
      if (q.b * n('q') !== q.a)
        return { ok: false, hint: `تحقّق: $${q.b} \\times ${n('q')} = ${q.b * n('q')}$، وليس ${q.a}.`, fix };
      if (n('x') === q.b)
        return { ok: false, hint: `${q.b} هو القاسم الذي بيّنته. المطلوب قاسم آخر: اقرأ المساواة من جديد.`, fix };
      if (n('x') < 1 || q.a % n('x') !== 0)
        return { ok: false, hint: `${n('x')} ليس قاسمًا للعدد ${q.a}. القاسم الآخر مكتوب في مساواتك.`, fix };
      return { ok: true, fix };
    }
    case 'complete': {
      const p = PHRASES.find((x) => x.id === v);
      const good = PHRASES.filter((x) => x.small === q.smallFirst)
        .map((x) => `«${q.x} ${x.text} ${q.y}»`)
        .join(' أو ');
      const fix = `${eq(q.a, q.b, q.k, 0)}: ${good}.`;
      return {
        ok: Boolean(p) && p.small === q.smallFirst,
        hint: `$${q.a} = ${q.b} \\times ${q.k}$. من القاسم هنا؟ ومن المضاعف؟`,
        fix,
      };
    }
    case 'two': {
      const fix = `1 والعدد نفسه قاسمان دائمًا: $${q.a} = 1 \\times ${q.a}$، فالقاسمان هما 1 و ${q.a}.`;
      if (!whole('x', 'y')) return { ok: false, hint: 'اكتب القاسمين.', fix };
      const set = new Set([n('x'), n('y')]);
      return {
        ok: set.has(1) && set.has(q.a),
        hint: 'دون أيّ حساب: أيّ عدد يقسم كلّ الأعداد؟ وأيّ عدد يقسم نفسه دائمًا؟',
        fix,
      };
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
    case 'division':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$ — إذن ${q.b} ${v?.fits ? 'قاسم' : 'ليس قاسمًا'} للعدد ${q.a}`;
    case 'show':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'}$ — قاسم آخر: ${v?.x ?? '…'}`;
    case 'complete':
      return `${q.x} ${PHRASES.find((p) => p.id === v)?.text ?? '…'} ${q.y}`;
    case 'two':
      return `${v?.x ?? '…'} و ${v?.y ?? '…'}`;
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
