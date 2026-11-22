/**
 * How a user's name is shown. « الاسم و اللقب » are collected at registration
 * (and asked of older accounts by the onboarding step, CompleteName.jsx), so
 * the email fallback below only covers the instant before that step and admin
 * accounts created without a name — greetings/avatars never render blank.
 */
export function getDisplayName(user) {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  return user.email ? user.email.split('@')[0] : '';
}

/** « أمين بن علي » — the whole name, for the profile and anywhere identity matters. */
export function getFullName(user) {
  if (!user) return '';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || getDisplayName(user);
}

export function getInitials(user) {
  if (!user) return '?';
  // Arabic initials would join into a word (« كب ») instead of reading as two
  // letters — a thin space (U+2009) keeps them apart. A zero-width non-joiner
  // is not enough: the avatar font (Space Grotesk → Cairo fallback) still
  // shapes the pair as joined. Latin initials stay tight (« LM »).
  const letters = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean);
  const separator = letters.some((c) => /\p{Script=Arabic}/u.test(c)) ? '\u2009' : '';
  const fromNames = letters.join(separator).toUpperCase();
  if (fromNames) return fromNames;
  return user.email ? user.email[0].toUpperCase() : '?';
}
