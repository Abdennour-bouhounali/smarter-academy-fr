import { useContext, useEffect, useSyncExternalStore } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';

/**
 * « May a school or a teacher create a student's account, or issue its password? » — read by the teacher's and the
 * school's screens to hide the roster import and the login cards while the administrator keeps it closed
 * (ManagedAccountsGate, GET /managed-accounts/status). Hiding is never the protection: the server refuses anyway.
 *
 * Read ONCE per signed-in account (a module store keyed by the token), and FAILS CLOSED: until the answer arrives,
 * and if the read fails, the accounts are closed — a button shown on a guess would lead to a refusal.
 */
let state = { token: null, open: false, loaded: false };
let pending = null;
const listeners = new Set();

function emit(next) {
  state = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => state;

/** Reads the switch for this account, once: a second call for the same token returns the first answer. */
export function loadManagedAccountsStatus(token) {
  if (!token) return Promise.resolve(false);
  if (state.token === token && state.loaded) return Promise.resolve(state.open);
  if (pending?.token === token) return pending.promise;

  emit({ token, open: false, loaded: false });
  const promise = apiRequest('/managed-accounts/status', { headers: { Authorization: `Bearer ${token}` } })
    .then(({ ok, data }) => ok && data?.open === true)
    .catch(() => false)
    .then((open) => {
      if (pending?.token === token) pending = null;
      if (state.token === token) emit({ token, open, loaded: true });
      return open;
    });
  pending = { token, promise };
  return promise;
}

/** `{ open, loaded }` for the signed-in account. `loaded` false: not known yet — show neither the button nor its replacement. */
export function useManagedAccounts() {
  const { token } = useContext(AuthContext);
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    loadManagedAccountsStatus(token);
  }, [token]);

  const mine = Boolean(token) && current.token === token;
  return { open: mine && current.open, loaded: mine && current.loaded };
}
