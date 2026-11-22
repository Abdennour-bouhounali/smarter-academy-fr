import { call, get, send, query } from './adminClient';

/**
 * Les OFFRES : le modèle commercial, configuré depuis le panneau. Aucun prix
 * ici n'est un tarif de fournisseur — tout est informatif, en dinars.
 */
export function fetchEntitlementKeys(token) {
  return call('/admin/entitlements/keys', get(token), 'Impossible de charger le vocabulaire des offres.').then((d) => d.keys);
}

export function fetchPlans(token, filters = {}) {
  return call(`/admin/plans${query(filters)}`, get(token), 'Impossible de charger les offres.');
}

export function fetchPlan(token, id) {
  return call(`/admin/plans/${encodeURIComponent(id)}`, get(token), 'Impossible de charger l’offre.');
}

export function createPlan(token, payload) {
  return call('/admin/plans', send('POST', token, payload), 'Impossible de créer l’offre.').then((d) => d.plan);
}

export function updatePlan(token, id, payload) {
  return call(`/admin/plans/${encodeURIComponent(id)}`, send('PATCH', token, payload), 'Impossible de modifier l’offre.').then((d) => d.plan);
}

export function changePlanStatus(token, id, status) {
  return call(`/admin/plans/${encodeURIComponent(id)}/status`, send('PATCH', token, { status }), 'Impossible de changer l’état de l’offre.').then((d) => d.plan);
}

export function duplicatePlan(token, id, name) {
  return call(`/admin/plans/${encodeURIComponent(id)}/duplicate`, send('POST', token, { name }), 'Impossible de dupliquer l’offre.').then((d) => d.plan);
}

export function createPlanVersion(token, id, notes) {
  return call(`/admin/plans/${encodeURIComponent(id)}/versions`, send('POST', token, { notes }), 'Impossible de créer la version.').then((d) => d.version);
}

export function updatePlanVersion(token, versionId, { entitlements, price, notes, pricingTiers }) {
  return call(`/admin/plan-versions/${encodeURIComponent(versionId)}`, send('PATCH', token, { entitlements, price, notes, pricingTiers }), 'Impossible de modifier la version.').then((d) => d.version);
}

/** L'aperçu SERVEUR : pour N élèves, le palier, le prix unitaire et le total — par le calcul qui fait foi. */
export function fetchPricingQuote(token, versionId, seats) {
  return call(`/admin/plan-versions/${encodeURIComponent(versionId)}/pricing/quote?seats=${encodeURIComponent(seats)}`, get(token), 'Impossible de calculer l’aperçu.').then((d) => d.quote);
}

export function publishPlanVersion(token, versionId) {
  return call(`/admin/plan-versions/${encodeURIComponent(versionId)}/publish`, send('POST', token), 'Impossible de publier la version.').then((d) => d.version);
}
