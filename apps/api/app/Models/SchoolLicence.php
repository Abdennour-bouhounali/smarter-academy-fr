<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * La licence d'un établissement (SCHOOL_ADMIN_SPACE.md, D1). Voir la migration.
 *
 * « Qui court » = active, commencée, pas encore finie (fin EXCLUE, comme les
 * droits — ADMIN_PANEL_ARCHITECTURE.md Annexe A6). Au plus une licence active
 * par établissement : SchoolLicenceService annule la précédente.
 */
class SchoolLicence extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_SUSPENDED = 'suspended';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUSES = [self::STATUS_ACTIVE, self::STATUS_SUSPENDED, self::STATUS_CANCELLED];

    protected $fillable = ['student_seats', 'starts_at', 'ends_at', 'status', 'note'];

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'student_seats' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /** Les licences qui courent maintenant. */
    public function scopeRunning(Builder $query, ?Carbon $now = null): Builder
    {
        $now ??= Carbon::now();

        return $query->where($query->qualifyColumn('status'), self::STATUS_ACTIVE)
            ->where($query->qualifyColumn('starts_at'), '<=', $now)
            ->where(fn (Builder $q) => $q->whereNull($q->qualifyColumn('ends_at'))->orWhere($q->qualifyColumn('ends_at'), '>', $now));
    }

    public function isRunning(?Carbon $now = null): bool
    {
        $now ??= Carbon::now();

        return $this->status === self::STATUS_ACTIVE
            && $this->starts_at->lte($now)
            && ($this->ends_at === null || $this->ends_at->gt($now));
    }
}
