import i18n from '../i18n';

/**
 * Le message d'erreur MONTRÉ À L'ÉLÈVE — arabe d'abord, toujours.
 *
 * ── Le problème que ce module règle ──────────────────────────────────────
 * Chaque service écrivait :
 *
 *     new ApiError(data?.message || 'Impossible de …', …)
 *
 * Les deux moitiés étaient fausses pour le produit algérien :
 *
 *  - `data.message` vient du SERVEUR, et le serveur parle français
 *    (« Email ou mot de passe incorrect. ») ou anglais, parce que Laravel
 *    n'embarque que ses traductions `en` (apps/api/lang/ ne contient que
 *    ar.json, pour le gabarit des courriels). Constaté en production : un élève qui se trompe de
 *    mot de passe lit une phrase française au milieu d'une interface arabe.
 *  - le repli était français lui aussi, donc même une panne réseau
 *    s'affichait en français.
 *
 * ── La règle ─────────────────────────────────────────────────────────────
 * Le texte affiché vient du CATALOGUE ARABE. Le `message` du serveur n'est
 * plus jamais rendu — il reste dans la réponse HTTP, visible dans l'onglet
 * réseau pour le débogage, mais il ne va pas à l'écran.
 *
 * Ce qui traverse la frontière client/serveur est un CODE, pas une phrase —
 * `reason`, `code`, ou à défaut le statut HTTP. C'est déjà le motif employé
 * par l'activation (voir activationService.js et Activation.jsx), qui est
 * la seule surface du produit à n'avoir jamais laissé passer de français.
 *
 * Pourquoi ne pas simplement traduire les chaînes PHP : parce qu'un message
 * d'erreur est une donnée d'interface, pas une donnée métier. Le serveur dit
 * CE QUI s'est passé ; c'est au client de décider comment le dire, et dans
 * quelle langue. Traduire le PHP aurait figé l'arabe dans une couche qui
 * sert aussi l'administration (francophone) et les webhooks (machines).
 */

/**
 * @param {string} key   clé sous `apiErrors` du catalogue `common`
 * @param {object} _data le corps JSON de la réponse, s'il y en a un
 * @param {number|null} status
 * @returns {string} un texte arabe, jamais une phrase du serveur
 */
export function apiMessage(key, _data = null, status = null) {
  // 429 a son propre message : « réessayez » sans dire quoi attendre serait
  // une invitation à marteler le bouton.
  if (status === 429) {
    return i18n.t('apiErrors.rateLimited', { ns: 'common' });
  }

  const text = i18n.t(`apiErrors.${key}`, { ns: 'common', defaultValue: '' });
  return text || i18n.t('apiErrors.generic', { ns: 'common' });
}
