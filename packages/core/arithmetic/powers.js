/**
 * Les PUISSANCES d'un nombre relatif à exposant entier relatif (3AM, unité 3 « القوى ذات أسس نسبية صحيحة », درس
 * « قوة عدد نسبي », 2026-10-21) — arithmétique EXACTE en BigInt, sans aucune virgule flottante.
 *
 * Un rationnel est `{ n, d }` (BigInt, d > 0, irréductible). La définition est celle du manuel : pour a ≠ 0 et n entier
 * naturel non nul, aⁿ = a × a × … × a (n facteurs) ; a⁰ = 1 ; a⁻ⁿ = 1 / aⁿ. Le labo `power-train` la lit comme une suite
 * d'opérations à partir de 1 : n wagons « × a » (n > 0) ou |n| wagons « ÷ a » (n < 0) — `trainLoads` donne la charge après
 * chaque wagon, et `pow` la charge finale.
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/powers.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */

const big = (x) => (typeof x === 'bigint' ? x : BigInt(x));
const abs = (x) => (x < 0n ? -x : x);
function gcd(a, b) { a = abs(a); b = abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

/** Un rationnel irréductible, dénominateur positif. `rat(-2)`, `rat(1, 9)`, `rat(3n, -4n)`. */
export function rat(n, d = 1) {
  let N = big(n); let D = big(d);
  if (D === 0n) throw new Error('dénominateur nul');
  if (D < 0n) { N = -N; D = -D; }
  const g = gcd(N, D) || 1n;
  return Object.freeze({ n: N / g, d: D / g });
}

const R = (x) => (x && typeof x === 'object' && 'n' in x ? rat(x.n, x.d) : typeof x === 'string' ? parseRat(x) : rat(x));

/** « -2 », « 1/9 », « -1/27 », « 0,5 » / « 0.5 » → rationnel. Un tiret typographique (−) vaut un moins. */
export function parseRat(text) {
  const s = String(text).trim().replace(/−/g, '-').replace(/\s+/g, '').replace(',', '.');
  let m = /^([+-]?\d+)\/([+-]?\d+)$/.exec(s);
  if (m) return rat(m[1], m[2]);
  m = /^([+-]?)(\d*)\.(\d+)$/.exec(s);
  if (m) { const k = m[3].length; return rat(BigInt(`${m[1]}${m[2] || '0'}${m[3]}`), 10n ** BigInt(k)); }
  m = /^[+-]?\d+$/.exec(s);
  if (m) return rat(s);
  throw new Error(`nombre illisible : ${text}`);
}

export const isZero = (a) => R(a).n === 0n;
export const eq = (a, b) => { const p = R(a); const q = R(b); return p.n === q.n && p.d === q.d; };
export const mul = (a, b) => { const p = R(a); const q = R(b); return rat(p.n * q.n, p.d * q.d); };
export const div = (a, b) => { const p = R(a); const q = R(b); if (q.n === 0n) throw new Error('division par 0'); return rat(p.n * q.d, p.d * q.n); };
export const inverse = (a) => div(1, a);
export const neg = (a) => { const p = R(a); return rat(-p.n, p.d); };
export const add = (a, b) => { const p = R(a); const q = R(b); return rat(p.n * q.d + q.n * p.d, p.d * q.d); };
export const sub = (a, b) => add(a, neg(b));
/** −1, 0 ou 1. */
export const sign = (a) => { const p = R(a); return p.n < 0n ? -1 : p.n > 0n ? 1 : 0; };

/**
 * aⁿ exact pour a rationnel NON NUL (sauf n > 0, où 0ⁿ = 0) et n entier relatif. 0⁰ et 0⁻ⁿ refusent (le manuel pose
 * a ≠ 0).
 */
export function pow(a, n) {
  const p = R(a);
  const e = Number(n);
  if (!Number.isInteger(e)) throw new Error('exposant non entier');
  if (p.n === 0n && e <= 0) throw new Error('0 à un exposant ≤ 0');
  const k = BigInt(Math.abs(e));
  const up = rat(p.n ** k, p.d ** k);
  return e >= 0 ? up : inverse(up);
}

/** Le signe de aⁿ SANS le calculer : négatif ⇔ a < 0 et n impair (n relatif : l'inverse garde le signe). */
export function powSign(a, n) {
  const s = sign(a);
  if (s === 0) return 0;
  if (s > 0) return 1;
  return Math.abs(Number(n)) % 2 === 1 ? -1 : 1;
}

/**
 * Le TRAIN : la charge après chaque wagon, à partir de 1. n > 0 : n wagons « × a » → [a¹, a², …, aⁿ] ; n < 0 : |n| wagons
 * « ÷ a » → [a⁻¹, a⁻², …, aⁿ] ; n = 0 : [] (la locomotive seule porte 1).
 */
export function trainLoads(a, n) {
  const out = [];
  let load = rat(1);
  const k = Math.abs(Number(n));
  for (let i = 0; i < k; i += 1) {
    load = Number(n) > 0 ? mul(load, a) : div(load, a);
    out.push(load);
  }
  return out;
}

/**
 * Deux trains attelés (la règle du produit, du quotient) : A = aᵐ, B = aⁿ. `op` 'times' attelle B tel quel ; 'divide'
 * retourne d'abord chacun de ses wagons (× ↔ ÷). Un wagon « × a » et un wagon « ÷ a » s'annulent par paires.
 *   → { exponent, cancelled, wagons: [{ kind: 'times'|'divide', from: 'A'|'B', cancelled: bool }], load }
 */
export function couple(a, m, n, op = 'times') {
  const M = Number(m); const N = op === 'divide' ? -Number(n) : Number(n);
  const kindOf = (e) => (e > 0 ? 'times' : 'divide');
  const wagons = [
    ...Array.from({ length: Math.abs(M) }, () => ({ kind: kindOf(M), from: 'A', cancelled: false })),
    ...Array.from({ length: Math.abs(N) }, () => ({ kind: kindOf(N), from: 'B', cancelled: false })),
  ];
  // les paires × / ÷ s'annulent : autant que le plus petit des deux comptes (si les signes diffèrent)
  const cancelled = M * N < 0 ? Math.min(Math.abs(M), Math.abs(N)) : 0;
  let leftA = cancelled; let leftB = cancelled;
  for (const w of wagons) {
    if (w.from === 'A' && leftA > 0) { w.cancelled = true; leftA -= 1; }
    // côté B, on annule les PREMIERS wagons de B (ceux qui touchent A)
    else if (w.from === 'B' && leftB > 0) { w.cancelled = true; leftB -= 1; }
  }
  const exponent = M + N;
  return { exponent, cancelled, wagons, load: pow(a, exponent) };
}

/* ── Écriture ─────────────────────────────────────────────────────────────────────────────────── */

/** Texte simple : « -32 », « 1/9 », « -1/27 ». */
export const ratText = (a) => { const p = R(a); return p.d === 1n ? String(p.n) : `${p.n}/${p.d}`; };

/** LaTeX d'un rationnel : « -32 », « \frac{1}{9} », « -\frac{1}{27} ». */
export function ratTex(a) {
  const p = R(a);
  if (p.d === 1n) return String(p.n);
  return `${p.n < 0n ? '-' : ''}\\frac{${abs(p.n)}}{${p.d}}`;
}

/** La base telle qu'on l'écrit sous un exposant : parenthèses si elle est négative ou fractionnaire — « (-2) », « 3 », « \left(\frac{2}{3}\right) ». */
export function baseTex(a) {
  const p = R(a);
  if (p.d === 1n) return p.n < 0n ? `(${p.n})` : String(p.n);
  return `\\left(${ratTex(p)}\\right)`;
}

/** « (-2)^{5} » ; l'exposant 1 s'écrit quand même (le labo montre chaque exposant). */
export const powTex = (a, n) => `${baseTex(a)}^{${Number(n)}}`;

/** Le produit développé « (-2) \times (-2) \times (-2) » (n ≥ 1) ; pour n < 0, « \frac{1}{(-2) \times (-2)} ». */
export function factorsTex(a, n) {
  const k = Math.abs(Number(n));
  if (k === 0) return '1';
  const prod = Array.from({ length: k }, () => baseTex(a)).join(' \\times ');
  return Number(n) > 0 ? prod : `\\frac{1}{${prod}}`;
}

/** L'exposant k tel que aᵏ = target, s'il existe dans [lo ; hi] (le premier), sinon null. Sert aux tâches du labo. */
export function exponentOf(a, target, lo = -12, hi = 12) {
  for (let k = lo; k <= hi; k += 1) {
    if (isZero(a) && k <= 0) continue;
    if (eq(pow(a, k), target)) return k;
  }
  return null;
}
