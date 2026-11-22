<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'grade_id',
        'code',
        'title',
        'topics',
        'order',
    ];

    /**
     * `topics` : les sujets du programme officiel portés par ce chapitre,
     * quand aucune leçon ne les porte encore (4AM — voir la migration
     * add_topics_to_chapters_table). Null pour un chapitre dont le curriculum
     * est décrit par ses leçons.
     */
    protected function casts(): array
    {
        return ['topics' => 'array'];
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    /** Les unités du manuel du chapitre (phase 8) — vide pour un chapitre encore « un sujet = une leçon ». */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class)->orderBy('order');
    }
}
