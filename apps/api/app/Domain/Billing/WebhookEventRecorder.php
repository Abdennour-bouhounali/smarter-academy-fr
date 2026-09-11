<?php

namespace App\Domain\Billing;

use App\Models\ProviderEvent;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;

/**
 * La porte d'entrée unique des évènements — et le verrou d'idempotence.
 *
 * Le problème qu'elle résout : un fournisseur livre « au moins une fois ». Le
 * même évènement peut arriver deux fois, trois fois, en parallèle. Il faut
 * garantir :
 *
 *     même évènement → traité UNE SEULE fois
 *
 * ── Pourquoi l'INSERT et pas un SELECT ───────────────────────────────────
 * La tentation est d'écrire « si l'évènement existe déjà, s'arrêter ». C'est
 * faux sous concurrence : deux livraisons simultanées passent toutes les deux
 * le SELECT avant que l'une n'ait écrit, et le traitement a lieu deux fois.
 *
 * On tente donc l'INSERT directement, et c'est l'échec de la contrainte
 * `unique(provider, event_id)` qui signale le doublon. La base sérialise les
 * écritures : une seule des deux transactions peut gagner, quel que soit
 * l'entrelacement. Le verrou est dans la base, pas dans le code, pas en
 * mémoire, pas dans un cache.
 */
class WebhookEventRecorder
{
    /**
     * Enregistre l'arrivée d'un évènement.
     *
     * @return array{event: ProviderEvent, isNew: bool}
     *         isNew=false → déjà vu, NE PAS traiter à nouveau.
     */
    public function record(TranslatedEvent $translated, string $rawPayload): array
    {
        $attributes = [
            'provider' => $translated->provider,
            'event_id' => $translated->eventId,
            'type' => $translated->type,
            'status' => ProviderEvent::STATUS_PENDING,
            'occurred_at' => $translated->occurredAt,
            'received_at' => Carbon::now(),
            'provider_object_id' => $translated->providerObjectId,
            // Une EMPREINTE, jamais le corps : il transporte des données
            // personnelles dont l'application n'a aucun usage. Elle suffit à
            // reconnaître une re-livraison dont le contenu aurait changé.
            'payload_hash' => hash('sha256', $rawPayload),
        ];

        try {
            return ['event' => ProviderEvent::create($attributes), 'isNew' => true];
        } catch (QueryException $e) {
            // Violation d'unicité = déjà vu. Toute autre erreur SQL est un vrai
            // problème et doit remonter : l'avaler ferait passer une panne de
            // base pour un doublon, et l'évènement serait perdu en silence.
            if (! $this->isUniqueViolation($e)) {
                throw $e;
            }

            $existing = ProviderEvent::where('provider', $translated->provider)
                ->where('event_id', $translated->eventId)
                ->first();

            // La course est perdue mais la ligne a disparu entre-temps :
            // impossible en pratique, mais on ne renvoie pas null à un
            // appelant qui attend un évènement.
            if ($existing === null) {
                throw $e;
            }

            return ['event' => $existing, 'isNew' => false];
        }
    }

    /** Traité avec succès. */
    public function markProcessed(ProviderEvent $event, ?int $subscriptionId = null): void
    {
        $event->update([
            'status' => ProviderEvent::STATUS_PROCESSED,
            'processed_at' => Carbon::now(),
            'subscription_id' => $subscriptionId ?? $event->subscription_id,
            'failure_reason' => null,
        ]);
    }

    /**
     * Volontairement non traité : type hors périmètre, évènement périmé,
     * client non rattachable. Rien à réparer, rien à rejouer.
     */
    public function markIgnored(ProviderEvent $event, string $reason, ?int $subscriptionId = null): void
    {
        $event->update([
            'status' => ProviderEvent::STATUS_IGNORED,
            'processed_at' => Carbon::now(),
            'subscription_id' => $subscriptionId ?? $event->subscription_id,
            'failure_reason' => $reason,
        ]);
    }

    /**
     * Le traitement a échoué — rejouable.
     *
     * `attempts` s'incrémente ici et NULLE PART ailleurs : c'est le compteur
     * qui distingue « une livraison malchanceuse » de « cet évènement échoue
     * systématiquement ».
     */
    public function markFailed(ProviderEvent $event, string $reason): void
    {
        $event->update([
            'status' => ProviderEvent::STATUS_FAILED,
            'attempts' => $event->attempts + 1,
            // Borné à la taille de la colonne : un message de fournisseur peut
            // être très long, et le tronquer vaut mieux qu'échouer à
            // enregistrer POURQUOI on a échoué.
            'failure_reason' => mb_substr($reason, 0, 500),
        ]);
    }

    private function isUniqueViolation(QueryException $e): bool
    {
        // 23000/23505 : violation de contrainte d'intégrité. Couvre MySQL
        // (1062) comme PostgreSQL et SQLite, sans dépendre du pilote.
        return in_array($e->getCode(), ['23000', '23505'], true);
    }
}
