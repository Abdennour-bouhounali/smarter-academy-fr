<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Le temps d'étude d'un élève, un jour (Alger), sur une surface de la
 * plateforme (PARENT_SPACE.md §3). Des compteurs, jamais un journal.
 */
class StudyTimeDay extends Model
{
    public const SURFACES = ['lesson', 'practice', 'challenge', 'lab', 'game', 'other'];

    /** Les surfaces qui comptent comme ÉTUDE ; le jeu et le reste sont à part. */
    public const STUDY_SURFACES = ['lesson', 'practice', 'challenge', 'lab'];

    protected $fillable = [
        'user_id',
        'day',
        'surface',
        'active_seconds',
        'idle_seconds',
        'away_seconds',
        'leave_count',
    ];

    protected function casts(): array
    {
        return [
            'active_seconds' => 'integer',
            'idle_seconds' => 'integer',
            'away_seconds' => 'integer',
            'leave_count' => 'integer',
        ];
    }
}
