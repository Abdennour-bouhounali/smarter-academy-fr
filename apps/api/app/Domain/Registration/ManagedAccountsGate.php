<?php

namespace App\Domain\Registration;

use App\Domain\Admin\ActivityLogger;
use App\Models\PlatformSetting;
use App\Models\User;

/**
 * Un établissement ou un enseignant peut-il créer le compte d'un élève, ou en émettre le mot de passe ? Le SEUL
 * lecteur de config/registration.php › managed_accounts (propriétaire, 2026-11-22 : fermé tant que les pages
 * légales ne couvrent pas ces comptes, que personne n'a acceptées et qu'aucun parent n'a autorisées).
 *
 *   défaut         config/registration.php › managed_accounts (MANAGED_ACCOUNTS_OPEN, false)
 *   ↓ surchargé par
 *   administrateur platform_settings `managed_accounts` (PATCH /admin/managed-accounts)
 *
 * Fermé, le serveur refuse (403 `managed_accounts_closed`) : l'import d'une liste par un établissement (aperçu et
 * création), l'émission d'identifiants par un établissement, l'émission de « cartes de connexion » par un
 * enseignant. Jamais bloqués : la création par l'administrateur, l'inscription de l'élève lui-même, le lien ou le
 * code de classe, le lien parent, et toute lecture des comptes qui existent déjà.
 */
class ManagedAccountsGate
{
    public const CLOSED_CODE = 'managed_accounts_closed';

    public const CLOSED_MESSAGE = 'La création de comptes élèves par un établissement ou un enseignant n’est pas ouverte pour le moment : chaque élève crée son compte lui-même.';

    public function __construct(private ActivityLogger $logger) {}

    public function isOpen(): bool
    {
        return $this->settings()['open'];
    }

    /** @return array{open: bool} la valeur effective */
    public function settings(): array
    {
        $values = $this->row()?->values;
        $values = is_array($values) ? $values : [];

        return ['open' => (bool) ($values['open'] ?? $this->defaultOpen())];
    }

    /** Le défaut de l'environnement (MANAGED_ACCOUNTS_OPEN), que la ligne de l'administrateur surcharge. */
    public function defaultOpen(): bool
    {
        return (bool) config('registration.managed_accounts');
    }

    /** @throws ManagedAccountsClosedException */
    public function assertOpen(): void
    {
        if (! $this->isOpen()) {
            throw new ManagedAccountsClosedException;
        }
    }

    /**
     * Qui a changé l'interrupteur en dernier (null = jamais : la valeur est le défaut de l'environnement).
     *
     * @return array{at: ?string, by: ?array{id: int, name: string}}|null
     */
    public function lastChange(): ?array
    {
        $row = $this->row();
        if ($row === null) {
            return null;
        }
        $by = $row->updated_by !== null ? User::find($row->updated_by) : null;

        return [
            'at' => optional($row->updated_at)->toIso8601String(),
            'by' => $by === null ? null : ['id' => $by->id, 'name' => trim($by->first_name.' '.$by->last_name)],
        ];
    }

    /**
     * L'administrateur ouvre ou ferme. Écrit la ligne, journalise l'ancien → le nouveau, rend la valeur effective.
     *
     * @param  array{open?: bool}  $changes
     * @return array{open: bool}
     */
    public function update(User $admin, array $changes): array
    {
        $before = $this->settings();

        $row = PlatformSetting::firstOrNew(['key' => PlatformSetting::MANAGED_ACCOUNTS_KEY]);
        $values = is_array($row->values) ? $row->values : [];
        if (array_key_exists('open', $changes)) {
            $values['open'] = (bool) $changes['open'];
        }
        $row->values = $values;
        $row->updated_by = $admin->id;
        $row->save();

        $after = $this->settings();
        $this->logger->log($admin, ActivityLogger::MANAGED_ACCOUNTS_SETTINGS_CHANGED, 'platform_setting', $row->id, $before, $after);

        return $after;
    }

    /**
     * La ligne de l'administrateur, relue à CHAQUE appel : le routeur garde l'instance d'un contrôleur d'une requête
     * à l'autre (Octane, tests), et une valeur mémorisée y survivrait au changement. Les appels sont rares.
     */
    private function row(): ?PlatformSetting
    {
        return PlatformSetting::where('key', PlatformSetting::MANAGED_ACCOUNTS_KEY)->first();
    }
}
