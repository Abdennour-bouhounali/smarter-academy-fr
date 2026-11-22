<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Une unité du manuel (الوحدة) : entre le chapitre (ميدان) et la leçon (درس). */
class Unit extends Model
{
    protected $fillable = [
        'chapter_id', 'code', 'title', 'subtitle', 'number', 'objectives', 'source_topic_codes', 'textbook', 'order',
    ];

    protected function casts(): array
    {
        return [
            'objectives' => 'array',
            'source_topic_codes' => 'array',
            'textbook' => 'array',
            'number' => 'integer',
            'order' => 'integer',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }
}
