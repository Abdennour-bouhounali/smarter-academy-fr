<?php

namespace App\Http\Controllers;

use App\Domain\Progress\Support\LearningProfileBuilder;
use App\Models\StudentLearningPointProgress;
use Illuminate\Http\Request;

class LearningProfileController extends Controller
{
    /**
     * The student's full learning profile: initialKnowledge (each grade's
     * completed diagnostic baseline, read-only — lesson evidence never
     * touches it) + currentMastery (the live learning-point rollup). Always
     * scoped to the token's user.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // Latest COMPLETED diagnostic per grade — the frozen baseline. An
        // in-progress session isn't a baseline yet.
        $baselines = $user->diagnosticSessions()
            ->where('status', 'completed')
            ->orderByDesc('completed_at')
            ->get()
            ->unique('grade')
            ->map(fn ($session) => [
                'grade' => $session->grade,
                'completedAt' => $session->completed_at?->toIso8601String(),
                'profile' => $session->profile_summary,
            ])
            ->values()
            ->all();

        $masteryRows = StudentLearningPointProgress::query()
            ->where('user_id', $user->id)
            ->with('learningPoint.lesson.chapter.grade')
            ->get()
            ->map(fn ($progress) => [
                'learningPointCode' => $progress->learningPoint->code,
                'learningPointTitle' => $progress->learningPoint->title,
                'lessonCode' => $progress->learningPoint->lesson->code,
                'lessonTitle' => $progress->learningPoint->lesson->title,
                'chapterCode' => $progress->learningPoint->lesson->chapter->code,
                'gradeCode' => $progress->learningPoint->lesson->chapter->grade->code,
                'status' => $progress->status,
                'confidence' => (float) $progress->confidence,
                'attempts' => $progress->attempts,
                'correctCount' => $progress->correct_count,
                'lastEvidenceAt' => $progress->last_evidence_at?->toIso8601String(),
                'diagnosticSkillId' => $progress->learningPoint->diagnostic_skill_id,
            ])
            ->all();

        return response()->json([
            'success' => true,
            'profile' => LearningProfileBuilder::build($baselines, $masteryRows),
        ]);
    }
}
