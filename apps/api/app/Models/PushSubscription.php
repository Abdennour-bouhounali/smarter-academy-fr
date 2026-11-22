<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un appareil abonné aux notifications de nouvelles commandes de livres
 * (BOOKS_STORE.md §6quater). `endpoint_hash` = sha256 de `endpoint` (clé unique).
 */
class PushSubscription extends Model
{
    protected $fillable = ['user_id', 'endpoint', 'endpoint_hash', 'public_key', 'auth_token', 'user_agent', 'topics'];

    protected $casts = ['topics' => 'array'];

    protected $hidden = ['public_key', 'auth_token'];

    public static function hashOf(string $endpoint): string
    {
        return hash('sha256', $endpoint);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
