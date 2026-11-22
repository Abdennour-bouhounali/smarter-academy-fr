/**
 * La NUMÉRATION DE POSITION des entiers naturels — le noyau de la leçon 1AM « كتابة الأعداد الطبيعية ودلالة
 * الأرقام » (unité 1 « الأعداد الطبيعية والأعداد العشرية », manuel pp. 9–20) et de sa manipulation `rank-exchange`.
 *
 * CONTRAT : tout ce qui est AFFICHÉ (le chiffre d'un rang, le nombre d'unités d'un rang, le مفكوك, l'écriture par
 * classes, l'écriture en lettres) dérive de ces fonctions pures. Entiers seulement : `Number.isSafeInteger`, 0 ≤ n < 10¹².
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/placeValue.js`), jamais par le barrel du core
 * (BUNDLE_BOUNDARIES §4 règle 9).
 *
 * Deux notions que la leçon distingue (2017) :
 *   رقم العشرات  = digitsByRank(2017)[1] = 1   — ce qui RESTE au rang une fois tout emballé par dix ;
 *   عدد العشرات  = countOfRank(2017, 1)  = 201 — toutes les dizaines contenues, celles des rangs supérieurs comprises.
 *
 * Exception assumée à « aucun texte arabe dans le core » : l'écriture en lettres (`toArabicWords`) et les noms de
 * rang (`RANK_NAMES`) SONT la mathématique de la leçon (le brief les fixe ici pour que la leçon, le labo et la banque
 * écrivent la même chose). `toArabicWords` est identique octet pour octet à `words()` de
 * docs/sources/1am/unit1/build-extraction.py (convention `extraction.json › discrepancies` « words » : 3–9 avec ة,
 * « مائة » avec alif, composés soudés ستمائة, accusatif « ألفا / مليونا / مليارا », pluriel « ملايير »).
 */

const MAX = 10 ** 12;

const isNatural = (n) => Number.isSafeInteger(n) && n >= 0 && n < MAX;

function assertNatural(n) {
  if (!isNatural(n)) throw new RangeError(`placeValue: entier naturel < 10^12 attendu, reçu ${n}`);
}

/** Les noms de rang (0 = الآحاد … 9 = الملايير), ceux du « جدول المراتب » du manuel p. 13. */
export const RANK_NAMES = Object.freeze([
  'الآحاد', 'العشرات', 'المئات', 'الآلاف', 'عشرات الآلاف', 'مئات الآلاف',
  'الملايين', 'عشرات الملايين', 'مئات الملايين', 'الملايير',
]);

/** { 0: unités, 1: dizaines, … } — tous les rangs jusqu'au plus haut chiffre non nul ; digitsByRank(0) → { 0: 0 }. */
export function digitsByRank(n) {
  assertNatural(n);
  const out = {};
  const s = String(n);
  for (let k = 0; k < s.length; k += 1) out[k] = Number(s[s.length - 1 - k]);
  return out;
}

/** « عدد وحدات الرتبة k » : ⌊n / 10^k⌋ — countOfRank(2017, 1) === 201. */
export function countOfRank(n, k) {
  assertNatural(n);
  if (!Number.isInteger(k) || k < 0) throw new RangeError(`placeValue: rang invalide ${k}`);
  return Math.floor(n / 10 ** k);
}

/** Σ counts[k] × 10^k pour des comptes QUELCONQUES (≥ 10 permis) — { 3: 1, 2: 13, 1: 24, 0: 37 } → 2577. */
export function valueOfCounts(counts) {
  let v = 0;
  for (const [k, c] of Object.entries(counts ?? {})) {
    const rank = Number(k);
    if (!Number.isInteger(rank) || rank < 0 || !Number.isSafeInteger(c) || c < 0) {
      throw new RangeError(`placeValue: compte invalide au rang ${k}: ${c}`);
    }
    v += c * 10 ** rank;
  }
  return v;
}

/** Vrai si chaque rang tient entre 0 et 9 : le nombre peut alors s'ÉCRIRE, un chiffre par rang. */
export function isWritable(counts) {
  return Object.values(counts ?? {}).every((c) => Number.isInteger(c) && c >= 0 && c <= 9);
}

/**
 * Le مفكوك : les rangs NON NULS, du plus haut au plus bas — 6392 → [{ digit: 6, rank: 3, value: 1000 }, … { 2, 0, 1 }].
 * `value` est 10^rank (le terme s'écrit digit × value ; au rang 0, seul le chiffre s'écrit). decompose(0) → [].
 */
export function decompose(n) {
  const d = digitsByRank(n);
  return Object.keys(d).map(Number).sort((a, b) => b - a)
    .filter((k) => d[k] !== 0)
    .map((k) => ({ digit: d[k], rank: k, value: 10 ** k }));
}

/** Les classes de trois chiffres, à partir de la DROITE : 4908732 → ['4', '908', '732']. */
export function classesOf(n) {
  assertNatural(n);
  let s = String(n);
  const out = [];
  while (s.length > 0) {
    out.unshift(s.slice(-3));
    s = s.slice(0, -3);
  }
  return out;
}

/** L'écriture par classes, séparées par une espace INSÉCABLE (U+00A0) : 4908732 → '4 908 732'. */
export function spaced(n) {
  return classesOf(n).join(' ');
}

/* ── L'écriture en lettres (convention de la plateforme) ─────────────────────────────────────────────────── */

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = { 10: 'عشرة', 11: 'أحد عشر', 12: 'اثنا عشر' };
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
// (singulier, duel, pluriel 3–10, accusatif 11–99) pour ألف, مليون, مليار
const SCALES = [
  null,
  ['ألف', 'ألفان', 'آلاف', 'ألفا'],
  ['مليون', 'مليونان', 'ملايين', 'مليونا'],
  ['مليار', 'ملياران', 'ملايير', 'مليارا'],
];

function below100(n) {
  if (n < 10) return ONES[n];
  if (TEENS[n]) return TEENS[n];
  if (n < 20) return `${ONES[n - 10]} عشر`;
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? TENS[t] : `${ONES[u]} و${TENS[t]}`;
}

function below1000(n, construct = false) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts = [];
  // « مائتا ألف » : le duel en construction devant un nom de classe, quand rien ne suit
  if (h) parts.push(h === 2 && r === 0 && construct ? 'مائتا' : HUNDREDS[h]);
  if (r) parts.push(below100(r));
  return parts.join(' و');
}

/** n (1..999) unités de la classe k (1 = آلاف, 2 = ملايين, 3 = ملايير). */
function classWords(n, k) {
  const [sing, dual, plur, acc] = SCALES[k];
  if (n === 1) return sing;
  if (n === 2) return dual;
  const r = n % 100;
  if (n < 100) return `${below100(n)} ${n <= 10 ? plur : acc}`;
  const head = below1000(n, true);
  if (r === 0 || r === 1 || r === 2) return `${head} ${sing}`;
  return `${head} ${r <= 10 ? plur : acc}`;
}

/** L'écriture en lettres : 2017 → « ألفان وسبعة عشر » ; 7065 → « سبعة آلاف وخمسة وستون » ; 0 → « صفر ». */
export function toArabicWords(n) {
  assertNatural(n);
  if (n === 0) return 'صفر';
  const groups = [];
  let rest = n;
  let k = 0;
  while (rest > 0) {
    const g = rest % 1000;
    rest = Math.floor(rest / 1000);
    if (g) groups.unshift(k === 0 ? below1000(g) : classWords(g, k));
    k += 1;
  }
  return groups.join(' و');
}

/**
 * La LECTURE PAR CLASSES (manuel p. 11) : chaque classe non nulle, de la plus haute, avec ses chiffres et ses mots
 * — 4908732 → [{ k: 2, digits: '4', words: 'أربعة ملايين' }, { k: 1, digits: '908', words: 'تسعمائة وثمانية آلاف' },
 * { k: 0, digits: '732', words: 'سبعمائة واثنان وثلاثون' }]. Les mots joints par « و » redonnent toArabicWords(n).
 */
export function classWordsOf(n) {
  const cls = classesOf(n);
  const out = [];
  cls.forEach((digits, i) => {
    const k = cls.length - 1 - i;
    const g = Number(digits);
    if (g === 0 && n !== 0) return;
    out.push({ k, digits: digits.padStart(i === 0 ? 0 : 3, '0'), words: n === 0 ? 'صفر' : k === 0 ? below1000(g) : classWords(g, k) });
  });
  return out;
}
