/**
 * Whether a user satisfies a route's role requirement.
 * @param {{role: string}|null|undefined} user
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasRequiredRole(user, allowedRoles) {
  return Boolean(user) && allowedRoles.includes(user.role);
}

/**
 * Les rôles qui peuvent PRÉSENTER en « وضع القسم » (Classroom Mode) : une
 * leçon, un محور, un exercice ou une manipulation, sur projecteur, tableau
 * interactif ou téléviseur de classe.
 *
 * C'EST LE SEUL ENDROIT où la question « qui peut présenter ? » se décide.
 * Aucun composant, aucune route, aucun test ne nomme un rôle : tous
 * appellent `canPresentClassroom`. Ajouter le compte enseignant (« enseignant »,
 * note du modèle User côté API) le jour où il existera, ou retirer un rôle
 * d'essai, se fait donc ICI, en une valeur — jamais par un second système de
 * rôles ni par une condition écrite dans l'interface.
 *
 * `teacher` : le compte enseignant existe désormais (role = 'teacher' côté
 * API) — il présente en classe, c'est précisément son métier.
 *
 * `student` N'Y FIGURE PLUS (décision du propriétaire, 2026-10-01 : « وضع القسم
 * est réservé à l'enseignant ») : il y avait été mis temporairement pour
 * éprouver le mode classe depuis un compte élève, et le bouton apparaissait
 * donc à chaque élève sur toutes les leçons.
 */
export const CLASSROOM_PRESENTER_ROLES = Object.freeze(['admin', 'teacher']);

/**
 * L'utilisateur peut-il ouvrir le mode classe ?
 * @param {{role: string}|null|undefined} user
 * @returns {boolean}
 */
export function canPresentClassroom(user) {
  return hasRequiredRole(user, CLASSROOM_PRESENTER_ROLES);
}
