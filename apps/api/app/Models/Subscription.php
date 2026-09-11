<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * L'abonnement d'un élève — indépendant de users.account_status.
 *
 * Agnostique du fournisseur : aucune hypothèse Stripe. En lecture seule côté
 * administration dans cette version (aucun point d'entrée n'écrit ici) ;
 * ces lignes viendront d'une future intégration de paiement.
 */
class Subscription extends Model
{
    use HasFactory;

    public const STATUS_FREE = 'free';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_EXPIRED = 'expired';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_PENDING = 'pending';

    public const STATUSES = [
        self::STATUS_FREE,
        self::STATUS_ACTIVE,
        self::STATUS_EXPIRED,
        self::STATUS_CANCELLED,
        self::STATUS_PENDING,
    ];

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'started_at',
        'ends_at',
        'cancelled_at',
        'provider',
        'external_reference',
        // Les champs du fournisseur. Ils DÉCRIVENT ce que le fournisseur
        // raconte ; ils ne décident rien. L'autorité sur l'accès reste
        // `status` + `ends_at`, recopiés ensuite dans le droit.
        'provider_customer_id',
        'provider_status',
        'provider_price_id',
        'current_period_end',
        'cancel_at_period_end',
        'provider_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'current_period_end' => 'datetime',
            'provider_synced_at' => 'datetime',
            'cancel_at_period_end' => 'boolean',
        ];
    }

    /**
     * Donne-t-il accès, MAINTENANT ? La date fait foi autant que le statut :
     * un abonnement « actif » dont la fin est passée n'ouvre plus rien, même
     * si aucune tâche planifiée n'est encore venue le marquer expiré.
     */
    public function grantsAccess(): bool
    {
        if ($this->status !== self::STATUS_ACTIVE) {
            return false;
        }

        return $this->ends_at === null || $this->ends_at->isFuture();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
