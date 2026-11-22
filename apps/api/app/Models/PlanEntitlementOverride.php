<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Une dérogation individuelle sur une limite/fonctionnalité. Voir la migration.
 */
class PlanEntitlementOverride extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subscription_id',
        'key',
        'value',
        'reason',
        'starts_at',
        'ends_at',
        'created_by',
        'revoked_at',
        'revoked_by',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'json',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    /** Mêmes bornes qu'Entitlement::isValid() : début inclus, fin exclue. */
    public function isActive(?Carbon $now = null): bool
    {
        if ($this->revoked_at !== null) {
            return false;
        }

        $now ??= Carbon::now();

        if ($this->starts_at !== null && $this->starts_at->greaterThan($now)) {
            return false;
        }

        if ($this->ends_at !== null && $this->ends_at->lessThanOrEqualTo($now)) {
            return false;
        }

        return true;
    }

    public function scopeActiveNow(Builder $query, ?Carbon $now = null): Builder
    {
        $now ??= Carbon::now();

        return $query->whereNull('revoked_at')
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now));
    }
}
