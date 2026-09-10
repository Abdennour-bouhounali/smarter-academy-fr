<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Une tentative sur une question — l'historique riche que la preuve ne porte
 * pas. La ligne naît à l'OUVERTURE de la question (d'où les colonnes de
 * réponse nullables), pour qu'une demande d'indice, qui précède la réponse,
 * ait un parent auquel se rattacher.
 */
class QuestionAttempt extends Model
{
    protected $fillable = [
        'exercise_attempt_id',
        'user_id',
        'question_id',
        'attempt_uuid',
        'submitted_answer',
        'normalized_answer',
        'outcome',
        'hints_used',
        'misconception_id',
        'attempt_number',
        'started_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'submitted_answer' => 'array',
            'hints_used' => 'integer',
            'attempt_number' => 'integer',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function exerciseAttempt(): BelongsTo
    {
        return $this->belongsTo(ExerciseAttempt::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hintEvents(): HasMany
    {
        return $this->hasMany(HintEvent::class);
    }

    public function isAnswered(): bool
    {
        return $this->submitted_at !== null;
    }
}
