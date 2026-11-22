import { LOCALE } from '../locale.js';

/**
 * TEMPORARY — the dinar helper of the Algerian platform, kept only so the files of the other agents of the
 * translation campaign still build while they switch to `utils/money.js › formatEur` (which writes the « € » itself:
 * a caller drops the currency word it appended). DELETED when its last reader has switched — the readers are listed
 * in the Foundation report of docs/FRANCE_REBUILD_PLAN.md §4quater. Do not add a reader.
 */
export function formatDzd(cents) {
  return Math.round(Number(cents || 0) / 100).toLocaleString(LOCALE);
}
