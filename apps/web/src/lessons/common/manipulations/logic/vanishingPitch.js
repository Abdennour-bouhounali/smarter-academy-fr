import * as Lin from '@smarter-academy/core/arithmetic/linear.js';

/**
 * vanishing-pitch — LE TERRAIN QUI S'ANNULE (unité 4, leçon 2 « معادلات جداء معدوم »).
 *
 * Un produit « f1|f2 » de deux facteurs du premier degré (ou constants) — « 3|x-5 »,
 * « x-2|x+5 », « 3x-4|-2x+1 » ; un seul facteur « 2x+1 » veut dire son CARRÉ. Les deux
 * facteurs sont les deux CÔTÉS signés d'un terrain dessiné depuis un coin : A le long
 * de l'horizontale, B le long de la verticale ; l'aire (signée) est A × B.
 *
 * x est un entier `v` lu sur une graduation 1/g (x = v / g). g est le PPCM des
 * dénominateurs des zéros : 1 pour (x − 2)(x + 5), 6 pour (3x − 4)(−2x + 1) dont les
 * zéros sont 1/2 et 4/3 — chaque zéro EST une graduation, jamais un arrondi.
 * Toute l'arithmétique est exacte (packages/core/arithmetic/linear.js) : aucune
 * égalité de flottants.
 *
 * Épingler x comme solution de « A × B = 0 » est une RÉPONSE, jugée ici :
 *   - l'aire n'est pas nulle : refus, avec A, B et l'aire lus exactement
 *     (« (−1) × 6 = −6 ≠ 0 ») ;
 *   - sinon l'épingle est posée, avec le(s) côté(s) qui s'annule(nt).
 * Dire « لا حلول أخرى » est aussi une réponse : juste seulement quand tous les
 * zéros sont épinglés ET que la règle a été balayée des deux côtés des zéros —
 * c'est le balayage qui montre que le terrain ne disparaît nulle part ailleurs.
 */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => (a / gcd(a, b)) * b;

/** Lit le produit : facteurs, zéros exacts, graduation, carré ou non. */
function parseProduct(expr) {
  const F = Lin.factors(expr);
  if (F.everyX) throw new Error(`vanishing-pitch: un facteur nul rend tout x solution (« ${expr} »)`);
  if (F.roots.length === 0) throw new Error(`vanishing-pitch: aucun facteur ne s'annule (« ${expr} »)`);
  const g = F.roots.reduce((acc, r) => lcm(acc, r.d), 1);
  return { factors: F.factors, zeros: F.zeros, roots: F.roots, g, square: !String(expr).includes('|') };
}

/**
 * `startX` / `range` (lecteur, 2026-11-11, unité 4 leçon 2) : le x d'ouverture et la règle [min, max] donnés EN x par la manche ; sans eux,
 * tout est dérivé comme avant (la page est inchangée).
 */
export function init({ expr, startX, range: wanted }) {
  const P = parseProduct(expr);
  const lo = Math.min(Math.floor(Lin.toNumber(P.roots[0])), 0) - 2;
  const hi = Math.max(Math.ceil(Lin.toNumber(P.roots.at(-1))), 0) + 2;
  const own = wanted ? { min: wanted[0] * P.g, max: wanted[1] * P.g } : null;
  return {
    ...(startX != null ? { startV: Math.round(startX * P.g) } : {}),
    expr,
    ...P,
    // Le produit écrit avec des décimaux (−1,2(3x + 2,7)) se lit en décimaux ; sinon en fractions (1/2, 4/3).
    decimal: /[.,]/.test(String(expr)),
    range: own ?? { min: lo * P.g, max: hi * P.g },
    rootUnits: P.roots.map((r) => (r.n * P.g) / r.d),
    x: null, // l'entier v, x = v / g
    visited: [], // les v validés (le balayage)
    pins: [], // les v épinglés (toujours des zéros)
    refused: [], // les v refusés
    claimed: false, // « لا حلول أخرى » accepté
    last: null,
  };
}

export const xOf = (s, v) => Lin.frac(v, s.g);

/** Les deux côtés et l'aire, exacts, pour v. */
export function sides(s, v) {
  const x = xOf(s, v);
  const A = Lin.linAt(s.factors[0], x);
  const B = Lin.linAt(s.factors[1], x);
  return { x, A, B, area: Lin.mul(A, B) };
}

/** Les indices des côtés nuls pour v (0, 1, les deux pour un carré, ou aucun). */
export const zeroSides = (s, v) => {
  const { A, B } = sides(s, v);
  return [A, B].map((P, i) => (Lin.isZero(P) ? i : null)).filter((i) => i !== null);
};

/** Un facteur constant ne s'annule jamais (« 3 » dans 3(x − 5)). */
export const isConstant = (s, i) => Lin.isZero(s.factors[i].a);

export function move(s, v) {
  if (!Number.isInteger(v) || v < s.range.min || v > s.range.max) return s;
  return { ...s, x: v, visited: s.visited.includes(v) ? s.visited : [...s.visited, v] };
}

/** Épingler le x courant comme solution de A × B = 0. */
export function pin(s) {
  if (s.x == null) return { ...s, last: { kind: 'noX' } };
  const v = s.x;
  const { area } = sides(s, v);
  if (!Lin.isZero(area)) {
    return { ...s, refused: s.refused.includes(v) ? s.refused : [...s.refused, v], last: { kind: 'notZero', v } };
  }
  if (s.pins.includes(v)) return { ...s, last: { kind: 'already', v } };
  return { ...s, pins: [...s.pins, v].sort((a, b) => a - b), last: { kind: 'pinned', v, zero: zeroSides(s, v) } };
}

export const allPinned = (s) => s.rootUnits.every((u) => s.pins.includes(u));

/** La règle a-t-elle été balayée de part et d'autre des zéros ? */
export const swept = (s) => s.visited.some((v) => v < s.rootUnits[0]) && s.visited.some((v) => v > s.rootUnits.at(-1));

/** « لا حلول أخرى » : tous les zéros épinglés, après un balayage des deux côtés. */
export function claimNoOther(s) {
  if (!allPinned(s)) return { ...s, last: { kind: 'missing' } };
  if (!swept(s)) return { ...s, last: { kind: 'notSwept' } };
  return { ...s, claimed: true, last: { kind: 'claimed' } };
}

/**
 * La découverte : le CONTRASTE — un x refusé (aire lue ≠ 0), tous les zéros épinglés,
 * et « لا حلول أخرى » justifié par le balayage. Au niveau مبتدئ (3(x − 5)) le côté 3
 * ne s'écrase jamais : une seule épingle ; au niveau متقدم, deux.
 */
export const discoveryReady = (s) => s.refused.length > 0 && allPinned(s) && s.claimed;

/* ── Écritures ─────────────────────────────────────────────────────────── */

export const toNum = (p) => Lin.toNumber(p);

/** Un nombre exact pour le DOM : « −1/2 », « 6 » ; « −0,9 » quand le produit est écrit en décimaux. */
export function numText(p, decimal = false) {
  const d = decimal ? Lin.fracDecimal(p, 3) : null;
  const t = d ?? Lin.fracText(p);
  return t.replace('-', '−');
}
/** Le même en LaTeX, entre parenthèses s'il est négatif (pour un produit). */
function numTex(p, paren = false, decimal = false) {
  const d = decimal ? Lin.fracDecimal(p, 3) : null;
  const t = d != null ? d.replace(',', '{,}') : Lin.fracLatex(p);
  return paren && p.n < 0 ? `(${t})` : t;
}
/** a·x + b en LaTeX, décimaux courts à virgule : « x - 5 », « 3x + 2{,}7 », « -2x + 1 ». */
function linTex(P, decimal = false) {
  const parts = [];
  if (!Lin.isZero(P.a)) {
    const coef = Lin.eq(P.a, 1) ? '' : Lin.eq(P.a, -1) ? '-' : numTex(P.a, false, decimal);
    parts.push(`${coef}x`);
  }
  if (!Lin.isZero(P.b) || parts.length === 0) {
    const t = numTex(P.b, false, decimal);
    parts.push(parts.length === 0 ? t : (P.b.n < 0 ? `- ${t.slice(1)}` : `+ ${t}`));
  }
  return parts.join(' ');
}
/** Un facteur en LaTeX : « x - 5 », « 3 », « -2x + 1 ». */
export const factorTex = (s, i) => linTex(s.factors[i], s.decimal);
const oneTerm = (P) => Lin.isZero(P.a) || Lin.isZero(P.b);
/** Le produit en LaTeX, écrit comme le manuel : « 3(x - 5) », « (x - 2)(x + 5) », « 4x(-x + 1) », « (2x + 1)^2 ». */
export function productTex(s) {
  const [P, Q] = s.factors;
  const T = (F) => linTex(F, s.decimal);
  if (s.square) return `(${T(P)})^2`;
  const first = oneTerm(P) ? T(P) : `(${T(P)})`;
  return `${first}(${T(Q)})`;
}
/** « (−1) × 6 = −6 » en LaTeX pour v. */
export function areaTex(s, v) {
  const { A, B, area } = sides(s, v);
  return `${numTex(A, true, s.decimal)} \\times ${numTex(B, true, s.decimal)} = ${numTex(area, false, s.decimal)}`;
}
/** Une solution en LaTeX : « 2 », « -5 », « \dfrac{1}{2} » (jamais un décimal approché). */
export const rootTex = (r, decimal = false) => numTex(r, false, decimal);
/** Un nombre du lab, dans l'écriture du produit (décimale ou fractionnaire). */
export const labText = (s, p) => numText(p, s.decimal);
export const labTex = (s, p, paren = false) => numTex(p, paren, s.decimal);

/**
 * La phrase de la forme : « (x − 2)(x + 5) = 0 يعني x − 2 = 0 أو x + 5 = 0 ».
 * Un facteur constant non nul est écarté (« لأنّ 3 ≠ 0 ») ; un carré n'a qu'une équation.
 */
export function equationsOf(s) {
  if (s.square) return [{ i: 0, tex: `${factorTex(s, 0)} = 0`, root: s.zeros[0] }];
  return s.factors.map((_, i) => (isConstant(s, i) ? null : { i, tex: `${factorTex(s, i)} = 0`, root: s.zeros[i] })).filter(Boolean);
}

/* ── Géométrie (pure, balayée par les tests) ─────────────────────────────── */

/**
 * Le terrain dans une boîte de largeur `width` : un coin O fixe, A vers la droite
 * (vers la gauche s'il est négatif), B vers le haut (vers le bas s'il est négatif).
 * La boîte est calculée pour TOUT x de la règle (les extrêmes d'une expression du
 * premier degré sont aux bouts) : le terrain ne sort jamais du dessin.
 */
export function geometry(s, v, { width, maxHeight = 320, pad = 26, maxUnit = 40 }) {
  const ends = [s.range.min, s.range.max].map((u) => sides(s, u));
  const As = ends.map((e) => Lin.toNumber(e.A));
  const Bs = ends.map((e) => Lin.toNumber(e.B));
  const aMin = Math.min(0, ...As); const aMax = Math.max(0, ...As);
  const bMin = Math.min(0, ...Bs); const bMax = Math.max(0, ...Bs);
  const spanA = Math.max(1, aMax - aMin); const spanB = Math.max(1, bMax - bMin);
  const unit = Math.max(4, Math.min(maxUnit, (width - 2 * pad) / spanA, (maxHeight - 2 * pad) / spanB));
  const svgW = spanA * unit + 2 * pad;
  const svgH = spanB * unit + 2 * pad;
  const ox = pad - aMin * unit;
  const oy = pad + bMax * unit;
  const { A, B, area } = sides(s, v);
  const a = Lin.toNumber(A); const b = Lin.toNumber(B);
  const x0 = Math.min(ox, ox + a * unit); const x1 = Math.max(ox, ox + a * unit);
  const y0 = Math.min(oy, oy - b * unit); const y1 = Math.max(oy, oy - b * unit);
  return {
    unit, svgW, svgH, ox, oy,
    rect: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
    negA: a < 0, negB: b < 0,
    collapsed: Lin.isZero(area),
    sign: Lin.isZero(area) ? 0 : area.n > 0 ? 1 : -1,
  };
}

/**
 * Le x PAR DÉFAUT à l'ouverture (jamais une visite, jamais écrit dans `visited`) :
 * la graduation la plus proche de 0 où le terrain NE s'écrase PAS (aire ≠ 0) —
 * jamais un zéro, qui serait la réponse. Sinon le minimum de la règle.
 */
export function defaultV(s) {
  if (s.startV != null) return s.startV;
  const ok = (v) => v >= s.range.min && v <= s.range.max && !Lin.isZero(sides(s, v).area);
  for (let d = 0; d <= s.range.max - s.range.min; d += 1) {
    if (ok(d)) return d;
    if (ok(-d)) return -d;
  }
  return s.range.min;
}
