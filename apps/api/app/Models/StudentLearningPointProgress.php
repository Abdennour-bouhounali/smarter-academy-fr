<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * L'état CANONIQUE de maîtrise d'un couple (élève, learning point) — la seule
 * table de maîtrise. Dérivée de learning_evidence par le moteur
 * (App\Domain\Progress\Engine), reconstruite par le rejeu. Bornée par
 * élèves × learning points ; aucune colonne ne référence un exercice.
 */
class StudentLearningPointProgress extends Model
{
    protected $table = 'student_learning_point_progress';

    protected $fillable = [
        'user_id',
        'learning_point_id',
        'status',
        'status_reason',
        'confidence',
        'attempts',
        'correct_count',
        'partial_count',
        'failure_count',
        'distinct_items_success',
        'distinct_items_attempted',
        'distinct_templates_success',
        'assessment_success_count',
        'max_difficulty_success',
        'last_evidence_at',
        'last_success_at',
        'last_failure_at',
        'engine_version',
        'recomputed_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'attempts' => 'integer',
            'correct_count' => 'integer',
            'partial_count' => 'integer',
            'failure_count' => 'integer',
            'distinct_items_success' => 'integer',
            'distinct_items_attempted' => 'integer',
            'distinct_templates_success' => 'integer',
            'assessment_success_count' => 'integer',
            'max_difficulty_success' => 'integer',
            'engine_version' => 'integer',
            'last_evidence_at' => 'datetime',
            'last_success_at' => 'datetime',
            'last_failure_at' => 'datetime',
            'recomputed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }
}
