/**
 * Polynômes à une lettre, à coefficients ENTIERS — le calcul exact de l'unité 3
 * « الحساب الحرفي » (نشر، تبسيط، تحليل).
 *
 * Un TERME est { c, p } : le coefficient entier c et la puissance p de la lettre
 * (0, 1, 2…) — « 3x² » = { c: 3, p: 2 }, « −5 » = { c: −5, p: 0 }. Un FACTEUR
 * (ce qu'on écrit entre parenthèses) est une liste de termes, dans l'ordre
 * où le manuel l'écrit : (3x − 1) = [{3,1}, {−1,0}]. Un POLYNÔME réduit est
 * une liste de termes de puissances distinctes, sans coefficient nul, par
 * puissance décroissante.
 *
 * Rien ici n'arrondit : les labs comparent des entiers, jamais des flottants.
 */

/** Un terme. */
export const term = (c, p = 0) => ({ c, p });

/** Deux termes sont SEMBLABLES (« حدان متشابهان ») s'ils ont la même puissance. */
export const areLike = (s, t) => s.p === t.p;

/** Le produit de deux termes : c·c', p + p'. */
export const mulTerms = (s, t) => ({ c: s.c * t.c, p: s.p + t.p });

/** Réduit une liste de termes : regroupe les semblables, retire les nuls, ordonne par puissance décroissante. */
export function reduce(terms) {
  const byPower = new Map();
  for (const t of terms) byPower.set(t.p, (byPower.get(t.p) ?? 0) + t.c);
  return [...byPower.entries()]
    .filter(([, c]) => c !== 0)
    .sort((a, b) => b[0] - a[0])
    .map(([p, c]) => ({ c, p }));
}

/**
 * Les PRODUITS PARTIELS de deux facteurs, cellule par cellule — la grille de
 * la double distributivité (a + b)(c + d) = ac + ad + bc + bd. `i` indexe le
 * premier facteur, `j` le second.
 */
export function partialProducts(f1, f2) {
  const cells = [];
  f1.forEach((s, i) => f2.forEach((t, j) => cells.push({ i, j, id: `${i}-${j}`, term: mulTerms(s, t) })));
  return cells;
}

/** Le produit réduit de plusieurs facteurs. */
export function expand(...factors) {
  let acc = [{ c: 1, p: 0 }];
  for (const f of factors) acc = reduce(acc.flatMap((s) => f.map((t) => mulTerms(s, t))));
  return acc;
}

/** Valeur exacte d'une liste de termes pour une valeur entière de la lettre. */
export function evaluate(terms, x) {
  return terms.reduce((sum, t) => sum + t.c * x ** t.p, 0);
}

/** Valeur d'un facteur (une somme de termes). */
export const evaluateFactor = evaluate;

/** Deux listes de termes sont-elles le même polynôme ? (comparées réduites, donc pour TOUTE valeur) */
export function samePolynomial(a, b) {
  const ra = reduce(a); const rb = reduce(b);
  return ra.length === rb.length && ra.every((t, k) => t.c === rb[k].c && t.p === rb[k].p);
}

/** Un terme en LaTeX : 3x^2, -x, 6, x. `sign` : 'lead' (premier terme) ou 'inner' (précédé d'un + / −). */
export function termTex(t, { letter = 'x', lead = true } = {}) {
  const abs = Math.abs(t.c);
  const body = t.p === 0 ? String(abs) : `${abs === 1 ? '' : abs}${letter}${t.p > 1 ? `^${t.p}` : ''}`;
  if (lead) return `${t.c < 0 ? '-' : ''}${body}`;
  return `${t.c < 0 ? '-' : '+'} ${body}`;
}

/** Une liste de termes en LaTeX, dans l'ordre donné : « 3x^2 + 5x - 2 ». Liste vide → « 0 ». */
export function termsTex(terms, { letter = 'x' } = {}) {
  if (!terms.length) return '0';
  return terms.map((t, k) => termTex(t, { letter, lead: k === 0 })).join(' ');
}

/** Un facteur entre parenthèses : « (3x - 1) » ; un facteur d'un seul terme reste nu : « 3 ». */
export function factorTex(f, { letter = 'x' } = {}) {
  return f.length === 1 ? termsTex(f, { letter }) : `(${termsTex(f, { letter })})`;
}

/** L'écriture d'un nombre entier en LaTeX, négatif entre parenthèses quand il suit une opération. */
export const numTex = (n, { paren = false } = {}) => (paren && n < 0 ? `(${n})` : String(n));

/** Plus grand commun diviseur de deux entiers (valeurs absolues). */
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Le plus grand FACTEUR COMMUN monôme d'une liste de termes :
 * { c: pgcd des coefficients, p: la plus petite puissance }. 6x² + 4x → 2x.
 */
export function commonMonomial(terms) {
  const r = terms.filter((t) => t.c !== 0);
  if (!r.length) return { c: 1, p: 0 };
  return { c: r.reduce((g, t) => gcd(g, t.c), 0), p: Math.min(...r.map((t) => t.p)) };
}

/** Divise chaque terme par un monôme qui les divise tous : (6x² + 4x) ÷ 2x = 3x + 2. */
export function divideByMonomial(terms, m) {
  return terms.map((t) => {
    if (t.c % m.c !== 0 || t.p < m.p) throw new Error('divideByMonomial: le monôme ne divise pas le terme');
    return { c: t.c / m.c, p: t.p - m.p };
  });
}
