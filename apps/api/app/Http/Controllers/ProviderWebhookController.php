<?php

namespace App\Http\Controllers;

use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\ProviderEventFormatException;
use App\Domain\Billing\WebhookProcessor;
use Illuminate\Http\Request;

/**
 * Le point d'entrée des webhooks — la seule route publique non authentifiée
 * de l'application.
 *
 * ── Ce qui l'authentifie ─────────────────────────────────────────────────
 * LA SIGNATURE, et rien d'autre. Pas de session, pas de jeton Sanctum, pas
 * d'utilisateur, pas de CSRF : un fournisseur de paiement n'a aucun de ces
 * éléments, et exiger un jeton d'un serveur tiers n'aurait aucun sens. La
 * route est donc déclarée hors des groupes authentifiés, et retire
 * explicitement les intergiciels de session (voir routes/api.php) — sans quoi
 * `statefulApi()` les appliquerait et rejetterait chaque livraison.
 *
 * ── Le corps BRUT ────────────────────────────────────────────────────────
 * `$request->getContent()` et jamais `$request->all()` : la signature porte
 * sur les octets exacts. Un JSON re-sérialisé depuis un tableau PHP est
 * sémantiquement identique et cryptographiquement différent — il ne validera
 * jamais.
 *
 * ── Ce que cette route ne fait JAMAIS ────────────────────────────────────
 * Elle n'accorde aucun accès. Elle met un abonnement à jour, et c'est la
 * chaîne existante (synchroniseur → droit → ContentAccess) qui en tire les
 * conséquences. Aucun raccourci vers `entitlements` n'existe ici.
 */
class ProviderWebhookController extends Controller
{
    public function __construct(
        private PaymentProviderRegistry $registry,
        private WebhookProcessor $processor,
    ) {}

    public function handle(Request $request, string $provider)
    {
        if (! $this->registry->has($provider)) {
            abort(404);
        }

        $payment = $this->registry->get($provider);
        $raw = $request->getContent();

        try {
            $result = $this->processor->handle(
                $payment,
                $raw,
                $request->header('Stripe-Signature') ?? $request->header('X-Provider-Signature'),
            );
        } catch (ProviderEventFormatException $e) {
            // Signé mais illisible : rejouer ne le rendra pas lisible. On
            // répond 400 sans demander de nouvelle livraison.
            return response()->json(['success' => false, 'error' => 'malformed_event'], 400);
        }

        return match ($result['outcome']) {
            // Signature invalide : 400, et aucune trace en base. Le message
            // reste muet — décrire ce qui a échoué aiderait à ajuster une
            // tentative de forge.
            WebhookProcessor::OUTCOME_FAILED => $result['event'] === null
                ? response()->json(['success' => false, 'error' => 'invalid_signature'], 400)
                // Échec de TRAITEMENT : 500 pour que le fournisseur réessaie.
                // L'évènement est enregistré et rejouable.
                : response()->json(['success' => false, 'error' => 'processing_failed'], 500),

            // Doublon et évènement ignoré sont des SUCCÈS du point de vue du
            // fournisseur : il a livré, nous avons décidé. Répondre en erreur
            // le ferait réessayer sans fin.
            default => response()->json([
                'success' => true,
                'outcome' => $result['outcome'],
            ], 200),
        };
    }
}
