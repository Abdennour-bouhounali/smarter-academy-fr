// The walks of lesson 5 `tayin-pgcd` — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files cannot
// say — the walk's own arithmetic of each verdict, and the words no screen may show before their tablet.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs tayin-pgcd [story|hub|trainer|board|launch|sitting|all] [outDir]
import { gcd, divisors, common } from '../lib/lessonWalk.mjs';

const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number);
const held = (c) => c.d === gcd(c.A, c.B); // the plank builds both gaps with the purse: their longest common plank
const listed = (p, n) => Object.fromEntries(divisors(n).map((d, i) => [`${p}${i}`, d]));

export default {
  id: 'tayin-pgcd',
  uid: 9600,
  forbidden: {
    'hasr-wa-taqatu': ['قاسم', 'قواسم', 'مشترك', 'PGCD', 'احصر', 'قاطع'],
    'nataij-mubashira': ['مباشرة'],
    'b-yaqsim-a': ['يقسم'],
  },
  benchForbidden: ['الأكبر', 'أطول'],
  story: { wrongFirst: ['lists'], purseOut: ['lists', 'same', 'full', 'nest'], reloadOn: 1 },
  truth: { 'hasr-wa-taqatu': held, 'nataij-mubashira': held, 'b-yaqsim-a': held },
  use: {
    'hasr-wa-taqatu': (u) => {
      const set = (p, list) => Object.fromEntries(list.map((d, i) => [`${p}${i + 1}`, d]));
      return {
        ...set('a', divisors(u.A)),
        ...set('b', divisors(u.B)),
        ...set('c', common(u.A, u.B)),
        g: gcd(u.A, u.B),
      };
    },
    'nataij-mubashira': (u) => ({ s: u.same, z: u.zero, o: 1, t: gcd(...u.turn) }),
    'b-yaqsim-a': (u) => ({ q: u.A / u.B, g: u.B }),
  },
  dash: (say, n) => {
    const [a, b] = nums(say);
    return /PGCD/.test(say) ? n === gcd(a, b) : n >= 1 && a % n === 0 && b % n === 0;
  },
  gate: {
    commonDivisor: (x, n) => n >= 1 && x.a % n === 0 && x.b % n === 0,
    pgcd: (x, n) => n === gcd(x.a, x.b),
    missing: (x, n) => n * x.b === x.a,
  },
  solve: {
    hasr: (q) => ({ ...listed('x', q.a), ...listed('y', q.b), g: gcd(q.a, q.b) }),
    direct: (q) => ({ s: q.a, z: q.a, o: gcd(...q.third.pair) }),
    yaqsim: (q) => ({ k: q.a / q.b, g: q.b }),
  },
  /** « صحيح أم خطأ؟ »: the truth of a statement, from its own words and numbers. */
  statement: (t) => {
    let m = /^PGCD\((\d+) ; (\d+)\) = PGCD\((\d+) ; (\d+)\)$/.exec(t);
    if (m) return gcd(+m[1], +m[2]) === gcd(+m[3], +m[4]);
    m = /^PGCD\((\d+) ; (\d+)\) = (\d+)$/.exec(t);
    if (m) return gcd(+m[1], +m[2]) === +m[3];
    m = /^(\d+) يقسم (\d+)، إذن PGCD\((\d+) ; (\d+)\) = (\d+)$/.exec(t);
    if (m) return +m[2] % +m[1] === 0 && gcd(+m[3], +m[4]) === +m[5];
    throw new Error(`the walk cannot read the statement « ${t} »`);
  },
  launch: { scenario: 'lists' },
};
