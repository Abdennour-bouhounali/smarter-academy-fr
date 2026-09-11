import { apiRequest, ApiError, classifyStatus } from './apiClient';

/**
 * L'entrée en paiement, côté client.
 *
 * Ce module n'accorde RIEN. Il demande au serveur d'ouvrir une session de
 * paiement et rend l'URL où rediriger. L'accès premium, lui, s'ouvrira
 * beaucoup plus tard — quand le webhook signé aura atteint le serveur.
 *
 * ── Ce que le client n'envoie jamais ─────────────────────────────────────
 * Ni tarif, ni montant, ni devise, ni identifiant d'utilisateur. Une CLÉ
 * D'OFFRE (`annual`), et c'est tout : le serveur décide du reste. Envoyer un
 * prix depuis le navigateur reviendrait à laisser l'acheteur fixer le prix.
 */

/**
 * Les offres, et ce que cet élève peut en faire.
 *
 * Servies par le serveur plutôt que codées dans le bundle : un changement de
 * tarif ne doit pas attendre un redéploiement du frontend, et deux
 * définitions du prix finiraient par diverger.
 */
export async function fetchPlans(token) {
  const { ok, status, data } = await apiRequest('/billing/plans', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(
      data?.message || 'Impossible de charger les offres.',
      classifyStatus(status),
      status,
    );
  }

  return {
    plans: data.plans ?? [],
    status: data.status ?? null,
    mode: data.mode ?? 'test',
  };
}

/**
 * Ouvre une session de paiement et rend l'URL de redirection.
 *
 * Le serveur peut refuser pour une raison MÉTIER (déjà abonné, offre
 * indisponible) : son message est fait pour être montré tel quel à l'élève.
 * Une panne du fournisseur (503) rend un message neutre — le détail reste
 * dans les journaux du serveur.
 *
 * @param {string} token
 * @param {string} planKey  la clé interne de l'offre — jamais un prix
 * @returns {Promise<{checkoutUrl: string, plan: string}>}
 */
export async function startCheckout(token, planKey) {
  const { ok, status, data } = await apiRequest('/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    // Une clé d'offre. Rien d'autre ne serait lu de toute façon : le
    // contrôleur valide en liste blanche et ignore tout le reste.
    body: JSON.stringify({ plan: planKey }),
  });

  if (!ok) {
    throw new ApiError(
      data?.message || "Le paiement n'a pas pu être ouvert.",
      classifyStatus(status),
      status,
    );
  }

  if (!data?.checkoutUrl) {
    // Une réponse sans URL est inexploitable : rediriger vers `undefined`
    // enverrait l'élève sur une page d'erreur sans explication.
    throw new ApiError("Le service de paiement n'a pas répondu correctement.", 'SERVER_ERROR', 502);
  }

  return { checkoutUrl: data.checkoutUrl, plan: data.plan };
}

/**
 * L'état de facturation de l'élève — phase 7.
 *
 * Tout vient du SERVEUR, y compris « l'accès est-il actif ». Le navigateur ne
 * compare aucune date et ne déduit aucun droit : il peint ce qu'on lui dit.
 * Une horloge de poste mal réglée ne doit pas pouvoir ouvrir ni fermer une
 * page d'abonnement.
 */
export async function fetchSubscription(token) {
  const { ok, status, data } = await apiRequest('/billing/subscription', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(
      data?.message || "Impossible de charger votre abonnement.",
      classifyStatus(status),
      status,
    );
  }

  return data.billing ?? null;
}

/**
 * Ouvre le portail client hébergé et rend l'URL de redirection.
 *
 * Aucun identifiant n'est envoyé : le serveur retrouve le client du
 * fournisseur à partir de l'élève authentifié. C'est ce qui rend impossible
 * d'ouvrir le portail de quelqu'un d'autre — il n'y a rien à falsifier.
 */
export async function openBillingPortal(token) {
  const { ok, status, data } = await apiRequest('/billing/portal', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(
      data?.message || "Le portail de facturation n'a pas pu être ouvert.",
      classifyStatus(status),
      status,
    );
  }

  if (!data?.portalUrl) {
    throw new ApiError("Le service de facturation n'a pas répondu correctement.", 'SERVER_ERROR', 502);
  }

  return data.portalUrl;
}

/**
 * Résilie à la fin de la période payée.
 *
 * Ne retire AUCUN accès : l'élève garde ses jours déjà payés. La réponse rend
 * l'état de facturation à jour, pour que la page n'ait pas à le redemander.
 */
export async function cancelSubscription(token) {
  return mutateSubscription(token, '/billing/subscription/cancel', "La résiliation n'a pas pu être enregistrée.");
}

/** Annule une résiliation programmée — « je continue, finalement ». */
export async function resumeSubscription(token) {
  return mutateSubscription(token, '/billing/subscription/resume', "La reprise n'a pas pu être enregistrée.");
}

async function mutateSubscription(token, path, fallbackMessage) {
  const { ok, status, data } = await apiRequest(path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!ok) {
    throw new ApiError(data?.message || fallbackMessage, classifyStatus(status), status);
  }

  return data.billing ?? null;
}
