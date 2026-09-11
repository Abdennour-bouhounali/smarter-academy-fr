<?php

namespace App\Domain\Admin;

use App\Domain\Access\EntitlementService;
use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Models\ProviderEvent;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

/**
 * Les évènements de fournisseur, vus de l'administration — en LECTURE, plus
 * un seul geste : REJOUER.
 *
 * À quoi cela sert : quand un élève dit « j'ai payé et je n'ai pas accès », la
 * réponse est dans cette table. Elle dit si l'évènement est arrivé, s'il a été
 * traité, s'il a échoué et pourquoi, ou s'il a été ignoré parce que périmé.
 * Sans elle, le diagnostic passe par les journaux du fournisseur et un client
 * SQL.
 *
 * ── Ce que « rejouer » veut dire ICI, et pourquoi ────────────────────────
 * Le corps de l'évènement n'est PAS conservé : il transporte des données
 * personnelles et des détails de facturation dont l'application n'a aucun
 * usage (voir la migration provider_events). Rejouer ne peut donc pas
 * consister à re-traduire un corps qu'on n'a plus.
 *
 * Ce qu'on rejoue, c'est la CONSÉQUENCE : l'abonnement local que cet évènement
 * a touché est repassé dans SubscriptionEntitlementSynchronizer, la seule et
 * même porte que le webhook emprunte. Cela satisfait exactement ce qu'on
 * attend d'un rejeu :
 *
 *   - il part de l'évènement EXISTANT (et de l'abonnement qu'il désigne) ;
 *   - il ne fabrique rien : sans abonnement local, il ne produit rien ;
 *   - il est idempotent, puisque le synchroniseur l'est ;
 *   - il passe par la chaîne normale, sans court-circuit vers `entitlements`.
 *
 * Et ce qu'il ne permet PAS : inventer un abonnement, changer une date,
 * ouvrir un accès que le fournisseur n'a pas accordé. Un administrateur ne
 * peut que redemander l'application de ce qui est déjà en base.
 *
 * Le cas « l'évènement n'a jamais été reçu » ne se répare pas ici : il se
 * répare en redemandant la livraison au fournisseur, ou avec
 * `php artisan smarter:sync-entitlements`.
 */
class ProviderEventAdminService
{
    public function __construct(
        private ActivityLogger $log,
        private SubscriptionEntitlementSynchronizer $synchronizer,
        private EntitlementService $entitlements,
    ) {}

    /** @param array<string, mixed> $filters */
    public function events(array $filters = []): LengthAwarePaginator
    {
        $query = ProviderEvent::with('subscription:id,user_id,plan,status');

        foreach (['provider', 'type', 'status'] as $field) {
            if ($value = ($filters[$field] ?? null)) {
                $query->where($field, $value);
            }
        }

        if ($from = ($filters['from'] ?? null)) {
            $query->where('received_at', '>=', $from);
        }

        if ($to = ($filters['to'] ?? null)) {
            $query->where('received_at', '<=', $to);
        }

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('event_id', 'like', "%{$search}%")
                ->orWhere('provider_object_id', 'like', "%{$search}%"));
        }

        return $query->orderByDesc('received_at')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    /** @return array<string, mixed> */
    public function summary(): array
    {
        return [
            'total' => ProviderEvent::count(),
            'processed' => ProviderEvent::where('status', ProviderEvent::STATUS_PROCESSED)->count(),
            'failed' => ProviderEvent::where('status', ProviderEvent::STATUS_FAILED)->count(),
            'ignored' => ProviderEvent::where('status', ProviderEvent::STATUS_IGNORED)->count(),
            'pending' => ProviderEvent::where('status', ProviderEvent::STATUS_PENDING)->count(),
        ];
    }

    /** @return array<string, mixed> */
    public function present(ProviderEvent $event): array
    {
        return [
            'id' => $event->id,
            'provider' => $event->provider,
            'eventId' => $event->event_id,
            'type' => $event->type,
            'status' => $event->status,
            'occurredAt' => optional($event->occurred_at)->toIso8601String(),
            'receivedAt' => optional($event->received_at)->toIso8601String(),
            'processedAt' => optional($event->processed_at)->toIso8601String(),
            'attempts' => $event->attempts,
            // Porte aussi bien le motif d'un ÉCHEC que celui d'un évènement
            // ignoré (`stale`, `unhandled_type`, `unknown_customer`).
            'failureReason' => $event->failure_reason,
            'providerObjectId' => $event->provider_object_id,
            'subscriptionId' => $event->subscription_id,
            'studentId' => $event->subscription?->user_id,
            'replayable' => $this->isReplayable($event),
            // Surtout PAS `payload_hash` : une empreinte n'apprend rien à un
            // humain, et l'exposer laisserait croire que le corps est conservé.
        ];
    }

    /**
     * Un évènement n'est rejouable que s'il désigne un abonnement local.
     *
     * Un évènement ignoré parce que son client était inconnu n'a rien touché :
     * le rejouer ne ferait rien, et proposer le bouton laisserait croire le
     * contraire.
     */
    public function isReplayable(ProviderEvent $event): bool
    {
        return $event->subscription_id !== null;
    }

    /**
     * Rejoue les conséquences d'un évènement : l'abonnement qu'il désigne est
     * repassé par le synchroniseur.
     *
     * @return array{action: string, subscriptionId: int}
     *
     * @throws DomainException si l'évènement ne désigne aucun abonnement.
     */
    public function replay(ProviderEvent $event, User $admin): array
    {
        if (! $this->isReplayable($event)) {
            throw new DomainException(
                "Cet évènement n'a touché aucun abonnement local : il n'y a rien à rejouer. "
                ."S'il aurait dû en créer un, redemandez la livraison au fournisseur."
            );
        }

        $subscription = $event->subscription;

        if ($subscription === null) {
            throw new DomainException("L'abonnement lié à cet évènement n'existe plus.");
        }

        // LA porte unique vers les droits — la même que celle du webhook.
        $result = $this->synchronizer->sync($subscription);

        $this->entitlements->forget($subscription->user);

        // Tracé : un accès qui s'ouvre ou se ferme par un geste humain doit
        // laisser le nom de qui l'a fait.
        $this->log->log(
            $admin,
            ActivityLogger::PROVIDER_EVENT_REPLAYED,
            'provider_event',
            $event->id,
            ['status' => $event->status],
            [
                'event_id' => $event->event_id,
                'provider' => $event->provider,
                'subscription_id' => $subscription->id,
                'action' => $result['action'],
                'replayed_at' => Carbon::now()->toIso8601String(),
            ],
        );

        return ['action' => $result['action'], 'subscriptionId' => $subscription->id];
    }
}
