/**
 * L'ORDRE ET LE SIGNE DE LA DIFFÉRENCE (3AM, unité 4 « الحساب الحرفي », درس « مقارنة عددين ناطقين », 2026-10-26) — arithmétique EXACTE en BigInt, aucun flottant pour un verdict.
 *
 * L'idée : a > b ⟺ a − b > 0, a < b ⟺ a − b < 0, a = b ⟺ a − b = 0. Le labo `difference-meter` branche deux sondes sur deux nombres a et b et lit UNE aiguille : le sondage
 * rouge MOINS le sondage noir. Ce module ne connaît ni l'écran ni les cartes : il calcule la différence, en tire l'ordre, juge un verdict, lit une « différence connue » (le rideau),
 * écrit deux expressions comme polynômes en x et en lit les RÉGIONS de signe (constante, x − c, c − x).
 *
 * Bâti sur les rationnels de `powers.js` (`rat`, `sub`, `sign`, `ratTex`, `parseRat`) et sur `substitution.js` (`parseExpression`, `toTerms`), importé PAR CHEMIN
 * (`@smarter-academy/core/arithmetic/orderSign.js`), jamais par le barrel du cœur (BUNDLE_BOUNDARIES §3–§4).
 */
import { rat, parseRat, add, sub, mul, div, neg, sign, eq } from './powers.js';
import { parseExpression, toTerms } from './substitution.js';

const DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
/** Latin digits, « , » decimal point, ASCII minus, no spaces. */
const latin = (text) => String(text ?? '').replace(/[٠-٩۰-۹]/g, (d) => DIGITS[d]).replace(/٫|،/g, ',').replace(/[−–—]/g, '-').replace(/\s+/g, '');

const MAX_ABS = 9;
const MAX_DEN = 99;

/** Le rationnel écrit : entier, décimal à virgule, fraction p/q (chiffres arabes-indiens et vrai moins acceptés). Lève une erreur sinon. */
export function parseNumber(text) {
  const s = latin(text);
  if (!s || s === '-' || s === '+') throw new Error('nombre vide');
  const m = /^([+-]?[\d,.]+)\/([+-]?[\d,.]+)$/.exec(s);
  if (m) return div(parseRat(m[1]), parseRat(m[2]));
  return parseRat(s);
}

/** Valide un nombre libre du labo : { ok, value } ou { ok: false, why } — 'empty' | 'syntax' | 'big' | 'den' | 'zero'. */
export function validateNumber(text) {
  const s = latin(text);
  if (!s) return { ok: false, why: 'empty' };
  let value;
  try { value = parseNumber(s); } catch (e) { return { ok: false, why: /division par 0/.test(String(e.message)) ? 'zero' : 'syntax' }; }
  if (value.d > BigInt(MAX_DEN)) return { ok: false, why: 'den' };
  const a = value.n < 0n ? -value.n : value.n;
  if (a > BigInt(MAX_ABS) * value.d) return { ok: false, why: 'big' };
  return { ok: true, value };
}

/** a − b. */
export const difference = (a, b) => sub(a, b);
/** '>' | '<' | '=' selon le signe de a − b. */
export function orderOf(a, b) {
  const s = sign(sub(a, b));
  return s > 0 ? '>' : s < 0 ? '<' : '=';
}
export const CARD_OF = Object.freeze({ '>': 'gt', '<': 'lt', '=': 'eq' });

/**
 * Le verdict d'une carte d'ordre (`gt` « a > b », `lt` « a < b », `eq` « a = b ») pour deux nombres a et b, la sonde ROUGE étant sur `red` ('a' ou 'b').
 * `reading` = rouge − noir (ce que lit l'aiguille). Le verdict juge l'ordre de a et b, jamais l'aiguille : permuter les sondes change `reading`, pas la carte juste.
 */
export function verdictJudge(a, b, red, card) {
  const reading = red === 'b' ? sub(b, a) : sub(a, b);
  const right = CARD_OF[orderOf(a, b)];
  return { ok: card === right, right, reading };
}

/**
 * Une « différence connue » (le rideau) : { left: 'a' | 'b', value } signifie « left − autre = value » ; { left, bound, strict? } signifie « left − autre ≥ bound » (> si strict).
 * Rend l'ordre de a et b ('>' | '<' | '=') ou null quand la carte ne suffit pas (la borne n'est pas strictement du côté positif ou négatif).
 */
export function fromDifference(card) {
  const flip = card.left === 'b';
  let s = null;
  if (card.value !== undefined) s = sign(card.value);
  else if (card.bound !== undefined) {
    const bs = sign(card.bound);
    if (card.dir === '<=') s = bs < 0 || (bs === 0 && card.strict) ? -1 : null;
    else s = bs > 0 || (bs === 0 && card.strict) ? 1 : null;
  }
  if (s === null) return null;
  const o = flip ? -s : s;
  return o > 0 ? '>' : o < 0 ? '<' : '=';
}

/** L'écart de deux perles sur une rail graduée à `unitPx` pixels par unité (flottant d'affichage, jamais un verdict). */
export const pixelGap = (a, b, unitPx) => Math.abs(Number(sub(a, b).n) / Number(sub(a, b).d)) * unitPx;

/** Ce que l'élève a ÉCRIT (signe, numérateur, dénominateur) est-il la différence lue ? Jugé par la valeur (réduite ou non). */
export function writtenJudge(written, reading) {
  const d = Number(written.den);
  if (!Number.isInteger(d) || d <= 0 || !Number.isInteger(Number(written.num))) return { ok: false, value: null };
  const value = rat(BigInt(written.sign < 0 ? -1 : 1) * BigInt(written.num), BigInt(d));
  return { ok: eq(value, reading), value };
}


/* ═════════════ Deux expressions ═════════════ */

/** « 3x+5 » → { text, terms } (termes entiers { c, p }, du degré le plus haut au plus bas) ; lève une erreur si l'expression n'est pas un polynôme entier en x. */
export function parseExpr(text) {
  const tree = parseExpression(text);
  const terms = toTerms(tree);
  if (!terms) throw new Error('expression non polynomiale en x');
  return { text: String(text).replace(/\s+/g, ''), tree, terms };
}

/** Valide l'expression libre du labo (ax + b ou x² + ax + b, |coefficients| ≤ 20) : { ok, expr } | { ok: false, why }. */
export function validateExpr(text) {
  const s = String(text ?? '').replace(/\s+/g, '');
  if (!s) return { ok: false, why: 'empty' };
  let expr;
  try { expr = parseExpr(s); } catch { return { ok: false, why: 'syntax' }; }
  if (expr.terms.some((t) => t.p > 2)) return { ok: false, why: 'degree' };
  if (expr.terms.some((t) => Math.abs(t.c) > 20)) return { ok: false, why: 'big' };
  return { ok: true, expr };
}

/** La valeur exacte des termes pour une valeur rationnelle de x. */
export function valueAtTerms(terms, x) {
  let sum = rat(0);
  for (const t of terms) {
    let pw = rat(1);
    for (let i = 0; i < t.p; i += 1) pw = mul(pw, x);
    sum = add(sum, mul(rat(t.c), pw));
  }
  return sum;
}
export const valueOfExpr = (expr, x) => valueAtTerms(expr.terms, x);

/** A − B réduit (termes { c, p }), A et B étant des `parseExpr`. */
export function exprDifference(A, B) {
  const all = [...A.terms, ...B.terms.map((t) => ({ c: -t.c, p: t.p }))];
  const m = new Map();
  for (const t of all) m.set(t.p, (m.get(t.p) ?? 0) + t.c);
  return [...m.entries()].filter(([, c]) => c !== 0).sort((a, b) => b[0] - a[0]).map(([p, c]) => ({ p, c }));
}

/** La forme px + q d'une différence de degré ≤ 1 : { p, q } ou null (degré plus haut : hors périmètre). */
export function linearForm(terms) {
  if (terms.some((t) => t.p > 1)) return null;
  return { p: terms.find((t) => t.p === 1)?.c ?? 0, q: terms.find((t) => t.p === 0)?.c ?? 0 };
}

/**
 * Les régions de signe de A − B pour x ≥ 0 lues directement : une constante (une seule région « pour tout x »), x − c ou c − x (trois régions : x < c, x = c, x > c).
 * Rend [{ kind: 'lt' | 'eq' | 'gt' | 'all', bound, sign }] ou null (degré > 1). `bound` est c (rationnel), `sign` le signe de A − B dans la région.
 */
export function signRegions(terms) {
  const f = linearForm(terms);
  if (!f) return null;
  if (f.p === 0) return [{ kind: 'all', bound: null, sign: Math.sign(f.q) }];
  const c = rat(-f.q, f.p);
  return [{ kind: 'lt', bound: c, sign: -Math.sign(f.p) }, { kind: 'eq', bound: c, sign: 0 }, { kind: 'gt', bound: c, sign: Math.sign(f.p) }];
}

/** Une valeur d'essai de x DANS la région (entière si possible). */
export function sampleIn(region) {
  if (region.kind === 'all') return rat(5);
  if (region.kind === 'eq') return region.bound;
  const c = region.bound;
  const flo = c.n / c.d - (c.n % c.d !== 0n && c.n < 0n ? 1n : 0n);
  return region.kind === 'lt' ? rat(flo - 1n) : rat(flo + 1n);
}

/**
 * Les cartes de régions de l'élève (une carte 'gt' | 'eq' | 'lt' = « A > B » | « A = B » | « A < B » par région) sont-elles justes ? { ok, wrong: [indices], right: [cartes] }.
 * Les régions viennent de `signRegions(terms)`, `cards` est la liste des choix (null = pas encore choisi).
 */
export function regionCardsJudge(terms, cards) {
  const regions = signRegions(terms);
  if (!regions) return { ok: false, wrong: [], right: [] };
  const right = regions.map((r) => (r.sign > 0 ? 'gt' : r.sign < 0 ? 'lt' : 'eq'));
  const wrong = right.map((c, i) => (cards?.[i] === c ? -1 : i)).filter((i) => i >= 0);
  return { ok: wrong.length === 0, wrong, right };
}

/** Les termes {p, q} écrits par l'élève (p x + q) sont-ils A − B ? Jugé par les termes réduits, donc pour TOUT x. */
export function coefJudge(terms, written) {
  const f = linearForm(terms);
  if (!f) return { ok: false };
  return { ok: f.p === Number(written.p) && f.q === Number(written.q), expected: f };
}

/** « px + q » en LaTeX (p, q entiers) : « x-4 », « 3-x », « 5 », « -2x+7 ». */
export function linearTex({ p, q }) {
  if (p === 0) return String(q);
  const px = p === 1 ? 'x' : p === -1 ? '-x' : `${p}x`;
  if (q === 0) return px;
  return `${px}${q < 0 ? '-' : '+'}${Math.abs(q)}`;
}
export const negateRat = neg;
