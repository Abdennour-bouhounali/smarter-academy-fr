/**
 * Le nom du contenu, et son accord.
 *
 * « leçon » est féminin, « module » et « exercice » sont masculins : sans cette
 * distinction, l'interface écrit « 24 leçons sélectionnés » et « 1 leçon
 * sélectionné ». Ce sont des pages d'administration françaises lues tous les
 * jours par la même personne ; une faute d'accord à chaque sélection est une
 * faute visible.
 *
 * Un seul endroit décide, plutôt qu'un `count > 1 ? 's' : ''` recopié dans
 * cinq gabarits — c'est exactement la répétition qui a produit la faute.
 */

/** Les trois types de contenu du panneau, avec leur genre. */
export const CONTENT_NOUNS = {
  lesson: { one: 'leçon', many: 'leçons', feminine: true },
  module: { one: 'module', many: 'modules', feminine: false },
  exercise: { one: 'exercice', many: 'exercices', feminine: false },
};

/**
 * Accorde un participe passé en genre et en nombre.
 *
 * @param {string} stem  le participe au masculin singulier — « sélectionné »
 * @param {number} count
 * @param {boolean} feminine
 * @returns {string} « sélectionnée », « sélectionnés », « sélectionnées »…
 */
export function agree(stem, count, feminine) {
  return `${stem}${feminine ? 'e' : ''}${count > 1 ? 's' : ''}`;
}

/** « 1 leçon » / « 24 leçons ». */
export function countNoun(count, noun) {
  return `${count} ${count === 1 ? noun.one : noun.many}`;
}
