/**
 * L'état de « عرضي », dérivé PUREMENT de ce que le serveur rend — aucune
 * règle commerciale ici. Cinq états d'affichage :
 *
 *   free       — l'offre par défaut, sans abonnement
 *   active     — un abonnement court (actif, en essai, ou annulé jusqu'à sa fin)
 *   suspended  — l'administration a suspendu ; l'offre effective est retombée
 *   pending    — une demande attend une décision humaine (jamais une activation)
 *   rejected   — la dernière demande a été refusée, avec son motif
 *
 * `pending` et `rejected` se cumulent avec `free`/`active` : un abonné peut
 * demander une autre offre.
 */
export function deriveSubscriptionState({ entitlements, requests = [], subscriptions = [] }) {
  const plan = entitlements?.plan ?? null;
  const pending = entitlements?.request ?? requests.find((r) => r.status === 'pending') ?? null;
  const latest = requests[0] ?? null;
  const rejected = !pending && latest?.status === 'rejected' ? latest : null;
  const suspended = subscriptions.find((s) => s.status === 'suspended') ?? null;

  let base = 'free';
  if (plan?.source === 'subscription') base = 'active';
  else if (suspended) base = 'suspended';

  return {
    base,
    plan,
    pending,
    rejected,
    suspended,
    canRequest: !pending,
  };
}

/** Le prix informatif en dinars, ou null si l'offre est gratuite. */
export function informationalPrice(price) {
  if (!price || !price.amountCents) return null;
  return { amount: Math.round(price.amountCents / 100), currency: price.currency || 'DZD', interval: price.billingInterval };
}
