import { formatDec, parseDec, roundTo, texDec } from '@smarter-academy/core';

export { formatDec, parseDec, roundTo };

/**
 * equationUtils — la logique pure de la leçon « Équations produit nul ».
 *
 * MODÈLE (une seule source de vérité, playbook §4) :
 *  - une forme linéaire est `{ a, b }` = a·x + b (forme partagée avec
 *    calcul-litteral / resolution-problemes-3e) ;
 *  - un côté de balance est une forme linéaire OU un « paquet »
 *    `{ k, inner: {a, b} }` = k × (a·x + b), qui ne se manipule qu'une
 *    fois développé ;
 *  - une équation est `{ left, right }` ;
 *  - une équation produit est le couple `(f1, f2)` de deux formes linéaires.
 *
 * Toutes les valeurs affichées (produit, zéros, penchement de la balance)
 * sont DÉRIVÉES de ces objets — jamais recopiées à la main dans un module.
 */

export const lin = (a, b) => ({ a, b });
export const isPack = (side) => side != null && typeof side.k === 'number' && side.inner != null;

export const evalLin = (f, x) => roundTo(f.a * x + f.b);
export const addLin = (f, g) => lin(roundTo(f.a + g.a), roundTo(f.b + g.b));
export const subLin = (f, g) => lin(roundTo(f.a - g.a), roundTo(f.b - g.b));
export const scaleLin = (f, k) => lin(roundTo(f.a * k), roundTo(f.b * k));
export const expandPack = (p) => scaleLin(p.inner, p.k);
export const asLin = (side) => (isPack(side) ? expandPack(side) : side);

/**
 * Résout left = right (formes linéaires ou paquets).
 * → { kind: 'unique', x } | { kind: 'none' } | { kind: 'all' }
 */
export function solveLinear({ left, right }) {
  const d = subLin(asLin(left), asLin(right)); // d.a·x + d.b = 0
  if (d.a !== 0) return { kind: 'unique', x: roundTo(-d.b / d.a) };
  return d.b === 0 ? { kind: 'all' } : { kind: 'none' };
}

/** Deux équations sont équivalentes si elles ont exactement les mêmes solutions. */
export function isEquivalentEquation(e1, e2) {
  const s1 = solveLinear(e1);
  const s2 = solveLinear(e2);
  if (s1.kind !== s2.kind) return false;
  return s1.kind === 'unique' ? s1.x === s2.x : true;
}

/** Vrai si `x` rend l'égalité vraie (au sens numérique). */
export function isSolution(eq, x) {
  return evalLin(asLin(eq.left), x) === evalLin(asLin(eq.right), x);
}

/** Les zéros du produit f1 × f2, triés, sans doublon (facteurs constants ignorés). */
export function productZeros(f1, f2) {
  const zs = [f1, f2]
    .filter((f) => f.a !== 0)
    .map((f) => roundTo(-f.b / f.a));
  return [...new Set(zs)].sort((p, q) => p - q);
}

export const evalProduct = (f1, f2, x) => roundTo(evalLin(f1, x) * evalLin(f2, x));

/**
 * Une transformation de balance. `op` :
 *  - { type: 'add',    n }  ajoute n unités (n < 0 : retire)
 *  - { type: 'addx',   k }  ajoute k jetons x (k < 0 : retire)
 *  - { type: 'div',    n }  partage en n groupes (n ≠ 0)
 *  - { type: 'expand' }     développe le(s) paquet(s)
 * `scope` : 'both' (défaut) | 'left' | 'right'. Une portée non symétrique
 * est PERMISE — c'est la balance qui montrera qu'elle penche (§12, l'erreur
 * comme manipulation).
 */
export function balanceStep(eq, op, scope = 'both') {
  const applyTo = (side) => {
    if (op.type === 'expand') return isPack(side) ? expandPack(side) : side;
    if (isPack(side)) return side; // un paquet ne se manipule qu'une fois développé
    switch (op.type) {
      case 'add':
        return lin(side.a, roundTo(side.b + op.n));
      case 'addx':
        return lin(roundTo(side.a + op.k), side.b);
      case 'div':
        if (!op.n) return side;
        return lin(roundTo(side.a / op.n), roundTo(side.b / op.n));
      default:
        return side;
    }
  };
  return {
    left: scope === 'right' ? eq.left : applyTo(eq.left),
    right: scope === 'left' ? eq.right : applyTo(eq.right),
  };
}

/**
 * Penchement de la balance : l'équation de départ a une solution x*, la
 * balance est à l'équilibre tant que les deux plateaux pèsent pareil POUR
 * CE x*. Retourne −1 (gauche plus lourd), 0 (équilibre), +1 (droite plus lourd).
 */
export function balanceTilt(eq, xStar) {
  const l = evalLin(asLin(eq.left), xStar);
  const r = evalLin(asLin(eq.right), xStar);
  if (l === r) return 0;
  return l > r ? -1 : 1;
}

/** Vrai quand l'équation est sous la forme x = c (ou c = x). */
export function isIsolated(eq) {
  const L = asLin(eq.left);
  const R = asLin(eq.right);
  const lx = L.a === 1 && L.b === 0 && R.a === 0;
  const rx = R.a === 1 && R.b === 0 && L.a === 0;
  return lx || rx;
}

/* ── Formatage LaTeX ──────────────────────────────────────────────── */

function texCoef(a, { leading }) {
  // a·x : 1x → x, −1x → −x ; « + » explicite quand ce n'est pas le premier terme
  const abs = Math.abs(a);
  const sign = a < 0 ? '-' : leading ? '' : '+';
  const body = abs === 1 ? 'x' : `${texDec(abs)}x`;
  return `${sign}${body}`;
}

/** a·x + b en LaTeX : 2x + 4, x − 3, −x, 0, 6… */
export function formatLin(f) {
  const parts = [];
  if (f.a !== 0) parts.push(texCoef(f.a, { leading: true }));
  if (f.b !== 0 || parts.length === 0) {
    if (parts.length === 0) parts.push(texDec(f.b));
    else parts.push(`${f.b < 0 ? '-' : '+'}${texDec(Math.abs(f.b))}`);
  }
  return parts.join(' ');
}

/** Un côté de balance (forme ou paquet) en LaTeX : 3(x + 2). */
export function formatSide(side) {
  if (!isPack(side)) return formatLin(side);
  return `${texDec(side.k)}(${formatLin(side.inner)})`;
}

/** Une équation complète en LaTeX. */
export function formatEquation(eq) {
  return `${formatSide(eq.left)} = ${formatSide(eq.right)}`;
}

/** Un facteur entre parenthèses (ou nu s'il est réduit à x / à un nombre). */
export function formatFactor(f) {
  const s = formatLin(f);
  const bare = (f.a === 1 && f.b === 0) || f.a === 0;
  return bare ? s : `(${s})`;
}

/** (x − 3)(2x + 4) en LaTeX. */
export function formatProduct(f1, f2) {
  return `${formatFactor(f1)}${formatFactor(f2)}`;
}

/** { −2 ; 3 } en LaTeX. */
export function formatSolutionSet(xs) {
  if (xs.length === 0) return '\\emptyset';
  return `\\{\\,${xs.map((x) => texDec(x)).join('\\,;\\,')}\\,\\}`;
}

/** Une valeur substituée, pour la bande de vérification : « (3 − 3)(2 × 3 + 4) ». */
export function formatSubstituted(f, x) {
  const xs = x < 0 ? `(${texDec(x)})` : texDec(x);
  const parts = [];
  if (f.a !== 0) parts.push(f.a === 1 ? xs : `${texDec(f.a)} \\times ${xs}`);
  if (f.b !== 0) parts.push(`${f.b < 0 ? '-' : parts.length ? '+' : ''} ${texDec(Math.abs(f.b))}`);
  if (parts.length === 0) return '0';
  return parts.join(' ');
}
