/**
 * Le calcul EXACT de la manipulation `area-split` « أرض الحديقة » (3AM, unité 4 « الحساب الحرفي », درس « نشر عبارات جبرية »,
 * 2026-10-21) : développer k(a + b) et (a + b)(c + d) par l'AIRE d'un rectangle comptée de deux façons. Importé PAR CHEMIN, jamais
 * par le barrel du core ; bâti sur `polynomials.js`. Rien ici n'arrondit : des entiers.
 *
 * DEUX MONDES
 *  plot    un terrain rectangulaire dont les deux côtés sont des `Side` { m, n } = m·x + n (m ∈ 0…2, n entier). Un côté se COUPE là
 *          où son écriture change de terme (`cutRight`) ; chaque parcelle (`patchesOf`) a un terme-produit, donc un signe, et une
 *          aire en valeur absolue (`patchArea`). La parcelle du COIN (deux termes négatifs) est ôtée deux fois : on la rend.
 *          Le juge est l'aire COMPTÉE du terrain (`plotArea`, le produit des deux côtés) contre la somme signée (`signJudge`).
 *  arrows  une `Expr` { products: [{ sign, f1, f2 }] } (termes { c, p } de polynomials.js) ; chaque terme du premier facteur
 *          est relié à chaque terme du second (`arrowsOf`) ; le produit partiel est jugé par sa valeur à x (`arrowJudge`).
 *
 * Le x de la main : 4…9 (`X_MIN`…`X_MAX`) ; un côté m·x + n avec n < 0 reste positif tant que x > |n| (`minX`).
 */
import { mulTerms, reduce, evaluate, termsTex, termTex } from './polynomials.js';

export const X_MIN = 4;
export const X_MAX = 9;
export const X_DEFAULT = 6;

const pow = (x, p) => x ** p;

/* ═════════════ Les côtés ═════════════ */

/** Un côté m·x + n. */
export const side = (m, n) => ({ m, n });
/** Les termes d'un côté, le terme en x d'abord : (2, −3) → [2x, −3] ; (0, 3) → [3]. */
export const sideTerms = ({ m, n }) => [m ? { c: m, p: 1 } : null, n ? { c: n, p: 0 } : null].filter(Boolean);
export const sideValue = ({ m, n }, x) => m * x + n;
export const sideTex = (s) => termsTex(sideTerms(s));
/** Un côté entre parenthèses s'il a deux termes : « (x - 2) », « 3 ». */
export const sideFactorTex = (s) => (sideTerms(s).length > 1 ? `(${sideTex(s)})` : sideTex(s));
/** Un côté qui se coupe : un terme en x ET un nombre. */
export const isCuttable = ({ m, n }) => m > 0 && n !== 0;
/** La longueur dessinée du côté à x : le terme en x entier, plus le nombre s'il s'ajoute (s'il s'ôte, il mord sur le terme en x). */
export const drawnLength = ({ m, n }, x) => m * x + (n > 0 ? n : 0);
/** Le plus petit x (≥ X_MIN) pour lequel les deux côtés restent positifs. */
export function minX(...sides) {
  let lo = X_MIN;
  for (const s of sides) if (s.m > 0 && s.n < 0) lo = Math.max(lo, Math.floor(-s.n / s.m) + 1);
  return lo;
}
/** Un terrain valide : côtés non nuls et positifs à tout x de la plage de leur x. */
export const isValidPlot = (h, w) => [h, w].every((s) => s.m >= 0 && s.m <= 2 && (s.m > 0 || s.n > 0)) && w.m > 0 && minX(h, w) <= X_MAX;

/* ═════════════ La coupure ═════════════ */

/**
 * Où la coupure est juste, mesurée depuis le bord d'origine du côté : n > 0 → à m·x (le terme en x finit, le nombre commence) ;
 * n < 0 → à m·x + n (là où commence la bande ôtée). `null` : ce côté ne se coupe pas.
 */
export function cutRight(s, x) {
  if (!isCuttable(s)) return null;
  return s.n > 0 ? s.m * x : s.m * x + s.n;
}
/**
 * Une coupure relâchée à `at` est-elle juste ? Juste en `cutRight`, ou — la même décomposition écrite dans l'autre ordre —
 * à `|n|` du bord d'origine (le nombre d'abord). `swapped` : c'est ce second cas.
 */
export function judgeCut(s, x, at) {
  const right = cutRight(s, x);
  if (right == null) return { ok: false, swapped: false, right: null };
  if (at === right) return { ok: true, swapped: false, right };
  if (at === Math.abs(s.n) && at !== right) return { ok: true, swapped: true, right };
  return { ok: false, swapped: false, right };
}
/** Les deux longueurs que fait une coupure en `at` sur un côté de longueur `len`. */
export const cutLengths = (len, at) => [at, len - at];

/** Les segments d'un côté (un par terme) : { i, term, sign }. */
export const segments = (s) => sideTerms(s).map((term, i) => ({ i, term, sign: Math.sign(term.c) }));
/**
 * L'intervalle [from, to] que le segment `i` occupe sur le côté, à x : le terme en x occupe [0, m·x] ; un nombre positif suit ;
 * un nombre négatif est la bande ôtée au bout, [m·x + n, m·x] — elle mord sur le terme en x.
 */
export function segmentSpan(s, i, x) {
  const t = sideTerms(s)[i];
  if (t.p === 1) return { from: 0, to: s.m * x };
  if (s.m === 0) return { from: 0, to: s.n };
  return t.c > 0 ? { from: s.m * x, to: s.m * x + s.n } : { from: s.m * x + s.n, to: s.m * x };
}

/* ═════════════ Les parcelles ═════════════ */

/**
 * Les parcelles du terrain h × w (h le côté vertical, w l'horizontal), dans l'ordre de l'écriture a·c + a·d + b·c + b·d :
 * { id, i, j, term, sign, corner } — `term` est le produit des deux termes (3x, −6, x²…), `sign` son signe (la décision de la main),
 * `corner` : les deux termes sont négatifs (la bande est ôtée deux fois, on rend le coin).
 */
export function patchesOf(h, w) {
  const sh = segments(h); const sw = segments(w);
  return sh.flatMap((a) => sw.map((b) => {
    const term = mulTerms(a.term, b.term);
    return { id: `p${a.i}${b.i}`, i: a.i, j: b.i, term, sign: Math.sign(term.c), corner: a.term.c < 0 && b.term.c < 0, hTerm: a.term, wTerm: b.term };
  }));
}
/** L'aire d'une parcelle à x, en valeur absolue (ce que le dessin couvre). */
export const patchArea = (p, x) => Math.abs(p.term.c) * pow(x, p.term.p);
/** L'aire signée (ce que la parcelle ajoute à la somme quand son signe est juste). */
export const patchSigned = (p, x) => p.term.c * pow(x, p.term.p);
/** L'aire COMPTÉE du terrain à x : le produit de ses deux côtés. */
export const plotArea = (h, w, x) => sideValue(h, x) * sideValue(w, x);
/** La somme signée des parcelles à x, avec les signes `signs` ({ id: ±1 }) ; une parcelle sans signe compte pour son vrai signe. */
export function partsSum(patches, x, signs = {}) {
  return patches.reduce((a, p) => a + (signs[p.id] ?? p.sign) * patchArea(p, x), 0);
}
/** La somme des seules parcelles DÉCIDÉES (ce que la main a écrit jusqu'ici). */
export function decidedSum(patches, x, signs = {}) {
  return patches.reduce((a, p) => a + (signs[p.id] ? signs[p.id] * patchArea(p, x) : 0), 0);
}
/**
 * Le choix `chosen` (±1) pour la parcelle `id` est-il juste ? Le juge : l'aire comptée du terrain contre la somme signée des
 * parcelles avec ce choix (les autres, comme la main les a décidées, ou justes). `counted`/`written` : les deux aires de la bannière.
 */
export function signJudge(h, w, x, patches, signs, id, chosen) {
  const counted = plotArea(h, w, x);
  const written = partsSum(patches, x, { ...signs, [id]: chosen >= 0 ? 1 : -1 });
  return { ok: counted === written, counted, written };
}
/** Les termes de l'expansion dans l'ordre des parcelles : x² + 2x + 3x + 6. */
export const expansionTerms = (patches) => patches.map((p) => ({ ...p.term }));
export const expansionTex = (patches) => termsTex(expansionTerms(patches));
/** La forme réduite (puissances décroissantes). */
export const reducedTerms = (patches) => reduce(expansionTerms(patches));
export const reducedTex = (patches) => termsTex(reducedTerms(patches));
/** Les puissances présentes dans l'expansion avant réduction, décroissantes : x², x, 1. */
export const usedPowers = (terms) => [...new Set(terms.map((t) => t.p))].sort((a, b) => b - a);
/** Le coefficient juste de la puissance `p` dans une liste de termes. */
export const coefOf = (terms, p) => terms.filter((t) => t.p === p).reduce((a, t) => a + t.c, 0);
/**
 * Les coefficients écrits par la main (`typed`: { p: c }) donnent-ils l'expansion réduite ? Au premier x, les deux valeurs :
 * `counted` (le vrai résultat, `target` valeur à x) et `written` (celle des coefficients écrits). Refus par puissance : `wrong`.
 */
export function coefJudge(terms, typed, x, target) {
  const powers = usedPowers(terms);
  const wrong = powers.filter((p) => typed[p] !== coefOf(terms, p));
  const written = powers.reduce((a, p) => a + (typed[p] ?? 0) * pow(x, p), 0);
  return { ok: wrong.length === 0, wrong, counted: target, written };
}

/* ═════════════ Les flèches ═════════════ */

/** Une expression de produits : { products: [{ sign: ±1, f1: [termes], f2: [termes] }] }. */
export const product = (sign, f1, f2) => ({ sign: sign < 0 ? -1 : 1, f1, f2 });
export const exprValue = (expr, x) => expr.products.reduce((a, pr) => a + pr.sign * evaluate(pr.f1, x) * evaluate(pr.f2, x), 0);
/** L'expression écrite en LaTeX : « 5(x + 2) », « (2x + 1)(x - 3) », « 3(2 - x) - 4(x - 1) ». */
export function exprTex(expr) {
  return expr.products.map((pr, k) => {
    const f1 = pr.f1.length > 1 || (k > 0 && pr.f1[0].c < 0) ? `(${termsTex(pr.f1)})` : termsTex(pr.f1);
    const body = `${f1}(${termsTex(pr.f2)})`;
    if (k === 0) return pr.sign < 0 ? `-${body}` : body;
    return `${pr.sign < 0 ? '-' : '+'} ${body}`;
  }).join(' ');
}
/**
 * Toutes les flèches (une par couple terme du 1er facteur × terme du 2e, produit par produit) : { id, k, i, j, oi, tj, term, mag }.
 * `oi`/`tj` : le rang de l'origine / de la cible sur toute la ligne écrite (tous produits confondus) ; `term` : le produit partiel
 * AVEC le signe du produit ; `mag` : sa valeur absolue ({ c ≥ 0, p }).
 */
export function arrowsOf(expr) {
  const out = [];
  let oBase = 0; let tBase = 0;
  expr.products.forEach((pr, k) => {
    pr.f1.forEach((a, i) => pr.f2.forEach((b, j) => {
      const m = mulTerms(a, b);
      const term = { c: pr.sign * m.c, p: m.p };
      out.push({ id: `${oBase + i}>${tBase + j}`, k, i, j, oi: oBase + i, tj: tBase + j, term, mag: { c: Math.abs(m.c), p: m.p }, a, b });
    }));
    oBase += pr.f1.length; tBase += pr.f2.length;
  });
  return out;
}
export const arrowSign = (a) => Math.sign(a.term.c);
export const arrowValue = (a, x) => a.term.c * pow(x, a.term.p);
/** Le signe `chosen` du produit partiel est-il juste ? La valeur à x du produit des deux termes (et du signe du produit) : `truth` ; `shown` : celle de la carte. */
export function arrowJudge(a, chosen, x) {
  const truth = arrowValue(a, x);
  const shown = (chosen >= 0 ? 1 : -1) * Math.abs(truth);
  return { ok: truth === shown, truth, shown };
}
export const arrowTerms = (expr) => arrowsOf(expr).map((a) => ({ ...a.term }));
export const expandedTex = (expr) => termsTex(arrowTerms(expr));
export const reducedExprTerms = (expr) => reduce(arrowTerms(expr));
export const reducedExprTex = (expr) => termsTex(reducedExprTerms(expr));
/** Le nombre de flèches que l'expression demande. */
export const arrowCount = (expr) => expr.products.reduce((a, pr) => a + pr.f1.length * pr.f2.length, 0);

/** Un terme en LaTeX (réexport commode pour les vues). */
export { termTex, termsTex };
