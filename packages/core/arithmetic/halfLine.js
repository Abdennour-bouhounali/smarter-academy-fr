/**
 * Le NOMBRE SUR UN DEMI-DROITE GRADUÉ sous le « شريط القفز » (1AM, unité 1, leçon « الأعداد العشرية ونصف المستقيم المدرّج », 2026-10-30) —
 * arithmétique EXACTE en entiers, sans virgule flottante.
 *
 * Une abscisse est un entier : le nombre de MILLIÈMES (2,4 → 2400). Une fenêtre du ruban est `{ from, step }` (millièmes) : la grande marque d'indice `m` vaut
 * `from + m·step` et chaque grande marque porte DIX petites graduations, chacune à `step / 10` (0,1 d'une unité, ou 0,01 quand la grande marque vaut 0,1) —
 * « l’écart entre deux petites graduations est 1/10 de la longueur de la marque ». Une petite graduation est repérée par son indice `i` (0 = le bord gauche).
 *
 * Écriture : la virgule à l'écran (`text`), la somme « 2+6/10 » (un entier plus une fraction décimale) lue par `parse` ; de 0 à 3 décimales, partie entière ≤ 99.
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/halfLine.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

const SCALE = 1000;

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const clean = (x) => String(x).trim().replace(/−/g, '-').replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/[,٫،]/g, '.').replace(/\s+/g, '');

const dec = (s) => {
  const m = /^(\d{1,2})(?:\.(\d{1,3}))?$/.exec(s);
  return m ? Number(m[1]) * SCALE + Number((m[2] ?? '').padEnd(3, '0') || '0') : null;
};

/** « 2,4 », « 2.4 », « ٣ », « 2+6/10 » → millièmes (entier), ou `null` si illisible, négatif, > 99 ou plus de 3 décimales. */
export function parse(x) {
  if (typeof x === 'number') return Number.isInteger(x) && x >= 0 ? x : null;
  const s = clean(x);
  const sum = /^(\d{1,2})\+(\d{1,3})\/(10|100|1000)$/.exec(s);
  if (sum) {
    const n = Number(sum[2]); const den = Number(sum[3]);
    return n < den ? Number(sum[1]) * SCALE + (n * SCALE) / den : null;
  }
  return dec(s);
}

/** Les millièmes → « 2,4 » (virgule, zéros inutiles retirés). */
export function text(m) {
  const w = Math.floor(m / SCALE);
  const f = String(m % SCALE).padStart(3, '0').replace(/0+$/, '');
  return f ? `${w},${f}` : String(w);
}

/** `true` si le texte est une écriture SOMME « a+b/10 ». */
export const isSum = (x) => /^\d{1,2}\+\d{1,3}\/(10|100|1000)$/.test(clean(x));

/** La valeur d'une petite graduation d'indice `i` : `from + i · step/10`. */
export const tickValue = (w, i) => w.from + (i * w.step) / 10;
/** La valeur d'une GRANDE marque d'indice `m`. */
export const markValue = (w, m) => w.from + m * w.step;
/** `v` tombe-t-il exactement sur une petite graduation ? */
export const onTick = (w, v) => v >= w.from && (v - w.from) % (w.step / 10) === 0;
/** L'indice de la petite graduation à gauche de `v` (celle de `v` si `v` est dessus). */
const tickBelow = (w, v) => Math.floor((v - w.from) / (w.step / 10));
/** L'encadrement de `v` par deux petites graduations CONSÉCUTIVES : `{ i, lo, hi, exact }` (`exact` : `v` est sur `lo`, alors `hi = lo + pas`). */
export function bracket(w, v) {
  const i = tickBelow(w, v);
  return { i, lo: tickValue(w, i), hi: tickValue(w, i + 1), exact: onTick(w, v) };
}

/** Le nombre de grandes marques qu'il faut voir pour placer `v` (la marque AU-DESSUS de `v` incluse) : `ceil((v − from)/step)`. */
export const marksNeeded = (w, v) => Math.max(1, Math.ceil((v - w.from) / w.step));

/** Les deux chiffres échangés d'une abscisse à une décimale et partie entière d'un chiffre (2,4 → 4,2) ; `null` sinon. */
export function swapDigits(v) {
  if (v % 100 !== 0 || v >= 10 * SCALE) return null;
  const whole = Math.floor(v / SCALE); const tenth = (v % SCALE) / 100;
  return tenth * SCALE + whole * 100;
}
