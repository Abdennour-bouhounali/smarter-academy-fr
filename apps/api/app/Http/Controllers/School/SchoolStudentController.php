<?php

namespace App\Http\Controllers\School;

use App\Domain\School\SchoolClassroomService;
use App\Domain\School\SchoolRosterService;
use App\Models\School;
use Illuminate\Http\Request;

/**
 * Les ÉLÈVES de l'établissement, côté directeur (SCHOOL_ADMIN_SPACE.md §7,
 * phase 3) : liste, import en deux temps, changement de classe, cartes.
 *
 * Les mots de passe n'existent en clair que dans les réponses de `commit` et
 * de `credentials` : `no-store`, montrés une fois, imprimés sur les cartes.
 */
class SchoolStudentController extends SchoolController
{
    public function __construct(
        private SchoolRosterService $roster,
        private SchoolClassroomService $classrooms,
    ) {}

    public function index(Request $request)
    {
        $classroomId = $request->query('classroom');

        return $this->withSchool($request, fn (School $school) => [
            'students' => $this->roster->students($school, is_numeric($classroomId) ? (int) $classroomId : null),
        ]);
    }

    public function preview(Request $request)
    {
        $data = $this->validatedRoster($request);

        return $this->withSchool($request, function (School $school) use ($data) {
            $classroom = $this->classrooms->schoolClassroom($school, (int) $data['classroomId']);

            return $this->roster->preview($school, $classroom, $data['rows']);
        });
    }

    public function commit(Request $request)
    {
        $data = $this->validatedRoster($request);

        return $this->withSchool($request, function (School $school) use ($request, $data) {
            $classroom = $this->classrooms->schoolClassroom($school, (int) $data['classroomId']);
            $cards = $this->roster->commit($request->user(), $school, $classroom, $data['rows']);

            return response()->json(['success' => true, 'cards' => $cards, 'classroomName' => $classroom->name], 201)
                ->header('Cache-Control', 'no-store');
        });
    }

    public function transfer(Request $request, int $studentId)
    {
        $data = $request->validate(['classroomId' => ['required', 'integer']]);

        return $this->withSchool($request, function (School $school) use ($request, $studentId, $data) {
            $target = $this->classrooms->schoolClassroom($school, (int) $data['classroomId']);
            $this->roster->transfer($request->user(), $school, $studentId, $target);

            return ['students' => $this->roster->students($school)];
        });
    }

    public function credentials(Request $request)
    {
        $data = $request->validate([
            'studentIds' => ['required', 'array', 'min:1', 'max:'.(int) config('school.roster_max_rows')],
            'studentIds.*' => ['integer'],
        ]);

        return $this->withSchool($request, fn (School $school) => response()->json([
            'success' => true,
            'cards' => $this->roster->reissueCredentials($request->user(), $school, $data['studentIds']),
        ])->header('Cache-Control', 'no-store'));
    }

    /** @return array{classroomId: int, rows: array<int, array<string, mixed>>} */
    private function validatedRoster(Request $request): array
    {
        return $request->validate([
            'classroomId' => ['required', 'integer'],
            'rows' => ['required', 'array', 'min:1', 'max:'.(int) config('school.roster_max_rows')],
            'rows.*.firstName' => ['nullable', 'string', 'max:100'],
            'rows.*.lastName' => ['nullable', 'string', 'max:100'],
            'rows.*.birthDate' => ['nullable', 'string', 'max:20'],
        ]);
    }
}
