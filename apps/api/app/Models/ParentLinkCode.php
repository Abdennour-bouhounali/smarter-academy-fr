<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Le code de liaison qu'un élève donne à son وليّ : un seul vivant par élève,
 * à usage unique, avec une date d'expiration. Il porte le consentement (version
 * et date) que le lien héritera.
 */
class ParentLinkCode extends Model
{
    protected $fillable = [
        'student_id',
        'code',
        'consent_version',
        'consented_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
