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
     * Les codes d'activation — le modèle commercial algérien.
     *
     * Tous les gestes qui produisent ou retirent un ACCÈS sont tracés, au
     * même titre que la dérogation : ce sont des gestes humains qui ouvrent
     * ou ferment une porte payante, et ils doivent laisser le nom de qui les
     * a faits. L'export l'est aussi — sortir une liste de codes de
     * l'application est en soi un évènement à retrouver.
     *
     * Aucun de ces journaux ne porte de code en clair : voir
     * ActivationCodeGenerator.
     */
    public const ACTIVATION_CODES_GENERATED = 'activation_codes.generated';

    public const ACTIVATION_CODE_REVOKED = 'activation_code.revoked';

    public const ACTIVATION_CODE_BATCH_REVOKED = 'activation_code_batch.revoked';

    public const ACTIVATION_CODES_EXPORTED = 'activation_codes.exported';

    /**
     * Le rejeu d'un évènement de fournisseur par un administrateur.
     *
     * Tracé parce qu'il peut ouvrir ou fermer un accès : tout geste humain qui
     * touche à l'accès doit laisser le nom de qui l'a fait.
     */
    public const PROVIDER_EVENT_REPLAYED = 'provider_event.replayed';

    /**
     * Les CLASSES d'enseignants. L'acteur est ici l'enseignant (ou l'élève
     * qui rejoint / quitte) : le journal retrace les gestes qui changent ce
     * qu'un élève voit, quel que soit celui qui les fait.
     */
    public const CLASSROOM_CREATED = 'classroom.created';

    public const CLASSROOM_UPDATED = 'classroom.updated';

    public const CLASSROOM_ARCHIVED = 'classroom.archived';

    public const CLASSROOM_RESTORED = 'classroom.restored';

    public const CLASSROOM_JOIN_CODE_ROTATED = 'classroom.join_code_rotated';

    /** Le lien de classe renouvelé : l'ancien n'ouvre plus rien. */
    public const CLASSROOM_JOIN_LINK_ROTATED = 'classroom.join_link_rotated';

    public const CLASSROOM_MEMBER_JOINED = 'classroom_member.joined';

    public const CLASSROOM_MEMBER_LEFT = 'classroom_member.left';

    public const CLASSROOM_MEMBER_REMOVED = 'classroom_member.removed';

    /** L'élève confirme le texte de partage de sa classe. */
    public const CLASSROOM_MEMBER_CONSENTED = 'classroom_member.consented';

    /** Une intervention pédagogique de l'enseignant, ouverte puis close. */
    public const CLASSROOM_INTERVENTION_CREATED = 'classroom_intervention.created';

    public const CLASSROOM_INTERVENTION_UPDATED = 'classroom_intervention.updated';

    /** L'enseignant a lu le cahier d'un élève (une ligne par jour et par élève). */
    public const TEACHER_NOTEBOOK_READ = 'teacher.notebook_read';

    /** L'enseignant a émis de nouveaux mots de passe (« بطاقات الدخول ») — jamais le mot de passe lui-même. */
    public const TEACHER_STUDENT_CREDENTIALS_ISSUED = 'teacher.student_credentials_issued';

    /** L'enseignant a imprimé des « بطاقات الأولياء » (QR du رابط الوليّ) — jamais le lien lui-même. */
    public const TEACHER_PARENT_CARDS_ISSUED = 'teacher.parent_cards_issued';

    public const CLASSROOM_LESSON_STATUS_CHANGED = 'classroom_lesson.status_changed';

    /** Les OFFRES et leur configuration — le modèle commercial, sans déploiement. */
    public const PLAN_CREATED = 'plan.created';

    public const PLAN_UPDATED = 'plan.updated';

    public const PLAN_STATUS_CHANGED = 'plan.status_changed';

    public const PLAN_DUPLICATED = 'plan.duplicated';

    public const PLAN_VERSION_CREATED = 'plan_version.created';

    public const PLAN_VERSION_UPDATED = 'plan_version.updated';

    public const PLAN_VERSION_PUBLISHED = 'plan_version.published';

    /** La grille de prix par élève d'une version (brouillon) a changé. */
    public const PLAN_PRICING_TIERS_UPDATED = 'plan_pricing.updated';

    public const PLAN_OVERRIDE_GRANTED = 'plan_override.granted';

    public const PLAN_OVERRIDE_REVOKED = 'plan_override.revoked';

    /** Les DEMANDES d'offre et les ABONNEMENTS activés à la main — aucun paiement en ligne. */
    public const SUBSCRIPTION_REQUEST_CREATED = 'subscription_request.created';

    public const SUBSCRIPTION_REQUEST_CANCELLED = 'subscription_request.cancelled';

    public const SUBSCRIPTION_REQUEST_REJECTED = 'subscription_request.rejected';

    public const SUBSCRIPTION_REQUEST_FULFILLED = 'subscription_request.fulfilled';

    public const SUBSCRIPTION_ACTIVATED = 'subscription.activated';

    public const SUBSCRIPTION_SUSPENDED = 'subscription.suspended';

    public const SUBSCRIPTION_RESUMED = 'subscription.resumed';

    public const SUBSCRIPTION_CANCELLED = 'subscription.cancelled';

    public const SUBSCRIPTION_EXTENDED = 'subscription.extended';

    public const SUBSCRIPTION_PLAN_CHANGED = 'subscription.plan_changed';

    public const SUBSCRIPTION_CREATED_FROM_CODE = 'subscription.created_from_code';

    public const ACTIVATION_CODE_ISSUED = 'activation_code.issued';

    public const TEACHER_STATUS = 'teacher.status_changed';

    /** L'administrateur a désigné, ou retiré, un ambassadeur. */
    public const TEACHER_AMBASSADOR = 'teacher.ambassador_changed';

    /**
     * Les ÉTABLISSEMENTS (SCHOOL_ADMIN_SPACE.md §5). La nomination du
     * directeur journalise son identifiant et son nom — jamais le mot de passe.
     */
    public const SCHOOL_CREATED = 'school.created';

    public const SCHOOL_UPDATED = 'school.updated';

    public const SCHOOL_STATUS = 'school.status_changed';

    public const SCHOOL_DIRECTOR_APPOINTED = 'school.director_appointed';

    public const SCHOOL_DIRECTOR_REVOKED = 'school.director_revoked';

    /** Phase 3 : la structure. L'acteur est le directeur, l'enseignant ou l'élève qui agit. */
    public const SCHOOL_TERMS_UPDATED = 'school.terms_updated';

    public const SCHOOL_TEACHER_JOINED = 'school_teacher.joined';

    public const SCHOOL_TEACHER_LEFT = 'school_teacher.left';

    public const SCHOOL_TEACHER_LINK_ROTATED = 'school.teacher_link_rotated';

    public const SCHOOL_CLASSROOM_CREATED = 'school.classroom_created';

    public const SCHOOL_CLASSROOM_REASSIGNED = 'school.classroom_reassigned';

    public const SCHOOL_CLASSROOM_ATTACHED = 'school.classroom_attached';

    public const SCHOOL_CLASSROOM_DETACHED = 'school.classroom_detached';

    /** Import : ids et nombre seulement — jamais un mot de passe ni une date de naissance. */
    public const SCHOOL_ROSTER_IMPORTED = 'school.roster_imported';

    public const SCHOOL_STUDENT_TRANSFERRED = 'school.student_transferred';

    public const SCHOOL_CREDENTIALS_ISSUED = 'school.credentials_issued';

    public const CLASSROOM_MEMBER_SCHOOL_CONSENTED = 'classroom_member.school_consented';

    /** Phase 5 : les rapports figés (type et portée seulement, jamais le contenu). */
    public const SCHOOL_REPORT_GENERATED = 'school_report.generated';

    public const SCHOOL_REPORT_DELETED = 'school_report.deleted';

    /** Phase 7 : la licence d'établissement — un geste qui ouvre ou ferme un accès payant. */
    public const SCHOOL_LICENCE_GRANTED = 'school.licence_granted';

    public const SCHOOL_LICENCE_STATUS = 'school.licence_status_changed';

    /** Suppression définitive d'un compte élève ou enseignant (UserDeletionService). */
    public const USER_DELETED = 'user.deleted';

    /** « الوصول والحدود » : le réglage d'une fonctionnalité par palier (FeatureAccessAdminService). */
    public const ACCESS_POLICY_UPDATED = 'access_policy.updated';

    /** « التحدّي اليومي » : le barème global (écran d'administration). */
    public const DAILY_CHALLENGE_CONFIG_UPDATED = 'daily_challenge.config_updated';

    /** « التسجيل » : l'administrateur ouvre ou ferme les inscriptions (RegistrationGate::update) — ancien → nouveau. */
    public const REGISTRATION_SETTINGS_CHANGED = 'registration.settings_changed';

    /** Le paiement en ligne ouvert ou fermé par l'administrateur (PaymentGate::update) — ancien → nouveau. */
    public const PAYMENTS_SETTINGS_CHANGED = 'payments.settings_changed';

    /** Un compte élève créé par l'administrateur (StudentService::create) : jamais le mot de passe dans le journal. */
    public const STUDENT_CREATED = 'student.created';

    /** La LIBRAIRIE (livres papier) : fiche livre, commande, paiement. Voir docs/architecture/BOOKS_STORE.md. */
    public const BOOK_SAVED = 'book.saved';

    public const BOOK_ORDER_STATUS = 'book_order.status_changed';

    public const BOOK_ORDER_UPDATED = 'book_order.updated';

    public const BOOK_ORDER_PAYMENT = 'book_order.payment_recorded';

    public const BOOK_ORDER_PAYMENT_REMOVED = 'book_order.payment_removed';

    public const BOOK_ORDER_DELETED = 'book_order.deleted';

    /** Les gestionnaires de la librairie : jamais le mot de passe dans le journal. */
    public const BOOK_MANAGER_CREATED = 'book_manager.created';

    public const BOOK_MANAGER_STATUS = 'book_manager.status_changed';

    public const BOOK_MANAGER_PASSWORD_RESET = 'book_manager.password_reset';

    /**
     * Clés dont la valeur n'est jamais journalisée, quelle que soit la façon
     * dont l'appelant les nomme. Défense en profondeur : l'appelant est déjà
     * censé ne pas les passer.
     */
    private const REDACTED_KEYS = [
        'password', 'password_confirmation', 'current_password', 'new_password',
        'token', 'plain_text_token', 'remember_token', 'secret', 'api_key',
        // Un code d'activation est un secret porteur d'argent. Les appelants
        // n'en passent aucun (ActivationCodeGenerator journalise les
        // conditions du lot, pas ses codes) — cette ligne est là pour que
        // l'oubli d'un futur appelant ne devienne pas une fuite.
        'code', 'codes', 'code_hash', 'activation_code',
    ];

    /**
     * `$actor` : l'administrateur, ou — pour les gestes de classe — l'enseignant
     * ou l'élève qui agit. La colonne s'appelle toujours user_id.
     */
    public function log(
        User $actor,
        string $action,
        ?string $entityType = null,
        int|string|null $entityId = null,
        ?array $before = null,
        ?array $after = null,
    ): AdminActivityLog {
        return AdminActivityLog::create([
            'user_id' => $actor->id,
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
