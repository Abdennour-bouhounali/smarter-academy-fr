<?php

namespace App\Domain\Classroom;

use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;

/**
 * La CAPACITÉ d'un enseignant — combien d'élèves son offre lui permet
 * d'encadrer, et combien il en encadre.
 *
 *     limite    students_total.max, résolue par l'offre (sièges achetés,
 *               ou allocation de l'offre par défaut, ou dérogation)
 *     usage     les élèves DISTINCTS actifs dans ses classes non archivées
 *               — un élève présent dans deux de ses classes = UN siège
 *
 * Le nombre de classes n'entre nulle part : les classes sont des
 * contenants, pas l'unité de vente. C'est le seul endroit qui répond
 * « peut-il asseoir cet élève ? » ; l'adhésion (code ou lien de classe) le
 * demande sous verrou de l'enseignant.
 */
class TeacherCapacityService
{
    public function __construct(private PlanEntitlementResolver $entitlements) {}

    /** NULL = illimité. */
    public function seatLimit(User $teacher): ?int
    {
        return $this->entitlements->limit($teacher, EntitlementKeys::STUDENTS_TOTAL_MAX);
    }

    public function currentStudentCount(User $teacher): int
    {
        return $this->entitlements->usage($teacher)['students'];
    }

    /** NULL = illimité ; jamais négatif. */
    public function remainingSeats(User $teacher): ?int
    {
        $limit = $this->seatLimit($teacher);

        return $limit === null ? null : max(0, $limit - $this->currentStudentCount($teacher));
    }

    /** Cet élève occupe-t-il déjà un siège chez cet enseignant (une autre de ses classes) ? */
    public function isSeated(User $teacher, User $student): bool
    {
        return ClassroomMembership::where('student_id', $student->id)->active()
            ->whereIn('classroom_id', Classroom::ownedBy($teacher)->countingTowardsLimit()->notCoveredBySchool()->select('classrooms.id'))
            ->exists();
    }

    /**
     * Un élève déjà assis n'en consomme pas un second ; sinon il faut un
     * siège libre.
     */
    public function canAddStudent(User $teacher, User $student): bool
    {
        if ($this->isSeated($teacher, $student)) {
            return true;
        }

        $limit = $this->seatLimit($teacher);

        return $limit === null || $this->currentStudentCount($teacher) < $limit;
    }

    /** @throws ClassroomException */
    public function assertCanSeat(User $teacher, User $student): void
    {
        if (! $this->canAddStudent($teacher, $student)) {
            throw new ClassroomException(ClassroomException::SEATS_EXHAUSTED, 'L\'enseignant n\'a plus de place disponible.');
        }
    }

    /**
     * Le résumé rendu aux écrans (enseignant et administration).
     *
     * @return array{limit: ?int, current: int, remaining: ?int, overLimit: bool, canAdd: bool}
     */
    public function summary(User $teacher): array
    {
        $limit = $this->seatLimit($teacher);
        $current = $this->currentStudentCount($teacher);

        return [
            'limit' => $limit,
            'current' => $current,
            'remaining' => $limit === null ? null : max(0, $limit - $current),
            'overLimit' => $limit !== null && $current > $limit,
            'canAdd' => $limit === null || $current < $limit,
        ];
    }
}
