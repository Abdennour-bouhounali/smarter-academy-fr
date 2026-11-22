/**
 * Petits formats de l'espace parent, purs et testés (format.test.js).
 */

/** Une durée en secondes → `{ h, m }` (minutes entières). */
export function splitDuration(seconds) {
  const minutes = Math.floor(Math.max(0, seconds || 0) / 60);
  return { h: Math.floor(minutes / 60), m: minutes % 60 };
}

/** « 1 سا 25 د », « 25 د », « 0 د » — avec le `t` du namespace `family`. */
export function formatDuration(t, seconds) {
  const { h, m } = splitDuration(seconds);
  if (h > 0) return t('duration.hm', { h, m });
  if (m > 0) return t('duration.m', { m });
  return t('duration.zero');
}

/** Le jour de la semaine (0 = dimanche) d'une date « AAAA-MM-JJ », sans fuseau. */
export function weekdayOf(isoDate) {
  const [y, mo, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

/** « 22/10 » — court, chiffres occidentaux comme le reste de la plateforme. */
export function shortDate(isoDate) {
  const [, mo, d] = isoDate.split('-');
  return `${Number(d)}/${Number(mo)}`;
}

/** Le code de liaison lisible : « ABCD-2345 ». */
export function displayCode(code) {
  return code && code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code || '';
}

/** La hauteur relative d'une barre (0–100), pour le graphique des jours. */
export function barPercent(value, max) {
  if (!max || max <= 0 || !value) return 0;
  return Math.max(2, Math.round((value / max) * 100));
}
