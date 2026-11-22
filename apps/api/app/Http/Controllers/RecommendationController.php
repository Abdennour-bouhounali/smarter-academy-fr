<?php

namespace App\Http\Controllers;

use App\Domain\Progress\Recommendation\RecommendationService;
use App\Models\Lesson;
use Illuminate\Http\Request;

/**
 * Les recommandations d'une leçon pour l'élève du jeton — dérivées de l'état
 * canonique par RecommendationService. Rien n'est stocké, rien ne bloque.
 */
class RecommendationController extends Controller
{
    public function show(Request $request, string $lessonCode, RecommendationService $recommendations)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'lesson' => ['code' => $lesson->code, 'title' => $lesson->title],
            'recommendations' => $recommendations->forLesson($request->user()->id, $lesson),
        ]);
    }
}
