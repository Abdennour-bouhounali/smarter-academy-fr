<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Une ressource déclarée par une leçon : manipulation, méthode, situation, exemple. Identité seulement. */
class LessonResource extends Model
{
    public const KINDS = ['manipulation', 'method', 'situation', 'example'];

    protected $fillable = [
        'lesson_id', 'code', 'kind', 'type', 'title', 'description', 'module_number',
        'learning_point_codes', 'source_element_ids', 'config', 'order', 'retired_at',
    ];

    protected function casts(): array
    {
        return [
            'learning_point_codes' => 'array',
            'source_element_ids' => 'array',
            'config' => 'array',
            'module_number' => 'integer',
            'order' => 'integer',
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
