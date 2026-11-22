import i18n from '../i18n';

/**
 * Le message d'erreur MONTRÉ À LA PERSONNE — une phrase française écrite pour elle, toujours.
 *
 * ── D'où vient ce module ─────────────────────────────────────────────────
 * Chaque service écrivait `new ApiError(data?.message || 'Impossible de …', …)`. Sur la plateforme algérienne, le
 * serveur parlait français dans une interface arabe : ce module cachait donc TOUTE phrase du serveur. Le serveur de
 * ce produit parle français (apps/api : messages, courriels et validations en français), mais une partie de ses
 * `message` restent des phrases pour un développeur (« Charge utile de preuve obsolète… »), des codes bruts
 * (`not_found`) ou des mots qui ne sont pas ceux de l'interface (FRENCH_LANGUAGE_CONTRACT.md §3).
 *
 * ── La règle ─────────────────────────────────────────────────────────────
 * 1. 429 : `apiErrors.rateLimited`, toujours (« réessayez » sans dire d'attendre inviterait à marteler le bouton).
 * 2. La phrase du SERVEUR est montrée seulement quand la réponse porte un code (`code` ou `reason`) de la liste
 *    SERVER_SENTENCE_CODES ci-dessous — des codes dont la phrase a été relue : elle s'adresse à la personne, avec les
 *    mots de l'interface — ET que son `message` est bien une phrase (pas le code lui-même, pas de lettre arabe, une
 *    ponctuation finale, 240 caractères au plus).
 * 3. Sinon, la phrase du CLIENT : `apiErrors.<clé>` du catalogue `common`, à défaut `apiErrors.generic`. Le
 *    `message` du serveur reste dans la réponse HTTP (onglet réseau), il ne va pas à l'écran.
 *
 * Un code entre dans la liste quand sa phrase serveur est relue ; une page qui choisit sa propre phrase d'après
 * `reason` (l'activation, la classe) continue de le faire, et ce module ne s'en mêle pas.
 */
export const SERVER_SENTENCE_CODES = Object.freeze([
  // RegistrationGate::CLOSED_CODE — « La plateforme est en test : les inscriptions sont fermées pour le moment. »
  'registration_closed',
  // PaymentGate::CLOSED_CODE — « Le paiement en ligne n’est pas ouvert. »
  'payments_closed',
  // ClassroomException — « Cette classe n'accepte plus de nouvel élève. »
  'joining_closed',
  // ClassroomException — « Cette classe est archivée. »
  'class_inactive',
  // ClassroomException — « Seul un compte élève peut rejoindre une classe. »
  'not_a_student',
]);

const MAX_SENTENCE = 240;
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** La phrase du serveur, si la règle 2 permet de la montrer ; sinon null. */
export function serverSentence(data) {
  if (!data || typeof data !== 'object') return null;
  const code = [data.code, data.reason].find((value) => typeof value === 'string' && SERVER_SENTENCE_CODES.includes(value));
  if (!code) return null;
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (!message || message === code || message.length > MAX_SENTENCE) return null;
  if (ARABIC.test(message) || !/[.!?…»]$/u.test(message)) return null;
  return message;
}

/**
 * @param {string} key   clé sous `apiErrors` du catalogue `common`
 * @param {object} data  le corps JSON de la réponse, s'il y en a un
 * @param {number|null} status
 * @returns {string} une phrase française : celle du serveur pour un code connu, sinon celle du client
 */
export function apiMessage(key, data = null, status = null) {
  if (status === 429) {
    return i18n.t('apiErrors.rateLimited', { ns: 'common' });
  }

  const fromServer = serverSentence(data);
  if (fromServer) return fromServer;

  // `exists`, not a `defaultValue: ''`: with `returnEmptyString: false` (i18n/index.js) an empty default gives back
  // the raw key, which reached the screen for an unknown key.
  const known = i18n.exists(`apiErrors.${key}`, { ns: 'common' });
  return i18n.t(known ? `apiErrors.${key}` : 'apiErrors.generic', { ns: 'common' });
}
