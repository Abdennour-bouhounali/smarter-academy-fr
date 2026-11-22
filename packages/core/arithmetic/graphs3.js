/**
 * Le GRAPHIQUE d'une situation de proportionnalité — le calcul exact de la leçon « التناسبية والتمثيل البياني » de 3AM (unité 6 « التناسبية »), construit
 * SUR `linear.js` (fractions exactes, rien n'arrondit). Un « prix » est une règle `{ a, b?, k?, a2? }` : y = a·x (proportionnel), y = a·x + b (des frais
 * fixes : les points sont alignés mais la droite ne passe pas par O), ou y = a·x jusqu'à x = k puis a2 par unité au-delà (le prix change : les points ne
 * sont plus alignés). Une situation est proportionnelle ⇔ tous ses points sont sur UNE droite qui passe par O.
 *
 *   pointsOf({ a: '5' }, [2, 6, 12, 14])                       → (2;10) (6;30) (12;60) (14;70)
 *   classify(points)  → 'prop' | 'aligned' | 'bent'
 *   lineThrough(P, Q)  → { a, b } pour y = a·x + b (les deux points d'abscisses différentes)
 *   onLine(line, pt)   → true si pt est EXACTEMENT sur la droite
 *   coefficient(points) → y/x quand la situation est proportionnelle
 *   valueAt(a, x)      → a·x ;  abscissaAt(a, y) → y ÷ a
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/graphs3.js`), jamais depuis le barrel du cœur.
 */
import * as Lin from './linear.js';

const num = (v) => (typeof v === 'object' ? v : Lin.parseNumber(v));
export const pt = (x, y) => Object.freeze({ x: num(x), y: num(y) });
export const ORIGIN = pt(0, 0);

/** Le y de la règle en x. */
function offerValue(rule, x) {
  const X = num(x);
  const a = num(rule.a);
  const b = rule.b != null ? num(rule.b) : Lin.frac(0);
  if (rule.k != null && Lin.cmp(X, num(rule.k)) > 0) {
    const k = num(rule.k);
    return Lin.add(b, Lin.add(Lin.mul(a, k), Lin.mul(num(rule.a2), Lin.sub(X, k))));
  }
  return Lin.add(Lin.mul(a, X), b);
}

export const pointsOf = (rule, xs) => xs.map((x) => pt(x, offerValue(rule, x)));

/** La droite non verticale par deux points d'abscisses différentes : y = a·x + b. */
export function lineThrough(P, Q) {
  if (Lin.eq(P.x, Q.x)) return null;
  const a = Lin.div(Lin.sub(Q.y, P.y), Lin.sub(Q.x, P.x));
  const b = Lin.sub(P.y, Lin.mul(a, P.x));
  return Object.freeze({ a, b });
}
export const onLine = (line, p) => !!line && Lin.eq(p.y, Lin.add(Lin.mul(line.a, p.x), line.b));

/** Trois points alignés (produit en croix nul). */
const collinear = (P, Q, R) => Lin.isZero(Lin.sub(Lin.mul(Lin.sub(Q.x, P.x), Lin.sub(R.y, P.y)), Lin.mul(Lin.sub(Q.y, P.y), Lin.sub(R.x, P.x))));

/** 'prop' : tous sur une droite par O ; 'aligned' : alignés mais pas avec O ; 'bent' : pas alignés. Au moins deux points, abscisses > 0. */
export function classify(points) {
  if (points.length < 2) throw new Error('au moins deux points');
  const first = points[0];
  const all = points.every((p) => Lin.cmp(p.x, 0) > 0);
  if (!all) throw new Error('abscisses > 0');
  const throughO = points.every((p) => collinear(ORIGIN, first, p));
  if (throughO) return 'prop';
  const line = lineThrough(points[0], points[points.length - 1]);
  return points.every((p) => onLine(line, p)) ? 'aligned' : 'bent';
}

/** Le coefficient y/x d'une situation proportionnelle (null sinon). */
export function coefficient(points) {
  if (classify(points) !== 'prop') return null;
  return Lin.div(points[0].y, points[0].x);
}

export const valueAt = (a, x) => Lin.mul(num(a), num(x));
export const abscissaAt = (a, y) => Lin.div(num(y), num(a));

/** Les points (O compris, s'il est un nœud) qui sont sur la droite par P et Q. */
export function hits(nodes, P, Q) {
  const line = lineThrough(P, Q);
  return nodes.map((n) => (line ? onLine(line, n) : Lin.eq(n.x, P.x)));
}

/** Des graduations « rondes » : le plus petit pas dans 1, 2, 5 × 10^k tel que max/pas ≤ cible. */
function niceStep(max, target = 8) {
  const m = Lin.toNumber(num(max));
  let step = 1;
  for (const mult of [1, 2, 5]) for (let e = -2; e <= 5; e += 1) {
    const s = mult * 10 ** e;
    if (m / s <= target) { step = s; return step; }
  }
  return step;
}
/** Le cadre d'une liste de points : { xMax, yMax, xStep, yStep } (arrondis vers le haut aux pas ronds). */
export function frameFor(points) {
  const mx = Math.max(...points.map((p) => Lin.toNumber(p.x)));
  const my = Math.max(...points.map((p) => Lin.toNumber(p.y)));
  const xStep = niceStep(mx, 8);
  const yStep = niceStep(my, 8);
  return { xMax: Math.ceil(mx / xStep) * xStep, yMax: Math.ceil(my / yStep) * yStep, xStep, yStep };
}

/** Un nombre saisi par l'élève (« جرّب أعدادك ») : décimal positif à 1 décimale au plus ; sinon null. */
export function parsePrice(raw, { min = 0, max = 99 } = {}) {
  try {
    const s = String(raw).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace('٫', ',').trim();
    if (!/^\d{1,2}([.,]\d)?$/.test(s)) return null;
    const v = Lin.parseNumber(s);
    return Lin.cmp(v, min) >= 0 && Lin.cmp(v, max) <= 0 ? v : null;
  } catch { return null; }
}

export const text = (v) => { const p = num(v); return Lin.fracDecimal(p, 4) ?? Lin.fracText(p); };
