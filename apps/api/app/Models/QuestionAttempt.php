<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
        // Mastery V2 : qui a jugé (server | client), et ce que le client
        // avait prédit quand le serveur a jugé autrement.
        'evaluated_by',
        'client_outcome',
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

    /** Les photos de copie jointes à l'étape (au plus 3 — AnswerImageStore). */
    public function images(): HasMany
    {
        return $this->hasMany(AnswerImage::class)->orderBy('id');
    }

    /** La demande de correction par l'enseignant, s'il y en a une. */
    public function review(): HasOne
    {
        return $this->hasOne(AnswerReview::class);
    }

    public function isAnswered(): bool
    {
        return $this->submitted_at !== null;
    }
}
