<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un enseignant rattaché à un établissement. Le rattachement (avec le
 * consentement de l'enseignant) est la phase 3 de SCHOOL_ADMIN_SPACE.md.
 */
class SchoolTeacher extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_LEFT = 'left';

    protected $fillable = ['status', 'joined_at', 'left_at'];

    protected $attributes = [
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'left_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
