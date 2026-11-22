<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Le lien entre un compte « وليّ أمر » et un élève (PARENT_SPACE.md §2).
 * Né du code que l'élève a créé après avoir accepté le texte « ما يراه وليّك ».
 * Rompu, il reste en base (status = revoked) : rien n'est effacé.
 */
class ParentLink extends Model
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_REVOKED = 'revoked';

    protected $fillable = [
        'parent_id',
        'student_id',
        'status',
        'consent_version',
        'consented_at',
        'linked_at',
        'revoked_at',
        'revoked_by',
        'weekly_email',
        'last_weekly_report_week',
    ];

    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
            'linked_at' => 'datetime',
            'revoked_at' => 'datetime',
            'weekly_email' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
