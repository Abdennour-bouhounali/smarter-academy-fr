<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\ClassSession\ClassSessionService;
use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Lesson;
use App\Models\TeacherLessonFile;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « حصّة القسم » côté enseignant (CLASS_SESSION.md) : le plan de la classe, le test d'une leçon (le défaut du dépôt et
 * la copie de l'enseignant), les séances terminées. Trois verrous comme toute route /teacher : le rôle (groupe), la
 * classe possédée (ClassroomPolicy, `manage` pour écrire), et seuls des élèves ACTIFS de la classe (service).
 * Rien ici n'écrit de preuve d'apprentissage.
 */
class TeacherClassSessionController extends Controller
{
    public function __construct(private ClassSessionService $service) {}

    public function seating(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return response()->json(['success' => true, 'seating' => $this->service->seatingOf($classroom)]);
    }

    public function updateSeating(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate([
            'cols' => 'sometimes|integer|min:1|max:12',
            'seats' => 'present|array|max:80',
            'seats.*.student' => 'required|integer',
            'seats.*.r' => 'required|integer|min:0|max:19',
            'seats.*.c' => 'required|integer|min:0|max:19',
            'seats.*.team' => 'sometimes|nullable|string|max:40',
            'teams' => 'sometimes|nullable|array|max:16',
            'teamNames' => 'sometimes|array',
            'genders' => 'sometimes|array',
        ]);

        return response()->json(['success' => true, 'seating' => $this->service->saveSeating($request->user(), $classroom, $data)]);
    }

    public function test(Request $request, string $lessonCode)
    {
        $this->lessonOrFail($lessonCode);

        return response()->json(['success' => true] + $this->service->testFor($request->user(), $lessonCode));
    }

    public function updateTest(Request $request, string $lessonCode)
    {
        $this->lessonOrFail($lessonCode);
        $data = $request->validate(['start' => 'present|array|max:20', 'end' => 'present|array|max:20']);
        try {
            return response()->json(['success' => true] + $this->service->saveTest($request->user(), $lessonCode, $data['start'], $data['end']));
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage(), 'message' => $e->getMessage()], 422);
        }
    }

    /** DELETE — « réinitialiser » : la copie disparaît, le test par défaut revient. */
    public function resetTest(Request $request, string $lessonCode)
    {
        $this->lessonOrFail($lessonCode);

        return response()->json(['success' => true] + $this->service->resetTest($request->user(), $lessonCode));
    }

    /**
     * GET /teacher/lesson-files/{lessonCode} — « ملفّ الدرس » : le document de la سبّورة de CET enseignant pour cette leçon
     * (`documentId` nul s'il ne l'a pas encore ouvert, ou s'il l'a supprimé dans le مختبر).
     */
    public function lessonFile(Request $request, string $lessonCode)
    {
        $this->lessonOrFail($lessonCode);
        $file = TeacherLessonFile::where('teacher_id', $request->user()->id)->where('lesson_code', $lessonCode)->first();

        return response()->json(['success' => true, 'file' => ['lessonCode' => $lessonCode, 'documentId' => $file?->math_lab_document_id]]);
    }

    /** PUT /teacher/lesson-files/{lessonCode} — attache SON document de la سبّورة à la leçon (jamais celui d'un autre). */
    public function saveLessonFile(Request $request, string $lessonCode)
    {
        $this->lessonOrFail($lessonCode);
        $data = $request->validate(['documentId' => ['required', 'integer', Rule::exists('math_lab_documents', 'id')->where('user_id', $request->user()->id)->where('tool', 'whiteboard')]]);
        TeacherLessonFile::updateOrCreate(['teacher_id' => $request->user()->id, 'lesson_code' => $lessonCode], ['math_lab_document_id' => $data['documentId']]);

        return response()->json(['success' => true, 'file' => ['lessonCode' => $lessonCode, 'documentId' => (int) $data['documentId']]]);
    }

    public function sessions(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $lessonCode = $request->query('lessonCode');

        return response()->json(['success' => true] + $this->service->recent($classroom, is_string($lessonCode) ? $lessonCode : null));
    }

    public function storeSession(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate([
            'uuid' => 'required|uuid',
            'lessonCode' => 'required|string|max:120',
            'moment' => ['required', Rule::in(ClassSession::MOMENTS)],
            'startedAt' => 'sometimes|nullable|integer',
            'finishedAt' => 'sometimes|nullable|integer',
            'absent' => 'sometimes|array|max:80',
            'answers' => 'required|array|min:1|max:80',
            'answers.*.questionId' => 'required|string|max:40',
            'answers.*.item' => 'sometimes|nullable|string|max:40',
            'answers.*.studentId' => 'sometimes|nullable|integer',
            'answers.*.teamId' => 'sometimes|nullable|string|max:40',
            'answers.*.correct' => 'required|boolean',
            'answers.*.pickedBy' => 'sometimes|string|max:12',
            'answers.*.ms' => 'sometimes|nullable|integer|min:0',
            'summary' => 'sometimes|array',
        ]);
        $this->lessonOrFail($data['lessonCode']);
        try {
            $session = $this->service->storeSession($request->user(), $classroom, $data);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage(), 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'session' => $this->service->present($session)], $session->wasRecentlyCreated ? 201 : 200);
    }

    private function lessonOrFail(string $lessonCode): void
    {
        abort_unless(preg_match('/^[a-z0-9][a-z0-9-]{1,118}$/', $lessonCode) === 1 && Lesson::where('code', $lessonCode)->exists(), 404);
    }
}
