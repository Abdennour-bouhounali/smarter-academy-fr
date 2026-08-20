<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiagnosticSession extends Model
{
    protected $fillable = [
        'user_id',
        'grade',
        'status',
        'current_question_id',
        'current_question_presented_at',
        'started_at',
        'completed_at',
        'profile_summary',
    ];

    protected function casts(): array
    {
        return [
            'current_question_presented_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'profile_summary' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(DiagnosticResponse::class, 'session_id');
    }

    public function skillAssessments(): HasMany
    {
        return $this->hasMany(DiagnosticSkillAssessment::class, 'session_id');
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
