<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiagnosticResponse extends Model
{
    protected $fillable = [
        'session_id',
        'question_id',
        'skill_id',
        'representation',
        'difficulty',
        'is_correct',
        'misconception_id',
        'answer',
        'response_time_ms',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => 'integer',
            'is_correct' => 'boolean',
            'answer' => 'array',
            'response_time_ms' => 'integer',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(DiagnosticSession::class, 'session_id');
    }
}
