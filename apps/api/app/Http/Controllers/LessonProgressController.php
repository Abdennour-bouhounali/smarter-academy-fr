<?php

namespace App\Http\Controllers;

use App\Domain\Progress\LessonProgressService;
use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LessonProgressController extends Controller
{
    public function __construct(private LessonProgressService $service) {}

    /**
     * All lesson-progress rows for the token's user, keyed by lesson code —
     * hydrates the dashboard and the resume-lesson computation on login.
     */
    public function index(Request $request)
    {
        return response()->json([
            'progress' => $this->service->forUser($request->user()),
        ]);
    }

    /**
     * Idempotent progress upsert. The response is the merged row and the
     * client adopts it as truth (the server's union/latest-wins merge may
     * know more than the submitting device does).
     */
    public function upsert(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->first();
        if ($lesson === null) {
            abort(404);
        }

        $validated = $request->validate([
            'completedModules' => 'present|array|max:32',
            'completedModules.*' => 'string|max:64',
            'currentModule' => 'nullable|integer|min:0|max:99',
            'status' => ['required', Rule::in([
                StudentLessonProgress::STATUS_IN_PROGRESS,
                StudentLessonProgress::STATUS_COMPLETED,
            ])],
            'lastActivityAt' => 'required|date',
            'completionMode' => ['nullable', Rule::in([
                StudentLessonProgress::COMPLETION_MODE_PATH,
                StudentLessonProgress::COMPLETION_MODE_MASTERY,
            ])],
        ]);

        $row = $this->service->upsert($request->user(), $lesson, [
            'completedModules' => $validated['completedModules'],
            'currentModule' => $validated['currentModule'] ?? null,
            'status' => $validated['status'],
            'lastActivityAt' => $validated['lastActivityAt'],
            'completionMode' => $validated['completionMode'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'progress' => LessonProgressService::serialize($row),
        ]);
    }
}
