<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Les surcharges ADMINISTRATEUR de config/daily_challenge.php (une ligne,
 * clé `global`). Lu uniquement par DailyChallengeConfig.
 */
class DailyChallengePolicy extends Model
{
    public const GLOBAL_KEY = 'global';

    protected $fillable = ['key', 'values', 'updated_by'];

    protected function casts(): array
    {
        return ['values' => 'array'];
    }
}
