import { call, get, send } from './adminClient';

/** « Défi du jour » : barème et défauts globaux. */
export function fetchDailyChallengeConfig(token) {
  return call('/admin/daily-challenge/config', get(token), 'Impossible de charger les réglages du défi du jour.');
}

/** @param {Record<string, unknown>} values  clé pointée → valeur (null = défaut) */
export function updateDailyChallengeConfig(token, values) {
  return call('/admin/daily-challenge/config', send('PUT', token, { values }), 'Impossible d’enregistrer les réglages du défi du jour.');
}
