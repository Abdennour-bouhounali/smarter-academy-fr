<?php

namespace App\Domain\Plans;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Le modèle B : l'accès payant d'un élève COUVERT par l'offre de son
 * enseignant.
 *
 * Évalué DYNAMIQUEMENT, jamais matérialisé en lignes : une adhésion qui
 * cesse, une classe archivée, un abonnement d'enseignant suspendu ferment
 * la couverture à l'appel suivant, sans qu'aucune synchronisation n'ait à
 * passer. Deux conditions, toutes deux venues des données :
 *
 *   1. l'élève est membre actif d'une classe active ;
 *   2. l'enseignant de cette classe a la fonctionnalité `students.covered`
 *      ET un abonnement qui court — la fonctionnalité seule ne suffit pas,
 *      pour qu'une offre par défaut mal réglée ne couvre pas tout le monde.
 *
 * Appelé par EntitlementService, et par lui seul.
 */
class TeacherCoverage
{
    public function __construct(private PlanEntitlementResolver $resolver) {}

    /**
     * @return array{covered: bool, teacherId: ?int, endsAt: ?Carbon}
     */
    public function coverageFor(User $student): array
    {
        if (! $student->isStudent()) {
            return ['covered' => false, 'teacherId' => null, 'endsAt' => null];
        }

        $classroomIds = ClassroomMembership::where('student_id', $student->id)->active()->pluck('classroom_id');
        if ($classroomIds->isEmpty()) {
            return ['covered' => false, 'teacherId' => null, 'endsAt' => null];
        }

        $teacherIds = Classroom::whereIn('id', $classroomIds)
            ->where('status', Classroom::STATUS_ACTIVE)
            ->distinct()
            ->pluck('teacher_id');

        $best = null;
        foreach (User::whereIn('id', $teacherIds)->where('account_status', User::STATUS_ACTIVE)->get() as $teacher) {
            if (! $this->resolver->allows($teacher, EntitlementKeys::STUDENTS_COVERED)) {
                continue;
            }
            $subscription = $teacher->runningSubscription();
            if ($subscription === null) {
                continue;
            }
            // Plusieurs enseignants couvrants : on retient la fin la plus
            // lointaine (null = sans terme, donc la meilleure).
            $endsAt = $subscription->ends_at;
            if ($best === null || $endsAt === null || ($best['endsAt'] !== null && $endsAt->greaterThan($best['endsAt']))) {
                $best = ['covered' => true, 'teacherId' => $teacher->id, 'endsAt' => $endsAt];
                if ($endsAt === null) {
                    break;
                }
            }
        }

        return $best ?? ['covered' => false, 'teacherId' => null, 'endsAt' => null];
    }
}
