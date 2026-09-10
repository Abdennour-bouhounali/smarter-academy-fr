<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Une séance de pratique : un élève, une leçon, un niveau, une suite
 * d'exercices. Identifiée par un UUID fourni par le client (comme les
 * sessions de diagnostic), ce qui rend son ouverture idempotente et la séance
 * rechargeable par son URL.
 */
class PracticeSession extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'lesson_id',
        'level',
        'status',
        'exercises_completed',
        'questions_answered',
        'correct_count',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'exercises_completed' => 'integer',
            'questions_answered' => 'integer',
            'correct_count' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function exerciseAttempts(): HasMany
    {
        return $this->hasMany(ExerciseAttempt::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }
}
