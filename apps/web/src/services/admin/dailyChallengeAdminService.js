import { call, get, send } from './adminClient';

/** « التحدّي اليومي » : barème et défauts globaux. */
export function fetchDailyChallengeConfig(token) {
  return call('/admin/daily-challenge/config', get(token), 'تعذّر تحميل إعدادات التحدّي اليومي.');
}

/** @param {Record<string, unknown>} values  clé pointée → valeur (null = défaut) */
export function updateDailyChallengeConfig(token, values) {
  return call('/admin/daily-challenge/config', send('PUT', token, { values }), 'تعذّر حفظ إعدادات التحدّي اليومي.');
}
