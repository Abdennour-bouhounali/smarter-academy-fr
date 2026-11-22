<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Le score CUMULÉ d'un élève dans une portée (une classe, ou lui seul).
 * Métrique de jeu : il ne dit rien de la maîtrise et n'y touche jamais.
 */
class DailyChallengeStanding extends Model
{
    /** Millisecondes conservées : le temps de réponse et le départage en dépendent. */
    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'scope_type', 'scope_id', 'user_id', 'cumulative_score', 'challenges_completed', 'total_correct',
        'total_answered', 'total_response_ms', 'penalties_total', 'last_completed_date',
        'penalty_settled_through', 'score_reached_at',
    ];

    protected function casts(): array
    {
        return [
            'last_completed_date' => 'date:Y-m-d',
            'penalty_settled_through' => 'date:Y-m-d',
            'score_reached_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
