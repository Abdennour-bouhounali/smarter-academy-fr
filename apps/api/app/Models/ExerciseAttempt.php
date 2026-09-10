<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Le passage d'un élève sur un exercice, dans une séance.
 *
 * `exercise_id` est une CHAÎNE, pas une clé étrangère : le contenu vit dans
 * content/practice/ (fichiers versionnés), jamais en base — même convention
 * que learning_evidence.question_code.
 */
class ExerciseAttempt extends Model
{
    protected $fillable = [
        'practice_session_id',
        'exercise_id',
        'level',
        'status',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function practiceSession(): BelongsTo
    {
        return $this->belongsTo(PracticeSession::class);
    }

    public function questionAttempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }
}
