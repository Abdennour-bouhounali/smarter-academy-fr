/**
 * Les POLYNÔMES du مختبر الجبر — logique pure, sans React.
 *
 * Un polynôme à plusieurs lettres, à coefficients RATIONNELS exacts
 * (rational.js) : c'est l'objet que manipulent les sections « تبسيط التعابير »,
 * « التحليل إلى عوامل », « الأنظمة » et le nouveau pas « نشر وتبسيط » des
 * équations. Aucune chaîne n'est jamais retouchée : on part de l'AST de
 * l'analyseur unique (functionGrapher/expressionParser.js) et on revient au
 * LaTeX par des fonctions d'écriture dédiées.
 *
 *     poly = [ { coef: {n, d}, mono: { x: 2, y: 1 } }, … ]
 *
 * Toujours RÉDUIT (un seul terme par monôme, aucun coefficient nul) et TRIÉ
 * comme l'écrit le manuel : degré total décroissant, puis la première lettre
 * (ordre alphabétique) à la puissance la plus haute d'abord —
 * `x^2 + 2xy + y^2`, `2a - b`, la constante en dernier.
 *
 * Garde-fous : degré total ≤ MAX_DEGREE, au plus MAX_TERMS termes, et le
 * LIMIT de rational.js. Au-delà, une AlgebraError porteuse d'un CODE — jamais
 * un résultat faux, jamais une exception qui traverse l'interface.
 */

import * as R from './rational.js';

export const MAX_DEGREE = 6;
export const MAX_TERMS = 80;

/** Une erreur MOTIVÉE : l'interface traduit `code`, jamais le message. */
export class AlgebraError extends Error {
  constructor(code, detail = undefined) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

/** Une RangeError de rational.js → le code que l'élève lira. */
export function rangeCode(error) {
  if (error instanceof AlgebraError) return error.code;
  if (error instanceof RangeError) return error.message === 'divideByZero' ? 'divideByZero' : 'overflow';

  return null;
}

// ── Les monômes ───────────────────────────────────────────────────────────

function cleanMono(mono) {
  const out = {};
  for (const name of Object.keys(mono).sort()) {
    if (mono[name] !== 0) out[name] = mono[name];
  }

  return out;
}

export function monoKey(mono) {
  return Object.keys(mono).sort().map((name) => (mono[name] === 1 ? name : `${name}^${mono[name]}`)).join('');
}

export function monoDegree(mono) {
  return Object.values(mono).reduce((sum, exponent) => sum + exponent, 0);
}

export function mergeMono(a, b) {
  const out = { ...a };
  for (const [name, exponent] of Object.entries(b)) out[name] = (out[name] ?? 0) + exponent;

  return cleanMono(out);
}

/** L'ordre du manuel : degré décroissant, puis lettre par lettre, puissance décroissante. */
export function compareMonos(a, b) {
  const degree = monoDegree(b) - monoDegree(a);
  if (degree !== 0) return degree;
  const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  for (const name of names) {
    const diff = (b[name] ?? 0) - (a[name] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

// ── Les polynômes ─────────────────────────────────────────────────────────

/** Réduit et trie une liste de termes (combine les monômes égaux, retire les nuls). */
export function makePoly(terms) {
  const byKey = new Map();
  for (const term of terms) {
    const mono = cleanMono(term.mono ?? {});
    if (monoDegree(mono) > MAX_DEGREE) throw new AlgebraError('degreeTooHigh');
    const key = monoKey(mono);
    const existing = byKey.get(key);
    byKey.set(key, existing ? { coef: R.add(existing.coef, term.coef), mono } : { coef: term.coef, mono });
  }
  const out = [...byKey.values()].filter((term) => !R.isZero(term.coef));
  if (out.length > MAX_TERMS) throw new AlgebraError('tooManyTerms');

  return out.sort((a, b) => compareMonos(a.mono, b.mono));
}

export function constantPoly(value) { return makePoly([{ coef: value, mono: {} }]); }
export function variablePoly(name) { return makePoly([{ coef: R.ONE, mono: { [name]: 1 } }]); }

export function addPoly(p, q) { return makePoly([...p, ...q]); }
function negPoly(p) { return p.map((term) => ({ coef: R.negate(term.coef), mono: term.mono })); }
export function subPoly(p, q) { return addPoly(p, negPoly(q)); }

export function mulPoly(p, q) {
  if (p.length * q.length > MAX_TERMS * 4) throw new AlgebraError('tooManyTerms');
  const terms = [];
  for (const a of p) {
    for (const b of q) terms.push({ coef: R.multiply(a.coef, b.coef), mono: mergeMono(a.mono, b.mono) });
  }

  return makePoly(terms);
}

export function powPoly(p, exponent) {
  let acc = constantPoly(R.ONE);
  for (let i = 0; i < exponent; i += 1) acc = mulPoly(acc, p);

  return acc;
}

export function isConstantPoly(p) { return p.every((term) => monoDegree(term.mono) === 0); }
export function polyDegree(p) { return p.reduce((max, term) => Math.max(max, monoDegree(term.mono)), 0); }

export function polyVariables(p) {
  return [...new Set(p.flatMap((term) => Object.keys(term.mono)))].sort();
}

export function polyEquals(p, q) {
  if (p.length !== q.length) return false;

  return p.every((term, i) => monoKey(term.mono) === monoKey(q[i].mono) && R.equals(term.coef, q[i].coef));
}

/** Les coefficients `[c0, c1, …, cn]` d'un polynôme en UNE lettre, ou null s'il en porte une autre. */
export function toCoefficients(p, variable) {
  if (p.some((term) => Object.keys(term.mono).some((name) => name !== variable))) return null;
  const degree = polyDegree(p);
  const coefs = Array.from({ length: degree + 1 }, () => R.ZERO);
  for (const term of p) coefs[term.mono[variable] ?? 0] = term.coef;

  return coefs;
}

export function fromCoefficients(coefs, variable) {
  return makePoly(coefs.map((coef, power) => ({ coef, mono: power === 0 ? {} : { [variable]: power } })));
}

/** La valeur en un point (rationnel) d'un polynôme à une lettre. */
export function evaluateCoefficients(coefs, value) {
  let acc = R.ZERO;
  for (let i = coefs.length - 1; i >= 0; i -= 1) acc = R.add(R.multiply(acc, value), coefs[i]);

  return acc;
}

/** Retire les coefficients de tête nuls : `[1, 2, 0]` → `[1, 2]`. */
export function trimCoefficients(coefs) {
  const out = [...coefs];
  while (out.length > 1 && R.isZero(out[out.length - 1])) out.pop();

  return out;
}

/** Division euclidienne de deux polynômes à une lettre (coefficients rationnels). */
export function divideCoefficients(numerator, denominator) {
  const d = trimCoefficients(denominator);
  if (d.length === 1 && R.isZero(d[0])) throw new AlgebraError('divideByZero');
  let remainder = trimCoefficients(numerator);
  const quotient = Array.from({ length: Math.max(1, remainder.length - d.length + 1) }, () => R.ZERO);
  while (remainder.length >= d.length && !(remainder.length === 1 && R.isZero(remainder[0]))) {
    const shift = remainder.length - d.length;
    const factor = R.divide(remainder[remainder.length - 1], d[d.length - 1]);
    quotient[shift] = factor;
    const next = [...remainder];
    for (let i = 0; i < d.length; i += 1) next[i + shift] = R.subtract(next[i + shift], R.multiply(factor, d[i]));
    next.pop();
    remainder = trimCoefficients(next.length ? next : [R.ZERO]);
    if (shift === 0) break;
  }

  return { quotient: trimCoefficients(quotient), remainder };
}

function isZeroCoefficients(coefs) { return coefs.every((c) => R.isZero(c)); }

/** PGCD de deux polynômes à une lettre, UNITAIRE (Euclide sur les rationnels). */
export function gcdCoefficients(a, b) {
  let x = trimCoefficients(a);
  let y = trimCoefficients(b);
  let guard = 0;
  while (!isZeroCoefficients(y) && guard < 20) {
    const { remainder } = divideCoefficients(x, y);
    x = y;
    y = remainder;
    guard += 1;
  }
  const lead = x[x.length - 1];
  if (R.isZero(lead)) return [R.ONE];

  return x.map((c) => R.divide(c, lead));
}

// ── Nombres entiers ───────────────────────────────────────────────────────

export function gcdInt(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];

  return x;
}

export function lcmInt(a, b) {
  if (a === 0 || b === 0) return 0;

  return Math.abs((a / gcdInt(a, b)) * b);
}

/** Les diviseurs positifs de n (n ≤ 10^8 en pratique). */
export function divisors(n) {
  const value = Math.abs(n);
  if (value === 0 || value > 1e8) return [];
  const small = [];
  const large = [];
  for (let i = 1; i * i <= value; i += 1) {
    if (value % i === 0) {
      small.push(i);
      if (i * i !== value) large.unshift(value / i);
    }
  }

  return [...small, ...large];
}

/** La racine carrée ENTIÈRE exacte, ou null. */
export function exactSqrtInt(n) {
  if (!Number.isInteger(n) || n < 0) return null;
  const root = Math.round(Math.sqrt(n));

  return root * root === n ? root : null;
}

/** La racine carrée exacte d'un rationnel positif, ou null. */
export function exactSqrtRational(r) {
  if (R.isNegative(r)) return null;
  const n = exactSqrtInt(r.n);
  const d = exactSqrtInt(r.d);

  return n === null || d === null ? null : R.makeRational(n, d);
}

/**
 * √r = k·√m avec m entier sans facteur carré : `√12 = 2√3`, `√(1/2) = ½√2`.
 * @returns {{k: object, m: number}}
 */
export function simplifySqrt(r) {
  if (R.isNegative(r)) throw new AlgebraError('negativeRoot');
  let inside = r.n * r.d; // √(n/d) = √(n·d)/d
  if (!Number.isSafeInteger(inside)) throw new AlgebraError('overflow');
  let outside = 1;
  for (let f = 2; f * f <= inside; f += 1) {
    while (inside % (f * f) === 0) {
      inside /= f * f;
      outside *= f;
    }
  }

  return { k: R.makeRational(outside, r.d), m: inside };
}

/**
 * Le « contenu » d'un polynôme à coefficients rationnels : le rationnel c
 * tel que p / c ait des coefficients ENTIERS premiers entre eux, de
 * coefficient dominant positif. `6x^2 + 9x` → 3 ; `-x^2 + 4` → −1 ;
 * `\frac{1}{2}x + 1` → ½.
 */
export function contentOf(coefs) {
  const nonzero = coefs.filter((c) => !R.isZero(c));
  if (nonzero.length === 0) return R.ONE;
  const numerators = nonzero.reduce((g, c) => gcdInt(g, c.n), 0);
  const denominators = nonzero.reduce((l, c) => lcmInt(l || 1, c.d), 1);
  const lead = coefs[trimCoefficients(coefs).length - 1];

  return R.makeRational(R.isNegative(lead) ? -numerators : numerators, denominators);
}

// ── L'écriture ────────────────────────────────────────────────────────────

/** `x^{2}y` — la partie littérale seule. */
function monoLatex(mono) {
  return Object.keys(mono).sort().map((name) => (mono[name] === 1 ? name : `${name}^{${mono[name]}}`)).join('');
}

/** Le CORPS d'un terme, sans signe : `3x^{2}`, `\frac{1}{2}x`, `x`, `5`. */
export function termBody(coef, mono) {
  const abs = R.isNegative(coef) ? R.negate(coef) : coef;
  const letters = monoLatex(mono);
  if (!letters) return R.toLatex(abs);
  if (R.equals(abs, R.ONE)) return letters;

  return `${R.toLatex(abs)}${letters}`;
}

/**
 * Une liste de morceaux `{ negative, body, color? }` écrite comme le manuel :
 * `x^{2} - 3x + 2x - 6`. La couleur, quand elle est donnée, enveloppe le
 * morceau SIGNE COMPRIS (`\textcolor{…}{-3x}`), pour que la famille se lise.
 */
export function joinPieces(pieces) {
  if (pieces.length === 0) return '0';

  return pieces.map((piece, index) => {
    // Hors tête, `{} - 3x` garde au signe son espacement d'opérateur binaire
    // même enveloppé dans \textcolor.
    const inner = index === 0
      ? `${piece.negative ? '-' : ''}${piece.body}`
      : `{} ${piece.negative ? '-' : '+'} ${piece.body}`;
    if (piece.color) return `${index === 0 ? '' : ' '}\\textcolor{${piece.color}}{${inner}}`;

    return index === 0 ? inner : ` ${piece.negative ? '-' : '+'} ${piece.body}`;
  }).join('');
}

export function termPiece(term, color = undefined) {
  return { negative: R.isNegative(term.coef), body: termBody(term.coef, term.mono), color };
}

/** Un polynôme en LaTeX : `x^{2} - x - 6`, `0` quand il est nul. */
export function polyLatex(p, colorOf = null) {
  if (p.length === 0) return '0';

  return joinPieces(p.map((term) => termPiece(term, colorOf ? colorOf(monoKey(term.mono)) : undefined)));
}

const SUPERSCRIPTS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

/** Un LaTeX simple (celui que produit ce module) → texte lisible. */
export function latexToText(latex) {
  return String(latex)
    .replace(/\{\}/g, '')
    .replace(/\\textcolor\{[^}]*\}\{([^{}]*)\}/g, '$1')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
    .replace(/\^\{(\d+)\}/g, (_, digits) => digits.split('').map((d) => SUPERSCRIPTS[d]).join(''))
    .replace(/\\left|\\right/g, '')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\,/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/-/g, '−')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Un polynôme à une lettre, à partir de ses coefficients. */
export function coefficientsLatex(coefs, variable = 'x', colorOf = null) {
  return polyLatex(fromCoefficients(coefs, variable), colorOf);
}
