/**
 * La DROITE GRADUÉE DES DEUX CÔTÉS DE L'ORIGINE sous le « خطوة الطابع » (1AM, unité 5 « الأعداد النسبية », درس « التعليم على مستقيم مدرّج »,
 * 2026-10-30) — arithmétique ENTIÈRE exacte, sans virgule flottante.
 *
 * Une abscisse est un entier en DIXIÈMES d'unité (`t`) : −15 = −1,5 ; 27 = 2,7 ; 40 = 4 ; l'unité est la longueur de la « foulée » portée à partir de l'origine O.
 * Les ticks entiers sont les multiples de 10. Le côté d'une abscisse (est : positive, ouest : négative, sur l'origine), sa distance à O (|t|), son SYMÉTRIQUE par rapport à O
 * (−t), les deux ticks entiers consécutifs qui l'encadrent (floor / floor + 1) et l'ORIGINE retrouvée à partir de deux graduations écrites sont les lectures du labo.
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/graduatedLine.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

export const TENTH = 10;

/** « east » (positive), « west » (négative) ou « origin ». */
export const sideOf = (t) => (t > 0 ? 'east' : t < 0 ? 'west' : 'origin');
/** La distance à l'origine, en dixièmes : toujours ≥ 0. */
export const distance = (t) => Math.abs(t);
/** Le symétrique par rapport à O : même distance, côté contraire (O est son propre symétrique ; jamais −0). */
export const symmetric = (t) => (t === 0 ? 0 : -t);
/** Deux abscisses sont symétriques quand leur somme est nulle. */
export const areSymmetric = (a, b) => a + b === 0;
/** Le tick entier à gauche d'une abscisse (en unités) : floor, correct pour les négatifs (−1,5 → −2). */
export const floorUnit = (t) => Math.floor(t / TENTH);
/** Les deux ticks entiers consécutifs qui encadrent une abscisse ; `null` quand l'abscisse est SUR un tick. */
export const boundsOf = (t) => (t % TENTH === 0 ? null : [floorUnit(t), floorUnit(t) + 1]);
/** Le tick vers le zéro (troncature) : la fausse « partie entière » des négatifs (−1,5 → −1). */
export const truncUnit = (t) => Math.trunc(t / TENTH);
/** Le rang du tick de l'origine quand la graduation de rang `i` porte la valeur `v` et que deux graduations consécutives sont séparées de `u` unités. */
export const originIndex = (mark, u) => {
  if (mark.v % u !== 0) throw new Error(`${mark.v} n'est pas sur une graduation de pas ${u}`);
  return mark.i - mark.v / u;
};
/** La valeur écrite sur la graduation de rang `i` quand l'origine est au rang `o` (pas `u`). */
export const valueAt = (i, o, u) => (i - o) * u;
/** Les deux graduations écrites d'une droite à origine cachée donnent-elles la MÊME origine ? */
export const marksAgree = (marks, u) => marks.every((m) => originIndex(m, u) === originIndex(marks[0], u));

const MINUS = '−';
/** « −1,5 », « 2,7 », « 3 », « 0 » : l'écran (signe moins typographique, virgule décimale). */
export function fmt(t) {
  if (t === 0) return '0';
  const a = Math.abs(t);
  const body = a % TENTH === 0 ? String(a / TENTH) : `${Math.floor(a / TENTH)},${a % TENTH}`;
  return `${t < 0 ? MINUS : ''}${body}`;
}
/** La même écriture pour KaTeX : « -1{,}5 ». */
export const tex = (t) => fmt(t).replace(MINUS, '-').replace(',', '{,}');
/** Une abscisse en unités (entier ou décimal à un chiffre) → dixièmes ; lève sinon. */
export function fromUnits(x) {
  const t = Math.round(x * TENTH);
  if (Math.abs(t - x * TENTH) > 1e-9) throw new Error(`${x} n'a pas plus d'un chiffre après la virgule`);
  return t;
}
