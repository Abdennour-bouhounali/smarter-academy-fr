<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Classroom\TeacherPracticeResponses;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * « من أنجز هذا التمرين ؟ » — les élèves de l'enseignant qui ont fait un
 * exercice, puis les réponses de l'un d'eux. Lecture seule, derrière
 * can:teacher ; le périmètre (ses classes, membres actifs) est tenu par
 * TeacherPracticeResponses.
 */
class TeacherPracticeResponseController extends Controller
{
    public function __construct(private TeacherPracticeResponses $responses) {}

    public function index(Request $request, string $lessonCode, string $exerciseId)
    {
        return response()->json(['success' => true]
            + $this->responses->exerciseStudents($request->user(), $lessonCode, $exerciseId));
    }

    public function show(Request $request, string $lessonCode, string $exerciseId, int $studentId)
    {
        try {
            $data = $this->responses->studentResponses($request->user(), $lessonCode, $exerciseId, $studentId);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json(['success' => true] + $data);
    }
}
