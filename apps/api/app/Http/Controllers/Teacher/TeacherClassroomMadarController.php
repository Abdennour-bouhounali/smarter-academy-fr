<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\Madar\ClassMadarService;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * « مدار » d'un قسم, côté enseignant : réglages, semaine de la classe, écran
 * d'affichage. Trois verrous comme toute route /teacher : le rôle (groupe),
 * la classe possédée (ClassroomPolicy, `manage` pour écrire), et des
 * agrégats limités aux membres ACTIFS (service).
 */
class TeacherClassroomMadarController extends Controller
{
    public function __construct(private ClassMadarService $service) {}

    public function settings(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return response()->json(['success' => true] + $this->service->settings($classroom));
    }

    public function updateSettings(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate([
            'enabled' => 'sometimes|boolean',
            'disabledGames' => 'sometimes|array|max:8',
            'disabledGames.*' => 'string|max:16',
            'competitionEnabled' => 'sometimes|boolean',
            'dailyFreeHearts' => 'sometimes|integer|min:0|max:10',
            'dailyRunCap' => 'sometimes|integer|min:5|max:100',
            'lessonCodes' => 'sometimes|array|max:60',
            'lessonCodes.*' => 'string|max:120',
            'timeLimits' => 'sometimes|array|max:5',
            'timeLimits.*' => 'integer',
        ]);

        try {
            $settings = $this->service->updateSettings($request->user(), $classroom, $data);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage(), 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true] + $settings);
    }

    /** GET …/madar/items — les questions servies à la classe et leur délai. */
    public function items(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);

        return response()->json(['success' => true] + $this->service->items($classroom));
    }

    /** PUT …/madar/time-limits — {itemKey, seconds|null} : le délai d'UNE question. */
    public function timeLimit(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate(['itemKey' => 'required|string|max:255', 'seconds' => 'present|nullable|integer']);

        return $this->guard(fn () => $this->service->setItemLimit($request->user(), $classroom, $data['itemKey'], $data['seconds'] !== null ? (int) $data['seconds'] : null));
    }

    /** POST …/madar/hearts — {studentId, delta, reason, note?} : donner ou retirer des cœurs. */
    public function hearts(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate([
            'studentId' => 'required|integer',
            'delta' => 'required|integer|min:-10|max:10',
            'reason' => 'required|string|max:16',
            'note' => 'nullable|string|max:200',
        ]);

        return $this->guard(fn () => $this->service->adjustHearts($request->user(), $classroom, (int) $data['studentId'], (int) $data['delta'], $data['reason'], $data['note'] ?? null), 201);
    }

    /** PUT …/madar/students/{studentId}/games — {disabledGames: string[]} : les jeux fermés pour UN élève. */
    public function studentGames(Request $request, int $id, int $studentId)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id, 'manage');
        $data = $request->validate(['disabledGames' => 'present|array|max:8', 'disabledGames.*' => 'string|max:16']);

        return $this->guard(fn () => $this->service->setStudentGames($request->user(), $classroom, $studentId, $data['disabledGames']));
    }

    private function guard(callable $action, int $status = 200)
    {
        try {
            return response()->json(['success' => true] + $action(), $status);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage(), 'message' => $e->getMessage()], 422);
        }
    }

    public function results(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $q = $request->validate(['week' => 'nullable|date_format:Y-m-d', 'game' => 'nullable|string|max:16']);

        return response()->json(['success' => true] + $this->service->results($classroom, $q['week'] ?? null, $q['game'] ?? null));
    }

    public function display(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $q = $request->validate(['week' => 'nullable|date_format:Y-m-d', 'game' => 'nullable|string|max:16']);

        return response()->json(['success' => true] + $this->service->display($classroom, $q['week'] ?? null, $q['game'] ?? null));
    }
}
