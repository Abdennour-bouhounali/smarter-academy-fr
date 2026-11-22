<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Une question servie dans une jauge « بوصلتي », puis sa réponse corrigée par le serveur. */
class CompassAnswer extends Model
{
    protected $fillable = [
        'compass_session_id', 'user_id', 'item_id', 'level', 'lesson_code', 'exercise_id', 'question_id',
        'answer', 'correct', 'unsure', 'answered_at',
    ];

    protected function casts(): array
    {
        return ['answer' => 'array', 'correct' => 'boolean', 'unsure' => 'boolean', 'level' => 'integer', 'answered_at' => 'datetime'];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CompassSession::class, 'compass_session_id');
    }
}
