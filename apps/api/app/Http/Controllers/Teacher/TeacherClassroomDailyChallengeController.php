<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\DailyChallenge\ClassDailyChallengeService;
use App\Http\Controllers\Controller;
use App\Models\DailyChallengeClassSetting;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « التحدّي اليومي » d'un قسم, côté enseignant : réglages, résultats d'un
 * jour, écran d'affichage. Trois verrous comme toute route /teacher : le rôle
 * (groupe), la classe possédée (ClassroomPolicy, `manage` pour écrire), et des
 * agrégats limités aux membres ACTIFS (service).
 */
class TeacherClassroomDailyChallengeController extends Controller
{
    public function __construct(private ClassDailyChallengeService $service) {}

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
            'competitionEnabled' => 'sometimes|boolean',
            'showTop3' => 'sometimes|boolean',
            'showResultsToClass' => 'sometimes|boolean',
            'questionCount' => 'sometimes|nullable|integer|min:1|max:20',
            'difficulty' => ['sometimes', 'nullable', Rule::in(DailyChallengeClassSetting::DIFFICULTIES)],
            'lessonCodes' => 'sometimes|array|max:60',
            'lessonCodes.*' => 'string|max:120',
            'learningPointCodes' => 'sometimes|array|max:200',
            'learningPointCodes.*' => 'string|max:255',
            'availableFrom' => ['sometimes', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
            'availableUntil' => ['sometimes', 'regex:/^([01]\d|2[0-3]):[0-5]\d$/'],
        ]);

        try {
            $settings = $this->service->updateSettings($request->user(), $classroom, $data);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage(), 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true] + $settings);
    }

    public function results(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $date = $request->validate(['date' => 'nullable|date_format:Y-m-d'])['date'] ?? null;

        return response()->json(['success' => true, 'dates' => $this->service->dates($classroom)] + $this->service->results($classroom, $date));
    }

    public function display(Request $request, int $id)
    {
        $classroom = TeacherClassroomController::ownedClassroom($request, $id);
        $date = $request->validate(['date' => 'nullable|date_format:Y-m-d'])['date'] ?? null;

        return response()->json(['success' => true] + $this->service->display($classroom, $date));
    }
}
