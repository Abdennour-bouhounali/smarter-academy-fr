<?php

namespace App\Domain\Classroom;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Classroom;
use App\Models\ClassroomLesson;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * La VISIBILITÉ du programme pour une classe — le troisième axe.
 *
 * Ce service n'écrit JAMAIS dans `lessons` : la publication globale
 * appartient à l'administration. Il n'écrit que des lignes
 * classroom_lessons, et seulement pour des leçons de la classe scolaire
 * de cette classe. Le lot est le geste unitaire répété (même contrat
 * qu'App\Domain\Admin\ContentService::bulk) : mêmes refus, même journal.
 */
class ClassroomLessonService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private StudyContextService $context,
        private ActivityLogger $log,
    ) {}

    /**
     * Le programme de la classe scolaire, avec l'état de chaque leçon.
     *
     * @return array<string, mixed>
     */
    public function curriculumFor(Classroom $classroom): array
    {
        $grade = Grade::where('code', $classroom->grade)
            ->with([
                'chapters' => fn ($q) => $q->orderBy('order'),
                'chapters.units' => fn ($q) => $q->orderBy('order'),
                'chapters.lessons' => fn ($q) => $q->orderBy('order'),
            ])
            ->first();

        $settings = ClassroomLesson::where('classroom_id', $classroom->id)->get()->keyBy('lesson_id');

        $serializeLesson = function (Lesson $lesson) use ($settings) {
            $setting = $settings->get($lesson->id);
            $classStatus = $setting?->status ?? ClassroomLesson::STATUS_VISIBLE;
            $published = $lesson->isVisibleToStudents();

            return [
                'id' => $lesson->id,
                'code' => $lesson->code,
                'title' => $lesson->title,
                'kind' => $lesson->kind,
                'unitCode' => $lesson->unit_id ? $lesson->unit?->code : null,
                'order' => $lesson->order,
                'publicationStatus' => $lesson->publication_status,
                'tier' => $lesson->tier,
                'classStatus' => $classStatus,
                // Ce que l'élève verra VRAIMENT : publié ET non masqué.
                'effectiveForStudents' => $published && $classStatus === ClassroomLesson::STATUS_VISIBLE,
            ];
        };

        if ($grade === null) {
            return ['grade' => ['code' => $classroom->grade, 'name' => null], 'chapters' => []];
        }

        $grade->chapters->each(fn ($c) => $c->lessons->loadMissing('unit:id,code'));

        return [
            'grade' => ['code' => $grade->code, 'name' => $grade->name],
            'chapters' => $grade->chapters->map(fn ($chapter) => [
                'code' => $chapter->code,
                'title' => $chapter->title,
                'units' => $chapter->units->map(fn ($u) => ['code' => $u->code, 'title' => $u->title, 'number' => $u->number])->values(),
                'lessons' => $chapter->lessons->map($serializeLesson)->values(),
            ])->values()->all(),
        ];
    }

    /**
     * @return array{changed: bool, setting: ClassroomLesson}
     *
     * @throws DomainException
     */
    public function setStatus(User $teacher, Classroom $classroom, int $lessonId, string $status): array
    {
        $this->assertFeature($teacher, EntitlementKeys::LESSONS_VISIBILITY);

        if (! in_array($status, ClassroomLesson::STATUSES, true)) {
            throw new DomainException('État inconnu.');
        }

        $lesson = Lesson::with('chapter.grade:id,code')->find($lessonId);
        if ($lesson === null || $lesson->chapter?->grade?->code !== $classroom->grade) {
            throw new ClassroomException(ClassroomException::LESSON_OUT_OF_SCOPE, 'Cette leçon n\'appartient pas au programme de la classe.');
        }

        return DB::transaction(function () use ($teacher, $classroom, $lesson, $status) {
            $setting = ClassroomLesson::where('classroom_id', $classroom->id)->where('lesson_id', $lesson->id)->lockForUpdate()->first();
            $before = $setting?->status ?? ClassroomLesson::STATUS_VISIBLE;

            if ($setting === null) {
                $setting = new ClassroomLesson(['status' => $status, 'created_by' => $teacher->id, 'updated_by' => $teacher->id]);
                $setting->classroom_id = $classroom->id;
                $setting->lesson_id = $lesson->id;
            } else {
                $setting->status = $status;
                $setting->updated_by = $teacher->id;
            }

            if ($before === $status && $setting->exists) {
                return ['changed' => false, 'setting' => $setting];
            }

            $setting->save();

            $this->log->log($teacher, ActivityLogger::CLASSROOM_LESSON_STATUS_CHANGED, 'classroom', $classroom->id,
                ['lesson_id' => $lesson->id, 'status' => $before],
                ['lesson_id' => $lesson->id, 'lesson_code' => $lesson->code, 'status' => $status]);

            // Les élèves de la classe verront le changement à leur prochain
            // appel : leur contexte mémorisé est périmé pour cette requête.
            $this->context->forget();
            // Et les leçons effectives mémorisées pour l'enseignant aussi.
            app(ClassroomProgressService::class)->forget();

            return ['changed' => $before !== $status, 'setting' => $setting];
        });
    }

    /**
     * Le lot = le geste unitaire répété. Trois issues, nommées.
     *
     * @param  int[]  $lessonIds
     * @return array{applied: int[], unchanged: int[], failed: array<int, array{id: int, message: string, reason: ?string}>}
     */
    public function bulkSetStatus(User $teacher, Classroom $classroom, array $lessonIds, string $status): array
    {
        $this->assertFeature($teacher, EntitlementKeys::LESSONS_BULK_ACTIONS);

        $applied = [];
        $unchanged = [];
        $failed = [];

        foreach (array_unique(array_map('intval', $lessonIds)) as $id) {
            try {
                $result = $this->setStatus($teacher, $classroom, $id, $status);
                if ($result['changed']) {
                    $applied[] = $id;
                } else {
                    $unchanged[] = $id;
                }
            } catch (DomainException $e) {
                $failed[] = ['id' => $id, 'message' => $e->getMessage(), 'reason' => $e instanceof ClassroomException ? $e->reason : null];
            }
        }

        return ['applied' => $applied, 'unchanged' => $unchanged, 'failed' => $failed];
    }

    private function assertFeature(User $teacher, string $key): void
    {
        if (! $this->entitlements->allows($teacher, $key)) {
            throw new ClassroomException(ClassroomException::FEATURE_UNAVAILABLE, 'Votre offre ne comprend pas cette fonctionnalité.');
        }
    }
}
