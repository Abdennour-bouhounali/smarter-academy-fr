/**
 * « الوصول والحدود » dans l'administration — la logique pure de l'éditeur.
 *
 * La page ne décide rien : elle édite une ligne, le serveur la VALIDE
 * (FeatureAccessAdminService) et la renvoie. Ce module ne fait que trois
 * choses : transformer une ligne serveur en brouillon éditable, un brouillon
 * en corps de requête, et dire si une modification RESTREINT l'accès (elle
 * demande alors une confirmation, parce qu'elle touche des élèves à la
 * requête suivante).
 */

export const TIERS = Object.freeze(['free', 'premium']);

/** Le nom d'un instrument dans le catalogue `mathlab` — convention verrouillée par le test. */
export const toolLabelKey = (toolId) => `tools.${toolId}.name`;
export const toolDescriptionKey = (toolId) => `tools.${toolId}.description`;

/** Ligne serveur → brouillon (la limite devient une chaîne pour le champ). */
export function toDraft(feature) {
  const tier = (t) => ({
    allowed: Boolean(feature[t]?.allowed),
    unlimited: feature.hasQuota ? feature[t]?.unlimited !== false : null,
    limit: feature[t]?.limit == null ? '' : String(feature[t].limit),
  });

  return { enabled: Boolean(feature.enabled), free: tier('free'), premium: tier('premium'), period: feature.period ?? 'month' };
}

/**
 * Brouillon → corps de PUT /admin/access-policies/{key}, ou une erreur
 * lisible (clé i18n) avant d'envoyer. Le serveur revérifie tout.
 *
 * @returns {{body: object|null, errorKey: string|null}}
 */
export function toPayload(feature, draft) {
  const body = { enabled: draft.enabled };
  for (const t of TIERS) {
    const tier = draft[t];
    if (!feature.hasQuota) {
      body[t] = { allowed: tier.allowed };
      continue;
    }
    if (tier.unlimited) {
      body[t] = { allowed: tier.allowed, unlimited: true };
      continue;
    }
    const raw = String(tier.limit).trim();
    if (!/^\d+$/.test(raw)) return { body: null, errorKey: 'access.errors.limitInvalid' };
    const limit = Number(raw);
    if (limit > 1_000_000) return { body: null, errorKey: 'access.errors.limitInvalid' };
    body[t] = { allowed: tier.allowed, unlimited: false, limit };
  }
  if (feature.hasQuota) body.period = draft.period;

  return { body, errorKey: null };
}

/** La valeur d'une limite comparable : illimité = +∞. */
const capacity = (tier) => (tier.unlimited ? Infinity : Number(tier.limit));

/**
 * La modification FERME-t-elle quelque chose ? Couper la fonctionnalité,
 * retirer un palier, baisser une limite, passer d'illimité à une limite,
 * ou passer au décompte « à vie ».
 */
export function isRestrictive(feature, draft) {
  const before = toDraft(feature);
  if (before.enabled && !draft.enabled) return true;
  for (const t of TIERS) {
    if (before[t].allowed && !draft[t].allowed) return true;
    if (feature.hasQuota && capacity(draft[t]) < capacity(before[t])) return true;
  }

  return Boolean(feature.hasQuota) && before.period === 'month' && draft.period === 'lifetime';
}

export function isDirty(feature, draft) {
  return JSON.stringify(toDraft(feature)) !== JSON.stringify(draft);
}
