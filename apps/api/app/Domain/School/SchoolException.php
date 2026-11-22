<?php

namespace App\Domain\School;

use DomainException;

/**
 * Un refus du domaine « établissement », AVEC son motif — même principe que
 * ClassroomException : vocabulaire clos, le contrôleur rend `reason` tel quel,
 * le client en fait un message (arabe pour le directeur, français pour
 * l'administration).
 */
class SchoolException extends DomainException
{
    /** Le compte n'a pas (ou plus) de nomination active dans un établissement actif. */
    public const NO_SCHOOL = 'no_school';

    /** Une adresse qui a déjà un compte : on ne transforme jamais un compte en directeur. */
    public const EMAIL_TAKEN = 'email_taken';

    /** L'établissement a déjà un directeur en fonction. */
    public const DIRECTOR_EXISTS = 'director_exists';

    public const NO_DIRECTOR = 'no_director';

    /** On ne nomme pas de directeur dans un établissement qui n'est pas actif. */
    public const SCHOOL_INACTIVE = 'school_inactive';

    public const INVALID_STATUS = 'invalid_status';

    /** Phase 3 — la structure. */
    public const INVALID_TERMS = 'invalid_terms';

    /** Lien d'enseignant inconnu, mal formé, ou établissement inactif. */
    public const INVALID_LINK = 'invalid_link';

    /** Rejoindre un établissement sans avoir accepté ce qu'il verra. */
    public const CONSENT_REQUIRED = 'consent_required';

    /** Un enseignant n'appartient qu'à UN établissement à la fois. */
    public const ALREADY_IN_SCHOOL = 'already_in_school';

    public const NOT_IN_SCHOOL = 'not_in_school';

    /** L'enseignant visé n'est pas (ou plus) rattaché à cet établissement. */
    public const TEACHER_NOT_IN_SCHOOL = 'teacher_not_in_school';

    /** La classe visée n'est pas une classe active de cet établissement. */
    public const CLASS_NOT_IN_SCHOOL = 'class_not_in_school';

    /** L'élève visé n'est pas lisible par cet établissement. */
    public const STUDENT_NOT_IN_SCHOOL = 'student_not_in_school';

    /** Rééditer le mot de passe d'un compte PERSONNEL (non créé par l'établissement). */
    public const NOT_SCHOOL_LOGIN = 'not_school_login';

    /** Phase 5 — un rapport demandé sur un type, une portée ou un trimestre inconnus. */
    public const INVALID_REPORT = 'invalid_report';

    public const REPORT_NOT_FOUND = 'report_not_found';

    /** Phase 7 — la licence. */
    public const INVALID_LICENCE = 'invalid_licence';

    public const NO_LICENCE = 'no_licence';

    /** Une licence de moins de sièges que d'élèves déjà présents. */
    public const SEATS_BELOW_USAGE = 'seats_below_usage';

    /** Un import refusé en bloc (lignes invalides, trop de lignes). */
    public const INVALID_ROSTER = 'invalid_roster';

    public function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }
}
