<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentLearningPointProgress extends Model
{
    protected $table = 'student_learning_point_progress';

    protected $fillable = [
        'user_id',
        'learning_point_id',
        'status',
        'confidence',
        'attempts',
        'correct_count',
        'last_evidence_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'last_evidence_at' => 'datetime',
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
