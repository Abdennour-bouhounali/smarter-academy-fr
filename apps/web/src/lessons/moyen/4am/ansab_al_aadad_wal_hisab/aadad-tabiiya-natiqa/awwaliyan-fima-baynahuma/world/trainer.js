/**
 * « تدرّب » of lesson `awwaliyan-fima-baynahuma` — the CONTENT of its trainer (PURE). The frame — six questions, two
 * formats that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's
 * TRAINER questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « احسب PGCD ثمّ احكم » (🤝), « بيّن أنّهما أوّليّان فيما بينهما » (✅), « بيّن دون حساب أنّهما ليسا
 *   أوّليّين: قاسم مشترك غير 1 » and « احسب PGCD ثمّ استنتج أنّهما ليسا أوّليّين » (❌), « صحيح أم خطأ؟ علّل ».
 * Every reason offered to « علّل » that is not the right one is a FALSE statement (an equality or a « يقسم » that does
 * not hold): `trainer.test.js` computes each one, and bounds every generated reason (at most three divisions,
 * defects.md B26). A form line holds at most three boxes (defects.md B17).
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { RULES, andAr, divTex, euclid, gcd, listAr, pgcdTex as P } from './math';
import { isRight, waveOf } from './practice';

const K = { only: 'awwaliyan', proof: 'ithbat-awwaliyan', witness: 'shahid-wahid' };
/** The common divisors the trainer hides from the rules' planks. */
const HIDDEN = [7, 11, 13, 17, 19, 23];

// ───────────────────────────── the numbers of an exam question ─────────────────────────────
/** Two coprime numbers b < a, min ≤ a ≤ max, b not dividing a; `ok(a, b)` filters the pair. */
export function coprimePair(rand, { min, max, ok = () => true }) {
  for (let t = 0; t < 800; t += 1) {
    const a = int(rand, min, max);
    const b = int(rand, Math.max(6, Math.floor(a / 9)), a - 2);
    if (gcd(a, b) === 1 && a % b !== 0 && ok(a, b)) return [a, b];
  }
  throw new Error('trainer: no coprime pair');
}
/**
 * Two numbers a = g·m and b = g·n with m, n coprime and 2 ≤ n < m: their PGCD is g (from `gs`), b does not divide a;
 * min ≤ a ≤ max; `ok(a, b)` filters the pair.
 */
export function sharedPair(rand, { min, max, gs, ok = () => true }) {
  for (let t = 0; t < 800; t += 1) {
    const g = pick(rand, gs);
    const hi = Math.floor(max / g);
    if (hi < 3) continue;
    const m = int(rand, 3, hi);
    const n = int(rand, 2, m - 1);
    const [a, b] = [g * m, g * n];
    if (gcd(m, n) === 1 && a >= min && ok(a, b)) return [a, b];
  }
  throw new Error('trainer: no pair');
}
/** No plank of the rules (2, 3, 5, 9, 10) divides both: the witness hides. */
const noRuleWitness = (a, b) => RULES.every((r) => a % r !== 0 || b % r !== 0);
/** The smallest common divisor of a and b other than 1 (null when they are coprime). */
export const smallestWitness = (a, b) => {
  for (let d = 2; d <= Math.min(a, b); d += 1) if (a % d === 0 && b % d === 0) return d;
  return null;
};

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** « PGCD(a ; b) » as a plain token of a form line. */
const pgcdText = (a, b) => `PGCD(${a} ; ${b})`;
const pgcdLine = (a, b) => ({ ltr: true, tokens: [pgcdText(a, b), '=', num('g', 'القاسم المشترك الأكبر')] });
/** « a = b × [q] + [r] ». */
const divisionLine = (a, b) => ({
  ltr: true,
  tokens: [String(a), '=', String(b), '×', num('q', 'حاصل القسمة'), '+', num('r', 'الباقي')],
});
/** The two verdicts of « هل هما أوّليّان فيما بينهما؟ ». */
const VERDICTS = [
  { value: 'yes', text: 'أوّليّان فيما بينهما' },
  { value: 'no', text: 'ليسا أوّليّين فيما بينهما' },
];
const verdictLine = (rand, a, b) => ({
  tokens: [`العددان ${a} و ${b}:`, { choice: 'verdict', options: shuffle(rand, VERDICTS) }],
});

/** « $x = n × q + r$ » — the division of x by n. */
const leaves = (x, n) => `$${x} = ${n} \\times ${Math.floor(x / n)} + ${x % n}$`;
const divisionsOf = (a, b) =>
  euclid(a, b)
    .map((s) => `$${divTex(s)}$`)
    .join('، ');
/** « $a = d × m$ و $b = d × n$ » — d written into both numbers. */
const bothBy = (a, b, d) => `$${a} = ${d} \\times ${a / d}$ و $${b} = ${d} \\times ${b / d}$`;
/** The conclusion of a PGCD g of a and b. */
const conclude = (a, b, g) =>
  g === 1 ? `العددان ${a} و ${b} أوّليّان فيما بينهما` : `العددان ${a} و ${b} ليسا أوّليّين فيما بينهما`;

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

  /**
   * true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. Every verdict is computed: the
   * question carries the pair and what the statement SAYS (`says`: 'coprime' | 'not'); the truth is the arithmetic.
   */
  tf(rand, format, flavour) {
    // each statement: [its words, its pair, what it says, why it is true or false, two reasons that are FALSE, its key]
    const make = {
      awwaliyan: () => {
        const coprime = rand() < 0.5;
        const [a, b] = coprime
          ? coprimePair(rand, { min: 20, max: 60 })
          : sharedPair(rand, { min: 20, max: 60, gs: [2, 3, 5, 7] });
        const g = gcd(a, b);
        const p = smallestWitness(a, a); // the smallest factor of a other than 1 (a ≥ 20): it does not divide b
        const why =
          g === 1
            ? `$${P(a, b)} = 1$: القاسم المشترك الوحيد للعددين هو 1.`
            : `${bothBy(a, b, g)}: ${g} قاسم مشترك لهما غير 1.`;
        const lies =
          g === 1
            ? [`${p} يقسم ${b}`, `$${a} = ${b} \\times ${Math.floor(a / b)} + ${(a % b) + 1}$`]
            : [`${g} لا يقسم ${a}`, `$${b} = ${g} \\times ${b / g + 1}$`];
        return [`العددان ${a} و ${b} أوّليّان فيما بينهما`, [a, b], 'coprime', why, lies, K.only];
      },
      ithbat: () => {
        // exactly three divisions at most: a reason chains them all (defects.md B26)
        const coprime = rand() < 0.5;
        const ok = (x, y) => euclid(x, y).length >= 2 && euclid(x, y).length <= 3;
        const [a, b] = coprime
          ? coprimePair(rand, { min: 100, max: 400, ok })
          : sharedPair(rand, { min: 100, max: 400, gs: HIDDEN, ok: (x, y) => ok(x, y) && noRuleWitness(x, y) });
        const g = gcd(a, b);
        const [s] = euclid(a, b);
        const why = `${divisionsOf(a, b)}: آخر باقٍ غير معدوم هو ${g}، إذن $${P(a, b)} = ${g}$.`;
        const lies = [`$${a} = ${b} \\times ${s.q} + ${s.r + 1}$`, `${g} لا يقسم ${b}`];
        return [`العددان ${a} و ${b} أوّليّان فيما بينهما`, [a, b], 'coprime', why, lies, K.proof];
      },
      shahid: () => {
        // the trap: no plank of the rules divides both — « so they are coprime » is FALSE when a witness hides
        if (rand() < 0.5) {
          const [a, b] = sharedPair(rand, { min: 60, max: 400, gs: HIDDEN, ok: noRuleWitness });
          const g = gcd(a, b);
          return [
            `لا يقسم أيّ من ${andAr(RULES)} العددين ${a} و ${b} معًا، إذن هما أوّليّان فيما بينهما`,
            [a, b],
            'coprime',
            `${bothBy(a, b, g)}: ${g} قاسم مشترك لهما غير 1.`,
            [`${g} لا يقسم ${b}`, `$${a} = ${g} \\times ${a / g + 1}$`],
            K.witness,
          ];
        }
        const [a, b] = sharedPair(rand, { min: 60, max: 999, gs: RULES });
        const w = smallestWitness(a, b);
        return [
          `العددان ${a} و ${b} ليسا أوّليّين فيما بينهما`,
          [a, b],
          'not',
          `${bothBy(a, b, w)}: ${w} قاسم مشترك لهما غير 1.`,
          [`${w} لا يقسم ${a}`, `$${b} = ${w} \\times ${b / w + 1}$`],
          K.witness,
        ];
      },
    };
    const [statement, [a, b], says, why, lies, key] = make[flavour]();
    const truth = says === 'coprime' ? gcd(a, b) === 1 : gcd(a, b) !== 1;
    return {
      format,
      kind: 'tf',
      key,
      a,
      b,
      says,
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

  /** exam (🤝) — « احسب PGCD(a ; b)، ثمّ احكم: هل هما أوّليّان فيما بينهما؟ » on numbers up to 99. */
  hukm(rand) {
    const [a, b] =
      rand() < 0.5
        ? coprimePair(rand, { min: 20, max: 99, ok: (x, y) => euclid(x, y).length <= 4 })
        : sharedPair(rand, { min: 20, max: 99, gs: [2, 3, 5, 7, 11, 13] });
    return {
      format: 'exam',
      kind: 'hukm',
      key: K.only,
      a,
      b,
      prompt: `ليكن العددان ${a} و ${b}. احسب $${P(a, b)}$، ثمّ احكم: هل هما أوّليّان فيما بينهما؟`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [pgcdLine(a, b), verdictLine(rand, a, b)] },
    };
  },

  /** exam (✅) — « بيّن أنّ a و b أوّليّان فيما بينهما »: Euclid's first division, then the PGCD. */
  burhan(rand) {
    // three to five divisions: the correction chains them all
    const [a, b] = coprimePair(rand, {
      min: 150,
      max: 999,
      ok: (x, y) => euclid(x, y).length >= 3 && euclid(x, y).length <= 5,
    });
    return {
      format: 'exam',
      kind: 'burhan',
      key: K.proof,
      a,
      b,
      prompt: `بيّن أنّ العددين ${a} و ${b} أوّليّان فيما بينهما: احسب $${P(a, b)}$ بخوارزمية إقليدس، ثمّ انقل القسمة الأولى والنتيجة.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b), pgcdLine(a, b)] },
    };
  },

  /** exam (❌) — « بيّن، دون حساب PGCD، أنّهما ليسا أوّليّين فيما بينهما »: one common divisor other than 1. */
  shahid(rand) {
    const [a, b] = sharedPair(rand, { min: 100, max: 999, gs: RULES });
    return {
      format: 'exam',
      kind: 'shahid',
      key: K.witness,
      a,
      b,
      prompt: `بيّن، دون حساب القاسم المشترك الأكبر، أنّ العددين ${a} و ${b} ليسا أوّليّين فيما بينهما.`,
      form: {
        tip: 'tipWrite',
        lines: [{ tokens: ['قاسم مشترك للعددين يختلف عن 1:', num('d', 'القاسم المشترك')] }],
      },
    };
  },

  /** exam (❌) — « احسب PGCD(a ; b)، ثمّ استنتج أنّهما ليسا أوّليّين »: the witness hides from the rules' planks. */
  nafi(rand) {
    const [a, b] = sharedPair(rand, {
      min: 150,
      max: 999,
      gs: HIDDEN,
      ok: (x, y) => noRuleWitness(x, y) && euclid(x, y).length >= 2 && euclid(x, y).length <= 5,
    });
    return {
      format: 'exam',
      kind: 'nafi',
      key: K.witness,
      a,
      b,
      prompt: `احسب $${P(a, b)}$ بخوارزمية إقليدس، ثمّ استنتج أنّ العددين ${a} و ${b} ليسا أوّليّين فيما بينهما.`,
      form: { tip: 'tipDivision', model: { a, b }, lines: [divisionLine(a, b), pgcdLine(a, b)] },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  only: [
    ['tap', 'pgcd', { key: K.only, coprime: 'mix', maxSteps: 4 }],
    ['tf', 'awwaliyan'],
    ['hukm'],
    ['tap', 'coprimeWith', { key: K.only }],
    ['tf', 'awwaliyan'],
    ['hukm'],
  ],
  proof: [
    ['tap', 'pgcd', { key: K.proof, coprime: 'yes', minSteps: 2, maxSteps: 3 }],
    ['tf', 'ithbat'],
    ['burhan'],
    ['tap', 'pgcd', { key: K.proof, coprime: 'yes', minSteps: 3, maxSteps: 5 }],
    ['tf', 'ithbat'],
    ['burhan'],
  ],
  witness: [
    ['tap', 'witness', { key: K.witness, hidden: false }],
    ['tf', 'shahid'],
    ['shahid'],
    ['tap', 'witness', { key: K.witness, hidden: true }],
    ['tf', 'shahid'],
    ['nafi'],
  ],
  mix: [
    ['tap', 'coprimeWith', { key: K.only }],
    ['tf', 'shahid'],
    ['hukm'],
    ['tap', 'witness', { key: K.witness, hidden: true }],
    ['burhan'],
    ['nafi'],
  ],
};
/** Which plan a card of the lesson's mind map trains (`knowledge.js`). */
export const PLAN_OF = {
  zawj: 'only',
  rappel: 'proof',
  awwaliyan: 'only',
  'mithal-25': 'only',
  'khata-awwali': 'only',
  'mithal-39': 'only',
  ithbat: 'proof',
  'mithal-35': 'proof',
  'khata-baqi': 'proof',
  shahid: 'witness',
  'mithal-645': 'witness',
  'khata-shahid': 'witness',
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
    case 'hukm':
      return { g: gcd(q.a, q.b), verdict: gcd(q.a, q.b) === 1 ? 'yes' : 'no' };
    case 'burhan':
    case 'nafi':
      return { q: first.q, r: first.r, g: gcd(q.a, q.b) };
    case 'shahid':
      return { d: smallestWitness(q.a, q.b) };
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
        ? 'تحقّق بالحساب: ابحث عن قاسم مشترك، أو احسب القاسم المشترك الأكبر، قبل أن تحكم.'
        : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن الحساب الذي يبرهن.',
      fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
    };
  }
  const { a, b } = q;
  const g = gcd(a, b);
  /** The division a = b × q + r he wrote, or null when it is right. */
  const divisionHint = () => {
    if (b * n('q') + n('r') !== a)
      return `تحقّق: $${b} \\times ${n('q')} + ${n('r')} = ${b * n('q') + n('r')}$، وليس ${a}.`;
    if (n('r') >= b) return `الباقي ${n('r')} ليس أصغر من ${b}: العدد ${b} يدخل مرّة أخرى على الأقلّ.`;
    return null;
  };
  /** Euclid's ladder, then the conclusion: at most the divisions of the pair (the fix, after the answer). */
  const proofFix = `${divisionsOf(a, b)}: آخر باقٍ غير معدوم هو ${g}، إذن $${P(a, b)} = ${g}$، و${conclude(a, b, g)}.`;
  switch (q.kind) {
    case 'hukm': {
      const fix = `$${P(a, b)} = ${g}$، إذن ${conclude(a, b, g)}.`;
      if (!whole('g') || !['yes', 'no'].includes(v?.verdict))
        return { ok: false, hint: 'املأ الخانة واختر الحكم.', fix };
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      if (v.verdict !== (g === 1 ? 'yes' : 'no'))
        return { ok: false, hint: `قارن القاسم المشترك الأكبر الذي وجدته، ${g}، بالعدد 1.`, fix };
      return { ok: true, fix };
    }
    case 'burhan':
    case 'nafi': {
      if (!whole('q', 'r', 'g'))
        return { ok: false, hint: 'املأ كلّ الخانات: القسمة الأولى، ثمّ النتيجة.', fix: proofFix };
      const h = divisionHint();
      if (h) return { ok: false, hint: h, fix: proofFix };
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix: proofFix };
      return { ok: true, fix: proofFix };
    }
    case 'shahid': {
      const d = n('d');
      const w = whole('d') && d > 1 && a % d === 0 && b % d === 0 ? d : smallestWitness(a, b);
      const fix = `${bothBy(a, b, w)}: ${w} قاسم مشترك للعددين يختلف عن 1، إذن ${conclude(a, b, g)}.`;
      if (!whole('d')) return { ok: false, hint: 'اكتب قاسمًا مشتركًا للعددين في الخانة.', fix };
      if (d === 0) return { ok: false, hint: '0 ليس قاسمًا لأيّ عدد.', fix };
      if (d === 1) return { ok: false, hint: '1 يقسم كلّ عدد طبيعي: لا يثبت شيئًا. ابحث عن قاسم مشترك غيره.', fix };
      if (a % d !== 0) return { ok: false, hint: `${leaves(a, d)}: ${d} لا يقسم ${a}.`, fix };
      if (b % d !== 0) return { ok: false, hint: `${d} يقسم ${a}، لكن ${leaves(b, d)}.`, fix };
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
    case 'hukm': {
      const verdict = VERDICTS.find((o) => o.value === v?.verdict)?.text ?? '…';
      return `$${P(q.a, q.b)} = ${x('g')}$ — ${verdict}`;
    }
    case 'burhan':
    case 'nafi':
      return listAr([`$${q.a} = ${q.b} \\times ${x('q')} + ${x('r')}$`, `$${P(q.a, q.b)} = ${x('g')}$`]);
    case 'shahid':
      return `قاسم مشترك يختلف عن 1: ${x('d')}`;
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
