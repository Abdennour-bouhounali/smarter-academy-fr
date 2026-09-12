<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Une identité externe rattachée à un compte local — aujourd'hui, Google.
 *
 * Voir la migration create_user_identities_table pour le raisonnement : une
 * table plutôt que des colonnes sur users, et l'unicité
 * (provider, provider_user_id) comme garantie anti-détournement.
 */
class UserIdentity extends Model
{
    public const PROVIDER_GOOGLE = 'google';

    protected $fillable = [
        'user_id',
        'provider',
        'provider_user_id',
        'provider_email',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
