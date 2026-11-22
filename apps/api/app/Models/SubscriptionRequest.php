<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une DEMANDE d'offre — un geste administratif, jamais un paiement ni une
 * activation. Voir la migration.
 */
class SubscriptionRequest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_FULFILLED = 'fulfilled';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_FULFILLED,
        self::STATUS_REJECTED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'user_id',
        'requested_plan_id',
        'requested_plan_version_id',
        'requested_student_seats',
        'unit_price_cents',
        'calculated_total_cents',
        'currency',
        'status',
        'requested_at',
        'user_note',
        'reviewed_at',
        'reviewed_by',
        'rejection_reason',
        'admin_note',
        'subscription_id',
    ];

    protected $attributes = [
        'status' => self::STATUS_PENDING,
    ];

    protected function casts(): array
    {
        return [
            'requested_student_seats' => 'integer',
            'unit_price_cents' => 'integer',
            'calculated_total_cents' => 'integer',
            'requested_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'requested_plan_id');
    }

    public function planVersion(): BelongsTo
    {
        return $this->belongsTo(PlanVersion::class, 'requested_plan_version_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
