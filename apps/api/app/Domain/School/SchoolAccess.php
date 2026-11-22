<?php

namespace App\Domain\School;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\School;
use App\Models\SchoolStaff;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * LA porte de lecture de la direction — SCHOOL_ADMIN_SPACE.md §2 et §4.
 *
 *     can:school       le rôle                          (routes/api.php)
 *     schoolOf()       une nomination ACTIVE dans un établissement ACTIF
 *     activeStudent()  l'élève est membre ACTIF d'une classe ACTIVE de cet
 *                      établissement, ET il a consenti à la lecture de
 *                      l'établissement (`school_consent_at`)
 *
 * L'établissement ne vient jamais de la requête : il est déduit du directeur.
 * Rejoindre la classe d'un professeur ne parlait que du professeur ; tant que
 * l'élève (ou l'inscription par la direction) n'a pas consenti, l'établissement
 * ne le lit pas un par un et ne le compte pas. La réponse est 404, comme pour
 * un inconnu.
 *
 * Et LA forme d'un élève vue par la direction : `identity()` — jamais le
 * courriel. SchoolPrivacyContractTest le vérifie sur chaque lecture /school.
 */
final class SchoolAccess
{
    /**
     * L'établissement du directeur, s'il est en fonction et l'établissement
     * actif.
     *
     * @throws SchoolException
     */
    public static function schoolOf(User $user): School
    {
        $staff = SchoolStaff::with('school')
            ->where('user_id', $user->id)
            ->where('status', SchoolStaff::STATUS_ACTIVE)
            ->first();

        if ($staff === null || $staff->school === null || ! $staff->school->isActive()) {
            throw new SchoolException(SchoolException::NO_SCHOOL, 'Aucun établissement actif pour ce compte.');
        }

        return $staff->school;
    }

    /**
     * Les adhésions que l'établissement peut lire : actives, dans une classe
     * active de l'établissement, avec le consentement de l'établissement. Tout
     * agrégat de la direction part d'ici.
     */
    public static function consentedMemberships(School $school): Builder
    {
        return ClassroomMembership::query()
            ->active()
            ->whereNotNull('classroom_memberships.school_consent_at')
            ->whereHas('classroom', fn (Builder $q) => $q
                ->where('school_id', $school->id)
                ->where('status', Classroom::STATUS_ACTIVE));
    }

    /**
     * L'élève, s'il est lisible par cet établissement ; sinon 404.
     *
     * @throws HttpException
     */
    public static function activeStudent(School $school, int $studentId): User
    {
        $readable = self::consentedMemberships($school)
            ->where('classroom_memberships.student_id', $studentId)
            ->exists();
        $student = $readable ? User::find($studentId) : null;
        if ($student === null) {
            abort(404);
        }

        return $student;
    }

    /**
     * L'identité d'un élève, telle que la direction la lit. Jamais le courriel.
     *
     * @return array{id: int, firstName: ?string, lastName: ?string}
     */
    public static function identity(?User $student, ?int $id = null): array
    {
        return [
            'id' => (int) ($student?->id ?? $id),
            'firstName' => $student?->first_name,
            'lastName' => $student?->last_name,
        ];
    }

    /** Les colonnes à charger pour `identity()` — jamais `email`. */
    public const IDENTITY_COLUMNS = 'id,first_name,last_name';
}
