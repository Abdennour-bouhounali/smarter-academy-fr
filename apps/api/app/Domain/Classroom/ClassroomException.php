<?php

namespace App\Domain\Classroom;

use DomainException;

/**
 * Un refus du domaine « classe », AVEC son motif — même principe
 * qu'ActivationCodeException : le vocabulaire est clos, le contrôleur rend
 * `reason` tel quel, et le client en fait un message arabe.
 */
class ClassroomException extends DomainException
{
    public const LIMIT_REACHED = 'limit_reached';

    public const GRADE_NOT_ALLOWED = 'grade_not_allowed';

    public const FEATURE_UNAVAILABLE = 'feature_unavailable';

    public const CLASS_INACTIVE = 'class_inactive';

    public const CLASS_FULL = 'class_full';

    public const SEATS_EXHAUSTED = 'seats_exhausted';

    public const ALREADY_MEMBER = 'already_member';

    /**
     * L'élève est déjà membre d'une AUTRE classe active : un élève n'a qu'un
     * قسم à la fois (décision du propriétaire, 2026-10-24). Pour changer, il
     * quitte d'abord sa classe depuis « قسمي ».
     */
    public const ALREADY_IN_CLASS = 'already_in_class';

    public const NOT_A_STUDENT = 'not_a_student';

    public const INVALID = 'invalid';

    /**
     * Le lien de classe est bon, mais la classe n'accepte plus de nouvel élève
     * (adhésions fermées par l'enseignant, classe archivée ou suspendue). Le
     * CODE, lui, répond `invalid` dans ce cas : six symboles se devinent, et
     * un motif distinct dirait lesquels existent. 190 bits ne se devinent pas.
     */
    public const JOINING_CLOSED = 'joining_closed';

    public const EXPIRED = 'expired';

    public const REVOKED = 'revoked';

    public const NOT_MEMBER = 'not_member';

    public const LESSON_OUT_OF_SCOPE = 'lesson_out_of_scope';

    /** Rejoindre sans avoir accepté le texte de partage. */
    public const CONSENT_REQUIRED = 'consent_required';

    public function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }
}
