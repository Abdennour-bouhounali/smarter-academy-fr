import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * realsUtils — le modèle mathématique de la leçon « Nombres réels » (2nde).
 *
 * Tout ce qui est affiché (fenêtre de zoom, chiffres, restes de la division,
 * encadrements, arrondis, familles de nombres) DÉRIVE de ces fonctions pures.
 *
 * Deux représentations exactes cohabitent :
 *  - un rationnel est un couple (p, q) d'entiers, q > 0 : ses chiffres
 *    viennent de la division posée (`longDivision`), jamais d'un flottant ;
 *  - un irrationnel « de la leçon » (√2, π, √10…) est donné par une chaîne
 *    de décimales suffisamment longue (`IRRATIONALS`) — les flottants ne
 *    servent qu'au dessin.
 *
 * Familles (boîtes emboîtées) : ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ.
 */
export { formatDec, parseDec, roundTo };

export const IRRATIONALS = {
  sqrt2: { digits: '1.41421356237309504880168872', tex: '\\sqrt{2}', label: '√2', value: Math.SQRT2 },
  pi: { digits: '3.14159265358979323846264338', tex: '\\pi', label: 'π', value: Math.PI },
  sqrt10: { digits: '3.16227766016837933199889354', tex: '\\sqrt{10}', label: '√10', value: Math.sqrt(10) },
  sqrt3: { digits: '1.73205080756887729352744634', tex: '\\sqrt{3}', label: '√3', value: Math.sqrt(3) },
};

export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Fraction réduite, dénominateur positif. */
export function reduce(p, q) {
  if (q === 0) throw new RangeError('dénominateur nul');
  const g = gcd(p, q) || 1;
  const s = q < 0 ? -1 : 1;
  return { p: (s * p) / g, q: (s * q) / g };
}

/** Un rationnel p/q est DÉCIMAL ssi son dénominateur réduit n'a que 2 et 5 pour facteurs premiers. */
export function isDecimalFraction(p, q) {
  let d = reduce(p, q).q;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/**
 * Division posée de p par q (p, q entiers, q > 0, p ≥ 0) : jusqu'à `maxDigits`
 * décimales, avec la trace des restes — c'est le reste qui décide :
 * reste 0 → l'écriture s'arrête ; reste déjà vu → elle se répète.
 */
export function longDivision(p, q, maxDigits = 12) {
  if (!Number.isInteger(p) || !Number.isInteger(q) || q <= 0 || p < 0) throw new RangeError('division posée : entiers, q > 0, p ≥ 0');
  const intPart = Math.floor(p / q);
  let r = p % q;
  const digits = [];
  const remainders = [r];
  const seenAt = new Map([[r, 0]]);
  let terminates = r === 0;
  let periodStart = null;
  let periodLength = null;
  while (!terminates && digits.length < maxDigits) {
    r *= 10;
    digits.push(Math.floor(r / q));
    r %= q;
    remainders.push(r);
    if (r === 0) { terminates = true; break; }
    if (seenAt.has(r)) { periodStart = seenAt.get(r); periodLength = digits.length - periodStart; break; }
    seenAt.set(r, digits.length);
  }
  return { intPart, digits, remainders, terminates, periodStart, periodLength };
}

/** Exactement n décimales de p/q (complétées de zéros si l'écriture s'arrête avant). */
export function expandDigits(p, q, n) {
  const intPart = Math.floor(p / q);
  let r = p % q;
  const digits = [];
  while (digits.length < n) {
    r *= 10;
    digits.push(Math.floor(r / q));
    r %= q;
  }
  return { intPart, digits };
}

/** « 0,333… » avec la période soulignable : renvoie { text, period, exact }. */
export function decimalText(p, q, maxDigits = 8) {
  const sign = p < 0 ? '−' : '';
  const ap = Math.abs(p);
  const d = longDivision(ap, q, maxDigits);
  if (d.terminates) {
    const digits = d.digits.join('');
    return { text: `${sign}${digits.length ? `${d.intPart},${digits}` : `${d.intPart}`}`, period: null, exact: true };
  }
  const full = expandDigits(ap, q, maxDigits).digits.join('');
  return { text: `${sign}${d.intPart},${full}…`, period: d.periodLength ? full.slice(d.periodStart, d.periodStart + d.periodLength) : null, exact: false };
}

/** La plus petite famille : 'N' | 'Z' | 'D' | 'Q' | 'R'. */
export function classify(spec) {
  if (spec.kind === 'irrational') return 'R';
  const { p, q } = reduce(spec.p, spec.q);
  if (q === 1) return p >= 0 ? 'N' : 'Z';
  return isDecimalFraction(p, q) ? 'D' : 'Q';
}

export const FAMILIES = [
  { id: 'N', symbol: 'ℕ', name: 'entiers naturels' },
  { id: 'Z', symbol: 'ℤ', name: 'entiers relatifs' },
  { id: 'D', symbol: '𝔻', name: 'nombres décimaux' },
  { id: 'Q', symbol: 'ℚ', name: 'nombres rationnels' },
  { id: 'R', symbol: 'ℝ', name: 'nombres réels' },
];
export const FAMILY_ORDER = ['N', 'Z', 'D', 'Q', 'R'];
/** Toutes les familles qui contiennent le nombre (la sienne et les plus grandes). */
export function familiesOf(spec) {
  const i = FAMILY_ORDER.indexOf(classify(spec));
  return FAMILY_ORDER.slice(i);
}

/**
 * Chiffres d'un nombre de la leçon jusqu'à `n` décimales, TRONQUÉS (jamais
 * arrondis) : c'est ce qu'on lit en zoomant. Renvoie la chaîne « 1,414 ».
 */
export function truncatedDigits(spec, n) {
  let s;
  if (spec.kind === 'irrational') s = IRRATIONALS[spec.id].digits;
  else {
    const d = expandDigits(Math.abs(spec.p), spec.q, Math.max(n, 1) + 2);
    s = `${spec.p < 0 ? '-' : ''}${d.intPart}.${d.digits.join('')}`;
  }
  const [ip, dp = ''] = s.split('.');
  const padded = (dp + '0'.repeat(n)).slice(0, n);
  return (n === 0 ? ip : `${ip},${padded}`).replace('-', '−');
}

/** Valeur flottante (pour le dessin seulement). */
export function valueOf(spec) {
  if (spec.kind === 'irrational') return IRRATIONALS[spec.id].value;
  return spec.p / spec.q;
}

/**
 * Encadrement d'amplitude 10^-k : lo ≤ x < hi, lo à k décimales. Calculé sur
 * les CHIFFRES tronqués (exact), pas sur un flottant.
 */
export function bracketAt(spec, k) {
  const loText = truncatedDigits(spec, k);
  const lo = parseDec(loText);
  const hi = roundTo(lo + 10 ** -k, k);
  return { lo, hi, loText, hiText: formatDec(hi, { minDecimals: k, maxDecimals: k }) };
}

/** Le nombre tombe-t-il exactement sur une graduation au zoom k (k décimales suffisent) ? */
export function landsAt(spec, k) {
  if (spec.kind === 'irrational') return false;
  const d = longDivision(spec.p, spec.q, k + 1);
  return d.terminates && d.digits.length <= k;
}

/** Arrondi à k décimales (le chiffre suivant décide), lu sur les chiffres tronqués. */
export function roundedAt(spec, k) {
  const next = truncatedDigits(spec, k + 1);
  const digit = Number(next.slice(-1));
  const { lo, hi } = bracketAt(spec, k);
  return digit >= 5 ? hi : lo;
}

/** Entier a tel que a² ≤ n < (a+1)² : l'encadrement de √n par des entiers. */
export function sqrtIntegerBracket(n) {
  let a = 0;
  while ((a + 1) * (a + 1) <= n) a += 1;
  return { lo: a, hi: a + 1 };
}

/** Encadrement de √n au dixième : a ≤ √n < a + 0,1, par comparaison des carrés. */
export function sqrtTenthBracket(n) {
  const { lo } = sqrtIntegerBracket(n);
  for (let i = 0; i < 10; i += 1) {
    const a = roundTo(lo + i / 10, 1);
    const b = roundTo(a + 0.1, 1);
    if (a * a <= n && n < b * b) return { lo: a, hi: b };
  }
  return { lo, hi: lo + 1 };
}

/** Carré exact d'un décimal donné en texte (évite 1,41² = 1,9880999…). */
export function squareOfDecimal(x, k) {
  return roundTo(x * x, 2 * k);
}
