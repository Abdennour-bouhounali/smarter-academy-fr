/**
 * Le frais de livraison d'une commande (BOOKS_STORE.md §4) : un frais par COMMANDE
 * (un seul colis), quel que soit le nombre de copies. Le tarif vient de
 * `GET /books/wilayas` (`delivery: { home, desk } | null`) ; le serveur recalcule
 * lui-même le frais, ce module ne sert qu'à l'AFFICHER avant l'envoi.
 */
export const DELIVERY_MODES = ['home', 'desk'];

/** Le frais pour ce mode, ou null (pas de wilaya, pas de tarif, mode inconnu). */
export function deliveryFeeFor(wilaya, mode) {
  if (!wilaya || !DELIVERY_MODES.includes(mode)) return null;
  // `delivery` absent : réponse d'une API plus ancienne (ou d'un cache HTTP) — même cas que « pas de tarif ».
  const fee = wilaya.delivery?.[mode];
  return Number.isFinite(fee) ? fee : null;
}

/** Prix × copies + frais (0 quand le frais est inconnu) ; une quantité vide (frappe en cours) compte 1. */
export function orderTotal(price, quantity, fee) {
  return price * (Number(quantity) || 1) + (fee ?? 0);
}
