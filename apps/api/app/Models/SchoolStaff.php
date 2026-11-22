<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une nomination à la direction d'un établissement. Voir la migration.
 *
 * `school_id` et `user_id` ne sont pas assignables en masse : SchoolService
 * les pose. Retirer une nomination garde la ligne et le compte.
 */
class SchoolStaff extends Model
{
    protected $table = 'school_staff';

    /** Le seul rôle aujourd'hui (décision D3) ; un second serait une valeur. */
    public const ROLE_DIRECTOR = 'director';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_REVOKED = 'revoked';

    protected $fillable = ['school_role', 'status', 'appointed_at', 'revoked_at'];

    protected $attributes = [
        'school_role' => self::ROLE_DIRECTOR,
        'status' => self::STATUS_ACTIVE,
    ];

    protected function casts(): array
    {
        return [
            'appointed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
