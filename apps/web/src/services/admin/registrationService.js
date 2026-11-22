import { call, get, send } from './adminClient';

/**
 * L'interrupteur des inscriptions publiques (formulaire + Google) et celui des inscriptions par le lien d'une
 * classe, qui restent possibles quand le premier est fermé.
 *
 * @returns {Promise<{ open: boolean, classLinks: boolean }>}
 */
export function fetchRegistration(token) {
  return call('/admin/registration', get(token), 'Impossible de lire l’état des inscriptions.').then(
    (data) => data.registration,
  );
}

/** @param {{ open?: boolean, classLinks?: boolean }} change */
export function updateRegistration(token, change) {
  return call(
    '/admin/registration',
    send('PATCH', token, change),
    'Impossible de changer l’état des inscriptions.',
  ).then((data) => data.registration);
}
