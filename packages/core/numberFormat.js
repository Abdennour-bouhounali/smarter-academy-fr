/**
 * numberFormat — formatage numérique français partagé par les leçons.
 *
 * Règles typographiques françaises :
 *   - séparateur de milliers : espace fine insécable  → 1 250
 *   - séparateur décimal     : virgule                → 3,5
 *   - jamais 1,250.5 ni 3.5 côté élève.
 */

/** Espace fine insécable (U+202F). Écrite en séquence d'échappement :
 *  un caractère invisible collé dans le source se dégrade trop facilement
 *  en espace ordinaire. */
export const THIN = '\u202F';

/** Arrondi sûr à `dp` décimales — neutralise les artefacts de flottants. */
export function roundTo(n, dp = 6) {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** Groupe la partie entière par milliers : "1250" → "1 250". */
function groupThousands(intPart) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
}

/**
 * Formate un ENTIER à la française : 2 350 700.
 */
export function formatFr(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const s = Math.abs(Math.trunc(n)).toString();
  return (n < 0 ? '−' : '') + groupThousands(s);
}

/** Version KaTeX d'un entier (espaces fines LaTeX). */
export function texFr(n) {
  return Math.abs(Math.trunc(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
}

/**
 * Formate un DÉCIMAL à la française.
 *
 * formatDec(3.5)                        → "3,5"
 * formatDec(3.5,  { minDecimals: 2 })   → "3,50"
 * formatDec(1250.5)                     → "1 250,5"
 * formatDec(4)                          → "4"
 *
 * @param {number} n
 * @param {{minDecimals?: number, maxDecimals?: number}} [opts]
 */
export function formatDec(n, opts = {}) {
  const { minDecimals = 0, maxDecimals = 3 } = opts;
  if (n === null || n === undefined || Number.isNaN(n)) return '';

  const neg = n < 0;
  let s = Math.abs(n).toFixed(maxDecimals);
  let [ip, dp = ''] = s.split('.');

  // On retire les zéros inutiles à droite, sans descendre sous minDecimals.
  while (dp.length > minDecimals && dp.endsWith('0')) dp = dp.slice(0, -1);

  const out = dp.length > 0 ? `${groupThousands(ip)},${dp}` : groupThousands(ip);
  return (neg ? '−' : '') + out;
}

/**
 * Version KaTeX d'un décimal : `3{,}5` — la paire d'accolades garantit
 * l'espacement correct de la virgule décimale en mode mathématique.
 */
export function texDec(n, opts = {}) {
  // La virgule décimale d'abord : sinon le « , » de \\, (milliers) serait
  // capturé par le replace et produirait 1\\{,}250,5 au lieu de 1\\,250{,}5.
  const plain = formatDec(n, opts);
  return plain.replace(',', '{,}').split(THIN).join('\\,');
}

/**
 * Lit une saisie élève en notation française OU anglaise.
 *   "3,5" → 3.5   |   "3.5" → 3.5   |   "1 250,5" → 1250.5
 * Renvoie NaN si la saisie n'est pas un nombre valide.
 */
export function parseDec(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : NaN;
  if (typeof str !== 'string') return NaN;
  const cleaned = toLatinDigits(str).trim().replace(/[\s\u202F\u00A0]/g, '').replace(/[,\u066B]/, '.');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return NaN;
  return parseFloat(cleaned);
}

/**
 * Lit une saisie ENTIÈRE ("4 582" → 4582, "٨١٠" → 810, "3,5" → NaN).
 *
 * Le point n'est accepté que comme séparateur de MILLIERS bien formé
 * ("4.582", "1.250.000") : l'ancien code le supprimait partout, si bien que
 * « 81.0 » était lu 810 (une réponse fausse acceptée) et « 810.0 » lu 8100
 * (une réponse juste refusée). Audit des leçons du 2026-09-29.
 */
export function parseFr(str) {
  if (typeof str === 'number') return Math.trunc(str);
  if (typeof str !== 'string') return NaN;
  const cleaned = toLatinDigits(str).replace(/[\s\u202F\u00A0]/g, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) return parseInt(cleaned.replace(/\./g, ''), 10);
  if (!/^\d+$/.test(cleaned)) return NaN;
  return parseInt(cleaned, 10);
}

/**
 * Ramène les chiffres arabo-indiens (٠–٩, U+0660) et persans (۰–۹, U+06F0)
 * aux chiffres latins. L'interface est en arabe : un clavier arabe tape
 * « ١٢ », et le refuser serait traiter une écriture comme une erreur
 * mathématique. Tout lecteur de saisie élève passe par ici.
 */
export function toLatinDigits(str) {
  return String(str ?? '')
    .replace(/[\u0660-\u0669]/g, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (ch) => String(ch.charCodeAt(0) - 0x06f0));
}

/** Égalité de décimaux à la tolérance près (évite les pièges de flottants). */
export function decEquals(a, b, dp = 6) {
  return roundTo(a, dp) === roundTo(b, dp);
}

/** Nombre de décimales significatives : 3.50 → 1, 3 → 0, 2.105 → 3. */
export function decimalPlaces(n, max = 6) {
  const s = Math.abs(n).toFixed(max);
  let [, dp = ''] = s.split('.');
  while (dp.endsWith('0')) dp = dp.slice(0, -1);
  return dp.length;
}
