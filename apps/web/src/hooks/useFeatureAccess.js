import { useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchFeatureAccess } from '../services/featureAccessService';
import { withRefusal } from '../features/access/featureAccess';

/**
 * Le résumé « الوصول والحدود » du compte connecté, partagé par toutes les
 * surfaces (accueil du مختبر, instrument, calque, cahier) sans fournisseur
 * au-dessus du routeur : une petite mémoire de module, un seul appel par
 * jeton, rafraîchie après chaque création (le compteur change) et corrigée
 * par chaque refus reçu (`reportRefusal`).
 *
 * De quoi DESSINER seulement — chaque geste repasse par le serveur.
 */
let state = { token: null, data: null, loading: false };
let inflight = null;
const listeners = new Set();

function emit(next) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

const snapshot = () => state;

export function refreshFeatureAccess(token) {
  if (!token) return Promise.resolve(null);
  if (inflight && state.token === token) return inflight;
  if (state.token !== token) emit({ token, data: null, loading: true });
  else emit({ ...state, loading: true });

  inflight = fetchFeatureAccess(token)
    .then((data) => {
      if (state.token === token) emit({ token, data, loading: false });
      return data;
    })
    .catch(() => {
      if (state.token === token) emit({ ...state, loading: false });
      return null;
    })
    .finally(() => { inflight = null; });

  return inflight;
}

/** Un refus 403 porte l'état recompté par le serveur : on l'applique tel quel. */
export function reportRefusal(refusal) {
  if (!refusal || !state.data) return;
  emit({ ...state, data: withRefusal(state.data, refusal) });
}

export function useFeatureAccess() {
  const { token } = useContext(AuthContext);
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    if (token && current.token !== token && !inflight) refreshFeatureAccess(token);
  }, [token, current.token]);

  const refresh = useCallback(() => refreshFeatureAccess(token), [token]);
  const summary = current.token === token ? current.data : null;

  return { summary, loading: !summary && Boolean(token), refresh };
}
