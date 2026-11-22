// LE COMPTE CONNU de cet appareil — pour ne plus attendre `/auth/me` avant de peindre.
//
// Avant (mesuré le 2026-10-17) : chaque page authentifiée attendait la réponse
// de `/auth/me` (≈ un aller-retour, 300–800 ms sur un réseau algérien) AVANT de
// demander le lot de sa page, puis ses propres données : une cascade
// entrée → /me → lot de la page → données. Les fournisseurs (study-context,
// lesson-progress, tours, notifications) attendaient eux aussi le rôle.
//
// Maintenant : le compte reçu à la connexion (et à chaque `/me`) est gardé ici,
// lié au jeton qui l'a obtenu. Au démarrage, AuthContext le reprend s'il
// correspond au jeton courant — la page, ses lots et ses données partent tout
// de suite — puis le revalide en arrière-plan par `/me` (stale-while-revalidate).
// Un 401/403 ferme la session comme avant ; le serveur reste la seule autorité
// (chaque appel porte le jeton, chaque route est gardée côté serveur).
//
// Le jeton lui-même n'est PAS recopié : on n'en garde qu'une empreinte (sa fin),
// suffisante pour ne jamais présenter le compte d'un autre jeton.
// Voir docs/architecture/BUNDLE_BOUNDARIES.md §9.
import { storage } from '../utils/storage';

export const SESSION_USER_KEY = 'session_user';

const fingerprint = (token) => (typeof token === 'string' ? token.slice(-16) : '');

/** Le compte gardé pour CE jeton, ou null. */
export function readCachedSessionUser(token) {
  if (!token) return null;
  try {
    const parsed = JSON.parse(storage.getItem(SESSION_USER_KEY) || 'null');
    if (!parsed || parsed.t !== fingerprint(token) || typeof parsed.user !== 'object' || parsed.user === null) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

export function writeCachedSessionUser(token, user) {
  if (!token || !user) return;
  storage.setItem(SESSION_USER_KEY, JSON.stringify({ t: fingerprint(token), user }));
}

export function clearCachedSessionUser() {
  storage.removeItem(SESSION_USER_KEY);
}
