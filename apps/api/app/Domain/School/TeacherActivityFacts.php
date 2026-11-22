<?php

namespace App\Domain\School;

use App\Models\Classroom;
use App\Models\ClassroomIntervention;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Ce que l'établissement voit d'un ENSEIGNANT (décision D4 du propriétaire) :
 * des FAITS, jamais une note ni un classement — et l'enseignant lit exactement
 * la même chose dans « مؤسستي » (une seule fonction pour les deux lecteurs).
 *
 * Bornés à l'établissement : ses classes de CET établissement, ses élèves qui
 * ont consenti à la lecture de l'établissement, ses interventions dans ces
 * classes sur les 30 derniers jours, et sa dernière connexion.
 */
final class TeacherActivityFacts
{
    public const WINDOW_DAYS = 30;

    /** @return array{classes: int, students: int, interventionsOpened: int, interventionsClosed: int, lastSignInAt: ?string, windowDays: int} */
    public static function for(User $teacher, School $school): array
    {
        $classIds = Classroom::where('teacher_id', $teacher->id)
            ->where('school_id', $school->id)
            ->where('status', Classroom::STATUS_ACTIVE)
            ->pluck('id');

        $since = Carbon::now()->subDays(self::WINDOW_DAYS);

        return [
            'classes' => $classIds->count(),
            'students' => SchoolAccess::consentedMemberships($school)
                ->whereIn('classroom_memberships.classroom_id', $classIds)
                ->distinct()
                ->count('classroom_memberships.student_id'),
            'interventionsOpened' => ClassroomIntervention::whereIn('classroom_id', $classIds)
                ->where('teacher_id', $teacher->id)
                ->where('opened_at', '>=', $since)
                ->count(),
            'interventionsClosed' => ClassroomIntervention::whereIn('classroom_id', $classIds)
                ->where('teacher_id', $teacher->id)
                ->where('closed_at', '>=', $since)
                ->count(),
            'lastSignInAt' => optional($teacher->last_activity_at)->toIso8601String(),
            'windowDays' => self::WINDOW_DAYS,
        ];
    }
}
