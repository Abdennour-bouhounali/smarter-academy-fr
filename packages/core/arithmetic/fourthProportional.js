/**
 * LE QUATRIÈME PROPORTIONNEL EXACT — le calcul du labo `fourth-gauges` (« موازين الرابع المتناسب », 2AM, unité 5
 * « التناسبية », درس « حساب الرابع المتناسب », 2026-10-21).
 *
 * Un tableau de proportionnalité 2×2 `[[a, c], [b, d]]` (ligne 1 : quantité, ligne 2 : prix ; colonne 1 = (a, b), colonne 2 = (c, d))
 * dont UNE case manque (« le trou » : `a`, `b`, `c` ou `d`). Les nombres sont des FRACTIONS exactes de `linear.js` (`frac`, `mul`,
 * `div`, `cmp` — jamais un flottant) ; le quatrième proportionnel de `proportional.js › fourthProportional` en est le cas `d`.
 * Les vues ne recalculent rien : elles appellent ce module.
 *
 *   solve('d', { a: '5', b: '625', c: '6' })            → 750
 *   gauges('d', known, h)                               → { unit, between, cross, diff } avec leur état eq | lt | gt | off
 *   routes('d', { a: '5', b: '625', c: '6' })           → les cinq chemins, avec leurs nombres et `clean`
 *   freeAnswer('5', '625', '6')                         → { kind: 'exact', text: '750', step: 100, max: ... }
 *
 * LES QUATRE BALANCES (formules FIXES — la même égalité vue de trois côtés, la quatrième ment). Côté GAUCHE `L`, côté DROIT `R` :
 *   unit     « في الكيلو »     L = b ÷ a   R = d ÷ c      le prix d'UNE unité dans chaque colonne
 *   between  « بين العمودين »  L = c ÷ a   R = d ÷ b      combien de fois la quantité a grandi / combien de fois le prix a grandi
 *   cross    « الجداءان »      L = b × c   R = a × d      les deux produits en croix
 *   diff     « الفرق » (leurre) L = c − a   R = d − b      écrite seulement si c > a et d > b ; sinon `off`
 * `state` ∈ { eq, lt, gt, off } : gauche égal / plus petit / plus grand que droit ; `off` = non définie (division par 0, ou diff
 * sans sens). Comme `b ÷ a < d ÷ c ⇔ c ÷ a < d ÷ b ⇔ b × c < a × d` (nombres > 0), les trois balances vraies penchent TOUJOURS du
 * même côté, quel que soit le trou ; elles sont ÉQUILIBRÉES ensemble exactement pour le quatrième proportionnel.
 *
 * LES CINQ CHEMINS (le tableau lu comme : une colonne complète (u1, v1), une colonne partielle dont on connaît `u2` en face du trou `h`
 * — `h = v1 × u2 ÷ u1`) :
 *   coefficient     k = v1 ÷ u1                  puis  h = u2 × k
 *   unit            p = v1 ÷ u1 (la valeur d'UNE unité)  puis  h = p × u2
 *   additive        w = |u2 − u1| ; p = v1 ÷ u1 ; r = p × w ; h = v1 ± r
 *   multiplicative  m = u2 ÷ u1 ; h = v1 × m
 *   cross           u1 × h = v1 × u2 : P = v1 × u2 ; h = P ÷ u1
 * `clean` : tous les nombres écrits sont des décimaux finis à ≤ 2 chiffres (sinon la ligne manque dans le دفتر).
 *
 * Importé PAR CHEMIN (`@smarter-academy/core/arithmetic/fourthProportional.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §4).
 */
import { frac, parseNumber, mul, div, sub, add, cmp, isZero, fracText } from './linear.js';

export const HOLES = Object.freeze(['a', 'b', 'c', 'd']);
export const ROUTES = Object.freeze(['coefficient', 'unit', 'additive', 'multiplicative', 'cross']);
/** Borne du quatrième proportionnel affichable sur une règle (au-delà : « جرّب أعدادك » refuse). */
const MAX_ANSWER = 99999;

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** « 2,5 », « ٢٫٥ », « 2.5 », 2.5 (nombre), une fraction {n,d} → fraction exacte ≥ 0 ; lève si illisible ou plus de 2 décimales. */
export function parse(x) {
  if (x && typeof x === 'object' && 'n' in x) return x;
  if (typeof x === 'number') {
    if (!Number.isFinite(x)) throw new Error(`nombre illisible : ${x}`);
    return parse(String(Math.round(x * 100) / 100));
  }
  const s = String(x).trim().replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/[,٫،]/g, '.').replace(/\s+/g, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(s)) throw new Error(`nombre illisible : ${x}`);
  return parseNumber(s);
}

/** Les hundredths (entiers) d'un nombre à ≤ 2 décimales : « 2,5 » → 250. */
export function toHundredths(x) {
  const f = parse(x);
  const h = (f.n * 100) / f.d;
  if (!Number.isInteger(h)) throw new Error(`plus de 2 décimales : ${x}`);
  return h;
}
/** Une fraction de centièmes entiers : 250 → 5/2. */
export const fromHundredths = (h) => frac(h, 100);

/** Écriture décimale à virgule d'une fraction FINIE à ≤ `digits` chiffres (« 4,5 », « 520 »), sinon `null`. */
export function decimalText(p, digits = 2) {
  let d = p.d; let k = 0; let j = 0;
  while (d % 2 === 0) { d /= 2; k += 1; }
  while (d % 5 === 0) { d /= 5; j += 1; }
  const n = Math.max(k, j);
  if (d !== 1 || n > digits) return null;
  const sign = p.n < 0 ? '-' : '';
  const abs = Math.abs(p.n);
  const scale = 10 ** n; // p.d = 2^k·5^j divise 10^n : le produit est un entier exact
  const scaled = (abs * scale) / p.d;
  const whole = Math.floor(scaled / scale);
  const tail = n ? String(scaled % scale).padStart(n, '0') : '';
  return `${sign}${whole}${tail ? `,${tail}` : ''}`;
}
/** Le nombre d'un côté de balance, à l'écran : décimal si fini (≤ 4 chiffres), sinon la fraction réduite « 350/3 ». */
export const showValue = (p) => decimalText(p, 4) ?? fracText(p);

/* ── Le tableau et le trou ───────────────────────────────────────────────────────────────────── */

/** Les nombres connus (trois des quatre), sous forme de fractions ; lève si un nombre manque ou si le trou est inconnu. */
function known(hole, nums) {
  if (!HOLES.includes(hole)) throw new Error(`trou inconnu : ${hole}`);
  const out = {};
  for (const k of HOLES) {
    if (k === hole) continue;
    if (nums[k] == null || nums[k] === '') throw new Error(`il manque ${k}`);
    out[k] = parse(nums[k]);
    if (isZero(out[k])) throw new Error(`${k} doit être strictement positif`);
  }
  return out;
}

/** Le quatrième proportionnel EXACT (fraction). */
export function solve(hole, nums) {
  const t = known(hole, nums);
  if (hole === 'd') return div(mul(t.b, t.c), t.a);
  if (hole === 'c') return div(mul(t.a, t.d), t.b);
  if (hole === 'b') return div(mul(t.a, t.d), t.c);
  return div(mul(t.b, t.c), t.d);
}
/** Le texte du quatrième proportionnel : décimal à virgule s'il est fini à ≤ 2 chiffres, sinon la fraction. */
export const solveText = (hole, nums) => showValue(solve(hole, nums));

/** Le tableau complet avec la valeur `h` (fraction, texte ou nombre) dans le trou. */
export function table(hole, nums, h) {
  const t = known(hole, nums);
  return { ...t, [hole]: parse(h) };
}

/** La colonne complète et la colonne partielle : { u1, v1, u2, hole row, names }. h = v1 × u2 ÷ u1. */
export function frame(hole, nums) {
  const t = known(hole, nums);
  // (u1, v1) = la colonne complète, u2 = le connu de la colonne partielle (dans la rangée de u1)
  if (hole === 'd') return { u1: t.a, v1: t.b, u2: t.c, cells: { u1: 'a', v1: 'b', u2: 'c', h: 'd' } };
  if (hole === 'c') return { u1: t.b, v1: t.a, u2: t.d, cells: { u1: 'b', v1: 'a', u2: 'd', h: 'c' } };
  if (hole === 'b') return { u1: t.c, v1: t.d, u2: t.a, cells: { u1: 'c', v1: 'd', u2: 'a', h: 'b' } };
  return { u1: t.d, v1: t.c, u2: t.b, cells: { u1: 'd', v1: 'c', u2: 'b', h: 'a' } };
}

/* ── Les balances ────────────────────────────────────────────────────────────────────────────── */

const side = (op, x, y, value) => Object.freeze({ op, x, y, value });
const stateOf = (l, r) => { const c = cmp(l, r); return c < 0 ? 'lt' : c > 0 ? 'gt' : 'eq'; };

/**
 * Une balance pour la valeur `h` du trou. Retourne { kind, state, left, right } avec left/right = { op, x, y, value } (fractions) ;
 * `state: 'off'` (et `left`/`right` à valeur `null`) quand la balance n'est pas définie.
 */
export function gauge(kind, hole, nums, h) {
  const t = table(hole, nums, h);
  const { a, b, c, d } = t;
  let L; let R; let ok = true;
  if (kind === 'unit') {
    ok = !isZero(a) && !isZero(c);
    L = ok ? side('÷', b, a, div(b, a)) : side('÷', b, a, null);
    R = ok ? side('÷', d, c, div(d, c)) : side('÷', d, c, null);
  } else if (kind === 'between') {
    ok = !isZero(a) && !isZero(b);
    L = ok ? side('÷', c, a, div(c, a)) : side('÷', c, a, null);
    R = ok ? side('÷', d, b, div(d, b)) : side('÷', d, b, null);
  } else if (kind === 'cross') {
    L = side('×', b, c, mul(b, c));
    R = side('×', a, d, mul(a, d));
  } else if (kind === 'diff') {
    ok = cmp(c, a) > 0 && cmp(d, b) > 0;
    L = ok ? side('−', c, a, sub(c, a)) : side('−', c, a, null);
    R = ok ? side('−', d, b, sub(d, b)) : side('−', d, b, null);
  } else throw new Error(`balance inconnue : ${kind}`);
  return Object.freeze({ kind, state: ok ? stateOf(L.value, R.value) : 'off', left: L, right: R });
}

/** Les trois vraies balances, plus `diff` quand `decoy`. { unit, between, cross, diff|null } */
export function gauges(hole, nums, h, { decoy = false } = {}) {
  return Object.freeze({
    unit: gauge('unit', hole, nums, h),
    between: gauge('between', hole, nums, h),
    cross: gauge('cross', hole, nums, h),
    diff: decoy ? gauge('diff', hole, nums, h) : null,
  });
}
/** Les états seuls (l'événement `onTrial`) : { unit, between, cross, diff } ('eq'|'lt'|'gt'|'off', `diff` null hors leurre). */
export const statesOf = (g) => ({ unit: g.unit.state, between: g.between.state, cross: g.cross.state, diff: g.diff ? g.diff.state : null });
/** Les trois vraies balances sont-elles équilibrées ? */
export const allBalanced = (g) => g.unit.state === 'eq' && g.between.state === 'eq' && g.cross.state === 'eq';

/** La valeur du trou qui n'allume QUE la balance « الفرق » : d = b + (c − a) (trou `d`), etc. `null` si elle n'existe pas. */
export function decoyValue(hole, nums) {
  const t = known(hole, nums);
  let v;
  if (hole === 'd') v = add(t.b, sub(t.c, t.a));
  else if (hole === 'c') v = add(t.a, sub(t.d, t.b));
  else if (hole === 'b') v = sub(t.d, sub(t.c, t.a));
  else v = sub(t.c, sub(t.d, t.b));
  return v.n > 0 ? v : null;
}

/* ── Les cinq chemins ────────────────────────────────────────────────────────────────────────── */

/** Le nombre d'un côté de balance à l'écran : le décimal fini (≤ 4 chiffres), sinon la fraction des opérandes « 700/6 » (jamais d'arrondi). */
export function sideText(s) {
  return s.value == null ? null : (decimalText(s.value, 4) ?? `${showValue(s.x)}/${showValue(s.y)}`);
}

const num = (p) => decimalText(p, 2);
/** Une étape { op, x, y, r } : `x op y = r`, avec les textes à ≤ 2 décimales (`null` si l'un n'en a pas : l'étape n'est pas propre). */
function step(op, x, y, r) {
  const sx = num(x); const sy = num(y); const sr = num(r);
  return { op, x: sx, y: sy, r: sr, clean: sx != null && sy != null && sr != null };
}

/**
 * Les cinq chemins vers le même résultat avec les nombres du tableau. Retourne
 * { frame, answer (fraction), answerText, routes: { coefficient, unit, additive, multiplicative, cross } } où chaque chemin est
 * { id, clean, steps: [{ op, x, y, r, clean }], result } (`result` = texte du quatrième proportionnel).
 */
export function routes(hole, nums) {
  const fr = frame(hole, nums);
  const { u1, v1, u2 } = fr;
  const h = div(mul(v1, u2), u1);
  const result = showValue(h);
  const mk = (id, steps) => Object.freeze({ id, clean: steps.every((s) => s.clean) && num(h) != null, steps: Object.freeze(steps), result });
  const k = div(v1, u1);
  const m = div(u2, u1);
  const wDiff = sub(u2, u1);
  const neg = wDiff.n < 0;
  const w = neg ? sub(u1, u2) : wDiff;
  const r = mul(k, w);
  return Object.freeze({
    frame: fr,
    answer: h,
    answerText: result,
    routes: Object.freeze({
      coefficient: mk('coefficient', [step('÷', v1, u1, k), step('×', u2, k, h)]),
      unit: mk('unit', [step('÷', v1, u1, k), step('×', k, u2, h)]),
      additive: mk('additive', neg
        ? [step('−', u1, u2, w), step('×', k, w, r), step('−', v1, r, h)]
        : [step('−', u2, u1, w), step('×', k, w, r), step('+', v1, r, h)]),
      multiplicative: mk('multiplicative', [step('÷', u2, u1, m), step('×', v1, m, h)]),
      cross: mk('cross', [step('×', v1, u2, mul(v1, u2)), step('÷', mul(v1, u2), u1, h)]),
    }),
  });
}

/* ── « جرّب أعدادك » ─────────────────────────────────────────────────────────────────────────── */

/** Un nombre saisi : décimal > 0, ≤ 2 décimales, ≤ 9999 ; renvoie le texte normalisé (« 2,5 ») ou null. */
export function parseFree(raw, limit = 9999) {
  try {
    const f = parse(String(raw));
    if (isZero(f) || f.n / f.d > limit) return null;
    return decimalText(f, 2);
  } catch { return null; }
}

/**
 * Le trou `d` d'un tableau libre (a, b, c). Retourne
 *   { kind: 'exact', text, h (fraction), step (centièmes), max (centièmes) }   — le quatrième proportionnel est un décimal à ≤ 2 chiffres ;
 *     le pas est le plus petit pas décimal qui l'atteint (1, 0,1 ou 0,01), max = 3 × le quatrième proportionnel arrondi à l'entier supérieur (≥ 1)
 *   { kind: 'inexact', text (fraction ou décimal long), finite, step: 1, max }   — aucun nombre de la règle ne l'atteint (10/3, ou 0,125)
 *   { kind: 'range' }                                                     — trop grand pour une règle (> MAX_ANSWER)
 */
export function freeAnswer(a, b, c) {
  const nums = { a: parse(a), b: parse(b), c: parse(c) };
  const h = solve('d', nums);
  if (h.n / h.d > MAX_ANSWER) return { kind: 'range' };
  const max = Math.max(100, Math.ceil((3 * h.n) / h.d) * 100);
  const t = decimalText(h, 2);
  if (t != null) {
    const hund = (h.n * 100) / h.d;
    const step = hund % 100 === 0 ? 100 : hund % 10 === 0 ? 10 : 1;
    return { kind: 'exact', text: t, h, step, max };
  }
  const long = decimalText(h, 6);
  return { kind: 'inexact', text: long ?? fracText(h), finite: long != null, step: 1, max };
}

