<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Une OFFRE commerciale, configurée par l'administration.
 *
 * L'identité seulement : les limites vivent dans PlanVersion →
 * PlanEntitlement, le prix informatif dans PlanPrice. Voir la migration.
 */
class Plan extends Model
{
    use HasFactory;

    public const TYPE_STUDENT = 'student';

    public const TYPE_TEACHER = 'teacher';

    public const TYPES = [self::TYPE_STUDENT, self::TYPE_TEACHER];

    /** En préparation : invisible, non activable. */
    public const STATUS_DRAFT = 'draft';

    /** Proposée : demandable, activable, imprimable en lot. */
    public const STATUS_ACTIVE = 'active';

    /** Retirée de l'affichage public mais toujours activable par l'administration. */
    public const STATUS_HIDDEN = 'hidden';

    /** Historique : plus jamais activée ; les abonnements existants la gardent. */
    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_ACTIVE,
        self::STATUS_HIDDEN,
        self::STATUS_ARCHIVED,
    ];

    protected $fillable = [
        'slug',
        'name',
        'description',
        'type',
        'status',
        'display_order',
        'is_public',
        'is_default',
        'allows_requests',
    ];

    protected $attributes = [
        'status' => self::STATUS_DRAFT,
        'display_order' => 0,
        'is_public' => false,
        'is_default' => false,
        'allows_requests' => true,
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_public' => 'boolean',
            'is_default' => 'boolean',
            'allows_requests' => 'boolean',
        ];
    }

    public function versions(): HasMany
    {
        return $this->hasMany(PlanVersion::class)->orderByDesc('version');
    }

    /** La version servie aux NOUVELLES activations. */
    public function currentVersion(): HasOne
    {
        return $this->hasOne(PlanVersion::class)->where('status', PlanVersion::STATUS_CURRENT);
    }

    public function subscriptionRequests(): HasMany
    {
        return $this->hasMany(SubscriptionRequest::class, 'requested_plan_id');
    }

    /**
     * Peut-on encore ACTIVER cette offre (à la main ou par code) ?
     * Liste blanche : archivée ou en brouillon, non.
     */
    public function isActivatable(): bool
    {
        return in_array($this->status, [self::STATUS_ACTIVE, self::STATUS_HIDDEN], true);
    }

    /** Un utilisateur peut-il la DEMANDER depuis la plateforme ? */
    public function isRequestable(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->is_public
            && $this->allows_requests
            && ! $this->is_default;
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVE)->where('is_public', true);
    }
}
