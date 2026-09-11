<?php

namespace App\Http\Controllers;

use App\Domain\Billing\CheckoutFailedException;
use App\Domain\Billing\CheckoutService;
use App\Domain\Billing\PlanCatalog;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * L'entrée en paiement, côté élève.
 *
 * Deux points d'entrée : lire les offres, et ouvrir une session de paiement.
 * Aucun des deux n'accorde le moindre accès — c'est le webhook signé qui fera
 * foi, longtemps après que cette réponse aura été rendue.
 *
 * ── Ce que le client peut envoyer ────────────────────────────────────────
 * Une clé d'offre. Strictement. La validation est une LISTE BLANCHE tirée du
 * catalogue serveur : un `price_...` arbitraire, un montant, une devise, un
 * identifiant d'utilisateur n'existent même pas comme champs acceptés, donc
 * ils ne sont jamais lus, donc ils ne peuvent rien fausser.
 *
 * L'élève, lui, vient de `$request->user()` — jamais du corps de la requête.
 * C'est ce qui rend impossible d'ouvrir un paiement au nom de quelqu'un
 * d'autre.
 */
class BillingCheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkout,
        private PlanCatalog $plans,
    ) {}

    /**
     * Les offres, et ce que cet élève peut en faire.
     *
     * Sert la page des tarifs : le frontend n'a ainsi aucune configuration de
     * facturation à dupliquer, et un changement de prix côté serveur se voit
     * sans redéploiement du bundle.
     */
    public function plans(Request $request)
    {
        return response()->json([
            'success' => true,
            'plans' => $this->plans->publicList(),
            // « Cet élève peut-il souscrire ? » — de quoi afficher un bouton
            // ou un état, sans que le client ait à le déduire lui-même.
            'status' => $this->checkout->statusFor($request->user()),
            // `test` ou `live` : l'interface doit pouvoir prévenir qu'on est
            // en mode d'essai, faute de quoi personne ne s'en aperçoit.
            'mode' => $this->plans->mode(),
        ]);
    }

    /**
     * Ouvre une session de paiement et rend l'URL de redirection.
     *
     * Ne crée aucun abonnement, aucun droit, aucune ligne de paiement. La
     * réponse est une URL, et rien d'autre.
     */
    public function start(Request $request)
    {
        $validated = $request->validate([
            // Liste blanche : seules les clés du catalogue sont acceptées.
            // C'est la barrière qui rend la falsification de tarif
            // impossible — il n'y a rien à falsifier.
            'plan' => ['required', 'string', Rule::in(array_keys(config('billing.plans', [])))],
        ], [
            'plan.in' => "Cette offre n'existe pas.",
        ]);

        try {
            $session = $this->checkout->start($request->user(), $validated['plan']);
        } catch (DomainException $e) {
            // Un refus MÉTIER : déjà abonné, offre indisponible. Le message
            // est fait pour être montré à l'élève.
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (CheckoutFailedException) {
            // Une panne du FOURNISSEUR. Le message d'origine reste dans le
            // journal : il peut porter de l'interne, et « réessayez » est de
            // toute façon la seule chose actionnable.
            return response()->json([
                'success' => false,
                'message' => "Le service de paiement est momentanément indisponible. Réessayez dans quelques instants.",
            ], 503);
        }

        return response()->json([
            'success' => true,
            // La page de paiement est HÉBERGÉE par le fournisseur : aucun
            // numéro de carte n'atteint jamais notre domaine.
            'checkoutUrl' => $session['url'],
            'plan' => $session['plan'],
        ], 201);
    }
}
