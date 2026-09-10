<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une demande d'indice, horodatée. Le compteur `question_attempts.hints_used`
 * dit combien ; cette table dit QUAND — l'écart entre la demande et la réponse
 * mesure la lutte productive, et ne se reconstitue pas après coup.
 */
class HintEvent extends Model
{
    protected $fillable = [
        'question_attempt_id',
        'hint_index',
        'hint_type',
        'requested_at',
    ];

    protected function casts(): array
    {
        return [
            'hint_index' => 'integer',
            'requested_at' => 'datetime',
        ];
    }

    public function questionAttempt(): BelongsTo
    {
        return $this->belongsTo(QuestionAttempt::class);
    }
}
