<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiagnosticSkillAssessment extends Model
{
    protected $fillable = [
        'session_id',
        'skill_id',
        'status',
        'confidence',
        'attempts',
        'correct_count',
        'misconceptions',
        'last_assessed_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'attempts' => 'integer',
            'correct_count' => 'integer',
            'misconceptions' => 'array',
            'last_assessed_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(DiagnosticSession::class, 'session_id');
    }
}
