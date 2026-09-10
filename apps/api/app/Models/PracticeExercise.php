<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une ligne du REGISTRE des exercices. Jumeau de LessonModule : le contenu
 * reste dans content/practice/**, cette table ne porte que l'identité et
 * l'état de publication.
 */
class PracticeExercise extends Model
{
    use Publishable;

    protected $fillable = [
        'lesson_id',
        'exercise_code',
        'level',
        'title',
        'question_count',
        'publication_status',
        'retired_at',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'question_count' => 'integer',
            'retired_at' => 'datetime',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('retired_at');
    }
}
