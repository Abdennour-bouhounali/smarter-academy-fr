/**
 * exprCore — l'algèbre littérale du cycle 4, en nombres purs.
 *
 * SOURCE UNIQUE DE VÉRITÉ MATHÉMATIQUE (CLAUDE.md §8) pour les deux leçons
 * de 4e qui manipulent des expressions : « Calcul littéral » et « Équations
 * du premier degré ». Les tuiles algébriques, la balance, les tableaux et
 * les écritures LaTeX en DÉRIVENT tous — aucune vue ne tient son propre
 * état mathématique.
 *
 * LE MODÈLE. Une expression du premier degré à une inconnue est le couple
 * de rationnels `{ x, k }` signifiant x·(inconnue) + k. C'est exactement ce
 * que le programme de 4e demande de manipuler : réduire, développer,
 * factoriser, tester, résoudre ax + b = c. Rien de plus — pas de degré 2,
 * pas de seconde inconnue (hors périmètre du niveau).
 *
 * Représenter les coefficients en rationnels `{n, d}` plutôt qu'en nombres
 * flottants n'est pas du zèle : une équation comme 3x + 1 = 2 a pour
 * solution 1/3, et l'afficher « 0,333333 » serait une faute mathématique
 * autant qu'un piège d'affichage. Le noyau reste donc exact de bout en bout
 * et ne convertit en décimal qu'au moment d'afficher, si on le lui demande.
 *
 * TYPOGRAPHIE : les fonctions `tex*` produisent du LaTeX destiné à
 * <MathText>, avec le moins typographique U+2212 et la virgule décimale
 * française. Une leçon ne recompose jamais « ax + b » à la main.
 */

/* ────────────────────────────────────────────────────────────────────────
   Rationnels exacts
   ──────────────────────────────────────────────────────────────────── */

const gcd = (a, b) => {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
};

/**
 * Construit le rationnel n/d sous forme irréductible, signe porté par le
 * numérateur. `d` vaut 1 par défaut, si bien que `rat(5)` est l'entier 5.
 */
export function rat(n, d = 1) {
  if (d === 0) throw new Error('rat: dénominateur nul');
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new Error(`rat: numérateur et dénominateur entiers attendus (reçu ${n}/${d})`);
  }
  const s = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return { n: (s * n) / g, d: (s * d) / g };
}

export const ratAdd = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const ratSub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const ratMul = (a, b) => rat(a.n * b.n, a.d * b.d);
export const ratDiv = (a, b) => {
  if (b.n === 0) throw new Error('ratDiv: division par zéro');
  return rat(a.n * b.d, a.d * b.n);
};
export const ratNeg = (a) => rat(-a.n, a.d);
export const ratEq = (a, b) => a.n * b.d === b.n * a.d;
export const ratIsZero = (a) => a.n === 0;
export const ratIsInt = (a) => a.d === 1;
export const ratToNumber = (a) => a.n / a.d;
export const ratSign = (a) => Math.sign(a.n);
export const ratAbs = (a) => rat(Math.abs(a.n), a.d);

/** Le rationnel est-il un décimal fini ? (dénominateur de la forme 2^i·5^j) */
export function ratIsDecimal(a) {
  let d = a.d;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

/* ────────────────────────────────────────────────────────────────────────
   Expressions du premier degré : x·inconnue + k
   ──────────────────────────────────────────────────────────────────── */

/** Construit l'expression x·(inconnue) + k à partir de nombres ou de rationnels. */
export function expr(x = 0, k = 0) {
  const toRat = (v) => (typeof v === 'number' ? rat(v) : v);
  return { x: toRat(x), k: toRat(k) };
}

export const exprAdd = (a, b) => ({ x: ratAdd(a.x, b.x), k: ratAdd(a.k, b.k) });
export const exprSub = (a, b) => ({ x: ratSub(a.x, b.x), k: ratSub(a.k, b.k) });
export const exprNeg = (a) => ({ x: ratNeg(a.x), k: ratNeg(a.k) });
export const exprScale = (a, c) => {
  const r = typeof c === 'number' ? rat(c) : c;
  return { x: ratMul(a.x, r), k: ratMul(a.k, r) };
};
export const exprEq = (a, b) => ratEq(a.x, b.x) && ratEq(a.k, b.k);

/** Évalue l'expression pour une valeur de l'inconnue (nombre ou rationnel). */
export function exprEval(e, value) {
  const v = typeof value === 'number' ? rat(value) : value;
  return ratAdd(ratMul(e.x, v), e.k);
}

/* ────────────────────────────────────────────────────────────────────────
   Termes — le modèle que les tuiles rendent visible
   ──────────────────────────────────────────────────────────────────── */

/**
 * Une expression NON RÉDUITE, telle que l'élève la lit avant de la
 * transformer : une liste ordonnée de termes, chacun `{ coef, isX }`.
 *
 * C'est l'objet que manipule TileBoard : réduire, c'est regrouper les
 * termes semblables de cette liste — le geste et le calcul sont le même
 * fait, décrit une seule fois.
 */
export function term(coef, isX = false) {
  return { coef: typeof coef === 'number' ? rat(coef) : coef, isX };
}

/** Somme des termes : la forme réduite `{x, k}` de la liste. */
export function reduceTerms(terms) {
  return terms.reduce(
    (acc, t) => (t.isX ? { ...acc, x: ratAdd(acc.x, t.coef) } : { ...acc, k: ratAdd(acc.k, t.coef) }),
    expr(0, 0)
  );
}

/** Les termes semblables du terme d'indice `i` : mêmes indices, `i` compris. */
export function likeTermIndices(terms, i) {
  const ref = terms[i];
  if (!ref) return [];
  return terms.map((t, j) => (t.isX === ref.isX ? j : -1)).filter((j) => j >= 0);
}

/**
 * Regroupe TOUS les termes semblables de l'indice `i` en un seul, laissé à
 * la position du premier d'entre eux. C'est l'opération que la tuile
 * exécute quand l'élève fusionne une pile.
 *
 * Renvoie une NOUVELLE liste — jamais de mutation, pour qu'un rendu React
 * concurrent ne puisse pas observer un état intermédiaire (CLAUDE.md §40).
 */
export function collectLikeTerms(terms, i) {
  const idx = likeTermIndices(terms, i);
  if (idx.length <= 1) return terms.slice();
  const ref = terms[i];
  const total = idx.reduce((acc, j) => ratAdd(acc, terms[j].coef), rat(0));
  const first = idx[0];
  return terms
    .map((t, j) => (j === first ? term(total, ref.isX) : t))
    .filter((_, j) => j === first || !idx.includes(j));
}

/** L'expression est-elle réduite ? (au plus un terme en x, au plus un constant) */
export function isReduced(terms) {
  return terms.filter((t) => t.isX).length <= 1 && terms.filter((t) => !t.isX).length <= 1;
}

/* ────────────────────────────────────────────────────────────────────────
   Distributivité — développer et factoriser
   ──────────────────────────────────────────────────────────────────── */

/**
 * Distributivité simple : c·(a·x + b) → les deux termes du développement,
 * DANS L'ORDRE où on les écrit au tableau. La liste (et non la forme
 * réduite) est le résultat, parce que c'est précisément l'étape
 * intermédiaire que l'élève doit voir apparaître.
 */
export function expandSimple(c, inner) {
  const f = typeof c === 'number' ? rat(c) : c;
  return [term(ratMul(f, inner.x), true), term(ratMul(f, inner.k), false)];
}

/**
 * Double distributivité : (a·x + b)(c·x + d) → les QUATRE produits, dans
 * l'ordre canonique ac, ad, bc, bd.
 *
 * Le premier produit est de degré 2 : hors programme de 4e comme objet
 * d'étude, mais il apparaît nécessairement au tableau. On le renvoie donc
 * décrit (`deg: 2`) plutôt que de le taire — c'est à la leçon de choisir
 * des facteurs qui le laissent maniable, et le périmètre exécutable de la
 * leçon vérifie qu'elle le fait.
 */
export function expandDouble(left, right) {
  return [
    { coef: ratMul(left.x, right.x), deg: 2 },
    { coef: ratMul(left.x, right.k), deg: 1 },
    { coef: ratMul(left.k, right.x), deg: 1 },
    { coef: ratMul(left.k, right.k), deg: 0 },
  ];
}

/** Réduit la sortie de `expandDouble` en {x2, x, k}. */
export function reduceDouble(products) {
  return products.reduce(
    (acc, p) => {
      if (p.deg === 2) return { ...acc, x2: ratAdd(acc.x2, p.coef) };
      if (p.deg === 1) return { ...acc, x: ratAdd(acc.x, p.coef) };
      return { ...acc, k: ratAdd(acc.k, p.coef) };
    },
    { x2: rat(0), x: rat(0), k: rat(0) }
  );
}

/**
 * Le plus grand facteur commun ENTIER des deux termes d'une expression —
 * le facteur qu'on met en évidence. Renvoie 1 quand il n'y en a pas
 * d'évident, ce que le programme de 4e est le seul cas à demander.
 *
 * Le signe suit le premier terme : on factorise −6x − 9 par −3, pas par 3,
 * parce que c'est l'écriture attendue.
 */
export function commonFactor(e) {
  if (!ratIsInt(e.x) || !ratIsInt(e.k)) return rat(1);
  if (ratIsZero(e.x) || ratIsZero(e.k)) return rat(1);
  const g = gcd(e.x.n, e.k.n);
  return rat(ratSign(e.x) < 0 ? -g : g);
}

/** Factorise a·x + b en f·(a/f·x + b/f) — renvoie `{factor, inner}`. */
export function factorise(e) {
  const f = commonFactor(e);
  return { factor: f, inner: { x: ratDiv(e.x, f), k: ratDiv(e.k, f) } };
}

/* ────────────────────────────────────────────────────────────────────────
   Équations du premier degré
   ──────────────────────────────────────────────────────────────────── */

/**
 * Une équation est le couple des DEUX MEMBRES — jamais une forme normale
 * cachée. La balance montre littéralement cet objet ; garder les deux
 * membres permet de représenter fidèlement une étape intermédiaire comme
 * « 2x + 3 = x + 8 », qu'une forme normale aurait déjà écrasée.
 */
export function equation(left, right) {
  return { left, right };
}

/** Applique la même opération aux deux membres — la seule chose que la balance autorise. */
export const eqAddBoth = (eq, e) => equation(exprAdd(eq.left, e), exprAdd(eq.right, e));
export const eqSubBoth = (eq, e) => equation(exprSub(eq.left, e), exprSub(eq.right, e));
export const eqScaleBoth = (eq, c) => {
  const f = typeof c === 'number' ? rat(c) : c;
  if (ratIsZero(f)) throw new Error('eqScaleBoth: multiplier par 0 détruit l’équation');
  return equation(exprScale(eq.left, f), exprScale(eq.right, f));
};

/** Une valeur est-elle solution ? (les deux membres prennent la même valeur) */
export function isSolution(eq, value) {
  return ratEq(exprEval(eq.left, value), exprEval(eq.right, value));
}

/**
 * Résout l'équation.
 *   { kind: 'unique', value }   une solution
 *   { kind: 'none' }            aucune (0·x = k, k ≠ 0)
 *   { kind: 'all' }             toute valeur convient (0·x = 0)
 *
 * Les trois cas sont renvoyés explicitement : « pas de solution » et
 * « toutes » ne sont pas des erreurs, ce sont des réponses — et une
 * manipulation où l'élève peut atteindre ces états doit pouvoir les nommer.
 */
export function solve(eq) {
  const a = ratSub(eq.left.x, eq.right.x);
  const b = ratSub(eq.right.k, eq.left.k);
  if (ratIsZero(a)) return ratIsZero(b) ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'unique', value: ratDiv(b, a) };
}

/**
 * L'équation est-elle RÉSOLUE au sens de l'élève : « x = valeur » ?
 * (membre de gauche exactement x, membre de droite constant)
 */
export function isSolvedForm(eq) {
  return (
    ratEq(eq.left.x, rat(1)) && ratIsZero(eq.left.k) && ratIsZero(eq.right.x)
  );
}
