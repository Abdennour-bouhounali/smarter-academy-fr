<?php

namespace App\Domain\Billing;

use App\Models\ProviderEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Le traitement d'un évènement, dans l'ordre — et cet ordre est le cœur de la
 * sûreté.
 *
 *   1. vérifier la signature        → invalide : RIEN n'est écrit
 *   2. traduire en types neutres
 *   3. ENREGISTRER l'évènement      → doublon : on s'arrête ici
 *   4. appliquer (transaction)
 *   5. marquer traité
 *
 * L'étape 3 précède l'étape 4, et ce n'est pas un détail : enregistrer APRÈS
 * avoir traité laisserait une fenêtre pendant laquelle une seconde livraison
 * ne verrait encore aucune trace et traiterait une deuxième fois.
 *
 * L'étape 1 précède tout le reste : un corps non signé ne doit laisser AUCUNE
 * trace en base, sinon n'importe qui pourrait remplir la table en postant des
 * corps arbitraires.
 *
 * Ce service est réutilisé tel quel par le REJEU d'administration : rejouer,
 * c'est repasser par cette même chaîne, jamais fabriquer un état à la main.
 */
class WebhookProcessor
{
    public function __construct(
        private WebhookEventRecorder $recorder,
        private ProviderSubscriptionAdapter $adapter,
    ) {}

    /** Le résultat, pour que le contrôleur choisisse son code HTTP. */
    public const OUTCOME_PROCESSED = 'processed';

    public const OUTCOME_DUPLICATE = 'duplicate';

    public const OUTCOME_IGNORED = 'ignored';

    public const OUTCOME_FAILED = 'failed';

    /**
     * @return array{outcome: string, event: ?ProviderEvent, reason: ?string}
     */
    public function handle(PaymentProvider $provider, string $rawPayload, ?string $signature): array
    {
        // ── 1. La signature, AVANT toute écriture ────────────────────────
        if (! $provider->verifySignature($rawPayload, $signature)) {
            // Journalisé comme un évènement de sécurité, sans le corps : on ne
            // recopie pas dans un journal ce qu'on refuse de stocker en base.
            Log::warning('Webhook rejeté : signature invalide.', [
                'provider' => $provider->name(),
                'bytes' => strlen($rawPayload),
            ]);

            return ['outcome' => self::OUTCOME_FAILED, 'event' => null, 'reason' => 'invalid_signature'];
        }

        $translated = $provider->translate($rawPayload);

        // ── 3. L'enregistrement EST le verrou ────────────────────────────
        ['event' => $event, 'isNew' => $isNew] = $this->recorder->record($translated, $rawPayload);

        if (! $isNew) {
            // Déjà vu. On répond succès : le fournisseur a fait son travail,
            // et lui renvoyer une erreur le ferait réessayer indéfiniment.
            return ['outcome' => self::OUTCOME_DUPLICATE, 'event' => $event, 'reason' => 'already_processed'];
        }

        return $this->apply($event, $translated);
    }

    /**
     * Applique un évènement DÉJÀ enregistré.
     *
     * Séparé de handle() parce que le rejeu d'administration entre par ici :
     * l'évènement existe, sa signature a été vérifiée lors de sa première
     * arrivée, et il faut pouvoir le repasser dans la même chaîne sans
     * re-fabriquer un corps signé.
     *
     * @return array{outcome: string, event: ProviderEvent, reason: ?string}
     */
    public function apply(ProviderEvent $event, TranslatedEvent $translated): array
    {
        // Un type qui ne nous concerne pas : tracé, non traité. Ce n'est pas
        // une erreur — c'est la majorité du trafic d'un fournisseur.
        if (! $translated->isActionable()) {
            $this->recorder->markIgnored($event, 'unhandled_type');

            return ['outcome' => self::OUTCOME_IGNORED, 'event' => $event, 'reason' => 'unhandled_type'];
        }

        try {
            $result = DB::transaction(function () use ($translated) {
                $outcome = ['subscriptionId' => null, 'action' => null, 'reason' => null];

                if ($translated->subscription !== null) {
                    $applied = $this->adapter->apply($translated->subscription);
                    $outcome['subscriptionId'] = $applied['subscription']?->id;
                    $outcome['action'] = $applied['action'];
                    $outcome['reason'] = $applied['reason'];
                }

                // Le paiement est une TRACE : il n'ouvre ni ne ferme rien.
                if ($translated->payment !== null) {
                    $payment = $this->adapter->recordPayment($translated->payment);
                    $outcome['subscriptionId'] ??= $payment?->subscription_id;
                }

                return $outcome;
            });
        } catch (Throwable $e) {
            // Échec de traitement : l'évènement reste REJOUABLE. On répond une
            // erreur au fournisseur pour qu'il réessaie de lui-même.
            $this->recorder->markFailed($event, $e->getMessage());

            Log::error('Webhook : échec de traitement.', [
                'provider' => $event->provider,
                'event_id' => $event->event_id,
                'type' => $event->type,
                'message' => $e->getMessage(),
            ]);

            return ['outcome' => self::OUTCOME_FAILED, 'event' => $event->refresh(), 'reason' => 'processing_failed'];
        }

        // Un évènement PÉRIMÉ est définitivement clos : un état plus récent a
        // déjà été appliqué, le rejouer ne ferait que revenir en arrière.
        if ($result['action'] === 'ignored') {
            $this->recorder->markIgnored($event, $result['reason'] ?? 'ignored', $result['subscriptionId']);

            return ['outcome' => self::OUTCOME_IGNORED, 'event' => $event->refresh(), 'reason' => $result['reason']];
        }

        // ── Le client n'est PAS ENCORE rattaché ──────────────────────────
        //
        // Constaté contre l'API réelle (phase 6.5) : Stripe émet
        // `customer.subscription.created` AVANT
        // `checkout.session.completed`. Au premier, aucun abonnement local ne
        // porte encore ce client, et le `client_reference_id` n'est présent
        // que sur la session — l'élève est donc introuvable.
        //
        // Marquer « ignoré » perdait l'évènement pour de bon. Il est marqué
        // ÉCHOUÉ, donc rejouable : quand la session arrive et rattache le
        // client, un rejeu de cet évènement aboutit. La chaîne convergeait
        // déjà sans cela (la session porte l'état complet), mais elle
        // dépendait d'un seul évènement ; elle en accepte maintenant deux.
        //
        // Rien n'est affaibli : sans élève identifiable, aucun accès n'est
        // ouvert, ici comme avant.
        if ($result['action'] === 'unresolved') {
            $this->recorder->markFailed($event, $result['reason'] ?? 'unresolved');

            return [
                'outcome' => self::OUTCOME_IGNORED,
                'event' => $event->refresh(),
                'reason' => $result['reason'],
            ];
        }

        $this->recorder->markProcessed($event, $result['subscriptionId']);

        return ['outcome' => self::OUTCOME_PROCESSED, 'event' => $event->refresh(), 'reason' => null];
    }
}
