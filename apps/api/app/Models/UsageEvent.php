<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une unité consommée — immuable. Voir la migration usage_events.
 */
class UsageEvent extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'usage_type',
        'feature_key',
        'context',
        'subject_id',
        'tier',
    ];

    protected function casts(): array
    {
        return [
            'subject_id' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
