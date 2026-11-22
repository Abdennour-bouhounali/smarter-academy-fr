/**
 * La fonction affine EXACTE — le calcul commun de l'unité 7 « الدالة التآلفية »
 * (compteur à partie fixe, droite qui ne passe pas par O, escalier des accroissements,
 * deux droites qui se coupent, deux tarifs comparés).
 *
 * Bâti sur linear.js (une fonction affine x ⟼ ax + b EST l'expression { a, b } de l'unité 4)
 * et sur linearSystem.js (une équation ax + by = c). Rien n'arrondit. Les vues ne recalculent
 * jamais une règle : elles appellent ce module.
 *
 *   const f = affine('200x+2000');                 // نشاط 4 : الاشتراك السنوي
 *   imageOf(f, 7)                    → 3400
 *   antecedentOf(f, 4800)            → { kind: 'unique', x: 14 }
 *   classifyRule('3x^2+1')           → 'other'       ; classifyRule('5x') → 'linear'
 *   fromTwoPoints(1, 2200, 4, 2800)  → { a: 200, b: 2000 }
 *   rateOfChange(f, 6, 4)            → 200           (f(6) − f(4)) / (6 − 4)
 *   lineFromEquation(eq2('100x+200y=5000')) → affine('-x/2+25')   (نشاط 5)
 *   intersect(affine('43-x'), affine('25-x/2')) → { kind: 'unique', x: 36, y: 7 }
 *   comparePlans(affine('1500+100x'), affine('250x')) → { kind: 'cross', x: 10, … }
 */
import {
  frac, parseNumber, add, sub, mul, div, eq, cmp, isZero, neg, lin, linAt, linear, linLatex,
} from './linear.js';

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));

/**
 * Une fonction affine lue dans l'écriture du manuel : « 3/2x+1 », « 2+3x », « -x/2+25 »,
 * « 43-x », « 5x » (b = 0), « 7 » (a = 0). Ou directement deux nombres (a, b).
 */
export function affine(src, b) {
  if (b !== undefined) return lin(F(src), F(b));
  return linear(String(src).replace(/^f\(x\)=|^y=/, ''));
}

/** « 200x + 2000 », « -\dfrac{1}{2}x + 25 » : l'écriture de f(x). */
export const affineLatex = (f) => linLatex(f);

/**
 * Les trois noms du manuel pour UNE même famille : toute fonction x ⟼ ax + b est تآلفية ;
 * b = 0 → elle est AUSSI خطية ; a = 0 → elle est AUSSI ثابتة (x ⟼ 0 est les deux).
 */
export function kindOf(f) {
  return Object.freeze({ affine: true, linear: isZero(f.b), constant: isZero(f.a) });
}

/**
 * Classe une règle écrite (نشاط 2) : 'linear' (ax, a ≠ 0), 'constant' (b seul),
 * 'affine' (ax + b, a ≠ 0 et b ≠ 0), ou 'other' quand la règle n'est pas du premier degré
 * (« 3x^2+1 », « 1/x-3 ») — ces deux-là NE SONT PAS des fonctions affines.
 */
export function classifyRule(src) {
  let f;
  try { f = affine(src); } catch { return 'other'; }
  if (isZero(f.a)) return 'constant';
  return isZero(f.b) ? 'linear' : 'affine';
}

/** f(x) = a·x + b. */
export const imageOf = (f, x) => linAt(f, F(x));

/**
 * Le nombre dont l'image est m : ax + b = m. 'unique' (a ≠ 0 : x = (m − b)/a),
 * 'none' (fonction constante b ≠ m), 'all' (fonction constante b = m).
 */
export function antecedentOf(f, m) {
  const rhs = sub(F(m), f.b);
  if (isZero(f.a)) return Object.freeze(isZero(rhs) ? { kind: 'all' } : { kind: 'none' });
  return Object.freeze({ kind: 'unique', x: div(rhs, f.a) });
}

/** Le point (x ; y) est-il sur la droite de f ? */
export const onLine = (f, x, y) => eq(imageOf(f, x), F(y));

/** Le sens de la droite de gauche à droite : 'up' (a > 0), 'down' (a < 0), 'flat' (a = 0). */
export function direction(f) {
  const c = cmp(f.a, frac(0));
  return c > 0 ? 'up' : c < 0 ? 'down' : 'flat';
}

/** الترتيب عند المبدأ : la droite coupe l'axe des ordonnées en (0 ; b). */
export const yIntercept = (f) => Object.freeze({ x: frac(0), y: f.b });

/** Le point où la droite coupe l'axe des abscisses (a ≠ 0), sinon null. */
export const xIntercept = (f) => (isZero(f.a) ? null : Object.freeze({ x: div(neg(f.b), f.a), y: frac(0) }));

/**
 * تناسب التغيّرات : (f(x1) − f(x2)) / (x1 − x2), toujours égal à a — quels que soient
 * les deux nombres distincts choisis. C'est l'INVARIANT de la leçon 3.
 */
export function rateOfChange(f, x1, x2) {
  const dx = sub(F(x1), F(x2));
  if (isZero(dx)) throw new Error('rateOfChange: x1 = x2');
  return div(sub(imageOf(f, x1), imageOf(f, x2)), dx);
}

/**
 * La fonction affine telle que f(x1) = y1 et f(x2) = y2 (x1 ≠ x2) :
 * a = (y1 − y2)/(x1 − x2), puis b = y1 − a·x1.
 */
export function fromTwoPoints(x1, y1, x2, y2) {
  const dx = sub(F(x1), F(x2));
  if (isZero(dx)) throw new Error('fromTwoPoints: deux abscisses égales');
  const a = div(sub(F(y1), F(y2)), dx);
  return lin(a, sub(F(y1), mul(a, F(x1))));
}

/** b connu a : b = y − a·x (le point (x ; y) est sur la droite). */
export const interceptFrom = (a, x, y) => sub(F(y), mul(F(a), F(x)));

/**
 * Une équation ax + by = c (linearSystem.eqn / eq2) écrite y = mx + p : la droite de la
 * fonction affine x ⟼ −(a/b)x + c/b. b = 0 : droite verticale, pas une fonction → null.
 */
export function lineFromEquation(e) {
  if (isZero(e.b)) return null;
  return lin(div(neg(e.a), e.b), div(e.c, e.b));
}

/**
 * Deux droites y = f(x) et y = g(x) : 'unique' (sécantes, le point commun = la ثنائية
 * solution), 'parallel' (même a, b différents : pas de solution), 'same' (confondues :
 * une infinité de solutions).
 */
export function intersect(f, g) {
  const da = sub(f.a, g.a);
  if (isZero(da)) return Object.freeze({ kind: eq(f.b, g.b) ? 'same' : 'parallel' });
  const x = div(sub(g.b, f.b), da);
  return Object.freeze({ kind: 'unique', x, y: imageOf(f, x) });
}

/**
 * Deux tarifs (coût en fonction de x). 'cross' : à x le coût est le même ; `cheaperBefore`
 * est le tarif le moins cher pour les x < x0 ('f' ou 'g'), `cheaperAfter` pour x > x0.
 * 'parallel' : l'un est toujours moins cher (`cheaper`). 'same' : identiques.
 */
export function comparePlans(f, g) {
  const r = intersect(f, g);
  if (r.kind === 'same') return Object.freeze({ kind: 'same' });
  if (r.kind === 'parallel') return Object.freeze({ kind: 'parallel', cheaper: cmp(f.b, g.b) < 0 ? 'f' : 'g' });
  const before = cmp(f.a, g.a) > 0 ? 'f' : 'g'; // la pente la plus forte est en dessous avant le croisement
  return Object.freeze({ kind: 'cross', x: r.x, y: r.y, cheaperBefore: before, cheaperAfter: before === 'f' ? 'g' : 'f' });
}

/** Le(s) tarif(s) le(s) moins cher(s) pour une valeur x : indices dans `plans`. */
export function cheapestAt(plans, x) {
  const costs = plans.map((p) => imageOf(p, x));
  let best = costs[0];
  for (const c of costs) if (cmp(c, best) < 0) best = c;
  return costs.map((c, i) => (eq(c, best) ? i : -1)).filter((i) => i >= 0);
}

/** Le pas « 1 vers la droite, a vers le haut » à partir de (x ; f(x)) — l'escalier de la droite. */
export function stepFrom(f, x, dx = 1) {
  const x2 = add(F(x), F(dx));
  return Object.freeze({ from: { x: F(x), y: imageOf(f, x) }, to: { x: x2, y: imageOf(f, x2) }, dy: mul(f.a, F(dx)) });
}
