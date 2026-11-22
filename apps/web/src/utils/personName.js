/**
 * « الاسم و اللقب » — the browser-side mirror of apps/api/app/Domain/Identity/PersonName.php.
 *
 * The server is the authority (and its messages are never displayed — see
 * services/apiMessage.js); this mirror exists only so a student sees WHICH
 * field is wrong, in Arabic, before the round-trip. Keep MIN/MAX/PATTERN in
 * step with the PHP class.
 */
const NAME_MIN = 2;
const NAME_MAX = 50;

// An ARABIC letter (letter AND Arabic script — so ٠-٩ and Arabic punctuation
// are out), then Arabic letters, harakat (\p{M}), tatweel (U+0640), or a
// space / hyphen followed by an Arabic letter. Same as PersonName::PATTERN.
const ARABIC_LETTER = '(?=\\p{L})\\p{Script=Arabic}';
const PATTERN = new RegExp(
  `^${ARABIC_LETTER}(?:${ARABIC_LETTER}|\\p{M}|\\u0640|[ -](?=\\p{L})(?=\\p{Script=Arabic}))*$`,
  'u',
);
const LATIN = /\p{Script=Latin}/u;

/** Trim, and collapse inner whitespace to one space — same as the server. */
export function normalizeName(value) {
  return typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : '';
}

/**
 * @returns {null|'required'|'tooShort'|'tooLong'|'notArabic'|'invalid'} an
 *   error code (rendered through `auth:name.errors.<code>`), or null when valid.
 *   `notArabic` = a Latin letter was typed — the message asks for Arabic letters.
 */
export function nameError(value) {
  const name = normalizeName(value);
  if (!name) return 'required';
  if (LATIN.test(name)) return 'notArabic';
  // Characters, not UTF-16 units — mb_strlen on the server.
  const length = [...name].length;
  if (length < NAME_MIN) return 'tooShort';
  if (length > NAME_MAX) return 'tooLong';
  if (!PATTERN.test(name)) return 'invalid';
  return null;
}

/** Both fields at once: `{ firstName?: code, lastName?: code }`, empty when valid. */
export function personNameErrors({ firstName, lastName }) {
  const errors = {};
  const first = nameError(firstName);
  const last = nameError(lastName);
  if (first) errors.firstName = first;
  if (last) errors.lastName = last;
  return errors;
}

/**
 * Codes worth showing WHILE the user types: what they just typed is wrong
 * (a Latin letter, a digit, too long). `required`/`tooShort` wait for the
 * field to be left — nobody should be scolded after their first letter.
 */
const LIVE_ERRORS = new Set(['notArabic', 'invalid', 'tooLong']);

/** The error to display for a field right now (see PersonNameFields). */
export function liveNameError(value, { touched = false } = {}) {
  const code = nameError(value);
  if (!code) return null;
  if (LIVE_ERRORS.has(code)) {
    // A trailing space/hyphen mid-typing (« بن ») is not an error yet.
    if (code === 'invalid' && nameError(String(value).replace(/[ -]+$/u, '')) === null) return null;
    return code;
  }
  return touched ? code : null;
}

/**
 * True when the account still needs « الاسم و اللقب » (admins never do) —
 * missing, or not written in Arabic letters (the server's `nameComplete`).
 */
export function needsName(user) {
  if (!user || user.role === 'admin') return false;
  if (typeof user.nameComplete === 'boolean') return !user.nameComplete;
  return nameError(user.firstName) !== null || nameError(user.lastName) !== null;
}
