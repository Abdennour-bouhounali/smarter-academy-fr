<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * La visibilité d'une leçon pour une classe — le troisième axe d'accès.
 * Absence de ligne = visible. Voir la migration.
 */
class ClassroomLesson extends Model
{
    use HasFactory;

    public const STATUS_VISIBLE = 'visible';

    public const STATUS_HIDDEN = 'hidden';

    public const STATUSES = [self::STATUS_VISIBLE, self::STATUS_HIDDEN];

    protected $fillable = ['status', 'created_by', 'updated_by'];

    protected $attributes = [
        'status' => self::STATUS_VISIBLE,
    ];

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function isHidden(): bool
    {
        return $this->status === self::STATUS_HIDDEN;
    }
}
