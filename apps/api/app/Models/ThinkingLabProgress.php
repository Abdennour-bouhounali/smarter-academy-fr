<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * L'état d'un élève sur UN défi du « مختبر التفكير ». Écrit par GateService seulement.
 */
class ThinkingLabProgress extends Model
{
    public const TRYING = 'trying';

    public const SOLVED = 'solved';

    public const LEARNED = 'learned';

    protected $table = 'thinking_lab_progress';

    protected $dateFormat = 'Y-m-d H:i:s.v';

    protected $fillable = [
        'user_id', 'challenge_id', 'state', 'attempts_counted', 'keys_opened', 'first_attempt_at', 'last_counted_at',
        'solved_at', 'learned_at', 'outcome', 'params_index', 'edition', 'postponed_at', 'extras',
    ];

    protected function casts(): array
    {
        return [
            'attempts_counted' => 'integer',
            'keys_opened' => 'integer',
            'params_index' => 'integer',
            'edition' => 'integer',
            'first_attempt_at' => 'immutable_datetime',
            'last_counted_at' => 'immutable_datetime',
            'solved_at' => 'immutable_datetime',
            'learned_at' => 'immutable_datetime',
            'postponed_at' => 'immutable_datetime',
            'extras' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ThinkingLabAttempt::class, 'progress_id')->orderBy('id');
    }

    /** Résolu ou appris : la porte est franchie, ce défi n'occupe plus de place ouverte. */
    public function isDone(): bool
    {
        return $this->state === self::SOLVED || $this->state === self::LEARNED;
    }
}
