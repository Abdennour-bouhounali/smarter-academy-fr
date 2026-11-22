<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * « رابط الوليّ » (PARENT_SPACE.md §2) : le lien privé, sans compte, par lequel
 * un parent lit le travail de son enfant. Retrouvé par `token_hash`, réaffiché
 * grâce à `token_encrypted` (cast chiffré). Jamais sérialisé tel quel.
 */
#[Hidden(['token_hash', 'token_encrypted', 'pin_hash'])]
class ParentAccessLink extends Model
{
    protected $fillable = [
        'student_id',
        'token_hash',
        'token_encrypted',
        'consent_version',
        'consented_at',
        'created_by',
        'created_by_user_id',
        'pin_hash',
        'pin_failures',
        'pin_locked_until',
        'open_count',
        'last_opened_at',
        'revoked_at',
        'revoked_by',
    ];

    protected function casts(): array
    {
        return [
            'token_encrypted' => 'encrypted',
            'consented_at' => 'datetime',
            'pin_locked_until' => 'datetime',
            'last_opened_at' => 'datetime',
            'revoked_at' => 'datetime',
            'open_count' => 'integer',
            'pin_failures' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null;
    }
}
