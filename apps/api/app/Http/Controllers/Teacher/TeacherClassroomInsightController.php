<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\ClassroomInsightService;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * GET /teacher/classrooms/{id}/attention — « تستحقّ نظرة » et « ما الذي
 * تغيّر؟ » : les signaux de la classe et les mouvements récents, calculés à la
 * lecture depuis l'état canonique (ClassroomInsightService). Rien n'est
 * stocké : un signal disparaît quand les faits qui le portent changent.
 */
class TeacherClassroomInsightController extends Controller
{
    public function __construct(private ClassroomInsightService $insights) {}

    public function attention(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        try {
            $attention = $this->insights->attention($classroom);
        } catch (DomainException $e) {
            return TeacherClassroomController::refuse($e);
        }

        return response()->json(['success' => true, ...$attention]);
    }
}
