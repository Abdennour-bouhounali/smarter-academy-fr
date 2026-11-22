import { MANIPULATION_LEVEL_IDS, resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';

/**
 * Les DÉCISIONS du workspace à deux niveaux, en pur — sans React, donc
 * testables directement (le dépôt n'a pas d'environnement DOM : ses tests
 * `.test.jsx` vérifient la géométrie et les règles, pas le rendu).
 *
 * `ManipulationWorkspace` ne fait qu'appliquer ce que ce module décide.
 */

/**
 * Quels niveaux la leçon propose réellement ? Un niveau sans contenu n'a pas
 * d'onglet : mieux vaut un seul onglet qu'un onglet mort.
 */
export function availableLevels(levels) {
  return MANIPULATION_LEVEL_IDS.filter((id) => typeof levels?.[id] === 'function');
}

/**
 * Le niveau ACTIF : celui demandé s'il existe, sinon le premier disponible.
 * Jamais `undefined` — un workspace sans niveau actif serait un écran vide.
 */
export function activeLevel(levels, requested) {
  const available = availableLevels(levels);
  if (available.length === 0) return null;
  const id = resolveLevelId(requested);
  return available.includes(id) ? id : available[0];
}

/**
 * La clé de montage d'un panneau. Elle porte le MODÈLE mathématique : tant
 * qu'il ne change pas, la clé ne change pas, donc React ne remonte rien et
 * l'état du niveau (équipes formées, tailles essayées, phase atteinte)
 * survit à un aller-retour مبتدئ → متقدم → مبتدئ.
 *
 * Quand le modèle change, la clé change et l'état PART — voulu : il
 * décrirait une mathématique qui n'est plus à l'écran.
 */
export function panelKey(levelId, modelKey = '') {
  return `${levelId}:${modelKey}`;
}

/**
 * Le niveau suivant dans l'ordre du sélecteur, en boucle. `dir` est +1 ou −1
 * dans l'ordre LOGIQUE (débutant → avancé) ; la vue décide quelle flèche du
 * clavier correspond, parce qu'en RTL la flèche gauche va vers le suivant.
 */
export function stepLevel(levels, current, dir) {
  const available = availableLevels(levels);
  if (available.length === 0) return null;
  const i = available.indexOf(activeLevel(levels, current));
  return available[(i + dir + available.length) % available.length];
}
