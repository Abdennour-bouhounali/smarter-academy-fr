<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une note ou une erreur marquée par l'élève. Enregistrement historique
 * durable, pas un état d'interface (cible §20).
 */
class NotebookNote extends Model
{
    protected $fillable = [
        'user_id',
        'lesson_id',
        'learning_point_id',
        'exercise_id',
        'question_id',
        'content',
        'mistake_type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }
}
