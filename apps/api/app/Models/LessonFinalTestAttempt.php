<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The student's LATEST final-test attempt for a lesson (score + full
 * per-question review). One row per (user, lesson) — each submit overwrites
 * the previous attempt via upsert, no history kept. See this table's
 * migration for why it's separate from learning_evidence and
 * student_lesson_progress.
 */
class LessonFinalTestAttempt extends Model
{
    protected $table = 'lesson_final_test_attempts';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'score',
        'total_questions',
        'answers',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'score' => 'integer',
            'total_questions' => 'integer',
            'submitted_at' => 'datetime',
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
}
