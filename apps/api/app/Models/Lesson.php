<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = [
        'chapter_id',
        'code',
        'official_object_code',
        'title',
        'description',
        'status',
        'duration_minutes',
        'tier',
        'order',
    ];

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function learningPoints(): HasMany
    {
        return $this->hasMany(LearningPoint::class);
    }
}
