<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Les réponses d'un élève pendant UNE leçon (pilote 2026-11-07) : `answers` = { clé de question: { v, at } }.
 * PRIVÉES à l'élève — lues et écrites seulement par StudentLessonAnswersController pour le compte connecté.
 */
class StudentLessonAnswers extends Model
{
    protected $table = 'student_lesson_answers';

    protected $fillable = ['user_id', 'lesson_id', 'answers'];

    /** jamais sérialisées par accident (toArray / toJson d'un autre service) */
    protected $hidden = ['answers'];

    protected function casts(): array
    {
        return ['answers' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
