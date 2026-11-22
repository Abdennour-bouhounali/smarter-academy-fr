<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomLessonService;
use App\Http\Controllers\Controller;
use App\Models\ClassroomLesson;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * La visibilité des leçons pour une classe. N'écrit JAMAIS dans `lessons`.
 */
class TeacherClassroomLessonController extends Controller
{
    public function __construct(private ClassroomLessonService $lessons) {}

    public function index(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return response()->json(['success' => true, 'curriculum' => $this->lessons->curriculumFor($classroom)]);
    }

    public function update(Request $request, int $id, int $lessonId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');

        $validated = $request->validate([
            'status' => ['required', Rule::in(ClassroomLesson::STATUSES)],
        ]);

        try {
            $result = $this->lessons->setStatus($request->user(), $classroom, $lessonId, $validated['status']);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json([
            'success' => true,
            'changed' => $result['changed'],
            'lessonId' => $lessonId,
            'classStatus' => $result['setting']->status,
        ]);
    }

    /** Le lot : même vocabulaire, même service ; 200 même si des leçons ont été refusées. */
    public function bulk(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');

        $validated = $request->validate([
            'lessonIds' => ['required', 'array', 'min:1', 'max:200'],
            'lessonIds.*' => ['required', 'integer', 'min:1'],
            'status' => ['required', Rule::in(ClassroomLesson::STATUSES)],
        ]);

        try {
            $result = $this->lessons->bulkSetStatus($request->user(), $classroom, $validated['lessonIds'], $validated['status']);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true] + $result);
    }
}
