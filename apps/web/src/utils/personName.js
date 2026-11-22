/**
 * « Prénom et nom » — the browser-side mirror of apps/api/app/Domain/Identity/PersonName.php.
 *
 * The server is the authority; this mirror exists only so a person sees WHICH field is wrong, in French, before the
 * round-trip. Keep MIN / MAX / PATTERN and the normalization in step with the PHP class.
 *
 * Accepted: the letters of the French alphabet (a–z, A–Z and their accents à â æ ç é è ê ë î ï ô œ ö ù û ü ÿ), and
 * BETWEEN two letters a space, a hyphen or an apostrophe, straight or typographic (« Jean-Pierre », « O’Neil »,
 * « D'Almeida »). Refused: digits, every other script (Arabic included), punctuation, emoji, tags.
 */
const NAME_MIN = 1;
const NAME_MAX = 50;

// The letters of PersonName::PATTERN, character for character.
const LETTER = "[A-Za-zÀÂÆÇÉÈÊËÎÏÔŒÖÙÛÜŸàâæçéèêëîïôœöùûüÿ]";
// A letter, then letters, or a separator (space, hyphen, ' or ’) followed by a letter: never two separators in a row,
// never one at either end. Same as PersonName::PATTERN.
const PATTERN = new RegExp(`^${LETTER}(?:${LETTER}|[ \\-'’](?=${LETTER}))*$`, 'u');
const TRAILING_SEPARATORS = /[ \-'’]+$/u;

/** NFC, then trim and collapse inner whitespace to one space — same as the server. */
export function normalizeName(value) {
  return typeof value === 'string' ? value.normalize('NFC').replace(/\s+/gu, ' ').trim() : '';
}

/**
 * @returns {null|'required'|'tooLong'|'invalid'} an error code (rendered through `auth:name.errors.<code>`), or
 *   null when valid. `invalid` = a character the rule refuses (a digit, another script, a stray separator).
 */
export function nameError(value) {
  const name = normalizeName(value);
  // Characters, not UTF-16 units — mb_strlen on the server.
  const length = [...name].length;
  if (length < NAME_MIN) return 'required';
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
 * Codes worth showing WHILE the person types: what they just typed is wrong (a digit, another script, too long).
 * `required` waits for the field to be left — nobody should be scolded before their first letter.
 */
const LIVE_ERRORS = new Set(['invalid', 'tooLong']);

/** The error to display for a field right now (see PersonNameFields). */
export function liveNameError(value, { touched = false } = {}) {
  const code = nameError(value);
  if (!code) return null;
  if (LIVE_ERRORS.has(code)) {
    // A trailing space, hyphen or apostrophe mid-typing (« Jean- », « D’ ») is not an error yet.
    if (code === 'invalid' && nameError(String(value).replace(TRAILING_SEPARATORS, '')) === null) return null;
    return code;
  }
  return touched ? code : null;
}

/**
 * True when the account still needs its « prénom et nom » (admins never do) — missing, or not passing the rule
 * (the server's `nameComplete`).
 */
export function needsName(user) {
  if (!user || user.role === 'admin') return false;
  if (typeof user.nameComplete === 'boolean') return !user.nameComplete;
  return nameError(user.firstName) !== null || nameError(user.lastName) !== null;
}
