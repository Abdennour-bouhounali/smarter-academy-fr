import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { fetchBillingStatus } from '../services/billingStatusService';

/**
 * « Are payments open? » — the ONE answer of the web (docs/FRANCE_REBUILD_PLAN.md §4ter). While closed, the app shows
 * nothing that sells and nothing that locks; open, everything appears as configured. The server stays the protection:
 * it refuses a payment while closed whatever the page shows.
 *
 * Read from GET /billing/status once, early, for a visitor and an account alike; every other server answer that
 * carries the switch (`access.paymentsOpen` of /content/availability, `paymentsOpen` of /me/feature-access) corrects
 * it through `notePaymentsOpen`. A module store, so those services report without sitting under the provider.
 *
 * FAILS CLOSED: until an answer arrives, and if the read fails, payments are closed — showing a price on a guess
 * would sell what the server refuses.
 */
let state = { open: false, loaded: false };
const listeners = new Set();

function emit(next) {
  if (next.open === state.open && next.loaded === state.loaded) return;
  state = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => state;

/** A server answer that carries the switch. Anything but a boolean is ignored. */
export function notePaymentsOpen(value) {
  if (typeof value === 'boolean') emit({ open: value, loaded: true });
}

/** (Re)reads GET /billing/status. A failure settles as closed, unless another answer already settled it. */
export function loadPaymentsStatus() {
  return fetchBillingStatus()
    .then((open) => {
      notePaymentsOpen(open);
      return open;
    })
    .catch(() => {
      if (!state.loaded) emit({ open: false, loaded: true });
      return state.open;
    });
}

const CLOSED = Object.freeze({ paymentsOpen: false, loaded: true, refresh: () => Promise.resolve(false) });
const PaymentsContext = createContext(CLOSED);

/**
 * `value` replaces the server's answer (a test, a preview): `{ paymentsOpen: true }`. Without a provider the app is
 * closed — the default of the platform.
 */
export function PaymentsProvider({ children, value = null }) {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    if (!value) loadPaymentsStatus();
  }, [value]);

  const context = useMemo(() => {
    if (value) return { ...CLOSED, ...value, paymentsOpen: value.paymentsOpen === true };
    return { paymentsOpen: current.open, loaded: current.loaded, refresh: loadPaymentsStatus };
  }, [value, current]);

  return <PaymentsContext.Provider value={context}>{children}</PaymentsContext.Provider>;
}

/** `{ paymentsOpen, loaded, refresh }`. */
export function usePayments() {
  return useContext(PaymentsContext);
}
