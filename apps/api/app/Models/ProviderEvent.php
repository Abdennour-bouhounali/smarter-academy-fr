<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un évènement reçu d'un fournisseur de paiement — la mémoire de ce qui a
 * déjà été traité.
 *
 * Ce modèle ne décide rien. Il EST le registre qui rend le traitement
 * idempotent : son unicité `(provider, event_id)` est ce qui garantit qu'un
 * évènement livré trois fois ne produit qu'un seul effet.
 *
 * Il ne conserve pas le corps de l'évènement, seulement son empreinte — voir
 * la migration pour le pourquoi.
 */
class ProviderEvent extends Model
{
    use HasFactory;

    /** Reçu, pas encore traité. */
    public const STATUS_PENDING = 'pending';

    /** Traité avec succès. Un rejeu ne doit rien changer. */
    public const STATUS_PROCESSED = 'processed';

    /** Le traitement a échoué — rejouable. */
    public const STATUS_FAILED = 'failed';

    /**
     * Volontairement non traité : soit un type d'évènement qui ne nous
     * concerne pas, soit un évènement PÉRIMÉ (arrivé après un plus récent).
     * Distinct de `failed` : il n'y a rien à réparer, et rien à rejouer.
     */
    public const STATUS_IGNORED = 'ignored';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_PROCESSED,
        self::STATUS_FAILED,
        self::STATUS_IGNORED,
    ];

    protected $fillable = [
        'provider',
        'event_id',
        'type',
        'status',
        'occurred_at',
        'received_at',
        'processed_at',
        'attempts',
        'failure_reason',
        'subscription_id',
        'provider_object_id',
        'payload_hash',
    ];

    /**
     * Défaut porté par le modèle et pas seulement par la colonne : une
     * instance neuve porterait sinon `status = NULL` en mémoire, et tout test
     * écrit en liste blanche la lirait comme un état inconnu.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => self::STATUS_PENDING,
        'attempts' => 0,
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'received_at' => 'datetime',
            'processed_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
