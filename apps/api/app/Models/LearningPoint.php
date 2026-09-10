<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    /**
     * L'état de maîtrise de ce point, élève par élève. Le rollup existe déjà
     * (student_learning_point_progress, tenu par ProgressEngine) : cette
     * relation ne fait que l'exposer, elle n'en calcule pas un second.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(StudentLearningPointProgress::class);
    }

    public function isRetired(): bool
    {
        return $this->retired_at !== null;
    }
}
