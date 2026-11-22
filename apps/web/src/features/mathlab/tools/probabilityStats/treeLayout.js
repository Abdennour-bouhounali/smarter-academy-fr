/**
 * LA MISE EN PAGE de l'arbre — de gauche à droite, racine → feuilles, comme
 * au tableau (le dessin est LTR quelle que soit la page). Logique pure :
 * chaque feuille reçoit une rangée, chaque nœud interne se place au milieu
 * de ses enfants, chaque étape est une colonne. Le composant ne calcule
 * aucune coordonnée.
 */

import { allBranches, labelParts, pathKey } from './probabilityTree.js';

/** La largeur d'une pastille d'étiquette (estimée, police 13 px : ~8 unités par caractère). */
export function pillWidth(label) {
  const { text } = labelParts(label);

  return Math.max(30, Math.min(120, Array.from(text).length * 8 + 16));
}

export const PILL_HEIGHT = 24;

/**
 * @param {object} tree
 * @param {{ width: number, compact?: boolean }} options
 * @returns {{ width, height, root: {x, y}, nodes: Array, resultX: number, rowGap: number }}
 *   nodes : une entrée par BRANCHE — `{ key, path, depth, x, y, parentX, parentY, leaf, branch }`,
 *   (x, y) étant le centre de la pastille au bout de la branche.
 */
export function layoutTree(tree, { width, compact = false }) {
  const rowGap = compact ? 34 : 36;
  const top = 18;
  const rootX = 16;
  const resultWidth = compact ? 104 : 168;
  const entries = allBranches(tree);
  const leaves = entries.filter((entry) => entry.depth === tree.stages);
  const height = Math.max(150, top * 2 + leaves.length * rowGap);
  const columnWidth = (width - rootX - resultWidth - 24) / tree.stages;
  const xOf = (depth) => rootX + depth * columnWidth + (depth === 0 ? 0 : 18);

  // Les feuilles d'abord (une rangée chacune), puis chaque nœud au milieu de ses enfants.
  const yByKey = new Map();
  leaves.forEach((leaf, index) => yByKey.set(leaf.key, top + rowGap / 2 + index * rowGap));
  for (let depth = tree.stages - 1; depth >= 1; depth -= 1) {
    for (const entry of entries.filter((e) => e.depth === depth)) {
      const childYs = entry.branch.children.map((_, i) => yByKey.get(pathKey([...entry.path, i])));
      yByKey.set(entry.key, (Math.min(...childYs) + Math.max(...childYs)) / 2);
    }
  }
  const rootYs = tree.branches.map((_, i) => yByKey.get(String(i)));
  const root = { x: rootX, y: (Math.min(...rootYs) + Math.max(...rootYs)) / 2 };

  const nodes = entries.map((entry) => {
    const parentKey = pathKey(entry.path.slice(0, -1));

    return {
      key: entry.key,
      path: entry.path,
      depth: entry.depth,
      branch: entry.branch,
      leaf: entry.depth === tree.stages,
      x: xOf(entry.depth),
      y: yByKey.get(entry.key),
      parentKey,
      parentX: entry.depth === 1 ? root.x : xOf(entry.depth - 1),
      parentY: entry.depth === 1 ? root.y : yByKey.get(parentKey),
    };
  });

  return { width, height, root, nodes, resultX: width - resultWidth, rowGap };
}
