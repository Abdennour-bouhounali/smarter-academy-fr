<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningEvidence extends Model
{
    // 'learning_evidence' is uncountable — Eloquent's pluralized guess
    // ('learning_evidences') would be wrong.
    protected $table = 'learning_evidence';

    protected $fillable = [
        'user_id',
        'lesson_id',
        'question_code',
        'attempt_id',
        'is_correct',
        'assessment_type',
        'answer',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'answer' => 'array',
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

    public function learningPoints(): BelongsToMany
    {
        return $this->belongsToMany(LearningPoint::class, 'learning_evidence_learning_point');
    }
}
