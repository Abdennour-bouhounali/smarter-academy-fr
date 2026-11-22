/**
 * « تدرّب » of lesson `tayin-pgcd` — the CONTENT of its trainer (PURE). The frame — six questions, two formats that drift
 * toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's TRAINER questions,
 * generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « عيّن قواسم a وقواسم b ثمّ استنتج PGCD(a ; b) », « أكمل دون حساب », « بيّن أنّ b يقسم a ثمّ
 *   استنتج PGCD(a ; b) », « صحيح أم خطأ؟ علّل ».
 * Every reason offered to « علّل » that is not the right one is a FALSE statement (an equality or a « يقسم » that does
 * not hold): `trainer.test.js` computes each one.
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { commonDivisors, divisorsOf, gcd, listAr, pgcdTex } from './math';
import { isRight, waveOf } from './practice';

const K = { hasr: 'hasr-wa-taqatu', nataij: 'nataij-mubashira', yaqsim: 'b-yaqsim-a' };

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** « PGCD(a ; b) » as a plain token of a form line. */
const pgcdText = (a, b) => `PGCD(${a} ; ${b})`;
/**
 * « قواسم a: [ ]، [ ]، … » — as many boxes as a has divisors (`prefix` names them: x0, x1… or y0, y1…). More than
 * three boxes do not hold on one line of the sheet beside the knowledge map (2026-11-19: the sixth box of « قواسم 20 »
 * fell alone on a second line at 1366 × 768, the fourth of « قواسم 15 » at 1024 × 768): the list is then written on TWO
 * lines, the second continuing the first (4 → 2 + 2, 5 → 3 + 2, 6 → 3 + 3; a list asked has at most six divisors).
 */
const PER_LINE = 3;
const listLines = (a, n, prefix) => {
  const boxes = Array.from({ length: n }, (_, i) => num(`${prefix}${i}`, `القاسم ${i + 1} للعدد ${a}`));
  const joined = (ts) => ts.flatMap((t, i) => (i ? [{ text: '،', rtl: true }, t] : [t]));
  const cut = n > PER_LINE ? Math.ceil(n / 2) : n;
  const head = [{ text: `قواسم ${a}`, rtl: true }, ':', ...joined(boxes.slice(0, cut))];
  if (n <= cut) return [{ ltr: true, tokens: head }];
  // the first line ends on its comma: the list goes on below
  return [
    { ltr: true, tokens: [...head, { text: '،', rtl: true }] },
    { ltr: true, tokens: joined(boxes.slice(cut)) },
  ];
};
const pgcdLine = (a, b) => ({ ltr: true, tokens: [pgcdText(a, b), '=', num('g', 'القاسم المشترك الأكبر')] });

/**
 * The pairs a list question may ask: two different numbers with a common divisor other than 1, neither a divisor of the
 * other (that is the third key), each with at most `max` divisors so the boxes fit one sheet.
 */
const pairsUpTo = (max) => {
  const out = [];
  for (let a = 6; a <= 60; a += 1)
    for (let b = a + 1; b <= 60; b += 1)
      if (
        gcd(a, b) > 1 &&
        b % a !== 0 &&
        divisorsOf(a).length <= max &&
        divisorsOf(b).length <= max &&
        divisorsOf(a).length >= 4
      )
        out.push([a, b]);
  return out;
};
const PAIRS = { 4: pairsUpTo(4), 6: pairsUpTo(6) };
/** « $a = n × q + r$ » — n does not divide a, shown by its own division. */
const leaves = (a, n) => `$${a} = ${n} \\times ${Math.floor(a / n)} + ${a % n}$`;
const smallestPrime = (n) => divisorsOf(n).find((d) => d > 1);
/** Composite numbers 12 … 99 (their divisors are not only 1 and themselves). */
const COMPOSITES = Array.from({ length: 88 }, (_, i) => i + 12).filter((n) => smallestPrime(n) !== n);

// ───────────────────────────── the kinds of question ─────────────────────────────
const Q = {
  /** game — one sentence, three gates (the gate dash, standing still). */
  tap(rand, f, kind, params) {
    const wave = waveOf(rand, kind, params);
    return { format: 'game', kind: 'tap', key: wave.key, wave, options: wave.gates, prompt: waveSay(wave) };
  },

  /** true / false. game: one tap. exam: « صحيح أم خطأ؟ علّل » — the truth AND its reason. */
  tf(rand, format, flavour) {
    // each statement: [its words, its truth, why (true), two reasons that are FALSE as statements, its key]
    const make = {
      hasr: () => {
        const [a, b] = pick(rand, PAIRS[6]);
        const g = gcd(a, b);
        const common = commonDivisors(a, b);
        const m = pick(
          rand,
          common.filter((x) => x < g),
        );
        return pick(rand, [
          [
            `$${pgcdTex(a, b)} = ${g}$`,
            true,
            `القواسم المشتركة للعددين ${a} و ${b} هي ${listAr(common)}، وأكبرها ${g}.`,
            [`${g} لا يقسم ${b}`, `$${a} = ${g} \\times ${a / g + 1}$`],
            K.hasr,
          ],
          [
            `$${pgcdTex(a, b)} = ${m}$`,
            false,
            `${m} قاسم مشترك، لكنّ ${g} يقسم ${a} و ${b} أيضًا، وهو أكبر من ${m}.`,
            [`${m} لا يقسم ${a}`, `${g} لا يقسم ${b}`],
            K.hasr,
          ],
        ]);
      },
      nataij: () => {
        const n = pick(rand, COMPOSITES);
        // two numbers of which neither divides the other: « PGCD(n ; k) = PGCD(k ; n) »
        let k;
        do k = pick(rand, COMPOSITES);
        while (k === n || k % n === 0 || n % k === 0);
        return pick(rand, [
          [
            `$${pgcdTex(n, n)} = ${n}$`,
            true,
            `$${n} = ${n} \\times 1$: ${n} يقسم ${n}، ولا يقسمه أيّ عدد أكبر منه.`,
            [`${n} لا يقسم ${n}`, `$${n} = ${n} \\times 2$`],
            K.nataij,
          ],
          [
            `$${pgcdTex(n, 0)} = 0$`,
            false,
            `$0 = ${n} \\times 0$: ${n} يقسم 0، وأكبر قواسم ${n} هو ${n}، إذن $${pgcdTex(n, 0)} = ${n}$.`,
            [`${n} لا يقسم 0`, `$${n} = 0 \\times ${n}$`],
            K.nataij,
          ],
          [
            `$${pgcdTex(n, 1)} = ${n}$`,
            false,
            `${n} لا يقسم 1، والعدد 1 لا يقبل قاسمًا غير 1: إذن $${pgcdTex(n, 1)} = 1$.`,
            [`${n} يقسم 1`, `$1 = ${n} \\times 1$`],
            K.nataij,
          ],
          [
            `$${pgcdTex(n, k)} = ${pgcdTex(k, n)}$`,
            true,
            `القواسم المشتركة للعددين ${n} و ${k} هي نفسها مهما كان ترتيبهما.`,
            [`${n} يقسم ${k}`, `${k} يقسم ${n}`],
            K.nataij,
          ],
        ]);
      },
      yaqsim: () => {
        const b = int(rand, 6, 15);
        const k = int(rand, 2, 9);
        const a = b * k;
        // a smaller number that does NOT divide a: « PGCD(a ; c) = c » is false
        const c = [1, 2, 3, 4, 5].map((x) => b + x).find((x) => a % x !== 0);
        return pick(rand, [
          [
            `${b} يقسم ${a}، إذن $${pgcdTex(a, b)} = ${b}$`,
            true,
            `$${a} = ${b} \\times ${k}$: كلّ قاسم للعدد ${b} يقسم ${a}، وأكبر قواسم ${b} هو ${b}.`,
            [`${b} لا يقسم ${a}`, `$${a} = ${b} \\times ${k + 1}$`],
            K.yaqsim,
          ],
          [
            `$${pgcdTex(a, c)} = ${c}$`,
            false,
            `${leaves(a, c)}: ${c} لا يقسم ${a}، و $${pgcdTex(a, c)} = ${gcd(a, c)}$.`,
            [`${c} يقسم ${a}`, `$${a} = ${c} \\times ${Math.floor(a / c)}$`],
            K.yaqsim,
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

  /** exam — « عيّن قواسم a وقواسم b، ثمّ استنتج PGCD(a ; b) ». */
  hasr(rand, f, max = 6) {
    const [x, y] = pick(rand, PAIRS[max]);
    const [a, b] = rand() < 0.5 ? [x, y] : [y, x];
    const [na, nb] = [divisorsOf(a).length, divisorsOf(b).length];
    return {
      format: 'exam',
      kind: 'hasr',
      key: K.hasr,
      a,
      b,
      na,
      nb,
      g: gcd(a, b),
      // short enough to stay on one line of the sheet at 1024 × 768 (its lists already take up to five lines)
      prompt: `عيّن قواسم ${a} وقواسم ${b}، ثمّ استنتج $${pgcdTex(a, b)}$.`,
      form: { tip: 'tipWrite', lines: [...listLines(a, na, 'x'), ...listLines(b, nb, 'y'), pgcdLine(a, b)] },
    };
  },

  /**
   * exam — « دون أيّ حساب، أكمل »: a and a, a and 0, then a and 1 or a pair turned round — numbers too big to list.
   * `third` = { kind: 'one' | 'swap', pair: the pair asked, given?: the PGCD stated for the other order }.
   */
  direct(rand) {
    const a = int(rand, 120, 990);
    const zero = rand() < 0.5 ? [a, 0] : [0, a];
    let third;
    if (rand() < 0.5) third = { kind: 'one', pair: rand() < 0.5 ? [a, 1] : [1, a] };
    else {
      const [x, y] = pick(rand, PAIRS[6]);
      third = { kind: 'swap', pair: [y, x], given: gcd(x, y) };
    }
    const [tx, ty] = third.pair;
    // the pair turned round: what is given on its own line, then the line to complete (2026-11-19: on one line, the
    // box fell alone on a second line at 1024 × 768)
    const thirdLines =
      third.kind === 'one'
        ? [{ ltr: true, tokens: [pgcdText(tx, ty), '=', num('o', 'الثالث')] }]
        : [
            { ltr: true, tokens: [`${pgcdText(ty, tx)} = ${third.given}`] },
            { ltr: true, tokens: [pgcdText(tx, ty), '=', num('o', 'الثالث')] },
          ];
    return {
      format: 'exam',
      kind: 'direct',
      key: K.nataij,
      a,
      zero,
      third,
      prompt: 'دون أيّ حساب، أكمل:',
      form: {
        tip: 'tipWrite',
        lines: [
          { ltr: true, tokens: [pgcdText(a, a), '=', num('s', 'الأوّل')] },
          { ltr: true, tokens: [pgcdText(...zero), '=', num('z', 'الثاني')] },
          ...thirdLines,
        ],
      },
    };
  },

  /** exam — « بيّن أنّ b يقسم a، ثمّ استنتج PGCD(a ; b) دون حصر القواسم ». */
  yaqsim(rand) {
    const b = int(rand, 11, 40);
    const k = int(rand, 2, 9);
    const a = b * k;
    return {
      format: 'exam',
      kind: 'yaqsim',
      key: K.yaqsim,
      a,
      b,
      k,
      prompt: `بيّن أنّ ${b} يقسم ${a}، ثمّ استنتج $${pgcdTex(a, b)}$ دون حصر القواسم.`,
      form: {
        tip: 'tipWrite',
        lines: [{ ltr: true, tokens: [String(a), '=', String(b), '×', num('k', 'العدد k')] }, pgcdLine(a, b)],
      },
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  hasr: [
    ['tap', 'list', { dMin: 2, dMax: 6, key: K.hasr }],
    ['tf', 'hasr'],
    ['hasr', 4],
    ['tap', 'common', { dMin: 2, dMax: 9, key: K.hasr }],
    ['tf', 'hasr'],
    ['hasr', 6],
  ],
  nataij: [
    ['tap', 'same', { key: K.nataij }],
    ['tf', 'nataij'],
    ['direct'],
    ['tap', 'zero', { key: K.nataij }],
    ['tf', 'nataij'],
    ['direct'],
  ],
  yaqsim: [
    ['tap', 'divides', { bMin: 3, bMax: 9, key: K.yaqsim }],
    ['tf', 'yaqsim'],
    ['yaqsim'],
    ['tap', 'factor', { bMin: 6, bMax: 12, key: K.yaqsim }],
    ['tf', 'yaqsim'],
    ['yaqsim'],
  ],
  mix: [
    ['tap', 'list', { dMin: 2, dMax: 10, key: K.hasr }],
    ['tf', 'nataij'],
    ['hasr', 6],
    ['tap', 'divides', { bMin: 3, bMax: 12, key: K.yaqsim }],
    ['yaqsim'],
    ['direct'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  'pgcd-maana': 'hasr',
  hasr: 'hasr',
  'rappel-qawasim': 'hasr',
  'mithal-32-44': 'hasr',
  'khata-laysa-akbar': 'hasr',
  nataij: 'nataij',
  tabaduli: 'nataij',
  'khata-sifr': 'nataij',
  yaqsim: 'yaqsim',
  'mithal-76-19': 'yaqsim',
  'tahaqquq-awwalan': 'yaqsim',
  khulasa: 'mix',
};

/** The divisors a student wrote, list by list (an empty box is NaN or 0: never a divisor). */
export const writtenList = (n, prefix, v) => Array.from({ length: n }, (_, i) => Number(v?.[`${prefix}${i}`]));

/** The pair of the third line of a « direct » question, and its PGCD. */
export const thirdOf = (q) => ({ x: q.third.pair[0], y: q.third.pair[1], g: gcd(...q.third.pair) });

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'hasr':
      return {
        ...Object.fromEntries(divisorsOf(q.a).map((d, i) => [`x${i}`, d])),
        ...Object.fromEntries(divisorsOf(q.b).map((d, i) => [`y${i}`, d])),
        g: q.g,
      };
    case 'direct':
      return { s: q.a, z: q.a, o: thirdOf(q).g };
    case 'yaqsim':
      return { k: q.k, g: q.b };
    default:
      return null;
  }
}

/** The hint for a PGCD written g of a and b, when it is not the right one (never the answer). */
function pgcdHint(a, b, g) {
  if (g === 0) return '0 ليس قاسمًا لأيّ عدد: القاسم المشترك الأكبر ليس 0.';
  if (a % g === 0 && b % g === 0) return `${g} قاسم مشترك فعلًا. هل هو الأكبر؟ قارن القائمتين.`;
  if (g > Math.min(a, b)) return `${g} أكبر من ${Math.min(a, b)}: لا يقسمه.`;
  return a % g === 0 ? `${g} يقسم ${a}، لكن ${leaves(b, g)}.` : `${leaves(a, g)}: ${g} لا يقسم ${a}.`;
}
/** The hint for a list of divisors of a, or null when the list is right (its length is the number of divisors). */
function listHint(a, list) {
  const wrong = list.find((d) => d < 1 || a % d !== 0);
  if (wrong != null)
    return wrong < 1 ? `${wrong} ليس قاسمًا لأيّ عدد.` : `${leaves(a, wrong)}: ${wrong} ليس قاسمًا للعدد ${a}.`;
  if (new Set(list).size !== list.length)
    return `كتبتَ قاسمًا للعدد ${a} مرّتين: كلّ قسمة تامّة تعطي قاسمين، لا تنسَ الشريك.`;
  return null;
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
          ? 'تحقّق: اكتب قواسم كلّ عدد، أو تحقّق هل يقسم أحدهما الآخر، قبل أن تحكم.'
          : 'الحكم صحيح، لكنّ التعليل لا يثبته: ابحث عن القواسم أو المساواة التي تبرهن.',
        fix: `${q.truth ? 'صحيح' : 'خطأ'}. ${q.why}`,
      };
    }
    case 'hasr': {
      const { a, b, g } = q;
      const fix = `قواسم ${a}: ${listAr(divisorsOf(a))}. قواسم ${b}: ${listAr(divisorsOf(b))}. المشتركة: ${listAr(commonDivisors(a, b))}، إذن $${pgcdTex(a, b)} = ${g}$.`;
      const boxes = [
        ...Array.from({ length: q.na }, (_, i) => `x${i}`),
        ...Array.from({ length: q.nb }, (_, i) => `y${i}`),
        'g',
      ];
      if (!whole(...boxes)) return { ok: false, hint: 'املأ كلّ الخانات بأعداد طبيعية: القائمتين، ثمّ PGCD.', fix };
      const hint = listHint(a, writtenList(q.na, 'x', v)) ?? listHint(b, writtenList(q.nb, 'y', v));
      if (hint) return { ok: false, hint, fix };
      if (n('g') !== g) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      return { ok: true, fix };
    }
    case 'direct': {
      const { a } = q;
      const t = thirdOf(q);
      const fix = `$${pgcdTex(a, a)} = ${a}$ و $${pgcdTex(...q.zero)} = ${a}$ و $${pgcdTex(t.x, t.y)} = ${t.g}$.`;
      if (!whole('s', 'z', 'o')) return { ok: false, hint: 'املأ الخانات الثلاث بأعداد طبيعية.', fix };
      const s = n('s');
      if (s !== a)
        return {
          ok: false,
          hint:
            s > a
              ? `في السطر الأوّل: ${s} أكبر من ${a}، فلا يقسمه.`
              : `في السطر الأوّل: هل يوجد قاسم للعدد ${a} أكبر من ${s}؟`,
          fix,
        };
      const z = n('z');
      if (z !== a)
        return {
          ok: false,
          hint:
            z === 0
              ? 'في السطر الثاني: 0 ليس قاسمًا لأيّ عدد، لا نقسم على 0.'
              : a % z
                ? `في السطر الثاني: ${leaves(a, z)}، إذن ${z} لا يقسم ${a}.`
                : `في السطر الثاني: كلّ عدد يقسم 0. هل يوجد قاسم للعدد ${a} أكبر من ${z}؟`,
          fix,
        };
      if (n('o') !== t.g)
        return {
          ok: false,
          hint:
            q.third.kind === 'one'
              ? 'في السطر الثالث: ما قواسم العدد 1؟'
              : 'في السطر الثالث: العددان هما نفساهما في السطر، بترتيب آخر.',
          fix,
        };
      return { ok: true, fix };
    }
    case 'yaqsim': {
      const { a, b, k } = q;
      const fix = `$${a} = ${b} \\times ${k}$: ${b} يقسم ${a}، إذن $${pgcdTex(a, b)} = ${b}$.`;
      if (!whole('k', 'g')) return { ok: false, hint: 'املأ الخانتين: العدد k، ثمّ القاسم المشترك الأكبر.', fix };
      if (b * n('k') !== a)
        return { ok: false, hint: `تحقّق: $${b} \\times ${n('k')} = ${b * n('k')}$، وليس ${a}.`, fix };
      if (n('g') !== b) return { ok: false, hint: pgcdHint(a, b, n('g')), fix };
      return { ok: true, fix };
    }
    default:
      return { ok: false, hint: '', fix: '' };
  }
}

/** An answer as the student gave it, in one line, to read again later. */
export function answerLabel(q, v) {
  const box = (k) => v?.[k] ?? '…';
  const list = (n, prefix) => listAr(Array.from({ length: n }, (_, i) => box(`${prefix}${i}`)));
  switch (q.kind) {
    case 'tap':
      return String(v);
    case 'tf':
      return `${v?.truth ? 'صحيح' : 'خطأ'}${q.reasons && q.reasons[v?.reason] ? ` — ${q.reasons[v.reason].t}` : ''}`;
    case 'hasr':
      return `قواسم ${q.a}: ${list(q.na, 'x')} — قواسم ${q.b}: ${list(q.nb, 'y')} — $${pgcdTex(q.a, q.b)} = ${box('g')}$`;
    case 'direct': {
      const t = thirdOf(q);
      return listAr([
        `$${pgcdTex(q.a, q.a)} = ${box('s')}$`,
        `$${pgcdTex(...q.zero)} = ${box('z')}$`,
        `$${pgcdTex(t.x, t.y)} = ${box('o')}$`,
      ]);
    }
    case 'yaqsim':
      return listAr([`$${q.a} = ${q.b} \\times ${box('k')}$`, `$${pgcdTex(q.a, q.b)} = ${box('g')}$`]);
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
