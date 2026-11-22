/**
 * Thalès EXACT — le calcul commun de l'unité 9 « خاصية طالس » (manuel pp. 103–113,
 * docs/sources/4am/unit9/extraction.json) : rapports égaux, quatrième proportionnel, coefficient
 * d'agrandissement / de réduction, réciproque (rapports ET ordre des points), partage d'un segment,
 * longueur construite (14/3), ombre d'une minaret, cylindre inscrit dans un cône.
 *
 * Un nombre est une fraction de linear.js ({ n, d }) : AC′ = 56/15 reste 56/15, 3,2 reste 16/5 ;
 * rien n'arrondit sauf l'écriture. Les vues ne recalculent jamais : elles appellent ce module.
 *
 * LA CONVENTION DES ABSCISSES SIGNÉES (le cœur de la réciproque). Sur chacune des deux droites
 * sécantes en A, un point est repéré par son abscisse signée depuis A : B à b, B′ à b′ sur (d) ;
 * C à c, C′ à c′ sur (d′) (b, c ≠ 0). Alors
 *   • le rapport de longueurs est |b′ / b| ;
 *   • « A, B, B′ dans le même ordre que A, C, C′ » ⇔ b′/b et c′/c ont le MÊME SIGNE ;
 *   • (B′C′) // (BC) ⇔ b′/b = c′/c en valeur SIGNÉE.
 * Deux rapports de longueurs égaux mais des signes opposés : la figure 3 de نشاط 2 — non parallèles.
 *
 *   thalesRatios({ AM: 2, AB: 3, AN: 1, AC: 2 })      → { equal: false, … }      (معارف ملاحظة 1)
 *   fourthProportional(6, '3,2', 7)                  → 56/15                      (نشاط 1 : AC′)
 *   converse({ b: 3, bp: -1, c: 3, cp: 1 })          → { ratiosEqual: true, sameOrder: false, parallel: false }
 *   ratioPoint(3, 2)                                 → 3/5   (AM/AB pour MA/MB = 3/2, طرائق ص 109)
 *   constructedLength(3, 7, 2)                       → 14/3  (3/7 = 2/AB, طرائق ص 107)
 *   heightFromShadow({ stick: 1, stickAt: 10, tip: '11,6' }) → 29/4  (تحدّ : 7,25 m)
 *   cylinderInCone({ H: 18, R: 6 }).equalHR           → { r: 9/2, volumeOverPi: 729/8 }
 */
import { frac, parseNumber, add, sub, mul, div, cmp, eq, isZero, neg, fracText, fracLatex, fracDecimal } from './linear.js';

const F = (v) => (typeof v === 'object' && v !== null ? v : Number.isInteger(v) ? frac(v) : parseNumber(v));
const sign = (p) => cmp(F(p), frac(0));
const abs = (p) => (sign(p) < 0 ? neg(F(p)) : F(p));
const positive = (p, name) => { if (sign(p) <= 0) throw new Error(`${name} doit être > 0`); return F(p); };

/** Le rapport part / tout (longueurs > 0). */
export function ratio(part, whole) {
  return div(positive(part, 'part'), positive(whole, 'whole'));
}

/**
 * Les trois rapports de Thalès entre le petit triangle AMN et le grand ABC (toute clé absente
 * est ignorée) : { AM/AB, AN/AC, MN/BC }, `equal` vrai si tous les rapports présents sont égaux.
 */
export function thalesRatios({ AM, AB, AN, AC, MN, BC }) {
  const out = {};
  if (AM != null && AB != null) out.AB = ratio(AM, AB);
  if (AN != null && AC != null) out.AC = ratio(AN, AC);
  if (MN != null && BC != null) out.BC = ratio(MN, BC);
  const list = Object.values(out);
  return Object.freeze({ ...out, equal: list.length >= 2 && list.every((r) => eq(r, list[0])) });
}

/** a/b = c/x ⇒ x = b·c/a — le quatrième proportionnel (le « جداء تصالبي »). */
export function fourthProportional(a, b, c) {
  return div(mul(F(b), F(c)), positive(a, 'a'));
}

/** Le produit en croix : a/b = c/d ⇔ a·d = b·c (la vérification de طرائق ص 109). */
export const crossEqual = (a, b, c, d) => eq(mul(F(a), F(d)), mul(F(b), F(c)));

/** k = longueur image / longueur de départ ; 'reduction' (k < 1), 'enlargement' (k > 1), 'same' (k = 1). */
export function scale(from, to) {
  const k = ratio(to, from);
  const c = cmp(k, frac(1));
  return Object.freeze({ k, kind: c < 0 ? 'reduction' : c > 0 ? 'enlargement' : 'same' });
}

/** Les longueurs du triangle image : chaque longueur × k. */
export const imageLengths = (k, lengths) => lengths.map((l) => mul(F(k), F(l)));

/** L'aire est multipliée par k² (أتعمّق 21 : 𝒜₂ = (2/3)² 𝒜₁). */
export const areaFactor = (k) => mul(F(k), F(k));

/**
 * La réciproque, sur les abscisses SIGNÉES (voir l'en-tête). Renvoie les deux rapports de
 * longueurs, s'ils sont égaux, si l'ordre est le même, et la conclusion — parallèles seulement
 * si les DEUX conditions tiennent. `reason` nomme la condition qui manque.
 */
export function converse({ b, bp, c, cp }) {
  if (isZero(F(b)) || isZero(F(c))) throw new Error('converse: B et C doivent différer de A');
  if (isZero(F(bp)) || isZero(F(cp))) throw new Error('converse: B′ et C′ doivent différer de A');
  const kb = div(F(bp), F(b));
  const kc = div(F(cp), F(c));
  const ratiosEqual = eq(abs(kb), abs(kc));
  const sameOrder = sign(kb) === sign(kc);
  const parallel = ratiosEqual && sameOrder;
  return Object.freeze({
    ratioB: abs(kb), ratioC: abs(kc), ratiosEqual, sameOrder, parallel,
    reason: parallel ? null : !ratiosEqual ? 'ratios' : 'order',
  });
}

/** L'abscisse signée de C′ qui rend (B′C′) // (BC) : c′ = c · b′/b. */
export const parallelPartner = ({ b, bp, c }) => mul(F(c), div(F(bp), F(b)));

/** Les n − 1 points intérieurs qui partagent [AB] en n parts égales, en fraction de AB : 1/n, 2/n, … */
export function divisionFractions(n) {
  if (!Number.isInteger(n) || n < 2) throw new Error('divisionFractions: n ≥ 2');
  return Array.from({ length: n - 1 }, (_, i) => frac(i + 1, n));
}

/**
 * Le point M de (AB) tel que MA / MB = p / q, en fraction AM/AB (abscisse depuis A, B à 1).
 * `inside` : M sur [AB] → p / (p + q) ; sinon M hors de [AB] → p / (p − q) (p ≠ q ; négatif si p < q,
 * c'est-à-dire du côté de A opposé à B).
 */
export function ratioPoint(p, q, inside = true) {
  const P = positive(p, 'p'); const Q = positive(q, 'q');
  if (inside) return div(P, add(P, Q));
  if (eq(P, Q)) throw new Error('ratioPoint: p = q n’a pas de point extérieur');
  return div(P, sub(P, Q));
}

/** La position AM/AB d'un point M de la droite pour AM/AB = r donné du MÊME côté que B ou de l'autre. */
export const signedPosition = (r, sameSideAsB = true) => (sameSideAsB ? F(r) : neg(F(r)));

/**
 * La longueur construite par le report : sur [Ax) AC = a, AD = b, sur [Ay) AE = c ; la parallèle à (CE)
 * par D coupe [Ay) en B : a / b = c / AB ⇒ AB = b·c / a (طرائق ص 107 : 3/7 = 2/AB ⇒ AB = 14/3).
 */
export const constructedLength = (a, b, c) => fourthProportional(a, b, c);

/**
 * Une longueur cible p/q (unité u) s'obtient par le report de q unités et p unités (ou de toute écriture
 * p·m / q avec m entier) : renvoie un report { a: q, b: p, c: 1 } quand c'est le plus simple.
 */
export function reportFor(target) {
  const t = positive(target, 'target');
  return Object.freeze({ a: t.d, b: t.n, c: 1 });
}

/**
 * La hauteur par l'ombre (تحدّ) : un bâton de hauteur `stick` planté à `stickAt` du pied de l'objet, dont
 * l'ombre finit au même point que celle de l'objet, à `tip` du pied : h / stick = tip / (tip − stickAt).
 */
export function heightFromShadow({ stick, stickAt, tip }) {
  const shadow = sub(F(tip), F(stickAt));
  return fourthProportional(shadow, F(tip), F(stick));
}

/**
 * Le cylindre de rayon r et de hauteur h posé sur la base d'un cône (hauteur H, rayon R), son cercle
 * supérieur sur le cône : dans la coupe axiale, r / R = (H − h) / H (Thalès au sommet O du cône).
 */
export function cylinderInCone({ H, R }) {
  const HH = positive(H, 'H'); const RR = positive(R, 'R');
  const radiusFor = (h) => div(mul(RR, sub(HH, F(h))), HH);
  const heightFor = (r) => div(mul(HH, sub(RR, F(r))), RR);
  const r = div(mul(RR, HH), add(HH, RR));
  return Object.freeze({
    radiusFor, heightFor,
    /** V / π = r² h */
    volumeOverPi: (rr, hh) => mul(mul(F(rr), F(rr)), F(hh)),
    /** h = r ⇒ r / R = (H − r) / H ⇒ r = R·H / (H + R) */
    equalHR: Object.freeze({ r, h: r, volumeOverPi: mul(mul(r, r), r) }),
  });
}

/** Écritures : « 56/15 », LaTeX du manuel, virgule décimale quand elle est finie et courte. */
export const thalesText = (p, maxDigits = 3) => fracDecimal(F(p), maxDigits) ?? fracText(F(p));
export const thalesLatex = (p, maxDigits = 3) => { const d = fracDecimal(F(p), maxDigits); return d == null ? fracLatex(F(p)) : d.replace(',', '{,}'); };

/** L'arrondi décimal d'une fraction (« المدوّر إلى الجزء من 10 »), écrit avec la virgule. */
export function rounded(p, digits = 1) {
  const x = Number(F(p).n) / Number(F(p).d);
  const s = (Math.round(x * 10 ** digits) / 10 ** digits).toFixed(digits);
  return s.replace('.', ',');
}
