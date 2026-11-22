<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Un réglage de la plateforme changé par l'ADMINISTRATEUR (une ligne par clé),
 * par-dessus les défauts du dépôt. Clé `registration` : lue uniquement par
 * App\Domain\Registration\RegistrationGate. Clé `payments` : lue uniquement par
 * App\Domain\Billing\PaymentGate. Clé `managed_accounts` : lue uniquement par
 * App\Domain\Registration\ManagedAccountsGate.
 */
class PlatformSetting extends Model
{
    public const REGISTRATION_KEY = 'registration';

    public const PAYMENTS_KEY = 'payments';

    public const MANAGED_ACCOUNTS_KEY = 'managed_accounts';

    protected $fillable = ['key', 'values', 'updated_by'];

    protected function casts(): array
    {
        return ['values' => 'array'];
    }
}
