import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useContentAvailability } from '../context/ContentAvailabilityContext';

/**
 * « Cet élève a-t-il déjà payé ? » — la question posée par toute l'interface,
 * et une seule réponse pour tout le monde.
 *
 * Elle vient du SERVEUR et de lui seul : `access` est le résumé rendu par
 * GET /content/availability, lui-même produit par EntitlementService::summarize.
 * Rien ici ne déduit un droit — ni du palier d'une leçon, ni de l'URL, ni du
 * stockage local, ni de la présence d'un bouton de paiement. Ce module LIT une
 * décision déjà prise ailleurs.
 *
 * Le hook existe pour que ce soit vrai UNE fois. Avant lui, chaque page
 * réécrivait `access?.premiumAccess === true` — six copies d'une même règle,
 * donc six occasions d'en oublier une le jour où elle change (et c'est
 * exactement ce qui était arrivé à la barre latérale, qui proposait
 * « Passer Premium » à un abonné).
 *
 * TROIS PUBLICS, pas deux — l'interface d'acquisition et l'interface de compte
 * ne s'adressent pas aux mêmes gens :
 *
 *   anonymous  — visiteur sans compte : découverte publique, tarifs intacts
 *   free       — connecté, sans droit premium : l'offre reste visible
 *   premium    — connecté ET payé : plus rien à vendre, tout à gérer
 *
 * POLITIQUE D'OUVERTURE, identique au reste du contexte : tant que la réponse
 * n'est pas arrivée (`access === null`), on ne sait pas. On ne prétend donc
 * pas que l'élève est abonné, mais on ne lui jette pas non plus une bannière
 * d'achat à la figure — `isResolved` permet aux appelants d'attendre avant de
 * peindre une invitation à payer. Le serveur, lui, reste l'autorité : il
 * refusera de toute façon l'accès au contenu non couvert.
 */
export function usePremiumStatus() {
  const { user } = useContext(AuthContext);
  const { access } = useContentAvailability();

  return useMemo(() => {
    const isAuthenticated = Boolean(user);
    const isPremium = access?.premiumAccess === true;

    return {
      /** L'élève a un droit premium ACTIF, quelle qu'en soit l'origine. */
      isPremium,
      /** Abonnement payant en cours — distinct d'un accès offert. */
      hasSubscription: access?.subscriptionActive === true,
      /** Accès accordé par l'administration : ce n'est PAS un abonnement. */
      hasAdminOverride: access?.adminOverrideActive === true,
      /** Fin du droit en cours, s'il a un terme (ISO 8601), sinon null. */
      expiresAt: access?.expiresAt ?? null,
      /** La réponse du serveur est-elle arrivée ? */
      isResolved: access !== null,
      /**
       * Peut-on lui proposer l'abonnement ? Faux pour un abonné (il l'a déjà)
       * ET tant qu'on ne sait pas encore (on n'invite pas à payer dans le
       * doute). Un visiteur anonyme, lui, garde la découverte publique : il
       * n'a pas d'état d'accès à attendre.
       */
      canSeeUpgrade: !isAuthenticated || (access !== null && !isPremium),
      /** 'anonymous' | 'free' | 'premium' — le public auquel on s'adresse. */
      audience: !isAuthenticated ? 'anonymous' : isPremium ? 'premium' : 'free',
    };
  }, [access, user]);
}

export default usePremiumStatus;
