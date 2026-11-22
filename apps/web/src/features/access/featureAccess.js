/**
 * « الوصول والحدود » côté client — de la LECTURE, jamais une décision.
 *
 * Le serveur (FeatureAccessService) décide qui peut se servir d'un instrument
 * du مختبر, du cahier, et combien il lui reste ; il le résume dans
 * GET /me/feature-access et le rappelle dans chaque refus 403. Ce module ne
 * fait que LIRE ce résumé pour dessiner un cadenas ou un compteur.
 *
 * Il n'existe donc ici aucun « si premium alors… », aucun nombre, aucune
 * liste d'instruments payants : changer la configuration dans
 * l'administration change l'interface sans reconstruire le client.
 *
 * Politique d'ouverture tant que le résumé n'est pas arrivé : on NE ferme
 * RIEN (le serveur refusera s'il le faut, et le refus porte de quoi
 * dessiner l'état). Fermer dans le doute enfermerait un abonné dehors
 * pendant un chargement lent.
 */

export const NOTEBOOK_FEATURE = 'notebook';
export const DOCUMENTS_FEATURE = 'math_lab.documents';
export const TOOL_FEATURE_PREFIX = 'math_lab.tool.';

/** Les motifs de refus que le serveur peut rendre (FeatureDecision). */
export const ACCESS_REFUSALS = Object.freeze(['feature_disabled', 'premium_required', 'not_available', 'quota_exceeded']);

export function toolFeatureKey(toolId) {
  return `${TOOL_FEATURE_PREFIX}${toolId}`;
}

/**
 * L'état d'UNE fonctionnalité, lu dans le résumé.
 *
 * @param {object|null} summary  la réponse de /me/feature-access
 * @param {string} key
 * @returns {{known: boolean, enabled: boolean, allowed: boolean, reason: string, quota: object|null, canCreate: boolean}}
 */
export function featureState(summary, key) {
  const feature = summary?.features?.[key];
  if (!feature) {
    return { known: false, enabled: true, allowed: true, reason: 'ok', quota: null, canCreate: true };
  }
  const quota = feature.quota ?? null;
  const exhausted = quota != null && !quota.unlimited && quota.remaining <= 0;

  return {
    known: true,
    enabled: feature.enabled !== false,
    allowed: feature.allowed === true,
    reason: feature.reason ?? 'ok',
    quota,
    canCreate: feature.allowed === true && !exhausted,
  };
}

/** Un instrument est-il MONTRÉ ? Coupé globalement → retiré de l'accueil ; fermé au palier → montré, avec cadenas. */
export function isToolVisible(summary, toolId) {
  return featureState(summary, toolFeatureKey(toolId)).enabled;
}

/** Le refus d'accès porté par une erreur de service (403 `{code, access}`), ou null. */
export function refusalFromError(error) {
  const code = error?.code ?? error?.data?.code ?? null;
  if (!ACCESS_REFUSALS.includes(code)) return null;
  const access = error?.data?.access ?? null;

  return { reason: code, feature: access?.feature ?? null, quota: access?.quota ?? null };
}

/**
 * Applique un refus reçu au résumé en mémoire : le compteur affiché devient
 * juste sans second appel (le serveur a recompté sous verrou).
 */
export function withRefusal(summary, refusal) {
  if (!summary || !refusal?.feature || !summary.features?.[refusal.feature]) return summary;
  const current = summary.features[refusal.feature];

  return {
    ...summary,
    features: {
      ...summary.features,
      [refusal.feature]: {
        ...current,
        allowed: refusal.reason === 'quota_exceeded' ? current.allowed : false,
        reason: refusal.reason,
        quota: refusal.quota ?? current.quota,
      },
    },
  };
}
