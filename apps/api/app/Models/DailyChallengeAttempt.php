<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * La participation d'UN élève à UN défi — unique par (défi, élève) : ni un
 * second onglet ni un rechargement n'en ouvrent une autre.
 */
class DailyChallengeAttempt extends Model
{
    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'uuid', 'daily_challenge_id', 'user_id', 'scope_type', 'scope_id', 'challenge_date', 'status',
        'started_at', 'expires_at', 'completed_at', 'question_count', 'answered_count', 'correct_count',
        'partial_count', 'base_score', 'speed_score', 'streak_bonus', 'total_score', 'penalty_applied',
        'total_response_ms', 'average_response_time_ms', 'streak_before', 'streak_after',
        'rank_before', 'rank_after',
    ];

    protected function casts(): array
    {
        return [
            'challenge_date' => 'date:Y-m-d',
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(DailyChallenge::class, 'daily_challenge_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(DailyChallengeAnswer::class)->orderBy('position');
    }

    public function isFinished(): bool
    {
        return $this->status !== self::STATUS_IN_PROGRESS;
    }
}
