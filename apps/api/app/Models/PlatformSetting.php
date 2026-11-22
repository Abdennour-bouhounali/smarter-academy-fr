<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Un réglage de la plateforme changé par l'ADMINISTRATEUR (une ligne par clé),
 * par-dessus les défauts du dépôt. Clé `registration` : lue uniquement par
 * App\Domain\Registration\RegistrationGate.
 */
class PlatformSetting extends Model
{
    public const REGISTRATION_KEY = 'registration';

    protected $fillable = ['key', 'values', 'updated_by'];

    protected function casts(): array
    {
        return ['values' => 'array'];
    }
}
