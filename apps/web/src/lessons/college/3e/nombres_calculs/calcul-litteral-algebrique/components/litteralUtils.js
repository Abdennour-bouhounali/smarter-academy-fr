import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * litteralUtils — le modèle mathématique de « Calcul littéral et algébrique »
 * (3e). Aucune logique de rendu ici : un état, des transformations pures,
 * des formats dérivés.
 *
 * État : une expression est un tableau de termes `Term = { coef, deg }`
 * (deg 0 = constante, 1 = x, 2 = x²), NON réduit et dans l'ordre d'écriture
 * — les cartes et les morceaux gardent ainsi leur identité. Un produit est
 * `{ a: Term[], b: Term[] }`.
 *
 * Invariants testés (litteralUtils.test.js) :
 *  - evaluate(reduce(t), x) === evaluate(t, x) pour tout x ;
 *  - evaluate(expandProduct(p), x) === evaluate(p.a, x) × evaluate(p.b, x) ;
 *  - reduce(expandProduct({ a: [factor], b: rest })) ≡ reduce(terms) après factorOut.
 *
 * Les « monômes » généraux (`{ coef, symLatex, symPlain, likeKey }`) servent
 * au carré (a + b)² dont les côtés ne sont pas des termes en x — même
 * formateur, même règle de regroupement (« likeKey » égal = termes
 * semblables).
 */

export const term = (coef, deg = 0) => ({ coef, deg });

const DEG_LATEX = ['', 'x', 'x^{2}', 'x^{3}'];
const DEG_PLAIN = ['', 'x', 'x²', 'x³'];

/* ── Réduction / évaluation ───────────────────────────────────────── */

/** Termes regroupés par degré, degré décroissant, coefficients nuls retirés. */
export function reduce(terms) {
  const byDeg = new Map();
  for (const t of terms) byDeg.set(t.deg, (byDeg.get(t.deg) || 0) + t.coef);
  return [...byDeg.entries()]
    .filter(([, coef]) => coef !== 0)
    .sort((p, q) => q[0] - p[0])
    .map(([deg, coef]) => ({ coef, deg }));
}

export function evaluate(terms, x) {
  return terms.reduce((sum, t) => sum + t.coef * x ** t.deg, 0);
}

/** Deux termes sont semblables ssi ils ont le même degré (même forme de tuile). */
export const areLike = (t1, t2) => t1.deg === t2.deg;

/** Vrai quand aucun regroupement n'est possible et qu'aucun terme n'est nul. */
export function isReduced(terms) {
  if (terms.length === 0) return true;
  const degs = new Set(terms.map((t) => t.deg));
  return degs.size === terms.length && terms.every((t) => t.coef !== 0);
}

/**
 * Regroupe les termes i et j s'ils sont semblables ; le terme fusionné prend
 * la place du premier. Retourne null pour des termes non semblables — c'est
 * le REFUS que l'interface rend visible (tuiles de formes différentes).
 */
export function mergeTerms(terms, i, j) {
  if (i === j || !terms[i] || !terms[j] || !areLike(terms[i], terms[j])) return null;
  const [lo, hi] = i < j ? [i, j] : [j, i];
  const merged = { coef: terms[i].coef + terms[j].coef, deg: terms[i].deg };
  const out = terms.filter((_, k) => k !== lo && k !== hi);
  out.splice(lo, 0, merged);
  return out;
}

export function termsEqual(t1, t2) {
  return t1.length === t2.length && t1.every((t, k) => t.coef === t2[k].coef && t.deg === t2[k].deg);
}

/** Même expression ssi mêmes termes après réduction. */
export function sameExpression(t1, t2) {
  return termsEqual(reduce(t1), reduce(t2));
}

/* ── Produits ─────────────────────────────────────────────────────── */

/** Les morceaux a_i × b_j dans l'ordre de la grille (ligne i, colonne j). */
export function expandProduct({ a, b }) {
  const out = [];
  for (const ta of a) for (const tb of b) out.push({ coef: ta.coef * tb.coef, deg: ta.deg + tb.deg });
  return out;
}

/** Les mêmes morceaux, avec leur position et leur étiquette. */
export function areaPieces({ a, b }) {
  const pieces = [];
  a.forEach((ta, row) => {
    b.forEach((tb, col) => {
      const t = { coef: ta.coef * tb.coef, deg: ta.deg + tb.deg };
      pieces.push({
        id: `r${row}c${col}`,
        row,
        col,
        term: t,
        labelLatex: formatTerms([t], { latex: true }),
        labelPlain: formatTerms([t]),
      });
    });
  });
  return pieces;
}

/* ── Factorisation ────────────────────────────────────────────────── */

const gcd = (p, q) => (q === 0 ? Math.abs(p) : gcd(q, p % q));

/**
 * Facteur commun : pgcd des coefficients, degré minimal ; le signe est celui
 * du terme de plus haut degré pour que le reste commence par un positif.
 */
export function commonFactor(terms) {
  const r = reduce(terms);
  if (r.length === 0) return { coef: 1, deg: 0 };
  const g = r.reduce((acc, t) => gcd(acc, Math.abs(t.coef)), 0);
  const deg = Math.min(...r.map((t) => t.deg));
  const sign = r[0].coef < 0 ? -1 : 1;
  return { coef: sign * g, deg };
}

export function factorOut(terms) {
  const factor = commonFactor(terms);
  const rest = reduce(terms).map((t) => ({ coef: t.coef / factor.coef, deg: t.deg - factor.deg }));
  return { factor, rest };
}

const intSqrt = (n) => {
  if (!Number.isInteger(n) || n < 0) return null;
  const s = Math.round(Math.sqrt(n));
  return s * s === n ? s : null;
};

/** x² + 6x + 9 → { a: x, b: 3, sign: +1 } ; x² − 6x + 9 → sign −1 ; sinon null. */
export function matchSquare(terms) {
  const r = reduce(terms);
  if (r.length !== 3 || r[0].deg !== 2 || r[1].deg !== 1 || r[2].deg !== 0) return null;
  const p = intSqrt(r[0].coef);
  const q = intSqrt(r[2].coef);
  if (p == null || q == null || p === 0 || q === 0) return null;
  if (r[1].coef === 2 * p * q) return { a: term(p, 1), b: term(q, 0), sign: 1 };
  if (r[1].coef === -2 * p * q) return { a: term(p, 1), b: term(q, 0), sign: -1 };
  return null;
}

/** x² − 25 → { a: x, b: 5 } ; sinon null. */
export function matchDiffSquares(terms) {
  const r = reduce(terms);
  if (r.length !== 2 || r[0].deg !== 2 || r[1].deg !== 0) return null;
  const p = intSqrt(r[0].coef);
  const q = intSqrt(-r[1].coef);
  if (p == null || q == null || p === 0 || q === 0) return null;
  return { a: term(p, 1), b: term(q, 0) };
}

/* ── Tableau de valeurs ───────────────────────────────────────────── */

export function testTable(exprs, xs) {
  return xs.map((x) => {
    const values = exprs.map((e) => roundTo(evaluate(e, x), 6));
    return { x, values, allEqual: values.every((v) => v === values[0]) };
  });
}

/** Nombre de dalles de bordure autour d'un jardin carré de côté n. */
export const evaluateBorder = (n) => 4 * n + 4;

/* ── Formats ──────────────────────────────────────────────────────── */

const fmtNum = (n, latex) => {
  const s = formatDec(n);
  return latex ? s.replace(',', '{,}') : s;
};

/**
 * Monômes génériques : `{ coef, deg }` (en x) ou `{ coef, symLatex, symPlain }`
 * (symbolique, ex. ab). Signes, 1x → x, −1x → −x, 0 retiré, x^{2} en LaTeX.
 */
export function formatMonomials(items, { latex = false } = {}) {
  const parts = [];
  for (const it of items) {
    if (it.coef === 0) continue;
    const sym = latex
      ? (it.symLatex ?? DEG_LATEX[it.deg ?? 0])
      : (it.symPlain ?? DEG_PLAIN[it.deg ?? 0]);
    const abs = Math.abs(it.coef);
    const body = sym ? (abs === 1 ? sym : `${fmtNum(abs, latex)}${sym}`) : fmtNum(abs, latex);
    const neg = it.coef < 0;
    if (parts.length === 0) parts.push(`${neg ? (latex ? '-' : '−') : ''}${body}`);
    else parts.push(latex ? `${neg ? '-' : '+'}${body}` : `${neg ? ' − ' : ' + '}${body}`);
  }
  return parts.length ? parts.join('') : '0';
}

export function formatTerms(terms, opts) {
  return formatMonomials(terms, opts);
}

/** 3(x + 2), (x + 3)(x + 2), 3 × x. */
export function formatProduct({ a, b }, { latex = false } = {}) {
  const single = (side) => side.length === 1 && side[0].coef >= 0;
  const wrap = (side) => (single(side) ? formatTerms(side, { latex }) : `(${formatTerms(side, { latex })})`);
  if (single(a) && single(b)) return `${wrap(a)}${latex ? '\\times ' : ' × '}${wrap(b)}`;
  return `${wrap(a)}${wrap(b)}`;
}

/** Parseur minimal (tests et données) : « 3x² − 5x + 2 », « x^2+6x+9 », « -x-4 ». */
export function parseTerms(str) {
  const s = str
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\^\{(\d)\}/g, '^$1');
  const re = /([+-]?)(\d+(?:[.,]\d+)?)?(x(?:\^(\d))?)?/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m[0] === '') {
      if (re.lastIndex >= s.length) break;
      re.lastIndex += 1;
      continue;
    }
    const [, sign, num, xpart, pow] = m;
    if (!num && !xpart) continue;
    const coef = (sign === '-' ? -1 : 1) * (num ? parseDec(num) : 1);
    const deg = xpart ? (pow ? Number(pow) : 1) : 0;
    out.push({ coef, deg });
  }
  return out;
}

/* ── Géométrie du rectangle d'aire (AlgebraRect) ─────────────────── */

/**
 * Un côté est découpé en segments ; chaque terme de degré 1 mesure xUnit
 * unités (x est DESSINÉ à 3 unités, jamais annoncé — les côtés sont
 * étiquetés avec des symboles, pas des graduations). Un terme négatif
 * garde sa longueur absolue et est marqué `neg` (rendu hachuré).
 */
export function buildRectLayout({ a, b }, { xUnit = 3 } = {}) {
  const seg = (side, t, i) => ({
    id: `${side}${i}`,
    term: t,
    latex: formatTerms([t], { latex: true }),
    plain: formatTerms([t]),
    len: Math.abs(t.coef) * (t.deg === 1 ? xUnit : 1),
    neg: t.coef < 0,
  });
  const sideA = a.map((t, i) => seg('a', t, i));
  const sideB = b.map((t, i) => seg('b', t, i));
  const pieces = areaPieces({ a, b }).map((p) => ({
    id: p.id,
    row: p.row,
    col: p.col,
    coef: p.term.coef,
    deg: p.term.deg,
    likeKey: String(p.term.deg),
    symLatex: DEG_LATEX[p.term.deg],
    symPlain: DEG_PLAIN[p.term.deg],
    latex: p.labelLatex,
    plain: p.labelPlain,
    w: sideB[p.col].len,
    h: sideA[p.row].len,
    neg: p.term.coef < 0,
  }));
  return {
    sideA,
    sideB,
    sideALatex: formatTerms(a, { latex: true }),
    sideBLatex: formatTerms(b, { latex: true }),
    sideAPlain: formatTerms(a),
    sideBPlain: formatTerms(b),
    pieces,
    width: sideB.reduce((s, x) => s + x.len, 0),
    height: sideA.reduce((s, x) => s + x.len, 0),
  };
}

/** Le carré de côté a + b : quatre morceaux symboliques a², ab, ab, b². */
export function buildSquareLayout({ aLen = 3, bLen = 2 } = {}) {
  const segs = (side) => [
    { id: `${side}0`, latex: 'a', plain: 'a', len: aLen, neg: false },
    { id: `${side}1`, latex: 'b', plain: 'b', len: bLen, neg: false },
  ];
  const sideA = segs('a');
  const sideB = segs('b');
  const SYM = [
    ['a^{2}', 'a²', 'a2'],
    ['ab', 'ab', 'ab'],
  ];
  const pieces = [];
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      const [symLatex, symPlain, likeKey] =
        row === 0 && col === 0 ? SYM[0] : row === 1 && col === 1 ? ['b^{2}', 'b²', 'b2'] : SYM[1];
      pieces.push({
        id: `r${row}c${col}`,
        row,
        col,
        coef: 1,
        likeKey,
        symLatex,
        symPlain,
        latex: symLatex,
        plain: symPlain,
        w: sideB[col].len,
        h: sideA[row].len,
        neg: false,
      });
    }
  }
  return {
    sideA,
    sideB,
    sideALatex: 'a+b',
    sideBLatex: 'a+b',
    sideAPlain: 'a + b',
    sideBPlain: 'a + b',
    pieces,
    width: aLen + bLen,
    height: aLen + bLen,
  };
}

/**
 * La bande « somme » sous le rectangle : les morceaux comptés dans l'ordre
 * du comptage ; une fois `merged`, les semblables sont regroupés.
 */
export function sumStrip(pieces, countedIds, merged, { latex = true } = {}) {
  const counted = [...countedIds].map((id) => pieces.find((p) => p.id === id)).filter(Boolean);
  if (!merged) return formatMonomials(counted, { latex });
  const grouped = [];
  for (const p of counted) {
    const g = grouped.find((q) => q.likeKey === p.likeKey);
    if (g) g.coef += p.coef;
    else grouped.push({ ...p });
  }
  return formatMonomials(grouped, { latex });
}

/** Les paires de morceaux semblables (regroupables) parmi les comptés. */
export function likePairs(pieces, countedIds) {
  const counted = [...countedIds].map((id) => pieces.find((p) => p.id === id)).filter(Boolean);
  const pairs = [];
  for (let i = 0; i < counted.length; i += 1) {
    for (let j = i + 1; j < counted.length; j += 1) {
      if (counted[i].likeKey === counted[j].likeKey) pairs.push([counted[i].id, counted[j].id]);
    }
  }
  return pairs;
}

/* ── Tuiles (TileBar) ────────────────────────────────────────────── */

/** Décompose une expression en tuiles : { kind: 'x2' | 'x' | 'unit', neg, count }. */
export function tilesOf(terms) {
  const KIND = ['unit', 'x', 'x2'];
  return reduce(terms)
    .filter((t) => t.deg <= 2)
    .map((t) => ({ kind: KIND[t.deg], neg: t.coef < 0, count: Math.abs(t.coef) }));
}

/* ── Facteurs atomiques (TermCards, mode facteur commun) ─────────── */

const primeFactors = (n) => {
  const out = [];
  let m = Math.abs(n);
  for (let p = 2; p * p <= m; p += 1) while (m % p === 0) { out.push(p); m /= p; }
  if (m > 1) out.push(m);
  return out;
};

/** 6x → ['2', '3', 'x'] ; 9 → ['3', '3'] ; x² → ['x', 'x'] ; −6x → ['−1', '2', '3', 'x']. */
export function atomicFactors(t) {
  const out = [];
  if (t.coef < 0) out.push('−1');
  const abs = Math.abs(t.coef);
  if (abs === 1 && t.deg === 0) out.push('1');
  else if (abs !== 1) out.push(...primeFactors(abs).map(String));
  for (let k = 0; k < t.deg; k += 1) out.push('x');
  return out;
}
