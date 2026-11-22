<?php

namespace App\Domain\Classroom;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * LA porte de lecture de l'enseignant sur UN élève.
 *
 *     can:teacher              le rôle                     (routes/api.php)
 *     ClassroomPolicy          la classe est à CET enseignant
 *                              (TeacherClassroomController::ownedClassroom)
 *     activeStudent()          l'élève est MEMBRE ACTIF d'une classe ACTIVE
 *
 * Toute lecture « élève par élève » d'un enseignant passe par ici : le
 * dossier, le cahier, l'explication d'un point, l'aperçu, les interventions.
 * Un élève qui a quitté la classe, qui en a été retiré, ou dont la classe est
 * archivée n'est plus lisible — c'est ce que la boîte de dialogue « مغادرة
 * القسم » lui promet (« سيتوقّف أستاذك عن رؤية تقدّمك »). L'histoire de
 * l'élève n'est pas effacée : elle cesse seulement d'être ouverte à cet
 * enseignant. La réponse est 404, comme pour un inconnu : on ne révèle pas
 * qu'il a été membre.
 *
 * Et LA forme d'un élève vue par un enseignant : `identity()`. Prénom, nom,
 * identifiant — jamais l'adresse électronique (règle produit : rejoindre un
 * قسم partage l'apprentissage, pas le courriel). Aucun autre endroit ne
 * construit l'identité d'un élève pour l'enseignant ;
 * TeacherPrivacyContractTest le vérifie sur chaque route /teacher.
 */
final class ClassroomAccess
{
    /**
     * L'élève, s'il est membre ACTIF de cette classe et que la classe est
     * active ; sinon 404.
     *
     * @throws HttpException
     */
    public static function activeStudent(Classroom $classroom, int $studentId): User
    {
        if (! $classroom->isActive()) {
            abort(404);
        }

        $isMember = ClassroomMembership::where('classroom_id', $classroom->id)
            ->where('student_id', $studentId)
            ->active()
            ->exists();
        $student = $isMember ? User::find($studentId) : null;
        if ($student === null) {
            abort(404);
        }

        return $student;
    }

    /**
     * Les élèves ACTIFS de la classe, parmi ceux demandés — pour les gestes
     * qui visent plusieurs élèves (une intervention). Tout identifiant hors
     * de la classe est refusé en bloc : on ne crée rien à moitié.
     *
     * @param  int[]  $studentIds
     * @return int[]
     *
     * @throws ClassroomException
     */
    public static function activeStudentIds(Classroom $classroom, array $studentIds): array
    {
        $studentIds = array_values(array_unique(array_map('intval', $studentIds)));
        $found = ClassroomMembership::where('classroom_id', $classroom->id)
            ->whereIn('student_id', $studentIds)
            ->active()
            ->pluck('student_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if (count($found) !== count($studentIds)) {
            throw new ClassroomException(ClassroomException::NOT_MEMBER, 'Un des élèves n\'est pas dans cette classe.');
        }

        return $found;
    }

    /**
     * L'identité d'un élève, telle qu'un enseignant la lit. Jamais le courriel.
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
