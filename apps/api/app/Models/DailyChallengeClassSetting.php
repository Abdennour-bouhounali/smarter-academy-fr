<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Les réglages du défi quotidien d'UNE classe, posés par son enseignant.
 * Absence de ligne = les défauts de DailyChallengeConfig.
 */
class DailyChallengeClassSetting extends Model
{
    public const DIFFICULTIES = ['easy', 'medium', 'hard'];

    protected $fillable = [
        'classroom_id', 'enabled', 'competition_enabled', 'show_top3', 'show_results_to_class',
        'question_count', 'difficulty', 'lesson_codes', 'learning_point_codes',
        'available_from', 'available_until', 'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'competition_enabled' => 'boolean',
            'show_top3' => 'boolean',
            'show_results_to_class' => 'boolean',
            'question_count' => 'integer',
            'lesson_codes' => 'array',
            'learning_point_codes' => 'array',
        ];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }
}
