import { call, get, send } from './adminClient';

/**
 * The switch of the accounts a school or a teacher creates for a student (GET / PATCH /admin/managed-accounts —
 * ManagedAccountsGate). Closed, the server refuses a school's roster import and the issuing of credentials by a
 * school or a teacher; every account that already exists keeps working.
 *
 * @typedef {{ open: boolean, default: boolean,
 *             lastChange: null | { at: ?string, by: null | { id: number, name: string } } }} ManagedAccounts
 */

/** @returns {Promise<ManagedAccounts>} */
export function fetchManagedAccounts(token) {
  return call(
    '/admin/managed-accounts',
    get(token),
    'Impossible de lire l’état des comptes créés par un établissement ou un professeur.',
  ).then((data) => data.managedAccounts);
}

/** @returns {Promise<ManagedAccounts>} */
export function updateManagedAccounts(token, open) {
  return call(
    '/admin/managed-accounts',
    send('PATCH', token, { open }),
    'Impossible de changer l’état des comptes créés par un établissement ou un professeur.',
  ).then((data) => data.managedAccounts);
}
