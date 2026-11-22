/**
 * « تدرّب » of lesson `qasim-mushtarak-akbar` — the CONTENT of its trainer (PURE). The frame — six questions, two formats
 * that drift toward the exam, the stars — is the kit's (`gameworld/kit/trainer.js`). These are the platform's TRAINER
 * questions, generated; the exam sitting is the lesson's exercise bank, served as it is (`sitting.js`).
 * Here: the kinds of question of THIS lesson, the plan of each card of its mind map, and how an answer is judged:
 * `check` gives first a HINT that says what the answer produces (never the answer), then the written correction.
 *   exam formats: « عيّن القواسم المشتركة للعددين a و b », « احسب PGCD(a ; b) », « أكبر عدد من الباقات المتماثلة، وما في
 *   كلّ باقة », « PGCD(a ; b) = g: عيّن القواسم المشتركة دون كتابة قواسم كلّ عدد », « صحيح أم خطأ؟ علّل ».
 */
import { explain, waveSay } from '../../../../../../common/gameworld/divisorIsles/strings';
import { int, pick, shuffle } from '../../../../../../common/gameworld/kit/random';
import { createTrainer } from '../../../../../../common/gameworld/kit/trainer';
import { BOUQUETS, LILIES, ROSES, commonDivisors, counted, divisorsOf, gcd, listAr } from './math';
import { isRight, waveOf } from './practice';

const K = { com: 'qawasim-mushtaraka', akbar: 'al-akbar', baqat: 'baqat-mutamathila', nest: 'qawasim-al-pgcd' };
/** PGCDs with exactly six divisors: the list of common divisors is six boxes, in two lines of three. */
const SIX = [12, 18, 20, 28, 32, 44, 45, 50];
const BOXES = 6;

/** a = g × p, b = g × q with p ≠ q in [pMin, pMax] sharing no divisor but 1: PGCD(a ; b) = g. */
function pairOf(rand, g, pMin = 2, pMax = 9) {
  for (;;) {
    const p = int(rand, pMin, pMax);
    const q = int(rand, pMin, pMax);
    if (p !== q && gcd(p, q) === 1) return { g, p, q, a: g * p, b: g * q };
  }
}
const pgcdTex = (a, b) => `\\mathrm{PGCD}(${a} ; ${b})`;
/** « $a = n × q + r$ » — n does not divide a, shown by its own division. */
const leaves = (a, n) => `$${a} = ${n} \\times ${Math.floor(a / n)} + ${a % n}$`;

// ───────────────────────────── the answer of an exam question, in its own shape ─────────────────────────────
const num = (name, label) => ({ num: name, label });
/** Six boxes for a list of divisors, in two lines of three (any order is accepted). */
const listForm = (lead) => ({
  tip: 'tipWrite',
  lines: [
    { tokens: [{ text: lead, rtl: true }] },
    { ltr: true, tokens: [num('c0', 'قاسم'), '،', num('c1', 'قاسم'), '،', num('c2', 'قاسم')] },
    { ltr: true, tokens: [num('c3', 'قاسم'), '،', num('c4', 'قاسم'), '،', num('c5', 'قاسم')] },
  ],
});
const SLOTS = Array.from({ length: BOXES }, (_, i) => `c${i}`);
/** « PGCD(a ; b) = [g] ». */
const pgcdForm = (a, b) => ({
  tip: 'tipWrite',
  lines: [{ ltr: true, tokens: [`PGCD(${a} ; ${b})`, '=', num('g', 'PGCD')] }],
});
/**
 * « أكبر عدد من الباقات = [n] », « عدد الورود في كلّ باقة = [x] », « عدد الزنابق في كلّ باقة = [y] » — one box a line:
 * no counted noun follows a box, so no number agreement depends on what he types.
 */
const bouquetForm = () => ({
  tip: 'tipWrite',
  lines: [
    { tokens: [{ text: 'أكبر عدد من الباقات', rtl: true }, '=', num('n', 'عدد الباقات')] },
    { tokens: [{ text: 'عدد الورود في كلّ باقة', rtl: true }, '=', num('x', 'عدد الورود')] },
    { tokens: [{ text: 'عدد الزنابق في كلّ باقة', rtl: true }, '=', num('y', 'عدد الزنابق')] },
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
    const g = pick(rand, SIX);
    let P;
    // a pair where p or q does not divide g: that one divides a (or b) and not the other number
    do P = pairOf(rand, g, 3, 11);
    while (g % P.p === 0 && g % P.q === 0);
    const { a, b, p, q } = P;
    const proper = divisorsOf(g).filter((n) => n > 1 && n < g);
    const d = pick(rand, proper);
    // a divisor of a that is not one of b: p itself when p does not divide g (then p does not divide b)
    const lone = [p, q].find((x) => g % x !== 0);
    const not = pick(
      rand,
      [4, 5, 6, 7, 8, 9, 10, 12, 15].filter((n) => g % n !== 0),
    );
    /** « $x = n × (k + 1)$ »: an equality that is FALSE — a reason that proves nothing. */
    const offBy = (x, n) => `$${x} = ${n} \\times ${x / n + 1}$`;
    // each statement: [its words, its truth, why (true arithmetic), two reasons that are FALSE as statements, its key]
    const make = {
      com: () =>
        pick(rand, [
          [
            `${d} قاسم مشترك للعددين ${a} و ${b}`,
            true,
            `$${a} = ${d} \\times ${a / d}$ و $${b} = ${d} \\times ${b / d}$.`,
            [`${d} يقسم ${a} ولا يقسم ${b}`, offBy(a, d)],
            K.com,
          ],
          [
            `${lone} قاسم مشترك للعددين ${a} و ${b}`,
            false,
            `${lone} يقسم أحد العددين فقط: ${leaves(lone === p ? b : a, lone)}.`,
            [`${lone} يقسم ${a} و ${b} معًا`, `${lone} لا يقسم ${lone === p ? a : b}`],
            K.com,
          ],
        ]),
      akbar: () =>
        pick(rand, [
          [
            `$${pgcdTex(a, b)} = ${g}$`,
            true,
            `$${a} = ${g} \\times ${p}$ و $${b} = ${g} \\times ${q}$، و ${p} و ${q} لا يشتركان إلّا في القاسم 1.`,
            [`${g} أصغر قاسم مشترك للعددين ${a} و ${b}`, offBy(a, g)],
            K.akbar,
          ],
          [
            `$${pgcdTex(a, b)} = ${d}$`,
            false,
            `${d} قاسم مشترك، لكنّ ${g} أكبر منه ويقسم العددين: $${a} = ${g} \\times ${p}$ و $${b} = ${g} \\times ${q}$.`,
            [`${d} لا يقسم ${a}`, `${g} لا يقسم ${b}`],
            K.akbar,
          ],
        ]),
      baqat: () =>
        pick(rand, [
          [
            `نصنع من ${a} وردة و ${b} زنبقة، دون أن يبقى شيء، باقات متماثلة عددها ${d}`,
            true,
            `${d} يقسم العددين: في كلّ باقة ${counted(a / d, ROSES)} و ${counted(b / d, LILIES)}.`,
            [`${d} لا يقسم ${b}`, offBy(a, d)],
            K.baqat,
          ],
          [
            `أكبر عدد من الباقات المتماثلة بـ ${a} وردة و ${b} زنبقة هو ${d}`,
            false,
            `$${pgcdTex(a, b)} = ${g}$: يمكن أن يكون عدد الباقات ${g}، وهو أكبر من ${d}.`,
            [`${d} لا يقسم ${a}`, `${g} لا يقسم ${a}`],
            K.baqat,
          ],
        ]),
      nest: () =>
        pick(rand, [
          [
            `$${pgcdTex('a', 'b')} = ${g}$، إذن ${d} قاسم مشترك للعددين $a$ و $b$`,
            true,
            `$${g} = ${d} \\times ${g / d}$: ${d} يقسم ${g}، و ${g} يقسم $a$ و $b$.`,
            [`${d} لا يقسم ${g}`, offBy(g, d)],
            K.nest,
          ],
          [
            `$${pgcdTex('a', 'b')} = ${g}$، إذن ${not} قاسم مشترك للعددين $a$ و $b$`,
            false,
            `${leaves(g, not)}: ${not} لا يقسم ${g}، والقواسم المشتركة هي قواسم ${g} وحدها.`,
            [`${not} يقسم ${g}`, `$${g} = ${not} \\times ${Math.floor(g / not)}$`],
            K.nest,
          ],
        ]),
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

  /** exam — « عيّن القواسم المشتركة للعددين a و b ». */
  commonList(rand) {
    const { a, b, g } = pairOf(rand, pick(rand, SIX), 3, 11);
    return {
      format: 'exam',
      kind: 'commonList',
      key: K.com,
      a,
      b,
      g,
      prompt: `عيّن القواسم المشتركة للعددين ${a} و ${b}.`,
      form: listForm(`القواسم المشتركة للعددين ${a} و ${b}:`),
    };
  },

  /** exam — « احسب PGCD(a ; b) ». */
  pgcd(rand) {
    const { a, b, g } = pairOf(rand, int(rand, 8, 30), 2, 13);
    return {
      format: 'exam',
      kind: 'pgcd',
      key: K.akbar,
      a,
      b,
      g,
      prompt: `احسب $${pgcdTex(a, b)}$.`,
      form: pgcdForm(a, b),
    };
  },

  /** exam — « a وردة و b زنبقة كلّها في باقات متماثلة: أكبر عدد من الباقات، وما في كلّ باقة ». */
  bouquets(rand) {
    const { a, b, g, p, q } = pairOf(rand, int(rand, 6, 24), 2, 12);
    return {
      format: 'exam',
      kind: 'bouquets',
      key: K.baqat,
      a,
      b,
      g,
      p,
      q,
      prompt: `عند بائعة الزهور ${a} وردة و ${b} زنبقة. تصنع منها كلّها باقات متماثلة دون أن يبقى شيء. ما هو أكبر عدد من الباقات؟ وكم وردة وكم زنبقة في كلّ باقة؟`,
      form: bouquetForm(),
    };
  },

  /** exam — « PGCD(a ; b) = g: عيّن القواسم المشتركة للعددين a و b دون كتابة قواسم كلّ عدد ». */
  nestList(rand) {
    const { a, b, g } = pairOf(rand, pick(rand, SIX), 5, 13);
    return {
      format: 'exam',
      kind: 'nestList',
      key: K.nest,
      a,
      b,
      g,
      prompt: `نعلم أنّ $${pgcdTex(a, b)} = ${g}$. دون كتابة قواسم ${a} و ${b}، عيّن قواسمهما المشتركة.`,
      form: listForm(`القواسم المشتركة للعددين ${a} و ${b}:`),
    };
  },
};

/** What a session asks, by family of card: [kind, …arguments] for the six slots (game, game, exam, game, exam, exam). */
const PLANS = {
  com: [
    ['tap', 'common', { gMin: 2, gMax: 7, key: K.com }],
    ['tf', 'com'],
    ['commonList'],
    ['tap', 'common', { gMin: 4, gMax: 12, key: K.com }],
    ['tf', 'com'],
    ['commonList'],
  ],
  akbar: [
    ['tap', 'pgcd', { gMin: 2, gMax: 9, key: K.akbar, longest: true }],
    ['tf', 'akbar'],
    ['pgcd'],
    ['tap', 'pgcd', { gMin: 4, gMax: 12, key: K.akbar }],
    ['tf', 'akbar'],
    ['pgcd'],
  ],
  baqat: [
    ['tap', 'possible', { gMin: 2, gMax: 9, key: K.baqat }],
    ['tf', 'baqat'],
    ['bouquets'],
    ['tap', 'most', { gMin: 4, gMax: 12, key: K.baqat }],
    ['tf', 'baqat'],
    ['bouquets'],
  ],
  nest: [
    ['tap', 'nest', { gs: SIX, key: K.nest }],
    ['tf', 'nest'],
    ['nestList'],
    ['tap', 'count', { gs: SIX, key: K.nest }],
    ['tf', 'nest'],
    ['nestList'],
  ],
  mix: [
    ['tap', 'common', { gMin: 2, gMax: 9, key: K.com }],
    ['tf', 'akbar'],
    ['pgcd'],
    ['tap', 'most', { gMin: 3, gMax: 10, key: K.baqat }],
    ['bouquets'],
    ['nestList'],
  ],
};
/** Which plan a card of the lesson's mind map trains. */
export const PLAN_OF = {
  fikra: 'com',
  mushtaraka: 'com',
  tadhkir: 'com',
  'khata-wahid': 'com',
  akbar: 'akbar',
  'mithal-akbar': 'akbar',
  'khata-asghar': 'akbar',
  baqat: 'baqat',
  'mithal-baqat': 'baqat',
  kulluha: 'baqat',
  nest: 'nest',
  khulasa: 'mix',
};

/** The numbers typed in the list boxes (the empty ones left out). */
const listed = (v) =>
  SLOTS.map((s) => v?.[s])
    .filter((x) => x !== '' && x != null)
    .map(Number);

/** The right answer of a question — for the tests and the automated walk, never shown before the correction. */
export function solution(q) {
  switch (q.kind) {
    case 'tap':
      return q.wave.gates[q.wave.good];
    case 'tf':
      return q.reasons ? { truth: q.truth, reason: q.reasons.findIndex((r) => r.ok) } : { truth: q.truth };
    case 'commonList':
    case 'nestList':
      return Object.fromEntries(divisorsOf(q.g).map((d, i) => [SLOTS[i], d]));
    case 'pgcd':
      return { g: q.g };
    case 'bouquets':
      return { n: q.g, x: q.p, y: q.q };
    default:
      return null;
  }
}

/** Judges a list of common divisors of a and b (PGCD g): what is wrong in it, said by its own arithmetic. */
function checkList(q, v, fix) {
  const xs = listed(v);
  const all = divisorsOf(q.g);
  if (xs.length < BOXES && xs.every((x) => all.includes(x)) && new Set(xs).size === xs.length)
    return { ok: false, hint: `ينقص ${BOXES - xs.length} من القواسم المشتركة: املأ كلّ الخانات.`, fix };
  if (!xs.every((x) => Number.isInteger(x) && x >= 1))
    return { ok: false, hint: 'اكتب أعدادًا طبيعية غير معدومة.', fix };
  if (new Set(xs).size !== xs.length) return { ok: false, hint: 'كتبتَ قاسمًا مرّتين: كلّ قاسم مرّة واحدة.', fix };
  const bad = xs.find((x) => !all.includes(x));
  if (bad != null) {
    const { a, b } = q;
    const hint =
      a % bad === 0
        ? `${bad} يقسم ${a}، لكن ${leaves(b, bad)}: ليس قاسمًا مشتركًا.`
        : b % bad === 0
          ? `${bad} يقسم ${b}، لكن ${leaves(a, bad)}: ليس قاسمًا مشتركًا.`
          : `${leaves(a, bad)}: ${bad} لا يقسم ${a}.`;
    return { ok: false, hint, fix };
  }
  return { ok: true, fix };
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
    case 'commonList': {
      const { a, b } = q;
      const fix = `قواسم ${a}: ${listAr(divisorsOf(a))}. قواسم ${b}: ${listAr(divisorsOf(b))}. القواسم المشتركة: ${listAr(commonDivisors(a, b))}.`;
      return checkList(q, v, fix);
    }
    case 'nestList': {
      const { a, b, g } = q;
      const fix = `القواسم المشتركة للعددين ${a} و ${b} هي قواسم $${pgcdTex(a, b)} = ${g}$: ${listAr(divisorsOf(g))}.`;
      return checkList(q, v, fix);
    }
    case 'pgcd': {
      const { a, b, g } = q;
      const fix = `$${a} = ${g} \\times ${a / g}$ و $${b} = ${g} \\times ${b / g}$، و ${a / g} و ${b / g} لا يشتركان إلّا في القاسم 1: $${pgcdTex(a, b)} = ${g}$.`;
      if (!whole('g') || n('g') < 1) return { ok: false, hint: 'اكتب عددًا طبيعيًّا غير معدوم.', fix };
      const m = n('g');
      if (m === g) return { ok: true, fix };
      if (a % m === 0 && b % m === 0)
        return {
          ok: false,
          hint: `${m} قاسم مشترك، لكن $${a} = ${m} \\times ${a / m}$ و $${b} = ${m} \\times ${b / m}$: العددان ${a / m} و ${b / m} يشتركان بعد في قاسم غير 1.`,
          fix,
        };
      return {
        ok: false,
        hint: a % m ? `${leaves(a, m)}: ${m} لا يقسم ${a}.` : `${leaves(b, m)}: ${m} لا يقسم ${b}.`,
        fix,
      };
    }
    case 'bouquets': {
      const { a, b, g, p } = q;
      const fix = `$${pgcdTex(a, b)} = ${g}$: ${counted(g, BOUQUETS)}، في كلّ واحدة ${counted(p, ROSES)} و ${counted(q.q, LILIES)} ($${a} = ${g} \\times ${p}$ و $${b} = ${g} \\times ${q.q}$).`;
      if (!whole('n', 'x', 'y') || n('n') < 1) return { ok: false, hint: 'املأ الخانات الثلاث بأعداد طبيعية.', fix };
      const m = n('n');
      if (a % m || b % m)
        return {
          ok: false,
          hint: a % m ? `${leaves(a, m)}: تبقى ورود دون باقة.` : `${leaves(b, m)}: تبقى زنابق دون باقة.`,
          fix,
        };
      if (m !== g)
        return { ok: false, hint: `${m} يصلح عددًا للباقات، لكن هل هو أكبر عدد؟ ابحث عن أكبر قاسم مشترك.`, fix };
      if (n('x') * m !== a || n('y') * m !== b)
        return {
          ok: false,
          hint: `تحقّق: $${m} \\times ${n('x')} = ${m * n('x')}$ و $${m} \\times ${n('y')} = ${m * n('y')}$، والزهور ${a} و ${b}.`,
          fix,
        };
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
    case 'commonList':
    case 'nestList':
      return listAr(listed(v)) || '…';
    case 'pgcd':
      return `$${pgcdTex(q.a, q.b)} = ${v?.g ?? '…'}$`;
    case 'bouquets':
      return `عدد الباقات ${v?.n ?? '…'}، في كلّ باقة ${v?.x ?? '…'} من الورود و ${v?.y ?? '…'} من الزنابق`;
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
