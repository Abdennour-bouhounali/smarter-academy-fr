/**
 * L'ARITHMÉTIQUE EXACTE des racines carrées — unité 2 « الحساب على الجذور ».
 *
 * Une seule source de vérité pour les trois laboratoires de l'unité
 * (square-root-side, square-fold, square-tiling) et pour leurs tests. Aucun
 * flottant ne décide jamais d'une égalité : un carré se compare en ENTIERS
 * (v² × den contre num × scale²), et une écriture décimale s'obtient par
 * BigInt. `Math.sqrt` ne sert qu'à DESSINER (une longueur à l'écran), jamais
 * à juger.
 *
 * Conventions :
 *   - un nombre ≥ 0 « aire » est un rationnel { num, den } (den > 0) ;
 *   - un côté/abscisse est un entier `v` lu sur une graduation 1/scale :
 *     côté = v / scale.
 */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

/** n est-il le carré d'un entier ? (n entier ≥ 0) */
export function isPerfectSquare(n) {
  if (!Number.isInteger(n) || n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** La racine entière d'un carré parfait, sinon null. */
export function integerSqrt(n) {
  return isPerfectSquare(n) ? Math.round(Math.sqrt(n)) : null;
}

/** Réduit { num, den } (den > 0). */
export function reduce({ num, den }) {
  if (!Number.isInteger(num) || !Number.isInteger(den) || den <= 0) throw new Error('rationnel invalide');
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}

/**
 * √(num/den) quand c'est un RATIONNEL (le manuel, معارف 2 : « a مربع لعدد
 * ناطق ») : { num, den } réduit, sinon null. Une fraction réduite est un carré
 * de rationnel ⇔ son numérateur ET son dénominateur sont des carrés parfaits.
 */
export function rationalSqrt(area) {
  const { num, den } = reduce(area);
  if (num < 0) return null;
  const p = integerSqrt(num);
  const q = integerSqrt(den);
  return p != null && q != null ? { num: p, den: q } : null;
}

/**
 * Compare le carré du côté v/scale à l'aire num/den, en entiers :
 * -1 (plus petit), 0 (égal), 1 (plus grand).
 */
export function compareSquare(v, scale, { num, den }) {
  const left = BigInt(v) * BigInt(v) * BigInt(den);
  const right = BigInt(num) * BigInt(scale) * BigInt(scale);
  return left === right ? 0 : left < right ? -1 : 1;
}

/**
 * L'écriture DÉCIMALE exacte d'un entier divisé par 10^digits, virgule
 * décimale (le manuel écrit 2,236), signe « − » typographique pour un
 * négatif. `exactDecimal(223, 2)` → « 2,23 ».
 */
export function exactDecimal(int, digits) {
  const neg = BigInt(int) < 0n;
  const s = (neg ? -BigInt(int) : BigInt(int)).toString().padStart(digits + 1, '0');
  const whole = s.slice(0, s.length - digits);
  const frac = digits > 0 ? s.slice(s.length - digits) : '';
  return `${neg ? '−' : ''}${whole}${frac ? `,${frac}` : ''}`;
}

/** Le carré EXACT d'un décimal écrit « 2,236067978 » (ou « 2.236 ») → « 5,000000002237008484 ». */
export function squareOfDecimal(text) {
  const clean = String(text).replace(',', '.').trim();
  if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error(`décimal illisible : ${text}`);
  const [whole, frac = ''] = clean.split('.');
  const int = BigInt(whole + frac);
  return exactDecimal(int * int, frac.length * 2);
}

/**
 * Le carré du côté v/scale, écrit exactement : un rationnel { num, den }
 * réduit, et — quand scale est une puissance de 10 — sa forme décimale.
 */
export function squareOf(v, scale) {
  const r = reduce({ num: v * v, den: scale * scale });
  const digits = Math.round(Math.log10(scale));
  const decimal = 10 ** digits === scale ? exactDecimal(v * v, 2 * digits) : null;
  return { ...r, decimal };
}

/**
 * La décomposition n = a² × b avec a² le PLUS GRAND carré qui divise n (le
 * manuel, طريقة p. 25) : b est alors « أصغر ما يمكن ». Pour n entier ≥ 1.
 */
export function largestSquareFactor(n) {
  if (!Number.isInteger(n) || n < 1) throw new Error('n doit être un entier ≥ 1');
  let a = 1;
  for (let k = Math.floor(Math.sqrt(n)); k >= 1; k -= 1) {
    if (n % (k * k) === 0) { a = k; break; }
  }
  return { a, b: n / (a * a) };
}

/** Tous les k ≥ 1 tels que k² divise n : les pavages possibles d'un carré d'aire n. */
export function squareDivisors(n) {
  const out = [];
  for (let k = 1; k * k <= n; k += 1) if (n % (k * k) === 0) out.push(k);
  return out;
}

/** b est-il « sans facteur carré » (aucun carré > 1 ne le divise) ? */
export function isSquareFree(b) {
  return largestSquareFactor(b).a === 1;
}

/**
 * Le texte d'une racine simplifiée : « 12√2 », « √7 », « 6 » (carré parfait),
 * « 0 ». Pour un entier n ≥ 0.
 */
export function simplifiedRootText(n) {
  if (n === 0) return '0';
  const { a, b } = largestSquareFactor(n);
  if (b === 1) return String(a);
  return `${a === 1 ? '' : a}√${b}`;
}
