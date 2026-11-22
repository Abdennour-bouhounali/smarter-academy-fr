/**
 * Les PUISSANCES DE 10 (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس « قوى العدد 10 », 2026-10-26) — le module de maths
 * PARTAGÉ des quatre leçons de l'unité (قوى العدد 10 · قواعد الحساب على قوى العدد 10 · الكتابة العلمية ورتبة القدر · la
 * synthèse) ; chaque leçon y AJOUTE ses fonctions, personne ne le réécrit. Importé PAR CHEMIN
 * (`@smarter-academy/core/arithmetic/tenPowers.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 *
 * Arithmétique EXACTE en BigInt. Un décimal est `{ m, e }` (BigInt m, entier e) = m × 10ᵉ, m sans zéros finaux (zéro = `{0n, 0}`).
 * Les rationnels non décimaux passent par `powers.js › rat` (`toRat`).
 *
 * Ce que la leçon 1 (قوى العدد 10) ajoute :
 *   parseDec / decText            « 1 000 000 », « 0,000001 », « 45 × 10^3 », « −6,5 × 10^7 » ⇄ décimal ; `null` sinon
 *   pow10 / pow10Text / exponentOfPow10
 *   zerosOf / rankOfOne / zerosBeforeOne / zerosAfterComma    les comptes que le labo et les erreurs types utilisent
 *   pow10Name / nameToExponent / PREFIXES / prefixOf          noms (ألف … ألف مليار, جزء من …) et préfixes (كيلو … نانو)
 *   expanded / expandedTex        le مفكوك d'un décimal (rangs vides absents)
 *   timesPow10                    k × 10ⁿ (le décalage de la virgule, rappel de 1AM — pas la règle des produits)
 */
import { rat } from './powers.js';

const NBSP = ' ';
const abs = (x) => (x < 0n ? -x : x);

/* ── décimaux exacts ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Normalise `m × 10ᵉ` : retire les zéros finaux de m. */
export function norm(m, e = 0) {
  let M = BigInt(m); let E = Number(e);
  if (M === 0n) return Object.freeze({ m: 0n, e: 0 });
  while (M % 10n === 0n) { M /= 10n; E += 1; }
  return Object.freeze({ m: M, e: E || 0 });
}

/** Comparaison exacte (−1, 0, 1). */
export function compareDec(u, v) {
  const e = Math.min(u.e, v.e);
  const a = u.m * 10n ** BigInt(u.e - e);
  const b = v.m * 10n ** BigInt(v.e - e);
  return a < b ? -1 : a > b ? 1 : 0;
}
/** Le décimal en rationnel de `powers.js`. */
export function toRat(v) {
  return v.e >= 0 ? rat(v.m * 10n ** BigInt(v.e), 1n) : rat(v.m, 10n ** BigInt(-v.e));
}
/** k × 10ⁿ : décale la virgule de n rangs (rappel 1AM). */
export const timesPow10 = (v, n) => norm(v.m, v.e + n);

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function latin(text) {
  return String(text).replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d))).replace(/٫/g, ',').replace(/[−–—]/g, '-').replace(/[×✕·*]/g, '×')
    .replace(/[   ‎‏⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parsePlain(s) {
  const t = s.replace(/ /g, '');
  const m = /^(-)?(\d+)(?:[,.](\d+))?$/.exec(t);
  if (!m) return null;
  const frac = m[3] ?? '';
  const digits = BigInt(m[2] + frac);
  return norm(m[1] ? -digits : digits, -frac.length);
}

/**
 * « 1 000 000 » · « 0,000001 » · « -6,5 » · « 45 × 10^3 » · « 3,52 × 10^5 » · « 7 × 10^-2 » · « 10^-4 » → décimal exact ; `null` sinon.
 * Les groupes de trois chiffres (espaces) sont tolérés dans la partie entière uniquement.
 */
export function parseDec(text) {
  const s = latin(text).replace(/\^\{\s*(-?\d+)\s*\}/g, '^$1');
  const sci = /^(.*?)\s*×\s*10\s*\^\s*(-?\d+)$/.exec(s);
  if (sci) {
    const k = sci[1] === '' ? null : parseSpaced(sci[1]);
    return k === null ? null : timesPow10(k, Number(sci[2]));
  }
  const pw = /^(-)?10\s*\^\s*(-?\d+)$/.exec(s);
  if (pw) return pw[1] ? norm(-1n, Number(pw[2])) : norm(1n, Number(pw[2]));
  return parseSpaced(s);
}

function parseSpaced(s) {
  const [intPart, fracPart] = s.split(/[,.]/);
  if (fracPart !== undefined && /\s/.test(fracPart)) return null;
  if (/\s/.test(intPart.replace(/^-/, '')) && !/^-?\d{1,3}( \d{3})+$/.test(intPart)) return null;
  return parsePlain(s);
}

/**
 * L'écriture décimale. `group` (défaut true) : groupes de trois chiffres (U+00A0) dans la partie ENTIÈRE ; la partie
 * fractionnaire reste collée (« 0,000001 », comme le manuel). Moins typographique (−) pour un négatif.
 */
export function decText(v, { group = true } = {}) {
  if (v.m === 0n) return '0';
  const neg = v.m < 0n;
  const digits = String(abs(v.m));
  let intPart; let fracPart = '';
  if (v.e >= 0) intPart = digits + '0'.repeat(v.e);
  else {
    const k = -v.e;
    const padded = digits.padStart(k + 1, '0');
    intPart = padded.slice(0, padded.length - k);
    fracPart = padded.slice(padded.length - k);
  }
  const grouped = group ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : intPart;
  return `${neg ? '−' : ''}${grouped}${fracPart ? `,${fracPart}` : ''}`;
}

/* ── les puissances de 10 ───────────────────────────────────────────────────────────────────────────────────────────── */

export const pow10 = (n) => Object.freeze({ m: 1n, e: Number(n) });
export const pow10Text = (n, opts) => decText(pow10(n), opts);

/** n si le texte est l'écriture décimale de 10ⁿ (« 100 000 » → 5, « 0,0001 » → −4), `null` sinon (« 120 », « 6 000 000 », « −100 »). */
export function exponentOfPow10(text) {
  const v = parseDec(text);
  return v && v.m === 1n ? v.e : null;
}

/** n ≥ 0 : le nombre de zéros APRÈS le 1 dans 10ⁿ. */
export const zerosOf = (n) => {
  if (n < 0) throw new RangeError('zerosOf: n ≥ 0');
  return n;
};
/** n < 0 : la RANG du 1 après la virgule dans 10ⁿ (= −n). */
export const rankOfOne = (n) => {
  if (n >= 0) throw new RangeError('rankOfOne: n < 0');
  return -n;
};
/** n < 0 : le nombre de zéros AVANT le 1, le zéro des unités compris (= −n). */
export const zerosBeforeOne = (n) => {
  if (n >= 0) throw new RangeError('zerosBeforeOne: n < 0');
  return -n;
};
/** n < 0 : le nombre de zéros entre la virgule et le 1 (= −n − 1). */
export const zerosAfterComma = (n) => {
  if (n >= 0) throw new RangeError('zerosAfterComma: n < 0');
  return -n - 1;
};

/* ── les noms et les préfixes ───────────────────────────────────────────────────────────────────────────────────────── */

const NAME_POS = Object.freeze({
  0: 'واحد', 1: 'عشرة', 2: 'مئة', 3: 'ألف', 4: 'عشرة آلاف', 5: 'مئة ألف', 6: 'مليون', 7: 'عشرة ملايين', 8: 'مئة مليون',
  9: 'مليار', 10: 'عشرة ملايير', 11: 'مئة مليار', 12: 'ألف مليار',
});

/** « مليون » pour 6, « جزء من ألف » pour −3 … ; `null` hors de −12 … 12. */
export function pow10Name(n) {
  if (!Number.isInteger(n) || Math.abs(n) > 12) return null;
  return n >= 0 ? NAME_POS[n] : `جزء من ${NAME_POS[-n]}`;
}

/** Le contraire : un nom de la liste → l'exposant, `null` sinon (« ألف مليار » → 12, « جزء من مليار » → −9). Tolère « مائة ». */
export function nameToExponent(text) {
  const s = String(text).replace(/مائة/g, 'مئة').replace(/\s+/g, ' ').trim();
  for (let n = -12; n <= 12; n += 1) if (pow10Name(n) === s) return n;
  return null;
}

/** Les préfixes du système international (nom arabe tel qu'on le lit sur un cours de physique). */
export const PREFIXES = Object.freeze([
  { symbol: 'T', name: 'تيرا', exp: 12 },
  { symbol: 'G', name: 'جيغا', exp: 9 },
  { symbol: 'M', name: 'ميغا', exp: 6 },
  { symbol: 'k', name: 'كيلو', exp: 3 },
  { symbol: 'h', name: 'هكتو', exp: 2 },
  { symbol: 'da', name: 'ديكا', exp: 1 },
  { symbol: '', name: '', exp: 0 },
  { symbol: 'd', name: 'ديسي', exp: -1 },
  { symbol: 'c', name: 'سنتي', exp: -2 },
  { symbol: 'm', name: 'ميلي', exp: -3 },
  { symbol: 'µ', name: 'ميكرو', exp: -6 },
  { symbol: 'n', name: 'نانو', exp: -9 },
  { symbol: 'p', name: 'بيكو', exp: -12 },
].map(Object.freeze));
export const prefixOf = (exp) => PREFIXES.find((p) => p.exp === exp) ?? null;
export const prefixByName = (name) => PREFIXES.find((p) => p.name && p.name === String(name).trim()) ?? null;

/* ── le مفكوك ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Le développement en puissances de 10, du rang le plus haut au plus bas : 3985 → [{3,3},{9,2},{8,1},{5,0}] ; les rangs vides ABSENTS. Valeur positive. */
export function expanded(v) {
  if (v.m <= 0n) throw new RangeError('expanded: décimal strictement positif');
  const s = String(v.m);
  const out = [];
  for (let i = 0; i < s.length; i += 1) {
    const digit = Number(s[i]);
    if (digit !== 0) out.push({ digit, exp: v.e + (s.length - 1 - i) });
  }
  return out;
}
/** « 5\times10^{3}+3\times10^{1}+7\times10^{-2} » */
export function expandedTex(v) {
  return expanded(v).map((t) => `${t.digit}\\times10^{${t.exp}}`).join('+');
}
/** La somme des termes du développement, retrouvée exactement (contrôle). */
export function sumExpanded(terms) {
  const e = Math.min(...terms.map((t) => t.exp));
  const m = terms.reduce((acc, t) => acc + BigInt(t.digit) * 10n ** BigInt(t.exp - e), 0n);
  return norm(m, e);
}

/* ── Leçon 2 (قواعد الحساب على قوى العدد 10, 2026-10-26) : les trois règles, les unités, k × 10ᵖ ─────────────────────────────────── */

/** 10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ */
export const productExp = (m, n) => m + n;
/** 10ᵐ / 10ⁿ = 10ᵐ⁻ⁿ */
export const quotientExp = (m, n) => m - n;
/** (10ᵐ)ⁿ = 10ᵐⁿ */
export const powerExp = (m, n) => m * n;
/** Une chaîne `[{ op: '×' | '÷' | '^', n }]` à partir de 10⁰ : l'exposant unique. Ex. ×3, ÷(−2), ^2 → ((0+3)−(−2))×2. */
export function chainExp(steps, start = 0) {
  return steps.reduce((acc, s) => (s.op === '×' ? productExp(acc, s.n) : s.op === '÷' ? quotientExp(acc, s.n) : powerExp(acc, s.n)), start);
}

/** Les unités de la مسطرة التحويل : l'exposant de leur valeur en MÈTRES (longueur). */
export const UNIT_SCALE = Object.freeze({
  km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3, um: -6, nm: -9,
});
/** Le nombre de COLONNES entre deux unités dans le tableau de longueur (1), d'aire (2) ou de volume (3) : positif vers une unité PLUS PETITE. */
export function unitColumns(from, to, mode = 1) {
  if (!(from in UNIT_SCALE) || !(to in UNIT_SCALE)) throw new RangeError('unité inconnue');
  if (![1, 2, 3].includes(mode)) throw new RangeError('mode 1 | 2 | 3');
  return (UNIT_SCALE[from] - UNIT_SCALE[to]) * mode;
}

const sciOf = (k, p) => ({ k: typeof k === 'object' ? k : parseDec(String(k)), p });
/** Produit de k × 10ᵖ (NON normalisé) : [{k, p}] → { k (décimal exact), p } ; 7×10³ × 3×10⁹ → 21 × 10¹². */
export function mulSci(list) {
  const items = list.map((x) => sciOf(x.k, x.p));
  const km = items.reduce((acc, s) => norm(acc.m * s.k.m, acc.e + s.k.e), norm(1n, 0));
  return { k: km, p: items.reduce((acc, s) => acc + s.p, 0) };
}
/** Quotient (a × 10ᵖ) / (b × 10ᵠ) → { k: a/b, p − q } avec a/b décimal exact, sinon `null` (jamais un flottant). */
export function divSci(a, b) {
  const x = sciOf(a.k, a.p); const y = sciOf(b.k, b.p);
  if (y.k.m === 0n) return null;
  // a/b décimal ⇔ y.m n'a que des facteurs 2 et 5 après simplification
  let num = x.k.m; let den = y.k.m;
  const g = (u, v) => { let s = abs(u); let t = abs(v); while (t) [s, t] = [t, s % t]; return s; };
  const d = g(num, den); num /= d; den /= d;
  let twos = 0; let fives = 0; let r = abs(den);
  while (r % 2n === 0n) { r /= 2n; twos += 1; }
  while (r % 5n === 0n) { r /= 5n; fives += 1; }
  if (r !== 1n) return null;
  const t = Math.max(twos, fives);
  const mult = (10n ** BigInt(t)) / abs(den);
  const sign = den < 0n ? -1n : 1n;
  return { k: norm(num * mult * sign, x.k.e - y.k.e - t), p: x.p - y.p };
}

/* ── Leçon 3 (الكتابة العلمية ورتبة القدر, 2026-10-26) : écriture scientifique, encadrement, rang de grandeur ─────────────────────────── */

const asDec = (v) => (typeof v === 'string' ? parseDec(v) : v);

/**
 * L'écriture scientifique d'un décimal non nul : `{ a, n, dec }` avec v = a × 10ⁿ, 1 ≤ |a| < 10 ; `a` est le texte décimal SANS groupes (« 3,52 », signe typographique pour un
 * négatif), `dec` le même décimal exact. Accepte un décimal `{m, e}` ou un texte lu par `parseDec`.
 */
export function scientific(input) {
  const v = asDec(input);
  if (!v || v.m === 0n) throw new RangeError('scientific: décimal non nul');
  const digits = String(abs(v.m));
  const dec = norm(v.m, -(digits.length - 1));
  return { a: decText(dec, { group: false }), n: v.e + digits.length - 1, dec };
}
/** k × 10ᵖ (k décimal ou texte, p entier) est-elle l'écriture scientifique ? 1 ≤ |k| < 10, k ≠ 0. */
export function isScientific(k, p) {
  const d = asDec(typeof k === 'number' ? String(k) : k);
  if (!d || d.m === 0n || !Number.isInteger(Number(p))) return false;
  const digits = String(abs(d.m));
  return d.e === -(digits.length - 1);
}
/** n tel que 10ⁿ ≤ v < 10ⁿ⁺¹ (v > 0). */
export function bracketOf(input) {
  const v = asDec(input);
  if (!v || v.m <= 0n) throw new RangeError('bracketOf: décimal strictement positif');
  return scientific(v).n;
}
/** Le chiffre des unités de a (la case de l'échelle : 1 … 9) pour v > 0. */
export function cellOf(input) {
  const v = asDec(input);
  if (!v || v.m <= 0n) throw new RangeError('cellOf: décimal strictement positif');
  return Number(String(v.m)[0]);
}
/**
 * La rang de grandeur du manuel (v > 0) : a × 10ⁿ → a' × 10ⁿ avec a' = a ARRONDI À L'UNITÉ (demi vers le haut : 2,5 → 3). Si a' = 10 on écrit 1 × 10ⁿ⁺¹ (9,7 × 10³ → 1 × 10⁴).
 * Retourne `{ a1, n1 }` entiers.
 */
export function orderOfMagnitude(input) {
  const v = asDec(input);
  if (!v || v.m <= 0n) throw new RangeError('orderOfMagnitude: décimal strictement positif');
  const digits = String(v.m);
  const a1 = Number(digits[0]) + (digits.length > 1 && digits[1] >= '5' ? 1 : 0);
  const n = scientific(v).n;
  return a1 === 10 ? { a1: 1, n1: n + 1 } : { a1, n1: n };
}
/** L'abscisse décimale de v sur l'échelle des décades : n + log₁₀ a (flottant, POUR LE DESSIN seulement — jamais pour un verdict). */
export function logPos(input) {
  const v = asDec(input);
  if (!v || v.m <= 0n) throw new RangeError('logPos: décimal strictement positif');
  const s = scientific(v);
  return s.n + Math.log10(Number(s.a.replace(',', '.')));
}
/** « 3{,}52\\times10^{5} » (LaTeX) pour a × 10ⁿ ; `n` omis quand n = 0 n'est PAS fait : l'écriture scientifique garde toujours sa puissance. */
export const sciTex = (aText, n) => `${String(aText).replace('-', '−').replace(/[,.]/, '{,}')}\\times10^{${n}}`;
