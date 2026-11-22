// The walks of lesson 8 `ikhtizal-kasr` — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files
// cannot say — the walk's own arithmetic of each verdict, and the words no screen may show before their tablet. The
// first lesson on BRIDGES WITH A LIT STRETCH (`divisorIsles/mark.js`): the library plays them (story.mjs › marked).
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs ikhtizal-kasr [story|hub|trainer|board|launch|sitting|all] [outDir]
import { gcd, divisions } from '../lib/lessonWalk.mjs';

const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number);
/** The irreducible form of n/d. */
const reduce = (n, d) => [n / gcd(n, d), d / gcd(n, d)];
const same = (x, y) => x[0] === y[0] && x[1] === y[1];
/** The smallest common divisor of x and y other than 1, or null. */
const smallest = (x, y) => {
  for (let k = 2; k <= Math.min(x, y); k += 1) if (x % k === 0 && y % k === 0) return k;
  return null;
};
/** Row i of Euclid's divisions as the last step names its boxes: a_i, b_i, q_i, r_i. */
const row = (D, i) => ({ [`a${i}`]: D[i - 1].a, [`b${i}`]: D[i - 1].b, [`q${i}`]: D[i - 1].q, [`r${i}`]: D[i - 1].r });
/** x op y on fractions [n, d] — the result as it comes, not reduced. */
const calc = (op, [a, b], [c, d]) =>
  op === '×' ? [a * c, b * d] : op === '+' ? (b === d ? [a + c, b] : null) : b === d ? [a - c, b] : null;
/** The right gate of a marhala wave / say: one term divided by k, the other asked. */
const stage = (a, b, shown, numeratorAsked) => (numeratorAsked ? a / (b / shown) : b / (a / shown));

export default {
  id: 'ikhtizal-kasr',
  uid: 9800,
  forbidden: {
    'ikhtizal-marahil': ['على مراحل', 'نختزل'],
    'ghayr-qabil': ['غير قابل للاختزال', 'غير القابل للاختزال', 'أوّليّين'],
    'ikhtizal-pgcd': ['بالقاسم المشترك الأكبر'],
    'natija-mukhtazala': ['نتيجة الحساب'],
  },
  benchForbidden: ['PGCD', 'الأكبر', 'أطول', 'قابل للاختزال', 'مختزل'],
  // C: 99 fills and misses the post; D: 81 misses the post, 9 runs out of coins
  story: { markMiss: ['thuluth', 'tusu'], purseOut: ['tusu'] },
  truth: {
    'ikhtizal-marahil': (c) => c.L * c.q === c.p * c.W,
    'ghayr-qabil': (c) => gcd(c.L, c.W) === 1,
    'ikhtizal-pgcd': (c) => same([c.p, c.q], reduce(c.L, c.W)),
    'natija-mukhtazala': (c) => same([c.p, c.q], reduce(c.s1 + c.s2, c.W)),
  },
  use: {
    // two writings, each both terms divided by the same number: the smallest common divisor, then the PGCD of what is left
    'ikhtizal-marahil': (u) => {
      const k = smallest(u.L, u.W);
      const [n1, d1] = [u.L / k, u.W / k];
      const g = gcd(n1, d1);
      return { n1, d1, n2: n1 / g, d2: d1 / g };
    },
    'ghayr-qabil': (u) => ({ g: gcd(u.L, u.W), verdict: gcd(u.L, u.W) === 1 ? 'yes' : 'no' }),
    'ikhtizal-pgcd': (u) => {
      const D = divisions(u.W, u.L);
      const g = gcd(u.L, u.W);
      return { q1: D[0].q, r1: D[0].r, ...row(D, 2), ...row(D, 3), g, n: u.L / g, d: u.W / g };
    },
    'natija-mukhtazala': (u) => {
      const [s, w] = calc(u.op, u.a, u.b);
      const [n, d] = reduce(s, w);
      return { s, w, n, d };
    },
  },
  dash: (say, x) => {
    const v = nums(say);
    if (/يجعل/.test(say)) return x >= 1 && gcd(x, v[0]) === 1; // a term that makes the fraction irreducible
    if (/على الشكل/.test(say)) {
      const [a, b] = v;
      return x === (/^بسط/.test(say) ? a : b) / gcd(a, b);
    }
    if (/[+-]/.test(say.replace(/\\frac/g, ''))) {
      const [p, n, q] = v;
      const s = /\+/.test(say) ? p + q : p - q;
      return x === n / gcd(s, n);
    }
    const [a, b, shown] = v; // « a/b = shown/□ » or « a/b = □/shown »
    return x === stage(a, b, shown, /\\frac\{\\square\}/.test(say));
  },
  // 273 − 7 × 3 = 252: the cells still open when the purse stops the store's planks of 3 (the world writes it)
  ownNumbers: [252],
  gate: {
    marhala: (w, x) => x === (w.side === 'd' ? w.b : w.a) / w.k,
    ghayrW: (w, x) => x >= 1 && x !== w.n && gcd(x, w.n) === 1,
    pgcdW: (w, x) => x === (w.side === 'd' ? w.b : w.a) / gcd(w.a, w.b),
    natijaW: (w, x) => x === w.n / gcd(w.op === '+' ? w.x + w.y : w.x - w.y, w.n),
  },
  // the learning net gives TWO core tools: the PGCD (lesson 7's family) then the equal fractions of 1AM
  launch: {
    scenario: 'pair',
    tools: [
      {
        item: '4am.m1.r03',
        name: 'القاسم المشترك الأكبر لعددين',
        year: 'من السنة الرابعة متوسط',
        home: 'القاسم المشترك الأكبر',
        second: 'sort',
        firstOk: (q) => q.calc?.op === 'pgcd' && Math.max(q.calc.x, q.calc.y) <= 15,
      },
      {
        item: '1am.m5.r02',
        name: 'الكسور المتساوية',
        year: 'من السنة الأولى',
        home: 'الكتابات الكسرية لحاصل قسمة واختزال كسر',
        // the second easy question: the level-1 « equal » form, a SORT of three equalities of fractions
        second: 'sort',
        // the very first question (`families.js › fracWrite`, first): n/d = p/▢, both terms divided by 2, d ≤ 10
        firstOk: (q) => q.calc?.op === 'frac' && q.calc.side === 'bottom' && q.calc.d <= 10,
      },
    ],
  },
  solve: {
    marahil: (q) => ({ p1: q.a / q.d, q1: q.b / q.d, p2: q.a / q.d / q.e, q2: q.b / q.d / q.e }),
    hukm: (q) => ({ g: gcd(q.a, q.b), verdict: gcd(q.a, q.b) === 1 ? 'irr' : 'red' }),
    mukhtazal: (q) => {
      const g = gcd(q.a, q.b);
      return { g, p: q.a / g, q: q.b / g };
    },
    hisab: (q) => {
      const [s, t] = calc(q.op === '-' ? '−' : q.op, [q.x, q.y], [q.z, q.w]).map(Number);
      const [p, r] = reduce(s, t);
      return { s, t, p, q: r };
    },
  },
};
