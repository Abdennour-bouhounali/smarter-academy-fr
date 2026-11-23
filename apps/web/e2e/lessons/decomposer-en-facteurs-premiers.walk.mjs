// The walks of the first French lesson `decomposer-en-facteurs-premiers` (3e, « Décomposer un nombre en facteurs
// premiers », world `divisor-isles`) — a DESCRIPTOR for lib/lessonWalk (README there): only what the lesson's files
// cannot say — the walk's own arithmetic of each verdict, and the words no screen may show before their tablet.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs decomposer-en-facteurs-premiers [story|hub|trainer|board|launch|sitting|all] [outDir]
import { getItem } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import { isPrime, primeFactorsOf } from '../lib/lessonWalk/experiments.mjs';

const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number);
const prod = (xs) => xs.reduce((p, x) => p * x, 1);
/** The smallest prime that divides n ≥ 2. */
const spf = (n) => primeFactorsOf(n)[0];
/** The largest prime p with p × p ⩽ n: the last division to try before saying n is prime. */
const lastPrime = (n) => {
  let last = null;
  for (let p = 2; p * p <= n; p += 1) if (isPrime(p)) last = p;
  return last;
};
/** The exponent of p in n. */
const expOf = (n, p) => primeFactorsOf(n).filter((x) => x === p).length;
/** The divisions to try before saying n is prime stop at ⌊√n⌋ (a program that tries d = 2, 3, 4…). */
const isqrt = (n) => {
  let d = 0;
  while ((d + 1) * (d + 1) <= n) d += 1;
  return d;
};

/**
 * The value of a product written in LaTeX as the lesson writes it — « 2^{3} \times 3^2 \times 7 », « 1\,400 » — with
 * `\square` read as x: the walk's OWN reading of a sentence, never the wave's answer.
 */
function texValue(side, x) {
  const t = side.replace(/\\square/g, String(x)).replace(/\\,|\s|\$/g, '');
  return t.split('\\times').reduce((v, term) => {
    const m = term.match(/^(\d+)(?:\^\{?(\d+)\}?)?$/);
    return m ? v * Number(m[1]) ** Number(m[2] ?? 1) : NaN;
  }, 1);
}
/** « $a = b$ » with □ = x: both sides equal? */
const holds = (tex, x) => {
  const [l, r] = tex.replace(/\$/g, '').split('=');
  return texValue(l, x) === texValue(r, x);
};
/** The value of the decomposition a sentence writes between $…$ (« Un diviseur de $2^{3} \times 5$ »). */
const decompIn = (say) => texValue(say.match(/\$([^$]*)\$/)[1], 0);

/** A sentence of « Vrai ou faux ? » as plain text: no `$`, × for \times, French thousands joined (« 1 309 » → 1309). */
const clean = (t) =>
  String(t)
    .replace(/\$/g, '')
    .replace(/\\times/g, '×')
    .replace(/\\,/g, '')
    .replace(/[  ]/g, ' ')
    .replace(/(\d) (?=\d{3}\b)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
/** A product « 2^{3} × 5 × 7 » (+ r): its value, NaN when it is not one. */
const sideValue = (s) => {
  const [p, plus] = s.split('+');
  const v = p.split('×').reduce((x, term) => {
    const m = term.trim().match(/^(\d+)(?:\^\{?(\d+)\}?)?$/);
    return m ? x * Number(m[1]) ** Number(m[2] ?? 1) : NaN;
  }, 1);
  return plus == null ? v : v + Number(plus.trim());
};
/** Every chain of equalities « A = B = C » in the text holds. */
const equalitiesHold = (t) => {
  for (const m of t.matchAll(/[\d^{}×+ ]+(?:=[\d^{}×+ ]+)+/g)) {
    const vals = m[0]
      .split('=')
      .map((x) => x.trim())
      .filter(Boolean)
      .map(sideValue);
    if (vals.length >= 2 && !vals.some(Number.isNaN) && !vals.every((v) => v === vals[0])) return false;
  }
  return true;
};
/** Is a reason of « Justifie » TRUE? Its equalities, its « x est un nombre premier », « x n’est pas premier »,
 * « a, b et c sont des nombres premiers, et leur produit vaut n », « d (ne) divise (pas) n ». */
function reasonTrue(text) {
  const t = clean(text);
  if (!equalitiesHold(t)) return false;
  for (const m of t.matchAll(/(\d+) est un nombre premier/g)) if (!isPrime(Number(m[1]))) return false;
  // « 25 = 5 × 5 n’est pas premier »: the subject is the first number of the equality before it
  for (const m of t.matchAll(/(\d+)(?: = [\d ×^{}]+?)? n[’']est pas premier/g)) if (isPrime(Number(m[1]))) return false;
  for (const m of t.matchAll(/((?:\d+, )*\d+ et \d+) sont des nombres premiers(?:, et leur produit vaut (\d+))?/g)) {
    const xs = nums(m[1]);
    if (!xs.every(isPrime) || (m[2] && prod(xs) !== Number(m[2]))) return false;
  }
  for (const m of t.matchAll(/(\d+) (ne divise pas|divise) (\d+)/g))
    if ((Number(m[3]) % Number(m[1]) === 0) === (m[2] !== 'divise')) return false;
  return true;
}
/** Is a statement of « Vrai ou faux ? » true — the walk's own reading of each form the lesson writes (null: unknown). */
function statementTrue(text) {
  const t = clean(text);
  let m;
  if ((m = t.match(/^(\d+) = (.+) est une décomposition en facteurs premiers$/))) {
    const fs = m[2].split('×').map((x) => Number(x.trim()));
    return prod(fs) === Number(m[1]) && fs.every(isPrime);
  }
  if ((m = t.match(/^(\d+) divise (.+)$/))) return sideValue(m[2]) % Number(m[1]) === 0;
  if ((m = t.match(/^Pour savoir si (\d+) est premier, il suffit d[’']essayer les divisions par (.+)$/))) {
    const n = Number(m[1]);
    const listed = nums(m[2]);
    const owed = [];
    for (let p = 2; p * p <= n; p += 1) if (isPrime(p)) owed.push(p);
    return owed.every((p) => listed.includes(p));
  }
  if ((m = t.match(/^(\d+) est un nombre premier$/))) return isPrime(Number(m[1]));
  // « if the cell =MOD(n;p) shows 0, then p divides n »: a remainder 0 IS « p divides n »
  if (/^Si la cellule .*MOD\(\d+;\d+\).* affiche 0, alors \d+ divise \d+$/.test(t)) return true;
  if ((m = t.match(/^(\d+) se termine par \d : c[’']est donc un nombre premier$/))) return isPrime(Number(m[1]));
  if (/=/.test(t)) return equalitiesHold(t);
  return null;
}

/** A gate of a wave of the practice or of the trainer, by its type — computed from the sentence and the wave's question. */
const GATE = {
  smallestPrime: (x, n) => n === spf(nums(x.say)[0]),
  missingFactor: (x, n) => isPrime(n) && holds(x.say, n),
  powerValue: (x, n) => holds(x.say, n),
  exponent: (x, n) => n >= 1 && holds(x.say, n),
  divisorOfPow: (x, n) => n >= 1 && decompIn(x.say) % n === 0,
  lastPrime: (x, n) => n === lastPrime(nums(x.say)[0]),
  primeAmong: (x, n) => isPrime(n),
  modCell: (x, n) => {
    const [a, b] = nums(x.say.match(/MOD\(([^)]*)\)/)[1]);
    return n === a % b;
  },
  programStop: (x, n) => n === isqrt(nums(x.say.split('leqslant')[1])[0]),
};

export default {
  id: 'decomposer-en-facteurs-premiers',
  uid: 9300,
  // the words of each key's name (its tablet's title is added by the library)
  forbidden: {
    'plus-petit-premier': ['facteurs premiers', 'facteur premier', 'décomposition', 'Décomposer'],
    puissances: ['puissance', 'exposant'],
    arret: ['s’arrêter', 'où s’arrêter', 'carré du diviseur'],
    tableur: ['tableur', 'programme'],
  },
  benchForbidden: ['facteur premier', 'exposant', 'tableur'],
  // the first bridge and the first workshop: a plank that leaves cells falls first; a reload on island B
  story: { fallFirst: ['g60', 'g91'], reloadOn: 1 },
  // the false rules played first (each one a rule students hold — forges.test.js)
  falseTiles: {
    'plus-petit-premier': ['which:big', 'again:again', 'stop:one'],
    puissances: ['read:both', 'join:times'],
    arret: ['kind:primes', 'what:self', 'cond:n'],
    tableur: ['read:units', 'then:again'],
  },
  truth: {
    // a ladder goes to the end: its planks multiply to the number and none breaks into shorter planks
    'plus-petit-premier': (c) => prod(c.planks) === c.n && c.planks.every(isPrime),
    // a writing gives the number back
    puissances: (c) => prod(c.w.map((f) => f.p ** f.e)) === c.n,
    // to know whether a is prime, the plank b must be tried: b is prime and b × b ⩽ a
    arret: (c) => isPrime(c.b) && c.b * c.b <= c.a,
    // the numbers a reading of the sheet gave are all prime (and multiply to the number)
    tableur: (c) => c.planks.every(isPrime) && prod(c.planks) === c.n,
  },
  use: {
    // the ladder of the number, a rung per line: d_i the plank laid, n_i what is left
    'plus-petit-premier': (c) => {
      const f = primeFactorsOf(c.n);
      const out = {};
      let x = c.n;
      f.forEach((p, i) => {
        if (i > 0) out[`n${i + 1}`] = x;
        out[`d${i + 1}`] = p;
        x /= p;
      });
      return out;
    },
    puissances: (c) => ({ e2: expOf(c.n, 2), e5: expOf(c.n, 5), verdict: c.n % c.d === 0 ? 'yes' : 'no' }),
    arret: (c) => {
      const p = isPrime(c.a) ? 1 : spf(c.a);
      return { p, q: c.a / p, verdict: isPrime(c.a) ? 'yes' : 'no' };
    },
    // the program keeps d after a division: when N becomes n ÷ (its smallest prime), it tries that prime again
    tableur: (c) => {
      const f = primeFactorsOf(c.n);
      return { d: f[0], ...Object.fromEntries(f.map((p, i) => [`f${i + 1}`, p])) };
    },
  },
  dash: (say, n) => {
    if (/plus petit nombre premier qui divise/.test(say)) return n === spf(nums(say)[0]);
    if (/dernier nombre premier à essayer/.test(say)) return n === lastPrime(nums(say)[0]);
    if (/^Un nombre premier$/.test(say.trim())) return isPrime(n);
    return holds(say, n);
  },
  gate: GATE,
  statement: statementTrue,
  reasonTrue,
  solve: {
    decompose: (q) => Object.fromEntries(primeFactorsOf(q.a).map((p, i) => [`f${i + 1}`, p])),
    big: (q) => Object.fromEntries(primeFactorsOf(q.a).map((p, i) => [`f${i + 1}`, p])),
    powers: (q) => Object.fromEntries(q.primes.map((p) => [`e${p}`, expOf(q.a, p)])),
    // A ÷ d from the two decompositions shown, never from A's value
    quotient: (q) =>
      Object.fromEntries(
        q.fs.map((f) => [`e${f.p}`, f.e - (q.ds.find((g) => g.p === f.p)?.e ?? 0)]).filter(([, e]) => e > 0),
      ),
    prime: (q) => ({ d: isqrt(q.a), says: isPrime(q.a) ? 'oui' : 'non' }),
    // the program: d = 2; while d × d ⩽ N: if d divides N, note d and N ← N ÷ d, else d + 1
    trace: (q) => {
      let N = q.a;
      let d = 2;
      let first = null;
      let after = null;
      while (d * d <= N) {
        if (N % d === 0) {
          if (first == null) {
            first = d;
            after = N / d;
          }
          N /= d;
        } else d += 1;
      }
      return { first, after, stop: d };
    },
  },
  // the learning net gives this lesson ONE tool: the 4e item « décomposer un petit nombre »
  launch: {
    scenario: 'one',
    tool: {
      item: '4e.m1.r06',
      name: 'Nombres premiers et produits',
      year: 'vu en 4e',
      // no lesson of the 4e is written yet: « Revois d’abord » names the item of the learning net itself
      home: getItem('4e.m1.r06').text,
      memo: 4,
      // the level-1 « primes » form is a SORT of three numbers
      second: 'sort',
      firstOk: (q) => q.calc?.op === 'factor' && q.calc.n <= 12,
    },
  },
};
