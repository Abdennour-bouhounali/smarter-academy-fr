<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une entrée du journal d'administration.
 *
 * Écrite uniquement par App\Domain\Admin\ActivityLogger, qui est le seul
 * endroit où la règle « jamais de mot de passe, jamais de secret » a besoin
 * d'être tenue.
 */
class AdminActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'before',
        'after',
    ];

    protected function casts(): array
    {
        return [
            'before' => 'array',
            'after' => 'array',
        ];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
