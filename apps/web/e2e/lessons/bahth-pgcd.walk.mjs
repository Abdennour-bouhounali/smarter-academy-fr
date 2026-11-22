// The walks of lesson 6 `bahth-pgcd` — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot
// say — the walk's own arithmetic of each verdict, and the words no screen may show before their tablet.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs bahth-pgcd [story|hub|trainer|board|launch|sitting|all] [outDir]
import { gcd, divisions, subtractions } from '../lib/lessonWalk.mjs';

const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number);
const both = (c) => c.A % c.d === 0 && c.B % c.d === 0; // ➖ 🧮: the plank builds both gaps
const longest = (c) => c.d === gcd(c.A, c.B); // 🪜 🔁: …with the purse
const isGcd = (x, n) => n === gcd(x.a, x.b);
const first = (a, b) => divisions(a, b)[0];
/** Row i of Euclid's divisions as the last step names its boxes: a_i, b_i, q_i, r_i. */
const row = (D, i) => ({ [`a${i}`]: D[i - 1].a, [`b${i}`]: D[i - 1].b, [`q${i}`]: D[i - 1].q, [`r${i}`]: D[i - 1].r });

export default {
  id: 'bahth-pgcd',
  uid: 9700,
  forbidden: {
    'farq-yabqi': ['PGCD', 'يحفظ'],
    'khawarizmiyat-al-tarh': ['خوارزمي'],
    'baqi-yabqi': ['الباقي يحفظ'],
    iqlidis: ['إقليدس'],
    'aqall-khutuwat': ['أسرع'],
  },
  benchForbidden: ['PGCD', 'خوارزمي', 'إقليدس', 'أسرع', 'أطول', 'الأكبر', 'قاسم', 'آخر فرق', 'آخر باق'],
  story: { wrongFirst: ['diff'], purseOut: ['iqlidis'], reloadOn: 2 },
  notBridge: ['aqall-khutuwat'],
  truth: {
    'farq-yabqi': both,
    'khawarizmiyat-al-tarh': longest,
    'baqi-yabqi': both,
    iqlidis: longest,
    'aqall-khutuwat': (c) => {
      const [S, D] = [subtractions(c.A, c.B).length, divisions(c.A, c.B).length];
      return c.kind === 'pick' ? D > S : S - D === c.k;
    },
  },
  use: {
    'farq-yabqi': (u) => ({ d: u.A - u.B, p: u.A - u.B, g: gcd(u.A, u.B) }),
    'khawarizmiyat-al-tarh': (u) => {
      const S = subtractions(u.A, u.B);
      return { d1: S[0].d, x2: S[1].x, y2: S[1].y, d2: S[1].d, x3: S[2].x, y3: S[2].y, d3: S[2].d, g: gcd(u.A, u.B) };
    },
    'baqi-yabqi': (u) => ({ q: first(u.A, u.B).q, r: first(u.A, u.B).r, p: first(u.A, u.B).r, g: gcd(u.A, u.B) }),
    iqlidis: (u) => {
      const D = divisions(u.A, u.B);
      return { q1: D[0].q, r1: D[0].r, ...row(D, 2), ...row(D, 3), g: gcd(u.A, u.B) };
    },
    'aqall-khutuwat': (u) => {
      const [d1, d2] = divisions(u.A, u.B);
      return { q1: d1.q, r1: d1.r, b2: d2.b, q2: d2.q, r2: d2.r, s: subtractions(u.A, u.B).length, g: gcd(u.A, u.B) };
    },
  },
  dash: (say, n) => {
    const [a, b, c] = nums(say);
    if (/الطرح/.test(say)) return n === subtractions(a, b).length;
    if (/القسمات/.test(say)) return n === divisions(a, b).length;
    if (/\\square\)/.test(say)) return n >= 1 && gcd(c, n) === gcd(a, b);
    return n === gcd(a, b);
  },
  gate: {
    pgcdBox: (x, n) => n >= 1 && gcd(x.b, n) === gcd(x.a, x.b),
    remainder: (x, n) => n === x.a % x.b,
    lastDiff: isGcd,
    lastRest: isGcd,
    pgcd: isGcd,
    divCount: (x, n) => n === divisions(x.a, x.b).length,
    subCount: (x, n) => n === subtractions(x.a, x.b).length,
  },
  solve: {
    farq: (q) => ({ e: q.a - q.b, g: gcd(q.a, q.b) }),
    furuq: (q) => ({ d: q.a - q.b, g: gcd(q.a, q.b) }),
    baqi: (q) => ({ q: first(q.a, q.b).q, r: first(q.a, q.b).r, e: first(q.a, q.b).r }),
    iqlidis: (q) => ({ q: first(q.a, q.b).q, r: first(q.a, q.b).r, g: gcd(q.a, q.b) }),
    sura: (q) => ({ e: divisions(q.a, q.b).length, s: subtractions(q.a, q.b).length, fast: 'euclid' }),
  },
  train: ['farq', 'baqi', 'muqarana', 'khulasa'],
  launch: { scenario: 'lists' },
};
