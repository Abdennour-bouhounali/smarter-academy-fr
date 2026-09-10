<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use Publishable;

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
        'publication_status',
        'published_at',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function learningPoints(): HasMany
    {
        return $this->hasMany(LearningPoint::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(LessonModule::class);
    }

    public function practiceExercises(): HasMany
    {
        return $this->hasMany(PracticeExercise::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(StudentReport::class);
    }

    public function studentProgress(): HasMany
    {
        return $this->hasMany(StudentLessonProgress::class);
    }
}
