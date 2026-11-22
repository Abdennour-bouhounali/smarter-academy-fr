<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Une séance en classe TERMINÉE : la leçon, le moment (start / end), le bilan. Jamais une preuve d'apprentissage. */
class ClassSession extends Model
{
    public const MOMENTS = ['start', 'end'];

    protected $fillable = ['uuid', 'classroom_id', 'teacher_id', 'lesson_code', 'moment', 'started_at', 'finished_at', 'absent', 'summary'];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'finished_at' => 'datetime', 'absent' => 'array', 'summary' => 'array'];
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ClassSessionAnswer::class)->orderBy('position');
    }
}
