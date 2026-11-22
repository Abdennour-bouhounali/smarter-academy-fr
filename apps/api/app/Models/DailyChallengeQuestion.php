<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une question d'un défi : une RÉFÉRENCE à une question de la banque de
 * pratique (content/practice), jamais une copie de son contenu.
 */
class DailyChallengeQuestion extends Model
{
    protected $fillable = [
        'daily_challenge_id', 'position', 'lesson_id', 'exercise_code', 'question_id', 'item_key',
        'learning_point_id', 'template_key', 'difficulty', 'answer_type', 'reason',
    ];

    protected function casts(): array
    {
        return ['position' => 'integer', 'difficulty' => 'integer'];
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(DailyChallenge::class, 'daily_challenge_id');
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
