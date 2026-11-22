<?php

namespace App\Domain\School;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\SchoolLicence;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Le modèle C : l'accès payant d'un élève COUVERT par la licence de son
 * établissement (SCHOOL_ADMIN_SPACE.md, D1).
 *
 * Comme TeacherCoverage, évalué DYNAMIQUEMENT, jamais matérialisé : une
 * adhésion qui cesse, une classe archivée, une licence suspendue ou finie
 * ferment la couverture à l'appel suivant. Deux conditions :
 *
 *   1. l'élève est membre actif d'une classe active d'un établissement ;
 *   2. cet établissement a une licence qui COURT.
 *
 * Appelé par EntitlementService, et par lui seul. L'ordre des motifs y est
 * « code / abonnement propre → licence d'établissement → offre de
 * l'enseignant ».
 */
class SchoolCoverage
{
    /** @return array{covered: bool, schoolId: ?int, endsAt: ?Carbon} */
    public function coverageFor(User $student): array
    {
        $none = ['covered' => false, 'schoolId' => null, 'endsAt' => null];
        if (! $student->isStudent()) {
            return $none;
        }

        $schoolIds = Classroom::whereIn('id', ClassroomMembership::where('student_id', $student->id)->active()->select('classroom_id'))
            ->where('status', Classroom::STATUS_ACTIVE)
            ->whereNotNull('school_id')
            ->distinct()
            ->pluck('school_id');
        if ($schoolIds->isEmpty()) {
            return $none;
        }

        // Plusieurs licences (cas rare : adhésions antérieures à la règle
        // « une classe ») : la fin la plus lointaine, null = sans terme.
        $best = null;
        foreach (SchoolLicence::whereIn('school_id', $schoolIds)->running()->get() as $licence) {
            if ($best === null || $licence->ends_at === null || ($best['endsAt'] !== null && $licence->ends_at->greaterThan($best['endsAt']))) {
                $best = ['covered' => true, 'schoolId' => $licence->school_id, 'endsAt' => $licence->ends_at];
                if ($licence->ends_at === null) {
                    break;
                }
            }
        }

        return $best ?? $none;
    }
}
