import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { getItem } from '@smarter-academy/core/curriculum/dz/net/learningNet.js';
import {
  compare,
  equal,
  magnitude,
  minus,
  read,
  rootOf,
  square,
  tex,
  times,
  write,
} from '../../lessons/common/gameworld/rootCourts/logic';

/**
 * THE DEFAULT CLASS TESTS (content/class-tests/**): a teacher projects them in front of his class, so a default test never
 * ships a wrong answer. Every question carries a `check`; its answer is RE-COMPUTED here, and for a choice every other
 * option is proved wrong.
 */
const ROOT = new URL('../../../../../content/class-tests/', import.meta.url);
const files = readdirSync(ROOT, { recursive: true })
  .filter((f) => String(f).endsWith('.json'))
  .map((f) => ({ name: String(f), data: JSON.parse(readFileSync(new URL(String(f), ROOT), 'utf8')) }));

/** « $47 = 6 \times 7 + 5$ » → { a, b, q, sign, r }, or null. */
const eq = (text) => {
  const m = String(text).match(/^\$(\d+) = (\d+) \\times (\d+)(?: ([+-]) (\d+))?\$$/);
  return m ? { a: +m[1], b: +m[2], q: +m[3], sign: m[4] ?? '+', r: +(m[5] ?? 0) } : null;
};
const FORMS = {
  a_divides_b: { text: (a, b) => `${a} قاسم للعدد ${b}`, holds: (a, b) => b % a === 0 },
  b_divides_a: { text: (a, b) => `${b} قاسم للعدد ${a}`, holds: (a, b) => a % b === 0 },
  a_multiple_of_b: { text: (a, b) => `${a} مضاعف للعدد ${b}`, holds: (a, b) => a % b === 0 },
  b_multiple_of_a: { text: (a, b) => `${b} مضاعف للعدد ${a}`, holds: (a, b) => b % a === 0 },
};
/** What an equality a = b × q lets us conclude, in the three ways students say it — one is right. */
const FACTOR_FORMS = {
  both: { text: (a, b, q) => `${b} و ${q} قاسمان للعدد ${a}`, holds: true },
  onlyFirst: { text: (a, b) => `${b} قاسم للعدد ${a} فقط`, holds: false },
  reversed: { text: (a, b, q) => `${a} قاسم للعددين ${b} و ${q}`, holds: false },
};
const divisorsOf = (a) => Array.from({ length: a }, (_, i) => i + 1).filter((d) => a % d === 0);
const gcd = (x, y) => (y ? gcd(y, x % y) : x);
/** The divisors two numbers share, smallest first. */
const commonOf = (a, b) => divisorsOf(Math.min(a, b)).filter((d) => a % d === 0 && b % d === 0);
/** « 1 ، 3 ، 9 » → [1, 3, 9]. */
const listOf = (text) =>
  String(text)
    .split('،')
    .map((x) => Number(x.trim()));
/** The last number to try when listing the divisors of a: the biggest one whose square does not pass a. */
const lastToTry = (a) => Math.floor(Math.sqrt(a));
/** The facts « d divides a and b » that a property question stands on. */
const common = (q, c) => {
  expect(c.a % c.d, `${q.id}: ${c.d} must divide ${c.a}`).toBe(0);
  expect(c.b % c.d, `${q.id}: ${c.d} must divide ${c.b}`).toBe(0);
};
/** The forms of a sentence about the remainder r of a by b, when d divides a and b. */
const REST_FORMS = {
  divides: { text: (d, r) => `${d} قاسم للعدد ${r}`, holds: (d, r) => r % d === 0 },
  not: { text: (d, r) => `${d} ليس قاسمًا للعدد ${r}`, holds: (d, r) => r % d !== 0 },
  unknown: { text: (d, r) => `لا يمكن أن نعرف إن كان ${d} قاسمًا للعدد ${r}`, holds: () => false }, // d divides r: we know
};
/**
 * A proof with letters « $<expr> = <rhs>$ », a = d × k and b = d × m: it proves that d divides <expr> when <rhs> is d times
 * a bracket AND equals <expr> for every k > m tried (computed here, never read from the answer).
 */
const letterProof = (option, c) => {
  const m = String(option).match(/^\$(.+) = (.+)\$$/);
  if (!m || m[1] !== c.expr) return false;
  const js = (t) => t.replaceAll('\\times', '*');
  const value = (t) => new Function('a', 'b', 'k', 'm', `return ${js(t)};`); // eslint-disable-line no-new-func
  const [lhs, rhs] = [value(m[1]), value(m[2])];
  const same = [
    [5, 2],
    [9, 4],
    [13, 7],
    [3, 0],
  ].every(([k, n]) => lhs(c.d * k, c.d * n, k, n) === rhs(c.d * k, c.d * n, k, n));
  return same && m[2].startsWith(`${c.d} \\times (`) && m[2].endsWith(')');
};
/** The value of « 7 \times 6 + 4 » or « 83 - 47 » (the product before the sum), computed here; NaN for another shape. */
const evalExpr = (expr) => {
  if (!/^\d+(?: (?:\\times|[+-]) \d+)*$/.test(String(expr).trim())) return NaN;
  const value = (t) => t.split(' \\times ').reduce((p, x) => p * Number(x), 1);
  return String(expr)
    .trim()
    .split(' + ')
    .reduce((sum, term) => sum + term.split(' - ').reduce((v, x, i) => (i === 0 ? value(x) : v - value(x)), 0), 0);
};
/** « $lhs = rhs$ » → is it true? */
const equalityHolds = (text) => {
  const m = String(text).match(/^\$(.+) = (.+)\$$/);
  return Boolean(m) && evalExpr(m[1]) === evalExpr(m[2]) && Number.isFinite(evalExpr(m[1]));
};
/** « بين 30 و 40 » → [30, 40]. */
const between = (text) => {
  const m = String(text).match(/^بين (\d+) و (\d+)$/);
  return m ? [+m[1], +m[2]] : null;
};
/** What a divisibility rule READS of a number: the units digit (2, 5, 10), the digit sum (3, 9), the last two digits (4). */
const READS = {
  units: { text: (n) => `رقم آحاده ${n % 10}`, by: [2, 5, 10] },
  sum: {
    text: (n) =>
      `مجموع أرقامه ${String(n)
        .split('')
        .reduce((s, d) => s + Number(d), 0)}`,
    by: [3, 9],
  },
  lastTwo: { text: (n) => `العدد ${n % 100} المكوَّن من رقميه الأخيرين`, by: [4] },
};
/** « $q < a \div b < q + 1$ » or « $a \div b = q$ » about a ÷ b → is it true? (a ÷ b compared as a fraction, never rounded) */
const bracketHolds = (option, a, b) => {
  const lt = String(option).match(/^\$(\d+) < (\d+) \\div (\d+) < (\d+)\$$/);
  if (lt) {
    const [lo, x, y, hi] = lt.slice(1).map(Number);
    return x === a && y === b && hi === lo + 1 && lo * b < a && a < hi * b;
  }
  const eqm = String(option).match(/^\$(\d+) \\div (\d+) = (\d+)\$$/);
  return Boolean(eqm) && +eqm[1] === a && +eqm[2] === b && a === b * +eqm[3];
};
/** The algorithm of successive differences, run here: the smaller taken from the greater, down to 0 — its subtractions. */
const subtractionsOf = (a, b) => {
  let [x, y, n] = [Math.max(a, b), Math.min(a, b), 0];
  while (y > 0) {
    n += 1;
    [x, y] = [Math.max(y, x - y), Math.min(y, x - y)];
  }
  return n;
};
/** Euclid's algorithm, run here: the divisor by the remainder, down to the remainder 0 — its divisions. */
const divisionsOf = (a, b) => {
  let [x, y, n] = [Math.max(a, b), Math.min(a, b), 0];
  while (y > 0) {
    n += 1;
    [x, y] = [y, x % y];
  }
  return n;
};
/** Which algorithm takes fewer steps — each option is one of these forms, written as such. */
const FEWER = {
  euclid: { text: 'خوارزمية إقليدس', holds: (a, b) => divisionsOf(a, b) < subtractionsOf(a, b) },
  differences: { text: 'خوارزمية الفروق المتتابعة', holds: (a, b) => subtractionsOf(a, b) < divisionsOf(a, b) },
  same: { text: 'تأخذان عدد الخطوات نفسه', holds: (a, b) => subtractionsOf(a, b) === divisionsOf(a, b) },
};
/** « $\frac{p}{q}$ » → [p, q], or null. */
const fracOf = (text) => {
  const m = String(text).match(/^\$\\frac\{(\d+)\}\{(\d+)\}\$$/);
  return m ? [+m[1], +m[2]] : null;
};
/** Two fractions of the same value (cross products), computed here. */
const sameValue = ([p, q], [n, d]) => p * d === q * n;
/** « \frac{a}{b} + \frac{c}{d} » (one operator: +, −, ×) → [numerator, denominator], computed here, never reduced. */
const fracExpr = (expr) => {
  const m = String(expr).match(/^\\frac\{(\d+)\}\{(\d+)\} (\+|-|\\times) \\frac\{(\d+)\}\{(\d+)\}$/);
  if (!m) return null;
  const [a, b, op, c, d] = [+m[1], +m[2], m[3], +m[4], +m[5]];
  if (op === '\\times') return [a * c, b * d];
  return [op === '+' ? a * d + c * b : a * d - c * b, b * d];
};
/** Is this option the irreducible form of [n, d]? Equal in value AND its terms share only 1. */
const isReducedOf = (option, nd) => {
  const f = fracOf(option);
  return Boolean(f) && sameValue(f, nd) && gcd(f[0], f[1]) === 1;
};
const shows = (q, ...nums) => {
  for (const n of nums) expect(q.text, `${q.id}: the question shows ${n}`).toContain(String(n));
};

// ── square roots (4AM unit 2, lesson 1): exact arithmetic on text numbers (« 7,94 », « -15 »), never a float ──
/**
 * « $7{,}94$ », « 89 » or « $\\dfrac{5}{7}$ » (a fraction, its sign in front: « $-\\dfrac{9}{64}$ ») → the exact number,
 * or null when the option is not a plain number (« $\\sqrt{63}$ »).
 */
const exactOf = (option) => {
  const t = String(option)
    .replace(/^\$|\$$/g, '')
    .replaceAll('{,}', ',')
    .trim();
  const f = t.match(/^(-?)\\d?frac\{(\d+(?:,\d+)?)\}\{(\d+(?:,\d+)?)\}$/);
  if (f) return read(`${f[1]}${f[2]}/${f[3]}`);
  if (!/^-?\d+(?:,\d+)?$/.test(t)) return null;
  return read(t);
};
/** A number in LaTeX AS IT IS GIVEN: « 50/98 » keeps its terms (never reduced to 25/49), anything else as `tex` writes it. */
const texGiven = (x) => {
  const [n, d] = String(x).split('/');
  return d == null ? tex(x) : `\\dfrac{${tex(n)}}{${tex(d)}}`;
};
/** The number under the sign of an option « $\\sqrt{…}$ » (a decimal or « \\dfrac{n}{d} »), exact; null when it is not one. */
const radicandOf = (option) => {
  const m = String(option).match(/^\$\\sqrt\{(.+)\}\$$/);
  return m ? exactOf(`$${m[1]}$`) : null;
};
/** A number written in a formula: « 57 », « (-27) », « (0{,}4) » — a negative or a decimal in brackets. */
const wrapped = (x) => (/^\d+$/.test(String(x)) ? tex(x) : `(${tex(x)})`);
/** x raised to n, exactly. */
const powerOf = (x, n) => Array.from({ length: n - 1 }).reduce((v) => times(v, x), read(x));
/**
 * A check that COMPUTES one exact value v (or null when none exists among the numbers): a number answers v (a whole
 * number: the board's keypad has digits only), a choice holds exactly the options equal to v, a true-false is the
 * sentence « $<formula> = <claim>$ », written as such in the question.
 */
function valued(q, v, formula) {
  const c = q.check;
  if (q.kind === 'truefalse') {
    // a claim with no formula is written as given: a fraction with its bar (« $\\dfrac{7}{9}$ »), a decimal with its comma
    const said = String(c.claim).includes('/') ? `$${texGiven(c.claim)}$` : String(c.claim).replace('.', ',');
    expect(q.text, q.id).toContain(formula ? `$${formula} = ${tex(c.claim)}$` : said);
    return v != null && equal(c.claim, v);
  }
  if (formula) expect(q.text, q.id).toContain(`$${formula}$`);
  if (q.kind === 'choice') return q.options.map((o) => v != null && exactOf(o) != null && equal(exactOf(o), v));
  expect(v, `${q.id}: a value exists`).not.toBe(null);
  expect(write(v), `${q.id}: a whole number the keypad can type`).toMatch(/^\d{1,6}$/);
  return Number(write(v));
}

/** The truth of each option of a choice (or the value of a number / a true-false), from the `check` alone. */
function truth(q) {
  const c = q.check;
  switch (c.type) {
    // ── the operations (1AM): a product, a difference, « x × y + z » ──
    case 'product':
      shows(q, c.x, c.y);
      return c.x * c.y;
    case 'difference':
      shows(q, c.x, c.y);
      expect(c.x - c.y, `${q.id}: never negative`).toBeGreaterThanOrEqual(0);
      return c.x - c.y;
    case 'equality':
      expect(q.text, q.id).toContain(`$${c.expr}$`);
      return equalityHolds(`$${c.expr}$`);
    case 'valuePick':
      expect(q.text, q.id).toContain(`$${c.expr}$`);
      return q.options.map((o) => Number(o) === evalExpr(c.expr));
    case 'trueEquality':
      return q.options.map((o) => equalityHolds(o));
    // ── the Euclidean division ──
    case 'dividend':
      expect(c.r, `${q.id}: the remainder is smaller than the divisor`).toBeLessThan(c.b);
      shows(q, c.b, c.q, c.r);
      return c.b * c.q + c.r;
    case 'restMax':
      shows(q, c.b);
      return c.b - 1;
    case 'restPick':
      shows(q, c.b);
      return q.options.map((o) => Number(o) < c.b);
    case 'remainderIs':
      shows(q, c.a, c.b);
      return c.a % c.b === c.r;
    case 'euclidIs':
      expect(q.text, q.id).toContain(`$${c.a} = ${c.b} \\times ${c.q} + ${c.r}$`);
      return c.b * c.q + c.r === c.a && c.r < c.b;
    case 'quotientBetween': {
      shows(q, c.a, c.b);
      const k = Math.floor(c.a / c.b);
      return q.options.map((o) => {
        const lohi = between(o);
        return Boolean(lohi) && lohi[0] <= k && k < lohi[1];
      });
    }
    // ── the divisibility rules (1AM) ──
    case 'missingDigit': {
      const fits = Array.from({ length: 10 }, (_, d) => d).filter((d) => Number(`${c.prefix}${d}`) % c.k === 0);
      expect(fits, `${q.id}: exactly one digit fits`).toHaveLength(1);
      shows(q, c.prefix, c.k);
      return fits[0];
    }
    case 'ruleReads':
      shows(q, c.n, c.k);
      return q.options.map((o, i) => {
        const f = READS[c.forms[i]];
        expect(o, `${q.id}: the option is written as its form says`).toBe(f.text(c.n));
        return f.by.includes(c.k);
      });
    // ── bracketing a quotient (2AM) ──
    case 'needed':
      shows(q, c.a, c.b);
      return Math.ceil(c.a / c.b);
    case 'upper':
      shows(q, c.a, c.b);
      expect(c.a % c.b, `${q.id}: a value « by excess » needs a remainder`).not.toBe(0);
      return Math.floor(c.a / c.b) + 1;
    case 'bracket': {
      const [k, r] = [Math.floor(c.a / c.b), c.a % c.b];
      expect(q.text, `${q.id}: the division written is the Euclidean one`).toContain(
        `$${c.a} = ${c.b} \\times ${k} + ${r}$`,
      );
      return q.options.map((o) => bracketHolds(o, c.a, c.b));
    }
    case 'partner':
      expect(c.a % c.b, `${q.id}: ${c.b} must divide ${c.a}`).toBe(0);
      return c.a / c.b;
    case 'divisorCount':
      return divisorsOf(c.a).length;
    case 'stopAt':
      return lastToTry(c.a);
    case 'stopClaim':
      return c.upTo === lastToTry(c.a);
    case 'divisorSet':
      return q.options.map((o) => {
        const mine = String(o)
          .split('،')
          .map((x) => Number(x.trim()));
        return mine.join() === divisorsOf(c.a).join();
      });
    case 'twoDivisors':
      expect(c.a % c.b, `${q.id}: ${c.b} must divide ${c.a}`).toBe(0);
      return q.options.map((o, i) => {
        const f = FACTOR_FORMS[c.forms[i]];
        expect(o, `${q.id}: the option is written as its form says`).toBe(f.text(c.a, c.b, c.a / c.b));
        return f.holds;
      });
    case 'remainder':
      return c.a % c.b;
    case 'quotient':
      return Math.floor(c.a / c.b);
    case 'divisible':
      return c.a % c.k === 0;
    case 'divisor':
      return c.a % c.b === 0;
    case 'restAllowed':
      return c.r < c.b;
    case 'oneAndItself':
      return c.a % 1 === 0 && c.a % c.a === 0;
    case 'euclid':
      return q.options.map((o) => {
        const e = eq(o);
        return Boolean(e) && e.a === c.a && e.b === c.b && e.sign === '+' && e.b * e.q + e.r === e.a && e.r < e.b;
      });
    case 'productProof':
      return q.options.map((o) => {
        const e = eq(o);
        return Boolean(e) && e.a === c.a && e.b === c.b && e.r === 0 && e.b * e.q === e.a;
      });
    case 'pickDivisible':
      return q.options.map((o) => Number(o) % c.k === 0);
    case 'pickDivisor':
      return q.options.map((o) => c.a % Number(o) === 0);
    case 'commonFactor': {
      common(q, c);
      expect(q.text, q.id).toContain(`${c.a} ${c.op} ${c.b} = ${c.d} \\times`);
      const n = c.op === '+' ? c.a + c.b : c.a - c.b;
      expect(n, `${q.id}: a length, never negative`).toBeGreaterThanOrEqual(0);
      return n / c.d;
    }
    case 'multipleFactor':
      expect(c.a % c.d, `${q.id}: ${c.d} must divide ${c.a}`).toBe(0);
      expect(q.text, q.id).toContain(`${c.m} \\times ${c.a} = ${c.d} \\times`);
      return (c.m * c.a) / c.d;
    case 'multipleDivides':
      expect(c.a % c.d, `${q.id}: ${c.d} must divide ${c.a}`).toBe(0);
      expect(q.text, q.id).toContain(`${c.m} \\times ${c.a}`);
      return (c.m * c.a) % c.d === 0;
    case 'converseSum':
      // the sum IS a multiple of d: the sentence tests the converse of the property, not a false premise
      expect((c.a + c.b) % c.d, `${q.id}: ${c.d} must divide ${c.a} + ${c.b}`).toBe(0);
      expect(q.text, q.id).toContain(`$${c.a} + ${c.b}$`);
      return c.a % c.d === 0 && c.b % c.d === 0;
    case 'commonRemainder':
      common(q, c);
      expect((c.a % c.b) % c.d, `${q.id}: ${c.d} divides the remainder`).toBe(0);
      return c.a % c.b;
    case 'remainderShares': {
      common(q, c);
      const [k, r] = [Math.floor(c.a / c.b), c.a % c.b];
      expect(q.text, `${q.id}: the division written is the Euclidean one`).toContain(
        `$${c.a} = ${c.b} \\times ${k} + ${r}$`,
      );
      return q.options.map((o, i) => {
        const f = REST_FORMS[c.forms[i]];
        expect(o, `${q.id}: the option is written as its form says`).toBe(f.text(c.d, r));
        return f.holds(c.d, r);
      });
    }
    case 'letterProof':
      expect(q.text, q.id).toContain(`$${c.expr}$`);
      return q.options.map((o) => letterProof(o, c));
    // ── the PGCD (4AM lesson 4): common divisors, the greatest, a sharing into identical lots ──
    case 'pgcd':
      shows(q, c.a, c.b);
      return gcd(c.a, c.b);
    case 'pgcdPick':
      expect(q.text, q.id).toContain(`$\\mathrm{PGCD}(${c.a} ; ${c.b})$`);
      return q.options.map((o) => Number(o) === gcd(c.a, c.b));
    case 'commonDivisor':
      shows(q, c.d, c.a, c.b);
      return c.a % c.d === 0 && c.b % c.d === 0;
    case 'commonSet':
      shows(q, c.a, c.b);
      return q.options.map((o) => listOf(o).join() === commonOf(c.a, c.b).join());
    case 'pgcdDivisors':
      // the PGCD the question gives is true, and the right list is its divisors — which ARE the common divisors
      expect(gcd(c.a, c.b), `${q.id}: PGCD(${c.a} ; ${c.b})`).toBe(c.g);
      expect(q.text, q.id).toContain(`$\\mathrm{PGCD}(${c.a} ; ${c.b}) = ${c.g}$`);
      expect(divisorsOf(c.g).join()).toBe(commonOf(c.a, c.b).join());
      return q.options.map((o) => listOf(o).join() === divisorsOf(c.g).join());
    case 'pgcdIs':
      // a sentence « PGCD(a ; b) = g », true or false (4AM lesson 5: the direct results, the smaller dividing the greater)
      expect(q.text, q.id).toContain(`$\\mathrm{PGCD}(${c.a} ; ${c.b}) = ${c.g}$`);
      return gcd(c.a, c.b) === c.g;
    // ── the two algorithms (4AM lesson 6): the PGCD kept by a difference or a remainder, the steps of each algorithm ──
    case 'pgcdEqual': {
      // « PGCD(a ; b) = PGCD(c ; d) », true or false; a Euclidean division the question writes beside it is true
      expect(q.text, q.id).toContain(`$\\mathrm{PGCD}(${c.a} ; ${c.b}) = \\mathrm{PGCD}(${c.c} ; ${c.d})$`);
      for (const m of q.text.matchAll(/\$(\d+) = (\d+) \\times (\d+) \+ (\d+)\$/g)) {
        const [a, b, k, r] = m.slice(1).map(Number);
        expect(b * k + r === a && r < b, `${q.id}: « ${m[0]} » is a Euclidean division`).toBe(true);
      }
      return gcd(c.a, c.b) === gcd(c.c, c.d);
    }
    case 'pgcdSame':
      // a pair that keeps the PGCD of (a ; b): each option « $\mathrm{PGCD}(x ; y)$ », judged by Euclid
      shows(q, c.a, c.b);
      return q.options.map((o) => {
        const m = String(o).match(/^\$\\mathrm\{PGCD\}\((\d+) ; (\d+)\)\$$/);
        return Boolean(m) && gcd(+m[1], +m[2]) === gcd(c.a, c.b);
      });
    case 'subtractions':
      shows(q, c.a, c.b);
      return subtractionsOf(c.a, c.b);
    case 'divisions':
      shows(q, c.a, c.b);
      return divisionsOf(c.a, c.b);
    case 'fewerSteps':
      shows(q, c.a, c.b);
      return q.options.map((o, i) => {
        const f = FEWER[c.forms[i]];
        expect(o, `${q.id}: the option is written as its form says`).toBe(f.text);
        return f.holds(c.a, c.b);
      });
    // ── coprime numbers (4AM lesson 7): recognised, proved by their PGCD, disproved by ONE common divisor ──
    case 'coprime':
      // true / false: « a و b أوّليان فيما بينهما » (or « their only common divisor is 1 »), judged by Euclid
      shows(q, c.a, c.b);
      return gcd(c.a, c.b) === 1;
    case 'coprimePick':
      // each option « a و b » is a pair, judged by Euclid: the right one has the PGCD 1
      return q.options.map((o) => {
        const m = String(o).match(/^(\d+) و (\d+)$/);
        return Boolean(m) && gcd(+m[1], +m[2]) === 1;
      });
    case 'witnessPick':
      // a common divisor other than 1: the option divides a AND b, and is not 1
      shows(q, c.a, c.b);
      return q.options.map((o) => Number(o) !== 1 && c.a % Number(o) === 0 && c.b % Number(o) === 0);
    case 'noSmallWitness':
      // « none of 2, 3, 5 divides both, so they are coprime »: the premise is TRUE (checked) and the conclusion FALSE —
      // a common divisor other than 1 exists. The sentence is a proof that proves nothing: always false.
      shows(q, c.a, c.b, ...c.tried);
      for (const d of c.tried) expect(c.a % d === 0 && c.b % d === 0, `${q.id}: ${d} divides both`).toBe(false);
      expect(gcd(c.a, c.b), `${q.id}: a common divisor other than 1 exists`).toBeGreaterThan(1);
      return false;
    // ── reducing a fraction (4AM lesson 8; 1AM's equal fractions): a fraction is written « $\frac{n}{d}$ » ──
    case 'equalFraction':
      // each option a fraction; the right one has the value of n/d (1AM: the same number divides both terms)
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      return q.options.map((o) => Boolean(fracOf(o)) && sameValue(fracOf(o), [c.n, c.d]));
    case 'missingTerm': {
      // « n/d = m/… »: the denominator that keeps the value, a whole number
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}} = \\frac{${c.m}}{\\dots}$`);
      const v = (c.d * c.m) / c.n;
      expect(Number.isInteger(v), `${q.id}: a whole denominator`).toBe(true);
      return v;
    }
    case 'irreducible':
      // « the fraction n/d cannot be reduced », judged by its PGCD
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      return gcd(c.n, c.d) === 1;
    case 'irreduciblePick':
      return q.options.map((o) => Boolean(fracOf(o)) && gcd(...fracOf(o)) === 1);
    case 'oneStep':
      // the number that gives the irreducible form in ONE division: the PGCD (never 1: the fraction can be reduced)
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      expect(gcd(c.n, c.d), `${q.id}: the fraction can be reduced`).toBeGreaterThan(1);
      return gcd(c.n, c.d);
    case 'reduced':
      // each option a fraction; the right one is equal to n/d AND irreducible — an equal fraction still reducible is wrong
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      return q.options.map((o) => isReducedOf(o, [c.n, c.d]));
    case 'reducedIs':
      // « the irreducible form of n/d is p/q », true or false
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      expect(q.text, q.id).toContain(`$\\frac{${c.p}}{${c.q}}$`);
      return isReducedOf(`$\\frac{${c.p}}{${c.q}}$`, [c.n, c.d]);
    case 'stage':
      // ONE stage: both terms divided by k, a common divisor (subtracting k, or dividing one term only, are wrong)
      expect(q.text, q.id).toContain(`$\\frac{${c.n}}{${c.d}}$`);
      expect(q.text, q.id).toContain(` ${c.k}.`);
      expect(c.n % c.k === 0 && c.d % c.k === 0, `${q.id}: ${c.k} divides both terms`).toBe(true);
      return q.options.map((o) => {
        const f = fracOf(o);
        return Boolean(f) && f[0] === c.n / c.k && f[1] === c.d / c.k;
      });
    case 'resultReduced': {
      // a calculation on two fractions, its result computed here; the right option is that value, irreducible
      expect(q.text, q.id).toContain(`$${c.expr}$`);
      const v = fracExpr(c.expr);
      expect(v, `${q.id}: « ${c.expr} » is read`).not.toBe(null);
      return q.options.map((o) => isReducedOf(o, v));
    }
    case 'perLot':
      // the lots the question gives share both collections: the greatest number of lots, so one lot is a / PGCD
      expect(c.lots, `${q.id}: the lots are the PGCD`).toBe(gcd(c.a, c.b));
      shows(q, c.a, c.b, c.lots);
      return (c.of === 'a' ? c.a : c.b) / c.lots;
    // ── the square root of a positive number (4AM unit 2, lesson 1): every value exact (rootCourts/logic.js) ──
    case 'power':
      // x^n of a rational number (3AM): a negative or a decimal base in brackets
      return valued(q, powerOf(c.base, c.exp), `${wrapped(c.base)}^${c.exp}`);
    case 'pythagoras':
      // the SQUARE of the hypotenuse of a right triangle whose legs are a and b
      shows(q, c.a, c.b);
      return valued(q, read(c.a * c.a + c.b * c.b), null);
    case 'root':
      // the positive number whose square is a (null when it has none among the numbers); `court`: asked in words, the
      // area of a square court (and, true-false, the side claimed), else written « $\sqrt{a}$ »
      // (since lesson 2 of the unit: a fraction keeps the terms it is given, « \\sqrt{\\dfrac{50}{98}} »)
      if (c.court && String(c.a).includes('/')) expect(q.text, q.id).toContain(`$${texGiven(c.a)}$`);
      else if (c.court) shows(q, c.a);
      return valued(q, rootOf(c.a) == null ? null : read(rootOf(c.a)), c.court ? null : `\\sqrt{${texGiven(c.a)}}`);
    case 'squareOfRoot':
      // (√a)² = a for a positive a
      expect(compare(c.a, '0'), `${q.id}: a positive number`).toBeGreaterThanOrEqual(0);
      return valued(q, read(c.a), `(\\sqrt{${tex(c.a)}})^2`);
    case 'rootOfSquare':
      // √(x²) is the positive one of x and −x: a side has no sign
      return valued(q, magnitude(c.x), `\\sqrt{${wrapped(c.x)}^2}`);
    case 'rootBetween':
      // « p و q »: two consecutive whole numbers with p² < a < q² (a has no whole root)
      if (c.court) shows(q, c.a);
      else expect(q.text, q.id).toContain(`$\\sqrt{${tex(c.a)}}$`);
      expect(rootOf(c.a), `${q.id}: a has no exact root`).toBe(null);
      return q.options.map((o) => {
        const m = String(o).match(/^(\d+) و (\d+)$/);
        if (!m) return false;
        const [p, r] = [m[1], m[2]];
        return Number(r) === Number(p) + 1 && compare(square(p), c.a) < 0 && compare(c.a, square(r)) < 0;
      });
    case 'exactSide':
      // the side of a court of area a written EXACTLY: « $\sqrt{a}$ », or a decimal whose square is a itself
      shows(q, c.a);
      return q.options.map((o) => {
        const m = String(o).match(/^\$\\sqrt\{(.+)\}\$$/);
        if (m) return equal(m[1].replaceAll('{,}', ','), c.a);
        return exactOf(o) != null && equal(square(exactOf(o)), c.a);
      });
    case 'rootApprox': {
      // the value of √a to `step` by default (d² ≤ a < (d + step)²) or by excess ((d − step)² < a ≤ d²), d a multiple of step
      expect(q.text, q.id).toContain(`$\\sqrt{${tex(c.a)}}$`);
      expect(q.text, q.id).toContain(`$${tex(c.step)}$`);
      expect(q.text, q.id).toContain(c.by === 'below' ? 'بالنقصان' : 'بالزيادة');
      return q.options.map((o) => {
        const d = exactOf(o);
        // d is a whole number of steps: d ÷ step has no fraction left
        if (d == null || times(d, read(`1/${String(c.step).replace(',', '.')}`)).d !== 1n) return false;
        if (c.by === 'below')
          return compare(square(d), c.a) <= 0 && compare(c.a, square(minus(d, minus('0', c.step)))) < 0;
        return compare(square(minus(d, c.step)), c.a) < 0 && compare(c.a, square(d)) <= 0;
      });
    }
    // ── rational and irrational numbers (4AM unit 2, lesson 2): « is this root a rational number? », the ROUNDED value ──
    case 'isRational': {
      // true / false: « $\\sqrt{a}$ عدد ناطق » or « … عدد غير ناطق » — the root is rational when a is the square of a
      // rational (rootOf finds it exactly), whatever the writing of a (whole, decimal, fraction reduced or not)
      expect(q.text, q.id).toContain(`$\\sqrt{${texGiven(c.a)}}$`);
      const word = c.says === 'rational' ? 'عدد ناطق' : 'عدد غير ناطق';
      expect(q.text, `${q.id}: the sentence says « ${word} »`).toContain(word);
      if (c.says === 'rational') expect(q.text, q.id).not.toContain('غير ناطق');
      return (rootOf(c.a) != null) === (c.says === 'rational');
    }
    case 'rationalPick':
      // choice: options « $\\sqrt{…}$ »; the right one is the only root that is (`want: 'rational'`) or is not rational
      if (c.want === 'rational') expect(q.text, q.id).not.toContain('غير ناطق');
      expect(q.text, q.id).toContain(c.want === 'rational' ? 'ناطق' : 'غير ناطق');
      return q.options.map((o) => {
        const r = radicandOf(o);
        expect(r, `${q.id}: « ${o} » is a root`).not.toBe(null);
        return (rootOf(r) != null) === (c.want === 'rational');
      });
    case 'rounded': {
      // choice: the ROUNDED value of √a to `step` — a whole number of steps d nearer to √a than half a step:
      // (d − step/2)² < a < (d + step/2)² (a has no rational root, so √a is never exactly half-way)
      expect(q.text, q.id).toContain(`$\\sqrt{${tex(c.a)}}$`);
      expect(q.text, q.id).toContain(`$${tex(c.step)}$`);
      expect(q.text, q.id).toMatch(/مدوَّر|مدور/);
      expect(rootOf(c.a), `${q.id}: a has no exact root`).toBe(null);
      const half = times(c.step, '0,5');
      return q.options.map((o) => {
        const d = exactOf(o);
        if (d == null || times(d, read(`1/${String(c.step).replace(',', '.')}`)).d !== 1n) return false;
        return compare(square(minus(d, half)), c.a) < 0 && compare(c.a, square(minus(d, minus('0', half)))) < 0;
      });
    }
    case 'phrase':
      return q.options.map((o, i) => {
        const f = FORMS[c.forms[i]];
        expect(o, `${q.id}: the option is written as its form says`).toBe(f.text(c.a, c.b));
        return f.holds(c.a, c.b);
      });
    default:
      throw new Error(`${q.id}: unknown check « ${c.type} »`);
  }
}

describe('حصّة القسم — the default tests', () => {
  it('there is a default test for every lesson that has its board', () => {
    expect(files.map((f) => f.name)).toContain('4am/qasim-adad-tabii.json');
    expect(files.map((f) => f.name)).toContain('4am/qawasim-adad-tabii.json');
    expect(files.map((f) => f.name)).toContain('4am/khawass-qawasim.json'); // lesson 3: written before its board
    expect(files.map((f) => f.name)).toContain('4am/qasim-mushtarak-akbar.json'); // lesson 4: the PGCD (2026-11-19)
    expect(files.map((f) => f.name)).toContain('4am/tayin-pgcd.json'); // lesson 5: finding the PGCD (2026-11-19)
    expect(files.map((f) => f.name)).toContain('4am/bahth-pgcd.json'); // lesson 6: the two algorithms (2026-11-19)
    expect(files.map((f) => f.name)).toContain('4am/awwaliyan-fima-baynahuma.json'); // lesson 7: coprime numbers (2026-11-19)
    expect(files.map((f) => f.name)).toContain('4am/ikhtizal-kasr.json'); // lesson 8: reducing a fraction (2026-11-20)
    expect(files.map((f) => f.name)).toContain('4am/wadiya-idmajiya-aadad.json'); // lesson 9: أدمج تعلّماتي (2026-11-20)
    expect(files.map((f) => f.name)).toContain('4am/jidhr-tarbii.json'); // unit 2, lesson 1: the square root (2026-11-21)
    expect(files.map((f) => f.name)).toContain('4am/natiqa-ghayr-natiqa.json'); // unit 2, lesson 2: rational or not
    // the division road (2026-11-18): two 1AM lessons and the 2AM one, each in its grade's folder
    for (const name of [
      '1am/qisma-iqlidiya-baqi.json',
      '1am/qawaid-qabiliyat-qisma.json',
      '2am/qisma-iqlidiya-hasr.json',
    ])
      expect(files.map((f) => f.name)).toContain(name);
    for (const { name, data } of files) {
      expect(name, 'the file sits in the folder of its grade, named after its lesson').toBe(
        `${data.grade}/${data.lesson}.json`,
      );
    }
  });

  it('the checks themselves say the truth (the arithmetic, the brackets, what a rule reads)', () => {
    expect(evalExpr('7 \\times 6 + 4')).toBe(46);
    expect(evalExpr('83 - 47')).toBe(36);
    expect(evalExpr('5 \\times 8 + 3')).toBe(43);
    expect(equalityHolds('$5 \\times 8 + 3 = 55$')).toBe(false);
    expect(bracketHolds('$22 < 527 \\div 23 < 23$', 527, 23)).toBe(true);
    expect(bracketHolds('$21 < 527 \\div 23 < 22$', 527, 23)).toBe(false);
    expect(bracketHolds('$22 < 527 \\div 23 < 24$', 527, 23)).toBe(false); // not two consecutive numbers
    expect(bracketHolds('$527 \\div 23 = 22$', 527, 23)).toBe(false);
    expect(bracketHolds('$936 \\div 26 = 36$', 936, 26)).toBe(true);
    expect(READS.lastTwo.text(5728)).toBe('العدد 28 المكوَّن من رقميه الأخيرين');
    // « PGCD(a ; b) = g » judged by the gcd, the direct results included
    const sentence = (a, b, g) =>
      truth({ id: 't', text: `$\\mathrm{PGCD}(${a} ; ${b}) = ${g}$.`, check: { type: 'pgcdIs', a, b, g } });
    expect(sentence(58, 0, 58)).toBe(true);
    expect(sentence(0, 64, 0)).toBe(false);
    expect(sentence(17, 17, 17)).toBe(true);
    expect(sentence(24, 60, 24)).toBe(false);
    // the steps of the two algorithms, counted on pairs worked by hand: 152 − 95 = 57, 95 − 57 = 38, 57 − 38 = 19,
    // 38 − 19 = 19, 19 − 19 = 0 (five subtractions); 152 = 95 × 1 + 57, 95 = 57 × 1 + 38, 57 = 38 × 1 + 19,
    // 38 = 19 × 2 + 0 (four divisions)
    expect([subtractionsOf(152, 95), divisionsOf(152, 95)]).toEqual([5, 4]);
    expect([subtractionsOf(1003, 34), divisionsOf(1003, 34)]).toEqual([31, 2]);
    expect([subtractionsOf(9, 9), divisionsOf(9, 9)]).toEqual([1, 1]); // equal numbers: one step each
    // Euclid never takes more steps: the count of subtractions is the sum of the quotients
    for (let a = 1; a <= 120; a += 1)
      for (let b = 1; b < a; b += 1) expect(divisionsOf(a, b)).toBeLessThan(subtractionsOf(a, b));
    // coprime numbers: a pair judged by hand (64 = 2 × 32, 35 = 5 × 7: only 1 is common); « none of 2, 3, 5 » is never a
    // proof — the sentence is always false, and a check whose premise is false fails
    expect(truth({ id: 't', text: '64 و 35', check: { type: 'coprime', a: 64, b: 35 } })).toBe(true);
    expect(truth({ id: 't', text: '91 و 65', check: { type: 'coprime', a: 91, b: 65 } })).toBe(false);
    expect(truth({ id: 't', options: ['10 و 21', '10 و 22'], check: { type: 'coprimePick' } })).toEqual([true, false]);
    expect(
      truth({ id: 't', text: '77 و 49', options: ['1', '7'], check: { type: 'witnessPick', a: 77, b: 49 } }),
    ).toEqual([false, true]);
    const proves = (a, b) =>
      truth({ id: 't', text: `${a} و ${b}: 2 ، 3 ، 5`, check: { type: 'noSmallWitness', a, b, tried: [2, 3, 5] } });
    expect(proves(77, 49)).toBe(false);
    expect(() => proves(77, 13)).toThrow(); // 77 and 13 ARE coprime: the sentence would teach a false proof by a true end
    expect(() => proves(70, 55)).toThrow(); // 5 divides both: the sentence's premise would be false
    // reducing a fraction: an equal fraction still reducible is NOT the irreducible form; a result is computed exactly
    expect(isReducedOf('$\\frac{5}{7}$', [195, 273])).toBe(true);
    expect(isReducedOf('$\\frac{65}{91}$', [195, 273])).toBe(false); // equal, but 13 still divides both
    expect(isReducedOf('$\\frac{5}{8}$', [195, 273])).toBe(false);
    expect(fracExpr('\\frac{11}{36} + \\frac{13}{36}')).toEqual([24 * 36, 36 * 36]);
    expect(fracExpr('\\frac{10}{21} \\times \\frac{9}{25}')).toEqual([90, 525]);
    expect(fracExpr('\\frac{29}{45} - \\frac{11}{45}')).toEqual([18 * 45, 45 * 45]);
    expect(fracExpr('\\frac{1}{2} \\div \\frac{1}{3}')).toBe(null); // a shape the check does not read is refused
    const one = (n, d) => truth({ id: 't', text: `$\\frac{${n}}{${d}}$`, check: { type: 'oneStep', n, d } });
    expect(one(54, 72)).toBe(18);
    expect(() => one(55, 72)).toThrow(); // a fraction that cannot be reduced has no « one step »
  });

  it('the square-root checks say the truth (exact values, a bracket, an approximation, the sign of a side)', () => {
    const q = (kind, text, check, options) => ({ id: 't', kind, text, check, options });
    expect(truth(q('number', 'احسب $57^2$.', { type: 'power', base: '57', exp: 2 }))).toBe(3249);
    expect(truth(q('truefalse', '$(-5)^3 = -125$.', { type: 'power', base: '-5', exp: 3, claim: '-125' }))).toBe(true);
    expect(truth(q('truefalse', '$(0{,}4)^2 = 0{,}8$.', { type: 'power', base: '0,4', exp: 2, claim: '0,8' }))).toBe(
      false,
    );
    expect(truth(q('truefalse', '$\\sqrt{0{,}09} = 0{,}3$.', { type: 'root', a: '0,09', claim: '0,3' }))).toBe(true);
    expect(truth(q('truefalse', '$\\sqrt{0{,}9} = 0{,}3$.', { type: 'root', a: '0,9', claim: '0,3' }))).toBe(false);
    // √71 = 8,4261…: 8,42 by default to 0,01; 8,4 is a multiple of 0,01 too but (8,41)² < 71 — not the value by default
    const approx = (o, by, step = '0,01') =>
      truth(
        q(
          'choice',
          `ما القيمة المقرّبة إلى $${step.replace(',', '{,}')}$ ${by === 'below' ? 'بالنقصان' : 'بالزيادة'} للعدد $\\sqrt{71}$؟`,
          {
            type: 'rootApprox',
            a: '71',
            step,
            by,
          },
          o,
        ),
      );
    expect(approx(['$8{,}42$', '$8{,}43$', '$8{,}4$', '$8{,}425$'], 'below')).toEqual([true, false, false, false]);
    expect(approx(['$8{,}42$', '$8{,}43$'], 'above')).toEqual([false, true]);
    expect(approx(['$8{,}4$', '$8{,}5$'], 'above', '0,1')).toEqual([false, true]);
    // an exact square: by default AND by excess it is its root itself
    expect(
      truth(
        q(
          'choice',
          'ما القيمة المقرّبة إلى $0{,}1$ بالنقصان للعدد $\\sqrt{49}$؟',
          { type: 'rootApprox', a: '49', step: '0,1', by: 'below' },
          ['$7$', '$6{,}9$'],
        ),
      ),
    ).toEqual([true, false]);
    expect(
      truth(
        q('choice', 'بين أيّ عددين يقع $\\sqrt{88}$؟', { type: 'rootBetween', a: '88' }, [
          '9 و 10',
          '8 و 10',
          '44 و 45',
        ]),
      ),
    ).toEqual([true, false, false]);
    expect(() => truth(q('choice', '$\\sqrt{81}$', { type: 'rootBetween', a: '81' }, ['8 و 9']))).toThrow(); // 81 has a root
    expect(
      truth(
        q('choice', 'مساحتها 63', { type: 'exactSide', a: '63' }, ['$\\sqrt{63}$', '$7{,}94$', '$\\sqrt{31{,}5}$']),
      ),
    ).toEqual([true, false, false]);
    expect(truth(q('choice', 'مساحتها 6,25', { type: 'exactSide', a: '6,25' }, ['$2{,}5$', '$3{,}125$']))).toEqual([
      true,
      false,
    ]);
    expect(truth(q('truefalse', '$\\sqrt{(-15)^2} = 15$.', { type: 'rootOfSquare', x: '-15', claim: '15' }))).toBe(
      true,
    );
    expect(truth(q('truefalse', '$\\sqrt{(-15)^2} = -15$.', { type: 'rootOfSquare', x: '-15', claim: '-15' }))).toBe(
      false,
    );
    expect(() => truth(q('number', '$\\sqrt{50}$', { type: 'root', a: '50' }))).toThrow(); // no whole value to type
  });

  it('the checks of rational and irrational roots say the truth (a fraction as given, the rounded value)', () => {
    const q = (kind, text, check, options) => ({ id: 't', kind, text, check, options });
    // a fraction option is read with its bar; a fraction keeps the terms it was given in the question
    expect(write(exactOf('$\\dfrac{5}{7}$'))).toBe('5/7');
    expect(write(exactOf('$-\\dfrac{9}{64}$'))).toBe('-0,140625');
    expect(texGiven('50/98')).toBe('\\dfrac{50}{98}');
    expect(texGiven('2,5')).toBe('2{,}5');
    // √(50/98) = √(25/49) = 5/7: the root of a fraction NOT reduced is found all the same
    expect(
      truth(
        q('choice', 'اكتب $\\sqrt{\\dfrac{50}{98}}$.', { type: 'root', a: '50/98' }, [
          '$\\dfrac{25}{49}$',
          '$\\dfrac{5}{7}$',
          '$\\dfrac{10}{14}$',
        ]),
      ),
    ).toEqual([false, true, true]); // 10/14 = 5/7: equal values are both « right » — a file never offers two of them
    // 9/20 is not the square of a rational (20 is not a square), 0,0121 is (0,11), 12/75 = 4/25 is (2/5)
    const says = (a, w) =>
      truth(
        q('truefalse', `$\\sqrt{${texGiven(a)}}$ ${w === 'rational' ? 'عدد ناطق' : 'عدد غير ناطق'}.`, {
          type: 'isRational',
          a,
          says: w,
        }),
      );
    expect(says('9/20', 'rational')).toBe(false);
    expect(says('9/20', 'irrational')).toBe(true);
    expect(says('0,0121', 'irrational')).toBe(false);
    expect(says('12/75', 'rational')).toBe(true);
    expect(
      truth(
        q('choice', 'أيّ هذه الأعداد ناطق؟', { type: 'rationalPick', want: 'rational' }, [
          '$\\sqrt{60}$',
          '$\\sqrt{\\dfrac{12}{75}}$',
          '$\\sqrt{0{,}9}$',
        ]),
      ),
    ).toEqual([false, true, false]);
    // √46 = 6,782…: rounded to 0,1 it is 6,8 (6,75² = 45,5625 < 46 < 46,9225 = 6,85²); 6,7 is the value by default
    const rounded = (a, step, o) =>
      truth(q('choice', `ما المدوَّر إلى $${tex(step)}$ للعدد $\\sqrt{${a}}$؟`, { type: 'rounded', a, step }, o));
    expect(rounded('46', '0,1', ['$6{,}7$', '$6{,}9$', '$6{,}8$'])).toEqual([false, false, true]);
    // √69 = 8,3066…: to 0,1 it rounds DOWN (8,35² = 69,7225 > 69), to 0,01 UP (8,305² = 68,973025 < 69)
    expect(rounded('69', '0,1', ['$8{,}3$', '$8{,}4$'])).toEqual([true, false]);
    expect(rounded('69', '0,01', ['$8{,}3$', '$8{,}31$', '$8{,}305$'])).toEqual([false, true, false]);
    expect(() => rounded('49', '0,1', ['$7$'])).toThrow(); // an exact root has nothing to round
  });

  for (const { name, data } of files) {
    const all = [...data.start, ...data.end, ...data.pool];
    it(`${name}: every answer is re-computed from its check, and no other option is right`, () => {
      for (const q of all) {
        const t = truth(q);
        if (q.kind === 'choice') {
          expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
          expect(t.filter(Boolean), `${q.id}: exactly one right option`).toHaveLength(1);
          expect(t.indexOf(true), `${q.id}: its index`).toBe(q.answer);
          expect(new Set(q.options).size).toBe(q.options.length);
        } else expect(q.answer, `${q.id} « ${q.text} »`).toBe(t);
        expect(['choice', 'truefalse', 'number']).toContain(q.kind);
        expect(getItem(q.item), `${q.id}: its الكفاءة is an item of the learning net`).toBeTruthy();
        expect(q.text).not.toMatch(/الكتاب|ص \d|خمر|قمار|خنزير/);
      }
      expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    });
    it(`${name}: short enough for the start of an hour, the right option never always in the same place, true and false both asked`, () => {
      expect(data.start.length).toBeGreaterThanOrEqual(6);
      expect(data.start.length).toBeLessThanOrEqual(10);
      expect(data.end.length).toBeGreaterThanOrEqual(5);
      expect(data.end.length).toBeLessThanOrEqual(8);
      for (const part of [data.start, data.end]) {
        expect(
          new Set(part.filter((q) => q.kind === 'choice').map((q) => q.answer)).size,
          'the right option moves',
        ).toBeGreaterThanOrEqual(2);
        expect(new Set(part.filter((q) => q.kind === 'truefalse').map((q) => q.answer)).size, 'true and false').toBe(2);
      }
    });
    it(`${name}: the two questions of the new lesson asked at the start come back at the end with other numbers`, () => {
      const teasers = data.start.filter((q) => q.teaser);
      expect(teasers.length).toBe(2);
      for (const tq of teasers) {
        const back = data.end.find((q) => q.pairOf === tq.id);
        expect(back, tq.id).toBeTruthy();
        expect(back.item).toBe(tq.item);
        expect(back.text).not.toBe(tq.text);
        expect(back.answer).toBe(tq.answer);
      }
      expect(
        data.start.slice(-2).every((q) => q.teaser),
        'the new lesson comes last in the start test',
      ).toBe(true);
      expect(data.start[0].teaser).toBeFalsy();
    });
  }
});
