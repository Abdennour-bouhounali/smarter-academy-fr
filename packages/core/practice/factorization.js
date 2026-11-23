/**
 * La décomposition en produit de facteurs premiers — lecture d'une saisie d'élève (`answerType: 'factorization'`).
 *
 * Jumeau PHP : `apps/api/app/Domain/Practice/Support/Factorization.php`, tenu égal par la fixture partagée
 * `fixtures/answers.json` (cas `factorization-*`). Contrat : EXERCISE_CONTRACT.md « `answerType: 'factorization'` ».
 *
 * Une saisie est un PRODUIT de facteurs `p` ou `p^e`, dans n'importe quel ordre :
 *   - le signe du produit : `×`, `*`, `x`, `X`, `·`, `⋅`, `∙`, `✕`, `∗`, `\times`, `\cdot`, `\ast` ;
 *   - l'exposant : `^3`, `^{13}` (le LaTeX du champ MathLive) ou les chiffres en exposant `²`, `³`… ;
 *   - les espaces sont libres AUTOUR d'un signe, jamais au milieu d'un nombre (« 2 3 » n'est pas lisible) ;
 *   - chiffres arabo-indiens acceptés (`toLatinDigits`, la règle commune de toute saisie).
 * Une accolade qui n'entoure pas un exposant entier (`2^{3\times3}`) est illisible : ce que l'élève VOIT dans le
 * champ est exactement ce qui est noté.
 */
import { toLatinDigits } from '../numberFormat.js';

/** Le plus grand nombre qu'une question de décomposition peut demander (la primalité se teste jusqu'à 10^6). */
export const MAX_FACTORIZED = 1e12;
/** Au-delà, une saisie est illisible : aucun élève n'écrit 65 facteurs ni un exposant de 1 000. */
const MAX_FACTORS = 64;
const MAX_EXPONENT = 999;

const SUPERSCRIPT = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};
const FACTOR = /^ ?([0-9]+)(?: ?\^ ?([0-9]+))? ?$/;

/** La saisie ramenée à des chiffres, `^`, `*` et des espaces simples (jumeau : Factorization::normalize). */
function normalizeFactorizationInput(raw) {
  return toLatinDigits(raw)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => SUPERSCRIPT[c]).join('')}`)
    .replace(/\\times|\\cdot|\\ast/g, '*')
    .replace(/\\[,;:! ]|~/g, ' ')
    .replace(/[×·⋅∙✕∗xX]/g, '*')
    .replace(/\s+/g, ' ')
    .replace(/\^ ?\{ ?([0-9]+) ?\}/g, '^$1')
    .replace(/^ +| +$/g, '');
}

/** Des chiffres ASCII → un entier exact (au plus 15 chiffres significatifs), sinon null. */
function digitsValue(digits) {
  const s = digits.replace(/^0+/, '');
  if (s.length > 15) return null;
  return s === '' ? 0 : Number(s);
}

/**
 * @param {unknown} raw  la saisie (une chaîne ; un nombre est lu comme son écriture)
 * @returns {{p:number, e:number}[]|null} les facteurs DANS L'ORDRE ÉCRIT, sans regroupement ; null si illisible
 */
export function parseFactorization(raw) {
  if (raw === null || raw === undefined || typeof raw === 'object') return null;
  const s = normalizeFactorizationInput(String(raw));
  if (s === '') return null;
  const parts = s.split('*');
  if (parts.length > MAX_FACTORS) return null;
  const factors = [];
  for (const part of parts) {
    const m = FACTOR.exec(part);
    if (!m) return null;
    const p = digitsValue(m[1]);
    const e = m[2] === undefined ? 1 : digitsValue(m[2]);
    if (p === null || e === null || e > MAX_EXPONENT) return null;
    factors.push({ p, e });
  }
  return factors;
}

const LIMIT = Number.MAX_SAFE_INTEGER;

/** p^e exact, ou Infinity au-delà de 2^53 − 1. */
function power(p, e) {
  if (e === 0) return 1;
  if (p <= 1) return p;
  let r = 1;
  for (let i = 0; i < e; i += 1) {
    r *= p;
    if (r > LIMIT) return Infinity;
  }
  return r;
}

/** Le produit des facteurs, exact ; null s'il dépasse 2^53 − 1 (il n'est alors le nombre d'aucune question). */
export function productOf(factors) {
  let prod = 1;
  let over = false;
  for (const { p, e } of factors) {
    const pw = power(p, e);
    if (pw === 0) return 0;
    if (pw === Infinity) over = true;
    else if (!over) {
      prod *= pw;
      if (prod > LIMIT) over = true;
    }
  }
  return over ? null : prod;
}

/** Primalité par divisions successives (n ≤ 10^12 : au plus 5 × 10^5 divisions). */
export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

/**
 * L'écriture canonique : chaque base une fois, exposants additionnés, bases croissantes, exposant 1 omis —
 * `2^3*3^2*5`. C'est la forme de `expectedAnswer` et le `normalized` de l'évaluation.
 */
export function canonicalFactorization(factors) {
  const merged = new Map();
  for (const { p, e } of factors) merged.set(p, (merged.get(p) ?? 0) + e);
  return [...merged.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([p, e]) => (e === 1 ? String(p) : `${p}^${e}`))
    .join('*');
}

/**
 * Pourquoi une clé `expectedAnswer` n'est pas une décomposition canonique valable, ou null si elle l'est
 * (validate-exercises.mjs). Canonique = bases premières strictement croissantes, exposants ≥ 1, exposant 1 omis,
 * écrite `2^3*3^2*5` sans espace.
 */
export function factorizationKeyProblem(key) {
  if (typeof key !== 'string') return 'la clé d’une décomposition est une chaîne comme "2^3*3^2*5"';
  const factors = parseFactorization(key);
  if (!factors) return 'illisible';
  const n = productOf(factors);
  if (n === null || n < 2 || n > MAX_FACTORIZED) return `le nombre décomposé doit être entre 2 et ${MAX_FACTORIZED}`;
  const bad = factors.find((f) => !isPrime(f.p));
  if (bad) return `${bad.p} n’est pas premier`;
  if (factors.some((f) => f.e < 1)) return 'un exposant vaut 0';
  if (key !== canonicalFactorization(factors))
    return `pas canonique : « ${canonicalFactorization(factors)} » attendu (bases croissantes, exposant 1 omis, sans espace)`;
  return null;
}

/** Le LaTeX d'une décomposition, dans l'ordre écrit : `2^{3} \times 3^{2} \times 5` (affichage). */
export function factorizationToLatex(raw) {
  const factors = parseFactorization(raw);
  if (!factors) return null;
  return factors.map(({ p, e }) => (e === 1 ? String(p) : `${p}^{${e}}`)).join(' \\times ');
}

const TO_SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** Une décomposition en texte simple, dans l'ordre écrit : `2³ × 3² × 5` (une note, la vue de l'enseignant). */
export function factorizationToPlain(raw) {
  const factors = parseFactorization(raw);
  if (!factors) return null;
  const sup = (e) => [...String(e)].map((d) => TO_SUPERSCRIPT[Number(d)]).join('');
  return factors.map(({ p, e }) => (e === 1 ? String(p) : `${p}${sup(e)}`)).join(' × ');
}
