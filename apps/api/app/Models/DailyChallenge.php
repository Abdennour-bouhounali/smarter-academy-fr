<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * UNE instance stable de défi par (portée, jour). Voir la migration.
 */
class DailyChallenge extends Model
{
    public const SCOPE_CLASSROOM = 'classroom';

    public const SCOPE_STUDENT = 'student';

    public const STATUS_GENERATED = 'generated';

    public const STATUS_EMPTY = 'empty';

    protected $fillable = ['scope_type', 'scope_id', 'challenge_date', 'config_snapshot', 'status'];

    protected function casts(): array
    {
        return [
            'challenge_date' => 'date:Y-m-d',
            'config_snapshot' => 'array',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(DailyChallengeQuestion::class)->orderBy('position');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(DailyChallengeAttempt::class);
    }

    public function dateString(): string
    {
        return $this->challenge_date->format('Y-m-d');
    }
}
