<?php

namespace App\Domain\School;

use App\Domain\Classroom\ClassroomException;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\School;
use App\Models\SchoolLicence;
use App\Models\User;

/**
 * Les SIÈGES d'un établissement (SCHOOL_ADMIN_SPACE.md, D1, phase 7) — le
 * pendant de TeacherCapacityService, compté en élèves DISTINCTS membres actifs
 * d'une classe active de l'établissement (consentement à la lecture ou non :
 * un siège est un accès, pas une lecture).
 *
 * Il ne s'applique que si une licence COURT ; sans elle, une classe
 * d'établissement reste sur les sièges de son enseignant.
 */
class SchoolCapacityService
{
    public function runningLicence(School|int $school): ?SchoolLicence
    {
        $id = $school instanceof School ? $school->id : $school;

        return SchoolLicence::where('school_id', $id)->running()->orderByDesc('starts_at')->orderByDesc('id')->first();
    }

    public function currentStudentCount(School|int $school): int
    {
        $id = $school instanceof School ? $school->id : $school;

        return ClassroomMembership::query()
            ->active()
            ->whereIn('classroom_id', Classroom::where('school_id', $id)->where('status', Classroom::STATUS_ACTIVE)->select('id'))
            ->distinct('student_id')
            ->count('student_id');
    }

    /** NULL : aucune licence ne court (les sièges de l'enseignant s'appliquent). */
    public function remainingSeats(School|int $school): ?int
    {
        $licence = $this->runningLicence($school);

        return $licence === null ? null : max(0, $licence->student_seats - $this->currentStudentCount($school));
    }

    /**
     * Un élève déjà assis dans l'établissement n'en prend pas un second ;
     * sinon il faut un siège libre.
     *
     * @throws ClassroomException
     */
    public function assertCanSeat(SchoolLicence $licence, User $student): void
    {
        $seated = ClassroomMembership::where('student_id', $student->id)->active()
            ->whereIn('classroom_id', Classroom::where('school_id', $licence->school_id)->where('status', Classroom::STATUS_ACTIVE)->select('id'))
            ->exists();

        if (! $seated && $this->currentStudentCount($licence->school_id) >= $licence->student_seats) {
            throw new ClassroomException(ClassroomException::SEATS_EXHAUSTED, 'L\'établissement n\'a plus de place disponible.');
        }
    }

    /** @return array{seats: int, current: int, remaining: int, overLimit: bool, startsAt: string, endsAt: ?string}|null */
    public function summary(School $school): ?array
    {
        $licence = $this->runningLicence($school);
        if ($licence === null) {
            return null;
        }
        $current = $this->currentStudentCount($school);

        return [
            'seats' => $licence->student_seats,
            'current' => $current,
            'remaining' => max(0, $licence->student_seats - $current),
            'overLimit' => $current > $licence->student_seats,
            'startsAt' => $licence->starts_at->toIso8601String(),
            'endsAt' => optional($licence->ends_at)->toIso8601String(),
        ];
    }
}
