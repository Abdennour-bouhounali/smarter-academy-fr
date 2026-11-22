import { isPrime, primeFactorization } from './numberTheory.js';

/**
 * L'ARBRE de facteurs (§24) — les fonctions pures, sorties de PrimesMode.jsx
 * pour être testées.
 *
 *     { n, left, right }   — une feuille n'a ni left ni right
 */

export function collectLeaves(node, out = []) {
  if (!node) return out;
  if (!node.left || !node.right) { out.push(node); return out; }
  collectLeaves(node.left, out);
  collectLeaves(node.right, out);

  return out;
}

export function nodeAt(node, path) {
  return path.reduce((current, key) => current?.[key] ?? null, node);
}

export function replaceAt(node, path, replacement) {
  if (path.length === 0) return replacement;
  const [head, ...rest] = path;

  return { ...node, [head]: replaceAt(node[head], rest, replacement) };
}

/** L'arbre complet, fendu au plus petit facteur premier à chaque pas : 60 → 2 × 30 → … */
export function buildFullTree(n) {
  if (!Number.isInteger(n) || n < 2 || isPrime(n)) return { n };
  const factors = primeFactorization(n);
  if (!factors?.length) return { n };
  const p = factors[0].p;

  return { n, left: { n: p }, right: buildFullTree(n / p) };
}

/**
 * La LECTURE de l'arbre, niveau après niveau — la chaîne du manuel :
 *
 *     60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5
 *
 * Le niveau k remplace chaque nœud de profondeur k par ses deux fils ; une
 * feuille reste telle quelle aux niveaux suivants. Rend la liste des
 * produits (chacun une liste de facteurs), sans doublon consécutif.
 */
export function treeLevels(tree, maxDepth = 30) {
  if (!tree) return [];
  const levels = [[tree]];
  for (let depth = 0; depth < maxDepth; depth += 1) {
    const current = levels[levels.length - 1];
    if (current.every((node) => !node.left || !node.right)) break;
    levels.push(current.flatMap((node) => (node.left && node.right ? [node.left, node.right] : [node])));
  }

  return levels.map((level) => level.map((node) => node.n));
}

export const TREE_PRESETS = Object.freeze([60, 72, 360, 1001]);

/** Le chemin de la PREMIÈRE feuille composée (de gauche à droite), ou null. */
export function firstCompositeLeafPath(node, path = []) {
  if (!node) return null;
  if (!node.left || !node.right) return node.n >= 4 && !isPrime(node.n) ? path : null;

  return firstCompositeLeafPath(node.left, [...path, 'left']) ?? firstCompositeLeafPath(node.right, [...path, 'right']);
}

/**
 * LA CONSTRUCTION AUTOMATIQUE, une fente à la fois — à partir de l'arbre
 * tel que l'élève l'a laissé (vide ou déjà commencé à la main).
 *
 * À chaque pas : la première feuille composée est fendue par son PLUS PETIT
 * facteur premier. `60` : 60 → 2 × 30, 30 → 2 × 15, 15 → 3 × 5.
 *
 * @returns {Array<{ tree, path, split: { n, p, q }, leaves: number[] }>}
 *   `tree` est l'arbre APRÈS la fente ; `leaves` ses feuilles de gauche à droite.
 */
export function autoSplitStages(tree, maxSplits = 64) {
  const stages = [];
  let current = tree;
  for (let guard = 0; current && guard < maxSplits; guard += 1) {
    const path = firstCompositeLeafPath(current);
    if (!path) break;
    const { n } = nodeAt(current, path);
    const p = primeFactorization(n)?.[0]?.p;
    if (!p) break;
    current = replaceAt(current, path, { n, left: { n: p }, right: { n: n / p } });
    stages.push({ tree: current, path, split: { n, p, q: n / p }, leaves: collectLeaves(current).map((leaf) => leaf.n) });
  }

  return stages;
}
