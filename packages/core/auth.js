/**
 * Whether a user satisfies a route's role requirement.
 * @param {{role: string}|null|undefined} user
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasRequiredRole(user, allowedRoles) {
  return Boolean(user) && allowedRoles.includes(user.role);
}
