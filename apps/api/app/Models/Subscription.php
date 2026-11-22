<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

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

    /** Période d'essai en cours : ouvre l'accès comme `active`. */
    public const STATUS_TRIALING = 'trialing';

    /**
     * Suspendu par l'administration : l'accès est fermé, la ligne reste.
     * Reprendre rend `active`. Distinct de `cancelled` (qui honore la
     * période payée) et de `expired` (le temps a fait son œuvre).
     */
    public const STATUS_SUSPENDED = 'suspended';

    public const STATUSES = [
        self::STATUS_FREE,
        self::STATUS_ACTIVE,
        self::STATUS_EXPIRED,
        self::STATUS_CANCELLED,
        self::STATUS_PENDING,
        self::STATUS_TRIALING,
        self::STATUS_SUSPENDED,
    ];

    /** Les fournisseurs « manuels » : ceux que l'administration pilote elle-même. */
    public const PROVIDER_MANUAL = 'manual';

    public const PROVIDER_ACTIVATION_CODE = 'activation_code';

    public const MANUAL_PROVIDERS = [self::PROVIDER_MANUAL, self::PROVIDER_ACTIVATION_CODE];

    /** Comment l'abonnement a été accordé — des métadonnées, pas un paiement. */
    public const SOURCE_MANUAL_ADMIN_ACTIVATION = 'manual_admin_activation';

    public const SOURCE_ACTIVATION_CODE = 'activation_code';

    public const SOURCE_PROVIDER = 'provider';

    public const SOURCE_PROMOTION = 'promotion';

    public const SOURCE_PARTNERSHIP = 'partnership';

    public const SOURCE_OTHER = 'other';

    public const ACQUISITION_SOURCES = [
        self::SOURCE_MANUAL_ADMIN_ACTIVATION,
        self::SOURCE_ACTIVATION_CODE,
        self::SOURCE_PROVIDER,
        self::SOURCE_PROMOTION,
        self::SOURCE_PARTNERSHIP,
        self::SOURCE_OTHER,
    ];

    protected $fillable = [
        'user_id',
        'plan',
        'plan_version_id',
        // La CAPACITÉ achetée et son prix, figés à l'activation (voir la
        // migration 2026_09_27_000002). NULL = lire la version.
        'student_seat_limit',
        'seat_unit_price_cents',
        'seat_total_cents',
        'seat_currency',
        'acquisition_source',
        'granted_by',
        'activation_note',
        'status',
        'started_at',
        'ends_at',
        'cancelled_at',
        'suspended_at',
        'trial_ends_at',
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
            'student_seat_limit' => 'integer',
            'seat_unit_price_cents' => 'integer',
            'seat_total_cents' => 'integer',
            'started_at' => 'datetime',
            'ends_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'suspended_at' => 'datetime',
            'trial_ends_at' => 'datetime',
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
        if (! in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIALING], true)) {
            return false;
        }

        return $this->ends_at === null || $this->ends_at->isFuture();
    }

    /**
     * Cet abonnement COURT-il encore — ouvre-t-il des limites d'offre ?
     *
     * Plus large que grantsAccess() sur un point : `cancelled` avec une fin
     * encore à venir court toujours (la période accordée est due), exactement
     * comme SubscriptionEntitlementSynchronizer le juge pour le droit d'accès.
     */
    public function isRunning(?Carbon $now = null): bool
    {
        $now ??= now();

        if (in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_TRIALING], true)) {
            return $this->ends_at === null || $this->ends_at->greaterThan($now);
        }

        if ($this->status === self::STATUS_CANCELLED) {
            return $this->ends_at !== null && $this->ends_at->greaterThan($now);
        }

        return false;
    }

    /** Piloté par l'administration (activation manuelle ou code), pas par un fournisseur. */
    public function isManual(): bool
    {
        return in_array($this->provider, self::MANUAL_PROVIDERS, true);
    }

    public function scopeManual(Builder $query): Builder
    {
        return $query->whereIn('provider', self::MANUAL_PROVIDERS);
    }

    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class);
    }

    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
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
