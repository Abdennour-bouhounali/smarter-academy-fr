<?php

namespace App\Domain\Registration;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\ClassroomException;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Models\PlatformSetting;
use App\Models\User;

/**
 * Peut-on créer un compte maintenant ? Le SEUL lecteur de config/registration.php.
 *
 *   défauts        config/registration.php (REGISTRATION_OPEN, REGISTRATION_CLASS_LINKS)
 *   ↓ surchargés par
 *   administrateur platform_settings `registration` (« التسجيل » du tableau de bord)
 *
 * Chaque valeur de la ligne est facultative : une valeur absente retombe sur le défaut.
 *
 * Fermé : seul l'élève porteur du lien VALIDE d'une classe qui accepte encore des membres passe (si `class_links`).
 */
class RegistrationGate
{
    public const CLOSED_CODE = 'registration_closed';

    public const CLOSED_MESSAGE = 'المنصّة في مرحلة التجربة: التسجيل مغلق مؤقّتًا.';

    /** La ligne de l'administrateur, lue une fois par instance (null = pas encore lue ; [] = aucune ligne). */
    private ?array $overrides = null;

    public function __construct(
        private ClassroomMembershipService $memberships,
        private ActivityLogger $logger,
    ) {}

    public function isOpen(): bool
    {
        return $this->settings()['open'];
    }

    public function classLinksAllowed(): bool
    {
        return $this->settings()['classLinks'];
    }

    /** @return array{open: bool, classLinks: bool} les valeurs effectives */
    public function settings(): array
    {
        $overrides = $this->overrides();

        return [
            'open' => (bool) ($overrides['open'] ?? config('registration.open')),
            'classLinks' => (bool) ($overrides['class_links'] ?? config('registration.class_links')),
        ];
    }

    /**
     * L'administrateur ouvre ou ferme (« التسجيل »). `$changes` : `open` et/ou `classLinks`, booléens. Écrit la ligne,
     * journalise l'ancien → le nouveau, et rend les valeurs effectives.
     *
     * @param  array{open?: bool, classLinks?: bool}  $changes
     * @return array{open: bool, classLinks: bool}
     */
    public function update(User $admin, array $changes): array
    {
        $before = $this->settings();

        $row = PlatformSetting::firstOrNew(['key' => PlatformSetting::REGISTRATION_KEY]);
        $values = is_array($row->values) ? $row->values : [];
        if (array_key_exists('open', $changes)) {
            $values['open'] = (bool) $changes['open'];
        }
        if (array_key_exists('classLinks', $changes)) {
            $values['class_links'] = (bool) $changes['classLinks'];
        }
        $row->values = $values;
        $row->updated_by = $admin->id;
        $row->save();

        $this->overrides = $values;
        $after = $this->settings();

        $this->logger->log($admin, ActivityLogger::REGISTRATION_SETTINGS_CHANGED, 'platform_setting', $row->id, $before, $after);

        return $after;
    }

    /** Une inscription d'élève venue du lien d'une classe : admise pendant le test, si le lien tient encore. */
    public function allows(?string $role, ?string $classJoinLink, bool $consented): bool
    {
        if ($this->isOpen()) {
            return true;
        }
        if (! $this->classLinksAllowed() || ! $consented || ! $classJoinLink || ($role !== null && $role !== 'student')) {
            return false;
        }
        try {
            return $this->memberships->classroomForLink($classJoinLink)->acceptsNewMembers();
        } catch (ClassroomException) {
            return false;
        }
    }

    /** @return array<string, mixed> */
    private function overrides(): array
    {
        if ($this->overrides === null) {
            $values = PlatformSetting::where('key', PlatformSetting::REGISTRATION_KEY)->value('values');
            $values = is_string($values) ? json_decode($values, true) : $values;
            $this->overrides = is_array($values) ? $values : [];
        }

        return $this->overrides;
    }
}
