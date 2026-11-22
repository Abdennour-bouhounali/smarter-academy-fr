<?php

namespace App\Domain\School;

use App\Models\Classroom;
use App\Models\School;
use App\Models\SchoolTeacher;

/**
 * « لوحة المؤسسة » — ce que le directeur voit en entrant (SCHOOL_ADMIN_SPACE.md §6).
 *
 * Des comptes, jamais une moyenne. Les élèves comptés sont ceux que
 * l'établissement peut lire (SchoolAccess::consentedMemberships) : un élève
 * qui n'a consenti qu'à son professeur n'y figure pas.
 */
class SchoolOverviewService
{
    public function __construct(private SchoolCapacityService $capacity) {}

    /** @return array<string, mixed> */
    public function overview(School $school): array
    {
        return [
            // La licence qui court (sièges, usage, fin) — null sans licence.
            'licence' => $this->capacity->summary($school),
            'school' => [
                'id' => $school->id,
                'name' => $school->name,
                'wilaya' => $school->wilaya,
                'commune' => $school->commune,
                'currentAcademicYear' => $school->current_academic_year,
            ],
            'counts' => [
                'classes' => Classroom::where('school_id', $school->id)
                    ->where('status', Classroom::STATUS_ACTIVE)
                    ->count(),
                'teachers' => SchoolTeacher::where('school_id', $school->id)
                    ->where('status', SchoolTeacher::STATUS_ACTIVE)
                    ->count(),
                'students' => SchoolAccess::consentedMemberships($school)
                    ->distinct()
                    ->count('classroom_memberships.student_id'),
            ],
        ];
    }
}
