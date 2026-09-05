import { formatDec, parseDec, roundTo } from '@smarter-academy/core';

/**
 * problemUtils — le modèle mathématique de « Résolution de problèmes » (3e).
 *
 * UNE SEULE STRUCTURE : la forme linéaire `Lin = { a, b }` qui représente
 * `a·x + b`. Tout en découle — une carte du Traducteur porte un Lin, un
 * membre d'équation est le repliement (foldCards) d'une suite de cartes,
 * une équation est `{ left: Lin, right: Lin }`, sa solution vient de
 * solveLinear, l'équivalence de deux équations est l'égalité de leurs
 * ensembles de solutions, le tableau d'essais évalue les deux membres.
 *
 * Aucun facteur magique : les problèmes (problemsData.js) ne stockent que
 * des Lin ; les prix, les âges, les périmètres sont des évaluations.
 */
export { formatDec, parseDec, roundTo };

/* ── Constructeurs et arithmétique sur Lin ────────────────────────── */
export const lin = (a = 0, b = 0) => ({ a, b });
export const addLin = (p, q) => lin(p.a + q.a, p.b + q.b);
export const subLin = (p, q) => lin(p.a - q.a, p.b - q.b);
export const scaleLin = (p, k) => lin(p.a * k, p.b * k);
export const evalLin = (l, x) => roundTo(l.a * x + l.b);
export const sameLin = (p, q) => roundTo(p.a) === roundTo(q.a) && roundTo(p.b) === roundTo(q.b);
export const isConstLin = (l) => l.a === 0;

/** Produit de deux Lin — défini seulement si l'un des deux est constant (on reste au premier degré). */
export function mulLin(p, q) {
  if (p.a === 0) return scaleLin(q, p.b);
  if (q.a === 0) return scaleLin(p, q.b);
  return null;
}

/* ── Repliement d'une suite de cartes en un Lin ───────────────────── */
/**
 * Une suite de jetons : `{ kind: 'term', value: Lin }` ou
 * `{ kind: 'op', op: '+' | '-' | '×' }`. Grammaire :
 *   produit  := term ('×' term)*
 *   somme    := produit (('+'|'-') produit)*
 * Retourne null si la suite est mal formée (deux opérateurs de suite,
 * opérateur en bout, produit de deux termes en x…).
 */
export function foldCards(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return null;
  let i = 0;
  const readProduct = () => {
    if (i >= tokens.length || tokens[i].kind !== 'term') return null;
    let acc = tokens[i].value;
    i += 1;
    while (i < tokens.length && tokens[i].kind === 'op' && tokens[i].op === '×') {
      i += 1;
      if (i >= tokens.length || tokens[i].kind !== 'term') return null;
      acc = mulLin(acc, tokens[i].value);
      if (!acc) return null;
      i += 1;
    }
    return acc;
  };
  let total = readProduct();
  if (!total) return null;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind !== 'op' || t.op === '×') return null;
    i += 1;
    const p = readProduct();
    if (!p) return null;
    total = t.op === '-' ? subLin(total, p) : addLin(total, p);
  }
  return total;
}

/* ── Équations ────────────────────────────────────────────────────── */
export const equation = (left, right) => ({ left, right });

/** a·x + b = c·x + d  →  (a − c)·x = d − b */
export function solveLinear({ left, right }) {
  const a = roundTo(left.a - right.a);
  const b = roundTo(left.b - right.b);
  if (a === 0) return b === 0 ? { kind: 'all' } : { kind: 'none' };
  return { kind: 'unique', x: roundTo(-b / a) };
}

/** Même ensemble de solutions (symétrique). */
export function isEquivalentEquation(eq1, eq2) {
  const s1 = solveLinear(eq1);
  const s2 = solveLinear(eq2);
  if (s1.kind !== s2.kind) return false;
  if (s1.kind === 'unique') return s1.x === s2.x;
  return true;
}

/** « x = 8 » : un membre est exactement x et l'autre une constante — c'est la solution, pas la traduction. */
export function isSolvedForm({ left, right }) {
  const unit = lin(1, 0);
  return (sameLin(left, unit) && right.a === 0) || (sameLin(right, unit) && left.a === 0);
}

/** Tableau d'essais : les deux membres évalués pour chaque x. `equal` ⇔ `diff === 0`. */
export function tryTable(eq, xs) {
  return xs.map((x) => {
    const left = evalLin(eq.left, x);
    const right = evalLin(eq.right, x);
    const diff = roundTo(left - right);
    return { x, left, right, diff, equal: diff === 0 };
  });
}

/** Coût d'un forfait : part fixe + part par unité. */
export const planCost = (fixed, perUnit, n) => roundTo(fixed + perUnit * n);

/* ── Interprétation dans le contexte ──────────────────────────────── */
/**
 * @param {number} x  la valeur trouvée
 * @param {{integer?:boolean, min?:number, max?:number, unit?:string, round?:'ceil'|'floor'}} constraints
 * @returns {{ok:boolean, kind:'exact'|'ceil'|'floor'|'reject', value:number|null, reason:string}}
 */
export function interpret(x, constraints = {}) {
  const { integer = false, min = -Infinity, max = Infinity, unit = '', round = 'ceil' } = constraints;
  const u = unit ? ` ${unit}` : '';
  if (x < min || x > max) {
    const bound = x < min ? `inférieur à ${formatDec(min)}` : `supérieur à ${formatDec(max)}`;
    return { ok: false, kind: 'reject', value: null, reason: `${formatDec(x)}${u} est ${bound} : impossible dans cette situation` };
  }
  if (!integer || Number.isInteger(x)) {
    return { ok: true, kind: 'exact', value: x, reason: `${formatDec(x)}${u}` };
  }
  if (round === 'floor') {
    const v = Math.floor(x);
    return { ok: true, kind: 'floor', value: v, reason: `au plus ${v}${u}` };
  }
  const v = Math.ceil(x);
  return { ok: true, kind: 'ceil', value: v, reason: `dès ${v}${u}` };
}

/* ── Problèmes : quantités réécrites selon le choix de l'inconnue ─── */
/**
 * Un problème porte `quantities: [{ id, label, lin: { [choiceId]: Lin } }]`.
 * Pour un choix valide, chaque quantité a une écriture ; pour un choix
 * invalide (ex. « la somme » comme x), au moins une quantité n'en a pas →
 * null pour tout le problème.
 */
export function rewriteQuantities(problem, choiceId) {
  if (!choiceId) return null;
  const out = problem.quantities.map((q) => ({ id: q.id, label: q.label, lin: q.lin?.[choiceId] ?? null }));
  return out.every((q) => q.lin) ? out : null;
}

/** Les valeurs de l'histoire pour un x donné (cohérentes avec les quantités). */
export function storyValues(problem, choiceId, x) {
  const rewritten = rewriteQuantities(problem, choiceId);
  if (!rewritten) return null;
  return rewritten.map((q) => ({ id: q.id, label: q.label, value: evalLin(q.lin, x) }));
}

/* ── Étapes de résolution ─────────────────────────────────────────── */
const signed = (n) => (n < 0 ? `− ${formatDec(-n)}` : `+ ${formatDec(n)}`);

/**
 * Les transformations « des deux côtés » applicables à une équation ; chaque
 * résultat est équivalent à l'entrée.
 */
export function nextValidSteps(eq, v = 'x') {
  const { left, right } = eq;
  const steps = [];
  if (left.b !== 0) {
    steps.push({
      id: 'sub-b',
      label: `${signed(-left.b)} des deux côtés`,
      eq: equation(lin(left.a, 0), lin(right.a, roundTo(right.b - left.b))),
    });
  }
  if (right.a !== 0 && left.a !== 0) {
    steps.push({
      id: 'sub-ax',
      label: `${signed(-right.a)}${v} des deux côtés`,
      eq: equation(lin(roundTo(left.a - right.a), left.b), lin(0, right.b)),
    });
  }
  if (left.a !== 0 && left.a !== 1 && left.b === 0 && right.a === 0) {
    steps.push({
      id: 'div-a',
      label: `÷ ${formatDec(left.a)} des deux côtés`,
      eq: equation(lin(1, 0), lin(0, roundTo(right.b / left.a))),
    });
  }
  return steps;
}

/* ── Formatage (LaTeX simple, lisible aussi en texte brut) ────────── */
const fmtNum = (n) => formatDec(n).replace(',', '{,}').replace('−', '-');

export function formatLin(l, v = 'x') {
  const { a, b } = l;
  if (a === 0) return fmtNum(b);
  const ax = a === 1 ? v : a === -1 ? `-${v}` : `${fmtNum(a)}${v}`;
  if (b === 0) return ax;
  return b > 0 ? `${ax} + ${fmtNum(b)}` : `${ax} - ${fmtNum(-b)}`;
}

export function formatEquation(eq, v = 'x') {
  return `${formatLin(eq.left, v)} = ${formatLin(eq.right, v)}`;
}

/** Version texte brut (aria-labels) : « 9n = 5n + 24 », « 6,25 ». */
export const plainMath = (latex) => latex.replace(/\{,\}/g, ',').replace(/-/g, '−');
