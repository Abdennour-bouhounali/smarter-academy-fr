/**
 * « تدرّب » of lesson `qawaid-qabiliyat-qisma` — the CONTENT of its trainer (PURE). The frame — six questions, two
 * formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats (the shapes of the lesson's bank): « هل يقبل العدد … القسمة على …؟ علّل » (the reading, then the verdict),
 *   « الرقم الناقص » (the box sits where the digit is missing), « احسب الباقي ثمّ استنتج », « اختر الجملة الصحيحة »
 *   (يقبل القسمة · مضاعف · يقسم), « صحيح أم خطأ؟ علّل ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { digitSum, digitsOf, isRight, waveOf } from './practice';

const K = { ahad: 'raqm-alahad', majmu: 'majmu-arqam', akhir: 'raqmayn-akhirayn', baqi: 'baqi-sifr' };
/** The divisors of each reading, and the number of digits of an exam number. */
const LENS = {
  units: { divisors: [2, 5], key: K.ahad },
  sum: { divisors: [3, 9], key: K.majmu },
  last2: { divisors: [4], key: K.akhir },
};
const VERDICT = [
  { value: 'yes', text: 'يقبل' },
  { value: 'no', text: 'لا يقبل' },
];
const division = (a, b) => `$${a} = ${b} \\times ${Math.floor(a / b)} + ${a % b}$`;
const num = (name, label) => ({ num: name, label });
const whole = (v, ...ks) =>
  ks.every((k) => v?.[k] !== '' && v?.[k] != null && Number.isInteger(Number(v[k])) && Number(v[k]) >= 0);

/** A number of `digits` digits that passes `test`. */
function draw(rand, digits, test) {
  const lo = 10 ** (digits - 1);
  for (;;) {
    const n = int(rand, lo, 10 * lo - 1);
    if (test(n)) return n;
  }
}

/**
 * What the key reads in n for divisor b: the units digit, the sum of the digits, the last two digits. `value` is the
 * number (what the student types); `shown` is how it is written in a sentence — « 05 » for the last two digits of 3105.
 */
export function readingOf(n, b) {
  if (b === 2 || b === 5) return { slot: 'u', label: 'رقم الآحاد', value: n % 10, shown: String(n % 10) };
  if (b === 3 || b === 9) return { slot: 's', label: 'مجموع الأرقام', value: digitSum(n), shown: String(digitSum(n)) };
  const t = n % 100;
  return {
    slot: 't',
    label: 'العدد المشكّل من رقمَي الآحاد والعشرات',
    value: t,
    shown: String(t).padStart(n >= 10 ? 2 : 1, '0'),
  };
}
/** The reasoning of a verdict, in one line: the reading, then the division that confirms it. */
function reasonOf(n, b) {
  const { label, value, shown } = readingOf(n, b);
  const yes = n % b === 0;
  return `${label} في ${n} هو ${shown}، و ${division(value, b)}: إذن ${n} ${yes ? 'يقبل' : 'لا يقبل'} القسمة على ${b}.`;
}

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
/** « مجموع أرقام … = [s] » (or the units digit, the last two digits), then « n [يقبل / لا يقبل] القسمة على b ». */
function judgeForm(n, b) {
  const r = readingOf(n, b);
  const first =
    r.slot === 's'
      ? { ltr: true, tokens: [digitsOf(n).join(' + '), '=', num('s', r.label)] }
      : { tokens: [r.label, 'في', { strong: n }, 'هو', num(r.slot, r.label)] };
  return {
    tip: 'tipWrite',
    lines: [first, { tokens: [{ strong: n }, { choice: 'v', options: VERDICT }, `القسمة على ${b}`] }],
  };
}
/** « a = b × [q] + [r] », then « a [يقبل / لا يقبل] القسمة على b ». */
const restForm = (a, b) => ({
  tip: 'tipDivision',
  model: { a, b },
  lines: [
    { ltr: true, tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')] },
    { tokens: [{ strong: a }, { choice: 'v', options: VERDICT }, `القسمة على ${b}`] },
  ],
});
/** The three ways to say it: in each line, the sentence where the numbers stand in the right order. */
const PHRASES = [
  { slot: 'yaqbal', big: (a, b) => `${a} يقبل القسمة على ${b}`, small: (a, b) => `${b} يقبل القسمة على ${a}` },
  { slot: 'mudaaf', big: (a, b) => `${a} مضاعف للعدد ${b}`, small: (a, b) => `${b} مضاعف للعدد ${a}` },
  { slot: 'yaqsim', big: (a, b) => `${a} يقسم ${b}`, small: (a, b) => `${b} يقسم ${a}` },
];
/** Which number is written FIRST in the right sentence of each phrasing: the multiple for two of them, the divisor for « يقسم ». */
const firstOf = { yaqbal: 'big', mudaaf: 'big', yaqsim: 'small' };
const phraseForm = (rand, a, b) => ({
  tip: 'tipWrite',
  lines: PHRASES.map((p) => ({
    tokens: [
      {
        choice: p.slot,
        options: shuffle(rand, [
          { value: String(a), text: p.big(a, b) },
          { value: String(b), text: p.small(a, b) },
        ]),
      },
    ],
  })),
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

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. Every verdict is computed. */
  tf(rand, format, flavour) {
    const make = {
      units: () => {
        const b = pick(rand, [2, 5]);
        const n = draw(rand, 4, () => true);
        // the trap of 5: « it ends with an even digit… » — and of 2: « it ends with 5 »
        const t = b === 5 ? draw(rand, 4, (x) => x % 2 === 0 && x % 10 !== 0) : draw(rand, 4, (x) => x % 10 === 5);
        return pick(rand, [
          [`${n} يقبل القسمة على ${b}`, n % b === 0, reasonOf(n, b), K.ahad],
          [`${t} يقبل القسمة على ${b}`, t % b === 0, reasonOf(t, b), K.ahad],
        ]);
      },
      sum: () => {
        // the trap: a multiple of 3 is not always a multiple of 9
        const t = draw(rand, 4, (x) => x % 3 === 0 && x % 9 !== 0);
        const n = draw(rand, 4, (x) => x % 9 === 0);
        return pick(rand, [
          [`${t} يقبل القسمة على 3، إذن ${t} يقبل القسمة على 9`, false, reasonOf(t, 9), K.majmu],
          [`${n} يقبل القسمة على 9، إذن ${n} يقبل القسمة على 3`, true, reasonOf(n, 3), K.majmu],
        ]);
      },
      last2: () => {
        // the trap: an even number is not always a multiple of 4
        const t = draw(rand, 4, (x) => x % 4 === 2);
        const n = draw(rand, 4, (x) => x % 4 === 0 && x % 10 !== 0);
        return pick(rand, [
          [`${t} عدد زوجي، إذن ${t} يقبل القسمة على 4`, false, reasonOf(t, 4), K.akhir],
          [`${n} يقبل القسمة على 4`, true, reasonOf(n, 4), K.akhir],
        ]);
      },
      rest: () => {
        const b = int(rand, 6, 8);
        const q = int(rand, 11, 40);
        const r = int(rand, 1, b - 1);
        return pick(rand, [
          [
            `باقي قسمة ${b * q} على ${b} معدوم، إذن ${b * q} يقبل القسمة على ${b}`,
            true,
            `$${b * q} = ${b} \\times ${q} + 0$: الباقي 0.`,
            K.baqi,
          ],
          [
            `${b * q + r} يقبل القسمة على ${b}`,
            false,
            `$${b * q + r} = ${b} \\times ${q} + ${r}$: الباقي ${r}، وليس 0.`,
            K.baqi,
          ],
          [`${b} يقسم ${b * q} يعني أنّ ${b * q} مضاعف للعدد ${b}`, true, `$${b * q} = ${b} \\times ${q}$.`, K.baqi],
        ]);
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
              { t: 'لأنّ العدد كبير', ok: false },
              { t: 'لأنّه صحيح في مثال واحد', ok: false },
            ])
          : null,
      prompt: statement,
    };
  },

  /** exam — « هل يقبل العدد n القسمة على b؟ علّل »: the reading of its key, then the verdict. */
  judge(rand, format, lens) {
    const { divisors, key } = LENS[lens];
    const b = pick(rand, divisors);
    // half of them divisible, the other half the trap of its reading
    const yes = int(rand, 0, 1) === 0;
    const n = draw(rand, 4, (x) => (x % b === 0) === yes);
    return {
      format: 'exam',
      kind: 'judge',
      key,
      n,
      b,
      prompt: `دون إجراء القسمة: هل يقبل العدد ${n} القسمة على ${b}؟ علّل.`,
      form: judgeForm(n, b),
    };
  },

  /** exam — « اكتب رقمًا نضعه مكان □ ليقبل العدد القسمة على b »: the box sits where the digit is missing. */
  digit(rand, format, lens) {
    const b = lens === 'last2' ? 4 : pick(rand, [3, 9]);
    const units = b !== 4;
    const pre = units ? int(rand, 100, 999) : int(rand, 10, 99);
    const post = units ? null : pick(rand, [2, 6, 0, 4, 8]);
    const valueOf = (d) => (units ? pre * 10 + d : pre * 100 + d * 10 + post);
    const fits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => valueOf(d) % b === 0);
    const shape = units ? `${pre}\\square` : `${pre}\\square ${post}`;
    return {
      format: 'exam',
      kind: 'digit',
      key: LENS[lens].key,
      b,
      pre,
      post,
      fits,
      value: units ? pre * 10 : pre * 100 + post,
      place: units ? 10 : 100,
      prompt: `اكتب رقمًا نضعه مكان □ ليقبل العدد $${shape}$ القسمة على ${b}.`,
      form: {
        tip: 'tipWrite',
        single: 'd',
        lines: [
          {
            ltr: true,
            tokens: [String(pre), num('d', units ? 'رقم الآحاد' : 'رقم العشرات'), ...(units ? [] : [String(post)])],
          },
        ],
      },
    };
  },

  /** exam — « احسب باقي القسمة الإقليدية للعدد a على b، ثمّ استنتج » (b has no reading rule). */
  rest(rand) {
    const b = pick(rand, [6, 7, 8, 11, 12]);
    const q = int(rand, 12, 90);
    const r = int(rand, 0, 1) === 0 ? 0 : int(rand, 1, b - 1);
    const a = b * q + r;
    return {
      format: 'exam',
      kind: 'rest',
      key: K.baqi,
      a,
      b,
      quo: q,
      r,
      prompt: `لا قاعدة عندنا للقسمة على ${b}. احسب باقي القسمة الإقليدية للعدد ${a} على ${b}، ثمّ استنتج.`,
      form: restForm(a, b),
    };
  },

  /** exam — « a = b × q »: in each line, the sentence that says it (يقبل القسمة · مضاعف · يقسم). */
  phrase(rand) {
    const b = int(rand, 6, 15);
    const q = int(rand, 7, 40);
    const a = b * q;
    return {
      format: 'exam',
      kind: 'phrase',
      key: K.baqi,
      a,
      b,
      q,
      prompt: `$${a} = ${b} \\times ${q} + 0$. اختر في كلّ سطر الجملة الصحيحة.`,
      form: phraseForm(rand, a, b),
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  ahad: [
    ['tap', 'unitsBy', { b: 5, digits: 3, key: K.ahad }],
    ['tf', 'units'],
    ['judge', 'units'],
    ['tap', 'unitsBy', { b: 2, digits: 3, key: K.ahad }],
    ['tf', 'units'],
    ['judge', 'units'],
  ],
  majmu: [
    ['tap', 'sumBy', { b: 9, digits: 3, key: K.majmu }],
    ['tf', 'sum'],
    ['judge', 'sum'],
    ['tap', 'sumBy', { b: 3, digits: 3, key: K.majmu }],
    ['tf', 'sum'],
    ['digit', 'sum'],
  ],
  akhir: [
    ['tap', 'last2By', { digits: 3, key: K.akhir }],
    ['tf', 'last2'],
    ['judge', 'last2'],
    ['tap', 'digitFor', { b: 4, key: K.akhir }],
    ['tf', 'last2'],
    ['digit', 'last2'],
  ],
  baqi: [
    ['tap', 'remainder', { bMin: 6, bMax: 8, key: K.baqi }],
    ['tf', 'rest'],
    ['rest'],
    ['tap', 'divides', { key: K.baqi }],
    ['tf', 'rest'],
    ['phrase'],
  ],
  mix: [
    ['tap', 'unitsBy', { b: 10, digits: 4, key: K.ahad }],
    ['tf', 'sum'],
    ['judge', 'last2'],
    ['tap', 'remainder', { bMin: 6, bMax: 8, key: K.baqi }],
    ['rest'],
    ['digit', 'sum'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  qabiliya: 'mix',
  ahad: 'ahad',
  'khata-sifr': 'ahad',
  majmu: 'majmu',
  'mithal-majmu': 'majmu',
  'khata-3-9': 'majmu',
  akhirayn: 'akhir',
  'limatha-100': 'akhir',
  'khata-zawji': 'akhir',
  baqi: 'baqi',
  siyagh: 'baqi',
  khulasa: 'mix',
};

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'judge': {
      const r = readingOf(q.n, q.b);
      return { [r.slot]: r.value, v: q.n % q.b === 0 ? 'yes' : 'no' };
    }
    case 'digit':
      return q.fits[0];
    case 'rest':
      return { q: q.quo, r: q.r, v: q.r === 0 ? 'yes' : 'no' };
    case 'phrase':
      return Object.fromEntries(PHRASES.map((p) => [p.slot, String(firstOf[p.slot] === 'big' ? q.a : q.b)]));
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
          ? 'تحقّق: اقرأ العدد بمفتاحه، أو أجرِ القسمة، قبل أن تحكم.'
          : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن القراءة أو القسمة التي تبرهن.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'judge': {
      const r = readingOf(q.n, q.b);
      const fix = reasonOf(q.n, q.b);
      if (!whole(v, r.slot) || !v?.v) return { ok: false, hint: `اكتب ${r.label}، ثمّ اختر الحكم.`, fix };
      if (n(r.slot) !== r.value)
        return { ok: false, hint: `أعد قراءة ${r.label} في ${q.n}: ${n(r.slot)} ليس ما يظهر فيه.`, fix };
      if ((v.v === 'yes') !== (q.n % q.b === 0))
        return { ok: false, hint: `${r.label} هو ${r.value}: هل يقبل ${r.value} القسمة على ${q.b}؟`, fix };
      return { ok: true, fix };
    }
    case 'digit': {
      const d = Number(v);
      const all = q.fits.join(' أو ');
      const fix = `الأرقام التي تصلح: ${all}. مثلًا: $${q.value + q.fits[0] * (q.place / 10)} = ${q.b} \\times ${(q.value + q.fits[0] * (q.place / 10)) / q.b}$.`;
      if (v === '' || v == null || !Number.isInteger(d) || d < 0 || d > 9)
        return { ok: false, hint: 'اكتب رقمًا واحدًا، من 0 إلى 9.', fix };
      const m = q.value + d * (q.place / 10);
      if (m % q.b !== 0) {
        const r = readingOf(m, q.b);
        return {
          ok: false,
          hint: `بالرقم ${d} يصير العدد ${m}، و${r.label} فيه ${r.value}: ${division(r.value, q.b)}.`,
          fix,
        };
      }
      return { ok: true, fix };
    }
    case 'rest': {
      const { a, b } = q;
      const fix = `$${a} = ${b} \\times ${q.quo} + ${q.r}$: الباقي ${q.r}، إذن ${a} ${q.r === 0 ? 'يقبل' : 'لا يقبل'} القسمة على ${b}.`;
      if (!whole(v, 'q', 'r') || !v?.v) return { ok: false, hint: 'املأ الحاصل والباقي، ثمّ اختر الحكم.', fix };
      if (b * n('q') + n('r') !== a)
        return {
          ok: false,
          hint: `تحقّق: $${b} \\times ${n('q')} + ${n('r')} = ${b * n('q') + n('r')}$، وليس ${a}.`,
          fix,
        };
      if (n('r') >= b) return { ok: false, hint: `الباقي ${n('r')} ليس أصغر من ${b}: يدخل ${b} مرّة أخرى.`, fix };
      if ((v.v === 'yes') !== (n('r') === 0))
        return { ok: false, hint: `الباقي ${n('r')}: متى يقبل العدد القسمة؟`, fix };
      return { ok: true, fix };
    }
    case 'phrase': {
      const right = solution(q);
      const fix = `$${q.a} = ${q.b} \\times ${q.q} + 0$: ${q.a} يقبل القسمة على ${q.b}، و ${q.a} مضاعف للعدد ${q.b}، و ${q.b} يقسم ${q.a}.`;
      const wrong = PHRASES.find((p) => v?.[p.slot] !== right[p.slot]);
      if (!wrong) return { ok: true, fix };
      if (v?.[wrong.slot] == null) return { ok: false, hint: 'اختر جملة في كلّ سطر.', fix };
      return {
        ok: false,
        hint: `في سطر من الأسطر الثلاثة انقلب العددان: العدد الكبير هو الذي يقبل القسمة، والصغير هو الذي يقسم.`,
        fix,
      };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const said = (x) => (x === 'yes' ? 'يقبل' : x === 'no' ? 'لا يقبل' : '…');
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'judge': {
      const r = readingOf(q.n, q.b);
      return `${r.label}: ${v?.[r.slot] ?? '…'} — ${q.n} ${said(v?.v)} القسمة على ${q.b}`;
    }
    case 'digit':
      return `□ = ${v ?? '…'}`;
    case 'rest':
      return `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$ — ${said(v?.v)}`;
    case 'phrase':
      return PHRASES.map((p) => optionText(q, p.slot, v?.[p.slot]) ?? '…').join(' — ');
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
