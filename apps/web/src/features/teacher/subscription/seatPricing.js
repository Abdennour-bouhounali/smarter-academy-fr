/**
 * Le calcul PAR SIÈGES, côté client — pour l'aperçu immédiat seulement.
 *
 * La grille vient du serveur (plan.pricingTiers) ; le même calcul y est
 * refait et validé à la demande comme à l'activation : le client n'est
 * jamais l'autorité sur un prix. Aucun nombre ici — ni 5, ni 1000.
 */

/** Le palier qui couvre `seats`, ou null. */
export function applicableTier(tiers = [], seats) {
  const n = Number(seats);
  if (!Number.isInteger(n) || n < 1) return null;
  return tiers.find((t) => t.isActive !== false && n >= t.minStudents && (t.maxStudents === null || t.maxStudents === undefined || n <= t.maxStudents)) ?? null;
}

/**
 * Le devis d'affichage : { seats, tier, unitPriceCents, totalCents, currency, free }
 * ou null si aucun palier ne couvre le nombre.
 */
export function quoteSeats(tiers = [], seats) {
  const tier = applicableTier(tiers, seats);
  if (!tier) return null;
  const n = Number(seats);
  const unit = Number(tier.pricePerStudentCents ?? 0);
  return { seats: n, tier, unitPriceCents: unit, totalCents: unit * n, currency: tier.currency || 'DZD', free: unit === 0 };
}

/** Le plus grand nombre que la grille couvre (null = sans borne). */
export function maxCoveredSeats(tiers = []) {
  const active = tiers.filter((t) => t.isActive !== false);
  if (active.length === 0) return 0;
  if (active.some((t) => t.maxStudents === null || t.maxStudents === undefined)) return null;
  return Math.max(...active.map((t) => t.maxStudents));
}

/**
 * Le premier nombre qui vaut la peine d'être demandé : au-delà de ce que le
 * gratuit accorde déjà (freeSeats), et couvert par la grille.
 */
export function firstRequestableSeats(tiers = [], freeSeats) {
  const floor = Number.isInteger(freeSeats) ? freeSeats + 1 : 1;
  const active = tiers.filter((t) => t.isActive !== false);
  const min = active.length ? Math.min(...active.map((t) => t.minStudents)) : 1;
  return Math.max(floor, min);
}

export { formatDzd } from '../../../utils/dinars';

/** « 6–20 » ou « 101+ » pour un palier. */
export function tierLabel(tier) {
  if (!tier) return '';
  if (tier.label) return tier.label;
  return tier.maxStudents === null || tier.maxStudents === undefined ? `${tier.minStudents}+` : `${tier.minStudents}–${tier.maxStudents}`;
}
