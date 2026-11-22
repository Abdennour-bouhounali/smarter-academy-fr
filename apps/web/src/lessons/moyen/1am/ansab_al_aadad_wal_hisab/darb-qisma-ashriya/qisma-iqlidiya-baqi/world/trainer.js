/**
 * « تدرّب » of lesson `qisma-iqlidiya-baqi` — the CONTENT of its trainer (PURE). The frame — six questions, two formats
 * that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « أجرِ القسمة الإقليدية » (a = b × q + r; a divisor of one digit, or of two for the estimate),
 *   « هل تعبّر هذه المساواة عن القسمة الإقليدية؟ صحّح », « احسب المقسوم » (and the biggest remainder), a distribution
 *   problem (the division, then ONE of three questions: how many are full, how many are needed, how many are left
 *   out — with and without a leftover), « صحيح أم خطأ؟ علّل ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { cabinsOf, travellersOf } from './counted';
import { isRight, waveOf } from './practice';

const K = {
  kamila: 'majmuaat-kamila',
  asghar: 'baqi-asghar',
  musawat: 'musawat-qisma',
  taqdir: 'taqdir-hasil',
  masala: 'baqi-fi-masala',
};

/** A division a = b × q + r with r drawn in [rMin, b − 1]. */
function draw(rand, bMin, bMax, qMin, qMax, rMin = 0) {
  const b = int(rand, bMin, bMax);
  const q = int(rand, qMin, qMax);
  const r = int(rand, rMin, b - 1);
  return { a: b * q + r, b, q, r };
}
/** The same, until the dividend has three digits (the lesson stops at three). */
function draw3(rand, ...args) {
  for (;;) {
    const d = draw(rand, ...args);
    if (d.a >= 100 && d.a <= 999) return d;
  }
}

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** « a = b × [q] + [r] ». */
const divisionLine = (a, b) => ({
  ltr: true,
  tokens: [String(a), '=', String(b), '×', num('q', 'الحاصل'), '+', num('r', 'الباقي')],
});

/**
 * Distribution problems: what is shared, what holds it, and the THREE questions one division answers. Every number is
 * drawn inside what the situation can believe (`size`: how many a container holds, `count`: how many containers — a bus
 * of 28 to 52 seats and 3 to 9 buses, never 987 pupils in buses of 12); the statement names the numbers by « عدد … » so
 * no Arabic agreement depends on them.
 *   full   how many containers are FULL                        → the quotient
 *   need   how many are NEEDED so that nothing stays behind    → the quotient, and one more when something is left
 *   left   how many things the full containers do not take     → the remainder
 *   another  « one more container », for the hints
 */
const PROBLEMS = [
  {
    size: [28, 52],
    count: [3, 9],
    text: (a, b) => `عدد التلاميذ المشاركين في رحلة مدرسية ${a}، وعدد المقاعد في كلّ حافلة ${b}.`,
    full: 'عدد الحافلات الممتلئة',
    need: 'عدد الحافلات اللازمة لنقل كلّ التلاميذ',
    left: 'عدد التلاميذ الذين لا تسعهم الحافلات الممتلئة',
    another: 'حافلة أخرى',
  },
  {
    size: [12, 24],
    count: [8, 38],
    text: (a, b) => `عبّأت تعاونيّة فلاحية قارورات زيت زيتون عددها ${a} في صناديق، يتّسع كلّ صندوق لعدد ${b} منها.`,
    full: 'عدد الصناديق الممتلئة',
    need: 'عدد الصناديق اللازمة لكلّ القارورات',
    left: 'عدد القارورات التي لا تسعها الصناديق الممتلئة',
    another: 'صندوقًا آخر',
  },
  {
    size: [15, 40],
    count: [5, 25],
    text: (a, b) => `توزّع جمعية الحيّ أكياس دقيق عددها ${a} بشاحنات صغيرة، وعدد ما تحمله كلّ شاحنة ${b}.`,
    full: 'عدد الشاحنات الممتلئة',
    need: 'عدد الشاحنات اللازمة لنقل كلّ الأكياس',
    left: 'عدد الأكياس التي لا تحملها الشاحنات الممتلئة',
    another: 'شاحنة أخرى',
  },
  {
    size: [12, 30],
    count: [6, 30],
    text: (a, b) => `يغرس فلّاح شتلات زيتون عددها ${a} في صفوف، وعدد الشتلات في كلّ صفّ ${b}.`,
    full: 'عدد الصفوف الكاملة',
    need: 'عدد الصفوف اللازمة لغرس كلّ الشتلات',
    left: 'عدد الشتلات التي لا تدخل في الصفوف الكاملة',
    another: 'صفًّا آخر',
  },
  {
    size: [12, 25],
    count: [5, 20],
    text: (a, b) => `عدد المسافرين في محطّة التليفريك ${a}، وعدد من تحمله كلّ عربة ${b}.`,
    full: 'عدد العربات الممتلئة',
    need: 'عدد العربات اللازمة ليعبر كلّ المسافرين',
    left: 'عدد المسافرين الذين لا تسعهم العربات الممتلئة',
    another: 'عربة أخرى',
  },
];
/** What a problem asks, in the proportion of the lesson's exam sheets: « needed » most often. */
const ASKS = ['need', 'need', 'full', 'left'];
/** The answer of a problem: the number of the division its question reads. */
const answerOf = (q) => (q.ask === 'full' ? q.quo : q.ask === 'left' ? q.r : q.quo + (q.r > 0 ? 1 : 0));

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour) {
    // [statement, truth, why, key, the hint of a wrong verdict, two reasons that do not prove it]
    const REST = ['لأنّ الباقي يمكن أن يكون أيّ عدد', 'لأنّ المقسوم أكبر من المقسوم عليه'];
    const make = {
      kamila: () => {
        const { a, b, q, r } = draw(rand, 3, 9, 4, 12, 1);
        const right = `$${a} = ${b} \\times ${q} + ${r}$ و ${r} أصغر من ${b}.`;
        const hint = 'تحقّق بالضرب: هل تدخل هذه المجموعات كلّها في المقسوم؟ وهل تدخل مجموعة أخرى بعدها؟';
        return pick(rand, [
          [`حاصل القسمة الإقليدية للعدد ${a} على ${b} هو ${q}`, true, right, K.kamila, hint, REST],
          [
            `حاصل القسمة الإقليدية للعدد ${a} على ${b} هو ${q + 1}`,
            false,
            `$${b} \\times ${q + 1} = ${b * (q + 1)}$ أكبر من ${a}؛ ${right}`,
            K.kamila,
            hint,
            REST,
          ],
        ]);
      },
      asghar: () => {
        const { a, b, q, r } = draw(rand, 4, 9, 5, 14);
        const hint = 'تحقّق: أعد حساب المساواة، ثمّ قارن الباقي بالمقسوم عليه.';
        return pick(rand, [
          [
            `المساواة $${a} = ${b} \\times ${q} + ${r}$ تعبّر عن القسمة الإقليدية للعدد ${a} على ${b}`,
            true,
            `$${b} \\times ${q} + ${r} = ${a}$ و ${r} أصغر من ${b}.`,
            K.asghar,
            hint,
            REST,
          ],
          [
            `المساواة $${a} = ${b} \\times ${q - 1} + ${r + b}$ تعبّر عن القسمة الإقليدية للعدد ${a} على ${b}`,
            false,
            `${r + b} ليس أصغر من ${b}: القسمة الإقليدية هي $${a} = ${b} \\times ${q} + ${r}$.`,
            K.asghar,
            hint,
            REST,
          ],
        ]);
      },
      musawat: () => {
        const { a, b, q, r } = draw(rand, 4, 12, 6, 30, 1);
        const said = `في قسمة إقليدية، المقسوم عليه ${b} والحاصل ${q} والباقي ${r}، إذن المقسوم`;
        const hint = 'تحقّق: أعد بناء المقسوم من المقسوم عليه والحاصل والباقي.';
        return pick(rand, [
          [`${said} ${a}`, true, `$${a} = ${b} \\times ${q} + ${r}$.`, K.musawat, hint, REST],
          [
            `${said} ${b * q}`,
            false,
            `المقسوم هو $${b} \\times ${q} + ${r} = ${a}$: لا ننسى الباقي.`,
            K.musawat,
            hint,
            REST,
          ],
        ]);
      },
      taqdir: () => {
        const { a, b, q } = draw3(rand, 12, 29, 12, 33);
        const t = Math.floor(q / 10) * 10;
        const bound = (x) => `$${b} \\times ${x} = ${b * x}$`;
        const hint = 'تحقّق: اضرب المقسوم عليه في كلّ واحد من العددين، وقارن الجداءين بالمقسوم.';
        const others = ['لأنّ المقسوم من ثلاثة أرقام', 'لأنّ المقسوم عليه من رقمين'];
        return pick(rand, [
          [
            `حاصل القسمة الإقليدية للعدد ${a} على ${b} محصور بين ${t} و ${t + 10}`,
            true,
            `${bound(t)} لا يتجاوز ${a}، و ${bound(t + 10)} يتجاوزه.`,
            K.taqdir,
            hint,
            others,
          ],
          [
            `حاصل القسمة الإقليدية للعدد ${a} على ${b} محصور بين ${t + 10} و ${t + 20}`,
            false,
            `${bound(t + 10)} يتجاوز ${a}: الحاصل أصغر من ${t + 10}.`,
            K.taqdir,
            hint,
            others,
          ],
        ]);
      },
      // the station: as many cabins as the quotient — or one more? (r = 0 one time in three: the quotient is enough)
      masala: () => {
        const exact = int(rand, 0, 2) === 0;
        const { a, b, q, r } = exact ? { ...draw(rand, 4, 9, 3, 9), r: 0 } : draw(rand, 4, 9, 3, 9, 1);
        const A = exact ? b * q : a;
        const need = q + (r > 0 ? 1 : 0);
        const wrong = r > 0 ? q : q + 1;
        const eq = `$${A} = ${b} \\times ${q} + ${r}$`;
        const station = `${travellersOf(A)} في المحطّة، وكلّ عربة تحمل ${b}`;
        const hint = 'تحقّق: أجرِ القسمة، ثمّ انظر هل بقي أحد في المحطّة.';
        const others = [
          'لأنّ عدد العربات اللازمة هو الحاصل دائمًا',
          'لأنّ عدد العربات اللازمة هو الحاصل زائد 1 دائمًا',
        ];
        return pick(rand, [
          [
            `${station}: تلزم ${cabinsOf(need)} ليعبر الجميع`,
            true,
            r > 0
              ? `${eq}: امتلأت ${cabinsOf(q)} وبقي ${travellersOf(r)}، فتلزم عربة أخرى.`
              : `${eq}: امتلأت ${cabinsOf(q)} ولم يبقَ أحد.`,
            K.masala,
            hint,
            others,
          ],
          [
            `${station}: تلزم ${cabinsOf(wrong)} ليعبر الجميع`,
            false,
            r > 0 ? `${eq}: بقي ${travellersOf(r)} دون عربة، فتلزم ${need}.` : `${eq}: لم يبقَ أحد، فتكفي ${need}.`,
            K.masala,
            hint,
            others,
          ],
        ]);
      },
    };
    const [statement, truth, why, key, hint, others] = make[flavour]();
    return {
      format,
      kind: 'tf',
      key,
      statement,
      truth,
      why,
      hint,
      reasons:
        format === 'exam'
          ? shuffle(rand, [{ t: `لأنّ ${why}`, ok: true }, ...others.map((t) => ({ t, ok: false }))])
          : null,
      prompt: statement,
    };
  },

  /**
   * exam — « أجرِ القسمة الإقليدية للعدد a على b »: a of three digits; b of one digit (the full groups), or of two
   * (`big`: the quotient is ESTIMATED first — the fourth key).
   */
  division(rand, format, big = false) {
    const { a, b, q, r } = big ? draw3(rand, 12, 45, 6, 40) : draw3(rand, 3, 9, 12, 110);
    return {
      format: 'exam',
      kind: 'division',
      key: big ? K.taqdir : K.kamila,
      a,
      b,
      quo: q,
      r,
      prompt: `أجرِ القسمة الإقليدية للعدد ${a} على ${b}، ثمّ اكتبها على الشكل $a = b \\times q + r$.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b)] },
    };
  },

  /** exam — a division written with a remainder that is not smaller than b: is it the Euclidean division? correct it. */
  fix(rand) {
    const { a, b, q, r } = draw(rand, 5, 9, 9, 40);
    const wrongR = r + b;
    return {
      format: 'exam',
      kind: 'fix',
      key: K.asghar,
      a,
      b,
      quo: q,
      r,
      shown: { q: q - 1, r: wrongR },
      prompt: `كتب إلياس: $${a} = ${b} \\times ${q - 1} + ${wrongR}$. هل تعبّر هذه المساواة عن القسمة الإقليدية للعدد ${a} على ${b}؟ صحّح إن لزم.`,
      form: {
        tip: 'tipDivision',
        model: { a, b },
        lines: [
          {
            tokens: [
              'المساواة',
              {
                choice: 'verdict',
                options: shuffle(rand, [
                  { value: 'no', text: `لا تعبّر عنها: ${wrongR} ليس أصغر من ${b}` },
                  { value: 'yes', text: 'تعبّر عنها' },
                  { value: 'calc', text: 'لا تعبّر عنها: الحساب خاطئ' },
                ]),
              },
            ],
          },
          divisionLine(a, b),
        ],
      },
    };
  },

  /** exam — « المقسوم عليه b، الحاصل q، الباقي r: احسب المقسوم »; then the biggest remainder a division by b can leave. */
  dividend(rand) {
    const { a, b, q, r } = draw3(rand, 6, 25, 8, 38, 1);
    return {
      format: 'exam',
      kind: 'dividend',
      key: K.musawat,
      a,
      b,
      quo: q,
      r,
      prompt: `في قسمة إقليدية: المقسوم عليه ${b}، والحاصل ${q}، والباقي ${r}. احسب المقسوم، ثمّ أكبر باقٍ ممكن في قسمة على ${b}.`,
      form: {
        tip: 'tipWrite',
        lines: [
          { ltr: true, tokens: [num('a', 'المقسوم'), '=', String(b), '×', String(q), '+', String(r)] },
          { ltr: true, tokens: [{ text: 'أكبر باقٍ ممكن', rtl: true }, '=', num('m', 'أكبر باقٍ ممكن')] },
        ],
      },
    };
  },

  /**
   * exam — a distribution problem: ONE division, then one of its three questions (`ask`). The leftover is 0 one time
   * in four (then « needed » is the quotient itself); « left out » always has somebody to count.
   */
  problem(rand) {
    const P = pick(rand, PROBLEMS);
    const ask = pick(rand, ASKS);
    const exact = ask !== 'left' && int(rand, 0, 3) === 0;
    let d;
    do {
      const b = int(rand, P.size[0], P.size[1]);
      const q = int(rand, P.count[0], P.count[1]);
      const r = exact ? 0 : int(rand, 1, b - 1);
      d = { a: b * q + r, b, q, r };
    } while (d.a < 100 || d.a > 999);
    const { a, b, q, r } = d;
    return {
      format: 'exam',
      kind: 'problem',
      key: K.masala,
      a,
      b,
      quo: q,
      r,
      ask,
      /** the three questions of this situation, in its own words (the correction names the two that were not asked) */
      words: { full: P.full, need: P.need, left: P.left, another: P.another },
      prompt: `${P.text(a, b)} أجرِ القسمة الإقليدية للعدد ${a} على ${b}، ثمّ احسب ${P[ask]}.`,
      form: {
        tip: 'tipDivision',
        model: { a, b },
        lines: [divisionLine(a, b), { tokens: [{ text: P[ask], rtl: true }, '=', num('n', P[ask])] }],
      },
    };
  },
};

const SMALL = { bMin: 3, bMax: 9, qMax: 9 };
/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  kamila: [
    ['tap', 'quotient', { ...SMALL, key: K.kamila }],
    ['tf', 'kamila'],
    ['division'],
    ['tap', 'remainder', { bMin: 6, bMax: 12, qMax: 8, key: K.kamila }],
    ['tf', 'kamila'],
    ['division'],
  ],
  asghar: [
    ['tap', 'possibleRest', { key: K.asghar }],
    ['tf', 'asghar'],
    ['fix'],
    ['tap', 'maxRest', { key: K.asghar }],
    ['tf', 'asghar'],
    ['fix'],
  ],
  musawat: [
    ['tap', 'dividend', { ...SMALL, key: K.musawat }],
    ['tf', 'musawat'],
    ['dividend'],
    ['tap', 'missingRest', { ...SMALL, key: K.musawat }],
    ['tf', 'musawat'],
    ['dividend'],
  ],
  taqdir: [
    ['tap', 'tensOf', { key: K.taqdir }],
    ['tf', 'taqdir'],
    ['division', true],
    ['tap', 'quotientBig', { key: K.taqdir }],
    ['tf', 'taqdir'],
    ['division', true],
  ],
  masala: [
    ['tap', 'cabinsNeeded', { ...SMALL, key: K.masala }],
    ['tf', 'masala'],
    ['problem'],
    ['tap', 'cabinsFull', { ...SMALL, key: K.masala }],
    ['tf', 'masala'],
    ['problem'],
  ],
  mix: [
    ['tap', 'quotient', { ...SMALL, key: K.kamila }],
    ['tf', 'asghar'],
    ['division'],
    ['tap', 'dividend', { ...SMALL, key: K.musawat }],
    ['division', true],
    ['problem'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  qisma: 'mix',
  kamila: 'kamila',
  rappel: 'kamila',
  'mithal-kamila': 'kamila',
  asghar: 'asghar',
  'khata-baqi': 'asghar',
  musawat: 'musawat',
  asmaa: 'musawat',
  'mithal-musawat': 'musawat',
  taqdir: 'taqdir',
  'mithal-taqdir': 'taqdir',
  masala: 'masala',
  'khata-masala': 'masala',
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
      return { q: q.quo, r: q.r };
    case 'fix':
      return { verdict: 'no', q: q.quo, r: q.r };
    case 'dividend':
      return { a: q.a, m: q.b - 1 };
    case 'problem':
      return { q: q.quo, r: q.r, n: answerOf(q) };
    default:
      return null;
  }
}

/** The hint of a written division: what the numbers written give, never the answer. */
function divisionHint(q, Q2, R2) {
  const { a, b } = q;
  if (b * Q2 + R2 !== a) return `تحقّق: $${b} \\times ${Q2} + ${R2} = ${b * Q2 + R2}$، وليس ${a}.`;
  if (R2 >= b) return `الباقي ${R2} ليس أصغر من ${b}: يدخل ${b} مرّة أخرى.`;
  return null;
}

/** The correction of a problem: the division, what its two numbers are in the situation, then the question asked. */
function problemFix(q, eq) {
  const W = q.words;
  const need = q.quo + (q.r > 0 ? 1 : 0);
  if (q.ask === 'full')
    return `${eq}: ${W.full} هو الحاصل ${q.quo}${q.r > 0 ? `؛ الباقي ${q.r} لا يملأ ${W.another}` : ''}.`;
  if (q.ask === 'left') return `${eq}: ${W.left} هو الباقي ${q.r}.`;
  return q.r > 0
    ? `${eq}: ${W.full} ${q.quo}، و${W.left} ${q.r}، فيلزم أكثر من ${q.quo}. ${W.need}: $${q.quo} + 1 = ${need}$.`
    : `${eq}: الباقي 0، فلا يبقى شيء خارج المجموعات الكاملة. ${W.need}: ${need}.`;
}
/** The hint of a problem whose division is right and whose answer is not: what that answer does in the situation. */
function problemHint(q, n) {
  const W = q.words;
  if (q.ask === 'need') {
    if (q.r > 0 && n === q.quo) return `${W.left} ${q.r}: هل يكفي العدد ${q.quo}؟`;
    if (q.r === 0 && n === q.quo + 1) return `الباقي 0: هل بقي شيء يحتاج ${W.another}؟`;
    return `الحاصل ${q.quo} والباقي ${q.r}: ماذا يعدّ كلّ واحد منهما في هذه المسألة؟`;
  }
  if (q.ask === 'full')
    return n === q.quo + 1
      ? `الباقي ${q.r}: هل يملأ ${W.another}؟`
      : 'أيّ عددَي القسمة يعدّ المجموعات الكاملة: الحاصل أم الباقي؟';
  return n === q.quo
    ? `${q.quo} هو الحاصل: ماذا يعدّ في هذه المسألة؟ وما الذي يبقى خارج المجموعات الكاملة؟`
    : 'ابحث في المساواة عن العدد الذي لم يدخل في أيّ مجموعة كاملة.';
}

/**
 * Judges an answer. Returns { ok, hint, fix }:
 *   hint — after a first wrong answer: what the answer gives, or what is still missing (never the answer);
 *   fix  — the written correction, shown after a right answer or a second wrong one.
 */
export function check(q, v) {
  const n = (k) => Number(v?.[k]);
  const whole = (...ks) => ks.every((k) => v?.[k] !== '' && v?.[k] != null && Number.isInteger(n(k)) && n(k) >= 0);
  const eq = `$${q.a} = ${q.b} \\times ${q.quo} + ${q.r}$`;
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
        // a wrong verdict: what to compute for THIS statement; a right one with a reason that proves nothing
        hint: !truthOk ? q.hint : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن التعليل الذي يبرهن بالحساب.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'division': {
      const fix = `${eq}، و ${q.r} أصغر من ${q.b}.`;
      if (!whole('q', 'r')) return { ok: false, hint: 'اكتب الحاصل والباقي معًا.', fix };
      const hint = divisionHint(q, n('q'), n('r'));
      return hint ? { ok: false, hint, fix } : { ok: true, fix };
    }
    case 'fix': {
      const fix = `لا تعبّر عنها: الباقي ${q.shown.r} ليس أصغر من ${q.b}. القسمة الإقليدية: ${eq}.`;
      if (v?.verdict !== 'no')
        return {
          ok: false,
          hint:
            v?.verdict === 'calc'
              ? `الحساب صحيح: $${q.b} \\times ${q.shown.q} + ${q.shown.r} = ${q.a}$. قارن الباقي بالمقسوم عليه.`
              : `قارن الباقي ${q.shown.r} بالمقسوم عليه ${q.b}.`,
          fix,
        };
      if (!whole('q', 'r')) return { ok: false, hint: 'صحّح: اكتب الحاصل والباقي.', fix };
      const hint = divisionHint(q, n('q'), n('r'));
      return hint ? { ok: false, hint, fix } : { ok: true, fix };
    }
    case 'dividend': {
      const fix = `${eq}، وأكبر باقٍ في القسمة على ${q.b} هو ${q.b - 1}.`;
      if (!whole('a', 'm')) return { ok: false, hint: 'املأ الخانتين: المقسوم، ثمّ أكبر باقٍ ممكن.', fix };
      if (n('a') !== q.a)
        return {
          ok: false,
          hint:
            n('a') === q.b * q.quo
              ? `$${q.b} \\times ${q.quo} = ${n('a')}$: أضف الباقي.`
              : `احسب أوّلًا $${q.b} \\times ${q.quo}$، ثمّ أضف الباقي ${q.r}.`,
          fix,
        };
      if (n('m') !== q.b - 1)
        return {
          ok: false,
          hint:
            n('m') >= q.b
              ? `باقٍ يساوي ${n('m')} يتّسع لمجموعة أخرى من ${q.b}.`
              : `ما زال بعد ${n('m')} باقٍ أصغر من ${q.b}.`,
          fix,
        };
      return { ok: true, fix };
    }
    case 'problem': {
      const fix = problemFix(q, eq);
      if (!whole('q', 'r', 'n')) return { ok: false, hint: 'املأ كلّ الخانات: الحاصل، الباقي، ثمّ الجواب.', fix };
      const hint = divisionHint(q, n('q'), n('r'));
      if (hint) return { ok: false, hint, fix };
      if (n('n') !== answerOf(q)) return { ok: false, hint: problemHint(q, n('n')), fix };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const line = () => `$${q.a} = ${q.b} \\times ${v?.q ?? '…'} + ${v?.r ?? '…'}$`;
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'division':
      return line();
    case 'fix': {
      const said = q.form.lines[0].tokens[1].options.find((o) => o.value === v?.verdict)?.text ?? '…';
      return `${said} — ${line()}`;
    }
    case 'dividend':
      return `$${v?.a ?? '…'} = ${q.b} \\times ${q.quo} + ${q.r}$ ، أكبر باقٍ: ${v?.m ?? '…'}`;
    case 'problem':
      return `${line()} — ${q.words[q.ask]}: ${v?.n ?? '…'}`;
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
