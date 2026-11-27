/**
 * « Les deux triangles » — the mathematics of the similar-triangles instrument of 3e (tools/SimilarTriangles.jsx),
 * pure and EXACT: every equality it states is decided on fractions of BigInt, never on floats.
 *
 * The first triangle ABC: AB = a and AC = b (the shared numbers, whole), BC = c (whole, set by the hand on the vertex C:
 * |a − b| < c < a + b). The second one is built at the angle of A: its first vertex P0 has the angle Â, its sides from P0
 * are P0P1 = k × a and P0P2 = k × s, where k is a factor of `SIM_K` and s a whole number the hand sets on the vertex P2
 * (s = b: the second triangle is the first one × k). So its third side is k × e with
 *   e² = a² + s² − 2 × a × s × cos Â = a² + s² − s × (a² + b² − c²) ÷ b — a fraction, its square root seldom one.
 * Every length is known by its SQUARE (a fraction): two quotients of lengths are equal exactly when the quotients of their
 * squares are; two angles are equal exactly when their cosines have the same sign and the same square. The vertices P0,
 * P1, P2 are named D, E, F in turn from `names` (0, 1, 2): « par les noms » pairs DE with AB, DF with AC, EF with BC.
 * Facts only: nothing here names a rule.
 */

/** The factors of the second triangle (n / d): every k × a whole number is a decimal with two digits at most. */
export const SIM_K = [
  [1, 4],
  [1, 2],
  [3, 4],
  [1, 1],
  [5, 4],
  [3, 2],
  [2, 1],
  [5, 2],
  [3, 1],
];

/** The third side BC a whole number can take (a strict triangle). */
export const cRange = (a, b) => [Math.abs(a - b) + 1, a + b - 1];
/** The side P0P2 ÷ k the hand can set on the second triangle: 1 to twice the longer of a and b, never above 24. */
export const sRange = (a, b) => [1, Math.min(24, 2 * Math.max(a, b))];
/** The first BC on opening: about the side of a right corner, made different from a and b when it can be. */
export function cStart(a, b) {
  const [lo, hi] = cRange(a, b);
  let c = Math.max(lo, Math.min(hi, Math.round(Math.sqrt(a * a + b * b))));
  for (const d of [1, -1, 2, -2])
    if ((c === a || c === b) && c + d >= lo && c + d <= hi && c + d !== a && c + d !== b) c += d;
  return c;
}

/* ---------- fractions of BigInt ---------- */
const big = (x) => BigInt(x);
const babs = (x) => (x < 0n ? -x : x);
function bgcd(x, y) {
  let [p, q] = [babs(x), babs(y)];
  while (q) [p, q] = [q, p % q];
  return p || 1n;
}
/** n / d reduced, d > 0. */
export function frac(n, d = 1n) {
  let [p, q] = [big(n), big(d)];
  if (q < 0n) [p, q] = [-p, -q];
  const g = bgcd(p, q);
  return { n: p / g, d: q / g };
}
const fmul = (x, y) => frac(x.n * y.n, x.d * y.d);
const fdiv = (x, y) => frac(x.n * y.d, x.d * y.n);
const fadd = (x, y) => frac(x.n * y.d + y.n * x.d, x.d * y.d);
const fsub = (x, y) => frac(x.n * y.d - y.n * x.d, x.d * y.d);
export const feq = (x, y) => x.n * y.d === y.n * x.d;
const fcmp = (x, y) => {
  const l = x.n * y.d;
  const r = y.n * x.d;
  return l < r ? -1 : l > r ? 1 : 0;
};
const fnum = (x) => Number(x.n) / Number(x.d);
function isqrt(n) {
  if (n < 2n) return n;
  let x = big(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
}
/** The square root of a fraction ≥ 0 when it is a fraction, else null. */
function fsqrt(x) {
  if (x.n < 0n) return null;
  const p = isqrt(x.n);
  const q = isqrt(x.d);
  return p * p === x.n && q * q === x.d ? frac(p, q) : null;
}
/** A fraction as a decimal of at most 4 digits after the comma (« 7,5 », « 0,75 »), or null when it has more. */
export function decimalOf(x) {
  const scaled = x.n * 10000n;
  if (scaled % x.d) return null;
  const v = scaled / x.d;
  const neg = v < 0n;
  const s = String(babs(v)).padStart(5, '0');
  const dec = s.slice(-4).replace(/0+$/, '');
  return `${neg ? '−' : ''}${s.slice(0, -4)}${dec ? `,${dec}` : ''}`;
}
/** A length known by its square: exact when its root is a short decimal, else « ≈ » to 0,01. */
function lengthOf(sq) {
  const root = fsqrt(sq);
  const exact = root ? decimalOf(root) : null;
  const value = Math.sqrt(fnum(sq));
  return { sq, value, exact: exact !== null, text: exact ?? `≈ ${value.toFixed(2).replace('.', ',')}` };
}

/** The angle opposite the side x² in a triangle of sides x², y², z² (squares): its exact key and its degrees. */
function angleOf(x2, y2, z2) {
  const N = fsub(fadd(y2, z2), x2);
  const cos2 = fdiv(fmul(N, N), fmul(frac(4), fmul(y2, z2)));
  const sign = N.n > 0n ? 1 : N.n < 0n ? -1 : 0;
  const deg = (Math.acos(Math.max(-1, Math.min(1, fnum(N) / (2 * Math.sqrt(fnum(y2) * fnum(z2)))))) * 180) / Math.PI;
  // 90°, 60° and 120° are the only whole angles a cosine of this kind can give exactly
  const whole = sign === 0 ? 90 : feq(cos2, frac(1, 4)) ? (sign > 0 ? 60 : 120) : null;
  return { sign, cos2, deg, exact: whole !== null, text: whole !== null ? `= ${whole}°` : `≈ ${Math.round(deg)}°` };
}
const sameAngle = (x, y) => x.sign === y.sign && feq(x.cos2, y.cos2);

const OPP1 = { AB: 'C', AC: 'B', BC: 'A' };
const PAIR = { DE: 'AB', DF: 'AC', EF: 'BC' };

/**
 * Everything the instrument shows for ABC (a, b, c) and the second triangle (factor `SIM_K[ki]`, side s, names):
 *   t1, t2      { sides: { name: length }, angles: { vertex: angle } } — t2 also `labels` (the names of P0, P1, P2) and
 *               `phys` (the names of P0P1, P0P2, P1P2) and `opp` (the vertex opposite each side);
 *   ranked      [{ t1, t2 }] × 3 — the side names, shortest first, and `rankedEq` [= or ≠ between 1st & 2nd, 2nd & 3rd];
 *   named       [{ t1, t2 }] × 3 (AB, AC, BC with the side of the same letters) and `namedEq`;
 *   same        the three ranked quotients are equal (the second, set to the size of ABC, covers it exactly);
 *   size        'smaller' | 'equal' | 'bigger' when `same`, else null;
 *   equalAngles [[vertex of ABC, vertex of the second]] — every pair of exactly equal angles;
 *   scalene     the three sides of ABC are different.
 */
export function similarOf(a, b, c, ki, s, names = 0) {
  const [kn, kd] = SIM_K[ki];
  const k2 = frac(kn * kn, kd * kd);
  const A2 = frac(a * a);
  const B2 = frac(b * b);
  const C2 = frac(c * c);
  const e2 = fsub(fadd(A2, frac(s * s)), fdiv(fmul(frac(s), fsub(fadd(A2, B2), C2)), frac(b)));
  const t1 = {
    sides: { AB: lengthOf(A2), AC: lengthOf(B2), BC: lengthOf(C2) },
    angles: { A: angleOf(C2, A2, B2), B: angleOf(B2, A2, C2), C: angleOf(A2, B2, C2) },
  };
  const labels = [0, 1, 2].map((i) => 'DEF'[(i + names) % 3]);
  const nm = (i, j) => [labels[i], labels[j]].sort().join('');
  const sq = [fmul(k2, A2), fmul(k2, frac(s * s)), fmul(k2, e2)]; // P0P1², P0P2², P1P2²
  const phys = [nm(0, 1), nm(0, 2), nm(1, 2)];
  const opp = { [phys[0]]: labels[2], [phys[1]]: labels[1], [phys[2]]: labels[0] };
  const t2 = {
    labels,
    phys,
    opp,
    sides: Object.fromEntries(phys.map((p, i) => [p, lengthOf(sq[i])])),
    angles: {
      [labels[0]]: angleOf(sq[2], sq[0], sq[1]),
      [labels[1]]: angleOf(sq[1], sq[0], sq[2]),
      [labels[2]]: angleOf(sq[0], sq[1], sq[2]),
    },
  };
  const byLen = (sides) => Object.keys(sides).sort((x, y) => fcmp(sides[x].sq, sides[y].sq) || (x < y ? -1 : 1));
  const r1 = byLen(t1.sides);
  const r2 = byLen(t2.sides);
  const ranked = r1.map((n1, i) => ({ t1: n1, t2: r2[i] }));
  const named = ['AB', 'AC', 'BC'].map((n1) => ({ t1: n1, t2: Object.keys(PAIR).find((x) => PAIR[x] === n1) }));
  // q = side² of the second ÷ side² of the first: two quotients are equal when their squares are
  const qEq = (p, q) => feq(fmul(t2.sides[p.t2].sq, t1.sides[q.t1].sq), fmul(t2.sides[q.t2].sq, t1.sides[p.t1].sq));
  const rankedEq = [qEq(ranked[0], ranked[1]), qEq(ranked[1], ranked[2])];
  const namedEq = [qEq(named[0], named[1]), qEq(named[1], named[2])];
  const same = rankedEq[0] && rankedEq[1];
  const cmp = fcmp(t2.sides[r2[0]].sq, t1.sides[r1[0]].sq);
  const size = same ? (cmp < 0 ? 'smaller' : cmp > 0 ? 'bigger' : 'equal') : null;
  const equalAngles = [];
  for (const v1 of 'ABC')
    for (const v2 of labels) if (sameAngle(t1.angles[v1], t2.angles[v2])) equalAngles.push([v1, v2]);
  return {
    t1: { ...t1, opp: OPP1 },
    t2,
    ranked,
    rankedEq,
    named,
    namedEq,
    same,
    size,
    equalAngles,
    scalene: a !== b && b !== c && a !== c,
  };
}
