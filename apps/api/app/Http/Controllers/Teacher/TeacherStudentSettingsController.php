<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomAccess;
use App\Domain\Settings\StudentSettingsService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Les réglages d'UN élève, décidés par son enseignant (2026-10-06) — l'élève
 * est résolu PAR la classe possédée et doit en être membre actif, comme dans
 * tout le dossier élève (TeacherClassroomStudentController).
 */
class TeacherStudentSettingsController extends Controller
{
    public function __construct(private StudentSettingsService $settings) {}

    public function show(Request $request, int $id, int $studentId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $student = ClassroomAccess::activeStudent($classroom, $studentId);

        return response()->json(['success' => true, 'settings' => $this->settings->read($student)]);
    }

    public function update(Request $request, int $id, int $studentId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $student = ClassroomAccess::activeStudent($classroom, $studentId);
        $validated = $request->validate([
            'practiceLevelsOpen' => 'sometimes|boolean',
            'practiceValidation' => 'sometimes|string|in:'.implode(',', StudentSettingsService::VALIDATIONS),
        ]);

        return response()->json([
            'success' => true,
            'settings' => $this->settings->updateByTeacher($request->user(), $student, $validated),
        ]);
    }
}
