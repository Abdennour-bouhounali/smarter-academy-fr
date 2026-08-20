/**
 * Registration no longer collects first/last name (email + password only),
 * so every freshly-created account has both as null until a student fills
 * them in somewhere profile-related in the future. These fall back to the
 * email's local part so greetings/avatars never render blank.
 */
export function getDisplayName(user) {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  return user.email ? user.email.split('@')[0] : 'Élève';
}

export function getInitials(user) {
  if (!user) return '?';
  const fromNames = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  if (fromNames) return fromNames;
  return user.email ? user.email[0].toUpperCase() : '?';
}
