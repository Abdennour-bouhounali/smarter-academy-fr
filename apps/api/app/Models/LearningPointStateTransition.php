<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une ligne de l'HISTOIRE de l'état canonique d'un couple (élève, learning
 * point) : ce que le moteur a calculé avant et après une preuve. Voir la
 * migration et App\Domain\Progress\TransitionRecorder, son seul écrivain.
 *
 * Append-only : aucune mise à jour, aucune suppression hors du rebâtissage
 * explicite d'une histoire reconstruite (origin = backfill).
 */
class LearningPointStateTransition extends Model
{
    public const ORIGIN_LIVE = 'live';

    public const ORIGIN_REPLAY = 'replay';

    public const ORIGIN_BACKFILL = 'backfill';

    protected $fillable = [
        'user_id',
        'learning_point_id',
        'learning_evidence_id',
        'status_before',
        'status_after',
        'reason_after',
        'confidence_before',
        'confidence_after',
        'engine_version',
        'origin',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence_before' => 'float',
            'confidence_after' => 'float',
            'engine_version' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }
}
