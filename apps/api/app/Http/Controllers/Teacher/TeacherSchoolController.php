<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\School\SchoolClassroomService;
use App\Domain\School\SchoolException;
use App\Domain\School\SchoolTeacherService;
use App\Domain\School\TeacherActivityFacts;
use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;

/**
 * « مؤسستي » — l'établissement, côté ENSEIGNANT (SCHOOL_ADMIN_SPACE.md §7,
 * phase 3, décision D4) : rejoindre par le lien après avoir lu ce que la
 * direction verra, lire EXACTEMENT ces faits ensuite, partir, et rattacher
 * ses classes.
 */
class TeacherSchoolController extends Controller
{
    public function __construct(
        private SchoolTeacherService $teachers,
        private SchoolClassroomService $classrooms,
    ) {}

    public function show(Request $request)
    {
        $teacher = $request->user();
        $school = SchoolTeacherService::schoolOfTeacher($teacher);

        return response()->json([
            'success' => true,
            'school' => $school ? self::schoolShape($school) : null,
            // La même fonction que celle que lit le directeur.
            'facts' => $school ? TeacherActivityFacts::for($teacher, $school) : null,
        ]);
    }

    public function preview(Request $request, string $token)
    {
        try {
            $school = $this->teachers->schoolForLink($token);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }
        $current = SchoolTeacherService::schoolOfTeacher($request->user());

        return response()->json([
            'success' => true,
            'schoolLink' => [
                ...self::schoolShape($school),
                'alreadyMember' => $current?->id === $school->id,
                'currentSchoolName' => $current !== null && $current->id !== $school->id ? $current->name : null,
            ],
        ]);
    }

    public function join(Request $request)
    {
        $data = $request->validate(['token' => ['required', 'string'], 'consent' => ['required', 'boolean']]);

        try {
            $school = $this->teachers->join($request->user(), $data['token'], (bool) $data['consent']);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, 'school' => self::schoolShape($school)]);
    }

    public function leave(Request $request)
    {
        try {
            $this->teachers->leave($request->user());
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true]);
    }

    public function attach(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate(['attached' => ['required', 'boolean']]);

        try {
            $classroom = $this->classrooms->setAttached($request->user(), $classroom, (bool) $data['attached']);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, 'schoolId' => $classroom->school_id]);
    }

    /** @return array{id: int, name: string, wilaya: ?string, commune: ?string} */
    private static function schoolShape(School $school): array
    {
        return ['id' => $school->id, 'name' => $school->name, 'wilaya' => $school->wilaya, 'commune' => $school->commune];
    }

    private static function refuse(SchoolException $e)
    {
        return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], 422);
    }
}
