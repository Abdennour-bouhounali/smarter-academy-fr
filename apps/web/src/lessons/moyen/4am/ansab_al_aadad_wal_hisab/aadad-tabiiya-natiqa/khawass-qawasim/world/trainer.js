/**
 * « تدرّب » of lesson `khawass-qawasim` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that
 * drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « اكتب المجموع والفرق على الشكل d × k », « دون حساب الجداء … », « أجرِ القسمة الإقليدية ثمّ استنتج »,
 *   « برهن أنّ … » (with letters: each step chosen), « صحيح أم خطأ؟ علّل ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { isRight, waveOf } from './practice';

const K = { jam: 'jam-wal-farq', madaaf: 'madaaf', baqi: 'baqi-qisma', burhan: 'burhan' };

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });

/** « a + b = d × [s] », « a − b = d × [f] ». */
const sumDiffForm = (a, b, d) => ({
  tip: 'tipWrite',
  lines: [
    { ltr: true, tokens: [`${a} + ${b}`, '=', String(d), '×', num('s', 'العدد k في المجموع')] },
    { ltr: true, tokens: [`${a} − ${b}`, '=', String(d), '×', num('f', 'العدد k في الفرق')] },
  ],
});
/** « a × n = d × [k] ». */
const multipleForm = (a, n, d) => ({
  tip: 'tipWrite',
  lines: [{ ltr: true, tokens: [`${a} × ${n}`, '=', String(d), '×', num('k', 'العدد k')] }],
});
/** « a = b × [q] + [r] », then « الباقي = d × [k] ». */
const restForm = (a, b, d) => ({
  tip: 'tipDivision',
  model: { a, b },
  lines: [
    { ltr: true, tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')] },
    { ltr: true, tokens: [{ text: 'الباقي', rtl: true }, '=', String(d), '×', num('k', 'العدد k')] },
  ],
});

/**
 * The three proofs of the lesson: what is given, what is asked, how it is written. Letters only — the letters of the
 * proof he assembled in the world and of its tablet: a = d × k, b = d × k′ (never q: the quotient of a division); `n`
 * is the number a is multiplied by. `factor` is the natural number the goal is d times.
 */
export const PROOFS = {
  sum: {
    cond: 'd يقسم a و b',
    given: 'a = d × k ، b = d × k′',
    givenTex: "a = d \\times k \\quad b = d \\times k'",
    goal: 'a + b',
    goalTex: 'a + b',
    factor: 'k + k′',
    factorTex: "k + k'",
    right: 'd × (k + k′)',
    rightTex: "d \\times (k + k')",
    foils: ['d × k × k′', 'd + (k + k′)'],
  },
  diff: {
    cond: 'd يقسم a و b',
    given: 'a = d × k ، b = d × k′',
    givenTex: "a = d \\times k \\quad b = d \\times k'",
    goal: 'a − b',
    goalTex: 'a - b',
    factor: 'k − k′',
    factorTex: "k - k'",
    right: 'd × (k − k′)',
    rightTex: "d \\times (k - k')",
    foils: ['d × (k + k′)', 'd − (k − k′)'],
  },
  mult: {
    cond: 'd يقسم a',
    given: 'a = d × k',
    givenTex: 'a = d \\times k',
    goal: 'n × a',
    goalTex: 'n \\times a',
    factor: 'n × k',
    factorTex: 'n \\times k',
    right: 'd × (n × k)',
    rightTex: 'd \\times (n \\times k)',
    foils: ['n × (d + k)', 'd + n × k'],
  },
};
const proofPrompt = (target) =>
  target === 'mult'
    ? '$d$ يقسم $a$، و $n$ عدد طبيعي. برهن أنّ $d$ يقسم $n \\times a$.'
    : `$d$ يقسم العددين الطبيعيين $a$ و $b$${target === 'diff' ? ' (حيث $a \\geq b$)' : ''}. برهن أنّ $d$ يقسم $${PROOFS[target].goalTex}$.`;
/** « نبدأ من [الشرط] », the condition in letters, « goal = [d × k] », « و [k عدد طبيعي] إذن d يقسم goal ». */
const proofForm = (rand, P) => ({
  tip: 'tipWrite',
  lines: [
    {
      tokens: [
        'نبدأ من',
        {
          choice: 'start',
          options: shuffle(rand, [
            { value: 'cond', text: P.cond },
            { value: 'goal', text: `d يقسم ${P.goal}` },
            { value: 'example', text: 'مثال بأعداد' },
          ]),
        },
      ],
    },
    { ltr: true, tokens: [P.given] },
    {
      ltr: true,
      tokens: [
        P.goal,
        '=',
        {
          choice: 'k',
          options: shuffle(rand, [
            { value: 'right', text: P.right },
            { value: 'f1', text: P.foils[0] },
            { value: 'f2', text: P.foils[1] },
          ]),
        },
      ],
    },
    {
      tokens: [
        'و',
        {
          choice: 'nat',
          options: shuffle(rand, [
            { value: 'nat', text: `${P.factor} عدد طبيعي` },
            { value: 'big', text: `${P.factor} أكبر من d` },
            { value: 'ex', text: 'تحقّقنا على مثال' },
          ]),
        },
        'إذن d يقسم',
        P.goal,
      ],
    },
  ],
});
const optionText = (q, slot, value) =>
  q.form.lines
    .flatMap((l) => l.tokens)
    .find((t) => t.choice === slot)
    ?.options.find((o) => o.value === value)?.text;

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour) {
    const d = int(rand, 3, 9);
    const make = {
      sum: () => {
        const p = int(rand, 2, 9);
        const q = int(rand, 2, 9);
        const [a, b] = [d * p, d * q];
        // the converse: d divides the sum of two numbers it does not divide
        const s = int(rand, 1, d - 1);
        const [x, y] = [d * int(rand, 2, 6) + s, d * int(rand, 2, 6) + (d - s)];
        return pick(rand, [
          [
            `${d} يقسم ${a} و ${b}، إذن ${d} يقسم ${a + b}`,
            true,
            `$${a} + ${b} = ${d} \\times ${p} + ${d} \\times ${q} = ${d} \\times ${p + q}$.`,
            K.jam,
          ],
          [
            `${d} يقسم ${x + y} و $${x + y} = ${x} + ${y}$، إذن ${d} يقسم ${x}`,
            false,
            `$${x} = ${d} \\times ${Math.floor(x / d)} + ${s}$: الباقي ${s}. قد يقسم عددٌ مجموعًا دون أن يقسم حدَّيه.`,
            K.jam,
          ],
        ]);
      },
      multiple: () => {
        const p = int(rand, 2, 9);
        const n = int(rand, 3, 9);
        // the converse: d = u × v divides a × v when u divides a, without dividing a
        const D = pick(rand, [4, 6, 9, 10, 15]);
        const u = [2, 3, 5].find((x) => D % x === 0);
        let a2;
        do a2 = u * int(rand, 2, 9);
        while (a2 % D === 0);
        const v = D / u;
        return pick(rand, [
          [
            `${d} يقسم ${d * p}، إذن ${d} يقسم $${d * p} \\times ${n}$`,
            true,
            `$${d * p} \\times ${n} = ${d} \\times ${p} \\times ${n} = ${d} \\times ${p * n}$.`,
            K.madaaf,
          ],
          [
            `${D} يقسم $${a2} \\times ${v}$، إذن ${D} يقسم ${a2}`,
            false,
            `$${a2} = ${D} \\times ${Math.floor(a2 / D)} + ${a2 % D}$: ${D} لا يقسم ${a2}. الخاصية تسير من العدد إلى مضاعفاته، لا العكس.`,
            K.madaaf,
          ],
        ]);
      },
      rest: () => {
        const m = int(rand, 2, 4);
        const b = d * m;
        const q = int(rand, 2, 5);
        const r = d * int(rand, 1, m - 1);
        let r2;
        do r2 = int(rand, 1, b - 1);
        while (r2 % d === 0);
        return pick(rand, [
          [
            `${d} يقسم ${b * q + r} و ${b}، إذن ${d} يقسم باقي قسمة ${b * q + r} على ${b}`,
            true,
            `$${b * q + r} = ${b} \\times ${q} + ${r}$ و $${r} = ${d} \\times ${r / d}$.`,
            K.baqi,
          ],
          [
            `${d} يقسم ${b}، إذن ${d} يقسم باقي قسمة ${b * q + r2} على ${b}`,
            false,
            `$${b * q + r2} = ${b} \\times ${q} + ${r2}$، و ${d} لا يقسم ${r2}: الخاصية تشترط أن يقسم ${d} العددين معًا.`,
            K.baqi,
          ],
        ]);
      },
      proof: () => {
        const n = int(rand, 3, 6);
        let m;
        do m = int(rand, d + 2, 9 * d);
        while (m % d === 0);
        return pick(rand, [
          [
            `التحقّق على ${n} أمثلة لا يكفي لبرهان خاصية «إذا … فإنّ …»`,
            true,
            'كلّ مثال حالة واحدة؛ البرهان يكتب الحالة العامّة بحروف ويجد $k$ حيث $m = d \\times k$.',
            K.burhan,
          ],
          [
            `لإثبات أنّ ${d} يقسم ${m} يكفي أن يكون ${m} أكبر من ${d}`,
            false,
            `المطلوب عدد طبيعي $k$ حيث $${m} = ${d} \\times k$، ولا يوجد: $${m} = ${d} \\times ${Math.floor(m / d)} + ${m % d}$.`,
            K.burhan,
          ],
        ]);
      },
    };
    // `why` opens on a formula or on a noun, never on a verb: the right reason reads « لأنّ » + `why`
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
              { t: 'لأنّ الأعداد كلّها أكبر من القاسم', ok: false },
              { t: 'لأنّه صحيح في مثال واحد', ok: false },
            ])
          : null,
      prompt: statement,
    };
  },

  /** exam — « d يقسم a و b: اكتب a + b و a − b على الشكل d × k ». */
  sumDiff(rand) {
    const d = int(rand, 6, 15);
    const p = int(rand, 8, 25);
    const q = int(rand, 3, p - 2);
    const [a, b] = [d * p, d * q];
    return {
      format: 'exam',
      kind: 'sumDiff',
      key: K.jam,
      a,
      b,
      d,
      p,
      q,
      prompt: `${d} يقسم ${a} و ${b}. دون قسمة، اكتب مجموعهما وفرقهما على الشكل $${d} \\times k$.`,
      form: sumDiffForm(a, b, d),
    };
  },

  /** exam — « d يقسم a: اكتب a × n على الشكل d × k دون حساب الجداء ». */
  multiple(rand) {
    const d = int(rand, 6, 15);
    const p = int(rand, 5, 20);
    const n = int(rand, 11, 40);
    return {
      format: 'exam',
      kind: 'multiple',
      key: K.madaaf,
      a: d * p,
      d,
      p,
      n,
      prompt: `${d} يقسم ${d * p}. دون حساب الجداء، اكتب $${d * p} \\times ${n}$ على الشكل $${d} \\times k$.`,
      form: multipleForm(d * p, n, d),
    };
  },

  /** exam — « d يقسم a و b: أجرِ القسمة الإقليدية لـ a على b، ثمّ اكتب الباقي على الشكل d × k ». */
  rest(rand) {
    const d = int(rand, 4, 12);
    const m = int(rand, 3, 9);
    const quo = int(rand, 2, 6);
    const s = int(rand, 1, m - 1);
    const [a, b] = [d * (m * quo + s), d * m];
    return {
      format: 'exam',
      kind: 'rest',
      key: K.baqi,
      a,
      b,
      d,
      quo,
      r: d * s,
      prompt: `${d} يقسم ${a} و ${b}. أجرِ القسمة الإقليدية للعدد ${a} على ${b}، ثمّ اكتب الباقي على الشكل $${d} \\times k$.`,
      form: restForm(a, b, d),
    };
  },

  /** exam — « برهن أنّ … » with letters: where it starts, the product it writes, why k is a natural number. */
  proof(rand) {
    const target = pick(rand, Object.keys(PROOFS));
    return {
      format: 'exam',
      kind: 'proof',
      key: K.burhan,
      target,
      prompt: proofPrompt(target),
      form: proofForm(rand, PROOFS[target]),
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  jam: [
    ['tap', 'sum', { dMin: 2, dMax: 9, key: K.jam }],
    ['tf', 'sum'],
    ['sumDiff'],
    ['tap', 'diff', { dMin: 3, dMax: 9, key: K.jam }],
    ['tf', 'sum'],
    ['sumDiff'],
  ],
  madaaf: [
    ['tap', 'multiple', { bMin: 11, bMax: 25, kMax: 4, key: K.madaaf }],
    ['tf', 'multiple'],
    ['multiple'],
    ['tap', 'divisible', { key: K.madaaf }],
    ['tf', 'multiple'],
    ['multiple'],
  ],
  baqi: [
    ['tap', 'rest', { key: K.baqi }],
    ['tf', 'rest'],
    ['rest'],
    ['tap', 'remainder', { key: K.baqi }],
    ['tf', 'rest'],
    ['rest'],
  ],
  burhan: [
    ['tap', 'factor', { dMin: 3, dMax: 9, kMin: 6, kMax: 12, key: K.burhan }],
    ['tf', 'proof'],
    ['proof'],
    ['tap', 'factor', { dMin: 11, dMax: 19, kMin: 3, kMax: 5, key: K.burhan }],
    ['tf', 'proof'],
    ['proof'],
  ],
  mix: [
    ['tap', 'sum', { dMin: 3, dMax: 9, key: K.jam }],
    ['tf', 'rest'],
    ['sumDiff'],
    ['tap', 'rest', { key: K.baqi }],
    ['rest'],
    ['proof'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  khawass: 'mix',
  khulasa: 'mix',
  rappel: 'burhan',
  majmu: 'jam',
  'khata-aks': 'jam',
  mudaaf: 'madaaf',
  'mithal-1800': 'madaaf',
  baqi: 'baqi',
  'mithal-735': 'baqi',
  'bila-qisma': 'baqi',
  burhan: 'burhan',
  'khata-mithal': 'burhan',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'sumDiff':
      return { s: q.p + q.q, f: q.p - q.q };
    case 'multiple':
      return { k: q.p * q.n };
    case 'rest':
      return { q: q.quo, r: q.r, k: q.r / q.d };
    case 'proof':
      return { start: 'cond', k: 'right', nat: 'nat' };
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
          ? 'تحقّق: اكتب كلّ عدد على الشكل d × k، أو أجرِ القسمة، قبل أن تحكم.'
          : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن المساواة التي تبرهن.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'sumDiff': {
      const { a, b, d, p } = q;
      const fix = `$${a} + ${b} = ${d} \\times ${p} + ${d} \\times ${q.q} = ${d} \\times ${p + q.q}$ و $${a} - ${b} = ${d} \\times ${p - q.q}$.`;
      if (!whole('s', 'f')) return { ok: false, hint: 'اكتب العدد k في السطرين.', fix };
      if (d * n('s') !== a + b)
        return { ok: false, hint: `تحقّق: $${d} \\times ${n('s')} = ${d * n('s')}$، وليس $${a} + ${b}$.`, fix };
      if (d * n('f') !== a - b)
        return { ok: false, hint: `تحقّق: $${d} \\times ${n('f')} = ${d * n('f')}$، وليس $${a} - ${b}$.`, fix };
      return { ok: true, fix };
    }
    case 'multiple': {
      const { a, d, p, n: m } = q;
      const fix = `$${a} \\times ${m} = ${d} \\times ${p} \\times ${m} = ${d} \\times ${p * m}$.`;
      if (!whole('k')) return { ok: false, hint: 'اكتب العدد k.', fix };
      if (d * n('k') !== a * m)
        return { ok: false, hint: `اكتب أوّلًا ${a} على الشكل ${d} × …، ثمّ اضرب في ${m}.`, fix };
      return { ok: true, fix };
    }
    case 'rest': {
      const { a, b, d } = q;
      const fix = `$${a} = ${b} \\times ${q.quo} + ${q.r}$ و $${q.r} = ${d} \\times ${q.r / d}$.`;
      if (!whole('q', 'r', 'k')) return { ok: false, hint: 'املأ كلّ الخانات: الحاصل، الباقي، ثمّ k.', fix };
      if (b * n('q') + n('r') !== a)
        return {
          ok: false,
          hint: `تحقّق: $${b} \\times ${n('q')} + ${n('r')} = ${b * n('q') + n('r')}$، وليس ${a}.`,
          fix,
        };
      if (n('r') >= b) return { ok: false, hint: `الباقي ${n('r')} ليس أصغر من ${b}: يدخل ${b} مرّة أخرى.`, fix };
      if (d * n('k') !== n('r'))
        return { ok: false, hint: `تحقّق: $${d} \\times ${n('k')} = ${d * n('k')}$، وليس الباقي ${n('r')}.`, fix };
      return { ok: true, fix };
    }
    case 'proof': {
      const P = PROOFS[q.target];
      const fix = `نفرض أنّ ${P.cond}: $${P.givenTex}$. إذن $${P.goalTex} = ${P.rightTex}$، و $${P.factorTex}$ عدد طبيعي: $d$ يقسم $${P.goalTex}$.`;
      if (v?.start !== 'cond')
        return { ok: false, hint: 'في البرهان نبدأ من الشرط (المعطيات)، لا من المطلوب ولا من مثال.', fix };
      if (v?.k !== 'right') return { ok: false, hint: 'عوّض كلّ حرف بكتابته، ثمّ أخرج $d$ عاملًا مشتركًا.', fix };
      if (v?.nat !== 'nat')
        return { ok: false, hint: 'الجداء وحده لا يكفي: ماذا يجب أن يكون العدد المضروب في $d$؟', fix };
      return { ok: true, fix };
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
    case 'sumDiff':
      return `$${q.a} + ${q.b} = ${q.d} \\times ${v?.s ?? '…'}$ ، $${q.a} - ${q.b} = ${q.d} \\times ${v?.f ?? '…'}$`;
    case 'multiple':
      return `$${q.a} \\times ${q.n} = ${q.d} \\times ${v?.k ?? '…'}$`;
    case 'rest':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$ ، $${v?.r ?? '…'} = ${q.d} \\times ${v?.k ?? '…'}$`;
    case 'proof':
      return ['start', 'k', 'nat'].map((s) => optionText(q, s, v?.[s]) ?? '…').join(' — ');
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
