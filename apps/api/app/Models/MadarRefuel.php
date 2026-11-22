<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une question de la « محطة التزوّد » : servie sans clé de réponse, jugée par
 * le serveur ; juste, elle rend un cœur. Sa réponse entre dans la maîtrise
 * par ProgressEngine, comme une question de pratique.
 */
class MadarRefuel extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'uuid', 'user_id', 'classroom_id', 'lesson_id', 'learning_point_id', 'exercise_code', 'question_id', 'item_key',
        'template_key', 'difficulty', 'answer_type', 'reason', 'served_at', 'answered_at', 'answer', 'outcome',
        'is_correct', 'hearts_awarded', 'evidence_attempt_id', 'time_limit_s', 'response_ms', 'left_at', 'left_count',
        'flag', 'evidence_recorded',
    ];

    /** Répondu après le délai : aucun cœur, aucune preuve. */
    public const FLAG_TIMEOUT = 'timeout';

    /** La page a été quittée pendant la question : aucun cœur, aucune preuve. */
    public const FLAG_LEFT = 'left';

    /** Juste, mais plus vite qu'on ne lit une question difficile : le cœur, pas la preuve. */
    public const FLAG_FAST = 'fast';

    protected function casts(): array
    {
        return [
            'served_at' => 'datetime',
            'answered_at' => 'datetime',
            'answer' => 'array',
            'is_correct' => 'boolean',
            'hearts_awarded' => 'integer',
            'difficulty' => 'integer',
            'time_limit_s' => 'integer',
            'response_ms' => 'integer',
            'left_at' => 'datetime',
            'left_count' => 'integer',
            'evidence_recorded' => 'boolean',
        ];
    }

    public function isAnswered(): bool
    {
        return $this->answered_at !== null;
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningPoint(): BelongsTo
    {
        return $this->belongsTo(LearningPoint::class);
    }
}
