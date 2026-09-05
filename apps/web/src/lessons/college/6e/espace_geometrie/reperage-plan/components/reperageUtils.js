/**
 * Modèle mathématique du repérage — source de vérité unique de la leçon.
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * Un point repéré est TOUJOURS `{ col, row }`, deux ENTIERS NATURELS :
 *   col = 1re coordonnée, comptée horizontalement depuis l'origine
 *   row = 2e  coordonnée, comptée verticalement depuis l'origine
 * Rien d'autre n'est stocké : la position en pixels, l'étiquette « (3 ; 5) »,
 * la case correspondante et le trajet du robot en sont tous DÉRIVÉS.
 *
 * ─── INVERSION DE L'AXE VERTICAL ───────────────────────────────────────
 * En SVG, y croît vers le BAS ; pour l'élève, la 2e coordonnée croît vers le
 * HAUT. `gridToSvg` est le SEUL endroit où cette inversion a lieu :
 *     y = padTop + (rows - row) * step
 * Aucun composant ne doit refaire ce calcul à la main.
 *
 * ─── PÉRIMÈTRE OFFICIEL ────────────────────────────────────────────────
 * Le programme de 6e exclut les coordonnées relatives : col ≥ 0 et row ≥ 0,
 * toujours. `clampNode` le garantit.
 *
 * ─── NŒUD vs CASE ──────────────────────────────────────────────────────
 * Deux repérages coexistent au programme et se confondent facilement :
 *   - un NŒUD est une intersection de traits      → (3 ; 5), col/row
 *   - une CASE est une surface entre quatre traits → B3, colonne/ligne
 * Ils n'ont pas le même nombre d'objets (cols+1 nœuds pour cols cases), et
 * `cellOf` / `nodeOfCell` explicitent le lien plutôt que de le laisser
 * deviner.
 */
import { nearestNode } from '../../../../../common/utils/geometry2d';

/** Espace fine insécable — typographie française des nombres et du « ; ». */
const THIN = ' ';

/* ── Le quadrillage ──────────────────────────────────────────────────── */

/**
 * Décrit un quadrillage et sa projection dans le viewBox SVG.
 * `cols`/`rows` comptent les INTERVALLES : un quadrillage 7×6 porte donc
 * 8×7 nœuds, numérotés de 0 à cols et de 0 à rows.
 */
export function makeGrid({ cols = 7, rows = 6, step = 40, padLeft = 44, padTop = 24, padRight = 20, padBottom = 40 } = {}) {
  return {
    cols,
    rows,
    step,
    padLeft,
    padTop,
    padRight,
    padBottom,
    width: padLeft + cols * step + padRight,
    height: padTop + rows * step + padBottom,
  };
}

/** Nœud (col, row) → coordonnées SVG. Seul lieu de l'inversion verticale. */
export function gridToSvg(grid, col, row) {
  return {
    x: grid.padLeft + col * grid.step,
    y: grid.padTop + (grid.rows - row) * grid.step,
  };
}

/** Coordonnées SVG → nœud le plus proche, borné au quadrillage. */
export function svgToGrid(grid, x, y) {
  const { col, row } = nearestNode(
    { x: x - grid.padLeft, y: y - grid.padTop },
    grid.step,
    grid.cols,
    grid.rows
  );
  // nearestNode raisonne en y-vers-le-bas ; on remet la 2e coordonnée à
  // l'endroit, dans le sens où l'élève la lit.
  return { col, row: grid.rows - row };
}

/** Centre SVG de la case (colonne, ligne), toutes deux comptées à partir de 0. */
export function cellCenterToSvg(grid, colonne, ligne) {
  const a = gridToSvg(grid, colonne, ligne);
  return { x: a.x + grid.step / 2, y: a.y - grid.step / 2 };
}

/* ── Points ──────────────────────────────────────────────────────────── */

export function clampNode(node, grid) {
  return {
    col: Math.max(0, Math.min(grid.cols, Math.round(node.col))),
    row: Math.max(0, Math.min(grid.rows, Math.round(node.row))),
  };
}

export function samePoint(a, b) {
  return !!a && !!b && a.col === b.col && a.row === b.row;
}

/** L'échange des deux coordonnées — le geste central du module 2. */
export function swapNode(node) {
  return { col: node.row, row: node.col };
}

/** Un point est sur la diagonale ⟺ l'échange ne le déplace pas. */
export function isOnDiagonal(node) {
  return node.col === node.row;
}

/* ── Écritures françaises ────────────────────────────────────────────── */

/** « (3 ; 5) » — parenthèses, point-virgule, espaces fines insécables. */
export function formatCoords(node) {
  return `(${node.col}${THIN};${THIN}${node.row})`;
}

/** Lecture à voix haute, pour les aria-label. */
export function readCoords(node) {
  return `abscisse ${node.col}, ordonnée ${node.row}`;
}

/** « B3 » — une case : lettre de colonne, numéro de ligne, comptés à partir de 1. */
export function formatCell(colonne, ligne) {
  return `${String.fromCharCode(65 + colonne)}${ligne + 1}`;
}

/** Case dont le nœud est le coin BAS-GAUCHE. */
export function cellOf(node) {
  return { colonne: node.col, ligne: node.row };
}

/** Nœud coin bas-gauche d'une case — la réciproque de cellOf. */
export function nodeOfCell(colonne, ligne) {
  return { col: colonne, row: ligne };
}

/* ── Déplacements dans le quadrillage ────────────────────────────────── */

/**
 * Déplacement de `from` vers `to`, décomposé en pas horizontaux et verticaux.
 * Le programme de 6e n'admet pas de nombres négatifs : on renvoie donc un
 * NOMBRE DE PAS positif accompagné d'une direction nommée en français.
 */
export function displacement(from, to) {
  const dCol = to.col - from.col;
  const dRow = to.row - from.row;
  return {
    horizontal: Math.abs(dCol),
    vertical: Math.abs(dRow),
    horizontalDir: dCol === 0 ? null : dCol > 0 ? 'droite' : 'gauche',
    verticalDir: dRow === 0 ? null : dRow > 0 ? 'haut' : 'bas',
    total: Math.abs(dCol) + Math.abs(dRow),
  };
}

/** Phrase française décrivant le déplacement, sans aucun nombre négatif. */
export function describeDisplacement(from, to) {
  const d = displacement(from, to);
  const parts = [];
  if (d.horizontal > 0) parts.push(`${d.horizontal} pas vers la ${d.horizontalDir}`);
  if (d.vertical > 0) parts.push(`${d.vertical} pas vers le ${d.verticalDir}`);
  if (parts.length === 0) return 'aucun déplacement : on y est déjà';
  return parts.join(' et ');
}

/** Les quatre pas élémentaires du robot. */
export const STEPS = {
  R: { dCol: 1, dRow: 0, label: '→', name: 'un pas vers la droite' },
  L: { dCol: -1, dRow: 0, label: '←', name: 'un pas vers la gauche' },
  U: { dCol: 0, dRow: 1, label: '↑', name: 'un pas vers le haut' },
  D: { dCol: 0, dRow: -1, label: '↓', name: 'un pas vers le bas' },
};

/**
 * Déroule un programme de pas depuis `start` et renvoie TOUTES les positions
 * traversées (la première est `start`). Fonction pure : c'est elle qui décide
 * si le robot atteint le drapeau, jamais l'animation.
 */
export function runProgram(start, program, grid) {
  const path = [clampNode(start, grid)];
  for (const key of program) {
    const step = STEPS[key];
    if (!step) continue;
    const prev = path[path.length - 1];
    path.push(clampNode({ col: prev.col + step.dCol, row: prev.row + step.dRow }, grid));
  }
  return path;
}

/** Programme le plus court de `from` à `to` : d'abord l'horizontale, puis la
 *  verticale — le trajet « en L » que la leçon montre comme référence. */
export function shortestProgram(from, to) {
  const d = displacement(from, to);
  const h = d.horizontalDir === 'gauche' ? 'L' : 'R';
  const v = d.verticalDir === 'bas' ? 'D' : 'U';
  return [...Array(d.horizontal).fill(h), ...Array(d.vertical).fill(v)];
}

/* ── Alignements — sème la leçon « Droites et segments » ─────────────── */

/** Trois nœuds partagent-ils la même 2e coordonnée (ligne horizontale) ? */
export function sameRow(nodes) {
  return nodes.length > 1 && nodes.every((n) => n.row === nodes[0].row);
}

/** Trois nœuds partagent-ils la même 1re coordonnée (ligne verticale) ? */
export function sameCol(nodes) {
  return nodes.length > 1 && nodes.every((n) => n.col === nodes[0].col);
}
