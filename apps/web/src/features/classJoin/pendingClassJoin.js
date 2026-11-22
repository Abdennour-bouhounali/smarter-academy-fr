/**
 * Le LIEN DE CLASSE, côté navigateur — `/rejoindre/classe/{jeton}`.
 *
 * Un élève ouvre le lien sans session, lit ce que son enseignant verra, et
 * appuie sur le bouton d’accord de la page d’inscription ou de connexion. Ce geste EST le
 * consentement ; il doit survivre à l'inscription, à la connexion (mot de
 * passe ou Google, qui quitte la page) et à la vérification d'adresse. On le
 * garde ici, dans localStorage, avec une durée de vie bornée :
 *
 *   savePendingClassJoin   au clic, sur la page du lien (jeton vérifié)
 *   postAuthPath           où va l'utilisateur qui vient de s'authentifier :
 *                          un élève vérifié avec une adhésion en attente
 *                          retourne sur la page du lien, qui rejoint seule
 *   clearPendingClassJoin  dès que la page du lien a tenté l'adhésion
 *
 * Aucune redirection ouverte : on ne lit jamais d'URL venue de la requête
 * (`?next=`). Le seul chemin produit est `/rejoindre/classe/` + un jeton qui
 * a passé JOIN_LINK_PATTERN. Le serveur, lui, revalide le jeton et exige
 * `consent: true` : ce module ne fait que conduire l'élève.
 *
 * Le navigateur peut perdre cet état (lien de vérification ouvert dans
 * l'application Gmail) : le serveur garde aussi l'intention, transmise à
 * l'inscription (`classJoinLink`), et rejoint à la vérification
 * (PendingClassJoin côté API). Les deux chemins sont idempotents.
 */

const STORAGE_KEY = 'sa.pendingClassJoin';

/** Une semaine : le temps de vérifier son adresse, pas d'y revenir un mois après. */
export const PENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Le format du jeton, identique au serveur (JoinLinkToken : 32 base62). */
const JOIN_LINK_PATTERN = /^[A-Za-z0-9]{32}$/;

export function isJoinLinkToken(value) {
  return typeof value === 'string' && JOIN_LINK_PATTERN.test(value);
}

export function joinLinkPath(token) {
  return `/rejoindre/classe/${token}`;
}

/** L'URL complète que l'enseignant partage — sur l'origine où il se trouve. */
export function joinLinkUrl(origin, token) {
  return `${String(origin ?? '').replace(/\/+$/, '')}${joinLinkPath(token)}`;
}

function storageOrNull(storage) {
  if (storage) return storage;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/**
 * L'élève a consenti sur la page du lien. `classroomName` ne sert qu'à
 * l'affichage (« tu vas rejoindre la classe … ») ; le serveur ne le lit jamais.
 */
export function savePendingClassJoin({ token, classroomName = '' }, storage = null, now = Date.now()) {
  if (!isJoinLinkToken(token)) return false;
  const store = storageOrNull(storage);
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({
      token,
      classroomName: String(classroomName ?? '').slice(0, 120),
      consented: true,
      savedAt: now,
    }));
    return true;
  } catch {
    return false;
  }
}

/** L'adhésion en attente, ou null (absente, périmée ou altérée — alors effacée). */
export function readPendingClassJoin(storage = null, now = Date.now()) {
  const store = storageOrNull(storage);
  if (!store) return null;
  let parsed = null;
  try {
    parsed = JSON.parse(store.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    parsed = null;
  }
  if (parsed === null) return null;

  const valid = parsed
    && isJoinLinkToken(parsed.token)
    && parsed.consented === true
    && Number.isFinite(parsed.savedAt)
    && now - parsed.savedAt >= 0
    && now - parsed.savedAt <= PENDING_TTL_MS;

  if (!valid) {
    clearPendingClassJoin(store);
    return null;
  }
  return { token: parsed.token, classroomName: parsed.classroomName ?? '', consented: true, savedAt: parsed.savedAt };
}

export function clearPendingClassJoin(storage = null) {
  const store = storageOrNull(storage);
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    /* rien à effacer */
  }
}

/**
 * Où conduire un utilisateur qui vient de s'authentifier (connexion,
 * inscription, Google, adresse vérifiée).
 *
 * Seul un ÉLÈVE à l'adresse vérifiée est renvoyé vers le lien : sans adresse
 * prouvée, le serveur refuserait l'adhésion — l'élève passe d'abord par
 * /verification-email, dont la sortie rappelle cette fonction.
 */
export function postAuthPath(user, fallback, storage = null, now = Date.now()) {
  if (user?.role !== 'student' || user.emailVerified === false) return fallback;
  const pending = readPendingClassJoin(storage, now);
  return pending ? joinLinkPath(pending.token) : fallback;
}

/**
 * Le corps de l'adhésion AUTOMATIQUE à l'arrivée sur la page du lien, ou null.
 * Elle n'a lieu que si l'élève a consenti, par un geste, POUR CE LIEN-LÀ :
 * ouvrir un lien ne vaut jamais consentement.
 */
export function autoJoinRequest(pending, routeToken) {
  if (!pending || pending.consented !== true) return null;
  if (!isJoinLinkToken(routeToken) || pending.token !== routeToken) return null;
  return { link: routeToken, consent: true };
}
