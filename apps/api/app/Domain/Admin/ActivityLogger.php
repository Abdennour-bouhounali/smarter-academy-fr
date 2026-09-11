<?php

namespace App\Domain\Admin;

use App\Models\AdminActivityLog;
use App\Models\User;

/**
 * Le seul endroit qui écrit dans admin_activity_logs.
 *
 * Un seul point d'écriture, parce que la règle « jamais de mot de passe,
 * jamais de secret » ne tient que si elle n'a qu'un endroit où être tenue.
 * Un changement d'identifiant journalise QUE l'action a eu lieu — jamais la
 * valeur, ni l'ancienne ni la nouvelle.
 */
class ActivityLogger
{
    public const PUBLISH_LESSON = 'lesson.status_changed';

    public const PUBLISH_MODULE = 'module.status_changed';

    public const PUBLISH_EXERCISE = 'exercise.status_changed';

    public const STUDENT_STATUS = 'student.status_changed';

    public const REPORT_UPDATED = 'report.updated';

    public const REPORT_NOTE_ADDED = 'report.note_added';

    public const ADMIN_EMAIL_CHANGED = 'admin.email_changed';

    public const ADMIN_PASSWORD_CHANGED = 'admin.password_changed';

    /** Palier commercial changé — distinct de la publication. */
    public const TIER_LESSON = 'lesson.tier_changed';

    public const TIER_EXERCISE = 'exercise.tier_changed';

    /** Dérogation d'accès accordée / retirée. Voir EntitlementAdminService. */
    public const ENTITLEMENT_GRANTED = 'entitlement.granted';

    public const ENTITLEMENT_REVOKED = 'entitlement.revoked';

    /**
     * Le rejeu d'un évènement de fournisseur par un administrateur.
     *
     * Tracé parce qu'il peut ouvrir ou fermer un accès : tout geste humain qui
     * touche à l'accès doit laisser le nom de qui l'a fait.
     */
    public const PROVIDER_EVENT_REPLAYED = 'provider_event.replayed';

    /**
     * Clés dont la valeur n'est jamais journalisée, quelle que soit la façon
     * dont l'appelant les nomme. Défense en profondeur : l'appelant est déjà
     * censé ne pas les passer.
     */
    private const REDACTED_KEYS = [
        'password', 'password_confirmation', 'current_password', 'new_password',
        'token', 'plain_text_token', 'remember_token', 'secret', 'api_key',
    ];

    public function log(
        User $admin,
        string $action,
        ?string $entityType = null,
        int|string|null $entityId = null,
        ?array $before = null,
        ?array $after = null,
    ): AdminActivityLog {
        return AdminActivityLog::create([
            'user_id' => $admin->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId === null ? null : (string) $entityId,
            'before' => $this->scrub($before),
            'after' => $this->scrub($after),
        ]);
    }

    /**
     * Remplace toute valeur sensible par un marqueur. On garde la CLÉ — savoir
     * que le mot de passe a changé est l'information utile ; sa valeur ne l'est
     * jamais.
     */
    private function scrub(?array $payload): ?array
    {
        if ($payload === null) {
            return null;
        }

        $clean = [];
        foreach ($payload as $key => $value) {
            if (in_array(strtolower((string) $key), self::REDACTED_KEYS, true)) {
                $clean[$key] = '[redacted]';

                continue;
            }
            $clean[$key] = is_array($value) ? $this->scrub($value) : $value;
        }

        return $clean;
    }
}
