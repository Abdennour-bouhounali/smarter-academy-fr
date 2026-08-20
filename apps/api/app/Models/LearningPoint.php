<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningPoint extends Model
{
    protected $fillable = [
        'lesson_id',
        'code',
        'title',
        'order',
        'diagnostic_skill_id',
        'retired_at',
    ];

    protected function casts(): array
    {
        return [
            'retired_at' => 'datetime',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningEvidence(): BelongsToMany
    {
        return $this->belongsToMany(LearningEvidence::class, 'learning_evidence_learning_point');
    }

    public function isRetired(): bool
    {
        return $this->retired_at !== null;
    }
}
