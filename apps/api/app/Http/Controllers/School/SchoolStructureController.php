<?php

namespace App\Http\Controllers\School;

use App\Domain\School\SchoolClassroomService;
use App\Domain\School\SchoolTeacherService;
use App\Domain\School\SchoolTermService;
use App\Models\School;
use Illuminate\Http\Request;

/**
 * La STRUCTURE de l'établissement, côté directeur (SCHOOL_ADMIN_SPACE.md §7,
 * phase 3) : trimestres, enseignants (lien d'adhésion, faits, détacher),
 * classes (créer pour un enseignant, confier à un autre).
 */
class SchoolStructureController extends SchoolController
{
    public function __construct(
        private SchoolTermService $terms,
        private SchoolTeacherService $teachers,
        private SchoolClassroomService $classrooms,
    ) {}

    public function terms(Request $request)
    {
        return $this->withSchool($request, function (School $school) use ($request) {
            $year = (string) ($request->query('year') ?: $school->current_academic_year ?: '');

            return ['academicYear' => $year ?: null, 'terms' => $year ? $this->terms->list($school, $year) : []];
        });
    }

    public function updateTerms(Request $request)
    {
        $data = $request->validate([
            'academicYear' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'terms' => ['required', 'array', 'size:3'],
            'terms.*.term' => ['required', 'integer', 'between:1,3'],
            'terms.*.startsOn' => ['required', 'date_format:Y-m-d'],
            'terms.*.endsOn' => ['required', 'date_format:Y-m-d'],
        ]);

        return $this->withSchool($request, fn (School $school) => [
            'academicYear' => $data['academicYear'],
            'terms' => $this->terms->replace($request->user(), $school, $data['academicYear'], $data['terms']),
        ]);
    }

    public function teachers(Request $request)
    {
        return $this->withSchool($request, fn (School $school) => [
            // Le jeton seul : le client compose /rejoindre/muassasa/{jeton}.
            'joinLinkToken' => $school->teacher_join_token,
            'teachers' => $this->teachers->list($school),
        ]);
    }

    public function rotateTeacherLink(Request $request)
    {
        return $this->withSchool($request, fn (School $school) => [
            'joinLinkToken' => $this->teachers->rotateJoinLink($request->user(), $school)->teacher_join_token,
        ]);
    }

    public function detachTeacher(Request $request, int $teacherId)
    {
        return $this->withSchool($request, function (School $school) use ($request, $teacherId) {
            $this->teachers->detach($request->user(), $school, $teacherId);

            return ['teachers' => $this->teachers->list($school)];
        });
    }

    public function classrooms(Request $request)
    {
        return $this->withSchool($request, fn (School $school) => ['classrooms' => $this->classrooms->list($school)]);
    }

    public function createClassroom(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:100'],
            'grade' => ['required', 'string', 'max:16'],
            'academicYear' => ['sometimes', 'nullable', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'teacherId' => ['required', 'integer'],
        ]);

        return $this->withSchool($request, function (School $school) use ($request, $data) {
            $this->classrooms->create($request->user(), $school, $data);

            return response()->json(['success' => true, 'classrooms' => $this->classrooms->list($school)], 201);
        });
    }

    public function reassign(Request $request, int $id)
    {
        $data = $request->validate(['teacherId' => ['required', 'integer']]);

        return $this->withSchool($request, function (School $school) use ($request, $id, $data) {
            $this->classrooms->reassign($request->user(), $school, $id, (int) $data['teacherId']);

            return ['classrooms' => $this->classrooms->list($school)];
        });
    }
}
