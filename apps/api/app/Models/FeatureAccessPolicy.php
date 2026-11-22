<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ce que chaque palier peut faire d'UNE fonctionnalité. Voir la migration
 * et App\Domain\Access\Features\FeatureAccessService.
 */
class FeatureAccessPolicy extends Model
{
    protected $fillable = [
        'feature_key',
        'is_enabled',
        'free_allowed',
        'premium_allowed',
        'free_quota',
        'premium_quota',
        'quota_period',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'free_allowed' => 'boolean',
            'premium_allowed' => 'boolean',
            'free_quota' => 'integer',
            'premium_quota' => 'integer',
        ];
    }
}
