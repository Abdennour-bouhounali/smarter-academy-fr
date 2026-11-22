<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Une VERSION d'offre : le jeu de limites/fonctionnalités/prix auquel un
 * abonnement se rattache pour toujours. Voir la migration.
 */
class PlanVersion extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_CURRENT = 'current';

    public const STATUS_SUPERSEDED = 'superseded';

    public const STATUSES = [self::STATUS_DRAFT, self::STATUS_CURRENT, self::STATUS_SUPERSEDED];

    protected $fillable = ['plan_id', 'version', 'status', 'notes', 'created_by', 'published_at'];

    protected $attributes = [
        'status' => self::STATUS_DRAFT,
        'version' => 1,
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function entitlements(): HasMany
    {
        return $this->hasMany(PlanEntitlement::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(PlanPrice::class);
    }

    /** Le prix affiché : le premier actif. */
    public function activePrice(): HasOne
    {
        return $this->hasOne(PlanPrice::class)->where('status', PlanPrice::STATUS_ACTIVE)->orderBy('id');
    }

    /** Les paliers de prix par élève, dans l'ordre de la grille. */
    public function pricingTiers(): HasMany
    {
        return $this->hasMany(PlanPricingTier::class)->orderBy('sort_order')->orderBy('min_students');
    }

    /**
     * Une version « par sièges » : elle porte au moins un palier actif. Son
     * prix ne se lit pas dans plan_prices mais se CALCULE du nombre d'élèves
     * choisi, et un abonnement dessus doit porter student_seat_limit.
     */
    public function isSeatBased(): bool
    {
        if ($this->relationLoaded('pricingTiers')) {
            return $this->pricingTiers->contains(fn (PlanPricingTier $t) => $t->is_active);
        }

        return $this->pricingTiers()->where('is_active', true)->exists();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Cette version est-elle FIGÉE ?
     *
     * Dès qu'un abonnement (ou un lot de codes) la référence, ses limites
     * et ses prix ne bougent plus : c'est ce qui rend « 5 classes » vrai
     * pour toujours pour qui a été activé sous ces termes.
     */
    public function isFrozen(): bool
    {
        if ($this->status === self::STATUS_SUPERSEDED) {
            return true;
        }

        return $this->subscriptions()->exists()
            || ActivationCodeBatch::where('plan_version_id', $this->id)->exists();
    }

    /**
     * Les limites/fonctionnalités de cette version, clé → valeur décodée.
     *
     * @return array<string, mixed>
     */
    public function entitlementMap(): array
    {
        $map = [];
        foreach ($this->entitlements as $row) {
            $map[$row->key] = $row->value;
        }

        return $map;
    }

    public function label(): string
    {
        return ($this->plan?->name ?? 'Offre').' v'.$this->version;
    }
}
