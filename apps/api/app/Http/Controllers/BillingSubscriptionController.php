<?php

namespace App\Http\Controllers;

use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\SubscriptionManager;
use DomainException;
use Illuminate\Http\Request;

/**
 * La gestion de l'abonnement, côté élève — phase 7.
 *
 * Quatre points d'entrée : lire son état, ouvrir le portail hébergé, résilier
 * en fin de période, revenir sur cette résiliation.
 *
 * ── Ce que le client peut envoyer : RIEN ─────────────────────────────────
 * Aucune de ces méthodes ne lit le corps de la requête. Pas d'identifiant
 * d'abonnement, pas de client chez le fournisseur, pas d'utilisateur, pas de
 * tarif. L'élève vient du jeton, son abonnement est retrouvé à partir de lui,
 * et il n'existe aucun paramètre par lequel en désigner un autre.
 *
 * C'est une protection STRUCTURELLE contre l'IDOR : il n'y a pas de contrôle
 * d'appartenance à oublier, parce qu'il n'y a rien à faire correspondre.
 *
 * ── Aucun de ces appels n'accorde ni ne retire un accès ──────────────────
 * Résilier exprime une intention chez le fournisseur. L'accès local ne bouge
 * qu'au webhook signé — et un élève qui résilie garde ses jours payés.
 */
class BillingSubscriptionController extends Controller
{
    public function __construct(private SubscriptionManager $subscriptions) {}

    /**
     * « Où en est mon abonnement ? »
     *
     * Lecture seule, et volontairement pauvre : de quoi peindre une page,
     * jamais de quoi reconstituer un objet du fournisseur.
     */
    public function show(Request $request)
    {
        return response()->json([
            'success' => true,
            'billing' => $this->subscriptions->state($request->user()),
        ]);
    }

    /** Ouvre le portail client hébergé et rend l'URL de redirection. */
    public function portal(Request $request)
    {
        try {
            $url = $this->subscriptions->openPortal($request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (CheckoutFailedException) {
            return $this->providerUnavailable();
        }

        return response()->json(['success' => true, 'portalUrl' => $url]);
    }

    /** Programme la résiliation à la fin de la période payée. */
    public function cancel(Request $request)
    {
        try {
            $billing = $this->subscriptions->cancel($request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (CheckoutFailedException) {
            return $this->providerUnavailable();
        }

        return response()->json(['success' => true, 'billing' => $billing]);
    }

    /** Annule une résiliation programmée. */
    public function resume(Request $request)
    {
        try {
            $billing = $this->subscriptions->resume($request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (CheckoutFailedException) {
            return $this->providerUnavailable();
        }

        return response()->json(['success' => true, 'billing' => $billing]);
    }

    /**
     * Une panne du fournisseur.
     *
     * Le message d'origine reste dans le journal : il peut porter de
     * l'interne (une clé d'API dans un message d'erreur, par exemple), et
     * « réessayez » est de toute façon la seule chose actionnable.
     */
    private function providerUnavailable()
    {
        return response()->json([
            'success' => false,
            'message' => "Le service de facturation est momentanément indisponible. Réessayez dans quelques instants.",
        ], 503);
    }
}
