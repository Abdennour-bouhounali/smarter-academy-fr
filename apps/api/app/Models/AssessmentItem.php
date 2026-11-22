<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Un item du registre d'évaluation — voir la migration create_assessment_items.
 * Index du contenu, reconstruit par l'import ; jamais une seconde définition.
 */
class AssessmentItem extends Model
{
    use Publishable;

    public const SOURCE_FINAL_TEST = 'final_test';

    public const SOURCE_PRACTICE = 'practice';

    public const EVALUATION_SERVER = 'server';

    public const EVALUATION_CLIENT = 'client';

    protected $fillable = [
        'lesson_id', 'item_key', 'source_kind', 'exercise_code', 'question_id', 'template_key',
        'difficulty', 'cognitive_demand', 'answer_type', 'title', 'learning_points', 'answer_key',
        'evaluation', 'content_version', 'publication_status', 'retired_at',
    ];

    protected function casts(): array
    {
        return [
            'difficulty' => 'integer',
            'learning_points' => 'array',
            'answer_key' => 'array',
            'retired_at' => 'datetime',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function learningPointRows(): BelongsToMany
    {
        return $this->belongsToMany(LearningPoint::class, 'assessment_item_learning_point')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->whereNull('retired_at');
    }

    /** Le code du point PRINCIPAL. */
    public function primaryLearningPointCode(): ?string
    {
        foreach ($this->learning_points ?? [] as $lp) {
            if (($lp['role'] ?? 'primary') === 'primary') {
                return $lp['code'] ?? null;
            }
        }

        return null;
    }

    /** @return array<string, string> code → rôle */
    public function roles(): array
    {
        $roles = [];
        foreach ($this->learning_points ?? [] as $lp) {
            if (isset($lp['code'])) {
                $roles[$lp['code']] = ($lp['role'] ?? 'primary') === 'secondary' ? 'secondary' : 'primary';
            }
        }

        return $roles;
    }
}
