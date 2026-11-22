<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * L'état de jeu « مدار » d'un élève : ses cœurs, ses records, son vaisseau.
 * Écrit par MadarService seulement ; aucune valeur de maîtrise n'y vit.
 */
class MadarProfile extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'user_id', 'hearts', 'hearts_refilled_on', 'best_score', 'best_at',
        'defense_best', 'defense_best_at', 'defense_best_wave', 'defense_runs', 'runs_count', 'stars_total',
        'refuel_answered', 'refuel_correct', 'ship',
    ];

    protected function casts(): array
    {
        return [
            'hearts' => 'integer',
            'hearts_refilled_on' => 'date:Y-m-d',
            'best_score' => 'integer',
            'best_at' => 'datetime',
            'defense_best' => 'integer',
            'defense_best_at' => 'datetime',
            'defense_best_wave' => 'integer',
            'defense_runs' => 'integer',
            'runs_count' => 'integer',
            'stars_total' => 'integer',
            'refuel_answered' => 'integer',
            'refuel_correct' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
