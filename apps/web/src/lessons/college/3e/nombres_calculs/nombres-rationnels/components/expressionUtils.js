import { add, sub, mul, div, formatFrac, plainFrac, normalize } from './rationalUtils';

/**
 * expressionUtils — la logique pure du module 6, « Dans quel ordre ? ».
 *
 * MODÈLE. Une expression est un ARBRE, jamais une chaîne LaTeX :
 *
 *   feuille   { id, rat: {num, den} }
 *   nœud      { id, op: '+' | '-' | '*' | ':', left, right, paren?: true }
 *
 * C'est ce qui permet à l'élève d'EXÉCUTER une opération en tapant l'opérateur
 * lui-même : le sous-arbre est remplacé par sa valeur, et l'expression
 * survivante se réaffiche. La chaîne de calcul n'est donc pas écrite à la
 * main quelque part — elle EST l'historique des réductions (playbook : « la
 * conséquence est calculée, jamais scriptée »).
 *
 * PRIORITÉ. `reducible(tree)` répond à la seule question qui compte :
 * quels opérateurs ont le droit de partir MAINTENANT ? La règle du collège —
 * parenthèses d'abord, puis × et ÷, puis + et −, à égalité de gauche à droite —
 * est calculée ici et nulle part ailleurs ; les modules ne la récitent pas.
 */

/** Priorité opératoire : × et ÷ passent avant + et −. */
export function priority(op) {
  return op === '*' || op === ':' ? 2 : 1;
}

/** Construit une feuille (un rationnel). */
export const leaf = (id, r) => ({ id, rat: normalize(r) });

/** Construit un nœud. `paren` marque un sous-arbre entre parenthèses. */
export const node = (id, op, left, right, paren = false) =>
  (paren ? { id, op, left, right, paren: true } : { id, op, left, right });

/** Vrai si le nœud est une feuille (plus rien à exécuter). */
export const isLeaf = (t) => !!t && t.rat !== undefined;

/** Tous les nœuds opérateurs de l'arbre, dans l'ordre de lecture (gauche → droite). */
export function operatorNodes(t) {
  if (!t || isLeaf(t)) return [];
  return [...operatorNodes(t.left), t, ...operatorNodes(t.right)];
}

/**
 * Les ids des opérateurs EXÉCUTABLES maintenant.
 *
 * Un opérateur ne peut partir que si ses deux opérandes sont déjà des nombres
 * (sinon il faudrait calculer « avec un morceau pas encore fini ») ET qu'aucun
 * opérateur plus prioritaire ne l'attend. Une parenthèse se referme d'elle-même :
 * son contenu devient une feuille, donc l'opérateur qui la portait devient
 * exécutable à son tour — aucune règle spéciale à écrire.
 *
 * À priorité égale, l'associativité à gauche impose le plus à gauche.
 */
export function reducible(t) {
  const ready = operatorNodes(t).filter((n) => isLeaf(n.left) && isLeaf(n.right));
  if (ready.length === 0) return [];

  // Un sous-arbre parenthésé est un monde clos : tant qu'il reste une opération
  // dedans, elle passe avant tout ce qui est dehors.
  const inParen = ready.filter((n) => insideParen(t, n.id));
  const pool = inParen.length > 0 ? inParen : ready;

  const top = Math.max(...pool.map((n) => priority(n.op)));
  const best = pool.filter((n) => priority(n.op) === top);
  return [best[0].id]; // gauche → droite à égalité
}

/** Vrai si `id` se trouve à l'intérieur d'un sous-arbre marqué `paren`. */
export function insideParen(t, id, within = false) {
  if (!t || isLeaf(t)) return false;
  const here = within || t.paren === true;
  if (t.id === id) return here;
  return insideParen(t.left, id, here) || insideParen(t.right, id, here);
}

const APPLY = { '+': add, '-': sub, '*': mul, ':': div };

/** Le libellé de l'étape, tel qu'il apparaîtra dans la chaîne de calcul. */
export function stepLabel(op, paren) {
  if (paren) return 'La parenthèse d’abord';
  if (op === '*') return 'Le produit, prioritaire';
  if (op === ':') return 'Le quotient, prioritaire';
  if (op === '+') return 'Puis la somme';
  return 'Puis la différence';
}

/**
 * Exécute l'opérateur `id` : le sous-arbre devient une feuille.
 * @returns {{tree, step: {label, expr, value, rat}}}
 * @throws {Error} si le nœud n'est pas exécutable (opérandes pas encore calculés)
 */
export function reduce(t, id) {
  const target = operatorNodes(t).find((n) => n.id === id);
  if (!target) throw new Error(`Aucun opérateur « ${id} » dans cette expression.`);
  if (!isLeaf(target.left) || !isLeaf(target.right)) {
    throw new Error('Cet opérateur attend encore un morceau non calculé.');
  }
  const value = APPLY[target.op](target.left.rat, target.right.rat);
  const step = {
    label: stepLabel(target.op, insideParen(t, id)),
    expr: `${plainFrac(target.left.rat)} ${SYMBOL[target.op]} ${plainFrac(target.right.rat)}`,
    value: `= ${plainFrac(value)}`,
    rat: value,
  };
  return { tree: replace(t, id, leaf(`v-${id}`, value)), step };
}

/** Remplace le nœud `id` par `next`, en conservant tout le reste. */
export function replace(t, id, next) {
  if (!t || isLeaf(t)) return t;
  if (t.id === id) return next;
  return { ...t, left: replace(t.left, id, next), right: replace(t.right, id, next) };
}

/**
 * Pourquoi cet opérateur ne peut pas partir maintenant — la RAISON
 * mathématique, jamais « essaie encore ».
 */
export function refusalReason(t, id) {
  const target = operatorNodes(t).find((n) => n.id === id);
  if (!target) return 'Cet opérateur n’est plus dans l’expression.';
  const allowed = reducible(t);
  if (allowed.includes(id)) return '';

  const winner = operatorNodes(t).find((n) => n.id === allowed[0]);
  if (!winner) return 'Il n’y a plus rien à calculer.';

  // L'ordre des raisons suit celui de la RÈGLE, pas celui du code : l'élève
  // doit entendre « la parenthèse d'abord », puis « × avant + », puis « de
  // gauche à droite ». Le constat « un morceau n'est pas encore un nombre »
  // n'arrive qu'en dernier : c'est une conséquence des trois premières, jamais
  // une explication en soi.
  if (insideParen(t, winner.id) && !insideParen(t, id)) {
    return `Pas encore : ${NAME[winner.op]} est enfermée dans la parenthèse, et une parenthèse se calcule en premier.`;
  }
  if (priority(winner.op) > priority(target.op)) {
    return `Pas encore : ${NAME[winner.op]} passe AVANT ${NAME[target.op]} — × et ÷ sont prioritaires sur + et −.`;
  }
  if (priority(winner.op) === priority(target.op)) {
    return `Pas encore : à priorité égale, on va de GAUCHE à DROITE — ${NAME[winner.op]} est plus à gauche.`;
  }
  return 'Pas encore : un des deux morceaux n’est pas encore un nombre.';
}

const SYMBOL = { '+': '+', '-': '−', '*': '×', ':': '÷' };
const NAME = { '+': 'l’addition', '-': 'la soustraction', '*': 'la multiplication', ':': 'la division' };

/** Le symbole affiché d'un opérateur (− est le vrai signe moins U+2212). */
export const symbolOf = (op) => SYMBOL[op];
/** Le nom français d'un opérateur, pour les libellés d'accessibilité. */
export const nameOf = (op) => NAME[op];

/** Écriture LaTeX de l'arbre (parenthèses comprises). */
export function renderLatex(t) {
  if (!t) return '';
  if (isLeaf(t)) return formatFrac(t.rat);
  const inner = `${renderLatex(t.left)} ${TEX[t.op]} ${renderLatex(t.right)}`;
  return t.paren ? `\\left(${inner}\\right)` : inner;
}

const TEX = { '+': '+', '-': '-', '*': '\\times', ':': '\\div' };

/** Écriture texte plate de l'arbre (aria, e2e, chaîne de calcul). */
export function renderPlain(t) {
  if (!t) return '';
  if (isLeaf(t)) return plainFrac(t.rat);
  const inner = `${renderPlain(t.left)} ${SYMBOL[t.op]} ${renderPlain(t.right)}`;
  return t.paren ? `(${inner})` : inner;
}

/**
 * Réduit l'arbre jusqu'au bout en suivant TOUJOURS la règle de priorité.
 * Sert aux tests et à la révélation « voilà le chemin correct ».
 */
export function reduceFully(t) {
  let tree = t;
  const steps = [];
  let guard = 0;
  while (!isLeaf(tree) && guard++ < 64) {
    const [id] = reducible(tree);
    if (!id) break;
    const r = reduce(tree, id);
    tree = r.tree;
    steps.push(r.step);
  }
  return { tree, steps, value: isLeaf(tree) ? tree.rat : null };
}
