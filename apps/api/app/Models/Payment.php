<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une trace de paiement. Aucune donnée de carte — il n'existe même pas de
 * colonne pour en accueillir une.
 */
class Payment extends Model
{
    public const STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

    protected $fillable = [
        'user_id',
        'subscription_id',
        'amount_cents',
        'currency',
        'status',
        'provider',
        'external_reference',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_cents' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
