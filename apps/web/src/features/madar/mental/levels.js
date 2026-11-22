/**
 * « Calcul mental » — les 50 niveaux du calcul mental et leurs problèmes (pur).
 *
 * Du plus facile (2 + 1) au plus grand (2569 + 176, 11 × 25, 288 ÷ 12, les
 * décimaux, les relatifs, les enchaînements d'opérations), en neuf familles.
 * Chaque niveau a trois sous-niveaux A / B / C : des nombres plus grands, des
 * retenues, des tables plus hautes. Les positions (0…149), l'adaptation et
 * les points sont ceux des autres jeux de mathématiques (sniper/levels.js,
 * sniper/adapt.js) ; seuls le catalogue et l'entrée par année sont propres.
 *
 * Un problème : { tokens, answer (valeur exacte), answerText } — la réponse est
 * toujours un entier ou un décimal fini, écrit avec la virgule (« 1,2 », « −4 »).
 * `problems.test.js` relit chaque problème avec un évaluateur indépendant.
 */
import { createRng } from '../engine/rng';
import { decimalOf, rat } from '../sniper/cards';

const MENTAL_DOMAINS = ['addSub', 'mul', 'div', 'big', 'tricks', 'mixed', 'decimals', 'relatives', 'powers'];

const by = (sub, a, b, c) => [a, b, c][sub - 1];
const minus = (n) => (n < 0 ? `−${-n}` : String(n));
const rel = (n) => (n < 0 ? `(−${-n})` : String(n));
const P = (tokens, answer) => ({ tokens, answer: typeof answer === 'number' ? rat(answer) : answer });
const T = (s) => [s];

/** Deux chiffres dont la somme reste sous 10 (sans retenue), ou dépasse (avec). */
const digitPair = (rng, carry) => {
  for (;;) {
    const a = rng.int(0, 9);
    const b = rng.int(0, 9);
    if (carry ? a + b >= 10 : a + b < 10) return [a, b];
  }
};

const B = {
  // ── Addition et soustraction ──
  add10: (rng, sub) => { const s = rng.int(2, by(sub, 5, 8, 10)); const a = rng.int(1, s - 1); return P(T(`${a} + ${s - a}`), s); },
  sub10: (rng, sub) => { const a = rng.int(2, by(sub, 5, 8, 10)); const b = rng.int(1, a - 1); return P(T(`${a} − ${b}`), a - b); },
  add20: (rng, sub) => { const s = rng.int(by(sub, 8, 11, 13), by(sub, 12, 16, 20)); const a = rng.int(by(sub, 1, 2, 4), s - 1); return P(T(`${a} + ${s - a}`), s); },
  sub20: (rng, sub) => { const a = rng.int(11, by(sub, 14, 17, 20)); const b = rng.int(by(sub, 1, 2, 3), 9); return P(T(`${a} − ${b}`), a - b); },
  add2d: (rng, sub) => {
    const [y, v] = digitPair(rng, false);
    const x = rng.int(1, by(sub, 3, 6, 8));
    const u = rng.int(1, 9 - x);
    return P(T(`${10 * x + y} + ${10 * u + v}`), 10 * (x + u) + y + v);
  },
  sub2d: (rng, sub) => {
    const x = rng.int(2, by(sub, 5, 8, 9));
    const u = rng.int(1, x - 1);
    const y = rng.int(0, 9);
    const v = rng.int(0, y);
    return P(T(`${10 * x + y} − ${10 * u + v}`), 10 * (x - u) + y - v);
  },
  add2dCarry: (rng, sub) => {
    const [y, v] = digitPair(rng, true);
    const x = rng.int(1, by(sub, 3, 5, 8));
    const u = rng.int(1, Math.max(1, by(sub, 4, 8, 9) - x));
    return P(T(`${10 * x + y} + ${10 * u + v}`), 10 * (x + u) + y + v);
  },
  sub2dBorrow: (rng, sub) => {
    const x = rng.int(2, by(sub, 5, 8, 9));
    const u = rng.int(1, x - 1);
    const y = rng.int(0, 8);
    const v = rng.int(y + 1, 9);
    return P(T(`${10 * x + y} − ${10 * u + v}`), 10 * x + y - 10 * u - v);
  },
  add3: (rng, sub) => {
    const n = () => rng.int(by(sub, 2, 5, 11), by(sub, 12, 30, 60));
    const [a, b, c] = [n(), n(), n()];
    return P(T(`${a} + ${b} + ${c}`), a + b + c);
  },

  // ── Multiplication et tables ──
  tab2510: (rng, sub) => { const a = rng.pick([2, 5, 10]); const b = rng.int(1, by(sub, 5, 8, 10)); return P(T(rng.chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`), a * b); },
  tab34: (rng, sub) => { const a = rng.pick([3, 4]); const b = rng.int(2, by(sub, 5, 8, 10)); return P(T(rng.chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`), a * b); },
  tab67: (rng, sub) => { const a = rng.pick([6, 7]); const b = rng.int(2, by(sub, 5, 8, 10)); return P(T(rng.chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`), a * b); },
  tab89: (rng, sub) => { const a = rng.pick([8, 9]); const b = rng.int(2, by(sub, 5, 8, 10)); return P(T(rng.chance(0.5) ? `${a} × ${b}` : `${b} × ${a}`), a * b); },
  tab1112: (rng, sub) => { const a = rng.pick([11, 12]); const b = rng.int(2, by(sub, 6, 9, 12)); return P(T(`${a} × ${b}`), a * b); },
  mul10: (rng, sub) => { const n = rng.int(...by(sub, [2, 9], [11, 99], [101, 999])); const k = rng.pick(by(sub, [10], [10, 100], [10, 100, 1000])); return P(T(`${n} × ${k}`), n * k); },
  mul2d1d: (rng, sub) => { const a = rng.int(11, by(sub, 30, 60, 99)); const b = rng.int(2, by(sub, 5, 7, 9)); return P(T(`${a} × ${b}`), a * b); },
  mul2d2d: (rng, sub) => { const a = rng.int(11, by(sub, 15, 19, 25)); const b = rng.int(11, by(sub, 13, 15, 19)); return P(T(`${a} × ${b}`), a * b); },
  mul2d2dHard: (rng, sub) => { const a = rng.int(21, 99); const b = rng.int(21, by(sub, 40, 60, 99)); return P(T(`${a} × ${b}`), a * b); },

  // ── Division ──
  div2510: (rng, sub) => { const d = rng.pick([2, 5, 10]); const q = rng.int(1, by(sub, 5, 8, 10)); return P(T(`${q * d} ÷ ${d}`), q); },
  divTo5: (rng, sub) => { const d = rng.int(2, 5); const q = rng.int(2, by(sub, 5, 8, 10)); return P(T(`${q * d} ÷ ${d}`), q); },
  divTo9: (rng, sub) => { const d = rng.int(by(sub, 3, 5, 6), 9); const q = rng.int(2, by(sub, 9, 10, 12)); return P(T(`${q * d} ÷ ${d}`), q); },
  div2dBy1d: (rng, sub) => { const d = rng.int(2, by(sub, 5, 7, 9)); const q = rng.int(11, by(sub, 20, 30, 50)); return P(T(`${q * d} ÷ ${d}`), q); },
  divBy10: (rng, sub) => { const k = rng.pick(by(sub, [10], [10, 100], [10, 100, 1000])); const q = rng.int(...by(sub, [2, 99], [3, 250], [12, 999])); return P(T(`${q * k} ÷ ${k}`), q); },
  div3dBy1d: (rng, sub) => { const d = rng.int(2, 9); const q = rng.int(20, by(sub, 40, 80, 150)); return P(T(`${q * d} ÷ ${d}`), q); },
  div2d: (rng, sub) => { const d = rng.int(11, by(sub, 15, 19, 25)); const q = rng.int(11, by(sub, 20, 30, 40)); return P(T(`${q * d} ÷ ${d}`), q); },

  // ── Les grands nombres ──
  add3d2d: (rng, sub) => { const a = rng.int(100, by(sub, 400, 700, 999)); const b = rng.int(by(sub, 10, 20, 50), 99); return P(T(`${a} + ${b}`), a + b); },
  subFromHundreds: (rng, sub) => { const k = rng.int(1, by(sub, 3, 6, 9)); const b = rng.int(by(sub, 11, 21, 31), 99); return P(T(`${100 * k} − ${b}`), 100 * k - b); },
  add3d: (rng, sub) => { const a = rng.int(100, by(sub, 400, 700, 999)); const b = rng.int(100, by(sub, 400, 700, 999)); return P(T(`${a} + ${b}`), a + b); },
  sub3d: (rng, sub) => { const a = rng.int(by(sub, 300, 500, 700), 999); const b = rng.int(100, a - 1); return P(T(`${a} − ${b}`), a - b); },
  add4d3d: (rng, sub) => { const a = rng.int(1000, by(sub, 3000, 6000, 9999)); const b = rng.int(100, 999); return P(T(rng.chance(0.5) ? `${a} + ${b}` : `${b} + ${a}`), a + b); },
  subFromThousands: (rng, sub) => { const k = rng.int(1, by(sub, 3, 6, 9)); const b = rng.int(101, 999); return P(T(`${1000 * k} − ${b}`), 1000 * k - b); },
  bigMix: (rng, sub) => {
    const a = rng.int(by(sub, 500, 1000, 2000), by(sub, 999, 4999, 9999));
    const b = rng.int(100, 999);
    const c = rng.int(100, Math.min(999, a + b - 1));
    return P(T(`${a} + ${b} − ${c}`), a + b - c);
  },

  // ── Astuces de calcul rapide ──
  mul5_25_50: (rng, sub) => { const k = rng.pick(by(sub, [5], [5, 25], [5, 25, 50])); const n = 2 * rng.int(2, by(sub, 20, 30, 50)); return P(T(`${n} × ${k}`), n * k); },
  mul11: (rng, sub) => { const n = rng.int(11, by(sub, 40, 70, 99)); return P(T(rng.chance(0.5) ? `11 × ${n}` : `${n} × 11`), 11 * n); },
  mul9_99: (rng, sub) => { const k = rng.pick(by(sub, [9], [9, 99], [99, 999])); const n = rng.int(by(sub, 11, 12, 13), by(sub, 50, 80, 99)); return P(T(`${n} × ${k}`), n * k); },

  // ── Calculs enchaînés ──
  parens: (rng, sub) => {
    const a = rng.int(2, by(sub, 5, 9, 12)); const b = rng.int(2, by(sub, 6, 12, 25)); const c = rng.int(1, by(sub, 6, 12, 25));
    return rng.chance(0.5) ? P(T(`${a} × (${b} + ${c})`), a * (b + c)) : P(T(`(${b} + ${c}) × ${a}`), a * (b + c));
  },
  priorities: (rng, sub) => {
    const a = rng.int(2, by(sub, 20, 50, 99)); const b = rng.int(2, by(sub, 5, 9, 12)); const c = rng.int(2, by(sub, 5, 9, 12));
    return rng.chance(0.5) ? P(T(`${a} + ${b} × ${c}`), a + b * c) : P(T(`${b} × ${c} − ${Math.min(a, b * c - 1)}`), b * c - Math.min(a, b * c - 1));
  },
  chain: (rng, sub) => {
    const b = rng.int(2, by(sub, 5, 8, 12)); const q = rng.int(2, by(sub, 9, 12, 15)); const c = rng.int(2, by(sub, 5, 8, 12));
    const d = rng.int(1, q * c - 1);
    return P(T(`${q * b} ÷ ${b} × ${c} − ${d}`), q * c - d);
  },

  // ── Décimaux, fractions et pourcentages ──
  decAdd: (rng, sub) => {
    const u = by(sub, 10, 10, 100);
    const a = rng.int(1, by(sub, 9, 49, 499)); const b = rng.int(1, by(sub, 9, 49, 499));
    return P(T(`${decimalOf(rat(a, u))} + ${decimalOf(rat(b, u))}`), rat(a + b, u));
  },
  decMul10: (rng, sub) => {
    const x = rat(rng.int(11, by(sub, 99, 999, 9999)), by(sub, 10, 100, 100));
    const op = rng.pick(by(sub, [['× 10', rat(10)]], [['× 10', rat(10)], ['× 100', rat(100)], ['÷ 10', rat(1, 10)]], [['× 0,1', rat(1, 10)], ['× 1000', rat(1000)], ['÷ 100', rat(1, 100)]]));
    return P(T(`${decimalOf(x)} ${op[0]}`), rat(x.n * op[1].n, x.d * op[1].d));
  },
  fracOf: (rng, sub) => {
    const [p, q] = rng.pick(by(sub, [[1, 2]], [[1, 2], [1, 4], [1, 3]], [[3, 4], [2, 3], [1, 5], [2, 5], [3, 5]]));
    const n = q * rng.int(2, by(sub, 10, 20, 40));
    return P([{ frac: [String(p), String(q)] }, ` × ${n}`], (p * n) / q);
  },
  percentOf: (rng, sub) => {
    const p = rng.pick(by(sub, [10, 50], [10, 20, 25, 50], [5, 15, 30, 75]));
    const n = 20 * rng.int(1, by(sub, 10, 20, 40));
    return P(T(`${p} % × ${n}`), (p * n) / 100);
  },

  // ── Nombres relatifs ──
  relAdd: (rng, sub) => {
    const R = by(sub, 10, 30, 99);
    const a = rng.int(-R, R) || 1; const b = rng.int(-R, R) || -1;
    return P(T(`${minus(a)} + ${rel(b)}`), a + b);
  },
  relMul: (rng, sub) => {
    const R = by(sub, 6, 9, 12);
    const a = (rng.int(2, R)) * rng.pick([-1, 1]); const b = (rng.int(2, R)) * rng.pick([-1, 1]);
    return rng.chance(0.5) ? P(T(`${minus(a)} × ${rel(b)}`), a * b) : P(T(`${minus(a * b)} ÷ ${rel(b)}`), a);
  },
  relMix: (rng, sub) => {
    const R = by(sub, 10, 20, 40);
    const a = rng.int(-R, R) || 2; const b = (rng.int(2, 6)) * rng.pick([-1, 1]); const c = (rng.int(2, 6)) * rng.pick([-1, 1]);
    return P(T(`${minus(a)} + ${rel(b)} × ${rel(c)}`), a + b * c);
  },

  // ── Carrés, puissances et racines ──
  squares15: (rng, sub) => { const n = rng.int(2, by(sub, 10, 13, 15)); return P([String(n), { sup: '2' }], n * n); },
  squares25: (rng, sub) => {
    if (sub === 3 || (sub === 2 && rng.chance(0.4))) { const n = rng.int(2, sub === 3 ? 10 : 5); return P([String(n), { sup: '3' }], n ** 3); }
    const n = rng.int(16, 25); return P([String(n), { sup: '2' }], n * n);
  },
  sqrt: (rng, sub) => { const n = rng.int(by(sub, 2, 11, 16), by(sub, 12, 20, 30)); return P([{ sqrt: String(n * n) }], n); },
  powers: (rng, sub) => {
    if (rng.chance(0.5)) { const k = rng.int(by(sub, 2, 4, 6), by(sub, 5, 8, 10)); return P(['2', { sup: String(k) }], 2 ** k); }
    const a = rng.int(2, 9); const k = rng.int(2, by(sub, 3, 4, 5)); return P([`${a} × 10`, { sup: String(k) }], a * 10 ** k);
  },
};

// 50 · Le défi : un problème des niveaux les plus durs, à leur sous-niveau le plus haut.
const CHAMPION = ['add4d3d', 'subFromThousands', 'mul2d2dHard', 'div2d', 'mul9_99', 'chain', 'relMix', 'decMul10', 'percentOf', 'powers', 'bigMix'];
B.champion = (rng) => B[rng.pick(CHAMPION)](rng, 3);

const L = (id, domain) => ({ id, domain, build: id });

export const MENTAL_LEVELS = [
  L('add10', 'addSub'), L('sub10', 'addSub'), L('add20', 'addSub'), L('sub20', 'addSub'), L('tab2510', 'mul'),
  L('add2d', 'addSub'), L('sub2d', 'addSub'), L('tab34', 'mul'), L('div2510', 'div'), L('add2dCarry', 'addSub'),
  L('sub2dBorrow', 'addSub'), L('tab67', 'mul'), L('tab89', 'mul'), L('divTo5', 'div'), L('mul10', 'tricks'),
  L('add3', 'addSub'), L('divTo9', 'div'), L('add3d2d', 'big'), L('subFromHundreds', 'big'), L('mul2d1d', 'mul'),
  L('tab1112', 'mul'), L('add3d', 'big'), L('sub3d', 'big'), L('div2dBy1d', 'div'), L('mul5_25_50', 'tricks'),
  L('mul11', 'tricks'), L('squares15', 'powers'), L('add4d3d', 'big'), L('subFromThousands', 'big'), L('mul2d2d', 'mul'),
  L('divBy10', 'div'), L('div3dBy1d', 'div'), L('parens', 'mixed'), L('priorities', 'mixed'), L('decAdd', 'decimals'),
  L('decMul10', 'decimals'), L('relAdd', 'relatives'), L('relMul', 'relatives'), L('fracOf', 'decimals'), L('percentOf', 'decimals'),
  L('squares25', 'powers'), L('mul9_99', 'tricks'), L('mul2d2dHard', 'mul'), L('sqrt', 'powers'), L('bigMix', 'big'),
  L('div2d', 'div'), L('relMix', 'relatives'), L('powers', 'powers'), L('chain', 'mixed'), L('champion', 'mixed'),
].map((l, i) => ({ ...l, n: i + 1 }));

const mentalLevelAt = (n) => MENTAL_LEVELS[Math.min(MENTAL_LEVELS.length, Math.max(1, n)) - 1];

/** Les familles, chacune avec ses niveaux (la carte de l'accueil). */
export function mentalLevelsByDomain() {
  return MENTAL_DOMAINS.map((domain) => ({ domain, levels: MENTAL_LEVELS.filter((l) => l.domain === domain) }));
}

/** Le problème i d'une graine, au niveau `level` (1…50) et au sous-niveau `sub` (1…3). */
export function makeProblem(seed, i, { level = 1, sub = 1 } = {}) {
  const meta = mentalLevelAt(level);
  const rng = createRng((seed ^ Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(meta.n * 3 + sub, 0xc2b2ae35)) >>> 0);
  const p = B[meta.build](rng, sub);
  return { i, level: meta.n, sub, levelId: meta.id, domain: meta.domain, tokens: p.tokens, answer: p.answer, answerText: decimalOf(p.answer) };
}
