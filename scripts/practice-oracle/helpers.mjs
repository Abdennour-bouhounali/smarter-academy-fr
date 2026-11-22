// Outils de l'oracle pour l'unité 3 « الحساب الحرفي ».
//
// L'oracle doit RECALCULER chaque réponse sans lire le contenu ni réutiliser
// le code testé : ce petit calcul polynomial à coefficients RATIONNELS exacts
// est écrit ici, indépendant de packages/core/arithmetic/polynomials.js.
//
//   const A = poly.x.add(2).mul(poly.x.mul(3).sub(1));   // (x + 2)(3x − 1)
//   A.coef(1)          → '5'        (coefficient de x, en chaîne exacte)
//   A.at(0)            → '-2'       (valeur pour x = 0)
//   A.at('1/2')        → valeur exacte pour x = 1/2
//   poly.of(7).pow(2)  → 49
export const R = (v) => ({ value: String(v) });
export const C = (id) => ({ choiceId: id });
/** Une ثنائية (answerType `point`) : P(13, 19), P('-1/2', '-5/2'). */
export const P = (x, y) => ({ x: String(x), y: String(y) });

const g = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
class Q {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new Error('division by zero');
    if (d < 0n) { n = -n; d = -d; }
    const k = g(n, d) || 1n; this.n = n / k; this.d = d / k;
  }
  static from(v) {
    if (v instanceof Q) return v;
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return new Q(v);
      const s = String(v); const [i, f = ''] = s.split('.'); return new Q(BigInt(i + f), 10n ** BigInt(f.length));
    }
    const s = String(v).replace(',', '.');
    if (s.includes('/')) { const [a, b] = s.split('/'); return Q.from(a).div(Q.from(b)); }
    if (s.includes('.')) { const neg = s.startsWith('-'); const [i, f] = s.replace('-', '').split('.'); const q = new Q(BigInt(i + f), 10n ** BigInt(f.length)); return neg ? q.neg() : q; }
    return new Q(BigInt(s));
  }
  add(o) { o = Q.from(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return this.add(Q.from(o).neg()); }
  mul(o) { o = Q.from(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.from(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  isZero() { return this.n === 0n; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
}

class Poly {
  constructor(c = []) { this.c = c.map((v) => Q.from(v)); while (this.c.length && this.c.at(-1).isZero()) this.c.pop(); }
  static of(v) { return v instanceof Poly ? v : new Poly([v]); }
  add(o) { o = Poly.of(o); const n = Math.max(this.c.length, o.c.length); return new Poly(Array.from({ length: n }, (_, i) => (this.c[i] ?? new Q(0)).add(o.c[i] ?? new Q(0)))); }
  sub(o) { return this.add(Poly.of(o).mul(-1)); }
  mul(o) {
    o = Poly.of(o);
    const out = Array.from({ length: this.c.length + o.c.length }, () => new Q(0));
    this.c.forEach((a, i) => o.c.forEach((b, j) => { out[i + j] = out[i + j].add(a.mul(b)); }));
    return new Poly(out);
  }
  pow(k) { let r = new Poly([1]); for (let i = 0; i < k; i++) r = r.mul(this); return r; }
  coef(k) { return (this.c[k] ?? new Q(0)).toString(); }
  degree() { return this.c.length - 1; }
  at(x) { const X = Q.from(x); return this.c.reduceRight((acc, a) => acc.mul(X).add(a), new Q(0)).toString(); }
  equals(o) { o = Poly.of(o); return this.sub(o).c.length === 0; }
}

export const poly = { x: new Poly([0, 1]), of: (v) => Poly.of(v), Q: (v) => Q.from(v) };
/** Valeur exacte d'un calcul numérique (fractions et décimaux), en chaîne. */
export const q = (v) => Q.from(v);

/**
 * Unité 5 : la jumla a1·x + b1·y = c1 ; a2·x + b2·y = c2 résolue par Cramer en rationnels EXACTS
 * (indépendant de packages/core/arithmetic/linearSystem.js). Rend [x, y] en chaînes ('13', '-1/2'),
 * ou lève une erreur si le déterminant est nul.
 */
export function solve2(a1, b1, c1, a2, b2, c2) {
  const [A1, B1, C1, A2, B2, C2] = [a1, b1, c1, a2, b2, c2].map((v) => Q.from(v));
  const D = A1.mul(B2).sub(A2.mul(B1));
  if (D.isZero()) throw new Error('solve2: déterminant nul');
  return [C1.mul(B2).sub(C2.mul(B1)).div(D).toString(), A1.mul(C2).sub(A2.mul(C1)).div(D).toString()];
}
