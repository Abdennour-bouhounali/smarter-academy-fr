/**
 * La proportionnalité EXACTE — le calcul commun de l'unité 6 « الدالة الخطية والتناسبية »
 * (tableau de proportionnalité, machine linéaire, droite par l'origine, pourcentages).
 *
 * Un nombre est une fraction { n, d } de linear.js (aucun arrondi) ; un tableau est deux
 * lignes de même longueur. Les vues ne recalculent jamais une règle : elles appellent ce module.
 *
 *   tableRatios(['2', '3'], ['0,6', '0,9'])   → { proportional: true, a: 3/10, ratios: [3/10, 3/10] }
 *   fourthProportional(-2, 6, 3)               → -9            (le أستعدّ 4)
 *   coefficientFrom(-2, 6)                     → -3            (g(−2) = 6, طرائق ص 69)
 *   percentMultiplier(20, 'decrease')          → 4/5           (x ⟼ 0,8x)
 *   chainMultiplier([[3, 'increase'], [2, 'decrease'], [1, 'decrease']]) → 1,03 × 0,98 × 0,99
 *   rule('2x-1').at(0) → -1 ; isLinear(rule('2x-1')) → false
 */
import { frac, parseNumber, add, sub, mul, div, eq, isZero, cmp } from './linear.js';

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/** Le quotient y / x d'une colonne (x ≠ 0). */
export function ratio(x, y) {
  if (isZero(F(x))) throw new Error('ratio: x = 0');
  return div(F(y), F(x));
}

/**
 * Un tableau est de proportionnalité ⇔ les quotients ligne 2 / ligne 1 sont tous égaux.
 * Une colonne x = 0 ne donne pas de quotient : elle n'est compatible qu'avec y = 0
 * (la colonne (0 ; 0) d'une fonction linéaire).
 */
export function tableRatios(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) throw new Error('tableRatios: lignes inégales');
  const ratios = [];
  let zeroOk = true;
  xs.forEach((x, i) => {
    if (isZero(F(x))) { if (!isZero(F(ys[i]))) zeroOk = false; ratios.push(null); return; }
    ratios.push(ratio(x, ys[i]));
  });
  const defined = ratios.filter(Boolean);
  const same = defined.length > 0 && defined.every((r) => eq(r, defined[0]));
  const proportional = zeroOk && same;
  return Object.freeze({ proportional, a: proportional ? defined[0] : null, ratios });
}

/** Le rapport commun d'un tableau, ou `null`. */
export const commonRatio = (xs, ys) => tableRatios(xs, ys).a;

/** Le quatrième proportionnel : y2 tel que (x1 ; y1) et (x2 ; y2) soient proportionnels. */
export function fourthProportional(x1, y1, x2) {
  return mul(ratio(x1, y1), F(x2));
}

/** Le coefficient a de la fonction linéaire telle que f(m) = n — l'équation a·m = n (m ≠ 0). */
export function coefficientFrom(m, n) {
  if (isZero(F(m))) throw new Error('coefficientFrom: m = 0 — un nombre nul ne détermine pas a');
  return div(F(n), F(m));
}

/** f(x) = a·x. */
export const image = (a, x) => mul(F(a), F(x));

/** Le nombre dont l'image est y par x ⟼ a·x (a ≠ 0). */
export function antecedent(a, y) {
  if (isZero(F(a))) throw new Error('antecedent: a = 0');
  return div(F(y), F(a));
}

/** Le point (x ; y) est-il sur la droite y = a·x ? */
export const onLine = (a, x, y) => eq(image(a, x), F(y));

/** La pente d'une droite par O : « monte » (a > 0), « descend » (a < 0) ou horizontale. */
export function direction(a) {
  const c = cmp(F(a), frac(0));
  return c > 0 ? 'rising' : c < 0 ? 'falling' : 'flat';
}

/** Le multiplicateur de « prendre t % », « augmenter de t % », « diminuer de t % ». */
export function percentMultiplier(t, kind) {
  const r = div(F(t), frac(100));
  if (kind === 'take') return r;
  if (kind === 'increase') return add(frac(1), r);
  if (kind === 'decrease') return sub(frac(1), r);
  throw new Error(`percentMultiplier: ${kind}`);
}

/** Le produit des multiplicateurs de changements successifs [[t, kind], …]. */
export const chainMultiplier = (steps) => steps.reduce((k, [t, kind]) => mul(k, percentMultiplier(t, kind)), frac(1));

/** Le multiplicateur relu comme un changement global : { kind: 'increase'|'decrease'|'none', t }. */
export function percentChange(k) {
  const d = sub(F(k), frac(1));
  const c = cmp(d, frac(0));
  if (c === 0) return Object.freeze({ kind: 'none', t: frac(0) });
  const t = mul(c > 0 ? d : sub(frac(0), d), frac(100));
  return Object.freeze({ kind: c > 0 ? 'increase' : 'decrease', t });
}

// ── Règles « machines » : a·x, a·x + b, x² ─────────────────────────────────
/**
 * Une règle de calcul x ⟼ … lue dans l'écriture du manuel : « 2x », « -0,5x », « 2x-1 », « x^2 »,
 * « 3x+1 ». Sert à la machine de la leçon 2 (تمييز دوال خطية) : seule a·x est LINÉAIRE.
 */
export function rule(src) {
  const s = String(src).replace(/\s+/g, '').replace(/[−–]/g, '-').replace(/²/g, '^2');
  if (/^x\^2$/.test(s)) return Object.freeze({ kind: 'square', src: s, at: (x) => mul(F(x), F(x)) });
  const m = s.match(/^([+-]?[\d.,/]*)x([+-][\d.,/]+)?$/);
  if (!m) throw new Error(`règle illisible : « ${src} »`);
  const a = m[1] === '' || m[1] === '+' ? frac(1) : m[1] === '-' ? frac(-1) : parseNumber(m[1]);
  const b = m[2] ? parseNumber(m[2]) : frac(0);
  return Object.freeze({ kind: isZero(b) ? 'linear' : 'affine', src: s, a, b, at: (x) => add(mul(a, F(x)), b) });
}

/** Une règle est linéaire ⇔ elle est de la forme a·x. */
export const isLinear = (r) => r.kind === 'linear';

/**
 * Les deux TÉMOINS qu'une machine n'est pas linéaire : f(0) ≠ 0, ou f(2x) ≠ 2·f(x).
 * Renvoie la liste des témoins trouvés sur les entrées essayées (vide pour a·x).
 */
export function linearityWitnesses(r, tries = [1, 2, 3]) {
  const out = [];
  if (!isZero(r.at(0))) out.push({ kind: 'zero', x: frac(0), fx: r.at(0) });
  for (const x of tries) {
    const fx = r.at(x); const f2x = r.at(mul(F(x), frac(2)));
    if (!eq(f2x, mul(fx, frac(2)))) { out.push({ kind: 'double', x: F(x), fx, f2x }); break; }
  }
  return out;
}
