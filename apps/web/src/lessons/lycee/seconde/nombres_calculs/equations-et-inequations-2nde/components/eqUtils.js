import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * eqUtils — le modèle mathématique de la leçon « Équations et inéquations »
 * (2nde). Une forme linéaire est { a, b } pour ax + b ; une équation est
 * { L, R } ; une inéquation { L, R, op } avec op ∈ '<' '≤' '>' '≥'.
 *
 * Tout ce qui est affiché (barres du scanner, région éclairée, égalité
 * détectée, balance, ensembles de solutions, produit, quotient, valeur
 * interdite) DÉRIVE de ces fonctions pures. Les solutions fractionnaires
 * sont gardées EXACTES ({ num, den }) : 7/3 n'est jamais 2,333.
 */
export { formatDec, parseDec, roundTo };

export const lin = (a, b) => ({ a, b });
export const evalLin = (f, x) => roundTo(f.a * x + f.b, 9);

/** « 2x + 5 », « −3x + 4 », « 13 », « x », « −x − 1 ». */
export function formatLin(f, v = 'x') {
  const { a, b } = f;
  const fa = a === 1 ? v : a === -1 ? `−${v}` : `${formatDec(a)}${v}`;
  if (a === 0) return formatDec(b);
  if (b === 0) return fa;
  return `${fa} ${b < 0 ? '−' : '+'} ${formatDec(Math.abs(b))}`;
}

/** Un flottant « presque rationnel » (2,333333333) rendu en fraction ; sinon décimal. */
export function niceFraction(v, maxDen = 12) {
  for (let d = 1; d <= maxDen; d += 1) {
    const n = Math.round(v * d);
    if (Math.abs(v * d - n) < 1e-7) return { num: n, den: d };
  }
  return null;
}
function texNumber(v) {
  const f = niceFraction(v);
  if (f && f.den !== 1) return `${f.num < 0 ? '-' : ''}\\frac{${Math.abs(f.num)}}{${f.den}}`;
  return formatDec(v).replace(/−/g, '-').replace(/,/g, '{,}');
}
/** Version KaTeX de formatLin : coefficients fractionnaires écrits en fractions. */
export function texLin(f, v = 'x') {
  const { a, b } = f;
  const fa = a === 1 ? v : a === -1 ? `-${v}` : `${texNumber(a)}${v}`;
  if (a === 0) return texNumber(b);
  if (b === 0) return fa;
  const fb = niceFraction(Math.abs(b));
  const absB = fb && fb.den !== 1 ? `\\frac{${Math.abs(fb.num)}}{${fb.den}}` : texNumber(Math.abs(b));
  return `${fa} ${b < 0 ? '-' : '+'} ${absB}`;
}

export function gcd(a, b) { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; }

/** Fraction réduite { num, den } (den > 0) ; entière si den = 1. */
export function fraction(num, den) {
  if (den === 0) throw new RangeError('den = 0');
  const g = gcd(num, den);
  const s = den < 0 ? -1 : 1;
  return { num: (s * num) / g, den: (s * den) / g };
}
export const fracValue = (f) => f.num / f.den;
export const formatFrac = (f) => (f.den === 1 ? formatDec(f.num) : `${formatDec(f.num)}/${formatDec(f.den)}`);
export const texFrac = (f) => (f.den === 1 ? String(f.num).replace('-', '-') : `${f.num < 0 ? '-' : ''}\\frac{${Math.abs(f.num)}}{${f.den}}`);

/** Solutions de L = R : { kind: 'one', x } (x = fraction) | { kind: 'none' } | { kind: 'all' }. */
export function solveLinearEq(L, R) {
  const a = L.a - R.a;
  const b = R.b - L.b;
  if (a === 0) return b === 0 ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'one', x: fraction(b, a) };
}

/**
 * Solutions de L op R : un intervalle { from, to, openFrom, openTo } (bornes
 * ±Infinity), ou { kind: 'none' } / { kind: 'all' }.
 */
export function solveLinearIneq(L, R, op) {
  const a = L.a - R.a;         // a x  op  b
  const b = R.b - L.b;
  const strict = op === '<' || op === '>';
  let lessThan = op === '<' || op === '≤'; // x  (< ou ≤)  b/a  si a > 0
  if (a === 0) {
    const ok = op === '<' ? 0 < b : op === '≤' ? 0 <= b : op === '>' ? 0 > b : 0 >= b;
    return ok ? { kind: 'all' } : { kind: 'none' };
  }
  const bound = b / a;
  if (a < 0) lessThan = !lessThan; // diviser par un négatif retourne le signe
  return lessThan
    ? { from: -Infinity, to: roundTo(bound, 9), openFrom: true, openTo: strict }
    : { from: roundTo(bound, 9), to: Infinity, openFrom: strict, openTo: true };
}

/** Relation entre L(x) et R(x) : '<' | '=' | '>'. */
export function relationAt(L, R, x) {
  const l = evalLin(L, x); const r = evalLin(R, x);
  return l < r ? '<' : l > r ? '>' : '=';
}

/** Une opération appliquée à une forme : { type: 'add' | 'addx' | 'mul' | 'div', k }. */
export function applyOp(f, op) {
  switch (op.type) {
    case 'add': return { a: f.a, b: roundTo(f.b + op.k, 9) };
    case 'addx': return { a: roundTo(f.a + op.k, 9), b: f.b };
    case 'mul': return { a: roundTo(f.a * op.k, 9), b: roundTo(f.b * op.k, 9) };
    case 'div': return { a: roundTo(f.a / op.k, 9), b: roundTo(f.b / op.k, 9) };
    default: return f;
  }
}

/** Appliquer aux deux membres (les solutions sont conservées si k ≠ 0). */
export function applyBothSides(eq, op) {
  return { L: applyOp(eq.L, op), R: applyOp(eq.R, op) };
}
/** Appliquer à un seul membre : le piège — les solutions changent. */
export function applyOneSide(eq, op, side) {
  return side === 'L' ? { L: applyOp(eq.L, op), R: eq.R } : { L: eq.L, R: applyOp(eq.R, op) };
}
/** Pour une inéquation : l'opérateur après une multiplication/division par k. */
export function opAfter(op, k) {
  if (k >= 0) return op;
  return { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }[op];
}
export function sameSolutions(eq1, eq2) {
  const s1 = solveLinearEq(eq1.L, eq1.R); const s2 = solveLinearEq(eq2.L, eq2.R);
  if (s1.kind !== s2.kind) return false;
  if (s1.kind !== 'one') return true;
  // Comparaison numérique tolérante : après « ÷ 3 », un coefficient vaut
  // 2,333333333 (arrondi à 9 décimales) et non la fraction 7/3.
  return Math.abs(fracValue(s1.x) - fracValue(s2.x)) < 1e-7;
}
/** x est-il isolé : L = x (a = 1, b = 0) et R constant ? */
export const isSolvedForm = (eq) => eq.L.a === 1 && eq.L.b === 0 && eq.R.a === 0;

/** Vérification par substitution : les deux membres et le verdict. */
export function checkSolution(L, R, x) {
  const l = evalLin(L, x); const r = evalLin(R, x);
  return { left: l, right: r, ok: l === r };
}

/** Produit de facteurs linéaires : valeur, racines. */
export const evalProduct = (factors, x) => roundTo(factors.reduce((p, f) => p * evalLin(f, x), 1), 9);
export function productZeros(factors) {
  const out = [];
  for (const f of factors) if (f.a !== 0) { const r = fraction(-f.b, f.a); if (!out.some((o) => o.num === r.num && o.den === r.den)) out.push(r); }
  return out.sort((p, q) => fracValue(p) - fracValue(q));
}
export function formatProduct(factors) {
  return factors.map((f) => `(${formatLin(f)})`).join('');
}

/** Quotient num/den : valeur interdite, solutions de num/den = 0. */
export function forbiddenValues(den) { return den.a === 0 ? [] : [fraction(-den.b, den.a)]; }
export function quotientSolutions(num, den) {
  const forb = forbiddenValues(den);
  return productZeros([num]).filter((r) => !forb.some((f) => f.num === r.num && f.den === r.den));
}
export function evalQuotient(num, den, x) {
  const d = evalLin(den, x);
  if (d === 0) return null;
  return roundTo(evalLin(num, x) / d, 6);
}

/** « [1 ; 5] », « ]−∞ ; 4[ », « ∅ », « ℝ ». */
export function notation(I) {
  if (!I || I.kind === 'none') return '∅';
  if (I.kind === 'all') return 'ℝ';
  const l = Number.isFinite(I.from) ? (I.openFrom ? ']' : '[') : ']';
  const r = Number.isFinite(I.to) ? (I.openTo ? '[' : ']') : '[';
  const a = Number.isFinite(I.from) ? formatDec(I.from) : '−∞';
  const b = Number.isFinite(I.to) ? formatDec(I.to) : '+∞';
  return `${l}${a} ; ${b}${r}`;
}
export function sameSet(I, J) {
  if (!I || !J) return I === J;
  if (I.kind || J.kind) return I.kind === J.kind;
  return I.from === J.from && I.to === J.to && I.openFrom === J.openFrom && I.openTo === J.openTo;
}
