/**
 * How a user's name is shown. « prénom et nom » are collected at registration
 * (and asked of older accounts by the onboarding step, CompleteName.jsx), so
 * the email fallback below only covers the instant before that step and admin
 * accounts created without a name — greetings/avatars never render blank.
 */
export function getDisplayName(user) {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  return user.email ? user.email.split('@')[0] : '';
}

/** « Léa Martin » — the whole name, for the profile and anywhere identity matters. */
export function getFullName(user) {
  if (!user) return '';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || getDisplayName(user);
}

export function getInitials(user) {
  if (!user) return '?';
  // Two Latin capitals, tight (« LM ») — a name is written in French letters (utils/personName.js).
  const fromNames = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase();
  if (fromNames) return fromNames;
  return user.email ? user.email[0].toUpperCase() : '?';
}
