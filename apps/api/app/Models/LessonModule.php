<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une ligne du REGISTRE des modules — l'identité d'un module et son état de
 * publication, jamais son contenu (qui vit dans lesson.config.js + le JSX).
 *
 * Deux propriétaires, une table : la synchro écrit l'identité (code, titre,
 * étape, points enseignés), l'administration écrit publication_status. Voir
 * App\Domain\Curriculum\ContentRegistryImporter.
 */
class LessonModule extends Model
{
    use Publishable;

    protected $fillable = [
        'lesson_id',
        'code',
        'number',
        'slug',
        'title',
        'description',
        'stage',
        'estimated_min',
        'difficulty',
        'teaches_learning_point_codes',
        'publication_status',
        'retired_at',
    ];

    protected function casts(): array
    {
        return [
            'teaches_learning_point_codes' => 'array',
            'number' => 'integer',
            'estimated_min' => 'integer',
            'difficulty' => 'integer',
            'retired_at' => 'datetime',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('retired_at');
    }
}
