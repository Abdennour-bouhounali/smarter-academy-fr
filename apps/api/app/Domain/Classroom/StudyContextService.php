<?php

namespace App\Domain\Classroom;

use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\ClassroomMembership;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * « Comment cet élève étudie-t-il en ce moment ? » — UN seul endroit.
 *
 *   independent → aucune classe active : les règles habituelles.
 *   classroom   → au moins une adhésion active à une classe active : la
 *                 visibilité réglée par l'enseignant s'ajoute aux règles
 *                 habituelles (ContentAccess).
 *
 * Aucun `if ($student->classroom)` ne doit exister ailleurs. Singleton
 * mémorisé par requête, vidé à la frontière de requête, comme
 * EntitlementService — et pour la même raison : une adhésion créée à
 * l'instant doit se voir à l'appel suivant.
 */
class StudyContextService
{
    public const MODE_INDEPENDENT = 'independent';

    public const MODE_CLASSROOM = 'classroom';

    /** @var array<int, array<string, mixed>> */
    private array $cache = [];

    /**
     * @return array{mode: string, classrooms: array<int, array<string, mixed>>, primary: ?array<string, mixed>, hiddenLessonCodes: string[]}
     */
    public function resolve(User $user): array
    {
        if (isset($this->cache[$user->id])) {
            return $this->cache[$user->id];
        }

        $classrooms = $this->activeClassroomsOf($user);

        $entries = $classrooms->map(fn (Classroom $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'grade' => $c->grade,
            'academicYear' => $c->academic_year,
            'teacherName' => trim(($c->teacher?->first_name ?? '').' '.($c->teacher?->last_name ?? '')),
            'teacherId' => $c->teacher_id,
            'joinedAt' => optional($c->getAttribute('membership_joined_at'))->toIso8601String(),
            // Adhésion antérieure au texte de partage (ou texte changé) :
            // « قسمي » le redemande une fois.
            'consentRequired' => (bool) $c->getAttribute('membership_consent_required'),
            // Une classe d'ÉTABLISSEMENT : son nom, et si l'élève doit encore
            // dire « oui » à la lecture de la direction (SCHOOL_ADMIN_SPACE.md §4).
            'schoolName' => $c->school?->isActive() ? $c->school->name : null,
            'schoolConsentRequired' => (bool) $c->getAttribute('membership_school_consent_required'),
        ])->values()->all();

        return $this->cache[$user->id] = [
            'mode' => $classrooms->isEmpty() ? self::MODE_INDEPENDENT : self::MODE_CLASSROOM,
            'classrooms' => $entries,
            // La classe PRINCIPALE : la plus récemment rejointe.
            'primary' => $entries[0] ?? null,
            'hiddenLessonCodes' => $this->hiddenLessonCodes($user, $classrooms),
        ];
    }

    public function isInClassroom(User $user): bool
    {
        return $this->resolve($user)['mode'] === self::MODE_CLASSROOM;
    }

    /** @return string[] */
    public function hiddenLessonCodesFor(User $user): array
    {
        return $this->resolve($user)['hiddenLessonCodes'];
    }

    public function forget(?User $user = null): void
    {
        if ($user === null) {
            $this->cache = [];

            return;
        }
        unset($this->cache[$user->id]);
    }

    /**
     * Les classes ACTIVES que l'élève a rejointes, la plus récente d'abord.
     *
     * @return Collection<int, Classroom>
     */
    private function activeClassroomsOf(User $user): Collection
    {
        if (! $user->isStudent()) {
            return collect();
        }

        $memberships = ClassroomMembership::where('student_id', $user->id)
            ->active()
            ->with(['classroom.teacher:id,first_name,last_name', 'classroom.school:id,name,status'])
            ->orderByDesc('joined_at')
            ->orderByDesc('id')
            ->get();

        return $memberships
            ->filter(fn (ClassroomMembership $m) => $m->classroom !== null && $m->classroom->isActive())
            ->map(function (ClassroomMembership $m) {
                $m->classroom->setAttribute('membership_joined_at', $m->joined_at);
                $m->classroom->setAttribute('membership_consent_required', ! $m->hasCurrentConsent());
                $m->classroom->setAttribute('membership_school_consent_required',
                    $m->classroom->school?->isActive() === true && $m->school_consent_by !== ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT);

                return $m->classroom;
            })
            ->values();
    }

    /**
     * Les codes de leçon que l'enseignant a masqués — pour cet élève.
     *
     * Une leçon est masquée si TOUTES les classes actives de l'élève qui
     * portent la classe scolaire de cette leçon la masquent : « une porte
     * ouverte = ouvert », même règle que partout dans ContentAccess. Les
     * leçons d'autres classes scolaires ne sont pas concernées.
     *
     * @param  Collection<int, Classroom>  $classrooms
     * @return string[]
     */
    private function hiddenLessonCodes(User $user, Collection $classrooms): array
    {
        if ($classrooms->isEmpty()) {
            return [];
        }

        $rows = ClassroomLesson::whereIn('classroom_id', $classrooms->pluck('id'))
            ->where('status', ClassroomLesson::STATUS_HIDDEN)
            ->get(['classroom_id', 'lesson_id']);

        if ($rows->isEmpty()) {
            return [];
        }

        $lessons = Lesson::whereIn('id', $rows->pluck('lesson_id')->unique())
            ->with('chapter.grade:id,code')
            ->get(['id', 'code', 'chapter_id']);

        $classroomsByGrade = $classrooms->groupBy('grade')->map(fn ($group) => $group->pluck('id')->all());
        $hiddenByLesson = $rows->groupBy('lesson_id')->map(fn ($group) => $group->pluck('classroom_id')->all());

        $hiddenIds = [];
        foreach ($lessons as $lesson) {
            $grade = $lesson->chapter?->grade?->code;
            $classesOfGrade = $classroomsByGrade[$grade] ?? [];
            if ($classesOfGrade === []) {
                continue;
            }
            $hiding = $hiddenByLesson[$lesson->id] ?? [];
            if (array_diff($classesOfGrade, $hiding) === []) {
                $hiddenIds[] = $lesson->id;
            }
        }

        if ($hiddenIds === []) {
            return [];
        }

        // Un code porté par une autre leçon non masquée reste ouvert.
        $hiddenCodes = $lessons->whereIn('id', $hiddenIds)->pluck('code')->unique();
        $openElsewhere = Lesson::whereIn('code', $hiddenCodes)->whereNotIn('id', $hiddenIds)->pluck('code')->unique();

        return $hiddenCodes->diff($openElsewhere)->values()->all();
    }
}
