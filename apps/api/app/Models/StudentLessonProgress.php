<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Lesson progression — where a student stands within a lesson's journey.
 * Distinct from StudentLearningPointProgress (knowledge progression):
 * completion is not mastery. Merge semantics live in
 * App\Domain\Progress\LessonProgressService.
 */
class StudentLessonProgress extends Model
{
    protected $table = 'student_lesson_progress';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const COMPLETION_MODE_PATH = 'path';

    public const COMPLETION_MODE_MASTERY = 'mastery';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'status',
        'current_module',
        'completed_modules',
        'last_activity_at',
        'completed_at',
        'completion_mode',
    ];

    protected function casts(): array
    {
        return [
            'completed_modules' => 'array',
            'current_module' => 'integer',
            'last_activity_at' => 'datetime',
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
}
