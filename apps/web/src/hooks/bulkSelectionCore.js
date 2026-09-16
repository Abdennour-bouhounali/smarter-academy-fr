/**
 * Le cœur PUR de la sélection multiple — sans React, donc testable seul.
 *
 * Extrait parce que c'est la partie de cette fonctionnalité qui peut faire du
 * mal : si la sélection retient un identifiant que l'administrateur ne voit
 * plus, l'action suivante touche un contenu qu'il n'a pas choisi. Cette règle
 * mérite un test, et un test ne doit pas avoir besoin d'un navigateur.
 *
 * Voir useBulkSelection pour le branchement React.
 */

/**
 * Élague la sélection de tout ce qui n'est plus affiché.
 *
 * Appelée à CHAQUE changement des lignes visibles : page, filtre, recherche,
 * tri, rechargement. On ne peut pas agir sur ce qu'on ne voit pas.
 *
 * Rend le Set d'ORIGINE quand rien n'a disparu, pour que React ne voie pas un
 * nouvel objet à chaque rechargement d'une liste inchangée.
 *
 * @param {Set<number>} selected
 * @param {number[]} visibleIds
 * @returns {Set<number>}
 */
export function pruneToVisible(selected, visibleIds) {
  if (selected.size === 0) return selected;

  const visible = new Set(visibleIds);
  const next = new Set();
  for (const id of selected) if (visible.has(id)) next.add(id);

  return next.size === selected.size ? selected : next;
}

/**
 * Cocher / décocher un identifiant.
 *
 * @param {Set<number>} selected
 * @param {number} id
 * @returns {Set<number>}
 */
export function toggleId(selected, id) {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);

  return next;
}

/**
 * « Tout sélectionner » / « tout désélectionner », sur les lignes AFFICHÉES.
 *
 * Quand tout le visible est déjà coché, le geste inverse : c'est ce qui rend la
 * case maîtresse utilisable comme une vraie case à cocher. Elle ne rend jamais
 * un identifiant hors écran — « tout » veut dire « tout ce qui est affiché »,
 * et l'interface l'écrit en clair.
 *
 * @param {Set<number>} selected
 * @param {number[]} visibleIds
 * @returns {Set<number>}
 */
export function toggleAllVisible(selected, visibleIds) {
  const allVisibleSelected = visibleIds.length > 0
    && visibleIds.every((id) => selected.has(id));

  return allVisibleSelected ? new Set() : new Set(visibleIds);
}
