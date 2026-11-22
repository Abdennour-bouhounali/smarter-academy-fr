/**
 * Lire une liste de classe collée ou téléversée (SCHOOL_ADMIN_SPACE.md §7) —
 * fonction PURE : le serveur reste juge de chaque ligne (aperçu), ce module ne
 * fait que la découper.
 *
 * Trois colonnes, dans l'ordre des listes scolaires : اللقب، الاسم، تاريخ الميلاد.
 * Séparateur : virgule, point-virgule ou tabulation (copier-coller d'un tableur).
 * Une première ligne d'en-tête est reconnue et sautée. Une date « 14/03/2012 »
 * devient « 2012-03-14 » ; toute autre forme est rendue telle quelle (le
 * serveur dira « تاريخ غير صالح »).
 */

const HEADER_WORDS = ['اللقب', 'الاسم', 'تاريخ', 'nom', 'prénom', 'prenom', 'date', 'lastname', 'firstname', 'birth'];

function splitLine(line) {
  const separator = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
  return line.split(separator).map((cell) => cell.trim().replace(/^"(.*)"$/, '$1').trim());
}

/** « 14/03/2012 », « 14-03-2012 », « 14.03.2012 » → « 2012-03-14 ». */
export function normalizeDate(raw) {
  const value = String(raw ?? '').trim();
  const dmy = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return value;
}

function isHeader(cells) {
  const joined = cells.join(' ').toLowerCase();
  return HEADER_WORDS.some((w) => joined.includes(w));
}

/**
 * @param {string} text
 * @returns {Array<{lastName: string, firstName: string, birthDate: string}>}
 */
export function parseRoster(text) {
  const lines = String(text ?? '')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows = lines.map(splitLine);
  if (rows.length > 0 && isHeader(rows[0])) rows.shift();

  return rows.map(([lastName = '', firstName = '', birthDate = '']) => ({
    lastName,
    firstName,
    birthDate: normalizeDate(birthDate),
  }));
}
