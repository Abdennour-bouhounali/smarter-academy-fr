<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Une jauge « جولة الانطلاق » (بوصلتي). Contrat : docs/architecture/YEAR_COMPASS.md. */
class CompassSession extends Model
{
    public const ACTIVE = 'active';

    public const FINISHED = 'finished';

    protected $fillable = ['uuid', 'user_id', 'grade', 'school_year', 'pointer_lesson', 'pointer_source', 'targets', 'status', 'finished_at'];

    protected function casts(): array
    {
        return ['targets' => 'array', 'finished_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CompassAnswer::class)->orderBy('id');
    }
}
