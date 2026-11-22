<?php

namespace App\Domain\Admin;

use App\Domain\Classroom\ClassroomLessonService;
use App\Domain\Classroom\ClassroomProgressService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Les CLASSES vues par l'administration — en lecture. L'administration
 * consulte ; c'est l'enseignant qui règle sa classe.
 */
class ClassroomAdminService
{
    public function __construct(
        private ClassroomProgressService $progress,
        private ClassroomLessonService $lessons,
    ) {}

    /** @param array<string, mixed> $filters */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Classroom::query()
            ->with('teacher:id,first_name,last_name,email')
            ->withCount(['activeMemberships as students_count']);

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('join_code', strtoupper($search))
                ->orWhereHas('teacher', fn ($t) => $t->where('email', 'like', "%{$search}%")));
        }
        if ($status = ($filters['status'] ?? null)) {
            $query->where('status', $status);
        }
        if ($grade = ($filters['grade'] ?? null)) {
            $query->where('grade', $grade);
        }
        if ($teacher = ($filters['teacher'] ?? null)) {
            $query->where('teacher_id', (int) $teacher);
        }

        return $query->orderByDesc('id')->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function find(int $id): Classroom
    {
        $classroom = Classroom::with('teacher:id,first_name,last_name,email,account_status')->find($id);
        if ($classroom === null) {
            throw new DomainException('Classe introuvable.');
        }

        return $classroom;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function withEmails(array $rows): array
    {
        $emails = User::whereIn('id', array_column($rows, 'id'))->pluck('email', 'id');

        return array_map(fn ($row) => $row + ['email' => $emails[$row['id']] ?? null], $rows);
    }

    /** @return array<string, mixed> */
    public function detail(Classroom $classroom): array
    {
        $classroom->loadCount(['activeMemberships as students_count']);

        return [
            'classroom' => self::serialize($classroom),
            // La ligne de classe est celle de l'enseignant (sans courriel) ;
            // l'administration, elle, voit l'adresse — elle l'ajoute ici.
            'students' => $this->withEmails($this->progress->studentList($classroom)),
            'lessons' => $this->lessons->curriculumFor($classroom),
            'membershipHistory' => ClassroomMembership::where('classroom_id', $classroom->id)
                ->with('student:id,first_name,last_name,email')
                ->orderByDesc('id')->get()
                ->map(fn (ClassroomMembership $m) => [
                    'studentId' => $m->student_id,
                    'studentEmail' => $m->student?->email,
                    'status' => $m->status,
                    'joinedAt' => optional($m->joined_at)->toIso8601String(),
                    'leftAt' => optional($m->left_at)->toIso8601String(),
                    'joinedVia' => $m->joined_via,
                ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    public static function serialize(Classroom $c): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'description' => $c->description,
            'grade' => $c->grade,
            'academicYear' => $c->academic_year,
            'status' => $c->status,
            'joinCode' => $c->join_code,
            'joinCodeEnabled' => $c->join_code_enabled,
            'studentsCount' => $c->students_count ?? null,
            'teacherId' => $c->teacher_id,
            'teacher' => $c->relationLoaded('teacher') && $c->teacher ? [
                'id' => $c->teacher->id,
                'name' => trim($c->teacher->first_name.' '.$c->teacher->last_name),
                'email' => $c->teacher->email,
            ] : null,
            'archivedAt' => optional($c->archived_at)->toIso8601String(),
            'createdAt' => optional($c->created_at)->toIso8601String(),
            'updatedAt' => optional($c->updated_at)->toIso8601String(),
        ];
    }
}
