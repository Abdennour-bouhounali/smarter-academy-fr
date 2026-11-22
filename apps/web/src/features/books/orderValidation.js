/**
 * Validation du formulaire de commande d'un livre, AVANT l'envoi — les mêmes règles
 * que le serveur (`BookStoreController::PHONE`, longueurs) pour qu'un client ne
 * découvre jamais une erreur après avoir appuyé. Seule erreur fatale pour une vente
 * payée à la livraison : un numéro qui ne sonne pas (on appelle chaque client).
 */

const ARABIC_DIGITS = /[٠-٩۰-۹]/g;

/** « ٠٥٥٥ 12-34.56 », « +213 555… », « 00213 555… » → « 0555123456 » ; sinon les chiffres tapés. */
export function normalizePhone(raw) {
  const digits = String(raw ?? '')
    .replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf) % 10))
    .replace(/[^\d+]/g, '');
  const local = digits.replace(/^(\+213|00213)/, '0');
  return /^[5-7]\d{8}$/.test(local) ? `0${local}` : local;
}

export const isValidPhone = (raw) => /^0[5-7]\d{8}$/.test(normalizePhone(raw));

/** Les champs requis en défaut → leur clé de message (`S.order.errors`). Vide = prêt. */
export function validateOrder(form) {
  const errors = {};
  if (String(form.customerName ?? '').trim().length < 3) errors.customerName = 'name';
  if (!isValidPhone(form.phone)) errors.phone = String(form.phone ?? '').trim() ? 'phone' : 'phoneEmpty';
  if (!form.wilaya) errors.wilaya = 'wilaya';
  if (!form.commune) errors.commune = 'commune';
  return errors;
}
