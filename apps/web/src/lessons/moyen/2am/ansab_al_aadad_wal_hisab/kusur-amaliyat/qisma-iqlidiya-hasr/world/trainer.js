/**
 * « تدرّب » of lesson `qisma-iqlidiya-hasr` — the CONTENT of its trainer (PURE). The frame — six questions, two formats
 * that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « أنجز القسمة الإقليدية », « احصر حاصل القسمة بين عددين طبيعيين متتاليين », « هل يقبل a القسمة على b؟ »,
 *   « كم صندوقًا مملوءًا؟ وكم صندوقًا يلزم؟ », « صحيح أم خطأ؟ علّل ».
 * Four families of plan: the division, the bracket, the zero remainder, and the mix.
 * The divisor of a paper question has two digits or THREE (what this lesson adds to the first year's division); every
 * count is written through `counted.js`; b is « المقسوم عليه ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { BOX, agree, count, noun, tamyiz } from './counted';
import { isRight, waveOf } from './practice';

const K = { ay: 'qisma-ay-adad', hasr: 'hasr-hasil', zero: 'inidam-baqi' };
const div = (a, b) => ({ q: Math.floor(a / b), r: a % b });
const euclid = (a, b) => `$${a} = ${b} \\times ${div(a, b).q} + ${div(a, b).r}$`;

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/** A divisor of two or three digits and a dividend of four digits; r ≠ 0 unless `zero`. */
function paperDivision(rand, { zero = false } = {}) {
  const b = pick(rand, [int(rand, 13, 96), int(rand, 101, 399)]);
  const q = int(rand, Math.ceil(1000 / b), Math.floor(9000 / b));
  const r = zero ? 0 : int(rand, 1, b - 1);
  return { a: b * q + r, b, q, r };
}
/** Small numbers for the quick formats: a divisor inside the tables, a dividend of two or three digits. */
function quickDivision(rand) {
  const b = int(rand, 6, 15);
  const q = int(rand, 4, 25);
  return { a: b * q + int(rand, 1, b - 1), b };
}
const CAN = noun('علبة', 'علب', 'f');
const CARTON = noun('كرتونة', 'كراتين', 'f');
/** What is packed when nothing says it (a question built by hand). */
const THING = noun('قطعة', 'قطع', 'f');
/** The goods of a situation: what is packed, in what, how many in one. */
const GOODS = [
  { what: noun('قارورة', 'قارورات', 'f'), box: BOX, size: [12, 24] },
  { what: CAN, box: CARTON, size: [15, 40] },
  { what: noun('كتاب', 'كتب'), box: CARTON, size: [25, 60] },
  { what: noun('برتقالة', 'برتقالات', 'f'), box: BOX, size: [36, 80] },
];

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });

/** « a = b × [q] + [r] ». */
const divisionLine = (a, b) => ({
  ltr: true,
  tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')],
});

// ───────────────────────────── « صحيح أم خطأ؟ علّل » ─────────────────────────────
/**
 * A statement, its truth, the written correction, its key and its three REASONS — the one that proves the verdict
 * first, then two that do not (a false fact, a true fact that proves nothing, a rule that does not exist). They are made
 * for THIS statement, and the right one is not the only one that carries a calculation.
 */
const TF = {
  division(rand) {
    const { a, b } = quickDivision(rand);
    const { q, r } = div(a, b);
    return pick(rand, [
      {
        statement: `$${a} = ${b} \\times ${q} + ${r}$ هي القسمة الإقليدية للعدد ${a} على ${b}`,
        truth: true,
        why: `$${a} = ${b} \\times ${q} + ${r}$ و ${r} أصغر من ${b}.`,
        key: K.ay,
        reasons: [
          `$${b} \\times ${q} + ${r} = ${a}$ و ${r} أصغر من ${b}`,
          `$${b} \\times ${q} + ${r} = ${a}$، ولا شرط على الباقي`,
          `$${b} \\times ${q} = ${b * q}$ أكبر من ${a}`,
        ],
      },
      {
        statement: `$${a} = ${b} \\times ${q - 1} + ${r + b}$ هي القسمة الإقليدية للعدد ${a} على ${b}`,
        truth: false,
        why: `المساواة صحيحة، لكنّ ${r + b} ليس أصغر من ${b}: $${a} = ${b} \\times ${q} + ${r}$.`,
        key: K.ay,
        reasons: [
          `الباقي ${r + b} ليس أصغر من ${b}`,
          `$${b} \\times ${q - 1} + ${r + b}$ لا يساوي ${a}`,
          'الباقي في قسمة إقليدية يساوي 0 دائمًا',
        ],
      },
    ]);
  },
  bracket(rand) {
    const { a, b } = quickDivision(rand);
    const { q, r } = div(a, b);
    return pick(rand, [
      {
        statement: `$${q} < ${a} \\div ${b} < ${q + 1}$`,
        truth: true,
        why: `$${a} = ${b} \\times ${q} + ${r}$ والباقي ليس 0، إذن $${a} \\div ${b}$ بين ${q} و ${q + 1}.`,
        key: K.hasr,
        reasons: [
          `$${b} \\times ${q} = ${b * q}$ و $${b} \\times ${q + 1} = ${b * (q + 1)}$، و ${a} بينهما`,
          `الباقي ${r} يقع بين ${q} و ${q + 1}`,
          `$${a} \\div ${b} = ${q}$ بالضبط`,
        ],
      },
      {
        statement: `${count(a, CAN)} في صناديق تسع ${b}: ${agree(q, ['يكفي', 'يكفي', 'تكفي'])} ${count(q, BOX)}`,
        truth: false,
        why: `$${a} = ${b} \\times ${q} + ${r}$: الباقي ${count(r, CAN)} خارج الصناديق المملوءة، ويلزم ${count(q + 1, BOX)}.`,
        key: K.hasr,
        reasons: [
          `$${b} \\times ${q} = ${b * q}$ أصغر من ${a}: الباقي ${count(r, CAN)} بلا صندوق`,
          `$${b} \\times ${q} = ${b * q}$ أكبر من ${a}`,
          `يلزم ${count(q + 2, BOX)} على الأقلّ`,
        ],
      },
    ]);
  },
  zero(rand) {
    const b = int(rand, 6, 15);
    const q = int(rand, 4, 25);
    const a = b * q;
    const r = int(rand, 1, b - 1);
    return pick(rand, [
      {
        statement: `علمًا أنّ $${a} = ${b} \\times ${q}$، فإنّ ${b} يقسم ${a}`,
        truth: true,
        why: `$${a} = ${b} \\times ${q} + 0$: الباقي معدوم، إذن ${a} مضاعف للعدد ${b}.`,
        key: K.zero,
        reasons: [
          `$${a} = ${b} \\times ${q} + 0$: باقي قسمة ${a} على ${b} معدوم`,
          `${b} أصغر من ${a}`,
          `$${b} \\times ${q} = ${a}$، وكلّ عدد يقسم كلّ عدد أكبر منه`,
        ],
      },
      {
        statement: `علمًا أنّ $${a} = ${b} \\times ${q}$، فإنّ ${a} يقسم ${b}`,
        truth: false,
        why: `$${a} = ${b} \\times ${q}$: ${a} مضاعف للعدد ${b}، و ${b} هو الذي يقسم ${a}.`,
        key: K.zero,
        reasons: [
          `$${a} = ${b} \\times ${q}$ تقول إنّ ${b} هو الذي يقسم ${a}، و ${a} أكبر من ${b}`,
          `$${a} = ${b} \\times ${q - 1} + ${b}$: باقي قسمة ${a} على ${b} ليس 0`,
          `${q} لا يقسم ${a}`,
        ],
      },
      {
        statement: `${a + r} يقبل القسمة على ${b}`,
        truth: false,
        why: `$${a + r} = ${b} \\times ${q} + ${r}$: الباقي ${r} وليس 0.`,
        key: K.zero,
        reasons: [
          `$${a + r} = ${b} \\times ${q} + ${r}$: الباقي ${r} وليس 0`,
          `$${b} \\times ${q} = ${a}$ أكبر من ${a + r}`,
          `رقم آحاد ${a + r} ليس 0`,
        ],
      },
    ]);
  },
};

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour) {
    const { statement, truth, why, key, reasons } = TF[flavour](rand);
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      reasons:
        format === 'exam'
          ? shuffle(
              rand,
              reasons.map((t, i) => ({ t: `لأنّ ${t}`, ok: i === 0 })),
            )
          : null,
      prompt: statement,
    };
  },

  /** exam — « أنجز القسمة الإقليدية للعدد a على b ». */
  division(rand) {
    const { a, b } = paperDivision(rand);
    return {
      format: 'exam',
      kind: 'division',
      key: K.ay,
      a,
      b,
      prompt: `أنجز القسمة الإقليدية للعدد ${a} على ${b}، ثمّ اكتب المساواة.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b)] },
    };
  },

  /** exam — « احصر حاصل القسمة a ÷ b بين عددين طبيعيين متتاليين ». */
  bracket(rand) {
    const { a, b } = paperDivision(rand);
    return {
      format: 'exam',
      kind: 'bracket',
      key: K.hasr,
      a,
      b,
      // the quotient written as the exercise bank writes it, with a fraction bar
      prompt: `احصر حاصل القسمة $\\frac{${a}}{${b}}$ بين عددين طبيعيين متتاليين.`,
      form: {
        tip: 'tipDivision',
        model: { a, b },
        lines: [
          {
            ltr: true,
            tokens: [
              num('lo', 'القيمة المقرّبة بالنقصان'),
              '<',
              `${a} ÷ ${b}`,
              '<',
              num('hi', 'القيمة المقرّبة بالزيادة'),
            ],
          },
        ],
      },
    };
  },

  /** exam — « هل يقبل a القسمة على b؟ »: the division, then the sentence that says it. Half the time the remainder is 0. */
  exact(rand) {
    const { a, b } = paperDivision(rand, { zero: rand() < 0.5 });
    return {
      format: 'exam',
      kind: 'exact',
      key: K.zero,
      a,
      b,
      prompt: `أنجز القسمة الإقليدية للعدد ${a} على ${b}، ثمّ اختر الجملة الصحيحة.`,
      form: {
        tip: 'tipDivision',
        model: { a, b },
        lines: [
          divisionLine(a, b),
          {
            tokens: [
              {
                choice: 'ph',
                options: shuffle(rand, [
                  { value: 'yes', text: `${a} يقبل القسمة على ${b}` },
                  { value: 'no', text: `${a} لا يقبل القسمة على ${b}` },
                  { value: 'swap', text: `${a} يقسم ${b}` },
                ]),
              },
            ],
          },
        ],
      },
    };
  },

  /**
   * exam — a situation: how many boxes are full, how many are needed. One time in four nothing is left: the boxes that
   * are full are then the boxes needed (the third key).
   */
  needed(rand) {
    const g = pick(rand, GOODS);
    const b = int(rand, ...g.size);
    const q = int(rand, 12, 90);
    const a = b * q + (rand() < 0.25 ? 0 : int(rand, 1, b - 1));
    return {
      format: 'exam',
      kind: 'needed',
      key: K.hasr,
      a,
      b,
      what: g.what,
      prompt: `نوضّب ${count(a, g.what, 'acc')} في ${g.box.many}، في كلّ ${g.box.one} ${b}. كم ${tamyiz(g.box)} نملأ تمامًا؟ وكم ${tamyiz(g.box)} يلزمنا لتوضيبها كلّها؟`,
      form: {
        tip: 'tipDivision',
        model: { a, b },
        lines: [
          { tokens: [{ text: 'المملوءة تمامًا:', rtl: true }, num('full', 'عدد المملوءة')] },
          { tokens: [{ text: 'اللازمة:', rtl: true }, num('need', 'عدد اللازمة')] },
        ],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const SMALL = { bMin: 3, bMax: 9, qMin: 3, qMax: 9, aMax: 100 };
const BIG = { bMin: 11, bMax: 25, qMin: 10, qMax: 30, aMax: 600 };
const PLANS = {
  ay: [
    ['tap', 'quotient', { ...SMALL, key: K.ay }],
    ['tf', 'division'],
    ['division'],
    // one digit of a quotient, with a divisor of three digits: the estimate of this lesson
    ['tap', 'digit', { key: K.ay }],
    ['tf', 'division'],
    ['division'],
  ],
  hasr: [
    ['tap', 'bracket', { ...SMALL, key: K.hasr }],
    ['tf', 'bracket'],
    ['bracket'],
    ['tap', 'bracket', { ...BIG, key: K.hasr, boxes: true, excess: true }],
    ['tf', 'bracket'],
    ['needed'],
  ],
  zero: [
    ['tap', 'multiple', { bMin: 6, bMax: 15, kMax: 6, key: K.zero, divisible: true }],
    ['tf', 'zero'],
    ['exact'],
    ['tap', 'complete', { ...SMALL, key: K.zero }],
    ['tf', 'zero'],
    ['exact'],
  ],
  mix: [
    ['tap', 'digit', { key: K.ay }],
    ['tf', 'bracket'],
    ['division'],
    ['tap', 'complete', { ...SMALL, key: K.zero }],
    ['needed'],
    ['exact'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  qisma: 'mix',
  mufradat: 'ay',
  taqdir: 'ay',
  'mithal-taqdir': 'ay',
  'khata-baqi': 'ay',
  hasr: 'hasr',
  muqarraba: 'hasr',
  'mithal-hasr': 'hasr',
  'khata-lazim': 'hasr',
  inidam: 'zero',
  siyagh: 'zero',
  khulasa: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'division':
    case 'exact': {
      const { q: quo, r } = div(q.a, q.b);
      return q.kind === 'exact' ? { q: quo, r, ph: r === 0 ? 'yes' : 'no' } : { q: quo, r };
    }
    case 'bracket':
      return { lo: div(q.a, q.b).q, hi: div(q.a, q.b).q + 1 };
    case 'needed':
      return { full: div(q.a, q.b).q, need: Math.ceil(q.a / q.b) };
    default:
      return null;
  }
}

/** The hint of a division written wrong: what the student's numbers give — never the right ones. */
function divisionHint(a, b, quo, r) {
  if (b * quo + r !== a) return `تحقّق: $${b} \\times ${quo} + ${r} = ${b * quo + r}$، وليس ${a}.`;
  if (r >= b) return `الباقي ${r} ليس أصغر من ${b}: يدخل ${b} مرّة أخرى على الأقلّ.`;
  return null;
}
/** The hint when a count of full containers (the value by default) is wrong. */
function fullHint(a, b, n) {
  if (b * n > a) return `$${b} \\times ${n} = ${b * n}$ يتجاوز ${a}.`;
  return `$${a} - ${b} \\times ${n} = ${a - b * n}$: ما زال ${b} يدخل مرّة أخرى على الأقلّ.`;
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
          ? 'تحقّق: أنجز القسمة، ثمّ انظر إلى الباقي قبل أن تحكم.'
          : 'الحكم صحيح، لكنّ هذا التعليل لا يثبته: تحقّق منه بالحساب.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'division': {
      const { a, b } = q;
      const fix = `${euclid(a, b)} و ${a % b} أصغر من ${b}.`;
      if (!whole('q', 'r')) return { ok: false, hint: 'املأ الخانتين: الحاصل والباقي.', fix };
      const hint = divisionHint(a, b, n('q'), n('r'));
      return hint ? { ok: false, hint, fix } : { ok: true, fix };
    }
    case 'bracket': {
      const { a, b } = q;
      const { q: quo, r } = div(a, b);
      // strict on the left only when something is left (a question by hand may have r = 0)
      const lt = r ? '<' : '\\leq';
      const fix = `${euclid(a, b)}، إذن $${b * quo} ${lt} ${a} < ${b * (quo + 1)}$ و $${quo} ${lt} ${a} \\div ${b} < ${quo + 1}$.`;
      if (!whole('lo', 'hi')) return { ok: false, hint: 'اكتب العددين: قبل الحاصل وبعده.', fix };
      if (n('lo') !== quo) return { ok: false, hint: fullHint(a, b, n('lo')), fix };
      if (n('hi') !== n('lo') + 1)
        return { ok: false, hint: 'نحصر بين عددين طبيعيين متتاليين: الثاني يزيد على الأوّل بـ 1.', fix };
      return { ok: true, fix };
    }
    case 'exact': {
      const { a, b } = q;
      const { r } = div(a, b);
      const fix =
        r === 0
          ? `$${a} = ${b} \\times ${a / b} + 0$: الباقي معدوم، إذن ${a} يقبل القسمة على ${b}.`
          : `${euclid(a, b)}: الباقي ${r} ليس 0، إذن ${a} لا يقبل القسمة على ${b}.`;
      if (!whole('q', 'r') || !v?.ph) return { ok: false, hint: 'املأ الخانتين واختر جملة.', fix };
      const hint = divisionHint(a, b, n('q'), n('r'));
      if (hint) return { ok: false, hint, fix };
      if (v.ph !== (r === 0 ? 'yes' : 'no'))
        return {
          ok: false,
          hint:
            v.ph === 'swap'
              ? `${a} أكبر من ${b}: العدد الأكبر لا يقسم الأصغر. ما الذي يقوله الباقي؟`
              : `الباقي الذي وجدته ${n('r')}: ماذا يقول عن ${a} و ${b}؟`,
          fix,
        };
      return { ok: true, fix };
    }
    case 'needed': {
      const { a, b } = q;
      const what = q.what ?? THING;
      const { q: quo, r } = div(a, b);
      const need = Math.ceil(a / b);
      const fix = `${euclid(a, b)}: المملوءة تمامًا ${quo}، ${r ? `والباقي ${count(r, what)}، فاللازمة ${need}` : 'ولا يبقى شيء، فاللازمة هي المملوءة نفسها'}.`;
      if (!whole('full', 'need')) return { ok: false, hint: 'اكتب العددين: المملوءة واللازمة.', fix };
      if (n('full') !== quo) return { ok: false, hint: fullHint(a, b, n('full')), fix };
      if (n('need') !== need)
        return {
          ok: false,
          hint:
            b * n('need') < a
              ? `$${b} \\times ${n('need')} = ${b * n('need')}$ أصغر من ${a}: الباقي ${count(a - b * n('need'), what)} بلا مكان.`
              : `$${b} \\times ${n('need')} = ${b * n('need')}$: أكثر ممّا يلزم لـ ${a}.`,
          fix,
        };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

const optionText = (q, slot, value) =>
  q.form.lines
    .flatMap((l) => l.tokens)
    .find((t) => t.choice === slot)
    ?.options.find((o) => o.value === value)?.text;

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'division':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$`;
    case 'bracket':
      return `$${v?.lo ?? '…'} < ${q.a} \\div ${q.b} < ${v?.hi ?? '…'}$`;
    case 'exact':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$ — ${optionText(q, 'ph', v?.ph) ?? '…'}`;
    case 'needed':
      return `المملوءة: ${v?.full ?? '…'} — اللازمة: ${v?.need ?? '…'}`;
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
