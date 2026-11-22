/**
 * PYTHAGORE EXACT — 3AM, unité 11 « خاصية فيثاغورس، جيب تمام زاوية », leçon `khassiyat-fitaghuras` (2026-10-20).
 *
 * Une seule source de vérité pour le labo `pythagoras-tanks`, la leçon et leurs tests. Un longueur est un DÉCIMAL du manuel
 * (« 2,4 », « 5 ») lu en fraction exacte (`linear.js › parseNumber`) ; son carré, une somme ou une différence de carrés
 * restent EXACTS (fractions). Une racine est exacte quand le radicande est le carré d'un rationnel (`squareRoots.js ›
 * rationalSqrt`), sinon elle reste « √n » et ne s'arrondit qu'à l'affichage, par entiers (BigInt), au plus proche — jamais par
 * `Math.sqrt` qui ne sert qu'à DESSINER. Importé PAR CHEMIN (BUNDLE_BOUNDARIES §4), jamais par le baril du cœur.
 *
 *   hypotenuseSquare('3', '4')        → { n: 25, d: 1 }
 *   sideFrom({ legs: ['5', '12'] })   → { square: 169, exact: 13, … }
 *   sideFrom({ hyp: '5', leg: '2' })  → { square: 21, exact: null, text: '√21', rounded: (p) => '4,58' }
 *   roundedSqrt(frac(13), 2)          → '3,61'      screenSqrt(frac(21)) → '4,582575695'
 *   nature('5,7', '7,6', '9,4')        → { right: false, kind: 'acute', square: 88,36, sum: 90,25 }
 *   pourVerdict(cmp)                  → 'exact' | 'over' | 'gap'
 */
import { frac, parseNumber, add, sub, mul, cmp, fracDecimal, fracText } from './linear.js';
import { rationalSqrt } from './squareRoots.js';

const F = (x) => (typeof x === 'object' && x && 'n' in x ? x : parseNumber(x));

/** Le carré exact d'une longueur. */
export const square = (x) => { const v = F(x); return mul(v, v); };

/** AB² + AC² (le carré de l'hypoténuse). */
export const hypotenuseSquare = (b, c) => add(square(b), square(c));

/** BC² − AB² (le carré d'un côté de l'angle droit) ; null si l'« hypoténuse » n'est pas le plus long côté. */
function legSquare(hyp, leg) {
  const s = sub(square(hyp), square(leg));
  return cmp(s, frac(0)) > 0 ? s : null;
}

/** √v exacte (fraction) si v est le carré d'un rationnel, sinon null. */
function exactSqrt(v) {
  const p = F(v);
  if (p.n < 0) return null;
  const r = rationalSqrt({ num: p.n, den: p.d });
  return r ? frac(r.num, r.den) : null;
}

const isqrt = (n) => {
  if (n < 0n) throw new Error('isqrt négatif');
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
};

const decimalText = (int, places) => {
  const neg = int < 0n;
  const s = (neg ? -int : int).toString().padStart(places + 1, '0');
  const body = places > 0 ? `${s.slice(0, -places)},${s.slice(-places)}` : s;
  return neg ? `-${body}` : body;
};

/**
 * √v arrondi AU PLUS PROCHE à `places` chiffres après la virgule (texte à virgule, zéros gardés : « 4,20 »). En entiers :
 * x = √v·10^p ; ⌊x + ½⌋ = ⌊(⌊2x⌋ + 1) / 2⌋ et ⌊2x⌋ = isqrt(⌊4·v·10^(2p)⌋).
 */
export function roundedSqrt(v, places = 2) {
  const p = F(v);
  const scaled = (4n * BigInt(p.n) * 10n ** BigInt(2 * places)) / BigInt(p.d);
  const twice = isqrt(scaled);
  return decimalText((twice + 1n) / 2n, places);
}

/** √v tronqué à `places` chiffres (ce que la calculatrice n'affiche PAS : sert aux distracteurs « tronqué »). */
export function truncatedSqrt(v, places = 2) {
  const p = F(v);
  return decimalText(isqrt((BigInt(p.n) * 10n ** BigInt(2 * places)) / BigInt(p.d)), places);
}

/** L'écran de la calculatrice après √ : 10 chiffres significatifs, arrondis, zéros finaux supprimés (√21 → « 4,582575695 »). */
export function screenSqrt(v) {
  const exact = exactSqrt(v);
  if (exact) return decText(exact);
  const intDigits = roundedSqrt(v, 0).replace('-', '').length;
  const t = roundedSqrt(v, Math.max(0, 10 - intDigits));
  return t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t;
}

/** Une fraction en texte décimal à virgule (fini) — « 13,69 », « 25 ». */
export const decText = (v) => fracDecimal(F(v), 9) ?? fracText(F(v));

/**
 * Le côté inconnu d'un triangle rectangle : `{ legs: [b, c] }` (l'hypoténuse) ou `{ hyp, leg }` (un côté de l'angle droit).
 * Rend { square, exact (fraction | null), text ('13' | '√21'), rounded(p) } ; null si les données sont impossibles.
 */
export function sideFrom({ legs, hyp, leg }) {
  const s = legs ? hypotenuseSquare(legs[0], legs[1]) : legSquare(hyp, leg);
  if (!s) return null;
  const exact = exactSqrt(s);
  return {
    square: s,
    exact,
    text: exact ? decText(exact) : `√${decText(s)}`,
    rounded: (places) => (exact ? roundedFrac(exact, places) : roundedSqrt(s, places)),
  };
}

/** Une fraction arrondie au plus proche à `places` chiffres. */
export function roundedFrac(v, places) {
  const p = F(v);
  const k = 10n ** BigInt(places);
  const num = BigInt(p.n) * k * 2n + BigInt(p.d);
  const q = num / (2n * BigInt(p.d));
  return decimalText(q, places);
}

/**
 * La nature d'un triangle par ses trois longueurs : le plus LONG côté, son carré, la somme des carrés des deux autres.
 * `right` ⇔ égalité (la réciproque — leçon suivante) ; `kind` 'right' | 'acute' (carré < somme) | 'obtuse' (carré > somme).
 * La leçon khassiyat-fitaghuras n'en tire que la contraposée : carré ≠ somme ⇒ NON rectangle.
 */
export function nature(a, b, c) {
  const xs = [a, b, c].map(F).sort((p, q) => cmp(p, q));
  const sq = square(xs[2]);
  const sum = add(square(xs[0]), square(xs[1]));
  const k = cmp(sq, sum);
  return { longest: xs[2], square: sq, sum, right: k === 0, kind: k === 0 ? 'right' : k < 0 ? 'acute' : 'obtuse' };
}

/** Les trois longueurs forment-elles un triangle (inégalité triangulaire STRICTE) ? */
export function isTriangle(a, b, c) {
  const xs = [a, b, c].map(F).sort((p, q) => cmp(p, q));
  return cmp(add(xs[0], xs[1]), xs[2]) > 0;
}

/**
 * Le verdict du versement (labo `pythagoras-tanks`) : l'eau des deux petits bassins vaut AB² + AC², le grand bassin contient
 * BC². `cmpCapWater` = cmp(BC², AB² + AC²) : 0 → 'exact' (plein à ras bord), < 0 → 'over' (il déborde), > 0 → 'gap' (il reste vide).
 */
export const pourVerdict = (cmpCapWater) => (cmpCapWater === 0 ? 'exact' : cmpCapWater < 0 ? 'over' : 'gap');

/**
 * BC² quand l'angle en A vaut `deg` degrés ENTIERS (loi des cosinus, pour le labo en mode angle) : exacte à 90° (b² + c²),
 * sinon un nombre flottant pour le DESSIN et l'affichage arrondi. Le VERDICT ne passe jamais par ce flottant : cos(deg) est
 * > 0 pour deg < 90 et < 0 pour deg > 90 (0 < deg < 180), donc cmp(BC², b² + c²) = signe de (deg − 90).
 */
export function capAtAngle(b, c, deg) {
  const bb = Number(square(b).n) / square(b).d;
  const cc = Number(square(c).n) / square(c).d;
  const bv = Math.sqrt(bb);
  const cv = Math.sqrt(cc);
  if (deg === 90) return bb + cc;
  return bb + cc - 2 * bv * cv * Math.cos((deg * Math.PI) / 180);
}
export const angleVerdict = (deg) => pourVerdict(deg === 90 ? 0 : deg < 90 ? -1 : 1);
