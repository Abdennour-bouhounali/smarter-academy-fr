<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;
    use Publishable;

    protected $fillable = [
        'chapter_id',
        'unit_id',
        'code',
        'kind',
        'official_object_code',
        'title',
        'title_source',
        'description',
        'textbook_ref',
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
            'textbook_ref' => 'array',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /** L'unité du manuel qui porte la leçon — null pour une leçon « un sujet = une leçon ». */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    /** Les leçons dont celle-ci suppose les acquis (prérequis PÉDAGOGIQUES, jamais un verrou). */
    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(Lesson::class, 'lesson_prerequisites', 'lesson_id', 'prerequisite_lesson_id')->withTimestamps();
    }

    /** Les leçons qui supposent celle-ci acquise. */
    public function dependents(): BelongsToMany
    {
        return $this->belongsToMany(Lesson::class, 'lesson_prerequisites', 'prerequisite_lesson_id', 'lesson_id')->withTimestamps();
    }

    /** Manipulations, méthodes, situations, exemples déclarés par lesson.config.js. */
    public function resources(): HasMany
    {
        return $this->hasMany(LessonResource::class)->orderBy('order');
    }

    public function isSynthesis(): bool
    {
        return $this->kind === 'synthesis';
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
