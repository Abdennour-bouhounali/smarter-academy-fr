<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * La réponse d'un élève à une question de défi. `started_at` est posé par le
 * serveur quand il SERT la question, `submitted_at` quand il reçoit la
 * réponse : le temps de réponse est leur différence, jamais un nombre du
 * client. Une réponse soumise ne change plus.
 */
class DailyChallengeAnswer extends Model
{
    /** Millisecondes conservées : le temps de réponse et le départage en dépendent. */
    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'daily_challenge_attempt_id', 'daily_challenge_question_id', 'position', 'started_at', 'submitted_at',
        'response_time_ms', 'answer', 'outcome', 'is_correct', 'base_score', 'speed_bonus', 'final_score',
        'evidence_attempt_id',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'answer' => 'array',
            'is_correct' => 'boolean',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(DailyChallengeAttempt::class, 'daily_challenge_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(DailyChallengeQuestion::class, 'daily_challenge_question_id');
    }
}
