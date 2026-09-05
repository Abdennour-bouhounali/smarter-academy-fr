/**
 * graphUtils — la mathématique de la CONSTRUCTION d'un graphique.
 *
 * Le sujet de cette leçon n'est pas la courbe, c'est la décision : quelle
 * grandeur sur quel axe, quelle échelle, relier ou non. Ces fonctions décrivent
 * ces décisions et leurs conséquences, sans aucun pixel.
 *
 * L'ÉCHELLE SE PENSE EN « UNITÉS PAR CARREAU », SUR UN CADRE DE 12 CARREAUX.
 * C'est ce qui rend le mauvais choix visible sans jamais produire un repère
 * ingérable : un pas trop petit ne fabrique pas 2 000 graduations, il fait
 * SORTIR des points du cadre — et c'est exactement la leçon.
 *
 * PIÈGE ENCODÉ — `detectFault` distingue quatre défauts réels : l'axe tronqué
 * (qui exagère), les axes inversés (qui racontent l'histoire à l'envers), le
 * point égaré (une erreur de placement) et l'échelle qui APLATIT une variation
 * pourtant réelle. Ce dernier est propre à la 3e : rien n'est faux, et pourtant
 * le graphique trompe.
 */

import { roundTo, formatDec } from '@smarter-academy/core';

/** Nombre de carreaux du cadre standard de la leçon. */
export const CELLS = 12;

/**
 * Les pas d'échelle utilisables pour ces valeurs : ceux qui tiennent en
 * `cells` carreaux. Un pas trop petit est écarté d'office.
 */
export function scaleChoices(values, cells = CELLS, candidates = null) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return [];
  const max = Math.max(...finite, 0);
  const pool = candidates ?? [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  return pool.filter((step) => step > 0 && max <= step * cells);
}

/** L'étendue qu'un pas engendre sur `cells` carreaux : 0 … step × cells. */
export function rangeFor(step, cells = CELLS) {
  return { min: 0, max: roundTo(step * cells, 6) };
}

/** Quelles lignes tiennent dans le cadre, lesquelles en sortent. */
export function fitsIn(range, values) {
  const inside = [];
  const outside = [];
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v >= range.min - 1e-9 && v <= range.max + 1e-9) inside.push(v);
    else outside.push(v);
  }
  return { inside, outside };
}

/** Le plus petit pas qui fait tout tenir — celui qui « remplit » le mieux. */
export function bestStep(values, cells = CELLS, candidates = null) {
  const options = scaleChoices(values, cells, candidates);
  for (const step of options) {
    if (fitsIn(rangeFor(step, cells), values).outside.length === 0) return step;
  }
  return options.length ? options[options.length - 1] : null;
}

/**
 * L'affectation des axes : la grandeur DONT dépend l'autre va en abscisse.
 * (Le temps en x, la distance en y ; la quantité en x, le prix en y.)
 */
export function isAssignmentValid(assignment, expected) {
  return assignment.x === expected.x && assignment.y === expected.y;
}

/** Relie-t-on les points ? Oui si la grandeur varie continûment. */
export function joinDecision(kind) {
  return kind === 'continu';
}

/**
 * Le défaut d'un graphique, s'il y en a un.
 * `spec` : { truncatedAxis, swapped, misplacedIndex, stepTooLarge }
 */
export function detectFault(spec = {}) {
  if (spec.truncatedAxis) return 'tronque';
  if (spec.swapped) return 'inverse';
  if (Number.isInteger(spec.misplacedIndex) && spec.misplacedIndex >= 0) return 'mal-place';
  if (spec.stepTooLarge) return 'echelle';
  return null;
}

/** L'écart signé entre le point posé et celui attendu — le gap à annoncer. */
export function pointError(placed, target) {
  return {
    dx: roundTo(target.x - placed.x, 6),
    dy: roundTo(target.y - placed.y, 6),
  };
}

/** « il manque 2 vers la droite et 1,5 vers le haut » — jamais un « faux » sec. */
export function describeError(placed, target) {
  const { dx, dy } = pointError(placed, target);
  if (dx === 0 && dy === 0) return 'le point est au bon endroit';
  const parts = [];
  if (dx !== 0) parts.push(`${formatDec(Math.abs(dx))} vers la ${dx > 0 ? 'droite' : 'gauche'}`);
  if (dy !== 0) parts.push(`${formatDec(Math.abs(dy))} vers le ${dy > 0 ? 'haut' : 'bas'}`);
  return parts.join(' et ');
}

/**
 * L'amplitude relative d'une série : (max − min) ÷ max.
 * Sous ~5 %, un graphique à l'échelle complète paraît plat — c'est le piège
 * de l'échelle, et c'est mesurable plutôt qu'affirmé.
 */
export function relativeSpread(values) {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return 0;
  const max = Math.max(...finite);
  const min = Math.min(...finite);
  if (max === 0) return 0;
  return roundTo((max - min) / max, 6);
}
