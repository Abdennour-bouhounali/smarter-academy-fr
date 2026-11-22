<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Le prix INFORMATIF d'une version d'offre, et la durée qu'une activation
 * accorde. La plateforme n'encaisse rien (voir la migration).
 */
class PlanPrice extends Model
{
    use HasFactory;

    public const INTERVAL_MONTH = 'month';

    public const INTERVAL_YEAR = 'year';

    public const INTERVAL_ONE_TIME = 'one_time';

    public const INTERVALS = [self::INTERVAL_MONTH, self::INTERVAL_YEAR, self::INTERVAL_ONE_TIME];

    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_INACTIVE];

    protected $fillable = [
        'plan_version_id',
        'currency',
        'amount_cents',
        'billing_interval',
        'interval_count',
        'duration_days',
        'trial_days',
        'status',
        'provider_price_id',
    ];

    protected $attributes = [
        'currency' => 'DZD',
        'amount_cents' => 0,
        'billing_interval' => self::INTERVAL_YEAR,
        'interval_count' => 1,
        'trial_days' => 0,
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'interval_count' => 'integer',
            'duration_days' => 'integer',
            'trial_days' => 'integer',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class, 'plan_version_id');
    }

    /**
     * Combien de jours une activation dure sous ce prix. `one_time` sans
     * durée explicite = sans terme (null).
     */
    public function durationDays(): ?int
    {
        if ($this->duration_days !== null) {
            return $this->duration_days;
        }

        return match ($this->billing_interval) {
            self::INTERVAL_MONTH => 30 * max(1, $this->interval_count),
            self::INTERVAL_YEAR => 365 * max(1, $this->interval_count),
            default => null,
        };
    }
}
